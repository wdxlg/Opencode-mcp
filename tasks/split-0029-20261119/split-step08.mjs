// split-0029-step08: 本轮初始消息的构造（系统提示、历史选取 / 驱逐、检查点恢复、当前用户消息）和「插话让出」结果拆到 agent-turn.mjs。
import fs from "node:fs";
const dir = "recovered/esm/002-agent-host.js/", f = dir + "module-0029.mjs";
const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n";
const L = raw.split(/\r?\n/);
const idx = (pred, from = 0) => { const i = L.findIndex((l, j) => j >= from && pred(l)); if (i < 0) throw Error("anchor " + pred); return i; };
const iMain = idx((l) => l.startsWith("async function runOpenAICompatibleAgent("));
const iLet = idx((l) => l === "    let messages;", iMain);
if (L[iLet + 2] !== "    if (restoredCheckpoint) {" || L[iLet + 5] !== "    } else {" || L[iLet + 6] !== "      messages = [") throw Error("layout");
const iElse = iLet + 5;
const iSysEnd = idx((l) => l === "      ];", iElse);
const iCum = iSysEnd + 1;
if (!L[iCum].startsWith("      const currentUserMessage = ")) throw Error("cum");
const iTurnEnd = idx((l) => l === "    if (!cs.turnUserMessage) {", iCum) - 1;
if (L[iTurnEnd] !== "    }" || L[iTurnEnd - 1] !== "      }" || L[iTurnEnd - 2] !== "      firstStep = 1;") throw Error("end " + L.slice(iTurnEnd - 3, iTurnEnd + 1).join("|"));
const sysLines = L.slice(iLet + 7, iSysEnd); // 「{ role: system ... }」对象
const bodyLines = L.slice(iCum, iTurnEnd).filter((l) => l.trim() !== "firstStep = 1;");
const iY = idx((l) => l === "      if (step > firstStep && input2.shouldYield?.()) {", iTurnEnd);
if (L[iY + 1] !== '        emitTrace({ type: "yield", step, data: { reason: "steering" } });' || L[iY + 11] !== "      }") throw Error("yield layout");
const yieldRet = L.slice(iY + 2, iY + 11);
const ENV = ["input2", "cs", "contextSettings", "deepSeek", "contextWindow", "maxOutputTokens", "tools", "toolDefinitionTokens", "availableToolNames", "editingInstructions", "toolInstructions", "calibrated", "usableContextWindow", "applyContextCheckpoint"];
const DEPS = ["OPENCODE_CHAT_BEHAVIOR_CONTRACT", "userMessageContent", "selectHistoryWithinTokenBudget", "MAX_GENERIC_HISTORY_ITEMS", "contextHistoryHash", "summarizeEvictedHistory"];
const ded = (lines, n) => lines.map((l) => l.startsWith(" ".repeat(n)) ? l.slice(n) : l);
const out = [
  "// split-0029-step08: 从 runOpenAICompatibleAgent 拆出的「本轮开局」：在调用方给的空 messages 数组里放入系统提示、",
  "// 按上下文设置选取或驱逐历史（含已保存的压缩检查点恢复），最后放入当前用户消息；以及用户插话时的让出结果。",
  "// 压缩状态写入 env.cs（与 agent-compaction 共享同一对象）；module-0029 的本地常量与函数经 deps 传入，避免循环依赖。",
  'import { estimatedTokens, contextMessagesTokens, contextMessageTokens, contextHistoryItemTokens } from "./agent-context.mjs";',
  "",
  "function buildFreshTurnMessages(messages, env, deps) {",
  `  const { ${ENV.join(", ")} } = env;`,
  `  const { ${DEPS.join(", ")} } = deps;`,
  "  messages.push(",
  ...ded(sysLines, 4).map((l) => "  " + l),
  "  );",
  ...ded(bodyLines, 4),
  "}",
  "",
  "function steeringYieldResult({ trace, toolNames, contextCheckpointResult }) {",
  ...ded(yieldRet, 6).map((l) => "  " + l),
  "}",
  "",
  "export { buildFreshTurnMessages, steeringYieldResult };",
  ""
];
fs.writeFileSync(dir + "agent-turn.mjs", out.join(eol));
const rest = [];
L.forEach((l, i) => {
  if (i > iElse && i < iTurnEnd) {
    if (i === iElse + 1) rest.push(
      "      messages = [];",
      `      buildFreshTurnMessages(messages, { ${ENV.join(", ")} }, { ${DEPS.join(", ")} });`,
      "      firstStep = 1;");
    return;
  }
  if (i >= iY + 2 && i <= iY + 10) { if (i === iY + 2) rest.push("        return steeringYieldResult({ trace, toolNames, contextCheckpointResult });"); return; }
  rest.push(l);
});
const ii = rest.findIndex((l) => l.startsWith("import { agentToolResultContent }"));
rest.splice(ii + 1, 0, 'import { buildFreshTurnMessages, steeringYieldResult } from "./agent-turn.mjs";');
fs.writeFileSync(f, rest.join(eol));
console.log("STEP08_APPLIED", out.length, rest.length);
