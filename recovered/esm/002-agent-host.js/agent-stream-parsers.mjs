// split-0029-step02: 从 module-0029 拆出的模型响应解析（SSE 流处理器、非流式解析、usage 归一化），三种协议共用。
// module-0029 原样 re-export 这些名字，对外接口不变。
import { redactModelEndpointForLog } from "./module-0030.mjs";

var ModelStreamTimeoutError = class extends Error {
  constructor(timeoutKind, timeoutMs, attempt) {
    super(`Model stream timed out waiting for ${timeoutKind.replace("_", " ")} after ${timeoutMs} ms.`);
    this.timeoutKind = timeoutKind;
    this.timeoutMs = timeoutMs;
    this.attempt = attempt;
    this.name = "ModelStreamTimeoutError";
  }
  timeoutKind;
  timeoutMs;
  attempt;
  code = "MODEL_STREAM_TIMEOUT";
  partialAnswer = "";
};
async function readResponseText(response, timers, markAsToken) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (markAsToken) timers.markFirstToken();
      else timers.markActivity();
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } finally {
    reader.releaseLock();
  }
}
function looksLikeEventStream(raw) {
  return /(^|\r?\n)[ \t]*data[ \t]*:/.test(raw);
}
function usageNumber(value) {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : void 0;
}
const promptUsageKeysSeen = /* @__PURE__ */ new Set();
function notePromptUsageKeys(raw) {
  try {
    const details = raw.prompt_tokens_details ?? raw.input_tokens_details;
    const keys = [...Object.keys(raw), ...details && typeof details === "object" ? Object.keys(details).map((k) => `details.${k}`) : []].sort().join(",");
    if (promptUsageKeysSeen.has(keys) || promptUsageKeysSeen.size > 32) return;
    promptUsageKeysSeen.add(keys);
    const hasCache = /prompt_cache_hit_tokens|cached_tokens|cache_read_input_tokens/.test(keys);
    console.error(`[prompt-cache] provider usage keys=${keys} cacheField=${hasCache ? "yes" : "NO (provider does not report cache hits)"}`);
  } catch { }
}
function normalizeModelUsage(raw, kind) {
  if (!raw || typeof raw !== "object") return void 0;
  notePromptUsageKeys(raw);
  let input;
  let cacheRead;
  let cacheWrite;
  let output;
  let reasoning;
  if (kind === "anthropic") {
    input = usageNumber(raw.input_tokens);
    cacheRead = usageNumber(raw.cache_read_input_tokens);
    cacheWrite = usageNumber(raw.cache_creation_input_tokens);
    output = usageNumber(raw.output_tokens);
  } else {
    const prompt = usageNumber(raw.prompt_tokens ?? raw.input_tokens);
    output = usageNumber(raw.completion_tokens ?? raw.output_tokens);
    const promptDetails = raw.prompt_tokens_details ?? raw.input_tokens_details;
    const outputDetails = raw.completion_tokens_details ?? raw.output_tokens_details;
    const hit = usageNumber(raw.prompt_cache_hit_tokens);
    const miss = usageNumber(raw.prompt_cache_miss_tokens);
    cacheRead = hit ?? usageNumber(promptDetails?.cached_tokens) ?? usageNumber(raw.cache_read_input_tokens);
    cacheWrite = usageNumber(promptDetails?.cache_creation_tokens) ?? usageNumber(promptDetails?.cache_write_tokens) ?? usageNumber(raw.cache_creation_input_tokens);
    if (hit !== void 0 && miss !== void 0) input = miss;
    else if (prompt !== void 0) input = Math.max(0, prompt - (cacheRead ?? 0) - (cacheWrite ?? 0));
    reasoning = usageNumber(outputDetails?.reasoning_tokens);
  }
  if (input === void 0 && output === void 0 && cacheRead === void 0 && cacheWrite === void 0) return void 0;
  const usage = { input: input ?? 0, cacheRead: cacheRead ?? 0, cacheWrite: cacheWrite ?? 0, output: output ?? 0 };
  if (reasoning !== void 0) usage.reasoning = reasoning;
  usage.total = usage.input + usage.cacheRead + usage.cacheWrite + usage.output;
  return usage;
}
function mergeUsageRecord(target, source) {
  if (!source || typeof source !== "object") return target;
  const next = { ...target ?? {} };
  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === void 0) continue;
    if (typeof value === "number" && value === 0 && typeof next[key] === "number" && next[key] > 0) continue;
    next[key] = value;
  }
  return next;
}
function createChatEventStreamProcessor(timers, onContentDelta, onReasoningDelta) {
  const toolCalls = /* @__PURE__ */ new Map();
  let buffer = "";
  let content = "";
  let reasoningContent = "";
  let finishReason;
  let emittedContent = false;
  let done = false;
  let usage;
  const processEvent = (event) => {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n").trim();
    if (!data) return false;
    if (data === "[DONE]") {
      done = true;
      return true;
    }
    timers.markFirstToken();
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error(`Model stream returned invalid JSON: ${data.slice(0, 1e3)}`);
    }
    if (payload?.error) throw new Error(String(payload.error?.message ?? payload.error));
    if (payload?.usage && typeof payload.usage === "object") usage = normalizeModelUsage(payload.usage, "openai") ?? usage;
    for (const choice of Array.isArray(payload?.choices) ? payload.choices : []) {
      const delta = choice?.delta ?? choice?.message;
      if (!delta) continue;
      if (choice?.finish_reason !== void 0 && choice.finish_reason !== null) finishReason = choice.finish_reason;
      const reasoning = typeof delta.reasoning_content === "string" ? delta.reasoning_content : typeof delta.reasoning === "string" ? delta.reasoning : "";
      if (reasoning) {
        reasoningContent += reasoning;
        onReasoningDelta(reasoning);
      }
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        emittedContent = true;
        onContentDelta(delta.content);
      }
      for (const [fallbackIndex, call] of (Array.isArray(delta.tool_calls) ? delta.tool_calls : []).entries()) {
        const index = Number.isInteger(call?.index) ? Number(call.index) : fallbackIndex;
        const current = toolCalls.get(index) ?? { name: "", arguments: "" };
        // dsh-metrics-20261119 (AH): tool-call delta counts toward TTFT (hook set by module-0029 on onContentDelta).
        if (typeof call?.function?.name === "string" && call.function.name || typeof call?.function?.arguments === "string" && call.function.arguments) onContentDelta?.onToolCallDelta?.();
        if (typeof call?.id === "string" && call.id) current.id = call.id;
        if (typeof call?.function?.name === "string" && call.function.name) {
          if (!current.name) {
            current.name = call.function.name;
          } else if (current.name.endsWith(call.function.name)) {
          } else if (call.function.name.startsWith(current.name)) {
            current.name = call.function.name;
          } else {
            current.name += call.function.name;
          }
        }
        if (typeof call?.function?.arguments === "string" && call.function.arguments) {
          if (call.function.arguments.length > current.arguments.length && call.function.arguments.startsWith(current.arguments)) {
            current.arguments = call.function.arguments;
          } else if (call.function.arguments !== current.arguments) {
            current.arguments += call.function.arguments;
          }
        }
        toolCalls.set(index, current);
      }
    }
    return false;
  };
  return {
    get done() {
      return done;
    },
    get partialContent() {
      return content;
    },
    append(chunk) {
      buffer += chunk;
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) {
        if (processEvent(event)) break;
      }
    },
    flush() {
      if (buffer.trim()) processEvent(buffer);
      buffer = "";
    },
    result() {
      const completedToolCalls = [...toolCalls.entries()].sort((a, b) => a[0] - b[0]).filter(([, call]) => call.name).map(([index, call]) => ({
        id: call.id ?? `tool-${Date.now()}-${index}`,
        type: "function",
        function: { name: call.name, arguments: call.arguments || "{}" }
      }));
      return {
        message: {
          role: "assistant",
          content: content || null,
          ...reasoningContent ? { reasoning_content: reasoningContent } : {},
          ...completedToolCalls.length ? { tool_calls: completedToolCalls } : {}
        },
        finishReason,
        emittedContent,
        ...usage ? { usage } : {}
      };
    }
  };
}
async function parseChatCompletionResponse(response, endpoint, timers, onContentDelta, onReasoningDelta) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/event-stream")) {
    const raw = await readResponseText(response, timers, true);
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      if (looksLikeEventStream(raw)) {
        const processor2 = createChatEventStreamProcessor(timers, onContentDelta, onReasoningDelta);
        processor2.append(raw);
        processor2.flush();
        return processor2.result();
      }
      const redirect = response.url && response.url !== endpoint ? ` redirected=${redactModelEndpointForLog(response.url)}` : "";
      console.warn(`[model-endpoint] Chat Completions non-JSON endpoint=${redactModelEndpointForLog(endpoint)}${redirect} status=${response.status} content-type=${contentType.slice(0, 120) || "(none)"}`);
      throw new Error(`Model endpoint returned non-JSON (${response.status}). Check the API Base URL and protocol in provider settings; the response body was not displayed.`);
    }
    if (payload?.error) throw new Error(String(payload.error?.message ?? payload.error));
    const choice = payload?.choices?.[0];
    const message = choice?.message;
    if (!message) throw new Error("Invalid Chat Completions response: missing message. Check the API Base URL and protocol in provider settings.");
    const content = typeof message.content === "string" ? message.content : "";
    if (content) onContentDelta(content);
    const usage = normalizeModelUsage(payload?.usage, "openai");
    return { message, finishReason: choice?.finish_reason, emittedContent: Boolean(content), ...usage ? { usage } : {} };
  }
  if (!response.body) throw new Error("Model endpoint returned an empty event stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const processor = createChatEventStreamProcessor(timers, onContentDelta, onReasoningDelta);
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      timers.markActivity();
      processor.append(decoder.decode(chunk.value, { stream: true }));
      if (processor.done) break;
    }
    processor.append(decoder.decode());
    processor.flush();
  } catch (error2) {
    const normalized = timers.normalizeError(error2);
    if (normalized instanceof ModelStreamTimeoutError) normalized.partialAnswer = processor.partialContent;
    throw normalized;
  } finally {
    reader.releaseLock();
  }
  return processor.result();
}
function codexOutputSnapshot(payload) {
  const content = [];
  const toolCalls = [];
  const response = payload?.response ?? payload;
  for (const item of Array.isArray(response?.output) ? response.output : []) {
    if (item?.type === "message") {
      for (const part of Array.isArray(item.content) ? item.content : []) {
        if (part?.type === "output_text" && typeof part.text === "string") content.push(part.text);
        if (part?.type === "refusal" && typeof part.refusal === "string") content.push(part.refusal);
      }
    }
    if (item?.type === "function_call" && typeof item.name === "string") {
      toolCalls.push({
        id: typeof item.call_id === "string" ? item.call_id : typeof item.id === "string" ? item.id : void 0,
        function: {
          name: item.name,
          arguments: typeof item.arguments === "string" ? item.arguments : JSON.stringify(item.arguments ?? {})
        }
      });
    }
  }
  if (content.length === 0 && typeof response?.output_text === "string") content.push(response.output_text);
  return { content: content.join(""), toolCalls };
}
function createCodexEventStreamProcessor(timers, onContentDelta, onReasoningDelta, requireCompletedEvent) {
  const toolCalls = /* @__PURE__ */ new Map();
  let buffer = "";
  let content = "";
  let emittedContent = false;
  let finishReason;
  let usage;
  const mergeToolCall = (item, fallbackKey) => {
    if (!item || item.type !== "function_call") return;
    const existingKeyForCallId = typeof item.call_id === "string" ? [...toolCalls.entries()].find(([, call]) => call.id === item.call_id)?.[0] : void 0;
    const key = typeof item.id === "string" ? item.id : existingKeyForCallId ?? (typeof item.call_id === "string" ? item.call_id : fallbackKey);
    const current = toolCalls.get(key) ?? { arguments: "" };
    if (typeof item.call_id === "string") current.id = item.call_id;
    if (typeof item.name === "string") current.name = item.name;
    if (typeof item.arguments === "string") current.arguments = item.arguments;
    toolCalls.set(key, current);
  };
  const processPayload = (payload) => {
    if (payload?.error || payload?.type === "error") {
      throw new Error(String(payload?.error?.message ?? payload?.message ?? payload?.error ?? "Codex Responses stream error."));
    }
    const type = typeof payload?.type === "string" ? payload.type : "";
    if (type === "response.output_text.delta" && typeof payload.delta === "string" && payload.delta) {
      content += payload.delta;
      emittedContent = true;
      onContentDelta(payload.delta);
      return;
    }
    if ((type === "response.reasoning_text.delta" || type === "response.reasoning_summary_text.delta") && typeof payload.delta === "string" && payload.delta) {
      onReasoningDelta(payload.delta);
      return;
    }
    if (type === "response.output_item.added" || type === "response.output_item.done") {
      mergeToolCall(payload.item, `item-${payload.output_index ?? toolCalls.size}`);
      return;
    }
    if (type === "response.function_call_arguments.delta") {
      const key = typeof payload.item_id === "string" ? payload.item_id : `item-${payload.output_index ?? 0}`;
      const current = toolCalls.get(key) ?? { arguments: "" };
      // dsh-metrics-20261119 (AH): tool-call delta counts toward TTFT (hook set by module-0029 on onContentDelta).
      if (typeof payload.delta === "string" && payload.delta) onContentDelta?.onToolCallDelta?.();
      if (typeof payload.delta === "string") current.arguments += payload.delta;
      toolCalls.set(key, current);
      return;
    }
    if (type === "response.completed" || type === "response.failed" || type === "response.incomplete") {
      const responsePayload = payload.response ?? payload;
      finishReason = responsePayload?.status ?? type;
      usage = normalizeModelUsage(responsePayload?.usage, "openai") ?? usage;
      if (type === "response.failed" || responsePayload?.status === "failed") {
        throw new Error(String(responsePayload?.error?.message ?? "Codex Responses request failed."));
      }
      if (type === "response.incomplete" || responsePayload?.status === "incomplete") {
        const reason = responsePayload?.incomplete_details?.reason;
        throw new Error(`Codex Responses request incomplete${typeof reason === "string" ? `: ${reason}` : "."}`);
      }
      const snapshot = codexOutputSnapshot(responsePayload);
      if (!emittedContent && snapshot.content) {
        content = snapshot.content;
        emittedContent = true;
        onContentDelta(snapshot.content);
      }
      snapshot.toolCalls.forEach((call, index) => mergeToolCall({
        type: "function_call",
        call_id: call.id,
        name: call.function?.name,
        arguments: call.function?.arguments
      }, `snapshot-${index}`));
    }
  };
  const processEvent = (event) => {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n").trim();
    if (!data || data === "[DONE]") return;
    timers.markFirstToken();
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error(`Codex Responses stream returned invalid JSON: ${data.slice(0, 1e3)}`);
    }
    processPayload(payload);
  };
  return {
    get completed() {
      return finishReason === "completed";
    },
    get partialContent() {
      return content;
    },
    append(chunk) {
      buffer += chunk;
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) processEvent(event);
    },
    flush() {
      if (buffer.trim()) processEvent(buffer);
      buffer = "";
    },
    result() {
      if (requireCompletedEvent && finishReason !== "completed") {
        throw new Error("Codex Responses stream closed before response.completed.");
      }
      const completedToolCalls = [...toolCalls.entries()].filter(([, call]) => call.name).map(([key, call]) => ({
        id: call.id ?? key,
        type: "function",
        function: { name: call.name, arguments: call.arguments || "{}" }
      }));
      return {
        message: {
          role: "assistant",
          content: content || null,
          ...completedToolCalls.length ? { tool_calls: completedToolCalls } : {}
        },
        finishReason,
        emittedContent,
        ...usage ? { usage } : {}
      };
    }
  };
}
async function parseCodexResponse(response, timers, onContentDelta, onReasoningDelta, requireCompletedEvent) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/event-stream")) {
    const raw = await readResponseText(response, timers, true);
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      if (looksLikeEventStream(raw)) {
        const processor2 = createCodexEventStreamProcessor(timers, onContentDelta, onReasoningDelta, requireCompletedEvent);
        processor2.append(raw);
        processor2.flush();
        return processor2.result();
      }
      throw new Error(`Codex Responses endpoint returned non-JSON (${response.status}). Check the API Base URL and protocol in provider settings; the response body was not displayed.`);
    }
    if (payload?.error || payload?.status === "failed") {
      throw new Error(String(payload?.error?.message ?? payload?.error ?? "Codex Responses request failed."));
    }
    if (payload?.status === "incomplete") {
      const reason = payload?.incomplete_details?.reason;
      throw new Error(`Codex Responses request incomplete${typeof reason === "string" ? `: ${reason}` : "."}`);
    }
    const snapshot = codexOutputSnapshot(payload);
    if (snapshot.content) onContentDelta(snapshot.content);
    const usage = normalizeModelUsage(payload?.usage, "openai");
    return {
      message: {
        role: "assistant",
        content: snapshot.content || null,
        ...snapshot.toolCalls.length ? { tool_calls: snapshot.toolCalls.map((call) => ({ ...call, type: "function" })) } : {}
      },
      finishReason: payload?.status,
      emittedContent: Boolean(snapshot.content),
      ...usage ? { usage } : {}
    };
  }
  if (!response.body) throw new Error("Codex Responses endpoint returned an empty event stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const processor = createCodexEventStreamProcessor(timers, onContentDelta, onReasoningDelta, requireCompletedEvent);
  try {
    while (true) {
      let chunk;
      try {
        chunk = await reader.read();
      } catch (error2) {
        const normalized = timers.normalizeError(error2);
        if (!requireCompletedEvent || timers.signal.aborted || normalized instanceof ModelStreamTimeoutError) throw normalized;
        throw new Error(`Codex Responses stream disconnected before response.completed: ${normalized.message}. Check the selected proxy and network route; no direct fallback was attempted.`, { cause: normalized });
      }
      if (chunk.done) break;
      timers.markActivity();
      processor.append(decoder.decode(chunk.value, { stream: true }));
      if (processor.completed) break;
    }
    processor.append(decoder.decode());
    processor.flush();
  } catch (error2) {
    const normalized = timers.normalizeError(error2);
    if (normalized instanceof ModelStreamTimeoutError) normalized.partialAnswer = processor.partialContent;
    throw normalized;
  } finally {
    if (processor.completed) await reader.cancel().catch(() => void 0);
    reader.releaseLock();
  }
  return processor.result();
}
function anthropicStopReason(reason) {
  if (reason === "tool_use") return "tool_calls";
  if (reason === "max_tokens") return "length";
  if (reason === "refusal") return "content_filter";
  return "stop";
}
function anthropicMessageSnapshot(payload) {
  const content = [];
  const toolCalls = [];
  const thinking = [];
  for (const block of Array.isArray(payload?.content) ? payload.content : []) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "text" && typeof block.text === "string" && block.text) {
      content.push(block.text);
    } else if (block.type === "thinking") {
      thinking.push({
        thinking: typeof block.thinking === "string" ? block.thinking : "",
        signature: typeof block.signature === "string" ? block.signature : ""
      });
    } else if (block.type === "tool_use" && typeof block.name === "string" && block.name) {
      toolCalls.push({
        id: typeof block.id === "string" && block.id ? block.id : `anthropic-tool-${toolCalls.length}`,
        type: "function",
        function: { name: block.name, arguments: JSON.stringify(block.input ?? {}) }
      });
    }
  }
  return {
    content: content.join("\n"),
    toolCalls,
    thinking,
    stopReason: typeof payload?.stop_reason === "string" ? payload.stop_reason : void 0
  };
}
function createAnthropicEventStreamProcessor(timers, onContentDelta, onReasoningDelta) {
  const toolCalls = /* @__PURE__ */ new Map();
  const thinkingBlocks = /* @__PURE__ */ new Map();
  let buffer = "";
  let content = "";
  let emittedContent = false;
  let finishReason;
  let usageRecord;
  const processPayload = (payload) => {
    if (payload?.type === "error" || payload?.error) {
      throw new Error(String(payload?.error?.message ?? payload?.message ?? payload?.error ?? "Anthropic Messages stream error."));
    }
    const type = typeof payload?.type === "string" ? payload.type : "";
    if (type === "message_start") {
      usageRecord = mergeUsageRecord(usageRecord, payload.message?.usage);
      return;
    }
    if (type === "content_block_start") {
      const block = payload.content_block;
      if (block?.type === "tool_use") {
        // dsh-metrics-20261119 (AH): tool-call delta counts toward TTFT (hook set by module-0029 on onContentDelta).
        if (typeof block.name === "string" && block.name) onContentDelta?.onToolCallDelta?.();
        toolCalls.set(payload.index, {
          id: typeof block.id === "string" ? block.id : void 0,
          name: typeof block.name === "string" ? block.name : void 0,
          arguments: ""
        });
      } else if (block?.type === "thinking") {
        thinkingBlocks.set(payload.index, { thinking: "", signature: "" });
      }
      return;
    }
    if (type === "content_block_delta") {
      const delta = payload.delta;
      if (delta?.type === "text_delta" && typeof delta.text === "string" && delta.text) {
        content += delta.text;
        emittedContent = true;
        onContentDelta(delta.text);
        return;
      }
      if (delta?.type === "thinking_delta" && typeof delta.thinking === "string" && delta.thinking) {
        const current = thinkingBlocks.get(payload.index) ?? { thinking: "", signature: "" };
        current.thinking += delta.thinking;
        thinkingBlocks.set(payload.index, current);
        onReasoningDelta(delta.thinking);
        return;
      }
      if (delta?.type === "signature_delta" && typeof delta.signature === "string" && delta.signature) {
        const current = thinkingBlocks.get(payload.index) ?? { thinking: "", signature: "" };
        current.signature += delta.signature;
        thinkingBlocks.set(payload.index, current);
        return;
      }
      if (delta?.type === "input_json_delta" && typeof delta.partial_json === "string" && delta.partial_json) {
        onContentDelta?.onToolCallDelta?.();
        const current = toolCalls.get(payload.index) ?? { arguments: "" };
        current.arguments += delta.partial_json;
        toolCalls.set(payload.index, current);
      }
      return;
    }
    if (type === "message_delta") {
      usageRecord = mergeUsageRecord(usageRecord, payload.usage);
      if (typeof payload.delta?.stop_reason === "string" && payload.delta.stop_reason) {
        finishReason = anthropicStopReason(payload.delta.stop_reason);
      }
      return;
    }
  };
  const processEvent = (event) => {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n").trim();
    if (!data || data === "[DONE]") return;
    timers.markFirstToken();
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error(`Anthropic Messages stream returned invalid JSON: ${data.slice(0, 1e3)}`);
    }
    processPayload(payload);
  };
  return {
    get partialContent() {
      return content;
    },
    append(chunk) {
      buffer += chunk;
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) processEvent(event);
    },
    flush() {
      if (buffer.trim()) processEvent(buffer);
      buffer = "";
    },
    result() {
      const completedToolCalls = [...toolCalls.entries()].filter(([, call]) => call.name).map(([key, call]) => ({
        id: call.id ?? `anthropic-tool-${key}`,
        type: "function",
        function: { name: call.name, arguments: call.arguments || "{}" }
      }));
      const retainedThinking = [...thinkingBlocks.values()].filter((block) => block.thinking || block.signature);
      const usage = normalizeModelUsage(usageRecord, "anthropic");
      return {
        message: {
          role: "assistant",
          content: content || null,
          ...completedToolCalls.length ? { tool_calls: completedToolCalls } : {},
          ...retainedThinking.length ? { anthropic_thinking: retainedThinking } : {}
        },
        finishReason: finishReason ?? (completedToolCalls.length ? "tool_calls" : "stop"),
        emittedContent,
        ...usage ? { usage } : {}
      };
    }
  };
}
async function parseAnthropicResponse(response, timers, onContentDelta, onReasoningDelta) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/event-stream")) {
    const raw = await readResponseText(response, timers, true);
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      if (looksLikeEventStream(raw)) {
        const processor2 = createAnthropicEventStreamProcessor(timers, onContentDelta, onReasoningDelta);
        processor2.append(raw);
        processor2.flush();
        return processor2.result();
      }
      throw new Error(`Anthropic Messages endpoint returned non-JSON (${response.status}). Check the API Base URL and protocol in provider settings; the response body was not displayed.`);
    }
    if (payload?.type === "error" || payload?.error) {
      throw new Error(String(payload?.error?.message ?? payload?.error ?? "Anthropic Messages request failed."));
    }
    const snapshot = anthropicMessageSnapshot(payload);
    if (snapshot.content) onContentDelta(snapshot.content);
    const thinkingText = snapshot.thinking.map((block) => block.thinking).filter(Boolean).join("");
    if (thinkingText) onReasoningDelta(thinkingText);
    const usage = normalizeModelUsage(payload?.usage, "anthropic");
    return {
      message: {
        role: "assistant",
        content: snapshot.content || null,
        ...snapshot.toolCalls.length ? { tool_calls: snapshot.toolCalls } : {},
        ...snapshot.thinking.length ? { anthropic_thinking: snapshot.thinking } : {}
      },
      finishReason: snapshot.stopReason ? anthropicStopReason(snapshot.stopReason) : snapshot.toolCalls.length ? "tool_calls" : "stop",
      emittedContent: Boolean(snapshot.content),
      ...usage ? { usage } : {}
    };
  }
  if (!response.body) throw new Error("Anthropic Messages endpoint returned an empty event stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const processor = createAnthropicEventStreamProcessor(timers, onContentDelta, onReasoningDelta);
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      timers.markActivity();
      processor.append(decoder.decode(chunk.value, { stream: true }));
    }
    processor.append(decoder.decode());
    processor.flush();
  } catch (error2) {
    const normalized = timers.normalizeError(error2);
    if (normalized instanceof ModelStreamTimeoutError) normalized.partialAnswer = processor.partialContent;
    throw normalized;
  } finally {
    reader.releaseLock();
  }
  return processor.result();
}

export { ModelStreamTimeoutError, readResponseText, looksLikeEventStream, usageNumber, promptUsageKeysSeen, notePromptUsageKeys, normalizeModelUsage, mergeUsageRecord, createChatEventStreamProcessor, parseChatCompletionResponse, codexOutputSnapshot, createCodexEventStreamProcessor, parseCodexResponse, anthropicStopReason, anthropicMessageSnapshot, createAnthropicEventStreamProcessor, parseAnthropicResponse };
