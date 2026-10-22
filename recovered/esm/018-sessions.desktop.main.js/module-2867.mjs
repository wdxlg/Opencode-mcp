// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpGatewayToolBrokerContribution.ts
import { McpGatewayToolBrokerChannelName } from "./module-2864.mjs";
import { McpGatewayToolBrokerChannel } from "./module-2866.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IMcpService } from "./module-1206.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpGatewayToolBrokerContribution.ts
var McpGatewayToolBrokerContribution = class {
  constructor(remoteAgentService, mcpService, logService) {
    remoteAgentService.getConnection()?.registerChannel(McpGatewayToolBrokerChannelName, new McpGatewayToolBrokerChannel(mcpService, logService));
  }
};

McpGatewayToolBrokerContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IMcpService),
  __decorateParam(2, ILogService)
], McpGatewayToolBrokerContribution);
export { McpGatewayToolBrokerContribution };
