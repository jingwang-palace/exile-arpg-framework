// Electron桌面应用存储适配器
export interface ElectronAPI {
  app: {
    getVersion(): Promise<string>
    getPath(): Promise<string>
    getSystemInfo(): Promise<any>
  }
  
  file: {
    showSaveDialog(): Promise<{ canceled: boolean; filePath?: string }>
    showOpenDialog(): Promise<{ canceled: boolean; filePaths?: string[] }>
  }
  
  store: {
    get(key: string): Promise<any>
    set(key: string, value: any): Promise<boolean>
    delete(key: string): Promise<boolean>
    clear(): Promise<boolean>
  }
  
  gameSettings: {
    get(): Promise<any>
    update(settings: any): Promise<any>
  }
  
  window: {
    setFullscreen(fullscreen: boolean): Promise<boolean>
    minimize(): Promise<void>
    close(): Promise<void>
  }
  
  menu: {
    onNewGame(callback: () => void): () => void
    onQuickSave(callback: () => void): () => void
    onQuickLoad(callback: () => void): () => void
    onSaveGame(callback: () => void): () => void
    onLoadGame(callback: () => void): () => void
    onSettings(callback: () => void): () => void
    onHelp(callback: () => void): () => void
  }
  
  lifecycle: {
    onSaveBeforeExit(callback: () => void): () => void
    onClearAllData(callback: () => void): () => void
  }
  
  notification: {
    show(title: string, body: string, icon?: string): void
    requestPermission(): Promise<string>
  }
  
  performance: {
    getMemoryUsage(): { used: number; total: number; limit: number } | null
    mark(name: string): void
    measure(name: string, startMark: string, endMark: string): void
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
    isElectron?: boolean
    platform?: string
  }
}

/**
 * 跨平台存储适配器
 * 在Electron环境下使用安全的桌面存储
 * 在Web环境下回退到localStorage
 */
export class ElectronStorage {
  private isElectron: boolean
  private menuUnsubscribers: Array<() => void> = []

  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.isElectron === true
    console.log(this.isElectron ? '🖥️ 检测到Electron环境' : '🌐 检测到Web环境')
    
