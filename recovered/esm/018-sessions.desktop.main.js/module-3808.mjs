// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/newSessionTourContribution.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { onboardingScenarioRegistry } from "./module-3795.mjs";
import { NEW_SESSION_TOUR_ID, createNewSessionTour } from "./module-3807.mjs";
import { IOnboardingScenarioService, isOnboardingDeveloperModeEnabled } from "./module-3797.mjs";
import { TOTAL_SESSIONS_KEY } from "./module-3613.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { findOnboardingTarget, pulseOnboardingTarget } from "./module-3542.mjs";
import { mainWindow } from "./module-0002.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/newSessionTourContribution.ts
var NEW_SESSION_BUTTON_TARGET = "sessions.newSession.button";

var NewSessionTourContribution = class extends Disposable {
  constructor(sessionsManagementService, onboardingScenarioService, sessionsService, storageService, configurationService) {
    super();
    this.onboardingScenarioService = onboardingScenarioService;
    this.sessionsService = sessionsService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    /** Drives the tour's `observable` trigger. Flipped to `true` exactly once. */
    this._trigger = observableValue(this, false);
    this._pendingCheck = this._register(new MutableDisposable());
    this._pulse = this._register(new MutableDisposable());
    this._register(onboardingScenarioRegistry.register(createNewSessionTour(this._trigger)));
    this._register(sessionsManagementService.onWillSendRequest((session) => this._onWillSendRequest(session)));
  }
  static {
    this.ID = "sessions.contrib.onboardingTours.newSessionTour";
  }
  static {
    /** Only nudge users who are still in their first few sessions. */
    this.MAX_SESSIONS_FOR_TOUR = 3;
  }
  static {
    /** Delay after a request before checking the session is still visible. */
    this.VISIBILITY_DELAY_MS = 5e3;
  }
  _onWillSendRequest(session) {
    if (this._trigger.get() || this.onboardingScenarioService.hasBeenShown(NEW_SESSION_TOUR_ID)) {
      this._pendingCheck.clear();
      this._pulse.clear();
      return;
    }
    const developerMode = isOnboardingDeveloperModeEnabled(this.configurationService, NEW_SESSION_TOUR_ID);
    if (!developerMode) {
      const sessionsStarted = this.storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0);
      if (sessionsStarted > NewSessionTourContribution.MAX_SESSIONS_FOR_TOUR) {
        return;
      }
    }
    this._pendingCheck.value = disposableTimeout(() => {
      const stillVisible = this.sessionsService.visibleSessions.get().some((s) => s?.sessionId === session.sessionId);
      if (stillVisible) {
        this._startNewSessionButtonPulse();
      }
    }, NewSessionTourContribution.VISIBILITY_DELAY_MS);
  }
  _startNewSessionButtonPulse() {
    if (this._pulse.value || this._trigger.get() || this.onboardingScenarioService.hasBeenShown(NEW_SESSION_TOUR_ID)) {
      return;
    }
    const target = findOnboardingTarget(mainWindow, NEW_SESSION_BUTTON_TARGET);
    if (!target) {
      return;
    }
    const pulse = new DisposableStore();
    pulse.add(pulseOnboardingTarget(target));
    pulse.add(addDisposableListener(target, EventType.CLICK, () => {
      if (this._trigger.get()) {
        return;
      }
      this._pulse.clear();
      this._trigger.set(true, void 0);
    }));
    pulse.add(addDisposableListener(target, "tap", () => {
      if (this._trigger.get()) {
        return;
      }
      this._pulse.clear();
      this._trigger.set(true, void 0);
    }));
    this._pulse.value = pulse;
  }
};

NewSessionTourContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, IOnboardingScenarioService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService)
], NewSessionTourContribution);

registerWorkbenchContribution2(NewSessionTourContribution.ID, NewSessionTourContribution, WorkbenchPhase.AfterRestored);
export { NEW_SESSION_BUTTON_TARGET, NewSessionTourContribution };
