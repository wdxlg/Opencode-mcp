(() => {
  'use strict';
  // 团队协作：画布页（连线/排布）+ 成员页（成员增删改、岗位、子代理）+ 聊天页（群聊、私聊；群里 @ 为私密消息）。
  const vscode=acquireVsCodeApi(),$=id=>document.getElementById(id),pending=new Map(),SVG='http://www.w3.org/2000/svg';
  window.__ocVs=vscode; // canvas-console 共用同一个 webview API 句柄（acquireVsCodeApi 只能调用一次）
  const NODE_W=224,NODE_H=146,GAP_X=44,GAP_Y=90,PAD=40,TOP=84,PILL_H=24,PILL_GAP=6,TITLE_H=28,SLOT1=43,SLOT2=65,WID1=80,WID2=102,COL_GAP=120,ROW_GAP=36;
  // member-custom：成员的个人设定 / 工具与权限 / 模型参数（都可选，空 = 原来的行为）
  const CUSTOM_KEYS=['goal','backstory','tools','writeScope','confirm','reasoningEffort','temperature','maxOutputTokens','fallbackModel'],MORE_Y=126;
  const customOf=m=>Object.fromEntries(CUSTOM_KEYS.map(k=>[k,m?.[k]??null])),customized=m=>CUSTOM_KEYS.some(k=>m?.[k]!=null);
  const stateLabels={queued:'待开始',running:'进行中',blocked:'受阻',review:'待验收',completed:'已完成',cancelled:'已取消'};
  const subLabels={queued:'排队',running:'工作中',idle:'空闲',error:'出错'};
  const PALETTE=['#4f8cff','#22b8a6','#f0a030','#e0607e','#9b7bf2','#4cbb5e','#e07a3c','#3fa7d6'];
  const saved=vscode.getState()||{};
  let sequence=0,data=null,linkMode=null,linkFrom=null,selectedEdge=null,selectedNode=null,placeAfterSave=false,editing=null,deleteArmed=false,drag=null,localPos={},lastChatKey='',lastConvKey='';
  // 画布多选（selection）、管理连线时 Ctrl 多选的待连下级（pendingLinks）、视图平移缩放（view，按项目记住）
  let selection=new Set(),pendingLinks=new Set(),view={x:0,y:0,k:1},views=saved.views&&typeof saved.views==='object'?saved.views:{},spaceDown=false,pan=null,marquee=null,altZoomed=false,presetArm=null;
  let page=['chat','members'].includes(saved.page)?saved.page:'canvas',memberFilter='',channel=typeof saved.channel==='string'?saved.channel:'group';
  const remember=()=>{if(data?.workspaceId)views[data.workspaceId]={x:Math.round(view.x),y:Math.round(view.y),k:+view.k.toFixed(3)};vscode.setState({page,channel,views});};
  // single-canvas: 不再弹操作提示/确认提示；只有真正的错误才显示，小条、右下角、几秒后自动消失
  function notice(message,error=false){if(!error||!message)return;const box=$('feedback');box.textContent=String(message).slice(0,200);box.title=String(message);box.classList.add('error');box.classList.remove('tc-out');void box.offsetWidth;clearTimeout(notice.timer);clearTimeout(notice.outTimer);notice.outTimer=setTimeout(()=>box.classList.add('tc-out'),3780);notice.timer=setTimeout(()=>{box.textContent='';box.title='';box.classList.remove('error','tc-out');},4000);}
  function api(action,input={}){return new Promise((resolve,reject)=>{const id='ui_'+(++sequence);pending.set(id,{resolve,reject});vscode.postMessage({type:'action',id,action,input});});}
  async function act(action,input={},button){if(button)button.disabled=true;try{return await api(action,input);}catch(error){notice(error.message,true);throw error;}finally{if(button)button.disabled=false;}}
  function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined&&text!==null)node.textContent=text;if(className)node.className=className;return node;}
  function svg(tag,attrs={}){const node=document.createElementNS(SVG,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));return node;}
  // collab-style: 动效工具——只给真正新出现的条目播入场（3 秒推送重画不重播），尊重「减弱动态效果」，打开页面的防闪白阶段（html.oc-notrans）不播
  const ENTER_MS=150;
  function motionOK(){return !document.documentElement.classList.contains('oc-notrans')&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function makeEnter(cls='tc-enter'){let seen=null;const at=new Map();return pairs=>{const now=performance.now(),ok=motionOK(),next=new Set();let n=0;
    for(const [k,node] of pairs){if(!node)continue;next.add(k);if(!seen)continue;let t=at.get(k);if(t===undefined&&!seen.has(k)&&ok){t=now+Math.min(n++,10)*16;at.set(k,t);}if(t===undefined)continue;const rest=t+ENTER_MS-now;if(rest<=0||!ok){at.delete(k);continue;}
      node.classList.add(cls);node.style.animationDelay=Math.round(t-now)+'ms';clearTimeout(node._enterT);node._enterT=setTimeout(()=>{node.classList.remove(cls);node.style.animationDelay='';},rest+30);}
    seen=next;for(const k of [...at.keys()])if(!next.has(k))at.delete(k);};}
  function option(value,text){const node=el('option',text);node.value=value;return node;}
  const modelValue=model=>model?JSON.stringify({vendor:model.vendor,id:model.id}):'';
  const members=()=>data?.staff?.employees||[];
  const team=()=>data?.team||{nodes:{},edges:[],chat:[],settings:{},subagents:[]};
  const subs=()=>team().subagents||[];
  const subsOf=id=>subs().filter(s=>s.parentId===baseOf(id));
  // collab-refresh: 子代理 / 临时连接（每个外部对话或子代理的 Bridge 连接都会临时出现）不进「私聊」会话列表
  const isSubagent=m=>!!m&&(m.subagent===true||m.isSubagent===true||!!m.parentId||!!m.parentID||!!m.parentSessionId||m.kind==='subagent'||/^sub:/.test(String(m.id)));
  const dmMembers=()=>members().filter(m=>!isSubagent(m)&&!m.temporary);
  const roleName=id=>data?.roles?.find(r=>r.id===id)?.name||'未设岗位';
  // collab-nodes: 画布节点全部平级、互相独立（没有主节点/副本之分）。team.nodes = {节点ID:{x,y,memberId}}，成员只决定节点长什么样、怎么工作；
  // 老数据的节点 ID 就是成员 ID，新节点 ID = '成员ID~xxxx'。成员相关的东西一律按 baseOf(节点ID) 找成员
  const baseOf=k=>{k=String(k);const n=data?.team?.nodes?.[k];return n&&typeof n.memberId==='string'&&n.memberId?n.memberId:k.split('~')[0];};
  const memberName=id=>id==='user'?'我':id==='system'?'系统':members().find(m=>m.id===baseOf(id))?.name||'已删除成员';
  const avatarUrl=id=>{const u=data?.team?.avatars?.[baseOf(id)];return typeof u==='string'&&u.startsWith('data:image/')?u:'';};
  function speakerName(from){if(String(from).startsWith('ai:'))return String(from).slice(3);if(String(from).startsWith('sub:')){const s=subs().find(x=>'sub:'+x.id===from);return s?`${s.name}`:'已删除子代理';}return memberName(from);}
  function colorOf(id){let h=0;for(const c of baseOf(id))h=(h*31+c.charCodeAt(0))>>>0;return PALETTE[h%PALETTE.length];}
  const initial=name=>[...String(name||'?').trim()][0]||'?';
  const catalogModels=()=>data?.routingCatalog?.models||[];
  const findModel=ref=>ref?catalogModels().find(x=>x.vendor===ref.vendor&&x.id===ref.id):null;
  const modelGroup=x=>x.group||(x.vendor==='opencode-codex'?'Codex':'其他');
  const modelName=ref=>{const x=findModel(ref);return x?.name||ref?.id||'';};
  const shortModel=m=>m.kind==='mcp'?(m.temporary?'临时 · 外部 MCP':'外部 MCP'):m.model?cut(modelName(m.model),22):'未选模型';
  // 画布上只显示加入团队的成员（team.nodes 里有位置的），成员页里的其他人可随时加进来。
  const nodeExists=k=>!!(localPos[k]||team().nodes?.[k]);
  const nodeKeys=()=>[...new Set([...Object.keys(team().nodes||{}),...Object.keys(localPos)])].filter(nodeExists);
  const keyOrder=id=>(a,b)=>a===id?-1:b===id?1:a<b?-1:a>b?1:0;
  const nodeKeysOf=id=>nodeKeys().filter(k=>baseOf(k)===id).sort(keyOrder(id));
  // onCanvas(成员ID)：这位成员至少有一个节点；onCanvas(节点ID)：这个节点在
  const onCanvas=id=>nodeExists(id)||nodeKeysOf(id).length>0;
  const canvasMembers=()=>members().filter(m=>onCanvas(m.id));
  // 画布节点（同一成员可以多个，彼此独立）：id = 节点ID，memberId = 成员 ID，其余字段同成员
  function canvasNodes(){const by={},out=[];for(const k of nodeKeys())(by[baseOf(k)]??=[]).push(k);for(const m of members())for(const k of (by[m.id]||[]).sort(keyOrder(m.id)))out.push({...m,id:k,memberId:m.id});return out;}
  const newNodeKey=id=>baseOf(id)+'~'+Math.random().toString(36).slice(2,8);
  // 连线按节点存（fromNode/toNode = 节点ID，from/to = 成员 ID 给后端算关系）；画布上统一用节点ID
  function nodeEdges(){return team().edges.map(e=>{const f=e.fromNode&&nodeExists(e.fromNode)?e.fromNode:e.from,t=e.toNode&&nodeExists(e.toNode)?e.toNode:e.to;return f===e.from&&t===e.to?e:{...e,from:f,to:t,memberFrom:e.from,memberTo:e.to};});}
  // 按字宽估算截断（中文约 1em，英文约 0.58em），保证文字不出卡片。
  function fit(text,px,font){text=String(text||'');let w=0;for(let i=0;i<text.length;i++){w+=(/[\u2e80-\uffff]/.test(text[i])?1:0.58)*font;if(w>px)return text.slice(0,Math.max(1,i-1))+'…';}return text;}
  const cut=(s,n)=>{s=String(s);return s.length>n?s.slice(0,n-1)+'…':s;};

  // ---------- 页面切换 ----------
  const PAGES=['canvas','members','chat'];
  function syncPages(){for(const p of PAGES){$('tab-'+p).setAttribute('aria-selected',String(page===p));$('page-'+p).hidden=page!==p;}}
  function showPage(next){page=next;if(next!=='canvas')closeMorePanel();remember();syncPages();if(page==='canvas')drawCanvas();else if(page==='members')drawMembers();else{lastChatKey='';drawChatPage();$('tc-input').focus();}updateTabDot();}
  for(const p of PAGES)$('tab-'+p).onclick=()=>showPage(p);
  function updateTabDot(){$('tc-tab-dot').hidden=!(data?.team?.busy&&page!=='chat');}
  function openChat(next){channel=next;remember();lastChatKey='';showPage('chat');}

  // ---------- 布局 ----------
  function nodeHeight(id){if(isCollapsed(id))return TITLE_H;const n=subsOf(id).length;return (n?NODE_H+10+Math.ceil(n/2)*(PILL_H+PILL_GAP):NODE_H)+portRowsH(id);}
  function autoLayout(list){
    const edges=nodeEdges().filter(e=>e.type==='manage'),ids=new Set(list.map(m=>m.id)),children={},hasParent=new Set();
    for(const e of edges)if(ids.has(e.from)&&ids.has(e.to)){(children[e.from]??=[]).push(e.to);hasParent.add(e.to);}
    const level={};const visit=(id,d)=>{if(level[id]!==undefined&&level[id]>=d)return;level[id]=d;for(const c of children[id]||[])visit(c,d+1);};
    for(const r of list.filter(m=>!hasParent.has(m.id)&&children[m.id]))visit(r.id,0);
    const maxLevel=Math.max(-1,...Object.values(level));for(const m of list)if(level[m.id]===undefined)level[m.id]=maxLevel+1;
    const rows={};for(const m of list)(rows[level[m.id]]??=[]).push(m.id);
    const cols=Object.keys(rows).map(Number).sort((a,b)=>a-b),colH=lv=>rows[lv].reduce((s,id)=>s+nodeHeight(id),0)+(rows[lv].length-1)*ROW_GAP,tallest=Math.max(...cols.map(colH)),pos={};
    cols.forEach((lv,ci)=>{let y=TOP+(tallest-colH(lv))/2;for(const id of rows[lv]){pos[id]={x:PAD+ci*(NODE_W+COL_GAP),y:Math.round(y)};y+=nodeHeight(id)+ROW_GAP;}});
    return pos;
  }
  function positions(list){const savedPos=team().nodes||{},pos={};for(const m of list){const p=localPos[m.id]||savedPos[m.id];if(p)pos[m.id]={x:p.x,y:p.y,h:nodeHeight(m.id),c:isCollapsed(m.id)};}return pos;}
  function freeSpot(){const placed=[...Object.values(positions(canvasNodes())).map(p=>({x:p.x,y:p.y,w:NODE_W,h:p.h})),...aiRects()],sc=$('tc-scroll'),x0=Math.round(-view.x/view.k)+PAD,y0=Math.round(-view.y/view.k)+TOP,width=Math.max(NODE_W+PAD*2,(sc.clientWidth||900)/view.k),step=NODE_W+GAP_X;
    for(let y=y0;y<y0+40*(NODE_H+GAP_Y);y+=NODE_H+GAP_Y)for(let x=x0;x+NODE_W<=x0+width-PAD*2||x===x0;x+=step){if(!placed.some(p=>x<p.x+p.w+12&&x+NODE_W+12>p.x&&y<p.y+p.h+12&&y+NODE_H+12>p.y))return {x,y};}
    return {x:x0,y:y0};}
  async function addToCanvas(id,at,key){id=baseOf(id);/* 已在画布上的成员再加一次 = 再放一个独立节点 */if(!key)key=nodeExists(id)?newNodeKey(id):id;const p=at?{x:Math.round(at.x),y:Math.round(at.y)}:freeSpot();localPos[key]=p;closeAddPop();drawCanvas();try{await api('teamLayout',{nodes:{[key]:p}});record('添加成员',()=>removeFromCanvas([key]),()=>addToCanvas(id,p,key));if(!at)notice(`已把「${memberName(id)}」加到画布`);}catch(error){delete localPos[key];notice(error.message,true);drawCanvas();return false;}drawMembers();return key;}
  async function removeFromCanvas(ids){ids=[].concat(ids);const names=[...new Set(ids.map(memberName))],cur=positions(canvasNodes()),oldPos=Object.fromEntries(ids.filter(id=>cur[id]).map(id=>[id,{x:cur[id].x,y:cur[id].y}])),oldEdges=nodeEdges().filter(e=>ids.includes(e.from)||ids.includes(e.to)).map(e=>({...e}));try{await act('teamLayout',{nodes:Object.fromEntries(ids.map(id=>[id,null]))});for(const id of ids){delete localPos[id];selection.delete(id);if(data.team){delete data.team.nodes[id];data.team.edges=data.team.edges.filter(e=>(e.fromNode||e.from)!==id&&(e.toNode||e.to)!==id);}}if(!replaying)notice(ids.length===1?`已把「${names[0]}」${nodeKeysOf(baseOf(ids[0])).length?'的这个节点':''}移出画布（成员还在，可随时加回）`:`已把 ${ids.length} 位成员移出画布（成员还在，可随时加回）`);record('移出画布',async()=>{Object.assign(localPos,oldPos);await api('teamLayout',{nodes:oldPos});for(const e of oldEdges)await api('teamEdges',{from:e.from,to:[e.to],type:e.type});},()=>removeFromCanvas(ids));drawCanvas();updateHint();drawMembers();}catch{}}
  function closeAddPop(){const pop=$('tc-addpop');if(pop)pop.hidden=true;$('tc-canvas-add')?.setAttribute('aria-expanded','false');}
  function openAddPop(){const pop=$('tc-addpop');if(!pop)return;pop.replaceChildren();const rest=members();
    pop.append(el('div',rest.length?'加到画布（已在画布上的成员会再放一个节点）':'还没有成员','tc-addpop-head'));
    for(const m of rest){const b=el('button',null,'tc-addpop-item');b.type='button';b.setAttribute('role','menuitem');const t=el('span',null,'tc-addpop-text');t.append(el('span',m.name,'tc-addpop-name'),el('span',roleName(m.roleId)+' · '+shortModel(m)+(onCanvas(m.id)?` · 已有 ${nodeKeysOf(m.id).length} 个节点，再放一个`:''),'tc-addpop-sub'));b.append(avatar(m.id,true),t);b.onclick=()=>addToCanvas(m.id);pop.append(b);}
    const n=el('button','＋ 新建成员…','tc-addpop-new');n.type='button';n.onclick=()=>{closeAddPop();editMember(null,true);};pop.append(n);
    pop.hidden=false;$('tc-canvas-add').setAttribute('aria-expanded','true');}

  // ---------- 画布 ----------
  // collab-refresh: 状态每 3 秒推送一次（会话/子代理一变也会推），画布只在自己的数据变了才重建，元素、选择、平移缩放都不动
  let lastCanvasSig='';
  function canvasSig(){const list=canvasNodes(),busy=data.team?.busy;return JSON.stringify([list.map(m=>[m.id,avatarUrl(m.id).length,avatarUrl(m.id).slice(-32),m.name,m.enabled,m.kind,m.temporary,m.roleId,m.model,m.model?modelName(m.model):'',customized(m)]),members().length?1:0,team().nodes,team().copies||null,localPos,team().edges,team().settings,subs().map(s=>[s.id,s.parentId,s.name,s.status,s.task]),busy?[busy.memberId,busy.subId]:null,(data.tasks||[]).filter(t=>t.status==='running').map(t=>[t.id,chatTaskOwner(t.id)]),(data.roles||[]).map(r=>[r.id,r.name]),linkFrom,selectedEdge,[...selection],[...pendingLinks],wire?[wire.id,wire.side,wire.lift]:null,portsSig()]);}
  // collab-style: 画布动效——新节点缩放淡入、删除的节点淡出（只在同一项目内），连线流动层在节点下面
  const NODE_R=4,enterNodes=makeEnter();let fxWs=null,fxEdges=null;
  function fxLayer(id){let g=$(id);if(!g){g=svg('g',{id,class:id,'aria-hidden':'true'});$('tc-world').insertBefore(g,$('tc-nodes'));}return g;}
  function nodeFx(list,oldNodes,ws,drawn){const same=fxWs===ws;fxWs=ws;
    if(same&&motionOK()){const keep=new Set(list.map(m=>m.id)),gl=fxLayer('tc-ghosts');for(const [id,g] of oldNodes){if(!id||keep.has(id))continue;g.setAttribute('class','tc-node-ghost');for(const a of ['data-id','data-member','tabindex','role'])g.removeAttribute(a);g.style.animationDelay='';gl.append(g);setTimeout(()=>g.remove(),160);}}
    enterNodes(drawn);}
  function drawCanvas(){
    if(!data||page!=='canvas')return;
    {const sig=canvasSig();if(sig===lastCanvasSig&&$('tc-nodes').childNodes.length){applyView();return;}lastCanvasSig=sig;}
    const nodes=$('tc-nodes'),edges=$('tc-edges'),list=canvasNodes(),pos=positions(list),oldNodes=new Map([...nodes.children].map(g=>[g.dataset.id,g])),wsNow=data.workspaceId||'',flows=fxLayer('tc-flows'),drawnG=[],fxNext=new Set(),edgeAnim=!!fxEdges&&fxWs===wsNow&&motionOK();nodes.replaceChildren();edges.replaceChildren();flows.replaceChildren();
    {const b0=data.team?.busy;var activeIds=new Set(list.filter(m=>m.enabled&&((b0?.memberId===m.memberId&&!b0.subId)||(data.tasks||[]).some(t=>t.status==='running'&&chatTaskOwner(t.id)===m.memberId))).map(m=>m.id));}
    applyView();
    for(const edge of nodeEdges()){const a=pos[edge.from],b=pos[edge.to];if(!a||!b)continue;
      const key=edge.from+'>'+edge.to,sel=selectedEdge===key,d=edgePath(a,b,edge.type);
      const path=svg('path',{d,class:'tc-edge tc-edge-'+edge.type+(sel?' selected':'')+(wire?.lift===key?' lifted':'')});
      const pick=event=>{event.stopPropagation();selectedEdge=sel?null:key;selection.clear();drawCanvas();updateHint();};
      const hit=svg('path',{d,class:'tc-edge-hit'});hit.addEventListener('click',pick);hit.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();edgeMenu(edge,event);});
      const mid=svg('circle',{r:4.5,class:'tc-edge-dot tc-edge-dot-'+edge.type+(sel?' selected':'')});mid.addEventListener('pointerdown',event=>event.stopPropagation());mid.addEventListener('click',pick);mid.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();edgeMenu(edge,event);});
      const title=svg('title');title.textContent=edge.type==='manage'?`${memberName(edge.from)} 管理 ${memberName(edge.to)}`:`${memberName(edge.from)} ⇄ ${memberName(edge.to)}`;hit.append(title);
      edges.append(path,hit,mid);placeDot(mid,path);
      // collab-style: 新连线「画出来」；两端有人在发言/执行时连线上有流动的光点
      {const ek=key+':'+edge.type;fxNext.add(ek);if(edgeAnim&&!fxEdges.has(ek)){path.style.animation='cs-edge-in .15s ease-out both';setTimeout(()=>{path.style.animation='';},200);}
        if(activeIds.has(edge.from)||activeIds.has(edge.to))flows.append(svg('path',{d,class:'tc-flow tc-flow-'+edge.type,'data-from':edge.from,'data-to':edge.to,'data-type':edge.type}));}}
    fxEdges=fxNext;
    const busy=data.team?.busy;
    for(const m of list){const p=pos[m.id],speaking=busy?.memberId===m.memberId&&!busy.subId,working=(data.tasks||[]).some(t=>t.status==='running'&&chatTaskOwner(t.id)===m.memberId),color=colorOf(m.id),allow=team().settings?.[m.memberId]?.allowSubagents===true,av=avatarUrl(m.memberId),nameX=46;
      const g=svg('g',{class:'tc-node'+(linkFrom===m.id?' linking':'')+(selection.has(m.id)?' selected':'')+(pendingLinks.has(m.id)?' pending':'')+(m.enabled?'':' disabled')+(speaking?' speaking':'')+(working?' working':'')+(p.c?' collapsed':''),transform:`translate(${p.x},${p.y})`,tabindex:0,'data-id':m.id,'data-member':m.memberId});
      // ComfyUI 式节点：标题栏（状态点+名字）、左侧输入槽（上级/协作）、右侧输出槽（下级/协作）、岗位与模型两行参数
      g.append(svg('rect',{width:NODE_W,height:p.h,rx:NODE_R,class:'tc-node-box'}));
      const headD=`M0,${NODE_R} a${NODE_R},${NODE_R} 0 0 1 ${NODE_R},-${NODE_R} h${NODE_W-2*NODE_R} a${NODE_R},${NODE_R} 0 0 1 ${NODE_R},${NODE_R} v${TITLE_H-NODE_R} h-${NODE_W} z`,head=svg('path',{d:headD,class:'tc-node-head'});head.style.setProperty('--node-color',color);g.append(head);
      g.append(svg('line',{x1:0,y1:TITLE_H,x2:NODE_W,y2:TITLE_H,class:'tc-node-sep'}));
      const dot=svg('circle',{cx:14,cy:TITLE_H/2,r:4.5,class:'tc-node-dot'});const tip=svg('title');tip.textContent=speaking?'正在发言':working?'正在执行任务':m.enabled?'空闲':'已停用';dot.append(tip);g.append(dot);
      const stTxt=m.enabled&&(speaking||working)?(speaking?'发言中':'执行任务'):'';if(stTxt){const st=svg('text',{x:NODE_W-(allow?30:12),y:TITLE_H/2+4,class:'tc-node-state','text-anchor':'end'});st.textContent=stTxt;g.append(st);}
      if(av){/* collab-employee: 头像（成员页 / 右键「更换头像」上传并裁剪） */const im=svg('image',{x:24,y:(TITLE_H-18)/2,width:18,height:18,class:'tc-node-avatar',preserveAspectRatio:'xMidYMid slice'});im.setAttribute('href',av);g.append(svg('circle',{cx:33,cy:TITLE_H/2,r:10,class:'tc-node-avring'}),im);}
      else{/* collab-style: 没上传头像时用名字首字的圆形头像 */const ic=svg('circle',{cx:33,cy:TITLE_H/2,r:9,class:'tc-node-initial'});ic.style.fill=color;const it=svg('text',{x:33,y:TITLE_H/2+3.8,'text-anchor':'middle',class:'tc-node-initial-text'});it.textContent=initial(m.name);g.append(ic,it);}
      const name=svg('text',{x:nameX,y:TITLE_H/2+4.5,class:'tc-node-name'});name.textContent=fit(m.name,NODE_W-nameX-(allow?30:12)-(stTxt?52:0),13);
      const modelText=m.kind==='mcp'?(m.temporary?'临时 · 外部 MCP':'外部 MCP'):m.model?modelName(m.model):'未选模型';
      const nInst=nodeKeysOf(m.memberId).length,full=svg('title');full.textContent=`${m.name}\n${roleName(m.roleId)} · ${modelText}`+(nInst>1?`\n画布上有 ${nInst} 个「${m.name}」节点：各自独立连线；改名字/岗位/模型/启用会同步到每一个，删除只删这一个`:'');g.append(full);
      g.append(name);
      const slotLabel=(x,y,t,anchor)=>{const s=svg('text',{x,y:y+4,class:'tc-slot-label','text-anchor':anchor});s.textContent=t;g.append(s);};
      slotLabel(14,SLOT1,'上级','start');slotLabel(NODE_W-14,SLOT1,'下级','end');slotLabel(14,SLOT2,'协作','start');slotLabel(NODE_W-14,SLOT2,'协作','end');
      const editable=!m.temporary;
      // canvas-toolbar-edit: ComfyUI 式节点内控件——岗位/模型点开下拉直接改，启用/子代理点一下切换，双击标题改名（和成员页走同一个 saveEmployee / teamMemberSettings）
      const widget=(y,label,value,kind)=>{const on=editable&&!!kind,w=svg('g',{class:'tc-widget'+(on?' editable':''),transform:`translate(10,${y})`,'data-w':kind||''});w.append(svg('rect',{width:NODE_W-20,height:18,rx:9,class:'tc-widget-box'}));const l=svg('text',{x:10,y:12.5,class:'tc-widget-label'});l.textContent=label;const v=svg('text',{x:NODE_W-(on?42:30),y:12.5,class:'tc-widget-value','text-anchor':'end'});v.textContent=fit(value,NODE_W-20-(on?70:58),11);w.append(l,v);
        if(on){const c=svg('path',{d:`M${NODE_W-36},7.5 l3.5,3.5 l3.5,-3.5`,class:'tc-widget-chev'});w.append(c);const t=svg('title');t.textContent=kind==='role'?'点一下换岗位':'点一下换模型';w.append(t);w.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.stopPropagation();});w.addEventListener('click',event=>{event.stopPropagation();openWidgetPop(m.id,kind,w);});w.addEventListener('dblclick',event=>event.stopPropagation());}
        g.append(w);};
      widget(WID1,'岗位',roleName(m.roleId),'role');widget(WID2,'模型',modelText,m.kind==='api'?'model':null);
      if(editable){const toggle=(y,kind,label,on,tipText)=>{const w=64,tg=svg('g',{class:'tc-wtoggle'+(on?' on':''),transform:`translate(${(NODE_W-w)/2},${y-8})`,'data-w':kind,role:'switch','aria-checked':String(on)});tg.append(svg('rect',{width:w,height:16,rx:8,class:'tc-wtoggle-box'}),svg('circle',{cx:on?w-9:9,cy:8,r:4.5,class:'tc-wtoggle-knob'}));const tx=svg('text',{x:on?w/2-4:w/2+4,y:11.5,'text-anchor':'middle',class:'tc-wtoggle-text'});tx.textContent=label;const tt=svg('title');tt.textContent=tipText;tg.append(tx,tt);
          tg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.stopPropagation();});tg.addEventListener('click',event=>{event.stopPropagation();if(kind==='enabled')saveMemberRec(m.id,{enabled:!on},on?'停用成员':'启用成员');else saveSubRec(m.id,!on);});tg.addEventListener('dblclick',event=>event.stopPropagation());g.append(tg);};
        toggle(SLOT1,'enabled',m.enabled?'启用':'停用',!!m.enabled,m.enabled?'已启用：点一下停用（停用后不接群聊、不派工）':'已停用：点一下启用');
        if(m.kind==='api')toggle(SLOT2,'sub','子代理',allow,allow?'可以创建子代理：点一下关闭':'不能创建子代理：点一下允许');
        // member-custom: 节点底部的小「更多」，点开浮动面板（在 SVG 外的 body 层，推送重画节点不会动它）
        {const w=64,on=customized(m),mg=svg('g',{class:'tc-wmore'+(on?' set':'')+(morePanel?.id===m.id?' open':''),transform:`translate(${(NODE_W-w)/2},${MORE_Y})`,'data-w':'more',role:'button','aria-label':'更多设置'});mg.append(svg('rect',{width:w,height:16,rx:8,class:'tc-wmore-box'}));const mt=svg('text',{x:w/2,y:11.5,'text-anchor':'middle',class:'tc-wmore-text'});mt.textContent=(on?'● ':'')+'更多 ▾';const mtt=svg('title');mtt.textContent='目标 / 背景、工具与权限、模型参数';mg.append(mt,mtt);
          mg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.stopPropagation();});mg.addEventListener('click',event=>{event.stopPropagation();openMorePanel(m.id);});mg.addEventListener('dblclick',event=>event.stopPropagation());g.append(mg);}
        const th=svg('rect',{x:22,y:0,width:NODE_W-22-(allow?30:12),height:TITLE_H,class:'tc-node-titlehit'});const tht=svg('title');tht.textContent='双击改名 · 拖动移动';th.append(tht);g.append(th);}
      if(allow){const badge=svg('text',{x:NODE_W-12,y:TITLE_H/2+4.5,class:'tc-node-badge','text-anchor':'end'});badge.textContent='⑂';const bt=svg('title');bt.textContent='可创建子代理';badge.append(bt);g.append(badge);}
      // 子代理：节点下半部分的小胶囊，✕ 删除
      subsOf(m.id).forEach((s,i)=>{const w=(NODE_W-24-PILL_GAP)/2,x=12+(i%2)*(w+PILL_GAP),y=NODE_H+4+portRowsH(m.id)+Math.floor(i/2)*(PILL_H+PILL_GAP),active=busy?.subId===s.id;
        const pg=svg('g',{class:'tc-pill-node s-'+(active?'running':s.status),transform:`translate(${x},${y})`});
        pg.append(svg('rect',{width:w,height:PILL_H,rx:PILL_H/2,class:'tc-pill-box'}));
        pg.append(svg('circle',{cx:12,cy:PILL_H/2,r:3.5,class:'tc-pill-dot'}));
        const t=svg('text',{x:21,y:PILL_H/2+4,class:'tc-pill-text'});t.textContent=cut(s.name,6);pg.append(t);
        const tt=svg('title');tt.textContent=`子代理「${s.name}」· ${subLabels[active?'running':s.status]||s.status}\n任务：${cut(s.task,300)}`;pg.append(tt);
        const x2=svg('g',{class:'tc-pill-del',transform:`translate(${w-18},${PILL_H/2})`});x2.append(svg('circle',{r:8}));const xt=svg('text',{y:3.5,'text-anchor':'middle'});xt.textContent='✕';x2.append(xt);
        x2.addEventListener('pointerdown',event=>event.stopPropagation());
        x2.addEventListener('click',event=>{event.stopPropagation();act('teamDeleteSubagent',{subId:s.id}).then(()=>notice(`已删除子代理「${s.name}」`)).catch(()=>{});});
        pg.append(x2);g.append(pg);});
      g.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.stopPropagation();const cur={...providerPos(),...positions(canvasNodes())},group=selection.has(m.id)&&selection.size>1&&!linkMode?[...selection]:[m.id];drag={id:m.id,onTitle:!!(event.target.closest&&event.target.closest('.tc-node-titlehit,.tc-node-name')),sx:event.clientX,sy:event.clientY,orig:Object.fromEntries(group.filter(id=>cur[id]).map(id=>[id,{x:cur[id].x,y:cur[id].y}])),moved:false};g.setPointerCapture(event.pointerId);});
      g.addEventListener('pointermove',event=>{if(!drag||drag.id!==m.id)return;const dx=(event.clientX-drag.sx)/view.k,dy=(event.clientY-drag.sy)/view.k;if(Math.abs(event.clientX-drag.sx)+Math.abs(event.clientY-drag.sy)>3)drag.moved=true;if(!drag.moved)return;stageEl.classList.add('tc-node-dragging');const snap=event.shiftKey?(v=>Math.round(v/GRID)*GRID):Math.round;for(const [id,o] of Object.entries(drag.orig)){localPos[id]={x:snap(o.x+dx),y:snap(o.y+dy)};anyNodeEl(id)?.setAttribute('transform',`translate(${localPos[id].x},${localPos[id].y})`);}redrawEdgesOnly();renderMini();});
      g.addEventListener('pointerup',event=>{if(!drag||drag.id!==m.id)return;const moved=drag.moved,ids=Object.keys(drag.orig),orig=drag.orig,ot=drag.onTitle;drag=null;stageEl.classList.remove('tc-node-dragging');if(moved){const next=Object.fromEntries(ids.map(id=>[id,{...localPos[id]}]));saveLayoutMixed(next).then(()=>record('移动',()=>setLayout(orig),()=>setLayout(next))).catch(error=>notice(error.message,true));drawCanvas();}else{const onTitle=editable&&ot,now=Date.now();if(onTitle&&titleClick.id===m.id&&now-titleClick.at<450){titleClick={id:null,at:0};startRename(m.id);return;}titleClick=onTitle?{id:m.id,at:now}:{id:null,at:0};nodeClick(m,event);}});
      g.addEventListener('dblclick',event=>{if(event.target.closest&&event.target.closest('.tc-widget.editable,.tc-wtoggle,.tc-wmore,.tc-node-titlehit,.tc-node-name,.tc-port,.tc-prow'))return;if(wEdit)return;editMember(m);});g.addEventListener('keydown',event=>{if(event.target!==g)return;if(event.key==='Enter')editMember(m);else if(event.key==='F2'&&editable){event.preventDefault();startRename(m.id);}});
      g.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();nodeMenu(m,event);});
      drawPorts(g,m,p);drawPortRows(g,m);drawOutPorts(g,m);
      nodes.append(g);drawnG.push([m.id,g]);}
    drawPortsLayer();
    nodeFx(list,oldNodes,wsNow,drawnG);
    renderMini();canvasHooks.memberChanged();
  }
  // comfy-canvas: ComfyUI 式端口与拖拽连线。下端口=管理下级；上端口=接上级（已有上级时拖起原连线：放到别的成员上改接，放到空白处删除）；左右端口=协作。Esc 取消，Delete 删除选中的连线/把选中成员移出画布。
  let wire=null;
  const PORT_R=5,GRID=22,PORT_TIPS={in:'上级：拖到另一位成员上，让它管理这位；已有上级时拖起原连线可改接，拖到空白处删除',out:'下级：拖到成员上，让这位管理它；拖到空白处可搜索成员并连上',left:'协作：拖到成员上建立协作连线；拖到空白处可搜索成员',right:'协作：拖到成员上建立协作连线；拖到空白处可搜索成员'};
  function portXY(p,side){if(p.c)return {x:side==='out'||side==='right'?p.x+NODE_W:p.x,y:p.y+(side==='in'||side==='out'?9:20)};return side==='out'?{x:p.x+NODE_W,y:p.y+SLOT1}:side==='in'?{x:p.x,y:p.y+SLOT1}:side==='left'?{x:p.x,y:p.y+SLOT2}:{x:p.x+NODE_W,y:p.y+SLOT2};}
  function portLinked(id,side){const es=nodeEdges();return side==='out'?es.some(e=>e.type==='manage'&&e.from===id):side==='in'?es.some(e=>e.type==='manage'&&e.to===id):es.some(e=>e.type==='peer'&&(e.from===id||e.to===id));}
  function drawPorts(g,m,p){for(const side of ['in','out','left','right']){const at=portXY({x:0,y:0,h:p.h,c:p.c},side);
      const pg=svg('g',{class:'tc-port tc-port-'+side+(wire&&wire.id===m.id&&wire.side===side?' active':'')+(portLinked(m.id,side)?' linked':''),transform:`translate(${at.x},${at.y})`,'data-side':side});
      pg.append(svg('circle',{r:10,class:'tc-port-hit'}),svg('circle',{r:PORT_R,class:'tc-port-dot'}));const t=svg('title');t.textContent=PORT_TIPS[side];pg.append(t);
      pg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.preventDefault();event.stopPropagation();wireStart(m.id,side,event);});
      pg.addEventListener('click',event=>event.stopPropagation());pg.addEventListener('dblclick',event=>event.stopPropagation());
      g.append(pg);}}
  function wireStart(id,side,event){const p=positions(canvasNodes())[id];if(!p)return;
    let from=id,type=side==='out'?'manage':side==='in'?'manage-up':'peer',lift=null;
    if(side==='in'){const up=nodeEdges().filter(e=>e.type==='manage'&&e.to===id);if(up.length){const e=up[up.length-1];lift=e.from+'>'+e.to;from=e.from;type='manage';}}
    wire={id,side,from,type,lift,sx:event.clientX,sy:event.clientY,anchorId:lift?from:id,anchorSide:lift?'out':side,target:null,path:svg('path',{class:'tc-wire'+(type==='peer'?' tc-wire-peer':'')})};
    $('tc-world').append(wire.path);stageEl.classList.add('tc-wiring');try{canvasEl.setPointerCapture(event.pointerId);}catch{}
    selectedEdge=null;drawCanvas();updateHint();wireMove(event);}
  const SIDE_V={out:[1,0],in:[-1,0],left:[-1,0],right:[1,0]},OPP={out:'in',in:'out',left:'right',right:'left'};
  function spline(a,aSide,b,bSide){const va=SIDE_V[aSide]||[1,0],vb=SIDE_V[bSide]||[-1,0],d=Math.max(36,Math.min(220,Math.hypot(b.x-a.x,b.y-a.y)*0.5));return `M${a.x},${a.y} C${a.x+va[0]*d},${a.y+va[1]*d} ${b.x+vb[0]*d},${b.y+vb[1]*d} ${b.x},${b.y}`;}
  function wirePath(a,aSide,b,bSide){return spline(a,aSide,b,bSide||OPP[aSide]);}
  function wireHit(pt,skip){for(const [id,p] of Object.entries(positions(canvasNodes()))){if(id===skip)continue;if(pt.x>=p.x-10&&pt.x<=p.x+NODE_W+10&&pt.y>=p.y-10&&pt.y<=p.y+p.h+10)return id;}return null;}
  function wireMove(event){if(!wire)return;const pos=positions(canvasNodes()),a=pos[wire.anchorId];if(!a)return;const s=portXY(a,wire.anchorSide),pt=toWorld(event.clientX,event.clientY);
    wire.cx=event.clientX;wire.cy=event.clientY;
    const t=wireHit(pt,wire.type==='manage-up'?wire.id:wire.from);let end=pt,endSide=null;
    if(t){const tp=pos[t];endSide=wire.type==='peer'?(tp.x+NODE_W/2<s.x?'right':'left'):wire.type==='manage-up'?'out':'in';end=portXY(tp,endSide);}
    wire.path.setAttribute('d',wirePath(s,wire.anchorSide,end,endSide));
    const multi=t&&!wire.lift&&selection.has(t)?multiTargets(t,[wire.id,wire.from]):null;const key=t+'|'+(multi||[]).join(',');
    if(key!==wire.tkey){wire.tkey=key;for(const g of $('tc-nodes').querySelectorAll('.tc-node.wire-target'))g.classList.remove('wire-target');wire.target=t;wire.targets=multi;for(const k of multi||(t?[t]:[]))$('tc-nodes').querySelector(`[data-id="${CSS.escape(k)}"]`)?.classList.add('wire-target');}
    drawGhostWires(wire,multi&&multi.filter(k=>k!==t).map(k=>{const tp=pos[k],side=wire.type==='peer'?(tp.x+NODE_W/2<s.x?'right':'left'):wire.type==='manage-up'?'out':'in';return wirePath(s,wire.anchorSide,portXY(tp,side),side);}));}
  /** 连线拖到「多选中的某个节点」上：选中的所有成员节点都是目标（ComfyUI 那样一次连多个）。 */
  function multiTargets(t,skip){const pos=positions(canvasNodes()),ts=[...selection].filter(k=>pos[k]&&!skip.includes(k));return ts.length>1&&ts.includes(t)?ts:null;}
  function drawGhostWires(w,ds){for(const p of w.ghosts||[])p.remove();w.ghosts=(ds||[]).map(d=>{const p=svg('path',{d,class:(w.path.getAttribute('class')||'tc-wire')+' tc-wire-ghost'});$('tc-world').append(p);return p;});}
  function wireCancel(){const w=wire;wire=null;if(!w)return null;w.path.remove();drawGhostWires(w,null);stageEl.classList.remove('tc-wiring');for(const g of $('tc-nodes').querySelectorAll('.tc-node.wire-target'))g.classList.remove('wire-target');return w;}
  async function connectEdge(from,to,type){if(!from||!to||from===to)return false;const r=await act('teamEdges',{from,to:[to],type}),ok=r?.added||[],bad=r?.skipped||[];if(!ok.length&&bad.length)notice(bad[0].reason,true);return ok.length>0;}
  async function wireEnd(){const w=wireCancel();if(!w)return;const t=w.target;
    try{
      if(w.lift){const [from,to]=w.lift.split('>');
        if(t!==to){if(t){if(t!==from&&await connectEdge(from,t,'manage')){await act('teamEdge',{from,to,type:'none'});record('改接',async()=>{await api('teamEdge',{from,to:t,type:'none'});await api('teamEdges',{from,to:[to],type:'manage'});},async()=>{await api('teamEdges',{from,to:[t],type:'manage'});await api('teamEdge',{from,to,type:'none'});});}}else await delEdgeRec(from,to);}}
      else if(t&&w.targets?.length>1){const done=[];for(const k of w.targets){const [a,b]=w.type==='manage-up'?[k,w.id]:[w.id,k],type=w.type==='manage-up'?'manage':w.type;if(await connectEdge(a,b,type))done.push([a,b,type]);}
        if(done.length){record(`连线 ×${done.length}`,async()=>{for(const [a,b] of done)await api('teamEdge',{from:a,to:b,type:'none'});},async()=>{for(const [a,b,type] of done)await api('teamEdges',{from:a,to:[b],type});});notice(`已连到 ${done.length} 个节点`);}}
      else if(t){if(w.type==='manage-up')await addEdgeRec(t,w.id,'manage');else await addEdgeRec(w.id,t,w.type);}
      else if(w.cx!==undefined&&Math.hypot(w.cx-w.sx,w.cy-w.sy)>8){drawCanvas();updateHint();openSearch(w.cx,w.cy,{id:w.id,type:w.type,side:w.side});return;}
    }catch{}
    drawCanvas();updateHint();}
  function redrawEdgesOnly(){try{drawFeeds();}catch{}const pos=positions(canvasNodes()),paths=[...$('tc-edges').children];let i=0;for(const edge of nodeEdges()){const a=pos[edge.from],b=pos[edge.to];if(!a||!b)continue;const d=edgePath(a,b,edge.type),p=paths[i++];p?.setAttribute('d',d);paths[i++]?.setAttribute('d',d);const dot=paths[i++];if(p&&dot)placeDot(dot,p);}for(const f of $('tc-flows')?.querySelectorAll('.tc-flow')||[]){const a=pos[f.dataset.from],b=pos[f.dataset.to];if(a&&b)f.setAttribute('d',edgePath(a,b,f.dataset.type));}}
  function placeDot(dot,path){try{const L=path.getTotalLength(),q=path.getPointAtLength(L/2);dot.setAttribute('cx',q.x);dot.setAttribute('cy',q.y);}catch{}}
  function edgePath(a,b,type){
    if(type==='manage')return spline(portXY(a,'out'),'out',portXY(b,'in'),'in');
    const ltr=a.x<=b.x;return ltr?spline(portXY(a,'right'),'right',portXY(b,'left'),'left'):spline(portXY(a,'left'),'left',portXY(b,'right'),'right');
  }
  function chatTaskOwner(taskId){return team().chat.find(m=>m.kind==='task'&&m.taskId===taskId)?.assignee||null;}
  async function nodeClick(m,event){const multi=!!(event&&(event.ctrlKey||event.metaKey));
    if(!linkMode){if(multi){if(selection.has(m.id))selection.delete(m.id);else selection.add(m.id);}else selection=selection.size===1&&selection.has(m.id)?new Set():new Set([m.id]);selectedEdge=null;updateHint();drawCanvas();return;}
    if(!linkFrom){linkFrom=m.id;pendingLinks.clear();updateHint();drawCanvas();return;}
    if(linkFrom===m.id){if(!pendingLinks.size)linkFrom=null;updateHint();drawCanvas();return;}
    // 按住 Ctrl 逐个点选下级，松开 Ctrl 一次连好
    if(multi){if(pendingLinks.has(m.id))pendingLinks.delete(m.id);else pendingLinks.add(m.id);updateHint();drawCanvas();return;}
    await commitLinks([m.id]);
  }
  async function commitLinks(ids){const from=linkFrom,type=linkMode;ids=[...new Set(ids)].filter(id=>id!==from);linkFrom=null;pendingLinks.clear();if(!from||!type||!ids.length){updateHint();drawCanvas();return;}
    try{const r=await act('teamEdges',{from,to:ids,type}),ok=r?.added||[],bad=r?.skipped||[],names=ok.map(memberName).join('、');if(ok.length)record('连线',async()=>{for(const to of ok)await api('teamEdge',{from,to,type:'none'});},()=>api('teamEdges',{from,to:ok,type}));
      if(ok.length)notice((type==='manage'?`${memberName(from)} 现在管理 ${names}`:`${memberName(from)} ⇄ ${names} 可以协作`)+(bad.length?`；跳过 ${bad.length} 位（${bad[0].reason}）`:''),false);else if(bad.length)notice(bad[0].reason,true);}catch{}
    updateHint();drawCanvas();}
  function setLinkMode(mode){linkMode=linkMode===mode?null:mode;linkFrom=null;selectedEdge=null;selection.clear();pendingLinks.clear();$('tc-link-manage')?.setAttribute('aria-pressed',String(linkMode==='manage'));$('tc-link-peer')?.setAttribute('aria-pressed',String(linkMode==='peer'));updateHint();drawCanvas();}
  function updateHint(){const bar=$('tc-link-hint');if(!bar)return;bar.replaceChildren();
    if(selection.size&&!linkMode&&!selectedEdge){const nowNodes=canvasNodes(),list=[...selection].map(id=>nowNodes.find(x=>x.id===id)).filter(Boolean);selection=new Set(list.map(m=>m.id));
      if(list.length===1){const m=list[0];bar.append(el('span',`${m.name} · ${roleName(m.roleId)}`));if(!m.temporary){const e=el('button','编辑成员','tc-ghost');e.onclick=()=>editMember(m);bar.append(e);}if(m.kind==='api'){const d=el('button','💬 私聊','tc-ghost');d.onclick=()=>openChat('dm:'+m.memberId);bar.append(d);}const r=el('button','移出画布','tc-danger-link');r.title='只从团队画布移除，并删掉它的连线；成员本身不删除';r.onclick=()=>removeFromCanvas([m.id]);bar.append(r);bar.hidden=false;return;}
      if(list.length>1){bar.append(el('span',`已选 ${list.length} 位成员 · 拖动任意一位可整体移动`));const r=el('button','移出画布','tc-danger-link');r.title='只从团队画布移除，并删掉它们的连线；成员本身不删除';r.onclick=()=>removeFromCanvas(list.map(m=>m.id));const c=el('button','取消选择','tc-ghost');c.onclick=()=>{selection.clear();updateHint();drawCanvas();};bar.append(r,c);bar.hidden=false;return;}}
    if(selectedEdge){const [from,to]=selectedEdge.split('>'),edge=nodeEdges().find(e=>e.from===from&&e.to===to);bar.append(el('span',edge?.type==='manage'?`${memberName(from)} → ${memberName(to)}（管理）`:`${memberName(from)} ⇄ ${memberName(to)}（协作）`));const b=el('button','删除连线','tc-danger-link');b.onclick=async()=>{try{await delEdgeRec(from,to);selectedEdge=null;updateHint();}catch{}};bar.append(b);bar.hidden=false;return;}
    if(linkMode){const many=pendingLinks.size?`（已选 ${pendingLinks.size} 位，松开 Ctrl 完成）`:'';bar.append(el('span',linkMode==='manage'?(linkFrom?`已选上级「${memberName(linkFrom)}」，点下级；按住 Ctrl 可多选，或拖框选多位${many}`:'管理连线：先点上级'):(linkFrom?`已选「${memberName(linkFrom)}」，点另一位；按住 Ctrl 可多选，或拖框选多位${many}`:'协作连线：点第一位成员')));if(pendingLinks.size){const ok=el('button',`连接 ${pendingLinks.size} 位`,'tc-primary');ok.onclick=()=>commitLinks([...pendingLinks]);bar.append(ok);}const b=el('button','完成','tc-ghost');b.onclick=()=>setLinkMode(linkMode);bar.append(b);bar.hidden=false;return;}
    bar.hidden=true;}
  // ---------- 视图（ComfyUI 手感）：左键拖空白处/空格/中键平移、滚轮以光标为中心缩放、Ctrl+拖动框选（Shift 加选）、双击空白处搜索添加、右键菜单、Ctrl+Z/Y 撤销重做、. 适应画布 ----------
  const stageEl=$('tc-scroll'),canvasEl=$('tc-canvas');
  function applyView(){$('tc-world').setAttribute('transform',`translate(${view.x},${view.y}) scale(${view.k})`);$('tc-grid').setAttribute('patternTransform',`translate(${view.x},${view.y}) scale(${view.k})`);const cw=$('cv-world'),tf=`translate(${view.x}px, ${view.y}px) scale(${view.k})`;if(cw)cw.style.transform=tf;if(wLayer)wLayer.style.transform=tf;const zp=$('cv-zoom-pct');if(zp)zp.textContent=Math.round(view.k*100)+'%';renderMini();}
  // collab-style: 工具栏缩放/适应/居中平滑过渡（按屏幕中心的世界坐标插值、缩放按比例插值）；滚轮、拖动一开始就停下，不和拖动/平移抢
  let viewAnim=null;
  function animView(fn,ms=90){if(viewAnim)viewAnim.finish();const W=stageEl.clientWidth,H=stageEl.clientHeight,from={x:view.x,y:view.y,k:view.k};fn();const to={x:view.x,y:view.y,k:view.k};
    if(!motionOK()||!W||!H||(Math.abs(from.k-to.k)<1e-4&&Math.abs(from.x-to.x)<.5&&Math.abs(from.y-to.y)<.5))return;
    const c0={x:(W/2-from.x)/from.k,y:(H/2-from.y)/from.k},c1={x:(W/2-to.x)/to.k,y:(H/2-to.y)/to.k},t0=performance.now();let done=false,raf=0,timer=0;
    const set=t=>{const e=1-Math.pow(1-t,3),k=from.k*Math.pow(to.k/from.k,e),cx=c0.x+(c1.x-c0.x)*e,cy=c0.y+(c1.y-c0.y)*e;view.x=W/2-cx*k;view.y=H/2-cy*k;view.k=k;applyView();};
    const end=snap=>{if(done)return;done=true;cancelAnimationFrame(raf);clearTimeout(timer);if(snap){view.x=to.x;view.y=to.y;view.k=to.k;applyView();}if(viewAnim===a)viewAnim=null;};
    const a={finish:()=>end(true),stop:()=>end(false)};viewAnim=a;
    let last=t0;const step=()=>{if(done)return;const now=performance.now(),t=(now-t0)/ms;/* 卡顿（一帧超过 40ms）就直接到位，不拖慢 */if(t>=1||now-last>40){end(true);return;}last=now;set(t);raf=requestAnimationFrame(step);};
    set(0);raf=requestAnimationFrame(step);timer=setTimeout(()=>end(true),ms+5);}
  const stopViewAnim=event=>{if(viewAnim&&!(event.target.closest&&event.target.closest('.cv-zoombar,.tc-minimap')))viewAnim.stop();};
  stageEl.addEventListener('wheel',stopViewAnim,{capture:true,passive:true});stageEl.addEventListener('pointerdown',stopViewAnim,true);
  let viewSaveTimer=0;const saveView=()=>{clearTimeout(viewSaveTimer);viewSaveTimer=setTimeout(remember,300);};
  function toWorld(cx,cy){const r=canvasEl.getBoundingClientRect();return {x:(cx-r.left-view.x)/view.k,y:(cy-r.top-view.y)/view.k};}
  function zoomAt(k,cx,cy){k=Math.min(3,Math.max(0.1,k));const r=canvasEl.getBoundingClientRect(),px=cx-r.left,py=cy-r.top;view.x=px-(px-view.x)*k/view.k;view.y=py-(py-view.y)*k/view.k;view.k=k;applyView();saveView();}
  function fitView(){const pos=[...Object.values(positions(canvasNodes())).map(p=>({x:p.x,y:p.y,w:NODE_W,h:p.h})),...aiRects()],w=stageEl.clientWidth||800,h=stageEl.clientHeight||500,top=64;if(!pos.length){view={x:0,y:0,k:1};applyView();saveView();return;}
    const minX=Math.min(...pos.map(p=>p.x)),minY=Math.min(...pos.map(p=>p.y)),maxX=Math.max(...pos.map(p=>p.x+p.w)),maxY=Math.max(...pos.map(p=>p.y+p.h)),k=Math.min(1,Math.max(0.25,Math.min((w-80)/(maxX-minX),(h-top-40)/(maxY-minY))));
    view={k,x:(w-(maxX-minX)*k)/2-minX*k,y:top+(h-top-(maxY-minY)*k)/2-minY*k};applyView();saveView();}
  stageEl.addEventListener('wheel',event=>{if(page!=='canvas'||event.target.closest('.tc-minimap,.cv-browser img,.cv-zoombar,.tc-wedit'))return;event.preventDefault();closeMenus();
    const dy=event.deltaY*(event.deltaMode===1?16:1);
    if(event.shiftKey&&!event.ctrlKey&&!event.metaKey){view.x-=dy||event.deltaX;applyView();saveView();return;}
    if(event.altKey)altZoomed=true;
    // 滚轮缩放（以光标为中心）；触控板捏合会带 ctrlKey、步子小，放大系数
    zoomAt(view.k*Math.exp(-dy*(event.ctrlKey&&Math.abs(dy)<40?0.01:0.0015)),event.clientX,event.clientY);},{passive:false});
  canvasEl.addEventListener('mousedown',event=>{if(event.button===1)event.preventDefault();});
  canvasEl.addEventListener('auxclick',event=>{if(event.button===1)event.preventDefault();});
  canvasEl.addEventListener('pointerdown',event=>{if(page!=='canvas')return;if(event.button===1||event.button===0&&spaceDown){event.preventDefault();event.stopPropagation();pan={sx:event.clientX,sy:event.clientY,ox:view.x,oy:view.y,moved:true};canvasEl.setPointerCapture(event.pointerId);stageEl.classList.add('tc-panning');}},true);
  canvasEl.addEventListener('pointerdown',event=>{closeMenus();if(event.button!==0||pan||event.target.closest('.tc-node,.tc-edge-hit,.tc-edge-dot'))return;
    // ComfyUI：左键拖空白处平移画布；Ctrl（或 Shift 加选）拖动才框选；连线模式下仍按原来的框选
    if(!(event.ctrlKey||event.metaKey||event.shiftKey||linkMode)){pan={sx:event.clientX,sy:event.clientY,ox:view.x,oy:view.y,click:true,moved:false};canvasEl.setPointerCapture(event.pointerId);return;}
    const p=toWorld(event.clientX,event.clientY);marquee={sx:event.clientX,sy:event.clientY,x0:p.x,y0:p.y,add:event.shiftKey,moved:false,rect:null,box:null};canvasEl.setPointerCapture(event.pointerId);});
  function pHitIds(b){return Object.entries(providerPos()).filter(([,p])=>p.x<b.x+b.w&&p.x+PW>b.x&&p.y<b.y+b.h&&p.y+p.h>b.y).map(([id])=>id);}
  function hitIds(b){const pos=positions(canvasNodes());return Object.entries(pos).filter(([,p])=>p.x<b.x+b.w&&p.x+NODE_W>b.x&&p.y<b.y+b.h&&p.y+p.h>b.y).map(([id])=>id);}
  canvasEl.addEventListener('pointermove',event=>{
    if(wire){wireMove(event);return;}
    if(pan){if(!pan.moved&&Math.abs(event.clientX-pan.sx)+Math.abs(event.clientY-pan.sy)<4)return;if(!pan.moved){pan.moved=true;stageEl.classList.add('tc-panning');}view.x=pan.ox+event.clientX-pan.sx;view.y=pan.oy+event.clientY-pan.sy;applyView();return;}
    if(!marquee)return;if(!marquee.moved&&Math.abs(event.clientX-marquee.sx)+Math.abs(event.clientY-marquee.sy)<4)return;marquee.moved=true;
    const p=toWorld(event.clientX,event.clientY),box={x:Math.min(p.x,marquee.x0),y:Math.min(p.y,marquee.y0),w:Math.abs(p.x-marquee.x0),h:Math.abs(p.y-marquee.y0)};marquee.box=box;
    if(!marquee.rect){marquee.rect=svg('rect',{class:'tc-marquee'});$('tc-world').append(marquee.rect);}for(const k of ['x','y','w','h'])marquee.rect.setAttribute(k==='w'?'width':k==='h'?'height':k,String(box[k]));
    const hit=new Set(hitIds(box));for(const g of $('tc-nodes').querySelectorAll('.tc-node'))g.classList.toggle('marquee-hit',hit.has(g.dataset.id)&&g.dataset.id!==linkFrom);const ph=new Set(linkMode?[]:pHitIds(box));for(const g of $('tc-pnodes')?.querySelectorAll('.tc-pnode')||[])g.classList.toggle('marquee-hit',ph.has(g.dataset.pid));});
  function endPointer(){
    if(wire){wireEnd();return;}
    if(pan){const pn=pan;pan=null;stageEl.classList.remove('tc-panning');saveView();if(pn.click&&!pn.moved&&(selectedEdge||selection.size)){selectedEdge=null;selection.clear();updateHint();drawCanvas();}return;}
    if(!marquee)return;const m=marquee;marquee=null;m.rect?.remove();
    if(!m.moved){if(selectedEdge||selection.size){selectedEdge=null;selection.clear();updateHint();drawCanvas();}return;}
    const ids=hitIds(m.box);
    if(linkMode){if(linkFrom)commitLinks([...pendingLinks,...ids]);else if(ids.length===1){linkFrom=ids[0];updateHint();drawCanvas();}else{notice(linkMode==='manage'?'先单击选中上级，再框选下级':'先单击选中一位成员，再框选要协作的成员');drawCanvas();}return;}
    const all=[...ids,...pHitIds(m.box)];selection=m.add?new Set([...selection,...all]):new Set(all);selectedEdge=null;updateHint();drawCanvas();}
  canvasEl.addEventListener('pointerup',endPointer);canvasEl.addEventListener('pointercancel',endPointer);
  const typing=t=>t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');
  document.addEventListener('keydown',event=>{if(page!=='canvas'||typing(event.target))return;
    if(event.key==='Escape'&&wire){event.preventDefault();wireCancel();drawCanvas();updateHint();return;}
    if((event.key==='Delete'||event.key==='Backspace')&&!linkMode&&!wire){if(selectedEdge){event.preventDefault();const [from,to]=selectedEdge.split('>');selectedEdge=null;delEdgeRec(from,to).then(()=>{updateHint();drawCanvas();}).catch(()=>{});return;}}
    if((event.ctrlKey||event.metaKey)&&!event.altKey){const k=event.key.toLowerCase();if(k==='z'&&!event.shiftKey){event.preventDefault();undoStep(true);return;}if(k==='y'||(k==='z'&&event.shiftKey)){event.preventDefault();undoStep(false);return;}}
    if(event.key==='.'&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();animView(fitView);return;}
    if(event.code==='Space'){event.preventDefault();if(!spaceDown){spaceDown=true;stageEl.classList.add('tc-pan-ready');}return;}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'&&!linkMode){event.preventDefault();selection=new Set([...canvasNodes().map(m=>m.id),...Object.keys(providersOf())]);selectedEdge=null;updateHint();drawCanvas();}});
  document.addEventListener('keyup',event=>{
    if(event.code==='Space'){spaceDown=false;stageEl.classList.remove('tc-pan-ready');if(page==='canvas'&&!typing(event.target))event.preventDefault();}
    if((event.key==='Control'||event.key==='Meta')&&linkMode&&linkFrom&&pendingLinks.size)commitLinks([...pendingLinks]);
    if(event.key==='Alt'&&altZoomed){event.preventDefault();altZoomed=false;}});
  window.addEventListener('blur',()=>{spaceDown=false;stageEl.classList.remove('tc-pan-ready');});
  async function autoArrange(){const list=canvasNodes();if(!list.length)return;const cur=positions(list),old=Object.fromEntries(Object.entries(cur).map(([id,p])=>[id,{x:p.x,y:p.y}])),pos=autoLayout(list);localPos={};try{await act('teamLayout',{nodes:pos});record('自动排列',()=>setLayout(old),()=>setLayout(pos));fitView();}catch{}}
  window.addEventListener('resize',()=>{if(data&&!drag)drawCanvas();});
  // canvas-toolbar-edit: 右下角工具栏（缩放 −/%/+、适应；自动排列、居中在下面 canvas-console 部分接上；预设在同一条里）
  const stageMid=()=>{const r=canvasEl.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];};
  $('cv-zoom-in').onclick=()=>animView(()=>zoomAt(view.k*1.2,...stageMid()));$('cv-zoom-out').onclick=()=>animView(()=>zoomAt(view.k/1.2,...stageMid()));$('cv-zoom-pct').onclick=()=>animView(()=>zoomAt(1,...stageMid()));$('cv-fit').onclick=()=>animView(fitView);

  // ---------- single-canvas：成员节点与在线 AI 同一张画布（同一个平移/缩放），供下面的 canvas-console 部分使用 ----------
  var canvasHooks={needFit:false,aiRects:()=>[],memberChanged(){if(canvasHooks.needFit&&page==='canvas'&&stageEl.clientWidth&&(canvasMembers().length||aiRects().length)){canvasHooks.needFit=false;fitView();}}};
  function aiRects(){let out=[];try{out=canvasHooks.aiRects()||[];}catch{}/* collab-ports: 接口节点也参与适应画布 / 找空位 */try{out=[...out,...Object.values(providerPos()).map(p=>({x:p.x,y:p.y,w:PW,h:p.h}))];}catch{}return out;}
  window.__ocCanvas={
    view:()=>view,
    ready:()=>!!data&&data.collaborationEnabled===true,
    ws:()=>data?.workspaceId||'',
    setAiRects(fn){canvasHooks.aiRects=fn;},
    aiChanged(){renderMini();canvasHooks.memberChanged();},
    // 成员节点在画布坐标里的位置（在线 AI 的连线、侧栏定位用）
    memberBox(id){const ps=positions(canvasNodes()),p=ps[id]||ps[Object.keys(ps).find(k=>baseOf(k)===id)];return p?{x:p.x,y:p.y,w:NODE_W,h:p.h}:null;},
    memberBounds(){const ps=Object.values(positions(canvasNodes()));if(!ps.length)return null;return {x1:Math.min(...ps.map(p=>p.x)),y1:Math.min(...ps.map(p=>p.y)),x2:Math.max(...ps.map(p=>p.x+NODE_W)),y2:Math.max(...ps.map(p=>p.y+p.h))};},
    centerOn(x,y){view.x=stageEl.clientWidth/2-x*view.k;view.y=stageEl.clientHeight/2-y*view.k;applyView();saveView();},
    selectMember(id){if(!onCanvas(id))return false;selection=new Set([id]);selectedEdge=null;drawCanvas();const b=window.__ocCanvas.memberBox(id);if(b)window.__ocCanvas.centerOn(b.x+b.w/2,b.y+b.h/2);return true;},
    fit:()=>fitView(),
    autoArrange:()=>autoArrange(),
    focusMember(){const id=[...selection].find(onCanvas);const b=id&&window.__ocCanvas.memberBox(id);if(!b)return false;window.__ocCanvas.centerOn(b.x+b.w/2,b.y+b.h/2);return true;},
    closeMenus:()=>closeMenus(),
    animView:(fn)=>animView(fn),
    makeEnter:(cls)=>makeEnter(cls)
  };

  // ---------- canvas-toolbar-edit：节点内编辑（改名 / 岗位 / 模型 / 启用 / 子代理）----------
  // 编辑框在画布上方的 HTML 层（跟着平移缩放），状态每 3 秒推送重画节点也不会动它；保存走成员页同一个 saveEmployee（带 expected_version）/ teamMemberSettings；
  // 已保存但推送还没带回来的改动先叠在成员上（wEdits），旧推送不会把节点闪回旧值。
  var wLayer=null,wEdit=null,wPop=null,titleClick={id:null,at:0},wEdits={};
  function ensureWLayer(){if(wLayer&&wLayer.isConnected)return wLayer;wLayer=el('div',null,'tc-wlayer');wLayer.id='tc-wlayer';stageEl.append(wLayer);wLayer.style.transform=`translate(${view.x}px, ${view.y}px) scale(${view.k})`;return wLayer;}
  const wKeys=['name','roleId','model','enabled'];
  function applyEdits(){for(const [id,e] of Object.entries(wEdits)){const m=members().find(x=>x.id===id);if(!m){delete wEdits[id];continue;}
      const same=Object.keys(e.patch).every(k=>JSON.stringify(m[k])===JSON.stringify(e.patch[k]));
      if(same&&(m.version||0)>=(e.version||0)||Date.now()-e.at>15000){delete wEdits[id];continue;}
      Object.assign(m,e.patch);if((e.version||0)>(m.version||0))m.version=e.version;}}
  async function putMember(id,patch){id=baseOf(id);const m=members().find(x=>x.id===id);if(!m)throw Error('成员不存在。');const next={...m,...patch};
    const body={id,expected_version:m.version,name:String(next.name||'').trim(),kind:next.kind,roleId:next.roleId,model:next.kind==='api'?next.model||null:null,allowedPaths:Array.isArray(next.allowedPaths)&&next.allowedPaths.length?next.allowedPaths:['.'],allowShell:next.allowShell===true,canManage:next.canManage===true,enabled:next.enabled!==false,...customOf(next)};
    if(!body.name)throw Error('名字不能为空。');
    const before=Object.fromEntries(Object.keys(patch).map(k=>[k,m[k]]));Object.assign(m,patch);wEdits[id]={patch:{...(wEdits[id]?.patch||{}),...patch},at:Date.now(),version:0};drawCanvas();drawMembers();
    try{const saved=await act('saveEmployee',body);const v=saved?.version||((m.version||0)+1);if(wEdits[id])wEdits[id].version=v;m.version=Math.max(m.version||0,v);return before;}
    catch(error){if(wEdits[id]){for(const k of Object.keys(patch))delete wEdits[id].patch[k];if(!Object.keys(wEdits[id].patch).length)delete wEdits[id];}Object.assign(m,before);lastCanvasSig='';drawCanvas();drawMembers();throw error;}}
  async function saveMemberRec(id,patch,label){id=baseOf(id);const m=members().find(x=>x.id===id);if(!m)return;if(Object.keys(patch).every(k=>JSON.stringify(m[k])===JSON.stringify(patch[k])))return;
    try{const before=await putMember(id,patch);record(label,()=>putMember(id,before),()=>putMember(id,patch));}catch{}}
  async function putSub(id,allow){id=baseOf(id);const st=team().settings?.[id]||{},old=st.allowSubagents===true;await act('teamMemberSettings',{memberId:id,allowSubagents:allow,maxSubagents:Number(st.maxSubagents)||3});if(data.team){data.team.settings={...(data.team.settings||{}),[id]:{...st,allowSubagents:allow}};}drawCanvas();return old;}
  async function saveSubRec(id,allow){id=baseOf(id);try{const old=await putSub(id,allow);record(allow?'允许子代理':'关闭子代理',()=>putSub(id,old),()=>putSub(id,allow));}catch{}}
  // ---------- member-custom：同一套字段，成员页一节 + 画布「更多」浮动面板；保存都走 saveEmployee（完整成员 + expected_version）----------
  const EFFORT_LABEL={minimal:'极低',low:'低',medium:'中',high:'高',xhigh:'很高',max:'最高',disabled:'关闭思考'};
  const mcat=()=>data?.memberCatalog||{tools:[{id:'read',label:'读取文件'},{id:'write',label:'写入文件'},{id:'command',label:'运行命令'},{id:'browser',label:'浏览器 / 屏幕查看'}],mcpServers:[],confirm:[{id:'command',label:'运行命令'},{id:'delete',label:'删除文件'},{id:'write',label:'任何文件写入'},{id:'mcp',label:'调用 MCP 工具'}],efforts:['minimal','low','medium','high','xhigh','max','disabled']};
  function customEditor(m,opts={}){
    const root=el('div',null,'tc-cust'),cat=mcat();
    const sec=(title,key)=>{const d=el('details',null,'tc-more tc-cust-sec');d.dataset.sec=key;d.open=opts.open!==false;d.append(el('summary',title));root.append(d);return d;};
    const field=(parent,label,input,key)=>{const l=el('label',null,'tc-field');l.append(el('span',label),input);input.dataset.k=key;parent.append(l);return input;};
    const area=(ph,val,rows)=>{const t=el('textarea');t.rows=rows||3;t.placeholder=ph;t.value=val||'';t.maxLength=4000;t.spellcheck=false;return t;};
    const checks=(parent,title,key)=>{const box=el('div',null,'tc-cust-checks');box.dataset.k=key;parent.append(el('div',title,'tc-cust-h'),box);return box;};
    const check=(parent,id,label,on,title)=>{const l=el('label',null,'tc-check');const c=el('input');c.type='checkbox';c.value=id;c.checked=!!on;l.append(c,el('span',label));if(title)l.title=title;parent.append(l);return c;};
    const s1=sec('个人设定','prompt');
    const goal=field(s1,'目标',area('交付物与验收标准',m?.goal),'goal');
    const back=field(s1,'背景 / 专长',area('技术栈、风格、禁忌',m?.backstory),'backstory');
    const s2=sec('工具与权限','tools');
    const restricted=Array.isArray(m?.tools),tl=checks(s2,'可用工具','tools'),toolBoxes=[];
    for(const t of cat.tools)toolBoxes.push(check(tl,t.id,t.label,restricted?m.tools.includes(t.id):true,t.hint));
    const servers=[...(cat.mcpServers||[]).map(x=>x.id)];if(restricted)for(const t of m.tools)if(t.startsWith('mcp:')&&!servers.includes(t.slice(4)))servers.push(t.slice(4));
    for(const id of servers)toolBoxes.push(check(tl,'mcp:'+id,'MCP · '+id,restricted&&m.tools.includes('mcp:'+id),'该 MCP 服务器的工具（仍受岗位白名单限制）'));
    const scope=field(s2,'可写范围',area('整个项目',(m?.writeScope||[]).join('\n'),2),'writeScope');
    const cl=checks(s2,'需要我确认','confirm'),confBoxes=cat.confirm.map(c=>check(cl,c.id,c.label,(m?.confirm||[]).includes(c.id)));
    const s3=sec('模型参数','model');
    const eff=el('select');eff.append(new Option('默认',''));for(const e of cat.efforts)eff.append(new Option(EFFORT_LABEL[e]||e,e));eff.value=m?.reasoningEffort||'';field(s3,'推理强度',eff,'reasoningEffort');
    const num=(min,max,step,val)=>{const i=el('input');i.type='number';i.min=String(min);i.max=String(max);i.step=String(step);i.placeholder='默认';i.value=val??'';return i;};
    const temp=field(s3,'温度',num(0,2,0.1,m?.temperature),'temperature');
    const mot=field(s3,'最大输出 token',num(1,1000000,1,m?.maxOutputTokens),'maxOutputTokens');
    const fb=el('select');fb.append(new Option('无',''));for(const x of catalogModels())fb.append(new Option(`${x.name||x.id} · ${modelGroup(x)}`,modelValue(x)));const cur=modelValue(m?.fallbackModel);if(cur&&![...fb.options].some(o=>o.value===cur))fb.append(new Option((m.fallbackModel.id||'')+'（不可用）',cur));fb.value=cur;field(s3,'备用模型',fb,'fallbackModel');
    if(opts.open===false){s1.open=!!(m?.goal||m?.backstory);s2.open=!!(m?.tools||m?.writeScope||m?.confirm);s3.open=!!(m?.reasoningEffort||m?.temperature!=null||m?.maxOutputTokens!=null||m?.fallbackModel);}
    const setKind=kind=>{s3.hidden=kind==='mcp';};setKind(m?.kind||'api');
    return {root,setKind,read(){
      const t=temp.value.trim()===''?null:Number(temp.value);if(t!==null&&!(t>=0&&t<=2))throw Error('温度必须在 0–2 之间。');
      const n=mot.value.trim()===''?null:Number(mot.value);if(n!==null&&!(Number.isInteger(n)&&n>=1&&n<=1e6))throw Error('最大输出 token 必须是 1–1000000 的整数。');
      const on=toolBoxes.filter(b=>b.checked).map(b=>b.value),tools=cat.tools.every(x=>on.includes(x.id))&&!on.some(v=>v.startsWith('mcp:'))?null:on;
      const ws=scope.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),conf=confBoxes.filter(b=>b.checked).map(b=>b.value);
      let fallbackModel=null;if(fb.value){try{fallbackModel=JSON.parse(fb.value);}catch{}}
      return {goal:goal.value.trim()||null,backstory:back.value.trim()||null,tools,writeScope:ws.length?ws:null,confirm:conf.length?conf:null,reasoningEffort:eff.value||null,temperature:t,maxOutputTokens:n,fallbackModel};}};}
  var morePanel=null;
  function closeMorePanel(){if(!morePanel)return;const id=morePanel.id;morePanel.box.remove();morePanel=null;document.querySelector(`#tc-nodes [data-id="${CSS.escape(id)}"] .tc-wmore`)?.classList.remove('open');}
  function placeMorePanel(){if(!morePanel)return;const box=morePanel.box,n=document.querySelector(`#tc-nodes [data-id="${CSS.escape(morePanel.id)}"]`),r=n?n.getBoundingClientRect():{left:80,right:80,top:80},w=box.offsetWidth||340,h=Math.min(560,innerHeight-16);
    let left=r.right+10;if(left+w>innerWidth-8)left=Math.max(8,r.left-w-10);box.style.left=Math.round(left)+'px';box.style.maxHeight=h+'px';box.style.top=Math.round(Math.max(8,Math.min(r.top,innerHeight-8-Math.min(h,box.offsetHeight||h))))+'px';}
  function openMorePanel(id){closeWidgetEdit(true);closeWidgetPop();if(morePanel&&morePanel.id===id){closeMorePanel();return;}closeMorePanel();closeMenus();const m=members().find(x=>x.id===baseOf(id));if(!m||m.temporary)return;
    const ed=customEditor(m),box=el('div',null,'tc-morepanel tc-wedit');box.dataset.id=id;box.setAttribute('role','dialog');box.setAttribute('aria-label','更多设置');
    const head=el('div',null,'tc-morepanel-head'),title=el('span','更多设置 · '+m.name,'tc-morepanel-title'),x=el('button','✕','tc-icon-btn');x.type='button';x.title='关闭';x.setAttribute('aria-label','关闭');x.onclick=()=>closeMorePanel();head.append(title,x);
    const body=el('div',null,'tc-morepanel-body');body.append(ed.root);
    const foot=el('div',null,'tc-morepanel-foot'),err=el('span','','tc-morepanel-err'),cancel=el('button','取消','tc-ghost'),save=el('button','保存','tc-primary');cancel.type='button';save.type='button';cancel.onclick=()=>closeMorePanel();
    save.onclick=async()=>{err.textContent='';let patch;try{patch=ed.read();}catch(e){err.textContent=e.message;return;}const cur=members().find(y=>y.id===baseOf(id));if(!cur){closeMorePanel();return;}
      if(Object.keys(patch).every(k=>JSON.stringify(cur[k]??null)===JSON.stringify(patch[k]))){closeMorePanel();return;}
      save.disabled=true;try{const before=await putMember(id,patch);record('更多设置',()=>putMember(id,before),()=>putMember(id,patch));closeMorePanel();}catch(e){err.textContent=e.message;}finally{save.disabled=false;}};
    foot.append(err,el('span',null,'tc-grow'),cancel,save);box.append(head,body,foot);
    for(const t of ['pointerdown','mousedown','click','dblclick','contextmenu','wheel'])box.addEventListener(t,ev=>ev.stopPropagation());
    box.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='Escape'){ev.preventDefault();closeMorePanel();}else if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();save.click();}});box.addEventListener('keyup',ev=>ev.stopPropagation());
    document.body.append(box);morePanel={id,box,editor:ed};placeMorePanel();document.querySelector(`#tc-nodes [data-id="${CSS.escape(id)}"] .tc-wmore`)?.classList.add('open');setTimeout(()=>ed.root.querySelector('textarea')?.focus(),0);}
  function closeWidgetEdit(commit){const e=wEdit;if(!e)return;wEdit=null;const v=e.input.value.trim();e.box.remove();if(commit&&v&&v!==e.old)saveMemberRec(e.id,{name:v},'改名');}
  function startRename(id){closeWidgetEdit(true);closeWidgetPop();const m=members().find(x=>x.id===baseOf(id)),p=positions(canvasNodes())[id];if(!m||!p||m.temporary)return;
    const box=el('div',null,'tc-wedit tc-wedit-name'),input=el('input');input.type='text';input.value=m.name;input.maxLength=40;input.setAttribute('aria-label','成员名字');input.spellcheck=false;box.append(input);
    box.style.left=(p.x+22)+'px';box.style.top=(p.y+3)+'px';box.style.width=(NODE_W-22-8)+'px';box.style.height=(TITLE_H-6)+'px';
    for(const t of ['pointerdown','mousedown','dblclick','click','contextmenu'])box.addEventListener(t,ev=>ev.stopPropagation());
    input.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='Enter'){ev.preventDefault();closeWidgetEdit(true);}else if(ev.key==='Escape'){ev.preventDefault();closeWidgetEdit(false);}});
    input.addEventListener('keyup',ev=>ev.stopPropagation());input.addEventListener('blur',()=>{if(wEdit&&wEdit.input===input)closeWidgetEdit(true);});
    ensureWLayer().append(box);wEdit={id,input,box,old:m.name};input.focus();input.select();}
  function closeWidgetPop(){if(wPop){wPop.box.remove();wPop=null;}}
  function openWidgetPop(id,kind,anchor){closeWidgetEdit(true);if(wPop&&wPop.id===id&&wPop.kind===kind){closeWidgetPop();return;}closeWidgetPop();closeMenus();const m=members().find(x=>x.id===baseOf(id));if(!m)return;
    if(kind==='model'&&!catalogModels().length){notice('没有可用模型，请先在对话框的模型下拉里「配置供应商」。',true);return;}
    const box=el('div',null,'tc-wpop tc-wedit');box.setAttribute('role','listbox');box.dataset.kind=kind;box.dataset.id=id;box.tabIndex=-1;
    for(const t of ['pointerdown','mousedown','dblclick','click','contextmenu','wheel'])box.addEventListener(t,ev=>ev.stopPropagation());
    const list=el('div',null,'tc-wpop-list');let q=null,rows=[],focus=0;
    const pick=v=>{closeWidgetPop();if(kind==='role')saveMemberRec(id,{roleId:v},'换岗位');else{let ref=null;try{ref=JSON.parse(v);}catch{}if(ref)saveMemberRec(id,{model:ref},'换模型');}};
    const focusRow=(i,reveal)=>{if(!rows.length)return;focus=Math.max(0,Math.min(rows.length-1,i));rows.forEach((r,k)=>r.classList.toggle('focused',k===focus));if(reveal)rows[focus].scrollIntoView({block:'nearest'});};
    const row=(value,text,sel,title)=>{const r=el('div',null,'tc-wpop-row'+(sel?' selected':''));r.setAttribute('role','option');r.setAttribute('aria-selected',String(sel));r.dataset.value=value;if(title)r.title=title;r.append(el('span',sel?'✓':'','tc-wpop-check'),el('span',text,'tc-wpop-name'));r.onclick=()=>pick(value);r.onmousemove=()=>focusRow(rows.indexOf(r),false);list.append(r);rows.push(r);if(sel)focus=rows.length-1;};
    const draw=()=>{list.replaceChildren();rows=[];focus=0;
      if(kind==='role'){for(const r of data.roles||[])if(r.id!=='observer')row(r.id,r.name,r.id===m.roleId);}
      else{const cur=modelValue(m.model),qq=(q?.value||'').trim().toLowerCase(),groups=new Map();for(const x of catalogModels()){if(qq&&![x.name,x.id,modelGroup(x)].some(t=>String(t||'').toLowerCase().includes(qq)))continue;const g=modelGroup(x);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(x);}
        if(!groups.size)list.append(el('div','没有匹配的模型','tc-wpop-empty'));for(const [g,xs] of groups){list.append(el('div',g,'tc-wpop-h'));for(const x of xs)row(modelValue(x),x.name||x.id,modelValue(x)===cur,`${x.name||x.id} · ${g}\n${x.id}`);}}
      focusRow(focus,true);};
    box.append(el('div',kind==='role'?'岗位':'模型','tc-wpop-head'));
    if(kind==='model'){q=el('input');q.type='search';q.placeholder='搜索模型';q.className='tc-wpop-search';q.spellcheck=false;q.addEventListener('input',draw);box.append(q);}
    box.append(list);
    box.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='ArrowDown'){ev.preventDefault();focusRow(focus+1,true);}else if(ev.key==='ArrowUp'){ev.preventDefault();focusRow(focus-1,true);}else if(ev.key==='Enter'){ev.preventDefault();rows[focus]?.click();}else if(ev.key==='Escape'||ev.key==='Tab'){ev.preventDefault();closeWidgetPop();}});
    box.addEventListener('keyup',ev=>ev.stopPropagation());
    document.body.append(box);wPop={id,kind,box};draw();
    const r=anchor.getBoundingClientRect(),w=Math.max(200,r.width);box.style.minWidth=w+'px';const h=box.offsetHeight;box.style.left=Math.max(4,Math.min(r.left,innerWidth-box.offsetWidth-4))+'px';box.style.top=(r.bottom+4+h<=innerHeight-4?r.bottom+4:Math.max(4,r.top-4-h))+'px';
    (q||box).focus();}
  document.addEventListener('pointerdown',event=>{if(wPop&&!wPop.provider&&!wPop.box.contains(event.target)&&!event.target.closest?.(`.tc-node[data-id="${CSS.escape(wPop.id)}"] .tc-widget[data-w="${wPop.kind}"]`))closeWidgetPop();},true);
  window.addEventListener('blur',()=>closeWidgetPop());

  // ---------- 撤销 / 重做 ----------
  var hist={undo:[],redo:[]},replaying=false;
  function record(label,undo,redo){if(replaying)return;hist.undo.push({label,undo,redo});if(hist.undo.length>100)hist.undo.shift();hist.redo.length=0;}
  function mergeLast(n,label){if(hist.undo.length<n)return;const ops=hist.undo.splice(-n);hist.undo.push({label,undo:async()=>{for(const o of [...ops].reverse())await o.undo();},redo:async()=>{for(const o of ops)await o.redo();}});}
  async function undoStep(back){const from=back?hist.undo:hist.redo,op=from.pop();if(!op)return;replaying=true;try{await (back?op.undo:op.redo)();(back?hist.redo:hist.undo).push(op);}catch(error){notice(error.message,true);}finally{replaying=false;}drawCanvas();updateHint();drawMembers();}
  async function setLayout(nodes){for(const [id,p] of Object.entries(nodes))localPos[id]={x:p.x,y:p.y};drawCanvas();await saveLayoutMixed(nodes);}
  /** 成员走 teamLayout，接口节点走 portProviderMove（框选后一起拖用）。 */
  async function saveLayoutMixed(nodes){const pv=providersOf(),mem={},pro={};for(const [id,p] of Object.entries(nodes))(pv[id]?pro:mem)[id]=p;if(Object.keys(mem).length)await api('teamLayout',{nodes:mem});if(Object.keys(pro).length)await api('portProviderMove',{nodes:pro});}
  const anyNodeEl=id=>$('tc-nodes')?.querySelector(`[data-id="${CSS.escape(id)}"]`)||$('tc-pnodes')?.querySelector(`[data-pid="${CSS.escape(id)}"]`);
  const edgeTypeOf=(from,to)=>nodeEdges().find(e=>e.from===from&&e.to===to)?.type;
  async function addEdgeRec(from,to,type){const ok=await connectEdge(from,to,type);if(ok)record('连线',()=>api('teamEdge',{from,to,type:'none'}),()=>api('teamEdges',{from,to:[to],type}));return ok;}
  async function delEdgeRec(from,to){const type=edgeTypeOf(from,to);await act('teamEdge',{from,to,type:'none'});if(type)record('删除连线',()=>api('teamEdges',{from,to:[to],type}),()=>api('teamEdge',{from,to,type:'none'}));}

  // ---------- 右键菜单 ----------
  var menuEl=null;
  function closeMenus(){let closed=false;if(wPop){closeWidgetPop();closed=true;}if(menuEl){menuEl.remove();menuEl=null;closed=true;}if(searchEl){searchEl.remove();searchEl=null;search=null;closed=true;}return closed;}
  function showMenu(cx,cy,items){closeMenus();const box=el('div',null,'tc-cmenu');box.setAttribute('role','menu');
    for(const it of items){if(it==='-'){box.append(el('div',null,'tc-cmenu-sep'));continue;}if(it.head){box.append(el('div',it.head,'tc-cmenu-head'));continue;}
      const b=menuItem(it);
      if(it.sub){b.classList.add('has-sub');b.setAttribute('aria-haspopup','menu');b.append(el('span','▸','tc-cmenu-arrow'));const open=()=>openSubMenu(box,b,it.sub());b.addEventListener('mouseenter',open);b.onclick=e=>{e.stopPropagation();open();};b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();open();box.querySelector('.tc-cmenu-sub .tc-cmenu-item:not(:disabled)')?.focus();}});}
      else b.addEventListener('mouseenter',()=>box.querySelector('.tc-cmenu-sub')?.remove());
      box.append(b);}
    box.addEventListener('pointerdown',e=>e.stopPropagation());box.addEventListener('contextmenu',e=>e.preventDefault());
    document.body.append(box);menuEl=box;placePop(box,cx,cy);box.querySelector('.tc-cmenu-item:not(:disabled)')?.focus();}
  function menuItem(it){const b=el('button',null,'tc-cmenu-item'+(it.danger?' danger':''));b.type='button';b.setAttribute('role','menuitem');b.disabled=!!it.disabled;
    if(it.color){const d=el('span',null,'tc-cmenu-dot');d.style.background=it.color;b.append(d);}b.append(el('span',it.label,'tc-cmenu-label'));if(it.key)b.append(el('span',it.key,'tc-cmenu-key'));
    b.addEventListener('pointerdown',e=>e.stopPropagation());if(it.run)b.onclick=e=>{e.stopPropagation();closeMenus();it.run();};return b;}
  // 二级菜单（仿 ComfyUI 的「Add Node ▸」）：挂在主菜单里，主菜单关掉它也跟着关
  function openSubMenu(box,anchor,items){if(box.querySelector('.tc-cmenu-sub')?.dataset.for===anchor.textContent)return;box.querySelector('.tc-cmenu-sub')?.remove();for(const x of box.querySelectorAll('.tc-cmenu-item.open'))x.classList.remove('open');anchor.classList.add('open');
    const sub=el('div',null,'tc-cmenu tc-cmenu-sub');sub.dataset.for=anchor.textContent;sub.setAttribute('role','menu');
    for(const it of items){if(it==='-'){sub.append(el('div',null,'tc-cmenu-sep'));continue;}sub.append(menuItem(it));}
    if(!items.length)sub.append(el('div','（空）','tc-cmenu-head'));
    sub.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='Escape'){e.preventDefault();e.stopPropagation();sub.remove();anchor.classList.remove('open');anchor.focus();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const bs=[...sub.querySelectorAll('.tc-cmenu-item:not(:disabled)')],i=bs.indexOf(document.activeElement);bs[(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length]?.focus();}});
    box.append(sub);const r=anchor.getBoundingClientRect(),w=sub.offsetWidth,h=sub.offsetHeight;let x=r.right+2;if(x+w>innerWidth-4)x=r.left-w-2;const y=Math.max(4,Math.min(r.top-5,innerHeight-h-4));x=Math.max(4,x);sub.style.left=x+'px';sub.style.top=y+'px';const rr=sub.getBoundingClientRect();if(Math.abs(rr.left-x)>1||Math.abs(rr.top-y)>1){sub.style.left=(2*x-rr.left)+'px';sub.style.top=(2*y-rr.top)+'px';}}
  function placePop(box,cx,cy){const w=box.offsetWidth,h=box.offsetHeight;box.style.left=Math.max(4,Math.min(cx,innerWidth-w-4))+'px';box.style.top=Math.max(4,Math.min(cy,innerHeight-h-4))+'px';}
  function canvasMenu(event){const at=toWorld(event.clientX,event.clientY),cx=event.clientX,cy=event.clientY;
    showMenu(cx,cy,[{label:'添加成员',sub:()=>[...members().map(m=>({label:m.name,key:roleName(m.roleId)+(onCanvas(m.id)?' · 已在画布':''),run:()=>{search={at,wire:null,index:0,rows:[]};placeFromSearch(m.id);}})),'-',{label:'新建成员…',run:()=>editMember(null,true)}]},{label:'添加节点',sub:()=>Object.entries(pcat().providers||{}).map(([type,p])=>({label:p.label,key:(pcat().ports?.[p.port]?.label||p.port)+' 接口',color:PORT_COLORS[p.port],run:()=>addProvider(type,{x:Math.round(at.x-PW/2),y:Math.round(at.y-PH/2)})}))},{label:'搜索成员或节点…',key:'双击',run:()=>openAddPop(cx,cy,at)},{label:selection.size?`为选中的 ${selection.size} 个节点建分组`:'新建分组',key:'Ctrl+G',run:()=>createGroup(at)},...(gClip?.items.length?[{label:`粘贴 ${gClip.items.length} 个节点`,key:'Ctrl+V',run:()=>{lastWorldPt=at;pasteClip(false);}},{label:'粘贴（连线一起）',key:'Ctrl+Shift+V',run:()=>{lastWorldPt=at;pasteClip(true);}}]:[]),'-',
      {label:'自动排列',run:()=>autoArrange(),disabled:!canvasMembers().length},{label:'适应画布',key:'.',run:fitView},{label:'全选',key:'Ctrl+A',run:()=>{selection=new Set([...canvasNodes().map(m=>m.id),...Object.keys(providersOf())]);selectedEdge=null;updateHint();drawCanvas();},disabled:!canvasMembers().length},'-',
      {label:'撤销'+(hist.undo.length?'：'+hist.undo[hist.undo.length-1].label:''),key:'Ctrl+Z',run:()=>undoStep(true),disabled:!hist.undo.length},{label:'重做'+(hist.redo.length?'：'+hist.redo[hist.redo.length-1].label:''),key:'Ctrl+Y',run:()=>undoStep(false),disabled:!hist.redo.length}]);}
  function nodeMenu(m,event){
    if(selection.has(m.id)&&selection.size>1){const ids=[...selection];showMenu(event.clientX,event.clientY,[{head:`已选 ${ids.length} 位成员`},{label:'断开它们之间的连线',run:()=>dropEdges(nodeEdges().filter(e=>ids.includes(e.from)&&ids.includes(e.to)))},{label:'为它们建分组',key:'Ctrl+G',run:()=>createGroup()},{label:ids.every(isCollapsed)?'全部展开':'全部折叠',key:'Alt+C',run:()=>toggleCollapse(ids)},{label:'跳过 / 恢复',key:'Ctrl+B',run:()=>toggleBypass(ids)},{label:'复制节点',key:'Ctrl+D',run:()=>duplicateNodes(ids)},{label:'移出画布',key:'Del',danger:true,run:()=>removeFromCanvas(ids)}]);return;}
    selection=new Set([m.id]);selectedEdge=null;updateHint();drawCanvas();
    const mine=nodeEdges().filter(e=>e.from===m.id||e.to===m.id),hasAv=!!avatarUrl(m.memberId);
    showMenu(event.clientX,event.clientY,[{head:m.name},{label:'编辑成员',key:'双击',run:()=>editMember(m),disabled:!!m.temporary},...(m.kind==='api'?[{label:'私聊',run:()=>openChat('dm:'+m.memberId)}]:[]),{label:'再放一个这个成员',run:()=>{const p=positions(canvasNodes())[m.id];addToCanvas(m.memberId,p?{x:p.x+36,y:p.y+36}:null);}},{label:'复制节点',key:'Ctrl+D',run:()=>duplicateNodes([m.id])},...(m.temporary?[]:[{label:hasAv?'更换头像…':'上传头像…',run:()=>pickAvatar(m.memberId)},...(hasAv?[{label:'去掉头像',run:()=>saveAvatarRec(m.memberId,null)}]:[])]),'-',
      {label:'断开所有连线',run:()=>dropEdges(mine),disabled:!mine.length},{label:isCollapsed(m.id)?'展开':'折叠',key:'Alt+C',run:()=>toggleCollapse([m.id])},{label:m.enabled?'跳过（停用）':'恢复（启用）',key:'Ctrl+B',run:()=>toggleBypass([m.id]),disabled:!!m.temporary},{label:nodeKeysOf(m.memberId).length>1?'删除这个节点':'移出画布',key:'Del',danger:true,run:()=>removeFromCanvas([m.id])}]);}
  function edgeMenu(edge,event){const key=edge.from+'>'+edge.to;selectedEdge=key;selection.clear();updateHint();drawCanvas();
    const items=[{head:edge.type==='manage'?`${memberName(edge.from)} → ${memberName(edge.to)}（管理）`:`${memberName(edge.from)} ⇄ ${memberName(edge.to)}（协作）`}];
    if(edge.type==='manage')items.push({label:'反转上下级',run:()=>flipEdge(edge)});
    items.push({label:'删除连线',key:'Del',danger:true,run:()=>{selectedEdge=null;delEdgeRec(edge.from,edge.to).then(()=>{updateHint();drawCanvas();}).catch(()=>{});}});
    showMenu(event.clientX,event.clientY,items);}
  async function dropEdges(list){list=list.map(e=>({...e}));if(!list.length)return;try{for(const e of list)await api('teamEdge',{from:e.from,to:e.to,type:'none'});record('断开连线',async()=>{for(const e of list)await api('teamEdges',{from:e.from,to:[e.to],type:e.type});},async()=>{for(const e of list)await api('teamEdge',{from:e.from,to:e.to,type:'none'});});}catch(error){notice(error.message,true);}drawCanvas();updateHint();}
  async function flipEdge(e){const {from,to}=e;try{await act('teamEdge',{from,to,type:'none'});if(!(await connectEdge(to,from,'manage'))){await api('teamEdges',{from,to:[to],type:'manage'});return;}record('反转上下级',async()=>{await api('teamEdge',{from:to,to:from,type:'none'});await api('teamEdges',{from,to:[to],type:'manage'});},async()=>{await api('teamEdge',{from,to,type:'none'});await api('teamEdges',{from:to,to:[from],type:'manage'});});}catch{}selectedEdge=null;drawCanvas();updateHint();}
  canvasEl.addEventListener('contextmenu',event=>{if(page!=='canvas')return;event.preventDefault();if(event.target.closest('.tc-node,.tc-edge-hit,.tc-edge-dot'))return;canvasMenu(event);});
  // ---------- collab-ports：接口节点 ----------
  // 成员节点平时只有上级/下级/协作口；把提供节点（人设 / 模型 / 权限 / 工具包 / 共享工作区 / 文档 / 规范 / 共享看板）或别的成员的「产物 / 结论」接上来，
  // 成员身上才多出对应的一行接口（左侧圆点），接上就覆盖（或并入）这一项。协作本身（派活、交付、审查、打回、上报、临时拉人、写看板、抢文件）由 AI 决定，
  // 画布只把它们按发生顺序演出来：光点沿线飞、临时协作是虚线、气泡写着这一步说了什么；「协作记录」能回放。
  const PW=224,PH=58,PROW=20,P_OUT_Y=36;
  const PORT_COLORS={persona:'#e0607e',model:'#4f8cff',perm:'#f0a030',tools:'#9b7bf2',workspace:'#22b8a6',knowledge:'#4cbb5e',rules:'#e07a3c',board:'#3fa7d6'};
  const EV_COLORS={dispatch:'#4f8cff',deliver:'#4cbb5e',review:'#9b7bf2',approve:'#4cbb5e',reject:'#e0607e',escalate:'#f0a030',message:'#8a94a6',adhoc:'#f0a030',board:'#3fa7d6',conflict:'#e0607e'};
  const EV_LABELS={dispatch:'派活',deliver:'交付',review:'审查',approve:'通过',reject:'打回',escalate:'上报',message:'点名',adhoc:'临时协作',board:'写看板',conflict:'抢文件'};
  const OUT_PORTS=[{out:'artifact',label:'产物',y:WID1+9},{out:'conclusion',label:'结论',y:WID2+9}];
  let selectedFeed=null,fwire=null,pDrag=null,provPanel=null,evSeen=null,evReplay=null;
  const pstate=()=>team().ports||{providers:{},feeds:[],board:{},events:[],ports:{},catalog:{ports:{},order:[],providers:{},outputs:{}}};
  const pcat=()=>pstate().catalog||{ports:{},order:[],providers:{},outputs:{}};
  const providersOf=()=>pstate().providers||{};
  const feedsOf=()=>pstate().feeds||[];
  /** 这个节点（成员 ID 或副本 key）身上要显示的接口行：按目录顺序，只列接了线的口。 */
  function portRows(id){const base=baseOf(id),order=pcat().order||[],have=new Set(feedsOf().filter(f=>baseOf(f.to)===base).map(f=>f.port));return order.filter(p=>have.has(p));}
  const portRowsH=id=>{const n=portRows(id).length;return n?n*PROW+6:0;};
  const rowY=(id,port)=>{const i=portRows(id).indexOf(port);return i<0?null:isCollapsed(id)?TITLE_H/2:NODE_H+2+i*PROW+PROW/2;};
  function feedLabel(f){const p=providersOf()[f.from];if(p)return p.name;return memberName(baseOf(f.from))+'的'+(f.out==='conclusion'?'结论':'产物');}
  function providerSummary(p){const c=p.config||{};switch(p.type){case 'persona':return c.goal?cut(c.goal,22):c.backstory?cut(c.backstory,22):'还没写目标 / 背景';case 'model':return c.model?modelName(c.model)+(c.temperature!=null?' · 温度 '+c.temperature:''):'还没选模型';case 'perm':return (c.writeScope?.length?'只写 '+c.writeScope.join('、'):'整个项目')+(c.confirm?.length?' · 需确认 '+c.confirm.length+' 项':'');case 'tools':return c.tools?.length?c.tools.map(t=>t.startsWith('mcp:')?t.slice(4):({read:'读',write:'写',command:'命令',browser:'浏览器'}[t]||t)).join('、'):'还没选工具';case 'workspace':return c.dir&&c.dir!=='.'?c.dir:'项目根目录';case 'doc':return c.text?cut(c.text,22):c.paths?.length?c.paths.length+' 个文件':'空文档';case 'rules':return c.text?cut(c.text,22):'还没写规范';case 'board':{const n=(pstate().board?.[Object.keys(providersOf()).find(k=>providersOf()[k]===p)]||[]).length;return (c.topic?cut(c.topic,12)+' · ':'')+n+' 条';}default:return '';}}
  function providerPos(){const out={};for(const [id,p] of Object.entries(providersOf())){const l=localPos[id];out[id]={x:l?l.x:p.x,y:l?l.y:p.y,h:pHeight(id,p)};}return out;}
  /** 一根接口线的两端（世界坐标）。 */
  function feedEnds(f,pos,ppos){const to=pos[f.to]||pos[baseOf(f.to)];if(!to)return null;const ry=rowY(f.to in pos?f.to:baseOf(f.to),f.port);if(ry==null)return null;const b={x:to.x,y:to.y+ry};
    if(providersOf()[f.from]){const p=ppos[f.from];if(!p)return null;return {a:{x:p.x+PW,y:p.y+(isCollapsed(f.from)?12:P_OUT_Y)},b};}
    const src=pos[f.from]||pos[baseOf(f.from)];if(!src)return null;const op=OUT_PORTS.find(o=>o.out===f.out)||OUT_PORTS[0];return {a:{x:src.x+NODE_W,y:src.y+op.y},b};}
  function drawPortRows(g,m){const rows=portRows(m.id);if(!rows.length)return;const ports=pcat().ports||{},mine=feedsOf().filter(f=>baseOf(f.to)===m.memberId);
    g.append(svg('line',{x1:8,y1:NODE_H-2,x2:NODE_W-8,y2:NODE_H-2,class:'tc-prow-sep'}));
    rows.forEach((port,i)=>{const y=NODE_H+2+i*PROW,fs=mine.filter(f=>f.port===port),sel=fs.some(f=>f.id===selectedFeed),rg=svg('g',{class:'tc-prow'+(sel?' selected':''),transform:`translate(0,${y})`,'data-port':port});rg.style.setProperty('--port-color',PORT_COLORS[port]||'#888');
      rg.append(svg('rect',{x:6,y:1,width:NODE_W-12,height:PROW-2,rx:6,class:'tc-prow-box'}),svg('circle',{cx:0,cy:PROW/2,r:PORT_R,class:'tc-prow-dot'}));
      const l=svg('text',{x:14,y:PROW/2+4,class:'tc-prow-label'});l.textContent=ports[port]?.label||port;const list=ports[port]?.kind==='list',mode=list&&fs.some(f=>f.mode==='override')?'覆盖':list?'合并':'覆盖';
      const v=svg('text',{x:NODE_W-12,y:PROW/2+4,class:'tc-prow-value','text-anchor':'end'});v.textContent=fit('← '+fs.map(feedLabel).join('、')+(fs.length?' · '+mode:''),NODE_W-70,11);
      const t=svg('title');t.textContent=`${ports[port]?.label||port}：${ports[port]?.hint||''}\n由 ${fs.map(feedLabel).join('、')} 提供（${mode}）\n点一下选中这根线，Delete 断开；右键可切换覆盖 / 合并`;rg.append(l,v,t);
      rg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.stopPropagation();});
      rg.addEventListener('click',event=>{event.stopPropagation();selectFeed(selectedFeed===fs[0]?.id?null:fs[0]?.id);});
      rg.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();feedMenu(fs[0],event,fs);});
      g.append(rg);});}
  function drawOutPorts(g,m){if(m.temporary)return;for(const o of OUT_PORTS){const linked=feedsOf().some(f=>baseOf(f.from)===m.memberId&&f.out===o.out),pg=svg('g',{class:'tc-port tc-oport'+(linked?' linked':'')+(fwire&&fwire.from===m.id&&fwire.out===o.out?' active':''),transform:`translate(${NODE_W},${o.y})`,'data-out':o.out});
      pg.append(svg('circle',{r:9,class:'tc-port-hit'}),svg('rect',{x:-4,y:-4,width:8,height:8,transform:'rotate(45)',class:'tc-port-dot tc-oport-dot'}));const t=svg('title');t.textContent=`${o.label}：拖到另一位成员上，接进它的「知识」口（${o.out==='artifact'?'对方会一直拿到这位成员最新交付的任务结果':'对方会一直拿到这位成员最新的一条发言'}）`;pg.append(t);
      pg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.preventDefault();event.stopPropagation();fwireStart({from:m.id,out:o.out,port:'knowledge',a:{x:NODE_W,y:o.y},owner:m.id},event);});
      pg.addEventListener('click',event=>event.stopPropagation());pg.addEventListener('dblclick',event=>event.stopPropagation());g.append(pg);}}
  function pLayer(id,before){let g=$(id);if(!g){g=svg('g',{id,class:id});$('tc-world').insertBefore(g,before?$(before):null);}return g;}
  // ---------- 接口节点：ComfyUI 式节点内控件（下拉 / 数值 / 文本 / 多选直接在节点上改，不再弹设置面板） ----------
  const PW_ROW=22,PW_TOP=48,PW_GAP=4;
  function pWidgets(id,p){const c=p.config||{},cat=mcat(),L=[];
    switch(p.type){
      case 'model':L.push({key:'model',label:'模型',kind:'combo',value:c.model?modelName(c.model):'（选一个模型）',empty:!c.model},{key:'reasoningEffort',label:'推理强度',kind:'combo',value:c.reasoningEffort?(EFFORT_LABEL[c.reasoningEffort]||c.reasoningEffort):'默认',empty:!c.reasoningEffort},{key:'temperature',label:'温度',kind:'num',min:0,max:2,step:0.1,value:c.temperature},{key:'maxOutputTokens',label:'最大输出',kind:'num',min:1,max:1000000,step:1024,int:true,value:c.maxOutputTokens},{key:'fallbackModel',label:'备用模型',kind:'combo',value:c.fallbackModel?modelName(c.fallbackModel):'无',empty:!c.fallbackModel});break;
      case 'persona':L.push({key:'goal',label:'目标',kind:'area',rows:3,value:c.goal||'',ph:'交付物与验收标准'},{key:'backstory',label:'背景 / 专长',kind:'area',rows:3,value:c.backstory||'',ph:'技术栈、风格、禁忌'});break;
      case 'perm':L.push({key:'writeScope',label:'可写范围',kind:'area',rows:2,list:true,value:(c.writeScope||[]).join('\n'),ph:'整个项目（每行一个路径）'},{key:'confirm',label:'需要确认',kind:'multi',value:c.confirm?.length?c.confirm.map(x=>cat.confirm.find(o=>o.id===x)?.label||x).join('、'):'不需要',empty:!c.confirm?.length});break;
      case 'tools':{const on=c.tools||[];L.push({key:'tools',label:'工具',kind:'multi',value:on.length?on.map(t=>t.startsWith('mcp:')?t.slice(4):(cat.tools.find(x=>x.id===t)?.label||t)).join('、'):'还没选',empty:!on.length});break;}
      case 'workspace':L.push({key:'dir',label:'目录',kind:'text',value:c.dir&&c.dir!=='.'?c.dir:'',ph:'项目根目录'});break;
      case 'doc':L.push({key:'text',label:'内容',kind:'area',rows:4,max:8000,value:c.text||'',ph:'接口约定、需求说明、示例…'},{key:'paths',label:'文件',kind:'area',rows:2,list:true,value:(c.paths||[]).join('\n'),ph:'docs/api.md（每行一个）'});break;
      case 'rules':L.push({key:'text',label:'规范',kind:'area',rows:4,value:c.text||'',ph:'代码风格、提交前要跑的检查、交付格式…'});break;
      case 'board':{const es=(pstate().board?.[id]||[]);L.push({key:'topic',label:'主题',kind:'text',value:c.topic||'',ph:'这块看板记什么（可选）'},{key:'_log',kind:'log',rows:3,entries:es.slice(-3).reverse(),total:es.length});break;}
    }
    for(const w of L)w.h=w.kind==='area'?16+w.rows*14+6:w.kind==='log'?14+Math.max(1,w.rows)*15:PW_ROW-4;
    return L;}
  function pHeight(id,p){if(isCollapsed(id))return 24;let y=PW_TOP;for(const w of pWidgets(id,p))y+=w.h+PW_GAP;return Math.max(PH,y+4);}
  function wrapText(text,px,font,max){const out=[];for(const para of String(text||'').split(/\r?\n/)){let cur='',w=0;for(const ch of para){const cw=(/[\u2e80-\uffff]/.test(ch)?1:0.58)*font;if(w+cw>px&&cur){out.push(cur);cur='';w=0;}cur+=ch;w+=cw;}out.push(cur);if(out.length>max)break;}if(out.length>max){out.length=max;out[max-1]=fit(out[max-1]+'……',px,font);}return out;}
  async function saveProvider(id,patch,label){const p=providersOf()[id];if(!p)return;const before={},cfg=p.config||{};let name;
    if('name' in patch){name=String(patch.name||'').trim();if(!name||name===p.name)return;}
    const config=Object.fromEntries(Object.entries(patch).filter(([k])=>k!=='name'));for(const k of Object.keys(config))before[k]=cfg[k]??null;
    if(name==null&&Object.keys(config).every(k=>JSON.stringify(cfg[k]??null)===JSON.stringify(config[k]??null)))return;
    const redo={id,...(name!=null?{name}:{}),...(Object.keys(config).length?{config}:{})},undo={id,...(name!=null?{name:p.name}:{}),...(Object.keys(config).length?{config:before}:{})};
    try{await act('portProvider',redo);record(label||'编辑节点',()=>api('portProvider',undo),()=>api('portProvider',redo));}catch(e){notice(e.message,true);}}
  var pEdit=null;
  function closePEdit(commit){const e=pEdit;if(!e)return;pEdit=null;const v=e.input.value;e.box.remove();if(commit)e.done(v);}
  /** 在节点上原位打开一个输入框（世界坐标，跟着画布缩放）。 */
  function pInline(id,x,y,w,h,value,{multi,ph,max,numeric,onDone}){closePEdit(true);closeWidgetPop();closeMenus();const at=providerPos()[id];if(!at)return;
    const box=el('div',null,'tc-wedit tc-wedit-name tc-pedit'+(multi?' multi':'')),input=el(multi?'textarea':'input');if(!multi)input.type='text';input.value=value??'';if(ph)input.placeholder=ph;if(max)input.maxLength=max;input.spellcheck=false;if(numeric)input.inputMode='decimal';box.append(input);
    box.style.left=(at.x+x)+'px';box.style.top=(at.y+y)+'px';box.style.width=w+'px';box.style.height=h+'px';
    for(const t of ['pointerdown','mousedown','dblclick','click','contextmenu','wheel'])box.addEventListener(t,ev=>ev.stopPropagation());
    input.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='Escape'){ev.preventDefault();closePEdit(false);}else if(ev.key==='Enter'&&(!multi||ev.ctrlKey||ev.metaKey)){ev.preventDefault();closePEdit(true);}});
    input.addEventListener('keyup',ev=>ev.stopPropagation());input.addEventListener('blur',()=>{if(pEdit&&pEdit.input===input)closePEdit(true);});
    ensureWLayer().append(box);pEdit={id,input,box,done:onDone};input.focus();if(multi){input.selectionStart=input.selectionEnd=input.value.length;}else input.select();}
  function startProviderRename(id){const p=providersOf()[id];if(!p)return;pInline(id,8,3,PW-16,18,p.name,{max:40,onDone:v=>saveProvider(id,{name:v},'改名')});}
  function editPWidget(id,w){if(w.kind==='combo'||w.kind==='multi')return openPWidgetPop(id,w);const f=document.querySelector(`#tc-pnodes [data-pid="${CSS.escape(id)}"] .tc-pw-input[data-pw="${w.key}"]`);if(f){f.focus();if(f.tagName==='INPUT')f.select();}}
  function stepPWidget(id,w,dir){const cur=w.value;let n;if(cur==null)n=dir>0?(w.int?4096:0.7):(w.int?4096:0.7);else n=cur+dir*w.step;n=Math.min(w.max,Math.max(w.min,w.int?Math.round(n):Math.round(n*10)/10));saveProvider(id,{[w.key]:n},'改'+w.label);}
  function openPWidgetPop(id,w){const p=providersOf()[id];if(!p)return;const anchor=document.querySelector(`#tc-pnodes [data-pid="${CSS.escape(id)}"] [data-pw="${w.key}"]`);if(wPop&&wPop.id===id&&wPop.kind==='p:'+w.key){closeWidgetPop();return;}closePEdit(true);closeWidgetPop();closeMenus();
    const c=p.config||{},cat=mcat(),multi=w.kind==='multi',isModel=w.key==='model'||w.key==='fallbackModel';if(isModel&&!catalogModels().length){notice('没有可用模型，请先在对话框的模型下拉里「配置供应商」。',true);return;}
    const box=el('div',null,'tc-wpop tc-wedit');box.setAttribute('role','listbox');if(multi)box.setAttribute('aria-multiselectable','true');box.tabIndex=-1;for(const t of ['pointerdown','mousedown','dblclick','click','contextmenu','wheel'])box.addEventListener(t,ev=>ev.stopPropagation());
    const list=el('div',null,'tc-wpop-list');let q=null,rows=[],focus=0;let picked=multi?new Set(c[w.key]||[]):null;
    const opts=()=>{const out=[];if(w.key==='model'||w.key==='fallbackModel'){if(w.key==='fallbackModel')out.push({v:'',t:'无'});const qq=(q?.value||'').trim().toLowerCase();for(const x of catalogModels()){if(qq&&![x.name,x.id,modelGroup(x)].some(t=>String(t||'').toLowerCase().includes(qq)))continue;out.push({v:modelValue(x),t:x.name||x.id,g:modelGroup(x)});}return out;}
      if(w.key==='reasoningEffort'){out.push({v:'',t:'默认'});for(const e of cat.efforts)out.push({v:e,t:EFFORT_LABEL[e]||e});return out;}
      if(w.key==='confirm')return cat.confirm.map(o=>({v:o.id,t:o.label}));
      if(w.key==='tools'){for(const t of cat.tools)out.push({v:t.id,t:t.label,tip:t.hint});const ids=new Set((cat.mcpServers||[]).map(x=>x.id));for(const t of c.tools||[])if(t.startsWith('mcp:'))ids.add(t.slice(4));for(const s of ids)out.push({v:'mcp:'+s,t:'MCP · '+s,g:'MCP'});return out;}
      return out;};
    const curOf=()=>w.key==='model'||w.key==='fallbackModel'?modelValue(c[w.key]):(c[w.key]||'');
    const commit=v=>{if(multi){picked.has(v)?picked.delete(v):picked.add(v);const order=opts().map(o=>o.v),arr=order.filter(x=>picked.has(x));saveProvider(id,{[w.key]:w.key==='tools'?arr:(arr.length?arr:null)},'改'+w.label);draw(true);return;}
      closeWidgetPop();let val=v||null;if(val&&(w.key==='model'||w.key==='fallbackModel')){try{val=JSON.parse(v);}catch{val=null;}}saveProvider(id,{[w.key]:val},'改'+w.label);};
    const focusRow=(i,reveal)=>{if(!rows.length)return;focus=Math.max(0,Math.min(rows.length-1,i));rows.forEach((r,k)=>r.classList.toggle('focused',k===focus));if(reveal)rows[focus].scrollIntoView({block:'nearest'});};
    const draw=keep=>{const f=focus;list.replaceChildren();rows=[];focus=0;const cur=curOf();let lastG=null;const os=opts();if(!os.length)list.append(el('div',isModel?'没有匹配的模型':'没有可选项','tc-wpop-empty'));
      for(const o of os){if(o.g&&o.g!==lastG&&isModel){list.append(el('div',o.g,'tc-wpop-h'));}lastG=o.g;const sel=multi?picked.has(o.v):o.v===cur,r=el('div',null,'tc-wpop-row'+(sel?' selected':''));r.setAttribute('role','option');r.setAttribute('aria-selected',String(sel));r.dataset.value=o.v;if(o.tip)r.title=o.tip;r.append(el('span',multi?(sel?'☑':'☐'):(sel?'✓':''),'tc-wpop-check'),el('span',o.t,'tc-wpop-name'));r.onclick=()=>commit(o.v);r.onmousemove=()=>focusRow(rows.indexOf(r),false);list.append(r);rows.push(r);if(sel&&!multi)focus=rows.length-1;}
      focusRow(keep?f:focus,!keep);};
    box.append(el('div',w.label+(multi?' · 可多选':''),'tc-wpop-head'));if(isModel){q=el('input');q.type='search';q.placeholder='搜索模型';q.className='tc-wpop-search';q.spellcheck=false;q.addEventListener('input',()=>draw());box.append(q);}box.append(list);
    box.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='ArrowDown'){ev.preventDefault();focusRow(focus+1,true);}else if(ev.key==='ArrowUp'){ev.preventDefault();focusRow(focus-1,true);}else if(ev.key==='Enter'||(multi&&ev.key===' '&&ev.target!==q)){ev.preventDefault();rows[focus]?.click();}else if(ev.key==='Escape'||ev.key==='Tab'){ev.preventDefault();closeWidgetPop();}});box.addEventListener('keyup',ev=>ev.stopPropagation());
    document.body.append(box);wPop={id,kind:'p:'+w.key,box,provider:true};draw();
    const r=anchor?anchor.getBoundingClientRect():{left:100,bottom:100,top:100,width:200},mw=Math.max(200,r.width);box.style.minWidth=mw+'px';const h=box.offsetHeight;box.style.left=Math.max(4,Math.min(r.left,innerWidth-box.offsetWidth-4))+'px';box.style.top=(r.bottom+4+h<=innerHeight-4?r.bottom+4:Math.max(4,r.top-4-h))+'px';(q||box).focus();}
  document.addEventListener('pointerdown',event=>{if(wPop?.provider&&!wPop.box.contains(event.target)&&!event.target.closest?.(`.tc-pnode[data-pid="${CSS.escape(wPop.id)}"] [data-pw="${wPop.kind.slice(2)}"]`))closeWidgetPop();},true);
  /** 节点自己的输入框（foreignObject 里的真 input / textarea）：点进去直接打字，回车或失焦保存，Esc 撤回。 */
  function pField(wg,id,w,x,y,width,height,{multi,align,commit}){const fo=svg('foreignObject',{x,y,width,height,class:'tc-pw-fo'}),f=document.createElement(multi?'textarea':'input');if(!multi){f.type='text';if(w.kind==='num')f.inputMode='decimal';}
    f.className='tc-pw-input'+(multi?' area':'')+(align?' '+align:'');const shown=w.kind==='num'?(w.value==null?'':String(w.value)):(w.value||'');f.value=shown;f.placeholder=w.kind==='num'?'默认':(w.ph||'');f.spellcheck=false;f.maxLength=w.max||(multi?4000:400);f.dataset.pw=w.key;f.setAttribute('aria-label',w.label);
    let orig=shown;const save=()=>{if(f.value===orig)return;const v=f.value;orig=v;commit(v,()=>{f.value=orig=shown;});};
    for(const t of ['pointerdown','mousedown','click','dblclick','contextmenu'])f.addEventListener(t,ev=>ev.stopPropagation());
    f.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='Escape'){ev.preventDefault();f.value=orig;f.blur();}else if(ev.key==='Enter'&&(!multi||ev.ctrlKey||ev.metaKey)){ev.preventDefault();f.blur();}else if(!multi&&w.kind==='num'&&(ev.key==='ArrowUp'||ev.key==='ArrowDown')){ev.preventDefault();f.blur();stepPWidget(id,w,ev.key==='ArrowUp'?1:-1);}});
    f.addEventListener('keyup',ev=>ev.stopPropagation());f.addEventListener('blur',save);fo.append(f);wg.append(fo);return f;}
  function pCommit(id,w){return (v,revert)=>{if(w.kind==='num'){v=v.trim();if(v===''){saveProvider(id,{[w.key]:null},'改'+w.label);return;}const n=Number(v);if(!Number.isFinite(n)||n<w.min||n>w.max||(w.int&&!Number.isInteger(n))){notice(`${w.label}要在 ${w.min}–${w.max} 之间${w.int?'的整数':''}。`,true);revert();return;}saveProvider(id,{[w.key]:n},'改'+w.label);return;}
    if(w.kind==='text'){saveProvider(id,{[w.key]:w.key==='dir'?(v.trim()||'.'):v.trim()},'改'+w.label);return;}
    const val=w.list?(x=>x.length?x:null)(v.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)):(w.key==='text'?v:(v.trim()||null));saveProvider(id,{[w.key]:w.key==='paths'?(val||[]):val},'改'+w.label);};}
  function drawPWidgets(g,id,p){let y=PW_TOP;const W=PW-20;
    for(const w of pWidgets(id,p)){const wg=svg('g',{class:'tc-pw tc-pw-'+w.kind+(w.kind!=='log'?' editable':'')+(w.empty?' empty':''),transform:`translate(10,${y})`,'data-pw':w.key});
      if(w.kind==='combo'||w.kind==='multi'||w.kind==='text'||w.kind==='num'){wg.append(svg('rect',{width:W,height:w.h,rx:w.h/2,class:'tc-widget-box'}));const l=svg('text',{x:w.kind==='num'?22:10,y:w.h/2+4,class:'tc-widget-label'});l.textContent=w.label;wg.append(l);const lw=(w.kind==='num'?22:10)+w.label.length*11+8;
        if(w.kind==='num'){pField(wg,id,w,lw,1,W-22-lw,w.h-2,{align:'right',commit:pCommit(id,w)});
          for(const [dir,hx,d] of [[-1,0,`M13,${w.h/2-4} l-4,4 l4,4`],[1,W-20,`M${W-13},${w.h/2-4} l4,4 l-4,4`]]){const b=svg('g',{class:'tc-pw-step','data-dir':dir});b.append(svg('rect',{x:hx,y:0,width:20,height:w.h,rx:w.h/2,class:'tc-pw-step-hit'}),svg('path',{d,class:'tc-widget-chev'}));const t=svg('title');t.textContent=dir<0?'减小':'增大';b.append(t);b.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;ev.stopPropagation();});b.addEventListener('click',ev=>{ev.stopPropagation();stepPWidget(id,w,dir);});b.addEventListener('dblclick',ev=>ev.stopPropagation());wg.append(b);}}
        else if(w.kind==='text')pField(wg,id,w,lw,1,W-lw-8,w.h-2,{align:'right',commit:pCommit(id,w)});
        else{const v=svg('text',{x:W-24,y:w.h/2+4,class:'tc-widget-value'+(w.empty?' muted':''),'text-anchor':'end'});v.textContent=fit(w.value||'',W-24-lw,11);wg.append(v);wg.append(svg('path',{d:`M${W-16},${w.h/2-2} l3.5,3.5 l3.5,-3.5`,class:'tc-widget-chev'}));const t=svg('title');t.textContent=`点一下选${w.label}`;wg.append(t);
          wg.addEventListener('pointerdown',ev=>{if(ev.button!==0||spaceDown)return;ev.stopPropagation();});wg.addEventListener('click',ev=>{ev.stopPropagation();openPWidgetPop(id,w);});wg.addEventListener('dblclick',ev=>ev.stopPropagation());}}
      else if(w.kind==='area'){const l=svg('text',{x:2,y:10,class:'tc-widget-label'});l.textContent=w.label;wg.append(l);pField(wg,id,w,0,14,W,w.h-14,{multi:true,commit:pCommit(id,w)});}
      else if(w.kind==='log'){const l=svg('text',{x:2,y:10,class:'tc-widget-label'});l.textContent=`最新记录 · 共 ${w.total} 条`;wg.append(l);if(!w.entries.length){const t=svg('text',{x:2,y:26,class:'tc-pw-line muted'});t.textContent='成员回复里写「#看板 …」会记到这里';wg.append(t);}
        w.entries.forEach((e,i)=>{const t=svg('text',{x:2,y:26+i*15,class:'tc-pw-line'});t.textContent=fit(memberName(e.by)+'：'+e.text,W-4,11);wg.append(t);});}
      g.append(wg);y+=w.h+PW_GAP;}}
  // ---------- 折叠（Alt+C）/ 跳过（Ctrl+B）/ 接口线中继点（双击线添加，拖动移动，双击或右键点删除） ----------
  function isCollapsed(id){return (team().collapsed||[]).includes(id);}
  function isBypassed(id){return !!providersOf()[id]?.bypass;}
  async function setCollapsed(ids,on){ids=ids.filter(k=>isCollapsed(k)!==on);if(!ids.length)return;try{await act('teamCollapse',{ids,collapsed:on});record(on?'折叠':'展开',()=>api('teamCollapse',{ids,collapsed:!on}),()=>api('teamCollapse',{ids,collapsed:on}));}catch{}lastCanvasSig='';drawCanvas();}
  function toggleCollapse(ids){ids=ids.filter(k=>providersOf()[k]||positions(canvasNodes())[k]);if(!ids.length)return;const on=!ids.every(isCollapsed);void setCollapsed(ids,on);}
  async function toggleBypass(ids){const ps=ids.filter(k=>providersOf()[k]),ms=ids.filter(k=>!providersOf()[k]&&positions(canvasNodes())[k]);
    if(ps.length){const on=!ps.every(isBypassed);try{await act('portProviderFlags',{ids:ps,bypass:on});record(on?'跳过节点':'恢复节点',()=>api('portProviderFlags',{ids:ps,bypass:!on}),()=>api('portProviderFlags',{ids:ps,bypass:on}));notice(on?`已跳过 ${ps.length} 个节点：接着的线不生效`:`已恢复 ${ps.length} 个节点`);}catch{}}
    const mids=[...new Set(ms.map(baseOf))];if(mids.length){const list=mids.map(k=>members().find(m=>m.id===k)).filter(Boolean),on=list.some(m=>m.enabled);for(const m of list)if(!!m.enabled===on)await saveMemberRec(m.id,{enabled:!on},on?'停用成员':'启用成员');}
    lastCanvasSig='';drawCanvas();}
  /** 线经过中继点：每段都是一条平滑曲线。 */
  function viaPath(a,pts,b){const all=[a,...pts,b];let d='';for(let i=0;i<all.length-1;i++){const s=spline(all[i],'right',all[i+1],'left');d+=i?s.replace(/^M[^C]+/,''):s;}return d;}
  function viaInsertIndex(a,pts,b,q){const all=[a,...pts,b];let best=0,bd=Infinity;for(let i=0;i<all.length-1;i++){const p=all[i],r=all[i+1],dx=r.x-p.x,dy=r.y-p.y,L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((q.x-p.x)*dx+(q.y-p.y)*dy)/L)),d=Math.hypot(p.x+t*dx-q.x,p.y+t*dy-q.y);if(d<bd){bd=d;best=i;}}return best;}
  async function saveVia(f,via,label){const before=f.via||[];try{await act('portFeedVia',{id:f.id,via});record(label,()=>api('portFeedVia',{id:f.id,via:before}),()=>api('portFeedVia',{id:f.id,via}));}catch{}viaLocal={};lastCanvasSig='';drawCanvas();}
  let viaLocal={},viaDrag=null;
  const viaOf=f=>viaLocal[f.id]||f.via||[];
  function drawVia(layer,f,ends){const pts=viaOf(f),color=PORT_COLORS[f.port]||'#888';pts.forEach((q,i)=>{const c=svg('circle',{cx:q.x,cy:q.y,r:6,class:'tc-reroute','data-fid':f.id,'data-i':i});c.style.setProperty('--port-color',color);const t=svg('title');t.textContent='中继点：拖动移动 · 双击或右键删除';c.append(t);
    c.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();viaDrag={f,i,sx:ev.clientX,sy:ev.clientY,orig:pts.map(p=>({...p})),moved:false};try{c.setPointerCapture(ev.pointerId);}catch{}});
    c.addEventListener('pointermove',ev=>{if(!viaDrag||viaDrag.f.id!==f.id||viaDrag.i!==i)return;const dx=(ev.clientX-viaDrag.sx)/view.k,dy=(ev.clientY-viaDrag.sy)/view.k;if(Math.abs(dx)+Math.abs(dy)>2)viaDrag.moved=true;const next=viaDrag.orig.map(p=>({...p}));next[i]={x:Math.round(viaDrag.orig[i].x+dx),y:Math.round(viaDrag.orig[i].y+dy)};viaLocal[f.id]=next;c.setAttribute('cx',next[i].x);c.setAttribute('cy',next[i].y);const e2=feedEnds(f,positions(canvasNodes()),providerPos());if(e2){const d=viaPath(e2.a,next,e2.b);for(const el of $('tc-feeds').querySelectorAll(`[data-fid="${CSS.escape(f.id)}"]:not(circle)`))el.setAttribute('d',d);}});
    c.addEventListener('pointerup',()=>{if(!viaDrag||viaDrag.f.id!==f.id)return;const d=viaDrag;viaDrag=null;if(d.moved)void saveVia(f,viaLocal[f.id]||d.orig,'移动中继点');else selectFeed(f.id);});
    const del=ev=>{ev.preventDefault();ev.stopPropagation();void saveVia(f,pts.filter((_,j)=>j!==i),'删除中继点');};c.addEventListener('dblclick',del);c.addEventListener('contextmenu',del);c.addEventListener('click',ev=>ev.stopPropagation());layer.append(c);});}
  function addVia(f,event){const pos=positions(canvasNodes()),ends=feedEnds(f,pos,providerPos());if(!ends)return;const q=toWorld(event.clientX,event.clientY),pts=[...(f.via||[])],i=viaInsertIndex(ends.a,pts,ends.b,q);pts.splice(i,0,{x:Math.round(q.x),y:Math.round(q.y)});void saveVia(f,pts,'添加中继点');}
  document.addEventListener('keydown',event=>{if(page!=='canvas'||typing(event.target))return;const k=event.key.toLowerCase(),ids=[...selection];
    if(event.altKey&&!event.ctrlKey&&!event.metaKey&&(k==='c'||event.code==='KeyC')&&ids.length){event.preventDefault();event.stopImmediatePropagation();toggleCollapse(ids);return;}
    if((event.ctrlKey||event.metaKey)&&!event.altKey&&k==='b'&&ids.length){event.preventDefault();event.stopImmediatePropagation();void toggleBypass(ids);}},true);
  // ---------- 分组（ComfyUI 式 Group）：Ctrl+G 把选中节点框起来，拖标题连组内节点一起走，右下角拖大小，双击标题改名，右键换颜色 / 删除 ----------
  const GROUP_COLORS=[['灰','#8a8a8a'],['红','#c0504d'],['橙','#d08a35'],['黄','#c4ab35'],['绿','#4e9a5b'],['青','#3a9a9a'],['蓝','#4a7fc4'],['紫','#8a62c0']];
  const GROUP_HEAD=30,GROUP_PAD=24;
  let gLocal={},gSel=null,gDrag=null,gClip=null,lastWorldPt=null;
  const groupsOf=()=>(team().groups||[]).map(g=>gLocal[g.id]?{...g,...gLocal[g.id]}:g);
  function allNodeRects(){const out={};for(const [id,p] of Object.entries(positions(canvasNodes())))out[id]={x:p.x,y:p.y,w:NODE_W,h:p.h};for(const [id,p] of Object.entries(providerPos()))out[id]={x:p.x,y:p.y,w:PW,h:p.h};return out;}
  const rectIn=(r,g)=>r.x>=g.x-1&&r.y>=g.y-1&&r.x+r.w<=g.x+g.w+1&&r.y+r.h<=g.y+g.h+1;
  function nodesInGroup(g){return Object.entries(allNodeRects()).filter(([,r])=>rectIn(r,g)).map(([id])=>id);}
  async function saveGroups(next,label){const before=JSON.parse(JSON.stringify(team().groups||[]));try{await act('teamGroups',{groups:next});record(label,()=>api('teamGroups',{groups:before}),()=>api('teamGroups',{groups:next}));}catch(e){notice(e.message,true);}finally{gLocal={};lastCanvasSig='';drawCanvas();}}
  function boundsOf(ids){const rs=allNodeRects(),list=ids.map(id=>rs[id]).filter(Boolean);if(!list.length)return null;const x1=Math.min(...list.map(r=>r.x)),y1=Math.min(...list.map(r=>r.y)),x2=Math.max(...list.map(r=>r.x+r.w)),y2=Math.max(...list.map(r=>r.y+r.h));return {x:Math.round(x1-GROUP_PAD),y:Math.round(y1-GROUP_PAD-GROUP_HEAD),w:Math.round(x2-x1+GROUP_PAD*2),h:Math.round(y2-y1+GROUP_PAD*2+GROUP_HEAD)};}
  function createGroup(at){const ids=[...selection];let b=ids.length?boundsOf(ids):null;if(!b){const p=at||lastWorldPt||toWorld(innerWidth/2,innerHeight/2);b={x:Math.round(p.x-200),y:Math.round(p.y-40),w:400,h:260};}
    const id='g_'+Math.random().toString(36).slice(2,12),next=[...(team().groups||[]),{id,title:'分组',color:GROUP_COLORS[6][1],...b}];gSel=id;selection=new Set();updateHint();saveGroups(next,'新建分组').then(()=>setTimeout(()=>renameGroup(id),60));}
  function patchGroup(id,patch,label){const next=(team().groups||[]).map(g=>g.id===id?{...g,...patch}:g);return saveGroups(next,label);}
  function deleteGroup(id,withNodes){const g=groupsOf().find(x=>x.id===id);if(!g)return;const ids=withNodes?nodesInGroup(g):[];if(gSel===id)gSel=null;saveGroups((team().groups||[]).filter(x=>x.id!==id),'删除分组').then(()=>{if(ids.length){const ps=ids.filter(k=>providersOf()[k]),ms=ids.filter(k=>!providersOf()[k]);for(const k of ps)void deleteProvider(k);if(ms.length)removeFromCanvas(ms);}});}
  function fitGroup(id){const g=groupsOf().find(x=>x.id===id);if(!g)return;const ids=nodesInGroup(g);const b=boundsOf(ids);if(!b){notice('组里还没有节点。');return;}patchGroup(id,b,'分组适应内容');}
  function renameGroup(id){const g=groupsOf().find(x=>x.id===id);if(!g)return;closePEdit(true);closeMenus();
    const box=el('div',null,'tc-wedit tc-wedit-name tc-pedit tc-gedit'),input=el('input');input.type='text';input.value=g.title;input.maxLength=60;input.spellcheck=false;box.append(input);box.style.left=(g.x+8)+'px';box.style.top=(g.y+4)+'px';box.style.width=Math.max(120,g.w-16)+'px';box.style.height=(GROUP_HEAD-8)+'px';
    for(const t of ['pointerdown','mousedown','dblclick','click','contextmenu','wheel'])box.addEventListener(t,ev=>ev.stopPropagation());
    input.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='Escape'){ev.preventDefault();closePEdit(false);}else if(ev.key==='Enter'){ev.preventDefault();closePEdit(true);}});input.addEventListener('keyup',ev=>ev.stopPropagation());input.addEventListener('blur',()=>{if(pEdit&&pEdit.input===input)closePEdit(true);});
    ensureWLayer().append(box);pEdit={id,input,box,done:v=>{v=v.trim();if(v&&v!==g.title)patchGroup(id,{title:v},'分组改名');}};input.focus();input.select();}
  function groupMenu(id,event){const g=groupsOf().find(x=>x.id===id);if(!g)return;gSel=id;selection=new Set();drawGroups();const n=nodesInGroup(g).length;
    showMenu(event.clientX,event.clientY,[{head:`分组「${g.title}」· ${n} 个节点`},{label:'重命名',key:'F2',run:()=>renameGroup(id)},{label:'颜色',sub:()=>GROUP_COLORS.map(([name,c])=>({label:name+(c===g.color?'  ✓':''),color:c,run:()=>patchGroup(id,{color:c},'分组换色')}))},{label:'适应内容',run:()=>fitGroup(id),disabled:!n},{label:'选中组内节点',run:()=>{gSel=null;selection=new Set(nodesInGroup(g));updateHint();drawCanvas();},disabled:!n},'-',{label:'删除分组（保留节点）',key:'Delete',run:()=>deleteGroup(id,false)},{label:'删除分组和组内节点',run:()=>deleteGroup(id,true),disabled:!n}]);}
  function groupLayer(){let l=$('tc-groups');if(!l){l=svg('g',{id:'tc-groups',class:'tc-groups'});const w=$('tc-world');w.insertBefore(l,w.firstChild);}else if(l.parentNode.firstChild!==l)l.parentNode.insertBefore(l,l.parentNode.firstChild);return l;}
  function drawGroups(){if(gDrag)return;const layer=groupLayer();layer.replaceChildren();
    for(const g of groupsOf()){const G=svg('g',{class:'tc-group'+(gSel===g.id?' selected':''),transform:`translate(${g.x},${g.y})`,'data-gid':g.id});G.style.setProperty('--group-color',g.color||GROUP_COLORS[0][1]);
      G.append(svg('rect',{width:g.w,height:g.h,rx:8,class:'tc-group-box'}));const head=svg('path',{d:`M0,8 a8,8 0 0 1 8,-8 h${g.w-16} a8,8 0 0 1 8,8 v${GROUP_HEAD-8} h-${g.w} z`,class:'tc-group-head'});const t=svg('text',{x:12,y:20,class:'tc-group-title'});t.textContent=fit(g.title,g.w-24,14);
      const tt=svg('title');tt.textContent='拖标题移动整组（组内节点一起走） · 双击选中组内所有节点 · F2 改名 · 右键换颜色 / 删除';head.append(tt);const rz=svg('path',{d:`M${g.w-2},${g.h-16} L${g.w-2},${g.h-2} L${g.w-16},${g.h-2} z`,class:'tc-group-resize'});const rt=svg('title');rt.textContent='拖动调整分组大小';rz.append(rt);G.append(head,t,rz);
      head.addEventListener('pointerdown',ev=>{if(ev.button!==0||spaceDown)return;ev.preventDefault();ev.stopPropagation();closeMenus();const inner=nodesInGroup(g),rs=allNodeRects();gDrag={id:g.id,mode:'move',sx:ev.clientX,sy:ev.clientY,orig:{x:g.x,y:g.y,w:g.w,h:g.h},nodes:Object.fromEntries(inner.map(k=>[k,{x:rs[k].x,y:rs[k].y}])),moved:false};try{head.setPointerCapture(ev.pointerId);}catch{}});
      rz.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();gDrag={id:g.id,mode:'size',sx:ev.clientX,sy:ev.clientY,orig:{x:g.x,y:g.y,w:g.w,h:g.h},nodes:{},moved:false};try{rz.setPointerCapture(ev.pointerId);}catch{}});
      for(const h of [head,rz]){h.addEventListener('pointermove',gMove);h.addEventListener('pointerup',gUp);h.addEventListener('click',ev=>ev.stopPropagation());}
      head.addEventListener('dblclick',ev=>{ev.stopPropagation();ev.preventDefault();selectGroupNodes(g);});head.addEventListener('contextmenu',ev=>{ev.preventDefault();ev.stopPropagation();groupMenu(g.id,ev);});
      layer.append(G);}}
  /** 点在哪个分组里（重叠时取最小、最靠上的那个）。 */
  function groupAt(pt){const hit=groupsOf().filter(g=>pt.x>=g.x&&pt.x<=g.x+g.w&&pt.y>=g.y&&pt.y<=g.y+g.h);return hit.sort((a,b)=>a.w*a.h-b.w*b.h)[0]||null;}
  /** 双击分组：选中组里的所有节点。 */
  function selectGroupNodes(g){const ids=nodesInGroup(g);gSel=ids.length?null:g.id;selection=new Set(ids);selectedEdge=null;selectedFeed=null;updateHint();lastCanvasSig='';drawCanvas();if(ids.length)notice(`已选中「${g.title}」里的 ${ids.length} 个节点`);}
  function gMove(ev){if(!gDrag)return;const dx=(ev.clientX-gDrag.sx)/view.k,dy=(ev.clientY-gDrag.sy)/view.k;if(Math.abs(ev.clientX-gDrag.sx)+Math.abs(ev.clientY-gDrag.sy)>3)gDrag.moved=true;if(!gDrag.moved)return;const o=gDrag.orig,snap=ev.shiftKey?(v=>Math.round(v/GRID)*GRID):Math.round;
    if(gDrag.mode==='move'){gLocal[gDrag.id]={x:snap(o.x+dx),y:snap(o.y+dy)};for(const [k,p] of Object.entries(gDrag.nodes)){localPos[k]={x:snap(p.x+dx),y:snap(p.y+dy)};anyNodeEl(k)?.setAttribute('transform',`translate(${localPos[k].x},${localPos[k].y})`);}redrawEdgesOnly();}
    else gLocal[gDrag.id]={w:Math.max(160,snap(o.w+dx)),h:Math.max(90,snap(o.h+dy))};gApply(gDrag.id);renderMini();}
  /** 拖动中只改现有元素的属性（重画会丢掉指针捕获）。 */
  function gApply(id){const g=groupsOf().find(x=>x.id===id),G=$('tc-groups')?.querySelector(`[data-gid="${CSS.escape(id)}"]`);if(!g||!G)return;G.setAttribute('transform',`translate(${g.x},${g.y})`);const [box,head,,rz]=G.children;box.setAttribute('width',g.w);box.setAttribute('height',g.h);head.setAttribute('d',`M0,8 a8,8 0 0 1 8,-8 h${g.w-16} a8,8 0 0 1 8,8 v${GROUP_HEAD-8} h-${g.w} z`);rz.setAttribute('d',`M${g.w-2},${g.h-16} L${g.w-2},${g.h-2} L${g.w-16},${g.h-2} z`);}
  function gUp(){if(!gDrag)return;const d=gDrag;gDrag=null;if(!d.moved){gSel=d.id;selection=new Set();selectedEdge=null;selectedFeed=null;updateHint();lastCanvasSig='';drawCanvas();return;}
    const cur=gLocal[d.id]||{},next=(team().groups||[]).map(g=>g.id===d.id?{...g,...cur}:g),before=JSON.parse(JSON.stringify(team().groups||[])),nodes=Object.fromEntries(Object.keys(d.nodes).map(k=>[k,{...localPos[k]}]));
    (async()=>{try{await api('teamGroups',{groups:next});if(Object.keys(nodes).length)await saveLayoutMixed(nodes);record(d.mode==='move'?'移动分组':'调整分组大小',async()=>{await api('teamGroups',{groups:before});if(Object.keys(nodes).length)await setLayout(d.nodes);},async()=>{await api('teamGroups',{groups:next});if(Object.keys(nodes).length)await setLayout(nodes);});}catch(e){notice(e.message,true);}finally{gLocal={};lastCanvasSig='';drawCanvas();}})();}
  canvasEl.addEventListener('pointermove',ev=>{lastWorldPt=toWorld(ev.clientX,ev.clientY);});
  canvasEl.addEventListener('pointerdown',ev=>{if(ev.button===0&&gSel&&!ev.target.closest?.('.tc-group')){gSel=null;drawGroups();}},true);
  // ---------- 复制 / 粘贴接口节点（Ctrl+C / Ctrl+V；Ctrl+Shift+V 连线一起粘） ----------
  function copySelection(){const ids=[...selection].filter(id=>providersOf()[id]);if(!ids.length)return false;const pp=providerPos(),x0=Math.min(...ids.map(k=>pp[k].x)),y0=Math.min(...ids.map(k=>pp[k].y));
    gClip={items:ids.map(k=>({src:k,type:providersOf()[k].type,name:providersOf()[k].name,config:JSON.parse(JSON.stringify(providersOf()[k].config||{})),dx:pp[k].x-x0,dy:pp[k].y-y0})),feeds:feedsOf().filter(f=>ids.includes(f.from)).map(f=>({from:f.from,to:f.to,port:f.port,mode:f.mode}))};notice(`已复制 ${ids.length} 个节点`);return true;}
  async function pasteClip(withLinks){if(!gClip?.items.length)return;const at=lastWorldPt||toWorld(innerWidth/2,innerHeight/2),made=[],map={};
    for(const it of gClip.items){try{const pos={x:Math.round(at.x+it.dx),y:Math.round(at.y+it.dy)},r=await api('portProvider',{type:it.type,...pos});await api('portProvider',{id:r.id,name:it.name,config:it.config});localPos[r.id]=pos;made.push(r.id);map[it.src]=r.id;}catch(e){notice(e.message,true);}}
    if(withLinks)for(const f of gClip.feeds){if(!map[f.from])continue;try{await api('portFeed',{from:map[f.from],to:f.to,port:f.port,...(f.mode?{mode:f.mode}:{})});}catch{}}
    selection=new Set(made);updateHint();lastCanvasSig='';drawCanvas();const snap=gClip;
    record('粘贴',async()=>{for(const id of made)await api('portProviderDelete',{id});},async()=>{for(const it of snap.items){const pos={x:Math.round(at.x+it.dx),y:Math.round(at.y+it.dy)},r=await api('portProvider',{type:it.type,...pos});await api('portProvider',{id:r.id,name:it.name,config:it.config});}});}
  // ---------- collab-nodes: Ctrl+D 复制选中的节点 ----------
  // 新节点和原节点完全独立（同一位成员 / 同类接口节点），右下偏 24px，变成新的选中；选中节点之间的连线、接线一起复制，连到选区外的不复制；Ctrl+Z 撤销
  async function duplicateNodes(ids){ids=[...new Set(ids&&ids.length?ids:[...selection])];const pos=positions(canvasNodes()),pp=providerPos(),pv=providersOf(),D=24;
    const mem=ids.filter(k=>pos[k]),pro=ids.filter(k=>!pos[k]&&pv[k]&&pp[k]);if(!mem.length&&!pro.length)return false;const inSel=new Set([...mem,...pro]);
    const plan={nodes:mem.map(k=>({src:k,key:newNodeKey(k),x:Math.round(pos[k].x+D),y:Math.round(pos[k].y+D)})),
      provs:pro.map(k=>({src:k,type:pv[k].type,name:pv[k].name,config:JSON.parse(JSON.stringify(pv[k].config||{})),x:Math.round(pp[k].x+D),y:Math.round(pp[k].y+D)})),
      edges:nodeEdges().filter(e=>mem.includes(e.from)&&mem.includes(e.to)).map(e=>({from:e.from,to:e.to,type:e.type})),
      feeds:feedsOf().filter(f=>inSel.has(f.from)&&inSel.has(f.to)).map(f=>({from:f.from,to:f.to,port:f.port,out:f.out,mode:f.mode}))};
    if(!(await runDuplicate(plan)))return false;
    record('复制节点',async()=>{const m=plan.made;if(m.nodes.length){await api('teamLayout',{nodes:Object.fromEntries(m.nodes.map(k=>[k,null]))});for(const k of m.nodes){delete localPos[k];selection.delete(k);if(data.team?.nodes)delete data.team.nodes[k];}if(data.team)data.team.edges=(data.team.edges||[]).filter(e=>!m.nodes.includes(e.fromNode)&&!m.nodes.includes(e.toNode));}for(const id of m.provs){try{await api('portProviderDelete',{id});}catch{}delete localPos[id];selection.delete(id);}lastCanvasSig='';},async()=>{await runDuplicate(plan);});
    return true;}
  async function runDuplicate(plan){const map={},made={nodes:[],provs:[]};plan.made=made;
    for(const n of plan.nodes){map[n.src]=n.key;localPos[n.key]={x:n.x,y:n.y};made.nodes.push(n.key);}
    selection=new Set(made.nodes);selectedEdge=null;gSel=null;lastCanvasSig='';drawCanvas();
    if(made.nodes.length){try{await act('teamLayout',{nodes:Object.fromEntries(plan.nodes.map(n=>[n.key,{x:n.x,y:n.y}]))});}catch{for(const k of made.nodes){delete localPos[k];selection.delete(k);}made.nodes=[];lastCanvasSig='';drawCanvas();return null;}}
    for(const p of plan.provs){try{const r=await api('portProvider',{type:p.type,x:p.x,y:p.y});await api('portProvider',{id:r.id,name:p.name,config:p.config});localPos[r.id]={x:p.x,y:p.y};map[p.src]=r.id;made.provs.push(r.id);}catch(error){notice(error.message,true);}}
    let links=0;for(const e of plan.edges){try{const r=await api('teamEdges',{from:map[e.from],to:[map[e.to]],type:e.type});if(r?.added?.length)links++;}catch{}}
    for(const f of plan.feeds){if(!map[f.from]||!map[f.to])continue;try{await api('portFeed',{from:map[f.from],to:map[f.to],port:f.port,...(f.out?{out:f.out}:{}),...(f.mode==='override'?{mode:'override'}:{}),replace:false});links++;}catch{}}
    selection=new Set([...made.nodes,...made.provs]);selectedEdge=null;lastCanvasSig='';drawCanvas();updateHint();drawMembers();
    const n=made.nodes.length+made.provs.length;if(!replaying&&n)notice(`已复制 ${n} 个节点`+(links?`（带 ${links} 根线）`:''));return n?made:null;}
  document.addEventListener('keydown',event=>{if(page!=='canvas'||typing(event.target)||event.altKey)return;const mod=event.ctrlKey||event.metaKey,k=event.key.toLowerCase();
    if(mod&&k==='g'){event.preventDefault();event.stopImmediatePropagation();createGroup();return;}
    if(mod&&k==='d'&&!event.shiftKey){event.preventDefault();event.stopImmediatePropagation();if(selection.size&&!linkMode&&!wire)void duplicateNodes([...selection]);return;}
    if(mod&&k==='c'){if(copySelection()){event.preventDefault();event.stopImmediatePropagation();}return;}
    if(mod&&k==='v'&&gClip){event.preventDefault();event.stopImmediatePropagation();void pasteClip(event.shiftKey);return;}
    if(mod&&k==='a'&&!linkMode){event.preventDefault();event.stopImmediatePropagation();gSel=null;selection=new Set([...canvasNodes().map(m=>m.id),...Object.keys(providersOf())]);selectedEdge=null;updateHint();lastCanvasSig='';drawCanvas();return;}
    if(event.key==='F2'&&gSel&&!selection.size){event.preventDefault();event.stopImmediatePropagation();renameGroup(gSel);return;}
    if((event.key==='Delete'||event.key==='Backspace')&&gSel&&!selection.size){event.preventDefault();event.stopImmediatePropagation();deleteGroup(gSel,false);}},true);
  function drawProviders(){const layer=pLayer('tc-pnodes'),ppos=providerPos(),cat=pcat(),ae=document.activeElement,keepEl=ae&&ae.classList?.contains('tc-pw-input')?ae.closest('.tc-pnode'):null,keepId=keepEl?.dataset.pid;for(const c of [...layer.children])if(c!==keepEl)c.remove();
    for(const [id,p] of Object.entries(providersOf())){const at=ppos[id];if(id===keepId){keepEl.setAttribute('transform',`translate(${at.x},${at.y})`);keepEl.classList.toggle('selected',selection.has(id));continue;}const port=cat.providers?.[p.type]?.port,color=PORT_COLORS[port]||'#888',users=feedsOf().filter(f=>f.from===id).length;
      const pc=isCollapsed(id),g=svg('g',{class:'tc-pnode'+(selection.has(id)?' selected':'')+(pc?' collapsed':'')+(p.bypass?' bypassed':''),transform:`translate(${at.x},${at.y})`,'data-pid':id,tabindex:0});g.style.setProperty('--port-color',color);
      const H=at.h;g.append(svg('rect',{width:PW,height:H,rx:NODE_R,class:'tc-pnode-box'}));
      const headD=`M0,${NODE_R} a${NODE_R},${NODE_R} 0 0 1 ${NODE_R},-${NODE_R} h${PW-2*NODE_R} a${NODE_R},${NODE_R} 0 0 1 ${NODE_R},${NODE_R} v${24-NODE_R} h-${PW} z`;g.append(svg('path',{d:headD,class:'tc-pnode-head'}));
      const k=svg('text',{x:10,y:16,class:'tc-pnode-kind'});k.textContent=cat.providers?.[p.type]?.label||p.type;const n=svg('text',{x:PW-10,y:16,class:'tc-pnode-name','text-anchor':'end'});n.textContent=fit(p.name,PW-90,12);
      const th=svg('rect',{x:0,y:0,width:PW,height:24,class:'tc-pnode-titlehit'});const tht=svg('title');tht.textContent='双击改名 · 拖动移动';th.append(tht);
      const o=svg('text',{x:PW-16,y:P_OUT_Y+4,class:'tc-pnode-out','text-anchor':'end'});o.textContent='→ 成员的「'+(cat.ports?.[port]?.label||port)+'」'+(users?' · '+users+' 位':'');
      const tt=svg('title');tt.textContent=`${cat.providers?.[p.type]?.label||p.type}「${p.name}」→ 成员的「${cat.ports?.[port]?.label||port}」口\n${cat.ports?.[port]?.hint||''}\n接给了 ${users} 位成员 · 从右侧圆点拖到成员上接线`;o.append(tt);g.append(k,n,th,o);
      {const tog=svg('g',{class:'tc-collapse'}),tr=svg('rect',{x:0,y:0,width:22,height:24,class:'tc-collapse-hit'}),ta=svg('path',{d:pc?'M8,8 L14,12 L8,16 z':'M7,9 L15,9 L11,15 z',class:'tc-collapse-arrow'}),tt2=svg('title');tt2.textContent=pc?'展开（Alt+C）':'折叠（Alt+C）';tog.append(tr,ta,tt2);tog.addEventListener('pointerdown',ev=>{ev.stopPropagation();});tog.addEventListener('click',ev=>{ev.stopPropagation();void setCollapsed([id],!pc);});tog.addEventListener('dblclick',ev=>ev.stopPropagation());g.append(tog);k.setAttribute('x',22);}
      if(p.bypass){if(!pc){const b=svg('text',{x:PW-10,y:P_OUT_Y+20,class:'tc-pnode-bypass','text-anchor':'end'});b.textContent='已跳过';g.append(b);}else n.textContent='已跳过 · '+fit(p.name,PW-140,12);}
      if(!pc)drawPWidgets(g,id,p);else o.remove();
      const OY=pc?12:P_OUT_Y,pg=svg('g',{class:'tc-port tc-pout'+(users?' linked':''),transform:`translate(${PW},${OY})`});pg.append(svg('circle',{r:10,class:'tc-port-hit'}),svg('circle',{r:PORT_R,class:'tc-port-dot'}));
      pg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.preventDefault();event.stopPropagation();fwireStart({from:id,port,a:{x:PW,y:OY},provider:true},event);});pg.addEventListener('click',e=>e.stopPropagation());g.append(pg);
      g.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.stopPropagation();const cur={...positions(canvasNodes()),...providerPos()},group=selection.has(id)&&selection.size>1?[...selection]:[id];pDrag={id,sx:event.clientX,sy:event.clientY,orig:Object.fromEntries(group.filter(k=>cur[k]).map(k=>[k,{x:cur[k].x,y:cur[k].y}])),moved:false};try{g.setPointerCapture(event.pointerId);}catch{}});
      g.addEventListener('pointermove',event=>{if(!pDrag||pDrag.id!==id)return;const dx=(event.clientX-pDrag.sx)/view.k,dy=(event.clientY-pDrag.sy)/view.k;if(Math.abs(event.clientX-pDrag.sx)+Math.abs(event.clientY-pDrag.sy)>3)pDrag.moved=true;if(!pDrag.moved)return;const snap=event.shiftKey?(v=>Math.round(v/GRID)*GRID):Math.round;for(const [k,o] of Object.entries(pDrag.orig)){localPos[k]={x:snap(o.x+dx),y:snap(o.y+dy)};anyNodeEl(k)?.setAttribute('transform',`translate(${localPos[k].x},${localPos[k].y})`);}redrawEdgesOnly();renderMini();});
      g.addEventListener('pointerup',event=>{if(!pDrag||pDrag.id!==id)return;const d=pDrag;pDrag=null;if(d.moved){const next=Object.fromEntries(Object.keys(d.orig).map(k=>[k,{...localPos[k]}]));saveLayoutMixed(next).then(()=>record('移动',()=>setLayout(d.orig),()=>setLayout(next))).catch(e=>notice(e.message,true));drawCanvas();}else{if(event.shiftKey||event.ctrlKey||event.metaKey){selection.has(id)?selection.delete(id):selection.add(id);}else selection=new Set([id]);selectedEdge=null;selectedFeed=null;updateHint();drawCanvas();}});
      g.addEventListener('dblclick',event=>{event.stopPropagation();if(event.target.closest?.('.tc-pnode-titlehit'))startProviderRename(id);});
      g.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();providerMenu(id,event);});
      g.addEventListener('keydown',event=>{if(event.target!==g)return;if(event.key==='F2'||event.key==='Enter'){event.preventDefault();startProviderRename(id);}else if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();event.stopPropagation();deleteProvider(id);}});
      layer.append(g);}if(keepId&&!providersOf()[keepId])keepEl.remove();}
  async function moveProvider(id,p){localPos[id]=p;await api('portProviderMove',{nodes:{[id]:p}});drawCanvas();}
  function drawFeeds(){const layer=pLayer('tc-feeds','tc-nodes'),pos=positions(canvasNodes()),ppos=providerPos();layer.replaceChildren();
    const vias=[];for(const f of feedsOf()){const ends=feedEnds(f,pos,ppos);if(!ends)continue;const vp=viaOf(f),d=vp.length?viaPath(ends.a,vp,ends.b):spline(ends.a,'right',ends.b,'left'),sel=selectedFeed===f.id,color=PORT_COLORS[f.port]||'#888';if(vp.length)vias.push([f,ends]);
      const path=svg('path',{d,'data-fid':f.id,class:'tc-feed'+(sel?' selected':'')+(f.mode==='override'?' override':'')+(isBypassed(f.from)?' bypassed':'')});path.style.setProperty('--port-color',color);
      const hit=svg('path',{d,'data-fid':f.id,class:'tc-edge-hit tc-feed-hit'});const t=svg('title');t.textContent=`${feedLabel(f)} → ${memberName(baseOf(f.to))} 的「${pcat().ports?.[f.port]?.label||f.port}」口`;hit.append(t);
      hit.addEventListener('click',event=>{event.stopPropagation();selectFeed(sel?null:f.id);});hit.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();feedMenu(f,event);});hit.addEventListener('dblclick',event=>{event.preventDefault();event.stopPropagation();addVia(f,event);});
      layer.append(path,hit);}
    for(const [f,ends] of vias)drawVia(layer,f,ends);
    drawAdhoc(layer,pos);}
  /** AI 临时拉人协作（没有画好的连线）：10 分钟内的用虚线，越旧越淡。 */
  function drawAdhoc(layer,pos){const now=Date.now(),seen=new Set();for(const e of [...(pstate().events||[])].reverse()){if(e.kind!=='adhoc')continue;const age=now-Date.parse(e.at||0);if(!(age<600000))break;const k=[e.from,e.to].sort().join('|');if(seen.has(k))continue;seen.add(k);const a=pos[e.from],b=pos[e.to];if(!a||!b)continue;
      const p=svg('path',{d:edgePath(a,b,'peer'),class:'tc-adhoc'});p.style.opacity=String(Math.max(.15,1-age/600000));const t=svg('title');t.textContent=`${memberName(e.from)} 临时拉 ${memberName(e.to)} 协作：${e.text||''}`;p.append(t);layer.append(p);}}
  function selectFeed(id){selectedFeed=id;selectedEdge=null;selection.clear();updateHint();lastCanvasSig='';drawCanvas();}
  async function unfeed(list){list=[].concat(list).filter(Boolean);if(!list.length)return;try{await act('portUnfeed',{id:list.map(f=>f.id)});record('断开接口',async()=>{for(const f of list)await api('portFeed',{from:f.from,to:f.to,port:f.port,out:f.out,mode:f.mode});},()=>api('portUnfeed',{id:list.map(f=>f.id)}));}catch{}selectedFeed=null;updateHint();}
  function feedMenu(f,event,all){if(!f)return;selectFeed(f.id);const list=pcat().ports?.[f.port]?.kind==='list',items=[{head:`${feedLabel(f)} → ${memberName(baseOf(f.to))}（${pcat().ports?.[f.port]?.label||f.port}）`}];
    if(list)items.push({label:f.mode==='override'?'改成「合并」：和成员自己的设置合在一起':'改成「覆盖」：只用接进来的',run:async()=>{const m0=f.mode;try{await act('portFeedMode',{id:f.id,mode:m0==='override'?'merge':'override'});record('切换覆盖 / 合并',()=>api('portFeedMode',{id:f.id,mode:m0}),()=>api('portFeedMode',{id:f.id,mode:m0==='override'?'merge':'override'}));}catch{}}});
    items.push('-',{label:all&&all.length>1?`断开这一口的 ${all.length} 根线`:'断开',key:'Del',danger:true,run:()=>unfeed(all&&all.length>1?all:[f])});showMenu(event.clientX,event.clientY,items);}
  function providerMenu(id,event){const p=providersOf()[id];if(!p)return;selection=new Set([id]);selectedFeed=null;selectedEdge=null;updateHint();drawCanvas();const mine=feedsOf().filter(f=>f.from===id);
    showMenu(event.clientX,event.clientY,[{head:`${pcat().providers?.[p.type]?.label||p.type}「${p.name}」`},{label:'重命名',key:'F2',run:()=>startProviderRename(id)},...(p.type==='board'?[{label:'查看全部记录',run:()=>openProviderPanel(id)}]:[]),...(p.type==='board'?[{label:'清空看板',run:()=>act('portBoardClear',{id}).catch(()=>{}),disabled:!(pstate().board?.[id]||[]).length}]:[]),{label:'断开所有接线',run:()=>unfeed(mine),disabled:!mine.length},{label:isCollapsed(id)?'展开':'折叠',key:'Alt+C',run:()=>toggleCollapse([id])},{label:p.bypass?'恢复（取消跳过）':'跳过（Bypass）',key:'Ctrl+B',run:()=>toggleBypass([id])},{label:'复制',key:'Ctrl+C',run:()=>copySelection()},{label:'复制节点',key:'Ctrl+D',run:()=>duplicateNodes([id])},'-',{label:'删除节点',key:'Del',danger:true,run:()=>deleteProvider(id)}]);}
  async function addProvider(type,at){const p=at?{x:Math.round(at.x),y:Math.round(at.y)}:freeSpot();try{const r=await act('portProvider',{type,...p});localPos[r.id]=p;record('添加节点',()=>api('portProviderDelete',{id:r.id}),()=>api('portProvider',{type,...p}));drawCanvas();selection=new Set([r.id]);const open=(k=0)=>{const q=providersOf()[r.id];if(q){drawCanvas();const w=pWidgets(r.id,q)[0];if(w&&(w.kind==='area'||w.kind==='text'))editPWidget(r.id,w);}else if(k<40)setTimeout(()=>open(k+1),50);};open();return r.id;}catch{return null;}}
  async function deleteProvider(id){const p=providersOf()[id];if(!p)return;try{const r=await act('portProviderDelete',{id});delete localPos[id];selection.delete(id);if(provPanel?.id===id)closeProviderPanel();
      record('删除节点',async()=>{const n=await api('portProvider',{type:p.type,name:p.name,x:p.x,y:p.y,config:p.config});for(const f of r.removed?.feeds||[])await api('portFeed',{from:n.id,to:f.to,port:f.port,mode:f.mode});},()=>{});}catch{}updateHint();drawCanvas();}
  // 从提供节点或成员输出口拖线：放到成员上就接进对应的口；单线口已有线时替换
  function fwireStart(w,event){const pos=w.provider?providerPos()[w.from]:positions(canvasNodes())[w.from];if(!pos)return;fwire={...w,ax:pos.x+w.a.x,ay:pos.y+w.a.y,sx:event.clientX,sy:event.clientY,target:null,path:svg('path',{class:'tc-wire tc-fwire'})};fwire.path.style.setProperty('--port-color',PORT_COLORS[w.port]||'#888');
    $('tc-world').append(fwire.path);stageEl.classList.add('tc-wiring');try{canvasEl.setPointerCapture(event.pointerId);}catch{}selectedFeed=null;fwireMove(event);}
  function fwireMove(event){if(!fwire)return;const pt=toWorld(event.clientX,event.clientY),pos=positions(canvasNodes());let t=wireHit(pt,null);if(t&&fwire.owner&&baseOf(t)===baseOf(fwire.owner))t=null;let end=pt;
    if(t){const tp=pos[t],ry=rowY(t,fwire.port);end={x:tp.x,y:tp.y+(ry==null?NODE_H+2+portRows(t).length*PROW+PROW/2:ry)};}
    fwire.path.setAttribute('d',spline({x:fwire.ax,y:fwire.ay},'right',end,'left'));
    let multi=t&&selection.has(t)?multiTargets(t,[]):null;if(multi&&fwire.owner)multi=multi.filter(k=>baseOf(k)!==baseOf(fwire.owner));if(multi&&multi.length<2)multi=null;const key=t+'|'+(multi||[]).join(',');
    if(key!==fwire.tkey){fwire.tkey=key;for(const g of $('tc-nodes').querySelectorAll('.tc-node.wire-target'))g.classList.remove('wire-target');fwire.target=t;fwire.targets=multi;for(const k of multi||(t?[t]:[]))$('tc-nodes').querySelector(`[data-id="${CSS.escape(k)}"]`)?.classList.add('wire-target');}
    const srcs=feedSources(fwire),ppos=providerPos(),ends=[];for(const k of multi||(t?[t]:[])){const tp=pos[k],ry=rowY(k,fwire.port);const e={x:tp.x,y:tp.y+(ry==null?NODE_H+2+portRows(k).length*PROW+PROW/2:ry)};for(const sid of srcs){const a=sid===fwire.from?{x:fwire.ax,y:fwire.ay}:{x:ppos[sid].x+PW,y:ppos[sid].y+P_OUT_Y};if(sid===fwire.from&&k===t)continue;ends.push(spline(a,'right',e,'left'));}}
    if(!t)for(const sid of srcs)if(sid!==fwire.from)ends.push(spline({x:ppos[sid].x+PW,y:ppos[sid].y+P_OUT_Y},'right',pt,'left'));
    drawGhostWires(fwire,ends);}
  /** 从多选中的一个接口节点拖线：选中的接口节点一起接过去。 */
  function feedSources(w){if(!w.provider||!selection.has(w.from))return [w.from];const ps=[...selection].filter(k=>providersOf()[k]);return ps.length>1?ps:[w.from];}
  function fwireCancel(){const w=fwire;fwire=null;if(!w)return null;w.path.remove();drawGhostWires(w,null);stageEl.classList.remove('tc-wiring');for(const g of $('tc-nodes').querySelectorAll('.tc-node.wire-target'))g.classList.remove('wire-target');return w;}
  async function fwireEnd(){const w=fwireCancel();if(!w||!w.target){drawCanvas();return;}const srcs=feedSources(w),tgts=w.targets||[w.target];
    if(srcs.length>1||tgts.length>1){const cat=pcat(),done=[];for(const sid of srcs)for(const k of tgts){const input={from:sid,to:k,port:w.provider?(cat.providers?.[providersOf()[sid]?.type]?.port||w.port):w.port,...(w.out?{out:w.out}:{})};try{const r=await api('portFeed',input);done.push({input,id:r.feed?.id,old:r.replaced||[]});}catch(e){notice(e.message,true);}}
      if(done.length){record(`接线 ×${done.length}`,async()=>{for(const d of [...done].reverse()){if(d.id)await api('portUnfeed',{id:d.id});for(const f of d.old)await api('portFeed',{from:f.from,to:f.to,port:f.port,out:f.out,mode:f.mode});}},async()=>{for(const d of done)await api('portFeed',d.input);});notice(`已接 ${done.length} 根线`);}
      lastCanvasSig='';drawCanvas();return;}
    const input={from:w.from,to:w.target,port:w.port,...(w.out?{out:w.out}:{})};
    try{const r=await act('portFeed',input),old=r.replaced||[];record('接线',async()=>{await api('portUnfeed',{id:r.feed.id});for(const f of old)await api('portFeed',{from:f.from,to:f.to,port:f.port,out:f.out,mode:f.mode});},()=>api('portFeed',input));}catch{}lastCanvasSig='';drawCanvas();}
  canvasEl.addEventListener('pointermove',event=>{if(fwire)fwireMove(event);});
  canvasEl.addEventListener('pointerup',event=>{if(fwire)void fwireEnd();});
  document.addEventListener('keydown',event=>{if(page!=='canvas'||event.target.closest?.('input,textarea,select'))return;
    if(fwire&&event.key==='Escape'){event.preventDefault();fwireCancel();drawCanvas();return;}
    if((event.key==='Delete'||event.key==='Backspace')&&selectedFeed){event.preventDefault();event.stopImmediatePropagation();const f=feedsOf().find(x=>x.id===selectedFeed);void unfeed(f?[f]:[]).then(()=>drawCanvas());return;}
    if((event.key==='Delete'||event.key==='Backspace')&&selection.size){const ps=[...selection].filter(id=>providersOf()[id]);if(!ps.length)return;for(const id of ps){selection.delete(id);void deleteProvider(id);}if(!selection.size){event.preventDefault();event.stopImmediatePropagation();}}},true);
  canvasEl.addEventListener('pointerdown',event=>{if(event.button!==0||!selectedFeed)return;if(event.target.closest?.('.tc-pnode,.tc-feed-hit,.tc-prow'))return;selectedFeed=null;lastCanvasSig='';});
  // ---------- 提供节点的编辑面板（复用成员「更多」的表单） ----------
  function closeProviderPanel(){if(!provPanel)return;provPanel.box.remove();provPanel=null;}
  function openProviderPanel(id){const p=providersOf()[id];if(!p)return;closeProviderPanel();closeMorePanel?.();closeMenus();const c=p.config||{},type=p.type;
    const box=el('div',null,'tc-morepanel tc-wedit tc-provpanel'),head=el('div',null,'tc-morepanel-head'),x=el('button','✕','tc-icon-btn');x.type='button';x.onclick=()=>closeProviderPanel();head.append(el('span',(pcat().providers?.[type]?.label||type)+' · 接到成员的「'+(pcat().ports?.[pcat().providers?.[type]?.port]?.label||'')+'」口','tc-morepanel-title'),x);
    const body=el('div',null,'tc-morepanel-body'),name=el('input');name.type='text';name.maxLength=40;name.value=p.name;const nl=el('label',null,'tc-field');nl.append(el('span','名称'),name);body.append(nl);
    let read=()=>({});const area=(label,val,ph,rows=4,max=4000)=>{const t=el('textarea');t.rows=rows;t.value=val||'';t.placeholder=ph||'';t.maxLength=max;t.spellcheck=false;const l=el('label',null,'tc-field');l.append(el('span',label),t);body.append(l);return t;};
    const fromCustom=(fake,secs,keys)=>{const ed=customEditor(fake,{open:true});for(const d of ed.root.querySelectorAll('[data-sec]'))if(!secs.includes(d.dataset.sec))d.remove();if(type==='perm'){const tb=ed.root.querySelector('[data-k="tools"]');tb?.previousElementSibling?.remove();tb?.remove();}if(type==='tools'){for(const k of ['writeScope','confirm']){const n=ed.root.querySelector(`[data-k="${k}"]`);if(!n)continue;if(n.tagName==='DIV'){n.previousElementSibling?.remove();n.remove();}else n.closest('label')?.remove();}}body.append(ed.root);return ()=>{const all=ed.read();return Object.fromEntries(keys.map(k=>[k,all[k]??null]));};};
    if(type==='persona')read=fromCustom({goal:c.goal,backstory:c.backstory},['prompt'],['goal','backstory']);
    else if(type==='perm')read=fromCustom({writeScope:c.writeScope,confirm:c.confirm},['tools'],['writeScope','confirm']);
    else if(type==='tools'){read=fromCustom({tools:c.tools||[]},['tools'],['tools']);}
    else if(type==='model'){const sel=el('select');sel.append(new Option('（选一个模型）',''));for(const m of catalogModels())sel.append(new Option(`${m.name||m.id} · ${modelGroup(m)}`,modelValue(m)));sel.value=modelValue(c.model);const l=el('label',null,'tc-field');l.append(el('span','模型'),sel);body.append(l);const r2=fromCustom({reasoningEffort:c.reasoningEffort,temperature:c.temperature,maxOutputTokens:c.maxOutputTokens,fallbackModel:c.fallbackModel},['model'],['reasoningEffort','temperature','maxOutputTokens','fallbackModel']);read=()=>{let model=null;try{model=sel.value?JSON.parse(sel.value):null;}catch{}if(!model)throw Error('先选一个模型。');return {model,...r2()};};}
    else if(type==='workspace'){const t=el('input');t.type='text';t.value=c.dir&&c.dir!=='.'?c.dir:'';t.placeholder='项目内的目录，例如 packages/web；留空 = 项目根目录';const l=el('label',null,'tc-field');l.append(el('span','目录'),t);body.append(l,el('div','接了同一个工作区的成员共用这个目录：一位成员在改的文件，别人 10 分钟内写不进去，会被提示去协调。没接「权限」节点时，写入范围也收窄到这个目录。','tc-provpanel-hint'));read=()=>({dir:t.value.trim()||'.'});}
    else if(type==='doc'){const t=area('内容',c.text,'接口约定、需求说明、示例…',6,8000),ps=area('文件（每行一个，项目内相对路径）',(c.paths||[]).join('\n'),'docs/api.md',3);read=()=>({text:t.value,paths:ps.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)});}
    else if(type==='rules'){const t=area('规范',c.text,'代码风格、提交前要跑的检查、交付格式…',6);read=()=>({text:t.value});}
    else if(type==='board'){const t=el('input');t.type='text';t.value=c.topic||'';t.maxLength=200;t.placeholder='这块看板记什么（可选）';const l=el('label',null,'tc-field');l.append(el('span','主题'),t);body.append(l);const list=el('div',null,'tc-board-list'),entries=(pstate().board?.[id]||[]).slice(-40).reverse();if(!entries.length)list.append(el('div','还没有内容。成员回复里写「#看板 …」会记到这里。','tc-provpanel-hint'));for(const e of entries){const r=el('div',null,'tc-board-row');r.append(el('span',memberName(e.by),'tc-board-by'),el('span',e.text,'tc-board-text'),el('span',shortTime(e.at),'tc-board-at'));list.append(r);}body.append(el('div','看板内容','tc-cust-h'),list);read=()=>({topic:t.value});}
    const users=feedsOf().filter(f=>f.from===id).map(f=>memberName(baseOf(f.to)));body.append(el('div',users.length?'已接给：'+[...new Set(users)].join('、'):'还没接给任何成员：从节点右侧的圆点拖到成员上。','tc-provpanel-hint'));
    const foot=el('div',null,'tc-morepanel-foot'),err=el('span','','tc-morepanel-err'),cancel=el('button','取消','tc-ghost'),save=el('button','保存','tc-primary');cancel.type='button';save.type='button';cancel.onclick=()=>closeProviderPanel();
    save.onclick=async()=>{err.textContent='';let config;try{config=read();}catch(e){err.textContent=e.message;return;}const before={name:p.name,config:p.config};save.disabled=true;try{await api('portProvider',{id,name:name.value,config});record('编辑节点',()=>api('portProvider',{id,...before}),()=>api('portProvider',{id,name:name.value,config}));closeProviderPanel();}catch(e){err.textContent=e.message;}finally{save.disabled=false;}};
    foot.append(err,el('span',null,'tc-grow'),cancel,save);box.append(head,body,foot);
    for(const t of ['pointerdown','mousedown','click','dblclick','contextmenu','wheel'])box.addEventListener(t,ev=>ev.stopPropagation());
    box.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.isComposing)return;if(ev.key==='Escape'){ev.preventDefault();closeProviderPanel();}else if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();save.click();}});box.addEventListener('keyup',ev=>ev.stopPropagation());
    document.body.append(box);provPanel={id,box};const g=document.querySelector(`#tc-pnodes [data-pid="${CSS.escape(id)}"]`),r=g?g.getBoundingClientRect():{left:80,right:80,top:80},w=box.offsetWidth||340,h=Math.min(560,innerHeight-16);let left=r.right+10;if(left+w>innerWidth-8)left=Math.max(8,r.left-w-10);box.style.left=Math.round(left)+'px';box.style.maxHeight=h+'px';box.style.top=Math.round(Math.max(8,Math.min(r.top,innerHeight-8-Math.min(h,box.offsetHeight||h))))+'px';setTimeout(()=>body.querySelector('textarea,select,input:not([type=checkbox])')?.focus(),0);}
  function shortTime(iso){const d=new Date(iso);if(isNaN(d))return '';const p=n=>String(n).padStart(2,'0');return `${p(d.getHours())}:${p(d.getMinutes())}`;}
  // ---------- 协作演出：新事件的光点、气泡、节点闪一下 ----------
  function evEndpoints(e,pos,ppos){const at=id=>{if(!id)return null;if(id==='user'){const r=canvasEl.getBoundingClientRect();return toWorld(r.left+r.width/2,r.top+8);}if(ppos[id])return {x:ppos[id].x+PW/2,y:ppos[id].y+ppos[id].h/2};const p=pos[id];return p?{x:p.x+NODE_W/2,y:p.y+TITLE_H/2}:null;};return [at(e.from),at(e.to)];}
  function playEvent(e,quick){if(!motionOK())return;const pos=positions(canvasNodes()),ppos=providerPos(),[a,b]=evEndpoints(e,pos,ppos);if(!a||!b)return;const layer=pLayer('tc-evfx'),color=EV_COLORS[e.kind]||'#888',dur=quick?600:1100;
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,bend=Math.min(80,len*.25),mx=(a.x+b.x)/2-dy/len*bend,my=(a.y+b.y)/2+dx/len*bend,d=`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    const trail=svg('path',{d,class:'tc-ev-trail'+(e.kind==='adhoc'?' adhoc':'')});trail.style.stroke=color;layer.append(trail);
    const dot=svg('circle',{r:6,class:'tc-ev-dot'});dot.style.fill=color;layer.append(dot);
    const label=svg('g',{class:'tc-ev-label'});const tx=svg('text',{x:0,y:4,'text-anchor':'middle'});tx.textContent=(EV_LABELS[e.kind]||e.kind)+(e.text?' · '+cut(e.text,24):'');const bg=svg('rect',{rx:8,height:20,y:-11});bg.style.fill=color;label.append(bg,tx);layer.append(label);
    try{const w=Math.min(260,tx.getComputedTextLength()+18);bg.setAttribute('width',w);bg.setAttribute('x',-w/2);}catch{bg.setAttribute('width',120);bg.setAttribute('x',-60);}
    const t0=performance.now(),q=(t,p0,p1,p2)=>(1-t)*(1-t)*p0+2*(1-t)*t*p1+t*t*p2;
    const step=now=>{const t=Math.min(1,(now-t0)/dur),k=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,x=q(k,a.x,mx,b.x),y=q(k,a.y,my,b.y);dot.setAttribute('cx',x);dot.setAttribute('cy',y);label.setAttribute('transform',`translate(${q(.5,a.x,mx,b.x)},${q(.5,a.y,my,b.y)-14})`);if(t<1)requestAnimationFrame(step);else{dot.remove();trail.classList.add('out');label.classList.add('out');setTimeout(()=>{trail.remove();label.remove();},quick?700:2400);
        for(const id of [e.to,e.kind==='conflict'?e.from:null]){if(!id)continue;const n=$('tc-nodes').querySelector(`[data-member="${CSS.escape(id)}"]`)||$('tc-pnodes')?.querySelector(`[data-pid="${CSS.escape(id)}"]`);if(n){n.classList.remove('tc-ev-hit');void n.getBBox?.();n.style.setProperty('--ev-color',color);n.classList.add('tc-ev-hit');setTimeout(()=>n.classList.remove('tc-ev-hit'),900);}}}};
    requestAnimationFrame(step);}
  function eventsTick(){const list=pstate().events||[],ws=data.workspaceId||'';if(!evSeen||evSeen.ws!==ws){evSeen={ws,ids:new Set(list.map(e=>e.id))};return;}const fresh=list.filter(e=>!evSeen.ids.has(e.id));for(const e of list)evSeen.ids.add(e.id);if(fresh.length)setTimeout(collabNotify,0);if(evReplay)return;fresh.slice(-8).forEach((e,i)=>setTimeout(()=>playEvent(e,fresh.length>3),i*260));}
  // ---------- 协作记录：显示在右侧「活动 › 协作」里，这里只提供数据、点播和回放 ----------
  const collabSubs=new Set(),collabNotify=()=>{for(const f of collabSubs){try{f();}catch{}}};
  function evText(e){const who=x=>x==='user'?'你':providersOf()[x]?.name||memberName(x);return `${who(e.from)} → ${who(e.to)}`;}
  function startReplay(){const list=(pstate().events||[]).slice(-200);stopReplay(true);if(!list.length)return;evReplay={list,i:0,timer:null};const tick=()=>{if(!evReplay)return;const e=evReplay.list[evReplay.i];if(!e){stopReplay();return;}playEvent(e,true);evReplay.i++;collabNotify();evReplay.timer=setTimeout(tick,700);};collabNotify();tick();}
  function stopReplay(quiet){if(evReplay?.timer)clearTimeout(evReplay.timer);const was=!!evReplay;evReplay=null;if(was&&!quiet)collabNotify();}
  window.__ocCanvas.collab={events:()=>(pstate().events||[]).slice(-200),label:k=>EV_LABELS[k]||k,color:k=>EV_COLORS[k]||'#888',who:e=>evText(e),time:iso=>shortTime(iso),
    play:e=>{playEvent(e);const id=e.to&&!providersOf()[e.to]&&e.to!=='user'?e.to:e.from;if(id&&onCanvas(id))window.__ocCanvas.selectMember(id);},
    toggleReplay:()=>evReplay?stopReplay():startReplay(),replaying:()=>evReplay?{i:evReplay.i,n:evReplay.list.length,id:evReplay.list[Math.max(0,evReplay.i-1)]?.id}:null,
    seek:i=>{if(evReplay)evReplay.i=Math.max(0,Math.min(evReplay.list.length-1,i));},subscribe:f=>{collabSubs.add(f);return ()=>collabSubs.delete(f);}};
  function drawPortsLayer(){drawGroups();drawProviders();drawFeeds();eventsTick();}
  const portsSig=()=>{const s=pstate();return [s.providers,s.feeds,Object.fromEntries(Object.entries(s.board||{}).map(([k,v])=>[k,v.length])),s.ports,(s.events||[]).at(-1)?.id||'',selectedFeed,team().groups||null,gSel,team().collapsed||null];};

  // ---------- 双击空白处 / 连线松在空白处：搜索成员并加到这里（ComfyUI 节点搜索） ----------
  var searchEl=null,search=null;
  function openSearch(cx,cy,pendingWire,atWorld){closeMenus();const at=atWorld||toWorld(cx,cy);search={at,wire:pendingWire,index:0,rows:[]};
    const box=el('div',null,'tc-search');box.setAttribute('role','dialog');box.setAttribute('aria-label','搜索成员');
    const input=el('input');input.type='search';input.className='tc-search-input';input.placeholder=pendingWire?'搜索成员，选中后加到这里并连上':'搜索成员，加到这里';input.setAttribute('aria-label','搜索成员');
    const list=el('div',null,'tc-search-list');list.setAttribute('role','listbox');box.append(input,list);
    box.addEventListener('pointerdown',e=>e.stopPropagation());box.addEventListener('dblclick',e=>e.stopPropagation());box.addEventListener('contextmenu',e=>e.stopPropagation());
    input.addEventListener('input',()=>{search.index=0;drawSearch();});
    input.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='ArrowDown'){e.preventDefault();search.index=Math.min(search.rows.length-1,search.index+1);drawSearch();}else if(e.key==='ArrowUp'){e.preventDefault();search.index=Math.max(0,search.index-1);drawSearch();}else if(e.key==='Enter'){e.preventDefault();search.rows[search.index]?.run();}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenus();}});
    document.body.append(box);searchEl=box;drawSearch();placePop(box,cx,cy);setTimeout(()=>input.focus(),0);}
  function drawSearch(){if(!searchEl||!search)return;const q=searchEl.querySelector('input').value.trim().toLowerCase(),list=searchEl.querySelector('.tc-search-list');list.replaceChildren();search.rows=[];
    const rest=members().filter(m=>!q||[m.name,roleName(m.roleId),shortModel(m)].some(s=>String(s).toLowerCase().includes(q)));rest.sort((x,y)=>onCanvas(x.id)-onCanvas(y.id));/* collab-employee: 已在画布上的成员也能再放一个（排在还没上画布的成员后面） */
    const add=(node,run)=>{const i=search.rows.length;node.classList.toggle('active',i===search.index);node.setAttribute('role','option');node.addEventListener('mousedown',e=>e.preventDefault());node.addEventListener('mouseenter',()=>{search.index=i;for(const [k,r] of search.rows.entries())r.node.classList.toggle('active',k===i);});node.onclick=run;list.append(node);search.rows.push({node,run});};
    for(const m of rest){const row=el('div',null,'tc-search-item');const t=el('span',null,'tc-addpop-text');t.append(el('span',m.name,'tc-addpop-name'),el('span',roleName(m.roleId)+' · '+shortModel(m)+(onCanvas(m.id)?' · 已在画布，再放一个':''),'tc-addpop-sub'));row.append(avatar(m.id,true),t);add(row,()=>placeFromSearch(m.id));}
    if(!rest.length)list.append(el('div',members().length?'没有匹配的成员':'还没有成员','tc-search-empty'));
    const n=el('div','＋ 新建成员…','tc-search-item tc-search-new');add(n,()=>{closeMenus();editMember(null,true);});
    if(search.index>=search.rows.length)search.index=Math.max(0,search.rows.length-1);search.rows[search.index]?.node.classList.add('active');search.rows[search.index]?.node.scrollIntoView({block:'nearest'});}
  // 双击空白处：仿 ComfyUI 的节点搜索框。成员和节点在同一个列表里，右边标分类，停在哪一项就预览哪一项
  function openAddPop(cx,cy,atWorld){closeMenus();const at=atWorld||toWorld(cx,cy);search={at,wire:null,index:0,rows:[],cat:'all'};
    const box=el('div',null,'tc-search tc-nsearch');box.setAttribute('role','dialog');box.setAttribute('aria-label','添加成员或节点');
    for(const t of ['pointerdown','dblclick','contextmenu','wheel'])box.addEventListener(t,e=>e.stopPropagation());
    const input=el('input');input.type='search';input.className='tc-search-input tc-nsearch-input';input.placeholder='搜索成员或节点…';input.setAttribute('aria-label','搜索成员或节点');
    const tabs=el('div',null,'tc-nsearch-tabs');tabs.setAttribute('role','tablist');
    for(const [k,t] of [['all','全部'],['member','成员'],['node','节点']]){const b=el('button',t,'tc-nsearch-tab');b.type='button';b.dataset.cat=k;b.setAttribute('role','tab');b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=()=>{search.cat=k;search.index=0;drawAddPop();input.focus();};tabs.append(b);}
    const bodyEl=el('div',null,'tc-nsearch-body'),list=el('div',null,'tc-search-list tc-nsearch-list');list.setAttribute('role','listbox');const prev=el('div',null,'tc-nsearch-preview');bodyEl.append(list,prev);
    const foot=el('div','↑↓ 选择　Enter 添加　Tab 切换分类　Esc 关闭','tc-nsearch-foot');
    box.append(input,tabs,bodyEl,foot);
    input.addEventListener('input',()=>{search.index=0;drawAddPop();});
    input.addEventListener('keydown',e=>{if(e.isComposing)return;const n=search.rows.length;
      if(e.key==='ArrowDown'){e.preventDefault();search.index=n?(search.index+1)%n:0;drawAddPop(true);}
      else if(e.key==='ArrowUp'){e.preventDefault();search.index=n?(search.index-1+n)%n:0;drawAddPop(true);}

      else if(e.key==='Enter'){e.preventDefault();search.rows[search.index]?.run();}
      else if(e.key==='Tab'){e.preventDefault();const c=['all','member','node'];search.cat=c[(c.indexOf(search.cat)+(e.shiftKey?2:1))%3];search.index=0;drawAddPop();}
      else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenus();}});
    document.body.append(box);searchEl=box;drawAddPop();placePop(box,cx,cy);setTimeout(()=>input.focus(),0);}
  function addPopEntries(){const ports=pcat().ports||{},out=[];
    for(const m of members())out.push({kind:'member',key:m.id,name:m.name,sub:roleName(m.roleId)+' · '+shortModel(m),tag:'成员',on:onCanvas(m.id),m,run:()=>placeFromSearch(m.id)});
    for(const [type,p] of Object.entries(pcat().providers||{})){const port=ports[p.port]||{};out.push({kind:'node',key:type,name:p.label,sub:'接到成员的「'+(port.label||p.port)+'」接口',hint:port.hint||'',color:PORT_COLORS[p.port]||'#888',portLabel:port.label||p.port,tag:'节点',run:()=>{const s=search;closeMenus();if(s)addProvider(type,{x:Math.round(s.at.x-PW/2),y:Math.round(s.at.y-PH/2)});}});}
    return out;}
  function markText(text,q){const span=el('span',null,'tc-nsearch-name');const s=String(text),i=q?s.toLowerCase().indexOf(q):-1;if(i<0){span.textContent=s;return span;}span.append(document.createTextNode(s.slice(0,i)),el('mark',s.slice(i,i+q.length)),document.createTextNode(s.slice(i+q.length)));return span;}
  function drawAddPop(keepScroll){if(!searchEl||!search||!searchEl.classList.contains('tc-nsearch'))return;const q=searchEl.querySelector('input').value.trim().toLowerCase(),list=searchEl.querySelector('.tc-nsearch-list'),prev=searchEl.querySelector('.tc-nsearch-preview');
    for(const b of searchEl.querySelectorAll('.tc-nsearch-tab'))b.setAttribute('aria-selected',String(b.dataset.cat===search.cat));
    const score=x=>{if(!q)return 0;const n=x.name.toLowerCase();if(n.startsWith(q))return 0;if(n.includes(q))return 1;if([x.sub,x.tag,x.hint].some(s=>String(s||'').toLowerCase().includes(q)))return 2;return -1;};
    let rows=addPopEntries().filter(x=>search.cat==='all'||x.kind===search.cat).map(x=>({x,s:score(x)})).filter(r=>r.s>=0);
    rows.sort((a,b)=>a.s-b.s||(a.x.kind===b.x.kind?0:a.x.kind==='member'?-1:1)||(a.x.on?1:0)-(b.x.on?1:0));
    list.replaceChildren();search.rows=[];let lastKind=null;
    for(const {x} of rows){if(!q&&search.cat==='all'&&x.kind!==lastKind){list.append(el('div',x.kind==='member'?'成员':'节点','tc-nsearch-group'));lastKind=x.kind;}
      const i=search.rows.length,row=el('div',null,'tc-search-item tc-nsearch-item');row.dataset.kind=x.kind;row.setAttribute('role','option');
      const icon=x.kind==='member'?avatar(x.m.id,true):el('span',null,'tc-nsearch-dot');if(x.kind==='node')icon.style.background=x.color;
      const t=el('span',null,'tc-nsearch-text');t.append(markText(x.name,q),el('span',x.sub+(x.on?' · 已在画布，再放一个':''),'tc-nsearch-sub'));
      const tag=el('span',x.kind==='node'?x.portLabel:x.tag,'tc-nsearch-tag');if(x.kind==='node')tag.style.setProperty('--tag',x.color);
      row.append(icon,t,tag);row.addEventListener('mousedown',e=>e.preventDefault());row.addEventListener('mouseenter',()=>{search.index=i;markActive();});row.onclick=()=>x.run();list.append(row);search.rows.push({node:row,run:x.run,x});}
    if(!rows.length)list.append(el('div',q?'没有匹配「'+q+'」的成员或节点':'这里还没有可添加的内容','tc-search-empty'));
    if(search.cat!=='node'){const n=el('div','＋ 新建成员…','tc-search-item tc-search-new tc-nsearch-item');n.dataset.kind='new';const i=search.rows.length,run=()=>{closeMenus();editMember(null,true);};n.addEventListener('mousedown',e=>e.preventDefault());n.addEventListener('mouseenter',()=>{search.index=i;markActive();});n.onclick=run;list.append(n);search.rows.push({node:n,run,x:{kind:'new'}});}
    if(search.index>=search.rows.length)search.index=Math.max(0,search.rows.length-1);
    function markActive(){for(const [k,r] of search.rows.entries())r.node.classList.toggle('active',k===search.index);const r=search.rows[search.index];if(r){r.node.scrollIntoView({block:'nearest'});drawPreview(prev,r.x);}else prev.replaceChildren();}
    markActive();if(!keepScroll&&!search.index)list.scrollTop=0;}
  function drawPreview(prev,x){prev.replaceChildren();if(!x)return;const card=el('div',null,'tc-nprev-card');
    if(x.kind==='member'){const h=el('div',null,'tc-nprev-head');h.append(avatar(x.m.id,true),el('span',x.m.name,'tc-nprev-title'));card.append(h);
      const kv=(k,v)=>{const r=el('div',null,'tc-nprev-row');r.append(el('span',k),el('b',v));card.append(r);};kv('岗位',roleName(x.m.roleId));kv('模型',shortModel(x.m));
      const ports=el('div',null,'tc-nprev-ports');ports.append(el('span','● 上级　● 协作','tc-nprev-in'),el('span','下级 ●　协作 ●','tc-nprev-out'));card.append(ports);
      prev.append(card,el('div',x.on?'已经在画布上了，会再放一个同一位成员的节点。':'放到双击的位置。','tc-nprev-note'));}
    else if(x.kind==='node'){const h=el('div',null,'tc-nprev-head tc-nprev-nodehead');h.style.setProperty('--tag',x.color);h.append(el('span',x.name,'tc-nprev-title'));card.append(h);
      const r=el('div',null,'tc-nprev-row');r.append(el('span','接到'),el('b','成员的「'+x.portLabel+'」接口'));card.append(r);if(x.hint)card.append(el('div',x.hint,'tc-nprev-hint'));
      const o=el('div',null,'tc-nprev-ports');o.append(el('span','','tc-nprev-in'),el('span','输出 ●','tc-nprev-out'));card.append(o);
      prev.append(card,el('div','从它的输出口拖到成员身上，成员才会多出这个接口，并用这里的设置覆盖自己的。','tc-nprev-note'));}
    else prev.append(el('div','新建一位成员，建好后放到双击的位置。','tc-nprev-note'));}
  async function placeFromSearch(id){const s=search;closeMenus();if(!s)return;const w=s.wire,at=s.at;
    // 新节点的对应输入/输出槽对准松手的位置
    let p={x:at.x-NODE_W/2,y:at.y-TITLE_H/2};
    if(w){if(w.type==='manage')p={x:at.x,y:at.y-SLOT1};else if(w.type==='manage-up')p={x:at.x-NODE_W,y:at.y-SLOT1};else p=w.side==='right'?{x:at.x,y:at.y-SLOT2}:{x:at.x-NODE_W,y:at.y-SLOT2};}
    const key=await addToCanvas(id,p);if(!key||!w)return;
    const ok=w.type==='manage'?await addEdgeRec(w.id,key,'manage'):w.type==='manage-up'?await addEdgeRec(key,w.id,'manage'):await addEdgeRec(w.id,key,'peer');
    if(ok)mergeLast(2,'添加并连线');drawCanvas();updateHint();}
  canvasEl.addEventListener('dblclick',event=>{if(page!=='canvas'||event.target.closest('.tc-node,.tc-pnode,.tc-edge-hit,.tc-edge-dot,.tc-reroute,.tc-wedit'))return;event.preventDefault();const g=groupAt(toWorld(event.clientX,event.clientY));if(g){selectGroupNodes(g);return;}openAddPop(event.clientX,event.clientY);});
  document.addEventListener('pointerdown',event=>{if((menuEl&&!menuEl.contains(event.target))||(searchEl&&!searchEl.contains(event.target)))closeMenus();},true);
  window.addEventListener('blur',()=>{if(menuEl){menuEl.remove();menuEl=null;}});

  // ---------- 小地图 ----------
  var MINI_W=180,MINI_H=116,miniMap=null,miniFrozen=null;
  function renderMini(){const svgEl=$('tc-mini');if(!svgEl||page!=='canvas')return;const pos=positions(canvasNodes()),r=canvasEl.getBoundingClientRect(),vw={x:-view.x/view.k,y:-view.y/view.k,w:(r.width||800)/view.k,h:(r.height||500)/view.k};
    const items=Object.entries(pos),extra=aiRects();$('tc-minimap').hidden=!items.length&&!extra.length;if(!items.length&&!extra.length)return;
    const all=[...items.map(([,p])=>({x:p.x,y:p.y,w:NODE_W,h:p.h})),...extra];
    let x1=Math.min(vw.x,...all.map(p=>p.x)),y1=Math.min(vw.y,...all.map(p=>p.y)),x2=Math.max(vw.x+vw.w,...all.map(p=>p.x+p.w)),y2=Math.max(vw.y+vw.h,...all.map(p=>p.y+p.h));
    const pad=40;x1-=pad;y1-=pad;x2+=pad;y2+=pad;const k=Math.min(MINI_W/(x2-x1),MINI_H/(y2-y1)),ox=(MINI_W-(x2-x1)*k)/2,oy=(MINI_H-(y2-y1)*k)/2;miniMap={x1,y1,k,ox,oy};
    const g=$('tc-mini-nodes');g.replaceChildren();for(const [id,p] of items){const n=svg('rect',{x:ox+(p.x-x1)*k,y:oy+(p.y-y1)*k,width:Math.max(2,NODE_W*k),height:Math.max(2,p.h*k),rx:1.5,class:'tc-mini-node'+(selection.has(id)?' selected':'')});n.style.fill=colorOf(id);g.append(n);}
    for(const r of extra){const n=svg('rect',{x:ox+(r.x-x1)*k,y:oy+(r.y-y1)*k,width:Math.max(2,r.w*k),height:Math.max(2,r.h*k),rx:1.5,class:'tc-mini-ai'+(r.kind?' '+r.kind:'')});g.append(n);}
    const v=$('tc-mini-view');v.setAttribute('x',ox+(vw.x-x1)*k);v.setAttribute('y',oy+(vw.y-y1)*k);v.setAttribute('width',vw.w*k);v.setAttribute('height',vw.h*k);}
  function miniGo(event){const M=miniFrozen||miniMap;if(!M)return;const b=$('tc-mini').getBoundingClientRect(),wx=M.x1+(event.clientX-b.left-M.ox)/M.k,wy=M.y1+(event.clientY-b.top-M.oy)/M.k,r=canvasEl.getBoundingClientRect();view.x=r.width/2-wx*view.k;view.y=r.height/2-wy*view.k;applyView();saveView();}
  {const mm=$('tc-minimap');if(mm){let on=false;mm.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();on=true;mm.setPointerCapture(e.pointerId);miniFrozen=miniMap;miniGo(e);});mm.addEventListener('pointermove',e=>{if(on)miniGo(e);});const off=()=>{on=false;miniFrozen=null;renderMini();};mm.addEventListener('pointerup',off);mm.addEventListener('pointercancel',off);mm.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();},{passive:false});}}

  // ---------- 成员编辑（右侧抽屉） ----------
  function fillRoles(value){const select=$('tc-role');select.replaceChildren();for(const r of data.roles||[])if(r.id!=='observer')select.append(option(r.id,r.name));select.append(option('__new','＋ 新建岗位…'));select.value=value&&[...select.options].some(o=>o.value===value)?value:(select.options[0]?.value||'__new');$('tc-new-role').hidden=select.value!=='__new';}
  // 模型选择：和对话框的模型下拉一样，按供应商分组、顶部搜索、当前分类吸顶。
  let mp=null;
  function fillModels(value){$('tc-model').value=value||'';const list=catalogModels();let ref=null;try{ref=value?JSON.parse(value):null;}catch{}const hit=findModel(ref);
    $('tc-model-label').textContent=hit?hit.name||hit.id:ref?'当前不可用：'+ref.id:list.length?'选择模型':'没有可用模型，请先配置供应商';$('tc-model-group').textContent=hit?modelGroup(hit):'';$('tc-model-btn').classList.toggle('placeholder',!hit);}
  function closeModelPop(){mp=null;const pop=$('tc-model-pop');if(pop){pop.hidden=true;$('tc-model-btn').setAttribute('aria-expanded','false');}}
  function openModelPop(){if(!catalogModels().length){notice('没有可用模型，请先在对话框的模型下拉里「配置供应商」。',true);return;}mp={q:'',focus:-1,rows:[]};$('tc-model-search').value='';$('tc-model-pop').hidden=false;$('tc-model-btn').setAttribute('aria-expanded','true');drawModelList(true);setTimeout(()=>$('tc-model-search').focus(),0);}
  function drawModelList(reveal){if(!mp)return;const box=$('tc-model-list'),cur=$('tc-model').value,q=mp.q.trim().toLowerCase(),groups=new Map();box.replaceChildren();mp.rows=[];mp.heads=[];
    for(const x of catalogModels()){if(q&&![x.name,x.id,modelGroup(x)].some(s=>String(s||'').toLowerCase().includes(q)))continue;const g=modelGroup(x);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(x);}
    if(!groups.size){box.append(el('div','没有匹配的模型','tc-mpick-empty'));}
    for(const [g,list] of groups){const h=el('div',null,'tc-mpick-h');h.append(el('span',g),el('span',String(list.length),'tc-mpick-count'));box.append(h);mp.heads.push({el:h,label:g,count:list.length});
      for(const x of list){const v=modelValue(x),sel=v===cur,row=el('div',null,'tc-mpick-row'+(sel?' selected':''));row.setAttribute('role','option');row.setAttribute('aria-selected',String(sel));row.title=`${x.name||x.id} · ${g}\n${x.id}`;row.append(el('span',sel?'✓':'','tc-mpick-check'),el('span',x.name||x.id,'tc-mpick-name'));
        row.addEventListener('mousedown',e=>e.preventDefault());row.onclick=()=>pickModel(v);row.onmousemove=()=>focusModel(mp.rows.indexOf(row),false);box.append(row);mp.rows.push(row);if(sel&&mp.focus<0)mp.focus=mp.rows.length-1;}}
    if(mp.focus>=mp.rows.length)mp.focus=mp.rows.length-1;focusModel(mp.focus<0?0:mp.focus,reveal);updateModelTop();}
  function focusModel(i,reveal){if(!mp||!mp.rows.length)return;mp.focus=Math.max(0,Math.min(mp.rows.length-1,i));mp.rows.forEach((r,k)=>r.classList.toggle('focused',k===mp.focus));if(reveal)mp.rows[mp.focus].scrollIntoView({block:'nearest'});}
  function updateModelTop(){if(!mp)return;const box=$('tc-model-list'),top=$('tc-model-top');let current=null;for(const h of mp.heads){if(h.el.offsetTop<box.scrollTop)current=h;else break;}top.replaceChildren(el('span',current?current.label:'模型'),el('span',String(current?current.count:mp.rows.length),'tc-mpick-count'));top.onclick=current?()=>{box.scrollTop=current.el.offsetTop;}:null;top.classList.toggle('empty',!current);}
  function pickModel(v){fillModels(v);closeModelPop();$('tc-model-btn').focus();}
  $('tc-model-btn').onclick=()=>{if($('tc-model-pop').hidden)openModelPop();else closeModelPop();};
  $('tc-model-list').addEventListener('scroll',updateModelTop);
  $('tc-model-search').addEventListener('input',()=>{if(!mp)return;mp.q=$('tc-model-search').value;mp.focus=0;drawModelList(true);$('tc-model-list').scrollTop=0;updateModelTop();});
  $('tc-model-search').addEventListener('keydown',event=>{if(!mp||event.isComposing)return;if(event.key==='ArrowDown'){event.preventDefault();focusModel(mp.focus+1,true);}else if(event.key==='ArrowUp'){event.preventDefault();focusModel(mp.focus-1,true);}else if(event.key==='Enter'){event.preventDefault();const r=mp.rows[mp.focus];if(r)r.click();}else if(event.key==='Tab'){closeModelPop();}});
  var memberCustom=null;
  function syncKind(){const api=$('tc-kind').value==='api';memberCustom?.setKind($('tc-kind').value);$('tc-model-row').hidden=!api;if(!api)closeModelPop();$('tc-sub-box').hidden=!api;$('tc-sub-max-row').hidden=!$('tc-allow-sub').checked;}
  function drawSubList(){const box=$('tc-sub-list');box.replaceChildren();if(!editing)return;const list=subsOf(editing.id);if(!list.length){box.append(el('div','当前没有子代理','tc-note'));return;}
    for(const s of list){const row=el('div',null,'tc-sub-row');row.append(el('span',s.name,'tc-sub-name'),el('span',subLabels[s.status]||s.status,'tc-pill'));const del=el('button','删除','tc-danger-link');del.type='button';del.onclick=()=>act('teamDeleteSubagent',{subId:s.id},del).catch(()=>{});row.append(del);box.append(row);}
    if(list.length>1){const all=el('button','全部删除','tc-danger-link');all.type='button';all.onclick=()=>act('teamDeleteSubagent',{parentId:editing.id},all).catch(()=>{});box.append(all);}}
  function openEditor(member){editing=member||null;deleteArmed=false;placeAfterSave=false;closeModelPop();$('tc-delete').textContent='删除成员';$('tc-form').hidden=false;$('tc-editor-empty').hidden=true;$('tc-delete').hidden=!member;$('tc-dm').hidden=!member||member.kind!=='api';$('tc-editor-title').textContent=member?'编辑成员':'新成员';$('tc-name').value=member?.name||'';fillRoles(member?.roleId);$('tc-kind').value=member?.kind||'api';fillModels(modelValue(member?.model));$('tc-enabled').checked=member?member.enabled:true;$('tc-paths').value=(member?.allowedPaths||['.']).join('\n');$('tc-shell').checked=member?.allowShell===true;$('tc-delete').hidden=!member;$('tc-dm').hidden=!member||member.kind!=='api';$('tc-delete').textContent='删除成员';$('tc-role-name').value='';$('tc-role-duty').value='';
    const st=member?team().settings?.[member.id]||{}:{};$('tc-allow-sub').checked=st.allowSubagents===true;$('tc-sub-max').value=String(st.maxSubagents||3);memberCustom=customEditor(member,{open:false});$('tc-custom').replaceChildren(memberCustom.root);syncKind();drawSubList();pendingAvatar=undefined;syncEditorAvatar();setTimeout(()=>$('tc-name').focus(),0);}
  function closeEditor(){editing=null;$('tc-form').hidden=true;$('tc-editor-empty').hidden=false;if(page==='members')drawMembers();}
  function editMember(member,place){if(member&&member.memberId)member=members().find(x=>x.id===member.memberId)||member;if(member?.temporary){notice('临时成员是正在连接的 MCP 对话，断开后自动消失，不能编辑或删除。');return;}showPage('members');openEditor(member);placeAfterSave=!member&&!!place;drawMembers();}
  $('tc-add').onclick=()=>{openEditor(null);drawMembers();};document.addEventListener('pointerdown',event=>{if(!$('tc-presetpop').hidden&&!event.target.closest('#tc-preset-btn,#tc-presetpop'))closePresetPop();if(!$('tc-model-pop').hidden&&!event.target.closest('.tc-mpick'))closeModelPop();});$('tc-dm').onclick=()=>{if(!editing)return;const id=editing.id;closeEditor();openChat('dm:'+id);};$('tc-cancel').onclick=closeEditor;
  document.addEventListener('keydown',event=>{if((event.key==='Delete'||event.key==='Backspace')&&page==='canvas'&&selection.size&&!linkMode&&!event.target.closest('input,textarea,select')){event.preventDefault();removeFromCanvas([...selection]);return;}
    if(event.key==='Escape'){if(closeMenus())return;if(!$('tc-model-pop').hidden){closeModelPop();$('tc-model-btn').focus();return;}if(!$('tc-presetpop').hidden){closePresetPop();return;}if(selection.size&&page==='canvas'){selection.clear();updateHint();drawCanvas();return;}if(page==='members'&&!$('tc-form').hidden)closeEditor();else if(linkMode)setLinkMode(linkMode);else if(selectedEdge){selectedEdge=null;updateHint();drawCanvas();}}});
  $('tc-role').onchange=()=>{$('tc-new-role').hidden=$('tc-role').value!=='__new';if(!$('tc-new-role').hidden)$('tc-role-name').focus();};
  $('tc-kind').onchange=syncKind;$('tc-allow-sub').onchange=syncKind;
  $('tc-form').addEventListener('submit',async event=>{event.preventDefault();const button=$('tc-save');button.disabled=true;try{
      let roleId=$('tc-role').value;
      if(roleId==='__new'){const name=$('tc-role-name').value.trim();if(!name)throw Error('请填写新岗位名称。');const base=(data.roles||[]).find(r=>r.id==='developer')||(data.roles||[]).find(r=>!r.readOnly&&r.id!=='observer');const role=await api('saveRole',{name,instructions:$('tc-role-duty').value.trim(),allowedTools:base?.allowedTools||['read_files','find_files','search_files'],readOnly:false});roleId=role.id;}
      const kind=$('tc-kind').value,model=kind==='api'&&$('tc-model').value?JSON.parse($('tc-model').value):null;if(kind==='api'&&!model)throw Error('请选择模型。');
      const paths=$('tc-paths').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      const savedMember=await api('saveEmployee',{id:editing?.id,expected_version:editing?.version,name:$('tc-name').value.trim(),kind,roleId,model,allowedPaths:paths.length?paths:['.'],allowShell:$('tc-shell').checked,canManage:false,enabled:$('tc-enabled').checked,...(memberCustom?memberCustom.read():{})});
      const memberId=savedMember?.id||editing?.id;const place=placeAfterSave&&!editing&&memberId;
      if(memberId)await api('teamMemberSettings',{memberId,allowSubagents:kind==='api'&&$('tc-allow-sub').checked,maxSubagents:Number($('tc-sub-max').value)||3});
      if(memberId&&!editing&&pendingAvatar){try{await api('teamMemberAvatar',{memberId,avatar:pendingAvatar});}catch(error){notice(error.message,true);}}pendingAvatar=undefined;
      notice('已保存');closeEditor();await api('refresh');if(place){await addToCanvas(memberId);showPage('canvas');}
    }catch(error){notice(error.message,true);}finally{button.disabled=false;}});
  $('tc-delete').onclick=async()=>{if(!editing)return;if(!deleteArmed){deleteArmed=true;$('tc-delete').textContent='再点一次确认删除';return;}try{await act('teamDeleteMember',{employeeId:editing.id},$('tc-delete'));notice('成员已删除');if(channel==='dm:'+editing.id)channel='group';closeEditor();}catch{deleteArmed=false;$('tc-delete').textContent='删除成员';}};

  // ---------- collab-employee：成员头像（选图片 → 拖动/缩放选区域 → 存成 128px 小图；按成员存，画布节点、成员列表、聊天都用它） ----------
  var pendingAvatar; // 新成员还没保存时先记着，保存成员后再存
  function setAvatarLocal(id,url){if(!data?.team)return;const a={...(data.team.avatars||{})};if(url)a[id]=url;else delete a[id];data.team.avatars=a;lastChatKey='';lastConvKey='';drawCanvas();drawMembers();syncEditorAvatar();}
  async function putAvatar(id,url){const old=avatarUrl(id)||null;await act('teamMemberAvatar',{memberId:id,avatar:url});setAvatarLocal(id,url);return old;}
  async function saveAvatarRec(id,url){id=baseOf(id);try{const old=await putAvatar(id,url);record(url?'更换头像':'去掉头像',()=>putAvatar(id,old),()=>putAvatar(id,url));}catch{}}
  function pickAvatar(id){const input=$('tc-avatar-file');if(!input)return;input.dataset.target=id?baseOf(id):'';input.value='';input.click();}
  function syncEditorAvatar(){const box=$('tc-avatar-preview');if(!box)return;const url=editing?avatarUrl(editing.id):(pendingAvatar||'');box.classList.toggle('has-img',!!url);if(url){box.textContent='';box.style.background=`center / cover no-repeat url("${url}")`;}else{box.textContent=initial($('tc-name')?.value||editing?.name||'?');box.style.background=editing?colorOf(editing.id):'var(--oc-muted)';}const clr=$('tc-avatar-clear');if(clr)clr.hidden=!url;const pk=$('tc-avatar-pick');if(pk)pk.textContent=url?'更换图片…':'上传图片…';}
  function cropAvatar(file){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onerror=()=>reject(Error('读取图片失败。'));fr.onload=()=>{const img=new Image();img.onerror=()=>reject(Error('无法识别这张图片。'));img.onload=()=>resolve(openCrop(img));img.src=String(fr.result);};fr.readAsDataURL(file);});}
  function openCrop(img){return new Promise(resolve=>{
    const S=260,OUT=128,iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;if(!iw||!ih){resolve(null);return;}
    const base=S/Math.min(iw,ih);let z=1,ox=(S-iw*base)/2,oy=(S-ih*base)/2,dragAt=null;
    const wrap=el('div',null,'tc-crop');wrap.id='tc-crop';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-label','裁剪头像');
    const card=el('div',null,'tc-crop-card');card.append(el('div','裁剪头像','tc-crop-title'),el('div','拖动图片选区域，滚轮或滑块缩放；圆圈里的部分就是头像','tc-crop-tip'));
    const stage=el('div',null,'tc-crop-stage');stage.style.width=stage.style.height=S+'px';const cv=document.createElement('canvas'),dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));cv.width=cv.height=Math.round(S*dpr);cv.style.width=cv.style.height=S+'px';stage.append(cv,el('div',null,'tc-crop-ring'));
    const zoom=el('input');zoom.type='range';zoom.min='1';zoom.max='4';zoom.step='0.01';zoom.value='1';zoom.className='tc-crop-zoom';zoom.setAttribute('aria-label','缩放');
    const row=el('div',null,'tc-crop-actions'),cancel=el('button','取消','tc-ghost'),ok=el('button','确定','tc-primary');cancel.type='button';ok.type='button';row.append(cancel,ok);
    card.append(stage,zoom,row);wrap.append(card);const ctx=cv.getContext('2d');
    const clamp=()=>{const w=iw*base*z,h=ih*base*z;ox=Math.min(0,Math.max(S-w,ox));oy=Math.min(0,Math.max(S-h,oy));};
    const draw=()=>{clamp();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,S,S);ctx.imageSmoothingQuality='high';ctx.drawImage(img,ox,oy,iw*base*z,ih*base*z);wrap.dataset.crop=[Math.round(-ox/(base*z)),Math.round(-oy/(base*z)),Math.round(S/(base*z))].join(',');};
    const setZoom=(nz,cx=S/2,cy=S/2)=>{nz=Math.min(4,Math.max(1,nz));const k=nz/z;ox=cx-(cx-ox)*k;oy=cy-(cy-oy)*k;z=nz;zoom.value=String(z);draw();};
    stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();dragAt={x:e.clientX,y:e.clientY,ox,oy};try{stage.setPointerCapture(e.pointerId);}catch{}});
    stage.addEventListener('pointermove',e=>{if(!dragAt)return;ox=dragAt.ox+e.clientX-dragAt.x;oy=dragAt.oy+e.clientY-dragAt.y;draw();});
    const up=()=>{dragAt=null;};stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
    stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();setZoom(z*Math.exp(-e.deltaY*0.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
    zoom.addEventListener('input',()=>setZoom(Number(zoom.value)));
    const result=()=>{const out=document.createElement('canvas');out.width=out.height=OUT;const o=out.getContext('2d'),sc=base*z;o.imageSmoothingQuality='high';o.drawImage(img,-ox/sc,-oy/sc,S/sc,S/sc,0,0,OUT,OUT);let u=out.toDataURL('image/webp',0.9);if(!/^data:image\/webp;base64,/.test(u))u=out.toDataURL('image/png');return u;};
    const done=v=>{wrap.remove();document.removeEventListener('keydown',keys,true);resolve(v);};
    const keys=e=>{if(!wrap.isConnected)return;e.stopPropagation();if(e.isComposing)return;if(e.key==='Escape'){e.preventDefault();done(null);}else if(e.key==='Enter'){e.preventDefault();done(result());}else if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(z*1.1);}else if(e.key==='-'){e.preventDefault();setZoom(z/1.1);}else if(e.key.startsWith('Arrow')){e.preventDefault();const d=e.shiftKey?10:2;if(e.key==='ArrowLeft')ox-=d;if(e.key==='ArrowRight')ox+=d;if(e.key==='ArrowUp')oy-=d;if(e.key==='ArrowDown')oy+=d;draw();}};
    cancel.onclick=()=>done(null);ok.onclick=()=>done(result());
    wrap.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.target===wrap)done(null);});
    for(const t of ['mousedown','click','dblclick','contextmenu','keyup'])wrap.addEventListener(t,e=>e.stopPropagation());
    // 键盘在捕获阶段拦下：画布的 Delete / . / 空格 / Ctrl+Z 不会在裁剪时触发
    document.addEventListener('keydown',keys,true);
    document.body.append(wrap);draw();ok.focus();});}
  {const file=$('tc-avatar-file');if(file)file.addEventListener('change',async e=>{const f=e.target.files?.[0],target=e.target.dataset.target||'';e.target.value='';if(!f)return;if(!/^image\//.test(f.type||'')){notice('请选择图片文件（PNG / JPG / WebP / GIF）。',true);return;}if(f.size>20*1024*1024){notice('图片太大（超过 20MB）。',true);return;}let url;try{url=await cropAvatar(f);}catch(error){notice(error.message,true);return;}if(!url)return;if(target)await saveAvatarRec(target,url);else{pendingAvatar=url;syncEditorAvatar();}});
    const pk=$('tc-avatar-pick');if(pk)pk.onclick=()=>pickAvatar(editing?.id||'');const pv=$('tc-avatar-preview');if(pv){pv.onclick=()=>pickAvatar(editing?.id||'');pv.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickAvatar(editing?.id||'');}};}
    const clr=$('tc-avatar-clear');if(clr)clr.onclick=()=>{if(editing)saveAvatarRec(editing.id,null);else{pendingAvatar=undefined;syncEditorAvatar();}};
    $('tc-name').addEventListener('input',()=>{if(!(editing?avatarUrl(editing.id):pendingAvatar))syncEditorAvatar();});}

  // ---------- 成员页 ----------
  function managerOf(id){return team().edges.filter(e=>e.type==='manage'&&e.to===id).map(e=>memberName(e.from));}
  function reportsOf(id){return team().edges.filter(e=>e.type==='manage'&&e.from===id).length;}
  let lastMembersSig='';
  const enterMembers=makeEnter();
  function drawMembers(){
    if(!data||page!=='members')return;
    {const busy=data.team?.busy,sig=JSON.stringify([members().map(m=>[m.id,m.name,m.enabled,m.kind,m.temporary,m.roleId,m.model,m.model?modelName(m.model):'',onCanvas(m.id),nodeKeysOf(m.id).length,avatarUrl(m.id).length,avatarUrl(m.id).slice(-32)]),memberFilter,editing?.id||null,busy?[busy.memberId,busy.subId]:null,(data.tasks||[]).filter(t=>t.status==='running').map(t=>[t.id,chatTaskOwner(t.id)]),team().edges,team().settings,subs().map(s=>[s.id,s.parentId]),(data.roles||[]).map(r=>[r.id,r.name])]);if(sig===lastMembersSig&&$('tc-mlist').childNodes.length)return;lastMembersSig=sig;}
    const all=members(),q=memberFilter.trim().toLowerCase(),busy=data.team?.busy,box=$('tc-mlist');
    const list=q?all.filter(m=>[m.name,roleName(m.roleId),shortModel(m)].some(s=>String(s).toLowerCase().includes(q))):all;
    $('tc-mcount').textContent=all.length?`${all.filter(m=>m.enabled).length}/${all.length} 启用`:'';
    box.replaceChildren();
    if(!all.length){const e=el('div',null,'tc-mempty');e.append(el('div','还没有成员','tc-chat-empty-title'),el('div','先建一位“经理”，再建前端、后端等成员，然后到画布上连线。','tc-note'));box.append(e);return;}
    if(!list.length){box.append(el('div','没有匹配的成员','tc-note tc-mnone'));return;}
    const mRows=[];
    for(const m of list){
      const speaking=busy?.memberId===m.id&&!busy.subId,working=(data.tasks||[]).some(t=>t.status==='running'&&chatTaskOwner(t.id)===m.id),st=team().settings?.[m.id]||{},nsub=subsOf(m.id).length;
      const row=el('div',null,'tc-mrow'+(editing?.id===m.id?' active':'')+(m.enabled?'':' disabled'));row.setAttribute('role','listitem');row.tabIndex=0;
      row.append(avatar(m.id));
      const main=el('div',null,'tc-mrow-main'),top=el('div',null,'tc-mrow-top');top.append(el('strong',m.name,'tc-mrow-name'));
      const state=!m.enabled?['已停用','']:speaking?['发言中','s-running']:working?['执行任务','s-completed']:['空闲',''];top.append(el('span',state[0],'tc-pill '+state[1]));
      main.append(top);
      const meta=el('div',null,'tc-mrow-meta');meta.append(el('span',roleName(m.roleId)),el('span',m.kind==='mcp'?(m.temporary?'临时 · 外部 MCP':'外部 MCP'):shortModel(m)));
      const mg=managerOf(m.id);if(mg.length)meta.append(el('span','上级：'+mg.join('、')));const nr=reportsOf(m.id);if(nr)meta.append(el('span',`管理 ${nr} 人`));
      if(m.kind==='api'&&st.allowSubagents===true)meta.append(el('span',`⑂ 子代理 ${nsub}/${st.maxSubagents||3}`));
      if(!onCanvas(m.id))top.append(el('span','未在画布','tc-pill tc-pill-off'));else if(nodeKeysOf(m.id).length>1)top.append(el('span',`画布上 ${nodeKeysOf(m.id).length} 个节点`,'tc-pill'));
      main.append(meta);row.append(main);
      const acts=el('div',null,'tc-mrow-acts');
      if(m.kind==='api'){const b=el('button','💬 私聊','tc-ghost');b.type='button';b.onclick=event=>{event.stopPropagation();openChat('dm:'+m.id);};acts.append(b);}
      const cv=el('button',onCanvas(m.id)?'移出画布':'加到画布','tc-ghost');cv.type='button';cv.onclick=event=>{event.stopPropagation();if(onCanvas(m.id))removeFromCanvas(nodeKeysOf(m.id));else addToCanvas(m.id);};acts.append(cv);
      const e=el('button','编辑','tc-ghost');e.type='button';acts.append(e);row.append(acts);
      row.onclick=()=>{openEditor(m);drawMembers();};row.onkeydown=event=>{if(event.key==='Enter'&&event.target===row){openEditor(m);drawMembers();}};
      box.append(row);mRows.push([m.id,row]);}
    enterMembers(mRows);
  }
  $('tc-msearch').addEventListener('input',()=>{memberFilter=$('tc-msearch').value;drawMembers();});

  // ---------- 聊天 ----------
  const inChannel=(m,ch)=>(m.channel||'group')===ch;
  function avatar(id,small){const sub=String(id).startsWith('sub:'),s=sub?subs().find(x=>'sub:'+x.id===id):null;const node=el('span',id==='user'?'我':id==='group'?'#':initial(sub?(s?.name||'?'):memberName(id)),'tc-avatar-chip'+(sub?' sub':'')+(small?' small':''));node.style.background=id==='user'?'var(--vscode-button-background)':id==='group'?'var(--oc-muted)':sub?'transparent':colorOf(id);if(sub)node.style.borderColor=s?colorOf(s.parentId):'var(--oc-muted)';if(sub&&s)node.style.color=colorOf(s.parentId);const av=!sub&&id!=='user'&&id!=='group'?avatarUrl(id):'';if(av){node.textContent='';node.classList.add('has-img');node.style.background=`center / cover no-repeat url("${av}")`;}return node;}
  const convNodes=new Map();let convSep=null;
  function drawConvs(){
    const list=$('tc-conv-list'),chat=team().chat,busy=data.team?.busy,dms=dmMembers(),key=chat.length+':'+(chat.at(-1)?.id||'')+':'+channel+':'+(busy?.memberId||'')+':'+(busy?.channel||'')+':'+canvasMembers().filter(m=>m.enabled).length+':'+dms.map(m=>{const st=memberState(m);return m.id+m.name+m.enabled+m.kind+m.roleId+st.k+st.t;}).join(',');
    if(key===lastConvKey)return;lastConvKey=key;
    // collab-refresh: 会话按钮按频道复用（同一个元素），只换里面的内容
    const want=[];
    const item=(ch,title,sub,av,disabled)=>{const last=[...chat].reverse().find(m=>inChannel(m,ch)),b=convNodes.get(ch)||el('button');convNodes.set(ch,b);want.push(b);b.className='tc-conv'+(channel===ch?' active':'')+(disabled?' disabled':'');b.type='button';b.title=title;b.replaceChildren(withDot(av,ch));const txt=el('div',null,'tc-conv-text'),top=el('div',null,'tc-conv-top');top.append(el('span',title,'tc-conv-title'));if(last)top.append(el('span',new Date(last.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),'tc-conv-time'));txt.append(top,el('div',busy&&(ch==='group'?busy.channel==='group':busy.channel===ch)?'正在输入…':last?`${last.from==='user'?'我：':last.from==='system'?'':speakerName(last.from)+'：'}${last.text}`:sub,'tc-conv-last'+(busy&&busy.channel===ch?' typing':'')));b.append(txt);b.onclick=()=>{if(disabled){notice('外部 MCP 成员不能直接聊天，只能领任务。',true);return;}channel=ch;remember();lastChatKey='';drawChatPage();$('tc-input').focus();};};
    item('group','群聊',`${canvasMembers().filter(m=>m.enabled).length} 位成员`,avatar('group'),false);
    want.push(convSep||(convSep=el('div','私聊','tc-conv-sep')));
    for(const m of dms)item('dm:'+m.id,m.name,m.kind==='api'?roleName(m.roleId):'外部 MCP · 不能私聊',avatar(m.id),m.kind!=='api');
    for(const [ch,b] of convNodes)if(!want.includes(b))convNodes.delete(ch);want.forEach((n,i)=>{if(list.children[i]!==n)list.insertBefore(n,list.children[i]||null);});while(list.children.length>want.length)list.lastElementChild.remove();
  }
  function taskCard(message){
    const task=(data.tasks||[]).find(t=>t.id===message.taskId),box=el('div',null,'tc-task'),head=el('div',null,'tc-task-head');
    head.append(el('span','📋','tc-task-icon'),el('span',task?.title||'任务','tc-task-title'),el('span',task?stateLabels[task.status]||task.status:'不在当前项目','tc-pill'+(task?' s-'+task.status:'')));box.append(head);
    if(message.assignee)box.append(el('div','执行人：'+memberName(message.assignee),'tc-task-meta'));
    if(task){const actions=el('div',null,'tc-task-actions'),btn=(label,action,input,cls='tc-ghost')=>{const b=el('button',label,cls);b.onclick=()=>act(action,input,b).catch(()=>{});actions.append(b);};
      if(task.status==='queued'&&!task.ownerAgentId)btn('开始执行','startNative',{taskId:task.id},'tc-primary small');
      if(task.status==='running')btn('停止','stopNative',{taskId:task.id});
      if(task.activeAttemptId&&['completed','review','blocked'].includes(task.status))btn('查看改动','openTaskDiff',{taskId:task.id,attemptId:task.activeAttemptId});
      if(task.status==='review')btn('验收通过','confirmTask',{taskId:task.id,expected_revision:task.revision},'tc-primary small');
      if(['queued','blocked','review'].includes(task.status))btn('取消','cancelTask',{taskId:task.id,expected_revision:task.revision});
      if(actions.childNodes.length)box.append(actions);}
    return box;
  }
  function drawChatHead(){
    const dmId=channel.startsWith('dm:')?channel.slice(3):null,m=dmId?members().find(x=>x.id===dmId):null;
    if(dmId&&!m){channel='group';remember();}
    $('tc-chat-avatar').replaceChildren(avatar(m?m.id:'group'));
    $('tc-chat-name').textContent=m?m.name:'群聊';
    $('tc-chat-sub').textContent=m?`私聊 · ${roleName(m.roleId)} · ${shortModel(m)} · 其他成员看不到`:`${canvasMembers().filter(x=>x.enabled).length} 位成员（画布上的团队） · 不带 @ 全员可见，@ 谁只有谁能看到`;
    $('tc-input').placeholder=m?`发给 ${m.name}…`:'发给团队… 输入 @ 选择成员（私密消息）';
    
  }
  
  // ===== 成员状态：发言中 / 执行任务 / 子代理工作中 / 空闲 / 已停用 =====
  function memberState(m){const busy=data?.team?.busy;if(!m.enabled)return{k:'off',t:'已停用'};if(m.kind!=='api')return{k:'ext',t:'外部成员'};
    if(busy&&busy.memberId===m.id&&!busy.subId)return{k:'speaking',t:busy.channel===channel?'正在回复':'在别处回复'};
    if(busy&&busy.memberId===m.id&&busy.subId)return{k:'working',t:'子代理工作中'};
    const task=(data.tasks||[]).find(t=>t.status==='running'&&chatTaskOwner(t.id)===m.id);if(task)return{k:'working',t:'执行：'+(task.title||'任务')};
    if(subsOf(m.id).some(x=>x.status==='running'||x.status==='queued'))return{k:'working',t:'子代理工作中'};
    if((data.tasks||[]).some(t=>t.status==='blocked'&&chatTaskOwner(t.id)===m.id))return{k:'blocked',t:'受阻，等你处理'};
    if(busy&&!busy.memberId&&busy.channel===channel&&(team().chat||[]).length)return{k:'waiting',t:'等待合议'};
    return{k:'idle',t:'空闲'};}
  function statusKey(){return members().map(m=>{const st=memberState(m);return m.id+st.k+st.t;}).join('|');}
  function withDot(av,ch){const w=el('span',null,'tc-av-wrap');w.append(av);if(ch.startsWith('dm:')){const m=members().find(x=>'dm:'+x.id===ch);if(m){const st=memberState(m);const d=el('i',null,'tc-sdot s-'+st.k);d.title=st.t;w.append(d);}}else{const any=members().some(m=>memberState(m).k==='speaking');if(any)w.append(el('i',null,'tc-sdot s-speaking'));}return w;}
  let lastStatusKey='';
  function drawStatus(){let bar=$('tc-status');if(!bar){bar=el('div',null,'tc-status');bar.id='tc-status';const list=$('tc-messages');list.parentNode.insertBefore(bar,list);}
    const dm=channel.startsWith('dm:'),list=dm?members().filter(m=>'dm:'+m.id===channel):canvasMembers();const key=channel+'#'+list.map(m=>{const st=memberState(m);return m.id+m.name+st.k+st.t;}).join('|');
    if(key===lastStatusKey)return;lastStatusKey=key;bar.replaceChildren();bar.hidden=!list.length;
    for(const m of list){const st=memberState(m),chip=el('div',null,'tc-schip s-'+st.k);chip.title=m.name+'：'+st.t;const w=el('span',null,'tc-av-wrap');w.append(avatar(m.id));w.append(el('i',null,'tc-sdot s-'+st.k));chip.append(w,el('span',m.name,'tc-schip-name'),el('span',st.t,'tc-schip-state'));
      if(!dm)chip.onclick=()=>{channel='dm:'+m.id;remember();lastChatKey='';drawChatPage();};bar.append(chip);}}
  const seenMsgs=new Map();let lastChatLen='';
  function drawChat(){drawStatus();
    const list=$('tc-messages'),chat=team().chat.filter(m=>inChannel(m,channel)),busy=data.team?.busy,key=channel+':'+chat.length+':'+(chat.at(-1)?.id||'')+':'+chat.filter(m=>m.kind==='task').map(m=>{const t=(data.tasks||[]).find(x=>x.id===m.taskId);return m.taskId+(t?t.status+(t.ownerAgentId||'')+(t.activeAttemptId||'')+(t.revision||''):'-');}).join(',')+':'+members().filter(m=>!m.temporary&&!isSubagent(m)).map(m=>m.id+m.name).join(',')+':'+[...new Set(chat.map(m=>m.from))].map(f=>{const s=String(f).startsWith('sub:')?subs().find(x=>'sub:'+x.id===f):null,mm=members().find(x=>x.id===f);return f+speakerName(f)+(s?s.parentId+memberName(s.parentId):'')+(mm?roleName(mm.roleId):'');}).join(',');
    const here=busy&&busy.channel===channel;$('tc-busy').textContent=here?`${busy.name} 正在输入…`:busy?`${busy.name} 正在别的会话回复…`:'';$('tc-busy').hidden=!busy;$('tc-stop').hidden=true;syncSendBtn();{const ms=$('tc-mode');if(ms&&document.activeElement!==ms)ms.value=team().mode||'all';}
    if(key===lastChatKey)return;lastChatKey=key;const atBottom=list.scrollHeight-list.scrollTop-list.clientHeight<60,keepTop=list.scrollTop,lenKey=channel+':'+chat.length,grew=lenKey!==lastChatLen;lastChatLen=lenKey;list.replaceChildren();
    if(!chat.length){const empty=el('div',null,'tc-chat-empty');const dm=channel!=='group';empty.append(el('div','💬','tc-chat-empty-icon'),el('div',dm?'开始私聊':'发一句话开始','tc-chat-empty-title'),el('div',dm?'这里的对话只有你和 TA 看得到。':'不带 @ 交给最上级、全员可见；@名字 是私密消息，只有被点名的人能看到；成员之间也会互相 @ 配合。'));list.append(empty);}
    let prev=null,lastTgt=list;const folds=new Map(),plan=new Map();{let seg=[];const flush=live=>{if(!seg.length)return;let fin=-1;if(!live){for(let k=seg.length-1;k>=0;k--){const x=seg[k];if(x.from!=='system'&&x.kind!=='task'){fin=k;break;}}}const rest=seg.filter((_,k)=>k!==fin);if(rest.length&&(live||fin>=0)){const st={key:'turn:'+(seg[0].id||seg[0].time),live,disc:0,cmds:0,tasks:0,sys:0};for(const x of rest){if(x.kind==='task')st.tasks++;else if(x.from==='system')st.sys++;else{st.disc++;st.cmds+=splitCmds(x.text).cmds.length;}}for(const x of rest)plan.set(x,st);}seg=[];};for(const x of chat){if(x.from==='user'){flush(false);continue;}seg.push(x);}flush(!!(busy&&busy.channel===channel));}
    const tgtOf=m=>{const st=plan.get(m);if(!st)return list;let g=folds.get(st.key);if(!g){const parts=[];if(st.disc)parts.push(st.disc+' 条讨论');if(st.cmds)parts.push('执行了 '+st.cmds+' 条命令');if(st.tasks)parts.push(st.tasks+' 个任务');if(st.sys)parts.push(st.sys+' 条记录');g=foldBox((st.live?'正在协作':'协作过程')+(parts.length?' · '+parts.join(' · '):''),st.key,st.live);folds.set(st.key,g);list.append(g.el);}return g.body;};const seen=seenMsgs.get(channel)||{ready:false,ids:new Set()};seenMsgs.set(channel,seen);const fresh=m=>{const k=m.id||(m.time+m.from);const n=seen.ready&&!seen.ids.has(k);seen.ids.add(k);return n;};
    for(const m of chat){const tgt=tgtOf(m);if(tgt!==lastTgt){prev=null;lastTgt=tgt;}
      if(m.from==='system'){const line=el('div',m.text,'tc-sys'+(fresh(m)?' tc-new':''));if(m.to?.length)line.prepend(el('span','🔒 ','tc-lock'));tgt.append(line);prev=null;continue;}
      const mine=m.from==='user',isSub=String(m.from).startsWith('sub:'),row=el('div',null,'tc-msg '+(mine?'mine':'member')+(isSub?' sub':'')),privKey=(m.to||[]).join(','),grouped=prev&&prev.from===m.from&&(prev.to||[]).join(',')===privKey&&new Date(m.time)-new Date(prev.time)<120000;
      if(grouped)row.classList.add('grouped');if(fresh(m))row.classList.add('tc-new');
      const side=el('div',null,'tc-msg-side');if(!grouped)side.append(avatar(m.from));row.append(side);
      const col=el('div',null,'tc-msg-col');
      if(!grouped){const head=el('div',null,'tc-msg-head');head.append(el('strong',speakerName(m.from)));
        if(isSub){const s=subs().find(x=>'sub:'+x.id===m.from);head.append(el('span',`${s?memberName(s.parentId):''} 的子代理`,'tc-msg-role sub'));}
        else{const member=members().find(x=>x.id===m.from);if(member)head.append(el('span',roleName(member.roleId),'tc-msg-role'));}
        if(m.to?.length){const names=m.to.filter(x=>x!=='user').map(memberName);head.append(el('span',names.length?`🔒 仅 ${names.join('、')} 可见`:'🔒 仅你可见','tc-priv'));}
        head.append(el('span',new Date(m.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),'tc-msg-time'));col.append(head);}
      if(m.kind==='task'){const fb=foldBox('任务 · '+(m.title||m.task?.title||String(m.text||'').split('\n')[0].slice(0,40)),'task:'+(m.id||m.time),false);fb.body.append(taskCard(m));col.append(fb.el);}else{const sp=splitCmds(m.text);if(sp.body.trim()){const b=bubble(sp.body);if(m.to?.length)b.classList.add('private');col.append(b);}if(sp.cmds.length){const fb=foldBox('执行了 '+sp.cmds.length+' 条命令',('cmd:'+(m.id||m.time)),false);for(const c of sp.cmds){const r=el('div',null,'tc-cmdline');r.append(el('span',c.kind,'tc-cmd'),el('span',c.rest,'tc-cmdline-text'));fb.body.append(r);}col.append(fb.el);}}
      row.append(col);tgt.append(row);prev=m;}
    drawStreams();const wasReady=seen.ready;seen.ready=true;
    if(atBottom||(grew&&chat.at(-1)?.from==='user')){if(wasReady&&list.scrollTo)list.scrollTo({top:list.scrollHeight,behavior:'smooth'});else list.scrollTop=list.scrollHeight;}else list.scrollTop=keepTop;
  }
  // Markdown：代码块、行内代码、粗体、标题、列表、链接；@成员高亮沿用原来的 bubblePlain
  function mdInline(root){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){if(n.parentElement?.closest('code,pre,.tc-cmd'))continue;const t=n.nodeValue;if(!/[`*#\-\[]|^\s*\d+\./m.test(t))continue;const frag=document.createDocumentFragment();
      const re=/(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\((https?:[^)\s]+)\))|(^|\n)(#{1,4}) ([^\n]*)|(^|\n)(\s*)([-*]|\d+\.) /g;let last=0,m;
      while((m=re.exec(t))){frag.append(t.slice(last,m.index));if(m[1])frag.append(el('code',m[1].slice(1,-1),'tc-md-code'));else if(m[2])frag.append(el('strong',m[2].slice(2,-2)));else if(m[3]){const l=el('a',m[3].slice(1,m[3].indexOf(']')),'tc-md-link');l.href=m[4];l.title=m[4];frag.append(l);}else if(m[6]){frag.append(m[5]||'');frag.append(el('span',m[7],'tc-md-h tc-md-h'+m[6].length));}else{frag.append((m[8]||'')+(m[9]||''));frag.append(el('span',/\d/.test(m[10])?m[10]+' ':'•  ','tc-md-li'));}last=re.lastIndex;}
      frag.append(t.slice(last));n.replaceWith(frag);}}
  // 折叠块：合议/择优的中间过程、命令、任务卡，默认折叠，展开状态在重绘时保留
  const openFolds=new Set();
  function foldBox(label,key,running){const d=el('details',null,'tc-fold'+(running?' running':''));d.open=openFolds.has(key);d.addEventListener('toggle',()=>{if(d.open)openFolds.add(key);else openFolds.delete(key);});
    const sum=el('summary',null,'tc-fold-sum');const chev=el('span',null,'tc-fold-chev');chev.innerHTML='<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>';const cnt=el('span','','tc-fold-count');sum.append(chev,el('span',label,'tc-fold-label'),cnt);if(running)sum.append(el('span','进行中','tc-fold-live'));
    const body=el('div',null,'tc-fold-body');d.append(sum,body);return {el:d,body,count:n=>{cnt.textContent=n?String(n):'';}};}
  // 流式回复：后端按 120ms 推 {type:'stream'}；在消息列表末尾显示正在生成的气泡
  const streams=new Map();
  function drawStreams(){const list=$('tc-messages');if(!list)return;let box=list.querySelector(':scope > .tc-streams');const atBottom=list.scrollHeight-list.scrollTop-list.clientHeight<80;
    const items=[...streams.values()].filter(x=>x.channel===channel&&x.text);if(!items.length){box?.remove();return;}
    if(!box){box=el('div',null,'tc-streams');}list.append(box);box.replaceChildren();
    for(const x of items){const row=el('div',null,'tc-msg member tc-streaming');const side=el('div',null,'tc-msg-side');side.append(avatar(x.memberId));const col=el('div',null,'tc-msg-col');const head=el('div',null,'tc-msg-head');head.append(el('strong',speakerName(x.memberId)),el('span','正在输入','tc-fold-live'));const sp=splitCmds(x.text);col.append(head,bubble(sp.body||'…'));if(sp.cmds.length)col.append(el('div','执行了 '+sp.cmds.length+' 条命令','tc-stream-cmds'));row.append(side,col);box.append(row);}
    if(atBottom)list.scrollTop=list.scrollHeight;}
  window.addEventListener('message',event=>{const m=event.data;if(!m||m.type!=='stream')return;const k=m.memberId+'|'+m.channel;if(m.done)streams.delete(k);else streams.set(k,{memberId:m.memberId,channel:m.channel,text:m.text});drawStreams();});
  function splitCmds(text){const cmds=[],keep=[];for(const line of String(text??'').split(/\r?\n/)){const m=line.match(/^\s*(#任务|#子代理|#结束|#跳过)\s*(.*)$/);if(m)cmds.push({kind:m[1],rest:m[2]});else keep.push(line);}return {body:keep.join('\n'),cmds};}
  function bubble(text){const src=String(text??'');if(!src.includes('```')&&!/[`*#\[]|^\s*[-\d]/m.test(src))return bubblePlain(src);
    const out=el('div',null,'tc-bubble tc-md');const fence=/^```([^\n]*)\n([\s\S]*?)(?:^```[ \t]*$|(?![\s\S]))/gm;let last=0,f;
    const addText=seg=>{seg=seg.replace(/^\n+|\n+$/g,'');if(!seg)return;const b=bubblePlain(seg);mdInline(b);out.append(...b.childNodes);};
    while((f=fence.exec(src))){addText(src.slice(last,f.index));const lang=f[1].trim(),code=f[2].replace(/\n$/,'');
      const box=el('div',null,'tc-md-pre');const head=el('div',null,'tc-md-pre-head');head.append(el('span',lang||'code'));const cp=el('button','复制','tc-md-copy');cp.type='button';cp.onclick=()=>{navigator.clipboard?.writeText(code);cp.textContent='已复制';setTimeout(()=>cp.textContent='复制',1200);};head.append(cp);const pre=el('pre');pre.append(el('code',code));box.append(head,pre);out.append(box);last=fence.lastIndex;if(f[0]==='')fence.lastIndex++;}
    addText(src.slice(last));
    return out;}
  function bubblePlain(text){const body=el('div',null,'tc-bubble');const names=[...members().map(m=>m.name)].sort((a,b)=>b.length-a.length);let rest=String(text);
    rest=rest.replace(/^(\s*)(#任务|#子代理)/gm,'$1\u0000$2');
    const parts=rest.split('\u0000');parts.forEach((part,pi)=>{let seg=part;if(pi>0){const m=seg.match(/^(#任务|#子代理)/);if(m){body.append(el('span',m[1],'tc-cmd'));seg=seg.slice(m[1].length);}}
      while(seg){let idx=-1,hit=null;for(const n of names){const i=seg.indexOf('@'+n);if(i>=0&&(idx<0||i<idx)){idx=i;hit=n;}}if(idx<0){body.append(seg);break;}body.append(seg.slice(0,idx),el('span','@'+hit,'tc-at'));seg=seg.slice(idx+hit.length+1);}});
    return body;}
  function drawChatPage(){if(!data||page!=='chat')return;if(channel!=='group')closeAt();mirror();drawConvs();drawChatHead();drawChat();}
  function insert(text){const input=$('tc-input'),s=input.selectionStart??input.value.length;input.value=input.value.slice(0,s)+text+input.value.slice(input.selectionEnd??s);input.focus();input.selectionStart=input.selectionEnd=s+text.length;autoGrow();}
  function autoGrow(){const input=$('tc-input');input.style.height='auto';input.style.height=Math.min(160,input.scrollHeight+2)+'px';mirror();}
  // 输入框里的 @名字 显示成蓝色：textarea 文字透明，背后叠一层同样排版的镜像。
  function mirror(){const input=$('tc-input'),box=$('tc-input-mirror');if(!box)return;box.replaceChildren();const names=members().map(m=>m.name).sort((a,b)=>b.length-a.length);let seg=input.value;
    while(seg){let idx=-1,hit=null;for(const n of names){const i=seg.indexOf('@'+n);if(i>=0&&(idx<0||i<idx)){idx=i;hit=n;}}if(idx<0){box.append(seg);break;}box.append(seg.slice(0,idx),el('span','@'+hit,'tc-at-input'));seg=seg.slice(idx+hit.length+1);}
    box.append('\u200b');box.scrollTop=input.scrollTop;}
  async function send(){const input=$('tc-input');let text=input.value.trim();if(!text&&!attachments.length)return;if(attachments.length)text=(text||'请看附件。')+'\n\n'+attachments.map(a=>'附件 '+a.name+'：\n```\n'+a.text+'\n```').join('\n\n');try{await act('teamSend',{text,channel},$('tc-send'));input.value='';attachments=[];drawAttach();autoGrow();syncSendBtn();}catch{}}
  let attachments=[];
  function composerHasContent(){return !!($('tc-input').value.trim()||attachments.length);}
  function stopReply(){act('teamStop',{},$('tc-send')).catch(()=>{});}
  const ICON_SEND='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3.5M3.8 7.5 8 3.3l4.2 4.2"/></svg>',ICON_STOP='<svg viewBox="0 0 16 16" width="16" height="16"><rect x="4" y="4" width="8" height="8" rx="1.5" fill="currentColor"/></svg>';
  let sendMode='';
  function syncSendBtn(){const b=$('tc-send');if(!b)return;const busyHere=!!data?.team?.busy,has=composerHasContent(),mode=busyHere&&!has?'stop':'send';b.classList.toggle('is-empty',!has&&!busyHere);b.disabled=!has&&!busyHere;if(mode===sendMode)return;sendMode=mode;b.innerHTML=mode==='stop'?ICON_STOP:ICON_SEND;b.classList.toggle('is-stop',mode==='stop');b.title=mode==='stop'?'停止回复':(busyHere?'插话发送 (Enter)':'发送 (Enter)');b.setAttribute('aria-label',mode==='stop'?'停止':'发送');}
  function drawAttach(){const box=$('tc-attach-list');if(!box)return;box.replaceChildren();attachments.forEach((a,i)=>{const c=el('span',a.name,'tc-attach-chip');const x=el('button','×','tc-attach-x');x.type='button';x.title='移除';x.onclick=()=>{attachments.splice(i,1);drawAttach();syncSendBtn();};c.append(x);box.append(c);});}
  async function addFiles(files){for(const f of files){if(f.size>200*1024){notice(f.name+' 超过 200 KB，暂不支持',true);continue;}const t=await f.text();if(/\u0000/.test(t.slice(0,2000))){notice(f.name+' 不是文本文件，暂不支持',true);continue;}attachments.push({name:f.name,text:t});}drawAttach();syncSendBtn();$('tc-input').focus();}
  setTimeout(()=>{$('tc-attach')?.addEventListener('click',()=>$('tc-file').click());$('tc-file')?.addEventListener('change',e=>{addFiles([...e.target.files]);e.target.value='';});const inp=$('tc-input');inp.addEventListener('input',syncSendBtn);inp.addEventListener('paste',e=>{const fs=[...(e.clipboardData?.files||[])];if(fs.length){e.preventDefault();addFiles(fs);}});const wrap=inp.closest('.tc-composer');wrap?.addEventListener('dragover',e=>{e.preventDefault();wrap.classList.add('drag');});wrap?.addEventListener('dragleave',()=>wrap.classList.remove('drag'));wrap?.addEventListener('drop',e=>{e.preventDefault();wrap.classList.remove('drag');addFiles([...(e.dataTransfer?.files||[])]);});syncSendBtn();},0);
  // @ 弹出成员列表（类似 QQ）：输入 @ 后按名字筛选，↑↓ 选择，Enter/Tab 确认，Esc 关闭。
  let at=null;
  function atQuery(){const input=$('tc-input'),pos=input.selectionStart??0,before=input.value.slice(0,pos),i=before.lastIndexOf('@');if(i<0)return null;const q=before.slice(i+1);if(/[\s@]/.test(q)||q.length>20)return null;if(i>0&&/[A-Za-z0-9_.]/.test(before[i-1]))return null;return {start:i,end:pos,q};}
  function closeAt(){at=null;$('tc-at-pop').hidden=true;}
  function updateAt(){if(channel!=='group'){closeAt();return;}const hit=atQuery();if(!hit){closeAt();return;}const q=hit.q.toLowerCase(),list=canvasMembers().filter(m=>m.enabled&&(!q||m.name.toLowerCase().includes(q)||roleName(m.roleId).toLowerCase().includes(q)));if(!list.length){closeAt();return;}
    const prevId=at?.list?.[at.index]?.id,keep=Math.max(0,list.findIndex(m=>m.id===prevId));at={...hit,list,index:keep};drawAt();}
  function drawAt(){const pop=$('tc-at-pop');pop.replaceChildren();pop.append(el('div','选择要私密 @ 的成员','tc-at-head'));at.list.forEach((m,i)=>{const row=el('div',null,'tc-at-item'+(i===at.index?' active':''));row.setAttribute('role','option');row.setAttribute('aria-selected',String(i===at.index));row.append(avatar(m.id,true),el('span',m.name,'tc-at-name'),el('span',m.kind==='api'?roleName(m.roleId):'外部 MCP','tc-at-role'));row.addEventListener('mousedown',event=>{event.preventDefault();pickAt(i);});row.addEventListener('mouseenter',()=>{if(!at)return;at.index=i;[...pop.querySelectorAll('.tc-at-item')].forEach((r,k)=>r.classList.toggle('active',k===i));});pop.append(row);});pop.hidden=false;pop.querySelector('.tc-at-item.active')?.scrollIntoView({block:'nearest'});}
  function pickAt(i){if(!at)return;const m=at.list[i],input=$('tc-input'),text='@'+m.name+' ';input.value=input.value.slice(0,at.start)+text+input.value.slice(at.end);const pos=at.start+text.length;closeAt();input.focus();input.selectionStart=input.selectionEnd=pos;autoGrow();}
  $('tc-send').onclick=()=>{if(composerHasContent())send();else if(data?.team?.busy)stopReply();};
  $('tc-input').addEventListener('input',()=>{autoGrow();updateAt();});
  $('tc-input').addEventListener('click',updateAt);$('tc-input').addEventListener('scroll',()=>{$('tc-input-mirror').scrollTop=$('tc-input').scrollTop;});$('tc-input').addEventListener('blur',()=>setTimeout(closeAt,100));
  $('tc-input').addEventListener('keydown',event=>{
    if(at&&!event.isComposing){if(event.key==='ArrowDown'){event.preventDefault();at.index=(at.index+1)%at.list.length;drawAt();return;}if(event.key==='ArrowUp'){event.preventDefault();at.index=(at.index-1+at.list.length)%at.list.length;drawAt();return;}if((event.key==='Enter'&&!event.ctrlKey&&!event.metaKey)||event.key==='Tab'){event.preventDefault();pickAt(at.index);return;}if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeAt();return;}}
    if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229){event.preventDefault();closeAt();if(composerHasContent())send();else if(data?.team?.busy)stopReply();}});
  $('tc-input').addEventListener('keyup',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))updateAt();});

  $('tc-stop').onclick=stopReply;
  $('tc-rules').onclick=()=>{const box=$('tc-rules-box');box.hidden=!box.hidden;if(!box.hidden){$('tc-rules-text').value=team().rules||'';$('tc-rules-text').focus();}};
  $('tc-rules-cancel').onclick=()=>{$('tc-rules-box').hidden=true;};
  $('tc-rules-save').onclick=()=>act('teamRules',{rules:$('tc-rules-text').value},$('tc-rules-save')).then(()=>{$('tc-rules-box').hidden=true;}).catch(()=>{});
  (()=>{const anchor=$('tc-rules');if(!anchor||$('tc-mode'))return;const sel=document.createElement('select');sel.id='tc-mode';sel.title='群聊里不 @ 人时谁来回复';sel.className=anchor.className;sel.style.cssText='max-width:150px;margin-right:6px;background:var(--vscode-dropdown-background);color:var(--vscode-dropdown-foreground);border:1px solid var(--vscode-dropdown-border,transparent);border-radius:4px;padding:2px 4px;';for(const [v,t] of [['all','全员回复'],['council','合议'],['best','择优'],['leader','组长分派']]){const o=document.createElement('option');o.value=v;o.textContent=t;sel.append(o);}try{sel.value=team().mode||'all';}catch{}sel.onchange=()=>act('teamMode',{mode:sel.value},sel).catch(()=>{sel.value=team().mode||'all';});anchor.parentNode.insertBefore(sel,anchor);})();
  $('tc-clear').title='清空当前会话的聊天记录（再点一次确认）';let clearArmed=false;$('tc-clear').onclick=async()=>{if(!clearArmed){clearArmed=true;$('tc-clear').textContent='确认清空？';setTimeout(()=>{clearArmed=false;$('tc-clear').textContent='清空';},3000);return;}clearArmed=false;$('tc-clear').textContent='清空';await act('teamClearChat',{channel}).catch(()=>{});};

  // ---------- 总体 ----------
  // ---------- 团队预设（所有项目通用：画布上的成员、位置、连线、子代理设置） ----------
  const presets=()=>data?.team?.presets||[];
  function closePresetPop(){$('tc-presetpop').hidden=true;$('tc-preset-btn').setAttribute('aria-expanded','false');presetArm=null;}
  function drawPresetPop(){const pop=$('tc-presetpop'),old=$('tc-preset-name'),keep=old?.value||'',focused=document.activeElement===old;pop.replaceChildren();
    pop.append(el('div','团队预设 · 所有项目通用','tc-addpop-head'));
    if(!presets().length)pop.append(el('div','还没有预设。把当前画布存成预设，别的项目一键套用。','tc-preset-empty'));
    for(const p of presets()){const row=el('div',null,'tc-preset-row'),t=el('span',null,'tc-addpop-text');t.append(el('span',p.name,'tc-addpop-name'),el('span',`${p.count} 位成员 · ${p.links} 条连线`+(p.isDefault?' · 新项目默认':''),'tc-addpop-sub'));row.append(t);
      const armed=presetArm===p.id,apply=el('button',armed?'确认替换':'套用','tc-ghost tc-preset-apply'+(armed?' armed':''));apply.type='button';apply.title='用这个预设替换当前项目画布上的成员、连线和子代理设置';
      apply.onclick=async()=>{if(canvasMembers().length&&presetArm!==p.id){presetArm=p.id;drawPresetPop();return;}presetArm=null;try{await act('teamPresetApply',{presetId:p.id},apply);localPos={};selection.clear();closePresetPop();setTimeout(fitView,80);}catch{}};
      const upd=el('button','覆盖','tc-ghost');upd.type='button';upd.title='用当前画布覆盖这个预设';upd.onclick=async()=>{try{await act('teamPresetSave',{presetId:p.id,name:p.name},upd);notice(`已用当前画布更新预设「${p.name}」`);}catch{}};
      const star=el('button',p.isDefault?'★':'☆','tc-icon-btn tc-preset-star'+(p.isDefault?' on':''));star.type='button';star.title=p.isDefault?'取消新项目默认':'设为新项目默认：新项目第一次打开团队画布时自动套用';star.onclick=async()=>{try{await act('teamPresetDefault',{presetId:p.isDefault?null:p.id},star);}catch{}};
      const delArmed=presetArm==='del:'+p.id,del=el('button',delArmed?'删除?':'✕','tc-icon-btn tc-preset-del'+(delArmed?' armed':''));del.type='button';del.title='删除预设（已套用的项目不受影响）';del.onclick=async()=>{if(!delArmed){presetArm='del:'+p.id;drawPresetPop();return;}presetArm=null;try{await act('teamPresetDelete',{presetId:p.id},del);}catch{}};
      row.append(apply,upd,star,del);pop.append(row);}
    const form=el('form',null,'tc-preset-new'),input=el('input');input.id='tc-preset-name';input.placeholder='新预设名称，如：前后端小队';input.maxLength=40;input.value=keep;const save=el('button','存为预设','tc-primary');save.type='submit';form.append(input,save);
    form.onsubmit=async event=>{event.preventDefault();const name=input.value.trim();if(!name){input.focus();return;}if(!canvasMembers().length){notice('画布上还没有成员，先把成员加进来再存预设',true);return;}try{await act('teamPresetSave',{name},save);$('tc-preset-name')&&($('tc-preset-name').value='');}catch{}};
    pop.append(form);if(focused)input.focus();}
  $('tc-preset-btn').onclick=event=>{event.stopPropagation();if($('tc-presetpop').hidden){presetArm=null;drawPresetPop();$('tc-presetpop').hidden=false;$('tc-preset-btn').setAttribute('aria-expanded','true');}else closePresetPop();};
  function render(value){
    const previous=data;data=value;if(previous&&previous.workspaceId!==data.workspaceId){wEdits={};closeWidgetEdit(false);closeWidgetPop();}applyEdits();if(previous&&previous.workspaceId!==data.workspaceId){localPos={};lastChatKey='';lastConvKey='';linkFrom=null;selectedEdge=null;channel='group';selection.clear();pendingLinks.clear();closeEditor();}
    if(!previous||previous.workspaceId!==data.workspaceId){const v=views[data.workspaceId];view=v&&Number.isFinite(v.k)&&Number.isFinite(v.x)&&Number.isFinite(v.y)?{x:v.x,y:v.y,k:v.k}:{x:0,y:0,k:1};canvasHooks.needFit=!v;remember();}
    const enabled=data.collaborationEnabled===true;
    // 协作不再提供关闭开关：没开启就自动开启一次（失败时留「重试」按钮）
    if(!enabled&&!autoEnableTried){autoEnableTried=true;enableCollab();}
    $('tc-off').hidden=enabled;$('collaboration-content').hidden=!enabled;$('workspace').disabled=!enabled;$('add-workspace').disabled=!enabled;document.querySelector('.tc-tabs').hidden=!enabled;
    if(!enabled)return;
    const ws=$('workspace'),wsSig=JSON.stringify((data.workspaces||[]).map(w=>[w.id,w.name,w.root]));if(ws.dataset.sig!==wsSig||!ws.options.length){ws.replaceChildren(option('global','通用（未指定项目）'),...(data.workspaces||[]).map(w=>{const o=option(w.id,w.name);o.title=w.root;return o;}));ws.dataset.sig=wsSig;}if(ws.value!==data.workspaceId)ws.value=data.workspaceId;ws.title=(data.workspaces||[]).find(w=>w.id===data.workspaceId)?.root||'';
    if(data.staff?.error)notice(data.staff.error,true);
    syncPages();
    if(morePanel&&!members().some(m=>m.id===baseOf(morePanel.id)&&!m.temporary))closeMorePanel();if(!drag&&!marquee)drawCanvas();drawMembers();if(!$('tc-presetpop').hidden)drawPresetPop();drawChatPage();updateHint();updateTabDot();if(editing&&!$('tc-form').hidden){editing=members().find(m=>m.id===editing.id)||editing;drawSubList();}
  }
  let autoEnableTried=false;
  function enableCollab(){if(!data||data.collaborationEnabled===true)return;act('setCollaborationEnabled',{enabled:true,expected_version:data.collaborationVersion||0},$('tc-enable')).catch(()=>{});}
  $('tc-enable').onclick=enableCollab;
  $('workspace').onchange=()=>act('selectWorkspace',{workspaceId:$('workspace').value}).catch(()=>{});
  $('add-workspace').onclick=()=>act('addWorkspace',{},$('add-workspace')).catch(()=>{});
  $('refresh').onclick=()=>act('refresh',{},$('refresh')).catch(()=>{});
  let lastStateSig='';
  window.addEventListener('message',event=>{const message=event.data;if(!message||typeof message!=='object')return;if(message.type==='state'){const sig=JSON.stringify(message.value);if(sig===lastStateSig)return;lastStateSig=sig;render(message.value);return;}if(message.type==='error'){notice(message.message,true);return;}if(message.type==='result'){const entry=pending.get(message.id);if(!entry)return;pending.delete(message.id);if(message.error)entry.reject(Error(message.error));else entry.resolve(message.value);}});
  vscode.postMessage({type:'ready'});
;(()=>{const g=id=>document.getElementById(id);const run=(a,b,inp)=>{try{const r=act(a,inp||{},b);r?.catch?.(()=>{});}catch{}};
  // OpenCode p31: 按扩展端传来的 teamCaps 把语音/MCP 按钮置灰并加提示；不用 disabled，点了仍会让扩展端弹出原因说明
  const ocCap=(id,ok,tip)=>{const b=g(id);if(!b)return;if(b.dataset.ocTitle===undefined)b.dataset.ocTitle=b.title||'';b.classList.toggle('oc-unavailable',!ok);b.setAttribute('aria-disabled',String(!ok));b.title=ok?b.dataset.ocTitle:(tip||'不可用');b.style.opacity=ok?'':'0.45';b.style.cursor=ok?'':'not-allowed';};
  window.addEventListener('message',event=>{const m=event.data;if(!m||m.type!=='state'||!m.value?.teamCaps)return;const c=m.value.teamCaps;ocCap('tc-voice',c.voice!==false,c.voiceTip);ocCap('tc-mcp',c.mcp!==false,c.mcpTip);});
  g('tc-mcp')?.addEventListener('click',e=>run('teamMcp',e.currentTarget));
  g('tc-voice')?.addEventListener('click',e=>run('teamVoice',e.currentTarget));
  g('tc-popout')?.addEventListener('click',e=>{const t=g('tc-input');run('teamOpenChat',e.currentTarget,{text:t?.value||''});});})();
})();

/* canvas-console：团队协作 · 画布控制台（顶栏、左侧「画布上的 AI」、画布分组/卡片/连线/预览、右侧 变更·活动·浏览器）。
   数据全部来自扩展端 canvas-console（Bridge 工具调用记录、任务卡、团队聊天、协作 worker）；没有记录就不显示，不编造。
   用户偏好：没有确认框，也没有成功提示。 */
(() => {
  'use strict';
  const vs = window.__ocVs; if (!vs) return;
  const $ = (id) => document.getElementById(id);
  if (!$('cv-world')) return;
  const PALETTE = ['#4f8cff', '#22b8a6', '#f0a030', '#e0607e', '#9b7bf2', '#4cbb5e', '#e07a3c', '#3fa7d6'];
  const ST = { working: '工作中', waiting: '等消息', idle: '空闲', offline: '离线' };
  const TOOL_CN = { apply_patch: '改文件', write_file: '写文件', edit_file: '改文件', read_files: '读文件', read_file: '读文件', run_command: '跑命令', get_command_output: '看命令输出', search_files: '搜索', codebase_search: '代码检索', find_files: '找文件', list_directory: '看目录', set_todos: '任务卡', update_plan: '任务卡', report_progress: '报告进度', bridge_ask_user: '向你提问', browser_open: '打开网页', browser_close: '关闭标签', browser_list: '查看内置浏览器', browser_screenshot: '网页截图', see_now: '看屏幕' };
  const CARD_W = 196, CARD_H = 74, GAP = 12, PAD = 12, HEAD = 30, BR_W = 272, BR_H = 200;
  const saved = (() => { try { return JSON.parse(localStorage.getItem('oc.cv.ui') || '{}') || {}; } catch { return {}; } })();
  let snap = null, state = null, seq = 0, inflight = false, timer = null;
  // single-canvas: 平移/缩放与成员节点共用（collaboration 部分的 view），这里不再有自己的视图
  const CV = window.__ocCanvas; if (!CV) return;
  let filter = 'all', selected = null, search = '', rtab = saved.rtab || 'activity', afilter = 'all', aiFilter = null, asearch = ''; let collabSub = null;
  // 连线、网页预览一直显示（不再有开关）
  const showLinks = true, showPreviews = true; let needOpen = false;
  const expanded = new Set(); const localGroups = {}; let dragging = null;
  const pending = new Map();
  const persistUi = () => { try { localStorage.setItem('oc.cv.ui', JSON.stringify({ rtab: rtab.startsWith('br:') ? 'activity' : rtab })); } catch {} };

  // ---------- messaging ----------
  function call(action, input = {}) { return new Promise((resolve, reject) => { const id = 'cv_' + (++seq); pending.set(id, { resolve, reject }); vs.postMessage({ type: 'canvas', id, action, input }); setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout')); } }, 60000); }); }
  window.addEventListener('message', (event) => {
    const m = event.data; if (!m || typeof m !== 'object') return;
    if (m.type === 'canvasResult') { const p = pending.get(m.id); if (!p) return; pending.delete(m.id); if (m.error) p.reject(new Error(m.error)); else p.resolve(m.value); return; }
    if (m.type === 'state') { state = m.value; renderHeaderProject(); }
  });
  async function refresh(force) {
    if (inflight && !force) return; inflight = true;
    try { const v = await call('snapshot'); if (v) { snap = v; renderAll(); } } catch {} finally { inflight = false; }
  }
  function schedule() { clearTimeout(timer); const onCanvas = !$('page-canvas').hidden && document.visibilityState === 'visible'; timer = setTimeout(async () => { await refresh(); schedule(); }, onCanvas ? 2000 : 6000); }

  // ---------- helpers ----------
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; };
  const colorOf = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };
  const initial = (n) => ([...String(n || '?').replace(/^[^\p{L}\p{N}]+/u, '')][0] || '?');
  const av = (ai, lg) => { const a = el('span', 'cv-av' + (lg ? ' lg' : ''), initial(ai?.name)); a.style.background = colorOf(ai?.key || ai?.name); a.title = ai?.name || ''; return a; };
  const hms = (t) => { try { return new Date(t).toLocaleTimeString('zh-CN', { hour12: false }); } catch { return ''; } };
  const ago = (t) => { if (!t) return ''; const s = Math.max(0, Math.round(((snap?.now || Date.now()) - t) / 1000)); return s < 60 ? s + ' 秒前' : s < 3600 ? Math.round(s / 60) + ' 分钟前' : s < 86400 ? Math.round(s / 3600) + ' 小时前' : Math.round(s / 86400) + ' 天前'; };
  // collab-refresh: 子代理 / 子会话不上 AI 画布（扩展端带 subagent / parentId 等标记时生效）
  const isSubAi = (a) => !!a && (a.subagent === true || a.isSubagent === true || !!a.parentId || !!a.parentID || !!a.parent || !!a.parentSessionId || a.kind === 'subagent');
  const ais = () => (snap?.ais || []).filter((a) => !isSubAi(a));
  const aiByKey = (k) => ais().find((a) => a.key === k);
  const projName = (id) => snap?.projects?.find((p) => p.id === id)?.name || '没在项目里';
  const statusOf = (a) => a.needs > 0 ? { cls: 'needs', text: '等你 ' + a.needs } : a.stuck ? { cls: 'stuck', text: '可能卡住' } : { cls: a.status, text: ST[a.status] || a.status };
  const matchFilter = (a) => filter === 'all' || (filter === 'working' && a.status === 'working') || (filter === 'needs' && a.needs > 0) || (filter === 'stuck' && a.stuck) || (filter === 'offline' && a.status === 'offline');
  const matchSearch = (a) => { if (!search) return true; const q = search.toLowerCase(); return [a.name, a.client, a.card?.title, projName(a.project), a.lastTool].some((x) => String(x || '').toLowerCase().includes(q)); };

  // groups: projects with AIs, the current project, and projects the user placed on the canvas; "没在项目里" last
  function groups() {
    const list = [], cur = snap?.current, placed = snap?.layout?.groups || {};
    const ids = new Set(ais().map((a) => a.project).filter(Boolean));
    for (const p of snap?.projects || []) if (ids.has(p.id) || p.id === cur || placed[p.id]) list.push({ id: p.id, name: p.name, root: p.root, items: ais().filter((a) => a.project === p.id) });
    list.sort((a, b) => (b.id === cur) - (a.id === cur) || score(b) - score(a) || a.name.localeCompare(b.name));
    const loose = ais().filter((a) => !a.project);
    if (loose.length) list.push({ id: '__none', name: '没在项目里', none: true, items: loose });
    return list;
  }
  const score = (g) => g.items.reduce((s, a) => s + (a.needs ? 100 : 0) + (a.status === 'working' ? 10 : a.status === 'offline' ? 0 : 3), 0);
  function groupSize(g) { const n = g.items.length, cols = Math.max(1, Math.min(3, n)), rows = Math.max(1, Math.ceil(n / cols)); return { w: Math.max(240, PAD * 2 + cols * CARD_W + (cols - 1) * GAP), h: n ? HEAD + rows * (CARD_H + GAP) - GAP + PAD : HEAD + 8, cols }; }
  const memberId = (a) => String(a?.key || '').startsWith('member:') ? String(a.key).slice(7) : null;
  const asNode = (a) => { const id = memberId(a); return !!id && a.kind === 'api' && !!CV.memberBox(id); };
  let autoPlaced = {}, autoWs = null;
  function layout() {
    // 成员状态还没到时不固定位置；换项目后重新排
    const pin = CV.ready(); if (pin && autoWs !== CV.ws()) { autoPlaced = {}; autoWs = CV.ws(); }
    const scratch = pin ? autoPlaced : { ...autoPlaced };
    const gs = groups().map((g) => ({ ...g, items: g.items.filter((a) => !asNode(a)) })).filter((g) => g.items.length), placed = snap?.layout?.groups || {}, out = [];
    const mb = CV.memberBounds(), X0 = mb ? mb.x2 + 120 : 40, Y0 = mb ? mb.y1 : 84;
    const taken = Object.values(scratch);
    let x = Math.max(X0, ...taken.map((r) => r.x + r.w + 40)), y = Y0, rowH = 0; const MAXW = 1500;
    const browsers = showPreviews ? (snap?.browser?.tabs || []) : [];
    for (const g of gs) {
      const sz = groupSize(g); let p = localGroups[g.id] || placed[g.id] || scratch[g.id];
      let gx, gy;
      if (!p) { if (x > X0 && x + sz.w > X0 + MAXW) { x = X0; y += rowH + 40 + BR_H + 24; rowH = 0; } p = scratch[g.id] = { x, y, w: sz.w }; x += sz.w + 40; rowH = Math.max(rowH, sz.h); }
      gx = p.x; gy = p.y;
      const cards = g.items.map((a, i) => ({ ai: a, x: gx + PAD + (i % sz.cols) * (CARD_W + GAP), y: gy + HEAD + Math.floor(i / sz.cols) * (CARD_H + GAP) }));
      out.push({ ...g, x: gx, y: gy, w: sz.w, h: sz.h, cards });
    }
    // browser previews: under the group of the AI that opened the tab, otherwise in a row after the groups
    const br = [];
    let bx = Math.max(X0, ...out.map((g) => g.x + g.w + 40)), by = Y0;
    for (const t of browsers) {
      const owner = t.ai ? out.find((g) => g.cards.some((c) => c.ai.key === t.ai)) : null;
      const stacked = owner ? br.filter((b) => b.group === owner.id).length : 0;
      if (owner) br.push({ tab: t, group: owner.id, x: owner.x + stacked * (BR_W + 16), y: owner.y + owner.h + 24 });
      else { br.push({ tab: t, x: bx, y: by }); bx += BR_W + 16; }
    }
    return { groups: out, browsers: br };
  }

  // ---------- header ----------
  function renderHeaderProject() {
    const span = $('cv-proj-path'); if (!span || !state) return;
    const w = (state.workspaces || []).find((x) => x.id === state.workspaceId);
    span.textContent = w?.root || (state.workspaceId === 'global' ? '' : '');
    span.title = w?.root || '';
  }
  function renderHeader() {
    const all = ais(), online = all.filter((a) => a.status !== 'offline');
    const box = $('cv-online'), osig = JSON.stringify([all.length, online.map((a) => [a.key, a.name])]); box.title = online.map((a) => `${a.name} · ${statusOf(a).text}`).join('\n') || '没有在线的 AI'; if (box.dataset.sig === osig) return; box.dataset.sig = osig; box.replaceChildren();
    box.append(el('i', 'cv-dot-on'), el('span', '', `${online.length} / ${all.length} 个 AI 在线`));
    const avs = el('span', 'cv-avs'); for (const a of online.slice(0, 5)) avs.append(av(a)); box.append(avs);
    box.title = online.map((a) => `${a.name} · ${statusOf(a).text}`).join('\n') || '没有在线的 AI';
  }

  // ---------- left sidebar ----------
  let sideSig = '';
  function renderSide() {
    const box = $('cv-side-list');
    const sig = JSON.stringify([search, filter, selected, groups().map((g) => [g.id, g.name, g.root, g.items.map((a) => [a.key, a.name, a.status, a.needs, a.stuck, statusOf(a).text])])]);
    if (sig === sideSig && box.childNodes.length) return; sideSig = sig; box.replaceChildren(); const sideRows = [];
    if (!ais().length && !groups().length) { box.append(el('div', 'cv-sg-empty cv-side-none', '暂无 AI')); return; }
    for (const g of groups()) {
      const items = g.items.filter((a) => matchSearch(a) && matchFilter(a));
      if (search && !items.length && !g.name.toLowerCase().includes(search.toLowerCase())) continue;
      const sec = el('div', 'cv-sg');
      const head = el('div', 'cv-sg-head'); head.append(el('span', '', g.none ? '◌' : '▣'), el('span', '', g.name), el('span', 'tc-grow'), el('span', '', String(g.items.length)));
      head.title = g.root || (g.none ? '没有加入任何项目的 AI（没用 chat_join 指定项目，也没从路径推断出项目）' : '');
      head.onclick = () => focusGroup(g.id);
      sec.append(head);
      if (!items.length) sec.append(el('div', 'cv-sg-empty', g.items.length ? '没有符合筛选的 AI' : '没有 AI'));
      for (const a of items) {
        const st = statusOf(a), row = el('div', 'cv-si' + (selected === a.key ? ' sel' : '') + (a.status === 'offline' ? ' offline' : ''));
        row.append(el('i', 'cv-sdot ' + (a.needs ? 'needs' : a.stuck ? 'stuck' : a.status)), el('span', 'cv-si-name', a.name), el('span', 'cv-st' + (a.needs ? ' needs' : a.stuck ? ' stuck' : ''), st.text));
        row.title = tipOf(a); row.onmouseenter = () => { const cur = aiByKey(a.key); if (cur) row.title = tipOf(cur); };
        row.onclick = () => select(a.key, true);
        sec.append(row); sideRows.push([a.key, row]);
      }
      box.append(sec);
    }
    enterSide(sideRows);
  }
  const tipOf = (a) => [a.name, `${a.kind === 'api' ? 'API 模型 ' + (a.client || '') : a.kind === 'local' ? '本机 OpenCode 智能体' : '外部 AI · ' + (a.client || 'MCP')}`, `状态：${statusOf(a).text}${a.stuck ? '（' + a.stuckReason + '）' : ''}`, a.card ? `任务卡：${a.card.title}（${a.card.done}/${a.card.total}）` : '', a.lastAt ? `最后活动：${ago(a.lastAt)}${a.lastTool ? ' · ' + a.lastTool : ''}` : '', a.project ? `项目：${projName(a.project)}${a.projectSource === 'inferred' ? '（从文件路径推断）' : ''}` : ''].filter(Boolean).join('\n');
  $('cv-search').oninput = (e) => { search = e.target.value.trim(); renderSide(); renderCanvas(); };
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !$('page-canvas').hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) { e.preventDefault(); $('cv-search').focus(); } if (e.key === 'Escape' && needOpen) { needOpen = false; renderNeeds(); } });

  // ---------- chips + 等你 ----------
  let chipSig = '';
  function renderChips() {
    const all = ais(), box = $('cv-chips');
    const n = { all: all.length, working: all.filter((a) => a.status === 'working').length, needs: (snap?.needs || []).length, stuck: all.filter((a) => a.stuck).length, offline: all.filter((a) => a.status === 'offline').length };
    const sig = JSON.stringify([n, filter]); if (sig === chipSig) return; chipSig = sig;
    box.replaceChildren(); box.hidden = !n.all && !n.needs;
    if (box.hidden) return;
    // collab-refresh: 计数为 0 的筛选不显示（正在用的筛选除外）；每个都有说明
    const chip = (key, text, count, title, cls) => { if (key !== 'all' && !count && filter !== key) return; const b = el('button', 'cv-chip' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.title = title; b.setAttribute('aria-pressed', String(filter === key)); b.onclick = () => { filter = filter === key ? 'all' : key; if (key === 'needs') needOpen = filter === 'needs'; else needOpen = false; renderAll(); }; box.append(b); };
    chip('all', `全部 ${n.all}`, n.all, '显示全部 AI');
    chip('working', `工作中 ${n.working}`, n.working, '只看正在工作的 AI');
    chip('needs', `等你 ${n.needs}`, n.needs, '只看等你处理的 AI，并打开待处理列表', n.needs ? 'warn' : '');
    chip('stuck', `可能卡住 ${n.stuck}`, n.stuck, '只看可能卡住的 AI（长时间没有进展或一个工具跑太久）', n.stuck ? 'bad' : '');
    chip('offline', `离线 ${n.offline}`, n.offline, '只看离线的 AI');
    if (n.needs) {
      const seen = el('button', 'cv-chip', '全部看过'); seen.type = 'button'; seen.title = '把「等你」列表里的 ' + n.needs + ' 条都标为已看过';
      seen.onclick = async () => { const ids = (snap?.needs || []).map((x) => x.id); needOpen = false; if (filter === 'needs') filter = 'all'; try { const v = await call('seen', { ids }); if (v) { snap = v; renderAll(); } } catch {} };
      box.append(seen);
    }
  }
  function renderNeeds() {
    const pop = $('cv-needpop'); pop.hidden = !needOpen; if (!needOpen) return; pop.replaceChildren();
    const list = snap?.needs || [];
    if (!list.length) { pop.append(el('div', 'cv-need-empty', '没有等你处理的事。')); return; }
    for (const n of list) {
      const a = aiByKey(n.ai), row = el('div', 'cv-need'), main = el('div', 'cv-need-main'), top = el('div', 'cv-need-top');
      top.append(el('b', '', a?.name || n.ai), el('span', 'cv-st', n.source === 'question' ? '提问' : n.source === 'blocked' ? '受阻' : '群聊 · ' + projName(n.project)), el('span', 'cv-time', hms(n.at)));
      main.append(top, el('div', 'cv-need-text', n.text));
      row.append(av(a || { name: n.ai, key: n.ai }), main);
      row.title = n.source === 'question' ? '这道题在「任务」面板里回答；点一下标为看过' : n.source === 'chat' ? '点一下标为看过并打开该项目的群聊' : '点一下标为看过';
      row.onclick = async () => { try { const v = await call('seen', { ids: [n.id] }); if (v) snap = v; } catch {} if (n.source === 'chat' && n.project) { try { await call('openChat', { project: n.project }); } catch {} $('tab-chat')?.click(); } renderAll(); };
      pop.append(row);
    }
  }

  // ---------- canvas ----------
  let lastLayout = null;
  // collab-refresh: 画布每 2 秒取一次快照；按 key 复用元素（分组 g:/卡片 c:/网页 b:），只改变了的内容，不整块重建
  const nodeCache = new Map();
  // collab-style: 新出现的 AI 卡片 / 分组 / 网页预览、侧栏新行才播入场
  const enterCards = CV.makeEnter(), enterSide = CV.makeEnter();
  function renderCanvas() {
    if (!snap || dragging) return;
    const L = layout(); lastLayout = L;
    const items = $('cv-items'), want = [];
    for (const b of L.browsers) want.push(['b:' + b.tab.id, (old) => browserCard(b, old)]);
    for (const g of L.groups) { want.push(['g:' + g.id, (old) => groupBox(g, old)]); for (const c of g.cards) want.push(['c:' + c.ai.key, (old) => { const n = card(c, old); n.dataset.g = g.id; return n; }]); }
    const keep = new Set(want.map((w) => w[0]));
    for (const [k, n] of nodeCache) if (!keep.has(k)) { n.remove(); nodeCache.delete(k); }
    let i = 0;
    for (const [k, make] of want) { const n = make(nodeCache.get(k)); nodeCache.set(k, n); const at = items.children[i]; if (at !== n) items.insertBefore(n, at || null); i++; }
    enterCards(want.map((w) => [w[0], nodeCache.get(w[0])]));
    while (items.children.length > i) items.lastElementChild.remove();
    renderLinks(L);
    CV.aiChanged();
  }
  function groupBox(g, old) {
    const needs = g.items.reduce((s, a) => s + a.needs, 0);
    const box = old || el('div');
    box.className = 'cv-group' + (g.id === snap.current ? ' current' : '') + (g.none ? ' nogroup' : '') + (needs ? ' has-needs' : ''); box.dataset.g = g.id; box._g = g;
    box.style.left = g.x + 'px'; box.style.top = g.y + 'px'; box.style.width = g.w + 'px'; box.style.height = g.h + 'px'; box.style.transform = '';
    const sig = JSON.stringify([g.name, g.none, g.items.length, needs, g.root]);
    if (box._sig !== sig) {
      box._sig = sig;
      const head = el('div', 'cv-group-head'); head.append(el('span', '', g.none ? '◌' : '▣'), el('span', '', g.name), el('span', 'cv-gcount', String(g.items.length)));
      if (needs) head.append(el('span', 'cv-badge', '等你 ' + needs));
      head.title = (g.root || g.name) + '\n拖动移动分组';
      head.addEventListener('pointerdown', (e) => startGroupDrag(e, box._g));
      box.replaceChildren(head);
    }
    return box;
  }
  function card(c, old) {
    const a = c.ai, st = statusOf(a);
    const dim = !(matchFilter(a) && matchSearch(a));
    const n = old || el('div');
    n.className = 'cv-card' + (selected === a.key ? ' sel' : '') + (dim ? ' dim' : '') + (a.status === 'offline' ? ' offline' : '') + (a.needs ? ' needs' : a.stuck ? ' stuck' : '');
    n.style.left = c.x + 'px'; n.style.top = c.y + 'px'; n.style.transform = ''; n.dataset.ai = a.key;
    const running = a.running?.find((r) => r.tool && !/wait/.test(r.tool));
    const line = a.stuck ? a.stuckReason : running ? `正在 ${TOOL_CN[running.tool] || running.tool}` : a.detail ? a.detail : a.card ? `${a.card.title}（${a.card.done}/${a.card.total}）` : a.lastAt ? `${a.lastTool ? (TOOL_CN[a.lastTool] || a.lastTool) + ' · ' : ''}${ago(a.lastAt)}` : '';
    const sub = a.kind === 'api' ? 'API · ' + (a.client || '') : a.kind === 'local' ? '本机 OpenCode' : (a.client || '外部 MCP') + (a.explicit ? '' : ' · 未用 chat_join 命名');
    const spin = a.status === 'waiting' && !a.needs && !a.stuck;
    const sig = JSON.stringify([a.key, a.name, st.cls, st.text, spin, line, !!a.stuck, sub]);
    if (n._sig !== sig) {
      n._sig = sig;
      const top = el('div', 'cv-card-top'); const pill = el('span', 'cv-pill ' + st.cls);
      if (spin) pill.append(el('i', 'cv-spin'));
      pill.append(document.createTextNode(st.text));
      top.append(av(a), el('span', 'cv-card-name', a.name), pill);
      n.replaceChildren(top, el('div', 'cv-card-line' + (a.stuck ? ' err' : ''), line || ' '), el('div', 'cv-card-sub', sub));
    }
    n.title = tipOf(a);
    if (!old) {
      n.addEventListener('pointerdown', (e) => e.stopPropagation());
      n.onclick = () => select(n.dataset.ai, false);
      n.ondblclick = async () => { const cur = aiByKey(n.dataset.ai); if (cur?.project) { try { await call('openChat', { project: cur.project }); } catch {} } $('tab-chat')?.click(); };
    }
    return n;
  }
  function browserCard(b, old) {
    const t = b.tab, n = old || el('div', 'cv-browser'); n.style.left = b.x + 'px'; n.style.top = b.y + 'px'; n.style.transform = ''; n._tid = t.id;
    const who = t.ai ? aiByKey(t.ai) : null;
    const sig = JSON.stringify([t.title, t.url, who?.key, who?.name]);
    if (n._sig !== sig) { n._sig = sig; const bar = el('div', 'cv-browser-bar'); if (who) bar.append(av(who)); bar.append(el('span', '', t.title || t.url || '网页')); n._bar = bar; n._url = el('div', 'cv-browser-url', t.url || ''); }
    // 截图没变就保留同一个 <img>，不会闪
    let media = n._media;
    if (t.shot) { if (!media || media.tagName !== 'IMG') { media = el('img'); n._shot = null; } if (n._shot !== t.shot) { media.src = t.shot; n._shot = t.shot; } media.alt = t.title || ''; }
    else { const txt = t.shotError ? '预览不可用：' + t.shotError : '还没有截图'; if (!media || media.tagName === 'IMG' || media.textContent !== txt) media = el('div', 'cv-browser-none', txt); n._shot = null; }
    n._media = media;
    const kids = [n._bar, n._url, media];
    if (n.children.length !== 3 || kids.some((k, i) => n.children[i] !== k)) n.replaceChildren(...kids);
    n.title = `${t.title || ''}\n${t.url || ''}${who ? '\n打开者：' + who.name : ''}${t.shotAt ? '\n截图时间：' + hms(t.shotAt) : ''}`;
    if (!old) { n.addEventListener('pointerdown', (e) => e.stopPropagation()); n.onclick = () => { rtab = 'br:' + n._tid; renderRight(); }; }
    return n;
  }
  let linksSig = '';
  function renderLinks(L) {
    const g = $('cv-links-g');
    const pos = new Map(); for (const gr of L.groups) for (const c of gr.cards) pos.set(c.ai.key, { x: c.x, y: c.y, w: CARD_W, h: CARD_H });
    for (const l of snap?.links || []) for (const k of [l.from, l.to]) if (!pos.has(k) && String(k).startsWith('member:')) { const b = CV.memberBox(String(k).slice(7)); if (b) pos.set(k, b); }
    const links = (snap?.links || []).filter((l) => l.kind !== 'manage' && pos.has(l.from) && pos.has(l.to));
    const lsig = JSON.stringify([showLinks, selected, showLinks ? links.map((l) => [l.from, l.to, l.kind, l.label, pos.get(l.from).x, pos.get(l.from).y, pos.get(l.to).x, pos.get(l.to).y, aiByKey(l.from)?.name, aiByKey(l.to)?.name]) : 0]);
    if (lsig === linksSig) return; linksSig = lsig; g.replaceChildren(); if (!showLinks) return;
    for (const l of links) {
      const a = pos.get(l.from), b = pos.get(l.to); if (!a || !b || a === b) continue;
      const right = b.x >= a.x;
      const x1 = right ? a.x + a.w : a.x, y1 = a.y + Math.min(a.h, CARD_H) / 2, x2 = right ? b.x : b.x + b.w, y2 = b.y + Math.min(b.h, CARD_H) / 2, dx = Math.max(40, Math.abs(x2 - x1) / 2) * (right ? 1 : -1);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`);
      p.setAttribute('class', 'cv-link ' + (l.kind || 'chat') + (selected && (l.from === selected || l.to === selected) ? ' hot' : ''));
      if (l.kind !== 'manage') p.setAttribute('marker-end', 'url(#cv-arrow)');
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = `${aiByKey(l.from)?.name || l.from} → ${aiByKey(l.to)?.name || l.to}：${l.label || ''}`; p.append(t);
      g.append(p);
    }
  }
  function bounds(L = lastLayout) {
    if (!L) return null; let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const g of L.groups) { x1 = Math.min(x1, g.x); y1 = Math.min(y1, g.y); x2 = Math.max(x2, g.x + g.w); y2 = Math.max(y2, g.y + g.h); }
    for (const b of L.browsers) { x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + BR_W); y2 = Math.max(y2, b.y + BR_H); }
    return Number.isFinite(x1) ? { x1, y1, x2, y2 } : null;
  }
  const centerOn = (x, y) => CV.centerOn(x, y);
  function focusGroup(id) { const g = lastLayout?.groups.find((x) => x.id === id); if (g) centerOn(g.x + g.w / 2, g.y + g.h / 2); }
  function select(key, focus) {
    selected = selected === key && !focus ? null : key; aiFilter = selected; if (selected && !rtab.startsWith('br:')) rtab = 'activity';
    if (focus && selected) { const c = lastLayout?.groups.flatMap((g) => g.cards).find((c) => c.ai.key === key); if (c) centerOn(c.x + CARD_W / 2, c.y + CARD_H / 2); else if (memberId({ key })) CV.selectMember(memberId({ key })); }
    renderSide(); renderCanvas(); renderRight();
  }
  function startGroupDrag(e, g) {
    if (e.button !== 0) return; e.stopPropagation();
    const head = e.currentTarget; head.setPointerCapture(e.pointerId);
    const els = [...document.querySelectorAll('#cv-items [data-g]')].filter((n) => n.dataset.g === g.id);
    dragging = { id: g.id, sx: e.clientX, sy: e.clientY, x: g.x, y: g.y, moved: false, dx: 0, dy: 0 };
    const move = (ev) => { const k = CV.view().k, dx = (ev.clientX - dragging.sx) / k, dy = (ev.clientY - dragging.sy) / k; if (Math.abs(dx) + Math.abs(dy) > 2) dragging.moved = true; dragging.dx = dx; dragging.dy = dy; for (const n of els) n.style.transform = `translate(${dx}px, ${dy}px)`; };
    const up = () => { head.removeEventListener('pointermove', move); head.removeEventListener('pointerup', up); head.removeEventListener('pointercancel', up); const d = dragging; dragging = null; if (d?.moved) { localGroups[g.id] = { x: Math.round(d.x + d.dx), y: Math.round(d.y + d.dy) }; renderCanvas(); call('layout', { groups: { [g.id]: localGroups[g.id] } }).catch(() => {}); } };
    head.addEventListener('pointermove', move); head.addEventListener('pointerup', up); head.addEventListener('pointercancel', up);
  }
  // canvas-toolbar-edit: 自动排列＝成员按上下级排好 + AI 分组回默认位置；居中＝选中的 AI / 成员，没选时当前项目
  $('cv-autolayout').onclick = async () => { const placed = snap?.layout?.groups || {}, drop = Object.fromEntries([...Object.keys(placed), ...Object.keys(localGroups)].map((k) => [k, null])); for (const k of Object.keys(localGroups)) delete localGroups[k]; if (snap?.layout) snap.layout.groups = {}; autoPlaced = {}; try { await CV.autoArrange(); } catch {} if (Object.keys(drop).length) { try { await call('layout', { groups: drop }); } catch {} } renderCanvas(); CV.animView(() => CV.fit()); refresh(true); };
  $('cv-focus').onclick = () => CV.animView(() => focusNow());
  const focusNow = () => { if (selected) { select(selected, true); return; } if (CV.focusMember()) return; const g = lastLayout?.groups.find((x) => x.id === snap?.current) || lastLayout?.groups[0]; if (g) focusGroup(g.id); else CV.fit(); };
  // fit / minimap / free-spot search on the shared canvas see the live-AI groups and previews
  CV.setAiRects(() => { const L = lastLayout; if (!L) return []; return [...L.groups.map((g) => ({ x: g.x, y: g.y, w: g.w, h: g.h, kind: 'grp' })), ...L.browsers.map((b) => ({ x: b.x, y: b.y, w: BR_W, h: BR_H, kind: 'br' }))]; });

  // ---------- right panel ----------
  function renderRight() {
    const tabs = $('cv-rtabs'), body = $('cv-rbody'); tabs.replaceChildren();
    const browsers = snap?.browser?.tabs || [];
    if (rtab.startsWith('br:') && !browsers.some((t) => 'br:' + t.id === rtab)) rtab = 'activity';
    const tab = (id, text, title) => { const b = el('button', 'cv-rtab'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(rtab === id)); b.append(el('span', '', text)); if (title) b.title = title; b.onclick = () => { rtab = id; persistUi(); renderRight(); }; tabs.append(b); };
    tab('changes', `变更 ${snap?.changes?.length || 0}`, 'AI 改过的文件（来自 Bridge 写文件工具调用）');
    tab('activity', '活动', 'AI 的工具调用与协作记录');
    for (const t of browsers) tab('br:' + t.id, '◫ ' + (t.title || t.url || '网页'), t.url);
    const keepScroll = body.querySelector('.cv-alist')?.scrollTop || 0, keepTab = body.dataset.tab; body.dataset.tab = rtab;
    body.replaceChildren();
    if (rtab === 'changes') renderChanges(body); else if (rtab.startsWith('br:')) renderBrowserTab(body, browsers.find((t) => 'br:' + t.id === rtab)); else renderActivity(body);
    if (keepTab === rtab) { const l = body.querySelector('.cv-alist'); if (l) l.scrollTop = keepScroll; }
  }
  function renderChanges(body) {
    const list = (snap?.changes || []).filter((c) => !aiFilter || c.ais.includes(aiFilter));
    const wrap = el('div', 'cv-alist');
    if (aiFilter) { const n = el('div', 'cv-note'); n.append(document.createTextNode('只看 ' + (aiByKey(aiFilter)?.name || aiFilter) + ' 改的文件 · ')); const x = el('a', 'cv-link-btn', '看全部'); x.onclick = () => { aiFilter = null; selected = null; renderAll(); }; n.append(x); body.append(n); }
    if (!list.length) wrap.append(el('div', 'cv-list-empty', 'AI 还没有通过 Bridge 改过文件。'));
    for (const c of list) {
      const row = el('div', 'cv-change'), main = el('div', 'cv-change-main'), p = String(c.path).replace(/\\/g, '/'), i = p.lastIndexOf('/');
      main.append(el('div', 'cv-change-file', i >= 0 ? p.slice(i + 1) : p), el('div', 'cv-change-dir', (i >= 0 ? p.slice(0, i) : '') + (c.project ? ' · ' + projName(c.project) : '')));
      const avs = el('span', 'cv-avs'); for (const k of c.ais.slice(0, 4)) avs.append(av(aiByKey(k) || { key: k, name: k }));
      row.append(main, avs, el('span', 'cv-change-count', c.count > 1 ? c.count + ' 次' : ''), el('span', 'cv-time', hms(c.at)));
      row.title = `${c.path}\n${c.ais.map((k) => aiByKey(k)?.name || k).join('、')} · ${c.tool}\n点一下打开文件`;
      row.onclick = () => call('openFile', { path: c.path, project: c.project }).catch(() => {});
      wrap.append(row);
    }
    body.append(wrap);
  }
  function renderActivity(body) {
    const all = snap?.activity || [];
    const segs = el('div', 'cv-afilters');
    const failN = all.filter((e) => e.status === 'error').length;
    for (const [k, t] of [['all', '全部'], ['file', '改文件'], ['chat', '协作'], ['fail', `失败 ${failN}`]]) { const b = el('button', 'cv-seg' + (k === 'fail' && failN ? ' bad' : ''), t); b.type = 'button'; b.setAttribute('aria-pressed', String(afilter === k)); b.onclick = () => { afilter = k; renderRight(); }; segs.append(b); }
    const chips = el('div', 'cv-aichips');
    const allb = el('button', 'cv-aichip all', '所有 AI'); allb.type = 'button'; allb.setAttribute('aria-pressed', String(!aiFilter)); allb.onclick = () => { aiFilter = null; selected = null; renderAll(); }; chips.append(allb);
    const withAct = new Set(all.map((e) => e.ai));
    for (const a of ais().filter((a) => withAct.has(a.key))) { const b = el('button', 'cv-aichip'); b.type = 'button'; b.append(av(a), el('span', '', a.name)); b.setAttribute('aria-pressed', String(aiFilter === a.key)); b.onclick = () => { aiFilter = aiFilter === a.key ? null : a.key; selected = aiFilter; renderAll(); }; chips.append(b); }
    const s = el('input', 'cv-asearch'); s.type = 'search'; s.placeholder = '搜索路径、工具、错误'; s.value = asearch;
    s.oninput = () => { asearch = s.value.trim(); const pos = s.selectionStart; renderList(); s.focus(); try { s.setSelectionRange(pos, pos); } catch {} };
    const list = el('div', 'cv-alist');
    body.append(segs, chips, s, list);
    if (!collabSub && CV.collab) collabSub = CV.collab.subscribe(() => { if (rtab === 'activity' && afilter === 'chat') renderRight(); });
    function teamSection() {
      // 成员之间的协作（派活、交付、审查、打回、上报、临时协作、看板、抢文件），可以在画布上回放
      const C = CV.collab; if (!C || aiFilter) return;
      const q = asearch.toLowerCase(), rp = C.replaying();
      const evs = C.events().filter((e) => !q || [C.label(e.kind), C.who(e), e.text].some((x) => String(x || '').toLowerCase().includes(q))).reverse();
      const head = el('div', 'cv-collab-head');
      head.append(el('span', 'cv-collab-title', '成员之间'), el('span', 'cv-collab-count', evs.length ? evs.length + ' 条' : ''));
      const play = el('button', 'cv-collab-play', rp ? '■ 停止回放' : '▶ 在画布上回放'); play.type = 'button'; play.disabled = !C.events().length; play.title = '按顺序在画布上重演一遍成员之间的协作'; play.onclick = () => C.toggleReplay();
      head.append(play); list.append(head);
      if (rp) { const r = el('input', 'cv-collab-range'); r.type = 'range'; r.min = '0'; r.max = String(Math.max(0, rp.n - 1)); r.value = String(Math.max(0, rp.i - 1)); r.setAttribute('aria-label', '回放进度'); r.oninput = () => C.seek(+r.value); list.append(r); }
      if (!evs.length) list.append(el('div', 'cv-list-empty', C.events().length ? '没有符合条件的协作。' : '成员之间还没有协作。派活、交付、审查、打回、临时拉人、写看板都会记在这里。'));
      for (const e of evs.slice(0, 120)) {
        const row = el('div', 'cv-ae cv-collab-row' + (rp && rp.id === e.id ? ' current' : '')), top = el('div', 'cv-ae-top');
        const k = el('span', 'cv-collab-kind', C.label(e.kind)); k.style.setProperty('--k', C.color(e.kind));
        top.append(k, el('span', 'cv-ae-name', C.who(e)), el('span', 'cv-time', C.time(e.at)));
        row.append(top); if (e.text) row.append(el('div', 'cv-ae-detail', e.text));
        row.title = '点一下在画布上看这一步'; row.onclick = () => C.play(e); list.append(row);
      }
      list.append(el('div', 'cv-collab-head', '外部 AI'));
    }
    function renderList() {
      list.replaceChildren();
      if (afilter === 'chat') teamSection();
      const q = asearch.toLowerCase();
      const items = all.filter((e) => (!aiFilter || e.ai === aiFilter) && (afilter === 'all' || (afilter === 'file' && e.kind === 'file') || (afilter === 'chat' && (e.kind === 'chat' || e.kind === 'wait')) || (afilter === 'fail' && e.status === 'error')) && (!q || [e.tool, TOOL_CN[e.tool], e.detail, e.error, ...(e.paths || []), e.name].some((x) => String(x || '').toLowerCase().includes(q))));
      if (!items.length) { list.append(el('div', 'cv-list-empty', all.length ? '没有符合条件的记录。' : '还没有 AI 活动记录。外部 AI 每次调用 Bridge 工具都会记在这里。')); return; }
      for (const e of items.slice(0, 300)) list.append(entry(e));
    }
    renderList();
  }
  function entry(e) {
    const a = aiByKey(e.ai) || { key: e.ai, name: e.name || e.ai };
    const open = expanded.has(String(e.id));
    const row = el('div', 'cv-ae' + (open ? ' open' : '') + (e.status === 'running' && !e.collapsed ? ' running' : ''));
    const top = el('div', 'cv-ae-top'); const nm = el('span', 'cv-ae-name', a.name); nm.style.color = colorOf(a.key);
    top.append(av(a), nm, el('span', 'cv-ae-tool', TOOL_CN[e.tool] || e.tool));
    if (e.collapsed && e.ongoing) top.append(el('i', 'cv-spin'));
    top.append(el('span', 'cv-time', hms(e.collapsed ? e.lastAt : e.at)), el('span', 'cv-chev', open ? '▾' : '›'));
    row.append(top);
    const d = e.status === 'error' && e.error ? e.error : e.detail;
    if (d) row.append(el('div', 'cv-ae-detail' + (e.status === 'error' ? ' err' : ''), (e.project && e.kind === 'chat' && !String(d).includes(projName(e.project)) ? projName(e.project) + ' · ' : '') + d));
    if (open) {
      const more = el('div', 'cv-ae-more');
      const kv = (k, v) => { more.append(el('span', '', k)); const b = el('b'); if (v instanceof Node) b.append(v); else b.textContent = v; more.append(b); };
      kv('AI', a.name + (a.client ? ' · ' + a.client : ''));
      kv('工具', e.tool);
      if (e.collapsed) kv('次数', `${e.count} 次，${hms(e.firstAt)} – ${hms(e.lastAt)}`);
      kv('状态', e.status === 'running' ? '进行中' : e.status === 'error' ? '失败' : e.status === 'unknown' ? '结果未知（OpenCode 重启前未结束）' : '完成');
      if (e.durationMs !== undefined && !e.collapsed) kv('用时', (e.durationMs / 1000).toFixed(1) + ' 秒');
      if (e.project) kv('项目', projName(e.project));
      if (e.detail && e.status === 'error') kv('内容', e.detail);
      for (const p of e.paths || []) { const l = el('a', '', p); l.onclick = (ev) => { ev.stopPropagation(); call('openFile', { path: p, project: e.project }).catch(() => {}); }; kv('文件', l); }
      row.append(more);
    }
    row.onclick = () => { const k = String(e.id); if (expanded.has(k)) expanded.delete(k); else expanded.add(k); renderRight(); };
    return row;
  }
  function renderBrowserTab(body, t) {
    const v = el('div', 'cv-bview');
    if (!t) { body.append(v); return; }
    const who = t.ai ? aiByKey(t.ai) : null;
    v.append(el('div', 'cv-burl', `${t.url || ''}${who ? ' · 打开者：' + who.name : ''}${t.shotAt ? ' · 截图 ' + hms(t.shotAt) : ''}`));
    if (t.shot) { const img = el('img'); img.src = t.shot; v.append(img); } else v.append(el('div', 'cv-list-empty', t.shotError ? '预览不可用：' + t.shotError : '还没有截图'));
    v.append(el('div', 'cv-note', '预览由 OpenCode 内置浏览器的 CDP 截图生成，画布可见时约每 5 秒更新一次。'));
    body.append(v);
  }

  let lastSig = '';
  function renderAll() {
    if (!snap) return;
    renderHeader(); renderChips(); renderNeeds(); renderSide(); renderCanvas();
    // keep the right panel stable while the user reads it: re-render only when its data changed (or every 15 s for running waits)
    const sig = [rtab, afilter, aiFilter, asearch, snap.changes?.length, (snap.activity || []).slice(0, 60).map((e) => e.id + e.status + (e.count || '') + (e.detail || '').length).join(','), (snap.browser?.tabs || []).map((t) => t.id + (t.shotAt || '')).join(','), Math.floor(snap.now / 15000)].join('|');
    if (sig !== lastSig || !$('cv-rbody').childNodes.length) { lastSig = sig; const ae = document.activeElement; const typing = ae && ae.classList?.contains('cv-asearch'); if (!typing) renderRight(); }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(true); });
  new MutationObserver(() => { if (!$('page-canvas').hidden) { refresh(true); } }).observe($('page-canvas'), { attributes: true, attributeFilter: ['hidden'] });
  refresh(true).then(schedule);
})();

