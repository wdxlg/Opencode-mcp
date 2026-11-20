// split-0029-step08: 从 runOpenAICompatibleAgent 拆出的「本轮开局」：在调用方给的空 messages 数组里放入系统提示、
// 按上下文设置选取或驱逐历史（含已保存的压缩检查点恢复），最后放入当前用户消息；以及用户插话时的让出结果。
// 压缩状态写入 env.cs（与 agent-compaction 共享同一对象）；module-0029 的本地常量与函数经 deps 传入，避免循环依赖。
import { estimatedTokens, contextMessagesTokens, contextMessageTokens, contextHistoryItemTokens, contextTextOf, isContextImagePart, WORKSPACE_INSTRUCTIONS_OPEN } from "./agent-context.mjs";

// dsh-context-align item1: 按存下来的真实消息重放以往轮次（dsh 完整重放结构化消息）。
// 只保留提供商接受的字段；推理内容只在当前也是 DeepSeek thinking 时保留，Anthropic thinking 只在同一模型时保留；
// 工具调用与结果必须成对（缺结果补占位，孤立结果丢弃）。
function sanitizeReplayMessages(replay, options) {
  const out = [];
  const pending = new Set();
  const flushPending = () => {
    for (const id of pending) out.push({ role: "tool", tool_call_id: id, content: "(no result was recorded for this tool call)" });
    pending.clear();
  };
  for (const raw of Array.isArray(replay) ? replay : []) {
    if (!raw || typeof raw !== "object") continue;
    if (raw.role === "tool") {
      if (typeof raw.tool_call_id !== "string" || !pending.has(raw.tool_call_id)) continue;
      pending.delete(raw.tool_call_id);
      out.push({ role: "tool", tool_call_id: raw.tool_call_id, content: typeof raw.content === "string" ? raw.content : contextTextOf(raw.content) });
      continue;
    }
    flushPending();
    if (raw.role === "user") {
      const parts = Array.isArray(raw.content) && raw.content.some(isContextImagePart) ? raw.content.filter((part) => isContextImagePart(part) || typeof part?.text === "string" && part.text) : void 0;
      const content = parts ?? (typeof raw.content === "string" ? raw.content : contextTextOf(raw.content));
      if (parts ? parts.length : content) out.push({ role: "user", content });
      continue;
    }
    if (raw.role !== "assistant") continue;
    const calls = Array.isArray(raw.tool_calls) ? raw.tool_calls.filter((call) => call && typeof call.id === "string" && typeof call.function?.name === "string") : [];
    const content = typeof raw.content === "string" ? raw.content : raw.content == null ? "" : contextTextOf(raw.content);
    if (!content && !calls.length) continue;
    const message = { role: "assistant", content: options.deepSeek ? content : calls.length && !content ? null : content };
    if (options.keepReasoning && typeof raw.reasoning_content === "string") message.reasoning_content = raw.reasoning_content;
    if (options.keepAnthropicThinking && Array.isArray(raw.anthropic_thinking)) message.anthropic_thinking = raw.anthropic_thinking;
    if (calls.length) {
      message.tool_calls = calls.map((call) => ({ id: call.id, type: "function", function: { name: call.function.name, arguments: typeof call.function.arguments === "string" ? call.function.arguments : JSON.stringify(call.function.arguments ?? {}) } }));
      for (const call of calls) pending.add(call.id);
    }
    out.push(message);
  }
  flushPending();
  return out;
}
function historyItemMessages(item, env, userMessageContent) {
  if (item.role === "user") {
    const text = typeof item.replayUser === "string" && item.replayUser ? item.replayUser : item.content;
    return [{ role: "user", content: userMessageContent(text, item.images) }];
  }
  if (Array.isArray(item.replay) && item.replay.length) {
    const sameModel = typeof item.replayModel === "string" && item.replayModel === env.input2.model;
    const replayed = sanitizeReplayMessages(item.replay, { deepSeek: env.deepSeek, keepReasoning: Boolean(env.deepSeekThinking), keepAnthropicThinking: Boolean(env.anthropic) && sameModel });
    if (replayed.length) return replayed;
  }
  return [{ role: item.role, content: item.content }];
}

