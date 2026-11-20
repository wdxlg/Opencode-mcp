@echo off
rem OpenCode p36: launcher for this recovery tree. Applies a deferred update (opencode.next) first, then starts
rem opencode\OpenCode.exe from this folder. It never touches the formal installation E:\opencode.
setlocal
if exist "%~dp0.pending-update.json" if exist "%~dp0scripts\apply-pending-update.cmd" call "%~dp0scripts\apply-pending-update.cmd"
set "ELECTRON_RUN_AS_NODE="
set "VSCODE_IPC_HOOK_CLI="
start "" "%~dp0opencode\OpenCode.exe" %*
endlocal
