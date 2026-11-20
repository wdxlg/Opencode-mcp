// Approve / deny / cancel / abandon / timeout / non-blocking flows of background-branch command
// approvals, with a fake approver in place of the VS Code notification. Extracted verbatim from
// module-0177.mjs (parallel block) and module-0183.mjs (approveBackgroundCommand).
// Usage: node approval.test.cjs <module-0177.mjs> <module-0183.mjs>
const fs = require("fs"), path = require("path"), assert = require("assert");
const src = fs.readFileSync(process.argv[2], "utf8");
const rt = fs.readFileSync(process.argv[3], "utf8");
const start = src.indexOf("var OPENCODE_PARALLEL_JOB_KEY");
const end = src.indexOf("function registerOpenCodeNativeChat(");
const normStart = src.indexOf("function normalizeBranchParallel(");
const normEnd = src.indexOf("function multiModelEnabled(");
let block = src.slice(normStart, normEnd) + src.slice(start, end);
// Short timeout for the 30-minute paths (the constant itself is checked below).
assert.ok(/var BACKGROUND_COMMAND_APPROVAL_TIMEOUT_MS = PARALLEL_JOB_TTL_MS;/.test(block), "approval timeout equals the 30 min TTL");
block = block.replace("var PARALLEL_JOB_TTL_MS = 30 * 60 * 1e3;", "var PARALLEL_JOB_TTL_MS = 60;");
class CTS { constructor() { this.l = []; const self = this; this.token = { isCancellationRequested: false, onCancellationRequested(f) { self.l.push(f); return { dispose() { self.l = self.l.filter((x) => x !== f); } }; } }; } cancel() { if (this.token.isCancellationRequested) return; this.token.isCancellationRequested = true; for (const f of [...this.l]) f(); } }
const status = { shown: false, text: "", tooltip: "" };
let quickPicks = [];
const vscode19 = {
  workspace: { getConfiguration: () => ({ get: (k, d) => d }) },
  window: {
    createStatusBarItem: () => ({ show() { status.shown = true; }, hide() { status.shown = false; }, dispose() {}, set text(v) { status.text = v; }, get text() { return status.text; }, set tooltip(v) { status.tooltip = v; }, get tooltip() { return status.tooltip; } }),
    showInformationMessage: async () => {}, showWarningMessage: async () => { throw new Error("notification should be replaced by the fake approver"); },
    showQuickPick: async (items) => (quickPicks.shift() ?? (() => undefined))(items)
  },
  StatusBarAlignment: { Left: 1 }, CancellationTokenSource: CTS
};
let uuidN = 0;
const deps = {
  vscode19, import_node_crypto25: { randomUUID: () => `00000000-0000-4000-8000-${String(++uuidN).padStart(12, "0")}` },
  import_node_path_mm: { default: path },
  CHAT_TASK_OWNER_METADATA_KEY: "opencodeChatTaskOwnerId", OPENCODE_BRANCH_GROUP_METADATA_KEY: "opencodeBranchGroup",
  normalizeBranchWorktreeInfo: (v) => (v && v.worktree ? v : undefined), removeBranchWorktree: async () => {}
};
const M = new Function(...Object.keys(deps), block + "\nreturn { requestBackgroundCommandApproval, rejectBackgroundCommandApprovals, backgroundCommandApprovals, cancelParallelBranchesCommand, manageParallelBranchesCommand, startParallelBranchJobs, parallelBranchBatches, setApprover: (f) => { backgroundCommandApprover = f; } };")(...Object.values(deps));
// runtime side: approveBackgroundCommand method of the runtime client class
const mStart = rt.indexOf("  async approveBackgroundCommand(");
const mEnd = rt.indexOf("  errorChain(error2) {");
assert.ok(mStart > 0 && mEnd > mStart, "runtime method found");
const Runtime = new Function(`return class { ${rt.slice(mStart, mEnd)} };`)();
const runtime = new Runtime();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const logs = []; const out = { appendLine: (l) => logs.push(l) };
const root = path.resolve("wt-branch");
const ask = (cmd, opts = {}) => M.requestBackgroundCommandApproval({ batchId: opts.batch ?? "batch-0001", identifier: opts.id ?? "v/b", label: opts.label ?? "b", name: opts.name ?? "run_command", args: opts.args ?? { command: cmd, cwd: root }, root, token: opts.token, output2: out });
let finished = false;
process.on("exit", (code) => { if (!finished && code === 0) { console.error("approval tests did not finish (stalled promise)"); process.exitCode = 1; } });
(async () => {
  const keepAlive = setInterval(() => {}, 1000); // approval timers are unref()ed like in the extension host
  const prompts = [];
  let decide = () => new Promise(() => {}); // default: user never answers
  M.setApprover((entry) => { prompts.push(entry); return decide(entry); });
  // 1. read-only: no prompt at all
  let v = await ask("git status");
  assert.deepEqual([v.allowed, v.auto, prompts.length], [true, true, 0], "read-only auto-allowed without prompt");
  // 2. allow once
  decide = async () => "allow";
  v = await ask("npm install");
  assert.equal(v.allowed, true); assert.equal(prompts.length, 1);
  assert.equal(prompts[0].label, "b"); assert.equal(prompts[0].command, "npm install"); assert.equal(prompts[0].cwd, root, "prompt shows model, full command and cwd");
  assert.equal(M.backgroundCommandApprovals.size, 0, "settled entry removed");
  // 3. deny -> runtime throws a clear tool error
  decide = async () => "deny";
  await assert.rejects(runtime.approveBackgroundCommand({ approveCommand: (n, a, r) => M.requestBackgroundCommandApproval({ batchId: "batch-0001", identifier: "v/b", label: "b", name: n, args: a, root: r, output2: out }) }, "run_command", { command: "rm -rf build", cwd: root }, root), /BACKGROUND_COMMAND_DENIED: .*user denied/);
  // dismissed notification = not approved
  decide = async () => undefined;
  v = await ask("npm test"); assert.equal(v.allowed, false); assert.match(v.reason, /closed without allowing/);
  // runtime: read-only passes, non-terminal tools are not gated, missing approver fails closed
  await runtime.approveBackgroundCommand({ approveCommand: (n, a, r) => M.requestBackgroundCommandApproval({ batchId: "b", identifier: "x", name: n, args: a, root: r }) }, "run_command", { command: "git diff", cwd: root }, root);
  await runtime.approveBackgroundCommand({}, "read_files", {}, root);
  await runtime.approveBackgroundCommand({}, "get_command_output", {}, root);
  await assert.rejects(runtime.approveBackgroundCommand({}, "run_command", { command: "git status" }, root), /no approval channel/);
  // send_command_input always asks
  decide = async () => "allow"; const before = prompts.length;
  v = await ask(null, { name: "send_command_input", args: { command_id: "cmd_1", input: "y" } });
  assert.equal(v.allowed, true); assert.equal(prompts.length, before + 1); assert.equal(prompts.at(-1).command, "y");
  // 4. non-blocking: branch b waits on approval while branch c keeps running commands
  decide = () => new Promise(() => {});
  let bDone = false;
  const pB = ask("npm run build", { id: "v/b", label: "b" }).then((r) => { bDone = true; return r; });
  await sleep(5);
  assert.equal(M.backgroundCommandApprovals.size, 1, "b pending");
  assert.ok(status.shown && /1 \u5F85\u786E\u8BA4/.test(status.text), "status bar shows pending count: " + status.text);
  assert.ok(status.tooltip.includes("npm run build"), "tooltip lists the pending command");
  const c1 = await ask("git log -1", { id: "v/c", label: "c" });
  decide = async () => "allow";
  const c2 = await ask("npm test", { id: "v/c", label: "c" });
  assert.ok(c1.allowed && c2.allowed && !bDone, "c progressed while b still waits");
  // approve b through the status-bar quick pick
  quickPicks = [(items) => items.find((i) => i.approval), (items) => { assert.ok(items[0].detail.includes("npm run build") && items[0].detail.includes(root)); return items.find((i) => i.allow === true); }];
  await M.manageParallelBranchesCommand(out);
  v = await pB; assert.equal(v.allowed, true); assert.match(v.reason, /allowed once/);
  assert.equal(M.backgroundCommandApprovals.size, 0); assert.ok(!/\u5F85\u786E\u8BA4/.test(status.text) || !status.shown, "pending count cleared");
  // 5. cancel the branch token -> pending rejected
  decide = () => new Promise(() => {});
  const cts = new CTS();
  const pCancel = ask("npm ci", { token: cts.token });
  await sleep(2); cts.cancel();
  v = await pCancel; assert.deepEqual([v.allowed, v.reason], [false, "branch canceled"]);
  // already-canceled token: no prompt
  const n0 = prompts.length; v = await ask("npm ci", { token: cts.token }); assert.equal(v.allowed, false); assert.equal(prompts.length, n0);
  // 6. cancel / abandon a batch rejects its pending approvals only
  const pA = ask("make", { batch: "batch-A", id: "v/x" });
  const pOther = ask("make", { batch: "batch-B", id: "v/y" });
  M.parallelBranchBatches.set("batch-A", { id: "batch-A", jobs: new Map() });
  M.cancelParallelBranchesCommand("batch-A", true, out);
  v = await pA; assert.deepEqual([v.allowed, v.reason], [false, "batch abandoned"]);
  assert.equal(M.backgroundCommandApprovals.size, 1, "other batch still pending");
  M.parallelBranchBatches.set("batch-B", { id: "batch-B", jobs: new Map() });
  M.cancelParallelBranchesCommand("batch-B", false, out);
  v = await pOther; assert.deepEqual([v.allowed, v.reason], [false, "batch canceled"]);
  M.parallelBranchBatches.clear();
  // 7. timeout (30 min TTL, shortened here) rejects cleanly
  v = await ask("make all"); assert.deepEqual([v.allowed, v.reason], [false, "no approval within 30 minutes"]);
  // a late answer after settling is ignored
  let late; decide = () => new Promise((r) => { late = r; });
  const pLate = ask("make x"); await sleep(1); M.rejectBackgroundCommandApprovals(undefined, "extension shutting down"); late("allow");
  v = await pLate; assert.deepEqual([v.allowed, v.reason], [false, "extension shutting down"]);
  // 8. end to end through startParallelBranchJobs: a job waiting on approval, cancel of the batch ends it
  decide = () => new Promise(() => {});
  const results = {};
  const runRequest = (req, ctx, stream, token) => (async () => {
    const r = await M.requestBackgroundCommandApproval({ batchId: req.__openCodeParallelBranchJob.batchId, identifier: req.__openCodeParallelBranchJob.identifier, label: req.model.id, name: "run_command", args: { command: req.model.id === "b" ? "npm install" : "git status", cwd: root }, root, token, output2: out });
    results[req.model.id] = r;
    return { metadata: { opencode: true, canceled: token.isCancellationRequested } };
  })();
  const models = ["a", "b", "c"].map((id) => ({ identifier: `v/${id}`, vendor: "v", id }));
  M.startParallelBranchJobs({ runRequest, request: { prompt: "q", id: "real-a" }, chatContext: { history: [] }, branchPlan: { groupId: "g9" }, parallel: { batchId: "batch-0009", modelIdentifier: "v/a", models }, ownerId: "native-chat:x", output2: out });
  await sleep(10);
  assert.equal(results.c?.allowed, true, "branch c (read-only) finished while b waits");
  assert.equal(results.b, undefined, "b still waiting");
  M.cancelParallelBranchesCommand("batch-0009", true, out);
  await sleep(10);
  assert.equal(results.b.allowed, false, "b's pending approval rejected by batch abandon");
  assert.equal(M.backgroundCommandApprovals.size, 0);
  clearInterval(keepAlive);
  finished = true;
  console.log("approval tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
