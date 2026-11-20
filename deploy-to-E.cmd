@echo off
chcp 65001 >nul
echo 等待 E:\opencode 的 OpenCode 全部退出...
:wait
powershell -NoProfile -Command "if (@(Get-CimInstance Win32_Process | ? { $_.ExecutablePath -like 'E:\opencode\*' }).Count) { exit 1 } else { exit 0 }"
if errorlevel 1 ( timeout /t 2 /nobreak >nul & goto wait )
echo 复制新版本到 E:\opencode（保留 data）...
robocopy "%~dp0opencode" "E:\opencode" /E /XD "%~dp0opencode\data" /R:2 /W:2 /NFL /NDL /NP
if %errorlevel% GEQ 8 ( echo 复制失败，错误码 %errorlevel% & pause & exit /b 1 )
echo 完成，正在启动...
start "" "E:\opencode\OpenCode.exe"
