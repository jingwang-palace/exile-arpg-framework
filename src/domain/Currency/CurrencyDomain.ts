import { EventBus } from '../../core/EventBus'
import type { Currency, CurrencyType } from '../../types/currency'
import type { Equipment } from '../../types/equipment'

/**
 * 通货领域服务
 * 处理所有通货相关的业务逻辑
 */
export class CurrencyDomain {
  private eventBus: EventBus
  
  constructor() {
    this.eventBus = EventBus.getInstance()
  }
  
  /**
   * 使用通货制作装备
   */
  public useCurrencyOnEquipment(currencyType: CurrencyType, item: Equipment, characterId: string): CraftingResult {
    console.log(`💰 使用 ${currencyType} 制作 ${item.name}`)
    
    // 验证通货使用条件
    if (!this.canUseCurrency(currencyType, item)) {
      return {
        success: false,
        message: '无法在此装备上使用该通货',
        resultItem: item
      }
    }
    
    // 执行通货效果
    const result = this.applyCurrencyEffect(currencyType, item)
    
    if (result.success) {
      this.eventBus.emit('equipment:modified', {
        itemId: item.id,
        modificationType: `currency_${currencyType}`
      })
      
      console.log(`✅ 制作成功: ${result.message}`)
    } else {
      console.log(`❌ 制作失败: ${result.message}`)
    }
    
    return result
  }
  
  /**
   * 获取通货信息
   */
  public getCurrencyInfo(currencyType: CurrencyType): CurrencyInfo {
    const currencyData: Record<CurrencyType, CurrencyInfo> = {
      'scroll_of_wisdom': {
        name: '智慧卷轴',
        description: '鉴定未鉴定的装备',
        rarity: 'normal',
        stackSize: 40,
        effects: ['identify']
      },
      'portal_scroll': {
        name: '传送卷轴', 
        description: '打开返回城镇的传送门',
        rarity: 'normal',
        stackSize: 40,
        effects: ['portal']
      },
      'orb_of_transmutation': {
        name: '蜕变石',
        description: '将普通装备升级为魔法装备',
        rarity: 'normal',
        stackSize: 40,
        effects: ['normal_to_magic']
      },
      'orb_of_alteration': {
        name: '改造石',
        description: '重新随机魔法装备的词缀',
        rarity: 'normal', 
        stackSize: 20,
        effects: ['reroll_magic']
      },
      'orb_of_alchemy': {
        name: '点金石',
        description: '将普通装备升级为稀有装备',
        rarity: 'magic',
        stackSize: 10,
        effects: ['normal_to_rare']
      },
      'chaos_orb': {
        name: '混沌石',
        description: '重新随机稀有装备的词缀',
        rarity: 'rare',
        stackSize: 10,
        effects: ['reroll_rare']
      },
      'exalted_orb': {
        name: '崇高石',
        description: '为稀有装备添加一个新的随机词缀',
        rarity: 'unique',
        stackSize: 10,
        effects: ['add_modifier']
      },
      'divine_orb': {
        name: '神圣石',
        description: '重新随机装备上词缀的数值',
        rarity: 'unique',
        stackSize: 10,
        effects: ['reroll_values']
      }
    }
    
    return currencyData[currencyType]
  }
  
  /**
   * 检查通货掉落
   */
  public checkCurrencyDrop(monsterLevel: number, playerLevel: number): CurrencyDrop | null {
    const dropChance = this.calculateCurrencyDropChance(monsterLevel, playerLevel)
    
    if (Math.random() < dropChance) {
      const currencyType = this.selectRandomCurrency(monsterLevel)
      
      console.log(`💰 掉落通货: ${currencyType}`)
      
      return {
        type: currencyType,
        quantity: 1,
        dropChance
      }
    }
    
    return null
  }
  
  /**
   * 交易通货
   */
  public tradeCurrency(fromType: CurrencyType, toType: CurrencyType, amount: number): TradeResult {
    const exchangeRate = this.getCurrencyExchangeRate(fromType, toType)
    
    if (!exchangeRate) {
      return {
        success: false,
        message: '无法兑换这两种通货',
        receivedAmount: 0
      }
    }
    
    const receivedAmount = Math.floor(amount * exchangeRate)
    
    console.log(`🔄 通货兑换: ${amount} ${fromType} -> ${receivedAmount} ${toType}`)
    
    return {
      success: true,
      message: `成功兑换 ${receivedAmount} 个 ${toType}`,
      receivedAmount
    }
  }
  
  // 私有方法
  
  /**
   * 检查是否可以使用通货
   */
  private canUseCurrency(currencyType: CurrencyType, item: Equipment): boolean {
    const currencyInfo = this.getCurrencyInfo(currencyType)
    
    // 根据通货类型和装备状态判断
    switch (currencyType) {
      case 'orb_of_transmutation':
        return item.rarity === 'normal'
      case 'orb_of_alteration':
        return item.rarity === 'magic'
      case 'orb_of_alchemy':
        return item.rarity === 'normal'
      case 'chaos_orb':
        return item.rarity === 'rare'
      case 'exalted_orb':
        return item.rarity === 'rare' // TODO: 检查词缀数量限制
      case 'divine_orb':
        return item.rarity === 'rare' || item.rarity === 'unique'
      default:
        return true
    }
  }
  
