// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/insertCellActions.ts
import { ILanguageService } from "./module-0133.mjs";
import { INotebookKernelHistoryService } from "./module-1388.mjs";
import { insertCell } from "./module-1999.mjs";
import { NotebookAction } from "./module-1869.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_EDITOR_EDITABLE } from "./module-1868.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { Codicon } from "./module-0085.mjs";
import { NotebookSetting } from "./module-0909.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/insertCellActions.ts
var INSERT_CODE_CELL_ABOVE_COMMAND_ID = "notebook.cell.insertCodeCellAbove";

var INSERT_CODE_CELL_BELOW_COMMAND_ID = "notebook.cell.insertCodeCellBelow";

var INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID = "notebook.cell.insertCodeCellAboveAndFocusContainer";

var INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID = "notebook.cell.insertCodeCellBelowAndFocusContainer";

var INSERT_CODE_CELL_AT_TOP_COMMAND_ID = "notebook.cell.insertCodeCellAtTop";

var INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID = "notebook.cell.insertMarkdownCellAbove";

var INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID = "notebook.cell.insertMarkdownCellBelow";

var INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID = "notebook.cell.insertMarkdownCellAtTop";

function insertNewCell(accessor, context2, kind, direction, focusEditor) {
  let newCell = null;
  if (context2.ui) {
    context2.notebookEditor.focus();
  }
  const languageService = accessor.get(ILanguageService);
  const kernelHistoryService = accessor.get(INotebookKernelHistoryService);
  if (context2.cell) {
    const idx = context2.notebookEditor.getCellIndex(context2.cell);
    newCell = insertCell(languageService, context2.notebookEditor, idx, kind, direction, void 0, true, kernelHistoryService);
  } else {
    const focusRange = context2.notebookEditor.getFocus();
    const next = Math.max(focusRange.end - 1, 0);
    newCell = insertCell(languageService, context2.notebookEditor, next, kind, direction, void 0, true, kernelHistoryService);
  }
  return newCell;
}

var InsertCellCommand = class extends NotebookAction {
  constructor(desc, kind, direction, focusEditor) {
    super(desc);
    this.kind = kind;
    this.direction = direction;
    this.focusEditor = focusEditor;
  }
  async runWithContext(accessor, context2) {
    const newCell = await insertNewCell(accessor, context2, this.kind, this.direction, this.focusEditor);
    if (newCell) {
      await context2.notebookEditor.focusNotebookCell(newCell, this.focusEditor ? "editor" : "container");
    }
  }
};

registerAction2(class InsertCodeCellAboveAction extends InsertCellCommand {
  constructor() {
    super(
      {
        id: INSERT_CODE_CELL_ABOVE_COMMAND_ID,
        title: localize(17581, null),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
          when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, InputFocusedContext.toNegated()),
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellInsert,
          order: 0
        }
      },
      2 /* Code */,
      "above",
      true
    );
  }
});

registerAction2(class InsertCodeCellAboveAndFocusContainerAction extends InsertCellCommand {
  constructor() {
    super(
      {
        id: INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID,
        title: localize(17582, null)
      },
      2 /* Code */,
      "above",
      false
    );
  }
});

registerAction2(class InsertCodeCellBelowAction extends InsertCellCommand {
  constructor() {
    super(
      {
        id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
        title: localize(17584, null),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
          when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, InputFocusedContext.toNegated()),
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellInsert,
          order: 1
        }
      },
      2 /* Code */,
      "below",
      true
    );
  }
});

registerAction2(class InsertCodeCellBelowAndFocusContainerAction extends InsertCellCommand {
  constructor() {
    super(
      {
        id: INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID,
        title: localize(17585, null)
      },
      2 /* Code */,
      "below",
      false
    );
  }
});

registerAction2(class InsertMarkdownCellAboveAction extends InsertCellCommand {
  constructor() {
    super(
      {
        id: INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID,
        title: localize(17586, null),
        menu: {
          id: MenuId.NotebookCellInsert,
          order: 2
        }
      },
      1 /* Markup */,
      "above",
      true
    );
  }
});

registerAction2(class InsertMarkdownCellBelowAction extends InsertCellCommand {
  constructor() {
    super(
      {
        id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
        title: localize(17588, null),
        menu: {
          id: MenuId.NotebookCellInsert,
          order: 3
        }
      },
      1 /* Markup */,
      "below",
      true
    );
  }
});

