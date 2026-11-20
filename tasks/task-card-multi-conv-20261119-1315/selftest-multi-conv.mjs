// 任务卡多对话自检（无头，不连接 OpenCode）：node selftest-multi-conv.mjs <含 module-0144/0145/2763 的目录>
// 场景：4 个并发无状态对话（每次调用新 MCP 会话、clientInfo 完全相同）+ 完成显示。旧代码应失败，新代码应全部通过。
import { createRequire } from "node:module";
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { pathToFileURL } from "node:url";
globalThis.require = createRequire(import.meta.url);
const dir = process.argv[2] || ".";
const M = await import(pathToFileURL(path.resolve(dir, "module-0144.mjs")).href);
const { partitionBridgeTaskDisplay } = await import(pathToFileURL(path.resolve(dir, "module-2763.mjs")).href);
const { BridgeTaskStore } = M;
let clock = Date.parse("2026-11-19T05:00:00Z"); const now = () => clock; const min = (m) => { clock += m * 60e3; };
const uuid = () => globalThis.require("node:crypto").randomUUID();
const own = () => "bridge:" + uuid();
const LABEL = "外部 MCP 客户端"; // 无 clientName 时所有客户端都是这个标签（实测）
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ✓ " + m); } else { fail++; console.log("  ✗ " + m); } };
const scenario = (name, fn) => { console.log(name); try { fn(); } catch (e) { fail++; console.log("  ✗ 场景异常：" + String(e?.message || e).slice(0, 160)); } };
// 模拟 dispatcher：工具不声明 task_id 时从参数里剥离，作为 ref 交给归属逻辑（旧代码没有 splitCardRef）。
const split = (args) => { if (typeof M.splitCardRef !== "function") throw new Error("缺少 splitCardRef：工具调用无法携带 task_id"); return M.splitCardRef(args, () => false); };
// 无状态调用：每次新 owner，调用后会话关闭。
const statelessCall = (s, tool, args = {}, { label = LABEL, busyFn } = {}) => {
  const o = own(); const { args: clean, ref } = split(args);
  s.beginOwnerActivity(o); s.noteLiveDialogue(o, { kind: "remote", label, tool }); s.attributeActivity(o, { label, tool, args: clean, ref });
  const hint = s.taskCardHint(o, { kind: "remote", label, tool, args: clean, ref });
  if (busyFn) busyFn(o);
  s.endOwnerActivity(o); s.disconnect(o); return { owner: o, hint, clean };
};
const setTodos = (s, todos, extra, owner = own()) => { s.beginOwnerActivity(owner); s.noteLiveDialogue(owner, { kind: "remote", label: LABEL, tool: "set_todos" }); try { return s.update(owner, todos, { todos, ...extra }); } finally { s.endOwnerActivity(owner); s.disconnect(owner); } };
const pub = (s, id) => s.snapshot().tasks.find((t) => t.id === id);
const group = (s, id) => { const p = partitionBridgeTaskDisplay(s.snapshot().tasks); return p.slots.some((t) => t.id === id) ? "进行中" : p.unfinished.some((t) => t.id === id) ? "未完成" : p.history.some((t) => t.id === id) ? "已完成" : "不可见"; };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "multi-conv-"));
const mk = () => { const s = new BridgeTaskStore(50, now); s.configurePersistence(fs.mkdtempSync(path.join(tmp, "s-")), "E:/ws"); return s; };
const steps = (k, st) => [{ id: "a", title: `步骤一 R${k}`, status: st[0] }, { id: "b", title: `步骤二 R${k}`, status: st[1] }];

