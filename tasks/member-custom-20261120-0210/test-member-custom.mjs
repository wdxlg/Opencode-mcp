// Self-test for member-custom-20261120-0210 (成员自定义第一档：个人提示词 / 工具与权限 / 模型参数).
// Part A: node unit + wiring checks (no OpenCode). Part B: headless Edge UI of the canvas 「更多」 panel and 成员页 section.
// node tasks/member-custom-20261120-0210/test-member-custom.mjs
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawn } from "node:child_process"; import { pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const here = path.join(root, "tasks/member-custom-20261120-0210");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
let pass = 0, fail = 0; const ok = (c, m, extra) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m, extra === undefined ? "" : JSON.stringify(extra)); } };
const throws = (fn, code) => { try { fn(); return false; } catch (e) { return !code || String(e?.code || e?.message || e).includes(code); } };

// ================= Part A =================
const SH = "recovered/shared/", ESM = "recovered/esm/000-extension.js/";
for (const f of ["member-custom.mjs", "collaboration-workers.mjs", "collaboration-staff-contracts.mjs", "collaboration-staff-store.mjs", "automation-workbench.mjs"])
  ok(read(SH + f) === read(ESM + f), "shared and esm " + f + " are identical");
ok(read(ESM + "modules.json").includes('"modulePath": "maintained/shared/member-custom.mjs"'), "modules.json registers member-custom.mjs");
ok(/'member-custom\.mjs'/.test(read("scripts/sync-shared.cjs")), "sync-shared mirrors member-custom.mjs");

const M = await import(pathToFileURL(path.join(root, SH, "member-custom.mjs")).href);
// input validation: only present keys, bad values rejected
ok(JSON.stringify(M.memberCustomInput({ name: "x" })) === "{}", "no custom keys -> nothing stored (old behaviour)");
ok(JSON.stringify(M.memberCustomInput({ goal: "  交付 X  ", backstory: "" })) === '{"goal":"交付 X","backstory":null}', "goal trimmed, empty backstory -> null");
ok(throws(() => M.memberCustomInput({ tools: ["read", "rm-rf"] }), "MEMBER_TOOLS_INVALID"), "unknown tool category rejected");
ok(JSON.stringify(M.memberCustomInput({ tools: ["read", "mcp:github", "read"] }).tools) === '["read","mcp:github"]', "tools de-duplicated, mcp:<server> accepted");
ok(throws(() => M.memberCustomInput({ writeScope: ["C:/x"] }), "MEMBER_SCOPE_INVALID") && throws(() => M.memberCustomInput({ writeScope: "../up" }), "MEMBER_SCOPE_INVALID") && throws(() => M.memberCustomInput({ writeScope: ".git/hooks" }), "MEMBER_SCOPE_INVALID"), "absolute / .. / .git write scopes rejected");
ok(JSON.stringify(M.memberCustomInput({ writeScope: "./src/\nsrc\r\ndocs\\a" }).writeScope) === '["src","docs/a"]', "write scope normalised (./, trailing /, backslash, dups)");
ok(throws(() => M.memberCustomInput({ confirm: ["nuke"] }), "MEMBER_CONFIRM_INVALID"), "unknown confirm kind rejected");
ok(throws(() => M.memberCustomInput({ temperature: 2.5 }), "MEMBER_PARAM_INVALID") && throws(() => M.memberCustomInput({ maxOutputTokens: 1.5 }), "MEMBER_PARAM_INVALID") && throws(() => M.memberCustomInput({ reasoningEffort: "huge" }), "MEMBER_PARAM_INVALID"), "out-of-range model params rejected");
ok(JSON.stringify(M.memberCustomInput({ temperature: "", maxOutputTokens: "2048", reasoningEffort: "high" })) === '{"reasoningEffort":"high","temperature":null,"maxOutputTokens":2048}', "model params parsed; empty -> null");
ok(JSON.stringify(M.publicMemberCustom({ goal: "g" })) === JSON.stringify({ goal: "g", backstory: null, tools: null, writeScope: null, confirm: null, reasoningEffort: null, temperature: null, maxOutputTokens: null, fallbackModel: null }), "public view carries every key, unset = null");
const contracts = read(SH + "collaboration-staff-contracts.mjs");
ok(/allowShell: input\.allowShell === true, \.\.\.memberCustomInput\(input\)/.test(contracts) && /\.\.\.publicMemberCustom\(value\)/.test(contracts), "employeeInput / public employee carry the custom fields");

