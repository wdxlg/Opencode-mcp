// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/tunnelAgentHostServiceImpl.ts
import { hasKey } from "./module-0010.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TunnelFailoverTracker, resolveGatewaySelection, selectGatewayFallbackAfterRejection } from "./module-4245.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { TUNNEL_ADDRESS_PREFIX, TUNNEL_AGENT_HOST_CHANNEL, TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION, TunnelAgentHostsSettingId, isTunnelGatewaySelectionRejectedError, isTunnelNotFoundError } from "./module-1734.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1108.mjs";
import { ReconnectingRelayTransport } from "./module-4238.mjs";
import { AhpJsonlLogger } from "./module-4048.mjs";
import { AgentHostProtocolClient } from "./module-4047.mjs";
import { agentsWindowAgentHostClientInfo } from "./module-4051.mjs";
import { PROTOCOL_VERSION } from "./module-1780.mjs";
import { NonReconnectableTransportError } from "./module-4045.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IProductService } from "./module-0875.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IRemoteAgentHostLocationPreferenceService } from "./module-3558.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/tunnelAgentHostServiceImpl.ts
var LOG_PREFIX17 = "[TunnelAgentHost]";

var CACHED_TUNNELS_KEY = "tunnelAgentHost.recentTunnels";

var AUTO_CONNECT_SUPPRESSED_TUNNELS_KEY = "tunnelAgentHost.autoConnectSuppressedTunnels";

function isEditorGatewaySelection(selection, inventory) {
  return hasKey(selection, { instanceId: true }) && inventory.endpoints.some((endpoint) => endpoint.instanceId === selection.instanceId && endpoint.type === "editor");
}

function shouldTrackTunnelConnection(connectError) {
  return !connectError;
}

