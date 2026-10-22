// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/editTelemetryContribution.ts
import { Disposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { VSCodeWorkspace } from "./module-3700.mjs";
import { AnnotatedDocuments } from "./module-3685.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { EDIT_TELEMETRY_SETTING_ID } from "./module-3701.mjs";
import { autorun } from "./module-0052.mjs";
import { ITelemetryService, telemetryLevelEnabled } from "./module-0093.mjs";
import { EditTrackingFeature } from "./module-3698.mjs";
import { AI_STATS_SETTING_ID } from "./module-3702.mjs";
import { AiStatsFeature } from "./module-3705.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { AiContributionFeature } from "./module-3706.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/editTelemetryContribution.ts
var EditTelemetryContribution = class extends Disposable {
  constructor(instantiationService, configurationService, telemetryService, chatEntitlementService) {
    super();
    const workspace = derived((reader) => reader.store.add(instantiationService.createInstance(VSCodeWorkspace)));
    const annotatedDocuments = derived((reader) => reader.store.add(instantiationService.createInstance(AnnotatedDocuments, workspace.read(reader))));
    const editSourceTrackingEnabled = observableConfigValue(EDIT_TELEMETRY_SETTING_ID, true, configurationService);
    this._register(autorun((r2) => {
      const enabled = editSourceTrackingEnabled.read(r2);
      if (!enabled || !telemetryLevelEnabled(telemetryService, 3 /* USAGE */)) {
        return;
      }
      r2.store.add(instantiationService.createInstance(EditTrackingFeature, workspace.read(r2), annotatedDocuments.read(r2)));
    }));
    const aiStatsEnabled = observableConfigValue(AI_STATS_SETTING_ID, true, configurationService);
    this._register(autorun((r2) => {
      const enabled = aiStatsEnabled.read(r2);
      const aiDisabled = chatEntitlementService.sentimentObs.read(r2).hidden;
      if (!enabled || aiDisabled) {
        return;
      }
      r2.store.add(instantiationService.createInstance(AiStatsFeature, annotatedDocuments.read(r2)));
    }));
    this._register(CommandsRegistry.registerCommand("_aiEdits.hasAiContributions", () => false));
    this._register(CommandsRegistry.registerCommand("_aiEdits.clearAiContributions", () => {
    }));
    this._register(CommandsRegistry.registerCommand("_aiEdits.clearAllAiContributions", () => {
    }));
    const addAICoAuthor = observableConfigValue("git.addAICoAuthor", "off", configurationService);
    this._register(autorun((r2) => {
      if (addAICoAuthor.read(r2) === "off") {
        return;
      }
      const aiDisabled = chatEntitlementService.sentimentObs.read(r2).hidden;
      if (aiDisabled) {
        return;
      }
      r2.store.add(instantiationService.createInstance(AiContributionFeature, annotatedDocuments.read(r2)));
    }));
  }
};

EditTelemetryContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IChatEntitlementService)
], EditTelemetryContribution);
export { EditTelemetryContribution };
