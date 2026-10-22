// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchContributions.ts
import { registerSingleton } from "./module-0135.mjs";
import { INotebookSearchService } from "./module-3110.mjs";
import { NotebookSearchService } from "./module-3125.mjs";


// src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchContributions.ts
function registerContributions3() {
  registerSingleton(INotebookSearchService, NotebookSearchService, 1 /* Delayed */);
}
export { registerContributions3 };
