// split-0029-step07: 从 runOpenAICompatibleAgent 拆出的上下文压缩器。原来共享在闭包里的压缩状态收进 state（cs），
// 主函数通过 compactor.state 读写；会变的 messages / endpoint / responses / managedContextWindow 由 env 的 getter 实时提供。
// 请求函数等仍住在 module-0029，经 deps 传入，避免循环依赖。
import { buildAgentRequestHeaders } from "./agent-request.mjs";
import { contextClip, contextTextOf, contextMessagesTokens, contextMessageTokens, estimatedTokens, serializeForCompaction, CONTEXT_COMPACTION_SYSTEM, contextCompactionPrompt, trimContextToolResultsForCompaction, DSH_COMPACTION_INSTRUCTION, dshFrameSummary, dshUnframeSummary, isCheckpointSummaryMessage, permanentPrefixEnd } from "./agent-context.mjs";
import { parseAnthropicResponse, parseCodexResponse } from "./agent-stream-parsers.mjs";
import { anthropicSystemPrompt, toAnthropicMessages, codexInstructions, toCodexResponsesInput } from "./agent-message-formats.mjs";

// handoff-transcript item2: Cursor 的做法——压缩是有损的，把完整对话写成文件，摘要里给出路径，模型缺细节时自己去搜。
function transcriptTextOf(message) {
  const text = typeof message?.content === "string" ? message.content : contextTextOf(message?.content);
  const lines = [message?.role === "tool" ? `### tool result (${message.tool_call_id ?? "?"})` : `### ${message?.role ?? "message"}`];
  if (text) lines.push(text);
  for (const call of Array.isArray(message?.tool_calls) ? message.tool_calls : []) {
    const args = call?.function?.arguments;
    lines.push(`[tool call ${call?.id ?? "?"}] ${call?.function?.name ?? "?"} ${typeof args === "string" ? args : JSON.stringify(args ?? {})}`);
  }
  return lines.join("\n");
}
function renderHistoryTranscript(history, turnMessages, summaryCount) {
  const parts = [`# Conversation transcript (written at context compaction #${summaryCount}, ${(/* @__PURE__ */ new Date()).toISOString()})`, "Earlier turns first; the current turn's compacted messages are at the end."];
  let turn = 0;
  for (const item of Array.isArray(history) ? history : []) {
    if (!item || typeof item !== "object") continue;
    if (item.role === "user") {
      turn += 1;
      parts.push(`## Turn ${turn}`);
      parts.push(transcriptTextOf({ role: "user", content: typeof item.replayUser === "string" && item.replayUser ? item.replayUser : item.content }));
      continue;
    }
    if (Array.isArray(item.replay) && item.replay.length) {
      for (const message of item.replay) if (message?.role !== "user") parts.push(transcriptTextOf(message));
      if (typeof item.content === "string" && item.content.trim() && !item.replay.some((message) => message?.role === "assistant" && message.content === item.content)) parts.push(transcriptTextOf({ role: "assistant", content: item.content }));
    } else {
      parts.push(transcriptTextOf(item));
    }
  }
  if (turnMessages.length) {
    parts.push("## Current turn (compacted part)");
    for (const message of turnMessages) parts.push(transcriptTextOf(message));
  }
  return `${parts.join("\n\n")}\n`;
}

