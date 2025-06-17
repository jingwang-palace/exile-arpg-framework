import { GameEngine } from '../core/GameEngine'
import { StateManager } from '../infrastructure/StateManager'
import { EventBus } from '../core/EventBus'
import { CharacterDomain } from '../domain/Character/CharacterDomain'
import { CombatDomain } from '../domain/Combat/CombatDomain'
import { QuestDomain } from '../domain/Quest/QuestDomain'
import { GameStore } from '../stores/GameStore'
import type { Character, CharacterClass } from '../types/character'

/**
 * 游戏应用主控制器
 * 协调UI层和业务逻辑层，提供统一的API
 */
export class GameApplication {
  private static instance: GameApplication
  
  private gameEngine: GameEngine
  private stateManager: StateManager
  private eventBus: EventBus
  
  // 领域服务
  private characterDomain: CharacterDomain
  private combatDomain: CombatDomain
  private questDomain: QuestDomain
  
  private constructor() {
    this.gameEngine = GameEngine.getInstance()
    this.stateManager = StateManager.getInstance()
    this.eventBus = EventBus.getInstance()
    
    this.characterDomain = new CharacterDomain()
    this.combatDomain = new CombatDomain()
    this.questDomain = new QuestDomain()
    
    this.registerEventHandlers()
  }
  
  public static getInstance(): GameApplication {
    if (!GameApplication.instance) {
      GameApplication.instance = new GameApplication()
    }
    return GameApplication.instance
  }
  
  /**
   * 初始化游戏应用
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🎮 初始化游戏应用...')
      
      // 初始化游戏引擎
      await this.gameEngine.initialize()
      
      console.log('✅ 游戏应用初始化完成')
      
    } catch (error) {
      console.error('❌ 游戏应用初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 启动游戏
   */
  public async start(): Promise<void> {
    await this.gameEngine.start()
  }
  
  // =============== 角色管理 API ===============
  
  /**
   * 创建新角色
   */
  public async createCharacter(name: string, characterClass: CharacterClass): Promise<Character> {
    try {
      const character = this.characterDomain.createCharacter(name, characterClass)
      
      // 设置为当前角色
      this.stateManager.setCurrentCharacter(character)
      
      // 初始化角色相关系统
      await this.initializeCharacterSystems(character)
      
      return character
    } catch (error) {
      console.error('创建角色失败:', error)
      throw error
    }
  }
  
  /**
   * 选择角色
   */
  public selectCharacter(characterId: string): void {
    // TODO: 从存档中加载角色
    console.log(`选择角色: ${characterId}`)
  }
  
  /**
   * 获取当前角色
   */
  public getCurrentCharacter(): Character | null {
    return this.stateManager.getState().currentCharacter
  }
  
  /**
   * 角色升级
   */
  public levelUpCharacter(): void {
    const character = this.getCurrentCharacter()
    if (!character) {
      throw new Error('没有选择角色')
    }
    
    const updatedCharacter = this.characterDomain.levelUp(character)
    this.stateManager.setCurrentCharacter(updatedCharacter)
  }
  
