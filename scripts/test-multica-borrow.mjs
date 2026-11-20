// Offline tests for the Multica-inspired ops layer (recovered/shared/multica). No network, no OpenCode instance:
// state goes to a fresh temp OPENCODE_MULTICA_HOME. Run: node --test scripts/test-multica-borrow.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MULTICA_SRC ? path.resolve(process.env.MULTICA_SRC) : path.resolve(here, "../recovered/shared/multica");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-multica-test-"));
process.env.OPENCODE_MULTICA_HOME = path.join(TMP, "home");
const mod = (f) => import(pathToFileURL(path.join(SRC, f)).href);
const { createMulticaRuntime } = await mod("hooks.mjs");
const core = await mod("core.mjs");
const writeConfig = (cfg) => core.saveConfigPatch(cfg);
const text = (r) => (r?.content ?? []).map((c) => c.text).join("\n");
const receipt = (id, rev) => ({ content: [{ type: "text", text: `已通过 set_todos 更新 OpenCode 任务卡：任务编号：${id}；修订号：${rev}。` }] });

test("m01 task card → task.md/progress.md one-way sync and recovery", async () => {
  const rt = createMulticaRuntime();
  const todos = [{ id: "a", title: "准备", status: "in_progress" }, { id: "b", title: "实现", status: "pending" }];
  await rt.runToolCall({ toolName: "set_todos", args: { new_task: true, task_title: "T", todos, overview_model: "m-1" }, ownerId: "o1" }, async () => receipt("task-1", 1));
  const dir = path.join(TMP, "repo", "tasks", "t1");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "task.md"), "# 手写标题\n\n手写说明保留\n");
  const bound = await rt.runToolCall({ toolName: "opencode_ops", args: { action: "task_bind", task_id: "task-1", dir }, ownerId: "o1" }, async () => assert.fail("ops must not dispatch"));
  assert.equal(bound.isError, false, text(bound));
  // patch update through a bridge_batch must also sync
  await rt.runToolCall({ toolName: "bridge_batch", args: { calls: [{ id: "t", tool: "set_todos", arguments: { task_id: "task-1", mode: "patch", todos: [{ id: "a", title: "准备", status: "completed" }, { id: "b", title: "实现", status: "in_progress" }] } }] }, ownerId: "o1" },
    async () => ({ content: [{ type: "text", text: "batch" }], structuredContent: { results: [{ id: "t", isError: false, text: receipt("task-1", 2).content[0].text }] } }));
  const task = fs.readFileSync(path.join(dir, "task.md"), "utf8");
  assert.match(task, /手写说明保留/);
  assert.match(task, /修订号：2/);
  assert.match(task, /\| a \| \[x\] completed/);
  assert.equal((task.match(/opencode-task-card:begin/g) ?? []).length, 1);
  assert.match(fs.readFileSync(path.join(dir, "progress.md"), "utf8"), /当前步骤：b 实现/);
  // disconnect recovery from the directory snapshot alone
  fs.rmSync(path.join(process.env.OPENCODE_MULTICA_HOME, "tasks"), { recursive: true, force: true });
  const rec = await rt.handleOps({ action: "task_recover", dir });
  assert.equal(rec.structuredContent.resume.arguments.expected_revision, 2);
  assert.equal(rec.structuredContent.resume.arguments.task_id, "task-1");
});

test("runtime never blocks the original call and rethrows dispatcher errors", async () => {
  const rt = createMulticaRuntime();
  const r = await rt.runToolCall({ toolName: "read_files", args: {} }, async () => ({ content: [{ type: "text", text: "ok" }] }));
  assert.equal(text(r), "ok");
  await assert.rejects(rt.runToolCall({ toolName: "x", args: {} }, async () => { throw new Error("boom"); }), /boom/);
  const u = await rt.handleOps({ action: "nope" });
  assert.equal(u.isError, true);
});

