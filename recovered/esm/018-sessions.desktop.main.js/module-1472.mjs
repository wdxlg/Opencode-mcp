// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/languageModelStats.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Extensions11, IExtensionFeaturesManagementService } from "./module-0879.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Registry } from "./module-0090.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/common/languageModelStats.ts
var ILanguageModelStatsService = createDecorator("ILanguageModelStatsService");

var LanguageModelStatsService = class extends Disposable {
  constructor(extensionFeaturesManagementService, storageService) {
    super();
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    for (const key3 in storageService.keys(-1 /* APPLICATION */, 0 /* USER */)) {
      if (key3.startsWith("languageModelStats.") || key3.startsWith("languageModelAccess.")) {
        storageService.remove(key3, -1 /* APPLICATION */);
      }
    }
  }
  async update(model, extensionId, agent, tokenCount) {
    await this.extensionFeaturesManagementService.getAccess(extensionId, CopilotUsageExtensionFeatureId);
  }
};

LanguageModelStatsService = __decorateClass([
  __decorateParam(0, IExtensionFeaturesManagementService),
  __decorateParam(1, IStorageService)
], LanguageModelStatsService);

var CopilotUsageExtensionFeatureId = "copilot";

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: CopilotUsageExtensionFeatureId,
  label: localize(12983, null),
  description: localize(12984, null),
  icon: Codicon.copilot,
  access: {
    canToggle: false
  },
  accessDataLabel: localize(12982, null)
});
export { ILanguageModelStatsService, LanguageModelStatsService, CopilotUsageExtensionFeatureId };
