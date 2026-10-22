// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands.ts
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { CELL_TITLE_CELL_GROUP_ID, NotebookCellAction, NotebookMultiCellAction, cellExecutionArgs, parseMultiCellExecutionArgs } from "./module-1845.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { moveDownIcon, moveUpIcon, splitCellIcon } from "./module-1846.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_INPUT_COLLAPSED, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_OUTPUT_COLLAPSED, NOTEBOOK_CELL_TYPE, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_OUTPUT_FOCUSED } from "./module-1844.mjs";
import { InputFocusedContext, InputFocusedContextKey } from "./module-0635.mjs";
import { changeCellToKind, computeCellLinesContents, copyCellRange, joinCellsWithSurrounds, joinSelectedCells, moveCellRange } from "./module-1976.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { ResourceNotebookCellEdit } from "./module-0943.mjs";
import { INotificationService } from "./module-0336.mjs";
import { Mimes } from "./module-0136.mjs";
import { EXPAND_CELL_INPUT_COMMAND_ID, EXPAND_CELL_OUTPUT_COMMAND_ID } from "./module-0942.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { NotebookSetting } from "./module-0911.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands.ts
var MOVE_CELL_UP_COMMAND_ID = "notebook.cell.moveUp";

var MOVE_CELL_DOWN_COMMAND_ID = "notebook.cell.moveDown";

var COPY_CELL_UP_COMMAND_ID = "notebook.cell.copyUp";

var COPY_CELL_DOWN_COMMAND_ID = "notebook.cell.copyDown";

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: MOVE_CELL_UP_COMMAND_ID,
        title: localize2(17398, "Move Cell Up"),
        icon: moveUpIcon,
        keybinding: {
          primary: 512 /* Alt */ | 16 /* UpArrow */,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, InputFocusedContext.toNegated()),
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.equals("config.notebook.dragAndDropEnabled", false),
          group: "3_edit" /* Edit */,
          order: 14
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    return moveCellRange(context2, "up");
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: MOVE_CELL_DOWN_COMMAND_ID,
        title: localize2(17397, "Move Cell Down"),
        icon: moveDownIcon,
        keybinding: {
          primary: 512 /* Alt */ | 18 /* DownArrow */,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, InputFocusedContext.toNegated()),
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.equals("config.notebook.dragAndDropEnabled", false),
          group: "3_edit" /* Edit */,
          order: 14
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    return moveCellRange(context2, "down");
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: COPY_CELL_UP_COMMAND_ID,
        title: localize2(17389, "Copy Cell Up"),
        keybinding: {
          primary: 512 /* Alt */ | 1024 /* Shift */ | 16 /* UpArrow */,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, InputFocusedContext.toNegated()),
          weight: 200 /* WorkbenchContrib */
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    return copyCellRange(context2, "up");
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: COPY_CELL_DOWN_COMMAND_ID,
        title: localize2(17388, "Copy Cell Down"),
        keybinding: {
          primary: 512 /* Alt */ | 1024 /* Shift */ | 18 /* DownArrow */,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, InputFocusedContext.toNegated()),
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE),
          group: "3_edit" /* Edit */,
          order: 13
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    return copyCellRange(context2, "down");
  }
});

var SPLIT_CELL_COMMAND_ID = "notebook.cell.split";

var JOIN_SELECTED_CELLS_COMMAND_ID = "notebook.cell.joinSelected";

var JOIN_CELL_ABOVE_COMMAND_ID = "notebook.cell.joinAbove";

