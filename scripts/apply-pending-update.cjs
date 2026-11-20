// OpenCode p36: 启动前应用延迟发布。update.cjs 遇到本工程 opencode\OpenCode.exe 正在运行时，把构建暂存到 <源码>\opencode.next
// 并写 <源码>\.pending-update.json；启动器（Start-OpenCode.cmd、opencode\Start-Isolated.cmd）启动前调用本脚本：
//   1. 没有待应用更新 → 什么都不做；
//   2. 占 .build-lock（有构建在跑就跳过，下次启动再试）；
//   3. 以 --from-pending 运行 publish-runtime.cjs：仍检查 <源码>\opencode\ 下是否有进程（只看该目录，E:\opencode 不算），
//      有则不动任何文件；无则按原有备份/日志/回滚流程发布，成功后删除 opencode.next 与标记；
//   4. 成功后执行 post-publish.cjs 收尾（重置 confirmBeforeClose、只留 2 个回滚点、删 .update-stage）。
// 无论成败都以 0 退出，启动器照常启动（失败时启动的是旧版本）。只操作本工程目录，绝不触碰 E:\opencode。
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..');
const marker=path.join(root,'.pending-update.json'),next=path.join(root,'opencode.next'),lock=path.join(root,'.build-lock');
const tag='[apply-pending]';
function main(){
 if(!fs.existsSync(marker))return 0;
 if((process.execPath.toLowerCase()+path.sep).startsWith(path.join(root,'opencode').toLowerCase()+path.sep)){console.warn(tag+' node runs from inside '+path.join(root,'opencode')+'; use a node outside it. Not applied.');return 0;}
 if(!fs.existsSync(next)){console.warn(tag+' '+marker+' exists but '+next+' is missing; removing the stale marker.');fs.rmSync(marker,{force:true});return 0;}
 let info={};try{info=JSON.parse(fs.readFileSync(marker,'utf8'));}catch(e){console.warn(tag+' unreadable '+marker+': '+e.message+'; not applied.');return 0;}
 try{fs.mkdirSync(lock);}catch(e){if(e.code==='EEXIST'){let owner='';try{owner=fs.readFileSync(lock+'/owner.json','utf8').trim();}catch{}console.warn(tag+' a build/update holds .build-lock '+owner+'; pending update '+info.id+' left for the next launch.');return 0;}throw e;}
 try{
  fs.writeFileSync(lock+'/owner.json',JSON.stringify({pid:process.pid,at:new Date().toISOString(),by:'apply-pending-update'}));
  console.log(tag+' applying staged build '+(info.id||'?')+' (version '+(info.version||'?')+', built '+(info.createdAt||'?')+') to '+path.join(root,'opencode')+' ...');
  const r=cp.spawnSync(process.execPath,[path.join(__dirname,'publish-runtime.cjs'),'--from-pending'],{cwd:root,stdio:'inherit'});
  if(r.status!==0){console.warn(tag+' could not apply the pending update (exit '+r.status+'); the previous version stays in place and '+next+' is kept. Close every OpenCode window from '+path.join(root,'opencode')+' and launch again, or see reports/update-journal-*.jsonl.');return 0;}
  require('./post-publish.cjs')(root,tag);
  console.log(tag+' done.');
  return 0;
 }finally{fs.rmSync(lock,{recursive:true,force:true});}
}
try{process.exitCode=main();}catch(e){console.warn(tag+' '+(e&&e.message||e));process.exitCode=0;}
