// Headless e2e for comfy-canvas step01 (ComfyUI 式端口拖拽连线) on the 成员编排 canvas.
// node tasks/comfy-canvas-20261119-2015/test-comfy-wires.mjs   (needs Microsoft Edge; no OpenCode needed)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "comfy-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const stub = `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const S={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r'},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r'},{id:'c',name:'成员C',kind:'api',enabled:true,roleId:'r'}]},
 team:{nodes:{a:{x:60,y:110},b:{x:520,y:110},c:{x:60,y:360}},edges:[],chat:[],settings:{},subagents:[],mode:'all'},tasks:[]};
function push(){setTimeout(()=>window.postMessage({type:'state',value:JSON.parse(JSON.stringify(S))},'*'),0);}
function reply(id,result){setTimeout(()=>window.postMessage({type:'result',id,value:result},'*'),0);}
window.acquireVsCodeApi=()=>({getState(){return null},setState(){},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){push();return;}
 if(m.type!=='action'){return;}
 const i=m.input||{};let r={};
 if(m.action==='teamEdges'){const added=[];for(const to of i.to){if(to===i.from||S.team.edges.some(e=>e.from===i.from&&e.to===to))continue;S.team.edges.push({from:i.from,to,type:i.type});added.push(to);}r={added,skipped:[]};}
 else if(m.action==='teamEdge'&&i.type==='none'){S.team.edges=S.team.edges.filter(e=>!(e.from===i.from&&e.to===i.to));}
 reply(m.id,r);if(m.action==='teamEdges'||m.action==='teamEdge')push();}});
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

  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-node').length`)) === 3, "3 nodes drawn");
  ok((await ev(`document.querySelectorAll('#tc-nodes .tc-port:not(.tc-oport)').length`)) === 12, "4 ports per node");
  // 1. out port of A -> node C : A manages C ; screenshot mid-drag shows the live wire + target highlight
  const c = await center('[data-id="c"] .tc-node-box');
  await dragTo('[data-id="a"] .tc-port-out', c, async () => {
    ok(await ev(`!!document.querySelector('#tc-world .tc-wire')`), "live wire while dragging");
    ok(await ev(`document.querySelector('[data-id="c"]').classList.contains('wire-target')`), "drop target highlighted");
    const shot = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(root, "tasks/comfy-canvas-20261119-2015/wire-drag.png"), Buffer.from(shot.result.data, "base64"));
  });
  let acts = await actions();
  ok(acts.length === 1 && acts[0][0] === "teamEdges" && acts[0][1].from === "a" && acts[0][1].to[0] === "c" && acts[0][1].type === "manage", "A manages C " + JSON.stringify(acts));
  ok(!(await ev(`!!document.querySelector('#tc-world .tc-wire')`)), "wire removed after drop");
  ok((await edges()).length === 1, "edge drawn");
  // 2. pick up C's existing manager link from its in-port and drop on B -> A manages B, A>C removed
  const b = await center('[data-id="b"] .tc-node-box');
  await dragTo('[data-id="c"] .tc-port-in', b, async () => { ok((await edges()).some(x => x.includes("lifted")), "lifted edge dimmed while re-wiring"); });
  acts = (await actions()).slice(1);
  ok(acts.length === 2 && acts[0][0] === "teamEdges" && acts[0][1].from === "a" && acts[0][1].to[0] === "b" && acts[1][0] === "teamEdge" && acts[1][1].to === "c" && acts[1][1].type === "none", "re-wire A>C to A>B " + JSON.stringify(acts));
  // 3. pick up B's link and drop on empty canvas -> deleted
  await dragTo('[data-id="b"] .tc-port-in', { x: 900, y: 650 });
  acts = (await actions()).slice(3);
  ok(acts.length === 1 && acts[0][0] === "teamEdge" && acts[0][1].from === "a" && acts[0][1].to === "b" && acts[0][1].type === "none", "drop on empty deletes " + JSON.stringify(acts));
  ok((await edges()).length === 0, "no edges left");
  // 4. right (peer) port of A -> B
  await dragTo('[data-id="a"] .tc-port-right', b);
  acts = (await actions()).slice(4);
  ok(acts.length === 1 && acts[0][1].type === "peer" && acts[0][1].from === "a" && acts[0][1].to[0] === "b", "peer wire " + JSON.stringify(acts));
  // 5. in-port of C with no manager, dragged up to A -> A manages C
  const a2 = await center('[data-id="a"] .tc-node-box');
  await dragTo('[data-id="c"] .tc-port-in', a2);
  acts = (await actions()).slice(5);
  ok(acts.length === 1 && acts[0][1].from === "a" && acts[0][1].to[0] === "c" && acts[0][1].type === "manage", "drag up from in-port picks a manager " + JSON.stringify(acts));
  // 6. Esc cancels a wire mid-drag
  await dragTo('[data-id="b"] .tc-port-out', c, async () => { await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); });
  acts = (await actions()).slice(6);
  ok(acts.length === 0 && !(await ev(`!!document.querySelector('#tc-world .tc-wire')`)), "Esc cancels " + JSON.stringify(acts));
  // 7. plain node drag still moves the node (ports did not break dragging)
  const before = await ev(`document.querySelector('[data-id="b"]').getAttribute('transform')`);
  const bb = await center('[data-id="b"] .tc-node-name');
  await dragTo('[data-id="b"] .tc-node-name', { x: bb.x + 60, y: bb.y + 40 });
  ok((await ev(`document.querySelector('[data-id="b"]').getAttribute('transform')`)) !== before, "node drag still works");
  ok((await actions()).length === 6, "node drag made no edge change");
  // 8. click an edge, press Delete -> removed
  await ev(`(()=>{const h=document.querySelector('#tc-edges .tc-edge-hit');h.dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1})()`); await sleep(200);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Delete", code: "Delete", windowsVirtualKeyCode: 46 }); await sleep(400);
  acts = (await actions()).slice(6);
  ok(acts.length === 1 && acts[0][0] === "teamEdge" && acts[0][1].type === "none", "Delete removes selected edge " + JSON.stringify(acts));
  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);

