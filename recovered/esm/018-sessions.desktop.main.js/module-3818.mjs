// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/newSessionViewTourContribution.ts
import { SessionHarnessPickerVisibleContext, SessionIsolationPickerVisibleContext, SessionWorkspacePickerVisibleContext } from "./module-1770.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { onboardingScenarioRegistry } from "./module-3795.mjs";
import { NEW_SESSION_VIEW_TOUR_ID, createNewSessionViewTour } from "./module-3817.mjs";
import { autorun } from "./module-0052.mjs";
import { IOnboardingScenarioService, isOnboardingDeveloperModeEnabled } from "./module-3797.mjs";
import { TOTAL_SESSIONS_KEY } from "./module-3613.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/newSessionViewTourContribution.ts
var NEW_SESSION_PICKER_VISIBLE_KEYS = [
  SessionWorkspacePickerVisibleContext.key,
  SessionHarnessPickerVisibleContext.key,
  SessionIsolationPickerVisibleContext.key
];

var NewSessionViewTourContribution = class extends Disposable {
  constructor(onboardingScenarioService, sessionsService, storageService, configurationService, contextKeyService) {
    super();
    this.onboardingScenarioService = onboardingScenarioService;
    this.sessionsService = sessionsService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    /** Drives the tour's `observable` trigger. Flipped to `true` exactly once. */
    this._trigger = observableValue(this, false);
    this._pendingCheck = this._register(new MutableDisposable());
    this._register(onboardingScenarioRegistry.register(createNewSessionViewTour(this._trigger)));
    if (!this._isEligibleUser()) {
      return;
    }
    this._register(autorun((reader) => {
      if (this._isTriggeredOrShown()) {
        this._pendingCheck.clear();
        return;
      }
      const activeSession = this.sessionsService.activeSession.read(reader);
      const newSessionViewOpen = !activeSession || !activeSession.isCreated.read(reader);
      if (!newSessionViewOpen) {
        this._pendingCheck.clear();
        return;
      }
      if (!this._pendingCheck.value) {
        this._armReadyCheck();
      }
    }));
  }
  static {
    this.ID = "sessions.contrib.onboardingTours.newSessionViewTour";
  }
  static {
    /** Only nudge users who have sent at most this many requests. */
    this.MAX_REQUESTS_FOR_TOUR = 3;
  }
  static {
    /**
     * Delay before the first readiness check after the new-session view opens.
     * Gives startup restore time to settle, so a session that is about to be
     * restored as the active view is not mistaken for the new-session view, and
     * lets the composer render its pickers before the first check.
     */
    this.SETTLE_DELAY_MS = 1e3;
  }
  _isEligibleUser() {
    if (isOnboardingDeveloperModeEnabled(this.configurationService, NEW_SESSION_VIEW_TOUR_ID)) {
      return true;
    }
    const requestsSent = this.storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0);
    return requestsSent <= NewSessionViewTourContribution.MAX_REQUESTS_FOR_TOUR;
  }
  _isTriggeredOrShown() {
    return this._trigger.get() || this.onboardingScenarioService.hasBeenShown(NEW_SESSION_VIEW_TOUR_ID);
  }
  /**
   * Arms a watch that flips the trigger once all three pickers report visible.
   * Checks once after a settle delay and again whenever a picker-visibility
   * context key changes, so late-rendering pickers (e.g. the isolation picker
   * resolving its git repository) are picked up without polling forever.
   */
  _armReadyCheck() {
    const store = new DisposableStore();
    const check = () => {
      if (this._isTriggeredOrShown()) {
        this._pendingCheck.clear();
        return;
      }
      const activeSession = this.sessionsService.activeSession.get();
      const newSessionViewOpen = !activeSession || !activeSession.isCreated.get();
      if (!newSessionViewOpen) {
        this._pendingCheck.clear();
        return;
      }
      if (this._allPickersVisible()) {
        this._trigger.set(true, void 0);
        this._pendingCheck.clear();
      }
    };
    const watchedKeys = new Set(NEW_SESSION_PICKER_VISIBLE_KEYS);
    store.add(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(watchedKeys)) {
        check();
      }
    }));
    store.add(disposableTimeout(check, NewSessionViewTourContribution.SETTLE_DELAY_MS));
    this._pendingCheck.value = store;
  }
  _allPickersVisible() {
    return NEW_SESSION_PICKER_VISIBLE_KEYS.every((key3) => this.contextKeyService.getContextKeyValue(key3) === true);
  }
};

NewSessionViewTourContribution = __decorateClass([
  __decorateParam(0, IOnboardingScenarioService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService)
], NewSessionViewTourContribution);

registerWorkbenchContribution2(NewSessionViewTourContribution.ID, NewSessionViewTourContribution, WorkbenchPhase.AfterRestored);
export { NEW_SESSION_PICKER_VISIBLE_KEYS, NewSessionViewTourContribution };
