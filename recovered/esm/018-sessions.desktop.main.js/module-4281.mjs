// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxTelemetry.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { IntervalTimer } from "./module-0036.mjs";
import { CloudSandboxRequestError } from "./module-3675.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxTelemetry.ts
var ICloudSandboxTelemetryService = createDecorator("cloudSandboxTelemetryService");

var REQUEST_REPORT_INTERVAL_MS = 30 * 6e4;

function requestOutcomeForStatus(statusCode) {
  if (statusCode === void 0) {
    return "networkError";
  }
  if (statusCode === 202) {
    return "waking";
  }
  if (statusCode >= 200 && statusCode < 300) {
    return "succeeded";
  }
  if (statusCode >= 500) {
    return "serverError";
  }
  if (statusCode >= 400) {
    return "clientError";
  }
  return "unexpectedStatus";
}

function emptyCounts() {
  return { succeeded: 0, waking: 0, clientError: 0, serverError: 0, networkError: 0, unexpectedStatus: 0 };
}

var CloudSandboxTelemetryService = class extends Disposable {
  constructor(_telemetryService) {
    super();
    this._telemetryService = _telemetryService;
    this._counts = /* @__PURE__ */ new Map();
    this._reportTimer = this._register(new IntervalTimer());
    /** When the current window began, i.e. when its first request was recorded. */
    this._windowStart = Date.now();
    this._register({ dispose: () => this.flushRequestCounts() });
  }
  reportRequest(action, outcome) {
    let counts = this._counts.get(action);
    if (!counts) {
      counts = emptyCounts();
      this._counts.set(action, counts);
      if (this._counts.size === 1) {
        this._windowStart = Date.now();
        this._reportTimer.cancelAndSet(() => this.flushRequestCounts(), REQUEST_REPORT_INTERVAL_MS);
      }
    }
    counts[outcome]++;
  }
  reportCredentialRefreshStopped(reason, consecutiveFailures, error) {
    this._telemetryService.publicLog2(
      "cloudSandboxCredentialRefreshStopped",
      {
        reason,
        consecutiveFailures,
        statusCode: error instanceof CloudSandboxRequestError ? error.statusCode : void 0
      }
    );
  }
  /** Report and reset the accumulated request counts. Safe to call when nothing has been recorded. */
  flushRequestCounts() {
    if (this._counts.size === 0) {
      return;
    }
    const windowMs = Date.now() - this._windowStart;
    for (const [action, counts] of this._counts) {
      this._telemetryService.publicLog2(
        "cloudSandboxRequests",
        {
          action,
          windowMs,
          total: counts.succeeded + counts.waking + counts.clientError + counts.serverError + counts.networkError + counts.unexpectedStatus,
          succeeded: counts.succeeded,
          waking: counts.waking,
          clientError: counts.clientError,
          serverError: counts.serverError,
          networkError: counts.networkError,
          unexpectedStatus: counts.unexpectedStatus
        }
      );
    }
    this._counts.clear();
    this._reportTimer.cancel();
  }
};

CloudSandboxTelemetryService = __decorateClass([
  __decorateParam(0, ITelemetryService)
], CloudSandboxTelemetryService);
export { requestOutcomeForStatus, emptyCounts, ICloudSandboxTelemetryService, REQUEST_REPORT_INTERVAL_MS, CloudSandboxTelemetryService };
