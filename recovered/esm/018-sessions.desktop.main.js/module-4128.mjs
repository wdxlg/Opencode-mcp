// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/terminalProfileResolverService.ts
import { BaseTerminalProfileResolverService } from "./module-4127.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ITerminalProfileService } from "./module-1174.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ITerminalInstanceService } from "./module-1150.mjs";


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
