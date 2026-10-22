// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeActions/browser/codeActions.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { CodeActionsContribution, editorConfiguration2, notebookEditorConfiguration } from "./module-3636.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/codeActions/browser/codeActions.contribution.ts
Registry.as(Extensions4.Configuration).registerConfiguration(editorConfiguration2);

Registry.as(Extensions4.Configuration).registerConfiguration(notebookEditorConfiguration);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(CodeActionsContribution, 4 /* Eventually */);
export {};
