// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/foldingController.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { FoldingModel3 } from "./module-1913.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY } from "./module-1845.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1844.mjs";
import { InputFocusedContextKey } from "./module-0635.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/foldingController.ts
var FoldingController2 = class extends Disposable {
  constructor(_notebookEditor) {
    super();
    this._notebookEditor = _notebookEditor;
    this._foldingModel = null;
    this._localStore = this._register(new DisposableStore());
    this._register(this._notebookEditor.onMouseUp((e4) => {
      this.onMouseUp(e4);
    }));
    this._register(this._notebookEditor.onDidChangeModel(() => {
      this._localStore.clear();
      if (!this._notebookEditor.hasModel()) {
        return;
      }
      this._localStore.add(this._notebookEditor.onDidChangeCellState((e4) => {
        if (e4.source.editStateChanged && e4.cell.cellKind === 1 /* Markup */) {
          this._foldingModel?.recompute();
        }
      }));
      this._foldingModel = new FoldingModel3();
      this._localStore.add(this._foldingModel);
      this._foldingModel.attachViewModel(this._notebookEditor.getViewModel());
      this._localStore.add(this._foldingModel.onDidFoldingRegionChanged(() => {
        this._updateEditorFoldingRanges();
      }));
    }));
  }
  static {
    this.id = "workbench.notebook.foldingController";
  }
  saveViewState() {
    return this._foldingModel?.getMemento() || [];
  }
  restoreViewState(state) {
    this._foldingModel?.applyMemento(state || []);
    this._updateEditorFoldingRanges();
  }
  setFoldingStateDown(index2, state, levels) {
    const doCollapse = state === 2 /* Collapsed */;
    const region = this._foldingModel.getRegionAtLine(index2 + 1);
    const regions = [];
    if (region) {
      if (region.isCollapsed !== doCollapse) {
        regions.push(region);
      }
      if (levels > 1) {
        const regionsInside = this._foldingModel.getRegionsInside(region, (r2, level) => r2.isCollapsed !== doCollapse && level < levels);
        regions.push(...regionsInside);
      }
    }
    regions.forEach((r2) => this._foldingModel.setCollapsed(r2.regionIndex, state === 2 /* Collapsed */));
    this._updateEditorFoldingRanges();
  }
  setFoldingStateUp(index2, state, levels) {
    if (!this._foldingModel) {
      return;
    }
    const regions = this._foldingModel.getAllRegionsAtLine(index2 + 1, (region, level) => region.isCollapsed !== (state === 2 /* Collapsed */) && level <= levels);
    regions.forEach((r2) => this._foldingModel.setCollapsed(r2.regionIndex, state === 2 /* Collapsed */));
    this._updateEditorFoldingRanges();
  }
  _updateEditorFoldingRanges() {
    if (!this._foldingModel) {
      return;
    }
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const vm = this._notebookEditor.getViewModel();
    vm.updateFoldingRanges(this._foldingModel.regions);
    const hiddenRanges = vm.getHiddenRanges();
    this._notebookEditor.setHiddenAreas(hiddenRanges);
  }
  onMouseUp(e4) {
    if (!e4.event.target) {
      return;
    }
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const viewModel = this._notebookEditor.getViewModel();
    const target = e4.event.target;
    if (target.classList.contains("codicon-notebook-collapsed") || target.classList.contains("codicon-notebook-expanded")) {
      const parent = target.parentElement;
      if (!parent.classList.contains("notebook-folding-indicator")) {
        return;
      }
      const cellViewModel = e4.target;
      const modelIndex = viewModel.getCellIndex(cellViewModel);
      const state = viewModel.getFoldingState(modelIndex);
      if (state === 0 /* None */) {
        return;
      }
      this.setFoldingStateUp(modelIndex, state === 2 /* Collapsed */ ? 1 /* Expanded */ : 2 /* Collapsed */, 1);
      this._notebookEditor.focusElement(cellViewModel);
    }
    return;
  }
  recompute() {
    this._foldingModel?.recompute();
  }
};

