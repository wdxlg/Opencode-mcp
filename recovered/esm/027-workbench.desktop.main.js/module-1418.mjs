// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationService.ts
import { isString } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { Disposable, DisposableMap, DisposableStore, isDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { equalsIgnoreCase, isFalsyOrWhitespace } from "./module-0030.mjs";
import { IAuthenticationService, isAuthenticationWwwAuthenticateRequest } from "./module-0951.mjs";
import { parseWWWAuthenticateHeader } from "./module-1417.mjs";
import { match } from "./module-0857.mjs";
import { raceCancellation, raceTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IAuthenticationAccessService } from "./module-0968.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/authentication/browser/authenticationService.ts
function getAuthenticationProviderActivationEvent(id2) {
  return `onAuthenticationRequest:${id2}`;
}

async function getCurrentAuthenticationSessionInfo(secretStorageService, productService) {
  const authenticationSessionValue = await secretStorageService.get(`${productService.urlProtocol}.loginAccount`);
  if (authenticationSessionValue) {
    try {
      const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
      if (authenticationSessionInfo && isString(authenticationSessionInfo.id) && isString(authenticationSessionInfo.accessToken) && isString(authenticationSessionInfo.providerId)) {
        return authenticationSessionInfo;
      }
    } catch (e) {
      console.error(`Failed parsing current auth session value: ${e}`);
    }
  }
  return void 0;
}

var authenticationDefinitionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
      description: localize(22742, null)
    },
    label: {
      type: "string",
      description: localize(22744, null)
    },
    authorizationServerGlobs: {
      type: "array",
      items: {
        type: "string",
        description: localize(22740, null)
      },
      description: localize(22741, null)
    }
  }
};

var authenticationExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "authentication",
  jsonSchema: {
    description: localize(22747, null),
    type: "array",
    items: authenticationDefinitionSchema
  },
  activationEventsGenerator: function* (authenticationProviders) {
    for (const authenticationProvider of authenticationProviders) {
      if (authenticationProvider.id) {
        yield `onAuthenticationRequest:${authenticationProvider.id}`;
      }
    }
  }
});

