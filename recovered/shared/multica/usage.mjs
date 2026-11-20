// Item 8 — usage: call counts and estimated tokens per task and per model (model = overview_model the dialogue
// reported on its task card; "unknown" otherwise). Estimate: ASCII chars / 4 + other chars × 1 (CJK ≈ 1 token).
import { statePath, readJson, writeJsonAtomic, resultText, nowIso } from "./core.mjs";

const file = () => statePath("usage", "usage.json");
export function estimateTokens(s) {
  const str = typeof s === "string" ? s : JSON.stringify(s ?? "");
  let ascii = 0, other = 0;
  for (const ch of str) (ch.charCodeAt(0) < 128 ? ascii++ : other++);
  return Math.ceil(ascii / 4) + other;
}
const bump = (bucket, key, inTok, outTok, tool) => {
  const b = (bucket[key] ??= { calls: 0, inTokens: 0, outTokens: 0, byTool: {} });
  b.calls++; b.inTokens += inTok; b.outTokens += outTok; b.byTool[tool] = (b.byTool[tool] ?? 0) + 1; b.last = nowIso();
};
export function recordUsage(ctx) {
  const db = readJson(file(), { since: nowIso(), total: { calls: 0, inTokens: 0, outTokens: 0, byTool: {} }, byTask: {}, byModel: {} });
  const top = ctx.calls[0];
  const inTok = estimateTokens(top.args), outTok = estimateTokens(top.result ? resultText(top.result) : "");
  const task = ctx.session?.taskId ?? "(no-task)", model = ctx.session?.model ?? "unknown";
  db.total.calls++; db.total.inTokens += inTok; db.total.outTokens += outTok; db.total.byTool[top.tool] = (db.total.byTool[top.tool] ?? 0) + 1;
  bump(db.byTask, task, inTok, outTok, top.tool);
  bump(db.byModel, model, inTok, outTok, top.tool);
  for (const c of ctx.calls.slice(1)) { db.byTask[task].byTool[c.tool] = (db.byTask[task].byTool[c.tool] ?? 0) + 1; }
  writeJsonAtomic(file(), db);
}
export const usageFeature = {
  id: "usage",
  after(ctx) { if (ctx.config.usage?.enabled) recordUsage(ctx); },
  actions: {
    usage_report: (a) => {
      const db = readJson(file(), null);
      if (!db) return { empty: true };
      if (a.task_id) return { task_id: a.task_id, usage: db.byTask[a.task_id] ?? null };
      if (a.model) return { model: a.model, usage: db.byModel[a.model] ?? null };
      return { ...db, note: "token 为估算值（ASCII/4 + 非 ASCII×1），只统计经 Bridge 的工具调用往返文本，不含模型自身推理" };
    }
  }
};