test("m02 run records: redacted JSONL, rotation, query/replay/verify", async () => {
  const rt = createMulticaRuntime();
  const out = (id, extra) => ({ content: [{ type: "text", text: `command_id: ${id}\nstatus: ${extra.status}\n${extra.exit != null ? `exit_code: ${extra.exit}\n` : ""}--- OUTPUT ---` }] });
  await rt.runToolCall({ toolName: "run_command", args: { command: "npm run build", cwd: "E:/r", background: true, env: { API_KEY: "abc" } }, ownerId: "o2" }, async () => out("cmd_1", { status: "running" }));
  await rt.runToolCall({ toolName: "get_command_output", args: { command_id: "cmd_1" }, ownerId: "o2" }, async () => out("cmd_1", { status: "completed", exit: 0 }));
  await rt.runToolCall({ toolName: "run_command", args: { command: "curl -H 'Authorization: Bearer abcdefghijklmnop' https://x?token=zzz" }, ownerId: "o2" }, async () => out("cmd_2", { status: "completed", exit: 7 }));
  const v = await rt.handleOps({ action: "records_verify", contains: "npm run build" });
  assert.deepEqual([v.structuredContent.executed, v.structuredContent.passed, v.structuredContent.runs[0].exitCode], [true, true, 0]);
  const never = await rt.handleOps({ action: "records_verify", contains: "npm test" });
  assert.equal(never.structuredContent.executed, false);
  const raw = fs.readFileSync(path.join(process.env.OPENCODE_MULTICA_HOME, "records", "runs.jsonl"), "utf8");
  assert.doesNotMatch(raw, /abcdefghijklmnop|token=zzz|"abc"/);
  const rp = await rt.handleOps({ action: "records_replay", limit: 10 });
  assert.match(rp.structuredContent.timeline, /run_command \[ok exit=7\]/);
  const q = await rt.handleOps({ action: "records_query", tool: "get_command_output" });
  assert.equal(q.structuredContent.records.at(-1).exitCode, 0);
  // rotation keeps at most maxFiles files
  core.saveConfigPatch({ runRecords: { maxBytes: 600, maxFiles: 2 } });
  for (let i = 0; i < 20; i++) await rt.runToolCall({ toolName: "read_files", args: { i } }, async () => ({ content: [{ type: "text", text: "x".repeat(100) }] }));
  const files = fs.readdirSync(path.join(process.env.OPENCODE_MULTICA_HOME, "records"));
  assert.deepEqual(files.sort(), ["runs.jsonl", "runs.jsonl.1"]);
  core.saveConfigPatch({ runRecords: { maxBytes: 5242880, maxFiles: 5 } });
});

test("m03 steer: mid-run message appears in the next tool receipt of that run only once", async () => {
  const rt = createMulticaRuntime();
  await rt.runToolCall({ toolName: "set_todos", args: { new_task: true, todos: [{ id: "s", title: "x", status: "in_progress" }] }, ownerId: "o3" }, async () => receipt("task-3", 1));
  await rt.handleOps({ action: "steer_post", task_id: "task-3", text: "先别改 module-0143，改用临时目录" });
  await rt.handleOps({ action: "steer_post", task_id: "task-other", text: "给别的任务" });
  const r1 = await rt.runToolCall({ toolName: "read_files", args: {}, ownerId: "o3" }, async () => ({ content: [{ type: "text", text: "file" }] }));
  assert.match(text(r1), /运行中插话[\s\S]*先别改 module-0143/);
  assert.doesNotMatch(text(r1), /给别的任务/);
  const r2 = await rt.runToolCall({ toolName: "read_files", args: {}, ownerId: "o3" }, async () => ({ content: [{ type: "text", text: "file" }] }));
  assert.equal(text(r2), "file");
  assert.equal((await rt.handleOps({ action: "steer_list", task_id: "task-other" })).structuredContent.pending.length, 1);
});

test("m04 review gate: worktree branch, pending review, no auto-merge, approve only via user channel", async (t) => {
  const { execFileSync } = await import("node:child_process");
  const repo = path.join(TMP, "gitrepo");
  fs.mkdirSync(repo, { recursive: true });
  const g = (cwd, ...a) => execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], { cwd, encoding: "utf8" }).trim();
  g(repo, "init", "-q", "-b", "main"); fs.writeFileSync(path.join(repo, "a.txt"), "1\n"); g(repo, "add", "."); g(repo, "commit", "-qm", "init");
  const rt = createMulticaRuntime();
  assert.equal((await rt.handleOps({ action: "review_start", task_id: "rv1", repo })).isError, true, "disabled by default");
  writeConfig({ review: { enabled: true } });
  const s = await rt.handleOps({ action: "review_start", task_id: "rv1", repo });
  assert.equal(s.isError, false, text(s));
  const wt = s.structuredContent.review.worktree;
  fs.writeFileSync(path.join(wt, "a.txt"), "2\n"); g(wt, "commit", "-qam", "work");
  const sub = await rt.handleOps({ action: "review_submit", task_id: "rv1", summary: "改 a" });
  assert.equal(sub.structuredContent.review.status, "pending_review");
  assert.equal(fs.readFileSync(path.join(repo, "a.txt"), "utf8").trim(), "1", "main untouched after submit");
  const byTool = await rt.handleOps({ action: "review_approve", task_id: "rv1" });
  assert.equal(byTool.isError, true); assert.match(text(byTool), /NEEDS_USER/);
  const { handleChannelMessage } = await mod("channels.mjs").catch(() => ({}));
  const { approveReview } = await mod("review-gate.mjs");
  const done = handleChannelMessage ? handleChannelMessage({ type: "review_approve", task_id: "rv1" }, core.loadConfig()).review : approveReview({ task_id: "rv1" }, core.loadConfig(), "channel");
  assert.equal(done.status, "merged");
  assert.equal(fs.readFileSync(path.join(repo, "a.txt"), "utf8").trim(), "2");
  await rt.handleOps({ action: "review_cleanup", task_id: "rv1" });
  writeConfig({ review: { enabled: false } });
});

