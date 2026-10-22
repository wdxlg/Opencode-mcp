// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/browserViewWorkbenchService.ts
import { BrowserViewCommandId, ipcBrowserViewChannelName } from "./module-1237.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { browserArenaFollowLatestSettingId } from "./module-4049.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { localChatSessionType } from "./module-0960.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, IEditorService, SIDE_GROUP, USE_MODAL_EDITOR_SETTING } from "./module-0934.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0933.mjs";
import { BrowserEditorInput } from "./module-1490.mjs";
import { generateUuid } from "./module-0190.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { resolveBrowserViewStorageScope } from "./module-4050.mjs";
import { URI } from "./module-0032.mjs";
import { BrowserViewModel } from "./module-1243.mjs";
import { findGroup } from "./module-1587.mjs";
import { ChatEditorInput } from "./module-1111.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { contrastBorder, descriptionForeground, focusBorder } from "./module-0227.mjs";
import { buttonBackground, buttonForeground, inputPlaceholderForeground } from "./module-0233.mjs";
import { editorWidgetBackground, editorWidgetBorder, editorWidgetForeground, toolbarHoverBackground, widgetShadow } from "./module-0229.mjs";
import { DEFAULT_FONT_FAMILY } from "./module-0312.mjs";
import { getCopilotRootPaths } from "./module-1108.mjs";
import { process2 } from "./module-3724.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/browserViewWorkbenchService.ts
var BrowserMaxHistoryEntriesSettingId = "workbench.browser.maxHistoryEntries";

var BrowserRemoteProxyEnabledSettingId = "workbench.browser.enableRemoteProxy";

var BrowserNewTabPlacementSettingId = "workbench.browser.newTabPlacement";

var OPEN_BROWSER_NAVIGATION_TIMEOUT_MS = 3e4;

var browserViewContextMenuCommands = [
  BrowserViewCommandId.GoBack,
  BrowserViewCommandId.GoForward,
  BrowserViewCommandId.Reload
];

