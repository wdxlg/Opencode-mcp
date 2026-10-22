// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/mcp/common/mcpManagementIpc.ts
import { URI } from "./module-0023.mjs";
import { DefaultURITransformer, transformAndReviveIncomingURIs } from "./module-0035.mjs";
import { AbstractMcpManagementService } from "./module-0208.mjs";
import { Emitter } from "./module-0019.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAllowedMcpServersService } from "./module-0201.mjs";
import { ILogService } from "./module-0045.mjs";


// src/vs/platform/mcp/common/mcpManagementIpc.ts
function transformIncomingURI(uri2, transformer) {
  return uri2 ? URI.revive(transformer ? transformer.transformIncoming(uri2) : uri2) : void 0;
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
    this._register(this.channel.listen("onInstallMcpServer")((e) => this._onInstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI(e.mcpResource, null) })));
    this._register(this.channel.listen("onDidInstallMcpServers")((results) => this._onDidInstallMcpServers.fire(results.map((e) => ({ ...e, local: e.local ? transformIncomingServer(e.local, null) : e.local, mcpResource: transformIncomingURI(e.mcpResource, null) })))));
    this._register(this.channel.listen("onDidUpdateMcpServers")((results) => this._onDidUpdateMcpServers.fire(results.map((e) => ({ ...e, local: e.local ? transformIncomingServer(e.local, null) : e.local, mcpResource: transformIncomingURI(e.mcpResource, null) })))));
    this._register(this.channel.listen("onUninstallMcpServer")((e) => this._onUninstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI(e.mcpResource, null) })));
    this._register(this.channel.listen("onDidUninstallMcpServer")((e) => this._onDidUninstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI(e.mcpResource, null) })));
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
  install(server, options2) {
    return Promise.resolve(this.channel.call("install", [server, options2])).then((local) => transformIncomingServer(local, null));
  }
  installFromGallery(extension, installOptions) {
    return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then((local) => transformIncomingServer(local, null));
  }
  uninstall(extension, options2) {
    return Promise.resolve(this.channel.call("uninstall", [extension, options2]));
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
