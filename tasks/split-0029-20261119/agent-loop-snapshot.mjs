// split-0029: 主循环拆分前后的行为快照。直接加载源码里的 module-0029，用假模型（fetch）和假工作区工具跑固定场景，
// 记录发给模型的请求体、trace 事件序列和返回值（去掉耗时/时间戳），与 snapshot.json 对比。
// 用法：node tasks/split-0029-20261119/agent-loop-snapshot.mjs [--update]
import fs from "node:fs";
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);
globalThis.__filename = new URL("../../opencode/resources/app/extensions/opencode/runtime/agent-host.js", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
globalThis.__dirname = globalThis.__filename.replace(/[\\/][^\\/]*$/, "");
const { runOpenAICompatibleAgent } = await import("../../recovered/esm/002-agent-host.js/module-0029.mjs");
const SNAP = new URL("./agent-loop-snapshot.json", import.meta.url);
const realNow = Date.now; let clock = Date.UTC(2026, 10, 19, 0, 0, 0); Date.now = () => (clock += 7);

const scrub = (v) => {
  if (Array.isArray(v)) return v.map(scrub);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (/(_ms|Ms|At|_at|elapsed|timestamp|createdAt)$/i.test(k)) { o[k] = typeof x; continue; }
      o[k] = scrub(x);
    }
    return o;
  }
  return v;
};
const toolDefs = [
  { name: "read_files", description: "Read files", inputSchema: { type: "object", properties: { paths: { type: "array" } } } },
  { name: "apply_patch", description: "Apply a patch", inputSchema: { type: "object", properties: { patch: { type: "string" } } } },
  { name: "list_directory", description: "List a directory", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
const fakeClient = (log) => ({
  listTools: async () => ({ tools: toolDefs }),
  callTool: async ({ name, arguments: args }) => { log.push(["callTool", name, args]); return { content: [{ type: "text", text: `${name} ok ${JSON.stringify(args)}` }] }; },
  close: async () => { log.push(["close"]); }
});
const chat = (content, toolCalls, extra = {}) => ({ id: "c", object: "chat.completion", model: "m", choices: [{ index: 0, finish_reason: toolCalls ? "tool_calls" : "stop", message: { role: "assistant", content, ...(toolCalls ? { tool_calls: toolCalls } : {}), ...extra } }], usage: { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 } });
const call = (id, name, args) => ({ id, type: "function", function: { name, arguments: typeof args === "string" ? args : JSON.stringify(args) } });
const anth = (blocks, stop) => ({ id: "a", type: "message", role: "assistant", model: "m", content: blocks, stop_reason: stop, usage: { input_tokens: 100, output_tokens: 10 } });

const longHistory = (n) => Array.from({ length: n }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `${i % 2 ? "answer" : "question"} ${i}: ` + "lorem ipsum dolor sit amet ".repeat(60) }));
const scenarios = {
  plain_answer: { replies: [chat("hello there")] },
  one_tool_then_answer: { replies: [chat(null, [call("t1", "read_files", { paths: ["a.txt"] })]), chat("read it")] },
  parallel_unknown_badjson: { replies: [chat("", [call("t1", "read_files", "{bad json"), call("t2", "nope_tool", {}), call("t3", "list_directory", { path: "." })]), chat("done")] },
  patch_denied: { input: { approveTools: ["apply_patch"], approveTool: async () => ({ allowed: false, reason: "no" }) }, replies: [chat(null, [call("p1", "apply_patch", { patch: "*** Begin Patch\n*** Update File: x.js\n@@\n-a\n+b\n*** End Patch" })]), chat("ok, not changed")] },
  patch_allowed_with_edit_hooks: { input: { approveTools: ["apply_patch"], approveTool: async () => ({ allowed: true }), beginEdit: async (p) => ({ p }), endEdit: async () => {} }, replies: [chat(null, [call("p1", "apply_patch", { patch: "*** Begin Patch\n*** Update File: x.js\n@@\n-a\n+b\n*** End Patch" })]), chat("changed")] },
  external_tool: { input: { externalTools: [{ name: "run_command", description: "Run", inputSchema: { type: "object", properties: { command: { type: "string" } } } }], executeExternalTool: async (n, a) => ({ text: `ran ${a.command}`, isError: false }) }, replies: [chat(null, [call("e1", "run_command", { command: "ls" })]), chat("listed")] },
  yield_after_first_step: { input: { shouldYield: () => true }, replies: [chat(null, [call("t1", "read_files", { paths: ["a"] })]), chat("never")] },
  context_overflow_then_ok: { replies: [{ status: 400, body: { error: { message: "This model's maximum context length is 1000 tokens. However, your messages resulted in 5000 tokens." } } }, chat("{\"summary\":\"s\"}"), chat("after overflow"), chat("spare")] },
  history_and_images: { input: { history: [{ role: "user", content: "earlier q" }, { role: "assistant", content: "earlier a" }], images: [{ url: "data:image/png;base64,AAAA" }] }, replies: [chat("saw it")] },
  tools_disabled: { input: { allowedTools: [] }, replies: [chat("no tools")] },
  anthropic_tool_then_answer: { input: { protocol: "anthropic-messages", thinking: "disabled" }, replies: [anth([{ type: "text", text: "let me look" }, { type: "tool_use", id: "tu1", name: "read_files", input: { paths: ["b"] } }], "tool_use"), anth([{ type: "text", text: "anthropic done" }], "end_turn")] },
  subagent_spawn: { input: { subagents: true }, replies: [chat(null, [call("s1", "spawn_subagent", { task: "look at a", mode: "read" })]), chat("child report"), chat("parent done")] },
  responses_tool_then_answer: { input: { protocol: "openai-responses", thinking: "disabled" }, replies: [{ body: { id: "r", object: "response", status: "completed", output: [{ type: "function_call", call_id: "fc1", name: "read_files", arguments: "{\"paths\":[\"c\"]}" }], usage: { input_tokens: 100, output_tokens: 5 } } }, { body: { id: "r2", object: "response", status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "responses done" }] }], usage: { input_tokens: 120, output_tokens: 5 } } }] },
  compact_threshold: { input: { contextWindow: 6000, history: longHistory(12) }, replies: [chat("SUMMARY of earlier work"), chat(null, [call("t1", "read_files", { paths: ["z"] })]), chat("after compaction")] },
  compact_only: { input: { compactOnly: true, contextWindow: 6000, history: longHistory(12) }, replies: [chat("ONLY SUMMARY")] },
  compact_failed_fallback_digest: { input: { contextWindow: 6000, history: longHistory(12) }, replies: [{ status: 500, body: { error: { message: "boom" } } }, chat("answer after failed compaction")] },
  restore_context_checkpoint: { input: { compactOnly: true, contextWindow: 6000, history: longHistory(12) }, then: (r) => ({ contextWindow: 6000, history: longHistory(14), contextCheckpoint: r.contextCheckpoint, prompt: "next question" }), replies: [chat("CHECKPOINT SUMMARY"), chat("answer using checkpoint")] },
  restore_agent_checkpoint: { input: { shouldYield: () => true }, then: (r, cps) => ({ checkpoint: cps[cps.length - 1], prompt: "do the thing" }), replies: [chat(null, [call("t1", "read_files", { paths: ["a"] })]), chat("resumed and finished")] },
  prompt_tool_fallback_last: { input: { model: "fake-notools-model" }, replies: [{ status: 400, body: { error: { message: "tools are not supported for this model" } } }, chat("checking <tool_call>{\"name\":\"read_files\",\"arguments\":{\"paths\":[\"d\"]}}</tool_call>"), chat("prompt mode done")] }
};

