// context-compaction-dsh 端到端：真实 agent-host 循环 + 模拟 OpenAI 兼容服务（不联网、不用真实密钥）
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { pathToFileURL } from "node:url";
const root = process.cwd();
const src = path.join(root, "recovered/esm/002-agent-host.js");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oc-e2e-ah-"));
for (const f of fs.readdirSync(src)) {
  if (!f.endsWith(".mjs")) continue;
  let t = fs.readFileSync(path.join(src, f), "utf8");
  if (/\brequire\(|__filename|__dirname/.test(t)) t = `import { createRequire as __ocCR } from "node:module"; const require = __ocCR(import.meta.url); const __filename = new URL(import.meta.url).pathname.replace(/^\\/([A-Za-z]:)/, "$1"); const __dirname = __filename.replace(/[\\\\/][^\\\\/]*$/, "");\n` + t;
  fs.writeFileSync(path.join(tmp, f), t);
}
const mod = await import(pathToFileURL(path.join(tmp, "module-0029.mjs")).href);
const run = mod.runOpenAICompatibleAgent;
if (typeof run !== "function") { console.log("NO runOpenAICompatibleAgent export:", Object.keys(mod).join(",")); process.exit(2); }
const results = []; const ok = (n, c, extra = "") => { results.push(c); console.log(`${c ? "PASS" : "FAIL"} ${n}${extra ? " — " + extra : ""}`); };

function sse(chunks) { return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { status: 200, headers: { "content-type": "text/event-stream" } }); }
function scenario({ window, toolChars, steps, overflowAtChars, label, outputReserve, deepSeek }) {
  const log = { requests: [], compactions: [], traces: [] };
  let step = 0;
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body); const chars = JSON.stringify(body.messages).length;
    const isCompaction = body.messages.some((m) => typeof m.content === "string" && m.content.startsWith("You compact the working context"));
    log.requests.push({ chars, isCompaction, n: body.messages.length, max_tokens: body.max_tokens ?? body.max_completion_tokens });
    if (overflowAtChars && chars > overflowAtChars && !isCompaction) {
      return new Response(JSON.stringify({ error: { message: `This model's maximum context length is ${Math.floor(overflowAtChars / 4)} tokens. However, your messages resulted in ${Math.floor(chars / 4)} tokens.`, type: "invalid_request_error", code: "context_length_exceeded" } }), { status: 400, headers: { "content-type": "application/json" } });
    }
    const usage = { prompt_tokens: Math.ceil(chars / 4), completion_tokens: 20, total_tokens: Math.ceil(chars / 4) + 20 };
    if (isCompaction) return sse([{ choices: [{ index: 0, delta: { role: "assistant", content: "CHECKPOINT: 已读 a..z 文件，下一步继续读剩余文件。" } }] }, { choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage }]);
    step += 1;
    if (step <= steps) return sse([{ choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, id: `call_${step}`, type: "function", function: { name: "read_file", arguments: JSON.stringify({ path: `f${step}.txt` }) } }] } }] }, { choices: [{ index: 0, delta: {}, finish_reason: "tool_calls" }], usage }]);
    return sse([{ choices: [{ index: 0, delta: { role: "assistant", content: "DONE" } }] }, { choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage }]);
  };
  const client = {
    listTools: async () => ({ tools: [{ name: "read_file", description: "read a file", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } }] }),
    callTool: async ({ name, arguments: a }) => ({ content: [{ type: "text", text: `HEAD-${a.path}-` + "x".repeat(toolChars) + `-TAIL-${a.path}` }] }),
    close: async () => {}
  };
  const input = { protocol: "openai-chat-completions", baseUrl: "http://127.0.0.1:9/v1", apiKey: "test", model: "mock-model", prompt: "读取所有文件", history: [], workspaceRoot: tmp, workspaceRoots: [tmp],
    contextWindow: window, ...(deepSeek ? { deepSeek: true } : {}), maxOutputTokens: 32768, retries: 0, thinking: "disabled",
    contextCompaction: { auto: true, ...(outputReserve !== undefined ? { outputReserve } : {}) },
    onTrace: (t) => { log.traces.push(t); if (t.type === "context_compaction") log.compactions.push(t.data); } };
  return { label, log, go: () => run(input, { fetch: fetchImpl, workspaceToolClient: client, fileToolRequestTimeoutMs: 30000 }) };
}
// 1) 128K 窗口、O=0：触发点 62464 tokens（约 25 万字符）；每次工具 3 万字符
{
  const s = scenario({ label: "128K", window: 128000, toolChars: 30000, steps: 14, outputReserve: 0 });
  let r, err; try { r = await s.go(); } catch (e) { err = e; }
  ok("128K 对话跑完", !err && r?.status === "completed", err ? String(err.message).slice(0, 200) : `status=${r?.status} answer=${String(r?.answer).slice(0, 40)}`);
  const start = s.log.compactions.find((c) => c.phase === "start"); const end = s.log.compactions.find((c) => c.phase === "end");
  ok("128K 触发了压缩", !!start, start ? `before=${start.before} reason=${start.reason}` : JSON.stringify(s.log.compactions).slice(0, 200));
  if (start) ok("128K 触发点在 62464 附近（之前一步没超）", start.before > 62464 && start.before < 62464 + 12000, `before=${start.before}`);
  if (end) ok("128K 压缩后显著变小、未失败", end.after < end.before / 2 && !end.failed, `after=${end.after} failed=${end.failed}`);
  ok("没有 60% 时的 cleared 清理", !s.log.compactions.some((c) => c.phase === "cleared"));
  const firstAfter = s.log.requests.findIndex((q) => q.isCompaction);
  const next = s.log.requests[firstAfter + 1];
  ok("压缩后下一次请求体变小", next && next.chars < s.log.requests[firstAfter - 1].chars, `before=${s.log.requests[firstAfter - 1]?.chars} after=${next?.chars}`);
  ok("默认 max_tokens = 32768", s.log.requests.every((q) => q.max_tokens === undefined || q.max_tokens <= 32768), `seen=${[...new Set(s.log.requests.map((q) => q.max_tokens))].join(",")}`);
  console.log("  requests:", s.log.requests.map((q) => (q.isCompaction ? "C" : "") + q.chars).join(" "));
}
// 2) 保留下来的工具结果被裁剪（>8K 字符 → 头 4K + 尾 1K）
{
  const s = scenario({ label: "trim", window: 128000, toolChars: 30000, steps: 14, outputReserve: 0 });
  const seen = []; const orig = s.go;
  await orig();
  const idx = s.log.requests.findIndex((q) => q.isCompaction);
  const after = s.log.requests[idx + 1];
  ok("压缩后保留的工具结果每条不超过约 5.2K 字符", after && after.chars < 6 * 5300 + 20000, `after request chars=${after?.chars}`);
}
// 3) 配置窗口写大（262144），服务端实际 65536：从报错学到真实窗口并压缩重试后完成
{
  const s = scenario({ label: "overflow", window: 262144, toolChars: 30000, steps: 12, overflowAtChars: 65536 * 4, outputReserve: 0 });
  let r, err; try { r = await s.go(); } catch (e) { err = e; }
  ok("超长报错后自动恢复并完成", !err && r?.status === "completed", err ? String(err.message).slice(0, 240) : `status=${r?.status}`);
  const ends = s.log.compactions.filter((c) => c.phase === "end");
  ok("溢出触发了压缩", s.log.compactions.some((c) => c.reason === "overflow"), JSON.stringify(s.log.compactions.map((c) => [c.phase, c.reason, c.window])).slice(0, 300));
  ok("之后窗口按学到的值计算", ends.some((c) => c.window <= 70000), `windows=${ends.map((c) => c.window).join(",")}`);
  const thr = s.log.compactions.filter((c) => c.phase === "start" && c.reason === "threshold");
  ok("学到 64K 后不会在 2.6 万以下就压缩", thr.every((c) => c.before > 26214), `threshold befores=${thr.map((c) => c.before).join(",")}`);
  console.log("  requests:", s.log.requests.map((q) => (q.isCompaction ? "C" : "") + q.chars).join(" "));
}
// 4) DeepSeek 官方 1M：O=256000 → 触发点 727040；max_tokens 256000
{
  const s = scenario({ label: "ds", window: 1048576, toolChars: 400000, steps: 9, deepSeek: true, outputReserve: 256000 });
  let r, err; try { r = await s.go(); } catch (e) { err = e; }
  const start = s.log.compactions.find((c) => c.phase === "start");
  ok("DeepSeek 1M 跑完", !err && r?.status === "completed", err ? String(err.message).slice(0, 200) : "");
  ok("DeepSeek 触发点约 727040", start && start.before > 727040 && start.before < 727040 + 110000, `before=${start?.before}`);
  ok("DeepSeek max_tokens ≤ 256000", s.log.requests.filter((q) => !q.isCompaction).every((q) => q.max_tokens === undefined || q.max_tokens <= 256000), `seen=${[...new Set(s.log.requests.map((q) => q.max_tokens))].join(",")}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
const fails = results.filter((x) => !x).length; console.log(`${results.length - fails}/${results.length} 通过`); process.exit(fails ? 1 : 0);
