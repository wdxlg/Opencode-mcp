// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/newSessionViewV2TourContribution.ts
import { Disposable } from "./module-0012.mjs";
import { NewSessionViewTourTrigger } from "./module-3809.mjs";
import { NEW_SESSION_VIEW_V2_TOUR_ID, createNewSessionViewV2Tour } from "./module-3811.mjs";
import { onboardingScenarioRegistry } from "./module-3795.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOnboardingScenarioService } from "./module-3797.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/newSessionViewV2TourContribution.ts
var NewSessionViewV2TourContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.onboardingTours.newSessionViewV2Tour";
  }
  constructor(onboardingScenarioService, sessionsService, storageService, configurationService, contextKeyService, chatEntitlementService) {
    super();
    const trigger = this._register(new NewSessionViewTourTrigger(
      NEW_SESSION_VIEW_V2_TOUR_ID,
      onboardingScenarioService,
      sessionsService,
      storageService,
      configurationService,
      contextKeyService,
      chatEntitlementService
    ));
    this._register(onboardingScenarioRegistry.register(createNewSessionViewV2Tour(trigger.signal)));
  }
};

NewSessionViewV2TourContribution = __decorateClass([
  __decorateParam(0, IOnboardingScenarioService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IChatEntitlementService)
], NewSessionViewV2TourContribution);

registerWorkbenchContribution2(NewSessionViewV2TourContribution.ID, NewSessionViewV2TourContribution, WorkbenchPhase.AfterRestored);
export { NewSessionViewV2TourContribution };
