// Headless e2e for collab-ports（接口节点）on the 团队协作 canvas.
// node tasks/collab-ports-20261120-1320/test-ports-canvas.mjs   (needs Microsoft Edge; no OpenCode needed)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const OUT = path.join(root, "tasks/collab-ports-20261120-1320");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ports-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const stub = `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const CAT={ports:{persona:{label:'人设',kind:'single'},model:{label:'模型',kind:'single'},perm:{label:'权限',kind:'single'},tools:{label:'工具',kind:'list'},workspace:{label:'工作区',kind:'single'},knowledge:{label:'知识',kind:'list'},rules:{label:'规范',kind:'list'},board:{label:'看板',kind:'single'}},order:['persona','model','perm','tools','workspace','knowledge','rules','board'],
 providers:{persona:{label:'人设',port:'persona'},model:{label:'模型',port:'model'},perm:{label:'权限策略',port:'perm'},tools:{label:'工具包',port:'tools'},workspace:{label:'共享工作区',port:'workspace'},doc:{label:'文档',port:'knowledge'},rules:{label:'规范',port:'rules'},board:{label:'共享看板',port:'board'}},outputs:{artifact:{label:'产物'},conclusion:{label:'结论'}}};
const S={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r',model:{vendor:'v',id:'m1'}},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r',model:{vendor:'v',id:'m1'}},{id:'c',name:'成员C',kind:'api',enabled:true,roleId:'r',model:{vendor:'v',id:'m1'}}]},
 team:{nodes:{a:{x:560,y:60},b:{x:900,y:60},c:{x:900,y:400}},edges:[{from:'a',to:'b',type:'manage'}],chat:[],settings:{},subagents:[],mode:'all',
  ports:{providers:{p_model0001:{type:'model',name:'大模型',x:300,y:60,config:{model:{vendor:'v',id:'big'}}},p_board0001:{type:'board',name:'登录看板',x:300,y:300,config:{topic:'登录'}}},feeds:[],board:{p_board0001:[]},events:[],ports:{},catalog:CAT}},tasks:[]};
let fid=0;
function push(){setTimeout(()=>window.postMessage({type:'state',value:JSON.parse(JSON.stringify(S))},'*'),0);}
function reply(id,result,error){setTimeout(()=>window.postMessage({type:'result',id,value:result,...(error?{error}:{})},'*'),0);}
window.__push=push;window.__S=S;
window.acquireVsCodeApi=()=>({getState(){return null},setState(){},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){push();return;}
 if(m.type==='canvas'){setTimeout(()=>window.postMessage({type:'canvasResult',id:m.id,value:m.action==='snapshot'?{ais:[],activity:[],changes:[],needs:[],browser:{tabs:[]},layout:{groups:{}}}:null},'*'),0);return;}
 if(m.type!=='action'){return;}
 const i=m.input||{},P=S.team.ports;let r={ok:true};
 if(m.action==='portFeed'){const f={id:'f'+(++fid),from:i.from,to:i.to,port:i.port,...(i.out?{out:i.out}:{}),...(['tools','knowledge','rules'].includes(i.port)?{mode:i.mode||'merge'}:{})};const old=CAT.ports[i.port].kind==='single'?P.feeds.filter(x=>x.to===i.to&&x.port===i.port):[];P.feeds=P.feeds.filter(x=>!old.includes(x)).concat(f);r={ok:true,feed:f,replaced:old};}
 else if(m.action==='portUnfeed'){const ids=[].concat(i.id);P.feeds=P.feeds.filter(f=>!ids.includes(f.id));}
 else if(m.action==='portProvider'&&!i.id){const id='p_new'+(++fid)+'xxxx';P.providers[id]={type:i.type,name:CAT.providers[i.type].label,x:i.x||0,y:i.y||0,config:{}};r={ok:true,id};}
 else if(m.action==='portProvider'&&i.id){Object.assign(P.providers[i.id],i.name!=null?{name:i.name}:{},i.config?{config:{...(P.providers[i.id].config||{}),...i.config}}:{});}
 else if(m.action==='portProviderMove'){for(const [k,p] of Object.entries(i.nodes))Object.assign(P.providers[k],p);}
 else if(m.action==='portProviderDelete'){delete P.providers[i.id];P.feeds=P.feeds.filter(f=>f.from!==i.id);r={ok:true,removed:{feeds:[]}};}
 else if(m.action==='teamCollapse'){const set=new Set(S.team.collapsed||[]);for(const k of i.ids)i.collapsed?set.add(k):set.delete(k);S.team.collapsed=[...set];}
 else if(m.action==='portProviderFlags'){for(const k of i.ids){if(i.bypass)P.providers[k].bypass=true;else delete P.providers[k].bypass;}}
 else if(m.action==='portFeedVia'){const f=P.feeds.find(x=>x.id===i.id);if(i.via.length)f.via=i.via;else delete f.via;}
 else if(m.action==='teamGroups'){S.team.groups=JSON.parse(JSON.stringify(i.groups||[]));}
 else if(m.action==='teamEdges'){const to=[].concat(i.to);for(const k of to)S.team.edges.push({from:i.from,to:k,type:i.type});r={ok:true,added:to,skipped:[]};}
 else if(m.action==='teamEdge'){S.team.edges=S.team.edges.filter(e=>!(e.from===i.from&&e.to===i.to));}
 else if(m.action==='teamLayout'){for(const [k,p] of Object.entries(i.nodes||{}))S.team.nodes[k]=p;}
 P.ports={};for(const f of P.feeds)((P.ports[f.to.split('~')[0]]||={})[f.port]||=[]).push({from:f.from});
 reply(m.id,r);if(/^(port|team)/.test(m.action))push();}});
