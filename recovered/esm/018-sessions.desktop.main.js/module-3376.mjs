// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/browser/localHistory.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { LocalHistoryTimeline } from "./module-3375.mjs";


// src/vs/workbench/contrib/localHistory/browser/localHistory.contribution.ts
registerWorkbenchContribution2(
  LocalHistoryTimeline.ID,
  LocalHistoryTimeline,
  WorkbenchPhase.BlockRestore
  /* registrations only */
);
export {};
