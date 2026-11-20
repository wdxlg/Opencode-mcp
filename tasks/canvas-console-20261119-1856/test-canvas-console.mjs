// Headless self-test for recovered/shared/canvas-console.mjs (no OpenCode needed): node tasks/canvas-console-20261119-1856/test-canvas-console.mjs
import { CanvasConsole, describeCall, patchPaths, toolKind } from "../../recovered/shared/canvas-console.mjs";
import os from "node:os"; import fs from "node:fs"; import path from "node:path";
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL", m); } };
let t = 1_800_000_000_000; const now = () => t;
const chats = { p1: [], p2: [] }; let seq = 0;
const backend = {
  projects: () => [{ id: "p1", name: "博客", root: "D:\\AProgram\\博客" }, { id: "p2", name: "MCP", root: "E:/mcp" }],
  currentProjectId: () => "p1",
  post(id, m) { const msg = { id: "m" + (++seq), time: new Date(t).toISOString(), ...m }; msg.cursor = msg.time + "|" + msg.id; msg.fromName = m.aiName || m.from; chats[id].push(msg); c.notifyChat(id); return msg; },
  read(id) { return chats[id]; }
};
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cv-"));
const c = new CanvasConsole({ now }); c.configure({ storeDir: dir, backend });
const remote = { kind: "remote", label: "Claude" };
// 1. unnamed call with task_id -> fallback identity, project inferred from absolute path
let id = c.begin("bridge:11111111-1111-4111-8111-111111111111", remote, "read_files", { files: [{ path: "D:/AProgram/博客/a.md" }] }, { task_id: "abcd1234-0000" });
c.end(id, { content: [{ type: "text", text: "ok" }] });
let v = c.view({});
ok(v.ais.length === 1 && v.ais[0].name === "Claude·ABCD" && v.ais[0].project === "p1", "fallback identity + inferred project " + JSON.stringify(v.ais[0]));
// 2. chat_join with same task_id -> merges into explicit identity
let r = await c.handleChatTool("chat_join", { name: "maya001-opus5.5", project: "博客" }, { actor: remote });
id = c.begin("bridge:22222222-2222-4222-8222-222222222222", remote, "chat_join", { name: "maya001-opus5.5", project: "博客" }, { task_id: "abcd1234-0000" }); c.end(id, r);
v = c.view({});
ok(v.ais.length === 1 && v.ais[0].name === "maya001-opus5.5" && v.ais[0].calls === 2, "merge into explicit " + JSON.stringify(v.ais.map(a => [a.name, a.calls])));
ok(!r.isError && r.structuredContent.project.id === "p1", "join ok");
// 3. later unnamed call with the task_id is credited to the name
id = c.begin("bridge:33333333-3333-4333-8333-333333333333", remote, "apply_patch", { patch: "*** Begin Patch\n*** Update File: D:/AProgram/博客/x.js\n@@\n-a\n+b\n*** End Patch" }, { task_id: "abcd1234-0000" });
v = c.view({}); ok(v.ais[0].status === "working", "working while running");
c.end(id, { content: [] });
v = c.view({}); ok(v.changes.length === 1 && v.changes[0].path === "D:/AProgram/博客/x.js" && v.changes[0].ais[0] === "ai:maya001-opus5.5", "change attributed");
// 4. waits collapse; status 等消息
for (let i = 0; i < 3; i++) { t += 25000; const w = c.begin("o", remote, "chat_wait", { name: "maya001-opus5.5" }, {}); t += 25000; c.end(w, { structuredContent: { messages: [], count: 0 } }); }
t += 1000; const w4 = c.begin("o", remote, "chat_wait", { name: "maya001-opus5.5" }, {});
v = c.view({}); const waits = v.activity.filter(e => e.collapsed);
ok(waits.length === 1 && waits[0].count === 4 && waits[0].ongoing && /4 次，中间没有新消息/.test(waits[0].detail), "collapse " + JSON.stringify(waits.map(w => w.detail)));
ok(v.ais[0].status === "waiting", "waiting status " + v.ais[0].status);
c.end(w4, { structuredContent: { messages: [], count: 0 } });
// 5. chat_wait wakes on a message from someone else
const p = c.handleChatTool("chat_wait", { name: "maya001-opus5.5", timeout_ms: 5000 }, { actor: remote });
setTimeout(() => backend.post("p1", { from: "user", text: "你好" }), 20);
r = await p; ok(r.structuredContent.count === 1 && r.structuredContent.messages[0].text === "你好", "wait woke " + JSON.stringify(r.structuredContent));
// own message does not wake
const p2 = c.handleChatTool("chat_wait", { name: "maya001-opus5.5", timeout_ms: 1000 }, { actor: remote });
await c.handleChatTool("chat_send", { name: "maya001-opus5.5", text: "收到" }, { actor: remote });
r = await p2; ok(r.structuredContent.count === 0, "own message ignored");
// 6. need_user -> 等你; markSeen clears
await c.handleChatTool("chat_send", { name: "maya001-opus5.5", text: "@用户 这里要你拍板" }, { actor: remote });
v = c.view({}); ok(v.needs.length === 1 && v.ais[0].needs === 1, "need queued");
c.markSeen(v.needs.map(n => n.id)); v = c.view({}); ok(v.needs.length === 0, "need cleared");
// 7. stuck: linked card stalled and not waiting
t += 10 * 60e3;
v = c.view({ tasks: [{ id: "abcd1234-0000", title: "写博客", state: "awaiting_sync", stalled: true, stalledForMs: 25 * 60e3, todos: [], questions: [{ id: "q1", status: "pending", question: "选哪个主题？" }] }] });
ok(v.ais[0].stuck === false, "last call was wait -> not stuck");
id = c.begin("o", remote, "run_command", { command: "npm test" }, { task_id: "abcd1234-0000" }); c.end(id, { content: [] });
t += 4 * 60e3;
v = c.view({ tasks: [{ id: "abcd1234-0000", title: "写博客", state: "awaiting_sync", stalled: true, stalledForMs: 25 * 60e3, todos: [], questions: [{ id: "q1", status: "pending", question: "选哪个主题？" }] }] });
ok(v.ais[0].stuck === true && v.ais[0].status === "idle", "stuck " + JSON.stringify([v.ais[0].stuck, v.ais[0].status]));
ok(v.needs.some(n => n.source === "question"), "pending question in 等你");
// 8. stop-all wakes waiters, posts to chats, notice once
const p3 = c.handleChatTool("chat_wait", { name: "maya001-opus5.5", timeout_ms: 5000 }, { actor: remote });
setTimeout(() => c.stopAll(), 20);
r = await p3; ok(r.structuredContent.stopped === true && /全部停下/.test(r.content[0].text), "stop woke waiter");
ok(chats.p1.at(-1).text.includes("全部停下") && chats.p2.at(-1).text.includes("全部停下"), "stop posted to all projects");
ok(c.stopNoticeFor("bridge:x", remote, { task_id: "abcd1234-0000" }) === null, "already delivered via wait");
ok(typeof c.stopNoticeFor("bridge:y", { kind: "remote", label: "Cursor" }, {}) === "string" && c.stopNoticeFor("bridge:y", { kind: "remote", label: "Cursor" }, {}) === null, "notice once per identity");
// 9. persistence round trip
c.persist(); const c2 = new CanvasConsole({ now }); c2.configure({ storeDir: dir, backend });
v = c2.view({}); ok(v.ais.some(a => a.name === "maya001-opus5.5") && v.activity.length > 3, "persisted");
// 10. helpers
ok(patchPaths("*** Add File: a\n*** Delete File: b").join() === "a,b", "patchPaths");
ok(toolKind("chat_wait") === "wait" && toolKind("apply_patch") === "file" && toolKind("chat_send") === "chat", "toolKind");
ok(/npm test/.test(describeCall("run_command", { command: "npm test" })), "describe");
r = await c.handleChatTool("chat_send", { name: "bad name!", text: "x" }, {}); ok(r.isError, "invalid name refused");
r = await c.handleChatTool("chat_send", { name: "a1", project: "nope", text: "x" }, {}); ok(r.isError && /PROJECT_UNKNOWN/.test(r.content[0].text), "unknown project refused");
// 11. links from real send/receive pairs; member links passed through
{
  const c3 = new CanvasConsole({ now }); c3.configure({ backend });
  const A = { kind: "remote", label: "Claude" };
  let id = c3.begin("bridge:a", A, "chat_send", { name: "a1", project: "博客", text: "hi" }, {}); let r = await c3.handleChatTool("chat_send", { name: "a1", project: "博客", text: "hi" }, { actor: A }); c3.end(id, r);
  t += 1000; id = c3.begin("bridge:b", A, "chat_read", { name: "b1", project: "博客" }, {}); r = await c3.handleChatTool("chat_read", { name: "b1", project: "博客", after: "" }, { actor: A }); c3.end(id, r);
  const v3 = c3.view({ links: [{ from: "member:x", to: "member:y", kind: "manage" }] });
  ok(v3.links.some((l) => l.from === "ai:a1" && l.to === "ai:b1" && l.kind === "chat"), "chat link " + JSON.stringify(v3.links));
  ok(v3.links.some((l) => l.kind === "manage"), "manage link passed");
  // 12. browser tools: unavailable -> honest error; available -> owner attribution
  r = await c3.handleChatTool("browser_list", {}, { actor: A }); ok(r.isError && /BROWSER_UNAVAILABLE/.test(r.content[0].text), "browser unavailable reported");
  const tabs = []; backend.browser = { available: () => true, reason: () => "", list: () => tabs, open: async (url) => { const tb = { id: "tab" + (tabs.length + 1), url, title: "T" }; tabs.push(tb); return tb; }, close: async (id) => { tabs.splice(tabs.findIndex((x) => x.id === id), 1); } };
  r = await c3.handleChatTool("browser_open", { name: "a1", url: "https://example.com" }, { actor: A }); ok(!r.isError && c3.tabOwner("tab1") === "ai:a1", "tab owner");
  r = await c3.handleChatTool("browser_open", { url: "file:///c:/x" }, { actor: A }); ok(r.isError, "non-http refused");
  r = await c3.handleChatTool("browser_close", { tab_id: "tab1" }, { actor: A }); ok(!r.isError && tabs.length === 0, "tab closed");
  delete backend.browser;
}
console.log(`canvas-console self-test: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
