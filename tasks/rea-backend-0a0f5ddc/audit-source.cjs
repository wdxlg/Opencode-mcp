// Static source/dependency review only. Does not import upstream modules or run engines.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const root=process.cwd(),taskId='0a0f5ddc-ee70-4714-b8a0-dad2f2ee1335',dir=path.join(root,'tasks/rea-backend-0a0f5ddc');
if(path.basename(root)!=='OpenCode-Source-Recovery-20261013')throw Error('Wrong project');
const base=path.join(root,'defaults/rea/node_modules/rea-agents'),dist=path.join(base,'dist');
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),sha=p=>fs.existsSync(p)?crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;
const write=(name,v)=>fs.writeFileSync(path.join(dir,name),typeof v==='string'?v:JSON.stringify(v,null,2));
fs.mkdirSync(dir,{recursive:true});
if(fs.existsSync(path.join(dir,'audit.json')))throw Error('Audit already recorded; inspect instead of replay');
const git=(args,env={})=>cp.execFileSync('git',args,{cwd:root,env:{...process.env,...env},encoding:'utf8',maxBuffer:32*1024*1024}).trim();
const files=['package.json','scripts/update.cjs','scripts/sync-shared.cjs','scripts/prepare-rea.cjs','scripts/verify-rea-assets.cjs','defaults/manifest.json','defaults/rea-bridge.mjs','docs/rea-integration.md','recovered/shared/rea-integration.mjs','recovered/shared/default-bootstrap.mjs','recovered/esm/000-extension.js/rea-integration.mjs','recovered/esm/000-extension.js/default-bootstrap.mjs','recovered/esm/000-extension.js/module-0114.mjs','recovered/esm/000-extension.js/module-0143.mjs','recovered/esm/000-extension.js/module-0154.mjs','recovered/esm/000-extension.js/modules.json'];
const originalHead=git(['rev-parse','HEAD']),indexSha=sha(path.join(root,'.git/index')),index=path.join(dir,'pre.index');
const env={GIT_INDEX_FILE:index,GIT_AUTHOR_NAME:'OpenCode Local Task',GIT_AUTHOR_EMAIL:'task@local.invalid',GIT_COMMITTER_NAME:'OpenCode Local Task',GIT_COMMITTER_EMAIL:'task@local.invalid'};
git(['read-tree',originalHead],env);git(['add','-f','--',...files.filter(f=>fs.existsSync(path.join(root,f)))],env);
const staged=git(['diff','--cached','--name-only','-z',originalHead],env).split('\0').filter(Boolean);
if(staged.some(f=>!files.includes(f)))throw Error('Unexpected PRE path');
const pre=git(['commit-tree',git(['write-tree'],env),'-p',originalHead,'-m','Snapshot scoped REA integration before backend-only correction'],env);
git(['update-ref','refs/heads/ai/rea-backend-0a0f5ddc/pre',pre]);fs.unlinkSync(index);
if(git(['rev-parse','HEAD'])!==originalHead||sha(path.join(root,'.git/index'))!==indexSha)throw Error('Shared Git state changed; inspect without reverting');
const entrypoints=['server/createServer.js','composition/binary.js','composition/optionalObservationProviders.js','config/parseConfig.js','application/AnalysisSettings.js','logger.js'];
const excluded=new Set(['server/EvidenceMcpServer.js','server/registerPrompts.js']);
const graph={},external={},missing=[],dynamic=[],urlResources=[];
const queue=[...entrypoints],seen=new Set();
for(let i=0;i<queue.length;i++){
 const rel=queue[i];if(seen.has(rel)||excluded.has(rel))continue;seen.add(rel);
 const absolute=path.join(dist,rel);if(!fs.existsSync(absolute)){missing.push(rel);continue;}
 const source=read(absolute),edges=[];
 const imports=[...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"']+)["']/g)].map(m=>m[1]);
 for(const spec of imports){
  if(spec.startsWith('.')){const target=path.posix.normalize(path.posix.join(path.posix.dirname(rel),spec));edges.push(target);if(!excluded.has(target))queue.push(target);}
  else if(!spec.startsWith('node:')){(external[spec]??=[]).push(rel);}
 }
 for(const m of source.matchAll(/new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g)){
  const target=path.posix.normalize(path.posix.join(path.posix.dirname(rel),m[1]));urlResources.push({from:rel,path:target,exists:fs.existsSync(path.join(dist,target))});
  if(/\.[cm]?js$/.test(target))queue.push(target);
 }
 if(/\b(?:import|require)\s*\(\s*(?!["'])/.test(source))dynamic.push(rel);
 graph[rel]={sha256:sha(absolute),imports:edges};
}
const pkg=json(path.join(base,'package.json'));
const catalogs=fs.readdirSync(dist).filter(f=>/catalog.*json|json.*catalog/i.test(f));
const audit={taskId,at:new Date().toISOString(),scope:'all_backend',upstream:{name:pkg.name,version:pkg.version,license:pkg.license,declaredEngines:pkg.engines},nativeHost:{buildNode:process.version,productNotStarted:true},entrypoints,proposedBoundaryExclusions:[...excluded],sourceModuleCount:Object.keys(graph).length,external,missing,dynamicImportsRequiringReview:dynamic,urlResources,catalogFiles:catalogs,graph,pre,originalHead,sourceHashes:Object.fromEntries(files.map(f=>[f,sha(path.join(root,f))])),productSourcesChanged:false,buildRun:false,functionalTestsRun:false};
write('audit.json',audit);
write('state.json',{taskId,state:'backend_architecture_audited_implementation_pending',pre,preRef:'refs/heads/ai/rea-backend-0a0f5ddc/pre',originalHead,files,sourceHashes:audit.sourceHashes,buildRun:false,productSourcesChanged:false});
write('task.md','# REA 全部后端原生接入纠正\n\n用户边界：仅后端功能；不交付 REA CLI/前端/独立服务/专用 Node/REA MCP 子进程。保留 Ghidra、IDA、Frida 等外部引擎适配但不打包引擎。授权源码与构建，不启动产品或实际逆向，不写正式 E:\\OpenCode。\n\n## 限定 PRE\n'+pre+'，ref refs/heads/ai/rea-backend-0a0f5ddc/pre。共享 HEAD/index 未变；恢复只按 state.json 所列路径，不整仓 checkout。后端源码审计仅读取现有固定官方包；未执行它的入口。\n\n## 尚未完成\n原生注册器、全工具目录、参数/结果验证、取消/清理、宿主兼容、仅后端依赖闭包及构建发布仍待完成。旧独立运行包不是此需求的交付。\n');
write('progress.md','# 进度\n已完成限定 PRE 与静态依赖图审计；产品源码未改，未构建、未启动、未实际逆向。详见 audit.json。正在核对原生工具注册、调用生命周期和后端依赖边界。\n');
write('mandatory-checks.json',{taskId,scopeAcknowledged:true,rulesAcknowledged:true,receivingCodeReviewSkillRead:true,preRecorded:true,sharedGitUntouched:true,productSourceChanged:false,postRecorded:false,buildCompleted:false,launched:false,functionalTestsRun:false,publicationVerified:false,remaining:['complete native tool schema registration and lifecycle review','review dynamic imports and resources','remove only prior owned REA runtime assets after replacement is ready','implement all backend tool dispatch without REA process','source POST before build','verify build and managed publication','final SQL/index/task readback']});
const workflow=path.join(root,'.ai-workflow');fs.mkdirSync(path.join(workflow,'index'),{recursive:true});fs.mkdirSync(path.join(workflow,'logs'),{recursive:true});
fs.writeFileSync(path.join(workflow,'index/rea-backend-0a0f5ddc.json'),JSON.stringify({taskId,path:'tasks/rea-backend-0a0f5ddc',state:'implementation_pending',pre,audit:'audit.json'},null,2));
fs.appendFileSync(path.join(workflow,'logs/rea-backend-0a0f5ddc.jsonl'),JSON.stringify({event:'scoped_pre_and_static_audit',taskId,pre,moduleCount:audit.sourceModuleCount,productSourcesChanged:false,at:audit.at})+'\n');
const {DatabaseSync}=require('node:sqlite'),db=new DatabaseSync(path.join(workflow,'memory.sqlite'));db.exec('PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS opencode_rea_backend_delivery(task_id TEXT PRIMARY KEY, record_json TEXT NOT NULL)');db.prepare('INSERT INTO opencode_rea_backend_delivery(task_id,record_json) VALUES(?,?)').run(taskId,JSON.stringify({taskId,state:'implementation_pending',pre,path:'tasks/rea-backend-0a0f5ddc'}));db.close();
console.log(JSON.stringify({taskId,pre,moduleCount:audit.sourceModuleCount,external:Object.keys(external),missing,dynamicImportsRequiringReview:dynamic,urlResources,catalogs,productSourcesChanged:false},null,2));
