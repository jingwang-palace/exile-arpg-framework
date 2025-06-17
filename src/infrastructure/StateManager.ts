import { reactive, computed, watch } from 'vue'
import { EventBus } from '../core/EventBus'
import type { Character } from '../types/character'
import type { Quest } from '../types/quest'
import type { Item } from '../types/item'

/**
 * 游戏状态接口
 */
export interface GameState {
  // 游戏基本信息
  gameInfo: {
    version: string
    lastSaved: number
    playTime: number
    isInitialized: boolean
  }
  
  // 当前角色
  currentCharacter: Character | null
  
  // 用户设置
  settings: {
    volume: {
      master: number
      music: number
      effects: number
    }
    graphics: {
      pixelPerfect: boolean
      particleEffects: boolean
      screenShake: boolean
    }
    gameplay: {
      autoPickup: boolean
      pauseOnFocusLoss: boolean
      showDamageNumbers: boolean
    }
    controls: {
      keyBindings: Record<string, string>
    }
  }
  
  // 游戏进度
  progress: {
    unlockedFeatures: string[]
    completedTutorials: string[]
    discoveredAreas: string[]
    currentArea: string
  }
  
  // 全局库存
  globalInventory: {
    currencies: Record<string, number>
    materials: Record<string, number>
    sharedStash: Item[]
  }

  // 模块状态
  modules: Record<string, any>
}

/**
 * 统一状态管理器
 * 整合 Vue 响应式系统和游戏状态管理
 */
export class StateManager {
  private static instance: StateManager
  private eventBus: EventBus
  private storageKey = 'poe_pixel_game_state'
  
  // 响应式状态
  private state = reactive<GameState>({
    gameInfo: {
      version: '0.1.0',
      lastSaved: Date.now(),
      playTime: 0,
      isInitialized: false
    },
    currentCharacter: null,
    settings: {
      volume: {
        master: 1.0,
        music: 0.8,
        effects: 0.9
      },
      graphics: {
        pixelPerfect: true,
        particleEffects: true,
        screenShake: true
      },
      gameplay: {
        autoPickup: true,
        pauseOnFocusLoss: true,
        showDamageNumbers: true
      },
      controls: {
        keyBindings: {
          moveUp: 'KeyW',
          moveDown: 'KeyS',
          moveLeft: 'KeyA',
          moveRight: 'KeyD',
          attack: 'Space',
          inventory: 'KeyI',
          character: 'KeyC',
          skills: 'KeyK'
        }
      }
    },
    progress: {
      unlockedFeatures: ['character_creation'],
      completedTutorials: [],
      discoveredAreas: [],
      currentArea: 'town'
    },
    globalInventory: {
      currencies: {},
      materials: {},
      sharedStash: []
    },
    modules: {}
  })
  
