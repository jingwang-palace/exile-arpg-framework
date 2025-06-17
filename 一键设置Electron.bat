@echo off
chcp 65001 >nul
title 像素风流放之路 - Electron设置向导
color 0A

echo.
echo ═══════════════════════════════════════════════════════════
echo                🎮 像素风流放之路 - Electron设置向导
echo ═══════════════════════════════════════════════════════════
echo.

:: 检查Node.js环境
echo 🔍 检查开发环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到Node.js！
    echo.
    echo 请先安装Node.js：https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js环境正常
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：npm命令不可用！
    pause
    exit /b 1
) else (
    echo ✅ npm包管理器正常
)

echo.
echo 🚀 开始自动设置Electron桌面应用...
echo.

:: 运行设置脚本
echo 📦 正在安装Electron相关依赖...
node scripts/setup-electron.js

if errorlevel 1 (
    echo.
    echo ❌ 设置失败！请检查错误信息。
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Electron设置完成！
echo.
echo ═══════════════════════════════════════════════════════════
echo                   🎯 可用的操作命令
echo ═══════════════════════════════════════════════════════════
echo.
echo  🎮 测试游戏     - 双击 "启动游戏.bat"
echo  📦 打包exe     - 双击 "打包exe.bat"  
echo  🔧 开发模式     - npm run electron:dev
echo  🌐 Web版本     - npm run dev
echo.
echo ═══════════════════════════════════════════════════════════

echo.
echo 是否现在启动游戏测试？
choice /c YN /m "按Y启动游戏，按N退出"

if errorlevel 2 goto :end
if errorlevel 1 goto :start_game

:start_game
echo.
echo 🎮 正在启动游戏...
start "" "启动游戏.bat"
goto :end

:end
echo.
echo 感谢使用像素风流放之路！🎮
pause 