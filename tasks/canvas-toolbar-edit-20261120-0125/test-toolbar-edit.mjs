// Headless e2e for canvas-toolbar-edit (团队协作画布：右下角分组工具栏回来，「预设」在里面；成员节点内直接改名/岗位/模型/启用/子代理).
// node tasks/canvas-toolbar-edit-20261120-0125/test-toolbar-edit.mjs   (needs Microsoft Edge; no OpenCode needed)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/canvas-toolbar-edit-20261120-0125");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "toolbar-edit-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-errorForeground:#f48771;--vscode-panel-border:#3c3c3c;--vscode-widget-border:#454545;font-family:Segoe UI,Microsoft YaHei,sans-serif;font-size:13px;color:#cccccc;background:#1e1e1e}</style>`;
// The stub plays the extension: state lives in localStorage (survives a reload like the team file does),
// teamLayout/teamEdges/teamEdge change it and push a new state; window.__lag holds a teamLayout back so a stale push arrives first.
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const INIT={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'},{id:'r2',name:'设计师'},{id:'observer',name:'观察者'}],
 routingCatalog:{models:[{vendor:'v1',id:'gpt-x',name:'GPT X',group:'OpenAI'},{vendor:'v2',id:'sonnet-9',name:'Sonnet 9',group:'Anthropic'},{vendor:'v2',id:'haiku-9',name:'Haiku 9',group:'Anthropic'}]},
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false},{id:'c',name:'测试C',kind:'mcp',enabled:true,roleId:'r',version:1,allowedPaths:['.'],allowShell:false}]},
 team:{nodes:{a:{x:80,y:120},b:{x:420,y:120},c:{x:80,y:330}},edges:[],chat:[],settings:{},subagents:[],mode:'all',presets:[{id:'p1',name:'小队',count:2,links:0}]},tasks:[]};
const S=window.S=JSON.parse(localStorage.getItem('__S')||'null')||INIT;
const save=()=>localStorage.setItem('__S',JSON.stringify(S));
window.__snap=JSON.parse(localStorage.getItem('__snap')||'null')||{now:Date.now(),ais:[],projects:[{id:'w1',name:'P',root:'D:/p'}],current:'w1',needs:[],links:[],activity:[],changes:[],browser:{tabs:[]},layout:{groups:{}}};
window.__saveSnap=()=>localStorage.setItem('__snap',JSON.stringify(window.__snap));
window.__push=function(value){const v=JSON.parse(JSON.stringify(value||S));setTimeout(()=>window.postMessage({type:'state',value:v},'*'),0);};
window.__stale=null;window.__lag=false;
setInterval(()=>window.__push(),3000); // the extension pushes state every 3 s
function reply(type,id,value){setTimeout(()=>window.postMessage({type,id,value},'*'),0);}
window.acquireVsCodeApi=()=>({getState(){try{return JSON.parse(localStorage.getItem('__vs')||'null')}catch{return null}},setState(v){localStorage.setItem('__vs',JSON.stringify(v))},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){window.__push();return;}
 if(m.type==='canvas'){window.__snap.now=Date.now();reply('canvasResult',m.id,m.action==='snapshot'||m.action==='seen'?JSON.parse(JSON.stringify(window.__snap)):{});return;}
 if(m.type!=='action')return;
 const i=m.input||{};let r={};
 const apply=()=>{if(m.action==='teamEdges'){const added=[];for(const to of i.to){if(to===i.from||S.team.edges.some(e=>e.from===i.from&&e.to===to))continue;S.team.edges.push({from:i.from,to,type:i.type});added.push(to);}r={added,skipped:[]};}
  else if(m.action==='teamLayout'){for(const [k,v] of Object.entries(i.nodes||{})){if(v)S.team.nodes[k]=v;else{delete S.team.nodes[k];S.team.edges=S.team.edges.filter(e=>e.from!==k&&e.to!==k);}}}
  else if(m.action==='teamEdge'&&i.type==='none'){S.team.edges=S.team.edges.filter(e=>!(e.from===i.from&&e.to===i.to));}
  else if(m.action==='saveEmployee'){const e=S.staff.employees.find(x=>x.id===i.id);if(e.version!==i.expected_version){r={__error:'员工配置已变化，重新读取后保存。'};return;}Object.assign(e,{name:i.name,kind:i.kind,roleId:i.roleId,model:i.model,allowedPaths:i.allowedPaths,allowShell:i.allowShell,enabled:i.enabled,version:e.version+1});r=JSON.parse(JSON.stringify(e));}
  else if(m.action==='teamMemberSettings'){S.team.settings[i.memberId]={...(S.team.settings[i.memberId]||{}),allowSubagents:i.allowSubagents,maxSubagents:i.maxSubagents};}save();};
 if(m.action==='saveEmployee'&&window.__lagEmp){const stale=JSON.parse(JSON.stringify(S));apply();if(r.__error){setTimeout(()=>window.postMessage({type:'result',id:m.id,error:r.__error},'*'),0);return;}reply('result',m.id,r);window.__push(stale);setTimeout(()=>window.__push(stale),300);setTimeout(()=>window.__push(),1500);return;}
 if(m.action==='teamLayout'&&window.__lag){const stale=JSON.parse(JSON.stringify(S));reply('result',m.id,{});window.__push(stale);setTimeout(()=>window.__push(stale),300);setTimeout(()=>{apply();window.__push();},1500);return;}
 apply();if(r&&r.__error){setTimeout(()=>window.postMessage({type:'result',id:m.id,error:r.__error},'*'),0);return;}reply('result',m.id,r);if(/^(team(Edges?|Layout|MemberSettings)|saveEmployee)$/.test(m.action))window.__push();}});
