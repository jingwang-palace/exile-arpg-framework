import Phaser from 'phaser';
import { EventEmitter } from '../../utils/EventEmitter';
import { 
  CurrencyType, 
  CurrencyConfig, 
  CURRENCY_CONFIGS, 
  CURRENCY_DROP_TIERS,
  CurrencyDropTier 
} from '../../types/currency';
import { AutoPickupSystem } from './AutoPickupSystem';

// 掉落物品类型
export enum LootType {
  CURRENCY = 'currency',
  EQUIPMENT = 'equipment',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material'
}

// 掉落配置
export interface LootDropConfig {
  type: LootType;
  itemId: string;
  weight: number;           // 掉落权重
  minQuantity: number;      // 最小数量
  maxQuantity: number;      // 最大数量
  minLevel: number;         // 最低等级要求
  maxLevel: number;         // 最高等级限制
  rarity?: string;          // 稀有度
  value?: number;           // 价值
}

// 怪物掉落表
export interface MonsterLootTable {
  monsterId: string;
  level: number;
  drops: LootDropConfig[];
  guaranteedDrops?: LootDropConfig[];  // 保证掉落
  bonusChance: number;      // 额外掉落几率
  quantityMultiplier: number; // 数量倍数
}

// 掉落结果
export interface LootDrop {
  type: LootType;
  itemId: string;
  quantity: number;
  rarity?: string;
  value: number;
  x: number;
  y: number;
}

export class LootSystem extends EventEmitter {
  private scene: Phaser.Scene;
  private autoPickupSystem: AutoPickupSystem;
  
  // 掉落配置
  private monsterLootTables: Map<string, MonsterLootTable> = new Map();
  private globalDropModifiers = {
    currencyDropRate: 1.0,     // 通货掉落率倍数
    equipmentDropRate: 1.0,    // 装备掉落率倍数
    quantityBonus: 0,          // 数量加成
    rarityBonus: 0,            // 稀有度加成
    playerLevel: 1,            // 玩家等级
    magicFind: 0               // 魔法寻找加成
  };
  
  constructor(scene: Phaser.Scene, autoPickupSystem: AutoPickupSystem) {
    super();
    this.scene = scene;
    this.autoPickupSystem = autoPickupSystem;
    
    this.initializeDefaultLootTables();
  }
  
