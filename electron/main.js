const { app, BrowserWindow, Menu, dialog, shell, ipcMain, globalShortcut } = require('electron')
const { autoUpdater } = require('electron-updater')
const windowStateKeeper = require('electron-window-state')
const Store = require('electron-store')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'

// 初始化安全的配置存储
const store = new Store({
  name: 'pixel-arpg-config',
  defaults: {
    gameSettings: {
      graphics: {
        fullscreen: false,
        vsync: true,
        maxFPS: 60
      },
      audio: {
        masterVolume: 0.8,
        musicVolume: 0.6,
        soundVolume: 0.8
      }
    },
    playerData: {}
  }
})

class PixelARPGElectronApp {
  constructor() {
    this.mainWindow = null
    this.splashWindow = null
    this.isQuitting = false
    
    // 游戏特定设置
    this.gameSettings = store.get('gameSettings')
  }

  async initialize() {
    // 等待Electron准备就绪
    await app.whenReady()
    
    // 设置应用协议
    this.setupProtocols()
    
    // 优化游戏性能
    this.optimizeForGaming()
    
    // 创建启动画面
    this.createSplashWindow()
    
    // 延迟创建主窗口，给游戏资源加载时间
    setTimeout(() => {
      this.createMainWindow()
      this.closeSplashWindow()
    }, 2000)

    // 设置应用事件
    this.setupAppEvents()
    
    // 设置自动更新
    this.setupAutoUpdater()
    
    // 创建菜单
    this.createGameMenus()
    
    // 设置全局快捷键
    this.setupGlobalShortcuts()
    
    console.log('🎮 像素风ARPG Electron应用启动完成')
  }

  setupProtocols() {
    // 设置应用为默认协议处理器
    if (!isDev) {
      app.setAsDefaultProtocolClient('pixel-arpg')
    }
  }

  optimizeForGaming() {
    // 游戏性能优化参数
    app.commandLine.appendSwitch('enable-gpu-rasterization')
    app.commandLine.appendSwitch('enable-zero-copy')
    app.commandLine.appendSwitch('ignore-gpu-blacklist')
    app.commandLine.appendSwitch('disable-software-rasterizer')
    app.commandLine.appendSwitch('disable-background-timer-throttling')
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
    app.commandLine.appendSwitch('disable-renderer-backgrounding')
    
    // 启用硬件加速
    if (!app.commandLine.hasSwitch('disable-gpu')) {
      app.commandLine.appendSwitch('enable-gpu-rasterization')
    }
  }

