// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/electron-browser/nativeMpcDiscovery.ts
import { NativeFilesystemMcpDiscovery } from "./module-2847.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { NativeMcpDiscoveryHelperChannelName } from "./module-2845.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/mcp/electron-browser/nativeMpcDiscovery.ts
var NativeMcpDiscovery = class extends NativeFilesystemMcpDiscovery {
  constructor(mainProcess, logService, labelService, fileService, instantiationService, mcpRegistry, configurationService) {
    super(null, labelService, fileService, instantiationService, mcpRegistry, configurationService);
    this.mainProcess = mainProcess;
    this.logService = logService;
  }
  start() {
    const service = ProxyChannel.toService(
      this.mainProcess.getChannel(NativeMcpDiscoveryHelperChannelName)
    );
    service.load().then(
      (data) => this.setDetails(data),
      (err) => {
        this.logService.warn("Error getting main process MCP environment", err);
        this.setDetails(void 0);
      }
    );
  }
};

NativeMcpDiscovery = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IMcpRegistry),
  __decorateParam(6, IConfigurationService)
], NativeMcpDiscovery);
export { NativeMcpDiscovery };
