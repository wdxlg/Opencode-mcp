// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentSessionResidency.ts
import { Disposable, DisposableResourceMap } from "./module-0010.mjs";
import { LinkedMap } from "./module-0006.mjs";
import { Sequencer, disposableTimeout } from "./module-0027.mjs";
import { AgentHostSessionReleaseRetryMsEnvVar, AgentHostSessionResidencyLimitEnvVar } from "./module-0049.mjs";
import { URI } from "./module-0023.mjs";
import { isSessionStatusArchived, parseSubagentSessionUri } from "./module-0047.mjs";
import { IAgentHostSubscriptionService, resolveAgentHostSession } from "./module-0480.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentSessionResidency.ts
var DEFAULT_SESSION_RESIDENCY_LIMIT = 10;

var DEFAULT_SESSION_RELEASE_RETRY_MS = 3e4;

function readNonNegativeIntegerEnv(name, defaultValue) {
  const raw = process.env[name];
  const parsed = raw !== void 0 ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultValue;
}

var AgentSessionResidency = class extends Disposable {
  constructor(_stateManager, _delegate, _options, _subscriptions, _logService) {
    super();
    this._stateManager = _stateManager;
    this._delegate = _delegate;
    this._options = _options;
    this._subscriptions = _subscriptions;
    this._logService = _logService;
    this._releaseInFlight = /* @__PURE__ */ new Map();
    this._sessionsBeingDisposed = /* @__PURE__ */ new Set();
    this._recency = new LinkedMap();
    this._reconciler = new Sequencer();
    this._releaseRetries = this._register(new DisposableResourceMap());
    this._limit = _options.limit ?? readNonNegativeIntegerEnv(AgentHostSessionResidencyLimitEnvVar, DEFAULT_SESSION_RESIDENCY_LIMIT);
    this._releaseRetryMs = _options.releaseRetryMs ?? readNonNegativeIntegerEnv(AgentHostSessionReleaseRetryMsEnvVar, DEFAULT_SESSION_RELEASE_RETRY_MS);
    this._register(this._stateManager.onDidChangeSessionActiveTurn(({ session, active }) => {
      if (active) {
        this.touch(URI.parse(session));
      }
      void this.reconcile();
    }));
    this._register(this._stateManager.onDidRemoveSession((session) => {
      const resource = URI.parse(session);
      if (!parseSubagentSessionUri(resource)) {
        this._recency.delete(session);
        void this.reconcile();
      }
    }));
    this._register(this._options.onDidReleaseHold(() => void this.reconcile()));
  }
  touch(resource) {
    const session = resolveAgentHostSession(resource);
    this._releaseRetries.deleteAndDispose(session);
    const sessionKey = session.toString();
    if (!this._stateManager.getSessionState(sessionKey) || this._stateManager.isEphemeralSession(sessionKey) || this._stateManager.isUnusedDraft(sessionKey) === true) {
      return;
    }
    this._recency.set(sessionKey, session, 2 /* AsNew */);
  }
  reconcile() {
    return this._reconciler.queue(() => this._doReconcile());
  }
  async runDisposal(resource, task) {
    const session = resolveAgentHostSession(resource);
    const sessionKey = session.toString();
    this._sessionsBeingDisposed.add(sessionKey);
    this._recency.delete(sessionKey);
    this._releaseRetries.deleteAndDispose(session);
    try {
      await this._releaseInFlight.get(sessionKey);
      this._releaseRetries.deleteAndDispose(session);
      try {
        return await task();
      } catch (error) {
        this.touch(session);
        throw error;
      }
    } finally {
      this._sessionsBeingDisposed.delete(sessionKey);
      void this.reconcile();
    }
  }
  async waitForRelease(resource) {
    await this._releaseInFlight.get(resolveAgentHostSession(resource).toString());
  }
  _residentCount() {
    let count = 0;
    for (const [sessionKey] of this._recency) {
      if (this._stateManager.getSessionState(sessionKey) && !this._stateManager.isEphemeralSession(sessionKey) && this._stateManager.isUnusedDraft(sessionKey) !== true) {
        count++;
      }
    }
    return count;
  }
  _isReleaseRequired(sessionKey, expectedRecency) {
    if (isSessionStatusArchived(this._stateManager.getSessionState(sessionKey)?.status)) {
      return true;
    }
    return expectedRecency !== void 0 && this._recency.get(sessionKey) === expectedRecency && this._residentCount() > this._limit;
  }
  async _doReconcile() {
    const stale = [];
    const residents = [];
    for (const [sessionKey, session] of this._recency) {
      if (!this._stateManager.getSessionState(sessionKey) || this._stateManager.isEphemeralSession(sessionKey) || this._stateManager.isUnusedDraft(sessionKey) === true) {
        stale.push(sessionKey);
      } else {
        residents.push(session);
      }
    }
    for (const sessionKey of stale) {
      this._recency.delete(sessionKey);
    }
    const archived = /* @__PURE__ */ new Map();
    for (const sessionKey of this._stateManager.getSessionUris()) {
      const session = URI.parse(sessionKey);
      if (!parseSubagentSessionUri(session) && isSessionStatusArchived(this._stateManager.getSessionState(sessionKey)?.status)) {
        archived.set(sessionKey, session);
      }
    }
    let residentCount = residents.length;
    const processed = /* @__PURE__ */ new Set();
    for (const session of [...archived.values(), ...residents]) {
      const sessionKey = session.toString();
      if (processed.has(sessionKey)) {
        continue;
      }
      processed.add(sessionKey);
      if (!archived.has(sessionKey) && residentCount <= this._limit) {
        break;
      }
      const wasResident = this._recency.has(sessionKey);
      if (await this._tryRelease(session, this._recency.get(sessionKey)) && wasResident) {
        residentCount--;
      }
    }
  }
  async _tryRelease(resource, expectedRecency) {
    const session = resolveAgentHostSession(resource);
    const sessionKey = session.toString();
    if (!this._isReleaseRequired(sessionKey, expectedRecency) || this._sessionsBeingDisposed.has(sessionKey) || this._releaseRetries.has(session) || this._subscriptions.hasSessionSubscribers(session) || this._delegate.isReleaseBlocked(session) || this._stateManager.hasActiveTurn(sessionKey) || this._options.holdsSession(sessionKey)) {
      return false;
    }
    const releaseInFlight = this._releaseInFlight.get(sessionKey);
    if (releaseInFlight) {
      return releaseInFlight;
    }
    const trackedRelease = this._release(session, expectedRecency);
    this._releaseInFlight.set(sessionKey, trackedRelease);
    try {
      return await trackedRelease;
    } finally {
      if (this._releaseInFlight.get(sessionKey) === trackedRelease) {
        this._releaseInFlight.delete(sessionKey);
      }
    }
  }
  async _release(session, expectedRecency) {
    const sessionKey = session.toString();
    try {
      await this._delegate.whenSessionDataIdle(session);
      if (!this._canContinueRelease(sessionKey, expectedRecency)) {
        return false;
      }
      const release3 = this._delegate.createRelease(session);
      if (!release3) {
        return false;
      }
      let chats = this._delegate.getSessionChats(session);
      while (true) {
        if (!await release3.canRelease(chats)) {
          this._scheduleRetryIfNeeded(session, expectedRecency);
          return false;
        }
        const currentChats = this._delegate.getSessionChats(session);
        if (currentChats.length === chats.length && currentChats.every((chat, index) => chat.toString() === chats[index].toString())) {
          break;
        }
        chats = currentChats;
      }
      if (!this._stateManager.getSessionState(sessionKey) || !this._canContinueRelease(sessionKey, expectedRecency)) {
        return false;
      }
      await release3.release(chats);
      if (!this._canContinueRelease(sessionKey, expectedRecency)) {
        return false;
      }
      this._delegate.evictSessionState(session, chats);
      return true;
    } catch (error) {
      this._logService.error(error, `[AgentSessionResidency] Failed to release session ${sessionKey}`);
      this._scheduleRetryIfNeeded(session, expectedRecency);
      return false;
    }
  }
  _canContinueRelease(sessionKey, expectedRecency) {
    return !this._store.isDisposed && this._isReleaseRequired(sessionKey, expectedRecency) && !this._sessionsBeingDisposed.has(sessionKey) && !this._subscriptions.hasSessionSubscribers(URI.parse(sessionKey)) && !this._delegate.isReleaseBlocked(URI.parse(sessionKey)) && !this._stateManager.hasActiveTurn(sessionKey) && !this._options.holdsSession(sessionKey);
  }
  _scheduleRetryIfNeeded(session, expectedRecency) {
    const sessionKey = session.toString();
    if (this._store.isDisposed || !this._isReleaseRequired(sessionKey, expectedRecency) || this._sessionsBeingDisposed.has(sessionKey) || this._subscriptions.hasSessionSubscribers(session)) {
      return;
    }
    this._releaseRetries.set(session, disposableTimeout(() => {
      this._releaseRetries.deleteAndDispose(session);
      void this.reconcile();
    }, this._releaseRetryMs));
  }
};

AgentSessionResidency = __decorateClass([
  __decorateParam(3, IAgentHostSubscriptionService),
  __decorateParam(4, ILogService)
], AgentSessionResidency);
export { readNonNegativeIntegerEnv, DEFAULT_SESSION_RESIDENCY_LIMIT, DEFAULT_SESSION_RELEASE_RETRY_MS, AgentSessionResidency };
