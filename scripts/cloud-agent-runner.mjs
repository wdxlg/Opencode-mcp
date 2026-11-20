#!/usr/bin/env node
// OpenCode cloud agent runner (headless, dependency-free, Node 20+).
// Runs inside GitHub Actions (or any shell): an OpenAI-compatible chat-completions
// tool-calling loop over the checked-out repository.
//
// Environment:
//   OPENCODE_TASK          task text (required)
//   OPENCODE_API_KEY       model API key (required; never printed, never passed to run_command)
//   OPENCODE_API_BASE      OpenAI-compatible base URL (default https://api.openai.com/v1)
//   OPENCODE_MODEL         model id (default gpt-4o)
//   OPENCODE_MAX_STEPS     max model turns (default 40)
//   OPENCODE_MAX_MINUTES   max wall-clock minutes (default 45)
//   OPENCODE_OUT_DIR       where summary.md / agent-log.jsonl go (default $RUNNER_TEMP/opencode-cloud or ./.opencode-cloud)
//   OPENCODE_WORKDIR       repository root (default cwd)
// Exit code: 0 when the model finished, 2 when a limit was hit, 1 on fatal error.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const env = process.env;
const ROOT = path.resolve(env.OPENCODE_WORKDIR || process.cwd());
const OUT = path.resolve(env.OPENCODE_OUT_DIR || (env.RUNNER_TEMP ? path.join(env.RUNNER_TEMP, "opencode-cloud") : path.join(ROOT, ".opencode-cloud")));
const API_KEY = String(env.OPENCODE_API_KEY || "");
const API_BASE = String(env.OPENCODE_API_BASE || "https://api.openai.com/v1").replace(/\/+$/, "");
const MODEL = String(env.OPENCODE_MODEL || "gpt-4o");
const TASK = String(env.OPENCODE_TASK || "").trim();
const MAX_STEPS = Math.max(1, Number(env.OPENCODE_MAX_STEPS) || 40);
const MAX_MS = Math.max(1, Number(env.OPENCODE_MAX_MINUTES) || 45) * 60 * 1000;
const STARTED = Date.now();
const SKIP_DIRS = new Set([".git", "node_modules", ".opencode-cloud", "dist", "build", "out", ".next", "target", "__pycache__", ".venv", "venv"]);
const MAX_RESULT = 20000;

fs.mkdirSync(OUT, { recursive: true });
const logFile = path.join(OUT, "agent-log.jsonl");

function redact(text) {
  let s = String(text ?? "");
  if (API_KEY && API_KEY.length >= 4) s = s.split(API_KEY).join("***");
  return s;
}
function log(event) {
  const line = redact(JSON.stringify({ t: new Date().toISOString(), ...event }));
  fs.appendFileSync(logFile, line + "\n");
}
function say(msg) { process.stdout.write(redact(msg) + "\n"); }
function clip(s, n = MAX_RESULT) { s = String(s ?? ""); return s.length > n ? s.slice(0, n) + `\n…[truncated ${s.length - n} chars]` : s; }
function remainingMs() { return MAX_MS - (Date.now() - STARTED); }

function resolveInRepo(p) {
  const abs = path.resolve(ROOT, String(p || "."));
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error(`path outside repository: ${p}`);
  return { abs, rel: rel.split(path.sep).join("/") };
}

function* walk(dir, depth, maxDepth) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield { full, dir: true };
      if (depth < maxDepth) yield* walk(full, depth + 1, maxDepth);
    } else if (e.isFile()) yield { full, dir: false };
  }
}

const TOOLS = [
  { type: "function", function: { name: "read_file", description: "Read a text file from the repository. Optional 1-based start_line/end_line.", parameters: { type: "object", properties: { path: { type: "string" }, start_line: { type: "integer" }, end_line: { type: "integer" } }, required: ["path"] } } },
  { type: "function", function: { name: "write_file", description: "Create or overwrite a file in the repository with the full new content.", parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } } },
  { type: "function", function: { name: "list_files", description: "List files and folders under a directory (default repository root).", parameters: { type: "object", properties: { path: { type: "string" }, max_depth: { type: "integer" } } } } },
  { type: "function", function: { name: "search", description: "Search file contents (like grep). pattern is a JavaScript regular expression unless literal=true.", parameters: { type: "object", properties: { pattern: { type: "string" }, path: { type: "string" }, literal: { type: "boolean" }, max_results: { type: "integer" } }, required: ["pattern"] } } },
  { type: "function", function: { name: "run_command", description: "Run a shell command (bash) in the repository root, e.g. install, build or test. Returns exit code and output.", parameters: { type: "object", properties: { command: { type: "string" }, timeout_seconds: { type: "integer" } }, required: ["command"] } } }
];

