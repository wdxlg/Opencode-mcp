// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/tunnelAgentHost.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/tunnelAgentHost.ts
var ITunnelAgentHostService = createDecorator("tunnelAgentHostService");

var TUNNEL_ADDRESS_PREFIX = "tunnel:";

var ITunnelAgentHostMainService = createDecorator("tunnelAgentHostMainService");

var TUNNEL_HOST_CHANNEL = "tunnelHost";

var TUNNEL_HOST_LOG_ID = "tunnelHostService";

var ITunnelAgentHostHostingService = createDecorator("tunnelAgentHostHostingService");
export { ITunnelAgentHostService, TUNNEL_ADDRESS_PREFIX, ITunnelAgentHostMainService, TUNNEL_HOST_CHANNEL, TUNNEL_HOST_LOG_ID, ITunnelAgentHostHostingService };
