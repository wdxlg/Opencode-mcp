// OpenCode p36: 发布成功后的收尾（原在 update.cjs 内）；直接发布与「延迟发布在启动前应用」两条路径共用。
// - 清掉用户设置里的 window.confirmBeforeClose（弹窗勾选「不再询问」会写入 never），让关闭确认恢复为默认 always。
// - 保留最近 2 个回滚点（.update-backup/<时间戳>-<id>），更早的删除；删除 .update-stage。
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function postPublish(root,tag='[update]'){
 const sp=path.join(root,'opencode','data','user-data','User','settings.json');
 try{if(fs.existsSync(sp)){const before=fs.readFileSync(sp,'utf8');const after=before.replace(/^[ \t]*"window\.confirmBeforeClose"[ \t]*:[ \t]*"[^"]*"[ \t]*,?[ \t]*\r?\n?/m,'').replace(/,(\s*})\s*$/,'$1');if(after!==before){fs.writeFileSync(sp,after);console.log(tag+' reset window.confirmBeforeClose in user settings');}}}catch(e){console.warn(tag+' could not reset window.confirmBeforeClose: '+e.message);}
 const bd=path.join(root,'.update-backup');if(fs.existsSync(bd)){const keep=2;const dirs=fs.readdirSync(bd,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort((x,y)=>(parseInt(x)||0)-(parseInt(y)||0));for(const d of dirs.slice(0,Math.max(0,dirs.length-keep)))fs.rmSync(path.join(bd,d),{recursive:true,force:true});}
 fs.rmSync(path.join(root,'.update-stage'),{recursive:true,force:true});
};
