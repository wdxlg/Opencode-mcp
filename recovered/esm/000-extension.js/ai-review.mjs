// ai-review-step01: 像 Cursor 一样审查 AI 改动。
// AI（外部 MCP 对话或本地 Chat）通过写类工具改文件前，先记下该文件的「审查基线」；
// 「源代码管理」里出现「AI 改动」，列出待审查文件：点开看差异，编辑器行号旁显示 AI 改动的色块，
// 点色块可逐块回退（VS Code 自带的快速差异）；也可整文件接受 / 回退，或全部接受 / 全部回退。
// 基线保存在工作区存储里，重启后仍可审查。只覆盖写文件 / apply_patch 类工具，run_command 的副作用不在其中。
import { __toESM } from "./module-0000.mjs";
var vscodeR = __toESM(require("vscode"));
var fsR = __toESM(require("node:fs"));
var pathR = __toESM(require("node:path"));
var cryptoR = __toESM(require("node:crypto"));

const BASE_SCHEME = "opencode-ai-base";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TRACKED = 500;
const WRITE_TOOLS = /^(?:apply_patch|write_file|edit_file|create_file)$/;

export function isReviewedWriteTool(name) {
  return WRITE_TOOLS.test(String(name || ""));
}

/** Paths a write tool call is about to touch (before it runs). */
export function reviewTargetPaths(name, args) {
  const out = new Set();
  const push = (v) => { if (typeof v === "string" && v.trim()) out.add(v.trim()); };
  if (typeof args?.patch === "string") {
    for (const line of args.patch.split(/\r?\n/)) {
      const m = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/.exec(line) || /^\*\*\* Move to: (.+)$/.exec(line);
      if (m) push(m[1]);
    }
  }
  push(args?.path);
  push(args?.file_path);
  push(args?.target_file);
  if (Array.isArray(args?.files)) for (const f of args.files) push(typeof f === "string" ? f : f?.path);
  return [...out];
}

function sameBytes(a, b) {
  if (a === null || b === null) return a === b;
  return Buffer.compare(a, b) === 0;
}

function looksBinary(buf) {
  if (!buf) return false;
  const n = Math.min(buf.length, 8000);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
}

