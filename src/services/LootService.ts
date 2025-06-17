import i18n from '@/i18n'
import type { LootTable, LootGroup } from '@/types/loot'
import type { Monster } from '@/types/monster'
import testLootConfig from '@/configs/testLoot'  // 使用测试配置
import { LOOT_CONFIG } from '@/configs/equipment/loot'
import { EquipmentService } from './EquipmentService'
import { EQUIPMENT_BASES } from '@/configs/equipment/bases'

export class LootService {
  private static instance: LootService

  private constructor() {}

  static getInstance(): LootService {
    if (!LootService.instance) {
      LootService.instance = new LootService()
    }
    return LootService.instance
  }

  // 根据权重随机选择
  private weightedRandom<T>(items: { weight: number, item: T }[]): T | null {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    if (totalWeight <= 0) return null

    let random = Math.random() * totalWeight
    for (const { weight, item } of items) {
      random -= weight
      if (random <= 0) return item
    }
    return null
  }

  // 获取掉落数量
  private getQuantity(range?: { min: number; max: number }): number {
    if (!range) return 1
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  }

  // 从掉落组中获取物品
  private rollGroup(groupId: string): { itemId: string, quantity: number } | null {
    const groups = i18n.global.messages.value.zh.loot.groups
    const group = groups[groupId] as LootGroup

    if (!group) return null

    const selectedItem = this.weightedRandom(
      group.items.map(item => ({
        weight: item.weight,
        item: {
          itemId: item.itemId,
          quantityRange: item.quantityRange
        }
      }))
    )

    if (!selectedItem) return null

    return {
      itemId: selectedItem.itemId,
      quantity: this.getQuantity(selectedItem.quantityRange)
    }
  }

  // 生成掉落
  generateLoot(monsters: Monster[]) {
    console.log('=================== 开始生成掉落 ===================')
    console.log('处理怪物:', monsters)
    
    if (!monsters || monsters.length === 0) {
      console.warn('没有怪物数据，无法生成掉落')
      return null
    }

    let totalExp = 0
    let totalGold = 0
    const items: any[] = []

    monsters.forEach((monster, index) => {
      console.log(`\n处理第 ${index + 1} 个怪物: ${monster.name} (Lv.${monster.level})`)
      
      // 基础经验和金币
      const expReward = this.calculateExpReward(monster)
      const goldReward = this.calculateGoldReward(monster)
      totalExp += expReward
      totalGold += goldReward
      
      console.log(`基础奖励: ${expReward} 经验, ${goldReward} 金币`)

      // 根据怪物类型选择掉落表
      const lootTable = monster.isElite ? 
        testLootConfig.tables.elite_monster : 
        testLootConfig.tables.normal_monster

      // 决定掷骰子次数
      const rolls = this.getRandomInt(
        lootTable.rolls.min, 
        lootTable.rolls.max
      )

      console.log(`\n掷骰子次数: ${rolls} (范围: ${lootTable.rolls.min}-${lootTable.rolls.max})`)

      // 每次掷骰子都有机会从不同组中获得物品
      for (let i = 0; i < rolls; i++) {
        console.log(`\n第 ${i + 1} 次掷骰子:`)
        const groupRoll = Math.random() * 100
        let accumulatedWeight = 0

        console.log('掷出点数:', groupRoll.toFixed(2))

        // 遍历所有可能的掉落组
        for (const groupConfig of lootTable.groups) {
          accumulatedWeight += groupConfig.weight
          console.log(`检查掉落组 ${groupConfig.id} (权重: ${groupConfig.weight}, 累计权重: ${accumulatedWeight})`)
          
          if (groupRoll <= accumulatedWeight) {
            // 找到对应的物品组
            const group = testLootConfig.groups[groupConfig.id]
            if (group) {
              console.log(`命中掉落组: ${groupConfig.id}`)
              const item = this.rollItemFromGroup(group)
              if (item) {
                console.log(`获得物品:`, item)
                items.push(item)
              }
            }
            break
          }
        }
      }
    })

    const rewards = {
      exp: totalExp,
      gold: totalGold,
      items: items
    }

    console.log('\n=================== 最终掉落 ===================')
    console.log('经验:', totalExp)
    console.log('金币:', totalGold)
    console.log('物品:', items)
    console.log('================================================')

    return rewards
  }