  // 初始化默认掉落表
  private initializeDefaultLootTables(): void {
    // 普通骷髅掉落表
    this.monsterLootTables.set('skeleton', {
      monsterId: 'skeleton',
      level: 5,
      bonusChance: 0.15,
      quantityMultiplier: 1.0,
      drops: [
        // 通货掉落
        { type: LootType.CURRENCY, itemId: CurrencyType.COPPER, weight: 40, minQuantity: 1, maxQuantity: 3, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.SILVER, weight: 25, minQuantity: 1, maxQuantity: 2, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.GOLD, weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.WISDOM_SCROLL, weight: 15, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.PORTAL_SCROLL, weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 3, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.TRANSMUTATION_ORB, weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 5, maxLevel: 999 },
        
        // 装备掉落
        { type: LootType.EQUIPMENT, itemId: 'rusty_sword', weight: 12, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 10, rarity: 'common', value: 5 },
        { type: LootType.EQUIPMENT, itemId: 'leather_armor', weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 8, rarity: 'common', value: 8 },
        { type: LootType.EQUIPMENT, itemId: 'iron_sword', weight: 3, minQuantity: 1, maxQuantity: 1, minLevel: 3, maxLevel: 15, rarity: 'magic', value: 15 }
      ]
    });
    
    // 哥布林掉落表
    this.monsterLootTables.set('goblin', {
      monsterId: 'goblin',
      level: 3,
      bonusChance: 0.2,
      quantityMultiplier: 1.2,
      drops: [
        { type: LootType.CURRENCY, itemId: CurrencyType.COPPER, weight: 50, minQuantity: 2, maxQuantity: 5, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.SILVER, weight: 30, minQuantity: 1, maxQuantity: 3, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.WISDOM_SCROLL, weight: 20, minQuantity: 1, maxQuantity: 2, minLevel: 1, maxLevel: 999 },
        { type: LootType.EQUIPMENT, itemId: 'goblin_dagger', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 12, rarity: 'common', value: 12 }
      ]
    });
    
    // 兽人掉落表
    this.monsterLootTables.set('orc', {
      monsterId: 'orc',
      level: 12,
      bonusChance: 0.25,
      quantityMultiplier: 1.5,
      drops: [
        { type: LootType.CURRENCY, itemId: CurrencyType.SILVER, weight: 35, minQuantity: 2, maxQuantity: 4, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.GOLD, weight: 20, minQuantity: 1, maxQuantity: 2, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.ENHANCEMENT_ORB, weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 8, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.BLACKSMITH_WHETSTONE, weight: 6, minQuantity: 1, maxQuantity: 1, minLevel: 5, maxLevel: 999 },
        { type: LootType.EQUIPMENT, itemId: 'orc_axe', weight: 12, minQuantity: 1, maxQuantity: 1, minLevel: 8, maxLevel: 20, rarity: 'magic', value: 25 },
        { type: LootType.EQUIPMENT, itemId: 'chainmail_armor', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 10, maxLevel: 25, rarity: 'magic', value: 30 }
      ]
    });
    
    // 精英怪物掉落表
    this.monsterLootTables.set('elite_skeleton', {
      monsterId: 'elite_skeleton',
      level: 15,
      bonusChance: 0.4,
      quantityMultiplier: 2.0,
      guaranteedDrops: [
        { type: LootType.CURRENCY, itemId: CurrencyType.GOLD, weight: 100, minQuantity: 3, maxQuantity: 6, minLevel: 1, maxLevel: 999 }
      ],
      drops: [
        { type: LootType.CURRENCY, itemId: CurrencyType.BLESSED_ORB, weight: 15, minQuantity: 1, maxQuantity: 1, minLevel: 10, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.ALTERATION_ORB, weight: 20, minQuantity: 1, maxQuantity: 2, minLevel: 8, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.ALCHEMY_SHARD, weight: 25, minQuantity: 1, maxQuantity: 3, minLevel: 5, maxLevel: 999 },
        { type: LootType.EQUIPMENT, itemId: 'skeleton_crown', weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 12, maxLevel: 30, rarity: 'rare', value: 100 },
        { type: LootType.EQUIPMENT, itemId: 'bone_sword', weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 10, maxLevel: 25, rarity: 'rare', value: 60 }
      ]
    });
    
    // Boss掉落表
    this.monsterLootTables.set('skeleton_king', {
      monsterId: 'skeleton_king',
      level: 25,
      bonusChance: 0.8,
      quantityMultiplier: 3.0,
      guaranteedDrops: [
        { type: LootType.CURRENCY, itemId: CurrencyType.GOLD, weight: 100, minQuantity: 10, maxQuantity: 20, minLevel: 1, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.CHAOS_ORB, weight: 100, minQuantity: 1, maxQuantity: 2, minLevel: 15, maxLevel: 999 }
      ],
      drops: [
        { type: LootType.CURRENCY, itemId: CurrencyType.DIVINE_ORB, weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 20, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.EXALTED_ORB, weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 18, maxLevel: 999 },
        { type: LootType.CURRENCY, itemId: CurrencyType.ESSENCE_OF_GREED, weight: 12, minQuantity: 1, maxQuantity: 1, minLevel: 15, maxLevel: 999 },
        { type: LootType.EQUIPMENT, itemId: 'crown_of_bones', weight: 15, minQuantity: 1, maxQuantity: 1, minLevel: 20, maxLevel: 50, rarity: 'legendary', value: 500 },
        { type: LootType.EQUIPMENT, itemId: 'death_blade', weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 22, maxLevel: 45, rarity: 'legendary', value: 400 }
      ]
    });
  }
  
