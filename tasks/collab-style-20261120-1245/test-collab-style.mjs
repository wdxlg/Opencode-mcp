// Headless check for collab-style (团队协作视觉打磨 + 动效): 新节点才播入场、3 秒推送重画不重播、删除淡出、连线画出/流动、工具栏缩放平滑、减弱动态效果与 oc-notrans 下不播、样式只作用于团队协作页。
// node tasks/collab-style-20261120-1245/test-collab-style.mjs   (needs Microsoft Edge for the page part)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/collab-style-20261120-1245");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m); } };

// ---- A. static: new styles are scoped to the collaboration page; reduced motion handled
{
  const css = fs.readFileSync(path.join(root, "assets", WB, "automation.css"), "utf8");
  const a = css.indexOf("/* ===== collab-style (2026-11-20)"), b = css.indexOf("/* ===== collab-style END ===== */");
  ok(a > 0 && b > a, "collab-style section present");
  const sec = css.slice(css.indexOf("*/", a) + 2, b).replace(/\/\*[\s\S]*?\*\//g, "");
  const bad = [], stack = []; let buf = "";
  const check = sel => { for (const part of sel.split(/,(?![^()]*\))/)) if (!/^\s*body\.(tc-body|vscode-high-contrast\.tc-body)\b/.test(part)) bad.push(part.trim()); };
  for (const ch of sec) {
    if (ch === "{") { const s = buf.trim(); buf = ""; const top = stack.at(-1) || ""; if (!top.startsWith("@keyframes") && !s.startsWith("@")) check(s); stack.push(top.startsWith("@keyframes") ? "@keyframes" : s); }
    else if (ch === "}") { stack.pop(); buf = ""; }
    else if (ch === ";" ) { buf = ""; } else buf += ch;
  }
  ok(!bad.length, "every collab-style rule is under body.tc-body (rules/automation pages unaffected) " + JSON.stringify(bad.slice(0, 5)));
  ok(/@media \(prefers-reduced-motion: reduce\) \{\s*body\.tc-body \*, body\.tc-body \*::before, body\.tc-body \*::after \{ animation: none !important; transition: none !important; \}/.test(sec), "reduced motion turns collab animations/transitions off");
  ok(!/transition:[^;}]*\btransform\b/.test(sec), "no transition on transform in the new rules (dragging/panning set transforms directly)");
  // style2 (14:40)：VS Code 原生扁平风格 —— 无渐变 / 毛玻璃 / 光晕 / 回弹 / 悬停上浮，动画 ≤150ms
  ok(!/gradient\(|backdrop-filter:\s*blur|drop-shadow|cubic-bezier\(\.34|scale\(\s*\.9|scale:\s*\.9|scale:\s*1\.[0-9]/.test(sec), "flat VS Code look: no gradients, glass blur, glow drop-shadows, spring/scale bounce");
  ok(!/:hover[^{]*\{[^}]*translate:\s*0\s+-/.test(sec), "no hover lift");
  ok([...sec.matchAll(/animation:\s*cs-(?!flow|blink)[a-z-]+\s+(\.\d+|var\(--cs-(fast|mid)\))s?/g)].every(m => m[1].startsWith("var") || parseFloat(m[1]) <= .15), "one-shot animations are ≤150ms");
  ok(!/#[0-9a-f]{3,6}\b/i.test(sec.replace(/,\s*#[0-9a-f]{3,6}\)/gi, ")").replace(/fill: #fff/g, "")), "no hard-coded hues (only VS Code theme tokens; hex only as var() fallback)");
  const js = fs.readFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), "utf8");
  ok(/function motionOK\(\)\{return !document\.documentElement\.classList\.contains\('oc-notrans'\)&&!\(window\.matchMedia&&matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\);\}/.test(js), "script skips enter animations under oc-notrans and reduced motion");
  const sh = fs.readFileSync(path.join(root, "recovered/shared/automation-workbench.mjs"), "utf8"), es = fs.readFileSync(path.join(root, "recovered/esm/000-extension.js/automation-workbench.mjs"), "utf8");
  ok(sh === es && /html\.oc-notrans \*,html\.oc-notrans \*::before,html\.oc-notrans \*::after\{transition:none!important;animation:none!important\}/.test(sh) && /body\.oc-boot\{visibility:hidden\}/.test(sh), "anti-flash boot (oc-boot / oc-notrans) unchanged and both extension copies identical");
}

// ---- C. page (headless Edge)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "collab-style-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-errorForeground:#f48771;--vscode-panel-border:#3c3c3c;--vscode-widget-border:#454545;font-family:Segoe UI,Microsoft YaHei,sans-serif;font-size:13px;color:#cccccc;background:#1e1e1e}</style>`;
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const INIT={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'},{id:'observer',name:'观察者'}],
 routingCatalog:{models:[{vendor:'v1',id:'gpt-x',name:'GPT X',group:'OpenAI'}]},
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false}]},
 team:{nodes:{a:{x:80,y:120},b:{x:520,y:120}},edges:[{from:'a',to:'b',type:'manage'}],chat:[],settings:{},subagents:[],mode:'all',presets:[]},tasks:[]};
const S=window.S=JSON.parse(localStorage.getItem('__S')||'null')||INIT;
const save=()=>localStorage.setItem('__S',JSON.stringify(S));
window.__snap={now:Date.now(),ais:[],projects:[{id:'w1',name:'P',root:'D:/p'}],current:'w1',needs:[],links:[],activity:[],changes:[],browser:{tabs:[]},layout:{groups:{}}};
window.__push=function(value){const v=JSON.parse(JSON.stringify(value||S));setTimeout(()=>window.postMessage({type:'state',value:v},'*'),0);};
setInterval(()=>window.__push(),3000);
function reply(type,id,value){setTimeout(()=>window.postMessage({type,id,value},'*'),0);}
// same rules as the extension (automation-workbench.mjs): main node nodes[id], extra nodes copies['id~x'], edges by member id + fromNode/toNode
const base=k=>String(k).split('~')[0],isCopy=k=>String(k).includes('~'),endKey=(e,s)=>e[s+'Node']||e[s];
function drop(k){const t=S.team;t.copies=t.copies||{};t.edges=t.edges.filter(e=>endKey(e,'from')!==k&&endKey(e,'to')!==k);if(isCopy(k)){delete t.copies[k];return;}delete t.nodes[k];const rest=Object.keys(t.copies).filter(c=>base(c)===k);if(rest.length){const c=rest[0];t.nodes[k]=t.copies[c];delete t.copies[c];for(const e of t.edges){if(e.fromNode===c)delete e.fromNode;if(e.toNode===c)delete e.toNode;}}else t.edges=t.edges.filter(e=>e.from!==k&&e.to!==k);}
function rec(f,t,type){const e={from:base(f),to:base(t),type};if(isCopy(f)&&S.team.copies?.[f])e.fromNode=f;if(isCopy(t)&&S.team.copies?.[t])e.toNode=t;return e;}
window.acquireVsCodeApi=()=>({getState(){try{return JSON.parse(localStorage.getItem('__vs')||'null')}catch{return null}},setState(v){localStorage.setItem('__vs',JSON.stringify(v))},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){window.__push();return;}
 if(m.type==='canvas'){window.__snap.now=Date.now();reply('canvasResult',m.id,m.action==='snapshot'||m.action==='seen'?JSON.parse(JSON.stringify(window.__snap)):{});return;}
 if(m.type!=='action')return;
 const i=m.input||{},t=S.team;t.copies=t.copies||{};let r={};
 if(m.action==='teamEdges'){const added=[],skipped=[];for(const to of i.to){if(base(to)===base(i.from)){skipped.push({id:to,reason:'同一位成员的两个节点之间不能连线'});continue;}t.edges=t.edges.filter(e=>!(e.from===base(i.from)&&e.to===base(to)||e.from===base(to)&&e.to===base(i.from)));t.edges.push(rec(i.from,to,i.type));added.push(to);}r={added,skipped};}
 else if(m.action==='teamLayout'){const ents=Object.entries(i.nodes||{}).sort((x,y)=>(y[1]===null&&isCopy(y[0]))-(x[1]===null&&isCopy(x[0])));for(const [k,v] of ents){if(v===null)drop(k);else if(isCopy(k)){if(!t.nodes[base(k)]&&!t.copies[k])t.nodes[base(k)]=v;else t.copies[k]=v;}else t.nodes[k]=v;}}
 else if(m.action==='teamEdge'&&i.type==='none'){t.edges=t.edges.filter(e=>!(e.from===base(i.from)&&e.to===base(i.to)||e.from===base(i.to)&&e.to===base(i.from)));}
 else if(m.action==='saveEmployee'){const e=S.staff.employees.find(x=>x.id===i.id);if(!e||e.version!==i.expected_version){setTimeout(()=>window.postMessage({type:'result',id:m.id,error:'员工配置已变化'},'*'),0);return;}Object.assign(e,{name:i.name,kind:i.kind,roleId:i.roleId,model:i.model,allowedPaths:i.allowedPaths,allowShell:i.allowShell,enabled:i.enabled,version:e.version+1});r=JSON.parse(JSON.stringify(e));}
 else if(m.action==='teamMemberSettings'){t.settings[i.memberId]={allowSubagents:i.allowSubagents,maxSubagents:i.maxSubagents};}
 else if(m.action==='teamMemberAvatar'){t.avatars=t.avatars||{};if(i.avatar)t.avatars[i.memberId]=i.avatar;else delete t.avatars[i.memberId];}
 save();reply('result',m.id,r);if(/^(team(Edges?|Layout|MemberSettings|MemberAvatar)|saveEmployee)$/.test(m.action))window.__push();}});
