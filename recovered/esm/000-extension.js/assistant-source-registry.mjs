// Native or paired-assistant provenance, not model identity or an authorization grant.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
const PARAM='arena_source',MAX=512;
const hash=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const clean=(value,max=256)=>{if(typeof value!=='string'||!value.trim()||value.length>max||/[\x00-\x1f\x7f]/.test(value))throw Error('Invalid assistant source metadata');return value.trim();};
const key=value=>{const v=clean(value,180);if(!/^[A-Za-z0-9_.:-]+$/.test(v))throw Error('Invalid assistant source identifier');return v;};
function scopeTarget(value){const u=new URL(value,'http://bridge.invalid');const pairs=u.search.slice(1).split('&').filter(Boolean).filter(p=>decodeURIComponent(p.split('=')[0])!==PARAM);return hash(u.pathname+(pairs.length?'?'+pairs.join('&'):''));}
export function createAssistantSourceRegistry(context,{enabled,currentContext=()=>null,changed=()=>{}}){
 const file=path.join(context.globalStorageUri.fsPath,'assistant-source-bindings.v1.json'),aliases=new Map();
 function read(){let bytes;try{bytes=fs.readFileSync(file);}catch(e){if(e.code==='ENOENT')return {version:1,records:[]};throw e;}
  if(bytes.length>2*1024*1024)throw Error('Assistant source registry exceeds budget');const v=JSON.parse(bytes.toString('utf8'));
  if(v?.version!==1||!Array.isArray(v.records)||v.records.length>MAX)throw Error('Invalid assistant source registry; retained unchanged');return v;
 }
 async function write(value){await fs.promises.mkdir(path.dirname(file),{recursive:true});const temp=file+'.'+crypto.randomUUID()+'.tmp';try{await fs.promises.writeFile(temp,JSON.stringify(value,null,2)+'\n',{encoding:'utf8',flag:'wx',mode:0o600});await fs.promises.rename(temp,file);}finally{await fs.promises.rm(temp,{force:true}).catch(()=>{});}}
 function publicSource(record){const scope=currentContext();if(!record||record.revoked||!enabled()||!scope||record.windowId!==scope.windowId||record.workspaceId!==scope.workspaceId)return null;const stale=record.unavailable===true||Date.now()-record.updatedAt>120000;
  return {kind:'arena-model-assistant',bindingId:record.id,instanceId:record.instanceId,conversationId:record.conversationId,instanceName:record.instanceName,conversationName:record.conversationName||'对话标题待同步',titlePending:!record.conversationName,displayName:record.instanceName+' / '+(record.conversationName||'对话标题待同步'),lastSyncAt:record.updatedAt,stale,provenance:record.provenance||'paired-assistant-binding',aiIdentityVerified:false};
 }
 return {
  async issue({authorityId,workspaceId,windowId,address,sources=[],revoked=[],provenance='paired-assistant-binding'}){
    if(!enabled()&&provenance!=='local-assistant-binding'&&Array.isArray(revoked)&&!revoked.length)return {protocol:1,enabled:false,bindings:[],revokedAccepted:[]};
   authorityId=key(authorityId);workspaceId=key(workspaceId);windowId=key(windowId);
   if(!['paired-assistant-binding','local-assistant-binding'].includes(provenance))throw Error('Invalid assistant source provenance');
   const url=new URL(address);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.hash||url.searchParams.has(PARAM))throw Error('Invalid source publisher endpoint');
   if(!Array.isArray(sources)||sources.length>64||!Array.isArray(revoked)||revoked.length>64)throw Error('Assistant source budget exceeded');
   const drafts=sources.map(s=>({registrationId:key(s.registrationId),instanceId:key(s.instanceId),conversationId:key(s.conversationId),instanceName:clean(s.instanceName,200),conversationName:s.conversationName?clean(s.conversationName,500):'',unavailable:s.unavailable===true}));
   if(new Set(drafts.map(x=>x.registrationId)).size!==drafts.length)throw Error('Duplicate source registration');
   const result=await withResourceLocks([file],async()=>{
    const active=enabled()||provenance==='local-assistant-binding';const data=read(),bindings=[];if(!active)drafts.length=0;
    for(const draft of drafts){
     const id=hash(authorityId+'\0'+windowId+'\0'+workspaceId+'\0'+draft.registrationId),prior=data.records.find(x=>x.id===id);
     if(prior&&(prior.instanceId!==draft.instanceId||prior.conversationId!==draft.conversationId))throw Error('Source identity cannot be retargeted');
    }
    for(const draft of drafts){
     const id=hash(authorityId+'\0'+windowId+'\0'+workspaceId+'\0'+draft.registrationId);let record=data.records.find(x=>x.id===id);
     if(record?.revoked)continue;
     if(!record){if(data.records.length>=MAX)throw Error('Assistant source registry is full');record={id,authorityId,workspaceId,windowId,registrationId:draft.registrationId,secretRef:'opencode.assistantSource.'+id,createdAt:Date.now()};data.records.push(record);}
     let token=await context.secrets.get(record.secretRef);if(!token||!/^[a-f0-9]{64}$/.test(token)){token=crypto.randomBytes(32).toString('hex');await context.secrets.store(record.secretRef,token);}
     Object.assign(record,draft,{provenance,tokenHash:hash(token),targetScope:scopeTarget(address),unavailable:draft.unavailable});
     if(!draft.unavailable)record.updatedAt=Date.now();
     bindings.push({registrationId:record.registrationId,bindingId:id,address:address+(address.includes('?')?'&':'?')+PARAM+'='+token});
    }
    for(const requested of revoked){const registrationId=key(requested);for(const record of data.records)if(record.authorityId===authorityId&&record.windowId===windowId&&record.workspaceId===workspaceId&&record.registrationId===registrationId&&!record.revoked){record.revoked=true;record.revokedAt=Date.now();await context.secrets.delete(record.secretRef);}}
    await write(data);return {protocol:1,enabled:active,bindings,revokedAccepted:revoked.map(key)};
   });changed();return result;
  },
   async recordConnection(binding) {
    // Called only by authenticated MCP transport events, never by source issuance.
    if(!binding?.bindingId || !/^[a-f0-9]{64}$/.test(binding.endpointGeneration||''))return;
    await withResourceLocks([file],async()=>{
     const data=read(),record=data.records.find(x=>x.id===binding.bindingId&&!x.revoked);
     if(!record)return;
     const receipts=Array.isArray(record.connections)?record.connections:[];
     if(receipts.some(x=>x.generation===binding.endpointGeneration))return;
     if(receipts.length>=128){record.connectionHistoryIncomplete=true;await write(data);return;}
     receipts.push({generation:binding.endpointGeneration,confirmedAt:Date.now(),evidence:'authenticated-mcp-transport-v1'});
     record.connections=receipts;await write(data);
    });
   },
   connectionHistory({workspaceId,instanceId,conversationId}) {
    // Only exact native identities in this workspace; never infer from URL/name/IP.
    const records=read().records.filter(x=>!x.revoked&&x.workspaceId===workspaceId&&x.instanceId===instanceId&&x.conversationId===conversationId);
    if(records.some(x=>x.connectionHistoryIncomplete))return [];
    return records.flatMap(x=>Array.isArray(x.connections)?x.connections:[])
     .filter(x=>x.evidence==='authenticated-mcp-transport-v1'&&/^[a-f0-9]{64}$/.test(x.generation)&&Number.isFinite(x.confirmedAt));
   },
   resolveRequest(request,address){
   const u=new URL(request.url||'/','http://bridge.invalid'),values=u.searchParams.getAll(PARAM);if(!values.length)return null;
   if(values.length!==1||!/^[a-f0-9]{64}$/.test(values[0]))throw Error('Invalid assistant source capability');
   const scope=currentContext();const digest=hash(values[0]),record=read().records.find(x=>scope&&x.windowId===scope.windowId&&x.workspaceId===scope.workspaceId&&!x.revoked&&x.tokenHash===digest&&x.targetScope===scopeTarget(request.url||'/'));
    if(!record)throw Error('Assistant source capability is unknown or revoked');
    // Require the actual routed Host, not client-supplied metadata or forwarded headers.
    // If the tunnel rewrites Host, evidence is unavailable: fail closed rather than guess.
    let endpointGeneration=null;try{if(address&&String(request.headers?.host||'').toLowerCase()===new URL(address).host.toLowerCase())endpointGeneration=hash(address);}catch{}
    return {bindingId:record.id,endpointGeneration};
  },
  bindOwner(owner,binding){if(!binding)return;if(typeof owner!=='string'||!owner)throw Error('Invalid source owner');if(aliases.size>2048)aliases.delete(aliases.keys().next().value);aliases.set(owner,binding.bindingId);},
  sourceForOwner(owner){if(!enabled())return null;const id=aliases.get(owner);return id?publicSource(read().records.find(x=>x.id===id)):null;},
  sourceById(id){return enabled()?publicSource(read().records.find(x=>x.id===id)):null;},
  dispose(){aliases.clear();}
 };
}
