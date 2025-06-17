import { EventBus } from '../../core/EventBus'
import type { Character } from '../../types/character'
import type { DamageType } from '../../types/combat'

/**
 * 战斗领域服务
 * 处理所有战斗相关的业务逻辑
 */
export class CombatDomain {
  private eventBus: EventBus
  
  constructor() {
    this.eventBus = EventBus.getInstance()
  }
  
  /**
   * 开始战斗
   */
  public startCombat(attackerId: string, targetId: string): void {
    console.log(`⚔️ 开始战斗: ${attackerId} vs ${targetId}`)
    
    this.eventBus.emit('combat:started', {
      attackerId,
      targetId
    })
  }
  
  /**
   * 计算物理伤害
   */
  public calculatePhysicalDamage(attacker: Character, baseDamage: number): number {
    const { strength } = attacker.baseAttributes
    const { physicalDamage, criticalChance, criticalMultiplier } = attacker.derivedAttributes
    
    // 基础伤害 = 武器伤害 + 力量加成
    let totalDamage = baseDamage + physicalDamage
    
    // 暴击判定
    if (Math.random() < criticalChance) {
      totalDamage *= criticalMultiplier
      console.log(`💥 暴击！伤害: ${totalDamage}`)
    }
    
    return Math.round(totalDamage)
  }
  
  /**
   * 计算元素伤害
   */
  public calculateElementalDamage(attacker: Character, baseDamage: number, elementType: 'fire' | 'cold' | 'lightning'): number {
    const { intelligence } = attacker.baseAttributes
    const { elementalDamage, criticalChance, criticalMultiplier } = attacker.derivedAttributes
    
    // 元素伤害 = 基础元素伤害 + 智力加成
    let totalDamage = baseDamage + elementalDamage
    
    // 暴击判定
    if (Math.random() < criticalChance) {
      totalDamage *= criticalMultiplier
      console.log(`⚡ 元素暴击 (${elementType})！伤害: ${totalDamage}`)
    }
    
    return Math.round(totalDamage)
  }
  
  /**
   * 攻击目标
   */
  public attack(attackerId: string, targetId: string, skillId?: string): DamageResult {
    // TODO: 根据attackerId获取角色数据
    // TODO: 根据targetId获取目标数据
    // TODO: 根据skillId应用技能效果
    
    const damage = this.calculateBasicAttackDamage(attackerId, targetId)
    
    this.eventBus.emit('combat:damage', {
      attackerId,
      targetId,
      damage: damage.total,
      damageType: damage.type
    })
    
    return damage
  }
  
  /**
   * 使用技能
   */
  public useSkill(casterId: string, skillId: string, targetId?: string): SkillResult {
    console.log(`🔮 使用技能: ${skillId}`)
    
    // TODO: 根据技能ID获取技能数据
    // TODO: 检查技能使用条件（魔法值、冷却时间等）
    // TODO: 应用技能效果
    
    this.eventBus.emit('skill:used', {
      characterId: casterId,
      skillId,
      targetId
    })
    
    return {
      success: true,
      effects: [],
      damage: 0
    }
  }
  
  /**
   * 应用伤害到目标
   */
  public applyDamage(targetId: string, damage: number, damageType: DamageType): DamageApplication {
    // TODO: 根据targetId获取目标数据
    // TODO: 计算防御减免
    // TODO: 应用抗性
    // TODO: 更新生命值
    
    const finalDamage = this.calculateDamageReduction(damage, damageType, targetId)
    
    console.log(`💔 ${targetId} 受到 ${finalDamage} 点 ${damageType} 伤害`)
    
    return {
      originalDamage: damage,
      finalDamage,
      damageType,
      isKilled: false // TODO: 检查是否死亡
    }
  }
  
  /**
   * 治疗目标
   */
  public heal(targetId: string, amount: number): HealResult {
    console.log(`💚 治疗 ${targetId}: ${amount} 点生命值`)
    
    // TODO: 应用治疗效果
    // TODO: 检查治疗加成
    
    this.eventBus.emit('combat:heal', {
      targetId,
      amount
    })
    
    return {
      originalAmount: amount,
      finalAmount: amount,
      overflow: 0
    }
  }
  
  /**
   * 结束战斗
   */
  public endCombat(winnerId: string, loserId: string): void {
    console.log(`🏆 战斗结束: ${winnerId} 获胜`)
    
    this.eventBus.emit('combat:ended', {
      winnerId,
      loserId
    })
  }
  
  /**
   * 计算基础攻击伤害
   */
  private calculateBasicAttackDamage(attackerId: string, targetId: string): DamageResult {
    // TODO: 实现基础攻击伤害计算
    const baseDamage = 10
    const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4)) // 80%-120%随机
    
    return {
      total: damage,
      type: 'physical',
      isCritical: false
    }
  }
  
  /**
   * 计算伤害减免
   */
  private calculateDamageReduction(damage: number, damageType: DamageType, targetId: string): number {
    // TODO: 根据目标的防御属性计算减免
    // TODO: 应用抗性
    
    // 简单的减免计算
    const reduction = 0.1 // 10%减免
    return Math.floor(damage * (1 - reduction))
  }
}

// 类型定义
export interface DamageResult {
  total: number
  type: DamageType
  isCritical: boolean
}

export interface SkillResult {
  success: boolean
  effects: SkillEffect[]
  damage: number
}

export interface SkillEffect {
  type: string
  value: number
  duration?: number
}

export interface DamageApplication {
  originalDamage: number
  finalDamage: number
  damageType: DamageType
  isKilled: boolean
}

export interface HealResult {
  originalAmount: number
  finalAmount: number
  overflow: number
} 