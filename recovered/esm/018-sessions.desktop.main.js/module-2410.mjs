// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/navigation/arrow.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_TYPE, NOTEBOOK_CURSOR_NAVIGATION_MODE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_OR_COMPOSITE_IS_ACTIVE_EDITOR, NOTEBOOK_OUTPUT_FOCUSED, NOTEBOOK_OUTPUT_INPUT_FOCUSED } from "./module-1844.mjs";
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, NotebookAction, NotebookCellAction, findTargetCellEditor } from "./module-1845.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { InputFocusedContextKey, IsWindowsContext } from "./module-0635.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { NOTEBOOK_EDITOR_CURSOR_BOUNDARY, NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY } from "./module-0911.mjs";
import { InlineChatController } from "./module-2372.mjs";
import { timeout } from "./module-0036.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/navigation/arrow.ts
var NOTEBOOK_FOCUS_TOP = "notebook.focusTop";

var NOTEBOOK_FOCUS_BOTTOM = "notebook.focusBottom";

var NOTEBOOK_FOCUS_PREVIOUS_EDITOR = "notebook.focusPreviousEditor";

var NOTEBOOK_FOCUS_NEXT_EDITOR = "notebook.focusNextEditor";

var FOCUS_IN_OUTPUT_COMMAND_ID = "notebook.cell.focusInOutput";

var FOCUS_OUT_OUTPUT_COMMAND_ID = "notebook.cell.focusOutOutput";

var CENTER_ACTIVE_CELL = "notebook.centerActiveCell";

var NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID = "notebook.cell.cursorPageUp";

var NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID = "notebook.cell.cursorPageUpSelect";

var NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID = "notebook.cell.cursorPageDown";

var NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID = "notebook.cell.cursorPageDownSelect";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.cell.nullAction",
      title: localize(17479, null),
      keybinding: [{
        when: NOTEBOOK_OUTPUT_INPUT_FOCUSED,
        primary: 18 /* DownArrow */,
        weight: 200 /* WorkbenchContrib */ + 1
      }, {
        when: NOTEBOOK_OUTPUT_INPUT_FOCUSED,
        primary: 16 /* UpArrow */,
        weight: 200 /* WorkbenchContrib */ + 1
      }],
      f1: false
    });
  }
  run() {
    return;
  }
});

registerAction2(class FocusNextCellAction extends NotebookCellAction {
  constructor() {
    super({
      id: NOTEBOOK_FOCUS_NEXT_EDITOR,
      title: localize(17469, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(),
            ContextKeyExpr.equals("config.notebook.navigation.allowNavigateToSurroundingCells", true),
            ContextKeyExpr.and(
              ContextKeyExpr.has(InputFocusedContextKey),
              EditorContextKeys.editorTextFocus,
              NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo("top"),
              NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo("none"),
              ContextKeyExpr.or(
                NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.isEqualTo("end"),
                NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.isEqualTo("both")
              )
            ),
            EditorContextKeys.isEmbeddedDiffEditor.negate()
          ),
          primary: 18 /* DownArrow */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
          // code cell keybinding, focus inside editor: lower weight to not override suggest widget
        },
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(),
            ContextKeyExpr.equals("config.notebook.navigation.allowNavigateToSurroundingCells", true),
            ContextKeyExpr.and(
              NOTEBOOK_CELL_TYPE.isEqualTo("markup"),
              NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.isEqualTo(false),
              NOTEBOOK_CURSOR_NAVIGATION_MODE
            ),
            EditorContextKeys.isEmbeddedDiffEditor.negate()
          ),
          primary: 18 /* DownArrow */,
          weight: 200 /* WorkbenchContrib */
          // markdown keybinding, focus on list: higher weight to override list.focusDown
        },
        {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_OUTPUT_FOCUSED),
          primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
          mac: { primary: 256 /* WinCtrl */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */ },
          weight: 200 /* WorkbenchContrib */
        },
        {
          when: ContextKeyExpr.and(NOTEBOOK_CELL_EDITOR_FOCUSED, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
          primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
          mac: { primary: 256 /* WinCtrl */ | 11 /* PageUp */ },
          weight: 200 /* WorkbenchContrib */ + 1
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    const activeCell = context2.cell;
    const idx = editor.getCellIndex(activeCell);
    if (typeof idx !== "number") {
      return;
    }
    if (idx >= editor.getLength() - 1) {
      return;
    }
    const focusEditorLine = activeCell.textBuffer.getLineCount();
    const targetCell = context2.cell ?? context2.selectedCells?.[0];
    const foundEditor = targetCell ? findTargetCellEditor(context2, targetCell) : void 0;
    if (foundEditor && foundEditor.hasTextFocus() && InlineChatController.get(foundEditor)?.getWidgetPosition()?.lineNumber === focusEditorLine) {
      InlineChatController.get(foundEditor)?.focus();
    } else {
      const newCell = editor.cellAt(idx + 1);
      const newFocusMode = newCell.cellKind === 1 /* Markup */ && newCell.getEditState() === 0 /* Preview */ ? "container" : "editor";
      await editor.focusNotebookCell(newCell, newFocusMode, { focusEditorLine: 1 });
    }
  }
});

