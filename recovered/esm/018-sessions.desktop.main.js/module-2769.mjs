// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/exploreAgentDefaultModel.ts
import { DefaultModelContribution, createDefaultModelArrays } from "./module-2768.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/exploreAgentDefaultModel.ts
var arrays = createDefaultModelArrays();

var ExploreAgentDefaultModel = class extends DefaultModelContribution {
  static {
    this.ID = "workbench.contrib.exploreAgentDefaultModel";
  }
  static {
    this.modelIds = arrays.modelIds;
  }
  static {
    this.modelLabels = arrays.modelLabels;
  }
  static {
    this.modelDescriptions = arrays.modelDescriptions;
  }
  constructor(languageModelsService, logService) {
    super(arrays, {
      configKey: "chat.exploreAgent.defaultModel" /* ExploreAgentDefaultModel */,
      configSectionId: "chatSidebar",
      logPrefix: "[ExploreAgentDefaultModel]",
      filter: (metadata) => !!metadata.capabilities?.toolCalling
    }, languageModelsService, logService);
  }
};

ExploreAgentDefaultModel = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILogService)
], ExploreAgentDefaultModel);

registerWorkbenchContribution2(ExploreAgentDefaultModel.ID, ExploreAgentDefaultModel, WorkbenchPhase.AfterRestored);
export { arrays, ExploreAgentDefaultModel };
