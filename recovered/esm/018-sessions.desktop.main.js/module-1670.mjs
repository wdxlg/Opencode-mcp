// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/viewsViewlet.ts
import { ViewPaneContainer } from "./module-1381.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/browser/parts/views/viewsViewlet.ts
var FilterViewPaneContainer = class extends ViewPaneContainer {
  constructor(viewletId, onDidChangeFilterValue, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService, logService) {
    super(viewletId, { mergeViewWithContainerWhenSingleView: false }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
    this.constantViewDescriptors = /* @__PURE__ */ new Map();
    this.allViews = /* @__PURE__ */ new Map();
    this._register(onDidChangeFilterValue((newFilterValue) => {
      this.filterValue = newFilterValue;
      this.onFilterChanged(newFilterValue);
    }));
    this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(() => {
      this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
    }));
  }
  updateAllViews(viewDescriptors) {
    viewDescriptors.forEach((descriptor) => {
      const filterOnValue = this.getFilterOn(descriptor);
      if (!filterOnValue) {
        return;
      }
      if (!this.allViews.has(filterOnValue)) {
        this.allViews.set(filterOnValue, /* @__PURE__ */ new Map());
      }
      this.allViews.get(filterOnValue).set(descriptor.id, descriptor);
      if (this.filterValue && !this.filterValue.includes(filterOnValue) && this.panes.find((pane) => pane.id === descriptor.id)) {
        this.viewContainerModel.setVisible(descriptor.id, false);
      }
    });
  }
  addConstantViewDescriptors(constantViewDescriptors) {
    constantViewDescriptors.forEach((viewDescriptor3) => this.constantViewDescriptors.set(viewDescriptor3.id, viewDescriptor3));
  }
  onFilterChanged(newFilterValue) {
    if (this.allViews.size === 0) {
      this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
    }
    this.getViewsNotForTarget(newFilterValue).forEach((item) => this.viewContainerModel.setVisible(item.id, false));
    this.getViewsForTarget(newFilterValue).forEach((item) => this.viewContainerModel.setVisible(item.id, true));
  }
  getViewsForTarget(target) {
    const views = [];
    for (let i2 = 0; i2 < target.length; i2++) {
      if (this.allViews.has(target[i2])) {
        views.push(...Array.from(this.allViews.get(target[i2]).values()));
      }
    }
    return views;
  }
  getViewsNotForTarget(target) {
    const iterable = this.allViews.keys();
    let key3 = iterable.next();
    let views = [];
    while (!key3.done) {
      let isForTarget = false;
      target.forEach((value2) => {
        if (key3.value === value2) {
          isForTarget = true;
        }
      });
      if (!isForTarget) {
        views = views.concat(this.getViewsForTarget([key3.value]));
      }
      key3 = iterable.next();
    }
    return views;
  }
  onDidAddViewDescriptors(added) {
    const panes = super.onDidAddViewDescriptors(added);
    for (let i2 = 0; i2 < added.length; i2++) {
      if (this.constantViewDescriptors.has(added[i2].viewDescriptor.id)) {
        panes[i2].setExpanded(false);
      }
    }
    if (this.allViews.size === 0) {
      this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
    }
    return panes;
  }
  openView(id2, focus) {
    const result = super.openView(id2, focus);
    if (result) {
      const descriptorMap = Array.from(this.allViews.entries()).find((entry) => entry[1].has(id2));
      if (descriptorMap && !this.filterValue?.includes(descriptorMap[0])) {
        this.setFilter(descriptorMap[1].get(id2));
      }
    }
    return result;
  }
};

FilterViewPaneContainer = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IWorkspaceContextService),
  __decorateParam(11, IViewDescriptorService),
  __decorateParam(12, ILogService)
], FilterViewPaneContainer);
export { FilterViewPaneContainer };
