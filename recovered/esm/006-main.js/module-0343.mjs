// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/mcp/common/mcpGateway.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/mcp/common/mcpGateway.ts
var IMcpGatewayService, McpGatewayChannelName, McpGatewayToolBrokerChannelName;

var init_mcpGateway = __esm({
  "src/vs/platform/mcp/common/mcpGateway.ts"() {
    init_instantiation();
    IMcpGatewayService = createDecorator("IMcpGatewayService");
    McpGatewayChannelName = "mcpGateway";
    McpGatewayToolBrokerChannelName = "mcpGatewayToolBroker";
  }
});
export { IMcpGatewayService, McpGatewayChannelName, McpGatewayToolBrokerChannelName, init_mcpGateway };