var BrowserViewWorkbenchService = class extends Disposable {
  constructor(mainProcessService, instantiationService, workspaceContextService, keybindingService, editorService, editorGroupsService, configurationService, workspaceTrustManagementService, workspaceTrustEnablementService, logService, contextKeyService, environmentService, themeService, chatWidgetService, accessibilityService) {
    super();
    this.instantiationService = instantiationService;
    this.workspaceContextService = workspaceContextService;
    this.keybindingService = keybindingService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.configurationService = configurationService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.themeService = themeService;
    this.chatWidgetService = chatWidgetService;
    this.accessibilityService = accessibilityService;
    this._known = /* @__PURE__ */ new Map();
    this._contextualFilters = /* @__PURE__ */ new Set();
    this._openHandlers = /* @__PURE__ */ new Set();
    this._onDidChangeBrowserViews = this._register(new Emitter());
    this.onDidChangeBrowserViews = this._onDidChangeBrowserViews.event;
    this._isSharingAvailable = false;
    this._onDidChangeSharingAvailable = this._register(new Emitter());
    this.onDidChangeSharingAvailable = this._onDidChangeSharingAvailable.event;
    const channel = mainProcessService.getChannel(ipcBrowserViewChannelName);
    this._browserViewService = ProxyChannel.toService(channel);
    this._mainWindowId = mainWindow.vscodeWindowId;
    this._updateWindowConfiguration();
    const chatEnabledKeys = new Set(ChatContextKeys.enabled.keys());
    this._register(this.keybindingService.onDidUpdateKeybindings(() => this._updateWindowConfiguration()));
    this._register(this.themeService.onDidColorThemeChange(() => this._updateWindowConfiguration()));
    this._register(this.accessibilityService.onDidChangeReducedMotion(() => this._updateWindowConfiguration()));
    this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => this._updateWindowConfiguration()));
    this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this._updateWindowConfiguration()));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this._updateWindowConfiguration()));
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(chatEnabledKeys)) {
        this._updateWindowConfiguration();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(BrowserMaxHistoryEntriesSettingId) || e.affectsConfiguration(BrowserRemoteProxyEnabledSettingId) || e.affectsConfiguration(browserArenaFollowLatestSettingId)) {
        this._updateWindowConfiguration();
      }
    }));
    this._isSharingAvailable = this.contextKeyService.contextMatchesRules(BrowserViewWorkbenchService._sharingAvailableContext);
    const sharingKeys = new Set(BrowserViewWorkbenchService._sharingAvailableContext.keys());
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(sharingKeys)) {
        const was = this._isSharingAvailable;
        this._isSharingAvailable = this.contextKeyService.contextMatchesRules(BrowserViewWorkbenchService._sharingAvailableContext);
        if (was !== this._isSharingAvailable) {
          this._onDidChangeSharingAvailable.fire(this._isSharingAvailable);
        }
      }
    }));
    void this._initializeExistingViews().catch((e) => {
      this.logService.error("[BrowserViewWorkbenchService] Failed to initialize existing browser views.", e);
    });
    this._register(this._browserViewService.onDidCreateBrowserView((e) => {
      if (e.info.hostWindowId !== this._mainWindowId) {
        return;
      }
      this._createModel(e.info, e.initialUrl);
      const editor = this._known.get(e.info.id);
      if (editor && e.editorOpenRequest) {
        void this._openEditorForCreatedView(editor, e.info.owner, e.editorOpenRequest).catch((error) => {
          this.logService.error("[BrowserViewWorkbenchService] Failed to open editor for created browser view.", error);
        });
      }
    }));
  }
  static {
    this._sharingAvailableContext = ContextKeyExpr.and(
      ChatContextKeys.enabled,
      ContextKeyExpr.has(`config.${"chat.agent.enabled" /* AgentEnabled */}`),
      ContextKeyExpr.has(`config.workbench.browser.enableChatTools`),
      // If we're in Sessions Window, we require some additional conditions.
      ContextKeyExpr.or(
        IsSessionsWindowContext.negate(),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("sessionType", localChatSessionType),
          ContextKeyExpr.equals("sessions.isAgentHostSession", true)
        )
      )
    );
  }
  get isSharingAvailable() {
    return this._isSharingAvailable;
  }
  willUseRemoteProxy() {
    if (!this.environmentService.remoteAuthority) {
      return false;
    }
    if (!this.configurationService.getValue(BrowserRemoteProxyEnabledSettingId)) {
      return false;
    }
    return true;
  }
  setRemoteProxyInfo(info) {
    this._remoteProxyInfo = info;
    this._updateWindowConfiguration();
  }
  getKnownBrowserViews() {
    return this._known;
  }
  registerContextualFilter(filter2) {
    this._contextualFilters.add(filter2);
    const changeListener = filter2.onDidChange?.(() => this._onDidChangeBrowserViews.fire());
    this._onDidChangeBrowserViews.fire();
    return toDisposable(() => {
      this._contextualFilters.delete(filter2);
      changeListener?.dispose();
      this._onDidChangeBrowserViews.fire();
    });
  }
  getContextualBrowserViews(context2) {
    if (this._contextualFilters.size === 0) {
      return this._known;
    }
    const filters2 = [...this._contextualFilters];
    const result = /* @__PURE__ */ new Map();
    for (const [id2, input] of this._known) {
      if (filters2.every((filter2) => filter2.include(input, { ...context2 }))) {
        result.set(id2, input);
      }
    }
    return result;
  }
  async getPreferredGroup(preferredGroup) {
    if (preferredGroup === SIDE_GROUP) {
      return this._getOrCreateDedicatedGroup("sideGroup");
    }
    if (preferredGroup !== void 0 && preferredGroup !== ACTIVE_GROUP) {
      return preferredGroup;
    }
    const placement = this.configurationService.getValue(BrowserNewTabPlacementSettingId);
    if (placement === "sideGroup" || placement === "window") {
      return this._getOrCreateDedicatedGroup(placement);
    }
    if (this.configurationService.getValue(USE_MODAL_EDITOR_SETTING) === "all") {
      return this.editorGroupsService.mainPart.activeGroup;
    }
    return preferredGroup;
  }
  /**
   * Resolve the dedicated editor group for the given placement, reusing an
   * existing locked browser group if one is found (so it survives window
   * reloads) or creating and locking a new one otherwise. Side-group creation
   * is synchronous; window creation is asynchronous.
   */
  _getOrCreateDedicatedGroup(placement) {
    const existing = this._findDedicatedGroup(placement);
    if (existing) {
      return existing;
    }
    if (placement === "sideGroup") {
      const direction = preferredSideBySideGroupDirection(this.configurationService);
      const group2 = this.editorGroupsService.addGroup(this.editorGroupsService.activeGroup, direction);
      group2.lock(true);
      return group2;
    }
    if (!this._dedicatedWindowGroupPromise) {
      this._dedicatedWindowGroupPromise = this.editorGroupsService.createAuxiliaryEditorPart().then((part) => {
        part.activeGroup.lock(true);
        return part.activeGroup;
      }).finally(() => this._dedicatedWindowGroupPromise = void 0);
    }
    return this._dedicatedWindowGroupPromise;
  }
  /**
   * Find an existing dedicated browser group for the given placement. A group
   * qualifies when it is locked and contains a browser editor (or is empty),
   * which lets us rediscover the dedicated group after a window reload
   * without tracking it in memory. Side groups live in the main editor part;
   * window groups live in an auxiliary editor part.
   */
  _findDedicatedGroup(placement) {
    const mainPart = this.editorGroupsService.mainPart;
    for (const group2 of this.editorGroupsService.groups) {
      if (!group2.isLocked) {
        continue;
      }
      if (group2.editors.length > 0 && !group2.editors.some((editor) => editor instanceof BrowserEditorInput)) {
        continue;
      }
      const inMainPart = this.editorGroupsService.getPart(group2) === mainPart;
      const matchesPlacement = placement === "sideGroup" ? inMainPart : !inMainPart;
      if (matchesPlacement) {
        return group2;
      }
    }
    return void 0;
  }
  registerOpenHandler(handler) {
    this._openHandlers.add(handler);
    return toDisposable(() => {
      this._openHandlers.delete(handler);
    });
  }
  async createBrowserView(options3, editorOpenOptions) {
    const input = this._getOrCreateLazy({
      id: generateUuid(),
      associatedResource: options3.associatedResource,
      url: options3.initialUrl
    }, void 0, { ...options3, initialUrl: void 0 });
    const model = await input.resolve();
    if (editorOpenOptions) {
      void this._openEditorForCreatedView(input, options3.owner, editorOpenOptions).catch((error) => {
        this.logService.error("[BrowserViewWorkbenchService] Failed to open editor for created browser view.", error);
      });
    }
    const initialUrl = options3.initialUrl;
    if (initialUrl) {
      const didNavigate = await raceTimeout((async () => {
        await model.loadURL(initialUrl);
        return true;
      })(), OPEN_BROWSER_NAVIGATION_TIMEOUT_MS);
      if (!didNavigate) {
        throw new Error(`Navigation to ${initialUrl} timed out after ${OPEN_BROWSER_NAVIGATION_TIMEOUT_MS} ms. The page (ID: ${input.id}) is open and can be reused.`);
      }
    }
    return input;
  }
  getOrCreateLazy(data) {
    return this._getOrCreateLazy(data);
  }
  _getOrCreateLazy(data, model, createOptions3) {
    const { id: id2, associatedResource } = data;
    if (!this._known.has(id2)) {
      const input = this.instantiationService.createInstance(BrowserEditorInput, data, async () => {
        const info = await this._browserViewService.getOrCreateBrowserView(
          id2,
          {
            hostWindowId: this._mainWindowId,
            owner: createOptions3?.owner ?? { type: "user" },
            associatedResource,
            session: createOptions3?.session ?? { scope: await this._resolveStorageScope(data.storageScope) },
            initialAudiences: createOptions3?.initialAudiences,
            initialUrl: createOptions3 ? createOptions3.initialUrl : data.url,
            openSource: createOptions3?.openSource
          }
        );
        return this._createModel(info);
      });
      input.onWillDispose(() => {
        this._known.delete(id2);
        this._onDidChangeBrowserViews.fire();
      });
      if (model) {
        input.model = model;
      }
      this._known.set(id2, input);
      this._onDidChangeBrowserViews.fire();
    }
    return this._known.get(id2);
  }
  async clearGlobalStorage() {
    return this._browserViewService.clearGlobalStorage();
  }
  async clearWorkspaceStorage() {
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    return this._browserViewService.clearWorkspaceStorage(workspaceId);
  }
  async _resolveStorageScope(explicit) {
    const configured = this.configurationService.getValue(
      "workbench.browser.dataStorage"
    ) ?? "default";
    await this.workspaceTrustManagementService.workspaceTrustInitialized;
    const isWorkspaceUntrusted = this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */ && !this.workspaceTrustManagementService.isWorkspaceTrusted();
    return resolveBrowserViewStorageScope(
      explicit,
      configured,
      isWorkspaceUntrusted,
      !!this.environmentService.remoteAuthority
    );
  }
  /**
   * Fetch all views owned by this window from the main service and create
   * models for them so they are available synchronously.
   */
  async _initializeExistingViews() {
    const views = await this._browserViewService.getBrowserViews(this._mainWindowId);
    for (const info of views) {
      this._createModel(info);
    }
  }
  _createModel(info, initialUrl) {
    const associatedResource = URI.revive(info.associatedResource);
    const input = this._known.get(info.id);
    const existing = input?.model;
    if (existing) {
      return existing;
    }
    const state = input ? {
      ...info.state,
      url: input.url ?? info.state.url,
      title: input.title ?? info.state.title,
      lastFavicon: input.favicon ?? info.state.lastFavicon
    } : initialUrl ? { ...info.state, url: initialUrl } : info.state;
    const model = this.instantiationService.createInstance(BrowserViewModel, info.id, info.owner, associatedResource, state, this._browserViewService);
    this._getOrCreateLazy({ id: info.id, associatedResource, url: initialUrl }, model).model = model;
    this._onDidChangeBrowserViews.fire();
    return model;
  }
  /**
   * Open an editor tab for a newly created browser view.
   */
  async _openEditorForCreatedView(view, owner, options3) {
    for (const handler of this._openHandlers) {
      if (!handler.shouldOpenEditor(view, owner, options3)) {
        return;
      }
    }
    let targetGroup;
    if (options3.auxiliaryWindow) {
      targetGroup = AUX_WINDOW_GROUP;
    } else if (options3.parentViewId) {
      targetGroup = this._findEditorGroupForView(options3.parentViewId);
      if (targetGroup === void 0) {
        return;
      }
    } else {
      targetGroup = await this.getPreferredGroup();
    }
    const editorOptions2 = {
      inactive: options3.background,
      preserveFocus: options3.preserveFocus,
      pinned: options3.pinned,
      auxiliary: options3.auxiliaryWindow ? { bounds: options3.auxiliaryWindow, compact: true } : void 0
    };
    const [group2] = await this.instantiationService.invokeFunction(findGroup, { editor: view, options: editorOptions2 }, targetGroup);
    if (owner.type === "agent") {
      const sessionResource = URI.parse(owner.sessionId);
      const widget = this.chatWidgetService.getWidgetBySessionResource(sessionResource);
      const isWidgetVisible = !!widget && widget.domNode.offsetParent !== null;
      const activeIsSameSession = group2.activeEditor instanceof ChatEditorInput && isEqual2(group2.activeEditor.sessionResource, sessionResource);
      if (!isWidgetVisible || activeIsSameSession) {
        editorOptions2.inactive = true;
      }
    }
    void this.editorService.openEditor(view, editorOptions2, group2);
  }
  /**
   * Find the editor group that currently contains a browser view with the
   * given ID, or undefined if not open in any group.
   */
  _findEditorGroupForView(viewId) {
    for (const group2 of this.editorGroupsService.groups) {
      for (const editor of group2.editors) {
        if (editor instanceof BrowserEditorInput && editor.id === viewId) {
          return group2.id;
        }
      }
    }
    return void 0;
  }
  _updateWindowConfiguration() {
    void this._browserViewService.updateWindowConfiguration(this._mainWindowId, {
      theme: this._getTheme(),
      keybindings: this._getKeybindings(),
      aiFeaturesDisabled: !this.contextKeyService.contextMatchesRules(ChatContextKeys.enabled),
      maxHistoryEntries: this.configurationService.getValue(BrowserMaxHistoryEntriesSettingId),
      arenaFollowLatest: this.configurationService.getValue(browserArenaFollowLatestSettingId) !== false,
      proxyInfo: this._remoteProxyInfo,
      trustedFileRoots: this._getTrustedFileRoots(),
      trustAllFiles: !this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()
    });
  }
  _getKeybindings() {
    const keybindings = /* @__PURE__ */ Object.create(null);
    for (const commandId of browserViewContextMenuCommands) {
      const binding = this.keybindingService.lookupKeybinding(commandId);
      const accelerator = binding?.getElectronAccelerator();
      if (accelerator) {
        keybindings[commandId] = accelerator;
      }
    }
    return keybindings;
  }
  _getTheme() {
    const theme = this.themeService.getColorTheme();
    return {
      focusBorder: theme.getColor(focusBorder)?.toString(),
      buttonBackground: theme.getColor(buttonBackground)?.toString(),
      buttonForeground: theme.getColor(buttonForeground)?.toString(),
      widgetBackground: theme.getColor(editorWidgetBackground)?.toString(),
      widgetForeground: theme.getColor(editorWidgetForeground)?.toString(),
      widgetBorder: theme.getColor(editorWidgetBorder)?.toString(),
      widgetShadow: theme.getColor(widgetShadow)?.toString(),
      contrastBorder: theme.getColor(contrastBorder)?.toString(),
      descriptionForeground: theme.getColor(descriptionForeground)?.toString(),
      inputPlaceholderForeground: theme.getColor(inputPlaceholderForeground)?.toString(),
      toolbarHoverBackground: theme.getColor(toolbarHoverBackground)?.toString(),
      font: DEFAULT_FONT_FAMILY,
      reducedMotion: this.accessibilityService.isMotionReduced()
    };
  }
  _getTrustedFileRoots() {
    const roots = new Set(getCopilotRootPaths(this.environmentService.userHome.fsPath, process2.env));
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      for (const folder of this.workspaceContextService.getWorkspace().folders) {
        if (folder.uri.scheme === Schemas.file) {
          roots.add(folder.uri.fsPath);
        }
      }
    }
    for (const uri5 of this.workspaceTrustManagementService.getTrustedUris()) {
      if (uri5.scheme === Schemas.file) {
        roots.add(uri5.fsPath);
      }
    }
    return [...roots];
  }
};

BrowserViewWorkbenchService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IWorkspaceTrustManagementService),
  __decorateParam(8, IWorkspaceTrustEnablementService),
  __decorateParam(9, ILogService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, INativeWorkbenchEnvironmentService),
  __decorateParam(12, IThemeService),
  __decorateParam(13, IChatWidgetService),
  __decorateParam(14, IAccessibilityService)
], BrowserViewWorkbenchService);
export { BrowserMaxHistoryEntriesSettingId, BrowserRemoteProxyEnabledSettingId, BrowserNewTabPlacementSettingId, OPEN_BROWSER_NAVIGATION_TIMEOUT_MS, browserViewContextMenuCommands, BrowserViewWorkbenchService };
