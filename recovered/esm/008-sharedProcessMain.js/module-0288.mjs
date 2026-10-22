// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/mcp/common/mcpManagementIpc.ts
import { URI } from "./module-0024.mjs";
import { DefaultURITransformer, transformAndReviveIncomingURIs } from "./module-0107.mjs";
import { cloneAndChange } from "./module-0074.mjs";
import { Emitter, Event } from "./module-0018.mjs";
import { AbstractMcpManagementService } from "./module-0284.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAllowedMcpServersService } from "./module-0282.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/mcp/common/mcpManagementIpc.ts
function transformIncomingURI2(uri, transformer) {
  return uri ? URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : void 0;
}

function transformIncomingServer(mcpServer, transformer) {
  transformer = transformer ? transformer : DefaultURITransformer;
  const manifest = mcpServer.manifest;
  const transformed = transformAndReviveIncomingURIs({ ...mcpServer, ...{ manifest: void 0 } }, transformer);
  return { ...transformed, ...{ manifest } };
}

function transformIncomingOptions2(options, transformer) {
  return options?.mcpResource ? transformAndReviveIncomingURIs(options, transformer ?? DefaultURITransformer) : options;
}

function transformOutgoingExtension2(extension, transformer) {
  return transformer ? cloneAndChange(extension, (value) => value instanceof URI ? transformer.transformOutgoingURI(value) : void 0) : extension;
}

function transformOutgoingURI2(uri, transformer) {
  return transformer ? transformer.transformOutgoingURI(uri) : uri;
}

var McpManagementChannel = class {
  constructor(service, getUriTransformer) {
    this.service = service;
    this.getUriTransformer = getUriTransformer;
    this.onInstallMcpServer = Event.buffer(service.onInstallMcpServer, "onInstallMcpServer", true);
    this.onDidInstallMcpServers = Event.buffer(service.onDidInstallMcpServers, "onDidInstallMcpServers", true);
    this.onDidUpdateMcpServers = Event.buffer(service.onDidUpdateMcpServers, "onDidUpdateMcpServers", true);
    this.onUninstallMcpServer = Event.buffer(service.onUninstallMcpServer, "onUninstallMcpServer", true);
    this.onDidUninstallMcpServer = Event.buffer(service.onDidUninstallMcpServer, "onDidUninstallMcpServer", true);
  }
  listen(context, event) {
    const uriTransformer = this.getUriTransformer(context);
    switch (event) {
      case "onInstallMcpServer": {
        return Event.map(this.onInstallMcpServer, (event2) => {
          return { ...event2, mcpResource: transformOutgoingURI2(event2.mcpResource, uriTransformer) };
        });
      }
      case "onDidInstallMcpServers": {
        return Event.map(this.onDidInstallMcpServers, (results) => results.map((i) => ({
          ...i,
          local: i.local ? transformOutgoingExtension2(i.local, uriTransformer) : i.local,
          mcpResource: transformOutgoingURI2(i.mcpResource, uriTransformer)
        })));
      }
      case "onDidUpdateMcpServers": {
        return Event.map(this.onDidUpdateMcpServers, (results) => results.map((i) => ({
          ...i,
          local: i.local ? transformOutgoingExtension2(i.local, uriTransformer) : i.local,
          mcpResource: transformOutgoingURI2(i.mcpResource, uriTransformer)
        })));
      }
      case "onUninstallMcpServer": {
        return Event.map(this.onUninstallMcpServer, (event2) => {
          return { ...event2, mcpResource: transformOutgoingURI2(event2.mcpResource, uriTransformer) };
        });
      }
      case "onDidUninstallMcpServer": {
        return Event.map(this.onDidUninstallMcpServer, (event2) => {
          return { ...event2, mcpResource: transformOutgoingURI2(event2.mcpResource, uriTransformer) };
        });
      }
    }
    throw new Error("Invalid listen");
  }
  async call(context, command, args) {
    const uriTransformer = this.getUriTransformer(context);
    const argsArray = Array.isArray(args) ? args : [];
    switch (command) {
      case "getInstalled": {
        const mcpServers = await this.service.getInstalled(transformIncomingURI2(argsArray[0], uriTransformer));
        return mcpServers.map((e) => transformOutgoingExtension2(e, uriTransformer));
      }
      case "install": {
        return this.service.install(argsArray[0], transformIncomingOptions2(argsArray[1], uriTransformer));
      }
      case "installFromGallery": {
        return this.service.installFromGallery(argsArray[0], transformIncomingOptions2(argsArray[1], uriTransformer));
      }
      case "uninstall": {
        return this.service.uninstall(transformIncomingServer(argsArray[0], uriTransformer), transformIncomingOptions2(argsArray[1], uriTransformer));
      }
      case "updateMetadata": {
        return this.service.updateMetadata(transformIncomingServer(argsArray[0], uriTransformer), argsArray[1], transformIncomingURI2(argsArray[2], uriTransformer));
      }
    }
    throw new Error("Invalid call");
  }
};

var McpManagementChannelClient = class extends AbstractMcpManagementService {
  constructor(channel, allowedMcpServersService, logService) {
    super(allowedMcpServersService, logService);
    this.channel = channel;
    this._onInstallMcpServer = this._register(new Emitter());
    this._onDidInstallMcpServers = this._register(new Emitter());
    this._onUninstallMcpServer = this._register(new Emitter());
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this._register(this.channel.listen("onInstallMcpServer")((e) => this._onInstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI2(e.mcpResource, null) })));
    this._register(this.channel.listen("onDidInstallMcpServers")((results) => this._onDidInstallMcpServers.fire(results.map((e) => ({ ...e, local: e.local ? transformIncomingServer(e.local, null) : e.local, mcpResource: transformIncomingURI2(e.mcpResource, null) })))));
    this._register(this.channel.listen("onDidUpdateMcpServers")((results) => this._onDidUpdateMcpServers.fire(results.map((e) => ({ ...e, local: e.local ? transformIncomingServer(e.local, null) : e.local, mcpResource: transformIncomingURI2(e.mcpResource, null) })))));
    this._register(this.channel.listen("onUninstallMcpServer")((e) => this._onUninstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI2(e.mcpResource, null) })));
    this._register(this.channel.listen("onDidUninstallMcpServer")((e) => this._onDidUninstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI2(e.mcpResource, null) })));
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
  install(server, options) {
    return Promise.resolve(this.channel.call("install", [server, options])).then((local) => transformIncomingServer(local, null));
  }
  installFromGallery(extension, installOptions) {
    return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then((local) => transformIncomingServer(local, null));
  }
  uninstall(extension, options) {
    return Promise.resolve(this.channel.call("uninstall", [extension, options]));
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
export { transformIncomingURI2, transformIncomingServer, transformIncomingOptions2, transformOutgoingExtension2, transformOutgoingURI2, McpManagementChannel, McpManagementChannelClient };