// handoff-transcript item1: 上一条回答出自别的模型时（Cursor 中途换模型的做法），在本轮用户消息末尾附一段接手说明：
// 历史由别的模型产生，只调用本次请求里定义的工具，历史里出现而自己没有的工具不要调用。放在用户消息里，系统前缀不变。
function modelHandoffNote(history, env) {
  let last;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === "assistant") {
      last = history[index];
      break;
    }
  }
  const previous = typeof last?.replayModel === "string" ? last.replayModel.trim() : "";
  const current = typeof env.input2.model === "string" ? env.input2.model.trim() : "";
  if (!previous || !current || previous === current) return "";
  const foreign = new Set();
  for (const item of history) {
    for (const message of Array.isArray(item?.replay) ? item.replay : []) {
      for (const call of Array.isArray(message?.tool_calls) ? message.tool_calls : []) {
        const name = call?.function?.name;
        if (typeof name === "string" && name && !env.availableToolNames?.has(name)) foreign.add(name);
      }
    }
  }
  const foreignList = [...foreign].sort().slice(0, 20);
  const toolLine = foreignList.length ? `The history contains calls to tools that are not available to you (${foreignList.join(", ")}${foreign.size > foreignList.length ? ", ..." : ""}); do not call them or imitate them, and use your own tools instead.` : "Do not copy tool-call formats from the history if they differ from your own tool definitions.";
  console.error(`[agent-host] model handoff note: ${previous} -> ${current}; foreign tools: ${foreignList.join(",") || "none"}`);
  return `<system-reminder>\nModel handoff: the earlier assistant turns in this conversation were produced by a different model (${previous}). You are now taking over mid-conversation as ${current}. Treat that history as context, keep the decisions and progress it records unless the user changes them, and continue the work. Call only the tools defined in this request. ${toolLine}\n</system-reminder>`;
}

// runtime-context item A: 会变的运行时上下文（模式说明、自定义 agent 指令、文件夹范围）。
// 和已发出的最近一份相同时不再重复；不同（或已被驱逐/没有）时附在本轮用户消息末尾。
const RUNTIME_CONTEXT_OPEN = "<runtime_context>";
const RUNTIME_CONTEXT_CLOSE = "</runtime_context>";
function runtimeContextText(input2) {
  const mode = typeof input2.modeInstructions === "string" ? input2.modeInstructions.trim() : "";
  return [
    RUNTIME_CONTEXT_OPEN,
    "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.",
    ...mode ? ["", "Selected mode and custom agent instructions:", mode] : [],
    "",
    `Default folder for this turn: ${input2.workspaceRoot}. File tools may access only these current-conversation roots: ${(input2.workspaceRoots ?? [input2.workspaceRoot]).join(", ")}. A new conversation starts in the open workspace; an explicitly selected local folder stays active for that conversation until the user selects another folder or returns to the open workspace. For a named folder outside the open workspace, first inspect the exact target read-only before modifying it. For a terminal command in an external folder, supply its absolute cwd; never silently work in the wrong folder.`,
    RUNTIME_CONTEXT_CLOSE
  ].join("\n");
}
function latestRuntimeContext(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "user") continue;
    const text = typeof message.content === "string" ? message.content : contextTextOf(message.content);
    const start = text.lastIndexOf(RUNTIME_CONTEXT_OPEN);
    if (start < 0) continue;
    const end = text.indexOf(RUNTIME_CONTEXT_CLOSE, start);
    if (end > start) return text.slice(start, end + RUNTIME_CONTEXT_CLOSE.length);
  }
  return "";
}
function appendToUserMessage(message, text) {
  if (typeof message.content === "string") {
    message.content = `${message.content}\n\n${text}`;
    return;
  }
  if (Array.isArray(message.content)) {
    const part = message.content.find((item) => item?.type === "text" && typeof item.text === "string");
    if (part) part.text = `${part.text}\n\n${text}`;
    else message.content.unshift({ type: "text", text });
  }
}
function attachRuntimeContext(messages, currentUserMessage, env) {
  const snapshot = runtimeContextText(env.input2);
  env.cs.runtimeContext = snapshot;
  if (latestRuntimeContext(messages) === snapshot) return false;
  appendToUserMessage(currentUserMessage, snapshot);
  return true;
}

