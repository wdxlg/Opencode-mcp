// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeSubagentResolver.ts
import { SUBAGENT_TOOL_NAMES2, scanTranscriptForAgentIds } from "./module-0333.mjs";
import { mapSessionMessagesToTurns } from "./module-0331.mjs";
import { vObjAny, vString } from "./module-0332.mjs";


// src/vs/platform/agentHost/node/claude/claudeSubagentResolver.ts
var TextSuffixStrategy = class {
  constructor(_sdk, _logService) {
    this._sdk = _sdk;
    this._logService = _logService;
    this.name = "text_suffix";
  }
  async lookup(toolCallId, ctx) {
    const transcript = await fetchParentTurns(this._sdk, this._logService, ctx, "TextSuffix");
    if (!transcript) {
      return void 0;
    }
    return scanTranscriptForAgentIds(transcript).get(toolCallId);
  }
};

async function fetchParentTurns(sdk, logService, ctx, strategyLabel) {
  if (ctx.parentTranscript) {
    return ctx.parentTranscript;
  }
  try {
    const messages = await sdk.getSessionMessages(ctx.parentSessionId, { includeSystemMessages: true });
    return mapSessionMessagesToTurns(messages, ctx.parentUri, logService);
  } catch (err) {
    logService.warn(`[claudeSubagentResolver] ${strategyLabel}: parent transcript fetch failed: ${err}`);
    return void 0;
  }
}

function vString2(input) {
  const r = vString().validate(input);
  return r.error ? void 0 : r.content;
}

function vObj2(input) {
  const r = vObjAny().validate(input);
  if (r.error || r.content === null || Array.isArray(r.content)) {
    return void 0;
  }
  return r.content;
}

var PromptMatchStrategy = class {
  constructor(_sdk, _logService) {
    this._sdk = _sdk;
    this._logService = _logService;
    this.name = "prompt_match";
  }
  async lookup(toolCallId, ctx) {
    const prompt = await this._loadParentPrompt(toolCallId, ctx);
    if (!prompt) {
      return void 0;
    }
    let agentIds;
    try {
      agentIds = await this._sdk.listSubagents(ctx.parentSessionId);
    } catch (err) {
      this._logService.warn(`[claudeSubagentResolver] PromptMatch: listSubagents failed: ${err}`);
      return void 0;
    }
    for (const agentId of agentIds) {
      if (ctx.token.isCancellationRequested) {
        return void 0;
      }
      let messages;
      try {
        messages = await this._sdk.getSubagentMessages(ctx.parentSessionId, agentId);
      } catch (err) {
        this._logService.warn(`[claudeSubagentResolver] PromptMatch: getSubagentMessages(${agentId}) failed: ${err}`);
        continue;
      }
      const firstMessage = extractFirstUserText(messages);
      if (firstMessage === void 0) {
        continue;
      }
      if (firstMessage === prompt) {
        return agentId;
      }
    }
    return void 0;
  }
  async _loadParentPrompt(toolCallId, ctx) {
    const transcript = await fetchParentTurns(this._sdk, this._logService, ctx, "PromptMatch");
    if (!transcript) {
      return void 0;
    }
    return extractSpawningPromptFromTranscript(transcript, toolCallId);
  }
};

function extractSpawningPromptFromTranscript(transcript, toolCallId) {
  for (const turn of transcript) {
    for (const part of turn.responseParts) {
      if (part.kind !== "toolCall" /* ToolCall */) {
        continue;
      }
      const state = part.toolCall;
      if (state.toolCallId !== toolCallId) {
        continue;
      }
      if (!SUBAGENT_TOOL_NAMES2.has(state.toolName)) {
        return void 0;
      }
      if (state.status === "streaming" /* Streaming */) {
        return void 0;
      }
      const inputRaw = state.toolInput;
      if (typeof inputRaw !== "string") {
        return void 0;
      }
      let parsed;
      try {
        parsed = JSON.parse(inputRaw);
      } catch {
        return void 0;
      }
      const bag = vObj2(parsed);
      if (!bag) {
        return void 0;
      }
      return vString2(bag.prompt);
    }
  }
  return void 0;
}

