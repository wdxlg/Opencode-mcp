// Publish only this extension host's live, already-issued MCP address. Never read bridge secrets or construct an address.
export function createWorkbenchMcpPublisher(context, { bridge, workspaceHub, request, onState = () => {} }) {
 let disposed=false, busy=false, timer=null, state='waiting',unsubscribeSource=null;
 const labels={waiting:'等待当前工作区 MCP 启动',published:'本工作区 MCP 已发布到已配对模型助手',pending:'等待有效配对／同工作区授权／新版助手服务'};
 const setState=value=>{if(!disposed&&state!==value){state=value;try{onState(labels[value]||labels.pending)}catch{}}};
 async function publish(){
  if(disposed||busy)return;
  const workspace=workspaceHub?.store?.workspace, windowId=workspaceHub?.store?.windowId, status=bridge?.getStatus?.();
  if(!workspace?.id||workspace.id==='empty'||!workspace.folders?.length||!windowId||status?.state!=='running'||!status.publicUrl){setState('waiting');return;}
  // The bridge owns this exact URL, including its opaque route/query. Do not normalize or log it.
  const address=String(status.publicUrl);
  let parsed;try{parsed=new URL(address)}catch{setState('pending');return;}
  if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password){setState('pending');return;}
  busy=true;
  try{
   const sourceEnabled=bridge?.assistantSourceEnabled?.()===true;
   const value=await request('/api/mcp/announcements','POST',{workspaceId:String(workspace.id),windowId:String(windowId),address,expires:Date.now()+90000,sourceIdentityProtocol:1,sourceIdentityEnabled:sourceEnabled});
   if(value?.sourceIdentity?.protocol===1){
    const source=value.sourceIdentity;
    const issued=await bridge.publishAssistantSources({authorityId:source.authorityId,workspaceId:String(workspace.id),windowId:String(windowId),address,sources:sourceEnabled&&source.enabled?source.sources:[],revoked:source.revoked});
    if(issued.bindings.length||issued.revokedAccepted?.length)await request('/api/mcp/source-bindings','POST',{workspaceId:String(workspace.id),windowId:String(windowId),address,bindings:issued.bindings,revokedAccepted:issued.revokedAccepted});
   }
   setState('published');
  }catch{setState('pending');}finally{busy=false;}
 }
 const disposable={dispose(){disposed=true;if(timer)clearInterval(timer);unsubscribeSource?.();},publishSoon(){void publish();},getState(){return state;}};
 unsubscribeSource=bridge?.automation?.onDidChange?.(kind=>{if(kind==='collaboration-switch')void publish();});
 context.subscriptions.push(disposable);
 timer=setInterval(()=>{void publish()},20000);timer.unref?.();
 onState(labels.waiting);void publish();
 return disposable;
}