async function runScenario(name, sc) {
  const log = [], requests = [], traceSeen = [];
  let i = 0;
  const fetch = async (url, init) => {
    let body; try { body = JSON.parse(init.body); } catch { body = init.body; }
    requests.push({ url: String(url), body });
    const r = sc.replies[i++] ?? chat("(out of replies)");
    const isWrapped = r && (r.status || r.body);
    return new Response(JSON.stringify(isWrapped ? r.body : r), { status: isWrapped ? r.status ?? 200 : 200, headers: { "content-type": "application/json" } });
  };
  const checkpoints = [];
  const base = { baseUrl: "https://fake.local/v1", apiKey: "k", model: "fake-model", prompt: "do the thing", workspaceRoot: "E:/ws", workspaceRoots: ["E:/ws"], retries: 0, subagents: false, onTrace: (t) => traceSeen.push(t), onCheckpoint: (c) => checkpoints.push(c) };
  const input = { ...base, ...sc.input };
  let result, error, second;
  try { result = await runOpenAICompatibleAgent(input, { fetch, workspaceToolClient: fakeClient(log) }); }
  catch (e) { error = String(e?.message ?? e); }
  if (sc.then && result) {
    const next = { ...base, ...sc.then(result, checkpoints) };
    try { second = await runOpenAICompatibleAgent(next, { fetch, workspaceToolClient: fakeClient(log) }); }
    catch (e) { second = { error: String(e?.message ?? e) }; }
    if (second) delete second.checkpoint;
  }
  if (result) { delete result.checkpoint; }
  if (second) return scrub({ requests, toolLog: log, trace: result?.trace ?? traceSeen, result: { ...result, trace: void 0 }, second, error });
  return scrub({ requests, toolLog: log, trace: result?.trace ?? traceSeen, result: result ? { ...result, trace: void 0 } : void 0, error });
}

const out = {};
for (const [name, sc] of Object.entries(scenarios)) { clock = Date.UTC(2026, 10, 19); out[name] = await runScenario(name, sc); }
Date.now = realNow;
const text = JSON.stringify(out, null, 1);
if (process.argv.includes("--update") || !fs.existsSync(SNAP)) { fs.writeFileSync(SNAP, text); console.log("SNAPSHOT WRITTEN", Object.keys(out).length, "scenarios", text.length, "bytes"); process.exit(0); }
const prev = JSON.parse(fs.readFileSync(SNAP, "utf8")); let bad = 0;
for (const k of Object.keys(out)) {
  const a = JSON.stringify(prev[k]), b = JSON.stringify(JSON.parse(JSON.stringify(out[k])));
  if (a !== b) { bad++; let j = 0; while (j < a.length && a[j] === b[j]) j++; console.log(`DIFF ${k} at ${j}:\n  was: ${a?.slice(Math.max(0, j - 120), j + 200)}\n  now: ${b.slice(Math.max(0, j - 120), j + 200)}`); }
}
console.log(bad ? `FAIL ${bad} scenario(s) differ` : `PASS agent loop snapshot (${Object.keys(out).length} scenarios)`);
process.exit(bad ? 1 : 0);
