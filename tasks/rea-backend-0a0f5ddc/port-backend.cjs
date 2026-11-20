// One-time source port, scoped PRE and necessary dependency caching. Never imports/runs REA.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),{builtinModules}=require('module');
const root=process.cwd(),task=path.join(root,'tasks/rea-backend-0a0f5ddc'),statePath=path.join(task,'state.json'),state=JSON.parse(fs.readFileSync(statePath,'utf8'));
const original=path.join(root,'defaults/rea/node_modules/rea-agents'),dist=path.join(original,'dist'),target=path.join(root,'recovered/rea-backend'),deps=path.join(root,'upstream/rea-backend-deps/node_modules');
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),hash=p=>fs.existsSync(p)?crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;
if(path.basename(root)!=='OpenCode-Source-Recovery-20261013'||fs.existsSync(target))throw Error('Wrong root or port already exists; inspect, do not replay');
for(const f of state.files)if(hash(path.join(root,f))!==state.sourceHashes[f])throw Error('Source changed since PRE: '+f);
const parser=require(require.resolve('@babel/parser',{paths:[original]}));
// Supplement scoped PRE for the existing default-retirement guard that must change.
const git=(args,env={})=>cp.execFileSync('git',args,{cwd:root,env:{...process.env,...env},encoding:'utf8',maxBuffer:32*1024*1024}).trim();
if(!state.preRef.endsWith('/pre-v2')){
const files=[...state.files,'scripts/copy-defaults.cjs'],head=git(['rev-parse','HEAD']),indexHash=hash(path.join(root,'.git/index')),index=path.join(task,'pre-v2.index');
const env={GIT_INDEX_FILE:index,GIT_AUTHOR_NAME:'OpenCode Local Task',GIT_AUTHOR_EMAIL:'task@local.invalid',GIT_COMMITTER_NAME:'OpenCode Local Task',GIT_COMMITTER_EMAIL:'task@local.invalid'};
git(['read-tree',state.originalHead],env);git(['add','-f','--',...files],env);const paths=git(['diff','--cached','--name-only','-z',state.originalHead],env).split('\0').filter(Boolean);if(paths.some(f=>!files.includes(f)))throw Error('Unexpected PRE path');
const pre=git(['commit-tree',git(['write-tree'],env),'-p',state.pre,'-m','Supplement REA backend correction PRE for default asset retirement'],env);git(['update-ref','refs/heads/ai/rea-backend-0a0f5ddc/pre-v2',pre]);fs.unlinkSync(index);
if(git(['rev-parse','HEAD'])!==head||hash(path.join(root,'.git/index'))!==indexHash)throw Error('Shared Git changed; inspect');
Object.assign(state,{previousPre:state.pre,pre,preRef:'refs/heads/ai/rea-backend-0a0f5ddc/pre-v2',files,sourceHashes:Object.fromEntries(files.map(f=>[f,hash(path.join(root,f))])),state:'porting_backend_sources'});fs.writeFileSync(statePath,JSON.stringify(state,null,2));
}
const pre=state.pre;
const originals={},ported={},resources=[],external=new Set(),queue=['dist/server/createServer.js','dist/composition/binary.js','dist/composition/optionalObservationProviders.js','dist/application/AnalysisSettings.js','dist/config/parseConfig.js','dist/frida/FridaInstrumentationManager.js','dist/domain/analysisErrorProjection.js','dist/domain/analysisErrorCore.js','dist/server/registerPrompts.js'],seen=new Set(),changes=[],requiredMethods=new Set();
const nativeRel=rel=>{let p=path.posix.relative(path.posix.dirname('vendor/'+rel),'native/context.mjs');return p.startsWith('.')?p:'./'+p;};
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const [k,v]of Object.entries(n)){if(['loc','comments','tokens','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn);}}
function transform(rel,source){
 const native=nativeRel(rel);
 if(rel==='dist/server/createServer.js'){
  source=source.replace(/import \{ EvidenceMcpServer \} from "\.\/EvidenceMcpServer\.js";\r?\n/,'');
  const start=source.indexOf('const createMcpServer = '),end=source.indexOf('/**',start);if(start<0||end<0)throw Error('Factory boundary not found');source=source.slice(0,start)+source.slice(end);
  source=source.replace('export const createServer =','export const createBackend =').replace('const server = options.mcpServer ??\n        createMcpServer(session, delivery, selectCompactInputSchemaPresentation(environment), omitOutputSchemas);','const server = options.mcpServer;\n    if (!server) throw new TypeError("OpenCode native registry is required");');
  if(source.includes('EvidenceMcpServer')||source.includes('createMcpServer('))throw Error('MCP constructor removal failed');
 }
 if(rel==='dist/server/mcpClientMetadata.js')return 'export const mcpClientMetadata = () => ({client:{name:"OpenCode native backend",version:"1"},clientFeatures:{elicitation_form:false,elicitation_url:false,roots:false,sampling:false}});\n';
 const ast=parser.parse(source,{sourceType:'unambiguous'}),edits=[],osTemps=new Set();let scoped=false;
 for(const node of ast.program.body){
  if(node.type==='ImportDeclaration'&&node.source.value==='node:os')for(const spec of node.specifiers)if(spec.imported?.name==='tmpdir')osTemps.add(spec.local.name);
  if(node.type==='ImportDeclaration'&&['./EvidenceMcpServerCore.js','@modelcontextprotocol/server'].includes(node.source.value))edits.push({start:node.source.start,end:node.source.end,text:JSON.stringify(native)});
 }
 walk(ast.program,node=>{
  if(node.type==='MemberExpression'&&node.object?.name==='process'&&!node.computed&&node.property?.name==='env'){edits.push({start:node.start,end:node.end,text:'__reaScope.backendEnvironment()'});scoped=true;}
  if(node.type==='CallExpression'&&node.callee?.type==='MemberExpression'&&node.callee.object?.name==='process'&&node.callee.property?.name==='cwd'&&node.arguments.length===0){edits.push({start:node.start,end:node.end,text:'__reaScope.backendCwd()'});scoped=true;}
  if(node.type==='CallExpression'&&osTemps.has(node.callee?.name)&&node.arguments.length===0){edits.push({start:node.start,end:node.end,text:'__reaScope.backendTempDir()'});scoped=true;}
  if(node.type==='MemberExpression'&&node.object?.name==='server'&&node.property?.name)requiredMethods.add(node.property.name);
 });
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 if(scoped)source='import * as __reaScope from '+JSON.stringify(native)+';\n'+source;
 return source;
}
for(let i=0;i<queue.length;i++){
 const rel=path.posix.normalize(queue[i]);if(seen.has(rel))continue;seen.add(rel);
 if(rel.startsWith('../')||rel.includes('/mcp/')||/^dist\/(?:cli\/|cli-runtime\/|cli\.js$)/.test(rel)||/dist\/(?:main\/|main\.js|server\/(?:EvidenceMcpServer|RequestTrackingMcpServer|DeferredEvidenceMcpServer))/.test(rel))throw Error('Forbidden runtime boundary reached: '+rel);
 const file=path.join(original,rel);if(!fs.existsSync(file))throw Error('Missing backend asset '+rel);
 originals[rel]=hash(file);if(!/\.[cm]?js$/.test(rel)){ported[rel]=fs.readFileSync(file);continue;}
 const source=transform(rel,read(file));if(source!==read(file))changes.push(rel);ported[rel]=Buffer.from(source);
 const ast=parser.parse(source,{sourceType:'unambiguous'});
 const add=spec=>{if(spec.startsWith('.')){if(spec===nativeRel(rel))return;queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel),spec)));}else if(!spec.startsWith('node:')&&!builtinModules.includes(spec))external.add(spec);};
 walk(ast.program,n=>{
  if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration','ImportExpression'].includes(n.type)&&n.source?.type==='StringLiteral')add(n.source.value);
  if(n.type==='CallExpression'&&(n.callee?.type==='Import'||n.callee?.name==='require')&&n.arguments[0]?.type==='StringLiteral')add(n.arguments[0].value);
  if(n.type==='NewExpression'&&n.callee?.name==='URL'&&n.arguments[0]?.type==='StringLiteral'&&n.arguments[1]?.object?.type==='MetaProperty'){
   const asset=path.posix.normalize(path.posix.join(path.posix.dirname(rel),n.arguments[0].value));resources.push({from:rel,path:asset});queue.push(asset);
  }
 });
}
if(external.has('@modelcontextprotocol/server'))throw Error('REA MCP server dependency survived');
const catalog=json(path.join(dist,'mcp-catalog-full.json'));if(catalog.tools.length!==229)throw Error('Unexpected catalog');
// Copy necessary package dependency closure from already installed packages, not the REA distribution.
const blocked=new Set(['rea-agents','frida','electron','@modelcontextprotocol/server']),packages=new Map();
function packageRoot(name,from){for(let dir=from;;dir=path.dirname(dir)){const candidate=path.join(dir,'node_modules',...name.split('/'));if(fs.existsSync(path.join(candidate,'package.json'))&&json(path.join(candidate,'package.json')).name===name)return candidate;if(path.dirname(dir)===dir)throw Error('Missing installed dependency '+name);}}
function collect(name,from,optional=false){if(blocked.has(name))return;let p;try{p=packageRoot(name,from);}catch(e){if(optional)return;throw e;}const pkg=json(path.join(p,'package.json')),key=path.relative(path.join(root,'defaults/rea/node_modules'),p).replace(/\\/g,'/');if(key.startsWith('../'))throw Error('Dependency escaped audited tree');if(packages.has(key))return;packages.set(key,{name,path:p,version:pkg.version,license:pkg.license});for(const child of Object.keys(pkg.dependencies??{}))collect(child,p);for(const child of Object.keys(pkg.optionalDependencies??{}))collect(child,p,true);}
for(const spec of external){const parts=spec.split('/'),name=spec.startsWith('@')?parts.slice(0,2).join('/'):parts[0];collect(name,original);}
fs.mkdirSync(target,{recursive:true});
for(const [rel,bytes]of Object.entries(ported)){const output=path.join(target,'vendor',rel);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,bytes);}
for(const name of ['context.mjs','entry.mjs']){const out=path.join(target,'native',name);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(task,'inputs',name),out);}
fs.copyFileSync(path.join(original,'LICENSE'),path.join(target,'LICENSE'));
fs.writeFileSync(path.join(target,'package.json'),JSON.stringify({private:true,type:'module',description:'OpenCode embedded REA backend source port; no executable or service entry',license:'MIT'},null,2));
fs.writeFileSync(path.join(target,'catalog.json'),JSON.stringify({version:'6.8.0',tools:catalog.tools,prompts:catalog.prompts},null,2));
for(const [name,pkg]of packages){const dest=path.join(deps,...name.split('/'));if(fs.existsSync(dest))throw Error('Dependency cache already exists '+name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(pkg.path,dest,{recursive:true,filter:p=>path.basename(p)!=='node_modules'&&!fs.lstatSync(p).isSymbolicLink()});}
const provenance={version:'6.8.0',architecture:'embedded-native-backend',repository:'https://github.com/morluto/rea',license:'MIT',sourceIntegrity:'sha512-9QDeRnGqEDzABZyr04eLnBXBv/c6I9/TWu/6M0MD4pEfkySI/BIgwTODIbAReX3C1x6hjw9+Jlx4A2yUSPZ9ww==',upstreamDeclaredEngines:json(path.join(original,'package.json')).engines,originals,adaptedFiles:changes,resources,packages:Object.fromEntries([...packages].map(([name,p])=>[name,{name:p.name,version:p.version,license:p.license}])),externalEngines:['frida','electron','ghidra','ida','hopper','rizin','gdb','jadx','jeb'],requiredRegistrySurface:[...requiredMethods].sort(),tools:229,productStarted:false,functionalTestsRun:false};
fs.writeFileSync(path.join(target,'PROVENANCE.json'),JSON.stringify(provenance,null,2));
fs.writeFileSync(path.join(root,'upstream/rea-backend-deps/package.json'),JSON.stringify({private:true,description:'Build dependency cache only; no REA distribution or Node runtime',dependencies:Object.fromEntries([...packages].filter(([n])=>!n.includes('/node_modules/')).map(([n,p])=>[n,p.version]))},null,2));
Object.assign(state,{state:'backend_sources_ported_wiring_pending',backendSource:'recovered/rea-backend',backendModules:Object.keys(ported).length,adaptedFiles:changes,dependencyPackages:packages.size,productSourcesChanged:true});fs.writeFileSync(statePath,JSON.stringify(state,null,2));
fs.appendFileSync(path.join(task,'task.md'),'\n## 源码移植中\n用户继续后已补 PRE '+pre+'。新增 recovered/rea-backend：无传输分析服务、229 项目录、工作流模板与原生注册器。仅复制已有必要依赖缓存，不安装、不启动。待原生调度接线、资产迁移、POST 和构建。\n');
fs.writeFileSync(path.join(task,'progress.md'),'# 进度\n状态：running。后端源码抽取与作用域适配已生成；原生工具接线与仅后端资产发布待完成。未启动、未功能验证。\n');
console.log(JSON.stringify({pre,modules:Object.keys(ported).length,adaptedFiles:changes,dependencyPackages:packages.size,requiredRegistrySurface:provenance.requiredRegistrySurface,resources,external:[...external]},null,2));
