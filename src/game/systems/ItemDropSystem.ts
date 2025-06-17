import { Scene } from 'phaser';
import { ItemFactory } from './ItemFactory';
import { ItemSystem } from './ItemSystem';
import { BaseItem, ItemType, ItemRarity } from '../../types/item';
import { CurrencyType } from '../../types/currency';
import { DROP_TABLES } from '../../configs/drops/dropTables';
import { DROP_RATES } from '../../configs/drops/dropRates';

export class ItemDropSystem {
  private scene: Scene;
  private itemFactory: ItemFactory;
  private itemSystem: ItemSystem;
  
  constructor(scene: Scene, itemSystem: ItemSystem) {
    this.scene = scene;
    this.itemFactory = ItemFactory.getInstance();
    this.itemSystem = itemSystem;
  }
  
  // 处理怪物掉落
  public handleMonsterDrop(monsterId: string, monsterLevel: number, position: { x: number, y: number }): void {
    const dropTable = this.getDropTable(monsterId);
    if (!dropTable) return;
    
    // 计算掉落数量
    const dropCount = this.calculateDropCount(monsterLevel);
    
    // 生成掉落物品
    for (let i = 0; i < dropCount; i++) {
      const item = this.generateDropItem(dropTable, monsterLevel);
      if (item) {
        this.createDropEntity(item, position);
      }
    }
  }
  
  // 处理箱子掉落
  public handleChestDrop(chestId: string, chestLevel: number, position: { x: number, y: number }): void {
    const dropTable = this.getDropTable(chestId);
    if (!dropTable) return;
    
    // 计算掉落数量
    const dropCount = this.calculateDropCount(chestLevel, true);
    
    // 生成掉落物品
    for (let i = 0; i < dropCount; i++) {
      const item = this.generateDropItem(dropTable, chestLevel);
      if (item) {
        this.createDropEntity(item, position);
      }
    }
  }
  
  // 处理环境掉落（如矿石、草药等）
  public handleEnvironmentDrop(resourceId: string, resourceLevel: number, position: { x: number, y: number }): void {
    const dropTable = this.getDropTable(resourceId);
    if (!dropTable) return;
    
    const item = this.generateDropItem(dropTable, resourceLevel);
    if (item) {
      this.createDropEntity(item, position);
    }
  }
  
  // 获取掉落表
  private getDropTable(entityId: string): any {
    return DROP_TABLES[entityId];
  }
  
  // 计算掉落数量
  private calculateDropCount(level: number, isChest: boolean = false): number {
    const baseCount = isChest ? DROP_RATES.chest.baseCount : DROP_RATES.monster.baseCount;
    const levelMultiplier = 1 + (level * DROP_RATES.levelMultiplier);
    const randomFactor = 0.5 + Math.random();
    
    return Math.floor(baseCount * levelMultiplier * randomFactor);
  }
  
  // 生成掉落物品
  private generateDropItem(dropTable: any, level: number): BaseItem | null {
    // 计算物品类型权重
    const typeWeights = this.calculateTypeWeights(dropTable, level);
    const selectedType = this.selectRandomType(typeWeights);
    
    if (!selectedType) return null;
    
    // 根据类型生成物品
    switch (selectedType) {
      case ItemType.EQUIPMENT:
        return this.generateEquipmentDrop(dropTable, level);
      case ItemType.CURRENCY:
        return this.generateCurrencyDrop(dropTable);
      case ItemType.CONSUMABLE:
        return this.generateConsumableDrop(dropTable, level);
      case ItemType.MATERIAL:
        return this.generateMaterialDrop(dropTable, level);
      case ItemType.QUEST:
        return this.generateQuestItemDrop(dropTable);
      case ItemType.GEM:
        return this.generateGemDrop(dropTable, level);
      default:
        return null;
    }
  }
  
