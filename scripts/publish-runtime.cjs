// Single runtime target: source-root/opencode. Overwrite build-owned paths directly, with rollback.
// Preserve data and unrelated files; never target the formal installation or kill running processes.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),source=path.join(root,'generated/source-build'),dest=path.join(root,'opencode');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const verification=JSON.parse(fs.readFileSync(root+'/reports/build-verification.json'));if(!verification.success)throw Error('Build verification required');
const lock=root+'/.update-lock';try{fs.mkdirSync(lock);}catch{throw Error('An update lock exists. Inspect its journal and owner before retrying; never run two publishers.');}
fs.writeFileSync(lock+'/owner.json',JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));
const id=Date.now()+'-'+crypto.randomBytes(4).toString('hex'),stage=root+'/.update-stage/'+id,backup=root+'/.update-backup/'+id,journal=root+'/reports/update-journal-'+id+'.jsonl';
const ops=[];let committed=false;const startedAt=Date.now();let hashedFiles=0;const strict=process.argv.includes('--verify-all');
function safe(base,rel){const p=path.resolve(base,rel);if(!p.startsWith(path.resolve(base)+path.sep)||rel.split(/[\\/]/).some(x=>['data','.recovery-profile','.git'].includes(process.platform==='win32'?x.toLowerCase():x)))throw Error('Unsafe managed runtime path '+rel);return p;}
function walk(dir,base=dir,result=[]){for(const n of fs.readdirSync(dir)){const p=path.join(dir,n),st=fs.lstatSync(p);if(st.isSymbolicLink())throw Error('Links are not publishable');if(st.isDirectory()){if(!['data','.recovery-profile'].includes(process.platform==='win32'?n.toLowerCase():n))walk(p,base,result);}else if(st.isFile())result.push(path.relative(base,p).replace(/\\/g,'/'));}return result;}
function persist(status){fs.appendFileSync(journal,JSON.stringify({status,id,destination:dest,operation:ops.at(-1),operationCount:ops.length})+'\n');}
try{
 if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw Error('Runtime root cannot be a link');
 if(fs.existsSync(dest)){walk(dest);}
 if(fs.existsSync(dest)&&!fs.existsSync(dest+'/OPENCODE-RELEASE.json'))throw Error('Existing opencode folder has no managed release marker; refusing overwrite');
 if(process.platform==='win32'){
  const escaped=dest.replace(/'/g,"''");const ps=`@(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith('${escaped}\\',[System.StringComparison]::OrdinalIgnoreCase) } | Select-Object ProcessId,Name) | ConvertTo-Json -Compress`;
  const active=cp.execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8'}).trim();if(active&&active!=='[]')throw Error('Close the running opencode application and its owned services before updating. No processes were stopped.');
 }
 const previous=fs.existsSync(dest+'/OPENCODE-RELEASE.json')?JSON.parse(fs.readFileSync(dest+'/OPENCODE-RELEASE.json')):{files:[]};
 const prior=new Map((previous.files||[]).map(f=>[f.path,f]));
 const files=walk(source).map(rel=>{const p=safe(source,rel),st=fs.statSync(p),old=prior.get(rel);const cached=!strict&&old&&old.bytes===st.size&&old.sourceMtimeMs===st.mtimeMs;return {path:rel,sha256:cached?old.sha256:(hashedFiles++,hash(p)),bytes:st.size,sourceMtimeMs:st.mtimeMs};});
 // New managed names must never take ownership of pre-existing user files,
 // even when the bytes happen to match. Validate before staging or renaming.
 for(const f of files){const p=safe(dest,f.path);if(fs.existsSync(p)&&!prior.has(f.path))throw Error('New managed runtime path conflicts with a user file: '+f.path);}
 const names=new Set(files.map(f=>f.path));const changed=files.filter(f=>{const p=safe(dest,f.path);if(!fs.existsSync(p))return true;const st=fs.statSync(p),old=prior.get(f.path);if(!strict&&old&&old.sha256===f.sha256&&old.bytes===st.size&&old.targetMtimeMs===st.mtimeMs)return false;hashedFiles++;return hash(p)!==f.sha256;});
 const removed=(previous.files||[]).filter(f=>!names.has(f.path)&&fs.existsSync(safe(dest,f.path)));
 for(const f of removed)if(hash(safe(dest,f.path))!==f.sha256)throw Error('Obsolete runtime file was customized; move it out before updating: '+f.path);
 fs.mkdirSync(stage,{recursive:true});fs.mkdirSync(backup,{recursive:true});
 for(const f of changed){const p=safe(stage,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.copyFileSync(safe(source,f.path),p);if(hash(p)!==f.sha256)throw Error('Staging hash mismatch');}
 const git=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 for(const f of files){const staged=safe(stage,f.path);f.targetMtimeMs=fs.statSync(fs.existsSync(staged)?staged:safe(dest,f.path)).mtimeMs;}
 const release={version:JSON.parse(fs.readFileSync(root+'/package.json')).version,sourceCommit:git,sourceDirty:!!cp.execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim(),files,verification:{generationOnly:true,functionalTestsRun:false},updatedAt:new Date().toISOString()};
 fs.writeFileSync(stage+'/OPENCODE-RELEASE.json',JSON.stringify(release,null,2));
 for(const rel of [...changed.map(f=>f.path),...removed.map(f=>f.path),'OPENCODE-RELEASE.json']){
  const target=safe(dest,rel),old=safe(backup,rel),next=safe(stage,rel);const op={path:rel,hadOld:fs.existsSync(target),backedUp:false,installed:false};ops.push(op);persist('applying');
  fs.mkdirSync(path.dirname(target),{recursive:true});if(op.hadOld){fs.mkdirSync(path.dirname(old),{recursive:true});fs.renameSync(target,old);op.backedUp=true;persist('applying');}
  if(fs.existsSync(next)){fs.renameSync(next,target);op.installed=true;persist('applying');}
  if(fs.existsSync(root+'/.publisher-test')&&Number(process.env.OPENCODE_TEST_UPDATE_FAIL_AFTER)===ops.length)throw Error('Injected test-only update failure');
 }
 fs.mkdirSync(dest+'/data',{recursive:true});committed=true;persist('completed');
 const report={success:true,elapsedMs:Date.now()-startedAt,hashedFiles,hashingMode:strict?'full-sha256':'sha256-with-size-mtime-cache',destination:dest,changedFiles:changed.length,unchangedFiles:files.length-changed.length,removedFiles:removed.length,userDataPreserved:true,backup,sourceCommit:git,sourceDirty:release.sourceDirty,at:new Date().toISOString()};fs.writeFileSync(root+'/reports/runtime-update.json',JSON.stringify(report,null,2));console.log('RUNTIME_UPDATE '+JSON.stringify(report));
}catch(e){
 const errors=[];for(const op of [...ops].reverse()){try{const target=safe(dest,op.path),old=safe(backup,op.path);if(op.installed&&fs.existsSync(target))fs.unlinkSync(target);if(op.backedUp&&fs.existsSync(old))fs.renameSync(old,target);}catch(x){errors.push(String(x));}}
 persist(errors.length?'rollback-needs-attention':'rolled-back');if(errors.length)throw Error(String(e)+'; rollback errors: '+errors.join('; '));throw e;
}finally{if(committed||ops.every(op=>!op.backedUp||!fs.existsSync(safe(backup,op.path)))){fs.rmSync(lock,{recursive:true,force:true});}if(fs.existsSync(stage)&&committed)fs.rmSync(stage,{recursive:true,force:true});}
