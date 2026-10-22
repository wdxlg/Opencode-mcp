// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationMcpAccessService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0873.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/authentication/browser/authenticationMcpAccessService.ts
function urlsEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === void 0 || b === void 0) {
    return false;
  }
  try {
    return new URL(a).toString() === new URL(b).toString();
  } catch {
    return false;
  }
}

var IAuthenticationMcpAccessService = createDecorator("IAuthenticationMcpAccessService");

var AuthenticationMcpAccessService = class extends Disposable {
  constructor(_storageService, _productService) {
    super();
    this._storageService = _storageService;
    this._productService = _productService;
    this._onDidChangeMcpSessionAccess = this._register(new Emitter());
    this.onDidChangeMcpSessionAccess = this._onDidChangeMcpSessionAccess.event;
  }
  isAccessAllowed(providerId, accountName, mcpServerId) {
    return this._isAccessAllowed(providerId, accountName, mcpServerId, void 0);
  }
  isAccessAllowedForUrl(providerId, accountName, mcpServerId, mcpServerUrl) {
    return this._isAccessAllowed(providerId, accountName, mcpServerId, mcpServerUrl);
  }
  _isAccessAllowed(providerId, accountName, mcpServerId, mcpServerUrl) {
    const trustedMCPServerAuthAccess = this._productService.trustedMcpAuthAccess;
    if (Array.isArray(trustedMCPServerAuthAccess)) {
      if (trustedMCPServerAuthAccess.includes(mcpServerId)) {
        return true;
      }
    } else if (trustedMCPServerAuthAccess?.[providerId]?.includes(mcpServerId)) {
      return true;
    }
    const allowList = this.readAllowedMcpServers(providerId, accountName);
    const mcpServerData = allowList.find((mcpServer) => mcpServer.id === mcpServerId);
    if (!mcpServerData) {
      return void 0;
    }
    if (mcpServerUrl !== void 0 && !urlsEqual(mcpServerData.url, mcpServerUrl)) {
      return void 0;
    }
    return mcpServerData.allowed !== void 0 ? mcpServerData.allowed : true;
  }
  readAllowedMcpServers(providerId, accountName) {
    let trustedMCPServers = [];
    try {
      const trustedMCPServerSrc = this._storageService.get(`mcpserver-${providerId}-${accountName}`, -1 /* APPLICATION */);
      if (trustedMCPServerSrc) {
        trustedMCPServers = JSON.parse(trustedMCPServerSrc);
      }
    } catch (err) {
    }
    const trustedMcpServerAuthAccess = this._productService.trustedMcpAuthAccess;
    const trustedMcpServerIds = (
      // Case 1: trustedMcpServerAuthAccess is an array
      Array.isArray(trustedMcpServerAuthAccess) ? trustedMcpServerAuthAccess : typeof trustedMcpServerAuthAccess === "object" ? trustedMcpServerAuthAccess[providerId] ?? [] : []
    );
    for (const mcpServerId of trustedMcpServerIds) {
      const existingServer = trustedMCPServers.find((server) => server.id === mcpServerId);
      if (!existingServer) {
        trustedMCPServers.push({
          id: mcpServerId,
          name: mcpServerId,
          // Default to ID, caller can update with proper name
          allowed: true,
          trusted: true
        });
      } else {
        existingServer.allowed = true;
        existingServer.trusted = true;
      }
    }
    return trustedMCPServers;
  }
  updateAllowedMcpServers(providerId, accountName, mcpServers) {
    const allowList = this.readAllowedMcpServers(providerId, accountName);
    for (const mcpServer of mcpServers) {
      const index2 = allowList.findIndex((e) => e.id === mcpServer.id);
      if (index2 === -1) {
        allowList.push(mcpServer);
      } else {
        allowList[index2].allowed = mcpServer.allowed;
        if (mcpServer.name && mcpServer.name !== mcpServer.id && allowList[index2].name !== mcpServer.name) {
          allowList[index2].name = mcpServer.name;
        }
        if (mcpServer.url !== void 0) {
          allowList[index2].url = mcpServer.url;
        }
        if (mcpServer.agentHost !== void 0) {
          allowList[index2].agentHost = mcpServer.agentHost;
        }
      }
    }
    const userManagedServers = allowList.filter((server) => !server.trusted);
    this._storageService.store(`mcpserver-${providerId}-${accountName}`, JSON.stringify(userManagedServers), -1 /* APPLICATION */, 0 /* USER */);
    this._onDidChangeMcpSessionAccess.fire({ providerId, accountName });
  }
  removeAllowedMcpServers(providerId, accountName) {
    this._storageService.remove(`mcpserver-${providerId}-${accountName}`, -1 /* APPLICATION */);
    this._onDidChangeMcpSessionAccess.fire({ providerId, accountName });
  }
};

AuthenticationMcpAccessService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IProductService)
], AuthenticationMcpAccessService);

registerSingleton(IAuthenticationMcpAccessService, AuthenticationMcpAccessService, 1 /* Delayed */);
export { urlsEqual, IAuthenticationMcpAccessService, AuthenticationMcpAccessService };
