// node --test scripts/test-cursor-parity.mjs
// 覆盖 Cursor 对齐的几项新功能的纯逻辑：AI 改动审查（ai-review）、代码库检索（codebase-index）、编辑器内 AI 的输出清理（inline-ai）。
// ai-review / inline-ai 在打包后才有 require("vscode")，这里把源码转成 CJS 并注入一个最小的 vscode 替身来测。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { CodebaseIndex, tokenize, formatCodebaseSearch } from "../recovered/esm/000-extension.js/codebase-index.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ext = path.join(here, "..", "recovered", "esm", "000-extension.js");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oc-parity-"));

class Emitter { constructor() { this.l = []; } get event() { return (f) => { this.l.push(f); return { dispose() {} }; }; } fire(x) { for (const f of this.l) f(x); } dispose() {} }
const vscodeStub = {
  EventEmitter: Emitter,
  Uri: { file: (p) => ({ scheme: "file", fsPath: p, path: p }), from: (o) => ({ ...o }), parse: (s) => ({ fsPath: s }) },
  workspace: { registerTextDocumentContentProvider: (_s, p) => { vscodeStub.__provider = p; return { dispose() {} }; }, onDidSaveTextDocument: () => ({ dispose() {} }) },
  scm: { createSourceControl: () => ({ inputBox: {}, dispose() {}, createResourceGroup: () => ({ resourceStates: [], dispose() {} }) }) },
  commands: { registerCommand: () => ({ dispose() {} }), executeCommand: async () => {} },
  window: { showWarningMessage: async () => "全部回退", showInformationMessage() {}, showErrorMessage() {} },
  ThemeIcon: class {}, QuickPickItemKind: { Separator: -1 }
};

function loadCjs(file, exportsList) {
  const src = fs.readFileSync(path.join(ext, file), "utf8")
    .replace(/^import \{ __toESM \} from "\.\/module-0000\.mjs";$/m, "const __toESM = (m) => m;")
    .replace(/^import \{([^}]*)\} from "\.\/[^"]+";$/gm, "const {$1} = {};")
    .replace(/^export /gm, "");
  const out = path.join(tmp, file.replace(/\.mjs$/, ".cjs"));
  fs.writeFileSync(out, `${src}\nmodule.exports = { ${exportsList.join(", ")} };\n`);
  const origResolve = Module._resolveFilename;
  const origLoad = Module._load;
  Module._load = function (request, ...rest) { return request === "vscode" ? vscodeStub : origLoad.call(this, request, ...rest); };
  try { return createRequire(import.meta.url)(out); } finally { Module._load = origLoad; Module._resolveFilename = origResolve; }
}

test("ai-review: patch targets, baseline, no-op drop, revert, reload, revert all", async () => {
  const { AiEditReview, reviewTargetPaths, isReviewedWriteTool } = loadCjs("ai-review.mjs", ["AiEditReview", "reviewTargetPaths", "isReviewedWriteTool"]);
  assert.equal(isReviewedWriteTool("apply_patch"), true);
  assert.equal(isReviewedWriteTool("run_command"), false);
  const targets = reviewTargetPaths("apply_patch", { patch: "*** Begin Patch\n*** Update File: a.txt\n*** Add File: b.txt\n*** End Patch" });
  assert.deepEqual(targets, ["a.txt", "b.txt"]);
  const root = path.join(tmp, "ws");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, "a.txt"), "one\n");
  const storeDir = path.join(tmp, "review-store");
  const review = new AiEditReview({ subscriptions: [] }, { roots: () => [root], storeDir });
  review.captureBefore(targets, { label: "test" });
  fs.writeFileSync(path.join(root, "a.txt"), "two\n");
  fs.writeFileSync(path.join(root, "b.txt"), "new\n");
  await review.afterEdit(targets);
  assert.equal(review.scm.count, 2);
  assert.equal(vscodeStub.__provider.provideTextDocumentContent(review.baseUri(path.join(root, "a.txt"))), "one\n");
  review.captureBefore(["c.txt"]);
  await review.afterEdit(["c.txt"]);
  assert.equal(review.scm.count, 2, "a write that changed nothing must not appear");
  await review.revertFile(path.join(root, "a.txt"));
  assert.equal(fs.readFileSync(path.join(root, "a.txt"), "utf8"), "one\n");
  assert.equal(review.scm.count, 1);
  await new Promise((r) => setTimeout(r, 400));
  const reloaded = new AiEditReview({ subscriptions: [] }, { roots: () => [root], storeDir });
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(reloaded.scm.count, 1, "baselines survive a restart");
  await reloaded.revertAll();
  assert.equal(fs.existsSync(path.join(root, "b.txt")), false, "reverting a created file deletes it");
  assert.equal(reloaded.scm.count, 0);
});

