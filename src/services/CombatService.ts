import type { Character } from '@/types/character'
import type { Monster } from '@/types/monster'
import type { CombatLog } from '@/types/combat'
import { lootService } from './LootService'
import i18n from '@/i18n'  // 直接导入 i18n 实例

export class CombatService {
  private player: Character
  private monsters: Monster[]
  private logs: CombatLog[] = []
  private defeatedMonsters: Monster[] = []
  private logUpdateCallback: ((log: CombatLog) => void) | null = null

  constructor(player: Character, monsters: Monster[]) {
    console.log('CombatService initialized with monsters:', monsters)
    this.player = { ...player }
    this.monsters = monsters.map(m => ({ ...m }))
    this.defeatedMonsters = []  // 确保初始化时清空
    
    // 初始化怪物生命值
    this.monsters.forEach(monster => {
      monster.currentHealth = monster.maxHealth
    })
  }

  // 添加日志更新回调
  onLogUpdate(callback: (log: CombatLog) => void) {
    this.logUpdateCallback = callback
  }

  // 添加日志的方法
  private addLog(log: CombatLog) {
    this.logs.push(log)
    if (this.logUpdateCallback) {
      this.logUpdateCallback(log)
    }
  }

  private calculateDamage(attacker: Character | Monster, defender: Character | Monster): number {
    // 判断是否为角色
    const isAttackerCharacter = 'derivedAttributes' in attacker
    const isDefenderCharacter = 'derivedAttributes' in defender

    // 获取攻击力和防御力
    const attack = isAttackerCharacter 
      ? attacker.derivedAttributes.attack 
      : attacker.attack || 10

    const defense = isDefenderCharacter 
      ? defender.derivedAttributes.defense 
      : defender.defense || 5
    
    const baseDamage = Math.max(1, attack - defense)
    const variation = 0.2 // 20% 伤害浮动
    const multiplier = 1 + (Math.random() * variation * 2 - variation)
    
    const finalDamage = Math.floor(baseDamage * multiplier)
    console.log('Damage calculation:', { attack, defense, baseDamage, finalDamage })
    
    return finalDamage
  }

  private async processTurn(): Promise<boolean> {
    let allMonstersDefeated = true

    // 玩家攻击
    for (const monster of this.monsters.filter(m => m.currentHealth > 0)) {
      const damage = this.calculateDamage(this.player, monster)
      const previousHealth = monster.currentHealth
      monster.currentHealth = Math.max(0, monster.currentHealth - damage)
      
      console.log(`Monster ${monster.name} took ${damage} damage, health: ${monster.currentHealth}/${monster.maxHealth}`)
      
      this.addLog({
        type: 'damage',
        message: `${this.player.name} 对 ${monster.name} 造成了 ${damage} 点伤害，剩余生命：${monster.currentHealth}/${monster.maxHealth}`
      })

      if (previousHealth > 0 && monster.currentHealth <= 0) {
        console.log('Monster defeated, adding to defeatedMonsters:', monster)
        this.addLog({
          type: 'death',
          message: `${monster.name} 被击败了！`
        })
        // 深拷贝怪物数据
        this.defeatedMonsters.push(JSON.parse(JSON.stringify({
          ...monster,
          id: monster.id,
          name: monster.name,
          level: monster.level || 1,
          isElite: !!monster.isElite
        })))
      }

      if (monster.currentHealth > 0) {
        allMonstersDefeated = false
      }

      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // 怪物攻击
    if (!allMonstersDefeated) {
      for (const monster of this.monsters.filter(m => m.currentHealth > 0)) {
        const damage = this.calculateDamage(monster, this.player)
        this.player.derivedAttributes.health = Math.max(0, this.player.derivedAttributes.health - damage)
        
        this.addLog({
          type: 'damage',
          message: `${monster.name} 对 ${this.player.name} 造成了 ${damage} 点伤害，剩余生命：${this.player.derivedAttributes.health}/${this.player.derivedAttributes.maxHealth}`
        })

        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    return allMonstersDefeated
  }

  private generateLootLogs(rewards: any) {
    console.log('Generating loot logs for rewards:', rewards)
    const lootLogs: CombatLog[] = []
    
    if (!rewards.exp && !rewards.gold && (!rewards.items || rewards.items.length === 0)) {
      lootLogs.push({
        type: 'reward',
        message: '什么也没有掉落...'
      })
      return lootLogs
    }
    
    // 经验值
    if (rewards.exp) {
      lootLogs.push({
        type: 'reward',
        message: `获得 ${rewards.exp} 点经验值`
      })
    }
    
    // 金币
    if (rewards.gold) {
      lootLogs.push({
        type: 'reward',
        message: `获得 ${rewards.gold} 金币`
      })
    }
    
    // 物品
    if (rewards.items && rewards.items.length > 0) {
      rewards.items.forEach((item: any) => {
        const rarityText = item.rarity === 'rare' ? '【稀有】' : ''
        lootLogs.push({
          type: item.rarity === 'rare' ? 'reward-rare' : 'reward',
          message: `获得 ${rarityText}${item.name} x${item.quantity}`
        })
      })
    }
    
    return lootLogs
  }

  async startCombat() {
    console.log('Starting combat with monsters:', this.monsters)
    this.defeatedMonsters = []  // 确保开始战斗时清空
    
    this.addLog({
      type: 'start',
      message: '战斗开始！'
    })

    let isVictory = false
    
    while (this.player.derivedAttributes.health > 0) {
      const allMonstersDefeated = await this.processTurn()
      
      if (allMonstersDefeated) {
        isVictory = true
        break
      }
    }

    if (isVictory) {
      console.log('Victory! Defeated monsters:', this.defeatedMonsters)
      
      this.addLog({
        type: 'victory',
        message: '战斗胜利！'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      // 生成战利品
      const finalRewards = lootService.generateLoot(this.defeatedMonsters)
      console.log('Generated rewards:', finalRewards)

      if (finalRewards) {
        this.addLog({
          type: 'separator',
          message: '——————战利品——————'
        })

        // 经验值
        if (finalRewards.exp) {
          this.addLog({
            type: 'reward',
            message: `获得 ${finalRewards.exp} 点经验值`
          })
          await new Promise(resolve => setTimeout(resolve, 300))
        }

        // 金币
        if (finalRewards.gold) {
          this.addLog({
            type: 'reward',
            message: `获得 ${finalRewards.gold} ${i18n.global.t('items.items.gold_coin.name')}`
          })
          await new Promise(resolve => setTimeout(resolve, 300))
        }

        // 物品
        if (finalRewards.items && finalRewards.items.length > 0) {
          for (const item of finalRewards.items) {
            const itemName = i18n.global.t(`items.items.${item.id}.name`)
            const rarityText = item.rarity === 'rare' ? '【稀有】' : ''
            this.addLog({
              type: item.rarity === 'rare' ? 'reward-rare' : 'reward',
              message: `获得 ${rarityText}${itemName} x${item.quantity}`
            })
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
      }

      return {
        victory: true,
        logs: this.logs,
        rewards: finalRewards
      }
    }

    return {
      victory: false,
      logs: this.logs,
      rewards: null
    }
  }
} 