test("m05 squad leader routing: disabled → dry-run plan only; enabled → tag routing + load balance", async () => {
  const rt = createMulticaRuntime();
  writeConfig({ squad: { leader: { id: "lead", model: "m-lead" }, members: [{ id: "fe", model: "m-a", tags: ["ui", "css"] }, { id: "be", model: "m-b", tags: ["api", "db"] }, { id: "gen", model: "m-c", tags: [] }] } });
  const tasks = [{ id: "1", title: "修 CSS 布局", tags: ["ui"] }, { id: "2", title: "加 API", tags: ["api"] }, { id: "3", title: "写文档" }, { id: "4", title: "再写文档" }];
  const off = (await rt.handleOps({ action: "squad_plan", tasks })).structuredContent;
  assert.equal(off.enabled, false); assert.equal(off.dry_run, true);
  assert.deepEqual(off.assignments.slice(0, 2).map((a) => a.member), ["fe", "be"]);
  assert.equal(off.assignments[2].member, "gen"); assert.notEqual(off.assignments[3].member, "gen");
  writeConfig({ squad: { enabled: true } });
  const on = (await rt.handleOps({ action: "squad_plan", tasks, commit: true, task_id: "p" })).structuredContent;
  assert.equal(on.dry_run, false);
  assert.equal((await rt.handleOps({ action: "squad_status" })).structuredContent.recent.length, 4);
  writeConfig({ squad: { enabled: false } });
});

test("m06 retry/timeout: off by default; one retry on transient error; second failure stops with reason; timeout", async () => {
  const rt = createMulticaRuntime();
  let n = 0;
  const flaky = async () => (++n === 1 ? { isError: true, content: [{ type: "text", text: "ECONNRESET" }] } : { content: [{ type: "text", text: "ok" }] });
  assert.equal((await rt.runToolCall({ toolName: "read_files", args: {} }, flaky)).isError, true, "no retry when disabled");
  writeConfig({ retry: { enabled: true, tools: { read_files: { backoffMs: 1 }, run_command: { retries: 1, timeoutMs: 50, backoffMs: 1 } } } });
  n = 0;
  assert.equal(text(await rt.runToolCall({ toolName: "read_files", args: {} }, flaky)), "ok");
  const always = await rt.runToolCall({ toolName: "read_files", args: {} }, async () => ({ isError: true, content: [{ type: "text", text: "EBUSY lock" }] }));
  assert.equal(always.isError, true); assert.match(text(always), /已停止】第 2 次仍失败/);
  const perm = await rt.runToolCall({ toolName: "read_files", args: {} }, async () => ({ isError: true, content: [{ type: "text", text: "PATH_DENIED" }] }));
  assert.match(text(perm), /未重试/);
  let calls = 0;
  const slow = await rt.runToolCall({ toolName: "run_command", args: { command: "x" } }, () => { calls++; return new Promise((r) => setTimeout(() => r({ content: [] }), 300)); });
  assert.equal(calls, 2); assert.match(text(slow), /超时：50 ms/);
  const q = await rt.handleOps({ action: "records_query", tool: "run_command", limit: 1 });
  assert.equal(q.structuredContent.records[0].attempts, 2);
  writeConfig({ retry: { enabled: false } });
});