function buildFreshTurnMessages(messages, env, deps) {
  const { input2, cs, contextSettings, deepSeek, contextWindow, maxOutputTokens, tools, toolDefinitionTokens, availableToolNames, editingInstructions, toolInstructions, calibrated, usableContextWindow, historyBudgetTokens, applyContextCheckpoint } = env;
  const { OPENCODE_CHAT_BEHAVIOR_CONTRACT, userMessageContent, selectHistoryWithinTokenBudget, MAX_GENERIC_HISTORY_ITEMS, contextHistoryHash, summarizeEvictedHistory } = deps;
  cs.runtimeContext = runtimeContextText(input2);
  messages.push(
      {
        role: "system",
        content: [
          // persona-step02: 规则中心的人设就是系统提示词——非空时整体替换自带的行为契约；按工具生成的说明照常接在后面
          typeof input2.persona === "string" && input2.persona.trim() ? input2.persona.trim() : OPENCODE_CHAT_BEHAVIOR_CONTRACT,
          // rules-sys-step01: 规则中心生效的规则正文
          ...typeof input2.systemRules === "string" && input2.systemRules.trim() ? [`<rules>\nThe following rules come from the user's OpenCode rules center. Follow them in every reply and every tool call; they override default behavior unless they conflict with safety.\n${input2.systemRules.trim()}\n</rules>`] : [],
          // runtime-context item A: 模式/自定义 agent 指令/文件夹范围会变，移出系统提示，放进 <runtime_context>（dsh runtime context 做法），系统前缀保持不变
          "The selected mode, any custom agent instructions, and this turn's folder scope are given in a <runtime_context> block in the conversation. Follow the most recent <runtime_context>; it supersedes earlier ones and carries the same authority as this system message.",
          ...editingInstructions,
          ...toolInstructions,
          ...availableToolNames.has("run_command") ? [
            "Use run_command for builds, tests, package managers, development commands, and environment inspection. background defaults to false for commands expected to finish; set it to true only for servers/watchers.",
            "For a command that remains running, use get_command_output with next_offset to read incremental output, send_command_input only when interaction is required, and cancel_command when the command should stop. Use the exact owner-scoped command_id and do not emulate cancellation by sending Ctrl+C as interactive text. Cancellation is soft-only by default. If force_required=true, force=true still requires host-owned local confirmation; high-risk mutations receive a stronger warning and only the local user can choose Force Stop Anyway.",
            "Treat terminal tool results as the only source of truth about command execution. If run_command or a follow-up terminal tool fails, explicitly say the command was not successfully executed or verified; never present predicted, remembered, or simulated output as observed terminal output.",
            "Do not use shell commands to edit files when apply_patch can express the edit."
          ] : [],
          ...availableToolNames.has("wait") ? [
            "Use wait to block for a fixed number of milliseconds when a background command needs time to finish or produce more output; prefer one wait sized to the expected work over repeated get_command_output polling."
          ] : []
        ].join("\n")
      }
  );
  // dsh-context-align item3: 工作区指令文件作为常驻用户消息紧跟系统提示（内容不变时前缀稳定），不驱逐、不压缩
  if (typeof input2.agentsInstructions?.text === "string" && input2.agentsInstructions.text.trim()) {
    messages.push({ role: "user", content: `${WORKSPACE_INSTRUCTIONS_OPEN}\n${input2.agentsInstructions.text.trim()}\n</workspace_instructions>` });
  }
  const fullHistory = Array.isArray(input2.history) ? input2.history : [];
  const handoffNote = input2.compactOnly ? "" : modelHandoffNote(fullHistory, env);
  const promptText = handoffNote ? `${typeof input2.prompt === "string" ? input2.prompt : ""}\n\n${handoffNote}` : input2.prompt;
  const currentUserMessage = { role: "user", content: userMessageContent(input2.compactOnly ? "(manual context compaction)" : promptText, input2.compactOnly ? void 0 : input2.images) };
  cs.turnUserMessage = currentUserMessage;
  cs.fullHistoryForContext = fullHistory;
  if (contextSettings.auto) {
    const saved = input2.contextCheckpoint;
    let startIndex = 0;
    if (saved && typeof saved.summary === "string" && saved.summary.trim() && Number.isInteger(saved.covered) && saved.covered > 0 && saved.covered <= fullHistory.length && saved.hash === contextHistoryHash(fullHistory.slice(0, saved.covered))) {
      cs.compactionSummary = saved.summary;
      cs.compactionCount = Number.isInteger(saved.count) ? saved.count : 1;
      cs.coveredHistory = saved.covered;
      startIndex = saved.covered;
      // handoff-transcript item2: 恢复检查点时带上完整历史文件路径（文件还在才用，并刷新时间以免被 7 天清理）
      if (typeof saved.transcript === "string" && saved.transcript) {
        try {
          const fsX = require("node:fs");
          if (fsX.existsSync(saved.transcript)) {
            const now = /* @__PURE__ */ new Date();
            fsX.utimesSync(saved.transcript, now, now);
            cs.transcript = { path: saved.transcript, inWorkspace: saved.transcriptInWorkspace !== false };
          }
        } catch {
        }
      }
    } else if (saved) {
      console.error("[agent-host] saved context checkpoint does not match this history; ignoring it");
    }
    cs.baseSystemContent = messages[0].content;
    applyContextCheckpoint();
    const fixedTokens = calibrated(contextMessagesTokens(messages) + toolDefinitionTokens + contextMessageTokens(currentUserMessage));
    // OpenCode context-compaction-dsh PART B: 历史预算 = dsh 触发点（配置错误时 W−O），不再用 threshold 比例（未设置时为 undefined）
    const historyBudget = Math.max(0, historyBudgetTokens() - fixedTokens - 4096);
    let usedHistory = 0;
    let firstKept = fullHistory.length;
    for (let index = fullHistory.length - 1; index >= startIndex; index -= 1) {
      const itemTokens = calibrated(contextHistoryItemTokens(fullHistory[index]));
      if (usedHistory + itemTokens > historyBudget) break;
      usedHistory += itemTokens;
      firstKept = index;
    }
    while (firstKept < fullHistory.length && fullHistory[firstKept]?.role === "assistant") firstKept += 1;
    for (let index = startIndex; index < firstKept; index += 1) {
      const item = fullHistory[index];
      if (!item?.content?.trim() && !item?.images?.length) continue;
      const evicted = { role: item.role, content: item.content };
      cs.contextHistoryIndex.set(evicted, index);
      cs.pendingEvictedHistory.push(evicted);
    }
    for (let index = firstKept; index < fullHistory.length; index += 1) {
      const item = fullHistory[index];
      if (!item?.content?.trim() && !item?.images?.length && !(Array.isArray(item?.replay) && item.replay.length)) continue;
      for (const historyMessage of historyItemMessages(item, env, userMessageContent)) {
        cs.contextHistoryIndex.set(historyMessage, index);
        messages.push(historyMessage);
      }
    }
    attachRuntimeContext(messages, currentUserMessage, env);
    messages.push(currentUserMessage);
  } else {
  const history = deepSeek ? selectHistoryWithinTokenBudget(
    fullHistory,
    Math.max(0, contextWindow - maxOutputTokens - estimatedTokens({ messages, tools, currentUserMessage }) - 4096)
  ) : fullHistory.slice(-MAX_GENERIC_HISTORY_ITEMS);
  if (fullHistory.length > history.length && messages[0]?.role === "system") {
    const digestBlock = summarizeEvictedHistory(fullHistory.slice(0, fullHistory.length - history.length), availableToolNames);
    // dsh-context-align item4: 摘要不再拼进系统提示（保持系统前缀不变），作为用户消息放在常驻前缀之后
    if (digestBlock) messages.push({ role: "user", content: digestBlock });
  }
  for (const item of history) {
    if (!item?.content?.trim() && !item?.images?.length && !(Array.isArray(item?.replay) && item.replay.length)) continue;
    messages.push(...historyItemMessages(item, env, userMessageContent));
  }
  attachRuntimeContext(messages, currentUserMessage, env);
  messages.push(currentUserMessage);
  }
}

function steeringYieldResult({ trace, toolNames, contextCheckpointResult }) {
    return {
      status: "completed",
      answer: "（收到你的新消息，已在当前这一步完成后暂停，接着处理新消息。）",
      trace,
      toolNames,
      answerStreamed: false,
      yielded: true,
      ...contextCheckpointResult()
    };
}

export { buildFreshTurnMessages, steeringYieldResult, sanitizeReplayMessages, modelHandoffNote, runtimeContextText, latestRuntimeContext };
