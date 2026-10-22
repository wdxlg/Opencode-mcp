// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorParts.ts
import { MultiWindowParts } from "./module-1563.mjs";
import { Emitter } from "./module-0017.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { EditorPartModalVisibleContext } from "./module-0950.mjs";
import { MainEditorPart } from "./module-3478.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { AuxiliaryEditorPart } from "./module-3479.mjs";
import { ModalEditorPart } from "./module-3480.mjs";
import { mainWindow } from "./module-0002.mjs";
import { localize } from "./module-0001.mjs";
import { getActiveElement, isAncestor, isHTMLElement } from "./module-0075.mjs";
import { generateUuid } from "./module-0190.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAuxiliaryWindowService } from "./module-2972.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/workbench/browser/parts/editor/editorParts.ts
var EditorParts = class extends MultiWindowParts {
  constructor(instantiationService, storageService, themeService, auxiliaryWindowService, contextKeyService) {
    super("workbench.editorParts", themeService, storageService);
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.auxiliaryWindowService = auxiliaryWindowService;
    this.contextKeyService = contextKeyService;
    //#region Scoped Instantiation Services
    this.mapPartToInstantiationService = /* @__PURE__ */ new Map();
    //#endregion
    //#region Auxiliary Editor Parts
    this._onDidCreateAuxiliaryEditorPart = this._register(new Emitter());
    this.onDidCreateAuxiliaryEditorPart = this._onDidCreateAuxiliaryEditorPart.event;
    this.modalEditorMaximized = false;
    this.workspaceMemento = this.getMemento(1 /* WORKSPACE */, 0 /* USER */);
    this.profileMemento = this.getMemento(0 /* PROFILE */, 1 /* MACHINE */);
    this._isReady = false;
    this.whenReadyPromise = new DeferredPromise();
    this.whenReady = this.whenReadyPromise.p;
    this.whenRestoredPromise = new DeferredPromise();
    this.whenRestored = this.whenRestoredPromise.p;
    //#endregion
    //#region Events
    this._onDidActiveGroupChange = this._register(new Emitter());
    this.onDidChangeActiveGroup = this._onDidActiveGroupChange.event;
    this._onDidAddGroup = this._register(new Emitter());
    this.onDidAddGroup = this._onDidAddGroup.event;
    this._onDidRemoveGroup = this._register(new Emitter());
    this.onDidRemoveGroup = this._onDidRemoveGroup.event;
    this._onDidMoveGroup = this._register(new Emitter());
    this.onDidMoveGroup = this._onDidMoveGroup.event;
    this._onDidActivateGroup = this._register(new Emitter());
    this.onDidActivateGroup = this._onDidActivateGroup.event;
    this._onDidChangeGroupIndex = this._register(new Emitter());
    this.onDidChangeGroupIndex = this._onDidChangeGroupIndex.event;
    this._onDidChangeGroupLocked = this._register(new Emitter());
    this.onDidChangeGroupLocked = this._onDidChangeGroupLocked.event;
    this._onDidChangeGroupMaximized = this._register(new Emitter());
    this.onDidChangeGroupMaximized = this._onDidChangeGroupMaximized.event;
    //#endregion
    //#region Editor Group Context Key Handling
    this.globalContextKeys = /* @__PURE__ */ new Map();
    this.scopedContextKeys = /* @__PURE__ */ new Map();
    this.contextKeyProviders = /* @__PURE__ */ new Map();
    this.registeredContextKeys = /* @__PURE__ */ new Map();
    this.contextKeyProviderDisposables = this._register(new DisposableMap());
    this.modalEditorVisibleContext = EditorPartModalVisibleContext.bindTo(this.contextKeyService);
    this.editorWorkingSets = (() => {
      const workingSetsRaw = this.storageService.get(EditorParts.EDITOR_WORKING_SETS_STORAGE_KEY, 1 /* WORKSPACE */);
      if (workingSetsRaw) {
        return JSON.parse(workingSetsRaw);
      }
      return [];
    })();
    const modalState = this.profileMemento[EditorParts.MODAL_EDITOR_STATE_STORAGE_KEY];
    if (modalState) {
      this.modalEditorMaximized = modalState.maximized;
      this.modalEditorSize = modalState.size;
      this.modalEditorPosition = modalState.position;
      this.modalEditorSidebarWidth = modalState.sidebarWidth;
      this.modalEditorSidebarHidden = modalState.sidebarHidden;
    }
    this.mainPart = this._register(this.createMainEditorPart());
    this._register(this.registerPart(this.mainPart));
    this.mostRecentActiveParts = [this.mainPart];
    this.restoreParts();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.onDidChangeMementoValue(1 /* WORKSPACE */, this._store)((e4) => this.onDidChangeMementoState(e4)));
    this.whenReady.then(() => this.registerGroupsContextKeyListeners());
  }
  createMainEditorPart() {
    return this.instantiationService.createInstance(MainEditorPart, this);
  }
  getScopedInstantiationService(part) {
    if (part === this.mainPart) {
      let mainPartInstantiationService = this.mapPartToInstantiationService.get(part.windowId);
      if (!mainPartInstantiationService) {
        mainPartInstantiationService = this.instantiationService.invokeFunction((accessor) => {
          const editorService = accessor.get(IEditorService);
          const statusbarService = accessor.get(IStatusbarService);
          const mainPartInstantiationService2 = this._register(this.mainPart.scopedInstantiationService.createChild(new ServiceCollection(
            [IEditorService, editorService.createScoped(this.mainPart, this._store)],
            [IStatusbarService, statusbarService.createScoped(statusbarService, this._store)]
          )));
          this.mapPartToInstantiationService.set(part.windowId, mainPartInstantiationService2);
          return mainPartInstantiationService2;
        });
      }
      return mainPartInstantiationService;
    }
    if (part === this.modalEditorPart && this.modalPartInstantiationService) {
      return this.modalPartInstantiationService;
    }
    return this.mapPartToInstantiationService.get(part.windowId) ?? this.instantiationService;
  }
  async createAuxiliaryEditorPart(options3) {
    const { part, instantiationService, disposables } = await this.instantiationService.createInstance(AuxiliaryEditorPart, this).create(this.getGroupsLabel(this._parts.size), options3);
    this.mapPartToInstantiationService.set(part.windowId, instantiationService);
    disposables.add(toDisposable(() => this.mapPartToInstantiationService.delete(part.windowId)));
    this._onDidAddGroup.fire(part.activeGroup);
    this._onDidCreateAuxiliaryEditorPart.fire(part);
    return part;
  }
  get activeModalEditorPart() {
    return this.modalEditorPart;
  }
  async createModalEditorPart(options3) {
    if (this.modalEditorPart) {
      this.modalEditorPart.updateOptions(options3);
      return this.modalEditorPart;
    }
    if (this.modalEditorPartCreatePromise) {
      const part = await this.modalEditorPartCreatePromise;
      part.updateOptions(options3);
      return part;
    }
    const createPromise = this.doCreateModalEditorPart(options3).finally(() => {
      this.modalEditorPartCreatePromise = void 0;
    });
    this.modalEditorPartCreatePromise = createPromise;
    return createPromise;
  }
  async doCreateModalEditorPart(options3) {
    this.modalEditorVisibleContext.set(true);
    let result;
    try {
      result = await this.instantiationService.createInstance(ModalEditorPart, this).create({
        ...options3,
        maximized: options3?.maximized ?? this.modalEditorMaximized,
        size: options3?.size ?? this.modalEditorSize,
        position: options3?.position ?? this.modalEditorPosition,
        sidebar: options3?.sidebar ? {
          ...options3.sidebar,
          sidebarWidth: options3.sidebar.sidebarWidth ?? this.modalEditorSidebarWidth,
          sidebarHidden: options3.sidebar.sidebarHidden ?? this.modalEditorSidebarHidden
        } : void 0
      });
    } catch (error) {
      this.modalEditorVisibleContext.set(false);
      throw error;
    }
    const { part, instantiationService, disposables } = result;
    this.modalEditorPart = part;
    this.modalPartInstantiationService = instantiationService;
    disposables.add(toDisposable(() => {
      this.modalEditorMaximized = part.maximized;
      this.modalEditorSize = part.size;
      this.modalEditorPosition = part.position;
      if (part.hasSidebar) {
        this.modalEditorSidebarWidth = part.sidebarWidth;
        this.modalEditorSidebarHidden = part.sidebarHidden || void 0;
      }
      this.modalPartInstantiationService = void 0;
      this.modalEditorPart = void 0;
      this.modalEditorVisibleContext.set(false);
    }));
    this._onDidAddGroup.fire(part.activeGroup);
    return part;
  }
  //#endregion
  //#region Registration
  registerPart(part) {
    const disposables = this._register(new DisposableStore());
    disposables.add(super.registerPart(part));
    this.registerEditorPartListeners(part, disposables);
    return disposables;
  }
  unregisterPart(part) {
    super.unregisterPart(part);
    this.parts.forEach((part2, index2) => {
      if (part2 === this.mainPart) {
        return;
      }
      part2.notifyGroupsLabelChange(this.getGroupsLabel(index2));
    });
  }
  registerEditorPartListeners(part, disposables) {
    disposables.add(part.onDidFocus(() => {
      this.doUpdateMostRecentActive(part, true);
      if (this._parts.size > 1) {
        this._onDidActiveGroupChange.fire(this.activeGroup);
      }
    }));
    disposables.add(toDisposable(() => {
      this.doUpdateMostRecentActive(part);
      if (part.windowId !== mainWindow.vscodeWindowId) {
        this._onDidActiveGroupChange.fire(this.activeGroup);
      }
    }));
    disposables.add(part.onDidChangeActiveGroup((group2) => this._onDidActiveGroupChange.fire(group2)));
    disposables.add(part.onDidAddGroup((group2) => this._onDidAddGroup.fire(group2)));
    disposables.add(part.onDidRemoveGroup((group2) => this._onDidRemoveGroup.fire(group2)));
    disposables.add(part.onDidMoveGroup((group2) => this._onDidMoveGroup.fire(group2)));
    disposables.add(part.onDidActivateGroup((e4) => {
      if (e4.reason === 1 /* PART_CLOSE */) {
        this.doUpdateMostRecentActive(part, true);
      }
      this._onDidActivateGroup.fire(e4);
    }));
    disposables.add(part.onDidChangeGroupMaximized((maximized) => this._onDidChangeGroupMaximized.fire(maximized)));
    disposables.add(part.onDidChangeGroupIndex((group2) => this._onDidChangeGroupIndex.fire(group2)));
    disposables.add(part.onDidChangeGroupLocked((group2) => this._onDidChangeGroupLocked.fire(group2)));
  }
  doUpdateMostRecentActive(part, makeMostRecentlyActive) {
    const index2 = this.mostRecentActiveParts.indexOf(part);
    if (index2 !== -1) {
      this.mostRecentActiveParts.splice(index2, 1);
    }
    if (makeMostRecentlyActive) {
      this.mostRecentActiveParts.unshift(part);
    }
  }
  getGroupsLabel(index2) {
    return localize(6672, null, index2 + 1);
  }
  //#endregion
  //#region Helpers
  getPartByDocument(document2) {
    const mruParts = this.mostRecentActiveParts;
    const mruDocumentParts = mruParts.filter((part) => part.element?.ownerDocument === document2);
    if (mruDocumentParts.length > 1) {
      const activeElement = getActiveElement();
      for (const part of mruDocumentParts) {
        const container2 = part.getContainer();
        if (container2 && isAncestor(activeElement, container2)) {
          return part;
        }
      }
      return mruDocumentParts[0];
    }
    return super.getPartByDocument(document2);
  }
  getPart(groupOrElement) {
    if (this._parts.size > 1) {
      if (isHTMLElement(groupOrElement)) {
        const element = groupOrElement;
        return this.getPartByDocument(element.ownerDocument);
      } else {
        const group2 = groupOrElement;
        let id2;
        if (typeof group2 === "number") {
          id2 = group2;
        } else {
          id2 = group2.id;
        }
        for (const part of this._parts) {
          if (part.hasGroup(id2)) {
            return part;
          }
        }
      }
    }
    return this.mainPart;
  }
  static {
    //#endregion
    //#region Lifecycle / State
    this.EDITOR_PARTS_UI_STATE_STORAGE_KEY = "editorparts.state";
  }
  static {
    this.MODAL_EDITOR_STATE_STORAGE_KEY = "editorparts.modalState";
  }
  get isReady() {
    return this._isReady;
  }
  async restoreParts() {
    await this.mainPart.whenReady;
    if (this.mainPart.willRestoreState) {
      const state = this.loadState();
      if (state) {
        await this.restoreState(state);
      }
    }
    const mostRecentActivePart = this.mostRecentActiveParts.at(0);
    mostRecentActivePart?.activeGroup.focus();
    this._isReady = true;
    this.whenReadyPromise.complete();
    await Promise.allSettled(this.parts.map((part) => part.whenRestored));
    this.whenRestoredPromise.complete();
  }
  loadState() {
    return this.workspaceMemento[EditorParts.EDITOR_PARTS_UI_STATE_STORAGE_KEY];
  }
  saveState() {
    const state = this.createState();
    if (state.auxiliary.length === 0) {
      delete this.workspaceMemento[EditorParts.EDITOR_PARTS_UI_STATE_STORAGE_KEY];
    } else {
      this.workspaceMemento[EditorParts.EDITOR_PARTS_UI_STATE_STORAGE_KEY] = state;
    }
    this.saveModalState();
  }
  saveModalState() {
    if (this.modalEditorPart) {
      this.modalEditorMaximized = this.modalEditorPart.maximized;
      this.modalEditorSize = this.modalEditorPart.size;
      this.modalEditorPosition = this.modalEditorPart.position;
      if (this.modalEditorPart.hasSidebar) {
        this.modalEditorSidebarWidth = this.modalEditorPart.sidebarWidth;
        this.modalEditorSidebarHidden = this.modalEditorPart.sidebarHidden || void 0;
      }
    }
    if (this.modalEditorMaximized || this.modalEditorSize || this.modalEditorPosition || this.modalEditorSidebarWidth || this.modalEditorSidebarHidden) {
      this.profileMemento[EditorParts.MODAL_EDITOR_STATE_STORAGE_KEY] = {
        maximized: this.modalEditorMaximized,
        size: this.modalEditorSize ? { width: this.modalEditorSize.width, height: this.modalEditorSize.height } : void 0,
        position: this.modalEditorPosition,
        sidebarWidth: this.modalEditorSidebarWidth,
        sidebarHidden: this.modalEditorSidebarHidden
      };
    } else {
      delete this.profileMemento[EditorParts.MODAL_EDITOR_STATE_STORAGE_KEY];
    }
  }
  createState() {
    return {
      auxiliary: this.parts.map((part) => ({ part, auxiliaryWindow: this.auxiliaryWindowService.getWindow(part.windowId) })).filter(({ auxiliaryWindow }) => auxiliaryWindow !== void 0).map(({ part, auxiliaryWindow }) => ({
        state: part.createState(),
        ...auxiliaryWindow.createState()
      })),
      mru: this.mostRecentActiveParts.map((part) => this.parts.indexOf(part))
    };
  }
  async restoreState(state) {
    if (state.auxiliary.length) {
      const auxiliaryEditorPartPromises = [];
      for (const auxiliaryEditorPartState of state.auxiliary) {
        auxiliaryEditorPartPromises.push(this.createAuxiliaryEditorPart(auxiliaryEditorPartState));
      }
      await Promise.allSettled(auxiliaryEditorPartPromises);
      if (state.mru.length === this.parts.length) {
        this.mostRecentActiveParts = state.mru.map((index2) => this.parts[index2]);
      } else {
        this.mostRecentActiveParts = [...this.parts];
      }
      await Promise.allSettled(this.parts.map((part) => part.whenReady));
    }
  }
  get hasRestorableState() {
    return this.parts.some((part) => part.hasRestorableState);
  }
  onDidChangeMementoState(e4) {
    if (e4.external && e4.scope === 1 /* WORKSPACE */) {
      this.reloadMemento(e4.scope);
      const state = this.loadState();
      if (state) {
        this.applyState(state);
      }
    }
  }
  async applyState(state) {
    for (const part of this.parts) {
      if (part === this.mainPart) {
        continue;
      }
      for (const group2 of part.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
        await group2.closeAllEditors({ excludeConfirming: true, force: true });
      }
      const closed = part.close();
      if (!closed) {
        return false;
      }
    }
    if (state !== "empty") {
      await this.restoreState(state);
    }
    return true;
  }
  static {
    //#endregion
    //#region Working Sets
    this.EDITOR_WORKING_SETS_STORAGE_KEY = "editor.workingSets";
  }
  saveWorkingSet(name) {
    const workingSet = {
      id: generateUuid(),
      name,
      main: this.mainPart.createState(),
      auxiliary: this.createState()
    };
    this.editorWorkingSets.push(workingSet);
    this.saveWorkingSets();
    return {
      id: workingSet.id,
      name: workingSet.name
    };
  }
  getWorkingSets() {
    return this.editorWorkingSets.map((workingSet) => ({ id: workingSet.id, name: workingSet.name }));
  }
  deleteWorkingSet(workingSet) {
    const index2 = this.indexOfWorkingSet(workingSet);
    if (typeof index2 === "number") {
      this.editorWorkingSets.splice(index2, 1);
      this.saveWorkingSets();
    }
  }
  async applyWorkingSet(workingSet, options3) {
    let workingSetState;
    if (workingSet === "empty") {
      workingSetState = "empty";
    } else {
      workingSetState = this.editorWorkingSets[this.indexOfWorkingSet(workingSet) ?? -1];
    }
    if (!workingSetState) {
      return false;
    }
    const applied = await this.applyState(workingSetState === "empty" ? workingSetState : workingSetState.auxiliary);
    if (!applied) {
      return false;
    }
    await this.mainPart.applyState(workingSetState === "empty" ? workingSetState : workingSetState.main, options3);
    if (!options3?.preserveFocus) {
      const mostRecentActivePart = this.mostRecentActiveParts.at(0);
      if (mostRecentActivePart) {
        await mostRecentActivePart.whenReady;
        mostRecentActivePart.activeGroup.focus();
      }
    }
    return true;
  }
  indexOfWorkingSet(workingSet) {
    for (let i2 = 0; i2 < this.editorWorkingSets.length; i2++) {
      if (this.editorWorkingSets[i2].id === workingSet.id) {
        return i2;
      }
    }
    return void 0;
  }
  saveWorkingSets() {
    this.storageService.store(EditorParts.EDITOR_WORKING_SETS_STORAGE_KEY, JSON.stringify(this.editorWorkingSets), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  //#endregion
  //#region Group Management
  get activeGroup() {
    return this.activePart.activeGroup;
  }
  get sideGroup() {
    return this.activePart.sideGroup;
  }
  get groups() {
    return this.getGroups();
  }
  get count() {
    return this.groups.length;
  }
  getGroups(order = 0 /* CREATION_TIME */) {
    if (this._parts.size > 1) {
      let parts;
      switch (order) {
        case 2 /* GRID_APPEARANCE */:
        // we currently do not have a way to compute by appearance over multiple windows
        case 0 /* CREATION_TIME */:
          parts = this.parts;
          break;
        case 1 /* MOST_RECENTLY_ACTIVE */:
          parts = distinct([...this.mostRecentActiveParts, ...this.parts]);
          break;
      }
      return parts.flatMap((part) => part.getGroups(order));
    }
    return this.mainPart.getGroups(order);
  }
  getGroup(identifier2) {
    if (this._parts.size > 1) {
      for (const part of this._parts) {
        const group2 = part.getGroup(identifier2);
        if (group2) {
          return group2;
        }
      }
    }
    return this.mainPart.getGroup(identifier2);
  }
  assertGroupView(group2) {
    let groupView;
    if (typeof group2 === "number") {
      groupView = this.getGroup(group2);
    } else {
      groupView = group2;
    }
    if (!groupView) {
      throw new Error("Invalid editor group provided!");
    }
    return groupView;
  }
  activateGroup(group2) {
    return this.getPart(group2).activateGroup(group2);
  }
  getSize(group2) {
    return this.getPart(group2).getSize(group2);
  }
  setSize(group2, size3) {
    this.getPart(group2).setSize(group2, size3);
  }
  arrangeGroups(arrangement, group2 = this.activePart.activeGroup) {
    this.getPart(group2).arrangeGroups(arrangement, group2);
  }
  toggleMaximizeGroup(group2 = this.activePart.activeGroup) {
    this.getPart(group2).toggleMaximizeGroup(group2);
  }
  toggleExpandGroup(group2 = this.activePart.activeGroup) {
    this.getPart(group2).toggleExpandGroup(group2);
  }
  restoreGroup(group2) {
    return this.getPart(group2).restoreGroup(group2);
  }
  applyLayout(layout2) {
    this.activePart.applyLayout(layout2);
  }
  getLayout() {
    return this.activePart.getLayout();
  }
  get orientation() {
    return this.activePart.orientation;
  }
  setGroupOrientation(orientation) {
    this.activePart.setGroupOrientation(orientation);
  }
  findGroup(scope, source = this.activeGroup, wrap) {
    const sourcePart = this.getPart(source);
    if (this._parts.size > 1) {
      const groups = this.getGroups(2 /* GRID_APPEARANCE */);
      if (scope.location === 0 /* FIRST */ || scope.location === 1 /* LAST */) {
        return scope.location === 0 /* FIRST */ ? groups[0] : groups[groups.length - 1];
      }
      const group2 = sourcePart.findGroup(scope, source, false);
      if (group2) {
        return group2;
      }
      if (scope.location === 2 /* NEXT */ || scope.location === 3 /* PREVIOUS */) {
        const sourceGroup = this.assertGroupView(source);
        const index2 = groups.indexOf(sourceGroup);
        if (scope.location === 2 /* NEXT */) {
          let nextGroup = groups[index2 + 1];
          if (!nextGroup && wrap) {
            nextGroup = groups[0];
          }
          return nextGroup;
        } else {
          let previousGroup = groups[index2 - 1];
          if (!previousGroup && wrap) {
            previousGroup = groups[groups.length - 1];
          }
          return previousGroup;
        }
      }
    }
    return sourcePart.findGroup(scope, source, wrap);
  }
  addGroup(location2, direction) {
    return this.getPart(location2).addGroup(location2, direction);
  }
  removeGroup(group2) {
    this.getPart(group2).removeGroup(group2);
  }
  moveGroup(group2, location2, direction) {
    return this.getPart(group2).moveGroup(group2, location2, direction);
  }
  mergeGroup(group2, target, options3) {
    return this.getPart(group2).mergeGroup(group2, target, options3);
  }
  mergeAllGroups(target, options3) {
    return this.activePart.mergeAllGroups(target, options3);
  }
  copyGroup(group2, location2, direction) {
    return this.getPart(group2).copyGroup(group2, location2, direction);
  }
  createEditorDropTarget(container2, delegate) {
    return this.getPart(container2).createEditorDropTarget(container2, delegate);
  }
  registerGroupsContextKeyListeners() {
    this._register(this.onDidChangeActiveGroup(() => this.updateGlobalContextKeys()));
    this.groups.forEach((group2) => this.registerGroupContextKeyProvidersListeners(group2));
    this._register(this.onDidAddGroup((group2) => this.registerGroupContextKeyProvidersListeners(group2)));
    this._register(this.onDidRemoveGroup((group2) => {
      this.scopedContextKeys.delete(group2.id);
      this.registeredContextKeys.delete(group2.id);
      this.contextKeyProviderDisposables.deleteAndDispose(group2.id);
    }));
  }
  updateGlobalContextKeys() {
    const activeGroupScopedContextKeys = this.scopedContextKeys.get(this.activeGroup.id);
    if (!activeGroupScopedContextKeys) {
      return;
    }
    for (const [key3, globalContextKey] of this.globalContextKeys) {
      const scopedContextKey = activeGroupScopedContextKeys.get(key3);
      if (scopedContextKey) {
        globalContextKey.set(scopedContextKey.get());
      } else {
        globalContextKey.reset();
      }
    }
  }
  bind(contextKey, group2) {
    let globalContextKey = this.globalContextKeys.get(contextKey.key);
    if (!globalContextKey) {
      globalContextKey = contextKey.bindTo(this.contextKeyService);
      this.globalContextKeys.set(contextKey.key, globalContextKey);
    }
    let groupScopedContextKeys = this.scopedContextKeys.get(group2.id);
    if (!groupScopedContextKeys) {
      groupScopedContextKeys = /* @__PURE__ */ new Map();
      this.scopedContextKeys.set(group2.id, groupScopedContextKeys);
    }
    let scopedContextKey = groupScopedContextKeys.get(contextKey.key);
    if (!scopedContextKey) {
      scopedContextKey = contextKey.bindTo(group2.scopedContextKeyService);
      groupScopedContextKeys.set(contextKey.key, scopedContextKey);
    }
    const that = this;
    return {
      get() {
        return scopedContextKey.get();
      },
      set(value2) {
        if (that.activeGroup === group2) {
          globalContextKey.set(value2);
        }
        scopedContextKey.set(value2);
      },
      reset() {
        if (that.activeGroup === group2) {
          globalContextKey.reset();
        }
        scopedContextKey.reset();
      }
    };
  }
  registerContextKeyProvider(provider) {
    if (this.contextKeyProviders.has(provider.contextKey.key) || this.globalContextKeys.has(provider.contextKey.key)) {
      throw new Error(`A context key provider for key ${provider.contextKey.key} already exists.`);
    }
    this.contextKeyProviders.set(provider.contextKey.key, provider);
    const setContextKeyForGroups = () => {
      for (const group2 of this.groups) {
        this.updateRegisteredContextKey(group2, provider);
      }
    };
    setContextKeyForGroups();
    const onDidChange = provider.onDidChange?.(() => setContextKeyForGroups());
    return toDisposable(() => {
      onDidChange?.dispose();
      this.globalContextKeys.delete(provider.contextKey.key);
      this.scopedContextKeys.forEach((scopedContextKeys) => scopedContextKeys.delete(provider.contextKey.key));
      this.contextKeyProviders.delete(provider.contextKey.key);
      this.registeredContextKeys.forEach((registeredContextKeys) => registeredContextKeys.delete(provider.contextKey.key));
    });
  }
  registerGroupContextKeyProvidersListeners(group2) {
    const disposable = group2.onDidActiveEditorChange(() => {
      for (const contextKeyProvider of this.contextKeyProviders.values()) {
        this.updateRegisteredContextKey(group2, contextKeyProvider);
      }
    });
    this.contextKeyProviderDisposables.set(group2.id, disposable);
  }
  updateRegisteredContextKey(group2, provider) {
    let groupRegisteredContextKeys = this.registeredContextKeys.get(group2.id);
    if (!groupRegisteredContextKeys) {
      groupRegisteredContextKeys = /* @__PURE__ */ new Map();
      this.registeredContextKeys.set(group2.id, groupRegisteredContextKeys);
    }
    let scopedRegisteredContextKey = groupRegisteredContextKeys.get(provider.contextKey.key);
    if (!scopedRegisteredContextKey) {
      scopedRegisteredContextKey = this.bind(provider.contextKey, group2);
      groupRegisteredContextKeys.set(provider.contextKey.key, scopedRegisteredContextKey);
    }
    scopedRegisteredContextKey.set(provider.getGroupContextKeyValue(group2));
  }
  //#endregion
  //#region Main Editor Part Only
  get partOptions() {
    return this.mainPart.partOptions;
  }
  get onDidChangeEditorPartOptions() {
    return this.mainPart.onDidChangeEditorPartOptions;
  }
  enforcePartOptions(options3) {
    return this.mainPart.enforcePartOptions(options3);
  }
  //#endregion
};

EditorParts = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IAuxiliaryWindowService),
  __decorateParam(4, IContextKeyService)
], EditorParts);

registerSingleton(IEditorGroupsService, EditorParts, 0 /* Eager */);
export { EditorParts };
