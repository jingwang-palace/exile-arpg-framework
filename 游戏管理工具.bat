@echo off
chcp 65001 >nul
title 像素风流放之路 - 游戏管理工具
color 0A

:main_menu
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo                🎮 像素风流放之路 - 游戏管理工具
echo ═══════════════════════════════════════════════════════════
echo.
echo                     当前版本：v1.0.0
echo                    框架版本：像素风ARPG框架
echo.
echo ═══════════════════════════════════════════════════════════
echo                      🎯 主菜单选项
echo ═══════════════════════════════════════════════════════════
echo.
echo  1. 🎮 启动游戏 (开发/测试)
echo  2. 🔧 设置Electron桌面版
echo  3. 📦 打包exe文件
echo  4. 🌐 启动Web服务器
echo  5. 🧹 清理项目文件
echo  6. 📊 查看项目状态
echo  7. 🔄 更新依赖
echo  8. ❓ 帮助文档
echo  9. 🚪 退出
echo.
echo ═══════════════════════════════════════════════════════════

choice /c 123456789 /m "请选择操作"

if errorlevel 9 goto :exit
if errorlevel 8 goto :help
if errorlevel 7 goto :update_deps
if errorlevel 6 goto :status
if errorlevel 5 goto :clean
if errorlevel 4 goto :web_server
if errorlevel 3 goto :build_exe
if errorlevel 2 goto :setup_electron
if errorlevel 1 goto :start_game

:start_game
cls
echo.
echo 🎮 启动游戏...
echo.
call "启动游戏.bat"
goto :main_menu

:setup_electron
cls
echo.
echo 🔧 设置Electron桌面版...
echo.
call "一键设置Electron.bat"
goto :main_menu

:build_exe
cls
echo.
echo 📦 打包exe文件...
echo.
call "打包exe.bat"
goto :main_menu

:web_server
cls
echo.
echo 🌐 启动Web服务器...
echo.
echo 💡 提示：适合测试Web版本
echo    地址：http://localhost:5173
echo.

:: 检查依赖
if not exist "node_modules\" (
    echo 📦 安装依赖中...
    npm install
)

npm run dev
echo.
echo Web服务器已关闭
pause
goto :main_menu

:clean
cls
echo.
echo 🧹 清理项目文件...
echo.
echo 📁 将清理以下文件/文件夹：
echo    - node_modules\ (依赖文件)
echo    - dist\ (构建文件)
echo    - release\ (打包文件)
echo    - *.log (日志文件)
echo.

choice /c YN /m "确定要清理吗？这将需要重新安装依赖"

if errorlevel 2 goto :main_menu
if errorlevel 1 (
    echo.
    echo 🗑️ 清理中...
    
    if exist "node_modules\" (
        echo 删除 node_modules\...
        rmdir /s /q "node_modules"
    )
    
    if exist "dist\" (
        echo 删除 dist\...
        rmdir /s /q "dist"
    )
    
    if exist "release\" (
        echo 删除 release\...
        rmdir /s /q "release"
    )
    
    del /q *.log 2>nul
    
    echo ✅ 清理完成！
    echo.
    pause
)
goto :main_menu

:status
cls
echo.
echo 📊 项目状态检查...
echo.
echo ═══════════════════════════════════════════════════════════
echo                      📋 环境状态
echo ═══════════════════════════════════════════════════════════

:: 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js: 未安装
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
)

:: 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm: 不可用
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
)

echo.
echo ═══════════════════════════════════════════════════════════
echo                      📁 项目文件
echo ═══════════════════════════════════════════════════════════

:: 检查关键文件
if exist "package.json" (
    echo ✅ package.json: 存在
) else (
    echo ❌ package.json: 缺失
)

if exist "node_modules\" (
    echo ✅ node_modules: 已安装
) else (
    echo ❌ node_modules: 未安装
)

if exist "src\" (
    echo ✅ src目录: 存在
) else (
    echo ❌ src目录: 缺失
)