registerAction2(class InsertCodeCellAtTopAction extends NotebookAction {
  constructor() {
    super(
      {
        id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
        title: localize(17583, null),
        f1: false
      }
    );
  }
  async run(accessor, context2) {
    context2 = context2 ?? this.getEditorContextFromArgsOrActive(accessor);
    if (context2) {
      this.runWithContext(accessor, context2);
    }
  }
  async runWithContext(accessor, context2) {
    const languageService = accessor.get(ILanguageService);
    const kernelHistoryService = accessor.get(INotebookKernelHistoryService);
    const newCell = insertCell(languageService, context2.notebookEditor, 0, 2 /* Code */, "above", void 0, true, kernelHistoryService);
    if (newCell) {
      await context2.notebookEditor.focusNotebookCell(newCell, "editor");
    }
  }
});

registerAction2(class InsertMarkdownCellAtTopAction extends NotebookAction {
  constructor() {
    super(
      {
        id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
        title: localize(17587, null),
        f1: false
      }
    );
  }
  async run(accessor, context2) {
    context2 = context2 ?? this.getEditorContextFromArgsOrActive(accessor);
    if (context2) {
      this.runWithContext(accessor, context2);
    }
  }
  async runWithContext(accessor, context2) {
    const languageService = accessor.get(ILanguageService);
    const kernelHistoryService = accessor.get(INotebookKernelHistoryService);
    const newCell = insertCell(languageService, context2.notebookEditor, 0, 1 /* Markup */, "above", void 0, true, kernelHistoryService);
    if (newCell) {
      await context2.notebookEditor.focusNotebookCell(newCell, "editor");
    }
  }
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellBetween, {
  command: {
    id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
    title: "$(add) " + localize(17589, null),
    tooltip: localize(17593, null)
  },
  order: 0,
  group: "inline",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.experimental.insertToolbarAlignment", "left")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellBetween, {
  command: {
    id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
    title: localize(17591, null),
    icon: Codicon.add,
    tooltip: localize(17593, null)
  },
  order: 0,
  group: "inline",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.equals("config.notebook.experimental.insertToolbarAlignment", "left")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookToolbar, {
  command: {
    id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
    icon: Codicon.add,
    title: localize(17592, null),
    tooltip: localize(17593, null)
  },
  order: -5,
  group: "navigation/add",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.insertToolbarLocation", "betweenCells"),
    ContextKeyExpr.notEquals("config.notebook.insertToolbarLocation", "hidden")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellListTop, {
  command: {
    id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
    title: "$(add) " + localize(17589, null),
    tooltip: localize(17593, null)
  },
  order: 0,
  group: "inline",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.experimental.insertToolbarAlignment", "left")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellListTop, {
  command: {
    id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
    title: localize(17590, null),
    icon: Codicon.add,
    tooltip: localize(17593, null)
  },
  order: 0,
  group: "inline",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.equals("config.notebook.experimental.insertToolbarAlignment", "left")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellBetween, {
  command: {
    id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
    title: "$(add) " + localize(17594, null),
    tooltip: localize(17596, null)
  },
  order: 1,
  group: "inline",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.experimental.insertToolbarAlignment", "left")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookToolbar, {
  command: {
    id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
    icon: Codicon.add,
    title: localize(17595, null),
    tooltip: localize(17596, null)
  },
  order: -5,
  group: "navigation/add",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.insertToolbarLocation", "betweenCells"),
    ContextKeyExpr.notEquals("config.notebook.insertToolbarLocation", "hidden"),
    ContextKeyExpr.notEquals(`config.${NotebookSetting.globalToolbarShowLabel}`, false),
    ContextKeyExpr.notEquals(`config.${NotebookSetting.globalToolbarShowLabel}`, "never")
  )
});

MenuRegistry.appendMenuItem(MenuId.NotebookCellListTop, {
  command: {
    id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
    title: "$(add) " + localize(17594, null),
    tooltip: localize(17596, null)
  },
  order: 1,
  group: "inline",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.experimental.insertToolbarAlignment", "left")
  )
});
export { insertNewCell, INSERT_CODE_CELL_ABOVE_COMMAND_ID, INSERT_CODE_CELL_BELOW_COMMAND_ID, INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID, INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID, INSERT_CODE_CELL_AT_TOP_COMMAND_ID, INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID, INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID, INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID, InsertCellCommand };
