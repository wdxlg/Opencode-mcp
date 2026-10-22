// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard.ts
import { ILogService } from "./module-0095.mjs";
import { IEditorService } from "./module-0935.mjs";
import { cellRangeToViewCells, expandCellRangesWithHiddenCells, getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { RedoCommand, UndoCommand } from "./module-0097.mjs";
import { CopyAction, CutAction, PasteAction } from "./module-0556.mjs";
import { cloneNotebookCellTextModel } from "./module-1860.mjs";
import { getActiveElement, getWindow, isEditableElement, isHTMLElement } from "./module-0075.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { INotebookService } from "./module-0927.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT, NotebookAction, NotebookCellAction } from "./module-1845.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { NOTEBOOK_CELL_EDITABLE, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_OUTPUT_FOCUSED } from "./module-1844.mjs";
import { isNative } from "./module-0014.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { InputFocusedContextKey } from "./module-0635.mjs";
import { Categories } from "./module-0847.mjs";
import { ICommandService } from "./module-0087.mjs";
import { showWindowLogActionId } from "./module-1501.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard.ts
var _logging = false;

function toggleLogging() {
  _logging = !_logging;
}

function _log(loggerService, str) {
  if (_logging) {
    loggerService.info(`[NotebookClipboard]: ${str}`);
  }
}

function getFocusedEditor(accessor) {
  const loggerService = accessor.get(ILogService);
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor) {
    _log(loggerService, "[Revive Webview] No notebook editor found for active editor pane, bypass");
    return;
  }
  if (!editor.hasEditorFocus()) {
    _log(loggerService, "[Revive Webview] Notebook editor is not focused, bypass");
    return;
  }
  if (!editor.hasWebviewFocus()) {
    _log(loggerService, "[Revive Webview] Notebook editor backlayer webview is not focused, bypass");
    return;
  }
  const view = editor.getViewModel();
  if (view && view.viewCells.every((cell) => !cell.outputIsFocused && !cell.outputIsHovered)) {
    return;
  }
  return { editor, loggerService };
}

function getFocusedWebviewDelegate(accessor) {
  const result = getFocusedEditor(accessor);
  if (!result) {
    return;
  }
  const webview = result.editor.getInnerWebview();
  _log(result.loggerService, "[Revive Webview] Notebook editor backlayer webview is focused");
  return webview;
}

function withWebview(accessor, f) {
  const webview = getFocusedWebviewDelegate(accessor);
  if (webview) {
    f(webview);
    return true;
  }
  return false;
}

function withEditor(accessor, f) {
  const result = getFocusedEditor(accessor);
  return result ? f(result.editor) : false;
}

var PRIORITY2 = 105;

UndoCommand.addImplementation(PRIORITY2, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.undo());
});

RedoCommand.addImplementation(PRIORITY2, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.redo());
});

CopyAction?.addImplementation(PRIORITY2, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.copy());
});

PasteAction?.addImplementation(PRIORITY2, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.paste());
});

CutAction?.addImplementation(PRIORITY2, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.cut());
});

function runPasteCells(editor, activeCell, pasteCells) {
  if (!editor.hasModel()) {
    return false;
  }
  const textModel = editor.textModel;
  if (editor.isReadOnly) {
    return false;
  }
  const originalState = {
    kind: 1 /* Index */,
    focus: editor.getFocus(),
    selections: editor.getSelections()
  };
  if (activeCell) {
    const currCellIndex = editor.getCellIndex(activeCell);
    const newFocusIndex = typeof currCellIndex === "number" ? currCellIndex + 1 : 0;
    textModel.applyEdits([
      {
        editType: 1 /* Replace */,
        index: newFocusIndex,
        count: 0,
        cells: pasteCells.items.map((cell) => cloneNotebookCellTextModel(cell))
      }
    ], true, originalState, () => ({
      kind: 1 /* Index */,
      focus: { start: newFocusIndex, end: newFocusIndex + 1 },
      selections: [{ start: newFocusIndex, end: newFocusIndex + pasteCells.items.length }]
    }), void 0, true);
  } else {
    if (editor.getLength() !== 0) {
      return false;
    }
    textModel.applyEdits([
      {
        editType: 1 /* Replace */,
        index: 0,
        count: 0,
        cells: pasteCells.items.map((cell) => cloneNotebookCellTextModel(cell))
      }
    ], true, originalState, () => ({
      kind: 1 /* Index */,
      focus: { start: 0, end: 1 },
      selections: [{ start: 1, end: pasteCells.items.length + 1 }]
    }), void 0, true);
  }
  return true;
}