test("m07 inbox: only pending asks, blocked cards and pending reviews", async () => {
  const rt = createMulticaRuntime();
  await rt.runToolCall({ toolName: "set_todos", args: { new_task: true, task_title: "卡住的任务", lifecycle: "blocked", todos: [{ id: "x", title: "等授权", status: "pending" }] }, ownerId: "o7" }, async () => receipt("task-7", 1));
  await rt.runToolCall({ toolName: "bridge_ask_user", args: { mode: "ask", question: "用哪个方案？" }, ownerId: "o7" }, async () => ({ content: [{ type: "text", text: "status: pending" }], structuredContent: { batch_id: "batch-77", status: "pending" } }));
  await rt.runToolCall({ toolName: "read_files", args: {}, ownerId: "o7" }, async () => ({ content: [{ type: "text", text: "noise" }] }));
  let items = (await rt.handleOps({ action: "inbox_list" })).structuredContent.items;
  assert.deepEqual(items.map((i) => i.kind).sort(), ["ask", "blocked"]);
  await rt.runToolCall({ toolName: "bridge_ask_user", args: { mode: "check", batch_id: "batch-77" }, ownerId: "o7" }, async () => ({ content: [{ type: "text", text: "answered" }], structuredContent: { batch_id: "batch-77", status: "answered" } }));
  await rt.runToolCall({ toolName: "set_todos", args: { task_id: "task-7", lifecycle: "running", mode: "patch", todos: [] }, ownerId: "o7" }, async () => receipt("task-7", 2));
  items = (await rt.handleOps({ action: "inbox_list" })).structuredContent.items;
  assert.equal(items.length, 0, JSON.stringify(items));
});

test("m08 usage per task and per model", async () => {
  const rt = createMulticaRuntime();
  await rt.runToolCall({ toolName: "set_todos", args: { new_task: true, overview_model: "model-x", todos: [{ id: "u", title: "u", status: "in_progress" }] }, ownerId: "o8" }, async () => receipt("task-8", 1));
  for (let i = 0; i < 3; i++) await rt.runToolCall({ toolName: "read_files", args: { q: "abcd".repeat(10) }, ownerId: "o8" }, async () => ({ content: [{ type: "text", text: "中文八个字符号了" }] }));
  const u = (await rt.handleOps({ action: "usage_report", task_id: "task-8" })).structuredContent.usage;
  assert.equal(u.byTool.read_files, 3); assert.ok(u.outTokens >= 24);
  const m = (await rt.handleOps({ action: "usage_report", model: "model-x" })).structuredContent.usage;
  assert.ok(m.calls >= 4);
});

// m09 multica autopilot removed (2026-11-19): superseded by autopilot-store.mjs (Automations), see test-work-automation.mjs
test("m10 skills-lock: records used skills, writes and verifies lock", async () => {
  const sk = path.join(TMP, "skills", "demo");
  fs.mkdirSync(path.join(sk, "ref"), { recursive: true });
  fs.writeFileSync(path.join(sk, "SKILL.md"), "---\nname: demo-skill\nversion: 1.2.0\n---\n# Demo\n");
  fs.writeFileSync(path.join(sk, "ref", "a.md"), "a");
  const rt = createMulticaRuntime();
  await rt.runToolCall({ toolName: "set_todos", args: { new_task: true, todos: [{ id: "k", title: "k", status: "in_progress" }] }, ownerId: "o10" }, async () => receipt("task-10", 1));
  await rt.runToolCall({ toolName: "read_files", args: { files: [{ path: path.join(sk, "SKILL.md") }] }, ownerId: "o10" }, async () => ({ content: [{ type: "text", text: "skill" }] }));
  const ws = path.join(TMP, "ws10"); fs.mkdirSync(ws, { recursive: true });
  const w = await rt.runToolCall({ toolName: "opencode_ops", args: { action: "skills_lock_write", root: ws, used_only: true }, ownerId: "o10" }, async () => assert.fail());
  assert.equal(w.structuredContent.count, 1, text(w));
  const lock = JSON.parse(fs.readFileSync(path.join(ws, "skills-lock.json"), "utf8"));
  assert.equal(lock.skills[0].name, "demo-skill"); assert.equal(lock.skills[0].version, "1.2.0"); assert.equal(lock.skills[0].files, 2);
  assert.equal((await rt.handleOps({ action: "skills_lock_verify", root: ws })).structuredContent.ok, true);
  fs.writeFileSync(path.join(sk, "ref", "a.md"), "changed");
  const v = (await rt.handleOps({ action: "skills_lock_verify", root: ws })).structuredContent;
  assert.equal(v.ok, false); assert.equal(v.changed[0].name, "demo-skill");
});

