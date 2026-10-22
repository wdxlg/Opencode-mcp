// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/electron-browser/sshRemoteAgentHostServiceImpl.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1108.mjs";
import { SSH_REMOTE_AGENT_HOST_CHANNEL, computeSSHConnectionKey, isSSHHostKeyDeniedError } from "./module-1779.mjs";
import { NonReconnectableTransportError } from "./module-4045.mjs";
import { AgentHostProtocolClient } from "./module-4047.mjs";
import { AhpJsonlLogger } from "./module-4048.mjs";
import { ReconnectingRelayTransport } from "./module-4238.mjs";
import { agentsWindowAgentHostClientInfo } from "./module-4051.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId, RemoteAgentHostsSettingId, SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, getEntryAddress, isLegacySshRawEntry, isRawRemoteAgentHostEntry, parseLegacyRawEntry, readRemoteAgentHostSettings, readSSHRemoteAgentHostEntries, removeSSHRemoteAgentHostEntry, storeSSHRemoteAgentHostEntries, upsertRemoteAgentHostEntry } from "./module-1736.mjs";
import { localize } from "./module-0001.mjs";
import { Emitter } from "./module-0017.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { decideHostKeyTrust } from "./module-4239.mjs";
import { Codicon } from "./module-0085.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { toAction } from "./module-0082.mjs";
import { promptRemoteAgentHostLocationPreference } from "./module-3559.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IRemoteAgentHostLocationPreferenceService } from "./module-3558.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IProductService } from "./module-0875.mjs";
import { ISSHHostKeyTrustService } from "./module-4054.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/platform/agentHost/electron-browser/sshRemoteAgentHostServiceImpl.ts
function describeHostKeyType(keyType) {
  switch (keyType) {
    case "ssh-ed25519":
      return "ED25519";
    case "ssh-rsa":
    case "rsa-sha2-256":
    case "rsa-sha2-512":
      return "RSA";
    case "ssh-dss":
      return "DSA";
    case "ecdsa-sha2-nistp256":
    case "ecdsa-sha2-nistp384":
    case "ecdsa-sha2-nistp521":
      return "ECDSA";
    default:
      return keyType;
  }
}

var ISSHRelayClientFactory = createDecorator("sshRelayClientFactory");

var SSHRelayClientFactory = class {
  constructor(_instantiationService, _configurationService, _environmentService, _logService) {
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._logService = _logService;
  }
  createClient(mainService, connectionId, address, reestablish) {
    const ahpLoggingEnabled = !!this._configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
    let seedConnection = true;
    const establish = async () => {
      if (seedConnection) {
        seedConnection = false;
        return { connectionId };
      }
      try {
        const result = await reestablish();
        return {
          connectionId: result.connectionId,
          close: () => mainService.disconnect(result.connectionId)
        };
      } catch (error) {
        if (isSSHHostKeyDeniedError(error)) {
          throw new NonReconnectableTransportError(error.message);
        }
        throw error;
      }
    };
    return this._instantiationService.createInstance(AgentHostProtocolClient, address, () => {
      const createLogger = () => ahpLoggingEnabled ? this._instantiationService.createInstance(
        AhpJsonlLogger,
        { logsHome: this._environmentService.logsHome, connectionId, transport: "ssh" }
      ) : void 0;
      return new ReconnectingRelayTransport(
        establish,
        mainService,
        createLogger,
        this._logService,
        "[SSHRelayTransport]",
        "ssh" /* SSH */
      );
    }, { clientInfo: agentsWindowAgentHostClientInfo });
  }
};

SSHRelayClientFactory = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILogService)
], SSHRelayClientFactory);