function runCopyCells(accessor, editor, targetCell) {
  if (!editor.hasModel()) {
    return false;
  }
  if (editor.hasOutputTextSelection()) {
    getWindow(editor.getDomNode()).document.execCommand("copy");
    return true;
  }
  const clipboardService = accessor.get(IClipboardService);
  const notebookService = accessor.get(INotebookService);
  const selections = editor.getSelections();
  if (targetCell) {
    const targetCellIndex = editor.getCellIndex(targetCell);
    const containingSelection = selections.find((selection) => selection.start <= targetCellIndex && targetCellIndex < selection.end);
    if (!containingSelection) {
      clipboardService.writeText(targetCell.getText());
      notebookService.setToCopy([targetCell.model], true);
      return true;
    }
  }
  const selectionRanges = expandCellRangesWithHiddenCells(editor, editor.getSelections());
  const selectedCells = cellRangeToViewCells(editor, selectionRanges);
  if (!selectedCells.length) {
    return false;
  }
  clipboardService.writeText(selectedCells.map((cell) => cell.getText()).join("\n"));
  notebookService.setToCopy(selectedCells.map((cell) => cell.model), true);
  return true;
}

function runCutCells(accessor, editor, targetCell) {
  if (!editor.hasModel() || editor.isReadOnly) {
    return false;
  }
  const textModel = editor.textModel;
  const clipboardService = accessor.get(IClipboardService);
  const notebookService = accessor.get(INotebookService);
  const selections = editor.getSelections();
  if (targetCell) {
    const targetCellIndex = editor.getCellIndex(targetCell);
    const containingSelection2 = selections.find((selection) => selection.start <= targetCellIndex && targetCellIndex < selection.end);
    if (!containingSelection2) {
      clipboardService.writeText(targetCell.getText());
      const focus2 = editor.getFocus();
      const newFocus = focus2.end <= targetCellIndex ? focus2 : { start: focus2.start - 1, end: focus2.end - 1 };
      const newSelections = selections.map((selection) => selection.end <= targetCellIndex ? selection : { start: selection.start - 1, end: selection.end - 1 });
      textModel.applyEdits([
        { editType: 1 /* Replace */, index: targetCellIndex, count: 1, cells: [] }
      ], true, { kind: 1 /* Index */, focus: editor.getFocus(), selections }, () => ({ kind: 1 /* Index */, focus: newFocus, selections: newSelections }), void 0, true);
      notebookService.setToCopy([targetCell.model], false);
      return true;
    }
  }
  const focus = editor.getFocus();
  const containingSelection = selections.find((selection) => selection.start <= focus.start && focus.end <= selection.end);
  if (!containingSelection) {
    const targetCell2 = editor.cellAt(focus.start);
    clipboardService.writeText(targetCell2.getText());
    const newFocus = focus.end === editor.getLength() ? { start: focus.start - 1, end: focus.end - 1 } : focus;
    const newSelections = selections.map((selection) => selection.end <= focus.start ? selection : { start: selection.start - 1, end: selection.end - 1 });
    textModel.applyEdits([
      { editType: 1 /* Replace */, index: focus.start, count: 1, cells: [] }
    ], true, { kind: 1 /* Index */, focus: editor.getFocus(), selections }, () => ({ kind: 1 /* Index */, focus: newFocus, selections: newSelections }), void 0, true);
    notebookService.setToCopy([targetCell2.model], false);
    return true;
  }
  const selectionRanges = expandCellRangesWithHiddenCells(editor, editor.getSelections());
  const selectedCells = cellRangeToViewCells(editor, selectionRanges);
  if (!selectedCells.length) {
    return false;
  }
  clipboardService.writeText(selectedCells.map((cell) => cell.getText()).join("\n"));
  const edits = selectionRanges.map((range2) => ({ editType: 1 /* Replace */, index: range2.start, count: range2.end - range2.start, cells: [] }));
  const firstSelectIndex = selectionRanges[0].start;
  const newFocusedCellIndex = firstSelectIndex < textModel.cells.length - 1 ? firstSelectIndex : Math.max(textModel.cells.length - 2, 0);
  textModel.applyEdits(edits, true, { kind: 1 /* Index */, focus: editor.getFocus(), selections: selectionRanges }, () => {
    return {
      kind: 1 /* Index */,
      focus: { start: newFocusedCellIndex, end: newFocusedCellIndex + 1 },
      selections: [{ start: newFocusedCellIndex, end: newFocusedCellIndex + 1 }]
    };
  }, void 0, true);
  notebookService.setToCopy(selectedCells.map((cell) => cell.model), false);
  return true;
}

