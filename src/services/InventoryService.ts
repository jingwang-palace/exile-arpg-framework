import type { Inventory, InventorySlot, StackResult, MoveResult } from '@/types/inventory'
import { itemService } from './ItemService'
import { Inventory as CharacterInventory, Item } from '@/types/character'

export class InventoryService {
  private static instance: InventoryService

  private constructor() {}

  static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService()
    }
    return InventoryService.instance
  }

  // 创建新背包
  createInventory(size: number): Inventory {
    console.log('Creating inventory with size:', size)
    const inventory = {
      slots: Array(size).fill(null).map((_, index) => ({
        id: `slot-${index}`,
        itemId: null,
        quantity: 0
      })),
      gold: 0,
      size
    }
    console.log('Created inventory:', inventory)
    return inventory
  }

  // 确保背包有效
  private ensureValidInventory(inventory: Inventory | undefined | null): Inventory {
    if (!inventory) {
      return this.createInventory(24)  // 创建默认背包
    }
    
    if (!Array.isArray(inventory.slots)) {
      inventory.slots = []
    }
    
    if (typeof inventory.gold !== 'number') {
      inventory.gold = 0
    }
    
    if (typeof inventory.size !== 'number') {
      inventory.size = 24
    }

    // 确保所有格子都是有效的
    while (inventory.slots.length < inventory.size) {
      inventory.slots.push({
        id: `slot-${inventory.slots.length}`,
        itemId: null,
        quantity: 0
      })
    }

    return inventory
  }

  // 查找可堆叠的格子
  findStackableSlot(inventory: Inventory | undefined | null, itemId: string): InventorySlot | null {
    inventory = this.ensureValidInventory(inventory)
    const item = itemService.getItem(itemId)
    if (!item || !item.stackable) return null

    return inventory.slots.find(slot => 
      slot.itemId === itemId && 
      slot.quantity < item.maxStack &&
      !slot.locked
    ) || null
  }

  // 查找空格子
  findEmptySlot(inventory: Inventory | undefined | null): InventorySlot | null {
    inventory = this.ensureValidInventory(inventory)
    return inventory.slots.find(slot => 
      slot.itemId === null && 
      slot.quantity === 0 &&
      !slot.locked
    ) || null
  }

  // 尝试堆叠物品
  tryStack(slot: InventorySlot, itemId: string, quantity: number): StackResult {
    const item = itemService.getItem(itemId)
    if (!item) {
      return { success: false, remaining: quantity }
    }

    if (!item.stackable) {
      return { success: false, remaining: quantity }
    }

    const currentQuantity = slot.quantity || 0
    const spaceLeft = item.maxStack - currentQuantity
    const amountToAdd = Math.min(spaceLeft, quantity)

    if (amountToAdd > 0) {
      slot.itemId = itemId
      slot.quantity = currentQuantity + amountToAdd
      return {
        success: true,
        remaining: quantity - amountToAdd
      }
    }

    return { success: false, remaining: quantity }
  }

  // 添加物品到背包
  addItem(inventory: Inventory, item: Item): boolean {
    if (inventory.items.length >= inventory.slots) {
      return false; // 背包已满
    }
    
    inventory.items.push(item);
    return true;
  }

  // 从背包移除物品
  removeItem(inventory: Inventory, itemId: string): boolean {
    const index = inventory.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      return false; // 物品不存在
    }
    
    inventory.items.splice(index, 1);
    return true;
  }

  // 获取背包中的物品
  getItem(inventory: Inventory, itemId: string): Item | null {
    const item = inventory.items.find(item => item.id === itemId);
    return item || null;
  }

  // 移动物品
  moveItem(
    fromSlot: InventorySlot, 
    toSlot: InventorySlot, 
    quantity: number
  ): MoveResult {
    if (!fromSlot.itemId) {
      return { success: false, message: 'Source slot is empty' }
    }

    if (fromSlot.locked || toSlot.locked) {
      return { success: false, message: 'Slot is locked' }
    }

    const item = itemService.getItem(fromSlot.itemId)
    if (!item) {
      return { success: false, message: 'Invalid item' }
    }

    // 如果目标格子为空
    if (!toSlot.itemId) {
      const moveQuantity = Math.min(quantity, fromSlot.quantity)
      toSlot.itemId = fromSlot.itemId
      toSlot.quantity = moveQuantity
      fromSlot.quantity -= moveQuantity

      if (fromSlot.quantity === 0) {
        fromSlot.itemId = null
      }

      return { success: true }
    }

    // 如果是相同物品且可堆叠
    if (toSlot.itemId === fromSlot.itemId && item.stackable) {
      const result = this.tryStack(toSlot, fromSlot.itemId, quantity)
      if (result.success) {
        fromSlot.quantity -= (quantity - result.remaining)
        if (fromSlot.quantity === 0) {
          fromSlot.itemId = null
        }
      }
      return { success: result.success }
    }

    // 如果是不同物品，交换位置
    if (quantity >= fromSlot.quantity) {
      const tempItemId = toSlot.itemId
      const tempQuantity = toSlot.quantity
      toSlot.itemId = fromSlot.itemId
      toSlot.quantity = fromSlot.quantity
      fromSlot.itemId = tempItemId
      fromSlot.quantity = tempQuantity
      return { success: true }
    }

    return { success: false, message: 'Invalid operation' }
  }
}

export const inventoryService = InventoryService.getInstance() 