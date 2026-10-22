// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchContributions.ts
import { registerSingleton } from "./module-0135.mjs";
import { INotebookSearchService } from "./module-2939.mjs";
import { NotebookSearchService } from "./module-2947.mjs";


// src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchContributions.ts
function registerContributions2() {
  registerSingleton(INotebookSearchService, NotebookSearchService, 1 /* Delayed */);
}
export { registerContributions2 };
