// Supplemental PRE for the newly discovered publisher defect. No product edits.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=process.cwd(),dir=path.join(root,'tasks/rea-native-d8585ddc'),file=path.join(dir,'state.json'),state=JSON.parse(fs.readFileSync(file,'utf8'));
if(state.publisherPre)throw Error('Supplemental PRE already exists: inspect instead of replay');
const rel='scripts/publish-runtime.cjs',hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const original=hash(path.join(root,rel));if(original!=='266e38c482b5fd126b60ce8e5f16b18f6e9b69f8a8511915edf910dcf24572de')throw Error('Publisher changed; re-read before editing');
const git=(args,env={})=>cp.execFileSync('git',args,{cwd:root,env:{...process.env,...env},encoding:'utf8'}).trim();
const head=git(['rev-parse','HEAD']),shared=hash(path.join(root,'.git/index')),index=path.join(dir,'private-publisher-pre.index');
const env={GIT_INDEX_FILE:index,GIT_AUTHOR_NAME:'OpenCode Local Task',GIT_AUTHOR_EMAIL:'task@local.invalid',GIT_COMMITTER_NAME:'OpenCode Local Task',GIT_COMMITTER_EMAIL:'task@local.invalid'};
git(['read-tree','--empty'],env);git(['add','-f','--',rel],env);if(git(['ls-files'],env)!==rel)throw Error('Supplemental PRE scope mismatch');
const pre=git(['commit-tree',git(['write-tree'],env),'-p',state.post,'-m','REA publisher repair: supplemental scoped PRE'],env);git(['update-ref','refs/heads/ai/rea-d8585ddc/publisher-pre',pre]);fs.unlinkSync(index);
if(git(['rev-parse','HEAD'])!==head||hash(path.join(root,'.git/index'))!==shared)throw Error('Shared Git state changed; inspect without reverting');
state.publisherPre=pre;state.publisherOriginalSha256=original;state.files.push(rel);state.state='repairing_publisher_asset_omission';fs.writeFileSync(file,JSON.stringify(state,null,2));
fs.appendFileSync(path.join(dir,'task.md'),'\n## 补充修复范围\n发布后逐文件哈希检查发现依赖内部 data 目录被发布器误过滤；第一次构建/发布命令成功不代表最终交付完整。补充 PRE '+pre+'；修复只把 data 保护限定在运行根目录，继续保护 .recovery-profile/.git，保留用户文件冲突/运行/锁/回滚门禁；添加默认清单完整性拒绝遗漏。重新提交、构建、发布和复核，不运行产品。\n');
fs.appendFileSync(path.join(root,'.ai-workflow/logs/rea-native-d8585ddc.jsonl'),JSON.stringify({event:'publisher_omission_detected',publisherPre:pre,original,productStarted:false,at:new Date().toISOString()})+'\n');
console.log('PUBLISHER_PRE '+JSON.stringify({pre,original,head,sharedGitUntouched:true}));