</script>`;
html = html.replace(/<script src="collaboration.js"><\/script>/, stub + '<script src="collaboration.js"></script>');
fs.writeFileSync(path.join(dir, "index.html"), html);
fs.copyFileSync(path.join(root, "assets", WB, "automation.css"), path.join(dir, "automation.css"));
fs.copyFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), path.join(dir, "collaboration.js"));

const edge = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(f => fs.existsSync(f));
if (!edge) { console.log("SKIP: Edge not found"); process.exit(2); }
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(edge, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(dir, "prof")}`, "--window-size=1600,900", "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m); } };
try {
  let target; for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let seq = 0; const waits = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } };
  const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async expr => { const r = await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) throw Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };
  const shot = async name => { const s = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(here, name), Buffer.from(s.result.data, "base64")); };
  const mouse = (type, p, buttons = 1, clickCount = 1) => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", buttons, clickCount });
  const center = sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  const dblclick = async p => { await mouse("mouseMoved", p, 0); await mouse("mousePressed", p, 1, 1); await mouse("mouseReleased", p, 0, 1); await mouse("mousePressed", p, 1, 2); await mouse("mouseReleased", p, 0, 2); };
  const freePoint = (dx = 0) => ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();for(let y=r.top+160;y<r.bottom-140;y+=20)for(let x=r.left+260+${dx};x<r.right-40;x+=20){const e=document.elementFromPoint(x,y);if(e&&(e.id==='tc-canvas'||e.id==='tc-bg'))return {x,y};}return null})()`);
  const typeAndEnter = async text => { await cdp("Input.insertText", { text }); await sleep(150); await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); };
  const toastText = () => ev(`(()=>{const f=document.getElementById('feedback');const vis=[...document.querySelectorAll('body *')].filter(e=>/已把|加到画布|已保存|已删除|现在管理|已套用|已存为/.test(e.childNodes.length===1&&e.firstChild.nodeType===3?e.textContent:'')&&e.offsetParent!==null&&!e.closest('#page-members,#page-chat'));return (f?f.textContent:'')+vis.map(e=>e.textContent).join('|')})()`);
  const load = async () => { await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1800); };
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await load();

  const click = async p => { await mouse("mouseMoved", p, 0); await mouse("mousePressed", p, 1, 1); await mouse("mouseReleased", p, 0, 1); };
  const key = async (k, code, vk, mods = 0, text) => { await cdp("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods, text }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); };
  const posted = action => ev(`window.__posted.filter(m=>m.type==='action'&&m.action===${JSON.stringify(action)}).map(m=>m.input)`);
  const nodeText = id => ev(`[...document.querySelectorAll('#tc-nodes [data-id="${id}"] text')].map(t=>t.textContent).join('|')`);
  const viewTf = () => ev(`document.getElementById('tc-world').getAttribute('transform')`);
  // fresh state: the stub keeps state in localStorage
  await ev(`localStorage.clear()`); await load(); await sleep(600);

  // ---- 1. bottom-right grouped toolbar is back; 预设 is inside it; no toggles / mode switch / orchestration buttons
  const tb = await ev(`(()=>{const t=document.getElementById('cv-toolbar');if(!t)return null;const r=t.getBoundingClientRect(),s=document.getElementById('tc-scroll').getBoundingClientRect();return {ids:[...t.querySelectorAll('button')].map(b=>b.id),titles:[...t.querySelectorAll('button')].every(b=>b.title.length>=2),icons:[...t.querySelectorAll('button')].filter(b=>b.id!=='cv-zoom-pct').every(b=>b.querySelector('.cv-ic svg')),groups:t.querySelectorAll('.cv-tgroup').length,right:s.right-r.right,bottom:s.bottom-r.bottom,vis:t.offsetParent!==null}})()`);
  ok(tb && tb.vis && tb.right >= 0 && tb.right < 30 && tb.bottom >= 0 && tb.bottom < 30, "toolbar sits at the bottom right of the canvas " + JSON.stringify(tb && { r: tb.right, b: tb.bottom }));
  ok(tb && JSON.stringify(tb.ids) === JSON.stringify(["cv-zoom-out", "cv-zoom-pct", "cv-zoom-in", "cv-fit", "cv-autolayout", "cv-focus", "tc-preset-btn"]), "toolbar has zoom −/%/+, 适应, 自动排列, 居中 and 预设: " + JSON.stringify(tb?.ids));
  ok(tb && tb.titles && tb.icons && tb.groups === 3, "every button has a tooltip and an icon, in 3 groups");
  ok(await ev(`!!document.querySelector('#cv-toolbar #tc-presetpop')&&!document.querySelector('.cv-presetbar')&&!document.querySelector('.cv-center .tc-floatbar')`), "预设 lives in the toolbar, not at the top right");
  ok(await ev(`['cv-links-toggle','cv-previews-toggle','cv-mode-ai','cv-legacy-toggle','cv-legacy','tc-canvas-add','tc-link-manage','tc-link-peer','tc-auto','tc-zoom'].every(id=>!document.getElementById(id))&&!document.querySelector('.cv-toggle,.cv-modeseg,.tc-legend')`), "no 连线/网页预览 toggles, no mode switch, no ＋成员/↓管理/⇄协作, no legend");
  ok(await ev(`[...document.querySelectorAll('.cv-center button')].filter(b=>b.offsetParent!==null).every(b=>b.closest('#cv-toolbar'))`), "all visible canvas buttons are in the bottom-right toolbar");
  ok(await ev(`!document.getElementById('cv-public')&&!document.getElementById('cv-stopall')&&!document.querySelector('.cv-public,.cv-stopall')&&![...document.querySelectorAll('header button')].some(b=>/公网|全部停下/.test(b.textContent))`), "top bar has no 公网 (cv-public) or 全部停下 (cv-stopall) button");

  // zoom buttons
  const pct = () => ev(`document.getElementById('cv-zoom-pct').textContent`);
  await click(await center('#cv-zoom-pct')); await sleep(150);
  ok((await pct()) === "100%", "clicking % resets to 100%");
  await click(await center('#cv-zoom-in')); await sleep(150);
  ok((await pct()) === "120%", "+ zooms in (120%)");
  await click(await center('#cv-zoom-out')); await click(await center('#cv-zoom-out')); await sleep(150);
  ok((await pct()) === "83%", "− zooms out (83%)");
  await click(await center('#cv-zoom-pct')); await sleep(150);
  ok((await pct()) === "100%" && /scale\(1\)/.test(await viewTf()), "% back to 100% and the view follows");
  await click(await center('#cv-fit')); await sleep(200);
  ok(await ev(`(()=>{const s=document.getElementById('tc-scroll').getBoundingClientRect();return [...document.querySelectorAll('#tc-nodes .tc-node')].every(n=>{const r=n.getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1})})()`), "适应 fits the nodes into view");
  // preset popup opens upward from the toolbar
  await click(await center('#tc-preset-btn')); await sleep(250);
  const pp = await ev(`(()=>{const p=document.getElementById('tc-presetpop'),b=document.getElementById('tc-preset-btn').getBoundingClientRect(),r=p.getBoundingClientRect();return {open:!p.hidden,above:r.bottom<=b.top+1,inside:r.top>=0&&r.right<=innerWidth+1,text:p.innerText}})()`);
  ok(pp.open && pp.above && pp.inside && /小队/.test(pp.text), "预设 opens its list above the toolbar " + JSON.stringify({ ...pp, text: undefined }));
  await click(await center('#tc-preset-btn')); await sleep(150);
  ok(await ev(`document.getElementById('tc-presetpop').hidden`), "预设 closes on a second click");
  // narrow: icon-only
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1150, height: 800, deviceScaleFactor: 1, mobile: false }); await sleep(400);
  const narrow = await ev(`(()=>{const t=document.getElementById('cv-toolbar');return {lbl:[...t.querySelectorAll('.cv-lbl')].filter(l=>l.offsetParent!==null).length,btn:[...t.querySelectorAll('button')].filter(b=>b.offsetParent!==null).length,w:Math.round(t.getBoundingClientRect().width),h:Math.round(t.getBoundingClientRect().height),stage:Math.round(document.getElementById('tc-scroll').getBoundingClientRect().width)}})()`);
  await shot("toolbar-narrow.png");
  ok(narrow.lbl === 0 && narrow.btn === 7, "narrow width: icon-only, all 7 buttons still there " + JSON.stringify(narrow));
  ok(narrow.h < 40 && narrow.w < narrow.stage, "narrow toolbar stays one row inside the stage");
  ok(await ev(`(()=>{const m=document.getElementById('tc-minimap'),t=document.getElementById('cv-toolbar').getBoundingClientRect();if(m.hidden||m.offsetParent===null)return true;const r=m.getBoundingClientRect();return r.right<=t.left||r.bottom<=t.top})()`), "minimap does not overlap the toolbar");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 760, height: 800, deviceScaleFactor: 1, mobile: false }); await sleep(400);
  const tiny = await ev(`(()=>{const t=document.getElementById('cv-toolbar').getBoundingClientRect(),s=document.getElementById('tc-scroll').getBoundingClientRect();return {l:t.left>=s.left-1,r:t.right<=s.right+1,w:Math.round(t.width)}})()`);
  ok(tiny.l && tiny.r && tiny.w > 30, "very narrow stage: toolbar wraps but stays inside " + JSON.stringify(tiny));
  await cdp("Emulation.clearDeviceMetricsOverride"); await sleep(400);
  await click(await center('#cv-fit')); await sleep(200);

  // ---- 2. rename inline: double-click the title
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"] .tc-node-titlehit')&&document.querySelectorAll('#tc-nodes [data-id="a"] .tc-widget.editable').length===2&&document.querySelectorAll('#tc-nodes [data-id="a"] .tc-wtoggle').length===2`), "API member node has a title hit, 2 editable widgets (岗位/模型) and 2 toggles (启用/子代理)");
  ok(await ev(`document.querySelectorAll('#tc-nodes [data-id="c"] .tc-widget.editable').length===1`), "MCP member: only 岗位 is a dropdown (no model)");
  const t0 = await center('#tc-nodes [data-id="a"] .tc-node-titlehit');
  await dblclick(t0); await sleep(250);
  ok(await ev(`document.activeElement&&document.activeElement.closest('.tc-wedit-name')&&document.activeElement.value==='经理A'`), "double-clicking the title opens an inline name field");
  ok(await ev(`document.getElementById('page-members').hidden`), "…and stays on the canvas (does not jump to the 成员 page)");
  await ev(`window.__ocCanvas.selectMember('a'),1`); await sleep(150);
  await ev(`document.querySelector('.tc-wedit-name input').focus(),1`);
  const before = { tf: await viewTf(), pos: await ev(`document.querySelector('#tc-nodes [data-id="a"]').getAttribute('transform')`), n: (await posted('teamLayout')).length };
  await key("Delete", "Delete", 46); await key("Backspace", "Backspace", 8); await key(".", "Period", 190, 0, "."); await key(" ", "Space", 32, 0, " ");
  await key("z", "KeyZ", 90, 2); await sleep(250);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')&&!window.__posted.some(m=>m.action==='teamLayout'&&m.input.nodes&&m.input.nodes.a===null)`), "Delete / Backspace while typing do not remove the selected node");
  ok((await viewTf()) === before.tf && !(await ev(`document.getElementById('tc-scroll').classList.contains('tc-pan-ready')`)), "'.' and Space while typing do not fit or arm panning");
  const ip = await center('.tc-wedit-name input');
  await mouse("mouseMoved", ip, 0); await mouse("mousePressed", ip); for (let i = 1; i <= 6; i++) { await mouse("mouseMoved", { x: ip.x + 15 * i, y: ip.y + 8 * i }); await sleep(20); } await mouse("mouseReleased", { x: ip.x + 90, y: ip.y + 48 }, 0); await sleep(200);
  ok((await viewTf()) === before.tf && (await ev(`document.querySelector('#tc-nodes [data-id="a"]').getAttribute('transform')`)) === before.pos && (await posted('teamLayout')).length === before.n, "dragging inside the name field neither pans nor moves the node");
  ok(await ev(`!!document.querySelector('.tc-wedit-name input')`), "name field still open after a redraw of the node");
  await ev(`(()=>{const i=document.querySelector('.tc-wedit-name input');i.focus();i.select();return 1})()`);
  await ev(`window.__lagEmp=true`);
  await typeAndEnter("总监A"); await sleep(200);
  const se1 = await posted('saveEmployee');
  ok(se1.length === 1 && se1[0].id === "a" && se1[0].name === "总监A" && se1[0].expected_version === 1 && se1[0].roleId === "r" && se1[0].model?.id === "gpt-x" && se1[0].kind === "api" && se1[0].enabled === true, "rename posts saveEmployee with the full member (same message as the 成员 page) " + JSON.stringify(se1));
  ok(/总监A/.test(await nodeText('a')) && !(await ev(`!!document.querySelector('.tc-wedit-name')`)), "node shows the new name at once; field closed");
  await sleep(500);
  ok(/总监A/.test(await nodeText('a')), "new name survives a stale state push");
  await sleep(1500); await ev(`window.__lagEmp=false`); await sleep(3200);
  ok(/总监A/.test(await nodeText('a')) && (await ev(`window.S.staff.employees.find(e=>e.id==='a').name`)) === "总监A", "new name persisted and survives the 3-second push");
  await click(await center('#tab-members')); await sleep(300);
  ok(await ev(`[...document.querySelectorAll('#page-members *')].some(e=>e.childNodes.length===1&&e.textContent==='总监A')`), "成员 page shows the same new name");
  await click(await center('#tab-canvas')); await sleep(300);

  // ---- 3. role dropdown
  await click(await center('#tc-nodes [data-id="a"] .tc-widget[data-w="role"] .tc-widget-box')); await sleep(250);
  const rp = await ev(`(()=>{const p=document.querySelector('.tc-wpop[data-kind="role"]');return p?[...p.querySelectorAll('.tc-wpop-row')].map(r=>r.textContent):null})()`);
  ok(rp && rp.join() === "✓工程师,设计师", "clicking 岗位 opens a list of the roles (observer excluded) " + JSON.stringify(rp));
  ok(await ev(`!window.__posted.some(m=>m.action==='teamLayout'&&m.input.nodes&&m.input.nodes.a&&m.input.nodes.a.x!==window.S.team.nodes.a.x)`) && (await viewTf()) === before.tf, "clicking a widget does not drag the node or pan");
  await sleep(3300);
  ok(await ev(`!!document.querySelector('.tc-wpop[data-kind="role"]')`), "role list stays open across a state push");
  await click(await ev(`(()=>{const r=[...document.querySelectorAll('.tc-wpop-row')].find(r=>/设计师/.test(r.textContent)).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`)); await sleep(300);
  const se2 = (await posted('saveEmployee')).at(-1);
  ok(se2 && se2.roleId === "r2" && se2.name === "总监A" && se2.expected_version === 2, "picking 设计师 posts saveEmployee roleId r2 with the new version " + JSON.stringify(se2));
  await sleep(3300);
  ok(/设计师/.test(await nodeText('a')) && (await ev(`window.S.staff.employees.find(e=>e.id==='a').roleId`)) === "r2", "role change shows on the node and persists across a push");

  // ---- 4. model dropdown (search + keyboard), screenshot with it open
  await click(await center('#tc-nodes [data-id="a"] .tc-widget[data-w="model"] .tc-widget-box')); await sleep(250);
  const mp = await ev(`(()=>{const p=document.querySelector('.tc-wpop[data-kind="model"]');return p?{rows:[...p.querySelectorAll('.tc-wpop-row')].map(r=>r.textContent),heads:[...p.querySelectorAll('.tc-wpop-h')].map(h=>h.textContent),focus:document.activeElement===p.querySelector('.tc-wpop-search')}:null})()`);
  ok(mp && mp.rows.length === 3 && mp.heads.join() === "OpenAI,Anthropic" && mp.focus && mp.rows[0] === "✓GPT X", "clicking 模型 opens the catalog models grouped by provider, search focused " + JSON.stringify(mp));
  await shot("toolbar-edit.png");
  await cdp("Input.insertText", { text: "son" }); await sleep(150);
  await key("Delete", "Delete", 46); await key(".", "Period", 190, 0, "."); await sleep(150);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')`) && (await viewTf()) === before.tf, "Delete / '.' in the model search do not remove the node or fit");
  await ev(`(()=>{const q=document.querySelector('.tc-wpop-search');q.value='son';q.dispatchEvent(new Event('input'));return 1})()`); await sleep(100);
  ok((await ev(`[...document.querySelectorAll('.tc-wpop-row')].map(r=>r.textContent).join()`)) === "Sonnet 9", "search filters the models");
  await key("Enter", "Enter", 13, 0, "\r"); await sleep(300);
  const se3 = (await posted('saveEmployee')).at(-1);
  ok(se3 && se3.model && se3.model.vendor === "v2" && se3.model.id === "sonnet-9" && se3.roleId === "r2", "Enter picks Sonnet 9 → saveEmployee model {v2, sonnet-9} " + JSON.stringify(se3?.model));
  await sleep(3300);
  ok(/Sonnet 9/.test(await nodeText('a')) && (await ev(`window.S.staff.employees.find(e=>e.id==='a').model.id`)) === "sonnet-9", "model change persists across a push");

  // ---- 5. toggles, undo
  await click(await center('#tc-nodes [data-id="b"] .tc-wtoggle[data-w="enabled"] .tc-wtoggle-box')); await sleep(300);
  const se4 = (await posted('saveEmployee')).at(-1);
  ok(se4 && se4.id === "b" && se4.enabled === false, "启用 toggle posts saveEmployee enabled:false");
  await click(await center('#tc-nodes [data-id="b"] .tc-wtoggle[data-w="sub"] .tc-wtoggle-box')); await sleep(300);
  const ms = (await posted('teamMemberSettings')).at(-1);
  ok(ms && ms.memberId === "b" && ms.allowSubagents === true && ms.maxSubagents === 3, "子代理 toggle posts teamMemberSettings allowSubagents:true " + JSON.stringify(ms));
  await sleep(3300);
  ok(await ev(`document.querySelector('#tc-nodes [data-id="b"]').classList.contains('disabled')&&document.querySelector('#tc-nodes [data-id="b"] .tc-wtoggle[data-w="sub"]').classList.contains('on')`), "toggles persist across a push");
  await ev(`document.activeElement&&document.activeElement.blur&&document.activeElement.blur(),1`);
  await key("z", "KeyZ", 90, 2); await sleep(400);
  ok((await posted('teamMemberSettings')).at(-1).allowSubagents === false, "Ctrl+Z undoes the 子代理 toggle");
  await key("z", "KeyZ", 90, 2); await sleep(400);
  const se5 = (await posted('saveEmployee')).at(-1);
  ok(se5.id === "b" && se5.enabled === true, "Ctrl+Z again re-enables the member");
  await key("z", "KeyZ", 90, 2); await sleep(400);
  ok((await posted('saveEmployee')).at(-1).model?.id === "gpt-x", "Ctrl+Z undoes the model change");

  // ---- 6. 自动排列 / 居中 from the toolbar
  const nl = (await posted('teamLayout')).length;
  await click(await center('#cv-autolayout')); await sleep(400);
  ok((await posted('teamLayout')).length === nl + 1, "自动排列 re-lays out the members");
  await ev(`window.__ocCanvas.selectMember('b'),1`); await ev(`(()=>{const v=window.__ocCanvas.view();v.x+=300;return 1})()`);
  await click(await center('#cv-focus')); await sleep(200);
  ok(await ev(`(()=>{const s=document.getElementById('tc-scroll').getBoundingClientRect(),r=document.querySelector('#tc-nodes [data-id="b"] .tc-node-box').getBoundingClientRect();return Math.abs((r.left+r.right)/2-(s.left+s.right)/2)<4})()`), "居中 centres the selected member");

  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
