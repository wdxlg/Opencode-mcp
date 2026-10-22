// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/common/contextkeys.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { IsMacNativeContext } from "./module-0635.mjs";
import { basename2, dirname2, extname2, isEqual2 } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor, isDiffEditorInput } from "./module-0926.mjs";


// src/vs/workbench/common/contextkeys.ts
var WorkbenchStateContext = new RawContextKey("workbenchState", void 0, { type: "string", description: localize(7373, null) });

var WorkspaceFolderCountContext = new RawContextKey("workspaceFolderCount", 0, localize(7374, null));

var OpenFolderWorkspaceSupportContext = new RawContextKey("openFolderWorkspaceSupport", true, true);

var EnterMultiRootWorkspaceSupportContext = new RawContextKey("enterMultiRootWorkspaceSupport", true, true);

var EmptyWorkspaceSupportContext = new RawContextKey("emptyWorkspaceSupport", true, true);

var DirtyWorkingCopiesContext = new RawContextKey("dirtyWorkingCopies", false, localize(7313, null));

var RemoteNameContext = new RawContextKey("remoteName", "", localize(7350, null));

var VirtualWorkspaceContext = new RawContextKey("virtualWorkspace", "", localize(7372, null));

var TemporaryWorkspaceContext = new RawContextKey("temporaryWorkspace", false, localize(7366, null));

var IsSessionsWindowContext = new RawContextKey("isSessionsWindow", false, localize(7336, null));

var HasWebFileSystemAccess = new RawContextKey("hasWebFileSystemAccess", false, true);

var EmbedderIdentifierContext = new RawContextKey("embedderIdentifier", void 0, localize(7325, null));

var InAutomationContext = new RawContextKey("inAutomation", false, localize(7328, null));

var IsMainWindowFullscreenContext = new RawContextKey("isFullscreen", false, localize(7334, null));

var IsAuxiliaryWindowFocusedContext = new RawContextKey("isAuxiliaryWindowFocusedContext", false, localize(7331, null));

var IsWindowAlwaysOnTopContext = new RawContextKey("isWindowAlwaysOnTop", false, localize(7338, null));

var IsAuxiliaryWindowContext = new RawContextKey("isAuxiliaryWindow", false, localize(7330, null));

var MenuBarVisibleContext = ContextKeyExpr.or(
  IsMacNativeContext,
  ContextKeyExpr.and(
    ContextKeyExpr.notEquals(`config.${"window.menuBarVisibility" /* MenuBarVisibility */}`, "hidden"),
    ContextKeyExpr.notEquals(`config.${"window.menuBarVisibility" /* MenuBarVisibility */}`, "toggle"),
    ContextKeyExpr.notEquals(`config.${"window.menuBarVisibility" /* MenuBarVisibility */}`, "compact")
  )
);

var CustomMenuBarVisibleContext = ContextKeyExpr.and(
  IsMacNativeContext.negate(),
  MenuBarVisibleContext
);

var ActiveEditorDirtyContext = new RawContextKey("activeEditorIsDirty", false, localize(7301, null));

var ActiveEditorPinnedContext = new RawContextKey("activeEditorIsNotPreview", false, localize(7304, null));

var ActiveEditorFirstInGroupContext = new RawContextKey("activeEditorIsFirstInGroup", false, localize(7302, null));

var ActiveEditorLastInGroupContext = new RawContextKey("activeEditorIsLastInGroup", false, localize(7303, null));

var ActiveEditorStickyContext = new RawContextKey("activeEditorIsPinned", false, localize(7305, null));

var ActiveEditorReadonlyContext = new RawContextKey("activeEditorIsReadonly", false, localize(7306, null));

var ActiveCompareEditorCanSwapContext = new RawContextKey("activeCompareEditorCanSwap", false, localize(7289, null));

var ActiveEditorCanToggleReadonlyContext = new RawContextKey("activeEditorCanToggleReadonly", true, localize(7296, null));

var ActiveEditorCanRevertContext = new RawContextKey("activeEditorCanRevert", false, localize(7295, null));

