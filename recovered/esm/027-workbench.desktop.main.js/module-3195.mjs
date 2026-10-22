// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debug.service.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IDebugService } from "./module-1057.mjs";
import { DebugService } from "./module-3194.mjs";
import { DebugVisualizerService, IDebugVisualizerService } from "./module-1065.mjs";


// src/vs/workbench/contrib/debug/browser/debug.service.contribution.ts
registerSingleton(IDebugService, DebugService, 1 /* Delayed */);

registerSingleton(IDebugVisualizerService, DebugVisualizerService, 1 /* Delayed */);
export {};
