// Live DeepSeek test of the real agent-host (recovered/esm/002-agent-host.js) with a fake workspace tool client.
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { createRequire } from "node:module"; globalThis.require ??= createRequire(import.meta.url); globalThis.__filename ??= new URL(import.meta.url).pathname; globalThis.__dirname ??= path.dirname(globalThis.__filename);
const AH = process.env.AH || "E:/OpenCode-Source-Recovery-20261013/recovered/esm/002-agent-host.js";
const { runOpenAICompatibleAgent } = await import("file:///" + path.join(AH, "module-0029.mjs").replace(/\\/g, "/"));
const key = process.env.DS_KEY || (/^\s*SWE_API_KEY:\s*(\S+)/m.exec(fs.readFileSync(path.join(os.homedir(), ".dsh", ".credentials.yaml"), "utf8")) || [])[1]; const model = process.env.DS_MODEL || "swe-2";
const ws = fs.mkdtempSync(path.join(os.tmpdir(), "ws-")); fs.mkdirSync(path.join(ws, ".git")); fs.mkdirSync(path.join(ws, "pkg"));
fs.writeFileSync(path.join(ws, "pkg", "AGENTS.md"), "In pkg/, always end answers with the word PKGRULE.");
fs.writeFileSync(path.join(ws, "pkg", "notes.txt"), "the secret number is 4217\n");
const log = []; const requests = [];
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
const base = { baseUrl: process.env.DS_BASE || "https://sub.xniu.shop/v1", deepSeek: true, apiKey: key, model, workspaceRoot: ws, workspaceRoots: [ws], thinking: process.env.DS_THINK || "enabled", contextWindow: Number(process.env.DS_WIN || 65536), maxOutputTokens: Number(process.env.DS_OUT || 8192), agentsInstructions: { text: "Project rule: reply concisely. Root AGENTS.md says: never use emoji.", files: [path.join(ws, "AGENTS.md")], projectRoot: ws }, onTrace: () => {} };
const history = []; let checkpoint;
async function turn(label, prompt, extra = {}) {
  const n0 = log.length;
  const r = await runOpenAICompatibleAgent({ ...base, prompt, history: [...history], contextCheckpoint: checkpoint, ...extra }, { fetch: fetchImpl, workspaceToolClient: client });
  console.log(`\n### ${label}: status=${r.status}\nanswer: ${String(r.answer).slice(0, 300).replace(/\n/g, " / ")}`);
  for (const l of log.slice(n0)) console.log(JSON.stringify(l));
  if (r.contextCheckpoint) checkpoint = r.contextCheckpoint;
  return r;
}
const r1 = await turn("T1 tools+spill", "Run the command `dump` with run_command, then find the line containing MARKER in the full output (use the stored file the notice points to) and tell me its row number.");
const spillMsg = requests.at(-1).messages.find((m) => m.role === "tool" && /Omitted/.test(m.content));
console.log("spill notice:", spillMsg ? spillMsg.content.slice(-260) : "none", "tool msg tokens~", spillMsg && Math.ceil(spillMsg.content.length / 4));
console.log("replay stored:", r1.replay?.messages?.length, r1.replay && JSON.stringify(r1.replay).length);
history.push({ role: "user", content: r1.replay?.user ? "dump" : "dump", replayUser: r1.replay?.user });
history.push({ role: "assistant", content: r1.answer, replay: r1.replay?.messages, replayModel: r1.replay?.model });
const r2 = await turn("T2 replay + subdir AGENTS", "Read pkg/notes.txt and tell me the secret number. Also, what row did MARKER appear on last turn?");
history.push({ role: "user", content: "pkg", replayUser: r2.replay?.user });
history.push({ role: "assistant", content: r2.answer, replay: r2.replay?.messages, replayModel: r2.replay?.model });
const r3 = await turn("T3 manual compaction", "/compact", { compactOnly: true });
console.log("checkpoint:", checkpoint && { covered: checkpoint.covered, len: checkpoint.summary?.length }, "summary head:", String(checkpoint?.summary || "").slice(0, 400).replace(/\n/g, " / "));
const r4 = await turn("T4 after compaction", "What was the secret number and the MARKER row? Answer in one line.");
fs.writeFileSync(path.join(os.homedir(), "hark_live_requests.json"), JSON.stringify(requests.map((b) => ({ ...b, tools: b.tools?.map((t) => t.function?.name) })), null, 1));
