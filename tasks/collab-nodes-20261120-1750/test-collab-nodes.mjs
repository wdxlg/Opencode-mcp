// Headless test for collab-nodes (团队协作：画布节点全部平级、互相独立；成员只是节点的模板；同一成员的节点之间可以连线；Ctrl+D 复制选中节点).
// node tasks/collab-nodes-20261120-1750/test-collab-nodes.mjs   (backend part runs without a browser; page part needs Microsoft Edge)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import crypto from "node:crypto"; import { spawn } from "node:child_process"; import { pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/collab-nodes-20261120-1750");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m); } };
const J = x => JSON.stringify(x);

// ---- A. backend: the real helper block + the real teamLayout / teamEdge / teamEdges cases from automation-workbench.mjs
{
  const a = fs.readFileSync(path.join(root, "recovered/shared/automation-workbench.mjs"), "utf8"), b = fs.readFileSync(path.join(root, "recovered/esm/000-extension.js/automation-workbench.mjs"), "utf8");
  ok(a === b, "shared and esm automation-workbench.mjs are identical");
  const ports = await import(pathToFileURL(path.join(root, "recovered/shared/collab-ports.mjs")).href);
  const slice = (from, to) => { const i = a.indexOf(from), j = a.indexOf(to, i + 1); if (i < 0 || j < 0) throw Error("slice " + from); return a.slice(i, j); };
  const line = from => { const i = a.indexOf(from); return a.slice(i, a.indexOf("\n", i)); };
  const helpers = slice("const teamCopyKey=", "  function teamSave(");
  const cases = slice("      case 'teamEdge':{", "      case 'teamPresetSave':") + line("      case 'teamLayout':{") + "\n";
  const src = `${line("  function presetApplyTo(")}\n${helpers}\n${line("  function teamRelations(")}\n${line("  function teamNodeRelations(")}\n${line("  function teamChair(")}
    let store={};const teamFile=()=> 'x';const teamSave=(id,v)=>{store[id]=JSON.parse(JSON.stringify(v));};const postAll=()=>{};let MEMBERS=[];const teamMembers=()=>MEMBERS;
    async function act(action,input,id='w'){switch(action){\n${cases}\n default: throw Error('unknown '+action);}}
    return {act,teamLoad,teamRelations,teamNodeRelations,teamChair,presetApplyTo,teamNodesMigrate,teamOnCanvas,teamMemberNodes,set:(id,v)=>{store[id]=v;},get:id=>store[id],members:l=>{MEMBERS=l;}};`;
  const fsStub = { readFileSync: (f) => JSON.stringify(H.get("w") || {}) };
  const H = new Function("fs", "crypto", "loadPortsState", src)(fsStub, crypto, ports.loadPortsState);
  H.members([{ id: "a", name: "经理A" }, { id: "b", name: "成员B" }]);

  // 1. migration of old data: nodes[memberId] + copies['member~x'] + edges by member id (+fromNode on copies)
  H.set("w", { nodes: { a: { x: 10, y: 10 }, b: { x: 300, y: 10 } }, copies: { "a~c1": { x: 10, y: 200 } }, edges: [{ from: "a", to: "b", type: "manage" }, { from: "b", to: "a", type: "peer", toNode: "a~c1" }], feeds: [], settings: { a: { allowSubagents: true } }, groups: [], collapsed: ["a~c1"] });
  let v = H.teamLoad("w");
  ok(J(v.nodes) === J({ a: { x: 10, y: 10, memberId: "a" }, b: { x: 300, y: 10, memberId: "b" }, "a~c1": { x: 10, y: 200, memberId: "a" } }), "migration: every node (old main + old copy) becomes a normal node with its own id + memberId " + J(v.nodes));
  ok(!("copies" in v), "migration: no copies map any more");
  ok(J(v.edges) === J([{ from: "a", to: "b", type: "manage", fromNode: "a", toNode: "b" }, { from: "b", to: "a", type: "peer", toNode: "a~c1", fromNode: "b" }]), "migration: edges keep member ids and get fromNode/toNode (resolved to the node they were drawn on) " + J(v.edges));
  ok(J(v.collapsed) === '["a~c1"]' && v.settings.a.allowSubagents === true, "migration keeps collapsed / settings");

  // 2. same-member nodes can connect (both directions of the API: teamEdges / teamEdge)
  let r = await H.act("teamEdges", { from: "a", to: ["a~c1"], type: "manage" });
  ok(J(r.added) === '["a~c1"]' && !r.skipped.length, "teamEdges: a node can manage another node of the same member " + J(r));
  v = H.get("w");
  ok(v.edges.some(e => e.fromNode === "a" && e.toNode === "a~c1" && e.from === "a" && e.to === "a" && e.type === "manage"), "stored same-member edge has fromNode/toNode + member ids");
  ok(v.edges.length === 3, "other edges untouched by the same-member edge (dedupe is per node pair) " + v.edges.length);
  let err = ""; try { await H.act("teamEdge", { from: "a~c1", to: "a", type: "manage" }); } catch (e) { err = e.message; }
  ok(!err && H.get("w").edges.filter(e => e.from === "a" && e.to === "a").length === 1 && H.get("w").edges.some(e => e.fromNode === "a~c1" && e.toNode === "a"), "teamEdge on the same node pair replaces (flip) instead of duplicating " + err);
  err = ""; try { await H.act("teamEdge", { from: "a", to: "a", type: "peer" }); } catch (e) { err = e.message; }
  ok(/自己/.test(err), "a node cannot connect to itself: " + err);
  // cycles are checked per node: a~c1 → a exists; a → a~c1 would be a cycle
  r = await H.act("teamEdges", { from: "a", to: ["a~c1"], type: "manage" });
  ok(r.added.length === 1, "re-adding a→a~c1 replaces the a~c1→a edge on that pair (no cycle on one pair)");
  await H.act("teamLayout", { nodes: { "a~c2": { x: 50, y: 400 } } });
  await H.act("teamEdges", { from: "a~c1", to: ["a~c2"], type: "manage" });
  r = await H.act("teamEdges", { from: "a~c2", to: ["a"], type: "manage" });
  ok(!r.added.length && /环/.test(r.skipped[0]?.reason || ""), "manage cycles are refused per node (a→a~c1→a~c2→a) " + J(r));
  r = await H.act("teamEdges", { from: "a~c2", to: ["b"], type: "peer" });
  ok(r.added.length === 1 && H.get("w").edges.some(e => e.fromNode === "a~c2" && e.toNode === "b" && e.type === "peer") && H.get("w").edges.some(e => e.fromNode === "b" && e.toNode === "a~c1" && e.type === "peer"), "two nodes of the same member each keep their own edge to b");
  // legacy callers that pass member ids still work (resolve to that member's first node)
  r = await H.act("teamEdges", { from: "b", to: ["a"], type: "peer" });
  ok(r.added.length === 1 && H.get("w").edges.some(e => e.fromNode === "b" && e.toNode === "a"), "member id input resolves to the member's first node");

  // 3. relations used by the runtime (member level; same-member edges never make a member its own boss / peer)
  v = H.teamLoad("w");
  const ra = H.teamRelations(v, "a"), rb = H.teamRelations(v, "b");
  ok(!ra.up.includes("a") && !ra.down.includes("a") && !ra.peers.includes("a"), "teamRelations(a) never lists a itself " + J(ra));
  ok(J(ra.peers) === '["b"]' && J(rb.peers) === '["a"]', "peer relation a⇄b is the union over a's nodes, deduped " + J([ra, rb]));
  const na = H.teamNodeRelations(v, "a~c1");
  ok(J(na.up) === '["a"]' && J(na.down) === '["a~c2"]', "node-level relations see same-member edges " + J(na));
  ok(H.teamChair(v, ["a", "b"]) === "a", "teamChair ignores self-management (a is still the top)");

  // 4. deleting a node is independent: no promotion, other nodes of the member keep their edges
  const before = H.get("w").edges.filter(e => e.fromNode !== "a" && e.toNode !== "a").length;
  await H.act("teamLayout", { nodes: { a: null } });
  v = H.get("w");
  ok(!v.nodes.a && v.nodes["a~c1"] && v.nodes["a~c1"].x === 10 && v.nodes["a~c1"].y === 200 && v.nodes["a~c2"], "deleting node a removes only that node (a~c1 not promoted / moved)");
  ok(v.edges.length === before && !v.edges.some(e => e.fromNode === "a" || e.toNode === "a"), "only edges on the deleted node are gone");
  ok(H.teamOnCanvas(v, "a") && J(H.teamMemberNodes(v, "a").sort()) === '["a~c1","a~c2"]', "member a is still on the canvas through its other nodes");
  ok(J(H.teamRelations(H.teamLoad("w"), "a").peers) === '["b"]', "relations still come from the remaining nodes");
  // re-adding the old key is a fresh independent node
  await H.act("teamLayout", { nodes: { a: { x: 1, y: 2 } } });
  ok(J(H.get("w").nodes.a) === J({ x: 1, y: 2, memberId: "a" }), "teamLayout creates nodes with memberId");
  await H.act("teamLayout", { nodes: { "a~c1": { x: 99, y: 98 } } });
  ok(J(H.get("w").nodes["a~c1"]) === J({ x: 99, y: 98, memberId: "a" }), "moving a node keeps its memberId");
  err = ""; try { await H.act("teamLayout", { nodes: { "zz~q1": { x: 1, y: 1 } } }); } catch (e) { err = e.message; }
  ok(/成员不存在/.test(err), "a node for an unknown member is refused");

  // 5. presets: old presets (main + copies) and new presets apply without losing nodes / edges
  const val = { nodes: {}, edges: [], settings: {} };
  const miss = H.presetApplyTo(val, { nodes: { a: { x: 1, y: 1 }, b: { x: 2, y: 2 }, c: { x: 3, y: 3 } }, copies: { "a~p1": { x: 4, y: 4 } }, edges: [{ from: "a", to: "b", type: "manage", fromNode: "a~p1" }, { from: "a", to: "c", type: "peer" }], settings: { a: { allowSubagents: true } } }, new Set(["a", "b"]));
  ok(miss === 1 && J(Object.keys(val.nodes).sort()) === '["a","a~p1","b"]' && val.nodes["a~p1"].memberId === "a", "old preset: copies become normal nodes, missing member counted " + J(val.nodes));
  ok(J(val.edges) === J([{ from: "a", to: "b", type: "manage", fromNode: "a~p1", toNode: "b" }]) && val.settings.a.allowSubagents === true, "old preset edges resolve to node ids " + J(val.edges));
  const val2 = { nodes: {}, edges: [], settings: {} };
  H.presetApplyTo(val2, { nodes: { a: { x: 1, y: 1, memberId: "a" }, "a~k": { x: 5, y: 5, memberId: "a" } }, edges: [{ from: "a", to: "a", type: "manage", fromNode: "a", toNode: "a~k" }] }, new Set(["a"]));
  ok(J(val2.edges) === J([{ from: "a", to: "a", type: "manage", fromNode: "a", toNode: "a~k" }]), "new preset keeps a same-member edge");
  ok(/delete p\.copies;Object\.assign\(p,\{name,nodes:JSON\.parse\(JSON\.stringify\(value\.nodes\)\),edges:value\.edges\.filter\(e=>value\.nodes\[e\.fromNode\]&&value\.nodes\[e\.toNode\]\)/.test(a), "preset save stores node ids (no copies map)");
  ok(!/同一位成员的两个节点之间不能连线/.test(a) && !/copies:value\.copies/.test(a), "old same-member refusal and copies state are gone");
  ok(/teamMemberNodes\(value,memberId\)\)teamDropNode\(value,k\)/.test(a), "deleting a member removes all of its nodes");
  ok((a.match(/teamOnCanvas\(snap,m\.id\)/g) || []).length === 3 && /teamOnCanvas\(t0,m\.id\)/.test(a) && /teamOnCanvas\(team,m\.id\)/.test(a), "runtime 'is on canvas' checks go through teamOnCanvas (works when the member's first node was deleted)");
}

// ---- B. page (headless Edge)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "collab-nodes-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-errorForeground:#f48771;--vscode-panel-border:#3c3c3c;--vscode-widget-border:#454545;font-family:Segoe UI,Microsoft YaHei,sans-serif;font-size:13px;color:#cccccc;background:#1e1e1e}</style>`;
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const INIT={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 routingCatalog:{models:[{vendor:'v1',id:'gpt-x',name:'GPT X',group:'OpenAI'}]},
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r',version:1,model:{vendor:'v1',id:'gpt-x'},allowedPaths:['.'],allowShell:false}]},
 team:{nodes:{a:{x:80,y:120,memberId:'a'},'a~k1':{x:80,y:420,memberId:'a'},b:{x:560,y:120,memberId:'b'}},edges:[{from:'a',to:'b',type:'manage',fromNode:'a~k1',toNode:'b'}],chat:[],settings:{},subagents:[],mode:'all',presets:[]},tasks:[]};
const S=window.S=JSON.parse(localStorage.getItem('__S')||'null')||INIT;
const save=()=>localStorage.setItem('__S',JSON.stringify(S));
window.__snap={now:Date.now(),ais:[],projects:[{id:'w1',name:'P',root:'D:/p'}],current:'w1',needs:[],links:[],activity:[],changes:[],browser:{tabs:[]},layout:{groups:{}}};
window.__push=function(value){const v=JSON.parse(JSON.stringify(value||S));setTimeout(()=>window.postMessage({type:'state',value:v},'*'),0);};
setInterval(()=>window.__push(),3000);
function reply(type,id,value){setTimeout(()=>window.postMessage({type,id,value},'*'),0);}
// same rules as the extension now: nodes {id:{x,y,memberId}}, edges by node (fromNode/toNode) + member ids, any two different nodes may connect
const mem=k=>S.team.nodes[k]?.memberId||String(k).split('~')[0],pair=(e,a,b)=>e.fromNode===a&&e.toNode===b||e.fromNode===b&&e.toNode===a;
window.acquireVsCodeApi=()=>({getState(){try{return JSON.parse(localStorage.getItem('__vs')||'null')}catch{return null}},setState(v){localStorage.setItem('__vs',JSON.stringify(v))},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){window.__push();return;}
 if(m.type==='canvas'){window.__snap.now=Date.now();reply('canvasResult',m.id,m.action==='snapshot'||m.action==='seen'?JSON.parse(JSON.stringify(window.__snap)):{});return;}
 if(m.type!=='action')return;
 const i=m.input||{},t=S.team;let r={};
 if(m.action==='teamEdges'){const added=[],skipped=[];for(const to of i.to){if(to===i.from||!t.nodes[to]){skipped.push({id:to,reason:'节点不能连到自己'});continue;}t.edges=t.edges.filter(e=>!pair(e,i.from,to));t.edges.push({from:mem(i.from),to:mem(to),type:i.type,fromNode:i.from,toNode:to});added.push(to);}r={added,skipped};}
 else if(m.action==='teamLayout'){for(const [k,v] of Object.entries(i.nodes||{})){if(v===null){delete t.nodes[k];t.edges=t.edges.filter(e=>e.fromNode!==k&&e.toNode!==k);}else t.nodes[k]={...(t.nodes[k]||{}),x:v.x,y:v.y,memberId:mem(k)};}}
 else if(m.action==='teamEdge'&&i.type==='none'){t.edges=t.edges.filter(e=>!pair(e,i.from,i.to));}
 save();reply('result',m.id,r);if(/^(team(Edges?|Layout))$/.test(m.action))window.__push();}});
