// 回滚到某次发布之前：npm run rollback [-- <发布 id>]，不传 id 时回滚最近一次发布。
// 依据 reports/update-journal-<id>.jsonl 与 .update-backup/<id>：有旧文件的用备份覆盖回去，该次新增的文件删除。
// 只回滚一次发布；连续回滚多次就按从新到旧依次执行。OpenCode 必须先关闭。
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'opencode'),bdir=path.join(root,'.update-backup');
const safe=(base,rel)=>{const p=path.resolve(base,rel);if(p!==base&&!p.startsWith(base+path.sep))throw Error('UNSAFE_PATH '+rel);return p;};
if(process.platform==='win32'){const escaped=dest.replace(/'/g,"''");const ps=`@(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith('${escaped}\\',[System.StringComparison]::OrdinalIgnoreCase) } | Select-Object -ExpandProperty ProcessId) | ConvertTo-Json -Compress`;
 const active=cp.execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8'}).trim();if(active&&active!=='[]')throw Error('先关闭 OpenCode（'+dest+' 下仍有进程在运行），未做任何改动。');}
const ids=fs.existsSync(bdir)?fs.readdirSync(bdir).filter(n=>fs.statSync(path.join(bdir,n)).isDirectory()).sort((a,b)=>(parseInt(a)||0)-(parseInt(b)||0)):[];
const id=process.argv[2]||ids.at(-1);
if(!id)throw Error('没有可用的回滚点（.update-backup 为空）。');
if(!ids.includes(id))throw Error('找不到回滚点 '+id+'；可用：'+(ids.join(', ')||'无'));
const journal=path.join(root,'reports','update-journal-'+id+'.jsonl');
if(!fs.existsSync(journal))throw Error('缺少发布日志 '+journal+'，无法确定该次新增的文件，未做任何改动。');
const ops=new Map();
for(const line of fs.readFileSync(journal,'utf8').split(/\r?\n/)){if(!line.trim())continue;let j;try{j=JSON.parse(line);}catch{continue;}if(j.operation?.path)ops.set(j.operation.path,j.operation);}
const backup=path.join(bdir,id);let restored=0,removed=0;
for(const [rel,op] of ops){const target=safe(dest,rel),old=safe(backup,rel);
 if(op.hadOld){if(fs.existsSync(old)){fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(old,target);restored++;}}
 else if(fs.existsSync(target)){fs.rmSync(target,{force:true});removed++;}}
fs.rmSync(backup,{recursive:true,force:true});
console.log(`[rollback] ${id}: restored ${restored} file(s), removed ${removed} added file(s) in ${dest}. 回滚点已用掉并删除。`);
