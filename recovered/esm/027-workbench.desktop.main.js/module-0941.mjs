// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookBrowser.ts
import { NOTEBOOK_DIFF_EDITOR_ID, NOTEBOOK_EDITOR_ID } from "./module-0909.mjs";
import { isCompositeNotebookEditorInput } from "./module-0939.mjs";
import { cellRangesToIndexes, reduceCellRanges } from "./module-0940.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookBrowser.ts
var EXPAND_CELL_INPUT_COMMAND_ID = "notebook.cell.expandCellInput";

var EXECUTE_CELL_COMMAND_ID = "notebook.cell.execute";

var DETECT_CELL_LANGUAGE = "notebook.cell.detectLanguage";

var CHANGE_CELL_LANGUAGE = "notebook.cell.changeLanguage";

var QUIT_EDIT_CELL_COMMAND_ID = "notebook.cell.quitEdit";

var EXPAND_CELL_OUTPUT_COMMAND_ID = "notebook.cell.expandCellOutput";

var IPYNB_VIEW_TYPE = "jupyter-notebook";

var JUPYTER_EXTENSION_ID = "ms-toolsai.jupyter";

var KERNEL_EXTENSIONS = /* @__PURE__ */ new Map([
  [IPYNB_VIEW_TYPE, JUPYTER_EXTENSION_ID]
]);

var KERNEL_RECOMMENDATIONS = /* @__PURE__ */ new Map();

KERNEL_RECOMMENDATIONS.set(IPYNB_VIEW_TYPE, /* @__PURE__ */ new Map());

KERNEL_RECOMMENDATIONS.get(IPYNB_VIEW_TYPE)?.set("python", {
  extensionIds: [
    "ms-python.python",
    JUPYTER_EXTENSION_ID
  ],
  displayName: "Python + Jupyter"
});

function isNotebookCellDecoration(obj) {
  return !!obj && typeof obj.handle === "number";
}

function getNotebookEditorFromEditorPane(editorPane) {
  if (!editorPane) {
    return;
  }
  if (editorPane.getId() === NOTEBOOK_EDITOR_ID) {
    return editorPane.getControl();
  }
  if (editorPane.getId() === NOTEBOOK_DIFF_EDITOR_ID) {
    return editorPane.getControl().inlineNotebookEditor;
  }
  const input = editorPane.input;
  const isCompositeNotebook = input && isCompositeNotebookEditorInput(input);
  if (isCompositeNotebook) {
    return editorPane.getControl()?.notebookEditor;
  }
  return void 0;
}

function expandCellRangesWithHiddenCells(editor, ranges) {
  const indexes = cellRangesToIndexes(ranges);
  const modelRanges = [];
  indexes.forEach((index2) => {
    const viewCell = editor.cellAt(index2);
    if (!viewCell) {
      return;
    }
    const viewIndex = editor.getViewIndexByModelIndex(index2);
    if (viewIndex < 0) {
      return;
    }
    const nextViewIndex = viewIndex + 1;
    const range2 = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
    if (range2) {
      modelRanges.push(range2);
    }
  });
  return reduceCellRanges(modelRanges);
}

function cellRangeToViewCells(editor, ranges) {
  const cells = [];
  reduceCellRanges(ranges).forEach((range2) => {
    cells.push(...editor.getCellsInRange(range2));
  });
  return cells;
}
export { isNotebookCellDecoration, getNotebookEditorFromEditorPane, expandCellRangesWithHiddenCells, cellRangeToViewCells, EXPAND_CELL_INPUT_COMMAND_ID, EXECUTE_CELL_COMMAND_ID, DETECT_CELL_LANGUAGE, CHANGE_CELL_LANGUAGE, QUIT_EDIT_CELL_COMMAND_ID, EXPAND_CELL_OUTPUT_COMMAND_ID, IPYNB_VIEW_TYPE, JUPYTER_EXTENSION_ID, KERNEL_EXTENSIONS, KERNEL_RECOMMENDATIONS };