  // 处理怪物死亡掉落
  public processMonsterDeath(
    monsterId: string, 
    x: number, 
    y: number, 
    monsterLevel?: number,
    isElite: boolean = false,
    isBoss: boolean = false
  ): LootDrop[] {
    let lootTable = this.monsterLootTables.get(monsterId);
    
    // 如果没有找到特定掉落表，使用通用掉落表
    if (!lootTable) {
      lootTable = this.generateGenericLootTable(monsterId, monsterLevel || 1, isElite, isBoss);
    }
    
    const drops: LootDrop[] = [];
    
    // 处理保证掉落
    if (lootTable.guaranteedDrops) {
      lootTable.guaranteedDrops.forEach(dropConfig => {
        const drop = this.generateDrop(dropConfig, x, y, lootTable!.quantityMultiplier);
        if (drop) {
          drops.push(drop);
        }
      });
    }
    
    // 处理普通掉落
    lootTable.drops.forEach(dropConfig => {
      if (this.rollDrop(dropConfig, lootTable!.bonusChance)) {
        const drop = this.generateDrop(dropConfig, x, y, lootTable!.quantityMultiplier);
        if (drop) {
          drops.push(drop);
        }
      }
    });
    
    // 应用掉落结果
    this.spawnLoot(drops);
    
    // 发出掉落事件
    this.emit('lootDropped', { monsterId, drops, x, y });
    
    return drops;
  }
  
  // 生成通用掉落表
  private generateGenericLootTable(
    monsterId: string, 
    level: number, 
    isElite: boolean, 
    isBoss: boolean
  ): MonsterLootTable {
    const baseDrops: LootDropConfig[] = [];
    
    // 获取适合等级的通货掉落
    const currencyTier = this.getCurrencyTierForLevel(level);
    if (currencyTier) {
      currencyTier.currencies.forEach(currency => {
        baseDrops.push({
          type: LootType.CURRENCY,
          itemId: currency.type,
          weight: currency.weight,
          minQuantity: currency.minStack,
          maxQuantity: currency.maxStack,
          minLevel: 1,
          maxLevel: 999
        });
      });
    }
    
    // 添加装备掉落
    baseDrops.push(
      { type: LootType.EQUIPMENT, itemId: 'generic_weapon', weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 999, rarity: 'common', value: level * 2 },
      { type: LootType.EQUIPMENT, itemId: 'generic_armor', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 1, maxLevel: 999, rarity: 'common', value: level * 1.5 }
    );
    
    let bonusChance = 0.1;
    let quantityMultiplier = 1.0;
    
    if (isElite) {
      bonusChance = 0.3;
      quantityMultiplier = 1.5;
    }
    
    if (isBoss) {
      bonusChance = 0.6;
      quantityMultiplier = 2.5;
    }
    
    return {
      monsterId,
      level,
      bonusChance,
      quantityMultiplier,
      drops: baseDrops
    };
  }
  
  // 获取等级对应的通货层级
  private getCurrencyTierForLevel(level: number): CurrencyDropTier | undefined {
    return CURRENCY_DROP_TIERS.find(tier => 
      level >= tier.minLevel && level <= tier.maxLevel
    );
  }
  
  // 判断是否掉落
  private rollDrop(dropConfig: LootDropConfig, bonusChance: number): boolean {
    // 检查等级要求
    if (this.globalDropModifiers.playerLevel < dropConfig.minLevel || 
        this.globalDropModifiers.playerLevel > dropConfig.maxLevel) {
      return false;
    }
    
    // 计算掉落概率
    let dropChance = dropConfig.weight / 100;
    
    // 应用全局修饰符
    if (dropConfig.type === LootType.CURRENCY) {
      dropChance *= this.globalDropModifiers.currencyDropRate;
    } else if (dropConfig.type === LootType.EQUIPMENT) {
      dropChance *= this.globalDropModifiers.equipmentDropRate;
    }
    
    // 应用额外掉落几率
    dropChance += bonusChance;
    
    // 应用魔法寻找
    dropChance += this.globalDropModifiers.magicFind / 100;
    
    return Math.random() < dropChance;
  }
  
