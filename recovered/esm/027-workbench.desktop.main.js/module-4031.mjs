// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/electron-browser/performance.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { RendererProfiling } from "./module-4030.mjs";
import { StartupProfiler } from "./module-4027.mjs";
import { NativeStartupTimings } from "./module-4029.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { applicationConfigurationNodeBase } from "./module-1112.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/performance/electron-browser/performance.contribution.ts
Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  RendererProfiling,
  4 /* Eventually */
);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  StartupProfiler,
  3 /* Restored */
);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  NativeStartupTimings,
  4 /* Eventually */
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...applicationConfigurationNodeBase,
  "properties": {
    "application.experimental.rendererProfiling": {
      type: "boolean",
      default: false,
      tags: ["experimental"],
      markdownDescription: localize(18051, null),
      experiment: {
        mode: "startup"
      }
    }
  }
});
export {};
