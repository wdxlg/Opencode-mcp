// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/remoteAgentHostServiceImpl.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId, RemoteAgentHostsSettingId, getEntryTypeConfig, readWebSocketRemoteAgentHostEntries } from "./module-1808.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1107.mjs";
import { WebSocketClientTransport } from "./module-3936.mjs";
import { AgentHostProtocolClient } from "./module-3927.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { agentsWindowAgentHostClientInfo, editorWindowAgentHostClientInfo } from "./module-3929.mjs";
import { AGENT_HOST_LABEL_FORMATTER, AGENT_HOST_SCHEME, agentHostAuthority, normalizeRemoteAgentHostAddress } from "./module-1000.mjs";
import { hasKey } from "./module-0010.mjs";
import { DeferredPromise, raceTimeout } from "./module-0036.mjs";
import { PROTOCOL_VERSION } from "./module-2884.mjs";
import { computeReconnectDelay, hasExhaustedReconnectAttempts } from "./module-1807.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/platform/agentHost/browser/remoteAgentHostServiceImpl.ts
// OpenCode p30: 连接类错误（ConnectError / HTTP2 GOAWAY / 流重连失败）去重：同一条错误每分钟只记一次 warn，并附带被省略的次数；重连本身沿用 reconnectPolicy 的指数退避 1s,2s,4s…封顶 30s
var ocP30LastLog = /* @__PURE__ */ new Map();
function ocP30WarnOnce(logService, message, err) {
  const detail = err === void 0 ? "" : err instanceof Error ? `${err.name && err.name !== "Error" ? err.name + ": " : ""}${err.message}` : String(err);
  const key = `${message}|${detail}`;
  const now = Date.now();
  const prev = ocP30LastLog.get(key);
  if (prev && now - prev.at < 6e4) {
    prev.suppressed++;
    return;
  }
  const suffix = prev?.suppressed ? ` (重复 ${prev.suppressed} 次已省略)` : "";
  ocP30LastLog.set(key, { at: now, suppressed: 0 });
  if (ocP30LastLog.size > 200) {
    for (const [k, v] of ocP30LastLog) {
      if (now - v.at >= 6e4) ocP30LastLog.delete(k);
    }
  }
  logService.warn(detail ? `${message}: ${detail}${suffix}` : `${message}${suffix}`);
}
function disposeEntry(entry) {
  entry.store.dispose();
  entry.transportDisposable?.dispose();
}

var WebSocketConnectionFactory = class extends Disposable {
  constructor(_instantiationService, _configurationService, _environmentService, _clientInfo) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._clientInfo = _clientInfo;
    this.kind = "websocket" /* WebSocket */;
    this.entries = observableFromEvent(
      this,
      Event2.filter(
        this._configurationService.onDidChangeConfiguration,
        (event) => event.affectsConfiguration(RemoteAgentHostsSettingId)
      ),
      () => this._getEntries()
    );
  }
  createConnection(entry, _options) {
    if (entry.connection.type !== "websocket" /* WebSocket */) {
      throw new Error(`WebSocket factory cannot create a ${entry.connection.type} connection.`);
    }
    const address = entry.connection.address;
    const ahpLoggingEnabled = !!this._configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
    const transportFactory = () => this._instantiationService.createInstance(
      WebSocketClientTransport,
      address,
      entry.connectionToken,
      ahpLoggingEnabled ? { logsHome: this._environmentService.logsHome, connectionId: address, transport: "websocket" } : void 0
    );
    const connection = this._instantiationService.createInstance(AgentHostProtocolClient, address, transportFactory, { clientInfo: this._clientInfo() });
    return Promise.resolve({ connection });
  }
  _getEntries() {
    return readWebSocketRemoteAgentHostEntries(this._configurationService);
  }
};

