// Headless e2e for collab-employee (团队协作：成员头像上传+裁剪；同一成员可在画布上放多个节点；浮动窗口转普通窗口不再问“是否关闭窗口”).
// node tasks/collab-employee-20261120-0210/test-collab-employee.mjs   (needs Microsoft Edge for the page part; the backend/aux-window parts run without it)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/collab-employee-20261120-0210");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m); } };

// ---- A. backend: extension-side copies / edges / avatars (both copies of automation-workbench.mjs)
{
  const a = fs.readFileSync(path.join(root, "recovered/shared/automation-workbench.mjs"), "utf8"), b = fs.readFileSync(path.join(root, "recovered/esm/000-extension.js/automation-workbench.mjs"), "utf8");
  ok(a === b, "shared and esm automation-workbench.mjs are identical");
  const start = a.indexOf("const teamCopyKey="), end = a.indexOf("function teamLoad(id)");
  // collab-nodes (2026-11-20): 没有主节点/副本之分了——节点全部平级（nodes[节点ID]={x,y,memberId}），删一个节点不会“升级”别的节点；连线 fromNode/toNode 必填
  const helpers = new Function(a.slice(start, end) + "\nreturn {teamCopyKey,teamBaseId,teamEndKey,teamDropNode,teamEdgeRecord,teamNodesMigrate};")();
  ok(helpers.teamCopyKey("employee_1~ab12cd") && !helpers.teamCopyKey("employee_1") && !helpers.teamCopyKey("a~b~c"), "new node ids are member~suffix");
  const v = { nodes: { a: { x: 1, y: 1, memberId: "a" }, b: { x: 2, y: 2, memberId: "b" }, "a~c1": { x: 5, y: 5, memberId: "a" }, "a~c2": { x: 6, y: 6, memberId: "a" } }, edges: [] };
  v.edges.push(helpers.teamEdgeRecord(v, "a~c1", "b", "manage"), helpers.teamEdgeRecord(v, "b", "a~c2", "peer"));
  ok(JSON.stringify(v.edges[0]) === '{"from":"a","to":"b","type":"manage","fromNode":"a~c1","toNode":"b"}', "edge keeps member ids + both node ids " + JSON.stringify(v.edges[0]));
  ok(v.edges[1].toNode === "a~c2" && v.edges[1].to === "a", "edge to another node of the same member keeps that node");
  helpers.teamDropNode(v, "a~c2");
  ok(!v.nodes["a~c2"] && v.nodes.a && v.edges.length === 1, "deleting a node keeps the other nodes and their edges");
  helpers.teamDropNode(v, "a");
  ok(!v.nodes.a && v.nodes["a~c1"].x === 5 && v.edges.length === 1 && v.edges[0].fromNode === "a~c1", "deleting node a does not promote/move another node (all nodes are equal) " + JSON.stringify(v));
  helpers.teamDropNode(v, "a~c1");
  ok(!Object.keys(v.nodes).some(k => k.startsWith("a")) && !v.edges.length, "deleting the last node removes its edges");
  const mig = helpers.teamNodesMigrate({ a: { x: 1, y: 1 } }, { "a~c1": { x: 5, y: 5 } }, [{ from: "a", to: "b", type: "manage", fromNode: "a~c1" }]);
  ok(mig.nodes["a~c1"].memberId === "a" && mig.edges[0].fromNode === "a~c1" && mig.edges[0].toNode === "b", "old copies migrate into normal nodes");
  ok(/case 'teamMemberAvatar':/.test(a) && /'teamMemberSettings','teamMemberAvatar'/.test(a) && /case 'teamMemberSettings':case 'teamMemberAvatar':/.test(a), "teamMemberAvatar action is registered and dispatched");
  ok(/nodes:value\.nodes,avatars:teamAvatars\(\)/.test(a) && !/copies:value\.copies/.test(a), "state carries nodes and avatars (no copies map)");
  ok(/teamDropNode\(value,k\)/.test(a) && /teamEdgeRecord\(value,fromKey,toKey,input\.type\)/.test(a) && /teamEdgeRecord\(value,fromKey,toKey,type\)/.test(a), "teamLayout / teamEdge / teamEdges use node keys");
}

