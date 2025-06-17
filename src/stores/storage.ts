import { defineStore } from 'pinia'
import type { Storage, StorageTab, StorageResult, DEFAULT_STORAGE_TABS } from '@/types/storage'
import type { InventorySlot } from '@/types/inventory'

const STORAGE_KEY = 'poe_global_storage'

// 创建默认格子
function createDefaultSlots(size: number): InventorySlot[] {
  const slots: InventorySlot[] = []
  for (let i = 0; i < size; i++) {
    slots.push({
      id: `storage_slot_${i}`,
      itemId: null,
      quantity: 0
    })
  }
  return slots
}

// 创建默认仓库
function createDefaultStorage(): Storage {
  const tabs = [
    {
      id: 'general',
      name: '通用',
      size: 48,
      description: '存放各种物品'
    },
    {
      id: 'weapons',
      name: '武器',
      size: 24,
      description: '存放武器装备'
    },
    {
      id: 'armor',
      name: '护甲',
      size: 24,
      description: '存放护甲装备'
    },
    {
      id: 'consumables',
      name: '消耗品',
      size: 36,
      description: '存放药剂和消耗品'
    },
    {
      id: 'materials',
      name: '材料',
      size: 60,
      description: '存放制作材料'
    }
  ]

  const slots = new Map<string, InventorySlot[]>()
  tabs.forEach(tab => {
    slots.set(tab.id, createDefaultSlots(tab.size))
  })

  return {
    tabs,
    slots,
    gold: 0,
    size: 48
  }
}

export const useStorageStore = defineStore('storage', {
  state: (): Storage => {
    // 从localStorage加载仓库数据
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // 转换Map类型
        const slots = new Map<string, InventorySlot[]>()
        if (data.slots) {
          for (const [key, value] of Object.entries(data.slots)) {
            slots.set(key, value as InventorySlot[])
          }
        }
        return {
          ...data,
          slots
        }
      } catch (error) {
        console.error('加载仓库数据失败:', error)
      }
    }
    return createDefaultStorage()
  },

  getters: {
    // 获取指定标签的格子
    getTabSlots: (state) => (tabId: string): InventorySlot[] => {
      return state.slots.get(tabId) || []
    },

    // 获取标签的使用情况
    getTabUsage: (state) => (tabId: string): { used: number; total: number } => {
      const slots = state.slots.get(tabId) || []
      const used = slots.filter(slot => slot.itemId !== null).length
      return { used, total: slots.length }
    },

    // 获取仓库总金币
    totalGold: (state) => state.gold
  },

  actions: {
    // 保存仓库数据
    saveStorage() {
      try {
        const data = {
          tabs: this.tabs,
          slots: Object.fromEntries(this.slots),
          gold: this.gold,
          size: this.size
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        console.error('保存仓库数据失败:', error)
      }
    },

    // 添加物品到仓库
    addItem(tabId: string, itemId: string, quantity: number): StorageResult {
      const slots = this.slots.get(tabId)
      if (!slots) {
        return { success: false, message: '无效的仓库标签' }
      }

      // 先尝试堆叠到现有物品
      const existingSlot = slots.find(slot => slot.itemId === itemId)
      if (existingSlot) {
        existingSlot.quantity += quantity
        this.saveStorage()
        return { success: true }
      }

      // 找空格子
      const emptySlot = slots.find(slot => slot.itemId === null)
      if (emptySlot) {
        emptySlot.itemId = itemId
        emptySlot.quantity = quantity
        this.saveStorage()
        return { success: true }
      }

      return { success: false, message: '仓库已满' }
    },

    // 从仓库移除物品
    removeItem(tabId: string, slotId: string, quantity: number): StorageResult {
      const slots = this.slots.get(tabId)
      if (!slots) {
        return { success: false, message: '无效的仓库标签' }
      }

      const slot = slots.find(s => s.id === slotId)
      if (!slot || !slot.itemId) {
        return { success: false, message: '格子为空' }
      }

      if (slot.quantity < quantity) {
        return { success: false, message: '数量不足' }
      }

      slot.quantity -= quantity
      if (slot.quantity <= 0) {
        slot.itemId = null
        slot.quantity = 0
      }

      this.saveStorage()
      return { success: true }
    },

    // 添加金币到仓库
    addGold(amount: number) {
      this.gold += amount
      this.saveStorage()
    },

    // 从仓库取出金币
    removeGold(amount: number): boolean {
      if (this.gold < amount) {
        return false
      }
      this.gold -= amount
      this.saveStorage()
      return true
    },

    // 清空仓库（仅用于调试）
    clearStorage() {
      const defaultStorage = createDefaultStorage()
      this.tabs = defaultStorage.tabs
      this.slots = defaultStorage.slots
      this.gold = 0
      this.saveStorage()
    }
  }
}) 