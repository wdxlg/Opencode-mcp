// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeViews/common/viewsWelcome.contribution.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { viewsWelcomeExtensionPointDescriptor } from "./module-3571.mjs";
import { ViewsWelcomeContribution } from "./module-3572.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/welcomeViews/common/viewsWelcome.contribution.ts
var extensionPoint3 = ExtensionsRegistry.registerExtensionPoint(viewsWelcomeExtensionPointDescriptor);

var WorkbenchConfigurationContribution = class {
  constructor(instantiationService) {
    instantiationService.createInstance(ViewsWelcomeContribution, extensionPoint3);
  }
};

WorkbenchConfigurationContribution = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WorkbenchConfigurationContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(WorkbenchConfigurationContribution, 3 /* Restored */);
export { extensionPoint3, WorkbenchConfigurationContribution };
