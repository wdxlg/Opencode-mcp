// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/customizationHarnessService.ts
import { CustomizationHarnessServiceBase, ICustomizationHarnessService, createVSCodeHarnessDescriptor } from "./module-1031.mjs";
import { SessionType } from "./module-0960.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/customizationHarnessService.ts
var CustomizationHarnessService = class extends CustomizationHarnessServiceBase {
  constructor(promptsService) {
    super(
      [createVSCodeHarnessDescriptor()],
      SessionType.Local,
      promptsService
    );
  }
  getSessionResourceForHarness(sessionType) {
    return super.getSessionResourceForHarness(sessionType);
  }
};

CustomizationHarnessService = __decorateClass([
  __decorateParam(0, IPromptsService)
], CustomizationHarnessService);

registerSingleton(ICustomizationHarnessService, CustomizationHarnessService, 1 /* Delayed */);
export { CustomizationHarnessService };
