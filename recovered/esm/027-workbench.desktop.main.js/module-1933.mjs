// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar.ts
import { CellContentPart } from "./module-1896.mjs";
import { registerCellToolbarStickyScroll } from "./module-1925.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ToolBar } from "./module-0503.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_TYPE, NOTEBOOK_EDITOR_FOCUSED } from "./module-1868.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar.ts
var RunToolbar = class extends CellContentPart {
  constructor(notebookEditor, contextKeyService, cellContainer, runButtonContainer, primaryMenuId, secondaryMenuId, menuService, keybindingService, contextMenuService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.contextKeyService = contextKeyService;
    this.cellContainer = cellContainer;
    this.runButtonContainer = runButtonContainer;
    this.keybindingService = keybindingService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.primaryMenu = this._register(menuService.createMenu(primaryMenuId, contextKeyService));
    this.secondaryMenu = this._register(menuService.createMenu(secondaryMenuId, contextKeyService));
    this.createRunCellToolbar(runButtonContainer, cellContainer, contextKeyService);
    const updateActions = () => {
      const actions = this.getCellToolbarActions(this.primaryMenu);
      const primary = actions.primary[0];
      this.toolbar.setActions(primary ? [primary] : []);
    };
    updateActions();
    this._register(this.primaryMenu.onDidChange(updateActions));
    this._register(this.secondaryMenu.onDidChange(updateActions));
    this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(updateActions));
  }
  didRenderCell(element) {
    this.cellDisposables.add(registerCellToolbarStickyScroll(this.notebookEditor, element, this.runButtonContainer));
    if (this.notebookEditor.hasModel()) {
      const context2 = {
        ui: true,
        cell: element,
        notebookEditor: this.notebookEditor,
        $mid: 13 /* NotebookCellActionContext */
      };
      this.toolbar.context = context2;
    }
  }
  getCellToolbarActions(menu) {
    return getActionBarActions(menu.getActions({ shouldForwardArgs: true }), (g) => /^inline/.test(g));
  }
  createRunCellToolbar(container3, cellContainer, contextKeyService) {
    const actionViewItemDisposables = this._register(new DisposableStore());
    const dropdownAction = this._register(new Action("notebook.moreRunActions", localize(17886, null), "codicon-chevron-down", true));
    const keybindingProvider = (action) => this.keybindingService.lookupKeybinding(action.id, executionContextKeyService);
    const executionContextKeyService = this._register(getCodeCellExecutionContextKeyService(contextKeyService));
    this.toolbar = this._register(new ToolBar(container3, this.contextMenuService, {
      getKeyBinding: keybindingProvider,
      actionViewItemProvider: (_action, _options) => {
        actionViewItemDisposables.clear();
        const primary = this.getCellToolbarActions(this.primaryMenu).primary[0];
        if (!(primary instanceof MenuItemAction)) {
          return void 0;
        }
        const secondary = this.getCellToolbarActions(this.secondaryMenu).secondary;
        if (!secondary.length) {
          return void 0;
        }
        const item = this.instantiationService.createInstance(
          DropdownWithPrimaryActionViewItem,
          primary,
          dropdownAction,
          secondary,
          "notebook-cell-run-toolbar",
          {
            ..._options,
            getKeyBinding: keybindingProvider
          }
        );
        actionViewItemDisposables.add(item.onDidChangeDropdownVisibility((visible) => {
          cellContainer.classList.toggle("cell-run-toolbar-dropdown-active", visible);
        }));
        return item;
      },
      renderDropdownAsChildElement: true
    }));
  }
};

RunToolbar = __decorateClass([
  __decorateParam(6, IMenuService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IInstantiationService)
], RunToolbar);

function getCodeCellExecutionContextKeyService(contextKeyService) {
  const executionContextKeyService = contextKeyService.createScoped(document.createElement("div"));
  InputFocusedContext.bindTo(executionContextKeyService).set(true);
  EditorContextKeys.editorTextFocus.bindTo(executionContextKeyService).set(true);
  EditorContextKeys.focus.bindTo(executionContextKeyService).set(true);
  EditorContextKeys.textInputFocus.bindTo(executionContextKeyService).set(true);
  NOTEBOOK_CELL_EXECUTION_STATE.bindTo(executionContextKeyService).set("idle");
  NOTEBOOK_CELL_LIST_FOCUSED.bindTo(executionContextKeyService).set(true);
  NOTEBOOK_EDITOR_FOCUSED.bindTo(executionContextKeyService).set(true);
  NOTEBOOK_CELL_TYPE.bindTo(executionContextKeyService).set("code");
  return executionContextKeyService;
}
export { getCodeCellExecutionContextKeyService, RunToolbar };
