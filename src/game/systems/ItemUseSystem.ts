import { Scene } from 'phaser';
import { ItemSystem } from './ItemSystem';
import { BaseItem, ItemType, ItemStack } from '../../types/item';
import { CurrencyType } from '../../types/currency';
import { ITEM_USE_EFFECTS } from '../../configs/items/useEffects';
import { ITEM_USE_COOLDOWNS } from '../../configs/items/useCooldowns';

export class ItemUseSystem {
  private scene: Scene;
  private itemSystem: ItemSystem;
  private cooldowns: Map<string, number> = new Map();
  
  constructor(scene: Scene, itemSystem: ItemSystem) {
    this.scene = scene;
    this.itemSystem = itemSystem;
  }
  
  // 使用物品
  public useItem(itemId: string, quantity: number = 1): boolean {
    const item = this.itemSystem.getItem(itemId);
    if (!item) return false;
    
    // 检查物品是否可用
    if (!this.canUseItem(item)) return false;
    
    // 检查数量
    if (item.quantity < quantity) return false;
    
    // 检查冷却
    if (this.isOnCooldown(itemId)) return false;
    
    // 执行使用效果
    const success = this.executeUseEffect(item, quantity);
    
    if (success) {
      // 移除物品
      this.itemSystem.removeItem(itemId, quantity);
      
      // 设置冷却
      this.setCooldown(itemId);
    }
    
    return success;
  }
  
  // 检查物品是否可用
  private canUseItem(item: ItemStack): boolean {
    // 检查物品类型
    switch (item.item.type) {
      case ItemType.CONSUMABLE:
        return true;
      case ItemType.CURRENCY:
        return this.canUseCurrency(item.item.id as CurrencyType);
      case ItemType.EQUIPMENT:
        return this.canUseEquipment(item);
      case ItemType.GEM:
        return this.canUseGem(item);
      case ItemType.QUEST:
        return this.canUseQuestItem(item);
      case ItemType.MATERIAL:
        return this.canUseMaterial(item);
      default:
        return false;
    }
  }
  
  // 检查通货是否可用
  private canUseCurrency(type: CurrencyType): boolean {
    // 检查通货类型是否可被使用
    return ITEM_USE_EFFECTS.currency[type] !== undefined;
  }
  
  // 检查装备是否可用
  private canUseEquipment(item: ItemStack): boolean {
    // 检查装备是否已鉴定
    if (!item.item.isIdentified) return false;
    
    // 检查装备是否已损坏
    if (item.durability !== undefined && item.durability <= 0) return false;
    
    return true;
  }
  
  // 检查宝石是否可用
  private canUseGem(item: ItemStack): boolean {
    // 检查宝石是否已鉴定
    if (!item.item.isIdentified) return false;
    
    return true;
  }
  
  // 检查任务物品是否可用
  private canUseQuestItem(item: ItemStack): boolean {
    // 检查任务物品是否可用
    return ITEM_USE_EFFECTS.questItems[item.item.id] !== undefined;
  }
  
  // 检查材料是否可用
  private canUseMaterial(item: ItemStack): boolean {
    // 检查材料是否可用
    return ITEM_USE_EFFECTS.materials[item.item.id] !== undefined;
  }
  
  // 执行使用效果
  private executeUseEffect(item: ItemStack, quantity: number): boolean {
    const effect = this.getUseEffect(item.item);
    if (!effect) return false;
    
    try {
      // 执行效果
      effect.execute(this.scene, item, quantity);
      return true;
    } catch (error) {
      console.error('Error executing item use effect:', error);
      return false;
    }
  }
  
  // 获取使用效果
  private getUseEffect(item: BaseItem): any {
    switch (item.type) {
      case ItemType.CONSUMABLE:
        return ITEM_USE_EFFECTS.consumables[item.id];
      case ItemType.CURRENCY:
        return ITEM_USE_EFFECTS.currency[item.id as CurrencyType];
      case ItemType.EQUIPMENT:
        return ITEM_USE_EFFECTS.equipment[item.id];
      case ItemType.GEM:
        return ITEM_USE_EFFECTS.gems[item.id];
      case ItemType.QUEST:
        return ITEM_USE_EFFECTS.questItems[item.id];
      case ItemType.MATERIAL:
        return ITEM_USE_EFFECTS.materials[item.id];
      default:
        return null;
    }
  }
  
  // 检查是否在冷却中
  private isOnCooldown(itemId: string): boolean {
    const cooldown = this.cooldowns.get(itemId);
    if (!cooldown) return false;
    
    return Date.now() < cooldown;
  }
  
  // 设置冷却
  private setCooldown(itemId: string): void {
    const cooldown = ITEM_USE_COOLDOWNS[itemId] || 0;
    if (cooldown > 0) {
      this.cooldowns.set(itemId, Date.now() + cooldown);
    }
  }
  
  // 更新冷却
  public update(): void {
    const now = Date.now();
    
    for (const [itemId, cooldown] of this.cooldowns.entries()) {
      if (now >= cooldown) {
        this.cooldowns.delete(itemId);
      }
    }
  }
  
  // 获取剩余冷却时间
  public getRemainingCooldown(itemId: string): number {
    const cooldown = this.cooldowns.get(itemId);
    if (!cooldown) return 0;
    
    const remaining = cooldown - Date.now();
    return remaining > 0 ? remaining : 0;
  }
  
  // 重置冷却
  public resetCooldown(itemId: string): void {
    this.cooldowns.delete(itemId);
  }
  
  // 重置所有冷却
  public resetAllCooldowns(): void {
    this.cooldowns.clear();
  }
} 