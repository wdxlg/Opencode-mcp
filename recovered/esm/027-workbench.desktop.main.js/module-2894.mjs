// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionHandler.ts
import { isCustomizationEnabled } from "./module-2112.mjs";
import { AHP_AUTH_REQUIRED, AHP_NOT_FOUND, ProtocolError } from "./module-1616.mjs";
import { buildChatUri, buildDefaultChatUri, buildSubagentChatUri, getErrorResponsePart, getInlineToolInput, getToolSubagentContent, getTurnError, isChatReadOnly, isDefaultChatUri, isMessageHiddenFromTranscript, mergeSessionWithDefaultChat, parseChatUri, readSessionWorkspaceless, readUsageInfoMeta, withMessageHiddenFromTranscript } from "./module-1007.mjs";
import { equals4 } from "./module-0098.mjs";
import { readToolCallMeta } from "./module-1005.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0038.mjs";
import { BOOLEAN_TRUE_OPTION_ID, activeTurnToProgress, completedToolCallToEditParts, completedToolCallToSerialized, containsAutomaticReplyAnswer, convertProtocolAnswers, convertProtocolPlanReviewResult, createInputRequestCarousel, createInputRequestPlanReview, finalizeToolInvocation, formatTurnResponseDetails, getTerminalContent, getUrlInputRequestPresentation, isSubagentTool, makeAhpTerminalToolSessionId, messageAttachmentsToVariableData, messageToRequestOrigin, messageToVariableData, parseAhpTerminalToolSessionId, rewriteAgentHostLinkTarget, shouldObserveSubagentChat, stringOrMarkdownToString, systemNotificationToChatPart, toolCallAuthenticationServer, toolCallStateToInvocation, toolCallStateToPreparedInvocation, toolCallStateToStreamingInvocation, turnsToHistory, updateRunningToolSpecificData, updateStreamingToolInvocation, usageInfoToAutoModeResolution, usageInfoToChatUsage, usageInfoToQuotas } from "./module-2246.mjs";
import { ChatToolInvocation } from "./module-1190.mjs";
import { Disposable, DisposableMap, DisposableResourceMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { constObservable } from "./module-0061.mjs";
import { Emitter } from "./module-0017.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { transaction } from "./module-0045.mjs";
import { observableFromSubscription } from "./module-2883.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Delayer, disposableTimeout, raceCancellation } from "./module-0036.mjs";
import { autorun, autorunPerKeyedItem } from "./module-0052.mjs";
import { waitForState } from "./module-0056.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { HIDE_AUTO_EXPLAINABILITY_TREATMENT } from "./module-2254.mjs";
import { AgentHostSnapshotController } from "./module-2247.mjs";
import { AgentHostResponseFileChangesProvider } from "./module-2893.mjs";
import { getChatErrorDetailsFromMeta, getCopilotPlanFromEntitlement } from "./module-2233.mjs";
import { getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { readCompletionAttachmentMeta } from "./module-2820.mjs";
import { localize } from "./module-0001.mjs";
import { extUriBiasedIgnorePathCase, isEqual2 } from "./module-0034.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { getAgentSessionProviderIcon } from "./module-0982.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { StopWatch } from "./module-0016.mjs";
import { getErrorCode, isCancellationError } from "./module-0004.mjs";
import { packErrorForTelemetry } from "./module-1828.mjs";
import { isChatAction } from "./module-1614.mjs";
import { CHAT_SUBAGENT_RESOURCE_QUERY_PARAM } from "./module-0964.mjs";
import { compareProtocolVersions } from "./module-2884.mjs";
import { SessionType, isTerminalCommandPrompt } from "./module-0960.mjs";
import { IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { CLIENT_TOOL_SEARCH_REFERENCE_NAME, RUNTIME_TOOL_SEARCH_TOOL_NAME } from "./module-2882.mjs";
import { isCopilotCliSessionType } from "./module-2113.mjs";
import { CLIENT_SEMANTIC_SEARCH_TOOL_ID, SEMANTIC_SEARCH_TOOL_NAME } from "./module-2110.mjs";
import { agentHostMcpServerId, modelRequiresAgentAuthentication, resolveMcpServerAuthentication } from "./module-2130.mjs";
import { ChatElicitationRequestPart } from "./module-2890.mjs";
import { AgentSession, CODEX_AGENT_PROVIDER_ID } from "./module-1106.mjs";
import { generateUuid } from "./module-0190.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId } from "./module-1107.mjs";
import { isInConversationModelChoice } from "./module-2048.mjs";
import { reviveSerializableInputState } from "./module-1193.mjs";
import { ChatMode } from "./module-1470.mjs";
import { AUTO_RAW_MODEL_ID, ILanguageModelsService, getLanguageModelDisplayNameWithProvider } from "./module-0967.mjs";
import { getLanguageModelDisplayNameWithSubscriptionSource } from "./module-2187.mjs";
import { IAgentHostNewSessionFolderService, computeWorkingDirectories } from "./module-2108.mjs";
import { isWorktreeUnderRepository } from "./module-2881.mjs";
import { Schemas } from "./module-0033.mjs";
import { isLocation } from "./module-0164.mjs";
import { ChatTranscriptContextAttachmentDisplayKind, getAgentHostCompletionReferenceKind, isAgentFeedbackVariableEntry, isBrowserViewVariableEntry, isChatReferenceVariableEntry, isChatTranscriptContextVariableEntry, isImageVariableEntry, toChatTranscriptContextAttachmentMeta } from "./module-0979.mjs";
import { BrowserViewAttachmentDisplayKind, BrowserViewAttachmentMetadataKey } from "./module-2236.mjs";
import { AgentHostElementAttachmentDisplayKind, getElementAttachmentCorrelationId, toElementAttachmentMeta } from "./module-2234.mjs";
import { AgentHostSessionReferenceAttachmentDisplayKind, AgentHostSessionReferenceTrajectoryAttachmentDisplayKind, toSessionReferenceAttachmentMeta, toSessionReferenceModelRepresentation } from "./module-2244.mjs";
import { buildHostLocalEventsPath } from "./module-1109.mjs";
import { agentHostAuthority } from "./module-1000.mjs";
import { coerceImageBuffer } from "./module-1194.mjs";
import { AgentFeedbackAttachmentDisplayKind, AgentFeedbackAttachmentMetadataKey } from "./module-2235.mjs";
import { findDeepestContainingWorkingDirectory } from "./module-2880.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalChatService } from "./module-1149.mjs";
import { IAgentHostTerminalService } from "./module-2889.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2107.mjs";
import { IAgentHostSessionWorkingDirectorySynchronizer } from "./module-2891.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { IAgentHostImportConversationStore } from "./module-1477.mjs";
import { ILanguageModelToolsService, stringifyPromptTsxPart } from "./module-0990.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAgentHostActiveClientService } from "./module-2123.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IModelService } from "./module-0080.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatResponseFileChangesService } from "./module-2258.mjs";
import { IPathService } from "./module-0938.mjs";
import { IRemoteAgentHostService } from "./module-1808.mjs";
import { IAgentHostCustomizationService } from "./module-2131.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionHandler.ts
var MAX_INLINED_UNSAVED_EDITOR_BYTES = 1024 * 1024;

var CHAT_ACTIVITY_PROGRESS_ID = "agentHost.chatActivity";

var CUSTOMIZATION_ENABLEMENT_PROTOCOL_VERSION = "0.8.0";

var UNOBSERVED_CLIENT_TOOL_GRACE_MS = 5e3;

function isResumeTurnConfirmationData(value2) {
  return typeof value2 === "object" && value2 !== null && "agentHostResumeTurn" in value2 && value2.agentHostResumeTurn === true;
}

function getMcpAuthenticationRequiredServers(sessionResource, state) {
  const servers = state?.customizations?.flatMap((c) => c.type === "mcpServer" /* McpServer */ ? [c] : c.children?.filter((c2) => c2.type === "mcpServer" /* McpServer */) ?? []) ?? [];
  const toolAuthServerIds = new Set(state?.inputNeeded?.filter((request2) => request2.kind === "toolAuthentication" /* ToolAuthentication */).map((request2) => request2.kind === "toolAuthentication" /* ToolAuthentication */ ? request2.toolCall.contributor.customizationId : void 0).filter((id2) => id2 !== void 0));
  return servers.filter((server) => isCustomizationEnabled(server) && server.state.kind === "authRequired" /* AuthRequired */ && !toolAuthServerIds.has(server.id)).map((server) => {
    const state2 = server.state;
    return {
      id: sessionResource.authority + "/" + server.id,
      name: server.name,
      resource: state2.resource.resource,
      oauthClient: state2.oauthClient,
      authorizationServers: state2.resource.authorization_servers,
      supportedScopes: state2.resource.scopes_supported,
      requiredScopes: state2.requiredScopes,
      reason: state2.reason
    };
  });
}

function parseTimestamp(value2) {
  const timestamp = Date.parse(value2);
  return Number.isFinite(timestamp) ? timestamp : void 0;
}

function getSubagentTiming(state) {
  const turns = state.activeTurn ? [...state.turns, state.activeTurn] : state.turns;
  const starts = turns.map((turn) => turn.startedAt ? Date.parse(turn.startedAt) : void 0).filter((timestamp) => timestamp !== void 0 && Number.isFinite(timestamp));
  const startedAt = starts.length > 0 ? Math.min(...starts) : void 0;
  if (startedAt === void 0 || state.activeTurn) {
    return { startedAt, duration: void 0 };
  }
  const ends = state.turns.flatMap((turn) => {
    const turnStartedAt = turn.startedAt ? Date.parse(turn.startedAt) : void 0;
    return turnStartedAt !== void 0 && Number.isFinite(turnStartedAt) && typeof turn.duration === "number" && Number.isFinite(turn.duration) ? [turnStartedAt + Math.max(0, turn.duration)] : [];
  });
  const endedAt = ends.length > 0 ? Math.max(...ends) : void 0;
  return { startedAt, duration: endedAt !== void 0 ? Math.max(0, endedAt - startedAt) : void 0 };
}

function userOriginMessage(text2, attachments) {
  return attachments?.length ? { text: text2, origin: { kind: "user" /* User */ }, attachments: [...attachments] } : { text: text2, origin: { kind: "user" /* User */ } };
}

function isNotFoundError(err) {
  return err instanceof ProtocolError && err.code === AHP_NOT_FOUND;
}

function unwrapSessionLoadErrorMessage(err) {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : void 0;
  if (!message) {
    return void 0;
  }
  return message.replace(/^Failed to restore session .+?: /, "");
}

function resolveRestoredSubagentChatResource(parentSession, toolCallId, catalogResource, persistedResource) {
  if (catalogResource) {
    return catalogResource;
  }
  if (persistedResource) {
    const parsed = parseChatUri(persistedResource);
    if (parsed?.session === parentSession && parsed.chatId === `subagent/${toolCallId}`) {
      return persistedResource;
    }
  }
  return buildSubagentChatUri(parentSession, toolCallId);
}

function lastTurnModelSelection(state) {
  return lastTurnMessage(state)?.model;
}

function isFirstVisibleProgressPart(part) {
  return part.kind === "markdownContent" || part.kind === "thinking" || part.kind === "toolInvocation";
}

function lastTurnMessage(state) {
  return state?.activeTurn?.message ?? (state && state.turns.length ? state.turns[state.turns.length - 1].message : void 0);
}

function emptyDraftFromLastTurn(state) {
  const message = lastTurnMessage(state);
  if (!message?.model && !message?.agent) {
    return void 0;
  }
  return {
    text: "",
    origin: { kind: "user" /* User */ },
    ...message.model ? { model: message.model } : {},
    ...message.agent ? { agent: message.agent } : {}
  };
}

var DraftSyncState = class {
  constructor(remoteDraft) {
    this._synced = remoteDraft;
    this._remoteModel = remoteDraft?.model;
  }
  get synced() {
    return this._synced;
  }
  get remoteModel() {
    return this._remoteModel;
  }
  applyRemote(remoteDraft) {
    this._synced = remoteDraft;
    this._remoteModel = remoteDraft?.model;
  }
  shouldPublish(outgoing) {
    if (equals4(this._synced, outgoing)) {
      return false;
    }
    this._synced = outgoing;
    return true;
  }
};

function confirmedReasonToProtocol(reason) {
  switch (reason?.type) {
    case 1 /* ConfirmationNotNeeded */:
      return "not-needed" /* NotNeeded */;
    case 2 /* Setting */:
    case 3 /* LmServicePerTool */:
      return "setting" /* Setting */;
    default:
      return "user-action" /* UserAction */;
  }
}

function getClientToolPreApproval(toolCall) {
  if (readToolCallMeta(toolCall).autoApproveBySetting === true) {
    return { type: 2 /* Setting */, id: "autoApprove" /* AutoApprove */ };
  }
  switch (toolCall.status) {
    case "running" /* Running */:
    case "auth-required" /* AuthRequired */:
      switch (toolCall.confirmed) {
        case "not-needed" /* NotNeeded */:
          return { type: 1 /* ConfirmationNotNeeded */ };
        case "setting" /* Setting */:
          return { type: 2 /* Setting */, id: "autoApprove" /* AutoApprove */ };
        case "user-action" /* UserAction */:
          return { type: 4 /* UserAction */ };
      }
  }
  return void 0;
}

function metaWithoutToolSearchCandidates(source) {
  const meta = { ...source._meta };
  delete meta["toolSearchCandidates"];
  return meta;
}

async function resolveToolInput(connection, toolInput) {
  if (toolInput === void 0) {
    return "{}";
  }
  if (typeof toolInput === "string") {
    return toolInput;
  }
  const result = await connection.resourceRead(URI.parse(toolInput.uri));
  return result.encoding === "base64" /* Base64 */ ? decodeBase64(result.data).toString() : result.data;
}

function convertCarouselAnswers(raw, questions = []) {
  const answers = {};
  const questionKinds = new Map(questions.map((question) => [question.id, question.kind]));
  for (const [qId, answer] of Object.entries(raw)) {
    if (typeof answer === "string") {
      answers[qId] = {
        state: "submitted" /* Submitted */,
        value: { kind: "text" /* Text */, value: answer }
      };
    } else if (answer && typeof answer === "object") {
      const multi = answer;
      const single = answer;
      if (Array.isArray(multi.selectedValues)) {
        answers[qId] = {
          state: "submitted" /* Submitted */,
          value: {
            kind: "selected-many" /* SelectedMany */,
            value: multi.selectedValues,
            freeformValues: multi.freeformValue ? [multi.freeformValue] : void 0
          }
        };
      } else if (single.selectedValue && questionKinds.get(qId) === "boolean" /* Boolean */) {
        answers[qId] = {
          state: "submitted" /* Submitted */,
          value: {
            kind: "boolean" /* Boolean */,
            value: single.selectedValue === BOOLEAN_TRUE_OPTION_ID
          }
        };
      } else if (single.selectedValue) {
        answers[qId] = {
          state: "submitted" /* Submitted */,
          value: {
            kind: "selected" /* Selected */,
            value: single.selectedValue,
            freeformValues: single.freeformValue ? [single.freeformValue] : void 0
          }
        };
      } else if (single.freeformValue) {
        answers[qId] = {
          state: "submitted" /* Submitted */,
          value: { kind: "text" /* Text */, value: single.freeformValue }
        };
      }
    }
  }
  return answers;
}

function getPlanReviewAction2(planReview, actionId, actionLabel) {
  if (actionId) {
    const action = planReview.actions.find((a) => a.id === actionId);
    if (action) {
      return action;
    }
  }
  if (actionLabel) {
    return planReview.actions.find((a) => a.label === actionLabel);
  }
  return void 0;
}

function submittedTextAnswer(value2) {
  return {
    state: "submitted" /* Submitted */,
    value: { kind: "text" /* Text */, value: value2 }
  };
}

function submittedSelectedAnswer(value2, feedback) {
  return {
    state: "submitted" /* Submitted */,
    value: {
      kind: "selected" /* Selected */,
      value: value2,
      ...feedback ? { freeformValues: [feedback] } : {}
    }
  };
}

function convertPlanReviewResult(planReview, result) {
  const feedback = result.feedback?.trim();
  if (feedback) {
    const action2 = getPlanReviewAction2(planReview, result.actionId, result.action);
    return {
      response: "accept" /* Accept */,
      answers: {
        [planReview.answerQuestionId]: action2 ? submittedSelectedAnswer(action2.id, feedback) : submittedTextAnswer(feedback)
      }
    };
  }
  if (result.rejected) {
    return { response: "decline" /* Decline */ };
  }
  const action = getPlanReviewAction2(planReview, result.actionId, result.action);
  if (!action) {
    return { response: "decline" /* Decline */ };
  }
  return {
    response: "accept" /* Accept */,
    answers: {
      [planReview.answerQuestionId]: submittedSelectedAnswer(action.id)
    }
  };
}

function inputRequestResponsePartKey(part) {
  return `ir:${part.request.id}:${JSON.stringify({ ...part.request, answers: void 0 })}`;
}

function getChatTitle(state, chatURI) {
  const chat = state.chats.find((chat2) => chat2.resource === chatURI);
  if (!chat) {
    return void 0;
  }
  return chat.title || (isDefaultChatUri(chatURI) ? state.title : void 0);
}

function snapshotInvocationToAdopt(opts, toolCallId) {
  const emitted = opts.snapshotToolCalls?.get(toolCallId);
  return emitted instanceof ChatToolInvocation ? emitted : void 0;
}

var AgentHostChatSession = class extends Disposable {
  constructor(sessionResource, history, title, sessionSubscription, chatSubscription, _promptCacheNotification, _forkSession, _renameSession, inputState, initialProgress, historySubagentObservations, onDispose, interruptActiveResponse, _logService) {
    super();
    this.sessionResource = sessionResource;
    this.history = history;
    this.title = title;
    this._promptCacheNotification = _promptCacheNotification;
    this._forkSession = _forkSession;
    this._renameSession = _renameSession;
    this._logService = _logService;
    this.progressObs = observableValue("agentHostProgress", []);
    this.isCompleteObs = observableValue("agentHostComplete", true);
    this._sessionState = observableValue(this, constObservable(void 0));
    this._chatState = observableValue(this, constObservable(void 0));
    this._promptCacheTracking = this._register(new MutableDisposable());
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._onDidStartServerRequest = this._register(new Emitter());
    this.onDidStartServerRequest = this._onDidStartServerRequest.event;
    this.setStateSubscriptions(sessionSubscription, chatSubscription);
    this.isReadOnly = derived(this, (reader) => {
      const sessionArchived = Boolean((this._sessionState.read(reader).read(reader)?.status ?? 0) & 64 /* IsArchived */);
      return isChatReadOnly(this._chatState.read(reader).read(reader)?.interactivity, sessionArchived);
    });
    const hasActiveTurn = initialProgress !== void 0;
    this.transferredState = inputState ? { editingSession: void 0, inputState } : void 0;
    if (hasActiveTurn) {
      this.isCompleteObs.set(false, void 0);
      this.progressObs.set(initialProgress, void 0);
    }
    this._register(historySubagentObservations);
    this._register(toDisposable(onDispose));
    this.interruptActiveResponseCallback = async () => interruptActiveResponse();
    this.forkSession = this._forkSession;
    this.renameSession = this._renameSession;
  }
  setStateSubscriptions(sessionSubscription, chatSubscription) {
    this._promptCacheTracking.clear();
    this._promptCacheTracking.value = sessionSubscription ? this._promptCacheNotification?.trackSession(this.sessionResource, sessionSubscription) : void 0;
    transaction((tx) => {
      this._sessionState.set(sessionSubscription ? observableFromSubscription(this, sessionSubscription) : constObservable(void 0), tx);
      this._chatState.set(chatSubscription ? observableFromSubscription(this, chatSubscription) : constObservable(void 0), tx);
    });
  }
  dispose() {
    if (!this._store.isDisposed) {
      this._onWillDispose.fire();
    }
    super.dispose();
  }
  /**
   * Registers a disposable to be cleaned up when this session is disposed.
   */
  registerDisposable(disposable) {
    return this._register(disposable);
  }
  /**
   * Appends new progress items to the observable. Used by the reconnection
   * flow to stream ongoing state changes into the chat UI.
   */
  appendProgress(items) {
    const current = this.progressObs.get();
    this.progressObs.set([...current, ...items], void 0);
  }
  /**
   * Marks the active turn as complete.
   */
  complete() {
    this.isCompleteObs.set(true, void 0);
  }
  /**
   * Called by the session handler when a server-initiated turn starts.
   * Resets the progress observable and signals listeners to create a new
   * request+response pair in the chat model. `turnId` is the provider's turn
   * id and is adopted as the chat request id, so features that address a turn
   * by request id (side chats, forks) can resolve it against the host.
   */
  startServerRequest(turnId, prompt, variableData, options3) {
    this._logService.info("[AgentHost] Server-initiated request started");
    transaction((tx) => {
      this.progressObs.set([], tx);
      this.isCompleteObs.set(false, tx);
    });
    this._onDidStartServerRequest.fire({
      id: turnId,
      prompt,
      variableData,
      isSystemInitiated: options3?.isSystemInitiated,
      isHidden: options3?.isHidden,
      timestamp: options3?.timestamp,
      isTerminalRequest: options3?.isTerminalRequest,
      resume: options3?.resume,
      origin: options3?.origin
    });
  }
};

AgentHostChatSession = __decorateClass([
  __decorateParam(13, ILogService)
], AgentHostChatSession);

function offsetToPosition2(text2, offset) {
  let lineNumber = 1;
  let column = 1;
  const limit = Math.min(offset, text2.length);
  for (let i2 = 0; i2 < limit; i2++) {
    if (text2.charCodeAt(i2) === 10) {
      lineNumber++;
      column = 1;
    } else {
      column++;
    }
  }
  return { lineNumber, column };
}

var ActiveClientEntry = class extends Disposable {
  constructor(_scope, clientId, debounceDelay, _getSessionState, _dispatch) {
    super();
    this._scope = _scope;
    this._getSessionState = _getSessionState;
    this._dispatch = _dispatch;
    this._state = observableValue(this, true);
    this._cancellation = new CancellationTokenSource();
    this._reconcileSignal = observableValue(this, 0);
    this._stateSubscription = this._register(new MutableDisposable());
    this._claimRequested = false;
    this._activeClient = _scope.activeClient(clientId);
    this._publishDelayer = this._register(new Delayer(debounceDelay));
    this._register(_scope);
    this._register(toDisposable(() => this._cancellation.dispose(true)));
    this._register(autorun((reader) => {
      if (!this._scope.isResolved.read(reader)) {
        return;
      }
      this._activeClient.read(reader);
      this._reconcileSignal.read(reader);
      this._requestReconciliation();
    }));
  }
  /** Snapshot of the composed active-client view. */
  getActiveClient() {
    return this._activeClient.get();
  }
  /** Resolves once no active-client publish is pending. */
  async whenSettled() {
    await waitForState(this._state, (state) => !state, void 0, this._cancellation.token);
  }
  /** Binds the backend session and requests this client join it. */
  claim(backendSession) {
    this._backendSession = backendSession;
    this._claimRequested = true;
    this._requestReconciliation();
  }
  /** Binds the backend session and reconciles without claiming it. */
  attach(backendSession, sessionSubscription) {
    this._backendSession = backendSession;
    this._stateSubscription.value = sessionSubscription?.onDidChange(() => {
      this._reconcileSignal.set(this._reconcileSignal.get() + 1, void 0);
    });
    this._requestReconciliation();
  }
  _requestReconciliation() {
    if (this._cancellation.token.isCancellationRequested) {
      return;
    }
    if (!this._scope.isResolved.get()) {
      this._state.set(true, void 0);
      return;
    }
    if (!this._backendSession) {
      this._state.set(false, void 0);
      return;
    }
    this._state.set(true, void 0);
    this._publishDelayer.trigger(async () => {
      try {
        if (this._cancellation.token.isCancellationRequested) {
          return;
        }
        const backendSession = this._backendSession;
        if (!backendSession || !this._scope.isResolved.get()) {
          return;
        }
        const activeClient = this._activeClient.get();
        const existing = this._getSessionState(backendSession)?.activeClients.find((client) => client.clientId === activeClient.clientId);
        if (!existing && !this._claimRequested) {
          return;
        }
        if (equals4(existing, activeClient)) {
          this._lastPublished = void 0;
          return;
        }
        if (equals4(this._lastPublished, activeClient)) {
          return;
        }
        this._dispatch(backendSession, {
          type: "session/activeClientSet" /* SessionActiveClientSet */,
          activeClient
        });
        this._lastPublished = activeClient;
      } finally {
        if (this._scope.isResolved.get()) {
          this._state.set(false, void 0);
        }
      }
    }).catch(() => {
    });
  }
};

var AgentHostSessionHandler = class extends Disposable {
  constructor(config, _chatAgentService, _chatService, _chatEditingService, _logService, _workspaceContextService, _instantiationService, _terminalChatService, _agentHostTerminalService, _workingDirectoryResolver, _workingDirectorySynchronizer, _newSessionFolderService, _provisionalService, _importConversationStore, _toolsService, _chatWidgetService, _languageModelsService, _openerService, _activeClientService, _chatEntitlementService, _workspaceTrustRequestService, _workspaceTrustManagementService, _modelService, _workingCopyService, _configurationService, _chatResponseFileChangesService, _pathService, _remoteAgentHostService, _customizationService, _telemetryService, assignmentService) {
    super();
    this._chatAgentService = _chatAgentService;
    this._chatService = _chatService;
    this._chatEditingService = _chatEditingService;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
    this._instantiationService = _instantiationService;
    this._terminalChatService = _terminalChatService;
    this._agentHostTerminalService = _agentHostTerminalService;
    this._workingDirectoryResolver = _workingDirectoryResolver;
    this._workingDirectorySynchronizer = _workingDirectorySynchronizer;
    this._newSessionFolderService = _newSessionFolderService;
    this._provisionalService = _provisionalService;
    this._importConversationStore = _importConversationStore;
    this._toolsService = _toolsService;
    this._chatWidgetService = _chatWidgetService;
    this._languageModelsService = _languageModelsService;
    this._openerService = _openerService;
    this._activeClientService = _activeClientService;
    this._chatEntitlementService = _chatEntitlementService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._modelService = _modelService;
    this._workingCopyService = _workingCopyService;
    this._configurationService = _configurationService;
    this._chatResponseFileChangesService = _chatResponseFileChangesService;
    this._pathService = _pathService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._customizationService = _customizationService;
    this._telemetryService = _telemetryService;
    this._activeSessions = new ResourceMap();
    this._chatURIsBySessionResource = new ResourceMap();
    /** Per-session subscription to chat model pending request changes. */
    this._pendingMessageSubscriptions = this._register(new DisposableResourceMap());
    this._remotePendingMessageProjections = new ResourceSet();
    /** Per-session debounced sync from chat input state to AHP draft state. */
    this._draftSyncSubscriptions = this._register(new DisposableResourceMap());
    /** Per-session subscription watching for server-initiated turns. */
    this._serverTurnWatchers = this._register(new DisposableResourceMap());
    /** Per-session subscription silently resolving existing MCP authentication grants. */
    this._mcpAuthWatchers = this._register(new DisposableResourceMap());
    /**
     * Ownership of actionable protocol requests, keyed by backend session URI
     * string. `inputNeeded` is a session-level queue and the single caller of
     * {@link invokeTool} for client tools, so it must be handled exactly once
     * per backend session no matter how many sibling chat resources (default
     * chat, peer chats, subagent chats) are open against it. Each such resource
     * holds a reference; the shared watcher stays alive while any reference
     * remains and is disposed only when the last one is released.
     */
    this._inputNeededWatchers = /* @__PURE__ */ new Map();
    /**
     * Backend session each open resource's {@link _inputNeededWatchers}
     * reference belongs to, recorded when the reference is installed. Teardown
     * uses this to release the right reference without re-deriving the backend
     * session via {@link _resolveSessionUri}, whose provisional mapping may
     * already be cleared by then.
     */
    this._inputNeededWatcherBackends = new ResourceMap();
    /** One reconciliation owner per active session. */
    this._activeClientEntries = new ResourceMap();
    /** Historical turns with file edits, pending hydration into the editing session. */
    this._pendingHistoryTurns = new ResourceMap();
    /**
     * Requests a turn observer is currently rendering, keyed by
     * {@link _toolCallKey} for tool calls and {@link _inputRequestKey} for chat
     * input requests (the two key shapes differ in arity, so they cannot
     * collide). The value is the claiming observer's session resource, which
     * the session-level responder uses as the chat context when it executes a
     * client tool so the tool runs against the chat that is actually rendering
     * it. The session-level responder defers to those observers so the inline
     * UI stays in charge of answering.
     */
    this._renderedRequests = observableValue(this, /* @__PURE__ */ new Map());
    /** Tool calls whose protocol outcome has already been dispatched. */
    this._resolvedToolCalls = /* @__PURE__ */ new Set();
    /**
     * A single {@link ChatToolInvocation} per client tool call, keyed by
     * {@link _toolCallKey}. Created lazily by whichever of the session-level
     * watcher or the turn observer arrives first, so both act on one object:
     * the observer renders it while the watcher executes it. Entries are
     * dropped once the call resolves so a later call with the same ids is not
     * mistaken for it.
     */
    this._clientToolInvocations = /* @__PURE__ */ new Map();
    /**
     * Live `inputNeeded` requests per tool call, keyed by {@link _toolCallKey}.
     * One tool call is represented by a succession of requests — a confirmation
     * is replaced by a client execution once approved — so the shared state
     * above is only released when the last of them goes away.
     */
    this._clientToolRetainCounts = /* @__PURE__ */ new Map();
    /**
     * Per-session set of MCP server ids that already had an authentication
     * prompt surfaced in the current conversation. A server is removed from the
     * set once it reaches the running state ({@link McpServerStatus.Ready}), so
     * that a later auth requirement for the same server prompts again instead of
     * the prompt repeating on every message.
     */
    this._surfacedMcpAuthServers = new ResourceMap();
    this._pendingMcpAutoAuthentication = /* @__PURE__ */ new Map();
    /** Turn IDs dispatched by this client, used to distinguish server-originated turns. */
    this._clientDispatchedTurnIds = /* @__PURE__ */ new Set();
    this._turnStopWatches = /* @__PURE__ */ new Map();
    /** Active session subscriptions, keyed by backend session URI string. */
    this._sessionSubscriptions = /* @__PURE__ */ new Map();
    /**
     * Working-directory synchronizer registrations, keyed by session URI. Each
     * lives exactly as long as that session's {@link _sessionSubscriptions} entry.
     */
    this._workingDirectoryRegistrations = this._register(new DisposableMap());
    /**
     * Active default-chat subscriptions, keyed by backend session URI string.
     * Multi-chat is not yet surfaced: every session is served by a single
     * implicit default chat that carries the conversation contents (turns,
     * active turn, pending/queued messages, input requests). We subscribe to
     * it alongside the session and merge both into the {@link ISessionWithDefaultChat}
     * view returned by {@link _getSessionState}.
     */
    this._defaultChatSubscriptions = /* @__PURE__ */ new Map();
    /**
     * Active subscriptions for additional (non-default) peer chats, keyed by
     * the chat channel URI string. Populated when a chat widget is opened for
     * a resource that carries a chatId fragment.
     */
    this._additionalChatSubscriptions = /* @__PURE__ */ new Map();
    /**
     * Chat channel URI that owns each observed terminal, keyed by terminal URI.
     * Recorded while observing a terminal tool call so a later claim (e.g.
     * "Continue in Background") can attribute itself to the chat the terminal
     * actually belongs to rather than assuming the session's default chat.
     */
    this._terminalChatURIs = /* @__PURE__ */ new Map();
    /**
     * Backend session URIs with an in-flight {@link provideChatSessionContent}
     * call, keyed by session URI string with a refcount value. While a chat is
     * still hydrating its subscriptions, a sibling chat of the same session
     * closing must not tear down the shared session subscription out from under
     * it (see {@link _releaseChatSessionSubscriptions} / {@link _hasOtherSessionHold}).
     */
    this._hydratingChatSessions = /* @__PURE__ */ new Map();
    /**
     * Whether the `hideAutoExplainability` experiment suppresses Auto's routing
     * row. `undefined` until the treatment resolves — emitting on a guess would
     * append rows to a hidden-cohort turn that cannot be retracted afterwards.
     */
    this._hideAutoExplainability = observableValue("hideAutoExplainability", void 0);
    this._config = config;
    const readHideAutoExplainability = () => assignmentService.getTreatment(HIDE_AUTO_EXPLAINABILITY_TREATMENT).then((hidden) => this._hideAutoExplainability.set(hidden === true, void 0)).catch((err) => {
      this._logService.warn(`[AgentHost] Failed to resolve ${HIDE_AUTO_EXPLAINABILITY_TREATMENT}`, err);
      this._hideAutoExplainability.set(false, void 0);
    });
    this._hideAutoExplainabilityReady = readHideAutoExplainability();
    this._register(assignmentService.onDidRefetchAssignments(() => readHideAutoExplainability()));
    this._register(toDisposable(() => {
      for (const { store } of this._inputNeededWatchers.values()) {
        store.dispose();
      }
      this._inputNeededWatchers.clear();
      this._inputNeededWatcherBackends.clear();
      this._terminalChatURIs.clear();
    }));
    this._register(this._customizationService.onDidChangeCustomizations(() => this._reconcileSurfacedMcpAuthServers()));
    this._register(toDisposable(() => {
      for (const entry of this._activeClientEntries.values()) {
        entry.dispose();
      }
      this._activeClientEntries.clear();
    }));
    this._register(this._terminalChatService.onDidContinueInBackground((terminalToolSessionId) => {
      const parsed = parseAhpTerminalToolSessionId(terminalToolSessionId);
      if (!parsed) {
        return;
      }
      const chat = this._terminalChatURIs.get(parsed.terminal);
      if (!chat) {
        this._logService.warn(`[AgentHost] Continue in background: unknown owning chat for terminal=${parsed.terminal}`);
        return;
      }
      this._logService.info(`[AgentHost] Continue in background: terminal=${parsed.terminal}, session=${parsed.session}`);
      this._config.connection.dispatch(parsed.terminal, {
        type: "terminal/claimed" /* TerminalClaimed */,
        claim: {
          kind: "session" /* Session */,
          session: parsed.session,
          chat
        }
      });
    }));
    this._register(this._chatEditingService.registerEditingSessionProvider(
      config.sessionType,
      {
        createEditingSession: (chatSessionResource) => {
          return this._instantiationService.createInstance(
            AgentHostSnapshotController,
            chatSessionResource,
            config.connectionAuthority
          );
        }
      }
    ));
    this._register(this._chatResponseFileChangesService.registerProvider(
      config.sessionType,
      this._register(new AgentHostResponseFileChangesProvider(
        config.connection,
        config.connectionAuthority,
        (sessionResource) => this._resolveSessionUri(sessionResource),
        (sessionResource) => {
          const chatURI = this._chatURIsBySessionResource.get(sessionResource);
          return chatURI ? URI.parse(chatURI) : void 0;
        },
        this._logService
      ))
    ));
    this._registerAgent();
  }
  static {
    this.DRAFT_SYNC_DEBOUNCE_MS = 500;
  }
  static {
    this.ACTIVE_CLIENT_RECONCILIATION_DEBOUNCE_MS = 5;
  }
  /**
   * Resolves the signed-in user's plan context for chat error formatting.
   * The agent host does not know the user's plan, so quota/rate-limit
   * messages are personalized here from `IChatEntitlementService`.
   */
  _chatErrorContext() {
    const quotas = this._chatEntitlementService.quotas;
    return {
      copilotPlan: getCopilotPlanFromEntitlement(this._chatEntitlementService.entitlement),
      isUsageBasedBilling: quotas.usageBasedBilling,
      quotaResetDate: quotas.resetDate
    };
  }
  async provideChatInputCompletions(sessionResource, params, token) {
    let backendSession;
    if (isUntitledChatSession(sessionResource)) {
      const provisionalSession = await raceCancellation(this._provisionalService.waitForPending(sessionResource), token);
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (!provisionalSession) {
        return void 0;
      }
      backendSession = provisionalSession;
    } else {
      backendSession = this._resolveSessionUri(sessionResource);
    }
    const result = await this._config.connection.completions({
      kind: "userMessage" /* UserMessage */,
      channel: backendSession.toString(),
      text: params.text,
      offset: params.offset
    });
    if (token.isCancellationRequested) {
      return void 0;
    }
    const items = [];
    for (const raw of result.items) {
      const mapped = this._toChatInputCompletionItem(raw, params.text);
      if (mapped) {
        items.push(mapped);
      }
    }
    return { items };
  }
  provideChatInputCompletionTriggerCharacters() {
    return this._config.connection.getCompletionTriggerCharacters();
  }
  _createCompletionItem(raw, text2, attachment, label3) {
    const item = {
      insertText: raw.insertText,
      attachment
    };
    if (label3 !== void 0) {
      item.label = label3;
    }
    if (raw.rangeStart !== void 0) {
      item.start = offsetToPosition2(text2, raw.rangeStart);
    }
    if (raw.rangeEnd !== void 0) {
      item.end = offsetToPosition2(text2, raw.rangeEnd);
    }
    return item;
  }
  _toChatInputCompletionItem(raw, text2) {
    const attachment = raw.attachment;
    switch (attachment.type) {
      case "simple" /* Simple */: {
        const completionMeta = readCompletionAttachmentMeta(attachment);
        if (completionMeta?.kind === "command") {
          return this._createCompletionItem(raw, text2, {
            kind: "command",
            command: completionMeta.command,
            description: completionMeta.description ?? "",
            ...attachment._meta !== void 0 && { _meta: attachment._meta }
          }, attachment.label !== raw.insertText ? attachment.label : void 0);
        }
        if (completionMeta?.kind === "skill") {
          return this._createCompletionItem(raw, text2, {
            kind: "skill",
            uri: URI.parse(completionMeta.uri),
            ...completionMeta.displayName !== void 0 ? { displayName: completionMeta.displayName } : {},
            ...completionMeta.description !== void 0 ? { description: completionMeta.description } : {},
            ...attachment._meta !== void 0 && { _meta: attachment._meta }
          });
        }
        return void 0;
      }
      case "resource" /* Resource */: {
        const uri5 = typeof attachment.uri === "string" ? URI.parse(attachment.uri) : URI.from(attachment.uri);
        return this._createCompletionItem(raw, text2, {
          kind: "resource",
          uri: uri5,
          displayName: attachment.label,
          isDirectory: attachment.displayKind === "directory",
          ...attachment._meta !== void 0 && { _meta: attachment._meta }
        });
      }
      case "chat" /* Chat */: {
        return this._createCompletionItem(raw, text2, {
          kind: "chat",
          uri: URI.parse(attachment.resource),
          endTurn: attachment.endTurn,
          title: attachment.label,
          displayName: attachment.label,
          ...attachment._meta !== void 0 && { _meta: attachment._meta }
        });
      }
      default:
        return void 0;
    }
  }
  updateChatSessionMetadata(sessionResource, metadata) {
    const backendSession = this._resolveSessionUri(sessionResource);
    const state = this._getSessionState(backendSession.toString());
    if (state) {
      this._config.connection.dispatch(backendSession.toString(), {
        type: "session/metaChanged" /* SessionMetaChanged */,
        _meta: { ...state._meta, ...metadata }
      });
      return;
    }
    this._provisionalService.setSessionCreationMetadata(sessionResource, {
      ...this._provisionalService.getInitialSessionMetadata(sessionResource) ?? {},
      ...metadata
    });
  }
  async provideChatSessionContent(sessionResource, token) {
    if (sessionResource.path.substring(1).startsWith("untitled-")) {
      throw new Error(`Agent host chat sessions must be created by the sessions provider: ${sessionResource.toString()}`);
    }
    const resolvedSession = this._resolveSessionUri(sessionResource);
    let chatURI;
    const isNewSession = this._isNewSessionResource(sessionResource);
    this._logService.trace(`[AgentHost] provideChatSessionContent start: ${resolvedSession.toString()} (isNewSession=${isNewSession})`);
    const history = [];
    let initialProgress;
    let initialResponsePartCount = 0;
    let activeTurnId;
    let chatTitle;
    let draftInputState;
    let sessionSubscription;
    let chatSubscription;
    const historySubagentObservations = new DisposableStore();
    const hydrationKey = resolvedSession.toString();
    if (isNewSession) {
      this._ensureActiveClientEntry(sessionResource);
    }
    this._hydratingChatSessions.set(hydrationKey, (this._hydratingChatSessions.get(hydrationKey) ?? 0) + 1);
    try {
      if (!isNewSession) {
        try {
          const sub = this._ensureSessionSubscription(resolvedSession.toString());
          sessionSubscription = sub;
          await this._whenSubscriptionHydrated(sub, token);
          if (sub.value instanceof Error) {
            throw sub.value;
          }
          this._logService.trace(`[AgentHost] provideChatSessionContent: session state hydrated for ${resolvedSession.toString()}`);
          const rawState = this._getRawSessionState(resolvedSession.toString());
          if (!rawState) {
            throw new Error(`Session state did not hydrate for ${resolvedSession.toString()}`);
          }
          chatURI = this._resolveChatUriFromState(sessionResource, rawState);
          this._setChatURI(sessionResource, chatURI);
          const chatSub = this._ensureChatSubscription(resolvedSession.toString(), chatURI);
          chatSubscription = chatSub;
          await this._whenSubscriptionHydrated(chatSub, token);
          this._logService.trace(`[AgentHost] provideChatSessionContent: chat state hydrated for ${chatURI}`);
          const sessionState = this._getSessionState(resolvedSession.toString(), chatURI);
          if (sessionState) {
            chatTitle = getChatTitle(sessionState, chatURI);
            const draft = sessionState.draft ?? emptyDraftFromLastTurn(sessionState);
            draftInputState = this._draftToInputState(sessionResource, draft);
            if (!sessionState.draft && draft) {
              this._config.connection.dispatch(chatURI, { type: "chat/draftChanged" /* ChatDraftChanged */, draft });
            }
            const fallbackRawModelId = lastTurnModelSelection(sessionState)?.id;
            await this._hideAutoExplainabilityReady;
            const lookup = this._createTurnModelLookup(sessionResource, fallbackRawModelId);
            const allowTurnResume = !this._isChatReadOnly(resolvedSession.toString(), chatURI);
            history.push(...turnsToHistory(
              resolvedSession,
              sessionState.turns,
              this._config.agentId,
              this._config.connectionAuthority,
              lookup,
              this._chatErrorContext(),
              this._config.connection.initializeResult.get()?.terminalCommandPrefix,
              this._config.connection.resourceUris,
              this._config.provider,
              (turn) => this._getTurnErrorDetails(turn, allowTurnResume)
            ));
            this._logService.trace(`[AgentHost] provideChatSessionContent: converted ${sessionState.turns.length} turn(s) into ${history.length} history item(s) for ${resolvedSession.toString()}`);
            await this._enrichHistoryWithSubagentCalls(history, resolvedSession, sessionResource, sessionState, historySubagentObservations);
            this._logService.trace(`[AgentHost] provideChatSessionContent: subagent enrichment done for ${resolvedSession.toString()}`);
            if (sessionState.turns.length > 0) {
              this._pendingHistoryTurns.set(sessionResource, sessionState.turns);
            }
            if (sessionState.activeTurn) {
              activeTurnId = sessionState.activeTurn.id;
              const activeRawModelId = sessionState.activeTurn.usage?.model ?? fallbackRawModelId;
              history.push({
                id: sessionState.activeTurn.id,
                type: "request",
                prompt: sessionState.activeTurn.message.text,
                participant: this._config.agentId,
                modelId: lookup.toLanguageModelId(activeRawModelId),
                timestamp: parseTimestamp(sessionState.activeTurn.startedAt),
                variableData: messageToVariableData(sessionState.activeTurn.message, this._config.connectionAuthority),
                isSystemInitiated: sessionState.activeTurn.message.origin.kind === "systemNotification" /* SystemNotification */,
                origin: messageToRequestOrigin(resolvedSession, sessionState.activeTurn.message, this._config.agentId, this._config.provider)
              });
              history.push({
                type: "response",
                parts: [],
                participant: this._config.agentId,
                details: lookup.toResponseDetails(activeRawModelId, sessionState.activeTurn.usage)
              });
              initialProgress = activeTurnToProgress(
                resolvedSession,
                sessionState.activeTurn,
                this._config.connectionAuthority,
                sessionResource.authority,
                this._otherClientToolInvocationOptions(resolvedSession, chatURI, sessionState.activeTurn.id),
                lookup,
                this._config.connection.resourceUris
              );
              initialResponsePartCount = sessionState.activeTurn.responseParts.length;
              const actualModelId = this._toLanguageModelId(sessionResource, sessionState.activeTurn.usage?.model);
              if (actualModelId) {
                for (const p of initialProgress) {
                  if (p.kind === "usage") {
                    p.actualModelId = actualModelId;
                  }
                }
              }
              this._logService.info(`[AgentHost] Reconnecting to active turn ${activeTurnId} for session ${resolvedSession.toString()}`);
            }
          }
        } catch (err) {
          this._logService.warn(`[AgentHost] Failed to subscribe to existing session: ${resolvedSession.toString()}`, err);
          if (history.length === 0 && !isNotFoundError(err)) {
            history.push({
              type: "request",
              prompt: "",
              participant: this._config.agentId,
              isSystemInitiated: true,
              systemInitiatedLabel: localize(9014, null)
            });
            history.push({
              type: "response",
              parts: [],
              participant: this._config.agentId,
              errorDetails: { message: unwrapSessionLoadErrorMessage(err) ?? localize(9013, null) }
            });
          }
        }
      }
    } finally {
      const remaining = (this._hydratingChatSessions.get(hydrationKey) ?? 1) - 1;
      if (remaining > 0) {
        this._hydratingChatSessions.set(hydrationKey, remaining);
      } else {
        this._hydratingChatSessions.delete(hydrationKey);
      }
    }
    let session;
    try {
      session = this._instantiationService.createInstance(
        AgentHostChatSession,
        sessionResource,
        history,
        chatTitle,
        sessionSubscription,
        chatSubscription,
        this._config.promptCacheNotification,
        (request2, token2) => {
          if (!this._getSessionState(resolvedSession.toString())) {
            throw new Error("Cannot fork session before the initial request");
          }
          return this._forkSession(sessionResource, resolvedSession, request2, token2);
        },
        (title, _token) => {
          this._config.connection.dispatch(this._getRenameChatURI(sessionResource, resolvedSession), {
            type: "session/titleChanged" /* SessionTitleChanged */,
            title
          });
          return Promise.resolve();
        },
        draftInputState,
        initialProgress,
        historySubagentObservations,
        () => {
          if (this._activeSessions.get(sessionResource) !== session) {
            return;
          }
          this._activeSessions.delete(sessionResource);
          this._disposeActiveClientEntry(sessionResource);
          this._pendingMessageSubscriptions.deleteAndDispose(sessionResource);
          this._draftSyncSubscriptions.deleteAndDispose(sessionResource);
          this._serverTurnWatchers.deleteAndDispose(sessionResource);
          this._mcpAuthWatchers.deleteAndDispose(sessionResource);
          this._releaseSessionInputNeeded(sessionResource);
          this._pendingHistoryTurns.delete(sessionResource);
          this._surfacedMcpAuthServers.delete(sessionResource);
          const chatURI2 = this._chatURIsBySessionResource.get(sessionResource);
          this._chatURIsBySessionResource.delete(sessionResource);
          if (chatURI2) {
            this._releaseChatSessionSubscriptions(resolvedSession.toString(), chatURI2);
          }
        },
        () => {
          const sessionKey = resolvedSession.toString();
          const chatURI2 = this._chatURIsBySessionResource.get(sessionResource);
          if (!chatURI2) {
            return true;
          }
          const turnId = this._getSessionState(sessionKey, chatURI2)?.activeTurn?.id;
          if (!turnId) {
            return true;
          }
          this._logService.info(`[AgentHost] Cancellation requested for ${sessionKey}, dispatching turnCancelled`);
          this._config.connection.dispatch(chatURI2, {
            type: "chat/turnCancelled" /* ChatTurnCancelled */,
            turnId,
            duration: this._turnDuration(chatURI2, turnId)
          });
          return true;
        }
      );
    } catch (err) {
      historySubagentObservations.dispose();
      this._disposeActiveClientEntry(sessionResource);
      throw err;
    }
    if (this._activeSessions.has(sessionResource)) {
      if (token.isCancellationRequested) {
        this._logService.warn(`[AgentHost] Discarding cancelled session resolution for ${sessionResource.toString()}`);
        return session;
      }
      this._logService.error(`[AgentHost] provideChatSessionContent overwriting active session for ${sessionResource.toString()}`);
    }
    this._activeSessions.set(sessionResource, session);
    this._configureActiveClientReconciliation(sessionResource, resolvedSession, sessionSubscription);
    if (!isNewSession) {
      if (chatURI !== void 0) {
        this._ensurePendingMessageSubscription(sessionResource, resolvedSession);
        this._ensureDraftSyncSubscription(sessionResource, resolvedSession, chatURI);
      }
      if (this._pendingHistoryTurns.has(sessionResource)) {
        if (this._chatService.getSession(sessionResource)) {
          this._ensureSnapshotController(sessionResource);
        } else {
          const sub = this._chatService.onDidCreateModel((model) => {
            if (isEqual2(model.sessionResource, sessionResource)) {
              sub.dispose();
              this._ensureSnapshotController(sessionResource);
            }
          });
          session.registerDisposable(sub);
        }
      }
      if (activeTurnId && initialProgress !== void 0) {
        this._reconnectToActiveTurn(resolvedSession, activeTurnId, session, initialProgress, initialResponsePartCount);
      }
      if (chatURI !== void 0) {
        this._watchForServerInitiatedTurns(resolvedSession, sessionResource);
      }
    }
    this._logService.trace(`[AgentHost] provideChatSessionContent done: ${resolvedSession.toString()} with ${history.length} history item(s)`);
    return session;
  }
  // ---- Agent registration -------------------------------------------------
  _registerAgent() {
    const agentData = {
      id: this._config.agentId,
      name: this._config.agentId,
      fullName: this._config.fullName,
      description: this._config.description,
      extensionId: new ExtensionIdentifier(this._config.extensionId ?? "vscode.agent-host"),
      extensionVersion: void 0,
      extensionPublisherId: "vscode",
      extensionDisplayName: this._config.extensionDisplayName ?? "Agent Host",
      isDefault: false,
      isDynamic: true,
      isCore: true,
      metadata: { themeIcon: getAgentSessionProviderIcon(this._config.sessionType) },
      slashCommands: [],
      locations: ["panel" /* Chat */],
      modes: ["agent" /* Agent */],
      disambiguation: []
    };
    const agentImpl = {
      invoke: async (request2, progress, _history, cancellationToken) => {
        return this._invokeAgent(request2, progress, cancellationToken);
      }
    };
    this._register(this._chatAgentService.registerDynamicAgent(agentData, agentImpl));
  }
  async _invokeAgent(request2, progress, cancellationToken) {
    this._logService.info(`[AgentHost] _invokeAgent called for resource: ${request2.sessionResource.toString()}`);
    const trustFolders = await this._resolveSessionTrustFolders(request2.sessionResource, cancellationToken);
    if (cancellationToken.isCancellationRequested) {
      return {};
    }
    if (trustFolders !== void 0 && !await this._ensureFoldersTrusted(trustFolders)) {
      return {};
    }
    if (cancellationToken.isCancellationRequested) {
      return {};
    }
    const preparingStatus = new MutableDisposable();
    let failureStage = "resolveSession";
    try {
      failureStage = "provisionalSession";
      await raceCancellation(this._provisionalService.waitForPending(request2.sessionResource), cancellationToken);
      if (cancellationToken.isCancellationRequested) {
        return {};
      }
      const resolvedSession = this._resolveSessionUri(request2.sessionResource);
      const sessionKey = resolvedSession.toString();
      const provisionalBackend = this._provisionalService.get(request2.sessionResource);
      if (provisionalBackend) {
        this._ensureSessionSubscription(sessionKey);
      }
      failureStage = "sessionState";
      const existingState = await this._readEagerlyCreatedSessionState(resolvedSession, cancellationToken);
      if (cancellationToken.isCancellationRequested) {
        return {};
      }
      if (!existingState) {
        const imported = this._importConversationStore.take(request2.sessionResource);
        if (imported) {
          preparingStatus.value = disposableTimeout(() => {
            progress([{ kind: "progressMessage", content: new MarkdownString(localize(9009, null)), shimmer: true }]);
          }, 500);
        }
        const model = imported?.model ?? this._createModelSelection(request2.userSelectedModelId, request2.modelConfiguration);
        const initialConfig = {
          ...this._provisionalService.getInitialSessionConfig(),
          ...request2.agentHostSessionConfig
        };
        await this._createAndSubscribe(
          request2.sessionResource,
          model,
          Object.keys(initialConfig).length > 0 ? initialConfig : void 0,
          imported ? { turns: imported.turns, model: imported.model } : void 0,
          (stage) => failureStage = stage
        );
      } else {
        failureStage = "authentication";
        await this._ensureRequiredAuthentication(this._createModelSelection(request2.userSelectedModelId, request2.modelConfiguration));
        failureStage = "subscribeSession";
        const sessionSub = this._ensureSessionSubscription(sessionKey);
        const chatURI = this._resolveChatUriFromState(request2.sessionResource, existingState);
        this._setChatURI(request2.sessionResource, chatURI);
        const chatSub = this._ensureChatSubscription(sessionKey, chatURI);
        this._activeSessions.get(request2.sessionResource)?.setStateSubscriptions(sessionSub, chatSub);
        this._ensurePendingMessageSubscription(request2.sessionResource, resolvedSession);
        this._watchForServerInitiatedTurns(resolvedSession, request2.sessionResource);
        if (request2.agentHostSessionConfig && Object.keys(request2.agentHostSessionConfig).length > 0) {
          this._dispatchAction(resolvedSession, {
            type: "session/configChanged" /* SessionConfigChanged */,
            config: request2.agentHostSessionConfig
          });
        }
      }
      const stopWatch = StopWatch.create(false);
      let firstProgress;
      const measuredProgress = (parts) => {
        preparingStatus.clear();
        if (firstProgress === void 0 && parts.some(isFirstVisibleProgressPart)) {
          firstProgress = stopWatch.elapsed();
        }
        progress(parts);
      };
      failureStage = "prepareTurn";
      const completedTurn = await this._handleTurn(resolvedSession, request2, measuredProgress, cancellationToken, (stage) => failureStage = stage);
      const details = this._getTurnResponseDetails(request2.sessionResource, resolvedSession, completedTurn);
      const errorDetails = this._getTurnErrorDetails(completedTurn);
      return {
        timings: { firstProgress, totalElapsed: stopWatch.elapsed() },
        ...details ? { details } : {},
        ...errorDetails ? { errorDetails } : {}
      };
    } catch (error) {
      if (!isCancellationError(error)) {
        this._reportInvocationFailure(request2, failureStage, error);
      }
      throw error;
    } finally {
      preparingStatus.dispose();
    }
  }
  _reportInvocationFailure(request2, failureStage, error) {
    const packed = packErrorForTelemetry(error);
    const requests = this._chatService.getSession(request2.sessionResource)?.getRequests();
    this._telemetryService.publicLogError2("agentHost.invocationFailed", {
      requestId: request2.requestId,
      provider: this._config.provider,
      failureStage,
      isFirstRequest: requests?.[0]?.id === request2.requestId,
      hasUserSelectedModel: request2.userSelectedModelId !== void 0,
      errorName: error instanceof Error ? error.name : typeof error,
      errorCode: getErrorCode(error),
      msg: packed.msg,
      callstack: packed.callstack
    });
  }
  /**
   * Builds the {@link IChatResponseErrorDetails} for a failed turn so the
   * chat response renders a proper error (and, for quota errors, the upgrade
   * affordance via `ChatQuotaExceededPart`). Returns `undefined` for
   * non-error turns. Falls back to the raw error when no structured chat
   * error was forwarded in `_meta`.
   */
  _getTurnErrorDetails(turn, allowResume = true) {
    const errorPart = getErrorResponsePart(turn);
    const error = getTurnError(turn);
    if (!error) {
      return void 0;
    }
    const isExecutionInterrupted = error.errorType === "executionInterrupted";
    const forwardedDetails = getChatErrorDetailsFromMeta(error, this._chatErrorContext());
    const details = isExecutionInterrupted ? {
      ...forwardedDetails,
      message: error.message,
      isExpectedError: true,
      level: 1 /* Warning */
    } : forwardedDetails ?? { message: localize(9015, null, error.errorType, error.message) };
    if (!allowResume || errorPart?.resumable !== true || details.responseIsFiltered) {
      return details;
    }
    return {
      ...details,
      confirmationButtons: [
        ...details.confirmationButtons ?? [],
        {
          data: { agentHostResumeTurn: true },
          label: isExecutionInterrupted ? localize(9000, null) : localize(9010, null),
          resend: true,
          preserveRequestId: true
        }
      ]
    };
  }
  /**
   * Returns the {@link SessionState} for a session that was eagerly created
   * at folder-pick time, or `undefined` if no such session exists. Uses the
   * unmanaged subscription accessor so we don't accidentally open a fresh
   * subscription (which would issue a duplicate snapshot fetch on the wire,
   * and in tests would synthesise placeholder state via the mock's auto-
   * hydration path).
   *
   * If the eager subscription exists but hasn't received its first snapshot
   * yet (creation in flight), waits for it to hydrate or error before
   * returning. This closes a race where the chat request arrives between
   * `createSession` resolving and the snapshot landing.
   */
  async _readEagerlyCreatedSessionState(resolvedSession, token) {
    const inflight = this._config.connection.getInflightSessionCreate?.(resolvedSession);
    if (inflight) {
      try {
        await inflight;
      } catch {
      }
      if (token.isCancellationRequested) {
        return void 0;
      }
    }
    const sub = this._config.connection.getSubscriptionUnmanaged(1 /* Session */, resolvedSession);
    if (!sub) {
      return void 0;
    }
    if (sub.value !== void 0) {
      return sub.value instanceof Error ? void 0 : sub.value;
    }
    const pinRef = this._config.connection.getSubscription(1 /* Session */, resolvedSession, "AgentHostSessionHandler");
    try {
      await this._whenSubscriptionHydrated(pinRef.object, token);
      const value2 = pinRef.object.value;
      this._logService.info(`[AgentHost] _readEagerlyCreatedSessionState: hydrated value=${value2 === void 0 ? "undefined" : value2 instanceof Error ? `error(${value2.message})` : "state"} cancelled=${token.isCancellationRequested} for ${resolvedSession.toString()}`);
      return value2 instanceof Error ? void 0 : value2;
    } finally {
      pinRef.dispose();
    }
  }
  // ---- Pending message sync -----------------------------------------------
  /**
   * Diffs the chat model's pending requests against the protocol state in
   * `_clientState` and dispatches Set/Removed/Reordered actions as needed.
   */
  _syncPendingMessages(sessionResource, backendSession) {
    if (this._remotePendingMessageProjections.has(sessionResource)) {
      return;
    }
    const chatModel = this._chatService.getSession(sessionResource);
    if (!chatModel) {
      return;
    }
    const session = backendSession.toString();
    const chatURI = this._getChatURI(sessionResource);
    const pending = chatModel.getPendingRequests();
    const protocolState = this._getSessionState(session, chatURI);
    const prevSteering = protocolState?.steeringMessage;
    const prevQueued = protocolState?.queuedMessages ?? [];
    let currentSteering;
    const currentQueued = [];
    for (const p of pending) {
      const variables = p.request.variableData?.variables ?? [];
      const messageAttachments = this._variableEntriesToAttachments(variables, sessionResource, p.request.message.text);
      const attachments = messageAttachments.length > 0 ? messageAttachments : void 0;
      const snapshot = { id: p.request.id, message: userOriginMessage(p.request.message.text, attachments) };
      if (p.kind === "steering" /* Steering */) {
        currentSteering = snapshot;
      } else {
        currentQueued.push(snapshot);
      }
    }
    if (currentSteering) {
      if (currentSteering.id !== prevSteering?.id || !equals4(currentSteering.message, prevSteering.message)) {
        this._dispatchAction(backendSession, {
          type: "chat/pendingMessageSet" /* ChatPendingMessageSet */,
          kind: "steering" /* Steering */,
          id: currentSteering.id,
          message: currentSteering.message
        }, chatURI);
      }
    } else if (prevSteering) {
      this._dispatchAction(backendSession, {
        type: "chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */,
        kind: "steering" /* Steering */,
        id: prevSteering.id
      }, chatURI);
    }
    const currentQueuedIds = new Set(currentQueued.map((q) => q.id));
    for (const prev of prevQueued) {
      if (!currentQueuedIds.has(prev.id)) {
        this._dispatchAction(backendSession, {
          type: "chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */,
          kind: "queued" /* Queued */,
          id: prev.id
        }, chatURI);
      }
    }
    const prevQueuedById = new Map(prevQueued.map((q) => [q.id, q]));
    for (const q of currentQueued) {
      const prev = prevQueuedById.get(q.id);
      if (!prev || !equals4(q.message, prev.message)) {
        this._dispatchAction(backendSession, {
          type: "chat/pendingMessageSet" /* ChatPendingMessageSet */,
          kind: "queued" /* Queued */,
          id: q.id,
          message: q.message
        }, chatURI);
      }
    }
    const updatedProtocol = this._getSessionState(session, chatURI);
    const updatedQueued = updatedProtocol?.queuedMessages ?? [];
    if (updatedQueued.length > 1 && currentQueued.length === updatedQueued.length) {
      const needsReorder = currentQueued.some((q, i2) => q.id !== updatedQueued[i2].id);
      if (needsReorder) {
        this._dispatchAction(backendSession, {
          type: "chat/queuedMessagesReordered" /* ChatQueuedMessagesReordered */,
          order: currentQueued.map((q) => q.id)
        }, chatURI);
      }
    }
  }
  /**
   * Projects protocol pending messages into the chat model.
   * The protocol is authoritative, so matching local state is a no-op.
   */
  _applyRemotePendingMessages(sessionResource, backendSession) {
    if (!this._chatService.getSession(sessionResource)) {
      return;
    }
    const chatURI = this._chatURIsBySessionResource.get(sessionResource);
    if (!chatURI) {
      return;
    }
    const state = this._getSessionState(backendSession.toString(), chatURI);
    if (!state) {
      return;
    }
    const toRemote = (pending, kind) => ({
      id: pending.id,
      kind,
      message: pending.message.text,
      variableData: messageToVariableData(pending.message, this._config.connectionAuthority)
    });
    const remote = [];
    if (state.steeringMessage) {
      remote.push(toRemote(state.steeringMessage, "steering" /* Steering */));
    }
    for (const queued of state.queuedMessages ?? []) {
      remote.push(toRemote(queued, "queued" /* Queued */));
    }
    this._remotePendingMessageProjections.add(sessionResource);
    try {
      this._chatService.syncPendingRequestsFromRemote(sessionResource, remote);
    } finally {
      this._remotePendingMessageProjections.delete(sessionResource);
    }
  }
  _dispatchAction(channel, action, chatURI) {
    const target = isChatAction(action) ? this._requireChatURI(chatURI, action.type) : channel.toString();
    this._config.connection.dispatch(target, action);
  }
  _requireChatURI(chatURI, actionType) {
    if (!chatURI) {
      throw new Error(`Cannot dispatch ${actionType} without a resolved AHP chat channel`);
    }
    return chatURI;
  }
  _resolveChatUriFromState(sessionResource, state) {
    if (sessionResource.fragment) {
      const explicitChatUri = new URLSearchParams(sessionResource.query).get(CHAT_SUBAGENT_RESOURCE_QUERY_PARAM);
      if (explicitChatUri) {
        const parsed = parseChatUri(explicitChatUri);
        if (!parsed || parsed.chatId !== sessionResource.fragment) {
          throw new Error(`Subagent chat URI does not match editor chat '${sessionResource.fragment}'`);
        }
        const owningSession = URI.parse(parsed.session);
        const expectedSession = this._resolveSessionUri(sessionResource);
        if (!isEqual2(owningSession, expectedSession)) {
          throw new Error(`Subagent chat belongs to ${owningSession.toString()}, expected ${expectedSession.toString()}`);
        }
        return explicitChatUri;
      }
      const match2 = state.chats.find((summary) => parseChatUri(summary.resource)?.chatId === sessionResource.fragment);
      if (!match2) {
        throw new Error(`Cannot resolve chat '${sessionResource.fragment}' from session state for ${sessionResource.toString()}`);
      }
      return match2.resource.toString();
    }
    if (!state.defaultChat) {
      throw new Error(`Session ${sessionResource.toString()} has no default chat`);
    }
    return state.defaultChat.toString();
  }
  _setChatURI(sessionResource, chatURI) {
    this._chatURIsBySessionResource.set(sessionResource, chatURI);
  }
  _getChatURI(sessionResource) {
    const chatURI = this._chatURIsBySessionResource.get(sessionResource);
    if (!chatURI) {
      throw new Error(`No AHP chat URI mapped for ${sessionResource.toString()}`);
    }
    return chatURI;
  }
  _getRenameChatURI(sessionResource, session) {
    const mapped = this._chatURIsBySessionResource.get(sessionResource);
    if (mapped) {
      return mapped;
    }
    if (!sessionResource.fragment) {
      return buildDefaultChatUri(session);
    }
    const explicitChat = new URLSearchParams(sessionResource.query).get(CHAT_SUBAGENT_RESOURCE_QUERY_PARAM);
    return explicitChat ?? buildChatUri(session, sessionResource.fragment);
  }
  _getCurrentActiveClient(sessionResource) {
    const entry = this._activeClientEntries.get(sessionResource);
    if (entry) {
      return this._withVersionedCustomizations(entry.getActiveClient());
    }
    return {
      clientId: this._config.connection.clientId,
      tools: [],
      customizations: []
    };
  }
  /**
   * Drop client-published customizations for a host older than list-shaped enablement, which
   * rejects the newer shape outright with `invalid params: missing field 'enabled'`. Temporary;
   * see {@link CUSTOMIZATION_ENABLEMENT_PROTOCOL_VERSION}.
   */
  _withVersionedCustomizations(activeClient) {
    const hostVersion = this._config.connection.initializeResult.get()?.protocolVersion;
    if (!activeClient.customizations?.length || !hostVersion || compareProtocolVersions(hostVersion, CUSTOMIZATION_ENABLEMENT_PROTOCOL_VERSION) >= 0) {
      return activeClient;
    }
    this._logService.warn(`[AgentHost] Host speaks protocol ${hostVersion}; dropping ${activeClient.customizations.length} client customization(s) that require ${CUSTOMIZATION_ENABLEMENT_PROTOCOL_VERSION}.`);
    return { ...activeClient, customizations: [] };
  }
  _ensureActiveClient(sessionResource, backendSession) {
    const entry = this._ensureActiveClientEntry(sessionResource);
    entry.claim(backendSession);
    return entry;
  }
  _ensureActiveClientEntry(sessionResource) {
    const existing = this._activeClientEntries.get(sessionResource);
    if (existing) {
      return existing;
    }
    const scope = this._activeClientService.acquireScope(this._config.sessionType, this._resolveCustomizationScopeRoots(sessionResource));
    const entry = new ActiveClientEntry(
      scope,
      this._config.connection.clientId,
      AgentHostSessionHandler.ACTIVE_CLIENT_RECONCILIATION_DEBOUNCE_MS,
      (backendSession) => this._getSessionState(backendSession.toString()),
      // Reconciliation republishes customizations, so it needs the same gate.
      (backendSession, action) => this._dispatchAction(backendSession, action.type === "session/activeClientSet" /* SessionActiveClientSet */ ? { ...action, activeClient: this._withVersionedCustomizations(action.activeClient) } : action)
    );
    this._activeClientEntries.set(sessionResource, entry);
    return entry;
  }
  _configureActiveClientReconciliation(sessionResource, backendSession, sessionSubscription) {
    const entry = this._ensureActiveClientEntry(sessionResource);
    entry.attach(backendSession, sessionSubscription);
  }
  _disposeActiveClientEntry(sessionResource) {
    const entry = this._activeClientEntries.get(sessionResource);
    if (entry) {
      this._activeClientEntries.delete(sessionResource);
      entry.dispose();
    }
  }
  // ---- Server-initiated turn detection ------------------------------------
  /**
   * Sets up a persistent listener on the session's protocol state that
   * detects server-initiated turns (e.g. auto-consumed queued messages).
   * When a new `activeTurn` appears whose `turnId` was NOT dispatched by
   * this client, it signals the {@link AgentHostChatSession} to create a
   * new request in the chat model, removes the consumed pending request
   * if applicable, and pipes turn progress through `progressObs`.
   */
  _watchForServerInitiatedTurns(backendSession, sessionResource) {
    const sessionStr = backendSession.toString();
    const chatURI = this._getChatURI(sessionResource);
    this._watchForMcpAuthentication(backendSession, sessionResource, chatURI);
    this._watchForSessionInputNeeded(backendSession, sessionResource);
    const currentState = this._getSessionState(sessionStr, chatURI);
    let lastSeenTurnId = currentState?.activeTurn?.id;
    let previousQueuedIds;
    let previousSteeringId = currentState?.steeringMessage?.id;
    let previousTitle = currentState ? getChatTitle(currentState, chatURI) : void 0;
    let previousTurnIds = new Set(currentState?.turns.map((turn) => turn.id) ?? []);
    const disposables = new DisposableStore();
    const turnProgressDisposable = new MutableDisposable();
    disposables.add(turnProgressDisposable);
    const sessionSub = this._ensureSessionSubscription(sessionStr);
    const chatSub = this._ensureChatSubscription(sessionStr, chatURI);
    const onChange = () => {
      const state = this._getSessionState(sessionStr, chatURI);
      if (!state) {
        return;
      }
      const e = { session: sessionStr, state };
      const currentQueuedIds = new Set((e.state.queuedMessages ?? []).map((m) => m.id));
      const currentSteeringId = e.state.steeringMessage?.id;
      if (previousSteeringId && previousSteeringId !== currentSteeringId) {
        this._chatService.removePendingRequest(sessionResource, previousSteeringId);
      }
      previousSteeringId = currentSteeringId;
      const currentTitle = getChatTitle(e.state, chatURI);
      if (currentTitle && currentTitle !== previousTitle) {
        this._chatService.setChatSessionTitle(sessionResource, currentTitle);
      }
      previousTitle = currentTitle;
      const activeTurn = e.state.activeTurn;
      const currentTurnIds = new Set(e.state.turns.map((turn) => turn.id));
      if (!activeTurn) {
        lastSeenTurnId = void 0;
        previousQueuedIds = currentQueuedIds;
        previousTurnIds = currentTurnIds;
        return;
      }
      if (activeTurn.id === lastSeenTurnId) {
        previousQueuedIds = currentQueuedIds;
        previousTurnIds = currentTurnIds;
        return;
      }
      const resumedTurn = previousTurnIds.has(activeTurn.id);
      lastSeenTurnId = activeTurn.id;
      if (this._clientDispatchedTurnIds.has(activeTurn.id)) {
        previousQueuedIds = currentQueuedIds;
        previousTurnIds = currentTurnIds;
        return;
      }
      const chatSession = this._activeSessions.get(sessionResource);
      if (!chatSession) {
        previousQueuedIds = currentQueuedIds;
        previousTurnIds = currentTurnIds;
        return;
      }
      this._logService.info(`[AgentHost] Server-initiated turn detected: ${activeTurn.id}`);
      if (previousQueuedIds) {
        for (const prevId of previousQueuedIds) {
          if (!currentQueuedIds.has(prevId)) {
            this._chatService.removePendingRequest(sessionResource, prevId);
          }
        }
      }
      previousQueuedIds = currentQueuedIds;
      previousTurnIds = currentTurnIds;
      chatSession.startServerRequest(
        activeTurn.id,
        activeTurn.message.text,
        messageToVariableData(activeTurn.message, this._config.connectionAuthority),
        {
          isSystemInitiated: activeTurn.message.origin.kind === "systemNotification" /* SystemNotification */,
          isHidden: isMessageHiddenFromTranscript(activeTurn.message),
          timestamp: parseTimestamp(activeTurn.startedAt),
          isTerminalRequest: isTerminalCommandPrompt(activeTurn.message.text, this._config.connection.initializeResult.get()?.terminalCommandPrefix),
          resume: resumedTurn,
          origin: messageToRequestOrigin(backendSession, activeTurn.message, this._config.agentId, this._config.provider)
        }
      );
      const turnStore = new DisposableStore();
      turnProgressDisposable.value = turnStore;
      this._trackServerTurnProgress(backendSession, activeTurn.id, chatSession, turnStore);
    };
    disposables.add(sessionSub.onDidChange(onChange));
    disposables.add(chatSub.onDidChange(onChange));
    this._serverTurnWatchers.set(sessionResource, disposables);
  }
  _watchForMcpAuthentication(backendSession, sessionResource, chatURI) {
    const sessionSub = this._ensureSessionSubscription(backendSession.toString());
    let previousServers;
    const reconcile = () => {
      const servers = getMcpAuthenticationRequiredServers(sessionResource, this._getSessionState(backendSession.toString(), chatURI));
      if (equals4(previousServers, servers)) {
        return;
      }
      previousServers = servers;
      void this._filterAutoGrantedMcpAuthentication(sessionResource, servers);
    };
    const disposables = new DisposableStore();
    disposables.add(sessionSub.onDidChange(reconcile));
    reconcile();
    this._mcpAuthWatchers.set(sessionResource, disposables);
  }
  _watchForSessionInputNeeded(backendSession, sessionResource) {
    this._inputNeededWatcherBackends.set(sessionResource, backendSession);
    const sessionKey = backendSession.toString();
    const existing = this._inputNeededWatchers.get(sessionKey);
    if (existing) {
      existing.refs.add(sessionResource.toString());
      return;
    }
    const sessionSub = this._ensureSessionSubscription(sessionKey);
    const state = observableFromSubscription(this, sessionSub);
    const store = new DisposableStore();
    this._inputNeededWatchers.set(sessionKey, { store, refs: /* @__PURE__ */ new Set([sessionResource.toString()]) });
    const requests = derivedOpts(
      { equalsFn: equals4 },
      (reader) => (state.read(reader)?.inputNeeded ?? []).map((request2) => {
        if (request2.kind === "toolConfirmation" /* ToolConfirmation */ && request2.toolCall.status === "pending-confirmation" /* PendingConfirmation */ && request2.toolCall.contributor?.kind === "client" /* Client */) {
          return {
            ...request2,
            kind: "toolClientExecution" /* ToolClientExecution */,
            clientId: request2.toolCall.contributor.clientId,
            toolCall: request2.toolCall
          };
        }
        return request2;
      })
    );
    const startedClientToolCalls = /* @__PURE__ */ new Set();
    const clientToolExecutions = /* @__PURE__ */ new Map();
    const releaseClientToolExecution = (key3, execution) => {
      if (clientToolExecutions.get(key3) !== execution) {
        return;
      }
      clientToolExecutions.delete(key3);
      execution.retain.dispose();
      if (execution.activeAttempts === 0) {
        execution.source.dispose();
      }
    };
    store.add(toDisposable(() => {
      for (const execution of clientToolExecutions.values()) {
        execution.source.dispose(true);
        execution.retain.dispose();
      }
      clientToolExecutions.clear();
    }));
    store.add(autorunPerKeyedItem(requests, (request2) => request2.id, (_requestId, request$, itemStore) => {
      const initial = request$.get();
      const chatURI = initial.chat.toString();
      if (!this._isOwnedClientToolRequest(initial)) {
        return;
      }
      const key3 = this._toolCallKey(chatURI, initial.turnId, initial.toolCall.toolCallId);
      const requestLifecycle = itemStore.add(new MutableDisposable());
      itemStore.add(this._retainToolCall(key3));
      {
        let execution = clientToolExecutions.get(key3);
        if (!execution) {
          execution = { source: new CancellationTokenSource(), retain: this._retainToolCall(key3), activeAttempts: 0 };
          clientToolExecutions.set(key3, execution);
        }
        const targetsConfirmation = initial.toolCall.status === "pending-confirmation" /* PendingConfirmation */;
        requestLifecycle.value = toDisposable(() => {
          const state2 = this._clientToolInvocations.get(key3)?.state.get();
          const targetsState = state2?.type === IChatToolInvocation.StateKind.Streaming || state2?.type === (targetsConfirmation ? IChatToolInvocation.StateKind.WaitingForConfirmation : IChatToolInvocation.StateKind.Executing) || execution.activeAttempts > 0 && (state2?.type === IChatToolInvocation.StateKind.Cancelled || state2?.type === IChatToolInvocation.StateKind.Completed);
          if (targetsState) {
            execution.source.cancel();
          }
          if (!targetsConfirmation || state2?.type !== IChatToolInvocation.StateKind.Executing) {
            releaseClientToolExecution(key3, execution);
          }
        });
        let generation = 0;
        let observedRequest;
        let startedRequest;
        let invocationStarted = false;
        const unobservedTimer = itemStore.add(new MutableDisposable());
        itemStore.add(autorun((reader) => {
          const request2 = request$.read(reader);
          const claimant = this._renderedRequests.read(reader).get(key3);
          if (!this._isOwnedClientToolRequest(request2)) {
            generation++;
            observedRequest = void 0;
            startedRequest = void 0;
            invocationStarted = false;
            unobservedTimer.clear();
            return;
          }
          if (startedClientToolCalls.has(key3)) {
            startedRequest = request2;
            unobservedTimer.clear();
            return;
          }
          if (!equals4(observedRequest, request2)) {
            observedRequest = request2;
            if (invocationStarted) {
              return;
            }
            generation++;
            startedRequest = void 0;
            unobservedTimer.clear();
          }
          if (startedRequest) {
            return;
          }
          if (request2.toolCall.toolName === RUNTIME_TOOL_SEARCH_TOOL_NAME && readToolCallMeta(request2.toolCall).toolSearchCandidates === void 0) {
            return;
          }
          const execute = (contextSessionResource) => {
            startedRequest = request2;
            unobservedTimer.clear();
            const requestGeneration = generation;
            execution.activeAttempts++;
            void this._executeClientTool(
              request2,
              contextSessionResource,
              execution.source.token,
              () => requestGeneration === generation && (invocationStarted || equals4(request$.read(void 0), request2)),
              () => {
                if (requestGeneration === generation) {
                  invocationStarted = true;
                  startedClientToolCalls.add(key3);
                }
              }
            ).finally(() => {
              execution.activeAttempts--;
              const invocation = this._clientToolInvocations.get(key3);
              if (execution.activeAttempts === 0 && invocation && IChatToolInvocation.isComplete(invocation)) {
                releaseClientToolExecution(key3, execution);
              } else if (execution.activeAttempts === 0 && clientToolExecutions.get(key3) !== execution) {
                execution.source.dispose();
              }
            });
          };
          if (claimant) {
            execute(claimant);
          } else if (!this._clientToolRequiresConfirmation(request2.toolCall)) {
            execute(void 0);
          } else if (!unobservedTimer.value) {
            const requestGeneration = generation;
            unobservedTimer.value = disposableTimeout(() => {
              if (requestGeneration === generation && !startedRequest) {
                startedRequest = request2;
                startedClientToolCalls.add(key3);
                this._denyClientTool(request2);
              }
            }, UNOBSERVED_CLIENT_TOOL_GRACE_MS);
          }
        }));
      }
    }));
  }
  _isOwnedClientToolRequest(request2) {
    return request2.kind === "toolClientExecution" /* ToolClientExecution */ && request2.clientId === this._config.connection.clientId;
  }
  /**
   * Releases this resource's reference to the shared per-backend-session
   * {@link _watchForSessionInputNeeded} watcher, disposing it only once the
   * last sibling resource has let go.
   */
  _releaseSessionInputNeeded(sessionResource) {
    const backendSession = this._inputNeededWatcherBackends.get(sessionResource);
    this._inputNeededWatcherBackends.delete(sessionResource);
    if (!backendSession) {
      return;
    }
    const sessionKey = backendSession.toString();
    const entry = this._inputNeededWatchers.get(sessionKey);
    if (!entry) {
      return;
    }
    entry.refs.delete(sessionResource.toString());
    if (entry.refs.size === 0) {
      this._inputNeededWatchers.delete(sessionKey);
      entry.store.dispose();
    }
  }
  /**
   * Holds the shared state for a tool call while an `inputNeeded` request
   * references it. Once the host stops asking — the request disappears, or the
   * watcher is disposed — the outcome is settled, so the dispatch-funnel entry
   * and the shared invocation are dropped and a later call with the same ids
   * is never mistaken for this one.
   */
  _retainToolCall(key3) {
    this._clientToolRetainCounts.set(key3, (this._clientToolRetainCounts.get(key3) ?? 0) + 1);
    return toDisposable(() => {
      const remaining = (this._clientToolRetainCounts.get(key3) ?? 1) - 1;
      if (remaining > 0) {
        this._clientToolRetainCounts.set(key3, remaining);
        return;
      }
      this._clientToolRetainCounts.delete(key3);
      this._forgetResolvedToolCall(key3);
      this._clientToolInvocations.delete(key3);
    });
  }
  /**
   * Returns the shared {@link ChatToolInvocation} for a client tool call,
   * creating it on first use via {@link ILanguageModelToolsService.beginToolCall}.
   * `sessionResource` is deliberately omitted so `beginToolCall` does not
   * append progress into a chat model (which throws once the owning request
   * is complete); it still registers the invocation, so a later `invokeTool`
   * with a matching `chatStreamToolCallId` attaches to this same object. The
   * observer that renders the call and the watcher that executes it therefore
   * act on one invocation.
   */
  _ensureClientToolInvocation(chatURI, turnId, toolCallId, toolId, subagentInvocationId) {
    const key3 = this._toolCallKey(chatURI, turnId, toolCallId);
    const existing = this._clientToolInvocations.get(key3);
    if (existing) {
      return existing;
    }
    const invocation = this._toolsService.beginToolCall({
      toolCallId,
      toolId,
      subagentInvocationId,
      sessionResource: void 0,
      force: true
    });
    if (invocation) {
      this._clientToolInvocations.set(key3, invocation);
    }
    return invocation;
  }
  /** The workbench tool a runtime client-tool call maps to, or `undefined` when it is not installed. */
  _resolveClientTool(toolName) {
    const isCopilotSession = isCopilotCliSessionType(this._config.sessionType);
    if (isCopilotSession && toolName === SEMANTIC_SEARCH_TOOL_NAME) {
      return this._toolsService.getTool(CLIENT_SEMANTIC_SEARCH_TOOL_ID);
    }
    const clientToolName = toolName === RUNTIME_TOOL_SEARCH_TOOL_NAME ? CLIENT_TOOL_SEARCH_REFERENCE_NAME : toolName;
    return this._toolsService.getToolByName(clientToolName);
  }
  /**
   * Whether an unclaimed client tool must wait for a rendering observer
   * before running. There is no protocol field for this, so we use the tool's
   * static {@link IToolData.canRequestPreApproval} signal: a tool that might
   * ask for pre-approval could pop a confirmation, which only makes sense
   * inside a live chat request. Limitation: this is a "might" signal — a tool
   * may set it yet auto-approve at runtime — so an unclaimed such tool is
   * conservatively made to wait (and denied on timeout) rather than risk a
   * headless modal nobody can answer. Only consulted for the unclaimed case;
   * a claimed call always runs with context regardless.
   */
  _clientToolRequiresConfirmation(toolCall) {
    return this._resolveClientTool(toolCall.toolName)?.canRequestPreApproval === true;
  }
  /**
   * The one place a client tool is actually invoked. Ensures the shared
   * invocation exists, parses the protocol input (preserving the tool-search
   * candidate handling), invokes the tool, and dispatches the protocol
   * completion. `contextSessionResource` is set when a turn observer is
   * rendering the call: a live chat request then exists, so confirmation
   * renders in the tool part, any pre-approval is honored, and side effects
   * attribute to that observer's chat. Without it the tool runs headlessly,
   * independent of whether the owning turn is live.
   */
  async _executeClientTool(request2, contextSessionResource, token, isCurrent, markInvocationStarted) {
    const chatURI = request2.chat.toString();
    const toolCall = request2.toolCall;
    const toolName = toolCall.toolName;
    const isToolSearch = toolName === RUNTIME_TOOL_SEARCH_TOOL_NAME;
    const toolData = this._resolveClientTool(toolName);
    const completionMeta = isToolSearch ? { _meta: metaWithoutToolSearchCandidates(toolCall) } : {};
    const invocation = toolData ? this._ensureClientToolInvocation(chatURI, request2.turnId, toolCall.toolCallId, toolData.id, void 0) : void 0;
    const fail2 = (message, code) => {
      const pastTenseMessage = localize(8996, null, toolCall.displayName);
      const result2 = {
        content: [],
        toolResultError: message,
        toolResultMessage: pastTenseMessage
      };
      void invocation?.didExecuteTool(result2);
      this._resolveToolCall(chatURI, request2.turnId, toolCall.toolCallId, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId: request2.turnId,
        toolCallId: toolCall.toolCallId,
        result: {
          success: false,
          pastTenseMessage,
          error: { message, code }
        },
        ...completionMeta
      });
    };
    if (!toolData) {
      fail2(localize(8999, null, toolName), "toolUnavailable");
      return;
    }
    if (!invocation) {
      fail2(localize(8995, null, toolName), "invocationFailed");
      return;
    }
    const toolInput = "toolInput" in toolCall ? toolCall.toolInput : void 0;
    let rawInput;
    try {
      rawInput = await resolveToolInput(this._config.connection, toolInput);
    } catch (error2) {
      if (!isCurrent() || token.isCancellationRequested || invocation.state.get().type === IChatToolInvocation.StateKind.Cancelled) {
        return;
      }
      const message = error2 instanceof Error ? error2.message : String(error2);
      this._logService.warn(`[AgentHost] Failed to read client tool input: ${toolName}`, error2);
      fail2(message, "inputReadFailed");
      return;
    }
    if (!isCurrent() || token.isCancellationRequested || invocation.state.get().type === IChatToolInvocation.StateKind.Cancelled) {
      return;
    }
    let parameters;
    try {
      const parsed = JSON.parse(rawInput);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("expected JSON object");
      }
      parameters = parsed;
    } catch {
      fail2(localize(8994, null, toolName), "invalidInput");
      return;
    }
    const toolSearchCandidates = isToolSearch ? readToolCallMeta(toolCall).toolSearchCandidates : void 0;
    if (toolSearchCandidates !== void 0) {
      parameters = { ...parameters, candidateTools: toolSearchCandidates };
    }
    this._logService.info(`[AgentHost] Running client tool: ${toolName} (callId=${toolCall.toolCallId}, withContext=${contextSessionResource !== void 0})`);
    let result;
    let error;
    try {
      markInvocationStarted();
      result = await this._toolsService.invokeTool({
        callId: toolCall.toolCallId,
        toolId: toolData.id,
        parameters,
        context: contextSessionResource ? { sessionResource: contextSessionResource } : void 0,
        chatStreamToolCallId: toolCall.toolCallId,
        preApproved: toolCall.status === "pending-confirmation" /* PendingConfirmation */ ? void 0 : getClientToolPreApproval(toolCall)
      }, async () => 0, token);
    } catch (err) {
      error = err;
    }
    if (!isCurrent() || token.isCancellationRequested || invocation.state.get().type === IChatToolInvocation.StateKind.Cancelled) {
      return;
    }
    if (error !== void 0) {
      if (!isCancellationError(error)) {
        this._logService.warn(`[AgentHost] Client tool failed: ${toolName}`, error);
      }
      result = { content: [], toolResultError: error instanceof Error ? error.message : String(error) };
    }
    this._resolveToolCall(chatURI, request2.turnId, toolCall.toolCallId, {
      type: "chat/toolCallComplete" /* ChatToolCallComplete */,
      turnId: request2.turnId,
      toolCallId: toolCall.toolCallId,
      result: toolResultToProtocol(result ?? { content: [] }, toolName),
      ...completionMeta
    });
  }
  /**
   * Denies a client tool call that needs confirmation but that no sub/agent
   * observer claimed within the grace window: there is no live surface to
   * answer it, so report a failed completion rather than pop a headless
   * modal.
   */
  _denyClientTool(request2) {
    const toolCall = request2.toolCall;
    this._logService.warn(`[AgentHost] Denying client tool ${toolCall.toolName} (callId=${toolCall.toolCallId}): it can request confirmation but no session claimed it within ${UNOBSERVED_CLIENT_TOOL_GRACE_MS}ms`);
    this._resolveToolCall(request2.chat.toString(), request2.turnId, toolCall.toolCallId, {
      type: "chat/toolCallComplete" /* ChatToolCallComplete */,
      turnId: request2.turnId,
      toolCallId: toolCall.toolCallId,
      result: {
        success: false,
        pastTenseMessage: localize(8997, null, toolCall.displayName),
        error: {
          message: localize(8998, null, toolCall.displayName),
          code: "clientUnavailable"
        }
      }
    });
    this._clientToolInvocations.delete(this._toolCallKey(request2.chat.toString(), request2.turnId, toolCall.toolCallId));
  }
  /**
   * Tracks protocol state changes for a specific server-initiated turn and
   * pushes `IChatProgress[]` items into the session's `progressObs`.
   * When the turn finishes, sets `isCompleteObs` to true.
   */
  _trackServerTurnProgress(backendSession, turnId, chatSession, turnDisposables) {
    const chatURI = this._getChatURI(chatSession.sessionResource);
    const cts = new CancellationTokenSource();
    turnDisposables.add(toDisposable(() => cts.dispose(true)));
    turnDisposables.add(this._observeTurn({
      backendSession,
      sessionResource: chatSession.sessionResource,
      chatURI: this._getChatURI(chatSession.sessionResource),
      turnId,
      sink: (parts) => chatSession.appendProgress(parts),
      cancellationToken: cts.token,
      suppressErrorMarkdown: true,
      onTurnEnded: (lastTurn) => {
        const errorDetails = this._getTurnErrorDetails(lastTurn, !this._isChatReadOnly(backendSession.toString(), chatURI));
        if (errorDetails) {
          const response = this._chatService.getSession(chatSession.sessionResource)?.getRequests().find((request2) => request2.id === turnId)?.response;
          response?.setResult({ ...response.result, errorDetails });
        }
        this._completeSessionTurn(backendSession, chatSession.sessionResource, turnId, chatSession);
      }
    }));
  }
  _completeSessionTurn(backendSession, sessionResource, turnId, chatSession = this._activeSessions.get(sessionResource)) {
    if (!chatSession) {
      return;
    }
    const activeTurnId = this._getSessionState(backendSession.toString(), this._getChatURI(sessionResource))?.activeTurn?.id;
    if (activeTurnId === void 0 || activeTurnId === turnId) {
      chatSession.complete();
    }
  }
  _turnStopWatchKey(chatURI, turnId) {
    return `${chatURI}\0${turnId}`;
  }
  _ensureTurnStopWatch(chatURI, turnId) {
    const key3 = this._turnStopWatchKey(chatURI, turnId);
    let stopWatch = this._turnStopWatches.get(key3);
    if (!stopWatch) {
      stopWatch = StopWatch.create(false);
      this._turnStopWatches.set(key3, stopWatch);
    }
    return stopWatch;
  }
  _turnDuration(chatURI, turnId) {
    const elapsed = this._turnStopWatches.get(this._turnStopWatchKey(chatURI, turnId))?.elapsed();
    return typeof elapsed === "number" && Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  }
  _clearTurnStopWatch(chatURI, turnId) {
    this._turnStopWatches.delete(this._turnStopWatchKey(chatURI, turnId));
  }
  // ---- Turn handling (state-driven) ---------------------------------------
  async _handleTurn(session, request2, progress, cancellationToken, onFailureStage) {
    if (cancellationToken.isCancellationRequested) {
      return;
    }
    onFailureStage("prepareTurn");
    if (request2.acceptedConfirmationData?.some(isResumeTurnConfirmationData)) {
      return this._handleResumedTurn(session, request2, progress, cancellationToken);
    }
    await this._workingDirectorySynchronizer.reconcile(session, cancellationToken);
    if (cancellationToken.isCancellationRequested) {
      return;
    }
    const turnId = request2.requestId;
    this._clientDispatchedTurnIds.add(turnId);
    const chatURI = this._getChatURI(request2.sessionResource);
    const turnChannel = chatURI;
    const messageAttachments = await this._convertVariablesToAttachments(request2);
    if (cancellationToken.isCancellationRequested) {
      return;
    }
    this._ensureActiveClient(request2.sessionResource, session);
    const selectedModel = this._createModelSelection(request2.userSelectedModelId, request2.modelConfiguration);
    const requestedAgentUri = request2.modeInstructions?.uri?.toString();
    const chatModel = this._chatService.getSession(request2.sessionResource);
    const protocolState = this._getSessionState(session.toString(), chatURI);
    if (chatModel && protocolState?.turns.length) {
      const previousRequestIndex = chatModel.getRequests().findIndex((i2) => i2.id === request2.requestId) - 1;
      const previousRequest = previousRequestIndex >= 0 ? chatModel.getRequests()[previousRequestIndex] : void 0;
      if (!previousRequest && protocolState.turns.length > 0) {
        const truncateAction = {
          type: "chat/truncated" /* ChatTruncated */
        };
        this._config.connection.dispatch(turnChannel, truncateAction);
      } else {
        const seenAtIndex = protocolState.turns.findIndex((t2) => t2.id === previousRequest.id);
        if (seenAtIndex !== -1 && seenAtIndex < protocolState.turns.length - 1) {
          const truncateAction = {
            type: "chat/truncated" /* ChatTruncated */,
            turnId: previousRequest.id
          };
          this._config.connection.dispatch(turnChannel, truncateAction);
        }
      }
    }
    const turnAction = {
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: withMessageHiddenFromTranscript({
        ...userOriginMessage(request2.message, messageAttachments),
        ...selectedModel ? { model: selectedModel } : {},
        ...requestedAgentUri ? { agent: { uri: requestedAgentUri } } : {}
      }, request2.hideFromTranscript)
    };
    this._ensureTurnStopWatch(turnChannel, turnId);
    onFailureStage("dispatchTurn");
    this._config.connection.dispatch(turnChannel, turnAction);
    this._ensureSnapshotController(request2.sessionResource)?.ensureRequestCheckpoint(request2.requestId);
    onFailureStage("observeTurn");
    return new Promise((resolve3) => {
      const store = new DisposableStore();
      const cancelSub = store.add(cancellationToken.onCancellationRequested(() => {
        cancelSub.dispose();
        this._logService.info(`[AgentHost] Cancellation requested for ${session.toString()}, dispatching turnCancelled`);
        this._config.connection.dispatch(turnChannel, {
          type: "chat/turnCancelled" /* ChatTurnCancelled */,
          turnId,
          duration: this._turnDuration(turnChannel, turnId)
        });
      }));
      store.add(this._observeTurn({
        backendSession: session,
        sessionResource: request2.sessionResource,
        chatURI,
        turnId,
        sink: progress,
        cancellationToken,
        suppressErrorMarkdown: true,
        onTurnEnded: (lastTurn) => {
          store.dispose();
          this._clientDispatchedTurnIds.delete(turnId);
          this._completeSessionTurn(session, request2.sessionResource, turnId);
          resolve3(lastTurn);
        },
        onFileEdits: (tc) => {
          const editParts = this._hydrateFileEdits(request2.sessionResource, request2.requestId, tc);
          if (editParts.length > 0) {
            progress(editParts);
          }
        }
      }));
    });
  }
  _handleResumedTurn(session, request2, progress, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      return Promise.resolve(void 0);
    }
    const turnId = request2.requestId;
    const chatURI = this._getChatURI(request2.sessionResource);
    const state = this._getSessionState(session.toString(), chatURI);
    const latestTurn = state?.turns.at(-1);
    const activeTurn = state?.activeTurn?.id === turnId ? state.activeTurn : void 0;
    const resumableTurn = latestTurn?.id === turnId && latestTurn.state === "error" /* Error */ && getErrorResponsePart(latestTurn)?.resumable === true ? latestTurn : void 0;
    const completedResumedTurn = latestTurn?.id === turnId && latestTurn.state !== "error" /* Error */ ? latestTurn : void 0;
    const turn = activeTurn ?? resumableTurn ?? completedResumedTurn;
    if (!turn) {
      throw new Error(localize(9012, null));
    }
    const shouldDispatchResume = resumableTurn !== void 0;
    this._clientDispatchedTurnIds.add(turnId);
    this._ensureActiveClient(request2.sessionResource, session);
    return new Promise((resolve3, reject) => {
      const store = new DisposableStore();
      const chatSubscription = this._ensureChatSubscription(session.toString(), chatURI);
      if (shouldDispatchResume) {
        let acceptedConcurrentResume = false;
        store.add(chatSubscription.onDidApplyAction((envelope) => {
          if (envelope.action.type !== "chat/turnResume" /* ChatTurnResume */ || envelope.action.turnId !== turnId) {
            return;
          }
          if (!envelope.rejectionReason) {
            acceptedConcurrentResume ||= envelope.origin?.clientId !== this._config.connection.clientId;
            return;
          }
          if (envelope.origin?.clientId !== this._config.connection.clientId || acceptedConcurrentResume) {
            return;
          }
          store.dispose();
          this._clientDispatchedTurnIds.delete(turnId);
          reject(new Error(localize(9011, null, envelope.rejectionReason)));
        }));
      }
      const cancelSub = store.add(cancellationToken.onCancellationRequested(() => {
        cancelSub.dispose();
        this._config.connection.dispatch(chatURI, {
          type: "chat/turnCancelled" /* ChatTurnCancelled */,
          turnId,
          duration: 0
        });
      }));
      store.add(this._observeTurn({
        backendSession: session,
        sessionResource: request2.sessionResource,
        chatURI,
        turnId,
        sink: progress,
        cancellationToken,
        suppressErrorMarkdown: true,
        requireActiveTurn: shouldDispatchResume,
        onTurnEnded: (lastTurn) => {
          store.dispose();
          this._clientDispatchedTurnIds.delete(turnId);
          this._completeSessionTurn(session, request2.sessionResource, turnId);
          resolve3(lastTurn);
        },
        onFileEdits: (toolCall) => {
          const editParts = this._hydrateFileEdits(request2.sessionResource, turnId, toolCall);
          if (editParts.length > 0) {
            progress(editParts);
          }
        }
      }));
      if (shouldDispatchResume) {
        this._config.connection.dispatch(chatURI, {
          type: "chat/turnResume" /* ChatTurnResume */,
          turnId
        });
      }
    });
  }
  // ---- Tool confirmation --------------------------------------------------
  /**
   * Awaits user confirmation on a PendingConfirmation tool call invocation
   * and dispatches `ChatToolCallConfirmed` back to the server.
   */
  _awaitToolConfirmation(invocation, toolCallId, session, turnId, cancellationToken, getProtocolOptions, chatURI) {
    IChatToolInvocation.awaitConfirmation(invocation, cancellationToken).then((reason) => {
      let selectedOption;
      const protocolOptions = getProtocolOptions();
      if (reason.type === 4 /* UserAction */ && reason.selectedButton && protocolOptions) {
        selectedOption = protocolOptions.find((o) => o.id === reason.selectedButton);
      }
      const approved = selectedOption ? selectedOption.kind === "approve" /* Approve */ : reason.type !== 0 /* Denied */ && reason.type !== 5 /* Skipped */;
      this._logService.info(`[AgentHost] Tool confirmation: toolCallId=${toolCallId}, approved=${approved}, selectedOptionId=${selectedOption?.id}`);
      const target = this._requireChatURI(chatURI, "chat/toolCallConfirmed" /* ChatToolCallConfirmed */);
      this._resolveToolCall(target, turnId, toolCallId, approved ? {
        type: "chat/toolCallConfirmed" /* ChatToolCallConfirmed */,
        turnId,
        toolCallId,
        approved: true,
        confirmed: "user-action" /* UserAction */,
        ...selectedOption ? { selectedOptionId: selectedOption.id } : {}
      } : {
        type: "chat/toolCallConfirmed" /* ChatToolCallConfirmed */,
        turnId,
        toolCallId,
        approved: false,
        reason: "denied" /* Denied */,
        ...selectedOption ? { selectedOptionId: selectedOption.id } : {}
      });
    }).catch((err) => {
      this._logService.warn(`[AgentHost] Tool confirmation failed for toolCallId=${toolCallId}`, err);
    });
  }
  // ---- Per-turn observable graph ------------------------------------------
  /**
   * Installs the always-on observable graph that translates session state
   * into `IChatProgress[]` for a specific turn. The same graph is used for:
   *   - live turns started by the user via {@link _handleTurn},
   *   - reconnect to an in-flight turn from {@link provideChatSessionContent},
   *   - server-initiated turns detected by {@link _watchForServerInitiatedTurns}.
   *
   * Differences are captured in {@link IObserveTurnOptions.sink} (where
   * progress is delivered) and {@link IObserveTurnOptions.snapshotToolCalls} /
   * {@link IObserveTurnOptions.seedEmittedLengths} (snapshot continuity for
   * the reconnect case).
   *
   * The returned disposable owns the entire per-turn graph, including the
   * underlying session subscription reference.
   */
  _observeTurn(opts) {
    const sessionKey = opts.backendSession.toString();
    const store = new DisposableStore();
    this._ensureTurnStopWatch(opts.chatURI, opts.turnId);
    const sub = this._ensureSessionSubscription(sessionKey);
    const chatURI = opts.chatURI;
    const chatSub = this._ensureChatSubscription(sessionKey, chatURI);
    const sessionState$ = observableFromSubscription(this, sub);
    const chatState$ = observableFromSubscription(this, chatSub);
    const mergedState$ = derived((reader) => {
      const session = sessionState$.read(reader);
      if (!session) {
        return void 0;
      }
      return mergeSessionWithDefaultChat(session, chatState$.read(reader));
    });
    const turn$ = derived((reader) => {
      const state = mergedState$.read(reader);
      if (!state) {
        return void 0;
      }
      return state.activeTurn?.id === opts.turnId ? state.activeTurn : state.turns.find((t2) => t2.id === opts.turnId);
    });
    const responseParts$ = derived((reader) => turn$.read(reader)?.responseParts ?? []);
    const usage$ = derived((reader) => turn$.read(reader)?.usage);
    store.add(autorun((reader) => {
      const state = mergedState$.read(reader);
      if (state?.turns.some((turn) => turn.id === opts.turnId)) {
        this._clearTurnStopWatch(opts.chatURI, opts.turnId);
      }
    }));
    const mcpAuthRequired$ = derivedOpts({ equalsFn: equals4 }, (reader) => {
      return getMcpAuthenticationRequiredServers(opts.sessionResource, mergedState$.read(reader));
    });
    const mcpStarting$ = derivedOpts({ equalsFn: equals4 }, (reader) => {
      const state = mergedState$.read(reader);
      const servers = state?.customizations?.flatMap((c) => c.type === "mcpServer" /* McpServer */ ? [c] : c.children?.filter((c2) => c2.type === "mcpServer" /* McpServer */) ?? []) ?? [];
      return servers.filter((server) => isCustomizationEnabled(server) && server.state.kind === "starting" /* Starting */).map((server) => ({
        id: opts.sessionResource.authority + "/" + server.id,
        name: server.name
      }));
    });
    const subagentContext = {
      observations: store.add(new DisposableMap())
    };
    store.add(autorunPerKeyedItem(
      responseParts$,
      (rp) => rp.kind === "toolCall" /* ToolCall */ ? `tc:${rp.toolCall.toolCallId}` : rp.kind === "markdown" /* Markdown */ ? `md:${rp.id}` : rp.kind === "reasoning" /* Reasoning */ ? `rs:${rp.id}` : rp.kind === "inputRequest" /* InputRequest */ ? inputRequestResponsePartKey(rp) : `other:${responseParts$.get().indexOf(rp)}`,
      (_key, part$, partStore) => {
        const initial = part$.get();
        switch (initial.kind) {
          case "markdown" /* Markdown */:
            if (opts.subAgentInvocationId !== void 0) {
              break;
            }
            this._setupMarkdownPart(part$, partStore, opts);
            break;
          case "reasoning" /* Reasoning */:
            if (opts.subAgentInvocationId !== void 0) {
              break;
            }
            this._setupReasoningPart(part$, partStore, opts);
            break;
          case "toolCall" /* ToolCall */:
            this._setupToolCallPart(part$, partStore, opts, subagentContext);
            break;
          case "inputRequest" /* InputRequest */:
            if (opts.subAgentInvocationId === void 0) {
              this._setupInputRequestPart(part$, partStore, opts);
            }
            break;
          case "systemNotification" /* SystemNotification */:
            if (responseParts$.get().indexOf(initial) >= (opts.initialResponsePartCount ?? 0) && opts.subAgentInvocationId === void 0) {
              const progress = systemNotificationToChatPart(initial.content, this._config.connectionAuthority, initial._meta);
              if (progress) {
                opts.sink([progress]);
              }
            }
            break;
          case "error" /* Error */:
            break;
        }
      }
    ));
    if (opts.subAgentInvocationId === void 0) {
      let lastUsage;
      let lastAutoModeResolution;
      const modelLookup = this._createTurnModelLookup(opts.sessionResource, void 0);
      this._setupMcpAuthPrompt(mcpAuthRequired$, store, opts);
      store.add(autorun((reader) => {
        const activity = chatState$.read(reader)?.activity;
        if (!activity || responseParts$.read(reader).length > 0) {
          return;
        }
        opts.sink([{
          kind: "progressMessage",
          id: CHAT_ACTIVITY_PROGRESS_ID,
          content: new MarkdownString().appendText(activity),
          shimmer: true
        }]);
      }));
      store.add(autorun((reader) => {
        const selectedModelId = turn$.read(reader)?.message?.model?.id;
        const resolution = this._createTurnModelLookup(opts.sessionResource, selectedModelId, this._hideAutoExplainability.read(reader)).toAutoModeResolution?.(usage$.read(reader));
        if (!resolution || equals4(lastAutoModeResolution, resolution)) {
          return;
        }
        lastAutoModeResolution = resolution;
        opts.sink([resolution]);
      }));
      {
        const MCP_STARTING_GRACE_MS = 5e3;
        let didAppend = false;
        const hasContent$ = responseParts$.map((r2) => r2.length > 0);
        const hasServersStarting$ = mcpStarting$.map((s) => s.length > 0);
        const serversStartingInput = observableValue("mcpStartingServersInput", constObservable([]));
        store.add(autorun((reader) => {
          if (hasContent$.read(reader) || !hasServersStarting$.read(reader)) {
            serversStartingInput.set(constObservable([]), void 0);
            return;
          }
          reader.store.add(disposableTimeout(() => {
            serversStartingInput.set(mcpStarting$, void 0);
            if (!didAppend) {
              didAppend = true;
              opts.sink([{
                kind: "mcpServersStartingSlow",
                sessionResource: opts.sessionResource,
                servers: serversStartingInput.map((o, r2) => o.read(r2))
              }]);
            }
          }, MCP_STARTING_GRACE_MS));
        }));
        store.add(toDisposable(() => serversStartingInput.set(constObservable([]), void 0)));
      }
      store.add(autorun((reader) => {
        const rawUsage = usage$.read(reader);
        const usage = usageInfoToChatUsage(rawUsage, modelLookup.toModelDisplayName);
        if (!usage) {
          return;
        }
        const actualModelId = this._toLanguageModelId(opts.sessionResource, rawUsage?.model);
        if (actualModelId) {
          usage.actualModelId = actualModelId;
        }
        if (lastUsage && lastUsage.promptTokens === usage.promptTokens && lastUsage.completionTokens === usage.completionTokens && lastUsage.outputBuffer === usage.outputBuffer && lastUsage.copilotCredits === usage.copilotCredits && lastUsage.sessionCopilotCredits === usage.sessionCopilotCredits && equals4(lastUsage.promptTokenDetails, usage.promptTokenDetails) && equals4(lastUsage.modelTotals, usage.modelTotals)) {
          return;
        }
        lastUsage = usage;
        opts.sink([usage]);
      }));
      let lastQuotaSignature;
      store.add(autorun((reader) => {
        const quotaUpdate = usageInfoToQuotas(usage$.read(reader));
        if (!quotaUpdate) {
          return;
        }
        const signature = JSON.stringify(quotaUpdate);
        if (signature === lastQuotaSignature) {
          return;
        }
        lastQuotaSignature = signature;
        this._chatEntitlementService.acceptQuotas({
          ...this._chatEntitlementService.quotas,
          ...quotaUpdate
        });
      }));
    }
    if (opts.subAgentInvocationId !== void 0 && opts.subAgentCreditsAccumulator) {
      const accumulator = opts.subAgentCreditsAccumulator;
      let lastCredits = 0;
      store.add(autorun((reader) => {
        const rawUsage = usage$.read(reader);
        const credits = usageInfoToChatUsage(rawUsage)?.copilotCredits;
        if (typeof credits === "number" && credits !== lastCredits) {
          const delta2 = credits - lastCredits;
          lastCredits = credits;
          if (delta2 > 0) {
            transaction((tx) => {
              accumulator.set(accumulator.read(void 0) + delta2, tx);
            });
          }
        }
      }));
    }
    if (opts.subAgentInvocationId !== void 0 && opts.subAgentModelObservable) {
      const modelObservable = opts.subAgentModelObservable;
      store.add(autorun((reader) => {
        const hideAutoExplainability = this._hideAutoExplainability.read(reader);
        if (hideAutoExplainability === void 0) {
          return;
        }
        const modelName = this._createTurnModelLookup(opts.sessionResource, void 0, hideAutoExplainability).toBilledModelDisplayName?.(usage$.read(reader));
        if (modelName && modelName !== modelObservable.read(void 0)) {
          transaction((tx) => modelObservable.set(modelName, tx));
        }
      }));
    }
    let terminated = false;
    let seenActive = false;
    const finish = (lastTurn) => {
      if (terminated) {
        return;
      }
      terminated = true;
      queueMicrotask(() => {
        if (store.isDisposed) {
          return;
        }
        try {
          opts.onTurnEnded?.(lastTurn);
        } finally {
          store.dispose();
        }
      });
    };
    store.add(autorun((reader) => {
      if (terminated) {
        return;
      }
      const state = mergedState$.read(reader);
      if (!state) {
        return;
      }
      if (state.activeTurn?.id === opts.turnId) {
        seenActive = true;
        return;
      }
      const lastTurn = state.turns.find((t2) => t2.id === opts.turnId);
      if (lastTurn && !opts.requireActiveTurn) {
        seenActive = true;
      }
      if (!seenActive) {
        return;
      }
      const turnError = getTurnError(lastTurn);
      if (!opts.suppressErrorMarkdown && turnError) {
        const forwarded = getChatErrorDetailsFromMeta(turnError, this._chatErrorContext());
        const content2 = forwarded ? new MarkdownString(`

${forwarded.message}`) : new MarkdownString(`

Error: (${turnError.errorType}) ${turnError.message}`);
        opts.sink([{ kind: "markdownContent", content: content2 }]);
      }
      finish(lastTurn);
    }));
    store.add(opts.cancellationToken.onCancellationRequested(() => {
      const current = turn$.get();
      finish(current ? { state: "cancelled" /* Cancelled */, ...current } : void 0);
    }));
    return store;
  }
  /**
   * Surfaces the "MCP server … requires authentication" prompt for a turn.
   *
   * Each server is prompted at most once per conversation: {@link mcpAuthRequired$}
   * is session-wide, so without this guard the prompt would repeat on every
   * message. The per-session {@link _surfacedMcpAuthServers surfaced set} tracks
   * which servers were already prompted; it is pruned by
   * {@link _reconcileSurfacedMcpAuthServers} once a server reaches the running
   * state, so a server that is re-required after being authenticated (e.g.
   * after a restart) prompts again.
   *
   * The emitted part lists only the servers it introduced and shrinks as they
   * authenticate.
   */
  _setupMcpAuthPrompt(mcpAuthRequired$, store, opts) {
    let part;
    let ownedIds = /* @__PURE__ */ new Set();
    let runId = 0;
    store.add(autorun((reader) => {
      const pendingAuth = mcpAuthRequired$.read(reader);
      const currentRunId = ++runId;
      this._filterAutoGrantedMcpAuthentication(opts.sessionResource, pendingAuth).then((servers) => {
        if (currentRunId !== runId) {
          return;
        }
        const surfaced = this._getSurfacedMcpAuthServers(opts.sessionResource);
        const newServers = servers.filter((server) => !surfaced.has(server.id));
        if (!newServers.length && (!part || part.isUsed)) {
          return;
        }
        if (!part || part.isUsed) {
          ownedIds = /* @__PURE__ */ new Set();
          part = {
            kind: "mcpAuthenticationRequired",
            sessionResource: opts.sessionResource.toJSON(),
            isUsed: false,
            servers: observableValue("mcpAuthNeededServers", [])
          };
          opts.sink([part]);
        }
        for (const server of newServers) {
          surfaced.add(server.id);
          ownedIds.add(server.id);
        }
        part.servers.set(servers.filter((server) => ownedIds.has(server.id)), void 0);
      });
    }));
  }
  /**
   * Returns the mutable set of MCP server ids already surfaced for
   * authentication in the given session, creating it on first use.
   */
  _getSurfacedMcpAuthServers(sessionResource) {
    let surfaced = this._surfacedMcpAuthServers.get(sessionResource);
    if (!surfaced) {
      surfaced = /* @__PURE__ */ new Set();
      this._surfacedMcpAuthServers.set(sessionResource, surfaced);
    }
    return surfaced;
  }
  /**
   * Prunes servers that reached the running ({@link McpServerStatus.Ready})
   * state from every session's {@link _surfacedMcpAuthServers surfaced set} so
   * a subsequent auth requirement surfaces a fresh prompt instead of being
   * suppressed. Only the running state counts as actioned — a server that
   * merely left {@link McpServerStatus.AuthRequired} for an error/stopped
   * state was not authenticated and stays suppressed.
   */
  _reconcileSurfacedMcpAuthServers() {
    for (const [sessionResource, surfaced] of this._surfacedMcpAuthServers) {
      if (surfaced.size === 0) {
        continue;
      }
      const ready = new Set(this._customizationService.getMcpServers(sessionResource).filter((server) => server.status === "ready" /* Ready */).map((server) => server.id));
      for (const id2 of surfaced) {
        if (ready.has(id2)) {
          surfaced.delete(id2);
        }
      }
    }
  }
  async _filterAutoGrantedMcpAuthentication(sessionResource, servers) {
    const remaining = [];
    for (const server of servers) {
      if (!await this._autoAuthenticateMcpServer(sessionResource, server)) {
        remaining.push(server);
      }
    }
    return remaining;
  }
  async _autoAuthenticateMcpServer(sessionResource, server) {
    const key3 = JSON.stringify([
      agentHostMcpServerId(sessionResource.authority, server.name, server.resource),
      [...server.requiredScopes ?? []].sort(),
      server.oauthClient?.clientId
    ]);
    const pending = this._pendingMcpAutoAuthentication.get(key3);
    if (pending) {
      return pending;
    }
    const operation = this._instantiationService.invokeFunction(resolveMcpServerAuthentication, {
      resource: server.resource,
      resource_name: server.name,
      authorization_servers: server.authorizationServers ? [...server.authorizationServers] : void 0,
      scopes_supported: server.supportedScopes ? [...server.supportedScopes] : void 0
    }, {
      allowInteraction: false,
      logPrefix: "[AgentHost]",
      mcpServerId: agentHostMcpServerId(sessionResource.authority, server.name, server.resource),
      mcpServerName: server.name,
      mcpServerUrl: server.resource,
      oauthClient: server.oauthClient,
      scopes: server.requiredScopes ?? [],
      agentHost: { scheme: sessionResource.scheme, authority: sessionResource.authority },
      authenticate: (request2) => this._config.connection.authenticate(request2)
    }).catch((err) => {
      this._logService.error(`[AgentHost] Failed to auto-authenticate MCP server '${server.name}'`, err);
      return false;
    });
    this._pendingMcpAutoAuthentication.set(key3, operation);
    try {
      return await operation;
    } finally {
      if (this._pendingMcpAutoAuthentication.get(key3) === operation) {
        this._pendingMcpAutoAuthentication.delete(key3);
      }
    }
  }
  _setupMarkdownPart(part$, store, opts) {
    let lastEmitted = opts.seedEmittedLengths?.get(part$.get().id) ?? 0;
    store.add(autorun((reader) => {
      const content2 = part$.read(reader).content;
      if (content2.length <= lastEmitted) {
        return;
      }
      const delta2 = content2.substring(lastEmitted);
      lastEmitted = content2.length;
      opts.sink([{ kind: "markdownContent", content: new MarkdownString(delta2) }]);
    }));
  }
  _setupReasoningPart(part$, store, opts) {
    const partId = part$.get().id;
    let lastEmitted = opts.seedEmittedLengths?.get(partId) ?? 0;
    store.add(autorun((reader) => {
      const content2 = part$.read(reader).content;
      if (content2.length <= lastEmitted) {
        return;
      }
      const delta2 = content2.substring(lastEmitted);
      lastEmitted = content2.length;
      opts.sink([{ kind: "thinking", value: delta2, id: partId }]);
    }));
  }
  _setupToolCallPart(part$, store, opts, subagentContext) {
    const initial = part$.get().toolCall;
    const renderedBySnapshot = !!opts.snapshotToolCalls?.has(initial.toolCallId) && !snapshotInvocationToAdopt(opts, initial.toolCallId);
    if (renderedBySnapshot && !shouldObserveSubagentChat(initial)) {
      return;
    }
    const contributor = initial.contributor;
    if (contributor?.kind === "client" /* Client */ && contributor.clientId === this._config.connection.clientId) {
      this._setupClientToolCall(initial, part$, store, opts, subagentContext, renderedBySnapshot);
      store.add(this._markToolCallRendered(opts.chatURI, opts.turnId, initial.toolCallId, opts.sessionResource));
    } else if (contributor?.kind === "client" /* Client */) {
      this._setupOtherClientToolCall(initial, part$, store, opts);
    } else {
      store.add(this._markToolCallRendered(opts.chatURI, opts.turnId, initial.toolCallId, opts.sessionResource));
      this._setupServerToolCall(initial, part$, store, opts, subagentContext, renderedBySnapshot);
    }
  }
  _toolCallKey(chatURI, turnId, toolCallId) {
    return `${chatURI}\0${turnId}\0${toolCallId}`;
  }
  _inputRequestKey(chatURI, requestId) {
    return `${chatURI}\0${requestId}`;
  }
  /** Claims a request as rendered until the returned disposable is disposed. */
  _markRendered(key3, sessionResource) {
    this._renderedRequests.set(new Map(this._renderedRequests.get()).set(key3, sessionResource), void 0);
    return toDisposable(() => {
      const next = new Map(this._renderedRequests.get());
      next.delete(key3);
      this._renderedRequests.set(next, void 0);
    });
  }
  /**
   * Records that a turn observer is rendering this chat input request, so the
   * session-level responder leaves its inline elicitation UI in charge.
   */
  _markInputRequestRendered(chatURI, requestId, sessionResource) {
    return this._markRendered(this._inputRequestKey(chatURI, requestId), sessionResource);
  }
  /**
   * Records that a turn observer is rendering this tool call, so the
   * session-level responder leaves its inline UI in charge. Releasing the
   * claim also forgets the funnel entries, which is the only cleanup a tool
   * call that never reached `inputNeeded` ever gets.
   */
  _markToolCallRendered(chatURI, turnId, toolCallId, sessionResource) {
    const key3 = this._toolCallKey(chatURI, turnId, toolCallId);
    const rendered = this._markRendered(key3, sessionResource);
    return toDisposable(() => {
      rendered.dispose();
      this._forgetResolvedToolCall(key3);
    });
  }
  /**
   * Single funnel for tool-call outcomes, so an inline invocation and the
   * session-level responder can both offer the action while the protocol
   * only ever sees the first answer. Confirming and completing are distinct
   * outcomes, so each is tracked separately.
   */
  _resolveToolCall(chatURI, turnId, toolCallId, action) {
    const key3 = `${this._toolCallKey(chatURI, turnId, toolCallId)}\0${action.type}`;
    if (this._resolvedToolCalls.has(key3)) {
      this._logService.trace(`[AgentHost] Tool call outcome was already dispatched: ${toolCallId} (${action.type})`);
      return;
    }
    this._resolvedToolCalls.add(key3);
    this._config.connection.dispatch(chatURI, action);
  }
  _forgetResolvedToolCall(toolCallKey) {
    for (const key3 of this._resolvedToolCalls) {
      if (key3.startsWith(`${toolCallKey}\0`)) {
        this._resolvedToolCalls.delete(key3);
      }
    }
  }
  _setupOtherClientToolCall(initial, part$, store, opts) {
    const toolCallId = initial.toolCallId;
    const adopted = snapshotInvocationToAdopt(opts, toolCallId);
    const invocation = adopted ?? toolCallStateToInvocation(
      initial,
      opts.subAgentInvocationId,
      opts.backendSession,
      this._config.connectionAuthority,
      opts.sessionResource.authority,
      this._otherClientToolInvocationOptions(opts.backendSession, opts.chatURI, opts.turnId),
      this._config.connection.resourceUris
    );
    if (!adopted) {
      opts.sink([invocation]);
    }
    store.add(autorun((reader) => {
      const toolCall = part$.read(reader).toolCall;
      if ((toolCall.status === "completed" /* Completed */ || toolCall.status === "cancelled" /* Cancelled */) && !IChatToolInvocation.isComplete(invocation)) {
        const fileEdits = finalizeToolInvocation(invocation, toolCall, opts.backendSession, this._config.connectionAuthority, this._config.connection.resourceUris);
        if (fileEdits.length > 0) {
          opts.onFileEdits?.(toolCall, fileEdits);
        }
      }
    }));
    store.add(toDisposable(() => {
      if (!IChatToolInvocation.isComplete(invocation)) {
        invocation.didExecuteTool(void 0);
      }
    }));
  }
  _otherClientToolInvocationOptions(backendSession, chatURI, turnId) {
    return {
      currentClientId: this._config.connection.clientId,
      cancelOtherClientToolCall: (toolCall) => {
        const reasonMessage = localize(9008, null, toolCall.displayName);
        this._dispatchAction(backendSession, toolCall.status === "pending-confirmation" /* PendingConfirmation */ ? {
          type: "chat/toolCallConfirmed" /* ChatToolCallConfirmed */,
          turnId,
          toolCallId: toolCall.toolCallId,
          approved: false,
          reason: "skipped" /* Skipped */,
          reasonMessage
        } : {
          type: "chat/toolCallComplete" /* ChatToolCallComplete */,
          turnId,
          toolCallId: toolCall.toolCallId,
          result: {
            success: false,
            pastTenseMessage: localize(9007, null, toolCall.displayName),
            error: { message: reasonMessage, code: "cancelled" }
          }
        }, chatURI);
      }
    };
  }
  /**
   * Per-call setup for a server-driven tool. Adopts a snapshot
   * {@link ChatToolInvocation} when present (reconnect parity); otherwise
   * emits a fresh one. Reacts to status transitions for re-confirmation,
   * terminal revival, finalization, and subagent observation.
   *
   * `renderedBySnapshot` marks a settled tool call the reconnect snapshot
   * already rendered as a serialized part. The invocation is still built so
   * subagent observation has something to drive, but it is not emitted —
   * the snapshot's part is the one on screen.
   */
  _setupServerToolCall(initial, part$, store, opts, subagentContext, renderedBySnapshot = false) {
    const toolCallId = initial.toolCallId;
    const subAgentInvocationId = opts.subAgentInvocationId;
    const adopted = snapshotInvocationToAdopt(opts, toolCallId);
    let confirmationOptions = initial.status === "pending-confirmation" /* PendingConfirmation */ ? initial.options : void 0;
    let invocation;
    if (adopted) {
      invocation = adopted;
    } else if (initial.status === "streaming" /* Streaming */) {
      invocation = toolCallStateToStreamingInvocation(initial, subAgentInvocationId, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority);
      if (!renderedBySnapshot) {
        opts.sink([invocation]);
      }
    } else {
      invocation = toolCallStateToInvocation(initial, subAgentInvocationId, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority, void 0, this._config.connection.resourceUris);
      if (!renderedBySnapshot) {
        opts.sink([invocation]);
      }
    }
    if (initial.status === "pending-confirmation" /* PendingConfirmation */ && !IChatToolInvocation.isComplete(invocation)) {
      this._awaitToolConfirmation(invocation, toolCallId, opts.backendSession, opts.turnId, opts.cancellationToken, () => confirmationOptions, opts.chatURI);
    }
    this._tryObserveSubagentToolCall(initial, invocation, store, opts, subagentContext);
    const outputTerminalAttachment = {
      disposable: store.add(new MutableDisposable())
    };
    let previousStatus = initial.status;
    store.add(autorun((reader) => {
      const tc = part$.read(reader).toolCall;
      const status2 = tc.status;
      const priorStatus = previousStatus;
      if (status2 === "pending-confirmation" /* PendingConfirmation */) {
        confirmationOptions = tc.options;
      }
      const enteringConfirmation = status2 === "pending-confirmation" /* PendingConfirmation */ && previousStatus !== "pending-confirmation" /* PendingConfirmation */;
      previousStatus = status2;
      if (status2 === "streaming" /* Streaming */) {
        updateStreamingToolInvocation(invocation, tc, this._config.connectionAuthority);
      } else if (enteringConfirmation) {
        this._forgetResolvedToolCall(this._toolCallKey(opts.chatURI, opts.turnId, toolCallId));
        if (!IChatToolInvocation.isComplete(invocation)) {
          const prepared = toolCallStateToPreparedInvocation(tc, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority, void 0, this._config.connection.resourceUris);
          invocation.requestConfirmation(prepared);
          this._awaitToolConfirmation(invocation, toolCallId, opts.backendSession, opts.turnId, opts.cancellationToken, () => confirmationOptions, opts.chatURI);
        }
      } else if (status2 === "pending-confirmation" /* PendingConfirmation */) {
        const prepared = toolCallStateToPreparedInvocation(tc, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority, void 0, this._config.connection.resourceUris);
        invocation.updatePreparedInvocation(prepared, invocation.parameters);
      } else if (status2 === "auth-required" /* AuthRequired */) {
        this._ensureLeftStreaming(invocation, tc, opts);
        invocation.setAuthenticationRequired(toolCallAuthenticationServer(tc, opts.sessionResource.authority), () => {
          this._dispatchAction(opts.backendSession, {
            type: "chat/toolCallComplete" /* ChatToolCallComplete */,
            turnId: opts.turnId,
            toolCallId,
            result: {
              success: false,
              pastTenseMessage: localize(9005, null),
              error: { message: localize(9006, null), code: "cancelled" }
            }
          }, opts.chatURI);
        });
      } else if (status2 === "running" /* Running */ || status2 === "pending-result-confirmation" /* PendingResultConfirmation */) {
        if (priorStatus === "auth-required" /* AuthRequired */) {
          invocation.setAuthenticationResolved();
        }
        this._ensureLeftStreaming(invocation, tc, opts);
        const invocationMessage = stringOrMarkdownToString(tc.invocationMessage, this._config.connectionAuthority);
        const previousInvocationMessage = typeof invocation.invocationMessage === "string" ? invocation.invocationMessage : invocation.invocationMessage.value;
        const nextInvocationMessage = typeof invocationMessage === "string" ? invocationMessage : invocationMessage?.value;
        const invocationMessageChanged = nextInvocationMessage !== void 0 && nextInvocationMessage !== previousInvocationMessage;
        if (invocationMessage !== void 0) {
          invocation.invocationMessage = invocationMessage;
        }
        this._reviveTerminalIfNeeded(invocation, tc, opts.backendSession, opts.chatURI, outputTerminalAttachment);
        updateRunningToolSpecificData(invocation, tc, opts.backendSession, this._config.connectionAuthority, this._config.connection.resourceUris);
        if (invocationMessageChanged) {
          invocation.notifyToolSpecificDataChanged();
        }
      }
      this._tryObserveSubagentToolCall(tc, invocation, store, opts, subagentContext);
      if ((status2 === "completed" /* Completed */ || status2 === "cancelled" /* Cancelled */) && !IChatToolInvocation.isComplete(invocation)) {
        if (status2 === "completed" /* Completed */) {
          this._ensureLeftStreaming(invocation, tc, opts);
        }
        this._reviveTerminalIfNeeded(invocation, tc, opts.backendSession, opts.chatURI, outputTerminalAttachment);
        const fileEdits = finalizeToolInvocation(invocation, tc, opts.backendSession, this._config.connectionAuthority, this._config.connection.resourceUris);
        if (fileEdits.length > 0) {
          opts.onFileEdits?.(tc, fileEdits);
        }
      }
    }));
    store.add(toDisposable(() => {
      if (!IChatToolInvocation.isComplete(invocation)) {
        invocation.didExecuteTool(void 0);
      }
    }));
  }
  /** Transitions an invocation from streaming once its AHP tool call is ready. */
  _ensureLeftStreaming(invocation, tc, opts) {
    if (invocation.state.read(void 0).type !== IChatToolInvocation.StateKind.Streaming) {
      return;
    }
    const prepared = toolCallStateToPreparedInvocation(tc, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority, void 0, this._config.connection.resourceUris);
    invocation.transitionFromStreaming(prepared, void 0, void 0);
  }
  /**
   * Observes the child chat for any subagent-spawning tool, including client-provided delegated tasks.
   */
  _tryObserveSubagentToolCall(toolCall, invocation, store, opts, subagentContext) {
    const toolCallId = toolCall.toolCallId;
    const hasSubagentContent = (toolCall.status === "running" /* Running */ || toolCall.status === "completed" /* Completed */) && !!getToolSubagentContent(toolCall);
    if (!isSubagentTool(toolCall) && !hasSubagentContent) {
      return;
    }
    const isObserved = subagentContext.observations.has(toolCallId);
    const currentData = invocation.toolSpecificData?.kind === "subagent" ? invocation.toolSpecificData : void 0;
    const prepared = toolCallStateToPreparedInvocation(toolCall, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority, void 0, this._config.connection.resourceUris);
    const protocolData = prepared.toolSpecificData?.kind === "subagent" ? prepared.toolSpecificData : void 0;
    if (!protocolData) {
      return;
    }
    const chatResource = protocolData.chatResource ?? currentData?.chatResource;
    const description = protocolData.description ?? currentData?.description;
    const agentName = protocolData.agentName ?? currentData?.agentName;
    if (!currentData || currentData.chatResource !== chatResource || currentData.description !== description || currentData.agentName !== agentName) {
      invocation.toolSpecificData = {
        ...currentData,
        ...protocolData,
        chatResource,
        description,
        agentName,
        isActive: currentData?.isActive ?? isObserved
      };
      invocation.notifyToolSpecificDataChanged();
    }
    if (isObserved && !shouldObserveSubagentChat(toolCall)) {
      subagentContext.observations.deleteAndDispose(toolCallId);
      return;
    }
    if (isObserved) {
      return;
    }
    if (!shouldObserveSubagentChat(toolCall)) {
      return;
    }
    const subagentData = invocation.toolSpecificData;
    if (subagentData?.kind !== "subagent") {
      return;
    }
    const observationStore = new DisposableStore();
    subagentContext.observations.set(toolCallId, observationStore);
    subagentData.isActive = true;
    invocation.notifyToolSpecificDataChanged();
    const perInvocationCredits = observableValue("subagentInvocationCredits", 0);
    observationStore.add(autorun((reader) => {
      const total = perInvocationCredits.read(reader);
      if (total > 0 && invocation.toolSpecificData?.kind === "subagent" && invocation.toolSpecificData.credits !== total) {
        invocation.toolSpecificData.credits = total;
        invocation.notifyToolSpecificDataChanged();
      }
    }));
    const perInvocationModel = observableValue("subagentInvocationModel", void 0);
    observationStore.add(autorun((reader) => {
      const modelName = perInvocationModel.read(reader);
      if (modelName && invocation.toolSpecificData?.kind === "subagent" && invocation.toolSpecificData.modelName !== modelName) {
        invocation.toolSpecificData.modelName = modelName;
        invocation.notifyToolSpecificDataChanged();
      }
    }));
    const rootInvocationId = opts.subAgentInvocationId ?? toolCallId;
    const childChatUri = subagentData.chatResource || buildSubagentChatUri(opts.backendSession.toString(), toolCallId);
    this._observeSubagentSession(opts.sessionResource, opts.backendSession, toolCallId, childChatUri, rootInvocationId, invocation, opts.sink, observationStore, subagentContext, perInvocationCredits, perInvocationModel);
  }
  /**
   * Per-call setup for a client-provided tool. The observer only renders: it
   * obtains the shared {@link ChatToolInvocation} (created by whichever of
   * this observer or the session-level watcher arrives first), emits it into
   * this chat so it renders in the correct group, drives subagent
   * presentation, and dispatches `ChatToolCallConfirmed` from the
   * invocation's confirmation gate. It never invokes the tool — the
   * session-level watcher owns execution.
   */
  _setupClientToolCall(initial, part$, store, opts, subagentContext, renderedBySnapshot = false) {
    const toolCallId = initial.toolCallId;
    const toolName = initial.toolName;
    const adopted = snapshotInvocationToAdopt(opts, toolCallId);
    if (adopted && !IChatToolInvocation.isComplete(adopted)) {
      adopted.didExecuteTool(void 0);
    }
    const toolData = this._resolveClientTool(toolName);
    if (!toolData) {
      this._logService.warn(`[AgentHost] Client tool call for unknown tool: ${toolName}`);
      this._dispatchAction(opts.backendSession, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId: opts.turnId,
        toolCallId,
        result: {
          success: false,
          pastTenseMessage: `Tool "${toolName}" is not available`,
          error: { message: `Tool "${toolName}" is not available on this client` }
        }
      }, opts.chatURI);
      return;
    }
    const invocation = this._ensureClientToolInvocation(opts.chatURI, opts.turnId, toolCallId, toolData.id, opts.subAgentInvocationId);
    if (!invocation) {
      this._logService.warn(`[AgentHost] Failed to begin client tool invocation: ${toolName}`);
      this._dispatchAction(opts.backendSession, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId: opts.turnId,
        toolCallId,
        result: {
          success: false,
          pastTenseMessage: `Failed to start ${toolName}`,
          error: { message: `Could not create invocation for client tool "${toolName}"` }
        }
      }, opts.chatURI);
      return;
    }
    if (isSubagentTool(initial)) {
      const prepared = toolCallStateToPreparedInvocation(initial, opts.backendSession, this._config.connectionAuthority, opts.sessionResource.authority, void 0, this._config.connection.resourceUris);
      if (prepared.toolSpecificData?.kind === "subagent") {
        invocation.toolSpecificData = prepared.toolSpecificData;
      }
    }
    this._tryObserveSubagentToolCall(initial, invocation, store, opts, subagentContext);
    if (!renderedBySnapshot) {
      opts.sink([invocation]);
    }
    let confirmationDispatched = false;
    store.add(autorun((reader) => {
      const state = invocation.state.read(reader);
      if (confirmationDispatched) {
        return;
      }
      if (state.type === IChatToolInvocation.StateKind.Executing) {
        confirmationDispatched = true;
        const selectedOptionId = state.confirmed.type === 4 /* UserAction */ ? state.confirmed.selectedButton : void 0;
        const approved = state.confirmed.type !== 4 /* UserAction */ || state.confirmed.selectedButtonKind !== "deny" /* Deny */;
        this._resolveToolCall(opts.chatURI, opts.turnId, toolCallId, approved ? {
          type: "chat/toolCallConfirmed" /* ChatToolCallConfirmed */,
          turnId: opts.turnId,
          toolCallId,
          approved: true,
          confirmed: confirmedReasonToProtocol(state.confirmed),
          ...selectedOptionId ? { selectedOptionId } : {}
        } : {
          type: "chat/toolCallConfirmed" /* ChatToolCallConfirmed */,
          turnId: opts.turnId,
          toolCallId,
          approved: false,
          reason: "denied" /* Denied */,
          ...selectedOptionId ? { selectedOptionId } : {}
        });
      } else if (state.type === IChatToolInvocation.StateKind.Cancelled) {
        confirmationDispatched = true;
        const status2 = part$.read(void 0).toolCall.status;
        if (status2 === "cancelled" /* Cancelled */ || status2 === "completed" /* Completed */) {
          return;
        }
        this._resolveToolCall(opts.chatURI, opts.turnId, toolCallId, {
          type: "chat/toolCallConfirmed" /* ChatToolCallConfirmed */,
          turnId: opts.turnId,
          toolCallId,
          approved: false,
          reason: "denied" /* Denied */
        });
      }
    }));
    store.add(autorun((reader) => {
      const tc = part$.read(reader).toolCall;
      this._tryObserveSubagentToolCall(tc, invocation, store, opts, subagentContext);
      const cancellation = tc.status === "cancelled" /* Cancelled */ ? {
        reason: tc.reason === "skipped" /* Skipped */ ? 5 /* Skipped */ : 0 /* Denied */,
        reasonMessage: tc.reasonMessage ? stringOrMarkdownToString(tc.reasonMessage, this._config.connectionAuthority) : void 0
      } : tc.status === "completed" /* Completed */ && !tc.success && tc.error?.code === "cancelled" ? { reason: 5 /* Skipped */, reasonMessage: tc.error.message } : void 0;
      if (cancellation && !invocation.cancelFromStreaming(cancellation.reason, cancellation.reasonMessage)) {
        IChatToolInvocation.confirmWith(invocation, { type: cancellation.reason });
      }
      if ((tc.status === "cancelled" /* Cancelled */ || tc.status === "completed" /* Completed */) && !IChatToolInvocation.isComplete(invocation, reader)) {
        const fileEdits = finalizeToolInvocation(invocation, tc, opts.backendSession, this._config.connectionAuthority, this._config.connection.resourceUris);
        if (fileEdits.length > 0) {
          opts.onFileEdits?.(tc, fileEdits);
        }
      }
    }));
  }
  _setupInputRequestPart(part$, store, opts) {
    const inputReq = part$.get().request;
    store.add(this._markInputRequestRendered(opts.chatURI, inputReq.id, opts.sessionResource));
    const planReview = inputReq.planReview;
    if (planReview) {
      this._setupPlanReviewInputRequest(part$, planReview, store, opts);
      return;
    }
    if (inputReq.url) {
      this._setupUrlInputRequest(part$, inputReq.url, store, opts);
      return;
    }
    const carousel = createInputRequestCarousel(inputReq, this._config.connectionAuthority);
    opts.sink([carousel]);
    let completedFromServer = false;
    store.add(autorun((reader) => {
      const part = part$.read(reader);
      if (part.response === void 0) {
        return;
      }
      completedFromServer = true;
      const protocolAnswers = part.response === "accept" /* Accept */ ? part.request.answers : void 0;
      const carouselAnswers = convertProtocolAnswers(protocolAnswers);
      const wasUsed = carousel.isUsed;
      carousel.data = carouselAnswers ?? {};
      carousel.isUsed = true;
      carousel.answeredExternally = part.response === "accept" /* Accept */ && !carouselAnswers;
      carousel.autoReply = containsAutomaticReplyAnswer(protocolAnswers);
      carousel.answeredExternally ||= carousel.autoReply;
      carousel.draftAnswers = void 0;
      carousel.draftCurrentIndex = void 0;
      carousel.draftCollapsed = void 0;
      carousel.completion.complete({ answers: carouselAnswers });
      if (!wasUsed) {
        this._chatWidgetService.getWidgetBySessionResource(opts.sessionResource)?.input.clearQuestionCarousel(void 0, inputReq.id);
      }
    }));
    carousel.completion.p.then((result) => {
      if (store.isDisposed || completedFromServer) {
        return;
      }
      if (!result.answers) {
        this._config.connection.dispatch(opts.chatURI, {
          type: "chat/inputCompleted" /* ChatInputCompleted */,
          requestId: inputReq.id,
          response: "cancel" /* Cancel */
        });
      } else {
        const answers = convertCarouselAnswers(result.answers, inputReq.questions);
        this._config.connection.dispatch(opts.chatURI, {
          type: "chat/inputCompleted" /* ChatInputCompleted */,
          requestId: inputReq.id,
          response: "accept" /* Accept */,
          answers
        });
      }
    });
    if (opts.cancellationToken.isCancellationRequested) {
      carousel.completion.complete({ answers: void 0 });
    } else {
      const tokenListener = opts.cancellationToken.onCancellationRequested(() => {
        carousel.completion.complete({ answers: void 0 });
      });
      carousel.completion.p.finally(() => tokenListener.dispose());
    }
    store.add(toDisposable(() => {
      if (carousel.isUsed) {
        return;
      }
      carousel.data = {};
      carousel.isUsed = true;
      carousel.draftAnswers = void 0;
      carousel.draftCurrentIndex = void 0;
      carousel.draftCollapsed = void 0;
      carousel.completion.complete({ answers: void 0 });
      this._chatWidgetService.getWidgetBySessionResource(opts.sessionResource)?.input.clearQuestionCarousel(void 0, inputReq.id);
    }));
  }
  _setupPlanReviewInputRequest(part$, planReview, store, opts) {
    const inputReq = part$.get().request;
    const review = createInputRequestPlanReview(inputReq, planReview, this._config.connection.resourceUris);
    opts.sink([review]);
    let inputCompleted = false;
    let latestResult = convertProtocolPlanReviewResult(planReview, "accept" /* Accept */, inputReq.answers);
    let planReviewCleared = false;
    const clearPlanReview = () => {
      if (planReviewCleared) {
        return;
      }
      planReviewCleared = true;
      this._chatWidgetService.getWidgetBySessionResource(opts.sessionResource)?.input.clearPlanReview(void 0, inputReq.id);
    };
    store.add(autorun((reader) => {
      const part = part$.read(reader);
      if (part.response === void 0) {
        return;
      }
      inputCompleted = true;
      latestResult = convertProtocolPlanReviewResult(planReview, part.response, part.request.answers);
      review.data = latestResult;
      review.isUsed = true;
      review.draftFeedback = void 0;
      review.draftCollapsed = void 0;
      void review.completion.complete(latestResult);
      clearPlanReview();
    }));
    review.completion.p.then((result) => {
      if (store.isDisposed || inputCompleted) {
        return;
      }
      const completion = result ? convertPlanReviewResult(planReview, result) : { response: "cancel" /* Cancel */ };
      this._config.connection.dispatch(opts.chatURI, {
        type: "chat/inputCompleted" /* ChatInputCompleted */,
        requestId: inputReq.id,
        ...completion
      });
    });
    if (opts.cancellationToken.isCancellationRequested) {
      review.dismiss();
    } else {
      const tokenListener = opts.cancellationToken.onCancellationRequested(() => review.dismiss());
      review.completion.p.finally(() => tokenListener.dispose());
    }
    store.add(toDisposable(() => {
      if (!review.isUsed) {
        if (inputCompleted) {
          review.data = latestResult;
          review.isUsed = true;
          review.draftFeedback = void 0;
          review.draftCollapsed = void 0;
          void review.completion.complete(latestResult);
        } else {
          review.dismiss();
        }
      }
      clearPlanReview();
    }));
  }
  /**
   * Handle a URL-style {@link ChatInputRequest} by rendering a
   * {@link ChatElicitationRequestPart} that prompts the user to open the
   * URL. Clicking the accept button opens the URL via {@link IOpenerService}
   * and dispatches `ChatInputCompleted` with `Accept`; reject dispatches
   * `Decline`; abandonment / cancellation dispatches `Cancel`.
   */
  _setupUrlInputRequest(responsePart$, url, store, opts) {
    const inputReq = responsePart$.get().request;
    let completionDispatched = false;
    let completedFromServer = false;
    const settle = (response) => {
      if (completionDispatched || completedFromServer) {
        return;
      }
      completionDispatched = true;
      this._config.connection.dispatch(opts.chatURI, {
        type: "chat/inputCompleted" /* ChatInputCompleted */,
        requestId: inputReq.id,
        response
      });
    };
    const presentation2 = getUrlInputRequestPresentation(inputReq, url);
    const part = new ChatElicitationRequestPart(
      localize(9003, null),
      presentation2.message,
      "",
      localize(9002, null, presentation2.authority),
      localize(9001, null),
      async () => {
        try {
          const opened = await this._openerService.open(url, { allowCommands: false });
          if (opened) {
            settle("accept" /* Accept */);
            return "accepted" /* Accepted */;
          }
          settle("decline" /* Decline */);
          return "rejected" /* Rejected */;
        } catch {
          settle("decline" /* Decline */);
          return "rejected" /* Rejected */;
        }
      },
      async () => {
        settle("decline" /* Decline */);
        return "rejected" /* Rejected */;
      }
    );
    opts.sink([part]);
    store.add(autorun((reader) => {
      const response = responsePart$.read(reader).response;
      if (response === void 0) {
        return;
      }
      completedFromServer = true;
      part.state.set(response === "accept" /* Accept */ ? "accepted" /* Accepted */ : "rejected" /* Rejected */, void 0);
      part.hide();
    }));
    if (opts.cancellationToken.isCancellationRequested) {
      settle("cancel" /* Cancel */);
      part.hide();
    } else {
      const tokenListener = opts.cancellationToken.onCancellationRequested(() => {
        settle("cancel" /* Cancel */);
        part.hide();
      });
      store.add(toDisposable(() => tokenListener.dispose()));
    }
    store.add(toDisposable(() => {
      settle("cancel" /* Cancel */);
      part.hide();
    }));
  }
  /**
   * Synchronizes PTY and non-PTY terminal content, including the live-to-retained output handoff, and updates invocation metadata.
   */
  _reviveTerminalIfNeeded(invocation, tc, backendSession, chatURI, outputTerminalAttachment) {
    if (tc.status !== "running" /* Running */ && tc.status !== "completed" /* Completed */ && tc.status !== "pending-result-confirmation" /* PendingResultConfirmation */) {
      return;
    }
    const terminalContent = getTerminalContent(tc.content);
    const terminalUri = terminalContent?.resource;
    const toolInput = getInlineToolInput(tc.toolInput);
    if (!terminalContent || !terminalUri || !toolInput) {
      return;
    }
    this._terminalChatURIs.set(terminalUri, chatURI);
    invocation.presentation = void 0;
    const sessionId = makeAhpTerminalToolSessionId(terminalUri, backendSession);
    const terminalCommandUri = URI.parse(terminalUri);
    const isPty = terminalContent.isPty !== false;
    const terminalInstance = isPty ? this._ensureTerminalInstance(terminalUri, sessionId) : void 0;
    const hasRetainedNonPtySnapshot = tc.status === "completed" /* Completed */ && !isPty && terminalContent.result?.exitCode !== void 0 && terminalContent.result.preview !== void 0;
    if (hasRetainedNonPtySnapshot) {
      outputTerminalAttachment.disposable.clear();
      outputTerminalAttachment.sessionId = void 0;
    } else if (!isPty && outputTerminalAttachment.sessionId !== sessionId) {
      outputTerminalAttachment.disposable.value = this._agentHostTerminalService.attachOutputTerminal(this._config.connection, terminalCommandUri, sessionId);
      outputTerminalAttachment.sessionId = sessionId;
    }
    const existing = invocation.toolSpecificData?.kind === "terminal" ? invocation.toolSpecificData : void 0;
    const identityChanged = !!existing && (existing.commandLine.original !== toolInput || existing.terminalToolSessionId !== sessionId || existing.terminalCommandUri?.toString() !== terminalCommandUri.toString());
    if (!existing || identityChanged) {
      invocation.toolSpecificData = {
        ...existing,
        kind: "terminal",
        commandLine: { original: toolInput },
        language: "shellscript",
        terminalToolSessionId: sessionId,
        terminalCommandUri,
        isPty,
        terminalCommandId: identityChanged ? void 0 : existing?.terminalCommandId,
        terminalCommandOutput: identityChanged ? void 0 : existing?.terminalCommandOutput,
        terminalCommandState: identityChanged ? void 0 : existing?.terminalCommandState,
        terminalTheme: identityChanged ? void 0 : existing?.terminalTheme
      };
      invocation.notifyToolSpecificDataChanged();
    }
    const current = invocation.toolSpecificData?.kind === "terminal" ? invocation.toolSpecificData : void 0;
    if (!terminalInstance || current?.terminalCommandId) {
      if (terminalInstance) {
        void terminalInstance.catch((error) => this._logService.error(`[AgentHost] Failed to revive terminal '${terminalUri}'`, error));
      }
      return;
    }
    void terminalInstance.then(() => {
      const current2 = invocation.toolSpecificData?.kind === "terminal" ? invocation.toolSpecificData : void 0;
      if (!current2 || current2.terminalToolSessionId !== sessionId || current2.terminalCommandId) {
        return;
      }
      const source = this._terminalChatService.getAhpCommandSource(sessionId);
      const command4 = source?.executingCommandObject ?? source?.commands[source.commands.length - 1];
      if (command4?.id) {
        invocation.toolSpecificData = { ...current2, terminalCommandId: command4.id };
        invocation.notifyToolSpecificDataChanged();
      }
    }, (error) => this._logService.error(`[AgentHost] Failed to revive terminal '${terminalUri}'`, error));
  }
  // ---- Subagent child session observation ---------------------------------
  /**
   * Enriches serialized history with inner tool calls from subagent child
   * sessions. For each subagent tool call found in the history, subscribes
   * to the corresponding child session and appends its inner tool calls
   * (with `subAgentInvocationId` set) to the response parts.
   */
  async _enrichHistoryWithSubagentCalls(history, parentSession, sessionResource, sessionState, observations) {
    const parentSessionStr = parentSession.toString();
    const parentToolCalls = /* @__PURE__ */ new Map();
    for (const turn of sessionState.turns) {
      for (const responsePart of turn.responseParts) {
        if (responsePart.kind === "toolCall" /* ToolCall */) {
          parentToolCalls.set(responsePart.toolCall.toolCallId, responsePart.toolCall);
        }
      }
    }
    const subagentChats = new Map(sessionState.chats.flatMap(
      (chat) => chat.origin?.kind === "tool" /* Tool */ ? [[chat.origin.toolCallId, chat]] : []
    ));
    const subagentInsertions = [];
    for (const item of history) {
      if (item.type !== "response") {
        continue;
      }
      for (let i2 = 0; i2 < item.parts.length; i2++) {
        const part = item.parts[i2];
        if (part.kind !== "toolInvocationSerialized") {
          continue;
        }
        const subagentChat = subagentChats.get(part.toolCallId);
        const parentToolCall = parentToolCalls.get(part.toolCallId);
        if (subagentChat) {
          const existing = part.toolSpecificData?.kind === "subagent" ? part.toolSpecificData : void 0;
          const taskDescription2 = parentToolCall ? readToolCallMeta(parentToolCall).subagentDescription?.trim() : void 0;
          part.toolSpecificData = {
            ...existing,
            kind: "subagent",
            description: taskDescription2 || subagentChat.title || existing?.description || (typeof part.invocationMessage === "string" ? part.invocationMessage : part.invocationMessage.value),
            chatResource: subagentChat.resource.toString()
          };
        }
        if (part.toolSpecificData?.kind === "subagent" && (subagentChat || !parentToolCall || shouldObserveSubagentChat(parentToolCall))) {
          const childChatUri = resolveRestoredSubagentChatResource(
            parentSessionStr,
            part.toolCallId,
            subagentChat?.resource.toString(),
            part.toolSpecificData.chatResource
          );
          part.toolSpecificData.chatResource = childChatUri;
          subagentInsertions.push({ item, index: i2, toolCallId: part.toolCallId, childChatUri });
        }
      }
    }
    if (subagentInsertions.length === 0) {
      return;
    }
    const childStateByUri = /* @__PURE__ */ new Map();
    const getChildState = (childChatUri) => {
      let existing = childStateByUri.get(childChatUri);
      if (!existing) {
        existing = this._loadSubagentState(parentSessionStr, childChatUri).then((state) => state ? observations.add(state) : void 0);
        childStateByUri.set(childChatUri, existing);
      }
      return existing;
    };
    const enrichedInsertions = await Promise.all(subagentInsertions.map(async ({ item, index: index2, toolCallId, childChatUri }) => {
      try {
        const observedState = await getChildState(childChatUri);
        const childState = observedState?.getState();
        let parentPart = item.parts[index2];
        if (childState) {
          this._applySubagentUsageToHistoryPart(parentPart, sessionResource, childState);
        }
        const parentToolCall = parentToolCalls.get(toolCallId);
        if (childState?.activeTurn && parentToolCall && parentPart.kind === "toolInvocationSerialized") {
          const serialized = parentPart;
          const invocation = toolCallStateToInvocation(parentToolCall, void 0, parentSession, this._config.connectionAuthority, void 0, void 0, this._config.connection.resourceUris);
          finalizeToolInvocation(invocation, parentToolCall, parentSession, this._config.connectionAuthority, this._config.connection.resourceUris);
          invocation.presentation = serialized.presentation;
          if (serialized.toolSpecificData?.kind === "subagent") {
            invocation.toolSpecificData = serialized.toolSpecificData;
          }
          item.parts[index2] = invocation;
          parentPart = invocation;
        }
        const innerParts = childState ? this._getSubagentInnerParts(childChatUri, toolCallId, childState) : [];
        if (observedState && childState && (parentPart instanceof ChatToolInvocation || innerParts.some((part) => part instanceof ChatToolInvocation))) {
          observations.add(observedState.onDidChange(() => {
            const latestState = observedState.getState();
            if (latestState) {
              this._refreshRestoredSubagentParts(parentPart, innerParts, sessionResource, childChatUri, latestState);
            }
          }));
        }
        return { item, index: index2, innerParts };
      } catch (err) {
        this._logService.warn(`[AgentHost] Failed to enrich history with subagent calls: ${childChatUri}`, err);
        return { item, index: index2, innerParts: [] };
      }
    }));
    for (const { item, index: index2, innerParts } of enrichedInsertions.sort((a, b) => b.index - a.index)) {
      if (innerParts.length > 0) {
        item.parts.splice(index2 + 1, 0, ...innerParts);
      }
    }
  }
  async _loadSubagentState(parentSessionUri, childChatUri) {
    const childSub = this._ensureSessionSubscription(parentSessionUri);
    try {
      await this._whenSubscriptionHydrated(childSub, CancellationToken.None);
      if (childSub.value instanceof Error) {
        throw childSub.value;
      }
      const childChatSub = this._ensureChatSubscription(parentSessionUri, childChatUri);
      await this._whenSubscriptionHydrated(childChatSub, CancellationToken.None);
      if (childChatSub.value instanceof Error) {
        throw childChatSub.value;
      }
      const store = new DisposableStore();
      const onDidChange = store.add(new Emitter());
      store.add(childSub.onDidChange(() => onDidChange.fire()));
      store.add(childChatSub.onDidChange(() => onDidChange.fire()));
      store.add(toDisposable(() => this._releaseChatSessionSubscriptions(parentSessionUri, childChatUri)));
      return {
        onDidChange: onDidChange.event,
        getState: () => this._getSessionState(parentSessionUri, childChatUri),
        dispose: () => store.dispose()
      };
    } catch (error) {
      this._releaseChatSessionSubscriptions(parentSessionUri, childChatUri);
      throw error;
    }
  }
  /**
   * Writes a subagent's accumulated cost (AIC) and model — summed across its
   * child session's turns — onto its serialized subagent tool call so the
   * hover survives a reload. Mirrors the live observers in
   * {@link _setupServerToolCall}.
   */
  _applySubagentUsageToHistoryPart(part, sessionResource, childState) {
    if (part.kind !== "toolInvocationSerialized" && part.kind !== "toolInvocation" || part.toolSpecificData?.kind !== "subagent") {
      return;
    }
    let credits = 0;
    let modelName;
    const lookup = this._createTurnModelLookup(sessionResource, void 0);
    const turns = childState.activeTurn && !childState.turns.some((turn) => turn.id === childState.activeTurn?.id) ? [...childState.turns, childState.activeTurn] : childState.turns;
    for (const turn of turns) {
      const turnCredits = usageInfoToChatUsage(turn.usage)?.copilotCredits;
      if (typeof turnCredits === "number") {
        credits += turnCredits;
      }
      const turnModelName = lookup.toBilledModelDisplayName?.(turn.usage);
      if (turnModelName) {
        modelName = turnModelName;
      }
    }
    if (credits > 0) {
      part.toolSpecificData.credits = credits;
    }
    if (modelName) {
      part.toolSpecificData.modelName = modelName;
    }
    const timing = getSubagentTiming(childState);
    part.toolSpecificData.isActive = !!childState.activeTurn;
    part.toolSpecificData.startedAt = timing.startedAt;
    part.toolSpecificData.duration = timing.duration;
    if (part instanceof ChatToolInvocation) {
      part.notifyToolSpecificDataChanged();
    }
  }
  _refreshRestoredSubagentParts(parentPart, innerParts, sessionResource, childChatUri, childState) {
    this._applySubagentUsageToHistoryPart(parentPart, sessionResource, childState);
    const toolCalls = /* @__PURE__ */ new Map();
    const turns = childState.activeTurn && !childState.turns.some((turn) => turn.id === childState.activeTurn?.id) ? [...childState.turns, childState.activeTurn] : childState.turns;
    for (const turn of turns) {
      for (const responsePart of turn.responseParts) {
        if (responsePart.kind === "toolCall" /* ToolCall */) {
          toolCalls.set(responsePart.toolCall.toolCallId, responsePart.toolCall);
        }
      }
    }
    const childResource = URI.parse(childChatUri);
    for (const part of innerParts) {
      if (!(part instanceof ChatToolInvocation)) {
        continue;
      }
      const toolCall = toolCalls.get(part.toolCallId);
      if (!toolCall) {
        continue;
      }
      if ((toolCall.status === "completed" /* Completed */ || toolCall.status === "cancelled" /* Cancelled */) && !IChatToolInvocation.isComplete(part)) {
        finalizeToolInvocation(part, toolCall, childResource, this._config.connectionAuthority, this._config.connection.resourceUris);
      } else if (toolCall.status === "running" /* Running */) {
        updateRunningToolSpecificData(part, toolCall, childResource, this._config.connectionAuthority, this._config.connection.resourceUris);
        part.notifyToolSpecificDataChanged();
      }
    }
  }
  _getSubagentInnerParts(childSessionUri, toolCallId, childState) {
    const innerParts = [];
    const turns = childState.activeTurn && !childState.turns.some((turn) => turn.id === childState.activeTurn?.id) ? [...childState.turns, childState.activeTurn] : childState.turns;
    for (const turn of turns) {
      for (const rp of turn.responseParts) {
        if (rp.kind === "toolCall" /* ToolCall */) {
          const tc = rp.toolCall;
          if (tc.status === "completed" /* Completed */ || tc.status === "cancelled" /* Cancelled */) {
            const completedTc = tc;
            const fileEditParts = completedToolCallToEditParts(completedTc, this._config.connectionAuthority);
            const serialized = completedToolCallToSerialized(completedTc, toolCallId, URI.parse(childSessionUri), this._config.connectionAuthority, this._config.connection.resourceUris);
            if (fileEditParts.length > 0) {
              serialized.presentation = "hidden" /* Hidden */;
            }
            innerParts.push(serialized);
            innerParts.push(...fileEditParts);
          } else {
            innerParts.push(toolCallStateToInvocation(tc, toolCallId, URI.parse(childSessionUri), this._config.connectionAuthority, void 0, void 0, this._config.connection.resourceUris));
          }
        }
      }
    }
    return innerParts;
  }
  /**
   * Subscribes to a child subagent session and forwards its tool calls
   * as progress parts into the parent session's response, with
   * `subAgentInvocationId` set so the renderer groups them under the parent
   * subagent widget.
   *
   * Implementation: builds a per-turn-id keyed observation over the child
   * session's `turns` and `activeTurn`. Each turn id discovered gets its
   * own {@link _observeTurn} instance running in subagent mode (which skips
   * markdown/reasoning/input-request emission and tags tool calls with the
   * parent tool call id). Each per-turn observer self-disposes when its
   * turn reaches a terminal state; the outer observation is torn down when
   * the caller disposes `disposables`.
   */
  _observeSubagentSession(sessionResource, parentSession, parentToolCallId, childChatUri, rootInvocationId, parentInvocation, emitProgress, disposables, subagentContext, perInvocationCreditsAccumulator, perInvocationModel) {
    const parentSessionUri = parentSession.toString();
    const cts = new CancellationTokenSource();
    disposables.add(toDisposable(() => cts.dispose(true)));
    disposables.add(toDisposable(() => {
      if (parentInvocation.toolSpecificData?.kind === "subagent" && parentInvocation.toolSpecificData.isActive) {
        parentInvocation.toolSpecificData.isActive = false;
        parentInvocation.notifyToolSpecificDataChanged();
      }
    }));
    try {
      const childSub = this._ensureSessionSubscription(parentSessionUri);
      const childChatSub = this._ensureChatSubscription(parentSessionUri, childChatUri);
      disposables.add(toDisposable(() => this._releaseChatSessionSubscriptions(parentSessionUri, childChatUri)));
      const childSessionState$ = observableFromSubscription(this, childSub);
      const childChatState$ = observableFromSubscription(this, childChatSub);
      const childState$ = derived((reader) => {
        const session = childSessionState$.read(reader);
        if (!session) {
          return void 0;
        }
        return mergeSessionWithDefaultChat(session, childChatState$.read(reader));
      });
      disposables.add(autorun((reader) => {
        const state = childState$.read(reader);
        if (!state || !state.activeTurn && state.turns.length === 0) {
          return;
        }
        const isActive2 = !!state.activeTurn;
        if (parentInvocation.toolSpecificData?.kind === "subagent") {
          const timing = getSubagentTiming(state);
          const lastResponsePart = state.activeTurn?.responseParts.at(-1);
          const activity = lastResponsePart?.kind === "markdown" /* Markdown */ ? "markdown" : lastResponsePart?.kind === "reasoning" /* Reasoning */ ? "reasoning" : void 0;
          const fallbackDuration = !isActive2 && timing.duration === void 0 && parentInvocation.toolSpecificData.isActive && parentInvocation.toolSpecificData.startedAt !== void 0 ? Date.now() - parentInvocation.toolSpecificData.startedAt : timing.duration;
          if (parentInvocation.toolSpecificData.isActive !== isActive2 || parentInvocation.toolSpecificData.activity !== activity || parentInvocation.toolSpecificData.startedAt !== timing.startedAt || parentInvocation.toolSpecificData.duration !== fallbackDuration) {
            parentInvocation.toolSpecificData.isActive = isActive2;
            if (activity) {
              parentInvocation.toolSpecificData.activity = activity;
            } else {
              delete parentInvocation.toolSpecificData.activity;
            }
            parentInvocation.toolSpecificData.startedAt = timing.startedAt;
            parentInvocation.toolSpecificData.duration = fallbackDuration;
            parentInvocation.notifyToolSpecificDataChanged();
          }
        }
      }));
      const childTurnIds$ = derived((reader) => {
        const state = childState$.read(reader);
        if (!state) {
          return [];
        }
        const ids = state.turns.map((t2) => ({ id: t2.id }));
        const activeId = state.activeTurn?.id;
        if (activeId !== void 0 && !state.turns.some((t2) => t2.id === activeId)) {
          ids.push({ id: activeId });
        }
        return ids;
      });
      disposables.add(autorunPerKeyedItem(
        childTurnIds$,
        (t2) => t2.id,
        (turnId, _t$, turnStore) => {
          turnStore.add(this._observeTurn({
            backendSession: parentSession,
            sessionResource,
            chatURI: childChatUri,
            turnId,
            sink: emitProgress,
            cancellationToken: cts.token,
            subAgentInvocationId: rootInvocationId,
            subAgentCreditsAccumulator: perInvocationCreditsAccumulator,
            subAgentModelObservable: perInvocationModel
          }));
        }
      ));
    } catch (err) {
      subagentContext.observations.deleteAndDispose(parentToolCallId);
      this._logService.warn(`[AgentHost] Failed to subscribe to subagent chat: ${childChatUri}`, err);
    }
  }
  // ---- Reconnection to active turn ----------------------------------------
  /**
   * Wires up an ongoing state listener that streams incremental progress
   * from an already-running turn into the chat session's progressObs.
   * This is the reconnection counterpart of {@link _handleTurn}, which
   * handles newly-initiated turns.
   */
  _reconnectToActiveTurn(backendSession, turnId, chatSession, initialProgress, initialResponsePartCount) {
    const sessionKey = backendSession.toString();
    const chatURI = this._getChatURI(chatSession.sessionResource);
    const snapshotToolCalls = /* @__PURE__ */ new Map();
    for (const item of initialProgress) {
      if (item instanceof ChatToolInvocation || item.kind === "toolInvocationSerialized") {
        snapshotToolCalls.set(item.toolCallId, item);
      }
    }
    const seedEmittedLengths = /* @__PURE__ */ new Map();
    const currentState = this._getSessionState(sessionKey, chatURI);
    if (currentState?.activeTurn) {
      for (const rp of currentState.activeTurn.responseParts) {
        if (rp.kind === "markdown" /* Markdown */ || rp.kind === "reasoning" /* Reasoning */) {
          seedEmittedLengths.set(rp.id, rp.content.length);
        }
      }
    }
    const cts = new CancellationTokenSource();
    const reconnectStore = chatSession.registerDisposable(new DisposableStore());
    reconnectStore.add(toDisposable(() => cts.dispose(true)));
    reconnectStore.add(this._observeTurn({
      backendSession,
      sessionResource: chatSession.sessionResource,
      chatURI,
      turnId,
      sink: (parts) => chatSession.appendProgress(parts),
      cancellationToken: cts.token,
      snapshotToolCalls,
      seedEmittedLengths,
      initialResponsePartCount,
      onTurnEnded: () => {
        this._completeSessionTurn(backendSession, chatSession.sessionResource, turnId, chatSession);
        reconnectStore.dispose();
      }
    }));
  }
  // ---- File edit routing ---------------------------------------------------
  /**
   * Ensures the chat model has a snapshot controller bound (creating one
   * via our registered editing-session provider if needed) and returns it.
   * Hydrates the controller from any pending history turns on first access.
   */
  _ensureSnapshotController(sessionResource) {
    const chatModel = this._chatService.getSession(sessionResource);
    if (!chatModel) {
      return void 0;
    }
    if (!chatModel.editingSession) {
      chatModel.startEditingSession();
    }
    const editingSession = chatModel.editingSession;
    if (!(editingSession instanceof AgentHostSnapshotController)) {
      return void 0;
    }
    const pendingTurns = this._pendingHistoryTurns.get(sessionResource);
    if (pendingTurns) {
      this._pendingHistoryTurns.delete(sessionResource);
      for (const turn of pendingTurns) {
        editingSession.ensureRequestCheckpoint(turn.id);
        for (const rp of turn.responseParts) {
          if (rp.kind === "toolCall" /* ToolCall */) {
            editingSession.addToolCallEdits(turn.id, rp.toolCall);
          }
        }
      }
    }
    return editingSession;
  }
  /**
   * Records snapshot data for a completed tool call (so restore-snapshot
   * works) and returns the {@link IChatExternalEdit} progress parts to
   * render the per-file edit pills.
   */
  _hydrateFileEdits(sessionResource, requestId, tc) {
    const controller = this._ensureSnapshotController(sessionResource);
    controller?.addToolCallEdits(requestId, tc);
    if (tc.status !== "completed" /* Completed */) {
      return [];
    }
    return completedToolCallToEditParts(tc, this._config.connectionAuthority);
  }
  // ---- Session resolution -------------------------------------------------
  /**
   * Attaches to an existing server-side terminal via the agent host
   * terminal service and registers it with the terminal chat service.
   *
   * Returns the terminal instance created or reused by the terminal service.
   */
  _ensureTerminalInstance(terminalUri, terminalToolSessionId) {
    return this._agentHostTerminalService.reviveTerminal(
      this._config.connection,
      URI.parse(terminalUri),
      terminalToolSessionId
    );
  }
  /** Maps a UI session resource to a backend provider URI. */
  _resolveSessionUri(sessionResource) {
    const provisionalSession = this._provisionalService.get(sessionResource);
    if (provisionalSession) {
      return provisionalSession;
    }
    const rawId = sessionResource.path.substring(1);
    return AgentSession.uri(this._config.backendSessionScheme ?? this._config.provider, rawId);
  }
  _isNewSessionResource(sessionResource) {
    return !!this._config.isNewSession?.(sessionResource) || this._workingDirectoryResolver.isNewSession(sessionResource);
  }
  /**
   * Forks the conversation at the given request point into a new peer chat
   * of the same session. AHP models forking at the chat level only, so the
   * fork stays inside the source session and is addressed by a chat
   * fragment on the session resource.
   */
  async _forkSession(sessionResource, backendSession, request2, token) {
    if (token.isCancellationRequested) {
      throw new Error("Cancelled");
    }
    const agentInfo = this._getRootState()?.agents.find((a) => a.provider === this._config.provider);
    if (!agentInfo?.capabilities?.multipleChats?.fork) {
      throw new Error(`Provider ${this._config.provider} does not support forking`);
    }
    const sessionUri = backendSession.toString();
    const rawSessionState = this._getRawSessionState(sessionUri);
    if (!rawSessionState) {
      throw new Error(`Cannot fork: session state is not hydrated for ${sessionUri}`);
    }
    const sourceChat = this._resolveChatUriFromState(sessionResource, rawSessionState);
    const protocolState = this._getSessionState(sessionUri, sourceChat);
    let turnIndex;
    if (request2) {
      const requestIdx = protocolState?.turns.findIndex((t2) => t2.id === request2.id);
      if (requestIdx === void 0 || requestIdx < 0) {
        throw new Error(`Cannot fork: turn for request ${request2.id} not found in protocol state`);
      }
      turnIndex = requestIdx - 1;
      if (turnIndex < 0) {
        throw new Error("Cannot fork: cannot fork before the first request");
      }
    } else if (protocolState?.turns.length) {
      turnIndex = protocolState.turns.length - 1;
    }
    if (turnIndex === void 0) {
      throw new Error("Cannot fork: no turns to fork from");
    }
    const turnId = protocolState.turns[turnIndex].id;
    const chatModel = this._chatService.getSession(sessionResource);
    const forkedChatId = generateUuid();
    const forkedChat = URI.parse(buildChatUri(backendSession, forkedChatId));
    await this._config.connection.createChat(backendSession, forkedChat, {
      model: lastTurnModelSelection(protocolState),
      fork: { source: URI.parse(sourceChat), turnId }
    });
    const sessionSubscription = this._ensureSessionSubscription(sessionUri);
    const forkedSummary = await waitForState(
      observableFromSubscription(this, sessionSubscription).map((state) => state?.chats.find((summary) => parseChatUri(summary.resource)?.chatId === forkedChatId)),
      (summary) => !!summary,
      void 0,
      token
    );
    const forkedResource = URI.from({ scheme: this._config.sessionType, path: sessionResource.path, fragment: forkedChatId });
    const now = Date.now();
    const forkedLabel = forkedSummary.title || chatModel?.title || localize(9004, null);
    return {
      resource: forkedResource,
      label: forkedLabel,
      iconPath: getAgentSessionProviderIcon(this._config.sessionType),
      timing: { created: now, lastRequestStarted: now, lastRequestEnded: now }
    };
  }
  async _ensureRequiredAuthentication(model) {
    const agentInfo = this._getRootState()?.agents.find((a) => a.provider === this._config.provider);
    const protectedResources = agentInfo?.protectedResources ?? [];
    const allowSignedOutWhenUsable = this._configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true;
    if (modelRequiresAgentAuthentication(agentInfo, model, allowSignedOutWhenUsable) && this._config.resolveAuthentication) {
      const authenticated = await this._config.resolveAuthentication(protectedResources);
      if (!authenticated) {
        throw new Error(localize(8993, null));
      }
    }
    return protectedResources;
  }
  /** Creates a new backend session and subscribes to its state. */
  async _createAndSubscribe(sessionResource, model, config, importConversation, onFailureStage) {
    const workingDirectories = this._resolveRequestedWorkingDirectories(sessionResource);
    const requestedSession = this._resolveSessionUri(sessionResource);
    const meta = this._provisionalService.getInitialSessionMetadata(sessionResource);
    this._logService.trace(`[AgentHost] Creating new session, model=${model?.id ?? "(default)"}, provider=${this._config.provider}`);
    onFailureStage?.("authentication");
    const protectedResources = await this._ensureRequiredAuthentication(model);
    const activeClientEntry = this._ensureActiveClientEntry(sessionResource);
    await activeClientEntry.whenSettled();
    const activeClient = this._getCurrentActiveClient(sessionResource);
    const progressToken = generateUuid();
    let session;
    onFailureStage?.("createSession");
    try {
      session = await this._config.connection.createSession({
        session: requestedSession,
        _meta: meta,
        model,
        provider: this._config.provider,
        workingDirectories,
        config,
        importConversation,
        activeClient,
        progressToken
      });
    } catch (err) {
      if (this._isAuthRequiredError(err) && this._config.resolveAuthentication) {
        onFailureStage?.("authentication");
        this._logService.info("[AgentHost] Authentication required, prompting user...");
        const authenticated = await this._config.resolveAuthentication(protectedResources);
        if (authenticated) {
          onFailureStage?.("createSession");
          session = await this._config.connection.createSession({
            session: requestedSession,
            _meta: meta,
            model,
            provider: this._config.provider,
            workingDirectories,
            config,
            importConversation,
            activeClient,
            progressToken
          });
        } else {
          throw new Error(localize(8993, null));
        }
      } else {
        throw err;
      }
    }
    this._provisionalService.clearSessionCreationMetadata(sessionResource);
    if (requestedSession && !isEqual2(session, requestedSession)) {
      throw new Error(`Agent host returned unexpected session URI. Expected ${requestedSession.toString()}, got ${session.toString()}`);
    }
    this._config.onSessionMaterialized?.(sessionResource);
    this._logService.trace(`[AgentHost] Created session: ${session.toString()}`);
    onFailureStage?.("subscribeSession");
    const newSub = this._ensureSessionSubscription(session.toString());
    this._configureActiveClientReconciliation(sessionResource, session, newSub);
    if (!this._getSessionState(session.toString())) {
      await this._whenSubscriptionHydrated(newSub, CancellationToken.None);
    }
    const rawState = this._requireRawSessionState(session.toString());
    const chatURI = this._resolveChatUriFromState(sessionResource, rawState);
    this._setChatURI(sessionResource, chatURI);
    const chatSub = this._ensureChatSubscription(session.toString(), chatURI);
    this._activeSessions.get(sessionResource)?.setStateSubscriptions(newSub, chatSub);
    this._ensurePendingMessageSubscription(sessionResource, session);
    this._watchForServerInitiatedTurns(session, sessionResource);
    return session;
  }
  /**
   * Keeps chat model and protocol pending messages synchronized in both directions.
   * No-ops if already subscribed.
   */
  _ensurePendingMessageSubscription(sessionResource, backendSession) {
    if (this._pendingMessageSubscriptions.has(sessionResource)) {
      return;
    }
    const chatModel = this._chatService?.getSession(sessionResource);
    if (chatModel) {
      const store = new DisposableStore();
      this._pendingMessageSubscriptions.set(sessionResource, store);
      this._applyRemotePendingMessages(sessionResource, backendSession);
      store.add(chatModel.onDidChangePendingRequests(() => {
        this._syncPendingMessages(sessionResource, backendSession);
      }));
      this._syncPendingMessages(sessionResource, backendSession);
      const sessionStr = backendSession.toString();
      const chatURI = this._chatURIsBySessionResource.get(sessionResource);
      if (chatURI) {
        const onRemoteChange = () => this._applyRemotePendingMessages(sessionResource, backendSession);
        store.add(this._ensureSessionSubscription(sessionStr).onDidChange(onRemoteChange));
        store.add(this._ensureChatSubscription(sessionStr, chatURI).onDidChange(onRemoteChange));
      }
      return;
    }
    this._pendingMessageSubscriptions.set(sessionResource, this._chatService.onDidCreateModel((model) => {
      if (!isEqual2(model.sessionResource, sessionResource)) {
        return;
      }
      this._pendingMessageSubscriptions.deleteAndDispose(sessionResource);
      this._ensurePendingMessageSubscription(sessionResource, backendSession);
    }));
  }
  _ensureDraftSyncSubscription(sessionResource, backendSession, chatKey) {
    if (this._draftSyncSubscriptions.has(sessionResource)) {
      return;
    }
    const store = new DisposableStore();
    this._draftSyncSubscriptions.set(sessionResource, store);
    this._acquireOrWaitForSession(sessionResource, store).then((chatModel) => {
      if (!chatModel || store.isDisposed) {
        return;
      }
      this._installDraftSync(sessionResource, chatModel, backendSession, chatKey, store);
    }, (err) => {
      if (!store.isDisposed) {
        this._logService.error(`[AgentHost] Failed to wait for chat model for draft sync: ${sessionResource.toString()}`, err);
      }
    });
  }
  async _acquireOrWaitForSession(sessionResource, owner) {
    const existing = this._chatService.getSession(sessionResource);
    if (existing) {
      return existing;
    }
    const waitStore = owner.add(new DisposableStore());
    try {
      return await new Promise((resolve3) => {
        waitStore.add(toDisposable(() => resolve3(void 0)));
        waitStore.add(this._chatService.onDidCreateModel((model) => {
          if (isEqual2(model.sessionResource, sessionResource)) {
            resolve3(model);
          }
        }));
      });
    } finally {
      waitStore.dispose();
    }
  }
  _installDraftSync(sessionResource, chatModel, backendSession, chatKey, store) {
    const inputModel = chatModel.inputModel;
    if (!inputModel) {
      return;
    }
    const delayer5 = store.add(new Delayer(AgentHostSessionHandler.DRAFT_SYNC_DEBOUNCE_MS));
    const chatSubscription = this._ensureChatSubscription(backendSession.toString(), chatKey);
    const readRemoteDraft = () => {
      const value2 = chatSubscription.value;
      return value2 && !(value2 instanceof Error) ? value2.draft : void 0;
    };
    const draftState = new DraftSyncState(readRemoteDraft());
    let lastRemoteDraft = draftState.synced;
    const syncDraft = (state) => {
      if (state?.origin === "remote" /* Remote */) {
        return;
      }
      let draft = this._inputStateToDraft(sessionResource, state);
      if (draft && draftState.remoteModel && !isInConversationModelChoice(state?.selectedModelReason)) {
        draft = { ...draft, model: draftState.remoteModel };
      }
      if (!draftState.shouldPublish(draft)) {
        return;
      }
      this._config.connection.dispatch(chatKey, {
        type: "chat/draftChanged" /* ChatDraftChanged */,
        draft
      });
    };
    store.add(autorun((reader) => {
      const state = inputModel.state.read(reader);
      delayer5.trigger(() => syncDraft(state)).catch(() => {
      });
    }));
    store.add(chatSubscription.onDidChange(() => {
      const remoteDraft = readRemoteDraft();
      if (remoteDraft === lastRemoteDraft) {
        return;
      }
      lastRemoteDraft = remoteDraft;
      if (equals4(draftState.synced, remoteDraft)) {
        return;
      }
      const localDraft = this._inputStateToDraft(sessionResource, inputModel.state.get());
      if (!equals4(draftState.synced, localDraft)) {
        return;
      }
      draftState.applyRemote(remoteDraft);
      this._applyRemoteDraft(inputModel, sessionResource, remoteDraft);
    }));
    store.add(toDisposable(() => {
      delayer5.cancel();
      syncDraft(inputModel.state.get());
    }));
  }
  /** Applies a remote draft without replacing local input state the protocol does not carry. */
  _applyRemoteDraft(inputModel, sessionResource, draft) {
    if (!draft) {
      inputModel.setState({
        inputText: "",
        selections: [],
        attachments: [],
        origin: "remote" /* Remote */
      });
      return;
    }
    const serializedState = this._draftToInputState(sessionResource, draft);
    if (!serializedState) {
      return;
    }
    const state = reviveSerializableInputState(serializedState);
    const partialState = {
      inputText: state.inputText,
      selections: state.selections,
      attachments: state.attachments,
      mode: state.mode,
      origin: "remote" /* Remote */
    };
    if (state.selectedModel) {
      partialState.selectedModel = state.selectedModel;
      partialState.modelConfiguration = state.modelConfiguration;
    }
    inputModel.setState(partialState);
  }
  _inputStateToDraft(sessionResource, state) {
    if (!state) {
      return void 0;
    }
    const model = this._createModelSelection(state.selectedModel?.identifier, state.modelConfiguration);
    const agentUri = state.mode.kind === "agent" /* Agent */ && state.mode.id !== ChatMode.Agent.id ? state.mode.id : void 0;
    const attachments = this._variableEntriesToAttachments(state.attachments, sessionResource, state.inputText, false);
    if (!state.inputText && !model && !agentUri && attachments.length === 0) {
      return void 0;
    }
    return {
      text: state.inputText,
      origin: { kind: "user" /* User */ },
      ...attachments.length > 0 ? { attachments } : {},
      ...model ? { model } : {},
      ...agentUri ? { agent: { uri: agentUri } } : {}
    };
  }
  /**
   * Check if an error is an "authentication required" error.
   * Checks for the AHP_AUTH_REQUIRED error code when available,
   * with a message-based fallback for transports that don't preserve
   * structured error codes (e.g. ProxyChannel).
   */
  _isAuthRequiredError(err) {
    if (err instanceof ProtocolError && err.code === AHP_AUTH_REQUIRED) {
      return true;
    }
    if (err instanceof Error && err.message.includes("Authentication required")) {
      return true;
    }
    return false;
  }
  _createModelSelection(languageModelIdentifier, modelConfiguration) {
    const rawModelId = this._extractRawModelId(languageModelIdentifier);
    if (!rawModelId) {
      return void 0;
    }
    const config = {};
    for (const [key3, value2] of Object.entries(modelConfiguration ?? {})) {
      if (typeof value2 === "string" || typeof value2 === "number" || typeof value2 === "boolean" || value2 === null) {
        config[key3] = value2;
      }
    }
    return Object.keys(config).length > 0 ? { id: rawModelId, config } : { id: rawModelId };
  }
  _draftToInputState(sessionResource, draft) {
    if (!draft) {
      return void 0;
    }
    const modelId = this._toLanguageModelId(sessionResource, draft.model?.id);
    const metadata = modelId ? this._languageModelsService.lookupLanguageModel(modelId) : void 0;
    const variableData = messageAttachmentsToVariableData(draft.attachments, this._config.connectionAuthority, draft.text);
    const cursor = offsetToPosition2(draft.text, draft.text.length);
    return {
      attachments: variableData?.variables ?? [],
      contrib: {},
      inputText: draft.text,
      mode: { id: draft.agent?.uri ?? ChatMode.Agent.id, kind: "agent" /* Agent */ },
      selectedModel: modelId && metadata ? {
        identifier: modelId,
        metadata,
        ...draft.model?.config ? { modelConfiguration: draft.model.config } : {}
      } : void 0,
      selections: [{
        selectionStartLineNumber: cursor.lineNumber,
        selectionStartColumn: cursor.column,
        positionLineNumber: cursor.lineNumber,
        positionColumn: cursor.column
      }]
    };
  }
  /**
   * Extracts the raw model id from a language-model service identifier.
   * E.g. "agent-host-copilot:claude-sonnet-4-20250514" → "claude-sonnet-4-20250514".
   * Foreign extension-host identifiers (`${vendor}/${id}`) are dropped so
   * the agent host falls back to its default model.
   */
  _extractRawModelId(languageModelIdentifier) {
    if (!languageModelIdentifier) {
      return void 0;
    }
    const prefix = this._config.sessionType + ":";
    if (languageModelIdentifier.startsWith(prefix)) {
      return languageModelIdentifier.substring(prefix.length);
    }
    if (languageModelIdentifier.includes("/")) {
      this._logService.warn(`[AgentHost] Dropping foreign model identifier '${languageModelIdentifier}' for session type '${this._config.sessionType}'; falling back to default model.`);
      return void 0;
    }
    return languageModelIdentifier;
  }
  _toLanguageModelId(sessionResource, rawModelId) {
    if (!rawModelId) {
      return void 0;
    }
    const prefix = `${getChatSessionType(sessionResource)}:`;
    return rawModelId.startsWith(prefix) ? rawModelId : `${prefix}${rawModelId}`;
  }
  _getTurnResponseDetails(sessionResource, backendSession, turn) {
    const fallbackRawModelId = turn?.message?.model?.id ?? lastTurnModelSelection(this._getSessionState(backendSession.toString()))?.id;
    return this._createTurnModelLookup(sessionResource, fallbackRawModelId).toResponseDetails(turn?.usage?.model, turn?.usage);
  }
  /**
   * Builds a per-turn model lookup that namespaces raw AHP model ids into
   * chat-layer language-model ids and resolves human-readable display
   * names via the registered language-model providers (so the chat UI's
   * per-response footer can show e.g. "Claude Opus 4.7" instead of the
   * raw model id). `fallbackRawModelId` is used when a turn's
   * `usage?.model` is not yet set (e.g. older sessions or turns that
   * never reported usage).
   */
  _createTurnModelLookup(sessionResource, fallbackRawModelId, hideAutoExplainability = this._hideAutoExplainability.get()) {
    const resolveRaw = (rawModelId) => rawModelId ?? fallbackRawModelId;
    const lookupRawModel = (rawModelId) => {
      const normalizedRaw = rawModelId?.replace(/-(\d+)$/, ".$1");
      for (const candidate of [rawModelId, normalizedRaw !== rawModelId ? normalizedRaw : void 0]) {
        const modelId = this._toLanguageModelId(sessionResource, candidate);
        if (!modelId) {
          continue;
        }
        const model = this._languageModelsService.lookupLanguageModel(modelId);
        if (model) {
          return { identifier: modelId, model, resolvedFromRaw: true };
        }
      }
      return void 0;
    };
    const lookupModel = (rawModelId) => {
      const rawModel = lookupRawModel(rawModelId);
      if (rawModel) {
        return rawModel;
      }
      const fallbackModelId = this._toLanguageModelId(sessionResource, fallbackRawModelId);
      if (fallbackModelId) {
        const model = this._languageModelsService.lookupLanguageModel(fallbackModelId);
        if (model) {
          return { identifier: fallbackModelId, model, resolvedFromRaw: false };
        }
      }
      return void 0;
    };
    const resolveBilledModel = (rawModelId, usage) => {
      const routed = !!readUsageInfoMeta(usage).autoModeResolved;
      const billedId = routed && hideAutoExplainability ? AUTO_RAW_MODEL_ID : rawModelId;
      return { billedId, resolved: lookupModel(billedId) };
    };
    const displayName = (resolved) => {
      const model = { identifier: resolved.identifier, metadata: resolved.model };
      return getLanguageModelDisplayNameWithSubscriptionSource(model, getLanguageModelDisplayNameWithProvider(model, this._languageModelsService));
    };
    return {
      toLanguageModelId: (rawModelId) => this._toLanguageModelId(sessionResource, resolveRaw(rawModelId)),
      toModelDisplayName: (rawModelId) => lookupRawModel(rawModelId)?.model.name,
      toResponseDetails: (rawModelId, usage) => {
        const { billedId, resolved } = resolveBilledModel(rawModelId, usage);
        const billedModelId = resolved && !resolved.resolvedFromRaw ? billedId : void 0;
        const responseModel = resolved ? {
          name: displayName(resolved),
          pricing: resolved.model.pricing
        } : void 0;
        return formatTurnResponseDetails(responseModel, billedModelId, usage);
      },
      toBilledModelDisplayName: (usage) => {
        const chosenModel = readUsageInfoMeta(usage).autoModeResolved?.chosenModel;
        const { resolved } = resolveBilledModel(chosenModel ?? usage?.model, usage);
        return resolved ? displayName(resolved) : void 0;
      },
      toAutoModeResolution: (usage) => {
        const resolution = readUsageInfoMeta(usage).autoModeResolved;
        const isAutoTurn = fallbackRawModelId === AUTO_RAW_MODEL_ID || !!resolution;
        if (!isAutoTurn || hideAutoExplainability !== false) {
          return void 0;
        }
        if (!resolution) {
          return { kind: "autoModeResolution" };
        }
        const resolved = lookupRawModel(resolution.chosenModel);
        const name = resolved && displayName(resolved);
        return usageInfoToAutoModeResolution(usage, name);
      }
    };
  }
  _resolveRequestedWorkingDirectory(sessionResource) {
    return this._config.resolveWorkingDirectory?.(sessionResource) ?? this._newSessionFolderService?.getFolder(sessionResource) ?? this._workingDirectoryResolver?.resolve(sessionResource) ?? this._newSessionFolderService?.getDefaultFolder() ?? this._workspaceContextService.getWorkspace().folders[0]?.uri;
  }
  /** `undefined` is preserved for createSession to let the host choose its working directories. */
  _resolveRequestedWorkingDirectories(sessionResource) {
    const primary = this._resolveRequestedWorkingDirectory(sessionResource);
    return this._hostAddressableWorkingDirectories(
      computeWorkingDirectories(primary, this._workspaceContextService.getWorkspace().folders.map((folder) => folder.uri), this._getRootState(), this._config.provider)
    );
  }
  /**
   * Drop working directories whose scheme the host cannot address, falling back to `undefined` so
   * it picks its own. Schemes are compared as the host receives them, after unwrapping.
   */
  _hostAddressableWorkingDirectories(directories) {
    const defaultDirectory = this._config.connection.initializeResult.get()?.defaultDirectory;
    if (!directories?.length || !defaultDirectory) {
      return directories;
    }
    const hostScheme = URI.isUri(defaultDirectory) ? URI.revive(defaultDirectory).scheme : URI.parse(defaultDirectory).scheme;
    const addressable = directories.filter((directory) => this._config.connection.resourceUris.toAgentHost(directory).scheme === hostScheme);
    if (addressable.length === directories.length) {
      return directories;
    }
    this._logService.warn(`[AgentHost] Host addresses '${hostScheme}' working directories; dropping ${directories.length - addressable.length} that it cannot use.`);
    return addressable.length > 0 ? addressable : void 0;
  }
  /**
   * Scope roots always describe a concrete customization lookup. This differs
   * from `_resolveRequestedWorkingDirectories`: its `undefined` is protocol
   * meaningful and lets the host choose working directories for createSession.
   *
   * An existing session's roots are fixed at creation and persisted in its
   * state, so they are read from there rather than recomputed from the current
   * workspace — otherwise a single-folder session opened inside a multi-root
   * workspace would pick up the other workspace folders. New sessions have no
   * state yet, so they fall back to the workspace-derived set they will be
   * created with.
   */
  _resolveCustomizationScopeRoots(sessionResource) {
    if (!this._isNewSessionResource(sessionResource)) {
      const own = this._existingSessionWorkingDirectories(sessionResource);
      if (own !== void 0) {
        return own;
      }
    }
    return this._resolveRequestedWorkingDirectories(sessionResource) ?? [];
  }
  /**
   * The working directories an already-created session was started with, read
   * from its authoritative (hydrated) state.
   *
   * Returns `undefined` when the session's working directories are absent — no
   * hydrated state yet, or a session that inherits its directories — so callers
   * fall back to the workspace-derived set. An explicit empty set is
   * authoritative and returned as `[]`: a workspace-less session must not
   * inherit the current workspace's roots. This mirrors the host-side
   * `undefined` (inherit) vs `[]` (explicitly none) distinction.
   */
  _existingSessionWorkingDirectories(sessionResource) {
    const backendSession = this._resolveSessionUri(sessionResource);
    const dirs = this._getRawSessionState(backendSession.toString())?.workingDirectories;
    if (dirs === void 0) {
      return void 0;
    }
    return dirs.map((directory) => typeof directory === "string" ? URI.parse(directory) : directory);
  }
  /**
   * Resolves the local folders the agent will run in, for the workspace-trust
   * gate: an existing session's persisted working directories, or a new session's
   * requested ones.
   *
   * Returns `undefined` for a workspace-less session (a quick chat) to signal the
   * caller to skip the folder-trust gate entirely: its only working directory is
   * an internal scratch dir (`~/.copilot/chats/<id>`), an implementation detail
   * rather than a user workspace, so it must not be treated as a trust root.
   * Otherwise an explicit empty set is honored and only a genuinely unresolved set
   * falls back to the requested/workspace folders.
   */
  async _resolveSessionTrustFolders(sessionResource, token) {
    if (!this._isNewSessionResource(sessionResource)) {
      const backendSession = this._resolveSessionUri(sessionResource);
      let state = this._getRawSessionState(backendSession.toString());
      if (state?.workingDirectories === void 0) {
        state = await this._readEagerlyCreatedSessionState(backendSession, token) ?? state;
      }
      if (state && readSessionWorkspaceless(state._meta)) {
        return void 0;
      }
      const dirs = state?.workingDirectories;
      if (state && dirs !== void 0) {
        await this._inheritWorktreeTrust(state);
        return dirs.map((directory) => typeof directory === "string" ? URI.parse(directory) : directory);
      }
    }
    return this._resolveRequestedWorkingDirectories(sessionResource) ?? [];
  }
  /**
   * Grants (and persists) trust for a worktree-isolated session's VS Code-created
   * worktree when the base repository the user already trusts is trusted, so the
   * trust gate does not prompt for the worktree.
   *
   * This lives in the handler because `_invokeAgent` is the only universal
   * chokepoint every turn passes through — follow-up turns bypass the sessions
   * open gate ({@link ISessionsService.canOpenSession}). Protocol `SessionState`
   * does not carry the sessions layer's `gitRepository.workTreeUri`, so
   * eligibility uses the isolation config plus a structural guard: only a strict
   * descendant of the repository's `.worktrees` sibling
   * ({@link isWorktreeUnderRepository}) can inherit trust — a trusted base URI is
   * never enough on its own, and the shared `<repo>.worktrees` container is
   * excluded so a grant can never cascade to every worktree. Mirrors the
   * sessions-layer `ensureSessionWorktreesTrusted`; kept separate because
   * `workbench` must not import `sessions`.
   */
  async _inheritWorktreeTrust(state) {
    if (state.config?.values["isolation" /* Isolation */] !== "worktree") {
      return;
    }
    const repositoryRootRaw = state.project?.uri;
    if (!repositoryRootRaw) {
      return;
    }
    const repositoryRoot = typeof repositoryRootRaw === "string" ? URI.parse(repositoryRootRaw) : repositoryRootRaw;
    const worktreeFolders = (state.workingDirectories ?? []).map((directory) => typeof directory === "string" ? URI.parse(directory) : directory).filter((folder) => isWorktreeUnderRepository(folder, repositoryRoot));
    if (worktreeFolders.length === 0) {
      return;
    }
    const [repoTrust, ...folderTrusts] = await Promise.all([
      this._workspaceTrustManagementService.getUriTrustInfo(repositoryRoot),
      ...worktreeFolders.map((folder) => this._workspaceTrustManagementService.getUriTrustInfo(folder))
    ]);
    if (!repoTrust.trusted) {
      return;
    }
    const untrusted = worktreeFolders.filter((_, index2) => !folderTrusts[index2].trusted);
    if (untrusted.length > 0) {
      await this._workspaceTrustManagementService.setUrisTrust(untrusted, true);
    }
  }
  /**
   * Ensures every local (file-scheme) folder the agent will run in is trusted
   * before a session is spawned; returns `false` if the user declines any. Trust
   * is checked for all folders in parallel and only untrusted folders are prompted
   * for, one at a time.
   */
  async _ensureFoldersTrusted(folders) {
    const message = localize(9016, null);
    const localFolders = folders.filter((folder) => folder.scheme === Schemas.file);
    if (localFolders.length === 0) {
      return !!await this._workspaceTrustRequestService.requestWorkspaceTrust({ message });
    }
    const trustInfos = await Promise.all(localFolders.map((folder) => this._workspaceTrustManagementService.getUriTrustInfo(folder)));
    const untrustedFolders = localFolders.filter((_, index2) => !trustInfos[index2].trusted);
    if (untrustedFolders.length === 0) {
      return true;
    }
    for (const folder of untrustedFolders) {
      const trusted = this._workspaceContextService.getWorkspaceFolder(folder) ? await this._workspaceTrustRequestService.requestWorkspaceTrust({ message }) : await this._workspaceTrustRequestService.requestResourcesTrust({ uri: folder, message });
      if (!trusted) {
        return false;
      }
    }
    return true;
  }
  _convertVariablesToAttachments(request2) {
    const attachments = this._variableEntriesToAttachments(request2.variables.variables, request2.sessionResource, request2.message);
    const explicitCount = attachments.length;
    this._appendActiveEditorAttachments(attachments, request2);
    if (attachments.length !== explicitCount) {
      this._logService.trace(`[AgentHost] Forwarded ${attachments.length - explicitCount} active editor attachment(s); ${attachments.length} total`);
    }
    return attachments;
  }
  /**
   * Forward the active editor (which the suggested-context flow omits in agent mode) as ambient context, deduped
   * against files the user attached explicitly. Gated on
   * {@link ChatConfiguration.ImplicitContextActiveEditor} (on by default, off in the Agents window).
   * Unsaved handling lives in {@link _convertVariableToAttachment}.
   */
  _appendActiveEditorAttachments(attachments, request2) {
    if (!this._configurationService.getValue("chat.implicitContext.includeActiveEditor" /* ImplicitContextActiveEditor */)) {
      return;
    }
    const implicitContext = this._chatWidgetService.getWidgetBySessionResource(request2.sessionResource)?.input.implicitContext;
    if (!implicitContext) {
      return;
    }
    const existingKeys = /* @__PURE__ */ new Set();
    for (const v2 of request2.variables.variables) {
      const key3 = this._fileEntryDedupeKey(v2, request2.sessionResource);
      if (key3) {
        existingKeys.add(key3);
      }
    }
    const skipUntitled = !this._backendInlinesUnsavedEditors();
    for (const entry of implicitContext.values) {
      if (entry.value === void 0) {
        continue;
      }
      if (entry.uri?.scheme === Schemas.vscodeBrowser) {
        continue;
      }
      if (skipUntitled && entry.uri?.scheme === Schemas.untitled) {
        continue;
      }
      const key3 = this._fileEntryDedupeKey(entry, request2.sessionResource);
      if (key3) {
        if (existingKeys.has(key3)) {
          continue;
        }
        existingKeys.add(key3);
      }
      const attachment = this._convertVariableToAttachment(entry, request2.sessionResource, request2.message);
      if (!Array.isArray(attachment) && attachment) {
        attachments.push(attachment);
      }
    }
  }
  /** Dedupe identity for a file/implicit entry: rebased URI, suffixed with the range for a selection. */
  _fileEntryDedupeKey(entry, sessionResource) {
    if (entry.kind !== "file" && entry.kind !== "implicit") {
      return void 0;
    }
    const value2 = entry.value;
    const uri5 = isLocation(value2) ? value2.uri : value2 instanceof URI ? value2 : void 0;
    if (!uri5) {
      return void 0;
    }
    const selection = this._entrySelection(entry);
    return this._attachmentDedupeKey(this._rebaseAttachmentUri(uri5, sessionResource).toString(), selection);
  }
  /** The selection range carried by a file/implicit entry, or `undefined` for whole-document references. */
  _entrySelection(entry) {
    const location2 = this._entrySelectionLocation(entry);
    return location2 ? { range: this._toTextRange(location2.range) } : void 0;
  }
  /** Dedupe identity: the bare URI for a whole document, suffixed with the range for a selection. */
  _attachmentDedupeKey(uri5, selection) {
    if (!selection) {
      return uri5;
    }
    const { start, end } = selection.range;
    return `${uri5}#${start.line}:${start.character}-${end.line}:${end.character}`;
  }
  /**
   * Whether this backend reads referenced files from disk (rather than seeing the editor's
   * in-memory buffer) and therefore needs the live text of an unsaved / dirty editor inlined as
   * an embedded resource. Copilot CLI and Codex both run as separate processes with only disk
   * access, so a `@path` mention (or an `untitled:` URI) would give them stale or missing content.
   */
  _backendInlinesUnsavedEditors() {
    return this._config.provider === SessionType.CopilotCLI || this._config.provider === CODEX_AGENT_PROVIDER_ID;
  }
  /** A resource is unsaved when it's untitled or a saved file with in-memory (dirty) changes. */
  _isUnsavedResource(uri5) {
    return uri5.scheme === Schemas.untitled || this._workingCopyService.isDirty(uri5);
  }
  /**
   * Inline the live (in-memory) text of an unsaved editor as an embedded resource so a path-reading backend still
   * gets current content, preserving the entry's selection, range and `_meta`. Selection entries inline only the
   * selected text; whole-document entries inline the full buffer. Returns `undefined` when no loaded text model is
   * available or the inlined text exceeds {@link MAX_INLINED_UNSAVED_EDITOR_BYTES}.
   */
  _buildUnsavedEditorAttachment(uri5, v2, range2) {
    const model = this._modelService.getModel(uri5);
    if (!model) {
      return void 0;
    }
    const text2 = this._getUnsavedEditorAttachmentText(model, this._entryModelSelectionRange(v2));
    const buffer = text2 === void 0 ? void 0 : VSBuffer.fromString(text2);
    if (!buffer || buffer.byteLength > MAX_INLINED_UNSAVED_EDITOR_BYTES) {
      this._logService.trace(`[AgentHost] Skipping inline of unsaved editor ${uri5.toString()}: exceeds ${MAX_INLINED_UNSAVED_EDITOR_BYTES} byte cap`);
      return void 0;
    }
    const selection = this._entrySelection(v2);
    const attachment = {
      type: "embeddedResource" /* EmbeddedResource */,
      label: v2.name,
      displayKind: selection ? "selection" : "document",
      data: encodeBase64(buffer),
      contentType: "text/plain"
    };
    if (selection) {
      attachment.selection = selection;
    }
    if (range2) {
      attachment.range = range2;
    }
    if (v2._meta) {
      attachment._meta = v2._meta;
    }
    return attachment;
  }
  /**
   * The inline text to send for an unsaved editor: the selected text for a selection, else the whole buffer. Uses the
   * model length APIs so an over-cap buffer is skipped (returns `undefined`) without ever being materialized.
   */
  _getUnsavedEditorAttachmentText(model, range2) {
    if (range2) {
      const selection = model.validateRange(range2);
      const selectionLength = model.getValueLengthInRange(selection);
      if (selectionLength > 0) {
        return selectionLength > MAX_INLINED_UNSAVED_EDITOR_BYTES ? void 0 : model.getValueInRange(selection);
      }
    }
    return model.getValueLength() > MAX_INLINED_UNSAVED_EDITOR_BYTES ? void 0 : model.getValue();
  }
  /** The editor range of a file/implicit selection entry, used to slice the live model; `undefined` otherwise. */
  _entryModelSelectionRange(entry) {
    return this._entrySelectionLocation(entry)?.range;
  }
  /** The {@link Location} of a file/implicit entry that represents a selection, or `undefined` for whole documents. */
  _entrySelectionLocation(entry) {
    const value2 = entry.value;
    const isSelectionEntry = (entry.kind === "file" || entry.kind === "implicit" && entry.isSelection) && isLocation(value2);
    return isSelectionEntry ? value2 : void 0;
  }
  _variableEntriesToAttachments(variables, sessionResource, messageText2, materializePastes = true) {
    const attachments = [];
    for (const v2 of variables) {
      const attachment = this._convertVariableToAttachment(v2, sessionResource, messageText2, materializePastes);
      if (Array.isArray(attachment)) {
        attachments.push(...attachment);
      } else if (attachment) {
        attachments.push(attachment);
      }
    }
    if (attachments.length > 0) {
      this._logService.trace(`[AgentHost] Converted ${attachments.length} attachments from ${variables.length} explicit variables`);
    }
    return attachments;
  }
  _convertVariableToAttachment(v2, sessionResource, messageText2, materializePastes = true) {
    const referenceRange = this._toAttachmentReferenceRange(messageText2, v2.range);
    if ((v2.kind === "file" || v2.kind === "implicit") && this._backendInlinesUnsavedEditors()) {
      const uri5 = isLocation(v2.value) ? v2.value.uri : v2.value instanceof URI ? v2.value : void 0;
      if (uri5 && this._isUnsavedResource(uri5)) {
        const embedded = this._buildUnsavedEditorAttachment(uri5, v2, referenceRange);
        if (embedded) {
          return embedded;
        }
        if (uri5.scheme !== Schemas.file) {
          return void 0;
        }
      }
    }
    if ((v2.kind === "file" || v2.kind === "implicit" && v2.isSelection) && isLocation(v2.value)) {
      return this._toSelectionAttachment(v2.value, v2.name, "selection", sessionResource, v2._meta, referenceRange);
    }
    if (v2.kind === "implicit" && isLocation(v2.value)) {
      return this._toResourceAttachment(v2.value.uri, v2.name, "document", sessionResource, v2._meta, referenceRange);
    }
    if ((v2.kind === "file" || v2.kind === "implicit") && v2.value instanceof URI) {
      return this._toResourceAttachment(v2.value, v2.name, "document", sessionResource, v2._meta, referenceRange);
    }
    if (v2.kind === "directory" && v2.value instanceof URI) {
      return this._toResourceAttachment(v2.value, v2.name, "directory", sessionResource, v2._meta, referenceRange);
    }
    if (v2.kind === "symbol" && isLocation(v2.value)) {
      return this._toSelectionAttachment(v2.value, v2.name, "symbol", sessionResource, v2._meta, referenceRange);
    }
    if (v2.kind === "promptFile" && v2.value instanceof URI) {
      return this._toResourceAttachment(v2.value, v2.name, "document", sessionResource, v2._meta, referenceRange);
    }
    if (isImageVariableEntry(v2)) {
      return this._toImageAttachment(v2, sessionResource, referenceRange);
    }
    if (isAgentFeedbackVariableEntry(v2)) {
      return this._toAgentFeedbackAttachment(v2);
    }
    if (v2.kind === "sessionReference" && v2.value instanceof URI) {
      const trajectoryPath = this._toSessionReferenceTrajectoryPath(v2.value);
      if (!trajectoryPath) {
        return void 0;
      }
      return this._toSessionReferenceAttachments(v2, v2.value, trajectoryPath, referenceRange);
    }
    if (isBrowserViewVariableEntry(v2)) {
      return this._toSimpleAttachment(
        v2.name,
        v2.modelDescription ?? `Browser page: ${v2.name}. The pageId is "${v2.browserId}".`,
        {
          ...v2._meta,
          [BrowserViewAttachmentMetadataKey]: { browserId: v2.browserId, browserUri: v2.value.toString() }
        },
        BrowserViewAttachmentDisplayKind,
        referenceRange
      );
    }
    if (v2.kind === "element") {
      const correlationId = getElementAttachmentCorrelationId(v2) ?? v2.id;
      const metadata = { ...v2._meta, ...toElementAttachmentMeta(correlationId) };
      const elementAttachment = this._toSimpleAttachment(v2.name, v2.value, metadata, AgentHostElementAttachmentDisplayKind, referenceRange);
      const imageAttachment = this._toElementImageAttachment(v2, sessionResource, metadata);
      return imageAttachment ? [elementAttachment, imageAttachment] : elementAttachment;
    }
    if (v2.kind === "paste") {
      return materializePastes ? this._toEmbeddedTextAttachment(v2.name, v2.code, v2._meta, referenceRange) : this._toSimpleAttachment(v2.name, v2.code, v2._meta, void 0, referenceRange);
    }
    if (v2.kind === "promptText") {
      return this._toSimpleAttachment(v2.name, v2.value, v2._meta, void 0, referenceRange);
    }
    if (v2.kind === "workspace") {
      return this._toSimpleAttachment(v2.name, v2.value, v2._meta, "workspace", referenceRange);
    }
    if (isChatTranscriptContextVariableEntry(v2)) {
      return this._toSimpleAttachment(v2.name, v2.value, toChatTranscriptContextAttachmentMeta(v2), ChatTranscriptContextAttachmentDisplayKind, referenceRange);
    }
    if (v2.kind === "string" && typeof v2.value === "string") {
      return this._toSimpleAttachment(v2.name, v2.value, v2._meta, void 0, referenceRange);
    }
    const agentHostCompletionKind = getAgentHostCompletionReferenceKind(v2);
    if (agentHostCompletionKind === "command" /* Command */) {
      return this._toSimpleAttachment(v2.name, void 0, v2._meta, "command", referenceRange);
    }
    if (agentHostCompletionKind === "skill" /* Skill */) {
      return this._toSimpleAttachment(v2.name, void 0, v2._meta, "skill", referenceRange);
    }
    if (isChatReferenceVariableEntry(v2)) {
      return this._toChatReferenceAttachment(v2, referenceRange);
    }
    return void 0;
  }
  _toChatReferenceAttachment(v2, range2) {
    const attachment = {
      type: "chat" /* Chat */,
      resource: v2.value.toString(),
      label: v2.name
    };
    if (v2.endTurn !== void 0) {
      attachment.endTurn = v2.endTurn;
    }
    if (range2) {
      attachment.range = range2;
    }
    if (v2._meta) {
      attachment._meta = v2._meta;
    }
    return attachment;
  }
  _toElementImageAttachment(v2, sessionResource, metadata) {
    if (v2.imageData instanceof Uint8Array) {
      return {
        type: "embeddedResource" /* EmbeddedResource */,
        label: `${v2.name} screenshot`,
        displayKind: "image",
        data: encodeBase64(VSBuffer.wrap(v2.imageData)),
        contentType: v2.imageMimeType ?? "image/png",
        _meta: metadata
      };
    }
    if (URI.isUri(v2.imageData)) {
      return this._toResourceAttachment(v2.imageData, `${v2.name} screenshot`, "image", sessionResource, metadata);
    }
    return void 0;
  }
  _toSessionReferenceAttachment(v2, sessionResource, trajectoryPath, range2) {
    return this._toSimpleAttachment(
      v2.name,
      toSessionReferenceModelRepresentation(v2.name, sessionResource, trajectoryPath),
      { ...v2._meta ?? {}, ...toSessionReferenceAttachmentMeta(sessionResource) },
      AgentHostSessionReferenceAttachmentDisplayKind,
      range2
    );
  }
  _toSessionReferenceAttachments(v2, sessionResource, trajectoryPath, range2) {
    return [
      this._toSessionReferenceAttachment(v2, sessionResource, trajectoryPath, range2),
      this._toSessionReferenceTrajectoryAttachment(v2, sessionResource, trajectoryPath)
    ];
  }
  _toSessionReferenceTrajectoryAttachment(v2, sessionResource, trajectoryPath) {
    return {
      type: "resource" /* Resource */,
      uri: URI.file(trajectoryPath).toString(),
      label: `${v2.name} trajectory`,
      displayKind: AgentHostSessionReferenceTrajectoryAttachmentDisplayKind,
      _meta: { ...v2._meta ?? {}, ...toSessionReferenceAttachmentMeta(sessionResource) }
    };
  }
  _toSessionReferenceTrajectoryPath(sessionResource) {
    return buildHostLocalEventsPath(
      sessionResource,
      this._pathService.userHome({ preferLocal: true }),
      (authority) => this._remoteAgentHostService.connections.find((connection) => agentHostAuthority(connection.address) === authority)
    );
  }
  _toResourceAttachment(uri5, label3, displayKind, sessionResource, _meta, range2) {
    const attachmentUri = this._rebaseAttachmentUri(uri5, sessionResource);
    const attachment = { type: "resource" /* Resource */, uri: attachmentUri.toString(), label: label3, displayKind };
    if (range2) {
      attachment.range = range2;
    }
    if (_meta) {
      attachment._meta = _meta;
    }
    return attachment;
  }
  _toSelectionAttachment(location2, label3, displayKind, sessionResource, _meta, range2) {
    const attachmentUri = this._rebaseAttachmentUri(location2.uri, sessionResource);
    const attachment = {
      type: "resource" /* Resource */,
      uri: attachmentUri.toString(),
      label: label3,
      displayKind,
      selection: { range: this._toTextRange(location2.range) }
    };
    if (range2) {
      attachment.range = range2;
    }
    if (_meta) {
      attachment._meta = _meta;
    }
    return attachment;
  }
  _toImageAttachment(v2, sessionResource, range2) {
    const buffer = coerceImageBuffer(v2.value);
    const contentType = v2.mimeType ?? "image/png";
    if (buffer) {
      const attachment = {
        type: "embeddedResource" /* EmbeddedResource */,
        label: v2.name,
        displayKind: "image",
        data: encodeBase64(VSBuffer.wrap(buffer)),
        contentType
      };
      if (range2) {
        attachment.range = range2;
      }
      if (v2._meta) {
        attachment._meta = v2._meta;
      }
      return attachment;
    }
    const refUri = v2.references?.find((r2) => URI.isUri(r2.reference))?.reference;
    if (URI.isUri(refUri)) {
      return this._toResourceAttachment(refUri, v2.name, "image", sessionResource, v2._meta, range2);
    }
    return void 0;
  }
  _toAgentFeedbackAttachment(v2) {
    const annotationsResource = v2.annotationsResource?.toString();
    if (annotationsResource && v2.feedbackItems.length > 0) {
      return v2.feedbackItems.map((item) => {
        const itemMeta = {
          id: item.id,
          text: item.text,
          resourceUri: item.resourceUri.toString(),
          range: this._toTextRange(item.range),
          ...item.replies?.length ? { replies: [...item.replies] } : {}
        };
        return {
          type: "annotations" /* Annotations */,
          label: v2.name,
          displayKind: AgentFeedbackAttachmentDisplayKind,
          resource: annotationsResource,
          annotationIds: [item.id],
          _meta: {
            ...v2._meta ?? {},
            [AgentFeedbackAttachmentMetadataKey]: {
              sessionResource: v2.sessionResource.toString(),
              feedbackItems: [itemMeta]
            }
          }
        };
      });
    }
    const feedbackItems = v2.feedbackItems.map((item) => ({
      id: item.id,
      text: item.text,
      resourceUri: item.resourceUri.toString(),
      range: this._toTextRange(item.range),
      ...item.replies?.length ? { replies: [...item.replies] } : {}
    }));
    return this._toSimpleAttachment(
      v2.name,
      typeof v2.value === "string" ? v2.value : void 0,
      {
        ...v2._meta ?? {},
        [AgentFeedbackAttachmentMetadataKey]: {
          sessionResource: v2.sessionResource.toString(),
          feedbackItems
        }
      },
      AgentFeedbackAttachmentDisplayKind
    );
  }
  _toSimpleAttachment(label3, modelRepresentation, _meta, displayKind, range2) {
    const attachment = { type: "simple" /* Simple */, label: label3 };
    if (modelRepresentation !== void 0) {
      attachment.modelRepresentation = modelRepresentation;
    }
    if (range2) {
      attachment.range = range2;
    }
    if (displayKind) {
      attachment.displayKind = displayKind;
    }
    if (_meta) {
      attachment._meta = _meta;
    }
    return attachment;
  }
  _toEmbeddedTextAttachment(label3, text2, _meta, range2) {
    const attachment = {
      type: "embeddedResource" /* EmbeddedResource */,
      label: label3,
      data: encodeBase64(VSBuffer.fromString(text2)),
      contentType: "text/plain"
    };
    if (range2) {
      attachment.range = range2;
    }
    if (_meta) {
      attachment._meta = _meta;
    }
    return attachment;
  }
  _toAttachmentReferenceRange(messageText2, range2) {
    if (!messageText2 || !range2 || range2.start < 0 || range2.endExclusive > messageText2.length || range2.start > range2.endExclusive) {
      return void 0;
    }
    const start = offsetToPosition2(messageText2, range2.start);
    const end = offsetToPosition2(messageText2, range2.endExclusive);
    return {
      start: { line: start.lineNumber - 1, character: start.column - 1 },
      end: { line: end.lineNumber - 1, character: end.column - 1 }
    };
  }
  _toTextRange(range2) {
    return {
      start: { line: range2.startLineNumber - 1, character: range2.startColumn - 1 },
      end: { line: range2.endLineNumber - 1, character: range2.endColumn - 1 }
    };
  }
  /**
   * Rebase a `file:`-scheme attachment URI from the session's requested
   * working directory onto the server-resolved working directory. This
   * matters on the first turn of a worktree-isolated session, where the
   * provider creates a worktree under a different path than the workspace
   * folder the workbench attached the file from. Returns the URI unchanged
   * if the requested and resolved directories match, the URI is not under
   * the requested directory, or either side is unavailable.
   */
  _rebaseAttachmentUri(uri5, sessionResource) {
    const requestedDirectories = this._resolveRequestedWorkingDirectories(sessionResource);
    const requestedDir = requestedDirectories?.[0];
    if (!requestedDir || requestedDir.scheme !== "file") {
      return uri5;
    }
    const owningRequestedDirectory = findDeepestContainingWorkingDirectory(uri5, requestedDirectories);
    if (!owningRequestedDirectory || !extUriBiasedIgnorePathCase.isEqual(owningRequestedDirectory, requestedDir)) {
      return uri5;
    }
    const backendSession = this._resolveSessionUri(sessionResource);
    const rawResolvedDir = this._getSessionState(backendSession.toString())?.workingDirectories?.[0];
    const resolvedDir = typeof rawResolvedDir === "string" ? URI.parse(rawResolvedDir) : rawResolvedDir;
    if (!resolvedDir || resolvedDir.scheme !== "file") {
      return uri5;
    }
    if (extUriBiasedIgnorePathCase.isEqual(requestedDir, resolvedDir)) {
      return uri5;
    }
    const rel = extUriBiasedIgnorePathCase.relativePath(requestedDir, uri5);
    if (rel === void 0) {
      return uri5;
    }
    if (rel === "") {
      return resolvedDir;
    }
    return URI.joinPath(resolvedDir, ...rel.split("/"));
  }
  // ---- Lifecycle ----------------------------------------------------------
  // ---- Session subscription helpers ----------------------------------------
  /**
   * Get or create a session subscription. The first call for a given URI
   * triggers a server subscribe; subsequent calls increment the refcount.
   */
  _ensureSessionSubscription(sessionUri) {
    let ref = this._sessionSubscriptions.get(sessionUri);
    if (ref?.object.value instanceof Error) {
      this._sessionSubscriptions.delete(sessionUri);
      ref.dispose();
      this._workingDirectoryRegistrations.deleteAndDispose(sessionUri);
      ref = void 0;
    }
    if (!ref) {
      ref = this._config.connection.getSubscription(1 /* Session */, URI.parse(sessionUri), "AgentHostSessionHandler");
      this._sessionSubscriptions.set(sessionUri, ref);
      this._workingDirectoryRegistrations.set(sessionUri, this._workingDirectorySynchronizer.register({
        session: URI.parse(sessionUri),
        provider: this._config.provider,
        connection: this._config.connection,
        subscription: ref.object
      }));
    }
    return ref.object;
  }
  /**
   * Get or create the default-chat subscription for a session. Mirrors the
   * refcount lifecycle of {@link _ensureSessionSubscription}.
   */
  _ensureDefaultChatSubscription(sessionUri) {
    let ref = this._defaultChatSubscriptions.get(sessionUri);
    if (ref?.object.value instanceof Error) {
      this._defaultChatSubscriptions.delete(sessionUri);
      ref.dispose();
      ref = void 0;
    }
    if (!ref) {
      const state = this._requireRawSessionState(sessionUri);
      const defaultChat10 = state.defaultChat;
      if (!defaultChat10) {
        throw new Error(`Session ${sessionUri} has no default chat`);
      }
      const chatUri = URI.parse(defaultChat10.toString());
      ref = this._config.connection.getSubscription(2 /* Chat */, chatUri, "AgentHostSessionHandler");
      this._defaultChatSubscriptions.set(sessionUri, ref);
    }
    return ref.object;
  }
  /**
   * Release the subscriptions held by a single chat session on dispose.
   *
   * Unlike {@link _releaseSessionSubscription} (which tears down every chat
   * of a session at once), this only releases the disposed chat's own
   * conversation subscription and never touches sibling peer chats: closing
   * one chat of a multi-chat session must not strand another chat — including
   * one that is concurrently hydrating in {@link provideChatSessionContent} —
   * on a disposed subscription. The session summary subscription (and its
   * lockstep default-chat subscription) is shared by every chat of the
   * session, so it is only torn down once no sibling chat session is still
   * active or mid-hydration for the same backend session.
   */
  _releaseChatSessionSubscriptions(sessionUri, chatUri) {
    if (chatUri !== this._getRawSessionState(sessionUri)?.defaultChat?.toString()) {
      const chatRef2 = this._additionalChatSubscriptions.get(chatUri);
      if (chatRef2) {
        this._additionalChatSubscriptions.delete(chatUri);
        chatRef2.dispose();
      }
    }
    if (this._hasOtherSessionHold(sessionUri)) {
      return;
    }
    const ref = this._sessionSubscriptions.get(sessionUri);
    if (ref) {
      this._sessionSubscriptions.delete(sessionUri);
      ref.dispose();
      this._workingDirectoryRegistrations.deleteAndDispose(sessionUri);
    }
    const chatRef = this._defaultChatSubscriptions.get(sessionUri);
    if (chatRef) {
      this._defaultChatSubscriptions.delete(sessionUri);
      chatRef.dispose();
    }
  }
  /**
   * Returns whether another chat session for the given backend session URI is
   * still active or in the middle of hydrating its subscriptions, so the
   * shared session subscription must be kept alive. Callers invoke this after
   * removing their own entry from {@link _activeSessions}.
   */
  _hasOtherSessionHold(sessionUri) {
    if ((this._hydratingChatSessions.get(sessionUri) ?? 0) > 0) {
      return true;
    }
    for (const resource of this._activeSessions.keys()) {
      if (this._resolveSessionUri(resource).toString() === sessionUri) {
        return true;
      }
    }
    return false;
  }
  /**
   * Read the current optimistic session state for a backend session URI,
   * merged with its default chat so conversation contents (turns, active
   * turn, pending/queued messages, input requests) are visible.
   */
  /**
   * Resolves once a subscription has received its first snapshot (its
   * `value` is no longer `undefined`) — i.e. it has hydrated with state or
   * an error. Resolves immediately if already hydrated or if cancellation
   * is requested.
   */
  _whenSubscriptionHydrated(sub, token) {
    if (sub.value !== void 0 || token.isCancellationRequested) {
      return Promise.resolve();
    }
    return new Promise((resolve3) => {
      const store = new DisposableStore();
      const settle = () => {
        store.dispose();
        resolve3();
      };
      store.add(sub.onDidChange(() => {
        if (sub.value !== void 0) {
          settle();
        }
      }));
      const onDidError = sub.onDidError;
      if (onDidError) {
        store.add(onDidError(settle));
      }
      store.add(token.onCancellationRequested(settle));
      if (sub.value !== void 0) {
        settle();
      }
    });
  }
  _getSessionState(sessionUri, chatUri) {
    const value2 = this._getRawSessionState(sessionUri);
    if (!value2) {
      return void 0;
    }
    const defaultChat10 = value2.defaultChat?.toString();
    const chatState = chatUri && chatUri !== defaultChat10 ? this._getAdditionalChatState(chatUri) : this._getDefaultChatState(sessionUri);
    return mergeSessionWithDefaultChat(value2, chatState);
  }
  _isChatReadOnly(sessionUri, chatUri) {
    const sessionState = this._getRawSessionState(sessionUri);
    if (!sessionState) {
      return true;
    }
    const chatState = chatUri === sessionState.defaultChat?.toString() ? this._getDefaultChatState(sessionUri) : this._getAdditionalChatState(chatUri);
    return !chatState || isChatReadOnly(chatState.interactivity, (sessionState.status & 64 /* IsArchived */) === 64 /* IsArchived */);
  }
  _getRawSessionState(sessionUri) {
    const ref = this._sessionSubscriptions.get(sessionUri);
    const value2 = ref?.object.value;
    return value2 && !(value2 instanceof Error) ? value2 : void 0;
  }
  _requireRawSessionState(sessionUri) {
    const state = this._getRawSessionState(sessionUri);
    if (!state) {
      throw new Error(`Session state is not hydrated for ${sessionUri}`);
    }
    return state;
  }
  _requireDefaultChatUri(sessionUri) {
    const defaultChat10 = this._requireRawSessionState(sessionUri).defaultChat;
    if (!defaultChat10) {
      throw new Error(`Session ${sessionUri} has no default chat`);
    }
    return defaultChat10.toString();
  }
  /** Read the current optimistic default-chat state for a backend session URI. */
  _getDefaultChatState(sessionUri) {
    const ref = this._defaultChatSubscriptions.get(sessionUri);
    if (!ref) {
      return void 0;
    }
    const value2 = ref.object.value;
    return value2 && !(value2 instanceof Error) ? value2 : void 0;
  }
  /** Read the current optimistic state for an additional peer chat URI. */
  _getAdditionalChatState(chatUri) {
    const ref = this._additionalChatSubscriptions.get(chatUri);
    if (!ref) {
      return void 0;
    }
    const value2 = ref.object.value;
    return value2 && !(value2 instanceof Error) ? value2 : void 0;
  }
  /**
   * Get or create the subscription for an additional peer chat, keyed by the
   * chat channel URI. Mirrors {@link _ensureDefaultChatSubscription} but for
   * non-default chats so their conversation contents hydrate independently.
   */
  _ensureAdditionalChatSubscription(chatUri) {
    let ref = this._additionalChatSubscriptions.get(chatUri);
    if (ref?.object.value instanceof Error) {
      this._additionalChatSubscriptions.delete(chatUri);
      ref.dispose();
      ref = void 0;
    }
    if (!ref) {
      ref = this._config.connection.getSubscription(2 /* Chat */, URI.parse(chatUri), "AgentHostSessionHandler");
      this._additionalChatSubscriptions.set(chatUri, ref);
    }
    return ref.object;
  }
  /**
   * Subscribe to the conversation channel of `sessionResource`'s chat and
   * return the {@link IAgentSubscription}. Routes to the default-chat
   * subscription (fragment-less resource) or to an additional peer chat.
   */
  _ensureChatSubscription(sessionUri, chatUri) {
    return chatUri === this._requireDefaultChatUri(sessionUri) ? this._ensureDefaultChatSubscription(sessionUri) : this._ensureAdditionalChatSubscription(chatUri);
  }
  resolveChatResponseUri(_sessionResource, href, _kind) {
    return rewriteAgentHostLinkTarget(href, this._config.connectionAuthority);
  }
  /**
   * Read the current root state.
   */
  _getRootState() {
    const value2 = this._config.connection.rootState.value;
    return value2 && !(value2 instanceof Error) ? value2 : void 0;
  }
  dispose() {
    for (const [, session] of this._activeSessions) {
      session.dispose();
    }
    this._activeSessions.clear();
    for (const ref of this._sessionSubscriptions.values()) {
      ref.dispose();
    }
    this._sessionSubscriptions.clear();
    for (const ref of this._defaultChatSubscriptions.values()) {
      ref.dispose();
    }
    this._defaultChatSubscriptions.clear();
    for (const ref of this._additionalChatSubscriptions.values()) {
      ref.dispose();
    }
    this._additionalChatSubscriptions.clear();
    super.dispose();
  }
};

