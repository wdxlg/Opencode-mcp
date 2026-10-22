// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/mapSessionEvents.ts
import { basename, isAbsolute, join } from "./module-0018.mjs";
import { Schemas } from "./module-0024.mjs";
import { buildNonPtyShellTerminalUri } from "./module-0258.mjs";
import { isString } from "./module-0008.mjs";
import { getInvocationMessage, getPastTenseMessage, getShellIntention, getShellLanguage, getSubagentMetadata, getTaskCompleteMarkdown, getToolDisplayName, getToolInputString, getToolKind, isEditTool, isHiddenTool, isTaskCompleteTool, synthesizeSkillToolCall } from "./module-0237.mjs";
import { stripRedundantCdPrefix } from "./module-0183.mjs";
import { buildSubagentSessionUri, createErrorResponsePart, parseChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { AgentSession } from "./module-0048.mjs";
import { generateUuid } from "./module-0042.mjs";
import { buildCopilotSystemNotification } from "./module-0256.mjs";
import { buildChatErrorInfoFromCopilotSdkFields } from "./module-0279.mjs";
import { getMediaMime } from "./module-0280.mjs";
import { readSimpleAttachmentDisplayKindFromMimeType } from "./module-0281.mjs";
import { decodeBase64 } from "./module-0029.mjs";
import { buildSessionDbUri } from "./module-0261.mjs";
import { buildMcpChannel, buildMcpTopLevelCustomizationId } from "./module-0163.mjs";
import { toToolCallMeta } from "./module-0046.mjs";


// src/vs/platform/agentHost/node/copilot/mapSessionEvents.ts
function tryStringify2(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return void 0;
  }
}

function resolveToolDisplayPath(path, workingDirectory) {
  return isAbsolute(path) || !workingDirectory || workingDirectory.scheme !== Schemas.file ? path : join(workingDirectory.fsPath, path);
}

function isSyntheticUserMessage(event) {
  if (event.type !== "user.message") {
    return false;
  }
  const source = event.data.source;
  return !!source && source.toLowerCase() !== "user";
}

function stripPromptScaffolding(text) {
  const withoutAux = text.replace(/<reminder>[\s\S]*?<\/reminder>\s*/g, "").replace(/<system[-_]reminder>[\s\S]*?<\/system[-_]reminder>\s*/g, "").replace(/<attachments>[\s\S]*?<\/attachments>\s*/g, "").replace(/<context>[\s\S]*?<\/context>\s*/g, "").replace(/<current_datetime>[\s\S]*?<\/current_datetime>\s*/g, "").replace(/<pr_metadata[^>]*\/?>\s*/g, "");
  const withoutRequest = withoutAux.replace(/<userRequest>[\s\S]*?<\/userRequest>\s*/g, "").replace(/<user_query>[\s\S]*?<\/user_query>\s*/g, "").trim();
  if (withoutRequest) {
    return withoutRequest;
  }
  const inner = withoutAux.match(/<userRequest>([\s\S]*?)<\/userRequest>/) ?? withoutAux.match(/<user_query>([\s\S]*?)<\/user_query>/);
  return inner ? inner[1].trim() : withoutAux.trim();
}

function appendSdkToolResultContent(content, sdkContents, terminal) {
  let shellExit;
  for (const sdkContent of sdkContents ?? []) {
    switch (sdkContent.type) {
      case "image":
        content.push({
          type: "embeddedResource" /* EmbeddedResource */,
          data: sdkContent.data,
          contentType: sdkContent.mimeType
        });
        break;
      case "shell_exit": {
        const result = {
          exitCode: sdkContent.exitCode,
          ...typeof sdkContent.outputPreview === "string" ? { preview: sdkContent.outputPreview } : {},
          ...sdkContent.outputTruncated !== void 0 ? { truncated: sdkContent.outputTruncated } : {}
        };
        shellExit = { shellId: sdkContent.shellId, result };
        const terminalIndex = content.findIndex((c) => c.type === "terminal" /* Terminal */);
        if (terminalIndex !== -1) {
          const terminalBlock = content[terminalIndex];
          content[terminalIndex] = { ...terminalBlock, result };
        } else if (terminal) {
          content.push({
            type: "terminal" /* Terminal */,
            resource: buildNonPtyShellTerminalUri(terminal.session, terminal.toolCallId),
            title: terminal.title,
            isPty: false,
            result
          });
        }
        break;
      }
    }
  }
  return shellExit;
}

