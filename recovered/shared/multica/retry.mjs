// Item 6 — tool/command-level retry and timeout (default off). One retry at most: a second failure stops and the
// receipt says why. Non-idempotent tools (run_command, apply_patch, …) are only retried when configured explicitly.
const READ_ONLY = new Set(["read_files", "search_files", "find_files", "list_directory", "list_skills", "get_command_output", "read_image", "get_diagnostics", "lsp", "bridge_get_effective_rules", "bridge_memory_recall", "bridge_memory_search"]);
const TRANSIENT = /ETIMEDOUT|ECONNRESET|ECONNREFUSED|EBUSY|EAGAIN|EPIPE|socket hang up|timed? ?out|temporar|STALE|LOCKED|rate.?limit|超时|暂时/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function policyFor(toolName, cfg) {
  if (!cfg?.enabled) return null;
  const explicit = cfg.tools?.[toolName];
  if (explicit === false) return null;
  if (!explicit && !READ_ONLY.has(toolName)) return cfg.defaultTimeoutMs ? { retries: 0, timeoutMs: cfg.defaultTimeoutMs } : null;
  const p = { retries: 1, timeoutMs: cfg.defaultTimeoutMs ?? 0, backoffMs: 500, retryOn: null, ...(explicit ?? {}) };
  p.retries = Math.max(0, Math.min(1, Number(p.retries) || 0));
  return p;
}
const failureText = (r, e) => e ? String(e?.message ?? e) : (r?.content ?? []).filter((c) => c?.type === "text").map((c) => c.text).join("\n");

async function withTimeout(promiseFactory, ms, signal) {
  if (!ms) return promiseFactory();
  let timer;
  const timeout = new Promise((_, rej) => { timer = setTimeout(() => rej(Object.assign(new Error(`超时：${ms} ms 内未返回`), { code: "TOOL_TIMEOUT" })), ms); timer.unref?.(); });
  try { return await Promise.race([promiseFactory(), timeout]); } finally { clearTimeout(timer); }
}

export async function runWithPolicy(ctx, dispatch, policy) {
  const errors = [];
  for (let attempt = 1; attempt <= policy.retries + 1; attempt++) {
    ctx.attempts = attempt;
    let result, error;
    try { result = await withTimeout(dispatch, policy.timeoutMs, ctx.signal); } catch (e) { error = e; }
    if (!error && !result?.isError) return result;
    const why = failureText(result, error).slice(0, 400);
    errors.push(why);
    const transient = error?.code === "TOOL_TIMEOUT" || (policy.retryOn ? new RegExp(policy.retryOn, "i") : TRANSIENT).test(why);
    if (attempt <= policy.retries && transient && !ctx.signal?.aborted) { await sleep(policy.backoffMs ?? 500); continue; }
    const stopped = attempt > 1 ? `【已停止】第 ${attempt} 次仍失败，不再重试。原因：${why}` : `【未重试】${transient ? "已达重试上限" : "错误不属于可重试的暂时性故障"}。原因：${why}`;
    if (error && error.code !== "TOOL_TIMEOUT") { error.message = `${error.message}\n${stopped}`; throw error; }
    const base = result ?? { content: [], isError: true };
    return { ...base, isError: true, content: [...(base.content ?? []), { type: "text", text: stopped }], _retry: { attempts: attempt, errors } };
  }
}

export const retryFeature = {
  id: "retry",
  async wrapDispatch(ctx, dispatch) {
    const policy = policyFor(ctx.toolName, ctx.config.retry);
    return policy ? runWithPolicy(ctx, dispatch, policy) : dispatch();
  },
  actions: {
    retry_policy: (a, c) => ({ enabled: !!c.config.retry?.enabled, tool: a.tool ?? null, policy: a.tool ? policyFor(a.tool, c.config.retry) : null, readOnlyDefaults: [...READ_ONLY] })
  }
};