function createContextCompactor(env, deps) {
  const { input2, fetchImpl, emitTrace, availableToolNames, toolDefinitionTokens, codex, anthropic, deepSeek, anthropicMaxOutputTokens, responsesReasoningEffort, codexServiceTier, maxOutputTokens, calibrated, usableContextWindow, keepRecentContextTokens } = env;
  const { requestModelStream, requestChatCompletion, contextHistoryHash, summarizeEvictedHistory } = deps;
  const cs = { contextHistoryIndex: /* @__PURE__ */ new WeakMap(), pendingEvictedHistory: [], fullHistoryForContext: void 0, turnUserMessage: void 0, baseSystemContent: void 0, compactionSummary: "", compactionCount: 0, coveredHistory: 0, measuredContext: void 0, transcript: void 0, compactedTurnMessages: [], runtimeContext: "" };
  // dsh-context-align item2: 系统提示保持不变（前缀缓存）；压缩摘要作为一条用户消息，放在系统提示和常驻工作区指令之后（dsh frameSummary）。
  const applyContextCheckpoint = () => {
    if (typeof cs.baseSystemContent !== "string" || env.messages[0]?.role !== "system") return;
    env.messages[0].content = cs.baseSystemContent;
    const existing = env.messages.findIndex((message, index) => index > 0 && isCheckpointSummaryMessage(message));
    if (!cs.compactionSummary) {
      if (existing > 0) env.messages.splice(existing, 1);
      return;
    }
    const recallHint = availableToolNames.has("bridge_memory_recall") ? "\n\n(Exact earlier details may also be recoverable with bridge_memory_recall / bridge_memory_search.)" : "";
    const pinned = cs.turnUserMessage && !env.messages.includes(cs.turnUserMessage) && !input2.compactOnly ? `\n\nCurrent user request (verbatim, it was folded into the checkpoint):\n${contextClip(contextTextOf(cs.turnUserMessage.content), 64e3)}` : "";
    const transcriptHint = cs.transcript?.path ? `\n\nThe summary above is lossy. The full transcript of the conversation up to this checkpoint (user messages, answers, tool calls and tool results) is stored at: ${cs.transcript.path}. If you need an exact detail the summary lacks, ${cs.transcript.inWorkspace && availableToolNames.has("read_files") ? availableToolNames.has("run_command") ? "search it with run_command (grep -n) and read the relevant lines with read_files" : "read the relevant lines with read_files" : availableToolNames.has("run_command") ? "search it with run_command (grep -n / sed -n)" : "re-check the source instead of guessing"} rather than guessing.` : "";
    // runtime-context item A: 被压缩掉的那份运行时上下文随摘要一起保留（未变化时本轮用户消息里不会再带）
    const runtimeHint = cs.runtimeContext ? `\n\n${cs.runtimeContext}` : "";
    const content = `${dshFrameSummary(cs.compactionSummary)}${transcriptHint}${recallHint}${pinned}${runtimeHint}`;
    if (existing > 0) {
      env.messages[existing].content = content;
      return;
    }
    env.messages.splice(permanentPrefixEnd(env.messages), 0, { role: "user", content });
  };
  const contextCheckpointResult = () => cs.compactionSummary && cs.fullHistoryForContext && cs.coveredHistory > 0 ? {
    contextCheckpoint: {
      summary: cs.compactionSummary,
      covered: cs.coveredHistory,
      hash: contextHistoryHash(cs.fullHistoryForContext.slice(0, cs.coveredHistory)),
      count: cs.compactionCount,
      ...cs.transcript?.path ? { transcript: cs.transcript.path, transcriptInWorkspace: cs.transcript.inWorkspace } : {}
    }
  } : {};
  const currentContextTokens = () => {
    if (cs.measuredContext && cs.measuredContext.length <= env.messages.length) {
      return cs.measuredContext.tokens + calibrated(contextMessagesTokens(env.messages.slice(cs.measuredContext.length + 1)));
    }
    return calibrated(contextMessagesTokens(env.messages) + toolDefinitionTokens);
  };
  const requestPlainCompletion = async (plainMessages, options = {}) => {
    const withTools = options.tools === true;
    const requestStartedAt = Date.now();
    const headers2 = buildAgentRequestHeaders({ input2, codex, anthropic });
    const noop = () => void 0;
    let completion2;
    if (anthropic) {
      const system = anthropicSystemPrompt(plainMessages);
      completion2 = await requestModelStream(env.endpoint, headers2, JSON.stringify({
        model: input2.model,
        messages: toAnthropicMessages(plainMessages),
        ...system ? { system } : {},
        ...withTools && env.anthropicTools?.length ? { tools: env.anthropicTools } : {},
        max_tokens: Math.min(anthropicMaxOutputTokens, 16384),
        stream: true
      }), input2, fetchImpl, (response, timers) => parseAnthropicResponse(response, timers, noop, noop), "Anthropic Messages (context compaction)");
    } else if (env.responses) {
      completion2 = await requestModelStream(env.endpoint, headers2, JSON.stringify({
        model: input2.model,
        instructions: codexInstructions(plainMessages),
        input: toCodexResponsesInput(plainMessages),
        ...withTools && env.codexTools?.length ? { tools: env.codexTools } : {},
        store: false,
        stream: true,
        ...responsesReasoningEffort ? { reasoning: { effort: "low" } } : {},
        ...codexServiceTier ? { service_tier: codexServiceTier } : {}
      }), input2, fetchImpl, (response, timers) => parseCodexResponse(response, timers, noop, noop, codex), "OpenAI Responses (context compaction)");
    } else {
      // chat-gaps item6: 摘要请求同样要 usage（stream_options），提供商拒收时去掉重试并按路由记住（与主请求共用记录）
      const usageRouteKey = `${env.endpoint}\n${input2.model}`;
      const chatBody = (includeUsage) => JSON.stringify({
        model: input2.model,
        messages: plainMessages,
        // dsh-context-align item2: 走缓存的摘要请求与主请求同样的 thinking 设置和工具定义，保证前缀一致
        ...deepSeek ? { thinking: { type: withTools && env.deepSeekThinking ? "enabled" : "disabled" }, max_tokens: Math.min(withTools && env.deepSeekThinking ? 32768 : 8192, Math.max(1024, maxOutputTokens)) } : {},
        ...withTools && env.tools?.length ? { tools: env.tools } : {},
        stream: true,
        ...includeUsage ? { stream_options: { include_usage: true } } : {}
      });
      const usageAllowed = !deps.streamUsageUnsupportedRoutes?.has(usageRouteKey);
      try {
        completion2 = await requestChatCompletion(env.endpoint, headers2, chatBody(usageAllowed), input2, fetchImpl, noop, noop);
      } catch (error2) {
        if (!usageAllowed || input2.signal?.aborted || !deps.isStreamUsageOptionRejected?.(error2)) throw error2;
        deps.streamUsageUnsupportedRoutes?.add(usageRouteKey);
        completion2 = await requestChatCompletion(env.endpoint, headers2, chatBody(false), input2, fetchImpl, noop, noop);
      }
    }
    // chat-gaps item6: 摘要请求也报用量（标记 compaction，扩展不拿它更新上下文圆环，但计入本轮花费）
    if (completion2?.usage) {
      const u = completion2.usage;
      console.error(`[context-compaction] usage prompt=${u.input + u.cacheRead + u.cacheWrite} cached=${u.cacheRead} output=${u.output} tools=${withTools}`);
      emitTrace({ type: "usage", step: options.step ?? 0, data: { model: input2.model, compaction: true, usage: u, llmMs: Date.now() - requestStartedAt } });
    }
    const content = completion2?.message?.content;
    return typeof content === "string" ? content.trim() : contextTextOf(content).trim();
  };
  const compactContext = async (reason, options = {}) => {
    const before = currentContextTokens() + contextMessagesTokens(cs.pendingEvictedHistory);
    const aggressiveLevel = options.aggressive === true ? 1 : Number.isInteger(options.aggressive) ? options.aggressive : 0;
    // OpenCode context-compaction-dsh PART B: 调用方给了 retain（自动压缩 = dsh retain，溢出 = 0）就按它保留尾部
    const keepBase = Number.isInteger(options.retain) && options.retain >= 0 ? options.retain : keepRecentContextTokens();
    const keep = aggressiveLevel >= 2 ? Math.floor(keepBase / 4) : aggressiveLevel ? Math.floor(keepBase / 2) : keepBase;
    // dsh-context-align item3: 系统提示和常驻工作区指令（下标 < prefixEnd）不参与压缩
    const prefixEnd = permanentPrefixEnd(env.messages);
    let cut = Number.isInteger(options.cutAt) ? Math.max(options.cutAt, prefixEnd) : -1;
    if (cut < 0) {
      let tail = 0;
      let assistantCut = -1;
      for (let index = env.messages.length - 1; index >= prefixEnd; index -= 1) {
        tail += contextMessageTokens(env.messages[index]);
        if (tail > keep) break;
        if (env.messages[index]?.role === "user" && !isCheckpointSummaryMessage(env.messages[index])) cut = index;
        else if (env.messages[index]?.role === "assistant") assistantCut = index;
      }
      if (cut < 0) cut = assistantCut;
      if (cut < 0) {
        for (let index = env.messages.length - 1; index >= prefixEnd + 1; index -= 1) {
          if (env.messages[index]?.role !== "tool") {
            cut = index;
            break;
          }
        }
      }
    }
    // 旧摘要消息（紧跟常驻前缀）始终并入本次压缩，避免只压缩被驱逐历史时丢掉旧摘要
    const regionEnd = Math.max(cut > prefixEnd ? cut : prefixEnd, isCheckpointSummaryMessage(env.messages[prefixEnd]) ? prefixEnd + 1 : prefixEnd);
    const region = env.messages.slice(prefixEnd, regionEnd);
    const head = [...cs.pendingEvictedHistory, ...region];
    if (head.length === 0) return void 0;
    emitTrace({ type: "context_compaction", step: options.step ?? 0, data: { phase: "start", reason, before, window: env.managedContextWindow } });
    let summary = "";
    let failed = false;
    let mode = "replay";
    // dsh-context-align item2: dsh 做法——原样重放 系统提示 + 常驻前缀 + 要压缩的那段消息（含旧摘要），最后追加 8 段式指令，复用主请求的前缀缓存。
    const instruction = options.focus ? `${DSH_COMPACTION_INSTRUCTION}\n- Additional focus requested by the user: ${options.focus}` : DSH_COMPACTION_INSTRUCTION;
    const evictedAsMessages = cs.pendingEvictedHistory.map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: typeof item.content === "string" ? item.content : contextTextOf(item.content) }));
    const priorSummary = region.length && isCheckpointSummaryMessage(region[0]) ? [region[0]] : [];
    const replayMessages = [...env.messages.slice(0, prefixEnd), ...priorSummary, ...evictedAsMessages, ...region.slice(priorSummary.length), { role: "user", content: instruction }];
    const replayTokens = calibrated(contextMessagesTokens(replayMessages) + toolDefinitionTokens);
    const replayBudget = Math.max(2048, usableContextWindow() - 8192);
    if (replayTokens <= replayBudget) {
      try {
        summary = dshUnframeSummary(await requestPlainCompletion(replayMessages, { tools: true, step: options.step }));
      } catch (error2) {
        input2.signal?.throwIfAborted();
        console.error(`[agent-host] context compaction (replay) request failed: ${error2 instanceof Error ? error2.message.slice(0, 300) : String(error2)}`);
      }
    }
    if (!summary) {
      // 回退：对话太长无法原样重放（或重放请求失败）时，按旧做法把这段对话序列化成文字再摘要
      mode = "transcript";
      const previousSummary = region.some(isCheckpointSummaryMessage) ? cs.compactionSummary : "";
      const transcriptHead = head.filter((item) => !isCheckpointSummaryMessage(item));
      let lines = serializeForCompaction(transcriptHead, 2e3, 6e3);
      const promptBudget = Math.max(2048, Math.floor(usableContextWindow() * 0.7) - calibrated(estimatedTokens(previousSummary)) - 2048);
      if (calibrated(estimatedTokens(lines.join("\n\n"))) > promptBudget) lines = serializeForCompaction(transcriptHead, 500, 2e3);
      let omitted = false;
      while (lines.length > 1 && calibrated(estimatedTokens(lines.join("\n\n"))) > promptBudget) {
        lines.splice(0, Math.max(1, Math.floor(lines.length * 0.15)));
        omitted = true;
      }
      const transcript = `${omitted ? "[The oldest part of the conversation was too long to include and is omitted.]\n\n" : ""}${lines.join("\n\n")}`;
      try {
        summary = dshUnframeSummary(await requestPlainCompletion([
          { role: "system", content: CONTEXT_COMPACTION_SYSTEM },
          { role: "user", content: contextCompactionPrompt(previousSummary, transcript, options.focus) }
        ]));
      } catch (error2) {
        input2.signal?.throwIfAborted();
        console.error(`[agent-host] context compaction request failed: ${error2 instanceof Error ? error2.message.slice(0, 300) : String(error2)}`);
      }
    }
    if (!summary) {
      failed = true;
      mode = "digest";
      const digest = summarizeEvictedHistory(head.filter((item) => item.role !== "tool" && !isCheckpointSummaryMessage(item)), availableToolNames, { budgetChars: Math.floor(usableContextWindow() * 0.08 * 3) });
      summary = [cs.compactionSummary, digest].filter(Boolean).join("\n\n") || "(earlier conversation omitted)";
    }
    let maxHistoryIndex = -1;
    for (const item of head) {
      const historyIndex = cs.contextHistoryIndex.get(item);
      if (historyIndex !== void 0 && historyIndex > maxHistoryIndex) maxHistoryIndex = historyIndex;
    }
    const turnIndex = cs.turnUserMessage ? env.messages.indexOf(cs.turnUserMessage) : -1;
    if (cs.fullHistoryForContext && (head.includes(cs.turnUserMessage) || turnIndex >= prefixEnd && turnIndex < regionEnd)) cs.coveredHistory = cs.fullHistoryForContext.length;
    else if (maxHistoryIndex >= 0) cs.coveredHistory = Math.max(cs.coveredHistory, maxHistoryIndex + 1);
    for (const message of region) if (!isCheckpointSummaryMessage(message) && !cs.contextHistoryIndex.has(message)) cs.compactedTurnMessages.push(message);
    if (typeof deps.writeHistoryTranscript === "function") {
      try {
        const written = deps.writeHistoryTranscript(renderHistoryTranscript(cs.fullHistoryForContext, cs.compactedTurnMessages, cs.compactionCount + 1), input2.workspaceRoot);
        if (written?.path) cs.transcript = written;
      } catch (error2) {
        console.error(`[agent-host] could not write the conversation transcript: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }
    cs.pendingEvictedHistory.length = 0;
    if (regionEnd > prefixEnd) env.messages.splice(prefixEnd, regionEnd - prefixEnd);
    cs.compactionSummary = summary;
    cs.compactionCount += 1;
    cs.measuredContext = void 0;
    applyContextCheckpoint();
    const after = currentContextTokens();
    emitTrace({ type: "context_compaction", step: options.step ?? 0, data: { phase: "end", reason, before, after, window: env.managedContextWindow, count: cs.compactionCount, failed, mode, summaryChars: summary.length, ...cs.transcript?.path ? { transcript: cs.transcript.path } : {} } });
    return { before, after, failed };
  };
  return { state: cs, applyContextCheckpoint, contextCheckpointResult, currentContextTokens, requestPlainCompletion, compactContext };
}

export { createContextCompactor, renderHistoryTranscript };