registerAction2(class FocusPreviousCellAction extends NotebookCellAction {
  constructor() {
    super({
      id: NOTEBOOK_FOCUS_PREVIOUS_EDITOR,
      title: localize(17470, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(),
            ContextKeyExpr.equals("config.notebook.navigation.allowNavigateToSurroundingCells", true),
            ContextKeyExpr.and(
              ContextKeyExpr.has(InputFocusedContextKey),
              EditorContextKeys.editorTextFocus,
              NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo("bottom"),
              NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo("none"),
              ContextKeyExpr.or(
                NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.isEqualTo("start"),
                NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.isEqualTo("both")
              )
            ),
            EditorContextKeys.isEmbeddedDiffEditor.negate()
          ),
          primary: 16 /* UpArrow */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
          // code cell keybinding, focus inside editor: lower weight to not override suggest widget
        },
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(),
            ContextKeyExpr.equals("config.notebook.navigation.allowNavigateToSurroundingCells", true),
            ContextKeyExpr.and(
              NOTEBOOK_CELL_TYPE.isEqualTo("markup"),
              NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.isEqualTo(false),
              NOTEBOOK_CURSOR_NAVIGATION_MODE
            ),
            EditorContextKeys.isEmbeddedDiffEditor.negate()
          ),
          primary: 16 /* UpArrow */,
          weight: 200 /* WorkbenchContrib */
          // markdown keybinding, focus on list: higher weight to override list.focusDown
        },
        {
          when: ContextKeyExpr.and(NOTEBOOK_CELL_EDITOR_FOCUSED, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
          primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
          mac: { primary: 256 /* WinCtrl */ | 11 /* PageUp */ },
          weight: 200 /* WorkbenchContrib */ + 1
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    const activeCell = context2.cell;
    const idx = editor.getCellIndex(activeCell);
    if (typeof idx !== "number") {
      return;
    }
    if (idx < 1 || editor.getLength() === 0) {
      return;
    }
    const newCell = editor.cellAt(idx - 1);
    const newFocusMode = newCell.cellKind === 1 /* Markup */ && newCell.getEditState() === 0 /* Preview */ ? "container" : "editor";
    const focusEditorLine = newCell.textBuffer.getLineCount();
    await editor.focusNotebookCell(newCell, newFocusMode, { focusEditorLine });
    const foundEditor = findTargetCellEditor(context2, newCell);
    if (foundEditor && InlineChatController.get(foundEditor)?.getWidgetPosition()?.lineNumber === focusEditorLine) {
      InlineChatController.get(foundEditor)?.focus();
    }
  }
});

registerAction2(class extends NotebookAction {
  constructor() {
    super({
      id: NOTEBOOK_FOCUS_TOP,
      title: localize(17475, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          primary: 2048 /* CtrlCmd */ | 14 /* Home */,
          weight: 200 /* WorkbenchContrib */
        },
        {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          mac: { primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ },
          weight: 200 /* WorkbenchContrib */
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    if (editor.getLength() === 0) {
      return;
    }
    const firstCell = editor.cellAt(0);
    await editor.focusNotebookCell(firstCell, "container");
  }
});

registerAction2(class extends NotebookAction {
  constructor() {
    super({
      id: NOTEBOOK_FOCUS_BOTTOM,
      title: localize(17476, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          primary: 2048 /* CtrlCmd */ | 13 /* End */,
          mac: void 0,
          weight: 200 /* WorkbenchContrib */
        },
        {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          mac: { primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ },
          weight: 200 /* WorkbenchContrib */
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    if (!editor.hasModel() || editor.getLength() === 0) {
      return;
    }
    const lastIdx = editor.getLength() - 1;
    const lastVisibleIdx = editor.getPreviousVisibleCellIndex(lastIdx);
    if (lastVisibleIdx) {
      const cell = editor.cellAt(lastVisibleIdx);
      await editor.focusNotebookCell(cell, "container");
    }
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: FOCUS_IN_OUTPUT_COMMAND_ID,
      title: localize2(17477, "Focus In Active Cell Output"),
      f1: true,
      keybinding: [{
        when: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK.negate(), IsWindowsContext, NOTEBOOK_CELL_HAS_OUTPUTS),
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
        weight: 200 /* WorkbenchContrib */
      }, {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */,
        mac: { primary: 256 /* WinCtrl */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */ },
        weight: 200 /* WorkbenchContrib */
      }],
      precondition: NOTEBOOK_OR_COMPOSITE_IS_ACTIVE_EDITOR
    });
  }
  async runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    const activeCell = context2.cell;
    return timeout(0).then(() => editor.focusNotebookCell(activeCell, "output"));
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: FOCUS_OUT_OUTPUT_COMMAND_ID,
      title: localize(17478, null),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */,
        mac: { primary: 256 /* WinCtrl */ | 2048 /* CtrlCmd */ | 16 /* UpArrow */ },
        weight: 200 /* WorkbenchContrib */
      },
      precondition: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_OUTPUT_FOCUSED)
    });
  }
  async runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    const activeCell = context2.cell;
    await editor.focusNotebookCell(activeCell, "editor");
  }
});

