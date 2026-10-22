// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/nativeMcpRemoteDiscovery.ts
import { NativeFilesystemMcpDiscovery } from "./module-2966.mjs";
import { NativeMcpDiscoveryHelperChannelName } from "./module-2964.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/nativeMcpRemoteDiscovery.ts
var RemoteNativeMpcDiscovery = class extends NativeFilesystemMcpDiscovery {
  constructor(remoteAgent, logService, labelService, fileService, instantiationService, mcpRegistry, configurationService) {
    super(remoteAgent.getConnection()?.remoteAuthority || null, labelService, fileService, instantiationService, mcpRegistry, configurationService);
    this.remoteAgent = remoteAgent;
    this.logService = logService;
  }
  async start() {
    const connection = this.remoteAgent.getConnection();
    if (!connection) {
      return this.setDetails(void 0);
    }
    await connection.withChannel(NativeMcpDiscoveryHelperChannelName, async (channel) => {
      const service = ProxyChannel.toService(channel);
      service.load().then(
        (data) => this.setDetails(data),
        (err) => {
          this.logService.warn("Error getting remote process MCP environment", err);
          this.setDetails(void 0);
        }
      );
    });
  }
};

RemoteNativeMpcDiscovery = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IMcpRegistry),
  __decorateParam(6, IConfigurationService)
], RemoteNativeMpcDiscovery);
export { RemoteNativeMpcDiscovery };
