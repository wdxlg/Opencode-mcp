// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxAgentHostContribution.ts
import { CLOUD_SANDBOX_AGENT_PROVIDER, CLOUD_SANDBOX_SESSION_SCHEME, CloudSandboxEnabledSettingId, ICloudSandboxAgentHostService, ICloudSandboxApiService, cloudSandboxAddress, isCloudSandboxEnabled } from "./module-3675.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { createCloudSandboxConnectionCustomization, isCloudSandboxConnectionAddress } from "./module-3687.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { Registry } from "./module-0090.mjs";
import { AgentSession } from "./module-1107.mjs";
import { CancellationError } from "./module-0004.mjs";
import { agentHostAuthority } from "./module-1001.mjs";
import { findRemoteAgentHostSessionTypeAuthority, remoteAgentHostSessionTypeId } from "./module-0959.mjs";
import { Event2 } from "./module-0017.mjs";
import { CloudSandboxReadOnlySessionHandler } from "./module-3676.mjs";
import { Codicon } from "./module-0085.mjs";
import { watchForIncompatibleNotifications } from "./module-3560.mjs";
import { CloudSandboxSessionsProvider } from "./module-3685.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentHostConnectionCustomizationService } from "./module-3686.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IAgentHostFilterService } from "./module-3520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxAgentHostContribution.ts
var LOG_PREFIX10 = "[CloudSandboxAgentHost]";

var SANDBOX_SESSION_SCHEME_ALIAS = {
  ui: CLOUD_SANDBOX_AGENT_PROVIDER,
  backend: CLOUD_SANDBOX_SESSION_SCHEME
};

var CLOUD_SANDBOX_HOST_GROUP = {
  id: "githubsandbox",
  label: localize(5086, null),
  order: 1,
  connectable: false
};

function discoveredSessionProject(repoName) {
  if (!repoName) {
    return void 0;
  }
  return { uri: URI.parse(`https://github.com/${repoName}`), displayName: repoName };
}

