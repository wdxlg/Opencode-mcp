// acp-step01 端到端：假模型服务（OpenAI 兼容，SSE）+ 真 agent-host.js --acp，走一轮工具调用 + 权限请求。
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const host = path.join(root, "opencode/resources/app/extensions/opencode/runtime/agent-host.js");
assert.ok(fs.existsSync(host), "build first: " + host);
const work = fs.mkdtempSync(path.join(os.tmpdir(), "oc-acp-"));

let calls = 0;
const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (!/chat\/completions/.test(req.url)) { res.writeHead(404); res.end("{}"); return; }
    calls += 1;
    const json = JSON.parse(body || "{}");
    const hasTool = (json.messages || []).some((m) => m.role === "tool");
    const chunks = hasTool
      ? [{ choices: [{ index: 0, delta: { role: "assistant", content: "命令已运行，" } }] }, { choices: [{ index: 0, delta: { content: "全部完成。" }, finish_reason: "stop" }] }]
      : [{ choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, id: "call_1", type: "function", function: { name: "run_command", arguments: JSON.stringify({ command: "echo acp-ok" }) } }] }, finish_reason: "tool_calls" }] }];
    if (json.stream) {
      res.writeHead(200, { "content-type": "text/event-stream" });
      for (const c of chunks) res.write(`data: ${JSON.stringify({ id: "x", object: "chat.completion.chunk", model: "fake", ...c })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      const msg = hasTool ? { role: "assistant", content: "命令已运行，全部完成。" } : { role: "assistant", content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "run_command", arguments: JSON.stringify({ command: "echo acp-ok" }) } }] };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ id: "x", object: "chat.completion", model: "fake", choices: [{ index: 0, message: msg, finish_reason: hasTool ? "stop" : "tool_calls" }] }));
    }
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const child = spawn(process.execPath, [host, "--acp", "--config", path.join(work, "none.json")], {
  env: { ...process.env, OPENCODE_ACP_BASE_URL: `http://127.0.0.1:${port}/v1`, OPENCODE_ACP_API_KEY: "test", OPENCODE_ACP_MODEL: "fake-model" },
  stdio: ["pipe", "pipe", "pipe"]
});
let stderr = "";
child.stderr.on("data", (c) => (stderr += c));
const updates = [];
const waiters = new Map();
let permissionAsked = 0;
const stdoutLines = [];
readline.createInterface({ input: child.stdout }).on("line", (line) => {
  stdoutLines.push(line);
  const msg = JSON.parse(line);
  if (msg.method === "session/update") updates.push(msg.params.update);
  else if (msg.method === "session/request_permission") {
    permissionAsked += 1;
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: msg.id, result: { outcome: { outcome: "selected", optionId: "allow_once" } } }) + "\n");
  } else if (msg.id !== undefined && waiters.has(msg.id)) {
    waiters.get(msg.id)(msg);
    waiters.delete(msg.id);
  }
});
let id = 0;
const call = (method, params) => new Promise((resolve) => {
  id += 1;
  waiters.set(id, resolve);
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
});
const timeout = setTimeout(() => { console.error("TIMEOUT\n" + stderr + "\n" + stdoutLines.join("\n")); process.exit(1); }, 60000);

const init = await call("initialize", { protocolVersion: 1, clientCapabilities: {} });
assert.equal(init.result.protocolVersion, 1);
const created = await call("session/new", { cwd: work, mcpServers: [] });
assert.ok(created.result?.sessionId, JSON.stringify(created));
const done = await call("session/prompt", { sessionId: created.result.sessionId, prompt: [{ type: "text", text: "运行 echo acp-ok" }] });
assert.equal(done.result?.stopReason, "end_turn", JSON.stringify(done) + "\n" + stderr);
assert.equal(permissionAsked, 1);
const toolCall = updates.find((u) => u.sessionUpdate === "tool_call");
assert.equal(toolCall?.kind, "execute");
const toolDone = updates.find((u) => u.sessionUpdate === "tool_call_update");
assert.equal(toolDone?.status, "completed", JSON.stringify(toolDone));
assert.match(toolDone.content[0].content.text, /acp-ok/);
const text = updates.filter((u) => u.sessionUpdate === "agent_message_chunk").map((u) => u.content.text).join("");
assert.match(text, /全部完成/);
assert.equal(calls, 2);
const bad = await call("session/prompt", { sessionId: "nope", prompt: [] });
assert.equal(bad.error?.code, -32602);
clearTimeout(timeout);
child.stdin.end();
server.close();
fs.rmSync(work, { recursive: true, force: true });
console.log("PASS ACP e2e: initialize, session/new, prompt with run_command tool call, permission request, streamed answer");
