// split-0029-step06: 从 runOpenAICompatibleAgent 拆出的「按协议构造请求」：请求头与三种协议的请求体（以及提示词工具模式的消息改写）。
// 参数 r 是调用方当时的状态快照（模型、消息、思考设置、工具定义等），函数本身无副作用。
import { ANTHROPIC_API_VERSION, textContent, toAnthropicMessages, anthropicSystemPrompt, codexInstructions, toCodexResponsesInput } from "./agent-message-formats.mjs";

function promptToolsInstruction(tools) {
  const decl = tools.map((tool) => `- ${tool.name}: ${(tool.description ?? "").replace(/\s+/g, " ").trim()}\n  parameters: ${JSON.stringify(tool.inputSchema ?? { type: "object", properties: {} })}`).join("\n");
  return [
    "TOOLS (this model is called without native function calling; the client executes tools for you):",
    "To call a tool, write a block exactly like:",
    '<tool_call>{"name":"<tool name>","arguments":{...}}</tool_call>',
    "Put every parameter inside \"arguments\". You may put several blocks in one reply for independent calls. Write the user-facing explanation before the blocks. Do not invent tool results: wait for the client's Tool result messages. When the task is done, answer without any block.",
    "The tool list below is the current one and replaces any earlier list.",
    "Available tools:",
    decl
  ].join("\n");
}
function toPromptToolMessages(messages, instruction) {
  const out = [];
  let injected = false;
  for (const m of messages) {
    if (m.role === "system" && !injected) {
      out.push({ role: "system", content: `${typeof m.content === "string" ? m.content : textContent(m.content)}\n\n${instruction}` });
      injected = true;
      continue;
    }
    if (m.role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length) {
      const blocks = m.tool_calls.map((c) => {
        let args = c?.function?.arguments ?? "{}";
        if (typeof args === "string") {
          try { args = JSON.parse(args); } catch { args = {}; }
        }
        return `<tool_call>${JSON.stringify({ name: c?.function?.name ?? "", arguments: args })}</tool_call>`;
      }).join("\n");
      const text = typeof m.content === "string" ? m.content : m.content ? textContent(m.content) : "";
      out.push({ role: "assistant", content: [text, blocks].filter(Boolean).join("\n\n") });
      continue;
    }
    if (m.role === "tool") {
      out.push({ role: "user", content: `Tool result (call ${m.tool_call_id ?? ""}):\n${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}` });
      continue;
    }
    const { reasoning_content, anthropic_thinking, ...rest } = m;
    out.push(rest);
  }
  if (!injected) out.unshift({ role: "system", content: instruction });
  return out;
}
function buildAgentRequestHeaders({ input2, codex, anthropic }) {
  const headers = { "content-type": "application/json", accept: "text/event-stream" };
  if (codex) {
    const auth = input2.codexAuth;
    headers.authorization = `Bearer ${auth.accessToken}`;
    headers["ChatGPT-Account-ID"] = auth.accountId;
    headers.originator = auth.originator;
    headers["User-Agent"] = auth.userAgent;
    headers["OpenAI-Beta"] = auth.betaHeader;
  } else if (anthropic) {
    if (input2.apiKey?.trim()) {
      headers["x-api-key"] = input2.apiKey.trim();
      headers.authorization = `Bearer ${input2.apiKey.trim()}`;
    }
    headers["anthropic-version"] = ANTHROPIC_API_VERSION;
  } else if (input2.apiKey?.trim()) {
    headers.authorization = `Bearer ${input2.apiKey.trim()}`;
  }
  return headers;
}
function buildChatRequestBody(r, includeUsage = false, includeCacheKey = false) {
  return r.promptToolMode ? {
    model: r.input2.model,
    messages: toPromptToolMessages(r.messages, promptToolsInstruction(r.availableTools)),
    ...r.deepSeek ? { thinking: { type: r.thinking }, max_tokens: Math.min(r.maxOutputTokens, r.availableOutputTokens) } : {},
    ...r.deepSeekReasoningEffort ? { reasoning_effort: r.deepSeekReasoningEffort } : {},
    ...r.genericReasoningEffort ? { reasoning_effort: r.genericReasoningEffort } : {},
    ...includeCacheKey && r.promptCacheKey ? { prompt_cache_key: r.promptCacheKey } : {},
    stream: true,
    ...includeUsage ? { stream_options: { include_usage: true } } : {}
  } : ({
    model: r.input2.model,
    messages: r.messages,
    ...r.deepSeek ? { thinking: { type: r.thinking }, max_tokens: Math.min(r.maxOutputTokens, r.availableOutputTokens) } : {},
    ...r.deepSeekReasoningEffort ? { reasoning_effort: r.deepSeekReasoningEffort } : {},
    ...r.genericReasoningEffort ? { reasoning_effort: r.genericReasoningEffort } : {},
    ...r.tools.length > 0 ? {
      tools: r.tools,
      ...!r.deepSeekThinking ? { tool_choice: "auto" } : {}
    } : {},
    ...includeCacheKey && r.promptCacheKey ? { prompt_cache_key: r.promptCacheKey } : {},
    stream: true,
    ...includeUsage ? { stream_options: { include_usage: true } } : {}
  });
}
function buildAnthropicRequestBody(r) {
  return {
    model: r.input2.model,
    messages: toAnthropicMessages(r.messages),
    // prompt-cache-step01: Anthropic 不会自动缓存，需在系统提示和工具末尾标 cache_control 断点。
    ...anthropicSystemPrompt(r.messages) ? { system: [{ type: "text", text: anthropicSystemPrompt(r.messages), cache_control: { type: "ephemeral" } }] } : {},
    max_tokens: r.anthropicMaxOutputTokens,
    ...r.anthropicThinkingEnabled ? { thinking: { type: "enabled", budget_tokens: r.anthropicThinkingBudget } } : {},
    ...r.anthropicTools.length > 0 ? { tools: r.anthropicTools.map((tool, index) => index === r.anthropicTools.length - 1 ? { ...tool, cache_control: { type: "ephemeral" } } : tool), tool_choice: { type: "auto" } } : {},
    stream: true
  };
}
function buildResponsesRequestBody(r) {
  return {
    model: r.input2.model,
    instructions: codexInstructions(r.messages),
    input: toCodexResponsesInput(r.messages),
    store: false,
    stream: true,
    ...r.responsesReasoningEffort ? { reasoning: { effort: r.responsesReasoningEffort } } : {},
    ...r.codexServiceTier ? { service_tier: r.codexServiceTier } : {},
    ...r.codexTools.length > 0 ? { tools: r.codexTools, tool_choice: "auto", parallel_tool_calls: true } : {}
  };
}

export { promptToolsInstruction, toPromptToolMessages, buildAgentRequestHeaders, buildChatRequestBody, buildAnthropicRequestBody, buildResponsesRequestBody };
