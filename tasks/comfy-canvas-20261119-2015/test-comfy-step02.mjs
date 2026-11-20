// Headless e2e for comfy-canvas step02 (ComfyUI 手感：平移/缩放/框选/双击搜索/松线搜索/右键菜单/撤销/小地图) (ComfyUI 式端口拖拽连线) on the 成员编排 canvas.
// node tasks/comfy-canvas-20261119-2015/test-comfy-wires.mjs   (needs Microsoft Edge; no OpenCode needed)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "comfy-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-list-activeSelectionBackground:#04395e;--vscode-list-hoverBackground:#2a2d2e;--vscode-terminal-ansiCyan:#11a8cd;--vscode-textLink-foreground:#3794ff;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-widget-border:#303031;--vscode-errorForeground:#f48771;--vscode-font-family:'Segoe UI',sans-serif;background:#1e1e1e;color:#ccc}</style>`;
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const S={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r'},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r'},{id:'c',name:'成员C',kind:'api',enabled:true,roleId:'r'},{id:'d',name:'测试D',kind:'api',enabled:true,roleId:'r'},{id:'e',name:'审查E',kind:'api',enabled:true,roleId:'r'}]},
 team:{nodes:{a:{x:60,y:110},b:{x:520,y:110},c:{x:60,y:360}},edges:[],chat:[],settings:{},subagents:[],mode:'all'},tasks:[]};
function push(){setTimeout(()=>window.postMessage({type:'state',value:JSON.parse(JSON.stringify(S))},'*'),0);}
function reply(id,result){setTimeout(()=>window.postMessage({type:'result',id,value:result},'*'),0);}
window.acquireVsCodeApi=()=>({getState(){return null},setState(){},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){push();return;}
 if(m.type!=='action'){return;}
 const i=m.input||{};let r={};
 if(m.action==='teamEdges'){const added=[];for(const to of i.to){if(to===i.from||S.team.edges.some(e=>e.from===i.from&&e.to===to))continue;S.team.edges.push({from:i.from,to,type:i.type});added.push(to);}r={added,skipped:[]};}
 else if(m.action==='teamLayout'){for(const [k,v] of Object.entries(i.nodes||{})){if(v)S.team.nodes[k]=v;else{delete S.team.nodes[k];S.team.edges=S.team.edges.filter(e=>e.from!==k&&e.to!==k);}}}
 else if(m.action==='teamEdge'&&i.type==='none'){S.team.edges=S.team.edges.filter(e=>!(e.from===i.from&&e.to===i.to));}
 reply(m.id,r);if(/^team(Edges?|Layout)$/.test(m.action))push();}});
