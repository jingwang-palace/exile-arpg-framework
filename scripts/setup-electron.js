const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class ElectronSetup {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..')
    this.packageJsonPath = path.join(this.rootDir, 'package.json')
  }

  async setup() {
    console.log('🚀 开始设置Electron桌面应用...')
    
    try {
      // 1. 安装Electron依赖
      await this.installDependencies()
      
      // 2. 更新package.json
      await this.updatePackageJson()
      
      // 3. 创建必要的目录和文件
      await this.createDirectories()
      await this.createAssets()
      
      // 4. 更新Vite配置
      await this.updateViteConfig()
      
      // 5. 创建启动脚本
      await this.createScripts()
      
      console.log('✅ Electron设置完成！')
      console.log('\n📝 使用说明：')
      console.log('  开发模式: npm run electron:dev')
      console.log('  构建应用: npm run electron:build')
      console.log('  打包exe: npm run dist:win')
      console.log('  跨平台打包: npm run dist')
      
    } catch (error) {
      console.error('❌ 设置失败:', error.message)
      process.exit(1)
    }
  }

  async installDependencies() {
    console.log('📦 安装Electron依赖...')
    
    const devDependencies = [
      'electron',
      'electron-builder',
      'concurrently',
      'wait-on',
      'cross-env'
    ]
    
    const dependencies = [
      'electron-store',
      'electron-updater',
      'electron-window-state'
    ]
    
    // 安装开发依赖
    console.log('安装开发依赖...')
    execSync(`npm install --save-dev ${devDependencies.join(' ')}`, {
      stdio: 'inherit',
      cwd: this.rootDir
    })
    
    // 安装运行时依赖
    console.log('安装运行时依赖...')
    execSync(`npm install --save ${dependencies.join(' ')}`, {
      stdio: 'inherit',
      cwd: this.rootDir
    })
  }

  async updatePackageJson() {
    console.log('📝 更新package.json配置...')
    
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'))
    
    // 添加Electron配置
    packageJson.main = 'electron/main.js'
    packageJson.homepage = './'
    
    // 更新scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'electron:dev': 'concurrently "npm run dev" "wait-on http://localhost:5173 && cross-env NODE_ENV=development electron ."',
      'electron:build': 'npm run build && cross-env NODE_ENV=production electron .',
      'electron:pack': 'npm run build && electron-builder --dir',
      'dist': 'npm run build && electron-builder',
      'dist:win': 'npm run build && electron-builder --win',
      'dist:mac': 'npm run build && electron-builder --mac',
      'dist:linux': 'npm run build && electron-builder --linux',
      'clean': 'rimraf dist release'
    }
    
    // 添加electron-builder配置
    packageJson.build = {
      appId: 'com.pixelarpg.game',
      productName: '像素风流放之路',
      directories: {
        output: 'release',
        buildResources: 'assets'
      },
      files: [
        'dist/**/*',
        'electron/**/*',
        'assets/icon.*',
        'node_modules/**/*'
      ],
      extraResources: [
        {
          from: 'config/',
          to: 'config/',
          filter: ['**/*']
        }
      ],
      win: {
        target: [
          {
            target: 'nsis',
            arch: ['x64']
          },
          {
            target: 'portable',
            arch: ['x64']
          },
          {
            target: 'zip',
            arch: ['x64']
          }
        ],
        icon: 'assets/icon.ico',
        requestedExecutionLevel: 'asInvoker'
      },
      mac: {
        target: [
          {
            target: 'dmg',
            arch: ['x64', 'arm64']
          }
        ],
        icon: 'assets/icon.icns',
        category: 'public.app-category.games'
      },
      linux: {
        target: [
          {
            target: 'AppImage',
            arch: ['x64']
          },
          {
            target: 'deb',
            arch: ['x64']
          }
        ],
        icon: 'assets/icon.png',
        category: 'Game'
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        allowElevation: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: '像素风流放之路',
        include: 'assets/installer.nsh'
      },
      publish: {
        provider: 'github',
        owner: 'your-username',
        repo: 'pixel-arpg'
      }
    }
    
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  async createDirectories() {
    console.log('📁 创建目录结构...')
    
    const directories = [
      'electron',
      'assets',
      'release'
    ]
    
    directories.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
        console.log(`  创建目录: ${dir}`)
      }
    })
  }

  async createAssets() {
    console.log('🎨 创建应用图标和资源...')
    
    // 创建应用图标 (简单的SVG转换)
    const iconSvg = `
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="32" fill="url(#grad1)"/>
  <text x="128" y="140" font-family="Arial" font-size="120" font-weight="bold" 
        text-anchor="middle" fill="white">POE</text>
  <text x="128" y="200" font-family="Arial" font-size="24" 
        text-anchor="middle" fill="white">像素风</text>
</svg>
    `.trim()
    
    fs.writeFileSync(path.join(this.rootDir, 'assets', 'icon.svg'), iconSvg)
    
    // 创建安装器脚本
    const installerScript = `
; 安装器自定义脚本
!macro customInstall
  ; 创建桌面快捷方式
  CreateShortCut "$DESKTOP\\像素风流放之路.lnk" "$INSTDIR\\像素风流放之路.exe"
  
  ; 设置文件关联
  WriteRegStr HKCR ".poe" "" "PixelARPGSave"
  WriteRegStr HKCR "PixelARPGSave" "" "像素风流放之路存档"
  WriteRegStr HKCR "PixelARPGSave\\DefaultIcon" "" "$INSTDIR\\像素风流放之路.exe,0"
  WriteRegStr HKCR "PixelARPGSave\\shell\\open\\command" "" '"$INSTDIR\\像素风流放之路.exe" "%1"'
!macroend

!macro customUnInstall
  ; 删除桌面快捷方式
  Delete "$DESKTOP\\像素风流放之路.lnk"
  
  ; 清理注册表
  DeleteRegKey HKCR ".poe"
  DeleteRegKey HKCR "PixelARPGSave"
!macroend
    `.trim()
    
    fs.writeFileSync(path.join(this.rootDir, 'assets', 'installer.nsh'), installerScript)
  }

  async updateViteConfig() {
    console.log('⚙️ 更新Vite配置...')
    
    const viteConfigPath = path.join(this.rootDir, 'vite.config.ts')
    
    if (fs.existsSync(viteConfigPath)) {
      let viteConfig = fs.readFileSync(viteConfigPath, 'utf8')
      
      // 检查是否已经包含Electron配置
      if (!viteConfig.includes('base: process.env.NODE_ENV === \'production\' ? \'./\' : \'/\'')) {
        // 添加Electron兼容配置
        viteConfig = viteConfig.replace(
          'export default defineConfig({',
          `export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? './' : '/',`
        )
        
        fs.writeFileSync(viteConfigPath, viteConfig)
        console.log('  更新了Vite配置以支持Electron')
      }
    }
  }

  async createScripts() {
    console.log('📜 创建启动脚本...')
    
    // Windows批处理文件
    const windowsScript = `
@echo off
title 像素风流放之路 - 启动中...
echo 🎮 正在启动像素风流放之路...
echo.

if exist node_modules (
    echo ✅ 依赖已安装
) else (
    echo 📦 安装依赖中...
    npm install
)

echo 🚀 启动Electron应用...
npm run electron:dev

pause
    `.trim()
    
    fs.writeFileSync(path.join(this.rootDir, 'start-game.bat'), windowsScript)
    
    // 打包脚本
    const buildScript = `
@echo off
title 像素风流放之路 - 打包中...
echo 🎮 正在打包像素风流放之路...
echo.

echo 📦 清理旧文件...
npm run clean

echo 🔨 构建应用...
npm run build

echo 📦 打包exe文件...
npm run dist:win

echo.
echo ✅ 打包完成！
echo 📁 输出目录: release/
echo.
pause
    `.trim()
    
    fs.writeFileSync(path.join(this.rootDir, 'build-game.bat'), buildScript)
    
    // Linux/Mac脚本
    const unixScript = `#!/bin/bash
echo "🎮 启动像素风流放之路..."

if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    npm install
fi

echo "🚀 启动Electron应用..."
npm run electron:dev
    `.trim()
    
    fs.writeFileSync(path.join(this.rootDir, 'start-game.sh'), unixScript)
    
    // 给脚本执行权限
    try {
      execSync('chmod +x start-game.sh', { cwd: this.rootDir })
    } catch (error) {
      // Windows上可能会失败，忽略
    }
  }
}

// 运行设置
if (require.main === module) {
  const setup = new ElectronSetup()
  setup.setup()
}

module.exports = ElectronSetup 