registerNotebookContribution(FoldingController2.id, FoldingController2);

var NOTEBOOK_FOLD_COMMAND_LABEL = localize(17578, null);

var NOTEBOOK_UNFOLD_COMMAND_LABEL = localize2(17580, "Unfold Cell");

var FOLDING_COMMAND_ARGS = {
  args: [{
    isOptional: true,
    name: "index",
    description: "The cell index",
    schema: {
      "type": "object",
      "required": ["index", "direction"],
      "properties": {
        "index": {
          "type": "number"
        },
        "direction": {
          "type": "string",
          "enum": ["up", "down"],
          "default": "down"
        },
        "levels": {
          "type": "number",
          "default": 1
        }
      }
    }
  }]
};

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.fold",
      title: localize2(17579, "Fold Cell"),
      category: NOTEBOOK_ACTIONS_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 92 /* BracketLeft */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 92 /* BracketLeft */,
          secondary: [15 /* LeftArrow */]
        },
        secondary: [15 /* LeftArrow */],
        weight: 200 /* WorkbenchContrib */
      },
      metadata: {
        description: NOTEBOOK_FOLD_COMMAND_LABEL,
        args: FOLDING_COMMAND_ARGS.args
      },
      precondition: NOTEBOOK_IS_ACTIVE_EDITOR,
      f1: true
    });
  }
  async run(accessor, args2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    if (!editor.hasModel()) {
      return;
    }
    const levels = args2 && args2.levels || 1;
    const direction = args2 && args2.direction === "up" ? "up" : "down";
    let index2 = void 0;
    if (args2) {
      index2 = args2.index;
    } else {
      const activeCell = editor.getActiveCell();
      if (!activeCell) {
        return;
      }
      index2 = editor.getCellIndex(activeCell);
    }
    const controller = editor.getContribution(FoldingController2.id);
    if (index2 !== void 0) {
      const targetCell = index2 < 0 || index2 >= editor.getLength() ? void 0 : editor.cellAt(index2);
      if (targetCell?.cellKind === 2 /* Code */ && direction === "down") {
        return;
      }
      if (direction === "up") {
        controller.setFoldingStateUp(index2, 2 /* Collapsed */, levels);
      } else {
        controller.setFoldingStateDown(index2, 2 /* Collapsed */, levels);
      }
      const viewIndex = editor.getViewModel().getNearestVisibleCellIndexUpwards(index2);
      editor.focusElement(editor.cellAt(viewIndex));
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.unfold",
      title: NOTEBOOK_UNFOLD_COMMAND_LABEL,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 94 /* BracketRight */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 94 /* BracketRight */,
          secondary: [17 /* RightArrow */]
        },
        secondary: [17 /* RightArrow */],
        weight: 200 /* WorkbenchContrib */
      },
      metadata: {
        description: NOTEBOOK_UNFOLD_COMMAND_LABEL,
        args: FOLDING_COMMAND_ARGS.args
      },
      precondition: NOTEBOOK_IS_ACTIVE_EDITOR,
      f1: true
    });
  }
  async run(accessor, args2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const levels = args2 && args2.levels || 1;
    const direction = args2 && args2.direction === "up" ? "up" : "down";
    let index2 = void 0;
    if (args2) {
      index2 = args2.index;
    } else {
      const activeCell = editor.getActiveCell();
      if (!activeCell) {
        return;
      }
      index2 = editor.getCellIndex(activeCell);
    }
    const controller = editor.getContribution(FoldingController2.id);
    if (index2 !== void 0) {
      if (direction === "up") {
        controller.setFoldingStateUp(index2, 1 /* Expanded */, levels);
      } else {
        controller.setFoldingStateDown(index2, 1 /* Expanded */, levels);
      }
    }
  }
});
export { FoldingController2, NOTEBOOK_FOLD_COMMAND_LABEL, NOTEBOOK_UNFOLD_COMMAND_LABEL, FOLDING_COMMAND_ARGS };
