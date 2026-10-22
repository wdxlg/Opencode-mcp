// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/singlePaneEditorPart.ts
import { MainEditorPart2 } from "./module-3482.mjs";
import { DisposableMap, MutableDisposable } from "./module-0012.mjs";
import { mainWindow } from "./module-0002.mjs";
import { Menus } from "./module-3437.mjs";
import { DockedAuxiliaryBarController } from "./module-3483.mjs";
import { SinglePaneAuxiliaryBarPart } from "./module-3484.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IHostService } from "./module-1118.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/sessions/browser/parts/singlePaneEditorPart.ts
var SinglePaneMainEditorPart = class extends MainEditorPart2 {
  constructor(editorPartsView, _instantiationService, themeService, configurationService, storageService, agentWorkbenchLayoutService, hostService, contextKeyService) {
    super(editorPartsView, _instantiationService, themeService, configurationService, storageService, agentWorkbenchLayoutService, hostService, contextKeyService);
    this._instantiationService = _instantiationService;
    this.agentWorkbenchLayoutService = agentWorkbenchLayoutService;
    this._groupRelayoutListeners = this._register(new DisposableMap());
    const tabsOverride = this._register(new MutableDisposable());
    let enforcedShowTabs;
    const updateTabsOverride = () => {
      const nextShowTabs = this._getShowTabsOverride(
        configurationService.getValue("workbench.editor.showTabs"),
        agentWorkbenchLayoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow),
        agentWorkbenchLayoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, mainWindow)
      );
      if (nextShowTabs === enforcedShowTabs) {
        return;
      }
      enforcedShowTabs = nextShowTabs;
      tabsOverride.value = nextShowTabs ? this.enforcePartOptions({ showTabs: nextShowTabs }) : void 0;
    };
    this._register(configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("workbench.editor.showTabs")) {
        updateTabsOverride();
      }
    }));
    this._register(agentWorkbenchLayoutService.onDidChangePartVisibility((event) => {
      if (event.partId === "workbench.parts.editor" /* EDITOR_PART */ || event.partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
        updateTabsOverride();
      }
    }));
    updateTabsOverride();
  }
  getGroupViewOptions() {
    return {
      menuIds: {
        headerPrimary: Menus.SessionsEditorHeaderPrimary,
        headerLayout: Menus.SessionsEditorHeaderLayout,
        editorActions: Menus.SessionsEditorTitle,
        tabsBarContext: Menus.SessionsEditorTabsBarContext,
        tabsBarAddTab: Menus.SessionsEditorTabsBarAddTab
      },
      showHeader: true
    };
  }
  // Double-click balances Sessions against editor content while reserving Details.
  get preferredWidth() {
    return this.agentWorkbenchLayoutService.getPreferredEditorPartWidth();
  }
  // Matches the sessions list's minimum while only the detail panel is shown.
  get minimumWidth() {
    if (!this.agentWorkbenchLayoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
      return DockedAuxiliaryBarController.NO_EDITOR_MIN_WIDTH;
    }
    return super.minimumWidth;
  }
  // Snap-collapse via sash-drag, like the sessions list, only when detail-only.
  get snap() {
    return !this.agentWorkbenchLayoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
  }
  _getShowTabsOverride(configuredShowTabs, editorVisible, auxiliaryBarVisible) {
    if (auxiliaryBarVisible && !editorVisible) {
      return "multiple";
    }
    return configuredShowTabs === "none" ? "single" : void 0;
  }
  /**
   * The auxiliary bar owned by this editor part, created on first access. The
   * pane composite service reads this so both share the same instance.
   */
  get auxiliaryBar() {
    if (!this._auxiliaryBar) {
      this._auxiliaryBar = this._register(this._instantiationService.createInstance(SinglePaneAuxiliaryBarPart));
    }
    return this._auxiliaryBar;
  }
  /**
   * Creates the editor part's DOM. Besides the base content (the editor grid), the
   * single-pane part docks the auxiliary bar here — in the same place the base part
   * creates its content — and enables the header separator border on every group.
   */
  createContentArea(parent, options3) {
    const container2 = super.createContentArea(parent, options3);
    this._registerGroupRelayoutListeners();
    const layoutService = this.agentWorkbenchLayoutService;
    this._dockedAuxBar = this._register(new DockedAuxiliaryBarController(
      this.element,
      this.auxiliaryBar,
      {
        getWidth: () => layoutService.getDockedAuxiliaryBarWidth(),
        setWidth: (width2) => layoutService.setDockedAuxiliaryBarWidth(width2),
        isEditorAreaVisible: () => layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) || layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */),
        isEditorVisible: () => layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow),
        isAuxiliaryBarVisible: () => layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */),
        hideAuxiliaryBar: () => layoutService.setAuxiliaryBarHiddenForResize(true),
        setEditorContentRightInset: (px) => this.setContentRightInset(px),
        getTitleHeight: () => this.activeGroup.titleHeight.total
      }
    ));
    return container2;
  }
  addGroup(location2, _direction, _groupToCopy) {
    return this.assertGroupView(location2);
  }
  applyLayout(layout2) {
    if (countEditorGroups(layout2.groups) > 1) {
      return;
    }
    super.applyLayout(layout2);
  }
  createEditorDropTarget(container2, delegate) {
    return super.createEditorDropTarget(container2, { ...delegate, supportsSplitting: false });
  }
  async applyState(state, options3) {
    await super.applyState(state, options3);
    this._ensureSingleEditorGroup();
  }
  _ensureSingleEditorGroup() {
    if (this.count > 1) {
      this.mergeAllGroups(this.activeGroup);
    }
  }
  /**
   * Keeps the docked auxiliary bar aligned after group-local relayouts.
   */
  _registerGroupRelayoutListeners() {
    for (const group2 of this.groups) {
      this._registerGroupRelayoutListener(group2);
    }
    this._register(this.onDidAddGroup((group2) => this._registerGroupRelayoutListener(group2)));
    this._register(this.onDidRemoveGroup((group2) => this._groupRelayoutListeners.deleteAndDispose(group2)));
  }
  _registerGroupRelayoutListener(group2) {
    this._groupRelayoutListeners.set(group2, group2.onDidRelayout(() => this._dockedAuxBar?.layout()));
  }
  layout(width2, height, top2, left) {
    super.layout(width2, height, top2, left);
    this.agentWorkbenchLayoutService.handleDockedEditorPartLayout(width2);
    this._dockedAuxBar?.layout();
  }
  /** Re-layouts the docked auxiliary bar. Called by the workbench on layout changes. */
  layoutDockedAuxiliaryBar() {
    this._dockedAuxBar?.layout();
  }
};

SinglePaneMainEditorPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IAgentWorkbenchLayoutService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IContextKeyService)
], SinglePaneMainEditorPart);

function countEditorGroups(groups) {
  let count2 = 0;
  for (const group2 of groups) {
    count2 += group2.groups ? countEditorGroups(group2.groups) : 1;
  }
  return count2;
}
export { countEditorGroups, SinglePaneMainEditorPart };
