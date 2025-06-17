import { GameEngine } from '../core/GameEngine'
import { EventBus } from '../core/EventBus'
import { StateManager } from '../infrastructure/StateManager'
import { ConfigLoader } from '../infrastructure/ConfigLoader'
import { ConfigurableCharacterDomain } from '../domain/Character/ConfigurableCharacterDomain'
import { CombatDomain } from '../domain/Combat/CombatDomain'
import { GameApplication } from '../application/GameApplication'

/**
 * 像素风ARPG框架
 * 高度可配置的ARPG游戏框架，支持快速换皮和内容定制
 */
export class PixelARPGFramework {
  private static instance: PixelARPGFramework
  
  // 核心系统
  private gameEngine: GameEngine
  private eventBus: EventBus
  private stateManager: StateManager
  private configLoader: ConfigLoader
  
  // 领域服务
  private characterDomain: ConfigurableCharacterDomain
  private combatDomain: CombatDomain
  
  // 应用服务
  private gameApplication: GameApplication
  
  // 框架状态
  private isInitialized = false
  private currentTheme = 'default'
  private enabledMods: string[] = []
  
  private constructor() {
    this.gameEngine = GameEngine.getInstance()
    this.eventBus = EventBus.getInstance()
    this.stateManager = StateManager.getInstance()
    this.configLoader = ConfigLoader.getInstance()
    
    this.characterDomain = new ConfigurableCharacterDomain()
    this.combatDomain = new CombatDomain()
    
    this.gameApplication = GameApplication.getInstance()
  }
  
  public static getInstance(): PixelARPGFramework {
    if (!PixelARPGFramework.instance) {
      PixelARPGFramework.instance = new PixelARPGFramework()
    }
    return PixelARPGFramework.instance
  }
  