  /**
   * 获得经验值
   */
  public gainExperience(amount: number): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    const updatedCharacter = this.characterDomain.gainExperience(character, amount)
    this.stateManager.setCurrentCharacter(updatedCharacter)
  }
  
  // =============== 战斗系统 API ===============
  
  /**
   * 开始战斗
   */
  public startCombat(enemyId: string): void {
    const character = this.getCurrentCharacter()
    if (!character) {
      throw new Error('没有选择角色')
    }
    
    this.combatDomain.startCombat(character.id, enemyId)
  }
  
  /**
   * 攻击敌人
   */
  public attackEnemy(enemyId: string, skillId?: string): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    this.combatDomain.attack(character.id, enemyId, skillId)
  }
  
  /**
   * 使用技能
   */
  public useSkill(skillId: string, targetId?: string): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    this.combatDomain.useSkill(character.id, skillId, targetId)
  }
  
  // =============== 任务系统 API ===============
  
  /**
   * 接受任务
   */
  public acceptQuest(questId: string): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    this.questDomain.acceptQuest(character.id, questId)
  }
  
  /**
   * 完成任务
   */
  public completeQuest(questId: string): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    this.questDomain.completeQuest(character.id, questId)
  }
  
  /**
   * 获取可用任务
   */
  public getAvailableQuests(): any[] {
    const character = this.getCurrentCharacter()
    if (!character) return []
    
    return this.questDomain.getAvailableQuests(character.id)
  }
  
  // =============== 物品和装备 API ===============
  
  /**
   * 拾取物品
   */
  public pickupItem(itemId: string): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    // TODO: 实现物品拾取逻辑
    this.eventBus.emit('item:acquired', {
      characterId: character.id,
      itemId,
      quantity: 1
    })
  }
  
  /**
   * 装备道具
   */
  public equipItem(itemId: string, slot: string): void {
    const character = this.getCurrentCharacter()
    if (!character) return
    
    // TODO: 实现装备逻辑
    this.eventBus.emit('equipment:equipped', {
      characterId: character.id,
      itemId,
      slot
    })
  }
  
  // =============== 游戏设置 API ===============
  
  /**
   * 更新游戏设置
   */
  public updateSettings(path: string, value: any): void {
    this.stateManager.updateSettings(path, value)
  }
  
  /**
   * 获取游戏设置
   */
  public getSettings(): any {
    return this.stateManager.getState().settings
  }
  
  // =============== 场景管理 API ===============
  
  /**
   * 切换场景
   */
  public changeScene(sceneName: string): void {
    const sceneManager = this.gameEngine.getManager('scene')
    sceneManager.loadScene(sceneName)
  }
  
  /**
   * 进入城镇
   */
  public enterTown(): void {
    this.changeScene('Town')
    this.stateManager.updateCurrentArea('town')
  }
  
  /**
   * 进入地图
   */
  public enterMap(mapId: string): void {
    this.changeScene('GameMap')
    this.stateManager.updateCurrentArea(mapId)
  }
  
  // =============== 数据持久化 API ===============
  
  /**
   * 保存游戏
   */
  public async saveGame(): Promise<void> {
    await this.stateManager.saveGame()
  }
  
  /**
   * 加载游戏
   */
  public async loadGame(): Promise<void> {
    await this.stateManager.loadGame()
  }
  
  /**
   * 重置游戏
   */
  public resetGame(): void {
    this.stateManager.resetGame()
  }
  
  // =============== 私有方法 ===============
  
  /**
   * 初始化角色相关系统
   */
  private async initializeCharacterSystems(character: Character): Promise<void> {
    // 初始化任务系统
    this.questDomain.initializeCharacterQuests(character.id)
    
    // 解锁基础功能
    this.stateManager.unlockFeature('inventory')
    this.stateManager.unlockFeature('skills')
    this.stateManager.unlockFeature('character_stats')
    
    console.log(`✅ 角色系统初始化完成: ${character.name}`)
  }
  
  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 角色升级事件
    this.eventBus.on('character:levelUp', (data) => {
      console.log(`🎉 角色升级: ${data.characterId} 达到 ${data.newLevel} 级`)
      
      // 检查功能解锁
      this.checkFeatureUnlocks(data.newLevel)
    })
    
    // 战斗结束事件
    this.eventBus.on('combat:ended', (data) => {
      console.log(`⚔️ 战斗结束: ${data.winnerId} 击败 ${data.loserId}`)
      
      // 如果玩家获胜，给予奖励
      const character = this.getCurrentCharacter()
      if (character && data.winnerId === character.id) {
        this.processCombatRewards()
      }
    })
    
    // 任务完成事件
    this.eventBus.on('quest:completed', (data) => {
      console.log(`📋 任务完成: ${data.questId}`)
      this.processQuestRewards(data.questId)
    })
  }
  
  /**
   * 检查功能解锁
   */
  private checkFeatureUnlocks(level: number): void {
    const unlocks: Record<number, string[]> = {
      2: ['talents'],
      10: ['ascendancy_preview'],
      20: ['crafting'],
      30: ['ascendancy'],
      40: ['maps'],
      60: ['endgame']
    }
    
    const features = unlocks[level]
    if (features) {
      features.forEach(feature => {
        this.stateManager.unlockFeature(feature)
      })
    }
  }
  
  /**
   * 处理战斗奖励
   */
  private processCombatRewards(): void {
    // 给予经验值和金币
    this.gainExperience(50)
    this.stateManager.updateCurrency('gold', 10)
  }
  
  /**
   * 处理任务奖励
   */
  private processQuestRewards(questId: string): void {
    // TODO: 根据任务ID给予相应奖励
    this.gainExperience(100)
    this.stateManager.updateCurrency('gold', 50)
  }
} 