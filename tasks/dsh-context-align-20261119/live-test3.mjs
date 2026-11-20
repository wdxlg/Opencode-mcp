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
    if (name === "run_command" && a.command !== "dump") { try { return { content: [{ type: "text", text: (await import("node:child_process")).execSync(a.command, { cwd: ws, shell: "C:/Program Files/Git/bin/bash.exe", encoding: "utf8", timeout: 30000 }).slice(0, 20000) || "(no output)" }] }; } catch (e) { return { content: [{ type: "text", text: String(e.stdout || e.message).slice(0, 4000) }], isError: true }; } }
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

const rows = Array.from({ length: 3000 }, (_, i) => `row ${i}: ${i === 2718 ? "VALUE=OSPREY-77" : "item-" + (i * 7919 % 10007)}`).join("\n");
history.push({ role: "user", content: "Apply the deploy patch and list the inventory." });
history.push({ role: "assistant", content: "Patch applied and inventory listed.", replayModel: "gpt-5-codex", replay: [
  { role: "assistant", content: "", tool_calls: [{ id: "call_x1", type: "function", function: { name: "apply_patch_v9", arguments: JSON.stringify({ patch: "*** Begin Patch\n*** Update File: deploy.txt\n+codename\n*** End Patch" }) } }] },
  { role: "tool", tool_call_id: "call_x1", content: "Done." },
  { role: "assistant", content: "", tool_calls: [{ id: "call_x2", type: "function", function: { name: "run_command", arguments: JSON.stringify({ command: "inventory" }) } }] },
  { role: "tool", tool_call_id: "call_x2", content: rows.slice(0, 40000) },
  { role: "assistant", content: "Patch applied and inventory listed." }] });
const n1 = requests.length;
const r1 = await turn("T1 handoff", "Now append the line 'ok' to deploy.txt in the workspace the same way the earlier turn edited files, then say which tool you used. One line.");
const firstUser = requests[n1].messages.at(-1);
console.log("handoff note in last user msg:", /Model handoff/.test(JSON.stringify(firstUser.content)), "| foreign listed:", /apply_patch_v9/.test(JSON.stringify(firstUser.content)));
const called = requests.slice(n1).flatMap((b) => b.messages.filter((m) => m.tool_calls).flatMap((m) => m.tool_calls.map((c) => c.function.name)));
console.log("tool calls in this turn (incl. history):", [...new Set(called)].join(","), "| deploy.txt:", fs.existsSync(path.join(ws, "deploy.txt")) ? JSON.stringify(fs.readFileSync(path.join(ws, "deploy.txt"), "utf8")) : "missing");
history.push({ role: "user", content: "append ok", replayUser: r1.replay?.user });
history.push({ role: "assistant", content: r1.answer, replay: r1.replay?.messages, replayModel: r1.replay?.model });
await turn("T2 manual compaction", "/compact", { compactOnly: true });
console.log("checkpoint:", checkpoint && { covered: checkpoint.covered, len: checkpoint.summary?.length, transcript: checkpoint.transcript });
if (checkpoint?.transcript) { const t = fs.readFileSync(checkpoint.transcript, "utf8"); console.log("transcript bytes", t.length, "has OSPREY:", t.includes("OSPREY-77"), "has apply_patch_v9:", t.includes("apply_patch_v9"), "has handoff:", t.includes("Model handoff")); }
const n3 = requests.length;
await turn("T3 recall from transcript", "In the inventory output from earlier, what exactly was on row 2718? Give the exact value.");
const sumMsg = requests[n3].messages.find((m) => m.role === "user" && /compacted-summary|transcript of the conversation/.test(String(m.content)));
console.log("summary msg has path:", Boolean(sumMsg && /stored at: .*history-/.test(sumMsg.content)), "| no handoff note in T3:", !/Model handoff/.test(JSON.stringify(requests[n3].messages.at(-1).content)));
console.log("T3 tool calls:", requests.slice(n3).flatMap((b) => (b.messages.at(-1).role === "tool" ? [] : [])).length, JSON.stringify(log.slice(-4).map((l) => l.roles)));
