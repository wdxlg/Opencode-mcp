// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/coreActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { cellRangeToViewCells, getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Action2, MenuId, MenuRegistry } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_KERNEL_COUNT, NOTEBOOK_KERNEL_SOURCE_COUNT, REPL_NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1844.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { isEditorCommandsContext } from "./module-0926.mjs";
import { isICellRange } from "./module-0941.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/coreActions.ts
var SELECT_KERNEL_ID = "_notebook.selectKernel";

var NOTEBOOK_ACTIONS_CATEGORY = localize2(17536, "Notebook");

var CELL_TITLE_CELL_GROUP_ID = "inline/cell";

var CELL_TITLE_OUTPUT_GROUP_ID = "inline/output";

var NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = 100 /* EditorContrib */;

var NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT = 200 /* WorkbenchContrib */ + 1;

function getContextFromActiveEditor(editorService) {
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor || !editor.hasModel()) {
    return;
  }
  const activeCell = editor.getActiveCell();
  const selectedCells = editor.getSelectionViewModels();
  return {
    cell: activeCell,
    selectedCells,
    notebookEditor: editor
  };
}

function getWidgetFromUri(accessor, uri4) {
  const notebookEditorService = accessor.get(INotebookEditorService);
  const widget = notebookEditorService.listNotebookEditors().find((widget2) => widget2.hasModel() && widget2.textModel.uri.toString() === uri4.toString());
  if (widget && widget.hasModel()) {
    return widget;
  }
  return void 0;
}

function getContextFromUri(accessor, context2) {
  const uri4 = URI.revive(context2);
  if (uri4) {
    const widget = getWidgetFromUri(accessor, uri4);
    if (widget) {
      return {
        notebookEditor: widget
      };
    }
  }
  return void 0;
}

function findTargetCellEditor(context2, targetCell) {
  let foundEditor = void 0;
  for (const [, codeEditor] of context2.notebookEditor.codeEditors) {
    if (isEqual2(codeEditor.getModel()?.uri, targetCell.uri)) {
      foundEditor = codeEditor;
      break;
    }
  }
  return foundEditor;
}

var NotebookAction = class extends Action2 {
  constructor(desc) {
    if (desc.f1 !== false) {
      desc.f1 = false;
      const f1Menu = {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(NOTEBOOK_IS_ACTIVE_EDITOR, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, REPL_NOTEBOOK_IS_ACTIVE_EDITOR)
      };
      if (!desc.menu) {
        desc.menu = [];
      } else if (!Array.isArray(desc.menu)) {
        desc.menu = [desc.menu];
      }
      desc.menu = [
        ...desc.menu,
        f1Menu
      ];
    }
    desc.category = NOTEBOOK_ACTIONS_CATEGORY;
    super(desc);
  }
  async run(accessor, context2, ...additionalArgs) {
    sendEntryTelemetry(accessor, this.desc.id, context2);
    if (!this.isNotebookActionContext(context2)) {
      context2 = this.getEditorContextFromArgsOrActive(accessor, context2, ...additionalArgs);
      if (!context2) {
        return;
      }
    }
    return this.runWithContext(accessor, context2);
  }
  isNotebookActionContext(context2) {
    return !!context2 && !!context2.notebookEditor;
  }
  getEditorContextFromArgsOrActive(accessor, context2, ...additionalArgs) {
    return getContextFromActiveEditor(accessor.get(IEditorService));
  }
};

var NotebookMultiCellAction = class extends Action2 {
  constructor(desc) {
    if (desc.f1 !== false) {
      desc.f1 = false;
      const f1Menu = {
        id: MenuId.CommandPalette,
        when: NOTEBOOK_IS_ACTIVE_EDITOR
      };
      if (!desc.menu) {
        desc.menu = [];
      } else if (!Array.isArray(desc.menu)) {
        desc.menu = [desc.menu];
      }
      desc.menu = [
        ...desc.menu,
        f1Menu
      ];
    }
    desc.category = NOTEBOOK_ACTIONS_CATEGORY;
    super(desc);
  }
  parseArgs(accessor, ...args2) {
    return void 0;
  }
  /**
   * The action/command args are resolved in following order
   * `run(accessor, cellToolbarContext)` from cell toolbar
   * `run(accessor, ...args)` from command service with arguments
   * `run(accessor, undefined)` from keyboard shortcuts, command palatte, etc
   */
  async run(accessor, ...additionalArgs) {
    const context2 = additionalArgs[0];
    sendEntryTelemetry(accessor, this.desc.id, context2);
    const isFromCellToolbar = isCellToolbarContext(context2);
    if (isFromCellToolbar) {
      return this.runWithContext(accessor, context2);
    }
    const parsedArgs = this.parseArgs(accessor, ...additionalArgs);
    if (parsedArgs) {
      return this.runWithContext(accessor, parsedArgs);
    }
    const editor = getEditorFromArgsOrActivePane(accessor);
    if (editor) {
      const selectedCellRange = editor.getSelections().length === 0 ? [editor.getFocus()] : editor.getSelections();
      return this.runWithContext(accessor, {
        ui: false,
        notebookEditor: editor,
        selectedCells: cellRangeToViewCells(editor, selectedCellRange)
      });
    }
  }
};

