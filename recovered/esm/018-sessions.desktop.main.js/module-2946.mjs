// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/replaceContributions.ts
import { registerSingleton } from "./module-0135.mjs";
import { IReplaceService } from "./module-2814.mjs";
import { ReplacePreviewContentProvider, ReplaceService } from "./module-2945.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/search/browser/replaceContributions.ts
function registerContributions() {
  registerSingleton(IReplaceService, ReplaceService, 1 /* Delayed */);
  registerWorkbenchContribution2(
    ReplacePreviewContentProvider.ID,
    ReplacePreviewContentProvider,
    WorkbenchPhase.BlockStartup
    /* registration only */
  );
}
export { registerContributions };