  private constructor() {
    this.eventBus = EventBus.getInstance()
    this.setupWatchers()
  }
  
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager()
    }
    return StateManager.instance
  }
  
  /**
   * 初始化状态管理器
   */
  public async initialize(): Promise<void> {
    try {
      console.log('📦 初始化状态管理器...')
      
      // 加载保存的状态
      await this.loadGame()
      
      // 注册事件监听器
      this.registerEventListeners()
      
      this.state.gameInfo.isInitialized = true
      console.log('✅ 状态管理器初始化完成')
      
    } catch (error) {
      console.error('❌ 状态管理器初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 获取只读状态
   */
  public getState(): Readonly<GameState> {
    return this.state
  }
  
  /**
   * 获取计算属性
   */
  public getComputedState() {
    return {
      // 当前角色是否存在
      hasCharacter: computed(() => this.state.currentCharacter !== null),
      
      // 游戏是否已初始化
      isInitialized: computed(() => this.state.gameInfo.isInitialized),
      
      // 当前角色等级
      characterLevel: computed(() => this.state.currentCharacter?.level ?? 0),
      
      // 总货币价值
      totalCurrencyValue: computed(() => {
        return Object.values(this.state.globalInventory.currencies)
          .reduce((sum, amount) => sum + amount, 0)
      }),
      
      // 是否解锁功能
      isFeatureUnlocked: (feature: string) => computed(() => 
        this.state.progress.unlockedFeatures.includes(feature)
      )
    }
  }
  
  /**
   * 设置当前角色
   */
  public setCurrentCharacter(character: Character): void {
    const oldCharacter = this.state.currentCharacter
    this.state.currentCharacter = character
    
    this.eventBus.emit('character:created', { 
      characterId: character.id
    })
    
    this.saveGame()
  }
  
  /**
   * 更新角色属性
   */
  public updateCharacterAttribute(attribute: keyof Character, value: any): void {
    if (!this.state.currentCharacter) return
    
    const oldValue = this.state.currentCharacter[attribute]
    ;(this.state.currentCharacter as any)[attribute] = value
    
    this.eventBus.emit('character:attributeChanged', {
      characterId: this.state.currentCharacter.id,
      attribute: String(attribute),
      oldValue,
      newValue: value
    })
  }
  
  /**
   * 更新当前区域
   */
  public updateCurrentArea(area: string): void {
    this.state.progress.currentArea = area
    this.saveGame()
  }
  
  /**
   * 更新设置
   */
  public updateSettings(path: string, value: any): void {
    const keys = path.split('.')
    let target: any = this.state.settings
    
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]]
    }
    
    const lastKey = keys[keys.length - 1]
    target[lastKey] = value
    
    this.saveGame()
  }
  
  /**
   * 解锁功能
   */
  public unlockFeature(feature: string): void {
    if (!this.state.progress.unlockedFeatures.includes(feature)) {
      this.state.progress.unlockedFeatures.push(feature)
      console.log(`🔓 解锁功能: ${feature}`)
      this.saveGame()
    }
  }
  
  /**
   * 更新货币
   */
  public updateCurrency(currencyId: string, amount: number): void {
    const oldAmount = this.state.globalInventory.currencies[currencyId] || 0
    this.state.globalInventory.currencies[currencyId] = Math.max(0, oldAmount + amount)
    
    console.log(`💰 货币变化: ${currencyId} ${oldAmount} -> ${this.state.globalInventory.currencies[currencyId]} (${amount > 0 ? '+' : ''}${amount})`)
    
    this.saveGame()
  }
  
  /**
   * 保存游戏
   */
  public async saveGame(): Promise<void> {
    try {
      this.state.gameInfo.lastSaved = Date.now()
      
      const saveData = {
        ...this.state,
        // 不保存敏感或临时数据
        gameInfo: {
          ...this.state.gameInfo,
          isInitialized: false // 下次启动时重新初始化
        }
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(saveData))
      console.log('💾 游戏状态已保存')
      
    } catch (error) {
      console.error('❌ 保存游戏失败:', error)
      throw error
    }
  }
  
  /**
   * 加载游戏
   */
  public async loadGame(): Promise<void> {
    try {
      const savedData = localStorage.getItem(this.storageKey)
      if (!savedData) {
        console.log('📂 没有找到保存的游戏数据，使用默认状态')
        return
      }
      
      const parsed = JSON.parse(savedData)
      
      // 合并状态，保留默认值
      Object.assign(this.state, parsed)
      
      console.log('📂 游戏状态已加载')
      
    } catch (error) {
      console.error('❌ 加载游戏失败:', error)
      // 不抛出错误，使用默认状态
    }
  }
  
  /**
   * 重置游戏
   */
  public resetGame(): void {
    localStorage.removeItem(this.storageKey)
    
    // 重置到初始状态
    Object.assign(this.state, {
      currentCharacter: null,
      progress: {
        unlockedFeatures: ['character_creation'],
        completedTutorials: [],
        discoveredAreas: [],
        currentArea: 'town'
      },
      globalInventory: {
        currencies: {},
        materials: {},
        sharedStash: []
      }
    })
    
    console.log('🔄 游戏已重置')
  }
  
  /**
   * 销毁状态管理器
   */
  public destroy(): void {
    this.saveGame()
    console.log('🗑️ 状态管理器已销毁')
  }
  
  /**
   * 设置状态监听器
   */
  private setupWatchers(): void {
    // 监听角色等级变化
    watch(
      () => this.state.currentCharacter?.level,
      (newLevel, oldLevel) => {
        if (newLevel && oldLevel && newLevel > oldLevel) {
          this.eventBus.emit('character:levelUp', {
            characterId: this.state.currentCharacter!.id,
            newLevel
          })
        }
      }
    )
    
    // 定期自动保存
    setInterval(() => {
      if (this.state.gameInfo.isInitialized) {
        this.saveGame()
      }
    }, 30000) // 每30秒保存一次
  }
  
  /**
   * 注册事件监听器
   */
  private registerEventListeners(): void {
    // 监听游戏时间更新
    this.eventBus.on('game:timeUpdate', (deltaTime) => {
      this.state.gameInfo.playTime += deltaTime
    })
  }
  
  /**
   * 保存特定模块的状态
   */
  public saveState(key: string, data: any): void {
    try {
      const state = this.state as any;
      if (!state.modules) {
        state.modules = {};
      }
      state.modules[key] = data;
      this.saveGame();
    } catch (error) {
      console.error(`保存状态失败 [${key}]:`, error);
    }
  }

  /**
   * 加载特定模块的状态
   */
  public loadState(key: string): any {
    try {
      const state = this.state as any;
      return state.modules?.[key];
    } catch (error) {
      console.error(`加载状态失败 [${key}]:`, error);
      return null;
    }
  }
} 