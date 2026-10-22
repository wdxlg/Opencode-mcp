// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/customizationHarnessService.ts
import { CustomizationHarnessServiceBase } from "./module-1032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0987.mjs";


// src/vs/sessions/contrib/chat/browser/customizationHarnessService.ts
var SessionsCustomizationHarnessService = class extends CustomizationHarnessServiceBase {
  constructor(promptsService) {
    super([], "", promptsService);
  }
  registerExternalHarness(descriptor) {
    const registration = super.registerExternalHarness(descriptor);
    if (!this.findHarnessById(this.activeHarness.get())) {
      this.setActiveSession(this.getSessionResourceForHarness(descriptor.id));
    }
    return registration;
  }
};

SessionsCustomizationHarnessService = __decorateClass([
  __decorateParam(0, IPromptsService)
], SessionsCustomizationHarnessService);
export { SessionsCustomizationHarnessService };
