// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/mcp/electron-browser/mcpWorkbenchManagementService.ts
import { IWorkbenchMcpManagementService, WorkbenchMcpManagementService } from "./module-1204.mjs";
import { McpManagementChannelClient } from "./module-1201.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAllowedMcpServersService } from "./module-1196.mjs";
import { ILogService } from "./module-0095.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IRemoteUserDataProfilesService } from "./module-1203.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/mcp/electron-browser/mcpWorkbenchManagementService.ts
var WorkbenchMcpManagementService2 = class extends WorkbenchMcpManagementService {
  constructor(allowedMcpServersService, logService, userDataProfileService, uriIdentityService, workspaceContextService, remoteAgentService, userDataProfilesService, remoteUserDataProfilesService, instantiationService, sharedProcessService) {
    const mcpManagementService = new McpManagementChannelClient(sharedProcessService.getChannel("mcpManagement"), allowedMcpServersService, logService);
    super(mcpManagementService, allowedMcpServersService, logService, userDataProfileService, uriIdentityService, workspaceContextService, remoteAgentService, userDataProfilesService, remoteUserDataProfilesService, instantiationService);
    this._register(mcpManagementService);
  }
};

WorkbenchMcpManagementService2 = __decorateClass([
  __decorateParam(0, IAllowedMcpServersService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IUserDataProfileService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IRemoteAgentService),
  __decorateParam(6, IUserDataProfilesService),
  __decorateParam(7, IRemoteUserDataProfilesService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ISharedProcessService)
], WorkbenchMcpManagementService2);

registerSingleton(IWorkbenchMcpManagementService, WorkbenchMcpManagementService2, 1 /* Delayed */);
export { WorkbenchMcpManagementService2 };
