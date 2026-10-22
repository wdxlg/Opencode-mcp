// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserViewMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableMap, init_lifecycle } from "./module-0018.mjs";
import { BrowserViewCommandId, init_browserView } from "./module-0069.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { IInstantiationService, createDecorator, init_instantiation } from "./module-0039.mjs";
import { BrowserView, init_browserView2 } from "./module-0146.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { BrowserSession, init_browserSession } from "./module-0089.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { init_browserViewTelemetry, logBrowserOpen } from "./module-0145.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { INativeHostMainService, init_nativeHostMainService } from "./module-0156.mjs";
import { htmlAttributeEncodeValue, init_strings } from "./module-0027.mjs";
import { init_browserViewInspector } from "./module-0139.mjs";
import { equals2, init_objects } from "./module-0121.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/browserView/electron-main/browserViewMainService.ts
import { ClipboardItem as ClipboardItem2, clipboard as clipboard2, Menu as Menu3, MenuItem as MenuItem2 } from "electron";

var IBrowserViewMainService, BrowserViewMainService;

var init_browserViewMainService = __esm({
  "src/vs/platform/browserView/electron-main/browserViewMainService.ts"() {
    init_event();
    init_lifecycle();
    init_browserView();
    init_environmentMainService();
    init_instantiation();
    init_browserView2();
    init_uuid();
    init_windows();
    init_browserSession();
    init_storageMainService();
    init_browserViewTelemetry();
    init_telemetry();
    init_nls();
    init_nativeHostMainService();
    init_strings();
    init_browserViewInspector();
    init_objects();
    init_uri();
    init_log();
    IBrowserViewMainService = createDecorator("browserViewMainService");
    BrowserViewMainService = class extends Disposable {
      constructor(environmentMainService, instantiationService, windowsMainService, telemetryService, nativeHostMainService, applicationStorageMainService, logService) {
        super();
        this.environmentMainService = environmentMainService;
        this.instantiationService = instantiationService;
        this.windowsMainService = windowsMainService;
        this.telemetryService = telemetryService;
        this.nativeHostMainService = nativeHostMainService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.logService = logService;
        this.browserViews = this._register(new DisposableMap());
        /**
         * Per-window configuration applied to the browser views that window owns.
         * Entries are dropped when the window is destroyed.
         */
        this._windowConfigurations = /* @__PURE__ */ new Map();
        this._windowCloseSubscriptions = this._register(new DisposableMap());
        this._onDidCreateBrowserView = this._register(new Emitter());
        this.onDidCreateBrowserView = this._onDidCreateBrowserView.event;
      }
      /**
       * Check if a webContents belongs to an integrated browser view.
       * Delegates to {@link BrowserSession.isBrowserViewWebContents}.
       */
      static isBrowserViewWebContents(contents) {
        return BrowserSession.isBrowserViewWebContents(contents);
      }
      async getOrCreateBrowserView(id2, options) {
        if (this.browserViews.has(id2)) {
          const view2 = this.browserViews.get(id2);
          return this._getViewInfo(view2);
        }
        const view = this._createBrowserView(id2, options);
        return this._getViewInfo(view);
      }
      tryGetBrowserView(id2) {
        return this.browserViews.get(id2);
      }
      async createTarget(url, context) {
        return this.openNew(url, context, { preserveFocus: true }, "cdpCreated");
      }
      _resolveBrowserSession(id2, hostWindowId, selector) {
        if (typeof selector === "string") {
          const browserSession = BrowserSession.get(selector);
          if (browserSession) {
            return browserSession;
          }
          return BrowserSession.getOrCreateEphemeral(this.instantiationService, id2);
        }
        const hostWindow = this.windowsMainService.getWindowById(hostWindowId);
        if (!hostWindow) {
          throw new Error(`Host window with ID ${hostWindowId} not found`);
        }
        return BrowserSession.getOrCreate(
          this.instantiationService,
          id2,
          selector,
          this.environmentMainService.workspaceStorageHome,
          hostWindow.openedWorkspace?.id
        );
      }
      /**
       * Get a browser view or throw if not found
       */
      _getBrowserView(id2) {
        const view = this.browserViews.get(id2);
        if (!view) {
          throw new Error(`Browser view ${id2} not found`);
        }
        return view;
      }
      _getViewInfo(view) {
        return {
          id: view.id,
          hostWindowId: view.hostWindowId,
          owner: view.owner,
          associatedResource: view.associatedResource,
          state: view.getState()
        };
      }
      async getBrowserViews(windowId) {
        const result = [];
        for (const [, view] of this.browserViews) {
          if (windowId !== void 0 && view.hostWindowId !== windowId) {
            continue;
          }
          result.push(this._getViewInfo(view));
        }
        return result;
      }
      onDynamicDidNavigate(id2) {
        return this._getBrowserView(id2).onDidNavigate;
      }
      onDynamicDidChangeLoadingState(id2) {
        return this._getBrowserView(id2).onDidChangeLoadingState;
      }
      onDynamicDidChangeFocus(id2) {
        return this._getBrowserView(id2).onDidChangeFocus;
      }
      onDynamicDidChangeVisibility(id2) {
        return this._getBrowserView(id2).onDidChangeVisibility;
      }
      onDynamicDidChangeDevToolsState(id2) {
        return this._getBrowserView(id2).onDidChangeDevToolsState;
      }
      onDynamicDidKeyCommand(id2) {
        return this._getBrowserView(id2).onDidKeyCommand;
      }
      onDynamicDidChangeTitle(id2) {
        return this._getBrowserView(id2).onDidChangeTitle;
      }
      onDynamicDidChangeFavicon(id2) {
        return this._getBrowserView(id2).onDidChangeFavicon;
      }
      onDynamicDidFindInPage(id2) {
        return this._getBrowserView(id2).onDidFindInPage;
      }
      onDynamicDidClose(id2) {
        return this._getBrowserView(id2).onDidClose;
      }
      onDynamicDidSelectElement(id2) {
        return this._getBrowserView(id2).inspector.onDidSelectElement;
      }
      onDynamicDidRemoveElementComment(id2) {
        return this._getBrowserView(id2).inspector.onDidRemoveElementComment;
      }
      onDynamicDidChangeElementSelectionState(id2) {
        return this._getBrowserView(id2).inspector.onDidChangeElementSelectionState;
      }
      onDynamicDidPickArea(id2) {
        return this._getBrowserView(id2).inspector.onDidPickArea;
      }
      onDynamicDidChangeAreaSelectionActive(id2) {
        return this._getBrowserView(id2).inspector.onDidChangeAreaSelectionActive;
      }
      onDynamicDidChangeDeviceEmulation(id2) {
        return this._getBrowserView(id2).emulator.onDidChange;
      }
      onDynamicDidChangeRemoteStatus(id2) {
        return this._getBrowserView(id2).onDidChangeRemoteStatus;
      }
      onDynamicDidChangeAudiences(id2) {
        return this._getBrowserView(id2).onDidChangeAudiences;
      }
      onDynamicDidChangeArenaFollowLatest(id2) {
        return this._getBrowserView(id2).arenaFollowLatest.onDidChange;
      }
      async setArenaFollowLatestEnabled(id2, enabled) {
        this._getBrowserView(id2).arenaFollowLatest.setEnabled(enabled, true);
      }
      onDynamicDidRequestPermission(id2) {
        return this._getBrowserView(id2).onDidRequestPermission;
      }
      onDynamicDidChangePermissions(id2) {
        return this._getBrowserView(id2).onDidChangePermissions;
      }
      async getState(id2) {
        return this._getBrowserView(id2).getState();
      }
      async setAudience(id2, audience, enabled) {
        this._getBrowserView(id2).setAudience(audience, enabled);
      }
      async destroyBrowserView(id2) {
        return this.browserViews.deleteAndDispose(id2);
      }
      async layout(id2, bounds) {
        return this._getBrowserView(id2).layout(bounds);
      }
      async setVisible(id2, visible) {
        return this._getBrowserView(id2).setVisible(visible);
      }
      async loadURL(id2, url) {
        return this._getBrowserView(id2).loadURL(url);
      }
      async getURL(id2) {
        return this._getBrowserView(id2).getURL();
      }
      async goBack(id2) {
        return this._getBrowserView(id2).goBack();
      }
      async goForward(id2) {
        return this._getBrowserView(id2).goForward();
      }
      async reload(id2, hard) {
        return this._getBrowserView(id2).reload(hard);
      }
      async toggleDevTools(id2) {
        return this._getBrowserView(id2).toggleDevTools();
      }
      async canGoBack(id2) {
        return this._getBrowserView(id2).canGoBack();
      }
      async canGoForward(id2) {
        return this._getBrowserView(id2).canGoForward();
      }
      async captureScreenshot(id2, options) {
        return this._getBrowserView(id2).captureScreenshot(options);
      }
      async focus(id2, force) {
        return this._getBrowserView(id2).focus(force);
      }
      async findInPage(id2, text, options) {
        return this._getBrowserView(id2).findInPage(text, options);
      }
      async stopFindInPage(id2, keepSelection) {
        return this._getBrowserView(id2).stopFindInPage(keepSelection);
      }
      async getSelectedText(id2) {
        return this._getBrowserView(id2).getSelectedText();
      }
      async clearStorage(id2) {
        return this._getBrowserView(id2).clearStorage();
      }
      async setBrowserZoomIndex(id2, zoomIndex) {
        return this._getBrowserView(id2).setBrowserZoomIndex(zoomIndex);
      }
      async setDeviceEmulation(id2, device) {
        return this._getBrowserView(id2).emulator.setDevice(device);
      }
      async trustCertificate(id2, host, fingerprint) {
        return this._getBrowserView(id2).trustCertificate(host, fingerprint);
      }
      async untrustCertificate(id2, host, fingerprint) {
        return this._getBrowserView(id2).untrustCertificate(host, fingerprint);
      }
      async deleteBrowserHistory(id2, entryIds) {
        this._getBrowserView(id2).session.history.delete(entryIds);
      }
      async setPermissions(id2, origin, grants) {
        this._getBrowserView(id2).session.permissions.set(origin, grants);
      }
      async selectDevice(id2, requestId, deviceId) {
        this._getBrowserView(id2).selectDevice(requestId, deviceId);
      }
      async clearGlobalStorage() {
        const browserSession = BrowserSession.getOrCreateGlobal(this.instantiationService);
        browserSession.connectStorage(this.applicationStorageMainService);
        await browserSession.clearData();
      }
      async clearWorkspaceStorage(workspaceId) {
        const browserSession = BrowserSession.getOrCreateWorkspace(
          this.instantiationService,
          workspaceId,
          this.environmentMainService.workspaceStorageHome
        );
        browserSession.connectStorage(this.applicationStorageMainService);
        await browserSession.clearData();
      }
      async getConsoleLogs(id2) {
        return this._getBrowserView(id2).getConsoleLogs();
      }
      async toggleElementSelection(id2, enabled, options) {
        return this._getBrowserView(id2).inspector.toggleElementSelection(enabled, options);
      }
      async setElementComments(id2, update) {
        this._getBrowserView(id2).inspector.setElementComments(update);
      }
      async toggleAreaSelection(id2, enabled) {
        return this._getBrowserView(id2).inspector.toggleAreaSelection(enabled);
      }
      async updateWindowConfiguration(windowId, config) {
        const oldConfig = this._windowConfigurations.get(windowId);
        const didThemeChange = !equals2(oldConfig?.theme, config.theme);
        const didProxyChange = !equals2(oldConfig?.proxyInfo, config.proxyInfo);
        this._windowConfigurations.set(windowId, config);
        this._ensureWindowCloseSubscription(windowId);
        for (const [, view] of this.browserViews) {
          if (view.hostWindowId === windowId) {
            if (didThemeChange) {
              view.inspector.setTheme(config.theme);
            }
            if (didProxyChange) {
              view.arenaFollowLatest.setEnabled(config.arenaFollowLatest !== false);
              view.session.remote.acquire(view.id, config.proxyInfo);
            }
            if (typeof config.maxHistoryEntries === "number") {
              view.session.history.setMaxEntries(config.maxHistoryEntries);
            }
          }
        }
        this._recomputeTrustedFileRoots();
      }
      _ensureWindowCloseSubscription(windowId) {
        if (this._windowCloseSubscriptions.has(windowId)) {
          return;
        }
        const window2 = this.windowsMainService.getWindowById(windowId);
        if (!window2) {
          return;
        }
        const onWindowGone = Event.any(window2.onDidClose, window2.onDidDestroy);
        this._windowCloseSubscriptions.set(windowId, Event.once(onWindowGone)(() => {
          this._windowCloseSubscriptions.deleteAndDispose(windowId);
          if (this._windowConfigurations.delete(windowId)) {
            this._recomputeTrustedFileRoots();
          }
        }));
      }
      _recomputeTrustedFileRoots() {
        const roots = /* @__PURE__ */ new Set();
        let trustAllFiles = false;
        for (const configuration of this._windowConfigurations.values()) {
          for (const root of configuration.trustedFileRoots) {
            roots.add(root);
          }
          trustAllFiles ||= configuration.trustAllFiles;
        }
        BrowserSession.setTrustedFileRoots([...roots], trustAllFiles);
      }
      /**
       * Create a browser view backed by the given {@link BrowserSession}.
       */
      _createNativeBrowserView(id2, hostWindowId, owner, browserSession, associatedResource, options) {
        if (this.browserViews.has(id2)) {
          throw new Error(`Browser view with id ${id2} already exists`);
        }
        browserSession.connectStorage(this.applicationStorageMainService);
        const windowConfiguration = this._windowConfigurations.get(hostWindowId);
        if (typeof windowConfiguration?.maxHistoryEntries === "number") {
          browserSession.history.setMaxEntries(windowConfiguration.maxHistoryEntries);
        }
        browserSession.remote.acquire(id2, windowConfiguration?.proxyInfo);
        const view = this.instantiationService.createInstance(
          BrowserView,
          id2,
          hostWindowId,
          owner,
          associatedResource,
          browserSession,
          // Child views share their host, owner, and storage, but do not implicitly inherit agent access.
          (url, electronOptions, editorOptions) => {
            return this._createBrowserView(generateUuid(), {
              hostWindowId,
              owner,
              session: browserSession.id,
              initialUrl: url || void 0
            }, editorOptions, electronOptions);
          },
          (v, params) => this.showContextMenu(v, params),
          options
        );
        view.arenaFollowLatest.setEnabled(windowConfiguration?.arenaFollowLatest !== false);
        this.browserViews.set(id2, view);
        if (windowConfiguration?.theme) {
          view.inspector.setTheme(windowConfiguration.theme);
        }
        Event.once(view.onDidClose)(() => {
          browserSession.remote.release(id2);
          this.browserViews.deleteAndDispose(id2);
        });
        return view;
      }
      _createBrowserView(id2, options, editorOpenRequest, electronOptions) {
        const browserSession = this._resolveBrowserSession(id2, options.hostWindowId, options.session);
        const view = this._createNativeBrowserView(id2, options.hostWindowId, options.owner, browserSession, URI.revive(options.associatedResource), electronOptions);
        if (options.initialAudiences) {
          view.setAudiences(options.initialAudiences);
        }
        if (options.initialUrl) {
          void view.loadURL(options.initialUrl).catch((error) => {
            this.logService.error(`[BrowserViewMainService] Failed to load initial URL for browser view ${id2}`, error);
          });
        }
        if (options.openSource) {
          logBrowserOpen(this.telemetryService, options.openSource);
        }
        this._onDidCreateBrowserView.fire({
          info: this._getViewInfo(view),
          initialUrl: options.initialUrl,
          editorOpenRequest
        });
        return view;
      }
      async openNew(url, context, editorOpenRequest, source) {
        const targetId = generateUuid();
        const view = this._createBrowserView(targetId, { ...context, initialUrl: url || void 0, openSource: source }, editorOpenRequest);
        return view;
      }
      async showContextMenu(view, params) {
        const win = view.getElectronWindow();
        if (!win) {
          return;
        }
        const webContents4 = view.webContents;
        if (webContents4.isDestroyed()) {
          return;
        }
        const windowConfiguration = this._windowConfigurations.get(view.hostWindowId);
        const inspectTarget = windowConfiguration?.aiFeaturesDisabled ? void 0 : params.frame && await view.inspector.getElementHandle("context-menu-target" /* ContextMenuTarget */, params.frame);
        const menu = new Menu3();
        if (params.linkURL) {
          menu.append(new MenuItem2({
            label: localize(2773, null),
            click: () => {
              void this.openNew(params.linkURL, {
                hostWindowId: view.hostWindowId,
                owner: view.owner,
                session: view.session.id
              }, { preserveFocus: true, background: true }, "browserLinkBackground");
            }
          }));
          menu.append(new MenuItem2({
            label: localize(2772, null),
            click: () => {
              void this.nativeHostMainService.openExternal(void 0, params.linkURL);
            }
          }));
          menu.append(new MenuItem2({ type: "separator" }));
          menu.append(new MenuItem2({
            label: localize(2768, null),
            click: () => {
              void clipboard2.write([new ClipboardItem2({
                "text/plain": params.linkURL,
                "text/html": `<a href="${encodeURI(params.linkURL)}">${htmlAttributeEncodeValue(params.linkText || params.linkURL)}</a>`
              })]);
            }
          }));
        }
        if (params.hasImageContents && params.srcURL) {
          if (menu.items.length > 0) {
            menu.append(new MenuItem2({ type: "separator" }));
          }
          menu.append(new MenuItem2({
            label: localize(2771, null),
            click: () => {
              void this.openNew(params.srcURL, {
                hostWindowId: view.hostWindowId,
                owner: view.owner,
                session: view.session.id
              }, { preserveFocus: true, background: true }, "browserLinkBackground");
            }
          }));
          menu.append(new MenuItem2({
            label: localize(2766, null),
            click: () => {
              view.webContents.copyImageAt(params.x, params.y);
            }
          }));
          menu.append(new MenuItem2({
            label: localize(2767, null),
            click: () => {
              clipboard2.writeText(params.srcURL);
            }
          }));
        }
        const spellingSuggestions = params.dictionarySuggestions ?? [];
        const canAddToDictionary = !!params.misspelledWord && webContents4.session.isPersistent();
        if (params.misspelledWord && (spellingSuggestions.length > 0 || canAddToDictionary)) {
          if (menu.items.length > 0) {
            menu.append(new MenuItem2({ type: "separator" }));
          }
          for (const suggestion of spellingSuggestions) {
            menu.append(new MenuItem2({
              label: suggestion,
              click: () => webContents4.replaceMisspelling(suggestion)
            }));
          }
          if (canAddToDictionary) {
            if (spellingSuggestions.length > 0) {
              menu.append(new MenuItem2({ type: "separator" }));
            }
            menu.append(new MenuItem2({
              label: localize(2764, null),
              click: () => webContents4.session.addWordToSpellCheckerDictionary(params.misspelledWord)
            }));
          }
          menu.append(new MenuItem2({ type: "separator" }));
        }
        if (params.isEditable) {
          menu.append(new MenuItem2({ role: "cut", enabled: params.editFlags.canCut }));
          menu.append(new MenuItem2({ role: "copy", enabled: params.editFlags.canCopy }));
          menu.append(new MenuItem2({ role: "paste", enabled: params.editFlags.canPaste }));
          menu.append(new MenuItem2({ role: "pasteAndMatchStyle", enabled: params.editFlags.canPaste }));
          menu.append(new MenuItem2({ role: "selectAll", enabled: params.editFlags.canSelectAll }));
        } else if (params.selectionText) {
          menu.append(new MenuItem2({ role: "copy" }));
        }
        if (menu.items.length === 0) {
          if (webContents4.navigationHistory.canGoBack()) {
            menu.append(new MenuItem2({
              label: localize(2765, null),
              accelerator: windowConfiguration?.keybindings[BrowserViewCommandId.GoBack],
              click: () => webContents4.navigationHistory.goBack()
            }));
          }
          if (webContents4.navigationHistory.canGoForward()) {
            menu.append(new MenuItem2({
              label: localize(2769, null),
              accelerator: windowConfiguration?.keybindings[BrowserViewCommandId.GoForward],
              click: () => webContents4.navigationHistory.goForward()
            }));
          }
          menu.append(new MenuItem2({
            label: localize(2774, null),
            accelerator: windowConfiguration?.keybindings[BrowserViewCommandId.Reload],
            click: () => webContents4.reload()
          }));
        }
        if (inspectTarget) {
          menu.append(new MenuItem2({ type: "separator" }));
          menu.append(new MenuItem2({
            label: localize(2763, null),
            click: () => inspectTarget.addToChat()
          }));
          menu.append(new MenuItem2({
            label: localize(2762, null),
            click: () => inspectTarget.addComment()
          }));
          void inspectTarget.highlight().catch(() => {
          });
          menu.on("menu-will-close", () => inspectTarget.dispose());
        }
        menu.append(new MenuItem2({ type: "separator" }));
        menu.append(new MenuItem2({
          label: localize(2770, null),
          click: () => webContents4.inspectElement(params.x, params.y)
        }));
        const viewBounds = view.getWebContentsView().getBounds();
        menu.popup({
          window: win,
          x: viewBounds.x + params.x,
          y: viewBounds.y + params.y,
          sourceType: params.menuSourceType
        });
      }
    };
    BrowserViewMainService = __decorateClass([
      __decorateParam(0, IEnvironmentMainService),
      __decorateParam(1, IInstantiationService),
      __decorateParam(2, IWindowsMainService),
      __decorateParam(3, ITelemetryService),
      __decorateParam(4, INativeHostMainService),
      __decorateParam(5, IApplicationStorageMainService),
      __decorateParam(6, ILogService)
    ], BrowserViewMainService);
  }
});
export { ClipboardItem2, clipboard2, Menu3, MenuItem2, IBrowserViewMainService, BrowserViewMainService, init_browserViewMainService };
