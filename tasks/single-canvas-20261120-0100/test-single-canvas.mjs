// Headless e2e for single-canvas (团队协作：成员编排并入 AI 画布，只剩一张画布；不弹操作提示；没有开关、模式切换和编排按钮，只留「预设」).
// node tasks/single-canvas-20261120-0100/test-single-canvas.mjs   (needs Microsoft Edge; no OpenCode needed)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/single-canvas-20261120-0100");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "single-canvas-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-errorForeground:#f48771;--vscode-panel-border:#3c3c3c;--vscode-widget-border:#454545;font-family:Segoe UI,Microsoft YaHei,sans-serif;font-size:13px;color:#cccccc;background:#1e1e1e}</style>`;
// The stub plays the extension: state lives in localStorage (survives a reload like the team file does),
// teamLayout/teamEdges/teamEdge change it and push a new state; window.__lag holds a teamLayout back so a stale push arrives first.
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const INIT={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r'},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r'},{id:'c',name:'测试C',kind:'api',enabled:true,roleId:'r'}]},
 team:{nodes:{},edges:[],chat:[],settings:{},subagents:[],mode:'all',presets:[]},tasks:[]};
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
  else if(m.action==='teamEdge'&&i.type==='none'){S.team.edges=S.team.edges.filter(e=>!(e.from===i.from&&e.to===i.to));}save();};
 if(m.action==='teamLayout'&&window.__lag){const stale=JSON.parse(JSON.stringify(S));reply('result',m.id,{});window.__push(stale);setTimeout(()=>window.__push(stale),300);setTimeout(()=>{apply();window.__push();},1500);return;}
 apply();reply('result',m.id,r);if(/^team(Edges?|Layout)$/.test(m.action))window.__push();}});
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
  // collab-ports: 双击后是「成员 / 节点」下拉框，按名字选成员
  const pickMember = name => ev(`(()=>{const s=document.querySelector('.tc-addpop2 select');const o=[...s.options].find(o=>o.text.startsWith(${JSON.stringify(name)}));if(!o)return false;s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  const typeAndEnter = async text => { await cdp("Input.insertText", { text }); await sleep(150); await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); };
  const toastText = () => ev(`(()=>{const f=document.getElementById('feedback');const vis=[...document.querySelectorAll('body *')].filter(e=>/已把|加到画布|已保存|已删除|现在管理|已套用|已存为/.test(e.childNodes.length===1&&e.firstChild.nodeType===3?e.textContent:'')&&e.offsetParent!==null&&!e.closest('#page-members,#page-chat'));return (f?f.textContent:'')+vis.map(e=>e.textContent).join('|')})()`);
  const load = async () => { await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1800); };
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await load();

  // ---- 1. one canvas: no mode switch, no 连线/网页预览 toggles, no orchestration buttons, no legend / hint line; only 预设
  ok(await ev(`!document.getElementById('page-canvas').hidden`), "canvas page is open");
  ok(await ev(`['cv-mode-ai','cv-legacy-toggle','cv-legacy'].every(id=>!document.getElementById(id))&&!document.querySelector('.cv-modeseg')`), "no AI 画布 / 成员编排 mode switch");
  ok(await ev(`!document.getElementById('cv-links-toggle')&&!document.getElementById('cv-previews-toggle')&&!document.querySelector('.cv-toggle')`), "no 连线 / 网页预览 toggles");
  // canvas-toolbar-edit (2026-11-20): the bottom-right grouped toolbar (zoom / 适应 / 自动排列 / 居中) is back and 预设 sits inside it; only the orchestration buttons stay gone
  ok(await ev(`['tc-canvas-add','tc-link-manage','tc-link-peer','tc-auto','tc-zoom'].every(id=>!document.getElementById(id))`), "no ＋成员 / ↓管理 / ⇄协作 orchestration buttons");
  const btns = await ev(`[...document.querySelectorAll('.cv-center button')].filter(b=>b.offsetParent!==null).map(b=>b.id)`);
  ok(JSON.stringify(btns) === JSON.stringify(["cv-zoom-out","cv-zoom-pct","cv-zoom-in","cv-fit","cv-autolayout","cv-focus","tc-preset-btn"]) && await ev(`[...document.querySelectorAll('.cv-center button')].filter(b=>b.offsetParent!==null).every(b=>b.closest('#cv-toolbar'))`), "the canvas buttons are the bottom-right toolbar, 预设 included: " + JSON.stringify(btns));
  ok(await ev(`!document.querySelector('.tc-legend')&&!/拖空白处平移|发言中|执行任务|子代理/.test(document.querySelector('.cv-center').innerText)`), "no legend bar and no hint line");
  ok(await ev(`document.getElementById('tc-canvas').closest('#page-canvas')&&document.getElementById('cv-items').closest('#tc-scroll')`), "member nodes and live AIs share one stage");
  await shot("canvas-empty.png");

  // ---- 2. double-click empty space adds a member; it shows at once, with no toast; a stale state push does not drop it
  await ev(`window.__lag=true`);
  const p1 = await freePoint();
  await dblclick(p1); await sleep(300);
  ok(await ev(`!!document.querySelector('.tc-nsearch input')`), "double-click on empty canvas opens the member / node search");
  await typeAndEnter("经理A"); await sleep(120);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')`), "added member appears on the canvas immediately");
  ok(!(await toastText()), "no toast after adding a member: " + JSON.stringify(await toastText()));
  await sleep(700);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')`), "member survives a stale state push");
  await sleep(1500);
  ok(await ev(`!!window.S.team.nodes.a`), "position saved via teamLayout");
  ok(!(await toastText()), "still no toast");
  await ev(`window.__lag=false`);
  await sleep(2600);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')`), "member survives a snapshot poll and the 3-second state push");

  // second member, then wire A out -> B in = manager relation
  const p2 = await freePoint(320);
  await dblclick(p2); await sleep(300);
  await typeAndEnter("成员B"); await sleep(600);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="b"]')`), "second member added by double-click");
  const from = await center('[data-id="a"] .tc-port-out .tc-port-dot'), to = await center('[data-id="b"] .tc-node-box');
  await mouse("mouseMoved", from, 0); await mouse("mousePressed", from);
  for (let i = 1; i <= 8; i++) { await mouse("mouseMoved", { x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8 }); await sleep(30); }
  await mouse("mouseReleased", to, 0); await sleep(600);
  const edgeActs = await ev(`window.__posted.filter(m=>m.type==='action'&&m.action==='teamEdges').map(m=>m.input)`);
  ok(edgeActs.length === 1 && edgeActs[0].from === "a" && edgeActs[0].to[0] === "b" && edgeActs[0].type === "manage", "dragging out→in creates a manager relation " + JSON.stringify(edgeActs));
  ok(await ev(`document.querySelectorAll('#tc-edges .tc-edge-manage').length===1`), "manager wire drawn");
  ok(!(await toastText()), "no toast after connecting");

  // ---- 3. a live AI shows on the same canvas; the API member is not drawn twice; groups do not cover member nodes
  await ev(`(()=>{const n=Date.now();Object.assign(window.__snap,{ais:[
    {key:'ai:x',name:'阿尔法',explicit:true,client:'Codex',kind:'mcp',project:'w1',status:'working',stuck:false,lastAt:n-5000,lastTool:'apply_patch',running:[{tool:'apply_patch',at:n-2000}],needs:0},
    {key:'member:a',name:'经理A',explicit:true,client:'m',kind:'api',project:'w1',status:'idle',stuck:false,lastAt:0,running:[],needs:0}],
    links:[{from:'ai:x',to:'member:a',kind:'chat',label:'群聊消息 1 次'}]});window.__saveSnap();return 1})()`);
  await sleep(2600);
  ok(await ev(`!!document.querySelector('#cv-items .cv-card[data-ai="ai:x"]')`), "live AI card on the canvas");
  ok(await ev(`!document.querySelector('#cv-items .cv-card[data-ai="member:a"]')`), "API member on the canvas is not duplicated as an AI card");
  ok(/正在 改文件|工作中/.test(await ev(`document.querySelector('#cv-items .cv-card[data-ai="ai:x"]').innerText`)), "AI card keeps its live status / activity");
  ok(await ev(`(()=>{const g=document.querySelector('#cv-items .cv-group').getBoundingClientRect();return [...document.querySelectorAll('#tc-nodes .tc-node')].every(n=>{const r=n.getBoundingClientRect();return r.right<=g.left||r.left>=g.right||r.bottom<=g.top||r.top>=g.bottom})})()`), "AI group does not cover member nodes");
  ok(await ev(`document.querySelectorAll('#cv-links-g path.cv-link').length===1`), "AI → member link drawn (links always on)");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await sleep(400);
  ok(await ev(`(()=>{const s=document.getElementById('tc-scroll').getBoundingClientRect();return [...document.querySelectorAll('#tc-nodes .tc-node, #cv-items .cv-card')].every(n=>{const r=n.getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1})})()`), "'.' fits members and AIs into view");
  ok(await ev(`document.getElementById('cv-world').style.transform.includes('scale')&&document.getElementById('tc-world').getAttribute('transform').includes('scale')`), "AI layer follows the shared pan/zoom");
  await shot("canvas-member-ai.png");
  // incremental: a new snapshot keeps the AI card element, a state push keeps member nodes and the view
  await ev(`(()=>{window.__card=document.querySelector('[data-ai="ai:x"]');window.__node=document.querySelector('#tc-nodes [data-id="a"]');window.__tf=document.getElementById('tc-world').getAttribute('transform');window.__snap.ais[0].lastTool='run_command';return 1})()`);
  await sleep(3200);
  ok(await ev(`document.querySelector('[data-ai="ai:x"]')===window.__card&&document.querySelector('#tc-nodes [data-id="a"]')===window.__node`), "card and node elements reused across snapshot + state push");
  ok(await ev(`document.getElementById('tc-world').getAttribute('transform')===window.__tf`), "pan/zoom kept across pushes");
  const ctx = await center('#tc-canvas'); const fp = await freePoint();
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: fp.x, y: fp.y, button: "right", buttons: 2, clickCount: 1 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: fp.x, y: fp.y, button: "right", buttons: 0, clickCount: 1 }); await sleep(300);
  ok(/适应画布/.test(await ev(`document.querySelector('.tc-cmenu')?.innerText||''`)), "right-click canvas menu has 适应画布");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await sleep(200);

  // ---- 4. reload: members, relation and the AI card come back
  await load(); await sleep(2600);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')&&!!document.querySelector('#tc-nodes [data-id="b"]')`), "members survive a reload");
  ok(await ev(`document.querySelectorAll('#tc-edges .tc-edge-manage').length===1`), "relation survives a reload");
  ok(await ev(`!!document.querySelector('#cv-items .cv-card[data-ai="ai:x"]')`), "live AI shows after reload");

  // ---- 5. errors are still shown, small, and go away by themselves
  await ev(`window.postMessage({type:'error',message:'测试错误'},'*')`); await sleep(200);
  const fb = await ev(`(()=>{const f=document.getElementById('feedback'),r=f.getBoundingClientRect();return {t:f.textContent,w:r.width,h:r.height,err:f.classList.contains('error')}})()`);
  ok(fb.t === "测试错误" && fb.err && fb.w < 400 && fb.h < 40, "error message is a small notice " + JSON.stringify(fb));
  await sleep(4300);
  ok((await ev(`document.getElementById('feedback').textContent`)) === "", "error notice dismisses itself");

  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