  /**
   * 初始化框架
   */
  public async initialize(options: FrameworkOptions = {}): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ 框架已经初始化')
      return
    }
    
    console.log('🚀 初始化像素风ARPG框架...')
    
    try {
      // 1. 加载配置系统
      await this.initializeConfigs(options.configPath)
      
      // 2. 初始化核心引擎
      await this.initializeCore()
      
      // 3. 初始化领域服务
      await this.initializeDomains()
      
      // 4. 应用主题和MOD
      await this.applyTheme(options.theme || 'default')
      await this.loadMods(options.mods || [])
      
      // 5. 设置开发者工具
      this.setupDeveloperTools(options.enableDevTools || false)
      
      this.isInitialized = true
      console.log('✅ 像素风ARPG框架初始化完成')
      
      // 发送框架就绪事件
      this.eventBus.emit('framework:ready', {
        version: this.getVersion(),
        theme: this.currentTheme,
        enabledMods: this.enabledMods
      })
      
    } catch (error) {
      console.error('❌ 框架初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 创建游戏实例
   */
  public async createGame(gameOptions: GameCreationOptions): Promise<ARPGGameInstance> {
    if (!this.isInitialized) {
      throw new Error('框架未初始化，请先调用 initialize()')
    }
    
    console.log('🎮 创建游戏实例...')
    
    const gameInstance = new ARPGGameInstance({
      framework: this,
      gameEngine: this.gameEngine,
      configLoader: this.configLoader,
      characterDomain: this.characterDomain,
      combatDomain: this.combatDomain,
      ...gameOptions
    })
    
    await gameInstance.initialize()
    
    console.log('✅ 游戏实例创建完成')
    return gameInstance
  }
  
  /**
   * 切换主题
   */
  public async changeTheme(themeName: string): Promise<void> {
    console.log(`🎨 切换主题: ${this.currentTheme} -> ${themeName}`)
    
    try {
      // 加载主题配置
      const themeConfig = await this.loadThemeConfig(themeName)
      
      // 应用主题
      await this.applyThemeConfig(themeConfig)
      
      this.currentTheme = themeName
      
      this.eventBus.emit('theme:changed', {
        oldTheme: this.currentTheme,
        newTheme: themeName
      })
      
      console.log(`✅ 主题切换完成: ${themeName}`)
      
    } catch (error) {
      console.error(`❌ 主题切换失败: ${themeName}`, error)
      throw error
    }
  }
  
  /**
   * 加载MOD
   */
  public async loadMod(modId: string): Promise<void> {
    if (this.enabledMods.includes(modId)) {
      console.warn(`⚠️ MOD已加载: ${modId}`)
      return
    }
    
    console.log(`🔧 加载MOD: ${modId}`)
    
    try {
      const modConfig = await this.loadModConfig(modId)
      
      // 应用MOD配置
      await this.applyModConfig(modConfig)
      
      this.enabledMods.push(modId)
      
      this.eventBus.emit('mod:loaded', {
        modId,
        enabledMods: this.enabledMods
      })
      
      console.log(`✅ MOD加载完成: ${modId}`)
      
    } catch (error) {
      console.error(`❌ MOD加载失败: ${modId}`, error)
      throw error
    }
  }
  
  /**
   * 卸载MOD
   */
  public async unloadMod(modId: string): Promise<void> {
    const modIndex = this.enabledMods.indexOf(modId)
    if (modIndex === -1) {
      console.warn(`⚠️ MOD未加载: ${modId}`)
      return
    }
    
    console.log(`🔧 卸载MOD: ${modId}`)
    
    try {
      // 移除MOD效果
      await this.removeModEffects(modId)
      
      this.enabledMods.splice(modIndex, 1)
      
      this.eventBus.emit('mod:unloaded', {
        modId,
        enabledMods: this.enabledMods
      })
      
      console.log(`✅ MOD卸载完成: ${modId}`)
      
    } catch (error) {
      console.error(`❌ MOD卸载失败: ${modId}`, error)
      throw error
    }
  }
  
  /**
   * 热重载配置
   */
  public async reloadConfigs(): Promise<void> {
    console.log('🔄 热重载配置...')
    
    try {
      await this.configLoader.initialize()
      
      // 重新应用主题和MOD
      await this.applyTheme(this.currentTheme)
      for (const modId of this.enabledMods) {
        await this.reloadMod(modId)
      }
      
      this.eventBus.emit('configs:reloaded', {
        theme: this.currentTheme,
        mods: this.enabledMods
      })
      
      console.log('✅ 配置热重载完成')
      
    } catch (error) {
      console.error('❌ 配置热重载失败:', error)
      throw error
    }
  }
  
  /**
   * 获取框架信息
   */
  public getFrameworkInfo(): FrameworkInfo {
    return {
      version: this.getVersion(),
      isInitialized: this.isInitialized,
      currentTheme: this.currentTheme,
      enabledMods: [...this.enabledMods],
      supportedFeatures: this.getSupportedFeatures(),
      performance: this.getPerformanceStats()
    }
  }
  
  /**
   * 导出游戏数据
   */
  public async exportGame(): Promise<ExportedGameData> {
    const gameConfig = this.configLoader.getGameConfig()
    const characterConfigs = this.configLoader.getAllCharacterConfigs()
    
    return {
      framework: {
        version: this.getVersion(),
        theme: this.currentTheme,
        mods: this.enabledMods
      },
      configs: {
        game: gameConfig,
        characters: characterConfigs
        // 其他配置...
      },
      saves: await this.stateManager.exportAllSaves(),
      timestamp: Date.now()
    }
  }
  
  /**
   * 导入游戏数据
   */
  public async importGame(gameData: ExportedGameData): Promise<void> {
    console.log('📥 导入游戏数据...')
    
    try {
      // 验证数据格式
      this.validateGameData(gameData)
      
      // 导入配置
      await this.importConfigs(gameData.configs)
      
      // 导入存档
      await this.stateManager.importAllSaves(gameData.saves)
      
      // 应用框架设置
      await this.applyTheme(gameData.framework.theme)
      await this.loadMods(gameData.framework.mods)
      
      console.log('✅ 游戏数据导入完成')
      
    } catch (error) {
      console.error('❌ 游戏数据导入失败:', error)
      throw error
    }
  }
  
  // 私有方法
  
  private async initializeConfigs(configPath?: string): Promise<void> {
    console.log('📁 初始化配置系统...')
    
    if (configPath) {
      // TODO: 设置自定义配置路径
    }
    
    await this.configLoader.initialize()
    console.log('✅ 配置系统初始化完成')
  }
  
  private async initializeCore(): Promise<void> {
    console.log('⚙️ 初始化核心引擎...')
    
    await this.gameEngine.initialize()
    await this.stateManager.initialize()
    
    console.log('✅ 核心引擎初始化完成')
  }
  
  private async initializeDomains(): Promise<void> {
    console.log('🏗️ 初始化领域服务...')
    
    // 领域服务已在构造函数中创建
    // 这里可以进行额外的初始化
    
    console.log('✅ 领域服务初始化完成')
  }
  
  private async applyTheme(themeName: string): Promise<void> {
    const themeConfig = await this.loadThemeConfig(themeName)
    await this.applyThemeConfig(themeConfig)
    this.currentTheme = themeName
  }
  
  private async loadMods(modIds: string[]): Promise<void> {
    for (const modId of modIds) {
      await this.loadMod(modId)
    }
  }
  
  private async loadThemeConfig(themeName: string): Promise<ThemeConfig> {
    // TODO: 从文件或服务器加载主题配置
    return {
      name: themeName,
      colors: {},
      fonts: {},
      sprites: {},
      sounds: {}
    }
  }
  
  private async applyThemeConfig(themeConfig: ThemeConfig): Promise<void> {
    // TODO: 应用主题配置到UI和游戏元素
  }
  
  private async loadModConfig(modId: string): Promise<ModConfig> {
    // TODO: 从文件或服务器加载MOD配置
    return {
      id: modId,
      name: modId,
      version: '1.0.0',
      configOverrides: {},
      assetOverrides: {}
    }
  }
  
  private async applyModConfig(modConfig: ModConfig): Promise<void> {
    // TODO: 应用MOD配置
  }
  
  private async removeModEffects(modId: string): Promise<void> {
    // TODO: 移除MOD效果
  }
  
  private async reloadMod(modId: string): Promise<void> {
    await this.unloadMod(modId)
    await this.loadMod(modId)
  }
  
  private setupDeveloperTools(enabled: boolean): void {
    if (enabled) {
      // 在window对象上暴露开发者工具
      (window as any).PixelARPGFramework = {
        framework: this,
        reloadConfigs: () => this.reloadConfigs(),
        changeTheme: (theme: string) => this.changeTheme(theme),
        loadMod: (modId: string) => this.loadMod(modId),
        getInfo: () => this.getFrameworkInfo()
      }
      
      console.log('🛠️ 开发者工具已启用')
    }
  }
  
  private getVersion(): string {
    return '1.0.0'
  }
  
  private getSupportedFeatures(): string[] {
    return [
      'configurable_characters',
      'configurable_skills',
      'configurable_monsters',
      'theme_system',
      'mod_system',
      'hot_reload',
      'save_export_import'
    ]
  }
  
  private getPerformanceStats(): PerformanceStats {
    return {
      fps: 60, // TODO: 获取实际FPS
      memoryUsage: 0, // TODO: 获取内存使用
      loadTime: 0 // TODO: 获取加载时间
    }
  }
  
  private validateGameData(gameData: ExportedGameData): void {
    if (!gameData.framework || !gameData.configs) {
      throw new Error('无效的游戏数据格式')
    }
  }
  
  private async importConfigs(configs: any): Promise<void> {
    // TODO: 导入配置到ConfigLoader
  }
}

/**
 * ARPG游戏实例
 */
export class ARPGGameInstance {
  private options: GameInstanceOptions
  private isRunning = false
  
  constructor(options: GameInstanceOptions) {
    this.options = options
  }
  
  public async initialize(): Promise<void> {
    console.log('🎮 初始化游戏实例...')
    
    // 初始化游戏逻辑
    await this.options.gameEngine.start()
    
    console.log('✅ 游戏实例初始化完成')
  }
  
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ 游戏已在运行')
      return
    }
    
    console.log('🎯 启动游戏...')
    this.isRunning = true
    
    // 启动游戏循环
    // TODO: 实现游戏循环
    
    console.log('✅ 游戏启动完成')
  }
  
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('⚠️ 游戏未在运行')
      return
    }
    
    console.log('⏹️ 停止游戏...')
    this.isRunning = false
    
    console.log('✅ 游戏已停止')
  }
  
  public isGameRunning(): boolean {
    return this.isRunning
  }
}

