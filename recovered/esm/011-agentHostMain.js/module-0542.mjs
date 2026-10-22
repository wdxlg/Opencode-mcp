// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/queueDrain/queueDrainContribution.ts
import { IAgentHostChatContributions, createChatMementoKey } from "./module-0487.mjs";
import { Disposable } from "./module-0010.mjs";
import { getErrorResponsePart, isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { createUnknownAgentHostClientTelemetryContext } from "./module-0054.mjs";
import { generateUuid } from "./module-0042.mjs";
import { StopWatch } from "./module-0015.mjs";
import { startTurn } from "./module-0496.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/chatContributions/queueDrain/queueDrainContribution.ts
var QueuedSender = createChatMementoKey("queueDrain.sender", () => void 0);

var QueueDrainContribution = class extends Disposable {
  constructor(_context, _chatContributions, _logService, _stateManager, _providerService, _instantiationService) {
    super();
    this._context = _context;
    this._chatContributions = _chatContributions;
    this._logService = _logService;
    this._stateManager = _stateManager;
    this._providerService = _providerService;
    this._instantiationService = _instantiationService;
    this.order = 200;
  }
  static {
    this.id = "queueDrain";
  }
  onTurnEnd(turn) {
    if (turn.reason.kind === "success" || turn.reason.kind === "localCommand") {
      this._tryConsumeNextQueuedMessage(turn.channel);
    }
  }
  onDidApplyClientAction(observed) {
    if (!isAhpChatChannel(observed.channel)) {
      return;
    }
    const action = observed.action;
    switch (action.type) {
      case "chat/pendingMessageSet" /* ChatPendingMessageSet */: {
        const queuedMessageExists = this._stateManager.getChatState(observed.channel)?.queuedMessages?.some((message) => message.id === action.id) === true;
        if (action.kind === "queued" /* Queued */ && queuedMessageExists) {
          this._context.memento(QueuedSender, observed.channel, action.id).set({
            clientId: observed.clientId,
            clientContext: observed.clientContext
          }, void 0);
        }
        this._syncPendingMessages(observed.channel);
        break;
      }
      case "chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */: {
        if (action.kind === "queued" /* Queued */) {
          this._context.deleteMemento(QueuedSender, observed.channel, action.id);
        }
        this._syncPendingMessages(observed.channel);
        break;
      }
      case "chat/queuedMessagesReordered" /* ChatQueuedMessagesReordered */:
        this._syncPendingMessages(observed.channel);
        break;
    }
  }
  _syncPendingMessages(channel) {
    const state = this._stateManager.getSessionState(channel);
    if (!state) {
      return;
    }
    const host = this._getHost();
    if (!host) {
      return;
    }
    const session = parseRequiredSessionUriFromChatUri(channel);
    this._providerService.getProviderForSession(session)?.setPendingMessages?.(URI.parse(channel), state.steeringMessage, []);
    this._tryConsumeNextQueuedMessage(channel);
  }
  _tryConsumeNextQueuedMessage(channel) {
    if (this._stateManager.getActiveTurnId(channel)) {
      return;
    }
    const state = this._stateManager.getSessionState(channel);
    if (!state?.queuedMessages?.length || state.steeringMessage) {
      return;
    }
    const latestTurn = state.turns.at(-1);
    if (latestTurn?.state === "error" /* Error */ && getErrorResponsePart(latestTurn)?.resumable) {
      return;
    }
    const host = this._getHost();
    if (!host) {
      return;
    }
    const message = state.queuedMessages[0];
    const sender = this._context.memento(QueuedSender, channel, message.id).get() ?? {
      clientId: void 0,
      clientContext: {
        ...createUnknownAgentHostClientTelemetryContext("unknown" /* Unknown */),
        hostLaunchKind: host.hostLaunchKind
      }
    };
    this._context.deleteMemento(QueuedSender, channel, message.id);
    this._admitQueuedTurn(host, channel, message.message, message.id, sender);
  }
  _admitQueuedTurn(host, channel, message, messageId, sender) {
    const sessionChannel = parseRequiredSessionUriFromChatUri(channel);
    const turnId = generateUuid();
    this._stateManager.dispatchServerAction(channel, {
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message,
      queuedMessageId: messageId
    });
    const turnStopWatch = StopWatch.create(false);
    const started = this._instantiationService.invokeFunction(startTurn, {
      session: sessionChannel,
      chat: channel,
      turnChannel: channel,
      turnId,
      message,
      source: "queued",
      clientId: sender.clientId,
      clientContext: sender.clientContext,
      turnStopWatch
    });
    if (!started) {
      return;
    }
    host.sendTurnMessage({
      agent: started.agent,
      sessionChannel,
      turnChannel: channel,
      chat: channel,
      message,
      turnId,
      senderClientId: sender.clientId,
      clientContext: sender.clientContext,
      turnStopWatch
    });
  }
  _getHost() {
    const host = this._chatContributions.getHost();
    if (!host) {
      this._logService.warn("[QueueDrainContribution] Chat contribution host is not registered");
    }
    return host;
  }
};

QueueDrainContribution = __decorateClass([
  __decorateParam(1, IAgentHostChatContributions),
  __decorateParam(2, ILogService),
  __decorateParam(3, IAgentHostStateManager),
  __decorateParam(4, IAgentHostProviderService),
  __decorateParam(5, IInstantiationService)
], QueueDrainContribution);
export { QueuedSender, QueueDrainContribution };
