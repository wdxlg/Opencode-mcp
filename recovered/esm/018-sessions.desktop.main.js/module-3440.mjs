// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/paneCompositeBar.ts
import { Disposable, DisposableMap, DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { CompositeBar, CompositeDragAndDrop } from "./module-3439.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { CompositeBarAction, ToggleCompositeBadgeAction, ToggleCompositePinnedAction } from "./module-1556.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { StringSHA1 } from "./module-0039.mjs";
import { createCSSRule } from "./module-0224.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isString } from "./module-0010.mjs";
import { isNative } from "./module-0014.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Dimension, isMouseEvent } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IActivityService } from "./module-1448.mjs";


// src/vs/workbench/browser/parts/paneCompositeBar.ts
var PaneCompositeBar = class extends Disposable {
  constructor(location2, options3, part, paneCompositePart, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, layoutService) {
    super();
    this.location = location2;
    this.options = options3;
    this.part = part;
    this.paneCompositePart = paneCompositePart;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.viewDescriptorService = viewDescriptorService;
    this.viewService = viewService;
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.layoutService = layoutService;
    this.viewContainerDisposables = this._register(new DisposableMap());
    this.compositeActions = this._register(new DisposableMap());
    this.hasExtensionsRegistered = false;
    this._cachedViewContainers = void 0;
    this.dndHandler = new CompositeDragAndDrop(
      this.viewDescriptorService,
      this.location,
      this.options.orientation,
      async (id2, focus) => {
        return await this.paneCompositePart.openPaneComposite(id2, focus) ?? null;
      },
      (from, to, before) => this.compositeBar.move(from, to, this.options.orientation === 1 /* VERTICAL */ ? before?.verticallyBefore : before?.horizontallyBefore),
      () => this.compositeBar.getCompositeBarItems()
    );
    const cachedItems = this.cachedViewContainers.map((container2) => ({
      id: container2.id,
      name: container2.name,
      visible: !this.shouldBeHidden(container2.id, container2),
      order: container2.order,
      pinned: container2.pinned
    }));
    this.compositeBar = this.createCompositeBar(cachedItems);
    this.onDidRegisterViewContainers(this.getViewContainers());
    this.registerListeners();
  }
  createCompositeBar(cachedItems) {
    return this._register(this.instantiationService.createInstance(CompositeBar, cachedItems, {
      icon: this.options.icon,
      compact: this.options.compact,
      orientation: this.options.orientation,
      activityHoverOptions: this.options.activityHoverOptions,
      preventLoopNavigation: this.options.preventLoopNavigation,
      openComposite: async (compositeId, preserveFocus) => {
        return await this.paneCompositePart.openPaneComposite(compositeId, !preserveFocus) ?? null;
      },
      getActivityAction: (compositeId) => this.getCompositeActions(compositeId).activityAction,
      getCompositePinnedAction: (compositeId) => this.getCompositeActions(compositeId).pinnedAction,
      getCompositeBadgeAction: (compositeId) => this.getCompositeActions(compositeId).badgeAction,
      getOnCompositeClickAction: (compositeId) => this.getCompositeActions(compositeId).activityAction,
      fillExtraContextMenuActions: (actions, e4) => this.options.fillExtraContextMenuActions(actions, e4),
      getContextMenuActionsForComposite: (compositeId) => this.getContextMenuActionsForComposite(compositeId),
      getDefaultCompositeId: () => this.viewDescriptorService.getDefaultViewContainer(this.location)?.id,
      dndHandler: this.dndHandler,
      compositeSize: this.options.compositeSize,
      overflowActionSize: this.options.overflowActionSize,
      colors: (theme) => this.options.colors(theme)
    }));
  }
  getContextMenuActionsForComposite(compositeId) {
    const actions = [new Separator()];
    const viewContainer = this.viewDescriptorService.getViewContainerById(compositeId);
    const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
    const currentLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    const moveActions = [];
    for (const location2 of [0 /* Sidebar */, 2 /* AuxiliaryBar */, 1 /* Panel */]) {
      if (currentLocation !== location2) {
        moveActions.push(this.createMoveAction(viewContainer, location2, defaultLocation));
      }
    }
    actions.push(new SubmenuAction("moveToMenu", localize(6859, null), moveActions));
    if (defaultLocation !== currentLocation) {
      actions.push(toAction({
        id: "resetLocationAction",
        label: localize(6861, null),
        run: () => {
          this.viewDescriptorService.moveViewContainerToLocation(viewContainer, defaultLocation, void 0, "resetLocationAction");
          this.viewService.openViewContainer(viewContainer.id, true);
        }
      }));
    } else {
      const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
      if (viewContainerModel.allViewDescriptors.length === 1) {
        const viewToReset = viewContainerModel.allViewDescriptors[0];
        const defaultContainer = this.viewDescriptorService.getDefaultContainerById(viewToReset.id);
        if (defaultContainer !== viewContainer) {
          actions.push(toAction({
            id: "resetLocationAction",
            label: localize(6861, null),
            run: () => {
              this.viewDescriptorService.moveViewsToContainer([viewToReset], defaultContainer, void 0, "resetLocationAction");
              this.viewService.openViewContainer(viewContainer.id, true);
            }
          }));
        }
      }
    }
    return actions;
  }
  createMoveAction(viewContainer, newLocation, defaultLocation) {
    return toAction({
      id: `moveViewContainerTo${newLocation}`,
      label: newLocation === 1 /* Panel */ ? localize(6860, null) : newLocation === 0 /* Sidebar */ ? localize(6862, null) : localize(6858, null),
      run: () => {
        let index2;
        if (newLocation !== defaultLocation) {
          index2 = this.viewDescriptorService.getViewContainersByLocation(newLocation).length;
        } else {
          index2 = void 0;
        }
        this.viewDescriptorService.moveViewContainerToLocation(viewContainer, newLocation, index2);
        this.viewService.openViewContainer(viewContainer.id, true);
      }
    });
  }
  registerListeners() {
    this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeViewContainers(added, removed)));
    this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeViewContainerLocation(viewContainer, from, to)));
    this._register(this.paneCompositePart.onDidPaneCompositeOpen((e4) => this.onDidChangeViewContainerVisibility(e4.getId(), true)));
    this._register(this.paneCompositePart.onDidPaneCompositeClose((e4) => this.onDidChangeViewContainerVisibility(e4.getId(), false)));
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (this._store.isDisposed) {
        return;
      }
      this.onDidRegisterExtensions();
      this._register(this.compositeBar.onDidChange(() => {
        this.updateCompositeBarItemsFromStorage(true);
        this.saveCachedViewContainers();
      }));
      this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, this.options.pinnedViewContainersKey, this._store)(() => this.updateCompositeBarItemsFromStorage(false)));
    });
  }
  onDidChangeViewContainers(added, removed) {
    removed.filter(({ location: location2 }) => location2 === this.location).forEach(({ container: container2 }) => this.onDidDeregisterViewContainer(container2));
    this.onDidRegisterViewContainers(added.filter(({ location: location2 }) => location2 === this.location).map(({ container: container2 }) => container2));
  }
  onDidChangeViewContainerLocation(container2, from, to) {
    if (from === this.location) {
      this.onDidDeregisterViewContainer(container2);
    }
    if (to === this.location) {
      this.onDidRegisterViewContainers([container2]);
    }
  }
  onDidChangeViewContainerVisibility(id2, visible) {
    if (visible) {
      this.onDidViewContainerVisible(id2);
    } else {
      this.compositeBar.deactivateComposite(id2);
    }
  }
  onDidRegisterExtensions() {
    this.hasExtensionsRegistered = true;
    for (const { id: id2 } of this.cachedViewContainers) {
      const viewContainer = this.getViewContainer(id2);
      if (viewContainer) {
        this.showOrHideViewContainer(viewContainer);
      } else {
        if (this.viewDescriptorService.isViewContainerRemovedPermanently(id2)) {
          this.removeComposite(id2);
        } else {
          this.hideComposite(id2);
        }
      }
    }
    this.saveCachedViewContainers();
  }
  onDidViewContainerVisible(id2) {
    const viewContainer = this.getViewContainer(id2);
    if (viewContainer) {
      this.addComposite(viewContainer);
      this.compositeBar.activateComposite(viewContainer.id);
      if (this.shouldBeHidden(viewContainer)) {
        const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
        if (viewContainerModel.activeViewDescriptors.length === 0) {
          this.hideComposite(viewContainer.id);
        }
      }
    }
  }
  create(parent) {
    return this.compositeBar.create(parent);
  }
  getCompositeActions(compositeId) {
    let compositeActions = this.compositeActions.get(compositeId);
    if (!compositeActions) {
      const viewContainer = this.getViewContainer(compositeId);
      let activityAction;
      let pinnedAction;
      let badgeAction;
      if (viewContainer) {
        const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
        const actionItem = this.toCompositeBarActionItemFrom(viewContainerModel);
        activityAction = this.instantiationService.createInstance(ViewContainerActivityAction, actionItem, this.part, this.paneCompositePart);
        pinnedAction = new ToggleCompositePinnedAction(actionItem, this.compositeBar);
        badgeAction = new ToggleCompositeBadgeAction(actionItem, this.compositeBar);
      } else {
        const cachedComposite = this.cachedViewContainers.filter((c) => c.id === compositeId)[0];
        const actionItem = this.toCompositeBarActionItem(compositeId, cachedComposite?.name ?? compositeId, cachedComposite?.icon, void 0);
        activityAction = this.instantiationService.createInstance(PlaceHolderViewContainerActivityAction, actionItem, this.part, this.paneCompositePart);
        pinnedAction = new PlaceHolderToggleCompositePinnedAction(compositeId, this.compositeBar);
        badgeAction = new PlaceHolderToggleCompositeBadgeAction(compositeId, this.compositeBar);
      }
      const disposable = combinedDisposable(activityAction, pinnedAction, badgeAction);
      compositeActions = { activityAction, pinnedAction, badgeAction, dispose: () => disposable.dispose() };
      this.compositeActions.set(compositeId, compositeActions);
    }
    return compositeActions;
  }
  onDidRegisterViewContainers(viewContainers) {
    for (const viewContainer of viewContainers) {
      this.addComposite(viewContainer);
      const cachedViewContainer = this.cachedViewContainers.filter(({ id: id2 }) => id2 === viewContainer.id)[0];
      if (!cachedViewContainer) {
        this.compositeBar.pin(viewContainer.id);
      }
      const visibleViewContainer = this.paneCompositePart.getActivePaneComposite();
      if (visibleViewContainer?.getId() === viewContainer.id) {
        this.compositeBar.activateComposite(viewContainer.id);
      }
      const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
      this.updateCompositeBarActionItem(viewContainer, viewContainerModel);
      this.showOrHideViewContainer(viewContainer);
      const disposables = new DisposableStore();
      disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.updateCompositeBarActionItem(viewContainer, viewContainerModel)));
      disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.showOrHideViewContainer(viewContainer)));
      this.viewContainerDisposables.set(viewContainer.id, disposables);
    }
  }
  onDidDeregisterViewContainer(viewContainer) {
    this.viewContainerDisposables.deleteAndDispose(viewContainer.id);
    this.removeComposite(viewContainer.id);
  }
  updateCompositeBarActionItem(viewContainer, viewContainerModel) {
    const compositeBarActionItem = this.toCompositeBarActionItemFrom(viewContainerModel);
    const { activityAction, pinnedAction } = this.getCompositeActions(viewContainer.id);
    activityAction.updateCompositeBarActionItem(compositeBarActionItem);
    if (pinnedAction instanceof PlaceHolderToggleCompositePinnedAction) {
      pinnedAction.setActivity(compositeBarActionItem);
    }
    if (this.options.recomputeSizes) {
      this.compositeBar.recomputeSizes();
    }
    this.saveCachedViewContainers();
  }
  toCompositeBarActionItemFrom(viewContainerModel) {
    return this.toCompositeBarActionItem(viewContainerModel.viewContainer.id, viewContainerModel.title, viewContainerModel.icon, viewContainerModel.keybindingId);
  }
  toCompositeBarActionItem(id2, name, icon2, keybindingId) {
    let classNames2 = void 0;
    let iconUrl = void 0;
    if (this.options.icon) {
      if (URI.isUri(icon2)) {
        iconUrl = icon2;
        const cssUrl = asCSSUrl(icon2);
        const hash2 = new StringSHA1();
        hash2.update(cssUrl);
        const iconId = `activity-${id2.replace(/\./g, "-")}-${hash2.digest()}`;
        const iconClass = `.monaco-workbench .${this.options.partContainerClass} .monaco-action-bar .action-label.${iconId}`;
        classNames2 = [iconId, "uri-icon"];
        createCSSRule(iconClass, `
				mask: ${cssUrl} no-repeat 50% 50%;
				mask-size: var(--activity-bar-icon-size, ${this.options.iconSize}px);
				-webkit-mask: ${cssUrl} no-repeat 50% 50%;
				-webkit-mask-size: var(--activity-bar-icon-size, ${this.options.iconSize}px);
				mask-origin: padding;
				-webkit-mask-origin: padding;
			`);
      } else if (ThemeIcon.isThemeIcon(icon2)) {
        classNames2 = ThemeIcon.asClassNameArray(icon2);
      }
    }
    return { id: id2, name, classNames: classNames2, iconUrl, keybindingId };
  }
  showOrHideViewContainer(viewContainer) {
    if (this.shouldBeHidden(viewContainer)) {
      this.hideComposite(viewContainer.id);
    } else {
      this.addComposite(viewContainer);
      const activePaneComposite = this.paneCompositePart.getActivePaneComposite();
      if (activePaneComposite?.getId() === viewContainer.id) {
        this.compositeBar.activateComposite(viewContainer.id);
      }
    }
  }
  shouldBeHidden(viewContainerOrId, cachedViewContainer) {
    const viewContainer = isString(viewContainerOrId) ? this.getViewContainer(viewContainerOrId) : viewContainerOrId;
    const viewContainerId = isString(viewContainerOrId) ? viewContainerOrId : viewContainerOrId.id;
    if (viewContainer) {
      if (viewContainer.hideIfEmpty) {
        if (this.viewService.isViewContainerActive(viewContainerId)) {
          return false;
        }
      } else {
        return false;
      }
    }
    if (!this.hasExtensionsRegistered && !(this.part === "workbench.parts.sidebar" /* SIDEBAR_PART */ && this.environmentService.remoteAuthority && isNative)) {
      cachedViewContainer = cachedViewContainer || this.cachedViewContainers.find(({ id: id2 }) => id2 === viewContainerId);
      if (!viewContainer && cachedViewContainer?.isBuiltin && cachedViewContainer?.visible) {
        return false;
      }
      if (cachedViewContainer?.views?.length) {
        return cachedViewContainer.views.every(({ when }) => !!when && !this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(when)));
      }
    }
    return true;
  }
  addComposite(viewContainer) {
    this.compositeBar.addComposite({ id: viewContainer.id, name: typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
  }
  hideComposite(compositeId) {
    this.compositeBar.hideComposite(compositeId);
    const compositeActions = this.compositeActions.get(compositeId);
    if (compositeActions) {
      this.compositeActions.deleteAndDispose(compositeId);
    }
  }
  removeComposite(compositeId) {
    this.compositeBar.removeComposite(compositeId);
    const compositeActions = this.compositeActions.get(compositeId);
    if (compositeActions) {
      this.compositeActions.deleteAndDispose(compositeId);
    }
  }
  getPinnedPaneCompositeIds() {
    const pinnedCompositeIds = this.compositeBar.getPinnedComposites().map((v2) => v2.id);
    return this.getViewContainers().filter((v2) => this.compositeBar.isPinned(v2.id)).sort((v1, v2) => pinnedCompositeIds.indexOf(v1.id) - pinnedCompositeIds.indexOf(v2.id)).map((v2) => v2.id);
  }
  getVisiblePaneCompositeIds() {
    return this.compositeBar.getVisibleComposites().filter((v2) => this.paneCompositePart.getActivePaneComposite()?.getId() === v2.id || this.compositeBar.isPinned(v2.id)).map((v2) => v2.id);
  }
  getPaneCompositeIds() {
    return this.compositeBar.getVisibleComposites().map((v2) => v2.id);
  }
  getContextMenuActions() {
    return this.compositeBar.getContextMenuActions();
  }
  focus(index2) {
    this.compositeBar.focus(index2);
  }
  layout(width2, height) {
    this.compositeBar.layout(new Dimension(width2, height));
  }
  getViewContainer(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id2);
    return viewContainer && this.viewDescriptorService.getViewContainerLocation(viewContainer) === this.location ? viewContainer : void 0;
  }
  getViewContainers() {
    return this.viewDescriptorService.getViewContainersByLocation(this.location);
  }
  updateCompositeBarItemsFromStorage(retainExisting) {
    if (this.pinnedViewContainersValue === this.getStoredPinnedViewContainersValue()) {
      return;
    }
    this._placeholderViewContainersValue = void 0;
    this._pinnedViewContainersValue = void 0;
    this._cachedViewContainers = void 0;
    const newCompositeItems = [];
    const compositeItems = this.compositeBar.getCompositeBarItems();
    for (const cachedViewContainer of this.cachedViewContainers) {
      newCompositeItems.push({
        id: cachedViewContainer.id,
        name: cachedViewContainer.name,
        order: cachedViewContainer.order,
        pinned: cachedViewContainer.pinned,
        visible: cachedViewContainer.visible && !!this.getViewContainer(cachedViewContainer.id)
      });
    }
    for (const viewContainer of this.getViewContainers()) {
      if (!newCompositeItems.some(({ id: id2 }) => id2 === viewContainer.id)) {
        const index2 = compositeItems.findIndex(({ id: id2 }) => id2 === viewContainer.id);
        if (index2 !== -1) {
          const compositeItem = compositeItems[index2];
          newCompositeItems.splice(index2, 0, {
            id: viewContainer.id,
            name: typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
            order: compositeItem.order,
            pinned: compositeItem.pinned,
            visible: compositeItem.visible
          });
        } else {
          newCompositeItems.push({
            id: viewContainer.id,
            name: typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
            order: viewContainer.order,
            pinned: true,
            visible: !this.shouldBeHidden(viewContainer)
          });
        }
      }
    }
    if (retainExisting) {
      for (const compositeItem of compositeItems) {
        const newCompositeItem = newCompositeItems.find(({ id: id2 }) => id2 === compositeItem.id);
        if (!newCompositeItem) {
          newCompositeItems.push(compositeItem);
        }
      }
    }
    this.compositeBar.setCompositeBarItems(newCompositeItems);
  }
  saveCachedViewContainers() {
    const state = [];
    const compositeItems = this.compositeBar.getCompositeBarItems();
    for (const compositeItem of compositeItems) {
      const viewContainer = this.getViewContainer(compositeItem.id);
      if (viewContainer) {
        const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
        const views = [];
        for (const { when } of viewContainerModel.allViewDescriptors) {
          views.push({ when: when ? when.serialize() : void 0 });
        }
        state.push({
          id: compositeItem.id,
          name: viewContainerModel.title,
          icon: URI.isUri(viewContainerModel.icon) && this.environmentService.remoteAuthority ? void 0 : viewContainerModel.icon,
          // Do not cache uri icons with remote connection
          views,
          pinned: compositeItem.pinned,
          order: compositeItem.order,
          visible: compositeItem.visible,
          isBuiltin: !viewContainer.extensionId
        });
      } else {
        state.push({ id: compositeItem.id, name: compositeItem.name, pinned: compositeItem.pinned, order: compositeItem.order, visible: false, isBuiltin: false });
      }
    }
    this.storeCachedViewContainersState(state);
  }
  get cachedViewContainers() {
    if (this._cachedViewContainers === void 0) {
      this._cachedViewContainers = this.getPinnedViewContainers();
      for (const placeholderViewContainer of this.getPlaceholderViewContainers()) {
        const cachedViewContainer = this._cachedViewContainers.find((cached) => cached.id === placeholderViewContainer.id);
        if (cachedViewContainer) {
          cachedViewContainer.visible = placeholderViewContainer.visible ?? cachedViewContainer.visible;
          cachedViewContainer.name = placeholderViewContainer.name;
          cachedViewContainer.icon = placeholderViewContainer.themeIcon ? placeholderViewContainer.themeIcon : placeholderViewContainer.iconUrl ? URI.revive(placeholderViewContainer.iconUrl) : void 0;
          if (URI.isUri(cachedViewContainer.icon) && this.environmentService.remoteAuthority) {
            cachedViewContainer.icon = void 0;
          }
          cachedViewContainer.views = placeholderViewContainer.views;
          cachedViewContainer.isBuiltin = placeholderViewContainer.isBuiltin;
        }
      }
      for (const viewContainerWorkspaceState of this.getViewContainersWorkspaceState()) {
        const cachedViewContainer = this._cachedViewContainers.find((cached) => cached.id === viewContainerWorkspaceState.id);
        if (cachedViewContainer) {
          cachedViewContainer.visible = viewContainerWorkspaceState.visible ?? cachedViewContainer.visible;
        }
      }
    }
    return this._cachedViewContainers;
  }
  storeCachedViewContainersState(cachedViewContainers) {
    const pinnedViewContainers = this.getPinnedViewContainers();
    this.setPinnedViewContainers(cachedViewContainers.map(({ id: id2, pinned, order }) => ({
      id: id2,
      pinned,
      visible: Boolean(pinnedViewContainers.find(({ id: pinnedId }) => pinnedId === id2)?.visible),
      order
    })));
    this.setPlaceholderViewContainers(cachedViewContainers.map(({ id: id2, icon: icon2, name, views, isBuiltin }) => ({
      id: id2,
      iconUrl: URI.isUri(icon2) ? icon2 : void 0,
      themeIcon: ThemeIcon.isThemeIcon(icon2) ? icon2 : void 0,
      name,
      isBuiltin,
      views
    })));
    this.setViewContainersWorkspaceState(cachedViewContainers.map(({ id: id2, visible }) => ({
      id: id2,
      visible
    })));
  }
  getPinnedViewContainers() {
    return JSON.parse(this.pinnedViewContainersValue);
  }
  setPinnedViewContainers(pinnedViewContainers) {
    this.pinnedViewContainersValue = JSON.stringify(pinnedViewContainers);
  }
  get pinnedViewContainersValue() {
    if (!this._pinnedViewContainersValue) {
      this._pinnedViewContainersValue = this.getStoredPinnedViewContainersValue();
    }
    return this._pinnedViewContainersValue;
  }
  set pinnedViewContainersValue(pinnedViewContainersValue) {
    if (this.pinnedViewContainersValue !== pinnedViewContainersValue) {
      this._pinnedViewContainersValue = pinnedViewContainersValue;
      this.setStoredPinnedViewContainersValue(pinnedViewContainersValue);
    }
  }
  getStoredPinnedViewContainersValue() {
    return this.storageService.get(this.options.pinnedViewContainersKey, 0 /* PROFILE */, "[]");
  }
  setStoredPinnedViewContainersValue(value2) {
    this.storageService.store(this.options.pinnedViewContainersKey, value2, 0 /* PROFILE */, 0 /* USER */);
  }
  getPlaceholderViewContainers() {
    return JSON.parse(this.placeholderViewContainersValue);
  }
  setPlaceholderViewContainers(placeholderViewContainers) {
    this.placeholderViewContainersValue = JSON.stringify(placeholderViewContainers);
  }
  get placeholderViewContainersValue() {
    if (!this._placeholderViewContainersValue) {
      this._placeholderViewContainersValue = this.getStoredPlaceholderViewContainersValue();
    }
    return this._placeholderViewContainersValue;
  }
  set placeholderViewContainersValue(placeholderViewContainesValue) {
    if (this.placeholderViewContainersValue !== placeholderViewContainesValue) {
      this._placeholderViewContainersValue = placeholderViewContainesValue;
      this.setStoredPlaceholderViewContainersValue(placeholderViewContainesValue);
    }
  }
  getStoredPlaceholderViewContainersValue() {
    return this.storageService.get(this.options.placeholderViewContainersKey, 0 /* PROFILE */, "[]");
  }
  setStoredPlaceholderViewContainersValue(value2) {
    this.storageService.store(this.options.placeholderViewContainersKey, value2, 0 /* PROFILE */, 1 /* MACHINE */);
  }
  getViewContainersWorkspaceState() {
    return JSON.parse(this.viewContainersWorkspaceStateValue);
  }
  setViewContainersWorkspaceState(viewContainersWorkspaceState) {
    this.viewContainersWorkspaceStateValue = JSON.stringify(viewContainersWorkspaceState);
  }
  get viewContainersWorkspaceStateValue() {
    if (!this._viewContainersWorkspaceStateValue) {
      this._viewContainersWorkspaceStateValue = this.getStoredViewContainersWorkspaceStateValue();
    }
    return this._viewContainersWorkspaceStateValue;
  }
  set viewContainersWorkspaceStateValue(viewContainersWorkspaceStateValue) {
    if (this.viewContainersWorkspaceStateValue !== viewContainersWorkspaceStateValue) {
      this._viewContainersWorkspaceStateValue = viewContainersWorkspaceStateValue;
      this.setStoredViewContainersWorkspaceStateValue(viewContainersWorkspaceStateValue);
    }
  }
  getStoredViewContainersWorkspaceStateValue() {
    return this.storageService.get(this.options.viewContainersWorkspaceStateKey, 1 /* WORKSPACE */, "[]");
  }
  setStoredViewContainersWorkspaceStateValue(value2) {
    this.storageService.store(this.options.viewContainersWorkspaceStateKey, value2, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
};

PaneCompositeBar = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IViewDescriptorService),
  __decorateParam(8, IViewsService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IWorkbenchLayoutService)
], PaneCompositeBar);