var SSHConnectionFactory = class extends Disposable {
  constructor(_storageService, _configurationService, _logService, _mainService, _remoteAgentHostService, _relayClientFactory, _locationPreferenceService, _notificationService, _connections, _onDidChangeConnections) {
    super();
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._mainService = _mainService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._relayClientFactory = _relayClientFactory;
    this._locationPreferenceService = _locationPreferenceService;
    this._notificationService = _notificationService;
    this._connections = _connections;
    this._onDidChangeConnections = _onDidChangeConnections;
    this.kind = "ssh" /* SSH */;
    this._stagedConfigurations = /* @__PURE__ */ new Map();
    // Survives connection cleanup so an automatic reconnect can identify an
    // editor-to-standalone endpoint failover after a successful handshake.
    this._lastConnectedServerTypeByAddress = /* @__PURE__ */ new Map();
    this.entries = observableFromEvent(
      this,
      this._storageService.onDidChangeValue(-1 /* APPLICATION */, SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, this._store),
      () => readSSHRemoteAgentHostEntries(this._storageService)
    );
    void this._migrateLegacyEntries();
  }
  stageConfiguration(config) {
    const address = computeSSHConnectionKey(config);
    const entry = {
      name: config.name,
      connection: {
        type: "ssh" /* SSH */,
        address,
        sshConfigHost: config.sshConfigHost,
        hostName: config.host,
        user: config.username,
        port: config.port
      }
    };
    this._stagedConfigurations.set(address, config);
    storeSSHRemoteAgentHostEntries(this._storageService, upsertRemoteAgentHostEntry(readSSHRemoteAgentHostEntries(this._storageService), entry));
    return entry;
  }
  getEntryForSSHConfigHost(sshConfigHost) {
    return readSSHRemoteAgentHostEntries(this._storageService).find(
      (entry) => entry.connection.type === "ssh" /* SSH */ && entry.connection.sshConfigHost === sshConfigHost
    );
  }
  async createConnection(entry, options3) {
    if (entry.connection.type !== "ssh" /* SSH */) {
      throw new Error(`SSH factory cannot create a ${entry.connection.type} connection.`);
    }
    const stagedConfig = this._stagedConfigurations.get(entry.connection.address);
    this._stagedConfigurations.delete(entry.connection.address);
    const result = stagedConfig ? await this._mainService.connect(this._augmentConfig({ ...stagedConfig, userInitiated: stagedConfig.userInitiated ?? options3.userInitiated })) : entry.connection.sshConfigHost ? await this._mainService.reconnect(
      entry.connection.sshConfigHost,
      entry.name,
      this._getRemoteAgentHostCommand(),
      this._isSSHAgentForwardingEnabled(),
      options3.userInitiated,
      this._locationPreferenceService.getPreference(computeSSHConnectionKey({ sshConfigHost: entry.connection.sshConfigHost }))
    ) : await this._mainService.connect(this._augmentConfig({
      host: entry.connection.hostName,
      port: entry.connection.port,
      username: entry.connection.user ?? entry.connection.hostName,
      authMethod: "agent" /* Agent */,
      name: entry.name,
      userInitiated: options3.userInitiated
    }));
    this._logService.trace(`[SSHRemoteAgentHost] SSH tunnel established, connectionId=${result.connectionId}`);
    const existing = this._connections.get(result.connectionId);
    const persistedEntry = {
      name: result.name,
      connectionToken: result.connectionToken,
      connection: {
        type: "ssh" /* SSH */,
        address: result.address,
        sshConfigHost: result.sshConfigHost,
        hostName: result.config.host,
        user: result.config.username || void 0,
        port: result.config.port,
        serverType: result.serverType,
        instanceId: result.instanceId,
        primary: result.primary,
        lifecycle: result.lifecycle
      }
    };
    if (existing) {
      if (this._remoteAgentHostService.getConnection(result.address)) {
        this._logService.trace("[SSHRemoteAgentHost] Returning existing connection handle");
        this.storeEntry(persistedEntry);
        return {
          connection: this._createRelayClient(result),
          transportDisposable: this._createTransportDisposable(result.connectionId, existing, this._observeSuccessfulConnection(result, options3.userInitiated))
        };
      }
      this._logService.info(`[SSHRemoteAgentHost] Replacing stale connection handle for ${result.address}`);
      this._connections.delete(result.connectionId);
      existing.fireClose();
      existing.dispose();
      this._onDidChangeConnections();
    }
    const handle2 = new SSHAgentHostConnectionHandle(
      result.config,
      result.address,
      result.name,
      result.serverType,
      result.instanceId,
      result.primary,
      result.lifecycle,
      () => this._mainService.disconnect(result.connectionId)
    );
    try {
      this._connections.set(result.connectionId, handle2);
      this._onDidChangeConnections();
      this.storeEntry(persistedEntry);
      const endpointSelectionObserver = this._observeSuccessfulConnection(result, options3.userInitiated);
      return {
        connection: this._createRelayClient(result),
        transportDisposable: this._createTransportDisposable(result.connectionId, handle2, endpointSelectionObserver)
      };
    } catch (err) {
      this._logService.error("[SSHRemoteAgentHost] Connection setup failed", err);
      if (this._connections.get(result.connectionId) === handle2) {
        this._connections.delete(result.connectionId);
        this._onDidChangeConnections();
      }
      handle2.dispose();
      this._mainService.disconnect(result.connectionId).catch(() => {
      });
      throw err;
    }
  }
  storeEntry(entry) {
    storeSSHRemoteAgentHostEntries(this._storageService, upsertRemoteAgentHostEntry(readSSHRemoteAgentHostEntries(this._storageService), entry));
  }
  _observeSuccessfulConnection(result, userInitiated) {
    const listener = this._remoteAgentHostService.onDidChangeConnections(() => {
      const status2 = this._remoteAgentHostService.connections.find((connection) => connection.address === result.address)?.status;
      if (RemoteAgentHostConnectionStatus.isConnected(status2)) {
        listener?.dispose();
        this._recordEndpointSelection(result, userInitiated);
      } else if (!status2 || RemoteAgentHostConnectionStatus.isIncompatible(status2)) {
        listener?.dispose();
      }
    });
    return listener;
  }
  _recordEndpointSelection(result, userInitiated) {
    if (!result.serverType) {
      return;
    }
    const previousServerType = this._lastConnectedServerTypeByAddress.get(result.address);
    const isUnattendedFailoverFromEditor = userInitiated === false && previousServerType === "editor" && result.serverType === "standalone";
    this._lastConnectedServerTypeByAddress.set(result.address, result.serverType);
    if (isUnattendedFailoverFromEditor) {
      this._notificationService.info(localize(
        2197,
        null
      ));
    }
  }
  _createTransportDisposable(connectionId, handle2, endpointSelectionObserver) {
    return toDisposable(() => {
      endpointSelectionObserver?.dispose();
      if (this._connections.get(connectionId) === handle2) {
        this._connections.delete(connectionId);
        this._onDidChangeConnections();
      }
      handle2.fireClose();
      handle2.dispose();
      this._mainService.disconnect(connectionId).catch(() => {
      });
    });
  }
  _createRelayClient(result) {
    const reestablish = async () => {
      if (!result.sshConfigHost) {
        throw new NonReconnectableTransportError("Cannot automatically reconnect an SSH connection without an SSH config host.");
      }
      const preferredAgentLocation = this._locationPreferenceService.getPreference(computeSSHConnectionKey({ sshConfigHost: result.sshConfigHost }));
      const reconnected = await this._mainService.reconnect(result.sshConfigHost, result.name, this._getRemoteAgentHostCommand(), this._isSSHAgentForwardingEnabled(), false, preferredAgentLocation);
      return { connectionId: reconnected.connectionId };
    };
    return this._relayClientFactory.createClient(this._mainService, result.connectionId, result.address, reestablish);
  }
  _augmentConfig(config) {
    const result = { ...config };
    const commandOverride = this._getRemoteAgentHostCommand();
    if (commandOverride) {
      result.remoteAgentHostCommand = commandOverride;
    }
    if (this._isSSHAgentForwardingEnabled() && config.agentForward) {
      result.agentForward = true;
    }
    const preferredAgentLocation = this._locationPreferenceService.getPreference(computeSSHConnectionKey(config));
    if (preferredAgentLocation) {
      result.preferredAgentLocation = preferredAgentLocation;
    }
    return result;
  }
  _getRemoteAgentHostCommand() {
    return this._configurationService.getValue("chat.sshRemoteAgentHostCommand") || void 0;
  }
  _isSSHAgentForwardingEnabled() {
    return this._configurationService.getValue("chat.agentHost.forwardSSHAgent") || void 0;
  }
  async _migrateLegacyEntries() {
    try {
      const settings = readRemoteAgentHostSettings(this._configurationService);
      const legacyEntries = settings.entries.filter(isRawRemoteAgentHostEntry).filter(isLegacySshRawEntry).map(parseLegacyRawEntry).filter((entry) => entry.connection.type === "ssh" /* SSH */);
      if (legacyEntries.length === 0) {
        return;
      }
      let sshEntries = readSSHRemoteAgentHostEntries(this._storageService);
      for (const entry of legacyEntries) {
        sshEntries = upsertRemoteAgentHostEntry(sshEntries, entry);
      }
      storeSSHRemoteAgentHostEntries(this._storageService, sshEntries);
      const remainingEntries = settings.entries.filter((entry) => !isRawRemoteAgentHostEntry(entry) || !isLegacySshRawEntry(entry));
      await this._configurationService.updateValue(RemoteAgentHostsSettingId, remainingEntries, settings.target);
    } catch (err) {
      this._logService.error("[RemoteAgentHost] Failed to migrate SSH connection details from settings to storage", err);
    }
  }
};

