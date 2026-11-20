// agent-extras-step01: 借鉴 Cursor 的几项能力——按文件匹配的规则、Hooks、worktrees.json 建树后初始化、Agents 视图。
import { __toESM } from "./module-0000.mjs";
var vscodeX = __toESM(require("vscode"));
var fsX = __toESM(require("node:fs"));
var pathX = __toESM(require("node:path"));
var childX = __toESM(require("node:child_process"));

const clipX = (text, max = 4000) => {
  const value = String(text ?? "");
  return value.length > max ? `${value.slice(0, max)}…（已截断，共 ${value.length} 字）` : value;
};

function parseFrontmatterX(raw) {
  const text = String(raw).replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { meta: {}, body: text.trim() };
  const meta = {};
  let listKey;
  for (const line of match[1].split(/\r?\n/)) {
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && listKey) { meta[listKey].push(item[1].trim().replace(/^["']|["']$/g, "")); continue; }
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value === "") { meta[key] = []; listKey = key; continue; }
    listKey = void 0;
    if (/^\[.*\]$/.test(value)) meta[key] = value.slice(1, -1).split(",").map((v) => v.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    else if (/^(true|false)$/i.test(value)) meta[key] = value.toLowerCase() === "true";
    else meta[key] = value.replace(/^["']|["']$/g, "");
  }
  return { meta, body: text.slice(match[0].length).trim() };
}

/** glob → RegExp：支持 **、*、?、{a,b}；不含 / 的模式匹配任意层级的文件名。 */
function globToRegExp(glob) {
  let pattern = String(glob).trim().replace(/\\/g, "/").replace(/^\.\//, "");
  if (!pattern.includes("/")) pattern = `**/${pattern}`;
  let out = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "*") {
      if (pattern[i + 1] === "*") { out += pattern[i + 2] === "/" ? "(?:.*/)?" : ".*"; i += pattern[i + 2] === "/" ? 2 : 1; }
      else out += "[^/]*";
    } else if (c === "?") out += "[^/]";
    else if (c === "{") { const end = pattern.indexOf("}", i); if (end > i) { out += `(?:${pattern.slice(i + 1, end).split(",").map((p) => p.replace(/[.+^$()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")).join("|")})`; i = end; } else out += "\\{"; }
    else out += c.replace(/[.+^$()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${out}$`, "i");
}

/**
 * 规则：<root>/.opencode/rules/*.md（以及用户目录 ~/.opencode/rules）。frontmatter：
 *   alwaysApply: true —— 每轮都带上；globs: ["src/**\/*.ts"] —— 本轮涉及的文件匹配时带上；
 *   其余只列出名字和 description，模型需要时自己用 read_files 读取。
 */
export function buildRulesInstructions(ruleDirs, workspaceRoot, candidatePaths) {
  const rules = [];
  for (const dir of ruleDirs) {
    let files = [];
    try { files = fsX.readdirSync(dir).filter((f) => /\.(md|mdc)$/i.test(f)).map((f) => pathX.join(dir, f)); } catch { continue; }
    for (const file of files.sort()) {
      try {
        const { meta, body } = parseFrontmatterX(fsX.readFileSync(file, "utf8"));
        if (!body) continue;
        const globs = Array.isArray(meta.globs) ? meta.globs : typeof meta.globs === "string" && meta.globs ? meta.globs.split(",").map((g) => g.trim()).filter(Boolean) : [];
        rules.push({ name: pathX.basename(file).replace(/\.(md|mdc)$/i, ""), file, body, globs, always: meta.alwaysApply === true, description: typeof meta.description === "string" ? meta.description : "" });
      } catch { }
    }
  }
  if (!rules.length) return "";
  const rel = [...new Set(candidatePaths.filter(Boolean).map((p) => {
    const abs = pathX.isAbsolute(p) ? p : pathX.join(workspaceRoot ?? "", p);
    return (workspaceRoot ? pathX.relative(workspaceRoot, abs) : abs).replace(/\\/g, "/");
  }).filter((p) => p && !p.startsWith("..")))];
  const applied = [];
  const listed = [];
  for (const rule of rules) {
    const matchers = rule.globs.map(globToRegExp);
    const hit = rule.always || rel.some((p) => matchers.some((re) => re.test(p)));
    if (hit) applied.push(rule); else listed.push(rule);
  }
  const parts = [];
  if (applied.length) parts.push("Project rules that apply to this turn (follow them):", ...applied.map((r) => `### ${r.name}${r.globs.length && !r.always ? ` (files: ${r.globs.join(", ")})` : ""}\n${clipX(r.body, 12000)}`));
  if (listed.length) parts.push("Other project rules — read the file with read_files before working on matching files:", ...listed.map((r) => `- ${r.name}${r.globs.length ? ` [${r.globs.join(", ")}]` : ""}${r.description ? `: ${r.description}` : ""} → ${r.file}`));
  return parts.join("\n\n");
}

/**
 * OpenCode context-fixes step03：工作区 AGENTS.md / CLAUDE.md（参考 dsh-agent-instructions 与 Cursor 嵌套 AGENTS.md）。
 * 从工作区根到本轮涉及文件（附件、可见编辑器）所在目录逐级收集，越具体的越靠后（优先级更高）；
 * 总字节预算默认 32KB，超出时优先保留更具体的文件，较浅的截断或省略并注明；与规则中心正文、彼此内容相同的文件去重。
 * 跳过 .git / node_modules / .opencode / .opencode-project 等目录；只读文件，不写入任何东西。
 */
const AGENTS_FILE_NAMES = ["AGENTS.md", "CLAUDE.md"];
const AGENTS_SKIP_DIR = /^(?:\.git|node_modules|\.opencode|\.opencode-project|\.update-backup|\.update-stage|dist|out|build)$/i;
export function buildAgentsInstructions(workspaceRoot, candidatePaths, options = {}) {
  if (!workspaceRoot) return "";
  const root = pathX.resolve(workspaceRoot);
  const budget = Math.max(4096, Math.min(262144, Number.isFinite(options.budgetBytes) ? Math.floor(options.budgetBytes) : 32768));
  const norm = (value) => String(value ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
  const dedupeAgainst = norm(options.dedupeAgainst);
  const dirs = [root];
  const seenDirs = new Set([root.toLowerCase()]);
  const depthOf = (dir) => pathX.relative(root, dir).split(/[\\/]/).filter(Boolean).length;
  for (const candidate of Array.isArray(candidatePaths) ? candidatePaths : []) {
    if (typeof candidate !== "string" || !candidate) continue;
    const abs = pathX.resolve(root, candidate);
    const rel = pathX.relative(root, abs);
    if (!rel || rel.startsWith("..") || pathX.isAbsolute(rel)) continue;
    let isDir = false;
    try { isDir = fsX.statSync(abs).isDirectory(); } catch { }
    const parts = (isDir ? rel : pathX.dirname(rel)).split(/[\\/]/).filter((p) => p && p !== ".");
    if (parts.some((p) => AGENTS_SKIP_DIR.test(p))) continue;
    let current = root;
    for (const part of parts.slice(0, 12)) {
      current = pathX.join(current, part);
      if (!seenDirs.has(current.toLowerCase())) { seenDirs.add(current.toLowerCase()); dirs.push(current); }
    }
  }
  dirs.sort((a, b) => depthOf(a) - depthOf(b) || a.localeCompare(b));
  const files = [];
  const seenBodies = new Set();
  for (const dir of dirs.slice(0, 64)) {
    for (const name of AGENTS_FILE_NAMES) {
      const file = pathX.join(dir, name);
      let body;
      try {
        const stat = fsX.statSync(file);
        if (!stat.isFile() || stat.size > 1024 * 1024) continue;
        body = norm(fsX.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
      } catch { continue; }
      if (!body || seenBodies.has(body)) continue;
      if (dedupeAgainst && dedupeAgainst.includes(body)) continue;
      seenBodies.add(body);
      files.push({ rel: pathX.relative(root, file).replace(/\\/g, "/") || name, body, depth: depthOf(dir) });
    }
  }
  if (!files.length) return "";
  // 预算从最具体（最深、最靠后）的文件开始分配
  let remaining = budget;
  const kept = new Array(files.length);
  for (let index = files.length - 1; index >= 0; index -= 1) {
    const item = files[index];
    const bytes = Buffer.byteLength(item.body, "utf8");
    if (bytes <= remaining) { kept[index] = item.body; remaining -= bytes; continue; }
    if (remaining >= 1024) {
      let cut = item.body.slice(0, remaining);
      while (Buffer.byteLength(cut, "utf8") > remaining - 120 && cut.length > 0) cut = cut.slice(0, Math.floor(cut.length * 0.9));
      kept[index] = `${cut}\n…（已按上下文预算截断：原文 ${bytes} 字节，需要全文时用 read_files 读取 ${item.rel}）`;
      remaining = 0;
      continue;
    }
    kept[index] = void 0;
  }
  const omitted = files.filter((_, index) => kept[index] === void 0).map((item) => item.rel);
  const parts = ["Workspace instruction files (AGENTS.md / CLAUDE.md), from the workspace root down to the files in this turn. Follow them; when they conflict, the more specific (later) file wins. The local rule center and explicit user instructions still take precedence."];
  files.forEach((item, index) => { if (kept[index] !== void 0) parts.push(`### ${item.rel}\n${kept[index]}`); });
  if (omitted.length) parts.push(`(Omitted for context budget; read with read_files if relevant: ${omitted.join(", ")})`);
  return parts.join("\n\n");
}

/**
 * dsh-context-align item3：与 dsh-agent-instructions 对齐的工作区指令。
 * - 全局：~/.opencode/AGENTS.md、~/.agents/AGENTS.md（dsh 的 harness home 与共享 agents home）
 * - 项目：从工作区向上找到含 .git 的目录作为项目根，从项目根到工作区逐级读取 AGENTS.md、CLAUDE.md，再读 AGENTS.local.md、CLAUDE.local.md
 * - 总上限 64KB（超出时先省略/截断较浅的文件，保留更具体的）；内容相同的文件、已在规则中心正文里的文件去重
 * 返回 { text, files（已发出的绝对路径，agent-host 用来避免重复补发）, projectRoot }；没有任何文件时 text 为空但仍返回 projectRoot，供子目录补发使用。
 */
const DSH_INSTRUCTION_FILES = ["AGENTS.md", "CLAUDE.md"];
const DSH_LOCAL_INSTRUCTION_FILES = ["AGENTS.local.md", "CLAUDE.local.md"];
export function findDshProjectRoot(workspaceRoot) {
  const start = pathX.resolve(workspaceRoot);
  let current = start;
  for (let depth = 0; depth < 64; depth += 1) {
    try {
      if (fsX.existsSync(pathX.join(current, ".git"))) return current;
    } catch { }
    const parent = pathX.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return start;
}
export function buildDshAgentsInstructions(workspaceRoot, options = {}) {
  if (!workspaceRoot) return void 0;
  const osX = require("node:os");
  const root = pathX.resolve(workspaceRoot);
  const projectRoot = findDshProjectRoot(root);
  const budget = Math.max(4096, Math.min(262144, Number.isFinite(options.budgetBytes) ? Math.floor(options.budgetBytes) : 65536));
  const norm = (value) => String(value ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
  const dedupeAgainst = norm(options.dedupeAgainst);
  const candidates = [];
  const home = osX.homedir();
  for (const [dir, label] of [[pathX.join(home, ".opencode"), "~/.opencode/AGENTS.md"], [pathX.join(home, ".agents"), "~/.agents/AGENTS.md"]]) {
    candidates.push({ file: pathX.join(dir, "AGENTS.md"), display: label, depth: -1 });
  }
  const chain = [];
  for (let current = root; ; current = pathX.dirname(current)) {
    chain.unshift(current);
    if (current.toLowerCase() === projectRoot.toLowerCase() || pathX.dirname(current) === current || chain.length > 64) break;
  }
  chain.forEach((dir, depth) => {
    for (const name of [...DSH_INSTRUCTION_FILES, ...DSH_LOCAL_INSTRUCTION_FILES]) {
      const file = pathX.join(dir, name);
      candidates.push({ file, display: pathX.relative(projectRoot, file).replace(/\\/g, "/") || name, depth });
    }
  });
  const files = [];
  const sent = [];
  const seenBodies = new Set();
  for (const item of candidates) {
    let body;
    try {
      const stat = fsX.statSync(item.file);
      if (!stat.isFile() || stat.size > 1024 * 1024) continue;
      body = norm(fsX.readFileSync(item.file, "utf8").replace(/^\uFEFF/, ""));
    } catch { continue; }
    sent.push(item.file);
    if (!body || seenBodies.has(body)) continue;
    if (dedupeAgainst && dedupeAgainst.includes(body)) continue;
    seenBodies.add(body);
    files.push({ ...item, body });
  }
  if (!files.length) return { text: "", files: sent, projectRoot };
  let remaining = budget - 600;
  const kept = new Array(files.length);
  for (let index = files.length - 1; index >= 0; index -= 1) {
    const item = files[index];
    const bytes = Buffer.byteLength(item.body, "utf8") + Buffer.byteLength(item.display, "utf8") + 8;
    if (bytes <= remaining) { kept[index] = item.body; remaining -= bytes; continue; }
    if (remaining >= 1024) {
      let cut = item.body.slice(0, remaining);
      while (Buffer.byteLength(cut, "utf8") > remaining - 200 && cut.length > 0) cut = cut.slice(0, Math.floor(cut.length * 0.9));
      kept[index] = `${cut}\n…[truncated by the ${budget}-byte workspace instruction budget: the file has ${Buffer.byteLength(item.body, "utf8")} bytes; read ${item.file} for the rest]`;
      remaining = 0;
      continue;
    }
    kept[index] = void 0;
  }
  const omitted = files.filter((_, index) => kept[index] === void 0).map((item) => item.file);
  const parts = ["Workspace instruction files (user-global AGENTS.md, then AGENTS.md / CLAUDE.md and their .local overlays from the project root down to the workspace). Follow them; when they conflict, the more specific (later) file wins. Explicit user instructions still take precedence. Instruction files in subdirectories are added when you work in those directories."];
  files.forEach((item, index) => { if (kept[index] !== void 0) parts.push(`### ${item.display}\n${kept[index]}`); });
  if (omitted.length) parts.push(`(Omitted for the instruction budget; read them if relevant: ${omitted.join(", ")})`);
  return { text: parts.join("\n\n"), files: sent, projectRoot };
}

/**
 * Hooks：<root>/.opencode/hooks.json
 * { "hooks": { "beforeSubmitPrompt": [{ "command": "..." }], "beforeToolUse": [{ "matcher": "run_command|apply_patch", "command": "..." }],
 *              "afterToolUse": [...], "stop": [...] } }
 * 命令从 stdin 收到 JSON（event、tool、args、prompt…）；退出码 2 或输出 {"decision":"deny","reason":"…"} 表示拦截；
 * 输出 {"additionalContext":"…"} 会附加给模型。超时 60 秒（可用 timeout 秒数覆盖）。
 */
export const HOOK_EVENTS = ["beforeSubmitPrompt", "beforeToolUse", "afterToolUse", "stop"];
export function loadHooks(hookFiles, trusted) {
  const hooks = Object.fromEntries(HOOK_EVENTS.map((e) => [e, []]));
  const errors = [];
  for (const { file, workspace } of hookFiles) {
    if (workspace && !trusted) continue;
    let spec;
    try { spec = JSON.parse(fsX.readFileSync(file, "utf8").replace(/^\uFEFF/, "")); } catch (error2) { if (fsX.existsSync(file)) errors.push(`${file}：${error2 instanceof Error ? error2.message : String(error2)}`); continue; }
    const table = spec?.hooks && typeof spec.hooks === "object" ? spec.hooks : {};
    for (const event of HOOK_EVENTS) {
      for (const entry of Array.isArray(table[event]) ? table[event] : []) {
        if (!entry || typeof entry.command !== "string" || !entry.command.trim()) continue;
        let matcher;
        try { matcher = typeof entry.matcher === "string" && entry.matcher ? new RegExp(`^(?:${entry.matcher})$`) : void 0; } catch { errors.push(`${file}：matcher 无效 ${entry.matcher}`); continue; }
        hooks[event].push({ command: entry.command, matcher, timeoutMs: Math.min(600, Math.max(1, Number(entry.timeout) || 60)) * 1e3, cwd: pathX.dirname(pathX.dirname(file)), file });
      }
    }
  }
  return { hooks, errors, events: HOOK_EVENTS.filter((e) => hooks[e].length) };
}

function runHookCommand(hook, payload, cwd) {
  return new Promise((resolve) => {
    const child = childX.spawn(hook.command, { shell: true, cwd: cwd || hook.cwd, windowsHide: true, env: { ...process.env, OPENCODE_HOOK_EVENT: payload.event, OPENCODE_PROJECT_DIR: cwd || hook.cwd } });
    let stdout = ""; let stderr = "";
    const timer = setTimeout(() => { try { child.kill(); } catch { } resolve({ code: -1, stdout, stderr: `${stderr}\n超时 ${hook.timeoutMs / 1e3} 秒` }); }, hook.timeoutMs);
    child.stdout.on("data", (d) => { if (stdout.length < 2e5) stdout += d; });
    child.stderr.on("data", (d) => { if (stderr.length < 2e5) stderr += d; });
    child.on("error", (e) => { clearTimeout(timer); resolve({ code: -1, stdout, stderr: String(e) }); });
    child.on("close", (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    child.stdin.on("error", () => { }); // hook 不读 stdin 时忽略 EPIPE
    try { child.stdin.end(JSON.stringify(payload)); } catch { }
  });
}

/** 依次运行某事件的 hooks，合并结果：任何一个拦截就拦截；additionalContext 拼接。 */
export async function runHooks(config, event, payload, cwd, log) {
  const list = (config?.hooks?.[event] ?? []).filter((h) => !h.matcher || h.matcher.test(String(payload.tool ?? "")));
  if (!list.length) return {};
  const contexts = [];
  for (const hook of list) {
    const r = await runHookCommand(hook, { event, ...payload }, cwd);
    let parsed;
    try { parsed = JSON.parse(r.stdout.trim()); } catch { }
    log?.(`[hooks] ${event}${payload.tool ? ` ${payload.tool}` : ""} → ${hook.command.slice(0, 80)} exit=${r.code}`);
    if (r.code === 2 || parsed?.decision === "deny" || parsed?.permission === "deny") {
      return { decision: "deny", reason: clipX(parsed?.reason || r.stderr.trim() || r.stdout.trim() || `hook 拦截：${hook.command}`, 2000) };
    }
    const extra = parsed?.additionalContext ?? parsed?.additional_context ?? parsed?.followup_message;
    if (typeof extra === "string" && extra.trim()) contexts.push(extra.trim());
    else if (!parsed && r.code === 0 && r.stdout.trim() && event !== "afterToolUse") contexts.push(clipX(r.stdout.trim(), 4000));
  }
  return contexts.length ? { additionalContext: clipX(contexts.join("\n\n"), 8000) } : {};
}

/**
 * worktrees.json（与 Cursor 的格式一致，也认 .cursor/worktrees.json）：
 * { "setup-worktree": ["npm ci", "copy $ROOT_WORKTREE_PATH/.env .env"], "setup-worktree-windows": [...], "setup-worktree-unix": [...] }
 * 也可以是脚本路径字符串。新建分支工作树后在工作树里依次执行，失败只记日志不中断。
 */
export async function runWorktreeSetup(repoRoot, worktreeDir, log) {
  let spec; let file;
  for (const candidate of [pathX.join(repoRoot, ".opencode", "worktrees.json"), pathX.join(repoRoot, ".cursor", "worktrees.json")]) {
    try { spec = JSON.parse(fsX.readFileSync(candidate, "utf8").replace(/^\uFEFF/, "")); file = candidate; break; } catch { }
  }
  if (!spec) return void 0;
  const platformKey = process.platform === "win32" ? "setup-worktree-windows" : "setup-worktree-unix";
  let steps = spec[platformKey] ?? spec["setup-worktree"];
  if (typeof steps === "string") steps = [steps];
  if (!Array.isArray(steps) || !steps.length) return void 0;
  const results = [];
  for (const step of steps.filter((s) => typeof s === "string" && s.trim())) {
    const started = Date.now();
    const r = await new Promise((resolve) => {
      const child = childX.spawn(step, { shell: true, cwd: worktreeDir, windowsHide: true, env: { ...process.env, ROOT_WORKTREE_PATH: repoRoot } });
      let out = "";
      const timer = setTimeout(() => { try { child.kill(); } catch { } resolve({ code: -1, out: `${out}\n超时 10 分钟` }); }, 6e5);
      child.stdout.on("data", (d) => { if (out.length < 1e5) out += d; });
      child.stderr.on("data", (d) => { if (out.length < 1e5) out += d; });
      child.on("error", (e) => { clearTimeout(timer); resolve({ code: -1, out: String(e) }); });
      child.on("close", (code) => { clearTimeout(timer); resolve({ code, out }); });
    });
    log?.(`[worktree-setup] ${step} exit=${r.code} ${Date.now() - started}ms`);
    results.push({ step, code: r.code, output: clipX(r.out.trim(), 2000) });
    if (r.code !== 0 && spec.stopOnError === true) break;
  }
  return { file, results };
}

/** Agents 视图：资源管理器里列出正在运行和最近完成的对话轮次（模型、用时、token）。 */
export class AgentsViewProvider {
  constructor() {
    this.runs = new Map();
    this.emitter = new vscodeX.EventEmitter();
    this.onDidChangeTreeData = this.emitter.event;
    this.timer = void 0;
  }
  start(id, info) {
    this.runs.delete(id);
    this.runs.set(id, { id, startedAt: Date.now(), status: "running", ...info });
    while (this.runs.size > 30) this.runs.delete(this.runs.keys().next().value);
    this.ensureTimer();
    this.emitter.fire();
  }
  finish(id, status = "done") {
    const run = this.runs.get(id);
    if (!run) return;
    try { run.finalUsage = run.usage?.(); } catch { }
    run.usage = void 0;
    run.status = status;
    run.endedAt = Date.now();
    this.emitter.fire();
  }
  ensureTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (![...this.runs.values()].some((r) => r.status === "running")) { clearInterval(this.timer); this.timer = void 0; }
      this.emitter.fire();
    }, 2e3);
  }
  getChildren() {
    const runs = [...this.runs.values()].reverse();
    if (!runs.length) { const empty = new vscodeX.TreeItem("没有运行中的对话"); empty.iconPath = new vscodeX.ThemeIcon("info"); return [empty]; }
    return runs.map((run) => {
      const ms = (run.endedAt ?? Date.now()) - run.startedAt;
      const time = ms >= 6e4 ? `${Math.floor(ms / 6e4)}分${Math.round(ms % 6e4 / 1e3)}秒` : `${Math.round(ms / 1e3)}秒`;
      let usage;
      try { usage = run.status === "running" ? run.usage?.() : run.finalUsage; } catch { }
      const tokens = usage?.total ? ` · ${usage.total >= 1e3 ? `${(usage.total / 1e3).toFixed(1)}k` : usage.total} tok` : "";
      const item = new vscodeX.TreeItem(run.title || "(无标题)");
      const label = run.status === "running" ? "运行中" : run.status === "done" ? "完成" : run.status === "cancelled" ? "已停止" : run.status;
      item.description = `${label} · ${time}${tokens}${run.model ? ` · ${run.model}` : ""}`;
      item.tooltip = `${run.title}\n${item.description}${run.workspace ? `\n${run.workspace}` : ""}`;
      item.iconPath = new vscodeX.ThemeIcon(run.status === "running" ? "sync~spin" : run.status === "done" ? "check" : "circle-slash");
      item.command = { command: "workbench.action.chat.open", title: "打开对话" };
      return item;
    });
  }
  getTreeItem(item) { return item; }
}
