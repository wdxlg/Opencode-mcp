// Single runtime target: source-root/opencode. Overwrite build-owned paths directly, with rollback.
// Preserve data and unrelated files; never target the formal installation or kill running processes.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
// OpenCode p36: 延迟发布。本工程 opencode\ 下有进程在跑（只看路径在 <源码>\opencode\ 下的进程，E:\opencode 安装版运行不算）时，
// 不再报错退出，而是把构建移到 <源码>\opencode.next 并写 .pending-update.json；启动器（Start-OpenCode.cmd / Start-Isolated.cmd）
// 启动前调用 scripts/apply-pending-update.cjs，后者以 --from-pending 再跑本脚本，走同样的备份/日志/回滚流程。
// --no-defer：保持旧行为（有进程就失败）。没有进程在跑时行为不变；正常发布成功后会清掉过期的 opencode.next。
const fromPending=process.argv.includes('--from-pending'),noDefer=process.argv.includes('--no-defer');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'opencode'),pendingDir=path.join(root,'opencode.next'),pendingMarker=path.join(root,'.pending-update.json');
const source=fromPending?pendingDir:path.join(root,'generated/source-build');
if(process.platform==='win32'&&path.resolve(dest).toLowerCase()==='e:\\opencode')throw Error('Refusing to publish into the formal installation E:\\opencode');
const pending=fromPending?JSON.parse(fs.readFileSync(pendingMarker,'utf8')):null;
if(fromPending&&(!fs.existsSync(pendingDir)||path.resolve(pending.destination||'')!==path.resolve(dest)||!pending.verification?.success))throw Error('Pending update marker does not match '+pendingDir+' / '+dest+'; not applied');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const verification=fromPending?pending.verification:JSON.parse(fs.readFileSync(root+'/reports/build-verification.json'));if(!verification.success)throw Error('Build verification required');
const lock=root+'/.update-lock';try{fs.mkdirSync(lock);}catch{throw Error('An update lock exists. Inspect its journal and owner before retrying; never run two publishers.');}
fs.writeFileSync(lock+'/owner.json',JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));
const id=Date.now()+'-'+crypto.randomBytes(4).toString('hex'),stage=root+'/.update-stage/'+id,backup=root+'/.update-backup/'+id,journal=root+'/reports/update-journal-'+id+'.jsonl';
const ops=[];let committed=false;const startedAt=Date.now();let hashedFiles=0;const strict=process.argv.includes('--verify-all');
function safe(base,rel){const p=path.resolve(base,rel),parts=rel.split(/[\\/]/).map(x=>process.platform==='win32'?x.toLowerCase():x);if(!p.startsWith(path.resolve(base)+path.sep)||parts[0]==='data'||parts.some(x=>['.recovery-profile','.git'].includes(x)))throw Error('Unsafe managed runtime path '+rel);return p;}
function walk(dir,base=dir,result=[]){for(const n of fs.readdirSync(dir)){const p=path.join(dir,n),st=fs.lstatSync(p);if(st.isSymbolicLink())throw Error('Links are not publishable');if(st.isDirectory()){const key=process.platform==='win32'?n.toLowerCase():n;if(!['.recovery-profile','.git'].includes(key)&&!(dir===base&&key==='data'))walk(p,base,result);}else if(st.isFile())result.push(path.relative(base,p).replace(/\\/g,'/'));}return result;}
function gitHead(){return cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}
function gitDirty(){return !!cp.execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim();}
// OpenCode p36: 把 generated/source-build 移成 opencode.next（同盘重命名，失败再复制），最后原子写入 .pending-update.json
function deferPublish(active,changedCount,removedCount){
 const tmp=pendingDir+'.tmp-'+id;fs.rmSync(tmp,{recursive:true,force:true});
 try{fs.renameSync(source,tmp);}catch(e){fs.rmSync(tmp,{recursive:true,force:true});fs.cpSync(source,tmp,{recursive:true,preserveTimestamps:true});}
 let procs=active;try{procs=JSON.parse(active);}catch{}
 const meta={id,createdAt:new Date().toISOString(),destination:dest,stagedAt:pendingDir,version:JSON.parse(fs.readFileSync(root+'/package.json')).version,sourceCommit:gitHead(),sourceDirty:gitDirty(),verification:{success:true,at:verification.at||verification.generatedAt||null},changedFiles:changedCount,removedFiles:removedCount,runningProcesses:procs,apply:'Start-OpenCode.cmd / opencode\\Start-Isolated.cmd, or: node scripts/apply-pending-update.cjs (OpenCode must be closed)'};
 fs.rmSync(pendingMarker,{force:true});fs.rmSync(pendingDir,{recursive:true,force:true});fs.renameSync(tmp,pendingDir);
 fs.writeFileSync(pendingMarker+'.tmp',JSON.stringify(meta,null,2));fs.renameSync(pendingMarker+'.tmp',pendingMarker);
 const report={success:true,deferred:true,pendingId:id,stagedAt:pendingDir,destination:dest,changedFiles:changedCount,removedFiles:removedCount,runningProcesses:procs,elapsedMs:Date.now()-startedAt,at:meta.createdAt};
 fs.writeFileSync(root+'/reports/runtime-update.json',JSON.stringify(report,null,2));
 console.log('RUNTIME_UPDATE_DEFERRED '+JSON.stringify(report));
 console.log('[publish] OpenCode in '+dest+' is running, so nothing there was changed. The build is staged in '+pendingDir+' and will be applied the next time you start it with Start-OpenCode.cmd or opencode\\Start-Isolated.cmd (or run: node scripts/apply-pending-update.cjs after closing OpenCode).');
}
function persist(status){fs.appendFileSync(journal,JSON.stringify({status,id,destination:dest,operation:ops.at(-1),operationCount:ops.length})+'\n');}
try{
 if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw Error('Runtime root cannot be a link');
 if(fs.existsSync(dest)){walk(dest);}
 if(fs.existsSync(dest)&&!fs.existsSync(dest+'/OPENCODE-RELEASE.json'))throw Error('Existing opencode folder has no managed release marker; refusing overwrite');
 let active='';
 if(process.platform==='win32'){
  const escaped=dest.replace(/'/g,"''");const ps=`@(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith('${escaped}\\',[System.StringComparison]::OrdinalIgnoreCase) } | Select-Object ProcessId,Name) | ConvertTo-Json -Compress`;
  active=cp.execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8'}).trim();
 }
 // OpenCode p36: 测试夹具专用的「模拟运行中」开关（只在 .publisher-test 存在时生效）
 if(fs.existsSync(root+'/.publisher-test')&&process.env.OPENCODE_TEST_SIMULATE_RUNNING==='1')active='[{"ProcessId":0,"Name":"simulated"}]';
 let running=!!active&&active!=='[]';
 // autoclose-step01: 打包时自动关闭 <源码>/opencode 下运行的一切进程（只按可执行文件路径匹配，不碰其他位置的进程），
 // 然后直接发布到 opencode，不再暂存到 opencode.next。设 OPENCODE_NO_AUTOCLOSE=1 恢复旧的延迟发布行为。
 if(running&&process.platform==='win32'&&process.env.OPENCODE_NO_AUTOCLOSE!=='1'&&!(fs.existsSync(root+'/.publisher-test')&&process.env.OPENCODE_TEST_SIMULATE_RUNNING==='1')){
  const escaped=dest.replace(/'/g,"''");
  const kill=`$ErrorActionPreference='SilentlyContinue';$m={param($x) $x.ExecutablePath -and $x.ExecutablePath.StartsWith('${escaped}\\',[System.StringComparison]::OrdinalIgnoreCase)};$deadline=(Get-Date).AddSeconds(30);do{$ps=@(Get-CimInstance Win32_Process | Where-Object { & $m $_ });foreach($x in $ps){Stop-Process -Id $x.ProcessId -Force};if($ps.Count){Start-Sleep -Milliseconds 700}}while($ps.Count -and (Get-Date) -lt $deadline);@(Get-CimInstance Win32_Process | Where-Object { & $m $_ } | Select-Object ProcessId,Name) | ConvertTo-Json -Compress`;
  let count=0;try{count=JSON.parse(active).length||1;}catch{count=1;}
  console.log('[publish] closing '+count+' running process(es) under '+dest+' ...');
  active=cp.execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',kill],{encoding:'utf8'}).trim();
  running=!!active&&active!=='[]';
  if(running)throw Error('Could not close every process under '+dest+' within 30s: '+active+'. Nothing was published.');
  console.log('[publish] all processes under '+dest+' closed; publishing directly.');
 }
 if(running&&(fromPending||noDefer))throw Error('Close the running opencode application and its owned services before updating. No processes were stopped.');
 const previous=fs.existsSync(dest+'/OPENCODE-RELEASE.json')?JSON.parse(fs.readFileSync(dest+'/OPENCODE-RELEASE.json')):{files:[]};
 const prior=new Map((previous.files||[]).map(f=>[f.path,f]));
 const files=walk(source).map(rel=>{const p=safe(source,rel),st=fs.statSync(p),old=prior.get(rel);const cached=!strict&&old&&old.bytes===st.size&&old.sourceMtimeMs===st.mtimeMs;return {path:rel,sha256:cached?old.sha256:(hashedFiles++,hash(p)),bytes:st.size,sourceMtimeMs:st.mtimeMs};});
  // Root portable data stays user-owned; nested dependency data is a managed asset.
  const includedDefaults=new Set(files.map(f=>f.path));
  // OpenCode p36: 延迟发布在构建时已校验过默认资产，应用时源码可能已变，不再按当前清单重查
  if(!fromPending)for(const item of JSON.parse(fs.readFileSync(root+'/defaults/manifest.json','utf8')).files)if(!includedDefaults.has('resources/app/extensions/opencode/defaults/'+item.path))throw Error('Declared default asset excluded from publication: '+item.path);
 // New managed names must never take ownership of pre-existing user files,
 // even when the bytes happen to match. Validate before staging or renaming.
 for(const f of files){const p=safe(dest,f.path);if(fs.existsSync(p)&&!prior.has(f.path))throw Error('New managed runtime path conflicts with a user file: '+f.path);}
 const names=new Set(files.map(f=>f.path));const changed=files.filter(f=>{const p=safe(dest,f.path);if(!fs.existsSync(p))return true;const st=fs.statSync(p),old=prior.get(f.path);if(!strict&&old&&old.sha256===f.sha256&&old.bytes===st.size&&old.targetMtimeMs===st.mtimeMs)return false;hashedFiles++;return hash(p)!==f.sha256;});
 const removed=(previous.files||[]).filter(f=>!names.has(f.path)&&fs.existsSync(safe(dest,f.path)));
 // Retained managed files may also have user changes; never overwrite those.
 for(const f of changed){const p=safe(dest,f.path),old=prior.get(f.path);if(fs.existsSync(p)&&old){const current=hash(p);hashedFiles++;if(current!==old.sha256&&current!==f.sha256)throw Error('Managed runtime file was customized; refusing overwrite: '+f.path);}}
 for(const f of removed)if(hash(safe(dest,f.path))!==f.sha256)throw Error('Obsolete runtime file was customized; move it out before updating: '+f.path);
 // OpenCode p36: 运行中 → 校验已通过，把构建暂存到 opencode.next 并写待应用标记，不动 opencode\
 if(running){if(!changed.length&&!removed.length){try{fs.rmSync(pendingMarker,{force:true});fs.rmSync(pendingDir,{recursive:true,force:true});}catch{}const report={success:true,deferred:false,upToDate:true,destination:dest,changedFiles:0,removedFiles:0,elapsedMs:Date.now()-startedAt,at:new Date().toISOString()};fs.writeFileSync(root+'/reports/runtime-update.json',JSON.stringify(report,null,2));console.log('RUNTIME_UPDATE '+JSON.stringify(report));console.log('[publish] OpenCode is running but its files already match this build; nothing staged.');return;}deferPublish(active,changed.length,removed.length);return;}
 fs.mkdirSync(stage,{recursive:true});fs.mkdirSync(backup,{recursive:true});
 for(const f of changed){const p=safe(stage,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.copyFileSync(safe(source,f.path),p);if(hash(p)!==f.sha256)throw Error('Staging hash mismatch');}
 const git=fromPending?pending.sourceCommit:gitHead();
 for(const f of files){const staged=safe(stage,f.path);f.targetMtimeMs=fs.statSync(fs.existsSync(staged)?staged:safe(dest,f.path)).mtimeMs;}
 const release={version:fromPending?pending.version:JSON.parse(fs.readFileSync(root+'/package.json')).version,sourceCommit:git,sourceDirty:fromPending?!!pending.sourceDirty:gitDirty(),files,verification:{generationOnly:true,functionalTestsRun:false},updatedAt:new Date().toISOString()};
 fs.writeFileSync(stage+'/OPENCODE-RELEASE.json',JSON.stringify(release,null,2));
 for(const rel of [...changed.map(f=>f.path),...removed.map(f=>f.path),'OPENCODE-RELEASE.json']){
  const target=safe(dest,rel),old=safe(backup,rel),next=safe(stage,rel);const op={path:rel,hadOld:fs.existsSync(target),backedUp:false,installed:false};ops.push(op);persist('applying');
  fs.mkdirSync(path.dirname(target),{recursive:true});if(op.hadOld){fs.mkdirSync(path.dirname(old),{recursive:true});fs.renameSync(target,old);op.backedUp=true;persist('applying');}
  if(fs.existsSync(next)){fs.renameSync(next,target);op.installed=true;persist('applying');}
  if(fs.existsSync(root+'/.publisher-test')&&Number(process.env.OPENCODE_TEST_UPDATE_FAIL_AFTER)===ops.length)throw Error('Injected test-only update failure');
 }
 fs.mkdirSync(dest+'/data',{recursive:true});committed=true;persist('completed');
 // OpenCode p36: 已发布（无论来自 opencode.next 还是新构建），旧的待应用更新作废：先删标记再删目录
 const supersededPending=!fromPending&&fs.existsSync(pendingMarker);try{fs.rmSync(pendingMarker,{force:true});fs.rmSync(pendingDir,{recursive:true,force:true});}catch(x){console.warn('[publish] could not remove '+pendingDir+': '+x.message);}
 const report={success:true,elapsedMs:Date.now()-startedAt,hashedFiles,hashingMode:strict?'full-sha256':'sha256-with-size-mtime-cache',destination:dest,changedFiles:changed.length,unchangedFiles:files.length-changed.length,removedFiles:removed.length,userDataPreserved:true,backup,sourceCommit:git,sourceDirty:release.sourceDirty,appliedPending:fromPending?pending.id:undefined,supersededPending:supersededPending||undefined,at:new Date().toISOString()};fs.writeFileSync(root+'/reports/runtime-update.json',JSON.stringify(report,null,2));console.log('RUNTIME_UPDATE '+JSON.stringify(report));
}catch(e){
 const errors=[];for(const op of [...ops].reverse()){try{const target=safe(dest,op.path),old=safe(backup,op.path);if(op.installed&&fs.existsSync(target))fs.unlinkSync(target);if(op.backedUp&&fs.existsSync(old))fs.renameSync(old,target);}catch(x){errors.push(String(x));}}
 persist(errors.length?'rollback-needs-attention':'rolled-back');if(errors.length)throw Error(String(e)+'; rollback errors: '+errors.join('; '));throw e;
}finally{if(committed||ops.every(op=>!op.backedUp||!fs.existsSync(safe(backup,op.path)))){fs.rmSync(lock,{recursive:true,force:true});}if(fs.existsSync(stage)&&committed)fs.rmSync(stage,{recursive:true,force:true});}
