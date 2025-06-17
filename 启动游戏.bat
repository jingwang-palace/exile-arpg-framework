@echo off
chcp 65001 >nul
title 像素风流放之路 - 启动中...
color 0B

echo.
echo ═══════════════════════════════════════════════════════════
echo                    🎮 像素风流放之路
echo ═══════════════════════════════════════════════════════════
echo.

:: 检查是否已安装依赖
if not exist "node_modules\" (
    echo 📦 首次运行，正在安装依赖...
    echo.
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败！
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成！
    echo.
) else (
    echo ✅ 依赖已安装
)

:: 检查Electron是否已设置
if not exist "electron\main.js" (
    echo ⚠️  检测到未设置Electron桌面版本
    echo.
    choice /c YN /m "是否现在设置Electron桌面版本？"
    if errorlevel 2 goto :web_version
    if errorlevel 1 (
        echo 🔧 正在设置Electron...
        call "一键设置Electron.bat"
        goto :start_electron
    )
)

:start_electron
echo 🎮 启动桌面版游戏...
echo.
echo 💡 提示：游戏启动后可以：
echo    - 按F11切换全屏
echo    - 按F5快速保存
echo    - 按F9快速加载
echo    - 按Esc打开菜单
echo.

:: 启动Electron版本
npm run electron:dev

goto :end

:web_version
echo 🌐 启动Web版游戏...
echo.
echo 💡 提示：游戏将在浏览器中打开
echo    地址：http://localhost:5173
echo.

:: 启动Web版本
npm run dev

:end
echo.
echo 游戏已关闭，感谢游玩！ 🎮
pause 