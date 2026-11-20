// Embedded backend entry: application services + direct handler registry. No REA transport/CLI.
import { createBackend } from '../vendor/dist/server/createServer.js';
import { createBinarySession } from '../vendor/dist/composition/binary.js';
import { AnalysisSettings } from '../vendor/dist/application/AnalysisSettings.js';
import { parseConfig } from '../vendor/dist/config/parseConfig.js';
import { createOptionalObservationFactories, loadOptionalObservationProviders } from '../vendor/dist/composition/optionalObservationProviders.js';
import { FridaInstrumentationManager } from '../vendor/dist/frida/FridaInstrumentationManager.js';
import { projectAnalysisError } from '../vendor/dist/domain/analysisErrorProjection.js';
import { AnalysisInputError } from '../vendor/dist/domain/analysisErrorCore.js';
import { runInBackendContext } from './context.mjs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const logger = Object.freeze({child(){return this;},trace(){},debug(){},info(){},warn(){},error(){},fatal(){}});
const parse = async (schema, value) => {
 if (!schema) return value;
 const standard = schema['~standard'];
 if (!standard?.validate) throw Error('REA_SCHEMA_UNSUPPORTED: missing standard validator');
 const result = await standard.validate(value);
 if (result.issues) throw Object.assign(Error('REA_INPUT_INVALID'), {issues:result.issues});
 return result.value;
};
class NativeHandlerRegistry {
 tools = new Map(); prompts = new Map(); server = {onclose:undefined}; pending = new Set(); sealed = false;
 attachRuntime(recordEvidence,delivery,identity){this.recordEvidence=recordEvidence;this.delivery=delivery;this.catalogIdentity=identity;}
 registerTool(name,config,callback){
  if(this.tools.has(name))throw Error('Duplicate REA handler: '+name);
  const entry={config,callback,enabled:true};this.tools.set(name,entry);
  return {enable(){entry.enabled=true;},disable(){entry.enabled=false;},update(patch){Object.assign(entry.config,patch);if(patch.callback)entry.callback=patch.callback;},remove:()=>this.tools.delete(name)};
 }
 registerCanonicalPrompt(name,config,callback){const entry={config,callback};this.prompts.set(name,entry);return {update(patch){Object.assign(entry.config,patch);if(patch.callback)entry.callback=patch.callback;}};}
 bindPromptCompletion(completion){this.promptCompletion=completion;return completion;}
 runRequest(signal,work){signal?.throwIfAborted();return work();}
 async invoke(name,args,context){
  if(this.sealed)throw Error('REA_SESSION_CLOSING');
  const entry=this.tools.get(name);if(!entry?.enabled)throw Error('REA_TOOL_UNAVAILABLE: '+name);
  const call=Promise.resolve().then(async()=>{
   context.mcpReq.signal.throwIfAborted();
   let input;
   try{input=await parse(entry.config.inputSchema,args);}catch(error){
    if(!error.issues)throw error;
    return this.delivery.toErrorToolResult(new AnalysisInputError(name,{},error.issues.map(issue=>({path:(issue.path??[]).map(p=>typeof p==='object'?p.key:p),reason:'invalid_format',message:issue.message}))),false);
   }
   const result=await this.analysisSettings.run(()=>entry.callback(input,context));
   if(!result||!Array.isArray(result.content))throw Error('REA_RESULT_INVALID: '+name);
   if(!result.isError&&entry.config.outputSchema){
    // The backend may use structuredContent solely as a private error/recovery carrier.
    if(result.structuredContent!==undefined)try{await parse(entry.config.outputSchema,result.structuredContent);}catch{throw Error('REA_OUTPUT_SCHEMA_INVALID: '+name);}
   }
   return result;
  });
  this.pending.add(call);try{return await call;}finally{this.pending.delete(call);}
 }
 async close(){this.sealed=true;await Promise.allSettled([...this.pending]);}
}
export async function createEmbeddedBackend({root,environment,catalogNames,fridaModule}){
 const state={root,environment};
 return runInBackendContext(state,async()=>{
  const parsed=parseConfig(environment);if(!parsed.ok)throw Error(projectAnalysisError(parsed.error).message);
  // Never open HOPPER_TARGET_PATH implicitly: targets are opened only by an explicit native tool call.
  const config={...parsed.value,hopperTargetPath:undefined};
  const settings=new AnalysisSettings(environment);
  const session=createBinarySession(config,logger,environment,settings.read);
  const registry=new NativeHandlerRegistry();
  const optional=await loadOptionalObservationProviders(createOptionalObservationFactories(environment,settings.read));
  const requireEngine=createRequire(path.join(root,'engines','package.json'));
  const frida=new FridaInstrumentationManager({deviceManagerLoader:async()=>{
   const selected=fridaModule??requireEngine.resolve('frida');
   if(!path.isAbsolute(selected))throw Error('REA_FRIDA_MODULE must resolve to an absolute external module');
   return (await import(pathToFileURL(selected).href)).getDeviceManager();
  }});
  let backend;
  try{
   backend=createBackend({kind:'session',session},{...optional,mcpServer:registry,environment,analysisSettings:settings,logger,fridaInstrumentation:frida});
   const actual=[...registry.tools.keys()].sort(),expected=[...catalogNames].sort();
   if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('REA_CATALOG_HANDLER_MISMATCH: embedded handlers differ from the pinned catalog');
  }catch(error){registry.sealed=true;await Promise.allSettled([backend?.close(),session.close(),frida.closeAll(),...Object.entries(optional).filter(([k,v])=>k!=='optionalProviderLoadFailures'&&typeof v?.close==='function').map(([,v])=>v.close())]);throw error;}
  return {
   async call(name,args,signal,onProgress){
    return runInBackendContext({...state,signal},()=>registry.invoke(name,args,{mcpReq:{signal,_meta:{progressToken:'native'},notify:async message=>onProgress?.(message.params?.message)}}));
   },
   async workflow(input,signal){return runInBackendContext({...state,signal},async()=>{
    if(input.operation==='list')return {prompts:[...registry.prompts].map(([name,v])=>({name,title:v.config.title,description:v.config.description}))};
    if(input.operation==='complete')return {values:await registry.promptCompletion.complete(input.kind,input.value??'',{arguments:input.arguments??{}})};
    const prompt=registry.prompts.get(input.name);if(!prompt)throw Error('REA_UNKNOWN_WORKFLOW');
    const args=await parse(prompt.config.argsSchema,input.arguments??{});return prompt.callback(args);
   });},
   async close(){registry.sealed=true;await Promise.allSettled([...registry.pending]);return runInBackendContext(state,async()=>{const results=await Promise.allSettled([backend.close(),session.close()]);const failures=results.filter(r=>r.status==='rejected');if(failures.length)throw new AggregateError(failures.map(r=>r.reason),'REA cleanup incomplete');});}
  };
 });
}
