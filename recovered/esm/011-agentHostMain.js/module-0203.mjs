// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSessionOpenTelemetry.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0010.mjs";
import { StopWatch } from "./module-0015.mjs";
import { disposableTimeout } from "./module-0027.mjs";
import { isAhpChatChannel, isDefaultChatUri, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";


// src/vs/platform/agentHost/node/agentHostSessionOpenTelemetry.ts
var AgentHostSessionSubscribeTimeoutMs = 6e4;

var IAgentHostSessionOpenTelemetry = createDecorator("agentHostSessionOpenTelemetry");

var AgentHostSessionOpenTelemetryAttempt = class extends Disposable {
  constructor(id2, session, provider, channel) {
    super();
    this.id = id2;
    this.session = session;
    this.provider = provider;
    this.channel = channel;
    this.stopwatch = StopWatch.create(false);
    this.resources = this._register(new DisposableStore());
    this.sdkResumeAttemptCount = 0;
    this.sdkResumeDurationMs = 0;
    this.sdkResumeOutcome = provider === "copilotcli" ? "notStarted" : void 0;
  }
};

var AgentHostSessionOpenTelemetry = class extends Disposable {
  constructor(_telemetryService, _providerService) {
    super();
    this._telemetryService = _telemetryService;
    this._providerService = _providerService;
    this._attempts = /* @__PURE__ */ new Map();
    this._attemptsBySession = /* @__PURE__ */ new Map();
    this._nextAttemptId = 1;
    this._register(toDisposable(() => {
      for (const attempt of this._attempts.values()) {
        attempt.dispose();
      }
      this._attempts.clear();
      this._attemptsBySession.clear();
    }));
  }
  async withSubscription(resource, operation) {
    const attempt = this._start(resource);
    let servedFromMemory;
    const scope = {
      get servedFromMemory() {
        return servedFromMemory;
      },
      setServedFromMemory: (value) => {
        servedFromMemory = value;
        if (attempt) {
          attempt.servedFromMemory = value;
        }
      },
      restoreStarted: (joinedRestore) => {
        if (attempt) {
          this._restoreStarted(attempt, joinedRestore);
        }
      },
      restoreCompleted: () => {
        if (attempt) {
          this._restoreCompleted(attempt);
        }
      }
    };
    try {
      const result = await operation(scope);
      if (attempt) {
        this._finish(attempt, "success", servedFromMemory);
      }
      return result;
    } catch (error) {
      if (attempt) {
        this._finish(attempt, "failure", servedFromMemory);
      }
      throw error;
    }
  }
  async withSdkResume(session, operation) {
    this._sdkResumeStarted(session);
    try {
      const result = await operation();
      this._sdkResumeCompleted(session, "success");
      return result;
    } catch (error) {
      this._sdkResumeCompleted(session, "failure");
      throw error;
    }
  }
  sdkResumeFallbackCreated(session) {
    this._sdkResumeCompleted(session, "fallbackCreate");
  }
  _start(resource) {
    const info = this._classify(resource);
    if (!info) {
      return void 0;
    }
    const attempt = new AgentHostSessionOpenTelemetryAttempt(this._nextAttemptId++, info.session, info.provider, info.channel);
    this._attempts.set(attempt.id, attempt);
    let sessionAttempts = this._attemptsBySession.get(info.session.toString());
    if (!sessionAttempts) {
      sessionAttempts = /* @__PURE__ */ new Set();
      this._attemptsBySession.set(info.session.toString(), sessionAttempts);
    }
    sessionAttempts.add(attempt);
    attempt.resources.add(disposableTimeout(() => this._finish(attempt, "timeout", attempt.servedFromMemory), AgentHostSessionSubscribeTimeoutMs));
    return attempt;
  }
  _restoreStarted(attempt, joinedRestore) {
    const activeAttempt = this._getActive(attempt);
    if (!activeAttempt || activeAttempt.timeToRestoreStartMs !== void 0) {
      return;
    }
    activeAttempt.joinedRestore = joinedRestore;
    activeAttempt.timeToRestoreStartMs = this._elapsed(activeAttempt);
  }
  _restoreCompleted(attempt) {
    const activeAttempt = this._getActive(attempt);
    if (activeAttempt?.timeToRestoreStartMs !== void 0) {
      activeAttempt.timeToRestoreCompleteMs = this._elapsed(activeAttempt);
    }
  }
  _sdkResumeStarted(session) {
    for (const attempt of this._getSessionAttempts(session)) {
      const elapsed = this._elapsed(attempt);
      attempt.timeToSdkResumeStartMs ??= elapsed;
      attempt.activeSdkResumeStartMs = elapsed;
      attempt.sdkResumeAttemptCount++;
    }
  }
  _sdkResumeCompleted(session, outcome) {
    for (const attempt of this._getSessionAttempts(session)) {
      const elapsed = this._elapsed(attempt);
      if (attempt.activeSdkResumeStartMs !== void 0) {
        attempt.sdkResumeDurationMs += Math.max(0, elapsed - attempt.activeSdkResumeStartMs);
        attempt.timeToSdkResumeCompleteMs = elapsed;
        attempt.activeSdkResumeStartMs = void 0;
        attempt.sdkResumeOutcome = outcome;
      } else if (outcome === "fallbackCreate" && attempt.sdkResumeAttemptCount > 0) {
        attempt.sdkResumeOutcome = outcome;
      }
    }
  }
  _finish(attempt, outcome, servedFromMemory) {
    if (!this._attempts.delete(attempt.id)) {
      return;
    }
    const sessionKey = attempt.session.toString();
    const sessionAttempts = this._attemptsBySession.get(sessionKey);
    sessionAttempts?.delete(attempt);
    if (sessionAttempts?.size === 0) {
      this._attemptsBySession.delete(sessionKey);
    }
    const elapsed = this._elapsed(attempt);
    if (attempt.activeSdkResumeStartMs !== void 0) {
      attempt.sdkResumeDurationMs += Math.max(0, elapsed - attempt.activeSdkResumeStartMs);
      attempt.activeSdkResumeStartMs = void 0;
      attempt.sdkResumeOutcome = "incomplete";
    }
    const timeToRestoreStartMs = attempt.timeToRestoreStartMs;
    const timeToSdkResumeStartMs = attempt.timeToSdkResumeStartMs === void 0 ? void 0 : Math.max(timeToRestoreStartMs ?? 0, attempt.timeToSdkResumeStartMs);
    const timeToSdkResumeCompleteMs = attempt.timeToSdkResumeCompleteMs === void 0 ? void 0 : Math.max(timeToSdkResumeStartMs ?? timeToRestoreStartMs ?? 0, attempt.timeToSdkResumeCompleteMs);
    const timeToRestoreCompleteMs = attempt.timeToRestoreCompleteMs === void 0 ? void 0 : Math.max(timeToSdkResumeCompleteMs ?? timeToRestoreStartMs ?? 0, attempt.timeToRestoreCompleteMs);
    const totalDurationMs = Math.max(timeToRestoreCompleteMs ?? timeToSdkResumeCompleteMs ?? timeToRestoreStartMs ?? 0, elapsed);
    attempt.dispose();
    this._telemetryService.publicLog2("agentHost.sessionSubscribe", {
      provider: attempt.provider,
      channel: attempt.channel,
      outcome,
      servedFromMemory,
      joinedRestore: attempt.joinedRestore,
      sdkResumeOutcome: attempt.sdkResumeOutcome,
      sdkResumeAttemptCount: attempt.provider === "copilotcli" ? attempt.sdkResumeAttemptCount : void 0,
      timeToRestoreStartMs,
      timeToSdkResumeStartMs,
      sdkResumeDurationMs: attempt.sdkResumeAttemptCount > 0 ? attempt.sdkResumeDurationMs : void 0,
      timeToSdkResumeCompleteMs,
      timeToRestoreCompleteMs,
      totalDurationMs
    });
  }
  _getActive(attempt) {
    return this._attempts.get(attempt.id);
  }
  _getSessionAttempts(session) {
    return [...this._attemptsBySession.get(session.toString()) ?? []];
  }
  _elapsed(attempt) {
    return Math.max(0, Math.round(attempt.stopwatch.elapsed()));
  }
  _classify(resource) {
    const resourceString = resource.toString();
    const session = isAhpChatChannel(resourceString) ? URI.parse(parseRequiredSessionUriFromChatUri(resourceString)) : resource;
    const provider = this._providerService.getProviderForSession(session)?.id;
    if (!provider) {
      return void 0;
    }
    return {
      session,
      provider,
      channel: !isAhpChatChannel(resourceString) ? "session" : isDefaultChatUri(resource) ? "defaultChat" : "chat"
    };
  }
};

AgentHostSessionOpenTelemetry = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IAgentHostProviderService)
], AgentHostSessionOpenTelemetry);
export { AgentHostSessionSubscribeTimeoutMs, IAgentHostSessionOpenTelemetry, AgentHostSessionOpenTelemetryAttempt, AgentHostSessionOpenTelemetry };