function newTurnBuilder(id2, text, options) {
  const message = {
    text,
    origin: { kind: options?.origin ?? "user" /* User */ },
    ...options?.attachments?.length ? { attachments: options.attachments } : {},
    ...options?.model ? { model: options.model } : {},
    ...options?.agent ? { agent: options.agent } : {}
  };
  return { id: id2, message, startedAt: options?.startedAt, lastEventAt: options?.startedAt, waitingStartedAt: void 0, waitingDuration: 0, responseParts: [], usage: void 0, pendingTools: /* @__PURE__ */ new Map() };
}

function readEventTimestamp(event) {
  const timestamp = event.timestamp;
  return isString(timestamp) && Number.isFinite(Date.parse(timestamp)) ? timestamp : void 0;
}

function readStringProperty(source, key) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return void 0;
  }
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}

function readMcpUiResourceUri(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return void 0;
  }
  const toolDescription = source["toolDescription"];
  if (!toolDescription || typeof toolDescription !== "object" || Array.isArray(toolDescription)) {
    return void 0;
  }
  const meta = toolDescription["_meta"];
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  const ui = meta["ui"];
  if (!ui || typeof ui !== "object" || Array.isArray(ui)) {
    return void 0;
  }
  return readStringProperty(ui, "resourceUri");
}

function makeToolStartInfo(toolName, rawArguments, parentToolCallId, workingDirectory, source) {
  if (isHiddenTool(toolName)) {
    return void 0;
  }
  const rawArgs = rawArguments !== void 0 ? tryStringify2(rawArguments) : void 0;
  let parameters;
  if (rawArgs) {
    try {
      parameters = JSON.parse(rawArgs);
    } catch {
    }
  }
  const cleaned = stripRedundantCdPrefix(toolName, parameters, workingDirectory) ? tryStringify2(parameters) : void 0;
  const toolArgs = cleaned ?? rawArgs;
  const toolKind = getToolKind(toolName, parameters);
  const subagentMeta = toolKind === "subagent" ? getSubagentMetadata(parameters) : void 0;
  const displayName = getToolDisplayName(toolName);
  return {
    toolName,
    displayName,
    invocationMessage: getInvocationMessage(toolName, displayName, parameters, (path) => resolveToolDisplayPath(path, workingDirectory)),
    toolInput: getToolInputString(toolName, parameters, toolArgs),
    toolKind,
    language: toolKind === "terminal" ? getShellLanguage(toolName) : void 0,
    intention: getShellIntention(toolName, parameters),
    subagentAgentName: subagentMeta?.agentName,
    subagentDescription: subagentMeta?.description,
    parameters,
    parentToolCallId,
    mcpServerName: readStringProperty(source, "mcpServerName"),
    mcpToolName: readStringProperty(source, "mcpToolName"),
    mcpUiResourceUri: readMcpUiResourceUri(source)
  };
}

function finalizeTurn(builder, state) {
  const startedAtMs = builder.startedAt === void 0 ? void 0 : Date.parse(builder.startedAt);
  const endedAtMs = builder.lastEventAt === void 0 ? void 0 : Date.parse(builder.lastEventAt);
  const duration = startedAtMs !== void 0 && endedAtMs !== void 0 && Number.isFinite(startedAtMs) && Number.isFinite(endedAtMs) ? Math.max(0, endedAtMs - startedAtMs - builder.waitingDuration) : void 0;
  return {
    id: builder.id,
    ...builder.startedAt !== void 0 ? { startedAt: builder.startedAt } : {},
    ...duration !== void 0 ? { duration } : {},
    message: builder.message,
    responseParts: builder.responseParts,
    usage: builder.usage,
    state
  };
}

