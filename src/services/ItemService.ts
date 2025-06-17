import i18n from '@/i18n'
import type { BaseItem, ItemDrop } from '@/types/item'

export class ItemService {
  private static instance: ItemService

  private constructor() {}

  static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService()
    }
    return ItemService.instance
  }

  // 获取物品信息
  getItem(id: string): BaseItem | null {
    const items = i18n.global.messages.value.zh.items
    const item = items[id]
    if (!item) return null
    
    return {
      id,
      ...item
    }
  }

  // 计算掉落
  calculateDrops(drops: ItemDrop[]): { itemId: string, quantity: number }[] {
    const results: { itemId: string, quantity: number }[] = []
    
    drops.forEach(drop => {
      if (Math.random() < drop.chance) {
        const quantity = drop.minQuantity && drop.maxQuantity
          ? Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity
          : 1
        
        results.push({
          itemId: drop.itemId,
          quantity
        })
      }
    })
    
    return results
  }
}

export const itemService = ItemService.getInstance() 