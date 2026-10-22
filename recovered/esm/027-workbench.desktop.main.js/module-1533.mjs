// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/editorOptions.ts
import { isTextEditorViewState } from "./module-0925.mjs";


// src/vs/workbench/common/editor/editorOptions.ts
function applyTextEditorOptions(options3, editor, scrollType) {
  let applied = false;
  const viewState = massageEditorViewState(options3);
  if (isTextEditorViewState(viewState)) {
    editor.restoreViewState(viewState);
    applied = true;
  }
  if (options3.selection) {
    const range2 = {
      startLineNumber: options3.selection.startLineNumber,
      startColumn: options3.selection.startColumn,
      endLineNumber: options3.selection.endLineNumber ?? options3.selection.startLineNumber,
      endColumn: options3.selection.endColumn ?? options3.selection.startColumn
    };
    editor.setSelection(range2, options3.selectionSource ?? "code.navigation" /* NAVIGATION */);
    if (options3.selectionRevealType === 2 /* NearTop */) {
      editor.revealRangeNearTop(range2, scrollType);
    } else if (options3.selectionRevealType === 3 /* NearTopIfOutsideViewport */) {
      editor.revealRangeNearTopIfOutsideViewport(range2, scrollType);
    } else if (options3.selectionRevealType === 1 /* CenterIfOutsideViewport */) {
      editor.revealRangeInCenterIfOutsideViewport(range2, scrollType);
    } else {
      editor.revealRangeInCenter(range2, scrollType);
    }
    applied = true;
  }
  return applied;
}

function massageEditorViewState(options3) {
  if (!options3.selection || !options3.viewState) {
    return options3.viewState;
  }
  const candidateDiffViewState = options3.viewState;
  if (candidateDiffViewState.modified) {
    candidateDiffViewState.modified.cursorState = [];
    return candidateDiffViewState;
  }
  const candidateEditorViewState = options3.viewState;
  if (candidateEditorViewState.cursorState) {
    candidateEditorViewState.cursorState = [];
  }
  return candidateEditorViewState;
}
export { applyTextEditorOptions, massageEditorViewState };
