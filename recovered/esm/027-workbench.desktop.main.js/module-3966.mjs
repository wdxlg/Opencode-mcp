// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/debugExtensionHostAction.ts
import { localize, localize2 } from "./module-0001.mjs";
import { randomPort } from "./module-3961.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { Codicon } from "./module-0085.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { RuntimeExtensionsEditor } from "./module-3965.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IProductService } from "./module-0873.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHostService } from "./module-1117.mjs";
import { IExtensionHostDebugService } from "./module-2402.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Disposable } from "./module-0012.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/debugExtensionHostAction.ts
async function getExtensionHostPort(extensionService, nativeHostService, dialogService, productService) {
  const inspectPorts = await extensionService.getInspectPorts(1 /* LocalProcess */, false);
  if (inspectPorts.length === 0) {
    const res = await dialogService.confirm({
      message: localize(15623, null),
      detail: localize(15624, null, productService.nameLong),
      primaryButton: localize(15625, null)
    });
    if (res.confirmed) {
      await nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${randomPort()}`] });
    }
    return void 0;
  }
  if (inspectPorts.length > 1) {
    console.warn(`There are multiple extension hosts available for debugging. Picking the first one...`);
  }
  return inspectPorts[0].port;
}

async function getRendererDebugPort(extensionHostDebugService, windowId) {
  const result = await extensionHostDebugService.attachToCurrentWindowRenderer(windowId);
  return result.success ? result.port : void 0;
}

var DebugExtensionHostInDevToolsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.extensions.action.devtoolsExtensionHost",
      title: localize2(15622, "Debug Extension Host In Dev Tools"),
      category: Categories.Developer,
      f1: true,
      icon: Codicon.debugStart
    });
  }
  async run(accessor) {
    const extensionService = accessor.get(IExtensionService);
    const nativeHostService = accessor.get(INativeHostService);
    const quickInputService = accessor.get(IQuickInputService);
    const inspectPorts = await extensionService.getInspectPorts(1 /* LocalProcess */, true);
    if (inspectPorts.length === 0) {
      console.log("[devtoolsExtensionHost] No extension host inspect ports found.");
      return;
    }
    const items = inspectPorts.filter((portInfo) => portInfo.devtoolsUrl).map((portInfo) => ({
      label: portInfo.devtoolsLabel ?? `${portInfo.host}:${portInfo.port}`,
      detail: `${portInfo.host}:${portInfo.port}`,
      portInfo
    }));
    if (items.length === 1) {
      const portInfo = items[0].portInfo;
      nativeHostService.openDevToolsWindow(portInfo.devtoolsUrl);
      return;
    }
    const selected = await quickInputService.pick(items, {
      placeHolder: localize(15626, null),
      matchOnDetail: true
    });
    if (selected) {
      const portInfo = selected.portInfo;
      nativeHostService.openDevToolsWindow(portInfo.devtoolsUrl);
    }
  }
};

var DebugExtensionHostInNewWindowAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.extensions.action.debugExtensionHost",
      title: localize2(15615, "Debug Extension Host In New Window"),
      category: Categories.Developer,
      f1: true,
      icon: Codicon.debugStart,
      menu: {
        id: MenuId.EditorTitle,
        when: ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID),
        group: "navigation"
      }
    });
  }
  async run(accessor) {
    const extensionService = accessor.get(IExtensionService);
    const nativeHostService = accessor.get(INativeHostService);
    const dialogService = accessor.get(IDialogService);
    const productService = accessor.get(IProductService);
    const instantiationService = accessor.get(IInstantiationService);
    const hostService = accessor.get(IHostService);
    const port = await getExtensionHostPort(extensionService, nativeHostService, dialogService, productService);
    if (port === void 0) {
      return;
    }
    const storage = instantiationService.createInstance(Storage2);
    storage.storeDebugOnNewWindow(port);
    hostService.openWindow();
  }
};

var DebugRendererInNewWindowAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.debugRenderer",
      title: localize2(15619, "Debug Renderer In New Window"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const extensionHostDebugService = accessor.get(IExtensionHostDebugService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    const instantiationService = accessor.get(IInstantiationService);
    const hostService = accessor.get(IHostService);
    const port = await getRendererDebugPort(extensionHostDebugService, environmentService.window.id);
    if (port === void 0) {
      return;
    }
    const storage = instantiationService.createInstance(Storage2);
    storage.storeRendererDebugOnNewWindow(port);
    hostService.openWindow({ remoteAuthority: null });
  }
};

var DebugExtensionHostAndRendererAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.debugExtensionHostAndRenderer",
      title: localize2(15618, "Debug Extension Host and Renderer In New Window"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const extensionService = accessor.get(IExtensionService);
    const nativeHostService = accessor.get(INativeHostService);
    const dialogService = accessor.get(IDialogService);
    const productService = accessor.get(IProductService);
    const extensionHostDebugService = accessor.get(IExtensionHostDebugService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    const instantiationService = accessor.get(IInstantiationService);
    const hostService = accessor.get(IHostService);
    const [extHostPort, rendererPort] = await Promise.all([
      getExtensionHostPort(extensionService, nativeHostService, dialogService, productService),
      getRendererDebugPort(extensionHostDebugService, environmentService.window.id)
    ]);
    if (extHostPort === void 0 || rendererPort === void 0) {
      return;
    }
    const storage = instantiationService.createInstance(Storage2);
    storage.storeDebugOnNewWindow(extHostPort);
    storage.storeRendererDebugOnNewWindow(rendererPort);
    hostService.openWindow({ remoteAuthority: null });
  }
};

var Storage2 = class {
  constructor(_storageService) {
    this._storageService = _storageService;
  }
  storeDebugOnNewWindow(targetPort) {
    this._storageService.store("debugExtensionHost.debugPort", targetPort, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  getAndDeleteDebugPortIfSet() {
    const port = this._storageService.getNumber("debugExtensionHost.debugPort", -1 /* APPLICATION */);
    if (port !== void 0) {
      this._storageService.remove("debugExtensionHost.debugPort", -1 /* APPLICATION */);
    }
    return port;
  }
  storeRendererDebugOnNewWindow(targetPort) {
    this._storageService.store("debugRenderer.debugPort", targetPort, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  getAndDeleteRendererDebugPortIfSet() {
    const port = this._storageService.getNumber("debugRenderer.debugPort", -1 /* APPLICATION */);
    if (port !== void 0) {
      this._storageService.remove("debugRenderer.debugPort", -1 /* APPLICATION */);
    }
    return port;
  }
};

Storage2 = __decorateClass([
  __decorateParam(0, IStorageService)
], Storage2);

var defaultDebugConfig = {
  trace: true,
  resolveSourceMapLocations: null,
  eagerSources: true,
  timeouts: {
    sourceMapMinPause: 3e4,
    sourceMapCumulativePause: 3e5
  }
};

var DebugExtensionsContribution = class extends Disposable {
  constructor(_debugService, _instantiationService, _progressService) {
    super();
    this._debugService = _debugService;
    this._instantiationService = _instantiationService;
    const storage = this._instantiationService.createInstance(Storage2);
    const extHostPort = storage.getAndDeleteDebugPortIfSet();
    const rendererPort = storage.getAndDeleteRendererDebugPortIfSet();
    const debugPromises = [];
    if (extHostPort !== void 0) {
      debugPromises.push(_progressService.withProgress({
        location: 15 /* Notification */,
        title: localize(15617, null)
      }, async () => {
        await this._debugService.startDebugging(void 0, {
          type: "node",
          name: localize(15616, null),
          request: "attach",
          port: extHostPort,
          ...defaultDebugConfig
        });
      }));
    }
    if (rendererPort !== void 0) {
      debugPromises.push(_progressService.withProgress({
        location: 15 /* Notification */,
        title: localize(15621, null)
      }, async () => {
        await this._debugService.startDebugging(void 0, {
          type: "chrome",
          name: localize(15620, null),
          request: "attach",
          port: rendererPort,
          ...defaultDebugConfig
        });
      }));
    }
    Promise.all(debugPromises);
  }
};

DebugExtensionsContribution = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IProgressService)
], DebugExtensionsContribution);
export { getExtensionHostPort, getRendererDebugPort, DebugExtensionHostInDevToolsAction, DebugExtensionHostInNewWindowAction, DebugRendererInNewWindowAction, DebugExtensionHostAndRendererAction, Storage2, defaultDebugConfig, DebugExtensionsContribution };
