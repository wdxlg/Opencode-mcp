// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/views/browser/viewDescriptorService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Lazy } from "./module-0028.mjs";
import { Extensions13, IViewDescriptorService, VIEWS_LOG_ID, VIEWS_LOG_NAME, ViewContainerLocationToString, defaultViewIcon } from "./module-1094.mjs";
import { windowLogGroup } from "./module-1501.mjs";
import { Registry } from "./module-0090.mjs";
import { ViewContainerModel, getViewsStateStorageId } from "./module-1668.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer, ViewPaneContainerAction, ViewsSubMenu } from "./module-1381.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IViewsService } from "./module-1246.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/views/browser/viewDescriptorService.ts
function getViewContainerStorageId(viewContainerId) {
  return `${viewContainerId}.state`;
}

var ViewDescriptorService = class extends Disposable {
  constructor(instantiationService, contextKeyService, storageService, extensionService, telemetryService, loggerService, environmentService) {
    super();
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.telemetryService = telemetryService;
    this._onDidChangeContainer = this._register(new Emitter());
    this.onDidChangeContainer = this._onDidChangeContainer.event;
    this._onDidChangeLocation = this._register(new Emitter());
    this.onDidChangeLocation = this._onDidChangeLocation.event;
    this._onDidChangeContainerLocation = this._register(new Emitter());
    this.onDidChangeContainerLocation = this._onDidChangeContainerLocation.event;
    this.viewContainerModels = this._register(new DisposableMap());
    this.viewsVisibilityActionDisposables = this._register(new DisposableMap());
    this.canRegisterViewsVisibilityActions = false;
    this._onDidChangeViewContainers = this._register(new Emitter());
    this.onDidChangeViewContainers = this._onDidChangeViewContainers.event;
    this.logger = new Lazy(() => loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, group: windowLogGroup }));
    this.isSessionsWindow = environmentService.isSessionsWindow;
    this.activeViewContextKeys = /* @__PURE__ */ new Map();
    this.movableViewContextKeys = /* @__PURE__ */ new Map();
    this.defaultViewLocationContextKeys = /* @__PURE__ */ new Map();
    this.defaultViewContainerLocationContextKeys = /* @__PURE__ */ new Map();
    this.viewContainersRegistry = Registry.as(Extensions13.ViewContainersRegistry);
    this.viewsRegistry = Registry.as(Extensions13.ViewsRegistry);
    this.migrateToViewsCustomizationsStorage();
    this.viewContainersCustomLocations = new Map(Object.entries(this.viewCustomizations.viewContainerLocations));
    this.viewDescriptorsCustomLocations = new Map(Object.entries(this.viewCustomizations.viewLocations));
    this.viewContainerBadgeEnablementStates = new Map(Object.entries(this.viewCustomizations.viewContainerBadgeEnablementStates));
    this.viewContainers.forEach((viewContainer) => this.onDidRegisterViewContainer(viewContainer));
    this._register(this.viewsRegistry.onViewsRegistered((views) => this.onDidRegisterViews(views)));
    this._register(this.viewsRegistry.onViewsDeregistered(({ views, viewContainer }) => this.onDidDeregisterViews(views, viewContainer)));
    this._register(this.viewsRegistry.onDidChangeContainer(({ views, from, to }) => this.onDidChangeDefaultContainer(views, from, to)));
    this._register(this.viewContainersRegistry.onDidRegister(({ viewContainer }) => {
      if (!this.isViewContainerEnabled(viewContainer)) {
        return;
      }
      this.onDidRegisterViewContainer(viewContainer);
      this._onDidChangeViewContainers.fire({ added: [{ container: viewContainer, location: this.getViewContainerLocation(viewContainer) }], removed: [] });
    }));
    this._register(this.viewContainersRegistry.onDidDeregister(({ viewContainer, viewContainerLocation }) => {
      if (!this.isViewContainerEnabled(viewContainer)) {
        return;
      }
      this.onDidDeregisterViewContainer(viewContainer);
      this._onDidChangeViewContainers.fire({ removed: [{ container: viewContainer, location: viewContainerLocation }], added: [] });
    }));
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, ViewDescriptorService.VIEWS_CUSTOMIZATIONS, this._store)(() => this.onDidStorageChange()));
    this.extensionService.whenInstalledExtensionsRegistered().then(() => this.whenExtensionsRegistered());
  }
  static {
    this.VIEWS_CUSTOMIZATIONS = "views.customizations";
  }
  static {
    this.COMMON_CONTAINER_ID_PREFIX = "workbench.views.service";
  }
  get viewContainers() {
    return this.viewContainersRegistry.all.filter((vc) => this.isViewContainerEnabled(vc));
  }
  migrateToViewsCustomizationsStorage() {
    if (this.storageService.get(ViewDescriptorService.VIEWS_CUSTOMIZATIONS, 0 /* PROFILE */)) {
      return;
    }
    const viewContainerLocationsValue = this.storageService.get("views.cachedViewContainerLocations", 0 /* PROFILE */);
    const viewDescriptorLocationsValue = this.storageService.get("views.cachedViewPositions", 0 /* PROFILE */);
    if (!viewContainerLocationsValue && !viewDescriptorLocationsValue) {
      return;
    }
    const viewContainerLocations = viewContainerLocationsValue ? JSON.parse(viewContainerLocationsValue) : [];
    const viewDescriptorLocations = viewDescriptorLocationsValue ? JSON.parse(viewDescriptorLocationsValue) : [];
    const viewsCustomizations = {
      viewContainerLocations: viewContainerLocations.reduce((result, [id2, location2]) => {
        result[id2] = location2;
        return result;
      }, {}),
      viewLocations: viewDescriptorLocations.reduce((result, [id2, { containerId }]) => {
        result[id2] = containerId;
        return result;
      }, {}),
      viewContainerBadgeEnablementStates: {}
    };
    this.storageService.store(ViewDescriptorService.VIEWS_CUSTOMIZATIONS, JSON.stringify(viewsCustomizations), 0 /* PROFILE */, 0 /* USER */);
    this.storageService.remove("views.cachedViewContainerLocations", 0 /* PROFILE */);
    this.storageService.remove("views.cachedViewPositions", 0 /* PROFILE */);
  }
  registerGroupedViews(groupedViews) {
    for (const [containerId, views] of groupedViews.entries()) {
      const viewContainer = this.getViewContainerById(containerId);
      if (!viewContainer || !this.viewContainerModels.has(viewContainer)) {
        if (this.isGeneratedContainerId(containerId)) {
          const viewContainerLocation = this.viewContainersCustomLocations.get(containerId);
          if (viewContainerLocation !== void 0) {
            this.registerGeneratedViewContainer(viewContainerLocation, containerId);
          }
        }
        continue;
      }
      const viewsToAdd = views.filter((view) => this.getViewContainerModel(viewContainer).allViewDescriptors.filter((vd) => vd.id === view.id).length === 0);
      this.addViews(viewContainer, viewsToAdd);
    }
  }
  deregisterGroupedViews(groupedViews) {
    for (const [viewContainerId, views] of groupedViews.entries()) {
      const viewContainer = this.getViewContainerById(viewContainerId);
      if (!viewContainer || !this.viewContainerModels.has(viewContainer)) {
        continue;
      }
      this.removeViews(viewContainer, views);
    }
  }
  moveOrphanViewsToDefaultLocation() {
    for (const [viewId, containerId] of this.viewDescriptorsCustomLocations.entries()) {
      if (this.getViewContainerById(containerId)) {
        continue;
      }
      const viewContainer = this.viewsRegistry.getViewContainer(viewId);
      const viewDescriptor3 = this.getViewDescriptorById(viewId);
      if (viewContainer && viewDescriptor3) {
        this.addViews(viewContainer, [viewDescriptor3]);
      }
    }
  }
  whenExtensionsRegistered() {
    this.moveOrphanViewsToDefaultLocation();
    for (const viewContainerId of [...this.viewContainersCustomLocations.keys()]) {
      this.cleanUpGeneratedViewContainer(viewContainerId);
    }
    this.saveViewCustomizations();
    for (const [key3, value2] of this.viewContainerModels) {
      this.registerViewsVisibilityActions(key3, value2);
    }
    this.canRegisterViewsVisibilityActions = true;
  }
  onDidRegisterViews(views) {
    this.contextKeyService.bufferChangeEvents(() => {
      views.forEach(({ views: views2, viewContainer }) => {
        const regroupedViews = this.regroupViews(viewContainer.id, views2);
        this.registerGroupedViews(regroupedViews);
        views2.forEach((viewDescriptor3) => this.getOrCreateMovableViewContextKey(viewDescriptor3).set(!!viewDescriptor3.canMoveView));
      });
    });
  }
  isGeneratedContainerId(id2) {
    return id2.startsWith(ViewDescriptorService.COMMON_CONTAINER_ID_PREFIX);
  }
  onDidDeregisterViews(views, viewContainer) {
    const regroupedViews = this.regroupViews(viewContainer.id, views);
    this.deregisterGroupedViews(regroupedViews);
    this.contextKeyService.bufferChangeEvents(() => {
      views.forEach((viewDescriptor3) => this.getOrCreateMovableViewContextKey(viewDescriptor3).set(false));
    });
  }
  regroupViews(containerId, views) {
    const viewsByContainer = /* @__PURE__ */ new Map();
    for (const viewDescriptor3 of views) {
      const correctContainerId = this.viewDescriptorsCustomLocations.get(viewDescriptor3.id) ?? containerId;
      let containerViews = viewsByContainer.get(correctContainerId);
      if (!containerViews) {
        viewsByContainer.set(correctContainerId, containerViews = []);
      }
      containerViews.push(viewDescriptor3);
    }
    return viewsByContainer;
  }
  getViewDescriptorById(viewId) {
    const view = this.viewsRegistry.getView(viewId);
    if (view && !this.isViewEnabled(view)) {
      return null;
    }
    return view;
  }
  getViewLocationById(viewId) {
    const container2 = this.getViewContainerByViewId(viewId);
    if (container2 === null) {
      return null;
    }
    return this.getViewContainerLocation(container2);
  }
  getViewContainerByViewId(viewId) {
    const view = this.viewsRegistry.getView(viewId);
    if (view && !this.isViewEnabled(view)) {
      return null;
    }
    const containerId = this.viewDescriptorsCustomLocations.get(viewId);
    return containerId ? this.getViewContainerById(containerId) : this.getDefaultContainerById(viewId);
  }
  getViewContainerLocation(viewContainer) {
    return this.viewContainersCustomLocations.get(viewContainer.id) ?? this.getDefaultViewContainerLocation(viewContainer);
  }
  getDefaultViewContainerLocation(viewContainer) {
    return this.viewContainersRegistry.getViewContainerLocation(viewContainer);
  }
  getDefaultContainerById(viewId) {
    return this.viewsRegistry.getViewContainer(viewId) ?? null;
  }
  getViewContainerModel(container2) {
    return this.getOrRegisterViewContainerModel(container2);
  }
  getViewContainerById(id2) {
    return this.viewContainers.find((vc) => vc.id === id2) ?? null;
  }
  getViewContainersByLocation(location2) {
    return this.viewContainers.filter((v2) => this.getViewContainerLocation(v2) === location2);
  }
  isViewContainerEnabled(viewContainer) {
    return this.isEnabled(viewContainer.windowEnablement);
  }
  isViewEnabled(view) {
    return this.isEnabled(view.windowEnablement);
  }
  isEnabled(enablement) {
    if (this.isSessionsWindow) {
      return enablement === 2 /* Sessions */ || enablement === 3 /* Both */;
    }
    return !enablement || enablement === 1 /* Editor */ || enablement === 3 /* Both */;
  }
  getDefaultViewContainer(location2) {
    const viewContainers = this.viewContainersRegistry.getDefaultViewContainers(location2);
    return viewContainers.find((viewContainer) => this.isViewContainerEnabled(viewContainer));
  }
  canMoveViews() {
    return !this.isSessionsWindow;
  }
  moveViewContainerToLocation(viewContainer, location2, requestedIndex, reason) {
    if (!this.canMoveViews()) {
      return;
    }
    this.logger.value.trace(`moveViewContainerToLocation: viewContainer:${viewContainer.id} location:${location2} reason:${reason}`);
    this.moveViewContainerToLocationWithoutSaving(viewContainer, location2, requestedIndex);
    this.saveViewCustomizations();
  }
  getViewContainerBadgeEnablementState(id2) {
    return this.viewContainerBadgeEnablementStates.get(id2) ?? true;
  }
  setViewContainerBadgeEnablementState(id2, badgesEnabled) {
    this.viewContainerBadgeEnablementStates.set(id2, badgesEnabled);
    this.saveViewCustomizations();
  }
  moveViewToLocation(view, location2, reason) {
    if (!this.canMoveViews()) {
      return;
    }
    this.logger.value.trace(`moveViewToLocation: view:${view.id} location:${location2} reason:${reason}`);
    const container2 = this.registerGeneratedViewContainer(location2);
    this.moveViewsToContainer([view], container2);
  }
  moveViewsToContainer(views, viewContainer, visibilityState, reason) {
    if (!views.length) {
      return;
    }
    if (!this.canMoveViews()) {
      return;
    }
    this.logger.value.trace(`moveViewsToContainer: views:${views.map((view) => view.id).join(",")} viewContainer:${viewContainer.id} reason:${reason}`);
    const from = this.getViewContainerByViewId(views[0].id);
    const to = viewContainer;
    if (from && to && from !== to) {
      this.moveViewsWithoutSaving(views, from, to, visibilityState);
      this.cleanUpGeneratedViewContainer(from.id);
      this.saveViewCustomizations();
      this.reportMovedViews(views, from, to);
    }
  }
  reset() {
    for (const viewContainer of this.viewContainers) {
      const viewContainerModel = this.getViewContainerModel(viewContainer);
      for (const viewDescriptor3 of viewContainerModel.allViewDescriptors) {
        const defaultContainer = this.getDefaultContainerById(viewDescriptor3.id);
        const currentContainer = this.getViewContainerByViewId(viewDescriptor3.id);
        if (currentContainer && defaultContainer && currentContainer !== defaultContainer) {
          this.moveViewsWithoutSaving([viewDescriptor3], currentContainer, defaultContainer);
        }
      }
      const defaultContainerLocation = this.getDefaultViewContainerLocation(viewContainer);
      const currentContainerLocation = this.getViewContainerLocation(viewContainer);
      if (defaultContainerLocation !== null && currentContainerLocation !== defaultContainerLocation) {
        this.moveViewContainerToLocationWithoutSaving(viewContainer, defaultContainerLocation);
      }
      this.cleanUpGeneratedViewContainer(viewContainer.id);
    }
    this.viewContainersCustomLocations.clear();
    this.viewDescriptorsCustomLocations.clear();
    this.saveViewCustomizations();
  }
  isViewContainerRemovedPermanently(viewContainerId) {
    return this.isGeneratedContainerId(viewContainerId) && !this.viewContainersCustomLocations.has(viewContainerId);
  }
  onDidChangeDefaultContainer(views, from, to) {
    const viewsToMove = views.filter(
      (view) => !this.viewDescriptorsCustomLocations.has(view.id) || !this.viewContainers.includes(from) && this.viewDescriptorsCustomLocations.get(view.id) === from.id
      // Move views which are moved from a removed container
    );
    if (viewsToMove.length) {
      this.moveViewsWithoutSaving(viewsToMove, from, to);
    }
  }
  reportMovedViews(views, from, to) {
    const containerToString = (container2) => {
      if (container2.id.startsWith(ViewDescriptorService.COMMON_CONTAINER_ID_PREFIX)) {
        return "custom";
      }
      if (!container2.extensionId) {
        return container2.id;
      }
      return "extension";
    };
    const oldLocation = this.getViewContainerLocation(from);
    const newLocation = this.getViewContainerLocation(to);
    const viewCount = views.length;
    const fromContainer = containerToString(from);
    const toContainer = containerToString(to);
    const fromLocation = oldLocation === 1 /* Panel */ ? "panel" : "sidebar";
    const toLocation = newLocation === 1 /* Panel */ ? "panel" : "sidebar";
    this.telemetryService.publicLog2("viewDescriptorService.moveViews", { viewCount, fromContainer, toContainer, fromLocation, toLocation });
  }
  moveViewsWithoutSaving(views, from, to, visibilityState = 1 /* Expand */) {
    this.removeViews(from, views);
    this.addViews(to, views, visibilityState);
    const oldLocation = this.getViewContainerLocation(from);
    const newLocation = this.getViewContainerLocation(to);
    if (oldLocation !== newLocation) {
      this._onDidChangeLocation.fire({ views, from: oldLocation, to: newLocation });
    }
    this._onDidChangeContainer.fire({ views, from, to });
  }
  moveViewContainerToLocationWithoutSaving(viewContainer, location2, requestedIndex) {
    const from = this.getViewContainerLocation(viewContainer);
    const to = location2;
    if (from !== to) {
      const isGeneratedViewContainer = this.isGeneratedContainerId(viewContainer.id);
      const isDefaultViewContainerLocation = to === this.getDefaultViewContainerLocation(viewContainer);
      if (isGeneratedViewContainer || !isDefaultViewContainerLocation) {
        this.viewContainersCustomLocations.set(viewContainer.id, to);
      } else {
        this.viewContainersCustomLocations.delete(viewContainer.id);
      }
      this.getOrCreateDefaultViewContainerLocationContextKey(viewContainer).set(isGeneratedViewContainer || isDefaultViewContainerLocation);
      viewContainer.requestedIndex = requestedIndex;
      this._onDidChangeContainerLocation.fire({ viewContainer, from, to });
      const views = this.getViewsByContainer(viewContainer);
      this._onDidChangeLocation.fire({ views, from, to });
    }
  }
  cleanUpGeneratedViewContainer(viewContainerId) {
    if (!this.isGeneratedContainerId(viewContainerId)) {
      return;
    }
    const viewContainer = this.getViewContainerById(viewContainerId);
    if (viewContainer && this.getViewContainerModel(viewContainer)?.allViewDescriptors.length) {
      return;
    }
    if ([...this.viewDescriptorsCustomLocations.values()].includes(viewContainerId)) {
      return;
    }
    if (viewContainer) {
      this.viewContainersRegistry.deregisterViewContainer(viewContainer);
    }
    this.viewContainersCustomLocations.delete(viewContainerId);
    this.viewContainerBadgeEnablementStates.delete(viewContainerId);
    this.storageService.remove(getViewsStateStorageId(viewContainer?.storageId || getViewContainerStorageId(viewContainerId)), 0 /* PROFILE */);
  }
  registerGeneratedViewContainer(location2, existingId) {
    const id2 = existingId || this.generateContainerId(location2);
    const container2 = this.viewContainersRegistry.registerViewContainer({
      id: id2,
      ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [id2, { mergeViewWithContainerWhenSingleView: true }]),
      title: { value: localize(23720, null), original: "User View Container" },
      // having a placeholder title - this should not be shown anywhere
      icon: location2 === 0 /* Sidebar */ ? defaultViewIcon : void 0,
      storageId: getViewContainerStorageId(id2),
      hideIfEmpty: true
    }, location2, { doNotRegisterOpenCommand: true });
    if (this.viewContainersCustomLocations.get(container2.id) !== location2) {
      this.viewContainersCustomLocations.set(container2.id, location2);
    }
    this.getOrCreateDefaultViewContainerLocationContextKey(container2).set(true);
    return container2;
  }
  onDidStorageChange() {
    if (JSON.stringify(this.viewCustomizations) !== this.getStoredViewCustomizationsValue()) {
      this.onDidViewCustomizationsStorageChange();
    }
  }
  onDidViewCustomizationsStorageChange() {
    this._viewCustomizations = void 0;
    const newViewContainerCustomizations = new Map(Object.entries(this.viewCustomizations.viewContainerLocations));
    const newViewDescriptorCustomizations = new Map(Object.entries(this.viewCustomizations.viewLocations));
    const viewContainersToMove = [];
    const viewsToMove = [];
    for (const [containerId, location2] of newViewContainerCustomizations.entries()) {
      const container2 = this.getViewContainerById(containerId);
      if (container2) {
        if (location2 !== this.getViewContainerLocation(container2)) {
          viewContainersToMove.push([container2, location2]);
        }
      } else if (this.isGeneratedContainerId(containerId)) {
        this.registerGeneratedViewContainer(location2, containerId);
      }
    }
    for (const viewContainer of this.viewContainers) {
      if (!newViewContainerCustomizations.has(viewContainer.id)) {
        const currentLocation = this.getViewContainerLocation(viewContainer);
        const defaultLocation = this.getDefaultViewContainerLocation(viewContainer);
        if (currentLocation !== defaultLocation) {
          viewContainersToMove.push([viewContainer, defaultLocation]);
        }
      }
    }
    for (const [viewId, viewContainerId] of newViewDescriptorCustomizations.entries()) {
      const viewDescriptor3 = this.getViewDescriptorById(viewId);
      if (viewDescriptor3) {
        const prevViewContainer = this.getViewContainerByViewId(viewId);
        const newViewContainer = this.getViewContainerById(viewContainerId);
        if (prevViewContainer && newViewContainer && newViewContainer !== prevViewContainer) {
          viewsToMove.push({ views: [viewDescriptor3], from: prevViewContainer, to: newViewContainer });
        }
      }
    }
    for (const viewContainer of this.viewContainers) {
      const viewContainerModel = this.getViewContainerModel(viewContainer);
      for (const viewDescriptor3 of viewContainerModel.allViewDescriptors) {
        if (!newViewDescriptorCustomizations.has(viewDescriptor3.id)) {
          const currentContainer = this.getViewContainerByViewId(viewDescriptor3.id);
          const defaultContainer = this.getDefaultContainerById(viewDescriptor3.id);
          if (currentContainer && defaultContainer && currentContainer !== defaultContainer) {
            viewsToMove.push({ views: [viewDescriptor3], from: currentContainer, to: defaultContainer });
          }
        }
      }
    }
    for (const [container2, location2] of viewContainersToMove) {
      this.moveViewContainerToLocationWithoutSaving(container2, location2);
    }
    for (const { views, from, to } of viewsToMove) {
      this.moveViewsWithoutSaving(views, from, to, 0 /* Default */);
    }
    this.viewContainersCustomLocations = newViewContainerCustomizations;
    this.viewDescriptorsCustomLocations = newViewDescriptorCustomizations;
  }
  // Generated Container Id Format
  // {Common Prefix}.{Location}.{Uniqueness Id}
  // Old Format (deprecated)
  // {Common Prefix}.{Uniqueness Id}.{Source View Id}
  generateContainerId(location2) {
    return `${ViewDescriptorService.COMMON_CONTAINER_ID_PREFIX}.${ViewContainerLocationToString(location2)}.${generateUuid()}`;
  }
  saveViewCustomizations() {
    const viewCustomizations = { viewContainerLocations: {}, viewLocations: {}, viewContainerBadgeEnablementStates: {} };
    for (const [containerId, location2] of this.viewContainersCustomLocations) {
      const container2 = this.getViewContainerById(containerId);
      if (container2 && !this.isGeneratedContainerId(containerId) && location2 === this.getDefaultViewContainerLocation(container2)) {
        continue;
      }
      viewCustomizations.viewContainerLocations[containerId] = location2;
    }
    for (const [viewId, viewContainerId] of this.viewDescriptorsCustomLocations) {
      const viewContainer = this.getViewContainerById(viewContainerId);
      if (viewContainer) {
        const defaultContainer = this.getDefaultContainerById(viewId);
        if (defaultContainer?.id === viewContainer.id) {
          continue;
        }
      }
      viewCustomizations.viewLocations[viewId] = viewContainerId;
    }
    for (const [viewContainerId, badgeEnablementState] of this.viewContainerBadgeEnablementStates) {
      if (badgeEnablementState === false) {
        viewCustomizations.viewContainerBadgeEnablementStates[viewContainerId] = badgeEnablementState;
      }
    }
    this.viewCustomizations = viewCustomizations;
  }
  get viewCustomizations() {
    if (!this._viewCustomizations) {
      this._viewCustomizations = JSON.parse(this.getStoredViewCustomizationsValue());
      this._viewCustomizations.viewContainerLocations = this._viewCustomizations.viewContainerLocations ?? {};
      this._viewCustomizations.viewLocations = this._viewCustomizations.viewLocations ?? {};
      this._viewCustomizations.viewContainerBadgeEnablementStates = this._viewCustomizations.viewContainerBadgeEnablementStates ?? {};
    }
    return this._viewCustomizations;
  }
  set viewCustomizations(viewCustomizations) {
    const value2 = JSON.stringify(viewCustomizations);
    if (JSON.stringify(this.viewCustomizations) !== value2) {
      this._viewCustomizations = viewCustomizations;
      this.setStoredViewCustomizationsValue(value2);
    }
  }
  getStoredViewCustomizationsValue() {
    if (this.isSessionsWindow) {
      return "{}";
    }
    return this.storageService.get(ViewDescriptorService.VIEWS_CUSTOMIZATIONS, 0 /* PROFILE */, "{}");
  }
  setStoredViewCustomizationsValue(value2) {
    if (this.isSessionsWindow) {
      return;
    }
    this.storageService.store(ViewDescriptorService.VIEWS_CUSTOMIZATIONS, value2, 0 /* PROFILE */, 0 /* USER */);
  }
  getViewsByContainer(viewContainer) {
    const result = this.viewsRegistry.getViews(viewContainer).filter((viewDescriptor3) => {
      const viewDescriptorViewContainerId = this.viewDescriptorsCustomLocations.get(viewDescriptor3.id) ?? viewContainer.id;
      return viewDescriptorViewContainerId === viewContainer.id;
    });
    for (const [viewId, viewContainerId] of this.viewDescriptorsCustomLocations.entries()) {
      if (viewContainerId !== viewContainer.id) {
        continue;
      }
      if (this.viewsRegistry.getViewContainer(viewId) === viewContainer) {
        continue;
      }
      const viewDescriptor3 = this.getViewDescriptorById(viewId);
      if (viewDescriptor3) {
        result.push(viewDescriptor3);
      }
    }
    return result;
  }
  onDidRegisterViewContainer(viewContainer) {
    const defaultLocation = this.isGeneratedContainerId(viewContainer.id) ? true : this.getViewContainerLocation(viewContainer) === this.getDefaultViewContainerLocation(viewContainer);
    this.getOrCreateDefaultViewContainerLocationContextKey(viewContainer).set(defaultLocation);
    this.getOrRegisterViewContainerModel(viewContainer);
  }
  getOrRegisterViewContainerModel(viewContainer) {
    let viewContainerModel = this.viewContainerModels.get(viewContainer)?.viewContainerModel;
    if (!viewContainerModel) {
      const disposables = new DisposableStore();
      viewContainerModel = disposables.add(this.instantiationService.createInstance(ViewContainerModel, viewContainer));
      this.onDidChangeActiveViews({ added: viewContainerModel.activeViewDescriptors, removed: [] });
      viewContainerModel.onDidChangeActiveViewDescriptors((changed) => this.onDidChangeActiveViews(changed), this, disposables);
      this.onDidChangeVisibleViews({ added: [...viewContainerModel.visibleViewDescriptors], removed: [] });
      viewContainerModel.onDidAddVisibleViewDescriptors((added) => this.onDidChangeVisibleViews({ added: added.map(({ viewDescriptor: viewDescriptor3 }) => viewDescriptor3), removed: [] }), this, disposables);
      viewContainerModel.onDidRemoveVisibleViewDescriptors((removed) => this.onDidChangeVisibleViews({ added: [], removed: removed.map(({ viewDescriptor: viewDescriptor3 }) => viewDescriptor3) }), this, disposables);
      disposables.add(toDisposable(() => this.viewsVisibilityActionDisposables.deleteAndDispose(viewContainer)));
      disposables.add(this.registerResetViewContainerAction(viewContainer));
      const value2 = { viewContainerModel, disposables, dispose: () => disposables.dispose() };
      this.viewContainerModels.set(viewContainer, value2);
      this.onDidRegisterViews([{ views: this.viewsRegistry.getViews(viewContainer), viewContainer }]);
      const viewsToRegister = this.getViewsByContainer(viewContainer).filter((view) => this.getDefaultContainerById(view.id) !== viewContainer);
      if (viewsToRegister.length) {
        this.addViews(viewContainer, viewsToRegister);
        this.contextKeyService.bufferChangeEvents(() => {
          viewsToRegister.forEach((viewDescriptor3) => this.getOrCreateMovableViewContextKey(viewDescriptor3).set(!!viewDescriptor3.canMoveView));
        });
      }
      if (this.canRegisterViewsVisibilityActions) {
        this.registerViewsVisibilityActions(viewContainer, value2);
      }
    }
    return viewContainerModel;
  }
  onDidDeregisterViewContainer(viewContainer) {
    this.viewContainerModels.deleteAndDispose(viewContainer);
    this.viewsVisibilityActionDisposables.deleteAndDispose(viewContainer);
  }
  onDidChangeActiveViews({ added, removed }) {
    this.contextKeyService.bufferChangeEvents(() => {
      added.forEach((viewDescriptor3) => this.getOrCreateActiveViewContextKey(viewDescriptor3).set(true));
      removed.forEach((viewDescriptor3) => this.getOrCreateActiveViewContextKey(viewDescriptor3).set(false));
    });
  }
  onDidChangeVisibleViews({ added, removed }) {
    this.contextKeyService.bufferChangeEvents(() => {
      added.forEach((viewDescriptor3) => this.getOrCreateVisibleViewContextKey(viewDescriptor3).set(true));
      removed.forEach((viewDescriptor3) => this.getOrCreateVisibleViewContextKey(viewDescriptor3).set(false));
    });
  }
  registerViewsVisibilityActions(viewContainer, { viewContainerModel, disposables }) {
    this.viewsVisibilityActionDisposables.deleteAndDispose(viewContainer);
    this.viewsVisibilityActionDisposables.set(viewContainer, this.registerViewsVisibilityActionsForContainer(viewContainerModel));
    disposables.add(Event2.any(
      viewContainerModel.onDidChangeActiveViewDescriptors,
      viewContainerModel.onDidAddVisibleViewDescriptors,
      viewContainerModel.onDidRemoveVisibleViewDescriptors,
      viewContainerModel.onDidMoveVisibleViewDescriptors
    )((e4) => {
      this.viewsVisibilityActionDisposables.deleteAndDispose(viewContainer);
      this.viewsVisibilityActionDisposables.set(viewContainer, this.registerViewsVisibilityActionsForContainer(viewContainerModel));
    }));
  }
  registerViewsVisibilityActionsForContainer(viewContainerModel) {
    const disposables = new DisposableStore();
    viewContainerModel.activeViewDescriptors.forEach((viewDescriptor3, index2) => {
      if (!viewDescriptor3.remoteAuthority) {
        disposables.add(registerAction2(class extends ViewPaneContainerAction {
          constructor() {
            super({
              id: `${viewDescriptor3.id}.toggleVisibility`,
              viewPaneContainerId: viewContainerModel.viewContainer.id,
              precondition: viewDescriptor3.canToggleVisibility && (!viewContainerModel.isVisible(viewDescriptor3.id) || viewContainerModel.visibleViewDescriptors.length > 1) ? ContextKeyExpr.true() : ContextKeyExpr.false(),
              toggled: ContextKeyExpr.has(`${viewDescriptor3.id}.visible`),
              title: viewDescriptor3.name,
              metadata: {
                description: localize2(23719, "Toggles the visibility of the {0} view if the view container it is located in is visible", viewDescriptor3.name.value)
              },
              menu: [{
                id: ViewsSubMenu,
                when: ContextKeyExpr.equals("viewContainer", viewContainerModel.viewContainer.id),
                order: index2
              }, {
                id: MenuId.ViewContainerTitleContext,
                when: ContextKeyExpr.equals("viewContainer", viewContainerModel.viewContainer.id),
                order: index2,
                group: "1_toggleVisibility"
              }, {
                id: MenuId.ViewTitleContext,
                when: ContextKeyExpr.or(...viewContainerModel.visibleViewDescriptors.map((v2) => ContextKeyExpr.equals("view", v2.id))),
                order: index2,
                group: "2_toggleVisibility"
              }]
            });
          }
          async runInViewPaneContainer(serviceAccessor, viewPaneContainer) {
            viewPaneContainer.toggleViewVisibility(viewDescriptor3.id);
          }
        }));
        disposables.add(registerAction2(class extends ViewPaneContainerAction {
          constructor() {
            super({
              id: `${viewDescriptor3.id}.removeView`,
              viewPaneContainerId: viewContainerModel.viewContainer.id,
              title: localize(23716, null, viewDescriptor3.name.value),
              metadata: {
                description: localize2(23717, "Hides the {0} view if it is visible and the view container it is located in is visible", viewDescriptor3.name.value)
              },
              precondition: viewDescriptor3.canToggleVisibility && (!viewContainerModel.isVisible(viewDescriptor3.id) || viewContainerModel.visibleViewDescriptors.length > 1) ? ContextKeyExpr.true() : ContextKeyExpr.false(),
              menu: [{
                id: MenuId.ViewTitleContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewDescriptor3.id),
                  ContextKeyExpr.has(`${viewDescriptor3.id}.visible`)
                ),
                group: "1_hide",
                order: 1
              }]
            });
          }
          async runInViewPaneContainer(serviceAccessor, viewPaneContainer) {
            if (viewPaneContainer.getView(viewDescriptor3.id)?.isVisible()) {
              viewPaneContainer.toggleViewVisibility(viewDescriptor3.id);
            }
          }
        }));
      }
    });
    return disposables;
  }
  registerResetViewContainerAction(viewContainer) {
    const that = this;
    return registerAction2(class ResetViewLocationAction extends Action2 {
      constructor() {
        super({
          id: `${viewContainer.id}.resetViewContainerLocation`,
          title: localize2(23718, "Reset Location"),
          menu: [{
            id: MenuId.ViewContainerTitleContext,
            group: "1_viewActions",
            when: ContextKeyExpr.or(
              ContextKeyExpr.and(
                ContextKeyExpr.equals("viewContainer", viewContainer.id),
                ContextKeyExpr.equals(`${viewContainer.id}.defaultViewContainerLocation`, false)
              )
            )
          }]
        });
      }
      run(accessor) {
        that.moveViewContainerToLocation(viewContainer, that.getDefaultViewContainerLocation(viewContainer), void 0, this.desc.id);
        accessor.get(IViewsService).openViewContainer(viewContainer.id, true);
      }
    });
  }
  addViews(container2, views, visibilityState = 0 /* Default */) {
    this.contextKeyService.bufferChangeEvents(() => {
      views.forEach((view) => {
        const isDefaultContainer = this.getDefaultContainerById(view.id) === container2;
        this.getOrCreateDefaultViewLocationContextKey(view).set(isDefaultContainer);
        if (isDefaultContainer) {
          this.viewDescriptorsCustomLocations.delete(view.id);
        } else {
          this.viewDescriptorsCustomLocations.set(view.id, container2.id);
        }
      });
    });
    this.getViewContainerModel(container2).add(views.map((view) => {
      return {
        viewDescriptor: view,
        collapsed: visibilityState === 0 /* Default */ ? void 0 : false,
        visible: visibilityState === 0 /* Default */ ? void 0 : true
      };
    }));
  }
  removeViews(container2, views) {
    this.contextKeyService.bufferChangeEvents(() => {
      views.forEach((view) => {
        if (this.viewDescriptorsCustomLocations.get(view.id) === container2.id) {
          this.viewDescriptorsCustomLocations.delete(view.id);
        }
        this.getOrCreateDefaultViewLocationContextKey(view).set(false);
      });
    });
    this.getViewContainerModel(container2).remove(views);
  }
  getOrCreateActiveViewContextKey(viewDescriptor3) {
    const activeContextKeyId = `${viewDescriptor3.id}.active`;
    let contextKey = this.activeViewContextKeys.get(activeContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(activeContextKeyId, false).bindTo(this.contextKeyService);
      this.activeViewContextKeys.set(activeContextKeyId, contextKey);
    }
    return contextKey;
  }
  getOrCreateVisibleViewContextKey(viewDescriptor3) {
    const activeContextKeyId = `${viewDescriptor3.id}.visible`;
    let contextKey = this.activeViewContextKeys.get(activeContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(activeContextKeyId, false).bindTo(this.contextKeyService);
      this.activeViewContextKeys.set(activeContextKeyId, contextKey);
    }
    return contextKey;
  }
  getOrCreateMovableViewContextKey(viewDescriptor3) {
    const movableViewContextKeyId = `${viewDescriptor3.id}.canMove`;
    let contextKey = this.movableViewContextKeys.get(movableViewContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(movableViewContextKeyId, false).bindTo(this.contextKeyService);
      this.movableViewContextKeys.set(movableViewContextKeyId, contextKey);
    }
    return contextKey;
  }
  getOrCreateDefaultViewLocationContextKey(viewDescriptor3) {
    const defaultViewLocationContextKeyId = `${viewDescriptor3.id}.defaultViewLocation`;
    let contextKey = this.defaultViewLocationContextKeys.get(defaultViewLocationContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(defaultViewLocationContextKeyId, false).bindTo(this.contextKeyService);
      this.defaultViewLocationContextKeys.set(defaultViewLocationContextKeyId, contextKey);
    }
    return contextKey;
  }
  getOrCreateDefaultViewContainerLocationContextKey(viewContainer) {
    const defaultViewContainerLocationContextKeyId = `${viewContainer.id}.defaultViewContainerLocation`;
    let contextKey = this.defaultViewContainerLocationContextKeys.get(defaultViewContainerLocationContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(defaultViewContainerLocationContextKeyId, false).bindTo(this.contextKeyService);
      this.defaultViewContainerLocationContextKeys.set(defaultViewContainerLocationContextKeyId, contextKey);
    }
    return contextKey;
  }
};

ViewDescriptorService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, ILoggerService),
  __decorateParam(6, IWorkbenchEnvironmentService)
], ViewDescriptorService);

registerSingleton(IViewDescriptorService, ViewDescriptorService, 1 /* Delayed */);
export { getViewContainerStorageId, ViewDescriptorService };
