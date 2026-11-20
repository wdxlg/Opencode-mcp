// Maintained native-theme workbench and explicitly started model workers.
// No model requests, terminals, tests or external instances start merely by opening it.
const vscode=require('vscode');
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';


import { NativeTaskWorkers } from './collaboration-workers.mjs';
import { ReviewStore, reviewDiffHash } from './collaboration-review.mjs';
import { listLocalBranches, inspectMerge, executeMerge } from './collaboration-merge.mjs';
import { isGoodHandoff } from './project-memory.mjs';
import { canvasConsole } from './canvas-console.mjs';
import { memberPromptLayer, memberRequestOptions, withFallbackModel, MEMBER_TOOL_CATEGORIES, MEMBER_CONFIRM_KINDS, MEMBER_REASONING_EFFORTS } from './member-custom.mjs';
import { loadPortsState, normalizeProviderConfig, checkFeed, effectiveMember, portsSnapshot, boardWrites, boardAppend, pushEvent, linked as portsLinked, reviewVerdicts, MAX_REWORK, PROVIDER_TYPES, isProviderId, cleanVia as portsCleanVia } from './collab-ports.mjs';

export function registerAutomationWorkbench(context,bridge,output){
  const service=bridge.automation,workers=new NativeTaskWorkers(service,bridge,output),staff=service.staff,staffWorkers=new NativeTaskWorkers(staff.facade,bridge,output),panels=new Map();
  staff.attach(bridge,staffWorkers);
  const taskService=id=>typeof id==='string'&&id.startsWith('staffjob_')?staff.facade:service;
  const selected={rules:service.currentWorkspaceId(),collaboration:service.currentWorkspaceId()};
  const screens={rules:{viewType:'opencode.rules',title:'规则中心',html:'rules.html',script:'rules.js'},collaboration:{viewType:'opencode.collaboration',title:'团队协作',html:'collaboration.html',script:'collaboration.js'}};
  const sharedActions=new Set(['refresh','selectWorkspace','addWorkspace']);
  const pageActions={rules:new Set(['savePreset','deletePreset','selectGlobal','bindWorkspace','saveLayers','previewRules','exportRules','saveLibraryRule','deleteLibraryRule','savePersonaPreset','deletePersonaPreset']),collaboration:new Set(['teamOpenChat','teamVoice','teamMcp','saveEmployee','createStaffRole','bindEmployee','copyEmployeePairing','unbindEmployee','saveTeam','authorizeTeam','pauseTeam','reconcileTeam','openTeamWorkspace','openEmployeeApiSettings','setNativeTaskReviewRequired','setCollaborationEnabled','saveTaskCategory','configureTask','resumeNative','sendMessage','ackMessage','deliverLocalMessages','readExecution','openTaskDiff','loadReview','addReview','replyReview','setReviewStatus','sendReview','loadHandoff','listMergeBranches','previewLocalMerge','confirmLocalMerge','refreshCatalog','saveRole','assignAgent','createTask','startNative','startQueue','stopNative','confirmTask','releaseTask','cancelTask','extendLimit','teamLayout','teamEdge','teamDeleteMember','teamSend','teamStop','teamClearChat','teamMemberSettings','teamMemberAvatar','teamDeleteSubagent','teamEdges','teamPresetSave','teamPresetApply','teamPresetDelete','teamPresetDefault','teamRules','teamMode','portProvider','portProviderMove','portProviderDelete','portFeed','portUnfeed','portFeedMode','portBoardClear','teamGroups','teamCollapse','portProviderFlags','portFeedVia'])};
  // member-custom: what the 成员 page / canvas 「更多」 panel offers (tool categories, MCP servers the host knows, confirm kinds, efforts).
  function memberCatalog(){let servers=[];try{servers=(bridge.externalMcpHealth?.()||[]).map(h=>({id:String(h.id),state:h.state||''})).filter(h=>/^[a-z0-9_-]{1,64}$/i.test(h.id));}catch{}return {tools:MEMBER_TOOL_CATEGORIES,mcpServers:servers,confirm:MEMBER_CONFIRM_KINDS,efforts:MEMBER_REASONING_EFFORTS};}
  const snapshot=page=>{const base=service.snapshot(selected[page]),people=page==='collaboration'&&base.collaborationEnabled?staff.snapshot(selected[page]):null;if(people&&!people.error)people.employees=[...(people.employees||[]),...tempMembers(people.employees)];if(people&&!people.error)for(const agent of base.agents){const employee=people.employees.find(item=>item.agentId===agent.id);if(employee){agent.employeeId=employee.id;agent.roleId=employee.roleId;}}const modelGroups=page==='rules'?(()=>{try{const list=context.globalState.get('opencode.modelGroups.v1');return Array.isArray(list)?list.filter(g=>g&&typeof g.id==='string').map(g=>({id:g.id,name:String(g.alias||g.name||g.id)})):[];}catch{return [];}})():undefined;return {...base,nativeWorkers:workers.snapshot(),routingCatalog:workers.catalog,staff:people,team:people&&!people.error?teamSnapshot(selected[page]):null,page,...(page==='collaboration'?{teamCaps:ocTeamCaps,memberCatalog:memberCatalog()}:{}),...(modelGroups?{modelGroups}:{})};}; // OpenCode p31: 把语音/MCP 可用状态带给协作页面
  const post=page=>{const panel=panels.get(page);if(!panel)return;try{panel.webview.postMessage({type:'state',value:snapshot(page)});}catch(error){panel.webview.postMessage({type:'error',message:error.message});}};
  const postAll=()=>{updateCollaborationStatus();for(const page of panels.keys())post(page);};
  // OpenCode p31: 检测语音（ms-vscode.vscode-speech 扩展 + 语音聊天命令）和 MCP 命令是否可用，传给协作页面把按钮置灰并给出提示
  const OC_VOICE_CMDS=['workbench.action.chat.startVoiceChat','workbench.action.chat.voiceChatInChatView','workbench.action.chat.holdToVoiceChatInChatView'],OC_MCP_CMDS=['workbench.action.chat.configureTools','workbench.mcp.listServer','workbench.mcp.showConfiguration'];
  let ocTeamCaps={voice:true,mcp:true,speech:true,voiceCmd:null,mcpCmd:null,voiceTip:'',mcpTip:'',checked:false};
  async function ocRefreshTeamCaps(){try{const speech=!!vscode.extensions.getExtension('ms-vscode.vscode-speech'),cmds=await vscode.commands.getCommands(true),voiceCmd=OC_VOICE_CMDS.find(x=>cmds.includes(x))||null,mcpCmd=OC_MCP_CMDS.find(x=>cmds.includes(x))||cmds.find(x=>x.startsWith('workbench.mcp.'))||null;
    const next={voice:speech&&!!voiceCmd,mcp:!!mcpCmd,speech,voiceCmd,mcpCmd,voiceTip:!speech?'需要安装 VS Code Speech 扩展':!voiceCmd?'当前版本没有语音聊天命令':'',mcpTip:mcpCmd?'':'当前版本没有 MCP 命令',checked:true};
    const changed=JSON.stringify(next)!==JSON.stringify(ocTeamCaps);ocTeamCaps=next;if(changed)postAll();}catch(error){output?.appendLine?.('[team] 检测语音/MCP 能力失败：'+error.message);}return ocTeamCaps;}
  void ocRefreshTeamCaps();try{context.subscriptions.push(vscode.extensions.onDidChange(()=>void ocRefreshTeamCaps()));}catch{}
  const reviews=new ReviewStore(service),mergeTickets=new Map();
  // Team canvas + group chat + private chats + temporary subagents. Stored per workspace under globalStorage.
  // chat message: {id,time,from:'user'|'system'|memberId|'sub:<id>',kind,text,channel:'group'|'dm:<memberId>',to:[memberId] (private @, empty = everyone)}
  const teamDir=path.join(context.globalStorageUri.fsPath,'collab-team');const teamBusy=new Map(),teamCancel=new Map();
  const TEAM_MAX_CALLS=16,TEAM_MAX_DEPTH=5,SUB_DEFAULT_MAX=3,SUB_HARD_MAX=8;
  const teamFile=id=>path.join(teamDir,String(id||'global').replace(/[^a-zA-Z0-9_-]/g,'_')+'.json');
  // 团队预设：所有项目共用（画布成员位置、连线、子代理设置），存在 collab-team/presets.json
  const presetFile=path.join(teamDir,'presets.json');
  function presetsLoad(){try{const v=JSON.parse(fs.readFileSync(presetFile,'utf8'));return {list:Array.isArray(v?.list)?v.list.filter(p=>p&&typeof p.id==='string'):[],defaultId:typeof v?.defaultId==='string'?v.defaultId:null};}catch{return {list:[],defaultId:null};}}
  function presetsSave(v){fs.mkdirSync(teamDir,{recursive:true});const tmp=presetFile+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(v));fs.renameSync(tmp,presetFile);}
  const avatarFile=path.join(teamDir,'avatars.json');let avatarCache=null;
  function teamAvatars(){try{const st=fs.statSync(avatarFile);if(avatarCache&&avatarCache.mtime===st.mtimeMs)return avatarCache.map;const v=JSON.parse(fs.readFileSync(avatarFile,'utf8'));const map=v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).filter(([k,u])=>typeof u==='string'&&u.startsWith('data:image/'))):{};avatarCache={mtime:st.mtimeMs,map};return map;}catch{return {};}}
  function teamAvatarSet(memberId,url){const map={...teamAvatars()};if(url)map[memberId]=url;else{if(!(memberId in map))return;delete map[memberId];}fs.mkdirSync(teamDir,{recursive:true});const tmp=avatarFile+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(map));fs.renameSync(tmp,avatarFile);avatarCache=null;}
  /* collab-nodes: 画布节点全部平级、互相独立。value.nodes = {节点ID:{x,y,memberId}}，成员只决定节点长什么样、用什么配置。
     老数据（nodes[成员ID] + copies['成员ID~xxxx']，连线 from/to=成员ID）在 teamNodesMigrate 里原样搬过来：节点 ID 不变、副本变成普通节点、连线补上 fromNode/toNode。 */
  function presetApplyTo(value,preset,ids){const m=teamNodesMigrate(preset.nodes,preset.copies,preset.edges);const nodes={};let missing=0;for(const [k,p] of Object.entries(m.nodes)){if(ids.has(p.memberId))nodes[k]=p;else missing++;}value.nodes=nodes;value.edges=m.edges.filter(e=>nodes[e.fromNode]&&nodes[e.toNode]&&(e.type==='manage'||e.type==='peer')).map(e=>({from:e.from,to:e.to,type:e.type,fromNode:e.fromNode,toNode:e.toNode}));for(const [k,st] of Object.entries(preset.settings||{}))if(teamOnCanvas(value,k))value.settings[k]={...(value.settings[k]||{}),...st};return missing;}
  const teamCopyKey=k=>typeof k==='string'&&/^[^~]+~[A-Za-z0-9_-]{1,24}$/.test(k);
  const teamBaseId=k=>String(k).split('~')[0];
  const teamEndKey=(e,side)=>e[side+'Node']||e[side];
  const teamNodeKeyOk=k=>typeof k==='string'&&k.length>0&&k.length<=120;
  /** 老格式 → 新格式（不丢数据）：nodes[k] 补 memberId；copies 并进 nodes；连线 fromNode/toNode 必填（缺省 = 那位成员的节点）。 */
  function teamNodesMigrate(rawNodes,rawCopies,rawEdges){const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{},nodes={};
    for(const src of [obj(rawNodes),obj(rawCopies)])for(const [k,p] of Object.entries(src)){if(!teamNodeKeyOk(k)||nodes[k]||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;nodes[k]={x:p.x,y:p.y,memberId:typeof p.memberId==='string'&&p.memberId?p.memberId:teamBaseId(k)};}
    const firstOf=mid=>nodes[mid]&&nodes[mid].memberId===mid?mid:Object.keys(nodes).find(k=>nodes[k].memberId===mid);
    const edges=(Array.isArray(rawEdges)?rawEdges:[]).filter(e=>e&&typeof e==='object').map(e=>{const fn=e.fromNode&&nodes[e.fromNode]?e.fromNode:(firstOf(e.from)||e.fromNode||e.from),tn=e.toNode&&nodes[e.toNode]?e.toNode:(firstOf(e.to)||e.toNode||e.to);return {...e,from:nodes[fn]?.memberId||e.from,to:nodes[tn]?.memberId||e.to,fromNode:fn,toNode:tn};});
    return {nodes,edges};}
  const teamNodeMember=(value,k)=>value.nodes?.[k]?.memberId||teamBaseId(k);
  function teamNodeExists(value,k){return !!value.nodes?.[k];}
  /** 这位成员在画布上的所有节点 */
  function teamMemberNodes(value,memberId){return Object.keys(value.nodes||{}).filter(k=>value.nodes[k].memberId===memberId);}
  function teamOnCanvas(value,memberId){return teamMemberNodes(value,memberId).length>0;}
  /** 成员的位置 = 它最靠上（同高最靠左）的节点，用来挑组长 */
  function teamMemberPos(value,memberId){let best=null;for(const k of teamMemberNodes(value,memberId)){const p=value.nodes[k];if(!best||p.y<best.y||p.y===best.y&&p.x<best.x)best=p;}return best;}
  /** 接收方传成员 ID（老接口 / MCP）时，落到这位成员的第一个节点 */
  function teamResolveNode(value,k){k=String(k||'');if(value.nodes?.[k])return k;const ks=teamMemberNodes(value,k);return ks.includes(k)?k:ks[0]||'';}
  /* 删一个节点只删它自己和接在它上面的线；同一成员的其他节点、成员本身都不动 */
  function teamDropNode(value,k){value.edges=value.edges.filter(e=>teamEndKey(e,'from')!==k&&teamEndKey(e,'to')!==k);if(value.feeds)value.feeds=value.feeds.filter(f=>f.to!==k&&f.from!==k);delete value.nodes[k];}
  function teamEdgeRecord(value,fromKey,toKey,type){return {from:teamNodeMember(value,fromKey),to:teamNodeMember(value,toKey),type,fromNode:fromKey,toNode:toKey};}
  /** 两个节点之间已有的线（不分方向） */
  const teamSamePair=(e,a,b)=>{const f=teamEndKey(e,'from'),t=teamEndKey(e,'to');return f===a&&t===b||f===b&&t===a;};
  /** 管理关系按节点判环（同一成员的两个节点可以互为上下级，但节点之间不能成环） */
  function teamManageReach(edges,a,b,seen=new Set()){return a===b||!seen.has(a)&&(seen.add(a),edges.some(e=>e.type==='manage'&&teamEndKey(e,'from')===a&&teamManageReach(edges,teamEndKey(e,'to'),b,seen)));}
  function teamLoad(id){const out=teamLoadRaw(id);Object.defineProperty(out,'__id',{value:id,enumerable:false});return out;}
  function teamLoadRaw(id){let v={};try{v=JSON.parse(fs.readFileSync(teamFile(id),'utf8'))||{};}catch{}
    const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
    const mig=teamNodesMigrate(v.nodes,v.copies,v.edges);
    return {nodes:mig.nodes,edges:mig.edges,chat:(Array.isArray(v.chat)?v.chat:[]).map(m=>({...m,channel:m.channel||'group',to:Array.isArray(m.to)?m.to:[]})),taskSeen:obj(v.taskSeen),rules:typeof v.rules==='string'?v.rules.slice(0,4000):'',settings:obj(v.settings),subagents:Array.isArray(v.subagents)?v.subagents:[],mode:['leader','all','council'].includes(v.mode)?v.mode:'all',groups:teamGroupsClean(v.groups),collapsed:(Array.isArray(v.collapsed)?v.collapsed:[]).filter(x=>typeof x==='string'&&x.length<120).slice(0,500),...loadPortsState(v)};}
  /** 画布分组（ComfyUI 式 Group）：只存框的位置、大小、标题和颜色。 */
  function teamGroupsClean(list){if(!Array.isArray(list))return [];const out=[],seen=new Set();for(const g of list.slice(0,60)){if(!g||typeof g!=='object')continue;const id=/^g_[a-z0-9]{4,20}$/.test(String(g.id))?String(g.id):'g_'+crypto.randomUUID().replace(/-/g,'').slice(0,10);if(seen.has(id))continue;seen.add(id);const n=(v,d)=>Number.isFinite(Number(v))?Math.round(Number(v)):d;out.push({id,title:String(g.title||'分组').trim().slice(0,60)||'分组',color:/^#[0-9a-fA-F]{6}$/.test(String(g.color))?String(g.color):'#4a7fc4',x:n(g.x,0),y:n(g.y,0),w:Math.min(20000,Math.max(120,n(g.w,400))),h:Math.min(20000,Math.max(80,n(g.h,260)))});}return out;}
  function teamSave(id,value){fs.mkdirSync(teamDir,{recursive:true});if(value.chat.length>1500)value.chat=value.chat.slice(-1500);for(const s of value.subagents)if(Array.isArray(s.history)&&s.history.length>40)s.history=s.history.slice(-40);const file=teamFile(id),tmp=file+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value));fs.renameSync(tmp,file);try{canvasConsole.notifyChat(id);}catch{}}
  function teamPush(id,message){const value=teamLoad(id);value.chat.push({id:crypto.randomUUID(),time:new Date().toISOString(),channel:'group',to:[],...message});try{portsOnMessage(id,value,value.chat.at(-1));}catch(error){output.appendLine('[ports] '+error.message);}teamSave(id,value);postAll();return value;}
  // collab-ports: 每条消息顺手记协作事件（派活 / 点名 / AI 临时协作 / 受阻上报），成员写的 #看板 行进共享看板
  function portsOnMessage(id,value,m){const from=m.from;if(!from||from==='user'||from==='system'||from==='chat'||String(from).startsWith('sub:')||String(from).startsWith('ai:'))return;
    if(m.kind==='task'&&m.assignee){if(m.assignee!==from)pushEvent(value,{kind:'dispatch',from,to:m.assignee,taskId:m.taskId,text:String(m.text||'').split('\n')[0]});return;}
    if(m.kind!=='chat'||m.fold)return;
    for(const to of m.to||[])if(to!=='user'&&to!==from)pushEvent(value,{kind:portsLinked(value.edges,from,to)?'message':'adhoc',from,to,text:m.text});
    if(/^\s*#受阻/m.test(m.text||'')){const up=value.edges.find(e=>e.type==='manage'&&e.to===from&&e.from!==from);pushEvent(value,{kind:'escalate',from,to:up?up.from:'user',text:(String(m.text).match(/#受阻\s*(.+)/)||[])[1]||''});}
    const writes=boardWrites(m.text);if(writes.length){const f=value.feeds.find(x=>x.port==='board'&&teamBaseId(x.to)===from);if(f&&boardAppend(value,f.from,from,writes))pushEvent(value,{kind:'board',from,to:f.from,text:writes.join('；')});}}
  function portsCtx(id,value,members){let tasks=[];try{tasks=service.snapshot(id).tasks||[];}catch{}const who={};for(const m of value.chat)if(m.kind==='task'&&m.taskId&&m.assignee)who[m.taskId]=m.assignee;return {members,chat:value.chat,tasks:tasks.map(t=>({...t,assigneeMemberId:who[t.id]||null}))};}
  /** 成员叠加画布接线后的生效设置（模型 / 人设 / 权限 / 工具 / 工作区 / 知识 / 规范 / 看板）。 */
  function portsEffective(id,member,value,members){if(!member)return member;try{value=value||teamLoad(id);if(!value.feeds?.length)return member;return effectiveMember(member,value,portsCtx(id,value,members||teamMembers(id)));}catch(error){output.appendLine('[ports] '+error.message);return member;}}
  service.teamEvent=(id,ev)=>{try{const v=teamLoad(id);if(pushEvent(v,ev)){teamSave(id,v);postAll();}}catch{}};
  // collab-ports: 任务状态变化 → 交付 / 上报事件；派活的成员（不是用户）自动审查交付，通过就验收，打回就按意见派返工，最多返工 MAX_REWORK 次
  function portsUpOf(value,memberId){return value.edges.find(e=>e.type==='manage'&&e.to===memberId&&e.from!==memberId)?.from||null;}
  function portsOnTask(id,value,m,t,seen){const assignee=m.assignee,creator=m.from;if(!assignee)return;
    if(t.status==='cancelled')return;
    if(t.status==='blocked'){pushEvent(value,{kind:'escalate',from:assignee,to:portsUpOf(value,assignee)||(creator&&creator!=='user'&&creator!=='system'?creator:'user'),taskId:t.id,text:t.output||t.title});return;}
    if(seen==='review'&&t.status==='completed')return;
    pushEvent(value,{kind:'deliver',from:assignee,to:creator&&creator!=='system'?creator:'user',taskId:t.id,text:t.title});
    const writes=boardWrites(t.output);if(writes.length){const f=value.feeds.find(x=>x.port==='board'&&teamBaseId(x.to)===assignee);if(f&&boardAppend(value,f.from,assignee,writes))pushEvent(value,{kind:'board',from:assignee,to:f.from,text:writes.join('；')});}
    if(!creator||creator==='user'||creator==='system'||creator===assignee)return;
    const r=value.reviews[t.id]||{round:0};if(r.state&&r.state!=='waiting')return;
    value.reviews[t.id]={...r,state:'pending',reviewer:r.reviewer||creator,assignee,title:t.title,goal:String(t.goal||'').slice(0,4000),channel:m.channel||'group'};}
  const portsReviewing=new Set();
  async function portsReviewKick(id,tries=0){if(portsReviewing.has(id))return;if(teamBusy.get(id)){if(tries<40)setTimeout(()=>{void portsReviewKick(id,tries+1);},15000);return;}
    const value=teamLoad(id),pend=Object.entries(value.reviews||{}).filter(([,r])=>r.state==='pending');if(!pend.length)return;
    const members=teamMembers(id),groups=new Map(),name=x=>members.find(m=>m.id===x)?.name||x;portsReviewing.add(id);
    try{for(const [taskId,r] of pend){const rev=members.find(x=>x.id===r.reviewer);
        if(!rev||!rev.enabled||rev.kind!=='api'||!rev.model||!teamOnCanvas(value,rev.id)){r.state='skipped';continue;}/* 审查人不能自己说话（外部 MCP / 不在画布上）：保持原来的人工验收 */
        r.state='asked';pushEvent(value,{kind:'review',from:rev.id,to:r.assignee,taskId,text:r.title});if(!groups.has(rev.id))groups.set(rev.id,[]);groups.get(rev.id).push([taskId,r]);}
      teamSave(id,value);postAll();const tasks=service.snapshot(id).tasks||[];
      for(const [rid,list] of groups){const channel=list[0][1].channel||'group';
        const body=list.map(([taskId,r])=>{const t=tasks.find(x=>x.id===taskId);return `任务「${r.title}」由 ${name(r.assignee)} 交付${r.round?`（第 ${r.round} 次返工）`:''}：\n${String(t?.output||'（没有写交付说明）').slice(0,3000)}`;}).join('\n\n');
        sysMsg(id,channel,`请 ${name(rid)} 审查下面的交付，对照派活时的要求判断：\n\n${body}\n\n每个任务单独一行给结论：合格写「#通过 任务标题」；要返工写「#打回 任务标题：具体要改什么」。`,{to:[rid]});
        try{await teamRun(id,channel,[rid]);}catch(error){output.appendLine('[ports] review run '+error.message);const v=teamLoad(id);for(const [taskId] of list)if(v.reviews[taskId]?.state==='asked')v.reviews[taskId].state='pending';teamSave(id,v);setTimeout(()=>{void portsReviewKick(id,tries+1);},15000);}}}
    catch(error){output.appendLine('[ports] review '+error.message);}finally{portsReviewing.delete(id);}}
  const portsBase=t=>String(t||'').replace(/（返工 \d+）$/,'').trim();
  async function portsVerdict(id,member,v,channel,members){const value=teamLoad(id);
    const hit=Object.entries(value.reviews||{}).filter(([,r])=>r.reviewer===member.id&&r.state==='asked'&&(r.title===v.title||portsBase(r.title)===portsBase(v.title))).at(-1);
    if(!hit){sysMsg(id,channel,`${member.name} 的「${v.verdict==='pass'?'#通过':'#打回'} ${v.title}」没对上待审查的任务，已忽略。`,{to:[member.id]});return;}
    const [taskId,r]=hit;
    if(v.verdict==='pass'){r.state='passed';pushEvent(value,{kind:'approve',from:member.id,to:r.assignee,taskId,text:r.title});teamSave(id,value);
      try{const t=(service.snapshot(id).tasks||[]).find(x=>x.id===taskId);if(t&&t.status==='review')await taskService(taskId).confirmTask(taskId,t.revision);}catch(error){sysMsg(id,channel,`「${r.title}」已由 ${member.name} 审查通过，但自动验收失败：${error.message}`);}
      return;}
    const round=(r.round||0)+1;r.state='rejected';
    if(round>MAX_REWORK){pushEvent(value,{kind:'escalate',from:member.id,to:portsUpOf(value,member.id)||'user',taskId,text:`「${r.title}」返工 ${MAX_REWORK} 次仍未通过：${v.note}`});teamSave(id,value);sysMsg(id,channel,`⚠ 「${portsBase(r.title)}」返工 ${MAX_REWORK} 次仍没通过 ${member.name} 的审查，需要你处理：${v.note}`);void vscode.window.showWarningMessage(`团队协作：「${portsBase(r.title)}」返工 ${MAX_REWORK} 次仍未通过审查。`);return;}
    pushEvent(value,{kind:'reject',from:member.id,to:r.assignee,taskId,text:v.note});teamSave(id,value);
    const target=(members||[]).find(x=>x.id===r.assignee)||teamMembers(id).find(x=>x.id===r.assignee);if(!target)return;
    await teamCreateTask(id,target,`${portsBase(r.title)}（返工 ${round}）`,`${v.note}\n\n原要求：${r.goal||portsBase(r.title)}`,member.id,channel,{review:{round,reviewer:member.id,reworkOf:taskId}});}
  const sysMsg=(id,channel,text,extra={})=>teamPush(id,{from:'system',kind:'system',text,channel,...extra});
  // 临时成员：当前正在连接 Bridge 的 MCP 对话（未绑定为正式成员的），断开即消失；和外部 MCP 成员一样可上画布、被 @、派任务。
  function tempMembers(employees){const state=service.read(),bound=new Set((employees||[]).map(e=>e.agentId).filter(Boolean)),seen=new Set(),out=[];
    for(const peer of service.currentMcpConnections()){const agentId=service.agentIdFor(peer.owner);if(!agentId||bound.has(agentId)||seen.has(agentId))continue;seen.add(agentId);
      const saved=state.agents?.[agentId]||{},name=String(service.connections?.get?.(peer.owner)?.name||saved.name||saved.clientReportedName||'外部 AI').slice(0,60);
      const roleId=saved.roleId&&state.roles.some(r=>r.id===saved.roleId)?saved.roleId:(state.roles.some(r=>r.id==='developer')?'developer':'observer');
      // collab-subagent: a connection that marked itself a subagent (chat_join/set_todos parent_task_id or subagent=true) carries parentId/subagent so it never shows as its own conversation.
      let sub=null;try{sub=canvasConsole.subagentOfOwner(peer.owner);}catch{}
      out.push({id:'tmp_'+agentId,agentId,name:name+'（临时）',kind:'mcp',temporary:true,enabled:true,roleId,model:null,...(sub?{parentId:sub.parentId,subagent:true}:{})});}
    return out;}
  function teamMembers(id){const people=staff.snapshot(id),roles=service.read().roles;return [...(people.employees||[]),...tempMembers(people.employees)].map(e=>({...e,roleName:roles.find(r=>r.id===e.roleId)?.name||e.roleId,roleInstructions:roles.find(r=>r.id===e.roleId)?.instructions||''}));}
  function teamRelations(team,memberId){const up=new Set(),down=new Set(),peers=new Set();for(const e of team.edges){if(e.from===e.to)continue;if(e.type==='manage'){if(e.to===memberId)up.add(e.from);if(e.from===memberId)down.add(e.to);}else if(e.from===memberId)peers.add(e.to);else if(e.to===memberId)peers.add(e.from);}return {up:[...up],down:[...down],peers:[...peers]};}
  /** 节点级关系（给画布 / 调试用）：这个节点的上级、下级、同级节点，可以是同一成员的其他节点 */
  function teamNodeRelations(team,nodeId){const up=[],down=[],peers=[];for(const e of team.edges){const f=teamEndKey(e,'from'),t=teamEndKey(e,'to');if(e.type==='manage'){if(t===nodeId)up.push(f);if(f===nodeId)down.push(t);}else if(f===nodeId)peers.push(t);else if(t===nodeId)peers.push(f);}return {up,down,peers};}
  function subSettings(team,memberId){const s=team.settings[memberId]||{};return {allowSubagents:s.allowSubagents===true,maxSubagents:Math.min(SUB_HARD_MAX,Math.max(1,Number.isInteger(s.maxSubagents)?s.maxSubagents:SUB_DEFAULT_MAX))};}
  function teamSnapshot(id){
    // 新项目第一次打开：有“新项目默认”预设就自动套用
    if(!fs.existsSync(teamFile(id))){const ps=presetsLoad(),def=ps.list.find(p=>p.id===ps.defaultId);if(def){const v=teamLoad(id);presetApplyTo(v,def,new Set(teamMembers(id).map(m=>m.id)));teamSave(id,v);}}
    const value=teamLoad(id);
    // Report finished chat tasks once, in the conversation that created them.
    try{const tasks=service.snapshot(id).tasks||[];let changed=false;for(const m of [...value.chat])if(m.kind==='task'&&m.taskId){const t=tasks.find(x=>x.id===m.taskId);if(!t)continue;const seen=value.taskSeen[m.taskId];if(['completed','blocked','cancelled','review'].includes(t.status)&&seen!==t.status){value.taskSeen[m.taskId]=t.status;changed=true;try{portsOnTask(id,value,m,t,seen);}catch(error){output.appendLine('[ports] '+error.message);}const label={completed:'已完成',blocked:'⚠ 受阻，需要你处理',cancelled:'已取消',review:'待验收（点「验收通过」才算完成）'}[t.status];value.chat.push({id:crypto.randomUUID(),time:new Date().toISOString(),from:'system',text:`任务「${t.title}」${label}${t.output?'：'+String(t.output).slice(0,600):''}`,kind:'system',taskId:t.id,channel:m.channel||'group',to:[]});}}if(changed)teamSave(id,value);}catch{}
    const subagents=value.subagents.map(s=>({id:s.id,parentId:s.parentId,name:s.name,task:s.task,status:s.status,createdAt:s.createdAt}));
    if(Object.values(value.reviews||{}).some(r=>r.state==='pending'))setTimeout(()=>{void portsReviewKick(id);},50);
    let ports=null;try{const members=teamMembers(id);const c=portsCtx(id,value,members);ports=portsSnapshot(value,members,c.chat,c.tasks);}catch(error){output.appendLine('[ports] '+error.message);}
    return {ports,groups:value.groups||[],collapsed:value.collapsed||[],nodes:value.nodes,avatars:teamAvatars(),edges:value.edges,chat:value.chat.slice(-600),settings:value.settings,rules:value.rules||'',mode:value.mode,subagents,busy:teamBusy.get(id)||null,presets:(()=>{const ps=presetsLoad();return ps.list.map(p=>({id:p.id,name:p.name,count:Object.keys(p.nodes||{}).length,links:(p.edges||[]).length,isDefault:p.id===ps.defaultId,updatedAt:p.updatedAt}));})()};}
  function teamMentions(text,members){const found=[];let rest=String(text);for(const m of [...members].sort((a,b)=>b.name.length-a.name.length)){const tag='@'+m.name;if(rest.includes(tag)){found.push(m);rest=rest.split(tag).join(' ');}}return found;}
  async function teamModel(ref){const list=await vscode.lm.selectChatModels({vendor:ref.vendor});return list.find(m=>m.id===ref.id)||null;}
  // member-custom: per-member model params ride on the request configuration; fallbackModel retries once when the provider fails before any output.
  async function lmText(model,prompt,cts,onPart,member){return withFallbackModel(model,member,async(use,mark)=>{const response=await use.sendRequest([vscode.LanguageModelChatMessage.User(prompt)],{...memberRequestOptions(member)},cts.token);let text='';for await(const part of response.text){text+=part;if(part)mark();try{onPart?.(text);}catch{}}return text.trim();},{resolve:ref=>teamModel(ref),isCancelled:()=>cts.token.isCancellationRequested,onSwitch:(fb,error)=>{try{output.appendLine(`[team] ${member?.name||''}：${model.vendor}/${model.id} 出错（${String(error?.message||error).slice(0,200)}），改用备用模型 ${fb.vendor}/${fb.id} 重试一次。`);}catch{}}});}
  // 协作聊天流式输出：成员回复过程中按 120ms 节流推给协作页面
  function ocTeamStreamer(memberId,channel,quiet){let last=0,timer=null,latest='';const L=globalThis.__ocTeamStreamListeners||(globalThis.__ocTeamStreamListeners=new Set());const send=(done)=>{for(const fn of L){try{fn({memberId,channel,text:latest,done:!!done,quiet:!!quiet});}catch{}}for(const p of (typeof panels!=='undefined'?panels.values():[])){try{p.webview.postMessage({type:'stream',memberId,channel,text:done?'':latest,done:!!done});}catch{}}};return {part(t){latest=t;const now=Date.now();if(now-last>=120){last=now;send(false);}else if(!timer){timer=setTimeout(()=>{timer=null;last=Date.now();send(false);},120);}},done(){if(timer){clearTimeout(timer);timer=null;}send(true);}};}
  // What one member is allowed to see: its private chat, or the group minus other people's private @ messages.
  function visibleTo(team,memberId,channel){return team.chat.filter(m=>(m.channel||'group')===channel&&(!m.to?.length||m.from===memberId||m.to.includes(memberId)));}
  function speaker(m,name,team){if(m.from==='user')return '用户';if(m.from==='system')return '系统';if(String(m.from).startsWith('ai:'))return `外部 AI ${m.aiName||String(m.from).slice(3)}`;if(String(m.from).startsWith('sub:')){const s=team.subagents.find(x=>'sub:'+x.id===m.from);return `子代理 ${s?.name||'已删除'}`;}return name(m.from);}
  // ---------- canvas-console: 画布控制台（AI 身份/状态/活动/等你/全部停下），数据只来自真实记录 ----------
  const canvasProjects=()=>{try{return service.workspaces().map(w=>({id:w.id,name:w.name,root:w.root}));}catch{return [];}};
  const canvasFromName=(id,m)=>{if(m.from==='user')return '用户';if(m.from==='system')return '系统';if(String(m.from).startsWith('ai:'))return m.aiName||String(m.from).slice(3);if(String(m.from).startsWith('sub:')){const s=teamLoad(id).subagents.find(x=>'sub:'+x.id===m.from);return '子代理 '+(s?.name||'已删除');}try{return teamMembers(id).find(x=>x.id===m.from)?.name||m.from;}catch{return m.from;}};
  canvasConsole.configure({storeDir:teamDir,backend:{
    projects:canvasProjects,
    currentProjectId:()=>selected.collaboration&&selected.collaboration!=='global'?selected.collaboration:service.currentWorkspaceId(),
    // 外部 AI 只看群里的公开消息（不带 @ 私密对象），过程折叠行不算消息
    read:id=>teamLoad(id).chat.filter(m=>(m.channel||'group')==='group'&&!(m.to||[]).length&&!m.fold&&m.kind!=='stream').map(m=>({id:m.id,time:m.time,cursor:m.time+'|'+m.id,from:m.from,fromName:canvasFromName(id,m),text:String(m.text||'')})),
    post:(id,message)=>{const msg={id:crypto.randomUUID(),time:new Date().toISOString(),channel:'group',to:[],...message};teamPush(id,msg);return {...msg,cursor:msg.time+'|'+msg.id,fromName:canvasFromName(id,msg)};},
    browser:canvasBrowser()
  }});
  /** OpenCode 内置浏览器（VS Code browser 提案 API + CDP 截图）。API 不可用时如实报告，不显示假预览。 */
  function canvasBrowser(){
    const api=()=>{try{const tabs=vscode.window.browserTabs;return Array.isArray(tabs)?tabs:null;}catch(error){canvasBrowserReason=String(error?.message||error).slice(0,200);return null;}};
    const ids=new WeakMap();let n=0;const idOf=t=>{let id=ids.get(t);if(!id){id='tab'+(++n);ids.set(t,id);}return id;};
    return {
      available:()=>!!api(),
      reason:()=>canvasBrowserReason||'browser API 未开放',
      list:()=>(api()||[]).map(t=>({id:idOf(t),title:String(t.title||''),url:String(t.url||''),tab:t})),
      open:async url=>{const t=await vscode.window.openBrowserTab(url);return {id:idOf(t),title:String(t.title||''),url:String(t.url||url)};},
      close:async id=>{const t=(api()||[]).find(x=>idOf(x)===id);if(t)await t.close();},
      find:id=>(api()||[]).find(x=>idOf(x)===id)||null
    };
  }
  let canvasBrowserReason='';const canvasShots=new Map();let canvasShotBusy=false,canvasWanted=0;
  async function canvasCdp(tab){let entry=canvasShots.get(tab.id);if(entry?.session&&!entry.closed)return entry;
    const session=await tab.tab.startCDPSession();let seq=0;const waiters=new Map();entry={...(entry||{}),session,closed:false,send:(method,params,sessionId)=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{waiters.delete(id);reject(Error('CDP 超时：'+method));},8000);waiters.set(id,{resolve,reject,timer});session.sendMessage({id,method,params:params||{},...(sessionId?{sessionId}:{})}).catch(error=>{clearTimeout(timer);waiters.delete(id);reject(error);});})};
    session.onDidReceiveMessage(m=>{const w=m&&waiters.get(m.id);if(!w)return;waiters.delete(m.id);clearTimeout(w.timer);if(m.error)w.reject(Error(m.error.message||'CDP 错误'));else w.resolve(m.result||{});});
    session.onDidClose(()=>{entry.closed=true;});canvasShots.set(tab.id,entry);return entry;}
  /** 画布可见时，每 5 秒给每个标签截一张小图（最多 6 个），只在内存里保留最新一张。 */
  async function canvasShootAll(){if(canvasShotBusy||Date.now()-canvasWanted>12000)return;canvasShotBusy=true;try{const br=canvasConsole.backend?.browser;if(!br?.available())return;
    for(const t of br.list().slice(0,6)){const prev=canvasShots.get(t.id);if(prev?.at&&Date.now()-prev.at<4500)continue;
      try{const c=await canvasCdp(t);let r;try{r=await c.send('Page.captureScreenshot',{format:'jpeg',quality:45,fromSurface:true});}catch(first){/* 会话组可能是浏览器级：先附加到页面 target 再截图 */if(!c.pageSession){const targets=await c.send('Target.getTargets');const page=(targets.targetInfos||[]).find(x=>x.type==='page');if(!page)throw first;const att=await c.send('Target.attachToTarget',{targetId:page.targetId,flatten:true});c.pageSession=att.sessionId;}r=await c.send('Page.captureScreenshot',{format:'jpeg',quality:45,fromSurface:true},c.pageSession);}
        if(r?.data){c.shot='data:image/jpeg;base64,'+r.data;c.at=Date.now();c.error='';}}
      catch(error){const c=canvasShots.get(t.id)||{};c.error=String(error?.message||error).slice(0,160);c.at=Date.now();canvasShots.set(t.id,c);}}
    const live=new Set(br.list().map(t=>t.id));for(const [id,c] of canvasShots)if(!live.has(id)){try{c.session?.close();}catch{}canvasShots.delete(id);}}finally{canvasShotBusy=false;}}
  const canvasShotTimer=setInterval(()=>{void canvasShootAll();},5000);context.subscriptions.push({dispose:()=>{clearInterval(canvasShotTimer);for(const c of canvasShots.values()){try{c.session?.close();}catch{}}}});
  function canvasBrowserView(){const br=canvasConsole.backend?.browser;if(!br)return {available:false,tabs:[]};if(!br.available())return {available:false,reason:br.reason(),tabs:[]};
    return {available:true,tabs:br.list().map(t=>{const c=canvasShots.get(t.id)||{};return {id:t.id,title:t.title,url:t.url,ai:canvasConsole.tabOwner(t.id),shot:c.shot||null,shotAt:c.shot?c.at:null,shotError:c.shot?'':c.error||''};})};}
  const canvasLayoutFile=path.join(teamDir,'canvas-layout.json');
  function canvasLayoutLoad(){try{const v=JSON.parse(fs.readFileSync(canvasLayoutFile,'utf8'));return {groups:v?.groups&&typeof v.groups==='object'?v.groups:{},cards:v?.cards&&typeof v.cards==='object'?v.cards:{}};}catch{return {groups:{},cards:{}};}}
  function canvasLayoutSave(v){fs.mkdirSync(teamDir,{recursive:true});const tmp=canvasLayoutFile+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(v));fs.renameSync(tmp,canvasLayoutFile);}
  /** 内部 API 成员：在哪个项目画布上、是否在发言/执行任务（来自 teamBusy 与原生协作 worker）。 */
  function canvasMembers(){const out=[],seen=new Set(),projects=canvasProjects(),order=[selected.collaboration,...projects.map(p=>p.id)].filter((x,i,a)=>x&&a.indexOf(x)===i);const chat=[];
    const activeTasks=new Set([...(workers.active?.keys?.()||[]),...(staffWorkers.active?.keys?.()||[])]);
    for(const pid of order){let team,members;try{team=teamLoad(pid);if(!Object.keys(team.nodes||{}).length)continue;members=teamMembers(pid);}catch{continue;}
      const busy=teamBusy.get(pid);
      for(const m of members){if(m.kind!=='api'||!teamOnCanvas(team,m.id)||seen.has(m.id))continue;seen.add(m.id);
        const runningTask=team.chat.find(x=>x.kind==='task'&&x.assignee===m.id&&x.taskId&&activeTasks.has(x.taskId));
        const speaking=busy&&busy.memberId===m.id;
        const last=[...team.chat].reverse().find(x=>x.from===m.id);
        out.push({id:m.id,name:m.name,project:pid,model:m.model?.id||'',status:!m.enabled?'offline':speaking||runningTask?'working':'idle',detail:speaking?'正在群聊里回复':runningTask?'执行任务：'+String(runningTask.title||runningTask.text||'').slice(0,60):'',lastAt:last?Date.parse(last.time)||0:0});
        // collab-subagent: the member's #子代理 helpers are its children (team.subagents[].parentId), marked so they stay under the parent.
        for(const sa of team.subagents||[])if(sa&&sa.parentId===m.id&&sa.id&&!seen.has('sub:'+sa.id)){seen.add('sub:'+sa.id);const lastSub=[...team.chat].reverse().find(x=>x.from==='sub:'+sa.id);
          out.push({id:'sub:'+sa.id,name:m.name+' 的子代理 '+String(sa.name||sa.id),project:pid,model:m.model?.id||'',status:busy&&busy.subId===sa.id||sa.status==='running'?'working':sa.status==='queued'?'idle':'offline',detail:String(sa.task||'').replace(/\s+/g,' ').slice(0,60),lastAt:lastSub?Date.parse(lastSub.time)||0:Date.parse(sa.createdAt||'')||0,parentId:'member:'+m.id,subagent:true});}}
      for(const x of team.chat.slice(-80))if(x.from&&members.some(m=>m.id===x.from&&m.kind==='api')&&!x.fold&&(x.channel||'group')==='group')chat.push({id:'c:'+x.id,at:Date.parse(x.time)||0,ai:'member:'+x.from,tool:x.kind==='task'?'派任务':'群聊发言',kind:'chat',status:'ok',detail:String(x.text||'').replace(/\s+/g,' ').slice(0,160),project:pid});}
    return {members:out,chat,links:canvasMemberLinks(order)};}
  function canvasMemberLinks(order){const links=[];for(const pid of order){let team;try{team=teamLoad(pid);}catch{continue;}if(!Object.keys(team.nodes||{}).length)continue;
    for(const e of team.edges||[])if(e.type==='manage'&&e.from!==e.to&&teamOnCanvas(team,e.from)&&teamOnCanvas(team,e.to)&&!links.some(l=>l.from==='member:'+e.from&&l.to==='member:'+e.to))links.push({from:'member:'+e.from,to:'member:'+e.to,kind:'manage',count:1,at:0});
    for(const m of team.chat.slice(-300))if(m.kind==='task'&&m.assignee&&m.from&&m.from!==m.assignee&&m.from!=='user'&&m.from!=='system')links.push({from:'member:'+m.from,to:'member:'+m.assignee,kind:'dispatch',count:1,at:Date.parse(m.time)||0});}
    return links;}
  function canvasSnapshot(){
    let tasks=[];try{tasks=bridge.dispatcher?.taskStore?.snapshot?.().tasks||[];}catch{}
    const {members,chat,links}=canvasMembers();
    const view=canvasConsole.view({tasks,members,chat,links});
    canvasWanted=Date.now();
    return {...view,current:selected.collaboration,layout:canvasLayoutLoad(),browser:canvasBrowserView(),teamBusy:[...teamBusy.keys()]};
  }
  async function canvasAction(action,input){
    switch(action){
      case 'snapshot':return canvasSnapshot();
      case 'seen':canvasConsole.markSeen(Array.isArray(input.ids)?input.ids.filter(x=>typeof x==='string').slice(0,2000):[]);return canvasSnapshot();
      case 'layout':{const v=canvasLayoutLoad();if(input.groups&&typeof input.groups==='object')for(const [k,p] of Object.entries(input.groups)){if(p===null)delete v.groups[k];else if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))v.groups[k]={x:Math.round(p.x),y:Math.round(p.y)};}
        if(input.cards&&typeof input.cards==='object')for(const [k,p] of Object.entries(input.cards)){if(p===null)delete v.cards[k];else if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))v.cards[k]={x:Math.round(p.x),y:Math.round(p.y)};}
        if(input.reset===true){v.groups={};v.cards={};}canvasLayoutSave(v);return {ok:true};}
      case 'openFile':{const raw=String(input.path||'');if(!raw)throw Error('缺少路径。');const proj=canvasProjects().find(p=>p.id===input.project)||canvasProjects().find(p=>p.id===selected.collaboration);const full=path.isAbsolute(raw)||/^[a-zA-Z]:[\\/]/.test(raw)?raw:proj?.root?path.join(proj.root,raw):raw;await vscode.window.showTextDocument(vscode.Uri.file(full),{preview:true});return {ok:true};}
      case 'openChat':{if(typeof input.project==='string'&&input.project!==selected.collaboration){service.workspace(input.project);selected.collaboration=input.project;}post('collaboration');return {ok:true};}
      default:throw Error('不支持此操作。');
    }
  }
  async function teamAsk(member,members,team,channel,cts,leader=false,extra=''){
    member=portsEffective(team.__id,member,team,members);
    let model=await teamModel(member.model);if(!model&&member.fallbackModel)model=await teamModel(member.fallbackModel);if(!model)throw Error(`${member.name} 的模型不可用：${member.model.vendor}/${member.model.id}`);
    const name=x=>members.find(m=>m.id===x)?.name||x,rel=teamRelations(team,member.id),dm=channel!=='group',sub=subSettings(team,member.id);
    const roster=members.filter(m=>m.enabled).map(m=>`- @${m.name}（${m.roleName}）${m.id===member.id?' 【你自己】':rel.up.includes(m.id)?' 【你的上级】':rel.down.includes(m.id)?' 【你的下级】':rel.peers.includes(m.id)?' 【同级】':''}${m.roleInstructions?'：'+String(m.roleInstructions).replace(/\s+/g,' ').slice(0,80):''}`).join('\n');
    const history=visibleTo(team,member.id,channel).slice(-40).map(m=>{const priv=m.to?.length?`（私密，仅 ${m.to.map(x=>x==='user'?'用户':name(x)).join('、')} 可见）`:'';return `[${speaker(m,name,team)}]${priv} ${m.text}`;}).join('\n');
    const mySubs=team.subagents.filter(s=>s.parentId===member.id);
    const subRule=sub.allowSubagents?`\n${dm?4:5}. 你可以创建临时子代理帮你分担工作（最多同时 ${sub.maxSubagents} 个），单独写一行：#子代理 名称：完整的任务说明。子代理看不到聊天记录，任务说明要写清楚；它完成后只把结果交给你，你再整合回复。对已有子代理用同样格式可以继续交代。${mySubs.length?'\n你现有的子代理：'+mySubs.map(s=>s.name).join('、'):''}`:'';
    const rules=dm?`这是用户和你的私聊，其他成员看不到。规则：
1. 只以「${member.name}」的身份回复，简洁直接。
2. 私聊里点名别人不会转达；需要别人配合时，建议用户去群聊安排。
3. 要让你自己或你的下级真正动手修改项目文件时，单独写一行：#任务 @名字 标题：具体要求。${subRule}`
:`这是一个群聊。规则：
1. 只以「${member.name}」的身份发言，简洁直接，不要替别人说话。
2. 用 @名字 点名与你有连线的人。带 @ 的消息是私密的，只有被点名的人能看到（用户能看到全部）；不带 @ 的消息全员可见。
3. 要让某个下级（或你自己）真正动手修改项目文件时，单独写一行：#任务 @名字 标题：具体要求。只有上级能给下级派任务；也可以给自己派。
4. 做好自己岗位的事，不确定时提问。${subRule}${leader?`

这次由你负责：用户点名了你（或没点名时由你接）。
- 你能直接答的就自己答，不要为分工而分工。
- 需要别人做时，从你的同级或下级里挑人，用 @名字 点名并一句话交代清楚（可点名：${[...rel.peers,...rel.down].map(x=>members.find(m=>m.id===x)).filter(m=>m&&m.enabled&&m.kind==='api').map(m=>'@'+m.name+'（'+m.roleName+'）').join('、')||'无'}），然后停下，不要替他们做。
- 成员回报后会再叫你：目标达成就向用户简短汇总；还需要下一步就继续点名；没有要补充的，只回复「#结束」。`:''}`;
    const prompt=`你是团队成员「${member.name}」，岗位：${member.roleName}。${member.roleInstructions?'\n岗位职责：'+member.roleInstructions:''}${memberPromptLayer(member)}
你的上级：${rel.up.map(name).join('、')||'无（直接对用户负责）'}
你的下级：${rel.down.map(name).join('、')||'无'}
协作伙伴：${rel.peers.map(name).join('、')||'无'}
团队成员：
${roster}

${rules}
- 一个任务要等别的任务做完再开始时，在 #任务 那行末尾加（等待：任务标题、任务标题）。
- 卡住、缺信息或需要用户拍板时，单独写一行：#受阻 原因。${leader&&team.rules?'\n\n团队规则（只给负责人看）：\n'+team.rules:''}${extra?'\n\n'+extra:''}

${dm?'私聊记录':'你能看到的群聊记录'}：
${history||'（暂无）'}

现在轮到你（${member.name}）发言：`;
    const ocStream=ocTeamStreamer(member.id,channel,/独立作答|匿名互评|各自完成|互相分析/.test(extra||''));try{return await lmText(model,prompt,cts,t=>ocStream.part(t),member);}finally{ocStream.done();}
  }
  async function subAsk(parent,sub,cts){
    parent=portsEffective(selected.collaboration,parent);
    let model=await teamModel(parent.model);if(!model&&parent.fallbackModel)model=await teamModel(parent.fallbackModel);if(!model)throw Error(`子代理 ${sub.name} 的模型不可用`);
    const past=(sub.history||[]).slice(-20).map(h=>`[${h.role==='parent'?parent.name:'你'}] ${h.text}`).join('\n');
    const prompt=`你是「${parent.name}」（${parent.roleName}）临时创建的子代理「${sub.name}」。你只对 ${parent.name} 负责，看不到任何群聊，也不能再创建子代理、派任务或点名其他人。
权限在创建时已固定，需要超出权限的操作时，不要尝试，直接在回答里说明限制。
直接完成交代的工作，最后给出清楚、可直接使用的结果。

${past?'之前的往来：\n'+past+'\n\n':''}${parent.name} 交代给你：
${sub.history?.at(-1)?.text||sub.task}

你的回答：`;
    return lmText(model,prompt,cts,null,parent);
  }
  async function teamCreateTask(id,member,title,goal,by,channel,extra={}){
    member={...member,model:portsEffective(id,member)?.model||member.model};
    const dependencies=[],wait=String(goal).match(/[（(]\s*等待\s*[:：]\s*([^）)]+)[）)]\s*$/);
    if(wait){goal=goal.slice(0,wait.index).trim()||goal;const names=wait[1].split(/[、,，]/).map(s=>s.trim()).filter(Boolean),mine=new Set(teamLoad(id).chat.filter(x=>x.kind==='task'&&x.taskId).map(x=>x.taskId)),all=service.snapshot(id).tasks||[],miss=[];
      for(const n of names){const hit=all.filter(t=>mine.has(t.id)&&t.title===n&&t.status!=='cancelled').at(-1);if(hit)dependencies.push(hit.id);else miss.push(n);}
      if(miss.length)sysMsg(id,channel,`任务「${title}」要等的「${miss.join('、')}」没找到（要写完整任务标题），这几项已忽略。`);}
    const state=service.read(),category=(state.taskCategories||[]).find(c=>c.id==='implementation')||(state.taskCategories||[])[0];
    const task=await service.createTask({workspace_id:id,title:title.slice(0,200),goal,role_id:member.roleId,...(category?{category_id:category.id}:{}),...(member.model?{model:member.model}:{}),isolation:'auto',...(dependencies.length?{dependencies:[...new Set(dependencies)]}:{}),client_request_id:'team_'+crypto.randomUUID()});
    if(extra.review){const v=teamLoad(id);v.reviews[task.id]={state:'waiting',...extra.review};teamSave(id,v);}
    teamPush(id,{from:by,kind:'task',taskId:task.id,assignee:member.id,text:`派给 ${member.name}：${title}\n${goal}${dependencies.length?'\n（等前置任务验收后自动开始）':''}`,channel});
    if(member.kind==='api'){try{await workers.authorize([task.id]);}catch(error){sysMsg(id,channel,`任务「${title}」未启动：${error.message}`);}}
    else sysMsg(id,channel,`${member.name} 是外部 MCP 成员，需要它的客户端主动领取任务。`);
    return task;
  }
  // 团队派的任务做完后进入待验收，由用户点「验收通过」才算完成
  // member-custom: the member a team-chat task was assigned to (its #任务 line), so the native run honours that member's settings.
  service.memberForTask=task=>{try{const msg=teamLoad(task.workspaceId).chat.find(m=>m.kind==='task'&&m.taskId===task.id&&m.assignee);if(!msg)return null;const e=staff.store.read().employees.find(e=>e.id===msg.assignee)||null;return e?portsEffective(task.workspaceId,{...e,id:e.id}):null;}catch{return null;}};
  service.teamTaskNeedsReview=task=>{try{return teamLoad(task.workspaceId).chat.some(m=>m.kind==='task'&&m.taskId===task.id);}catch{return false;}};
  const TASK_LINE=/^\s*#任务\s*@(\S+?)\s+(.+?)[：:](.+)$/,SUB_LINE=/^\s*#子代理\s*(.+?)\s*[：:](.+)$/;
  // Handles #子代理 lines in a member reply: create or continue a temporary helper, queue it, return queued steps.
  function teamSpawnSubs(id,member,reply,channel){
    const lines=reply.split(/\r?\n/).map(l=>l.match(SUB_LINE)).filter(Boolean);if(!lines.length)return [];
    const value=teamLoad(id),cfg=subSettings(value,member.id),steps=[],notes=[];
    if(!cfg.allowSubagents){sysMsg(id,channel,`${member.name} 没有创建子代理的权限，已忽略。`,{to:[member.id]});return [];}
    for(const m of lines){const subName=m[1].trim().slice(0,30),text=m[2].trim().slice(0,6000);if(!subName||!text)continue;
      let sub=value.subagents.find(s=>s.parentId===member.id&&s.name===subName);
      if(!sub){if(value.subagents.filter(s=>s.parentId===member.id).length>=cfg.maxSubagents){notes.push(`${member.name} 的子代理已达上限 ${cfg.maxSubagents} 个，「${subName}」未创建。删除不用的子代理后再试。`);continue;}
        sub={id:crypto.randomUUID().slice(0,8),parentId:member.id,name:subName,task:text,status:'queued',createdAt:new Date().toISOString(),history:[]};value.subagents.push(sub);}
      sub.history=[...(sub.history||[]),{role:'parent',text}];sub.status='queued';steps.push({sub:sub.id,parent:member.id});}
    teamSave(id,value);for(const n of notes)sysMsg(id,channel,n,{to:[member.id]});postAll();return steps;
  }
  async function teamRun(id,channel,targets,privateStart=false,leaders=[]){const leaderSet=new Set(leaders);
    if(teamBusy.get(id))throw Error('团队还在回复上一条消息，请稍等或点「停止」。');
    const cts=new vscode.CancellationTokenSource();teamCancel.set(id,cts);let calls=0;const queue=targets.map(t=>({to:t,depth:0,by:'user',audience:privateStart?['user']:null}));
    const dm=channel!=='group';
    try{
      while(queue.length&&calls<TEAM_MAX_CALLS&&!cts.token.isCancellationRequested){
        const step=queue.shift(),allMembers=teamMembers(id),onBoard=teamLoad(id).nodes,members=dm?allMembers:allMembers.filter(m=>onBoard[m.id]);/* 群聊只有画布上的成员参与 */
        if(step.sub){// temporary subagent turn
          const value=teamLoad(id),sub=value.subagents.find(s=>s.id===step.sub),parent=members.find(m=>m.id===step.parent);if(!sub||!parent)continue;
          teamBusy.set(id,{memberId:parent.id,subId:sub.id,name:`${parent.name} 的子代理 ${sub.name}`,channel});sub.status='running';teamSave(id,value);postAll();calls++;
          let answer;try{answer=await subAsk(parent,sub,cts);}catch(error){const v=teamLoad(id),s=v.subagents.find(x=>x.id===sub.id);if(s){s.status='error';teamSave(id,v);}if(cts.token.isCancellationRequested)break;sysMsg(id,channel,`子代理 ${sub.name} 失败：${error.message}`,{to:[parent.id]});continue;}
          const v=teamLoad(id),s=v.subagents.find(x=>x.id===sub.id);if(!s)continue;s.status='idle';s.history=[...(s.history||[]),{role:'sub',text:answer}];teamSave(id,v);
          teamPush(id,{from:'sub:'+sub.id,kind:'chat',text:answer||'（没有输出）',channel,to:[parent.id]});
          // Wake the parent once all of its queued helpers have answered.
          if(!queue.some(q=>q.sub&&q.parent===parent.id)&&!queue.some(q=>q.to===parent.id))queue.push({to:parent.id,depth:step.depth||0,by:'sub',audience:dm?null:step.audience||null});
          continue;}
        const member=members.find(m=>m.id===step.to);if(!member)continue;
        if(!member.enabled){sysMsg(id,channel,`${member.name} 已停用，没有回复。`);continue;}
        if(member.kind!=='api'||!member.model){sysMsg(id,channel,`${member.name} 是外部 MCP 成员，不能直接聊天；给它派任务即可。`);continue;}
        teamBusy.set(id,{memberId:member.id,name:member.name,channel});postAll();calls++;
        let reply;try{reply=await teamAsk(member,members,teamLoad(id),channel,cts,!dm&&leaderSet.has(member.id));}catch(error){if(cts.token.isCancellationRequested)break;sysMsg(id,channel,`${member.name} 回复失败：${error.message}`);continue;}
        if(!reply)continue;
        if(leaderSet.has(member.id)&&/^\s*#结束\s*$/.test(reply))continue;/* 组长无需补充 */
        const team=teamLoad(id),rel=teamRelations(team,member.id),linked=new Set([...rel.up,...rel.down,...rel.peers]);
        const body=reply.replace(/^\s*#任务.*$/gm,'').replace(/^\s*#子代理.*$/gm,'');
        const mentioned=dm?[]:teamMentions(body,members).filter(x=>x.id!==member.id)/* 群聊里 @ 谁都能叫到，不要求画布连线 */;
        // Private when it names someone, or when it answers a private message ('user' = only the user sees it).
        const to=dm?[]:[...new Set([...mentioned.map(x=>x.id),...(step.audience||[])])];
        teamPush(id,{from:member.id,kind:'chat',text:reply,channel,to});
        for(const v of reviewVerdicts(reply))await portsVerdict(id,member,v,channel,members);
        for(const line of reply.split(/\r?\n/)){const b=line.match(/^\s*#受阻\s*(.+)$/);if(!b)continue;const why=b[1].trim().slice(0,300);sysMsg(id,channel,`⚠ ${member.name} 卡住了，需要你处理：${why}`);void vscode.window.showWarningMessage(`团队协作：${member.name} 卡住了：${why}`);}
        for(const line of reply.split(/\r?\n/)){const m=line.match(TASK_LINE);if(!m)continue;const target=members.find(x=>x.name===m[1]);if(!target)continue;
          if(target.id!==member.id&&!rel.down.includes(target.id)){sysMsg(id,channel,`${member.name} 不是 ${target.name} 的上级，不能派任务。`);continue;}
          await teamCreateTask(id,target,m[2].trim(),m[3].trim(),member.id,channel);}
        for(const s of teamSpawnSubs(id,member,reply,channel))queue.push({...s,depth:step.depth,audience:to.length?to:null});
        if(dm||step.depth>=TEAM_MAX_DEPTH)continue;
        for(const x of mentioned)if(!queue.some(q=>q.to===x.id))queue.push({to:x.id,depth:step.depth+1,by:member.id,audience:[member.id]});
        // 负责人（用户 @ 的人）派出的同级/下级都回报完（且没有再点名别人）后，再叫负责人判断下一步
        if(leaderSet.has(step.by)&&member.id!==step.by&&!mentioned.length&&!queue.some(q=>q.by===step.by||q.to===step.by))queue.push({to:step.by,depth:step.depth+1,by:member.id,audience:privateStart?['user']:null});
      }
      if(calls>=TEAM_MAX_CALLS&&queue.length)sysMsg(id,channel,`本轮已达 ${TEAM_MAX_CALLS} 次回复上限，自动暂停。继续请再发一条消息。`);
    }finally{const v=teamLoad(id);let fix=false;for(const s of v.subagents)if(s.status==='running'||s.status==='queued'){s.status='idle';fix=true;}if(fix)teamSave(id,v);teamBusy.delete(id);teamCancel.delete(id);cts.dispose();postAll();}
  }

  // ===== 全员 / 合议模式（群聊里不 @ 人时） =====
  function teamChair(team,ids){const mg=team.edges.filter(e=>e.type==='manage'&&e.from!==e.to),managed=new Set(mg.map(e=>e.to));const top=ids.filter(x=>!managed.has(x)&&mg.some(e=>e.from===x));if(top.length)return top[0];const pos=Object.fromEntries(ids.map(x=>[x,teamMemberPos(team,x)]));return ids.slice().sort((a,b)=>(pos[a]?.y??0)-(pos[b]?.y??0)||(pos[a]?.x??0)-(pos[b]?.x??0))[0];}
  // 同一份聊天快照，所有人同时独立回答；每个回答一到就交给 onReply
  async function teamParallel(id,channel,ids,cts,label,extra,snap,members,onReply,stat){/* OpenCode p32: stat.calls 统计本轮调用模型次数 */const list=ids.map(x=>members.find(m=>m.id===x)).filter(Boolean);let left=list.length;const busy=()=>{teamBusy.set(id,{memberId:null,name:label+'（还剩 '+left+' 人）',channel});postAll();};busy();
    const out=await Promise.all(list.map(async m=>{let reply='';if(stat)stat.calls++;try{reply=await teamAsk(m,members,snap,channel,cts,false,extra)||'';}catch(error){if(!cts.token.isCancellationRequested)sysMsg(id,channel,m.name+' 回复失败：'+error.message);}left--;if(reply&&!cts.token.isCancellationRequested)onReply(m,reply);if(!cts.token.isCancellationRequested)busy();return {member:m,reply};}));
    return out.filter(x=>x.reply);}
  async function teamAfterReply(id,member,reply,channel,members,anyTarget,limit){const rel=teamRelations(teamLoad(id),member.id);let n=0;
    for(const line of reply.split(/\r?\n/)){const b=line.match(/^\s*#受阻\s*(.+)$/);if(b){const why=b[1].trim().slice(0,300);sysMsg(id,channel,'⚠ '+member.name+' 卡住了，需要你处理：'+why);void vscode.window.showWarningMessage('团队协作：'+member.name+' 卡住了：'+why);continue;}
      const m=line.match(TASK_LINE);if(!m)continue;const target=members.find(x=>x.name===m[1]);if(!target)continue;
      if(!anyTarget&&target.id!==member.id&&!rel.down.includes(target.id)){sysMsg(id,channel,member.name+' 不是 '+target.name+' 的上级，不能派任务。');continue;}
      if(n++>=limit){sysMsg(id,channel,'合议只派一个执行者，多余的任务「'+m[2].trim()+'」已忽略。');continue;}
      await teamCreateTask(id,target,m[2].trim(),m[3].trim(),member.id,channel);}}
  function teamStart(id){if(teamBusy.get(id))throw Error('团队还在回复上一条消息，请稍等或点「停止」。');const cts=new vscode.CancellationTokenSource();teamCancel.set(id,cts);return cts;}
  function teamEnd(id,cts){teamBusy.delete(id);teamCancel.delete(id);cts.dispose();postAll();}
  // OpenCode p32: 候选答案去掉首尾空白、合并连续空白后全部相同，就不必再互评/合成
  const ocNorm=s=>String(s||'').replace(/\s+/g,' ').trim(),ocAllSame=list=>list.length>1&&list.every(a=>ocNorm(a.reply)===ocNorm(list[0].reply));
  // 全员模式：不 @ 时画布上每个成员都回复
  async function teamBest(id,channel,ids){const cts=teamStart(id),F={fold:'best:'+Date.now(),foldLabel:'择优过程'},L=i=>String.fromCharCode(65+i),stat={calls:0};/* OpenCode p32: 本轮调用模型计数 */
    try{const snap=teamLoad(id),members=teamMembers(id).filter(m=>teamOnCanvas(snap,m.id));
      const s1='【择优模式 · 第一步 · 各自完成】全体成员同时、各自独立地把用户最新的要求完整做一遍（给出完整的方案、答案或代码），这一步你看不到别人的结果。\n按这个格式写：\n方案：（完整内容）\n思路：\n自评：（优点、不足、风险）\n不要 @ 别人，不要派任务。';
      const answers=await teamParallel(id,channel,ids,cts,'择优·各自完成',s1,snap,members,(m,r)=>teamPush(id,{from:m.id,kind:'chat',text:'【各自完成】\n'+r,channel,to:[],...F}),stat);
      if(cts.token.isCancellationRequested||!answers.length)return;
      if(answers.length===1){const a=answers[0];teamPush(id,{from:a.member.id,kind:'chat',text:a.reply,channel,to:[]});await teamAfterReply(id,a.member,a.reply,channel,members,true,1);return;}
      // OpenCode p32: 所有方案规范化后完全相同 → 跳过互相分析和合成，直接把这份方案作为最终版本（仍标记 verdict）
      if(ocAllSame(answers)){const a=answers.find(x=>x.member.id===teamChair(snap,ids))||answers[0];stat.note='（全体 '+answers.length+' 个方案完全相同，已跳过互相分析与合成）';teamPush(id,{from:a.member.id,kind:'chat',text:a.reply.trim(),channel,to:[],verdict:true});await teamAfterReply(id,a.member,a.reply,channel,members,true,1);return;}
      const order=answers.map(a=>({a,r:Math.random()})).sort((x,y)=>x.r-y.r).map(x=>x.a),anon=order.map((a,i)=>'方案 '+L(i)+'：\n'+a.reply).join('\n\n');
      const s2='【择优模式 · 第二步 · 互相分析】下面是全体成员各自完成的方案（匿名，其中一个可能是你的，不要偏袒）。\n逐个分析每个方案的正确性、完整性、亮点和缺陷，指出哪些部分值得放进最终方案。\n最后单独一行输出：FINAL RANKING: 字母从好到差，例如 FINAL RANKING: B > A > C\n\n'+anon;
      const reviews=await teamParallel(id,channel,ids,cts,'择优·互相分析',s2,snap,members,(m,r)=>teamPush(id,{from:m.id,kind:'chat',text:'【互相分析】\n'+r,channel,to:[],...F}),stat);
      if(cts.token.isCancellationRequested)return;
      const score={};order.forEach((_,i)=>score[L(i)]=[]);for(const r of reviews){const line=r.reply.match(/FINAL RANKING\s*[:：]\s*(.+)/i);if(!line)continue;[...new Set((line[1].match(/[A-Z]/g)||[]).filter(x=>x in score))].forEach((x,i)=>score[x].push(i+1));}
      const rank=order.map((a,i)=>{const v=score[L(i)];return {a,label:L(i),avg:v.length?v.reduce((p,q)=>p+q,0)/v.length:null};}).sort((x,y)=>(x.avg??99)-(y.avg??99));
      const rankText=rank.map(x=>x.a.member.name+'（方案 '+x.label+'）平均名次 '+(x.avg==null?'无':x.avg.toFixed(2))).join('；');if(reviews.length)sysMsg(id,channel,'互评排名：'+rankText,F);
      const synth=members.find(m=>m.id===teamChair(snap,ids))||rank[0].a.member;
      teamBusy.set(id,{memberId:synth.id,name:synth.name+'（合成最佳）',channel});postAll();
      const s3='【择优模式 · 第三步 · 合成最佳】你负责把大家的成果合成一个最好的最终版本。下面是各方案（已还原署名）、互相分析和排名。不要只挑一个，要取各方案的长处、修掉被指出的问题，输出一个完整、可直接使用的最终版本。\n按这个格式输出：\n最终方案：（完整内容）\n采纳了：（来自谁的哪些优点）\n舍弃了：（以及原因）\n需要真正动手修改项目时，最多写一行：#任务 @名字 标题：具体要求（只派一个执行者）。\n\n'+order.map((a,i)=>a.member.name+'（方案 '+L(i)+'）：\n'+a.reply).join('\n\n')+'\n\n互相分析：\n'+reviews.map(r=>r.member.name+'：\n'+r.reply).join('\n\n')+'\n\n排名：'+rankText;
      let final='';stat.calls++;try{final=await teamAsk(synth,members,snap,channel,cts,false,s3)||'';}catch(error){if(!cts.token.isCancellationRequested)sysMsg(id,channel,synth.name+' 合成失败：'+error.message);return;}
      if(!final||cts.token.isCancellationRequested)return;
      teamPush(id,{from:synth.id,kind:'chat',text:final,channel,to:[],verdict:true});/* OpenCode p33: 择优合成的最终版本标记为 verdict */await teamAfterReply(id,synth,final,channel,members,true,1);
    }catch(error){if(!cts.token.isCancellationRequested)sysMsg(id,channel,'择优中断：'+error.message);}finally{try{if(stat.calls)sysMsg(id,channel,'本轮调用模型 '+stat.calls+' 次'+(stat.note||'')+(cts.token.isCancellationRequested?'（已停止）':''));}catch{}/* OpenCode p32 */teamEnd(id,cts);}}
  async function teamAll(id,channel,ids){const cts=teamStart(id);
    try{const snap=teamLoad(id),members=teamMembers(id).filter(m=>teamOnCanvas(snap,m.id)),skip=r=>/^\s*#跳过\s*$/.test(r);
      const extra='【全员模式】用户这条消息没有 @ 任何人，全体成员会同时各自回复，你看不到别人这一轮的回复。从你的岗位出发回答；没有要补充的，只回复「#跳过」。';
      const res=await teamParallel(id,channel,ids,cts,'全员回复',extra,snap,members,(m,r)=>{if(!skip(r))teamPush(id,{from:m.id,kind:'chat',text:r,channel,to:[]});});
      for(const r of res)if(!skip(r.reply)&&!cts.token.isCancellationRequested)await teamAfterReply(id,r.member,r.reply,channel,members,false,99);
    }finally{teamEnd(id,cts);}}
  // 合议模式：独立作答 → 匿名互评 → 主席总结；共识度低于 0.8 再来一轮，最多 3 轮
  async function teamCouncil(id,channel,ids){const cts=teamStart(id),MAX_ROUNDS=3,STOP=0.8,F={fold:'council:'+Date.now(),foldLabel:'合议过程'},ocDone=(f,r)=>{const c=Number((String(f).match(/CONSENSUS\s*[:：]\s*([0-9.]+)/i)||[])[1]);return !(Number.isFinite(c)&&c<STOP)||r===MAX_ROUNDS;};
    let st={calls:0},total=0,cur=0;/* OpenCode p32: st=本轮调用模型次数，total=之前各轮累计 */
    try{const snap=teamLoad(id),members=teamMembers(id).filter(m=>teamOnCanvas(snap,m.id)),chair=members.find(m=>m.id===teamChair(snap,ids));let summary='';
      for(let round=1;round<=MAX_ROUNDS&&!cts.token.isCancellationRequested;round++){total+=st.calls;st={calls:0};cur=round;
        const s1='【合议模式 · 第 '+round+' 轮 · 独立作答】全体成员同时独立回答用户最新的问题，这一轮你看不到别人的答案。\n'+(summary?'上一轮主席总结如下，重点解决其中的分歧和未解决问题，可以修正你之前的看法：\n'+summary+'\n':'')+'按这个格式写：\n结论：\n理由：\n风险：\n关键点：（别人可能想不到的地方）\n不要 @ 别人，不要派任务。';
        const answers=await teamParallel(id,channel,ids,cts,'合议第 '+round+' 轮·独立作答',s1,snap,members,(m,r)=>teamPush(id,{from:m.id,kind:'chat',text:'【第 '+round+' 轮 · 独立作答】\n'+r,channel,to:[],...F}),st);
        if(cts.token.isCancellationRequested||!answers.length)break;
        // OpenCode p32: 全体答案规范化后完全相同 → 跳过互评和主席总结，直接作为最终结论（仍标记 verdict）
        if(ocAllSame(answers)){const a=(chair&&answers.find(x=>x.member.id===chair.id))||answers[0];st.note='（全体 '+answers.length+' 个答案完全相同，已跳过互评与主席总结）';teamPush(id,{from:a.member.id,kind:'chat',text:a.reply.trim(),channel,to:[],verdict:true});await teamAfterReply(id,a.member,a.reply,channel,members,true,1);break;}
        const order=answers.map(a=>({a,r:Math.random()})).sort((x,y)=>x.r-y.r).map(x=>x.a),L=i=>String.fromCharCode(65+i);
        const anon=order.map((a,i)=>'答案 '+L(i)+'：\n'+a.reply).join('\n\n');let reviews=[];
        if(order.length>1){const s2='【合议模式 · 第 '+round+' 轮 · 匿名互评】下面是全体成员对用户问题的匿名答案，其中一个可能是你自己写的，不要偏袒。\n逐个指出每个答案的错误、遗漏和亮点；特别检查只有一个答案提到的关键点是否正确，正确就明确说出来。\n最后单独一行输出：FINAL RANKING: 字母从好到差，例如 FINAL RANKING: B > A > C\n\n'+anon;
          reviews=await teamParallel(id,channel,ids,cts,'合议第 '+round+' 轮·匿名互评',s2,snap,members,(m,r)=>teamPush(id,{from:m.id,kind:'chat',text:'【第 '+round+' 轮 · 匿名互评】\n'+r,channel,to:[],...F}),st);}
        if(cts.token.isCancellationRequested)break;
        const score={};order.forEach((_,i)=>score[L(i)]=[]);
        for(const r of reviews){const line=r.reply.match(/FINAL RANKING\s*[:：]\s*(.+)/i);if(!line)continue;[...new Set((line[1].match(/[A-Z]/g)||[]).filter(x=>x in score))].forEach((x,i)=>score[x].push(i+1));}
        const rank=order.map((a,i)=>{const v=score[L(i)];return {name:a.member.name,label:L(i),avg:v.length?v.reduce((p,q)=>p+q,0)/v.length:null};}).sort((x,y)=>(x.avg??99)-(y.avg??99));
        const rankText=rank.map(x=>x.name+'（答案 '+x.label+'）平均名次 '+(x.avg==null?'无':x.avg.toFixed(2))).join('；');
        if(reviews.length)sysMsg(id,channel,'第 '+round+' 轮互评排名：'+rankText,F);
        if(!chair)break;
        teamBusy.set(id,{memberId:chair.id,name:chair.name+'（主席）',channel});postAll();
        const s3='【合议模式 · 第 '+round+' 轮 · 主席总结】你是这次合议的主席。下面是各成员的答案（已还原署名）、互评和平均排名。不要按票数决定，要按道理：只有一个人想到的关键点，只要正确就采纳。\n按这个格式输出：\n共识：\n分歧：\n独到见解：（逐条判断对错）\n未解决：\n最终方案：\n最后单独一行：CONSENSUS: 0 到 1 的数字（成员意见一致的程度）\n需要真正动手修改项目时，最多写一行：#任务 @名字 标题：具体要求（只派一个执行者）。\n\n'+order.map((a,i)=>a.member.name+'（答案 '+L(i)+'）：\n'+a.reply).join('\n\n')+'\n\n互评：\n'+(reviews.map(r=>r.member.name+'：\n'+r.reply).join('\n\n')||'（只有一个答案，没有互评）')+'\n\n排名：'+rankText;
        let final='';st.calls++;try{final=await teamAsk(chair,members,snap,channel,cts,false,s3)||'';}catch(error){if(!cts.token.isCancellationRequested)sysMsg(id,channel,'主席 '+chair.name+' 总结失败：'+error.message);break;}
        if(!final||cts.token.isCancellationRequested)break;
        teamPush(id,{from:chair.id,kind:'chat',text:(ocDone(final,round)?'':'【第 '+round+' 轮 · 主席总结】\n')+final,channel,to:[],...(ocDone(final,round)?{verdict:true}:F)}); // OpenCode p33: 合议最终的主席总结标记为 verdict，GitHub 审查按标记取结论，不看消息顺序
        const c=Number((final.match(/CONSENSUS\s*[:：]\s*([0-9.]+)/i)||[])[1]);
        if(!(Number.isFinite(c)&&c<STOP)||round===MAX_ROUNDS){await teamAfterReply(id,chair,final,channel,members,true,1);break;}
        summary=final.replace(/^\s*#任务.*$/gm,'');sysMsg(id,channel,'共识度 '+c+'，低于 '+STOP+'，进入第 '+(round+1)+' 轮。（第 '+round+' 轮调用模型 '+st.calls+' 次）',F);}
    }finally{try{if(st.calls)sysMsg(id,channel,'本轮调用模型 '+st.calls+' 次'+(st.note||'')+(cur>1?'（第 '+cur+' 轮；合议共 '+(total+st.calls)+' 次）':'')+(cts.token.isCancellationRequested?'（已停止）':''));}catch{}/* OpenCode p32 */teamEnd(id,cts);}}

  // ===== @team：在原生 Chat 里和团队对话，复用 Chat 的输入框、附件、MCP 工具、语音、Markdown 渲染、停止 =====
  // ===== 审批放进对应的聊天：用一个内部工具触发原生 Chat 的行内确认（没有聊天上下文时才回退到弹窗） =====
  try{context.subscriptions.push(vscode.lm.registerTool('opencode_confirm',{prepareInvocation(o){const i=o?.input||{};return {invocationMessage:String(i.title||'等待确认'),confirmationMessages:{title:String(i.title||'需要确认'),message:new vscode.MarkdownString(i.detail?'```\n'+String(i.detail).slice(0,4000)+'\n```':'')}};},invoke(){return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('__OC_ALLOWED__')]);}}));
    globalThis.__ocInChatConfirm=async(token,title,detail,cancel)=>{if(!token)return undefined;try{const r=await vscode.lm.invokeTool('opencode_confirm',{input:{title:String(title||''),detail:String(detail||'')},toolInvocationToken:token},cancel);return (r?.content||[]).some(p=>String(p?.value??'').includes('__OC_ALLOWED__'));}catch(error){const msg=String(error?.message||error);if(/not found|unknown tool|no tool|not registered/i.test(msg)){output?.appendLine?.('[confirm] '+msg);return undefined;}return false;}};}catch(error){output?.appendLine?.('[confirm] '+error.message);}
  async function openTeamChat(text){try{await vscode.commands.executeCommand('workbench.action.chat.open',{query:'@team '+(text||''),isPartialQuery:true});}catch{await vscode.commands.executeCommand('workbench.action.chat.open','@team '+(text||''));}}
  async function teamRefText(ref){const v=ref?.value;try{if(typeof v==='string')return v;let uri=null,range=null;if(v instanceof vscode.Uri)uri=v;else if(v&&v.uri instanceof vscode.Uri){uri=v.uri;range=v.range;}if(!uri)return '';const st=await vscode.workspace.fs.stat(uri);if(st.type&vscode.FileType.Directory)return '';if(st.size>200*1024)return '（文件超过 200 KB，未附内容）';let t=Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8');if(/\u0000/.test(t.slice(0,2000)))return '（二进制文件，未附内容）';if(range)t=t.split(/\r?\n/).slice(range.start.line,range.end.line+1).join('\n');return t;}catch(error){return '（读取失败：'+error.message+'）';}}
  try{const tp=vscode.chat.createChatParticipant('opencode.team',async(request,chatContext,stream,token)=>{
    const id=selected.collaboration,memberName=mid=>teamMembers(id).find(m=>m.id===mid)?.name||mid;
    let text=String(request.prompt||'').trim();const extra=[];let channel='group',dmName='';
    {/* @team 名字 …：私聊这个成员；@team …：群聊 */const ms=teamMembers(id).slice().sort((a,b)=>b.name.length-a.name.length);const hit=ms.find(m=>text===m.name||text.startsWith(m.name+' ')||text.startsWith(m.name+'\n')||text.startsWith(m.name+'：')||text.startsWith(m.name+':')||text.startsWith(m.name+'，')||text.startsWith(m.name+','));
     if(hit){if(hit.kind!=='api'){stream.markdown(hit.name+' 是外部 MCP 成员，不能直接聊天，只能领任务。');return {};}channel='dm:'+hit.id;dmName=hit.name;text=text.slice(hit.name.length).replace(/^[\s：:，,]+/,'').trim();}}
    for(const ref of request.references||[]){const name=ref.name||(ref.value?.path||ref.value?.uri?.path||'').split('/').pop()||'附件';if(String(ref.id||'').startsWith('vscode.prompt'))continue;const body=await teamRefText(ref);if(body)extra.push('附件 '+name+'：\n```\n'+body+'\n```');}
    const tools=(request.toolReferences||[]).map(t=>t.name).filter(Boolean);if(tools.length)extra.push('用户希望用到的工具：'+tools.join('、'));
    if(!text&&!extra.length){stream.markdown(dmName?'写上要发给 '+dmName+' 的内容。':'请输入要发给团队的消息。@team 名字 可以私聊成员，消息里写 @成员名 可以在群里点名。');return {};}
    text=[text||'请看附件。',...extra].join('\n\n');
    const before=new Set(teamLoad(id).chat.map(m=>m.id));
    try{await teamAction('teamSend',{text,channel});}catch(error){stream.markdown('发送失败：'+error.message);return {};}
    const stop=token.onCancellationRequested(()=>{teamAction('teamStop',{}).catch(()=>{});});
    const shown=new Set();let idle=0,lastBusy='';const t0=Date.now();
    // 流式：成员生成时逐段写进 Chat；并行时只流第一个人，其余等完成后整段显示
    let live=null;const streamed=new Map();const LS=globalThis.__ocTeamStreamListeners||(globalThis.__ocTeamStreamListeners=new Set());
    const onStream=e=>{if(token.isCancellationRequested||e.channel!==channel||e.quiet)return;if(e.done){if(live&&live.memberId===e.memberId){if(live.sent)streamed.set(e.memberId,live.sent);stream.markdown('\n\n---\n\n');live=null;}return;}const t=String(e.text||'');if(!t)return;if(!live){live={memberId:e.memberId,sent:''};stream.markdown('**'+memberName(e.memberId)+'**\n\n');}if(live.memberId!==e.memberId||!t.startsWith(live.sent))return;const d=t.slice(live.sent.length);if(d){stream.markdown(d);live.sent=t;}};LS.add(onStream);
    try{while(!token.isCancellationRequested&&Date.now()-t0<30*60e3){
      const chat=teamLoad(id).chat;for(const m of chat){if(before.has(m.id)||shown.has(m.id))continue;shown.add(m.id);if(m.channel!==channel||m.from==='user'||m.from==='chat')continue;if(m.fold){stream.progress(memberName(m.from==='system'?'':m.from)+(m.from==='system'?'':'：')+(m.foldLabel||'过程')+' · '+String(m.text||'').replace(/^【[^】]*】\s*/,'').replace(/\s+/g,' ').slice(0,60));continue;}if(m.from==='system'){stream.markdown('> '+String(m.text||'').replace(/\n/g,'\n> ')+'\n\n');continue;}{const sent=streamed.get(m.from);if(sent!==void 0){const a=sent.trim(),b=String(m.text||'').trim();if(a===b||a.startsWith(b.slice(0,60))||b.startsWith(a.slice(0,60))){streamed.delete(m.from);continue;}}}stream.markdown('**'+memberName(m.from)+'**'+(m.to?.length?' → '+m.to.map(memberName).join('、'):'')+'\n\n'+String(m.text||'')+'\n\n---\n\n');}
      const busy=teamBusy.get(id);if(busy){idle=0;const label=(busy.name||'团队')+' 正在回复…';if(label!==lastBusy){lastBusy=label;stream.progress(label);}}else if(++idle>6)break;
      await new Promise(r=>setTimeout(r,300));}}
    finally{stop.dispose();LS.delete(onStream);}
    if(!shown.size)stream.markdown('（团队没有回复）');return {metadata:{opencodeTeam:true}};
  });tp.iconPath=new vscode.ThemeIcon('organization');context.subscriptions.push(tp);}catch(error){output?.appendLine?.('[team-chat] '+error.message);}
  async function teamAction(action,input){
    const id=selected.collaboration;
    switch(action){
      case 'teamOpenChat':{await openTeamChat(input?.text||'');return {ok:true};}
      // OpenCode p31: 按钮置灰时仍可点，点了弹提示说明原因（没装 Speech 扩展可一键打开扩展页），不再静默无反应
      case 'teamVoice':{const caps=await ocRefreshTeamCaps();if(!caps.speech){void Promise.resolve(vscode.window.showInformationMessage('语音输入需要安装 VS Code Speech 扩展（ms-vscode.vscode-speech）。安装后语音按钮会自动可用。','打开扩展页')).then(p=>{if(p)return vscode.commands.executeCommand('workbench.extensions.search','ms-vscode.vscode-speech');}).catch(()=>{});return {ok:false,reason:'no-speech'};}
        if(!caps.voiceCmd){void vscode.window.showInformationMessage('已安装 VS Code Speech 扩展，但当前版本没有语音聊天命令（workbench.action.chat.*VoiceChat*），暂时不能语音输入。');return {ok:false,reason:'no-voice-command'};}
        await openTeamChat('');await vscode.commands.executeCommand(caps.voiceCmd);return {ok:true};}
      case 'teamMcp':{const caps=await ocRefreshTeamCaps();if(!caps.mcpCmd){void vscode.window.showInformationMessage('当前版本没有 MCP 命令（workbench.mcp.* / workbench.action.chat.configureTools），无法打开 MCP 管理。');return {ok:false,reason:'no-mcp-command'};}await openTeamChat('');await vscode.commands.executeCommand(caps.mcpCmd);return {ok:true};}
      case 'teamLayout':{const value=teamLoad(id);if(input.nodes&&typeof input.nodes==='object'){const known=new Set(teamMembers(id).map(m=>m.id));for(const [k,v] of Object.entries(input.nodes)){if(!teamNodeKeyOk(k))continue;if(v===null){/* 删除节点：只删这一个节点和接在它上面的线（同一成员的其他节点不动，没有主/副之分） */teamDropNode(value,k);}else if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y)){const p={x:Math.round(v.x),y:Math.round(v.y)};if(value.nodes[k]){value.nodes[k]={...value.nodes[k],...p};continue;}const mid=typeof v.memberId==='string'&&v.memberId?v.memberId:teamBaseId(k);if(teamCopyKey(k)&&!known.has(mid))throw Error('成员不存在。');value.nodes[k]={...p,memberId:mid};}}}teamSave(id,value);postAll();return {ok:true};}
      // collab-ports: 提供节点与接口线
      case 'portProvider':{const value=teamLoad(id),type=String(input.type||'');let pid=input.id?String(input.id):null;if(pid&&!value.providers[pid])throw Error('节点不存在。');if(!pid){if(!PROVIDER_TYPES[type])throw Error('未知的节点类型。');if(Object.keys(value.providers).length>=80)throw Error('画布上的接口节点最多 80 个。');pid='p_'+crypto.randomUUID().replace(/-/g,'').slice(0,12);value.providers[pid]={type,name:PROVIDER_TYPES[type].label,x:0,y:0,config:normalizeProviderConfig(type,{})};}
        const p=value.providers[pid];if(input.name!=null)p.name=String(input.name).trim().slice(0,40)||PROVIDER_TYPES[p.type].label;if(Number.isFinite(input.x))p.x=Math.round(input.x);if(Number.isFinite(input.y))p.y=Math.round(input.y);if(input.config&&typeof input.config==='object')p.config=normalizeProviderConfig(p.type,{...p.config,...input.config});
        teamSave(id,value);return {ok:true,id:pid,provider:p};}
      case 'teamCollapse':{const value=teamLoad(id),ids=[].concat(input.ids||[]).map(String).filter(Boolean),set=new Set(value.collapsed||[]);for(const k of ids)input.collapsed?set.add(k):set.delete(k);value.collapsed=[...set].slice(0,500);teamSave(id,value);return {ok:true,collapsed:value.collapsed};}
      case 'portProviderFlags':{const value=teamLoad(id),ids=[].concat(input.ids||[]).map(String);for(const k of ids){const p=value.providers[k];if(!p)continue;if('bypass' in input){if(input.bypass)p.bypass=true;else delete p.bypass;}}teamSave(id,value);return {ok:true};}
      case 'portFeedVia':{const value=teamLoad(id),f=value.feeds.find(x=>x.id===input.id);if(!f)throw Error('连线不存在。');const via=portsCleanVia(input.via);if(via.length)f.via=via;else delete f.via;teamSave(id,value);return {ok:true,via};}
      case 'teamGroups':{const value=teamLoad(id);value.groups=teamGroupsClean(input.groups);teamSave(id,value);return {ok:true,groups:value.groups};}
      case 'portProviderMove':{const value=teamLoad(id);for(const [k,p] of Object.entries(input.nodes||{}))if(value.providers[k]&&Number.isFinite(p?.x)&&Number.isFinite(p?.y)){value.providers[k].x=Math.round(p.x);value.providers[k].y=Math.round(p.y);}teamSave(id,value);return {ok:true};}
      case 'portProviderDelete':{const value=teamLoad(id),pid=String(input.id||'');if(!value.providers[pid])throw Error('节点不存在。');const removed={provider:value.providers[pid],feeds:value.feeds.filter(f=>f.from===pid),board:value.board[pid]||null};delete value.providers[pid];delete value.board[pid];value.feeds=value.feeds.filter(f=>f.from!==pid);teamSave(id,value);return {ok:true,removed};}
      case 'portFeed':{const value=teamLoad(id),ids=new Set(teamMembers(id).map(m=>m.id)),feed={id:'f_'+crypto.randomUUID().replace(/-/g,'').slice(0,12),from:String(input.from||''),to:String(input.to||''),port:String(input.port||''),...(input.out?{out:String(input.out)}:{}),at:new Date().toISOString()};
        if(!isProviderId(feed.from)&&!teamNodeExists(value,feed.from))throw Error('来源节点不在画布上。');if(!teamNodeExists(value,feed.to))throw Error('目标成员不在画布上。');
        const r=checkFeed(value,ids,feed,{replace:input.replace!==false});if(!r.ok)throw Error(r.reason);const replaced=value.feeds.filter(f=>r.replace.includes(f.id));value.feeds=value.feeds.filter(f=>!r.replace.includes(f.id));if(input.mode==='override')feed.mode='override';else if(['tools','knowledge','rules'].includes(feed.port))feed.mode='merge';value.feeds.push(feed);teamSave(id,value);return {ok:true,feed,replaced};}
      case 'portUnfeed':{const value=teamLoad(id),list=[].concat(input.id||[]).map(String),gone=value.feeds.filter(f=>list.includes(f.id));value.feeds=value.feeds.filter(f=>!list.includes(f.id));teamSave(id,value);return {ok:true,removed:gone};}
      case 'portFeedMode':{const value=teamLoad(id),f=value.feeds.find(x=>x.id===input.id);if(!f)throw Error('连线不存在。');if(!['tools','knowledge','rules'].includes(f.port))throw Error('这个接口只能接一根线，没有合并方式。');f.mode=input.mode==='override'?'override':'merge';teamSave(id,value);return {ok:true};}
      case 'portBoardClear':{const value=teamLoad(id);if(!value.providers[input.id])throw Error('看板不存在。');value.board[input.id]=[];teamSave(id,value);return {ok:true};}
      case 'teamEdge':{/* collab-nodes: 线按节点存，任意两个不同节点都能连（包括同一成员的两个节点） */const value=teamLoad(id),ids=new Set(teamMembers(id).map(m=>m.id)),fromKey=teamResolveNode(value,input.from),toKey=teamResolveNode(value,input.to);
        if(!fromKey||!toKey||!ids.has(teamNodeMember(value,fromKey))||!ids.has(teamNodeMember(value,toKey))){if(input.type==='manage'||input.type==='peer')throw Error('连线两端必须是画布上的成员节点。');teamSave(id,value);return {ok:true};}if(fromKey===toKey)throw Error('节点不能连到自己。');value.edges=value.edges.filter(e=>!teamSamePair(e,fromKey,toKey));
        if(input.type==='manage'||input.type==='peer'){if(input.type==='manage'&&teamManageReach(value.edges,toKey,fromKey))throw Error('管理关系不能形成环。');value.edges.push(teamEdgeRecord(value,fromKey,toKey,input.type));}
        teamSave(id,value);return {ok:true};}
      case 'teamEdges':{/* 一次给一个节点连多个节点（框选 / Ctrl 多选）；同一成员的节点之间也能连 */const value=teamLoad(id),ids=new Set(teamMembers(id).map(m=>m.id)),type=input.type==='peer'?'peer':'manage',fromKey=teamResolveNode(value,input.from),list=Array.isArray(input.to)?[...new Set(input.to)].slice(0,64):[];if(!fromKey||!ids.has(teamNodeMember(value,fromKey)))throw Error('起点节点不在画布上。');const added=[],skipped=[];
        for(const raw of list){const toKey=teamResolveNode(value,raw);if(!toKey||!ids.has(teamNodeMember(value,toKey))||toKey===fromKey){skipped.push({id:raw,reason:toKey===fromKey?'节点不能连到自己':'不是画布上的成员节点'});continue;}const rest=value.edges.filter(e=>!teamSamePair(e,fromKey,toKey));if(type==='manage'&&teamManageReach(rest,toKey,fromKey)){skipped.push({id:raw,reason:'管理关系不能形成环'});continue;}rest.push(teamEdgeRecord(value,fromKey,toKey,type));value.edges=rest;added.push(raw);}
        if(added.length)teamSave(id,value);return {added,skipped};}
      case 'teamPresetSave':{const value=teamLoad(id),name=String(input.name||'').trim().slice(0,40);if(!name)throw Error('请填写预设名称。');if(!Object.keys(value.nodes).length)throw Error('画布上还没有成员。');const ps=presetsLoad();let p=input.presetId?ps.list.find(x=>x.id===input.presetId):null;if(input.presetId&&!p)throw Error('预设不存在。');if(!p){if(ps.list.length>=50)throw Error('最多保留 50 个预设。');p={id:'preset_'+crypto.randomUUID()};ps.list.push(p);}
        const settings={};for(const k of new Set(Object.values(value.nodes).map(n=>n.memberId)))if(value.settings[k])settings[k]={allowSubagents:value.settings[k].allowSubagents===true,maxSubagents:value.settings[k].maxSubagents};delete p.copies;Object.assign(p,{name,nodes:JSON.parse(JSON.stringify(value.nodes)),edges:value.edges.filter(e=>value.nodes[e.fromNode]&&value.nodes[e.toNode]).map(e=>({from:e.from,to:e.to,type:e.type,fromNode:e.fromNode,toNode:e.toNode})),settings,updatedAt:new Date().toISOString()});presetsSave(ps);return {id:p.id};}
      case 'teamPresetApply':{if(teamBusy.get(id))throw Error('团队正在回复，先点「停止」再套用预设。');const ps=presetsLoad(),p=ps.list.find(x=>x.id===input.presetId);if(!p)throw Error('预设不存在。');const value=teamLoad(id),missing=presetApplyTo(value,p,new Set(teamMembers(id).map(m=>m.id)));teamSave(id,value);return {ok:true,missing};}
      case 'teamPresetDelete':{const ps=presetsLoad(),before=ps.list.length;ps.list=ps.list.filter(x=>x.id!==input.presetId);if(ps.list.length===before)throw Error('预设不存在。');if(ps.defaultId===input.presetId)ps.defaultId=null;presetsSave(ps);return {ok:true};}
      case 'teamPresetDefault':{const ps=presetsLoad();if(input.presetId&&!ps.list.some(x=>x.id===input.presetId))throw Error('预设不存在。');ps.defaultId=input.presetId||null;presetsSave(ps);return {ok:true};}
      case 'teamDeleteMember':{const memberId=input.employeeId;await staff.store.mutate('staff-employees',data=>{const e=data.employees.find(x=>x.id===memberId);if(!e)throw Error('成员不存在。');if(e.pairedAgentId||[...staff.bindings.values()].some(b=>b.employeeId===e.id))throw Error('先解除该成员的 MCP 连接绑定。');if(data.tasks.some(t=>t.staff?.employeeId===e.id&&!['completed','cancelled'].includes(t.status)))throw Error('该成员还有未结束的团队任务。');data.employees=data.employees.filter(x=>x.id!==e.id);});
        const value=teamLoad(id);for(const k of teamMemberNodes(value,memberId))teamDropNode(value,k);delete value.settings[memberId];value.edges=value.edges.filter(e=>e.from!==memberId&&e.to!==memberId);value.feeds=value.feeds.filter(f=>teamBaseId(f.to)!==memberId&&teamBaseId(f.from)!==memberId);try{teamAvatarSet(memberId,null);}catch{}value.subagents=value.subagents.filter(s=>s.parentId!==memberId);teamSave(id,value);return {ok:true};}
      case 'teamMemberAvatar':{/* collab-employee: 成员头像（裁剪好的小图 data URL），按成员存，所有项目共用；null = 去掉头像 */const memberId=String(input.memberId||'');if(!teamMembers(id).some(m=>m.id===memberId&&!m.temporary))throw Error('成员不存在。');const url=input.avatar==null||input.avatar===''?null:String(input.avatar);if(url!==null&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url))throw Error('头像必须是 PNG/JPEG/WebP 图片。');if(url&&url.length>200000)throw Error('头像太大，请缩小裁剪区域后再试。');teamAvatarSet(memberId,url);postAll();return {ok:true};}
      case 'teamMemberSettings':{const value=teamLoad(id);if(!teamMembers(id).some(m=>m.id===input.memberId))throw Error('成员不存在。');const max=Number(input.maxSubagents);value.settings[input.memberId]={...(value.settings[input.memberId]||{}),allowSubagents:input.allowSubagents===true,maxSubagents:Number.isInteger(max)?Math.min(SUB_HARD_MAX,Math.max(1,max)):SUB_DEFAULT_MAX};teamSave(id,value);return {ok:true};}
      case 'teamDeleteSubagent':{const busy=teamBusy.get(id);if(busy?.subId&&(input.subId===busy.subId||input.parentId&&busy.memberId===input.parentId))throw Error('这个子代理正在回复，先点「停止」。');const value=teamLoad(id),before=value.subagents.length;value.subagents=value.subagents.filter(s=>input.subId?s.id!==input.subId:s.parentId!==input.parentId);if(value.subagents.length===before)throw Error('子代理不存在。');teamSave(id,value);return {ok:true,removed:before-value.subagents.length};}
      case 'teamSend':{const text=String(input.text||'').trim();if(!text)throw Error('消息为空。');if(text.length>240000)throw Error('消息太长（含附件不超过 240000 字）。');
        if(/(^|\s)@chat(?=\s|$)/i.test(text)){/* @chat：转发到原生 Chat（OpenCode 主对话），回复同步回这里 */const ch0=typeof input.channel==='string'&&input.channel.startsWith('dm:')?input.channel:'group',q=text.replace(/(^|\s)@chat(?=\s|$)/ig,'$1').trim();if(!input._pushed)teamPush(id,{from:'user',kind:'chat',text,channel:ch0,to:[]});if(!q){sysMsg(id,ch0,'@chat 后面写上要发给 Chat 的内容。');return {ok:true};}
          globalThis.__ocTeamChatMirror={query:q,time:Date.now(),done:reply=>{reply=String(reply||'').trim();teamPush(id,{from:'chat',kind:'chat',text:reply||'（Chat 没有文字回复）',channel:ch0,to:[]});}};
          try{await vscode.commands.executeCommand('workbench.action.chat.open',{query:q,isPartialQuery:false});}catch(error){globalThis.__ocTeamChatMirror=null;sysMsg(id,ch0,'发到 Chat 失败：'+error.message);}return {ok:true,chat:true};}const allMembers=teamMembers(id),onBoard=teamLoad(id).nodes;
        const channel=typeof input.channel==='string'&&input.channel.startsWith('dm:')?input.channel:'group',members=channel==='group'?allMembers.filter(m=>onBoard[m.id]):allMembers,dmTarget=channel==='group'?null:members.find(m=>'dm:'+m.id===channel);
        if(channel!=='group'&&!dmTarget)throw Error('私聊对象不存在。');if(teamBusy.get(id)&&!input._pushed){/* 插话：先把消息放进聊天记录（正在回复的成员下一轮就能看到），等这一轮结束后再按正常路由处理 */teamPush(id,{from:'user',kind:'chat',text,channel,to:[],interject:true});(async()=>{const t0=Date.now();while(teamBusy.get(id)&&Date.now()-t0<15*60e3)await new Promise(r=>setTimeout(r,400));try{await teamAction('teamSend',{...input,_pushed:true});}catch(error){sysMsg(id,channel,'插话处理失败：'+error.message);}})();return {ok:true,queued:true};}
        const tasks=[];for(const line of text.split(/\r?\n/)){const m=line.match(TASK_LINE);if(m){const target=members.find(x=>x.name===m[1]);if(!target)throw Error('找不到成员：'+m[1]);tasks.push([target,m[2].trim(),m[3].trim()]);}}
        const body=text.replace(/^\s*#任务.*$/gm,'');let targets=dmTarget?[dmTarget.id]:teamMentions(body,members).map(m=>m.id);const mentionedByUser=!dmTarget&&targets.length>0;
        if(!input._pushed)teamPush(id,{from:'user',kind:'chat',text,channel,to:dmTarget?[]:targets});
        for(const [target,title,goal] of tasks)await teamCreateTask(id,target,title,goal,'user',channel);
        if(dmTarget&&!body.trim())targets=[];
        const mode=teamLoad(id).mode;if(!targets.length&&!tasks.length&&!dmTarget&&mode!=='leader'){const t0=teamLoad(id),talk=members.filter(m=>m.enabled&&m.kind==='api'&&teamOnCanvas(t0,m.id)).map(m=>m.id);if(!talk.length){sysMsg(id,channel,members.length?'画布上没有可以对话的成员（外部 MCP 成员不能直接聊天）。':'画布上还没有成员。先在「画布」里点「＋ 成员」把成员加进团队。');return {ok:true};}(mode==='council'?teamCouncil:mode==='best'?teamBest:teamAll)(id,channel,talk).catch(error=>sysMsg(id,channel,'对话中断：'+error.message));return {ok:true};}
        let leaders=[];if(!targets.length&&!tasks.length&&!dmTarget){const team=teamLoad(id),managed=new Set(team.edges.filter(e=>e.type==='manage'&&e.from!==e.to).map(e=>e.to));const talk=members.filter(m=>m.enabled&&m.kind==='api'&&teamOnCanvas(team,m.id));targets=talk.filter(m=>!managed.has(m.id)&&team.edges.some(e=>e.type==='manage'&&e.from===m.id&&e.to!==m.id)).map(m=>m.id);/* 没有上下级时，画布最上方（同高取最左）的成员当组长：只叫组长，由组长 @ 别人 */if(!targets.length){const pos=Object.fromEntries(talk.map(m=>[m.id,teamMemberPos(team,m.id)]));const lead=talk.slice().sort((a,b)=>(pos[a.id]?.y??0)-(pos[b.id]?.y??0)||(pos[a.id]?.x??0)-(pos[b.id]?.x??0))[0];if(lead){leaders=[lead.id];targets=[lead.id];}}if(!targets.length)sysMsg(id,channel,members.length?'画布上没有可以对话的成员（外部 MCP 成员不能直接聊天）。':'画布上还没有成员。先在「画布」里点「＋ 成员」把成员加进团队。');}
        if(targets.length)teamRun(id,channel,targets,!dmTarget&&mentionedByUser,!dmTarget&&mentionedByUser?targets.slice():leaders).catch(error=>sysMsg(id,channel,'对话中断：'+error.message));return {ok:true};}
      case 'teamMode':{if(!['leader','all','council','best'].includes(input.mode))throw Error('未知模式。');const value=teamLoad(id);value.mode=input.mode;teamSave(id,value);postAll();return {ok:true};}
      case 'teamRules':{const value=teamLoad(id);value.rules=String(input.rules||'').slice(0,4000);teamSave(id,value);postAll();return {ok:true};}
      case 'teamStop':teamCancel.get(id)?.cancel();return {ok:true};
      case 'teamClearChat':{const value=teamLoad(id),channel=typeof input.channel==='string'?input.channel:'group';const gone=new Set(value.chat.filter(m=>(m.channel||'group')===channel&&m.taskId).map(m=>m.taskId));value.chat=value.chat.filter(m=>(m.channel||'group')!==channel);for(const t of gone)delete value.taskSeen[t];teamSave(id,value);return {ok:true};}
    }
    throw Error('不支持此操作。');
  }
  function selectedWorkspace(){
    const workspace=service.workspace(selected.collaboration);
    if(!workspace?.root)throw Error('请先选择已登记的实际项目工作区。');
    return workspace;
  }
  function reviewContext(input){
    if(input.workspaceId!==selected.collaboration)throw Error('工作区已变化，请重新选择任务。');
    const owner=taskService(input.taskId),task=owner.task(owner.read(),input.taskId);
    if(task.workspaceId!==selected.collaboration)throw Error('任务不属于当前工作区。');
    const attempt=owner.collaboration.attempt(task,input.attemptId);
    return {owner,task,attempt};
  }
  async function reviewView(input){
    const {owner,task,attempt}=reviewContext(input),diff=await owner.collaboration.getDiff(task.id,attempt.id);
    if(input.workspaceId!==selected.collaboration)throw Error('读取期间工作区已变化。');
    const recipients=[];
    for(const [id,label] of [[task.owner,'原执行成员'],[task.createdBy,'任务创建者']])
      if(id&&id!=='local-user'&&!recipients.some(item=>item.id===id))recipients.push({id,label:label+' '+id.slice(0,18)});
    return {workspaceId:task.workspaceId,taskId:task.id,taskTitle:task.title,attemptId:attempt.id,diff,diffHash:reviewDiffHash(diff),threads:reviews.list(task.workspaceId,task.id,attempt.id),recipients};
  }
  function handoffView(){
    const workspace=selectedWorkspace(),target=service.resolveMemoryTarget(workspace.id,'local-user');
    if(target.isScratch)throw Error('当前不是项目记忆；不会自动混入其他临时会话。');
    const readSmall=file=>{try{const stat=fs.lstatSync(file);if(stat.isSymbolicLink()||!stat.isFile())return null;if(stat.size>256*1024)return {text:'（文件大于 256 KiB；请单独读取，不在此处截断后冒充完整）',modifiedAt:stat.mtime.toISOString(),oversized:true};return {text:fs.readFileSync(file,'utf8'),modifiedAt:stat.mtime.toISOString()};}catch(error){if(error.code==='ENOENT')return null;throw error;}};
    const main=readSmall(path.join(target.memoryDir,'HANDOFF.md'));
    const backup=(!main||!main.oversized&&!isGoodHandoff(main.text))?readSmall(path.join(target.memoryDir,'archive','handoff-good.md')):null;
    const previous=backup&&!backup.oversized&&isGoodHandoff(backup.text)?backup:main;
    let revision=null,stateReadable=false;
    const state=readSmall(path.join(target.memoryDir,'STATE.json'));
    if(state&&!state.oversized)try{const parsed=JSON.parse(state.text);if(Number.isSafeInteger(parsed?.revision)&&parsed.revision>=1){revision=parsed.revision;stateReadable=true;}}catch{}
    const ordinary=service.snapshot(workspace.id),team=staff.snapshot(workspace.id),counts={};
    for(const task of [...ordinary.tasks,...(team.tasks||[])])counts[task.status]=(counts[task.status]||0)+1;
    return {workspace:workspace.root,previous:previous?.text||'尚无可读取的项目交接单。',previousSource:previous?(previous===backup?'archive/handoff-good.md（上次有效快照）':'HANDOFF.md'):'无',previousModifiedAt:previous?.modifiedAt||null,observedAt:new Date().toISOString(),revision,stateReadable,counts,staffError:team.error||null,note:'本次只读取记忆与协作账本；任务状态、历史陈述与哈希均不证明命令已停、测试通过或功能正确。'};
  }
  function assertNoSourceWriters(workspaceId,exceptId){
    for(const [owner,tasks] of [[service,service.read().tasks],[staff.facade,staff.store.read().tasks]])for(const task of tasks){
      if(task.id===exceptId||task.workspaceId!==workspaceId)continue;
      const attempt=task.attempts?.find(item=>item.id===task.activeAttemptId);
      const busy=task.status==='running'||!!attempt&&owner.collaboration.hasUnknown(task);
      if(busy&&(!attempt?.workspace?.mode||attempt.workspace.mode==='single-writer'))throw Error('同一项目仍有单写者、隔离方式未知的执行或未知副作用；先核对命令及交接，不执行 Git 合并。');
    }
  }
  function knownTaskRefs(){
    const tasks=[...service.read().tasks,...staff.store.read().tasks],refs=new Set();
    for(const task of tasks)for(const attempt of task.attempts||[])if(attempt.workspace?.branch)refs.add('refs/heads/'+attempt.workspace.branch);
    return refs;
  }
  async function taskMergeSource(input){
    const {owner,task,attempt}=reviewContext(input),workspace=selectedWorkspace();
    if(task.activeAttemptId!==attempt.id||!['completed','review'].includes(task.status)||attempt.state!=='completed'||owner.collaboration.hasUnknown(task)||workers.active.has(task.id)||workers.queued.has(task.id)||staffWorkers.active.has(task.id)||staffWorkers.queued.has(task.id))throw Error('只能合并当前已知终态的执行；有在途或未知操作时先核对，不自动重放。');
    if(!attempt.diffRef)throw Error('此执行没有保存的提交时 Git 差异。');
    const diff=await owner.collaboration.getDiff(task.id,attempt.id),hash=reviewDiffHash(diff);
    const unresolved=reviews.list(task.workspaceId,task.id,attempt.id).filter(item=>item.diffHash===hash&&item.status==='open');
    if(unresolved.length)throw Error(`本次差异仍有 ${unresolved.length} 条未处理审阅意见；请先处理再预览合并。`);
    let teamProof=null;
    if(task.staff){
      if(!task.staff.manager||task.staff.publication)throw Error('团队员工分支不能绕过经理审查直接合并；请从经理最终工作副本操作。');
      const state=staff.facade.read(),run=staff.run({runs:state.staffRuns},task.staff.runId),delivery=staff.deliveryState(state,run.id);
      if(!delivery.settled||delivery.accepted.some(item=>!item.staff.integrated||item.staff.integrationAttemptId!==attempt.id))throw Error('团队交付尚未全部由经理审查并整合到当前执行副本。');
      if(run.integrations.some(item=>['issued','unknown','partial'].includes(item.state)))throw Error('团队仍有未知整合结果；请先核对。');
      teamProof={runId:run.id,version:run.version,delivery:delivery.fingerprint,publishToSource:run.publishToSource===true};
    }
    assertNoSourceWriters(workspace.id,task.id);
    const savedDiff=await owner.collaboration.readPrivate(attempt.id,attempt.diffRef);
    const proof=crypto.createHash('sha256').update(JSON.stringify({taskId:task.id,revision:task.revision,attemptId:attempt.id,teamProof,hash})).digest('hex');
    return {kind:'task',plan:attempt.workspace,worktreeHome:owner.collaboration.worktreeHome,savedDiff,artifacts:attempt.artifacts||[],proof,teamProof};
  }
  async function mergeSource(input){
    const workspace=selectedWorkspace();
    if(input.kind==='task')return taskMergeSource(input);
    if(input.kind!=='branch'||typeof input.ref!=='string'||knownTaskRefs().has(input.ref))throw Error('任务分支必须从对应任务入口预览，不能绕过任务审查。');
    assertNoSourceWriters(workspace.id,null);return {kind:'branch',ref:input.ref};
  }
  async function previewLocalMerge(input){
    if(input.workspaceId!==selected.collaboration)throw Error('工作区已变化，请重新预览。');
    const workspace=selectedWorkspace(),source=await mergeSource(input),preview=await inspectMerge(service,workspace.root,source);
    if(selected.collaboration!==workspace.id)throw Error('预览期间工作区已变化。');
    const ticket=crypto.randomUUID();if(mergeTickets.size>=10)mergeTickets.delete(mergeTickets.keys().next().value);
    mergeTickets.set(ticket,{workspaceId:workspace.id,input:{...input},preview,proof:source.proof||null,teamProof:source.teamProof||null,expires:Date.now()+5*60*1000});
    return {...preview,ticket,teamProof:source.teamProof||null};
  }
  async function confirmLocalMerge(input){
    const saved=mergeTickets.get(input.ticket);mergeTickets.delete(input.ticket);
    if(!saved||saved.expires<Date.now()||saved.workspaceId!==selected.collaboration)throw Error('预览已过期或工作区已变化；请重新预览。');
    const p=saved.preview,teamNote=saved.teamProof&&!saved.teamProof.publishToSource?'\n团队原设置未授权自动回写；此次是本机用户对这一次合并的单独授权。':'';
    const answer=await vscode.window.showWarningMessage(`确定将「${p.source.branch}」合并到「${p.target.branch}」？\n目标：${p.target.root}\n来源：${p.source.root||'本仓库已提交分支'}\n预览 ${p.paths.length} 个路径；冲突先检查，目标有改动则拒绝。\n${p.note}${teamNote}\n这会创建本地 Git 提交并更新目标分支；不推送、不测试、不安装、不启动模型。外部编辑器不受锁保护。`,{modal:true},'确认合并');
    if(answer!=='确认合并')return {confirmed:false};
    if(selected.collaboration!==saved.workspaceId)throw Error('确认期间工作区已变化；未合并。');
    const source=await mergeSource(saved.input);
    if((source.proof||null)!==saved.proof)throw Error('任务、团队审阅或执行状态已变化；未合并，请重新预览。');
    const beforeUpdate=async()=>{
      if(selected.collaboration!==saved.workspaceId)throw Error('更新前工作区已变化；未合并。');
      const checked=await mergeSource(saved.input);
      if((checked.proof||null)!==saved.proof)throw Error('任务、团队审阅或交付状态已变化；未合并。');
    };
    return {confirmed:true,...await executeMerge(service,selectedWorkspace().root,source,saved.preview,{lockPaths:[service.file,staff.store.file,reviews.file],beforeUpdate})};
  }
  async function open(page){
    const screen=screens[page];if(!screen)return;const existing=panels.get(page);if(existing){existing.reveal();post(page);return;}
    const directory=vscode.Uri.joinPath(context.extensionUri,'media','task-workbench');
    const panel=vscode.window.createWebviewPanel(screen.viewType,screen.title,vscode.ViewColumn.Active,{enableScripts:true,retainContextWhenHidden:true,localResourceRoots:[directory]});panels.set(page,panel);
    let html=fs.readFileSync(path.join(directory.fsPath,screen.html),'utf8');const nonce=crypto.randomBytes(18).toString('base64');
    const style=panel.webview.asWebviewUri(vscode.Uri.joinPath(directory,'automation.css')),script=panel.webview.asWebviewUri(vscode.Uri.joinPath(directory,screen.script));
    const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} data:; style-src ${panel.webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}'; connect-src 'none'; object-src 'none'; base-uri 'none'">`;
    /* 防打开闪白：样式表到达前先用编辑器底色；协作页首帧渲染完才显示 */const bootStyle=`<style nonce="${nonce}">html,body{background:var(--vscode-editor-background);color:var(--vscode-foreground)}body.oc-boot{visibility:hidden}html.oc-notrans *,html.oc-notrans *::before,html.oc-notrans *::after{transition:none!important;animation:none!important}</style>`;if(page==='collaboration')html=html.replace('<html','<html class="oc-notrans"').replace('<body class="','<body class="oc-boot ').replace('</body>',`<script nonce="${nonce}">(()=>{let shown=false,got=false;const t0=Date.now();const themed=()=>/\\bvscode-/.test(document.body.className)&&getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background').trim();const reveal=()=>{if(shown)return;shown=true;document.body.classList.remove('oc-boot');setTimeout(()=>document.documentElement.classList.remove('oc-notrans'),500);};const tick=()=>{if(shown)return;if((got&&themed())||Date.now()-t0>1500){requestAnimationFrame(()=>requestAnimationFrame(reveal));return;}requestAnimationFrame(tick);};window.addEventListener('message',e=>{if(e.data&&e.data.type==='state')got=true;});addEventListener('DOMContentLoaded',()=>requestAnimationFrame(tick));})();</script></body>`);/* 显示时机由此内联脚本控制：主题变量就绪且收到首个状态后再显示，显示后 0.5s 才恢复过渡/动画 */panel.webview.html=html.replace('<head>','<head>'+csp+bootStyle).replace('href="automation.css"','href="'+style+'"').replace('src="'+screen.script+'"','nonce="'+nonce+'" src="'+script+'"');
    panel.onDidDispose(()=>{if(panels.get(page)===panel)panels.delete(page);});
    panel.webview.onDidReceiveMessage(async message=>{
      if(!message||typeof message!=='object')return;
      try{
        if(message.type==='ready'){if(page==='collaboration'&&service.isCollaborationEnabled())await workers.refreshCatalog();post(page);return;}
        if(message.type==='canvas'&&page==='collaboration'&&typeof message.id==='string'){let value,error;try{value=await canvasAction(String(message.action||''),message.input&&typeof message.input==='object'?message.input:{});}catch(e){error=String(e?.message||e);}try{panel.webview.postMessage({type:'canvasResult',id:message.id,value,error});}catch{}return;}
        if(message.type!=='action'||typeof message.action!=='string'||typeof message.id!=='string')return;
        if(!sharedActions.has(message.action)&&!pageActions[page].has(message.action))throw Error('此页面不支持该操作。');
        const input=message.input&&typeof message.input==='object'?message.input:{};let value;
        if(page==='collaboration'&&!['setCollaborationEnabled','refresh','selectWorkspace','stopNative','pauseTeam','loadHandoff'].includes(message.action))service.requireCollaboration();
        if(message.action==='selectWorkspace'){service.workspace(input.workspaceId);selected[page]=input.workspaceId;}
        else if(message.action==='refresh'){if(page==='collaboration'&&service.isCollaborationEnabled())await workers.refreshCatalog();}
        else{
          /* Workspace trust check removed - all workspaces trusted by default */
          switch(message.action){
            case 'addWorkspace':{const choice=await vscode.window.showOpenDialog({canSelectFolders:true,canSelectFiles:false,canSelectMany:false,title:'指定工作区（不会更改文件访问权限）'});if(choice?.[0]){const entry=await service.registerWorkspace(choice[0].fsPath);selected[page]=entry.id;}break;}
            case 'savePreset':value=await service.savePreset(input);break;
            case 'saveLibraryRule':{const current=input.id?service.read().ruleLibrary.find(rule=>rule.id===input.id):service.read().ruleLibrary.find(rule=>rule.name===input.name?.trim());if(current){const uses=service.libraryUsage(current.id);const answer=await vscode.window.showWarningMessage(`保存库规则会同步影响 ${uses.length} 个引用规则组。是否继续？`,{modal:true},'保存库规则');if(answer!=='保存库规则')break;}value=await service.saveLibraryRule(input);break;}
            // persona-step03: 人设库
            case 'savePersonaPreset':{const current=input.id?(service.read().personaLibrary||[]).find(item=>item.id===input.id):(service.read().personaLibrary||[]).find(item=>item.name===input.name?.trim());if(current){const uses=service.personaUsage(current.id);if(uses.length){const answer=await vscode.window.showWarningMessage(`更新人设预设会同步影响 ${uses.length} 个引用它的规则组。是否继续？`,{modal:true},'更新人设预设');if(answer!=='更新人设预设')break;}}value=await service.savePersonaPreset(input);break;}
            case 'deletePersonaPreset':{const answer=await vscode.window.showWarningMessage('从人设库移除？引用它的规则组会保留当前正文，变成本组自定义。',{modal:true},'移除人设预设');if(answer==='移除人设预设')await service.deletePersonaPreset(input.id,input.expected_version);break;}
            case 'deleteLibraryRule':{const answer=await vscode.window.showWarningMessage('移除库预设？已有引用将保留当前正文并变成独立规则，不删除组内内容。',{modal:true},'移除库预设');if(answer==='移除库预设')await service.deleteLibraryRule(input.libraryId,input.expected_version);break;}

            case 'deletePreset':{const answer=await vscode.window.showWarningMessage('删除未被引用的规则组？',{modal:true},'删除');if(answer==='删除')await service.deletePreset(input.presetId,input.expected_version);break;}
            case 'selectGlobal':await service.selectGlobal(input.presetId,input.expected_version);break;
            case 'bindWorkspace':await service.bindWorkspace(selected[page],input.mode,input.presetId,input.expected_version);break;
            case 'saveLayers':value=await service.saveLayers(input.layers,input.expected_version);break;
            case 'previewRules':value=service.previewEffective(selected[page],input);break;
            case 'setNativeTaskReviewRequired':value=await service.setNativeTaskReviewRequired(input.required,input.expected_version);break;
            case 'setCollaborationEnabled':{
              if(typeof input.enabled!=='boolean')throw Error('协作开关必须是布尔值。');
              if(!input.enabled&&(workers.active.size||workers.queued.size||staffWorkers.active.size||staffWorkers.queued.size||staff.grants.size)){const answer=await vscode.window.showWarningMessage('关闭会清空待启动的协作队列并请求取消本机协作模型循环。已发送的命令、外部操作和费用不能保证撤销；任务所有权和记录保留。普通规则和安全确认仍有效。',{modal:true},'关闭多模型协作');if(answer!=='关闭多模型协作')break;}
              value=await service.setCollaborationEnabled(input.enabled,input.expected_version);if(input.enabled)await workers.refreshCatalog();workers.sync();break;
            }
            case 'teamLayout':case 'teamEdge':case 'teamEdges':case 'teamPresetSave':case 'teamPresetApply':case 'teamPresetDelete':case 'teamPresetDefault':case 'teamDeleteMember':case 'teamMode':case 'teamOpenChat':case 'teamVoice':case 'teamMcp':case 'teamSend':case 'teamStop':case 'teamClearChat':case 'teamMemberSettings':case 'teamMemberAvatar':case 'teamDeleteSubagent':case 'teamRules':case 'portProvider':case 'portProviderMove':case 'portProviderDelete':case 'portFeed':case 'portUnfeed':case 'portFeedMode':case 'portBoardClear':case 'teamGroups':case 'teamCollapse':case 'portProviderFlags':case 'portFeedVia':value=await teamAction(message.action,input);break;
            case 'saveEmployee':value=await staff.saveEmployee(input);break;
            case 'createStaffRole':value=await staff.createRoleTemplate(input.kind);break;
            case 'bindEmployee':value=await staff.bindMcp(input.employeeId,input.agentId);break;
            case 'copyEmployeePairing':{const code=await staff.issuePairing(input.employeeId,input.expected_version);await vscode.env.clipboard.writeText(JSON.stringify(code));value={copied:true,expires_at:code.expires_at};break;}
            case 'unbindEmployee':value=await staff.unbind(input.employeeId);break;
            case 'saveTeam':if(input.workspace_id!==selected.collaboration)throw Error('工作区已变化，请重新填写团队目标。');value=await staff.saveTeam(input);break;
            case 'authorizeTeam':{const preview=staff.previewActivation(input.runId);if(preview.version!==input.expected_version||preview.workspace.id!==selected.collaboration)throw Error('团队或当前工作区已变化，请刷新后重新确认。');/* OpenCode: 授权团队默认不弹确认，等同点了「授权并启动团队」；预算、隔离、应用回原项目等授权值与版本/指纹复核不变。设置 opencode.collaboration.confirmNativeStart=true 恢复确认框。 */let confirmTeam=false;try{confirmTeam=vscode.workspace.getConfiguration('opencode').get('collaboration.confirmNativeStart',false)===true;}catch{confirmTeam=false;}const answer=!confirmTeam?'授权并启动团队':await vscode.window.showWarningMessage(`授权经理管理团队“${preview.run.name}”？\n项目：${preview.workspace.root}\n目标：${preview.run.goal}\n员工：${preview.employees.map(employee=>employee.name+' ['+employee.kind+'] '+(employee.model?employee.model.vendor+'/'+employee.model.id:'外部客户端主动接单')).join('；')}\n任务总数最多 ${preview.run.maxTasks}；原生SDK请求累计 ${preview.run.nativeRequests}/${preview.run.maxNativeRequests}（恢复不重置，每次执行最多12轮，提供方内部重试依原配置，不是金额上限）。\nauto降级或单写者会由员工直接改原项目；不允许时必须选择worktree。\n隔离：${preview.run.isolation}；整合：${preview.run.requireIntegration?'要求':'未要求'}；应用回原项目：${preview.run.publishToSource?'明确授权':'未授权'}。\n经理可在上述范围内自主派工与审查，不逐张审批普通任务卡。可能产生模型费用，并向所选提供方发送授权项目上下文；外部MCP自身的费用不由本机计量。最多1个原生经理和2个原生执行员工。\n不自动测试、安装、提交或启停已有实例。未知副作用不重放；重启不自动收费续跑。`,{modal:true},'授权并启动团队');if(answer!=='授权并启动团队'){value={confirmed:false};break;}if(selected.collaboration!==preview.workspace.id)throw Error('授权期间工作区已变化。');value=await staff.activate(input.runId,preview.version,preview.fingerprint);break;}
            case 'pauseTeam':value=await staff.pause(input.runId);break;
            case 'reconcileTeam':{const answer=await vscode.window.showWarningMessage('只读取并核对未知整合的当前文件哈希，记录已完成/未执行/部分变化；不重发补丁、不改写旧回执。仍有在途命令时不要交接。',{modal:true},'核对当前文件');if(answer==='核对当前文件')value=await staff.reconcile(input.runId);break;}
            case 'openTeamWorkspace':{const state=staff.store.read(),run=staff.run(state,input.runId),manager=state.tasks.find(task=>task.staff.runId===run.id&&task.staff.manager),attempt=manager?.attempts.find(item=>item.id===manager.activeAttemptId);if(!attempt?.workspace.root)throw Error('经理执行目录尚未建立。');await vscode.commands.executeCommand('vscode.openFolder',vscode.Uri.file(attempt.workspace.root),{forceNewWindow:true});break;}
            case 'openEmployeeApiSettings':if(staff.grants.size)throw Error('先暂停团队，再调整API提供方，避免运行中改变配置。');await vscode.commands.executeCommand('aiCustomization.openManagementEditor','models');break;
            case 'saveTaskCategory':value=await service.collaboration.saveCategory(input);break;
            case 'configureTask':value=await service.collaboration.configureTask(input);break;
            case 'refreshCatalog':value=await workers.refreshCatalog();break;
            case 'resumeNative':value=await workers.authorize([input.taskId],true);break;
            case 'sendMessage':value=await service.collaboration.sendMessage(input);break;
            case 'ackMessage':value=await service.collaboration.acknowledgeMessage(input);break;
            case 'deliverLocalMessages':{let cursor=0,page;do{page=await service.collaboration.listMessages({workspace_id:selected.collaboration,after_sequence:cursor,limit:100});cursor=page.next_sequence;}while(page.has_more);value={delivered:true};break;}
            case 'readExecution':value=await taskService(input.taskId).collaboration.getExecution({task_id:input.taskId,attempt_id:input.attemptId,offset:input.offset||0,limit:100});break;
            case 'loadReview':value=await reviewView(input);break;
            case 'addReview':{const view=await reviewView(input);value=await reviews.add(input,view.diff);break;}
            case 'replyReview':reviewContext(input);value=await reviews.reply(input);break;
            case 'setReviewStatus':reviewContext(input);value=await reviews.setStatus(input);break;
            case 'sendReview':{const view=await reviewView(input),thread=view.threads.find(item=>item.id===input.threadId&&item.diffHash===view.diffHash),recipient=view.recipients.find(item=>item.id===input.recipient);if(!thread||!recipient||thread.revision!==input.expected_revision||view.diffHash!==input.diff_hash)throw Error('讨论或差异已变化，请刷新后再确认发送。');const first=thread.messages[0].text,last=thread.messages.length>1?thread.messages.at(-1).text:'';const text=`人工审阅意见（不代表验收或功能验证）\n任务：${view.taskTitle}；执行：${view.attemptId}\n保存的差异 ${view.diffHash}；旧行 ${thread.anchor.oldLine??'—'} / 新行 ${thread.anchor.newLine??'—'}\n${thread.anchor.preview}\n意见：${first}${last?'\n最新回复：'+last:''}\n${thread.messages.length>2?'仅发送首条与最新回复，其余保留在本机审阅记录。\n':''}发送不代表送达、处理或自动返工。`;if(text.length>8000)throw Error('意见和最新回复合计过长，请精简后发送。');value=await taskService(input.taskId).collaboration.sendMessage({task_id:input.taskId,attempt_id:input.attemptId,recipient:recipient.id,kind:'handoff',text,client_request_id:input.client_request_id});break;}
            case 'loadHandoff':if(input.workspaceId!==selected.collaboration)throw Error('工作区已变化。');value=handoffView();break;
            case 'listMergeBranches':{if(input.workspaceId!==selected.collaboration)throw Error('工作区已变化。');const workspace=selectedWorkspace();assertNoSourceWriters(workspace.id,null);const result=await listLocalBranches(service,workspace.root),blocked=knownTaskRefs();if(input.workspaceId!==selected.collaboration)throw Error('工作区已变化。');value={...result,branches:result.branches.filter(branch=>!blocked.has(branch.ref)&&!branch.ref.startsWith('refs/heads/opencode/'))};break;}
            case 'previewLocalMerge':value=await previewLocalMerge(input);break;
            case 'confirmLocalMerge':value=await confirmLocalMerge(input);break;
            case 'openTaskDiff':{const diff=await taskService(input.taskId).collaboration.getDiff(input.taskId,input.attemptId);const document=await vscode.workspace.openTextDocument({content:diff.text+'\n\n# 未跟踪文件（正文需另读）\n'+diff.untracked.join('\n'),language:'diff'});await vscode.window.showTextDocument(document);break;}
            case 'saveRole':value=await service.saveRole(input);break;
            case 'assignAgent':if(staff.snapshot(selected.collaboration).employees.some(employee=>employee.agentId===input.agentId))throw Error('此连接已绑定员工，请在员工配置中管理职位。');await service.assignAgent(input.agentId,input.roleId);break;
            case 'createTask':value=await service.createTask({...input,workspace_id:selected[page]});break;
            case 'startNative':value=await workers.authorize([input.taskId]);break;
            case 'startQueue':value=await workers.authorize(snapshot(page).tasks.filter(task=>task.status==='queued'&&!task.ownerAgentId).sort((a,b)=>(Date.parse(a.createdAt)||0)-(Date.parse(b.createdAt)||0)).map(task=>task.id));break;
            case 'stopNative':{const answer=await vscode.window.showWarningMessage('只取消本次模型循环，不代表命令已停止；不会强制终止已有实例。',{modal:true},'取消模型循环');if(answer==='取消模型循环')workers.stop(input.taskId);break;}
            case 'confirmTask':await taskService(input.taskId).confirmTask(input.taskId,input.expected_revision);break;
            // Local-user-only "extend by N" for a structured LIMIT_REACHED block reason; never a model tool.
            case 'extendLimit':{const amount=input.kind==='integration'?`files +${input.files||input.by||0}，单文件 +${input.file_kib||0} KiB，总量 +${input.total_kib||0} KiB`:`+${input.by}`;const answer=await vscode.window.showWarningMessage(`扩展协作限额（${input.kind}）${amount}？只追加额度，不重置已用量、不重放未知副作用；可能产生额外模型费用。`,{modal:true},'扩展');if(answer==='扩展')value=await service.extendCollaborationLimit(input);break;}
            case 'releaseTask':{const answer=await vscode.window.showWarningMessage('交接不会终止命令。请先确认文件、命令和未知结果；确认后才允许重新领取。',{modal:true},'已核对，交接');if(answer==='已核对，交接'){const taskContext=taskService(input.taskId),current=taskContext.task(taskContext.read(),input.taskId);const revision=current.status==='running'?(await taskContext.collaboration.blockInterruptedForHandoff(input.taskId,input.expected_revision)).revision:input.expected_revision;await taskContext.releaseTask(input.taskId,revision);}break;}
            case 'cancelTask':await taskService(input.taskId).cancelTask(input.taskId,input.expected_revision);break;
            case 'exportRules':{const dest=await vscode.window.showSaveDialog({saveLabel:'导出规则组与工作区绑定',filters:{JSON:['json']}});if(dest){const state=service.read();await vscode.workspace.fs.writeFile(dest,Buffer.from(JSON.stringify({format:state.format,schemaVersion:state.schemaVersion,globalPresetId:state.globalPresetId,presets:state.presets,ruleLibrary:state.ruleLibrary,ruleLibraryVersion:state.ruleLibraryVersion,bindings:state.bindings,workspaces:state.workspaces},null,2),'utf8'));}break;}
            default:throw Error('不支持此操作。');
          }
        }
        panel.webview.postMessage({type:'result',id:message.id,value});post(page);
      }catch(error){panel.webview.postMessage({type:'result',id:message.id,error:error.message});post(page);}
    },null,context.subscriptions);
  }
    const memoryScopeStatus=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,6);memoryScopeStatus.name='MCP 权限与记忆模式';memoryScopeStatus.command='opencode.bridge.toggleWorkspaceScope';
  function updateMemoryScopeStatus(){try{const cfg=vscode.workspace.getConfiguration('opencode'),scope=cfg.get('bridge.workspaceScope','device'),ws=vscode.workspace.name;if(scope==='workspace'&&ws){memoryScopeStatus.text=`$(folder) MCP: 项目 (${ws})`;memoryScopeStatus.tooltip='当前为「项目 MCP 模式」：工具受限于工作区目录，记忆使用项目根目录 .opencode-project/。点击切换为「临时模式」';}else{memoryScopeStatus.text='$(globe) MCP: 临时 (整机设备)';memoryScopeStatus.tooltip='当前为「临时 MCP 模式」：默认拥有整机设备全部权限，记忆使用专属临时目录，不污染项目。点击切换为「项目模式」';}}catch{memoryScopeStatus.text='$(globe) MCP: 临时';}}
  updateMemoryScopeStatus();memoryScopeStatus.show();
  const toggleScopeCmd=vscode.commands.registerCommand('opencode.bridge.toggleWorkspaceScope',async()=>{try{const cfg=vscode.workspace.getConfiguration('opencode'),current=cfg.get('bridge.workspaceScope','device'),next=current==='workspace'?'device':'workspace';await cfg.update('bridge.workspaceScope',next,vscode.ConfigurationTarget.Global);updateMemoryScopeStatus();if(next==='device'){vscode.window.showInformationMessage('已切换为「临时 MCP 模式」：默认拥有整机设备所有权限，需求与随手记写入专属临时记忆目录，不污染项目。');}else{const ws=vscode.workspace.name;if(!ws){vscode.window.showWarningMessage('已切换为「项目 MCP 模式」：当前窗口未打开文件夹，打开项目文件夹可完整启用项目隔离与专属记忆。');}else{vscode.window.showInformationMessage(`已切换为「项目 MCP 模式」：工具权限受限于「${ws}」，使用项目根目录下的专属档案袋记忆。`);}}}catch(e){vscode.window.showErrorMessage('切换 MCP 模式失败：'+(e?.message||String(e)));}});
  const scopeConfigListener=vscode.workspace.onDidChangeConfiguration(e=>{if(e.affectsConfiguration('opencode.bridge.workspaceScope'))updateMemoryScopeStatus();});
  const scopeFolderListener=vscode.workspace.onDidChangeWorkspaceFolders(()=>updateMemoryScopeStatus());
  const collaborationStatus=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,7);collaborationStatus.name='团队协作';collaborationStatus.text='$(organization) 协作';collaborationStatus.tooltip='团队节点与群聊';collaborationStatus.command='opencode.collaboration.open';/* 协作入口已移到对话面板右上角，左下角状态栏不再显示 */
  function updateCollaborationStatus(){try{const enabled=service.isCollaborationEnabled();collaborationStatus.text=enabled?'$(organization) 协作':'$(circle-slash) 协作已关闭';collaborationStatus.tooltip=enabled?'多模型协作已开启；职位、成员与任务有效。':'多模型协作已关闭；职位不限制普通工具。点击管理总开关。';}catch{collaborationStatus.text='$(warning) 协作状态不可用';}}
  updateCollaborationStatus();
  const unsubscribe=service.onDidChange(()=>postAll()),timer=setInterval(postAll,3000);timer.unref?.();
  // OpenCode p33: GitHub 工作流注册；members/lead 供“最终结论”按审查人/主席挑选
  try{registerGithubWorkflow(context,output,{busy:()=>!!teamBusy.get(selected.collaboration),send:text=>teamAction('teamSend',{text}),mode:()=>teamLoad(selected.collaboration).mode||'all',setMode:mode=>teamAction('teamMode',{mode}),chat:()=>teamLoad(selected.collaboration).chat,open:()=>open('collaboration'),members:()=>{try{return teamMembers(selected.collaboration).map(m=>({id:m.id,name:m.name,roleName:m.roleName}));}catch{return [];}},lead:()=>{try{const s=teamLoad(selected.collaboration),ids=teamMembers(selected.collaboration).filter(m=>teamOnCanvas(s,m.id)).map(m=>m.id);return ids.length?teamChair(s,ids):'';}catch{return '';}}});}catch(error){try{output?.appendLine?.('[github] register failed: '+error.message);}catch{}}
  context.subscriptions.push(collaborationStatus,memoryScopeStatus,toggleScopeCmd,scopeConfigListener,scopeFolderListener,vscode.commands.registerCommand('opencode.rules.open',()=>open('rules')),vscode.commands.registerCommand('opencode.collaboration.open',()=>open('collaboration')),{dispose(){clearInterval(timer);unsubscribe();workers.dispose();staffWorkers.dispose();for(const panel of panels.values())panel.dispose();panels.clear();}});
}

// OpenCode github-p15: GitHub 工作流——Issue 交给协作组处理并一键开 PR；合议审查 PR 并把意见发成评论
// OpenCode p33: 重新放回 p15（它只打在 esm 副本上，被 sync-shared 覆盖丢了）；最终结论按标记/审查人/主席挑选，不再只取最后一条；自审 422 回退评论时在正文写明
function registerGithubWorkflow(context,output,team){
  const cp=require('node:child_process');
  const log=m=>{try{output?.appendLine?.('[github] '+m);}catch{}};
  const root=()=>{const f=vscode.workspace.workspaceFolders?.[0];if(!f)throw Error('请先打开一个 Git 仓库文件夹。');return f.uri.fsPath;};
  const git=(args,cwd=root())=>new Promise((res,rej)=>cp.execFile('git',args,{cwd,maxBuffer:64*1024*1024,windowsHide:true},(e,so,se)=>e?rej(Error((se||e.message).trim())):res(String(so).trim())));
  async function repo(){const url=await git(['remote','get-url','origin']).catch(()=>'');const m=url.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?\/?$/i);if(!m)throw Error('origin 不是 GitHub 仓库：'+(url||'没有 origin'));return {owner:m[1],name:m[2]};}
  async function token(silent){const s=await vscode.authentication.getSession('github',['repo'],silent?{silent:true}:{createIfNone:true});if(!s)throw Error('没有登录 GitHub。');return s.accessToken;}
  async function gh(p,opt={}){const t=await token();const r=await fetch('https://api.github.com'+p,{method:opt.method||'GET',headers:{Authorization:'Bearer '+t,Accept:opt.accept||'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'OpenCode',...(opt.body?{'Content-Type':'application/json'}:{})},body:opt.body?JSON.stringify(opt.body):void 0});const txt=await r.text();if(!r.ok){let msg=txt;try{msg=JSON.parse(txt).message||txt;}catch{}const e=Error('GitHub '+r.status+'：'+String(msg).slice(0,300));e.status=r.status;throw e;}if(opt.raw)return txt;return txt?JSON.parse(txt):null;}
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function waitTeam(maxMs){const t0=Date.now();while(!team.busy()&&Date.now()-t0<8000)await sleep(300);while(team.busy()&&Date.now()-t0<maxMs)await sleep(1000);return !team.busy();}
  // OpenCode p33: 最终结论不再依赖消息顺序——依次取：明确标记为结论的消息（verdict 字段，或以“最终结论/VERDICT:”开头的行）→ 设置 opencode.github.reviewer 指定的审查人 → 岗位名含“审查/评审/review”的成员 → 主席/负责人；都没有才退回最后一条成员消息
  const VERDICT_LINE=/^[\s#>*_]*(?:【\s*最终结论\s*】|最终结论|final\s+verdict|verdict)\s*[:：】]/im;
  const REVIEW_LINE=/结论\s*[:：]\s*\**\s*(APPROVE|REQUEST_CHANGES|COMMENT)/i;
  function pickVerdict(t,needReviewLine){
    const chat=team.chat()||[];const c=[];
    for(let i=chat.length-1;i>=0;i--){const m=chat[i];if(Date.parse(m.time)<t)break;if(m.fold||m.from==='user'||m.from==='system'||m.kind!=='chat')continue;c.push(m);}
    if(!c.length)return {text:'',from:'',how:'none'};
    let members=[];try{members=team.members?.()||[];}catch{}
    const nameOf=id=>members.find(x=>x.id===id)?.name||String(id||'');
    const out=(m,how)=>({text:String(m.text||''),from:nameOf(m.from),how});
    const marked=c.find(m=>m.verdict===true)||c.find(m=>VERDICT_LINE.test(String(m.text||'')));
    if(marked)return out(marked,'marked');
    const want=[];
    const cfg=String(vscode.workspace.getConfiguration('opencode.github').get('reviewer')||'').trim().toLowerCase();
    if(cfg)for(const x of members)if([x.id,x.name,x.roleName].some(v=>String(v||'').trim().toLowerCase()===cfg))want.push([x.id,'reviewer']);
    for(const x of members)if(/审查|评审|主审|review/i.test(String(x.roleName||'')))want.push([x.id,'reviewer-role']);
    let lead='';try{lead=team.lead?.()||'';}catch{}if(lead)want.push([lead,'lead']);
    for(const [id,how] of want){const own=c.filter(m=>m.from===id);if(!own.length)continue;return out((needReviewLine&&own.find(m=>REVIEW_LINE.test(String(m.text||''))))||own[0],how);}
    if(needReviewLine){const hit=c.find(m=>REVIEW_LINE.test(String(m.text||'')));if(hit)return out(hit,'last-with-verdict');}
    return out(c[0],'last');
  }
  const VERDICT_HOW={marked:'标记为最终结论的消息',reviewer:'指定审查人','reviewer-role':'审查岗位','lead':'主席/负责人','last-with-verdict':'最后一条带结论的消息',last:'最后一条成员消息'};
  function finalSince(t){return pickVerdict(t,false).text;}
  const STATE='opencode.github.issue';
  async function issueToTeam(){
    const r=await repo();const list=(await gh(`/repos/${r.owner}/${r.name}/issues?state=open&per_page=50`)).filter(i=>!i.pull_request);
    if(!list.length){vscode.window.showInformationMessage(`${r.owner}/${r.name} 没有打开的 Issue。`);return;}
    const pick=await vscode.window.showQuickPick(list.map(i=>({label:'#'+i.number+' '+i.title,description:(i.labels||[]).map(l=>l.name).join(', '),detail:(i.body||'').replace(/\s+/g,' ').slice(0,120),issue:i})),{placeHolder:'选一个 Issue 交给协作组处理',matchOnDetail:true});
    if(!pick)return;const i=pick.issue,branch='issue-'+i.number;
    const dirty=await git(['status','--porcelain']);if(dirty){const go=await vscode.window.showWarningMessage('工作区还有未提交的改动，会一起带到新分支上。继续吗？',{modal:true},'继续');if(go!=='继续')return;}
    const exists=await git(['rev-parse','--verify','--quiet',branch]).then(()=>true,()=>false);
    await git(exists?['checkout',branch]:['checkout','-b',branch]);
    const comments=i.comments?await gh(`/repos/${r.owner}/${r.name}/issues/${i.number}/comments?per_page=20`).catch(()=>[]):[];
    const state={repo:r,number:i.number,title:i.title,branch,start:Date.now()};await context.workspaceState.update(STATE,state);
    const text=`请处理 GitHub Issue #${i.number}：${i.title}\n\n${(i.body||'（没有描述）').slice(0,20000)}`+(comments.length?'\n\n讨论：\n'+comments.map(c=>`- ${c.user?.login}：${String(c.body||'').slice(0,2000)}`).join('\n'):'')+`\n\n要求：在当前分支 ${branch} 上直接修改代码完成它；完成后用几句话总结改了什么、怎么验证。`;
    await team.open();await team.send(text);log('issue #'+i.number+' -> team');
    vscode.window.setStatusBarMessage(`Issue #${i.number} 已交给协作组（分支 ${branch}）`,8000);
    (async()=>{const ok=await waitTeam(4*3600e3);if(!ok)return;const pickA=await vscode.window.showInformationMessage(`协作组处理完 Issue #${i.number} 了。现在开 PR 吗？`,'开 PR','稍后');if(pickA==='开 PR')openPR().catch(e=>vscode.window.showErrorMessage('开 PR 失败：'+e.message));})();
  }
  async function openPR(){
    const st=context.workspaceState.get(STATE);const r=await repo();const branch=await git(['rev-parse','--abbrev-ref','HEAD']);
    const info=await gh(`/repos/${r.owner}/${r.name}`);const base=info.default_branch||'main';
    if(branch===base)throw Error(`当前在 ${base} 分支上，先切到要提 PR 的分支。`);
    const forIssue=st&&st.branch===branch?st:null;
    if(await git(['status','--porcelain'])){await git(['add','-A']);await git(['commit','-m',forIssue?`Fix #${forIssue.number}: ${forIssue.title}`:`Update ${branch}`]);}
    await git(['push','-u','origin',branch]);
    const summary=forIssue?finalSince(forIssue.start):'';
    const title=forIssue?`Fix #${forIssue.number}: ${forIssue.title}`:branch;
    const body=(forIssue?`Closes #${forIssue.number}\n\n`:'')+(summary?summary.slice(0,60000):'');
    let pr;try{pr=await gh(`/repos/${r.owner}/${r.name}/pulls`,{method:'POST',body:{title,head:branch,base,body}});}catch(e){if(e.status===422){const ex=await gh(`/repos/${r.owner}/${r.name}/pulls?head=${r.owner}:${encodeURIComponent(branch)}&state=open`);if(ex[0])pr=ex[0];else throw e;}else throw e;}
    const go=await vscode.window.showInformationMessage(`PR #${pr.number} 已创建：${pr.title}`,'在浏览器打开');if(go)vscode.env.openExternal(vscode.Uri.parse(pr.html_url));
  }
  async function reviewPR(){
    const r=await repo();const list=await gh(`/repos/${r.owner}/${r.name}/pulls?state=open&per_page=50`);
    if(!list.length){vscode.window.showInformationMessage(`${r.owner}/${r.name} 没有打开的 PR。`);return;}
    const pick=await vscode.window.showQuickPick(list.map(p=>({label:'#'+p.number+' '+p.title,description:p.user?.login+' · '+p.head?.ref+' → '+p.base?.ref,pr:p})),{placeHolder:'选一个 PR 让协作组合议审查'});if(!pick)return;const p=pick.pr;
    if(team.busy())throw Error('协作组还在忙，等这一轮结束再审。');
    let diff=await gh(`/repos/${r.owner}/${r.name}/pulls/${p.number}`,{accept:'application/vnd.github.v3.diff',raw:true});const cut=diff.length>180000;if(cut)diff=diff.slice(0,180000);
    const prevMode=team.mode();if(prevMode!=='council')await team.setMode('council');
    const start=Date.now();
    const text=`请审查 GitHub PR #${p.number}：${p.title}\n作者 ${p.user?.login}，${p.head?.ref} → ${p.base?.ref}\n\n${(p.body||'').slice(0,8000)}\n\n只给审查意见，不要改代码。按严重程度列出问题（写明文件和行号、原因、建议改法），没问题就说明为什么可以合并。最后单独一行写：结论: APPROVE / REQUEST_CHANGES / COMMENT 三选一。${cut?'\n（diff 太长，只给了前 180000 字）':''}\n\n\`\`\`diff\n${diff}\n\`\`\``;
    try{await team.open();await team.send(text);const ok=await waitTeam(2*3600e3);if(!ok)throw Error('审查超时，没有拿到结论。');}finally{if(prevMode!=='council')await team.setMode(prevMode).catch(()=>{});}
    const pv=pickVerdict(start,true),final=pv.text;if(!final)throw Error('协作组没有给出审查结论。');log('review verdict from '+pv.from+' ('+pv.how+')');
    const m=final.match(REVIEW_LINE);let event=(m?m[1]:'COMMENT').toUpperCase();
    const label={APPROVE:'批准',REQUEST_CHANGES:'要求修改',COMMENT:'评论'}[event];
    const go=await vscode.window.showInformationMessage(`合议审查完成（结论：${label}）。发到 PR #${p.number} 吗？`,{modal:true,detail:`结论来源：${pv.from}（${VERDICT_HOW[pv.how]||pv.how}）\n\n`+final.slice(0,1500)},'发表审查','只发评论');if(!go)return;if(go==='只发评论')event='COMMENT';
    const body='**OpenCode 合议审查**\n\n'+`结论来源：${pv.from}（${VERDICT_HOW[pv.how]||pv.how}）\n\n`+final.slice(0,60000);let fellBack='';
    try{await gh(`/repos/${r.owner}/${r.name}/pulls/${p.number}/reviews`,{method:'POST',body:{body,event}});}catch(e){if(e.status===422&&event!=='COMMENT'){
      // OpenCode p33: 自己的 PR 不能 APPROVE/REQUEST_CHANGES，GitHub 返回 422；照旧退回发评论，但在评论正文和提示里写明原结论和原因
      fellBack=event;const note=`> ⚠️ **原定审查结论：${event}（${label}）未能提交。** GitHub 返回 422（${String(e.message||'').replace(/\s+/g,' ').slice(0,200)}）——通常是因为不能对自己发起的 PR 做批准/要求修改。因此本条改为**普通评论**发布，结论仅供参考，不计入 PR 的审批状态。\n>\n> GitHub rejected the ${event} review with 422 (you cannot ${event==='APPROVE'?'approve':'request changes on'} your own pull request), so it was posted as a plain COMMENT; the verdict above is advisory only.\n\n`;
      await gh(`/repos/${r.owner}/${r.name}/pulls/${p.number}/reviews`,{method:'POST',body:{body:note+body,event:'COMMENT'}});event='COMMENT';log('review 422 -> posted as COMMENT (was '+fellBack+')');}else throw e;}
    const o=await vscode.window.showInformationMessage(fellBack?`已发到 PR #${p.number}，但 GitHub 不允许审查自己的 PR（422），原结论「${label}」已改为普通评论发布。`:`已发到 PR #${p.number}（${event==='COMMENT'?'评论':label}）。`,'在浏览器打开');if(o)vscode.env.openExternal(vscode.Uri.parse(p.html_url));
  }
  // OpenCode 20:40: 去掉状态栏「GitHub」按钮和点开后的快速选择菜单（Issue 交给协作组 / 开 PR / 合议审查）；
  // 改为给 AI 一个通用 GitHub 工具 opencode_github：用已登录的 GitHub 账号调用 REST / GraphQL，Issue、PR、评论、审查、Actions、Release、搜索等都能用。
  void issueToTeam;void openPR;void reviewPR;
  const SAFE=new Set(['GET','HEAD']);
  const fill=async s=>{s=String(s||'');if(s.includes('{owner}')||s.includes('{repo}')){const r=await repo();s=s.split('{owner}').join(r.owner).split('{repo}').join(r.name);}return s;};
  const isWrite=i=>i.graphql?/^\s*(?:#[^\n]*\n\s*)*mutation\b/i.test(String(i.graphql)):!SAFE.has(String(i.method||'GET').toUpperCase());
  async function ghCall(i){
    let method=String(i.method||(i.graphql?'POST':'GET')).toUpperCase();
    let p=i.graphql?'/graphql':String(i.path||'').trim();
    if(!p)throw Error('需要 path（REST 路径，如 /repos/{owner}/{repo}/issues）或 graphql。');
    if(/^https?:\/\//i.test(p)){const u=new URL(p);if(u.hostname!=='api.github.com')throw Error('只允许 https://api.github.com');p=u.pathname+u.search;}
    if(!p.startsWith('/'))p='/'+p;
    p=await fill(p);
    if(i.query&&typeof i.query==='object'){const qs=new URLSearchParams();for(const [k,v] of Object.entries(i.query))if(v!==undefined&&v!==null)qs.append(k,String(v));const s=qs.toString();if(s)p+=(p.includes('?')?'&':'?')+s;}
    if(i.graphql)method='POST';
    let body=i.graphql?{query:await fill(i.graphql),variables:i.variables&&typeof i.variables==='object'?i.variables:{}}:i.body;
    const send=body!==undefined&&body!==null&&!SAFE.has(method);
    const t=await token(false);
    const r=await fetch('https://api.github.com'+p,{method,headers:{Authorization:'Bearer '+t,Accept:String(i.accept||'application/vnd.github+json'),'X-GitHub-Api-Version':'2022-11-28','User-Agent':'OpenCode',...(send?{'Content-Type':'application/json'}:{})},body:send?(typeof body==='string'?body:JSON.stringify(body)):void 0});
    let txt=await r.text();const max=Math.max(2000,Math.min(Number(i.max_chars)||60000,200000));
    const link=r.headers.get('link');
    if(txt.length>max)txt=txt.slice(0,max)+'\n…（已截断，原长 '+txt.length+' 字符；用 per_page/page 或更窄的查询）';
    return 'HTTP '+r.status+' '+method+' '+p+(link?'\nlink: '+link:'')+'\n'+txt;
  }
  try{context.subscriptions.push(vscode.lm.registerTool('opencode_github',{
    prepareInvocation(o){const i=o?.input||{};const m=String(i.method||(i.graphql?'POST':'GET')).toUpperCase();const what=(i.graphql?'GraphQL':m+' '+String(i.path||'')).slice(0,140);
      if(!isWrite(i))return {invocationMessage:'GitHub · '+what};
      const detail=(i.graphql?String(i.graphql)+(i.variables?'\n'+JSON.stringify(i.variables,null,2):''):(i.body===undefined?'':JSON.stringify(i.body,null,2))).slice(0,4000);
      return {invocationMessage:'GitHub · '+what,confirmationMessages:{title:'GitHub 写操作：'+what,message:new vscode.MarkdownString(detail?'```\n'+detail+'\n```':'')}};},
    async invoke(o){try{return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(await ghCall(o?.input||{}))]);}catch(e){log('tool: '+e.message);return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('ERROR: '+e.message)]);}}
  }));}catch(e){log('registerTool opencode_github failed: '+e.message);}
}
