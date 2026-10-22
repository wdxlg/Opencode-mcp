// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/browser/localHistory.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { LocalHistoryTimeline } from "./module-3646.mjs";


// src/vs/workbench/contrib/localHistory/browser/localHistory.contribution.ts
registerWorkbenchContribution2(
  LocalHistoryTimeline.ID,
  LocalHistoryTimeline,
  WorkbenchPhase.BlockRestore
  /* registrations only */
);
export {};
