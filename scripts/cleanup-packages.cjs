// One-time user-authorized removal of this source tree's obsolete packages directory.
// Never follows a linked root and never stops a process.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),target=path.join(root,'packages');
if(path.dirname(target)!==root||path.basename(target)!=='packages')throw Error('Unexpected cleanup target');
if(fs.existsSync(target)){
 if(fs.lstatSync(target).isSymbolicLink()||fs.realpathSync(target).toLowerCase()!==target.toLowerCase())throw Error('Refusing linked packages directory');
 if(process.platform==='win32'){
  const prefix=(target+path.sep).replace(/'/g,"''");
  const script="$ErrorActionPreference='Stop'; @(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith('"+prefix+"',[StringComparison]::OrdinalIgnoreCase) } | Select-Object ProcessId,Name) | ConvertTo-Json -Compress";
  const active=cp.execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{encoding:'utf8'}).trim();
  if(active&&active!=='[]')throw Error('A packages runtime is active; no process was stopped and nothing was deleted');
 }
 fs.rmSync(target,{recursive:true,force:true,maxRetries:3,retryDelay:200});
}
if(fs.existsSync(target))throw Error('packages still exists');
const receipt={success:true,path:target,exists:false,userAuthorized:true,at:new Date().toISOString()};
fs.writeFileSync(path.join(root,'reports','packages-cleanup.json'),JSON.stringify(receipt,null,2),'utf8');
console.log('PACKAGES_REMOVED '+JSON.stringify(receipt));
