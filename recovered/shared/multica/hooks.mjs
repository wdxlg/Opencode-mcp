// Multica-inspired operations runtime: one observer/wrapper around every Bridge tools/call (module-0119) plus one
// native tool, opencode_ops, that exposes each feature's actions. Design borrowed from multica-ai/multica; code is
// OpenCode's own. Any failure inside this layer is swallowed: the original tool call always proceeds.
import { loadConfig, redact } from "./core.mjs";
import { taskSyncFeature } from "./task-sync.mjs";
import { runRecordsFeature } from "./run-records.mjs";
import { steerFeature } from "./steer.mjs";
import { reviewGateFeature } from "./review-gate.mjs";
import { squadFeature } from "./squad.mjs";
import { retryFeature } from "./retry.mjs";
import { inboxFeature } from "./inbox.mjs";
import { usageFeature } from "./usage.mjs";
import { skillsLockFeature } from "./skills-lock.mjs";
import { permissionsFeature } from "./permissions.mjs";
import { channelsFeature } from "./channels.mjs";

// Feature registry — order matters: before() runs in order (first deny wins), after() runs in order.
export const FEATURES = [permissionsFeature, taskSyncFeature, runRecordsFeature, usageFeature, inboxFeature, skillsLockFeature, steerFeature, reviewGateFeature, squadFeature, retryFeature, channelsFeature];

export const MULTICA_OPS_TOOL_NAME = "opencode_ops";

function actionIndex() {
  const map = new Map();
  for (const f of FEATURES) for (const [name, fn] of Object.entries(f.actions ?? {})) map.set(name, { feature: f.id, fn });
  map.set("ops_status", { feature: "core", fn: () => ({ features: FEATURES.map((f) => f.id), config: redact(loadConfig()) }) });
  return map;
}

export function multicaOpsTool() {
  const actions = [...actionIndex().keys()];
  return {
    name: MULTICA_OPS_TOOL_NAME,
    title: "OpenCode Ops",
    description: [
      "OpenCode 运行管理（借鉴 Multica 设计，自行实现）：任务卡同步/恢复、运行记录查询与回放、插话、评审闸门、小队路由、重试策略、Inbox、用量、定时任务、Skills 锁、权限范围、渠道。",
      "action 决定操作，其余参数按 action 传入；action=ops_status 查看已启用功能与配置。新功能默认关闭或只做被动记录，配置文件 multica.config.json 位于 OPENCODE_MULTICA_HOME。",
      `可用 action：${actions.join(", ")}。`
    ].join(" "),
    inputSchema: {
      type: "object",
      required: ["action"],
      properties: { action: { type: "string", enum: actions, description: "要执行的操作。" } },
      additionalProperties: true
    },
    annotations: { title: "OpenCode Ops", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
  };
}

/** bridge_batch is expanded into its sub-calls so features see set_todos / run_command inside batches too. */
export function expandCalls(toolName, args, result) {
  const calls = [{ tool: toolName, args, result, batch: false }];
  if (toolName === "bridge_batch" && Array.isArray(args?.calls)) {
    const results = result?.structuredContent?.results;
    args.calls.forEach((c, i) => {
      const r = Array.isArray(results) ? (results.find((x) => c.id && x?.id === c.id) ?? results[i]) : undefined;
      const sub = r ? { content: [{ type: "text", text: r.text ?? "" }], isError: !!r.isError, structuredContent: r.structuredContent } : undefined;
      calls.push({ tool: c.tool, args: c.arguments ?? {}, result: sub, batch: true, index: i });
    });
  }
  return calls;
}

function asToolResult(value, isError = false) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: "text", text }], isError, structuredContent: typeof value === "object" && value !== null && !Array.isArray(value) ? value : { value } };
}

export function createMulticaRuntime({ now = () => Date.now() } = {}) {
  const sessions = new Map();
  const sessionOf = (ownerId) => {
    const key = ownerId ?? "_anonymous";
    if (!sessions.has(key)) sessions.set(key, { ownerId: key, taskId: null, model: null, role: null });
    return sessions.get(key);
  };
  const runtime = {
    sessions,
    opsToolVisible() { try { return loadConfig().opsTool !== false; } catch { return false; } },
    opsTool: multicaOpsTool,
    async handleOps(args, ctx = {}) {
      const action = args?.action;
      const entry = actionIndex().get(action);
      if (!entry) return asToolResult({ code: "UNKNOWN_ACTION", message: `未知 action：${action}`, actions: [...actionIndex().keys()] }, true);
      try { return asToolResult(await entry.fn(args, { ...ctx, runtime, session: sessionOf(ctx.ownerId), config: loadConfig() }) ?? { ok: true }); }
      catch (e) { return asToolResult({ code: e?.code ?? "OPS_FAILED", message: String(e?.message ?? e) }, true); }
    },
    /**
     * Wrap one tools/call. `dispatch` is the original dispatcher; it is always called unless a feature
     * explicitly denies (only permission scopes do that, and only when enabled).
     */
    async runToolCall({ toolName, args = {}, ownerId = null, taskOwnerId = null, signal } = {}, dispatch) {
      let config;
      try { config = loadConfig(); } catch { return dispatch(); }
      const session = sessionOf(ownerId);
      const ctx = { toolName, args, ownerId, taskOwnerId, signal, config, session, runtime, startedAt: now(), attempts: 1, notes: [] };
      for (const f of FEATURES) {
        if (!f.before) continue;
        try {
          const verdict = await f.before(ctx);
          if (verdict?.deny) { ctx.result = verdict.deny; ctx.denied = f.id; break; }
        } catch {}
      }
      if (!ctx.result) {
        if (toolName === MULTICA_OPS_TOOL_NAME && runtime.opsToolVisible()) ctx.result = await runtime.handleOps(args, { ownerId });
        else {
          const wrap = FEATURES.find((f) => f.wrapDispatch)?.wrapDispatch;
          try { ctx.result = wrap ? await wrap(ctx, dispatch) : await dispatch(); }
          catch (e) { ctx.error = e; }
        }
      }
      ctx.endedAt = now();
      ctx.calls = expandCalls(toolName, args, ctx.result);
      for (const f of FEATURES) {
        if (!f.after) continue;
        try { const next = await f.after(ctx); if (next && Array.isArray(next.content)) ctx.result = next; } catch {}
      }
      if (ctx.error) throw ctx.error;
      return ctx.result;
    }
  };
  return runtime;
}

let shared = null;
/** Process-wide runtime used by the Bridge transport. */
export function multicaRuntime() { return (shared ??= createMulticaRuntime()); }
