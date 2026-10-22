// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/tunnelAgentHost.contribution.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { IRemoteAgentHostService, RemoteAgentHostAutoConnectSettingId, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId, getEntryTypeConfig } from "./module-1736.mjs";
import { isWeb } from "./module-0014.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ITunnelAgentHostService, TUNNEL_ADDRESS_PREFIX, isTunnelHosted } from "./module-1734.mjs";
import { watchForIncompatibleNotifications } from "./module-3560.mjs";
import { RemoteAgentHostSessionsProvider } from "./module-3684.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { PROTOCOL_VERSION } from "./module-1780.mjs";
import { computeReconnectDelay, hasExhaustedReconnectAttempts } from "./module-1735.mjs";
import { logTunnelConnectAttempt, logTunnelConnectResolved, logTunnelDiscoveryResult } from "./module-1781.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHostService } from "./module-1118.mjs";
import { ITunnelHostService } from "./module-4259.mjs";
import { IAgentHostFilterService } from "./module-3520.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/tunnelAgentHost.contribution.ts
var STATUS_CHECK_INTERVAL = 5 * 60 * 1e3;

var RESUME_RATE_LIMIT_MS = 1e4;

var TunnelAgentHostContribution = class extends Disposable {
  constructor(_tunnelService, _remoteAgentHostService, _sessionsProvidersService, _configurationService, _instantiationService, _notificationService, _logService, _authenticationService, _telemetryService, _hostService, _tunnelHostService, agentHostFilterService) {
    super();
    this._tunnelService = _tunnelService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this._logService = _logService;
    this._authenticationService = _authenticationService;
    this._telemetryService = _telemetryService;
    this._hostService = _hostService;
    this._tunnelHostService = _tunnelHostService;
    this._providerStores = this._register(new DisposableMap());
    this._providerInstances = /* @__PURE__ */ new Map();
    this._pendingConnects = /* @__PURE__ */ new Map();
    this._lastStatusCheck = 0;
    /**
     * `false` until the first {@link _silentStatusCheck} resolves. Until then
     * we keep newly-created providers in the `Connecting` state so the picker
     * doesn't briefly show every cached tunnel as "Offline" on startup.
     */
    this._initialStatusChecked = false;
    /** Previous connection status per address — used to detect Connected→Disconnected transitions. */
    this._previousStatuses = /* @__PURE__ */ new Map();
    /** Pending auto-reconnect timer per address. */
    this._reconnectTimeouts = /* @__PURE__ */ new Map();
    /** Consecutive failed auto-reconnect attempts per address. */
    this._reconnectAttempts = /* @__PURE__ */ new Map();
    /** Why auto-reconnect is paused for each address. */
    this._reconnectPauseReasons = /* @__PURE__ */ new Map();
    /**
     * Addresses whose provider currently holds a live connection. Tracked
     * separately from {@link _previousStatuses} so a drop is still detected when
     * the connection passes through an intermediate `connecting` state on its
     * way down.
     */
    this._wiredAddresses = /* @__PURE__ */ new Set();
    /** Timestamp of the last focus/wake-triggered resume, to rate-limit rapid tab toggles. */
    this._lastResumeAt = 0;
    /**
     * Per-address connect sessions for telemetry. A session starts at the
     * first attempt of a connect cycle (initial or reconnect) and ends on
     * terminal resolution (connected, host-offline, max-attempts).
     */
    this._connectSessions = /* @__PURE__ */ new Map();
    this._reconcileProviders();
    this._register(agentHostFilterService.registerDiscoveryHandler(() => this._silentStatusCheck()));
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => {
      this._handleConnectionChanges();
      this._updateConnectionStatuses();
      this._wireConnections();
    }));
    this._register(this._tunnelService.onDidChangeTunnels(() => {
      this._reconcileProviders();
      this._pruneReconnectState();
    }));
    this._register(this._tunnelHostService.onDidChangeStatus(() => {
      this._resetHostedTunnelReconnectState();
      this._silentStatusCheck();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(RemoteAgentHostsEnabledSettingId)) {
        this._reconcileProviders();
        this._pruneReconnectState();
      }
    }));
    this._register(this._authenticationService.onDidChangeSessions((e4) => {
      if (e4.providerId !== "github") {
        return;
      }
      this._handleSessionsChange(e4);
    }));
    this._register(this._hostService.onDidChangeFocus((focused) => {
      if (focused) {
        this._resumeReconnects("focus");
      }
    }));
    if (isWeb) {
      const onWake = () => this._resumeReconnects("wake");
      mainWindow.addEventListener("online", onWake);
      this._register(toDisposable(() => mainWindow.removeEventListener("online", onWake)));
    }
    this._register(toDisposable(() => {
      for (const timer of this._reconnectTimeouts.values()) {
        clearTimeout(timer);
      }
      this._reconnectTimeouts.clear();
    }));
    agentHostFilterService.rediscover();
  }
  static {
    this.ID = "sessions.contrib.tunnelAgentHostContribution";
  }
  /**
   * Called by the workspace picker when it opens. Silently re-checks
   * tunnel statuses if more than 5 minutes have elapsed since the last check.
   */
  async checkTunnelStatuses() {
    if (Date.now() - this._lastStatusCheck < STATUS_CHECK_INTERVAL) {
      return;
    }
    await this._silentStatusCheck();
  }
  // -- Provider management --
  _reconcileProviders() {
    const enabled = this._configurationService.getValue(RemoteAgentHostsEnabledSettingId);
    const cached = enabled ? this._getProviderTunnels() : [];
    const desiredAddresses = new Set(cached.map((t2) => `${TUNNEL_ADDRESS_PREFIX}${t2.tunnelId}`));
    for (const [address] of this._providerStores) {
      if (!desiredAddresses.has(address)) {
        this._providerStores.deleteAndDispose(address);
        this._providerInstances.delete(address);
      }
    }
    for (const tunnel of cached) {
      const address = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
      if (!this._providerStores.has(address)) {
        this._createProvider(address, tunnel.name);
      }
    }
  }
  _getProviderTunnels() {
    return this._tunnelService.getCachedTunnels().filter((tunnel) => !this._tunnelService.isAutoConnectSuppressed(tunnel.tunnelId));
  }
  _isHostedTunnel(tunnel) {
    return isTunnelHosted(this._tunnelHostService.sharingInfo, tunnel);
  }
  _resetHostedTunnelReconnectState() {
    for (const tunnel of this._tunnelService.getCachedTunnels()) {
      if (this._isHostedTunnel(tunnel)) {
        const address = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
        this._resetReconnectState(address);
        if (this._remoteAgentHostService.connections.some((connection) => connection.address === address && RemoteAgentHostConnectionStatus.isConnected(connection.status))) {
          this._tunnelService.disconnect(address).catch(() => {
          });
        }
      }
    }
  }
  _createProvider(address, name) {
    const store = new DisposableStore();
    const provider = this._instantiateProvider(address, name);
    provider.setConnectionStatus(RemoteAgentHostConnectionStatus.connecting);
    store.add(provider);
    store.add(this._sessionsProvidersService.registerProvider(provider));
    store.add(watchForIncompatibleNotifications(provider, this._instantiationService, this._notificationService));
    this._providerInstances.set(address, provider);
    store.add(toDisposable(() => {
      this._providerInstances.delete(address);
      this._wiredAddresses.delete(address);
    }));
    this._providerStores.set(address, store);
  }
  _instantiateProvider(address, name) {
    return this._instantiationService.createInstance(
      RemoteAgentHostSessionsProvider,
      {
        address,
        name,
        connectOnDemand: () => this._connectTunnel(address, { userInitiated: true }),
        disconnectOnDemand: () => this._disconnectTunnel(address)
      }
    );
  }
  // -- Connection status --
  _updateConnectionStatuses() {
    for (const [address, provider] of this._providerInstances) {
      const connectionInfo = this._remoteAgentHostService.connections.find((c) => c.address === address);
      if (connectionInfo) {
        provider.setConnectionStatus(connectionInfo.status);
        continue;
      }
      if (RemoteAgentHostConnectionStatus.isIncompatible(provider.connectionStatus.get())) {
        continue;
      }
      if (this._pendingConnects.has(address)) {
        provider.setConnectionStatus(RemoteAgentHostConnectionStatus.connecting);
      } else if (!this._initialStatusChecked) {
        provider.setConnectionStatus(RemoteAgentHostConnectionStatus.connecting);
      } else {
        provider.setConnectionStatus(RemoteAgentHostConnectionStatus.disconnected);
      }
    }
  }
  /**
   * Wire live connections to their providers so session operations work, and
   * drop a provider's connection once its transport is gone.
   */
  _wireConnections() {
    for (const [address, provider] of this._providerInstances) {
      const connectionInfo = this._remoteAgentHostService.connections.find((c) => c.address === address);
      if (connectionInfo && RemoteAgentHostConnectionStatus.isConnected(connectionInfo.status)) {
        const connection = this._remoteAgentHostService.getConnection(address);
        if (connection) {
          provider.setConnection(connection, connectionInfo.defaultDirectory);
          this._wiredAddresses.add(address);
        }
      } else if (this._wiredAddresses.has(address) && !RemoteAgentHostConnectionStatus.isConnecting(connectionInfo?.status) && !RemoteAgentHostConnectionStatus.isReconnecting(connectionInfo?.status)) {
        this._wiredAddresses.delete(address);
        provider.clearConnection();
      }
    }
  }
  // -- On-demand connection --
  /**
   * Establish a relay connection to a cached tunnel. Called on demand
   * when the user invokes the browse action on an online-but-not-connected tunnel.
   */
  _connectTunnel(address, options3) {
    const existing = this._pendingConnects.get(address);
    if (existing) {
      return existing;
    }
    const tunnelId = address.slice(TUNNEL_ADDRESS_PREFIX.length);
    const cached = this._tunnelService.getCachedTunnels().find((t2) => t2.tunnelId === tunnelId);
    if (!cached) {
      return Promise.resolve();
    }
    if (this._isHostedTunnel(cached)) {
      this._resetReconnectState(address);
      return Promise.resolve();
    }
    if (!options3.userInitiated && this._tunnelService.isAutoConnectSuppressed(tunnelId)) {
      this._logService.info(`[TunnelAgentHost] Skipping background connect for user-disconnected tunnel ${address}`);
      return Promise.resolve();
    }
    const live = this._remoteAgentHostService.connections.find((connection) => connection.address === address);
    if (!options3.userInitiated && RemoteAgentHostConnectionStatus.isConnecting(live?.status)) {
      return Promise.resolve();
    }
    if (!options3.userInitiated && RemoteAgentHostConnectionStatus.isReconnecting(live?.status)) {
      return Promise.resolve();
    }
    if (options3.userInitiated) {
      this._tunnelService.clearAutoConnectSuppression(tunnelId);
      const provider = this._providerInstances.get(address);
      if (provider && RemoteAgentHostConnectionStatus.isIncompatible(provider.connectionStatus.get())) {
        provider.setConnectionStatus(RemoteAgentHostConnectionStatus.connecting);
      }
    }
    this._cancelReconnect(address);
    const { attemptNumber, attemptStart, session, isReconnect } = this._beginConnectAttempt(address);
    const promise = (async () => {
      let handle2;
      const timer = options3.userInitiated ? setTimeout(() => {
        handle2 = this._notificationService.notify({
          severity: Severity2.Info,
          message: localize(5251, null, cached.name),
          progress: { infinite: true }
        });
      }, 1e3) : void 0;
      this._updateConnectionStatuses();
      try {
        const tunnelInfo = {
          tunnelId: cached.tunnelId,
          clusterId: cached.clusterId,
          name: cached.name,
          tags: [],
          protocolVersion: 5,
          hostConnectionCount: 0
        };
        await this._tunnelService.connect(tunnelInfo, cached.authProvider, { userInitiated: options3.userInitiated });
        if (this._isHostedTunnel(cached)) {
          await this._tunnelService.disconnect(address);
          this._resetReconnectState(address);
          return;
        }
        if (!options3.userInitiated && this._tunnelService.isAutoConnectSuppressed(cached.tunnelId)) {
          this._logService.info(`[TunnelAgentHost] Disconnecting background connection for user-disconnected tunnel ${address}`);
          await this._tunnelService.disconnect(address);
          this._connectSessions.delete(address);
          return;
        }
        this._finishConnectAttempt(address, { success: true, attemptNumber, attemptStart, session, isReconnect });
      } catch (err) {
        this._logService.warn(`[TunnelAgentHost] Connect to ${cached.name} failed:`, err);
        const errorCategory = this._categorizeError(err);
        this._finishConnectAttempt(address, { success: false, attemptNumber, attemptStart, session, isReconnect, error: err });
        this._pendingConnects.delete(address);
        const incompatible = RemoteAgentHostConnectionStatus.fromConnectError(err, [PROTOCOL_VERSION]);
        if (incompatible) {
          this._providerInstances.get(address)?.setConnectionStatus(incompatible);
          this._resetReconnectState(address);
          throw err;
        }
        if (errorCategory === "authExpired" || errorCategory === "auth") {
          this._pauseReconnect(address, errorCategory);
          throw err;
        }
        const hostOnline = await this._probeHostOnline(cached.tunnelId);
        if (hostOnline === false) {
          this._pauseReconnect(address, "hostOffline");
        } else {
          this._logService.info(`[TunnelAgentHost] Scheduling reconnect for ${address}`);
          this._scheduleReconnect(address);
        }
        throw err;
      } finally {
        if (timer !== void 0) {
          clearTimeout(timer);
        }
        handle2?.close();
        this._pendingConnects.delete(address);
        this._updateConnectionStatuses();
      }
    })();
    promise.catch(() => {
    });
    this._pendingConnects.set(address, promise);
    return promise;
  }
  /**
   * Tear down the active tunnel relay for {@link address} and cancel any
   * pending auto-reconnect. The cached tunnel entry is kept so the user
   * can re-connect later; only the live WebSocket is closed.
   */
  async _disconnectTunnel(address) {
    this._cancelReconnect(address);
    this._resetReconnectState(address);
    this._tunnelService.suppressAutoConnect(address.slice(TUNNEL_ADDRESS_PREFIX.length));
    this._previousStatuses.delete(address);
    await this._tunnelService.disconnect(address);
  }
  /**
   * Detect tunnel connections that transitioned from Connected to
   * Disconnected and schedule an auto-reconnect.
   *
   * Important: we only trigger on a Connected → Disconnected transition
   * where the connection entry is still present. If the entry has been
   * removed from the service (e.g. the user clicked "Remove Remote"),
   * we do NOT schedule a reconnect — that would override their intent.
   */
  _handleConnectionChanges() {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      return;
    }
    const cachedAddresses = new Set(this._getProviderTunnels().map((t2) => `${TUNNEL_ADDRESS_PREFIX}${t2.tunnelId}`));
    const currentStatuses = /* @__PURE__ */ new Map();
    for (const conn of this._remoteAgentHostService.connections) {
      currentStatuses.set(conn.address, conn.status);
    }
    for (const address of cachedAddresses) {
      const previous = this._previousStatuses.get(address);
      const current = currentStatuses.get(address);
      const wasConnected = RemoteAgentHostConnectionStatus.isConnected(previous);
      const isExplicitlyDisconnected = RemoteAgentHostConnectionStatus.isDisconnected(current);
      if (wasConnected && isExplicitlyDisconnected && !this._pendingConnects.has(address)) {
        this._logService.info(`[TunnelAgentHost] Connection lost for ${address}, scheduling reconnect`);
        if (!this._connectSessions.has(address)) {
          this._connectSessions.set(address, { startedAt: Date.now(), attempts: 0, isReconnect: true });
        }
        this._scheduleReconnect(
          address,
          /*immediate*/
          true
        );
      }
      if (current !== void 0) {
        this._previousStatuses.set(address, current);
      } else {
        this._previousStatuses.delete(address);
        this._resetReconnectState(address);
      }
    }
    for (const address of [...this._previousStatuses.keys()]) {
      if (!cachedAddresses.has(address)) {
        this._previousStatuses.delete(address);
      }
    }
  }
  _scheduleReconnect(address, immediate = false) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      return;
    }
    const tunnelId = address.slice(TUNNEL_ADDRESS_PREFIX.length);
    const cached = this._tunnelService.getCachedTunnels().find((t2) => t2.tunnelId === tunnelId);
    if (!cached) {
      return;
    }
    if (this._isHostedTunnel(cached)) {
      this._resetReconnectState(address);
      return;
    }
    if (this._pendingConnects.has(address)) {
      return;
    }
    const live = this._remoteAgentHostService.connections.find((c) => c.address === address);
    if (live && RemoteAgentHostConnectionStatus.isConnected(live.status)) {
      this._clearReconnectBackoff(address);
      return;
    }
    if (live && RemoteAgentHostConnectionStatus.isConnecting(live.status)) {
      return;
    }
    if (live && RemoteAgentHostConnectionStatus.isReconnecting(live.status)) {
      return;
    }
    this._cancelReconnect(address);
    const attempt = this._reconnectAttempts.get(address) ?? 0;
    const reconnectPolicy = getEntryTypeConfig("tunnel" /* Tunnel */).reconnect;
    if (hasExhaustedReconnectAttempts(reconnectPolicy, attempt)) {
      this._pauseReconnect(address, "maxAttemptsReached");
      return;
    }
    const delay = immediate ? 0 : computeReconnectDelay(reconnectPolicy, attempt + 1);
    this._logService.info(
      `[TunnelAgentHost] Scheduling reconnect for ${address} in ${delay}ms (attempt ${attempt + 1}/${reconnectPolicy.maxAttempts})`
    );
    const timer = setTimeout(() => {
      this._reconnectTimeouts.delete(address);
      if (this._pendingConnects.has(address)) {
        return;
      }
      const live2 = this._remoteAgentHostService.connections.find((c) => c.address === address);
      if (live2 && RemoteAgentHostConnectionStatus.isConnected(live2.status)) {
        this._clearReconnectBackoff(address);
        return;
      }
      if (live2 && RemoteAgentHostConnectionStatus.isConnecting(live2.status)) {
        return;
      }
      if (live2 && RemoteAgentHostConnectionStatus.isReconnecting(live2.status)) {
        return;
      }
      this._reconnectAttempts.set(address, attempt + 1);
      this._connectTunnel(address, { userInitiated: false }).catch(() => {
      });
    }, delay);
    this._reconnectTimeouts.set(address, timer);
  }
  /**
   * Best-effort probe of whether the host backing `tunnelId` is online
   * (has any host connections). Returns `undefined` if we couldn't
   * determine — caller should treat as "retry normally" in that case.
   */
  async _probeHostOnline(tunnelId) {
    try {
      const tunnels = await this._tunnelService.listTunnels({ silent: true });
      if (!tunnels) {
        return void 0;
      }
      const info = tunnels.find((t2) => t2.tunnelId === tunnelId);
      if (!info) {
        return false;
      }
      return info.hostConnectionCount > 0;
    } catch {
      return void 0;
    }
  }
  _cancelReconnect(address) {
    const timer = this._reconnectTimeouts.get(address);
    if (timer !== void 0) {
      clearTimeout(timer);
      this._reconnectTimeouts.delete(address);
    }
  }
  /** Clear retry-backoff and pause state for an address. */
  _clearReconnectBackoff(address) {
    this._reconnectAttempts.delete(address);
    this._reconnectPauseReasons.delete(address);
  }
  /** Drop all reconnect + telemetry state for an address (e.g. on removal). */
  _resetReconnectState(address) {
    this._cancelReconnect(address);
    this._clearReconnectBackoff(address);
    this._connectSessions.delete(address);
  }
  /**
   * React to auth session add/remove. Additions re-run discovery (a fresh
   * token may unblock a previously auth-paused tunnel). Removals drop any
   * tunnel state that depended on that provider — otherwise we'd sit on a
   * stale auth pause forever, or hammer a provider whose session is gone.
   */
  _handleSessionsChange(e4) {
    const added = (e4.event.added?.length ?? 0) > 0;
    const removed = (e4.event.removed?.length ?? 0) > 0;
    if (removed) {
      const cached = this._tunnelService.getCachedTunnels();
      for (const tunnel of cached) {
        if (tunnel.authProvider !== e4.providerId) {
          continue;
        }
        const address = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
        this._logService.info(
          `[TunnelAgentHost] Auth session removed for ${e4.providerId}; tearing down ${address}.`
        );
        this._resetReconnectState(address);
        this._tunnelService.disconnect(address).catch(() => {
        });
      }
    }
    if (added) {
      this._logService.info(`[TunnelAgentHost] ${e4.providerId} session added; resuming reconnects and rediscovering.`);
      this._resumeReconnects("sessionAdded");
      this._silentStatusCheck("sessionChange");
    }
  }
  /**
   * Stop auto-reconnecting for an address until a recovery signal resumes us.
   */
  _pauseReconnect(address, reason) {
    this._cancelReconnect(address);
    this._reconnectAttempts.delete(address);
    this._reconnectPauseReasons.set(address, reason);
    const resumeCondition = reason === "hostOffline" ? "a status check that confirms the host is online" : reason === "auth" || reason === "authExpired" ? "an authentication session change" : `${isWeb ? "network-online or " : ""}window focus`;
    this._logService.info(
      `[TunnelAgentHost] Pausing auto-reconnect for ${address} (${reason}); will resume on ${resumeCondition}.`
    );
    const session = this._connectSessions.get(address);
    if (session) {
      logTunnelConnectResolved(this._telemetryService, {
        isReconnect: session.isReconnect,
        totalAttempts: session.attempts,
        totalDurationMs: Date.now() - session.startedAt,
        success: false,
        failureReason: reason
      });
      this._connectSessions.delete(address);
    }
  }
  /**
   * Begin (or continue) a connect telemetry session for `address` and
   * return the bookkeeping needed to later finish the attempt. A session
   * already exists if `_handleConnectionChanges` marked this as a
   * reconnect cycle; otherwise this starts a fresh initial-connect session.
   */
  _beginConnectAttempt(address) {
    let session = this._connectSessions.get(address);
    if (!session) {
      session = { startedAt: Date.now(), attempts: 0, isReconnect: false };
      this._connectSessions.set(address, session);
    }
    session.attempts++;
    return { session, attemptNumber: session.attempts, attemptStart: Date.now(), isReconnect: session.isReconnect };
  }
  /**
   * Finalize the telemetry for a single connect attempt. On success, also
   * clears backoff state and closes the session; on failure, only the
   * per-attempt event is emitted (the caller decides whether to retry).
   */
  _finishConnectAttempt(address, args2) {
    const { success, attemptNumber, attemptStart, session, isReconnect, error } = args2;
    const durationMs = Date.now() - attemptStart;
    if (success) {
      this._clearReconnectBackoff(address);
      logTunnelConnectAttempt(this._telemetryService, { isReconnect, attempt: attemptNumber, durationMs, success: true });
      logTunnelConnectResolved(this._telemetryService, { isReconnect, totalAttempts: attemptNumber, totalDurationMs: Date.now() - session.startedAt, success: true });
      this._connectSessions.delete(address);
    } else {
      logTunnelConnectAttempt(this._telemetryService, { isReconnect, attempt: attemptNumber, durationMs, success: false, errorCategory: this._categorizeError(error) });
    }
  }
  _categorizeError(err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/\b(401|403)\b|token.*expired|expired.*token|invalid[_ -]?grant/i.test(message)) {
      return "authExpired";
    }
    if (/authenticat|unauthoriz|auth.*(fail|error|invalid)/i.test(message)) {
      return "auth";
    }
    if (/WebSocket relay connection failed|failed to connect to relay/i.test(message)) {
      return "relayConnectionFailed";
    }
    if (/network|fetch|offline|ECONN|ENOTFOUND|ETIMEDOUT/i.test(message)) {
      return "network";
    }
    return "other";
  }
  /**
   * Resume paused reconnects that the given recovery signal can resolve.
   *
   * Rate-limited: at most one resume per RESUME_RATE_LIMIT_MS so that
   * rapid focus/network events cannot start unbounded retry bursts.
   */
  _resumeReconnects(trigger) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      return;
    }
    const resumableAddresses = [];
    for (const tunnel of this._getProviderTunnels()) {
      const address = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
      const reason = this._reconnectPauseReasons.get(address);
      if (!reason || !this._canResumeReconnect(reason, trigger) || this._pendingConnects.has(address)) {
        continue;
      }
      const live = this._remoteAgentHostService.connections.find((connection) => connection.address === address);
      if (live && RemoteAgentHostConnectionStatus.isReconnecting(live.status)) {
        continue;
      }
      if (!live || !RemoteAgentHostConnectionStatus.isConnected(live.status)) {
        resumableAddresses.push(address);
      }
    }
    if (resumableAddresses.length === 0) {
      return;
    }
    if (trigger !== "sessionAdded") {
      const now = Date.now();
      if (now - this._lastResumeAt < RESUME_RATE_LIMIT_MS) {
        return;
      }
      this._lastResumeAt = now;
    }
    for (const address of resumableAddresses) {
      this._logService.info(`[TunnelAgentHost] Resuming reconnect for ${address} (trigger: ${trigger})`);
      this._clearReconnectBackoff(address);
      this._scheduleReconnect(
        address,
        /*immediate*/
        true
      );
    }
  }
  _canResumeReconnect(reason, trigger) {
    return trigger === "sessionAdded" ? reason === "auth" || reason === "authExpired" : reason === "maxAttemptsReached";
  }
  /** Drop reconnect state for addresses whose tunnel is no longer cached. */
  _pruneReconnectState() {
    const cachedAddresses = new Set(this._getProviderTunnels().map((t2) => `${TUNNEL_ADDRESS_PREFIX}${t2.tunnelId}`));
    const tracked = /* @__PURE__ */ new Set([
      ...this._reconnectTimeouts.keys(),
      ...this._reconnectAttempts.keys(),
      ...this._reconnectPauseReasons.keys(),
      ...this._connectSessions.keys()
    ]);
    for (const address of tracked) {
      if (!cachedAddresses.has(address)) {
        this._resetReconnectState(address);
      }
    }
  }
  // -- Silent status check --
  async _silentStatusCheck(trigger) {
    const resolvedTrigger = trigger ?? (this._initialStatusChecked ? "rediscover" : "startup");
    const hostsEnabled = this._configurationService.getValue(RemoteAgentHostsEnabledSettingId);
    const autoConnectEnabled = this._configurationService.getValue(RemoteAgentHostAutoConnectSettingId);
    if (!hostsEnabled) {
      this._initialStatusChecked = true;
      this._updateConnectionStatuses();
      logTunnelDiscoveryResult(this._telemetryService, {
        trigger: resolvedTrigger,
        totalFound: 0,
        withActiveHost: 0,
        cachedBefore: this._tunnelService.getCachedTunnels().length,
        autoConnectEnabled,
        hostsEnabled,
        success: true
      });
      return;
    }
    this._lastStatusCheck = Date.now();
    const cachedBefore = this._tunnelService.getCachedTunnels().length;
    let onlineTunnels;
    try {
      onlineTunnels = await this._tunnelService.listTunnels({ silent: true });
    } catch {
      this._initialStatusChecked = true;
      this._updateConnectionStatuses();
      logTunnelDiscoveryResult(this._telemetryService, {
        trigger: resolvedTrigger,
        totalFound: 0,
        withActiveHost: 0,
        cachedBefore,
        autoConnectEnabled,
        hostsEnabled,
        success: false
      });
      return;
    }
    const cached = this._tunnelService.getCachedTunnels();
    if (onlineTunnels) {
      const onlineIds = new Set(onlineTunnels.map((t2) => t2.tunnelId));
      for (const tunnel of cached) {
        if (!onlineIds.has(tunnel.tunnelId)) {
          this._tunnelService.removeCachedTunnel(tunnel.tunnelId);
        }
      }
      const cachedIds = new Set(cached.map((t2) => t2.tunnelId));
      for (const tunnel of onlineTunnels) {
        if (!cachedIds.has(tunnel.tunnelId)) {
          this._tunnelService.cacheTunnel(tunnel, "github");
        }
      }
      const onlineTunnelMap = new Map(onlineTunnels.map((t2) => [t2.tunnelId, t2]));
      for (const [address, provider] of this._providerInstances) {
        const hasConnection = this._remoteAgentHostService.connections.some(
          (c) => c.address === address && (RemoteAgentHostConnectionStatus.isConnected(c.status) || RemoteAgentHostConnectionStatus.isReconnecting(c.status))
        );
        if (hasConnection) {
          continue;
        }
        const tunnelId = address.slice(TUNNEL_ADDRESS_PREFIX.length);
        const info = onlineTunnelMap.get(tunnelId);
        if (info && info.hostConnectionCount > 0) {
          provider.setConnectionStatus(RemoteAgentHostConnectionStatus.connected);
          if (this._reconnectPauseReasons.get(address) === "hostOffline") {
            this._logService.info(
              `[TunnelAgentHost] Confirmed host online for paused ${address}; auto-resuming reconnect.`
            );
            this._clearReconnectBackoff(address);
            this._scheduleReconnect(
              address,
              /*immediate*/
              true
            );
          }
        } else {
          provider.setConnectionStatus(RemoteAgentHostConnectionStatus.disconnected);
          provider.unpublishCachedSessions();
        }
      }
      const autoConnect = this._configurationService.getValue(RemoteAgentHostAutoConnectSettingId);
      if (autoConnect) {
        for (const tunnel of onlineTunnels) {
          if (tunnel.hostConnectionCount > 0 && !this._isHostedTunnel(tunnel)) {
            const address = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
            if (this._tunnelService.isAutoConnectSuppressed(tunnel.tunnelId)) {
              continue;
            }
            if (this._reconnectPauseReasons.has(address)) {
              continue;
            }
            const alreadyConnected = this._remoteAgentHostService.connections.some(
              (c) => c.address === address && (RemoteAgentHostConnectionStatus.isConnected(c.status) || RemoteAgentHostConnectionStatus.isReconnecting(c.status))
            );
            if (!alreadyConnected) {
              const mode = this._tunnelService.getAutoConnectMode(tunnel);
              if (mode === "prompt") {
                this._logService.info(`[TunnelAgentHost] Prompting for the initial agent host location for ${address}`);
                this._connectTunnel(address, { userInitiated: true });
              } else {
                this._connectTunnel(address, { userInitiated: false });
              }
            }
          }
        }
      }
    }
    this._initialStatusChecked = true;
    this._updateConnectionStatuses();
    const totalFound = onlineTunnels?.length ?? 0;
    const withActiveHost = onlineTunnels?.filter((t2) => t2.hostConnectionCount > 0).length ?? 0;
    this._logService.info(
      `[TunnelAgentHost] Silent status check (${resolvedTrigger}): totalFound=${totalFound}, withActiveHost=${withActiveHost}, cachedBefore=${cachedBefore}, autoConnect=${autoConnectEnabled}`
    );
    logTunnelDiscoveryResult(this._telemetryService, {
      trigger: resolvedTrigger,
      totalFound,
      withActiveHost,
      cachedBefore,
      autoConnectEnabled,
      hostsEnabled,
      success: true
    });
  }
};

TunnelAgentHostContribution = __decorateClass([
  __decorateParam(0, ITunnelAgentHostService),
  __decorateParam(1, IRemoteAgentHostService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IAuthenticationService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IHostService),
  __decorateParam(10, ITunnelHostService),
  __decorateParam(11, IAgentHostFilterService)
], TunnelAgentHostContribution);

registerWorkbenchContribution2(TunnelAgentHostContribution.ID, TunnelAgentHostContribution, WorkbenchPhase.AfterRestored);
export { STATUS_CHECK_INTERVAL, RESUME_RATE_LIMIT_MS, TunnelAgentHostContribution };
