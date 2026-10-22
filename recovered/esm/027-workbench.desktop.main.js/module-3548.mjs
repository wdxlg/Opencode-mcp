// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/surveys/browser/languageSurveys.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceWorker } from "./module-0036.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { platform2 } from "./module-0015.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { language } from "./module-0014.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/surveys/browser/languageSurveys.contribution.ts
var LanguageSurvey = class extends Disposable {
  constructor(data, storageService, notificationService, telemetryService, languageService, textFileService, openerService, productService) {
    super();
    const SESSION_COUNT_KEY2 = `${data.surveyId}.sessionCount`;
    const LAST_SESSION_DATE_KEY2 = `${data.surveyId}.lastSessionDate`;
    const SKIP_VERSION_KEY2 = `${data.surveyId}.skipVersion`;
    const IS_CANDIDATE_KEY2 = `${data.surveyId}.isCandidate`;
    const EDITED_LANGUAGE_COUNT_KEY = `${data.surveyId}.editedCount`;
    const EDITED_LANGUAGE_DATE_KEY = `${data.surveyId}.editedDate`;
    const skipVersion = storageService.get(SKIP_VERSION_KEY2, -1 /* APPLICATION */, "");
    if (skipVersion) {
      return;
    }
    const date = (/* @__PURE__ */ new Date()).toDateString();
    if (storageService.getNumber(EDITED_LANGUAGE_COUNT_KEY, -1 /* APPLICATION */, 0) < data.editCount) {
      const onModelsSavedWorker = this._register(new RunOnceWorker((models) => {
        models.forEach((m) => {
          if (m.getLanguageId() === data.languageId && date !== storageService.get(EDITED_LANGUAGE_DATE_KEY, -1 /* APPLICATION */)) {
            const editedCount = storageService.getNumber(EDITED_LANGUAGE_COUNT_KEY, -1 /* APPLICATION */, 0) + 1;
            storageService.store(EDITED_LANGUAGE_COUNT_KEY, editedCount, -1 /* APPLICATION */, 0 /* USER */);
            storageService.store(EDITED_LANGUAGE_DATE_KEY, date, -1 /* APPLICATION */, 0 /* USER */);
          }
        });
      }, 250));
      this._register(textFileService.files.onDidSave((e) => onModelsSavedWorker.work(e.model)));
    }
    const lastSessionDate = storageService.get(LAST_SESSION_DATE_KEY2, -1 /* APPLICATION */, (/* @__PURE__ */ new Date(0)).toDateString());
    if (date === lastSessionDate) {
      return;
    }
    const sessionCount = storageService.getNumber(SESSION_COUNT_KEY2, -1 /* APPLICATION */, 0) + 1;
    storageService.store(LAST_SESSION_DATE_KEY2, date, -1 /* APPLICATION */, 0 /* USER */);
    storageService.store(SESSION_COUNT_KEY2, sessionCount, -1 /* APPLICATION */, 0 /* USER */);
    if (sessionCount < 9) {
      return;
    }
    if (storageService.getNumber(EDITED_LANGUAGE_COUNT_KEY, -1 /* APPLICATION */, 0) < data.editCount) {
      return;
    }
    const isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY2, -1 /* APPLICATION */, false) || Math.random() < data.userProbability;
    storageService.store(IS_CANDIDATE_KEY2, isCandidate, -1 /* APPLICATION */, 0 /* USER */);
    if (!isCandidate) {
      storageService.store(SKIP_VERSION_KEY2, productService.version, -1 /* APPLICATION */, 0 /* USER */);
      return;
    }
    notificationService.prompt(
      Severity2.Info,
      localize(19409, null, languageService.getLanguageName(data.languageId) ?? data.languageId),
      [{
        label: localize(19412, null),
        run: () => {
          telemetryService.publicLog(`${data.surveyId}.survey/takeShortSurvey`);
          openerService.open(URI.parse(`${data.surveyUrl}?o=${encodeURIComponent(platform2)}&v=${encodeURIComponent(productService.version)}&m=${encodeURIComponent(telemetryService.machineId)}`));
          storageService.store(IS_CANDIDATE_KEY2, false, -1 /* APPLICATION */, 0 /* USER */);
          storageService.store(SKIP_VERSION_KEY2, productService.version, -1 /* APPLICATION */, 0 /* USER */);
        }
      }, {
        label: localize(19411, null),
        run: () => {
          telemetryService.publicLog(`${data.surveyId}.survey/remindMeLater`);
          storageService.store(SESSION_COUNT_KEY2, sessionCount - 3, -1 /* APPLICATION */, 0 /* USER */);
        }
      }, {
        label: localize(19410, null),
        isSecondary: true,
        run: () => {
          telemetryService.publicLog(`${data.surveyId}.survey/dontShowAgain`);
          storageService.store(IS_CANDIDATE_KEY2, false, -1 /* APPLICATION */, 0 /* USER */);
          storageService.store(SKIP_VERSION_KEY2, productService.version, -1 /* APPLICATION */, 0 /* USER */);
        }
      }],
      { priority: 1 /* OPTIONAL */ }
    );
  }
};

var LanguageSurveysContribution = class {
  constructor(storageService, notificationService, telemetryService, textFileService, openerService, productService, languageService, extensionService) {
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.textFileService = textFileService;
    this.openerService = openerService;
    this.productService = productService;
    this.languageService = languageService;
    this.extensionService = extensionService;
    this.handleSurveys();
  }
  async handleSurveys() {
    if (!this.productService.surveys) {
      return;
    }
    await this.extensionService.whenInstalledExtensionsRegistered();
    this.productService.surveys.filter((surveyData) => surveyData.surveyId && surveyData.editCount && surveyData.languageId && surveyData.surveyUrl && surveyData.userProbability).map((surveyData) => new LanguageSurvey(surveyData, this.storageService, this.notificationService, this.telemetryService, this.languageService, this.textFileService, this.openerService, this.productService));
  }
};

LanguageSurveysContribution = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ITextFileService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IProductService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IExtensionService)
], LanguageSurveysContribution);

if (language === "en") {
  const workbenchRegistry14 = Registry.as(Extensions10.Workbench);
  workbenchRegistry14.registerWorkbenchContribution(LanguageSurveysContribution, 3 /* Restored */);
}
export { LanguageSurvey, LanguageSurveysContribution };
