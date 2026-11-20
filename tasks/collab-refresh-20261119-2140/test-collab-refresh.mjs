// (single-canvas 2026-11-20: toolbar / mode-switch checks rewritten for the merged canvas)
// Headless e2e for collab-refresh (团队协作页：状态推送不整页重建、子代理不进列表、空画布没有填充文字、工具栏按钮都有说明).
// node tasks/collab-refresh-20261119-2140/test-collab-refresh.mjs   (needs Microsoft Edge; no OpenCode needed)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/collab-refresh-20261119-2140");
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "collab-refresh-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-list-activeSelectionBackground:#04395e;--vscode-list-hoverBackground:#2a2d2e;--vscode-terminal-ansiCyan:#11a8cd;--vscode-textLink-foreground:#3794ff;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-widget-border:#303031;--vscode-errorForeground:#f48771;--vscode-panel-border:#2b2b2b;--vscode-font-family:'Segoe UI',sans-serif;background:#1e1e1e;color:#ccc}</style>`;
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const chat=[];for(let i=0;i<30;i++){chat.push({id:'u'+i,time:new Date(Date.now()-3600e3+i*60e3).toISOString(),from:'user',text:'问题 '+i,channel:'group',to:[]});chat.push({id:'m'+i,time:new Date(Date.now()-3600e3+i*60e3+20e3).toISOString(),from:i%2?'a':'b',text:'回复 '+i+'：这是一条比较长的回复，用来把聊天记录撑出滚动条。',channel:'group',to:[]});}
window.S={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r'},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r'},
  {id:'tmp_x',agentId:'x',name:'外部 AI（临时）',kind:'mcp',temporary:true,enabled:true,roleId:'r'},{id:'sa1',name:'子代理甲',kind:'api',enabled:true,roleId:'r',parentId:'a'}]},
 team:{nodes:{a:{x:60,y:110},b:{x:520,y:110}},edges:[],chat,settings:{},subagents:[],mode:'all'},tasks:[]};
