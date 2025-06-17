const { contextBridge, ipcRenderer } = require('electron')

// 安全地暴露桌面API给游戏渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // ===========================================
  // 应用信息 API
  // ===========================================
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getPath: () => ipcRenderer.invoke('get-app-path'),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info')
  },

  // ===========================================
  // 文件操作 API
  // ===========================================
  file: {
    showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
    showOpenDialog: () => ipcRenderer.invoke('show-open-dialog')
  },

  // ===========================================
  // 本地存储 API (替代localStorage)
  // ===========================================
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear')
  },

  // ===========================================
  // 游戏设置 API
  // ===========================================
  gameSettings: {
    get: () => ipcRenderer.invoke('get-game-settings'),
    update: (settings) => ipcRenderer.invoke('update-game-settings', settings)
  },

  // ===========================================
  // 窗口控制 API
  // ===========================================
  window: {
    setFullscreen: (fullscreen) => ipcRenderer.invoke('set-fullscreen', fullscreen),
    minimize: () => ipcRenderer.invoke('minimize-window'),
    close: () => ipcRenderer.invoke('close-window')
  },

  // ===========================================
  // 菜单事件监听 API
  // ===========================================
  menu: {
    // 监听菜单事件
    onNewGame: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-new-game', handler)
      return () => ipcRenderer.removeListener('menu-new-game', handler)
    },

    onQuickSave: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-quick-save', handler)
      return () => ipcRenderer.removeListener('menu-quick-save', handler)
    },

    onQuickLoad: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-quick-load', handler)
      return () => ipcRenderer.removeListener('menu-quick-load', handler)
    },

    onSaveGame: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-save-game', handler)
      return () => ipcRenderer.removeListener('menu-save-game', handler)
    },

    onLoadGame: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-load-game', handler)
      return () => ipcRenderer.removeListener('menu-load-game', handler)
    },

    onSettings: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-settings', handler)
      return () => ipcRenderer.removeListener('menu-settings', handler)
    },

    onHelp: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('menu-help', handler)
      return () => ipcRenderer.removeListener('menu-help', handler)
    }
  },

  // ===========================================
  // 游戏生命周期 API
  // ===========================================
  lifecycle: {
    // 监听退出前保存事件
    onSaveBeforeExit: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('save-game-before-exit', handler)
      return () => ipcRenderer.removeListener('save-game-before-exit', handler)
    },

    // 监听清除数据事件
    onClearAllData: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('clear-all-data', handler)
      return () => ipcRenderer.removeListener('clear-all-data', handler)
    }
  },

  // ===========================================
  // 桌面通知 API
  // ===========================================
  notification: {
    show: (title, body, icon) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon })
      }
    },

    requestPermission: async () => {
      if ('Notification' in window) {
        return await Notification.requestPermission()
      }
      return 'denied'
    }
  },

  // ===========================================
  // 性能监控 API
  // ===========================================
  performance: {
    getMemoryUsage: () => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    },

    mark: (name) => {
      if (performance.mark) {
        performance.mark(name)
      }
    },

    measure: (name, startMark, endMark) => {
      if (performance.measure) {
        performance.measure(name, startMark, endMark)
      }
    }
  },

  // ===========================================
  // 调试工具 API (仅开发模式)
  // ===========================================
  debug: {
    log: (...args) => {
      console.log('[Electron]', ...args)
    },

    error: (...args) => {
      console.error('[Electron]', ...args)
    },

    warn: (...args) => {
      console.warn('[Electron]', ...args)
    }
  }
})

// ===========================================
// 环境检测
// ===========================================
contextBridge.exposeInMainWorld('isElectron', true)
contextBridge.exposeInMainWorld('platform', process.platform)

// ===========================================
// 初始化通知
// ===========================================
window.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Electron预加载脚本已加载')
  
  // 自动请求通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('通知权限:', permission)
    })
  }
})

// ===========================================
// 错误处理
// ===========================================
window.addEventListener('error', (event) => {
  console.error('渲染进程错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise错误:', event.reason)
}) 