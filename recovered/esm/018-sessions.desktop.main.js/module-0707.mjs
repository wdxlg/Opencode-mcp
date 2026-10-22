// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/linesOperations/browser/linesOperations.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { Range2 } from "./module-0106.mjs";
import { CopyLinesCommand } from "./module-0703.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MenuId } from "./module-0092.mjs";
import { Selection } from "./module-0107.mjs";
import { ReplaceCommand, ReplaceCommandThatPreservesSelection, ReplaceCommandThatSelectsText } from "./module-0115.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { MoveLinesCommand } from "./module-0705.mjs";
import { SortLinesCommand } from "./module-0706.mjs";
import { EditOperation } from "./module-0162.mjs";
import { KeyChord } from "./module-0019.mjs";
import { Position } from "./module-0079.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { TrimTrailingWhitespaceCommand } from "./module-0702.mjs";
import { TypeOperations } from "./module-0152.mjs";
import { CoreEditingCommands } from "./module-0157.mjs";
import { EnterOperation } from "./module-0151.mjs";


// src/vs/editor/contrib/linesOperations/browser/linesOperations.ts
var AbstractCopyLinesAction = class extends EditorAction {
  constructor(down, opts) {
    super(opts);
    this.down = down;
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections().map((selection, index2) => ({ selection, index: index2, ignore: false }));
    selections.sort((a, b) => Range2.compareRangesUsingStarts(a.selection, b.selection));
    let prev = selections[0];
    for (let i2 = 1; i2 < selections.length; i2++) {
      const curr = selections[i2];
      if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
        if (prev.index < curr.index) {
          curr.ignore = true;
        } else {
          prev.ignore = true;
          prev = curr;
        }
      }
    }
    const commands = [];
    for (const selection of selections) {
      commands.push(new CopyLinesCommand(selection.selection, this.down, selection.ignore));
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var CopyLinesUpAction = class extends AbstractCopyLinesAction {
  constructor() {
    super(false, {
      id: "editor.action.copyLinesUpAction",
      label: localize2(1439, "Copy Line Up"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 512 /* Alt */ | 1024 /* Shift */ | 16 /* UpArrow */,
        linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */ | 16 /* UpArrow */ },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: localize(1456, null),
        order: 1
      },
      canTriggerInlineEdits: true
    });
  }
};

var CopyLinesDownAction = class extends AbstractCopyLinesAction {
  constructor() {
    super(true, {
      id: "editor.action.copyLinesDownAction",
      label: localize2(1438, "Copy Line Down"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 512 /* Alt */ | 1024 /* Shift */ | 18 /* DownArrow */,
        linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */ | 18 /* DownArrow */ },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: localize(1455, null),
        order: 2
      },
      canTriggerInlineEdits: true
    });
  }
};

var DuplicateSelectionAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.duplicateSelection",
      label: localize2(1429, "Duplicate Selection"),
      precondition: EditorContextKeys.writable,
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: localize(1457, null),
        order: 5
      },
      canTriggerInlineEdits: true
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const commands = [];
    const selections = editor.getSelections();
    const model = editor.getModel();
    for (const selection of selections) {
      if (selection.isEmpty()) {
        commands.push(new CopyLinesCommand(selection, true));
      } else {
        const insertSelection = new Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);
        commands.push(new ReplaceCommandThatSelectsText(insertSelection, model.getValueInRange(selection)));
      }
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var AbstractMoveLinesAction = class extends EditorAction {
  constructor(down, opts) {
    super(opts);
    this.down = down;
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    const commands = [];
    const selections = editor.getSelections() || [];
    const autoIndent = editor.getOption(16 /* autoIndent */);
    for (const selection of selections) {
      commands.push(new MoveLinesCommand(selection, this.down, autoIndent, languageConfigurationService));
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var MoveLinesUpAction = class extends AbstractMoveLinesAction {
  constructor() {
    super(false, {
      id: "editor.action.moveLinesUpAction",
      label: localize2(1449, "Move Line Up"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 512 /* Alt */ | 16 /* UpArrow */,
        linux: { primary: 512 /* Alt */ | 16 /* UpArrow */ },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: localize(1459, null),
        order: 3
      },
      canTriggerInlineEdits: true
    });
  }
};

var MoveLinesDownAction = class extends AbstractMoveLinesAction {
  constructor() {
    super(true, {
      id: "editor.action.moveLinesDownAction",
      label: localize2(1448, "Move Line Down"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 512 /* Alt */ | 18 /* DownArrow */,
        linux: { primary: 512 /* Alt */ | 18 /* DownArrow */ },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: localize(1458, null),
        order: 4
      },
      canTriggerInlineEdits: true
    });
  }
};

var AbstractSortLinesAction = class extends EditorAction {
  constructor(descending, opts) {
    super(opts);
    this.descending = descending;
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    let selections = editor.getSelections();
    if (selections.length === 1 && selections[0].isSingleLine()) {
      selections = [new Selection(1, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount()))];
    }
    for (const selection of selections) {
      if (!SortLinesCommand.canRun(editor.getModel(), selection, this.descending)) {
        return;
      }
    }
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      commands[i2] = new SortLinesCommand(selections[i2], this.descending);
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var SortLinesAscendingAction = class extends AbstractSortLinesAction {
  constructor() {
    super(false, {
      id: "editor.action.sortLinesAscending",
      label: localize2(1452, "Sort Lines Ascending"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
};

var SortLinesDescendingAction = class extends AbstractSortLinesAction {
  constructor() {
    super(true, {
      id: "editor.action.sortLinesDescending",
      label: localize2(1453, "Sort Lines Descending"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
};

var DeleteDuplicateLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.removeDuplicateLines",
      label: localize2(1443, "Delete Duplicate Lines"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
      return;
    }
    const edits = [];
    const endCursorState = [];
    let linesDeleted = 0;
    let updateSelection = true;
    let selections = editor.getSelections();
    if (selections.length === 1 && selections[0].isSingleLine()) {
      selections = [new Selection(1, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount()))];
      updateSelection = false;
    }
    for (const selection of selections) {
      const uniqueLines = /* @__PURE__ */ new Set();
      const lines = [];
      for (let i2 = selection.startLineNumber; i2 <= selection.endLineNumber; i2++) {
        const line = model.getLineContent(i2);
        if (uniqueLines.has(line)) {
          continue;
        }
        lines.push(line);
        uniqueLines.add(line);
      }
      const selectionToReplace = new Selection(
        selection.startLineNumber,
        1,
        selection.endLineNumber,
        model.getLineMaxColumn(selection.endLineNumber)
      );
      const adjustedSelectionStart = selection.startLineNumber - linesDeleted;
      const finalSelection = new Selection(
        adjustedSelectionStart,
        1,
        adjustedSelectionStart + lines.length - 1,
        lines[lines.length - 1].length + 1
      );
      edits.push(EditOperation.replace(selectionToReplace, lines.join("\n")));
      endCursorState.push(finalSelection);
      linesDeleted += selection.endLineNumber - selection.startLineNumber + 1 - lines.length;
    }
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, updateSelection ? endCursorState : void 0);
    editor.pushUndoStop();
  }
};

var ReverseLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.reverseLines",
      label: localize2(1451, "Reverse lines"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const originalSelections = editor.getSelections();
    let selections = originalSelections;
    if (selections.length === 1 && selections[0].isSingleLine()) {
      selections = [new Selection(1, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount()))];
    }
    const edits = [];
    const resultingSelections = [];
    for (let i2 = 0; i2 < selections.length; i2++) {
      const selection = selections[i2];
      const originalSelection = originalSelections[i2];
      let endLineNumber = selection.endLineNumber;
      if (selection.startLineNumber < selection.endLineNumber && selection.endColumn === 1) {
        endLineNumber--;
      }
      let range2 = new Range2(selection.startLineNumber, 1, endLineNumber, model.getLineMaxColumn(endLineNumber));
      if (endLineNumber === model.getLineCount() && model.getLineContent(range2.endLineNumber) === "") {
        range2 = range2.setEndPosition(range2.endLineNumber - 1, model.getLineMaxColumn(range2.endLineNumber - 1));
      }
      const lines = [];
      for (let i3 = range2.endLineNumber; i3 >= range2.startLineNumber; i3--) {
        lines.push(model.getLineContent(i3));
      }
      const edit3 = EditOperation.replace(range2, lines.join("\n"));
      edits.push(edit3);
      const updateLineNumber = function(lineNumber) {
        return lineNumber <= range2.endLineNumber ? range2.endLineNumber - lineNumber + range2.startLineNumber : lineNumber;
      };
      const updateSelection = function(sel) {
        if (sel.isEmpty()) {
          return new Selection(updateLineNumber(sel.positionLineNumber), sel.positionColumn, updateLineNumber(sel.positionLineNumber), sel.positionColumn);
        } else {
          const newSelectionStart = updateLineNumber(sel.selectionStartLineNumber);
          const newPosition = updateLineNumber(sel.positionLineNumber);
          const newSelectionStartColumn = sel.selectionStartColumn;
          const newPositionColumn = sel.positionColumn;
          return new Selection(newSelectionStart, newSelectionStartColumn, newPosition, newPositionColumn);
        }
      };
      resultingSelections.push(updateSelection(originalSelection));
    }
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, resultingSelections);
    editor.pushUndoStop();
  }
};

var TrimTrailingWhitespaceAction = class _TrimTrailingWhitespaceAction extends EditorAction {
  static {
    this.ID = "editor.action.trimTrailingWhitespace";
  }
  constructor() {
    super({
      id: _TrimTrailingWhitespaceAction.ID,
      label: localize2(1454, "Trim Trailing Whitespace"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 54 /* KeyX */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(_accessor, editor, args2) {
    let cursors = [];
    if (args2.reason === "auto-save") {
      cursors = (editor.getSelections() || []).map((s) => new Position(s.positionLineNumber, s.positionColumn));
    }
    const selection = editor.getSelection();
    if (selection === null) {
      return;
    }
    const config = _accessor.get(IConfigurationService);
    const model = editor.getModel();
    const trimInRegexAndStrings = config.getValue("files.trimTrailingWhitespaceInRegexAndStrings", { overrideIdentifier: model?.getLanguageId(), resource: model?.uri });
    const command4 = new TrimTrailingWhitespaceCommand(selection, cursors, trimInRegexAndStrings);
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command4]);
    editor.pushUndoStop();
  }
};

var DeleteLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.deleteLines",
      label: localize2(1440, "Delete Line"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 41 /* KeyK */,
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const ops = this._getLinesToRemove(editor);
    const model = editor.getModel();
    if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
      return;
    }
    let linesDeleted = 0;
    const edits = [];
    const cursorState = [];
    for (let i2 = 0, len = ops.length; i2 < len; i2++) {
      const op = ops[i2];
      let startLineNumber = op.startLineNumber;
      let endLineNumber = op.endLineNumber;
      let startColumn = 1;
      let endColumn = model.getLineMaxColumn(endLineNumber);
      if (endLineNumber < model.getLineCount()) {
        endLineNumber += 1;
        endColumn = 1;
      } else if (startLineNumber > 1) {
        startLineNumber -= 1;
        startColumn = model.getLineMaxColumn(startLineNumber);
      }
      edits.push(EditOperation.replace(new Selection(startLineNumber, startColumn, endLineNumber, endColumn), ""));
      cursorState.push(new Selection(startLineNumber - linesDeleted, op.positionColumn, startLineNumber - linesDeleted, op.positionColumn));
      linesDeleted += op.endLineNumber - op.startLineNumber + 1;
    }
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, cursorState);
    editor.revealAllCursors(true);
    editor.pushUndoStop();
  }
  _getLinesToRemove(editor) {
    const operations = editor.getSelections().map((s) => {
      let endLineNumber = s.endLineNumber;
      if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
        endLineNumber -= 1;
      }
      return {
        startLineNumber: s.startLineNumber,
        selectionStartColumn: s.selectionStartColumn,
        endLineNumber,
        positionColumn: s.positionColumn
      };
    });
    operations.sort((a, b) => {
      if (a.startLineNumber === b.startLineNumber) {
        return a.endLineNumber - b.endLineNumber;
      }
      return a.startLineNumber - b.startLineNumber;
    });
    const mergedOperations = [];
    let previousOperation = operations[0];
    for (let i2 = 1; i2 < operations.length; i2++) {
      if (previousOperation.endLineNumber + 1 >= operations[i2].startLineNumber) {
        previousOperation.endLineNumber = operations[i2].endLineNumber;
      } else {
        mergedOperations.push(previousOperation);
        previousOperation = operations[i2];
      }
    }
    mergedOperations.push(previousOperation);
    return mergedOperations;
  }
};

var IndentLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.indentLines",
      label: localize2(1444, "Indent Line"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 94 /* BracketRight */,
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, TypeOperations.indent(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
    editor.pushUndoStop();
  }
};

var OutdentLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.outdentLines",
      label: localize2(1450, "Outdent Line"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 92 /* BracketLeft */,
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    CoreEditingCommands.Outdent.runEditorCommand(_accessor, editor, null);
  }
};

var InsertLineBeforeAction = class _InsertLineBeforeAction extends EditorAction {
  static {
    this.ID = "editor.action.insertLineBefore";
  }
  constructor() {
    super({
      id: _InsertLineBeforeAction.ID,
      label: localize2(1446, "Insert Line Above"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, EnterOperation.lineInsertBefore(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
  }
};

var InsertLineAfterAction = class _InsertLineAfterAction extends EditorAction {
  static {
    this.ID = "editor.action.insertLineAfter";
  }
  constructor() {
    super({
      id: _InsertLineAfterAction.ID,
      label: localize2(1445, "Insert Line Below"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, EnterOperation.lineInsertAfter(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
  }
};

var AbstractDeleteAllToBoundaryAction = class extends EditorAction {
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const primaryCursor = editor.getSelection();
    const rangesToDelete = this._getRangesToDelete(editor);
    const effectiveRanges = [];
    for (let i2 = 0, count2 = rangesToDelete.length - 1; i2 < count2; i2++) {
      const range2 = rangesToDelete[i2];
      const nextRange = rangesToDelete[i2 + 1];
      if (Range2.intersectRanges(range2, nextRange) === null) {
        effectiveRanges.push(range2);
      } else {
        rangesToDelete[i2 + 1] = Range2.plusRange(range2, nextRange);
      }
    }
    effectiveRanges.push(rangesToDelete[rangesToDelete.length - 1]);
    const endCursorState = this._getEndCursorState(primaryCursor, effectiveRanges);
    const edits = effectiveRanges.map((range2) => {
      return EditOperation.replace(range2, "");
    });
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, endCursorState);
    editor.pushUndoStop();
  }
};

var DeleteAllLeftAction = class extends AbstractDeleteAllToBoundaryAction {
  constructor() {
    super({
      id: "deleteAllLeft",
      label: localize2(1441, "Delete All Left"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ },
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  _getEndCursorState(primaryCursor, rangesToDelete) {
    let endPrimaryCursor = null;
    const endCursorState = [];
    let deletedLines = 0;
    rangesToDelete.forEach((range2) => {
      let endCursor;
      if (range2.endColumn === 1 && deletedLines > 0) {
        const newStartLine = range2.startLineNumber - deletedLines;
        endCursor = new Selection(newStartLine, range2.startColumn, newStartLine, range2.startColumn);
      } else {
        endCursor = new Selection(range2.startLineNumber, range2.startColumn, range2.startLineNumber, range2.startColumn);
      }
      deletedLines += range2.endLineNumber - range2.startLineNumber;
      if (range2.intersectRanges(primaryCursor)) {
        endPrimaryCursor = endCursor;
      } else {
        endCursorState.push(endCursor);
      }
    });
    if (endPrimaryCursor) {
      endCursorState.unshift(endPrimaryCursor);
    }
    return endCursorState;
  }
  _getRangesToDelete(editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return [];
    }
    let rangesToDelete = selections;
    const model = editor.getModel();
    if (model === null) {
      return [];
    }
    rangesToDelete.sort(Range2.compareRangesUsingStarts);
    rangesToDelete = rangesToDelete.map((selection) => {
      if (selection.isEmpty()) {
        if (selection.startColumn === 1) {
          const deleteFromLine = Math.max(1, selection.startLineNumber - 1);
          const deleteFromColumn = selection.startLineNumber === 1 ? 1 : model.getLineLength(deleteFromLine) + 1;
          return new Range2(deleteFromLine, deleteFromColumn, selection.startLineNumber, 1);
        } else {
          return new Range2(selection.startLineNumber, 1, selection.startLineNumber, selection.startColumn);
        }
      } else {
        return new Range2(selection.startLineNumber, 1, selection.endLineNumber, selection.endColumn);
      }
    });
    return rangesToDelete;
  }
};

var DeleteAllRightAction = class extends AbstractDeleteAllToBoundaryAction {
  constructor() {
    super({
      id: "deleteAllRight",
      label: localize2(1442, "Delete All Right"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 41 /* KeyK */, secondary: [2048 /* CtrlCmd */ | 20 /* Delete */] },
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  _getEndCursorState(primaryCursor, rangesToDelete) {
    let endPrimaryCursor = null;
    const endCursorState = [];
    for (let i2 = 0, len = rangesToDelete.length, offset = 0; i2 < len; i2++) {
      const range2 = rangesToDelete[i2];
      const endCursor = new Selection(range2.startLineNumber - offset, range2.startColumn, range2.startLineNumber - offset, range2.startColumn);
      if (range2.intersectRanges(primaryCursor)) {
        endPrimaryCursor = endCursor;
      } else {
        endCursorState.push(endCursor);
      }
    }
    if (endPrimaryCursor) {
      endCursorState.unshift(endPrimaryCursor);
    }
    return endCursorState;
  }
  _getRangesToDelete(editor) {
    const model = editor.getModel();
    if (model === null) {
      return [];
    }
    const selections = editor.getSelections();
    if (selections === null) {
      return [];
    }
    const rangesToDelete = selections.map((sel) => {
      if (sel.isEmpty()) {
        const maxColumn = model.getLineMaxColumn(sel.startLineNumber);
        if (sel.startColumn === maxColumn) {
          return new Range2(sel.startLineNumber, sel.startColumn, sel.startLineNumber + 1, 1);
        } else {
          return new Range2(sel.startLineNumber, sel.startColumn, sel.startLineNumber, maxColumn);
        }
      }
      return sel;
    });
    rangesToDelete.sort(Range2.compareRangesUsingStarts);
    return rangesToDelete;
  }
};

var JoinLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.joinLines",
      label: localize2(1447, "Join Lines"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 40 /* KeyJ */ },
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    let primaryCursor = editor.getSelection();
    if (primaryCursor === null) {
      return;
    }
    selections.sort(Range2.compareRangesUsingStarts);
    const reducedSelections = [];
    const lastSelection = selections.reduce((previousValue, currentValue) => {
      if (previousValue.isEmpty()) {
        if (previousValue.endLineNumber === currentValue.startLineNumber) {
          if (primaryCursor.equalsSelection(previousValue)) {
            primaryCursor = currentValue;
          }
          return currentValue;
        }
        if (currentValue.startLineNumber > previousValue.endLineNumber + 1) {
          reducedSelections.push(previousValue);
          return currentValue;
        } else {
          return new Selection(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
        }
      } else {
        if (currentValue.startLineNumber > previousValue.endLineNumber) {
          reducedSelections.push(previousValue);
          return currentValue;
        } else {
          return new Selection(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
        }
      }
    });
    reducedSelections.push(lastSelection);
    const model = editor.getModel();
    if (model === null) {
      return;
    }
    const edits = [];
    const endCursorState = [];
    let endPrimaryCursor = primaryCursor;
    let lineOffset = 0;
    for (let i2 = 0, len = reducedSelections.length; i2 < len; i2++) {
      const selection = reducedSelections[i2];
      const startLineNumber = selection.startLineNumber;
      const startColumn = 1;
      let columnDeltaOffset = 0;
      let endLineNumber, endColumn;
      const selectionEndPositionOffset = model.getLineLength(selection.endLineNumber) - selection.endColumn;
      if (selection.isEmpty() || selection.startLineNumber === selection.endLineNumber) {
        const position2 = selection.getStartPosition();
        if (position2.lineNumber < model.getLineCount()) {
          endLineNumber = startLineNumber + 1;
          endColumn = model.getLineMaxColumn(endLineNumber);
        } else {
          endLineNumber = position2.lineNumber;
          endColumn = model.getLineMaxColumn(position2.lineNumber);
        }
      } else {
        endLineNumber = selection.endLineNumber;
        endColumn = model.getLineMaxColumn(endLineNumber);
      }
      let trimmedLinesContent = model.getLineContent(startLineNumber);
      for (let i3 = startLineNumber + 1; i3 <= endLineNumber; i3++) {
        const lineText = model.getLineContent(i3);
        const firstNonWhitespaceIdx = model.getLineFirstNonWhitespaceColumn(i3);
        if (firstNonWhitespaceIdx >= 1) {
          let insertSpace = true;
          if (trimmedLinesContent === "") {
            insertSpace = false;
          }
          if (insertSpace && (trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === " " || trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === "	")) {
            insertSpace = false;
            trimmedLinesContent = trimmedLinesContent.replace(/[\s\uFEFF\xA0]+$/g, " ");
          }
          const lineTextWithoutIndent = lineText.substr(firstNonWhitespaceIdx - 1);
          trimmedLinesContent += (insertSpace ? " " : "") + lineTextWithoutIndent;
          if (insertSpace) {
            columnDeltaOffset = lineTextWithoutIndent.length + 1;
          } else {
            columnDeltaOffset = lineTextWithoutIndent.length;
          }
        } else {
          columnDeltaOffset = 0;
        }
      }
      const deleteSelection = new Range2(startLineNumber, startColumn, endLineNumber, endColumn);
      if (!deleteSelection.isEmpty()) {
        let resultSelection;
        if (selection.isEmpty()) {
          edits.push(EditOperation.replace(deleteSelection, trimmedLinesContent));
          resultSelection = new Selection(deleteSelection.startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1, startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1);
        } else {
          if (selection.startLineNumber === selection.endLineNumber) {
            edits.push(EditOperation.replace(deleteSelection, trimmedLinesContent));
            resultSelection = new Selection(
              selection.startLineNumber - lineOffset,
              selection.startColumn,
              selection.endLineNumber - lineOffset,
              selection.endColumn
            );
          } else {
            edits.push(EditOperation.replace(deleteSelection, trimmedLinesContent));
            resultSelection = new Selection(
              selection.startLineNumber - lineOffset,
              selection.startColumn,
              selection.startLineNumber - lineOffset,
              trimmedLinesContent.length - selectionEndPositionOffset
            );
          }
        }
        if (Range2.intersectRanges(deleteSelection, primaryCursor) !== null) {
          endPrimaryCursor = resultSelection;
        } else {
          endCursorState.push(resultSelection);
        }
      }
      lineOffset += deleteSelection.endLineNumber - deleteSelection.startLineNumber;
    }
    endCursorState.unshift(endPrimaryCursor);
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, endCursorState);
    editor.pushUndoStop();
  }
};

var TransposeAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.transpose",
      label: localize2(1437, "Transpose Characters around the Cursor"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    const model = editor.getModel();
    if (model === null) {
      return;
    }
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      if (!selection.isEmpty()) {
        continue;
      }
      const cursor = selection.getStartPosition();
      const maxColumn = model.getLineMaxColumn(cursor.lineNumber);
      if (cursor.column >= maxColumn) {
        if (cursor.lineNumber === model.getLineCount()) {
          continue;
        }
        const deleteSelection = new Range2(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1);
        const chars = model.getValueInRange(deleteSelection).split("").reverse().join("");
        commands.push(new ReplaceCommand(new Selection(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1), chars));
      } else {
        const deleteSelection = new Range2(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber, cursor.column + 1);
        const chars = model.getValueInRange(deleteSelection).split("").reverse().join("");
        commands.push(new ReplaceCommandThatPreservesSelection(
          deleteSelection,
          chars,
          new Selection(cursor.lineNumber, cursor.column + 1, cursor.lineNumber, cursor.column + 1)
        ));
      }
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var AbstractCaseAction = class extends EditorAction {
  run(_accessor, editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    const model = editor.getModel();
    if (model === null) {
      return;
    }
    const wordSeparators2 = editor.getOption(148 /* wordSeparators */);
    const textEdits = [];
    for (const selection of selections) {
      if (selection.isEmpty()) {
        const cursor = selection.getStartPosition();
        const word = editor.getConfiguredWordAtPosition(cursor);
        if (!word) {
          continue;
        }
        const wordRange = new Range2(cursor.lineNumber, word.startColumn, cursor.lineNumber, word.endColumn);
        const text2 = model.getValueInRange(wordRange);
        textEdits.push(EditOperation.replace(wordRange, this._modifyText(text2, wordSeparators2)));
      } else {
        const text2 = model.getValueInRange(selection);
        textEdits.push(EditOperation.replace(selection, this._modifyText(text2, wordSeparators2)));
      }
    }
    editor.pushUndoStop();
    editor.executeEdits(this.id, textEdits);
    editor.pushUndoStop();
  }
};

var UpperCaseAction = class extends AbstractCaseAction {
  constructor() {
    super({
      id: "editor.action.transformToUppercase",
      label: localize2(1436, "Transform to Uppercase"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, wordSeparators2) {
    return text2.toLocaleUpperCase();
  }
};

var LowerCaseAction = class extends AbstractCaseAction {
  constructor() {
    super({
      id: "editor.action.transformToLowercase",
      label: localize2(1432, "Transform to Lowercase"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, wordSeparators2) {
    return text2.toLocaleLowerCase();
  }
};

var BackwardsCompatibleRegExp = class {
  constructor(_pattern, _flags) {
    this._pattern = _pattern;
    this._flags = _flags;
    this._actual = null;
    this._evaluated = false;
  }
  get() {
    if (!this._evaluated) {
      this._evaluated = true;
      try {
        this._actual = new RegExp(this._pattern, this._flags);
      } catch (err) {
      }
    }
    return this._actual;
  }
  isSupported() {
    return this.get() !== null;
  }
};

var TitleCaseAction = class _TitleCaseAction extends AbstractCaseAction {
  static {
    this.titleBoundary = new BackwardsCompatibleRegExp("(^|[^\\p{L}\\p{N}']|((^|\\P{L})'))\\p{L}", "gmu");
  }
  constructor() {
    super({
      id: "editor.action.transformToTitlecase",
      label: localize2(1435, "Transform to Title Case"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, wordSeparators2) {
    const titleBoundary = _TitleCaseAction.titleBoundary.get();
    if (!titleBoundary) {
      return text2;
    }
    return text2.toLocaleLowerCase().replace(titleBoundary, (b) => b.toLocaleUpperCase());
  }
};

var SnakeCaseAction = class _SnakeCaseAction extends AbstractCaseAction {
  static {
    this.caseBoundary = new BackwardsCompatibleRegExp("(\\p{Ll})(\\p{Lu})", "gmu");
  }
  static {
    this.singleLetters = new BackwardsCompatibleRegExp("(\\p{Lu}|\\p{N})(\\p{Lu})(\\p{Ll})", "gmu");
  }
  constructor() {
    super({
      id: "editor.action.transformToSnakecase",
      label: localize2(1434, "Transform to Snake Case"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, wordSeparators2) {
    const caseBoundary = _SnakeCaseAction.caseBoundary.get();
    const singleLetters = _SnakeCaseAction.singleLetters.get();
    if (!caseBoundary || !singleLetters) {
      return text2;
    }
    return text2.replace(caseBoundary, "$1_$2").replace(singleLetters, "$1_$2$3").toLocaleLowerCase();
  }
};

var CamelCaseAction = class _CamelCaseAction extends AbstractCaseAction {
  static {
    this.singleLineWordBoundary = new BackwardsCompatibleRegExp("[_\\s-]+", "gm");
  }
  static {
    this.multiLineWordBoundary = new BackwardsCompatibleRegExp("[_-]+", "gm");
  }
  static {
    this.validWordStart = new BackwardsCompatibleRegExp("^(\\p{Lu}[^\\p{Lu}])", "gmu");
  }
  constructor() {
    super({
      id: "editor.action.transformToCamelcase",
      label: localize2(1430, "Transform to Camel Case"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, wordSeparators2) {
    const wordBoundary = /\r\n|\r|\n/.test(text2) ? _CamelCaseAction.multiLineWordBoundary.get() : _CamelCaseAction.singleLineWordBoundary.get();
    const validWordStart = _CamelCaseAction.validWordStart.get();
    if (!wordBoundary || !validWordStart) {
      return text2;
    }
    const words = text2.split(wordBoundary);
    const firstWord = words.shift()?.replace(validWordStart, (start) => start.toLocaleLowerCase());
    return firstWord + words.map((word) => word.substring(0, 1).toLocaleUpperCase() + word.substring(1)).join("");
  }
};

var PascalCaseAction = class _PascalCaseAction extends AbstractCaseAction {
  static {
    this.wordBoundary = new BackwardsCompatibleRegExp("[_ \\t-]", "gm");
  }
  static {
    this.wordBoundaryToMaintain = new BackwardsCompatibleRegExp("(?<=\\.)", "gm");
  }
  static {
    this.upperCaseWordMatcher = new BackwardsCompatibleRegExp("^\\p{Lu}+$", "mu");
  }
  constructor() {
    super({
      id: "editor.action.transformToPascalcase",
      label: localize2(1433, "Transform to Pascal Case"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, wordSeparators2) {
    const wordBoundary = _PascalCaseAction.wordBoundary.get();
    const wordBoundaryToMaintain = _PascalCaseAction.wordBoundaryToMaintain.get();
    const upperCaseWordMatcher = _PascalCaseAction.upperCaseWordMatcher.get();
    if (!wordBoundary || !wordBoundaryToMaintain || !upperCaseWordMatcher) {
      return text2;
    }
    const wordsWithMaintainBoundaries = text2.split(wordBoundaryToMaintain);
    const words = wordsWithMaintainBoundaries.map((word) => word.split(wordBoundary)).flat();
    return words.map((word) => {
      const normalizedWord = word.charAt(0).toLocaleUpperCase() + word.slice(1);
      const isAllCaps = normalizedWord.length > 1 && upperCaseWordMatcher.test(normalizedWord);
      if (isAllCaps) {
        return normalizedWord.charAt(0) + normalizedWord.slice(1).toLocaleLowerCase();
      }
      return normalizedWord;
    }).join("");
  }
};

var KebabCaseAction = class _KebabCaseAction extends AbstractCaseAction {
  static isSupported() {
    const areAllRegexpsSupported = [
      this.caseBoundary,
      this.singleLetters,
      this.underscoreBoundary
    ].every((regexp2) => regexp2.isSupported());
    return areAllRegexpsSupported;
  }
  static {
    this.caseBoundary = new BackwardsCompatibleRegExp("(\\p{Ll})(\\p{Lu})", "gmu");
  }
  static {
    this.singleLetters = new BackwardsCompatibleRegExp("(\\p{Lu}|\\p{N})(\\p{Lu}\\p{Ll})", "gmu");
  }
  static {
    this.underscoreBoundary = new BackwardsCompatibleRegExp("(\\S)(_)(\\S)", "gm");
  }
  constructor() {
    super({
      id: "editor.action.transformToKebabcase",
      label: localize2(1431, "Transform to Kebab Case"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  _modifyText(text2, _) {
    const caseBoundary = _KebabCaseAction.caseBoundary.get();
    const singleLetters = _KebabCaseAction.singleLetters.get();
    const underscoreBoundary = _KebabCaseAction.underscoreBoundary.get();
    if (!caseBoundary || !singleLetters || !underscoreBoundary) {
      return text2;
    }
    return text2.replace(underscoreBoundary, "$1-$3").replace(caseBoundary, "$1-$2").replace(singleLetters, "$1-$2").toLocaleLowerCase();
  }
};

registerEditorAction(CopyLinesUpAction);

registerEditorAction(CopyLinesDownAction);

registerEditorAction(DuplicateSelectionAction);

registerEditorAction(MoveLinesUpAction);

registerEditorAction(MoveLinesDownAction);

registerEditorAction(SortLinesAscendingAction);

registerEditorAction(SortLinesDescendingAction);

registerEditorAction(DeleteDuplicateLinesAction);

registerEditorAction(TrimTrailingWhitespaceAction);

registerEditorAction(DeleteLinesAction);

registerEditorAction(IndentLinesAction);

registerEditorAction(OutdentLinesAction);

registerEditorAction(InsertLineBeforeAction);

registerEditorAction(InsertLineAfterAction);

registerEditorAction(DeleteAllLeftAction);

registerEditorAction(DeleteAllRightAction);

registerEditorAction(JoinLinesAction);

registerEditorAction(TransposeAction);

registerEditorAction(UpperCaseAction);

registerEditorAction(LowerCaseAction);

registerEditorAction(ReverseLinesAction);

if (SnakeCaseAction.caseBoundary.isSupported() && SnakeCaseAction.singleLetters.isSupported()) {
  registerEditorAction(SnakeCaseAction);
}

if (CamelCaseAction.singleLineWordBoundary.isSupported() && CamelCaseAction.multiLineWordBoundary.isSupported()) {
  registerEditorAction(CamelCaseAction);
}

if (PascalCaseAction.wordBoundary.isSupported()) {
  registerEditorAction(PascalCaseAction);
}

if (TitleCaseAction.titleBoundary.isSupported()) {
  registerEditorAction(TitleCaseAction);
}

if (KebabCaseAction.isSupported()) {
  registerEditorAction(KebabCaseAction);
}
export { AbstractCopyLinesAction, CopyLinesUpAction, CopyLinesDownAction, DuplicateSelectionAction, AbstractMoveLinesAction, MoveLinesUpAction, MoveLinesDownAction, AbstractSortLinesAction, SortLinesAscendingAction, SortLinesDescendingAction, DeleteDuplicateLinesAction, ReverseLinesAction, TrimTrailingWhitespaceAction, DeleteLinesAction, IndentLinesAction, OutdentLinesAction, InsertLineBeforeAction, InsertLineAfterAction, AbstractDeleteAllToBoundaryAction, DeleteAllLeftAction, DeleteAllRightAction, JoinLinesAction, TransposeAction, AbstractCaseAction, UpperCaseAction, LowerCaseAction, BackwardsCompatibleRegExp, TitleCaseAction, SnakeCaseAction, CamelCaseAction, PascalCaseAction, KebabCaseAction };