// prompt layer: stacked after the role instructions, never instead of them
ok(M.memberPromptLayer(null) === "" && M.memberPromptLayer({ name: "A" }) === "", "no personal settings -> no extra prompt");
const layer = M.memberPromptLayer({ name: "前端甲", goal: "交付登录页", backstory: "React + TS，禁止 any", tools: ["read", "write"], writeScope: ["src"], confirm: ["command"] });
ok(/个人设定（叠加在上面的岗位职责/.test(layer) && layer.includes("交付登录页") && layer.includes("禁止 any") && layer.includes("只允许写入：src") && layer.includes("运行命令"), "prompt layer has goal, backstory and the limits");
const aw = read(SH + "automation-workbench.mjs");
ok(/岗位职责：'\+member\.roleInstructions:''\}\$\{memberPromptLayer\(member\)\}/.test(aw), "team chat prompt: personal layer right after 岗位职责");
const wk = read(SH + "collaboration-workers.mjs");
ok(/\$\{scopedRules\}\$\{memberLayer\}/.test(wk), "native task prompt: personal layer after the scoped rules");

// tools
ok(M.memberAllowsTool({}, "read_files") && M.memberAllowsTool({}, "apply_patch") && !M.memberAllowsTool({}, "ext__github__search"), "no allow-list: unchanged (MCP still off in native runs)");
const ro = { tools: ["read"] };
ok(M.memberAllowsTool(ro, "read_files") && !M.memberAllowsTool(ro, "apply_patch") && !M.memberAllowsTool(ro, "run_command") && !M.memberAllowsTool(ro, "see_now") && M.memberAllowsTool(ro, "bridge_update_task") && M.memberAllowsTool(ro, "set_todos"), "read-only member: no write/command/browser; control tools stay");
ok(M.memberAllowsTool({ tools: ["mcp:github"] }, "ext__github__search") && !M.memberAllowsTool({ tools: ["mcp:github"] }, "ext__slack__post") && M.memberWantsMcp({ tools: ["mcp:github"] }, "ext__github__x"), "MCP ticked per server");
ok(/\(!tool\.name\.startsWith\('ext__'\) \|\| memberWantsMcp\(member, tool\.name\)\) && memberAllowsTool\(member, tool\.name\)/.test(wk), "native worker filters its tool list through the member allow-list");

// write scope
const P = (...l) => ({ patch: "*** Begin Patch\n" + l.join("\n") + "\n*** End Patch" });
const sc = { name: "甲", writeScope: ["src", "docs/*.md"] };
ok(M.memberWriteViolation(sc, "apply_patch", P("*** Update File: src/a/b.js"), "D:/p") === null && M.memberWriteViolation(sc, "apply_patch", P("*** Add File: docs/x.md"), "D:/p") === null, "writes inside the scope pass");
const v1 = M.memberWriteViolation(sc, "apply_patch", P("*** Update File: src/ok.js", "*** Add File: lib/bad.js", "*** Update File: src/m.js", "*** Move to: ../out.js"), "D:/p");
ok(v1 && v1.code === "MEMBER_WRITE_SCOPE" && v1.message.includes("lib/bad.js") && v1.message.includes("../out.js") && !v1.message.includes("src/ok.js"), "outside writes (and a move out) are named and refused", v1);
ok(M.memberWriteViolation(sc, "apply_patch", P("*** Add File: docs/a/b.md"), "D:/p") && M.memberWriteViolation({ writeScope: ["**/*.ts"] }, "apply_patch", P("*** Add File: x/y/z.ts"), "D:/p") === null, "globs: * stays in one folder, ** crosses folders");
ok(M.memberWriteViolation({}, "apply_patch", P("*** Add File: /etc/x"), "D:/p") === null && M.memberWriteViolation(sc, "run_command", { command: "echo > lib/x" }, "D:/p") === null, "no scope -> unchanged; run_command is not path-checked (known limit)");

// confirm kinds
const cf = { confirm: ["delete", "command", "write", "mcp"] };
ok(M.memberConfirmKind(cf, "apply_patch", P("*** Delete File: a.js")) === "delete" && M.memberConfirmKind(cf, "run_command", { command: "rm -rf build" }) === "delete" && M.memberConfirmKind(cf, "run_command", { command: "npm test" }) === "command" && M.memberConfirmKind(cf, "apply_patch", P("*** Update File: a.js")) === "write" && M.memberConfirmKind(cf, "ext__github__x", {}) === "mcp" && M.memberConfirmKind(cf, "read_files", {}) === null, "confirm kind per call");
ok(M.memberConfirmKind({ confirm: ["delete"] }, "run_command", { command: "npm test" }) === null && M.memberConfirmKind({}, "run_command", { command: "rm x" }) === null, "only the ticked kinds ask");

// memberGate, evaluated from source on a fake worker
const gateSrc = wk.match(/\n  (async memberGate\(member, name, args, root, owner(?:, workspaceId)?\) \{[\s\S]*?\n  \})\n  async confirmMemberAction/);
ok(!!gateSrc, "memberGate found in the worker");
if (gateSrc) {
  const memberGate = new Function("toolError", "memberWriteViolation", "memberConfirmKind", "MEMBER_CONFIRM_KINDS", "claimFiles", "return ({" + gateSrc[1] + "}).memberGate;")(M.toolError, M.memberWriteViolation, M.memberConfirmKind, M.MEMBER_CONFIRM_KINDS, () => null);
  const mk = (answer, approvedBefore = false) => { const w = { asked: 0, approved: [], service: { policy: { fingerprint: (o, n, a) => n + ":" + JSON.stringify(a), approved: () => approvedBefore }, approveToolGate: (o, f) => w.approved.push(f) }, confirmMemberAction: async () => { w.asked++; return answer; } }; w.memberGate = memberGate.bind(w); return w; };
  const mem = { name: "甲", writeScope: ["src"], confirm: ["command"] };
  let w = mk(true); let r = await w.memberGate(mem, "apply_patch", P("*** Add File: lib/x.js"), "D:/p", "o");
  ok(r && r.isError && r.memberGuard === "MEMBER_WRITE_SCOPE" && w.asked === 0, "gate: outside write -> tool error, nothing asked");
  w = mk(false); r = await w.memberGate(mem, "run_command", { command: "npm test" }, "D:/p", "o");
  ok(r && r.memberGuard === "MEMBER_CONFIRM_DENIED" && w.asked === 1 && !w.approved.length, "gate: user declines -> MEMBER_CONFIRM_DENIED, not approved");
  w = mk(true); r = await w.memberGate(mem, "run_command", { command: "npm test" }, "D:/p", "o");
  ok(r === null && w.asked === 1 && w.approved.length === 1, "gate: 允许一次 -> runs, approval recorded for this call");
  w = mk(true, true); r = await w.memberGate(mem, "run_command", { command: "npm test" }, "D:/p", "o");
  ok(r === null && w.asked === 0, "gate: an already-approved identical call is not asked again");
  w = mk(true); ok(await w.memberGate(null, "run_command", {}, "D:/p", "o") === null && await w.memberGate(mem, "read_files", {}, "D:/p", "o") === null && w.asked === 0, "gate: no member / read call -> untouched");
}
ok(/if \(!result\) result = await this\.memberGate\(member, call\.name, args, claimed\.attempt\.workspace\.root, owner(?:, task\.workspaceId)?\);/.test(wk) && /result\.isError && !result\.memberGuard &&/.test(wk), "gate runs before dispatch; a member rejection does not block the task");
ok(/showWarningMessage\([^)]*\{ modal: true \}, '允许一次'\)/.test(wk), "confirmation is a modal with 允许一次");

