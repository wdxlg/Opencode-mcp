// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/panecomposite.ts
import { Composite, CompositeDescriptor, CompositeRegistry } from "./module-1086.mjs";
import { VIEWPANE_FILTER_ACTION } from "./module-1335.mjs";
import { SubmenuItemAction } from "./module-0092.mjs";
import { ViewsSubMenu } from "./module-1382.mjs";
import { Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/browser/panecomposite.ts
var PaneComposite = class extends Composite {
  constructor(id2, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService) {
    super(id2, telemetryService, themeService, storageService);
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.extensionService = extensionService;
    this.contextService = contextService;
  }
  create(parent) {
    super.create(parent);
    this.viewPaneContainer = this._register(this.createViewPaneContainer(parent));
    this._register(this.viewPaneContainer.onTitleAreaUpdate(() => this.updateTitleArea()));
    this.viewPaneContainer.create(parent);
  }
  setVisible(visible) {
    super.setVisible(visible);
    this.viewPaneContainer?.setVisible(visible);
  }
  layout(dimension) {
    this.viewPaneContainer?.layout(dimension);
  }
  setBoundarySashes(sashes) {
    this.viewPaneContainer?.setBoundarySashes(sashes);
  }
  getOptimalWidth() {
    return this.viewPaneContainer?.getOptimalWidth() ?? 0;
  }
  openView(id2, focus) {
    return this.viewPaneContainer?.openView(id2, focus);
  }
  getViewPaneContainer() {
    return this.viewPaneContainer;
  }
  getActionsContext() {
    return this.getViewPaneContainer()?.getActionsContext();
  }
  getContextMenuActions() {
    return this.viewPaneContainer?.menuActions?.getContextMenuActions() ?? [];
  }
  getMenuIds() {
    const result = [];
    if (this.viewPaneContainer?.menuActions) {
      result.push(this.viewPaneContainer.menuActions.menuId);
      if (this.viewPaneContainer.isViewMergedWithContainer()) {
        result.push(this.viewPaneContainer.panes[0].menuActions.menuId);
      }
    }
    return result;
  }
  getActions() {
    const result = [];
    if (this.viewPaneContainer?.menuActions) {
      result.push(...this.viewPaneContainer.menuActions.getPrimaryActions());
      if (this.viewPaneContainer.isViewMergedWithContainer()) {
        const viewPane = this.viewPaneContainer.panes[0];
        if (viewPane.shouldShowFilterInHeader()) {
          result.push(VIEWPANE_FILTER_ACTION);
        }
        result.push(...viewPane.menuActions.getPrimaryActions());
      }
    }
    return result;
  }
  getSecondaryActions() {
    if (!this.viewPaneContainer?.menuActions) {
      return [];
    }
    const viewPaneActions = this.viewPaneContainer.isViewMergedWithContainer() ? this.viewPaneContainer.panes[0].menuActions.getSecondaryActions() : [];
    let menuActions = this.viewPaneContainer.menuActions.getSecondaryActions();
    const viewsSubmenuActionIndex = menuActions.findIndex((action) => action instanceof SubmenuItemAction && action.item.submenu === ViewsSubMenu);
    if (viewsSubmenuActionIndex !== -1) {
      const viewsSubmenuAction = menuActions[viewsSubmenuActionIndex];
      if (viewsSubmenuAction.actions.some(({ enabled }) => enabled)) {
        if (menuActions.length === 1 && viewPaneActions.length === 0) {
          menuActions = viewsSubmenuAction.actions.slice();
        } else if (viewsSubmenuActionIndex !== 0) {
          menuActions = [viewsSubmenuAction, ...menuActions.slice(0, viewsSubmenuActionIndex), ...menuActions.slice(viewsSubmenuActionIndex + 1)];
        }
      } else {
        menuActions.splice(viewsSubmenuActionIndex, 1);
      }
    }
    if (menuActions.length && viewPaneActions.length) {
      return [
        ...menuActions,
        new Separator(),
        ...viewPaneActions
      ];
    }
    return menuActions.length ? menuActions : viewPaneActions;
  }
  getActionViewItem(action, options3) {
    return this.viewPaneContainer?.getActionViewItem(action, options3);
  }
  getTitle() {
    return this.viewPaneContainer?.getTitle() ?? "";
  }
  focus() {
    super.focus();
    this.viewPaneContainer?.focus();
  }
};

PaneComposite = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IWorkspaceContextService)
], PaneComposite);

var PaneCompositeDescriptor = class _PaneCompositeDescriptor extends CompositeDescriptor {
  constructor(ctor, id2, name, cssClass, order, requestedIndex, iconUrl) {
    super(ctor, id2, name, cssClass, order, requestedIndex);
    this.iconUrl = iconUrl;
  }
  static create(ctor, id2, name, cssClass, order, requestedIndex, iconUrl) {
    return new _PaneCompositeDescriptor(ctor, id2, name, cssClass, order, requestedIndex, iconUrl);
  }
};

var Extensions17 = {
  Viewlets: "workbench.contributions.viewlets",
  Panels: "workbench.contributions.panels",
  Auxiliary: "workbench.contributions.auxiliary"
};

var PaneCompositeRegistry = class extends CompositeRegistry {
  /**
   * Registers a viewlet to the platform.
   */
  registerPaneComposite(descriptor) {
    super.registerComposite(descriptor);
  }
  /**
   * Deregisters a viewlet to the platform.
   */
  deregisterPaneComposite(id2) {
    super.deregisterComposite(id2);
  }
  /**
   * Returns the viewlet descriptor for the given id or null if none.
   */
  getPaneComposite(id2) {
    return this.getComposite(id2);
  }
  /**
   * Returns an array of registered viewlets known to the platform.
   */
  getPaneComposites() {
    return this.getComposites();
  }
};

Registry.add(Extensions17.Viewlets, new PaneCompositeRegistry());

Registry.add(Extensions17.Panels, new PaneCompositeRegistry());

Registry.add(Extensions17.Auxiliary, new PaneCompositeRegistry());
export { PaneComposite, PaneCompositeDescriptor, Extensions17, PaneCompositeRegistry };
