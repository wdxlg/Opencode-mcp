// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostProviderService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0010.mjs";
import { observableValue } from "./module-0064.mjs";
import { Emitter } from "./module-0016.mjs";
import { AgentSession } from "./module-0048.mjs";
import { parseMcpChannelUri } from "./module-0163.mjs";
import { Promises } from "./module-0027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostAuthenticationController } from "./module-0201.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostProviderService.ts
var IAgentHostProviderService = createDecorator("agentHostProviderService");

var AgentHostProviderService = class extends Disposable {
  constructor(_authenticationController, _logService) {
    super();
    this._authenticationController = _authenticationController;
    this._logService = _logService;
    this._providerRegistrations = this._register(new DisposableMap());
    this._providers = this._register(new DisposableMap());
    this._sessionToProvider = /* @__PURE__ */ new Map();
    this._agents = observableValue(this, []);
    this.agents = this._agents;
    this._onDidRegisterProvider = this._register(new Emitter());
    this.onDidRegisterProvider = this._onDidRegisterProvider.event;
    this._onMcpNotification = this._register(new Emitter());
    this.onMcpNotification = this._onMcpNotification.event;
    this._providerInitializers = /* @__PURE__ */ new Set();
    this._authenticationReplays = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => this._providerInitializers.clear()));
  }
  registerProviderInitializer(initializer) {
    if (this._providers.size > 0) {
      throw new Error("Provider initializers must be registered before providers");
    }
    this._providerInitializers.add(initializer);
    return toDisposable(() => this._providerInitializers.delete(initializer));
  }
  registerProvider(provider) {
    if (this._shutdownPromise) {
      throw new Error("Cannot register an agent provider after shutdown has started");
    }
    if (this._providers.has(provider.id)) {
      throw new Error(`Agent provider already registered: ${provider.id}`);
    }
    this._logService.info(`Registering agent provider: ${provider.id}`);
    const registrations = new DisposableStore();
    const previousDefaultProvider = this._defaultProvider;
    try {
      if (provider.onMcpNotification) {
        registrations.add(provider.onMcpNotification((event) => this._onMcpNotification.fire(event)));
      }
      this._providers.set(provider.id, provider);
      this._providerRegistrations.set(provider.id, registrations);
      for (const initializer of this._providerInitializers) {
        registrations.add(initializer(provider));
      }
      if (!this._defaultProvider) {
        this._defaultProvider = provider.id;
      }
      this._agents.set([...this._providers.values()], void 0);
    } catch (error) {
      this._providerRegistrations.deleteAndDispose(provider.id);
      this._providers.deleteAndDispose(provider.id);
      this._defaultProvider = previousDefaultProvider;
      throw error;
    }
    this._onDidRegisterProvider.fire(provider);
    const replay = this._authenticationController.replay(provider).catch((error) => this._logService.error(error, `[AgentHostProviderService] Failed to replay authentication for provider '${provider.id}'`));
    this._authenticationReplays.set(provider.id, replay);
    void replay.then(() => {
      if (this._authenticationReplays.get(provider.id) === replay) {
        this._authenticationReplays.delete(provider.id);
      }
    });
  }
  resolveProvider(provider) {
    return provider ? this._providers.get(provider) : this._defaultProvider ? this._providers.get(this._defaultProvider) : void 0;
  }
  getProvider(provider) {
    return this._providers.get(provider);
  }
  getProviderForSession(session) {
    const key = typeof session === "string" ? session : session.toString();
    const associatedProvider = this._sessionToProvider.get(key);
    if (associatedProvider) {
      return this._providers.get(associatedProvider);
    }
    const schemeProvider = AgentSession.provider(session);
    if (schemeProvider) {
      return this._providers.get(schemeProvider);
    }
    return this._defaultProvider ? this._providers.get(this._defaultProvider) : void 0;
  }
  getProviders() {
    return [...this._providers.values()];
  }
  associateSession(session, provider) {
    this._sessionToProvider.set(typeof session === "string" ? session : session.toString(), provider);
  }
  releaseSession(session, expectedProvider) {
    const key = typeof session === "string" ? session : session.toString();
    if (expectedProvider !== void 0 && this._sessionToProvider.get(key) !== expectedProvider) {
      return;
    }
    this._sessionToProvider.delete(key);
  }
  authenticate(params) {
    return this._authenticationController.authenticate(params, this._providers.values());
  }
  async handleMcpRequest(channel, method, params) {
    const route = parseMcpChannelUri(channel);
    if (!route) {
      throw new Error(`Method not found: invalid mcp:// channel ${channel}`);
    }
    const provider = this._providers.get(route.providerId);
    if (!provider?.handleMcpRequest) {
      throw new Error(`Method not found: no provider for mcp:// channel ${channel}`);
    }
    return provider.handleMcpRequest(route.chatUri, route.serverName, method, params);
  }
  async getNetworkDiagnostics() {
    const providers = this.getProviders();
    const [contributions, accounts] = await Promise.all([
      Promise.all(providers.map(async (provider) => {
        try {
          return await provider.getNetworkDiagnosticsEndpoints?.() ?? [];
        } catch (error) {
          this._logService.warn(`[AgentHostProviderService] Failed to resolve network diagnostics endpoints for ${provider.id}: ${error instanceof Error ? error.message : String(error)}`);
          return [];
        }
      })),
      Promise.all(providers.map(async (provider) => {
        try {
          return await provider.getNetworkDiagnosticsAccount?.();
        } catch (error) {
          this._logService.warn(`[AgentHostProviderService] Failed to resolve network diagnostics account for ${provider.id}: ${error instanceof Error ? error.message : String(error)}`);
          return void 0;
        }
      }))
    ]);
    const endpoints = [];
    const seen = /* @__PURE__ */ new Set();
    for (const endpoint of contributions.flat()) {
      let key;
      try {
        key = new URL(endpoint.url).toString();
      } catch {
        key = endpoint.url;
      }
      if (!seen.has(key)) {
        seen.add(key);
        endpoints.push(endpoint);
      }
    }
    return { endpoints, account: accounts.find((account) => !!account) };
  }
  async getManagedSettingsDiagnostics() {
    const providers = this.getProviders().filter((provider) => provider.getManagedSettingsDiagnostics);
    return Promise.all(providers.map(async (provider) => {
      try {
        return { provider: provider.id, snapshot: await provider.getManagedSettingsDiagnostics() };
      } catch (error) {
        return { provider: provider.id, error: error instanceof Error ? error.message : String(error) };
      }
    }));
  }
  shutdown() {
    return this._shutdownPromise ??= this._shutdown();
  }
  async _shutdown() {
    try {
      await Promises.settled([...this._authenticationReplays.values()]);
      await Promises.settled([...this._providers.values()].map((provider) => provider.shutdown()));
    } finally {
      this._sessionToProvider.clear();
    }
  }
};

AgentHostProviderService = __decorateClass([
  __decorateParam(0, IAgentHostAuthenticationController),
  __decorateParam(1, ILogService)
], AgentHostProviderService);
export { IAgentHostProviderService, AgentHostProviderService };
