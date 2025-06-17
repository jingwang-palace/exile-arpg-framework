import type { InventorySlot } from './inventory'

export type StorageMode = 'local' | 'chain'

export interface StorageConfig {
  mode: StorageMode
  walletConnected: boolean
  lastSaveTime?: number
}

export interface SaveData {
  version: string
  characters: Character[]
  // 其他游戏数据...
}

export interface Character {
  id: string
  name: string
  class: string
  level: number
  createdAt: number
  // 其他角色属性...
}

// 仓库标签
export interface StorageTab {
  id: string
  name: string
  size: number
  description: string
}

// 仓库系统
export interface Storage {
  tabs: StorageTab[]
  slots: Map<string, InventorySlot[]> // 每个标签对应的格子
  gold: number // 仓库金币
  size: number // 每个标签的大小
}

// 仓库操作结果
export interface StorageResult {
  success: boolean
  message?: string
}

// 默认仓库标签
export const DEFAULT_STORAGE_TABS: StorageTab[] = [
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