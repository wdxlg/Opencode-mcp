// split-0029-step07: 上下文压缩（状态 + 检查点系统提示 + 用量估算 + 压缩请求 + compactContext）拆到 agent-compaction.mjs。
// 原来散在主函数里的 9 个闭包变量收进一个显式状态对象 cs；主函数里对它们的读写改成 cs.xxx。
// messages / endpoint / responses / managedContextWindow 在主函数里会变，压缩器通过 getter 读当时的值。
import fs from "node:fs";
const dir = "recovered/esm/002-agent-host.js/", f = dir + "module-0029.mjs";
const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n";
const L = raw.split(/\r?\n/);
const idx = (pred, from = 0) => { const i = L.findIndex((l, j) => j >= from && pred(l)); if (i < 0) throw Error("anchor " + pred); return i; };
const iMain = idx((l) => l.startsWith("async function runOpenAICompatibleAgent("));
const iA = idx((l) => l === "    const contextHistoryIndex = /* @__PURE__ */ new WeakMap();", iMain);
const iFn = idx((l) => l === "    const applyContextCheckpoint = () => {", iA);
const iMsg = idx((l) => l === "    let messages;", iFn);
if (L[iMsg - 1] !== "    };") throw Error("block end");
const iHdrA = idx((l) => l === "    const makeContextHeaders = () => {", iFn);
const iHdrB = idx((l) => l === "    };", iHdrA);
const iMainEnd = idx((l) => l === "}", iMsg);
const STATE = ["contextHistoryIndex", "pendingEvictedHistory", "fullHistoryForContext", "turnUserMessage", "baseSystemContent", "compactionSummary", "compactionCount", "coveredHistory", "measuredContext"];
const LIVE = ["messages", "endpoint", "responses", "managedContextWindow"];
const decl = L.slice(iA, iFn).join("\n");
const expectDecl = ["const contextHistoryIndex = /* @__PURE__ */ new WeakMap();", "const pendingEvictedHistory = [];", "let fullHistoryForContext;", "let turnUserMessage;", "let baseSystemContent;", 'let compactionSummary = "";', "let compactionCount = 0;", "let coveredHistory = 0;", "let measuredContext;"];
if (L.slice(iA, iFn).map((l) => l.trim()).join("|") !== expectDecl.join("|")) throw Error("decl changed:\n" + decl);
// 只改代码片段：跳过字符串/模板文字/注释，模板里的 ${...} 仍当代码处理
function rewriteCode(src, fn) {
  let out = "", i = 0, code = "";
  const stack = []; // 模板嵌套：记录 ${ 的花括号深度
  let depth = 0;
  const flush = () => { out += fn(code); code = ""; };
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { flush(); const j = src.indexOf("\n", i); const e = j < 0 ? src.length : j; out += src.slice(i, e); i = e; continue; }
    if (c === "/" && src[i + 1] === "*") { flush(); const e = src.indexOf("*/", i) + 2; out += src.slice(i, e); i = e; continue; }
    if (c === '"' || c === "'") { flush(); let j = i + 1; while (src[j] !== c) { if (src[j] === "\\") j++; j++; } out += src.slice(i, j + 1); i = j + 1; continue; }
    if (c === "/" && /[(,=:[!&|?{};]\s*$/.test(code + "") && src[i + 1] !== "/") { // 正则字面量
      flush(); let j = i + 1, cls = false; while (true) { const d = src[j]; if (d === "\\") { j += 2; continue; } if (d === "[") cls = true; else if (d === "]") cls = false; else if (d === "/" && !cls) break; j++; } j++; while (/[a-z]/.test(src[j])) j++; out += src.slice(i, j); i = j; continue;
    }
    if (c === "`" || (c === "}" && stack.length && stack[stack.length - 1] === depth)) {
      flush();
      if (c === "}") { stack.pop(); }
      let j = i + 1;
      while (j < src.length && src[j] !== "`" && !(src[j] === "$" && src[j + 1] === "{")) { if (src[j] === "\\") j++; j++; }
      if (src[j] === "`") { out += src.slice(i, j + 1); i = j + 1; continue; }
      out += src.slice(i, j + 2); i = j + 2; stack.push(depth); continue;
    }
    if (c === "{") depth++;
    if (c === "}") depth--;
    code += c; i++;
  }
  flush();
  return out;
}
const sub = (names, prefix) => (code) => {
  const re = new RegExp(`(?<![.\\w$])(${names.join("|")})(?![\\w$:])`, "g");
  return code.replace(/\.\.\./g, "\u0001").replace(re, prefix + "$1").replace(/\u0001/g, "...");
};
// 压缩器本体
let fnSrc = L.slice(iFn, iMsg).filter((_, k) => !(iFn + k >= iHdrA && iFn + k <= iHdrB)).join("\n");
fnSrc = rewriteCode(fnSrc, (code) => sub(LIVE, "env.")(sub(STATE, "cs.")(code)).replace(/(?<![.\w$])makeContextHeaders\(\)/g, "buildAgentRequestHeaders({ input2, codex, anthropic })"));
fnSrc = fnSrc.split("\n").map((l) => l.startsWith("  ") ? l.slice(2) : l).join("\n");
const ENV = ["input2", "fetchImpl", "emitTrace", "availableToolNames", "toolDefinitionTokens", "codex", "anthropic", "deepSeek", "anthropicMaxOutputTokens", "responsesReasoningEffort", "codexServiceTier", "maxOutputTokens", "calibrated", "usableContextWindow", "keepRecentContextTokens"];
const DEPS = ["requestModelStream", "requestChatCompletion", "contextHistoryHash", "summarizeEvictedHistory"];
const out = [
  "// split-0029-step07: 从 runOpenAICompatibleAgent 拆出的上下文压缩器。原来共享在闭包里的压缩状态收进 state（cs），",
  "// 主函数通过 compactor.state 读写；会变的 messages / endpoint / responses / managedContextWindow 由 env 的 getter 实时提供。",
  "// 请求函数等仍住在 module-0029，经 deps 传入，避免循环依赖。",
  'import { buildAgentRequestHeaders } from "./agent-request.mjs";',
  'import { contextClip, contextTextOf, contextMessagesTokens, contextMessageTokens, estimatedTokens, serializeForCompaction, CONTEXT_COMPACTION_SYSTEM, contextCompactionPrompt, trimContextToolResultsForCompaction } from "./agent-context.mjs";',
  'import { parseAnthropicResponse, parseCodexResponse } from "./agent-stream-parsers.mjs";',
  'import { anthropicSystemPrompt, toAnthropicMessages, codexInstructions, toCodexResponsesInput } from "./agent-message-formats.mjs";',
  "",
  "function createContextCompactor(env, deps) {",
  `  const { ${ENV.join(", ")} } = env;`,
  `  const { ${DEPS.join(", ")} } = deps;`,
  '  const cs = { contextHistoryIndex: /* @__PURE__ */ new WeakMap(), pendingEvictedHistory: [], fullHistoryForContext: void 0, turnUserMessage: void 0, baseSystemContent: void 0, compactionSummary: "", compactionCount: 0, coveredHistory: 0, measuredContext: void 0 };',
  ...fnSrc.split("\n"),
  "  return { state: cs, applyContextCheckpoint, contextCheckpointResult, currentContextTokens, requestPlainCompletion, compactContext };",
  "}",
  "",
  "export { createContextCompactor };",
  ""
];
fs.writeFileSync(dir + "agent-compaction.mjs", out.join(eol));
// 主函数
const head = L.slice(0, iA);
const repl = [
  `    const contextCompactor = createContextCompactor({ ${ENV.join(", ")}, ${LIVE.map((n) => `get ${n}() { return ${n}; }`).join(", ")} }, { ${DEPS.join(", ")} });`,
  "    const cs = contextCompactor.state;",
  "    const { applyContextCheckpoint, contextCheckpointResult, currentContextTokens, requestPlainCompletion, compactContext } = contextCompactor;"
];
const tail = rewriteCode(L.slice(iMsg, iMainEnd + 1).join("\n"), sub(STATE, "cs.")).split("\n");
const rest = [...head, ...repl, ...tail, ...L.slice(iMainEnd + 1)];
const ii = rest.findIndex((l) => l.startsWith("import { agentToolResultContent }"));
rest.splice(ii + 1, 0, 'import { createContextCompactor } from "./agent-compaction.mjs";');
fs.writeFileSync(f, rest.join(eol));
console.log("STEP07_APPLIED", out.length, rest.length);
