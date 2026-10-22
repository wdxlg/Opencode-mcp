// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSettingsShared.ts
import { AbstractAgentHostConfigFileSystemProvider, AbstractAgentHostConfigSchemaRegistrar } from "./module-4323.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ILogService } from "./module-0095.mjs";
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSettingsShared.ts
var AbstractSessionsAgentHostConfigFileSystemProvider = class extends AbstractAgentHostConfigFileSystemProvider {
  constructor(_sessionsProvidersService, logService) {
    super(logService);
    this._sessionsProvidersService = _sessionsProvidersService;
  }
  _resolveTarget(ctx) {
    return this._lookupProvider(ctx.providerId);
  }
  _missingTargetError(ctx) {
    return createFileSystemProviderError(`Unknown agent host provider: ${ctx.providerId}`, "EntryNotFound" /* FileNotFound */);
  }
  _lookupProvider(providerId) {
    const provider = this._sessionsProvidersService.getProvider(providerId);
    if (!provider || !isAgentHostProvider(provider)) {
      return void 0;
    }
    return provider;
  }
};

AbstractSessionsAgentHostConfigFileSystemProvider = __decorateClass([
  __decorateParam(0, ISessionsProvidersService),
  __decorateParam(1, ILogService)
], AbstractSessionsAgentHostConfigFileSystemProvider);

var AbstractMultiProviderAgentHostConfigSchemaRegistrar = class extends AbstractAgentHostConfigSchemaRegistrar {
  constructor(_sessionsProvidersService) {
    super();
    this._sessionsProvidersService = _sessionsProvidersService;
    /** Per-provider subscriptions. */
    this._providerSubscriptions = this._register(new DisposableMap());
    for (const provider of this._sessionsProvidersService.getProviders()) {
      this._onProviderAdded(provider);
    }
    this._register(this._sessionsProvidersService.onDidChangeProviders((e4) => {
      for (const provider of e4.added) {
        this._onProviderAdded(provider);
      }
      for (const provider of e4.removed) {
        this._providerSubscriptions.deleteAndDispose(provider.id);
      }
    }));
  }
  // ---- Internal -----------------------------------------------------------
  _onProviderAdded(provider) {
    if (!isAgentHostProvider(provider)) {
      return;
    }
    const store = new DisposableStore();
    store.add(this._observeProvider(
      provider,
      (target) => {
        if (!this._isRegistered(target)) {
          return;
        }
        this._refreshSchema(target);
      },
      (target) => this._disposeSchemaForTarget(target)
    ));
    store.add(toDisposable(() => {
      for (const target of this._targetsForProvider(provider)) {
        this._disposeSchemaForTarget(target);
      }
    }));
    this._providerSubscriptions.set(provider.id, store);
  }
};

AbstractMultiProviderAgentHostConfigSchemaRegistrar = __decorateClass([
  __decorateParam(0, ISessionsProvidersService)
], AbstractMultiProviderAgentHostConfigSchemaRegistrar);
export { AbstractSessionsAgentHostConfigFileSystemProvider, AbstractMultiProviderAgentHostConfigSchemaRegistrar };
