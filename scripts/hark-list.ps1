Get-CimInstance Win32_Process -Filter "Name='OpenCode.exe'" | ?{ $_.ExecutablePath -like '*Recovery*' } | %{
 $c=$_.CommandLine; $t=if($c -match '--type=(\S+)'){$matches[1]}else{'MAIN'}
 $u=if($c -match '--user-data-dir=("[^"]+"|\S+)'){$matches[1]}else{''}
 "{0} parent={1} type={2} start={3} ud={4}" -f $_.ProcessId,$_.ParentProcessId,$t,$_.CreationDate.ToString('HH:mm'),$u }
"--- windows:"; Get-Process OpenCode | ?{ $_.MainWindowTitle } | %{ "{0} {1} [{2}]" -f $_.Id,$_.Path,$_.MainWindowTitle }
