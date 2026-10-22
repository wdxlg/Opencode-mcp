// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/executeActions.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_EXECUTING, NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_TYPE, NOTEBOOK_HAS_RUNNING_CELL, NOTEBOOK_HAS_SOMETHING_RUNNING, NOTEBOOK_INTERRUPTIBLE_KERNEL, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_KERNEL_COUNT, NOTEBOOK_KERNEL_SOURCE_COUNT, NOTEBOOK_LAST_CELL_FAILED, NOTEBOOK_MISSING_KERNEL_EXTENSION } from "./module-1844.mjs";
import { Iterable } from "./module-0011.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { CodeCellViewModel } from "./module-1877.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CELL_TITLE_CELL_GROUP_ID, NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, NotebookAction, NotebookCellAction, NotebookMultiCellAction, cellExecutionArgs, getContextFromActiveEditor, getContextFromUri, parseMultiCellExecutionArgs } from "./module-1845.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { errorStateIcon, executeAboveIcon, executeAllIcon, executeBelowIcon, executeIcon, executingStateIcon, stopIcon } from "./module-1846.mjs";
import { IEditorService } from "./module-0935.mjs";
import { NotebookEditorInput } from "./module-0940.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { EXECUTE_CELL_COMMAND_ID } from "./module-0942.mjs";
import { CellUri, NotebookSetting } from "./module-0911.mjs";
import { CTX_INLINE_CHAT_FOCUSED } from "./module-1978.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { insertCell } from "./module-1976.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { IDebugService } from "./module-1058.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/executeActions.ts
var EXECUTE_NOTEBOOK_COMMAND_ID = "notebook.execute";

var CANCEL_NOTEBOOK_COMMAND_ID = "notebook.cancelExecution";

var INTERRUPT_NOTEBOOK_COMMAND_ID = "notebook.interruptExecution";

var CANCEL_CELL_COMMAND_ID = "notebook.cell.cancelExecution";

var EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID = "notebook.cell.executeAndFocusContainer";

var EXECUTE_CELL_SELECT_BELOW = "notebook.cell.executeAndSelectBelow";

var EXECUTE_CELL_INSERT_BELOW = "notebook.cell.executeAndInsertBelow";

var EXECUTE_CELL_AND_BELOW = "notebook.cell.executeCellAndBelow";

var EXECUTE_CELLS_ABOVE = "notebook.cell.executeCellsAbove";

var RENDER_ALL_MARKDOWN_CELLS = "notebook.renderAllMarkdownCells";

var REVEAL_RUNNING_CELL = "notebook.revealRunningCell";

var REVEAL_LAST_FAILED_CELL = "notebook.revealLastFailedCell";

var executeCondition = ContextKeyExpr.and(
  NOTEBOOK_CELL_TYPE.isEqualTo("code"),
  ContextKeyExpr.or(
    ContextKeyExpr.greater(NOTEBOOK_KERNEL_COUNT.key, 0),
    ContextKeyExpr.greater(NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0),
    NOTEBOOK_MISSING_KERNEL_EXTENSION
  )
);

var executeThisCellCondition = ContextKeyExpr.and(
  executeCondition,
  NOTEBOOK_CELL_EXECUTING.toNegated()
);

var executeSectionCondition = ContextKeyExpr.and(
  NOTEBOOK_CELL_TYPE.isEqualTo("markup")
);

function renderAllMarkdownCells(context2) {
  for (let i2 = 0; i2 < context2.notebookEditor.getLength(); i2++) {
    const cell = context2.notebookEditor.cellAt(i2);
    if (cell.cellKind === 1 /* Markup */) {
      cell.updateEditState(0 /* Preview */, "renderAllMarkdownCells");
    }
  }
}

async function runCell(editorGroupsService, context2, editorService) {
  const group2 = editorGroupsService.activeGroup;
  if (group2) {
    if (group2.activeEditor) {
      group2.pinEditor(group2.activeEditor);
    }
  }
  if (context2.autoReveal && (context2.cell || context2.selectedCells?.length) && editorService) {
    editorService.openEditor({ resource: context2.notebookEditor.textModel.uri, options: { revealIfOpened: true } });
  }
  if (context2.ui && context2.cell) {
    if (context2.autoReveal) {
      handleAutoReveal(context2.cell, context2.notebookEditor);
    }
    await context2.notebookEditor.executeNotebookCells(Iterable.single(context2.cell));
  } else if (context2.selectedCells?.length || context2.cell) {
    const selectedCells = context2.selectedCells?.length ? context2.selectedCells : [context2.cell];
    const firstCell = selectedCells[0];
    if (firstCell && context2.autoReveal) {
      handleAutoReveal(firstCell, context2.notebookEditor);
    }
    await context2.notebookEditor.executeNotebookCells(selectedCells);
  }
  let foundEditor = void 0;
  for (const [, codeEditor] of context2.notebookEditor.codeEditors) {
    if (isEqual2(codeEditor.getModel()?.uri, (context2.cell ?? context2.selectedCells?.[0])?.uri)) {
      foundEditor = codeEditor;
      break;
    }
  }
  if (!foundEditor) {
    return;
  }
}

