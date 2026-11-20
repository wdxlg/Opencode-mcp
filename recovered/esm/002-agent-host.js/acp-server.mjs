// acp-step01: Agent Client Protocol (ACP) stdio 入口。
// 用法：<OpenCode.exe（ELECTRON_RUN_AS_NODE=1）或 node> runtime/agent-host.js --acp [--config 文件]
// 让 Zed 等 ACP 客户端直接驱动 OpenCode 的 agent 循环（与对话面板同一个 runOpenAICompatibleAgent）。
// 模型配置：环境变量 OPENCODE_ACP_BASE_URL / OPENCODE_ACP_API_KEY / OPENCODE_ACP_MODEL / OPENCODE_ACP_PROTOCOL，
// 或 JSON 文件（默认 ~/.opencode/acp.json）：{ "baseUrl", "apiKey", "model", "protocol", "approve": "ask"|"auto", ... }。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { FILE_TOOL_NAMES } from "./module-0015.mjs";
import { IDE_TOOL_DEFINITIONS } from "./module-0027.mjs";
import { runOpenAICompatibleAgent } from "./module-0029.mjs";

export const ACP_PROTOCOL_VERSION = 1;
const ACP_LOCAL_TOOLS = ["run_command", "list_directory"];
const PROTOCOLS = new Set(["chat-completions", "openai-responses", "anthropic-messages", "auto"]);
const MAX_TOOL_TEXT = 8000;
const MAX_COMMAND_OUTPUT = 30000;

function clip(text, n) {
  const s = String(text ?? "");
  return s.length > n ? `${s.slice(0, n)}\n…（已截断 ${s.length - n} 字）` : s;
}

function tailText(text, n) {
  const s = String(text ?? "");
  return s.length > n ? `…（前面省略 ${s.length - n} 字）\n${s.slice(-n)}` : s;
}

function intOr(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

export function loadAcpConfig(argv = process.argv, env = process.env) {
  const at = argv.indexOf("--config");
  const file = at > 0 && argv[at + 1] ? argv[at + 1] : env.OPENCODE_ACP_CONFIG || path.join(os.homedir(), ".opencode", "acp.json");
  let saved = {};
  try {
    saved = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) || {};
  } catch {
  }
  const pick = (key, ...names) => {
    for (const name of names) if (typeof env[name] === "string" && env[name].trim()) return env[name].trim();
    return saved[key];
  };
  const protocol = String(pick("protocol", "OPENCODE_ACP_PROTOCOL") || "chat-completions");
  return {
    file,
    baseUrl: pick("baseUrl", "OPENCODE_ACP_BASE_URL", "OPENCODE_API_BASE"),
    apiKey: pick("apiKey", "OPENCODE_ACP_API_KEY", "OPENCODE_API_KEY"),
    model: pick("model", "OPENCODE_ACP_MODEL", "OPENCODE_MODEL"),
    protocol: PROTOCOLS.has(protocol) ? protocol : "chat-completions",
    approve: String(pick("approve", "OPENCODE_ACP_APPROVE") || "ask") === "auto" ? "auto" : "ask",
    contextWindow: intOr(pick("contextWindow", "OPENCODE_ACP_CONTEXT_WINDOW"), void 0),
    maxOutputTokens: intOr(pick("maxOutputTokens", "OPENCODE_ACP_MAX_OUTPUT_TOKENS"), void 0),
    reasoningEffort: pick("reasoningEffort", "OPENCODE_ACP_REASONING_EFFORT") || void 0,
    thinking: pick("thinking", "OPENCODE_ACP_THINKING") || void 0,
    shell: pick("shell", "OPENCODE_ACP_SHELL") || void 0
  };
}

export function acpToolKind(name) {
  if (name === "read_files" || name === "read_image") return "read";
  if (name === "apply_patch") return "edit";
  if (name === "find_files" || name === "search_files" || name === "list_directory") return "search";
  if (name === "run_command") return "execute";
  return "other";
}

function toolTitle(name, args) {
  const a = args && typeof args === "object" ? args : {};
  if (name === "run_command" && a.command) return `run_command: ${clip(String(a.command).split(/\r?\n/)[0], 120)}`;
  if (name === "read_files" && Array.isArray(a.files)) return `read_files: ${a.files.map((f) => f?.path ?? f).slice(0, 4).join(", ")}`;
  if (a.path) return `${name}: ${a.path}`;
  return name;
}