async function mapSessionEvents(session, db, events, routingChatUri, options = void 0) {
  const routingChat = parseChatUri(routingChatUri);
  if (!routingChat) {
    throw new Error(`Malformed AHP chat URI: ${routingChatUri.toString()}`);
  }
  const workingDirectory = options?.workingDirectory;
  let currentModel = options?.model;
  let currentAgent = options?.agent;
  const toolInfoByCallId = /* @__PURE__ */ new Map();
  const editToolCallIds = [];
  const completionsByCallId = /* @__PURE__ */ new Map();
  const subagentInfoByToolCallId = /* @__PURE__ */ new Map();
  const parentToolCallIdByAgentId = /* @__PURE__ */ new Map();
  const resolveParentToolCallId = (agentId, deprecatedParentToolCallId) => {
    const mapped = agentId ? parentToolCallIdByAgentId.get(agentId) : void 0;
    return mapped ?? deprecatedParentToolCallId;
  };
  for (const e of events) {
    if (e.type === "subagent.started") {
      subagentInfoByToolCallId.set(e.data.toolCallId, {
        agentName: e.data.agentName,
        agentDisplayName: e.data.agentDisplayName,
        agentDescription: e.data.agentDescription
      });
      if (e.agentId) {
        parentToolCallIdByAgentId.set(e.agentId, e.data.toolCallId);
      }
    }
    if (e.type === "tool.execution_complete") {
      completionsByCallId.set(e.data.toolCallId, e.data);
    }
    if (e.type === "tool.execution_start") {
      const d = e.data;
      const parentToolCallId = resolveParentToolCallId(e.agentId, d.parentToolCallId);
      const info = makeToolStartInfo(d.toolName, d.arguments, parentToolCallId, workingDirectory, d);
      if (!info) {
        continue;
      }
      toolInfoByCallId.set(d.toolCallId, info);
      const command = isString(info.parameters?.command) ? info.parameters.command : void 0;
      if (isEditTool(d.toolName, command)) {
        editToolCallIds.push(d.toolCallId);
      }
    }
  }
  let storedEdits;
  if (db && editToolCallIds.length > 0) {
    try {
      const records = await db.getFileEdits(editToolCallIds);
      if (records.length > 0) {
        storedEdits = /* @__PURE__ */ new Map();
        for (const r of records) {
          let list = storedEdits.get(r.toolCallId);
          if (!list) {
            list = [];
            storedEdits.set(r.toolCallId, list);
          }
          list.push(r);
        }
      }
    } catch {
    }
  }
  const sessionUriStr = session.toString();
  const routingSession = URI.parse(routingChat.session);
  const providerId = routingSession.scheme;
  const rawSessionId = AgentSession.id(routingSession);
  const turns = [];
  const subagentBuilders = /* @__PURE__ */ new Map();
  const subagentTurnStates = /* @__PURE__ */ new Map();
  const terminatedSubagentTurns = /* @__PURE__ */ new Set();
  const subagentTurns = /* @__PURE__ */ new Map();
  let parentBuilder;
  let parentTurnState = "cancelled" /* Cancelled */;
  let parentTurnTerminated = false;
  let rootAssistantTurnActive = false;
  let rootRequestActive = false;
  let pendingAutoModeResolved;
  const pendingSubagentAutoModeResolved = /* @__PURE__ */ new Map();
  let currentEventTimestamp;
  const touch = (builder) => {
    if (builder && currentEventTimestamp !== void 0) {
      builder.lastEventAt = currentEventTimestamp;
    }
  };
  const flushParent = () => {
    if (!parentBuilder) {
      return;
    }
    turns.push(finalizeTurn(parentBuilder, parentTurnState));
    parentBuilder = void 0;
    parentTurnState = "cancelled" /* Cancelled */;
    parentTurnTerminated = false;
  };
  const flushSubagent = (parentToolCallId) => {
    const builder = subagentBuilders.get(parentToolCallId);
    if (!builder) {
      subagentTurnStates.delete(parentToolCallId);
      return;
    }
    subagentBuilders.delete(parentToolCallId);
    const state = subagentTurnStates.get(parentToolCallId) ?? "complete" /* Complete */;
    subagentTurnStates.delete(parentToolCallId);
    terminatedSubagentTurns.delete(parentToolCallId);
    if (builder.responseParts.length === 0) {
      return;
    }
    const list = subagentTurns.get(parentToolCallId) ?? [];
    list.push(finalizeTurn(builder, state));
    subagentTurns.set(parentToolCallId, list);
  };
  const ensureSubagentBuilder = (parentToolCallId) => {
    let builder = subagentBuilders.get(parentToolCallId);
    if (!builder) {
      builder = newTurnBuilder(generateUuid(), "", { startedAt: currentEventTimestamp });
      subagentBuilders.set(parentToolCallId, builder);
      if (!subagentTurnStates.has(parentToolCallId)) {
        subagentTurnStates.set(parentToolCallId, "complete" /* Complete */);
      }
      const autoModeResolved = pendingSubagentAutoModeResolved.get(parentToolCallId);
      if (autoModeResolved) {
        builder.usage = { model: autoModeResolved.chosenModel, _meta: { autoModeResolved } };
        pendingSubagentAutoModeResolved.delete(parentToolCallId);
      }
    }
    touch(builder);
    return builder;
  };
  const targetBuilderFor = (parentToolCallId) => {
    if (parentToolCallId) {
      return ensureSubagentBuilder(parentToolCallId);
    }
    touch(parentBuilder);
    return parentBuilder;
  };
  for (const e of events) {
    currentEventTimestamp = readEventTimestamp(e);
    switch (e.type) {
      case "assistant.turn_start":
        if (!e.agentId) {
          if (parentBuilder && parentTurnState === "error" /* Error */) {
            const waitingStartedAt = parentBuilder.waitingStartedAt === void 0 ? void 0 : Date.parse(parentBuilder.waitingStartedAt);
            const resumedAt = currentEventTimestamp === void 0 ? void 0 : Date.parse(currentEventTimestamp);
            if (waitingStartedAt !== void 0 && resumedAt !== void 0 && Number.isFinite(waitingStartedAt) && Number.isFinite(resumedAt)) {
              parentBuilder.waitingDuration += Math.max(0, resumedAt - waitingStartedAt);
            }
            parentBuilder.waitingStartedAt = void 0;
            parentTurnState = "cancelled" /* Cancelled */;
            parentTurnTerminated = false;
          } else if (parentBuilder && rootAssistantTurnActive) {
            const interruptedAt = parentBuilder.lastEventAt === void 0 ? void 0 : Date.parse(parentBuilder.lastEventAt);
            const resumedAt = currentEventTimestamp === void 0 ? void 0 : Date.parse(currentEventTimestamp);
            if (interruptedAt !== void 0 && resumedAt !== void 0 && Number.isFinite(interruptedAt) && Number.isFinite(resumedAt)) {
              parentBuilder.waitingDuration += Math.max(0, resumedAt - interruptedAt);
            }
          }
          rootAssistantTurnActive = true;
          rootRequestActive = true;
          touch(parentBuilder);
        }
        break;
      case "assistant.turn_end":
        if (!e.agentId) {
          rootAssistantTurnActive = false;
          rootRequestActive = parentTurnState !== "complete" /* Complete */ && parentTurnState !== "error" /* Error */ && !parentTurnTerminated;
          touch(parentBuilder);
        }
        break;
      case "session.start": {
        if (!e.agentId && e.data.selectedModel) {
          currentModel = { id: e.data.selectedModel };
        }
        break;
      }
      case "session.model_change": {
        currentModel = { id: e.data.newModel };
        break;
      }
      case "session.auto_mode_resolved": {
        const parentToolCallId = resolveParentToolCallId(e.agentId, void 0);
        if (parentToolCallId) {
          pendingSubagentAutoModeResolved.set(parentToolCallId, e.data);
        } else if (!e.agentId) {
          pendingAutoModeResolved = e.data;
        }
        break;
      }
      case "subagent.deselected": {
        if (!e.agentId) {
          currentAgent = void 0;
        }
        break;
      }
      case "user.message": {
        if (isSyntheticUserMessage(e)) {
          continue;
        }
        const d = e.data;
        const messageId = d.interactionId ?? "";
        const content = stripPromptScaffolding(d.content ?? "");
        const attachments = sdkAttachmentsToProtocol(d.attachments);
        const parentToolCallId = resolveParentToolCallId(e.agentId, void 0);
        if (e.agentId && !parentToolCallId) {
          continue;
        }
        if (parentToolCallId) {
          const builder = ensureSubagentBuilder(parentToolCallId);
          builder.message = {
            ...builder.message,
            text: content,
            ...attachments?.length ? { attachments } : {}
          };
        } else {
          flushParent();
          const turnId = e.id ?? messageId;
          parentBuilder = newTurnBuilder(turnId, content, { attachments, model: currentModel, agent: currentAgent, startedAt: currentEventTimestamp });
          rootRequestActive = true;
          if (pendingAutoModeResolved) {
            parentBuilder.usage = {
              model: pendingAutoModeResolved.chosenModel,
              _meta: { autoModeResolved: pendingAutoModeResolved }
            };
            pendingAutoModeResolved = void 0;
          }
        }
        break;
      }
      case "assistant.message": {
        const d = e.data;
        const messageId = d.messageId ?? d.interactionId ?? "";
        const content = d.content ?? "";
        const reasoningText = d.reasoningText;
        const hasToolRequests = !!d.toolRequests && d.toolRequests.length > 0;
        const parentToolCallId = resolveParentToolCallId(e.agentId, d.parentToolCallId);
        if (!parentToolCallId && parentTurnTerminated && parentTurnState === "error" /* Error */ || parentToolCallId && terminatedSubagentTurns.has(parentToolCallId) && subagentTurnStates.get(parentToolCallId) === "error" /* Error */) {
          break;
        }
        if (!content && !reasoningText && !hasToolRequests) {
          if (!parentToolCallId && parentBuilder && !parentTurnTerminated) {
            parentTurnState = "complete" /* Complete */;
            touch(parentBuilder);
          }
          break;
        }
        const fallbackTurnId = e.id ?? messageId;
        const builder = targetBuilderFor(parentToolCallId) ?? (parentBuilder = newTurnBuilder(fallbackTurnId, "", { startedAt: currentEventTimestamp }));
        if (reasoningText) {
          builder.responseParts.push({
            kind: "reasoning" /* Reasoning */,
            id: generateUuid(),
            content: reasoningText
          });
        }
        if (content) {
          builder.responseParts.push({
            kind: "markdown" /* Markdown */,
            id: generateUuid(),
            content
          });
        }
        if (!parentToolCallId && builder === parentBuilder && !parentTurnTerminated) {
          parentTurnState = hasToolRequests ? "cancelled" /* Cancelled */ : "complete" /* Complete */;
        }
        if (d.toolRequests?.length) {
          appendFallbackToolRequests(builder, d.toolRequests, parentToolCallId);
        }
        break;
      }
      case "system.notification": {
        const notification = buildCopilotSystemNotification(e);
        if (!notification) {
          break;
        }
        if (parentBuilder && (rootAssistantTurnActive || notification.startsTurn && !(parentTurnTerminated && parentTurnState === "error" /* Error */))) {
          rootRequestActive ||= notification.startsTurn;
          parentBuilder.responseParts.push({
            kind: "systemNotification" /* SystemNotification */,
            content: notification.messageText
          });
          touch(parentBuilder);
        } else if (notification.startsTurn) {
          flushParent();
          parentBuilder = newTurnBuilder(e.id ?? generateUuid(), notification.messageText, {
            origin: "systemNotification" /* SystemNotification */,
            startedAt: currentEventTimestamp
          });
          rootRequestActive = true;
        }
        break;
      }
      case "session.error": {
        const parentToolCallId = resolveParentToolCallId(e.agentId, void 0);
        if (e.agentId) {
          if (!parentToolCallId || terminatedSubagentTurns.has(parentToolCallId)) {
            break;
          }
          const builder = ensureSubagentBuilder(parentToolCallId);
          subagentTurnStates.set(parentToolCallId, "error" /* Error */);
          terminatedSubagentTurns.add(parentToolCallId);
          builder.responseParts.push(createErrorResponsePart(buildChatErrorInfoFromCopilotSdkFields(e.data)));
          touch(builder);
          break;
        }
        if (parentBuilder && !parentTurnTerminated) {
          rootAssistantTurnActive = false;
          rootRequestActive = false;
          parentTurnState = "error" /* Error */;
          parentTurnTerminated = true;
          parentBuilder.responseParts.push(createErrorResponsePart(buildChatErrorInfoFromCopilotSdkFields(e.data), true));
          parentBuilder.waitingStartedAt = currentEventTimestamp;
          touch(parentBuilder);
        }
        break;
      }
      case "subagent.started": {
        break;
      }
      case "tool.execution_start": {
        const parentToolCallId = resolveParentToolCallId(e.agentId, e.data.parentToolCallId);
        if (!parentToolCallId && parentBuilder && !parentTurnTerminated) {
          parentTurnState = "cancelled" /* Cancelled */;
          touch(parentBuilder);
        }
        break;
      }
      case "tool.execution_complete": {
        const d = e.data;
        const info = toolInfoByCallId.get(d.toolCallId);
        if (!info) {
          continue;
        }
        toolInfoByCallId.delete(d.toolCallId);
        const parentToolCallId = resolveParentToolCallId(e.agentId, d.parentToolCallId);
        if (!parentToolCallId && parentTurnTerminated && parentTurnState === "error" /* Error */ || parentToolCallId && terminatedSubagentTurns.has(parentToolCallId) && subagentTurnStates.get(parentToolCallId) === "error" /* Error */) {
          break;
        }
        if (isTaskCompleteTool(info.toolName)) {
          const builder2 = targetBuilderFor(parentToolCallId);
          if (!builder2) {
            continue;
          }
          const summary = getTaskCompleteMarkdown(info.parameters, d.error?.message ?? d.result?.content);
          if (summary) {
            builder2.responseParts.push({
              kind: "markdown" /* Markdown */,
              id: generateUuid(),
              content: summary
            });
          }
          if (!parentToolCallId && d.success && builder2 === parentBuilder && !parentTurnTerminated) {
            parentTurnState = "complete" /* Complete */;
            rootRequestActive = false;
          }
          continue;
        }
        const builder = targetBuilderFor(parentToolCallId);
        if (!builder) {
          continue;
        }
        const completedPart = makeCompletedToolCallPart(d, info, sessionUriStr, providerId, rawSessionId, routingChatUri, storedEdits, subagentInfoByToolCallId.get(d.toolCallId), workingDirectory);
        builder.responseParts.push(completedPart);
        if (!parentToolCallId && subagentInfoByToolCallId.has(d.toolCallId)) {
          flushSubagent(d.toolCallId);
        }
        break;
      }
      case "skill.invoked": {
        const synth = synthesizeSkillToolCall(e.data, e.id);
        const parentToolCallId = resolveParentToolCallId(e.agentId, void 0);
        const builder = targetBuilderFor(parentToolCallId) ?? (parentBuilder = newTurnBuilder(generateUuid(), "", { startedAt: currentEventTimestamp }));
        if (!parentToolCallId && builder === parentBuilder) {
          parentTurnState = "cancelled" /* Cancelled */;
        }
        builder.responseParts.push({
          kind: "toolCall" /* ToolCall */,
          toolCall: {
            status: "completed" /* Completed */,
            toolCallId: synth.toolCallId,
            toolName: synth.toolName,
            displayName: synth.displayName,
            invocationMessage: synth.invocationMessage,
            success: true,
            pastTenseMessage: synth.pastTenseMessage,
            confirmed: "not-needed" /* NotNeeded */
          }
        });
        break;
      }
      case "abort": {
        const parentToolCallId = resolveParentToolCallId(e.agentId, void 0);
        if (parentToolCallId) {
          if (!terminatedSubagentTurns.has(parentToolCallId)) {
            subagentTurnStates.set(parentToolCallId, "cancelled" /* Cancelled */);
          }
        } else {
          rootAssistantTurnActive = false;
          rootRequestActive = false;
          if (parentBuilder && !parentTurnTerminated) {
            parentTurnState = "cancelled" /* Cancelled */;
            parentTurnTerminated = true;
            touch(parentBuilder);
          }
        }
        break;
      }
      case "session.idle":
        rootRequestActive = false;
        break;
      default:
        break;
    }
  }
  if (options && !(options instanceof URI) && options.interruptedTurnError && parentBuilder && rootRequestActive && parentTurnState !== "error" /* Error */) {
    parentBuilder.responseParts.push(createErrorResponsePart(options.interruptedTurnError, true));
    parentTurnState = "error" /* Error */;
  }
  flushParent();
  for (const parentToolCallId of [...subagentBuilders.keys()]) {
    flushSubagent(parentToolCallId);
  }
  return { turns, subagentTurnsByToolCallId: subagentTurns };
  function appendFallbackToolRequests(builder, toolRequests, parentToolCallId) {
    for (const request of toolRequests) {
      const completion = completionsByCallId.get(request.toolCallId);
      if (completion && toolInfoByCallId.has(request.toolCallId)) {
        continue;
      }
      const info = toolInfoByCallId.get(request.toolCallId) ?? makeToolStartInfo(request.name, request.arguments, parentToolCallId, workingDirectory, request);
      if (!info) {
        continue;
      }
      if (isTaskCompleteTool(info.toolName)) {
        const summary = getTaskCompleteMarkdown(info.parameters, completion?.error?.message ?? completion?.result?.content);
        if (summary) {
          builder.responseParts.push({
            kind: "markdown" /* Markdown */,
            id: generateUuid(),
            content: summary
          });
        }
        if (!parentToolCallId && completion?.success && builder === parentBuilder && !parentTurnTerminated) {
          parentTurnState = "complete" /* Complete */;
          rootRequestActive = false;
        }
        continue;
      }
      builder.responseParts.push(makeCompletedToolCallPart(
        completion ?? { toolCallId: request.toolCallId, success: true },
        info,
        sessionUriStr,
        providerId,
        rawSessionId,
        routingChatUri,
        storedEdits,
        subagentInfoByToolCallId.get(request.toolCallId),
        workingDirectory
      ));
    }
  }
}