var SSHRemoteAgentHostService = class extends Disposable {
  constructor(sharedProcessService, _remoteAgentHostService, _logService, _configurationService, _relayClientFactory, _quickInputService, _notificationService, _locationPreferenceService, _dialogService, _productService, _hostKeyTrustService, _storageService) {
    super();
    this._remoteAgentHostService = _remoteAgentHostService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._relayClientFactory = _relayClientFactory;
    this._quickInputService = _quickInputService;
    this._notificationService = _notificationService;
    this._locationPreferenceService = _locationPreferenceService;
    this._dialogService = _dialogService;
    this._productService = _productService;
    this._hostKeyTrustService = _hostKeyTrustService;
    this._storageService = _storageService;
    this._onDidChangeConnections = this._register(new Emitter());
    this.onDidChangeConnections = this._onDidChangeConnections.event;
    this._connections = /* @__PURE__ */ new Map();
    /**
     * The host key that authenticated the most recent session for a given
     * connection key. Used to decide whether an `UpdateHostKeys` announcement
     * may be trusted (see {@link _handleAnnouncedHostKeys}). Bounded by the
     * number of distinct SSH hosts, and each entry is overwritten on reconnect.
     */
    this._sessionHostKeys = /* @__PURE__ */ new Map();
    this._mainService = ProxyChannel.toService(
      sharedProcessService.getChannel(SSH_REMOTE_AGENT_HOST_CHANNEL)
    );
    this._connectionFactory = this._register(new SSHConnectionFactory(
      this._storageService,
      this._configurationService,
      this._logService,
      this._mainService,
      this._remoteAgentHostService,
      this._relayClientFactory,
      this._locationPreferenceService,
      this._notificationService,
      this._connections,
      () => this._onDidChangeConnections.fire()
    ));
    this._register(this._remoteAgentHostService.registerConnectionFactory(this._connectionFactory));
    this.onDidReportConnectProgress = this._mainService.onDidReportConnectProgress;
    this._register(this._mainService.onDidCloseConnection((connectionId) => {
      this._logService.info(`[SSHRemoteAgentHost] onDidCloseConnection: connectionId=${connectionId}`);
      const handle2 = this._connections.get(connectionId);
      if (handle2) {
        this._logService.info(`[SSHRemoteAgentHost] onDidCloseConnection: found handle for ${connectionId}, cleaning up`);
        this._connections.delete(connectionId);
        handle2.fireClose();
        handle2.dispose();
        this._onDidChangeConnections.fire();
        this._logService.info(`[SSHRemoteAgentHost] onDidCloseConnection: notifying protocol client for ${handle2.localAddress}`);
        this._remoteAgentHostService.notifyConnectionClosed(handle2.localAddress);
      } else {
        this._logService.info(`[SSHRemoteAgentHost] onDidCloseConnection: no renderer-side handle for ${connectionId} (already cleaned up?)`);
      }
    }));
    this._register(this._mainService.onDidRequestKeyboardInteractive((request2) => {
      this._handleKeyboardInteractiveRequest(request2);
    }));
    this._register(this._mainService.onDidRequestEndpointSelection((request2) => {
      this._handleEndpointSelectionRequest(request2);
    }));
    this._register(this._mainService.onDidRequestHostKeyVerification((request2) => {
      this._trackHostKeyVerification(this._handleHostKeyVerificationRequest(request2));
    }));
    this._register(this._mainService.onDidAnnounceHostKeys((announcement) => {
      this._handleAnnouncedHostKeys(announcement);
    }));
  }
  get connections() {
    return [...this._connections.values()];
  }
  async connect(config) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      throw new Error("Remote agent host connections are not enabled.");
    }
    const entry = this._connectionFactory.stageConfiguration({ ...config, userInitiated: config.userInitiated ?? true });
    const address = getEntryAddress(entry);
    this._remoteAgentHostService.reconnect(address, true);
    await this._remoteAgentHostService.waitForConnection(address);
    return this._getConnectionHandle(address);
  }
  async disconnect(host) {
    removeSSHRemoteAgentHostEntry(this._storageService, host);
    await this._mainService.disconnect(host);
  }
  async listSSHConfigHosts() {
    return this._mainService.listSSHConfigHosts();
  }
  async ensureUserSSHConfig() {
    return this._mainService.ensureUserSSHConfig();
  }
  async listSSHConfigFiles() {
    return this._mainService.listSSHConfigFiles();
  }
  async resolveSSHConfig(host) {
    return this._mainService.resolveSSHConfig(host);
  }
  async reconnect(sshConfigHost, _name, userInitiated) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      throw new Error("Remote agent host connections are not enabled.");
    }
    const entry = this._connectionFactory.getEntryForSSHConfigHost(sshConfigHost);
    if (!entry) {
      throw new Error(`No SSH remote agent host entry found for ${sshConfigHost}.`);
    }
    const address = getEntryAddress(entry);
    this._remoteAgentHostService.reconnect(address, userInitiated ?? true);
    await this._remoteAgentHostService.waitForConnection(address);
    return this._getConnectionHandle(address);
  }
  _getConnectionHandle(address) {
    const handle2 = [...this._connections.values()].find((candidate) => candidate.localAddress === address);
    if (!handle2) {
      throw new Error(`SSH connection handle not found for ${address}.`);
    }
    return handle2;
  }
  async _handleKeyboardInteractiveRequest(request2) {
    this._logService.info(`[SSHRemoteAgentHost] Keyboard-interactive prompt for ${request2.displayHost} (${request2.prompts.length} prompt(s))`);
    const cts = new CancellationTokenSource();
    const cancelListener = this._mainService.onDidCancelKeyboardInteractive((requestId) => {
      if (requestId === request2.requestId) {
        cts.cancel();
      }
    });
    try {
      if (request2.prompts.length === 0) {
        await this._mainService.respondKeyboardInteractive(request2.requestId, []);
        return;
      }
      const responses = [];
      for (let i2 = 0; i2 < request2.prompts.length; i2++) {
        if (cts.token.isCancellationRequested) {
          return;
        }
        const prompt = request2.prompts[i2];
        const cleanedPrompt = prompt.prompt.replace(/[\s:]+$/, "");
        const title = request2.prompts.length > 1 ? `${request2.displayHost} (${i2 + 1}/${request2.prompts.length})` : request2.displayHost;
        const value2 = await this._quickInputService.input({
          title,
          prompt: cleanedPrompt || localize(2208, null, request2.username, request2.displayHost),
          password: !prompt.echo,
          ignoreFocusLost: true
        }, cts.token);
        if (cts.token.isCancellationRequested) {
          return;
        }
        if (value2 === void 0) {
          await this._mainService.respondKeyboardInteractive(request2.requestId, void 0);
          return;
        }
        responses.push(value2);
      }
      if (cts.token.isCancellationRequested) {
        return;
      }
      await this._mainService.respondKeyboardInteractive(request2.requestId, responses);
    } catch (err) {
      this._logService.error("[SSHRemoteAgentHost] Failed handling keyboard-interactive prompt", err);
      try {
        await this._mainService.respondKeyboardInteractive(request2.requestId, void 0);
      } catch {
      }
    } finally {
      cancelListener.dispose();
      cts.dispose();
    }
  }
  /**
   * Decide whether to trust a server's host key, and tell the shared process.
   *
   * Policy lives in {@link decideHostKeyTrust}; this method owns the UI and
   * the storage writes. Every path must respond exactly once — the SSH
   * handshake is suspended until it hears back.
   */
  /**
   * Hook for observing when a host key verification has fully settled.
   * Overridden by tests so they can await the real operation instead of
   * sleeping for a fixed interval, which is load-dependent and flaky —
   * particularly for the cases that assert *nothing* happened.
   */
  _trackHostKeyVerification(handled) {
    void handled;
  }
  async _handleHostKeyVerificationRequest(request2) {
    this._logService.info(`[SSHRemoteAgentHost] Host key verification for ${request2.displayHost}: ${request2.keyType} ${request2.fingerprint} (known_hosts: ${request2.knownHostsMatch})`);
    const cts = new CancellationTokenSource();
    const cancelListener = this._mainService.onDidCancelHostKeyVerification((requestId) => {
      if (requestId === request2.requestId) {
        cts.cancel();
      }
    });
    try {
      const decision = decideHostKeyTrust(request2, this._hostKeyTrustService.getTrustedKeys(request2.host, request2.port));
      this._logService.info(`[SSHRemoteAgentHost] Host key decision for ${request2.displayHost}: ${decision.kind} (${decision.reason})`);
      let trusted;
      switch (decision.kind) {
        case "trust":
          if (decision.persist) {
            this._trustHostKey(request2);
          }
          trusted = true;
          break;
        case "deny":
          this._reportHostKeyDenied(request2, decision);
          trusted = false;
          break;
        case "prompt": {
          trusted = await this._promptForHostKey(request2, decision.reason, cts.token);
          if (cts.token.isCancellationRequested) {
            return;
          }
          if (trusted) {
            this._trustHostKey(request2);
          }
          break;
        }
      }
      if (cts.token.isCancellationRequested) {
        return;
      }
      this._sessionHostKeys.set(request2.connectionKey, { keyType: request2.keyType, fingerprint: request2.fingerprint });
      await this._mainService.respondHostKeyVerification(request2.requestId, trusted);
    } catch (err) {
      this._logService.error("[SSHRemoteAgentHost] Failed handling host key verification", err);
      try {
        await this._mainService.respondHostKeyVerification(request2.requestId, false);
      } catch {
      }
    } finally {
      cancelListener.dispose();
      cts.dispose();
    }
  }
  _trustHostKey(request2) {
    this._hostKeyTrustService.trustHostKey(request2.host, request2.port, {
      keyType: request2.keyType,
      fingerprint: request2.fingerprint,
      addedAt: Date.now(),
      ...request2.displayHost !== request2.host ? { alias: request2.displayHost } : void 0
    });
  }
  /**
   * Ask the user whether to trust an unrecognized host key, echoing OpenSSH's
   * wording so it is recognizable to anyone who has used `ssh` directly.
   * Cancel is the default so the safe answer is the one you get by dismissing.
   *
   * Uses a custom dialog so the prompt can be dismissed programmatically when
   * the connection dies underneath it — a native dialog cannot be, and would
   * strand the user with a question about a connection that no longer exists.
   * Answering a stale prompt was always safe (the caller re-checks
   * cancellation before acting), but leaving it on screen is confusing.
   */
  async _promptForHostKey(request2, reason, token) {
    if (token.isCancellationRequested) {
      return false;
    }
    const detail2 = reason === "ca-only" ? localize(
      2199,
      null,
      describeHostKeyType(request2.keyType),
      request2.fingerprint
    ) : localize(
      2206,
      null,
      describeHostKeyType(request2.keyType),
      request2.fingerprint
    );
    const { confirmed } = await this._dialogService.confirm({
      type: "warning",
      message: localize(2207, null, request2.displayHost),
      detail: detail2,
      primaryButton: localize(2202, null),
      cancelButton: localize(2198, null),
      custom: { icon: Codicon.shield },
      // Cancellation resolves the dialog as if Cancel was pressed, which
      // is also the answer we want for a connection that is already gone.
      token
    });
    return confirmed;
  }
  /**
   * Explain a refusal. A changed or revoked key gets an error notification
   * with no "trust anyway" affordance — recovering requires explicitly
   * forgetting the host, so a possible impersonation cannot be dismissed
   * with a single reflexive click.
   */
  _reportHostKeyDenied(request2, denial) {
    if (denial.reason === "not-user-initiated") {
      this._logService.warn(`[SSHRemoteAgentHost] Declining unknown host key for ${request2.displayHost} during a background reconnect; connect manually to review it.`);
      return;
    }
    if (denial.reason === "strict-yes") {
      this._notificationService.error(localize(
        2205,
        null,
        request2.displayHost
      ));
      return;
    }
    if (denial.reason !== "mismatch") {
      this._notificationService.error(localize(
        2204,
        null,
        request2.displayHost,
        describeHostKeyType(request2.keyType)
      ));
      return;
    }
    if (denial.source === "known-hosts") {
      this._notificationService.error(localize(
        2201,
        null,
        request2.displayHost,
        describeHostKeyType(request2.keyType),
        request2.fingerprint
      ));
      return;
    }
    this._notificationService.notify({
      severity: Severity2.Error,
      message: localize(
        2200,
        null,
        request2.displayHost,
        describeHostKeyType(request2.keyType),
        request2.fingerprint
      ),
      actions: {
        primary: [toAction({
          id: "sshHostKey.forget",
          label: localize(2203, null),
          run: () => this._hostKeyTrustService.forgetHost(request2.host, request2.port)
        })]
      }
    });
  }
  /**
   * Persist host keys the server proved it owns, so a legitimate key
   * rotation is invisible to the user instead of a hard failure on the next
   * connect.
   *
   * ssh2 verifies the `hostkeys-prove` signatures before surfacing these,
   * but that only proves the keys belong to *whoever we are currently
   * talking to* — it says nothing about whether that party is the real host.
   * So we additionally require that the host key which authenticated this
   * very session is itself currently trusted. This mirrors OpenSSH, whose
   * `UpdateHostKeys` documentation states additional host keys are accepted
   * only "if the key used to authenticate the host was already trusted or
   * explicitly accepted by the user".
   *
   * Without that check, a session accepted through
   * `StrictHostKeyChecking=no` — where we deliberately did not verify
   * anything — could announce keys that overwrite the user's genuine stored
   * key, leaving an impostor's key trusted once strict checking is restored.
   */
  _handleAnnouncedHostKeys(announcement) {
    const existing = this._hostKeyTrustService.getTrustedKeys(announcement.host, announcement.port);
    if (!existing.length) {
      return;
    }
    const sessionKey = this._sessionHostKeys.get(announcement.connectionKey);
    if (!sessionKey || !existing.some((e4) => e4.keyType === sessionKey.keyType && e4.fingerprint === sessionKey.fingerprint)) {
      this._logService.warn(`[SSHRemoteAgentHost] Ignoring announced host keys for ${announcement.host}: the key that authenticated this session is not itself trusted`);
      return;
    }
    for (const key3 of announcement.keys) {
      if (!existing.some((e4) => e4.keyType === key3.keyType && e4.fingerprint === key3.fingerprint)) {
        this._logService.info(`[SSHRemoteAgentHost] Learned rotated ${key3.keyType} host key for ${announcement.host}: ${key3.fingerprint}`);
        this._hostKeyTrustService.trustHostKey(announcement.host, announcement.port, {
          keyType: key3.keyType,
          fingerprint: key3.fingerprint,
          addedAt: Date.now()
        });
      }
    }
  }
  /**
   * Resolve which live remote agent host endpoint (or "start a new one")
   * to connect to and forward the choice (or cancellation) back to the
   * main service. Consults the stored per-host {@link IRemoteAgentHostLocationPreferenceService}
   * preference for `request.connectionKey` first; only opens the shared
   * preference modal ({@link promptRemoteAgentHostLocationPreference})
   * when no preference is stored and an `editor`-owned endpoint is live,
   * since otherwise there's no ambiguity worth interrupting the user for.
   */
  async _handleEndpointSelectionRequest(request2) {
    this._logService.info(`[SSHRemoteAgentHost] Endpoint selection requested for ${request2.displayHost} (${request2.candidates.length} candidate(s))`);
    const cts = new CancellationTokenSource();
    const cancelListener = this._mainService.onDidCancelEndpointSelection((requestId) => {
      if (requestId === request2.requestId) {
        cts.cancel();
      }
    });
    try {
      const selection = await this._resolveEndpointSelection(request2, cts.token);
      await this._mainService.respondEndpointSelection(request2.requestId, selection);
    } catch (err) {
      this._logService.error("[SSHRemoteAgentHost] Failed handling endpoint selection prompt", err);
      try {
        await this._mainService.respondEndpointSelection(request2.requestId, void 0);
      } catch {
      }
    } finally {
      cancelListener.dispose();
      cts.dispose();
    }
  }
  /**
   * Apply the preference-resolution rules described on
   * {@link _handleEndpointSelectionRequest}. Returns `undefined` only when
   * the shared preference modal was shown and the user cancelled it.
   */
  async _resolveEndpointSelection(request2, token) {
    const hasLiveEditor = request2.candidates.some((candidate) => candidate.type === "editor");
    const preference = this._locationPreferenceService.getPreference(request2.connectionKey);
    if (preference === "editor") {
      return hasLiveEditor ? this._deterministicSelection(request2.candidates, "editor") : this._dedicatedSelection(request2.candidates);
    }
    if (preference === "dedicated") {
      return this._dedicatedSelection(request2.candidates);
    }
    if (!hasLiveEditor) {
      return this._dedicatedSelection(request2.candidates);
    }
    const chosen = await promptRemoteAgentHostLocationPreference(this._dialogService, request2.displayHost, this._productService.nameShort, void 0, token);
    if (token.isCancellationRequested || !chosen) {
      return void 0;
    }
    this._locationPreferenceService.setPreference(request2.connectionKey, chosen);
    return chosen === "editor" ? this._deterministicSelection(request2.candidates, "editor") : this._dedicatedSelection(request2.candidates);
  }
  /** Reuse a live standalone endpoint if one exists, or spawn a new dedicated one. */
  _dedicatedSelection(candidates) {
    return this._deterministicSelection(candidates, "standalone") ?? { kind: "spawn" };
  }
  /**
   * Pick the candidate of `type` deterministically when several are live,
   * by sorting on `instanceId` so every renderer resolving the same
   * request (e.g. multiple open editor windows) converges on the same
   * choice without needing to coordinate.
   */
  _deterministicSelection(candidates, type) {
    const matching = candidates.filter((candidate) => candidate.type === type);
    if (matching.length === 0) {
      return void 0;
    }
    const [chosen] = matching.slice().sort((a, b) => a.instanceId < b.instanceId ? -1 : a.instanceId > b.instanceId ? 1 : 0);
    return { kind: "candidate", type: chosen.type, pid: chosen.pid, instanceId: chosen.instanceId };
  }
};

