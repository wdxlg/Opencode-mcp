@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title OpenCode Build and Update
pushd "%~dp0"
if errorlevel 1 goto workdir_error

echo ============================================================
echo OpenCode - 编译并更新本源码目录下的 opencode 文件夹
echo ============================================================
echo 请先保存工作，退出本目录 opencode 下正在运行的程序及其服务。
echo 本入口不会强杀进程、启动软件、运行测试或自动安装依赖。
echo 不生成 ZIP，不清理用户数据，不写入其他 OpenCode 安装目录。
echo.

where node >nul 2>&1
if errorlevel 1 goto missing_node
node -e "if (Number(process.versions.node.split('.')[0]) < 22) { console.error('Node.js 22 or newer is required.'); process.exit(1); }"
if errorlevel 1 goto missing_node
if not exist "scripts\update.cjs" goto missing_script
if not exist "toolchain\node_modules\esbuild\package.json" goto missing_compiler

node "scripts\update.cjs"
set "BUILD_EXIT=%ERRORLEVEL%"
if not "%BUILD_EXIT%"=="0" goto build_failed

echo.
echo [成功] 编译、完整性校验和运行目录更新已完成。
echo 输出目录："%CD%\opencode"
echo 请手动启动该目录中的 OpenCode；旧进程不会自动加载更新。
goto finish

:build_failed
echo.
echo [未完成] 构建或发布失败，退出码：%BUILD_EXIT%
echo 请查看上方错误。若提示程序正在运行，请退出后再双击本文件。
echo 若提示存在构建锁或文件冲突，请保留现场，不要直接删除锁或强制覆盖。
goto finish

:missing_node
set "BUILD_EXIT=1"
echo [缺少依赖] 请先准备 Node.js 22 或更高版本，并确保 node 位于 PATH。
echo 本入口没有安装或升级任何依赖。
goto finish

:missing_compiler
set "BUILD_EXIT=1"
echo [缺少依赖] toolchain\node_modules\esbuild 不存在。
echo 请先恢复本工程已有工具链；本入口不会联网安装。
goto finish

:missing_script
set "BUILD_EXIT=1"
echo [文件缺失] scripts\update.cjs 不存在，请恢复内部构建脚本。
goto finish

:finish
popd
echo.
pause
endlocal & exit /b %BUILD_EXIT%

:workdir_error
echo [无法进入源码目录] 请确认本文件位于 OpenCode 源码根目录且该目录可访问。
pause
endlocal & exit /b 1
