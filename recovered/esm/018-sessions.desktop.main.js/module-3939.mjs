// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configurationResolver/electron-browser/configurationResolverService.ts
import { BaseConfigurationResolverService } from "./module-3937.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IShellEnvironmentService } from "./module-3938.mjs";
import { IPathService } from "./module-0939.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";


// src/vs/workbench/services/configurationResolver/electron-browser/configurationResolverService.ts
var ConfigurationResolverService = class extends BaseConfigurationResolverService {
  constructor(editorService, environmentService, configurationService, commandService, workspaceContextService, quickInputService, labelService, shellEnvironmentService, pathService, extensionService, storageService) {
    super(
      {
        getAppRoot: () => {
          return environmentService.appRoot;
        },
        getExecPath: () => {
          return environmentService.execPath;
        }
      },
      shellEnvironmentService.getShellEnv(),
      editorService,
      configurationService,
      commandService,
      workspaceContextService,
      quickInputService,
      labelService,
      pathService,
      extensionService,
      storageService
    );
  }
};

ConfigurationResolverService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IShellEnvironmentService),
  __decorateParam(8, IPathService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IStorageService)
], ConfigurationResolverService);

registerSingleton(IConfigurationResolverService, ConfigurationResolverService, 1 /* Delayed */);
export { ConfigurationResolverService };