test("m11 permission scopes: default no tightening; role limits tools and paths incl. batch and patch targets", async () => {
  const rt = createMulticaRuntime();
  const ok = async () => ({ content: [{ type: "text", text: "ran" }] });
  assert.equal(text(await rt.runToolCall({ toolName: "apply_patch", args: { patch: "*** Begin Patch\n*** Add File: C:/x/a.txt\n+a\n*** End Patch" }, ownerId: "o11" }, ok)), "ran");
  const allow = path.join(TMP, "allowed");
  writeConfig({ permissions: { enabled: true, owners: { o11: "reviewer" }, roles: { reviewer: { readOnly: true, allowPaths: [allow], denyTools: ["configure_mcp"] }, narrow: { selfAssignable: true, allowTools: ["read_files"] } } } });
  const d1 = await rt.runToolCall({ toolName: "apply_patch", args: { patch: `*** Begin Patch\n*** Add File: ${allow}/a.txt\n+a\n*** End Patch` }, ownerId: "o11" }, ok);
  assert.equal(d1.isError, true); assert.match(text(d1), /只读/);
  const d2 = await rt.runToolCall({ toolName: "read_files", args: { files: [{ path: path.join(TMP, "secret.txt") }] }, ownerId: "o11" }, ok);
  assert.match(text(d2), /不允许路径/);
  assert.equal(text(await rt.runToolCall({ toolName: "read_files", args: { files: [{ path: path.join(allow, "x.txt") }] }, ownerId: "o11" }, ok)), "ran");
  const d3 = await rt.runToolCall({ toolName: "bridge_batch", args: { calls: [{ tool: "read_files", arguments: { files: [{ path: path.join(allow, "y") }] } }, { tool: "run_command", arguments: { command: "x", cwd: allow } }] }, ownerId: "o11" }, ok);
  assert.match(text(d3), /PERMISSION_SCOPE/);
  assert.equal(text(await rt.runToolCall({ toolName: "run_command", args: { command: "x" }, ownerId: "other" }, ok)), "ran", "owner without role unaffected");
  assert.equal((await rt.runToolCall({ toolName: "opencode_ops", args: { action: "perm_set_role", role: "reviewer" }, ownerId: "o12" }, ok)).isError, true);
  await rt.runToolCall({ toolName: "opencode_ops", args: { action: "perm_set_role", role: "narrow" }, ownerId: "o12" }, ok);
  assert.match(text(await rt.runToolCall({ toolName: "run_command", args: { command: "x" }, ownerId: "o12" }, ok)), /不允许工具/);
  writeConfig({ permissions: { enabled: false } });
});

test("m12 channels: adapter interface + loopback webhook (token, steer, task queue), off by default", async () => {
  const ch = await mod("channels.mjs");
  const rt = createMulticaRuntime();
  assert.equal((await rt.handleOps({ action: "channels_start" })).isError, true);
  assert.throws(() => ch.createLocalWebhookChannel({ host: "0.0.0.0", token: "x".repeat(20) }), /回环/);
  assert.throws(() => ch.createLocalWebhookChannel({ token: "short" }), /token/);
  const token = "t".repeat(24);
  writeConfig({ channels: { enabled: true, webhook: { enabled: true, port: 0, token } } });
  const st = (await rt.handleOps({ action: "channels_start" })).structuredContent;
  const url = st.started[0].url;
  assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/v1\/message$/);
  const post = (body, tok = token) => fetch(url, { method: "POST", headers: { "x-opencode-token": tok, "content-type": "application/json" }, body: JSON.stringify(body) });
  assert.equal((await post({ type: "steer", text: "x" }, "wrong-token-wrong-token!")).status, 401);
  assert.equal((await post({ type: "steer", task_id: "task-12", text: "从渠道插话" })).status, 200);
  assert.equal((await post({ type: "task", text: "帮我跑一次构建" })).status, 200);
  assert.equal((await post({ type: "nope" })).status, 400);
  assert.equal((await rt.handleOps({ action: "steer_list", task_id: "task-12" })).structuredContent.pending[0].from, "channel:local-webhook");
  assert.equal((await rt.handleOps({ action: "channel_inbound" })).structuredContent.inbound.length, 1);
  await rt.handleOps({ action: "channels_stop" });
  writeConfig({ channels: { enabled: false, webhook: { enabled: false, token: null } } });
});
