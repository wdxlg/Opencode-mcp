// Item 7 — Inbox: only things that need a human decision. Sources: interactive questions (bridge_ask_user) that are
// still waiting, task cards marked blocked, and review gates waiting for approval. Everything else stays out.
import { statePath, readJson, writeJsonAtomic, nowIso, resultText, redactString } from "./core.mjs";
import { listCards } from "./task-sync.mjs";
import { listReviews } from "./review-gate.mjs";

const file = () => statePath("inbox", "items.json");
const load = () => readJson(file(), { items: [] });
function upsert(item, max = 500) {
  const db = load();
  const i = db.items.findIndex((x) => x.key === item.key);
  if (i >= 0) db.items[i] = { ...db.items[i], ...item, updatedAt: nowIso() };
  else db.items.push({ ...item, createdAt: nowIso(), updatedAt: nowIso(), acked: false });
  db.items = db.items.slice(-max);
  writeJsonAtomic(file(), db);
}
function resolve(prefix) {
  const db = load();
  let n = 0;
  for (const it of db.items) if (!it.resolved && it.key.startsWith(prefix)) { it.resolved = true; it.resolvedAt = nowIso(); n++; }
  if (n) writeJsonAtomic(file(), db);
}

/** Pending human decisions, newest first. Reviews and blocked cards are read live so they never go stale. */
export function inboxItems({ include_acked = false } = {}) {
  const stored = load().items.filter((x) => !x.resolved && (include_acked || !x.acked));
  const live = [
    ...listReviews().filter((r) => r.status === "pending_review").map((r) => ({ key: `review:${r.task_id}`, kind: "review", task_id: r.task_id, title: `待评审：${r.branch}`, detail: r.summary || r.diffstat, createdAt: r.history?.at(-1)?.at })),
    ...listCards().filter((c) => c.lifecycle === "blocked").map((c) => ({ key: `blocked:${c.task_id}`, kind: "blocked", task_id: c.task_id, title: `任务受阻：${c.title ?? c.task_id}`, detail: c.todos.filter((t) => t.status !== "completed").map((t) => t.title).slice(0, 5).join("；"), createdAt: c.updatedAt }))
  ];
  const acked = new Set(load().items.filter((x) => x.acked).map((x) => x.key));
  return [...stored, ...live.filter((x) => include_acked || !acked.has(x.key))].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}
export function ackItem(key) {
  const db = load();
  const it = db.items.find((x) => x.key === key);
  if (it) it.acked = true; else db.items.push({ key, acked: true, resolved: false, kind: "ack", createdAt: nowIso() });
  writeJsonAtomic(file(), db);
  return { acked: key };
}

export const inboxFeature = {
  id: "inbox",
  after(ctx) {
    if (!ctx.config.inbox?.enabled) return;
    const max = ctx.config.inbox.maxEntries ?? 500;
    for (const c of ctx.calls) {
      if (c.tool === "bridge_ask_user" && c.result && !c.result.isError) {
        const t = resultText(c.result), sc = c.result.structuredContent ?? {};
        const id = sc.batch_id ?? sc.question_id ?? c.args?.batch_id ?? c.args?.question_id ?? t.match(/(?:batch_id|question_id)[\"':\s]+([\w-]{6,})/)?.[1] ?? null;
        const answered = sc.status === "answered" || /已回答|answered/i.test(sc.status ?? "") || (c.args?.mode === "check" && /answered|已回答/i.test(t) && !/pending|等待/i.test(t));
        if (id && answered) { resolve(`ask:${id}`); continue; }
        if (id || /pending|等待/i.test(t)) upsert({ key: `ask:${id ?? Date.now()}`, kind: "ask", task_id: ctx.session?.taskId ?? c.args?.task_id ?? null, title: "等待你回答的问题", detail: redactString(c.args?.question ?? (c.args?.questions ?? []).map((q) => q.question).join("；") ?? t, 600) }, max);
      }
      if ((c.tool === "set_todos" || c.tool === "update_plan") && c.args?.lifecycle && c.args.lifecycle !== "blocked" && ctx.session?.taskId) resolve(`blocked:${ctx.session.taskId}`);
    }
  },
  actions: {
    inbox_list: (a) => ({ items: inboxItems(a).slice(0, a.limit ?? 50) }),
    inbox_ack: (a) => ackItem(a.key)
  }
};
