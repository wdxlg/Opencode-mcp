// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/native/electron-main/nativeHostMainService.ts
import { dirname3, init_path, join4, posix, resolve2, win32 } from "./module-0008.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_decorators, memoize } from "./module-0052.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableMap, DisposableStore, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { Schemas, init_network, matchesSomeScheme } from "./module-0031.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { hasKey, init_types } from "./module-0016.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_id, virtualMachineHint } from "./module-0148.mjs";
import { Promises2, SymlinkSupport, init_pfs } from "./module-0036.mjs";
import { findFreePort, init_ports, isPortFree } from "./module-0149.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IDialogMainService, init_dialogMainService } from "./module-0123.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { IInstantiationService, createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_native } from "./module-0150.mjs";
import { IGlobalKeybindingsMainService, init_globalKeybindingsMainService } from "./module-0151.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IThemeMainService, init_themeMainService } from "./module-0100.mjs";
import { defaultWindowState, init_window2 } from "./module-0097.mjs";
import { IWindowsMainService, defaultBrowserWindowOptions, init_windows } from "./module-0101.mjs";
import { init_workspace, isWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0076.mjs";
import { IWorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { hasWSLFeatureInstalled, init_wsl } from "./module-0152.mjs";
import { WindowProfiler, init_windowProfiling } from "./module-0153.mjs";
import { IAuxiliaryWindowsMainService, init_auxiliaryWindows } from "./module-0140.mjs";
import { CancellationError, init_errors } from "./module-0010.mjs";
import { extract, init_zip, validateZip, zip } from "./module-0154.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IProxyAuthService, init_auth } from "./module-0110.mjs";
import { IRequestService, init_request } from "./module-0155.mjs";
import { init_extpath, randomPath } from "./module-0028.mjs";
import { CancellationToken, CancellationTokenSource, init_cancellation } from "./module-0022.mjs";


// src/vs/platform/native/electron-main/nativeHostMainService.ts
import * as fs9 from "fs";

import { exec } from "child_process";

import { app as app5, BrowserWindow as BrowserWindow3, clipboard, ClipboardItem, contentTracing, Menu as Menu2, nativeImage, Notification, powerMonitor, powerSaveBlocker, screen as screen2, shell, systemPreferences, webContents as webContents2 } from "electron";

import { arch as arch2, cpus, freemem, loadavg, platform as platform3, release as release3, totalmem, type } from "os";

import { promisify as promisify2 } from "util";

async function collectZipFiles(root, relative3 = "") {
  const entries = await fs9.promises.readdir(join4(root, relative3), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path4 = relative3 ? posix.join(relative3, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...await collectZipFiles(root, path4));
    } else if (entry.isFile()) {
      files.push({ path: path4, localPath: join4(root, path4) });
    }
  }
  return files;
}

var INativeHostMainService, NativeHostMainService;

var init_nativeHostMainService = __esm({
  "src/vs/platform/native/electron-main/nativeHostMainService.ts"() {
    init_decorators();
    init_event();
    init_lifecycle();
    init_network();
    init_path();
    init_platform();
    init_types();
    init_uri();
    init_id();
    init_pfs();
    init_ports();
    init_nls();
    init_dialogMainService();
    init_environmentMainService();
    init_instantiation();
    init_lifecycleMainService();
    init_log();
    init_native();
    init_globalKeybindingsMainService();
    init_productService();
    init_themeMainService();
    init_window2();
    init_windows();
    init_workspace();
    init_workspacesManagementMainService();
    init_buffer();
    init_wsl();
    init_windowProfiling();
    init_auxiliaryWindows();
    init_errors();
    init_zip();
    init_configuration();
    init_auth();
    init_request();
    init_extpath();
    init_cancellation();
    INativeHostMainService = createDecorator("nativeHostMainService");
    NativeHostMainService = class extends Disposable {
      constructor(windowsMainService, auxiliaryWindowsMainService, dialogMainService, lifecycleMainService, environmentMainService, logService, productService, themeMainService, workspacesManagementMainService, configurationService, requestService, proxyAuthService, instantiationService, globalKeybindingsMainService) {
        super();
        this.windowsMainService = windowsMainService;
        this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
        this.dialogMainService = dialogMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        this.productService = productService;
        this.themeMainService = themeMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.configurationService = configurationService;
        this.requestService = requestService;
        this.proxyAuthService = proxyAuthService;
        this.instantiationService = instantiationService;
        this.globalKeybindingsMainService = globalKeybindingsMainService;
        this._onDidChangePassword = this._register(new Emitter());
        this.onDidChangePassword = this._onDidChangePassword.event;
        this._isTracing = false;
        // #endregion
        //#region Toast Notifications
        this.activeToasts = this._register(new DisposableMap());
        this.activeToastDedupeKeys = /* @__PURE__ */ new Map();
        {
          this.onDidOpenMainWindow = Event.map(this.windowsMainService.onDidOpenWindow, (window2) => window2.id);
          this.onDidTriggerWindowSystemContextMenu = Event.any(
            Event.map(this.windowsMainService.onDidTriggerSystemContextMenu, ({ window: window2, x, y }) => ({ windowId: window2.id, x, y })),
            Event.map(this.auxiliaryWindowsMainService.onDidTriggerSystemContextMenu, ({ window: window2, x, y }) => ({ windowId: window2.id, x, y }))
          );
          this.onDidMaximizeWindow = Event.any(
            Event.map(this.windowsMainService.onDidMaximizeWindow, (window2) => window2.id),
            Event.map(this.auxiliaryWindowsMainService.onDidMaximizeWindow, (window2) => window2.id)
          );
          this.onDidUnmaximizeWindow = Event.any(
            Event.map(this.windowsMainService.onDidUnmaximizeWindow, (window2) => window2.id),
            Event.map(this.auxiliaryWindowsMainService.onDidUnmaximizeWindow, (window2) => window2.id)
          );
          this.onDidChangeWindowFullScreen = Event.any(
            Event.map(this.windowsMainService.onDidChangeFullScreen, (e) => ({ windowId: e.window.id, fullscreen: e.fullscreen })),
            Event.map(this.auxiliaryWindowsMainService.onDidChangeFullScreen, (e) => ({ windowId: e.window.id, fullscreen: e.fullscreen }))
          );
          this.onDidChangeWindowAlwaysOnTop = Event.any(
            Event.None,
            // always on top is unsupported in main windows currently
            Event.map(this.auxiliaryWindowsMainService.onDidChangeAlwaysOnTop, (e) => ({ windowId: e.window.id, alwaysOnTop: e.alwaysOnTop }))
          );
          this.onDidBlurMainWindow = Event.filter(Event.fromNodeEventEmitter(app5, "browser-window-blur", (event, window2) => window2.id), (windowId) => !!this.windowsMainService.getWindowById(windowId));
          this.onDidFocusMainWindow = Event.any(
            Event.map(Event.filter(Event.map(this.windowsMainService.onDidChangeWindowsCount, () => this.windowsMainService.getLastActiveWindow()), (window2) => !!window2), (window2) => window2.id),
            Event.filter(Event.fromNodeEventEmitter(app5, "browser-window-focus", (event, window2) => window2.id), (windowId) => !!this.windowsMainService.getWindowById(windowId))
          );
          this.onDidBlurMainOrAuxiliaryWindow = Event.any(
            this.onDidBlurMainWindow,
            Event.map(Event.filter(Event.fromNodeEventEmitter(app5, "browser-window-blur", (event, window2) => this.auxiliaryWindowsMainService.getWindowByWebContents(window2.webContents)), (window2) => !!window2), (window2) => window2.id)
          );
          this.onDidFocusMainOrAuxiliaryWindow = Event.any(
            this.onDidFocusMainWindow,
            Event.map(Event.filter(Event.fromNodeEventEmitter(app5, "browser-window-focus", (event, window2) => this.auxiliaryWindowsMainService.getWindowByWebContents(window2.webContents)), (window2) => !!window2), (window2) => window2.id)
          );
          this.onDidSuspendOS = Event.fromNodeEventEmitter(powerMonitor, "suspend");
          this.onDidResumeOS = Event.fromNodeEventEmitter(powerMonitor, "resume");
          this.onDidChangeOnBatteryPower = Event.any(
            Event.map(Event.fromNodeEventEmitter(powerMonitor, "on-ac"), () => false),
            Event.map(Event.fromNodeEventEmitter(powerMonitor, "on-battery"), () => true)
          );
          this.onDidChangeThermalState = Event.map(
            Event.fromNodeEventEmitter(powerMonitor, "thermal-state-change"),
            (e) => e.state
          );
          this.onDidChangeSpeedLimit = Event.map(
            Event.fromNodeEventEmitter(powerMonitor, "speed-limit-change"),
            (e) => e.limit
          );
          this.onWillShutdownOS = Event.fromNodeEventEmitter(powerMonitor, "shutdown");
          this.onDidLockScreen = Event.fromNodeEventEmitter(powerMonitor, "lock-screen");
          this.onDidUnlockScreen = Event.fromNodeEventEmitter(powerMonitor, "unlock-screen");
          this.onDidChangeColorScheme = this.themeMainService.onDidChangeColorScheme;
          this.onDidChangeDisplay = Event.debounce(Event.any(
            Event.filter(Event.fromNodeEventEmitter(screen2, "display-metrics-changed", (event, display, changedMetrics) => changedMetrics), (changedMetrics) => {
              return !(Array.isArray(changedMetrics) && changedMetrics.length === 1 && changedMetrics[0] === "workArea");
            }),
            Event.fromNodeEventEmitter(screen2, "display-added"),
            Event.fromNodeEventEmitter(screen2, "display-removed")
          ), () => {
          }, 100);
        }
      }
      //#region Properties
      get windowId() {
        throw new Error("Not implemented in electron-main");
      }
      async getWindows(windowId, options) {
        const mainWindows = this.windowsMainService.getWindows().map((window2) => ({
          id: window2.id,
          workspace: window2.openedWorkspace ?? toWorkspaceIdentifier(window2.backupPath, window2.isExtensionDevelopmentHost),
          title: window2.win?.getTitle() ?? "",
          filename: window2.getRepresentedFilename(),
          dirty: window2.isDocumentEdited()
        }));
        const auxiliaryWindows = [];
        if (options.includeAuxiliaryWindows) {
          auxiliaryWindows.push(...this.auxiliaryWindowsMainService.getWindows().map((window2) => ({
            id: window2.id,
            parentId: window2.parentId,
            title: window2.win?.getTitle() ?? "",
            filename: window2.getRepresentedFilename()
          })));
        }
        return [...mainWindows, ...auxiliaryWindows];
      }
      async getWindowCount(windowId) {
        return this.windowsMainService.getWindowCount();
      }
      async getActiveWindowId(windowId) {
        const activeWindow = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
        if (activeWindow) {
          return activeWindow.id;
        }
        return void 0;
      }
      async getActiveWindowPosition() {
        const activeWindow = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
        if (activeWindow) {
          return activeWindow.getBounds();
        }
        return void 0;
      }
      async getNativeWindowHandle(fallbackWindowId, windowId) {
        const window2 = this.windowById(windowId, fallbackWindowId);
        if (window2?.win) {
          return VSBuffer.wrap(window2.win.getNativeWindowHandle());
        }
        return void 0;
      }
      openWindow(windowId, arg1, arg2) {
        if (Array.isArray(arg1)) {
          return this.doOpenWindow(windowId, arg1, arg2);
        }
        return this.doOpenEmptyWindow(windowId, arg1);
      }
      async doOpenWindow(windowId, toOpen, options = /* @__PURE__ */ Object.create(null)) {
        if (toOpen.length > 0) {
          const windows = await this.windowsMainService.open({
            context: 5 /* API */,
            contextWindowId: windowId,
            urisToOpen: toOpen,
            cli: this.environmentMainService.args,
            forceNewWindow: options.forceNewWindow,
            forceReuseWindow: options.forceReuseWindow,
            preferNewWindow: options.preferNewWindow,
            diffMode: options.diffMode,
            mergeMode: options.mergeMode,
            addMode: options.addMode,
            removeMode: options.removeMode,
            gotoLineMode: options.gotoLineMode,
            noRecentEntry: options.noRecentEntry,
            waitMarkerFileURI: options.waitMarkerFileURI,
            remoteAuthority: options.remoteAuthority || void 0,
            forceProfile: options.forceProfile,
            forceTempProfile: options.forceTempProfile
          });
          const chatSessionToOpen = options.chatSessionToOpen;
          if (chatSessionToOpen && windows.length === 1) {
            windows[0].sendWhenReady("vscode:openChatSession", CancellationToken.None, URI.revive(chatSessionToOpen).toString());
          }
        }
      }
      async doOpenEmptyWindow(windowId, options) {
        await this.windowsMainService.openEmptyWindow({
          context: 5 /* API */,
          contextWindowId: windowId
        }, options);
      }
      async openAgentsWindow(windowId, options) {
        const windows = await this.windowsMainService.openAgentsWindow({
          context: 5 /* API */,
          contextWindowId: windowId,
          cli: this.environmentMainService.args
        }, options?.folderUri ? URI.revive(options.folderUri) : void 0, options?.sessionResource ? URI.revive(options.sessionResource) : void 0, options?.source);
        if (windows.length > 0) {
          windows[0].focus();
        }
      }
      async syncSystemWideKeybindings(windowId, keybindings) {
        if (typeof windowId !== "number") {
          return { failed: [] };
        }
        return this.globalKeybindingsMainService.updateKeybindings(windowId, keybindings);
      }
      async isFullScreen(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return window2?.isFullScreen ?? false;
      }
      async toggleFullScreen(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.toggleFullScreen();
      }
      async getCursorScreenPoint(windowId) {
        const point = screen2.getCursorScreenPoint();
        const display = screen2.getDisplayNearestPoint(point);
        return { point, display: display.bounds };
      }
      async isMaximized(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return window2?.win?.isMaximized() ?? false;
      }
      async maximizeWindow(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.maximize();
      }
      async unmaximizeWindow(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.unmaximize();
      }
      async minimizeWindow(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.minimize();
      }
      // OpenCode: hide the window as soon as closing is confirmed (shutdown then finishes in the background),
      // and show it again when the close is vetoed or a dialog needs the user.
      async ocSetWindowHidden(windowId, hidden, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        const win = window2?.win;
        if (!win || win.isDestroyed()) {
          return;
        }
        if (hidden) {
          win.hide();
        } else if (!win.isVisible()) {
          win.show();
          win.focus();
        }
      }
      async moveWindowTop(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.moveTop();
      }
      async isWindowAlwaysOnTop(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return window2?.win?.isAlwaysOnTop() ?? false;
      }
      async toggleWindowAlwaysOnTop(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.setAlwaysOnTop(!window2.win.isAlwaysOnTop());
      }
      async setWindowAlwaysOnTop(windowId, alwaysOnTop, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.setAlwaysOnTop(alwaysOnTop);
      }
      async positionWindow(windowId, position, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        if (window2?.win) {
          if (window2.win.isFullScreen()) {
            const fullscreenLeftFuture = Event.toPromise(Event.once(Event.fromNodeEventEmitter(window2.win, "leave-full-screen")));
            window2.win.setFullScreen(false);
            await fullscreenLeftFuture;
          }
          window2.win.setBounds(position);
        }
      }
      async updateWindowControls(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.updateWindowControls(options);
      }
      async updateWindowAccentColor(windowId, color2, inactiveColor) {
        if (!isWindows2) {
          return;
        }
        const window2 = this.windowById(windowId);
        if (!window2) {
          return;
        }
        let activeWindowAccentColor;
        let inactiveWindowAccentColor;
        if (color2 === "default") {
          activeWindowAccentColor = null;
          inactiveWindowAccentColor = null;
        } else if (color2 === "off") {
          activeWindowAccentColor = false;
          inactiveWindowAccentColor = false;
        } else {
          activeWindowAccentColor = color2;
          inactiveWindowAccentColor = inactiveColor ?? color2;
        }
        const windows = [window2];
        for (const auxiliaryWindow of this.auxiliaryWindowsMainService.getWindows()) {
          if (auxiliaryWindow.parentId === windowId) {
            windows.push(auxiliaryWindow);
          }
        }
        for (const window3 of windows) {
          window3.win?.setAccentColor(window3.win.isFocused() ? activeWindowAccentColor : inactiveWindowAccentColor);
        }
      }
      async focusWindow(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.focus({ mode: options?.mode ?? 0 /* Transfer */ });
      }
      async setMinimumSize(windowId, width, height) {
        const window2 = this.codeWindowById(windowId);
        if (window2?.win) {
          const [windowWidth, windowHeight] = window2.win.getSize();
          const [minWindowWidth, minWindowHeight] = window2.win.getMinimumSize();
          const [newMinWindowWidth, newMinWindowHeight] = [width ?? minWindowWidth, height ?? minWindowHeight];
          const [newWindowWidth, newWindowHeight] = [Math.max(windowWidth, newMinWindowWidth), Math.max(windowHeight, newMinWindowHeight)];
          if (minWindowWidth !== newMinWindowWidth || minWindowHeight !== newMinWindowHeight) {
            window2.win.setMinimumSize(newMinWindowWidth, newMinWindowHeight);
          }
          if (windowWidth !== newWindowWidth || windowHeight !== newWindowHeight) {
            window2.win.setSize(newWindowWidth, newWindowHeight);
          }
        }
      }
      async saveWindowSplash(windowId, splash) {
        const window2 = this.codeWindowById(windowId);
        this.themeMainService.saveWindowSplash(windowId, window2?.openedWorkspace, splash);
      }
      async setBackgroundThrottling(windowId, allowed) {
        const window2 = this.codeWindowById(windowId);
        this.logService.trace(`Setting background throttling for window ${windowId} to '${allowed}'`);
        window2?.win?.webContents?.setBackgroundThrottling(allowed);
      }
      //#endregion
      //#region macOS Shell Command
      async installShellCommand(windowId) {
        const { source, target } = await this.getShellCommandLink();
        try {
          const { symbolicLink } = await SymlinkSupport.stat(source);
          if (symbolicLink && !symbolicLink.dangling) {
            const linkTargetRealPath = await Promises2.realpath(source);
            if (target === linkTargetRealPath) {
              return;
            }
          }
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw error;
          }
        }
        await this.installShellCommandWithPrivileges(windowId, source, target);
      }
      async installShellCommandWithPrivileges(windowId, source, target) {
        const { response } = await this.showMessageBox(windowId, {
          type: "info",
          message: localize(3175, null, this.productService.nameShort),
          buttons: [
            localize(3167, null),
            localize(3163, null)
          ]
        });
        if (response === 1) {
          throw new CancellationError();
        }
        try {
          const command = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf '${target}' '${source}'\\" with administrator privileges"`;
          await promisify2(exec)(command);
        } catch (error) {
          throw new Error(localize(3164, null, source));
        }
      }
      async uninstallShellCommand(windowId) {
        const { source } = await this.getShellCommandLink();
        try {
          await fs9.promises.unlink(source);
        } catch (error) {
          switch (error.code) {
            case "EACCES": {
              const { response } = await this.showMessageBox(windowId, {
                type: "info",
                message: localize(3176, null, this.productService.nameShort),
                buttons: [
                  localize(3167, null),
                  localize(3163, null)
                ]
              });
              if (response === 1) {
                throw new CancellationError();
              }
              try {
                const command = `osascript -e "do shell script \\"rm '${source}'\\" with administrator privileges"`;
                await promisify2(exec)(command);
              } catch (error2) {
                throw new Error(localize(3165, null, source));
              }
              break;
            }
            case "ENOENT":
              break;
            // ignore file not found
            default:
              throw error;
          }
        }
      }
      async getShellCommandLink() {
        const target = resolve2(this.environmentMainService.appRoot, "bin", "code");
        const source = `/usr/local/bin/${this.productService.applicationName}`;
        const sourceExists = await Promises2.exists(target);
        if (!sourceExists) {
          throw new Error(localize(3170, null, target));
        }
        return { source, target };
      }
      //#endregion
      //#region Dialog
      async showMessageBox(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return this.dialogMainService.showMessageBox(options, window2?.win ?? void 0);
      }
      async showSaveDialog(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return this.dialogMainService.showSaveDialog(options, window2?.win ?? void 0);
      }
      async showOpenDialog(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return this.dialogMainService.showOpenDialog(options, window2?.win ?? void 0);
      }
      async pickFileFolderAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickFileFolder(options);
        if (paths) {
          await this.doOpenPicked(await Promise.all(paths.map(async (path4) => await SymlinkSupport.existsDirectory(path4) ? { folderUri: URI.file(path4) } : { fileUri: URI.file(path4) })), options, windowId);
        }
      }
      async pickFolderAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickFolder(options);
        if (paths) {
          await this.doOpenPicked(paths.map((path4) => ({ folderUri: URI.file(path4) })), options, windowId);
        }
      }
      async pickFileAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickFile(options);
        if (paths) {
          await this.doOpenPicked(paths.map((path4) => ({ fileUri: URI.file(path4) })), options, windowId);
        }
      }
      async pickWorkspaceAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickWorkspace(options);
        if (paths) {
          await this.doOpenPicked(paths.map((path4) => ({ workspaceUri: URI.file(path4) })), options, windowId);
        }
      }
      async doOpenPicked(openable, options, windowId) {
        await this.windowsMainService.open({
          context: 3 /* DIALOG */,
          contextWindowId: windowId,
          cli: this.environmentMainService.args,
          urisToOpen: openable,
          forceNewWindow: options.forceNewWindow
          /* remoteAuthority will be determined based on openable */
        });
      }
      //#endregion
      //#region OS
      async showItemInFolder(windowId, path4) {
        shell.showItemInFolder(path4);
      }
      async setRepresentedFilename(windowId, path4, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.setRepresentedFilename(path4);
      }
      async setDocumentEdited(windowId, edited, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.setDocumentEdited(edited);
      }
      async setApplicationBadge(windowId, badge, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.setApplicationBadge(badge);
      }
      async openExternal(windowId, url, defaultApplication) {
        this.environmentMainService.unsetSnapExportedVariables();
        try {
          if (matchesSomeScheme(url, Schemas.http, Schemas.https)) {
            this.openExternalBrowser(windowId, url, defaultApplication);
          } else {
            this.doOpenShellExternal(windowId, url);
          }
        } finally {
          this.environmentMainService.restoreSnapExportedVariables();
        }
        return true;
      }
      async openExternalBrowser(windowId, url, defaultApplication) {
        const configuredBrowser = defaultApplication ?? this.configurationService.getValue("workbench.externalBrowser");
        if (!configuredBrowser) {
          return this.doOpenShellExternal(windowId, url);
        }
        if (configuredBrowser.includes(posix.sep) || configuredBrowser.includes(win32.sep)) {
          const browserPathExists = await Promises2.exists(configuredBrowser);
          if (!browserPathExists) {
            this.logService.error(`Configured external browser path does not exist: ${configuredBrowser}`);
            return this.doOpenShellExternal(windowId, url);
          }
        }
        try {
          const { default: open2, apps } = await import("open");
          const res = await open2(url, {
            app: {
              // Use `open.apps` helper to allow cross-platform browser
              // aliases to be looked up properly. Fallback to the
              // configured value if not found.
              name: Object.hasOwn(apps, configuredBrowser) ? apps[configuredBrowser] : configuredBrowser
            }
          });
          if (!isWindows2) {
            res.stderr?.once("data", (data) => {
              this.logService.error(`Error openening external URL '${url}' using browser '${configuredBrowser}': ${data.toString()}`);
              return this.doOpenShellExternal(windowId, url);
            });
          }
        } catch (error) {
          this.logService.error(`Unable to open external URL '${url}' using browser '${configuredBrowser}' due to ${error}.`);
          return this.doOpenShellExternal(windowId, url);
        }
      }
      async doOpenShellExternal(windowId, url) {
        try {
          await shell.openExternal(url);
        } catch (error) {
          let isLink;
          let message;
          if (matchesSomeScheme(url, Schemas.http, Schemas.https)) {
            isLink = true;
            message = localize(3168, null);
          } else {
            isLink = false;
            message = localize(3169, null);
          }
          const { response } = await this.dialogMainService.showMessageBox({
            type: "error",
            message,
            detail: error.message,
            buttons: isLink ? [
              localize(3166, null),
              localize(3163, null)
            ] : [
              localize(3167, null)
            ]
          }, this.windowById(windowId)?.win ?? void 0);
          if (response === 1) {
            return;
          }
          this.writeClipboardText(windowId, url);
        }
      }
      moveItemToTrash(windowId, fullPath) {
        return shell.trashItem(fullPath);
      }
      async getMediaAccessStatus(windowId, mediaType) {
        if (isMacintosh) {
          return systemPreferences.getMediaAccessStatus(mediaType);
        }
        return "granted";
      }
      async isAdmin() {
        let isAdmin;
        if (isWindows2) {
          isAdmin = (await import("native-is-elevated")).default();
        } else {
          isAdmin = process.getuid?.() === 0;
        }
        return isAdmin;
      }
      async writeElevated(windowId, source, target, options) {
        const sudoPrompt = await import("@vscode/sudo-prompt");
        const argsFile = randomPath(this.environmentMainService.userDataPath, "code-elevated");
        await Promises2.writeFile(argsFile, JSON.stringify({ source: source.fsPath, target: target.fsPath }));
        try {
          await new Promise((resolve3, reject) => {
            const sudoCommand = [`"${this.cliPath}"`];
            if (options?.unlock) {
              sudoCommand.push("--file-chmod");
            }
            sudoCommand.push("--file-write", `"${argsFile}"`);
            const promptOptions = {
              name: this.productService.nameLong.replace("-", ""),
              icns: isMacintosh && this.environmentMainService.isBuilt ? join4(dirname3(this.environmentMainService.appRoot), `${this.productService.nameShort}.icns`) : void 0
            };
            this.logService.trace(`[sudo-prompt] running command: ${sudoCommand.join(" ")}`);
            sudoPrompt.exec(sudoCommand.join(" "), promptOptions, (error, stdout, stderr) => {
              if (stdout) {
                this.logService.trace(`[sudo-prompt] received stdout: ${stdout}`);
              }
              if (stderr) {
                this.logService.error(`[sudo-prompt] received stderr: ${stderr}`);
              }
              if (error) {
                reject(error);
              } else {
                resolve3(void 0);
              }
            });
          });
        } finally {
          await fs9.promises.unlink(argsFile);
        }
      }
      async isRunningUnderARM64Translation() {
        if (isLinux || isWindows2) {
          return false;
        }
        return app5.runningUnderARM64Translation;
      }
      get cliPath() {
        if (isWindows2) {
          if (this.environmentMainService.isBuilt) {
            return join4(dirname3(process.execPath), "bin", `${this.productService.applicationName}.cmd`);
          }
          return join4(this.environmentMainService.appRoot, "scripts", "code-cli.bat");
        }
        if (isLinux) {
          if (this.environmentMainService.isBuilt) {
            return join4(dirname3(process.execPath), "bin", `${this.productService.applicationName}`);
          }
          return join4(this.environmentMainService.appRoot, "scripts", "code-cli.sh");
        }
        if (this.environmentMainService.isBuilt) {
          return join4(this.environmentMainService.appRoot, "bin", "code");
        }
        return join4(this.environmentMainService.appRoot, "scripts", "code-cli.sh");
      }
      async getOSStatistics() {
        return {
          totalmem: totalmem(),
          freemem: freemem(),
          loadavg: loadavg()
        };
      }
      async getOSProperties() {
        return {
          arch: arch2(),
          platform: platform3(),
          release: release3(),
          type: type(),
          cpus: cpus()
        };
      }
      async getOSVirtualMachineHint() {
        return virtualMachineHint.value();
      }
      async getOSColorScheme() {
        return this.themeMainService.getColorScheme();
      }
      // WSL
      async hasWSLFeatureInstalled() {
        return isWindows2 && hasWSLFeatureInstalled();
      }
      //#endregion
      //#region Screenshots
      async getScreenshot(windowId, rect, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        const captured = await window2?.win?.webContents.capturePage(rect);
        const buf = captured?.toJPEG(95);
        return buf && VSBuffer.wrap(buf);
      }
      //#endregion
      //#region GitHub mobile upload API
      async uploadFileViaMobileApi(_windowId, token, repoId, fileName, fileBytes, contentType) {
        const { net: net4 } = await import("electron");
        const policyResponse = await net4.fetch("https://api.github.com/mobile/upload/policy", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            name: fileName,
            size: fileBytes.byteLength,
            content_type: contentType,
            repository_id: parseInt(repoId, 10)
          })
        });
        if (!policyResponse.ok) {
          const text = await policyResponse.text();
          throw new Error(`Policy request failed ${policyResponse.status}: ${text.substring(0, 300)}`);
        }
        const policy = await policyResponse.json();
        const asset = policy.asset;
        const formFields = policy.form;
        const boundary = `----VSCodeUpload${Date.now()}`;
        let multipartBody = "";
        for (const [key, value] of Object.entries(formFields)) {
          multipartBody += `--${boundary}\r
Content-Disposition: form-data; name="${key}"\r
\r
${value}\r
`;
        }
        const safeName = String(asset.name).replace(/[\r\n]+/g, " ").replace(/[\\"]/g, "_");
        multipartBody += `--${boundary}\r
Content-Disposition: form-data; name="file"; filename="${safeName}"\r
Content-Type: ${contentType}\r
\r
`;
        const epilogue = `\r
--${boundary}--\r
`;
        const preambleBytes = Buffer.from(multipartBody, "utf-8");
        const epilogueBytes = Buffer.from(epilogue, "utf-8");
        const bodyBuffer = Buffer.concat([preambleBytes, fileBytes.buffer, epilogueBytes]);
        const s3Response = await net4.fetch(policy.upload_url, {
          method: "POST",
          headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
          body: bodyBuffer
        });
        if (s3Response.status !== 204 && s3Response.status !== 201) {
          const text = await s3Response.text();
          throw new Error(`S3 upload failed ${s3Response.status}: ${text.substring(0, 300)}`);
        }
        const confirmResponse = await net4.fetch(`https://api.github.com${policy.asset_upload_url}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (!confirmResponse.ok) {
          const text = await confirmResponse.text();
          throw new Error(`Asset upload confirmation failed ${confirmResponse.status}: ${text.substring(0, 300)}`);
        }
        return { fileName, assetUrl: asset.href, contentType };
      }
      //#endregion
      //#region Process
      async getProcessId(windowId) {
        const window2 = this.windowById(void 0, windowId);
        return window2?.win?.webContents.getOSProcessId();
      }
      async killProcess(windowId, pid, code2) {
        process.kill(pid, code2);
      }
      //#endregion
      //#region Clipboard
      // Electron 44 rearchitected the clipboard module (RFC 0019): the sync helpers
      // (readText(type), readImage, readBuffer, find-text, ...) are gone in favour of
      // the async W3C-style API, and the Linux selection clipboard moved to the
      // clipboard.selection namespace.
      clipboardForType(type3) {
        return type3 === "selection" ? clipboard.selection : clipboard;
      }
      async readClipboardText(windowId, type3) {
        this.logService.trace(`readClipboardText in window ${windowId} with type:`, type3);
        const clipboardText = await this.clipboardForType(type3).readText();
        this.logService.trace(`clipboardText.length :`, clipboardText.length);
        return clipboardText;
      }
      async triggerPaste(windowId, options) {
        this.logService.trace(`Triggering paste in window ${windowId} with options:`, options);
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return window2?.win?.webContents.paste() ?? Promise.resolve();
      }
      async readImage() {
        const items = await clipboard.read();
        for (const item of items) {
          const imageType = item.types.includes("image/png") ? "image/png" : item.types.find((type3) => type3.startsWith("image/"));
          if (!imageType) {
            continue;
          }
          try {
            const blob = await item.getType(imageType);
            const buffer = Buffer.from(await blob.arrayBuffer());
            return Uint8Array.from(nativeImage.createFromBuffer(buffer).toPNG());
          } catch {
            continue;
          }
        }
        return new Uint8Array(0);
      }
      async writeClipboardText(windowId, text, type3) {
        return this.clipboardForType(type3).writeText(text);
      }
      async readClipboardFindText(windowId) {
        const findFormat = "electron application/findtext";
        const items = await clipboard.read();
        for (const item of items) {
          if (item.types.includes(findFormat)) {
            const blob = await item.getType(findFormat);
            return blob.text();
          }
        }
        return "";
      }
      async writeClipboardFindText(windowId, text) {
        return clipboard.write([new ClipboardItem({ "electron application/findtext": text })]);
      }
      async writeClipboardBuffer(windowId, format4, buffer, type3) {
        const rawFormat = `electron application/osclipboard;format="${format4}"`;
        return this.clipboardForType(type3).write([new ClipboardItem({ [rawFormat]: new Blob([Buffer.from(buffer.buffer)]) })]);
      }
      async readClipboardBuffer(windowId, format4) {
        const rawFormat = `electron application/osclipboard;format="${format4}"`;
        const items = await clipboard.read();
        for (const item of items) {
          if (item.types.includes(rawFormat)) {
            const blob = await item.getType(rawFormat);
            return VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer()));
          }
        }
        return VSBuffer.wrap(new Uint8Array(0));
      }
      async hasClipboard(windowId, format4, type3) {
        return this.clipboardForType(type3).has(`electron application/osclipboard;format="${format4}"`);
      }
      //#endregion
      //#region macOS Touchbar
      async newWindowTab() {
        await this.windowsMainService.open({
          context: 5 /* API */,
          cli: this.environmentMainService.args,
          forceNewTabbedWindow: true,
          forceEmpty: true,
          remoteAuthority: this.environmentMainService.args.remote || void 0
        });
      }
      async showPreviousWindowTab() {
        Menu2.sendActionToFirstResponder("selectPreviousTab:");
      }
      async showNextWindowTab() {
        Menu2.sendActionToFirstResponder("selectNextTab:");
      }
      async moveWindowTabToNewWindow() {
        Menu2.sendActionToFirstResponder("moveTabToNewWindow:");
      }
      async mergeAllWindowTabs() {
        Menu2.sendActionToFirstResponder("mergeAllWindows:");
      }
      async toggleWindowTabsBar() {
        Menu2.sendActionToFirstResponder("toggleTabBar:");
      }
      async updateTouchBar(windowId, items) {
        const window2 = this.codeWindowById(windowId);
        window2?.updateTouchBar(items);
      }
      //#endregion
      //#region Lifecycle
      async notifyReady(windowId) {
        const window2 = this.codeWindowById(windowId);
        window2?.setReady();
      }
      async relaunch(windowId, options) {
        return this.lifecycleMainService.relaunch(options);
      }
      async reload(windowId, options) {
        const window2 = this.codeWindowById(windowId);
        if (window2) {
          if (isWorkspaceIdentifier(window2.openedWorkspace)) {
            const configPath = window2.openedWorkspace.configPath;
            if (configPath.scheme === Schemas.file) {
              const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(configPath);
              if (workspace?.transient) {
                return this.openWindow(window2.id, { forceReuseWindow: true });
              }
            }
          }
          return this.lifecycleMainService.reload(window2, options?.disableExtensions !== void 0 ? { _: [], "disable-extensions": options.disableExtensions } : void 0);
        }
      }
      async closeWindow(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        return window2?.win?.close();
      }
      async quit(windowId) {
        const window2 = this.windowsMainService.getLastActiveWindow();
        if (window2?.isExtensionDevelopmentHost && this.windowsMainService.getWindowCount() > 1 && window2.win) {
          window2.win.close();
        } else {
          this.lifecycleMainService.quit();
        }
      }
      async exit(windowId, code2) {
        await this.lifecycleMainService.kill(code2);
      }
      //#endregion
      //#region Connectivity
      async resolveProxy(windowId, url) {
        const window2 = this.codeWindowById(windowId);
        const session4 = window2?.win?.webContents?.session;
        return session4?.resolveProxy(url);
      }
      async resolveProxyWithPackage(_windowId, url) {
        const { resolveProxy } = await import("@vscode/os-proxy-resolver");
        return resolveProxy(url);
      }
      async readProxyConfigWithPackage(_windowId) {
        const { readProxyConfig } = await import("@vscode/os-proxy-resolver");
        return readProxyConfig();
      }
      async lookupAuthorization(_windowId, authInfo) {
        return this.proxyAuthService.lookupAuthorization(authInfo);
      }
      async lookupKerberosAuthorization(_windowId, url) {
        return this.requestService.lookupKerberosAuthorization(url);
      }
      async loadCertificates(_windowId) {
        return this.requestService.loadCertificates();
      }
      isPortFree(windowId, port) {
        return isPortFree(port, 1e3);
      }
      findFreePort(windowId, startPort, giveUpAfter, timeout2, stride = 1) {
        return findFreePort(startPort, giveUpAfter, timeout2, stride);
      }
      async openDevTools(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.webContents.openDevTools(options?.mode ? { mode: options.mode, activate: options.activate } : void 0);
      }
      async toggleDevTools(windowId, options) {
        const window2 = this.windowById(options?.targetWindowId, windowId);
        window2?.win?.webContents.toggleDevTools();
      }
      async openDevToolsWindow(windowId, url) {
        const parentWindow = this.codeWindowById(windowId);
        if (!parentWindow) {
          return;
        }
        this.openChildWindow(parentWindow.win, url);
      }
      openChildWindow(parentWindow, url, overrideWindowOptions = {}) {
        const options = this.instantiationService.invokeFunction(defaultBrowserWindowOptions, defaultWindowState(), { forceNativeTitlebar: true });
        const windowOptions = {
          ...options,
          parent: parentWindow ?? void 0,
          ...overrideWindowOptions
        };
        const window2 = new BrowserWindow3(windowOptions);
        window2.setMenuBarVisibility(false);
        window2.loadURL(url);
        window2.once("ready-to-show", () => window2.show());
        return window2;
      }
      async openGPUInfoWindow(windowId) {
        const parentWindow = this.codeWindowById(windowId);
        if (!parentWindow) {
          return;
        }
        if (typeof this.gpuInfoWindowId !== "number") {
          const gpuInfoWindow = this.openChildWindow(parentWindow.win, "chrome://gpu");
          gpuInfoWindow.once("close", () => this.gpuInfoWindowId = void 0);
          this.gpuInfoWindowId = gpuInfoWindow.id;
        }
        if (typeof this.gpuInfoWindowId === "number") {
          const window2 = BrowserWindow3.fromId(this.gpuInfoWindowId);
          if (window2?.isMinimized()) {
            window2?.restore();
          }
          window2?.focus();
        }
      }
      async openContentTracingWindow() {
        if (typeof this.contentTracingWindowId !== "number") {
          const contentTracingWindow = this.openChildWindow(null, "chrome://tracing", {
            paintWhenInitiallyHidden: false,
            webPreferences: {
              backgroundThrottling: false
            }
          });
          contentTracingWindow.webContents.once("did-finish-load", async () => {
            await contentTracingWindow.webContents.executeJavaScript(`
					window.prompt = () => '';
					null
				`);
            contentTracingWindow.show();
          });
          contentTracingWindow.once("close", () => this.contentTracingWindowId = void 0);
          this.contentTracingWindowId = contentTracingWindow.id;
        }
        if (typeof this.contentTracingWindowId === "number") {
          const window2 = BrowserWindow3.fromId(this.contentTracingWindowId);
          if (window2?.isMinimized()) {
            window2?.restore();
          }
          window2?.focus();
        }
      }
      async startTracing(windowId, categories, options) {
        if (this._isTracing) {
          throw new Error(localize(3174, null, "workbench.action.stopTracing"));
        }
        if (options?.enableHeapProfiling) {
          await contentTracing.enableHeapProfiling();
          await contentTracing.startRecording({
            recording_mode: "record-until-full",
            included_categories: categories.split(","),
            memory_dump_config: {
              triggers: [
                { mode: "detailed", type: "periodic_interval", periodic_interval_ms: 1e4 }
              ]
            }
          });
        } else {
          const traceOptions = ["record-until-full", "enable-sampling"];
          await contentTracing.startRecording({
            categoryFilter: categories,
            traceOptions: traceOptions.join(",")
          });
        }
        this._isTracing = true;
      }
      async stopTracing(windowId) {
        if (!this._isTracing && !this.environmentMainService.args.trace) {
          return;
        }
        this._isTracing = false;
        const path4 = await contentTracing.stopRecording(`${randomPath(this.environmentMainService.userHome.fsPath, this.productService.applicationName)}.trace.txt`);
        await this.dialogMainService.showMessageBox({
          type: "info",
          message: localize(3172, null),
          detail: localize(3171, null, path4),
          buttons: [localize(3173, null)]
        }, BrowserWindow3.getFocusedWindow() ?? void 0);
        this.showItemInFolder(void 0, path4);
      }
      //#endregion
      // #region Performance
      async profileRenderer(windowId, session4, duration) {
        const window2 = this.codeWindowById(windowId);
        if (!window2?.win) {
          throw new Error();
        }
        const profiler = new WindowProfiler(window2.win, session4, this.logService);
        const result = await profiler.inspect(duration);
        return result;
      }
      async showToast(windowId, options) {
        if (!Notification.isSupported()) {
          return { supported: false, clicked: false };
        }
        if (options.dedupeKey && this.activeToastDedupeKeys.has(options.dedupeKey)) {
          return { supported: true, suppressed: true, clicked: false };
        }
        const toast = new Notification({
          title: options.title,
          body: options.body,
          silent: options.silent,
          actions: options.actions?.map((action) => ({
            type: "button",
            text: action
          }))
        });
        const disposables = new DisposableStore();
        this.activeToasts.set(options.id, disposables);
        if (options.dedupeKey) {
          this.activeToastDedupeKeys.set(options.dedupeKey, options.id);
        }
        const cts = new CancellationTokenSource();
        disposables.add(toDisposable(() => {
          this.activeToasts.deleteAndDispose(options.id);
          if (options.dedupeKey && this.activeToastDedupeKeys.get(options.dedupeKey) === options.id) {
            this.activeToastDedupeKeys.delete(options.dedupeKey);
          }
          toast.removeAllListeners();
          toast.close();
          cts.dispose(true);
        }));
        return new Promise((r) => {
          const resolve3 = (result) => {
            r(result);
            disposables.dispose();
          };
          disposables.add(cts.token.onCancellationRequested(() => resolve3({ supported: true, clicked: false })));
          toast.on("click", () => resolve3({ supported: true, clicked: true }));
          toast.on("action", (_event, actionIndex) => resolve3({ supported: true, clicked: true, actionIndex }));
          toast.on("close", () => resolve3({ supported: true, clicked: false }));
          toast.on("failed", () => resolve3({ supported: false, clicked: false }));
          toast.show();
        });
      }
      async clearToast(windowId, toastId) {
        this.activeToasts.deleteAndDispose(toastId);
      }
      async clearToasts() {
        this.activeToasts.clearAndDisposeAll();
      }
      //#endregion
      //#region Registry (windows)
      async windowsGetStringRegKey(windowId, hive, path4, name) {
        if (!isWindows2) {
          return void 0;
        }
        const Registry2 = await import("@vscode/windows-registry");
        try {
          return Registry2.GetStringRegKey(hive, path4, name);
        } catch {
          return void 0;
        }
      }
      //#endregion
      //#region Zip
      async createZipFile(windowId, zipPath, files, options) {
        const zipFiles = [];
        const temporaryDirectories = [];
        const maxSize = options?.maxSize;
        try {
          for (const file of files) {
            if (hasKey(file, { contents: true })) {
              zipFiles.push(file);
              continue;
            }
            if (hasKey(file, { sourceArchive: true })) {
              const sourceArchive = URI.revive(file.sourceArchive);
              if (sourceArchive.scheme !== Schemas.file) {
                throw new Error(`Cannot merge non-local archive '${sourceArchive.toString()}'`);
              }
              const temporaryDirectory = join4(this.environmentMainService.tmpDir.fsPath, `vscode-zip-merge-${randomPath()}`);
              temporaryDirectories.push(temporaryDirectory);
              const archiveSize = (await fs9.promises.stat(sourceArchive.fsPath)).size;
              if (maxSize !== void 0 && archiveSize > maxSize) {
                throw new Error(`ZIP is too large to merge (${archiveSize} bytes; limit ${maxSize} bytes)`);
              }
              if (options) {
                await validateZip(sourceArchive.fsPath, {
                  maxEntries: options.maxEntries,
                  maxUncompressedSize: maxSize
                });
              }
              await extract(sourceArchive.fsPath, temporaryDirectory, {}, CancellationToken.None);
              zipFiles.push(...await collectZipFiles(temporaryDirectory));
              continue;
            }
            const source = URI.revive(file.source);
            if (source.scheme !== Schemas.file) {
              throw new Error(`Cannot add non-local resource '${source.toString()}' to a zip file`);
            }
            zipFiles.push({ path: file.path, localPath: source.fsPath, localPathSize: file.size, skipSourceErrors: file.skipSourceErrors });
          }
          const paths = /* @__PURE__ */ new Set();
          let uncompressedSize = 0;
          const availableZipFiles = [];
          for (const file of zipFiles) {
            let fileSize = 0;
            if (file.contents !== void 0) {
              fileSize = typeof file.contents === "string" ? Buffer.byteLength(file.contents) : file.contents.byteLength;
            } else if (file.localPath) {
              try {
                const size = (await fs9.promises.stat(file.localPath)).size;
                fileSize = file.localPathSize === void 0 ? size : Math.min(size, file.localPathSize);
              } catch (error) {
                if (file.skipSourceErrors) {
                  this.logService.warn(`[NativeHostMainService] Skipping ZIP entry '${file.path}' because its source could not be read: ${error instanceof Error ? error.message : String(error)}`);
                  continue;
                }
                throw error;
              }
            }
            if (paths.has(file.path)) {
              throw new Error(`Duplicate ZIP entry '${file.path}'`);
            }
            paths.add(file.path);
            availableZipFiles.push(file);
            uncompressedSize += fileSize;
            if (maxSize !== void 0 && uncompressedSize > maxSize) {
              throw new Error(`ZIP expands beyond the allowed size (${uncompressedSize} bytes; limit ${maxSize} bytes)`);
            }
          }
          if (options && availableZipFiles.length > options.maxEntries) {
            throw new Error(`ZIP contains too many entries (${availableZipFiles.length}; limit ${options.maxEntries})`);
          }
          await zip(zipPath.fsPath, availableZipFiles);
          if (maxSize !== void 0) {
            const zipSize = (await fs9.promises.stat(zipPath.fsPath)).size;
            if (zipSize > maxSize) {
              await fs9.promises.rm(zipPath.fsPath, { force: true });
              throw new Error(`ZIP is too large (${zipSize} bytes; limit ${maxSize} bytes)`);
            }
          }
        } finally {
          await Promise.all(temporaryDirectories.map((directory) => Promises2.rm(directory)));
        }
      }
      //#endregion
      //#region Power
      async getSystemIdleState(windowId, idleThreshold) {
        return powerMonitor.getSystemIdleState(idleThreshold);
      }
      async getSystemIdleTime(windowId) {
        return powerMonitor.getSystemIdleTime();
      }
      async getCurrentThermalState(windowId) {
        return powerMonitor.getCurrentThermalState();
      }
      async isOnBatteryPower(windowId) {
        return powerMonitor.isOnBatteryPower();
      }
      async startPowerSaveBlocker(windowId, type3) {
        return powerSaveBlocker.start(type3);
      }
      async stopPowerSaveBlocker(windowId, id2) {
        return powerSaveBlocker.stop(id2);
      }
      async isPowerSaveBlockerStarted(windowId, id2) {
        return powerSaveBlocker.isStarted(id2);
      }
      //#endregion
      windowById(windowId, fallbackCodeWindowId) {
        return this.codeWindowById(windowId) ?? this.auxiliaryWindowById(windowId) ?? this.codeWindowById(fallbackCodeWindowId);
      }
      codeWindowById(windowId) {
        if (typeof windowId !== "number") {
          return void 0;
        }
        return this.windowsMainService.getWindowById(windowId);
      }
      auxiliaryWindowById(windowId) {
        if (typeof windowId !== "number") {
          return void 0;
        }
        const contents = webContents2.fromId(windowId);
        if (!contents) {
          return void 0;
        }
        return this.auxiliaryWindowsMainService.getWindowByWebContents(contents);
      }
    };
    __decorateClass([
      memoize
    ], NativeHostMainService.prototype, "cliPath", 1);
    NativeHostMainService = __decorateClass([
      __decorateParam(0, IWindowsMainService),
      __decorateParam(1, IAuxiliaryWindowsMainService),
      __decorateParam(2, IDialogMainService),
      __decorateParam(3, ILifecycleMainService),
      __decorateParam(4, IEnvironmentMainService),
      __decorateParam(5, ILogService),
      __decorateParam(6, IProductService),
      __decorateParam(7, IThemeMainService),
      __decorateParam(8, IWorkspacesManagementMainService),
      __decorateParam(9, IConfigurationService),
      __decorateParam(10, IRequestService),
      __decorateParam(11, IProxyAuthService),
      __decorateParam(12, IInstantiationService),
      __decorateParam(13, IGlobalKeybindingsMainService)
    ], NativeHostMainService);
  }
});
export { collectZipFiles, fs9, exec, app5, BrowserWindow3, clipboard, ClipboardItem, contentTracing, Menu2, nativeImage, Notification, powerMonitor, powerSaveBlocker, screen2, shell, systemPreferences, webContents2, arch2, cpus, freemem, loadavg, platform3, release3, totalmem, type, promisify2, INativeHostMainService, NativeHostMainService, init_nativeHostMainService };
