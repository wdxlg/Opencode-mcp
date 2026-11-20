// Item 3 — steer: a message the user sends while a run is in progress is queued and injected into the very next
// tool receipt of that run (appended text block), instead of waiting for the next turn.
// Queue key = task card id (the run), or "_any" for "whichever run calls a tool next".
import fs from "node:fs";
import { statePath, appendJsonl, readJsonlFamily, nowIso, newId, safeName, redactString } from "./core.mjs";

const queueFile = (key) => statePath("steer", `${safeName(key)}.jsonl`);
const ANY = "_any";

export function postSteer({ task_id, text, from = "user" } = {}) {
  const body = String(text ?? "").trim();
  if (!body) throw Object.assign(new Error("text 不能为空"), { code: "INVALID_ARGUMENT" });
  const entry = { id: newId("steer"), ts: nowIso(), task_id: task_id ?? null, from, text: body.slice(0, 4000) };
  appendJsonl(queueFile(task_id ?? ANY), entry);
  return entry;
}
export function pendingSteer(taskId) {
  return [...(taskId ? readJsonlFamily(queueFile(taskId), 1) : []), ...readJsonlFamily(queueFile(ANY), 1)];
}
/** Atomically take the pending messages for a run (rename-then-read so two receipts never deliver one twice). */
export function takeSteer(taskId) {
  const out = [];
  for (const key of [taskId, ANY].filter(Boolean)) {
    const f = queueFile(key), claim = `${f}.${process.pid}.${Date.now()}.claim`;
    try { fs.renameSync(f, claim); } catch { continue; }
    for (const l of fs.readFileSync(claim, "utf8").split("\n")) { if (l.trim()) { try { out.push(JSON.parse(l)); } catch {} } }
    fs.rmSync(claim, { force: true });
  }
  return out.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
}
export function formatSteer(messages) {
  return ["", "【运行中插话】用户在本次运行进行中发来以下消息，请在继续之前先阅读并按其调整（不是新一轮对话）：",
    ...messages.map((m) => `- [${m.ts}] ${m.text}`)].join("\n");
}

export const steerFeature = {
  id: "steer",
  after(ctx) {
    if (!ctx.config.steer?.enabled || ctx.error || !ctx.result) return;
    const msgs = takeSteer(ctx.session?.taskId);
    if (!msgs.length) return;
    for (const m of msgs) appendJsonl(statePath("steer", "delivered.jsonl"), { ...m, deliveredAt: nowIso(), deliveredTo: ctx.session?.taskId ?? null, tool: ctx.toolName });
    const content = Array.isArray(ctx.result.content) ? [...ctx.result.content] : [];
    content.push({ type: "text", text: formatSteer(msgs) });
    ctx.notes.push(`steer:${msgs.length}`);
    return { ...ctx.result, content };
  },
  actions: {
    steer_post: (a) => ({ queued: postSteer(a) }),
    steer_list: (a) => ({ pending: pendingSteer(a.task_id).map((m) => ({ ...m, text: redactString(m.text, 300) })) })
  }
};
