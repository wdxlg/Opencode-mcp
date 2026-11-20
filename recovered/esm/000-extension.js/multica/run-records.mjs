// Item 2 — run records: every tool call (bridge_batch sub-calls included), command and error is appended to a
// redacted, rotated JSONL log with timestamps. Query / replay / verify actions let acceptance prove that a check
// really ran (e.g. "npm run build" with exit code 0) instead of trusting a report.
import { statePath, appendJsonl, readJsonlFamily, redact, redactString, resultText, nowIso, newId } from "./core.mjs";

export const recordsFile = () => statePath("records", "runs.jsonl");

function commandInfo(tool, args, text) {
  const exit = text.match(/^exit_code:\s*(-?\d+)/m)?.[1];
  const status = text.match(/^status:\s*(\w+)/m)?.[1];
  const commandId = text.match(/^command_id:\s*(\S+)/m)?.[1] ?? args?.command_id ?? null;
  return {
    command: tool === "run_command" ? args?.command ?? null : null,
    cwd: args?.cwd ?? null,
    commandId,
    commandStatus: status ?? null,
    exitCode: exit == null ? null : Number(exit)
  };
}

export function buildRecords(ctx, cfg) {
  const max = cfg?.maxField ?? 2000;
  const parentId = newId("run");
  return ctx.calls.map((c, i) => {
    const text = c.result ? resultText(c.result) : "";
    const isCmd = c.tool === "run_command" || c.tool === "get_command_output";
    const rec = {
      id: i === 0 ? parentId : `${parentId}.${i}`,
      parent: i === 0 ? null : parentId,
      ts: nowIso(ctx.startedAt),
      end: nowIso(ctx.endedAt),
      durationMs: ctx.endedAt - ctx.startedAt,
      owner: ctx.ownerId ?? null,
      task_id: ctx.session?.taskId ?? null,
      model: ctx.session?.model ?? null,
      tool: c.tool,
      attempts: i === 0 ? ctx.attempts : undefined,
      status: i === 0 && ctx.error ? "exception" : i === 0 && ctx.denied ? "denied" : c.result?.isError ? "error" : c.result ? "ok" : "unknown",
      args: redact(c.tool === "apply_patch" ? { ...c.args, patch: `[patch ${String(c.args?.patch ?? "").length} chars]` } : c.args, max),
      result: redactString(text.slice(0, 600), 600)
    };
    if (i === 0 && ctx.error) rec.error = redactString(String(ctx.error?.message ?? ctx.error), 600);
    if (isCmd) Object.assign(rec, redact(commandInfo(c.tool, c.args, text), max));
    return rec;
  });
}

export function queryRecords(q = {}) {
  let rows = readJsonlFamily(recordsFile());
  if (q.task_id) rows = rows.filter((r) => r.task_id === q.task_id);
  if (q.tool) rows = rows.filter((r) => r.tool === q.tool);
  if (q.status) rows = rows.filter((r) => r.status === q.status);
  if (q.since) rows = rows.filter((r) => r.ts >= new Date(q.since).toISOString());
  if (q.until) rows = rows.filter((r) => r.ts <= new Date(q.until).toISOString());
  if (q.contains) rows = rows.filter((r) => JSON.stringify([r.args, r.command, r.result]).includes(q.contains));
  const limit = Math.max(1, Math.min(Number(q.limit) || 50, 1000));
  return rows.slice(-limit);
}

export function replay(q = {}) {
  const rows = queryRecords({ ...q, limit: q.limit ?? 200 });
  const lines = rows.map((r) => {
    const what = r.command ? `$ ${r.command}` : r.tool === "get_command_output" ? `⟲ ${r.commandId}` : JSON.stringify(r.args).slice(0, 160);
    const tail = r.exitCode != null ? ` exit=${r.exitCode}` : r.commandStatus ? ` ${r.commandStatus}` : "";
    return `${r.ts} ${r.parent ? "  └" : "•"} ${r.tool} [${r.status}${tail}] ${what}`;
  });
  return { count: rows.length, timeline: lines.join("\n") };
}

/** Did a check really run? Matches run_command records by substring, follows command_id into get_command_output. */
export function verifyExecuted({ contains, tool = "run_command", task_id, since } = {}) {
  if (!contains) throw Object.assign(new Error("contains 必填（命令或参数中的片段）"), { code: "INVALID_ARGUMENT" });
  const all = queryRecords({ task_id, since, limit: 1000 });
  const hits = all.filter((r) => r.tool === tool && JSON.stringify([r.args, r.command]).includes(contains));
  const runs = hits.map((h) => {
    const follow = all.filter((r) => r.commandId && r.commandId === h.commandId && r.exitCode != null);
    const final = h.exitCode != null ? h : follow.at(-1);
    return { id: h.id, ts: h.ts, status: h.status, commandId: h.commandId ?? null, exitCode: final?.exitCode ?? null, finished: !!final };
  });
  return { executed: runs.length > 0, count: runs.length, passed: runs.some((r) => r.exitCode === 0), runs: runs.slice(-10) };
}

export const runRecordsFeature = {
  id: "runRecords",
  after(ctx) {
    const cfg = ctx.config.runRecords;
    if (!cfg?.enabled) return;
    for (const rec of buildRecords(ctx, cfg)) appendJsonl(recordsFile(), rec, cfg);
  },
  actions: {
    records_query: (a) => ({ records: queryRecords(a) }),
    records_replay: (a) => replay(a),
    records_verify: (a) => verifyExecuted(a)
  }
};
