// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadMcp.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { McpConnectionState, McpServerDefinition, McpServerLaunch, McpServerTrust, UserInteractionRequiredError, extensionPrefixedIdentifier, mcpOAuthClientSecretStorageKey } from "./module-1206.mjs";
import { RunOnceScheduler, disposableTimeout } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { observableValue } from "./module-0048.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { mcpEnterpriseManagedAuthIdpSection } from "./module-1421.mjs";
import { severity_default } from "./module-0266.mjs";
import { CancellationError } from "./module-0004.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IAuthenticationMcpService } from "./module-1451.mjs";
import { IAuthenticationMcpAccessService } from "./module-1448.mjs";
import { IAuthenticationMcpUsageService } from "./module-1450.mjs";
import { IDynamicAuthenticationProviderStorageService } from "./module-1419.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchMcpGatewayService } from "./module-1446.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISecretStorageService } from "./module-0948.mjs";
import { Emitter } from "./module-0017.mjs";
import { extensionHostKindToString } from "./module-1180.mjs";


// src/vs/workbench/api/browser/mainThreadMcp.ts
var MainThreadMcp = class extends Disposable {
  constructor(_extHostContext, _mcpRegistry, dialogService, _authenticationService, authenticationMcpServersService, authenticationMCPServerAccessService, authenticationMCPServerUsageService, _dynamicAuthenticationProviderStorageService, _extensionService, _contextKeyService, _telemetryService, _mcpGatewayService, _configurationService, _secretStorageService) {
    super();
    this._extHostContext = _extHostContext;
    this._mcpRegistry = _mcpRegistry;
    this.dialogService = dialogService;
    this._authenticationService = _authenticationService;
    this.authenticationMcpServersService = authenticationMcpServersService;
    this.authenticationMCPServerAccessService = authenticationMCPServerAccessService;
    this.authenticationMCPServerUsageService = authenticationMCPServerUsageService;
    this._dynamicAuthenticationProviderStorageService = _dynamicAuthenticationProviderStorageService;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._telemetryService = _telemetryService;
    this._mcpGatewayService = _mcpGatewayService;
    this._configurationService = _configurationService;
    this._secretStorageService = _secretStorageService;
    this._serverIdCounter = 0;
    this._servers = /* @__PURE__ */ new Map();
    this._serverDefinitions = /* @__PURE__ */ new Map();
    this._serverAuthTracking = new McpServerAuthTracker();
    this._collectionDefinitions = this._register(new DisposableMap());
    this._gateways = this._register(new DisposableMap());
    this._register(_authenticationService.onDidChangeSessions((e) => this._onDidChangeAuthSessions(e.providerId, e.label)));
    const proxy = this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostMcp);
    this._register(this._mcpRegistry.registerDelegate({
      // Prefer Node.js extension hosts when they're available. No CORS issues etc.
      priority: _extHostContext.extensionHostKind === 2 /* LocalWebWorker */ ? 0 : 1,
      waitForInitialProviderPromises() {
        return proxy.$waitForInitialCollectionProviders();
      },
      canStart(collection, serverDefinition) {
        if (collection.remoteAuthority !== _extHostContext.remoteAuthority) {
          return false;
        }
        if (serverDefinition.launch.type === 1 /* Stdio */ && _extHostContext.extensionHostKind === 2 /* LocalWebWorker */) {
          return false;
        }
        return true;
      },
      async substituteVariables(serverDefinition, launch) {
        const ser = await proxy.$substituteVariables(serverDefinition.variableReplacement?.folder?.uri, McpServerLaunch.toSerialized(launch));
        return McpServerLaunch.fromSerialized(ser);
      },
      start: (_collection, serverDefiniton, resolveLaunch, options3) => {
        const id2 = ++this._serverIdCounter;
        const launch = new ExtHostMcpServerLaunch(
          _extHostContext.extensionHostKind,
          () => proxy.$stopMcp(id2),
          (msg) => proxy.$sendMessage(id2, JSON.stringify(msg))
        );
        this._servers.set(id2, launch);
        this._serverDefinitions.set(id2, serverDefiniton);
        proxy.$startMcp(id2, {
          launch: resolveLaunch,
          defaultCwd: serverDefiniton.defaultCwd ?? serverDefiniton.variableReplacement?.folder?.uri,
          errorOnUserInteraction: options3?.errorOnUserInteraction
        });
        return launch;
      }
    }));
    const onDidChangeMcpServerDefinitionsTrigger = this._register(new RunOnceScheduler(() => this._publishServerDefinitions(), 500));
    this._register(autorun((reader) => {
      const collections = this._mcpRegistry.collections.read(reader);
      for (const collection of collections) {
        collection.serverDefinitions.read(reader);
      }
      if (!onDidChangeMcpServerDefinitionsTrigger.isScheduled()) {
        onDidChangeMcpServerDefinitionsTrigger.schedule();
      }
    }));
    onDidChangeMcpServerDefinitionsTrigger.schedule();
  }
  _publishServerDefinitions() {
    const collections = this._mcpRegistry.collections.get();
    const allServers = [];
    for (const collection of collections) {
      const servers = collection.serverDefinitions.get();
      for (const server of servers) {
        allServers.push(McpServerDefinition.toSerialized(server));
      }
    }
    this._proxy.$onDidChangeMcpServerDefinitions(allServers);
  }
  $upsertMcpCollection(collection, serversDto) {
    const servers = serversDto.map(McpServerDefinition.fromSerialized);
    const existing = this._collectionDefinitions.get(collection.id);
    if (existing) {
      existing.servers.set(servers, void 0);
    } else {
      const serverDefinitions = observableValue("mcpServers", servers);
      const extensionId = new ExtensionIdentifier(collection.extensionId);
      const store = new DisposableStore();
      const handle2 = store.add(new MutableDisposable());
      const register3 = () => {
        handle2.value ??= this._mcpRegistry.registerCollection({
          ...collection,
          provenance: "extension" /* Extension */,
          source: extensionId,
          order: 300 /* Extension */,
          resolveServerLanch: collection.canResolveLaunch ? (async (def2) => {
            const r2 = await this._proxy.$resolveMcpLaunch(collection.id, def2.label);
            return r2 ? McpServerLaunch.fromSerialized(r2) : void 0;
          }) : void 0,
          trustBehavior: collection.isTrustedByDefault ? McpServerTrust.Kind.Trusted : McpServerTrust.Kind.TrustedOnNonce,
          remoteAuthority: this._extHostContext.remoteAuthority,
          serverDefinitions
        });
      };
      const whenClauseStr = mapFindFirst(this._extensionService.extensions, (e) => ExtensionIdentifier.equals(extensionId, e.identifier) ? e.contributes?.mcpServerDefinitionProviders?.find((p) => extensionPrefixedIdentifier(extensionId, p.id) === collection.id)?.when : void 0);
      const whenClause = whenClauseStr && ContextKeyExpr.deserialize(whenClauseStr);
      if (!whenClause) {
        register3();
      } else {
        const evaluate = () => {
          if (this._contextKeyService.contextMatchesRules(whenClause)) {
            register3();
          } else {
            handle2.clear();
          }
        };
        store.add(this._contextKeyService.onDidChangeContext(evaluate));
        evaluate();
      }
      this._collectionDefinitions.set(collection.id, {
        servers: serverDefinitions,
        dispose: () => store.dispose()
      });
    }
  }
  $deleteMcpCollection(collectionId) {
    this._collectionDefinitions.deleteAndDispose(collectionId);
  }
  $onDidChangeState(id2, update) {
    const server = this._servers.get(id2);
    if (!server) {
      return;
    }
    server.state.set(update, void 0);
    if (!McpConnectionState.isRunning(update)) {
      server.dispose();
      this._servers.delete(id2);
      this._serverDefinitions.delete(id2);
      this._serverAuthTracking.untrack(id2);
    }
  }
  $onDidPublishLog(id2, level, log4) {
    if (typeof level === "string") {
      level = 3 /* Info */;
      log4 = level;
    }
    this._servers.get(id2)?.pushLog(level, log4);
  }
  $onDidReceiveMessage(id2, message) {
    this._servers.get(id2)?.pushMessage(message);
  }
  async $getTokenForProviderId(id2, providerId, scopes, options3 = {}) {
    const server = this._serverDefinitions.get(id2);
    if (!server) {
      return void 0;
    }
    return this._getSessionForProvider(id2, server, providerId, scopes, void 0, options3.errorOnUserInteraction, options3.clientId);
  }
  async $getTokenFromServerMetadata(id2, authDetails, { errorOnUserInteraction, forceNewRegistration, clientId } = {}) {
    const server = this._serverDefinitions.get(id2);
    if (!server) {
      return void 0;
    }
    const authorizationServer = URI.revive(authDetails.authorizationServer);
    const resourceServer = authDetails.resourceMetadata?.resource ? URI.parse(authDetails.resourceMetadata.resource) : void 0;
    const resolvedScopes = authDetails.scopes ?? authDetails.resourceMetadata?.scopes_supported ?? authDetails.authorizationServerMetadata.scopes_supported ?? [];
    if (authDetails.enterpriseManaged) {
      const resource = authDetails.resourceMetadata?.resource;
      if (!resource) {
        throw new Error(localize(5723, null, server.label));
      }
      const resourceAuthServers = authDetails.resourceMetadata?.authorization_servers ?? [];
      const audience = resourceAuthServers[0];
      if (!audience) {
        throw new Error(localize(5722, null, server.label));
      }
      const xaaScopes = authDetails.scopes ?? authDetails.resourceMetadata?.scopes_supported ?? [];
      const issuer = this._ensureXaaIssuer();
      const xaaProviderId = await this._authenticationService.createOrGetXaaProvider(issuer);
      if (!xaaProviderId) {
        return void 0;
      }
      const resourceClientId = clientId ?? authDetails.clientId;
      let resourceClientSecret;
      if (resourceClientId) {
        try {
          resourceClientSecret = await this._secretStorageService.get(mcpOAuthClientSecretStorageKey(resource, resourceClientId));
        } catch {
        }
      }
      return this._getSessionForProvider(id2, server, xaaProviderId, xaaScopes, issuer, errorOnUserInteraction, resourceClientId, resource, audience, resourceClientSecret);
    }
    let providerId = await this._authenticationService.getOrActivateProviderIdForServer(authorizationServer, resourceServer);
    const resolvedClientId = clientId ?? authDetails.clientId;
    const mcpServerUrl = server.launch.type === 2 /* HTTP */ ? server.launch.uri.toString(true) : void 0;
    let clientSecret;
    let didLookupClientSecret = false;
    if (resolvedClientId && mcpServerUrl) {
      try {
        clientSecret = await this._secretStorageService.get(mcpOAuthClientSecretStorageKey(mcpServerUrl, resolvedClientId));
        didLookupClientSecret = true;
      } catch {
      }
    }
    if (didLookupClientSecret && providerId && !forceNewRegistration && this._authenticationService.isDynamicAuthenticationProvider(providerId)) {
      const registered = await this._dynamicAuthenticationProviderStorageService.getClientRegistration(providerId);
      if (registered && registered.clientSecret !== clientSecret) {
        forceNewRegistration = true;
      }
    }
    if (forceNewRegistration && providerId) {
      if (!this._authenticationService.isDynamicAuthenticationProvider(providerId)) {
        throw new Error("Cannot force new registration for a non-dynamic authentication provider.");
      }
      this._authenticationService.unregisterAuthenticationProvider(providerId);
      await this._dynamicAuthenticationProviderStorageService.removeDynamicProvider(providerId);
      providerId = void 0;
    }
    if (!providerId) {
      const provider = await this._authenticationService.createDynamicAuthenticationProvider(authorizationServer, authDetails.authorizationServerMetadata, authDetails.resourceMetadata, resolvedClientId, clientSecret);
      if (!provider) {
        return void 0;
      }
      providerId = provider.id;
    }
    return this._getSessionForProvider(
      id2,
      server,
      providerId,
      resolvedScopes,
      authorizationServer,
      errorOnUserInteraction,
      resolvedClientId,
      authDetails.resourceMetadata?.resource,
      /* audience */
      void 0,
      clientSecret
    );
  }
  _ensureXaaIssuer() {
    const config = this._configurationService.getValue(mcpEnterpriseManagedAuthIdpSection) ?? {};
    const configuredIssuer = config.issuer?.trim();
    if (!configuredIssuer) {
      throw new Error(localize(5720, null));
    }
    let parsed;
    try {
      parsed = URI.parse(configuredIssuer);
    } catch {
      throw new Error(localize(5719, null, configuredIssuer));
    }
    if (parsed.scheme !== "https" && parsed.scheme !== "http") {
      throw new Error(localize(5721, null, configuredIssuer));
    }
    return parsed;
  }
  async _getSessionForProvider(serverId, server, providerId, scopes, authorizationServer, errorOnUserInteraction = false, clientId, resource, audience, clientSecret) {
    const authContext = { authorizationServer, clientId, resource, audience };
    const sessions = await this._authenticationService.getSessions(providerId, scopes, { authorizationServer, clientId, clientSecret, resource, audience }, true);
    if (server.launch.type !== 2 /* HTTP */) {
      return void 0;
    }
    const mcpServerUrl = server.launch.uri.toString(true);
    const accountNamePreference = this.authenticationMcpServersService.getAccountPreference(server.id, providerId);
    let matchingAccountPreferenceSession;
    if (accountNamePreference) {
      matchingAccountPreferenceSession = sessions.find((session2) => session2.account.label === accountNamePreference);
    }
    const provider = this._authenticationService.getProvider(providerId);
    let session;
    if (sessions.length) {
      if (matchingAccountPreferenceSession && this.authenticationMCPServerAccessService.isAccessAllowedForUrl(providerId, matchingAccountPreferenceSession.account.label, server.id, mcpServerUrl)) {
        this.authenticationMCPServerUsageService.addAccountUsage(providerId, matchingAccountPreferenceSession.account.label, scopes, server.id, server.label);
        this._serverAuthTracking.track(providerId, serverId, scopes, authContext);
        return matchingAccountPreferenceSession.accessToken;
      }
      if (!provider.supportsMultipleAccounts && this.authenticationMCPServerAccessService.isAccessAllowedForUrl(providerId, sessions[0].account.label, server.id, mcpServerUrl)) {
        this.authenticationMCPServerUsageService.addAccountUsage(providerId, sessions[0].account.label, scopes, server.id, server.label);
        this._serverAuthTracking.track(providerId, serverId, scopes, authContext);
        return sessions[0].accessToken;
      }
    }
    if (errorOnUserInteraction) {
      throw new UserInteractionRequiredError("authentication");
    }
    const isAllowed = await this.loginPrompt(server.label, provider.label, false);
    if (!isAllowed) {
      throw new Error("User did not consent to login.");
    }
    if (sessions.length) {
      if (provider.supportsMultipleAccounts && errorOnUserInteraction) {
        throw new UserInteractionRequiredError("authentication");
      }
      session = provider.supportsMultipleAccounts ? await this.authenticationMcpServersService.selectSession(providerId, server.id, server.label, scopes, sessions) : sessions[0];
    } else {
      if (errorOnUserInteraction) {
        throw new UserInteractionRequiredError("authentication");
      }
      const accountToCreate = matchingAccountPreferenceSession?.account;
      do {
        session = await this._authenticationService.createSession(
          providerId,
          scopes,
          {
            activateImmediate: true,
            account: accountToCreate,
            authorizationServer,
            clientId,
            clientSecret,
            resource,
            audience
          }
        );
      } while (accountToCreate && accountToCreate.label !== session.account.label && !await this.continueWithIncorrectAccountPrompt(session.account.label, accountToCreate.label));
    }
    this.authenticationMCPServerAccessService.updateAllowedMcpServers(providerId, session.account.label, [{ id: server.id, name: server.label, allowed: true, url: mcpServerUrl }]);
    this.authenticationMcpServersService.updateAccountPreference(server.id, providerId, session.account);
    this.authenticationMCPServerUsageService.addAccountUsage(providerId, session.account.label, scopes, server.id, server.label);
    this._serverAuthTracking.track(providerId, serverId, scopes, authContext);
    return session.accessToken;
  }
  async continueWithIncorrectAccountPrompt(chosenAccountLabel, requestedAccountLabel) {
    const result = await this.dialogService.prompt({
      message: localize(5715, null),
      detail: localize(5716, null, chosenAccountLabel, requestedAccountLabel),
      type: severity_default.Warning,
      cancelButton: true,
      buttons: [
        {
          label: localize(5717, null, chosenAccountLabel),
          run: () => chosenAccountLabel
        },
        {
          label: localize(5718, null, requestedAccountLabel),
          run: () => requestedAccountLabel
        }
      ]
    });
    if (!result.result) {
      throw new CancellationError();
    }
    return result.result === chosenAccountLabel;
  }
  async _onDidChangeAuthSessions(providerId, providerLabel) {
    const serversUsingProvider = this._serverAuthTracking.get(providerId);
    if (!serversUsingProvider) {
      return;
    }
    for (const { serverId, scopes, context: context2 } of serversUsingProvider) {
      const server = this._servers.get(serverId);
      const serverDefinition = this._serverDefinitions.get(serverId);
      if (!server || !serverDefinition) {
        continue;
      }
      const state = server.state.get();
      if (state.state !== McpConnectionState.Kind.Running) {
        continue;
      }
      try {
        await this._getSessionForProvider(serverId, serverDefinition, providerId, scopes, context2.authorizationServer, true, context2.clientId, context2.resource, context2.audience);
      } catch (e) {
        if (UserInteractionRequiredError.is(e)) {
          server.pushLog(4 /* Warning */, localize(5724, null, providerLabel));
          server.stop();
        }
      }
    }
  }
  $logMcpAuthSetup(data) {
    this._telemetryService.publicLog2("mcp/authSetup", data);
  }
  async $startMcpGateway(chatSessionResource) {
    const result = await this._mcpGatewayService.createGateway(
      this._extHostContext.extensionHostKind === 3 /* Remote */,
      chatSessionResource ? URI.revive(chatSessionResource) : void 0
    );
    if (!result) {
      return void 0;
    }
    if (this._store.isDisposed) {
      result.dispose();
      return void 0;
    }
    const gatewayId = generateUuid();
    const store = new DisposableStore();
    store.add(result);
    store.add(result.onDidChangeServers((servers) => {
      this._proxy.$onDidChangeGatewayServers(gatewayId, servers.map((s) => ({ label: s.label, address: s.address })));
    }));
    this._gateways.set(gatewayId, store);
    return {
      servers: result.servers.map((s) => ({ label: s.label, address: s.address })),
      gatewayId
    };
  }
  $disposeMcpGateway(gatewayId) {
    this._gateways.deleteAndDispose(gatewayId);
  }
  async loginPrompt(mcpLabel, providerLabel, recreatingSession) {
    const message = recreatingSession ? localize(5714, null, mcpLabel, providerLabel) : localize(5713, null, mcpLabel, providerLabel);
    const buttons = [
      {
        label: localize(5712, null),
        run() {
          return true;
        }
      }
    ];
    const { result } = await this.dialogService.prompt({
      type: severity_default.Info,
      message,
      buttons,
      cancelButton: true
    });
    return result ?? false;
  }
  dispose() {
    for (const server of this._servers.values()) {
      server.extHostDispose();
    }
    this._servers.clear();
    this._serverDefinitions.clear();
    this._serverAuthTracking.clear();
    super.dispose();
  }
};

