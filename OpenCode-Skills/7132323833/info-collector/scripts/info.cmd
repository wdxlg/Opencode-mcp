@echo off
setlocal
set PYTHONDONTWRITEBYTECODE=1
if exist "E:\video-publisher\.venv\Scripts\python.exe" (
    set "PY=E:\video-publisher\.venv\Scripts\python.exe"
) else if exist "%~dp0..\..\..\video-publisher\.venv\Scripts\python.exe" (
    set "PY=%~dp0..\..\..\video-publisher\.venv\Scripts\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PY=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
) else (
    set "PY=python"
)
"%PY%" "%~dp0info_cli.py" %*
