// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/path/electron-browser/pathService.ts
import { AbstractPathService, IPathService } from "./module-0938.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/path/electron-browser/pathService.ts
var NativePathService = class extends AbstractPathService {
  constructor(remoteAgentService, environmentService, contextService) {
    super(environmentService.userHome, remoteAgentService, environmentService, contextService);
  }
};

NativePathService = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, IWorkspaceContextService)
], NativePathService);

registerSingleton(IPathService, NativePathService, 1 /* Delayed */);
export { NativePathService };