var ActiveEditorCanSplitInGroupContext = new RawContextKey("activeEditorCanSplitInGroup", true);

var ActiveEditorCannotCloseContext = new RawContextKey("activeEditorCannotClose", false, localize(7294, null));

var ActiveEditorContext = new RawContextKey("activeEditor", null, { type: "string", description: localize(7292, null) });

var ActiveEditorAvailableEditorIdsContext = new RawContextKey("activeEditorAvailableEditorIds", "", localize(7293, null));

var TextCompareEditorVisibleContext = new RawContextKey("textCompareEditorVisible", false, localize(7368, null));

var TextCompareEditorActiveContext = new RawContextKey("textCompareEditorActive", false, localize(7367, null));

var SideBySideEditorActiveContext = new RawContextKey("sideBySideEditorActive", false, localize(7363, null));

var ActiveCustomEditorDiffCanToggleLayoutContext = new RawContextKey("activeCustomEditorDiffCanToggleLayout", false, localize(7290, null));

var ActiveCustomEditorTextDiffContext = new RawContextKey("activeCustomEditorTextDiff", false, localize(7291, null));

var EditorGroupEditorsCountContext = new RawContextKey("groupEditorsCount", 0, localize(7327, null));

var IsTopRightEditorGroupContext = new RawContextKey("isTopRightEditorGroup", false, localize(7337, null));

var ActiveEditorGroupEmptyContext = new RawContextKey("activeEditorGroupEmpty", false, localize(7297, null));

var ActiveEditorGroupIndexContext = new RawContextKey("activeEditorGroupIndex", 0, localize(7298, null));

var ActiveEditorGroupLastContext = new RawContextKey("activeEditorGroupLast", false, localize(7299, null));

var ActiveEditorGroupLockedContext = new RawContextKey("activeEditorGroupLocked", false, localize(7300, null));

var MultipleEditorGroupsContext = new RawContextKey("multipleEditorGroups", false, localize(7340, null));

var SingleEditorGroupsContext = MultipleEditorGroupsContext.toNegated();

var MultipleEditorsSelectedInGroupContext = new RawContextKey("multipleEditorsSelectedInGroup", false, localize(7341, null));

var TwoEditorsSelectedInGroupContext = new RawContextKey("twoEditorsSelectedInGroup", false, localize(7371, null));

var SelectedEditorsInGroupFileOrUntitledResourceContextKey = new RawContextKey("SelectedEditorsInGroupFileOrUntitledResourceContextKey", true, localize(7360, null));

var EditorPartMultipleEditorGroupsContext = new RawContextKey("editorPartMultipleEditorGroups", false, localize(7323, null));

var EditorPartMaximizedEditorGroupContext = new RawContextKey("editorPartMaximizedEditorGroup", false, localize(7316, null));

var EditorPartModalContext = new RawContextKey("editorPartModal", false, localize(7317, null));

var EditorPartModalVisibleContext = new RawContextKey("editorPartModalVisible", false, localize(7322, null));

var EditorPartModalMaximizedContext = new RawContextKey("editorPartModalMaximized", false, localize(7318, null));

var EditorPartModalNavigationContext = new RawContextKey("editorPartModalNavigation", false, localize(7319, null));

var EditorPartModalSidebarContext = new RawContextKey("editorPartModalSidebar", false, localize(7320, null));

var EditorPartModalSidebarVisibleContext = new RawContextKey("editorPartModalSidebarVisible", false, localize(7321, null));

var EditorsVisibleContext = new RawContextKey("editorIsOpen", false, localize(7315, null));

var EditorAreaFocusContext = new RawContextKey("editorAreaFocus", false, localize(7314, null));

var InEditorZenModeContext = new RawContextKey("inZenMode", false, localize(7329, null));

var IsMainEditorCenteredLayoutContext = new RawContextKey("isCenteredLayout", false, localize(7335, null));

var SplitEditorsVertically = new RawContextKey("splitEditorsVertically", false, localize(7364, null));

var MainEditorAreaVisibleContext = new RawContextKey("mainEditorAreaVisible", true, localize(7339, null));