</script>`;
html = html.replace(/<script src="collaboration.js"><\/script>/, stub + '<script src="collaboration.js"></script>');
fs.writeFileSync(path.join(dir, "index.html"), html);
fs.copyFileSync(path.join(root, "assets", WB, "automation.css"), path.join(dir, "automation.css"));
fs.copyFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), path.join(dir, "collaboration.js"));
const edgeExe = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(f => fs.existsSync(f));
if (!edgeExe) { console.log("SKIP page part: Edge not found"); console.log(JSON.stringify({ ok: fail === 0, pass, fail })); process.exit(fail ? 1 : 0); }
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(edgeExe, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(dir, "prof")}`, "--window-size=1600,900", "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  let target; for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let seq = 0; const waits = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } };
  const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async expr => { const r = await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) throw Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };
  const shot = async name => { const s = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(here, name), Buffer.from(s.result.data, "base64")); };
  const mouse = (type, p, buttons = 1, clickCount = 1, button = "left") => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button, buttons, clickCount });
  const center = sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  const click = async p => { await mouse("mouseMoved", p, 0); await mouse("mousePressed", p, 1, 1); await mouse("mouseReleased", p, 0, 1); };
  const dblclick = async p => { await mouse("mouseMoved", p, 0); await mouse("mousePressed", p, 1, 1); await mouse("mouseReleased", p, 0, 1); await mouse("mousePressed", p, 1, 2); await mouse("mouseReleased", p, 0, 2); };
  const drag = async (a, b) => { await mouse("mouseMoved", a, 0); await mouse("mousePressed", a, 1, 1); for (let k = 1; k <= 8; k++) await mouse("mouseMoved", { x: a.x + (b.x - a.x) * k / 8, y: a.y + (b.y - a.y) * k / 8 }, 1); await mouse("mouseReleased", b, 0, 1); };
  const key = async (k, code, vk, mods = 0) => { await cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); };
  const posted = action => ev(`window.__posted.filter(m=>m.type==='action'&&m.action===${JSON.stringify(action)}).map(m=>m.input)`);
  const freePoint = () => ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();for(let y=r.top+380;y<r.bottom-160;y+=20)for(let x=r.left+300;x<r.right-260;x+=20){const e=document.elementFromPoint(x,y);if(e&&(e.id==='tc-canvas'||e.id==='tc-bg'))return {x,y};}return null})()`);
  const nodesOf = id => ev(`[...document.querySelectorAll('#tc-nodes .tc-node')].filter(g=>g.dataset.member===${JSON.stringify(id)}).map(g=>g.dataset.id)`);
  const load = async () => { await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1800); };
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await load(); await ev(`localStorage.clear()`); await load(); await sleep(500);

  const S0 = () => ev(`JSON.stringify(S)`);
  const enters = () => ev(`[...document.querySelectorAll('#tc-nodes .tc-node.tc-enter')].map(g=>g.dataset.id)`);
  ok(JSON.stringify(await enters()) === "[]", "first render: no enter animation");
  await ev(`window.__push(),1`); await sleep(400);
  ok(JSON.stringify(await enters()) === "[]", "state push re-render: existing nodes are not re-animated");
  await click(await center('#tc-nodes [data-id="a"] .tc-node-name')); await sleep(80);
  ok(JSON.stringify(await enters()) === "[]" && await ev(`document.querySelector('#tc-nodes [data-id="a"]').classList.contains('selected')`), "selection redraw does not replay enter animation");
  // a new member node animates in, others do not
  await ev(`(()=>{S.staff.employees.push({id:'c',name:'成员C',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false});S.team.nodes.c={x:300,y:420};window.__push();return 1})()`); await sleep(50);
  ok(JSON.stringify(await enters()) === '["c"]', "only the truly new node gets the enter animation " + JSON.stringify(await enters()));
  ok((await ev(`getComputedStyle(document.querySelector('#tc-nodes [data-id="c"]')).animationName`)) === "cs-node-in", "enter animation is the fade + 4px keyframe");
  await ev(`window.__push(),1`); await sleep(15); // style2：入场只有 150ms，推送要落在动画期间
  ok(JSON.stringify(await enters()) === '["c"]', "a push during the enter animation continues it (not restarted, not cut)");
  await sleep(700);
  ok(JSON.stringify(await enters()) === "[]", "enter class removed afterwards (tab switches will not replay it)");
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="c"] .tc-node-initial')&&document.querySelector('#tc-nodes [data-id="c"] .tc-node-initial-text').textContent==='成'`), "node header shows an initial avatar when no picture is set");
  // new edge is drawn in; busy member gets flowing edge + pulse
  await ev(`(()=>{S.team.edges.push({from:'a',to:'c',type:'manage'});window.__push();return 1})()`); await sleep(150);
  ok(await ev(`document.querySelectorAll('#tc-flows .tc-edge-draw').length===0&&document.querySelectorAll('#tc-edges .tc-edge').length===2`), "new edge: no draw-in overlay any more (style2), edge count unchanged in #tc-edges");
  ok((await ev(`[...document.querySelectorAll('#tc-edges .tc-edge')].map(p=>getComputedStyle(p).animationName).join()`)).split(',').filter(n => n === 'cs-edge-in').length === 1, "only the new edge fades in");
  await ev(`(()=>{S.team.busy={memberId:'a'};window.__push();return 1})()`); await sleep(250);
  ok(await ev(`document.querySelectorAll('#tc-flows .tc-flow').length===2&&!document.querySelector('.tc-node-pulse')&&getComputedStyle(document.querySelector('#tc-nodes [data-id="a"] .tc-node-dot')).animationName==='cs-blink'`), "speaking member: its edges get a faint dashed flow, status dot blinks softly (no pulse ring)");
  ok(await ev(`(()=>{const b=document.querySelector('#tc-nodes [data-id="a"] .tc-node-box'),s=getComputedStyle(b);return b.getAttribute('rx')==='4'&&s.filter==='none'&&parseFloat(s.strokeWidth)<=1.01&&!document.querySelector('.tc-node-sheen')})()`), "node: radius 4, no shadow, 1px border, no sheen");
  ok((await ev(`getComputedStyle(document.querySelector('#tc-flows .tc-flow')).animationName`)) === "cs-flow", "flow animation runs");
  await shot("canvas-active.png");
  // dragging a node keeps flows attached and no transition on the node transform
  const before = await ev(`document.querySelector('#tc-flows .tc-flow').getAttribute('d')`);
  const pa = await center('#tc-nodes [data-id="a"] .tc-node-name');
  await mouse("mouseMoved", pa, 0); await mouse("mousePressed", pa, 1, 1); for (let k = 1; k <= 6; k++) await mouse("mouseMoved", { x: pa.x + k * 10, y: pa.y + k * 6 }, 1);
  const midDrag = await ev(`({cls:document.getElementById('tc-scroll').classList.contains('tc-node-dragging'),tr:getComputedStyle(document.querySelector('#tc-nodes [data-id="a"]')).transitionProperty,d:document.querySelector('#tc-flows .tc-flow').getAttribute('d')})`);
  await mouse("mouseReleased", { x: pa.x + 60, y: pa.y + 36 }, 0, 1); await sleep(200);
  ok(midDrag.cls && !/transform|all/.test(midDrag.tr) && midDrag.d !== before, "while dragging: stage marked, no transform transition, flow follows " + JSON.stringify({ ...midDrag, d: undefined }));
  ok(!(await ev(`document.getElementById('tc-scroll').classList.contains('tc-node-dragging')`)), "drag mark cleared on release");
  // removing a node fades a ghost out
  await ev(`(()=>{S.team.busy=null;delete S.team.nodes.c;S.team.edges=S.team.edges.filter(e=>e.to!=='c');window.__push();return 1})()`); await sleep(120);
  ok(await ev(`!document.querySelector('#tc-nodes [data-id="c"]')&&document.querySelectorAll('#tc-ghosts .tc-node-ghost').length===1&&!document.querySelector('#tc-ghosts [data-id]')`), "removed node: gone from #tc-nodes, a non-interactive ghost fades out");
  await sleep(450);
  ok(await ev(`document.querySelectorAll('#tc-ghosts > *').length===0`), "ghost removed after the fade");
  // smooth zoom from the toolbar ends exactly on the target
  await click(await center('#cv-zoom-pct')); await sleep(200);
  await click(await center('#cv-zoom-in'));
  const mid = await ev(`window.__ocCanvas.view().k`);
  await sleep(200);
  ok((await ev(`document.getElementById('cv-zoom-pct').textContent`)) === "120%" && Math.abs(await ev(`window.__ocCanvas.view().k`) - 1.2) < 1e-9, "zoom tween lands on 120% (mid " + mid + ")");
  await click(await center('#cv-zoom-pct')); await sleep(200);
  // toast slides in
  await ev(`window.postMessage({type:'error',message:'样式测试错误'},'*')`); await sleep(80);
  ok((await ev(`getComputedStyle(document.getElementById('feedback')).animationName`)) === "cs-toast-in", "error toast slides in");
  // context menu pops with animation
  await mouse("mousePressed", await center('#tc-nodes [data-id="a"] .tc-node-box'), 2, 1, "right"); await mouse("mouseReleased", await center('#tc-nodes [data-id="a"] .tc-node-box'), 0, 1, "right"); await sleep(250);
  ok((await ev(`(()=>{const m=document.querySelector('.tc-cmenu');return m&&getComputedStyle(m).animationName})()`)) === "cs-pop", "context menu opens with the pop animation");
  await shot("canvas-menu.png");
  await key("Escape", "Escape", 27); await sleep(100);
  // oc-notrans (opening the panel): no enter animation
  await ev(`(()=>{document.documentElement.classList.add('oc-notrans');S.team.nodes.c={x:300,y:420};window.__push();return 1})()`); await sleep(120);
  ok(JSON.stringify(await enters()) === "[]", "html.oc-notrans: a new node does not animate");
  await ev(`(()=>{document.documentElement.classList.remove('oc-notrans');delete S.team.nodes.c;window.__push();return 1})()`); await sleep(400);
  // reduced motion
  await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }); await sleep(100);
  await ev(`(()=>{S.team.nodes.c={x:300,y:420};S.team.busy={memberId:'a'};window.__push();return 1})()`); await sleep(150);
  ok(JSON.stringify(await enters()) === "[]", "reduced motion: new node does not animate");
  ok((await ev(`getComputedStyle(document.querySelector('#tc-flows .tc-flow')).animationName`)) === "none" && (await ev(`getComputedStyle(document.querySelector('#tc-nodes [data-id="a"]')).transitionDuration`)).split(',').every(x => parseFloat(x) === 0), "reduced motion: flow and node transitions off");
  await ev(`(()=>{delete S.team.nodes.c;S.team.busy=null;window.__push();return 1})()`); await sleep(150);
  ok(await ev(`document.querySelectorAll('#tc-ghosts > *').length===0`), "reduced motion: no fade-out ghost");
  const z0 = await ev(`window.__ocCanvas.view().k`); await click(await center('#cv-zoom-in')); const z1 = await ev(`window.__ocCanvas.view().k`);
  ok(Math.abs(z1 - z0 * 1.2) < 1e-9, "reduced motion: zoom is instant");
  await click(await center('#cv-zoom-pct')); await sleep(100);
  await cdp("Emulation.setEmulatedMedia", { features: [] });
  // members page rows: first view no animation, a new member staggers in
  await click(await center('#tab-members')); await sleep(300);
  ok(await ev(`document.querySelectorAll('#tc-mlist .tc-mrow.tc-enter').length===0`), "members page first view: rows do not animate");
  await ev(`(()=>{S.staff.employees.push({id:'d',name:'成员D',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false});window.__push();return 1})()`); await sleep(120);
  ok(await ev(`[...document.querySelectorAll('#tc-mlist .tc-mrow.tc-enter')].length===1`), "members page: only the new row animates");
  await sleep(500); await shot("members.png");
  await click(await center('#tab-canvas')); await sleep(300);
  await shot("canvas.png");
  // light theme (VS Code Light Modern tokens)
  await ev(`(()=>{const s=document.createElement('style');s.textContent=':root,body{--vscode-foreground:#3b3b3b;--vscode-editor-background:#ffffff;--vscode-sideBar-background:#f8f8f8;--vscode-editorWidget-background:#f8f8f8;--vscode-editorWidget-border:#c8c8c8;--vscode-widget-border:#e5e5e5;--vscode-panel-border:#e5e5e5;--vscode-focusBorder:#005fb8;--vscode-input-background:#ffffff;--vscode-input-foreground:#3b3b3b;--vscode-input-border:#cecece;--vscode-descriptionForeground:#3b3b3b;--vscode-menu-background:#ffffff;--vscode-menu-foreground:#3b3b3b;--vscode-list-hoverBackground:#f2f2f2;--vscode-list-activeSelectionBackground:#e8e8e8;--vscode-button-background:#005fb8;--vscode-button-foreground:#fff;--vscode-badge-background:#cccccc;--vscode-badge-foreground:#3b3b3b;color:#3b3b3b;background:#fff}';document.body.append(s);for(const r of s.sheet.cssRules[0].style)if(r.startsWith('--'))for(const n of [document.documentElement,document.body])n.style.setProperty(r,s.sheet.cssRules[0].style.getPropertyValue(r));document.body.classList.remove('vscode-dark');document.body.classList.add('vscode-light');return 1})()`); await sleep(200);
  await shot("canvas-light.png");
  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