test("codebase-index: tokenizer splits identifiers and CJK", () => {
  const t = tokenize("handleToolCall shadow_checkpoint 任务卡");
  for (const want of ["handletoolcall", "handle", "tool", "call", "shadow", "checkpoint", "任务", "务卡"]) assert.ok(t.includes(want), want);
});

test("codebase-index: ranks definitions, scopes by path, updates incrementally", async () => {
  const root = path.join(tmp, "repo");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.mkdirSync(path.join(root, "node_modules", "x"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "render.ts"), "export function renderTaskCard(task) {\n  return `<div>${task.title}</div>`;\n}\n");
  fs.writeFileSync(path.join(root, "src", "other.ts"), "const unrelated = 1;\n// mentions task once\n");
  fs.writeFileSync(path.join(root, "node_modules", "x", "index.js"), "function renderTaskCard() {}\n");
  const index = new CodebaseIndex();
  let out = await index.search(root, { query: "render task card" });
  assert.equal(out.results[0].rel, "src/render.ts");
  assert.ok(!out.results.some((r) => r.rel.includes("node_modules")));
  assert.match(formatCodebaseSearch(out, root), /src\/render\.ts:1-/);
  out = await index.search(root, { query: "unrelated", path: "src/other" });
  assert.deepEqual(out.results.map((r) => r.rel), ["src/other.ts"]);
  await new Promise((r) => setTimeout(r, 20));
  fs.writeFileSync(path.join(root, "src", "other.ts"), "export function freshlyAddedHelper() {}\n");
  out = await index.search(root, { query: "freshlyAddedHelper" });
  assert.equal(out.results[0]?.rel, "src/other.ts", "edited files are re-indexed on the next search");
});

test("inline-ai: strips fences and text that repeats the suffix", () => {
  const { stripFences, trimAgainstSuffix } = loadCjs("inline-ai.mjs", ["stripFences", "trimAgainstSuffix"]);
  assert.equal(stripFences("```js\nfoo()\n```"), "foo()");
  assert.equal(trimAgainstSuffix("a = 1;\n  return a;\n}\nmore", "\n  return a;\n}"), "a = 1;");
  assert.equal(trimAgainstSuffix("x + y)", ")"), "x + y");
});

test("chat-mentions: parses @codebase, @git, @problems and @file mentions", () => {
  const { parseChatMentions } = loadCjs("chat-mentions.mjs", ["parseChatMentions"]);
  let r = parseChatMentions("@codebase 任务卡在哪里渲染？");
  assert.deepEqual([...r.kinds], ["codebase"]);
  assert.equal(r.query, "任务卡在哪里渲染？");
  r = parseChatMentions("看下 @git 的改动，还有 @src/app.ts 和 @README.md。");
  assert.deepEqual([...r.kinds], ["git"]);
  assert.deepEqual(r.files, ["src/app.ts", "README.md"]);
  r = parseChatMentions("mail a@b.com about #changes and #errors");
  assert.deepEqual([...r.kinds].sort(), ["git", "problems"]);
  assert.deepEqual(r.files, [], "an email address is not a file mention");
  assert.equal(parseChatMentions("@opencode hello").kinds.size, 0);
});

test("usage-ledger: records, reads back by window and summarizes per model", () => {
  const { recordUsage, readUsage, summarizeUsage, usageReportMarkdown } = loadCjs("usage-ledger.mjs", ["recordUsage", "readUsage", "summarizeUsage", "usageReportMarkdown"]);
  const dir = path.join(tmp, "usage");
  const now = new Date("2026-11-17T12:00:00Z");
  recordUsage({ models: ["gpt-x"], input: 1000, output: 200, cacheRead: 50 }, { dir, now: () => now });
  recordUsage({ models: ["gpt-x"], input: 10, output: 5 }, { dir, now: () => now });
  recordUsage({ model: "claude-y", input: 300, output: 30 }, { dir, now: () => new Date("2026-10-30T12:00:00Z") });
  const today = summarizeUsage(readUsage(1, { dir, now: () => now }));
  assert.equal(today.total.turns, 2);
  assert.equal(today.models[0].model, "gpt-x");
  assert.equal(today.models[0].tokens, 1265);
  const month = summarizeUsage(readUsage(30, { dir, now: () => now }));
  assert.equal(month.total.turns, 3, "reads across the month boundary");
  assert.match(usageReportMarkdown({ dir, now: () => now }), /claude-y/);
});

