// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationAccessService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0875.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/authentication/browser/authenticationAccessService.ts
var IAuthenticationAccessService = createDecorator("IAuthenticationAccessService");

var AuthenticationAccessService = class extends Disposable {
  constructor(_storageService, _productService) {
    super();
    this._storageService = _storageService;
    this._productService = _productService;
    this._onDidChangeExtensionSessionAccess = this._register(new Emitter());
    this.onDidChangeExtensionSessionAccess = this._onDidChangeExtensionSessionAccess.event;
  }
  isAccessAllowed(providerId, accountName, extensionId) {
    const trustedExtensionAuthAccess = this._productService.trustedExtensionAuthAccess;
    const extensionKey = ExtensionIdentifier.toKey(extensionId);
    if (Array.isArray(trustedExtensionAuthAccess)) {
      if (trustedExtensionAuthAccess.includes(extensionKey)) {
        return true;
      }
    } else if (trustedExtensionAuthAccess?.[providerId]?.includes(extensionKey)) {
      return true;
    }
    const allowList = this.readAllowedExtensions(providerId, accountName);
    const extensionData = allowList.find((extension) => extension.id === extensionKey);
    if (!extensionData) {
      return void 0;
    }
    return extensionData.allowed !== void 0 ? extensionData.allowed : true;
  }
  readAllowedExtensions(providerId, accountName) {
    let trustedExtensions = [];
    try {
      const trustedExtensionSrc = this._storageService.get(`${providerId}-${accountName}`, -1 /* APPLICATION */);
      if (trustedExtensionSrc) {
        trustedExtensions = JSON.parse(trustedExtensionSrc);
      }
    } catch (err) {
    }
    const trustedExtensionAuthAccess = this._productService.trustedExtensionAuthAccess;
    const trustedExtensionIds = (
      // Case 1: trustedExtensionAuthAccess is an array
      Array.isArray(trustedExtensionAuthAccess) ? trustedExtensionAuthAccess : typeof trustedExtensionAuthAccess === "object" ? trustedExtensionAuthAccess[providerId] ?? [] : []
    );
    for (const extensionId of trustedExtensionIds) {
      const extensionKey = ExtensionIdentifier.toKey(extensionId);
      const existingExtension = trustedExtensions.find((extension) => extension.id === extensionKey);
      if (!existingExtension) {
        trustedExtensions.push({
          id: extensionKey,
          name: extensionId,
          // Use original casing for display name
          allowed: true,
          trusted: true
        });
      } else {
        existingExtension.allowed = true;
        existingExtension.trusted = true;
      }
    }
    return trustedExtensions;
  }
  updateAllowedExtensions(providerId, accountName, extensions) {
    const allowList = this.readAllowedExtensions(providerId, accountName);
    for (const extension of extensions) {
      const extensionKey = ExtensionIdentifier.toKey(extension.id);
      const index2 = allowList.findIndex((e4) => e4.id === extensionKey);
      if (index2 === -1) {
        allowList.push({
          ...extension,
          id: extensionKey
        });
      } else {
        allowList[index2].allowed = extension.allowed;
        if (extension.name && extension.name !== extensionKey && allowList[index2].name !== extension.name) {
          allowList[index2].name = extension.name;
        }
      }
    }
    const userManagedExtensions = allowList.filter((extension) => !extension.trusted);
    this._storageService.store(`${providerId}-${accountName}`, JSON.stringify(userManagedExtensions), -1 /* APPLICATION */, 0 /* USER */);
    this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
  }
  removeAllowedExtensions(providerId, accountName) {
    this._storageService.remove(`${providerId}-${accountName}`, -1 /* APPLICATION */);
    this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
  }
};

AuthenticationAccessService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IProductService)
], AuthenticationAccessService);

registerSingleton(IAuthenticationAccessService, AuthenticationAccessService, 1 /* Delayed */);
export { IAuthenticationAccessService, AuthenticationAccessService };
