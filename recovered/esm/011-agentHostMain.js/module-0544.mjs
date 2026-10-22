// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/sessionInputNeeded/sessionInputNeededContribution.ts
import { Disposable } from "./module-0010.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { isChatAction } from "./module-0086.mjs";
import { readToolCallMeta } from "./module-0046.mjs";
import { equals2 } from "./module-0035.mjs";
import { hasKey } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostTurnTracker } from "./module-0493.mjs";
import { IAgentHostToolCallTracker } from "./module-0494.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";


// src/vs/platform/agentHost/node/chatContributions/sessionInputNeeded/sessionInputNeededContribution.ts
var SessionInputNeededContribution = class extends Disposable {
  constructor(_context, _stateManager, _turnTracker, _toolCallTracker, _providerService) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    this._turnTracker = _turnTracker;
    this._toolCallTracker = _toolCallTracker;
    this._providerService = _providerService;
    this.order = 200;
  }
  static {
    this.id = "sessionInputNeeded";
  }
  onDidDispatchAction(dispatched) {
    if (dispatched.rejectionReason !== void 0 || !isAhpChatChannel(dispatched.channel) || !isChatAction(dispatched.action)) {
      return;
    }
    this._syncSessionInputNeededForChatAction(dispatched.channel, dispatched.action);
  }
  _syncSessionInputNeededForChatAction(chatUri, action) {
    switch (action.type) {
      case "chat/inputRequested" /* ChatInputRequested */:
        this._syncChatInputNeeded(chatUri, action.request.id);
        break;
      case "chat/inputAnswerChanged" /* ChatInputAnswerChanged */:
        this._syncChatInputNeeded(chatUri, action.requestId);
        break;
      case "chat/inputCompleted" /* ChatInputCompleted */:
        this._removeSessionInputNeeded(chatUri, this._chatInputNeededId(chatUri, action.requestId));
        break;
      case "chat/toolCallStart" /* ChatToolCallStart */:
      case "chat/toolCallReady" /* ChatToolCallReady */:
      case "chat/toolCallConfirmed" /* ChatToolCallConfirmed */:
      case "chat/toolCallComplete" /* ChatToolCallComplete */:
      case "chat/toolCallResultConfirmed" /* ChatToolCallResultConfirmed */:
      case "chat/toolCallAuthRequired" /* ChatToolCallAuthRequired */:
      case "chat/toolCallAuthResolved" /* ChatToolCallAuthResolved */:
        this._syncToolInputNeeded(chatUri, action.turnId, action.toolCallId);
        break;
      case "chat/turnComplete" /* ChatTurnComplete */:
      case "chat/turnCancelled" /* ChatTurnCancelled */:
      case "chat/error" /* ChatError */:
      case "chat/truncated" /* ChatTruncated */:
        this._removeSessionInputNeededForChat(chatUri);
        break;
    }
  }
  _syncChatInputNeeded(chatUri, requestId) {
    const state = this._stateManager.getSessionState(chatUri);
    const part = state?.activeTurn?.responseParts.find(
      (part2) => part2.kind === "inputRequest" /* InputRequest */ && part2.response === void 0 && part2.request.id === requestId
    );
    const id2 = this._chatInputNeededId(chatUri, requestId);
    if (!part || part.kind !== "inputRequest" /* InputRequest */) {
      this._removeSessionInputNeeded(chatUri, id2);
      return;
    }
    this._setSessionInputNeeded(chatUri, {
      id: id2,
      kind: "chatInput" /* ChatInput */,
      chat: chatUri,
      request: part.request
    });
  }
  _syncToolInputNeeded(chatUri, turnId, toolCallId) {
    const confirmationId = this._toolConfirmationNeededId(chatUri, turnId, toolCallId);
    const clientExecutionId = this._toolClientExecutionNeededId(chatUri, turnId, toolCallId);
    const authenticationId = this._toolAuthenticationNeededId(chatUri, turnId, toolCallId);
    const toolCall = this._findToolCall(chatUri, turnId, toolCallId);
    const autoApproved = !!toolCall && readToolCallMeta(toolCall).autoApproveBySetting === true;
    const suppressAutoApprovedConfirmation = autoApproved && toolCall?.status === "pending-confirmation" /* PendingConfirmation */;
    const needsConfirmation = !suppressAutoApprovedConfirmation && (toolCall?.status === "pending-confirmation" /* PendingConfirmation */ || toolCall?.status === "pending-result-confirmation" /* PendingResultConfirmation */);
    if (needsConfirmation && toolCall) {
      this._setSessionInputNeeded(chatUri, {
        id: confirmationId,
        kind: "toolConfirmation" /* ToolConfirmation */,
        chat: chatUri,
        turnId,
        toolCall
      });
    } else {
      this._removeSessionInputNeeded(chatUri, confirmationId);
    }
    const contributor = toolCall?.contributor;
    if (toolCall?.status === "running" /* Running */ && contributor?.kind === "client" /* Client */) {
      this._setSessionInputNeeded(chatUri, {
        id: clientExecutionId,
        kind: "toolClientExecution" /* ToolClientExecution */,
        chat: chatUri,
        turnId,
        clientId: contributor.clientId,
        toolCall
      });
    } else {
      this._removeSessionInputNeeded(chatUri, clientExecutionId);
    }
    if (toolCall?.status === "auth-required" /* AuthRequired */) {
      this._setSessionInputNeeded(chatUri, {
        id: authenticationId,
        kind: "toolAuthentication" /* ToolAuthentication */,
        chat: chatUri,
        turnId,
        toolCall
      });
    } else {
      this._removeSessionInputNeeded(chatUri, authenticationId);
    }
  }
  _findToolCall(chatUri, turnId, toolCallId) {
    const state = this._stateManager.getSessionState(chatUri);
    const turn = state?.activeTurn?.id === turnId ? state.activeTurn : state?.turns.find((t) => t.id === turnId);
    const part = turn?.responseParts.find((p) => p.kind === "toolCall" /* ToolCall */ && p.toolCall.toolCallId === toolCallId);
    return part?.kind === "toolCall" /* ToolCall */ ? part.toolCall : void 0;
  }
  _setSessionInputNeeded(chatUri, request) {
    const sessionUri = parseRequiredSessionUriFromChatUri(chatUri);
    const existing = this._stateManager.getSessionState(sessionUri)?.inputNeeded?.find((r) => r.id === request.id);
    if (existing && equals2(existing, request)) {
      return;
    }
    this._stateManager.dispatchServerAction(sessionUri, { type: "session/inputNeededSet" /* SessionInputNeededSet */, request });
    const blockedTurnId = hasKey(request, { turnId: true }) ? request.turnId : this._stateManager.getActiveTurnId(chatUri);
    if (blockedTurnId) {
      const blockedToolCallId = hasKey(request, { toolCall: true }) ? request.toolCall.toolCallId : void 0;
      this._turnTracker.turnBlocked(chatUri, blockedTurnId, request.id, request.kind, blockedToolCallId);
    }
    if (request.kind !== "chatInput" /* ChatInput */) {
      const agent = this._providerService.getProviderForSession(sessionUri);
      if (agent) {
        this._toolCallTracker.toolCallBlocked(agent.id, chatUri, request);
      }
    }
  }
  _removeSessionInputNeeded(chatUri, id2) {
    const sessionUri = parseRequiredSessionUriFromChatUri(chatUri);
    this._toolCallTracker.toolCallUnblocked(chatUri, id2);
    this._turnTracker.turnUnblocked(chatUri, id2);
    if (!this._stateManager.getSessionState(sessionUri)?.inputNeeded?.some((r) => r.id === id2)) {
      return;
    }
    this._stateManager.dispatchServerAction(sessionUri, { type: "session/inputNeededRemoved" /* SessionInputNeededRemoved */, id: id2 });
  }
  _removeSessionInputNeededForChat(chatUri) {
    const sessionUri = parseRequiredSessionUriFromChatUri(chatUri);
    for (const request of this._stateManager.getSessionState(sessionUri)?.inputNeeded ?? []) {
      if (request.chat === chatUri) {
        this._removeSessionInputNeeded(chatUri, request.id);
      }
    }
  }
  _chatInputNeededId(chatUri, requestId) {
    return `chatInput:${chatUri}:${requestId}`;
  }
  _toolConfirmationNeededId(chatUri, turnId, toolCallId) {
    return `toolConfirmation:${chatUri}:${turnId}:${toolCallId}`;
  }
  _toolClientExecutionNeededId(chatUri, turnId, toolCallId) {
    return `toolClientExecution:${chatUri}:${turnId}:${toolCallId}`;
  }
  _toolAuthenticationNeededId(chatUri, turnId, toolCallId) {
    return `toolAuthentication:${chatUri}:${turnId}:${toolCallId}`;
  }
};

SessionInputNeededContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, IAgentHostTurnTracker),
  __decorateParam(3, IAgentHostToolCallTracker),
  __decorateParam(4, IAgentHostProviderService)
], SessionInputNeededContribution);
export { SessionInputNeededContribution };
