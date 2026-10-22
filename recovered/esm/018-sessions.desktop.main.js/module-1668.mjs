// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/views/common/viewContainerModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Lazy } from "./module-0028.mjs";
import { Extensions13, VIEWS_LOG_ID, VIEWS_LOG_NAME, defaultViewIcon } from "./module-1094.mjs";
import { windowLogGroup } from "./module-1501.mjs";
import { isUndefined, isUndefinedOrNull } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { CounterSet } from "./module-0008.mjs";
import { Registry } from "./module-0090.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { coalesce, move } from "./module-0007.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/services/views/common/viewContainerModel.ts
function getViewsStateStorageId(viewContainerStorageId) {
  return `${viewContainerStorageId}.hidden`;
}

var ViewDescriptorsState = class extends Disposable {
  constructor(viewContainerStorageId, viewContainerName, storageService, loggerService) {
    super();
    this.viewContainerName = viewContainerName;
    this.storageService = storageService;
    this._onDidChangeStoredState = this._register(new Emitter());
    this.onDidChangeStoredState = this._onDidChangeStoredState.event;
    this.logger = new Lazy(() => loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, group: windowLogGroup }));
    this.globalViewsStateStorageId = getViewsStateStorageId(viewContainerStorageId);
    this.workspaceViewsStateStorageId = viewContainerStorageId;
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, this.globalViewsStateStorageId, this._store)(() => this.onDidStorageChange()));
    this.state = this.initialize();
  }
  set(id2, state) {
    this.state.set(id2, state);
  }
  get(id2) {
    return this.state.get(id2);
  }
  updateState(viewDescriptors) {
    this.updateWorkspaceState(viewDescriptors);
    this.updateGlobalState(viewDescriptors);
  }
  updateWorkspaceState(viewDescriptors) {
    const storedViewsStates = this.getStoredWorkspaceState();
    for (const viewDescriptor3 of viewDescriptors) {
      const viewState = this.get(viewDescriptor3.id);
      if (viewState) {
        storedViewsStates[viewDescriptor3.id] = {
          collapsed: !!viewState.collapsed,
          isHidden: !viewState.visibleWorkspace,
          size: viewState.size,
          order: viewDescriptor3.workspace && viewState ? viewState.order : void 0
        };
      }
    }
    if (Object.keys(storedViewsStates).length > 0) {
      this.storageService.store(this.workspaceViewsStateStorageId, JSON.stringify(storedViewsStates), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(this.workspaceViewsStateStorageId, 1 /* WORKSPACE */);
    }
  }
  updateGlobalState(viewDescriptors) {
    const storedGlobalState = this.getStoredGlobalState();
    for (const viewDescriptor3 of viewDescriptors) {
      const state = this.get(viewDescriptor3.id);
      storedGlobalState.set(viewDescriptor3.id, {
        id: viewDescriptor3.id,
        isHidden: state && viewDescriptor3.canToggleVisibility ? !state.visibleGlobal : false,
        order: !viewDescriptor3.workspace && state ? state.order : void 0
      });
    }
    this.setStoredGlobalState(storedGlobalState);
  }
  onDidStorageChange() {
    if (this.globalViewsStatesValue !== this.getStoredGlobalViewsStatesValue()) {
      this._globalViewsStatesValue = void 0;
      const storedViewsVisibilityStates = this.getStoredGlobalState();
      const storedWorkspaceViewsStates = this.getStoredWorkspaceState();
      const changedStates = [];
      for (const [id2, storedState] of storedViewsVisibilityStates) {
        const state = this.get(id2);
        if (state) {
          if (state.visibleGlobal !== !storedState.isHidden) {
            if (!storedState.isHidden) {
              this.logger.value.trace(`View visibility state changed: ${id2} is now visible`, this.viewContainerName);
            }
            changedStates.push({ id: id2, visible: !storedState.isHidden });
          }
        } else {
          const workspaceViewState = storedWorkspaceViewsStates[id2];
          this.set(id2, {
            active: false,
            visibleGlobal: !storedState.isHidden,
            visibleWorkspace: isUndefined(workspaceViewState?.isHidden) ? void 0 : !workspaceViewState?.isHidden,
            collapsed: workspaceViewState?.collapsed,
            order: workspaceViewState?.order,
            size: workspaceViewState?.size
          });
        }
      }
      if (changedStates.length) {
        this._onDidChangeStoredState.fire(changedStates);
        for (const changedState of changedStates) {
          const state = this.get(changedState.id);
          if (state) {
            state.visibleGlobal = changedState.visible;
          }
        }
      }
    }
  }
  initialize() {
    const viewStates = /* @__PURE__ */ new Map();
    const workspaceViewsStates = this.getStoredWorkspaceState();
    for (const id2 of Object.keys(workspaceViewsStates)) {
      const workspaceViewState = workspaceViewsStates[id2];
      viewStates.set(id2, {
        active: false,
        visibleGlobal: void 0,
        visibleWorkspace: isUndefined(workspaceViewState.isHidden) ? void 0 : !workspaceViewState.isHidden,
        collapsed: workspaceViewState.collapsed,
        order: workspaceViewState.order,
        size: workspaceViewState.size
      });
    }
    const value2 = this.storageService.get(this.globalViewsStateStorageId, 1 /* WORKSPACE */, "[]");
    const { state: workspaceVisibilityStates } = this.parseStoredGlobalState(value2);
    if (workspaceVisibilityStates.size > 0) {
      for (const { id: id2, isHidden } of workspaceVisibilityStates.values()) {
        const viewState = viewStates.get(id2);
        if (viewState) {
          if (isUndefined(viewState.visibleWorkspace)) {
            viewState.visibleWorkspace = !isHidden;
          }
        } else {
          viewStates.set(id2, {
            active: false,
            collapsed: void 0,
            visibleGlobal: void 0,
            visibleWorkspace: !isHidden
          });
        }
      }
      this.storageService.remove(this.globalViewsStateStorageId, 1 /* WORKSPACE */);
    }
    const { state, hasDuplicates } = this.parseStoredGlobalState(this.globalViewsStatesValue);
    if (hasDuplicates) {
      this.setStoredGlobalState(state);
    }
    for (const { id: id2, isHidden, order } of state.values()) {
      const viewState = viewStates.get(id2);
      if (viewState) {
        viewState.visibleGlobal = !isHidden;
        if (!isUndefined(order)) {
          viewState.order = order;
        }
      } else {
        viewStates.set(id2, {
          active: false,
          visibleGlobal: !isHidden,
          order,
          collapsed: void 0,
          visibleWorkspace: void 0
        });
      }
    }
    return viewStates;
  }
  getStoredWorkspaceState() {
    return JSON.parse(this.storageService.get(this.workspaceViewsStateStorageId, 1 /* WORKSPACE */, "{}"));
  }
  getStoredGlobalState() {
    return this.parseStoredGlobalState(this.globalViewsStatesValue).state;
  }
  setStoredGlobalState(storedGlobalState) {
    this.globalViewsStatesValue = JSON.stringify([...storedGlobalState.values()]);
  }
  parseStoredGlobalState(value2) {
    const storedValue = JSON.parse(value2);
    let hasDuplicates = false;
    const state = storedValue.reduce((result, storedState) => {
      if (typeof storedState === "string") {
        hasDuplicates = hasDuplicates || result.has(storedState);
        result.set(storedState, { id: storedState, isHidden: true });
      } else {
        hasDuplicates = hasDuplicates || result.has(storedState.id);
        result.set(storedState.id, storedState);
      }
      return result;
    }, /* @__PURE__ */ new Map());
    return { state, hasDuplicates };
  }
  get globalViewsStatesValue() {
    if (!this._globalViewsStatesValue) {
      this._globalViewsStatesValue = this.getStoredGlobalViewsStatesValue();
    }
    return this._globalViewsStatesValue;
  }
  set globalViewsStatesValue(globalViewsStatesValue) {
    if (this.globalViewsStatesValue !== globalViewsStatesValue) {
      this._globalViewsStatesValue = globalViewsStatesValue;
      this.setStoredGlobalViewsStatesValue(globalViewsStatesValue);
    }
  }
  getStoredGlobalViewsStatesValue() {
    return this.storageService.get(this.globalViewsStateStorageId, 0 /* PROFILE */, "[]");
  }
  setStoredGlobalViewsStatesValue(value2) {
    this.storageService.store(this.globalViewsStateStorageId, value2, 0 /* PROFILE */, 0 /* USER */);
  }
};

