// Live DeepSeek test of the real agent-host (recovered/esm/002-agent-host.js) with a fake workspace tool client.
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { createRequire } from "node:module"; globalThis.require ??= createRequire(import.meta.url); globalThis.__filename ??= new URL(import.meta.url).pathname; globalThis.__dirname ??= path.dirname(globalThis.__filename);
const AH = process.env.AH || "E:/OpenCode-Source-Recovery-20261013/recovered/esm/002-agent-host.js";
const { runOpenAICompatibleAgent } = await import("file:///" + path.join(AH, "module-0029.mjs").replace(/\\/g, "/"));
const key = process.env.DS_KEY || (/^\s*SWE_API_KEY:\s*(\S+)/m.exec(fs.readFileSync(path.join(os.homedir(), ".dsh", ".credentials.yaml"), "utf8")) || [])[1]; const model = process.env.DS_MODEL || "swe-2";
const ws = fs.mkdtempSync(path.join(os.tmpdir(), "ws-")); fs.mkdirSync(path.join(ws, ".git")); fs.mkdirSync(path.join(ws, "pkg"));
fs.writeFileSync(path.join(ws, "pkg", "AGENTS.md"), "In pkg/, always end answers with the word PKGRULE.");
fs.writeFileSync(path.join(ws, "pkg", "notes.txt"), "the secret number is 4217\n");
const log = []; const requests = []; const traces = [];
const fetchImpl = async (url, init) => {
  const body = JSON.parse(init.body); requests.push(body);
  const res = await fetch(url, init);
  const text = await res.text();
  const usage = [...text.matchAll(/"usage":(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean).pop();
  log.push({ status: res.status, roles: body.messages.map((m) => m.role[0] + (m.tool_calls ? "*" : "") + (m.reasoning_content ? "r" : "")).join(""), tools: body.tools?.length ?? 0, thinking: body.thinking?.type, last: String(typeof body.messages.at(-1).content === "string" ? body.messages.at(-1).content : JSON.stringify(body.messages.at(-1).content)).slice(0, 80), usage: usage && { prompt: usage.prompt_tokens, hit: usage.prompt_cache_hit_tokens ?? usage.prompt_tokens_details?.cached_tokens ?? usage.details?.cached_tokens, miss: usage.prompt_cache_miss_tokens, out: usage.completion_tokens }, error: res.status >= 400 ? text.slice(0, 400) : undefined });
  return new Response(text, { status: res.status, headers: res.headers });
};
const tools = [
  { name: "run_command", description: "Run a shell command in the workspace and return its output.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } },
  { name: "read_files", description: "Read text files. Pass files:[{path,start_line?,end_line?}].", inputSchema: { type: "object", properties: { files: { type: "array", items: { type: "object", properties: { path: { type: "string" }, start_line: { type: "integer" }, end_line: { type: "integer" } }, required: ["path"] } } }, required: ["files"] } }
];
const client = {
  listTools: async () => ({ tools }),
  callTool: async ({ name, arguments: a }) => {
    if (name === "run_command") { const lines = Array.from({ length: 4000 }, (_, i) => `row ${i}: ${i === 3333 ? "MARKER=ZEBRA-42" : "data".repeat(4)}`); return { content: [{ type: "text", text: lines.join("\n") }] }; }
    if (name === "read_files") { const out = []; for (const f of a.files || []) { const p = path.isAbsolute(f.path) ? f.path : path.join(ws, f.path); let t = fs.readFileSync(p, "utf8").split("\n"); const s = (f.start_line || 1) - 1, e = f.end_line || t.length; out.push(`== ${f.path}\n` + t.slice(s, e).join("\n")); } return { content: [{ type: "text", text: out.join("\n") }] }; }
    return { content: [{ type: "text", text: "unknown tool" }], isError: true };
  },
  close: async () => {}
};
const base = { baseUrl: process.env.DS_BASE || "https://sub.xniu.shop/v1", deepSeek: true, apiKey: key, model, workspaceRoot: ws, workspaceRoots: [ws], thinking: process.env.DS_THINK || "enabled", contextWindow: Number(process.env.DS_WIN || 65536), maxOutputTokens: Number(process.env.DS_OUT || 8192), agentsInstructions: { text: "Project rule: reply concisely. Root AGENTS.md says: never use emoji.", files: [path.join(ws, "AGENTS.md")], projectRoot: ws }, onTrace: (item) => { if (["usage","context_learned","context_compaction"].includes(item?.type)) traces.push(item); } };

const history = []; let checkpoint;
async function turn(label, prompt, extra = {}) {
  const n0 = log.length, t0 = traces.length;
  const r = await runOpenAICompatibleAgent({ ...base, prompt, history: [...history], contextCheckpoint: checkpoint, ...extra }, { fetch: fetchImpl, workspaceToolClient: client });
  console.log(`\n### ${label}: status=${r.status}\nanswer: ${String(r.answer).slice(0, 300).replace(/\n/g, " / ")}`);
  for (const l of log.slice(n0)) console.log(JSON.stringify(l));
  for (const t of traces.slice(t0)) if (t.type !== "usage" || t.data?.compaction || t.data?.tokenRatio) console.log("trace", t.type, JSON.stringify({ ...t.data, contextBreakdown: undefined }).slice(0, 300));
  if (r.contextCheckpoint) checkpoint = r.contextCheckpoint;
  return r;
}
const nReq0 = requests.length;
const r1 = await turn("T1 dup spill + subagent + pressure", "Call run_command with command `dump` two separate times (sequentially, two tool calls). Then use spawn_subagent (read-only) and ask it to find the MARKER line in the stored result file named in the notice. Report the row number.");
const toolMsgs = requests.at(-1).messages.filter((m) => m.role === "tool");
console.log("tool msg sizes:", toolMsgs.map((m) => m.content.length), "dup notice:", (toolMsgs.find((m) => /identical to an earlier/.test(m.content))?.content || "none").slice(-300));
const parentFirst = requests[nReq0];
const sub = requests.slice(nReq0).find((b) => /<subagent_task>/.test(JSON.stringify(b.messages.at(-1)?.content ?? "")) && b.messages.length <= 4);
if (sub) console.log("subagent prefix: sameSystem=", sub.messages[0].content === parentFirst.messages[0].content, "sameTools=", JSON.stringify(sub.tools) === JSON.stringify(parentFirst.tools), "sameInstr=", JSON.stringify(sub.messages[1]) === JSON.stringify(parentFirst.messages[1]), "tools", sub.tools?.length);
else console.log("subagent request not found");
history.push({ role: "user", content: "dump", replayUser: r1.replay?.user });
history.push({ role: "assistant", content: r1.answer, replay: r1.replay?.messages, replayModel: r1.replay?.model });
// synthetic replay of an old turn (as the extension builds it from tool cards): no reasoning, reasoning_content ""
history.push({ role: "user", content: "Read pkg/notes.txt" });
history.push({ role: "assistant", content: "The note says the secret number is 4217.", replaySynthetic: true, replay: [
  { role: "assistant", content: "", reasoning_content: "", tool_calls: [{ id: "call_old_1", type: "function", function: { name: "read_files", arguments: JSON.stringify({ files: [{ path: "pkg/notes.txt" }] }) } }] },
  { role: "tool", tool_call_id: "call_old_1", content: "== pkg/notes.txt\nthe secret number is 4217\n" },
  { role: "assistant", content: "The note says the secret number is 4217." }] });
await turn("T2 synthetic replay", "Which tool did you call to learn the secret number, with what arguments? One line.");
await turn("T3 manual compaction usage", "/compact", { compactOnly: true });
console.log("checkpoint:", checkpoint && { covered: checkpoint.covered, len: checkpoint.summary?.length });
