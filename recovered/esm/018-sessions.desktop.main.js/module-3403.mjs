// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scrollLocking/browser/scrollLocking.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { SyncScroll } from "./module-3402.mjs";


// src/vs/workbench/contrib/scrollLocking/browser/scrollLocking.contribution.ts
registerWorkbenchContribution2(
  SyncScroll.ID,
  SyncScroll,
  WorkbenchPhase.Eventually
  // registration only
);
export {};
