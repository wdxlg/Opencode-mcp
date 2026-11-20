// split-0029-step03: 从 module-0029 拆出的上下文预算与压缩（token 估算、旧工具结果清理、图片卸载、压缩提示词）。纯函数。
// module-0029 原样 re-export 这些名字，对外接口不变。

function ocCharTokenWeight(code) {
  if (code <= 127) {
    if (code === 32 || code === 9 || code === 10 || code === 13) return 0.15;
    if (code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122) return 0.27;
    return 0.55;
  }
  if (code >= 0x3000 && code <= 0x9fff || code >= 0xac00 && code <= 0xd7af || code >= 0xf900 && code <= 0xfaff || code >= 0xff00 && code <= 0xffef || code >= 0x20000 && code <= 0x3ffff) return 0.65;
  if (code > 0xffff) return 1.5;
  if (code < 0x0800) return 0.5;
  return 1;
}
// dsh-metrics-20261119 (AH): dsh-token-meter estimator: CHARS_PER_TOKEN=4 over UTF-16 .length, BLOCK_OVERHEAD=4, empty = 0 (ocCharTokenWeight kept exported, unused).
var OC_CHARS_PER_TOKEN = 4, OC_BLOCK_OVERHEAD = 4;
function estimatedTokens(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return Math.ceil(text.length / OC_CHARS_PER_TOKEN);
}
var OC_PRIOR_TOOL_CONTEXT_OPEN = "<opencode_prior_tool_context>";
var OC_PRIOR_TOOL_CONTEXT_CLOSE = "</opencode_prior_tool_context>";
var OC_PRIOR_TOOL_CONTEXT_TRIMMED = "\u2026[older tool context trimmed to save context:";
function shrinkPriorToolContextBlocks(messages, uptoIndex, headChars = 4e3, tailChars = 1e3) {
  let freed = 0;
  let count = 0;
  const end = Math.min(messages.length, uptoIndex > 0 ? uptoIndex : messages.length);
  for (let index = 1; index < end; index += 1) {
    const message = messages[index];
    if (message?.role !== "assistant" || typeof message.content !== "string" || !message.content.includes(OC_PRIOR_TOOL_CONTEXT_OPEN)) continue;
    const before = message.content;
    let changed = false;
    const next = before.replace(/<opencode_prior_tool_context>([\s\S]*?)(<\/opencode_prior_tool_context>|$)/g, (whole, inner, close) => {
      if (inner.length <= headChars + tailChars + 400) return whole;
      const omitted = inner.length - headChars - tailChars;
      const marker = `\n${OC_PRIOR_TOOL_CONTEXT_TRIMMED} ${omitted} chars omitted; re-run the tool if exact output is needed]\u2026\n`;
      changed = true;
      return `${OC_PRIOR_TOOL_CONTEXT_OPEN}${inner.slice(0, headChars)}${marker}${tailChars > 0 ? inner.slice(-tailChars) : ""}${close}`;
    });
    if (!changed) continue;
    message.content = next;
    freed += estimatedTokens(before) - estimatedTokens(next);
    count += 1;
  }
  return { freed, count };
}
var CONTEXT_IMAGE_TOKENS = 1024;
var CLEARED_TOOL_RESULT_PREFIX = "[Old tool result cleared to save context:";
var CONTEXT_FALLBACK_WINDOW = 262144;
function contextCompactionSettings(input2) {
  const raw = input2.contextCompaction && typeof input2.contextCompaction === "object" ? input2.contextCompaction : {};
  const num = (value, fallback, min, max) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  return {
    auto: raw.auto !== false,
    // OpenCode context-compaction-dsh: 未传时按 dsh 公式（见 compactTriggerTokens / keepRecentTokens）
    threshold: typeof raw.threshold === "number" && Number.isFinite(raw.threshold) ? num(raw.threshold, 0.8, 0.3, 0.98) : void 0,
    // OpenCode context-compaction-dsh PART B: 0 / 未设置 = dsh 16% 规则；>0 为固定 retain（无下限）
    keepRecentTokens: typeof raw.keepRecentTokens === "number" && Number.isFinite(raw.keepRecentTokens) && raw.keepRecentTokens > 0 ? Math.floor(Math.min(1e7, raw.keepRecentTokens)) : void 0,
    outputReserve: typeof raw.outputReserve === "number" && Number.isInteger(raw.outputReserve) && raw.outputReserve >= 0 && raw.outputReserve <= 1e7 ? raw.outputReserve : void 0,
    keepToolResults: Math.floor(num(raw.keepToolResults, 6, 1, 50)),
    // OpenCode context-fixes: 扩展传回的学习值（真实窗口、估算校准系数）
    learnedWindow: typeof raw.learnedWindow === "number" && Number.isInteger(raw.learnedWindow) && raw.learnedWindow >= 1024 && raw.learnedWindow <= 1e7 ? raw.learnedWindow : void 0,
    tokenRatio: typeof raw.tokenRatio === "number" && Number.isFinite(raw.tokenRatio) && raw.tokenRatio >= 0.3 && raw.tokenRatio <= 3 ? raw.tokenRatio : void 0
  };
}
function contextTextOf(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content == null ? "" : String(content);
  return content.map((part) => {
    if (!part || typeof part !== "object") return "";
    if (part.type === "image_url" || part.type === "image" || part.type === "input_image") return "[image]";
    return typeof part.text === "string" ? part.text : "";
  }).filter(Boolean).join("\n");
}
function contextContentTokens(content) {
  if (typeof content === "string") return content.length ? estimatedTokens(content) + OC_BLOCK_OVERHEAD : 0;
  if (!Array.isArray(content)) return content == null ? 0 : estimatedTokens(content) + OC_BLOCK_OVERHEAD;
  let total = 0;
  for (const part of content) {
    if (part?.type === "image_url" || part?.type === "image" || part?.type === "input_image") total += CONTEXT_IMAGE_TOKENS + OC_BLOCK_OVERHEAD;
    else total += (typeof part?.text === "string" ? estimatedTokens(part.text) : estimatedTokens(part ?? "")) + OC_BLOCK_OVERHEAD;
  }
  return total;
}
function contextMessageTokens(message) {
  if (message?.role === "system") {
    const text = contextTextOf(message.content);
    return text.length ? estimatedTokens(text) + OC_BLOCK_OVERHEAD : 0;
  }
  let total = 4 + contextContentTokens(message?.content);
  if (Array.isArray(message?.tool_calls)) for (const call of message.tool_calls) total += estimatedTokens(String(call?.function?.name ?? call?.name ?? "")) + estimatedTokens(String(call?.function?.arguments ?? call?.arguments ?? "")) + OC_BLOCK_OVERHEAD;
  if (typeof message?.reasoning_content === "string" && message.reasoning_content) total += estimatedTokens(message.reasoning_content) + OC_BLOCK_OVERHEAD;
  if (Array.isArray(message?.anthropic_thinking)) total += estimatedTokens(message.anthropic_thinking) + OC_BLOCK_OVERHEAD;
  return total;
}
function contextMessagesTokens(list) {
  let total = 0;
  for (const message of list) total += contextMessageTokens(message);
  return total;
}
function contextBreakdownOf(messages, tools) {
  const out = { system: 0, tools: 0, messages: 0, mcp: 0, skills: 0 };
  try {
    const isSkill = (name) => /skill/i.test(String(name ?? ""));
    for (const tool of Array.isArray(tools) ? tools : []) {
      const tokens = estimatedTokens([tool?.name, tool?.description ?? "", tool?.inputSchema ?? {}]);
      // dsh-context-align item6: 技能与 MCP / 连接器合并为一类
      if (isSkill(tool?.name) || tool?.contextCategory === "mcp" || /^mcp_/i.test(String(tool?.name ?? ""))) out.mcp += tokens;
      else out.tools += tokens;
    }
    const callNames = new Map();
    for (const message of Array.isArray(messages) ? messages : []) {
      if (message?.role !== "assistant" || !Array.isArray(message.tool_calls)) continue;
      for (const call of message.tool_calls) if (call?.id) callNames.set(call.id, call.function?.name ?? call.name);
    }
    (Array.isArray(messages) ? messages : []).forEach((message, index) => {
      const tokens = contextMessageTokens(message);
      if (index === 0 && message?.role === "system") out.system += tokens;
      else if (message?.role === "tool" && isSkill(callNames.get(message.tool_call_id))) out.mcp += tokens;
      else out.messages += tokens;
    });
  } catch {
  }
  return out;
}
function contextHistoryItemTokens(item) {
  // dsh-context-align item1: 有真实消息记录（replay）的轮次按要重放的结构化消息计数
  if (item?.role === "assistant" && Array.isArray(item.replay) && item.replay.length) return contextMessagesTokens(item.replay);
  const text = item?.role === "user" && typeof item.replayUser === "string" ? item.replayUser : typeof item?.content === "string" ? item.content : item?.content == null ? "" : JSON.stringify(item.content);
  return 4 + (text.length ? estimatedTokens(text) + OC_BLOCK_OVERHEAD : 0) + (Array.isArray(item?.images) ? item.images.length : 0) * (CONTEXT_IMAGE_TOKENS + OC_BLOCK_OVERHEAD);
}
function contextClip(text, maxChars) {
  const value = String(text ?? "");
  if (value.length <= maxChars) return value;
  const head = Math.floor(maxChars * 0.7);
  const tail = Math.max(0, maxChars - head);
  return `${value.slice(0, head)}\n…[${value.length - head - tail} chars omitted]…\n${tail ? value.slice(-tail) : ""}`;
}
function isContextOverflowError(error2) {
  const message = error2 instanceof Error ? error2.message : String(error2 ?? "");
  const status = typeof error2 === "object" && error2 !== null && "status" in error2 ? Number(error2.status) : NaN;
  if (status === 429 || /rate.?limit|per.?minute|\bTPM\b|quota/i.test(message)) return false;
  return /context[_ ]length[_ ]exceeded|maximum context length|context (window|length)[^.\n]{0,40}(exceed|too long|limit)|prompt is too long|input is too long|too many (input |prompt )?tokens|exceeds? (the )?(model'?s? )?(maximum|max|context)|reduce the length of the messages|string_above_max_length|input length[^.\n]{0,40}exceed|超出.{0,10}(上下文|长度)|上下文.{0,10}(过长|超)/i.test(message);
}
function serializeForCompaction(list, toolChars, textChars) {
  const nameById = /* @__PURE__ */ new Map();
  const lines = [];
  for (const message of list) {
    if (message?.role === "user") {
      lines.push(`[User]: ${contextClip(contextTextOf(message.content), textChars)}`);
    } else if (message?.role === "assistant") {
      const text = contextTextOf(message.content);
      if (text.trim()) lines.push(`[Assistant]: ${contextClip(text, textChars)}`);
      for (const call of Array.isArray(message.tool_calls) ? message.tool_calls : []) {
        nameById.set(call?.id, call?.function?.name ?? "tool");
        lines.push(`[Assistant tool call]: ${call?.function?.name ?? "tool"}(${contextClip(typeof call?.function?.arguments === "string" ? call.function.arguments : JSON.stringify(call?.function?.arguments ?? {}), 600)})`);
      }
    } else if (message?.role === "tool") {
      lines.push(`[Tool result${nameById.has(message.tool_call_id) ? ` of ${nameById.get(message.tool_call_id)}` : ""}]: ${contextClip(contextTextOf(message.content), toolChars)}`);
    }
  }
  return lines;
}
// dsh-context-align item2: dsh-compaction-basic 的摘要指令原文（lib/index.js COMPACTION_INSTRUCTION）与检查点包装（CHECKPOINT_PREAMBLE + <compacted-summary>）。
// 指令作为最后一条用户消息追加在已缓存的对话前缀后面；摘要作为用户消息插在系统提示（和常驻的工作区指令）之后。
var DSH_SUMMARY_OPEN_TAG = "<compacted-summary>";
var DSH_SUMMARY_CLOSE_TAG = "</compacted-summary>";
var DSH_COMPACTION_INSTRUCTION = [
  "You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets another model resume the work with no loss of essential context.",
  "",
  "Output EXACTLY the Markdown structure below: keep every section, in order. Use terse bullets, not prose paragraphs. Write \"(none)\" for an empty section \u2014 never drop a section.",
  "",
  "## Primary Request and Intent",
  "- [the user's original and evolving goals; quote verbatim where the exact wording matters]",
  "",
  "## Key Technical Concepts",
  "- [technologies, frameworks, patterns, and conventions in play]",
  "",
  "## Files and Code",
  "- [exact path: why it matters, key changes or snippets]",
  "",
  "## Errors and Fixes",
  "- [error: how it was resolved, plus any related user feedback]",
  "",
  "## Pending Jobs",
  "- [explicitly requested work not yet completed]",
  "",
  "## Current Work",
  "- [precisely what was in progress at this checkpoint]",
  "",
  "## Next Step",
  "- [the single next action, directly in line with the most recent request, or \"(none)\"]",
  "",
  "## Critical Context",
  "- [decisions and their rationale, constraints, user preferences, open questions, data needed to continue]",
  "",
  "Rules:",
  "- Write concise English engineering prose. Preserve exact file paths, commands, error strings, identifiers, numeric values, function signatures, and syntax fragments.",
  "- Capture user feedback and explicit instructions faithfully, especially corrections.",
  "- Do NOT mention this summarization request or that the context was compacted.",
  "- Output only the checkpoint text: do not call any tool or take any other action.",
  `- If the conversation already contains a ${DSH_SUMMARY_OPEN_TAG} block, it is a PRIOR checkpoint. Do not copy it forward verbatim: preserve still-true facts, drop stale ones, and merge newer information into a single consolidated summary under the same structure.`
].join("\n");
var DSH_CHECKPOINT_PREAMBLE = "This is an automatically generated checkpoint condensing an earlier span of the conversation to free up context. Treat the captured context as established background and build on it without restating it. Continue the task directly from the messages that follow, without acknowledging this checkpoint.";
function dshFrameSummary(summary) {
  return `${DSH_CHECKPOINT_PREAMBLE}\n\n${DSH_SUMMARY_OPEN_TAG}\n${String(summary ?? "").trim()}\n${DSH_SUMMARY_CLOSE_TAG}`;
}
function dshUnframeSummary(text) {
  let value = String(text ?? "").trim();
  const open = value.indexOf(DSH_SUMMARY_OPEN_TAG);
  const close = value.lastIndexOf(DSH_SUMMARY_CLOSE_TAG);
  if (open >= 0 && close > open) value = value.slice(open + DSH_SUMMARY_OPEN_TAG.length, close).trim();
  return value;
}
function isCheckpointSummaryMessage(message) {
  return message?.role === "user" && typeof message.content === "string" && message.content.startsWith(DSH_CHECKPOINT_PREAMBLE);
}
// dsh-context-align item3: 工作区指令（AGENTS.md / CLAUDE.md）作为常驻用户消息紧跟系统提示，不参与驱逐和压缩
var WORKSPACE_INSTRUCTIONS_OPEN = "<workspace_instructions>";
var WORKSPACE_INSTRUCTIONS_PATH_RE = /<workspace_instructions path="([^"]+)">/g;
function isPermanentPrefixMessage(message) {
  return message?.role === "user" && typeof message.content === "string" && message.content.startsWith(WORKSPACE_INSTRUCTIONS_OPEN);
}
function permanentPrefixEnd(messages) {
  let index = 1;
  while (index < messages.length && isPermanentPrefixMessage(messages[index])) index += 1;
  return index;
}
function isSyntheticUserMessage(message) {
  if (message?.role !== "user") return false;
  if (isPermanentPrefixMessage(message) || isCheckpointSummaryMessage(message)) return true;
  const text = contextTextOf(message.content);
  return /^Visual content returned by tool/.test(text) || text.startsWith('<workspace_instructions path="');
}
var CONTEXT_COMPACTION_SYSTEM = "You compact the working context of a coding agent so the same agent can continue the same task with far less context. Write a faithful, dense checkpoint. Never invent facts, results, or file contents. Write in the language the user writes in.";
function contextCompactionPrompt(previousSummary, transcript, focus) {
  return [
    previousSummary ? `Previous checkpoint (update it; keep everything that is still true, drop what was superseded):\n<previous_checkpoint>\n${previousSummary}\n</previous_checkpoint>\n` : "",
    `Conversation to fold into the checkpoint:\n<transcript>\n${transcript}\n</transcript>\n`,
    // dsh-context-align item2: 回退路径（对话太长无法原样重放时）也用 dsh 的 8 段指令
    DSH_COMPACTION_INSTRUCTION.replace("the conversation ABOVE", "the conversation in the transcript above"),
    focus ? `Additional focus requested by the user: ${focus}` : ""
  ].filter(Boolean).join("\n");
}
// OpenCode context-compaction-dsh PART B: 与 dsh-compaction-tool-result-pruner 一致——超过 8192 个字符（按 Unicode 码点）的工具结果
// 留开头 4096 + 固定标记 + 结尾 1024；包括最新的结果。只在压缩路径（压力 / 溢出）里调用。
var COMPACTION_TOOL_RESULT_MAX_CHARS = 8192;
var COMPACTION_TOOL_RESULT_HEAD_CHARS = 4096;
var COMPACTION_TOOL_RESULT_TAIL_CHARS = 1024;
var COMPACTION_TOOL_RESULT_PRUNE_MARKER = "\n\n[... tool result middle pruned ...]\n\n";
function trimToolTextForCompaction(text) {
  const value = String(text ?? "");
  if (value.length <= COMPACTION_TOOL_RESULT_MAX_CHARS) return void 0;
  const points = Array.from(value);
  if (points.length <= COMPACTION_TOOL_RESULT_MAX_CHARS) return void 0;
  return `${points.slice(0, COMPACTION_TOOL_RESULT_HEAD_CHARS).join("")}${COMPACTION_TOOL_RESULT_PRUNE_MARKER}${points.slice(points.length - COMPACTION_TOOL_RESULT_TAIL_CHARS).join("")}`;
}
function trimContextToolResultsForCompaction(messages, priorUptoIndex) {
  let count = 0;
  for (const message of messages) {
    if (message?.role !== "tool") continue;
    if (typeof message.content === "string") {
      const next = trimToolTextForCompaction(message.content);
      if (next !== void 0) {
        message.content = next;
        count += 1;
      }
    } else if (Array.isArray(message.content)) {
      let changed = false;
      const parts = message.content.map((part) => {
        if (!part || typeof part !== "object" || typeof part.text !== "string") return part;
        const next = trimToolTextForCompaction(part.text);
        if (next === void 0) return part;
        changed = true;
        count += 1;
        return { ...part, text: next };
      });
      if (changed) message.content = parts;
    }
  }
  try {
    count += shrinkPriorToolContextBlocks(messages, priorUptoIndex, COMPACTION_TOOL_RESULT_HEAD_CHARS, COMPACTION_TOOL_RESULT_TAIL_CHARS).count;
  } catch {
  }
  return { count };
}
function clearOldContextToolResults(messages, keepCount) {
  const toolIndexes = [];
  for (let index = 1; index < messages.length; index += 1) if (messages[index]?.role === "tool") toolIndexes.push(index);
  const clearable = new Set(toolIndexes.slice(0, Math.max(0, toolIndexes.length - keepCount)));
  const lastKeptTool = toolIndexes.length > keepCount ? toolIndexes[toolIndexes.length - keepCount] : 0;
  const labelById = /* @__PURE__ */ new Map();
  for (const message of messages) {
    for (const call of Array.isArray(message?.tool_calls) ? message.tool_calls : []) {
      labelById.set(call?.id, `${call?.function?.name ?? "tool"}(${String(typeof call?.function?.arguments === "string" ? call.function.arguments : JSON.stringify(call?.function?.arguments ?? {})).replace(/\s+/g, " ").slice(0, 160)})`);
    }
  }
  let freed = 0;
  let count = 0;
  for (let index = 1; index < messages.length; index += 1) {
    const message = messages[index];
    if (clearable.has(index) && typeof message.content === "string" && message.content.length > 400 && !message.content.startsWith(CLEARED_TOOL_RESULT_PREFIX)) {
      const before = estimatedTokens(message.content);
      const head = message.content.slice(0, 200).replace(/\s+/g, " ");
      message.content = `${CLEARED_TOOL_RESULT_PREFIX} ${labelById.get(message.tool_call_id) ?? "tool"} returned ${message.content.length} chars; it began: "${head}…". Call the tool again if you need the exact content.]`;
      freed += before - estimatedTokens(message.content);
      count += 1;
    } else if (index < lastKeptTool && message?.role === "user" && Array.isArray(message.content) && /^Visual content returned by tool/.test(contextTextOf(message.content))) {
      const before = contextContentTokens(message.content);
      message.content = `${contextTextOf(message.content).split("\n")[0].replace("[image]", "")} [Old tool image cleared to save context; call the tool again if you need it.]`;
      freed += before - estimatedTokens(message.content);
      count += 1;
    }
  }
  return { freed, count };
}
function isContextImagePart(part) {
  return !!part && typeof part === "object" && (part.type === "image_url" || part.type === "image" || part.type === "input_image");
}
function contextMaxImages(input2) {
  const raw = Number(input2?.contextMaxImages ?? globalThis.process?.env?.OPENCODE_CONTEXT_MAX_IMAGES);
  return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 6;
}
function offloadOldContextImages(messages, maxImages) {
  if (!maxImages || !Array.isArray(messages)) return { count: 0, freed: 0 };
  let lastUser = -1;
  for (let index = messages.length - 1; index >= 0; index -= 1) if (messages[index]?.role === "user" && !/^Visual content returned by tool/.test(contextTextOf(messages[index].content))) { lastUser = index; break; }
  let kept = 0, count = 0, freed = 0;
  for (let index = messages.length - 1; index >= 1; index -= 1) {
    const message = messages[index];
    if (!Array.isArray(message?.content) || !message.content.some(isContextImagePart)) continue;
    let changed = false;
    const parts = message.content.map((part) => {
      if (!isContextImagePart(part)) return part;
      if (index === lastUser || kept < maxImages) { kept += 1; return part; }
      changed = true;
      count += 1;
      freed += CONTEXT_IMAGE_TOKENS;
      return { type: "text", text: message.role === "user" && !/^Visual content returned by tool/.test(contextTextOf(message.content)) ? "[Earlier image omitted to save context; ask the user to re-attach it if it matters.]" : "[Old tool image offloaded to save context; call the tool again if you need it.]" };
    });
    if (changed) message.content = parts;
  }
  return { count, freed };
}