var ViewContainerActivityAction = class extends CompositeBarAction {
  constructor(compositeBarActionItem, part, paneCompositePart, layoutService, configurationService, activityService) {
    super(compositeBarActionItem);
    this.part = part;
    this.paneCompositePart = paneCompositePart;
    this.layoutService = layoutService;
    this.configurationService = configurationService;
    this.activityService = activityService;
    this.lastRun = 0;
    this.updateActivity();
    this._register(this.activityService.onDidChangeActivity((viewContainerOrAction) => {
      if (!isString(viewContainerOrAction) && viewContainerOrAction.id === this.compositeBarActionItem.id) {
        this.updateActivity();
      }
    }));
  }
  static {
    this.preventDoubleClickDelay = 300;
  }
  updateCompositeBarActionItem(compositeBarActionItem) {
    this.compositeBarActionItem = compositeBarActionItem;
  }
  updateActivity() {
    this.activities = this.activityService.getViewContainerActivities(this.compositeBarActionItem.id);
  }
  async run(event) {
    if (isMouseEvent(event) && event.button === 2) {
      return;
    }
    const now = Date.now();
    if (now > this.lastRun && now - this.lastRun < ViewContainerActivityAction.preventDoubleClickDelay) {
      return;
    }
    this.lastRun = now;
    const focus = event && "preserveFocus" in event ? !event.preserveFocus : true;
    if (this.part === "workbench.parts.activitybar" /* ACTIVITYBAR_PART */) {
      const sideBarVisible = this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */);
      const activeViewlet = this.paneCompositePart.getActivePaneComposite();
      const focusBehavior = this.configurationService.getValue("workbench.activityBar.iconClickBehavior");
      if (sideBarVisible && activeViewlet?.getId() === this.compositeBarActionItem.id) {
        switch (focusBehavior) {
          case "focus":
            this.paneCompositePart.openPaneComposite(this.compositeBarActionItem.id, focus);
            break;
          case "toggle":
          default:
            this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
            break;
        }
        return;
      }
    }
    await this.paneCompositePart.openPaneComposite(this.compositeBarActionItem.id, focus);
    return this.activate();
  }
};

ViewContainerActivityAction = __decorateClass([
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IActivityService)
], ViewContainerActivityAction);

var PlaceHolderViewContainerActivityAction = class extends ViewContainerActivityAction {
};

var PlaceHolderToggleCompositePinnedAction = class extends ToggleCompositePinnedAction {
  constructor(id2, compositeBar) {
    super({ id: id2, name: id2, classNames: void 0 }, compositeBar);
  }
  setActivity(activity) {
    this.label = activity.name;
  }
};

var PlaceHolderToggleCompositeBadgeAction = class extends ToggleCompositeBadgeAction {
  constructor(id2, compositeBar) {
    super({ id: id2, name: id2, classNames: void 0 }, compositeBar);
  }
  setCompositeBarActionItem(actionItem) {
    this.label = actionItem.name;
  }
};
export { PaneCompositeBar, ViewContainerActivityAction, PlaceHolderViewContainerActivityAction, PlaceHolderToggleCompositePinnedAction, PlaceHolderToggleCompositeBadgeAction };
