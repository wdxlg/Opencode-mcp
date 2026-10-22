// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/dynamicAuthenticationProviderStorageService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Queue } from "./module-0036.mjs";
import { isAuthorizationTokenResponse } from "./module-1416.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISecretStorageService } from "./module-0949.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IDynamicAuthenticationProviderStorageService } from "./module-1418.mjs";


// src/vs/workbench/services/authentication/browser/dynamicAuthenticationProviderStorageService.ts
var DynamicAuthenticationProviderStorageService = class extends Disposable {
  constructor(storageService, secretStorageService, logService) {
    super();
    this.storageService = storageService;
    this.secretStorageService = secretStorageService;
    this.logService = logService;
    this._onDidChangeTokens = this._register(new Emitter());
    this.onDidChangeTokens = this._onDidChangeTokens.event;
    const queue = new Queue();
    this._register(this.secretStorageService.onDidChangeSecret(async (key3) => {
      let payload;
      try {
        payload = JSON.parse(key3);
      } catch (error) {
      }
      if (payload?.isDynamicAuthProvider) {
        void queue.queue(async () => {
          const tokens = await this.getSessionsForDynamicAuthProvider(payload.authProviderId, payload.clientId);
          this._onDidChangeTokens.fire({
            authProviderId: payload.authProviderId,
            clientId: payload.clientId,
            tokens
          });
        });
      }
    }));
  }
  static {
    this.PROVIDERS_STORAGE_KEY = "dynamicAuthProviders";
  }
  async getClientRegistration(providerId) {
    const key3 = `dynamicAuthProvider:clientRegistration:${providerId}`;
    const credentialsValue = await this.secretStorageService.get(key3);
    if (credentialsValue) {
      try {
        const credentials = JSON.parse(credentialsValue);
        if (credentials && (credentials.clientId || credentials.clientSecret)) {
          return credentials;
        }
      } catch {
        await this.secretStorageService.delete(key3);
      }
    }
    const providers2 = this._getStoredProviders();
    const provider = providers2.find((p) => p.providerId === providerId);
    return provider?.clientId ? { clientId: provider.clientId } : void 0;
  }
  getClientId(providerId) {
    const providers2 = this._getStoredProviders();
    const provider = providers2.find((p) => p.providerId === providerId);
    return provider?.clientId;
  }
  async storeClientRegistration(providerId, authorizationServer, clientId, clientSecret, label3) {
    this._trackProvider(providerId, authorizationServer, clientId, label3);
    const key3 = `dynamicAuthProvider:clientRegistration:${providerId}`;
    const credentials = { clientId, clientSecret };
    await this.secretStorageService.set(key3, JSON.stringify(credentials));
  }
  _trackProvider(providerId, authorizationServer, clientId, label3) {
    const providers2 = this._getStoredProviders();
    const existingProviderIndex = providers2.findIndex((p) => p.providerId === providerId);
    if (existingProviderIndex === -1) {
      const newProvider = {
        providerId,
        label: label3 || providerId,
        // Use provided label or providerId as default
        authorizationServer,
        clientId
      };
      providers2.push(newProvider);
      this._storeProviders(providers2);
    } else {
      const existingProvider = providers2[existingProviderIndex];
      const updatedProvider = {
        providerId,
        label: label3 || existingProvider.label,
        authorizationServer,
        clientId
      };
      providers2[existingProviderIndex] = updatedProvider;
      this._storeProviders(providers2);
    }
  }
  _getStoredProviders() {
    const stored = this.storageService.get(DynamicAuthenticationProviderStorageService.PROVIDERS_STORAGE_KEY, -1 /* APPLICATION */, "[]");
    try {
      const providerInfos = JSON.parse(stored);
      for (const providerInfo of providerInfos) {
        if (!providerInfo.authorizationServer) {
          providerInfo.authorizationServer = providerInfo.issuer;
        }
      }
      return providerInfos;
    } catch {
      return [];
    }
  }
  _storeProviders(providers2) {
    this.storageService.store(
      DynamicAuthenticationProviderStorageService.PROVIDERS_STORAGE_KEY,
      JSON.stringify(providers2),
      -1 /* APPLICATION */,
      1 /* MACHINE */
    );
  }
  getInteractedProviders() {
    return this._getStoredProviders();
  }
  async removeDynamicProvider(providerId) {
    const providers2 = this._getStoredProviders();
    const providerInfo = providers2.find((p) => p.providerId === providerId);
    const filteredProviders = providers2.filter((p) => p.providerId !== providerId);
    this._storeProviders(filteredProviders);
    if (providerInfo) {
      const secretKey = JSON.stringify({ isDynamicAuthProvider: true, authProviderId: providerId, clientId: providerInfo.clientId });
      await this.secretStorageService.delete(secretKey);
    }
    const credentialsKey = `dynamicAuthProvider:clientRegistration:${providerId}`;
    await this.secretStorageService.delete(credentialsKey);
  }
  async getSessionsForDynamicAuthProvider(authProviderId, clientId) {
    const key3 = JSON.stringify({ isDynamicAuthProvider: true, authProviderId, clientId });
    const value2 = await this.secretStorageService.get(key3);
    if (value2) {
      const parsed = JSON.parse(value2);
      if (!Array.isArray(parsed) || !parsed.every((t2) => typeof t2.created_at === "number" && isAuthorizationTokenResponse(t2))) {
        this.logService.error(`Invalid session data for ${authProviderId} (${clientId}) in secret storage:`, parsed);
        await this.secretStorageService.delete(key3);
        return void 0;
      }
      return parsed;
    }
    return void 0;
  }
  async setSessionsForDynamicAuthProvider(authProviderId, clientId, sessions) {
    const key3 = JSON.stringify({ isDynamicAuthProvider: true, authProviderId, clientId });
    const value2 = JSON.stringify(sessions);
    await this.secretStorageService.set(key3, value2);
    this.logService.trace(`Set session data for ${authProviderId} (${clientId}) in secret storage:`, sessions);
  }
};

DynamicAuthenticationProviderStorageService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ISecretStorageService),
  __decorateParam(2, ILogService)
], DynamicAuthenticationProviderStorageService);

registerSingleton(IDynamicAuthenticationProviderStorageService, DynamicAuthenticationProviderStorageService, 1 /* Delayed */);
export { DynamicAuthenticationProviderStorageService };