var JOIN_CELL_BELOW_COMMAND_ID = "notebook.cell.joinBelow";

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: SPLIT_CELL_COMMAND_ID,
        title: localize2(17399, "Split Cell"),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_EDITABLE,
            NOTEBOOK_CELL_EDITABLE,
            NOTEBOOK_CELL_INPUT_COLLAPSED.toNegated()
          ),
          order: 5 /* SplitCell */,
          group: CELL_TITLE_CELL_GROUP_ID
        },
        icon: splitCellIcon,
        keybinding: {
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE, EditorContextKeys.editorTextFocus),
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 93 /* Backslash */),
          weight: 200 /* WorkbenchContrib */
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    if (context2.notebookEditor.isReadOnly) {
      return;
    }
    const bulkEditService = accessor.get(IBulkEditService);
    const cell = context2.cell;
    const index2 = context2.notebookEditor.getCellIndex(cell);
    const splitPoints = cell.focusMode === 0 /* Container */ ? [{ lineNumber: 1, column: 1 }] : cell.getSelectionsStartPosition();
    if (splitPoints && splitPoints.length > 0) {
      await cell.resolveTextModel();
      if (!cell.hasModel()) {
        return;
      }
      const newLinesContents = computeCellLinesContents(cell, splitPoints);
      if (newLinesContents) {
        const language2 = cell.language;
        const kind = cell.cellKind;
        const mime = cell.mime;
        const textModel = await cell.resolveTextModel();
        await bulkEditService.apply(
          [
            new ResourceTextEdit(cell.uri, { range: textModel.getFullModelRange(), text: newLinesContents[0] }),
            new ResourceNotebookCellEdit(
              context2.notebookEditor.textModel.uri,
              {
                editType: 1 /* Replace */,
                index: index2 + 1,
                count: 0,
                cells: newLinesContents.slice(1).map((line) => ({
                  cellKind: kind,
                  language: language2,
                  mime,
                  source: line,
                  outputs: [],
                  metadata: {}
                }))
              }
            )
          ],
          { quotableLabel: "Split Notebook Cell" }
        );
        context2.notebookEditor.cellAt(index2 + 1)?.updateEditState(cell.getEditState(), "splitCell");
      }
    }
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: JOIN_CELL_ABOVE_COMMAND_ID,
        title: localize2(17394, "Join With Previous Cell"),
        keybinding: {
          when: NOTEBOOK_EDITOR_FOCUSED,
          primary: 256 /* WinCtrl */ | 512 /* Alt */ | 1024 /* Shift */ | 40 /* KeyJ */,
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE),
          group: "3_edit" /* Edit */,
          order: 10
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    const bulkEditService = accessor.get(IBulkEditService);
    return joinCellsWithSurrounds(bulkEditService, context2, "above");
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: JOIN_CELL_BELOW_COMMAND_ID,
        title: localize2(17395, "Join With Next Cell"),
        keybinding: {
          when: NOTEBOOK_EDITOR_FOCUSED,
          primary: 256 /* WinCtrl */ | 512 /* Alt */ | 40 /* KeyJ */,
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE),
          group: "3_edit" /* Edit */,
          order: 11
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    const bulkEditService = accessor.get(IBulkEditService);
    return joinCellsWithSurrounds(bulkEditService, context2, "below");
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super(
      {
        id: JOIN_SELECTED_CELLS_COMMAND_ID,
        title: localize2(17396, "Join Selected Cells"),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE),
          group: "3_edit" /* Edit */,
          order: 12
        }
      }
    );
  }
  async runWithContext(accessor, context2) {
    const bulkEditService = accessor.get(IBulkEditService);
    const notificationService = accessor.get(INotificationService);
    return joinSelectedCells(bulkEditService, notificationService, context2);
  }
});

var CHANGE_CELL_TO_CODE_COMMAND_ID = "notebook.cell.changeToCode";

var CHANGE_CELL_TO_MARKDOWN_COMMAND_ID = "notebook.cell.changeToMarkdown";

registerAction2(class ChangeCellToCodeAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: CHANGE_CELL_TO_CODE_COMMAND_ID,
      title: localize2(17382, "Change Cell to Code"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey), NOTEBOOK_OUTPUT_FOCUSED.toNegated()),
        primary: 55 /* KeyY */,
        weight: 200 /* WorkbenchContrib */
      },
      precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_CELL_TYPE.isEqualTo("markup")),
      menu: {
        id: MenuId.NotebookCellTitle,
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_TYPE.isEqualTo("markup")),
        group: "3_edit" /* Edit */
      }
    });
  }
  async runWithContext(accessor, context2) {
    await changeCellToKind(2 /* Code */, context2);
  }
});

registerAction2(class ChangeCellToMarkdownAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: CHANGE_CELL_TO_MARKDOWN_COMMAND_ID,
      title: localize2(17383, "Change Cell to Markdown"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey), NOTEBOOK_OUTPUT_FOCUSED.toNegated()),
        primary: 43 /* KeyM */,
        weight: 200 /* WorkbenchContrib */
      },
      precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_CELL_TYPE.isEqualTo("code")),
      menu: {
        id: MenuId.NotebookCellTitle,
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_TYPE.isEqualTo("code")),
        group: "3_edit" /* Edit */
      }
    });
  }
  async runWithContext(accessor, context2) {
    await changeCellToKind(1 /* Markup */, context2, "markdown", Mimes.markdown);
  }
});

var COLLAPSE_CELL_INPUT_COMMAND_ID = "notebook.cell.collapseCellInput";

var COLLAPSE_CELL_OUTPUT_COMMAND_ID = "notebook.cell.collapseCellOutput";

var COLLAPSE_ALL_CELL_INPUTS_COMMAND_ID = "notebook.cell.collapseAllCellInputs";

var EXPAND_ALL_CELL_INPUTS_COMMAND_ID = "notebook.cell.expandAllCellInputs";

var COLLAPSE_ALL_CELL_OUTPUTS_COMMAND_ID = "notebook.cell.collapseAllCellOutputs";

var EXPAND_ALL_CELL_OUTPUTS_COMMAND_ID = "notebook.cell.expandAllCellOutputs";

var TOGGLE_CELL_OUTPUTS_COMMAND_ID = "notebook.cell.toggleOutputs";

var TOGGLE_CELL_OUTPUT_SCROLLING = "notebook.cell.toggleOutputScrolling";

registerAction2(class CollapseCellInputAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: COLLAPSE_CELL_INPUT_COMMAND_ID,
      title: localize2(17386, "Collapse Cell Input"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_INPUT_COLLAPSED.toNegated(), InputFocusedContext.toNegated()),
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 33 /* KeyC */),
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    if (context2.ui) {
      context2.cell.isInputCollapsed = true;
    } else {
      context2.selectedCells.forEach((cell) => cell.isInputCollapsed = true);
    }
  }
});

registerAction2(class ExpandCellInputAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXPAND_CELL_INPUT_COMMAND_ID,
      title: localize2(17392, "Expand Cell Input"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_INPUT_COLLAPSED),
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 33 /* KeyC */),
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    if (context2.ui) {
      context2.cell.isInputCollapsed = false;
    } else {
      context2.selectedCells.forEach((cell) => cell.isInputCollapsed = false);
    }
  }
});

registerAction2(class CollapseCellOutputAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: COLLAPSE_CELL_OUTPUT_COMMAND_ID,
      title: localize2(17387, "Collapse Cell Output"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_OUTPUT_COLLAPSED.toNegated(), InputFocusedContext.toNegated(), NOTEBOOK_CELL_HAS_OUTPUTS),
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 50 /* KeyT */),
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    if (context2.ui) {
      context2.cell.isOutputCollapsed = true;
    } else {
      context2.selectedCells.forEach((cell) => cell.isOutputCollapsed = true);
    }
  }
});

registerAction2(class ExpandCellOuputAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXPAND_CELL_OUTPUT_COMMAND_ID,
      title: localize2(17393, "Expand Cell Output"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_OUTPUT_COLLAPSED),
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 50 /* KeyT */),
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    if (context2.ui) {
      context2.cell.isOutputCollapsed = false;
    } else {
      context2.selectedCells.forEach((cell) => cell.isOutputCollapsed = false);
    }
  }
});

registerAction2(class extends NotebookMultiCellAction {
  constructor() {
    super({
      id: TOGGLE_CELL_OUTPUTS_COMMAND_ID,
      precondition: NOTEBOOK_CELL_LIST_FOCUSED,
      title: localize2(17400, "Toggle Outputs"),
      metadata: {
        description: localize(17401, null),
        args: cellExecutionArgs
      }
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    let cells = [];
    if (context2.ui) {
      cells = [context2.cell];
    } else if (context2.selectedCells) {
      cells = context2.selectedCells;
    }
    for (const cell of cells) {
      cell.isOutputCollapsed = !cell.isOutputCollapsed;
    }
  }
});

registerAction2(class CollapseAllCellInputsAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: COLLAPSE_ALL_CELL_INPUTS_COMMAND_ID,
      title: localize2(17384, "Collapse All Cell Inputs"),
      f1: true
    });
  }
  async runWithContext(accessor, context2) {
    forEachCell(context2.notebookEditor, (cell) => cell.isInputCollapsed = true);
  }
});