var TunnelAgentHostService = class extends Disposable {
  constructor(sharedProcessService, _remoteAgentHostService, _logService, _instantiationService, _configurationService, _authenticationService, _productService, _storageService, _environmentService, _locationPreferenceService, _dialogService, _notificationService) {
    super();
    this._remoteAgentHostService = _remoteAgentHostService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._authenticationService = _authenticationService;
    this._productService = _productService;
    this._storageService = _storageService;
    this._environmentService = _environmentService;
    this._locationPreferenceService = _locationPreferenceService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._onDidChangeTunnels = this._register(new Emitter());
    this.onDidChangeTunnels = this._onDidChangeTunnels.event;
    /** See {@link TunnelFailoverTracker}. */
    this._failoverTracker = new TunnelFailoverTracker();
    this.canDeleteTunnels = true;
    this._mainService = ProxyChannel.toService(
      sharedProcessService.getChannel(TUNNEL_AGENT_HOST_CHANNEL)
    );
  }
  async listTunnels(options3) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      return [];
    }
    const silent = options3?.silent ?? false;
    const auth = await this._getToken(silent);
    if (!auth) {
      if (silent) {
        this._logService.debug(`${LOG_PREFIX17} No cached token available for silent tunnel enumeration`);
      } else {
        this._logService.warn(`${LOG_PREFIX17} No auth token available for tunnel enumeration`);
      }
      return [];
    }
    const additionalNames = this._configurationService.getValue(TunnelAgentHostsSettingId) ?? [];
    return this._mainService.listTunnels(auth.token, auth.provider, additionalNames.length > 0 ? additionalNames : void 0);
  }
  getAutoConnectMode(tunnel) {
    return tunnel.protocolVersion >= TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION && this._locationPreferenceService.getPreference(`${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`) === void 0 ? "prompt" : "background";
  }
  async connect(tunnel, authProvider, options3) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      throw new Error("Remote agent host connections are not enabled.");
    }
    const auth = authProvider ? await this._getTokenForProvider(authProvider, false) : await this._getToken(false);
    if (!auth) {
      throw new Error("No authentication available");
    }
    this._logService.info(`${LOG_PREFIX17} Connecting to tunnel '${tunnel.name}' (${tunnel.tunnelId})`);
    const session = await this._mainService.prepareSelection(auth.token, auth.provider, tunnel.tunnelId, tunnel.clusterId);
    let result;
    let editorFallback = false;
    if (session) {
      const selection = await resolveGatewaySelection(this._locationPreferenceService, this._dialogService, {
        hostKey: `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`,
        hostLabel: tunnel.name,
        productName: this._productService.nameShort,
        inventory: session.inventory,
        userInitiated: options3?.userInitiated ?? true
      });
      if (!selection) {
        this._logService.info(options3?.userInitiated === false ? `${LOG_PREFIX17} Deferring tunnel '${tunnel.name}' until the user chooses an agent host location` : `${LOG_PREFIX17} Agent host selection cancelled for tunnel '${tunnel.name}'`);
        await this._mainService.cancelSelection(session.selectionId);
        return;
      }
      const completed = await this._completeSelectionWithFallback(auth, tunnel, session, selection);
      result = completed.result;
      editorFallback = completed.editorFallback;
    } else {
      result = await this._mainService.connect(auth.token, auth.provider, tunnel.tunnelId, tunnel.clusterId);
    }
    this._logService.info(`${LOG_PREFIX17} Tunnel relay connected, connectionId=${result.connectionId}`);
    let protocolClient;
    try {
      const ahpLoggingEnabled = !!this._configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
      let useSeedConnection = true;
      const establish = async () => {
        if (useSeedConnection) {
          useSeedConnection = false;
          return { connectionId: result.connectionId };
        }
        return this._establishBackgroundRelay(tunnel, auth.provider);
      };
      const transportFactory = () => new ReconnectingRelayTransport(
        establish,
        this._mainService,
        () => ahpLoggingEnabled ? this._instantiationService.createInstance(
          AhpJsonlLogger,
          { logsHome: this._environmentService.logsHome, connectionId: result.connectionId, transport: "tunnel" }
        ) : void 0,
        this._logService,
        LOG_PREFIX17,
        "dev_tunnel" /* DevTunnel */
      );
      protocolClient = this._instantiationService.createInstance(
        AgentHostProtocolClient,
        result.address,
        transportFactory,
        { clientInfo: agentsWindowAgentHostClientInfo }
      );
    } catch (err) {
      this._logService.error(`${LOG_PREFIX17} Connection setup failed`, err);
      this._mainService.disconnect(result.connectionId).catch(() => {
      });
      throw err;
    }
    let status2 = RemoteAgentHostConnectionStatus.connected;
    let connectError;
    try {
      await protocolClient.connect();
      this._logService.info(`${LOG_PREFIX17} Protocol handshake completed with ${result.address}`);
    } catch (err) {
      const incompatible = RemoteAgentHostConnectionStatus.fromConnectError(err, [PROTOCOL_VERSION]);
      if (!RemoteAgentHostConnectionStatus.isIncompatible(incompatible)) {
        this._logService.error(`${LOG_PREFIX17} Connection setup failed`, err);
        protocolClient.dispose();
        this._mainService.disconnect(result.connectionId).catch(() => {
        });
        throw err;
      }
      this._logService.warn(`${LOG_PREFIX17} Incompatible with ${result.address}: ${incompatible.message}`);
      status2 = incompatible;
      connectError = err;
    }
    this.cacheTunnel(tunnel, auth.provider);
    const transportDisposable = toDisposable(() => {
      this._mainService.disconnect(result.connectionId).catch(() => {
      });
    });
    try {
      await this._remoteAgentHostService.addManagedConnection({
        name: result.name,
        connectionToken: result.connectionToken,
        connection: {
          type: "tunnel" /* Tunnel */,
          tunnelId: tunnel.tunnelId,
          clusterId: tunnel.clusterId,
          label: tunnel.name,
          authProvider: auth.provider
        }
      }, protocolClient, transportDisposable, status2);
    } catch (err) {
      this._logService.error(`${LOG_PREFIX17} addManagedConnection failed`, err);
      protocolClient.dispose();
      transportDisposable.dispose();
      throw err;
    }
    if (!shouldTrackTunnelConnection(connectError)) {
      throw connectError;
    }
    this._notifyIfTunnelFailover(result, options3, editorFallback);
  }
  async _establishBackgroundRelay(tunnel, authProvider) {
    const auth = await this._getTokenForProvider(authProvider, true);
    if (!auth) {
      throw new NonReconnectableTransportError("No cached authentication available to reconnect the tunnel.");
    }
    try {
      const session = await this._mainService.prepareSelection(auth.token, auth.provider, tunnel.tunnelId, tunnel.clusterId);
      let result;
      if (session) {
        const selection = await resolveGatewaySelection(this._locationPreferenceService, this._dialogService, {
          hostKey: `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`,
          hostLabel: tunnel.name,
          productName: this._productService.nameShort,
          inventory: session.inventory,
          userInitiated: false
        });
        if (!selection) {
          await this._mainService.cancelSelection(session.selectionId);
          throw new NonReconnectableTransportError("Tunnel agent host selection requires user interaction.");
        }
        result = (await this._completeSelectionWithFallback(auth, tunnel, session, selection)).result;
      } else {
        result = await this._mainService.connect(auth.token, auth.provider, tunnel.tunnelId, tunnel.clusterId);
      }
      const connectionId = result.connectionId;
      return {
        connectionId,
        close: () => this._mainService.disconnect(connectionId)
      };
    } catch (err) {
      if (isTunnelNotFoundError(err)) {
        throw new NonReconnectableTransportError(err.message);
      }
      throw err;
    }
  }
  /**
   * Send `selection` over the prepared gateway session and, if the gateway
   * *rejects* it, transparently retry once using a fresh inventory.
   *
   * A rejection (see {@link isTunnelGatewaySelectionRejectedError}) is the
   * one failure that proves the tunnel itself is healthy: the CLI answered,
   * it simply could not hand us the endpoint we asked for because that
   * agent host is no longer alive. Its registry entry can outlive it (the
   * entry is only pruned once the owning PID dies, which a crashed or
   * detached editor agent host may not do promptly), so the inventory keeps
   * advertising it and every reconnect would otherwise pick it again and
   * fail — the connection stays down for the whole backoff window instead
   * of failing over. Undelegated tunnels can fail over to a dedicated host
   * within the same attempt; delegated tunnels retry only their bound editor
   * host, which prevents creating an orphaned dedicated host.
   *
   * Every other failure means the tunnel is unreachable, and is rethrown so
   * the caller keeps retrying the same destination and selection unchanged.
   * The stored location preference is never mutated by a fallback, so the
   * editor host is preferred again as soon as it is back.
   */
  async _completeSelectionWithFallback(auth, tunnel, session, selection) {
    try {
      return { result: await this._mainService.completeSelection(session.selectionId, selection), editorFallback: false };
    } catch (err) {
      if (!isTunnelGatewaySelectionRejectedError(err)) {
        throw err;
      }
      const wasEditor = isEditorGatewaySelection(selection, session.inventory);
      this._logService.warn(`${LOG_PREFIX17} Gateway rejected the selected agent host for tunnel '${tunnel.name}', retrying an allowed agent host: ${err instanceof Error ? err.message : String(err)}`);
      const retry2 = await this._mainService.prepareSelection(auth.token, auth.provider, tunnel.tunnelId, tunnel.clusterId);
      if (!retry2) {
        throw err;
      }
      const fallback2 = selectGatewayFallbackAfterRejection(selection, retry2.inventory);
      if (!fallback2) {
        await this._mainService.cancelSelection(retry2.selectionId);
        throw err;
      }
      const result = await this._mainService.completeSelection(retry2.selectionId, fallback2);
      return { result, editorFallback: wasEditor && result.selected.serverType === "standalone" };
    }
  }
  /**
   * After a successful {@link addManagedConnection} registration, compare
   * the newly selected endpoint's server type against the last one
   * successfully registered for this tunnel's stable address and, if this
   * was a silent editor → standalone failover, show a single informational
   * notification. Delegates the retention + decision to
   * {@link TunnelFailoverTracker}, which always records this connection
   * for future comparisons regardless of whether a notification was shown.
   *
   * `editorFallback` reports that {@link _completeSelectionWithFallback}
   * already performed the substitution within this very attempt, which
   * notifies on its own — see {@link shouldNotifyTunnelFailover}.
   */
  _notifyIfTunnelFailover(result, options3, editorFallback) {
    const userInitiated = options3?.userInitiated ?? true;
    const shouldNotify = this._failoverTracker.recordAndShouldNotify(result.address, result.selected.serverType, userInitiated, editorFallback);
    if (shouldNotify) {
      this._notificationService.notify({
        severity: Severity2.Info,
        // The in-attempt fallback can happen on a first connect too,
        // where nothing was interrupted and nothing was reconnected.
        message: editorFallback ? localize(
          5267,
          null
        ) : localize(
          5266,
          null
        )
      });
    }
  }
  async deleteTunnel(tunnel) {
    const auth = await this._getToken(false);
    if (!auth) {
      throw new Error("No authentication available");
    }
    this._logService.info(`${LOG_PREFIX17} Deleting tunnel '${tunnel.name}' (${tunnel.tunnelId})`);
    await this._mainService.deleteTunnel(auth.token, auth.provider, tunnel.tunnelId, tunnel.clusterId);
    this.removeCachedTunnel(tunnel.tunnelId);
  }
  async disconnect(address) {
    await this._remoteAgentHostService.removeRemoteAgentHost(address);
    this._onDidChangeTunnels.fire();
  }
  /**
   * Get an auth token, trying cached sessions first (silent),
   * then prompting interactively if `silent` is false.
   */
  async _getToken(silent) {
    if (this._lastAuthProvider) {
      const result = await this._getTokenForProvider(this._lastAuthProvider, silent);
      if (result) {
        return result;
      }
    }
    for (const provider of ["github", "microsoft"]) {
      if (provider === this._lastAuthProvider) {
        continue;
      }
      const result = await this._getTokenForProvider(provider, true);
      if (result) {
        return result;
      }
    }
    return void 0;
  }
  /**
   * Get a token for a specific auth provider.
   * @param provider The auth provider to use.
   * @param silent If true, only try cached sessions. If false, prompt the user.
   */
  _getScopesForProvider(provider) {
    const config = this._productService.tunnelApplicationConfig?.authenticationProviders;
    return config?.[provider]?.scopes ?? [];
  }
  async _getTokenForProvider(provider, silent) {
    const providerId = provider;
    const scopes = this._getScopesForProvider(provider);
    if (scopes.length === 0) {
      return void 0;
    }
    try {
      let sessions = await this._authenticationService.getSessions(providerId, scopes, {}, true);
      if (sessions.length === 0) {
        const allSessions = await this._authenticationService.getSessions(providerId, void 0, {}, true);
        const requestedSet = new Set(scopes);
        let bestSession;
        let bestExtra = Infinity;
        for (const session of allSessions) {
          const sessionScopes = new Set(session.scopes);
          let isSuperset = true;
          for (const scope of requestedSet) {
            if (!sessionScopes.has(scope)) {
              isSuperset = false;
              break;
            }
          }
          if (isSuperset) {
            const extra = sessionScopes.size - requestedSet.size;
            if (extra < bestExtra) {
              bestExtra = extra;
              bestSession = session;
            }
          }
        }
        if (bestSession) {
          sessions = [bestSession];
        }
      }
      if (sessions.length === 0 && !silent) {
        const session = await this._authenticationService.createSession(providerId, scopes, { activateImmediate: true });
        sessions = [session];
      }
      if (sessions.length > 0) {
        const token = sessions[0].accessToken;
        if (token) {
          this._lastAuthProvider = provider;
          return { token, provider };
        }
      }
    } catch (err) {
      this._logService.debug(`${LOG_PREFIX17} Failed to get ${provider} token: ${err}`);
    }
    return void 0;
  }
  async getAuthProvider(options3) {
    const result = await this._getToken(options3?.silent ?? true);
    return result?.provider;
  }
  getCachedTunnels() {
    const raw = this._storageService.get(CACHED_TUNNELS_KEY, -1 /* APPLICATION */);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  cacheTunnel(tunnel, authProvider) {
    const cached = this.getCachedTunnels();
    const filtered = cached.filter((t2) => t2.tunnelId !== tunnel.tunnelId);
    filtered.unshift({
      tunnelId: tunnel.tunnelId,
      clusterId: tunnel.clusterId,
      name: tunnel.name,
      authProvider
    });
    this.clearAutoConnectSuppression(tunnel.tunnelId);
    this._storeCachedTunnels(filtered);
    this._onDidChangeTunnels.fire();
  }
  removeCachedTunnel(tunnelId) {
    const cached = this.getCachedTunnels();
    this._storeCachedTunnels(cached.filter((t2) => t2.tunnelId !== tunnelId));
    this.clearAutoConnectSuppression(tunnelId);
    this._onDidChangeTunnels.fire();
  }
  isAutoConnectSuppressed(tunnelId) {
    return this._getAutoConnectSuppressedTunnels().has(tunnelId);
  }
  suppressAutoConnect(tunnelId) {
    const suppressed = this._getAutoConnectSuppressedTunnels();
    suppressed.add(tunnelId);
    this._storeAutoConnectSuppressedTunnels(suppressed);
  }
  clearAutoConnectSuppression(tunnelId) {
    const suppressed = this._getAutoConnectSuppressedTunnels();
    if (!suppressed.delete(tunnelId)) {
      return;
    }
    this._storeAutoConnectSuppressedTunnels(suppressed);
  }
  _storeCachedTunnels(tunnels) {
    if (tunnels.length === 0) {
      this._storageService.remove(CACHED_TUNNELS_KEY, -1 /* APPLICATION */);
    } else {
      this._storageService.store(CACHED_TUNNELS_KEY, JSON.stringify(tunnels), -1 /* APPLICATION */, 0 /* USER */);
    }
  }
  _getAutoConnectSuppressedTunnels() {
    const raw = this._storageService.get(AUTO_CONNECT_SUPPRESSED_TUNNELS_KEY, -1 /* APPLICATION */);
    if (!raw) {
      return /* @__PURE__ */ new Set();
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return /* @__PURE__ */ new Set();
      }
      return new Set(parsed.filter((item) => typeof item === "string"));
    } catch {
      return /* @__PURE__ */ new Set();
    }
  }
  _storeAutoConnectSuppressedTunnels(tunnelIds) {
    if (tunnelIds.size === 0) {
      this._storageService.remove(AUTO_CONNECT_SUPPRESSED_TUNNELS_KEY, -1 /* APPLICATION */);
    } else {
      this._storageService.store(AUTO_CONNECT_SUPPRESSED_TUNNELS_KEY, JSON.stringify([...tunnelIds]), -1 /* APPLICATION */, 0 /* USER */);
    }
  }
};

TunnelAgentHostService = __decorateClass([
  __decorateParam(0, ISharedProcessService),
  __decorateParam(1, IRemoteAgentHostService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IAuthenticationService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IEnvironmentService),
  __decorateParam(9, IRemoteAgentHostLocationPreferenceService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, INotificationService)
], TunnelAgentHostService);
export { isEditorGatewaySelection, shouldTrackTunnelConnection, LOG_PREFIX17, CACHED_TUNNELS_KEY, AUTO_CONNECT_SUPPRESSED_TUNNELS_KEY, TunnelAgentHostService };
