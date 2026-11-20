// ai-code-review-step01: AI 审查代码改动（像 Cursor 的 Bugbot / PR 审查，在本地跑）。
// 命令「OpenCode：AI 审查改动」：选范围（未提交改动 / 当前分支相对某分支 / 最近一次提交），
// 把 git diff 交给 OpenCode 已配置的模型（vscode.lm），结果作为「AI 审查」诊断标在对应行上（问题面板可见），
// 并打开一份 Markdown 报告。只读，不改代码。
import { __toESM } from "./module-0000.mjs";
var vscodeR = __toESM(require("vscode"));
var cpR = __toESM(require("node:child_process"));
var pathR = __toESM(require("node:path"));

const MAX_DIFF = 120000;

function git(root, args) {
  return new Promise((resolve, reject) => cpR.execFile("git", args, { cwd: root, maxBuffer: 64 * 1024 * 1024, timeout: 30e3, windowsHide: true }, (error, stdout, stderr) => (error ? reject(new Error(String(stderr || error.message).trim())) : resolve(String(stdout)))));
}

/** Parse the model's reply: a JSON array of findings, possibly wrapped in a fence or prose. */
export function parseFindings(text) {
  const raw = String(text ?? "");
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(raw);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf("["), end = body.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  let list;
  try { list = JSON.parse(body.slice(start, end + 1)); } catch { return []; }
  if (!Array.isArray(list)) return [];
  return list.filter((f) => f && typeof f === "object" && typeof f.file === "string" && typeof f.message === "string").map((f) => ({
    file: f.file.replace(/^[ab]\//, "").replace(/\\/g, "/"),
    line: Number.isInteger(f.line) && f.line > 0 ? f.line : 1,
    severity: ["error", "warning", "info"].includes(f.severity) ? f.severity : "warning",
    message: String(f.message).slice(0, 1000),
    suggestion: typeof f.suggestion === "string" ? f.suggestion.slice(0, 2000) : ""
  })).slice(0, 100);
}

/** Lines that were added in the diff, per file (new-file line numbers), so findings can be kept to changed code. */
export function changedLines(diff) {
  const map = new Map();
  let file, line = 0;
  for (const l of String(diff).split("\n")) {
    if (l.startsWith("+++ ")) { file = l.slice(4).replace(/^b\//, "").trim(); if (file === "/dev/null") file = void 0; continue; }
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(l);
    if (h) { line = Number(h[1]); continue; }
    if (!file || l.startsWith("--- ")) continue;
    if (l.startsWith("+")) { (map.get(file) || map.set(file, new Set()).get(file)).add(line); line++; }
    else if (l.startsWith("-")) continue;
    else line++;
  }
  return map;
}

class AiCodeReview {
  constructor(options = {}) {
    this.log = options.log || (() => {});
    this.diagnostics = vscodeR.languages.createDiagnosticCollection("AI 审查");
    vscodeR.commands.registerCommand("opencode.aiCodeReview.run", () => this.run());
    vscodeR.commands.registerCommand("opencode.aiCodeReview.clear", () => this.diagnostics.clear());
  }
  root() {
    const editor = vscodeR.window.activeTextEditor;
    const folder = (editor && vscodeR.workspace.getWorkspaceFolder(editor.document.uri)) || vscodeR.workspace.workspaceFolders?.[0];
    return folder?.uri.fsPath;
  }
  async model() {
    let pref;
    try { pref = JSON.parse(require("node:fs").readFileSync(pathR.join(require("node:os").homedir(), ".opencode", "inline-ai.json"), "utf8")).editModel; } catch {}
    const groups = await Promise.allSettled(["opencode", "opencode-codex"].map((vendor) => vscodeR.lm.selectChatModels({ vendor })));
    const all = groups.flatMap((g) => (g.status === "fulfilled" ? g.value : []));
    return all.find((m) => pref && (m.id === pref || m.name === pref)) || all[0];
  }
  async run() {
    const root = this.root();
    if (!root) { void vscodeR.window.showWarningMessage("先打开一个 git 仓库文件夹。"); return; }
    let branch = "";
    try { branch = (await git(root, ["rev-parse", "--abbrev-ref", "HEAD"])).trim(); } catch (error) { void vscodeR.window.showWarningMessage(`这里不是 git 仓库：${error.message}`); return; }
    const scope = await vscodeR.window.showQuickPick([
      { label: "未提交的改动", description: "工作区 + 暂存区相对 HEAD", id: "working" },
      { label: "当前分支相对某个分支（PR 审查）", description: `${branch} 相对 main / master / 你选的分支`, id: "branch" },
      { label: "最近一次提交", description: "HEAD~1..HEAD", id: "last" }
    ], { title: "AI 审查哪些改动？" });
    if (!scope) return;
    let args;
    if (scope.id === "working") args = ["diff", "HEAD", "--unified=3"];
    else if (scope.id === "last") args = ["diff", "HEAD~1", "HEAD", "--unified=3"];
    else {
      const refs = (await git(root, ["for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes"]).catch(() => "")).split("\n").map((s) => s.trim()).filter((s) => s && s !== branch && !s.endsWith("/HEAD"));
      const preferred = ["main", "master", "origin/main", "origin/master", "develop"].filter((r) => refs.includes(r));
      const base = await vscodeR.window.showQuickPick([...preferred, ...refs.filter((r) => !preferred.includes(r))].slice(0, 200), { title: `${branch} 相对哪个分支？` });
      if (!base) return;
      args = ["diff", `${base}...HEAD`, "--unified=3"];
    }
    let diff;
    try { diff = await git(root, args); } catch (error) { void vscodeR.window.showErrorMessage(`读取改动失败：${error.message}`); return; }
    if (!diff.trim()) { void vscodeR.window.showInformationMessage("没有需要审查的改动。"); return; }
    const model = await this.model();
    if (!model) { void vscodeR.window.showWarningMessage("还没有可用的模型：先在 OpenCode 里配置模型。"); return; }
    const truncated = diff.length > MAX_DIFF;
    const prompt = [
      "You are a senior code reviewer. Review the git diff below and report only real problems in the CHANGED lines: bugs, crashes, wrong logic, security issues, data loss, race conditions, broken error handling, obvious performance traps. Skip style nits and praise.",
      "Reply with ONLY a JSON array (no prose). Each item: {\"file\": path as in the diff (no a/ or b/ prefix), \"line\": line number in the NEW file, \"severity\": \"error\"|\"warning\"|\"info\", \"message\": short explanation in Simplified Chinese, \"suggestion\": optional fix}. Reply [] when you find nothing.",
      truncated ? `The diff was truncated to the first ${MAX_DIFF} characters.` : "",
      "<DIFF>",
      truncated ? diff.slice(0, MAX_DIFF) : diff,
      "</DIFF>"
    ].join("\n");
    let reply = "";
    const ok = await vscodeR.window.withProgress({ location: vscodeR.ProgressLocation.Notification, title: `AI 正在审查 ${scope.label}（${model.name || model.id}）…`, cancellable: true }, async (_p, token) => {
      try {
        const res = await model.sendRequest([vscodeR.LanguageModelChatMessage.User(prompt)], { justification: "OpenCode AI 代码审查" }, token);
        for await (const part of res.text) reply += part;
        return !token.isCancellationRequested;
      } catch (error) {
        void vscodeR.window.showErrorMessage(`AI 审查失败：${error?.message ?? error}`);
        return false;
      }
    });
    if (!ok) return;
    const findings = parseFindings(reply);
    const changed = changedLines(diff);
    this.diagnostics.clear();
    const byFile = new Map();
    for (const f of findings) {
      const uri = vscodeR.Uri.file(pathR.join(root, f.file));
      const range = new vscodeR.Range(f.line - 1, 0, f.line - 1, 1e4);
      const d = new vscodeR.Diagnostic(range, f.suggestion ? `${f.message}\n建议：${f.suggestion}` : f.message, f.severity === "error" ? vscodeR.DiagnosticSeverity.Error : f.severity === "info" ? vscodeR.DiagnosticSeverity.Information : vscodeR.DiagnosticSeverity.Warning);
      d.source = "AI 审查";
      (byFile.get(uri.toString()) || byFile.set(uri.toString(), { uri, list: [] }).get(uri.toString())).list.push(d);
    }
    for (const { uri, list } of byFile.values()) this.diagnostics.set(uri, list);
    const label = { error: "错误", warning: "警告", info: "提示" };
    const md = [
      `# AI 审查：${scope.label}`, "",
      `分支 ${branch} · 模型 ${model.name || model.id} · ${findings.length} 个问题${truncated ? " · 改动过长，只审查了前一部分" : ""}`, "",
      ...(findings.length ? findings.map((f, i) => `${i + 1}. **${label[f.severity]}** \`${f.file}:${f.line}\`${changed.get(f.file)?.has(f.line) ? "" : "（不在改动行上）"}\n   ${f.message}${f.suggestion ? `\n   建议：${f.suggestion}` : ""}`) : ["没有发现明显问题。"]),
      "", "问题也标在了对应代码行上（「问题」面板里来源为「AI 审查」）；命令「OpenCode：清除 AI 审查标记」可清掉。"
    ].join("\n");
    const doc = await vscodeR.workspace.openTextDocument({ language: "markdown", content: md });
    await vscodeR.commands.executeCommand("markdown.showPreview", doc.uri).then(void 0, () => vscodeR.window.showTextDocument(doc));
  }
}

export function activateAiCodeReview(options = {}) {
  if (globalThis.__ocAiCodeReview) return globalThis.__ocAiCodeReview;
  globalThis.__ocAiCodeReview = new AiCodeReview(options);
  return globalThis.__ocAiCodeReview;
}
