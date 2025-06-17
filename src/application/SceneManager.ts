import { EventBus } from '../core/EventBus'

/**
 * 场景管理器
 * 负责游戏场景的加载、切换和生命周期管理
 */
export class SceneManager {
  private eventBus: EventBus
  private currentScene: string | null = null
  private phaserGame: any = null // Phaser.Game 实例
  
  constructor() {
    this.eventBus = EventBus.getInstance()
  }
  
  /**
   * 初始化场景管理器
   */
  public async initialize(): Promise<void> {
    console.log('🎬 初始化场景管理器...')
    
    // 注册事件监听器
    this.registerEventListeners()
    
    console.log('✅ 场景管理器初始化完成')
  }
  
  /**
   * 设置Phaser游戏实例
   */
  public setPhaserGame(game: any): void {
    this.phaserGame = game
  }
  
  /**
   * 加载场景
   */
  public async loadScene(sceneName: string): Promise<void> {
    try {
      console.log(`🎬 加载场景: ${sceneName}`)
      
      const oldScene = this.currentScene
      
      // 如果有Phaser实例，使用Phaser的场景管理
      if (this.phaserGame) {
        this.loadPhaserScene(sceneName)
      }
      
      this.currentScene = sceneName
      
      // 发送场景切换事件
      this.eventBus.emit('scene:loaded', { sceneName })
      
      if (oldScene && oldScene !== sceneName) {
        this.eventBus.emit('scene:changed', { 
          fromScene: oldScene, 
          toScene: sceneName 
        })
      }
      
      console.log(`✅ 场景加载完成: ${sceneName}`)
      
    } catch (error) {
      console.error(`❌ 场景加载失败: ${sceneName}`, error)
      throw error
    }
  }
  
  /**
   * 卸载场景
   */
  public unloadScene(sceneName: string): void {
    console.log(`🗑️ 卸载场景: ${sceneName}`)
    
    if (this.phaserGame) {
      this.unloadPhaserScene(sceneName)
    }
    
    this.eventBus.emit('scene:unloaded', { sceneName })
  }
  
  /**
   * 获取当前场景
   */
  public getCurrentScene(): string | null {
    return this.currentScene
  }
  
  /**
   * 更新场景
   */
  public update(): void {
    // 场景更新逻辑（如果需要）
  }
  
  /**
   * 销毁场景管理器
   */
  public destroy(): void {
    this.currentScene = null
    this.phaserGame = null
    console.log('🗑️ 场景管理器已销毁')
  }
  
  /**
   * 加载Phaser场景
   */
  private loadPhaserScene(sceneName: string): void {
    if (!this.phaserGame || !this.phaserGame.scene) return
    
    try {
      // 停止当前场景
      if (this.currentScene) {
        this.phaserGame.scene.stop(this.currentScene)
      }
      
      // 启动新场景
      this.phaserGame.scene.start(sceneName)
      
    } catch (error) {
      console.error(`Phaser场景加载失败: ${sceneName}`, error)
    }
  }
  
  /**
   * 卸载Phaser场景
   */
  private unloadPhaserScene(sceneName: string): void {
    if (!this.phaserGame || !this.phaserGame.scene) return
    
    try {
      this.phaserGame.scene.stop(sceneName)
    } catch (error) {
      console.error(`Phaser场景卸载失败: ${sceneName}`, error)
    }
  }
  
  /**
   * 注册事件监听器
   */
  private registerEventListeners(): void {
    // 监听角色创建完成，切换到游戏场景
    this.eventBus.on('character:created', () => {
      this.loadScene('TownScene')
    })
    
    // 监听战斗开始，切换到战斗场景
    this.eventBus.on('combat:started', () => {
      // 可以根据需要切换到战斗场景
      // this.loadScene('CombatScene')
    })
  }
} 