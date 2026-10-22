// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostTelemetryReporter.ts
import { isAgentMergeMessage } from "./module-0250.mjs";
import { TelemetryTrustedValue } from "./module-0247.mjs";
import { createDecorator } from "./module-0044.mjs";
import { AgentSession } from "./module-0048.mjs";
import { isAhpChatChannel, isSubagentChatUri, isSubagentSession, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { multiplexProperties } from "./module-0251.mjs";
import { hash } from "./module-0081.mjs";
import { getTelemetryChatSessionId } from "./module-0248.mjs";
import { readAgentErrorTelemetryMeta } from "./module-0249.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0053.mjs";


// src/vs/platform/agentHost/node/agentHostTelemetryReporter.ts
function getMessageOriginTelemetryKind(message) {
  if (message.origin.kind === "systemNotification" /* SystemNotification */ && isAgentMergeMessage(message)) {
    return "agentMerge";
  }
  return message.origin.kind;
}

var turnActivityKindsByActionType = {
  ["chat/turnStarted" /* ChatTurnStarted */]: "chat.turnStarted",
  ["chat/delta" /* ChatDelta */]: "chat.delta",
  ["chat/responsePart" /* ChatResponsePart */]: "chat.responsePart",
  ["chat/toolCallStart" /* ChatToolCallStart */]: "chat.toolCallStart",
  ["chat/toolCallDelta" /* ChatToolCallDelta */]: "chat.toolCallDelta",
  ["chat/toolCallReady" /* ChatToolCallReady */]: "chat.toolCallReady",
  ["chat/toolCallConfirmed" /* ChatToolCallConfirmed */]: "chat.toolCallConfirmed",
  ["chat/toolCallComplete" /* ChatToolCallComplete */]: "chat.toolCallComplete",
  ["chat/toolCallResultConfirmed" /* ChatToolCallResultConfirmed */]: "chat.toolCallResultConfirmed",
  ["chat/toolCallContentChanged" /* ChatToolCallContentChanged */]: "chat.toolCallContentChanged",
  ["chat/toolCallAuthRequired" /* ChatToolCallAuthRequired */]: "chat.toolCallAuthRequired",
  ["chat/toolCallAuthResolved" /* ChatToolCallAuthResolved */]: "chat.toolCallAuthResolved",
  ["chat/turnComplete" /* ChatTurnComplete */]: "chat.turnComplete",
  ["chat/turnCancelled" /* ChatTurnCancelled */]: "chat.turnCancelled",
  ["chat/error" /* ChatError */]: "chat.error",
  ["chat/activityChanged" /* ChatActivityChanged */]: "chat.activityChanged",
  ["chat/workingDirectorySet" /* ChatWorkingDirectorySet */]: "chat.workingDirectorySet",
  ["chat/workingDirectoryRemoved" /* ChatWorkingDirectoryRemoved */]: "chat.workingDirectoryRemoved",
  ["chat/usage" /* ChatUsage */]: "chat.usage",
  ["chat/reasoning" /* ChatReasoning */]: "chat.reasoning",
  ["chat/pendingMessageSet" /* ChatPendingMessageSet */]: "chat.pendingMessageSet",
  ["chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */]: "chat.pendingMessageRemoved",
  ["chat/queuedMessagesReordered" /* ChatQueuedMessagesReordered */]: "chat.queuedMessagesReordered",
  ["chat/draftChanged" /* ChatDraftChanged */]: "chat.draftChanged",
  ["chat/inputRequested" /* ChatInputRequested */]: "chat.inputRequested",
  ["chat/inputAnswerChanged" /* ChatInputAnswerChanged */]: "chat.inputAnswerChanged",
  ["chat/inputCompleted" /* ChatInputCompleted */]: "chat.inputCompleted",
  ["chat/truncated" /* ChatTruncated */]: "chat.truncated",
  ["chat/turnsLoaded" /* ChatTurnsLoaded */]: "chat.turnsLoaded",
  ["session/inputNeededSet" /* SessionInputNeededSet */]: "session.inputNeededSet",
  ["session/inputNeededRemoved" /* SessionInputNeededRemoved */]: "session.inputNeededRemoved"
};

function normalizeTurnActivityKind(activityKind) {
  if (activityKind === "none") {
    return "none";
  }
  return turnActivityKindsByActionType[activityKind] ?? "other";
}

function toTelemetryModel(model, modelTelemetryKind) {
  if (model === void 0) {
    return void 0;
  }
  if (modelTelemetryKind === "trusted") {
    return new TelemetryTrustedValue(model);
  }
  return modelTelemetryKind === "byok" ? "byokModel" : "unknown";
}

function toInitiatorTelemetry(clientContext) {
  return {
    ...clientContext?.clientType !== void 0 && clientContext.clientType !== "unknown" /* Unknown */ ? { initiatorClientType: clientContext.clientType } : {},
    ...clientContext?.connectionKind !== void 0 && clientContext.connectionKind !== "unknown" /* Unknown */ ? { initiatorConnectionKind: clientContext.connectionKind } : {},
    ...clientContext?.transportKind !== void 0 && clientContext.transportKind !== "unknown" /* Unknown */ ? { initiatorTransportKind: clientContext.transportKind } : {},
    ...clientContext?.hostLaunchKind !== void 0 && clientContext.hostLaunchKind !== "unknown" /* Unknown */ ? { hostLaunchKind: clientContext.hostLaunchKind } : {},
    ...clientContext?.machineId ? { initiatorMachineId: clientContext.machineId } : {},
    ...clientContext?.devDeviceId ? { initiatorDevDeviceId: clientContext.devDeviceId } : {}
  };
}

var IAgentHostTelemetryReporter = createDecorator("agentHostTelemetryReporter");

var AgentHostTelemetryReporter = class {
  constructor(_telemetryService) {
    this._telemetryService = _telemetryService;
  }
  /** The restricted GH/MSFT telemetry surface, present when the agent-host telemetry service is wired. */
  get _restricted() {
    const ts = this._telemetryService;
    return typeof ts.sendEnhancedGHTelemetryEvent === "function" ? ts : void 0;
  }
  executionModeChanged(provider, session, previousMode, newMode, turnCount, clientContext) {
    this._telemetryService.publicLog2("agentHost.executionModeChanged", {
      ...toInitiatorTelemetry(clientContext),
      provider,
      agentSessionId: AgentSession.id(session),
      isSubagentSession: isSubagentSession(session),
      previousMode,
      newMode,
      turnCount
    });
  }
  userMessageSent(provider, clientId, clientContext, session, turnId, sessionState, source, message) {
    const attachmentCount = message.attachments?.length ?? 0;
    const activeClients = sessionState?.activeClients ?? [];
    const sessionUri = isAhpChatChannel(session) ? parseRequiredSessionUriFromChatUri(session) : session;
    this._telemetryService.publicLog2("agentHost.userMessageSent", {
      provider,
      hostLaunchKind: clientContext.hostLaunchKind,
      initiatorClientId: clientId,
      initiatorClientType: clientContext.clientType,
      initiatorConnectionKind: clientContext.connectionKind,
      initiatorTransportKind: clientContext.transportKind,
      ...clientContext.machineId ? { initiatorMachineId: clientContext.machineId } : {},
      ...clientContext.devDeviceId ? { initiatorDevDeviceId: clientContext.devDeviceId } : {},
      agentSessionId: AgentSession.id(sessionUri),
      source,
      messageOriginKind: getMessageOriginTelemetryKind(message),
      isSubagentSession: isSubagentSession(sessionUri),
      turnCount: sessionState?.turns.length ?? 0,
      ...activeClients.length > 0 ? {
        activeClientId: activeClients[0].clientId,
        activeClientToolCount: activeClients.reduce((sum, client) => sum + client.tools.length, 0),
        activeClientCustomizationCount: activeClients.reduce((sum, client) => sum + (client.customizations?.length ?? 0), 0)
      } : {},
      attachmentCount
    });
    this._restricted?.sendGHTelemetryEvent("agentHost.userMessageSent", {
      provider,
      initiatorClientType: clientContext.clientType,
      conversationId: AgentSession.id(sessionUri),
      turnId,
      messageOriginKind: getMessageOriginTelemetryKind(message)
    });
  }
  clientConnection(report) {
    this._telemetryService.publicLog2("agentHost.clientConnection", {
      action: report.action,
      hostLaunchKind: report.context.hostLaunchKind,
      clientId: report.clientId,
      clientType: report.context.clientType,
      clientImplementationName: report.clientImplementationName,
      clientImplementationVersion: report.clientImplementationVersion,
      connectionKind: report.context.connectionKind,
      transportKind: report.context.transportKind,
      ...report.context.machineId ? { clientMachineId: report.context.machineId } : {},
      ...report.context.devDeviceId ? { clientDevDeviceId: report.context.devDeviceId } : {},
      protocolVersion: report.protocolVersion,
      isReconnect: report.isReconnect,
      connectedClientCount: report.connectedClientCount,
      connectedTransportCount: report.connectedTransportCount,
      clientTransportCount: report.clientTransportCount,
      connectionDurationMs: report.connectionDurationMs,
      subscriptionCount: report.subscriptionCount
    });
  }
  /**
   * Mirrors the Copilot extension's enhanced GH `request.options.tools` event for the agent-host
   * flow. The extension emits it per LLM request from its model fetcher; the agent host observes
   * the equivalent boundary when an `assistant.message` arrives (one per model call). The
   * `headerRequestId` is the client-minted `x-request-id`, matching the extension. `messagesJson`
   * is the raw tool definitions offered for the call, multiplexed across ~8192-char chunks like
   * the extension, so it lands identically downstream.
   *
   * @param session Session URI string; its id becomes `conversationId`.
   * @param clientRequestId The model call's client-minted `x-request-id`, mapped to the extension's `headerRequestId`. No-ops when absent (e.g. providers that don't surface it).
   * @param tools The tool definitions offered to the model for this call.
   */
  async assistantMessageReceived(session, clientType, clientRequestId, tools) {
    const restricted = this._restricted;
    if (!restricted || !clientRequestId || tools.length === 0) {
      return;
    }
    restricted.sendEnhancedGHTelemetryEvent("request.options.tools", await multiplexProperties({
      headerRequestId: clientRequestId,
      conversationId: AgentSession.id(session),
      initiatorClientType: clientType,
      messagesJson: JSON.stringify(tools)
    }));
  }
  /**
   * Mirrors the Copilot extension's restricted `conversation.messageText` event (the panel-chat
   * prefix of `sendConversationalMessageTelemetry`) for the user's prompt. The extension emits it
   * for every user and model message, carrying the raw message text to the enhanced GH
   * (`copilot_v0_restricted_copilot_event`) and internal MSFT pipelines; the agent host observes
   * the same boundary at the SDK `user.message` event. The text is multiplexed across ~8192-char
   * chunks (`messageText`, `messageText_02`, …) so long prompts land untruncated, matching the
   * extension's `multiplexProperties`.
   *
   * @param session Session URI string; its id becomes `conversationId`.
   * @param content The user's prompt text. No-ops when empty.
   * @param turnIndex The 0-based ordinal of the turn this message belongs to, matching the extension's numeric `turnIndex` (`conversation.turns.length`). CTS parses `turn_index` as an integer, so a numeric ordinal is required here (a non-numeric id lands empty).
   */
  async userMessageText(session, clientType, content, turnIndex) {
    const restricted = this._restricted;
    if (!restricted || !content) {
      return;
    }
    const properties = await multiplexProperties({
      source: "user",
      conversationId: AgentSession.id(session),
      initiatorClientType: clientType,
      turnIndex: String(turnIndex),
      messageText: content
    });
    const measurements = { messageCharLen: content.length };
    restricted.sendEnhancedGHTelemetryEvent("conversation.messageText", properties, measurements);
    restricted.sendInternalMSFTTelemetryEvent("conversation.messageText", properties, measurements);
  }
  /**
   * The model-message counterpart to {@link userMessageText}. Emitted when an `assistant.message`
   * arrives (the agent host's per-model-call boundary), carrying the assistant's response text.
   * `headerRequestId` is filled with the model call's client-minted `x-request-id`, matching the
   * extension. VS Code-only enrichment dims (code-block languages/counts) are not reconstructed here.
   *
   * @param session Session URI string; its id becomes `conversationId`.
   * @param content The assistant's response text. No-ops when empty.
   * @param turnIndex The 0-based ordinal of the turn this message belongs to, matching the extension's numeric `turnIndex` (`conversation.turns.length`). CTS parses `turn_index` as an integer, so a numeric ordinal is required here.
   * @param clientRequestId The model call's client-minted `x-request-id`, mapped to `headerRequestId`.
   */
  async modelMessageText(session, clientType, content, turnIndex, clientRequestId) {
    const restricted = this._restricted;
    if (!restricted || !content) {
      return;
    }
    const properties = await multiplexProperties({
      source: "model",
      conversationId: AgentSession.id(session),
      initiatorClientType: clientType,
      turnIndex: String(turnIndex),
      ...clientRequestId ? { headerRequestId: clientRequestId } : {},
      messageText: content
    });
    const measurements = { messageCharLen: content.length };
    restricted.sendEnhancedGHTelemetryEvent("conversation.messageText", properties, measurements);
    restricted.sendInternalMSFTTelemetryEvent("conversation.messageText", properties, measurements);
  }
  /**
   * Emits the local-compatible tool-call aggregate on standard and restricted telemetry channels.
   */
  async toolCallDetails(report) {
    if (report.availableTools.length === 0) {
      return;
    }
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    const conversationId = AgentSession.id(session);
    const toolCounts = JSON.stringify(report.toolCounts);
    this._telemetryService.publicLog2("toolCallDetails", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId: conversationId,
      isSubagentSession: isSubagentSession(session),
      conversationId,
      requestId: report.turnId,
      responseType: report.responseType,
      toolCounts,
      model: report.model,
      numRequests: report.numRequests,
      turnIndex: report.turnIndex,
      turnDuration: report.turnDuration,
      messageCharLen: report.messageCharLen,
      availableToolCount: report.availableTools.length,
      totalToolCalls: report.totalToolCalls,
      parallelToolCallRounds: report.parallelToolCallRounds,
      parallelToolCallsTotal: report.parallelToolCallsTotal
    });
    const restricted = this._restricted;
    if (!restricted) {
      return;
    }
    const properties = await multiplexProperties({
      conversationId,
      requestId: report.turnId,
      messageId: report.turnId,
      initiatorClientType: report.clientType,
      responseType: report.responseType,
      ...report.model ? { model: report.model } : {},
      toolCounts,
      availableTools: JSON.stringify(report.availableTools)
    });
    const measurements = {
      numRequests: report.numRequests,
      turnIndex: report.turnIndex,
      turnDuration: report.turnDuration,
      ...report.messageCharLen !== void 0 ? { messageCharLen: report.messageCharLen } : {},
      availableToolCount: report.availableTools.length,
      totalToolCalls: report.totalToolCalls,
      parallelToolCallRounds: report.parallelToolCallRounds,
      parallelToolCallsTotal: report.parallelToolCallsTotal
    };
    restricted.sendEnhancedGHTelemetryEvent("toolCallDetailsExternal", properties, measurements);
    restricted.sendInternalMSFTTelemetryEvent("toolCallDetailsInternal", properties, measurements);
  }
  /** Emits the workbench-compatible tool-approval telemetry from the agent host on the standard telemetry channel. */
  toolApproval(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    const agentSessionId = AgentSession.id(session);
    this._telemetryService.publicLog2("chat.toolApproval", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId,
      isSubagentSession: isSubagentSession(session),
      chatSessionId: agentSessionId,
      requestId: report.turnId,
      toolId: report.toolId,
      toolExtensionId: void 0,
      toolSourceKind: report.toolSourceKind,
      confirmKind: report.confirmKind,
      settingId: void 0,
      lmServiceScope: void 0,
      customButtonKind: void 0,
      confirmationNotNeededReason: report.confirmationNotNeededReason,
      sandboxWrapped: void 0,
      requestUnsandboxedExecution: report.requestUnsandboxedExecution
    });
  }
  /** Emits the extension's restricted `automode.routerDecisionRestricted` event from authoritative SDK fields. */
  autoModeRouterDecision(report) {
    const restricted = this._restricted;
    if (!restricted) {
      return;
    }
    const categoryScores = report.categoryScores ?? {};
    const isBinary = categoryScores.needs_reasoning !== void 0 || categoryScores.no_reasoning !== void 0;
    const scoreKeys = Object.keys(categoryScores).filter((key) => categoryScores[key] !== void 0);
    const candidateModels = report.candidateModels ?? [];
    const properties = {
      conversationId: AgentSession.id(report.session),
      vscodeRequestId: report.turnId,
      initiatorClientType: report.clientType,
      ...report.predictedLabel !== void 0 ? { predictedLabel: report.predictedLabel } : {},
      ...report.routingMethod !== void 0 ? { routingMethod: report.routingMethod } : {},
      ...report.fallback !== void 0 ? { fallback: String(report.fallback) } : {},
      ...report.fallbackReason !== void 0 ? { fallbackReason: report.fallbackReason } : {},
      candidateModel: candidateModels[0] ?? "",
      chosenModel: report.chosenModel,
      candidateModels: JSON.stringify(candidateModels),
      ...report.availableModels !== void 0 ? { availableModels: JSON.stringify(report.availableModels) } : {},
      ...report.stickyOverride !== void 0 ? { stickyOverrideStr: String(report.stickyOverride) } : {},
      ...report.hasImage !== void 0 ? { hasImage: String(report.hasImage) } : {},
      ...scoreKeys.length > 0 ? {
        [isBinary ? "binaryScores" : "hydraScores"]: JSON.stringify(categoryScores)
      } : {}
    };
    const measurements = {
      ...report.confidence !== void 0 ? { confidence: report.confidence } : {},
      ...report.routerLatencyMs !== void 0 ? { latencyMs: report.routerLatencyMs } : {},
      ...report.endToEndLatencyMs !== void 0 ? { e2eLatencyMs: report.endToEndLatencyMs } : {},
      ...report.stickyOverride !== void 0 ? { stickyOverride: report.stickyOverride ? 1 : 0 } : {},
      ...report.chosenShortfall !== void 0 ? { chosenShortfall: report.chosenShortfall } : {},
      ...categoryScores.needs_reasoning !== void 0 ? { scoreNeedsReasoning: categoryScores.needs_reasoning } : {},
      ...categoryScores.no_reasoning !== void 0 ? { scoreNoReasoning: categoryScores.no_reasoning } : {}
    };
    restricted.sendEnhancedGHTelemetryEvent("automode.routerDecisionRestricted", properties, measurements);
  }
  /**
   * Mirrors the Copilot extension's restricted `skillContentRead` event (`skillTelemetry.ts` ->
   * `sendSkillContentReadTelemetry`) — records which skill file was loaded into the conversation.
   * The extension emits it from the skill/readFile tools; the agent host observes the equivalent
   * boundary at the SDK `skill.invoked` event, whose payload already carries the content (hashed
   * here, never sent raw), the discovery `source`, and the plugin identity. The extension's
   * `skillExtensionId` / `skillExtensionVersion` encode the contributing *VS Code extension*, which
   * does not exist in the agent host; the AH-native provenance is the plugin, so `pluginName` /
   * `pluginVersion` fill those columns. No-ops when the skill name is empty.
   *
   * @param report The invoked skill's metadata (from the SDK `skill.invoked` payload).
   */
  skillContentRead(report) {
    const restricted = this._restricted;
    if (!restricted || !report.name) {
      return;
    }
    const contentHash = report.content ? String(hash(report.content)) : "";
    const skillStorage = report.source ?? "";
    const skillExtensionVersion = report.pluginName ? report.pluginVersion ?? "" : "";
    const plaintextProps = {
      initiatorClientType: report.clientType,
      skillName: report.name,
      skillPath: report.path,
      skillExtensionId: report.pluginName ?? "",
      skillExtensionVersion,
      skillStorage,
      skillContentHash: contentHash
    };
    restricted.sendGHTelemetryEvent("skillContentRead", {
      initiatorClientType: report.clientType,
      skillNameHash: String(hash(report.name)),
      skillExtensionIdHash: report.pluginName ? String(hash(report.pluginName)) : "",
      skillExtensionVersion,
      skillStorage,
      skillContentHash: contentHash
    });
    restricted.sendEnhancedGHTelemetryEvent("skillContentRead", plaintextProps);
    restricted.sendInternalMSFTTelemetryEvent("skillContentRead", plaintextProps);
  }
  async reportRepoInfo(context, report) {
    const restricted = this._restricted;
    if (!restricted) {
      return;
    }
    const properties = {
      initiatorClientType: report.clientType,
      remoteUrl: report.remoteUrl,
      repoId: report.repoId,
      repoType: report.repoType,
      headCommitHash: report.headCommitHash,
      headBranchName: report.headBranchName,
      fileRelativePaths: report.fileRelativePaths,
      diffsJSON: report.diffsJSON,
      result: report.result,
      isActiveRepository: report.isActiveRepository,
      location: report.location,
      telemetryMessageId: report.telemetryMessageId
    };
    const measurements = {
      workspaceFileCount: report.workspaceFileCount,
      changedFileCount: report.changedFileCount,
      diffSizeBytes: report.diffSizeBytes,
      repoIndex: 0,
      repoCount: 1
    };
    const { headBranchName: _, fileRelativePaths: _2, ...internalProperties } = properties;
    const [enhancedProperties, internalMultiplexedProperties] = await Promise.all([
      multiplexProperties(properties),
      multiplexProperties(internalProperties)
    ]);
    restricted.sendEnhancedGHTelemetryEventForContext(context, "request.repoInfo", enhancedProperties, measurements);
    restricted.sendInternalMSFTTelemetryEventForContext(context, "request.repoInfo", internalMultiplexedProperties, measurements);
  }
  turnCompleted(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    const chatSessionId = getTelemetryChatSessionId(report.session);
    const isSubagent = isSubagentChatUri(report.session) || isSubagentSession(session);
    const model = toTelemetryModel(report.model, report.modelTelemetryKind);
    this._telemetryService.publicLog2("agentHost.turnCompleted", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId: AgentSession.id(session),
      chatSessionId,
      isSubagentSession: isSubagent,
      turnId: report.turnId,
      parentTurnId: report.parentTurnId,
      parentToolCallId: report.parentToolCallId,
      timeToFirstProgress: report.timeToFirstProgress,
      totalTime: report.totalTime,
      result: report.result,
      model,
      modelSelectionKind: report.modelSelectionKind,
      isBYOK: report.modelTelemetryKind === void 0 ? void 0 : report.modelTelemetryKind === "byok",
      permissionLevel: report.permissionLevel,
      interactionMode: report.interactionMode,
      messageOriginKind: report.messageOriginKind,
      errorType: report.failure?.error.errorType,
      failureStage: report.failure?.stage,
      isMultiRoot: report.isMultiRoot,
      folderCount: report.folderCount,
      billedNanoAiu: report.billedNanoAiu,
      directPromptTokenCount: report.directPromptTokenCount,
      directPromptCacheTokenCount: report.directPromptCacheTokenCount,
      directCompletionTokenCount: report.directCompletionTokenCount,
      directBilledNanoAiu: report.directBilledNanoAiu,
      modelCallCount: report.modelCallCount
    });
    if (report.failure) {
      const { providerCallId, serviceRequestId } = readAgentErrorTelemetryMeta(report.failure.error);
      this._telemetryService.publicLogError2("agentHost.turnFailed", {
        ...toInitiatorTelemetry(report.clientContext),
        provider: report.provider,
        agentSessionId: AgentSession.id(session),
        chatSessionId,
        isSubagentSession: isSubagent,
        turnId: report.turnId,
        failureStage: report.failure.stage,
        errorType: report.failure.error.errorType,
        errorName: report.failure.errorName,
        errorCode: report.failure.errorCode,
        providerCallId,
        serviceRequestId,
        msg: report.failure.error.message,
        callstack: report.failure.errorStack ?? report.failure.error.stack
      });
    }
  }
  /**
   * Reports a turn that has stopped producing activity for longer than the
   * hang threshold. See {@link AgentHostTurnHangReason} for which reasons are
   * expected waits and which indicate a real hang.
   */
  turnHung(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    this._telemetryService.publicLog2("agentHost.turnHung", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId: AgentSession.id(session),
      chatSessionId: getTelemetryChatSessionId(report.session),
      isSubagentSession: isSubagentChatUri(report.session) || isSubagentSession(session),
      turnId: report.turnId,
      hangReason: report.hangReason,
      isExpected: report.hangReason === "waitingOnUser" || report.hangReason === "runningTool",
      hadAnyProgress: report.hadAnyProgress,
      lastActivityKind: normalizeTurnActivityKind(report.lastActivityKind),
      currentStage: report.currentStage,
      providerDiagnosticState: report.providerDiagnosticState,
      ...report.providerDiagnosticSnapshot?.state === "available" ? {
        providerCallState: report.providerDiagnosticSnapshot.providerCallState,
        providerTurnStarted: report.providerDiagnosticSnapshot.providerTurnStarted,
        providerSessionState: report.providerDiagnosticSnapshot.providerSessionState
      } : {},
      initiatorClientConnectionState: report.initiatorClientConnectionState,
      blockedOn: report.blockedOn,
      toolId: report.toolId,
      toolSourceKind: report.toolSourceKind,
      inFlightToolCallCount: report.inFlightToolCallCount,
      quietTimeMs: report.quietTimeMs,
      turnElapsedMs: report.turnElapsedMs,
      model: toTelemetryModel(report.model, report.modelTelemetryKind),
      modelSelectionKind: report.modelSelectionKind,
      permissionLevel: report.permissionLevel
    });
  }
  /** Paired recovery event for a turn previously reported by {@link turnHung}. */
  hungTurnCompleted(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    this._telemetryService.publicLog2("agentHost.hungTurnCompleted", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId: AgentSession.id(session),
      chatSessionId: getTelemetryChatSessionId(report.session),
      isSubagentSession: isSubagentChatUri(report.session) || isSubagentSession(session),
      turnId: report.turnId,
      hangReason: report.hangReason,
      result: report.result,
      hangReportCount: report.hangReportCount,
      totalTimeMs: report.totalTimeMs,
      timeAfterHangMs: report.timeAfterHangMs
    });
  }
  toolInvoked(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    this._telemetryService.publicLog2("languageModelToolInvoked", {
      ...toInitiatorTelemetry(report.clientContext),
      result: report.result,
      chatSessionId: session,
      toolId: report.toolId,
      toolExtensionId: void 0,
      toolSourceKind: report.toolSourceKind,
      toolCallId: report.toolCallId,
      invocationTimeMs: report.invocationTimeMs,
      provider: report.provider,
      resultSizeInCharacters: report.resultSizeInCharacters,
      turnId: report.turnId,
      model: toTelemetryModel(report.model, report.modelTelemetryKind)
    });
    const event = {
      ...toInitiatorTelemetry(report.clientContext),
      result: report.result,
      agentSessionId: AgentSession.id(session),
      chatSessionId: getTelemetryChatSessionId(report.session),
      isSubagentSession: isSubagentChatUri(report.session) || isSubagentSession(session),
      toolId: report.toolId,
      toolExtensionId: void 0,
      toolSourceKind: report.toolSourceKind,
      toolCallId: report.toolCallId,
      invocationTimeMs: report.invocationTimeMs,
      provider: report.provider,
      resultSizeInCharacters: report.resultSizeInCharacters,
      turnId: report.turnId,
      model: toTelemetryModel(report.model, report.modelTelemetryKind),
      errorCode: report.errorCode,
      msg: report.errorMessage
    };
    this._telemetryService.publicLog2("agentHost.toolInvoked", event);
  }
  askQuestionsToolInvoked(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    this._telemetryService.publicLog2("askQuestionsToolInvoked", {
      ...toInitiatorTelemetry(report.clientContext),
      requestId: report.requestId,
      questionCount: report.questionCount,
      answeredCount: report.answeredCount,
      skippedCount: report.skippedCount,
      freeTextCount: report.freeTextCount,
      recommendedAvailableCount: report.recommendedAvailableCount,
      recommendedSelectedCount: report.recommendedSelectedCount,
      duration: report.duration,
      provider: report.provider,
      agentSessionId: AgentSession.id(session),
      isSubagentSession: isSubagentChatUri(report.session) || isSubagentSession(session)
    });
  }
  toolCallStalled(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    this._telemetryService.publicLog2("agentHost.toolCallStalled", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId: AgentSession.id(session),
      isSubagentSession: isSubagentChatUri(report.session) || isSubagentSession(session),
      blockerKind: report.blockerKind,
      toolId: report.toolId,
      toolSourceKind: report.toolSourceKind,
      stalledTimeMs: report.stalledTimeMs
    });
  }
  stalledToolCallCompleted(report) {
    const session = isAhpChatChannel(report.session) ? parseRequiredSessionUriFromChatUri(report.session) : report.session;
    this._telemetryService.publicLog2("agentHost.stalledToolCallCompleted", {
      ...toInitiatorTelemetry(report.clientContext),
      provider: report.provider,
      agentSessionId: AgentSession.id(session),
      isSubagentSession: isSubagentChatUri(report.session) || isSubagentSession(session),
      blockerKind: report.blockerKind,
      toolId: report.toolId,
      toolSourceKind: report.toolSourceKind,
      result: report.result,
      totalTimeMs: report.totalTimeMs,
      timeAfterStallMs: report.timeAfterStallMs
    });
  }
};

AgentHostTelemetryReporter = __decorateClass([
  __decorateParam(0, ITelemetryService)
], AgentHostTelemetryReporter);
export { getMessageOriginTelemetryKind, normalizeTurnActivityKind, toTelemetryModel, toInitiatorTelemetry, turnActivityKindsByActionType, IAgentHostTelemetryReporter, AgentHostTelemetryReporter };
