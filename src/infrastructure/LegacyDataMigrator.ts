import { StateManager } from './StateManager'
import { GameStore } from '../stores/GameStore'
import { CharacterDomain } from '../domain/Character/CharacterDomain'
import type { Character, CharacterClass } from '../types/character'

/**
 * 数据迁移器
 * 负责将旧的GameStore数据迁移到新架构
 */
export class LegacyDataMigrator {
  private stateManager: StateManager
  private characterDomain: CharacterDomain
  private gameStore: GameStore
  
  constructor() {
    this.stateManager = StateManager.getInstance()
    this.characterDomain = new CharacterDomain()
    this.gameStore = GameStore.getInstance()
  }
  
  /**
   * 执行完整的数据迁移
   */
  public async migrateAllData(): Promise<void> {
    try {
      console.log('🔄 开始数据迁移...')
      
      // 迁移角色数据
      await this.migrateCharacterData()
      
      // 迁移游戏进度
      await this.migrateGameProgress()
      
      // 迁移其他数据
      await this.migrateOtherData()
      
      console.log('✅ 数据迁移完成')
      
    } catch (error) {
      console.error('❌ 数据迁移失败:', error)
      throw error
    }
  }
  
  /**
   * 迁移角色数据
   */
  private async migrateCharacterData(): Promise<void> {
    const playerData = this.gameStore.getPlayer()
    
    if (playerData.class) {
      console.log(`📋 迁移角色数据: ${playerData.name} (${playerData.class})`)
      
      // 创建新的角色对象
      const character = this.characterDomain.createCharacter(
        playerData.name,
        this.mapCharacterClass(playerData.class)
      )
      
      // 更新角色属性
      character.level = playerData.level
      character.experience = playerData.experience
      character.derivedAttributes.currentHealth = playerData.health
      character.derivedAttributes.maxHealth = playerData.maxHealth
      character.gold = playerData.gold
      
      // 迁移技能数据
      const skillData = this.gameStore.getSkills()
      character.skillPoints = skillData.availablePoints
      
      // 迁移天赋数据
      const talentData = this.gameStore.getTalents()
      character.passivePoints = talentData.availablePoints
      
      // 设置为当前角色
      this.stateManager.setCurrentCharacter(character)
      
      console.log(`✅ 角色数据迁移完成: ${character.name}`)
    }
  }
  
  /**
   * 迁移游戏进度
   */
  private async migrateGameProgress(): Promise<void> {
    console.log('📊 迁移游戏进度...')
    
    const gameData = this.gameStore.getAllData()
    
    // 迁移解锁功能
    if (gameData.progress?.unlockedFeatures) {
      gameData.progress.unlockedFeatures.forEach((feature: string) => {
        this.stateManager.unlockFeature(feature)
      })
    }
    
    // 迁移当前区域
    if (gameData.progress?.currentArea) {
      this.stateManager.updateCurrentArea(gameData.progress.currentArea)
    }
    
    console.log('✅ 游戏进度迁移完成')
  }
  
  /**
   * 迁移其他数据
   */
  private async migrateOtherData(): Promise<void> {
    console.log('💰 迁移其他数据...')
    
    // 迁移金币数据
    const gold = this.gameStore.getGold()
    if (gold > 0) {
      this.stateManager.updateCurrency('gold', gold)
    }
    
    // TODO: 迁移背包数据
    // TODO: 迁移升华数据
    
    console.log('✅ 其他数据迁移完成')
  }
  
  /**
   * 映射角色职业
   */
  private mapCharacterClass(oldClass: string): CharacterClass {
    const classMap: Record<string, CharacterClass> = {
      'marauder': CharacterClass.Marauder,
      'duelist': CharacterClass.Duelist,
      'ranger': CharacterClass.Ranger,
      'shadow': CharacterClass.Shadow,
      'witch': CharacterClass.Witch,
      'templar': CharacterClass.Templar,
      'scion': CharacterClass.Scion
    }
    
    return classMap[oldClass.toLowerCase()] || CharacterClass.Marauder
  }
  
  /**
   * 检查是否需要迁移
   */
  public needsMigration(): boolean {
    const currentCharacter = this.stateManager.getState().currentCharacter
    const legacyPlayer = this.gameStore.getPlayer()
    
    // 如果新架构没有角色但旧系统有，则需要迁移
    return !currentCharacter && legacyPlayer.class !== null
  }
  
  /**
   * 验证迁移结果
   */
  public validateMigration(): boolean {
    const currentCharacter = this.stateManager.getState().currentCharacter
    const legacyPlayer = this.gameStore.getPlayer()
    
    if (!currentCharacter || !legacyPlayer.class) {
      return false
    }
    
    // 验证基本数据是否正确迁移
    return (
      currentCharacter.name === legacyPlayer.name &&
      currentCharacter.level === legacyPlayer.level &&
      currentCharacter.experience === legacyPlayer.experience
    )
  }
  
  /**
   * 清理旧数据
   */
  public cleanupLegacyData(): void {
    console.log('🧹 清理旧数据...')
    
    // 注意：这里要小心，确保新架构工作正常后再清理
    // this.gameStore.clearData()
    
    console.log('⚠️ 旧数据保留，建议手动确认后清理')
  }
} 