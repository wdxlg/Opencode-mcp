// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/planAgentDefaultModel.ts
import { DefaultModelContribution, createDefaultModelArrays } from "./module-2768.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/planAgentDefaultModel.ts
var arrays2 = createDefaultModelArrays();

var PlanAgentDefaultModel = class extends DefaultModelContribution {
  static {
    this.ID = "workbench.contrib.planAgentDefaultModel";
  }
  static {
    this.modelIds = arrays2.modelIds;
  }
  static {
    this.modelLabels = arrays2.modelLabels;
  }
  static {
    this.modelDescriptions = arrays2.modelDescriptions;
  }
  constructor(languageModelsService, logService) {
    super(arrays2, {
      configKey: "chat.planAgent.defaultModel" /* PlanAgentDefaultModel */,
      configSectionId: "chatSidebar",
      logPrefix: "[PlanAgentDefaultModel]",
      filter: (metadata) => !!metadata.capabilities?.toolCalling
    }, languageModelsService, logService);
  }
};

PlanAgentDefaultModel = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILogService)
], PlanAgentDefaultModel);

registerWorkbenchContribution2(PlanAgentDefaultModel.ID, PlanAgentDefaultModel, WorkbenchPhase.AfterRestored);
export { arrays2, PlanAgentDefaultModel };
