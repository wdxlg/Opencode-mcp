// Logic test of the parallel-branch orchestration block, extracted verbatim from module-0177.mjs.
const fs = require("fs"), path = require("path"), assert = require("assert");
const src = fs.readFileSync(process.argv[2], "utf8");
const start = src.indexOf("var OPENCODE_PARALLEL_JOB_KEY");
const end = src.indexOf("function registerOpenCodeNativeChat(");
const normStart = src.indexOf("function normalizeBranchParallel(");
const normEnd = src.indexOf("function multiModelEnabled(");
const block = src.slice(normStart, normEnd) + src.slice(start, end);
let config = { "multiModel.parallelBranches": 3 };
const removed = [];
class CTS { constructor() { this.l = []; const self = this; this.token = { isCancellationRequested: false, onCancellationRequested(f) { self.l.push(f); return { dispose() {} }; } }; } cancel() { if (this.token.isCancellationRequested) return; this.token.isCancellationRequested = true; for (const f of this.l) f(); } }
const status = { shown: false, text: "" };
const vscode19 = {
  workspace: { getConfiguration: () => ({ get: (k, d) => (k in config ? config[k] : d) }) },
  window: { createStatusBarItem: () => ({ show() { status.shown = true; }, hide() { status.shown = false; }, dispose() {}, set text(v) { status.text = v; }, get text() { return status.text; } }), showInformationMessage: async () => {}, showQuickPick: async () => undefined },
  StatusBarAlignment: { Left: 1 }, CancellationTokenSource: CTS
};
let uuidN = 0;
const deps = {
  vscode19, import_node_crypto25: { randomUUID: () => `00000000-0000-4000-8000-${String(++uuidN).padStart(12, "0")}` },
  CHAT_TASK_OWNER_METADATA_KEY: "opencodeChatTaskOwnerId", OPENCODE_BRANCH_GROUP_METADATA_KEY: "opencodeBranchGroup",
  normalizeBranchWorktreeInfo: (v) => (v && v.worktree ? v : undefined), removeBranchWorktree: async (i) => { removed.push(i.worktree); }
};
const fn = new Function(...Object.keys(deps), block + "\nreturn { normalizeBranchParallel, createBufferedChatStream, startParallelBranchJobs, takeParallelBranchJob, attachParallelBranchJob, cancelParallelBranchesCommand, parallelBranchBatches, parallelBranchLimit };");
const M = fn(...Object.values(deps));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = { appendLine() {} };
function rec() { const calls = []; return { calls, stream: new Proxy({}, { get: (_, p) => (...a) => { calls.push([p, ...a]); } }) }; }
(async () => {
  // normalizeBranchParallel
  assert.equal(M.normalizeBranchParallel({ batchId: "x", modelIdentifier: "a" }), undefined, "short batch id rejected");
  const p = M.normalizeBranchParallel({ batchId: "batch-123456", modelIdentifier: "v/a", models: [{ identifier: "v/a", vendor: "v", id: "a" }, { identifier: "bad" }, { identifier: "v/b", vendor: "v", id: "b", modelConfiguration: [1] }] });
  assert.deepEqual(p.models.map((m) => m.identifier), ["v/a", "v/b"]); assert.equal(p.models[1].modelConfiguration, undefined);
  // buffered stream: coalesces markdown, replays in order, forwards live after attach
  const b = M.createBufferedChatStream();
  b.stream.markdown("he"); b.stream.markdown("llo"); b.stream.push({ part: 1 }); b.stream.markdown("x");
  assert.equal(b.stream.then, undefined, "not thenable");
  const r1 = rec(); b.attach(r1.stream); b.stream.button({ t: 1 });
  assert.deepEqual(r1.calls, [["markdown", "hello"], ["push", { part: 1 }], ["markdown", "x"], ["button", { t: 1 }]]);
  // orchestration: 4 models, limit 3 (foreground + 2 background), the 4th waits for a slot
  const running = new Set(); let maxConcurrent = 0; const seen = [];
  const finishers = {};
  const runRequest = (req, ctx, stream, token) => new Promise((resolve) => {
    running.add(req.model.id); maxConcurrent = Math.max(maxConcurrent, running.size + 1); seen.push(req);
    stream.markdown(`answer from ${req.model.id}`);
    const done = (meta = {}) => { running.delete(req.model.id); resolve({ metadata: { opencode: true, opencodeBranchGroup: { groupId: "g1", variantId: req.id, kind: "branch" }, opencodeBranchWorktree: { worktree: `/wt/${req.model.id}` }, ...meta } }); };
    finishers[req.model.id] = done;
    token.onCancellationRequested(() => done({ canceled: true }));
  });
  const models = ["a", "b", "c", "d"].map((id) => ({ identifier: `v/${id}`, vendor: "v", id }));
  const parallel = { batchId: "batch-0001", modelIdentifier: "v/a", models };
  const release = M.startParallelBranchJobs({ runRequest, request: { prompt: "q", id: "real-a" }, chatContext: { history: [] }, branchPlan: { groupId: "g1" }, parallel, ownerId: "native-chat:11111111-1111-4111-8111-111111111111", output2: out });
  await sleep(5);
  assert.deepEqual([...running].sort(), ["b", "c"], "2 background jobs while foreground holds a slot");
  assert.equal(seen[0][Object.keys(seen[0]).find((k) => k.startsWith("__"))].ownerId, "native-chat:11111111-1111-4111-8111-111111111111", "owner id passed to job");
  assert.equal(seen[0].toolInvocationToken, undefined); assert.equal(seen[0].openCodeBranchIntent.groupId, "g1");
  assert.ok(status.shown && /2/.test(status.text), "status bar shows running count: " + status.text);
  release(); await sleep(5);
  assert.deepEqual([...running].sort(), ["b", "c", "d"], "foreground done -> 4th job starts");
  assert.ok(maxConcurrent <= 3 + 1);
  // attach b while running; finish later -> live forwarding + variantId rewrite + canonical set
  const branchStore = { st: {}, ensureLoaded: async () => {}, getState(g) { return this.st[g] || {}; }, setCanonical(g, v) { this.st[g] = { canonicalVariantId: v }; } };
  const jb = M.takeParallelBranchJob({ batchId: "batch-0001", modelIdentifier: "v/b" });
  const rb = rec(); const tokB = new CTS().token;
  const pb = M.attachParallelBranchJob(jb, { id: "real-b" }, rb.stream, tokB, branchStore, out);
  assert.equal(M.takeParallelBranchJob({ batchId: "batch-0001", modelIdentifier: "v/b" }), undefined, "attached job not taken twice");
  finishers.b(); const resB = await pb;
  assert.equal(resB.metadata.opencodeBranchGroup.variantId, "real-b"); assert.equal(branchStore.st.g1.canonicalVariantId, "real-b");
  assert.deepEqual(rb.calls[0], ["markdown", "answer from b"]);
  // cancel c via its own attached request token
  const jc = M.takeParallelBranchJob({ batchId: "batch-0001", modelIdentifier: "v/c" });
  const ctsC = new CTS(); const pc = M.attachParallelBranchJob(jc, { id: "real-c" }, rec().stream, ctsC.token, branchStore, out);
  ctsC.cancel(); const resC = await pc; assert.equal(resC.metadata.canceled, true); assert.equal(resC.metadata.opencodeBranchGroup.variantId, "real-c");
  assert.ok(!running.has("c"), "c cancelled");
  // abandon the batch: d still running gets cancelled, its unattached worktree removed
  M.cancelParallelBranchesCommand("batch-0001", true, out); await sleep(10);
  assert.ok(!running.has("d")); assert.deepEqual(removed, ["/wt/d"], "unattached worktree discarded: " + JSON.stringify(removed));
  assert.equal(M.parallelBranchBatches.size, 0, "batch cleaned up");
  // limit=1 -> nothing starts in the background while the foreground runs
  config["multiModel.parallelBranches"] = 1; running.clear();
  const rel2 = M.startParallelBranchJobs({ runRequest, request: { prompt: "q" }, chatContext: {}, branchPlan: { groupId: "g2" }, parallel: { ...parallel, batchId: "batch-0002" }, ownerId: "native-chat:x", output2: out });
  await sleep(5); assert.equal(running.size, 0, "serial when limit=1");
  // queued job cancelled before start resolves as canceled variant
  const jq = M.takeParallelBranchJob({ batchId: "batch-0002", modelIdentifier: "v/b" });
  const ctsQ = new CTS(); const pq = M.attachParallelBranchJob(jq, { id: "real-qb" }, rec().stream, ctsQ.token, branchStore, out);
  // attached queued job starts as soon as the foreground releases its slot
  rel2(); await sleep(5); assert.ok(running.has("b"), "attached queued job started after release");
  ctsQ.cancel(); const rq = await pq; assert.equal(rq.metadata.canceled, true);
  M.cancelParallelBranchesCommand(undefined, true, out); await sleep(10);
  console.log("ORCHESTRATION TESTS PASSED");
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