var EditorTabsVisibleContext = new RawContextKey("editorTabsVisible", true, localize(7324, null));

var SideBarVisibleContext = new RawContextKey("sideBarVisible", false, localize(7362, null));

var SidebarFocusContext = new RawContextKey("sideBarFocus", false, localize(7361, null));

var ActiveViewletContext = new RawContextKey("activeViewlet", "", localize(7308, null));

var StatusBarFocused = new RawContextKey("statusBarFocused", false, localize(7365, null));

var TitleBarStyleContext = new RawContextKey("titleBarStyle", "custom", localize(7369, null));

var TitleBarVisibleContext = new RawContextKey("titleBarVisible", false, localize(7370, null));

var IsCompactTitleBarContext = new RawContextKey("isCompactTitleBar", false, localize(7332, null));

var BannerFocused = new RawContextKey("bannerFocused", false, localize(7312, null));

var NotificationFocusedContext = new RawContextKey("notificationFocus", true, localize(7343, null));

var NotificationsCenterVisibleContext = new RawContextKey("notificationCenterVisible", false, localize(7342, null));

var NotificationsToastsVisibleContext = new RawContextKey("notificationToastsVisible", false, localize(7344, null));

var ActiveAuxiliaryContext = new RawContextKey("activeAuxiliary", "", localize(7288, null));

var AuxiliaryBarFocusContext = new RawContextKey("auxiliaryBarFocus", false, localize(7309, null));

var AuxiliaryBarVisibleContext = new RawContextKey("auxiliaryBarVisible", false, localize(7311, null));

var SecondarySideBarVisibleContext = new RawContextKey("secondarySideBarVisible", false, localize(7359, null));

var AuxiliaryBarMaximizedContext = new RawContextKey("auxiliaryBarMaximized", false, localize(7310, null));

var ActivePanelContext = new RawContextKey("activePanel", "", localize(7307, null));

var PanelFocusContext = new RawContextKey("panelFocus", false, localize(7346, null));

var PanelPositionContext = new RawContextKey("panelPosition", "bottom", localize(7348, null));

var PanelAlignmentContext = new RawContextKey("panelAlignment", "center", localize(7345, null));

var PanelVisibleContext = new RawContextKey("panelVisible", false, localize(7349, null));

var PanelMaximizedContext = new RawContextKey("panelMaximized", false, localize(7347, null));

var FocusedViewContext = new RawContextKey("focusedView", "", localize(7326, null));

function getVisbileViewContextKey(viewId) {
  return `view.${viewId}.visible`;
}

