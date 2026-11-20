// context-fixes-20261118 自检脚本（非测试套件）：用样例字符串检查溢出报错解析、token 估算、工具上下文裁剪、兜底摘要、AGENTS.md 收集与记忆简报缓存。
// 用法：node tasks/context-fixes-20261118/selfcheck.mjs [源码根]   —— 只读源码，临时文件写在系统临时目录并自动删除。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2] || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", ".."));
const ah = fs.readFileSync(path.join(root, "recovered/esm/002-agent-host.js/module-0029.mjs"), "utf8").replace(/\r\n/g, "\n");
const grab = (src, name, kind = "function") => {
  const start = src.indexOf(kind === "function" ? `\nfunction ${name}(` : `\nvar ${name} =`) + 1;
  if (start <= 0) throw new Error(`missing ${name}`);
  if (kind === "var") return src.slice(start, src.indexOf("\n", start) + 1);
  const rest = src.slice(start + 1);
  const m = /\n(?:function |var |const |let |async function |export |\/\/ )/.exec(rest);
  return src.slice(start, start + 1 + (m ? m.index : rest.length)) + "\n";
};
const code = ["ocCharTokenWeight", "estimatedTokens", "parseContextLimitFromError", "summarizeEvictedHistory", "shrinkPriorToolContextBlocks"].map((n) => grab(ah, n)).join("")
  + ["OC_PRIOR_TOOL_CONTEXT_OPEN", "OC_PRIOR_TOOL_CONTEXT_CLOSE", "OC_PRIOR_TOOL_CONTEXT_TRIMMED"].map((n) => grab(ah, n, "var")).join("");
const lib = new Function(`${code}; return { estimatedTokens, parseContextLimitFromError, summarizeEvictedHistory, shrinkPriorToolContextBlocks };`)();
let pass = 0, fail = 0;
const check = (label, ok, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  -> " + detail : ""}`); };

// 1) 溢出报错解析
const cases = [
  ["This model's maximum context length is 128000 tokens. However, you requested 150000 tokens (140000 in the messages, 10000 in the completion).", 128000],
  ["Error code: 400 - {'error': {'code': 'context_length_exceeded', 'message': 'maximum context length is 131,072 tokens'}}", 131072],
  ["prompt is too long: 215034 tokens > 200000 maximum", 200000],
  ["Your input exceeds the context window of 1048576 tokens", 1048576],
  ["Input length 140000 exceeds the maximum context of 131072", 131072],
  ["The input token count (300000) exceeds the maximum number of tokens allowed (262144).", 262144],
  ["context_length_exceeded", void 0],
  ["Requested input length exceeds max input length: 32768", 32768],
  ["max input tokens is 65536", 65536],
  ["请求超出上下文长度限制：上下文上限 128k tokens", 128000],
  ["Rate limit reached: 429 Too Many Requests, per minute 1000000 tokens", void 0]
];
for (const [message, expected] of cases) {
  const got = lib.parseContextLimitFromError(new Error(message));
  check(`parse "${message.slice(0, 60)}…"`, got === expected, `got ${got}, expected ${expected}`);
}

// 2) token 估算（对照约略真实值：英文≈4 字符/token，中文≈0.6–0.7 token/字）
const en = "The quick brown fox jumps over the lazy dog. ".repeat(20);
const zh = "上下文窗口默认值应当按模型真实上限计算，否则压缩不会触发。".repeat(20);
const codeText = "function add(a, b) {\n  return a + b; // sum\n}\n".repeat(20);
const eEn = lib.estimatedTokens(en), eZh = lib.estimatedTokens(zh), eCode = lib.estimatedTokens(codeText);
check("estimate English ~ chars/4", eEn > en.length / 5.5 && eEn < en.length / 3, `${eEn} for ${en.length} chars`);
check("estimate Chinese ~0.65/char", eZh > zh.length * 0.5 && eZh < zh.length * 0.8, `${eZh} for ${zh.length} chars`);
check("estimate code within 3–6 chars/token", eCode > codeText.length / 6 && eCode < codeText.length / 2.5, `${eCode} for ${codeText.length} chars`);

// 3) 以往轮次工具上下文裁剪
const big = "x".repeat(20000);
const msgs = [{ role: "system", content: "s" }, { role: "user", content: "u1" }, { role: "assistant", content: `answer\n<opencode_prior_tool_context>${big}</opencode_prior_tool_context>` }, { role: "user", content: "u2" }, { role: "assistant", content: `<opencode_prior_tool_context>${big}</opencode_prior_tool_context>` }];
const res = lib.shrinkPriorToolContextBlocks(msgs, 3);
check("shrink older prior tool context", res.count === 1 && msgs[2].content.length < 5600 && /chars omitted/.test(msgs[2].content) && msgs[2].content.endsWith("</opencode_prior_tool_context>"), `count=${res.count} len=${msgs[2].content.length}`);
check("current-turn block untouched", msgs[4].content.length > 20000);
const again = lib.shrinkPriorToolContextBlocks(msgs, 3);
check("shrink idempotent", again.count === 0);

// 4) 兜底摘要
const hist = Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `message ${i} ` + "detail ".repeat(200) }));
const digest = lib.summarizeEvictedHistory(hist, new Set(), { budgetChars: 8000 });
check("fallback digest keeps first/last and fits budget", digest.includes("message 0") && digest.includes("message 39") && digest.length < 9500 && digest.length > 4000, `len=${digest.length}`);