const commandsRun = [];
const filesWritten = new Set();

function toolReadFile(a) {
  const { abs, rel } = resolveInRepo(a.path);
  const text = fs.readFileSync(abs, "utf8");
  const lines = text.split(/\r?\n/);
  const s = Math.max(1, Number(a.start_line) || 1), e = Math.min(lines.length, Number(a.end_line) || lines.length);
  return `${rel} (lines ${s}-${e} of ${lines.length})\n` + lines.slice(s - 1, e).map((l, i) => `${s + i}: ${l}`).join("\n");
}
function toolWriteFile(a) {
  const { abs, rel } = resolveInRepo(a.path);
  if (rel === ".git" || rel.startsWith(".git/")) throw new Error("writing inside .git is not allowed");
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, String(a.content ?? ""));
  filesWritten.add(rel);
  return `wrote ${rel} (${Buffer.byteLength(String(a.content ?? ""))} bytes)`;
}
function toolListFiles(a) {
  const { abs } = resolveInRepo(a.path || ".");
  const out = [];
  for (const it of walk(abs, 0, Math.min(6, Math.max(0, Number(a.max_depth ?? 2))))) {
    out.push(path.relative(ROOT, it.full).split(path.sep).join("/") + (it.dir ? "/" : ""));
    if (out.length >= 500) { out.push("…(truncated at 500 entries)"); break; }
  }
  return out.join("\n") || "(empty)";
}
function toolSearch(a) {
  const { abs } = resolveInRepo(a.path || ".");
  const max = Math.min(300, Math.max(1, Number(a.max_results) || 100));
  const src = String(a.pattern || "");
  const re = a.literal ? new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) : new RegExp(src);
  const hits = [];
  const files = fs.statSync(abs).isFile() ? [{ full: abs, dir: false }] : walk(abs, 0, 50);
  for (const it of files) {
    if (it.dir) continue;
    let st; try { st = fs.statSync(it.full); } catch { continue; }
    if (st.size > 1024 * 1024) continue;
    let text; try { text = fs.readFileSync(it.full, "utf8"); } catch { continue; }
    if (text.includes("\u0000")) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        hits.push(`${path.relative(ROOT, it.full).split(path.sep).join("/")}:${i + 1}: ${lines[i].slice(0, 300)}`);
        if (hits.length >= max) return hits.join("\n") + "\n…(max results reached)";
      }
    }
  }
  return hits.join("\n") || "(no matches)";
}
function toolRunCommand(a) {
  const command = String(a.command || "");
  if (!command.trim()) throw new Error("empty command");
  const timeout = Math.max(1000, Math.min((Number(a.timeout_seconds) || 600) * 1000, remainingMs() - 5000));
  const childEnv = { ...env };
  for (const k of Object.keys(childEnv)) if (/^OPENCODE_API_KEY$|^OPENCODE_API_BASE$|TOKEN|SECRET|PASSWORD/i.test(k)) delete childEnv[k];
  const r = spawnSync("bash", ["-lc", command], { cwd: ROOT, env: childEnv, encoding: "utf8", timeout, maxBuffer: 32 * 1024 * 1024 });
  commandsRun.push({ command, exit: r.status, timedOut: r.error?.code === "ETIMEDOUT" });
  const out = `${r.stdout || ""}${r.stderr ? `\n[stderr]\n${r.stderr}` : ""}`;
  return `exit_code: ${r.status ?? "null"}${r.error ? ` (${r.error.code || r.error.message})` : ""}\n${clip(out, 12000)}`;
}
const HANDLERS = { read_file: toolReadFile, write_file: toolWriteFile, list_files: toolListFiles, search: toolSearch, run_command: toolRunCommand };

export function runTool(name, args) {
  const h = HANDLERS[name];
  if (!h) return `error: unknown tool ${name}`;
  try { return clip(h(args || {})); } catch (e) { return `error: ${e?.message || e}`; }
}

async function chat(messages) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    const left = remainingMs();
    if (left <= 5000) throw new Error("runtime limit reached");
    try {
      const r = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, tool_choice: "auto" }),
        signal: AbortSignal.timeout(Math.min(240000, left))
      });
      const txt = await r.text();
      if (r.ok) return JSON.parse(txt);
      lastErr = new Error(`model API ${r.status}: ${redact(txt).slice(0, 400)}`);
      if (r.status !== 429 && r.status < 500) throw lastErr;
    } catch (e) {
      lastErr = e;
      if (/model API 4\d\d/.test(String(e?.message)) && !/model API 429/.test(String(e?.message))) throw e;
    }
    await new Promise((res) => setTimeout(res, 2000 * 2 ** attempt));
  }
  throw lastErr;
}

