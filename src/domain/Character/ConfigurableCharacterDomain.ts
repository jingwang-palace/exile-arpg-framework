import { EventBus } from '../../core/EventBus'
import { ConfigLoader } from '../../infrastructure/ConfigLoader'
import type { Character, CharacterClass, BaseAttributes, DerivedAttributes } from '../../types/character'
import type { EquipmentSlot, Equipment } from '../../types/equipment'
import type { AscendancyClass } from '../../types/ascendancy'
import type { CharacterClassConfig, GameConfig } from '../../config/schema/ConfigSchema'

/**
 * 配置驱动的角色领域服务
 * 所有角色相关的数值和规则都从配置文件中读取
 */
export class ConfigurableCharacterDomain {
  private eventBus: EventBus
  private configLoader: ConfigLoader
  
  constructor() {
    this.eventBus = EventBus.getInstance()
    this.configLoader = ConfigLoader.getInstance()
  }
  
  /**
   * 创建新角色（基于配置）
   */
  public createCharacter(
    name: string, 
    characterClass: CharacterClass
  ): Character {
    const classConfig = this.configLoader.getCharacterConfig(characterClass)
    if (!classConfig) {
      throw new Error(`未找到角色职业配置: ${characterClass}`)
    }
    
    const gameConfig = this.configLoader.getGameConfig()
    
    const character: Character = {
      id: this.generateCharacterId(),
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      baseAttributes: this.getConfigurableStartingAttributes(classConfig, gameConfig),
      derivedAttributes: this.calculateConfigurableDerivedAttributes(
        this.getConfigurableStartingAttributes(classConfig, gameConfig), 
        [],
        gameConfig
      ),
      resistances: {
        fireResistance: 0,
        coldResistance: 0,
        lightningResistance: 0,
        chaosResistance: 0
      },
      skillPoints: gameConfig.balance.character.levelingCurve.skillPointsPerLevel,
      ascendancyPoints: 0,
      passivePoints: gameConfig.balance.character.levelingCurve.attributePointsPerLevel,
      inventory: {
        id: this.generateInventoryId(),
        items: [],
        maxSlots: this.getConfigurableInventorySize(classConfig),
        gold: this.getConfigurableStartingGold(classConfig)
      },
      gold: this.getConfigurableStartingGold(classConfig),
      quests: {
        completed: [],
        active: []
      },
      created: Date.now(),
      lastPlayed: Date.now(),
      playTime: 0
    }
    
    // 添加起始技能
    this.grantStartingSkills(character, classConfig)
    
    // 发送角色创建事件
    this.eventBus.emit('character:created', { 
      characterId: character.id,
      characterClass,
      config: classConfig 
    })
    
    console.log(`✅ 创建角色: ${name} (${characterClass}) - 基于配置`)
    return character
  }
  
  /**
   * 角色升级（基于配置的经验曲线）
   */
  public levelUp(character: Character): Character {
    const gameConfig = this.configLoader.getGameConfig()
    const oldLevel = character.level
    const newLevel = oldLevel + 1
    
    // 检查最大等级
    if (newLevel > gameConfig.balance.character.levelingCurve.maxLevel) {
      throw new Error(`已达到最大等级: ${gameConfig.balance.character.levelingCurve.maxLevel}`)
    }
    
    // 计算升级所需经验（基于配置的经验曲线）
    const requiredExp = this.getConfigurableRequiredExperience(newLevel, gameConfig)
    if (character.experience < requiredExp) {
      throw new Error(`经验不足，需要 ${requiredExp} 经验，当前 ${character.experience}`)
    }
    
    // 更新等级
    character.level = newLevel
    
    // 获得奖励（基于配置）
    const rewards = this.getConfigurableLevelUpRewards(newLevel, gameConfig)
    character.skillPoints += rewards.skillPoints
    character.passivePoints += rewards.passivePoints
    
    // 重新计算衍生属性
    character.derivedAttributes = this.calculateConfigurableDerivedAttributes(
      character.baseAttributes,
      [], // TODO: 添加装备加成
      gameConfig
    )
    
    // 检查升华解锁
    this.checkAscendancyUnlock(character, newLevel)
    
    // 发送升级事件
    this.eventBus.emit('character:levelUp', { 
      characterId: character.id, 
      oldLevel,
      newLevel,
      rewards
    })
    
    console.log(`🎉 角色升级: ${character.name} 达到 ${newLevel} 级，获得 ${rewards.skillPoints} 技能点，${rewards.passivePoints} 属性点`)
    return character
  }
  