test("ai-code-review: parses model findings and maps changed lines", () => {
  const { parseFindings, changedLines } = loadCjs("ai-code-review.mjs", ["parseFindings", "changedLines"]);
  const f = parseFindings("结果如下\n```json\n[{\"file\":\"b/src/a.ts\",\"line\":3,\"severity\":\"error\",\"message\":\"空指针\"},{\"bad\":1}]\n```");
  assert.deepEqual(f, [{ file: "src/a.ts", line: 3, severity: "error", message: "空指针", suggestion: "" }]);
  assert.deepEqual(parseFindings("没有问题"), []);
  const diff = "diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1,3 +1,4 @@\n line1\n-old\n+new2\n+new3\n line4\n";
  assert.deepEqual([...changedLines(diff).get("src/a.ts")], [2, 3]);
});
test("crash-report: redacts home and secrets, records daily jsonl, builds diagnostics bundle", () => {
  const { redact, recordCrash, readRecentCrashes, buildDiagnosticsText, findBuildLog } = loadCjs("crash-report.mjs", ["redact", "recordCrash", "readRecentCrashes", "buildDiagnosticsText", "findBuildLog"]);
  const home = "C:\\Users\\bob";
  const r = redact("at C:\\Users\\bob\\a.js and /c/Users/bob/b key=sk-abcdefghijk12345 Authorization: Bearer abc.def.ghijklmnop ghp_aaaaaaaaaaaaaaaa1234 https://h/mcp/a48b9bc0c4563479a5b1ca64f3e2ac27?token=zzz", home);
  assert(!/bob|sk-abc|ghp_|a48b9bc0|zzz|ghijklmnop/.test(r), r);
  assert.match(r, /~\\a\.js/);
  const dir = path.join(tmp, "crash");
  const now = new Date(2026, 10, 17, 21, 0, 0);
  const err = new Error("boom api_key=SECRET123456"); err.stack = "Error: boom\n    at f (C:\\Users\\x\\ext.js:1:1)";
  recordCrash("command", err, { command: "opencode.demo" }, { dir, now: () => now });
  recordCrash("command", err, { command: "opencode.demo" }, { dir, now: () => now });
  recordCrash("unhandledRejection", "plain reason", {}, { dir, now: () => new Date(2026, 10, 16, 9, 0, 0) });
  assert(fs.existsSync(path.join(dir, "2026-11-17.jsonl")));
  const rows = readRecentCrashes(7, { dir, now: () => now });
  assert.equal(rows.length, 2, "duplicate within 5s is dropped; previous day is read");
  assert.equal(rows[1].command, "opencode.demo");
  assert(!JSON.stringify(rows).includes("SECRET123456"));
  const repo = path.join(tmp, "repo"); fs.mkdirSync(path.join(repo, "opencode", "resources", "app"), { recursive: true });
  fs.writeFileSync(path.join(repo, "hark_build_x.log"), Array.from({ length: 100 }, (_, i) => "line " + i).join("\n"));
  const log = findBuildLog(path.join(repo, "opencode", "resources", "app"), 5);
  assert.match(log.tail, /line 99/); assert(!log.tail.includes("line 90"));
  const text = buildDiagnosticsText({ now, entries: rows, extensionVersion: "0.13.3", vscodeVersion: "1.132.0", os: "Windows_NT", buildLog: log, home });
  assert.match(text, /0\.13\.3/); assert.match(text, /1\.132\.0/); assert.match(text, /opencode\.demo/); assert.match(text, /line 99/);
});

