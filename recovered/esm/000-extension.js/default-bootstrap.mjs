import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
import { initializeBundledWindowsMcp } from './windows-mcp-integration.mjs';
export async function initializeBundledDefaults(context,catalog,skillsDirectory,log){
 const root=path.join(context.extensionPath,'defaults');
 let manifest;try{manifest=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return;throw e;}
 // Shared Skills are user-owned and optional for Bridge startup. A fresh
 // recipient has no shared-skills.json; do not resolve or touch that library
 // while registering unrelated bundled MCP defaults. Skill operations retain
 // their own configuration/path checks in GlobalSkillSettings.
 // Persist only new, locally-generated references; never ship an existing credential store.
 const args=JSON.stringify([path.join(root,'rea-bridge.mjs')]);
 const stateRoot=path.join(context.globalStorageUri.fsPath,'rea-sessions');
 await catalog.exclusive(async()=>{
  const current=catalog.snapshot(),existing=current.servers.find(s=>s.id==='rea');
  const marker=context.globalState.get('bundledReaOwner');
  if(existing){
   if(marker&&existing.argsRef===marker.argsRef&&existing.command===marker.command&&await context.secrets.get(existing.argsRef)===marker.args){
    await context.secrets.store(existing.argsRef,args);existing.command=process.execPath;
    const stateRef=existing.envRefs?.OPENCODE_REA_STATE_ROOT;
    if(stateRef&&marker.stateRoot&&await context.secrets.get(stateRef)===marker.stateRoot)await context.secrets.store(stateRef,stateRoot);
    catalog.save(current.servers);
    await context.globalState.update('bundledReaOwner',{argsRef:existing.argsRef,args,command:process.execPath,stateRoot});
   }
   return; // Includes explicitly disabled or user-customized REA.
  }
  if(context.globalState.get('bundledReaInitialized'))return; // Respect a deliberate removal.
  const refs=[];const save=async value=>{const key='opencode.externalMcp.'+crypto.randomUUID();await context.secrets.store(key,value);refs.push(key);return key;};
  try{
   const server=await catalog.persistDraft({id:'rea',label:'REA 6.4.0 (bundled)',transport:'stdio',command:process.execPath,args:JSON.parse(args),env:{ELECTRON_RUN_AS_NODE:'1',OPENCODE_REA_STATE_ROOT:stateRoot},timeout:360},save,'bridge');
   catalog.save([...current.servers,server]);
   await context.globalState.update('bundledReaOwner',{argsRef:server.argsRef,args,command:process.execPath,stateRoot});
   await context.globalState.update('bundledReaInitialized',true);
  }catch(e){for(const ref of refs)await context.secrets.delete(ref);throw e;}
 });
  await initializeBundledWindowsMcp(context,catalog,log);
  log('[defaults] shared Skills remain user-configured; bundled Skills auto-copy disabled; bundled MCP defaults initialized');
}