</script>`;
html = html.replace(/<script src="collaboration.js"><\/script>/, stub + '<script src="collaboration.js"></script>');
fs.writeFileSync(path.join(dir, "index.html"), html);
fs.copyFileSync(path.join(root, "assets", WB, "automation.css"), path.join(dir, "automation.css"));
fs.copyFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), path.join(dir, "collaboration.js"));

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
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1500);
  // show the 成员编排 canvas if the new console hides it
  await ev(`(()=>{const t=document.getElementById('cv-legacy-toggle');const box=document.getElementById('cv-legacy');if(t&&box&&box.hidden)t.click();return 1})()`); await sleep(300);
  const center = sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width}})()`);
  const mouse = (type, p, buttons = 1) => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", buttons, clickCount: 1 });
  async function dragTo(fromSel, to, before) { const a = await center(fromSel); if (!a) throw Error("no " + fromSel); await mouse("mouseMoved", a, 0); await mouse("mousePressed", a); for (let i = 1; i <= 8; i++) await mouse("mouseMoved", { x: a.x + (to.x - a.x) * i / 8, y: a.y + (to.y - a.y) * i / 8 }); if (before) await before(); await mouse("mouseReleased", to, 0); await sleep(400); }
  const actions = () => ev(`window.__posted.filter(m=>m.type==='action'&&/^teamEdge/.test(m.action)).map(m=>[m.action,m.input])`);
  const edges = () => ev(`[...document.querySelectorAll('#tc-edges .tc-edge')].map(p=>p.getAttribute('class'))`);

  const acts = () => ev(`window.__posted.filter(m=>m.type==='action'&&/^team(Edge|Layout)/.test(m.action)).map(m=>[m.action,m.input])`);
  const tf = () => ev(`document.getElementById('tc-world').getAttribute('transform')`);
  const key = async (k, code, vk, mods = 0) => { await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); await sleep(400); };
  const canvasBox = await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}})()`);
  const empty = await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();return {x:Math.min(r.right,innerWidth)-160,y:r.top+150,box:[r.left,r.top,r.width,r.height,innerWidth,innerHeight]}})()`); console.log('canvas', JSON.stringify(empty));
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node').length`)) === 3, "3 nodes");
  // ComfyUI node: title bar + slots on the sides
  ok(await ev(`!!document.querySelector('[data-id="a"] .tc-node-head')&&document.querySelectorAll('[data-id="a"] .tc-widget').length===2`), "title bar + 2 widget rows");
  const pIn = await center('[data-id="a"] .tc-port-in .tc-port-dot'), pOut = await center('[data-id="a"] .tc-port-out .tc-port-dot'), box = await ev(`(()=>{const r=document.querySelector('[data-id="a"] .tc-node-box').getBoundingClientRect();return {l:r.left,r:r.right}})()`);
  ok(Math.abs(pIn.x - box.l) < 3 && Math.abs(pOut.x - box.r) < 3, "input slot left, output slot right");
  ok(await ev(`!document.getElementById('tc-minimap').hidden&&document.querySelectorAll('#tc-mini-nodes rect').length===3`), "minimap shows 3 nodes");
  // 1. wheel zooms at cursor
  const t0 = await tf();
  await cdp("Input.dispatchMouseEvent", { type: "mouseWheel", x: empty.x, y: empty.y, deltaX: 0, deltaY: -240 }); await sleep(200);
  const t1 = await tf(); ok(t1 !== t0 && /scale\((1\.[1-9]|[2-3])/.test(t1), "wheel zooms in " + t1);
  // 2. left-drag empty canvas pans (no marquee, no selection)
  Object.assign(empty, await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();for(let y=r.top+120;y<r.bottom-140;y+=30)for(let x=Math.min(r.right,innerWidth)-60;x>r.left+150;x-=30){const e=document.elementFromPoint(x,y);if(e&&e.id==='tc-bg')return {x,y};}return null})()`));
  await mouse("mouseMoved", empty, 0); await mouse("mousePressed", empty); for (let i = 1; i <= 6; i++) await mouse("mouseMoved", { x: empty.x - 20 * i, y: empty.y + 10 * i });
  ok(!(await ev(`!!document.querySelector('.tc-marquee')`)), "no marquee on plain drag"); await mouse("mouseReleased", { x: empty.x - 120, y: empty.y + 60 }, 0); await sleep(200);
  const t2 = await tf(); ok(t2 !== t1 && t2.split('scale')[1] === t1.split('scale')[1], "left drag pans " + t1 + " -> " + t2 + "");
  await key(".", "Period", 190); // fit view
  // 3. ctrl+drag marquee selects nodes
  const A = await center('[data-id="a"] .tc-node-box'), B = await center('[data-id="b"] .tc-node-box');
  const s0 = { x: Math.min(A.x, B.x) - 150, y: A.y - 90 }, s1 = { x: Math.max(A.x, B.x) + 150, y: A.y + 90 };
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: s0.x, y: s0.y, modifiers: 2 }); await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: s0.x, y: s0.y, button: "left", buttons: 1, clickCount: 1, modifiers: 2 });
  for (let i = 1; i <= 6; i++) await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: s0.x + (s1.x - s0.x) * i / 6, y: s0.y + (s1.y - s0.y) * i / 6, button: "left", buttons: 1, modifiers: 2 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: s1.x, y: s1.y, button: "left", buttons: 0, clickCount: 1, modifiers: 2 }); await sleep(300);
  ok((await ev(`[...document.querySelectorAll('#tc-nodes .tc-node.selected')].map(g=>g.dataset.id).sort().join()`)) === "a,b", "ctrl+drag marquee selects a,b");
  // 4. double click empty -> ComfyUI-style search (members + nodes); type, Enter -> D placed there
  const e2 = await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();return {x:r.right-100,y:r.bottom-60}})()`);
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: e2.x, y: e2.y, button: "left", buttons: 1, clickCount: 1 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: e2.x, y: e2.y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: e2.x, y: e2.y, button: "left", buttons: 1, clickCount: 2 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: e2.x, y: e2.y, button: "left", clickCount: 2 }); await sleep(300);
  ok(await ev(`!!document.querySelector('.tc-nsearch')&&document.activeElement===document.querySelector('.tc-nsearch input')`), "double click opens focused search");
  // collab-employee: 同一成员可以再放一个节点，搜索列出全部成员，还没上画布的 2 位排在前面
  ok(await ev(`(()=>{const it=[...document.querySelectorAll('.tc-nsearch-item[data-kind=member]')].map(e=>/已在画布/.test(e.textContent));return it.length===S.staff.employees.length&&!it[0]&&!it[1]&&it.slice(2).every(Boolean)})()`), "search lists every member, the 2 off-canvas members first");
  await cdp("Input.insertText", { text: "测试" }); await sleep(200);
  ok((await ev(`document.querySelectorAll('.tc-search-item:not(.tc-search-new)').length`)) === 1, "search filters");
  let n0 = (await acts()).length;
  await key("Enter", "Enter", 13);
  let a = (await acts()).slice(n0); ok(a.length === 1 && a[0][0] === "teamLayout" && a[0][1].nodes.d, "Enter adds D to canvas " + JSON.stringify(a));
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node').length`)) === 4 && !(await ev(`!!document.querySelector('.tc-search')`)), "4 nodes, popup closed");
  // 5. drag from A's output slot and release on empty -> search -> pick E -> placed + A manages E (one undo step)
  const e3 = await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();return {x:r.left+r.width*0.55,y:r.bottom-50}})()`);
  n0 = (await acts()).length;
  await dragTo('[data-id="a"] .tc-port-out', e3); await sleep(200);
  ok(await ev(`!!document.querySelector('.tc-search')`), "link release on empty opens search");
  await ev(`(()=>{document.querySelector('.tc-search-item:not(.tc-search-new)').click();return 1})()`); await sleep(700);
  a = (await acts()).slice(n0); ok(a.length === 2 && a[0][0] === "teamLayout" && a[0][1].nodes.e && a[1][0] === "teamEdges" && a[1][1].from === "a" && a[1][1].to[0] === "e", "placed E and connected A→E " + JSON.stringify(a));
  ok((await ev(`document.querySelectorAll('#tc-edges .tc-edge').length`)) === 1 && (await ev(`document.querySelectorAll('#tc-edges .tc-edge-dot').length`)) === 1, "edge with midpoint dot");
  const shot = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(root, "tasks/comfy-canvas-20261119-2015/step02.png"), Buffer.from(shot.result.data, "base64"));
  // 6. Ctrl+Z undoes "add + connect" in one step; Ctrl+Y redoes
  n0 = (await acts()).length;
  await ev(`document.activeElement&&document.activeElement.blur&&document.activeElement.blur()`);
  await key("z", "KeyZ", 90, 2); await sleep(500);
  a = (await acts()).slice(n0); ok(a.some(x => x[0] === "teamEdge" && x[1].to === "e" && x[1].type === "none") && a.some(x => x[0] === "teamLayout" && x[1].nodes.e === null), "Ctrl+Z removes edge and node " + JSON.stringify(a));
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node').length`)) === 4, "back to 4 nodes after undo");
  n0 = (await acts()).length; await key("y", "KeyY", 89, 2); await sleep(500);
  a = (await acts()).slice(n0); ok(a.some(x => x[0] === "teamEdges" && x[1].to[0] === "e"), "Ctrl+Y redoes " + JSON.stringify(a));
  // 7. right click node -> node menu; right click empty -> canvas menu
  const C = await center('[data-id="c"] .tc-node-name');
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: C.x, y: C.y, button: "right", buttons: 2, clickCount: 1 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: C.x, y: C.y, button: "right", clickCount: 1 }); await sleep(300);
  ok((await ev(`[...document.querySelectorAll('.tc-cmenu .tc-cmenu-label')].map(x=>x.textContent).join('|')`)).includes("移出画布"), "node context menu");
  await key("Escape", "Escape", 27);
  ok(!(await ev(`!!document.querySelector('.tc-cmenu')`)), "Esc closes menu");
  const e4 = await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();return {x:r.right-60,y:r.top+80}})()`);
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: e4.x, y: e4.y, button: "right", buttons: 2, clickCount: 1 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: e4.x, y: e4.y, button: "right", clickCount: 1 }); await sleep(300);
  ok((await ev(`[...document.querySelectorAll('.tc-cmenu .tc-cmenu-label')].map(x=>x.textContent).join('|')`)).includes("添加成员"), "canvas context menu");
  { const sh = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(root, "tasks/comfy-canvas-20261119-2015/step02-menu.png"), Buffer.from(sh.result.data, "base64")); }
  await key("Escape", "Escape", 27);
  // 8. step01 wiring still works: A right(peer) -> B
  n0 = (await acts()).length;
  await dragTo('[data-id="a"] .tc-port-right', await center('[data-id="b"] .tc-node-box'));
  a = (await acts()).slice(n0); ok(a.length === 1 && a[0][1].type === "peer" && a[0][1].to[0] === "b", "peer wire still works " + JSON.stringify(a));
  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);

