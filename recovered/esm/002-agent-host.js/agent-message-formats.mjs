// split-0029-step01: 从 module-0029（src/openai-agent.ts）拆出的模型协议消息格式转换（Chat Completions / Codex Responses / Anthropic Messages）。
// 纯函数，无运行时状态；module-0029 原样 re-export 这些名字，对外接口不变。
import { FILE_TOOL_DEFINITIONS } from "./module-0015.mjs";
import { normalizeOpenAIBaseUrl } from "./module-0030.mjs";

var CHAT_FILE_INPUT_SCHEMAS = new Map(FILE_TOOL_DEFINITIONS.map((tool) => [tool.name, tool.inputSchema]));

function chatFileToolInputSchema(name, fallback) {
  return CHAT_FILE_INPUT_SCHEMAS.get(name) ?? fallback;
}

var ANTHROPIC_API_VERSION = "2023-06-01";

var ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS = 8192;

var ANTHROPIC_MIN_THINKING_BUDGET_TOKENS = 1024;

var ANTHROPIC_EFFORT_THINKING_BUDGETS = {
  low: 2048,
  medium: 8192,
  high: 16384,
  xhigh: 24576,
  max: 32768,
  ultra: 32768
};

function normalizeChatCompletionsUrl(baseUrl) {
  return `${normalizeOpenAIBaseUrl(baseUrl)}/chat/completions`;
}

function isUnsupportedRouteError(error2) {
  const status = error2?.status;
  if (![404, 405, 501].includes(status)) return false;
  const code = String(error2?.code ?? "");
  const message = error2 instanceof Error ? error2.message : "";
  return !/(model[_ -]?(?:not[_ -]?found|invalid)|invalid[_ -]?model|authentication|api[_ -]?key|quota|rate[_ -]?limit)/i.test(`${code} ${message}`);
}

function normalizeResponsesUrl(baseUrl) {
  return `${normalizeOpenAIBaseUrl(baseUrl)}/responses`;
}

function normalizeAnthropicMessagesUrl(baseUrl) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) throw new Error("Base URL is required.");
  if (trimmed.endsWith("/messages")) return trimmed;
  if (trimmed.endsWith("/v1")) return `${trimmed}/messages`;
  return `${trimmed}/v1/messages`;
}

function textContent(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.map((part) => {
    if (!part || typeof part !== "object") return "";
    const row = part;
    return typeof row.text === "string" ? row.text : "";
  }).filter(Boolean).join("\n");
}

function codexInstructions(messages) {
  return messages.filter((message) => message.role === "system").map((message) => textContent(message.content)).filter(Boolean).join("\n\n");
}

function toCodexResponsesInput(messages) {
  const input2 = [];
  for (const message of messages) {
    const role = message.role;
    if (role === "system") continue;
    if (role === "tool") {
      if (typeof message.tool_call_id === "string") {
        input2.push({
          type: "function_call_output",
          call_id: message.tool_call_id,
          output: textContent(message.content)
        });
      }
      continue;
    }
    const content = [];
    const isAssistantMessage = role === "assistant";
    const textPartType = isAssistantMessage ? "output_text" : "input_text";
    if (typeof message.content === "string") {
      if (message.content) content.push({ type: textPartType, text: message.content });
    } else if (Array.isArray(message.content)) {
      for (const part of message.content) {
        if (!part || typeof part !== "object") continue;
        const row = part;
        if ((row.type === "text" || row.type === "input_text" || row.type === "output_text") && typeof row.text === "string" && row.text) {
          content.push({ type: textPartType, text: row.text });
          continue;
        }
        if (isAssistantMessage && row.type === "refusal" && typeof row.refusal === "string" && row.refusal) {
          content.push({ type: "refusal", refusal: row.refusal });
          continue;
        }
        const imageUrl = row.type === "image_url" && typeof row.image_url?.url === "string" ? row.image_url.url : row.type === "input_image" && typeof row.image_url === "string" ? row.image_url : void 0;
        if (role === "user" && imageUrl) content.push({ type: "input_image", image_url: imageUrl });
      }
    }
    if ((role === "user" || role === "assistant") && content.length) {
      input2.push({
        type: "message",
        role,
        content
      });
    }
    if (role === "assistant") {
      for (const call of Array.isArray(message.tool_calls) ? message.tool_calls : []) {
        if (!call || typeof call !== "object") continue;
        const row = call;
        const name = row.function?.name;
        if (!name) continue;
        input2.push({
          type: "function_call",
          call_id: row.id ?? `tool-${Date.now()}-${input2.length}`,
          name,
          arguments: typeof row.function?.arguments === "string" ? row.function.arguments : JSON.stringify(row.function?.arguments ?? {})
        });
      }
    }
  }
  return input2;
}

