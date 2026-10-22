// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/languageStatus/browser/languageStatus.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { LanguageStatusContribution, ResetAction } from "./module-3603.mjs";
import { registerAction2 } from "./module-0092.mjs";


// src/vs/workbench/contrib/languageStatus/browser/languageStatus.contribution.ts
registerWorkbenchContribution2(LanguageStatusContribution.Id, LanguageStatusContribution, WorkbenchPhase.AfterRestored);

registerAction2(ResetAction);
export {};
