// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/mcp/node/mcpGatewayChannel.ts
import { IMcpGatewayService, McpGatewayToolBrokerChannelName, init_mcpGateway } from "./module-0343.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableMap, DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { ILoggerService, init_log } from "./module-0075.mjs";


// src/vs/platform/mcp/node/mcpGatewayChannel.ts
function ipcChannelForContext(ipcServer, ctx) {
  return ipcServer.getChannel(McpGatewayToolBrokerChannelName, (client) => client.ctx === ctx);
}

var McpGatewayChannel;

var init_mcpGatewayChannel = __esm({
  "src/vs/platform/mcp/node/mcpGatewayChannel.ts"() {
    init_event();
    init_lifecycle();
    init_log();
    init_mcpGateway();
    McpGatewayChannel = class extends Disposable {
      constructor(_ipcServer, mcpGatewayService, _loggerService) {
        super();
        this._ipcServer = _ipcServer;
        this.mcpGatewayService = mcpGatewayService;
        this._loggerService = _loggerService;
        this._onDidChangeGatewayServers = this._register(new Emitter());
        this._gatewayDisposables = this._register(new DisposableMap());
        /** Tracks which gateways belong to which client for cleanup on disconnect */
        this._clientGateways = /* @__PURE__ */ new Map();
        this._register(_ipcServer.onDidRemoveConnection((c) => {
          this._loggerService.getLogger("mcpGateway")?.info(`[McpGateway][Channel] Client disconnected: ${c.ctx}, cleaning up gateways`);
          mcpGatewayService.disposeGatewaysForClient(c.ctx);
          const gatewaysForClient = this._clientGateways.get(c.ctx);
          if (gatewaysForClient) {
            for (const gatewayId of gatewaysForClient) {
              this._gatewayDisposables.deleteAndDispose(gatewayId);
            }
            this._clientGateways.delete(c.ctx);
          }
        }));
      }
      listen(_ctx, event) {
        if (event === "onDidChangeGatewayServers") {
          return this._onDidChangeGatewayServers.event;
        }
        throw new Error(`Invalid listen: ${event}`);
      }
      async call(ctx, command, args2) {
        const logger = this._loggerService.getLogger("mcpGateway");
        logger?.debug(`[McpGateway][Channel] IPC call: ${command} from client ${ctx}`);
        switch (command) {
          case "createGateway": {
            const { chatSessionResource } = args2 ?? {};
            const brokerChannel = ipcChannelForContext(this._ipcServer, ctx);
            let currentServers = await brokerChannel.call("listServers");
            const onDidChangeServersListener = brokerChannel.listen("onDidChangeServers");
            const result = await this.mcpGatewayService.createGateway(ctx, {
              onDidChangeServers: Event.map(onDidChangeServersListener, (servers) => {
                currentServers = servers;
                return servers;
              }),
              onDidChangeTools: brokerChannel.listen("onDidChangeTools"),
              onDidChangeResources: brokerChannel.listen("onDidChangeResources"),
              listServers: () => currentServers,
              listToolsForServer: (serverId) => brokerChannel.call("listToolsForServer", { serverId }),
              callToolForServer: (serverId, name, callArgs) => brokerChannel.call("callToolForServer", { serverId, name, args: callArgs, chatSessionResource }),
              listResourcesForServer: (serverId) => brokerChannel.call("listResourcesForServer", { serverId }),
              readResourceForServer: (serverId, uri) => brokerChannel.call("readResourceForServer", { serverId, uri }),
              listResourceTemplatesForServer: (serverId) => brokerChannel.call("listResourceTemplatesForServer", { serverId })
            });
            const gatewayStore = new DisposableStore();
            gatewayStore.add(result.onDidChangeServers((servers) => {
              this._onDidChangeGatewayServers.fire({ gatewayId: result.gatewayId, servers });
            }));
            this._gatewayDisposables.set(result.gatewayId, gatewayStore);
            let gatewaysForClient = this._clientGateways.get(ctx);
            if (!gatewaysForClient) {
              gatewaysForClient = /* @__PURE__ */ new Set();
              this._clientGateways.set(ctx, gatewaysForClient);
            }
            gatewaysForClient.add(result.gatewayId);
            logger?.info(`[McpGateway][Channel] Gateway created: ${result.gatewayId} with ${result.servers.length} server(s) for client ${ctx}`);
            return { gatewayId: result.gatewayId, servers: result.servers };
          }
          case "disposeGateway": {
            const gatewayId = args2;
            logger?.info(`[McpGateway][Channel] Disposing gateway: ${gatewayId} for client ${ctx}`);
            this._gatewayDisposables.deleteAndDispose(gatewayId);
            const gatewaysForClient = this._clientGateways.get(ctx);
            if (gatewaysForClient) {
              gatewaysForClient.delete(gatewayId);
              if (gatewaysForClient.size === 0) {
                this._clientGateways.delete(ctx);
              }
            }
            await this.mcpGatewayService.disposeGateway(gatewayId);
            return void 0;
          }
        }
        throw new Error(`Invalid call: ${command}`);
      }
    };
    McpGatewayChannel = __decorateClass([
      __decorateParam(1, IMcpGatewayService),
      __decorateParam(2, ILoggerService)
    ], McpGatewayChannel);
  }
});
export { ipcChannelForContext, McpGatewayChannel, init_mcpGatewayChannel };