MainThreadMcp = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadMcp),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, IAuthenticationMcpService),
  __decorateParam(5, IAuthenticationMcpAccessService),
  __decorateParam(6, IAuthenticationMcpUsageService),
  __decorateParam(7, IDynamicAuthenticationProviderStorageService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IWorkbenchMcpGatewayService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ISecretStorageService)
], MainThreadMcp);

var ExtHostMcpServerLaunch = class extends Disposable {
  constructor(extHostKind, stop, send) {
    super();
    this.stop = stop;
    this.send = send;
    this.state = observableValue("mcpServerState", { state: McpConnectionState.Kind.Starting });
    this._onDidLog = this._register(new Emitter());
    this.onDidLog = this._onDidLog.event;
    this._onDidReceiveMessage = this._register(new Emitter());
    this.onDidReceiveMessage = this._onDidReceiveMessage.event;
    this._register(disposableTimeout(() => {
      this.pushLog(3 /* Info */, `Starting server from ${extensionHostKindToString(extHostKind)} extension host`);
    }));
  }
  pushLog(level, message) {
    this._onDidLog.fire({ message, level });
  }
  pushMessage(message) {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      this.pushLog(4 /* Warning */, `Failed to parse message: ${JSON.stringify(message)}`);
    }
    if (parsed) {
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => this._onDidReceiveMessage.fire(p));
      } else {
        this._onDidReceiveMessage.fire(parsed);
      }
    }
  }
  extHostDispose() {
    if (McpConnectionState.isRunning(this.state.get())) {
      this.pushLog(4 /* Warning */, "Extension host shut down, server will stop.");
      this.state.set({ state: McpConnectionState.Kind.Stopped }, void 0);
    }
    this.dispose();
  }
  dispose() {
    if (McpConnectionState.isRunning(this.state.get())) {
      this.stop();
    }
    super.dispose();
  }
};