</script>`;
html = html.replace(/<script src="collaboration.js"><\/script>/, stub + '<script src="collaboration.js"></script>');
fs.writeFileSync(path.join(dir, "index.html"), html);
fs.copyFileSync(path.join(root, "assets", WB, "automation.css"), path.join(dir, "automation.css"));
fs.copyFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), path.join(dir, "collaboration.js"));
for (const f of fs.readdirSync(path.join(root, "assets", WB))) if (!fs.existsSync(path.join(dir, f)) && /\.(js|css|svg|png)$/.test(f)) { try { fs.copyFileSync(path.join(root, "assets", WB, f), path.join(dir, f)); } catch {} }

const edge = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(f => fs.existsSync(f));
if (!edge) { console.log("SKIP: Edge not found"); process.exit(2); }
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(edge, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(dir, "prof")}`, "--window-size=1400,900", "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; } else { fail++; console.log("FAIL", m); } };
try {
  let target; for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let seq = 0; const waits = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } };
  const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async expr => { const r = await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) throw Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };
  const shot = async name => { const s = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, name), Buffer.from(s.result.data, "base64")); };
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1500);
  await ev(`(()=>{const t=document.getElementById('cv-legacy-toggle');const box=document.getElementById('cv-legacy');if(t&&box&&box.hidden)t.click();document.getElementById('tab-canvas')?.click();return 1})()`); await sleep(400);
  // fit everything into view
  const center = sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}})()`);
  const mouse = (type, p, buttons = 1, button = "left") => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button, buttons, clickCount: 1 });
  async function dragTo(fromSel, to, before) { const a = await center(fromSel); if (!a) throw Error("no " + fromSel); await mouse("mouseMoved", a, 0); await mouse("mousePressed", a); for (let i = 1; i <= 8; i++) await mouse("mouseMoved", { x: a.x + (to.x - a.x) * i / 8, y: a.y + (to.y - a.y) * i / 8 }); if (before) await before(); await mouse("mouseReleased", to, 0); await sleep(500); }
  const acts = re => ev(`window.__posted.filter(m=>m.type==='action'&&${re}.test(m.action)).map(m=>[m.action,m.input])`);
  const nodeH = id => ev(`document.querySelector('#tc-nodes [data-id="${id}"] .tc-node-box').getAttribute('height')`);

  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node').length`)) === 3, "3 member nodes");
  ok((await ev(`document.querySelectorAll('#tc-pnodes .tc-pnode').length`)) === 2, "2 provider nodes");
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-prow').length`)) === 0, "no input rows before anything is wired");
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-oport').length`)) === 6, "2 output ports (产物/结论) per member");
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-port-in,#tc-nodes .tc-port-out,#tc-nodes .tc-port-left,#tc-nodes .tc-port-right').length`)) === 12, "manage/peer ports unchanged");
  const h0 = Number(await nodeH("b"));
  // 1. 模型节点 → 成员B：B 身上出现「模型」口
  const b = await center('#tc-nodes [data-id="b"] .tc-node-box');
  await dragTo('#tc-pnodes [data-pid="p_model0001"] .tc-pout', b, async () => {
    ok(await ev(`!!document.querySelector('#tc-world .tc-fwire')`), "live wire while dragging from provider");
    ok(await ev(`document.querySelector('#tc-nodes [data-id="b"]').classList.contains('wire-target')`), "member highlighted as drop target");
    await shot("wire-drag.png");
  });
  let a = await acts("/^portFeed$/");
  ok(a.length === 1 && a[0][1].from === "p_model0001" && a[0][1].to === "b" && a[0][1].port === "model", "portFeed model -> B " + JSON.stringify(a));
  await sleep(300);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="b"] .tc-prow[data-port="model"]')`), "B now shows the 模型 row");
  ok((await ev(`document.querySelector('#tc-nodes [data-id="b"] .tc-prow-value').textContent`)).includes("大模型"), "row says where it comes from");
  ok(Number(await nodeH("b")) > h0, "node grew for the row");
  ok((await ev(`document.querySelectorAll('#tc-feeds .tc-feed').length`)) === 1, "feed wire drawn");
  ok((await ev(`document.querySelectorAll('#tc-nodes [data-id="a"] .tc-prow').length`)) === 0, "A still has no input rows");
  // 2. 成员A 的「产物」→ 成员C：C 身上出现「知识」口
  const c = await center('#tc-nodes [data-id="c"] .tc-node-box');
  await dragTo('#tc-nodes [data-id="a"] .tc-oport[data-out="artifact"]', c);
  a = await acts("/^portFeed$/");
  ok(a.length === 2 && a[1][1].from === "a" && a[1][1].out === "artifact" && a[1][1].port === "knowledge" && a[1][1].to === "c", "artifact -> C knowledge " + JSON.stringify(a[1]));
  await sleep(300);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="c"] .tc-prow[data-port="knowledge"]')`), "C shows the 知识 row");
  ok((await ev(`document.querySelector('#tc-nodes [data-id="c"] .tc-prow-value').textContent`)).includes("产物"), "知识 row names A's 产物");
  // 3. 看板 → 成员B and C
  await dragTo('#tc-pnodes [data-pid="p_board0001"] .tc-pout', await center('#tc-nodes [data-id="b"] .tc-node-box'));
  await dragTo('#tc-pnodes [data-pid="p_board0001"] .tc-pout', await center('#tc-nodes [data-id="c"] .tc-node-box'));
  await sleep(300);
  ok((await ev(`[...document.querySelectorAll('#tc-nodes [data-id="b"] .tc-prow')].map(r=>r.dataset.port).join()`)) === "model,board", "B rows in catalog order");
  // 4. 拖到空白处不接线
  const n0 = (await acts("/^portFeed$/")).length;
  await dragTo('#tc-pnodes [data-pid="p_model0001"] .tc-pout', { x: 1300, y: 860 });
  ok((await acts("/^portFeed$/")).length === n0 && !(await ev(`!!document.querySelector('#tc-world .tc-fwire')`)), "drop on empty makes no feed");
  // 5. 点选 B 的模型行 + Delete → 断开，行消失
  await ev(`(()=>{document.querySelector('#tc-nodes [data-id="b"] .tc-prow[data-port="model"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(250);
  ok(await ev(`!!document.querySelector('#tc-feeds .tc-feed.selected')`), "clicking the row selects its wire");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Delete", code: "Delete", windowsVirtualKeyCode: 46 }); await sleep(500);
  a = await acts("/^portUnfeed$/");
  ok(a.length === 1, "Delete sends portUnfeed " + JSON.stringify(a));
  ok(!(await ev(`!!document.querySelector('#tc-nodes [data-id="b"] .tc-prow[data-port="model"]')`)), "模型 row gone after unwiring");
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node').length`)) === 3, "Delete on a wire did not remove members");
  // 6. 右键：「添加成员 ▸」「添加节点 ▸」二级菜单（仿 ComfyUI 的 Add Node ▸）
  const blank = { x: 1200, y: 700 };
  await ev(`(()=>{document.getElementById('tc-canvas').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:${blank.x},clientY:${blank.y}}));return 1})()`); await sleep(300);
  const labels = await ev(`[...document.querySelectorAll('.tc-cmenu:not(.tc-cmenu-sub) > .tc-cmenu-item .tc-cmenu-label')].map(b=>b.textContent)`);
  ok(labels.includes("添加成员") && labels.includes("添加节点") && !labels.some(t => /共享看板|权限策略|工具包/.test(t)), "right-click has 添加成员 ▸ / 添加节点 ▸, no node types at top level " + JSON.stringify(labels));
  await ev(`(()=>{const b=[...document.querySelectorAll('.tc-cmenu-item.has-sub')].find(b=>b.textContent.includes('添加节点'));b.dispatchEvent(new MouseEvent('mouseenter'));return 1})()`); await sleep(200);
  const sub = await ev(`[...document.querySelectorAll('.tc-cmenu-sub .tc-cmenu-label')].map(x=>x.textContent)`);
  ok(sub.length === 8 && ["人设", "模型", "权限策略", "工具包", "共享工作区", "文档", "规范", "共享看板"].every(l => sub.includes(l)), "添加节点 ▸ lists the 8 node types " + JSON.stringify(sub));
  const subPos = await ev(`(()=>{const a=[...document.querySelectorAll('.tc-cmenu-item.has-sub')].find(b=>b.textContent.includes('添加节点')).getBoundingClientRect(),s=document.querySelector('.tc-cmenu-sub').getBoundingClientRect();return {ok:Math.abs(s.left-a.right)<8||Math.abs(s.right-a.left)<8,s:[s.left,s.top],a:[a.left,a.right,a.top]}})()`);
  ok(subPos.ok, "submenu opens beside its item " + JSON.stringify(subPos));
  await ev(`(()=>{const v={'--vscode-menu-background':'#252526','--vscode-menu-foreground':'#cccccc','--vscode-foreground':'#cccccc','--vscode-descriptionForeground':'#9d9d9d','--vscode-editor-background':'#1e1e1e','--vscode-editorWidget-background':'#252526','--vscode-input-background':'#3c3c3c','--vscode-input-foreground':'#cccccc','--vscode-focusBorder':'#0078d4','--vscode-list-activeSelectionBackground':'#04395e','--vscode-list-activeSelectionForeground':'#ffffff','--vscode-widget-border':'#454545','--vscode-menu-border':'#454545','--vscode-textLink-foreground':'#4daafc','--vscode-sideBarSectionHeader-background':'#2b2b2b'};for(const [k,x] of Object.entries(v))document.body.style.setProperty(k,x);return 1})()`); await sleep(100);
  await shot("menu-sub.png");
  await ev(`(()=>{const b=[...document.querySelectorAll('.tc-cmenu-sub .tc-cmenu-item')].find(b=>b.textContent.includes('规范'));b.click();return 1})()`); await sleep(600);
  a = await acts("/^portProvider$/");
  ok(a.length === 1 && a[0][1].type === "rules", "picking 规范 in the submenu adds the node " + JSON.stringify(a));
  ok(!(await ev(`!!document.querySelector('.tc-cmenu')`)), "menu closes after picking");
  ok(await ev(`document.activeElement?.classList.contains('tc-pw-input')&&document.activeElement.tagName==='TEXTAREA'&&!document.querySelector('.tc-provpanel')&&!document.querySelector('.tc-pedit')`), "new node focuses its own textarea, no panel / overlay");
  await ev(`(()=>{const t=document.activeElement;t.value='提交前跑测试';t.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',ctrlKey:true,bubbles:true}));return 1})()`); await sleep(500);
  a = await acts("/^portProvider$/");
  ok(a.length === 2 && a[1][1].config?.text === "提交前跑测试", "editor saves config " + JSON.stringify(a[1]));
  ok((await ev(`document.querySelectorAll('#tc-pnodes .tc-pnode').length`)) === 3, "new node drawn");
  // 6a. 接口节点：控件就在节点上（ComfyUI 式），不弹面板
  const MP = '#tc-pnodes [data-pid="p_model0001"]';
  ok((await ev(`['model','reasoningEffort','temperature','maxOutputTokens','fallbackModel'].every(k=>document.querySelector('${MP} [data-pw="'+k+'"]'))`)), "model node shows its 5 widgets inline");
  ok((await ev(`document.querySelector('${MP} [data-pw="model"] .tc-widget-value').textContent`)).length > 0, "model widget shows the current model");
  const lastP = async () => (await acts("/^portProvider$/")).at(-1)?.[1];
  await ev(`(()=>{document.querySelector('${MP} [data-pw="temperature"] .tc-pw-step[data-dir="1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(400);
  let lp = await lastP(); ok(lp?.id === "p_model0001" && lp.config?.temperature === 0.7, "temperature ▶ steps from 默认 to 0.7 " + JSON.stringify(lp));
  await ev(`(()=>{document.querySelector('${MP} [data-pw="temperature"] .tc-pw-step[data-dir="1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(400);
  lp = await lastP(); ok(lp?.config?.temperature === 0.8, "▶ again → 0.8 " + JSON.stringify(lp));
  ok((await ev(`document.querySelector('${MP} input.tc-pw-input[data-pw="temperature"]').value`)) === "0.8", "node redraws with the new value");
  ok(await ev(`document.querySelector('${MP} foreignObject input.tc-pw-input[data-pw="maxOutputTokens"]')?.closest('.tc-pnode')?.dataset.pid==='p_model0001'`), "number widget is the node's own input");
  await ev(`(()=>{const i=document.querySelector('${MP} input.tc-pw-input[data-pw="maxOutputTokens"]');i.focus();i.value='8192';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 1})()`); await sleep(400);
  lp = await lastP(); ok(lp?.config?.maxOutputTokens === 8192 && !(await ev(`!!document.querySelector('.tc-pedit')`)), "Enter saves the number, no overlay " + JSON.stringify(lp));
  await ev(`(()=>{const i=document.querySelector('${MP} input.tc-pw-input[data-pw="maxOutputTokens"]');i.focus();i.value='81';return 1})()`); await sleep(50);
  await ev(`(()=>{window.__ocCanvas.selectMember('a');return 1})()`);
  ok(await ev(`document.activeElement?.dataset?.pw==='maxOutputTokens'`), "typing survives a canvas redraw (focus kept)");
  await ev(`(()=>{const i=document.activeElement;i.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 1})()`); await sleep(300);
  ok(await ev(`document.querySelector('${MP} input.tc-pw-input[data-pw="maxOutputTokens"]').value==='8192'`), "Esc reverts the typed value");
  await ev(`(()=>{document.querySelector('${MP} [data-pw="reasoningEffort"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(200);
  ok((await ev(`document.querySelectorAll('.tc-wpop .tc-wpop-row').length`)) >= 5, "combo widget opens a dropdown right under it");
  await ev(`(()=>{[...document.querySelectorAll('.tc-wpop .tc-wpop-row')].find(r=>r.textContent.includes('高')).click();return 1})()`); await sleep(400);
  lp = await lastP(); ok(lp?.config?.reasoningEffort === "high" && !(await ev(`!!document.querySelector('.tc-wpop')`)), "picking 高 saves and closes " + JSON.stringify(lp));
  await ev(`(()=>{document.querySelector('${MP} .tc-pnode-box').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));return 1})()`); await sleep(200);
  ok(!(await ev(`!!document.querySelector('.tc-provpanel')`)), "double-clicking a node body no longer opens a settings panel");
  await ev(`(()=>{document.querySelector('${MP} .tc-pnode-titlehit').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));return 1})()`); await sleep(200);
  ok(await ev(`document.querySelector('#tc-wlayer .tc-pedit input')?.value==='大模型'`), "double-click the title renames in place");
  await ev(`(()=>{const i=document.querySelector('#tc-wlayer .tc-pedit input');i.value='主力模型';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 1})()`); await sleep(400);
  lp = await lastP(); ok(lp?.name === "主力模型", "rename saves " + JSON.stringify(lp));
  const BP = '#tc-pnodes [data-pid="p_board0001"]';
  ok(await ev(`!!document.querySelector('${BP} [data-pw="topic"]')&&!!document.querySelector('${BP} [data-pw="_log"]')`), "board node shows topic + latest entries inline");
  await ev(`(()=>{const i=document.querySelector('${BP} input.tc-pw-input[data-pw="topic"]');i.focus();i.value='登录与注册';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 1})()`); await sleep(400);
  lp = await lastP(); ok(lp?.id === "p_board0001" && lp.config?.topic === "登录与注册", "text widget saves " + JSON.stringify(lp));
  await ev(`(()=>{const v={'--vscode-menu-background':'#252526','--vscode-foreground':'#cccccc','--vscode-descriptionForeground':'#9d9d9d','--vscode-editorWidget-background':'#252526','--vscode-input-background':'#3c3c3c','--vscode-input-foreground':'#cccccc','--vscode-focusBorder':'#0078d4'};for(const [k,x] of Object.entries(v))document.body.style.setProperty(k,x);return 1})()`);
  await ev(`(()=>{document.querySelector('${MP} [data-pw="model"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(300);
  await shot("pnode-widgets.png");
  await ev(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));document.querySelector('.tc-wpop')?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 1})()`); await sleep(100);
  // 6b. 双击空白处：ComfyUI 式搜索框，成员和节点一个列表
  await ev(`(()=>{document.getElementById('tc-canvas').dispatchEvent(new MouseEvent('dblclick',{bubbles:true,clientX:1150,clientY:200}));return 1})()`); await sleep(300);
  const ns = await ev(`(()=>{const b=document.querySelector('.tc-nsearch');if(!b)return null;return {focus:document.activeElement===b.querySelector('input'),groups:[...b.querySelectorAll('.tc-nsearch-group')].map(x=>x.textContent),m:b.querySelectorAll('[data-kind=member]').length,n:b.querySelectorAll('[data-kind=node]').length,neu:b.querySelectorAll('[data-kind=new]').length,prev:b.querySelector('.tc-nsearch-preview').textContent}})()`);
  ok(ns && ns.focus && ns.groups.join() === "成员,节点" && ns.m === 3 && ns.n === 8 && ns.neu === 1, "double-click opens one list: 3 members + 8 nodes + 新建 " + JSON.stringify(ns));
  ok(ns && ns.prev.includes("岗位"), "preview shows the highlighted member");
  await cdp("Input.insertText", { text: "看板" }); await sleep(200);
  const top = await ev(`(()=>{const r=document.querySelector('.tc-nsearch .tc-nsearch-item.active');return {kind:r.dataset.kind,name:r.querySelector('.tc-nsearch-name').textContent,mark:r.querySelector('mark')?.textContent,prev:document.querySelector('.tc-nsearch-preview').textContent}})()`);
  ok(top.kind === "node" && top.name === "共享看板" && top.mark === "看板" && top.prev.includes("接到"), "typing filters + highlights, preview follows " + JSON.stringify(top));
  await ev(`(()=>{const v={'--vscode-menu-background':'#252526','--vscode-menu-foreground':'#cccccc','--vscode-foreground':'#cccccc','--vscode-descriptionForeground':'#9d9d9d','--vscode-editor-background':'#1e1e1e','--vscode-editorWidget-background':'#252526','--vscode-input-background':'#3c3c3c','--vscode-input-foreground':'#cccccc','--vscode-focusBorder':'#0078d4','--vscode-list-activeSelectionBackground':'#04395e','--vscode-list-activeSelectionForeground':'#ffffff','--vscode-widget-border':'#454545','--vscode-menu-border':'#454545','--vscode-textLink-foreground':'#4daafc','--vscode-sideBarSectionHeader-background':'#2b2b2b'};for(const [k,x] of Object.entries(v))document.body.style.setProperty(k,x);return 1})()`); await sleep(100);
  await shot("dblclick-search.png");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await sleep(150);
  ok((await ev(`document.querySelector('.tc-nsearch-tab[aria-selected=true]').textContent`)) === "成员", "Tab switches category");
  await ev(`(()=>{const i=document.querySelector('.tc-nsearch input');i.value='';i.dispatchEvent(new Event('input'));return 1})()`); await sleep(100);
  await cdp("Input.insertText", { text: "成员B" }); await sleep(150);
  const n0b = (await ev(`window.__posted.length`));
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await sleep(500);
  ok(!(await ev(`!!document.querySelector('.tc-nsearch')`)), "Enter adds and closes");
  ok((await ev(`window.__posted.slice(${n0b}).filter(m=>m.type==='action').map(m=>m.action).join()`)).includes("team"), "Enter places the member");
  await ev(`(()=>{document.getElementById('tc-canvas').dispatchEvent(new MouseEvent('dblclick',{bubbles:true,clientX:1150,clientY:200}));return 1})()`); await sleep(200);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await sleep(150);
  ok(!(await ev(`!!document.querySelector('.tc-nsearch')`)), "Esc closes");
  // 7. 协作事件：新事件播一个光点 + 气泡
  await ev(`(()=>{window.__S.team.ports.events.push({id:'e1',at:new Date().toISOString(),kind:'dispatch',from:'a',to:'b',text:'写登录接口'});window.__push();return 1})()`); await sleep(500);
  ok(await ev(`!!document.querySelector('#tc-evfx .tc-ev-dot')||!!document.querySelector('#tc-evfx .tc-ev-trail')`), "dispatch event animates on the canvas");
  ok((await ev(`[...document.querySelectorAll('#tc-evfx .tc-ev-label text')].map(t=>t.textContent).join()`)).includes("派活"), "bubble names the step");
  await shot("event.png");
  await ev(`(()=>{window.__S.team.ports.events.push({id:'e2',at:new Date().toISOString(),kind:'adhoc',from:'b',to:'c',text:'帮我看下样式'});window.__push();return 1})()`); await sleep(1600);
  ok((await ev(`document.querySelectorAll('#tc-feeds .tc-adhoc').length`)) === 1, "AI ad-hoc collaboration drawn as a dashed line");
  // 8. 协作记录在右侧「活动 › 协作」里，能回放
  const hasRight = await ev(`!!document.getElementById('cv-rtabs')`);
  ok(hasRight, "right panel exists");
  await ev(`(()=>{const t=[...document.querySelectorAll('#cv-rtabs .cv-rtab')].find(b=>b.textContent.includes('活动'));t&&t.click();return 1})()`); await sleep(200);
  await ev(`(()=>{const b=[...document.querySelectorAll('#cv-rbody .cv-seg')].find(b=>b.textContent==='协作');b&&b.click();return 1})()`); await sleep(300);
  ok((await ev(`document.querySelectorAll('#cv-rbody .cv-collab-row').length`)) === 2, "活动 › 协作 lists the 2 member events");
  ok((await ev(`[...document.querySelectorAll('#cv-rbody .cv-collab-row .cv-ae-name')].map(x=>x.textContent).join('|')`)).includes("成员B → 成员C"), "row says who → who");
  ok(!(await ev(`!!document.getElementById('tc-ev-toggle')||!!document.querySelector('.tc-evpanel')`)), "no floating 协作记录 panel or toolbar button");
  await ev(`document.querySelector('#cv-rbody .cv-collab-play').click()`); await sleep(400);
  ok(await ev(`!!document.querySelector('#cv-rbody .cv-collab-range')`), "replay shows a scrubber");
  await shot("replay.png");
  await sleep(1800);
  ok((await ev(`document.querySelector('#cv-rbody .cv-collab-play').textContent`)).includes("回放"), "replay finishes on its own");
  // 9. 提供节点可以拖动
  await ev(`(()=>{for(const e of document.querySelectorAll(".cv-side"))e.style.display="none";return 1})()`); await sleep(100); // 侧栏盖住了左边，测试里先收起
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: ".", code: "Period", text: ".", windowsVirtualKeyCode: 190 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await sleep(500);
  const before = await ev(`document.querySelector('#tc-pnodes [data-pid="p_board0001"]').getAttribute('transform')`);
  const pb = await center('#tc-pnodes [data-pid="p_board0001"] .tc-pnode-out');
  await ev(`(()=>{const g=document.querySelector('#tc-pnodes [data-pid="p_board0001"]'),o={bubbles:true,pointerId:1,button:0,buttons:1,clientX:100,clientY:100};g.dispatchEvent(new PointerEvent('pointerdown',o));for(let i=1;i<=5;i++)g.dispatchEvent(new PointerEvent('pointermove',{...o,clientX:100+i*10,clientY:100+i*12}));g.dispatchEvent(new PointerEvent('pointerup',{...o,buttons:0,clientX:150,clientY:160}));return 1})()`); await sleep(500);
  ok((await ev(`document.querySelector('#tc-pnodes [data-pid="p_board0001"]').getAttribute('transform')`)) !== before && (await acts("/^portProviderMove$/")).length === 1, "provider node drag saves position");
  // 10. Ctrl 框选能选中接口节点
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: ".", code: "Period", text: ".", windowsVirtualKeyCode: 190 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await sleep(500);
  const pr = await ev(`(()=>{const a=document.querySelector('#tc-pnodes [data-pid="p_model0001"]').getBoundingClientRect(),b=document.querySelector('#tc-pnodes [data-pid="p_board0001"]').getBoundingClientRect();return {x1:Math.max(4,Math.min(a.left,b.left)-12),y1:Math.min(a.top,b.top)-12,x2:Math.max(a.right,b.right)+12,y2:Math.max(a.bottom,b.bottom)+12}})()`);
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: pr.x1, y: pr.y1, button: "left", clickCount: 1, modifiers: 2 });
  for (let i = 1; i <= 6; i++) await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: pr.x1 + (pr.x2 - pr.x1) * i / 6, y: pr.y1 + (pr.y2 - pr.y1) * i / 6, button: "left", buttons: 1, modifiers: 2 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: pr.x2, y: pr.y2, button: "left", clickCount: 1, modifiers: 2 }); await sleep(300);
  ok(await ev(`document.querySelectorAll('#tc-pnodes .tc-pnode.selected').length>=2`), "Ctrl-drag marquee selects provider nodes " + JSON.stringify(pr));
  // 11. 多选后连线：拖到选中的任一节点上，连到所有选中节点
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: ".", code: "Period", text: ".", windowsVirtualKeyCode: 190 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await sleep(500);
  const ctrlClick = async sel => { const c = await center(sel); await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: c.x, y: c.y, button: "left", clickCount: 1, modifiers: 2 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: c.x, y: c.y, button: "left", clickCount: 1, modifiers: 2 }); await sleep(200); };
  await ev(`(()=>{document.activeElement?.blur?.();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return 1})()`); await sleep(200);
  await ctrlClick('#tc-nodes [data-id="b"] .tc-node-titlehit'); await ctrlClick('#tc-nodes [data-id="c"] .tc-node-titlehit');
  ok((await ev(`[...document.querySelectorAll('#tc-nodes .tc-node.selected')].map(g=>g.dataset.id).sort().join()`)) === "b,c", "Ctrl+click selects B and C");
  const nFeed0 = (await acts("/^portFeed$/")).length;
  await dragTo('#tc-pnodes [data-pid="p_model0001"] .tc-pout', await center('#tc-nodes [data-id="b"] .tc-node-titlehit'), async () => { ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node.wire-target').length`)) === 2 && (await ev(`document.querySelectorAll('.tc-wire-ghost').length`)) >= 1, "hovering a selected node highlights every selected node + ghost wires"); });
  const nf = (await acts("/^portFeed$/")).slice(nFeed0);
  ok(nf.length === 2 && nf.map(x => x[1].to).sort().join() === "b,c" && nf.every(x => x[1].from === "p_model0001"), "one drag feeds both selected members " + JSON.stringify(nf));
  const nEdge0 = (await acts("/^teamEdges$/")).length;
  await dragTo('#tc-nodes [data-id="a"] .tc-port[data-side="out"]', await center('#tc-nodes [data-id="c"] .tc-node-titlehit'));
  const ne = (await acts("/^teamEdges$/")).slice(nEdge0);
  ok(ne.length === 2 && ne.map(x => x[1].to[0]).sort().join() === "b,c", "member wire to a selected node connects all selected " + JSON.stringify(ne));
  // 12. 分组：Ctrl+G 框住选中节点，改名，拖标题整组移动
  await ev(`(()=>{document.activeElement?.blur?.();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return 1})()`); await sleep(150);
  await ctrlClick('#tc-nodes [data-id="b"] .tc-node-titlehit'); await ctrlClick('#tc-nodes [data-id="c"] .tc-node-titlehit');
  await ev(`(()=>{document.body.focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'g',ctrlKey:true,bubbles:true}));return 1})()`); await sleep(500);
  let gs = (await acts("/^teamGroups$/")).at(-1)?.[1]?.groups || [];
  ok(gs.length === 1 && gs[0].w > 224 && gs[0].h > 200, "Ctrl+G creates a group around the selection " + JSON.stringify(gs));
  ok(await ev(`!!document.querySelector('#tc-groups .tc-group')`), "group is drawn behind the nodes");
  ok(await ev(`!!document.querySelector('#tc-wlayer .tc-gedit input')`), "new group opens its title for renaming");
  await ev(`(()=>{const i=document.querySelector('#tc-wlayer .tc-gedit input');i.value='后端';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 1})()`); await sleep(400);
  gs = (await acts("/^teamGroups$/")).at(-1)?.[1]?.groups || [];
  ok(gs[0]?.title === "后端", "group rename saves " + JSON.stringify(gs));
  const gx0 = gs[0].x, nl0 = (await acts("/^teamLayout$/")).length;
  const hc = await center('#tc-groups .tc-group-head');
  console.log("HEAD", JSON.stringify(hc), await ev(`(()=>{const e=document.elementFromPoint(${hc.x + 10},${hc.y});return e?(e.tagName+'.'+(e.getAttribute('class')||'')):'none'})()`));
  await mouse("mouseMoved", { x: hc.x + 10, y: hc.y }, 0); await mouse("mousePressed", { x: hc.x + 10, y: hc.y }); for (let i = 1; i <= 6; i++) await mouse("mouseMoved", { x: hc.x + 10 - i * 15, y: hc.y + i * 5 }); await mouse("mouseReleased", { x: hc.x - 80, y: hc.y + 30 }, 0); await sleep(600);
  gs = (await acts("/^teamGroups$/")).at(-1)?.[1]?.groups || [];
  const lay = (await acts("/^teamLayout$/")).slice(nl0).at(-1)?.[1]?.nodes || {};
  ok(gs[0].x < gx0 && lay.b && lay.c, "dragging the group title moves the group and the nodes inside " + JSON.stringify({ g: gs[0], lay }));
  await ev(`(()=>{const v={'--vscode-foreground':'#cccccc','--vscode-editorWidget-background':'#252526','--vscode-input-background':'#3c3c3c','--vscode-input-foreground':'#cccccc','--vscode-focusBorder':'#0078d4'};for(const [k,x] of Object.entries(v))document.body.style.setProperty(k,x);return 1})()`);
  await shot("groups.png");
  await ev(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 1})()`); await sleep(150);
  const gb = await ev(`(()=>{const r=document.querySelector('#tc-groups .tc-group-box').getBoundingClientRect();return {x:r.left+3,y:r.top+r.height/2}})()`);
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: gb.x, y: gb.y, button: "left", clickCount: 2 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: gb.x, y: gb.y, button: "left", clickCount: 2 }); await sleep(500);
  const gsel = await ev(`[...document.querySelectorAll('#tc-nodes .tc-node.selected, #tc-pnodes .tc-pnode.selected')].map(g=>g.dataset.id||g.dataset.pid).sort().join()`);
  ok(/b/.test(gsel) && /c/.test(gsel) && !(await ev(`!!document.querySelector('.tc-nsearch')`)), "double-click inside a group selects every node in it " + gsel);
  await ev(`(()=>{document.querySelector('#tc-groups .tc-group-head').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));return 1})()`); await sleep(400);
  ok(/b/.test(await ev(`[...document.querySelectorAll('#tc-nodes .tc-node.selected')].map(g=>g.dataset.id).join()`)), "double-click the group title selects them too");
  // 13. 复制粘贴接口节点
  await ev(`(()=>{document.querySelector('#tc-pnodes [data-pid="p_board0001"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:3,clientX:5,clientY:5}));document.querySelector('#tc-pnodes [data-pid="p_board0001"]').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:3,clientX:5,clientY:5}));return 1})()`); await sleep(200);
  const np0 = (await acts("/^portProvider$/")).length;
  await ev(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'c',ctrlKey:true,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'v',ctrlKey:true,bubbles:true}));return 1})()`); await sleep(800);
  const pp = (await acts("/^portProvider$/")).slice(np0);
  ok(pp.length === 2 && pp[0][1].type === "board" && pp[1][1].config?.topic === "登录与注册", "Ctrl+C / Ctrl+V duplicates a node with its settings " + JSON.stringify(pp));
  // 14. 折叠 / 跳过 / 中继点
  const key = async (k, mods) => ev(`(()=>{document.activeElement?.blur?.();document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',code:'Key${k.toUpperCase()}',bubbles:true,${mods}}));return 1})()`);
  await key("Escape", ""); await ev(`(()=>{const g=document.querySelector('#tc-pnodes [data-pid="p_model0001"]');g.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:4}));g.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:4}));return 1})()`); await sleep(200);
  await key("c", "altKey:true"); await sleep(500);
  ok(await ev(`(()=>{const g=document.querySelector('#tc-pnodes [data-pid="p_model0001"]');return g.classList.contains('collapsed')&&+g.querySelector('.tc-pnode-box').getAttribute('height')===24&&!g.querySelector('.tc-pw')})()`), "Alt+C collapses a node to its title bar");
  await key("c", "altKey:true"); await sleep(500);
  ok(await ev(`!document.querySelector('#tc-pnodes [data-pid="p_model0001"]').classList.contains('collapsed')`), "Alt+C again expands it");
  await ev(`(()=>{document.querySelector('#tc-pnodes [data-pid="p_model0001"] .tc-collapse-hit').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(500);
  ok(await ev(`document.querySelector('#tc-pnodes [data-pid="p_model0001"]').classList.contains('collapsed')`), "title arrow collapses too");
  ok(await ev(`(()=>{const f=[...document.querySelectorAll('#tc-feeds .tc-feed')];return f.length>0})()`), "wires stay attached to a collapsed node");
  await ev(`(()=>{document.querySelector('#tc-pnodes [data-pid="p_model0001"] .tc-collapse-hit').dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(400);
  await ev(`(()=>{const g=document.querySelector('#tc-pnodes [data-pid="p_model0001"]');g.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:5}));g.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:5}));return 1})()`); await sleep(200);
  await key("b", "ctrlKey:true"); await sleep(500);
  ok((await acts("/^portProviderFlags$/")).at(-1)?.[1]?.bypass === true && await ev(`document.querySelector('#tc-pnodes [data-pid="p_model0001"]').classList.contains('bypassed')&&!!document.querySelector('#tc-feeds .tc-feed.bypassed')`), "Ctrl+B bypasses a node and dims its wires");
  await key("b", "ctrlKey:true"); await sleep(500);
  ok((await acts("/^portProviderFlags$/")).at(-1)?.[1]?.bypass === false, "Ctrl+B again restores it");
  await ev(`(()=>{const e=document.querySelector('#tc-nodes [data-id="c"]');const c={x:0,y:0};document.querySelector('#tc-nodes [data-id="c"]');return 1})()`);
  const fh = await ev(`(()=>{const h=document.querySelector('#tc-feeds .tc-feed-hit');const L=h.getTotalLength(),p=h.getPointAtLength(L/2),m=h.getScreenCTM();return {x:p.x*m.a+m.e,y:p.y*m.d+m.f}})()`);
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: fh.x, y: fh.y, button: "left", clickCount: 2 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: fh.x, y: fh.y, button: "left", clickCount: 2 }); await sleep(600);
  ok((await acts("/^portFeedVia$/")).at(-1)?.[1]?.via?.length === 1 && await ev(`!!document.querySelector('#tc-feeds .tc-reroute')`), "double-click a wire adds a reroute point");
  const rp = await center('#tc-feeds .tc-reroute');
  await mouse("mouseMoved", rp, 0); await mouse("mousePressed", rp); for (let i = 1; i <= 5; i++) await mouse("mouseMoved", { x: rp.x + i * 8, y: rp.y + i * 10 }); await mouse("mouseReleased", { x: rp.x + 40, y: rp.y + 50 }, 0); await sleep(500);
  const v1 = (await acts("/^portFeedVia$/")).at(-1)?.[1]?.via || [];
  ok(v1.length === 1 && (await acts("/^portFeedVia$/")).length >= 2, "dragging a reroute point moves it " + JSON.stringify(v1));
  ok(await ev(`(()=>{const d=document.querySelector('#tc-feeds .tc-feed').getAttribute('d');return (d.match(/C/g)||[]).length>=2})()`) || await ev(`[...document.querySelectorAll('#tc-feeds .tc-feed')].some(p=>(p.getAttribute('d').match(/C/g)||[]).length>=2)`), "the wire bends through the reroute point");
  await ev(`(()=>{document.querySelector('#tc-feeds .tc-reroute').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));return 1})()`); await sleep(500);
  ok((await acts("/^portFeedVia$/")).at(-1)?.[1]?.via?.length === 0 && !(await ev(`!!document.querySelector('#tc-feeds .tc-reroute')`)), "double-click a reroute point removes it");
  // 成员节点折叠
  await key("Escape", ""); await ctrlClick('#tc-nodes [data-id="c"] .tc-node-titlehit'); await key("c", "altKey:true"); await sleep(600);
  ok(await ev(`(()=>{const g=document.querySelector('#tc-nodes [data-id="c"]');return g.classList.contains('collapsed')&&+g.querySelector('.tc-node-box').getAttribute('height')===28})()`), "member node collapses too");
  await shot("collapse.png");
  await key("c", "altKey:true"); await sleep(400);
  await shot("canvas.png");
  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