var AuthenticationService = class extends Disposable {
  constructor(_extensionService, authenticationAccessService, _environmentService, _logService) {
    super();
    this._extensionService = _extensionService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._onDidRegisterAuthenticationProvider = this._register(new Emitter());
    this.onDidRegisterAuthenticationProvider = this._onDidRegisterAuthenticationProvider.event;
    this._onDidUnregisterAuthenticationProvider = this._register(new Emitter());
    this.onDidUnregisterAuthenticationProvider = this._onDidUnregisterAuthenticationProvider.event;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._onDidChangeDeclaredProviders = this._register(new Emitter());
    this.onDidChangeDeclaredProviders = this._onDidChangeDeclaredProviders.event;
    this._authenticationProviders = /* @__PURE__ */ new Map();
    this._authenticationProviderDisposables = this._register(new DisposableMap());
    this._dynamicAuthenticationProviderIds = /* @__PURE__ */ new Set();
    this._delegates = [];
    this._disposedSource = new CancellationTokenSource();
    this._declaredProviders = [];
    this._register(toDisposable(() => this._disposedSource.dispose(true)));
    this._register(authenticationAccessService.onDidChangeExtensionSessionAccess((e) => {
      this._onDidChangeSessions.fire({
        providerId: e.providerId,
        label: e.accountName,
        event: {
          added: [],
          changed: [],
          removed: []
        }
      });
    }));
    this._registerEnvContributedAuthenticationProviders();
    this._registerAuthenticationExtensionPointHandler();
  }
  get declaredProviders() {
    return this._declaredProviders;
  }
  _registerEnvContributedAuthenticationProviders() {
    if (!this._environmentService.options?.authenticationProviders?.length) {
      return;
    }
    for (const provider of this._environmentService.options.authenticationProviders) {
      this.registerDeclaredAuthenticationProvider(provider);
      this.registerAuthenticationProvider(provider.id, provider);
    }
  }
  _registerAuthenticationExtensionPointHandler() {
    this._register(authenticationExtPoint.setHandler((_extensions, { added, removed }) => {
      this._logService.debug(`Found authentication providers. added: ${added.length}, removed: ${removed.length}`);
      added.forEach((point) => {
        for (const provider of point.value) {
          if (isFalsyOrWhitespace(provider.id)) {
            point.collector.error(localize(22745, null));
            continue;
          }
          if (isFalsyOrWhitespace(provider.label)) {
            point.collector.error(localize(22746, null));
            continue;
          }
          if (!this.declaredProviders.some((p) => p.id === provider.id)) {
            this.registerDeclaredAuthenticationProvider(provider);
            this._logService.debug(`Declared authentication provider: ${provider.id}`);
          } else {
            point.collector.error(localize(22743, null, provider.id));
          }
        }
      });
      const removedExtPoints = removed.flatMap((r2) => r2.value);
      removedExtPoints.forEach((point) => {
        const provider = this.declaredProviders.find((provider2) => provider2.id === point.id);
        if (provider) {
          this.unregisterDeclaredAuthenticationProvider(provider.id);
          this._logService.debug(`Undeclared authentication provider: ${provider.id}`);
        }
      });
    }));
  }
  registerDeclaredAuthenticationProvider(provider) {
    if (isFalsyOrWhitespace(provider.id)) {
      throw new Error(localize(22745, null));
    }
    if (isFalsyOrWhitespace(provider.label)) {
      throw new Error(localize(22746, null));
    }
    if (this.declaredProviders.some((p) => p.id === provider.id)) {
      throw new Error(localize(22743, null, provider.id));
    }
    this._declaredProviders.push(provider);
    this._onDidChangeDeclaredProviders.fire();
  }
  unregisterDeclaredAuthenticationProvider(id2) {
    const index2 = this.declaredProviders.findIndex((provider) => provider.id === id2);
    if (index2 > -1) {
      this.declaredProviders.splice(index2, 1);
    }
    this._onDidChangeDeclaredProviders.fire();
  }
  isAuthenticationProviderRegistered(id2) {
    return this._authenticationProviders.has(id2);
  }
  isDynamicAuthenticationProvider(id2) {
    return this._dynamicAuthenticationProviderIds.has(id2);
  }
  registerAuthenticationProvider(id2, authenticationProvider) {
    this._authenticationProviders.set(id2, authenticationProvider);
    const disposableStore = new DisposableStore();
    disposableStore.add(authenticationProvider.onDidChangeSessions((e) => this._onDidChangeSessions.fire({
      providerId: id2,
      label: authenticationProvider.label,
      event: e
    })));
    if (isDisposable(authenticationProvider)) {
      disposableStore.add(authenticationProvider);
    }
    this._authenticationProviderDisposables.set(id2, disposableStore);
    this._onDidRegisterAuthenticationProvider.fire({ id: id2, label: authenticationProvider.label });
  }
  unregisterAuthenticationProvider(id2) {
    const provider = this._authenticationProviders.get(id2);
    if (provider) {
      this._authenticationProviders.delete(id2);
      this._dynamicAuthenticationProviderIds.delete(id2);
      this._onDidUnregisterAuthenticationProvider.fire({ id: id2, label: provider.label });
    }
    this._authenticationProviderDisposables.deleteAndDispose(id2);
  }
  getProviderIds() {
    const providerIds = [];
    this._authenticationProviders.forEach((provider) => {
      providerIds.push(provider.id);
    });
    return providerIds;
  }
  getProvider(id2) {
    if (this._authenticationProviders.has(id2)) {
      return this._authenticationProviders.get(id2);
    }
    throw new Error(`No authentication provider '${id2}' is currently registered.`);
  }
  async getAccounts(id2) {
    const sessions = await this.getSessions(id2);
    const accounts = new Array();
    const seenAccounts = /* @__PURE__ */ new Set();
    for (const session of sessions) {
      if (!seenAccounts.has(session.account.label)) {
        seenAccounts.add(session.account.label);
        accounts.push(session.account);
      }
    }
    return accounts;
  }
  async getSessions(id2, scopeListOrRequest, options3, activateImmediate = false) {
    if (this._disposedSource.token.isCancellationRequested) {
      return [];
    }
    const authProvider = this._authenticationProviders.get(id2) || await this.tryActivateProvider(id2, activateImmediate);
    if (authProvider) {
      const server = options3?.authorizationServer;
      if (server) {
        if (!this.matchesProvider(authProvider, server)) {
          throw new Error(`The authentication provider '${id2}' does not support the authorization server '${server.toString(true)}'.`);
        }
      }
      if (isAuthenticationWwwAuthenticateRequest(scopeListOrRequest)) {
        if (!authProvider.getSessionsFromChallenges) {
          throw new Error(`The authentication provider '${id2}' does not support getting sessions from challenges.`);
        }
        return await authProvider.getSessionsFromChallenges(
          { challenges: parseWWWAuthenticateHeader(scopeListOrRequest.wwwAuthenticate), fallbackScopes: scopeListOrRequest.fallbackScopes },
          { ...options3 }
        );
      }
      return await authProvider.getSessions(scopeListOrRequest ? [...scopeListOrRequest] : void 0, { ...options3 });
    } else {
      throw new Error(`No authentication provider '${id2}' is currently registered.`);
    }
  }
  async createSession(id2, scopeListOrRequest, options3) {
    if (this._disposedSource.token.isCancellationRequested) {
      throw new Error("Authentication service is disposed.");
    }
    const authProvider = this._authenticationProviders.get(id2) || await this.tryActivateProvider(id2, !!options3?.activateImmediate);
    if (authProvider) {
      if (isAuthenticationWwwAuthenticateRequest(scopeListOrRequest)) {
        if (!authProvider.createSessionFromChallenges) {
          throw new Error(`The authentication provider '${id2}' does not support creating sessions from challenges.`);
        }
        return await authProvider.createSessionFromChallenges(
          { challenges: parseWWWAuthenticateHeader(scopeListOrRequest.wwwAuthenticate), fallbackScopes: scopeListOrRequest.fallbackScopes },
          { ...options3 }
        );
      }
      return await authProvider.createSession([...scopeListOrRequest], { ...options3 });
    } else {
      throw new Error(`No authentication provider '${id2}' is currently registered.`);
    }
  }
  async removeSession(id2, sessionId) {
    if (this._disposedSource.token.isCancellationRequested) {
      throw new Error("Authentication service is disposed.");
    }
    const authProvider = this._authenticationProviders.get(id2);
    if (authProvider) {
      return authProvider.removeSession(sessionId);
    } else {
      throw new Error(`No authentication provider '${id2}' is currently registered.`);
    }
  }
  async getOrActivateProviderIdForServer(authorizationServer, resourceServer) {
    for (const provider of this._authenticationProviders.values()) {
      if (this.matchesProvider(provider, authorizationServer, resourceServer)) {
        return provider.id;
      }
    }
    const authServerStr = authorizationServer.toString(true);
    const providers2 = this._declaredProviders.filter((p) => !this._authenticationProviders.has(p.id)).filter((p) => !!p.authorizationServerGlobs?.some((i2) => match(i2, authServerStr, { ignoreCase: true })));
    for (const provider of providers2) {
      const activeProvider = await this.tryActivateProvider(provider.id, true);
      if (this.matchesProvider(activeProvider, authorizationServer, resourceServer)) {
        return activeProvider.id;
      }
    }
    return void 0;
  }
  async createDynamicAuthenticationProvider(authorizationServer, serverMetadata, resource, clientId, clientSecret) {
    const delegate = this._delegates[0];
    if (!delegate) {
      this._logService.error("No authentication provider host delegate found");
      return void 0;
    }
    const providerId = await delegate.create(authorizationServer, serverMetadata, resource, clientId, clientSecret);
    const provider = this._authenticationProviders.get(providerId);
    if (provider) {
      this._logService.debug(`Created dynamic authentication provider: ${providerId}`);
      this._dynamicAuthenticationProviderIds.add(providerId);
      return provider;
    }
    this._logService.error(`Failed to create dynamic authentication provider: ${providerId}`);
    return void 0;
  }
  async createOrGetXaaProvider(issuer) {
    const providerId = `xaa:${issuer.toString(true)}`;
    if (this._authenticationProviders.has(providerId)) {
      return providerId;
    }
    const delegate = this._delegates.find((d) => !!d.createXaa);
    if (!delegate) {
      this._logService.error("No authentication provider host delegate supports XAA");
      return void 0;
    }
    const created = await delegate.createXaa(issuer);
    if (this._authenticationProviders.has(created)) {
      this._logService.debug(`Created XAA authentication provider: ${created}`);
      return created;
    }
    this._logService.error(`Failed to create XAA authentication provider for issuer: ${issuer.toString(true)}`);
    return void 0;
  }
  registerAuthenticationProviderHostDelegate(delegate) {
    this._delegates.push(delegate);
    this._delegates.sort((a, b) => b.priority - a.priority);
    return {
      dispose: () => {
        const index2 = this._delegates.indexOf(delegate);
        if (index2 !== -1) {
          this._delegates.splice(index2, 1);
        }
      }
    };
  }
  matchesProvider(provider, authorizationServer, resourceServer) {
    if (resourceServer && provider.resourceServer) {
      const resourceServerStr = resourceServer.toString(true);
      const providerResourceServerStr = provider.resourceServer.toString(true);
      if (!equalsIgnoreCase(providerResourceServerStr, resourceServerStr)) {
        return false;
      }
    }
    if (provider.authorizationServers) {
      const authServerStr = authorizationServer.toString(true);
      for (const server of provider.authorizationServers) {
        const str = server.toString(true);
        if (equalsIgnoreCase(str, authServerStr) || match(str, authServerStr, { ignoreCase: true })) {
          return true;
        }
      }
    }
    return false;
  }
  async tryActivateProvider(providerId, activateImmediate) {
    const store = new DisposableStore();
    try {
      const activationPromise = this._extensionService.activateByEvent(
        getAuthenticationProviderActivationEvent(providerId),
        activateImmediate ? 1 /* Immediate */ : 0 /* Normal */
      );
      let provider = this._authenticationProviders.get(providerId);
      if (provider) {
        return provider;
      }
      if (this._disposedSource.token.isCancellationRequested) {
        throw new Error("Authentication service is disposed.");
      }
      const providerRegistered = raceCancellation(
        Event2.toPromise(
          Event2.filter(
            this.onDidRegisterAuthenticationProvider,
            (e) => e.id === providerId,
            store
          ),
          store
        ),
        this._disposedSource.token
      );
      await Promise.race([activationPromise, providerRegistered]);
      provider = this._authenticationProviders.get(providerId);
      if (provider) {
        return provider;
      }
      const result = await raceTimeout(providerRegistered, 5e3);
      provider = this._authenticationProviders.get(providerId);
      if (provider) {
        return provider;
      }
      if (!result) {
        throw new Error(`Timed out waiting for authentication provider '${providerId}' to register.`);
      }
      throw new Error(`No authentication provider '${providerId}' is currently registered.`);
    } finally {
      store.dispose();
    }
  }
};

AuthenticationService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IAuthenticationAccessService),
  __decorateParam(2, IBrowserWorkbenchEnvironmentService),
  __decorateParam(3, ILogService)
], AuthenticationService);

registerSingleton(IAuthenticationService, AuthenticationService, 1 /* Delayed */);
export { getAuthenticationProviderActivationEvent, getCurrentAuthenticationSessionInfo, authenticationDefinitionSchema, authenticationExtPoint, AuthenticationService };
