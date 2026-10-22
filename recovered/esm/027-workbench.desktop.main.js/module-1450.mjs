// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationMcpUsageService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Queue } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0873.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/authentication/browser/authenticationMcpUsageService.ts
var IAuthenticationMcpUsageService = createDecorator("IAuthenticationMcpUsageService");

var AuthenticationMcpUsageService = class extends Disposable {
  constructor(_storageService, _authenticationService, _logService, productService) {
    super();
    this._storageService = _storageService;
    this._authenticationService = _authenticationService;
    this._logService = _logService;
    this._queue = new Queue();
    this._mcpServersUsingAuth = /* @__PURE__ */ new Set();
    const trustedMcpAuthAccess = productService.trustedMcpAuthAccess;
    if (Array.isArray(trustedMcpAuthAccess)) {
      for (const mcpServerId of trustedMcpAuthAccess) {
        this._mcpServersUsingAuth.add(mcpServerId);
      }
    } else if (trustedMcpAuthAccess) {
      for (const mcpServers of Object.values(trustedMcpAuthAccess)) {
        for (const mcpServerId of mcpServers) {
          this._mcpServersUsingAuth.add(mcpServerId);
        }
      }
    }
    this._register(this._authenticationService.onDidRegisterAuthenticationProvider(
      (provider) => this._queue.queue(
        () => this._addToCache(provider.id)
      )
    ));
  }
  async initializeUsageCache() {
    await this._queue.queue(() => Promise.all(this._authenticationService.getProviderIds().map((providerId) => this._addToCache(providerId))));
  }
  async hasUsedAuth(mcpServerId) {
    await this._queue.whenIdle();
    return this._mcpServersUsingAuth.has(mcpServerId);
  }
  readAccountUsages(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-mcpserver-usages`;
    const storedUsages = this._storageService.get(accountKey, -1 /* APPLICATION */);
    let usages = [];
    if (storedUsages) {
      try {
        usages = JSON.parse(storedUsages);
      } catch (e) {
      }
    }
    return usages;
  }
  removeAccountUsage(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-mcpserver-usages`;
    this._storageService.remove(accountKey, -1 /* APPLICATION */);
  }
  addAccountUsage(providerId, accountName, scopes, mcpServerId, mcpServerName) {
    const accountKey = `${providerId}-${accountName}-mcpserver-usages`;
    const usages = this.readAccountUsages(providerId, accountName);
    const existingUsageIndex = usages.findIndex((usage) => usage.mcpServerId === mcpServerId);
    if (existingUsageIndex > -1) {
      usages.splice(existingUsageIndex, 1, {
        mcpServerId,
        mcpServerName,
        scopes,
        lastUsed: Date.now()
      });
    } else {
      usages.push({
        mcpServerId,
        mcpServerName,
        scopes,
        lastUsed: Date.now()
      });
    }
    this._storageService.store(accountKey, JSON.stringify(usages), -1 /* APPLICATION */, 1 /* MACHINE */);
    this._mcpServersUsingAuth.add(mcpServerId);
  }
  async _addToCache(providerId) {
    try {
      const accounts = await this._authenticationService.getAccounts(providerId);
      for (const account of accounts) {
        const usage = this.readAccountUsages(providerId, account.label);
        for (const u of usage) {
          this._mcpServersUsingAuth.add(u.mcpServerId);
        }
      }
    } catch (e) {
      this._logService.error(e);
    }
  }
};

AuthenticationMcpUsageService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IProductService)
], AuthenticationMcpUsageService);

registerSingleton(IAuthenticationMcpUsageService, AuthenticationMcpUsageService, 1 /* Delayed */);
export { IAuthenticationMcpUsageService, AuthenticationMcpUsageService };
