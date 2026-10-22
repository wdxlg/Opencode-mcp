// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbars.ts
import { CellOverlayPart } from "./module-1896.mjs";
import { ToolBar } from "./module-0503.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { CodiconActionViewItem } from "./module-1924.mjs";
import { MenuEntryActionViewItem, createActionViewItem, getActionBarActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { Emitter } from "./module-0017.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { registerCellToolbarStickyScroll } from "./module-1925.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { isAncestorOfActiveElement } from "./module-0075.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbars.ts
var BetweenCellToolbar = class extends CellOverlayPart {
  constructor(_notebookEditor, _titleToolbarContainer, _bottomCellToolbarContainer, instantiationService, contextMenuService, contextKeyService, menuService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._bottomCellToolbarContainer = _bottomCellToolbarContainer;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
  }
  _initialize() {
    if (this._betweenCellToolbar) {
      return this._betweenCellToolbar;
    }
    const betweenCellToolbar = this._register(new ToolBar(this._bottomCellToolbarContainer, this.contextMenuService, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction) {
          if (this._notebookEditor.notebookOptions.getDisplayOptions().insertToolbarAlignment === "center") {
            return this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
          } else {
            return this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
          }
        }
        return void 0;
      }
    }));
    this._betweenCellToolbar = betweenCellToolbar;
    const menu = this._register(this.menuService.createMenu(this._notebookEditor.creationOptions.menuIds.cellInsertToolbar, this.contextKeyService));
    const updateActions = () => {
      const actions = getCellToolbarActions(menu);
      betweenCellToolbar.setActions(actions.primary, actions.secondary);
    };
    this._register(menu.onDidChange(() => updateActions()));
    this._register(this._notebookEditor.notebookOptions.onDidChangeOptions((e) => {
      if (e.insertToolbarAlignment) {
        updateActions();
      }
    }));
    updateActions();
    return betweenCellToolbar;
  }
  didRenderCell(element) {
    const betweenCellToolbar = this._initialize();
    if (this._notebookEditor.hasModel()) {
      betweenCellToolbar.context = {
        ui: true,
        cell: element,
        notebookEditor: this._notebookEditor,
        source: "insertToolbar",
        $mid: 13 /* NotebookCellActionContext */
      };
    }
    this.updateInternalLayoutNow(element);
  }
  updateInternalLayoutNow(element) {
    const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
    this._bottomCellToolbarContainer.style.transform = `translateY(${bottomToolbarOffset}px)`;
  }
};

BetweenCellToolbar = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IMenuService)
], BetweenCellToolbar);

