// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/host/electron-browser/nativeHostService.ts
import { NativeHostService } from "./module-3807.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { Disposable, DisposableSet } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { disposableWindowInterval, getActiveDocument, getWindowId, getWindowsCount, hasWindow, onDidRegisterWindow } from "./module-0075.mjs";
import { isFolderToOpen, isWorkspaceToOpen } from "./module-0515.mjs";
import { isAuxiliaryWindow } from "./module-0002.mjs";
import { generateUuid } from "./module-0190.mjs";
import { showBrowserToast } from "./module-3808.mjs";
import { memoize } from "./module-0250.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/services/host/electron-browser/nativeHostService.ts
var WorkbenchNativeHostService = class extends NativeHostService {
  constructor(environmentService, mainProcessService) {
    super(environmentService.window.id, mainProcessService);
  }
};

WorkbenchNativeHostService = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IMainProcessService)
], WorkbenchNativeHostService);

var WorkbenchHostService = class extends Disposable {
  constructor(nativeHostService, labelService, environmentService) {
    super();
    this.nativeHostService = nativeHostService;
    this.labelService = labelService;
    this.environmentService = environmentService;
    //#endregion
    //#region Native Handle
    this._nativeWindowHandleCache = /* @__PURE__ */ new Map();
    //#endregion
    //#region Toast Notifications
    this.activeBrowserToasts = this._register(new DisposableSet());
    this.onDidChangeFocus = Event2.latch(
      Event2.any(
        Event2.map(Event2.filter(this.nativeHostService.onDidFocusMainOrAuxiliaryWindow, (id2) => hasWindow(id2), this._store), () => this.hasFocus, this._store),
        Event2.map(Event2.filter(this.nativeHostService.onDidBlurMainOrAuxiliaryWindow, (id2) => hasWindow(id2), this._store), () => this.hasFocus, this._store),
        Event2.map(this.onDidChangeActiveWindow, () => this.hasFocus, this._store)
      ),
      void 0,
      this._store
    );
    this.onDidChangeFullScreen = Event2.filter(this.nativeHostService.onDidChangeWindowFullScreen, (e) => hasWindow(e.windowId), this._store);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.onDidChangeFocus((focus) => {
      if (focus) {
        this.clearToasts();
      }
    }));
  }
  get hasFocus() {
    return getActiveDocument().hasFocus();
  }
  async hadLastFocus() {
    const activeWindowId = await this.nativeHostService.getActiveWindowId();
    if (typeof activeWindowId === "undefined") {
      return false;
    }
    return activeWindowId === this.nativeHostService.windowId;
  }
  get onDidChangeActiveWindow() {
    const emitter = this._register(new Emitter());
    this._register(Event2.filter(this.nativeHostService.onDidFocusMainOrAuxiliaryWindow, (id2) => hasWindow(id2), this._store)((id2) => emitter.fire(id2)));
    this._register(onDidRegisterWindow(({ window: window2, disposables }) => {
      disposables.add(disposableWindowInterval(window2, () => {
        const hasFocus = window2.document.hasFocus();
        if (hasFocus) {
          emitter.fire(window2.vscodeWindowId);
        }
        return hasFocus;
      }, 100, 20));
    }));
    return Event2.latch(emitter.event, void 0, this._store);
  }
  openWindow(arg1, arg2) {
    if (Array.isArray(arg1)) {
      return this.doOpenWindow(arg1, arg2);
    }
    return this.doOpenEmptyWindow(arg1);
  }
  doOpenWindow(toOpen, options3) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      toOpen.forEach((openable) => openable.label = openable.label || this.getRecentLabel(openable));
      if (options3?.remoteAuthority === void 0) {
        options3 = options3 ? { ...options3, remoteAuthority } : { remoteAuthority };
      }
    }
    return this.nativeHostService.openWindow(toOpen, options3);
  }
  getRecentLabel(openable) {
    if (isFolderToOpen(openable)) {
      return this.labelService.getWorkspaceLabel(openable.folderUri, { verbose: 2 /* LONG */ });
    }
    if (isWorkspaceToOpen(openable)) {
      return this.labelService.getWorkspaceLabel({ id: "", configPath: openable.workspaceUri }, { verbose: 2 /* LONG */ });
    }
    return this.labelService.getUriLabel(openable.fileUri, { appendWorkspaceSuffix: true });
  }
  doOpenEmptyWindow(options3) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (!!remoteAuthority && options3?.remoteAuthority === void 0) {
      options3 = options3 ? { ...options3, remoteAuthority } : { remoteAuthority };
    }
    return this.nativeHostService.openWindow(options3);
  }
  toggleFullScreen(targetWindow) {
    return this.nativeHostService.toggleFullScreen({ targetWindowId: isAuxiliaryWindow(targetWindow) ? targetWindow.vscodeWindowId : void 0 });
  }
  async moveTop(targetWindow) {
    if (getWindowsCount() <= 1) {
      return;
    }
    return this.nativeHostService.moveWindowTop(isAuxiliaryWindow(targetWindow) ? { targetWindowId: targetWindow.vscodeWindowId } : void 0);
  }
  async setWindowDimmed(targetWindow, dimmed) {
    return this.nativeHostService.updateWindowControls({ dimmed, targetWindowId: getWindowId(targetWindow) });
  }
  getCursorScreenPoint() {
    return this.nativeHostService.getCursorScreenPoint();
  }
  getWindows(options3) {
    if (options3.includeAuxiliaryWindows === false) {
      return this.nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    }
    return this.nativeHostService.getWindows({ includeAuxiliaryWindows: true });
  }
  //#endregion
  //#region Lifecycle
  focus(targetWindow, options3) {
    return this.nativeHostService.focusWindow({
      mode: options3?.mode,
      targetWindowId: getWindowId(targetWindow)
    });
  }
  restart() {
    return this.nativeHostService.relaunch();
  }
  reload(options3) {
    return this.nativeHostService.reload(options3);
  }
  close() {
    return this.nativeHostService.closeWindow();
  }
  shutdown() {
    return this.nativeHostService.quit();
  }
  async withExpectedShutdown(expectedShutdownTask) {
    return await expectedShutdownTask();
  }
  //#endregion
  //#region Screenshots
  getScreenshot(rect) {
    return this.nativeHostService.getScreenshot(rect);
  }
  async getNativeWindowHandle(windowId) {
    if (!this._nativeWindowHandleCache.has(windowId)) {
      this._nativeWindowHandleCache.set(windowId, this.nativeHostService.getNativeWindowHandle(windowId));
    }
    return this._nativeWindowHandleCache.get(windowId);
  }
  async showToast(options3, token) {
    const id2 = generateUuid();
    const listener = token.onCancellationRequested(() => this.nativeHostService.clearToast(id2));
    try {
      const nativeToast = await this.nativeHostService.showToast({ ...options3, id: id2 });
      if (nativeToast.supported) {
        return nativeToast;
      }
      return await showBrowserToast({
        onDidCreateToast: (toast) => this.activeBrowserToasts.add(toast),
        onDidDisposeToast: (toast) => this.activeBrowserToasts.deleteAndDispose(toast)
      }, options3, token);
    } finally {
      listener.dispose();
    }
  }
  async clearToasts() {
    await this.nativeHostService.clearToasts();
    this.activeBrowserToasts.clearAndDisposeAll();
  }
  //#endregion
};

__decorateClass([
  memoize
], WorkbenchHostService.prototype, "onDidChangeActiveWindow", 1);

WorkbenchHostService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], WorkbenchHostService);

registerSingleton(IHostService, WorkbenchHostService, 1 /* Delayed */);

registerSingleton(INativeHostService, WorkbenchNativeHostService, 1 /* Delayed */);
export { WorkbenchNativeHostService, WorkbenchHostService };
