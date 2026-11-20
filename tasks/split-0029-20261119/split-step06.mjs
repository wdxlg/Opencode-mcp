// split-0029-step06: 按协议构造请求（请求头、Chat Completions / 提示词工具 / Anthropic / Responses 请求体）拆到 agent-request.mjs。
// 请求体仍按需惰性生成：chatBody 每次调用时读取当时的 promptToolMode 与 messages，与拆分前的闭包语义一致。
import fs from "node:fs";
const dir = "recovered/esm/002-agent-host.js/", f = dir + "module-0029.mjs";
const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n";
const L = raw.split(/\r?\n/);
const idx = (pred, from = 0) => { const i = L.findIndex((l, j) => j >= from && pred(l)); if (i < 0) throw Error("anchor " + pred); return i; };
const iPtiA = idx((l) => l === "function promptToolsInstruction(tools) {");
const iPtmA = idx((l) => l === "function toPromptToolMessages(messages, instruction) {");
if (iPtmA !== idx((l) => l === "}", iPtiA) + 1) throw Error("pti layout");
const iPtmB = idx((l) => l === "}", iPtmA);
const iMain = idx((l) => l.startsWith("async function runOpenAICompatibleAgent("));
const iH = idx((l) => l === '      const headers = { "content-type": "application/json", accept: "text/event-stream" };', iMain);
const iAvail = idx((l) => l.startsWith("      const availableOutputTokens = deepSeek ?"), iH);
const iC = idx((l) => l === "      const chatBody = (includeUsage = false) => promptToolMode ? {", iH);
const iR = idx((l) => l === "      const requestBody = anthropic ? {", iC);
const iRm = idx((l) => l === "      } : responses ? {", iR);
const iRe = idx((l) => l === "      } : chatBody();", iRm);
if (iC + 0 >= iR) throw Error("order");
const P = ["input2", "messages", "promptToolMode", "availableTools", "deepSeek", "thinking", "maxOutputTokens", "availableOutputTokens", "deepSeekReasoningEffort", "genericReasoningEffort", "tools", "deepSeekThinking", "anthropicMaxOutputTokens", "anthropicThinkingEnabled", "anthropicThinkingBudget", "anthropicTools", "responsesReasoningEffort", "codexServiceTier", "codexTools"];
const re = new RegExp(`(?<![.\\w$])(${P.join("|")})(?![\\w$:])`, "g");
const conv = (lines) => lines.map((l) => {
  const short = l.match(/^(\s*)(messages|tools),$/);
  if (short) return `${short[1]}${short[2]}: r.${short[2]},`;
  return l.replace(/\.\.\./g, "\u0001").replace(re, "r.$1").replace(/\u0001/g, "...");
}).map((l) => l.startsWith("    ") ? l.slice(4) : l);
// 请求头：iH+1 .. iAvail-1 ，最后一行是 "      }"
const headerBody = L.slice(iH + 1, iAvail).map((l) => l.startsWith("    ") ? l.slice(4) : l);
// chatBody：首行改成 return 形式
const chatLines = L.slice(iC, iR);
chatLines[0] = "      return r.promptToolMode ? {";
if (!chatLines[chatLines.length - 1].endsWith("});")) throw Error("chat end " + chatLines.at(-1));
const anthLines = L.slice(iR, iRm); anthLines[0] = "      return {"; anthLines.push("      };");
const respLines = L.slice(iRm, iRe); respLines[0] = "      return {"; respLines.push("      };");
const out = [
  "// split-0029-step06: 从 runOpenAICompatibleAgent 拆出的「按协议构造请求」：请求头与三种协议的请求体（以及提示词工具模式的消息改写）。",
  "// 参数 r 是调用方当时的状态快照（模型、消息、思考设置、工具定义等），函数本身无副作用。",
  'import { ANTHROPIC_API_VERSION, textContent, toAnthropicMessages, anthropicSystemPrompt, codexInstructions, toCodexResponsesInput } from "./agent-message-formats.mjs";',
  "",
  ...L.slice(iPtiA, iPtmB + 1),
  "function buildAgentRequestHeaders({ input2, codex, anthropic }) {",
  ...headerBody.slice(0, 0),
  '  const headers = { "content-type": "application/json", accept: "text/event-stream" };',
  ...headerBody,
  "  return headers;",
  "}",
  "function buildChatRequestBody(r, includeUsage = false) {",
  ...conv(chatLines),
  "}",
  "function buildAnthropicRequestBody(r) {",
  ...conv(anthLines),
  "}",
  "function buildResponsesRequestBody(r) {",
  ...conv(respLines),
  "}",
  "",
  "export { promptToolsInstruction, toPromptToolMessages, buildAgentRequestHeaders, buildChatRequestBody, buildAnthropicRequestBody, buildResponsesRequestBody };",
  ""
];
fs.writeFileSync(dir + "agent-request.mjs", out.join(eol));
const params = "      const requestParams = () => ({ " + P.join(", ") + " });";
const rest = [];
L.forEach((l, i) => {
  if (i >= iPtiA && i <= iPtmB) { if (i === iPtiA) rest.push("// split-0029-step06: promptToolsInstruction / toPromptToolMessages 在 agent-request.mjs"); return; }
  if (i >= iH && i < iAvail) { if (i === iH) rest.push("      const headers = buildAgentRequestHeaders({ input2, codex, anthropic });"); return; }
  if (i >= iC && i <= iRe) {
    if (i === iC) rest.push(params, "      const chatBody = (includeUsage = false) => buildChatRequestBody(requestParams(), includeUsage);", "      const requestBody = anthropic ? buildAnthropicRequestBody(requestParams()) : responses ? buildResponsesRequestBody(requestParams()) : chatBody();");
    return;
  }
  rest.push(l);
});
const ii = rest.findIndex((l) => l.startsWith("import { agentToolResultContent }"));
rest.splice(ii + 1, 0, 'import { promptToolsInstruction, toPromptToolMessages, buildAgentRequestHeaders, buildChatRequestBody, buildAnthropicRequestBody, buildResponsesRequestBody } from "./agent-request.mjs";');
fs.writeFileSync(f, rest.join(eol));
console.log("STEP06_APPLIED", out.length, rest.length);
