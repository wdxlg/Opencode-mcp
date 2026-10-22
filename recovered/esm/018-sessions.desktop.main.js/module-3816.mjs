// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/newSessionViewV3TourContribution.ts
import { Disposable } from "./module-0012.mjs";
import { NewSessionViewTourTrigger } from "./module-3809.mjs";
import { NEW_SESSION_VIEW_V3_TOUR_ID, createNewSessionViewV3Tour } from "./module-3814.mjs";
import { NewSessionViewV3PromptRunner } from "./module-3815.mjs";
import { onboardingScenarioRegistry } from "./module-3795.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOnboardingScenarioService } from "./module-3797.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { INewSessionComposerService } from "./module-3561.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IGitService } from "./module-1485.mjs";
import { IFileService } from "./module-0269.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/newSessionViewV3TourContribution.ts
var NewSessionViewV3TourContribution = class extends Disposable {
  constructor(onboardingScenarioService, _sessionsService, storageService, configurationService, contextKeyService, chatEntitlementService, _newSessionComposerService, assignmentService, gitService, fileService, gitHubService, telemetryService, logService) {
    super();
    this._sessionsService = _sessionsService;
    this._newSessionComposerService = _newSessionComposerService;
    const trigger = this._register(new NewSessionViewTourTrigger(
      NEW_SESSION_VIEW_V3_TOUR_ID,
      onboardingScenarioService,
      this._sessionsService,
      storageService,
      configurationService,
      contextKeyService,
      chatEntitlementService
    ));
    const promptRunner = new NewSessionViewV3PromptRunner(
      assignmentService,
      configurationService,
      this._sessionsService,
      this._newSessionComposerService,
      gitService,
      fileService,
      gitHubService,
      telemetryService,
      logService
    );
    this._register(onboardingScenarioRegistry.register(createNewSessionViewV3Tour(
      trigger.signal,
      (token) => promptRunner.run(token)
    )));
  }
  static {
    this.ID = "sessions.contrib.onboardingTours.newSessionViewV3Tour";
  }
};

NewSessionViewV3TourContribution = __decorateClass([
  __decorateParam(0, IOnboardingScenarioService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IChatEntitlementService),
  __decorateParam(6, INewSessionComposerService),
  __decorateParam(7, IWorkbenchAssignmentService),
  __decorateParam(8, IGitService),
  __decorateParam(9, IFileService),
  __decorateParam(10, IGitHubService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, ILogService)
], NewSessionViewV3TourContribution);

registerWorkbenchContribution2(NewSessionViewV3TourContribution.ID, NewSessionViewV3TourContribution, WorkbenchPhase.AfterRestored);
export { NewSessionViewV3TourContribution };