  /**
   * 获得经验值（基于配置的经验系统）
   */
  public gainExperience(character: Character, amount: number, source: string = 'unknown'): Character {
    const gameConfig = this.configLoader.getGameConfig()
    const oldExp = character.experience
    
    // 应用经验倍率（如果有的话）
    const multipliedAmount = this.applyExperienceMultipliers(amount, source, gameConfig)
    character.experience += multipliedAmount
    
    // 检查是否可以升级
    let leveledUp = false
    while (this.canLevelUp(character, gameConfig)) {
      this.levelUp(character)
      leveledUp = true
    }
    
    this.eventBus.emit('character:experienceGained', {
      characterId: character.id,
      amount: multipliedAmount,
      oldExp,
      newExp: character.experience,
      source,
      leveledUp
    })
    
    console.log(`📈 ${character.name} 获得 ${multipliedAmount} 经验 (${oldExp} -> ${character.experience}) 来源: ${source}`)
    return character
  }
  
  /**
   * 装备道具（基于配置的装备系统）
   */
  public equipItem(
    character: Character, 
    item: Equipment, 
    slot: EquipmentSlot
  ): Character {
    const itemConfig = this.configLoader.getEquipmentConfig(item.id)
    if (!itemConfig) {
      throw new Error(`未找到装备配置: ${item.id}`)
    }
    
    // 验证装备需求（基于配置）
    if (!this.canEquipItemByConfig(character, itemConfig)) {
      throw new Error(`无法装备 ${item.name}: 不满足装备需求`)
    }
    
    // TODO: 实现基于配置的装备逻辑
    // 1. 读取装备属性配置
    // 2. 应用装备效果
    // 3. 重新计算属性
    
    this.eventBus.emit('equipment:equipped', {
      characterId: character.id,
      itemId: item.id,
      slot,
      config: itemConfig
    })
    
    return character
  }
  
  /**
   * 选择升华职业（基于配置）
   */
  public selectAscendancy(
    character: Character, 
    ascendancyClass: AscendancyClass
  ): Character {
    const characterConfig = this.configLoader.getCharacterConfig(character.class)
    if (!characterConfig) {
      throw new Error(`未找到角色配置: ${character.class}`)
    }
    
    // 验证升华职业是否可用
    if (!characterConfig.ascendancyClasses.includes(ascendancyClass)) {
      throw new Error(`${character.class} 无法选择升华职业: ${ascendancyClass}`)
    }
    
    // 验证等级要求（基于配置）
    const gameConfig = this.configLoader.getGameConfig()
    const minLevel = 30 // TODO: 从配置中读取
    if (character.level < minLevel) {
      throw new Error(`必须达到 ${minLevel} 级才能选择升华职业`)
    }
    
    // TODO: 验证升华任务完成情况
    
    this.eventBus.emit('ascendancy:selected', {
      characterId: character.id,
      ascendancyId: ascendancyClass,
      baseClass: character.class
    })
    
    console.log(`🌟 ${character.name} 选择升华职业: ${ascendancyClass}`)
    return character
  }
  
  /**
   * 计算角色战斗力（基于配置的计算公式）
   */
  public calculateCombatPower(character: Character): number {
    const gameConfig = this.configLoader.getGameConfig()
    const attrs = character.derivedAttributes
    
    // 使用配置中的战斗力计算公式
    const physicalPower = attrs.physicalDamage * gameConfig.balance.combat.damageFormulas.physicalDamageBase
    const magicalPower = attrs.elementalDamage * gameConfig.balance.combat.damageFormulas.magicalDamageBase
    const defensivePower = attrs.maxHealth + attrs.armor
    
    const totalPower = physicalPower + magicalPower + defensivePower
    
    console.log(`⚔️ ${character.name} 战斗力: ${Math.round(totalPower)}`)
    return Math.round(totalPower)
  }
  
  // 私有方法：配置驱动的实现
  
  /**
   * 获取可配置的起始属性
   */
  private getConfigurableStartingAttributes(
    classConfig: CharacterClassConfig, 
    gameConfig: GameConfig
  ): BaseAttributes {
    return {
      strength: classConfig.startingAttributes.strength + gameConfig.balance.character.baseAttributes.strength,
      dexterity: classConfig.startingAttributes.dexterity + gameConfig.balance.character.baseAttributes.dexterity,
      intelligence: classConfig.startingAttributes.intelligence + gameConfig.balance.character.baseAttributes.intelligence,
      vitality: classConfig.startingAttributes.vitality + gameConfig.balance.character.baseAttributes.vitality
    }
  }
  
