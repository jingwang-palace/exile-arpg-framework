import Phaser from 'phaser';
import { EventEmitter } from '../../utils/EventEmitter';

// 技能攻击形状枚举
export enum AttackShape {
  MELEE_CIRCLE = 'melee_circle',     // 近战圆形
  CLEAVE_ARC = 'cleave_arc',         // 劈砍扇形
  THRUST_LINE = 'thrust_line',       // 突刺直线
  SLAM_AREA = 'slam_area',           // 重击区域
  CHAIN_TARGET = 'chain_target'      // 连锁目标
}

// 自动攻击配置
export interface AutoAttackConfig {
  skillId: string;
  shape: AttackShape;
  range: number;              // 攻击范围
  width?: number;            // 宽度（用于扇形、直线攻击）
  damage: number;            // 伤害值
  cooldown: number;          // 冷却时间（毫秒）
  manaCost: number;          // 魔力消耗
  enabled: boolean;          // 是否启用自动攻击
  priority: number;          // 优先级（数值越高优先级越高）
  description: string;       // 技能描述
}

// 攻击范围可视化配置
export interface AttackVisualization {
  showRange: boolean;        // 是否显示攻击范围
  rangeColor: number;        // 范围颜色
  rangeAlpha: number;        // 范围透明度
  showPreview: boolean;      // 是否显示攻击预览
}

