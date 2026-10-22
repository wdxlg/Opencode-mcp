// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/electron-browser/mcpGatewayService.ts
import { McpGatewayChannelName } from "./module-2983.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ILogService } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/mcp/electron-browser/mcpGatewayService.ts
var WorkbenchMcpGatewayService = class {
  constructor(mainProcessService, _remoteAgentService, _logService) {
    this._remoteAgentService = _remoteAgentService;
    this._logService = _logService;
    this._localChannel = mainProcessService.getChannel(McpGatewayChannelName);
    this._localPlatformService = ProxyChannel.toService(this._localChannel);
  }
  async createGateway(inRemote, chatSessionResource) {
    this._logService.debug(`[McpGateway][Workbench] createGateway requested (inRemote=${inRemote})`);
    if (inRemote) {
      return this._createRemoteGateway(chatSessionResource);
    } else {
      return this._createLocalGateway(chatSessionResource);
    }
  }
  async _createLocalGateway(chatSessionResource) {
    this._logService.info("[McpGateway][Workbench] Creating local gateway via main process");
    const info = await this._localChannel.call(
      "createGateway",
      chatSessionResource ? { chatSessionResource: chatSessionResource.toString() } : void 0
    );
    const servers = reviveServers2(info.servers);
    this._logService.info(`[McpGateway][Workbench] Local gateway created with ${servers.length} server(s)`);
    const onDidChangeServers = Event2.map(
      Event2.filter(
        this._localChannel.listen("onDidChangeGatewayServers"),
        (e) => e.gatewayId === info.gatewayId
      ),
      (e) => reviveServers2(e.servers)
    );
    return {
      servers,
      onDidChangeServers,
      dispose: () => {
        this._logService.info(`[McpGateway][Workbench] Disposing local gateway: ${info.gatewayId}`);
        this._localPlatformService.disposeGateway(info.gatewayId);
      }
    };
  }
  async _createRemoteGateway(chatSessionResource) {
    const connection = this._remoteAgentService.getConnection();
    if (!connection) {
      this._logService.info("[McpGateway][Workbench] No remote connection available for remote gateway");
      return void 0;
    }
    this._logService.info("[McpGateway][Workbench] Creating remote gateway via remote server");
    return connection.withChannel(McpGatewayChannelName, async (channel) => {
      const info = await channel.call(
        "createGateway",
        chatSessionResource ? { chatSessionResource: chatSessionResource.toString() } : void 0
      );
      const servers = reviveServers2(info.servers);
      this._logService.info(`[McpGateway][Workbench] Remote gateway created with ${servers.length} server(s)`);
      const onDidChangeServers = Event2.map(
        Event2.filter(
          channel.listen("onDidChangeGatewayServers"),
          (e) => e.gatewayId === info.gatewayId
        ),
        (e) => reviveServers2(e.servers)
      );
      return {
        servers,
        onDidChangeServers,
        dispose: () => {
          this._logService.info(`[McpGateway][Workbench] Disposing remote gateway: ${info.gatewayId}`);
          void channel.call("disposeGateway", info.gatewayId).catch((error) => {
            this._logService.warn(`[McpGateway][Workbench] Failed to dispose remote gateway: ${info.gatewayId}`, error);
          });
        }
      };
    });
  }
};

WorkbenchMcpGatewayService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, ILogService)
], WorkbenchMcpGatewayService);

function reviveServers2(servers) {
  return servers.map((s) => ({ label: s.label, address: URI.revive(s.address) }));
}
export { reviveServers2, WorkbenchMcpGatewayService };