// model params + fallback
ok(JSON.stringify(M.memberRequestOptions({})) === "{}" && JSON.stringify(M.memberRequestOptions({ reasoningEffort: "high", temperature: 0, maxOutputTokens: 4096 })) === '{"configuration":{"reasoningEffort":"high","temperature":0,"maxOutputTokens":4096}}', "params ride on the request configuration (0 kept)");
const A = { vendor: "v", id: "a" }, B = { vendor: "v", id: "b" }, fbm = { fallbackModel: { vendor: "v", id: "b" } };
const resolve = async ref => ref.id === "b" ? B : null;
let used = []; let out = await M.withFallbackModel(A, fbm, async m => { used.push(m.id); if (m === A) throw Error("429 rate limit"); return "ok"; }, { resolve });
ok(out === "ok" && used.join() === "a,b", "primary fails before output -> one retry on the fallback");
const rej = async (fn, opts = { resolve }, mem = fbm) => { used = []; try { await M.withFallbackModel(A, mem, fn, opts); return false; } catch { return true; } };
ok(await rej(async (m, mark) => { used.push(m.id); mark(); throw Error("500"); }) && used.join() === "a", "failure after output -> no retry (no duplicate text)");
ok(await rej(async m => { used.push(m.id); throw Error("Canceled"); }) && used.join() === "a", "cancellation -> no retry");
ok(await rej(async m => { used.push(m.id); throw Error("500"); }, { resolve }, {}) && used.join() === "a", "no fallback model -> error as before");
ok(await rej(async m => { used.push(m.id); throw Error("500"); }, { resolve: async () => null }) && used.join() === "a", "fallback not installed -> original error");
ok(/await withFallbackModel\(model, member, async \(useModel, mark\) =>/.test(wk) && /\.\.\.memberRequestOptions\(member\) \}, cts\.token\)/.test(wk), "native worker sends member params and uses the fallback");
ok(/async function lmText\(model,prompt,cts,onPart,member\)\{return withFallbackModel\(model,member,/.test(aw) && /\{\.\.\.memberRequestOptions\(member\)\}/.test(aw) && /lmText\(model,prompt,cts,t=>ocStream\.part\(t\),member\)/.test(aw), "team chat replies send member params and use the fallback");
ok(/if\(!model&&member\.fallbackModel\)model=await teamModel\(member\.fallbackModel\)/.test(aw), "missing primary model -> fallback model");
ok(/service\.memberForTask=task=>/.test(aw) && /facade\.memberForTask = task =>/.test(read(SH + "collaboration-staff-store.mjs")), "task -> member lookup for team-chat tasks and staff jobs");

// ================= Part B: headless Edge =================
const WB = "resources/app/extensions/opencode/media/task-workbench/";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "member-custom-"));
let html = fs.readFileSync(path.join(root, "assets", WB, "collaboration.html"), "utf8").replace(/<meta[^>]+Content-Security-Policy[^>]*>/i, "").replace(/\snonce="[^"]*"/g, "");
const theme = `<style>:root,body{--vscode-foreground:#cccccc;--vscode-editor-background:#1e1e1e;--vscode-editorWidget-background:#252526;--vscode-editorWidget-border:#454545;--vscode-focusBorder:#007fd4;--vscode-input-background:#3c3c3c;--vscode-input-foreground:#cccccc;--vscode-descriptionForeground:#9d9d9d;--vscode-menu-background:#252526;--vscode-menu-foreground:#cccccc;--vscode-menu-selectionBackground:#04395e;--vscode-button-background:#0e639c;--vscode-button-foreground:#fff;--vscode-errorForeground:#f48771;--vscode-panel-border:#3c3c3c;--vscode-widget-border:#454545;font-family:Segoe UI,Microsoft YaHei,sans-serif;font-size:13px;color:#cccccc;background:#1e1e1e}</style>`;
const stub = theme + `<script>
window.__posted=[];window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)));
const MOD={vendor:'deepseek',id:'deepseek-chat'};
const S=window.S={collaborationEnabled:true,collaborationVersion:1,workspaceId:'w1',workspaces:[{id:'w1',name:'P',root:'D:/p'}],roles:[{id:'r',name:'工程师'}],
 memberCatalog:{tools:[{id:'read',label:'读取文件'},{id:'write',label:'写入文件'},{id:'command',label:'运行命令'},{id:'browser',label:'浏览器 / 屏幕查看'}],mcpServers:[{id:'github',state:'ready'}],confirm:[{id:'command',label:'运行命令'},{id:'delete',label:'删除文件'},{id:'write',label:'任何文件写入'},{id:'mcp',label:'调用 MCP 工具'}],efforts:['minimal','low','medium','high','xhigh','max','disabled']},
 staff:{employees:[{id:'a',name:'经理A',kind:'api',enabled:true,roleId:'r',model:MOD,allowedPaths:['.'],version:1},{id:'b',name:'成员B',kind:'api',enabled:true,roleId:'r',model:MOD,allowedPaths:['.'],version:1,goal:'交付接口文档',backstory:'Go 后端'}]},
 team:{nodes:{a:{x:60,y:60},b:{x:420,y:60}},edges:[],chat:[],settings:{},subagents:[],mode:'all',presets:[]},tasks:[]};
window.__snap={now:Date.now(),ais:[],projects:[{id:'w1',name:'P',root:'D:/p'}],current:'w1',needs:[],links:[],activity:[],changes:[],browser:{tabs:[]},layout:{groups:{}}};
window.__push=function(){const v=JSON.parse(JSON.stringify(S));setTimeout(()=>window.postMessage({type:'state',value:v},'*'),0);};
function reply(type,id,value){setTimeout(()=>window.postMessage({type,id,value},'*'),0);}
window.acquireVsCodeApi=()=>({getState(){return null},setState(){},postMessage(m){window.__posted.push(JSON.parse(JSON.stringify(m)));
 if(m.type==='ready'){window.__push();return;}
 if(m.type==='canvas'){window.__snap.now=Date.now();reply('canvasResult',m.id,m.action==='snapshot'||m.action==='seen'?JSON.parse(JSON.stringify(window.__snap)):{});return;}
 if(m.type!=='action')return;const i=m.input||{};
 if(m.action==='saveEmployee'){const e=S.staff.employees.find(x=>x.id===i.id);if(e){const{expected_version,...rest}=i;Object.assign(e,rest);e.version++;}reply('result',m.id,e||{});window.__push();return;}
 if(m.action==='teamLayout'){for(const [k,v] of Object.entries(i.nodes||{})){if(v)S.team.nodes[k]=v;else delete S.team.nodes[k];}}
 reply('result',m.id,{});window.__push();}});
</script>`;
html = html.replace(/<script src="collaboration.js"><\/script>/, stub + '<script src="collaboration.js"></script>');
fs.writeFileSync(path.join(dir, "index.html"), html);
fs.copyFileSync(path.join(root, "assets", WB, "automation.css"), path.join(dir, "automation.css"));
fs.copyFileSync(path.join(root, "recovered/standalone", WB, "collaboration.js"), path.join(dir, "collaboration.js"));
const edge = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(f => fs.existsSync(f));
if (!edge) { console.log("SKIP UI: Edge not found"); console.log(JSON.stringify({ ok: fail === 0, pass, fail })); process.exit(fail ? 1 : 0); }
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(edge, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(dir, "prof")}`, "--window-size=1600,900", "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  let target; for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let seq = 0; const waits = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } };
  const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async expr => { const r = await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) throw Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };
  const shot = async name => { const s = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(here, name), Buffer.from(s.result.data, "base64")); };
  const mouse = (type, p, buttons = 1, clickCount = 1) => cdp("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", buttons, clickCount });
  const click = async sel => { const p = await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`); if (!p) return false; await mouse("mouseMoved", p, 0); await mouse("mousePressed", p, 1); await mouse("mouseReleased", p, 0); await sleep(250); return true; };
  const key = async (k, code, vk, modifiers = 0) => { await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers }); await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers }); await sleep(150); };
  const saves = () => ev(`window.__posted.filter(m=>m.type==='action'&&m.action==='saveEmployee').map(m=>m.input)`);
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Page.navigate", { url: "file:///" + path.join(dir, "index.html").replace(/\\/g, "/") }); await sleep(2000);
  const PANEL = "body > .tc-morepanel";

  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"] .tc-wmore')&&!!document.querySelector('#tc-nodes [data-id="b"] .tc-wmore')`), "every member node has a 「更多」 button");
  ok(await ev(`document.querySelector('#tc-nodes [data-id="b"] .tc-wmore').classList.contains('set')&&!document.querySelector('#tc-nodes [data-id="a"] .tc-wmore').classList.contains('set')`), "「更多」 is marked on a customised member only");
  ok(await click('#tc-nodes [data-id="a"] .tc-wmore') && await ev(`!!document.querySelector(${JSON.stringify(PANEL)})`), "clicking 「更多」 opens the floating panel");
  ok(await ev(`document.querySelectorAll('${PANEL} .tc-cust-sec').length===3&&[...document.querySelectorAll('${PANEL} .tc-cust-sec > summary')].map(s=>s.textContent).join()==='个人设定,工具与权限,模型参数'`), "panel has 个人设定 / 工具与权限 / 模型参数");
  ok(await ev(`[...document.querySelectorAll('${PANEL} [data-k="tools"] input')].map(i=>i.value).join()==='read,write,command,browser,mcp:github'&&[...document.querySelectorAll('${PANEL} [data-k="tools"] input')].map(i=>i.checked).join()==='true,true,true,true,false'`), "tools: 4 categories on, MCP per server off by default");
  ok(await ev(`document.activeElement&&document.activeElement.dataset.k==='goal'`), "the goal field has focus");
  await cdp("Input.insertText", { text: "交付登录页" });
  await key("Delete", "Delete", 46); await key("a", "KeyA", 65, 2); await key("z", "KeyZ", 90, 2);
  ok(await ev(`!!document.querySelector('#tc-nodes [data-id="a"]')&&!!document.querySelector(${JSON.stringify(PANEL)})&&!window.__posted.some(m=>m.action==='teamLayout'&&m.input&&m.input.nodes&&'a' in m.input.nodes)`), "typing Delete / Ctrl+A / Ctrl+Z in the panel does not reach the canvas");
  await ev(`(()=>{const p=document.querySelector(${JSON.stringify(PANEL)});const set=(k,v)=>{const e=p.querySelector('[data-k="'+k+'"]');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};set('goal','交付登录页');set('temperature','3');})()`);
  await click(PANEL + " .tc-morepanel-foot .tc-primary");
  ok(await ev(`/温度/.test(document.querySelector('${PANEL} .tc-morepanel-err').textContent)`) && (await saves()).length === 0, "temperature 3 is refused in the panel, nothing saved");
  await ev(`(()=>{const p=document.querySelector(${JSON.stringify(PANEL)});const set=(k,v)=>{const e=p.querySelector('[data-k="'+k+'"]');e.value=v;};set('temperature','0.3');set('maxOutputTokens','4096');set('writeScope','src\\ndocs');set('reasoningEffort','high');
    p.querySelector('[data-k="tools"] input[value="command"]').checked=false;p.querySelector('[data-k="tools"] input[value="mcp:github"]').checked=true;p.querySelector('[data-k="confirm"] input[value="delete"]').checked=true;p.querySelector('[data-k="goal"]').focus();})()`);
  await shot("more-panel.png");
  await key("Enter", "Enter", 13, 2); await sleep(500);
  const s1 = (await saves()).at(-1) || {};
  ok(s1.id === "a" && s1.expected_version === 1 && s1.name === "经理A" && s1.roleId === "r", "Ctrl+Enter saves the whole member with expected_version", s1);
  ok(s1.goal === "交付登录页" && s1.temperature === 0.3 && s1.maxOutputTokens === 4096 && s1.reasoningEffort === "high" && JSON.stringify(s1.writeScope) === '["src","docs"]' && JSON.stringify(s1.tools) === '["read","write","browser","mcp:github"]' && JSON.stringify(s1.confirm) === '["delete"]' && s1.backstory === null, "saved fields are exactly what was set", s1);
  ok(await ev(`!document.querySelector(${JSON.stringify(PANEL)})`), "panel closes after saving");
  await sleep(400);
  ok(await ev(`document.querySelector('#tc-nodes [data-id="a"] .tc-wmore').classList.contains('set')`), "node a is now marked as customised");
  await click('#tc-nodes [data-id="a"] .tc-wmore');
  ok(await ev(`document.querySelector('${PANEL} [data-k="goal"]').value==='交付登录页'&&document.querySelector('${PANEL} [data-k="temperature"]').value==='0.3'`), "reopening shows the saved values");
  await key("Escape", "Escape", 27);
  ok(await ev(`!document.querySelector(${JSON.stringify(PANEL)})`) && (await saves()).length === 1, "Esc closes the panel without saving");

  // 成员页: the same section inside the member editor
  await ev(`document.querySelector('#tc-nodes [data-id="b"]').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))`); await sleep(500);
  ok(await ev(`!document.getElementById('page-members').hidden&&!!document.querySelector('#tc-custom .tc-cust')`), "member editor has the custom section");
  ok(await ev(`document.querySelector('#tc-custom [data-k="goal"]').value==='交付接口文档'&&document.querySelector('#tc-custom [data-sec="prompt"]').open&&!document.querySelector('#tc-custom [data-sec="tools"]').open`), "editor shows b's settings; only filled sections open");
  await ev(`(()=>{const b=document.querySelector('#tc-custom [data-k="backstory"]');b.value='Go 后端，禁止 panic';document.querySelector('#tc-custom [data-k="confirm"] input[value="command"]').checked=true;})()`);
  await shot("member-page.png");
  await ev(`document.getElementById('tc-form').requestSubmit()`); await sleep(600);
  const s2 = (await saves()).at(-1) || {};
  ok(s2.id === "b" && s2.backstory === "Go 后端，禁止 panic" && s2.goal === "交付接口文档" && JSON.stringify(s2.confirm) === '["command"]' && s2.tools === null, "成员页 save carries the custom fields (tools untouched -> null)", s2);
  ok(!(await ev(`window.__errs`)).length, "no page errors", await ev(`window.__errs`));
} catch (e) { fail++; console.log("FAIL exception", e?.message || e); }
finally { try { proc.kill(); } catch {} }
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
