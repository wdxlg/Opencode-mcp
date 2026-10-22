// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChatContributionsService.ts
import { NKeyMap } from "./module-0006.mjs";
import { observableValue } from "./module-0064.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { Disposable, DisposableMap, toDisposable } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/agentHostChatContributionsService.ts
var AgentHostChatContributionContext = class {
  constructor(contributionId) {
    this.contributionId = contributionId;
    this._chatMementos = new NKeyMap();
    this._sessionMementos = new NKeyMap();
    this._chatsBySession = /* @__PURE__ */ new Map();
  }
  memento(key, resource, ...extra) {
    const mementos = key.scope === "chat" ? this._chatMementos : this._sessionMementos;
    const existing = mementos.get(resource, key.debugName, ...extra);
    if (existing) {
      return existing;
    }
    const memento = observableValue(this, key.create());
    mementos.set(memento, resource, key.debugName, ...extra);
    if (key.scope === "chat") {
      this._registerChat(resource);
    }
    return memento;
  }
  deleteMemento(key, resource, ...extra) {
    const mementos = key.scope === "chat" ? this._chatMementos : this._sessionMementos;
    mementos.delete(resource, key.debugName, ...extra);
  }
  disposeChatState(chat) {
    this._chatMementos.deleteAll(chat);
    const session = this._owningSession(chat);
    const chats = this._chatsBySession.get(session);
    if (chats?.delete(chat) && chats.size === 0) {
      this._chatsBySession.delete(session);
    }
  }
  disposeSessionState(session) {
    this._sessionMementos.deleteAll(session);
    const chats = this._chatsBySession.get(session);
    if (chats) {
      for (const chat of chats) {
        this._chatMementos.deleteAll(chat);
      }
      this._chatsBySession.delete(session);
    }
  }
  _registerChat(chat) {
    const session = this._owningSession(chat);
    let chats = this._chatsBySession.get(session);
    if (!chats) {
      chats = /* @__PURE__ */ new Set();
      this._chatsBySession.set(session, chats);
    }
    chats.add(chat);
  }
  _owningSession(chat) {
    return isAhpChatChannel(chat) ? parseRequiredSessionUriFromChatUri(chat) : chat;
  }
};

var AgentHostChatContributions = class extends Disposable {
  constructor(_logService, _instantiationService) {
    super();
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._contributionRegistrations = this._register(new DisposableMap());
    this._registeredContributions = /* @__PURE__ */ new Map();
    this._nextContributionIndex = 0;
  }
  registerContribution(contributionCtor) {
    for (const registration of this._registeredContributions.values()) {
      if (registration.id === contributionCtor.id) {
        throw new Error(`Chat contribution already registered: ${contributionCtor.id}`);
      }
    }
    const context = new AgentHostChatContributionContext(contributionCtor.id);
    const contribution = this._instantiationService.createInstance(contributionCtor, context);
    this._registeredContributions.set(contribution, { id: contributionCtor.id, contribution, context, index: this._nextContributionIndex++ });
    this._contributionRegistrations.set(contribution, toDisposable(() => {
      this._registeredContributions.delete(contribution);
      contribution.dispose();
    }));
    return toDisposable(() => this._contributionRegistrations.deleteAndDispose(contribution));
  }
  registerHost(host) {
    if (this._host !== void 0) {
      throw new Error("Chat contribution host already registered");
    }
    this._host = host;
    return toDisposable(() => {
      if (this._host === host) {
        this._host = void 0;
      }
    });
  }
  getHost() {
    return this._host;
  }
  turnEnd(turn) {
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onTurnEnd) {
        continue;
      }
      try {
        contribution.onTurnEnd(turn);
      } catch (err) {
        this._logContributionFailure(registration, err);
      }
    }
  }
  didApplyClientAction(action) {
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onDidApplyClientAction) {
        continue;
      }
      try {
        contribution.onDidApplyClientAction(action);
      } catch (err) {
        this._logContributionFailure(registration, err);
      }
    }
  }
  didDispatchAction(dispatched) {
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onDidDispatchAction) {
        continue;
      }
      try {
        contribution.onDidDispatchAction(dispatched);
      } catch (err) {
        this._logContributionFailure(registration, err);
      }
    }
  }
  async outgoingTurn(turn) {
    const instructions = [];
    let message = turn.message;
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onOutgoingTurn) {
        continue;
      }
      try {
        const result = await contribution.onOutgoingTurn({ ...turn, message });
        if (result?.instructions) {
          instructions.push(...result.instructions);
        }
        if (result?.text !== void 0) {
          message = { ...message, text: result.text };
        }
      } catch (err) {
        this._logContributionFailure(registration, err);
      }
    }
    return {
      ...instructions.length ? { instructions } : {},
      message
    };
  }
  /**
   * Admits an incoming request through ordered contribution gates.
   *
   * Unlike every other contribution dispatcher, this fails CLOSED: a throwing
   * contribution rejects the request instead of being isolated and skipped.
   * Treating a failure as an accept could run work in a read-only or archived
   * session whose worktree no longer exists.
   */
  incomingRequest(request) {
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onIncomingRequest) {
        continue;
      }
      try {
        const disposition = contribution.onIncomingRequest(request);
        if (disposition && disposition.kind !== "accept") {
          return disposition;
        }
      } catch (err) {
        this._logContributionFailure(registration, err);
        return {
          kind: "reject",
          error: {
            errorType: "internalError",
            message: `Turn admission contribution '${registration.id}' failed`
          },
          stage: "validation"
        };
      }
    }
    return { kind: "accept" };
  }
  async hydrateTurns(context, turns) {
    let hydratedTurns = turns;
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onHydrateTurns) {
        continue;
      }
      try {
        hydratedTurns = await contribution.onHydrateTurns(context, hydratedTurns);
      } catch (err) {
        this._logContributionFailure(registration, err);
      }
    }
    return hydratedTurns;
  }
  async hydrateChat(context, restored) {
    let hydrated = restored;
    for (const registration of this._getOrderedContributions()) {
      const { contribution } = registration;
      if (!contribution.onHydrateChat) {
        continue;
      }
      try {
        hydrated = await contribution.onHydrateChat(context, hydrated);
      } catch (err) {
        this._logContributionFailure(registration, err);
      }
    }
    return hydrated;
  }
  disposeChatState(chat) {
    for (const context of this._contributionContexts()) {
      context.disposeChatState(chat);
    }
  }
  disposeSessionState(session) {
    for (const context of this._contributionContexts()) {
      context.disposeSessionState(session);
    }
  }
  _getOrderedContributions() {
    return [...this._registeredContributions.values()].sort(
      (a, b) => (a.contribution.order ?? 0) - (b.contribution.order ?? 0) || a.index - b.index
    );
  }
  _contributionContexts() {
    return Array.from(this._registeredContributions.values(), (registration) => registration.context);
  }
  _logContributionFailure(registration, err) {
    this._logService.error(`[AgentHostChatContributions] Contribution '${registration.id}' failed: ${err instanceof Error ? err.message : String(err)}`, err);
  }
};

AgentHostChatContributions = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IInstantiationService)
], AgentHostChatContributions);
export { AgentHostChatContributionContext, AgentHostChatContributions };
