// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpGatewayService.ts
import { McpGatewayChannelName } from "./module-2864.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ILogService } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpGatewayService.ts
var BrowserMcpGatewayService = class {
  constructor(_remoteAgentService, _logService) {
    this._remoteAgentService = _remoteAgentService;
    this._logService = _logService;
  }
  async createGateway(inRemote, chatSessionResource) {
    this._logService.debug(`[McpGateway][BrowserWorkbench] createGateway requested (inRemote=${inRemote})`);
    if (!inRemote) {
      this._logService.info("[McpGateway][BrowserWorkbench] Cannot create local gateway in browser environment");
      return void 0;
    }
    const connection = this._remoteAgentService.getConnection();
    if (!connection) {
      this._logService.info("[McpGateway][BrowserWorkbench] No remote connection available (serverless web)");
      return void 0;
    }
    this._logService.info("[McpGateway][BrowserWorkbench] Creating remote gateway via remote server");
    return connection.withChannel(McpGatewayChannelName, async (channel) => {
      const info = await channel.call(
        "createGateway",
        chatSessionResource ? { chatSessionResource: chatSessionResource.toString() } : void 0
      );
      const servers = reviveServers(info.servers);
      this._logService.info(`[McpGateway][BrowserWorkbench] Remote gateway created with ${servers.length} server(s)`);
      const onDidChangeServers = Event2.map(
        Event2.filter(
          channel.listen("onDidChangeGatewayServers"),
          (e4) => e4.gatewayId === info.gatewayId
        ),
        (e4) => reviveServers(e4.servers)
      );
      return {
        servers,
        onDidChangeServers,
        dispose: () => {
          this._logService.info(`[McpGateway][BrowserWorkbench] Disposing remote gateway: ${info.gatewayId}`);
          void channel.call("disposeGateway", info.gatewayId).then(void 0, (error) => {
            this._logService.warn(`[McpGateway][BrowserWorkbench] Failed to dispose remote gateway: ${info.gatewayId}`, error);
          });
        }
      };
    });
  }
};

BrowserMcpGatewayService = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, ILogService)
], BrowserMcpGatewayService);

function reviveServers(servers) {
  return servers.map((s) => ({ label: s.label, address: URI.revive(s.address) }));
}
export { reviveServers, BrowserMcpGatewayService };
