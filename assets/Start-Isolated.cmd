@echo off
setlocal
set "ELECTRON_RUN_AS_NODE="
set "VSCODE_IPC_HOOK_CLI="
rem Ordinary profile is local; rules/collaboration remain in the original user's shared store.
rem Capture before redirecting LOCALAPPDATA. An explicit stable shared-store override is preserved.
if not defined OPENCODE_SHARED_LOCALAPPDATA set "OPENCODE_SHARED_LOCALAPPDATA=%LOCALAPPDATA%"
if not defined OPENCODE_SHARED_LOCALAPPDATA exit /b 1
if not defined OPENCODE_AUTOMATION_HOME set "OPENCODE_AUTOMATION_HOME=%OPENCODE_SHARED_LOCALAPPDATA%\OpenCode\shared-automation"
set "VSCODE_PORTABLE=%~dp0.recovery-profile"
set "USERPROFILE=%VSCODE_PORTABLE%\home"
set "HOME=%USERPROFILE%"
set "APPDATA=%VSCODE_PORTABLE%\roaming"
set "LOCALAPPDATA=%VSCODE_PORTABLE%\local"
rem Existing .recovery-profile\automation is preserved; it is not silently merged or deleted.
for %%D in ("%USERPROFILE%" "%APPDATA%" "%LOCALAPPDATA%" "%VSCODE_PORTABLE%\user-data\User" "%VSCODE_PORTABLE%\extensions") do if not exist "%%~D" mkdir "%%~D"
if not exist "%VSCODE_PORTABLE%\user-data\User\settings.json" echo {"telemetry.telemetryLevel":"off","update.mode":"none","extensions.autoUpdate":false,"extensions.autoCheckUpdates":false,"opencode.bridge.persistentMode":false}>"%VSCODE_PORTABLE%\user-data\User\settings.json"
start "" "%~dp0OpenCode.exe" --new-window --user-data-dir "%VSCODE_PORTABLE%\user-data" --extensions-dir "%VSCODE_PORTABLE%\extensions"
endlocal
