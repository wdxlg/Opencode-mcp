// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/dropOrPasteInto/browser/dropOrPasteInto.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { DropOrPasteIntoCommands } from "./module-3680.mjs";
import { DropOrPasteSchemaContribution, editorConfiguration3 } from "./module-3681.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/dropOrPasteInto/browser/dropOrPasteInto.contribution.ts
registerWorkbenchContribution2(DropOrPasteIntoCommands.ID, DropOrPasteIntoCommands, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(DropOrPasteSchemaContribution.ID, DropOrPasteSchemaContribution, WorkbenchPhase.Eventually);

Registry.as(Extensions4.Configuration).registerConfiguration(editorConfiguration3);
export {};
