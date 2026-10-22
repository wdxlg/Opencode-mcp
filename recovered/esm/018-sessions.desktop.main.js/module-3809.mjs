// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/newSessionViewTourTrigger.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { isOnboardingDeveloperModeEnabled } from "./module-3797.mjs";
import { TOTAL_SESSIONS_KEY } from "./module-3613.mjs";
import { SessionWorkspacePickerVisibleContext } from "./module-1770.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/newSessionViewTourTrigger.ts
var MAX_REQUESTS_FOR_TOUR = 1;

var NewSessionViewTourTrigger = class extends Disposable {
  constructor(_tourId, _onboardingScenarioService, _sessionsService, _storageService, _configurationService, _contextKeyService, _chatEntitlementService) {
    super();
    this._tourId = _tourId;
    this._onboardingScenarioService = _onboardingScenarioService;
    this._sessionsService = _sessionsService;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._chatEntitlementService = _chatEntitlementService;
    this._trigger = observableValue(this, false);
    this.signal = this._trigger;
    if (!this._isEligibleUser()) {
      return;
    }
    const contextChanged = observableSignalFromEvent(this, this._contextKeyService.onDidChangeContext);
    this._register(autorun((reader) => {
      contextChanged.read(reader);
      this._sessionsService.initialRestoreComplete.read(reader);
      if (this._isTriggeredOrShown()) {
        return;
      }
      const activeSession = this._sessionsService.activeSession.read(reader);
      const newSessionViewOpen = !activeSession || !activeSession.isCreated.read(reader);
      const loggedIn = this._chatEntitlementService.entitlementObs.read(reader) !== 1 /* Unknown */;
      if (!newSessionViewOpen || !loggedIn) {
        return;
      }
      if (this._isReady()) {
        this._trigger.set(true, void 0);
      }
    }));
  }
  _isEligibleUser() {
    if (isOnboardingDeveloperModeEnabled(this._configurationService, this._tourId)) {
      return true;
    }
    const requestsSent = this._storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0);
    return requestsSent <= MAX_REQUESTS_FOR_TOUR;
  }
  _isTriggeredOrShown() {
    return this._trigger.get() || this._onboardingScenarioService.hasBeenShown(this._tourId);
  }
  _isReady() {
    const activeSession = this._sessionsService.activeSession.get();
    const newSessionViewOpen = !activeSession || !activeSession.isCreated.get();
    return this._sessionsService.initialRestoreComplete.get() && newSessionViewOpen && this._chatEntitlementService.entitlement !== 1 /* Unknown */ && this._contextKeyService.getContextKeyValue(SessionWorkspacePickerVisibleContext.key) === true;
  }
};
export { MAX_REQUESTS_FOR_TOUR, NewSessionViewTourTrigger };
