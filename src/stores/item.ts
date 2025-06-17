import { defineStore } from 'pinia'
import type { BaseItem, Equipment, Consumable } from '@/types/item'
import { ItemType } from '@/types/item'
import items from '@/i18n/locales/zh/items'

type GameItem = BaseItem | Equipment | Consumable

interface ItemState {
  items: Record<string, GameItem>
  itemTemplates: typeof items
}

export const useItemStore = defineStore('item', {
  state: (): ItemState => ({
    items: {},
    itemTemplates: items
  }),

  getters: {
    // 获取物品模板
    getItemTemplate: (state) => {
      return (itemId: string) => state.itemTemplates[itemId] || null
    },

    // 获取物品实例
    getItem: (state) => {
      return (itemId: string) => {
        // 先查找物品实例
        const instance = state.items[itemId]
        if (instance) return instance
        
        // 如果没有实例，返回物品模板
        return state.itemTemplates[itemId] || null
      }
    }
  },

  actions: {
    // 创建物品实例
    createItem(templateId: string): string | null {
      const template = this.getItemTemplate(templateId)
      if (!template) return null

      const instanceId = `${templateId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // 创建物品实例
      const itemInstance = {
        ...template,
        id: instanceId,
        // 对于装备类物品，可能需要随机属性
        ...(template.type === ItemType.WEAPON || 
            template.type === ItemType.ARMOR || 
            template.type === ItemType.ACCESSORY) && {
          attributes: this.generateRandomAttributes(template as Equipment)
        }
      }

      this.items[instanceId] = itemInstance
      return instanceId
    },

    // 生成随机属性（类似流放之路的随机词缀）
    generateRandomAttributes(template: Equipment) {
      const attributes = { ...template.attributes }
      
      // 随机属性值浮动（±20%）
      Object.keys(attributes).forEach(key => {
        const baseValue = attributes[key]
        const variation = baseValue * 0.2 // 20% 浮动
        const randomValue = baseValue + (Math.random() * variation * 2 - variation)
        attributes[key] = Math.round(randomValue)
      })

      // 随机添加额外属性（25%概率）
      if (Math.random() < 0.25) {
        const possibleAttributes = {
          criticalChance: { min: 1, max: 5 },
          criticalMultiplier: { min: 10, max: 50 },
          attackSpeed: { min: 5, max: 15 },
          lifeOnHit: { min: 1, max: 10 },
          elementalDamage: { min: 5, max: 20 }
        }

        const attributeKeys = Object.keys(possibleAttributes)
        const randomAttribute = attributeKeys[Math.floor(Math.random() * attributeKeys.length)]
        const range = possibleAttributes[randomAttribute]
        attributes[randomAttribute] = Math.floor(Math.random() * (range.max - range.min + 1) + range.min)
      }

      return attributes
    },

    // 使用物品
    useItem(itemId: string): boolean {
      const item = this.getItem(itemId)
      if (!item) return false

      if (item.type === ItemType.CONSUMABLE) {
        const consumable = item as Consumable
        // 处理消耗品效果
        consumable.effects.forEach(effect => {
          // 这里可以触发效果系统
          console.log(`应用效果: ${effect.type}, 数值: ${effect.value}`)
        })
        return true
      }

      return false
    },

    // 删除物品实例
    removeItem(itemId: string) {
      delete this.items[itemId]
    }
  }
}) 