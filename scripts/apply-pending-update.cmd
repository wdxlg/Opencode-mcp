@echo off
rem OpenCode p36: helper used by the launchers. Applies a deferred update staged in ..\opencode.next
rem (marker ..\.pending-update.json) to this recovery tree's opencode\ folder. Never touches E:\opencode.
rem Always exits 0 so the launcher still starts OpenCode (the old version if applying failed).
setlocal
set "OC_ROOT=%~dp0.."
if not exist "%OC_ROOT%\.pending-update.json" exit /b 0
set "OC_NODE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined OC_NODE set "OC_NODE=%%N"
if not defined OC_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "OC_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined OC_NODE (
  echo [OpenCode] A staged update is waiting in "%OC_ROOT%\opencode.next" but node.exe was not found; starting the current version.
  exit /b 0
)
set "ELECTRON_RUN_AS_NODE="
"%OC_NODE%" "%~dp0apply-pending-update.cjs"
endlocal
exit /b 0