function sdkAttachmentsToProtocol(attachments) {
  if (!attachments?.length) {
    return void 0;
  }
  const out = [];
  for (const a of attachments) {
    const converted = sdkAttachmentToProtocol(a);
    if (converted) {
      out.push(converted);
    }
  }
  return out.length > 0 ? out : void 0;
}

function sdkAttachmentToProtocol(attachment) {
  switch (attachment.type) {
    case "file": {
      return {
        type: "resource" /* Resource */,
        uri: URI.file(attachment.path).toString(),
        label: attachment.displayName || basename(attachment.path),
        displayKind: getMediaMime(attachment.path)?.startsWith("image/") ? "image" : "document"
      };
    }
    case "directory": {
      return {
        type: "resource" /* Resource */,
        uri: URI.file(attachment.path).toString(),
        label: attachment.displayName || basename(attachment.path),
        displayKind: "directory"
      };
    }
    case "selection": {
      return {
        type: "resource" /* Resource */,
        uri: URI.file(attachment.filePath).toString(),
        label: attachment.displayName,
        displayKind: "selection",
        selection: { range: attachment.selection }
      };
    }
    case "blob": {
      if (typeof attachment.data !== "string") {
        return void 0;
      }
      const simpleDisplayKind = readSimpleAttachmentDisplayKindFromMimeType(attachment.mimeType);
      if (attachment.mimeType.startsWith("text/plain") || simpleDisplayKind !== void 0) {
        return {
          type: "simple" /* Simple */,
          label: attachment.displayName ?? "attachment",
          modelRepresentation: decodeBase64(attachment.data ?? "").toString(),
          ...simpleDisplayKind !== void 0 ? { displayKind: simpleDisplayKind } : {}
        };
      }
      const displayKind = attachment.mimeType.startsWith("image/") ? "image" : void 0;
      return {
        type: "embeddedResource" /* EmbeddedResource */,
        label: attachment.displayName ?? "attachment",
        data: attachment.data ?? "",
        contentType: attachment.mimeType,
        displayKind
      };
    }
    default:
      return void 0;
  }
}