AgentHostSessionHandler = __decorateClass([
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatEditingService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITerminalChatService),
  __decorateParam(8, IAgentHostTerminalService),
  __decorateParam(9, IAgentHostSessionWorkingDirectoryResolver),
  __decorateParam(10, IAgentHostSessionWorkingDirectorySynchronizer),
  __decorateParam(11, IAgentHostNewSessionFolderService),
  __decorateParam(12, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(13, IAgentHostImportConversationStore),
  __decorateParam(14, ILanguageModelToolsService),
  __decorateParam(15, IChatWidgetService),
  __decorateParam(16, ILanguageModelsService),
  __decorateParam(17, IOpenerService),
  __decorateParam(18, IAgentHostActiveClientService),
  __decorateParam(19, IChatEntitlementService),
  __decorateParam(20, IWorkspaceTrustRequestService),
  __decorateParam(21, IWorkspaceTrustManagementService),
  __decorateParam(22, IModelService),
  __decorateParam(23, IWorkingCopyService),
  __decorateParam(24, IConfigurationService),
  __decorateParam(25, IChatResponseFileChangesService),
  __decorateParam(26, IPathService),
  __decorateParam(27, IRemoteAgentHostService),
  __decorateParam(28, IAgentHostCustomizationService),
  __decorateParam(29, ITelemetryService),
  __decorateParam(30, IWorkbenchAssignmentService)
], AgentHostSessionHandler);