export { OC_CHARS_PER_TOKEN, OC_BLOCK_OVERHEAD, DSH_SUMMARY_OPEN_TAG, DSH_SUMMARY_CLOSE_TAG, DSH_COMPACTION_INSTRUCTION, DSH_CHECKPOINT_PREAMBLE, dshFrameSummary, dshUnframeSummary, isCheckpointSummaryMessage, WORKSPACE_INSTRUCTIONS_OPEN, WORKSPACE_INSTRUCTIONS_PATH_RE, isPermanentPrefixMessage, permanentPrefixEnd, isSyntheticUserMessage };
export { ocCharTokenWeight, estimatedTokens, OC_PRIOR_TOOL_CONTEXT_OPEN, OC_PRIOR_TOOL_CONTEXT_CLOSE, OC_PRIOR_TOOL_CONTEXT_TRIMMED, shrinkPriorToolContextBlocks, CONTEXT_IMAGE_TOKENS, CLEARED_TOOL_RESULT_PREFIX, CONTEXT_FALLBACK_WINDOW, contextCompactionSettings, contextTextOf, contextContentTokens, contextMessageTokens, contextMessagesTokens, contextBreakdownOf, contextHistoryItemTokens, contextClip, isContextOverflowError, serializeForCompaction, CONTEXT_COMPACTION_SYSTEM, contextCompactionPrompt, COMPACTION_TOOL_RESULT_MAX_CHARS, COMPACTION_TOOL_RESULT_HEAD_CHARS, COMPACTION_TOOL_RESULT_TAIL_CHARS, trimToolTextForCompaction, trimContextToolResultsForCompaction, clearOldContextToolResults, isContextImagePart, contextMaxImages, offloadOldContextImages };
