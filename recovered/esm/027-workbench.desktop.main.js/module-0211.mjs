// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/services/contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { EditorWorkerService } from "./module-0208.mjs";
import { registerEditorContribution } from "./module-0097.mjs";
import { MarkerDecorationsContribution } from "./module-0210.mjs";


// src/vs/editor/browser/services/contribution.ts
registerSingleton(IEditorWorkerService, EditorWorkerService, 0 /* Eager */);

registerEditorContribution(MarkerDecorationsContribution.ID, MarkerDecorationsContribution, 0 /* Eager */);
export {};
