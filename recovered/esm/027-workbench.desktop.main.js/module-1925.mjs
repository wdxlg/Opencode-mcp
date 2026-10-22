// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll.ts
import { clamp } from "./module-0040.mjs";
import { combinedDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll.ts
function registerCellToolbarStickyScroll(notebookEditor, cell, element, opts) {
  const extraOffset = opts?.extraOffset ?? 0;
  const min = opts?.min ?? 0;
  const updateForScroll = () => {
    if (notebookEditor.getCellByHandle(cell.handle) !== cell) {
      return;
    }
    if (cell.isInputCollapsed) {
      element.style.top = "";
    } else {
      const scrollTop = notebookEditor.scrollTop;
      const elementTop = notebookEditor.getAbsoluteTopOfElement(cell);
      const diff4 = scrollTop - elementTop + extraOffset;
      const maxTop = cell.layoutInfo.editorHeight + cell.layoutInfo.statusBarHeight - 45;
      const top2 = maxTop > 20 ? (
        // Don't move the run button if it can only move a very short distance
        clamp(min, diff4, maxTop)
      ) : min;
      element.style.top = `${top2}px`;
    }
  };
  updateForScroll();
  const disposables = [];
  disposables.push(
    notebookEditor.onDidScroll(() => updateForScroll()),
    notebookEditor.onDidChangeLayout(() => updateForScroll())
  );
  return combinedDisposable(...disposables);
}
export { registerCellToolbarStickyScroll };