var NotebookClipboardContribution = class extends Disposable {
  constructor(_editorService) {
    super();
    this._editorService = _editorService;
    const PRIORITY3 = 105;
    if (CopyAction) {
      this._register(CopyAction.addImplementation(PRIORITY3, "notebook-clipboard", (accessor) => {
        return this.runCopyAction(accessor);
      }));
    }
    if (PasteAction) {
      this._register(PasteAction.addImplementation(PRIORITY3, "notebook-clipboard", (accessor) => {
        return this.runPasteAction(accessor);
      }));
    }
    if (CutAction) {
      this._register(CutAction.addImplementation(PRIORITY3, "notebook-clipboard", (accessor) => {
        return this.runCutAction(accessor);
      }));
    }
  }
  static {
    this.ID = "workbench.contrib.notebookClipboard";
  }
  _getContext() {
    const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    const activeCell = editor?.getActiveCell();
    return {
      editor,
      activeCell
    };
  }
  _focusInsideEmebedMonaco(editor) {
    const windowSelection = getWindow(editor.getDomNode()).getSelection();
    if (windowSelection?.rangeCount !== 1) {
      return false;
    }
    const activeSelection = windowSelection.getRangeAt(0);
    if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
      return false;
    }
    let container2 = activeSelection.commonAncestorContainer;
    const body = editor.getDomNode();
    if (!body.contains(container2)) {
      return false;
    }
    while (container2 && container2 !== body) {
      if (container2.classList && container2.classList.contains("monaco-editor")) {
        return true;
      }
      container2 = container2.parentNode;
    }
    return false;
  }
  runCopyAction(accessor) {
    const loggerService = accessor.get(ILogService);
    const activeElement = getActiveElement();
    if (isHTMLElement(activeElement) && isEditableElement(activeElement)) {
      _log(loggerService, "[NotebookEditor] focus is on input or textarea element, bypass");
      return false;
    }
    const { editor } = this._getContext();
    if (!editor) {
      _log(loggerService, "[NotebookEditor] no active notebook editor, bypass");
      return false;
    }
    if (!editor.hasEditorFocus()) {
      _log(loggerService, "[NotebookEditor] focus is outside of the notebook editor, bypass");
      return false;
    }
    if (this._focusInsideEmebedMonaco(editor)) {
      _log(loggerService, "[NotebookEditor] focus is on embed monaco editor, bypass");
      return false;
    }
    _log(loggerService, "[NotebookEditor] run copy actions on notebook model");
    return runCopyCells(accessor, editor, void 0);
  }
  runPasteAction(accessor) {
    const activeElement = getActiveElement();
    if (activeElement && isEditableElement(activeElement)) {
      return false;
    }
    const { editor, activeCell } = this._getContext();
    if (!editor || !editor.hasEditorFocus() || this._focusInsideEmebedMonaco(editor)) {
      return false;
    }
    const notebookService = accessor.get(INotebookService);
    const pasteCells = notebookService.getToCopy();
    if (!pasteCells) {
      return false;
    }
    return runPasteCells(editor, activeCell, pasteCells);
  }
  runCutAction(accessor) {
    const activeElement = getActiveElement();
    if (activeElement && isEditableElement(activeElement)) {
      return false;
    }
    const { editor } = this._getContext();
    if (!editor || !editor.hasEditorFocus() || this._focusInsideEmebedMonaco(editor)) {
      return false;
    }
    return runCutCells(accessor, editor, void 0);
  }
};

NotebookClipboardContribution = __decorateClass([
  __decorateParam(0, IEditorService)
], NotebookClipboardContribution);

registerWorkbenchContribution2(NotebookClipboardContribution.ID, NotebookClipboardContribution, WorkbenchPhase.BlockRestore);

var COPY_CELL_COMMAND_ID = "notebook.cell.copy";

var CUT_CELL_COMMAND_ID = "notebook.cell.cut";

var PASTE_CELL_COMMAND_ID = "notebook.cell.paste";

