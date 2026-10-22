// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexReplayMapper.ts
import { unwrapShellInvocation } from "./module-0380.mjs";
import { buildCodexThreadOpenLink, extractCodexCreatedThreadDirectives, getCodexThreadCoordinationCall } from "./module-0385.mjs";
import { generateUuid } from "./module-0042.mjs";
import { parseCodexDelegation } from "./module-0379.mjs";
import { codexCompactionLabels, codexImageGenerationLabels, describeFileChange, describeWebSearch, fileChangeOutput, mapCodexTurnError, turnStateFromStatus, webSearchInvocationMessage, webSearchPastTenseMessage } from "./module-0381.mjs";
import { toAgentMessageDelegationMeta } from "./module-0378.mjs";
import { getServerToolDisplay } from "./module-0236.mjs";
import { toToolCallMeta } from "./module-0046.mjs";


// src/vs/platform/agentHost/node/codex/codexReplayMapper.ts
function replayThreadToTurns(thread, modelsByTurnId, _threadCoordinationByTurnId) {
  const turns = [];
  for (const codexTurn of thread.turns ?? []) {
    const turn = replayTurnToTurn(
      codexTurn,
      modelsByTurnId?.get(codexTurn.id),
      _threadCoordinationByTurnId?.get(codexTurn.id)
    );
    if (turn) {
      turns.push(turn);
    }
  }
  return turns;
}

function replayTurnToTurn(codexTurn, model, rolloutCoordination) {
  let userText = "";
  const parts = [];
  const linkedCreatedThreadIds = /* @__PURE__ */ new Set();
  const remainingRolloutCoordination = /* @__PURE__ */ new Map();
  for (const coordination of rolloutCoordination ?? []) {
    const key = threadCoordinationKey(coordination);
    remainingRolloutCoordination.set(key, (remainingRolloutCoordination.get(key) ?? 0) + 1);
    if (coordination.toolName === "create_session" /* CreateSession */) {
      linkedCreatedThreadIds.add(coordination.targetThreadId);
    }
    parts.push(threadCoordinationToolCallPart(coordination));
  }
  let agentMessageCount = 0;
  let pendingPreflight;
  const flushPreflight = () => {
    if (pendingPreflight) {
      parts.push(shellToolCallPart(pendingPreflight.item, pendingPreflight.command));
      pendingPreflight = void 0;
    }
  };
  for (const item of codexTurn.items ?? []) {
    if (item.type === "commandExecution") {
      const command = unwrapShellInvocation(item.command ?? "");
      if (pendingPreflight && pendingPreflight.command === command) {
        pendingPreflight = void 0;
        parts.push(shellToolCallPart(item, command));
        continue;
      }
      flushPreflight();
      const success = item.status === "completed" && (item.exitCode === 0 || item.exitCode === null);
      const output = item.aggregatedOutput ?? "";
      if (success && !output) {
        pendingPreflight = { command, item };
        continue;
      }
      parts.push(shellToolCallPart(item, command));
      continue;
    }
    flushPreflight();
    if (item.type === "userMessage") {
      const collected = [];
      for (const c of item.content) {
        if (c.type === "text") {
          collected.push(c.text);
        }
      }
      if (collected.length > 0) {
        userText = collected.join("\n\n");
      }
    } else if (item.type === "agentMessage") {
      const message = extractCodexCreatedThreadDirectives(item.text ?? "");
      if (message.text.length > 0) {
        const separator = agentMessageCount > 0 ? "\n\n" : "";
        agentMessageCount++;
        parts.push({
          kind: "markdown" /* Markdown */,
          id: generateUuid(),
          content: separator + message.text
        });
      }
      for (const threadId of message.threadIds) {
        if (!linkedCreatedThreadIds.has(threadId)) {
          linkedCreatedThreadIds.add(threadId);
          parts.push(threadCoordinationToolCallPart({
            toolName: "create_session" /* CreateSession */,
            targetThreadId: threadId,
            openLink: buildCodexThreadOpenLink(threadId),
            toolInput: { prompt: getServerToolPastTenseMessage("create_session" /* CreateSession */) }
          }));
        }
      }
    } else if (item.type === "webSearch") {
      parts.push(webSearchToolCallPart(item));
    } else if (item.type === "imageGeneration") {
      parts.push(imageGenerationToolCallPart(item));
    } else if (item.type === "fileChange") {
      parts.push(fileChangeToolCallPart(item));
    } else if (item.type === "dynamicToolCall") {
      const coordination = getCodexThreadCoordinationCall(item);
      if (coordination) {
        const key = threadCoordinationKey(coordination);
        const duplicateCount = remainingRolloutCoordination.get(key) ?? 0;
        if (duplicateCount > 0) {
          remainingRolloutCoordination.set(key, duplicateCount - 1);
        } else {
          if (coordination.toolName === "create_session" /* CreateSession */) {
            linkedCreatedThreadIds.add(coordination.targetThreadId);
          }
          parts.push(threadCoordinationToolCallPart(coordination));
        }
      }
    } else if (item.type === "contextCompaction") {
      if (!userText) {
        userText = "/compact";
      }
      parts.push(compactionToolCallPart());
    }
  }
  flushPreflight();
  const delegation = parseCodexDelegation(userText);
  if (!userText && parts.length === 0) {
    return void 0;
  }
  if (codexTurn.status === "failed" && codexTurn.error) {
    parts.push({ kind: "error" /* Error */, error: mapCodexTurnError(codexTurn.error) });
  }
  return {
    id: codexTurn.id,
    ...codexTurnTiming(codexTurn),
    message: {
      text: delegation?.input ?? userText,
      origin: { kind: "user" /* User */ },
      ...model ? { model } : {},
      ...delegation ? { _meta: toAgentMessageDelegationMeta({ sourceThreadId: delegation.sourceThreadId }) } : {}
    },
    responseParts: parts,
    usage: model ? { model: model.id } : void 0,
    state: turnStateFromStatus(codexTurn.status)
  };
}

