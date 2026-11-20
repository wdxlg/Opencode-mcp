// 建议7：影子 git 检查点（默认关闭，设置 opencode.bridge.checkpoints=true 启用）。
// 在工作区根目录旁维护一个独立的 git 仓库（.opencode/shadow-git），不触碰用户自己的 .git。
// 每次成功的写类工具（apply_patch / write_file / edit_file / create_file / run_command）之后，
// 把工作区当前状态（遵守工作区里的 .gitignore）提交为一个检查点，并按任务卡记录索引。
// 回滚前总是先保存当前状态，因此回滚本身也可以再回滚；分叉把检查点检出到独立目录，不改动工作区。
// 边界：只能快照工作区根目录内、未被忽略的文件；run_command 对工作区外、数据库、网络、进程等的副作用无法捕获。
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

export const SHADOW_GIT_DIR = ".opencode/shadow-git";
export const CHECKPOINT_FORK_DIR = ".opencode/checkpoint-forks";
const INDEX_FILE = "opencode-checkpoints.jsonl";
const GIT_TIMEOUT_MS = 60 * 1e3;
const MUTATING = /^(?:apply_patch|write_file|edit_file|create_file|run_command)$/;
const EXCLUDES = ["/.opencode/shadow-git/", "/.opencode/checkpoint-forks/", "/.opencode/worktrees/", "/.opencode/multimodel-worktrees/"];

