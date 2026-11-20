// split-0029-step05: 单个工具调用的执行（不可用工具计数、外部工具、权限确认、apply_patch 编辑票据、MCP 调用、失败文本）拆到 agent-tool-exec.mjs
import fs from "node:fs";
const dir = "recovered/esm/002-agent-host.js/", f = dir + "module-0029.mjs";
const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n";
const L = raw.split(/\r?\n/);
const idx = (pred, from = 0) => { const i = L.findIndex((l, j) => j >= from && pred(l)); if (i < 0) throw Error("anchor " + pred); return i; };
const iMaxU = idx((l) => l === "var MAX_UNAVAILABLE_TOOL_ATTEMPTS = 5;");
const iPtA = idx((l) => l.startsWith("// checkpoint-step01: 从 Codex 风格补丁里取出要改动的文件路径"));
const iPtB = idx((l) => l === "}", iPtA);
const iTfA = idx((l) => l === "function toolFailureText(toolName, error2) {");
const iTfB = idx((l) => l === "}", iTfA);
const iMain = idx((l) => l.startsWith("async function runOpenAICompatibleAgent("));
const iCounter = idx((l) => l === "  let unavailableToolAttempts = 0;", iMain);
const iCat = idx((l) => l.startsWith("    const { externalToolNames, availableTools, availableToolNames,") && l.includes("buildAgentToolCatalog"), iMain);
const iWrap = idx((l) => l === "        ocToolHookWrap(input2, dependencies, emitTrace, async ({ call, toolName, args, unavailableReason }) => {", iMain);
if (!L[iWrap - 2].includes("preparedCalls,") || !L[iWrap - 3].includes("const completedCalls = await mapWithConcurrency(")) throw Error("wrap ctx");
const iEnd = idx((l) => l === "        })", iWrap);
if (L[iEnd + 1] !== "      );") throw Error("wrap end " + L[iEnd + 1]);
const fnBody = L.slice(iWrap + 1, iEnd).map((l) => l.startsWith("      ") ? l.slice(6) : l);
const exp = ["MAX_UNAVAILABLE_TOOL_ATTEMPTS", "patchTargetPaths", "toolFailureText", "createToolCallExecutor"];
const out = [
  "// split-0029-step05: 从 runOpenAICompatibleAgent 拆出的单个工具调用执行。每轮对话创建一个执行器（不可用工具计数跨步骤累计，",
  "// 与拆分前同一变量的语义一致）；子 agent 与项目 hooks 仍由 module-0029 的 ocToolHookWrap 包在外面。",
  'import { agentToolResultContent } from "./module-0065.mjs";',
  "",
  L[iMaxU],
  "",
  ...L.slice(iPtA, iPtB + 1),
  "",
  ...L.slice(iTfA, iTfB + 1),
  "",
  "function createToolCallExecutor({ input2, client, availableToolNames, externalToolNames, fileToolRequestOptions }) {",
  "  let unavailableToolAttempts = 0;",
  "  return async ({ call, toolName, args, unavailableReason }) => {",
  ...fnBody,
  "  };",
  "}",
  "",
  `export { ${exp.join(", ")} };`,
  ""
];
fs.writeFileSync(dir + "agent-tool-exec.mjs", out.join(eol));
const drop = new Set([iMaxU, iCounter]);
for (let i = iPtA; i <= iPtB; i++) drop.add(i);
for (let i = iTfA; i <= iTfB; i++) drop.add(i);
const rest = [];
L.forEach((l, i) => {
  if (i === iMaxU) { rest.push("// split-0029-step05: MAX_UNAVAILABLE_TOOL_ATTEMPTS / patchTargetPaths / toolFailureText 在 agent-tool-exec.mjs"); return; }
  if (drop.has(i)) return;
  if (i > iWrap && i < iEnd) return;
  if (i === iWrap) { rest.push("        ocToolHookWrap(input2, dependencies, emitTrace, executeToolCall)"); return; }
  if (i === iEnd) return;
  rest.push(l);
  if (i === iCat) rest.push("    const executeToolCall = createToolCallExecutor({ input2, client, availableToolNames, externalToolNames, fileToolRequestOptions });");
});
const ii = rest.findIndex((l) => l.startsWith("import { agentToolResultContent }"));
rest.splice(ii + 1, 0, `import { ${exp.join(", ")} } from "./agent-tool-exec.mjs";`);
fs.writeFileSync(f, rest.join(eol));
console.log("STEP05_APPLIED", out.length, rest.length);
