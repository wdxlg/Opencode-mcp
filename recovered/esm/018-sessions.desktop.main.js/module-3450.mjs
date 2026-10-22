// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/contextkeys.ts
import { Disposable } from "./module-0012.mjs";
import { IsDevelopmentContext, IsIOSContext, IsLinuxContext, IsMacContext, IsMacNativeContext, IsMobileContext, IsWebContext, IsWindowsContext, ProductQualityContext } from "./module-0635.mjs";
import { ActiveEditorGroupEmptyContext, ActiveEditorGroupIndexContext, ActiveEditorGroupLastContext, ActiveEditorGroupLockedContext, AuxiliaryBarMaximizedContext, AuxiliaryBarVisibleContext, DirtyWorkingCopiesContext, EditorTabsVisibleContext, EditorsVisibleContext, EmbedderIdentifierContext, EmptyWorkspaceSupportContext, EnterMultiRootWorkspaceSupportContext, HasWebFileSystemAccess, InAutomationContext, InEditorZenModeContext, IsAuxiliaryWindowFocusedContext, IsMainEditorCenteredLayoutContext, IsMainWindowFullscreenContext, IsSessionsWindowContext, MainEditorAreaVisibleContext, MultipleEditorGroupsContext, OpenFolderWorkspaceSupportContext, PanelAlignmentContext, PanelMaximizedContext, PanelPositionContext, PanelVisibleContext, RemoteNameContext, SecondarySideBarVisibleContext, SideBarVisibleContext, SplitEditorsVertically, TemporaryWorkspaceContext, TitleBarStyleContext, TitleBarVisibleContext, VirtualWorkspaceContext, WorkbenchStateContext, WorkspaceFolderCountContext } from "./module-0950.mjs";
import { getRemoteName } from "./module-0687.mjs";
import { WebFileSystemAccess } from "./module-0270.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IContextKeyService, setConstant } from "./module-0089.mjs";
import { isNative } from "./module-0014.mjs";
import { IWorkbenchLayoutService, positionToString } from "./module-1119.mjs";
import { isFullscreen, onDidChangeFullscreen } from "./module-0018.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0934.mjs";
import { getTitleBarStyle } from "./module-0515.mjs";
import { getVirtualWorkspaceScheme } from "./module-0937.mjs";
import { IWorkspaceContextService, isTemporaryWorkspace } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IProductService } from "./module-0875.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";


