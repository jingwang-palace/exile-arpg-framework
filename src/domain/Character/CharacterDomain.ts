import { EventBus } from '../../core/EventBus'
import type { Character, CharacterClass, BaseAttributes, DerivedAttributes } from '../../types/character'
import type { EquipmentSlot, Equipment } from '../../types/equipment'
import type { AscendancyClass } from '../../types/ascendancy'

/**
 * 角色领域服务
 * 处理角色相关的所有业务逻辑
 */
export class CharacterDomain {
  private eventBus: EventBus
  
  constructor() {
    this.eventBus = EventBus.getInstance()
  }
  
  /**
   * 创建新角色
   */
  public createCharacter(
    name: string, 
    characterClass: CharacterClass
  ): Character {
    const character: Character = {
      id: this.generateCharacterId(),
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      baseAttributes: this.getStartingAttributes(characterClass),
      derivedAttributes: this.calculateDerivedAttributes(
        this.getStartingAttributes(characterClass), 
        []
      ),
      resistances: {
        fireResistance: 0,
        coldResistance: 0,
        lightningResistance: 0,
        chaosResistance: 0
      },
      skillPoints: 1,
      ascendancyPoints: 0,
      passivePoints: 2,
      inventory: {
        id: this.generateInventoryId(),
        items: [],
        maxSlots: this.getStartingInventorySize(characterClass),
        gold: this.getStartingGold(characterClass)
      },
      gold: this.getStartingGold(characterClass),
      quests: {
        completed: [],
        active: []
      },
      created: Date.now(),
      lastPlayed: Date.now(),
      playTime: 0
    }
    
    // 发送角色创建事件
    this.eventBus.emit('character:created', { characterId: character.id })
    
    console.log(`✅ 创建角色: ${name} (${characterClass})`)
    return character
  }
  
  /**
   * 角色升级
   */
  public levelUp(character: Character): Character {
    const oldLevel = character.level
    const newLevel = oldLevel + 1
    
    // 计算升级所需经验
    const requiredExp = this.getRequiredExperience(newLevel)
    if (character.experience < requiredExp) {
      throw new Error(`经验不足，需要 ${requiredExp} 经验，当前 ${character.experience}`)
    }
    
    // 更新等级
    character.level = newLevel
    
    // 获得奖励
    const rewards = this.getLevelUpRewards(newLevel)
    character.skillPoints += rewards.skillPoints
    character.passivePoints += rewards.passivePoints
    
    // 特殊等级奖励
    if (this.isSpecialLevel(newLevel)) {
      character.passivePoints += 1 // 特殊等级额外奖励
    }
    
    // 重新计算衍生属性
    character.derivedAttributes = this.calculateDerivedAttributes(
      character.baseAttributes,
      [] // TODO: 添加装备加成
    )
    
    // 发送升级事件
    this.eventBus.emit('character:levelUp', { 
      characterId: character.id, 
      newLevel 
    })
    
    console.log(`🎉 角色升级: ${character.name} 达到 ${newLevel} 级`)
    return character
  }
  
  /**
   * 获得经验值
   */
  public gainExperience(character: Character, amount: number): Character {
    const oldExp = character.experience
    character.experience += amount
    
    // 检查是否可以升级
    const requiredExp = this.getRequiredExperience(character.level + 1)
    if (character.experience >= requiredExp) {
      this.levelUp(character)
    }
    
    console.log(`📈 ${character.name} 获得 ${amount} 经验 (${oldExp} -> ${character.experience})`)
    return character
  }
  
  /**
   * 装备道具
   */
  public equipItem(
    character: Character, 
    item: Equipment, 
    slot: EquipmentSlot
  ): Character {
    // 验证装备需求
    if (!this.canEquipItem(character, item)) {
      throw new Error(`无法装备 ${item.name}: 不满足装备需求`)
    }
    
    // TODO: 实现装备逻辑
    // 1. 卸下当前装备
    // 2. 装备新道具
    // 3. 重新计算属性
    
    this.eventBus.emit('equipment:equipped', {
      characterId: character.id,
      itemId: item.id,
      slot
    })
    
    return character
  }
  
  /**
   * 选择升华职业
   */
  public selectAscendancy(
    character: Character, 
    ascendancyClass: AscendancyClass
  ): Character {
    // 验证是否可以选择升华
    if (character.level < 30) {
      throw new Error('必须达到30级才能选择升华职业')
    }
    
    // TODO: 验证升华任务完成情况
    
    // 更新角色升华信息
    // character.ascendancy = {
    //   class: ascendancyClass,
    //   allocatedNodes: [],
    //   availablePoints: 2 // 初始升华点数
    // }
    
    this.eventBus.emit('ascendancy:selected', {
      characterId: character.id,
      ascendancyId: ascendancyClass
    })
    
    console.log(`🌟 ${character.name} 选择升华职业: ${ascendancyClass}`)
    return character
  }
  