function anthropicSystemPrompt(messages) {
  return messages.filter((message) => message.role === "system").map((message) => textContent(message.content)).filter(Boolean).join("\n\n");
}

function anthropicImageSource(url2) {
  const trimmed = url2.trim();
  const dataUrl = /^data:([^;,]+);base64,(.*)$/s.exec(trimmed);
  if (dataUrl) {
    return { type: "base64", media_type: dataUrl[1], data: dataUrl[2] };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return { type: "url", url: trimmed };
  }
  return void 0;
}

function parseToolCallArguments(raw) {
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function toAnthropicMessages(messages) {
  const output = [];
  let lastAssistantIndex = -1;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "assistant") {
      lastAssistantIndex = index;
      break;
    }
  }
  const pushUserBlocks = (blocks) => {
    if (!blocks.length) return;
    const previous = output[output.length - 1];
    if (previous && previous.role === "user" && Array.isArray(previous.content)) {
      previous.content = [...previous.content, ...blocks];
      return;
    }
    output.push({ role: "user", content: blocks });
  };
  for (const [index, message] of messages.entries()) {
    const role = message.role;
    if (role === "system") continue;
    if (role === "tool") {
      if (typeof message.tool_call_id === "string" && message.tool_call_id) {
        pushUserBlocks([{
          type: "tool_result",
          tool_use_id: message.tool_call_id,
          content: textContent(message.content)
        }]);
      }
      continue;
    }
    if (role === "user") {
      const blocks = [];
      if (typeof message.content === "string") {
        if (message.content) blocks.push({ type: "text", text: message.content });
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (!part || typeof part !== "object") continue;
          const row = part;
          if ((row.type === "text" || row.type === "input_text") && typeof row.text === "string" && row.text) {
            blocks.push({ type: "text", text: row.text });
            continue;
          }
          const imageUrl = row.type === "image_url" && typeof row.image_url?.url === "string" ? row.image_url.url : row.type === "input_image" && typeof row.image_url === "string" ? row.image_url : void 0;
          if (imageUrl) {
            const source = anthropicImageSource(imageUrl);
            if (source) blocks.push({ type: "image", source });
          }
        }
      }
      if (blocks.length) pushUserBlocks(blocks);
      continue;
    }
    if (role === "assistant") {
      const blocks = [];
      if (index === lastAssistantIndex && Array.isArray(message.anthropic_thinking)) {
        for (const block of message.anthropic_thinking) {
          if (block && typeof block === "object" && (block.thinking || block.signature)) {
            blocks.push({ type: "thinking", thinking: block.thinking, signature: block.signature });
          }
        }
      }
      const text = textContent(message.content);
      if (text) blocks.push({ type: "text", text });
      for (const call of Array.isArray(message.tool_calls) ? message.tool_calls : []) {
        if (!call || typeof call !== "object") continue;
        const row = call;
        const name = row.function?.name;
        if (!name) continue;
        blocks.push({
          type: "tool_use",
          id: row.id ?? `tool-${Date.now()}-${blocks.length}`,
          name,
          input: parseToolCallArguments(row.function?.arguments)
        });
      }
      if (blocks.length) output.push({ role: "assistant", content: blocks });
    }
  }
  return output;
}

export { CHAT_FILE_INPUT_SCHEMAS, chatFileToolInputSchema, ANTHROPIC_API_VERSION, ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS, ANTHROPIC_MIN_THINKING_BUDGET_TOKENS, ANTHROPIC_EFFORT_THINKING_BUDGETS, normalizeChatCompletionsUrl, isUnsupportedRouteError, normalizeResponsesUrl, normalizeAnthropicMessagesUrl, textContent, codexInstructions, toCodexResponsesInput, anthropicSystemPrompt, anthropicImageSource, parseToolCallArguments, toAnthropicMessages };