var AbstractResourceContextKey = class {
  constructor(_contextKeyService, _fileService, _languageService, _modelService) {
    this._contextKeyService = _contextKeyService;
    this._fileService = _fileService;
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._schemeKey = AbstractResourceContextKey.Scheme.bindTo(this._contextKeyService);
    this._filenameKey = AbstractResourceContextKey.Filename.bindTo(this._contextKeyService);
    this._dirnameKey = AbstractResourceContextKey.Dirname.bindTo(this._contextKeyService);
    this._pathKey = AbstractResourceContextKey.Path.bindTo(this._contextKeyService);
    this._langIdKey = AbstractResourceContextKey.LangId.bindTo(this._contextKeyService);
    this._resourceKey = AbstractResourceContextKey.Resource.bindTo(this._contextKeyService);
    this._extensionKey = AbstractResourceContextKey.Extension.bindTo(this._contextKeyService);
    this._hasResource = AbstractResourceContextKey.HasResource.bindTo(this._contextKeyService);
    this._isFileSystemResource = AbstractResourceContextKey.IsFileSystemResource.bindTo(this._contextKeyService);
  }
  static {
    // NOTE: DO NOT CHANGE THE DEFAULT VALUE TO ANYTHING BUT
    // UNDEFINED! IT IS IMPORTANT THAT DEFAULTS ARE INHERITED
    // FROM THE PARENT CONTEXT AND ONLY UNDEFINED DOES THIS
    this.Scheme = new RawContextKey("resourceScheme", void 0, { type: "string", description: localize(7357, null) });
  }
  static {
    this.Filename = new RawContextKey("resourceFilename", void 0, { type: "string", description: localize(7354, null) });
  }
  static {
    this.Dirname = new RawContextKey("resourceDirname", void 0, { type: "string", description: localize(7352, null) });
  }
  static {
    this.Path = new RawContextKey("resourcePath", void 0, { type: "string", description: localize(7356, null) });
  }
  static {
    this.LangId = new RawContextKey("resourceLangId", void 0, { type: "string", description: localize(7355, null) });
  }
  static {
    this.Resource = new RawContextKey("resource", void 0, { type: "URI", description: localize(7351, null) });
  }
  static {
    this.Extension = new RawContextKey("resourceExtname", void 0, { type: "string", description: localize(7353, null) });
  }
  static {
    this.HasResource = new RawContextKey("resourceSet", void 0, { type: "boolean", description: localize(7358, null) });
  }
  static {
    this.IsFileSystemResource = new RawContextKey("isFileSystemResource", void 0, { type: "boolean", description: localize(7333, null) });
  }
  _setLangId() {
    const value2 = this.get();
    if (!value2) {
      this._langIdKey.set(null);
      return;
    }
    const langId = this._modelService.getModel(value2)?.getLanguageId() ?? this._languageService.guessLanguageIdByFilepathOrFirstLine(value2);
    this._langIdKey.set(langId);
  }
  set(value2) {
    value2 = value2 ?? void 0;
    if (isEqual2(this._value, value2)) {
      return;
    }
    this._value = value2;
    this._contextKeyService.bufferChangeEvents(() => {
      this._resourceKey.set(value2 ? value2.toString() : null);
      this._schemeKey.set(value2 ? value2.scheme : null);
      this._filenameKey.set(value2 ? basename2(value2) : null);
      this._dirnameKey.set(value2 ? this.uriToPath(dirname2(value2)) : null);
      this._pathKey.set(value2 ? this.uriToPath(value2) : null);
      this._setLangId();
      this._extensionKey.set(value2 ? extname2(value2) : null);
      this._hasResource.set(Boolean(value2));
      this._isFileSystemResource.set(value2 ? this._fileService.hasProvider(value2) : false);
    });
  }
  uriToPath(uri4) {
    if (uri4.scheme === Schemas.file) {
      return uri4.fsPath;
    }
    return uri4.path;
  }
  reset() {
    this._value = void 0;
    this._contextKeyService.bufferChangeEvents(() => {
      this._resourceKey.reset();
      this._schemeKey.reset();
      this._filenameKey.reset();
      this._dirnameKey.reset();
      this._pathKey.reset();
      this._langIdKey.reset();
      this._extensionKey.reset();
      this._hasResource.reset();
      this._isFileSystemResource.reset();
    });
  }
  get() {
    return this._value;
  }
};

AbstractResourceContextKey = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService)
], AbstractResourceContextKey);

var ResourceContextKey = class extends AbstractResourceContextKey {
  constructor(contextKeyService, fileService, languageService, modelService) {
    super(contextKeyService, fileService, languageService, modelService);
    this._disposables = new DisposableStore();
    this._disposables.add(fileService.onDidChangeFileSystemProviderRegistrations(() => {
      const resource = this.get();
      this._isFileSystemResource.set(Boolean(resource && fileService.hasProvider(resource)));
    }));
    this._disposables.add(modelService.onModelAdded((model) => {
      if (isEqual2(model.uri, this.get())) {
        this._setLangId();
      }
    }));
    this._disposables.add(modelService.onModelLanguageChanged((e4) => {
      if (isEqual2(e4.model.uri, this.get())) {
        this._setLangId();
      }
    }));
  }
  dispose() {
    this._disposables.dispose();
  }
};

ResourceContextKey = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService)
], ResourceContextKey);

var StaticResourceContextKey = class extends AbstractResourceContextKey {
};

function applyAvailableEditorIds(contextKey, editor, editorResolverService) {
  if (!editor) {
    contextKey.set("");
    return;
  }
  const editors = getAvailableEditorIds(editor, editorResolverService);
  contextKey.set(editors.join(","));
}

