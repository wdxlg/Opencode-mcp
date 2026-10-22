// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationUsageService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Queue } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0873.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/authentication/browser/authenticationUsageService.ts
var IAuthenticationUsageService = createDecorator("IAuthenticationUsageService");

var AuthenticationUsageService = class extends Disposable {
  constructor(_storageService, _authenticationService, _logService, productService) {
    super();
    this._storageService = _storageService;
    this._authenticationService = _authenticationService;
    this._logService = _logService;
    this._queue = this._register(new Queue());
    this._extensionsUsingAuth = /* @__PURE__ */ new Set();
    this._disposed = false;
    this._register(toDisposable(() => this._disposed = true));
    const trustedExtensionAuthAccess = productService.trustedExtensionAuthAccess;
    if (Array.isArray(trustedExtensionAuthAccess)) {
      for (const extensionId of trustedExtensionAuthAccess) {
        this._extensionsUsingAuth.add(extensionId);
      }
    } else if (trustedExtensionAuthAccess) {
      for (const extensions of Object.values(trustedExtensionAuthAccess)) {
        for (const extensionId of extensions) {
          this._extensionsUsingAuth.add(extensionId);
        }
      }
    }
    this._register(this._authenticationService.onDidRegisterAuthenticationProvider(
      (provider) => this._queue.queue(
        () => this._addExtensionsToCache(provider.id)
      )
    ));
  }
  async initializeExtensionUsageCache() {
    await this._queue.queue(() => Promise.all(this._authenticationService.getProviderIds().map((providerId) => this._addExtensionsToCache(providerId))));
  }
  async extensionUsesAuth(extensionId) {
    await this._queue.whenIdle();
    return this._extensionsUsingAuth.has(extensionId);
  }
  readAccountUsages(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
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
    const accountKey = `${providerId}-${accountName}-usages`;
    this._storageService.remove(accountKey, -1 /* APPLICATION */);
  }
  addAccountUsage(providerId, accountName, scopes, extensionId, extensionName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const usages = this.readAccountUsages(providerId, accountName);
    const existingUsageIndex = usages.findIndex((usage) => usage.extensionId === extensionId);
    if (existingUsageIndex > -1) {
      usages.splice(existingUsageIndex, 1, {
        extensionId,
        extensionName,
        scopes,
        lastUsed: Date.now()
      });
    } else {
      usages.push({
        extensionId,
        extensionName,
        scopes,
        lastUsed: Date.now()
      });
    }
    this._storageService.store(accountKey, JSON.stringify(usages), -1 /* APPLICATION */, 1 /* MACHINE */);
    this._extensionsUsingAuth.add(extensionId);
  }
  async _addExtensionsToCache(providerId) {
    if (this._disposed) {
      return;
    }
    try {
      const accounts = await this._authenticationService.getAccounts(providerId);
      for (const account of accounts) {
        const usage = this.readAccountUsages(providerId, account.label);
        for (const u of usage) {
          this._extensionsUsingAuth.add(u.extensionId);
        }
      }
    } catch (e) {
      this._logService.error(e);
    }
  }
};

AuthenticationUsageService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IProductService)
], AuthenticationUsageService);

registerSingleton(IAuthenticationUsageService, AuthenticationUsageService, 1 /* Delayed */);
export { IAuthenticationUsageService, AuthenticationUsageService };
