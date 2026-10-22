// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHost.contribution.ts
import { Registry } from "./module-0090.mjs";
import { findRemoteAgentHostSessionTypeAuthority, isRemoteAgentHostSessionType, remoteAgentHostSessionTypeId } from "./module-0959.mjs";
import { IRemoteAgentHostService, RemoteAgentHostAutoConnectSettingId, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId, RemoteAgentHostsSettingId, getEntryAddress } from "./module-1736.mjs";
import { agentHostAuthority } from "./module-1001.mjs";
import { Event2 } from "./module-0017.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { IntervalTimer, disposableTimeout } from "./module-0036.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { ISSHRemoteAgentHostService, computeSSHConnectionKey, isSSHHostKeyDeniedError } from "./module-1779.mjs";
import { AgentHostAuthTokenCache, AgentHostAuthenticationRecovery, authenticateProtectedResources, resolveAuthenticationInteractively } from "./module-1762.mjs";
import { RemoteAgentHostSessionsProvider } from "./module-3684.mjs";
import { watchForIncompatibleNotifications } from "./module-3560.mjs";
import { StopWatch } from "./module-0016.mjs";
import { categorizeSSHConnectError, logSSHConnectAttempt, logTerminalRecovery } from "./module-1781.mjs";
import { PROTOCOL_VERSION } from "./module-1780.mjs";
import { RemoteAgentHostLogForwarder } from "./module-4258.mjs";
import { AgentHostLanguageModelProvider, agentHostProviderSupportsAutoModel } from "./module-4250.mjs";
import { RemoteAgentPluginController, createRemoteAgentHarnessDescriptor } from "./module-4256.mjs";
import { AgentCustomizationItemProvider } from "./module-4265.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { AgentHostSessionHandler } from "./module-4254.mjs";
import { NotificationType } from "./module-1744.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostFileSystemService2 } from "./module-1757.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { IAgentHostTerminalService } from "./module-3090.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IAgentHostActiveClientService } from "./module-1759.mjs";
import { IRemoteAgentHostConnectionCustomizationService, RemoteAgentHostConnectionCustomizationService } from "./module-3686.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { OpenAgentHostStateFileAction2 } from "./module-4248.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { CloudSandboxEnabledSettingId } from "./module-3675.mjs";
import { TunnelAgentHostsSettingId } from "./module-1734.mjs";
import { AgentHostLocalFilePermissionsSettingId } from "./module-1729.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHost.contribution.ts
Registry.as("workbench.contrib.chatSessions.asyncActivation" /* AsyncActivation */).register({
  matchSessionType: (sessionType) => isRemoteAgentHostSessionType(sessionType),
  waitForActivation: waitForRemoteAgentHostActivation
});

async function waitForRemoteAgentHostActivation(accessor, sessionType) {
  const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
  const address = getAddressForSessionType(sessionType, remoteAgentHostService);
  if (!address) {
    return false;
  }
  while (true) {
    const connection = remoteAgentHostService.getConnection(address);
    if (connection) {
      const rootState = connection.rootState.value;
      if (rootState instanceof Error) {
        return false;
      }
      if (rootState) {
        const authority = agentHostAuthority(address);
        return rootState.agents.some((agent) => remoteAgentHostSessionTypeId(authority, agent.provider) === sessionType);
      }
      await Promise.race([
        Event2.toPromise(connection.rootState.onDidChange),
        Event2.toPromise(remoteAgentHostService.onDidChangeConnections)
      ]);
      continue;
    }
    const connectionInfo = remoteAgentHostService.connections.find((connection2) => connection2.address === address);
    if (connectionInfo && !RemoteAgentHostConnectionStatus.isConnecting(connectionInfo.status) && !RemoteAgentHostConnectionStatus.isReconnecting(connectionInfo.status)) {
      return false;
    }
    if (!connectionInfo && !remoteAgentHostService.configuredEntries.some((entry) => getEntryAddress(entry) === address)) {
      return false;
    }
    await Event2.toPromise(remoteAgentHostService.onDidChangeConnections);
  }
}

function getAddressForSessionType(sessionType, remoteAgentHostService) {
  const authorities = /* @__PURE__ */ new Map();
  for (const connection of remoteAgentHostService.connections) {
    authorities.set(agentHostAuthority(connection.address), connection.address);
  }
  for (const entry of remoteAgentHostService.configuredEntries) {
    const address = getEntryAddress(entry);
    authorities.set(agentHostAuthority(address), address);
  }
  const authority = findRemoteAgentHostSessionTypeAuthority(sessionType, authorities.keys());
  return authority ? authorities.get(authority) : void 0;
}