// 类型定义

export interface FrameworkOptions {
  configPath?: string
  theme?: string
  mods?: string[]
  enableDevTools?: boolean
}

export interface GameCreationOptions {
  title?: string
  enableAutoSave?: boolean
  saveInterval?: number
}

export interface GameInstanceOptions {
  framework: PixelARPGFramework
  gameEngine: GameEngine
  configLoader: ConfigLoader
  characterDomain: ConfigurableCharacterDomain
  combatDomain: CombatDomain
  title?: string
  enableAutoSave?: boolean
  saveInterval?: number
}

export interface FrameworkInfo {
  version: string
  isInitialized: boolean
  currentTheme: string
  enabledMods: string[]
  supportedFeatures: string[]
  performance: PerformanceStats
}

export interface PerformanceStats {
  fps: number
  memoryUsage: number
  loadTime: number
}

export interface ThemeConfig {
  name: string
  colors: Record<string, string>
  fonts: Record<string, string>
  sprites: Record<string, string>
  sounds: Record<string, string>
}

export interface ModConfig {
  id: string
  name: string
  version: string
  configOverrides: Record<string, any>
  assetOverrides: Record<string, string>
}

export interface ExportedGameData {
  framework: {
    version: string
    theme: string
    mods: string[]
  }
  configs: {
    game: any
    characters: any
    [key: string]: any
  }
  saves: any
  timestamp: number
} 