var CellTitleToolbarPart = class extends CellOverlayPart {
  constructor(toolbarContainer, _rootClassDelegate, toolbarId, deleteToolbarId, _notebookEditor, contextKeyService, menuService, instantiationService) {
    super();
    this.toolbarContainer = toolbarContainer;
    this._rootClassDelegate = _rootClassDelegate;
    this.toolbarId = toolbarId;
    this.deleteToolbarId = deleteToolbarId;
    this._notebookEditor = _notebookEditor;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.instantiationService = instantiationService;
    this._onDidUpdateActions = this._register(new Emitter());
    this.onDidUpdateActions = this._onDidUpdateActions.event;
  }
  get hasActions() {
    if (!this._model) {
      return false;
    }
    return this._model.actions.primary.length + this._model.actions.secondary.length + this._model.deleteActions.primary.length + this._model.deleteActions.secondary.length > 0;
  }
  _initializeModel() {
    if (this._model) {
      return this._model;
    }
    const titleMenu = this._register(this.menuService.createMenu(this.toolbarId, this.contextKeyService));
    const deleteMenu = this._register(this.menuService.createMenu(this.deleteToolbarId, this.contextKeyService));
    const actions = getCellToolbarActions(titleMenu);
    const deleteActions = getCellToolbarActions(deleteMenu);
    this._model = {
      titleMenu,
      actions,
      deleteMenu,
      deleteActions
    };
    return this._model;
  }
  _initialize(model, element) {
    if (this._view) {
      return this._view;
    }
    const hoverDelegate = this._register(createInstantHoverDelegate());
    const toolbar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, this.toolbarContainer, {
      actionViewItemProvider: (action, options3) => {
        return createActionViewItem(this.instantiationService, action, options3);
      },
      renderDropdownAsChildElement: true,
      hoverDelegate
    }));
    const deleteToolbar = this._register(this.instantiationService.invokeFunction((accessor) => createDeleteToolbar(accessor, this.toolbarContainer, hoverDelegate, "cell-delete-toolbar")));
    if (model.deleteActions.primary.length !== 0 || model.deleteActions.secondary.length !== 0) {
      deleteToolbar.setActions(model.deleteActions.primary, model.deleteActions.secondary);
    }
    this.setupChangeListeners(toolbar, model.titleMenu, model.actions);
    this.setupChangeListeners(deleteToolbar, model.deleteMenu, model.deleteActions);
    this._view = {
      toolbar,
      deleteToolbar
    };
    return this._view;
  }
  prepareRenderCell(element) {
    this._initializeModel();
  }
  didRenderCell(element) {
    const model = this._initializeModel();
    const view = this._initialize(model, element);
    this.cellDisposables.add(registerCellToolbarStickyScroll(this._notebookEditor, element, this.toolbarContainer, { extraOffset: 4, min: -14 }));
    if (this._notebookEditor.hasModel()) {
      const toolbarContext = {
        ui: true,
        cell: element,
        notebookEditor: this._notebookEditor,
        source: "cellToolbar",
        $mid: 13 /* NotebookCellActionContext */
      };
      this.updateContext(view, toolbarContext);
    }
  }
  updateContext(view, toolbarContext) {
    view.toolbar.context = toolbarContext;
    view.deleteToolbar.context = toolbarContext;
  }
  setupChangeListeners(toolbar, menu, initActions) {
    let dropdownIsVisible = false;
    let deferredUpdate;
    this.updateActions(toolbar, initActions);
    this._register(menu.onDidChange(() => {
      if (dropdownIsVisible) {
        const actions2 = getCellToolbarActions(menu);
        deferredUpdate = () => this.updateActions(toolbar, actions2);
        return;
      }
      const actions = getCellToolbarActions(menu);
      this.updateActions(toolbar, actions);
    }));
    this._rootClassDelegate.toggle("cell-toolbar-dropdown-active", false);
    this._register(toolbar.onDidChangeDropdownVisibility((visible) => {
      dropdownIsVisible = visible;
      this._rootClassDelegate.toggle("cell-toolbar-dropdown-active", visible);
      if (deferredUpdate && !visible) {
        disposableTimeout(() => {
          deferredUpdate?.();
        }, 0, this._store);
        deferredUpdate = void 0;
      }
    }));
  }
  updateActions(toolbar, actions) {
    const hadFocus = isAncestorOfActiveElement(toolbar.getElement());
    toolbar.setActions(actions.primary, actions.secondary);
    if (hadFocus) {
      this._notebookEditor.focus();
    }
    if (actions.primary.length || actions.secondary.length) {
      this._rootClassDelegate.toggle("cell-has-toolbar-actions", true);
      this._onDidUpdateActions.fire();
    } else {
      this._rootClassDelegate.toggle("cell-has-toolbar-actions", false);
      this._onDidUpdateActions.fire();
    }
  }
};

CellTitleToolbarPart = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IInstantiationService)
], CellTitleToolbarPart);

function getCellToolbarActions(menu) {
  return getActionBarActions(menu.getActions({ shouldForwardArgs: true }), (g) => /^inline/.test(g));
}

function createDeleteToolbar(accessor, container3, hoverDelegate, elementClass) {
  const contextMenuService = accessor.get(IContextMenuService);
  const keybindingService = accessor.get(IKeybindingService);
  const instantiationService = accessor.get(IInstantiationService);
  const toolbar = new ToolBar(container3, contextMenuService, {
    getKeyBinding: (action) => keybindingService.lookupKeybinding(action.id),
    actionViewItemProvider: (action, options3) => {
      return createActionViewItem(instantiationService, action, options3);
    },
    renderDropdownAsChildElement: true,
    hoverDelegate
  });
  if (elementClass) {
    toolbar.getElement().classList.add(elementClass);
  }
  return toolbar;
}
export { getCellToolbarActions, createDeleteToolbar, BetweenCellToolbar, CellTitleToolbarPart };
