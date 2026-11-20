// Build and managed publish only; update.cjs does not launch products or tests.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=process.cwd(),dir=path.join(root,'tasks/rea-backend-0a0f5ddc'),file=path.join(dir,'state.json'),state=JSON.parse(fs.readFileSync(file,'utf8'));
if(path.basename(root)!=='OpenCode-Source-Recovery-20261013'||!state.post||state.buildRun)throw Error('Source POST missing or build already attempted; inspect before replay');
const hash=p=>fs.existsSync(p)?crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;
for(const [p,h]of Object.entries(state.postSourceHashes))if(hash(path.join(root,p))!==h)throw Error('Source changed after POST: '+p);
Object.assign(state,{buildRun:true,state:'building_and_publishing',buildStartedAt:new Date().toISOString()});fs.writeFileSync(file,JSON.stringify(state,null,2));
const result=cp.spawnSync(process.execPath,[path.join(root,'scripts/update.cjs')],{cwd:root,stdio:'inherit'});
fs.writeFileSync(path.join(dir,'build.exit'),result.status===null?'unknown':String(result.status));
Object.assign(state,{state:result.status===0?'build_finished_final_verification_pending':'build_failed_inspection_required',buildExitCode:result.status,buildSignal:result.signal,buildError:result.error?.message,buildFinishedAt:new Date().toISOString()});fs.writeFileSync(file,JSON.stringify(state,null,2));if(result.status!==0)process.exitCode=1;