// 5) AGENTS.md / CLAUDE.md 收集（从 agent-extras 抽取函数，在临时目录造文件）
const ex = fs.readFileSync(path.join(root, "recovered/esm/000-extension.js/agent-extras.mjs"), "utf8").replace(/\r\n/g, "\n");
const agentsSrc = ex.slice(ex.indexOf("const AGENTS_FILE_NAMES"), ex.indexOf("/**\n * Hooks")).replace("export function", "function");
const build = new Function("fsX", "pathX", "Buffer", `${agentsSrc}; return buildAgentsInstructions;`)(fs, path, Buffer);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ctxfix-"));
try {
  fs.mkdirSync(path.join(tmp, "pkg", "sub"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "AGENTS.md"), "ROOT RULES\n" + "r".repeat(30000));
  fs.writeFileSync(path.join(tmp, "CLAUDE.md"), "ROOT RULES\n" + "r".repeat(30000));
  fs.writeFileSync(path.join(tmp, "pkg", "AGENTS.md"), "PKG RULES");
  fs.writeFileSync(path.join(tmp, "pkg", "sub", "CLAUDE.md"), "SUB RULES");
  fs.writeFileSync(path.join(tmp, "pkg", "sub", "a.ts"), "x");
  const out = build(tmp, [path.join(tmp, "pkg", "sub", "a.ts")], { budgetBytes: 16384 });
  const iRoot = out.indexOf("### AGENTS.md"), iPkg = out.indexOf("### pkg/AGENTS.md"), iSub = out.indexOf("### pkg/sub/CLAUDE.md");
  check("agents chain ordered root→specific", iRoot >= 0 && iRoot < iPkg && iPkg < iSub, `${iRoot},${iPkg},${iSub}`);
  check("identical CLAUDE.md deduped", !out.includes("### CLAUDE.md"));
  check("budget keeps specific files, truncates root", Buffer.byteLength(out) < 16384 + 1200 && out.includes("SUB RULES") && out.includes("PKG RULES") && /已按上下文预算截断/.test(out), `bytes=${Buffer.byteLength(out)}`);
  const dd = build(tmp, [], { dedupeAgainst: "xx PKG RULES yy\nROOT RULES\n" + "r".repeat(30000) });
  check("dedupe against rule center text", dd === "", JSON.stringify(dd.slice(0, 80)));
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

// 6) 记忆简报缓存（stableBrief）
const pm = await import(pathToFileURL(path.join(root, "recovered/shared/project-memory.mjs")).href);
const memRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ctxfix-mem-"));
try {
  const dir = path.join(memRoot, ".opencode-project");
  const tracker = new pm.SessionMemoryTracker();
  const a = tracker.resolveInjection("native-chat:test", "ws", dir, { stableBrief: true });
  const b = tracker.resolveInjection("native-chat:test", "ws", dir, { stableBrief: true });
  check("stable brief identical across turns", a.text === b.text && a.note === b.note && b.delta === "" && a.text.length > 0, `${a.action}/${b.action}`);
  if (typeof pm.appendMemory === "function" || typeof pm.appendRecord === "function") { /* optional */ }
  const legacy1 = new pm.SessionMemoryTracker();
  legacy1.resolveInjection("bridge:mcp:x", "ws", dir);
  const legacy2 = legacy1.resolveInjection("bridge:mcp:x", "ws", dir);
  check("legacy callers unchanged (2nd call = none)", legacy2.action === "none");
} finally { fs.rmSync(memRoot, { recursive: true, force: true }); }

console.log(`\nselfcheck: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