export class AiEditReview {
  constructor(context, options = {}) {
    this.context = context;
    this.roots = options.roots || (() => []);
    this.log = options.log || (() => {});
    this.entries = new Map(); // key(lowercased abs path) -> { path, existed, blob, owners[], labels[], at }
    this.storeDir = options.storeDir || (context.storageUri ? pathR.join(context.storageUri.fsPath, "ai-review") : pathR.join(context.globalStorageUri.fsPath, "ai-review"));
    this.saveTimer = undefined;
    this.load();
    const changed = new vscodeR.EventEmitter();
    this.onDidChangeBase = changed;
    context.subscriptions.push(vscodeR.workspace.registerTextDocumentContentProvider(BASE_SCHEME, {
      onDidChange: changed.event,
      provideTextDocumentContent: (uri) => {
        const e = this.entries.get(this.key(this.pathFromBaseUri(uri)));
        if (!e || !e.existed) return "";
        try {
          const buf = fsR.readFileSync(pathR.join(this.storeDir, e.blob));
          return looksBinary(buf) ? "（二进制文件，无法显示差异）" : buf.toString("utf8");
        } catch { return ""; }
      }
    }));
    const rootPath = this.firstRoot();
    this.scm = vscodeR.scm.createSourceControl("opencode.aiReview", "AI 改动", rootPath ? vscodeR.Uri.file(rootPath) : void 0);
    this.scm.inputBox.visible = false;
    this.scm.quickDiffProvider = {
      provideOriginalResource: (uri) => {
        if (uri.scheme !== "file") return void 0;
        const e = this.entries.get(this.key(uri.fsPath));
        return e ? this.baseUri(e.path) : void 0;
      }
    };
    this.group = this.scm.createResourceGroup("opencode.aiReview.pending", "待审查");
    this.group.hideWhenEmpty = true;
    context.subscriptions.push(this.scm, this.group, changed);
    const reg = (id, fn) => context.subscriptions.push(vscodeR.commands.registerCommand(id, fn));
    reg("opencode.aiReview.review", () => this.reviewPick());
    reg("opencode.aiReview.acceptAll", () => this.acceptAll());
    reg("opencode.aiReview.revertAll", () => this.revertAll());
    reg("opencode.aiReview.accept", (arg) => this.acceptFile(this.argPath(arg)));
    reg("opencode.aiReview.revert", (arg) => this.revertFile(this.argPath(arg)));
    reg("opencode.aiReview.openDiff", (arg) => this.openDiff(this.argPath(arg)));
    context.subscriptions.push(vscodeR.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.scheme === "file" && this.entries.has(this.key(doc.uri.fsPath))) void this.recheck([doc.uri.fsPath]);
    }));
    this.render();
    void this.recheck([...this.entries.values()].map((e) => e.path));
  }
  firstRoot() {
    let roots;
    try { roots = this.roots() || []; } catch { roots = []; }
    const r = Array.isArray(roots) ? roots[0] : roots;
    return typeof r === "string" && r ? r : void 0;
  }
  key(p) { return pathR.resolve(String(p)).replace(/\\/g, "/").toLowerCase(); }
  resolvePath(raw) {
    let p = String(raw || "").trim();
    if (!p) return void 0;
    if (/^file:\/\//i.test(p)) { try { p = vscodeR.Uri.parse(p).fsPath; } catch { return void 0; } }
    if (process.platform === "win32") p = p.replace(/^\/([a-zA-Z])\//, "$1:/");
    if (!pathR.isAbsolute(p)) {
      const root = this.firstRoot();
      if (!root) return void 0;
      p = pathR.join(root, p);
    }
    p = pathR.resolve(p);
    const norm = p.replace(/\\/g, "/").toLowerCase();
    if (/\/\.opencode\/(?:shadow-git|checkpoint-forks|worktrees|multimodel-worktrees)\//.test(norm) || /\/\.git\//.test(norm)) return void 0;
    return p;
  }
  baseUri(p) {
    return vscodeR.Uri.from({ scheme: BASE_SCHEME, path: "/" + encodeURIComponent(p) + "/" + pathR.basename(p) });
  }
  pathFromBaseUri(uri) {
    const seg = uri.path.split("/")[1] || "";
    try { return decodeURIComponent(seg); } catch { return seg; }
  }
  argPath(arg) {
    if (!arg) return void 0;
    if (typeof arg === "string") return arg;
    if (arg.resourceUri) return arg.resourceUri.fsPath;
    if (arg.fsPath) return arg.fsPath;
    if (arg.path) return arg.path;
    return void 0;
  }
  readCurrent(p) {
    try {
      const st = fsR.statSync(p);
      if (!st.isFile() || st.size > MAX_FILE_BYTES) return void 0;
      return fsR.readFileSync(p);
    } catch (error) {
      return error?.code === "ENOENT" ? null : void 0;
    }
  }
  /** Before a write tool runs: remember each target's current content unless a baseline already exists. */
  captureBefore(rawPaths, meta = {}) {
    try {
      fsR.mkdirSync(this.storeDir, { recursive: true });
      for (const raw of rawPaths || []) {
        const p = this.resolvePath(raw);
        if (!p) continue;
        const k = this.key(p);
        const existing = this.entries.get(k);
        if (existing) {
          if (meta.label && !existing.labels.includes(meta.label)) existing.labels = [...existing.labels, meta.label].slice(-5);
          continue;
        }
        const cur = this.readCurrent(p);
        if (cur === void 0) continue; // 目录 / 过大 / 无法读取：不纳入审查
        const blob = "base-" + cryptoR.createHash("sha256").update(k).digest("hex").slice(0, 24);
        if (cur !== null) fsR.writeFileSync(pathR.join(this.storeDir, blob), cur);
        this.entries.set(k, { path: p, existed: cur !== null, blob, labels: meta.label ? [meta.label] : [], at: Date.now(), pending: true });
        while (this.entries.size > MAX_TRACKED) this.dropEntry(this.entries.keys().next().value);
      }
    } catch (error) {
      this.log(`[ai-review] 记录基线失败：${error?.message ?? error}`);
    }
  }
  /** After the write tool finished (success or not): drop files whose content equals the baseline, refresh the view. */
  async afterEdit(rawPaths) {
    const paths = [];
    for (const raw of rawPaths || []) { const p = this.resolvePath(raw); if (p) paths.push(p); }
    for (const p of paths) { const e = this.entries.get(this.key(p)); if (e) delete e.pending; }
    await this.recheck(paths);
  }
  baseBytes(e) {
    if (!e.existed) return null;
    try { return fsR.readFileSync(pathR.join(this.storeDir, e.blob)); } catch { return void 0; }
  }
  async recheck(paths) {
    for (const p of paths) {
      const k = this.key(p);
      const e = this.entries.get(k);
      if (!e || e.pending) continue;
      const base = this.baseBytes(e);
      const cur = this.readCurrent(e.path);
      if (base === void 0 || (cur !== void 0 && sameBytes(base, cur))) this.dropEntry(k);
    }
    for (const p of paths) { const e = this.entries.get(this.key(p)); if (e) this.onDidChangeBase.fire(this.baseUri(e.path)); }
    this.render();
    this.scheduleSave();
  }
  dropEntry(k) {
    const e = this.entries.get(k);
    if (!e) return;
    this.entries.delete(k);
    try { fsR.unlinkSync(pathR.join(this.storeDir, e.blob)); } catch {}
  }
  rel(p) {
    const root = this.firstRoot();
    if (root) { const r = pathR.relative(root, p); if (r && !r.startsWith("..") && !pathR.isAbsolute(r)) return r.replace(/\\/g, "/"); }
    return p;
  }
  stateOf(e) {
    const exists = fsR.existsSync(e.path);
    if (!e.existed) return "新建";
    if (!exists) return "删除";
    return "修改";
  }
  render() {
    const list = [...this.entries.values()].filter((e) => !e.pending).sort((a, b) => b.at - a.at);
    this.group.resourceStates = list.map((e) => {
      const uri = vscodeR.Uri.file(e.path);
      const state = this.stateOf(e);
      return {
        resourceUri: uri,
        contextValue: "opencode.aiReview.file",
        decorations: { strikeThrough: state === "删除", tooltip: `AI ${state}：${this.rel(e.path)}${e.labels.length ? "\n来源：" + e.labels.join("；") : ""}\n点开查看差异；行号旁的色块可逐块回退。` },
        command: { command: "opencode.aiReview.openDiff", title: "查看 AI 改动", arguments: [e.path] }
      };
    });
    this.scm.count = list.length;
    this.scm.statusBarCommands = list.length ? [
      { command: "opencode.aiReview.review", title: `$(checklist) AI 改动 ${list.length}`, tooltip: "审查 AI 改动：逐个文件查看、接受或回退" },
      { command: "opencode.aiReview.acceptAll", title: "$(check-all) 全部接受", tooltip: "接受全部 AI 改动（只清除审查标记，不改文件）" },
      { command: "opencode.aiReview.revertAll", title: "$(discard) 全部回退", tooltip: "把所有 AI 改过的文件恢复到改动前" }
    ] : [];
  }
  load() {
    try {
      const raw = JSON.parse(fsR.readFileSync(pathR.join(this.storeDir, "index.json"), "utf8"));
      for (const e of raw?.entries || []) if (e?.path && e.blob) this.entries.set(this.key(e.path), { path: e.path, existed: !!e.existed, blob: e.blob, labels: Array.isArray(e.labels) ? e.labels : [], at: e.at || Date.now() });
    } catch {}
  }
  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        fsR.mkdirSync(this.storeDir, { recursive: true });
        const entries = [...this.entries.values()].filter((e) => !e.pending).map(({ path, existed, blob, labels, at }) => ({ path, existed, blob, labels, at }));
        fsR.writeFileSync(pathR.join(this.storeDir, "index.json"), JSON.stringify({ version: 1, entries }, null, 1));
      } catch (error) { this.log(`[ai-review] 保存失败：${error?.message ?? error}`); }
    }, 300);
    this.saveTimer.unref?.();
  }
  async openDiff(p) {
    const e = p ? this.entries.get(this.key(p)) : void 0;
    if (!e) return;
    const name = pathR.basename(e.path);
    if (!fsR.existsSync(e.path)) {
      await vscodeR.commands.executeCommand("vscode.open", this.baseUri(e.path), { preview: true });
      return;
    }
    await vscodeR.commands.executeCommand("vscode.diff", this.baseUri(e.path), vscodeR.Uri.file(e.path), `${name}（AI 改动前 ↔ 现在）`, { preview: true });
  }
  async acceptFile(p) {
    if (!p) return;
    this.dropEntry(this.key(p));
    await this.recheck([]);
  }
  async revertFile(p, quiet) {
    const k = p ? this.key(p) : void 0;
    const e = k ? this.entries.get(k) : void 0;
    if (!e) return false;
    try {
      if (!e.existed) {
        if (fsR.existsSync(e.path)) fsR.unlinkSync(e.path);
      } else {
        const base = this.baseBytes(e);
        if (base === void 0 || base === null) throw new Error("基线丢失");
        fsR.mkdirSync(pathR.dirname(e.path), { recursive: true });
        fsR.writeFileSync(e.path, base);
      }
      this.dropEntry(k);
      if (!quiet) await this.recheck([]);
      return true;
    } catch (error) {
      void vscodeR.window.showErrorMessage(`回退失败：${this.rel(e.path)}（${error?.message ?? error}）`);
      return false;
    }
  }
  async acceptAll() {
    for (const k of [...this.entries.keys()]) if (!this.entries.get(k)?.pending) this.dropEntry(k);
    await this.recheck([]);
  }
  async revertAll() {
    const list = [...this.entries.values()].filter((e) => !e.pending);
    if (!list.length) return;
    const ok = await vscodeR.window.showWarningMessage(`把 ${list.length} 个 AI 改过的文件恢复到改动前？新建的文件会被删除。`, { modal: true }, "全部回退");
    if (ok !== "全部回退") return;
    let n = 0;
    for (const e of list) if (await this.revertFile(e.path, true)) n++;
    await this.recheck([]);
    void vscodeR.window.showInformationMessage(`已回退 ${n} 个文件。`);
  }
  async reviewPick() {
    const list = [...this.entries.values()].filter((e) => !e.pending).sort((a, b) => b.at - a.at);
    if (!list.length) { void vscodeR.window.showInformationMessage("没有待审查的 AI 改动。"); return; }
    const bDiff = { iconPath: new vscodeR.ThemeIcon("diff"), tooltip: "查看差异" };
    const bAccept = { iconPath: new vscodeR.ThemeIcon("check"), tooltip: "接受" };
    const bRevert = { iconPath: new vscodeR.ThemeIcon("discard"), tooltip: "回退" };
    const qp = vscodeR.window.createQuickPick();
    qp.title = "审查 AI 改动";
    qp.placeholder = "回车查看差异；右侧按钮接受或回退";
    const build = () => {
      const cur = [...this.entries.values()].filter((e) => !e.pending).sort((a, b) => b.at - a.at);
      qp.items = [
        { label: "$(check-all) 全部接受", action: "acceptAll", alwaysShow: true },
        { label: "$(discard) 全部回退", action: "revertAll", alwaysShow: true },
        { label: "", kind: vscodeR.QuickPickItemKind.Separator },
        ...cur.map((e) => ({ label: `${this.stateOf(e) === "新建" ? "$(diff-added)" : this.stateOf(e) === "删除" ? "$(diff-removed)" : "$(diff-modified)"} ${pathR.basename(e.path)}`, description: this.rel(e.path), detail: e.labels.length ? e.labels[e.labels.length - 1] : void 0, path: e.path, buttons: [bDiff, bAccept, bRevert] }))
      ];
      if (!cur.length) qp.hide();
    };
    build();
    qp.onDidTriggerItemButton(async ({ item, button }) => {
      if (button === bDiff) await this.openDiff(item.path);
      else if (button === bAccept) await this.acceptFile(item.path);
      else if (button === bRevert) await this.revertFile(item.path);
      build();
    });
    qp.onDidAccept(async () => {
      const item = qp.selectedItems[0];
      if (!item) return;
      if (item.action === "acceptAll") { qp.hide(); await this.acceptAll(); return; }
      if (item.action === "revertAll") { qp.hide(); await this.revertAll(); return; }
      await this.openDiff(item.path);
    });
    qp.onDidHide(() => qp.dispose());
    qp.show();
  }
}