function makeCompletedToolCallPart(d, info, sessionUriStr, providerId, rawSessionId, chatURI, storedEdits, subagent, workingDirectory) {
  const toolOutput = d.error?.message ?? d.result?.content;
  const content = [];
  if (toolOutput !== void 0) {
    content.push({ type: "text" /* Text */, text: toolOutput });
  }
  appendSdkToolResultContent(
    content,
    d.result?.contents,
    info.toolKind === "terminal" ? { session: sessionUriStr, toolCallId: d.toolCallId, title: info.displayName } : void 0
  );
  const edits = storedEdits?.get(d.toolCallId);
  if (edits) {
    for (const edit of edits) {
      const beforeUri = edit.kind === "rename" && edit.originalPath ? URI.file(edit.originalPath).toString() : URI.file(edit.filePath).toString();
      const afterUri = URI.file(edit.filePath).toString();
      const hasBefore = edit.kind !== "create";
      const hasAfter = edit.kind !== "delete";
      content.push({
        type: "fileEdit" /* FileEdit */,
        before: hasBefore ? {
          uri: beforeUri,
          content: { uri: buildSessionDbUri(sessionUriStr, edit.toolCallId, edit.filePath, "before") }
        } : void 0,
        after: hasAfter ? {
          uri: afterUri,
          content: { uri: buildSessionDbUri(sessionUriStr, edit.toolCallId, edit.filePath, "after") }
        } : void 0,
        diff: edit.addedLines !== void 0 || edit.removedLines !== void 0 ? { added: edit.addedLines, removed: edit.removedLines } : void 0
      });
    }
  }
  if (subagent) {
    content.push({
      type: "subagent" /* Subagent */,
      resource: buildSubagentSessionUri(sessionUriStr, d.toolCallId),
      title: subagent.agentDisplayName,
      agentName: subagent.agentName,
      description: subagent.agentDescription
    });
  }
  const mcpServerName = info.mcpServerName ?? readStringProperty(d, "mcpServerName");
  const mcpToolName = info.mcpToolName ?? readStringProperty(d, "mcpToolName");
  const mcpUiResourceUri = info.mcpUiResourceUri ?? readMcpUiResourceUri(d);
  const mcpUi = mcpUiResourceUri ? {
    resourceUri: mcpUiResourceUri,
    ...mcpServerName ? { channel: buildMcpChannel(chatURI, mcpServerName) } : {}
  } : void 0;
  const tc = {
    status: "completed" /* Completed */,
    toolCallId: d.toolCallId,
    toolName: info.toolName,
    displayName: info.displayName,
    intention: info.intention,
    ...mcpServerName ? { contributor: { kind: "mcp" /* MCP */, customizationId: buildMcpTopLevelCustomizationId(providerId, rawSessionId, mcpServerName) } } : {},
    invocationMessage: info.invocationMessage,
    toolInput: info.toolInput,
    success: d.success,
    pastTenseMessage: getPastTenseMessage(info.toolName, info.displayName, info.parameters, d.success, d.success ? toolOutput : void 0, (path) => resolveToolDisplayPath(path, workingDirectory)),
    content: content.length > 0 ? content : void 0,
    error: d.error,
    confirmed: "not-needed" /* NotNeeded */,
    _meta: toToolCallMeta({
      toolKind: info.toolKind,
      language: info.language,
      subagentDescription: info.subagentDescription,
      subagentAgentName: info.subagentAgentName,
      mcpServerName,
      mcpToolName,
      ui: mcpUi
    })
  };
  return { kind: "toolCall" /* ToolCall */, toolCall: tc };
}
export { tryStringify2, resolveToolDisplayPath, isSyntheticUserMessage, stripPromptScaffolding, appendSdkToolResultContent, newTurnBuilder, readEventTimestamp, readStringProperty, readMcpUiResourceUri, makeToolStartInfo, finalizeTurn, mapSessionEvents, sdkAttachmentsToProtocol, sdkAttachmentToProtocol, makeCompletedToolCallPart };