export class AutoAttackSystem extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private enemies: Phaser.Physics.Arcade.Group;
  
  // 攻击配置
  private attackConfigs: Map<string, AutoAttackConfig> = new Map();
  private currentActiveSkill: string | null = null;
  
  // 攻击状态
  private lastAttackTime: number = 0;
  private isAttacking: boolean = false;
  private targetAcquisitionRange: number = 300; // 目标搜索范围
  
  // 可视化
  private rangeGraphics: Phaser.GameObjects.Graphics | null = null;
  private visualization: AttackVisualization = {
    showRange: true,
    rangeColor: 0xff0000,
    rangeAlpha: 0.2,
    showPreview: true
  };
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, enemies: Phaser.Physics.Arcade.Group) {
    super();
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    
    this.initializeDefaultSkills();
    this.createRangeGraphics();
  }
  
  // 初始化默认技能配置
  private initializeDefaultSkills(): void {
    // 重击 - 圆形范围攻击
    this.attackConfigs.set('heavy_strike', {
      skillId: 'heavy_strike',
      shape: AttackShape.MELEE_CIRCLE,
      range: 80,
      damage: 25,
      cooldown: 1200,
      manaCost: 5,
      enabled: false,
      priority: 3,
      description: '重击：造成高额伤害的圆形攻击'
    });
    
    // 劈砍 - 扇形攻击
    this.attackConfigs.set('cleave', {
      skillId: 'cleave',
      shape: AttackShape.CLEAVE_ARC,
      range: 100,
      width: Math.PI / 3, // 60度扇形
      damage: 18,
      cooldown: 800,
      manaCost: 3,
      enabled: false,
      priority: 2,
      description: '劈砍：前方扇形范围攻击，可命中多个敌人'
    });
    
    // 突刺 - 直线攻击
    this.attackConfigs.set('thrust', {
      skillId: 'thrust',
      shape: AttackShape.THRUST_LINE,
      range: 120,
      width: 30,
      damage: 20,
      cooldown: 600,
      manaCost: 2,
      enabled: false,
      priority: 1,
      description: '突刺：直线穿透攻击，射程较远'
    });
    
    // 震地重击 - 大范围攻击
    this.attackConfigs.set('ground_slam', {
      skillId: 'ground_slam',
      shape: AttackShape.SLAM_AREA,
      range: 150,
      damage: 35,
      cooldown: 2000,
      manaCost: 10,
      enabled: false,
      priority: 4,
      description: '震地重击：大范围AOE攻击，伤害极高'
    });
  }
  
  // 创建范围显示图形
  private createRangeGraphics(): void {
    this.rangeGraphics = this.scene.add.graphics();
    this.rangeGraphics.setDepth(1);
  }
  
  // 设置当前激活技能
  public setActiveSkill(skillId: string): boolean {
    const config = this.attackConfigs.get(skillId);
    if (!config) {
      console.warn(`技能 ${skillId} 不存在`);
      return false;
    }
    
    // 禁用之前的技能
    if (this.currentActiveSkill) {
      const prevConfig = this.attackConfigs.get(this.currentActiveSkill);
      if (prevConfig) {
        prevConfig.enabled = false;
      }
    }
    
    // 启用新技能
    config.enabled = true;
    this.currentActiveSkill = skillId;
    
    this.emit('skillChanged', skillId, config);
    this.updateRangeDisplay();
    
    return true;
  }
  
  // 获取当前激活技能
  public getActiveSkill(): AutoAttackConfig | null {
    if (!this.currentActiveSkill) return null;
    return this.attackConfigs.get(this.currentActiveSkill) || null;
  }
  
  // 获取所有技能配置
  public getAllSkills(): Map<string, AutoAttackConfig> {
    return this.attackConfigs;
  }
  
  // 添加或更新技能配置
  public setSkillConfig(skillId: string, config: AutoAttackConfig): void {
    this.attackConfigs.set(skillId, config);
    this.emit('skillConfigUpdated', skillId, config);
  }
  
  // 更新自动攻击逻辑
  public update(): void {
    if (!this.currentActiveSkill) return;
    
    const config = this.attackConfigs.get(this.currentActiveSkill);
    if (!config || !config.enabled) return;
    
    const currentTime = Date.now();
    
    // 检查冷却时间
    if (currentTime - this.lastAttackTime < config.cooldown) return;
    
    // 检查是否在攻击动画中
    if (this.isAttacking) return;
    
    // 寻找目标
    const targets = this.findTargetsInRange(config);
    if (targets.length === 0) return;
    
    // 检查魔力
    const playerStats = (this.player as any).stats;
    if (playerStats && playerStats.currentMana < config.manaCost) return;
    
    // 执行攻击
    this.executeAttack(config, targets);
  }
  
  // 寻找攻击范围内的目标
  private findTargetsInRange(config: AutoAttackConfig): Phaser.Physics.Arcade.Sprite[] {
    const targets: Phaser.Physics.Arcade.Sprite[] = [];
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    this.enemies.children.getArray().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (!enemySprite.active) return;
      
      const distance = Phaser.Math.Distance.Between(playerX, playerY, enemySprite.x, enemySprite.y);
      
      // 首先检查是否在最大搜索范围内
      if (distance > this.targetAcquisitionRange) return;
      
      // 根据技能形状判断是否在攻击范围内
      if (this.isTargetInAttackRange(config, enemySprite)) {
        targets.push(enemySprite);
      }
    });
    
    return targets;
  }
  
  // 判断目标是否在攻击范围内
  private isTargetInAttackRange(config: AutoAttackConfig, target: Phaser.Physics.Arcade.Sprite): boolean {
    const playerX = this.player.x;
    const playerY = this.player.y;
    const targetX = target.x;
    const targetY = target.y;
    
    switch (config.shape) {
      case AttackShape.MELEE_CIRCLE:
      case AttackShape.SLAM_AREA:
        const distance = Phaser.Math.Distance.Between(playerX, playerY, targetX, targetY);
        return distance <= config.range;
        
      case AttackShape.CLEAVE_ARC:
        return this.isTargetInArc(playerX, playerY, targetX, targetY, config.range, config.width || Math.PI / 3);
        
      case AttackShape.THRUST_LINE:
        return this.isTargetInLine(playerX, playerY, targetX, targetY, config.range, config.width || 30);
        
      default:
        return false;
    }
  }
  
  // 检查目标是否在扇形范围内
  private isTargetInArc(
    playerX: number, playerY: number,
    targetX: number, targetY: number,
    range: number, arcAngle: number
  ): boolean {
    const distance = Phaser.Math.Distance.Between(playerX, playerY, targetX, targetY);
    if (distance > range) return false;
    
    // 获取玩家面向角度（基于移动方向或鼠标位置）
    const playerFacing = this.getPlayerFacingAngle();
    const targetAngle = Phaser.Math.Angle.Between(playerX, playerY, targetX, targetY);
    
    const angleDiff = Math.abs(Phaser.Math.Angle.ShortestBetween(playerFacing, targetAngle));
    return angleDiff <= arcAngle / 2;
  }
  
  // 检查目标是否在直线范围内
  private isTargetInLine(
    playerX: number, playerY: number,
    targetX: number, targetY: number,
    range: number, width: number
  ): boolean {
    const distance = Phaser.Math.Distance.Between(playerX, playerY, targetX, targetY);
    if (distance > range) return false;
    
    const playerFacing = this.getPlayerFacingAngle();
    const targetAngle = Phaser.Math.Angle.Between(playerX, playerY, targetX, targetY);
    
    // 计算目标到射线的垂直距离
    const angleDiff = Math.abs(Phaser.Math.Angle.ShortestBetween(playerFacing, targetAngle));
    const perpendicularDistance = distance * Math.sin(angleDiff);
    
    return perpendicularDistance <= width / 2;
  }
  
  // 获取玩家面向角度
  private getPlayerFacingAngle(): number {
    // 优先使用移动方向
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      return Math.atan2(body.velocity.y, body.velocity.x);
    }
    
    // 如果没有移动，使用鼠标指向
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    return Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
  }
  
  // 执行攻击
  private executeAttack(config: AutoAttackConfig, targets: Phaser.Physics.Arcade.Sprite[]): void {
    this.isAttacking = true;
    this.lastAttackTime = Date.now();
    
    // 消耗魔力
    const playerStats = (this.player as any).stats;
    if (playerStats) {
      playerStats.currentMana = Math.max(0, playerStats.currentMana - config.manaCost);
    }
    
    // 创建攻击效果
    this.createAttackEffect(config);
    
    // 对所有目标造成伤害
    targets.forEach(target => {
      this.dealDamageToTarget(target, config.damage);
    });
    
    // 发出攻击事件
    this.emit('attackExecuted', config, targets);
    
    // 重置攻击状态
    this.scene.time.delayedCall(200, () => {
      this.isAttacking = false;
    });
  }
  
  // 创建攻击视觉效果
  private createAttackEffect(config: AutoAttackConfig): void {
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    // 创建临时图形用于显示攻击效果
    const effectGraphics = this.scene.add.graphics();
    effectGraphics.setDepth(2);
    
    switch (config.shape) {
      case AttackShape.MELEE_CIRCLE:
      case AttackShape.SLAM_AREA:
        effectGraphics.fillStyle(0xff4444, 0.6);
        effectGraphics.fillCircle(playerX, playerY, config.range);
        break;
        
      case AttackShape.CLEAVE_ARC:
        const facing = this.getPlayerFacingAngle();
        const arcWidth = config.width || Math.PI / 3;
        effectGraphics.fillStyle(0xff4444, 0.6);
        effectGraphics.slice(playerX, playerY, config.range, facing - arcWidth/2, facing + arcWidth/2);
        effectGraphics.fillPath();
        break;
        
      case AttackShape.THRUST_LINE:
        const thrustFacing = this.getPlayerFacingAngle();
        const lineWidth = config.width || 30;
        effectGraphics.fillStyle(0xff4444, 0.6);
        
        const endX = playerX + Math.cos(thrustFacing) * config.range;
        const endY = playerY + Math.sin(thrustFacing) * config.range;
        
        // 创建矩形表示直线攻击
        effectGraphics.fillRect(
          playerX - lineWidth/2,
          playerY - lineWidth/2,
          config.range,
          lineWidth
        );
        effectGraphics.setRotation(thrustFacing);
        break;
    }
    
    // 攻击效果淡出
    this.scene.add.tween({
      targets: effectGraphics,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        effectGraphics.destroy();
      }
    });
  }
  
  // 对目标造成伤害
  private dealDamageToTarget(target: Phaser.Physics.Arcade.Sprite, damage: number): void {
    // 应用伤害到敌人
    if ((target as any).takeDamage) {
      (target as any).takeDamage(damage);
    }
    
    // 创建伤害数字效果
    this.createDamageText(target.x, target.y - 20, damage);
    
    // 发出伤害事件
    this.emit('damageDealt', target, damage);
  }
  
  // 创建伤害数字显示
  private createDamageText(x: number, y: number, damage: number): void {
    const damageText = this.scene.add.text(x, y, damage.toString(), {
      fontSize: '18px',
      color: '#ff4444',
      fontStyle: 'bold'
    });
    damageText.setOrigin(0.5);
    damageText.setDepth(10);
    
    // 伤害数字动画
    this.scene.add.tween({
      targets: damageText,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });
  }
  
  // 更新攻击范围显示
  private updateRangeDisplay(): void {
    if (!this.rangeGraphics || !this.visualization.showRange) return;
    
    this.rangeGraphics.clear();
    
    const config = this.getActiveSkill();
    if (!config) return;
    
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    this.rangeGraphics.lineStyle(2, this.visualization.rangeColor, 0.8);
    this.rangeGraphics.fillStyle(this.visualization.rangeColor, this.visualization.rangeAlpha);
    
    switch (config.shape) {
      case AttackShape.MELEE_CIRCLE:
      case AttackShape.SLAM_AREA:
        this.rangeGraphics.strokeCircle(playerX, playerY, config.range);
        if (this.visualization.showPreview) {
          this.rangeGraphics.fillCircle(playerX, playerY, config.range);
        }
        break;
        
      case AttackShape.CLEAVE_ARC:
        const facing = this.getPlayerFacingAngle();
        const arcWidth = config.width || Math.PI / 3;
        this.rangeGraphics.slice(playerX, playerY, config.range, facing - arcWidth/2, facing + arcWidth/2);
        this.rangeGraphics.strokePath();
        if (this.visualization.showPreview) {
          this.rangeGraphics.fillPath();
        }
        break;
        
      case AttackShape.THRUST_LINE:
        const thrustFacing = this.getPlayerFacingAngle();
        const lineWidth = config.width || 30;
        const endX = playerX + Math.cos(thrustFacing) * config.range;
        const endY = playerY + Math.sin(thrustFacing) * config.range;
        
        this.rangeGraphics.strokeRect(
          playerX - lineWidth/2,
          playerY,
          config.range,
          lineWidth
        );
        break;
    }
  }
  
  // 设置可视化选项
  public setVisualization(options: Partial<AttackVisualization>): void {
    this.visualization = { ...this.visualization, ...options };
    this.updateRangeDisplay();
  }
  
  // 启用/禁用攻击范围显示
  public toggleRangeDisplay(show: boolean): void {
    this.visualization.showRange = show;
    if (!show && this.rangeGraphics) {
      this.rangeGraphics.clear();
    } else {
      this.updateRangeDisplay();
    }
  }
  
  // 清理资源
  public destroy(): void {
    if (this.rangeGraphics) {
      this.rangeGraphics.destroy();
      this.rangeGraphics = null;
    }
    this.removeAllListeners();
  }
} 