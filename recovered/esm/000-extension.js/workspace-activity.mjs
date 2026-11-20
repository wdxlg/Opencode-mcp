// Maintained shared source: same-workspace multi-dialogue awareness.
// Several dialogues may edit one workspace at the same time without the collaboration feature.
// This ledger remembers which dialogue changed which files (through the bridge file tools) so a
// build or packaging command can be told, in its own result, what the other dialogues touched and
// how to treat it: package what is on disk, never stash or ask, and use the exact version.
// Records persist on disk per workspace, so they survive restarts and are shared across windows.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const EDIT_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_EDITS = 600;
const RECENT_ACTIVE_MS = 2 * 60 * 1000;
const LIST_FILES = 4;
const GIT_TIMEOUT_MS = 5000;

// Build / package / publish / update commands across common toolchains, plus Chinese script names.
const PACKAGING_PATTERNS = [
  /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:build|dist|package|release|bundle|electron:build|tauri\s+build)\b[\w:-]*/i,
  /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+(?:pack|publish|update|make|compile)\b[\w:-]*|pack\b|publish\b)/i,
  /\b(?:npx\s+)?(?:electron-builder|electron-forge\s+(?:make|package|publish)|vsce\s+package|tauri\s+build|nexe|ncc\s+build)\b/i,
  /\b(?:pyinstaller|nuitka|cx_freeze|briefcase\s+(?:build|package))\b/i,
  /\bpython\d*(?:\.exe)?\s+(?:-m\s+build|setup\.py\s+(?:sdist|bdist\w*|build)|\S*(?:build|pack|package|release|dist|publish|update)\w*\.py)\b/i,
  /\b(?:dotnet\s+(?:publish|pack|build)|msbuild|mvn\s+(?:package|install|deploy)|gradle\w*\s+(?:assemble|build|bundle|jar|shadowJar)|cargo\s+(?:build\s+--release|package|publish|dist)|make\s+\w*(?:dist|release|package|installer)\w*|goreleaser|wix|makensis|iscc|inno)\b/i,
  /\bnode(?:\.exe)?\s+\S*(?:build|pack|package|publish|release|update|dist|bundle)[\w.-]*\.(?:c?js|mjs)\b/i,
  /(?:^|[\s"'\\/])(?:\S*(?:build|pack|package|publish|release|update|dist)\S*\.(?:cmd|bat|ps1|sh))\b/i,
  /(?:打包|编译|构建|发布|更新)[^\s"']*\.(?:cmd|bat|ps1|sh|py|c?js|mjs)/
];

export function looksLikePackagingCommand(command) {
  const text = String(command || "");
  if (!text.trim()) return false;
  return PACKAGING_PATTERNS.some((re) => re.test(text));
}

function normalizeFileKey(file) {
  let s = String(file || "").trim().replace(/\\/g, "/").replace(/^\.\//, "");
  if (/^[a-zA-Z]:/.test(s) || process.platform === "win32") s = s.toLowerCase();
  return s;
}

function normalizeRootKey(root) {
  let s = String(root || "").trim().replace(/\\/g, "/").replace(/\/+$/, "");
  const msys = s.match(/^\/([a-zA-Z])(\/.*)?$/);
  if (msys) s = `${msys[1]}:${msys[2] || "/"}`;
  if (/^[a-zA-Z]:/.test(s) || process.platform === "win32") s = s.toLowerCase();
  return s;
}

/** Workspace-relative spelling of a path when it lies under root; otherwise the path itself. */
export function toWorkspaceRelative(file, root) {
  const f = String(file || "").trim();
  if (!f || !root) return f;
  const msys = f.match(/^\/([a-zA-Z])(\/.*)?$/);
  const native = msys ? `${msys[1]}:${msys[2] || "/"}` : f;
  if (!path.isAbsolute(native)) return f;
  const rel = path.relative(path.resolve(root), path.resolve(native));
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel) ? rel.replace(/\\/g, "/") : f;
}

/** Paths an apply_patch call is about to touch, from its directives. */
export function patchTargetPaths(args) {
  const out = new Set();
  if (typeof args?.patch !== "string") return [];
  for (const line of args.patch.split(/\r?\n/)) {
    const m = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/.exec(line) || /^\*\*\* Move to: (.+)$/.exec(line);
    if (m) out.add(m[1].trim());
  }
  return [...out];
}

/** Paths a read tool call asked for. */
export function readTargetPaths(args) {
  const out = [];
  const push = (v) => { if (typeof v === "string" && v.trim()) out.push(v.trim()); };
  if (Array.isArray(args?.files)) for (const f of args.files) push(typeof f === "string" ? f : f?.path);
  if (Array.isArray(args?.paths)) for (const f of args.paths) push(typeof f === "string" ? f : f?.path);
  push(args?.path);
  return out;
}

function minutesAgo(now, at) {
  const m = Math.max(0, Math.round((now - at) / 60000));
  return m < 1 ? "不到 1 分钟前" : `${m} 分钟前`;
}

function defaultStoreDir() {
  return path.join(os.tmpdir(), "opencode-workspace-activity");
}

/** Paths an apply_patch result reports as written, falling back to the patch directives. */
export function editedPathsFromResult(args, result) {
  const out = new Set();
  const files = result?.structuredContent?.files;
  if (Array.isArray(files)) {
    for (const f of files) {
      if (f?.path) out.add(String(f.path));
      if (f?.destination_path) out.add(String(f.destination_path));
    }
  }
  if (!out.size && typeof args?.patch === "string") {
    for (const line of args.patch.split(/\r?\n/)) {
      const m = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/.exec(line) || /^\*\*\* Move to: (.+)$/.exec(line);
      if (m) out.add(m[1].trim());
    }
  }
  return [...out];
}

/** Uncommitted files in the git repository containing cwd, relative to the workspace root; null when not a repo. */
export function gitUncommittedFiles(cwd, workspaceRoot) {
  try {
    const top = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, timeout: GIT_TIMEOUT_MS, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).trim();
    const raw = execFileSync("git", ["-c", "core.quotepath=false", "status", "--porcelain", "-z", "--untracked-files=normal"], { cwd: top, timeout: GIT_TIMEOUT_MS, encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
    const parts = raw.split("\0");
    const files = [];
    for (let i = 0; i < parts.length; i++) {
      const entry = parts[i];
      if (!entry || entry.length < 4) continue;
      const code = entry.slice(0, 2);
      files.push(entry.slice(3));
      if (code[0] === "R" || code[0] === "C") i++;
    }
    const base = workspaceRoot ? path.resolve(workspaceRoot) : top;
    return files.map((f) => path.relative(base, path.join(top, f)).replace(/\\/g, "/"));
  } catch {
    return null;
  }
}

export class WorkspaceActivityLedger {
  /**
   * rootsReader() -> workspace roots; records are stored per first root.
   * Pass storeDir=null to keep records in memory only (tests).
   */
  constructor({ now = () => Date.now(), storeDir = defaultStoreDir(), rootsReader = () => [] } = {}) {
    this.now = now;
    this.storeDir = storeDir;
    this.rootsReader = rootsReader;
    this.memory = new Map();
    /** owner -> Map(fileKey -> last read time); reads only matter inside one window. */
    this.reads = new Map();
  }
  root() {
    let roots = [];
    try { roots = this.rootsReader() || []; } catch {}
    return Array.isArray(roots) ? roots[0] : roots;
  }
  keyFor(file) {
    return normalizeFileKey(toWorkspaceRelative(file, this.root()));
  }
  recordRead(owner, paths) {
    if (!owner || !Array.isArray(paths)) return;
    const at = this.now();
    let map = this.reads.get(owner);
    if (!map) { map = new Map(); this.reads.set(owner, map); }
    for (const p of paths) { const k = this.keyFor(p); if (k) map.set(k, at); }
    if (map.size > 2000) for (const k of [...map.keys()].slice(0, map.size - 2000)) map.delete(k);
  }
  /**
   * Files another dialogue edited after this dialogue last read or edited them.
   * Returns [{ path, title, at }].
   */
  staleConflicts(owner, paths) {
    if (!owner || !Array.isArray(paths) || !paths.length) return [];
    const edits = this.load(this.workspaceKey());
    const reads = this.reads.get(owner) || new Map();
    const out = [];
    for (const p of paths) {
      const k = this.keyFor(p);
      if (!k) continue;
      let touched = reads.get(k) || 0;
      let other = null;
      for (const e of edits) {
        if (e.key !== k) continue;
        if (e.owner === owner) touched = Math.max(touched, e.at);
        else if (!other || e.at > other.at) other = e;
      }
      if (other && other.at > touched) out.push({ path: p, title: other.title || "", at: other.at });
    }
    return out;
  }
  /** Newest edit time by any other dialogue, or 0. */
  latestOtherEditAt(owner) {
    let at = 0;
    for (const e of this.load(this.workspaceKey())) if (e.owner !== owner && e.at > at) at = e.at;
    return at;
  }
  /** Files changed by other dialogues that this dialogue never edited, workspace-relative. */
  filesEditedByOthers(owner) {
    const edits = this.load(this.workspaceKey());
    const mine = new Set(edits.filter((e) => e.owner === owner).map((e) => e.key));
    const out = new Map();
    for (const e of edits) if (e.owner !== owner && !mine.has(e.key)) out.set(e.key, e.path);
    return [...out.values()];
  }
  workspaceKey() {
    return normalizeRootKey(this.root()) || "default";
  }
  storeFile(key) {
    if (!this.storeDir) return null;
    return path.join(this.storeDir, `${crypto.createHash("sha256").update(key).digest("hex").slice(0, 24)}.json`);
  }
  load(key) {
    const file = this.storeFile(key);
    let edits = this.memory.get(key) || [];
    if (file) {
      try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        if (Array.isArray(data?.edits)) edits = data.edits;
      } catch {}
    }
    const cutoff = this.now() - EDIT_TTL_MS;
    return edits.filter((e) => e && e.owner && e.key && e.at >= cutoff).slice(-MAX_EDITS);
  }
  save(key, edits) {
    this.memory.set(key, edits);
    const file = this.storeFile(key);
    if (!file) return;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify({ workspace_key: key, edits }) + "\n", "utf8");
      fs.renameSync(tmp, file);
    } catch {}
  }
  /** info = { title, state } of the recording dialogue, kept so other windows can name it. */
  recordEdits(owner, paths, info = null) {
    if (!owner || !Array.isArray(paths) || !paths.length) return;
    const key = this.workspaceKey();
    const at = this.now();
    let edits = this.load(key);
    for (const p of paths) {
      const fileKey = this.keyFor(p);
      if (!fileKey) continue;
      edits = edits.filter((e) => !(e.owner === owner && e.key === fileKey));
      edits.push({ owner, key: fileKey, path: String(p), at, pid: process.pid, title: info?.title || "", state: info?.state || "" });
    }
    if (info) for (const e of edits) if (e.owner === owner) { e.title = info.title || e.title; e.state = info.state || e.state; }
    this.save(key, edits.slice(-MAX_EDITS));
  }
  /** Every dialogue's edit keys, for telling recorded files apart from script edits. */
  allKeys() {
    return new Set(this.load(this.workspaceKey()).map((e) => e.key));
  }
  /** Other dialogues' edits, grouped per dialogue, newest first. */
  othersSummary(owner) {
    const byOwner = new Map();
    for (const e of this.load(this.workspaceKey())) {
      if (e.owner === owner) continue;
      const g = byOwner.get(e.owner) || { owner: e.owner, files: [], lastAt: 0, title: "", state: "", foreign: false };
      g.files.push(e);
      if (e.at >= g.lastAt) { g.lastAt = e.at; g.title = e.title || g.title; g.state = e.state || g.state; g.foreign = e.pid !== process.pid; }
      byOwner.set(e.owner, g);
    }
    return [...byOwner.values()].sort((a, b) => b.lastAt - a.lastAt).map((g) => ({ ...g, files: g.files.sort((a, b) => b.at - a.at) }));
  }
  /**
   * Notice appended to a build/package command result.
   * describeOwner(owner) -> { title, state } | null, read from this window's task board.
   * uncommitted: workspace-relative files from git status, or null when unavailable.
   */
  packagingNotice(owner, describeOwner, uncommitted = null) {
    const now = this.now();
    const groups = this.othersSummary(owner);
    const lines = ["[同工作区多对话提示 · OpenCode 自动附加]"];
    let maybeMidEdit = false;
    if (groups.length) {
      lines.push(`当前工作区在近 2 小时内还有 ${groups.length} 个其他对话改过文件：`);
      for (const g of groups) {
        let info = null;
        try { info = describeOwner?.(g.owner) || null; } catch {}
        const state = info?.state || g.state;
        const title = info?.title || g.title;
        const active = state === "running" || state === "awaiting_user" || state === "waiting_plan";
        const recent = now - g.lastAt < RECENT_ACTIVE_MS;
        if (active && recent) maybeMidEdit = true;
        const stateText = state === "running" ? "进行中" : state === "awaiting_user" ? "等用户回答" : state === "completed" ? "已完成" : state === "blocked" ? "受阻" : state === "cancelled" ? "已取消" : state ? state : "状态未知";
        const where = !info && g.foreign ? "，另一窗口，状态为记录时" : "";
        const names = g.files.slice(0, LIST_FILES).map((f) => f.path).join("、");
        const more = g.files.length > LIST_FILES ? ` 等 ${g.files.length} 个文件` : "";
        lines.push(`- 对话「${title || "未命名"}」（${stateText}${where}，最近改动 ${minutesAgo(now, g.lastAt)}）：${names}${more}`);
      }
    } else {
      lines.push("近 2 小时内没有其他对话经 OpenCode 文件工具改过这个工作区。");
    }
    if (Array.isArray(uncommitted)) {
      const known = this.allKeys();
      const unattributed = uncommitted.filter((f) => !known.has(this.keyFor(f)));
      if (unattributed.length) {
        const names = unattributed.slice(0, LIST_FILES).join("、");
        const more = unattributed.length > LIST_FILES ? ` 等 ${unattributed.length} 个文件` : "";
        lines.push(`- git status 里还有未提交改动不是经文件工具记录的（脚本、命令或手改，可能来自任一对话或用户）：${names}${more}`);
      }
    }
    lines.push("处理规则：");
    lines.push("1. 打包/更新以磁盘上当前全部文件为准，其他对话和用户的未提交改动属于正常情况，一并包含；不要为此询问用户，也不要等待它们做完。");
    lines.push("2. 禁止为打包执行 git stash / checkout / reset / clean / restore，禁止只打包 HEAD 或 git archive，禁止回退或覆盖不是本对话改的文件。");
    if (maybeMidEdit) {
      lines.push("3. 上面有对话在 2 分钟内仍在改动且任务进行中，可能改到一半：照常构建；只有当编译或校验失败、且出错文件属于那个对话时，等 1 到 2 分钟后重试一次，仍失败再报告出错文件与错误，不要替它修改。");
    } else {
      lines.push("3. 构建失败且出错文件属于其他对话时，不要替它修改；报告出错文件与错误即可。");
    }
    lines.push("4. 版本号：用户在本对话中明确给出的版本号优先，原样写入项目版本字段后再打包；没给就用项目现有版本字段。禁止用 git describe、提交哈希、日期或自行递增拼版本号，产物名里也不要追加这类后缀。");
    lines.push("5. 若构建锁被其他对话占用，每 30 秒检查一次、最多等 10 分钟后重试，不要删除锁，也不要询问用户；超时再报告锁的持有者。");
    lines.push("6. 提交时只 git add 本对话改过的文件，不要 git add -A / git add . / commit -a；格式化、lint --fix、代码生成只作用于本对话改过的文件。");
    lines.push("7. 完成后报告：版本号、产物路径，以及包含了哪些对话的改动。");
    return lines.join("\n");
  }
}
