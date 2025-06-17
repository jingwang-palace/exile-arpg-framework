import type { BaseItem } from './item'

// 背包格子
export interface InventorySlot {
  id: string           // 格子ID
  itemId: string | null // 物品ID
  quantity: number     // 数量
  locked?: boolean     // 是否锁定
}

// 背包
export interface Inventory {
  slots: InventorySlot[]  // 背包格子
  gold: number           // 金币
  size: number           // 背包大小
}

// 物品堆叠结果
export interface StackResult {
  success: boolean      // 是否成功
  remaining: number     // 剩余数量
}

// 物品移动结果
export interface MoveResult {
  success: boolean
  message?: string
} 