registerAction2(class ExpandAllCellInputsAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXPAND_ALL_CELL_INPUTS_COMMAND_ID,
      title: localize2(17390, "Expand All Cell Inputs"),
      f1: true
    });
  }
  async runWithContext(accessor, context2) {
    forEachCell(context2.notebookEditor, (cell) => cell.isInputCollapsed = false);
  }
});

registerAction2(class CollapseAllCellOutputsAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: COLLAPSE_ALL_CELL_OUTPUTS_COMMAND_ID,
      title: localize2(17385, "Collapse All Cell Outputs"),
      f1: true
    });
  }
  async runWithContext(accessor, context2) {
    forEachCell(context2.notebookEditor, (cell) => cell.isOutputCollapsed = true);
  }
});

registerAction2(class ExpandAllCellOutputsAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXPAND_ALL_CELL_OUTPUTS_COMMAND_ID,
      title: localize2(17391, "Expand All Cell Outputs"),
      f1: true
    });
  }
  async runWithContext(accessor, context2) {
    forEachCell(context2.notebookEditor, (cell) => cell.isOutputCollapsed = false);
  }
});

registerAction2(class ToggleCellOutputScrolling extends NotebookMultiCellAction {
  constructor() {
    super({
      id: TOGGLE_CELL_OUTPUT_SCROLLING,
      title: localize2(17402, "Toggle Scroll Cell Output"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, InputFocusedContext.toNegated(), NOTEBOOK_CELL_HAS_OUTPUTS),
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 55 /* KeyY */),
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  toggleOutputScrolling(viewModel, globalScrollSetting, collapsed2) {
    const cellMetadata = viewModel.model.metadata;
    if (cellMetadata) {
      const currentlyEnabled = cellMetadata["scrollable"] !== void 0 ? cellMetadata["scrollable"] : globalScrollSetting;
      const shouldEnableScrolling = collapsed2 || !currentlyEnabled;
      cellMetadata["scrollable"] = shouldEnableScrolling;
      viewModel.resetRenderer();
    }
  }
  async runWithContext(accessor, context2) {
    const globalScrolling = accessor.get(IConfigurationService).getValue(NotebookSetting.outputScrolling);
    if (context2.ui) {
      context2.cell.outputsViewModels.forEach((viewModel) => {
        this.toggleOutputScrolling(viewModel, globalScrolling, context2.cell.isOutputCollapsed);
      });
      context2.cell.isOutputCollapsed = false;
    } else {
      context2.selectedCells.forEach((cell) => {
        cell.outputsViewModels.forEach((viewModel) => {
          this.toggleOutputScrolling(viewModel, globalScrolling, cell.isOutputCollapsed);
        });
        cell.isOutputCollapsed = false;
      });
    }
  }
});

function forEachCell(editor, callback) {
  for (let i2 = 0; i2 < editor.getLength(); i2++) {
    const cell = editor.cellAt(i2);
    callback(cell, i2);
  }
}
export { forEachCell, MOVE_CELL_UP_COMMAND_ID, MOVE_CELL_DOWN_COMMAND_ID, COPY_CELL_UP_COMMAND_ID, COPY_CELL_DOWN_COMMAND_ID, SPLIT_CELL_COMMAND_ID, JOIN_SELECTED_CELLS_COMMAND_ID, JOIN_CELL_ABOVE_COMMAND_ID, JOIN_CELL_BELOW_COMMAND_ID, CHANGE_CELL_TO_CODE_COMMAND_ID, CHANGE_CELL_TO_MARKDOWN_COMMAND_ID, COLLAPSE_CELL_INPUT_COMMAND_ID, COLLAPSE_CELL_OUTPUT_COMMAND_ID, COLLAPSE_ALL_CELL_INPUTS_COMMAND_ID, EXPAND_ALL_CELL_INPUTS_COMMAND_ID, COLLAPSE_ALL_CELL_OUTPUTS_COMMAND_ID, EXPAND_ALL_CELL_OUTPUTS_COMMAND_ID, TOGGLE_CELL_OUTPUTS_COMMAND_ID, TOGGLE_CELL_OUTPUT_SCROLLING };
