import type { Inventory, InventorySlot, MoveResult, StackResult } from '@/types/inventory'
import type { BaseItem } from '@/types/item'
import { defineStore } from 'pinia'

export const useInventoryStore = defineStore('inventory', {
  state: (): Inventory => ({
    slots: Array(24).fill(null).map((_, index) => ({
      id: `slot-${index}`,
      itemId: null,
      quantity: 0
    })),
    gold: 0,
    size: 24
  }),

  actions: {
    // 添加物品到背包
    addItem(itemId: string, quantity: number = 1): boolean {
      // 先尝试堆叠
      const existingSlot = this.slots.find(slot => slot.itemId === itemId)
      if (existingSlot) {
        existingSlot.quantity += quantity
        return true
      }

      // 找一个空格子
      const emptySlot = this.slots.find(slot => !slot.itemId)
      if (emptySlot) {
        emptySlot.itemId = itemId
        emptySlot.quantity = quantity
        return true
      }

      return false
    },

    // 添加掉落物品
    addLoot(itemId: string, quantity: number = 1): boolean {
      const success = this.addItem(itemId, quantity)
      if (success) {
        // 触发物品获得提示
        // 这里可以使用事件系统或消息系统来显示提示
        console.log(`获得物品: ${itemId} x${quantity}`)
      }
      return success
    },

    // 添加物品到指定格子
    addToSlot(slotId: string, itemId: string, quantity: number): MoveResult {
      const slot = this.slots.find(s => s.id === slotId)
      if (!slot) {
        return { success: false, message: 'Invalid slot' }
      }
      
      if (slot.locked) {
        return { success: false, message: 'Slot is locked' }
      }

      if (slot.itemId && slot.itemId !== itemId) {
        return { success: false, message: 'Slot contains different item' }
      }

      slot.itemId = itemId
      slot.quantity += quantity
      return { success: true }
    },

    // 从格子移除物品
    removeFromSlot(slotId: string, quantity: number): MoveResult {
      const slot = this.slots.find(s => s.id === slotId)
      if (!slot || !slot.itemId) {
        return { success: false, message: 'No item in slot' }
      }

      if (slot.locked) {
        return { success: false, message: 'Slot is locked' }
      }

      if (slot.quantity < quantity) {
        return { success: false, message: 'Not enough items' }
      }

      slot.quantity -= quantity
      if (slot.quantity === 0) {
        slot.itemId = null
      }
      return { success: true }
    },

    // 添加金币
    addGold(amount: number) {
      this.gold += amount
    },

    // 扣除金币
    removeGold(amount: number): boolean {
      if (this.gold >= amount) {
        this.gold -= amount
        return true
      }
      return false
    }
  }
}) 