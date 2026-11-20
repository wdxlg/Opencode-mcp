// One-time static source/resource completion. No backend import, engine execution or downloads.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),{builtinModules}=require('module');
const root=process.cwd(),task=path.join(root,'tasks/rea-backend-0a0f5ddc'),statePath=path.join(task,'state.json'),state=JSON.parse(fs.readFileSync(statePath,'utf8'));
const original=path.join(root,'defaults/rea/node_modules/rea-agents'),target=path.join(root,'recovered/rea-backend'),deps=path.join(root,'upstream/rea-backend-deps/node_modules');
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),digest=b=>crypto.createHash('sha256').update(b).digest('hex'),hash=p=>fs.existsSync(p)?digest(fs.readFileSync(p)):null;
if(path.basename(root)!=='OpenCode-Source-Recovery-20261013'||state.resourceRepairCompleted)throw Error('Wrong root or repair already recorded');
const provenance=json(path.join(target,'PROVENANCE.json')),upstreamPackage=json(path.join(original,'package.json'));
const parser=require(require.resolve('@babel/parser',{paths:[original]}));
const originals={},ported={},resources=[],external=new Set(),queue=Object.keys(provenance.originals),seen=new Set(),changes=[],requiredMethods=new Set();
function filesUnder(dir,prefix){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Linked source refused');const p=path.join(dir,e.name),r=prefix+'/'+e.name;if(e.isDirectory())filesUnder(p,r);else if(e.isFile())queue.push(r);}}
filesUnder(path.join(original,'bridge'),'bridge');
filesUnder(path.join(original,'licenses'),'licenses');
filesUnder(path.join(original,'third_party'),'third_party');
queue.push('THIRD_PARTY_NOTICES.md','DISCLAIMER.md',...Object.values(upstreamPackage.imports).map(x=>x.replace(/^\.\//,'')));
// Preserve a real, private-index mistake snapshot before correcting missing worker/resource mappings.
const git=(args,env={})=>cp.execFileSync('git',args,{cwd:root,env:{...process.env,...env},encoding:'utf8',maxBuffer:32*1024*1024}).trim();
const head=git(['rev-parse','HEAD']),sharedIndex=hash(path.join(root,'.git/index')),index=path.join(task,'resource-repair.index');
const env={GIT_INDEX_FILE:index,GIT_AUTHOR_NAME:'OpenCode Local Task',GIT_AUTHOR_EMAIL:'task@local.invalid',GIT_COMMITTER_NAME:'OpenCode Local Task',GIT_COMMITTER_EMAIL:'task@local.invalid'};
git(['read-tree',state.pre],env);const scoped=[...state.files,'recovered/rea-backend'];git(['add','-f','--',...scoped],env);
const changed=git(['diff','--cached','--name-only','-z',state.pre],env).split('\0').filter(Boolean);if(changed.some(f=>!state.files.includes(f)&&!f.startsWith('recovered/rea-backend/')))throw Error('Mistake snapshot escaped scope');
const mistake=git(['commit-tree',git(['write-tree'],env),'-p',state.pre,'-m','Static review snapshot: backend worker aliases, helper closure and dependency placement pending correction'],env),mistakeRef='refs/heads/mistake-book/rea-backend-0a0f5ddc/resource-closure';git(['update-ref',mistakeRef,mistake]);fs.unlinkSync(index);
if(git(['rev-parse','HEAD'])!==head||hash(path.join(root,'.git/index'))!==sharedIndex)throw Error('Shared Git changed');
Object.assign(state,{mistake,mistakeRef});fs.writeFileSync(statePath,JSON.stringify(state,null,2));
const nativeRel=rel=>{let p=path.posix.relative(path.posix.dirname('vendor/'+rel),'native/context.mjs');return p.startsWith('.')?p:'./'+p;};
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const [k,v]of Object.entries(n)){if(['loc','comments','tokens','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn);}}
function transform(rel,source){
 const native=nativeRel(rel);
 if (rel.endsWith('.cjs')) return source; // standalone helpers inherit their private child env/cwd

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
 const imports=new Map();
 for(const n of ast.program.body)if(n.type==='ImportDeclaration')for(const i of n.specifiers)imports.set(i.local.name,{from:n.source.value,imported:i.type==='ImportSpecifier'?i.imported.name:undefined,namespace:i.type!=='ImportSpecifier'});
 function bind(p,set){if(!p)return;if(p.type==='Identifier')set.add(p.name);else if(p.type==='RestElement')bind(p.argument,set);else if(p.type==='AssignmentPattern')bind(p.left,set);else if(p.type==='ObjectPattern')p.properties.forEach(x=>bind(x.value??x.argument,set));else if(p.type==='ArrayPattern')p.elements.forEach(x=>bind(x,set));}
 function scopedVisit(n,outer){
  if(!n||typeof n!=='object')return;
  let shadow=outer;
  if(['Program','BlockStatement','FunctionDeclaration','FunctionExpression','ArrowFunctionExpression','CatchClause','ForStatement','ForInStatement','ForOfStatement'].includes(n.type)){
   shadow=new Set(outer);
   if(n.type.includes('Function')||n.type==='ArrowFunctionExpression'){
    n.params.forEach(p=>bind(p,shadow));if(n.id)bind(n.id,shadow);
    const gather=x=>{if(!x||typeof x!=='object'||(x!==n.body&&/Function/.test(x.type??'')))return;if(x.type==='VariableDeclaration'&&x.kind==='var')x.declarations.forEach(d=>bind(d.id,shadow));for(const [k,v]of Object.entries(x)){if(['loc','comments','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(gather);else if(v&&typeof v==='object')gather(v);}};gather(n.body);
   }
   if(n.type==='CatchClause')bind(n.param,shadow);
   const declarations=Array.isArray(n.body)?n.body:[n.init,n.left];
   for(const d of declarations.filter(Boolean)){if(d.type==='VariableDeclaration')d.declarations.forEach(x=>bind(x.id,shadow));else if(['FunctionDeclaration','ClassDeclaration'].includes(d.type))bind(d.id,shadow);}
  }
  if(n.type==='CallExpression'){
   const c=n.callee,local=c.type==='Identifier'?c.name:c.type==='MemberExpression'&&c.object.type==='Identifier'?c.object.name:undefined,i=imports.get(local);
   if(i&&!shadow.has(local)){
    const member=c.type==='Identifier'?i.imported:!c.computed&&i.namespace?c.property.name:undefined;
    const kind=i.from==='node:path'&&member==='resolve'?'backendResolve':i.from==='node:os'&&member==='homedir'?'backendHomeDir':undefined;
    if(kind){edits.push({start:c.start,end:c.end,text:'__reaScope.'+kind});scoped=true;}
   }
  }
  for(const [k,v]of Object.entries(n)){if(['loc','comments','tokens','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>scopedVisit(x,shadow));else if(v&&typeof v==='object')scopedVisit(v,shadow);}
 }
 scopedVisit(ast.program,new Set());
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 if(scoped)source='import * as __reaScope from '+JSON.stringify(native)+';\n'+source;
 return source;
}
for(let i=0;i<queue.length;i++){
 const rel=path.posix.normalize(queue[i]);if(seen.has(rel))continue;seen.add(rel);
 if(rel.startsWith('../')||rel.includes('/mcp/')||/^dist\/(?:cli\/|cli-runtime\/|cli\.js$)/.test(rel)||/dist\/(?:main\/|main\.js|server\/(?:EvidenceMcpServer|RequestTrackingMcpServer|DeferredEvidenceMcpServer))/.test(rel))throw Error('Rejected service boundary '+rel);
 const input=path.join(original,rel);if(!fs.existsSync(input)||!fs.statSync(input).isFile())throw Error('Missing helper '+rel);originals[rel]=hash(input);
 if(!/\.[cm]?js$/.test(rel)){ported[rel]=fs.readFileSync(input);continue;}
 let source=transform(rel,read(input));if(rel==='dist/server/createServer.js')source=source.replace('Construct one MCP server without acquiring subprocess resources.','Construct the embedded backend registry without acquiring subprocess resources.');
 if(source!==read(input))changes.push(rel);ported[rel]=Buffer.from(source);
 const ast=parser.parse(source,{sourceType:'unambiguous'});
 const add=spec=>{if(spec.startsWith('.')){if(spec===nativeRel(rel))return;queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel),spec)));}else if(spec.startsWith('#')){const value=upstreamPackage.imports[spec];if(typeof value!=='string')throw Error('Unknown backend import map '+spec);queue.push(value.replace(/^\.\//,''));}else if(!spec.startsWith('node:')&&!builtinModules.includes(spec))external.add(spec);};
 walk(ast.program,n=>{
  if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration','ImportExpression'].includes(n.type)&&n.source?.type==='StringLiteral')add(n.source.value);
  if(n.type==='CallExpression'&&(n.callee?.type==='Import'||n.callee?.name==='require')&&n.arguments[0]?.type==='StringLiteral')add(n.arguments[0].value);
  if(n.type==='CallExpression'&&n.callee?.type==='MemberExpression'&&n.callee.property?.name==='resolve'&&n.callee.object?.type==='MetaProperty'&&n.arguments[0]?.type==='StringLiteral')add(n.arguments[0].value);
  if(n.type==='NewExpression'&&n.callee?.name==='URL'&&n.arguments[0]?.type==='StringLiteral'&&n.arguments[1]?.object?.type==='MetaProperty'){
   const asset=path.posix.normalize(path.posix.join(path.posix.dirname(rel),n.arguments[0].value));resources.push({from:rel,path:asset});queue.push(asset);
  }
 });
}
if(external.has('@modelcontextprotocol/server'))throw Error('REA transport dependency survived');
const blocked=new Set(['rea-agents','frida','electron','@modelcontextprotocol/server']),packages=new Map();
function packageRoot(name,from){for(let dir=from;;dir=path.dirname(dir)){const p=path.join(dir,'node_modules',...name.split('/'));if(fs.existsSync(path.join(p,'package.json'))&&json(path.join(p,'package.json')).name===name)return p;if(path.dirname(dir)===dir)throw Error('Missing cached dependency '+name);}}
function collect(name,from,optional=false){if(blocked.has(name))return;let p;try{p=packageRoot(name,from);}catch(e){if(optional)return;throw e;}const pkg=json(path.join(p,'package.json')),key=path.relative(path.join(root,'defaults/rea/node_modules'),p).replace(/\\/g,'/');if(key.startsWith('../'))throw Error('Dependency outside source tree');if(packages.has(key))return;packages.set(key,{name,path:p,version:pkg.version,license:pkg.license});for(const child of Object.keys(pkg.dependencies??{}))collect(child,p);for(const child of Object.keys(pkg.optionalDependencies??{}))collect(child,p,true);}
for(const spec of external){const parts=spec.split('/');collect(spec.startsWith('@')?parts.slice(0,2).join('/'):parts[0],original);}
for(const [key,pkg]of packages){const dest=path.join(deps,...key.split('/'));if(!fs.existsSync(dest)){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(pkg.path,dest,{recursive:true,filter:p=>path.basename(p)!=='node_modules'&&!fs.lstatSync(p).isSymbolicLink()});}if(json(path.join(dest,'package.json')).version!==pkg.version)throw Error('Cache version mismatch '+key);}
for(const [rel,bytes]of Object.entries(ported)){const out=path.join(target,'vendor',rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,bytes);}
fs.copyFileSync(path.join(task,'inputs/context.mjs'),path.join(target,'native/context.mjs'));
const pkg=json(path.join(target,'package.json'));pkg.imports=Object.fromEntries(Object.entries(upstreamPackage.imports).map(([k,v])=>[k,'./vendor/'+v.replace(/^\.\//,'')]));fs.writeFileSync(path.join(target,'package.json'),JSON.stringify(pkg,null,2)+'\n');
Object.assign(provenance,{originals,adaptedFiles:changes,resources,packages:Object.fromEntries([...packages].map(([k,p])=>[k,{name:p.name,version:p.version,license:p.license}])),requiredRegistrySurface:[...requiredMethods].sort(),resourceClosure:'Entire backend bridge helper tree, declared worker import aliases, notices and third-party license metadata; no CLI, distribution bundle or external engine',ambientPathAdaptation:'Binding-aware node:path resolve and node:os homedir calls; no global chdir/env writes. Runtime isolation is not tested.'});
fs.writeFileSync(path.join(target,'PROVENANCE.json'),JSON.stringify(provenance,null,2)+'\n');
const lockPath=path.join(root,'defaults/rea/package-lock.json'),originalLock=json(lockPath),locked={format:1,source:'official rea-agents 6.8.0 npm installation lock',originalLockSha256:hash(lockPath),packages:{}};
function treeDigest(dir){const rows=[];function visit(d,prefix=''){for(const e of fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){if(e.isSymbolicLink())throw Error('Linked dependency refused');const file=path.join(d,e.name),rel=prefix+e.name;if(e.isDirectory())visit(file,rel+'/');else if(e.isFile())rows.push(rel+'\0'+hash(file));}}visit(dir);return digest(rows.join('\n'));}
for(const [key,p]of packages){const metadata=originalLock.packages['node_modules/'+key];if(!metadata||metadata.version!==p.version)throw Error('Original locked package missing '+key);locked.packages[key]={...metadata,treeSha256:treeDigest(path.join(deps,...key.split('/'))),assetRoot:key.startsWith('rea-agents/node_modules/')?'vendor/node_modules/'+key.slice('rea-agents/node_modules/'.length):'node_modules/'+key};}
fs.writeFileSync(path.join(target,'DEPENDENCIES.lock.json'),JSON.stringify(locked,null,2)+'\n');
fs.writeFileSync(path.join(root,'upstream/rea-backend-deps/package.json'),JSON.stringify({private:true,description:'Necessary build dependency cache only, not an executable REA package',dependencies:Object.fromEntries([...packages].filter(([k])=>!k.includes('/node_modules/')).map(([k,p])=>[k,p.version]))},null,2)+'\n');
Object.assign(state,{state:'native_wiring_complete_assets_pending',sourceHashesUnchanged:false,resourceRepairCompleted:true,backendModules:Object.keys(ported).length,adaptedFiles:changes,dependencyPackages:packages.size,blocker:null,updatedAt:new Date().toISOString()});fs.writeFileSync(statePath,JSON.stringify(state,null,2));
console.log(JSON.stringify({backendFiles:Object.keys(ported).length,dependencyPackages:packages.size,workerImports:pkg.imports,privateZod:locked.packages['rea-agents/node_modules/zod']?.assetRoot,mistake,mistakeRef,productStarted:false,functionalTestsRun:false},null,2));
