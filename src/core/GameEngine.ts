import { EventBus } from './EventBus'
import { ConfigManager } from '../infrastructure/ConfigManager'
import { StateManager } from '../infrastructure/StateManager'
import { SceneManager } from '../application/SceneManager'
import { InputManager } from '../application/InputManager'
import { AudioManager } from '../application/AudioManager'

/**
 * 游戏引擎核心类
 * 负责整个游戏的生命周期管理和系统协调
 */
export class GameEngine {
  private static instance: GameEngine
  
  // 核心管理器
  private eventBus: EventBus
  private configManager: ConfigManager
  private stateManager: StateManager
  private sceneManager: SceneManager
  private inputManager: InputManager
  private audioManager: AudioManager
  
  private isInitialized: boolean = false
  private isRunning: boolean = false
  
  private constructor() {
    this.eventBus = EventBus.getInstance()
    this.configManager = ConfigManager.getInstance()
    this.stateManager = StateManager.getInstance()
    this.sceneManager = new SceneManager()
    this.inputManager = new InputManager()
    this.audioManager = new AudioManager()
  }
  
  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine()
    }
    return GameEngine.instance
  }
  
  /**
   * 初始化游戏引擎
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('游戏引擎已经初始化')
      return
    }
    
    try {
      console.log('🚀 开始初始化游戏引擎...')
      
      // 按顺序初始化各个管理器
      await this.configManager.initialize()
      await this.stateManager.initialize()
      await this.sceneManager.initialize()
      await this.inputManager.initialize()
      await this.audioManager.initialize()
      
      // 注册全局事件监听器
      this.registerGlobalEvents()
      
      this.isInitialized = true
      console.log('✅ 游戏引擎初始化完成')
      
      // 发送初始化完成事件
      this.eventBus.emit('engine:initialized')
      
    } catch (error) {
      console.error('❌ 游戏引擎初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 启动游戏
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('游戏引擎尚未初始化')
    }
    
    if (this.isRunning) {
      console.warn('游戏已经在运行中')
      return
    }
    
    try {
      console.log('🎮 启动游戏...')
      
      // 启动游戏循环
      this.startGameLoop()
      
      // 加载初始场景
      await this.sceneManager.loadScene('CharacterSelect')
      
      this.isRunning = true
      console.log('✅ 游戏启动成功')
      
      // 发送游戏启动事件
      this.eventBus.emit('game:started')
      
    } catch (error) {
      console.error('❌ 游戏启动失败:', error)
      throw error
    }
  }
  
  /**
   * 暂停游戏
   */
  public pause(): void {
    if (!this.isRunning) return
    
    this.eventBus.emit('game:paused')
    console.log('⏸️ 游戏已暂停')
  }
  
  /**
   * 恢复游戏
   */
  public resume(): void {
    if (!this.isRunning) return
    
    this.eventBus.emit('game:resumed')
    console.log('▶️ 游戏已恢复')
  }
  
  /**
   * 停止游戏
   */
  public stop(): void {
    if (!this.isRunning) return
    
    this.isRunning = false
    this.eventBus.emit('game:stopped')
    console.log('⏹️ 游戏已停止')
  }
  
  /**
   * 销毁游戏引擎
   */
  public destroy(): void {
    this.stop()
    
    // 清理各个管理器
    this.sceneManager.destroy()
    this.inputManager.destroy()
    this.audioManager.destroy()
    this.stateManager.destroy()
    
    this.isInitialized = false
    console.log('🗑️ 游戏引擎已销毁')
  }
  
  /**
   * 获取管理器实例
   */
  public getManager<T>(type: 'event' | 'config' | 'state' | 'scene' | 'input' | 'audio'): T {
    switch (type) {
      case 'event': return this.eventBus as T
      case 'config': return this.configManager as T
      case 'state': return this.stateManager as T
      case 'scene': return this.sceneManager as T
      case 'input': return this.inputManager as T
      case 'audio': return this.audioManager as T
      default: throw new Error(`未知的管理器类型: ${type}`)
    }
  }
  
  /**
   * 启动游戏循环
   */
  private startGameLoop(): void {
    const gameLoop = () => {
      if (!this.isRunning) return
      
      // 更新输入
      this.inputManager.update()
      
      // 更新场景
      this.sceneManager.update()
      
      // 继续循环
      requestAnimationFrame(gameLoop)
    }
    
    gameLoop()
  }
  
  /**
   * 注册全局事件监听器
   */
  private registerGlobalEvents(): void {
    // 监听窗口关闭事件，自动保存游戏
    window.addEventListener('beforeunload', () => {
      this.stateManager.saveGame()
    })
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause()
      } else {
        this.resume()
      }
    })
    
    // 监听错误事件
    window.addEventListener('error', (event) => {
      console.error('全局错误:', event.error)
      this.eventBus.emit('error:global', event.error)
    })
  }
} 