  // 计算物品类型权重
  private calculateTypeWeights(dropTable: any, level: number): Map<ItemType, number> {
    const weights = new Map<ItemType, number>();
    
    // 基础权重
    for (const [type, weight] of Object.entries(dropTable.weights)) {
      weights.set(type as ItemType, weight as number);
    }
    
    // 根据等级调整权重
    for (const [type, weight] of weights.entries()) {
      const levelMultiplier = 1 + (level * DROP_RATES.levelMultiplier);
      weights.set(type, weight * levelMultiplier);
    }
    
    return weights;
  }
  
  // 随机选择物品类型
  private selectRandomType(weights: Map<ItemType, number>): ItemType | null {
    const totalWeight = Array.from(weights.values()).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of weights.entries()) {
      random -= weight;
      if (random <= 0) {
        return type;
      }
    }
    
    return null;
  }
  
  // 生成装备掉落
  private generateEquipmentDrop(dropTable: any, level: number): BaseItem | null {
    const templateId = this.selectRandomTemplate(dropTable.equipment);
    if (!templateId) return null;
    
    const rarity = this.determineRarity(dropTable.rarityWeights);
    return this.itemFactory.createEquipment(templateId, level, rarity);
  }
  
  // 生成通货掉落
  private generateCurrencyDrop(dropTable: any): BaseItem | null {
    const currencyType = this.selectRandomCurrency(dropTable.currency);
    if (!currencyType) return null;
    
    const quantity = this.calculateCurrencyQuantity(dropTable.currency[currencyType]);
    return this.itemFactory.createCurrency(currencyType as CurrencyType, quantity);
  }
  
  // 生成消耗品掉落
  private generateConsumableDrop(dropTable: any, level: number): BaseItem | null {
    const templateId = this.selectRandomTemplate(dropTable.consumables);
    if (!templateId) return null;
    
    return this.itemFactory.createConsumable(templateId, level);
  }
  
  // 生成材料掉落
  private generateMaterialDrop(dropTable: any, level: number): BaseItem | null {
    const templateId = this.selectRandomTemplate(dropTable.materials);
    if (!templateId) return null;
    
    return this.itemFactory.createMaterial(templateId, level);
  }
  
  // 生成任务物品掉落
  private generateQuestItemDrop(dropTable: any): BaseItem | null {
    const templateId = this.selectRandomTemplate(dropTable.questItems);
    if (!templateId) return null;
    
    return this.itemFactory.createQuestItem(templateId);
  }
  
  // 生成宝石掉落
  private generateGemDrop(dropTable: any, level: number): BaseItem | null {
    const templateId = this.selectRandomTemplate(dropTable.gems);
    if (!templateId) return null;
    
    return this.itemFactory.createGem(templateId, level);
  }
  
  // 随机选择模板
  private selectRandomTemplate(templates: any): string | null {
    if (!templates || Object.keys(templates).length === 0) return null;
    
    const totalWeight = Object.values(templates).reduce((sum: number, weight: any) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [id, weight] of Object.entries(templates)) {
      random -= weight as number;
      if (random <= 0) {
        return id;
      }
    }
    
    return null;
  }
  
  // 随机选择通货
  private selectRandomCurrency(currencies: any): string | null {
    return this.selectRandomTemplate(currencies);
  }
  
  // 计算通货数量
  private calculateCurrencyQuantity(config: any): number {
    const min = config.min || 1;
    const max = config.max || 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // 确定物品品质
  private determineRarity(rarityWeights: any): ItemRarity {
    const totalWeight = Object.values(rarityWeights).reduce((sum: number, weight: any) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      random -= weight as number;
      if (random <= 0) {
        return rarity as ItemRarity;
      }
    }
    
    return ItemRarity.NORMAL;
  }
  
  // 创建掉落实体
  private createDropEntity(item: BaseItem, position: { x: number, y: number }): void {
    // TODO: 实现掉落实体的创建和显示
    // 这里需要创建实际的游戏对象，包括：
    // 1. 物品精灵
    // 2. 物理碰撞
    // 3. 拾取交互
    // 4. 掉落动画
    // 5. 物品信息显示
  }
} 