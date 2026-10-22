// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/utilityModelContribution.ts
import { localize } from "./module-0001.mjs";
import { DefaultModelContribution, createDefaultModelArrays } from "./module-2793.mjs";
import { COPILOT_VENDOR_ID, ILanguageModelsService } from "./module-0967.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/chat/browser/utilityModelContribution.ts
var defaultEntryLabel = localize(11766, null);

var defaultEntryDescription = localize(11765, null);

var utilityArrays = createDefaultModelArrays(defaultEntryLabel, defaultEntryDescription);

var utilitySmallArrays = createDefaultModelArrays(defaultEntryLabel, defaultEntryDescription);

var UtilityModelContribution = class extends DefaultModelContribution {
  static {
    this.ID = "workbench.contrib.utilityModel";
  }
  static {
    this.modelIds = utilityArrays.modelIds;
  }
  static {
    this.modelLabels = utilityArrays.modelLabels;
  }
  static {
    this.modelDescriptions = utilityArrays.modelDescriptions;
  }
  constructor(languageModelsService, logService) {
    super(utilityArrays, {
      configKey: "chat.utilityModel" /* UtilityModel */,
      configSectionId: "chatSidebar",
      logPrefix: "[UtilityModel]",
      filter: (metadata) => metadata.vendor !== COPILOT_VENDOR_ID,
      storageFormat: "vendorAndId",
      defaultEntryLabel,
      defaultEntryDescription
    }, languageModelsService, logService);
  }
};

UtilityModelContribution = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILogService)
], UtilityModelContribution);

var UtilitySmallModelContribution = class extends DefaultModelContribution {
  static {
    this.ID = "workbench.contrib.utilitySmallModel";
  }
  static {
    this.modelIds = utilitySmallArrays.modelIds;
  }
  static {
    this.modelLabels = utilitySmallArrays.modelLabels;
  }
  static {
    this.modelDescriptions = utilitySmallArrays.modelDescriptions;
  }
  constructor(languageModelsService, logService) {
    super(utilitySmallArrays, {
      configKey: "chat.utilitySmallModel" /* UtilitySmallModel */,
      configSectionId: "chatSidebar",
      logPrefix: "[UtilitySmallModel]",
      filter: (metadata) => metadata.vendor !== COPILOT_VENDOR_ID,
      storageFormat: "vendorAndId",
      defaultEntryLabel,
      defaultEntryDescription
    }, languageModelsService, logService);
  }
};

UtilitySmallModelContribution = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILogService)
], UtilitySmallModelContribution);

registerWorkbenchContribution2(UtilityModelContribution.ID, UtilityModelContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(UtilitySmallModelContribution.ID, UtilitySmallModelContribution, WorkbenchPhase.AfterRestored);
export { defaultEntryLabel, defaultEntryDescription, utilityArrays, utilitySmallArrays, UtilityModelContribution, UtilitySmallModelContribution };
