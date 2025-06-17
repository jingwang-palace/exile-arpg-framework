import { EventEmitter } from '../../utils/EventEmitter';
import { 
  BaseItem, 
  ItemType, 
  ItemRarity, 
  ItemStack, 
  InventorySlot, 
  Inventory,
  InventoryManager,
  Mod,
  ModType
} from '../../types/item';
import { CurrencyType } from '../../types/currency';

export class ItemSystem extends EventEmitter implements InventoryManager {
  private scene: Phaser.Scene;
  private inventories: Map<string, Inventory> = new Map();
  private defaultInventory: Inventory;
  
  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.defaultInventory = this.createDefaultInventory();
    this.inventories.set('default', this.defaultInventory);
  }
  
  // 创建默认物品栏
  private createDefaultInventory(): Inventory {
    const slots: InventorySlot[] = [];
    const size = 60; // 默认60格
    
    for (let i = 0; i < size; i++) {
      slots.push({
        id: `slot_${i}`,
        type: [ItemType.EQUIPMENT, ItemType.CURRENCY, ItemType.CONSUMABLE, ItemType.MATERIAL, ItemType.QUEST, ItemType.GEM],
        isLocked: false
      });
    }
    
    return {
      id: 'default',
      name: '背包',
      size,
      slots,
      isLocked: false,
      isShared: false
    };
  }
  
  // 添加物品
  public addItem(item: BaseItem, quantity: number): boolean {
    if (quantity <= 0) return false;
    
    // 检查是否可以堆叠
    if (item.stackSize > 1) {
      // 尝试堆叠到现有物品
      const existingStack = this.findStackableSlot(item.id);
      if (existingStack) {
        const spaceLeft = item.stackSize - existingStack.quantity;
        const amountToAdd = Math.min(quantity, spaceLeft);
        existingStack.quantity += amountToAdd;
        this.emit('itemAdded', { item, quantity: amountToAdd });
        
        // 如果还有剩余，递归添加
        if (quantity > amountToAdd) {
          return this.addItem(item, quantity - amountToAdd);
        }
        return true;
      }
    }
    
    // 需要新的槽位
    const emptySlot = this.findEmptySlot();
    if (!emptySlot) return false;
    
    emptySlot.stack = {
      item,
      quantity: Math.min(quantity, item.stackSize)
    };
    
    this.emit('itemAdded', { item, quantity: emptySlot.stack.quantity });
    
    // 如果还有剩余，递归添加
    if (quantity > item.stackSize) {
      return this.addItem(item, quantity - item.stackSize);
    }
    
    return true;
  }
  
  // 移除物品
  public removeItem(itemId: string, quantity: number): boolean {
    if (quantity <= 0) return false;
    
    const slots = this.findItemSlots(itemId);
    if (slots.length === 0) return false;
    
    let remainingToRemove = quantity;
    
    for (const slot of slots) {
      if (!slot.stack) continue;
      
      const amountToRemove = Math.min(remainingToRemove, slot.stack.quantity);
      slot.stack.quantity -= amountToRemove;
      
      if (slot.stack.quantity <= 0) {
        slot.stack = undefined;
      }
      
      remainingToRemove -= amountToRemove;
      if (remainingToRemove <= 0) break;
    }
    
    this.emit('itemRemoved', { itemId, quantity });
    return true;
  }
  
  // 移动物品
  public moveItem(fromSlot: string, toSlot: string, quantity: number): boolean {
    const from = this.findSlotById(fromSlot);
    const to = this.findSlotById(toSlot);
    
    if (!from || !to || !from.stack) return false;
    if (from.isLocked || to.isLocked) return false;
    
    // 检查目标槽位是否接受该类型物品
    if (!to.type.includes(from.stack.item.type)) return false;
    
    const amountToMove = Math.min(quantity, from.stack.quantity);
    
    // 如果目标槽位为空
    if (!to.stack) {
      to.stack = {
        item: from.stack.item,
        quantity: amountToMove
      };
      from.stack.quantity -= amountToMove;
      
      if (from.stack.quantity <= 0) {
        from.stack = undefined;
      }
    }
    // 如果目标槽位有相同物品且可堆叠
    else if (to.stack.item.id === from.stack.item.id && to.stack.item.stackSize > 1) {
      const spaceLeft = to.stack.item.stackSize - to.stack.quantity;
      const actualMove = Math.min(amountToMove, spaceLeft);
      
      to.stack.quantity += actualMove;
      from.stack.quantity -= actualMove;
      
      if (from.stack.quantity <= 0) {
        from.stack = undefined;
      }
    }
    // 如果目标槽位有不同物品，交换位置
    else {
      const temp = to.stack;
      to.stack = {
        item: from.stack.item,
        quantity: amountToMove
      };
      from.stack.quantity -= amountToMove;
      
      if (from.stack.quantity <= 0) {
        from.stack = temp;
      } else {
        from.stack = {
          item: temp.item,
          quantity: temp.quantity
        };
      }
    }
    
    this.emit('itemMoved', { fromSlot, toSlot, item: to.stack });
    return true;
  }
  
  // 分割堆叠
  public splitStack(fromSlot: string, toSlot: string, quantity: number): boolean {
    const from = this.findSlotById(fromSlot);
    const to = this.findSlotById(toSlot);
    
    if (!from || !to || !from.stack) return false;
    if (from.isLocked || to.isLocked) return false;
    if (from.stack.quantity <= quantity) return false;
    if (to.stack) return false;
    
    to.stack = {
      item: from.stack.item,
      quantity
    };
    from.stack.quantity -= quantity;
    
    this.emit('itemMoved', { fromSlot, toSlot, item: to.stack });
    return true;
  }
  
  // 合并堆叠
  public mergeStacks(fromSlot: string, toSlot: string): boolean {
    const from = this.findSlotById(fromSlot);
    const to = this.findSlotById(toSlot);
    
    if (!from || !to || !from.stack || !to.stack) return false;
    if (from.isLocked || to.isLocked) return false;
    if (from.stack.item.id !== to.stack.item.id) return false;
    if (to.stack.item.stackSize <= 1) return false;
    
    const spaceLeft = to.stack.item.stackSize - to.stack.quantity;
    const amountToMove = Math.min(from.stack.quantity, spaceLeft);
    
    to.stack.quantity += amountToMove;
    from.stack.quantity -= amountToMove;
    
    if (from.stack.quantity <= 0) {
      from.stack = undefined;
    }
    
    this.emit('itemMoved', { fromSlot, toSlot, item: to.stack });
    return true;
  }
  
  // 获取物品
  public getItem(itemId: string): ItemStack | undefined {
    const slot = this.findItemSlots(itemId)[0];
    return slot?.stack;
  }
  
  // 获取物品数量
  public getItemCount(itemId: string): number {
    return this.findItemSlots(itemId)
      .reduce((total, slot) => total + (slot.stack?.quantity || 0), 0);
  }
  
  // 检查是否有足够物品
  public hasItem(itemId: string, quantity: number): boolean {
    return this.getItemCount(itemId) >= quantity;
  }
  
  // 获取空槽位
  public getEmptySlots(): InventorySlot[] {
    return this.defaultInventory.slots.filter(slot => !slot.stack);
  }
  
  // 获取指定类型的槽位
  public getSlotsByType(type: ItemType): InventorySlot[] {
    return this.defaultInventory.slots.filter(slot => slot.type.includes(type));
  }
  
  // 锁定槽位
  public lockSlot(slotId: string): void {
    const slot = this.findSlotById(slotId);
    if (slot) {
      slot.isLocked = true;
    }
  }
  
  // 解锁槽位
  public unlockSlot(slotId: string): void {
    const slot = this.findSlotById(slotId);
    if (slot) {
      slot.isLocked = false;
    }
  }
  
  // 锁定物品栏
  public lockInventory(): void {
    this.defaultInventory.isLocked = true;
  }
  
  // 解锁物品栏
  public unlockInventory(): void {
    this.defaultInventory.isLocked = false;
  }
  
  // 查找可堆叠的槽位
  private findStackableSlot(itemId: string): ItemStack | undefined {
    return this.defaultInventory.slots
      .find(slot => slot.stack?.item.id === itemId && slot.stack.quantity < slot.stack.item.stackSize)
      ?.stack;
  }
  
  // 查找空槽位
  private findEmptySlot(): InventorySlot | undefined {
    return this.defaultInventory.slots.find(slot => !slot.stack);
  }
  
  // 查找物品槽位
  private findItemSlots(itemId: string): InventorySlot[] {
    return this.defaultInventory.slots.filter(slot => slot.stack?.item.id === itemId);
  }
  
  // 通过ID查找槽位
  private findSlotById(slotId: string): InventorySlot | undefined {
    return this.defaultInventory.slots.find(slot => slot.id === slotId);
  }
  
  // 获取物品栏数据（用于存档）
  public getInventoryData(): any {
    return {
      id: this.defaultInventory.id,
      slots: this.defaultInventory.slots.map(slot => ({
        id: slot.id,
        stack: slot.stack ? {
          item: {
            id: slot.stack.item.id,
            type: slot.stack.item.type,
            rarity: slot.stack.item.rarity
          },
          quantity: slot.stack.quantity,
          quality: slot.stack.quality,
          durability: slot.stack.durability,
          maxDurability: slot.stack.maxDurability,
          mods: slot.stack.mods
        } : null
      }))
    };
  }
  
  // 加载物品栏数据（用于读档）
  public loadInventoryData(data: any): void {
    if (data.id !== this.defaultInventory.id) return;
    
    this.defaultInventory.slots = data.slots.map((slotData: any) => ({
      id: slotData.id,
      type: [ItemType.EQUIPMENT, ItemType.CURRENCY, ItemType.CONSUMABLE, ItemType.MATERIAL, ItemType.QUEST, ItemType.GEM],
      isLocked: false,
      stack: slotData.stack ? {
        item: {
          id: slotData.stack.item.id,
          type: slotData.stack.item.type,
          rarity: slotData.stack.item.rarity
        },
        quantity: slotData.stack.quantity,
        quality: slotData.stack.quality,
        durability: slotData.stack.durability,
        maxDurability: slotData.stack.maxDurability,
        mods: slotData.stack.mods
      } : undefined
    }));
    
    this.emit('inventoryChanged');
  }
} 