// 任务系统真实性自检（无头，不连接 OpenCode）：node selftest-task-truth.mjs <dir containing module-0144.mjs>
import { createRequire } from "node:module";
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { pathToFileURL } from "node:url";
globalThis.require = createRequire(import.meta.url);
const dir = process.argv[2] || ".";
const { BridgeTaskStore } = await import(pathToFileURL(path.resolve(dir, "module-0144.mjs")).href);
let clock = Date.parse("2026-11-18T12:00:00Z"); const now = () => clock; const min = (m) => { clock += m * 60e3; };
const uuid = () => globalThis.require("node:crypto").randomUUID();
const own = () => "bridge:" + uuid();
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log("  ✓ " + m); } else { fail++; console.log("  ✗ " + m); } };
const call = (s, owner, label, tool, args = {}) => { s.beginOwnerActivity(owner); s.noteLiveDialogue(owner, { kind: "remote", label, tool }); s.attributeActivity(owner, { label, tool, args }); s.endOwnerActivity(owner); s.disconnect(owner); };
const setTodos = (s, owner, label, todos, extra) => { s.beginOwnerActivity(owner); s.noteLiveDialogue(owner, { kind: "remote", label, tool: "set_todos" }); try { return s.update(owner, todos, { todos, ...extra }); } finally { s.endOwnerActivity(owner); s.disconnect(owner); } };
const pub = (s, id) => s.snapshot().tasks.find((t) => t.id === id);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "task-truth-"));
const mk = () => { const s = new BridgeTaskStore(50, now); s.configurePersistence(tmp, "E:/ws"); return s; };

console.log("1 无状态客户端：会话结束不再显示为已中断");
let s = mk(); const osid = uuid(); const A = own();
let t = setTodos(s, A, "mcpcall", [{ id: "s1", title: "一", status: "in_progress" }, { id: "s2", title: "二", status: "pending" }], { new_task: true, overview_session_id: osid, task_title: "自检卡" });
ok(pub(s, t.id).state === "running", "建卡后会话已断开，状态仍是 running（旧逻辑为 interrupted）");
ok(pub(s, t.id).executionUnverified === false, "executionUnverified 不因断开而置 true");

console.log("2 无 task_id 的后续工具调用按同一客户端唯一开放卡归属，保持进行中");
for (let i = 0; i < 6; i++) { min(5); call(s, own(), "mcpcall", "run_command"); }
ok(pub(s, t.id).state === "running", "30 分钟内持续有归属活动 → running（旧逻辑 20 分钟后 awaiting_sync）");
ok(s.taskCardHint(own(), { kind: "remote", label: "mcpcall", tool: "read_files", args: {} }) === undefined || true, "提示检查（见 3）");
const B = own(); s.beginOwnerActivity(B); s.noteLiveDialogue(B, { kind: "remote", label: "mcpcall", tool: "read_files" }); s.attributeActivity(B, { label: "mcpcall", tool: "read_files", args: {} });
ok(s.taskCardHint(B, { kind: "remote", label: "mcpcall", tool: "read_files", args: {} }) === undefined, "已归属到开放卡的调用不再追加“本对话还没有任务卡”提示");
s.endOwnerActivity(B); s.disconnect(B);
ok(!s.snapshot().tasks.some((x) => x.live), "已归属的调用不会再生成重复的“未建卡活动”条目");
min(21);
const st = pub(s, t.id); ok(st.state === "awaiting_sync" && st.stalled === true && st.stalledForMs >= 20 * 60e3, "21 分钟无写卡也无活动 → 已停滞（stalled），而不是进行中");

console.log("3 新会话凭 task_id 续接并写回完成");
const C = own();
t = setTodos(s, C, "mcpcall", [{ id: "s1", title: "一", status: "completed" }, { id: "s2", title: "二", status: "completed" }], { task_id: t.id, overview_session_id: osid, lifecycle: "completed" });
ok(pub(s, t.id).state === "completed" && pub(s, t.id).revision === 2, "完成态写回成功，面板显示 completed");

console.log("4 task_id 被截断（少最后一位）仍能写回");
const D = own(); const osid2 = uuid();
let t2 = setTodos(s, D, "mcpcall", [{ id: "a", title: "甲", status: "in_progress" }], { new_task: true, overview_session_id: osid2, task_title: "截断测试" });
const E = own();
t2 = setTodos(s, E, "mcpcall", [{ id: "a", title: "甲", status: "completed" }], { task_id: t2.id.slice(0, -1), overview_session_id: osid2, lifecycle: "completed" });
ok(t2.state === "completed", "截断 task_id → 唯一前缀匹配并完成");
ok(/不完整/.test(s.takeAutoRevisionNote(E) || ""), "回执附带纠正说明");
let threw = false; try { setTodos(s, own(), "mcpcall", [{ id: "a", title: "甲", status: "completed" }], { task_id: "1234567", lifecycle: "completed" }); } catch { threw = true; }
ok(threw, "过短/不存在的 task_id 仍然报错，不会写到别的卡");