const s = mk(); const convs = [];
scenario("1 四个并发无状态对话各自建卡：4 张独立卡，互不替换", () => {
  for (let k = 1; k <= 4; k++) { const osid = uuid(); const t = setTodos(s, steps(k, ["in_progress", "pending"]), { new_task: true, overview_session_id: osid, task_title: `并发对话 R${k}` }); convs.push({ k, osid, id: t.id }); }
  const cards = s.snapshot().tasks.filter((t) => !t.live);
  ok(cards.length === 4 && new Set(cards.map((t) => t.id)).size === 4, "快照里有 4 张不同的卡");
  ok(convs.every((c) => pub(s, c.id).state === "running" && group(s, c.id) === "进行中"), "4 张卡都是 running，都在「进行中」");
  ok(!s.snapshot().tasks.some((t) => t.live), "没有「未建卡的活动」条目");
});
scenario("2 各对话的后续调用带 task_id（工具本身不声明该参数）→ 剥离参数并精确归属", () => {
  const r = split({ path: "x", task_id: convs[0].id });
  ok(!("task_id" in r.args) && r.args.path === "x" && r.ref?.task_id === convs[0].id, "task_id 从工具参数中剥离、作为卡片引用保留（不再被 schema 拒绝）");
  for (let i = 0; i < 25; i++) { min(1); for (const c of convs) statelessCall(s, "run_command", { command: "echo", task_id: c.id }); }
  ok(convs.every((c) => pub(s, c.id).state === "running"), "25 分钟持续带 task_id 调用：4 张卡都保持 running（旧逻辑：4 张同客户端开放卡→无法归属→全部「已停滞」）");
  ok(!s.snapshot().tasks.some((t) => t.live), "已归属的调用不生成「未建卡的活动」");
  const lone = statelessCall(s, "read_files", { files: [] });
  ok(typeof lone.hint === "string" && /task_id/.test(lone.hint), "多个对话在线时，不带 task_id 的调用收到“请附加 task_id”提示");
});
scenario("3 不带任何标识的完成写入：拒绝而不是新建卡；带 task_id 完成写到正确的卡", () => {
  const before = s.snapshot().tasks.filter((t) => !t.live).length;
  let err = ""; try { setTodos(s, steps(1, ["completed", "completed"]), { lifecycle: "completed" }); } catch (e) { err = String(e.message); }
  ok(/TASK_TARGET_REQUIRED/.test(err), "无 task_id/overview_session_id/new_task 的完成写入被拒绝（TASK_TARGET_REQUIRED）");
  ok(s.snapshot().tasks.filter((t) => !t.live).length === before, "没有凭空多出一张“已完成”的新卡");
  ok(pub(s, convs[0].id).state === "running", "原卡没有被猜测性地改写");
  const t1 = setTodos(s, steps(1, ["completed", "completed"]), { task_id: convs[0].id, overview_session_id: convs[0].osid, lifecycle: "completed" });
  ok(t1.id === convs[0].id && pub(s, convs[0].id).state === "completed" && group(s, convs[0].id) === "已完成", "带 task_id 完成 → 同一张卡 completed，面板归入「已完成」");
  const t2 = setTodos(s, steps(2, ["completed", "completed"]), { overview_session_id: convs[1].osid, lifecycle: "completed" });
  ok(t2.id === convs[1].id && group(s, convs[1].id) === "已完成", "只带 overview_session_id 完成也写到本对话的卡");
  ok(pub(s, convs[2].id).state === "running" && pub(s, convs[3].id).state === "running", "其他两个对话的卡不受影响，仍 running");
});
scenario("4 完成状态以 AI 写入为准：完成后仍有调用在运行，卡片仍显示已完成", () => {
  let st;
  statelessCall(s, "run_command", { command: "sleep", task_id: convs[0].id }, { busyFn: () => { st = pub(s, convs[0].id).state; } });
  ok(st === "completed", "调用运行期间卡片状态仍是 completed（不被活动推回 running）");
  ok(group(s, convs[0].id) === "已完成", "仍在「已完成」分组");
  min(5);
  ok(!s.snapshot().tasks.some((t) => t.live), "引用已完成卡的后续调用不生成「未建卡的活动」，也不复活该卡");
});
scenario("5 停滞与空闲的未建卡活动不显示为「进行中」", () => {
  min(21);
  ok(pub(s, convs[2].id).state === "awaiting_sync" && group(s, convs[2].id) === "未完成", "21 分钟无写卡无归属活动 → 已停滞，归入「未完成」（旧逻辑仍在「进行中」）");
  const s2 = mk(); const P = own();
  for (let i = 0; i < 5; i++) { s2.beginOwnerActivity(P); s2.noteLiveDialogue(P, { kind: "remote", label: LABEL, tool: "run_command" }); s2.attributeActivity(P, { label: LABEL, tool: "run_command", args: {} }); s2.endOwnerActivity(P); }
  min(4);
  const live = s2.snapshot().tasks.find((t) => t.live);
  ok(!!live && live.state === "awaiting_sync" && partitionBridgeTaskDisplay(s2.snapshot().tasks).unfinished.some((x) => x.id === live.id), "4 分钟无调用的「未建卡的活动」归入「未完成」（旧逻辑在「进行中」保留 6 小时）");
});
scenario("6 持久会话不建卡：即使其他对话有卡，也单独显示为未建卡活动", () => {
  const s3 = mk(); const P = own();
  const t = setTodos(s3, steps(9, ["in_progress", "pending"]), { new_task: true, overview_session_id: uuid(), task_title: "别的对话" });
  for (let i = 0; i < 30; i++) { min(0.5); s3.beginOwnerActivity(P); s3.noteLiveDialogue(P, { kind: "remote", label: LABEL, tool: "powershell" }); s3.attributeActivity(P, { label: LABEL, tool: "powershell", args: {} }); s3.endOwnerActivity(P); }
  const rows = s3.snapshot().tasks;
  ok(rows.some((x) => x.live && x.liveDialogue?.sessions === 1 && x.liveDialogue.calls === 30), "做了 30 次调用却没建卡的持久会话有自己的「未建卡的活动」条目（旧逻辑被别的对话的卡遮住）");
  ok(rows.some((x) => x.id === t.id), "别的对话的卡照常显示");
});
scenario("7 set_todos 回执开头给出 task_id 并要求后续调用附带", () => {
  ok(typeof M.cardAckPrefix === "function" && M.cardAckPrefix("abc-123").startsWith("【本对话任务卡 task_id=abc-123】") && /每个 Bridge 工具调用/.test(M.cardAckPrefix("abc-123")), "回执前缀含 task_id 与附带要求");
});
console.log(`\n结果：${pass} 通过，${fail} 失败`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