  // 生成掉落物品
  private generateDrop(
    dropConfig: LootDropConfig, 
    x: number, 
    y: number, 
    quantityMultiplier: number
  ): LootDrop | null {
    // 计算数量
    let quantity = Phaser.Math.Between(dropConfig.minQuantity, dropConfig.maxQuantity);
    quantity = Math.floor(quantity * quantityMultiplier);
    quantity += this.globalDropModifiers.quantityBonus;
    quantity = Math.max(1, quantity);
    
    // 计算价值
    let value = dropConfig.value || 1;
    if (dropConfig.type === LootType.CURRENCY) {
      const config = CURRENCY_CONFIGS[dropConfig.itemId as CurrencyType];
      if (config) {
        value = config.value;
      }
    }
    
    // 应用位置随机化
    const dropX = x + Phaser.Math.Between(-30, 30);
    const dropY = y + Phaser.Math.Between(-30, 30);
    
    return {
      type: dropConfig.type,
      itemId: dropConfig.itemId,
      quantity,
      rarity: dropConfig.rarity,
      value: value * quantity,
      x: dropX,
      y: dropY
    };
  }
  
  // 在世界中生成掉落物品
  private spawnLoot(drops: LootDrop[]): void {
    drops.forEach(drop => {
      if (drop.type === LootType.CURRENCY) {
        // 生成通货
        this.autoPickupSystem.addPickupItem(
          drop.x,
          drop.y,
          'currency',
          drop.itemId as CurrencyType,
          drop.quantity,
          drop.value,
          drop.rarity
        );
      } else if (drop.type === LootType.EQUIPMENT) {
        // 生成装备
        this.autoPickupSystem.addPickupItem(
          drop.x,
          drop.y,
          'equipment',
          undefined,
          drop.quantity,
          drop.value,
          drop.rarity
        );
      }
      
      // 创建掉落动画
      this.createDropAnimation(drop.x, drop.y);
    });
  }
  
  // 创建掉落动画
  private createDropAnimation(x: number, y: number): void {
    // 创建光柱效果
    const lightBeam = this.scene.add.graphics();
    lightBeam.fillStyle(0xffffff, 0.8);
    lightBeam.fillRect(x - 2, y - 100, 4, 100);
    lightBeam.setDepth(5);
    
    // 光柱动画
    this.scene.add.tween({
      targets: lightBeam,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        lightBeam.destroy();
      }
    });
    
    // 创建掉落文本
    const dropText = this.scene.add.text(x, y - 50, '物品掉落!', {
      fontSize: '14px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    dropText.setOrigin(0.5);
    dropText.setDepth(10);
    
    // 文本动画
    this.scene.add.tween({
      targets: dropText,
      y: dropText.y - 20,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        dropText.destroy();
      }
    });
  }
  
  // 设置掉落修饰符
  public setDropModifiers(modifiers: Partial<typeof this.globalDropModifiers>): void {
    this.globalDropModifiers = { ...this.globalDropModifiers, ...modifiers };
    this.emit('dropModifiersChanged', this.globalDropModifiers);
  }
  
  // 获取掉落修饰符
  public getDropModifiers(): typeof this.globalDropModifiers {
    return { ...this.globalDropModifiers };
  }
  
  // 注册怪物掉落表
  public registerMonsterLootTable(lootTable: MonsterLootTable): void {
    this.monsterLootTables.set(lootTable.monsterId, lootTable);
    this.emit('lootTableRegistered', lootTable.monsterId);
  }
  
  // 获取怪物掉落表
  public getMonsterLootTable(monsterId: string): MonsterLootTable | undefined {
    return this.monsterLootTables.get(monsterId);
  }
  
  // 获取所有掉落表
  public getAllLootTables(): Map<string, MonsterLootTable> {
    return new Map(this.monsterLootTables);
  }
  
  // 模拟掉落（用于测试）
  public simulateDrop(monsterId: string, iterations: number = 100): { [itemId: string]: number } {
    const results: { [itemId: string]: number } = {};
    
    for (let i = 0; i < iterations; i++) {
      const drops = this.processMonsterDeath(monsterId, 0, 0);
      drops.forEach(drop => {
        results[drop.itemId] = (results[drop.itemId] || 0) + drop.quantity;
      });
    }
    
    return results;
  }
  
  // 清理系统
  public destroy(): void {
    this.monsterLootTables.clear();
    this.removeAllListeners();
  }
} 