// ---- B. floating (auxiliary) window: no close-window confirm when it closes itself or on the default setting
{
  const m94 = fs.readFileSync(path.join(root, "recovered/esm/027-workbench.desktop.main.js/module-1594.mjs"), "utf8"), m96 = fs.readFileSync(path.join(root, "recovered/esm/027-workbench.desktop.main.js/module-1596.mjs"), "utf8");
  const body = m94.slice(m94.indexOf("  handleBeforeUnload(e) {") + "  handleBeforeUnload(e) {".length, m94.indexOf("  handleVetoBeforeClose(e, reason) {"));
  const fn = new Function("ModifierKeyEmitter", "e", body.trim().replace(/\}\s*$/, ""));
  const run = (opts) => { const calls = []; const self = { closingFromWorkbench: !!opts.closing, _onBeforeUnload: { fire(x) { if (opts.veto) x.veto("dirty"); } }, configurationService: { getValue: () => opts.value ?? "always", inspect: () => ({ userValue: opts.user }) }, handleVetoBeforeClose: () => calls.push("veto"), confirmBeforeClose: () => calls.push("confirm") }; fn.call(self, { getInstance: () => ({ isModifierPressed: false }) }, {}); return calls.join(","); };
  ok(run({ closing: true, user: "always" }) === "", "closing by the workbench (editors moved back to the main window): no confirm");
  ok(run({ user: undefined }) === "", "default setting (desktop default 'always' is for the main window): floating window closes without confirm");
  ok(run({ user: "always" }) === "confirm", "user explicitly set window.confirmBeforeClose=always: still confirms when the user closes the floating window");
  ok(run({ veto: true, closing: true }) === "veto", "a real veto (unsaved editors) still blocks");
  ok(/closingFromWorkbench = true;\s*this\._onWillDispose\.fire\(\)/.test(m94), "dispose() marks the close as the workbench's own");
  ok(/onWillClose\)\(\(\) => \{[\s\S]{0,200}auxiliaryWindow\.closingFromWorkbench = true;\s*auxiliaryWindow\.window\.close\(\);/.test(m96), "auxiliary editor part marks its own close before window.close()");
}