  /**
   * 计算可配置的衍生属性
   */
  private calculateConfigurableDerivedAttributes(
    baseAttributes: BaseAttributes,
    equipmentBonuses: any[] = [],
    gameConfig: GameConfig
  ): DerivedAttributes {
    const effects = gameConfig.balance.character.attributeEffects
    
    return {
      maxHealth: gameConfig.balance.character.baseAttributes.health + 
                 (baseAttributes.vitality * effects.vitalityHealthMultiplier),
      currentHealth: gameConfig.balance.character.baseAttributes.health + 
                     (baseAttributes.vitality * effects.vitalityHealthMultiplier),
      maxEnergy: gameConfig.balance.character.baseAttributes.mana + 
                 (baseAttributes.intelligence * effects.intelligenceManaMultiplier),
      currentEnergy: gameConfig.balance.character.baseAttributes.mana + 
                     (baseAttributes.intelligence * effects.intelligenceManaMultiplier),
      physicalDamage: baseAttributes.strength * effects.strengthDamageMultiplier,
      elementalDamage: baseAttributes.intelligence * 0.8,
      chaosDamage: 0,
      armor: baseAttributes.strength * 0.2,
      evasion: baseAttributes.dexterity * 0.3,
      accuracy: 95 + baseAttributes.dexterity * 0.5,
      criticalChance: gameConfig.balance.combat.damageFormulas.criticalChanceBase + 
                      baseAttributes.dexterity * 0.1,
      criticalMultiplier: gameConfig.balance.combat.damageFormulas.criticalMultiplier,
      attackSpeed: gameConfig.balance.combat.timing.attackSpeed + 
                   (baseAttributes.dexterity * effects.dexteritySpeedMultiplier),
      castSpeed: gameConfig.balance.combat.timing.castSpeed + 
                 (baseAttributes.intelligence * 0.01),
      movementSpeed: 100 + baseAttributes.dexterity * 0.5
    }
  }
  
  /**
   * 获取可配置的升级所需经验
   */
  private getConfigurableRequiredExperience(level: number, gameConfig: GameConfig): number {
    const curve = gameConfig.balance.character.levelingCurve
    return Math.floor(
      curve.experienceBase * Math.pow(curve.experienceMultiplier, level - 1)
    )
  }
  
  /**
   * 获取可配置的升级奖励
   */
  private getConfigurableLevelUpRewards(
    level: number, 
    gameConfig: GameConfig
  ): { skillPoints: number; passivePoints: number } {
    const curve = gameConfig.balance.character.levelingCurve
    
    return {
      skillPoints: curve.skillPointsPerLevel,
      passivePoints: curve.attributePointsPerLevel
    }
  }
  
  /**
   * 检查是否可以升级
   */
  private canLevelUp(character: Character, gameConfig: GameConfig): boolean {
    const nextLevel = character.level + 1
    if (nextLevel > gameConfig.balance.character.levelingCurve.maxLevel) {
      return false
    }
    
    const requiredExp = this.getConfigurableRequiredExperience(nextLevel, gameConfig)
    return character.experience >= requiredExp
  }
  
  /**
   * 应用经验倍率
   */
  private applyExperienceMultipliers(
    amount: number, 
    source: string, 
    gameConfig: GameConfig
  ): number {
    let multiplier = 1.0
    
    // 根据来源应用不同的倍率
    if (source === 'quest') {
      multiplier *= gameConfig.balance.progression.quests.experienceRewardMultiplier
    }
    
    return Math.floor(amount * multiplier)
  }
  
  /**
   * 检查升华解锁
   */
  private checkAscendancyUnlock(character: Character, level: number): void {
    // TODO: 从配置中读取升华解锁等级
    if (level === 30) {
      this.eventBus.emit('ascendancy:unlocked', {
        characterId: character.id,
        level
      })
    }
  }
  
  /**
   * 基于配置检查是否可以装备
   */
  private canEquipItemByConfig(character: Character, itemConfig: any): boolean {
    // 检查等级需求
    if (character.level < itemConfig.requirements.level) {
      return false
    }
    
    // 检查属性需求
    for (const [attr, required] of Object.entries(itemConfig.requirements.attributes || {})) {
      const characterAttr = (character.baseAttributes as any)[attr]
      if (characterAttr < (required as number)) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * 授予起始技能
   */
  private grantStartingSkills(character: Character, classConfig: CharacterClassConfig): void {
    for (const skillId of classConfig.startingSkills) {
      const skillConfig = this.configLoader.getSkillConfig(skillId)
      if (skillConfig) {
        this.eventBus.emit('skill:learned', {
          characterId: character.id,
          skillId,
          source: 'starting_skill'
        })
      }
    }
  }
  
  /**
   * 获取可配置的背包大小
   */
  private getConfigurableInventorySize(classConfig: CharacterClassConfig): number {
    // TODO: 从配置中读取不同职业的起始背包大小
    return 20
  }
  
  /**
   * 获取可配置的起始金币
   */
  private getConfigurableStartingGold(classConfig: CharacterClassConfig): number {
    // TODO: 从配置中读取不同职业的起始金币
    return 0
  }
  
  /**
   * 生成角色ID
   */
  private generateCharacterId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 生成背包ID
   */
  private generateInventoryId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
} 