registerAction2(class CenterActiveCellAction extends NotebookCellAction {
  constructor() {
    super({
      id: CENTER_ACTIVE_CELL,
      title: localize(17481, null),
      keybinding: {
        when: NOTEBOOK_EDITOR_FOCUSED,
        primary: 2048 /* CtrlCmd */ | 42 /* KeyL */,
        mac: {
          primary: 256 /* WinCtrl */ | 42 /* KeyL */
        },
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    return context2.notebookEditor.revealInCenter(context2.cell);
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID,
      title: localize(17473, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.has(InputFocusedContextKey),
            EditorContextKeys.editorTextFocus
          ),
          primary: 11 /* PageUp */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    EditorExtensionsRegistry.getEditorCommand("cursorPageUp").runCommand(accessor, { pageSize: getPageSize(context2) });
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID,
      title: localize(17474, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.has(InputFocusedContextKey),
            EditorContextKeys.editorTextFocus,
            NOTEBOOK_OUTPUT_FOCUSED.negate()
            // Webview handles Shift+PageUp for selection of output contents
          ),
          primary: 1024 /* Shift */ | 11 /* PageUp */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    EditorExtensionsRegistry.getEditorCommand("cursorPageUpSelect").runCommand(accessor, { pageSize: getPageSize(context2) });
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID,
      title: localize(17471, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.has(InputFocusedContextKey),
            EditorContextKeys.editorTextFocus
          ),
          primary: 12 /* PageDown */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    EditorExtensionsRegistry.getEditorCommand("cursorPageDown").runCommand(accessor, { pageSize: getPageSize(context2) });
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID,
      title: localize(17472, null),
      keybinding: [
        {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.has(InputFocusedContextKey),
            EditorContextKeys.editorTextFocus,
            NOTEBOOK_OUTPUT_FOCUSED.negate()
            // Webview handles Shift+PageDown for selection of output contents
          ),
          primary: 1024 /* Shift */ | 12 /* PageDown */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    EditorExtensionsRegistry.getEditorCommand("cursorPageDownSelect").runCommand(accessor, { pageSize: getPageSize(context2) });
  }
});

function getPageSize(context2) {
  const editor = context2.notebookEditor;
  const layoutInfo = editor.getViewModel().layoutInfo;
  const lineHeight = layoutInfo?.fontInfo.lineHeight || 17;
  return Math.max(1, Math.floor((layoutInfo?.height || 0) / lineHeight) - 2);
}

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "notebook",
  order: 100,
  type: "object",
  "properties": {
    "notebook.navigation.allowNavigateToSurroundingCells": {
      type: "boolean",
      default: true,
      markdownDescription: localize(17480, null)
    }
  }
});
export { getPageSize, NOTEBOOK_FOCUS_TOP, NOTEBOOK_FOCUS_BOTTOM, NOTEBOOK_FOCUS_PREVIOUS_EDITOR, NOTEBOOK_FOCUS_NEXT_EDITOR, FOCUS_IN_OUTPUT_COMMAND_ID, FOCUS_OUT_OUTPUT_COMMAND_ID, CENTER_ACTIVE_CELL, NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID, NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID, NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID, NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID };
