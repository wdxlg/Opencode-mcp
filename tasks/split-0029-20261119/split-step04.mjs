// split-0029-step04: 工具目录（列出工作区/外部工具、过滤、排序、三种协议的工具定义、工具相关系统提示）拆到 agent-tool-catalog.mjs
import fs from "node:fs";
const dir = "recovered/esm/002-agent-host.js/", f = dir + "module-0029.mjs";
const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n";
const L = raw.split(/\r?\n/);
const idx = (pred, from = 0) => { const i = L.findIndex((l, j) => j >= from && pred(l)); if (i < 0) throw Error("anchor " + pred); return i; };
// 1) 常量
const iMax = idx((l) => l === "var MAX_API_TOOLS = 128;");
const iSubA = idx((l) => l.startsWith('var SUBAGENT_TOOL_NAME = "spawn_subagent";'));
const iSubB = idx((l) => l === "};", idx((l) => l === "var SUBAGENT_TOOL = {", iSubA));
// 2) 主函数里的工具目录块
const iMain = idx((l) => l.startsWith("async function runOpenAICompatibleAgent("));
const iBlkA = idx((l) => l.startsWith("    const listed = client ? await client.listTools(fileToolRequestOptions)"), iMain);
const iBlkB = idx((l) => l.startsWith("    const toolNames = availableTools.map((tool) => tool.name);"), iBlkA) - 1;
if (!L[iBlkB].startsWith("    ] : []).filter((line) => describedToolNames")) throw Error("block end moved: " + L[iBlkB]);
const body = L.slice(iBlkA, iBlkB + 1).map((l) => l.startsWith("  ") ? l.slice(2) : l);
const ret = ["externalToolNames", "availableTools", "availableToolNames", "tools", "codexTools", "anthropicTools", "editingInstructions", "toolInstructions"];
const consts = ["MAX_API_TOOLS", "SUBAGENT_TOOL_NAME", "SUBAGENT_READ_TOOLS", "SUBAGENT_INSTRUCTIONS", "SUBAGENT_TOOL"];
const out = [
  "// split-0029-step04: 从 runOpenAICompatibleAgent 拆出的工具目录：列出工作区 / 外部工具，按 allowedTools 过滤、裁到 API 上限、",
  "// 按需加入 spawn_subagent、按名字排序，生成 Chat Completions / Codex Responses / Anthropic 三种工具定义和工具相关的系统提示。",
  "// module-0029 原样 re-export 这里的常量，对外接口不变。",
  "",
  L[iMax],
  "",
  ...L.slice(iSubA, iSubB + 1),
  "",
  "async function buildAgentToolCatalog(input2, client, fileToolRequestOptions) {",
  ...body,
  `  return { ${ret.join(", ")} };`,
  "}",
  "",
  `export { ${consts.join(", ")}, buildAgentToolCatalog };`,
  ""
];
fs.writeFileSync(dir + "agent-tool-catalog.mjs", out.join(eol));
const rest = [];
L.forEach((l, i) => {
  if (i === iMax) { rest.push("// split-0029-step04: MAX_API_TOOLS 在 agent-tool-catalog.mjs"); return; }
  if (i >= iSubA && i <= iSubB) { if (i === iSubA) rest.push("// split-0029-step04: SUBAGENT_* 常量在 agent-tool-catalog.mjs"); return; }
  if (i >= iBlkA && i <= iBlkB) { if (i === iBlkA) rest.push(`    const { ${ret.join(", ")} } = await buildAgentToolCatalog(input2, client, fileToolRequestOptions);`); return; }
  rest.push(l);
});
const ii = rest.findIndex((l) => l.startsWith("import { agentToolResultContent }"));
rest.splice(ii + 1, 0, `import { ${consts.join(", ")}, buildAgentToolCatalog } from "./agent-tool-catalog.mjs";`);
fs.writeFileSync(f, rest.join(eol));
console.log("STEP04_APPLIED", out.length, rest.length);
