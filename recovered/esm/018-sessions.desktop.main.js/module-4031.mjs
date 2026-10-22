// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/auxiliaryWindow/electron-browser/auxiliaryWindowService.ts
import { AuxiliaryWindow, BrowserAuxiliaryWindowService, IAuxiliaryWindowService } from "./module-2972.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { getZoomLevel, isFullscreen, setFullscreen } from "./module-0018.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHostService } from "./module-1118.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { mark } from "./module-0506.mjs";
import { assert } from "./module-0009.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { applyZoom } from "./module-3822.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/auxiliaryWindow/electron-browser/auxiliaryWindowService.ts
var NativeAuxiliaryWindow = class extends AuxiliaryWindow {
  constructor(window2, container2, stylesHaveLoaded, configurationService, nativeHostService, instantiationService, hostService, environmentService, dialogService, contextMenuService, layoutService) {
    super(window2, container2, stylesHaveLoaded, configurationService, hostService, environmentService, contextMenuService, layoutService);
    this.nativeHostService = nativeHostService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.skipUnloadConfirmation = false;
    this.maximized = false;
    this.alwaysOnTop = false;
    if (!isMacintosh) {
      this.handleMaximizedState();
    }
    this.handleFullScreenState();
    this.handleAlwaysOnTopState();
  }
  handleMaximizedState() {
    (async () => {
      this.maximized = await this.nativeHostService.isMaximized({ targetWindowId: this.window.vscodeWindowId });
    })();
    this._register(this.nativeHostService.onDidMaximizeWindow((windowId) => {
      if (windowId === this.window.vscodeWindowId) {
        this.maximized = true;
      }
    }));
    this._register(this.nativeHostService.onDidUnmaximizeWindow((windowId) => {
      if (windowId === this.window.vscodeWindowId) {
        this.maximized = false;
      }
    }));
  }
  handleAlwaysOnTopState() {
    (async () => {
      this.alwaysOnTop = await this.nativeHostService.isWindowAlwaysOnTop({ targetWindowId: this.window.vscodeWindowId });
    })();
    this._register(this.nativeHostService.onDidChangeWindowAlwaysOnTop(({ windowId, alwaysOnTop }) => {
      if (windowId === this.window.vscodeWindowId) {
        this.alwaysOnTop = alwaysOnTop;
      }
    }));
  }
  async handleFullScreenState() {
    const fullscreen = await this.nativeHostService.isFullScreen({ targetWindowId: this.window.vscodeWindowId });
    if (fullscreen) {
      setFullscreen(true, this.window);
    }
  }
  setBounds(bounds) {
    return this.nativeHostService.positionWindow(bounds, { targetWindowId: this.window.vscodeWindowId });
  }
  async handleVetoBeforeClose(e4, veto) {
    this.preventUnload(e4);
    await this.dialogService.error(veto, localize(22753, null));
  }
  async confirmBeforeClose(e4) {
    if (this.skipUnloadConfirmation) {
      return;
    }
    this.preventUnload(e4);
    const confirmed = await this.instantiationService.invokeFunction((accessor) => NativeAuxiliaryWindow.confirmOnShutdown(accessor, 1 /* CLOSE */));
    if (confirmed) {
      this.skipUnloadConfirmation = true;
      this.nativeHostService.closeWindow({ targetWindowId: this.window.vscodeWindowId });
    }
  }
  preventUnload(e4) {
    e4.preventDefault();
    e4.returnValue = true;
  }
  createState() {
    const state = super.createState();
    const fullscreen = isFullscreen(this.window);
    return {
      ...state,
      bounds: state.bounds,
      mode: this.maximized ? 0 /* Maximized */ : fullscreen ? 2 /* Fullscreen */ : 1 /* Normal */,
      alwaysOnTop: this.alwaysOnTop
    };
  }
};

NativeAuxiliaryWindow = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IWorkbenchLayoutService)
], NativeAuxiliaryWindow);

var NativeAuxiliaryWindowService = class extends BrowserAuxiliaryWindowService {
  constructor(layoutService, configurationService, nativeHostService, dialogService, instantiationService, telemetryService, hostService, environmentService, contextMenuService) {
    super(layoutService, dialogService, configurationService, telemetryService, hostService, environmentService, contextMenuService);
    this.nativeHostService = nativeHostService;
    this.instantiationService = instantiationService;
  }
  async resolveWindowId(auxiliaryWindow) {
    mark("code/auxiliaryWindow/willResolveWindowId");
    const windowId = await auxiliaryWindow.vscode.ipcRenderer.invoke("vscode:registerAuxiliaryWindow", this.nativeHostService.windowId);
    mark("code/auxiliaryWindow/didResolveWindowId");
    assert(typeof windowId === "number");
    return windowId;
  }
  createContainer(auxiliaryWindow, disposables, options3) {
    let windowZoomLevel;
    if (typeof options3?.zoomLevel === "number") {
      windowZoomLevel = options3.zoomLevel;
    } else {
      windowZoomLevel = getZoomLevel(getActiveWindow());
    }
    applyZoom(windowZoomLevel, auxiliaryWindow);
    return super.createContainer(auxiliaryWindow, disposables);
  }
  createAuxiliaryWindow(targetWindow, container2, stylesHaveLoaded) {
    return new NativeAuxiliaryWindow(targetWindow, container2, stylesHaveLoaded, this.configurationService, this.nativeHostService, this.instantiationService, this.hostService, this.environmentService, this.dialogService, this.contextMenuService, this.layoutService);
  }
};

NativeAuxiliaryWindowService = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, IContextMenuService)
], NativeAuxiliaryWindowService);

registerSingleton(IAuxiliaryWindowService, NativeAuxiliaryWindowService, 1 /* Delayed */);
export { NativeAuxiliaryWindow, NativeAuxiliaryWindowService };
