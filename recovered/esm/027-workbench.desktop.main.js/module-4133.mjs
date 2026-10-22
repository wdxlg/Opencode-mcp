// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/electron-browser/mcp.contribution.ts
import { mcpDiscoveryRegistry } from "./module-2963.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { NativeMcpDiscovery } from "./module-4130.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IMcpDevModeDebugging } from "./module-2329.mjs";
import { McpDevModeDebuggingNode } from "./module-4129.mjs";
import { IWorkbenchMcpGatewayService } from "./module-1446.mjs";
import { WorkbenchMcpGatewayService } from "./module-4131.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { McpGatewayToolBrokerContribution2 } from "./module-4132.mjs";


// src/vs/workbench/contrib/mcp/electron-browser/mcp.contribution.ts
mcpDiscoveryRegistry.register(new SyncDescriptor(NativeMcpDiscovery));

registerSingleton(IMcpDevModeDebugging, McpDevModeDebuggingNode, 1 /* Delayed */);

registerSingleton(IWorkbenchMcpGatewayService, WorkbenchMcpGatewayService, 1 /* Delayed */);

registerWorkbenchContribution2("mcpGatewayToolBrokerLocal", McpGatewayToolBrokerContribution2, WorkbenchPhase.AfterRestored);
export {};
