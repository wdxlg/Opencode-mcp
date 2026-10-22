// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/mcp/common/mcpManagementIpc.ts
import { URI } from "./module-0032.mjs";
import { DefaultURITransformer, transformAndReviveIncomingURIs } from "./module-1199.mjs";
import { AbstractMcpManagementService } from "./module-1200.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAllowedMcpServersService } from "./module-1196.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/mcp/common/mcpManagementIpc.ts
function transformIncomingURI(uri4, transformer) {
  return uri4 ? URI.revive(transformer ? transformer.transformIncoming(uri4) : uri4) : void 0;
}

function transformIncomingServer(mcpServer, transformer) {
  transformer = transformer ? transformer : DefaultURITransformer;
  const manifest = mcpServer.manifest;
  const transformed = transformAndReviveIncomingURIs({ ...mcpServer, ...{ manifest: void 0 } }, transformer);
  return { ...transformed, ...{ manifest } };
}

var McpManagementChannelClient = class extends AbstractMcpManagementService {
  constructor(channel, allowedMcpServersService, logService) {
    super(allowedMcpServersService, logService);
    this.channel = channel;
    this._onInstallMcpServer = this._register(new Emitter());
    this._onDidInstallMcpServers = this._register(new Emitter());
    this._onUninstallMcpServer = this._register(new Emitter());
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this._register(this.channel.listen("onInstallMcpServer")((e4) => this._onInstallMcpServer.fire({ ...e4, mcpResource: transformIncomingURI(e4.mcpResource, null) })));
    this._register(this.channel.listen("onDidInstallMcpServers")((results) => this._onDidInstallMcpServers.fire(results.map((e4) => ({ ...e4, local: e4.local ? transformIncomingServer(e4.local, null) : e4.local, mcpResource: transformIncomingURI(e4.mcpResource, null) })))));
    this._register(this.channel.listen("onDidUpdateMcpServers")((results) => this._onDidUpdateMcpServers.fire(results.map((e4) => ({ ...e4, local: e4.local ? transformIncomingServer(e4.local, null) : e4.local, mcpResource: transformIncomingURI(e4.mcpResource, null) })))));
    this._register(this.channel.listen("onUninstallMcpServer")((e4) => this._onUninstallMcpServer.fire({ ...e4, mcpResource: transformIncomingURI(e4.mcpResource, null) })));
    this._register(this.channel.listen("onDidUninstallMcpServer")((e4) => this._onDidUninstallMcpServer.fire({ ...e4, mcpResource: transformIncomingURI(e4.mcpResource, null) })));
  }
  get onInstallMcpServer() {
    return this._onInstallMcpServer.event;
  }
  get onDidInstallMcpServers() {
    return this._onDidInstallMcpServers.event;
  }
  get onUninstallMcpServer() {
    return this._onUninstallMcpServer.event;
  }
  get onDidUninstallMcpServer() {
    return this._onDidUninstallMcpServer.event;
  }
  get onDidUpdateMcpServers() {
    return this._onDidUpdateMcpServers.event;
  }
  install(server, options3) {
    return Promise.resolve(this.channel.call("install", [server, options3])).then((local) => transformIncomingServer(local, null));
  }
  installFromGallery(extension, installOptions) {
    return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then((local) => transformIncomingServer(local, null));
  }
  uninstall(extension, options3) {
    return Promise.resolve(this.channel.call("uninstall", [extension, options3]));
  }
  getInstalled(mcpResource) {
    return Promise.resolve(this.channel.call("getInstalled", [mcpResource])).then((servers) => servers.map((server) => transformIncomingServer(server, null)));
  }
  updateMetadata(local, gallery, mcpResource) {
    return Promise.resolve(this.channel.call("updateMetadata", [local, gallery, mcpResource])).then((local2) => transformIncomingServer(local2, null));
  }
};

McpManagementChannelClient = __decorateClass([
  __decorateParam(1, IAllowedMcpServersService),
  __decorateParam(2, ILogService)
], McpManagementChannelClient);
export { transformIncomingURI, transformIncomingServer, McpManagementChannelClient };