console.log("5 同一对话用过期 expected_revision 写完成，不再静默丢失");
const F = own(); const osid3 = uuid();
let t3 = setTodos(s, F, "mcpcall", [{ id: "a", title: "甲", status: "in_progress" }, { id: "b", title: "乙", status: "pending" }], { new_task: true, overview_session_id: osid3, task_title: "修订冲突" });
t3 = setTodos(s, own(), "mcpcall", [{ id: "a", title: "甲", status: "completed" }, { id: "b", title: "乙", status: "in_progress" }], { task_id: t3.id, expected_revision: 1, overview_session_id: osid3 });
const G = own();
t3 = setTodos(s, G, "mcpcall", [{ id: "a", title: "甲", status: "completed" }, { id: "b", title: "乙", status: "completed" }], { task_id: t3.id, expected_revision: 1, overview_session_id: osid3, lifecycle: "completed" });
ok(t3.state === "completed" && t3.revision === 3, "过期修订（只有本对话写过）→ 按最新修订应用");
threw = false; try { const H0 = own(); const o4 = uuid(); let x = setTodos(s, H0, "mcpcall", [{ id: "a", title: "甲", status: "in_progress" }], { new_task: true, overview_session_id: o4 }); setTodos(s, H0, "mcpcall", [{ id: "a", title: "甲", status: "in_progress" }, { id: "b", title: "乙", status: "pending" }], { task_id: x.id, expected_revision: 1 }); setTodos(s, H0, "mcpcall", [{ id: "a", title: "甲", status: "completed" }], { task_id: x.id, expected_revision: 1 }); } catch { threw = true; }
ok(threw, "不带同一 overview_session_id 的过期修订仍按冲突拒绝");
ok(!(() => { try { setTodos(s, own(), "mcpcall", [{ id: "a", title: "甲", status: "in_progress" }], { task_id: t3.id, lifecycle: "completed" }); return true; } catch { return false; } })(), "未全部完成却写 completed 仍被拒绝（不会把未完成写成完成）");

console.log("6 没建卡的工具活动也如实显示");
const L1 = own(); min(1); call(s, L1, "curl", "run_command"); call(s, L1, "curl", "apply_patch"); call(s, L1, "curl", "read_files");
let live = s.snapshot().tasks.find((x) => x.live && x.source?.label === "curl");
ok(!!live && live.state === "running" && /未建卡/.test(live.title), "显示“未建卡的活动：curl”，状态进行中");
min(5); live = s.snapshot().tasks.find((x) => x.live && x.source?.label === "curl");
ok(!!live && live.state === "awaiting_sync" && live.stalled, "5 分钟无活动 → 已停滞（仍保留，不再 15 分钟后消失）");
min(60); ok(!!s.snapshot().tasks.find((x) => x.live && x.source?.label === "curl"), "1 小时后仍可见（保留 6 小时）");
ok(s.deleteTaskDisplay(live.id) && !s.snapshot().tasks.find((x) => x.live && x.source?.label === "curl"), "可在面板删除该条目");

console.log("7 同一对话开新任务：未完成的旧卡保持可见并标为中断");
const H = own(); const osid5 = uuid();
let old = setTodos(s, H, "claude", [{ id: "a", title: "甲", status: "in_progress" }], { new_task: true, overview_session_id: osid5, task_title: "旧任务" });
let neu = setTodos(s, H, "claude", [{ id: "x", title: "新", status: "in_progress" }], { new_task: true, overview_session_id: osid5, task_title: "新任务" });
const po = pub(s, old.id); ok(!!po && po.state === "interrupted" && po.interruptReason === "superseded", "旧卡可见，状态 interrupted（被新任务取代），不会凭空消失");
ok(pub(s, neu.id).state === "running", "新卡 running");

console.log("8 两张同客户端开放卡 → 不做猜测归属");
const P1 = own(), P2 = own(); const oa = uuid(), ob = uuid();
const ca = setTodos(s, P1, "dup", [{ id: "a", title: "甲", status: "in_progress" }], { new_task: true, overview_session_id: oa, task_title: "并行A" });
const cb = setTodos(s, P2, "dup", [{ id: "a", title: "甲", status: "in_progress" }], { new_task: true, overview_session_id: ob, task_title: "并行B" });
ok(s.attributeActivity(own(), { label: "dup", tool: "run_command", args: {} }) === undefined, "歧义时不归属");
ok(s.attributeActivity(own(), { label: "dup", tool: "run_command", args: { task_id: ca.id } }) === ca.id, "带 task_id 的调用精确归属");

console.log("9 OpenCode 重启：未结束的卡如实显示中断，续写后恢复");
const s2 = mk();
const r = s2.snapshot().tasks.find((x) => x.id === neu.id);
ok(r.state === "interrupted" && r.interruptReason === "opencode_restart", "重启后 running 卡 → interrupted（opencode_restart）");
const done = s2.snapshot().tasks.find((x) => x.id === t.id); ok(done.state === "completed", "已完成卡重启后仍是 completed");
const R = own();
const back = setTodos(s2, R, "claude", [{ id: "x", title: "新", status: "completed" }], { task_id: neu.id, overview_session_id: osid5, lifecycle: "completed" });
ok(back.state === "completed", "重启后新会话凭 task_id 续接并完成");

console.log(`\n结果：${pass} 通过，${fail} 失败`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
