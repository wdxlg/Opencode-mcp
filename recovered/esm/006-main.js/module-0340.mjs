// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/auxiliaryWindow/electron-main/auxiliaryWindowsMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableStore, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { FileAccess, init_network } from "./module-0031.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { AuxiliaryWindow, init_auxiliaryWindow } from "./module-0339.mjs";
import { IInstantiationService, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { defaultAuxWindowState, init_window2 } from "./module-0097.mjs";
import { WindowStateValidator, defaultBrowserWindowOptions, getLastFocused, init_windows } from "./module-0101.mjs";


// src/vs/platform/auxiliaryWindow/electron-main/auxiliaryWindowsMainService.ts
import { BrowserWindow as BrowserWindow7, app as app12 } from "electron";

var AuxiliaryWindowsMainService;

var init_auxiliaryWindowsMainService = __esm({
  "src/vs/platform/auxiliaryWindow/electron-main/auxiliaryWindowsMainService.ts"() {
    init_event();
    init_lifecycle();
    init_network();
    init_ipcMain();
    init_auxiliaryWindow();
    init_instantiation();
    init_log();
    init_window2();
    init_windows();
    AuxiliaryWindowsMainService = class extends Disposable {
      constructor(instantiationService, logService) {
        super();
        this.instantiationService = instantiationService;
        this.logService = logService;
        this._onDidMaximizeWindow = this._register(new Emitter());
        this.onDidMaximizeWindow = this._onDidMaximizeWindow.event;
        this._onDidUnmaximizeWindow = this._register(new Emitter());
        this.onDidUnmaximizeWindow = this._onDidUnmaximizeWindow.event;
        this._onDidChangeFullScreen = this._register(new Emitter());
        this.onDidChangeFullScreen = this._onDidChangeFullScreen.event;
        this._onDidChangeAlwaysOnTop = this._register(new Emitter());
        this.onDidChangeAlwaysOnTop = this._onDidChangeAlwaysOnTop.event;
        this._onDidTriggerSystemContextMenu = this._register(new Emitter());
        this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
        this.windows = /* @__PURE__ */ new Map();
        this.pendingWindowOptionsQueue = [];
        this.registerListeners();
      }
      registerListeners() {
        app12.on("browser-window-created", (_event, browserWindow) => {
          const auxiliaryWindow = this.getWindowByWebContents(browserWindow.webContents);
          if (auxiliaryWindow) {
            this.logService.trace('[aux window] app.on("browser-window-created"): Trying to claim auxiliary window');
            auxiliaryWindow.tryClaimWindow();
          } else {
            const disposables = new DisposableStore();
            disposables.add(Event.fromNodeEventEmitter(browserWindow.webContents, "did-create-window", (browserWindow2, details) => ({ browserWindow: browserWindow2, details }))(({ browserWindow: browserWindow2, details }) => {
              const auxiliaryWindow2 = this.getWindowByWebContents(browserWindow2.webContents);
              if (auxiliaryWindow2) {
                this.logService.trace('[aux window] window.on("did-create-window"): Trying to claim auxiliary window');
                auxiliaryWindow2.tryClaimWindow(details.options);
              }
            }));
            disposables.add(Event.fromNodeEventEmitter(browserWindow, "closed")(() => disposables.dispose()));
          }
        });
        validatedIpcMain.handle("vscode:registerAuxiliaryWindow", async (event, mainWindowId) => {
          const auxiliaryWindow = this.getWindowByWebContents(event.sender);
          if (auxiliaryWindow) {
            this.logService.trace("[aux window] vscode:registerAuxiliaryWindow: Registering auxiliary window to main window");
            auxiliaryWindow.parentId = mainWindowId;
          }
          return event.sender.id;
        });
      }
      createWindow(details) {
        const { state, overrides, disableMaximize } = this.computeWindowStateAndOverrides(details);
        const options = this.instantiationService.invokeFunction(defaultBrowserWindowOptions, state, overrides, {
          preload: FileAccess.asFileUri("vs/base/parts/sandbox/electron-browser/preload-aux.js").fsPath
        });
        this.pendingWindowOptionsQueue.push({ options, disableMaximize });
        return options;
      }
      computeWindowStateAndOverrides(details) {
        const windowState = {};
        const overrides = {};
        let disableMaximize = false;
        const features = details.features.split(",");
        for (const feature of features) {
          const [key, value] = feature.split("=");
          switch (key) {
            case "width":
              windowState.width = parseInt(value, 10);
              break;
            case "height":
              windowState.height = parseInt(value, 10);
              break;
            case "left":
              windowState.x = parseInt(value, 10);
              break;
            case "top":
              windowState.y = parseInt(value, 10);
              break;
            case "window-maximized":
              windowState.mode = 0 /* Maximized */;
              break;
            case "window-fullscreen":
              windowState.mode = 3 /* Fullscreen */;
              break;
            case "window-disable-fullscreen":
              overrides.disableFullscreen = true;
              break;
            case "window-native-titlebar":
              overrides.forceNativeTitlebar = true;
              break;
            case "window-always-on-top":
              overrides.alwaysOnTop = true;
              break;
            case "window-frameless":
              overrides.frameless = true;
              break;
            case "window-transparent":
              overrides.transparent = true;
              break;
            case "window-not-resizable":
              overrides.notResizable = true;
              break;
            case "window-disable-maximize":
              disableMaximize = true;
              break;
            case "window-background-color":
              if (typeof value === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
                overrides.backgroundColor = value;
              }
              break;
          }
        }
        const state = WindowStateValidator.validateWindowState(this.logService, windowState) ?? defaultAuxWindowState();
        this.logService.trace("[aux window] using window state", state);
        return { state, overrides, disableMaximize };
      }
      registerWindow(webContents4) {
        const disposables = new DisposableStore();
        const pendingWindowOptions = this.pendingWindowOptionsQueue.shift();
        const auxiliaryWindow = this.instantiationService.createInstance(AuxiliaryWindow, webContents4, pendingWindowOptions?.options, pendingWindowOptions?.disableMaximize ?? false);
        this.windows.set(auxiliaryWindow.id, auxiliaryWindow);
        disposables.add(toDisposable(() => this.windows.delete(auxiliaryWindow.id)));
        disposables.add(auxiliaryWindow.onDidMaximize(() => this._onDidMaximizeWindow.fire(auxiliaryWindow)));
        disposables.add(auxiliaryWindow.onDidUnmaximize(() => this._onDidUnmaximizeWindow.fire(auxiliaryWindow)));
        disposables.add(auxiliaryWindow.onDidEnterFullScreen(() => this._onDidChangeFullScreen.fire({ window: auxiliaryWindow, fullscreen: true })));
        disposables.add(auxiliaryWindow.onDidLeaveFullScreen(() => this._onDidChangeFullScreen.fire({ window: auxiliaryWindow, fullscreen: false })));
        disposables.add(auxiliaryWindow.onDidChangeAlwaysOnTop((alwaysOnTop) => this._onDidChangeAlwaysOnTop.fire({ window: auxiliaryWindow, alwaysOnTop })));
        disposables.add(auxiliaryWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: auxiliaryWindow, x, y })));
        Event.once(auxiliaryWindow.onDidClose)(() => disposables.dispose());
      }
      getWindowByWebContents(webContents4) {
        const window2 = this.windows.get(webContents4.id);
        return window2?.matches(webContents4) ? window2 : void 0;
      }
      getFocusedWindow() {
        const window2 = BrowserWindow7.getFocusedWindow();
        if (window2) {
          return this.getWindowByWebContents(window2.webContents);
        }
        return void 0;
      }
      getLastActiveWindow() {
        return getLastFocused(Array.from(this.windows.values()));
      }
      getWindows() {
        return Array.from(this.windows.values());
      }
    };
    AuxiliaryWindowsMainService = __decorateClass([
      __decorateParam(0, IInstantiationService),
      __decorateParam(1, ILogService)
    ], AuxiliaryWindowsMainService);
  }
});
export { BrowserWindow7, app12, AuxiliaryWindowsMainService, init_auxiliaryWindowsMainService };
