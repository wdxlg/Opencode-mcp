// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/auxiliaryEditorPart.ts
import { DisposableStore, MutableDisposable, markAsSingleton } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IsAuxiliaryWindowContext, IsAuxiliaryWindowFocusedContext, IsCompactTitleBarContext } from "./module-0949.mjs";
import { $, getActiveWindow, hide, show } from "./module-0075.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IEditorService } from "./module-0934.mjs";
import { isNative } from "./module-0014.mjs";
import { hasCustomTitlebar } from "./module-0515.mjs";
import { IWorkbenchLayoutService, shouldShowCustomTitleBar } from "./module-1118.mjs";
import { onDidChangeFullscreen } from "./module-0018.mjs";
import { WindowTitle } from "./module-1495.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAuxiliaryWindowService } from "./module-1594.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITitleService } from "./module-1595.mjs";
import { EditorPart } from "./module-1588.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/browser/parts/editor/auxiliaryEditorPart.ts
var compactWindowEmitter = markAsSingleton(new Emitter());

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleCompactAuxiliaryWindow",
      title: localize2(6271, "Toggle Window Compact Mode"),
      category: Categories.View,
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext
    });
  }
  async run() {
    compactWindowEmitter.fire({ windowId: getActiveWindow().vscodeWindowId, compact: "toggle" });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.enableCompactAuxiliaryWindow",
      title: localize(6270, null),
      icon: Codicon.screenFull,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsCompactTitleBarContext.toNegated(), IsAuxiliaryWindowContext),
        order: 0,
        group: "navigation"
      }
    });
  }
  async run() {
    compactWindowEmitter.fire({ windowId: getActiveWindow().vscodeWindowId, compact: true });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.disableCompactAuxiliaryWindow",
      title: localize(6269, null),
      icon: Codicon.screenNormal,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsCompactTitleBarContext, IsAuxiliaryWindowContext),
        order: 0,
        group: "navigation"
      }
    });
  }
  async run() {
    compactWindowEmitter.fire({ windowId: getActiveWindow().vscodeWindowId, compact: false });
  }
});

