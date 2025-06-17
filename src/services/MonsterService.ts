import type { Monster } from '@/types/monster'
import i18n from '@/i18n'
import type { Combatant } from '@/types/combat'
import { v4 as uuidv4 } from 'uuid'

export class MonsterService {
  private static instance: MonsterService

  private constructor() {}

  static getInstance(): MonsterService {
    if (!MonsterService.instance) {
      MonsterService.instance = new MonsterService()
    }
    return MonsterService.instance
  }

  // 获取所有怪物类型
  getAllMonsterTypes(): string[] {
    const monsters = i18n.global.messages.value.zh.monsters
    return Object.keys(monsters)
  }

  // 获取怪物配置
  getMonster(id: string): Monster {
    const monsters = i18n.global.messages.value.zh.monsters
    const monster = monsters[id]
    if (!monster) {
      throw new Error(`Monster ${id} not found`)
    }
    return this.cloneMonster(monster)
  }

  // 生成怪物实例
  createMonster(id: string): Monster {
    const monster = this.getMonster(id)
    return this.cloneMonster(monster)
  }

  // 根据等级范围随机生成怪物
  generateMonsters(count: { min: number; max: number }, playerLevel: number): Combatant[] {
    console.log('Generating monsters for player level:', playerLevel)
    
    const monsterCount = Math.floor(Math.random() * (count.max - count.min + 1)) + count.min
    const monsters: Combatant[] = []
    const monsterTypes = this.getAllMonsterTypes()

    for (let i = 0; i < monsterCount; i++) {
      // 随机选择一个怪物类型
      const monsterTypeIndex = Math.floor(Math.random() * monsterTypes.length)
      const monsterType = monsterTypes[monsterTypeIndex]
      
      try {
        const baseMonster = this.getMonster(monsterType)
        
        // 根据玩家等级调整怪物等级
        const monsterLevel = Math.max(1, playerLevel - 1 + Math.floor(Math.random() * 3))
        
        // 创建战斗者对象
        const monster: Combatant = {
          id: `${monsterType}-${uuidv4().slice(0, 8)}`,
          monsterId: monsterType,
          name: baseMonster.name,
          level: monsterLevel,
          currentHealth: baseMonster.health,
          maxHealth: baseMonster.health,
          attack: baseMonster.attack,
          defense: baseMonster.defense,
          isDead: false,
          isElite: !!baseMonster.isElite,
          rewards: {
            exp: baseMonster.exp,
            gold: baseMonster.gold,
            items: baseMonster.drops ? baseMonster.drops.map(drop => ({
              id: drop.itemId,
              chance: drop.chance
            })) : []
          }
        }

        monsters.push(monster)
        console.log('Generated monster:', monster.name, 'Level:', monster.level)
      } catch (error) {
        console.error('Error generating monster:', error)
      }
    }

    return monsters
  }

  // 深拷贝怪物对象，避免修改原始配置
  private cloneMonster(monster: Monster): Monster {
    return JSON.parse(JSON.stringify(monster))
  }
}

// 导出单例
export const monsterService = MonsterService.getInstance() 