// OpenCode-owned native toolset. No REA process, listener, SDK client/server or private Node.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
export const REA_RELEASE=Object.freeze({version:'6.8.0',architecture:'embedded-native-backend',license:'MIT',repository:'https://github.com/morluto/rea'});
const WORKFLOW={name:'rea_workflow',title:'REA guided workflows',description:'List/render backend workflow templates or complete their arguments in this caller\'s analysis session. REA tool references use backend names: call those tools with the rea_ prefix.',inputSchema:{type:'object',required:['operation'],properties:{operation:{type:'string',enum:['list','render','complete']},name:{type:'string'},kind:{type:'string',enum:['document','procedure','provider','evidence','capture','manifest','occurrence','unknown']},value:{type:'string'},arguments:{type:'object',additionalProperties:{type:'string'}}},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}};
// OpenCode: compact tool surface. The full catalog (230 tools, ~4.6MB of schemas) is no longer listed by default;
// rea_catalog lists/describes tools and rea_call invokes any of them. Direct rea_<name> calls still work.
// Set "toolSurface": "full" in <storage>/rea-backend/config.json to list every tool again.
const CATALOG={name:'rea_catalog',title:'REA tool catalog',description:'List the embedded REA reverse-engineering tools (operation=list, optional query filter) or get one tool\'s full description and input schema (operation=describe, name). Then run it with rea_call, or call rea_<name> directly.',inputSchema:{type:'object',required:['operation'],properties:{operation:{type:'string',enum:['list','describe']},name:{type:'string',description:'Tool name, with or without the rea_ prefix (describe).'},query:{type:'string',description:'Case-insensitive filter on name/description (list).'}},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}};
const CALL={name:'rea_call',title:'Run an REA tool',description:'Run any embedded REA tool by name with its arguments. Use rea_catalog describe first to get the input schema.',inputSchema:{type:'object',required:['name'],properties:{name:{type:'string',description:'Tool name, with or without the rea_ prefix.'},arguments:{type:'object',description:'Arguments matching the tool\'s input schema.'}},additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:true}};
const reaName=n=>{n=String(n??'');return n.startsWith('rea_')?n:'rea_'+n;};
const firstLine=d=>{const t=String(d??'').split('\n')[0];return t.length>160?t.slice(0,157)+'...':t;};
export class ReaBackendTools {
 constructor({extensionPath,storagePath,trusted,log=()=>{}}){
  if(!path.isAbsolute(storagePath??''))throw Error('REA_PROFILE_REQUIRED');
  this.base=path.join(extensionPath,'defaults','rea-backend');this.storage=path.join(storagePath,'rea-backend');this.trusted=trusted;this.log=log;
  const catalog=read(path.join(this.base,'catalog.json'));if(catalog.version!=='6.8.0'||catalog.tools.length!==229)throw Error('REA_CATALOG_INVALID');
  this.names=catalog.tools.map(t=>t.name);
  this.definitions=catalog.tools.map(t=>({...t,name:'rea_'+t.name,description:t.description+'\nEmbedded OpenCode backend. Tool references returned by REA use backend names; call them with rea_ prefix. External engines are user supplied.'}));
  this.definitions.push(WORKFLOW);this.byName=new Map(this.definitions.map(t=>[t.name,t]));if(this.byName.size!==230)throw Error('REA_TOOL_NAME_COLLISION');
  this.byName.set(CATALOG.name,CATALOG);this.byName.set(CALL.name,CALL);this.compactDefinitions=[WORKFLOW,CATALOG,CALL];
 }
 sessions=new Map();disposed=false;
 definitionsForHost(){if(!this.trusted()||this.disposed)return [];return this.fullSurface()?[...this.definitions,CATALOG,CALL]:this.compactDefinitions;}
 fullSurface(){try{const p=path.join(this.storage,'config.json');return fs.existsSync(p)&&read(p).toolSurface==='full';}catch{return false;}}
 catalog(args){
  if(args?.operation==='describe'){const t=this.byName.get(reaName(args.name));if(!t||t===CATALOG||t===CALL)throw Error('REA_UNKNOWN_NATIVE_TOOL: '+args?.name);return {name:t.name,title:t.title,description:t.description,inputSchema:t.inputSchema,annotations:t.annotations};}
  const q=String(args?.query??'').toLowerCase();
  const tools=this.definitions.filter(t=>!q||t.name.toLowerCase().includes(q)||String(t.description??'').toLowerCase().includes(q)).map(t=>({name:t.name,summary:firstLine(t.description)}));
  return {count:tools.length,tools};
 }
 hasBinding(name){return this.byName.has(name);}
 definition(name){return this.byName.get(name);}
 async entry(owner){
  if(this.disposed||!this.trusted())throw Error('REA_WORKSPACE_NOT_TRUSTED');
  if(typeof owner!=='string'||!owner)throw Error('REA_OWNER_REQUIRED');
  let entry=this.sessions.get(owner);if(entry){if(entry.closing)throw Error('REA_SESSION_CLOSING');return entry;}
  if(this.sessions.size>=32)throw Error('REA_SESSION_CAPACITY: close an existing caller session first');
  const root=path.join(this.storage,'sessions',crypto.createHash('sha256').update(owner).digest('hex'));
  entry={root,controller:new AbortController(),calls:new Set(),closing:false};this.sessions.set(owner,entry);
  entry.ready=(async()=>{
   fs.mkdirSync(root,{recursive:true,mode:0o700});
   let config={};const configPath=path.join(this.storage,'config.json');if(fs.existsSync(configPath))config=read(configPath);
   const overrides=config.environment??{};if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)||Object.entries(overrides).some(([k,v])=>!/^REA_[A-Z0-9_]+$|^(?:GHIDRA_INSTALL_DIR|JAVA_HOME|HOPPER_LAUNCHER_PATH)$/.test(k)||typeof v!=='string'))throw Error('REA_CONFIG_INVALID: environment must contain supported string-valued engine settings');
   const environment={...process.env,...overrides,HOME:root,USERPROFILE:root,APPDATA:path.join(root,'config'),LOCALAPPDATA:path.join(root,'local'),XDG_CONFIG_HOME:path.join(root,'config'),XDG_DATA_HOME:path.join(root,'data'),XDG_STATE_HOME:path.join(root,'state'),TMPDIR:root,TMP:root,TEMP:root,XDG_CACHE_HOME:path.join(root,'cache'),ELECTRON_RUN_AS_NODE:'1',OPENCODE_REA_PROFILE_ROOT:root};
   const {createEmbeddedBackend}=await import(pathToFileURL(path.join(this.base,'native','entry.mjs')).href);
   entry.backend=await createEmbeddedBackend({root,environment,catalogNames:this.names,fridaModule:config.fridaModule});
   return entry.backend;
  })();
  // Keep ownership of failed construction until the invocation observes its failure.
  return entry;
 }
 async call(name,args,signal,owner,onProgress){
  if(!this.hasBinding(name))throw Error('REA_UNKNOWN_NATIVE_TOOL');
  if(name==='rea_catalog'){const value=this.catalog(args??{});return {content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value};}
  if(name==='rea_call'){const inner=reaName(args?.name);if(inner==='rea_call'||inner==='rea_catalog'||!this.hasBinding(inner))throw Error('REA_UNKNOWN_NATIVE_TOOL: '+args?.name);return this.call(inner,args?.arguments??{},signal,owner,onProgress);}
  const entry=await this.entry(owner);if(entry.closing)throw Error('REA_SESSION_CLOSING');
  const linked=signal?AbortSignal.any([signal,entry.controller.signal]):entry.controller.signal;
  const call=Promise.resolve().then(async()=>{
   const backend=await entry.ready;linked.throwIfAborted();
   if(name==='rea_workflow'){
    if(args.operation==='render'&&!args.name)throw Error('REA_WORKFLOW_NAME_REQUIRED');
    if(args.operation==='complete'&&!args.kind)throw Error('REA_COMPLETION_KIND_REQUIRED');
    const value=await backend.workflow(args,linked);return {content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value};
   }
   return backend.call(name.slice(4),args,linked,onProgress);
  });
  entry.calls.add(call);try{return await call;}finally{entry.calls.delete(call);}
 }
 async closeOwner(owner){
  const entry=this.sessions.get(owner);if(!entry)return;
  if(entry.closePromise)return entry.closePromise;
  entry.closing=true;entry.controller.abort();
  entry.closePromise=(async()=>{
   await Promise.allSettled([...entry.calls]);
   let backend;try{backend=await entry.ready;}catch{this.sessions.delete(owner);return;}
   await backend.close();this.sessions.delete(owner);
  })().catch(error=>{entry.closePromise=undefined;this.log('[rea-native] cleanup incomplete; caller ownership retained');throw error;});
  return entry.closePromise;
 }
 async closeAll(){const results=await Promise.allSettled([...this.sessions.keys()].map(owner=>this.closeOwner(owner)));if(results.some(r=>r.status==='rejected'))throw Error('REA_CLEANUP_INCOMPLETE');}
 async dispose(){this.disposed=true;await this.closeAll();}
}
// Only retire the exact unmodified 6.8 record created by our rejected previous integration.
// Customized/disabled/retargeted records, secrets and the older 6.4 migration remain untouched.
export async function initializeBundledRea(context,catalog,log=()=>{}){
 await catalog.exclusive(async()=>{
  const current=catalog.snapshot(),server=current.servers.find(s=>s.id==='rea'),marker=context.globalState.get('bundledReaNativeOwnerV1');
  if(!server||!marker||marker.version!==1||!same(server,marker.server))return;
  if(!server.argsRef||Object.keys(server.envRefs??{}).join(',')!=='OPENCODE_REA_STATE_ROOT')return;
  let args,stateRoot;try{[args,stateRoot]=await Promise.all([context.secrets.get(server.argsRef),context.secrets.get(server.envRefs.OPENCODE_REA_STATE_ROOT)]);}catch{return;}
  if(args!==marker.args||stateRoot!==marker.stateRoot)return;
  const key='retiredBundledReaNativeV1',backup=context.globalState.get(key);
  if(backup&&!same(backup,{version:1,server,marker}))return;
  if(!backup)await context.globalState.update(key,{version:1,server,marker});
  catalog.save(current.servers.filter(s=>s!==server));log('[defaults] retired verified owned REA subprocess registration; native backend tools replace it');
 });
}