export const SHADOW_CHECKPOINT_TOOL = {
  name: "bridge_checkpoints",
  title: "工作区检查点（列出 / 回滚 / 分叉）",
  description: "影子 git 检查点。每次成功的 apply_patch、写文件或 run_command 后自动保存一次工作区快照（不影响项目自己的 .git）。"
    + "mode=list 列出检查点（可按 task_id 过滤）；mode=restore 把工作区回滚到某个检查点——会先在任务卡请用户确认，并在回滚前自动保存当前状态，因此可撤销；"
    + "mode=fork 把某个检查点检出到 .opencode/checkpoint-forks/<name> 独立目录供对比或另起分支，不改动工作区。"
    + "只覆盖工作区根目录内未被 .gitignore 忽略的文件；命令对外部系统、数据库、进程的副作用无法回滚。",
  inputSchema: {
    type: "object",
    properties: {
      mode: { type: "string", enum: ["list", "restore", "fork"] },
      checkpoint: { type: "string", minLength: 4, maxLength: 64, description: "检查点提交号（list 返回的 checkpoint，可用前缀）。restore / fork 必填。" },
      task_id: { type: "string", description: "list 时按任务卡过滤；省略则列出全部。" },
      name: { type: "string", pattern: "^[A-Za-z0-9._-]{1,60}$", description: "fork 目录名；省略时用检查点前缀。" },
      limit: { type: "integer", minimum: 1, maximum: 200 }
    },
    required: ["mode"],
    additionalProperties: false
  },
  annotations: { title: "工作区检查点", readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
};

export function isCheckpointedTool(name) { return MUTATING.test(String(name || "")); }

function runGit(root, gitDir, args, { workTree = root, allowExit1 = false } = {}) {
  return new Promise((resolve, reject) => {
    execFile("git", ["-c", "core.quotepath=false", "-c", "core.autocrlf=false", "-c", "core.safecrlf=false", "--git-dir", gitDir, "--work-tree", workTree, ...args], {
      cwd: root, timeout: GIT_TIMEOUT_MS, windowsHide: true, maxBuffer: 64 * 1024 * 1024, encoding: "utf8",
      env: { ...process.env, GIT_AUTHOR_NAME: "opencode-checkpoint", GIT_AUTHOR_EMAIL: "checkpoint@opencode.local",
        GIT_COMMITTER_NAME: "opencode-checkpoint", GIT_COMMITTER_EMAIL: "checkpoint@opencode.local", GIT_TERMINAL_PROMPT: "0" }
    }, (error, stdout, stderr) => {
      if (error && !(allowExit1 && error.code === 1)) {
        reject(Object.assign(new Error(String(stderr || error.message).trim().slice(0, 600)), { code: "CHECKPOINT_GIT_FAILED" }));
        return;
      }
      resolve({ stdout: String(stdout || ""), exit: error ? error.code : 0 });
    });
  });
}

export class ShadowCheckpointStore {
  constructor({ enabled, log } = {}) {
    this.enabledReader = typeof enabled === "function" ? enabled : () => false;
    this.log = typeof log === "function" ? log : () => void 0;
    this.queues = new Map();
  }
  enabled() { try { return this.enabledReader() === true; } catch { return false; } }
  gitDir(root) { return path.join(root, SHADOW_GIT_DIR); }
  /** Serialize all git work per workspace root so concurrent tool calls never race on the shadow index. */
  serial(root, job) {
    const key = path.resolve(root).toLowerCase();
    const next = (this.queues.get(key) || Promise.resolve()).catch(() => void 0).then(job);
    this.queues.set(key, next.catch(() => void 0));
    return next;
  }
  async ensure(root) {
    const gitDir = this.gitDir(root);
    if (!fs.existsSync(path.join(gitDir, "HEAD"))) {
      fs.mkdirSync(gitDir, { recursive: true });
      await runGit(root, gitDir, ["init", "--quiet"]);
      await runGit(root, gitDir, ["config", "gc.auto", "0"]);
      await runGit(root, gitDir, ["config", "core.longpaths", "true"]);
    }
    const exclude = path.join(gitDir, "info", "exclude");
    fs.mkdirSync(path.dirname(exclude), { recursive: true });
    const current = fs.existsSync(exclude) ? fs.readFileSync(exclude, "utf8") : "";
    const missing = EXCLUDES.filter((line) => !current.split(/\r?\n/).includes(line));
    if (missing.length) fs.writeFileSync(exclude, current + (current && !current.endsWith("\n") ? "\n" : "") + missing.join("\n") + "\n");
    return gitDir;
  }
  async head(root, gitDir) {
    const res = await runGit(root, gitDir, ["rev-parse", "--verify", "--quiet", "HEAD"], { allowExit1: true });
    return res.exit === 0 ? res.stdout.trim() : null;
  }
  appendIndex(gitDir, entry) {
    try { fs.appendFileSync(path.join(gitDir, INDEX_FILE), JSON.stringify(entry) + "\n"); } catch (error) { this.log(`[checkpoint] 索引写入失败：${error.message}`); }
  }
  readIndex(gitDir) {
    try {
      return fs.readFileSync(path.join(gitDir, INDEX_FILE), "utf8").split(/\r?\n/).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
    } catch { return []; }
  }
  /** Commit the current workspace state. Returns { checkpoint, changed } or null when nothing could be saved. */
  snapshot(root, meta = {}) {
    return this.serial(root, async () => {
      const gitDir = await this.ensure(root);
      await runGit(root, gitDir, ["add", "-A", "--", "."]);
      const before = await this.head(root, gitDir);
      if (before) {
        const diff = await runGit(root, gitDir, ["diff", "--cached", "--quiet"], { allowExit1: true });
        if (diff.exit === 0) return { checkpoint: before, changed: false };
      }
      const label = String(meta.label || meta.tool || "checkpoint").replace(/\s+/g, " ").slice(0, 200);
      await runGit(root, gitDir, ["commit", "--quiet", "--no-verify", "--allow-empty", "-m", label]);
      const checkpoint = await this.head(root, gitDir);
      this.appendIndex(gitDir, { checkpoint, parent: before, at: new Date().toISOString(), tool: meta.tool || null, label,
        task_id: meta.taskId || null, owner: meta.owner || null });
      return { checkpoint, changed: true };
    });
  }
  async resolve(root, gitDir, ref) {
    const value = String(ref || "").trim();
    if (!/^[0-9a-f]{4,64}$/i.test(value)) throw Object.assign(new Error("检查点编号无效。"), { code: "CHECKPOINT_INVALID" });
    const res = await runGit(root, gitDir, ["rev-parse", "--verify", "--quiet", value + "^{commit}"], { allowExit1: true });
    if (res.exit !== 0) throw Object.assign(new Error(`找不到检查点 ${value}。`), { code: "CHECKPOINT_NOT_FOUND" });
    return res.stdout.trim();
  }
  async list(root, { taskId, limit = 50 } = {}) {
    const gitDir = this.gitDir(root);
    if (!fs.existsSync(path.join(gitDir, "HEAD"))) return [];
    const entries = this.readIndex(gitDir).filter((e) => !taskId || e.task_id === taskId);
    return entries.slice(-limit).reverse();
  }
  describe(root, checkpoint) {
    return this.readIndex(this.gitDir(root)).find((e) => e.checkpoint === checkpoint) || null;
  }
  /** Roll the workspace back to `ref`. The current state is saved first, so a restore can itself be undone. */
  restore(root, ref, meta = {}) {
    return this.serial(root, async () => {
      const gitDir = await this.ensure(root);
      const target = await this.resolve(root, gitDir, ref);
      await runGit(root, gitDir, ["add", "-A", "--", "."]);
      let safety = await this.head(root, gitDir);
      const dirty = safety ? (await runGit(root, gitDir, ["diff", "--cached", "--quiet"], { allowExit1: true })).exit !== 0 : true;
      if (dirty) {
        await runGit(root, gitDir, ["commit", "--quiet", "--no-verify", "--allow-empty", "-m", `回滚前自动保存（目标 ${target.slice(0, 12)}）`]);
        const parent = safety;
        safety = await this.head(root, gitDir);
        this.appendIndex(gitDir, { checkpoint: safety, parent, at: new Date().toISOString(), tool: "pre-restore", label: `回滚前自动保存（目标 ${target.slice(0, 12)}）`, task_id: meta.taskId || null, owner: meta.owner || null });
      }
      const changed = (await runGit(root, gitDir, ["diff", "--name-only", target, "HEAD"])).stdout.split(/\r?\n/).filter(Boolean);
      // --staged --worktree from the target also deletes tracked files the target does not contain.
      await runGit(root, gitDir, ["restore", `--source=${target}`, "--staged", "--worktree", "--", "."]);
      await runGit(root, gitDir, ["commit", "--quiet", "--no-verify", "--allow-empty", "-m", `已回滚到 ${target.slice(0, 12)}`]);
      const after = await this.head(root, gitDir);
      this.appendIndex(gitDir, { checkpoint: after, parent: safety, at: new Date().toISOString(), tool: "restore", label: `已回滚到 ${target.slice(0, 12)}`, restored_from: target, task_id: meta.taskId || null, owner: meta.owner || null });
      return { restored_to: target, saved_before_restore: safety, checkpoint: after, files_changed: changed.length, files: changed.slice(0, 200) };
    });
  }
  /** Check a checkpoint out into its own directory without touching the workspace. */
  fork(root, ref, name) {
    return this.serial(root, async () => {
      const gitDir = await this.ensure(root);
      const target = await this.resolve(root, gitDir, ref);
      const dirName = name && /^[A-Za-z0-9._-]{1,60}$/.test(name) ? name : "cp-" + target.slice(0, 12);
      const dest = path.join(root, CHECKPOINT_FORK_DIR, dirName);
      if (fs.existsSync(dest)) throw Object.assign(new Error(`分叉目录已存在：${dest}`), { code: "CHECKPOINT_FORK_EXISTS" });
      const branch = "fork/" + dirName;
      await runGit(root, gitDir, ["worktree", "add", "--quiet", "-b", branch, dest, target]);
      return { checkpoint: target, path: dest, branch };
    });
  }
}
