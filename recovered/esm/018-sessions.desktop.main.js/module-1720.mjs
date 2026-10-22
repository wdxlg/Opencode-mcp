// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/treeSitter/browser/treeSitter.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITreeSitterLibraryService } from "./module-0417.mjs";
import { TreeSitterLibraryService } from "./module-1718.mjs";
import { ITreeSitterThemeService } from "./module-0415.mjs";
import { TreeSitterThemeService } from "./module-1719.mjs";


// src/vs/workbench/services/treeSitter/browser/treeSitter.contribution.ts
registerSingleton(ITreeSitterLibraryService, TreeSitterLibraryService, 0 /* Eager */);

registerSingleton(ITreeSitterThemeService, TreeSitterThemeService, 0 /* Eager */);
export {};