SSHRemoteAgentHostService = __decorateClass([
  __decorateParam(0, ISharedProcessService),
  __decorateParam(1, IRemoteAgentHostService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ISSHRelayClientFactory),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IRemoteAgentHostLocationPreferenceService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IProductService),
  __decorateParam(10, ISSHHostKeyTrustService),
  __decorateParam(11, IStorageService)
], SSHRemoteAgentHostService);

var SSHAgentHostConnectionHandle = class extends Disposable {
  constructor(config, localAddress, name, serverType, instanceId, primary, lifecycle, disconnectFn) {
    super();
    this.config = config;
    this.localAddress = localAddress;
    this.name = name;
    this.serverType = serverType;
    this.instanceId = instanceId;
    this.primary = primary;
    this.lifecycle = lifecycle;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._closedByMain = false;
    this._register(toDisposable(() => {
      if (!this._closedByMain) {
        disconnectFn().catch(() => {
        });
      }
    }));
  }
  /** Called by the service when the main process signals connection closure. */
  fireClose() {
    this._closedByMain = true;
    this._onDidClose.fire();
  }
};
export { describeHostKeyType, ISSHRelayClientFactory, SSHRelayClientFactory, SSHConnectionFactory, SSHRemoteAgentHostService, SSHAgentHostConnectionHandle };
