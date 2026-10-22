// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsWindowOpenTelemetry.ts
import { Disposable } from "./module-0012.mjs";
import { disposableTimeout } from "./module-0036.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsWindowOpenTelemetry.ts
var FIRST_TIME_WINDOW_OPEN_DURATION_LIMIT_MS = 3 * 60 * 1e3;

var SessionsWindowSessionStartTelemetry = class {
  constructor(source, hasPreviouslyStartedSession, telemetryService) {
    telemetryService.publicLog2("agents/windowSessionStart", {
      sessionStart: true,
      source,
      hasPreviouslyStartedSession
    });
  }
};

var SessionsWindowOpenTelemetry = class extends Disposable {
  constructor(_source, _getSignInDialogShown, _getViewState, _telemetryService, lifecycleService) {
    super();
    this._source = _source;
    this._getSignInDialogShown = _getSignInDialogShown;
    this._getViewState = _getViewState;
    this._telemetryService = _telemetryService;
    this._didSend = false;
    this._openedAt = Date.now();
    const remainingDuration = Math.max(0, FIRST_TIME_WINDOW_OPEN_DURATION_LIMIT_MS - this._elapsed());
    this._register(disposableTimeout(() => this._send("timer", void 0), remainingDuration));
    this._register(lifecycleService.onWillShutdown((event) => {
      const windowCloseDurationMs = event.reason === 1 /* CLOSE */ || event.reason === 2 /* QUIT */ ? this._getCloseDuration() : void 0;
      this._send(this._getEmissionReason(event.reason), windowCloseDurationMs);
    }));
  }
  captureInitialViewState() {
    this._viewState ??= this._getViewState();
  }
  _elapsed() {
    return Math.max(0, Date.now() - this._openedAt);
  }
  _getCloseDuration() {
    const duration = this._elapsed();
    return duration <= FIRST_TIME_WINDOW_OPEN_DURATION_LIMIT_MS ? duration : void 0;
  }
  _getEmissionReason(reason) {
    switch (reason) {
      case 1 /* CLOSE */:
        return "close";
      case 2 /* QUIT */:
        return "quit";
      case 3 /* RELOAD */:
        return "reload";
      default:
        return "otherShutdown";
    }
  }
  _send(emissionReason, windowCloseDurationMs) {
    if (this._didSend) {
      return;
    }
    this._didSend = true;
    this.captureInitialViewState();
    this._telemetryService.publicLog2("agents/firstTimeWindowOpen", {
      source: this._source,
      signInDialogShown: this._getSignInDialogShown(),
      workspacePreselected: this._viewState?.workspacePreselected,
      workspacePreselectionSource: this._viewState?.workspacePreselectionSource,
      windowCloseDurationMs,
      emissionReason
    });
  }
};
export { FIRST_TIME_WINDOW_OPEN_DURATION_LIMIT_MS, SessionsWindowSessionStartTelemetry, SessionsWindowOpenTelemetry };