/* 矢量图标：把界面里的 emoji / 符号换成 codicon 风格的线性 SVG（不碰消息正文与输入框） */
(() => {
  'use strict';
  const P = {
    add: '<path d="M8 3v10M3 8h10"/>',
    refresh: '<path d="M13 8a5 5 0 1 1-1.5-3.6"/><path d="M13 2.5v3h-3"/>',
    close: '<path d="M4 4l8 8M12 4l-8 8"/>',
    stop: '<rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" stroke="none"/>',
    chevron: '<path d="M4.5 6.5L8 10l3.5-3.5"/>',
    comment: '<path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"/>',
    tasks: '<path d="M7 4.5h6.5M7 8h6.5M7 11.5h6.5"/><path d="M2.5 4.5l1 1 1.8-2M2.5 8l1 1 1.8-2M2.5 11.5l1 1 1.8-2"/>',
    person: '<circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4"/>',
    target: '<circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/>',
    lock: '<rect x="3.5" y="7" width="9" height="6.5" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
    down: '<path d="M8 2.5v11M4 9.5l4 4 4-4"/>',
    swap: '<path d="M2.5 5.5h11M10.5 2.5l3 3-3 3M13.5 10.5h-11M5.5 7.5l-3 3 3 3"/>',
    warn: '<path d="M8 2l6.5 11.5h-13z"/><path d="M8 6.5v3.5M8 11.8v.2"/>',
    star: '<path d="M8 2l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3 4.3 13.3l.8-4.1L2 6.3l4.2-.5z"/>'
  };
  const MAP = { '＋': 'add', '⟳': 'refresh', '✕': 'close', '■': 'stop', '▾': 'chevron', '💬': 'comment', '📋': 'tasks', '👤': 'person', '◎': 'target', '🔒': 'lock', '↓': 'down', '⇄': 'swap', '⚠': 'warn', '★': 'star', '☆': 'star' };
  const RE = /(＋|⟳|✕|■|▾|💬|📋|👤|◎|🔒|↓|⇄|⚠️?|★|☆)\uFE0F?/u;
  const SKIP = '.tc-bubble,.tc-messages .tc-msg-col,textarea,input,select,option,script,style,svg,.tc-input-mirror,.tc-conv-last,.cv-page';
  function icon(name) {
    const s = document.createElement('span'); s.className = 'tc-ic tc-ic-' + name; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' + P[name] + '</svg>';
    return s;
  }
  function fix(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => RE.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      let text = node.nodeValue; const frag = document.createDocumentFragment(); let m;
      while ((m = text.match(RE))) {
        const before = text.slice(0, m.index).replace(/\s+$/, ''); if (before) frag.append(before);
        frag.append(icon(MAP[m[1].replace('\uFE0F', '')] || 'warn'));
        text = text.slice(m.index + m[0].length).replace(/^\s+/, '');
      }
      if (text) frag.append(text);
      node.replaceWith(frag);
    }
  }
  let queued = false;
  const run = () => { queued = false; fix(document.body); };
  const start = () => { run(); new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
