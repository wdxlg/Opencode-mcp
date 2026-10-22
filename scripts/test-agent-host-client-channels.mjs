// Actual registration and registry source, isolated in-memory IPC peers. No model/network calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,'recovered/esm',p),'utf8');
const host=read('011-agentHostMain.js/module-0043.mjs');
const main=read('006-main.js/module-0334.mjs');
const contextMatch=main.match(/new Client\d*\(port, "([^"]+)"\)/);
assert(contextMatch,'Main-process IPC identity must remain discoverable');
const managementId=contextMatch[1];
const begin=host.indexOf('      const authorityRegistrations =');
const end=host.indexOf('      server.registerChannel("agentHostProtocol"',begin);
assert(begin>=0&&end>begin,'Use the actual registration block, not a reimplementation');
const block=host.slice(begin,end);
const registrySource=read('011-agentHostMain.js/module-0178.mjs');
const registryText=registrySource.slice(registrySource.indexOf('var ByokLmBridgeRegistry ='),registrySource.lastIndexOf('export {'));
const bridgeSource=read('011-agentHostMain.js/module-0585.mjs');
const bridgeText=bridgeSource.slice(bridgeSource.indexOf('function createAgentHostClientByokLmConnection('),bridgeSource.indexOf('var AgentHostClientByokLmChannel'));
function toDisposable(fn){let live=true;return {dispose(){if(live){live=false;fn();}}};}
class DisposableStore {
 constructor(){this.values=[];this.isDisposed=false;}
 add(value){if(this.isDisposed)value.dispose();else this.values.push(value);return value;}
 dispose(){if(this.isDisposed)return;this.isDisposed=true;for(const value of this.values.splice(0).reverse())value.dispose();}
}
function windowPeer(id,models){
 const listeners=new Set(),calls=[];let snapshot=models;
 const peer={ctx:id,listeners,calls,setModels(next){snapshot=next;for(const fn of [...listeners])fn(next);}};
 peer.channel={listen(name){assert.equal(name,'models');return fn=>{listeners.add(fn);if(snapshot!==undefined)fn(snapshot);return toDisposable(()=>listeners.delete(fn));};},call(name,request){calls.push({name,request});return Promise.resolve({from:id,request});}};
 return peer;
}
function fixture(initial=[]){
 const changes=new Set(),removals=new Set(),peers=[...initial],warnings=[],requested=[],proxyEntries=new Map(),closed=[];
 const Registry=vm.runInNewContext(registryText+';ByokLmBridgeRegistry',{DisposableStore,toDisposable});
 const registry=new Registry();
 const createByok=vm.runInNewContext(bridgeText+';createAgentHostClientByokLmConnection',{});
 const server={connections:peers,onDidAddConnection(fn){changes.add(fn);return toDisposable(()=>changes.delete(fn));},onDidRemoveConnection(fn){removals.add(fn);return toDisposable(()=>removals.delete(fn));},getChannel(name,match){
  const peer=peers.find(match);assert(peer);requested.push({id:peer.ctx,name});
  if(name==='proxy')return {peer};
  if(peer.channel)return peer.channel;
  return {listen(){return ()=>{warnings.push('Unknown channel: agentHostClientByokLm');return toDisposable(()=>{});};}};
 }};
 const lifecycle=new DisposableStore();
 const context={Map,DisposableStore,toDisposable,server,localDataPlaneDisposables:lifecycle,byokLmBridgeRegistry:registry,
  proxyResolver:{register(id,connection){proxyEntries.set(id,connection);return toDisposable(()=>proxyEntries.delete(id));}},
  createAgentHostClientProxyConnection:channel=>channel,createAgentHostClientByokLmConnection:createByok,
  AGENT_HOST_CLIENT_PROXY_CHANNEL:'proxy',AGENT_HOST_CLIENT_BYOK_LM_CHANNEL:'agentHostClientByokLm',
  messagePortProtocolServer:{closeClient(id){closed.push(id);}}
 };
 const registrations=vm.runInNewContext('(()=>{'+block+';return authorityRegistrations;})()',context);
 return {registry,warnings,requested,proxyEntries,registrations,lifecycle,closed,
  connect(peer){peers.push(peer);for(const fn of changes)fn(peer);},
  notifyAgain(peer){for(const fn of changes)fn(peer);},
  disconnect(peer){peers.splice(peers.indexOf(peer),1);for(const fn of removals)fn(peer);}
 };
}
test('existing main-process management connection is not treated as a window',()=>{
 const f=fixture([{ctx:managementId}]);
 assert.deepEqual(f.warnings,[]);assert.equal(f.requested.length,0);assert.equal(f.proxyEntries.size,0);assert.equal(f.registrations.size,0);
 f.lifecycle.dispose();
});
test('a later management connection is also excluded, not merely startup enumeration',()=>{
 const f=fixture();f.connect({ctx:managementId});assert.equal(f.requested.length,0);assert.deepEqual(f.warnings,[]);f.lifecycle.dispose();
});
test('real window model updates and chat forwarding still work',async()=>{
 const f=fixture([{ctx:managementId}]);const first=[{vendor:'fixture',id:'one',name:'One'}];const peer=windowPeer('window-A',first);f.connect(peer);
 assert.equal(f.registry.getModels(),first);assert.equal(f.proxyEntries.size,1);assert.equal(peer.listeners.size,1);
 const next=[{vendor:'fixture',id:'two',name:'Two'}];peer.setModels(next);assert.equal(f.registry.getModels(),next);
 const request={message:'in-memory fixture only'};const result=await f.registry.getServingConnection().chat(request);
 assert.equal(result.from,'window-A');assert.equal(peer.calls.length,1);assert.equal(peer.calls[0].name,'chat');assert.equal(peer.calls[0].request,request);
 assert.deepEqual(f.warnings,[]);f.lifecycle.dispose();assert.equal(peer.listeners.size,0);
});
test('duplicate notification, disconnect and reconnect do not leak subscriptions',()=>{
 const f=fixture(),peer=windowPeer('window-A',[{id:'old'}]);f.connect(peer);f.notifyAgain(peer);assert.equal(peer.listeners.size,1);
 f.disconnect(peer);assert.equal(peer.listeners.size,0);assert.equal(f.proxyEntries.size,0);assert.equal(f.registrations.size,0);assert.equal(f.registry.getModels().length,0);
 const replacement=windowPeer('window-A',[{id:'new'}]);f.connect(replacement);assert.equal(f.registry.getModels()[0].id,'new');peer.setModels([{id:'stale'}]);assert.equal(f.registry.getModels()[0].id,'new');f.lifecycle.dispose();
});
test('non-serving windows cannot shadow a populated window',()=>{
 const a=windowPeer('window-without-handler',undefined),b=windowPeer('serving-window',[{id:'available'}]);const f=fixture([a,b,{ctx:managementId}]);
 assert.equal(f.registry.getModels()[0].id,'available');assert.deepEqual(f.warnings,[]);f.lifecycle.dispose();
});
test('invalid client contexts remain ignored and disposal removes live registrations',()=>{
 const f=fixture([{ctx:''},{ctx:null},{ctx:42},windowPeer('window-A')]);assert.equal(f.registrations.size,1);f.lifecycle.dispose();assert.equal(f.registrations.size,0);assert.equal(f.proxyEntries.size,0);
});
