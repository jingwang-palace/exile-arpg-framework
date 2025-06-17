import Phaser from 'phaser';
import StatsWindow from '../ui/StatsWindow';
import InventoryWindow from '../ui/InventoryWindow';
import StorageWindow from '../ui/StorageWindow';
import { SkillTreeWindow } from '../ui/SkillTreeWindow';
import CraftingWindow from '../ui/CraftingWindow';
import AscendancyWindow from '../ui/AscendancyWindow';
import { AscendancySystem } from '../systems/AscendancySystem';
import { AscendancyQuestManager } from '../systems/AscendancyQuestManager';
import { AscendancyQuestWindow } from '../ui/AscendancyQuestWindow';
import { CombatManager, SpecializationType } from '../managers/CombatManager';
import { gameStore } from '../../stores/GameStore';
import { SkillManager } from '../systems/skills/SkillManager';
import { SkillSystem } from '../systems/SkillSystem';
// import { SkillLearningSystem } from '../systems/skills/SkillLearningSystem';
import { SKILLS } from '../systems/skills/SkillDatabase';
import { SkillDescription } from '../systems/skills/SkillTypes';
import { Player } from '../entities/Player';
import { Scene } from 'phaser';
import { ItemSystem } from '../systems/ItemSystem';
import { ItemFactory } from '../systems/ItemFactory';
import { ItemDropSystem } from '../systems/ItemDropSystem';
import { TradeSystem } from '../systems/TradeSystem';
import { ItemUseSystem } from '../systems/ItemUseSystem';
import { ItemUseEffects } from '../effects/ItemUseEffects';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerEntity!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private gameEvents: Phaser.Events.EventEmitter;
  private isAttacking: boolean = false;
  private attackCooldown: number = 0;
  private enemyData: any[];
  private areaConfig: any;
  // WASD键
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  // 界面按键
  private keyC!: Phaser.Input.Keyboard.Key; // 角色属性
  private keyI!: Phaser.Input.Keyboard.Key; // 背包
  private keyT!: Phaser.Input.Keyboard.Key; // 仓库
  private keyP!: Phaser.Input.Keyboard.Key; // 技能天赋
  private keyH!: Phaser.Input.Keyboard.Key; // 制作窗口
  private keyL!: Phaser.Input.Keyboard.Key; // 升华窗口
  private keyJ!: Phaser.Input.Keyboard.Key; // 升华任务窗口
  private keyEsc!: Phaser.Input.Keyboard.Key; // ESC关闭窗口
  private keyB!: Phaser.Input.Keyboard.Key; // B键回城
  
  // 技能键位 QERT
  private keyQ!: Phaser.Input.Keyboard.Key; // Q技能槽
  private keyE!: Phaser.Input.Keyboard.Key; // E技能槽
  private keyR!: Phaser.Input.Keyboard.Key; // R技能槽
  private keyTSkill!: Phaser.Input.Keyboard.Key; // T技能槽
  
  // 药水键位 1-5
  private key1!: Phaser.Input.Keyboard.Key; // 药水1
  private key2!: Phaser.Input.Keyboard.Key; // 药水2
  private key3!: Phaser.Input.Keyboard.Key; // 药水3
  private key4!: Phaser.Input.Keyboard.Key; // 药水4
  private key5!: Phaser.Input.Keyboard.Key; // 药水5
  // UI窗口
  private statsWindow!: StatsWindow;
  private inventoryWindow!: InventoryWindow;
  private storageWindow!: StorageWindow;
  private skillsWindow!: SkillTreeWindow;
  private craftingWindow!: CraftingWindow;
  private ascendancyWindow!: AscendancyWindow;
  private ascendancyQuestWindow!: AscendancyQuestWindow;
  private activeWindow: string | null = null;
  // 升华系统
  private ascendancySystem!: AscendancySystem;
  private ascendancyQuestManager!: AscendancyQuestManager;
  
  // 战斗系统
  private combatManager!: CombatManager;
  
  // 技能系统
  private skillManager!: SkillManager;
  private newSkillSystem!: SkillSystem;
  private skillTreeWindow!: SkillTreeWindow;
  // private skillLearningSystem!: SkillLearningSystem;
  
  // 地图边界
  private mapBounds = {
    x: 0,
    y: 0,
    width: 2400,
    height: 1800
  };
  // 玩家属性
  private playerHealth: number = 100;
  private playerMaxHealth: number = 100;
  private playerGold: number = 0;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private isDead: boolean = false;
  // 角色其他属性
  private playerStats: any = {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    vitality: 10,
    armor: 5,
    damage: "10-15",
    critChance: 5,
    attackSpeed: 1.0,
    level: 1,
    experience: 0,
    nextLevelExp: 100
  };
  // 背包
  private inventory: any[] = [];
  private inventorySize: number = 20;
  // 技能
  private skills: any[] = [];
  private availableSkillPoints: number = 0;
  // 天赋
  private talents: any[] = [];
  private availableTalentPoints: number = 0;
  private uiElements: any = {};
  
  // 技能槽系统 (QERT)
  private skillSlots: Array<{
    skill: any | null;
    cooldown: number;
    lastUsed: number;
  }> = [
    { skill: null, cooldown: 0, lastUsed: 0 }, // Q
    { skill: null, cooldown: 0, lastUsed: 0 }, // E  
    { skill: null, cooldown: 0, lastUsed: 0 }, // R
    { skill: null, cooldown: 0, lastUsed: 0 }  // T
  ];
  
  // 药水槽系统 (1-5)
  private potionSlots: Array<{
    potion: any | null;
    quantity: number;
    cooldown: number;
    lastUsed: number;
  }> = [
    { potion: null, quantity: 0, cooldown: 0, lastUsed: 0 }, // 1
    { potion: null, quantity: 0, cooldown: 0, lastUsed: 0 }, // 2
    { potion: null, quantity: 0, cooldown: 0, lastUsed: 0 }, // 3
    { potion: null, quantity: 0, cooldown: 0, lastUsed: 0 }, // 4
    { potion: null, quantity: 0, cooldown: 0, lastUsed: 0 }  // 5
  ];

  // POE风格UI元素
  private poeUI!: {
    healthGlobe: Phaser.GameObjects.Container;
    manaGlobe: Phaser.GameObjects.Container;
    skillBar: Phaser.GameObjects.Container;
    potionBar: Phaser.GameObjects.Container;
    healthText: Phaser.GameObjects.Text;
    manaText: Phaser.GameObjects.Text;
    skillSlotTexts: Phaser.GameObjects.Text[];
    potionSlotTexts: Phaser.GameObjects.Text[];
    healthFill: Phaser.GameObjects.Graphics;
    manaFill: Phaser.GameObjects.Graphics;
  };

  // POE风格UI相关属性
  private skillSlotTexts: Phaser.GameObjects.Text[] = [];
  private potionSlotTexts: Phaser.GameObjects.Text[] = [];

  private itemSystem!: ItemSystem;
  private itemFactory!: ItemFactory;
  private itemDropSystem!: ItemDropSystem;
  private tradeSystem!: TradeSystem;
  private itemUseSystem!: ItemUseSystem;
  private itemUseEffects!: ItemUseEffects;

  constructor() {
    super('GameScene');
    this.gameEvents = new Phaser.Events.EventEmitter();
    this.enemyData = [];
    this.areaConfig = {};
  }

  init(data: any) {
    this.areaConfig = data.area || {};
    this.enemyData = data.enemies || [];
    
    // 如果从城镇进入，使用传入的金币数据
    if (data && data.gold !== undefined) {
      this.playerGold = data.gold;
    }
    
    // 从localStorage加载技能数据
    this.loadPlayerData();
    
    // 重置玩家状态
    this.playerHealth = this.playerMaxHealth;
    this.isDead = false;
    
    // 初始化背包(如果为空)
    if (this.inventory.length === 0) {
      // 添加一些初始物品
      this.inventory.push(
        { id: 'potion_health', name: '生命药水', description: '恢复30点生命值', type: 'consumable', value: 10 },
        { id: 'sword_basic', name: '新手剑', description: '伤害: 5-8', type: 'weapon', damage: '5-8', value: 25 }
      );
    }
    
    // 初始化技能(如果为空)
    if (this.skills.length === 0) {
      this.skills.push(
        // 通用技能 (basic分支)
        { 
          id: 'basic_attack', 
          name: '普通攻击', 
          level: 1, 
          damage: 10, 
          branch: 'basic',
          locked: false,
          description: '基础近战攻击，升级到5级解锁打击专精'
        },
        { 
          id: 'righteous_fire', 
          name: '正义之火', 
          level: 1, 
          damage: 8, 
          branch: 'basic',
          locked: false,
          description: '范围持续伤害，升级到5级解锁正义之火专精'
        },
        
        // 打击专精技能 (strike分支)
        { 
          id: 'heavy_strike', 
          name: '重击', 
          level: 1, 
          damage: 25, 
          branch: 'strike',
          description: '强力的近战攻击',
          locked: true
        },
        { 
          id: 'cleave', 
          name: '劈砍', 
          level: 1, 
          damage: 18, 
          branch: 'strike',
          description: '攻击前方扇形区域的敌人',
          locked: true
        },
        
        // 正义之火专精技能 (fire分支)
        { 
          id: 'fire_nova', 
          name: '火焰新星', 
          level: 1, 
          damage: 30, 
          branch: 'fire',
          description: '以自身为中心的环形火焰攻击',
          locked: true
        },
        { 
          id: 'burning_ground', 
          name: '燃烧地面', 
          level: 1, 
          damage: 15, 
          branch: 'fire',
          description: '在地面创建持续燃烧的区域',
          locked: true
        }
      );
      
      // 给玩家少量初始技能点（只在第一次创建时）
      if (this.availableSkillPoints === 0) {
        this.availableSkillPoints = 2;
      }
    }
    
    // 初始化天赋(如果为空)
    if (this.talents.length === 0) {
      this.talents.push(
        // 通用天赋 (common分支)
        { 
          id: 'strength_boost', 
          name: '力量强化', 
          level: 0, 
          maxLevel: 5, 
          effect: '+5 力量/等级', 
          branch: 'common',
          description: '增加力量属性'
        },
        { 
          id: 'health_boost', 
          name: '生命强化', 
          level: 0, 
          maxLevel: 5, 
          effect: '+10 生命/等级', 
          branch: 'common',
          description: '增加生命值上限'
        },
        
        // 打击专精天赋 (strike分支)
        { 
          id: 'strike_mastery', 
          name: '打击掌握', 
          level: 0, 
          maxLevel: 3, 
          effect: '+15% 打击伤害/等级', 
          branch: 'strike',
          description: '增加所有打击技能的伤害',
          locked: true
        },
        { 
          id: 'weapon_expertise', 
          name: '武器专精', 
          level: 0, 
          maxLevel: 5, 
          effect: '+8% 攻击速度/等级', 
          branch: 'strike',
          description: '增加攻击速度',
          locked: true
        },
        
        // 正义之火专精天赋 (fire分支) 
        { 
          id: 'fire_mastery', 
          name: '火焰掌握', 
          level: 0, 
          maxLevel: 3, 
          effect: '+20% 火焰伤害/等级', 
          branch: 'fire',
          description: '增加所有火焰技能的伤害',
          locked: true
        },
        { 
          id: 'burn_duration', 
          name: '燃烧持续', 
          level: 0, 
          maxLevel: 4, 
          effect: '+25% 燃烧持续时间/等级', 
          branch: 'fire',
          description: '延长燃烧效果的持续时间',
          locked: true
        }
      );
      
      // 给玩家少量初始天赋点
      this.availableTalentPoints = 1;
    }
  }

  preload() {
    // 不需要预加载外部资源，我们将在运行时创建图形
  }

  create() {
    // 创建世界边界
    this.physics.world.setBounds(0, 0, 2400, 1800);
    
    // 创建简单的背景
    this.createSimpleBackground();
    
    // 创建玩家
    this.createPlayer();
    
    // 设置相机跟随玩家
    this.cameras.main.setBounds(0, 0, 2400, 1800);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成敌人
    this.spawnEnemies();
    
    // 设置碰撞
    this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);
    
    // 设置输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加WASD键支持
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // 添加界面按键
    this.keyC = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyI = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyT = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    this.keyP = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyH = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keyL = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyB = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    
    // 技能键位 QERT
    this.keyQ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyR = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyTSkill = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    
    // 药水键位 1-5
    this.key1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.key5 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
    
    // 注意: 1-5现在是药水键，QERT是技能键
    
    // 创建贴图
    this.createTextures();
    
    // 添加鼠标点击事件
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isDead) return; // 死亡时禁用点击
      
      // 如果有UI窗口打开，检查是否点击在窗口外
      if (this.activeWindow) {
        let clickedOutside = true;
        
        try {
          if (this.activeWindow === 'stats') {
            const bounds = this.statsWindow.getContainer().getBounds();
            clickedOutside = !bounds.contains(pointer.x, pointer.y);
          } else if (this.activeWindow === 'inventory') {
            const bounds = this.inventoryWindow.getContainer().getBounds();
            clickedOutside = !bounds.contains(pointer.x, pointer.y);
          } else if (this.activeWindow === 'skills') {
            const bounds = this.skillsWindow.getContainer().getBounds();
            clickedOutside = !bounds.contains(pointer.x, pointer.y);
            console.log(`🖱️ 技能窗口点击检测: x=${pointer.x}, y=${pointer.y}, bounds=${JSON.stringify(bounds)}, clickedOutside=${clickedOutside}`);
          } else if (this.activeWindow === 'crafting') {
            const bounds = this.craftingWindow.getContainer().getBounds();
            clickedOutside = !bounds.contains(pointer.x, pointer.y);
          } else if (this.activeWindow === 'ascendancy') {
            const bounds = this.ascendancyWindow.getContainer().getBounds();
            clickedOutside = !bounds.contains(pointer.x, pointer.y);
          }
        } catch (error) {
          console.warn('窗口边界检测失败:', error);
          clickedOutside = false; // 如果检测失败，假设点击在窗口内
        }
        
        if (clickedOutside) {
          // 点击在窗口外，关闭窗口
          console.log('🖱️ 点击在窗口外，关闭窗口');
          this.closeAllWindows();
          return;
        } else {
          // 点击在窗口内，不阻止事件传播，让窗口内的UI元素处理
          console.log('🖱️ 点击在窗口内，允许UI交互');
          // 注意：这里不要return，让事件继续传播到窗口内的UI元素
        }
      }
      
      // 只有在没有活动窗口或点击在窗口外时才处理游戏世界交互
      if (!this.activeWindow) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        if (pointer.leftButtonDown()) {
          // 移动到点击位置
          this.movePlayerToPoint(worldPoint.x, worldPoint.y);
        } else if (pointer.rightButtonDown()) {
          // 攻击
          this.playerAttack(worldPoint.x, worldPoint.y);
        }
      }
    });
    
    // 创建UI
    this.createUI();
    
    // 创建UI窗口
    this.createUIWindows();
    
    // 初始化升华系统
    this.ascendancySystem = new AscendancySystem(this);
    // 修复Player类型错误 - 创建Player实体
    const playerEntity = {
      sprite: this.player,
      level: this.playerStats.level,
      experience: this.playerStats.experience,
      nextLevelExp: this.playerStats.nextLevelExp,
      currentHealth: this.playerHealth,
      maxHealth: this.playerMaxHealth,
      currentMana: 50,
      maxMana: 50,
      strength: this.playerStats.strength,
      dexterity: this.playerStats.dexterity,
      intelligence: this.playerStats.intelligence,
      vitality: this.playerStats.vitality,
      damage: this.playerStats.damage,
      armor: this.playerStats.armor,
      critChance: this.playerStats.critChance,
      attackSpeed: this.playerStats.attackSpeed,
      x: this.player.x,
      y: this.player.y,
      gainExperience: (amount: number) => { this.playerStats.experience += amount; },
      takeDamage: (amount: number) => { this.playerHealth = Math.max(0, this.playerHealth - amount); },
      heal: (amount: number) => { this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + amount); },
      isDead: () => this.playerHealth <= 0
    };
    this.ascendancyQuestManager = new AscendancyQuestManager(this, playerEntity as any);
    this.ascendancyWindow.setAscendancySystem(this.ascendancySystem);
    
    // 初始化战斗系统
    this.combatManager = new CombatManager(this, this.player, this.enemies);
    // 不设置默认技能，让玩家自己配置
    
    // 初始化增强技能系统
    this.initializeAdvancedSkillSystem();
    
    // 初始化默认技能和药水
    this.initializeDefaultSkillsAndPotions();
    
    // 初始化技能系统
    this.skillManager = new SkillManager(this, this.player);
    
    // 加载技能数据库
    SKILLS.forEach(skillDesc => {
      this.skillManager.registerSkill(skillDesc);
    });
    
    // 学习一些基础技能
    this.skillManager.learnSkill('fireball');
    this.skillManager.learnSkill('quick_shot');
    this.skillManager.learnSkill('first_aid');
    this.skillManager.learnSkill('dash');
    
    // 装备技能到技能槽
    this.skillManager.equipSkill('fireball', 0);     // Q槽
    this.skillManager.equipSkill('quick_shot', 1);   // E槽
    this.skillManager.equipSkill('first_aid', 2);    // R槽
    this.skillManager.equipSkill('dash', 3);         // T槽
    
    console.log('🔥 技能系统已初始化，基础技能已装备');
    
    // 设置升华任务事件监听
    this.events.on('start_ascendancy_quest', (quest: any) => {
      this.ascendancyQuestManager.startSpecialQuest(quest);
    });
    
    this.events.on('ascendancy_quest_completed', (quest: any) => {
      console.log(`升华任务完成: ${quest.name}`);
    });
    
    // 发出场景创建事件
    this.gameEvents.emit('scene-created', {
      areaName: this.areaConfig.name || '测试区域',
      enemyCount: this.enemies.getChildren().length
    });
    
    // 监听玩家受伤事件
    this.gameEvents.on('player-hit', this.onPlayerHit, this);

    // 从GameStore加载玩家数据
    this.playerStats = gameStore.getPlayer();
    
    console.log('🎮 游戏场景已创建，玩家数据来自GameStore');
    
    // 初始化药水槽UI显示
    this.updatePotionSlotsUI();
    // 初始化血量显示
    this.updateHealthBar();
  }

  // 创建简单的背景 - 添加缺失的方法
  private createSimpleBackground() {
    // 绘制背景图形
    const bg = this.add.graphics();
    
    // 根据区域设置背景颜色
    const areaType = this.areaConfig.type || 'forest';
    let bgColor = 0x228B22; // 默认为森林绿色
    
    switch (areaType) {
      case 'cave':
        bgColor = 0x2c3e50; // 洞穴暗色
        break;
      case 'desert':
        bgColor = 0xd4ac0d; // 沙漠黄色
        break;
      case 'mountain':
        bgColor = 0x7f8c8d; // 山脉灰色
        break;
      case 'ruins':
        bgColor = 0x7d6608; // 废墟暗黄色
        break;
    }
    
    // 填充背景
    bg.fillStyle(bgColor, 1);
    bg.fillRect(0, 0, 2400, 1800);
    
    // 添加随机的地形特征
    const terrainFeatures = 100;
    for (let i = 0; i < terrainFeatures; i++) {
      const x = Phaser.Math.Between(0, 2400);
      const y = Phaser.Math.Between(0, 1800);
      const size = Phaser.Math.Between(5, 15);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.7);
      
      // 根据区域类型绘制不同的特征
      bg.fillStyle(this.getTerrainFeatureColor(areaType), alpha);
      bg.fillCircle(x, y, size);
    }
    
    // 添加区域名称
    const areaName = this.areaConfig.name || '未知区域';
    const areaLevel = this.areaConfig.level || 1;
    
    const areaText = this.add.text(10, 10, `${areaName} (等级 ${areaLevel})`, {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    areaText.setScrollFactor(0);
    
    // 添加按键提示
    const keyHints = this.add.text(10, 40, 'WASD:移动 空格:攻击 QERT:技能 1-5:药水 I:背包 P:技能树 C:属性 H:工艺 B:回城', {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    keyHints.setScrollFactor(0);
  }
  
  // 获取地形特征颜色
  private getTerrainFeatureColor(areaType: string): number {
    switch (areaType) {
      case 'forest':
        return 0x196F3D; // 深绿色(树木)
      case 'cave':
        return 0x4A235A; // 深紫色(矿石)
      case 'desert':
        return 0xF5CBA7; // 浅黄色(沙丘)
      case 'mountain':
        return 0x5D6D7E; // 蓝灰色(岩石)
      case 'ruins':
        return 0x5B4534; // 褐色(废墟)
      default:
        return 0x196F3D; // 默认深绿色
    }
  }

  // 创建玩家
  private createPlayer() {
    // 创建玩家贴图
    const playerGraphics = this.make.graphics({x: 0, y: 0});
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(32, 32, 16);
    playerGraphics.lineStyle(2, 0xffffff, 1);
    playerGraphics.strokeCircle(32, 32, 16);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(36, 28, 4);
    playerGraphics.generateTexture('player', 64, 64);
    
    // 创建玩家Sprite
    this.player = this.physics.add.sprite(200, 200, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(32, 32);
    this.player.setDisplaySize(48, 48);
    
    // 创建Player实体
    this.playerEntity = new Player(this.player);
  }
  
  // 创建贴图
  private createTextures() {
    // 攻击效果贴图
    const slashGraphics = this.make.graphics({x: 0, y: 0});
    slashGraphics.lineStyle(4, 0xffffff, 1);
    slashGraphics.beginPath();
    slashGraphics.moveTo(0, 0);
    slashGraphics.lineTo(30, 0);
    slashGraphics.arc(0, 0, 30, 0, Math.PI / 2, false);
    slashGraphics.strokePath();
    slashGraphics.generateTexture('slash', 64, 64);
    
    // 敌人贴图 - 根据不同类型创建不同外观
    this.createEnemyTextures();
  }
  
  // 创建敌人贴图
  private createEnemyTextures() {
    // 史莱姆
    const slimeGraphics = this.make.graphics({x: 0, y: 0});
    slimeGraphics.fillStyle(0x2ecc71, 1);
    slimeGraphics.fillCircle(32, 32, 16);
    slimeGraphics.fillStyle(0x000000, 0.5);
    slimeGraphics.fillCircle(28, 28, 3);
    slimeGraphics.fillCircle(36, 28, 3);
    slimeGraphics.generateTexture('enemy_slime', 64, 64);
    
    // 骷髅
    const skeletonGraphics = this.make.graphics({x: 0, y: 0});
    skeletonGraphics.fillStyle(0xecf0f1, 1);
    skeletonGraphics.fillCircle(32, 32, 16);
    skeletonGraphics.fillStyle(0x000000, 1);
    skeletonGraphics.fillCircle(28, 28, 3);
    skeletonGraphics.fillCircle(36, 28, 3);
    skeletonGraphics.fillRect(28, 38, 8, 2);
    skeletonGraphics.generateTexture('enemy_skeleton', 64, 64);
    
    // 强盗
    const banditGraphics = this.make.graphics({x: 0, y: 0});
    banditGraphics.fillStyle(0xe74c3c, 1);
    banditGraphics.fillCircle(32, 32, 16);
    banditGraphics.fillStyle(0x000000, 1);
    banditGraphics.fillCircle(28, 28, 3);
    banditGraphics.fillCircle(36, 28, 3);
    banditGraphics.fillRect(28, 35, 8, 2);
    banditGraphics.generateTexture('enemy_bandit', 64, 64);
  }
  
  // 生成敌人
  private spawnEnemies() {
    // 根据区域等级和类型生成适当的敌人
    const areaLevel = this.areaConfig.level || 1;
    const enemyCount = Phaser.Math.Between(5, 10);
    
    for (let i = 0; i < enemyCount; i++) {
      // 随机敌人类型
      const enemyTypes = ['slime', 'skeleton', 'bandit'];
      const enemyType = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
      
      // 随机位置，确保不会生成在玩家太近的地方
      let x, y, distanceToPlayer;
      do {
        x = Phaser.Math.Between(100, 2300);
        y = Phaser.Math.Between(100, 1700);
        distanceToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
      } while (distanceToPlayer < 300);
      
      // 创建敌人
      const enemy = this.enemies.create(x, y, `enemy_${enemyType}`);
      
      // 设置敌人属性
      const health = 20 + areaLevel * 5;
      const damage = 3 + areaLevel;
      const level = areaLevel;
      
      enemy.setData('type', enemyType);
      enemy.setData('health', health);
      enemy.setData('maxHealth', health);
      enemy.setData('damage', damage);
      enemy.setData('level', level);
      enemy.setData('name', this.getMonsterName(enemyType));
      enemy.setData('id', `enemy_${i}_${Date.now()}`); // 添加唯一ID
      
      // 添加takeDamage方法
      (enemy as any).takeDamage = (dmg: number) => {
        const currentHealth = enemy.getData('health');
        const newHealth = Math.max(0, currentHealth - dmg);
        enemy.setData('health', newHealth);
        
        // 更新血条
        const healthBar = enemy.getData('healthBar');
        if (healthBar) {
          healthBar.setVisible(true);
          this.updateEnemyHealthBar(enemy);
          
          // 一段时间后隐藏血条
          this.time.delayedCall(3000, () => {
            if (healthBar.active) {
              healthBar.setVisible(false);
            }
          });
        }
        
        // 检查是否死亡
        if (newHealth <= 0) {
          this.handleEnemyDeath(enemy);
        }
        
        return newHealth;
      };
      
      // 创建并隐藏血条
      this.createEnemyHealthBar(enemy);
    }
  }
  
  // 创建敌人血条
  private createEnemyHealthBar(enemy: Phaser.Physics.Arcade.Sprite) {
    const healthBar = this.add.graphics();
    const health = enemy.getData('health');
    const maxHealth = enemy.getData('maxHealth');
    
    // 绘制血条
    healthBar.clear();
    healthBar.fillStyle(0x000000, 0.5);
    healthBar.fillRect(-20, -30, 40, 5);
    healthBar.fillStyle(0xff0000, 1);
    healthBar.fillRect(-20, -30, 40 * (health / maxHealth), 5);
    
    // 关联到敌人
    enemy.setData('healthBar', healthBar);
    
    // 初始隐藏
    healthBar.setVisible(false);
    
    // 更新血条位置
    this.updateEnemyHealthBar(enemy);
  }
  
  // 更新敌人血条
  private updateEnemyHealthBar(enemy: Phaser.Physics.Arcade.Sprite) {
    const healthBar = enemy.getData('healthBar');
    if (!healthBar) return;
    
    // 更新位置
    healthBar.x = enemy.x;
    healthBar.y = enemy.y;
    
    // 更新显示
    const health = enemy.getData('health');
    const maxHealth = enemy.getData('maxHealth');
    
    healthBar.clear();
    healthBar.fillStyle(0x000000, 0.5);
    healthBar.fillRect(-20, -30, 40, 5);
    healthBar.fillStyle(0xff0000, 1);
    healthBar.fillRect(-20, -30, 40 * (health / maxHealth), 5);
  }
  
  // 创建UI
  private createUI() {
    // 创建POE风格UI
    this.createPOEStyleUI();
    
    // 保留原来的UI元素作为备用
    this.createLegacyUI();
  }

  // 创建POE风格UI
  private createPOEStyleUI() {
    // 血量球
    this.createHealthGlobe();
    // 魔力球  
    this.createManaGlobe();
    // 技能条
    this.createSkillBar();
    // 药水条
    this.createPotionBar();
  }

  private createHealthGlobe() {
    const x = 80;
    const y = this.cameras.main.height - 80;
    
    const healthGlobe = this.add.container(x, y);
    healthGlobe.setScrollFactor(0);
    healthGlobe.setDepth(1000);
    
    // 血量球背景
    const globeBg = this.add.circle(0, 0, 35, 0x330000);
    globeBg.setStrokeStyle(3, 0x660000);
    healthGlobe.add(globeBg);
    
    // 血量填充
    const healthFill = this.add.graphics();
    healthGlobe.add(healthFill);
    
    // 血量文字
    const healthText = this.add.text(0, 0, '100/100', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    healthGlobe.add(healthText);
    
    // 保存引用
    this.healthBar = healthFill;
    this.healthText = healthText;
  }

  private createManaGlobe() {
    const x = this.cameras.main.width - 80;
    const y = this.cameras.main.height - 80;
    
    const manaGlobe = this.add.container(x, y);
    manaGlobe.setScrollFactor(0);
    manaGlobe.setDepth(1000);
    
    // 魔力球背景
    const globeBg = this.add.circle(0, 0, 35, 0x000033);
    globeBg.setStrokeStyle(3, 0x000066);
    manaGlobe.add(globeBg);
    
    // 魔力填充
    const manaFill = this.add.graphics();
    manaGlobe.add(manaFill);
    
    // 魔力文字  
    const manaText = this.add.text(0, 0, '50/50', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    manaGlobe.add(manaText);
  }

  private createSkillBar() {
    const centerX = this.cameras.main.width / 2;
    const y = this.cameras.main.height - 120;
    
    const skillBar = this.add.container(centerX, y);
    skillBar.setScrollFactor(0);
    skillBar.setDepth(1000);
    
    const skillKeys = ['Q', 'E', 'R', 'T'];
    const slotSize = 50;
    const spacing = 60;
    
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * spacing;
      
      // 技能槽背景
      const slotBg = this.add.rectangle(x, 0, slotSize, slotSize, 0x222222);
      slotBg.setStrokeStyle(2, 0x444444);
      skillBar.add(slotBg);
      
      // 按键提示
      const keyText = this.add.text(x, 20, skillKeys[i], {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      skillBar.add(keyText);
      
      // 技能名称
      const skillText = this.add.text(x, -15, '空', {
        fontSize: '10px',
        color: '#888888'
      }).setOrigin(0.5);
      skillBar.add(skillText);
      
      // 右键配置提示
      slotBg.setInteractive({ cursor: 'pointer' })
        .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.rightButtonDown()) {
            this.openSkillSlotConfig(i);
          }
        });
    }
  }

  private createPotionBar() {
    const centerX = this.cameras.main.width / 2;
    const y = this.cameras.main.height - 60;
    
    const potionBar = this.add.container(centerX, y);
    potionBar.setScrollFactor(0);
    potionBar.setDepth(1000);
    
    const potionKeys = ['1', '2', '3', '4', '5'];
    const slotSize = 40;
    const spacing = 50;
    
    // 清空现有引用
    this.potionSlotTexts = [];
    
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * spacing;
      
      // 药水槽背景
      const slotBg = this.add.rectangle(x, 0, slotSize, slotSize, 0x331100);
      slotBg.setStrokeStyle(2, 0x663300);
      potionBar.add(slotBg);
      
      // 按键提示
      const keyText = this.add.text(x, 15, potionKeys[i], {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      potionBar.add(keyText);
      
      // 药水数量
      const potionText = this.add.text(x, -10, '', {
        fontSize: '10px',
        color: '#ffffff'
      }).setOrigin(0.5);
      potionBar.add(potionText);
      
      // 保存药水文本引用
      this.potionSlotTexts.push(potionText);
      
      // 根据药水数量更新显示
      const slot = this.potionSlots[i];
      if (slot.potion && slot.quantity > 0) {
        potionText.setText(`${slot.quantity}`);
        if (slot.potion.type === 'health') {
          slotBg.setFillStyle(0x550000);
        }
      }
    }
  }

  // 创建传统UI（作为备用）
  private createLegacyUI() {
    // 金币显示
    this.goldText = this.add.text(10, this.cameras.main.height - 30, `金币: ${this.playerGold}`, {
      fontSize: '16px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.goldText.setScrollFactor(0);
    this.goldText.setDepth(1000);
  }

  // 打开技能槽配置
  private openSkillSlotConfig(slotIndex: number) {
    console.log(`配置技能槽 ${slotIndex + 1}`);
    
    // 显示可用技能列表
    const availableSkills = this.skills.filter(skill => 
      !skill.locked && skill.level > 0
    );
    
    if (availableSkills.length === 0) {
      console.log('没有可用的技能');
      return;
    }
    
    // 创建技能选择窗口
    this.createSkillSelectionWindow(slotIndex, availableSkills);
  }

  // 创建技能选择窗口
  private createSkillSelectionWindow(slotIndex: number, skills: any[]) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    const container = this.add.container(centerX, centerY);
    container.setDepth(2000);
    
    // 背景
    const bg = this.add.rectangle(0, 0, 300, 400, 0x000000, 0.9);
    bg.setStrokeStyle(2, 0xffffff);
    container.add(bg);
    
    // 标题
    const title = this.add.text(0, -180, `配置技能槽 ${['Q', 'E', 'R', 'T'][slotIndex]}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(title);
    
    // 技能列表
    let yOffset = -120;
    skills.forEach((skill, index) => {
      const skillButton = this.add.rectangle(0, yOffset, 250, 30, 0x333333);
      skillButton.setStrokeStyle(1, 0x666666);
      skillButton.setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => {
          this.assignSkillToSlot(slotIndex, skill);
          container.destroy();
        });
      
      const skillText = this.add.text(0, yOffset, `${skill.name} (Lv.${skill.level})`, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      container.add([skillButton, skillText]);
      yOffset += 40;
    });
    
    // 清空按钮
    const clearButton = this.add.rectangle(0, yOffset + 20, 100, 30, 0x660000);
    clearButton.setStrokeStyle(1, 0xff0000);
    clearButton.setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        this.assignSkillToSlot(slotIndex, null);
        container.destroy();
      });
    
    const clearText = this.add.text(0, yOffset + 20, '清空', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    container.add([clearButton, clearText]);
    
    // 关闭按钮
    const closeButton = this.add.text(130, -180, 'X', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)
    .setInteractive({ cursor: 'pointer' })
    .on('pointerdown', () => container.destroy());
    
    container.add(closeButton);
  }

  // 分配技能到技能槽
  private assignSkillToSlot(slotIndex: number, skill: any | null) {
    this.skillSlots[slotIndex].skill = skill;
    console.log(`技能槽 ${slotIndex + 1} 设置为: ${skill ? skill.name : '空'}`);
    
    // 更新UI显示
    this.updateSkillSlotsUI();
  }

  // 更新技能槽UI显示
  private updateSkillSlotsUI() {
    for (let i = 0; i < this.skillSlots.length; i++) {
      if (this.skillSlotTexts[i]) {
        const skill = this.skillSlots[i].skill;
        if (skill) {
          this.skillSlotTexts[i].setText(skill.name);
          this.skillSlotTexts[i].setColor('#ffffff');
        } else {
          this.skillSlotTexts[i].setText('空');
          this.skillSlotTexts[i].setColor('#888888');
        }
      }
    }
    console.log('技能槽UI已更新');
  }

  // 玩家死亡处理
  private playerDeath() {
    this.isDead = true;
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 死亡动画
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      angle: 90,
      scale: 0.8,
      duration: 1000,
      ease: 'Power2'
    });
    
    // 显示死亡消息
    const deathText = this.add.text(640, 360, '你已经死亡!', {
      fontSize: '48px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    deathText.setScrollFactor(0);
    deathText.setOrigin(0.5);
    
    // 显示重新开始按钮
    const restartButton = this.add.text(640, 460, '返回城镇', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#2c3e50',
      padding: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 10
      }
    });
    restartButton.setScrollFactor(0);
    restartButton.setOrigin(0.5);
    restartButton.setInteractive();
    
    restartButton.on('pointerdown', () => {
      // 返回城镇
      this.scene.start('TownScene', {
        gold: Math.floor(this.playerGold * 0.8), // 死亡损失一些金币
        fromDeath: true
      });
    });
  }

  update(time: number, delta: number) {
    // 如果玩家已死亡，禁止更新
    if (this.isDead) return;
    
    // 如果没有窗口打开，处理键盘移动
    if (!this.activeWindow) {
      this.handlePlayerMovement();
      
      // 处理攻击冷却
      if (this.attackCooldown > 0) {
        this.attackCooldown -= delta;
      }
      
      // 处理空格键攻击
      if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        if (this.attackCooldown <= 0 && !this.isAttacking) {
          // 向玩家朝向方向攻击
          const angle = this.getPlayerFacing();
          const offsetX = Math.cos(angle) * 50;
          const offsetY = Math.sin(angle) * 50;
          
          this.playerAttack(this.player.x + offsetX, this.player.y + offsetY);
        }
      }
      
      // 处理技能快捷键 - 移除旧的技能键逻辑，现在使用QERT
      // this.skillKeys.forEach((key, index) => {
      //   if (Phaser.Input.Keyboard.JustDown(key)) {
      //     this.useSkill(index + 1);
      //   }
      // });
    }
    
    // 处理UI按键 - 确保按键响应，即使窗口已经打开
    if (Phaser.Input.Keyboard.JustDown(this.keyC)) {
      console.log("按下C键");
      if (this.activeWindow === 'stats') {
        this.closeAllWindows();
      } else {
        this.openStatsWindow();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keyI)) {
      console.log("按下I键");
      if (this.activeWindow === 'inventory') {
        this.closeAllWindows();
      } else {
        this.openInventoryWindow();
      }
    // T键现在不直接开仓库，移除此处逻辑
    } else if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
      console.log("按下P键");
      if (this.activeWindow === 'skills') {
        this.closeAllWindows();
      } else {
        this.openSkillsWindow();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keyH)) {
      console.log("按下H键");
      if (this.activeWindow === 'crafting') {
        this.closeAllWindows();
      } else {
        this.openCraftingWindow();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keyL)) {
      console.log("按下L键");
      if (this.activeWindow === 'ascendancy') {
        this.closeAllWindows();
      } else {
        this.openAscendancyWindow();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keyJ)) {
      console.log("按下J键");
      if (this.activeWindow === 'ascendancy_quest') {
        this.closeAllWindows();
      } else {
        this.openAscendancyQuestWindow();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      console.log("按下ESC键");
      this.closeAllWindows();
    }
    
    // 处理QERT技能键 - 使用新的技能系统
    if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      this.useAdvancedSkillSlot(0); // Q技能槽
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.useAdvancedSkillSlot(1); // E技能槽
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.useAdvancedSkillSlot(2); // R技能槽
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyTSkill)) {
      this.useAdvancedSkillSlot(3); // T技能槽
    }
    
    // 处理1-5药水键
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.usePotionSlot(0); // 药水槽1
    }
    if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.usePotionSlot(1); // 药水槽2
    }
    if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.usePotionSlot(2); // 药水槽3
    }
    if (Phaser.Input.Keyboard.JustDown(this.key4)) {
      this.usePotionSlot(3); // 药水槽4
    }
    if (Phaser.Input.Keyboard.JustDown(this.key5)) {
      this.usePotionSlot(4); // 药水槽5
    }
    
    // 处理B键回城
    if (Phaser.Input.Keyboard.JustDown(this.keyB)) {
      console.log("按下B键，回城");
      this.returnToTown();
    }
    

    
    // 更新敌人行为
    this.updateEnemies(delta);
    
    // 更新战斗系统（包括正义之火）
    if (this.combatManager) {
      this.combatManager.update();
    }
    
    // 更新技能系统
    if (this.skillManager) {
      this.skillManager.update(time, delta);
    }
    
    // 更新新技能系统
    if (this.newSkillSystem) {
      this.newSkillSystem.update();
    }
    
    // 检查地图边界
    this.checkMapBounds();
  }
  
  // 创建UI窗口
  private createUIWindows() {
    // 获取游戏屏幕中心位置
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 初始化新技能系统
    this.newSkillSystem = new SkillSystem(this, this.player, this.enemies);
    
    // 创建属性窗口
    this.statsWindow = new StatsWindow(this, centerX, centerY);
    this.statsWindow.setStats(this.playerStats);
    this.statsWindow.setHealth(this.playerHealth, this.playerMaxHealth);
    this.statsWindow.setGold(this.playerGold);
    
    // 创建背包窗口
    this.inventoryWindow = new InventoryWindow(this, centerX, centerY);
    this.inventoryWindow.setInventory(this.inventory);
    this.inventoryWindow.setItemClickCallback((item, index) => {
      console.log(`使用物品: ${item.name}`);
      // 实现物品使用逻辑
    });
    
    // 创建仓库窗口
    this.storageWindow = new StorageWindow(this, centerX, centerY);
    
    // 创建技能天赋树窗口
    this.skillsWindow = new SkillTreeWindow(this, this.newSkillSystem);
    this.skillTreeWindow = this.skillsWindow; // 兼容性别名
    
    // 创建制作窗口
    this.craftingWindow = new CraftingWindow(this);
    
    // 创建升华窗口
    this.ascendancyWindow = new AscendancyWindow(this);
    
    // 创建升华任务窗口
    this.ascendancyQuestWindow = new AscendancyQuestWindow(this);
    
    // 监听打击系技能切换事件
    this.events.on('strikeSkillChanged', (skillId: string) => {
      console.log(`打击系技能切换为: ${skillId}`);
      // 这里可以处理技能切换逻辑，比如更新自动攻击系统
    });
  }
  
  // 关闭所有窗口
  private closeAllWindows() {
    // 在关闭技能窗口时保存技能数据
    if (this.activeWindow === 'skills') {
      try {
        const skillData = {
          skills: this.skills,
          availableSkillPoints: this.availableSkillPoints,
          talents: this.talents,
          availableTalentPoints: this.availableTalentPoints,
          timestamp: Date.now()
        };
        localStorage.setItem('poe_skill_data', JSON.stringify(skillData));
        console.log('技能数据已保存，技能点:', this.availableSkillPoints);
      } catch (error) {
        console.error('保存技能数据失败:', error);
      }
    }
    
    if (this.statsWindow) this.statsWindow.setVisible(false);
    if (this.inventoryWindow) this.inventoryWindow.setVisible(false);
    if (this.storageWindow) this.storageWindow.setVisible(false);
    if (this.skillsWindow) this.skillsWindow.setVisible(false);
    if (this.skillTreeWindow) this.skillTreeWindow.setVisible(false);
    if (this.craftingWindow) this.craftingWindow.setVisible(false);
    if (this.ascendancyWindow) this.ascendancyWindow.setVisible(false);
    if (this.ascendancyQuestWindow) this.ascendancyQuestWindow.hide();
    this.activeWindow = null;
  }
  
  // 打开角色属性窗口
  private openStatsWindow() {
    this.closeAllWindows();
    this.statsWindow.setStats(this.playerStats);
    this.statsWindow.setHealth(this.playerHealth, this.playerMaxHealth);
    this.statsWindow.setGold(this.playerGold);
    this.statsWindow.setVisible(true);
    this.activeWindow = 'stats';
  }
  
  // 打开背包窗口
  private openInventoryWindow() {
    this.closeAllWindows();
    this.inventoryWindow.setInventory(this.inventory);
    this.inventoryWindow.setVisible(true);
    this.activeWindow = 'inventory';
  }
  
  // 打开仓库窗口
  private openStorageWindow() {
    this.closeAllWindows();
    this.storageWindow.setVisible(true);
    this.activeWindow = 'storage';
  }
  
  // 打开技能天赋窗口
  private openSkillsWindow() {
    console.log('📖 正在打开技能天赋树...');
    this.closeAllWindows();
    
    // 使用新的技能天赋树窗口
    this.skillTreeWindow.setVisible(true);
    this.activeWindow = 'skills';
  }
  
  // 打开制作窗口
  private openCraftingWindow() {
    this.closeAllWindows();
    this.craftingWindow.setVisible(true);
    this.activeWindow = 'crafting';
  }
  
  // 打开升华窗口
  private openAscendancyWindow() {
    this.closeAllWindows();
    
    // AscendancyWindow已经有内置的职业选择功能，无需外部设置
    this.ascendancyWindow.setVisible(true);
    this.activeWindow = 'ascendancy';
  }
  
  // 打开升华任务窗口
  private openAscendancyQuestWindow() {
    this.closeAllWindows();
    
    // 获取可用的升华任务
    const availableQuests = this.ascendancySystem.getAvailableQuests();
    
    this.ascendancyQuestWindow.show(availableQuests);
    this.activeWindow = 'ascendancy_quest';
  }

  private handlePlayerMovement() {
    if (!this.cursors) return;
    
    // 计算速度
    const speed = 160;
    let vx = 0;
    let vy = 0;
    
    // 方向键控制
    if (this.cursors.left.isDown || this.keyA.isDown) {
      vx = -speed;
      this.player.flipX = true;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      vx = speed;
      this.player.flipX = false;
    }
    
    if (this.cursors.up.isDown || this.keyW.isDown) {
      vy = -speed;
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      vy = speed;
    }
    
    // 斜向移动时标准化速度
    if (vx !== 0 && vy !== 0) {
      const norm = Math.sqrt(vx * vx + vy * vy);
      vx = (vx / norm) * speed;
      vy = (vy / norm) * speed;
    }
    
    // 设置速度
    this.player.setVelocity(vx, vy);
  }
  
  // 玩家点击移动
  private movePlayerToPoint(x: number, y: number) {
    // 计算方向
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, x, y);
    
    // 根据方向设置水平翻转
    if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
      this.player.flipX = true;
    } else {
      this.player.flipX = false;
    }
    
    // 设置移动速度
    const speed = 160;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    this.player.setVelocity(vx, vy);
    
    // 在实际游戏中，这里应该保存目标点并实现路径移动
    // 简化版本中，我们只是设置初始速度
  }

  private playerAttack(x: number, y: number) {
    if (this.isAttacking || this.attackCooldown > 0) return;
    
    this.isAttacking = true;
    this.attackCooldown = 500; // 0.5秒冷却
    
    // 计算攻击方向
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, x, y);
    
    // 根据方向设置水平翻转
    if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
      this.player.flipX = true;
    } else {
      this.player.flipX = false;
    }
    
    // 创建攻击效果
    const attackRange = 80;
    const attackX = this.player.x + Math.cos(angle) * attackRange;
    const attackY = this.player.y + Math.sin(angle) * attackRange;
    
    const slash = this.add.image(attackX, attackY, 'slash');
    slash.setScale(1.5);
    slash.setRotation(angle);
    
    // 攻击效果消失
    this.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        slash.destroy();
        this.isAttacking = false;
      }
    });
    
    // 检测命中
    const hitCircle = new Phaser.Geom.Circle(attackX, attackY, 60);
    
    let hitCount = 0;
    this.enemies.getChildren().forEach((enemyObj) => {
      const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
      const enemyPoint = new Phaser.Geom.Point(enemy.x, enemy.y);
      
      if (Phaser.Geom.Circle.ContainsPoint(hitCircle, enemyPoint)) {
        // 命中敌人
        hitCount++;
        
        // 计算伤害
        const damage = Phaser.Math.Between(10, 20);
        
        // 减少敌人生命值
        const health = enemy.getData('health');
        const newHealth = Math.max(0, health - damage);
        enemy.setData('health', newHealth);
        
        // 显示血条并更新
        const healthBar = enemy.getData('healthBar');
        if (healthBar) {
          healthBar.setVisible(true);
          this.updateEnemyHealthBar(enemy);
          
          // 一段时间后隐藏血条
          this.time.delayedCall(3000, () => {
            if (healthBar.active) {
              healthBar.setVisible(false);
            }
          });
        }
        
        // 敌人受击效果
        this.tweens.add({
          targets: enemy,
          alpha: 0.5,
          duration: 100,
          yoyo: true
        });
        
        // 击退效果
        const knockbackDistance = 40;
        const knockbackX = enemy.x + Math.cos(angle) * knockbackDistance;
        const knockbackY = enemy.y + Math.sin(angle) * knockbackDistance;
        
        this.tweens.add({
          targets: enemy,
          x: knockbackX,
          y: knockbackY,
          duration: 100,
          ease: 'Power1'
        });
        
        // 显示伤害数字
        const damageText = this.add.text(enemy.x, enemy.y - 20, `-${damage}`, {
        fontSize: '16px',
          fontStyle: 'bold',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 3
        });
        damageText.setOrigin(0.5);
        
        this.tweens.add({
          targets: damageText,
          y: damageText.y - 30,
          alpha: 0,
          duration: 800,
          onComplete: () => {
            damageText.destroy();
          }
        });
        
        // 发出命中事件
        this.gameEvents.emit('enemy-hit', {
          enemyName: enemy.getData('name'),
          damage: damage,
          enemyHealth: newHealth,
          enemyMaxHealth: enemy.getData('maxHealth')
        });
        
        // 检查敌人是否死亡
        if (newHealth <= 0) {
          // 计算获得的经验值
          const enemyLevel = enemy.getData('level') || 1;
          const baseExp = enemyLevel * 15; // 基础经验
          const expGained = Math.floor(baseExp + Math.random() * 10); // 添加随机性
          
          // 添加经验值
          this.playerStats.experience += expGained;
          
          // 检查升级
          this.checkLevelUp(expGained);
          
          // 显示经验获得
          const expText = this.add.text(enemy.x, enemy.y - 40, `+${expGained} EXP`, {
            fontSize: '14px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
          });
          expText.setOrigin(0.5);
          
          this.tweens.add({
            targets: expText,
            y: expText.y - 20,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              expText.destroy();
            }
          });
          
          // 发出击杀事件
          this.gameEvents.emit('enemy-killed', {
            enemyName: enemy.getData('name'),
            enemyLevel: enemy.getData('level'),
            position: { x: enemy.x, y: enemy.y },
            expGained: expGained
          });
          
          // 生成掉落物
          this.createLoot(enemy.x, enemy.y, enemy.getData('type'));
          
          // 清理血条
          if (healthBar) {
            healthBar.destroy();
          }
          
          // 添加死亡效果
          this.tweens.add({
            targets: enemy,
            alpha: 0,
            scale: 0.8,
            duration: 300,
            onComplete: () => {
              enemy.destroy();
              
              // 检查是否所有敌人都被击败
              if (this.enemies.countActive() === 0) {
                this.gameEvents.emit('area-cleared');
              }
            }
          });
        }
      }
    });
    
    // 如果没有命中
    if (hitCount === 0) {
      this.gameEvents.emit('attack-missed');
    }
  }

  private useSkill(skillIndex: number) {
    // 发出使用技能事件
    this.gameEvents.emit('skill-used', {
      skillIndex: skillIndex
    });
    
    // 这里只是模拟技能效果，实际游戏中应该实现完整的技能系统
    this.cameras.main.shake(200, 0.01);
    
    // 添加简单的技能视觉效果
    const player = this.player;
    const angle = this.getPlayerFacing();
    
    // 创建一个圆形效果
    const skillEffect = this.add.graphics();
    skillEffect.fillStyle(0x3498db, 0.6);
    
    // 根据技能索引使用不同的效果
    switch(skillIndex) {
      case 1: // 冰冻效果
        skillEffect.fillStyle(0x3498db, 0.6);
        skillEffect.fillCircle(player.x, player.y, 100);
        
        // 在附近敌人上添加冰冻效果
        this.enemies.getChildren().forEach((enemy: any) => {
          const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
          if (dist < 100) {
            // 减速效果
            enemy.setTint(0xa5f3fc);
            this.tweens.add({
              targets: enemy,
              alpha: 0.7,
              duration: 2000,
              onComplete: () => {
                enemy.clearTint();
                enemy.setAlpha(1);
              }
            });
          }
        });
        break;
        
      case 2: // 火焰效果
        skillEffect.fillStyle(0xe74c3c, 0.6);
        
        // 在玩家前方创建锥形效果
        const fireAngle = angle;
        const startX = player.x;
        const startY = player.y;
        const endX1 = startX + Math.cos(fireAngle - 0.4) * 150;
        const endY1 = startY + Math.sin(fireAngle - 0.4) * 150;
        const endX2 = startX + Math.cos(fireAngle) * 200;
        const endY2 = startY + Math.sin(fireAngle) * 200;
        const endX3 = startX + Math.cos(fireAngle + 0.4) * 150;
        const endY3 = startY + Math.sin(fireAngle + 0.4) * 150;
        
        skillEffect.beginPath();
        skillEffect.moveTo(startX, startY);
        skillEffect.lineTo(endX1, endY1);
        skillEffect.lineTo(endX2, endY2);
        skillEffect.lineTo(endX3, endY3);
        skillEffect.closePath();
        skillEffect.fillPath();
        
        // 检测命中敌人
        this.enemies.getChildren().forEach((enemy: any) => {
          const dist = Phaser.Math.Distance.Between(startX, startY, enemy.x, enemy.y);
          const enemyAngle = Phaser.Math.Angle.Between(startX, startY, enemy.x, enemy.y);
          const angleDiff = Phaser.Math.Angle.Wrap(enemyAngle - fireAngle);
          
          if (dist < 200 && Math.abs(angleDiff) < 0.5) {
            // 造成伤害
            const health = enemy.getData('health');
            const damage = Phaser.Math.Between(15, 25);
            const newHealth = Math.max(0, health - damage);
            enemy.setData('health', newHealth);
            
            // 显示伤害数字
            const damageText = this.add.text(enemy.x, enemy.y - 20, `-${damage}`, {
              fontSize: '16px',
              fontStyle: 'bold',
              color: '#ff0000',
              stroke: '#000000',
              strokeThickness: 3
            });
            damageText.setOrigin(0.5);
            
    this.tweens.add({
              targets: damageText,
              y: damageText.y - 30,
              alpha: 0,
              duration: 800,
      onComplete: () => {
                damageText.destroy();
              }
            });
            
            // 检查敌人是否死亡
            if (newHealth <= 0) {
              // 发出击杀事件
              this.gameEvents.emit('enemy-killed', {
                enemyName: enemy.getData('name'),
                enemyLevel: enemy.getData('level'),
                position: { x: enemy.x, y: enemy.y }
              });
              
              // 添加死亡效果
          this.tweens.add({
                targets: enemy,
            alpha: 0,
                scale: 0.8,
                duration: 300,
            onComplete: () => {
                  enemy.destroy();
                }
              });
            }
          }
        });
        break;
        
      default:
        skillEffect.fillStyle(0xf1c40f, 0.6);
        skillEffect.fillCircle(player.x, player.y, 50);
    }
    
    // 效果消失
    this.tweens.add({
      targets: skillEffect,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        skillEffect.destroy();
      }
    });
  }
  
  private updateEnemies(delta: number) {
    this.enemies.getChildren().forEach((enemyObj) => {
      const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
      
      // 如果敌人已死亡，跳过
      if (enemy.getData('health') <= 0) return;
      
      // 更新血条位置
      const healthBar = enemy.getData('healthBar');
      if (healthBar && healthBar.visible) {
        this.updateEnemyHealthBar(enemy);
      }
      
      // 更新攻击冷却
      let cooldown = enemy.getData('attackCooldown') || 0;
      if (cooldown > 0) {
        cooldown -= delta;
        enemy.setData('attackCooldown', cooldown);
      }
      
      // 计算与玩家的距离
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );
      
      // 设置追逐和攻击行为
      const aggroRange = 250;
      const attackRange = 50;
      
      if (distance < aggroRange) {
        if (distance < attackRange) {
          // 在攻击范围内
          enemy.setVelocity(0, 0);
          
          // 攻击玩家
          if (cooldown <= 0) {
            const damage = enemy.getData('damage') || 5;
            
            // 发出事件
            this.gameEvents.emit('player-hit', {
              enemyName: enemy.getData('name'),
              damage: damage
            });
            
            // 设置冷却
            enemy.setData('attackCooldown', 1500);
            
            // 相机震动
            this.cameras.main.shake(100, 0.01);
            
            // 玩家受击效果
            this.tweens.add({
              targets: this.player,
              alpha: 0.5,
              duration: 100,
              yoyo: true
            });
          }
        } else {
          // 追逐玩家
          const angle = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
          );
          
          const speed = 80;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          
          enemy.setVelocity(vx, vy);
          
          // 设置面向
          if (vx < 0) {
            enemy.flipX = true;
          } else {
            enemy.flipX = false;
          }
        }
      } else {
        // 随机漫步
        if (Phaser.Math.Between(0, 100) < 1) {
          const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const speed = 40;
          enemy.setVelocity(
            Math.cos(randomAngle) * speed,
            Math.sin(randomAngle) * speed
          );
          
          // 设置面向
          if (Math.cos(randomAngle) < 0) {
            enemy.flipX = true;
          } else {
            enemy.flipX = false;
          }
        }
      }
    });
  }

  private handlePlayerEnemyCollision(player: any, enemy: any) {
    // 碰撞推开效果
    const pushFactor = 0.5;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const pushX = (dx / distance) * pushFactor;
      const pushY = (dy / distance) * pushFactor;
      
      player.x += pushX;
      player.y += pushY;
      enemy.x -= pushX;
      enemy.y -= pushY;
    }
  }

  private createLoot(x: number, y: number, enemyType: string) {
    const dropRand = Math.random();
    
    if (dropRand < 0.4) {
      // 40% 概率掉落金币
      this.createGoldDrop(x, y);
    } else if (dropRand < 0.6) {
      // 20% 概率掉落装备
      this.createEquipmentDrop(x, y);
    } else if (dropRand < 0.85) {
      // 25% 概率掉落通货
      this.createCurrencyDrop(x, y);
    }
    // 15% 概率什么都不掉落
  }
  
  private createGoldDrop(x: number, y: number) {
    // 创建金币掉落效果
    const gold = this.add.graphics();
    gold.fillStyle(0xf1c40f, 1);
    gold.fillCircle(0, 0, 5);
    gold.lineStyle(1, 0xe67e22, 1);
    gold.strokeCircle(0, 0, 5);
    
    // 转为纹理
    gold.generateTexture('gold', 10, 10);
    gold.destroy();
    
    // 创建金币图像
    const coinCount = Phaser.Math.Between(1, 3);
    
    for (let i = 0; i < coinCount; i++) {
      const coin = this.add.image(
        x + Phaser.Math.Between(-10, 10),
        y + Phaser.Math.Between(-10, 10),
        'gold'
      );
      
      // 添加动画效果
      this.tweens.add({
        targets: coin,
        y: coin.y - Phaser.Math.Between(10, 20),
        alpha: 0.8,
        duration: 300,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: coin,
            alpha: 0,
            duration: 1500,
            delay: 1000,
            onComplete: () => {
              coin.destroy();
            }
          });
        }
      });
    }
    
    // 添加金币到玩家账户
    this.addGold(coinCount);
  }
  
  private createEquipmentDrop(x: number, y: number) {
    // 创建装备掉落
    const equipmentTypes = ['⚔️', '🛡️', '🪖', '👕', '👢'];
    const icon = Phaser.Utils.Array.GetRandom(equipmentTypes);
    
    const equipment = this.add.text(x, y, icon, {
      fontSize: '24px'
    }).setOrigin(0.5);
    
    // 品质颜色
    const qualityRand = Math.random();
    let color = '#ffffff'; // 普通
    if (qualityRand < 0.05) color = '#ff6b35'; // 传说
    else if (qualityRand < 0.15) color = '#9b59b6'; // 史诗
    else if (qualityRand < 0.35) color = '#3498db'; // 稀有
    else if (qualityRand < 0.65) color = '#2ecc71'; // 魔法
    
    equipment.setColor(color);
    
    // 掉落动画
    this.tweens.add({
      targets: equipment,
      y: equipment.y - 10,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: equipment,
          alpha: 0,
          duration: 2000,
          delay: 2000,
          onComplete: () => {
            equipment.destroy();
          }
        });
      }
    });
  }
  
  private createCurrencyDrop(x: number, y: number) {
    // 通货掉落表
    const currencyDrops = [
      { icon: '📜', name: '鉴定卷轴', weight: 40 },
      { icon: '🌀', name: '传送卷轴', weight: 30 },
      { icon: '🔵', name: '蜕变宝珠', weight: 15 },
      { icon: '🟦', name: '改造宝珠', weight: 10 },
      { icon: '🔧', name: '磨刀石', weight: 20 },
      { icon: '🛠️', name: '盔甲片', weight: 20 },
      { icon: '🟨', name: '混沌宝珠', weight: 3 },
      { icon: '🟩', name: '崇高宝珠', weight: 1 },
      { icon: '💚', name: '贪婪精髓', weight: 2 }
    ];
    
    // 加权随机选择
    const totalWeight = currencyDrops.reduce((sum, item) => sum + item.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    
    let selectedCurrency = currencyDrops[0];
    for (const currency of currencyDrops) {
      randomWeight -= currency.weight;
      if (randomWeight <= 0) {
        selectedCurrency = currency;
        break;
      }
    }
    
    // 创建通货图标
    const currencyIcon = this.add.text(x, y, selectedCurrency.icon, {
      fontSize: '20px'
    }).setOrigin(0.5);
    
    // 发光效果
    const glow = this.add.circle(x, y, 25, 0xffffff, 0.2);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.2, to: 0.6 },
      duration: 1000,
      yoyo: true,
      repeat: 3
    });
    
    // 掉落动画
    this.tweens.add({
      targets: currencyIcon,
      y: currencyIcon.y - 15,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [currencyIcon, glow],
          alpha: 0,
          duration: 2000,
          delay: 3000,
          onComplete: () => {
            currencyIcon.destroy();
            glow.destroy();
          }
        });
      }
    });
    
    // 显示获得提示
    const gainText = this.add.text(x, y - 40, `获得: ${selectedCurrency.name}`, {
      fontSize: '12px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: gainText,
      y: gainText.y - 20,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        gainText.destroy();
      }
    });
  }

  private getMonsterName(monsterType: string): string {
    // 返回怪物的显示名称
    const monsterNames: Record<string, string> = {
      'slime': '史莱姆',
      'rat': '巨鼠',
      'zombie': '僵尸',
      'wolf': '野狼',
      'skeleton': '骷髅',
      'spider': '大蜘蛛',
      'goblin': '地精',
      'bandit': '强盗'
    };
    
    return monsterNames[monsterType] || monsterType;
  }
  
  private getPlayerFacing(): number {
    // 根据玩家朝向计算角度
    if (this.player.flipX) {
      return Math.PI; // 朝左
    } else {
      return 0; // 朝右
    }
  }

  // 公开事件发射器
  public getEventEmitter(): Phaser.Events.EventEmitter {
    return this.gameEvents;
  }

  // 玩家受伤处理
  private onPlayerHit(data: any) {
    // 如果玩家已死亡，不再处理伤害
    if (this.isDead) return;
    
    // 计算伤害
    const damage = data.damage || 5;
    
    // 减少玩家生命值
    this.playerHealth = Math.max(0, this.playerHealth - damage);
    
    // 更新血条
    this.updateHealthBar();
    
    // 更新属性窗口(如果打开)
    if (this.activeWindow === 'stats') {
      this.statsWindow.setHealth(this.playerHealth, this.playerMaxHealth);
    }
    
    // 显示伤害数字
    const damageText = this.add.text(this.player.x, this.player.y - 30, `-${damage}`, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });
    damageText.setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        damageText.destroy();
      }
    });
    
    // 检查玩家是否死亡
    if (this.playerHealth <= 0) {
      this.playerDeath();
    }
  }
  
  // 添加金币
  private addGold(amount: number) {
    this.playerGold += amount;
    
    // 更新UI
    if (this.goldText) {
      this.goldText.setText(`金币: ${this.playerGold}`);
    }
    
    // 更新属性窗口(如果打开)
    if (this.activeWindow === 'stats') {
      this.statsWindow.setGold(this.playerGold);
    }
  }

  // 添加回城方法
  private returnToTown() {
    // 保存数据
    this.savePlayerData();
    
    // 显示回城效果
    const portalEffect = this.add.graphics();
    portalEffect.fillStyle(0x3498db, 0.7);
    portalEffect.fillCircle(this.player.x, this.player.y, 50);
    
    // 添加文字提示
    const teleportText = this.add.text(this.player.x, this.player.y - 50, '正在回城...', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    teleportText.setOrigin(0.5);
    
    // 播放动画效果
    this.tweens.add({
      targets: [portalEffect, teleportText],
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      onComplete: () => {
        portalEffect.destroy();
        teleportText.destroy();
        
        // 切换到城镇场景
        this.scene.start('TownScene', {
          gold: this.playerGold,
          fromGame: true
        });
      }
    });
  }

  // 保存玩家数据到localStorage
  private savePlayerData() {
    try {
      const playerData = {
        skills: this.skills,
        availableSkillPoints: this.availableSkillPoints,
        talents: this.talents,
        availableTalentPoints: this.availableTalentPoints,
        playerStats: this.playerStats,
        inventory: this.inventory,
        playerGold: this.playerGold,
        playerHealth: this.playerHealth,
        playerMaxHealth: this.playerMaxHealth,
        timestamp: Date.now()
      };
      localStorage.setItem('poe_player_data', JSON.stringify(playerData));
      console.log('玩家数据已保存，技能点:', this.availableSkillPoints);
    } catch (error) {
      console.error('保存玩家数据失败:', error);
    }
  }

  // 从localStorage加载玩家数据
  private loadPlayerData() {
    try {
      const savedData = localStorage.getItem('poe_player_data');
      if (savedData) {
        const playerData = JSON.parse(savedData);
        
        // 恢复技能数据
        if (playerData.skills && playerData.skills.length > 0) {
          this.skills = playerData.skills;
          console.log('恢复技能数据:', this.skills.length, '个技能');
        }
        if (playerData.availableSkillPoints !== undefined) {
          this.availableSkillPoints = playerData.availableSkillPoints;
          console.log('恢复技能点:', this.availableSkillPoints);
        }
        
        // 恢复天赋数据
        if (playerData.talents && playerData.talents.length > 0) {
          this.talents = playerData.talents;
        }
        if (playerData.availableTalentPoints !== undefined) {
          this.availableTalentPoints = playerData.availableTalentPoints;
        }
        
        // 恢复其他数据
        if (playerData.playerStats) {
          this.playerStats = { ...this.playerStats, ...playerData.playerStats };
        }
        if (playerData.inventory) {
          this.inventory = playerData.inventory;
        }
        if (playerData.playerGold !== undefined) {
          this.playerGold = playerData.playerGold;
        }
        if (playerData.playerHealth !== undefined) {
          this.playerHealth = playerData.playerHealth;
        }
        if (playerData.playerMaxHealth !== undefined) {
          this.playerMaxHealth = playerData.playerMaxHealth;
        }
        
        console.log('==== GameScene成功加载保存的数据 ====');
        console.log('最后保存时间:', new Date(playerData.timestamp || 0).toLocaleString());
        console.log('技能数量:', this.skills.length);
        console.log('可用技能点:', this.availableSkillPoints);
      } else {
        console.log('没有找到保存的数据，使用默认值');
      }
    } catch (error) {
      console.error('加载玩家数据失败:', error);
    }
  }

  // 刷新UI显示
  private refreshUI() {
    // 使用POE风格UI更新血量显示
    this.updateHealthBar();
    
    // 更新金币显示
    if (this.goldText) {
      this.goldText.setText(`金币: ${this.playerGold}`);
    }
    
    // 更新药水槽显示
    this.updatePotionSlotsUI();
  }

  // 更新药水槽UI显示
  private updatePotionSlotsUI() {
    if (!this.potionSlotTexts || this.potionSlotTexts.length === 0) {
      return; // 如果药水槽文本数组未初始化，直接返回
    }
    
    for (let i = 0; i < this.potionSlots.length; i++) {
      const slot = this.potionSlots[i];
      if (this.potionSlotTexts[i]) {
        if (slot.potion && slot.quantity > 0) {
          this.potionSlotTexts[i].setText(`${slot.quantity}`);
          this.potionSlotTexts[i].setColor('#ffffff');
        } else {
          this.potionSlotTexts[i].setText('');
        }
      }
    }
  }

  // 显示数据摘要
  private showDataSummary() {
    const summary = gameStore.getDataSummary();
    console.log('📊 游戏数据摘要:');
    console.table(summary);
    
    // 在屏幕上显示摘要
    const summaryText = `
等级: ${summary.playerLevel}
血量: ${summary.health}
金币: ${summary.gold}
技能点: ${summary.skillPoints}
天赋点: ${summary.talentPoints}
背包: ${summary.inventoryCount}/20
升华: ${summary.ascendancy}
    `;
    
    const display = this.add.text(400, 300, summaryText, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 15 },
      align: 'left'
    }).setOrigin(0.5);
    
    // 3秒后移除
    this.time.delayedCall(3000, () => display.destroy());
  }
  
  // 模拟战斗
  private simulateCombat() {
    console.log('⚔️ 开始模拟战斗...');
    
    // 玩家受到伤害
    const damage = Phaser.Math.Between(10, 25);
    gameStore.damagePlayer(damage);
    console.log(`💥 玩家受到 ${damage} 点伤害`);
    
    // 检查是否死亡
    const player = gameStore.getPlayer();
    if (player.health <= 0) {
      console.log('💀 玩家死亡！');
      // 复活玩家
      gameStore.updateHealth(50);
      console.log('✨ 玩家复活，血量恢复到50');
    }
    
    // 战斗胜利奖励
    const exp = Phaser.Math.Between(20, 50);
    const gold = Phaser.Math.Between(10, 30);
    gameStore.processCombatReward(exp, gold);
    
    console.log(`🏆 战斗胜利！获得 ${exp} 经验和 ${gold} 金币`);
    this.refreshUI();
  }
  
  // 使用药剂
  private usePotion() {
    const healAmount = Phaser.Math.Between(15, 35);
    gameStore.healPlayer(healAmount);
    
    console.log(`💊 使用药剂，恢复 ${healAmount} 点生命`);
    
    // 显示治疗效果
    const text = this.add.text(this.player.x, this.player.y - 50, `+${healAmount}`, {
      fontSize: '20px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
    
    this.refreshUI();
  }

  // 检查升级
  private checkLevelUp(expGained: number) {
    const currentLevel = this.playerStats.level;
    let nextLevelExp = this.playerStats.nextLevelExp;
    
    // 检查是否达到升级条件
    while (this.playerStats.experience >= nextLevelExp) {
      // 升级！
      this.playerStats.level += 1;
      this.playerStats.experience -= nextLevelExp;
      
      // 计算下一级所需经验(每级递增)
      this.playerStats.nextLevelExp = Math.floor(100 * Math.pow(1.2, this.playerStats.level - 1));
      nextLevelExp = this.playerStats.nextLevelExp;
      
      // 升级奖励
      this.playerStats.strength += 2;
      this.playerStats.dexterity += 1;
      this.playerStats.intelligence += 1;
      this.playerStats.vitality += 3;
      
      // 增加生命值上限和当前生命值
      const healthIncrease = 20;
      this.playerMaxHealth += healthIncrease;
      this.playerHealth += healthIncrease;
      
      // 给予技能点和天赋点
      this.availableSkillPoints += 1;
      this.availableTalentPoints += 1;
      
      // 更新技能学习系统的玩家等级
      // if (this.skillLearningSystem) {
      //   this.skillLearningSystem.setPlayerLevel(this.playerStats.level);
      // }
      
      // 显示升级效果
      this.showLevelUpEffect();
      
      console.log(`🎉 升级到 ${this.playerStats.level} 级！`);
      console.log(`获得: +2力量, +1敏捷, +1智力, +3体力, +${healthIncrease}生命, +1技能点, +1天赋点`);
    }
    
    // 更新UI
    this.refreshUI();
  }

  // 显示升级特效
  private showLevelUpEffect() {
    // 创建升级文字
    const levelUpText = this.add.text(this.player.x, this.player.y - 50, `升级！`, {
      fontSize: '24px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    });
    levelUpText.setOrigin(0.5);
    
    // 创建光芒效果
    const levelUpGlow = this.add.circle(this.player.x, this.player.y, 100, 0xffd700, 0.3);
    
    // 动画效果
    this.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 30,
      alpha: 0,
      scale: 1.5,
      duration: 2000,
      onComplete: () => {
        levelUpText.destroy();
      }
    });
    
    this.tweens.add({
      targets: levelUpGlow,
      scale: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        levelUpGlow.destroy();
      }
    });
    
    // 屏幕震动
    this.cameras.main.shake(500, 0.01);
  }

  // 处理敌人死亡
  private handleEnemyDeath(enemy: Phaser.Physics.Arcade.Sprite) {
    // 计算获得的经验值
    const enemyLevel = enemy.getData('level') || 1;
    const baseExp = enemyLevel * 15; // 基础经验
    const expGained = Math.floor(baseExp + Math.random() * 10); // 添加随机性
    
    // 添加经验值
    this.playerStats.experience += expGained;
    
    // 检查升级
    this.checkLevelUp(expGained);
    
    // 显示经验获得
    const expText = this.add.text(enemy.x, enemy.y - 40, `+${expGained} EXP`, {
      fontSize: '14px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    expText.setOrigin(0.5);
    
    this.tweens.add({
      targets: expText,
      y: expText.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        expText.destroy();
      }
    });
    
    // 发出击杀事件
    this.gameEvents.emit('enemy-killed', {
      enemyName: enemy.getData('name'),
      enemyLevel: enemy.getData('level'),
      position: { x: enemy.x, y: enemy.y },
      expGained: expGained
    });
    
    // 生成掉落物
    this.createLoot(enemy.x, enemy.y, enemy.getData('type'));
    
    // 清理血条
    const healthBar = enemy.getData('healthBar');
    if (healthBar) {
      healthBar.destroy();
    }
    
    // 添加死亡效果
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      scale: 0.8,
      duration: 300,
      onComplete: () => {
        enemy.destroy();
        
        // 检查是否所有敌人都被击败
        if (this.enemies.countActive() === 0) {
          this.gameEvents.emit('area-cleared');
        }
      }
    });
  }

  // 切换正义之火状态（一次激活，持续生效）
  private toggleRighteousFire() {
    if (this.combatManager) {
      const isActive = this.combatManager.toggleRighteousFire();
      const statusText = isActive ? '激活' : '关闭';
      console.log(`正义之火已${statusText}`);
      
      // 显示状态提示
      const messageText = this.add.text(this.player.x, this.player.y - 60, `正义之火 ${statusText}`, {
        fontSize: '18px',
        color: isActive ? '#ff4400' : '#888888',
        stroke: '#000000',
        strokeThickness: 2,
        fontStyle: 'bold'
      });
      messageText.setOrigin(0.5);
      
      this.tweens.add({
        targets: messageText,
        y: messageText.y - 30,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          messageText.destroy();
        }
      });
    }
  }

  // 使用技能槽
  private useSkillSlot(slotIndex: number) {
    const currentTime = Date.now();
    const slot = this.skillSlots[slotIndex];
    
    if (!slot.skill) {
      console.log(`技能槽 ${slotIndex + 1} 为空`);
      return;
    }
    
    // 检查冷却时间
    if (currentTime - slot.lastUsed < slot.cooldown) {
      const remainingCooldown = Math.ceil((slot.cooldown - (currentTime - slot.lastUsed)) / 1000);
      console.log(`技能槽 ${slotIndex + 1} 冷却中，还有 ${remainingCooldown} 秒`);
      return;
    }
    
    // 使用技能
    console.log(`使用技能槽 ${slotIndex + 1}: ${slot.skill.name}`);
    
    // 根据技能类型执行不同效果
    this.executeSkillEffect(slot.skill, slotIndex);
    
    // 更新最后使用时间
    slot.lastUsed = currentTime;
    
    // 显示技能使用效果
    this.showSkillUsedEffect(slotIndex);
  }

  // 执行技能效果
  private executeSkillEffect(skill: any, slotIndex: number) {
    const skillId = skill.id;
    
    switch (skillId) {
      case 'righteous_fire':
        this.toggleRighteousFire();
        break;
        
      case 'heavy_strike':
        this.executeHeavyStrike();
        break;
        
      case 'cleave':
        this.executeCleave();
        break;
        
      case 'fire_nova':
        this.executeFireNova();
        break;
        
      case 'burning_ground':
        this.executeBurningGround();
        break;
        
      default:
        console.log(`技能 ${skillId} 的效果尚未实现`);
        this.executeBasicSkillEffect(skill);
    }
  }

  // 执行重击技能
  private executeHeavyStrike() {
    const range = 100;
    const damage = 35;
    
    // 创建重击效果
    const effect = this.add.graphics();
    effect.fillStyle(0xffaa00, 0.7);
    effect.fillCircle(this.player.x, this.player.y, range);
    
    // 检测范围内敌人
    this.enemies.children.getArray().forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance <= range) {
        this.damageEnemy(enemy, damage, '重击');
      }
    });
    
    // 效果消失
    this.tweens.add({
      targets: effect,
      alpha: 0,
      duration: 500,
      onComplete: () => effect.destroy()
    });
  }

  // 执行劈砍技能
  private executeCleave() {
    const range = 120;
    const angle = this.getPlayerFacing();
    const damage = 25;
    
    // 创建扇形攻击效果
    const effect = this.add.graphics();
    effect.fillStyle(0xff6600, 0.6);
    
    // 绘制扇形
    effect.beginPath();
    effect.moveTo(this.player.x, this.player.y);
    effect.arc(this.player.x, this.player.y, range, angle - Math.PI/4, angle + Math.PI/4);
    effect.closePath();
    effect.fillPath();
    
    // 检测扇形内敌人
    this.enemies.children.getArray().forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance <= range) {
        const enemyAngle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y,
          enemy.x, enemy.y
        );
        
        const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(enemyAngle - angle));
        
        if (angleDiff <= Math.PI/4) {
          this.damageEnemy(enemy, damage, '劈砍');
        }
      }
    });
    
    // 效果消失
    this.tweens.add({
      targets: effect,
      alpha: 0,
      duration: 400,
      onComplete: () => effect.destroy()
    });
  }

  // 执行火焰新星技能
  private executeFireNova() {
    const maxRadius = 200;
    const damage = 40;
    
    // 创建扩散火环效果
    const effect = this.add.graphics();
    effect.lineStyle(8, 0xff4400, 0.8);
    
    let currentRadius = 20;
    
    const expandTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        effect.clear();
        effect.lineStyle(8, 0xff4400, 0.8);
        effect.strokeCircle(this.player.x, this.player.y, currentRadius);
        
        // 检测当前半径的敌人
        this.enemies.children.getArray().forEach((enemy: any) => {
          const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            enemy.x, enemy.y
          );
          
          if (Math.abs(distance - currentRadius) <= 30) {
            this.damageEnemy(enemy, damage, '火焰新星');
          }
        });
        
        currentRadius += 20;
        
        if (currentRadius > maxRadius) {
          expandTimer.destroy();
          this.tweens.add({
            targets: effect,
            alpha: 0,
            duration: 300,
            onComplete: () => effect.destroy()
          });
        }
      },
      repeat: -1
    });
  }

  // 执行燃烧地面技能
  private executeBurningGround() {
    // 获取鼠标位置作为目标点
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    
    const radius = 80;
    const duration = 5000;
    const tickDamage = 8;
    
    // 创建燃烧地面效果
    const effect = this.add.graphics();
    effect.fillStyle(0xff2200, 0.4);
    effect.fillCircle(worldPoint.x, worldPoint.y, radius);
    
    // 持续伤害计时器
    const damageTimer = this.time.addEvent({
      delay: 500,
      callback: () => {
        this.enemies.children.getArray().forEach((enemy: any) => {
          const distance = Phaser.Math.Distance.Between(
            worldPoint.x, worldPoint.y,
            enemy.x, enemy.y
          );
          
          if (distance <= radius) {
            this.damageEnemy(enemy, tickDamage, '燃烧地面');
          }
        });
      },
      repeat: Math.floor(duration / 500) - 1
    });
    
    // 效果结束
    this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: effect,
        alpha: 0,
        duration: 500,
        onComplete: () => effect.destroy()
      });
    });
  }

  // 通用敌人伤害处理
  private damageEnemy(enemy: any, damage: number, skillName: string) {
    if (enemy.takeDamage) {
      enemy.takeDamage(damage);
    } else {
      // 如果敌人没有takeDamage方法，直接处理血量
      const currentHealth = enemy.getData('health') || 0;
      const newHealth = Math.max(0, currentHealth - damage);
      enemy.setData('health', newHealth);
      
      if (newHealth <= 0) {
        this.handleEnemyDeath(enemy);
      }
    }
    
    // 显示伤害数字
    this.createDamageText(enemy.x, enemy.y, damage, skillName);
  }

  // 创建伤害文字
  private createDamageText(x: number, y: number, damage: number, skillName: string) {
    const damageText = this.add.text(x, y - 20, `-${damage}`, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ff4400',
      stroke: '#000000',
      strokeThickness: 3
    });
    damageText.setOrigin(0.5);
    
    // 技能名称文字
    const skillText = this.add.text(x, y - 40, skillName, {
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    skillText.setOrigin(0.5);
    
    this.tweens.add({
      targets: [damageText, skillText],
      y: y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        damageText.destroy();
        skillText.destroy();
      }
    });
  }

  // 基础技能效果（作为后备）
  private executeBasicSkillEffect(skill: any) {
    const damage = skill.damage || 15;
    const range = 80;
    
    // 简单的圆形AOE效果
    const effect = this.add.graphics();
    effect.fillStyle(0x3498db, 0.5);
    effect.fillCircle(this.player.x, this.player.y, range);
    
    // 对范围内敌人造成伤害
    this.enemies.children.getArray().forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance <= range) {
        this.damageEnemy(enemy, damage, skill.name);
      }
    });
    
    // 效果消失
    this.tweens.add({
      targets: effect,
      alpha: 0,
      duration: 600,
      onComplete: () => effect.destroy()
    });
  }

  // 使用药水槽
  private usePotionSlot(slotIndex: number) {
    const currentTime = Date.now();
    const slot = this.potionSlots[slotIndex];
    
    if (!slot.potion || slot.quantity <= 0) {
      console.log(`药水槽 ${slotIndex + 1} 为空或数量不足`);
      return;
    }
    
    // 检查冷却时间
    if (currentTime - slot.lastUsed < slot.cooldown) {
      const remainingCooldown = Math.ceil((slot.cooldown - (currentTime - slot.lastUsed)) / 1000);
      console.log(`药水槽 ${slotIndex + 1} 冷却中，还有 ${remainingCooldown} 秒`);
      return;
    }
    
    // 使用药水
    console.log(`使用药水槽 ${slotIndex + 1}: ${slot.potion.name}`);
    
    // 根据药水类型执行效果
    if (slot.potion.type === 'health') {
      const healAmount = slot.potion.healAmount || 50;
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + healAmount);
      this.showHealEffect(healAmount);
    } else if (slot.potion.type === 'mana') {
      // 魔力药水逻辑
      console.log('使用魔力药水');
    }
    
    // 消耗药水
    slot.quantity -= 1;
    slot.lastUsed = currentTime;
    
    // 更新UI
    this.refreshUI();
  }
  
  // 显示技能使用效果
  private showSkillUsedEffect(slotIndex: number) {
    const keyNames = ['Q', 'E', 'R', 'T'];
    const effectText = this.add.text(this.player.x, this.player.y - 40, `${keyNames[slotIndex]} 技能释放`, {
      fontSize: '14px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    effectText.setOrigin(0.5);
    
    this.tweens.add({
      targets: effectText,
      y: effectText.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        effectText.destroy();
      }
    });
  }
  
  // 显示治疗效果
  private showHealEffect(healAmount: number) {
    const healText = this.add.text(this.player.x, this.player.y - 40, `+${healAmount} HP`, {
      fontSize: '16px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    healText.setOrigin(0.5);
    
    this.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        healText.destroy();
      }
    });
  }

  // 检查地图边界
  private checkMapBounds() {
    // 限制玩家在地图边界内
    if (this.player.x < this.mapBounds.x) {
      this.player.x = this.mapBounds.x;
    } else if (this.player.x > this.mapBounds.x + this.mapBounds.width) {
      this.player.x = this.mapBounds.x + this.mapBounds.width;
    }
    
    if (this.player.y < this.mapBounds.y) {
      this.player.y = this.mapBounds.y;
    } else if (this.player.y > this.mapBounds.y + this.mapBounds.height) {
      this.player.y = this.mapBounds.y + this.mapBounds.height;
    }
  }

  // 初始化默认技能和药水
  private initializeDefaultSkillsAndPotions() {
    // 技能槽默认为空，让玩家自己配置
    // Q、E、R、T技能槽都初始化为空
    
    // 只设置默认生命药水
    this.potionSlots[0] = {
      potion: {
        id: 'health_potion',
        name: '生命药水',
        type: 'health',
        healAmount: 50
      },
      quantity: 5,
      cooldown: 3000, // 3秒冷却
      lastUsed: 0
    };
    
    this.potionSlots[1] = {
      potion: {
        id: 'health_potion_greater',
        name: '强效生命药水',
        type: 'health',
        healAmount: 100
      },
      quantity: 3,
      cooldown: 3000,
      lastUsed: 0
    };
    
    console.log('已初始化默认药水，技能槽为空');
  }

  // 更新血量条
  private updateHealthBar() {
    if (this.healthBar && this.healthText) {
      // 更新POE风格血量球
      this.healthBar.clear();
      
      const percentage = this.playerHealth / this.playerMaxHealth;
      const radius = 30;
      
      // 绘制血量填充（从底部开始的扇形）
      if (percentage > 0) {
        this.healthBar.fillStyle(0xff0000, 0.8);
        this.healthBar.beginPath();
        this.healthBar.moveTo(0, 0);
        this.healthBar.arc(0, 0, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * percentage), false);
        this.healthBar.closePath();
        this.healthBar.fillPath();
      }
      
      this.healthText.setText(`${this.playerHealth}/${this.playerMaxHealth}`);
    }
  }

  // 初始化增强的技能系统
  private initializeAdvancedSkillSystem() {
    console.log('🚀 开始初始化增强技能系统...');
    
    try {
      // 初始化技能管理器
      console.log('正在创建SkillManager...');
      this.skillManager = new SkillManager(this, this.player);
      console.log('✅ SkillManager创建成功');
      
      // 初始化技能学习系统 - 暂时注释掉
      // console.log('正在创建SkillLearningSystem...');
      // this.skillLearningSystem = new SkillLearningSystem(this.skillManager, this);
      // console.log('✅ SkillLearningSystem创建成功');
      
      // 设置玩家等级（触发技能点奖励）
      console.log(`设置玩家等级: ${this.playerStats.level}`);
      // this.skillLearningSystem.setPlayerLevel(this.playerStats.level);
      
      // 学习一些基础技能用于演示
      console.log('学习基础技能...');
      // this.skillLearningSystem.learnSkill('ancestral_call');
      // this.skillLearningSystem.learnSkill('intimidating_shout');
      
      // 装备技能到技能槽
      console.log('装备技能到技能槽...');
      // this.skillManager.equipSkill('ground_slam', 0);      // Q槽 - 起始技能
      // this.skillManager.equipSkill('ancestral_call', 1);   // E槽
      // this.skillManager.equipSkill('intimidating_shout', 2); // R槽
      
      console.log('🔥 野蛮人技能系统初始化完成！');
      // console.log(`可用技能点: ${this.skillLearningSystem.getAvailableSkillPoints()}`);
      // console.log(`可学习技能数量: ${this.skillLearningSystem.getAvailableSkills().length}`);
      
      // 监听技能使用事件
      this.skillManager.on('skillUsed', (skillId: string, target: { x: number, y: number }) => {
        console.log(`技能 ${skillId} 已使用，目标: (${target.x}, ${target.y})`);
        
        // 使用技能获得经验 - 暂时注释掉
        // this.skillLearningSystem.gainSkillExperience(skillId, 10);
      });
      
    } catch (error) {
      console.error('❌ 技能系统初始化失败:', error);
      this.skillManager = null as any;
      // this.skillLearningSystem = null as any;
    }
  }

  // 使用增强的技能槽系统
  private useAdvancedSkillSlot(slotIndex: number) {
    // 使用新技能系统
    if (this.newSkillSystem) {
      // 获取鼠标世界坐标作为技能目标
      const pointer = this.input.activePointer;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      
      // 预定义的技能映射到技能槽
      const skillMap = ['basic_attack', 'heavy_strike', 'fireball', 'life_aura'];
      const skillId = skillMap[slotIndex];
      
      if (skillId) {
        const success = this.newSkillSystem.useSkill(skillId, worldPoint.x, worldPoint.y);
        if (success) {
          console.log(`使用技能: ${skillId}`);
        } else {
          console.log(`技能 ${skillId} 使用失败`);
        }
      }
      return;
    }

    // 兼容旧系统
    if (!this.skillManager) {
      console.warn('技能系统未初始化');
      return;
    }

    // 获取鼠标世界坐标作为技能目标
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    
    // 使用技能管理器执行技能
    const success = this.skillManager.useSkill(slotIndex, worldPoint.x, worldPoint.y);
    
    if (success) {
      console.log(`使用技能槽 ${slotIndex + 1} 成功`);
    } else {
      console.log(`使用技能槽 ${slotIndex + 1} 失败`);
    }
  }
} 