  /**
   * 应用通货效果
   */
  private applyCurrencyEffect(currencyType: CurrencyType, item: Equipment): CraftingResult {
    switch (currencyType) {
      case 'orb_of_transmutation':
        return this.upgradeToMagic(item)
      case 'orb_of_alteration':
        return this.rerollMagicModifiers(item)
      case 'orb_of_alchemy':
        return this.upgradeToRare(item)
      case 'chaos_orb':
        return this.rerollRareModifiers(item)
      case 'exalted_orb':
        return this.addRandomModifier(item)
      case 'divine_orb':
        return this.rerollModifierValues(item)
      default:
        return {
          success: false,
          message: '未实现的通货效果',
          resultItem: item
        }
    }
  }
  
  /**
   * 升级为魔法装备
   */
  private upgradeToMagic(item: Equipment): CraftingResult {
    // TODO: 实现升级逻辑
    return {
      success: true,
      message: '成功升级为魔法装备',
      resultItem: { ...item, rarity: 'magic' }
    }
  }
  
  /**
   * 重随机魔法词缀
   */
  private rerollMagicModifiers(item: Equipment): CraftingResult {
    // TODO: 实现重随机逻辑
    return {
      success: true,
      message: '重新随机了魔法词缀',
      resultItem: item
    }
  }
  
  /**
   * 升级为稀有装备
   */
  private upgradeToRare(item: Equipment): CraftingResult {
    // TODO: 实现升级逻辑
    return {
      success: true,
      message: '成功升级为稀有装备',
      resultItem: { ...item, rarity: 'rare' }
    }
  }
  
  /**
   * 重随机稀有词缀
   */
  private rerollRareModifiers(item: Equipment): CraftingResult {
    // TODO: 实现重随机逻辑
    return {
      success: true,
      message: '重新随机了稀有词缀',
      resultItem: item
    }
  }
  
  /**
   * 添加随机词缀
   */
  private addRandomModifier(item: Equipment): CraftingResult {
    // TODO: 实现添加词缀逻辑
    return {
      success: true,
      message: '添加了新的随机词缀',
      resultItem: item
    }
  }
  
  /**
   * 重随机词缀数值
   */
  private rerollModifierValues(item: Equipment): CraftingResult {
    // TODO: 实现重随机数值逻辑
    return {
      success: true,
      message: '重新随机了词缀数值',
      resultItem: item
    }
  }
  
  /**
   * 计算通货掉落概率
   */
  private calculateCurrencyDropChance(monsterLevel: number, playerLevel: number): number {
    const baseChance = 0.15 // 15%基础掉落率
    const levelDifference = monsterLevel - playerLevel
    
    // 等级差异影响掉落率
    let modifier = 1.0
    if (levelDifference > 5) {
      modifier = 1.2 // 高等级怪物增加掉落率
    } else if (levelDifference < -5) {
      modifier = 0.5 // 低等级怪物减少掉落率
    }
    
    return baseChance * modifier
  }
  
  /**
   * 选择随机通货类型
   */
  private selectRandomCurrency(monsterLevel: number): CurrencyType {
    // 根据怪物等级决定通货类型权重
    const weights: Array<{ type: CurrencyType; weight: number }> = [
      { type: 'scroll_of_wisdom', weight: 30 },
      { type: 'portal_scroll', weight: 25 },
      { type: 'orb_of_transmutation', weight: 20 },
      { type: 'orb_of_alteration', weight: 10 },
      { type: 'orb_of_alchemy', weight: 8 },
      { type: 'chaos_orb', weight: 5 },
      { type: 'exalted_orb', weight: 1.5 },
      { type: 'divine_orb', weight: 0.5 }
    ]
    
    // 高等级怪物增加稀有通货权重
    if (monsterLevel > 50) {
      weights.forEach(w => {
        if (['chaos_orb', 'exalted_orb', 'divine_orb'].includes(w.type)) {
          w.weight *= 2
        }
      })
    }
    
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const weight of weights) {
      random -= weight.weight
      if (random <= 0) {
        return weight.type
      }
    }
    
    return 'scroll_of_wisdom' // 默认
  }
  
  /**
   * 获取通货兑换率
   */
  private getCurrencyExchangeRate(fromType: CurrencyType, toType: CurrencyType): number | null {
    // TODO: 实现通货兑换率表
    const exchangeRates: Record<string, number> = {
      'scroll_of_wisdom->orb_of_transmutation': 4,
      'orb_of_transmutation->orb_of_alteration': 4,
      'orb_of_alchemy->chaos_orb': 2,
      'chaos_orb->exalted_orb': 0.01
    }
    
    const key = `${fromType}->${toType}`
    return exchangeRates[key] || null
  }
}

// 类型定义

export interface CurrencyInfo {
  name: string
  description: string
  rarity: string
  stackSize: number
  effects: string[]
}

export interface CurrencyDrop {
  type: CurrencyType
  quantity: number
  dropChance: number
}

export interface CraftingResult {
  success: boolean
  message: string
  resultItem: Equipment
}

export interface TradeResult {
  success: boolean
  message: string
  receivedAmount: number
} 