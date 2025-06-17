@echo off
chcp 65001 >nul
title 像素风流放之路 - 打包exe
color 0E

echo.
echo ═══════════════════════════════════════════════════════════
echo               🎮 像素风流放之路 - 打包exe
echo ═══════════════════════════════════════════════════════════
echo.

:: 检查环境
echo 🔍 检查打包环境...

if not exist "node_modules\" (
    echo ❌ 错误：未安装依赖！
    echo 请先运行"启动游戏.bat"安装依赖
    pause
    exit /b 1
)

if not exist "electron\main.js" (
    echo ❌ 错误：未设置Electron！
    echo 请先运行"一键设置Electron.bat"
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

:: 选择打包选项
echo ═══════════════════════════════════════════════════════════
echo                     📦 打包选项
echo ═══════════════════════════════════════════════════════════
echo.
echo  1. 🖥️  仅Windows版 (推荐)
echo  2. 🌍 全平台版本 (Windows + Mac + Linux)
echo  3. 📁 仅打包到文件夹 (测试用)
echo  4. 🧹 清理旧文件后重新打包
echo.

choice /c 1234 /m "请选择打包选项"

if errorlevel 4 goto :clean_build
if errorlevel 3 goto :pack_folder
if errorlevel 2 goto :build_all
if errorlevel 1 goto :build_windows

:build_windows
echo.
echo 🖥️ 开始打包Windows版本...
echo.
echo ⏱️ 预计耗时：3-5分钟
echo 📁 输出目录：release\
echo.

:: 清理旧的构建文件
if exist "dist\" (
    echo 🧹 清理旧的构建文件...
    rmdir /s /q "dist"
)

:: 构建项目
echo 🔨 构建游戏文件...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

:: 打包Windows exe
echo 📦 打包Windows exe...
npm run dist:win
if errorlevel 1 (
    echo ❌ 打包失败！
    pause
    exit /b 1
)

goto :success

:build_all
echo.
echo 🌍 开始打包全平台版本...
echo.
echo ⏱️ 预计耗时：10-15分钟
echo 📁 输出目录：release\
echo.

:: 清理旧的构建文件
if exist "dist\" (
    echo 🧹 清理旧的构建文件...
    rmdir /s /q "dist"
)

:: 构建项目
echo 🔨 构建游戏文件...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

:: 打包全平台
echo 📦 打包全平台版本...
npm run dist
if errorlevel 1 (
    echo ❌ 打包失败！
    pause
    exit /b 1
)

goto :success

:pack_folder
echo.
echo 📁 打包到文件夹 (不创建安装包)...
echo.

:: 清理旧的构建文件
if exist "dist\" (
    echo 🧹 清理旧的构建文件...
    rmdir /s /q "dist"
)

:: 构建项目
echo 🔨 构建游戏文件...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

:: 仅打包到文件夹
echo 📦 打包到文件夹...
npm run electron:pack
if errorlevel 1 (
    echo ❌ 打包失败！
    pause
    exit /b 1
)

goto :success

:clean_build
echo.
echo 🧹 清理所有旧文件...
echo.

:: 清理所有构建产物
if exist "dist\" (
    echo 删除 dist\...
    rmdir /s /q "dist"
)

if exist "release\" (
    echo 删除 release\...
    rmdir /s /q "release"
)

echo ✅ 清理完成！
echo.
echo 🔨 重新构建和打包...

:: 重新构建
npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

:: 重新打包
npm run dist:win
if errorlevel 1 (
    echo ❌ 打包失败！
    pause
    exit /b 1
)

goto :success

:success
echo.
echo ═══════════════════════════════════════════════════════════
echo                   ✅ 打包成功完成！
echo ═══════════════════════════════════════════════════════════
echo.

:: 显示输出文件信息
if exist "release\" (
    echo 📁 输出目录：release\
    echo.
    echo 🎯 生成的文件：
    dir /b "release\*.exe" 2>nul && echo    - Windows安装包 (.exe)
    dir /b "release\*.zip" 2>nul && echo    - Windows便携版 (.zip)
    dir /b "release\*.dmg" 2>nul && echo    - macOS磁盘镜像 (.dmg)
    dir /b "release\*.AppImage" 2>nul && echo    - Linux应用镜像 (.AppImage)
    dir /b "release\*.deb" 2>nul && echo    - Debian安装包 (.deb)
    echo.
    
    :: 计算文件大小
    for %%f in ("release\*.exe") do (
        set /a size=%%~zf/1024/1024
        echo 📊 安装包大小：约 !size! MB
    )
) else (
    echo ❌ 未找到输出文件！
)

echo.
echo ═══════════════════════════════════════════════════════════
echo                    🎮 使用说明
echo ═══════════════════════════════════════════════════════════
echo.
echo  🎯 安装包用法：
echo    - .exe文件 - 双击安装到系统
echo    - .zip文件 - 解压即用，无需安装
echo.
echo  📤 分发建议：
echo    - 小型分发：使用.zip便携版
echo    - 正式发布：使用.exe安装包
echo    - 企业分发：使用.msi企业包
echo.
echo ═══════════════════════════════════════════════════════════

echo.
choice /c YN /m "是否打开输出文件夹？"

if errorlevel 2 goto :end
if errorlevel 1 (
    echo 📂 打开输出文件夹...
    start "" "release"
)

:end
echo.
echo 🎉 打包完成！祝您的游戏大获成功！
pause 