var SMART_VIEWPORT_TOP_REVEAL_PADDING = 20;

var SMART_VIEWPORT_BOTTOM_REVEAL_PADDING = 60;

function handleAutoReveal(cell, notebookEditor) {
  notebookEditor.focusNotebookCell(cell, "container", { skipReveal: true });
  if (cell.cellKind === 1 /* Markup */) {
    const cellIndex = notebookEditor.getCellIndex(cell);
    notebookEditor.revealCellRangeInView({ start: cellIndex, end: cellIndex + 1 });
    return;
  }
  if (!(cell instanceof CodeCellViewModel)) {
    return;
  }
  const cellEditorScrollTop = notebookEditor.getAbsoluteTopOfElement(cell);
  const cellEditorScrollBottom = cellEditorScrollTop + cell.layoutInfo.outputContainerOffset;
  const cellOutputHeight = cell.layoutInfo.outputTotalHeight;
  const cellOutputScrollBottom = notebookEditor.getAbsoluteBottomOfElement(cell);
  const viewportHeight = notebookEditor.getLayoutInfo().height;
  const viewportHeight34 = viewportHeight * 0.34;
  const viewportHeight66 = viewportHeight * 0.66;
  const totalHeight = cell.layoutInfo.totalHeight;
  const isFullyVisible = cellEditorScrollTop >= notebookEditor.scrollTop && cellOutputScrollBottom <= notebookEditor.scrollBottom;
  const isEditorBottomVisible = cellEditorScrollBottom - 25 >= notebookEditor.scrollTop && cellEditorScrollBottom + 25 <= notebookEditor.scrollBottom;
  const revealWithTopPadding = (position2) => {
    notebookEditor.setScrollTop(position2 - SMART_VIEWPORT_TOP_REVEAL_PADDING);
  };
  const revealWithNoPadding = (position2) => {
    notebookEditor.setScrollTop(position2);
  };
  const revealWithBottomPadding = (position2) => {
    notebookEditor.setScrollTop(position2 + SMART_VIEWPORT_BOTTOM_REVEAL_PADDING);
  };
  if (isFullyVisible) {
    return;
  }
  if (totalHeight <= viewportHeight && !isEditorBottomVisible) {
    revealWithTopPadding(cellEditorScrollTop);
    return;
  }
  if (totalHeight > viewportHeight && !isEditorBottomVisible) {
    if (cellOutputHeight > 0 && cellOutputHeight >= viewportHeight66) {
      revealWithNoPadding(cellEditorScrollBottom - viewportHeight34);
    } else if (cellOutputHeight > 0) {
      revealWithBottomPadding(cellOutputScrollBottom - viewportHeight);
    } else {
      revealWithNoPadding(cellEditorScrollBottom - viewportHeight66);
    }
  }
}

registerAction2(class RenderAllMarkdownCellsAction extends NotebookAction {
  constructor() {
    super({
      id: RENDER_ALL_MARKDOWN_CELLS,
      title: localize(17573, null)
    });
  }
  async runWithContext(accessor, context2) {
    renderAllMarkdownCells(context2);
  }
});