ViewDescriptorsState = __decorateClass([
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILoggerService)
], ViewDescriptorsState);

var ViewContainerModel = class extends Disposable {
  constructor(viewContainer, instantiationService, contextKeyService, loggerService) {
    super();
    this.viewContainer = viewContainer;
    this.contextKeyService = contextKeyService;
    this.contextKeys = new CounterSet();
    this.viewDescriptorItems = [];
    this._onDidChangeContainerInfo = this._register(new Emitter());
    this.onDidChangeContainerInfo = this._onDidChangeContainerInfo.event;
    this._onDidChangeAllViewDescriptors = this._register(new Emitter());
    this.onDidChangeAllViewDescriptors = this._onDidChangeAllViewDescriptors.event;
    this._onDidChangeActiveViewDescriptors = this._register(new Emitter());
    this.onDidChangeActiveViewDescriptors = this._onDidChangeActiveViewDescriptors.event;
    this._onDidAddVisibleViewDescriptors = this._register(new Emitter());
    this.onDidAddVisibleViewDescriptors = this._onDidAddVisibleViewDescriptors.event;
    this._onDidRemoveVisibleViewDescriptors = this._register(new Emitter());
    this.onDidRemoveVisibleViewDescriptors = this._onDidRemoveVisibleViewDescriptors.event;
    this._onDidMoveVisibleViewDescriptors = this._register(new Emitter());
    this.onDidMoveVisibleViewDescriptors = this._onDidMoveVisibleViewDescriptors.event;
    this.logger = new Lazy(() => loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, group: windowLogGroup }));
    this._register(Event2.filter(contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(this.contextKeys))(() => this.onDidChangeContext()));
    this.viewDescriptorsState = this._register(instantiationService.createInstance(ViewDescriptorsState, viewContainer.storageId || `${viewContainer.id}.state`, typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.original));
    this._register(this.viewDescriptorsState.onDidChangeStoredState((items) => this.updateVisibility(items)));
    this.updateContainerInfo();
  }
  get title() {
    return this._title;
  }
  get icon() {
    return this._icon;
  }
  get keybindingId() {
    return this._keybindingId;
  }
  // All View Descriptors
  get allViewDescriptors() {
    return this.viewDescriptorItems.map((item) => item.viewDescriptor);
  }
  // Active View Descriptors
  get activeViewDescriptors() {
    return this.viewDescriptorItems.filter((item) => item.state.active).map((item) => item.viewDescriptor);
  }
  // Visible View Descriptors
  get visibleViewDescriptors() {
    return this.viewDescriptorItems.filter((item) => this.isViewDescriptorVisible(item)).map((item) => item.viewDescriptor);
  }
  setTitle(title) {
    if (this.titleOverride === title) {
      return;
    }
    this.titleOverride = title;
    this.updateContainerInfo();
  }
  updateContainerInfo() {
    const useDefaultContainerInfo = this.viewContainer.alwaysUseContainerInfo || this.visibleViewDescriptors.length === 0 || this.visibleViewDescriptors.some((v2) => Registry.as(Extensions13.ViewsRegistry).getViewContainer(v2.id) === this.viewContainer);
    const computedTitle = useDefaultContainerInfo ? typeof this.viewContainer.title === "string" ? this.viewContainer.title : this.viewContainer.title.value : this.visibleViewDescriptors[0]?.containerTitle || this.visibleViewDescriptors[0]?.name?.value || "";
    const title = this.titleOverride ?? computedTitle;
    let titleChanged = false;
    if (this._title !== title) {
      this._title = title;
      titleChanged = true;
    }
    const icon2 = useDefaultContainerInfo ? this.viewContainer.icon : this.visibleViewDescriptors[0]?.containerIcon || defaultViewIcon;
    let iconChanged = false;
    if (!this.isEqualIcon(icon2)) {
      this._icon = icon2;
      iconChanged = true;
    }
    const keybindingId = this.viewContainer.openCommandActionDescriptor?.id ?? this.activeViewDescriptors.find((v2) => v2.openCommandActionDescriptor)?.openCommandActionDescriptor?.id;
    let keybindingIdChanged = false;
    if (this._keybindingId !== keybindingId) {
      this._keybindingId = keybindingId;
      keybindingIdChanged = true;
    }
    if (titleChanged || iconChanged || keybindingIdChanged) {
      this._onDidChangeContainerInfo.fire({ title: titleChanged, icon: iconChanged, keybindingId: keybindingIdChanged });
    }
  }
  isEqualIcon(icon2) {
    if (URI.isUri(icon2)) {
      return URI.isUri(this._icon) && isEqual2(icon2, this._icon);
    } else if (ThemeIcon.isThemeIcon(icon2)) {
      return ThemeIcon.isThemeIcon(this._icon) && ThemeIcon.isEqual(icon2, this._icon);
    }
    return icon2 === this._icon;
  }
  isVisible(id2) {
    const viewDescriptorItem = this.viewDescriptorItems.find((v2) => v2.viewDescriptor.id === id2);
    if (!viewDescriptorItem) {
      throw new Error(`Unknown view ${id2}`);
    }
    return this.isViewDescriptorVisible(viewDescriptorItem);
  }
  setVisible(id2, visible) {
    this.updateVisibility([{ id: id2, visible }]);
  }
  updateVisibility(viewDescriptors) {
    const viewDescriptorItemsToHide = coalesce(viewDescriptors.filter(({ visible }) => !visible).map(({ id: id2 }) => this.findAndIgnoreIfNotFound(id2)));
    const removed = [];
    for (const { viewDescriptorItem, visibleIndex } of viewDescriptorItemsToHide) {
      if (this.updateViewDescriptorItemVisibility(viewDescriptorItem, false)) {
        removed.push({ viewDescriptor: viewDescriptorItem.viewDescriptor, index: visibleIndex });
      }
    }
    if (removed.length) {
      this.broadCastRemovedVisibleViewDescriptors(removed);
    }
    const added = [];
    for (const { id: id2, visible } of viewDescriptors) {
      if (!visible) {
        continue;
      }
      const foundViewDescriptor = this.findAndIgnoreIfNotFound(id2);
      if (!foundViewDescriptor) {
        continue;
      }
      const { viewDescriptorItem, visibleIndex } = foundViewDescriptor;
      if (this.updateViewDescriptorItemVisibility(viewDescriptorItem, true)) {
        added.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
      }
    }
    if (added.length) {
      this.broadCastAddedVisibleViewDescriptors(added);
    }
  }
  updateViewDescriptorItemVisibility(viewDescriptorItem, visible) {
    if (!viewDescriptorItem.viewDescriptor.canToggleVisibility) {
      return false;
    }
    if (this.isViewDescriptorVisibleWhenActive(viewDescriptorItem) === visible) {
      return false;
    }
    if (viewDescriptorItem.viewDescriptor.workspace) {
      viewDescriptorItem.state.visibleWorkspace = visible;
    } else {
      viewDescriptorItem.state.visibleGlobal = visible;
      if (visible) {
        this.logger.value.trace(`Showing view ${viewDescriptorItem.viewDescriptor.id} in the container ${this.viewContainer.id}`);
      }
    }
    return this.isViewDescriptorVisible(viewDescriptorItem) === visible;
  }
  isCollapsed(id2) {
    return !!this.find(id2).viewDescriptorItem.state.collapsed;
  }
  setCollapsed(id2, collapsed2) {
    const { viewDescriptorItem } = this.find(id2);
    if (viewDescriptorItem.state.collapsed !== collapsed2) {
      viewDescriptorItem.state.collapsed = collapsed2;
    }
    this.viewDescriptorsState.updateState(this.allViewDescriptors);
  }
  getSize(id2) {
    return this.find(id2).viewDescriptorItem.state.size;
  }
  setSizes(newSizes) {
    for (const { id: id2, size: size3 } of newSizes) {
      const { viewDescriptorItem } = this.find(id2);
      if (viewDescriptorItem.state.size !== size3) {
        viewDescriptorItem.state.size = size3;
      }
    }
    this.viewDescriptorsState.updateState(this.allViewDescriptors);
  }
  move(from, to) {
    const fromIndex = this.viewDescriptorItems.findIndex((v2) => v2.viewDescriptor.id === from);
    const toIndex = this.viewDescriptorItems.findIndex((v2) => v2.viewDescriptor.id === to);
    const fromViewDescriptor = this.viewDescriptorItems[fromIndex];
    const toViewDescriptor = this.viewDescriptorItems[toIndex];
    move(this.viewDescriptorItems, fromIndex, toIndex);
    for (let index2 = 0; index2 < this.viewDescriptorItems.length; index2++) {
      this.viewDescriptorItems[index2].state.order = index2;
    }
    this.broadCastMovedViewDescriptors({ index: fromIndex, viewDescriptor: fromViewDescriptor.viewDescriptor }, { index: toIndex, viewDescriptor: toViewDescriptor.viewDescriptor });
  }
  add(addedViewDescriptorStates) {
    const addedItems = [];
    for (const addedViewDescriptorState of addedViewDescriptorStates) {
      const viewDescriptor3 = addedViewDescriptorState.viewDescriptor;
      if (viewDescriptor3.when) {
        for (const key3 of viewDescriptor3.when.keys()) {
          this.contextKeys.add(key3);
        }
      }
      let state = this.viewDescriptorsState.get(viewDescriptor3.id);
      if (state) {
        if (viewDescriptor3.workspace) {
          state.visibleWorkspace = isUndefinedOrNull(addedViewDescriptorState.visible) ? isUndefinedOrNull(state.visibleWorkspace) ? !viewDescriptor3.hideByDefault : state.visibleWorkspace : addedViewDescriptorState.visible;
        } else {
          const isVisible = state.visibleGlobal;
          state.visibleGlobal = isUndefinedOrNull(addedViewDescriptorState.visible) ? isUndefinedOrNull(state.visibleGlobal) ? !viewDescriptor3.hideByDefault : state.visibleGlobal : addedViewDescriptorState.visible;
          if (state.visibleGlobal && !isVisible) {
            this.logger.value.trace(`Added view ${viewDescriptor3.id} in the container ${this.viewContainer.id} and showing it.`, `${isVisible}`, `${viewDescriptor3.hideByDefault}`, `${addedViewDescriptorState.visible}`);
          }
        }
        state.collapsed = isUndefinedOrNull(addedViewDescriptorState.collapsed) ? isUndefinedOrNull(state.collapsed) ? !!viewDescriptor3.collapsed : state.collapsed : addedViewDescriptorState.collapsed;
      } else {
        state = {
          active: false,
          visibleGlobal: isUndefinedOrNull(addedViewDescriptorState.visible) ? !viewDescriptor3.hideByDefault : addedViewDescriptorState.visible,
          visibleWorkspace: isUndefinedOrNull(addedViewDescriptorState.visible) ? !viewDescriptor3.hideByDefault : addedViewDescriptorState.visible,
          collapsed: isUndefinedOrNull(addedViewDescriptorState.collapsed) ? !!viewDescriptor3.collapsed : addedViewDescriptorState.collapsed
        };
      }
      this.viewDescriptorsState.set(viewDescriptor3.id, state);
      state.active = this.contextKeyService.contextMatchesRules(viewDescriptor3.when);
      addedItems.push({ viewDescriptor: viewDescriptor3, state });
    }
    this.viewDescriptorItems.push(...addedItems);
    this.viewDescriptorItems.sort(this.compareViewDescriptors.bind(this));
    this._onDidChangeAllViewDescriptors.fire({ added: addedItems.map(({ viewDescriptor: viewDescriptor3 }) => viewDescriptor3), removed: [] });
    const addedActiveItems = [];
    for (const viewDescriptorItem of addedItems) {
      if (viewDescriptorItem.state.active) {
        addedActiveItems.push({ viewDescriptorItem, visible: this.isViewDescriptorVisible(viewDescriptorItem) });
      }
    }
    if (addedActiveItems.length) {
      this._onDidChangeActiveViewDescriptors.fire({ added: addedActiveItems.map(({ viewDescriptorItem }) => viewDescriptorItem.viewDescriptor), removed: [] });
    }
    const addedVisibleDescriptors = [];
    for (const { viewDescriptorItem, visible } of addedActiveItems) {
      if (visible && this.isViewDescriptorVisible(viewDescriptorItem)) {
        const { visibleIndex } = this.find(viewDescriptorItem.viewDescriptor.id);
        addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
      }
    }
    this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
  }
  remove(viewDescriptors) {
    const removed = [];
    const removedItems = [];
    const removedActiveDescriptors = [];
    const removedVisibleDescriptors = [];
    for (const viewDescriptor3 of viewDescriptors) {
      if (viewDescriptor3.when) {
        for (const key3 of viewDescriptor3.when.keys()) {
          this.contextKeys.delete(key3);
        }
      }
      const index2 = this.viewDescriptorItems.findIndex((i2) => i2.viewDescriptor.id === viewDescriptor3.id);
      if (index2 !== -1) {
        removed.push(viewDescriptor3);
        const viewDescriptorItem = this.viewDescriptorItems[index2];
        if (viewDescriptorItem.state.active) {
          removedActiveDescriptors.push(viewDescriptorItem.viewDescriptor);
        }
        if (this.isViewDescriptorVisible(viewDescriptorItem)) {
          const { visibleIndex } = this.find(viewDescriptorItem.viewDescriptor.id);
          removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor });
        }
        removedItems.push(viewDescriptorItem);
      }
    }
    removedItems.forEach((item) => this.viewDescriptorItems.splice(this.viewDescriptorItems.indexOf(item), 1));
    this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
    if (removedActiveDescriptors.length) {
      this._onDidChangeActiveViewDescriptors.fire({ added: [], removed: removedActiveDescriptors });
    }
    if (removed.length) {
      this._onDidChangeAllViewDescriptors.fire({ added: [], removed });
    }
  }
  onDidChangeContext() {
    const addedActiveItems = [];
    const removedActiveItems = [];
    for (const item of this.viewDescriptorItems) {
      const wasActive = item.state.active;
      const isActive2 = this.contextKeyService.contextMatchesRules(item.viewDescriptor.when);
      if (wasActive !== isActive2) {
        if (isActive2) {
          addedActiveItems.push({ item, visibleWhenActive: this.isViewDescriptorVisibleWhenActive(item) });
        } else {
          removedActiveItems.push(item);
        }
      }
    }
    const removedVisibleDescriptors = [];
    for (const item of removedActiveItems) {
      if (this.isViewDescriptorVisible(item)) {
        const { visibleIndex } = this.find(item.viewDescriptor.id);
        removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor });
      }
    }
    removedActiveItems.forEach((item) => item.state.active = false);
    addedActiveItems.forEach(({ item }) => item.state.active = true);
    this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
    if (addedActiveItems.length || removedActiveItems.length) {
      this._onDidChangeActiveViewDescriptors.fire({ added: addedActiveItems.map(({ item }) => item.viewDescriptor), removed: removedActiveItems.map((item) => item.viewDescriptor) });
    }
    const addedVisibleDescriptors = [];
    for (const { item, visibleWhenActive } of addedActiveItems) {
      if (visibleWhenActive && this.isViewDescriptorVisible(item)) {
        const { visibleIndex } = this.find(item.viewDescriptor.id);
        addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor, size: item.state.size, collapsed: !!item.state.collapsed });
      }
    }
    this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
  }
  broadCastAddedVisibleViewDescriptors(added) {
    if (added.length) {
      this._onDidAddVisibleViewDescriptors.fire(added.sort((a, b) => a.index - b.index));
      this.updateState(`Added views:${added.map((v2) => v2.viewDescriptor.id).join(",")} in ${this.viewContainer.id}`);
    }
  }
  broadCastRemovedVisibleViewDescriptors(removed) {
    if (removed.length) {
      this._onDidRemoveVisibleViewDescriptors.fire(removed.sort((a, b) => b.index - a.index));
      this.updateState(`Removed views:${removed.map((v2) => v2.viewDescriptor.id).join(",")} from ${this.viewContainer.id}`);
    }
  }
  broadCastMovedViewDescriptors(from, to) {
    this._onDidMoveVisibleViewDescriptors.fire({ from, to });
    this.updateState(`Moved view ${from.viewDescriptor.id} to ${to.viewDescriptor.id} in ${this.viewContainer.id}`);
  }
  updateState(reason) {
    this.logger.value.trace(reason);
    this.viewDescriptorsState.updateState(this.allViewDescriptors);
    this.updateContainerInfo();
  }
  isViewDescriptorVisible(viewDescriptorItem) {
    if (!viewDescriptorItem.state.active) {
      return false;
    }
    return this.isViewDescriptorVisibleWhenActive(viewDescriptorItem);
  }
  isViewDescriptorVisibleWhenActive(viewDescriptorItem) {
    if (viewDescriptorItem.viewDescriptor.workspace) {
      return !!viewDescriptorItem.state.visibleWorkspace;
    }
    return !!viewDescriptorItem.state.visibleGlobal;
  }
  find(id2) {
    const result = this.findAndIgnoreIfNotFound(id2);
    if (result) {
      return result;
    }
    throw new Error(`view descriptor ${id2} not found`);
  }
  findAndIgnoreIfNotFound(id2) {
    for (let i2 = 0, visibleIndex = 0; i2 < this.viewDescriptorItems.length; i2++) {
      const viewDescriptorItem = this.viewDescriptorItems[i2];
      if (viewDescriptorItem.viewDescriptor.id === id2) {
        return { index: i2, visibleIndex, viewDescriptorItem };
      }
      if (this.isViewDescriptorVisible(viewDescriptorItem)) {
        visibleIndex++;
      }
    }
    return void 0;
  }
  compareViewDescriptors(a, b) {
    if (a.viewDescriptor.id === b.viewDescriptor.id) {
      return 0;
    }
    return this.getViewOrder(a) - this.getViewOrder(b) || this.getGroupOrderResult(a.viewDescriptor, b.viewDescriptor);
  }
  getViewOrder(viewDescriptorItem) {
    const viewOrder = typeof viewDescriptorItem.state.order === "number" ? viewDescriptorItem.state.order : viewDescriptorItem.viewDescriptor.order;
    return typeof viewOrder === "number" ? viewOrder : Number.MAX_VALUE;
  }
  getGroupOrderResult(a, b) {
    if (!a.group || !b.group) {
      return 0;
    }
    if (a.group === b.group) {
      return 0;
    }
    return a.group < b.group ? -1 : 1;
  }
};

ViewContainerModel = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ILoggerService)
], ViewContainerModel);
export { getViewsStateStorageId, ViewDescriptorsState, ViewContainerModel };