var AuxiliaryEditorPart = class {
  constructor(editorPartsView, instantiationService, auxiliaryWindowService, lifecycleService, configurationService, statusbarService, titleService, editorService, layoutService) {
    this.editorPartsView = editorPartsView;
    this.instantiationService = instantiationService;
    this.auxiliaryWindowService = auxiliaryWindowService;
    this.lifecycleService = lifecycleService;
    this.configurationService = configurationService;
    this.statusbarService = statusbarService;
    this.titleService = titleService;
    this.editorService = editorService;
    this.layoutService = layoutService;
  }
  static {
    this.STATUS_BAR_VISIBILITY = "workbench.statusBar.visible";
  }
  async create(label3, options3) {
    const that = this;
    const disposables = new DisposableStore();
    let compact2 = Boolean(options3?.compact);
    function computeEditorPartHeightOffset() {
      let editorPartHeightOffset = 0;
      if (statusbarVisible) {
        editorPartHeightOffset += statusbarPart.height;
      }
      if (titlebarPart && titlebarVisible) {
        editorPartHeightOffset += titlebarPart.height;
      }
      return editorPartHeightOffset;
    }
    function updateStatusbarVisibility(fromEvent) {
      if (statusbarVisible) {
        show(statusbarPart.container);
      } else {
        hide(statusbarPart.container);
      }
      if (fromEvent) {
        auxiliaryWindow.layout();
      }
    }
    function updateTitlebarVisibility(fromEvent) {
      if (!titlebarPart) {
        return;
      }
      if (titlebarVisible) {
        show(titlebarPart.container);
      } else {
        hide(titlebarPart.container);
      }
      if (fromEvent) {
        auxiliaryWindow.layout();
      }
    }
    function updateCompact(newCompact) {
      if (newCompact === compact2) {
        return;
      }
      compact2 = newCompact;
      auxiliaryWindow.updateOptions({ compact: compact2 });
      titlebarPart?.updateOptions({ compact: compact2 });
      editorPart.updateOptions({ compact: compact2 });
      const oldStatusbarVisible = statusbarVisible;
      statusbarVisible = !compact2 && that.configurationService.getValue(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY) !== false;
      if (oldStatusbarVisible !== statusbarVisible) {
        updateStatusbarVisibility(true);
      }
    }
    const auxiliaryWindow = disposables.add(await this.auxiliaryWindowService.open(options3));
    const editorPartContainer = $(".part.editor", { role: "main" });
    editorPartContainer.style.position = "relative";
    auxiliaryWindow.container.appendChild(editorPartContainer);
    const editorPart = disposables.add(this.instantiationService.createInstance(AuxiliaryEditorPartImpl, auxiliaryWindow.window.vscodeWindowId, this.editorPartsView, options3?.state, label3));
    editorPart.updateOptions({ compact: compact2 });
    disposables.add(this.editorPartsView.registerPart(editorPart));
    editorPart.create(editorPartContainer);
    const scopedEditorPartInstantiationService = disposables.add(editorPart.scopedInstantiationService.createChild(new ServiceCollection(
      [IEditorService, this.editorService.createScoped(editorPart, disposables)]
    )));
    let titlebarPart = void 0;
    let titlebarVisible = false;
    const useCustomTitle = isNative && hasCustomTitlebar(this.configurationService);
    if (useCustomTitle) {
      titlebarPart = disposables.add(this.titleService.createAuxiliaryTitlebarPart(auxiliaryWindow.container, editorPart, scopedEditorPartInstantiationService));
      titlebarPart.updateOptions({ compact: compact2 });
      titlebarVisible = shouldShowCustomTitleBar(this.configurationService, auxiliaryWindow.window, void 0);
      const handleTitleBarVisibilityEvent = () => {
        const oldTitlebarPartVisible = titlebarVisible;
        titlebarVisible = shouldShowCustomTitleBar(this.configurationService, auxiliaryWindow.window, void 0);
        if (oldTitlebarPartVisible !== titlebarVisible) {
          updateTitlebarVisibility(true);
        }
      };
      disposables.add(titlebarPart.onDidChange(() => auxiliaryWindow.layout()));
      disposables.add(this.layoutService.onDidChangePartVisibility(() => handleTitleBarVisibilityEvent()));
      disposables.add(onDidChangeFullscreen((windowId) => {
        if (windowId !== auxiliaryWindow.window.vscodeWindowId) {
          return;
        }
        handleTitleBarVisibilityEvent();
      }));
      updateTitlebarVisibility(false);
    } else {
      disposables.add(scopedEditorPartInstantiationService.createInstance(WindowTitle, auxiliaryWindow.window));
    }
    const statusbarPart = disposables.add(this.statusbarService.createAuxiliaryStatusbarPart(auxiliaryWindow.container, scopedEditorPartInstantiationService));
    let statusbarVisible = !compact2 && this.configurationService.getValue(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY) !== false;
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY)) {
        statusbarVisible = !compact2 && this.configurationService.getValue(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY) !== false;
        updateStatusbarVisibility(true);
      }
    }));
    updateStatusbarVisibility(false);
    const editorCloseListener = disposables.add(Event2.once(editorPart.onWillClose)(() => auxiliaryWindow.window.close()));
    disposables.add(Event2.once(auxiliaryWindow.onUnload)(() => {
      if (disposables.isDisposed) {
        return;
      }
      editorCloseListener.dispose();
      editorPart.close();
      disposables.dispose();
    }));
    disposables.add(Event2.once(this.lifecycleService.onDidShutdown)(() => disposables.dispose()));
    disposables.add(auxiliaryWindow.onBeforeUnload((event) => {
      for (const group2 of editorPart.groups) {
        for (const editor of group2.editors) {
          const canMoveVeto = editor.canMove(group2.id, this.editorPartsView.mainPart.activeGroup.id);
          if (typeof canMoveVeto === "string") {
            group2.openEditor(editor);
            event.veto(canMoveVeto);
            return;
          }
        }
      }
    }));
    disposables.add(auxiliaryWindow.onWillLayout((dimension) => {
      const titlebarPartHeight = titlebarPart?.height ?? 0;
      titlebarPart?.layout(dimension.width, titlebarPartHeight, 0, 0);
      const editorPartHeight = dimension.height - computeEditorPartHeightOffset();
      editorPart.layout(dimension.width, editorPartHeight, titlebarPartHeight, 0);
      statusbarPart.layout(dimension.width, statusbarPart.height, dimension.height - statusbarPart.height, 0);
    }));
    auxiliaryWindow.layout();
    disposables.add(compactWindowEmitter.event((e) => {
      if (e.windowId === auxiliaryWindow.window.vscodeWindowId) {
        let newCompact;
        if (typeof e.compact === "boolean") {
          newCompact = e.compact;
        } else {
          newCompact = !compact2;
        }
        updateCompact(newCompact);
      }
    }));
    disposables.add(editorPart.onDidAddGroup((group2) => {
      updateCompact(false);
      disposables.add(group2.onDidActiveEditorChange(() => {
        if (group2.count > 1) {
          updateCompact(false);
        }
      }));
    }));
    disposables.add(editorPart.activeGroup.onDidActiveEditorChange(() => {
      if (editorPart.activeGroup.count > 1) {
        updateCompact(false);
      }
    }));
    const scopedInstantiationService = disposables.add(scopedEditorPartInstantiationService.createChild(new ServiceCollection(
      [IStatusbarService, this.statusbarService.createScoped(statusbarPart, disposables)]
    )));
    return {
      part: editorPart,
      instantiationService: scopedInstantiationService,
      disposables
    };
  }
};

AuxiliaryEditorPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAuxiliaryWindowService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, ITitleService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IWorkbenchLayoutService)
], AuxiliaryEditorPart);

var AuxiliaryEditorPartImpl = class extends EditorPart {
  constructor(windowId, editorPartsView, state, groupsLabel, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
    const id2 = AuxiliaryEditorPartImpl.COUNTER++;
    super(editorPartsView, `workbench.parts.auxiliaryEditor.${id2}`, groupsLabel, windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
    this.state = state;
    this._onWillClose = this._register(new Emitter());
    this.onWillClose = this._onWillClose.event;
    this.optionsDisposable = this._register(new MutableDisposable());
    this.isCompact = false;
  }
  static {
    this.COUNTER = 1;
  }
  handleContextKeys() {
    const isAuxiliaryWindowContext = IsAuxiliaryWindowContext.bindTo(this.scopedContextKeyService);
    isAuxiliaryWindowContext.set(true);
    super.handleContextKeys();
  }
  updateOptions(options3) {
    this.isCompact = options3.compact;
    if (options3.compact) {
      if (!this.optionsDisposable.value) {
        this.optionsDisposable.value = this.enforcePartOptions({
          showTabs: "none",
          showBreadcrumbs: false,
          closeEmptyGroups: true
        });
      }
    } else {
      this.optionsDisposable.clear();
    }
  }
  addGroup(location2, direction, groupToCopy) {
    if (this.isCompact) {
      location2 = this.editorPartsView.mainPart.activeGroup;
    }
    return super.addGroup(location2, direction, groupToCopy);
  }
  removeGroup(group2, preserveFocus) {
    const groupView = this.assertGroupView(group2);
    if (this.count === 1 && this.activeGroup === groupView) {
      this.doRemoveLastGroup(preserveFocus);
    } else {
      super.removeGroup(group2, preserveFocus);
    }
  }
  doRemoveLastGroup(preserveFocus) {
    const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.container);
    const mostRecentlyActiveGroups = this.editorPartsView.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
    const nextActiveGroup = mostRecentlyActiveGroups[1];
    if (nextActiveGroup) {
      nextActiveGroup.groupsView.activateGroup(nextActiveGroup, void 0, 1 /* PART_CLOSE */);
    }
    if (nextActiveGroup && restoreFocus) {
      const nextGroupInHiddenMainPart = nextActiveGroup.groupsView === this.editorPartsView.mainPart && !this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
      if (!nextGroupInHiddenMainPart) {
        nextActiveGroup.focus();
      }
    }
    this.doClose(
      false
      /* do not merge any confirming editors to main part */
    );
  }
  loadState() {
    return this.state;
  }
  saveState() {
    return;
  }
  close() {
    return this.doClose(
      true
      /* merge all confirming editors to main part */
    );
  }
  doClose(mergeConfirmingEditorsToMainPart) {
    let result = true;
    if (mergeConfirmingEditorsToMainPart) {
      for (const group2 of this.groups) {
        group2.closeAllEditors({ excludeConfirming: true, force: true });
      }
      result = this.mergeGroupsToMainPart();
      if (!result) {
        return false;
      }
    }
    this._onWillClose.fire();
    return result;
  }
  mergeGroupsToMainPart() {
    if (!this.groups.some((group2) => group2.count > 0)) {
      return true;
    }
    let targetGroup = void 0;
    for (const group2 of this.editorPartsView.mainPart.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
      if (!group2.isLocked) {
        targetGroup = group2;
        break;
      }
    }
    if (!targetGroup) {
      targetGroup = this.editorPartsView.mainPart.addGroup(this.editorPartsView.mainPart.activeGroup, this.partOptions.openSideBySideDirection === "right" ? 3 /* RIGHT */ : 1 /* DOWN */);
    }
    const result = this.mergeAllGroups(targetGroup, {
      // Try to reduce the impact of closing the auxiliary window
      // as much as possible by not changing existing editors
      // in the main window.
      preserveExistingIndex: true
    });
    targetGroup.focus();
    return result;
  }
};

AuxiliaryEditorPartImpl = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IWorkbenchLayoutService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IContextKeyService)
], AuxiliaryEditorPartImpl);
export { compactWindowEmitter, AuxiliaryEditorPart, AuxiliaryEditorPartImpl };