function toolResultToProtocol(result, toolName) {
  const isError = !!result.toolResultError;
  const defaultPastTense = isError ? `${toolName} failed` : `Ran ${toolName}`;
  const pastTense = typeof result.toolResultMessage === "string" ? result.toolResultMessage : result.toolResultMessage ? { markdown: result.toolResultMessage.value } : defaultPastTense;
  const content2 = [];
  for (const part of result.content) {
    if (part.kind === "text") {
      content2.push({ type: "text" /* Text */, text: part.value });
    } else if (part.kind === "promptTsx") {
      content2.push({ type: "text" /* Text */, text: stringifyPromptTsxPart(part) });
    } else if (part.kind === "data") {
      content2.push({
        type: "embeddedResource" /* EmbeddedResource */,
        data: encodeBase64(part.value.data),
        contentType: part.value.mimeType
      });
    }
  }
  return {
    success: !isError,
    pastTenseMessage: pastTense,
    content: content2.length > 0 ? content2 : void 0,
    error: isError ? { message: typeof result.toolResultError === "string" ? result.toolResultError : `${toolName} encountered an error` } : void 0
  };
}
export { isResumeTurnConfirmationData, getMcpAuthenticationRequiredServers, parseTimestamp, getSubagentTiming, userOriginMessage, isNotFoundError, unwrapSessionLoadErrorMessage, resolveRestoredSubagentChatResource, lastTurnModelSelection, isFirstVisibleProgressPart, lastTurnMessage, emptyDraftFromLastTurn, confirmedReasonToProtocol, getClientToolPreApproval, metaWithoutToolSearchCandidates, resolveToolInput, convertCarouselAnswers, getPlanReviewAction2, submittedTextAnswer, submittedSelectedAnswer, convertPlanReviewResult, inputRequestResponsePartKey, getChatTitle, snapshotInvocationToAdopt, offsetToPosition2, toolResultToProtocol, MAX_INLINED_UNSAVED_EDITOR_BYTES, CHAT_ACTIVITY_PROGRESS_ID, CUSTOMIZATION_ENABLEMENT_PROTOCOL_VERSION, UNOBSERVED_CLIENT_TOOL_GRACE_MS, DraftSyncState, AgentHostChatSession, ActiveClientEntry, AgentHostSessionHandler };