var RemoteAgentHostService = class extends Disposable {
  constructor(_configurationService, _instantiationService, _logService, _labelService, _environmentService) {
    super();
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._labelService = _labelService;
    this._environmentService = _environmentService;
    this._onDidChangeConnections = this._register(new Emitter());
    this.onDidChangeConnections = this._onDidChangeConnections.event;
    this._entries = /* @__PURE__ */ new Map();
    this._connectionFactories = /* @__PURE__ */ new Map();
    this._connectionFactoriesObservable = observableValue(this, []);
    this._configuredEntries = derived(this, (reader) => {
      let entries2 = [];
      for (const factory of this._connectionFactoriesObservable.read(reader)) {
        for (const entry of factory.entries.read(reader)) {
          entries2 = this._upsertEntry(entries2, entry);
        }
      }
      return entries2;
    });
    /** In-flight connection attempts, keyed by normalized address. */
    this._pendingConnects = /* @__PURE__ */ new Map();
    this._names = /* @__PURE__ */ new Map();
    this._tokens = /* @__PURE__ */ new Map();
    /**
     * Stores the original {@link IRemoteAgentHostEntry} for connections
     * registered via {@link addManagedConnection}. This is needed because
     * tunnel entries are not persisted to settings and therefore don't
     * appear in {@link configuredEntries}.
     */
    this._registeredEntries = /* @__PURE__ */ new Map();
    this._pendingConnectionWaits = /* @__PURE__ */ new Map();
    /** Pending reconnect timeouts, keyed by normalized address. */
    this._reconnectTimeouts = /* @__PURE__ */ new Map();
    /** Current reconnect attempt count per address for exponential backoff. */
    this._reconnectAttempts = /* @__PURE__ */ new Map();
    /**
     * Per-address {@link ILabelService} formatter handles for the
     * {@link AGENT_HOST_SCHEME}. The formatter advertises the entry's
     * human-readable name as the host label so any UI looking up the host
     * label for an agent host URI gets the friendly name.
     */
    this._labelFormatters = /* @__PURE__ */ new Map();
    this._register(this.registerConnectionFactory(this._register(new WebSocketConnectionFactory(
      this._instantiationService,
      this._configurationService,
      this._environmentService,
      () => this.clientInfo
    ))));
    this._register(autorun((reader) => {
      this._configuredEntries.read(reader);
      this._reconcileConnections();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(RemoteAgentHostsEnabledSettingId)) {
        this._reconcileConnections();
      }
    }));
  }
  static {
    this.ConnectionWaitTimeout = 1e4;
  }
  static {
    /**
     * How long to wait for a server-upgrade trigger to be acknowledged.
     * The CLI awaits the binary download synchronously before responding,
     * so this needs to accommodate first-time downloads on slow networks.
     */
    this.UpgradeRequestTimeout = 5 * 60 * 1e3;
  }
  get clientInfo() {
    return editorWindowAgentHostClientInfo;
  }
  _entryAddress(entry) {
    const config = getEntryTypeConfig(entry.connection.type);
    const address = config.address(entry.connection);
    return config.normalizedAddress ? normalizeRemoteAgentHostAddress(address) : address;
  }
  _normalizeEntry(entry) {
    const config = getEntryTypeConfig(entry.connection.type);
    if (!config.normalizedAddress || !hasKey(entry.connection, { address: true })) {
      return entry;
    }
    return { ...entry, connection: { ...entry.connection, address: normalizeRemoteAgentHostAddress(entry.connection.address) } };
  }
  get connections() {
    const result = [];
    for (const [address, entry] of this._entries) {
      result.push({
        address,
        name: this._names.get(address) ?? address,
        clientId: entry.client.clientId,
        defaultDirectory: entry.client.defaultDirectory,
        status: entry.status
      });
    }
    return result;
  }
  get configuredEntries() {
    return this._configuredEntries.get().map((entry) => this._normalizeEntry(entry));
  }
  registerConnectionFactory(factory) {
    if (this._connectionFactories.has(factory.kind)) {
      throw new Error(`A remote agent host connection factory is already registered for ${factory.kind}.`);
    }
    this._connectionFactories.set(factory.kind, factory);
    this._connectionFactoriesObservable.set([...this._connectionFactories.values()], void 0);
    return toDisposable(() => {
      if (this._connectionFactories.get(factory.kind) === factory) {
        this._connectionFactories.delete(factory.kind);
        this._connectionFactoriesObservable.set([...this._connectionFactories.values()], void 0);
      }
    });
  }
  getConnection(address) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    const entry = this._entries.get(normalized);
    return entry?.connected ? entry.client : void 0;
  }
  getConnectionByAuthority(authority) {
    for (const [address, entry] of this._entries) {
      if (entry.connected && agentHostAuthority(address) === authority) {
        return entry.client;
      }
    }
    return void 0;
  }
  getEntryByAddress(address) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    const registered = this._registeredEntries.get(normalized);
    if (registered) {
      return registered;
    }
    return this.configuredEntries.find(
      (entry) => this._entryAddress(entry) === normalized
    );
  }
  async triggerServerUpgrade(address, method) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    const entry = this._entries.get(normalized);
    if (!entry) {
      throw new Error(`No remote agent host entry found for ${address}.`);
    }
    const result = await raceTimeout(
      entry.client.triggerVscodeUpgrade(method),
      RemoteAgentHostService.UpgradeRequestTimeout
    );
    if (result === void 0) {
      throw new Error(`Server upgrade request timed out after ${RemoteAgentHostService.UpgradeRequestTimeout}ms.`);
    }
    return result;
  }
  reconnect(address, userInitiated = true) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    const configuredEntry = this._configuredEntries.get().find(
      (entry2) => this._entryAddress(entry2) === normalized
    );
    if (!configuredEntry || !getEntryTypeConfig(configuredEntry.connection.type).dialableByService) {
      return;
    }
    const entryToReconnect = {
      ...configuredEntry,
      connectionToken: this._tokens.get(normalized) ?? configuredEntry.connectionToken
    };
    this._cancelReconnect(normalized);
    this._reconnectAttempts.delete(normalized);
    const entry = this._entries.get(normalized);
    if (entry) {
      this._entries.delete(normalized);
      entry.store.dispose();
      if (configuredEntry.connection.type !== "ssh" /* SSH */) {
        entry.transportDisposable?.dispose();
      }
    }
    void this._connectTo(entryToReconnect, { userInitiated });
  }
  async waitForConnection(address) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      throw new Error("Remote agent host connections are not enabled.");
    }
    const normalizedAddress = normalizeRemoteAgentHostAddress(address);
    const existingConnection = this._getConnectionInfo(normalizedAddress);
    if (existingConnection) {
      return existingConnection;
    }
    const wait2 = this._getOrCreateConnectionWait(normalizedAddress);
    const pendingConnect = this._pendingConnects.get(normalizedAddress);
    if (pendingConnect) {
      await pendingConnect;
      const connected = this._getConnectionInfo(normalizedAddress);
      if (connected) {
        return connected;
      }
      return wait2.p;
    }
    const connection = await raceTimeout(wait2.p, RemoteAgentHostService.ConnectionWaitTimeout, () => {
      this._pendingConnectionWaits.delete(normalizedAddress);
    });
    if (!connection) {
      throw new Error(`Timed out connecting to ${normalizedAddress}`);
    }
    return connection;
  }
  async addManagedConnection(entry, connection, transportDisposable, status2 = RemoteAgentHostConnectionStatus.connected) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      throw new Error("Remote agent host connections are not enabled.");
    }
    const address = this._entryAddress(entry);
    const existingEntry = this._entries.get(address);
    if (existingEntry) {
      this._entries.delete(address);
      existingEntry.store.dispose();
    }
    const store = new DisposableStore();
    const protocolClient = connection;
    store.add(protocolClient);
    const connEntry = { store, client: protocolClient, transportDisposable, connected: RemoteAgentHostConnectionStatus.isConnected(status2), status: status2 };
    this._entries.set(address, connEntry);
    this._names.set(address, entry.name);
    this._registeredEntries.set(address, entry);
    this._updateHostLabelFormatter(address, entry.name);
    if (entry.connectionToken) {
      this._tokens.set(address, entry.connectionToken);
    }
    store.add(protocolClient.onDidClose(() => {
      if (this._entries.get(address) === connEntry) {
        connEntry.connected = false;
        connEntry.status = RemoteAgentHostConnectionStatus.disconnected;
        this._onDidChangeConnections.fire();
      }
    }));
    store.add(protocolClient.onDidChangeConnectionState((state) => {
      if (this._entries.get(address) !== connEntry) {
        return;
      }
      switch (state) {
        case "reconnecting" /* Reconnecting */:
          connEntry.connected = false;
          connEntry.status = RemoteAgentHostConnectionStatus.reconnecting;
          this._onDidChangeConnections.fire();
          break;
        case "connected" /* Connected */:
          connEntry.connected = true;
          connEntry.status = RemoteAgentHostConnectionStatus.connected;
          this._onDidChangeConnections.fire();
          break;
        case "connecting" /* Connecting */:
        case "incompatible" /* Incompatible */:
        case "closed" /* Closed */:
          break;
      }
    }));
    this._onDidChangeConnections.fire();
    return {
      address,
      name: entry.name,
      clientId: protocolClient.clientId,
      defaultDirectory: protocolClient.defaultDirectory,
      status: status2
    };
  }
  async removeRemoteAgentHost(address) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    this._names.delete(normalized);
    this._tokens.delete(normalized);
    this._registeredEntries.delete(normalized);
    this._clearHostLabelFormatter(normalized);
    this._cancelReconnect(normalized);
    this._reconnectAttempts.delete(normalized);
    this._removeConnection(normalized);
  }
  _removeConnection(address) {
    const entry = this._entries.get(address);
    if (entry) {
      this._entries.delete(address);
      this._registeredEntries.delete(address);
      disposeEntry(entry);
      this._rejectPendingConnectionWait(address, new Error(`Connection closed: ${address}`));
      this._onDidChangeConnections.fire();
    }
  }
  notifyConnectionClosed(address) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    const entry = this._entries.get(normalized);
    if (entry) {
      this._logService.info(`[RemoteAgentHost] notifyConnectionClosed: notifying protocol client for ${normalized}`);
      entry.client.notifyTransportClosed();
    } else {
      this._logService.info(`[RemoteAgentHost] notifyConnectionClosed: no entry found for ${normalized} (already removed?)`);
    }
  }
  _reconcileConnections() {
    if (this._store.isDisposed) {
      return;
    }
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      for (const address of [...this._entries.keys()]) {
        this._cancelReconnect(address);
        this._removeConnection(address);
      }
      this._names.clear();
      this._tokens.clear();
      this._reconnectAttempts.clear();
      for (const address of [...this._labelFormatters.keys()]) {
        if (!this._registeredEntries.has(address)) {
          this._clearHostLabelFormatter(address);
        }
      }
      return;
    }
    const configuredEntries = this._configuredEntries.get();
    const entriesWithAddress = configuredEntries.map((entry) => ({ entry, address: this._entryAddress(entry) }));
    const desired = new Set(entriesWithAddress.map((e) => e.address));
    this._logService.info(`[RemoteAgentHost] Reconciling: desired=[${[...desired].join(", ")}], current=[${[...this._entries.keys()].map((a) => `${a}(${this._entries.get(a).connected ? "connected" : "pending"})`).join(", ")}]`);
    let namesChanged = false;
    const oldNames = new Map(this._names);
    this._names.clear();
    this._tokens.clear();
    for (const [address, entry] of this._registeredEntries) {
      this._names.set(address, entry.name);
      this._tokens.set(address, entry.connectionToken);
    }
    for (const { entry, address } of entriesWithAddress) {
      this._names.set(address, entry.name);
      this._tokens.set(address, entry.connectionToken);
      this._updateHostLabelFormatter(address, entry.name);
      if (this._entries.has(address) && oldNames.get(address) !== entry.name) {
        namesChanged = true;
      }
    }
    for (const address of [...this._labelFormatters.keys()]) {
      if (!desired.has(address) && !this._registeredEntries.has(address)) {
        this._clearHostLabelFormatter(address);
      }
    }
    for (const address of [...this._entries.keys()]) {
      if (!desired.has(address) && !this._registeredEntries.has(address)) {
        this._logService.info(`[RemoteAgentHost] Disconnecting from ${address}`);
        this._cancelReconnect(address);
        this._reconnectAttempts.delete(address);
        this._removeConnection(address);
      }
    }
    for (const { entry, address } of entriesWithAddress) {
      if (!this._entries.has(address) && !this._pendingConnects.has(address) && getEntryTypeConfig(entry.connection.type).dialableByService) {
        void this._connectTo(entry, { userInitiated: false });
      }
    }
    if (namesChanged) {
      this._onDidChangeConnections.fire();
    }
  }
  _connectTo(entryToConnect, options3) {
    const entryToCreate = this._normalizeEntry(entryToConnect);
    const address = this._entryAddress(entryToCreate);
    const existingPendingConnect = this._pendingConnects.get(address);
    if (existingPendingConnect) {
      return existingPendingConnect;
    }
    const pendingConnect = new DeferredPromise();
    this._pendingConnects.set(address, pendingConnect.p);
    void (async () => {
      try {
        await this._createAndConnect(entryToCreate, address, options3);
      } catch (err) {
        this._logService.error(`[RemoteAgentHost] Unexpected error connecting to ${address}`, err);
      } finally {
        if (this._pendingConnects.get(address) === pendingConnect.p) {
          this._pendingConnects.delete(address);
        }
        void pendingConnect.complete();
      }
    })();
    return pendingConnect.p;
  }
  async _createAndConnect(entryToCreate, address, options3) {
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      return;
    }
    const factory = this._connectionFactories.get(entryToCreate.connection.type);
    if (!factory) {
      this._logService.error(`[RemoteAgentHost] No connection factory registered for ${entryToCreate.connection.type} at ${address}`);
      return;
    }
    const existingEntry = this._entries.get(address);
    if (existingEntry) {
      this._entries.delete(address);
      disposeEntry(existingEntry);
    }
    let createdConnection;
    try {
      createdConnection = await factory.createConnection(entryToCreate, options3);
    } catch (err) {
      ocP30WarnOnce(this._logService, `[RemoteAgentHost] Failed to create a connection to ${address}. Verify address and connectionToken`, err); // OpenCode p30: 降为去重 warn
      this._rejectPendingConnectionWait(address, err);
      if (!this._store.isDisposed && this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
        this._scheduleReconnect(address, entryToCreate.connectionToken);
      }
      return;
    }
    if (this._store.isDisposed || !this._configurationService.getValue(RemoteAgentHostsEnabledSettingId) || !this._configuredEntries.get().some((entry2) => this._entryAddress(entry2) === address) || this._entries.has(address)) {
      createdConnection.connection.dispose();
      createdConnection.transportDisposable?.dispose();
      return;
    }
    const store = new DisposableStore();
    const client = store.add(createdConnection.connection);
    const entry = {
      store,
      client,
      transportDisposable: createdConnection.transportDisposable,
      connected: false,
      status: RemoteAgentHostConnectionStatus.connecting
    };
    this._entries.set(address, entry);
    const isCurrentEntry = () => this._entries.get(address) === entry;
    store.add(client.onDidClose(() => {
      if (!isCurrentEntry()) {
        return;
      }
      ocP30WarnOnce(this._logService, `[RemoteAgentHost] Connection closed: ${address}`); // OpenCode p30: 去重
      entry.connected = false;
      entry.status = RemoteAgentHostConnectionStatus.disconnected;
      this._onDidChangeConnections.fire();
      this._scheduleReconnect(address, entryToCreate.connectionToken);
    }));
    store.add(client.onDidChangeConnectionState((state) => {
      if (!isCurrentEntry()) {
        return;
      }
      switch (state) {
        case "reconnecting":
          entry.connected = false;
          entry.status = RemoteAgentHostConnectionStatus.reconnecting;
          this._onDidChangeConnections.fire();
          break;
        case "connected":
          entry.connected = true;
          entry.status = RemoteAgentHostConnectionStatus.connected;
          this._reconnectAttempts.delete(address);
          this._resolvePendingConnectionWait(address);
          this._onDidChangeConnections.fire();
          break;
        case "connecting":
        case "incompatible":
        case "closed":
          break;
      }
    }));
    try {
      this._logService.info(`[RemoteAgentHost] Connecting to ${address}`);
      this._onDidChangeConnections.fire();
      await client.connect();
      if (store.isDisposed || !isCurrentEntry()) {
        if (!store.isDisposed) {
          disposeEntry(entry);
        }
        return;
      }
      this._logService.info(`[RemoteAgentHost] Connected to ${address}`);
      entry.connected = true;
      entry.status = RemoteAgentHostConnectionStatus.connected;
      this._reconnectAttempts.delete(address);
      this._resolvePendingConnectionWait(address);
      this._onDidChangeConnections.fire();
    } catch (err) {
      if (!isCurrentEntry()) {
        if (!store.isDisposed) {
          disposeEntry(entry);
        }
        return;
      }
      const incompatible = RemoteAgentHostConnectionStatus.fromConnectError(err, [PROTOCOL_VERSION]);
      if (incompatible) {
        this._logService.warn(`[RemoteAgentHost] Incompatible with ${address}: ${incompatible.kind === "incompatible" ? incompatible.message : ""}`);
        entry.status = incompatible;
        this._reconnectAttempts.delete(address);
        this._rejectPendingConnectionWait(address, err);
        this._onDidChangeConnections.fire();
        return;
      }
      ocP30WarnOnce(this._logService, `[RemoteAgentHost] Failed to connect to ${address}. Verify address and connectionToken`, err); // OpenCode p30: 降为去重 warn
      if (RemoteAgentHostConnectionStatus.isReconnecting(entry.status)) {
        this._logService.info(`[RemoteAgentHost] Handshake with ${address} was interrupted; the protocol client is restoring the connection`);
        return;
      }
      entry.status = RemoteAgentHostConnectionStatus.disconnected;
      this._entries.delete(address);
      disposeEntry(entry);
      this._rejectPendingConnectionWait(address, err);
      this._onDidChangeConnections.fire();
      this._scheduleReconnect(address, entryToCreate.connectionToken);
    }
  }
  /**
   * Schedule a reconnect attempt with exponential backoff.
   * Only reconnects if the address is still in the configured entries.
   */
  _scheduleReconnect(address, connectionToken) {
    const configuredEntry = this._configuredEntries.get().find((entry) => this._entryAddress(entry) === address);
    if (!configuredEntry) {
      this._logService.info(`[RemoteAgentHost] Not reconnecting to ${address}: no longer configured`);
      return;
    }
    const reconnectPolicy = getEntryTypeConfig(configuredEntry.connection.type).reconnect;
    if (!reconnectPolicy.autoRestore) {
      this._logService.info(`[RemoteAgentHost] Not reconnecting to ${address}: automatic restore is disabled`);
      return;
    }
    const previousAttempts = this._reconnectAttempts.get(address) ?? 0;
    if (hasExhaustedReconnectAttempts(reconnectPolicy, previousAttempts)) {
      this._logService.warn(`[RemoteAgentHost] Stopped reconnecting to ${address}: reached attempt limit (${previousAttempts})`);
      return;
    }
    const attempt = previousAttempts + 1;
    this._reconnectAttempts.set(address, attempt);
    const delay = computeReconnectDelay(reconnectPolicy, attempt);
    this._logService.info(`[RemoteAgentHost] Scheduling reconnect to ${address} in ${delay}ms (attempt ${attempt})`);
    this._cancelReconnect(address);
    const timeout2 = setTimeout(() => {
      this._reconnectTimeouts.delete(address);
      const currentEntry = this._configuredEntries.get().find((entry) => this._entryAddress(entry) === address);
      if (currentEntry) {
        void this._connectTo({
          ...currentEntry,
          connectionToken: connectionToken ?? this._tokens.get(address) ?? currentEntry.connectionToken
        }, { userInitiated: false });
      }
    }, delay);
    this._reconnectTimeouts.set(address, timeout2);
  }
  /** Cancel a pending reconnect timeout for the given address. */
  _cancelReconnect(address) {
    const timeout2 = this._reconnectTimeouts.get(address);
    if (timeout2 !== void 0) {
      clearTimeout(timeout2);
      this._reconnectTimeouts.delete(address);
    }
  }
  _getConnectionInfo(address) {
    return this.connections.find((connection) => connection.address === address && RemoteAgentHostConnectionStatus.isConnected(connection.status));
  }
  _upsertEntry(entries2, entry) {
    const address = this._entryAddress(entry);
    const existingIndex = entries2.findIndex((candidate) => this._entryAddress(candidate) === address);
    return existingIndex === -1 ? [...entries2, entry] : entries2.map((candidate, index2) => index2 === existingIndex ? entry : candidate);
  }
  _getOrCreateConnectionWait(address) {
    let wait2 = this._pendingConnectionWaits.get(address);
    if (wait2) {
      return wait2;
    }
    const existingConnection = this._getConnectionInfo(address);
    if (existingConnection) {
      const immediateWait = new DeferredPromise();
      immediateWait.complete(existingConnection);
      return immediateWait;
    }
    wait2 = new DeferredPromise();
    wait2.p.then(void 0, () => {
    });
    this._pendingConnectionWaits.set(address, wait2);
    return wait2;
  }
  _resolvePendingConnectionWait(address) {
    const wait2 = this._pendingConnectionWaits.get(address);
    const connection = this._getConnectionInfo(address);
    if (!wait2 || !connection) {
      return;
    }
    this._pendingConnectionWaits.delete(address);
    void wait2.complete(connection);
  }
  _rejectPendingConnectionWait(address, err) {
    const wait2 = this._pendingConnectionWaits.get(address);
    if (!wait2) {
      return;
    }
    this._pendingConnectionWaits.delete(address);
    void wait2.error(err);
  }
  /**
   * Register (or re-register) the {@link AGENT_HOST_SCHEME} label formatter
   * for the given address so that {@link ILabelService.getHostLabel} resolves
   * to the entry's human-readable name. Called when an entry is added or its
   * name changes.
   */
  _updateHostLabelFormatter(address, name) {
    this._clearHostLabelFormatter(address);
    const handle2 = this._labelService.registerFormatter({
      scheme: AGENT_HOST_SCHEME,
      authority: agentHostAuthority(address),
      priority: true,
      formatting: {
        ...AGENT_HOST_LABEL_FORMATTER.formatting,
        workspaceSuffix: name
      }
    });
    this._labelFormatters.set(address, handle2);
  }
  _clearHostLabelFormatter(address) {
    const existing = this._labelFormatters.get(address);
    if (existing) {
      existing.dispose();
      this._labelFormatters.delete(address);
    }
  }
  dispose() {
    for (const timeout2 of this._reconnectTimeouts.values()) {
      clearTimeout(timeout2);
    }
    this._reconnectTimeouts.clear();
    this._reconnectAttempts.clear();
    this._pendingConnects.clear();
    for (const [address, wait2] of this._pendingConnectionWaits) {
      void wait2.error(new Error(`Remote agent host service disposed before connecting to ${address}`));
    }
    this._pendingConnectionWaits.clear();
    for (const entry of this._entries.values()) {
      disposeEntry(entry);
    }
    this._entries.clear();
    for (const handle2 of this._labelFormatters.values()) {
      handle2.dispose();
    }
    this._labelFormatters.clear();
    super.dispose();
  }
};

RemoteAgentHostService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IEnvironmentService)
], RemoteAgentHostService);

var AgentsWindowRemoteAgentHostService = class extends RemoteAgentHostService {
  get clientInfo() {
    return agentsWindowAgentHostClientInfo;
  }
  constructor(configurationService, instantiationService, logService, labelService, environmentService) {
    super(configurationService, instantiationService, logService, labelService, environmentService);
  }
};

AgentsWindowRemoteAgentHostService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IEnvironmentService)
], AgentsWindowRemoteAgentHostService);
export { disposeEntry, WebSocketConnectionFactory, RemoteAgentHostService, AgentsWindowRemoteAgentHostService };