function threadCoordinationToolCallPart(coordination) {
  const display = getServerToolDisplay(coordination.toolName, coordination.toolInput, { text: coordination.openLink, success: true });
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId: generateUuid(),
      toolName: coordination.toolName,
      displayName: display?.displayName ?? coordination.toolName,
      invocationMessage: display?.invocationMessage ?? coordination.toolName,
      toolInput: JSON.stringify(coordination.toolInput, null, 2),
      confirmed: "not-needed" /* NotNeeded */,
      success: true,
      pastTenseMessage: display?.pastTenseMessage ?? coordination.toolName,
      content: [{ type: "text" /* Text */, text: coordination.openLink }]
    }
  };
}

function threadCoordinationKey(coordination) {
  return `${coordination.toolName}\0${coordination.targetThreadId}`;
}

function getServerToolPastTenseMessage(toolName) {
  const pastTenseMessage = getServerToolDisplay(toolName, {})?.pastTenseMessage;
  return typeof pastTenseMessage === "string" ? pastTenseMessage : pastTenseMessage?.markdown ?? toolName;
}

function codexTurnTiming(codexTurn) {
  const startedAtSeconds = codexTurn.startedAt;
  if (typeof startedAtSeconds !== "number" || !Number.isFinite(startedAtSeconds)) {
    return {};
  }
  const duration = typeof codexTurn.durationMs === "number" && Number.isFinite(codexTurn.durationMs) && codexTurn.durationMs >= 0 ? codexTurn.durationMs : typeof codexTurn.completedAt === "number" && Number.isFinite(codexTurn.completedAt) ? Math.max(0, (codexTurn.completedAt - startedAtSeconds) * 1e3) : void 0;
  return {
    startedAt: new Date(startedAtSeconds * 1e3).toISOString(),
    ...duration !== void 0 ? { duration } : {}
  };
}

function textContent(output) {
  return output ? [{ type: "text" /* Text */, text: output }] : void 0;
}

function shellToolCallPart(item, command) {
  const success = item.status === "completed" && (item.exitCode === 0 || item.exitCode === null);
  const output = item.aggregatedOutput ?? "";
  const exit = item.exitCode;
  const pastTense = success ? `Ran \`${command}\`` : exit !== null ? `Ran \`${command}\` (exit ${exit})` : `Ran \`${command}\` (failed)`;
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId: generateUuid(),
      toolName: "shell",
      displayName: "Run shell command",
      _meta: toToolCallMeta({ toolKind: "terminal" }),
      invocationMessage: command,
      toolInput: command,
      confirmed: "not-needed" /* NotNeeded */,
      success,
      pastTenseMessage: pastTense,
      content: textContent(output),
      error: success ? void 0 : { message: exit !== null ? `Exit code ${exit}` : "Command failed" }
    }
  };
}

function webSearchToolCallPart(item) {
  const query = describeWebSearch(item.query, item.action);
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId: generateUuid(),
      toolName: "web_search",
      displayName: "Web search",
      _meta: toToolCallMeta({ toolKind: "search" }),
      invocationMessage: webSearchInvocationMessage(query),
      toolInput: query,
      confirmed: "not-needed" /* NotNeeded */,
      success: true,
      pastTenseMessage: webSearchPastTenseMessage(query)
    }
  };
}

function imageGenerationToolCallPart(item) {
  const success = item.status === "completed" && item.result.length > 0;
  const labels = codexImageGenerationLabels(item.status);
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId: generateUuid(),
      toolName: "image_gen.imagegen",
      displayName: labels.displayName,
      invocationMessage: labels.invocationMessage,
      toolInput: JSON.stringify({ prompt: item.revisedPrompt ?? labels.displayName }),
      confirmed: "not-needed" /* NotNeeded */,
      success,
      pastTenseMessage: success ? labels.pastTenseMessage : labels.failedMessage,
      content: success ? [{ type: "embeddedResource" /* EmbeddedResource */, data: item.result, contentType: "image/png" }] : void 0,
      error: success ? void 0 : { message: labels.errorMessage }
    }
  };
}

function fileChangeToolCallPart(item) {
  const success = item.status === "completed";
  const summary = describeFileChange(item.changes) || "Apply file changes";
  const output = fileChangeOutput(item.changes);
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId: generateUuid(),
      toolName: "file_edit",
      displayName: "Apply file changes",
      invocationMessage: summary,
      confirmed: "not-needed" /* NotNeeded */,
      success,
      pastTenseMessage: success ? summary : "Failed to apply file changes",
      content: textContent(output),
      error: success ? void 0 : { message: `Patch ${item.status}` }
    }
  };
}

function compactionToolCallPart() {
  const labels = codexCompactionLabels();
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId: generateUuid(),
      toolName: "compact",
      displayName: labels.displayName,
      invocationMessage: labels.invocationMessage,
      confirmed: "not-needed" /* NotNeeded */,
      success: true,
      pastTenseMessage: labels.pastTenseMessage
    }
  };
}
export { replayThreadToTurns, replayTurnToTurn, threadCoordinationToolCallPart, threadCoordinationKey, getServerToolPastTenseMessage, codexTurnTiming, textContent, shellToolCallPart, webSearchToolCallPart, imageGenerationToolCallPart, fileChangeToolCallPart, compactionToolCallPart };