// ACP ContentBlock[] → 文本 + 图片
export function acpPromptToInput(blocks) {
  const parts = [];
  const images = [];
  for (const block of Array.isArray(blocks) ? blocks : []) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "text" && typeof block.text === "string") parts.push(block.text);
    else if (block.type === "image" && typeof block.data === "string" && String(block.mimeType || "").startsWith("image/")) {
      if (images.length < 8) images.push({ mimeType: block.mimeType, data: block.data });
    } else if (block.type === "resource_link" && block.uri) parts.push(`[引用] ${block.name ? block.name + " " : ""}${block.uri}`);
    else if (block.type === "resource" && block.resource) {
      const r = block.resource;
      if (typeof r.text === "string") parts.push(`<file uri="${r.uri ?? ""}">\n${r.text}\n</file>`);
      else if (r.uri) parts.push(`[引用] ${r.uri}`);
    }
  }
  return { text: parts.join("\n\n"), images };
}

function findBash(config) {
  if (config.shell) return config.shell;
  if (process.platform !== "win32") return "/bin/bash";
  const here = path.dirname(process.argv[1] || "");
  const candidates = [
    path.join(here, "git", "bin", "bash.exe"),
    path.join(here, "bin", "git", "bin", "bash.exe"),
    path.join(here, "git", "usr", "bin", "bash.exe"),
    "C:\\Program Files\\Git\\bin\\bash.exe"
  ];
  return candidates.find((file) => {
    try { return fs.statSync(file).isFile(); } catch { return false; }
  });
}

function killTree(child) {
  if (!child?.pid) return;
  try {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
    else child.kill("SIGKILL");
  } catch {
  }
}

function spawnShell(command, cwd, config, extra = {}) {
  const bash = findBash(config);
  if (bash) return spawn(bash, ["-c", command], { cwd, windowsHide: true, ...extra });
  return spawn(command, { cwd, shell: true, windowsHide: true, ...extra });
}

export function runLocalCommand(args, root, config, signal) {
  const command = String(args?.command ?? "");
  if (!command.trim()) return Promise.resolve({ text: "command is required", isError: true });
  const cwd = args?.cwd ? path.resolve(root, String(args.cwd)) : root;
  if (args?.background === true) {
    const child = spawnShell(command, cwd, config, { detached: true, stdio: "ignore" });
    child.unref();
    return Promise.resolve({ text: JSON.stringify({ status: "started_background", pid: child.pid, cwd, note: "ACP 模式下后台命令不回收输出；需要输出时请把它重定向到文件再读取。" }), isError: false });
  }
  const timeoutMs = Math.min(12e4, Math.max(1e3, intOr(args?.timeout_ms, 12e4)));
  return new Promise((resolve) => {
    let out = "";
    let done = false;
    const child = spawnShell(command, cwd, config);
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal?.removeEventListener?.("abort", onAbort);
      resolve(value);
    };
    const append = (chunk) => {
      out += chunk.toString();
      if (out.length > MAX_COMMAND_OUTPUT * 3) out = out.slice(-MAX_COMMAND_OUTPUT * 2);
    };
    const onAbort = () => {
      killTree(child);
      finish({ text: JSON.stringify({ status: "canceled", output: tailText(out, MAX_COMMAND_OUTPUT) }), isError: true });
    };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);
    signal?.addEventListener?.("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      killTree(child);
      finish({ text: JSON.stringify({ status: "timed_out", timeout_ms: timeoutMs, output: tailText(out, MAX_COMMAND_OUTPUT) }), isError: true });
    }, timeoutMs);
    child.on("error", (error) => finish({ text: JSON.stringify({ status: "failed", error: String(error?.message || error) }), isError: true }));
    child.on("close", (code) => finish({ text: JSON.stringify({ status: "completed", exit_code: code, cwd, output: tailText(out, MAX_COMMAND_OUTPUT) }), isError: code !== 0 }));
  });
}

export function listLocalDirectory(args, root) {
  const base = path.resolve(root, String(args?.path ?? "."));
  const depthLimit = Math.min(3, Math.max(1, intOr(args?.depth ?? args?.max_depth, 1)));
  const entries = [];
  const walk = (dir, depth) => {
    let items = [];
    try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch (error) {
      if (depth === 1) throw error;
      return;
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of items) {
      if (entries.length >= 500) return;
      const rel = path.relative(base, path.join(dir, item.name)).split(path.sep).join("/");
      entries.push(item.isDirectory() ? `${rel}/` : rel);
      if (item.isDirectory() && depth < depthLimit && item.name !== ".git" && item.name !== "node_modules") walk(path.join(dir, item.name), depth + 1);
    }
  };
  try {
    walk(base, 1);
    return { text: JSON.stringify({ path: base, entries, truncated: entries.length >= 500 }), isError: false };
  } catch (error) {
    return { text: `list_directory failed: ${error?.message || error}`, isError: true };
  }
}

