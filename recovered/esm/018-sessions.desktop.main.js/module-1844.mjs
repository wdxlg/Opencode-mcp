// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookContextKeys.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { INTERACTIVE_WINDOW_EDITOR_ID, NOTEBOOK_EDITOR_ID, REPL_EDITOR_ID } from "./module-0911.mjs";


// src/vs/workbench/contrib/notebook/common/notebookContextKeys.ts
var HAS_OPENED_NOTEBOOK = new RawContextKey("userHasOpenedNotebook", false);

var KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED = new RawContextKey("notebookFindWidgetFocused", false);

var InteractiveWindowOpen = new RawContextKey("interactiveWindowOpen", false);

var MOST_RECENT_REPL_EDITOR = new RawContextKey("mostRecentReplEditor", void 0);

var NOTEBOOK_IS_ACTIVE_EDITOR = ContextKeyExpr.equals("activeEditor", NOTEBOOK_EDITOR_ID);

var INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR = ContextKeyExpr.equals("activeEditor", INTERACTIVE_WINDOW_EDITOR_ID);

var REPL_NOTEBOOK_IS_ACTIVE_EDITOR = ContextKeyExpr.equals("activeEditor", REPL_EDITOR_ID);

var NOTEBOOK_OR_COMPOSITE_IS_ACTIVE_EDITOR = ContextKeyExpr.or(NOTEBOOK_IS_ACTIVE_EDITOR, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, REPL_NOTEBOOK_IS_ACTIVE_EDITOR);

var IS_COMPOSITE_NOTEBOOK = new RawContextKey("isCompositeNotebook", false);

var NOTEBOOK_EDITOR_FOCUSED = new RawContextKey("notebookEditorFocused", false);

var NOTEBOOK_CELL_LIST_FOCUSED = new RawContextKey("notebookCellListFocused", false);

var NOTEBOOK_OUTPUT_FOCUSED = new RawContextKey("notebookOutputFocused", false);

var NOTEBOOK_OUTPUT_INPUT_FOCUSED = new RawContextKey("notebookOutputInputFocused", false);

var NOTEBOOK_EDITOR_EDITABLE = new RawContextKey("notebookEditable", true);

var NOTEBOOK_HAS_RUNNING_CELL = new RawContextKey("notebookHasRunningCell", false);

var NOTEBOOK_HAS_SOMETHING_RUNNING = new RawContextKey("notebookHasSomethingRunning", false);

var NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON = new RawContextKey("notebookUseConsolidatedOutputButton", false);

var NOTEBOOK_BREAKPOINT_MARGIN_ACTIVE = new RawContextKey("notebookBreakpointMargin", false);

var NOTEBOOK_CELL_TOOLBAR_LOCATION = new RawContextKey("notebookCellToolbarLocation", "left");

var NOTEBOOK_CURSOR_NAVIGATION_MODE = new RawContextKey("notebookCursorNavigationMode", false);

var NOTEBOOK_LAST_CELL_FAILED = new RawContextKey("notebookLastCellFailed", false);

var NOTEBOOK_VIEW_TYPE = new RawContextKey("notebookType", void 0);

var NOTEBOOK_CELL_TYPE = new RawContextKey("notebookCellType", void 0);

var NOTEBOOK_CELL_EDITABLE = new RawContextKey("notebookCellEditable", false);

var NOTEBOOK_CELL_FOCUSED = new RawContextKey("notebookCellFocused", false);

var NOTEBOOK_CELL_EDITOR_FOCUSED = new RawContextKey("notebookCellEditorFocused", false);

var NOTEBOOK_CELL_MARKDOWN_EDIT_MODE = new RawContextKey("notebookCellMarkdownEditMode", false);

var NOTEBOOK_CELL_LINE_NUMBERS = new RawContextKey("notebookCellLineNumbers", "inherit");

var NOTEBOOK_CELL_EXECUTION_STATE = new RawContextKey("notebookCellExecutionState", void 0);

var NOTEBOOK_CELL_EXECUTING = new RawContextKey("notebookCellExecuting", false);

var NOTEBOOK_CELL_HAS_OUTPUTS = new RawContextKey("notebookCellHasOutputs", false);

var NOTEBOOK_CELL_IS_FIRST_OUTPUT = new RawContextKey("notebookCellIsFirstOutput", false);

var NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS = new RawContextKey("hasHiddenOutputs", false);

var NOTEBOOK_CELL_OUTPUT_MIMETYPE = new RawContextKey("notebookCellOutputMimeType", void 0);

var NOTEBOOK_CELL_INPUT_COLLAPSED = new RawContextKey("notebookCellInputIsCollapsed", false);

var NOTEBOOK_CELL_OUTPUT_COLLAPSED = new RawContextKey("notebookCellOutputIsCollapsed", false);

var NOTEBOOK_CELL_RESOURCE = new RawContextKey("notebookCellResource", "");

var NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS = new RawContextKey("notebookCellHasErrorDiagnostics", false);

var NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT = new RawContextKey("notebookCellOutputMimeTypeListForChat", []);

var NOTEBOOK_KERNEL = new RawContextKey("notebookKernel", void 0);

var NOTEBOOK_KERNEL_COUNT = new RawContextKey("notebookKernelCount", 0);

var NOTEBOOK_KERNEL_SOURCE_COUNT = new RawContextKey("notebookKernelSourceCount", 0);

var NOTEBOOK_KERNEL_SELECTED = new RawContextKey("notebookKernelSelected", false);

var NOTEBOOK_INTERRUPTIBLE_KERNEL = new RawContextKey("notebookInterruptibleKernel", false);

var NOTEBOOK_MISSING_KERNEL_EXTENSION = new RawContextKey("notebookMissingKernelExtension", false);

var NOTEBOOK_HAS_OUTPUTS = new RawContextKey("notebookHasOutputs", false);

var KERNEL_HAS_VARIABLE_PROVIDER = new RawContextKey("kernelHasVariableProvider", false);
export { HAS_OPENED_NOTEBOOK, KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED, InteractiveWindowOpen, MOST_RECENT_REPL_EDITOR, NOTEBOOK_IS_ACTIVE_EDITOR, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, REPL_NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_OR_COMPOSITE_IS_ACTIVE_EDITOR, IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_OUTPUT_FOCUSED, NOTEBOOK_OUTPUT_INPUT_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_HAS_RUNNING_CELL, NOTEBOOK_HAS_SOMETHING_RUNNING, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON, NOTEBOOK_BREAKPOINT_MARGIN_ACTIVE, NOTEBOOK_CELL_TOOLBAR_LOCATION, NOTEBOOK_CURSOR_NAVIGATION_MODE, NOTEBOOK_LAST_CELL_FAILED, NOTEBOOK_VIEW_TYPE, NOTEBOOK_CELL_TYPE, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_LINE_NUMBERS, NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_EXECUTING, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_IS_FIRST_OUTPUT, NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS, NOTEBOOK_CELL_OUTPUT_MIMETYPE, NOTEBOOK_CELL_INPUT_COLLAPSED, NOTEBOOK_CELL_OUTPUT_COLLAPSED, NOTEBOOK_CELL_RESOURCE, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT, NOTEBOOK_KERNEL, NOTEBOOK_KERNEL_COUNT, NOTEBOOK_KERNEL_SOURCE_COUNT, NOTEBOOK_KERNEL_SELECTED, NOTEBOOK_INTERRUPTIBLE_KERNEL, NOTEBOOK_MISSING_KERNEL_EXTENSION, NOTEBOOK_HAS_OUTPUTS, KERNEL_HAS_VARIABLE_PROVIDER };