var SSH_RECONNECT_PERIODIC_INTERVAL_MS = 6e4;

var SSHReconnectState = class extends Disposable {
  constructor() {
    super(...arguments);
    this._timer = this._register(new MutableDisposable());
    /** Consecutive failed reconnect attempts. */
    this.attempts = 0;
    /** True after a reconnect was paused until something resumes it. */
    this.paused = false;
    /** Wall-clock timestamp when {@link paused} was last set to true. */
    this.pausedAt = 0;
    /** Whether only an explicit user reconnect should resume this state. */
    this.requiresUserInitiatedResume = false;
  }
  get hasPendingTimer() {
    return !!this._timer.value;
  }
  scheduleRetry(delayMs, handler) {
    this._timer.value = disposableTimeout(() => {
      this._timer.value = void 0;
      handler();
    }, delayMs);
  }
  cancelTimer() {
    this._timer.clear();
  }
  resetForResume() {
    this.attempts = 0;
    this.paused = false;
    this._timer.clear();
    this.requiresUserInitiatedResume = false;
  }
  resumeAutomatically() {
    if (!this.paused || this.requiresUserInitiatedResume) {
      return false;
    }
    this.resetForResume();
    return true;
  }
};

function shouldPauseSSHReconnectAfterFailure(err) {
  return isCancellationError(err) || isSSHHostKeyDeniedError(err);
}

function sshConnectionKey(connection) {
  return connection.sshConfigHost ? `ssh:${connection.sshConfigHost}` : `${connection.user ?? connection.hostName}@${connection.hostName}:${connection.port ?? 22}`;
}

async function disconnectSSHEntry(connection, remoteAgentHostService, sshService) {
  await remoteAgentHostService.removeRemoteAgentHost(connection.address);
  await sshService.disconnect(sshConnectionKey(connection));
}

var ConnectionState = class extends Disposable {
  constructor(name, connection) {
    super();
    this.name = name;
    this.connection = connection;
    this.store = this._register(new DisposableStore());
    this.agents = this._register(new DisposableMap());
    this.modelProviders = /* @__PURE__ */ new Map();
    /** Dedupes redundant `authenticate` RPCs when the resolved token hasn't changed. */
    this.authTokenCache = new AgentHostAuthTokenCache();
    this.authRecovery = new AgentHostAuthenticationRecovery();
  }
};