</script>`;
html = html.replace(/<script src="collaboration.js"><\/script>/, stub + '<script src="collaboration.js"></script>');
fs.writeFileSync(path.join(dir, "index.html"), html);
fs.copyFileSync(path.join(root, "assets", WB, "automation.css"), path.join(dir, "automation.css"));
fs.copyFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), path.join(dir, "collaboration.js"));
{
  const css = fs.readFileSync(path.join(root, "assets", WB, "automation.css"), "utf8"), js = fs.readFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), "utf8");
  ok(!/\.tc-node\.copy/.test(css) && !/' copy'/.test(js), "no copy styling left (css + js)");
  ok(/oc-notrans/.test(js + css) || /oc-boot/.test(js + css) || /oc-notrans|oc-boot/.test(html), "anti-flash classes still referenced");
}
const edgeExe = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(f => fs.existsSync(f));
if (!edgeExe) { console.log("SKIP page part: Edge not found"); console.log(J({ ok: fail === 0, pass, fail })); process.exit(fail ? 1 : 0); }
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
  const mouse = (type, p, buttons = 1, clickCount = 1, button = "left", modifiers = 0) => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button, buttons, clickCount, modifiers });
  const center = sel => ev(`(()=>{const e=document.querySelector(${J(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  const click = async (p, modifiers = 0) => { await mouse("mouseMoved", p, 0, 1, "left", modifiers); await mouse("mousePressed", p, 1, 1, "left", modifiers); await mouse("mouseReleased", p, 0, 1, "left", modifiers); };
  const drag = async (a, b) => { await mouse("mouseMoved", a, 0); await mouse("mousePressed", a, 1, 1); for (let k = 1; k <= 8; k++) await mouse("mouseMoved", { x: a.x + (b.x - a.x) * k / 8, y: a.y + (b.y - a.y) * k / 8 }, 1); await mouse("mouseReleased", b, 0, 1); };
  const key = async (k, code, vk, mods = 0) => { await cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); };
  const posted = action => ev(`window.__posted.filter(m=>m.type==='action'&&m.action===${J(action)}).map(m=>m.input)`);
  const nodesOf = id => ev(`[...document.querySelectorAll('#tc-nodes .tc-node')].filter(g=>g.dataset.member===${J(id)}).map(g=>g.dataset.id)`);
  const allNodes = () => ev(`[...document.querySelectorAll('#tc-nodes .tc-node')].map(g=>g.dataset.id)`);
  const edgeCount = () => ev(`document.querySelectorAll('#tc-edges .tc-edge').length`);
  const selected = () => ev(`[...document.querySelectorAll('#tc-nodes .tc-node.selected')].map(g=>g.dataset.id).sort()`);
  const tr = id => ev(`(()=>{const m=document.querySelector('#tc-nodes [data-id="'+${J(id)}+'"]')?.getAttribute('transform').match(/translate\\(([\\d.-]+),([\\d.-]+)\\)/);return m?{x:+m[1],y:+m[2]}:null})()`);
  const titleOf = id => center(`#tc-nodes [data-id="${id}"] .tc-node-titlehit`);
  const load = async () => { await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1800); };
  const CTRL = 2;
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await load(); await ev(`localStorage.clear()`); await load(); await sleep(500);

  // 1. migrated data renders as equal, independent nodes
  ok(J((await nodesOf("a")).sort()) === '["a","a~k1"]' && (await nodesOf("b")).length === 1, "two 经理A nodes + one 成员B node");
  ok(await ev(`!document.querySelector('#tc-nodes .tc-node.copy')`), "no node is styled as a copy");
  ok(await edgeCount() === 1, "edge drawn from node a~k1 to b");

  // 2. wire a's 下级 port to the other 经理A node → allowed
  await drag(await center(`#tc-nodes [data-id="a"] .tc-port-out .tc-port-dot`), await titleOf("a~k1")); await sleep(800);
  const te = (await posted("teamEdges")).at(-1);
  ok(te && te.from === "a" && J(te.to) === '["a~k1"]', "same-member wire posts teamEdges a → a~k1 " + J(te));
  ok(await ev(`S.team.edges.some(e=>e.fromNode==='a'&&e.toNode==='a~k1'&&e.from==='a'&&e.to==='a')`) && await edgeCount() === 2, "same-member edge stored and drawn");
  ok(!(await ev(`document.querySelector('.tc-toast,.tc-notice')?.textContent||''`) || "").includes("不能连线"), "no 'cannot connect' notice");

  // 3. context menu has 复制节点 Ctrl+D
  const cm = await titleOf("a~k1");
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: cm.x, y: cm.y, button: "right", buttons: 2, clickCount: 1 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: cm.x, y: cm.y, button: "right", buttons: 0, clickCount: 1 }); await sleep(300);
  const menu = await ev(`[...document.querySelectorAll('.tc-cmenu .tc-cmenu-item')].map(b=>b.textContent)`);
  ok(menu && menu.some(t => /复制节点/.test(t) && /Ctrl\+D/.test(t)), "node menu has 复制节点 Ctrl+D " + J(menu));
  ok(menu && menu.some(t => /删除这个节点/.test(t)), "delete entry removes just this node");
  await ev(`document.querySelector('.tc-cmenu')?.remove(),1`); await sleep(150);

  // 4. Ctrl+D on one selected node: a new independent node, +24px, becomes the selection, outside edges not copied
  ok(J(await selected()) === '["a~k1"]', "right-click selected a~k1");
  const p0 = await tr("a~k1"), nLay0 = (await posted("teamLayout")).length;
  await key("d", "KeyD", 68, CTRL); await sleep(900);
  const lay1 = (await posted("teamLayout")).slice(nLay0), k2 = Object.keys(lay1[0]?.nodes || {})[0] || "";
  ok(lay1.length === 1 && /^a~[a-z0-9]+$/.test(k2) && k2 !== "a~k1", "Ctrl+D posts one teamLayout with a new node id of the same member " + J(lay1));
  ok(J(lay1[0]?.nodes?.[k2]) === J({ x: p0.x + 24, y: p0.y + 24 }), "new node is offset by 24px " + J([p0, lay1[0]?.nodes?.[k2]]));
  ok(J(await selected()) === J([k2]), "the duplicate becomes the selection");
  ok(await edgeCount() === 2 && !(await ev(`S.team.edges.some(e=>e.fromNode===${J(k2)}||e.toNode===${J(k2)})`)), "edges to nodes outside the selection are not duplicated");
  ok((await nodesOf("a")).length === 3, "three 经理A nodes now");

  // 5. multi-select a + a~k1 (edge between them) → Ctrl+D duplicates both and the edge between them
  await click(await titleOf("a")); await sleep(150); await click(await titleOf("a~k1"), CTRL); await sleep(250);
  ok(J(await selected()) === '["a","a~k1"]', "ctrl-click selects a and a~k1 " + J(await selected()));
  const nLay = (await posted("teamLayout")).length, nTe = (await posted("teamEdges")).length;
  await key("d", "KeyD", 68, CTRL); await sleep(1200);
  const lay2 = (await posted("teamLayout")).slice(nLay), newKeys = Object.keys(lay2[0]?.nodes || {});
  ok(lay2.length === 1 && newKeys.length === 2 && newKeys.every(k => /^a~/.test(k)), "Ctrl+D with two selected creates two new nodes " + J(lay2));
  const te2 = (await posted("teamEdges")).slice(nTe);
  ok(te2.length === 1 && newKeys.includes(te2[0].from) && newKeys.includes(te2[0].to[0]) && te2[0].type === "manage", "the internal edge is duplicated between the new nodes " + J(te2));
  ok(await edgeCount() === 3, "3 edges drawn (old 2 + duplicated internal one); a~k1→b not duplicated");
  ok(J(await selected()) === J(newKeys.slice().sort()), "the two duplicates are the new selection");
  ok((await nodesOf("a")).length === 5, "five 经理A nodes");
  await shot("ctrl-d.png");

  // 6. Ctrl+Z undoes the duplicate (nodes + the duplicated edge)
  await key("z", "KeyZ", 90, CTRL); await sleep(1000);
  const lay3 = (await posted("teamLayout")).at(-1);
  ok(J(Object.keys(lay3?.nodes || {}).sort()) === J(newKeys.slice().sort()) && Object.values(lay3.nodes).every(v => v === null), "Ctrl+Z deletes exactly the duplicated nodes " + J(lay3));
  ok((await nodesOf("a")).length === 3 && await edgeCount() === 2, "after undo: 3 经理A nodes, 2 edges");
  await key("y", "KeyY", 89, CTRL); await sleep(1200);
  ok((await nodesOf("a")).length === 5 && await edgeCount() === 3, "Ctrl+Y redoes the duplicate (nodes + internal edge)");
  await key("z", "KeyZ", 90, CTRL); await sleep(1000);
  ok((await nodesOf("a")).length === 3, "undo again");

  // 7. Ctrl+D while typing in an input does nothing on the canvas
  await click(await titleOf("a")); await sleep(150);
  const nL = (await posted("teamLayout")).length;
  await ev(`(()=>{const i=document.createElement('input');i.id='__t';document.getElementById('page-canvas').append(i);i.focus();return 1})()`);
  await key("d", "KeyD", 68, CTRL); await sleep(500);
  ok((await posted("teamLayout")).length === nL && (await nodesOf("a")).length === 3, "Ctrl+D in an input is ignored");
  await ev(`document.getElementById('__t').remove(),1`);
  // default prevented on the canvas
  const prevented = await ev(`(()=>{const e=new KeyboardEvent('keydown',{key:'d',code:'KeyD',ctrlKey:true,bubbles:true,cancelable:true});document.body.dispatchEvent(e);return e.defaultPrevented})()`);
  ok(prevented === true, "Ctrl+D default is prevented on the canvas");
  await sleep(1000);
  const metaN = (await nodesOf("a")).length;
  await click(await titleOf("b")); await sleep(150);
  await key("d", "KeyD", 68, 4); await sleep(900);
  ok((await nodesOf("b")).length === 2 && (await nodesOf("a")).length === metaN, "Cmd+D (meta) duplicates too");

  // 8. deleting one node never affects the other nodes of the member
  await click(await titleOf("a")); await sleep(150);
  await key("Delete", "Delete", 46); await sleep(800);
  const lay4 = (await posted("teamLayout")).at(-1);
  ok(J(lay4?.nodes) === '{"a":null}', "Delete removes only node a " + J(lay4));
  const k1Pos = await tr("a~k1");
  ok((await nodesOf("a")).length === metaN - 1 && k1Pos && k1Pos.x === p0.x && k1Pos.y === p0.y, "other 经理A nodes stay where they are (no promotion)");
  ok(await ev(`S.team.edges.some(e=>e.fromNode==='a~k1'&&e.toNode==='b')`) && await edgeCount() === 1, "a~k1→b edge stays; only edges on node a are gone");

  // 9. 3-second pushes do not reset or duplicate nodes
  const snapNodes = J((await allNodes()).sort());
  await sleep(3500);
  ok(J((await allNodes()).sort()) === snapNodes, "state push keeps the same nodes " + snapNodes);
  await load(); await sleep(600);
  ok(J((await allNodes()).sort()) === snapNodes, "after reload the same nodes come back");
  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + J(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(J({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
