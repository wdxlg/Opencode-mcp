// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeSubagentSignals.ts
import { SUBAGENT_TOOL_NAMES2 } from "./module-0333.mjs";
import { buildClaudeToolCallMeta, buildClaudeToolMeta, getClaudeInvocationMessage, getClaudeToolDisplayName, getClaudeToolInputString } from "./module-0330.mjs";
import { toToolCallMeta } from "./module-0046.mjs";
import { hasClientToolNamePrefix, stripClientToolNamePrefix } from "./module-0324.mjs";


// src/vs/platform/agentHost/node/claude/claudeSubagentSignals.ts
var SUBAGENT_SPAWNING_TOOL_NAMES = SUBAGENT_TOOL_NAMES2;

function tagWithParent(signals, chat, parentToolUseId, registry) {
  if (!parentToolUseId) {
    return signals;
  }
  const tagged = signals.map((s) => {
    if (s.kind === "action") {
      return { ...s, parentToolCallId: parentToolUseId };
    }
    if (s.kind === "pending_confirmation") {
      return { ...s, parentToolCallId: parentToolUseId };
    }
    if (s.kind === "model_call_completed") {
      return { ...s, parentToolCallId: parentToolUseId };
    }
    return s;
  });
  const spawn6 = registry.getSpawn(parentToolUseId);
  if (!spawn6 || !spawn6.markAnnounced()) {
    return tagged;
  }
  const started = {
    kind: "subagent_started",
    chat,
    toolCallId: parentToolUseId,
    agentName: spawn6.subagentType ?? "subagent",
    agentDisplayName: spawn6.subagentType ?? "Subagent",
    agentDescription: spawn6.description,
    // The Task tool's short `description` input doubles as the concise
    // per-task tab title for the subagent's read-only chat.
    taskDescription: spawn6.description,
    // The Task tool's `prompt` input is the full delegated instruction
    // that seeds the subagent chat's opening request.
    taskPrompt: spawn6.prompt,
    // When the spawning Task tool is itself an inner tool of another
    // subagent, its parent Task (one level up) is the tool call in
    // whose chat this spawning tool lives. The host uses it to route
    // the discovery content block to that immediate parent chat, at
    // any nesting depth.
    parentToolCallId: registry.getParentSpawn(parentToolUseId)?.toolUseId
  };
  return [started, ...tagged];
}

function mapSubagentSystemMessage(message, chat, registry) {
  const sub = message.subtype;
  if (sub === "task_started") {
    const toolUseId = message.tool_use_id;
    const spawn6 = toolUseId ? registry.getSpawn(toolUseId) : void 0;
    if (spawn6) {
      spawn6.background = true;
    }
    return [];
  }
  if (sub === "task_notification") {
    const m = message;
    if (!m.tool_use_id) {
      return [];
    }
    const status = m.status;
    if (status !== "completed" && status !== "failed" && status !== "stopped") {
      return [];
    }
    const spawn6 = registry.getSpawn(m.tool_use_id);
    if (!spawn6 || !spawn6.markCompleted()) {
      return [];
    }
    const toolUseId = m.tool_use_id;
    registry.removeSpawn(toolUseId);
    return [{ kind: "subagent_completed", chat, toolCallId: toolUseId }];
  }
  return [];
}

function buildTopLevelSubagentReadyAction(block, chat, turnId, registry) {
  const input = block.input;
  const description = typeof input?.description === "string" ? input.description : void 0;
  const agentName = typeof input?.subagent_type === "string" ? input.subagent_type : void 0;
  const prompt = typeof input?.prompt === "string" ? input.prompt : void 0;
  const inputJson = block.input !== void 0 ? safeStringify4(block.input) : void 0;
  registry.recordSpawn(block.id, { subagentType: agentName, description, prompt });
  const meta = { ...buildClaudeToolCallMeta(block.name) };
  if (!meta.toolKind) {
    meta.toolKind = "subagent";
  }
  if (description) {
    meta.subagentDescription = description;
  }
  if (agentName) {
    meta.subagentAgentName = agentName;
  }
  return {
    kind: "action",
    resource: chat,
    action: {
      type: "chat/toolCallReady" /* ChatToolCallReady */,
      turnId,
      toolCallId: block.id,
      invocationMessage: getClaudeInvocationMessage(block.name, getClaudeToolDisplayName(block.name), block.input),
      ...inputJson !== void 0 ? { toolInput: inputJson } : {},
      confirmed: "not-needed" /* NotNeeded */,
      _meta: toToolCallMeta(meta)
    }
  };
}

function emitInnerAssistantSignals(message, chat, turnId, state, parentToolUseId, registry, clientToolOwner) {
  const messageId = message.message.id;
  const signals = [];
  for (let index = 0; index < message.message.content.length; index++) {
    const block = message.message.content[index];
    if (block.type === "text") {
      signals.push({
        kind: "action",
        resource: chat,
        action: {
          type: "chat/responsePart" /* ChatResponsePart */,
          turnId,
          part: {
            kind: "markdown" /* Markdown */,
            id: `${turnId}#${messageId}#${index}`,
            content: block.text
          }
        }
      });
      continue;
    }
    if (block.type === "thinking") {
      signals.push({
        kind: "action",
        resource: chat,
        action: {
          type: "chat/responsePart" /* ChatResponsePart */,
          turnId,
          part: {
            kind: "reasoning" /* Reasoning */,
            id: `${turnId}#${messageId}#${index}`,
            content: block.thinking
          }
        }
      });
      continue;
    }
    if (block.type === "tool_use") {
      const toolName = stripClientToolNamePrefix(block.name);
      const isClientTool = hasClientToolNamePrefix(block.name);
      const clientId = isClientTool ? clientToolOwner?.(toolName) : void 0;
      state.startToolBlock(index, block.id, toolName, turnId, isClientTool);
      state.toolCalls.seedParsedInput(block.id, block.input);
      registry.noteInnerTool(block.id, parentToolUseId);
      const displayName = isClientTool ? toolName : getClaudeToolDisplayName(toolName);
      const meta = isClientTool ? void 0 : buildClaudeToolMeta(toolName);
      const info = state.toolCalls.lookup(block.id)?.info;
      const toolInputStr = info?.toolInput ?? getClaudeToolInputString(toolName, block.input);
      signals.push({
        kind: "action",
        resource: chat,
        action: {
          type: "chat/toolCallStart" /* ChatToolCallStart */,
          turnId,
          toolCallId: block.id,
          toolName,
          displayName,
          ...clientId ? { contributor: { kind: "client" /* Client */, clientId } } : {},
          ...meta ? { _meta: meta } : {}
        }
      });
      signals.push({
        kind: "action",
        resource: chat,
        action: {
          type: "chat/toolCallReady" /* ChatToolCallReady */,
          turnId,
          toolCallId: block.id,
          invocationMessage: isClientTool ? displayName : getClaudeInvocationMessage(toolName, displayName, block.input),
          ...toolInputStr !== void 0 ? { toolInput: toolInputStr } : {},
          confirmed: "not-needed" /* NotNeeded */
        }
      });
      continue;
    }
  }
  return signals;
}

function safeStringify4(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return void 0;
  }
}
export { tagWithParent, mapSubagentSystemMessage, buildTopLevelSubagentReadyAction, emitInnerAssistantSignals, safeStringify4, SUBAGENT_SPAWNING_TOOL_NAMES };