registerAction2(class ExecuteNotebookAction extends NotebookAction {
  constructor() {
    super({
      id: EXECUTE_NOTEBOOK_COMMAND_ID,
      title: localize(17571, null),
      icon: executeAllIcon,
      metadata: {
        description: localize(17571, null),
        args: [
          {
            name: "uri",
            description: "The document uri"
          }
        ]
      },
      menu: [
        {
          id: MenuId.EditorTitle,
          order: -1,
          group: "navigation",
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            ContextKeyExpr.or(NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), NOTEBOOK_HAS_SOMETHING_RUNNING.toNegated()),
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
          )
        },
        {
          id: MenuId.NotebookToolbar,
          order: -1,
          group: "navigation/execute",
          when: ContextKeyExpr.and(
            ContextKeyExpr.or(
              NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(),
              NOTEBOOK_HAS_SOMETHING_RUNNING.toNegated()
            ),
            ContextKeyExpr.and(NOTEBOOK_HAS_SOMETHING_RUNNING, NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated())?.negate(),
            ContextKeyExpr.equals("config.notebook.globalToolbar", true)
          )
        }
      ]
    });
  }
  getEditorContextFromArgsOrActive(accessor, context2) {
    return getContextFromUri(accessor, context2) ?? getContextFromActiveEditor(accessor.get(IEditorService));
  }
  async runWithContext(accessor, context2) {
    renderAllMarkdownCells(context2);
    const editorService = accessor.get(IEditorService);
    const editor = editorService.findEditors({
      resource: context2.notebookEditor.textModel.uri,
      typeId: NotebookEditorInput.ID,
      editorId: context2.notebookEditor.textModel.viewType
    }).at(0);
    const editorGroupService = accessor.get(IEditorGroupsService);
    if (editor) {
      const group2 = editorGroupService.getGroup(editor.groupId);
      group2?.pinEditor(editor.editor);
    }
    return context2.notebookEditor.executeNotebookCells();
  }
});

registerAction2(class ExecuteCell extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXECUTE_CELL_COMMAND_ID,
      precondition: executeThisCellCondition,
      title: localize(17565, null),
      keybinding: {
        when: NOTEBOOK_CELL_LIST_FOCUSED,
        primary: 256 /* WinCtrl */ | 3 /* Enter */,
        win: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */
        },
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      },
      menu: {
        id: MenuId.NotebookCellExecutePrimary,
        when: executeThisCellCondition,
        group: "inline"
      },
      metadata: {
        description: localize(17565, null),
        args: cellExecutionArgs
      },
      icon: executeIcon
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    if (context2.ui) {
      await context2.notebookEditor.focusNotebookCell(context2.cell, "container", { skipReveal: true });
    }
    await runCell(editorGroupsService, context2, editorService);
  }
});

registerAction2(class ExecuteAboveCells extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXECUTE_CELLS_ABOVE,
      precondition: executeCondition,
      title: localize(17566, null),
      menu: [
        {
          id: MenuId.NotebookCellExecute,
          when: ContextKeyExpr.and(
            executeCondition,
            ContextKeyExpr.equals(`config.${NotebookSetting.consolidatedRunButton}`, true)
          )
        },
        {
          id: MenuId.NotebookCellTitle,
          order: 2 /* ExecuteAboveCells */,
          group: CELL_TITLE_CELL_GROUP_ID,
          when: ContextKeyExpr.and(
            executeCondition,
            ContextKeyExpr.equals(`config.${NotebookSetting.consolidatedRunButton}`, false)
          )
        }
      ],
      icon: executeAboveIcon
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    let endCellIdx = void 0;
    if (context2.ui) {
      endCellIdx = context2.notebookEditor.getCellIndex(context2.cell);
      await context2.notebookEditor.focusNotebookCell(context2.cell, "container", { skipReveal: true });
    } else {
      endCellIdx = Math.min(...context2.selectedCells.map((cell) => context2.notebookEditor.getCellIndex(cell)));
    }
    if (typeof endCellIdx === "number") {
      const range2 = { start: 0, end: endCellIdx };
      const cells = context2.notebookEditor.getCellsInRange(range2);
      context2.notebookEditor.executeNotebookCells(cells);
    }
  }
});

registerAction2(class ExecuteCellAndBelow extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXECUTE_CELL_AND_BELOW,
      precondition: executeCondition,
      title: localize(17570, null),
      menu: [
        {
          id: MenuId.NotebookCellExecute,
          when: ContextKeyExpr.and(
            executeCondition,
            ContextKeyExpr.equals(`config.${NotebookSetting.consolidatedRunButton}`, true)
          )
        },
        {
          id: MenuId.NotebookCellTitle,
          order: 3 /* ExecuteCellAndBelow */,
          group: CELL_TITLE_CELL_GROUP_ID,
          when: ContextKeyExpr.and(
            executeCondition,
            ContextKeyExpr.equals(`config.${NotebookSetting.consolidatedRunButton}`, false)
          )
        }
      ],
      icon: executeBelowIcon
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    let startCellIdx = void 0;
    if (context2.ui) {
      startCellIdx = context2.notebookEditor.getCellIndex(context2.cell);
      await context2.notebookEditor.focusNotebookCell(context2.cell, "container", { skipReveal: true });
    } else {
      startCellIdx = Math.min(...context2.selectedCells.map((cell) => context2.notebookEditor.getCellIndex(cell)));
    }
    if (typeof startCellIdx === "number") {
      const range2 = { start: startCellIdx, end: context2.notebookEditor.getLength() };
      const cells = context2.notebookEditor.getCellsInRange(range2);
      context2.notebookEditor.executeNotebookCells(cells);
    }
  }
});

