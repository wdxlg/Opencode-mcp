// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser.ts
var DIFF_CELL_MARGIN = 16;

var NOTEBOOK_DIFF_CELL_INPUT = new RawContextKey("notebook.diffEditor.cell.inputChanged", false);

var NOTEBOOK_DIFF_METADATA = new RawContextKey("notebook.diffEditor.metadataChanged", false);

var NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY = "notebook.diffEditor.cell.ignoreWhitespace";

var NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE = new RawContextKey(NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY, false);

var NOTEBOOK_DIFF_CELL_PROPERTY = new RawContextKey("notebook.diffEditor.cell.property.changed", false);

var NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED = new RawContextKey("notebook.diffEditor.cell.property.expanded", false);

var NOTEBOOK_DIFF_CELLS_COLLAPSED = new RawContextKey("notebook.diffEditor.allCollapsed", void 0, localize(17668, null));

var NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS = new RawContextKey("notebook.diffEditor.hasUnchangedCells", void 0, localize(17669, null));

var NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN = new RawContextKey("notebook.diffEditor.unchangedCellsAreHidden", void 0, localize(17672, null));

var NOTEBOOK_DIFF_ITEM_KIND = new RawContextKey("notebook.diffEditor.item.kind", void 0, localize(17670, null));

var NOTEBOOK_DIFF_ITEM_DIFF_STATE = new RawContextKey("notebook.diffEditor.item.state", void 0, localize(17671, null));
export { DIFF_CELL_MARGIN, NOTEBOOK_DIFF_CELL_INPUT, NOTEBOOK_DIFF_METADATA, NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY, NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE, NOTEBOOK_DIFF_CELL_PROPERTY, NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED, NOTEBOOK_DIFF_CELLS_COLLAPSED, NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS, NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN, NOTEBOOK_DIFF_ITEM_KIND, NOTEBOOK_DIFF_ITEM_DIFF_STATE };