  /**
   * 计算角色战斗力
   */
  public calculateCombatPower(character: Character): number {
    const attrs = character.derivedAttributes
    
    // 综合战斗力计算
    const offensivePower = (
      attrs.physicalDamage + 
      attrs.elementalDamage + 
      attrs.chaosDamage
    ) * attrs.attackSpeed * (1 + attrs.criticalChance * attrs.criticalMultiplier)
    
    const defensivePower = (
      attrs.maxHealth + 
      attrs.maxEnergy + 
      attrs.armor + 
      attrs.evasion
    ) * (1 + attrs.blockChance)
    
    return Math.round((offensivePower + defensivePower) / 2)
  }
  
  /**
   * 获取职业的起始属性
   */
  private getStartingAttributes(characterClass: CharacterClass): BaseAttributes {
    const baseStats: Record<CharacterClass, BaseAttributes> = {
      [CharacterClass.Marauder]: {
        strength: 32,
        dexterity: 14,
        intelligence: 14,
        vitality: 32
      },
      [CharacterClass.Duelist]: {
        strength: 23,
        dexterity: 23,
        intelligence: 14,
        vitality: 23
      },
      [CharacterClass.Ranger]: {
        strength: 14,
        dexterity: 32,
        intelligence: 14,
        vitality: 23
      },
      [CharacterClass.Shadow]: {
        strength: 14,
        dexterity: 23,
        intelligence: 23,
        vitality: 20
      },
      [CharacterClass.Witch]: {
        strength: 14,
        dexterity: 14,
        intelligence: 32,
        vitality: 20
      },
      [CharacterClass.Templar]: {
        strength: 23,
        dexterity: 14,
        intelligence: 23,
        vitality: 23
      },
      [CharacterClass.Scion]: {
        strength: 20,
        dexterity: 20,
        intelligence: 20,
        vitality: 20
      }
    }
    
    return baseStats[characterClass]
  }
  
  /**
   * 计算衍生属性
   */
  private calculateDerivedAttributes(
    baseAttributes: BaseAttributes,
    equipmentBonuses: any[] = []
  ): DerivedAttributes {
    // 基础计算公式
    const { strength, dexterity, intelligence, vitality } = baseAttributes
    
    return {
      // 生命和魔法
      maxHealth: vitality * 5 + strength * 2 + 50,
      currentHealth: vitality * 5 + strength * 2 + 50,
      maxMana: intelligence * 3 + 20,
      currentMana: intelligence * 3 + 20,
      maxEnergy: intelligence * 2,
      currentEnergy: intelligence * 2,
      
      // 伤害
      physicalDamage: strength * 1.2 + 8,
      elementalDamage: intelligence * 1.0,
      chaosDamage: 0,
      attackSpeed: 1.0 + (dexterity / 200),
      castSpeed: 1.0 + (intelligence / 200),
      criticalChance: 0.05 + (dexterity / 1000),
      criticalMultiplier: 1.5,
      
      // 防御
      armor: strength * 0.5,
      evasion: dexterity * 0.8,
      energyShield: intelligence * 0.3,
      blockChance: 0,
      
      // 其他
      movementSpeed: 100 + (dexterity / 10),
      lifeRegeneration: vitality * 0.1,
      manaRegeneration: intelligence * 0.2
    }
  }
  
  /**
   * 获取升级所需经验
   */
  private getRequiredExperience(level: number): number {
    // 指数增长的经验需求
    return Math.floor(100 * Math.pow(1.1, level - 1))
  }
  
  /**
   * 获取升级奖励
   */
  private getLevelUpRewards(level: number): { skillPoints: number; passivePoints: number } {
    return {
      skillPoints: 1,
      passivePoints: 1
    }
  }
  
  /**
   * 是否为特殊等级（额外奖励）
   */
  private isSpecialLevel(level: number): boolean {
    const specialLevels = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100]
    return specialLevels.includes(level)
  }
  
  /**
   * 检查是否可以装备道具
   */
  private canEquipItem(character: Character, item: Equipment): boolean {
    // TODO: 实现装备需求检查
    // 1. 等级需求
    // 2. 属性需求
    // 3. 职业需求
    return true
  }
  
  /**
   * 获取起始背包大小
   */
  private getStartingInventorySize(characterClass: CharacterClass): number {
    return 24 // 默认6x4背包
  }
  
  /**
   * 获取起始金币
   */
  private getStartingGold(characterClass: CharacterClass): number {
    return 100
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