// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/surveys/browser/nps.contribution.ts
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { platform2 } from "./module-0015.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { language } from "./module-0014.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/surveys/browser/nps.contribution.ts
var PROBABILITY = 0.15;

var SESSION_COUNT_KEY = "nps/sessionCount";

var LAST_SESSION_DATE_KEY = "nps/lastSessionDate";

var SKIP_VERSION_KEY = "nps/skipVersion";

var IS_CANDIDATE_KEY = "nps/isCandidate";

var NPSContribution = class {
  constructor(storageService, notificationService, telemetryService, openerService, productService, configurationService, environmentService) {
    if (!productService.npsSurveyUrl || !configurationService.getValue("telemetry.feedback.enabled") || environmentService.isSessionsWindow) {
      return;
    }
    const skipVersion = storageService.get(SKIP_VERSION_KEY, -1 /* APPLICATION */, "");
    if (skipVersion) {
      return;
    }
    const date = (/* @__PURE__ */ new Date()).toDateString();
    const lastSessionDate = storageService.get(LAST_SESSION_DATE_KEY, -1 /* APPLICATION */, (/* @__PURE__ */ new Date(0)).toDateString());
    if (date === lastSessionDate) {
      return;
    }
    const sessionCount = (storageService.getNumber(SESSION_COUNT_KEY, -1 /* APPLICATION */, 0) || 0) + 1;
    storageService.store(LAST_SESSION_DATE_KEY, date, -1 /* APPLICATION */, 0 /* USER */);
    storageService.store(SESSION_COUNT_KEY, sessionCount, -1 /* APPLICATION */, 0 /* USER */);
    if (sessionCount < 9) {
      return;
    }
    const isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY, -1 /* APPLICATION */, false) || Math.random() < PROBABILITY;
    storageService.store(IS_CANDIDATE_KEY, isCandidate, -1 /* APPLICATION */, 0 /* USER */);
    if (!isCandidate) {
      storageService.store(SKIP_VERSION_KEY, productService.version, -1 /* APPLICATION */, 0 /* USER */);
      return;
    }
    notificationService.prompt(
      Severity2.Info,
      localize(19415, null),
      [{
        label: localize(19416, null),
        run: () => {
          openerService.open(URI.parse(`${productService.npsSurveyUrl}?o=${encodeURIComponent(platform2)}&v=${encodeURIComponent(productService.version)}&m=${encodeURIComponent(telemetryService.machineId)}`));
          storageService.store(IS_CANDIDATE_KEY, false, -1 /* APPLICATION */, 0 /* USER */);
          storageService.store(SKIP_VERSION_KEY, productService.version, -1 /* APPLICATION */, 0 /* USER */);
        }
      }, {
        label: localize(19414, null),
        run: () => storageService.store(SESSION_COUNT_KEY, sessionCount - 3, -1 /* APPLICATION */, 0 /* USER */)
      }, {
        label: localize(19413, null),
        run: () => {
          storageService.store(IS_CANDIDATE_KEY, false, -1 /* APPLICATION */, 0 /* USER */);
          storageService.store(SKIP_VERSION_KEY, productService.version, -1 /* APPLICATION */, 0 /* USER */);
        }
      }],
      { priority: 3 /* URGENT */ }
    );
  }
};

NPSContribution = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IWorkbenchEnvironmentService)
], NPSContribution);

if (language === "en") {
  const workbenchRegistry14 = Registry.as(Extensions10.Workbench);
  workbenchRegistry14.registerWorkbenchContribution(NPSContribution, 3 /* Restored */);
}
export { PROBABILITY, SESSION_COUNT_KEY, LAST_SESSION_DATE_KEY, SKIP_VERSION_KEY, IS_CANDIDATE_KEY, NPSContribution };