  private rollItemFromGroup(group: any) {
    console.log('\n从物品组中选择物品:', group.id, '组内物品数量:', group.items.length)
    
    const totalWeight = group.items.reduce((sum: number, item: any) => sum + (item.weight || 1), 0)
    let roll = Math.random() * totalWeight
    
    console.log('物品组总权重:', totalWeight)
    console.log('掷出点数:', roll.toFixed(2))

    for (const itemConfig of group.items) {
      roll -= (itemConfig.weight || 1)
      console.log(`检查物品 ${itemConfig.itemId} (权重: ${itemConfig.weight || 1}, 剩余点数: ${roll.toFixed(2)})`)
      
      if (roll <= 0) {
        // 检查是否是装备类物品
        const equipmentBase = EQUIPMENT_BASES[itemConfig.itemId]
        if (equipmentBase) {
          console.log('生成装备:', itemConfig.itemId, '品质:', itemConfig.quality)
          const equipment = EquipmentService.getInstance().generateEquipment(
            equipmentBase,
            Math.floor(Math.random() * 20) + 1,
            itemConfig.quality
          )
          return {
            id: equipment.id,
            item: equipment,
            quantity: 1
          }
        }

        // 其他物品（如通货）
        const quantity = itemConfig.quantityRange ? 
          this.getRandomInt(itemConfig.quantityRange.min, itemConfig.quantityRange.max) : 
          1

        console.log('生成物品:', itemConfig.itemId, '数量:', quantity)
        return {
          id: itemConfig.itemId,
          quantity: quantity
        }
      }
    }
    return null
  }

  private calculateExpReward(monster: Monster): number {
    const baseExp = (monster.level || 1) * 10
    const variation = 0.2
    const result = Math.floor(baseExp * (1 + Math.random() * variation))
    console.log(`经验计算: 基础(${baseExp}) * 变化(${1 + Math.random() * variation}) = ${result}`)
    return result
  }

  private calculateGoldReward(monster: Monster): number {
    const baseGold = (monster.level || 1) * 5
    const variation = 0.3
    const result = Math.floor(baseGold * (1 + Math.random() * variation))
    console.log(`金币计算: 基础(${baseGold}) * 变化(${1 + Math.random() * variation}) = ${result}`)
    return result
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private rollLootTable(table: any): any[] {
    const rewards: any[] = []
    const rolls = this.getRandomInt(table.rolls.min, table.rolls.max)
    
    console.log('\n掷骰子次数:', rolls, `(范围: ${table.rolls.min}-${table.rolls.max})`)

    // 计算总权重
    const totalWeight = table.groups.reduce((sum: number, group: any) => sum + group.weight, 0)

    for (let i = 0; i < rolls; i++) {
      console.log(`\n第 ${i + 1} 次掷骰子:`)
      const roll = Math.random() * totalWeight
      console.log('掷出点数:', roll.toFixed(2), '总权重:', totalWeight)

      let accumulatedWeight = 0
      for (const group of table.groups) {
        accumulatedWeight += group.weight
        console.log(`检查掉落组 ${group.id} (权重: ${group.weight}, 累计权重: ${accumulatedWeight})`)
        
        if (roll <= accumulatedWeight) {
          console.log('命中掉落组:', group.id)
          const item = this.rollItemFromGroup(this.lootConfig.groups[group.id])
          if (item) {
            rewards.push(item)
          }
          break
        }
      }
    }
    
    return rewards
  }
}

export const lootService = LootService.getInstance() 