var CloudSandboxAgentHostContribution = class extends Disposable {
  constructor(_cloudSandboxService, _apiService, _remoteAgentHostService, _connectionCustomizations, _sessionsProvidersService, _agentHostFilterService, _configurationService, _authenticationService, _instantiationService, _notificationService, _chatSessionsService, _logService) {
    super();
    this._cloudSandboxService = _cloudSandboxService;
    this._apiService = _apiService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._connectionCustomizations = _connectionCustomizations;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._agentHostFilterService = _agentHostFilterService;
    this._configurationService = _configurationService;
    this._authenticationService = _authenticationService;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this._chatSessionsService = _chatSessionsService;
    this._logService = _logService;
    /** Provider instances keyed by connection address (`cloudsandbox:<envId>`). */
    this._providerInstances = /* @__PURE__ */ new Map();
    this._providerStores = this._register(new DisposableMap());
    /** Environment metadata keyed by connection address, for on-demand reconnect. */
    this._environments = /* @__PURE__ */ new Map();
    /** In-flight connects keyed by address, so concurrent opens share one attempt. */
    this._pendingConnects = /* @__PURE__ */ new Map();
    /**
     * Addresses being provisioned right now. A task we just created is not yet visible to a
     * discovery pass that started before it existed, so reconciliation would see a brand-new
     * environment as one that has vanished and tear it down mid-provision.
     */
    this._provisioning = /* @__PURE__ */ new Set();
    /**
     * Read-only content providers standing in for unreachable environments, keyed by session type.
     * Disposed when the environment becomes reachable again.
     */
    this._readOnlyHandlers = this._register(new DisposableMap());
    /** Live handler instances, so an already-open session can be settled read-only in place. */
    this._readOnlyInstances = /* @__PURE__ */ new Map();
    /**
     * Cancelled when the feature is disabled (or the contribution is disposed), so in-flight
     * discovery and connects abort instead of committing state after teardown has run.
     */
    this._enabledCts = new CancellationTokenSource();
    /** Whether discovery has completed at least once, used to stop the auth-driven retry. */
    this._hasDiscovered = false;
    /**
     * Keeps the "GitHub Sandboxes" filter entry present for as long as the feature is on, so the
     * place is visible and selectable before the user has any sandbox session to put in it.
     */
    this._hostGroupRegistration = this._register(new MutableDisposable());
    this._register(this._connectionCustomizations.register(
      isCloudSandboxConnectionAddress,
      (address) => createCloudSandboxConnectionCustomization(address, this._cloudSandboxService)
    ));
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => {
      for (const connection of this._remoteAgentHostService.connections) {
        if (RemoteAgentHostConnectionStatus.isConnected(connection.status)) {
          this._clearReadOnly(connection.address);
        }
      }
      this._wireConnections();
      this._updateConnectionStatuses();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(CloudSandboxEnabledSettingId) || e4.affectsConfiguration(RemoteAgentHostsEnabledSettingId)) {
        this._updateHostGroupRegistration();
        if (this._isEnabled()) {
          void this._discoverAndSeed();
        } else {
          this._teardownAll();
        }
      }
    }));
    this._updateHostGroupRegistration();
    this._register(this._agentHostFilterService.registerDiscoveryHandler(() => this._discoverAndSeed()));
    void this._discoverAndSeed();
    const retryUntilFirstSuccess = this._register(new DisposableStore());
    const retry2 = () => {
      if (this._hasDiscovered) {
        retryUntilFirstSuccess.clear();
        return;
      }
      void this._discoverAndSeed();
    };
    retryUntilFirstSuccess.add(this._authenticationService.onDidChangeSessions(retry2));
    retryUntilFirstSuccess.add(this._authenticationService.onDidRegisterAuthenticationProvider(retry2));
    this._register(toDisposable(() => {
      this._enabledCts.cancel();
      this._enabledCts.dispose();
    }));
    this._register(Registry.as("workbench.contrib.chatSessions.asyncActivation" /* AsyncActivation */).register({
      matchSessionType: (sessionType) => this._findAddressForSessionType(sessionType) !== void 0,
      waitForActivation: (_accessor, sessionType) => this._waitForActivation(sessionType)
    }));
  }
  static {
    this.ID = "workbench.contrib.cloudSandboxAgentHost";
  }
  /**
   * Discover environment-bound sandbox sessions and seed them into per-environment providers so
   * they appear in the sessions list **without** connecting. Reconciles against the result:
   * environments that have vanished from discovery (e.g. their task was archived) and are not
   * currently connected are torn down, so stale providers/sessions don't linger. Best-effort:
   * a failed discovery is logged and leaves existing state untouched.
   *
   * Runs are serialized, with at most one follow-up queued, so overlapping triggers can't
   * interleave their reconciliation passes.
   */
  _discoverAndSeed() {
    if (this._discoveryInFlight) {
      this._discoveryQueued ??= this._discoveryInFlight.then(() => {
        this._discoveryQueued = void 0;
        return this._discoverAndSeed();
      });
      return this._discoveryQueued;
    }
    this._discoveryInFlight = this._doDiscoverAndSeed().finally(() => {
      this._discoveryInFlight = void 0;
    });
    return this._discoveryInFlight;
  }
  async _doDiscoverAndSeed() {
    if (!this._isEnabled()) {
      return;
    }
    const token = this._enabledCts.token;
    let result;
    try {
      result = await this._apiService.listSessions(token);
    } catch (error) {
      result = { kind: "failed", reason: error instanceof Error ? error.message : String(error) };
    }
    if (result.kind === "failed") {
      this._logService.warn(`${LOG_PREFIX10} Discovery failed: ${result.reason}`);
      return;
    }
    if (token.isCancellationRequested || !this._isEnabled()) {
      return;
    }
    this._hasDiscovered = true;
    const present = /* @__PURE__ */ new Set();
    for (const session of result.sessions) {
      if (!session.environmentId || !session.sessionId) {
        continue;
      }
      const address = cloudSandboxAddress(session.environmentId);
      present.add(address);
      this._ensureProvider({ environmentId: session.environmentId, sessionId: session.sessionId, taskId: session.taskId, name: session.name });
      const provider = this._providerInstances.get(address);
      const parsed = session.updatedAt ? Date.parse(session.updatedAt) : Number.NaN;
      const modifiedTime = Number.isNaN(parsed) ? Date.now() : parsed;
      const project = discoveredSessionProject(session.repoName);
      const meta = {
        // Seed under the agent-provider (UI) scheme, preserving the session id: the host
        // lists the same id back, so this reconciles with `listSessions()` on connect.
        session: AgentSession.uri(CLOUD_SANDBOX_AGENT_PROVIDER, session.sessionId),
        startTime: modifiedTime,
        modifiedTime,
        summary: session.name,
        ...project ? { project } : {}
      };
      provider?.seedSessions([meta]);
    }
    if (result.kind === "complete") {
      for (const address of [...this._environments.keys()]) {
        if (present.has(address) || this._provisioning.has(address)) {
          continue;
        }
        const connected = this._remoteAgentHostService.connections.some((c) => c.address === address);
        if (!connected) {
          this._teardownEnvironment(address);
        }
      }
    }
    this._logService.info(`${LOG_PREFIX10} Seeded ${present.size} discovered sandbox environment(s)${result.kind === "partial" ? " (partial scan; kept existing entries)" : ""}.`);
  }
  /**
   * Remove the connection (and its credential refresher) for an environment while keeping the
   * provider and its cached sessions visible in a disconnected state. Disposing the protocol
   * client stops the soft-reconnect loop; the {@link CloudSandboxAgentHostService} prunes the
   * refresher via `onDidChangeConnections`.
   */
  async _disconnectEnvironment(address) {
    try {
      await this._remoteAgentHostService.removeRemoteAgentHost(address);
    } catch (error) {
      this._logService.warn(`${LOG_PREFIX10} Failed to disconnect ${address}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Provision a brand-new sandbox session and make it usable: create the Mission Control task,
   * seed it into a per-environment provider, and connect the relay.
   *
   * From the seed onward this matches {@link _doDiscoverAndSeed}, so a later discovery pass
   * reconciles against the session instead of duplicating it. The caller sends the first turn.
   */
  async provisionSession(request2, token) {
    if (!this._isEnabled()) {
      throw new Error("Copilot cloud sandbox connections are not enabled.");
    }
    const created = await this._apiService.createSession(request2, token);
    const name = request2.repoNwo ?? created.taskId;
    const address = cloudSandboxAddress(created.environmentId);
    if (!this._isEnabled() || token.isCancellationRequested) {
      throw new CancellationError();
    }
    this._provisioning.add(address);
    let seededProvider;
    try {
      this._ensureProvider({ environmentId: created.environmentId, sessionId: created.sessionId, taskId: created.taskId, name });
      const provider = this._providerInstances.get(address);
      if (!provider) {
        throw new Error(`No sessions provider was registered for sandbox environment ${created.environmentId}`);
      }
      const now = Date.now();
      const project = discoveredSessionProject(request2.repoNwo);
      provider.seedProvisionalSession({
        // Same identity discovery seeds under: Mission Control issues the session as
        // `ahp-session:/<id>` and the host lists that id back, so this reconciles on connect.
        session: AgentSession.uri(CLOUD_SANDBOX_AGENT_PROVIDER, created.sessionId),
        startTime: now,
        modifiedTime: now,
        summary: name,
        ...project ? { project } : {}
      });
      seededProvider = provider;
      await this.connect({ environmentId: created.environmentId, sessionId: created.sessionId, name });
      if (!this._isEnabled() || this._providerInstances.get(address) !== provider) {
        throw new CancellationError();
      }
      const session = provider.getCachedSession(created.sessionId);
      if (!session) {
        throw new Error(`Provisioned sandbox session ${created.sessionId} did not surface on its provider`);
      }
      return { ...created, provider, session };
    } catch (error) {
      if (seededProvider && this._providerInstances.get(address) === seededProvider) {
        seededProvider.publishWithheldSession(created.sessionId);
      }
      throw error;
    } finally {
      this._provisioning.delete(address);
    }
  }
  /**
   * Fully tear down an environment: dispose its provider (unregistering it and its sessions) and
   * remove its connection + credential refresher. Used when an environment vanishes from discovery
   * or the feature is disabled.
   */
  _teardownEnvironment(address) {
    this._environments.delete(address);
    this._pendingConnects.delete(address);
    this._providerStores.deleteAndDispose(address);
    this._clearReadOnly(address);
    void this._disconnectEnvironment(address);
  }
  /** Tear down every known sandbox environment (feature disabled). */
  _teardownAll() {
    this._enabledCts.cancel();
    this._enabledCts.dispose();
    this._enabledCts = new CancellationTokenSource();
    for (const address of [...this._environments.keys()]) {
      this._teardownEnvironment(address);
    }
  }
  /** Map each known sandbox connection authority to its address (`cloudsandbox:<envId>`). */
  _authoritiesByAddress() {
    const byAuthority = /* @__PURE__ */ new Map();
    for (const address of this._environments.keys()) {
      byAuthority.set(agentHostAuthority(address), address);
    }
    return byAuthority;
  }
  /** Resolve the sandbox address owning a remote-agent-host session type, if any. */
  _findAddressForSessionType(sessionType) {
    const byAuthority = this._authoritiesByAddress();
    const authority = findRemoteAgentHostSessionTypeAuthority(sessionType, byAuthority.keys());
    return authority ? byAuthority.get(authority) : void 0;
  }
  /**
   * Async-activation hook for a sandbox session type: establish the relay connection on demand,
   * then resolve once the host advertises the agent backing this session type (its content
   * provider is registered), so the chat can load. Returns false if the environment is unknown,
   * the connection fails, or the agent never appears.
   */
  async _waitForActivation(sessionType) {
    const address = this._findAddressForSessionType(sessionType);
    const env2 = address ? this._environments.get(address) : void 0;
    if (!address || !env2) {
      return false;
    }
    const connecting = this.connect({ environmentId: env2.environmentId, sessionId: env2.sessionId, name: env2.name });
    const connectOutcome = connecting.then(() => void 0, (error) => error ?? new Error("connect failed"));
    const prefetchedHistory = this._prefetchHistoryIfDormant(env2);
    if (prefetchedHistory) {
      const historyFirst = await Promise.race([
        connectOutcome.then(() => void 0),
        prefetchedHistory
      ]);
      if (historyFirst && this._isEnabled() && !this._enabledCts.token.isCancellationRequested) {
        this._logService.info(`${LOG_PREFIX10} History for ${address} arrived before the connect settled; opening it now.`);
        const opened = this._activateReadOnly(sessionType, address, env2, prefetchedHistory);
        void connectOutcome.then((connectError2) => {
          if (connectError2 !== void 0 && this._isEnabled() && !this._enabledCts.token.isCancellationRequested) {
            this._logService.info(`${LOG_PREFIX10} Connect for ${address} failed after the session opened; settling it read-only.`);
            this._settleReadOnly(sessionType, address);
          }
        });
        return opened;
      }
    }
    const connectError = await connectOutcome;
    if (connectError !== void 0) {
      this._logService.warn(`${LOG_PREFIX10} connect-on-open failed for ${address}: ${connectError instanceof Error ? connectError.message : String(connectError)}`);
      if (this._isEnabled() && !this._enabledCts.token.isCancellationRequested) {
        const opened = this._activateReadOnly(sessionType, address, env2, prefetchedHistory);
        if (opened) {
          this._settleReadOnly(sessionType, address);
        }
        return opened;
      }
      return false;
    }
    const authority = agentHostAuthority(address);
    while (true) {
      const connection = this._remoteAgentHostService.getConnection(address);
      if (!connection) {
        return false;
      }
      const rootState = connection.rootState.value;
      if (rootState instanceof Error) {
        return false;
      }
      if (rootState) {
        return rootState.agents.some((agent) => remoteAgentHostSessionTypeId(authority, agent.provider) === sessionType);
      }
      await Event2.toPromise(connection.rootState.onDidChange);
    }
  }
  /**
   * Persisted history for an environment that is not currently online, or `undefined` when it is
   * online, has no task, or the read failed.
   *
   * `status` cannot predict whether a dormant environment will wake — suspended and deleted both
   * read `offline` — but it does say cheaply that this open is on the slow path. Never rejects.
   */
  _prefetchHistoryIfDormant(env2) {
    const taskId = env2.taskId;
    if (!taskId) {
      return void 0;
    }
    const token = this._enabledCts.token;
    return (async () => {
      try {
        const record = await this._apiService.getEnvironment(env2.environmentId, token);
        if (record.status === "online") {
          return void 0;
        }
        this._logService.trace(`${LOG_PREFIX10} Environment ${env2.environmentId} is '${record.status}'; prefetching history in case the connect does not land.`);
        return await this._apiService.getSessionHistory(taskId, token);
      } catch (error) {
        this._logService.trace(`${LOG_PREFIX10} History prefetch for ${env2.environmentId} did not complete: ${error instanceof Error ? error.message : String(error)}`);
        return void 0;
      }
    })();
  }
  /**
   * Register a content provider that serves this session from replayed history.
   *
   * Deliberately does *not* mark the session read-only: this also runs while a connect is in
   * flight and the environment may yet wake — callers settle it via {@link _settleReadOnly}.
   * Returns `true` once registered, which is what lets `canResolveChatSession` proceed, or `false`
   * when there is no task to read history from.
   */
  _activateReadOnly(sessionType, address, env2, prefetchedHistory) {
    if (this._readOnlyHandlers.has(sessionType)) {
      return true;
    }
    if (this._chatSessionsService.getContentProviderSchemes().includes(sessionType)) {
      this._logService.trace(`${LOG_PREFIX10} ${sessionType} already has a content provider; leaving it to serve the session.`);
      return true;
    }
    if (!env2.taskId) {
      this._logService.warn(`${LOG_PREFIX10} No task id for ${address}; cannot serve history read-only.`);
      return false;
    }
    const store = new DisposableStore();
    const handler = store.add(this._instantiationService.createInstance(CloudSandboxReadOnlySessionHandler, {
      taskId: env2.taskId,
      // The live handler registers `agentId === sessionType`; matching it keeps replayed
      // history attributed to the same participant.
      agentId: sessionType,
      connectionAuthority: agentHostAuthority(address),
      prefetchedHistory
    }));
    store.add(this._chatSessionsService.registerChatSessionContentProvider(sessionType, handler));
    this._readOnlyHandlers.set(sessionType, store);
    this._readOnlyInstances.set(sessionType, handler);
    store.add(toDisposable(() => this._readOnlyInstances.delete(sessionType)));
    this._logService.info(`${LOG_PREFIX10} Serving ${sessionType} from Mission Control history.`);
    return true;
  }
  /**
   * Settle a history-backed session as read-only once the connect has failed. Sessions already on
   * screen observe this and disable their composer in place, without needing a reopen.
   */
  _settleReadOnly(sessionType, address) {
    const handler = this._readOnlyInstances.get(sessionType);
    if (!handler) {
      return;
    }
    handler.markReadOnly();
    this._providerInstances.get(address)?.setReadOnly(true);
  }
  /**
   * Drop any read-only stand-in for an address so the live handler can own the session type.
   * Registering two content providers for one session type throws, so this must run before a
   * connection is established rather than after.
   */
  _clearReadOnly(address) {
    this._providerInstances.get(address)?.setReadOnly(false);
    const authority = agentHostAuthority(address);
    for (const sessionType of [...this._readOnlyHandlers.keys()]) {
      if (findRemoteAgentHostSessionTypeAuthority(sessionType, [authority]) === authority) {
        this._readOnlyHandlers.deleteAndDispose(sessionType);
        this._logService.info(`${LOG_PREFIX10} Dropped read-only stand-in for ${sessionType}; the environment is reachable again.`);
      }
    }
  }
  /**
   * Ensure a provider exists for the environment and establish (or reuse) the
   * connection. Resolves with the connection's display address.
   */
  async connect(options3) {
    if (!this._isEnabled()) {
      throw new Error("Copilot cloud sandbox connections are not enabled.");
    }
    const address = cloudSandboxAddress(options3.environmentId);
    this._ensureProvider({ environmentId: options3.environmentId, sessionId: options3.sessionId, name: options3.name });
    const pending = this._pendingConnects.get(address);
    if (pending) {
      return pending;
    }
    const token = this._enabledCts.token;
    const attempt = (async () => {
      try {
        this._providerInstances.get(address)?.setConnectionStatus(RemoteAgentHostConnectionStatus.connecting);
        this._clearReadOnly(address);
        const result = await this._cloudSandboxService.connect(options3, token);
        if (token.isCancellationRequested || !this._isEnabled()) {
          void this._disconnectEnvironment(address);
          throw new CancellationError();
        }
        this._wireConnections();
        return result;
      } finally {
        this._pendingConnects.delete(address);
      }
    })();
    this._pendingConnects.set(address, attempt);
    return attempt;
  }
  _isEnabled() {
    return isCloudSandboxEnabled(this._configurationService);
  }
  /**
   * Keep the host filter entry in step with the feature toggles. The entry stands on its own —
   * it is there whether or not discovery has found any environment — so a user with the feature
   * on but no tasks yet can still see and select the place their sandboxes will appear in.
   */
  _updateHostGroupRegistration() {
    if (!this._isEnabled()) {
      this._hostGroupRegistration.clear();
    } else if (!this._hostGroupRegistration.value) {
      this._hostGroupRegistration.value = this._agentHostFilterService.registerHostGroup(CLOUD_SANDBOX_HOST_GROUP);
    }
  }
  /** Create the sessions provider for an environment if it doesn't exist yet. */
  _ensureProvider(env2) {
    const address = cloudSandboxAddress(env2.environmentId);
    const known = this._environments.get(address);
    this._environments.set(address, { ...known, ...env2, taskId: env2.taskId ?? known?.taskId });
    if (this._providerStores.has(address)) {
      return;
    }
    const store = new DisposableStore();
    const provider = this._instantiateProvider({
      address,
      name: env2.name,
      connectOnDemand: () => this.connect({ environmentId: env2.environmentId, sessionId: env2.sessionId, name: env2.name }).then(() => {
      }),
      sessionSchemeAlias: SANDBOX_SESSION_SCHEME_ALIAS,
      // The sandbox agent edits without committing, so `branch` is always empty.
      defaultChangesetKind: "session" /* Session */,
      // Each sandbox is its own provider named after its task, so the `[host]` suffix would
      // put every session in a workspace group of one.
      omitHostFromWorkspaceLabel: true,
      // A sandbox is a disposable remote environment, not a checkout on disk.
      workspaceTypeIcon: Codicon.package,
      hostGroup: CLOUD_SANDBOX_HOST_GROUP
    });
    store.add(provider);
    store.add(this._sessionsProvidersService.registerProvider(provider));
    store.add(watchForIncompatibleNotifications(provider, this._instantiationService, this._notificationService));
    this._providerInstances.set(address, provider);
    store.add(toDisposable(() => this._providerInstances.delete(address)));
    this._providerStores.set(address, store);
    this._logService.info(`${LOG_PREFIX10} Registered sessions provider for ${address}`);
  }
  /**
   * Provider construction seam so tests can observe each provider's configuration.
   */
  _instantiateProvider(config) {
    return this._instantiationService.createInstance(CloudSandboxSessionsProvider, config);
  }
  /** Wire each live connection to its provider so session enumeration runs. */
  _wireConnections() {
    for (const [address, provider] of this._providerInstances) {
      const connectionInfo = this._remoteAgentHostService.connections.find(
        (c) => c.address === address && RemoteAgentHostConnectionStatus.isConnected(c.status)
      );
      if (connectionInfo) {
        const connection = this._remoteAgentHostService.getConnection(address);
        if (connection) {
          provider.setConnection(connection, connectionInfo.defaultDirectory);
        }
      }
    }
  }
  /** Push the service's authoritative connection status onto each provider. */
  _updateConnectionStatuses() {
    for (const [address, provider] of this._providerInstances) {
      const connectionInfo = this._remoteAgentHostService.connections.find((c) => c.address === address);
      if (connectionInfo) {
        provider.setConnectionStatus(connectionInfo.status);
      } else if (!RemoteAgentHostConnectionStatus.isIncompatible(provider.connectionStatus.get())) {
        provider.setConnectionStatus(RemoteAgentHostConnectionStatus.disconnected);
      }
    }
  }
};

CloudSandboxAgentHostContribution = __decorateClass([
  __decorateParam(0, ICloudSandboxAgentHostService),
  __decorateParam(1, ICloudSandboxApiService),
  __decorateParam(2, IRemoteAgentHostService),
  __decorateParam(3, IRemoteAgentHostConnectionCustomizationService),
  __decorateParam(4, ISessionsProvidersService),
  __decorateParam(5, IAgentHostFilterService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IAuthenticationService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IChatSessionsService),
  __decorateParam(11, ILogService)
], CloudSandboxAgentHostContribution);
export { discoveredSessionProject, LOG_PREFIX10, SANDBOX_SESSION_SCHEME_ALIAS, CLOUD_SANDBOX_HOST_GROUP, CloudSandboxAgentHostContribution };