const now=Date.now();
window.__snap={now,ais:[],projects:[{id:'w1',name:'P',root:'D:/p'}],current:'global',needs:[],links:[],activity:[],changes:[],browser:{tabs:[]},layout:{groups:{}}};
window.__push=function(){setTimeout(()=>window.postMessage({type:'state',value:JSON.parse(JSON.stringify(window.S))},'*'),0);};
function reply(type,id,value){setTimeout(()=>window.postMessage({type,id,value},'*'),0);}
window.acquireVsCodeApi=()=>({getState(){return null},setState(){},postMessage(m){window.__posted.push(m);
 if(m.type==='ready'){window.__push();return;}
 if(m.type==='canvas'){window.__snap.now=Date.now();reply('canvasResult',m.id,m.action==='snapshot'||m.action==='seen'?JSON.parse(JSON.stringify(window.__snap)):{});return;}
 if(m.type==='action'){reply('result',m.id,{});}}});
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
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m); } };
try {
  let target; for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let seq = 0; const waits = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } };
  const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async expr => { const r = await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) throw Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };
  const shot = async name => { const s = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(here, name), Buffer.from(s.result.data, "base64")); };
  const mouse = (type, p, buttons = 1) => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", buttons, clickCount: 1 });
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(1800);

  // ---- 1. empty AI canvas: no filler text, no empty "没在项目里" group, no 0-count chips
  ok(await ev(`!document.getElementById('page-canvas').hidden`), "canvas page is open");
  const stageText = await ev(`document.querySelector('.cv-center').innerText`);
  ok(!/画布上还没有|Bridge MCP|chat_join|所有 AI 都在项目里|没在项目里/.test(stageText), "empty canvas has no filler text: " + JSON.stringify(stageText.slice(0, 120)));
  ok(await ev(`document.querySelectorAll('#cv-items .cv-group').length===0`), "no empty group card on the canvas");
  ok(await ev(`document.getElementById('cv-chips').hidden||!document.querySelector('#cv-chips .cv-chip')`), "no filter chips when there is no AI");
  ok(await ev(`!/没在项目里/.test(document.getElementById('cv-side-list').innerText)`), "side list has no empty 没在项目里 group");
  await shot("canvas-empty.png");

  // ---- 2. toolbar (single-canvas 2026-11-20: mode switch and 连线/网页预览 toggles gone; canvas-toolbar-edit 2026-11-20: grouped zoom/layout toolbar back at the bottom right, 预设 inside it)
  const tb = await ev(`[...document.querySelectorAll('#cv-toolbar button')].map(b=>({id:b.id,title:b.title}))`);
  ok(tb.map(b => b.id).join() === "cv-zoom-out,cv-zoom-pct,cv-zoom-in,cv-fit,cv-autolayout,cv-focus,tc-preset-btn" && tb.every(b => b.title.length >= 4), "toolbar: zoom/适应/自动排列/居中 + 预设, all with titles: " + JSON.stringify(tb.map(b => b.id)));
  ok(await ev(`!document.getElementById('cv-links-toggle')&&!document.getElementById('cv-previews-toggle')&&!document.getElementById('cv-mode-ai')&&!document.getElementById('cv-legacy-toggle')`), "no display toggles and no mode switch");
  ok(await ev(`['tc-clear','tc-rules','add-workspace','refresh'].every(id=>document.getElementById(id).title)`), "chat header / top buttons have titles");

  // ---- 3. AIs appear; subagents filtered
  await ev(`(()=>{const n=Date.now();Object.assign(window.__snap,{current:'w1',ais:[
   {key:'ai:x',name:'阿尔法',explicit:true,client:'Codex',kind:'mcp',project:'w1',status:'working',stuck:false,lastAt:n-5000,lastTool:'apply_patch',running:[],needs:0},
   {key:'ai:y',name:'贝塔',explicit:true,client:'Claude',kind:'mcp',project:null,status:'idle',stuck:false,lastAt:n-60000,lastTool:'read_files',running:[],needs:0},
   {key:'ai:sub1',name:'子会话一',explicit:false,client:'Codex',kind:'mcp',project:'w1',status:'working',parentId:'ai:x',lastAt:n,running:[],needs:0},
   {key:'ai:sub2',name:'子会话二',explicit:false,client:'Claude',kind:'mcp',project:null,status:'idle',subagent:true,lastAt:n,running:[],needs:0}],
   links:[{from:'ai:x',to:'ai:y',kind:'chat',label:'消息'}]});return 1})()`);
  await sleep(2700);
  const keys = await ev(`[...document.querySelectorAll('#cv-items .cv-card')].map(c=>c.dataset.ai).sort().join()`);
  ok(keys === "ai:x,ai:y", "canvas shows the 2 AIs, not the subagents: " + keys);
  ok(await ev(`!/子会话/.test(document.getElementById('cv-side-list').innerText)&&/阿尔法/.test(document.getElementById('cv-side-list').innerText)`), "side list filters subagents");
  const chips = await ev(`[...document.querySelectorAll('#cv-chips .cv-chip')].map(c=>c.textContent)`);
  ok(chips.length && !chips.some(t => / 0$/.test(t)) && chips.every((t, i) => true), "chips without zero counts: " + JSON.stringify(chips));
  ok(await ev(`[...document.querySelectorAll('#cv-chips .cv-chip')].every(c=>c.title)`), "chips have titles");
  await shot("canvas-ais.png");

  // ---- 4. a new snapshot with a changed session list keeps the same DOM and the pan/zoom
  await ev(`(()=>{window.__card=document.querySelector('[data-ai="ai:x"]');window.__grp=document.querySelector('#cv-items .cv-group[data-g="w1"]');return 1})()`);
  const free = await ev(`(()=>{const r=document.getElementById('tc-scroll').getBoundingClientRect();for(let y=r.bottom-140;y>r.top+60;y-=20)for(let x=r.left+240;x<r.right-40;x+=20){const e=document.elementFromPoint(x,y);if(e&&(e.id==='tc-canvas'||e.id==='tc-bg'))return {x,y};}return null})()`);
  await mouse("mouseMoved", free, 0); await mouse("mousePressed", free); for (let i = 1; i <= 6; i++) await mouse("mouseMoved", { x: free.x + 12 * i, y: free.y - 7 * i }); await mouse("mouseReleased", { x: free.x + 72, y: free.y - 42 }, 0); await sleep(200);
  await cdp("Input.dispatchMouseEvent", { type: "mouseWheel", x: free.x, y: free.y, deltaX: 0, deltaY: -120 }); await sleep(200);
  const T1 = await ev(`document.getElementById('cv-world').style.transform`);
  await ev(`(()=>{const n=Date.now();window.__snap.ais[0].lastAt=n-1000;window.__snap.ais[0].lastTool='run_command';window.__snap.ais.push({key:'ai:z',name:'伽马',explicit:true,client:'Codex',kind:'mcp',project:'w1',status:'idle',stuck:false,lastAt:n,running:[],needs:0},{key:'ai:sub3',name:'子会话三',kind:'mcp',project:'w1',status:'working',parentID:'ai:z',lastAt:n,running:[],needs:0});return 1})()`);
  await sleep(2700);
  ok(await ev(`!!document.querySelector('[data-ai="ai:z"]')&&!document.querySelector('[data-ai="ai:sub3"]')`), "new AI appears, its subagent does not");
  ok(await ev(`document.querySelector('[data-ai="ai:x"]')===window.__card&&window.__card.isConnected`), "existing AI card is the same element after the new snapshot");
  ok(await ev(`document.querySelector('#cv-items .cv-group[data-g="w1"]')===window.__grp`), "project group is the same element");
  const T2 = await ev(`document.getElementById('cv-world').style.transform`);
  ok(T1 === T2 && T1 !== "", "pan/zoom preserved " + T1 + " / " + T2);
  ok(await ev(`(()=>{const a=document.getElementById('cv-toolbar').getBoundingClientRect(),b=document.getElementById('tc-minimap').getBoundingClientRect();return document.getElementById('tc-minimap').hidden||a.left>=b.right||a.bottom<=b.top})()`), "toolbar does not overlap the minimap");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1000, deviceScaleFactor: 1, mobile: false }); await sleep(400);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: ".", code: "Period", windowsVirtualKeyCode: 190 }); await sleep(300);
  ok(await ev(`(()=>{const s=document.getElementById('tc-scroll').getBoundingClientRect();return [...document.querySelectorAll('#cv-items .cv-card')].every(n=>{const r=n.getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1})})()`), "'.' fits the AIs into the wide view");
  await shot("canvas-ais-wide.png");
  await cdp("Emulation.clearDeviceMetricsOverride"); await sleep(400);

  // ---- 5. chat: subagents/temporary connections not in the list; state push keeps DOM, scroll and draft
  await ev(`document.getElementById('tab-chat').click()`); await sleep(500);
  const convs = await ev(`[...document.querySelectorAll('#tc-conv-list .tc-conv .tc-conv-title')].map(x=>x.textContent)`);
  ok(convs.join() === "群聊,经理A,成员B", "conversation list without subagent / temporary entries: " + JSON.stringify(convs));
  await ev(`(()=>{const l=document.getElementById('tc-messages');l.scrollTop=Math.round((l.scrollHeight-l.clientHeight)/2);return 1})()`); await sleep(100);
  const top0 = await ev(`document.getElementById('tc-messages').scrollTop`);
  ok(top0 > 50, "chat log scrolls (" + top0 + ")");
  await ev(`document.getElementById('tc-input').focus()`); await cdp("Input.insertText", { text: "草稿：还没发出去" }); await sleep(100);
  await ev(`(()=>{window.__msg=document.querySelector('#tc-messages .tc-msg');window.__conv=document.querySelector('#tc-conv-list .tc-conv');window.__msgs=document.querySelectorAll('#tc-messages .tc-msg').length;return 1})()`);
  await ev(`(()=>{const e=window.S.staff.employees;e.push({id:'tmp_y',agentId:'y',name:'另一个外部 AI（临时）',kind:'mcp',temporary:true,enabled:true,roleId:'r'},{id:'sa2',name:'子代理乙',kind:'api',enabled:true,roleId:'r',subagent:true});window.S.tasks=[{id:'t9',title:'别的对话的任务卡',status:'running'}];window.S.team.subagents=[{id:'s1',parentId:'a',name:'帮手',status:'running',task:'x'}];window.S.nativeWorkers={n:Date.now()};window.__push();return 1})()`);
  await sleep(700);
  ok(await ev(`document.querySelector('#tc-messages .tc-msg')===window.__msg&&window.__msg.isConnected&&document.querySelectorAll('#tc-messages .tc-msg').length===window.__msgs`), "chat log DOM kept (same message elements)");
  const top1 = await ev(`document.getElementById('tc-messages').scrollTop`);
  ok(Math.abs(top1 - top0) <= 2, "chat scroll kept " + top0 + " -> " + top1);
  ok((await ev(`document.getElementById('tc-input').value`)) === "草稿：还没发出去", "draft text survives");
  ok(await ev(`document.activeElement===document.getElementById('tc-input')`), "input keeps focus");
  ok(await ev(`document.querySelector('#tc-conv-list .tc-conv')===window.__conv`), "conversation list DOM kept");
  ok(!(await ev(`/临时|子代理/.test(document.getElementById('tc-conv-list').innerText)`)), "new temporary / subagent members stay out of the list");
  // an identical state push is ignored entirely
  await ev(`(()=>{window.__push();return 1})()`); await sleep(400);
  ok(await ev(`document.querySelector('#tc-messages .tc-msg')===window.__msg`), "identical state push changes nothing");
  // a real new message still shows up
  await ev(`(()=>{window.S.team.chat.push({id:'new1',time:new Date().toISOString(),from:'a',text:'新消息到了',channel:'group',to:[]});window.__push();return 1})()`); await sleep(600);
  ok(/新消息到了/.test(await ev(`document.getElementById('tc-messages').innerText`)), "new chat message is rendered");
  ok((await ev(`document.getElementById('tc-input').value`)) === "草稿：还没发出去", "draft text survives a new message");

  // ---- 6. member nodes (same single canvas): state push with unrelated changes keeps node elements and view
  await ev(`document.getElementById('tab-canvas').click()`); await sleep(400);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')&&!!document.querySelector('#cv-items .cv-card')`), "member nodes and AI cards on the same canvas");
  const sc = await ev(`(()=>{const r=document.getElementById('tc-canvas').getBoundingClientRect();return {x:r.right-80,y:r.bottom-80}})()`);
  await cdp("Input.dispatchMouseEvent", { type: "mouseWheel", x: sc.x, y: sc.y, deltaX: 0, deltaY: -120 }); await sleep(200);
  await ev(`(()=>{window.__node=document.querySelector('#tc-nodes [data-id="a"]');window.__tf=document.getElementById('tc-world').getAttribute('transform');return 1})()`);
  await ev(`(()=>{window.S.staff.employees.push({id:'tmp_z',agentId:'z',name:'第三个（临时）',kind:'mcp',temporary:true,enabled:true,roleId:'r'});window.S.tasks.push({id:'t10',status:'queued'});window.__push();return 1})()`); await sleep(600);
  ok(await ev(`document.querySelector('#tc-nodes [data-id="a"]')===window.__node&&window.__node.isConnected`), "member canvas node is the same element");
  ok(await ev(`document.getElementById('tc-world').getAttribute('transform')===window.__tf`), "member canvas pan/zoom kept");
  await ev(`(()=>{window.S.team.edges.push({from:'a',to:'b',type:'manage'});window.__push();return 1})()`); await sleep(600);
  ok(await ev(`document.querySelectorAll('#tc-edges .tc-edge').length===1`), "real canvas change still redraws (edge added)");

  const errs = await ev(`window.__errs||[]`);
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  ws.close();
} catch (e) { fail++; console.log("ERROR", e.stack || e); }
finally { proc.kill(); }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
