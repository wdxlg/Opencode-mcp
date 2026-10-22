// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionOpenTelemetryService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { StopWatch } from "./module-0016.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { getSessionsTelemetryProviderId } from "./module-1781.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionOpenTelemetryService.ts
var SESSION_OPEN_TIMEOUT_MS = 6e4;

var ISessionOpenTelemetryService = createDecorator("sessionOpenTelemetryService");

var SessionOpenTelemetryAttempt = class extends Disposable {
  constructor(id2, source) {
    super();
    this.id = id2;
    this.source = source;
    this.stopwatch = StopWatch.create(false);
    this.resources = this._register(new DisposableStore());
    this.provider = "unknown";
  }
};

var SessionOpenTelemetryService = class extends Disposable {
  constructor(telemetryService) {
    super();
    this.telemetryService = telemetryService;
    this._boundChats = new ResourceMap();
    this._nextAttemptId = 1;
    this._register(toDisposable(() => this._finishActive("cancelled")));
  }
  async withOpenRequest(source, token, operation) {
    const attempt = this._start(source, token);
    try {
      return await operation(attempt);
    } catch (error) {
      this._finish(attempt, "failure");
      throw error;
    }
  }
  _start(source, token) {
    this._finishActive("cancelled");
    const attempt = new SessionOpenTelemetryAttempt(this._nextAttemptId++, source);
    this._activeAttempt = attempt;
    attempt.resources.add(token.onCancellationRequested(() => this._finish(attempt, "cancelled")));
    attempt.resources.add(disposableTimeout(() => this._finish(attempt, "timeout"), SESSION_OPEN_TIMEOUT_MS));
    return attempt;
  }
  sessionResolved(attempt, sessionResource, providerId, alreadyActive, sessionWasLoading) {
    const activeAttempt = this._getActive(attempt);
    if (!activeAttempt) {
      return;
    }
    activeAttempt.sessionResource = sessionResource;
    activeAttempt.provider = getSessionsTelemetryProviderId(providerId);
    activeAttempt.alreadyActive = alreadyActive;
    activeAttempt.sessionWasLoading = sessionWasLoading;
    activeAttempt.resourceResolvedDurationMs = this._elapsed(activeAttempt);
  }
  sessionActivated(attempt, chatResource) {
    const activeAttempt = this._getActive(attempt);
    if (!activeAttempt?.sessionResource) {
      return;
    }
    activeAttempt.chatResource = chatResource;
    if (activeAttempt.modelBindFailedChatResource && isEqual2(activeAttempt.modelBindFailedChatResource, chatResource)) {
      this._finish(activeAttempt, "failure");
      return;
    }
    activeAttempt.modelAlreadyBound = isEqual2(this._boundChats.get(activeAttempt.sessionResource), chatResource);
    if (activeAttempt.modelAlreadyBound) {
      activeAttempt.modelBoundDurationMs = this._elapsed(activeAttempt);
    }
  }
  sessionLoaded(attempt) {
    const activeAttempt = this._getActive(attempt);
    if (!activeAttempt) {
      return;
    }
    activeAttempt.sessionLoadedDurationMs = this._elapsed(activeAttempt);
    this._completeIfReady(activeAttempt);
  }
  modelBound(sessionResource, chatResource) {
    this._boundChats.set(sessionResource, chatResource);
    const activeAttempt = this._activeAttempt;
    if (!activeAttempt?.sessionResource || !activeAttempt.chatResource || !isEqual2(activeAttempt.sessionResource, sessionResource) || !isEqual2(activeAttempt.chatResource, chatResource)) {
      return;
    }
    activeAttempt.modelBoundDurationMs = this._elapsed(activeAttempt);
    this._completeIfReady(activeAttempt);
  }
  modelUnbound(sessionResource, chatResource) {
    const boundChat = this._boundChats.get(sessionResource);
    if (boundChat && isEqual2(boundChat, chatResource)) {
      this._boundChats.delete(sessionResource);
    }
  }
  modelBindFailed(sessionResource, chatResource) {
    const activeAttempt = this._activeAttempt;
    if (!activeAttempt?.sessionResource || !isEqual2(activeAttempt.sessionResource, sessionResource)) {
      return;
    }
    if (!activeAttempt.chatResource) {
      activeAttempt.modelBindFailedChatResource = chatResource;
    } else if (isEqual2(activeAttempt.chatResource, chatResource)) {
      this._finish(activeAttempt, "failure");
    } else {
      activeAttempt.modelBindFailedChatResource = chatResource;
    }
  }
  _completeIfReady(attempt) {
    if (attempt.sessionLoadedDurationMs !== void 0 && attempt.modelBoundDurationMs !== void 0) {
      this._finish(attempt, "success");
    }
  }
  _getActive(attempt) {
    const activeAttempt = this._activeAttempt;
    return activeAttempt?.id === attempt.id ? activeAttempt : void 0;
  }
  _finishActive(outcome) {
    if (this._activeAttempt) {
      this._finish(this._activeAttempt, outcome);
    }
  }
  _finish(attempt, outcome) {
    if (this._activeAttempt !== attempt) {
      return;
    }
    this._activeAttempt = void 0;
    const resourceResolvedDurationMs = attempt.resourceResolvedDurationMs;
    const sessionLoadedDurationMs = attempt.sessionLoadedDurationMs === void 0 ? void 0 : Math.max(resourceResolvedDurationMs ?? 0, attempt.sessionLoadedDurationMs);
    const modelBoundDurationMs = attempt.modelBoundDurationMs === void 0 ? void 0 : Math.max(sessionLoadedDurationMs ?? resourceResolvedDurationMs ?? 0, attempt.modelBoundDurationMs);
    const totalDurationMs = Math.max(modelBoundDurationMs ?? sessionLoadedDurationMs ?? resourceResolvedDurationMs ?? 0, this._elapsed(attempt));
    attempt.dispose();
    this.telemetryService.publicLog2("agents/sessionOpen", {
      outcome,
      source: attempt.source,
      provider: attempt.provider,
      alreadyActive: attempt.alreadyActive,
      sessionWasLoading: attempt.sessionWasLoading,
      modelAlreadyBound: attempt.modelAlreadyBound,
      resourceResolvedDurationMs,
      sessionLoadedDurationMs,
      modelBoundDurationMs,
      totalDurationMs
    });
  }
  _elapsed(attempt) {
    return Math.max(0, Math.round(attempt.stopwatch.elapsed()));
  }
};

SessionOpenTelemetryService = __decorateClass([
  __decorateParam(0, ITelemetryService)
], SessionOpenTelemetryService);

registerSingleton(ISessionOpenTelemetryService, SessionOpenTelemetryService, 1 /* Delayed */);
export { SESSION_OPEN_TIMEOUT_MS, ISessionOpenTelemetryService, SessionOpenTelemetryAttempt, SessionOpenTelemetryService };
