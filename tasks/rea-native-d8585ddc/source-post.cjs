// Scoped local source POST only, before build/publication. No checkout/reset/push or shared-index changes.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=process.cwd(),dir=path.join(root,'tasks/rea-native-d8585ddc'),stateFile=path.join(dir,'state.json'),state=JSON.parse(fs.readFileSync(stateFile,'utf8'));
if(state.post)throw Error('POST already exists: inspect instead of replay');
const hash=p=>fs.existsSync(p)?crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'defaults/manifest.json'),'utf8'));
if(manifest.rea?.version!=='6.8.0')throw Error('REA dependency preparation is not complete');
for(const f of manifest.files.filter(f=>f.path==='rea-bridge.mjs'||f.path.startsWith('rea/')))if(hash(path.join(root,'defaults',f.path))!==f.sha256)throw Error('Prepared asset changed: '+f.path);
const git=(args,env={})=>cp.execFileSync('git',args,{cwd:root,env:{...process.env,...env},encoding:'utf8',maxBuffer:32*1024*1024}).trim();
const beforeHead=git(['rev-parse','HEAD']),beforeIndex=hash(path.join(root,'.git/index'));
const files=state.files.filter(f=>fs.existsSync(path.join(root,f))),index=path.join(dir,'private-post.index');
const env={GIT_INDEX_FILE:index,GIT_AUTHOR_NAME:'OpenCode Local Task',GIT_AUTHOR_EMAIL:'task@local.invalid',GIT_COMMITTER_NAME:'OpenCode Local Task',GIT_COMMITTER_EMAIL:'task@local.invalid'};
// Unchanged paths inherit the original committed baseline, never another dialogue's working changes.
git(['read-tree',state.originalHead],env);git(['add','-f','--',...files],env);
const changed=git(['diff','--cached','--name-only','-z',state.originalHead],env).split('\0').filter(Boolean);
if(changed.some(f=>!files.includes(f)))throw Error('POST contains unexpected working changes');
for(const f of changed)if(/(?:^|\/)(?:\.env|memory\.sqlite|data|\.recovery-profile)(?:\/|$)/.test(f))throw Error('Private/runtime data refused');
const post=git(['commit-tree',git(['write-tree'],env),'-p',state.originalHead,'-m','Integrate pinned REA 6.8.0 into OpenCode main-window Bridge'],env);
git(['update-ref','refs/heads/ai/rea-d8585ddc/post',post]);fs.unlinkSync(index);
if(git(['rev-parse','HEAD'])!==beforeHead||hash(path.join(root,'.git/index'))!==beforeIndex)throw Error('Shared Git state changed during POST; inspect without reverting');
Object.assign(state,{post,postRef:'refs/heads/ai/rea-d8585ddc/post',postTreeBase:state.originalHead,sourceFiles:files,changedSourceFiles:changed,sourceHashes:Object.fromEntries(files.map(f=>[f,hash(path.join(root,f))])),sharedGitUntouchedDuringPost:true,state:'source_committed_build_pending',sourceCommitIsNotAFullUncommittedWorkspaceSnapshot:true,sourceCommittedAt:new Date().toISOString()});
fs.writeFileSync(stateFile,JSON.stringify(state,null,2));
fs.appendFileSync(path.join(dir,'task.md'),'\n## 源码提交\nPOST '+post+'，分支 '+state.postRef+'。共享 HEAD/index 未修改；其他对话的未提交代码不纳入本次提交，但构建使用磁盘现状。PRE 为限定文件快照，恢复时按指定路径 git show，禁止整仓 checkout 覆盖他人工作。\n');
fs.writeFileSync(path.join(dir,'progress.md'),'# 进度\n源码接入、固定运行依赖和限定 POST 已完成。POST '+post+'。下一步：执行正常构建并核对发布回执；未启动/未实测。\n');
fs.appendFileSync(path.join(root,'.ai-workflow/logs/rea-native-d8585ddc.jsonl'),JSON.stringify({event:'source_post',post,files:changed,at:new Date().toISOString()})+'\n');
const {DatabaseSync}=require('node:sqlite'),db=new DatabaseSync(path.join(root,'.ai-workflow/memory.sqlite'));db.exec('PRAGMA busy_timeout=5000');db.prepare('UPDATE opencode_rea_native_delivery SET record_json=? WHERE task_id=?').run(JSON.stringify(state),state.taskId);db.close();
console.log('REA_POST '+JSON.stringify({post,ref:state.postRef,changedSourceFiles:changed,sharedGitUntouched:true,functionalTestsRun:false}));