var PASTE_CELL_ABOVE_COMMAND_ID = "notebook.cell.pasteAbove";

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: COPY_CELL_COMMAND_ID,
        title: localize(17420, null),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: NOTEBOOK_EDITOR_FOCUSED,
          group: "1_copy" /* Copy */,
          order: 2
        },
        keybinding: isNative ? void 0 : {
          primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
          win: { primary: 2048 /* CtrlCmd */ | 33 /* KeyC */, secondary: [2048 /* CtrlCmd */ | 19 /* Insert */] },
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          weight: 200 /* WorkbenchContrib */
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    runCopyCells(accessor, context2.notebookEditor, context2.cell);
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: CUT_CELL_COMMAND_ID,
        title: localize(17421, null),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE),
          group: "1_copy" /* Copy */,
          order: 1
        },
        keybinding: isNative ? void 0 : {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          primary: 2048 /* CtrlCmd */ | 54 /* KeyX */,
          win: { primary: 2048 /* CtrlCmd */ | 54 /* KeyX */, secondary: [1024 /* Shift */ | 20 /* Delete */] },
          weight: 200 /* WorkbenchContrib */
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    runCutCells(accessor, context2.notebookEditor, context2.cell);
  }
});

registerAction2(class extends NotebookAction {
  constructor() {
    super(
      {
        id: PASTE_CELL_COMMAND_ID,
        title: localize(17422, null),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE),
          group: "1_copy" /* Copy */,
          order: 3
        },
        keybinding: isNative ? void 0 : {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          primary: 2048 /* CtrlCmd */ | 52 /* KeyV */,
          win: { primary: 2048 /* CtrlCmd */ | 52 /* KeyV */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
          linux: { primary: 2048 /* CtrlCmd */ | 52 /* KeyV */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
          weight: 100 /* EditorContrib */
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    const notebookService = accessor.get(INotebookService);
    const pasteCells = notebookService.getToCopy();
    if (!context2.notebookEditor.hasModel() || context2.notebookEditor.isReadOnly) {
      return;
    }
    if (!pasteCells) {
      return;
    }
    runPasteCells(context2.notebookEditor, context2.cell, pasteCells);
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: PASTE_CELL_ABOVE_COMMAND_ID,
        title: localize(17423, null),
        keybinding: {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KeyV */,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    const notebookService = accessor.get(INotebookService);
    const pasteCells = notebookService.getToCopy();
    const editor = context2.notebookEditor;
    const textModel = editor.textModel;
    if (editor.isReadOnly) {
      return;
    }
    if (!pasteCells) {
      return;
    }
    const originalState = {
      kind: 1 /* Index */,
      focus: editor.getFocus(),
      selections: editor.getSelections()
    };
    const currCellIndex = context2.notebookEditor.getCellIndex(context2.cell);
    const newFocusIndex = currCellIndex;
    textModel.applyEdits([
      {
        editType: 1 /* Replace */,
        index: currCellIndex,
        count: 0,
        cells: pasteCells.items.map((cell) => cloneNotebookCellTextModel(cell))
      }
    ], true, originalState, () => ({
      kind: 1 /* Index */,
      focus: { start: newFocusIndex, end: newFocusIndex + 1 },
      selections: [{ start: newFocusIndex, end: newFocusIndex + pasteCells.items.length }]
    }), void 0, true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleNotebookClipboardLog",
      title: localize2(17424, "Toggle Notebook Clipboard Troubleshooting"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    toggleLogging();
    if (_logging) {
      const commandService = accessor.get(ICommandService);
      commandService.executeCommand(showWindowLogActionId);
    }
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: "notebook.cell.output.selectAll",
        title: localize(17419, null),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 31 /* KeyA */,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_OUTPUT_FOCUSED),
          weight: NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT
        }
      }
    );
  }
  async runWithContext(accessor, _context) {
    withEditor(accessor, (editor) => {
      if (!editor.hasEditorFocus()) {
        return false;
      }
      if (editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
        return true;
      }
      const cell = editor.getActiveCell();
      if (!cell || !cell.outputIsFocused || !editor.hasWebviewFocus()) {
        return true;
      }
      if (cell.inputInOutputIsFocused) {
        editor.selectInputContents(cell);
      } else {
        editor.selectOutputContent(cell);
      }
      return true;
    });
  }
});
export { toggleLogging, _log, getFocusedEditor, getFocusedWebviewDelegate, withWebview, withEditor, runPasteCells, runCopyCells, runCutCells, _logging, PRIORITY2, NotebookClipboardContribution, COPY_CELL_COMMAND_ID, CUT_CELL_COMMAND_ID, PASTE_CELL_COMMAND_ID, PASTE_CELL_ABOVE_COMMAND_ID };
