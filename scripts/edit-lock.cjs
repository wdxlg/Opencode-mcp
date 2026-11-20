// OpenCode p37: 简单的「编辑锁」（建议性，不强制）：多个会话同时改同一源码文件（默认 module-1476.mjs）时先占锁，改完释放。
// 用法：
//   node scripts/edit-lock.cjs acquire [文件] --owner <名字> [--note <说明>]   占锁；同一 owner 再次 acquire = 续期
//   node scripts/edit-lock.cjs release [文件] --owner <名字> [--force]         释放（非本人需 --force）
//   node scripts/edit-lock.cjs status  [文件]                                  查看（不给文件 = 列出全部）
// 文件可写相对源码根的路径或 module 名（如 module-1476.mjs）；默认 027-workbench 的 module-1476.mjs。
// 锁超过 30 分钟未续期视为过期：status 标为 stale，acquire 可直接接管。锁只是提醒，update.cjs 构建时遇到有效锁只警告不失败。
'use strict';
const fs=require('fs'),path=require('path'),os=require('os');
const root=process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..');
const lockDir=path.join(root,'.edit-locks');
const STALE_MS=30*60*1000;
const DEFAULT_FILE='recovered/esm/027-workbench.desktop.main.js/module-1476.mjs';
function normalize(file){
 let rel=String(file||DEFAULT_FILE).replace(/\\/g,'/');
 if(path.isAbsolute(rel)){rel=path.relative(root,rel).replace(/\\/g,'/');}
 // 只给模块文件名（如 module-1476.mjs）时，在 recovered/esm/*/ 里找；1476 默认指 027-workbench 那份
 if(!rel.includes('/')){if(rel.toLowerCase()==='module-1476.mjs')rel=DEFAULT_FILE;else{const esm=path.join(root,'recovered','esm');const hits=fs.existsSync(esm)?fs.readdirSync(esm).filter(d=>fs.existsSync(path.join(esm,d,rel))).map(d=>'recovered/esm/'+d+'/'+rel):[];if(hits.length===1)rel=hits[0];else if(hits.length>1)throw Error(rel+' exists in several bundles; give the full path: '+hits.join(', '));}}
 if(rel.startsWith('../')||rel.includes('/../'))throw Error('Edit lock target must be inside the recovery source: '+file);
 return rel;
}
const lockPath=rel=>path.join(lockDir,rel.replace(/[\/:*?"<>|]+/g,'__')+'.json');
function read(rel){try{const j=JSON.parse(fs.readFileSync(lockPath(rel),'utf8'));const t=Number(j.renewedAtMs)||Date.parse(j.renewedAt||j.at);const age=Date.now()-t;return {...j,ageMs:age,stale:!(age<STALE_MS)};}catch(e){if(e.code==='ENOENT')return null;return {file:rel,owner:'(unreadable lock)',at:'?',stale:false,ageMs:0,error:e.message};}}
function write(rel,data,exclusive){fs.mkdirSync(lockDir,{recursive:true});const p=lockPath(rel);if(exclusive){const fd=fs.openSync(p,'wx');try{fs.writeSync(fd,JSON.stringify(data,null,2));}finally{fs.closeSync(fd);}}else{const tmp=p+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data,null,2));fs.renameSync(tmp,p);}}
function acquire(file,owner,note){
 if(!owner)throw Error('acquire needs --owner <name>');
 const rel=normalize(file),now=new Date().toISOString(),cur=read(rel);
 const data={file:rel,owner,note:note||'',at:now,renewedAt:now,renewedAtMs:Date.now(),host:os.hostname(),pid:process.pid};
 if(!cur){try{write(rel,data,true);return {ok:true,lock:data};}catch(e){if(e.code!=='EEXIST')throw e;return acquire(file,owner,note);}}
 if(cur.owner===owner){data.at=cur.at||now;write(rel,data,false);return {ok:true,renewed:true,lock:data};}
 if(cur.stale){write(rel,data,false);return {ok:true,tookOverStale:cur,lock:data};}
 return {ok:false,heldBy:cur};
}
function release(file,owner,force){
 const rel=normalize(file),cur=read(rel);
 if(!cur)return {ok:true,released:false,reason:'not locked'};
 if(cur.owner!==owner&&!force&&!cur.stale)return {ok:false,heldBy:cur};
 fs.rmSync(lockPath(rel),{force:true});return {ok:true,released:true,previous:cur};
}
function list(){if(!fs.existsSync(lockDir))return [];return fs.readdirSync(lockDir).filter(n=>n.endsWith('.json')).map(n=>{try{const j=JSON.parse(fs.readFileSync(path.join(lockDir,n),'utf8'));return read(j.file);}catch{return {file:n,owner:'(unreadable lock)',stale:false};}}).filter(Boolean);}
// 供 update.cjs 使用：未过期的锁
function activeLocks(){return list().filter(l=>!l.stale);}
const fmt=l=>`${l.file} — owner ${l.owner}${l.note?' ('+l.note+')':''}, since ${l.at}, ${Math.round((l.ageMs||0)/60000)} min since last renew${l.stale?' [STALE >30 min]':''}`;
module.exports={acquire,release,list,activeLocks,STALE_MS,DEFAULT_FILE,lockDir};
if(require.main===module){
 const argv=process.argv.slice(2),cmd=argv[0];const opt=n=>{const i=argv.indexOf('--'+n);return i>=0?argv[i+1]:undefined;};
 const pos=argv.slice(1).filter((a,i,arr)=>!a.startsWith('--')&&!['--owner','--note'].includes(arr[i-1]));
 const owner=opt('owner')||process.env.OPENCODE_EDIT_LOCK_OWNER;
 try{
  if(cmd==='acquire'){const r=acquire(pos[0],owner,opt('note'));if(r.ok){console.log((r.renewed?'[edit-lock] renewed ':r.tookOverStale?'[edit-lock] took over stale lock ':'[edit-lock] acquired ')+fmt({...r.lock,ageMs:0}));}else{console.error('[edit-lock] HELD: '+fmt(r.heldBy));process.exitCode=2;}}
  else if(cmd==='release'){const r=release(pos[0],owner,argv.includes('--force'));if(r.ok)console.log(r.released?'[edit-lock] released '+r.previous.file:'[edit-lock] '+normalize(pos[0])+' was not locked');else{console.error('[edit-lock] not yours (use --force): '+fmt(r.heldBy));process.exitCode=2;}}
  else if(cmd==='status'){const ls=pos[0]?[read(normalize(pos[0]))].filter(Boolean):list();if(!ls.length)console.log('[edit-lock] no locks'+(pos[0]?' on '+normalize(pos[0]):''));for(const l of ls)console.log('[edit-lock] '+fmt(l));process.exitCode=ls.some(l=>!l.stale)?1:0;}
  else{console.log('usage: node scripts/edit-lock.cjs acquire|release|status [file] [--owner name] [--note text] [--force]');process.exitCode=64;}
 }catch(e){console.error('[edit-lock] '+e.message);process.exitCode=70;}
}
