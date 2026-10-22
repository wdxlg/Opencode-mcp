const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),assert=require('assert');
const source=path.resolve(__dirname,'..'),id=Date.now()+'-'+require('crypto').randomBytes(3).toString('hex'),root=path.join(path.dirname(source),'OpenCode-Portable-Validation-'+id);
assert(!fs.existsSync(root));fs.mkdirSync(root+'/reports',{recursive:true});fs.writeFileSync(root+'/.owned-portability-test',id);fs.writeFileSync(root+'/reports/bundle-manifest.json','{}');
fs.writeFileSync(source+'/reports/portable-relocation-running.json',JSON.stringify({root,id}));
const first=root+'/首次 中文目录/便携 OpenCode';fs.mkdirSync(path.dirname(first),{recursive:true});
// Explicit opt-in test fixture, copied only from the single published runtime.
const runtime=source+'/opencode',receipt=JSON.parse(fs.readFileSync(runtime+'/OPENCODE-RELEASE.json','utf8'));
fs.mkdirSync(first,{recursive:true});
for(const entry of receipt.files){
 const from=path.resolve(runtime,entry.path),to=path.resolve(first,entry.path);
 assert(from.startsWith(path.resolve(runtime)+path.sep)&&to.startsWith(path.resolve(first)+path.sep));
 assert(!entry.path.split(/[\\/]/).some(part=>['data','.recovery-profile'].includes(part)));
 assert(fs.lstatSync(from).isFile()&&!fs.lstatSync(from).isSymbolicLink());
 assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync(from)).digest('hex'),entry.sha256);
 fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);
}
fs.copyFileSync(runtime+'/OPENCODE-RELEASE.json',first+'/OPENCODE-RELEASE.json');
fs.mkdirSync(first+'/data');
fs.copyFileSync(source+'/scripts/test-portable-gui.cjs',root+'/gui-relocation.cjs');
function test(app,phase){const runId=phase+'-'+id;const p=cp.spawnSync(process.execPath,[root+'/gui-relocation.cjs'],{cwd:root,env:{...process.env,OPENCODE_RECOVERY_ROOT:root,OPENCODE_RELOCATION_APP:app,OPENCODE_RELOC_PHASE:phase,OPENCODE_VALIDATION_RUN:runId},encoding:'utf8',timeout:210000});fs.writeFileSync(root+'/'+phase+'-console.log',(p.stdout||'')+'\n'+(p.stderr||''));const report=JSON.parse(fs.readFileSync(root+'/reports/validation/'+runId+'/gui-live-bridge-test.json'));console.log('PORTABLE_GUI '+JSON.stringify({phase,status:p.status,passed:report.passed,extension:report.extension,cleanupStatus:report.cleanup?.status}));assert.equal(p.status,0,'GUI test failed: '+phase);assert(report.passed);return report;}
const a=test(first,'first');
const bytes=JSON.parse(fs.readFileSync(first+'/OPENCODE-RELEASE.json')).files.reduce((n,f)=>n+f.bytes,0),tmp=os.tmpdir(),stat=fs.statfsSync(tmp);assert(stat.bavail*stat.bsize>bytes+1024**3,'Insufficient temporary drive free space');
const secondParent=path.join(tmp,'OpenCode 跨盘搬迁验证 '+id),second=path.join(secondParent,'再次 更名程序');assert(!fs.existsSync(secondParent));fs.mkdirSync(secondParent);fs.writeFileSync(secondParent+'/.owned-portability-test',id);
if(process.platform==='win32'){const copy=cp.spawnSync('robocopy.exe',[first,second,'/E','/COPY:DAT','/DCOPY:DAT','/R:1','/W:1','/XJ','/NFL','/NDL','/NJH','/NJS','/NP'],{encoding:'utf8',timeout:180000});fs.writeFileSync(root+'/copy.log',(copy.stdout||'')+(copy.stderr||''));assert(copy.status!==null&&copy.status<8,'Robocopy failed: '+copy.status);}else{fs.cpSync(first,second,{recursive:true,errorOnExist:true,force:false});}fs.renameSync(first,first+'-已移走');assert(!fs.existsSync(first));
const b=test(second,'second');assert(!fs.existsSync(first),'Moved-from path was recreated by a stale reference');
const gitClean=!cp.execFileSync('git',['status','--porcelain'],{cwd:source,encoding:'utf8'}).trim();assert(gitClean);
const result={passed:true,fromRuntimeDirectory:runtime,sourceRoot:source,testRoot:root,firstPath:first,secondPath:second,crossDrive:path.parse(first).root.toLowerCase()!==path.parse(second).root.toLowerCase(),oldPathAbsent:true,sourceGitClean:gitClean,sourceCommit:receipt.sourceCommit,first:{passed:a.passed,checks:a.extension,cleanup:a.cleanup?.status},afterMove:{passed:b.passed,checks:b.extension,cleanup:b.cleanup?.status},realModelRequests:false,usedRealUserProfile:false};fs.writeFileSync(source+'/reports/portable-relocation.json',JSON.stringify(result,null,2));console.log('PORTABILITY_RESULT '+JSON.stringify(result));
