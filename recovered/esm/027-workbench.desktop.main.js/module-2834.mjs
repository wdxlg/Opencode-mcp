// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchModelBase.ts
import { isSearchTreeFileMatch } from "./module-2545.mjs";


// src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchModelBase.ts
function isNotebookFileMatch(obj) {
  return obj && typeof obj.bindNotebookEditorWidget === "function" && typeof obj.updateMatchesForEditorWidget === "function" && typeof obj.unbindNotebookEditorWidget === "function" && typeof obj.updateNotebookHighlights === "function" && isSearchTreeFileMatch(obj);
}

function isIMatchInNotebook(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.parent === "function" && typeof obj.cellParent === "object" && typeof obj.isWebviewMatch === "function" && typeof obj.cellIndex === "number" && (typeof obj.webviewIndex === "number" || obj.webviewIndex === void 0) && (typeof obj.cell === "object" || obj.cell === void 0);
}
export { isNotebookFileMatch, isIMatchInNotebook };
