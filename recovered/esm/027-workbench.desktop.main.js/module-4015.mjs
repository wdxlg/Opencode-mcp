// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/terminalProfileResolverService.ts
import { BaseTerminalProfileResolverService } from "./module-4014.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { ITerminalLogService } from "./module-1154.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ITerminalProfileService } from "./module-1173.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/terminalProfileResolverService.ts
var ElectronTerminalProfileResolverService = class extends BaseTerminalProfileResolverService {
  constructor(configurationResolverService, configurationService, historyService, logService, workspaceContextService, terminalProfileService, remoteAgentService, terminalInstanceService) {
    super(
      {
        getDefaultSystemShell: async (remoteAuthority, platform3) => {
          const backend = await terminalInstanceService.getBackend(remoteAuthority);
          if (!backend) {
            throw new ErrorNoTelemetry(`Cannot get default system shell when there is no backend for remote authority '${remoteAuthority}'`);
          }
          return backend.getDefaultSystemShell(platform3);
        },
        getEnvironment: async (remoteAuthority) => {
          const backend = await terminalInstanceService.getBackend(remoteAuthority);
          if (!backend) {
            throw new ErrorNoTelemetry(`Cannot get environment when there is no backend for remote authority '${remoteAuthority}'`);
          }
          return backend.getEnvironment();
        }
      },
      configurationService,
      configurationResolverService,
      historyService,
      logService,
      terminalProfileService,
      workspaceContextService,
      remoteAgentService
    );
  }
};

ElectronTerminalProfileResolverService = __decorateClass([
  __decorateParam(0, IConfigurationResolverService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHistoryService),
  __decorateParam(3, ITerminalLogService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, ITerminalProfileService),
  __decorateParam(6, IRemoteAgentService),
  __decorateParam(7, ITerminalInstanceService)
], ElectronTerminalProfileResolverService);
export { ElectronTerminalProfileResolverService };