// ---- C. page (headless Edge)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "collab-employee-"));
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
// same rules as the extension (automation-workbench.mjs, collab-nodes): nodes {id:{x,y,memberId}}, edges by node (fromNode/toNode) + member ids
const base=k=>S.team.nodes[k]?.memberId||String(k).split('~')[0],pair=(e,a,b)=>(e.fromNode||e.from)===a&&(e.toNode||e.to)===b||(e.fromNode||e.from)===b&&(e.toNode||e.to)===a;
function drop(k){const t=S.team;t.edges=t.edges.filter(e=>(e.fromNode||e.from)!==k&&(e.toNode||e.to)!==k);delete t.nodes[k];}
window.acquireVsCodeApi=()=>({getState(){try{return JSON.parse(localStorage.getItem('__vs')||'null')}catch{return null}},setState(v){localStorage.setItem('__vs',JSON.stringify(v))},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){window.__push();return;}
 if(m.type==='canvas'){window.__snap.now=Date.now();reply('canvasResult',m.id,m.action==='snapshot'||m.action==='seen'?JSON.parse(JSON.stringify(window.__snap)):{});return;}
 if(m.type!=='action')return;
 const i=m.input||{},t=S.team;let r={};
 if(m.action==='teamEdges'){const added=[],skipped=[];for(const to of i.to){if(to===i.from){skipped.push({id:to,reason:'节点不能连到自己'});continue;}t.edges=t.edges.filter(e=>!pair(e,i.from,to));t.edges.push({from:base(i.from),to:base(to),type:i.type,fromNode:i.from,toNode:to});added.push(to);}r={added,skipped};}
 else if(m.action==='teamLayout'){for(const [k,v] of Object.entries(i.nodes||{})){if(v===null)drop(k);else t.nodes[k]={...(t.nodes[k]||{}),x:v.x,y:v.y,memberId:base(k)};}}
 else if(m.action==='teamEdge'&&i.type==='none'){t.edges=t.edges.filter(e=>!pair(e,i.from,i.to));}
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

  // ---- 1. old one-node-per-member data still works
  ok(JSON.stringify(await nodesOf("a")) === '["a"]' && JSON.stringify(await nodesOf("b")) === '["b"]', "old layout: one node per member, keyed by member id");
  ok(await ev(`document.querySelectorAll('#tc-edges .tc-edge').length===1`), "old edge a→b is drawn");

  // ---- 2. double-click blank → search lists members already on the canvas → adds a second 经理A node
  await dblclick(await freePoint()); await sleep(400);
  const items = await ev(`[...document.querySelectorAll('.tc-nsearch-item[data-kind=member]')].map(e=>e.textContent)`); // collab-ports: 成员和节点同一个搜索列表
  ok(items && items.length === 2 && items.every(t => /已在画布，再放一个/.test(t)), "search lists members already on the canvas (再放一个) " + JSON.stringify(items));
  await ev(`[...document.querySelectorAll('.tc-nsearch-item[data-kind=member]')].find(e=>/经理A/.test(e.textContent)).click(),1`); await sleep(700);
  const la = (await posted("teamLayout")).at(-1), copyKey = Object.keys(la?.nodes || {})[0] || "";
  ok(/^a~[a-z0-9]+$/.test(copyKey), "adding an existing member creates a node instance key " + copyKey);
  ok(JSON.stringify((await nodesOf("a")).sort()) === JSON.stringify(["a", copyKey].sort()), "two 经理A nodes on the canvas");
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="${copyKey}"]')&&!document.querySelector('#tc-nodes .tc-node.copy')`), "the extra node is a normal node (collab-nodes: no copy styling)");

  // ---- 3. wire from the copy's 下级 port to 成员B: relation stays a→b, drawn from the copy
  await drag(await center(`#tc-nodes [data-id="${copyKey}"] .tc-port-out .tc-port-dot`), await center(`#tc-nodes [data-id="b"] .tc-node-box`)); await sleep(700);
  const te = (await posted("teamEdges")).at(-1);
  ok(te && te.from === copyKey && JSON.stringify(te.to) === '["b"]', "wire posts teamEdges from the node instance " + JSON.stringify(te));
  ok(await ev(`S.team.edges.length===2&&S.team.edges.some(e=>e.from==='a'&&e.to==='b'&&e.fromNode===${JSON.stringify(copyKey)}&&e.toNode==='b')`), "stored edge: member ids + fromNode/toNode; the old a→b edge on the other node stays (collab-nodes: nodes are independent)");
  const ed = await ev(`(()=>{const c=document.querySelector('#tc-nodes [data-id="${copyKey}"]').getAttribute('transform').match(/translate\\(([\\d.-]+),([\\d.-]+)\\)/);const all=[...document.querySelectorAll('#tc-edges .tc-edge')].map(p=>{const d=p.getAttribute('d').match(/^M([\\d.-]+),([\\d.-]+)/);return {dx:+d[1]-(+c[1]),dy:+d[2]-(+c[2])};});return all.find(x=>Math.abs(x.dx-224)<1)||all[0]})()`);
  ok(ed && Math.abs(ed.dx - 224) < 1, "edge starts at the copy's 下级 port " + JSON.stringify(ed));

  // ---- 4. editing through a copy updates every instance (saveEmployee with the member id)
  const t0 = await center(`#tc-nodes [data-id="${copyKey}"] .tc-node-titlehit`);
  await click(t0); await sleep(60); await click(t0); await sleep(300);
  ok(await ev(`!!document.querySelector('#tc-wlayer .tc-wedit-name input')`), "double-click the copy's title opens the name field");
  await ev(`(()=>{const i=document.querySelector('#tc-wlayer .tc-wedit-name input');i.select();return 1})()`);
  await cdp("Input.insertText", { text: "总经理" }); await key("Enter", "Enter", 13); await sleep(700);
  const se = (await posted("saveEmployee")).at(-1);
  ok(se && se.id === "a" && se.name === "总经理" && se.expected_version === 1, "rename on a copy saves the employee (id a, full fields) " + JSON.stringify(se && { id: se.id, name: se.name }));
  ok(await ev(`[...document.querySelectorAll('#tc-nodes .tc-node[data-member="a"] .tc-node-name')].every(t=>t.textContent==='总经理')`), "both 经理A nodes show the new name");

  // ---- 5. context menu: 再放一个 / 上传头像; Delete removes only the selected instance
  const cm = await center(`#tc-nodes [data-id="${copyKey}"] .tc-node-box`);
  await mouse("mouseMoved", cm, 0); await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: cm.x, y: cm.y + 30, button: "right", buttons: 2, clickCount: 1 }); await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: cm.x, y: cm.y + 30, button: "right", buttons: 0, clickCount: 1 }); await sleep(300);
  const menu = await ev(`[...document.querySelectorAll('.tc-cmenu .tc-cmenu-label')].map(e=>e.textContent)`);
  ok(menu && menu.includes("再放一个这个成员") && menu.includes("上传头像…") && menu.includes("删除这个节点"), "node menu has 再放一个 / 上传头像 / 删除这个节点 " + JSON.stringify(menu));
  await ev(`[...document.querySelectorAll('.tc-cmenu .tc-cmenu-item')].find(b=>/再放一个/.test(b.textContent)).click(),1`); await sleep(700);
  ok((await nodesOf("a")).length === 3, "再放一个 adds a third 总经理 node");
  await ev(`document.querySelector('.tc-cmenu')?.remove(),1`);
  ok(await ev(`document.querySelector('#tc-nodes [data-id="${copyKey}"]').classList.contains('selected')`), "right-click selects that node instance");
  await key("Delete", "Delete", 46); await sleep(700);
  const lay = (await posted("teamLayout")).at(-1);
  ok(lay && JSON.stringify(lay.nodes) === JSON.stringify({ [copyKey]: null }), "Delete removes only that node " + JSON.stringify(lay));
  ok((await nodesOf("a")).length === 2 && (await nodesOf("a")).includes("a"), "the other 总经理 nodes stay");
  ok(await ev(`S.team.edges.length===1&&!S.team.edges.some(e=>e.fromNode===${JSON.stringify(copyKey)})&&document.querySelectorAll('#tc-edges .tc-edge').length===1`), "the edge on the deleted node is gone; the other node's edge stays");
  await sleep(3300);
  ok((await nodesOf("a")).length === 2, "extra nodes survive a state push");

  // ---- 6. avatar: members page → pick image → crop dialog → saved, shown on node + list + editor
  await ev(`document.getElementById('tab-members').click(),1`); await sleep(400);
  await ev(`[...document.querySelectorAll('#tc-mlist .tc-mrow')].find(r=>/总经理/.test(r.textContent)).click(),1`); await sleep(300);
  ok(await ev(`!!document.getElementById('tc-avatar-preview')&&!document.getElementById('tc-avatar-pick').hidden&&document.getElementById('tc-avatar-clear').hidden`), "editor has an avatar field (上传图片…)");
  ok(await ev(`/画布上 2 个节点/.test([...document.querySelectorAll('#tc-mlist .tc-mrow')].find(r=>/总经理/.test(r.textContent)).textContent)`), "member list says the member has 2 nodes");
  const setFile = async (w, h) => ev(`(async()=>{const c=document.createElement('canvas');c.width=${w};c.height=${h};const x=c.getContext('2d');x.fillStyle='#e04040';x.fillRect(0,0,${w},${h});x.fillStyle='#40a0e0';x.fillRect(${w}/2,0,${w}/2,${h});const b=await new Promise(r=>c.toBlob(r,'image/png'));const f=new File([b],'me.png',{type:'image/png'});const dt=new DataTransfer();dt.items.add(f);const inp=document.getElementById('tc-avatar-file');inp.dataset.target=document.querySelector('#tc-form').hidden?'':'a';inp.files=dt.files;inp.dispatchEvent(new Event('change'));return 1})()`);
  await setFile(400, 200); await sleep(600);
  ok(await ev(`!!document.querySelector('#tc-crop .tc-crop-stage canvas')&&!!document.querySelector('#tc-crop .tc-crop-ring')&&!!document.querySelector('#tc-crop input[type=range]')`), "crop dialog opens with the image, a circle and a zoom slider");
  const c0 = await ev(`document.getElementById('tc-crop').dataset.crop`);
  const st = await center("#tc-crop .tc-crop-stage");
  await drag(st, { x: st.x + 60, y: st.y }); await sleep(150);
  const c1 = await ev(`document.getElementById('tc-crop').dataset.crop`);
  await cdp("Input.dispatchMouseEvent", { type: "mouseWheel", x: st.x, y: st.y, deltaX: 0, deltaY: -300 }); await sleep(150);
  const c2 = await ev(`document.getElementById('tc-crop').dataset.crop`);
  ok(c0 && c1 && c0 !== c1 && +c2.split(",")[2] < +c1.split(",")[2], "dragging moves and the wheel zooms the crop region " + [c0, c1, c2].join(" / "));
  await shot("crop.png");
  await key("Delete", "Delete", 46); await sleep(200);
  ok((await nodesOf("a")).length === 2 && !!(await ev(`document.getElementById('tc-crop')`)), "keys in the crop dialog don't reach the page");
  await ev(`[...document.querySelectorAll('#tc-crop button')].find(b=>b.textContent==='确定').click(),1`); await sleep(700);
  const av = (await posted("teamMemberAvatar")).at(-1);
  ok(av && av.memberId === "a" && /^data:image\/(webp|png);base64,/.test(av.avatar) && av.avatar.length < 60000, "确定 saves a small cropped avatar for the member " + (av ? av.avatar.length : 0));
  ok(await ev(`(()=>{const i=new Image();i.src=S.team.avatars.a;return new Promise(r=>{i.onload=()=>r(i.naturalWidth===128&&i.naturalHeight===128);i.onerror=()=>r(false)})})()`), "avatar is 128×128");
  ok(await ev(`[...document.querySelectorAll('#tc-mlist .tc-mrow')].find(r=>/总经理/.test(r.textContent)).querySelector('.tc-avatar-chip').classList.contains('has-img')&&document.getElementById('tc-avatar-preview').classList.contains('has-img')&&!document.getElementById('tc-avatar-clear').hidden`), "member list and editor show the avatar");
  await setFile(300, 300); await sleep(500);
  await key("Escape", "Escape", 27); await sleep(300);
  ok(!(await ev(`document.getElementById('tc-crop')`)) && (await posted("teamMemberAvatar")).length === 1, "Esc cancels the crop without saving");
  await ev(`document.getElementById('tab-canvas').click(),1`); await sleep(500);
  ok(await ev(`[...document.querySelectorAll('#tc-nodes .tc-node[data-member="a"]')].every(g=>!!g.querySelector('image.tc-node-avatar'))&&!document.querySelector('#tc-nodes [data-id="b"] image')`), "every 总经理 node shows the avatar; 成员B has none");
  await shot("canvas-copies-avatar.png");

  // ---- 7. new member: avatar picked before saving is stored after the member is saved (no id yet)
  await ev(`document.getElementById('tab-members').click(),1`); await sleep(300);
  await ev(`document.getElementById('tc-add').click(),1`); await sleep(300);
  ok(await ev(`document.getElementById('tc-avatar-preview').textContent.length>0&&!document.getElementById('tc-avatar-preview').classList.contains('has-img')`), "new member editor shows an initial before an avatar is picked");

  // ---- 8. reload: copies and avatars come back from the saved state
  await load(); await sleep(600); await ev(`document.getElementById('tab-canvas').click(),1`); await sleep(500);
  ok((await nodesOf("a")).length === 2 && await ev(`!!document.querySelector('#tc-nodes .tc-node[data-member="a"] image.tc-node-avatar')`), "after reload: two 总经理 nodes with the avatar");
  // members page 移出画布 removes every instance
  await ev(`document.getElementById('tab-members').click(),1`); await sleep(300);
  await ev(`[...[...document.querySelectorAll('#tc-mlist .tc-mrow')].find(r=>/总经理/.test(r.textContent)).querySelectorAll('button')].find(b=>b.textContent==='移出画布').click(),1`); await sleep(700);
  ok(await ev(`!S.team.nodes.a&&!Object.keys(S.team.nodes).some(k=>k.startsWith('a~'))`), "成员页「移出画布」removes all of the member's nodes " + JSON.stringify(await ev(`S.team.nodes`)));
  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
