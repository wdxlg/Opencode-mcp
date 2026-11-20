$p = Get-Process OpenCode -EA 0 | ?{ $_.Path -like 'E:\OpenCode-Source-Recovery-20261013\opencode\*' -or $_.Path -like 'E:\OpenCode-Source-Recovery-20261013\opencode.next\*' }
"before: " + @($p).Count + " ids: " + (($p | % Id) -join ',')
$p | Stop-Process -Force -EA Continue
Start-Sleep 3
"after: " + @(Get-Process OpenCode -EA 0 | ?{ $_.Path -like 'E:\OpenCode-Source-Recovery-20261013\opencode*' }).Count
