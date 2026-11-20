// chat-mentions-step01: 对话里的 @ 引用，像 Cursor 的 @Codebase / @Git / @文件。
// 在原生对话的消息里写 @codebase（或 #codebase）、@git、@problems、@文件名.ext，发送前把对应上下文附到本轮用户消息：
//   @codebase  → 用代码库索引按本条消息检索，附上最相关的代码片段
//   @git / @changes / @diff → 当前工作区 git status 与未提交改动（截断）
//   @problems / @errors     → 编辑器里的错误与警告
//   @某文件名（含扩展名，可带路径）→ 找到该文件并附上内容（截断）
// 只读，不改系统提示；附加内容放进本轮用户消息。
import { __toESM } from "./module-0000.mjs";
import { CodebaseIndex } from "./codebase-index.mjs";
var vscodeM = __toESM(require("vscode"));
var pathM = __toESM(require("node:path"));
var fsM = __toESM(require("node:fs"));
var cpM = __toESM(require("node:child_process"));

const KEYWORD = /(?:^|[\s(（,，])[@#](codebase|git|changes|diff|problems|errors)(?=$|[\s,，.。:：;；!?！？)）])/gi;
const FILE_MENTION = /(?:^|[\s(（,，])@((?:[\w.\-\u3400-\u9fff]+[\\/])*[\w.\-\u3400-\u9fff]+\.[A-Za-z0-9]{1,10})(?=$|[\s,，。:：;；!?！？)）])/g;
const MAX_FILE_CHARS = 20000;
const MAX_TOTAL_CHARS = 60000;

export function sharedCodebaseIndex() {
  globalThis.__ocCodebaseIndex ??= new CodebaseIndex();
  return globalThis.__ocCodebaseIndex;
}

export function parseChatMentions(prompt) {
  const text = String(prompt ?? "");
  const kinds = new Set();
  for (const m of text.matchAll(KEYWORD)) {
    const k = m[1].toLowerCase();
    kinds.add(k === "changes" || k === "diff" ? "git" : k === "errors" ? "problems" : k);
  }
  const files = [];
  for (const m of text.matchAll(FILE_MENTION)) if (!files.includes(m[1])) files.push(m[1]);
  const query = text.replace(KEYWORD, " ").replace(FILE_MENTION, " ").replace(/\s+/g, " ").trim();
  return { kinds, files: files.slice(0, 5), query };
}

function git(root, args) {
  return new Promise((resolve) => cpM.execFile("git", args, { cwd: root, maxBuffer: 32 * 1024 * 1024, timeout: 20e3, windowsHide: true }, (error, stdout) => resolve(error ? "" : String(stdout))));
}

function clip(text, max) {
  return text.length > max ? `${text.slice(0, max)}\n…（已截断，共 ${text.length} 字符）` : text;
}

export async function expandChatMentions(prompt, root, options = {}) {
  const { kinds, files, query } = parseChatMentions(prompt);
  if (!kinds.size && !files.length) return "";
  const progress = options.progress || (() => {});
  const log = options.log || (() => {});
  const parts = [];
  if (kinds.has("codebase")) {
    progress("正在检索代码库（@codebase）…");
    try {
      const out = await sharedCodebaseIndex().search(root, { query: query || prompt, limit: 8 });
      const body = out.results.map((r) => `### ${r.rel}:${r.start}-${r.end}\n${r.snippet.text}`).join("\n\n");
      parts.push(`<codebase_search_results query="${(query || "").replace(/"/g, "'").slice(0, 200)}" indexed_files="${out.files}">\n${body || "（没有找到相关代码）"}\n用 read_files 读取需要的完整内容。\n</codebase_search_results>`);
    } catch (error) { log(`[mentions] codebase: ${error?.message ?? error}`); }
  }
  if (kinds.has("git")) {
    progress("正在读取 git 改动（@git）…");
    const [branch, status, diff, logText] = await Promise.all([
      git(root, ["rev-parse", "--abbrev-ref", "HEAD"]),
      git(root, ["status", "--short"]),
      git(root, ["diff", "HEAD", "--stat"]).then(async (stat) => stat + "\n" + await git(root, ["diff", "HEAD", "--unified=2"])),
      git(root, ["log", "--oneline", "-8"])
    ]);
    if (status || diff.trim() || logText) parts.push(`<git_context branch="${branch.trim()}">\n## status\n${clip(status.trim() || "（干净）", 6000)}\n## 未提交改动\n${clip(diff.trim() || "（无）", 30000)}\n## 最近提交\n${logText.trim()}\n</git_context>`);
    else parts.push("<git_context>当前工作区不是 git 仓库，或 git 不可用。</git_context>");
  }
  if (kinds.has("problems")) {
    const rows = [];
    for (const [uri, diags] of vscodeM.languages.getDiagnostics()) {
      for (const d of diags) {
        if (d.severity > vscodeM.DiagnosticSeverity.Warning) continue;
        rows.push(`${d.severity === vscodeM.DiagnosticSeverity.Error ? "错误" : "警告"} ${vscodeM.workspace.asRelativePath(uri)}:${d.range.start.line + 1}:${d.range.start.character + 1} ${String(d.message).split("\n")[0]}${d.source ? ` (${d.source})` : ""}`);
        if (rows.length >= 80) break;
      }
      if (rows.length >= 80) break;
    }
    parts.push(`<editor_problems count="${rows.length}">\n${rows.join("\n") || "（没有错误或警告）"}\n</editor_problems>`);
  }
  let total = parts.join("").length;
  for (const name of files) {
    if (total > MAX_TOTAL_CHARS) break;
    const normalized = name.replace(/\\/g, "/");
    let target;
    const direct = pathM.join(root, normalized);
    if (fsM.existsSync(direct) && fsM.statSync(direct).isFile()) target = direct;
    else {
      try {
        const found = await vscodeM.workspace.findFiles(`**/${normalized}`, "**/{node_modules,.git,dist,out,build}/**", 3);
        target = found[0]?.fsPath;
      } catch {}
    }
    if (!target) { parts.push(`<attached_file mention="@${name}">没有在工作区找到这个文件。</attached_file>`); continue; }
    try {
      const st = fsM.statSync(target);
      const rel = pathM.relative(root, target).replace(/\\/g, "/");
      if (st.size > 2 * 1024 * 1024) { parts.push(`<attached_file path="${rel}">文件太大（${st.size} 字节），只给路径，用 read_files 分段读取。</attached_file>`); continue; }
      const text = fsM.readFileSync(target, "utf8");
      const numbered = text.split(/\r?\n/).map((l, i) => `${i + 1}: ${l}`).join("\n");
      const block = `<attached_file path="${rel}">\n${clip(numbered, Math.min(MAX_FILE_CHARS, MAX_TOTAL_CHARS - total))}\n</attached_file>`;
      parts.push(block);
      total += block.length;
    } catch (error) { log(`[mentions] file ${name}: ${error?.message ?? error}`); }
  }
  if (!parts.length) return "";
  return `<opencode_mentions>\n用户在消息里用 @ 引用了以下上下文：\n${parts.join("\n\n")}\n</opencode_mentions>`;
}