var McpServerAuthTracker = class {
  constructor() {
    // Provider ID -> Array of tracked servers (serverId, scopes, and the auth context to replay)
    this._tracking = /* @__PURE__ */ new Map();
  }
  /**
   * Track authentication for a server with a specific provider.
   * Replaces any existing tracking for this server/provider combination.
   */
  track(providerId, serverId, scopes, context2) {
    const servers = this._tracking.get(providerId) || [];
    const filtered = servers.filter((s) => s.serverId !== serverId);
    filtered.push({ serverId, scopes, context: context2 });
    this._tracking.set(providerId, filtered);
  }
  /**
   * Remove all authentication tracking for a server across all providers.
   */
  untrack(serverId) {
    for (const [providerId, servers] of this._tracking.entries()) {
      const filtered = servers.filter((s) => s.serverId !== serverId);
      if (filtered.length === 0) {
        this._tracking.delete(providerId);
      } else {
        this._tracking.set(providerId, filtered);
      }
    }
  }
  /**
   * Get all servers using a specific authentication provider.
   */
  get(providerId) {
    return this._tracking.get(providerId);
  }
  /**
   * Clear all tracking data.
   */
  clear() {
    this._tracking.clear();
  }
};
export { MainThreadMcp, ExtHostMcpServerLaunch, McpServerAuthTracker };
