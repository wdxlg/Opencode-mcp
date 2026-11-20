// 建议12：可选 Spec 模式（默认关闭，opencode.bridge.specMode）。
// 开启后，新建的任务卡在动手前先按 需求 → 设计 → 任务 三段写规格，每段由本地用户在任务卡上评审通过；
// 三段全部通过（或用户选择本任务跳过）之前，写文件与执行命令类工具一律拒绝。
// 规格文件写在 <工作区>/.opencode/specs/<任务号前 8 位>/，不碰项目代码。
import { promises as fs } from "node:fs";
import * as path from "node:path";

export const SPEC_DIR = ".opencode/specs";
export const SPEC_STAGES = ["requirements", "design", "tasks"];
export const SPEC_STAGE_LABELS = { requirements: "需求", design: "设计", tasks: "任务" };
const ENABLED_FILE = ".enabled-since.json";
const STATE_FILE = "state.json";
const GATED = /^(?:apply_patch|write_file|edit_file|create_file|run_command|send_command_input)$/;
const GATED_EXT = /^ext__.+__(?:powershell|filesystem|registry)$/;

export const SPEC_MODE_TOOL = {
  name: "bridge_spec",
  title: "Spec 模式（需求 → 设计 → 任务）",
  description: "Spec 模式开启时，新任务在改代码或执行命令前，必须依次提交三段规格并由本地用户在任务卡上评审通过："
    + "requirements（需求：目标、范围、验收标准）→ design（设计：方案、改动文件、风险）→ tasks（任务：可执行的步骤清单）。"
    + "mode=status 查看当前任务卡各段状态与文件路径；mode=submit 提交（或修订后重新提交）一段 stage 的 markdown 正文，"
    + "服务端写入 .opencode/specs/<任务号>/<stage>.md 并在任务卡上请用户评审，直到用户回答才返回。"
    + "用户选“需要修改”时会附带意见，请按意见修订后重新 submit 同一段；重新提交已通过的前序段会让后续段重新评审。"
    + "三段全部通过前，apply_patch / 写文件 / run_command 等会被拒绝（SPEC_APPROVAL_REQUIRED）。用户也可在需求评审时选择本任务跳过 Spec。",
  inputSchema: {
    type: "object",
    properties: {
      mode: { type: "string", enum: ["status", "submit"] },
      stage: { type: "string", enum: SPEC_STAGES, description: "submit 时必填：requirements / design / tasks，须按顺序。" },
      content: { type: "string", minLength: 1, maxLength: 60000, description: "submit 时必填：该段的完整 markdown 正文（简体中文）。" },
      summary: { type: "string", maxLength: 300, description: "可选：给评审者看的一句话摘要，显示在任务卡问题里。" }
    },
    required: ["mode"],
    additionalProperties: false
  },
  annotations: { title: "Spec 模式", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
};

export function isSpecGatedTool(name) {
  const n = String(name || "");
  return GATED.test(n) || GATED_EXT.test(n);
}

function emptyState(taskId) {
  return { task_id: taskId, skipped: false, stages: Object.fromEntries(SPEC_STAGES.map((s) => [s, { status: "missing" }])) };
}

export class SpecModeStore {
  constructor(options = {}) {
    this.enabled = typeof options.enabled === "function" ? options.enabled : () => false;
    this.log = typeof options.log === "function" ? options.log : () => {};
    this.sinceCache = new Map();
  }
  specRoot(root) { return path.join(root, ...SPEC_DIR.split("/")); }
  taskDir(root, taskId) { return path.join(this.specRoot(root), String(taskId).replace(/[^A-Za-z0-9-]/g, "").slice(0, 8) || "task"); }
  /** 第一次看到开关为开时记录时间；只有此后创建的任务卡受 Spec 约束，开关关闭时清除。 */
  async enabledSince(root) {
    const file = path.join(this.specRoot(root), ENABLED_FILE);
    if (!this.enabled()) {
      if (this.sinceCache.get(root) !== null) { this.sinceCache.set(root, null); await fs.rm(file, { force: true }).catch(() => {}); }
      return null;
    }
    const cached = this.sinceCache.get(root);
    if (typeof cached === "number") return cached;
    try {
      const value = JSON.parse(await fs.readFile(file, "utf8"))?.since;
      if (Number.isFinite(value)) { this.sinceCache.set(root, value); return value; }
    } catch {}
    const since = Date.now();
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify({ since, at: new Date(since).toISOString() }, null, 2) + "\n", "utf8");
    this.sinceCache.set(root, since);
    return since;
  }
  async applies(root, task) {
    if (!root || !task || !this.enabled()) return false;
    const since = await this.enabledSince(root);
    return since !== null && Number(task.createdAt ?? 0) >= since;
  }
  async readState(root, taskId) {
    try {
      const state = JSON.parse(await fs.readFile(path.join(this.taskDir(root, taskId), STATE_FILE), "utf8"));
      if (state && state.stages) { for (const s of SPEC_STAGES) state.stages[s] ??= { status: "missing" }; return state; }
    } catch {}
    return emptyState(taskId);
  }
  async writeState(root, taskId, state) {
    const dir = this.taskDir(root, taskId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, STATE_FILE), JSON.stringify(state, null, 2) + "\n", "utf8");
  }
  /** 返回第一个尚未通过的阶段；全部通过或已跳过时返回 null。 */
  pendingStage(state) {
    if (state.skipped) return null;
    return SPEC_STAGES.find((s) => state.stages[s]?.status !== "approved") ?? null;
  }
  async writeStage(root, taskId, stage, content, summary) {
    const state = await this.readState(root, taskId);
    const index = SPEC_STAGES.indexOf(stage);
    const blocker = SPEC_STAGES.slice(0, index).find((s) => state.stages[s]?.status !== "approved");
    if (blocker && !state.skipped) throw Object.assign(new Error(`请先完成「${SPEC_STAGE_LABELS[blocker]}」(${blocker}) 段的评审，再提交 ${stage}。`), { code: "SPEC_STAGE_ORDER" });
    const dir = this.taskDir(root, taskId);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${stage}.md`);
    await fs.writeFile(file, content.endsWith("\n") ? content : content + "\n", "utf8");
    const revision = Number(state.stages[stage]?.revision ?? 0) + 1;
    state.skipped = false;
    state.stages[stage] = { status: "in_review", path: file, revision, summary: summary || undefined, submitted_at: new Date().toISOString() };
    for (const later of SPEC_STAGES.slice(index + 1)) {
      if (state.stages[later]?.status && state.stages[later].status !== "missing") state.stages[later] = { ...state.stages[later], status: "stale" };
    }
    await this.writeState(root, taskId, state);
    return { state, file, revision };
  }
  async setReview(root, taskId, stage, decision, feedback) {
    const state = await this.readState(root, taskId);
    const at = new Date().toISOString();
    if (decision === "skip") { state.skipped = true; state.skipped_at = at; }
    state.stages[stage] = { ...state.stages[stage], status: decision === "approve" || decision === "skip" ? "approved" : "changes_requested", reviewed_at: at, feedback: feedback || undefined };
    await this.writeState(root, taskId, state);
    return state;
  }
}

