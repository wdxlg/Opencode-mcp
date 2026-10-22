// Maintained project-side adapter. No account login, native Agents window or global service ownership.
import { createWorkbenchMcpPublisher } from './workbench-mcp-publisher.mjs';
const vscode=require('vscode');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
export function registerTaskWorkbench(context,output,bindings={}){
 let panel=null,current=null,publisher=null;
 const secretKey='arena.taskWorkbench.client',endpointKey='arena.taskWorkbench.endpoint';
 const workspace=()=>vscode.workspace.workspaceFolders?.[0]?.uri.fsPath||null;
 const canonical=p=>path.resolve(p).replaceAll('\\','/').replace(/\/$/,'').toLowerCase();
 async function credentials(){const endpoint=context.globalState.get(endpointKey),token=await context.secrets.get(secretKey);if(!endpoint||!token)throw Error('请先运行“任务工作台：配对本机服务”');const u=new URL(endpoint);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.username||u.password||u.pathname!=='/')throw Error('项目面板只连接明确配对的本机任务服务');return {endpoint:u.origin,token};}
 async function request(route,method='GET',body){
  if(typeof route!=='string'||!route.startsWith('/api/')||route.includes('..')||route.includes('\\')||route.includes('#'))throw Error('拒绝无效接口路径');
  const {endpoint,token}=await credentials();const r=await fetch(endpoint+route,{method,redirect:'error',headers:{Authorization:'Bearer '+token,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  const value=await r.json();if(!r.ok)throw Error(value.error?.message||'工作台请求失败');return value;
 }
 async function pair(){
  const endpoint=await vscode.window.showInputBox({title:'任务工作台：本机服务地址',value:'http://127.0.0.1:15920',ignoreFocusOut:true});if(!endpoint)return;
  let u;try{u=new URL(endpoint)}catch{throw Error('地址无效')}
  if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('请使用本机服务地址，不要粘贴 MCP 能力地址');
  const code=await vscode.window.showInputBox({title:'在模型助手工作台生成 OpenCode 配对码',prompt:'只输入两分钟内有效的一次性配对码，不输入模型密钥',password:true,ignoreFocusOut:true});if(!code)return;
  const r=await fetch(u.origin+'/api/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code}),signal:AbortSignal.timeout(10000)}),value=await r.json();if(!r.ok)throw Error(value.error?.message||'配对失败');if(value.role!=='editor')throw Error('此配对码不是项目编辑器权限');
  await context.secrets.store(secretKey,value.token);await context.globalState.update(endpointKey,u.origin);publisher?.publishSoon();vscode.window.showInformationMessage('已配对本机任务工作台；本窗口运行中的 MCP 将仅在已授权的同工作区范围自动发布，不会接管其他实例或启动模型请求。');if(panel)await load();
 }
 async function currentProject(){const root=workspace();if(!root)return null;const projects=await request('/api/projects');return projects.find(p=>canonical(p.root)===canonical(root))||null;}
 async function load(){
  if(!panel)return;current=await currentProject();panel.webview.postMessage({type:'init',config:{theme:'opencode',workspace:workspace(),projectId:current?.id||null}});
 }
 function restrict(route,method,body){
  if(['/api/me','/api/overview','/api/projects'].includes(route)&&method==='GET')return;
  // The webview is a project view, not an arbitrary remote request proxy. The server additionally enforces the token scope.
  const parsed=new URL(route,'http://local'),p=parsed.pathname;
  if(/^\/api\/(?:access|diagnostics|discovery)/.test(p)||/\/lifecycle\//.test(p)||/\/connections/.test(p))throw Error('全局实例、连接与授权操作请在模型助手工作台进行');
  const project=p.match(/^\/api\/projects\/([^/]+)/);if(project&&(!current||decodeURIComponent(project[1])!==current.id))throw Error('项目操作必须属于当前真实工作区');
  if(method!=='GET'&&body?.projectId&&(!current||body.projectId!==current.id))throw Error('任务的项目必须是当前工作区');
  if(!/^\/api\/(?:tasks|instances|conversations|projects|annotations|schedules|events|notes|search|summary)(?:\/|$)/.test(p))throw Error('项目面板不支持此接口');
 }
 async function open(){
  if(panel){panel.reveal();await load();return;}
  await credentials();const root=vscode.Uri.joinPath(context.extensionUri,'media','task-workbench');
  panel=vscode.window.createWebviewPanel('opencode.taskWorkbench','项目记忆与任务',vscode.ViewColumn.Beside,{enableScripts:true,retainContextWhenHidden:true,localResourceRoots:[root]});
  const html=fs.readFileSync(path.join(root.fsPath,'index.html'),'utf8'),style=panel.webview.asWebviewUri(vscode.Uri.joinPath(root,'style.css')),script=panel.webview.asWebviewUri(vscode.Uri.joinPath(root,'app.js'));
  const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} data:; style-src ${panel.webview.cspSource}; script-src ${panel.webview.cspSource}; connect-src 'none'; object-src 'none'; base-uri 'none'">`;
  panel.webview.html=html.replace('<head>','<head>'+csp).replace('href="style.css"','href="'+style+'"').replace('src="app.js"','src="'+script+'"');
  panel.onDidDispose(()=>{panel=null;current=null},null,context.subscriptions);
  panel.webview.onDidReceiveMessage(async message=>{
   try{
    if(message.type==='ready'){await load();return;}
    if(message.type==='api'){
     current=await currentProject();restrict(message.path,message.method,message.body);
     const taskMatch=message.path.match(/^\/api\/tasks\/([a-f0-9-]{36})(?:\/|$)/);
     if(taskMatch){const task=await request('/api/tasks/'+taskMatch[1]);if(current?task.project_id!==current.id:!!task.project_id)throw Error('此任务不属于当前项目/临时上下文');}
     let value=await request(message.path,message.method,message.body);
     if(message.path==='/api/overview'){value={...value,projects:current?[current]:[]};}
     if(message.path.startsWith('/api/tasks?')&&Array.isArray(value))value=value.filter(t=>current?t.project_id===current.id:!t.project_id);
     if(message.path.startsWith('/api/search?')&&Array.isArray(value))value=value.filter(t=>current?t.projectId===current.id:!t.projectId);
     if(message.path.startsWith('/api/summary?')){value.tasks=value.tasks.filter(t=>current?t.projectId===current.id:!t.projectId);value.counts={};for(const t of value.tasks)value.counts[t.state]=(value.counts[t.state]||0)+1;}
     if(message.path.startsWith('/api/events?')){const tasks=await request('/api/tasks?limit=500');const allowed=new Set(tasks.filter(t=>current?t.project_id===current.id:!t.project_id).map(t=>t.id));value.events=value.events.filter(e=>e.task_id?allowed.has(e.task_id):(current&&e.data?.projectId===current.id));}

     panel?.webview.postMessage({type:'api-result',id:message.id,value});return;
    }
    if(message.type==='saveArchive'){
     if(typeof message.data!=='string'||message.data.length>24*1024*1024)throw Error('档案过大');const dest=await vscode.window.showSaveDialog({saveLabel:'导出项目记忆',filters:{ZIP:['zip']}});if(dest)await vscode.workspace.fs.writeFile(dest,Buffer.from(message.data,'base64'));return;
    }
    if(message.type==='downloadAttachment'){
     if(typeof message.id!=='string'||!/^[a-f0-9-]{36}$/.test(message.id))throw Error('附件 ID 无效');const dest=await vscode.window.showSaveDialog({saveLabel:'保存任务附件'});if(!dest)return;const {endpoint,token}=await credentials();const r=await fetch(endpoint+'/api/attachments/'+message.id,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('附件读取失败或原文件已改变');const b=Buffer.from(await r.arrayBuffer());if(b.length>32*1024*1024)throw Error('附件过大');await vscode.workspace.fs.writeFile(dest,b);return;
    }
   }catch(e){if(message.type==='api')panel?.webview.postMessage({type:'api-result',id:message.id,error:String(e.message)});else vscode.window.showErrorMessage('任务工作台：'+String(e.message));}
  },null,context.subscriptions);
 }
 const safely=fn=>async()=>{try{await fn()}catch(e){vscode.window.showErrorMessage('任务工作台：'+String(e.message))}};
 const item=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,9);item.name='项目记忆与任务';item.text='$(notebook) 项目任务';item.tooltip='打开当前工作区的任务与项目记忆（不启动模型发送）';item.command='opencode.taskWorkbench.open';item.show();
 if(bindings.bridge&&bindings.workspaceHub)publisher=createWorkbenchMcpPublisher(context,{...bindings,request,onState:status=>{item.tooltip='当前工作区任务与项目记忆；'+status+'（不启动模型发送）';}});
 context.subscriptions.push(item,vscode.commands.registerCommand('opencode.taskWorkbench.open',safely(open)),vscode.commands.registerCommand('opencode.taskWorkbench.pair',safely(pair)),vscode.commands.registerCommand('opencode.taskWorkbench.disconnect',async()=>{await context.secrets.delete(secretKey);await context.globalState.update(endpointKey,undefined);panel?.dispose();vscode.window.showInformationMessage('项目面板已断开；后台任务没有被取消。')}),vscode.workspace.onDidChangeWorkspaceFolders(()=>{if(panel)load().catch(e=>vscode.window.showWarningMessage('任务工作台：'+e.message))}),{dispose(){panel?.dispose()}});
}
