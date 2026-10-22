// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostStartupTelemetry.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/platform/agentHost/common/agentHostStartupTelemetry.ts
var AgentHostStartupTimeoutMs = 2 * 60 * 1e3;

var AgentHostStartupTelemetry = class extends Disposable {
  constructor(_clientType, _connectionKind, stopWatchFactory, timeoutFactory, _telemetryService) {
    super();
    this._clientType = _clientType;
    this._connectionKind = _connectionKind;
    this._telemetryService = _telemetryService;
    this._reported = false;
    this._sessionListAttemptCount = 0;
    this._sessionListFailureCount = 0;
    this._stopWatch = stopWatchFactory();
    this._timeout = this._register(timeoutFactory(() => this._report("timeout", this._failureStage()), AgentHostStartupTimeoutMs));
  }
  messagePortAcquired() {
    this._timeToMessagePortMs ??= this._stopWatch.elapsed();
  }
  protocolConnected() {
    this._timeToProtocolConnectionMs ??= this._stopWatch.elapsed();
  }
  authenticationSettled() {
    this._timeToAuthenticationSettledMs ??= this._stopWatch.elapsed();
  }
  sessionListRequested() {
    if (this._reported) {
      return;
    }
    this._sessionListAttemptCount++;
    this._timeToSessionListRequestMs ??= this._stopWatch.elapsed();
  }
  sessionListFailed() {
    if (!this._reported) {
      this._sessionListFailureCount++;
    }
  }
  sessionListSucceeded() {
    this._report("success", void 0);
  }
  connectionFailed() {
    this._report("error", this._failureStage());
  }
  dispose() {
    this._reported = true;
    super.dispose();
  }
  /** Startup reaches the session-list stage as soon as the protocol connects. */
  _failureStage() {
    return this._timeToProtocolConnectionMs === void 0 ? "protocolConnection" : "sessionList";
  }
  _report(outcome, failureStage) {
    if (this._reported) {
      return;
    }
    this._reported = true;
    this._timeout.dispose();
    const timeToSessionListCompleteMs = outcome === "success" ? this._stopWatch.elapsed() : void 0;
    this._telemetryService.publicLog2("agentHost.startup", {
      clientType: this._clientType,
      connectionKind: this._connectionKind,
      outcome,
      failureStage,
      timeToMessagePortMs: this._timeToMessagePortMs,
      timeToProtocolConnectionMs: this._timeToProtocolConnectionMs,
      timeToAuthenticationSettledMs: this._timeToAuthenticationSettledMs,
      timeToSessionListRequestMs: this._timeToSessionListRequestMs,
      timeToSessionListCompleteMs,
      sessionListDurationMs: timeToSessionListCompleteMs !== void 0 && this._timeToSessionListRequestMs !== void 0 ? Math.max(0, timeToSessionListCompleteMs - this._timeToSessionListRequestMs) : void 0,
      sessionListAttemptCount: this._sessionListAttemptCount,
      sessionListFailureCount: this._sessionListFailureCount
    });
  }
};

AgentHostStartupTelemetry = __decorateClass([
  __decorateParam(4, ITelemetryService)
], AgentHostStartupTelemetry);
export { AgentHostStartupTimeoutMs, AgentHostStartupTelemetry };
