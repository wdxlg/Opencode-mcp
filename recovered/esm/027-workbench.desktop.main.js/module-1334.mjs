// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/viewMenuActions.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { IViewDescriptorService, ViewContainerLocationToString } from "./module-1093.mjs";


// src/vs/workbench/browser/parts/views/viewMenuActions.ts
var ViewMenuActions = class extends Disposable {
  constructor(menuId, contextMenuId, options3, menuActionsOptions, contextKeyService, menuService) {
    super();
    this.menuId = menuId;
    this.contextMenuId = contextMenuId;
    this.options = options3;
    this.menuActionsOptions = menuActionsOptions;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.menu = this._register(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true }));
    this._register(this.menu.onDidChange(() => {
      this.actions = void 0;
      this._onDidChange.fire();
    }));
  }
  getActions() {
    if (!this.actions) {
      this.actions = getActionBarActions(this.menu.getActions(this.options), (group2) => this.isPrimaryActionGroup(group2), void 0, true);
    }
    return this.actions;
  }
  isPrimaryActionGroup(group2) {
    if (group2 === "navigation") {
      return true;
    }
    if (this.menuActionsOptions?.primaryActionGroups) {
      return this.menuActionsOptions.primaryActionGroups.includes(group2);
    }
    return false;
  }
  getPrimaryActions() {
    return this.getActions().primary;
  }
  getSecondaryActions() {
    return this.getActions().secondary;
  }
  getContextMenuActions() {
    if (this.contextMenuId) {
      const menu = this.menuService.getMenuActions(this.contextMenuId, this.contextKeyService, this.options);
      return getActionBarActions(menu).secondary;
    }
    return [];
  }
};

ViewMenuActions = __decorateClass([
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IMenuService)
], ViewMenuActions);

var ViewContainerMenuActions = class extends ViewMenuActions {
  constructor(element, viewContainer5, menuActionsOptions, viewDescriptorService, contextKeyService, menuService) {
    const scopedContextKeyService = contextKeyService.createScoped(element);
    scopedContextKeyService.createKey("viewContainer", viewContainer5.id);
    const viewContainerLocationKey = scopedContextKeyService.createKey("viewContainerLocation", ViewContainerLocationToString(viewDescriptorService.getViewContainerLocation(viewContainer5)));
    super(MenuId.ViewContainerTitle, MenuId.ViewContainerTitleContext, { shouldForwardArgs: true, renderShortTitle: true }, menuActionsOptions, scopedContextKeyService, menuService);
    this._register(scopedContextKeyService);
    this._register(Event2.filter(viewDescriptorService.onDidChangeContainerLocation, (e) => e.viewContainer === viewContainer5)(() => viewContainerLocationKey.set(ViewContainerLocationToString(viewDescriptorService.getViewContainerLocation(viewContainer5)))));
  }
};

ViewContainerMenuActions = __decorateClass([
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IMenuService)
], ViewContainerMenuActions);
export { ViewMenuActions, ViewContainerMenuActions };