function getAvailableEditorIds(editor, editorResolverService) {
  if (editor.resource?.scheme === Schemas.untitled && editor.editorId !== DEFAULT_EDITOR_ASSOCIATION.id) {
    return [];
  }
  if (isDiffEditorInput(editor)) {
    const original = getAvailableEditorIds(editor.original, editorResolverService);
    const modified = new Set(getAvailableEditorIds(editor.modified, editorResolverService));
    return original.filter((editor2) => modified.has(editor2));
  }
  const resource = EditorResourceAccessor.getOriginalUri(editor);
  if (resource) {
    return editorResolverService.getEditors(resource).map((editor2) => editor2.id);
  }
  return [];
}
export { getVisbileViewContextKey, applyAvailableEditorIds, getAvailableEditorIds, WorkbenchStateContext, WorkspaceFolderCountContext, OpenFolderWorkspaceSupportContext, EnterMultiRootWorkspaceSupportContext, EmptyWorkspaceSupportContext, DirtyWorkingCopiesContext, RemoteNameContext, VirtualWorkspaceContext, TemporaryWorkspaceContext, IsSessionsWindowContext, HasWebFileSystemAccess, EmbedderIdentifierContext, InAutomationContext, IsMainWindowFullscreenContext, IsAuxiliaryWindowFocusedContext, IsWindowAlwaysOnTopContext, IsAuxiliaryWindowContext, MenuBarVisibleContext, CustomMenuBarVisibleContext, ActiveEditorDirtyContext, ActiveEditorPinnedContext, ActiveEditorFirstInGroupContext, ActiveEditorLastInGroupContext, ActiveEditorStickyContext, ActiveEditorReadonlyContext, ActiveCompareEditorCanSwapContext, ActiveEditorCanToggleReadonlyContext, ActiveEditorCanRevertContext, ActiveEditorCanSplitInGroupContext, ActiveEditorCannotCloseContext, ActiveEditorContext, ActiveEditorAvailableEditorIdsContext, TextCompareEditorVisibleContext, TextCompareEditorActiveContext, SideBySideEditorActiveContext, ActiveCustomEditorDiffCanToggleLayoutContext, ActiveCustomEditorTextDiffContext, EditorGroupEditorsCountContext, IsTopRightEditorGroupContext, ActiveEditorGroupEmptyContext, ActiveEditorGroupIndexContext, ActiveEditorGroupLastContext, ActiveEditorGroupLockedContext, MultipleEditorGroupsContext, SingleEditorGroupsContext, MultipleEditorsSelectedInGroupContext, TwoEditorsSelectedInGroupContext, SelectedEditorsInGroupFileOrUntitledResourceContextKey, EditorPartMultipleEditorGroupsContext, EditorPartMaximizedEditorGroupContext, EditorPartModalContext, EditorPartModalVisibleContext, EditorPartModalMaximizedContext, EditorPartModalNavigationContext, EditorPartModalSidebarContext, EditorPartModalSidebarVisibleContext, EditorsVisibleContext, EditorAreaFocusContext, InEditorZenModeContext, IsMainEditorCenteredLayoutContext, SplitEditorsVertically, MainEditorAreaVisibleContext, EditorTabsVisibleContext, SideBarVisibleContext, SidebarFocusContext, ActiveViewletContext, StatusBarFocused, TitleBarStyleContext, TitleBarVisibleContext, IsCompactTitleBarContext, BannerFocused, NotificationFocusedContext, NotificationsCenterVisibleContext, NotificationsToastsVisibleContext, ActiveAuxiliaryContext, AuxiliaryBarFocusContext, AuxiliaryBarVisibleContext, SecondarySideBarVisibleContext, AuxiliaryBarMaximizedContext, ActivePanelContext, PanelFocusContext, PanelPositionContext, PanelAlignmentContext, PanelVisibleContext, PanelMaximizedContext, FocusedViewContext, AbstractResourceContextKey, ResourceContextKey, StaticResourceContextKey };