test("auto-update: version compare, source kinds, latest.json and GitHub release parsing", () => {
  const { compareVersions, parseVersion, classifySource, parseLatestJson, parseGithubRelease, shouldAutoCheck, releaseNotesMarkdown } = loadCjs("auto-update.mjs", ["compareVersions", "parseVersion", "classifySource", "parseLatestJson", "parseGithubRelease", "shouldAutoCheck", "releaseNotesMarkdown"]);
  assert.equal(compareVersions("0.13.3", "0.13.10"), -1);
  assert.equal(compareVersions("v1.0.0", "1.0.0-beta.2"), 1);
  assert.equal(compareVersions("1.0.0-beta.2", "1.0.0-beta.10"), -1);
  assert.equal(compareVersions("1.2", "1.2.0"), 0);
  assert.equal(compareVersions("0.14.0", ""), 1);
  assert.equal(parseVersion("latest"), null);
  assert.deepEqual(classifySource(""), { kind: "none" });
  assert.deepEqual(classifySource("owner/name"), { kind: "github", repo: "owner/name" });
  assert.deepEqual(classifySource("https://github.com/owner/name.git"), { kind: "github", repo: "owner/name" });
  assert.equal(classifySource("\\\\server\\share\\opencode").kind, "folder");
  assert.equal(classifySource("E:\\releases").kind, "folder");
  const l = parseLatestJson("\uFEFF{\"version\":\"v0.14.0\",\"notes\":\"修复\",\"path\":\"OpenCode-0.14.0.exe\"}", path.join(tmp, "rel"));
  assert.equal(l.version, "0.14.0"); assert.equal(l.path, path.join(tmp, "rel", "OpenCode-0.14.0.exe")); assert.equal(l.url, "");
  assert.equal(parseLatestJson({ version: "1.0.0", url: "https://example.invalid/a.zip" }).url, "https://example.invalid/a.zip");
  assert.throws(() => parseLatestJson("{\"version\":\"x\",\"url\":\"https://e/a\"}"), /version/);
  assert.throws(() => parseLatestJson("{\"version\":\"1.0.0\"}"), /url 或 path/);
  assert.throws(() => parseLatestJson("not json"), /JSON/);
  const g = parseGithubRelease({ tag_name: "v0.15.1", body: "notes", html_url: "https://github.com/o/n/releases/tag/v0.15.1", assets: [{ name: "src.tar.gz", browser_download_url: "https://e/src.tar.gz" }, { name: "OpenCode-Setup.exe", browser_download_url: "https://e/OpenCode-Setup.exe" }] });
  assert.equal(g.version, "0.15.1"); assert.equal(g.url, "https://e/OpenCode-Setup.exe");
  assert.equal(shouldAutoCheck("", new Date()), true);
  assert.equal(shouldAutoCheck(new Date(2026, 10, 17, 8).toISOString(), new Date(2026, 10, 17, 20)), false);
  assert.equal(shouldAutoCheck(new Date(2026, 10, 16, 23).toISOString(), new Date(2026, 10, 17, 0, 30)), true);
  assert.match(releaseNotesMarkdown(l, "0.13.3"), /npm run rollback/);
});

