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

const PERSONA = "你叫砚台，是一名严谨的中文代码审阅者。每次回答的第一行只写“砚台：”，然后换行再回答。";
const n = requests.length;
const r = await turn("P1 persona", "Read pkg/notes.txt and tell me the number.", { modeInstructions: "Selected mode: Code.", persona: PERSONA });
const sysText = requests[n].messages[0].content;
console.log("system has persona:", sysText.includes(PERSONA), "| persona section at:", sysText.indexOf("# Persona"), "| contract at:", sysText.indexOf("# Identity"));
console.log("answer starts with 砚台：", /^\s*砚台：/.test(r.answer));
const n2 = requests.length;
const r2 = await turn("P2 no persona", "Say hi in one line.", { modeInstructions: "Selected mode: Code." });
console.log("no-persona system has # Persona:", requests[n2].messages[0].content.includes("# Persona"));