function gitStatus() {
  const r = spawnSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" });
  return (r.stdout || "").trim();
}

function writeSummary({ stop, steps, finalText, error }) {
  const changed = gitStatus();
  const md = [
    `# OpenCode cloud agent`,
    ``,
    `**Task:**`,
    ``,
    TASK.split("\n").map((l) => `> ${l}`).join("\n"),
    ``,
    `- Model: \`${MODEL}\``,
    `- Steps: ${steps} / ${MAX_STEPS}`,
    `- Duration: ${Math.round((Date.now() - STARTED) / 1000)}s (limit ${Math.round(MAX_MS / 60000)} min)`,
    `- Stop reason: ${stop}`,
    error ? `- Error: ${redact(error).slice(0, 500)}` : null,
    ``,
    `## Result`,
    ``,
    finalText ? redact(finalText) : "_(no final message)_",
    ``,
    `## Changed files`,
    ``,
    changed ? "```\n" + changed + "\n```" : "_(none)_",
    ``,
    `## Commands run`,
    ``,
    commandsRun.length ? commandsRun.map((c) => `- \`${redact(c.command).replace(/`/g, "'").slice(0, 200)}\` → exit ${c.exit ?? "null"}${c.timedOut ? " (timeout)" : ""}`).join("\n") : "_(none)_",
    ``
  ].filter((l) => l !== null).join("\n");
  fs.writeFileSync(path.join(OUT, "summary.md"), md + "\n");
  if (env.GITHUB_STEP_SUMMARY) { try { fs.appendFileSync(env.GITHUB_STEP_SUMMARY, md + "\n"); } catch {} }
  return md;
}

const SYSTEM_PROMPT = `You are OpenCode's autonomous cloud coding agent running headless in CI on a checked-out git repository (root: the current directory).
Complete the user's task by inspecting and editing files with the tools. Work carefully and minimally: keep the existing style, do not touch unrelated files, never commit, push or create branches (the workflow does that), never print secrets or environment variables.
Do not modify files under .github/workflows/. Run the project's tests or build when practical to verify.
When finished, reply WITHOUT tool calls with a concise summary (what changed, why, how it was verified, anything left undone). That reply becomes the pull request description.`;

async function main() {
  if (!TASK) { say("OPENCODE_TASK is empty"); writeSummary({ stop: "no task", steps: 0, error: "OPENCODE_TASK is empty" }); return 1; }
  if (!API_KEY) { say("Model API key is missing: set the repository secret (default OPENCODE_API_KEY)."); writeSummary({ stop: "missing API key", steps: 0, error: "model API key secret is not set" }); return 1; }
  say(`[opencode] model=${MODEL} maxSteps=${MAX_STEPS} maxMinutes=${Math.round(MAX_MS / 60000)} root=${ROOT}`);
  log({ type: "start", model: MODEL, task: TASK.slice(0, 2000) });
  const messages = [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: TASK }];
  let steps = 0, finalText = "", stop = "max steps reached";
  try {
    while (steps < MAX_STEPS) {
      if (remainingMs() <= 10000) { stop = "max runtime reached"; break; }
      steps++;
      const resp = await chat(messages);
      const msg = resp?.choices?.[0]?.message;
      if (!msg) throw new Error("model returned no message");
      const calls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];
      messages.push({ role: "assistant", content: msg.content ?? null, ...(calls.length ? { tool_calls: calls } : {}) });
      if (msg.content) { say(`[assistant] ${clip(msg.content, 2000)}`); finalText = msg.content; }
      if (!calls.length) { stop = "completed"; break; }
      for (const c of calls) {
        let args = {};
        try { args = JSON.parse(c.function?.arguments || "{}"); } catch { args = {}; }
        const name = c.function?.name;
        say(`[tool] ${name} ${clip(JSON.stringify(name === "write_file" ? { path: args.path, bytes: String(args.content ?? "").length } : args), 300)}`);
        const result = runTool(name, args);
        log({ type: "tool", step: steps, name, args: name === "write_file" ? { path: args.path } : args, result: clip(result, 2000) });
        messages.push({ role: "tool", tool_call_id: c.id, content: redact(result) });
      }
    }
  } catch (e) {
    const error = String(e?.message || e);
    say(`[opencode] error: ${error}`);
    log({ type: "error", error });
    writeSummary({ stop: "error", steps, finalText, error });
    return 1;
  }
  log({ type: "end", stop, steps });
  const md = writeSummary({ stop, steps, finalText });
  say(md);
  return stop === "completed" ? 0 : 2;
}

const isMain = (() => { try { return path.resolve(process.argv[1] || "") === path.resolve(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) main().then((code) => process.exit(code), (e) => { say(String(e?.stack || e)); process.exit(1); });