// src/vs/workbench/browser/contextkeys.ts
var WorkbenchContextKeysHandler = class extends Disposable {
  constructor(contextKeyService, contextService, configurationService, environmentService, productService, editorGroupService, editorService, layoutService, workingCopyService) {
    super();
    this.contextKeyService = contextKeyService;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.editorGroupService = editorGroupService;
    this.editorService = editorService;
    this.layoutService = layoutService;
    this.workingCopyService = workingCopyService;
    IsMacContext.bindTo(this.contextKeyService);
    IsLinuxContext.bindTo(this.contextKeyService);
    IsWindowsContext.bindTo(this.contextKeyService);
    IsWebContext.bindTo(this.contextKeyService);
    IsMacNativeContext.bindTo(this.contextKeyService);
    IsIOSContext.bindTo(this.contextKeyService);
    IsMobileContext.bindTo(this.contextKeyService);
    RemoteNameContext.bindTo(this.contextKeyService).set(getRemoteName(this.environmentService.remoteAuthority) || "");
    this.virtualWorkspaceContext = VirtualWorkspaceContext.bindTo(this.contextKeyService);
    this.temporaryWorkspaceContext = TemporaryWorkspaceContext.bindTo(this.contextKeyService);
    this.isSessionsWindowContext = IsSessionsWindowContext.bindTo(this.contextKeyService);
    this.isSessionsWindowContext.set(this.environmentService.isSessionsWindow);
    this.updateWorkspaceContextKeys();
    HasWebFileSystemAccess.bindTo(this.contextKeyService).set(WebFileSystemAccess.supported(mainWindow));
    const isDevelopment = !this.environmentService.isBuilt || this.environmentService.isExtensionDevelopment;
    IsDevelopmentContext.bindTo(this.contextKeyService).set(isDevelopment);
    setConstant(IsDevelopmentContext.key, isDevelopment);
    ProductQualityContext.bindTo(this.contextKeyService).set(this.productService.quality || "");
    EmbedderIdentifierContext.bindTo(this.contextKeyService).set(productService.embedderIdentifier);
    this.inAutomationContext = InAutomationContext.bindTo(this.contextKeyService);
    this.inAutomationContext.set(!!this.environmentService.enableSmokeTestDriver);
    this.activeEditorGroupEmpty = ActiveEditorGroupEmptyContext.bindTo(this.contextKeyService);
    this.activeEditorGroupIndex = ActiveEditorGroupIndexContext.bindTo(this.contextKeyService);
    this.activeEditorGroupLast = ActiveEditorGroupLastContext.bindTo(this.contextKeyService);
    this.activeEditorGroupLocked = ActiveEditorGroupLockedContext.bindTo(this.contextKeyService);
    this.multipleEditorGroupsContext = MultipleEditorGroupsContext.bindTo(this.contextKeyService);
    this.editorsVisibleContext = EditorsVisibleContext.bindTo(this.contextKeyService);
    this.dirtyWorkingCopiesContext = DirtyWorkingCopiesContext.bindTo(this.contextKeyService);
    this.dirtyWorkingCopiesContext.set(this.workingCopyService.hasDirty);
    this.workbenchStateContext = WorkbenchStateContext.bindTo(this.contextKeyService);
    this.updateWorkbenchStateContextKey();
    this.workspaceFolderCountContext = WorkspaceFolderCountContext.bindTo(this.contextKeyService);
    this.updateWorkspaceFolderCountContextKey();
    this.openFolderWorkspaceSupportContext = OpenFolderWorkspaceSupportContext.bindTo(this.contextKeyService);
    this.openFolderWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === "string");
    this.emptyWorkspaceSupportContext = EmptyWorkspaceSupportContext.bindTo(this.contextKeyService);
    this.emptyWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === "string");
    this.enterMultiRootWorkspaceSupportContext = EnterMultiRootWorkspaceSupportContext.bindTo(this.contextKeyService);
    this.enterMultiRootWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === "string");
    this.splitEditorsVerticallyContext = SplitEditorsVertically.bindTo(this.contextKeyService);
    this.updateSplitEditorsVerticallyContext();
    this.isMainWindowFullscreenContext = IsMainWindowFullscreenContext.bindTo(this.contextKeyService);
    this.isAuxiliaryWindowFocusedContext = IsAuxiliaryWindowFocusedContext.bindTo(this.contextKeyService);
    this.inZenModeContext = InEditorZenModeContext.bindTo(this.contextKeyService);
    this.isMainEditorCenteredLayoutContext = IsMainEditorCenteredLayoutContext.bindTo(this.contextKeyService);
    this.mainEditorAreaVisibleContext = MainEditorAreaVisibleContext.bindTo(this.contextKeyService);
    this.mainEditorAreaVisibleContext.set(this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow));
    this.editorTabsVisibleContext = EditorTabsVisibleContext.bindTo(this.contextKeyService);
    this.sideBarVisibleContext = SideBarVisibleContext.bindTo(this.contextKeyService);
    this.sideBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */));
    this.titleAreaVisibleContext = TitleBarVisibleContext.bindTo(this.contextKeyService);
    this.titleBarStyleContext = TitleBarStyleContext.bindTo(this.contextKeyService);
    this.updateTitleBarContextKeys();
    this.panelPositionContext = PanelPositionContext.bindTo(this.contextKeyService);
    this.panelPositionContext.set(positionToString(this.layoutService.getPanelPosition()));
    this.panelVisibleContext = PanelVisibleContext.bindTo(this.contextKeyService);
    this.panelVisibleContext.set(this.layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */));
    this.panelMaximizedContext = PanelMaximizedContext.bindTo(this.contextKeyService);
    this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
    this.panelAlignmentContext = PanelAlignmentContext.bindTo(this.contextKeyService);
    this.panelAlignmentContext.set(this.layoutService.getPanelAlignment());
    this.auxiliaryBarVisibleContext = AuxiliaryBarVisibleContext.bindTo(this.contextKeyService);
    this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
    this.secondarySideBarVisibleContext = SecondarySideBarVisibleContext.bindTo(this.contextKeyService);
    this.secondarySideBarVisibleContext.set(this.layoutService.isSecondarySideBarVisible());
    this.auxiliaryBarMaximizedContext = AuxiliaryBarMaximizedContext.bindTo(this.contextKeyService);
    this.auxiliaryBarMaximizedContext.set(this.layoutService.isAuxiliaryBarMaximized());
    this.registerListeners();
  }
  registerListeners() {
    this.editorGroupService.whenReady.then(() => {
      this.updateEditorAreaContextKeys();
      this.updateActiveEditorGroupContextKeys();
      this.updateVisiblePanesContextKeys();
    });
    this._register(this.editorService.onDidActiveEditorChange(() => this.updateActiveEditorGroupContextKeys()));
    this._register(this.editorService.onDidVisibleEditorsChange(() => this.updateVisiblePanesContextKeys()));
    this._register(this.editorGroupService.onDidAddGroup(() => this.updateEditorGroupsContextKeys()));
    this._register(this.editorGroupService.onDidRemoveGroup(() => this.updateEditorGroupsContextKeys()));
    this._register(this.editorGroupService.onDidChangeGroupIndex(() => this.updateActiveEditorGroupContextKeys()));
    this._register(this.editorGroupService.onDidChangeGroupLocked(() => this.updateActiveEditorGroupContextKeys()));
    this._register(this.editorGroupService.onDidChangeEditorPartOptions(() => this.updateEditorAreaContextKeys()));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateWorkbenchStateContextKey()));
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => {
      this.updateWorkspaceFolderCountContextKey();
      this.updateWorkspaceContextKeys();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.editor.openSideBySideDirection")) {
        this.updateSplitEditorsVerticallyContext();
      }
    }));
    this._register(this.layoutService.onDidChangeZenMode((enabled) => this.inZenModeContext.set(enabled)));
    this._register(this.layoutService.onDidChangeActiveContainer(() => this.isAuxiliaryWindowFocusedContext.set(this.layoutService.activeContainer !== this.layoutService.mainContainer)));
    this._register(onDidChangeFullscreen((windowId) => {
      if (windowId === mainWindow.vscodeWindowId) {
        this.isMainWindowFullscreenContext.set(isFullscreen(mainWindow));
      }
    }));
    this._register(this.layoutService.onDidChangeMainEditorCenteredLayout((centered) => this.isMainEditorCenteredLayoutContext.set(centered)));
    this._register(this.layoutService.onDidChangePanelPosition((position2) => this.panelPositionContext.set(position2)));
    this._register(this.layoutService.onDidChangePanelAlignment((alignment) => this.panelAlignmentContext.set(alignment)));
    this._register(this.layoutService.onDidChangePartVisibility(() => {
      this.mainEditorAreaVisibleContext.set(this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow));
      this.panelVisibleContext.set(this.layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */));
      this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
      this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
      this.secondarySideBarVisibleContext.set(this.layoutService.isSecondarySideBarVisible());
      this.sideBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */));
      this.updateTitleBarContextKeys();
    }));
    this._register(this.layoutService.onDidChangeAuxiliaryBarMaximized(() => {
      this.auxiliaryBarMaximizedContext.set(this.layoutService.isAuxiliaryBarMaximized());
    }));
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.dirtyWorkingCopiesContext.set(workingCopy.isDirty() || this.workingCopyService.hasDirty)));
  }
  updateVisiblePanesContextKeys() {
    const visibleEditorPanes = this.editorService.visibleEditorPanes;
    if (visibleEditorPanes.length > 0) {
      this.editorsVisibleContext.set(true);
    } else {
      this.editorsVisibleContext.reset();
    }
  }
  // Context keys depending on the state of the editor group itself
  updateActiveEditorGroupContextKeys() {
    if (!this.editorService.activeEditor) {
      this.activeEditorGroupEmpty.set(true);
    } else {
      this.activeEditorGroupEmpty.reset();
    }
    const activeGroup = this.editorGroupService.activeGroup;
    this.activeEditorGroupIndex.set(activeGroup.index + 1);
    this.activeEditorGroupLocked.set(activeGroup.isLocked);
    this.updateEditorGroupsContextKeys();
  }
  // Context keys depending on the state of other editor groups
  updateEditorGroupsContextKeys() {
    const groupCount = this.editorGroupService.count;
    if (groupCount > 1) {
      this.multipleEditorGroupsContext.set(true);
    } else {
      this.multipleEditorGroupsContext.reset();
    }
    const activeGroup = this.editorGroupService.activeGroup;
    this.activeEditorGroupLast.set(activeGroup.index === groupCount - 1);
  }
  updateEditorAreaContextKeys() {
    this.editorTabsVisibleContext.set(this.editorGroupService.partOptions.showTabs === "multiple");
  }
  updateWorkbenchStateContextKey() {
    this.workbenchStateContext.set(this.getWorkbenchStateString());
  }
  updateWorkspaceFolderCountContextKey() {
    this.workspaceFolderCountContext.set(this.contextService.getWorkspace().folders.length);
  }
  updateSplitEditorsVerticallyContext() {
    const direction = preferredSideBySideGroupDirection(this.configurationService);
    this.splitEditorsVerticallyContext.set(direction === 1 /* DOWN */);
  }
  getWorkbenchStateString() {
    switch (this.contextService.getWorkbenchState()) {
      case 1 /* EMPTY */:
        return "empty";
      case 2 /* FOLDER */:
        return "folder";
      case 3 /* WORKSPACE */:
        return "workspace";
    }
  }
  updateTitleBarContextKeys() {
    this.titleAreaVisibleContext.set(this.layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow));
    this.titleBarStyleContext.set(getTitleBarStyle(this.configurationService));
  }
  updateWorkspaceContextKeys() {
    this.virtualWorkspaceContext.set(getVirtualWorkspaceScheme(this.contextService.getWorkspace()) || "");
    this.temporaryWorkspaceContext.set(isTemporaryWorkspace(this.contextService.getWorkspace()));
  }
};

WorkbenchContextKeysHandler = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IWorkbenchLayoutService),
  __decorateParam(8, IWorkingCopyService)
], WorkbenchContextKeysHandler);
export { WorkbenchContextKeysHandler };