test("cloud-agent: remote parsing, branch naming, dispatch request, run status, embedded templates", () => {
  const ca = loadCjs("cloud-agent.mjs", ["parseGitRemote", "parseRepoSetting", "agentBranchName", "newRunId", "sanitizeRunId", "buildDispatchRequest", "buildRunsQuery", "parseRunStatus", "pickPullRequest", "githubApiBase", "CLOUD_WORKFLOW_TEMPLATE", "CLOUD_RUNNER_SOURCE", "CLOUD_WORKFLOW_PATH", "CLOUD_RUNNER_PATH"]);
  // remote URL parsing (generic: any owner/repo)
  assert.deepEqual(ca.parseGitRemote("git@github.com:Octo/Hello-World.git"), { host: "github.com", owner: "Octo", repo: "Hello-World", fullName: "Octo/Hello-World" });
  assert.equal(ca.parseGitRemote("https://github.com/o/r").fullName, "o/r");
  assert.equal(ca.parseGitRemote("https://user:tok@github.com/o/r.git/").fullName, "o/r");
  assert.equal(ca.parseGitRemote("ssh://git@github.com/o/r.git").fullName, "o/r");
  assert.equal(ca.parseGitRemote("git@ghe.corp.example:team/x.git").host, "ghe.corp.example");
  assert.equal(ca.parseGitRemote("E:/repo"), null);
  assert.equal(ca.parseGitRemote("https://github.com/onlyowner"), null);
  assert.equal(ca.parseGitRemote(""), null);
  assert.equal(ca.parseRepoSetting("acme/widgets").fullName, "acme/widgets");
  assert.equal(ca.githubApiBase("github.com"), "https://api.github.com");
  assert.equal(ca.githubApiBase("ghe.corp.example"), "https://ghe.corp.example/api/v3");
  // branch naming
  assert.equal(ca.agentBranchName("20261117-235900-AB12"), "opencode/agent-20261117-235900-ab12");
  assert.equal(ca.agentBranchName("a b/../c"), "opencode/agent-a-b-..-c");
  assert.throws(() => ca.agentBranchName("  "), /run_id/);
  const id = ca.newRunId(new Date(2026, 10, 17, 23, 59, 7), () => 0.5);
  assert.match(id, /^20261117-235907-[a-z0-9]{4}$/);
  assert.equal(ca.sanitizeRunId(id), id);
  // dispatch request assembly
  const req = ca.buildDispatchRequest({ owner: "o", repo: "r", task: "  fix the bug  ", base: "dev", model: "gpt-x", runId: "r1" });
  assert.equal(req.method, "POST");
  assert.equal(req.path, "/repos/o/r/actions/workflows/opencode-agent.yml/dispatches");
  assert.deepEqual(req.body, { ref: "dev", inputs: { task: "fix the bug", base: "dev", model: "gpt-x", run_id: "r1", secret_name: "OPENCODE_API_KEY" } });
  assert.equal(req.branch, "opencode/agent-r1");
  assert.equal(ca.buildDispatchRequest({ owner: "o", repo: "r", task: "t", base: "main", runId: "r2", secretName: "MY_KEY" }).body.inputs.secret_name, "MY_KEY");
  for (const v of Object.values(req.body.inputs)) assert.equal(typeof v, "string");
  assert.throws(() => ca.buildDispatchRequest({ owner: "o", repo: "r", task: " ", base: "main", runId: "x" }), /任务/);
  assert.throws(() => ca.buildDispatchRequest({ owner: "o", repo: "r", task: "t", base: "", runId: "x" }), /分支/);
  assert.throws(() => ca.buildDispatchRequest({ owner: "o", repo: "r", task: "t", base: "main", runId: "x", secretName: "bad-name" }), /Secret/);
  const q = ca.buildRunsQuery({ owner: "o", repo: "r", createdAfter: "2026-11-17T10:00:00.000Z" });
  assert.match(q, /^\/repos\/o\/r\/actions\/workflows\/opencode-agent\.yml\/runs\?/);
  assert.equal(new URLSearchParams(q.split("?")[1]).get("created"), ">=2026-11-17T09:58:00Z");
  // run status parsing
  const runs = (status, conclusion, title = "opencode-agent r1") => ({ workflow_runs: [{ id: 9, display_title: "opencode-agent other", status: "completed", conclusion: "failure" }, { id: 7, display_title: title, status, conclusion, html_url: "https://github.com/o/r/actions/runs/7" }] });
  assert.deepEqual({ ...ca.parseRunStatus({ workflow_runs: [] }, { runId: "r1" }) }, { found: false, state: "pending", done: false, label: "等待启动" });
  assert.equal(ca.parseRunStatus(runs("queued", null), { runId: "r1" }).state, "queued");
  const running = ca.parseRunStatus(runs("in_progress", null), { runId: "r1" });
  assert.equal(running.state, "running"); assert.equal(running.done, false); assert.equal(running.id, 7);
  const ok = ca.parseRunStatus(runs("completed", "success"), { runId: "r1" });
  assert.equal(ok.state, "success"); assert.equal(ok.done, true); assert.equal(ok.htmlUrl, "https://github.com/o/r/actions/runs/7");
  assert.equal(ca.parseRunStatus(runs("completed", "failure"), { runId: "r1" }).state, "failure");
  assert.equal(ca.parseRunStatus(runs("completed", "cancelled"), { runId: "r1" }).state, "cancelled");
  assert.equal(ca.parseRunStatus(runs("completed", "success", "opencode-agent r10"), { runId: "r1" }).found, false);
  assert.equal(ca.pickPullRequest([{ state: "closed", html_url: "a" }, { state: "open", html_url: "b" }]).html_url, "b");
  assert.equal(ca.pickPullRequest([]), null);
  // embedded templates match the canonical files and stay generic / safe
  const norm = (s) => String(s).replace(/\r\n/g, "\n");
  assert.equal(norm(ca.CLOUD_RUNNER_SOURCE), norm(fs.readFileSync(path.join(here, "cloud-agent-runner.mjs"), "utf8")));
  assert.equal(norm(ca.CLOUD_WORKFLOW_TEMPLATE), norm(fs.readFileSync(path.join(here, "opencode-agent.yml"), "utf8")));
  const wf = ca.CLOUD_WORKFLOW_TEMPLATE;
  for (const input of ["task:", "base:", "model:", "run_id:", "secret_name:"]) assert.ok(wf.includes(`      ${input}`), input);
  assert.match(wf, /run-name: "opencode-agent \$\{\{ inputs\.run_id \}\}"/);
  assert.match(wf, /gh pr create --draft/);
  assert.match(wf, /secrets\[inputs\.secret_name \|\| 'OPENCODE_API_KEY'\]/);
  assert.ok(wf.includes(ca.CLOUD_RUNNER_PATH));
  assert.doesNotMatch(wf, /echo[^\n]*OPENCODE_API_KEY/);
  assert.doesNotMatch(wf, /gh pr merge|--auto/);
  assert.ok(!/OpenCode-Source-Recovery|alexander/i.test(wf + ca.CLOUD_RUNNER_SOURCE));
});

