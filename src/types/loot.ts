// 掉落权重组
export interface LootWeight {
  id: string        // 掉落组ID
  weight: number    // 权重
}

// 掉落组
export interface LootGroup {
  id: string
  items: {
    itemId: string
    weight: number      // 在组内的权重
    quantityRange?: {   // 数量范围
      min: number
      max: number
    }
  }[]
}

// 掉落表
export interface LootTable {
  id: string
  groups: LootWeight[]  // 可能掉落的组及其权重
  rolls: {             // 掉落次数
    min: number
    max: number
  }
  level?: {            // 等级要求（可选）
    min?: number
    max?: number
  }
} 