var RemoteAgentHostContribution = class extends Disposable {
  constructor(_remoteAgentHostService, _chatSessionsService, _languageModelsService, _logService, _instantiationService, _authenticationService, _defaultAccountService, _notificationService, _sessionsProvidersService, _configurationService, _agentHostFileSystemService, _sshService, _customizationHarnessService, _agentHostTerminalService, _telemetryService, _activeClientService, _connectionCustomizations) {
    super();
    this._remoteAgentHostService = _remoteAgentHostService;
    this._chatSessionsService = _chatSessionsService;
    this._languageModelsService = _languageModelsService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._authenticationService = _authenticationService;
    this._defaultAccountService = _defaultAccountService;
    this._notificationService = _notificationService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._configurationService = _configurationService;
    this._agentHostFileSystemService = _agentHostFileSystemService;
    this._sshService = _sshService;
    this._customizationHarnessService = _customizationHarnessService;
    this._agentHostTerminalService = _agentHostTerminalService;
    this._telemetryService = _telemetryService;
    this._activeClientService = _activeClientService;
    this._connectionCustomizations = _connectionCustomizations;
    /** Per-connection state: client state + per-agent registrations. */
    this._connections = this._register(new DisposableMap());
    /** Per-address sessions provider, registered for all configured entries. */
    this._providerStores = this._register(new DisposableMap());
    this._providerInstances = /* @__PURE__ */ new Map();
    /**
     * In-flight reconnect attempts keyed by host id (`sshConfigHost` for SSH,
     * `distro` for WSL). Stores the {@link _attemptManagedReconnect} promise
     * so concurrent user requests join the existing attempt rather than racing it.
     */
    this._pendingSSHReconnects = /* @__PURE__ */ new Map();
    /** Per-host SSH reconnect state (timer + attempts + paused). */
    this._sshReconnectStates = this._register(new DisposableMap());
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(RemoteAgentHostsSettingId) || e4.affectsConfiguration(RemoteAgentHostsEnabledSettingId)) {
        this._resumeSSHReconnects();
        this._reconcile();
      }
    }));
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => {
      this._resumeSSHReconnects();
      this._reconcile();
    }));
    this._register(this._defaultAccountService.onDidChangeDefaultAccount(() => this._authenticateAllConnections()));
    this._register(this._authenticationService.onDidChangeSessions(() => this._authenticateAllConnections()));
    this._reconcile();
    this._register(new IntervalTimer()).cancelAndSet(
      () => {
        this._logService.trace("[RemoteAgentHost] Periodic reconcile (backstop)");
        this._reconcile();
      },
      SSH_RECONNECT_PERIODIC_INTERVAL_MS
    );
  }
  static {
    this.ID = "sessions.contrib.remoteAgentHostContribution";
  }
  _reconcile() {
    this._reconcileProviders();
    this._reconcileConnections();
    for (const [address, connState] of this._connections) {
      const connectionInfo = this._remoteAgentHostService.connections.find((c) => c.address === address);
      const provider = this._providerInstances.get(address);
      if (provider) {
        provider.setConnection(connState.connection, connectionInfo?.defaultDirectory);
      }
    }
    for (const [address, provider] of this._providerInstances) {
      const connectionInfo = this._remoteAgentHostService.connections.find((c) => c.address === address);
      if (connectionInfo) {
        provider.setConnectionStatus(connectionInfo.status);
      } else if (!RemoteAgentHostConnectionStatus.isIncompatible(provider.connectionStatus.get())) {
        provider.setConnectionStatus(RemoteAgentHostConnectionStatus.disconnected);
      }
    }
  }
  _reconcileProviders() {
    const enabled = this._configurationService.getValue(RemoteAgentHostsEnabledSettingId);
    const entries2 = enabled ? this._remoteAgentHostService.configuredEntries : [];
    const desiredAddresses = new Set(entries2.map((e4) => getEntryAddress(e4)));
    for (const [address] of this._providerStores) {
      if (!desiredAddresses.has(address)) {
        this._providerStores.deleteAndDispose(address);
      }
    }
    for (const entry of entries2) {
      const address = getEntryAddress(entry);
      const existing = this._providerInstances.get(address);
      if (existing && existing.label !== (entry.name || address)) {
        this._providerStores.deleteAndDispose(address);
      }
      if (!this._providerStores.has(address)) {
        this._createProvider(entry);
      }
    }
  }
  _createProvider(entry) {
    const address = getEntryAddress(entry);
    const sshConnection = entry.connection.type === "ssh" /* SSH */ ? entry.connection : void 0;
    let connectOnDemand;
    let disconnectOnDemand;
    let preferenceKey;
    if (sshConnection) {
      connectOnDemand = () => this._connectSSHOnDemand(sshConnection, entry.name, address);
      disconnectOnDemand = () => this._disconnectSSHOnDemand(sshConnection);
      preferenceKey = computeSSHConnectionKey({
        sshConfigHost: sshConnection.sshConfigHost,
        username: sshConnection.user,
        host: sshConnection.hostName,
        port: sshConnection.port
      });
    }
    const store = new DisposableStore();
    const provider = this._instantiationService.createInstance(
      RemoteAgentHostSessionsProvider,
      { address, name: entry.name, connectOnDemand, disconnectOnDemand, preferenceKey }
    );
    store.add(provider);
    store.add(this._sessionsProvidersService.registerProvider(provider));
    store.add(watchForIncompatibleNotifications(provider, this._instantiationService, this._notificationService));
    this._providerInstances.set(address, provider);
    store.add(toDisposable(() => this._providerInstances.delete(address)));
    this._providerStores.set(address, store);
  }
  async _connectSSHOnDemand(connection, name, address) {
    const sshConfigHost = connection.sshConfigHost;
    if (!sshConfigHost) {
      const stopwatch = StopWatch.create(false);
      try {
        await this._sshService.connect({
          host: connection.hostName,
          port: connection.port,
          username: connection.user ?? connection.hostName,
          authMethod: "agent" /* Agent */,
          name,
          userInitiated: true
        });
        logSSHConnectAttempt(this._telemetryService, {
          operation: "connect",
          userInitiated: true,
          attempt: 1,
          durationMs: stopwatch.elapsed(),
          success: true,
          willRetry: false
        });
      } catch (err) {
        logSSHConnectAttempt(this._telemetryService, {
          operation: "connect",
          userInitiated: true,
          attempt: 1,
          durationMs: stopwatch.elapsed(),
          success: false,
          willRetry: false,
          errorCategory: categorizeSSHConnectError(err)
        });
        throw err;
      }
      return;
    }
    if (this._pendingSSHReconnects.has(sshConfigHost)) {
      await this._pendingSSHReconnects.get(sshConfigHost).catch(() => void 0);
      return;
    }
    this._sshReconnectStates.get(sshConfigHost)?.resetForResume();
    await this._attemptSSHReconnect(sshConfigHost, name, address, { userInitiated: true });
  }
  async _disconnectSSHOnDemand(connection) {
    if (connection.sshConfigHost) {
      this._sshReconnectStates.deleteAndDispose(connection.sshConfigHost);
    }
    await disconnectSSHEntry(connection, this._remoteAgentHostService, this._sshService);
  }
  async _attemptSSHReconnect(sshConfigHost, name, address, options3 = {}) {
    await this._attemptManagedReconnect({
      kind: "SSH",
      key: sshConfigHost,
      address,
      userInitiated: !!options3.userInitiated,
      shouldPause: shouldPauseSSHReconnectAfterFailure,
      pending: this._pendingSSHReconnects,
      states: this._sshReconnectStates,
      getOrCreateState: (key3) => this._getOrCreateSSHReconnectState(key3),
      doConnect: async () => {
        this._remoteAgentHostService.reconnect(address, !!options3.userInitiated);
        await this._remoteAgentHostService.waitForConnection(address);
      }
    });
  }
  _getOrCreateSSHReconnectState(sshConfigHost) {
    let state = this._sshReconnectStates.get(sshConfigHost);
    if (!state) {
      state = new SSHReconnectState();
      this._sshReconnectStates.set(sshConfigHost, state);
    }
    return state;
  }
  /**
   * Reset paused SSH reconnect state after a fresh external trigger.
   */
  _resumeSSHReconnects() {
    let resumed = 0;
    for (const [, state] of this._sshReconnectStates) {
      if (state.resumeAutomatically()) {
        resumed++;
      }
    }
    if (resumed > 0) {
      this._logService.info(`[RemoteAgentHost] Reset SSH reconnect state for ${resumed} paused host(s)`);
    }
  }
  /**
   * Shared retry-loop body for SSH managed-reconnect entries.
   *
   * Handles `connecting`/`reconnecting`/`disconnected`/`incompatible` provider status,
   * cached-session unpublishing on failure, pause-on-cancel, and
   * pause-after-max-attempts. An optional pre-check can bail out without
   * incrementing the attempt counter (returns `{ skip: true }`).
   */
  async _attemptManagedReconnect(opts) {
    const runPromise = (async () => {
      const live = this._remoteAgentHostService.connections.find((connection) => connection.address === opts.address);
      if (!opts.userInitiated && RemoteAgentHostConnectionStatus.isConnecting(live?.status)) {
        return;
      }
      if (!opts.userInitiated && RemoteAgentHostConnectionStatus.isReconnecting(live?.status)) {
        this._sshReconnectStates.get(opts.key)?.cancelTimer();
        return;
      }
      const state = opts.getOrCreateState(opts.key);
      const attempt = state.attempts;
      const provider = this._providerInstances.get(opts.address);
      const stopwatch = StopWatch.create(false);
      if (opts.userInitiated) {
        provider?.setConnectionStatus(RemoteAgentHostConnectionStatus.connecting);
      }
      this._logService.info(`[RemoteAgentHost] Re-establishing ${opts.kind} connection for ${opts.key} (attempt ${attempt + 1})`);
      try {
        if (opts.preCheck) {
          const result = await opts.preCheck(opts.userInitiated);
          if (result?.skip) {
            if (result.reason) {
              this._logService.info(`[RemoteAgentHost] ${opts.kind} reconnect for ${opts.key}: ${result.reason}; skipping`);
            }
            return;
          }
        }
        await opts.doConnect();
        logSSHConnectAttempt(this._telemetryService, {
          operation: "reconnect",
          userInitiated: opts.userInitiated,
          attempt: attempt + 1,
          durationMs: stopwatch.elapsed(),
          success: true,
          willRetry: false
        });
        opts.states.deleteAndDispose(opts.key);
        this._logService.info(`[RemoteAgentHost] ${opts.kind} connection re-established for ${opts.key}`);
      } catch (err) {
        const enabled = this._configurationService.getValue(RemoteAgentHostsEnabledSettingId);
        const pause = opts.shouldPause(err);
        const incompatible = RemoteAgentHostConnectionStatus.fromConnectError(err, [PROTOCOL_VERSION]);
        logSSHConnectAttempt(this._telemetryService, {
          operation: "reconnect",
          userInitiated: opts.userInitiated,
          attempt: attempt + 1,
          durationMs: stopwatch.elapsed(),
          success: false,
          willRetry: false,
          errorCategory: categorizeSSHConnectError(err)
        });
        if (!enabled) {
          opts.states.deleteAndDispose(opts.key);
          return;
        }
        if (opts.userInitiated) {
          provider?.setConnectionStatus(RemoteAgentHostConnectionStatus.disconnected);
        }
        if (pause) {
          const requiresUserInitiatedResume = isSSHHostKeyDeniedError(err);
          this._logService.info(`[RemoteAgentHost] Pausing ${opts.kind} reconnect for ${opts.key} after ${requiresUserInitiatedResume ? "host key denial" : "user cancellation"}`);
          provider?.unpublishCachedSessions();
          const liveState = opts.getOrCreateState(opts.key);
          liveState.paused = true;
          liveState.pausedAt = Date.now();
          liveState.requiresUserInitiatedResume = requiresUserInitiatedResume;
          return;
        }
        this._logService.error(`[RemoteAgentHost] ${opts.kind} reconnect failed for ${opts.key}`, err);
        if (incompatible) {
          provider?.setConnectionStatus(incompatible);
          opts.states.deleteAndDispose(opts.key);
          return;
        }
        provider?.unpublishCachedSessions();
        return;
      }
    })();
    opts.pending.set(opts.key, runPromise);
    try {
      await runPromise;
    } finally {
      opts.pending.delete(opts.key);
    }
  }
  _reconcileConnections() {
    const currentConnections = this._remoteAgentHostService.connections;
    const connectedAddresses = new Set(
      currentConnections.filter((c) => RemoteAgentHostConnectionStatus.isConnected(c.status)).map((c) => c.address)
    );
    const allAddresses = new Set(currentConnections.map((c) => c.address));
    for (const [address] of this._connections) {
      if (!allAddresses.has(address)) {
        this._logService.info(`[RemoteAgentHost] Removing contribution for ${address}`);
        this._providerInstances.get(address)?.clearConnection();
        this._connections.deleteAndDispose(address);
      } else if (!connectedAddresses.has(address)) {
      }
    }
    for (const connectionInfo of currentConnections) {
      if (!RemoteAgentHostConnectionStatus.isConnected(connectionInfo.status)) {
        continue;
      }
      const existing = this._connections.get(connectionInfo.address);
      if (existing) {
        const nameChanged = existing.name !== connectionInfo.name;
        const clientIdChanged = existing.connection.clientId !== connectionInfo.clientId;
        if (nameChanged || clientIdChanged) {
          this._logService.info(`[RemoteAgentHost] Reconnecting contribution for ${connectionInfo.address}: oldClientId=${existing.connection.clientId}, newClientId=${connectionInfo.clientId}, nameChanged=${nameChanged}`);
          const oldClientId = existing.connection.clientId;
          this._connections.deleteAndDispose(connectionInfo.address);
          this._setupConnection(connectionInfo);
          if (clientIdChanged) {
            const newConnection = this._remoteAgentHostService.getConnection(connectionInfo.address);
            if (newConnection) {
              this._agentHostTerminalService.reconnectTerminals(newConnection, oldClientId).then(
                ({ recovered, total }) => {
                  if (total > 0) {
                    this._logService.info(`[RemoteAgentHost] Terminal reconnection: ${recovered}/${total} recovered`);
                    logTerminalRecovery(this._telemetryService, { recoveredCount: recovered, totalCount: total });
                  }
                },
                (err) => this._logService.warn("[RemoteAgentHost] Terminal reconnection failed", err)
              );
            }
          }
        }
      } else {
        this._setupConnection(connectionInfo);
      }
    }
  }
  _setupConnection(connectionInfo) {
    const connection = this._remoteAgentHostService.getConnection(connectionInfo.address);
    if (!connection) {
      return;
    }
    const { address, name } = connectionInfo;
    const connState = this._instantiationService.createInstance(ConnectionState, name, connection);
    this._connections.set(address, connState);
    const store = connState.store;
    store.add(this._instantiationService.createInstance(
      RemoteAgentHostLogForwarder,
      connection,
      address,
      name || address
    ));
    const authority = agentHostAuthority(address);
    store.add(this._agentHostFileSystemService.registerAuthority(authority, connection));
    store.add(connection.rootState.onDidChange((rootState) => {
      this._handleRootStateChange(address, connection, rootState);
    }));
    store.add(connection.onDidNotification((notification) => this._handleAuthenticationRequiredNotification(address, connection, notification)));
    const initialRootState = connection.rootState.value;
    if (initialRootState && !(initialRootState instanceof Error)) {
      this._handleRootStateChange(address, connection, initialRootState);
    }
    const provider = this._providerInstances.get(address);
    if (provider) {
      provider.setConnection(connection, connectionInfo.defaultDirectory);
    }
  }
  _handleRootStateChange(address, connection, rootState) {
    const connState = this._connections.get(address);
    if (!connState) {
      return;
    }
    const incoming = new Set(rootState.agents.map((a) => a.provider));
    for (const [provider] of connState.agents) {
      if (!incoming.has(provider)) {
        connState.agents.deleteAndDispose(provider);
        connState.modelProviders.delete(provider);
      }
    }
    this._authenticateWithConnection(address, connection, rootState.agents).catch(() => {
    });
    for (const agent of rootState.agents) {
      if (!connState.agents.has(agent.provider)) {
        this._registerAgent(address, connection, agent, connState.name);
      } else {
        const modelProvider = connState.modelProviders.get(agent.provider);
        modelProvider?.updateModels(agent.models);
      }
    }
  }
  _registerAgent(address, connection, agent, configuredName) {
    const connState = this._connections.get(address);
    if (!connState) {
      return;
    }
    const agentStore = new DisposableStore();
    connState.agents.set(agent.provider, agentStore);
    connState.store.add(agentStore);
    const sanitized = agentHostAuthority(address);
    const providerId = `agenthost-${sanitized}`;
    const sessionType = remoteAgentHostSessionTypeId(sanitized, agent.provider);
    const agentId = sessionType;
    const vendor = sessionType;
    const hostLabel = configuredName || address;
    const agentLabel = agent.displayName?.trim() || agent.provider;
    const displayName = `${agentLabel} [${hostLabel}]`;
    const sessionWorkingDirs = /* @__PURE__ */ new Map();
    agentStore.add(toDisposable(() => sessionWorkingDirs.clear()));
    const resolveWorkingDirectory = (sessionResource) => {
      const resourceKey = sessionResource.toString();
      const cached = sessionWorkingDirs.get(resourceKey);
      if (cached) {
        return cached;
      }
      const provider = this._sessionsProvidersService.getProvider(providerId);
      const session = provider?.getSessionByResource(sessionResource);
      const workingDirectory = session?.workspace.get()?.folders[0]?.workingDirectory;
      if (workingDirectory) {
        sessionWorkingDirs.set(resourceKey, workingDirectory);
        return workingDirectory;
      }
      return void 0;
    };
    const isNewSession2 = (sessionResource) => {
      const provider = this._sessionsProvidersService.getProvider(providerId);
      return provider?.getSessionByResource(sessionResource)?.status.get() === 0 /* Untitled */;
    };
    agentStore.add(this._chatSessionsService.registerChatSessionContribution({
      type: sessionType,
      name: agentId,
      displayName,
      description: agent.description,
      canDelegate: true,
      requiresCustomModels: true,
      supportsAutoModel: agentHostProviderSupportsAutoModel(agent.provider),
      agentHostProviderId: agent.provider,
      supportsDelegation: true,
      capabilities: {
        supportsCheckpoints: true,
        supportsPromptAttachments: true,
        supportsImageAttachments: true,
        get terminalCommandPrefix() {
          return connection.initializeResult.get()?.terminalCommandPrefix;
        }
      }
    }));
    const pluginController = agentStore.add(this._instantiationService.createInstance(
      RemoteAgentPluginController,
      hostLabel,
      sanitized,
      connection
    ));
    const syncProvider = this._activeClientService.getSyncProvider(sessionType);
    const ambientScope = agentStore.add(this._activeClientService.acquireScope(sessionType, []));
    const itemProvider = agentStore.add(this._instantiationService.createInstance(
      AgentCustomizationItemProvider,
      sanitized,
      (customization, clientId) => {
        if (clientId !== void 0) {
          return void 0;
        }
        return [{
          id: "remoteAgentHost.removeConfiguredPlugin",
          label: localize(5113, null),
          icon: Codicon.trash,
          run: () => pluginController.removeConfiguredPlugin(customization)
        }];
      },
      (syncedUri) => this._activeClientService.getOrigin(syncedUri)
    ));
    itemProvider.setDraftCustomAgents(ambientScope.customAgents);
    itemProvider.setDraftCustomizations(ambientScope.customizations);
    const harnessDescriptor = createRemoteAgentHarnessDescriptor(sessionType, displayName, pluginController, itemProvider, syncProvider);
    agentStore.add(this._customizationHarnessService.registerExternalHarness(harnessDescriptor));
    const sessionHandler = agentStore.add(this._instantiationService.createInstance(
      AgentHostSessionHandler,
      {
        provider: agent.provider,
        backendSessionScheme: this._connectionCustomizations.get(address)?.backendSessionScheme?.(agent.provider),
        agentId,
        sessionType,
        fullName: displayName,
        description: agent.description,
        connection,
        connectionAuthority: sanitized,
        extensionId: "vscode.remote-agent-host",
        extensionDisplayName: "Remote Agent Host",
        resolveWorkingDirectory,
        isNewSession: isNewSession2,
        resolveAuthentication: (resources) => this._resolveAuthenticationInteractively(address, connection, resources)
      }
    ));
    agentStore.add(this._chatSessionsService.registerChatSessionContentProvider(sessionType, sessionHandler));
    const vendorDescriptor = { vendor, displayName, configuration: void 0, managementCommand: void 0, when: void 0 };
    this._languageModelsService.deltaLanguageModelChatProviderDescriptors([vendorDescriptor], []);
    agentStore.add(toDisposable(() => this._languageModelsService.deltaLanguageModelChatProviderDescriptors([], [vendorDescriptor])));
    const modelProvider = agentStore.add(new AgentHostLanguageModelProvider(sessionType, vendor));
    connState.modelProviders.set(agent.provider, modelProvider);
    agentStore.add(toDisposable(() => connState.modelProviders.delete(agent.provider)));
    agentStore.add(this._languageModelsService.registerLanguageModelProvider(vendor, modelProvider));
    modelProvider.updateModels(agent.models);
    this._logService.info(`[RemoteAgentHost] Registered agent ${agent.provider} from ${address} as ${sessionType}`);
  }
  _authenticateAllConnections() {
    for (const [address, connState] of this._connections) {
      const rootState = connState.connection.rootState.value;
      if (rootState && !(rootState instanceof Error)) {
        this._authenticateWithConnection(address, connState.connection, rootState.agents).catch(() => {
        });
      }
    }
  }
  /**
   * Authenticate using protectedResources from agent info in root state.
   * Resolves tokens via the standard VS Code authentication service.
   *
   * Marks the matching provider's `authenticationPending` observable while
   * the auth pass is in flight so that sessions surface as still loading.
   */
  async _authenticateWithConnection(address, connection, agents) {
    const providerId = `agenthost-${agentHostAuthority(address)}`;
    const provider = this._sessionsProvidersService.getProvider(providerId);
    const authTokenCache = this._connections.get(address)?.authTokenCache;
    provider?.setAuthenticationPending(true);
    try {
      await this._instantiationService.invokeFunction(authenticateProtectedResources, agents, {
        authTokenCache,
        logPrefix: "[RemoteAgentHost]",
        authenticate: this._authenticateCallback(address, connection)
      });
    } catch (err) {
      this._logService.error("[RemoteAgentHost] Failed to authenticate with connection", err);
    } finally {
      provider?.setAuthenticationPending(false);
    }
  }
  _handleAuthenticationRequiredNotification(address, connection, notification) {
    if (notification.type !== NotificationType.AuthRequired) {
      return;
    }
    this._authenticateNotificationResource(address, connection, notification.resource);
  }
  _authenticateNotificationResource(address, connection, protectedResource) {
    const connState = this._connections.get(address);
    if (!connState) {
      return;
    }
    const providerId = `agenthost-${agentHostAuthority(address)}`;
    const provider = this._sessionsProvidersService.getProvider(providerId);
    provider?.setAuthenticationPending(true);
    this._instantiationService.invokeFunction((accessor) => connState.authRecovery.recover(accessor, protectedResource, {
      authTokenCache: connState.authTokenCache,
      logPrefix: "[RemoteAgentHost]",
      authenticate: this._authenticateCallback(address, connection)
    })).catch((err) => {
      this._logService.error(`[RemoteAgentHost] Failed to authenticate notified resource ${protectedResource.resource}`, err);
    }).finally(() => {
      provider?.setAuthenticationPending(false);
    });
  }
  /**
   * Build the `authenticate` callback for a connection. Host-agnostic by default (forwards the
   * request unchanged); a connection kind may inject a token transform via
   * {@link IRemoteAgentHostConnectionCustomizationService} — e.g. cloud sandbox connections, whose
   * host rejects plaintext bearers over the relay (`-32602`) and requires a Mission-Control-sealed
   * envelope. The transform owns fail-closed validation, so a raw token can never reach the host.
   */
  _authenticateCallback(address, connection) {
    const transform2 = this._connectionCustomizations.get(address)?.authenticate;
    if (!transform2) {
      return (request2) => connection.authenticate(request2);
    }
    return async (request2) => connection.authenticate(await transform2(request2));
  }
  /**
   * Interactively prompt the user to authenticate when the user starts a session.
   * Returns true if authentication succeeded.
   */
  async _resolveAuthenticationInteractively(address, connection, protectedResources) {
    const authTokenCache = this._connections.get(address)?.authTokenCache;
    return this._instantiationService.invokeFunction(resolveAuthenticationInteractively, protectedResources, {
      authTokenCache,
      logPrefix: "[RemoteAgentHost]",
      authenticate: this._authenticateCallback(address, connection)
    });
  }
};

RemoteAgentHostContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentHostService),
  __decorateParam(1, IChatSessionsService),
  __decorateParam(2, ILanguageModelsService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IAuthenticationService),
  __decorateParam(6, IDefaultAccountService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, ISessionsProvidersService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IAgentHostFileSystemService2),
  __decorateParam(11, ISSHRemoteAgentHostService),
  __decorateParam(12, ICustomizationHarnessService),
  __decorateParam(13, IAgentHostTerminalService),
  __decorateParam(14, ITelemetryService),
  __decorateParam(15, IAgentHostActiveClientService),
  __decorateParam(16, IRemoteAgentHostConnectionCustomizationService)
], RemoteAgentHostContribution);

registerSingleton(IRemoteAgentHostConnectionCustomizationService, RemoteAgentHostConnectionCustomizationService, 1 /* Delayed */);

registerWorkbenchContribution2(RemoteAgentHostContribution.ID, RemoteAgentHostContribution, WorkbenchPhase.AfterRestored);

registerAction2(OpenAgentHostStateFileAction2);

Registry.as(Extensions4.Configuration).registerConfiguration({
  properties: {
    [RemoteAgentHostsEnabledSettingId]: {
      type: "boolean",
      description: localize(5108, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [RemoteAgentHostAutoConnectSettingId]: {
      type: "boolean",
      description: localize(5106, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    // Off by default: sandbox tasks currently carry the `copilot-developer-cli` slug, which the
    // Copilot extension's cloud provider does not list, so the two do not overlap. That slug is
    // expected to change, at which point both providers would list the same task — see
    // `CLOUD_SANDBOX_AGENT_SLUG`.
    [CloudSandboxEnabledSettingId]: {
      type: "boolean",
      description: localize(5098, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    "chat.sshRemoteAgentHostCommand": {
      type: "string",
      description: localize(5111, null),
      default: "",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    "chat.wslRemoteAgentHostCommand": {
      type: "string",
      description: localize(5112, null),
      default: "",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    "chat.agentHost.forwardSSHAgent": {
      type: "boolean",
      description: localize(5099, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [RemoteAgentHostsSettingId]: {
      type: "array",
      items: {
        type: "object",
        properties: {
          address: { type: "string", description: localize(5105, null) },
          name: { type: "string", description: localize(5109, null) },
          connectionToken: { type: "string", description: localize(5107, null) }
        },
        required: ["address", "name"]
      },
      description: localize(5104, null),
      default: [],
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [TunnelAgentHostsSettingId]: {
      type: "array",
      items: { type: "string" },
      description: localize(5110, null),
      default: [],
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [AgentHostLocalFilePermissionsSettingId]: {
      type: "object",
      description: localize(5100, null),
      additionalProperties: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              type: "string",
              enum: ["r", "rw"],
              enumDescriptions: [
                localize(5102, null),
                localize(5103, null)
              ]
            },
            {
              type: "object",
              properties: {
                mode: {
                  type: "string",
                  enum: ["r", "rw"]
                },
                lexicalUri: {
                  type: "string",
                  description: localize(5101, null)
                }
              },
              required: ["mode", "lexicalUri"],
              additionalProperties: false
            }
          ]
        }
      },
      default: {},
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    }
  }
});
export { waitForRemoteAgentHostActivation, getAddressForSessionType, shouldPauseSSHReconnectAfterFailure, sshConnectionKey, disconnectSSHEntry, SSH_RECONNECT_PERIODIC_INTERVAL_MS, SSHReconnectState, ConnectionState, RemoteAgentHostContribution };