export function startAcpServer(options = {}) {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const runAgent = options.runAgent ?? runOpenAICompatibleAgent;
  const config = options.config ?? loadAcpConfig();
  // stdout 只能走协议；其它模块的日志一律改去 stderr
  if (!options.output) {
    console.log = (...a) => process.stderr.write(a.map(String).join(" ") + "\n");
    console.info = console.log;
    console.debug = console.log;
  }
  const sessions = new Map();
  const pending = new Map();
  let nextId = 1;
  const send = (message) => output.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
  const notify = (method, params) => send({ method, params });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = `oc-${nextId++}`;
    pending.set(id, { resolve, reject });
    send({ id, method, params });
  });
  const update = (sessionId, body) => notify("session/update", { sessionId, update: body });
  const ideDefs = IDE_TOOL_DEFINITIONS.filter((tool) => ACP_LOCAL_TOOLS.includes(tool.name)).map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema }));

  async function prompt(params) {
    const session = sessions.get(params?.sessionId);
    if (!session) throw Object.assign(new Error(`unknown sessionId: ${params?.sessionId}`), { rpcCode: -32602 });
    if (session.controller) throw Object.assign(new Error("a prompt is already running in this session"), { rpcCode: -32000 });
    const { text, images } = acpPromptToInput(params?.prompt);
    if (!text.trim() && !images.length) return { stopReason: "end_turn" };
    const controller = new AbortController();
    session.controller = controller;
    const toolIds = new Map();
    let streamed = false;
    // 外部工具（run_command）不经过 agent 循环的 approveTool，这里自己问；apply_patch 由 approveTool 走同一个函数
    const askPermission = async (name, args) => {
      if (config.approve !== "ask" || session.allowAlways.has(name)) return { allowed: true };
      const toolCallId = toolIds.get(name) ?? randomUUID();
      const reply = await request("session/request_permission", {
        sessionId: session.id,
        toolCall: { toolCallId, title: toolTitle(name, args), kind: acpToolKind(name), status: "pending", rawInput: args },
        options: [
          { optionId: "allow_once", name: "允许", kind: "allow_once" },
          { optionId: "allow_always", name: "本会话总是允许", kind: "allow_always" },
          { optionId: "reject_once", name: "拒绝", kind: "reject_once" }
        ]
      });
      const outcome = reply?.outcome;
      if (outcome?.outcome === "selected" && outcome.optionId === "allow_always") {
        session.allowAlways.add(name);
        return { allowed: true };
      }
      if (outcome?.outcome === "selected" && outcome.optionId === "allow_once") return { allowed: true };
      return { allowed: false, reason: outcome?.outcome === "cancelled" ? "cancelled" : "rejected by the user" };
    };
    try {
      const result = await runAgent({
        protocol: config.protocol,
        baseUrl: String(config.baseUrl),
        apiKey: config.apiKey ? String(config.apiKey) : void 0,
        model: String(config.model),
        prompt: text,
        ...images.length ? { images, imageInput: true } : {},
        workspaceRoot: session.cwd,
        workspaceRoots: [session.cwd],
        history: session.history.slice(-40),
        allowedTools: [...FILE_TOOL_NAMES, ...ACP_LOCAL_TOOLS],
        ...config.approve === "ask" ? { approveTools: ["apply_patch", "run_command"] } : {},
        externalTools: ideDefs,
        contextCompaction: { auto: true },
        ...config.contextWindow ? { contextWindow: config.contextWindow } : {},
        ...config.maxOutputTokens ? { maxOutputTokens: config.maxOutputTokens } : {},
        ...config.reasoningEffort ? { reasoningEffort: config.reasoningEffort } : {},
        ...config.thinking === "enabled" || config.thinking === "disabled" ? { thinking: config.thinking } : {},
        signal: controller.signal,
        approveTool: config.approve === "ask" ? askPermission : void 0,
        executeExternalTool: async (name, args) => {
          if (name === "run_command") {
            const verdict = await askPermission(name, args);
            if (verdict.allowed !== true) return { text: `PERMISSION_DENIED: the user did not approve this run_command call (${verdict.reason}). Nothing was run. Do not retry the same call as-is; explain or ask instead.`, isError: true };
            return runLocalCommand(args, session.cwd, config, controller.signal);
          }
          if (name === "list_directory") return listLocalDirectory(args, session.cwd);
          return { text: `${name} is not available in ACP mode.`, isError: true };
        },
        onTrace: (item) => {
          const data = item?.data && typeof item.data === "object" ? item.data : {};
          if (item?.type === "model_delta" && typeof data.content === "string" && data.content) {
            streamed = true;
            update(session.id, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: data.content } });
          } else if (item?.type === "model_thinking_delta" && typeof data.content === "string" && data.content) {
            update(session.id, { sessionUpdate: "agent_thought_chunk", content: { type: "text", text: data.content } });
          } else if (item?.type === "tool_call") {
            const id = String(data.id || randomUUID());
            toolIds.set(String(data.name), id);
            update(session.id, { sessionUpdate: "tool_call", toolCallId: id, title: toolTitle(data.name, data.arguments), kind: acpToolKind(data.name), status: "in_progress", rawInput: data.arguments });
          } else if (item?.type === "tool_result") {
            update(session.id, { sessionUpdate: "tool_call_update", toolCallId: String(data.id), status: data.isError ? "failed" : "completed", content: [{ type: "content", content: { type: "text", text: clip(data.text, MAX_TOOL_TEXT) } }] });
          }
        },
        onCheckpoint: () => {}
      }, {});
      const answer = typeof result?.answer === "string" ? result.answer : "";
      if (answer && !streamed && !result?.answerStreamed) update(session.id, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: answer } });
      session.history.push({ role: "user", content: text }, { role: "assistant", content: answer });
      if (controller.signal.aborted) return { stopReason: "cancelled" };
      if (result?.status === "interrupted" && result?.interruption?.kind === "model_timeout") {
        update(session.id, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "\n\n（等待模型超时，本轮已暂停；再发一条消息即可继续。）" } });
      }
      return { stopReason: "end_turn" };
    } catch (error) {
      if (controller.signal.aborted) return { stopReason: "cancelled" };
      throw error;
    } finally {
      session.controller = null;
    }
  }

  async function dispatch(method, params) {
    switch (method) {
      case "initialize":
        return {
          protocolVersion: ACP_PROTOCOL_VERSION,
          agentCapabilities: { loadSession: false, promptCapabilities: { image: true, audio: false, embeddedContext: true } },
          authMethods: [],
          agentInfo: { name: "opencode", title: "OpenCode", version: "acp-step01" }
        };
      case "authenticate":
        return {};
      case "session/new": {
        if (!config.baseUrl || !config.model) {
          throw Object.assign(new Error(`OpenCode ACP 缺少模型配置：请设置 OPENCODE_ACP_BASE_URL / OPENCODE_ACP_MODEL（以及 OPENCODE_ACP_API_KEY），或写入 ${config.file}`), { rpcCode: -32000 });
        }
        const cwd = typeof params?.cwd === "string" && path.isAbsolute(params.cwd) ? params.cwd : process.cwd();
        const id = `oc-acp-${randomUUID()}`;
        sessions.set(id, { id, cwd, history: [], allowAlways: new Set(), controller: null });
        return { sessionId: id };
      }
      case "session/prompt":
        return prompt(params);
      case "session/set_mode":
        return {};
      default:
        throw Object.assign(new Error(`Method not found: ${method}`), { rpcCode: -32601 });
    }
  }

  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  rl.on("line", (line) => {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line.replace(/^\uFEFF/, ""));
    } catch {
      send({ id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    if (message && message.method === undefined && message.id !== undefined && pending.has(message.id)) {
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message || "client error"));
      else waiter.resolve(message.result);
      return;
    }
    if (message?.method === "session/cancel") {
      sessions.get(message.params?.sessionId)?.controller?.abort(new Error("Canceled by ACP client."));
      return;
    }
    if (message?.id === undefined || typeof message?.method !== "string") return;
    Promise.resolve().then(() => dispatch(message.method, message.params)).then(
      (result) => send({ id: message.id, result }),
      (error) => send({ id: message.id, error: { code: error?.rpcCode ?? -32000, message: String(error?.message || error) } })
    );
  });
  rl.on("close", () => {
    for (const session of sessions.values()) session.controller?.abort(new Error("ACP client disconnected."));
    for (const waiter of pending.values()) waiter.reject(new Error("ACP client disconnected."));
    pending.clear();
    if (!options.input) process.exit(0);
  });
  if (!options.output) process.stderr.write(`[agent-host] ACP mode ready protocol=${ACP_PROTOCOL_VERSION} model=${config.model ?? "(unset)"} pid=${process.pid}\n`);
  return { sessions, close: () => rl.close() };
}
