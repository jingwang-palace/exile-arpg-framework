import Phaser from 'phaser';
import { BaseAttributes, DerivedAttributes, ResistanceAttributes } from '../../types/character';

export default class StatsWindow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private playerStats: any;
  private playerHealth: number;
  private playerMaxHealth: number;
  private playerGold: number;
  
  // 工具提示相关
  private tooltip: Phaser.GameObjects.Container | null = null;
  private tooltipBg: Phaser.GameObjects.Graphics | null = null;
  private tooltipText: Phaser.GameObjects.Text | null = null;
  private tooltipTimer: Phaser.Time.TimerEvent | null = null;
  
  // 属性变化追踪
  private previousStats: any = {};
  private statValueRefs: Map<string, Phaser.GameObjects.Text> = new Map();
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    // 创建容器并设置为固定位置（相对于相机）
    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0); // 确保UI不随相机移动
    this.container.setVisible(false);
    
    // 初始化统计数据
    this.playerStats = {
      baseAttributes: {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        vitality: 10
      },
      derivedAttributes: {
        maxHealth: 100,
        currentHealth: 100,
        maxMana: 50,
        currentMana: 50,
        maxEnergy: 0,
        currentEnergy: 0,
        physicalDamage: 10,
        elementalDamage: 0,
        chaosDamage: 0,
        attackSpeed: 1.0,
        castSpeed: 1.0,
        criticalChance: 5,
        criticalMultiplier: 150,
        armor: 5,
        evasion: 0,
        energyShield: 0,
        blockChance: 0,
        movementSpeed: 100,
        lifeRegeneration: 1,
        manaRegeneration: 0.5
      },
      resistances: {
        fireResistance: 0,
        coldResistance: 0,
        lightningResistance: 0,
        chaosResistance: 0
      },
      level: 1,
      experience: 0,
      nextLevelExp: 100,
      availableAttributePoints: 0,
      allocatedTalentPoints: 0,
      availableTalentPoints: 0
    };
    
    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    this.playerGold = 0;
    
    this.createWindow();
    
    // 启动鼠标跟踪更新tooltip位置
    this.startTooltipTracking();
  }
  
  private createWindow() {
    // 创建背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(-400, -350, 800, 700);
    bg.lineStyle(3, 0x3498db, 0.8);
    bg.strokeRect(-400, -350, 800, 700);
    this.container.add(bg);
    
    // 标题
    const title = this.scene.add.text(0, -320, '角色属性', {
      fontSize: '28px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.container.add(title);
    
    // 添加关闭按钮
    const closeBtn = this.scene.add.text(370, -330, '✕', {
      fontSize: '24px',
      color: '#e74c3c'
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.setVisible(false));
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff6b6b'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#e74c3c'));
    this.container.add(closeBtn);
    
    // 创建属性布局
    this.createStatsLayout();
  }
  
  private createStatsLayout() {
    // 基础信息区域
    this.createBasicInfoSection();
    
    // 基础属性区域
    this.createBaseAttributesSection();
    
    // 战斗属性区域
    this.createCombatStatsSection();
    
    // 抗性区域
    this.createResistancesSection();
  }
  
  // 创建基础信息区域
  private createBasicInfoSection() {
    const startY = -280;
    
    // 区域标题
    const title = this.scene.add.text(-380, startY, '基础信息', {
      fontSize: '20px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.container.add(title);
    
    // 等级
    this.createStatItem(-380, startY + 30, '等级', () => this.playerStats.level.toString(), 
      '角色当前等级\n影响属性点分配和装备需求');
    
    // 经验值
    this.createStatItem(-180, startY + 30, '经验值', 
      () => `${this.playerStats.experience}/${this.playerStats.nextLevelExp}`, 
      '当前经验值/升级所需经验值\n达到要求时自动升级');
    
    // 生命值
    this.createStatItem(-380, startY + 60, '生命值', 
      () => `${this.playerHealth}/${this.playerMaxHealth}`, 
      '当前生命值/最大生命值\n生命值为0时角色死亡');
    
    // 魔力值
    this.createStatItem(-180, startY + 60, '魔力值', 
      () => `${this.playerStats.derivedAttributes?.currentMana || 0}/${this.playerStats.derivedAttributes?.maxMana || 50}`, 
      '当前魔力值/最大魔力值\n用于释放技能');
    
    // 金币
    this.createStatItem(-380, startY + 90, '金币', () => this.playerGold.toString(), 
      '拥有的金币数量\n用于购买装备和物品');
    
    // 可用属性点
    this.createStatItem(-180, startY + 90, '属性点', 
      () => this.playerStats.availableAttributePoints?.toString() || '0', 
      '可分配的属性点数\n每级获得1个属性点\n用于提升基础属性');
    
    // 天赋点信息
    this.createStatItem(20, startY + 90, '天赋点', 
      () => `${this.playerStats.availableTalentPoints || 0}/${this.playerStats.allocatedTalentPoints || 0}`, 
      '可用天赋点/已分配天赋点\n用于解锁天赋技能\n通过任务和成就获得');
  }
  
  // 创建基础属性区域
  private createBaseAttributesSection() {
    const startY = -150;
    
    // 区域标题
    const title = this.scene.add.text(-380, startY, '基础属性', {
      fontSize: '20px',
      color: '#e74c3c',
      fontStyle: 'bold'
    });
    this.container.add(title);
    
    // 分隔线
    const divider = this.scene.add.graphics();
    divider.lineStyle(2, 0xe74c3c, 0.5);
    divider.lineBetween(-380, startY + 25, 380, startY + 25);
    this.container.add(divider);
    
    // 力量
    this.createStatItem(-380, startY + 40, '力量', 
      () => (this.playerStats.baseAttributes?.strength || this.playerStats.strength || 0).toString(), 
      '力量属性\n• 每点增加 1.0 点物理伤害\n• 每点增加 0.5 点护甲\n• 影响近战武器装备需求\n\n计算公式:\n物理伤害 = 基础伤害 + (力量 × 1.0)\n护甲 = 基础护甲 + (力量 × 0.5)');
    
    // 敏捷
    this.createStatItem(-180, startY + 40, '敏捷', 
      () => (this.playerStats.baseAttributes?.dexterity || this.playerStats.dexterity || 0).toString(), 
      '敏捷属性\n• 每点增加 0.2% 暴击几率\n• 每点增加 0.3% 闪避几率\n• 每点增加 0.05 攻击速度\n• 影响弓箭武器装备需求\n\n计算公式:\n暴击几率 = 基础暴击 + (敏捷 × 0.2%)\n闪避率 = (敏捷 × 0.3%)\n攻击速度 = 基础速度 + (敏捷 × 0.05)');
    
    // 智力
    this.createStatItem(20, startY + 40, '智力', 
      () => (this.playerStats.baseAttributes?.intelligence || this.playerStats.intelligence || 0).toString(), 
      '智力属性\n• 每点增加 2.0 点最大魔力\n• 每点增加 0.4% 魔法伤害\n• 每点增加 0.2% 能量护盾\n• 影响法术装备需求\n\n计算公式:\n最大魔力 = 基础魔力 + (智力 × 2.0)\n魔法伤害加成 = (智力 × 0.4%)\n能量护盾 = 基础护盾 + (智力 × 0.2%)');
    
    // 体力
    this.createStatItem(220, startY + 40, '体力', 
      () => (this.playerStats.baseAttributes?.vitality || this.playerStats.vitality || 0).toString(), 
      '体力属性\n• 每点增加 8 点最大生命值\n• 每点增加 0.1 点生命恢复\n• 增加抗性效果\n\n计算公式:\n最大生命值 = 基础生命 + (体力 × 8.0)\n生命恢复 = 基础恢复 + (体力 × 0.1)\n抗性加成 = (体力 × 0.05%)');
  }
  
  // 创建战斗属性区域
  private createCombatStatsSection() {
    const startY = -40;
    
    // 区域标题
    const title = this.scene.add.text(-380, startY, '战斗属性', {
      fontSize: '20px',
      color: '#8e44ad',
      fontStyle: 'bold'
    });
    this.container.add(title);
    
    // 分隔线
    const divider = this.scene.add.graphics();
    divider.lineStyle(2, 0x8e44ad, 0.5);
    divider.lineBetween(-380, startY + 25, 380, startY + 25);
    this.container.add(divider);
    
    // 物理伤害
    this.createStatItem(-380, startY + 40, '物理伤害', 
      () => (this.playerStats.derivedAttributes?.physicalDamage || this.playerStats.damage || "10-15").toString(), 
      '物理伤害范围\n受力量属性和武器影响\n对敌人造成物理伤害');
    
    // 攻击速度
    this.createStatItem(-180, startY + 40, '攻击速度', 
      () => (this.playerStats.derivedAttributes?.attackSpeed || this.playerStats.attackSpeed || 1.0).toFixed(2), 
      '每秒攻击次数\n受敏捷属性和装备影响\n数值越高攻击越快');
    
    // 暴击几率
    this.createStatItem(20, startY + 40, '暴击几率', 
      () => `${this.playerStats.derivedAttributes?.criticalChance || this.playerStats.critChance || 5}%`, 
      '造成暴击的概率\n受敏捷属性和装备影响\n暴击时造成额外伤害');
    
    // 暴击伤害
    this.createStatItem(220, startY + 40, '暴击伤害', 
      () => `${this.playerStats.derivedAttributes?.criticalMultiplier || this.playerStats.critDamage || 150}%`, 
      '暴击时的伤害倍数\n基础为150%\n受装备和技能影响');
    
    // 护甲
    this.createStatItem(-380, startY + 80, '护甲', 
      () => (this.playerStats.derivedAttributes?.armor || this.playerStats.armor || 0).toString(), 
      '物理防御力\n减少受到的物理伤害\n受力量属性和装备影响');
    
    // 闪避
    this.createStatItem(-180, startY + 80, '闪避', 
      () => `${this.playerStats.derivedAttributes?.evasion || this.playerStats.dodgeChance || 0}%`, 
      '完全避免攻击的概率\n受敏捷属性和装备影响\n闪避的攻击不造成伤害');
    
    // 移动速度
    this.createStatItem(20, startY + 80, '移动速度', 
      () => `${this.playerStats.derivedAttributes?.movementSpeed || 100}%`, 
      '角色移动速度\n基础为100%\n受装备和技能影响');
    
    // 生命恢复
    this.createStatItem(220, startY + 80, '生命恢复', 
      () => `${this.playerStats.derivedAttributes?.lifeRegeneration || 1}/秒`, 
      '每秒恢复的生命值\n受体力属性和装备影响\n持续恢复生命值');
  }
  
  // 创建抗性区域
  private createResistancesSection() {
    const startY = 130;
    
    // 区域标题
    const title = this.scene.add.text(-380, startY, '元素抗性', {
      fontSize: '20px',
      color: '#27ae60',
      fontStyle: 'bold'
    });
    this.container.add(title);
    
    // 分隔线
    const divider = this.scene.add.graphics();
    divider.lineStyle(2, 0x27ae60, 0.5);
    divider.lineBetween(-380, startY + 25, 380, startY + 25);
    this.container.add(divider);
    
    // 火焰抗性
    this.createStatItem(-380, startY + 40, '火焰抗性', 
      () => `${this.playerStats.resistances?.fireResistance || 0}%`, 
      '火焰伤害抗性\n减少受到的火焰伤害\n最高75%');
    
    // 冰霜抗性
    this.createStatItem(-180, startY + 40, '冰霜抗性', 
      () => `${this.playerStats.resistances?.coldResistance || 0}%`, 
      '冰霜伤害抗性\n减少受到的冰霜伤害\n同时抵抗冰冻效果');
    
    // 闪电抗性
    this.createStatItem(20, startY + 40, '闪电抗性', 
      () => `${this.playerStats.resistances?.lightningResistance || 0}%`, 
      '闪电伤害抗性\n减少受到的闪电伤害\n同时抵抗电击效果');
    
    // 混沌抗性
    this.createStatItem(220, startY + 40, '混沌抗性', 
      () => `${this.playerStats.resistances?.chaosResistance || 0}%`, 
      '混沌伤害抗性\n减少受到的混沌伤害\n混沌伤害无视能量护盾');
  }
  
  // 创建单个属性项目
  private createStatItem(x: number, y: number, label: string, getValue: () => string, tooltipText: string) {
    // 创建背景区域用于交互
    const hitArea = this.scene.add.graphics();
    hitArea.fillStyle(0x2c3e50, 0.3);
    hitArea.fillRect(x, y, 180, 25);
    hitArea.setInteractive(new Phaser.Geom.Rectangle(x, y, 180, 25), Phaser.Geom.Rectangle.Contains);
    this.container.add(hitArea);
    
    // 属性标签
    const labelText = this.scene.add.text(x + 5, y + 5, label + ':', {
      fontSize: '16px',
      color: '#bdc3c7',
      fontStyle: 'normal'
    });
    this.container.add(labelText);
    
    // 属性值
    const valueText = this.scene.add.text(x + 100, y + 5, getValue(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.container.add(valueText);
    
    // 保存引用以便更新和颜色变化
    const statKey = `${x}-${y}-${label}`;
    this.statValueRefs.set(statKey, valueText);
    (valueText as any).updateValue = getValue;
    (valueText as any).statKey = statKey;
    (valueText as any).previousValue = getValue();
    
    // 添加悬停效果
    hitArea.on('pointerover', () => {
      hitArea.clear();
      hitArea.fillStyle(0x34495e, 0.5);
      hitArea.fillRect(x, y, 180, 25);
      this.showTooltip(tooltipText);
    });
    
    hitArea.on('pointerout', () => {
      hitArea.clear();
      hitArea.fillStyle(0x2c3e50, 0.3);
      hitArea.fillRect(x, y, 180, 25);
      this.hideTooltip();
    });
    
    // 添加点击高亮效果
    hitArea.on('pointerdown', () => {
      hitArea.clear();
      hitArea.fillStyle(0x3498db, 0.6);
      hitArea.fillRect(x, y, 180, 25);
      
      // 短暂高亮后恢复
      this.scene.time.delayedCall(150, () => {
        hitArea.clear();
        hitArea.fillStyle(0x34495e, 0.5);
        hitArea.fillRect(x, y, 180, 25);
      });
    });
  }
  
  // 显示工具提示
  private showTooltip(text: string) {
    if (this.tooltip) {
      this.hideTooltip();
    }
    
    // 创建tooltip容器
    this.tooltip = this.scene.add.container(0, 0);
    this.tooltip.setDepth(10000);
    
    // 创建tooltip文本
    this.tooltipText = this.scene.add.text(0, 0, text, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#2c3e50',
      padding: { x: 12, y: 8 },
      lineSpacing: 4,
      wordWrap: { width: 350 }
    });
    this.tooltipText.setOrigin(0);
    
    // 创建tooltip背景边框
    const bounds = this.tooltipText.getBounds();
    this.tooltipBg = this.scene.add.graphics();
    this.tooltipBg.lineStyle(2, 0x3498db, 0.8);
    this.tooltipBg.fillStyle(0x2c3e50, 0.95);
    this.tooltipBg.fillRect(-4, -4, bounds.width + 8, bounds.height + 8);
    this.tooltipBg.strokeRect(-4, -4, bounds.width + 8, bounds.height + 8);
    
    this.tooltip.add([this.tooltipBg, this.tooltipText]);
    
    // 设置初始位置
    this.updateTooltipPosition();
    this.tooltip.setScrollFactor(0);
    
    // 添加到场景而不是容器，确保在最上层
    this.scene.add.existing(this.tooltip);
  }
  
  // 更新tooltip位置
  private updateTooltipPosition() {
    if (!this.tooltip || !this.tooltipText) return;
    
    const pointer = this.scene.input.activePointer;
    const bounds = this.tooltipText.getBounds();
    let tooltipX = pointer.x + 15;
    let tooltipY = pointer.y - bounds.height - 15;
    
    // 防止tooltip超出屏幕
    if (tooltipX + bounds.width > this.scene.cameras.main.width) {
      tooltipX = pointer.x - bounds.width - 15;
    }
    if (tooltipY < 0) {
      tooltipY = pointer.y + 15;
    }
    
    this.tooltip.setPosition(tooltipX, tooltipY);
  }
  
  // 启动tooltip跟踪
  private startTooltipTracking() {
    // 创建定时器来更新tooltip位置
    this.scene.input.on('pointermove', () => {
      if (this.tooltip && this.tooltip.visible) {
        this.updateTooltipPosition();
      }
    });
  }
  
  // 隐藏工具提示
  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
      this.tooltipBg = null;
      this.tooltipText = null;
    }
  }
  
  // 更新所有属性值并添加颜色变化反馈
  private updateAllStats() {
    // 遍历容器中的所有对象，更新有updateValue方法的文本
    this.statValueRefs.forEach((textObj, statKey) => {
      const newValue = (textObj as any).updateValue();
      const previousValue = (textObj as any).previousValue;
      
      // 更新文本
      textObj.setText(newValue);
      
      // 检查值是否改变并添加颜色反馈
      if (newValue !== previousValue) {
        const numericNew = parseFloat(newValue.replace(/[^\d.-]/g, ''));
        const numericPrev = parseFloat(previousValue.replace(/[^\d.-]/g, ''));
        
        if (!isNaN(numericNew) && !isNaN(numericPrev)) {
          if (numericNew > numericPrev) {
            // 值增加 - 绿色闪烁
            textObj.setColor('#27ae60');
            this.scene.add.tween({
              targets: textObj,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 200,
              yoyo: true,
              onComplete: () => {
                textObj.setColor('#ffffff');
              }
            });
          } else if (numericNew < numericPrev) {
            // 值减少 - 红色闪烁
            textObj.setColor('#e74c3c');
            this.scene.add.tween({
              targets: textObj,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 200,
              yoyo: true,
              onComplete: () => {
                textObj.setColor('#ffffff');
              }
            });
          }
        }
        
        // 更新记录的之前值
        (textObj as any).previousValue = newValue;
      }
    });
  }
  
  setStats(stats: any) {
    this.playerStats = stats;
    
    // 如果传入的是旧格式的属性，转换为新格式
    if (!stats.baseAttributes && (stats.strength || stats.dexterity)) {
      this.playerStats = {
        baseAttributes: {
          strength: stats.strength || 10,
          dexterity: stats.dexterity || 10,
          intelligence: stats.intelligence || 10,
          vitality: stats.vitality || 10
        },
        derivedAttributes: {
          maxHealth: this.playerMaxHealth,
          currentHealth: this.playerHealth,
          maxMana: 50,
          currentMana: 50,
          maxEnergy: 0,
          currentEnergy: 0,
          physicalDamage: stats.damage || "10-15",
          elementalDamage: 0,
          chaosDamage: 0,
          attackSpeed: stats.attackSpeed || 1.0,
          castSpeed: 1.0,
          criticalChance: stats.critChance || 5,
          criticalMultiplier: stats.critDamage || 150,
          armor: stats.armor || 5,
          evasion: stats.dodgeChance || 0,
          energyShield: 0,
          blockChance: 0,
          movementSpeed: 100,
          lifeRegeneration: 1,
          manaRegeneration: 0.5
        },
        resistances: {
          fireResistance: 0,
          coldResistance: 0,
          lightningResistance: 0,
          chaosResistance: 0
        },
        level: stats.level || 1,
        experience: stats.experience || 0,
        nextLevelExp: stats.nextLevelExp || 100
      };
    }
    
    this.updateAllStats();
  }
  
  setHealth(current: number, max: number) {
    this.playerHealth = current;
    this.playerMaxHealth = max;
    
    if (this.playerStats.derivedAttributes) {
      this.playerStats.derivedAttributes.currentHealth = current;
      this.playerStats.derivedAttributes.maxHealth = max;
    }
    
    this.updateAllStats();
  }
  
  setGold(gold: number) {
    this.playerGold = gold;
    this.updateAllStats();
  }
  
  setVisible(visible: boolean) {
    this.container.setVisible(visible);
    if (!visible) {
      this.hideTooltip(); // 隐藏窗口时也隐藏tooltip
    }
  }
  
  isVisible(): boolean {
    return this.container.visible;
  }
  
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
  
  // 销毁时清理资源
  destroy() {
    this.hideTooltip();
    if (this.tooltipTimer) {
      this.tooltipTimer.destroy();
      this.tooltipTimer = null;
    }
    this.statValueRefs.clear();
    this.container.destroy();
  }
} 