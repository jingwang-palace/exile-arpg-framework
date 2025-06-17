import { EventBus } from '../../../core/EventBus'
import { StateManager } from '../../../infrastructure/StateManager'
import MiniMapSystem from './MiniMapSystem'
import NotificationSystem from './NotificationSystem'
import TooltipSystem from './TooltipSystem'
import DamageTextSystem from './DamageTextSystem'
import { Scene } from 'phaser'

// UI层级定义
export enum UILayer {
  BACKGROUND = 0,
  GAME_UI = 1000,
  HUD = 1500,
  DAMAGE_TEXT = 1500,
  MINIMAP = 1000,
  NOTIFICATIONS = 2000,
  TOOLTIPS = 3000,
  MODALS = 4000,
  DEBUG = 9000
}

// UI主题配置
export interface UITheme {
  name: string
  colors: {
    primary: number
    secondary: number
    accent: number
    background: number
    surface: number
    text: number
    textSecondary: number
    success: number
    warning: number
    error: number
    info: number
  }
  fonts: {
    primary: string
    secondary: string
    monospace: string
  }
  sizes: {
    small: number
    medium: number
    large: number
    xlarge: number
  }
  effects: {
    glowIntensity: number
    borderRadius: number
    shadowOffset: { x: number; y: number }
    animationDuration: number
  }
}

// UI状态接口
export interface UIState {
  isGamePaused: boolean
  isInventoryOpen: boolean
  isSkillTreeOpen: boolean
  isSettingsOpen: boolean
  isChatOpen: boolean
  isMapOpen: boolean
  currentTheme: string
  uiScale: number
  showFPS: boolean
  showDebugInfo: boolean
}

/**
 * UI管理器
 * 统一管理所有UI系统和组件
 */
export class UIManager {
  private static instance: UIManager
  
  private scene: Scene
  private eventBus: EventBus
  private stateManager: StateManager
  
  // UI系统实例
  private miniMapSystem!: MiniMapSystem
  private notificationSystem!: NotificationSystem
  private tooltipSystem!: TooltipSystem
  private damageTextSystem!: DamageTextSystem
  
  // UI容器
  private uiContainers: Map<string, Phaser.GameObjects.Container> = new Map()
  
  // UI状态
  private uiState: UIState = {
    isGamePaused: false,
    isInventoryOpen: false,
    isSkillTreeOpen: false,
    isSettingsOpen: false,
    isChatOpen: false,
    isMapOpen: false,
    currentTheme: 'dark',
    uiScale: 1.0,
    showFPS: false,
    showDebugInfo: false
  }
  
  // 主题系统
  private themes: Map<string, UITheme> = new Map()
  private currentTheme: UITheme
  
  // 性能监控
  private fpsText: Phaser.GameObjects.Text | null = null
  private debugInfo: Phaser.GameObjects.Text | null = null
  
  // 输入处理
  private keyBindings: Map<string, () => void> = new Map()

  private constructor(scene: Scene) {
    this.scene = scene
    this.eventBus = EventBus.getInstance()
    this.stateManager = StateManager.getInstance()
    
    this.initializeThemes()
    this.currentTheme = this.themes.get('dark')!
    
    this.initializeSystem()
  }

  static getInstance(scene?: Scene): UIManager {
    if (!UIManager.instance && scene) {
      UIManager.instance = new UIManager(scene)
    }
    return UIManager.instance
  }

  private initializeSystem(): void {
    this.createUIContainers()
    this.initializeSubSystems()
    this.setupEventListeners()
    this.setupKeyBindings()
    this.setupPerformanceMonitoring()
    this.loadUIState()
    
    console.log('🎨 UI管理器初始化完成')
  }

  private createUIContainers(): void {
    // 创建分层的UI容器
    const layers = [
      'background',
      'gameUI',
      'hud',
      'overlays',
      'notifications',
      'tooltips',
      'modals',
      'debug'
    ]

    layers.forEach((layerName, index) => {
      const container = this.scene.add.container(0, 0)
      container.setScrollFactor(0)
      container.setDepth(UILayer.BACKGROUND + index * 1000)
      container.setName(`ui_${layerName}`)
      this.uiContainers.set(layerName, container)
    })
  }

  private initializeSubSystems(): void {
    // 初始化各个UI系统
    this.miniMapSystem = new MiniMapSystem(this.scene)
    this.notificationSystem = new NotificationSystem(this.scene)
    this.tooltipSystem = new TooltipSystem(this.scene)
    this.damageTextSystem = new DamageTextSystem(this.scene)
    
    // 将系统添加到对应的UI容器
    this.uiContainers.get('overlays')?.add(this.miniMapSystem)
    this.uiContainers.get('notifications')?.add(this.notificationSystem)
    this.uiContainers.get('tooltips')?.add(this.tooltipSystem)
    this.uiContainers.get('overlays')?.add(this.damageTextSystem)
  }

