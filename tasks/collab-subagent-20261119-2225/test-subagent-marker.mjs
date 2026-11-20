// Unit test for collab-subagent: subagent AIs carry parentId / subagent:true on the canvas snapshot; normal AIs do not.
// node tasks/collab-subagent-20261119-2225/test-subagent-marker.mjs   (no OpenCode, no browser needed)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const mod = await import(pathToFileURL(path.join(root, "recovered/shared/canvas-console.mjs")).href);
const { CanvasConsole, CANVAS_CHAT_TOOL_DEFINITIONS, subagentMark } = mod;

let pass = 0, fail = 0;
const ok = (cond, name, extra) => { if (cond) { pass++; console.log("PASS", name); } else { fail++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };

// The webview's own filter, read from the shipped collaboration.js (so the test follows whatever it checks).
const collabJs = fs.readFileSync(path.join(root, "recovered/standalone/resources/app/extensions/opencode/media/task-workbench/collaboration.js"), "utf8");
const filterSrc = collabJs.match(/const isSubAi = (\(a\) => [^\n]*?);\s*\n/);
ok(!!filterSrc, "collaboration.js isSubAi filter found");
const isSubAi = filterSrc ? (0, eval)(filterSrc[1]) : () => false;

const mk = () => {
  let t = 1_800_000_000_000;
  const c = new CanvasConsole({ now: () => t });
  const posted = [];
  c.configure({ backend: {
    projects: () => [{ id: "w1", name: "P", root: "D:/p" }],
    currentProjectId: () => "w1",
    read: () => [],
    post: (id, m) => { const msg = { id: "m" + posted.length, time: new Date(t).toISOString(), ...m }; posted.push(msg); return { ...msg, cursor: msg.time + "|" + msg.id, fromName: m.aiName || m.from }; }
  } });
  return { c, tick: (ms = 1000) => { t += ms; } };
};
const remote = { kind: "remote", id: "remote:claude code", label: "Claude Code" };
// Same order as the Bridge dispatcher: begin() records the call, the chat tool runs, end() closes it.
async function call(c, owner, tool, args, ref) {
  const id = c.begin(owner, remote, tool, args, ref);
  let res;
  if (tool.startsWith("chat_") || tool.startsWith("browser_")) res = await c.handleChatTool(tool, args, { owner, actor: remote, ref });
  else res = { content: [{ type: "text", text: "ok" }] };
  c.end(id, res);
  return res;
}
const aiByName = (v, name) => v.ais.find((a) => a.name === name);

// ---- schemas ----
const join = CANVAS_CHAT_TOOL_DEFINITIONS.find((d) => d.name === "chat_join");
ok(join.inputSchema.properties.parent_task_id?.type === "string" && join.inputSchema.properties.subagent?.type === "boolean", "chat_join schema declares parent_task_id + subagent");
ok(!join.inputSchema.required.includes("parent_task_id") && !join.inputSchema.required.includes("subagent") && join.inputSchema.required.join() === "name", "chat_join new fields are optional (required stays [name])");
const m140 = fs.readFileSync(path.join(root, "recovered/esm/000-extension.js/module-0140.mjs"), "utf8");
const setTodosBlock = m140.slice(m140.indexOf("var SET_TODOS_TOOL = {"), m140.indexOf("var UPDATE_PLAN_TOOL = {"));
ok(/\n\s+parent_task_id: \{ type: "string"/.test(setTodosBlock) && /\n\s+subagent: \{ type: "boolean"/.test(setTodosBlock), "set_todos schema declares parent_task_id + subagent");
ok(/required: \["todos"\]/.test(setTodosBlock), "set_todos required unchanged ([todos])");

// ---- subagentMark ----
ok(subagentMark({ name: "x" }) === null, "subagentMark: plain args -> null");
ok(subagentMark({ parent_task_id: "T1" })?.parentTaskId === "T1", "subagentMark: parent_task_id");
ok(subagentMark({ subagent: true }) !== null, "subagentMark: subagent=true");
ok(subagentMark({ parentId: "x" }) === null, "subagentMark: parentId in tool args is ignored (session records only)");
ok(subagentMark({ parentID: "ses_1" }, { session: true })?.parentSession === "ses_1", "subagentMark: session parentID");
ok(subagentMark({ subagent: false, parent_task_id: "" }) === null, "subagentMark: empty / false -> null");

// ---- chat_join with parent_task_id ----
{
  const { c, tick } = mk();
  await call(c, "mcp:parent", "chat_join", { name: "lead-ai", project: "w1" }, { task_id: "TASK-PARENT" });
  tick();
  await call(c, "mcp:parent", "set_todos", { task_id: "TASK-PARENT", todos: [] }, { task_id: "TASK-PARENT" });
  tick();
  await call(c, "mcp:child", "chat_join", { name: "helper-ai", project: "w1", parent_task_id: "TASK-PARENT" });
  tick();
  await call(c, "mcp:normal", "chat_join", { name: "normal-ai", project: "w1" });
  const v = c.view({});
  const lead = aiByName(v, "lead-ai"), helper = aiByName(v, "helper-ai"), normal = aiByName(v, "normal-ai");
  ok(helper?.subagent === true && helper.parentId === "ai:lead-ai", "chat_join parent_task_id -> AI entry parentId = parent AI key", helper);
  ok(helper?.parentTaskId === "TASK-PARENT", "chat_join parent_task_id kept on entry", helper);
  ok(lead && !("parentId" in lead) && !("subagent" in lead), "parent AI has no parentId/subagent", lead);
  ok(normal && !("parentId" in normal) && !("subagent" in normal), "normal chat_join AI has no parentId/subagent", normal);
  ok(isSubAi(helper) && !isSubAi(lead) && !isSubAi(normal), "webview isSubAi hides only the subagent");
  ok(JSON.stringify(c.subagentOfOwner("mcp:child")) === JSON.stringify({ parentId: "ai:lead-ai", subagent: true }), "subagentOfOwner(child connection) -> mark (feeds temp member list)", c.subagentOfOwner("mcp:child"));
  ok(c.subagentOfOwner("mcp:normal") === null && c.subagentOfOwner("mcp:parent") === null, "subagentOfOwner(normal / parent) -> null");
  // later unmarked calls keep the mark
  tick();
  await call(c, "mcp:child", "chat_send", { name: "helper-ai", text: "done" });
  ok(aiByName(c.view({}), "helper-ai")?.subagent === true, "mark survives later calls without it");
}

// ---- set_todos with parent_task_id (card-only identity) ----
{
  const { c, tick } = mk();
  await call(c, "bridge:11111111-1111-4111-8111-111111111111", "set_todos", { task_id: "PARENT-1", todos: [] }, { task_id: "PARENT-1" });
  tick();
  await call(c, "bridge:22222222-2222-4222-8222-222222222222", "set_todos", { task_id: "CHILD-1", parent_task_id: "PARENT-1", todos: [] }, { task_id: "CHILD-1" });
  tick();
  await call(c, "bridge:33333333-3333-4333-8333-333333333333", "set_todos", { task_id: "OTHER-1", todos: [] }, { task_id: "OTHER-1" });
  const v = c.view({});
  const child = v.ais.find((a) => a.key === "card:child-1"), parent = v.ais.find((a) => a.key === "card:parent-1"), other = v.ais.find((a) => a.key === "card:other-1");
  ok(child?.subagent === true && child.parentId === "card:parent-1", "set_todos parent_task_id -> AI entry parentId = parent card", child);
  ok(parent && !("parentId" in parent) && !("subagent" in parent), "set_todos parent card entry unmarked", parent);
  ok(other && !("parentId" in other) && !("subagent" in other), "normal set_todos entry unmarked", other);
  ok(isSubAi(child) && !isSubAi(parent) && !isSubAi(other), "webview hides only the set_todos subagent");
}

// ---- set_todos with subagent=true only; named later ----
{
  const { c, tick } = mk();
  await call(c, "mcp:s", "set_todos", { task_id: "C2", subagent: true, todos: [] }, { task_id: "C2" });
  tick();
  let a = c.view({}).ais.find((x) => x.key === "card:c2");
  ok(a?.subagent === true && typeof a.parentId === "string" && a.parentId.length > 0, "set_todos subagent=true -> marked (parentId placeholder)", a);
  await call(c, "mcp:s", "chat_join", { name: "kid", project: "w1" }, { task_id: "C2" });
  a = aiByName(c.view({}), "kid");
  ok(a?.subagent === true, "a marked card identity keeps the mark when it later names itself via chat_join", a);
}

// ---- shared fallback identity is never marked ----
{
  const { c } = mk();
  await call(c, "bridge:44444444-4444-4444-8444-444444444444", "set_todos", { new_task: true, parent_task_id: "P", todos: [] });
  const a = c.view({}).ais.find((x) => x.key.startsWith("client:"));
  ok(a && !("subagent" in a), "client:<label> fallback identity (no task_id) is not marked", a);
}

// ---- session records with parentID (members input) ----
{
  const { c } = mk();
  const v = c.view({ members: [
    { id: "m1", name: "成员A", project: "w1", status: "idle" },
    { id: "ses_child", name: "子会话", project: "w1", status: "working", parentID: "ses_root" },
    { id: "sub:abc", name: "成员A 的子代理 x", project: "w1", status: "idle", parentId: "member:m1", subagent: true },
    { id: "s2", name: "flag-only", project: "w1", status: "idle", isSubagent: true }
  ] });
  const m1 = v.ais.find((a) => a.key === "member:m1"), sc = v.ais.find((a) => a.key === "member:ses_child"), sb = v.ais.find((a) => a.key === "member:sub:abc"), s2 = v.ais.find((a) => a.key === "member:s2");
  ok(sc?.subagent === true && sc.parentId === "member:ses_root", "session parentID -> parentId", sc);
  ok(sb?.subagent === true && sb.parentId === "member:m1", "team #子代理 member (parentId member:x) -> parentId kept", sb);
  ok(s2?.subagent === true, "isSubagent session flag -> marked", s2);
  ok(m1 && !("parentId" in m1) && !("subagent" in m1), "normal member entry unmarked", m1);
  ok(v.ais.filter((a) => !isSubAi(a)).map((a) => a.key).join() === "member:m1", "webview keeps only the normal member");
}

// ---- persistence keeps the mark ----
{
  const os = await import("node:os");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "subagent-mark-"));
  const a = new CanvasConsole();
  a.configure({ storeDir: dir, backend: { projects: () => [{ id: "w1", name: "P", root: "D:/p" }], currentProjectId: () => "w1", read: () => [], post: () => ({}) } });
  await a.handleChatTool("chat_join", { name: "kid2", project: "w1", subagent: true }, { owner: "mcp:k", actor: remote });
  a.persist();
  const b = new CanvasConsole();
  b.configure({ storeDir: dir, backend: { projects: () => [{ id: "w1", name: "P", root: "D:/p" }], currentProjectId: () => "w1", read: () => [], post: () => ({}) } });
  const k = b.view({}).ais.find((x) => x.name === "kid2");
  ok(k?.subagent === true, "mark persists across restart (canvas-console.json)", k);
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---- workbench wiring (source checks; the workbench needs vscode to import) ----
{
  const wb = fs.readFileSync(path.join(root, "recovered/shared/automation-workbench.mjs"), "utf8");
  ok(/canvasConsole\.subagentOfOwner\(peer\.owner\)/.test(wb) && /temporary:true,enabled:true,roleId,model:null,\.\.\.\(sub\?\{parentId:sub\.parentId,subagent:true\}:\{\}\)/.test(wb), "tempMembers marks subagent connections");
  ok(/parentId:'member:'\+m\.id,subagent:true/.test(wb), "canvasMembers marks team #子代理 helpers");
  const esm = fs.readFileSync(path.join(root, "recovered/esm/000-extension.js/canvas-console.mjs"), "utf8");
  ok(esm === fs.readFileSync(path.join(root, "recovered/shared/canvas-console.mjs"), "utf8"), "esm canvas-console.mjs mirrors recovered/shared");
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
