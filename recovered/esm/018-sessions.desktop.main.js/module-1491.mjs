// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/extensionHost.contribution.ts
import { JSONValidationExtensionPoint } from "./module-0880.mjs";
import { ColorExtensionPoint } from "./module-0881.mjs";
import { IconExtensionPoint } from "./module-0882.mjs";
import { TokenClassificationExtensionPoints } from "./module-0884.mjs";
import { LanguageConfigurationFileHandler } from "./module-0894.mjs";
import { StatusBarItemsExtensionPoint } from "./module-0914.mjs";
import { CSSExtensionPoint } from "./module-0918.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/api/browser/extensionHost.contribution.ts
var ExtensionPoints = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.instantiationService.createInstance(JSONValidationExtensionPoint);
    this.instantiationService.createInstance(ColorExtensionPoint);
    this.instantiationService.createInstance(IconExtensionPoint);
    this.instantiationService.createInstance(TokenClassificationExtensionPoints);
    this.instantiationService.createInstance(LanguageConfigurationFileHandler);
    this.instantiationService.createInstance(StatusBarItemsExtensionPoint);
    this.instantiationService.createInstance(CSSExtensionPoint);
  }
  static {
    this.ID = "workbench.contrib.extensionPoints";
  }
};

ExtensionPoints = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ExtensionPoints);

registerWorkbenchContribution2(ExtensionPoints.ID, ExtensionPoints, WorkbenchPhase.BlockStartup);
export { ExtensionPoints };
