$root='E:\OpenCode-Source-Recovery-20261013'
Set-Location $root
"waiting $(Get-Date)" | Out-File "$root\hark_pack_1940.log" -Encoding utf8
while (@(Get-Process OpenCode -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$root\opencode\*" -or $_.Path -like "$root\opencode.next\*" }).Count -gt 0) { Start-Sleep -Seconds 3 }
"building $(Get-Date)" | Out-File "$root\hark_pack_1940.log" -Append -Encoding utf8
& node scripts\update.cjs *>> "$root\hark_pack_1940.log"
$LASTEXITCODE | Out-File "$root\hark_pack_1940.exit" -Encoding ascii
if (Test-Path "$root\opencode.next") { if (-not (Test-Path "$root\.pending-update.json")) { Remove-Item -Recurse -Force "$root\opencode.next" } }
"done $(Get-Date)" | Out-File "$root\hark_pack_1940.log" -Append -Encoding utf8