  private initializeThemes(): void {
    // 深色主题
    this.themes.set('dark', {
      name: '深色主题',
      colors: {
        primary: 0x2196F3,
        secondary: 0x607D8B,
        accent: 0x00FF88,
        background: 0x1a1a1a,
        surface: 0x2a2a2a,
        text: 0xffffff,
        textSecondary: 0xcccccc,
        success: 0x4CAF50,
        warning: 0xFF9800,
        error: 0xF44336,
        info: 0x2196F3
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Helvetica',
        monospace: 'Courier New'
      },
      sizes: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 20
      },
      effects: {
        glowIntensity: 0.8,
        borderRadius: 8,
        shadowOffset: { x: 2, y: 2 },
        animationDuration: 300
      }
    })

    // 像素风主题
    this.themes.set('pixel', {
      name: '像素风主题',
      colors: {
        primary: 0x00FF88,
        secondary: 0x888888,
        accent: 0xFFAA00,
        background: 0x0a0a0a,
        surface: 0x1a1a2e,
        text: 0x00FF88,
        textSecondary: 0xaaaaaa,
        success: 0x44ff44,
        warning: 0xffaa00,
        error: 0xff4444,
        info: 0x4488ff
      },
      fonts: {
        primary: 'Courier New',
        secondary: 'monospace',
        monospace: 'Courier New'
      },
      sizes: {
        small: 10,
        medium: 12,
        large: 14,
        xlarge: 18
      },
      effects: {
        glowIntensity: 1.2,
        borderRadius: 0,
        shadowOffset: { x: 3, y: 3 },
        animationDuration: 150
      }
    })

