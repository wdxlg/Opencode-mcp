// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/sectionActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { executeIcon } from "./module-1870.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NotebookOutlineContext } from "./module-2004.mjs";
import { CELL_TITLE_CELL_GROUP_ID } from "./module-1869.mjs";
import { executeSectionCondition } from "./module-2002.mjs";
import { FoldingController2 } from "./module-1937.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/sectionActions.ts
var NotebookRunSingleCellInSection = class extends Action2 {
  constructor() {
    super({
      id: "notebook.section.runSingleCell",
      title: {
        ...localize2(17631, "Run Cell"),
        mnemonicTitle: localize(17629, null)
      },
      shortTitle: localize(17632, null),
      icon: executeIcon,
      menu: [
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "inline",
          order: 1,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(2 /* Code */),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(1 /* OutlinePane */),
            NotebookOutlineContext.CellHasChildren.toNegated(),
            NotebookOutlineContext.CellHasHeader.toNegated()
          )
        }
      ]
    });
  }
  async run(_accessor, context2) {
    if (!checkOutlineEntryContext(context2)) {
      return;
    }
    context2.notebookEditor.executeNotebookCells([context2.outlineEntry.cell]);
  }
};

var NotebookRunCellsInSection = class extends Action2 {
  constructor() {
    super({
      id: "notebook.section.runCells",
      title: {
        ...localize2(17633, "Run Cells In Section"),
        mnemonicTitle: localize(17630, null)
      },
      shortTitle: localize(17634, null),
      icon: executeIcon,
      // TODO @Yoyokrazy replace this with new icon later
      menu: [
        {
          id: MenuId.NotebookStickyScrollContext,
          group: "notebookExecution",
          order: 1
        },
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "inline",
          order: 1,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(1 /* Markup */),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(1 /* OutlinePane */),
            NotebookOutlineContext.CellHasChildren,
            NotebookOutlineContext.CellHasHeader
          )
        },
        {
          id: MenuId.NotebookCellTitle,
          order: 0 /* RunSection */,
          group: CELL_TITLE_CELL_GROUP_ID,
          when: executeSectionCondition
        }
      ]
    });
  }
  async run(_accessor, context2) {
    let cell;
    if (checkOutlineEntryContext(context2)) {
      cell = context2.outlineEntry.cell;
    } else if (checkNotebookCellContext(context2)) {
      cell = context2.cell;
    } else {
      return;
    }
    if (cell.getEditState() === 1 /* Editing */) {
      const foldingController = context2.notebookEditor.getContribution(FoldingController2.id);
      foldingController.recompute();
    }
    const cellIdx = context2.notebookEditor.getViewModel()?.getCellIndex(cell);
    if (cellIdx === void 0) {
      return;
    }
    const sectionIdx = context2.notebookEditor.getViewModel()?.getFoldingStartIndex(cellIdx);
    if (sectionIdx === void 0) {
      return;
    }
    const length = context2.notebookEditor.getViewModel()?.getFoldedLength(sectionIdx);
    if (length === void 0) {
      return;
    }
    const cells = context2.notebookEditor.getCellsInRange({ start: sectionIdx, end: sectionIdx + length + 1 });
    context2.notebookEditor.executeNotebookCells(cells);
  }
};

var NotebookFoldSection = class extends Action2 {
  constructor() {
    super({
      id: "notebook.section.foldSection",
      title: {
        ...localize2(17625, "Fold Section"),
        mnemonicTitle: localize(17628, null)
      },
      shortTitle: localize(17626, null),
      menu: [
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "notebookFolding",
          order: 2,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(1 /* Markup */),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(1 /* OutlinePane */),
            NotebookOutlineContext.CellHasChildren,
            NotebookOutlineContext.CellHasHeader,
            NotebookOutlineContext.CellFoldingState.isEqualTo(1 /* Expanded */)
          )
        }
      ]
    });
  }
  async run(_accessor, context2) {
    if (!checkOutlineEntryContext(context2)) {
      return;
    }
    this.toggleFoldRange(context2.outlineEntry, context2.notebookEditor);
  }
  toggleFoldRange(entry, notebookEditor) {
    const foldingController = notebookEditor.getContribution(FoldingController2.id);
    const index2 = entry.index;
    const headerLevel = entry.level;
    const newFoldingState = 2 /* Collapsed */;
    foldingController.setFoldingStateDown(index2, newFoldingState, headerLevel);
  }
};

var NotebookExpandSection = class extends Action2 {
  constructor() {
    super({
      id: "notebook.section.expandSection",
      title: {
        ...localize2(17623, "Expand Section"),
        mnemonicTitle: localize(17627, null)
      },
      shortTitle: localize(17624, null),
      menu: [
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "notebookFolding",
          order: 2,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(1 /* Markup */),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(1 /* OutlinePane */),
            NotebookOutlineContext.CellHasChildren,
            NotebookOutlineContext.CellHasHeader,
            NotebookOutlineContext.CellFoldingState.isEqualTo(2 /* Collapsed */)
          )
        }
      ]
    });
  }
  async run(_accessor, context2) {
    if (!checkOutlineEntryContext(context2)) {
      return;
    }
    this.toggleFoldRange(context2.outlineEntry, context2.notebookEditor);
  }
  toggleFoldRange(entry, notebookEditor) {
    const foldingController = notebookEditor.getContribution(FoldingController2.id);
    const index2 = entry.index;
    const headerLevel = entry.level;
    const newFoldingState = 1 /* Expanded */;
    foldingController.setFoldingStateDown(index2, newFoldingState, headerLevel);
  }
};

function checkOutlineEntryContext(context2) {
  return !!(context2 && context2.notebookEditor && context2.outlineEntry);
}

function checkNotebookCellContext(context2) {
  return !!(context2 && context2.notebookEditor && context2.cell);
}

registerAction2(NotebookRunSingleCellInSection);

registerAction2(NotebookRunCellsInSection);

registerAction2(NotebookFoldSection);

registerAction2(NotebookExpandSection);
export { checkOutlineEntryContext, checkNotebookCellContext, NotebookRunSingleCellInSection, NotebookRunCellsInSection, NotebookFoldSection, NotebookExpandSection };