var ResultMatchStrategy = class {
  constructor(_sdk, _logService) {
    this._sdk = _sdk;
    this._logService = _logService;
    this.name = "result_match";
  }
  async lookup(toolCallId, ctx) {
    const transcript = await fetchParentTurns(this._sdk, this._logService, ctx, "ResultMatch");
    const expected = transcript ? extractCompletedResultTextFromTranscript(transcript, toolCallId) : void 0;
    if (!expected) {
      return void 0;
    }
    let agentIds;
    try {
      agentIds = await this._sdk.listSubagents(ctx.parentSessionId);
    } catch (err) {
      this._logService.warn(`[claudeSubagentResolver] ResultMatch: listSubagents failed: ${err}`);
      return void 0;
    }
    let matchedAgentId;
    for (const agentId of agentIds) {
      if (ctx.token.isCancellationRequested) {
        return void 0;
      }
      try {
        const messages = await this._sdk.getSubagentMessages(ctx.parentSessionId, agentId);
        if (extractLastAssistantText(messages)?.trim() === expected.trim()) {
          if (matchedAgentId) {
            return void 0;
          }
          matchedAgentId = agentId;
        }
      } catch (err) {
        this._logService.warn(`[claudeSubagentResolver] ResultMatch: getSubagentMessages(${agentId}) failed: ${err}`);
      }
    }
    return matchedAgentId;
  }
};

function extractCompletedResultTextFromTranscript(transcript, toolCallId) {
  for (const turn of transcript) {
    for (const part of turn.responseParts) {
      if (part.kind !== "toolCall" /* ToolCall */ || part.toolCall.toolCallId !== toolCallId || part.toolCall.status !== "completed" /* Completed */) {
        continue;
      }
      const text = (part.toolCall.content ?? []).filter((item) => item.type === "text" /* Text */).map((item) => item.text).join("\n").trim();
      return text || void 0;
    }
  }
  return void 0;
}

function extractLastAssistantText(messages) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.type !== "assistant") {
      continue;
    }
    const inner = vObj2(message.message);
    if (!inner) {
      continue;
    }
    if (typeof inner.content === "string") {
      return inner.content;
    }
    if (Array.isArray(inner.content)) {
      const text = inner.content.flatMap((block) => {
        const item = vObj2(block);
        const value = item?.type === "text" ? vString2(item.text) : void 0;
        return value === void 0 ? [] : [value];
      }).join("");
      if (text) {
        return text;
      }
    }
  }
  return void 0;
}

function extractFirstUserText(messages) {
  for (const msg of messages) {
    if (msg.type !== "user") {
      continue;
    }
    const inner = vObj2(msg.message);
    if (!inner) {
      continue;
    }
    const content = inner.content;
    if (typeof content === "string") {
      return content;
    }
    if (!Array.isArray(content)) {
      continue;
    }
    for (const block of content) {
      const obj = vObj2(block);
      if (!obj || obj.type !== "text") {
        continue;
      }
      const text = vString2(obj.text);
      if (text !== void 0) {
        return text;
      }
    }
  }
  return void 0;
}

var NativeStrategy = class {
  constructor() {
    this.name = "native";
  }
  async lookup() {
    return void 0;
  }
};

async function resolveAgentIdViaChain(toolCallId, ctx, deps) {
  const cached = deps.cacheGet(toolCallId);
  if (cached) {
    return cached;
  }
  for (const strategy of deps.strategies) {
    if (ctx.token.isCancellationRequested) {
      return void 0;
    }
    const hit = await strategy.lookup(toolCallId, ctx);
    if (hit) {
      deps.cacheSet(toolCallId, hit);
      return hit;
    }
  }
  return void 0;
}

function buildDefaultStrategies(sdk, logService) {
  return [
    new TextSuffixStrategy(sdk, logService),
    new PromptMatchStrategy(sdk, logService),
    new ResultMatchStrategy(sdk, logService),
    new NativeStrategy()
  ];
}

async function getSubagentTranscript(subagentUri, parentUri, parentSessionId, toolCallId, parentRegistry, sdk, logService, token) {
  const agentId = await resolveAgentIdViaChain(toolCallId, {
    parentUri,
    parentSessionId,
    token
  }, {
    strategies: buildDefaultStrategies(sdk, logService),
    cacheGet: (id2) => parentRegistry.getSpawn(id2)?.agentId,
    cacheSet: (id2, resolved) => {
      parentRegistry.recordSpawn(id2, { agentId: resolved });
    }
  });
  if (!agentId) {
    return [];
  }
  let messages;
  try {
    messages = await sdk.getSubagentMessages(parentSessionId, agentId);
  } catch (err) {
    logService.warn(`[getSubagentTranscript] getSubagentMessages(${agentId}) failed: ${err}`);
    return [];
  }
  return mapSessionMessagesToTurns(messages, subagentUri, logService);
}
export { fetchParentTurns, vString2, vObj2, extractSpawningPromptFromTranscript, extractCompletedResultTextFromTranscript, extractLastAssistantText, extractFirstUserText, resolveAgentIdViaChain, buildDefaultStrategies, getSubagentTranscript, TextSuffixStrategy, PromptMatchStrategy, ResultMatchStrategy, NativeStrategy };