    // 亮色主题
    this.themes.set('light', {
      name: '亮色主题',
      colors: {
        primary: 0x1976D2,
        secondary: 0x424242,
        accent: 0xFF5722,
        background: 0xfafafa,
        surface: 0xffffff,
        text: 0x212121,
        textSecondary: 0x757575,
        success: 0x388E3C,
        warning: 0xF57C00,
        error: 0xD32F2F,
        info: 0x1976D2
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Helvetica',
        monospace: 'Courier New'
      },
      sizes: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 20
      },
      effects: {
        glowIntensity: 0.3,
        borderRadius: 12,
        shadowOffset: { x: 1, y: 1 },
        animationDuration: 400
      }
    })
  }

  private setupEventListeners(): void {
    // 监听游戏状态变化
    this.eventBus.on('game:pause', () => {
      this.setGamePaused(true)
    })

    this.eventBus.on('game:resume', () => {
      this.setGamePaused(false)
    })

    // 监听UI状态变化
    this.eventBus.on('ui:inventory_toggle', () => {
      this.toggleInventory()
    })

    this.eventBus.on('ui:skill_tree_toggle', () => {
      this.toggleSkillTree()
    })

    this.eventBus.on('ui:settings_toggle', () => {
      this.toggleSettings()
    })

    this.eventBus.on('ui:map_toggle', () => {
      this.toggleMap()
    })

    // 监听主题变化
    this.eventBus.on('ui:theme_change', (data) => {
      this.setTheme(data.theme)
    })

    // 监听分辨率变化
    this.scene.scale.on('resize', () => {
      this.handleResize()
    })

    // 监听性能事件
    this.eventBus.on('ui:toggle_fps', () => {
      this.toggleFPS()
    })

    this.eventBus.on('ui:toggle_debug', () => {
      this.toggleDebugInfo()
    })
  }

  private setupKeyBindings(): void {
    // ESC键 - 切换菜单/关闭窗口
    this.keyBindings.set('Escape', () => {
      this.handleEscapeKey()
    })

    // Tab键 - 显示/隐藏地图
    this.keyBindings.set('Tab', () => {
      this.toggleMap()
    })

    // I键 - 背包
    this.keyBindings.set('KeyI', () => {
      this.toggleInventory()
    })

    // P键 - 技能树
    this.keyBindings.set('KeyP', () => {
      this.toggleSkillTree()
    })

    // F12键 - 调试信息
    this.keyBindings.set('F12', () => {
      this.toggleDebugInfo()
    })

    // F11键 - FPS显示
    this.keyBindings.set('F11', () => {
      this.toggleFPS()
    })

    // 注册键盘事件
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const handler = this.keyBindings.get(event.code)
      if (handler) {
        handler()
        event.preventDefault()
      }
    })
  }

  private setupPerformanceMonitoring(): void {
    // 创建FPS显示
    this.fpsText = this.scene.add.text(10, 10, 'FPS: --', {
      fontSize: '14px',
      color: '#00ff88',
      fontFamily: 'monospace'
    })
    this.fpsText.setScrollFactor(0)
    this.fpsText.setDepth(UILayer.DEBUG)
    this.fpsText.setVisible(this.uiState.showFPS)

    // 创建调试信息显示
    this.debugInfo = this.scene.add.text(10, 40, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 8, y: 4 }
    })
    this.debugInfo.setScrollFactor(0)
    this.debugInfo.setDepth(UILayer.DEBUG)
    this.debugInfo.setVisible(this.uiState.showDebugInfo)

    // 定时更新性能信息
    this.scene.time.addEvent({
      delay: 500,
      callback: this.updatePerformanceInfo,
      callbackScope: this,
      loop: true
    })
  }

  private updatePerformanceInfo(): void {
    if (this.fpsText && this.fpsText.visible) {
      const fps = Math.round(this.scene.game.loop.actualFps)
      this.fpsText.setText(`FPS: ${fps}`)
      
      // 根据FPS调整颜色
      if (fps >= 50) {
        this.fpsText.setColor('#00ff88')
      } else if (fps >= 30) {
        this.fpsText.setColor('#ffaa00')
      } else {
        this.fpsText.setColor('#ff4444')
      }
    }

    if (this.debugInfo && this.debugInfo.visible) {
      const gameState = this.stateManager.getState()
      const camera = this.scene.cameras.main
      
      const debugText = [
        `场景: ${this.scene.scene.key}`,
        `分辨率: ${camera.width}x${camera.height}`,
        `缩放: ${this.uiState.uiScale.toFixed(2)}`,
        `主题: ${this.currentTheme.name}`,
        `通知: ${this.notificationSystem.getActiveNotifications().length}`,
        `工具提示: ${this.tooltipSystem.isVisible() ? '显示' : '隐藏'}`,
        `内存: ${this.getMemoryUsage()}MB`
      ].join('\n')

      this.debugInfo.setText(debugText)
    }
  }

  private getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return (memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
    }
    return '未知'
  }

  // ===========================================
  // UI状态管理
  // ===========================================

  public setGamePaused(paused: boolean): void {
    this.uiState.isGamePaused = paused
    
    // 暂停时显示暂停界面
    if (paused) {
      this.showPauseMenu()
    } else {
      this.hidePauseMenu()
    }
    
    this.eventBus.emit('ui:state_changed', { state: this.uiState })
  }

  public toggleInventory(): void {
    this.uiState.isInventoryOpen = !this.uiState.isInventoryOpen
    this.eventBus.emit('ui:inventory_state_changed', { 
      isOpen: this.uiState.isInventoryOpen 
    })
  }

  public toggleSkillTree(): void {
    this.uiState.isSkillTreeOpen = !this.uiState.isSkillTreeOpen
    this.eventBus.emit('ui:skill_tree_state_changed', { 
      isOpen: this.uiState.isSkillTreeOpen 
    })
  }

  public toggleSettings(): void {
    this.uiState.isSettingsOpen = !this.uiState.isSettingsOpen
    this.eventBus.emit('ui:settings_state_changed', { 
      isOpen: this.uiState.isSettingsOpen 
    })
  }

  public toggleMap(): void {
    this.uiState.isMapOpen = !this.uiState.isMapOpen
    this.miniMapSystem.setVisible(this.uiState.isMapOpen)
    this.eventBus.emit('ui:map_state_changed', { 
      isOpen: this.uiState.isMapOpen 
    })
  }

  public toggleFPS(): void {
    this.uiState.showFPS = !this.uiState.showFPS
    if (this.fpsText) {
      this.fpsText.setVisible(this.uiState.showFPS)
    }
  }

  public toggleDebugInfo(): void {
    this.uiState.showDebugInfo = !this.uiState.showDebugInfo
    if (this.debugInfo) {
      this.debugInfo.setVisible(this.uiState.showDebugInfo)
    }
  }

  // ===========================================
  // 主题管理
  // ===========================================

  public setTheme(themeName: string): void {
    const theme = this.themes.get(themeName)
    if (!theme) {
      console.warn(`❌ 主题不存在: ${themeName}`)
      return
    }

    this.currentTheme = theme
    this.uiState.currentTheme = themeName
    
    // 应用主题到所有UI组件
    this.applyThemeToSystems()
    
    this.eventBus.emit('ui:theme_applied', { theme: this.currentTheme })
    console.log(`🎨 应用主题: ${theme.name}`)
  }

  private applyThemeToSystems(): void {
    // 应用主题到通知系统
    this.notificationSystem.setConfig({
      position: 'top-right' // 可以根据主题调整
    })

    // 应用主题到工具提示系统
    this.tooltipSystem.setConfig({
      backgroundColor: this.currentTheme.colors.surface,
      borderColor: this.currentTheme.colors.primary,
      borderRadius: this.currentTheme.effects.borderRadius
    })

    // 更新所有容器的样式
    this.updateContainerStyles()
  }

  private updateContainerStyles(): void {
    // 更新各个UI容器的样式
    // 这里可以添加具体的样式更新逻辑
  }

  // ===========================================
  // 事件处理
  // ===========================================

  private handleEscapeKey(): void {
    // 按优先级关闭窗口
    if (this.uiState.isSettingsOpen) {
      this.toggleSettings()
    } else if (this.uiState.isInventoryOpen) {
      this.toggleInventory()
    } else if (this.uiState.isSkillTreeOpen) {
      this.toggleSkillTree()
    } else if (this.tooltipSystem.isVisible()) {
      this.tooltipSystem.hideTooltip(true)
    } else {
      // 显示/隐藏暂停菜单
      this.setGamePaused(!this.uiState.isGamePaused)
    }
  }

  private handleResize(): void {
    // 重新计算UI布局
    this.updateUILayout()
    
    // 通知子系统更新布局
    this.eventBus.emit('ui:resize', {
      width: this.scene.cameras.main.width,
      height: this.scene.cameras.main.height
    })
  }

  private updateUILayout(): void {
    // 更新性能信息位置
    if (this.fpsText) {
      this.fpsText.setPosition(10, 10)
    }
    
    if (this.debugInfo) {
      this.debugInfo.setPosition(10, 40)
    }
  }

  // ===========================================
  // 暂停菜单
  // ===========================================

  private showPauseMenu(): void {
    // TODO: 实现暂停菜单
    console.log('⏸️ 显示暂停菜单')
  }

  private hidePauseMenu(): void {
    // TODO: 隐藏暂停菜单
    console.log('▶️ 隐藏暂停菜单')
  }

  // ===========================================
  // 数据持久化
  // ===========================================

  private saveUIState(): void {
    this.stateManager.setState('uiState', this.uiState)
  }

  private loadUIState(): void {
    const savedState = this.stateManager.getState().uiState
    if (savedState) {
      this.uiState = { ...this.uiState, ...savedState }
      
      // 应用加载的状态
      this.setTheme(this.uiState.currentTheme)
      
      if (this.fpsText) {
        this.fpsText.setVisible(this.uiState.showFPS)
      }
      
      if (this.debugInfo) {
        this.debugInfo.setVisible(this.uiState.showDebugInfo)
      }
    }
  }

  // ===========================================
  // 公共API
  // ===========================================

  public getUIState(): UIState {
    return { ...this.uiState }
  }

  public getCurrentTheme(): UITheme {
    return { ...this.currentTheme }
  }

  public getAvailableThemes(): string[] {
    return Array.from(this.themes.keys())
  }

  public setUIScale(scale: number): void {
    this.uiState.uiScale = Phaser.Math.Clamp(scale, 0.5, 2.0)
    
    // 应用缩放到所有UI容器
    this.uiContainers.forEach(container => {
      container.setScale(this.uiState.uiScale)
    })
    
    this.eventBus.emit('ui:scale_changed', { scale: this.uiState.uiScale })
  }

  public showNotification(type: any, title: string, message: string, options?: any): string {
    return this.notificationSystem.showNotification(type, title, message, options)
  }

  public showTooltip(data: any, x?: number, y?: number): void {
    this.tooltipSystem.showTooltip(data, x, y)
  }

  public hideTooltip(): void {
    this.tooltipSystem.hideTooltip()
  }

  public showDamageText(damage: number, type: any, x: number, y: number, isCritical?: boolean): void {
    this.damageTextSystem.showDamageText(damage, type, x, y, isCritical)
  }

  public getMiniMap(): MiniMapSystem {
    return this.miniMapSystem
  }

  public getContainer(layer: string): Phaser.GameObjects.Container | undefined {
    return this.uiContainers.get(layer)
  }

  public destroy(): void {
    this.saveUIState()
    
    // 销毁所有子系统
    this.miniMapSystem.destroy()
    this.notificationSystem.destroy()
    this.tooltipSystem.destroy()
    this.damageTextSystem.destroy()
    
    // 销毁UI容器
    this.uiContainers.forEach(container => container.destroy())
    this.uiContainers.clear()
    
    // 清理性能监控
    if (this.fpsText) {
      this.fpsText.destroy()
    }
    
    if (this.debugInfo) {
      this.debugInfo.destroy()
    }
    
    console.log('🧹 UI管理器已清理')
  }
}

export default UIManager 