registerAction2(class ExecuteCellFocusContainer extends NotebookMultiCellAction {
  constructor() {
    super({
      id: EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID,
      precondition: executeThisCellCondition,
      title: localize(17567, null),
      metadata: {
        description: localize(17567, null),
        args: cellExecutionArgs
      },
      icon: executeIcon
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    if (context2.ui) {
      await context2.notebookEditor.focusNotebookCell(context2.cell, "container", { skipReveal: true });
    } else {
      const firstCell = context2.selectedCells[0];
      if (firstCell) {
        await context2.notebookEditor.focusNotebookCell(firstCell, "container", { skipReveal: true });
      }
    }
    await runCell(editorGroupsService, context2, editorService);
  }
});

var cellCancelCondition = ContextKeyExpr.or(
  ContextKeyExpr.equals(NOTEBOOK_CELL_EXECUTION_STATE.key, "executing"),
  ContextKeyExpr.equals(NOTEBOOK_CELL_EXECUTION_STATE.key, "pending")
);

registerAction2(class CancelExecuteCell extends NotebookMultiCellAction {
  constructor() {
    super({
      id: CANCEL_CELL_COMMAND_ID,
      precondition: cellCancelCondition,
      title: localize(17563, null),
      icon: stopIcon,
      menu: {
        id: MenuId.NotebookCellExecutePrimary,
        when: cellCancelCondition,
        group: "inline"
      },
      metadata: {
        description: localize(17563, null),
        args: [
          {
            name: "options",
            description: "The cell range options",
            schema: {
              "type": "object",
              "required": ["ranges"],
              "properties": {
                "ranges": {
                  "type": "array",
                  items: [
                    {
                      "type": "object",
                      "required": ["start", "end"],
                      "properties": {
                        "start": {
                          "type": "number"
                        },
                        "end": {
                          "type": "number"
                        }
                      }
                    }
                  ]
                },
                "document": {
                  "type": "object",
                  "description": "The document uri"
                }
              }
            }
          }
        ]
      }
    });
  }
  parseArgs(accessor, ...args2) {
    return parseMultiCellExecutionArgs(accessor, ...args2);
  }
  async runWithContext(accessor, context2) {
    if (context2.ui) {
      await context2.notebookEditor.focusNotebookCell(context2.cell, "container", { skipReveal: true });
      return context2.notebookEditor.cancelNotebookCells(Iterable.single(context2.cell));
    } else {
      return context2.notebookEditor.cancelNotebookCells(context2.selectedCells);
    }
  }
});

registerAction2(class ExecuteCellSelectBelow extends NotebookCellAction {
  constructor() {
    super({
      id: EXECUTE_CELL_SELECT_BELOW,
      precondition: ContextKeyExpr.or(executeThisCellCondition, NOTEBOOK_CELL_TYPE.isEqualTo("markup")),
      title: localize(17569, null),
      keybinding: {
        when: ContextKeyExpr.and(
          NOTEBOOK_CELL_LIST_FOCUSED,
          CTX_INLINE_CHAT_FOCUSED.negate()
        ),
        primary: 1024 /* Shift */ | 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    const idx = context2.notebookEditor.getCellIndex(context2.cell);
    if (typeof idx !== "number") {
      return;
    }
    const languageService = accessor.get(ILanguageService);
    const config = accessor.get(IConfigurationService);
    const scrollBehavior = config.getValue(NotebookSetting.scrollToRevealCell);
    let focusOptions;
    if (scrollBehavior === "none") {
      focusOptions = { skipReveal: true };
    } else {
      focusOptions = {
        revealBehavior: scrollBehavior === "fullCell" ? 0 /* fullCell */ : 1 /* firstLine */
      };
    }
    if (context2.cell.cellKind === 1 /* Markup */) {
      const nextCell = context2.notebookEditor.cellAt(idx + 1);
      context2.cell.updateEditState(0 /* Preview */, EXECUTE_CELL_SELECT_BELOW);
      if (nextCell) {
        await context2.notebookEditor.focusNotebookCell(nextCell, "container", focusOptions);
      } else {
        const newCell = insertCell(languageService, context2.notebookEditor, idx, 1 /* Markup */, "below");
        if (newCell) {
          await context2.notebookEditor.focusNotebookCell(newCell, "editor", focusOptions);
        }
      }
      return;
    } else {
      const nextCell = context2.notebookEditor.cellAt(idx + 1);
      if (nextCell) {
        await context2.notebookEditor.focusNotebookCell(nextCell, "container", focusOptions);
      } else {
        const newCell = insertCell(languageService, context2.notebookEditor, idx, 2 /* Code */, "below");
        if (newCell) {
          await context2.notebookEditor.focusNotebookCell(newCell, "editor", focusOptions);
        }
      }
      return runCell(editorGroupsService, context2, editorService);
    }
  }
});

registerAction2(class ExecuteCellInsertBelow extends NotebookCellAction {
  constructor() {
    super({
      id: EXECUTE_CELL_INSERT_BELOW,
      precondition: ContextKeyExpr.or(executeThisCellCondition, NOTEBOOK_CELL_TYPE.isEqualTo("markup")),
      title: localize(17568, null),
      keybinding: {
        when: NOTEBOOK_CELL_LIST_FOCUSED,
        primary: 512 /* Alt */ | 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    const idx = context2.notebookEditor.getCellIndex(context2.cell);
    const languageService = accessor.get(ILanguageService);
    const newFocusMode = context2.cell.focusMode === 1 /* Editor */ ? "editor" : "container";
    const newCell = insertCell(languageService, context2.notebookEditor, idx, context2.cell.cellKind, "below");
    if (newCell) {
      await context2.notebookEditor.focusNotebookCell(newCell, newFocusMode);
    }
    if (context2.cell.cellKind === 1 /* Markup */) {
      context2.cell.updateEditState(0 /* Preview */, EXECUTE_CELL_INSERT_BELOW);
    } else {
      runCell(editorGroupsService, context2, editorService);
    }
  }
});

var CancelNotebook = class extends NotebookAction {
  getEditorContextFromArgsOrActive(accessor, context2) {
    return getContextFromUri(accessor, context2) ?? getContextFromActiveEditor(accessor.get(IEditorService));
  }
  async runWithContext(accessor, context2) {
    return context2.notebookEditor.cancelNotebookCells();
  }
};

registerAction2(class CancelAllNotebook extends CancelNotebook {
  constructor() {
    super({
      id: CANCEL_NOTEBOOK_COMMAND_ID,
      title: localize2(17564, "Stop Execution"),
      icon: stopIcon,
      menu: [
        {
          id: MenuId.EditorTitle,
          order: -1,
          group: "navigation",
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_HAS_SOMETHING_RUNNING,
            NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(),
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
          )
        },
        {
          id: MenuId.NotebookToolbar,
          order: -1,
          group: "navigation/execute",
          when: ContextKeyExpr.and(
            NOTEBOOK_HAS_SOMETHING_RUNNING,
            NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(),
            ContextKeyExpr.equals("config.notebook.globalToolbar", true)
          )
        }
      ]
    });
  }
});

registerAction2(class InterruptNotebook extends CancelNotebook {
  constructor() {
    super({
      id: INTERRUPT_NOTEBOOK_COMMAND_ID,
      title: localize2(17572, "Interrupt"),
      precondition: ContextKeyExpr.and(
        NOTEBOOK_HAS_SOMETHING_RUNNING,
        NOTEBOOK_INTERRUPTIBLE_KERNEL
      ),
      icon: stopIcon,
      menu: [
        {
          id: MenuId.EditorTitle,
          order: -1,
          group: "navigation",
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_HAS_SOMETHING_RUNNING,
            NOTEBOOK_INTERRUPTIBLE_KERNEL,
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
          )
        },
        {
          id: MenuId.NotebookToolbar,
          order: -1,
          group: "navigation/execute",
          when: ContextKeyExpr.and(
            NOTEBOOK_HAS_SOMETHING_RUNNING,
            NOTEBOOK_INTERRUPTIBLE_KERNEL,
            ContextKeyExpr.equals("config.notebook.globalToolbar", true)
          )
        },
        {
          id: MenuId.InteractiveToolbar,
          group: "navigation/execute"
        }
      ]
    });
  }
});

MenuRegistry.appendMenuItem(MenuId.NotebookToolbar, {
  title: localize(17577, null),
  submenu: MenuId.NotebookCellExecuteGoTo,
  group: "navigation/execute",
  order: 20,
  icon: ThemeIcon.modify(executingStateIcon, "spin")
});

registerAction2(class RevealRunningCellAction extends NotebookAction {
  constructor() {
    super({
      id: REVEAL_RUNNING_CELL,
      title: localize(17576, null),
      tooltip: localize(17576, null),
      shortTitle: localize(17576, null),
      precondition: NOTEBOOK_HAS_RUNNING_CELL,
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_HAS_RUNNING_CELL,
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
          ),
          group: "navigation",
          order: 0
        },
        {
          id: MenuId.NotebookCellExecuteGoTo,
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_HAS_RUNNING_CELL,
            ContextKeyExpr.equals("config.notebook.globalToolbar", true)
          ),
          group: "navigation/execute",
          order: 20
        },
        {
          id: MenuId.InteractiveToolbar,
          when: ContextKeyExpr.and(
            NOTEBOOK_HAS_RUNNING_CELL,
            ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive")
          ),
          group: "navigation",
          order: 10
        }
      ],
      icon: ThemeIcon.modify(executingStateIcon, "spin")
    });
  }
  async runWithContext(accessor, context2) {
    const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
    const notebook = context2.notebookEditor.textModel.uri;
    const executingCells = notebookExecutionStateService.getCellExecutionsForNotebook(notebook);
    if (executingCells[0]) {
      const topStackFrameCell = this.findCellAtTopFrame(accessor, notebook);
      const focusHandle = topStackFrameCell ?? executingCells[0].cellHandle;
      const cell = context2.notebookEditor.getCellByHandle(focusHandle);
      if (cell) {
        context2.notebookEditor.focusNotebookCell(cell, "container");
      }
    }
  }
  findCellAtTopFrame(accessor, notebook) {
    const debugService = accessor.get(IDebugService);
    for (const session of debugService.getModel().getSessions()) {
      for (const thread of session.getAllThreads()) {
        const sf = thread.getTopStackFrame();
        if (sf) {
          const parsed = CellUri.parse(sf.source.uri);
          if (parsed && parsed.notebook.toString() === notebook.toString()) {
            return parsed.handle;
          }
        }
      }
    }
    return void 0;
  }
});

registerAction2(class RevealLastFailedCellAction extends NotebookAction {
  constructor() {
    super({
      id: REVEAL_LAST_FAILED_CELL,
      title: localize(17574, null),
      tooltip: localize(17574, null),
      shortTitle: localize(17575, null),
      precondition: NOTEBOOK_LAST_CELL_FAILED,
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_LAST_CELL_FAILED,
            NOTEBOOK_HAS_RUNNING_CELL.toNegated(),
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
          ),
          group: "navigation",
          order: 0
        },
        {
          id: MenuId.NotebookCellExecuteGoTo,
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_LAST_CELL_FAILED,
            NOTEBOOK_HAS_RUNNING_CELL.toNegated(),
            ContextKeyExpr.equals("config.notebook.globalToolbar", true)
          ),
          group: "navigation/execute",
          order: 20
        }
      ],
      icon: errorStateIcon
    });
  }
  async runWithContext(accessor, context2) {
    const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
    const notebook = context2.notebookEditor.textModel.uri;
    const lastFailedCellHandle = notebookExecutionStateService.getLastFailedCellForNotebook(notebook);
    if (lastFailedCellHandle !== void 0) {
      const lastFailedCell = context2.notebookEditor.getCellByHandle(lastFailedCellHandle);
      if (lastFailedCell) {
        context2.notebookEditor.focusNotebookCell(lastFailedCell, "container");
      }
    }
  }
});
export { renderAllMarkdownCells, runCell, handleAutoReveal, EXECUTE_NOTEBOOK_COMMAND_ID, CANCEL_NOTEBOOK_COMMAND_ID, INTERRUPT_NOTEBOOK_COMMAND_ID, CANCEL_CELL_COMMAND_ID, EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID, EXECUTE_CELL_SELECT_BELOW, EXECUTE_CELL_INSERT_BELOW, EXECUTE_CELL_AND_BELOW, EXECUTE_CELLS_ABOVE, RENDER_ALL_MARKDOWN_CELLS, REVEAL_RUNNING_CELL, REVEAL_LAST_FAILED_CELL, executeCondition, executeThisCellCondition, executeSectionCondition, SMART_VIEWPORT_TOP_REVEAL_PADDING, SMART_VIEWPORT_BOTTOM_REVEAL_PADDING, cellCancelCondition, CancelNotebook };
