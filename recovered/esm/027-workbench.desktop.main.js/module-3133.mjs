// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/sash/browser/sash.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { SashSettingsController } from "./module-3132.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { isIOS } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/sash/browser/sash.contribution.ts
registerWorkbenchContribution2(SashSettingsController.ID, SashSettingsController, WorkbenchPhase.AfterRestored);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.sash.size": {
      type: "number",
      default: isIOS ? 20 : 4,
      minimum: 1,
      maximum: 20,
      description: localize(18715, null)
    },
    "workbench.sash.hoverDelay": {
      type: "number",
      default: 300,
      minimum: 0,
      maximum: 2e3,
      description: localize(18714, null)
    }
  }
});
export {};