var NotebookCellAction = class extends NotebookAction {
  isCellActionContext(context2) {
    return !!context2 && !!context2.notebookEditor && !!context2.cell;
  }
  getCellContextFromArgs(accessor, context2, ...additionalArgs) {
    return void 0;
  }
  async run(accessor, context2, ...additionalArgs) {
    sendEntryTelemetry(accessor, this.desc.id, context2);
    if (this.isCellActionContext(context2)) {
      return this.runWithContext(accessor, context2);
    }
    const contextFromArgs = this.getCellContextFromArgs(accessor, context2, ...additionalArgs);
    if (contextFromArgs) {
      return this.runWithContext(accessor, contextFromArgs);
    }
    const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
    if (this.isCellActionContext(activeEditorContext)) {
      return this.runWithContext(accessor, activeEditorContext);
    }
  }
};

var executeNotebookCondition = ContextKeyExpr.or(ContextKeyExpr.greater(NOTEBOOK_KERNEL_COUNT.key, 0), ContextKeyExpr.greater(NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0));

function sendEntryTelemetry(accessor, id2, context2) {
  if (context2) {
    const telemetryService = accessor.get(ITelemetryService);
    if (context2.source) {
      telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from: context2.source });
    } else if (URI.isUri(context2)) {
      telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from: "cellEditorContextMenu" });
    } else if (context2 && "from" in context2 && context2.from === "cellContainer") {
      telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from: "cellContainer" });
    } else {
      const from = isCellToolbarContext(context2) ? "cellToolbar" : isEditorCommandsContext(context2) ? "editorToolbar" : "other";
      telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from });
    }
  }
}

function isCellToolbarContext(context2) {
  return !!context2 && !!context2.notebookEditor && context2.$mid === 13 /* NotebookCellActionContext */;
}

function isMultiCellArgs(arg) {
  if (arg === void 0) {
    return false;
  }
  const ranges = arg.ranges;
  if (!ranges) {
    return false;
  }
  if (!Array.isArray(ranges) || ranges.some((range2) => !isICellRange(range2))) {
    return false;
  }
  if (arg.document) {
    const uri4 = URI.revive(arg.document);
    if (!uri4) {
      return false;
    }
  }
  return true;
}

function getEditorFromArgsOrActivePane(accessor, context2) {
  const editorFromUri = getContextFromUri(accessor, context2)?.notebookEditor;
  if (editorFromUri) {
    return editorFromUri;
  }
  const editor = getNotebookEditorFromEditorPane(accessor.get(IEditorService).activeEditorPane);
  if (!editor || !editor.hasModel()) {
    return;
  }
  return editor;
}

function parseMultiCellExecutionArgs(accessor, ...args2) {
  const firstArg = args2[0];
  if (isMultiCellArgs(firstArg)) {
    const editor = getEditorFromArgsOrActivePane(accessor, firstArg.document);
    if (!editor) {
      return;
    }
    const ranges = firstArg.ranges;
    const selectedCells = ranges.map((range2) => editor.getCellsInRange(range2).slice(0)).flat();
    const autoReveal = firstArg.autoReveal;
    return {
      ui: false,
      notebookEditor: editor,
      selectedCells,
      autoReveal
    };
  }
  if (isICellRange(firstArg)) {
    const secondArg = args2[1];
    const editor = getEditorFromArgsOrActivePane(accessor, secondArg);
    if (!editor) {
      return;
    }
    return {
      ui: false,
      notebookEditor: editor,
      selectedCells: editor.getCellsInRange(firstArg)
    };
  }
  const context2 = getContextFromActiveEditor(accessor.get(IEditorService));
  return context2 ? {
    ui: false,
    notebookEditor: context2.notebookEditor,
    selectedCells: context2.selectedCells ?? [],
    cell: context2.cell
  } : void 0;
}

var cellExecutionArgs = [
  {
    isOptional: true,
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
        },
        "autoReveal": {
          "type": "boolean",
          "description": "Whether the cell should be revealed into view automatically"
        }
      }
    }
  }
];

MenuRegistry.appendMenuItem(MenuId.NotebookCellTitle, {
  submenu: MenuId.NotebookCellInsert,
  title: localize(17538, null),
  group: "2_insert" /* Insert */,
  when: NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
});

MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  submenu: MenuId.NotebookCellTitle,
  title: localize(17537, null),
  group: "2_insert" /* Insert */,
  when: NOTEBOOK_EDITOR_FOCUSED
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellTitle, {
  title: localize(17535, null),
  submenu: MenuId.EditorContextShare,
  group: "4_share" /* Share */
});
export { getContextFromActiveEditor, getWidgetFromUri, getContextFromUri, findTargetCellEditor, sendEntryTelemetry, isCellToolbarContext, isMultiCellArgs, getEditorFromArgsOrActivePane, parseMultiCellExecutionArgs, SELECT_KERNEL_ID, NOTEBOOK_ACTIONS_CATEGORY, CELL_TITLE_CELL_GROUP_ID, CELL_TITLE_OUTPUT_GROUP_ID, NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT, NotebookAction, NotebookMultiCellAction, NotebookCellAction, executeNotebookCondition, cellExecutionArgs };