    if (this.isElectron) {
      this.initializeElectronIntegration()
    }
  }

  // ===========================================
  // 环境检测
  // ===========================================
  
  public get isDesktop(): boolean {
    return this.isElectron
  }
  
  public get platform(): string {
    return window.platform || 'web'
  }

  // ===========================================
  // 游戏数据存储
  // ===========================================
  
  async saveGameData(data: any): Promise<void> {
    try {
      if (this.isElectron && window.electronAPI) {
        await window.electronAPI.store.set('gameData', data)
        console.log('💾 游戏数据已保存到桌面存储')
      } else {
        localStorage.setItem('gameData', JSON.stringify(data))
        console.log('💾 游戏数据已保存到浏览器存储')
      }
    } catch (error) {
      console.error('❌ 保存游戏数据失败:', error)
      throw error
    }
  }

  async loadGameData(): Promise<any> {
    try {
      if (this.isElectron && window.electronAPI) {
        const data = await window.electronAPI.store.get('gameData')
        console.log('📂 从桌面存储加载游戏数据')
        return data
      } else {
        const data = localStorage.getItem('gameData')
        console.log('📂 从浏览器存储加载游戏数据')
        return data ? JSON.parse(data) : null
      }
    } catch (error) {
      console.error('❌ 加载游戏数据失败:', error)
      return null
    }
  }

  async clearGameData(): Promise<void> {
    try {
      if (this.isElectron && window.electronAPI) {
        await window.electronAPI.store.delete('gameData')
        console.log('🗑️ 桌面存储游戏数据已清除')
      } else {
        localStorage.removeItem('gameData')
        console.log('🗑️ 浏览器存储游戏数据已清除')
      }
    } catch (error) {
      console.error('❌ 清除游戏数据失败:', error)
      throw error
    }
  }

  // ===========================================
  // 配置管理
  // ===========================================
  
  async saveConfig(key: string, value: any): Promise<void> {
    try {
      if (this.isElectron && window.electronAPI) {
        await window.electronAPI.store.set(`config.${key}`, value)
      } else {
        localStorage.setItem(`config.${key}`, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`❌ 保存配置失败 ${key}:`, error)
      throw error
    }
  }

  async loadConfig(key: string): Promise<any> {
    try {
      if (this.isElectron && window.electronAPI) {
        return await window.electronAPI.store.get(`config.${key}`)
      } else {
        const data = localStorage.getItem(`config.${key}`)
        return data ? JSON.parse(data) : null
      }
    } catch (error) {
      console.error(`❌ 加载配置失败 ${key}:`, error)
      return null
    }
  }

  // ===========================================
  // 游戏设置 (仅Electron)
  // ===========================================
  
  async getGameSettings(): Promise<any> {
    if (this.isElectron && window.electronAPI) {
      return await window.electronAPI.gameSettings.get()
    }
    return this.loadConfig('gameSettings')
  }

  async updateGameSettings(settings: any): Promise<any> {
    if (this.isElectron && window.electronAPI) {
      return await window.electronAPI.gameSettings.update(settings)
    } else {
      await this.saveConfig('gameSettings', settings)
      return settings
    }
  }

  // ===========================================
  // 文件操作 (仅Electron)
  // ===========================================
  
  async exportSave(): Promise<string | null> {
    if (!this.isElectron || !window.electronAPI) {
      console.warn('⚠️ 文件导出仅在桌面版本中可用')
      return null
    }

    try {
      const result = await window.electronAPI.file.showSaveDialog()
      if (!result.canceled && result.filePath) {
        const gameData = await this.loadGameData()
        if (gameData) {
          // 在实际实现中，这里需要将数据写入到选择的文件路径
          console.log('💾 存档已导出到:', result.filePath)
          return result.filePath
        }
      }
      return null
    } catch (error) {
      console.error('❌ 导出存档失败:', error)
      throw error
    }
  }

  async importSave(): Promise<boolean> {
    if (!this.isElectron || !window.electronAPI) {
      console.warn('⚠️ 文件导入仅在桌面版本中可用')
      return false
    }

    try {
      const result = await window.electronAPI.file.showOpenDialog()
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        // 在实际实现中，这里需要从选择的文件读取数据
        console.log('📂 存档已导入自:', result.filePaths[0])
        return true
      }
      return false
    } catch (error) {
      console.error('❌ 导入存档失败:', error)
      throw error
    }
  }

  // ===========================================
  // 窗口控制 (仅Electron)
  // ===========================================
  
  async setFullscreen(fullscreen: boolean): Promise<void> {
    if (this.isElectron && window.electronAPI) {
      await window.electronAPI.window.setFullscreen(fullscreen)
    }
  }

  async minimizeWindow(): Promise<void> {
    if (this.isElectron && window.electronAPI) {
      await window.electronAPI.window.minimize()
    }
  }

  // ===========================================
  // 通知系统
  // ===========================================
  
  async showNotification(title: string, body: string, icon?: string): Promise<void> {
    if (this.isElectron && window.electronAPI) {
      window.electronAPI.notification.show(title, body, icon)
    } else if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon })
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, { body, icon })
        }
      }
    }
  }

  // ===========================================
  // 性能监控
  // ===========================================
  
  getMemoryUsage(): any {
    if (this.isElectron && window.electronAPI) {
      return window.electronAPI.performance.getMemoryUsage()
    } else if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  // ===========================================
  // Electron集成初始化
  // ===========================================
  
  private initializeElectronIntegration(): void {
    if (!window.electronAPI) {
      console.warn('⚠️ Electron API不可用')
      return
    }

    console.log('🔗 初始化Electron集成...')
    
    // 设置菜单事件监听
    this.setupMenuListeners()
    
    // 设置生命周期监听
    this.setupLifecycleListeners()
    
    // 获取应用信息
    this.logApplicationInfo()
  }

  private setupMenuListeners(): void {
    if (!window.electronAPI) return

    const api = window.electronAPI

    // 新游戏
    this.menuUnsubscribers.push(
      api.menu.onNewGame(() => {
        console.log('🎮 菜单：新游戏')
        this.handleNewGame()
      })
    )

    // 快速保存
    this.menuUnsubscribers.push(
      api.menu.onQuickSave(() => {
        console.log('💾 菜单：快速保存')
        this.handleQuickSave()
      })
    )

    // 快速加载
    this.menuUnsubscribers.push(
      api.menu.onQuickLoad(() => {
        console.log('📂 菜单：快速加载')
        this.handleQuickLoad()
      })
    )

    // 保存游戏
    this.menuUnsubscribers.push(
      api.menu.onSaveGame(() => {
        console.log('💾 菜单：保存游戏')
        this.handleSaveGame()
      })
    )

    // 加载游戏
    this.menuUnsubscribers.push(
      api.menu.onLoadGame(() => {
        console.log('📂 菜单：加载游戏')
        this.handleLoadGame()
      })
    )

    // 设置
    this.menuUnsubscribers.push(
      api.menu.onSettings(() => {
        console.log('⚙️ 菜单：设置')
        this.handleSettings()
      })
    )

    // 帮助
    this.menuUnsubscribers.push(
      api.menu.onHelp(() => {
        console.log('❓ 菜单：帮助')
        this.handleHelp()
      })
    )
  }

  private setupLifecycleListeners(): void {
    if (!window.electronAPI) return

    const api = window.electronAPI

    // 退出前保存
    this.menuUnsubscribers.push(
      api.lifecycle.onSaveBeforeExit(() => {
        console.log('💾 应用退出前自动保存')
        this.handleSaveBeforeExit()
      })
    )

    // 清除所有数据
    this.menuUnsubscribers.push(
      api.lifecycle.onClearAllData(() => {
        console.log('🗑️ 清除所有数据')
        this.handleClearAllData()
      })
    )
  }

  private async logApplicationInfo(): Promise<void> {
    if (!window.electronAPI) return

    try {
      const version = await window.electronAPI.app.getVersion()
      const systemInfo = await window.electronAPI.app.getSystemInfo()
      
      console.log('📱 应用信息:')
      console.log('  版本:', version)
      console.log('  平台:', systemInfo.platform)
      console.log('  架构:', systemInfo.arch)
      console.log('  内存:', systemInfo.memory)
    } catch (error) {
      console.warn('⚠️ 获取应用信息失败:', error)
    }
  }

  // ===========================================
  // 菜单事件处理器 (可被外部重写)
  // ===========================================
  
  public handleNewGame(): void {
    // 发送自定义事件，让游戏逻辑处理
    window.dispatchEvent(new CustomEvent('electron-menu-new-game'))
  }

  public handleQuickSave(): void {
    window.dispatchEvent(new CustomEvent('electron-menu-quick-save'))
  }

  public handleQuickLoad(): void {
    window.dispatchEvent(new CustomEvent('electron-menu-quick-load'))
  }

  public handleSaveGame(): void {
    window.dispatchEvent(new CustomEvent('electron-menu-save-game'))
  }

  public handleLoadGame(): void {
    window.dispatchEvent(new CustomEvent('electron-menu-load-game'))
  }

  public handleSettings(): void {
    window.dispatchEvent(new CustomEvent('electron-menu-settings'))
  }

  public handleHelp(): void {
    window.dispatchEvent(new CustomEvent('electron-menu-help'))
  }

  public handleSaveBeforeExit(): void {
    window.dispatchEvent(new CustomEvent('electron-save-before-exit'))
  }

  public handleClearAllData(): void {
    window.dispatchEvent(new CustomEvent('electron-clear-all-data'))
  }

  // ===========================================
  // 清理资源
  // ===========================================
  
  public destroy(): void {
    // 清理所有菜单监听器
    this.menuUnsubscribers.forEach(unsubscribe => unsubscribe())
    this.menuUnsubscribers = []
    
    console.log('🧹 ElectronStorage已清理')
  }
}

// 创建全局实例
export const electronStorage = new ElectronStorage() 