test("cloud-agent runner: tool loop against a fake OpenAI-compatible server, key never leaks", async () => {
  const { spawn, execFileSync } = await import("node:child_process");
  const http = await import("node:http");
  const repo = fs.mkdtempSync(path.join(tmp, "cloud-repo-"));
  fs.writeFileSync(path.join(repo, "a.txt"), "hello\n");
  try { execFileSync("git", ["init", "-q"], { cwd: repo }); } catch {}
  let n = 0; const seen = [];
  const server = http.createServer((q, s) => { let b = ""; q.on("data", (d) => (b += d)); q.on("end", () => {
    n++; const body = JSON.parse(b); seen.push(body);
    const msg = n === 1
      ? { role: "assistant", content: null, tool_calls: [
          { id: "1", type: "function", function: { name: "write_file", arguments: JSON.stringify({ path: "b.txt", content: "new\n" }) } },
          { id: "2", type: "function", function: { name: "run_command", arguments: JSON.stringify({ command: "echo key=$OPENCODE_API_KEY" }) } },
          { id: "3", type: "function", function: { name: "read_file", arguments: JSON.stringify({ path: "../outside.txt" }) } }] }
      : { role: "assistant", content: "Done." };
    s.setHeader("content-type", "application/json"); s.end(JSON.stringify({ choices: [{ message: msg }] }));
  }); });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const out = path.join(tmp, "cloud-out");
  const key = "sk-test-SECRET-123456";
  const child = spawn(process.execPath, [path.join(here, "cloud-agent-runner.mjs")], { cwd: repo, env: { ...process.env, OPENCODE_TASK: "add b", OPENCODE_API_KEY: key, OPENCODE_API_BASE: `http://127.0.0.1:${server.address().port}/v1`, OPENCODE_OUT_DIR: out, OPENCODE_MAX_STEPS: "5" } });
  let stdout = ""; child.stdout.on("data", (d) => (stdout += d)); child.stderr.on("data", (d) => (stdout += d));
  const code = await new Promise((r) => child.on("close", r));
  server.close();
  assert.equal(code, 0, stdout);
  assert.equal(fs.readFileSync(path.join(repo, "b.txt"), "utf8"), "new\n");
  assert.deepEqual(seen[0].tools.map((t) => t.function.name), ["read_file", "write_file", "list_files", "search", "run_command"]);
  const toolMsgs = seen[1].messages.filter((m) => m.role === "tool").map((m) => m.content);
  assert.match(toolMsgs[1], /key=\s*$/m);
  assert.match(toolMsgs[2], /outside repository/);
  const summary = fs.readFileSync(path.join(out, "summary.md"), "utf8");
  assert.match(summary, /Stop reason: completed/); assert.match(summary, /Done\./);
  for (const f of fs.readdirSync(out)) assert.ok(!fs.readFileSync(path.join(out, f), "utf8").includes(key), f);
  assert.ok(!stdout.includes(key));
});
