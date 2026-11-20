// crash-report-step05: 本地崩溃记录 + 诊断导出（只写本机，不联网）。
// 扩展宿主里的 uncaughtException / unhandledRejection，以及 opencode.* 命令抛出的错误，
// 脱敏后（家目录换成 ~，疑似 token/key 的串替换掉）追加到 ~/.opencode/crash/YYYY-MM-DD.jsonl。
// 命令「OpenCode：导出诊断信息」把最近的崩溃记录、扩展版本、系统、VS Code 版本和最近一次构建日志尾部
// 写成一个 .txt，保存位置由用户在保存对话框里选。
import { __toESM } from "./module-0000.mjs";
var vscodeC = __toESM(require("vscode"));
var fsC = __toESM(require("node:fs"));
var pathC = __toESM(require("node:path"));
var osC = __toESM(require("node:os"));

export const CRASH_DIR = pathC.join(osC.homedir(), ".opencode", "crash");
const MAX_PER_DAY = 200;
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function redact(text, home = osC.homedir()) {
  let s = String(text ?? "");
  if (home && home.length > 2) {
    const forms = new Set([home, home.replace(/\\/g, "/"), home.replace(/\//g, "\\"), home.replace(/\\/g, "\\\\")]);
    const m = /^([A-Za-z]):[\\/](.*)$/.exec(home);
    if (m) forms.add("/" + m[1].toLowerCase() + "/" + m[2].replace(/\\/g, "/"));
    for (const f of [...forms].sort((a, b) => b.length - a.length)) s = s.replace(new RegExp(escapeRe(f), "gi"), "~");
  }
  return s
    .replace(/\b(?:sk|pk|rk|ak)-[A-Za-z0-9_-]{8,}/g, "[REDACTED]")
    .replace(/\b(?:ghp|gho|ghu|ghs|ghr|github_pat|glpat|xox[abprs])[-_][A-Za-z0-9_-]{8,}/g, "[REDACTED]")
    .replace(/\b(?:AKIA|ASIA)[A-Z0-9]{12,}\b/g, "[REDACTED]")
    .replace(/\bAIza[A-Za-z0-9_-]{20,}/g, "[REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g, "[REDACTED_JWT]")
    .replace(/\b(Bearer|Basic|Token)\s+[A-Za-z0-9._~+/=-]{8,}/gi, "$1 [REDACTED]")
    .replace(/((?:api[_-]?key|apikey|access[_-]?key|secret[_-]?key|client[_-]?secret|auth[_-]?token|access[_-]?token|refresh[_-]?token|token|secret|password|passwd|pwd|authorization)["']?\s*[:=]\s*["']?)[^\s"',;&)}\]]+/gi, "$1[REDACTED]")
    .replace(/([?&#](?:key|api_key|apikey|token|access_token|auth|sig|signature|code)=)[^&\s"']+/gi, "$1[REDACTED]")
    .replace(/(\/\/)[^\s/:@]+:[^\s/@]+@/g, "$1[REDACTED]@")
    .replace(/\b(?=[A-Za-z0-9_-]*[0-9])(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{32,}\b/g, "[REDACTED]");
}

const pad2 = (n) => String(n).padStart(2, "0");
export function dayStamp(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

let written = { day: "", count: 0, last: "", lastAt: 0 };
export function recordCrash(kind, error, extra = {}, options = {}) {
  try {
    const at = options.now ? options.now() : new Date();
    const dir = options.dir || CRASH_DIR;
    const day = dayStamp(at);
    if (written.day !== day) written = { day, count: 0, last: "", lastAt: 0 };
    const err = error instanceof Error ? error : null;
    const message = redact(err ? err.message : (typeof error === "string" ? error : safeJson(error))).slice(0, 2000);
    const key = kind + "|" + message;
    if (key === written.last && at.getTime() - written.lastAt < 5000) return null;
    if (written.count >= MAX_PER_DAY) return null;
    written.count++; written.last = key; written.lastAt = at.getTime();
    const row = { at: at.toISOString(), kind: String(kind), name: err?.name || typeof error, message };
    if (err?.stack) row.stack = redact(String(err.stack).split("\n").slice(0, 30).join("\n")).slice(0, 6000);
    for (const [k, v] of Object.entries(extra || {})) if (v !== void 0) row[k] = redact(typeof v === "string" ? v : safeJson(v)).slice(0, 500);
    fsC.mkdirSync(dir, { recursive: true });
    fsC.appendFileSync(pathC.join(dir, day + ".jsonl"), JSON.stringify(row) + "\n");
    return row;
  } catch { return null; }
}
function safeJson(v) { try { return typeof v === "string" ? v : JSON.stringify(v) ?? String(v); } catch { return String(v); } }

export function readRecentCrashes(days = 7, options = {}) {
  const dir = options.dir || CRASH_DIR, now = options.now ? options.now() : new Date(), limit = options.limit || 50;
  const rows = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime()); d.setDate(d.getDate() - i);
    let text = "";
    try { text = fsC.readFileSync(pathC.join(dir, dayStamp(d) + ".jsonl"), "utf8"); } catch { continue; }
    for (const line of text.split(/\r?\n/)) { if (!line.trim()) continue; try { rows.push(JSON.parse(line)); } catch {} }
  }
  return rows.slice(-limit);
}

export function buildDiagnosticsText(info = {}) {
  const lines = [];
  lines.push("OpenCode 诊断信息（本地生成，已脱敏：家目录显示为 ~，疑似 token/key 已替换）");
  lines.push(`生成时间: ${(info.now || new Date()).toISOString()}`);
  lines.push(`OpenCode 扩展版本: ${info.extensionVersion || "未知"}`);
  lines.push(`VS Code 版本: ${info.vscodeVersion || "未知"}`);
  lines.push(`系统: ${info.os || "未知"}`);
  if (info.appRoot) lines.push(`程序目录: ${info.appRoot}`);
  lines.push("");
  const entries = info.entries || [];
  lines.push(`== 最近崩溃/错误记录（${entries.length} 条，来自 ~/.opencode/crash） ==`);
  if (!entries.length) lines.push("（无）");
  for (const e of entries) {
    lines.push(`[${e.at}] ${e.kind}${e.command ? " " + e.command : ""}: ${e.name || ""} ${e.message || ""}`.trimEnd());
    if (e.stack) for (const s of String(e.stack).split("\n").slice(1, 12)) lines.push("    " + s.trim());
  }
  lines.push("");
  lines.push("== 最近一次构建/更新日志（尾部） ==");
  if (info.buildLog) { lines.push(`文件: ${info.buildLog.file}`); lines.push(info.buildLog.tail); } else lines.push("（未找到）");
  return redact(lines.join("\n"), info.home) + "\n";
}

// 最近一次构建日志：程序目录在 <仓库>/opencode/resources/app，往上找仓库根里的 reports/ 和构建日志。
export function findBuildLog(appRoot, maxLines = 60) {
  try {
    const cands = [];
    let dir = appRoot ? pathC.resolve(appRoot) : "";
    for (let i = 0; dir && i < 4; i++) {
      for (const sub of ["", "reports"]) {
        const d = pathC.join(dir, sub);
        let names = [];
        try { names = fsC.readdirSync(d); } catch { continue; }
        for (const n of names) if (/(^hark_build_.*\.log$|^build.*\.log$|^update.*\.log$|^runtime-update\.json$)/i.test(n)) {
          try { const st = fsC.statSync(pathC.join(d, n)); if (st.isFile()) cands.push({ file: pathC.join(d, n), mtime: st.mtimeMs, size: st.size }); } catch {}
        }
      }
      const up = pathC.dirname(dir); if (up === dir) break; dir = up;
    }
    if (!cands.length) return null;
    cands.sort((a, b) => b.mtime - a.mtime);
    const c = cands[0];
    const fd = fsC.openSync(c.file, "r");
    try {
      const len = Math.min(c.size, 64 * 1024), buf = Buffer.alloc(len);
      fsC.readSync(fd, buf, 0, len, c.size - len);
      return { file: c.file, tail: buf.toString("utf8").split(/\r?\n/).slice(-maxLines).join("\n") };
    } finally { fsC.closeSync(fd); }
  } catch { return null; }
}

function extensionVersion() {
  try {
    const ext = vscodeC.extensions?.getExtension?.("opencode.opencode") || (vscodeC.extensions?.all || []).find((e) => e?.packageJSON?.name === "opencode");
    return ext?.packageJSON?.version || "";
  } catch { return ""; }
}

// opencode.* 命令抛出的错误：包一层 registerCommand，记下后照常抛出（不改变命令行为）。
function wrapCommand(id, fn) {
  if (typeof fn !== "function" || !String(id).startsWith("opencode.")) return fn;
  return function (...args) {
    try {
      const r = fn.apply(this, args);
      if (r && typeof r.then === "function") return r.then(void 0, (e) => { recordCrash("command", e, { command: id }); throw e; });
      return r;
    } catch (e) { recordCrash("command", e, { command: id }); throw e; }
  };
}
function patchCommandRegistration() {
  try {
    const cmds = vscodeC.commands;
    if (!cmds || cmds.__ocCrashWrapped) return;
    for (const name of ["registerCommand", "registerTextEditorCommand"]) {
      const orig = cmds[name];
      if (typeof orig !== "function") continue;
      cmds[name] = function (id, fn, thisArg) { return orig.call(this, id, wrapCommand(id, fn), thisArg); };
    }
    cmds.__ocCrashWrapped = true;
  } catch {}
}
patchCommandRegistration();

let installed = false;
export function activateCrashReporting(deps = {}) {
  if (installed) return; installed = true;
  patchCommandRegistration();
  const ours = (e) => /extensions[\\/]opencode[\\/]/i.test(String(e?.stack || ""));
  try {
    process.on("uncaughtException", (e) => { recordCrash("uncaughtException", e, { ours: ours(e) }); });
    process.on("unhandledRejection", (reason) => { recordCrash("unhandledRejection", reason, { ours: ours(reason) }); });
  } catch (error) { deps.log?.(`[crash-report] 无法挂接进程错误事件：${error?.message ?? error}`); }
  vscodeC.commands.registerCommand("opencode.diagnostics.export", () => exportDiagnostics());
}

export async function exportDiagnostics() {
  const now = new Date();
  const appRoot = vscodeC.env?.appRoot || "";
  const text = buildDiagnosticsText({
    now, entries: readRecentCrashes(7, { limit: 50 }), extensionVersion: extensionVersion(), vscodeVersion: vscodeC.version,
    os: `${osC.type()} ${osC.release()} ${osC.arch()} (${process.platform}), Node ${process.versions.node}, Electron ${process.versions.electron || "-"}`,
    appRoot, buildLog: findBuildLog(appRoot)
  });
  const name = `opencode-diagnostics-${dayStamp(now)}-${pad2(now.getHours())}${pad2(now.getMinutes())}.txt`;
  const desktop = pathC.join(osC.homedir(), "Desktop");
  const target = await vscodeC.window.showSaveDialog({ defaultUri: vscodeC.Uri.file(pathC.join(fsC.existsSync(desktop) ? desktop : osC.homedir(), name)), filters: { "文本": ["txt"] }, saveLabel: "导出诊断信息" });
  if (!target) return null;
  fsC.writeFileSync(target.fsPath, text, "utf8");
  const pick = await vscodeC.window.showInformationMessage(`诊断信息已导出：${target.fsPath}（只在本机，未上传）`, "打开", "在文件夹中显示");
  if (pick === "打开") await vscodeC.window.showTextDocument(target);
  else if (pick === "在文件夹中显示") await vscodeC.commands.executeCommand("revealFileInOS", target);
  return target.fsPath;
}