if exist "electron\main.js" (
    echo ✅ Electron: 已配置
) else (
    echo ⚠️ Electron: 未配置
)

if exist "config\" (
    echo ✅ 配置框架: 已部署
) else (
    echo ❌ 配置框架: 未部署
)

echo.
echo ═══════════════════════════════════════════════════════════
echo                      📊 文件大小
echo ═══════════════════════════════════════════════════════════

if exist "node_modules\" (
    for /f "tokens=3" %%i in ('dir /s "node_modules" 2^>nul ^| find "个文件"') do (
        echo 📦 node_modules: %%i 字节
    )
)

if exist "dist\" (
    for /f "tokens=3" %%i in ('dir /s "dist" 2^>nul ^| find "个文件"') do (
        echo 🔨 dist: %%i 字节
    )
)

if exist "release\" (
    for /f "tokens=3" %%i in ('dir /s "release" 2^>nul ^| find "个文件"') do (
        echo 📦 release: %%i 字节
    )
)

echo.
pause
goto :main_menu

:update_deps
cls
echo.
echo 🔄 更新项目依赖...
echo.

if not exist "package.json" (
    echo ❌ 错误：未找到package.json文件！
    pause
    goto :main_menu
)

echo 📋 当前依赖版本：
npm list --depth=0

echo.
choice /c YN /m "是否要更新所有依赖到最新版本？"

if errorlevel 2 goto :main_menu
if errorlevel 1 (
    echo.
    echo 🔄 更新依赖中...
    npm update
    
    if errorlevel 1 (
        echo ❌ 更新失败！
    ) else (
        echo ✅ 更新完成！
        echo.
        echo 📋 更新后版本：
        npm list --depth=0
    )
    
    echo.
    pause
)
goto :main_menu

:help
cls
echo.
echo ❓ 帮助文档
echo.
echo ═══════════════════════════════════════════════════════════
echo                    🎮 游戏操作指南
echo ═══════════════════════════════════════════════════════════
echo.
echo 🎯 首次使用流程：
echo  1. 双击"游戏管理工具.bat"
echo  2. 选择"2"设置Electron桌面版
echo  3. 选择"1"启动游戏测试
echo  4. 选择"3"打包exe文件
echo.
echo 🔧 常见问题解决：
echo  - 启动失败 → 检查Node.js是否安装
echo  - 打包失败 → 先运行"设置Electron"
echo  - 游戏卡顿 → 关闭其他程序，释放内存
echo  - 保存失效 → 检查文件夹写入权限
echo.
echo ⌨️ 游戏内快捷键：
echo  - F11: 全屏切换
echo  - F5: 快速保存
echo  - F9: 快速加载
echo  - Esc: 暂停菜单
echo  - Ctrl+S: 保存游戏
echo  - Ctrl+O: 加载游戏
echo.
echo 📁 重要文件说明：
echo  - config\: 游戏配置文件
echo  - src\: 游戏源代码
echo  - electron\: 桌面应用配置
echo  - release\: exe输出目录
echo.
echo 🔗 技术文档：
echo  - 架构指南: 像素风ARPG框架使用指南.md
echo  - 打包文档: 桌面应用打包方案.md
echo  - 实施报告: 🎯 像素风ARPG框架实施完成报告.md
echo.
echo ═══════════════════════════════════════════════════════════

echo.
choice /c YN /m "是否打开技术文档文件夹？"

if errorlevel 2 goto :main_menu
if errorlevel 1 (
    echo 📂 打开文档文件夹...
    start "" "."
)

goto :main_menu

:exit
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo                  🎮 像素风流放之路
echo ═══════════════════════════════════════════════════════════
echo.
echo            感谢使用游戏管理工具！
echo.
echo         祝您的游戏开发之路一帆风顺！ 🚀
echo.
echo ═══════════════════════════════════════════════════════════
echo.

timeout /t 3 /nobreak >nul
exit 