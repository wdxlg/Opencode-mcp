// Item 1 — the Bridge task card is the single source of truth. task.md / progress.md of a bound task directory
// get a generated block (one-way: card → files; hand edits inside the block are overwritten), plus a
// .task-card.json snapshot so a disconnected dialogue can rebuild/hand over the card from disk.
import fs from "node:fs";
import path from "node:path";
import { statePath, readJson, writeJsonAtomic, safeName, resultText, nowIso } from "./core.mjs";

export const CARD_TOOLS = new Set(["set_todos", "update_plan"]);
export const BLOCK_BEGIN = "<!-- opencode-task-card:begin (generated from the Bridge task card; edits inside are overwritten) -->";
export const BLOCK_END = "<!-- opencode-task-card:end -->";

const cardFile = (taskId) => statePath("tasks", `${safeName(taskId)}.json`);
export function loadCard(taskId) { return taskId ? readJson(cardFile(taskId), null) : null; }
export function saveCard(card) { writeJsonAtomic(cardFile(card.task_id), card); return card; }
export function listCards() {
  const dir = statePath("tasks");
  let names = [];
  try { names = fs.readdirSync(dir).filter((n) => n.endsWith(".json")); } catch { names = []; }
  return names.map((n) => readJson(path.join(dir, n), null)).filter(Boolean)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

/** Pull task id / revision / lifecycle out of a set_todos or update_plan receipt (structured first, text fallback). */
export function parseCardReceipt(result) {
  const sc = result?.structuredContent ?? {};
  const text = resultText(result);
  const taskId = sc.task_id ?? sc.taskId ?? sc.task?.id ?? (text.match(/任务编号[:：]\s*([A-Za-z0-9_-]{6,})/) || text.match(/task_id[\"']?\s*[:=]\s*[\"']?([A-Za-z0-9_-]{6,})/))?.[1] ?? null;
  const rev = sc.task_revision ?? sc.revision ?? sc.task?.revision ?? (text.match(/修订号[:：]\s*(\d+)/) || text.match(/revision[\"']?\s*[:=]\s*(\d+)/))?.[1];
  return { taskId, revision: rev == null ? null : Number(rev) };
}

function normalizeSteps(args) {
  const raw = Array.isArray(args?.todos) ? args.todos : Array.isArray(args?.plan) ? args.plan : [];
  return raw.map((s, i) => ({
    id: String(s.id ?? s.step_id ?? `step${i + 1}`),
    title: String(s.title ?? s.content ?? s.step ?? ""),
    status: String(s.status ?? s.state ?? "pending").replace("in-progress", "in_progress").replace(/^done$/, "completed")
  }));
}

/** Apply one successful card update to the stored card; returns the new card or null when not a card receipt. */
export function applyCardUpdate(toolName, args, result, { ownerId = null, at = Date.now() } = {}) {
  if (!CARD_TOOLS.has(toolName) || result?.isError) return null;
  const { taskId, revision } = parseCardReceipt(result);
  const id = taskId ?? args?.task_id;
  if (!id) return null;
  const prev = loadCard(id) ?? { task_id: id, todos: [], bindings: [] };
  const steps = normalizeSteps(args);
  let todos = prev.todos;
  if (args?.mode === "patch") {
    const map = new Map(prev.todos.map((t) => [t.id, t]));
    for (const s of steps) map.set(s.id, { ...(map.get(s.id) ?? {}), ...s });
    todos = [...map.values()];
  } else if (steps.length || args?.new_task) todos = steps;
  const card = {
    ...prev,
    task_id: id,
    revision: revision ?? (prev.revision ?? 0) + 1,
    title: args?.task_title ?? prev.title ?? null,
    lifecycle: args?.lifecycle ?? prev.lifecycle ?? "running",
    model: args?.overview_model ?? prev.model ?? null,
    overview_session_id: args?.overview_session_id ?? prev.overview_session_id ?? null,
    owner: ownerId ?? prev.owner ?? null,
    todos,
    updatedAt: nowIso(at)
  };
  saveCard(card);
  for (const dir of card.bindings ?? []) { try { renderBoundDir(card, dir); } catch {} }
  return card;
}

const ICON = { completed: "[x]", in_progress: "[~]", pending: "[ ]" };
export function renderCardMarkdown(card, kind) {
  const done = card.todos.filter((t) => t.status === "completed").length;
  const cur = card.todos.find((t) => t.status === "in_progress");
  const lines = [BLOCK_BEGIN, `## 任务卡状态（${kind === "progress" ? "进度" : "目标"}，由任务卡生成）`, "",
    `- 任务卡 id：${card.task_id}`, `- 修订号：${card.revision}`, `- 生命周期：${card.lifecycle}`,
    `- 标题：${card.title ?? "（未设置）"}`, `- 完成：${done}/${card.todos.length}`, `- 同步时间：${card.updatedAt}`];
  if (kind === "progress") {
    lines.push(`- 当前步骤：${cur ? `${cur.id} ${cur.title}` : "（无）"}`);
    const next = card.todos.find((t) => t.status === "pending");
    lines.push(`- 下一步：${next ? `${next.id} ${next.title}` : "（无）"}`);
  } else {
    lines.push("", "| id | 状态 | 标题 |", "|---|---|---|");
    for (const t of card.todos) lines.push(`| ${t.id} | ${ICON[t.status] ?? t.status} ${t.status} | ${String(t.title).replace(/\|/g, "\\|")} |`);
  }
  lines.push(BLOCK_END);
  return lines.join("\n");
}
export function upsertBlock(text, block) {
  const a = text.indexOf(BLOCK_BEGIN.slice(0, 33)), b = text.indexOf(BLOCK_END);
  if (a >= 0 && b > a) return text.slice(0, a) + block + text.slice(b + BLOCK_END.length);
  return `${text.replace(/\s*$/, "")}${text.trim() ? "\n\n" : ""}${block}\n`;
}
export function renderBoundDir(card, dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [file, kind] of [["task.md", "task"], ["progress.md", "progress"]]) {
    const p = path.join(dir, file);
    let text = "";
    try { text = fs.readFileSync(p, "utf8"); } catch { text = `# ${card.title ?? card.task_id}\n`; }
    const next = upsertBlock(text, renderCardMarkdown(card, kind));
    if (next !== text) fs.writeFileSync(p, next);
  }
  writeJsonAtomic(path.join(dir, ".task-card.json"), card);
}

export function bindDir(taskId, dir) {
  const card = loadCard(taskId);
  if (!card) throw Object.assign(new Error(`未知任务卡：${taskId}（先用 set_todos 创建/更新一次）`), { code: "UNKNOWN_TASK" });
  const abs = path.resolve(dir);
  card.bindings = [...new Set([...(card.bindings ?? []), abs])];
  saveCard(card);
  renderBoundDir(card, abs);
  return card;
}

/** Disconnect recovery: card from the state store, else from a bound directory's .task-card.json. */
export function recoverCard({ task_id, dir } = {}) {
  const card = loadCard(task_id) ?? (dir ? readJson(path.join(path.resolve(dir), ".task-card.json"), null) : null);
  if (!card) return null;
  return {
    card,
    resume: { tool: "set_todos", arguments: { task_id: card.task_id, expected_revision: card.revision, handoff: true, todos: card.todos, task_title: card.title ?? undefined } }
  };
}

export const taskSyncFeature = {
  id: "taskSync",
  after(ctx) {
    if (!ctx.config.taskSync?.enabled) return;
    for (const call of ctx.calls) {
      const card = applyCardUpdate(call.tool, call.args, call.result, { ownerId: ctx.ownerId, at: ctx.endedAt });
      if (card) ctx.session.taskId = card.task_id, ctx.session.model = card.model ?? ctx.session.model;
    }
  },
  actions: {
    task_bind: (a) => ({ card: bindDir(a.task_id, a.dir) }),
    task_status: (a) => (a.task_id ? { card: loadCard(a.task_id) } : { cards: listCards().slice(0, a.limit ?? 20) }),
    task_recover: (a) => recoverCard(a) ?? { found: false }
  }
};
