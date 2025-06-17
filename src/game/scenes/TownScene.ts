import Phaser from 'phaser';
import StatsWindow from '../ui/StatsWindow';
import InventoryWindow from '../ui/InventoryWindow';
import StorageWindow from '../ui/StorageWindow';
import { SkillTreeWindow } from '../ui/SkillTreeWindow';
import { CharacterClass } from '../../types/character';
import { CombatManager, SpecializationType } from '../managers/CombatManager';
import { CurrencyType } from '../../types/currency';
import { PlayerLevelSystem } from '../systems/player/PlayerLevelSystem';
import { TalentManager } from '../systems/talents/TalentManager';
import { SkillManager } from '../systems/skills/SkillManager';
import { SkillLearningSystem } from '../systems/skills/SkillLearningSystem';

export default class TownScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  // 界面按键
  private keyC!: Phaser.Input.Keyboard.Key; // 角色属性
  private keyI!: Phaser.Input.Keyboard.Key; // 背包
  private keyP!: Phaser.Input.Keyboard.Key; // 技能天赋
  private keyEsc!: Phaser.Input.Keyboard.Key; // ESC关闭窗口
  // UI窗口
  private statsWindow!: StatsWindow;
  private inventoryWindow!: InventoryWindow;
  private storageWindow!: StorageWindow;
  private skillsWindow!: SkillTreeWindow;
  private activeWindow: string | null = null;
  private npcs: Phaser.Physics.Arcade.Group;
  private portal!: Phaser.GameObjects.Sprite;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private playerGold: number = 0;
  private shopOpen: boolean = false;
  private shopMenu: Phaser.GameObjects.Container;
  private shopItems: any[] = [
    { id: 'healthPotion', name: '生命药水', price: 10, description: '恢复30点生命值' },
    { id: 'sword', name: '铁剑', price: 50, description: '增加10点攻击力' },
    { id: 'armor', name: '皮甲', price: 40, description: '增加15点防御' },
    { id: 'amulet', name: '护身符', price: 100, description: '增加5%暴击率' }
  ];
  private playerData: any;
  private gold: number = 0;
  // 角色属性
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
  
  // 战斗系统
  private combatManager!: CombatManager;
  private enemies!: Phaser.Physics.Arcade.Group;
  private currentSpecialization: SpecializationType | null = null;
  
  // 等级系统
  private playerLevelSystem!: PlayerLevelSystem;
  
  // 技能系统
  private skillManager!: SkillManager;
  private skillLearningSystem!: SkillLearningSystem;
  
  // 地图边界
  private mapBounds = {
    x: 0,
    y: 0,
    width: 1200,
    height: 900
  };

  constructor() {
    super('TownScene');
    this.npcs = {} as Phaser.Physics.Arcade.Group;
    this.shopMenu = {} as Phaser.GameObjects.Container;
  }

  // 加载玩家数据
  private loadPlayerData(): void {
    try {
      const savedData = localStorage.getItem('pathOfExilePlayerData');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('加载保存的玩家数据:', data);
        
        // 恢复玩家属性
        if (data.playerStats) {
          this.playerStats = { ...this.playerStats, ...data.playerStats };
        }
        
        // 恢复金币
        if (data.gold !== undefined) {
          this.gold = data.gold;
          this.playerGold = data.gold;
        }
        
        // 恢复背包
        if (data.inventory) {
          this.inventory = data.inventory;
        }
        
        // 恢复技能
        if (data.skills) {
          this.skills = data.skills;
        }
        
        // 恢复技能点
        if (data.availableSkillPoints !== undefined) {
          this.availableSkillPoints = data.availableSkillPoints;
        }
        
        // 恢复天赋
        if (data.talents) {
          this.talents = data.talents;
        }
        
        // 恢复天赋点
        if (data.availableTalentPoints !== undefined) {
          this.availableTalentPoints = data.availableTalentPoints;
        }
        
        // 恢复玩家数据
        if (data.playerData) {
          this.playerData = data.playerData;
        }
      }
    } catch (error) {
      console.error('加载玩家数据失败:', error);
    }
  }

  init(data: any) {
    console.log('TownScene初始化，接收数据:', data);
    
    // 首先尝试加载保存的数据
    this.loadPlayerData();
    
    // 从角色选择场景获取数据
    if (data && data.characterId) {
      // 设置角色数据
      this.playerData = {
        id: data.characterId,
        name: data.characterName || '冒险者',
        stats: data.stats || {
          strength: 10,
          dexterity: 10,
          intelligence: 10,
          vitality: 10
        }
      };
      
      // 设置初始金币
      if (data.gold !== undefined) {
        this.gold = data.gold;
        this.playerGold = data.gold;
      }
      
      // 初始化玩家状态
      if (data.stats) {
        this.playerStats = {
          strength: data.stats.strength || 10,
          dexterity: data.stats.dexterity || 10,
          intelligence: data.stats.intelligence || 10,
          vitality: data.stats.vitality || 10,
          armor: 5,
          damage: "10-15",
          critChance: 5,
          attackSpeed: 1.0,
          level: 1,
          experience: 0,
          nextLevelExp: 100
        };
      }
      
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
        // 根据职业设置不同技能
        if (this.playerData && (this.playerData.stats.strength >= 15 || this.playerData.class === CharacterClass.Marauder)) {
          // 野蛮人技能 - 新的专精系统
          
          // 通用技能 (basic分支) - 用于解锁专精
          this.skills.push(
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
            }
          );
          
          // 打击专精技能 (strike分支) - 初始锁定
          this.skills.push(
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
            }
          );
          
          // 正义之火专精技能 (fire分支) - 初始锁定
          this.skills.push(
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
          
          // 给予野蛮人少量技能点
          this.availableSkillPoints = 2;
          
          // 调试信息
          console.log('==== TownScene技能初始化完成 ====');
          console.log('初始化的技能数量:', this.skills.length);
          console.log('技能详细信息:');
          this.skills.forEach((skill, index) => {
            console.log(`  TownScene技能 ${index}: ID=${skill.id}, 名称=${skill.name}, 分支=${skill.branch}, 锁定=${skill.locked}`);
          });
          console.log('可用技能点:', this.availableSkillPoints);
          console.log('==== TownScene初始化结束 ====');
        } else {
          // 通用技能
          this.skills.push(
            { 
              id: 'fireball', 
              name: '火球术', 
              level: 1, 
              damage: '15-25', 
              manaCost: 10, 
              description: '向敌人发射一个火球',
              key: 'Q'
            },
            { 
              id: 'ice_nova', 
              name: '冰霜新星', 
              level: 0, 
              damage: '10-15', 
              manaCost: 15, 
              description: '冻结周围的敌人并造成伤害', 
              locked: true,
              key: 'E'
            }
          );
        }
      }
      
      // 初始化天赋(如果为空)
      if (this.talents.length === 0) {
        // 根据职业设置不同天赋
        if (this.playerData && (this.playerData.stats.strength >= 15 || this.playerData.class === CharacterClass.Marauder)) {
          // 野蛮人天赋 - 新的专精系统
          
          // 打击专精天赋 (strike分支)
          this.talents.push(
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
            }
          );
          
          // 正义之火专精天赋 (fire分支) 
          this.talents.push(
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
          
          // 通用天赋 (common分支)
          this.talents.push(
            { 
              id: 'strength_boost', 
              name: '力量/生命强化', 
              level: 0, 
              maxLevel: 5, 
              effect: '+5 力量, +25 生命值/等级', 
              branch: 'common',
              description: '增加力量和生命值',
              locked: false
            }
          );
          
          // 给予野蛮人一些天赋点
          this.availableTalentPoints = 5;
        } else {
          // 通用天赋
          this.talents.push(
            { 
              id: 'strength_boost', 
              name: '力量强化', 
              level: 0, 
              maxLevel: 5, 
              effect: '+5 力量/等级', 
              description: '增加力量属性',
              branch: 'common'
            },
            { 
              id: 'critical_mastery', 
              name: '暴击掌握', 
              level: 0, 
              maxLevel: 3, 
              effect: '+3% 暴击几率/等级', 
              description: '增加暴击几率', 
              locked: true,
              branch: 'common'
            }
          );
        }
      }
    } 
    // 从GameScene返回
    else if (data && data.gold !== undefined) {
      this.gold = data.gold;
      this.playerGold = data.gold;
      
      // 如果从GameScene返回，可以保留之前的角色数据、背包和技能
    }
  }

  preload() {
    // 不需要预加载外部资源，我们将在运行时创建图形
  }

  create() {
    // 设置世界边界，创建更大的地图
    this.physics.world.setBounds(0, 0, 2400, 1800);
    
    // 创建城镇地图
    this.createTown();
    
    // 创建玩家
    this.createPlayer();
    
    // 设置相机跟随玩家
    this.cameras.main.setBounds(0, 0, 2400, 1800);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
    // 创建NPC
    this.createNPCs();
    
    // 创建传送门
    this.createPortal();
    
    // 设置输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // 添加界面按键
    this.keyC = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyI = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyP = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    // 添加交互提示文本
    this.interactText = this.add.text(400, 300, '按 E 交互', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.interactText.setOrigin(0.5);
    this.interactText.setVisible(false);
    this.interactText.setScrollFactor(0);
    
    // 添加金币显示
    this.goldText = this.add.text(10, 10, `金币: ${this.gold}`, {
      fontSize: '16px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.goldText.setScrollFactor(0);
    
    // 创建商店UI
    this.createShopMenu();
    
    // 创建UI窗口
    this.createUIWindows();
    
    // 初始化战斗系统
    this.initializeCombatSystem();
    
    // 添加碰撞，不使用回调
    this.physics.add.collider(this.player, this.npcs);
    
    // 添加文字说明
    const helpText = this.add.text(800, 30, '欢迎来到城镇! 使用WASD或方向键移动，E键与NPC交互，C/I/P键打开角色界面', {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    helpText.setOrigin(0.5, 0);
    helpText.setScrollFactor(0);
  }

  update() {
    // 处理玩家移动
    this.handlePlayerMovement();
    
    // 处理交互
    this.handleInteractions();
    
    // 检查地图边界
    this.checkMapBounds();
    
    // 更新战斗系统
    this.updateCombatSystem();
    
    // 处理UI按键
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
    } else if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
      console.log("按下P键");
      if (this.activeWindow === 'skills') {
        this.closeAllWindows();
      } else {
        this.openSkillsWindow();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      console.log("按下ESC键");
      if (this.shopOpen) {
        this.closeShop();
      } else if (this.activeWindow) {
        this.closeAllWindows();
      }
    }
  }
  
  private createTown() {
    // 创建城镇背景
    const bg = this.add.graphics();
    bg.fillStyle(0x3d5e76, 1);
    bg.fillRect(0, 0, 2400, 1800);
    
    // 添加一些随机的"瓷砖"图案作为地面
    bg.fillStyle(0x4a6c88, 1);
    for (let x = 0; x < 2400; x += 40) {
      for (let y = 0; y < 1800; y += 40) {
        if ((x + y) % 80 === 0) {
          bg.fillRect(x, y, 40, 40);
        }
      }
    }
    
    // 添加一些建筑
    this.createBuildings();
    
    // 添加一些装饰物
    this.createDecorations();
  }
  
  private createBuildings() {
    // 创建商店建筑
    const shopBuilding = this.add.graphics();
    shopBuilding.fillStyle(0x8B4513, 1);
    shopBuilding.fillRect(300, 250, 200, 150);
    shopBuilding.fillStyle(0xa52a2a, 1);
    shopBuilding.fillTriangle(300, 250, 500, 250, 400, 180);
    
    // 商店门
    shopBuilding.fillStyle(0x8B7355, 1);
    shopBuilding.fillRect(375, 330, 50, 70);
    
    // 商店窗户
    shopBuilding.fillStyle(0x87CEFA, 1);
    shopBuilding.fillRect(330, 280, 40, 40);
    shopBuilding.fillRect(430, 280, 40, 40);
    
    // 商店招牌
    const shopSign = this.add.text(400, 220, '商店', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    shopSign.setOrigin(0.5);
    
    // 创建铁匠铺
    const smithyBuilding = this.add.graphics();
    smithyBuilding.fillStyle(0x696969, 1);
    smithyBuilding.fillRect(700, 350, 180, 140);
    smithyBuilding.fillStyle(0x4a4a4a, 1);
    smithyBuilding.fillTriangle(700, 350, 880, 350, 790, 290);
    
    // 铁匠铺门
    smithyBuilding.fillStyle(0x8B7355, 1);
    smithyBuilding.fillRect(770, 420, 40, 70);
    
    // 铁匠铺窗户
    smithyBuilding.fillStyle(0xff9900, 0.7);
    smithyBuilding.fillRect(730, 380, 30, 30);
    
    // 铁匠铺招牌
    const smithySign = this.add.text(790, 320, '铁匠铺', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    smithySign.setOrigin(0.5);
  }
  
  private createDecorations() {
    // 添加一些树木
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 1550);
      const y = Phaser.Math.Between(50, 1150);
      
      // 确保树不会挡住建筑
      if ((x > 250 && x < 550 && y > 150 && y < 400) ||
          (x > 650 && x < 900 && y > 250 && y < 500) ||
          (x > 1000 && x < 1200 && y > 500 && y < 700)) {
        continue;
      }
      
      this.createTree(x, y);
    }
    
    // 添加一些石头
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, 1500);
      const y = Phaser.Math.Between(100, 1100);
      
      // 确保石头不会挡住建筑
      if ((x > 250 && x < 550 && y > 150 && y < 400) ||
          (x > 650 && x < 900 && y > 250 && y < 500) ||
          (x > 1000 && x < 1200 && y > 500 && y < 700)) {
        continue;
      }
      
      this.createRock(x, y);
    }
  }
  
  private createTree(x: number, y: number) {
    const tree = this.add.graphics();
    
    // 树干
    tree.fillStyle(0x8B4513, 1);
    tree.fillRect(x - 5, y, 10, 25);
    
    // 树叶
    tree.fillStyle(0x228B22, 1);
    tree.fillCircle(x, y - 15, 20);
    
    // 添加轮廓
    tree.lineStyle(1, 0x006400, 1);
    tree.strokeCircle(x, y - 15, 20);
  }
  
  private createRock(x: number, y: number) {
    const rock = this.add.graphics();
    
    // 石头
    rock.fillStyle(0x808080, 1);
    rock.fillCircle(x, y, Phaser.Math.Between(5, 10));
    
    // 添加轮廓
    rock.lineStyle(1, 0x696969, 1);
    rock.strokeCircle(x, y, Phaser.Math.Between(5, 10));
  }
  
  private createPlayer() {
    // 创建玩家贴图
    const playerGraphics = this.make.graphics({x: 0, y: 0});
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(32, 32, 16);
    playerGraphics.lineStyle(2, 0xffffff, 1);
    playerGraphics.strokeCircle(32, 32, 16);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(36, 28, 4);
    playerGraphics.generateTexture('playerTown', 64, 64);
    
    // 创建玩家
    this.player = this.physics.add.sprite(800, 600, 'playerTown');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(32, 32);
    this.player.setDisplaySize(48, 48);
  }
  
  private createNPCs() {
    // 创建NPC组
    this.npcs = this.physics.add.group();
    
    // 创建商人NPC贴图
    const merchantGraphics = this.make.graphics({x: 0, y: 0});
    merchantGraphics.fillStyle(0xf39c12, 1);
    merchantGraphics.fillCircle(32, 32, 16);
    merchantGraphics.lineStyle(2, 0xd35400, 1);
    merchantGraphics.strokeCircle(32, 32, 16);
    merchantGraphics.fillStyle(0x000000, 1);
    merchantGraphics.fillCircle(28, 28, 3);
    merchantGraphics.fillCircle(36, 28, 3);
    merchantGraphics.fillRect(28, 38, 8, 2);
    merchantGraphics.generateTexture('merchant', 64, 64);
    
    // 创建铁匠NPC贴图
    const smithGraphics = this.make.graphics({x: 0, y: 0});
    smithGraphics.fillStyle(0x7f8c8d, 1);
    smithGraphics.fillCircle(32, 32, 16);
    smithGraphics.lineStyle(2, 0x2c3e50, 1);
    smithGraphics.strokeCircle(32, 32, 16);
    smithGraphics.fillStyle(0x000000, 1);
    smithGraphics.fillCircle(28, 28, 3);
    smithGraphics.fillCircle(36, 28, 3);
    smithGraphics.fillRect(28, 36, 8, 2);
    smithGraphics.generateTexture('smith', 64, 64);
    
    // 创建仓库管理员NPC贴图
    const stashGraphics = this.make.graphics({x: 0, y: 0});
    stashGraphics.fillStyle(0x8b4513, 1);
    stashGraphics.fillCircle(32, 32, 16);
    stashGraphics.lineStyle(2, 0x654321, 1);
    stashGraphics.strokeCircle(32, 32, 16);
    stashGraphics.fillStyle(0x000000, 1);
    stashGraphics.fillCircle(28, 28, 3);
    stashGraphics.fillCircle(36, 28, 3);
    stashGraphics.fillRect(26, 36, 12, 2);
    stashGraphics.generateTexture('stash_keeper', 64, 64);
    
    // 添加商人NPC
    const merchant = this.physics.add.sprite(400, 420, 'merchant');
    merchant.setImmovable(true);  // 设置为不可移动
    merchant.body.setCollideWorldBounds(true); // 设置世界边界碰撞
    merchant.setData('type', 'merchant');
    merchant.setData('name', '商人');
    merchant.setData('interactText', '按 E 购买物品');
    
    // 添加铁匠NPC
    const smith = this.physics.add.sprite(790, 500, 'smith');
    smith.setImmovable(true);  // 设置为不可移动
    smith.body.setCollideWorldBounds(true); // 设置世界边界碰撞
    smith.setData('type', 'smith');
    smith.setData('name', '铁匠');
    smith.setData('interactText', '按 E 升级装备');
    
    // 添加仓库管理员NPC
    const stashKeeper = this.physics.add.sprite(600, 350, 'stash_keeper');
    stashKeeper.setImmovable(true);  // 设置为不可移动
    stashKeeper.body.setCollideWorldBounds(true); // 设置世界边界碰撞
    stashKeeper.setData('type', 'stash_keeper');
    stashKeeper.setData('name', '仓库管理员');
    stashKeeper.setData('interactText', '按 E 访问仓库');
    
    // 添加到NPC组
    this.npcs.add(merchant);
    this.npcs.add(smith);
    this.npcs.add(stashKeeper);
    
    // 设置NPC静态物理属性
    this.npcs.children.iterate((npc: any) => {
      if (npc.body) {
        npc.body.setImmovable(true);  // 设置为不可移动
        npc.setPushable(false);  // 禁止被推动
      }
      return true;
    });
    
    // 添加NPC名称标签
    this.npcs.getChildren().forEach((npcObj: any) => {
      const npc = npcObj as Phaser.Physics.Arcade.Sprite;
      const nameTag = this.add.text(npc.x, npc.y - 30, npc.getData('name'), {
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      nameTag.setOrigin(0.5);
    });
  }
  
  private createPortal() {
    // 创建传送门贴图
    const portalGraphics = this.make.graphics({x: 0, y: 0});
    portalGraphics.fillStyle(0x9b59b6, 0.8);
    portalGraphics.fillCircle(32, 32, 24);
    portalGraphics.lineStyle(3, 0x8e44ad, 1);
    portalGraphics.strokeCircle(32, 32, 24);
    portalGraphics.lineStyle(2, 0xffffff, 0.6);
    portalGraphics.strokeCircle(32, 32, 18);
    portalGraphics.strokeCircle(32, 32, 12);
    portalGraphics.generateTexture('portal', 64, 64);
    
    // 添加传送门
    this.portal = this.physics.add.sprite(1200, 600, 'portal');
    this.portal.setScale(1.5);
    
    // 添加传送门标签
    const portalLabel = this.add.text(1200, 530, '冒险区域', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    portalLabel.setOrigin(0.5);
    
    // 添加传送门发光效果
    this.tweens.add({
      targets: this.portal,
      alpha: 0.7,
      scale: 1.6,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }
  
  private handlePlayerMovement() {
    // 如果商店打开，禁止移动
    if (this.shopOpen) {
      this.player.setVelocity(0, 0);
      return;
    }
    
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
  
  private handleInteractions() {
    // 如果商店已打开，检查关闭条件
    if (this.shopOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey) || 
          Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC))) {
        this.closeShop();
      }
      return;
    }
    
    // 检查与NPC的交互
    let nearestNPC: Phaser.Physics.Arcade.Sprite | null = null;
    let minDistance = 80;
    
    this.npcs.getChildren().forEach((npcObj) => {
      const npc = npcObj as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      
      if (distance < minDistance) {
        nearestNPC = npc;
        minDistance = distance;
      }
    });
    
    // 检查与传送门的交互
    const portalDistance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.portal.x, this.portal.y
    );
    
    if (portalDistance < 100) {
      this.interactText.setText('按 E 进入冒险区域');
      this.interactText.setVisible(true);
      
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.enterGameScene();
      }
      
      return;
    }
    
    // 显示交互文本
    if (nearestNPC) {
      const npcSprite = nearestNPC as Phaser.Physics.Arcade.Sprite;
      const interactText = npcSprite.getData('interactText') as string;
      this.interactText.setText(interactText || '按 E 交互');
      this.interactText.setVisible(true);
      
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.interactWithNPC(npcSprite);
      }
    } else {
      this.interactText.setVisible(false);
    }
  }
  
  private interactWithNPC(npc: Phaser.Physics.Arcade.Sprite) {
    const npcType = npc.getData('type') as string;
    
    if (npcType === 'merchant') {
      this.openShop();
    } else if (npcType === 'smith') {
      // 临时显示消息，实际游戏中应打开铁匠界面
      const message = this.add.text(this.player.x, this.player.y - 50, '铁匠: 我的铺子还在装修中...', {
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      message.setOrigin(0.5);
      
      this.tweens.add({
        targets: message,
        y: message.y - 30,
        alpha: 0,
        duration: 2000,
        onComplete: () => {
          message.destroy();
        }
      });
    } else if (npcType === 'stash_keeper') {
      // 仓库管理员 - 打开仓库
      this.openStash();
    }
  }
  
  private createShopMenu() {
    // 创建商店容器
    this.shopMenu = this.add.container(400, 300);
    this.shopMenu.setVisible(false);
    
    // 创建背景面板
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50, 0.9);
    panel.fillRoundedRect(-250, -200, 500, 400, 10);
    panel.lineStyle(2, 0x34495e, 1);
    panel.strokeRoundedRect(-250, -200, 500, 400, 10);
    
    // 商店标题
    const title = this.add.text(0, -170, '商店', {
      fontSize: '24px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    
    // 添加关闭按钮
    const closeButton = this.add.text(220, -180, 'X', {
      fontSize: '20px',
      color: '#ffffff'
    });
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      this.closeShop();
    });
    
    // 添加金币显示
    const shopGoldText = this.add.text(-230, -170, `金币: ${this.gold}`, {
      fontSize: '16px',
      color: '#ffdd00'
    });
    shopGoldText.setName('goldText');
    
    // 添加商品列表
    let yOffset = -120;
    this.shopItems.forEach((item, index) => {
      // 商品背景
      const itemBg = this.add.graphics();
      if (index % 2 === 0) {
        itemBg.fillStyle(0x34495e, 0.6);
      } else {
        itemBg.fillStyle(0x2c3e50, 0.6);
      }
      itemBg.fillRect(-230, yOffset, 460, 60);
      
      // 商品名称
      const itemName = this.add.text(-210, yOffset + 10, item.name, {
        fontSize: '16px',
        color: '#ffffff'
      });
      
      // 商品描述
      const itemDesc = this.add.text(-210, yOffset + 30, item.description, {
        fontSize: '14px',
        color: '#cccccc'
      });
      
      // 商品价格
      const itemPrice = this.add.text(170, yOffset + 20, `${item.price}金币`, {
        fontSize: '16px',
        color: '#ffdd00'
      });
      
      // 购买按钮
      const buyButton = this.add.text(190, yOffset + 20, '购买', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5
        }
      });
      buyButton.setInteractive();
      buyButton.on('pointerdown', () => {
        this.buyItem(item);
      });
      
      yOffset += 70;
    });
    
    // 添加所有元素到容器
    this.shopMenu.add([panel, title, closeButton, shopGoldText]);
    this.shopItems.forEach((_, index) => {
      // 每个商品有4个元素: 背景,名称,描述,价格,购买按钮
      const startIdx = 4 + index * 5;
      this.shopMenu.add(this.shopMenu.list.slice(startIdx, startIdx + 5));
    });
    
    // 设置滚动因子为0，这样UI不会随着相机移动
    this.shopMenu.setScrollFactor(0);
  }
  
  private openShop() {
    // 更新商店中的金币显示
    const goldText = this.shopMenu.getByName('goldText') as Phaser.GameObjects.Text;
    if (goldText) {
      goldText.setText(`金币: ${this.gold}`);
    }
    
    // 显示商店
    this.shopMenu.setVisible(true);
    this.shopOpen = true;
    
    // 禁止玩家移动
    this.player.setVelocity(0, 0);
  }
  
  private closeShop() {
    this.shopMenu.setVisible(false);
    this.shopOpen = false;
  }
  
  private buyItem(item: any) {
    if (this.gold >= item.price) {
      // 扣除金币
      this.gold -= item.price;
      
      // 更新金币显示
      this.goldText.setText(`金币: ${this.gold}`);
      const shopGoldText = this.shopMenu.getByName('goldText') as Phaser.GameObjects.Text;
      if (shopGoldText) {
        shopGoldText.setText(`金币: ${this.gold}`);
      }
      
      // 显示购买成功消息
      const message = this.add.text(400, 450, `成功购买 ${item.name}!`, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5
        }
      });
      message.setOrigin(0.5);
      message.setScrollFactor(0);
      
      this.tweens.add({
        targets: message,
        y: 400,
        alpha: 0,
        duration: 2000,
        onComplete: () => {
          message.destroy();
        }
      });
    } else {
      // 显示金币不足消息
      const message = this.add.text(400, 450, '金币不足!', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#e74c3c',
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5
        }
      });
      message.setOrigin(0.5);
      message.setScrollFactor(0);
      
      this.tweens.add({
        targets: message,
        y: 400,
        alpha: 0,
        duration: 2000,
        onComplete: () => {
          message.destroy();
        }
      });
    }
  }
  
  private enterGameScene() {
    // 跳转到游戏场景，传递选择的区域数据和玩家金币
    this.scene.start('GameScene', {
      gold: this.gold,
      fromTown: true,
      area: {
        name: '荒野森林',
        level: 1,
        type: 'forest'
      },
      enemies: [
        { type: 'slime', level: 1 },
        { type: 'skeleton', level: 1 },
        { type: 'bandit', level: 1 }
      ]
    });
  }

  private createUIWindows() {
    // 获取游戏屏幕中心位置
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 创建角色属性窗口 - 位置居中
    this.statsWindow = new StatsWindow(this, centerX, centerY);
    this.statsWindow.setStats(this.playerStats);
    this.statsWindow.setHealth(100, 100); // 在城镇里默认满血
    this.statsWindow.setGold(this.gold);
    this.statsWindow.setVisible(false);

    // 创建背包窗口 - 位置居中
    this.inventoryWindow = new InventoryWindow(this, centerX, centerY);
    this.inventoryWindow.setInventory(this.inventory);
    this.inventoryWindow.setItemClickCallback((item, index) => {
      console.log(`使用物品: ${item.name}`);
      // 城镇中使用物品的逻辑
    });
    this.inventoryWindow.setVisible(false);

    // 创建技能窗口 - 需要先创建技能系统
    // 这里先创建一个临时的技能系统，后面可能需要更好的整合
    const tempSkillSystem = {
      getAllSkills: () => [
        { id: 'basic_attack', name: '基础攻击', description: '基础的近战攻击', maxLevel: 5, type: 'active' },
        { id: 'heavy_strike', name: '重击', description: '强力的单体攻击', maxLevel: 5, type: 'active' },
        { id: 'fireball', name: '火球术', description: '投射火球攻击敌人', maxLevel: 5, type: 'active' },
        { id: 'strength_mastery', name: '力量精通', description: '提升力量属性', maxLevel: 10, type: 'passive' },
        { id: 'life_aura', name: '生命光环', description: '提升生命值上限', maxLevel: 10, type: 'passive' }
      ]
    } as any;
    
    this.skillsWindow = new SkillTreeWindow(this, tempSkillSystem);
    this.skillsWindow.setVisible(false);

    // 创建仓库窗口 - 位置居中
    this.storageWindow = new StorageWindow(this, centerX, centerY);
    this.storageWindow.setVisible(false);
  }

  private openStatsWindow() {
    this.closeAllWindows();
    
    // 由于setScrollFactor(0)，窗口位置应该相对于屏幕而不是世界
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;
    this.statsWindow.getContainer().setPosition(screenCenterX, screenCenterY);
    
    console.log(`属性窗口位置设置为屏幕中心: (${screenCenterX}, ${screenCenterY})`);
    
    this.statsWindow.setStats(this.playerStats);
    this.statsWindow.setHealth(100, 100); // 在城镇里默认满血
    this.statsWindow.setGold(this.gold);
    this.statsWindow.setVisible(true);
    this.activeWindow = 'stats';
  }

  private openInventoryWindow() {
    this.closeAllWindows();
    
    // 由于setScrollFactor(0)，窗口位置应该相对于屏幕而不是世界
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;
    this.inventoryWindow.getContainer().setPosition(screenCenterX, screenCenterY);
    
    console.log(`背包窗口位置设置为屏幕中心: (${screenCenterX}, ${screenCenterY})`);
    
    this.inventoryWindow.setInventory(this.inventory);
    this.inventoryWindow.setVisible(true);
    this.activeWindow = 'inventory';
  }

  private openSkillsWindow() {
    this.closeAllWindows();
    
    // 由于setScrollFactor(0)，窗口位置应该相对于屏幕而不是世界
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;
    this.skillsWindow.getContainer().setPosition(screenCenterX, screenCenterY);
    
    console.log(`📋 打开技能窗口`);
    console.log(`技能窗口位置设置为屏幕中心: (${screenCenterX}, ${screenCenterY})`);
    console.log(`可用技能点: ${this.availableSkillPoints}`);
    
    this.skillsWindow.addSkillPoints(this.availableSkillPoints);
    this.skillsWindow.setVisible(true);
    this.activeWindow = 'skills';
    
    console.log(`✅ 技能窗口已打开`);
  }

  private closeAllWindows() {
    if (this.statsWindow) this.statsWindow.setVisible(false);
    if (this.inventoryWindow) this.inventoryWindow.setVisible(false);
    if (this.storageWindow) this.storageWindow.setVisible(false);
    if (this.skillsWindow) this.skillsWindow.setVisible(false);
    this.activeWindow = null;
  }
  
  // 初始化战斗系统
  private initializeCombatSystem(): void {
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建天赋管理器
    const talentManager = new TalentManager(this, this.player);
    
    // 初始化等级系统
    this.playerLevelSystem = new PlayerLevelSystem(talentManager);
    
    // 初始化战斗管理器
    this.combatManager = new CombatManager(this, this.player, this.enemies);
    
    // 设置战斗管理器事件监听
    this.combatManager.on('damageDealt', (damage: any) => {
      console.log(`造成伤害: ${damage}`);
    });
    
    this.combatManager.on('itemPickedUp', (item: any) => {
      console.log(`拾取物品:`, item);
      
      // 更新金币显示
      if (item.type === 'currency' && item.currencyType === CurrencyType.GOLD) {
        this.gold += item.stackSize;
        this.playerGold += item.stackSize;
        this.goldText.setText(`金币: ${this.gold}`);
      }
    });
    
    this.combatManager.on('enemyKilled', (data: any) => {
      console.log(`击杀敌人:`, data);
      
      // 给予经验值
      const expGain = this.calculateExperienceGain(data.enemyLevel || 1, data.isElite || false);
      this.playerLevelSystem.addExperience(expGain);
      console.log(`获得经验: ${expGain}`);
    });
    
    // 监听等级提升事件
    this.playerLevelSystem.on('levelUp', (newLevel: number, skillPoints: number, talentPoints: number) => {
      console.log(`升级到 ${newLevel} 级！获得技能点: ${skillPoints}, 天赋点: ${talentPoints}`);
      
      // 添加技能点和天赋点
      this.availableSkillPoints += skillPoints;
      this.availableTalentPoints += talentPoints;
      
      // 更新玩家属性
      this.playerStats.level = newLevel;
      this.playerStats.experience = this.playerLevelSystem.getExperience();
      this.playerStats.nextLevelExp = this.playerLevelSystem.getExpForNextLevel();
      
      // 更新UI显示
      if (this.skillsWindow && this.skillsWindow.isVisible()) {
        this.skillsWindow.addSkillPoints(skillPoints);
      }
      
      if (this.statsWindow && this.statsWindow.isVisible()) {
        this.statsWindow.setStats(this.playerStats);
      }
    });
    
    // 创建一些测试敌人
    this.createTestEnemies();
  }
  
  // 计算经验获得量
  private calculateExperienceGain(enemyLevel: number, isElite: boolean): number {
    const baseExp = enemyLevel * 10;
    const eliteMultiplier = isElite ? 2.5 : 1.0;
    return Math.floor(baseExp * eliteMultiplier);
  }
  
  // 创建测试敌人
  private createTestEnemies(): void {
    // 在城镇外围创建一些测试骷髅
    const enemyPositions = [
      { x: 1500, y: 300, type: 'skeleton' },
      { x: 1400, y: 500, type: 'skeleton' },
      { x: 1600, y: 450, type: 'goblin' },
      { x: 1700, y: 600, type: 'skeleton' },
      { x: 1800, y: 350, type: 'orc' }
    ];
    
    enemyPositions.forEach(pos => {
      const enemy = this.createEnemy(pos.x, pos.y, pos.type);
      this.enemies.add(enemy);
    });
  }
  
  // 创建单个敌人
  private createEnemy(x: number, y: number, type: string): Phaser.Physics.Arcade.Sprite {
    // 创建敌人精灵（使用简单图形）
    const enemy = this.physics.add.sprite(x, y, 'enemy');
    
    // 创建敌人图形（如果贴图不存在）
    if (!this.textures.exists('enemy')) {
      const graphics = this.add.graphics();
      let color = 0xff0000;
      let size = 16;
      
      switch (type) {
        case 'skeleton':
          color = 0xeeeeee;
          size = 16;
          break;
        case 'goblin':
          color = 0x00aa00;
          size = 14;
          break;
        case 'orc':
          color = 0x8B4513;
          size = 20;
          break;
      }
      
      graphics.fillStyle(color);
      graphics.fillCircle(x, y, size);
      graphics.generateTexture('enemy', size * 2, size * 2);
      graphics.destroy();
      
      enemy.setTexture('enemy');
    }
    
    // 设置敌人属性
    enemy.setCollideWorldBounds(true);
    (enemy as any).monsterId = type;
    
    switch (type) {
      case 'skeleton':
        (enemy as any).health = 50;
        (enemy as any).maxHealth = 50;
        (enemy as any).level = 5;
        break;
      case 'goblin':
        (enemy as any).health = 30;
        (enemy as any).maxHealth = 30;
        (enemy as any).level = 3;
        break;
      case 'orc':
        (enemy as any).health = 80;
        (enemy as any).maxHealth = 80;
        (enemy as any).level = 12;
        (enemy as any).isElite = true;
        break;
    }
    
    // 添加受伤函数
    (enemy as any).takeDamage = function(damage: number) {
      this.health -= damage;
      
      // 创建血条显示
      const healthBar = enemy.scene.add.graphics();
      healthBar.fillStyle(0xff0000, 0.8);
      healthBar.fillRect(enemy.x - 20, enemy.y - 30, 40, 4);
      healthBar.fillStyle(0x00ff00, 0.8);
      const healthPercent = Math.max(0, this.health / this.maxHealth);
      healthBar.fillRect(enemy.x - 20, enemy.y - 30, 40 * healthPercent, 4);
      
      // 血条自动消失
      enemy.scene.time.delayedCall(1000, () => {
        healthBar.destroy();
      });
      
      if (this.health <= 0) {
        this.setActive(false);
        this.setVisible(false);
        // 延迟销毁，让掉落系统有时间处理
        enemy.scene.time.delayedCall(100, () => {
          enemy.destroy();
        });
      }
    };
    
    // 简单的AI移动
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (enemy.active) {
          const moveX = Phaser.Math.Between(-50, 50);
          const moveY = Phaser.Math.Between(-50, 50);
          enemy.setVelocity(moveX, moveY);
          
          // 一段时间后停止移动
          this.time.delayedCall(500, () => {
            if (enemy.active) {
              enemy.setVelocity(0, 0);
            }
          });
        }
      },
      repeat: -1
    });
    
    return enemy;
  }
  
  // 更新战斗系统
  private updateCombatSystem(): void {
    if (this.combatManager) {
      this.combatManager.update();
    }
  }
  
  // 专精切换处理
  private onSpecializationChanged(spec: SpecializationType): void {
    console.log(`切换到专精: ${spec}`);
    this.currentSpecialization = spec;
    
    if (this.combatManager) {
      this.combatManager.setSpecialization(spec);
    }
  }

  private checkMapBounds() {
    // 检查玩家是否超出地图边界
    if (this.player.x < this.mapBounds.x || this.player.x > this.mapBounds.x + this.mapBounds.width ||
        this.player.y < this.mapBounds.y || this.player.y > this.mapBounds.y + this.mapBounds.height) {
      // 如果超出边界，将玩家移动到边界内
      this.player.x = Phaser.Math.Clamp(this.player.x, this.mapBounds.x, this.mapBounds.x + this.mapBounds.width);
      this.player.y = Phaser.Math.Clamp(this.player.y, this.mapBounds.y, this.mapBounds.y + this.mapBounds.height);
      this.player.setVelocity(0, 0); // 停止移动
    }
  }

  // 打开仓库窗口
  private openStash() {
    this.closeAllWindows();
    
    // 由于setScrollFactor(0)，窗口位置应该相对于屏幕而不是世界
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;
    // this.storageWindow.getContainer().setPosition(screenCenterX, screenCenterY);
    
    console.log(`🏦 打开仓库窗口`);
    console.log(`仓库窗口位置设置为屏幕中心: (${screenCenterX}, ${screenCenterY})`);
    
    this.storageWindow.setVisible(true);
    this.activeWindow = 'storage';
    
    // 禁止玩家移动
    this.player.setVelocity(0, 0);
    
    console.log(`✅ 仓库窗口已打开`);
  }
}