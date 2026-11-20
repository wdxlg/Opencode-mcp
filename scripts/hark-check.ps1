"src procs: " + @(Get-Process OpenCode -EA 0 | ?{ $_.Path -like 'E:\OpenCode-Source-Recovery-20261013\opencode*' }).Count
"watcher: " + @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | ?{ $_.CommandLine -like '*hark-wait-pack*' }).Count
