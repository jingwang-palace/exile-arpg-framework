import { defineStore } from 'pinia'
import type { Equipment } from '@/types/item'
import { EquipmentSlot } from '@/types/item'

interface EquipmentState {
  equipped: Partial<Record<EquipmentSlot, string | null>> // 存储每个槽位装备的itemId
}

export const useEquipmentStore = defineStore('equipment', {
  state: (): EquipmentState => ({
    equipped: {
      [EquipmentSlot.WEAPON]: null,
      [EquipmentSlot.HEAD]: null,
      [EquipmentSlot.CHEST]: null,
      [EquipmentSlot.LEGS]: null,
      [EquipmentSlot.FEET]: null,
      [EquipmentSlot.HANDS]: null,
      [EquipmentSlot.RING]: null,
      [EquipmentSlot.NECKLACE]: null,
    }
  }),

  getters: {
    // 获取所有已装备的物品ID
    equippedItems(): string[] {
      return Object.values(this.equipped).filter((id): id is string => id !== null)
    },

    // 计算装备带来的总属性加成
    totalAttributes(): Record<string, number> {
      const { useItemStore } = require('@/store/modules/item')
      const itemStore = useItemStore()
      
      return this.equippedItems.reduce((total, itemId) => {
        const item = itemStore.getItem(itemId) as Equipment
        if (!item?.attributes) return total

        Object.entries(item.attributes).forEach(([attr, value]) => {
          total[attr] = (total[attr] || 0) + value
        })
        return total
      }, {} as Record<string, number>)
    }
  },

  actions: {
    // 装备物品
    equipItem(itemId: string): { success: boolean; previousItemId: string | null } {
      const { useItemStore } = require('@/store/modules/item')
      const itemStore = useItemStore()
      const item = itemStore.getItem(itemId) as Equipment

      if (!item?.slot) {
        return { success: false, previousItemId: null }
      }

      const previousItemId = this.equipped[item.slot]
      this.equipped[item.slot] = itemId
      
      return { success: true, previousItemId }
    },

    // 卸下装备
    unequipItem(slot: EquipmentSlot): string | null {
      const itemId = this.equipped[slot]
      this.equipped[slot] = null
      return itemId
    },

    // 检查槽位是否已装备物品
    isSlotOccupied(slot: EquipmentSlot): boolean {
      return this.equipped[slot] !== null
    },

    // 获取指定槽位的装备
    getEquippedItem(slot: EquipmentSlot): string | null {
      return this.equipped[slot]
    }
  }
}) 