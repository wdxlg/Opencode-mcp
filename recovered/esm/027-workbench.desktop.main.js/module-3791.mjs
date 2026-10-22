// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/electron-browser/workspacesService.ts
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IWorkspacesService } from "./module-1379.mjs";


// src/vs/workbench/services/workspaces/electron-browser/workspacesService.ts
var NativeWorkspacesService = class {
  constructor(mainProcessService, nativeHostService) {
    return ProxyChannel.toService(mainProcessService.getChannel("workspaces"), { context: nativeHostService.windowId });
  }
};

NativeWorkspacesService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, INativeHostService)
], NativeWorkspacesService);

registerSingleton(IWorkspacesService, NativeWorkspacesService, 1 /* Delayed */);
export { NativeWorkspacesService };