  createSplashWindow() {
    this.splashWindow = new BrowserWindow({
      width: 600,
      height: 400,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      center: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    // 加载启动画面
    const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(45deg, #1a1a2e, #16213e);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: 'Courier New', monospace;
          color: #00ff88;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 0 0 10px #00ff88;
        }
        .loading {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .progress {
          width: 300px;
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #00ccff);
          animation: loading 2s ease-in-out infinite;
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="logo">像素风流放之路</div>
      <div class="loading">正在启动游戏引擎...</div>
      <div class="progress">
        <div class="progress-bar"></div>
      </div>
    </body>
    </html>
    `
    
    this.splashWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(splashHTML)}`)
  }

  createMainWindow() {
    // 恢复窗口状态
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1920,
      defaultHeight: 1080
    })

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 1024,
      minHeight: 768,
      show: false,
      titleBarStyle: 'default',
      icon: path.join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        // 游戏优化
        experimentalFeatures: true,
        webSecurity: !isDev
      }
    })

    // 让windowStateKeeper管理窗口状态
    mainWindowState.manage(this.mainWindow)

    // 加载游戏应用
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    // 窗口事件处理
    this.setupWindowEvents()

    // 游戏相关的窗口优化
    this.optimizeGameWindow()
  }

  setupWindowEvents() {
    // 窗口准备就绪
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show()
      
      // 应用保存的全屏设置
      if (this.gameSettings.graphics.fullscreen) {
        this.mainWindow.setFullScreen(true)
      }
      
      console.log('🎮 游戏窗口已显示')
    })

    // 窗口关闭事件
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault()
        
        // 保存游戏数据
        this.mainWindow.webContents.send('save-game-before-exit')
        
        // 最小化到托盘或确认退出
        dialog.showMessageBox(this.mainWindow, {
          type: 'question',
          buttons: ['最小化到托盘', '保存并退出', '取消'],
          defaultId: 0,
          title: '确认退出',
          message: '确定要退出游戏吗？',
          detail: '未保存的进度可能会丢失。'
        }).then((result) => {
          if (result.response === 1) {
            this.isQuitting = true
            app.quit()
          } else if (result.response === 0) {
            this.mainWindow.hide()
          }
        })
      }
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // 防止意外的新窗口
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    // 全屏状态变化
    this.mainWindow.on('enter-full-screen', () => {
      this.gameSettings.graphics.fullscreen = true
      store.set('gameSettings.graphics.fullscreen', true)
    })

    this.mainWindow.on('leave-full-screen', () => {
      this.gameSettings.graphics.fullscreen = false
      store.set('gameSettings.graphics.fullscreen', false)
    })
  }

  optimizeGameWindow() {
    // 禁用菜单栏在全屏模式下的自动隐藏
    this.mainWindow.setAutoHideMenuBar(false)
    
    // 设置窗口优先级
    if (process.platform === 'win32') {
      this.mainWindow.setAlwaysOnTop(false)
    }
  }

  closeSplashWindow() {
    if (this.splashWindow) {
      this.splashWindow.close()
      this.splashWindow = null
    }
  }

  createGameMenus() {
    const template = [
      {
        label: '游戏',
        submenu: [
          {
            label: '新游戏',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.sendToRenderer('menu-new-game')
            }
          },
          {
            label: '快速保存',
            accelerator: 'F5',
            click: () => {
              this.sendToRenderer('menu-quick-save')
            }
          },
          {
            label: '快速加载',
            accelerator: 'F9',
            click: () => {
              this.sendToRenderer('menu-quick-load')
            }
          },
          { type: 'separator' },
          {
            label: '保存游戏',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.sendToRenderer('menu-save-game')
            }
          },
          {
            label: '加载游戏',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.sendToRenderer('menu-load-game')
            }
          },
          { type: 'separator' },
          {
            label: '游戏设置',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.sendToRenderer('menu-settings')
            }
          },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
            click: () => {
              this.isQuitting = true
              app.quit()
            }
          }
        ]
      },
      {
        label: '视图',
        submenu: [
          {
            label: '全屏',
            accelerator: 'F11',
            click: () => {
              const isFullScreen = this.mainWindow.isFullScreen()
              this.mainWindow.setFullScreen(!isFullScreen)
            }
          },
          {
            label: '重置窗口大小',
            click: () => {
              this.mainWindow.setSize(1920, 1080)
              this.mainWindow.center()
            }
          },
          { type: 'separator' },
          {
            label: '最小化',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
          }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '游戏指南',
            click: () => {
              this.sendToRenderer('menu-help')
            }
          },
          {
            label: '快捷键',
            click: () => {
              this.showShortcuts()
            }
          },
          { type: 'separator' },
          {
            label: '关于',
            click: () => {
              this.showAbout()
            }
          }
        ]
      }
    ]

    // 开发模式菜单
    if (isDev) {
      template.push({
        label: '开发',
        submenu: [
          {
            label: '重载',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow.reload()
            }
          },
          {
            label: '强制重载',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              this.mainWindow.webContents.reloadIgnoringCache()
            }
          },
          {
            label: '开发者工具',
            accelerator: 'F12',
            click: () => {
              this.mainWindow.webContents.toggleDevTools()
            }
          },
          { type: 'separator' },
          {
            label: '清除数据',
            click: () => {
              this.clearAllData()
            }
          }
        ]
      })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  setupGlobalShortcuts() {
    // 全局快捷键，即使游戏失去焦点也能使用
    globalShortcut.register('F11', () => {
      if (this.mainWindow) {
        const isFullScreen = this.mainWindow.isFullScreen()
        this.mainWindow.setFullScreen(!isFullScreen)
      }
    })

    globalShortcut.register('Alt+Tab', () => {
      // 禁用Alt+Tab在全屏游戏中的默认行为
      return false
    })
  }

  setupAppEvents() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow()
      }
    })

    app.on('before-quit', () => {
      this.isQuitting = true
    })

    app.on('will-quit', () => {
      // 清理全局快捷键
      globalShortcut.unregisterAll()
    })

    // IPC事件处理
    this.setupIPC()
  }

  setupIPC() {
    // 应用信息
    ipcMain.handle('get-app-version', () => {
      return app.getVersion()
    })

    ipcMain.handle('get-app-path', () => {
      return app.getPath('userData')
    })

    // 文件操作
    ipcMain.handle('show-save-dialog', async () => {
      const result = await dialog.showSaveDialog(this.mainWindow, {
        title: '保存游戏',
        defaultPath: 'save_game.json',
        filters: [
          { name: '游戏存档', extensions: ['json', 'sav'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      return result
    })

    ipcMain.handle('show-open-dialog', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        title: '加载游戏',
        filters: [
          { name: '游戏存档', extensions: ['json', 'sav'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      })
      return result
    })

    // 配置存储
    ipcMain.handle('store-get', (event, key) => {
      return store.get(key)
    })

    ipcMain.handle('store-set', (event, key, value) => {
      store.set(key, value)
      return true
    })

    ipcMain.handle('store-delete', (event, key) => {
      store.delete(key)
      return true
    })

    ipcMain.handle('store-clear', () => {
      store.clear()
      return true
    })

    // 游戏设置
    ipcMain.handle('get-game-settings', () => {
      return this.gameSettings
    })

    ipcMain.handle('update-game-settings', (event, newSettings) => {
      this.gameSettings = { ...this.gameSettings, ...newSettings }
      store.set('gameSettings', this.gameSettings)
      return this.gameSettings
    })

    // 窗口控制
    ipcMain.handle('set-fullscreen', (event, fullscreen) => {
      this.mainWindow.setFullScreen(fullscreen)
      return fullscreen
    })

    ipcMain.handle('minimize-window', () => {
      this.mainWindow.minimize()
    })

    ipcMain.handle('close-window', () => {
      this.mainWindow.close()
    })

    // 性能监控
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        memory: process.getSystemMemoryInfo?.() || {},
        cpu: process.getCPUUsage()
      }
    })
  }

  setupAutoUpdater() {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify()
      
      autoUpdater.on('update-available', () => {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: '更新可用',
          message: '发现新版本！',
          detail: '新版本正在后台下载，下载完成后会通知您。',
          buttons: ['好的']
        })
      })

      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: '更新就绪',
          message: '更新已下载完成！',
          detail: '重启应用程序以应用更新。现在重启吗？',
          buttons: ['稍后重启', '现在重启']
        }).then((result) => {
          if (result.response === 1) {
            setImmediate(() => autoUpdater.quitAndInstall())
          }
        })
      })
    }
  }

  // 工具方法
  sendToRenderer(channel, ...args) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }

  showShortcuts() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '游戏快捷键',
      message: '快捷键指南',
      detail: `
游戏控制：
F11 - 切换全屏
F5 - 快速保存
F9 - 快速加载
Esc - 暂停/菜单

文件操作：
Ctrl+N - 新游戏
Ctrl+S - 保存游戏
Ctrl+O - 加载游戏
Ctrl+, - 设置

窗口控制：
Ctrl+M - 最小化
Alt+F4 - 退出
      `,
      buttons: ['确定']
    })
  }

  showAbout() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '关于游戏',
      message: '像素风流放之路',
      detail: `
版本: ${app.getVersion()}
基于: Electron + Vue3 + Phaser
开发框架: 像素风ARPG框架

一个高度可配置的像素风格ARPG游戏。
      `,
      buttons: ['确定']
    })
  }

  clearAllData() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'warning',
      title: '清除所有数据',
      message: '确定要清除所有游戏数据吗？',
      detail: '这将删除所有存档、设置和缓存数据。此操作不可恢复！',
      buttons: ['取消', '确定清除']
    }).then((result) => {
      if (result.response === 1) {
        store.clear()
        this.mainWindow.webContents.send('clear-all-data')
        
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: '数据已清除',
          message: '所有数据已清除，重启应用生效。',
          buttons: ['确定']
        })
      }
    })
  }
}

// 启动应用
const pixelARPGApp = new PixelARPGElectronApp()
pixelARPGApp.initialize().catch(console.error) 