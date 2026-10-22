// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/agentHostProtocolClient.ts
import { ProtocolError, isJsonRpcNotification, isJsonRpcRequest, isJsonRpcResponse } from "./module-1732.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DeferredPromise, TimeoutTimer } from "./module-0036.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { AgentHostResourcePermissionError, IAgentHostResourceService, LOCAL_AGENT_HOST_RESOURCE_IDENTITY } from "./module-1729.mjs";
import { AMBIENT_AGENT_HOST_AUTHORITY } from "./module-0960.mjs";
import { generateUuid } from "./module-0190.mjs";
import { agentHostAuthority, createAgentHostResourceUriMapper, fromAgentHostUri, identityAgentHostResourceUriMapper, toAgentHostUri } from "./module-1001.mjs";
import { LoadEstimator } from "./module-1231.mjs";
import { DEFAULT_RECONNECT_POLICY, computeReconnectDelay, hasExhaustedReconnectAttempts } from "./module-1735.mjs";
import { AgentSubscriptionManager } from "./module-4044.mjs";
import { formatAgentHostConfigurationSyncValueForLog, getAgentHostConfigurationSyncEntries, getAgentHostConfigurationSyncTarget, resolveAgentHostConfigurationSyncPatch, resolveAgentHostConfigurationSyncValue } from "./module-2464.mjs";
import { ConfigurationTargetToString, IConfigurationService } from "./module-0132.mjs";
import { AgentHostAutoApprovePolicyRestrictedConfigKey, AgentHostDisableRepoInfoTelemetryConfigKey, AgentHostTelemetryLevelConfigKey, AgentHostTerminalAutoApproveEnabledConfigKey, AgentHostTerminalAutoApproveRulesConfigKey, DISABLE_REPO_INFO_TELEMETRY_SETTING_ID, GLOBAL_AUTO_APPROVE_SETTING_ID, TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, TERMINAL_AUTO_APPROVE_SETTING_ID, TERMINAL_IGNORE_DEFAULT_AUTO_APPROVE_RULES_SETTING_ID, getAgentHostTerminalAutoApproveRulesConfig, telemetryLevelToAgentHostConfigValue } from "./module-1741.mjs";
import { ITelemetryService, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID } from "./module-0093.mjs";
import { managedPermissionsConfigurationIds, resolveManagedSettingsPermissions } from "./module-2465.mjs";
import { NonReconnectableTransportError, isClientTransport } from "./module-4045.mjs";
import { ROOT_STATE_URI, isAhpRootChannel, isDefaultChatUri } from "./module-1008.mjs";
import { SUPPORTED_PROTOCOL_VERSIONS } from "./module-1780.mjs";
import { AhpErrorCodes, JsonRpcErrorCodes } from "./module-1731.mjs";
import { toAgentHostClientMeta } from "./module-1739.mjs";
import { URI } from "./module-0032.mjs";
import { normalizeLegacyActionEnvelope } from "./module-1007.mjs";
import { hasKey } from "./module-0010.mjs";
import { AgentSession } from "./module-1107.mjs";
import { CollectAgentHostDebugLogsExtensionMethod, GetAgentHostSessionStateFileExtensionMethod, ReadAgentHostDebugLogsChunkExtensionMethod, supportsAgentHostChatStateFile } from "./module-4043.mjs";
import { Schemas } from "./module-0033.mjs";
import { AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES } from "./module-1108.mjs";
import { decodeBase64, encodeBase64 } from "./module-0038.mjs";
import { createRemoteWatchHandle } from "./module-1755.mjs";
import { toFileSystemProviderErrorCode } from "./module-0269.mjs";
import { CancellationError } from "./module-0004.mjs";
import { getTelemetryLevel } from "./module-0887.mjs";
import { isFileResourceRead } from "./module-4046.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/agentHost/browser/agentHostProtocolClient.ts
var AHP_CLIENT_CONNECTION_CLOSED = -32e3;

var PING_INTERVAL_MS2 = 5e3;

var LIVENESS_TIMEOUT_MS = 2e4;

function connectionTimeoutError(address, silenceMs) {
  return new ProtocolError(
    AHP_CLIENT_CONNECTION_CLOSED,
    `Connection appears dead: ${address}; no message received for ${silenceMs}ms.`
  );
}

function connectionClosedError(address) {
  return new ProtocolError(AHP_CLIENT_CONNECTION_CLOSED, `Connection closed: ${address}`);
}

function connectionDisposedError(address) {
  return new ProtocolError(AHP_CLIENT_CONNECTION_CLOSED, `Connection disposed: ${address}`);
}

function transportLostError(address) {
  return new ProtocolError(AHP_CLIENT_CONNECTION_CLOSED, `Transport lost (reconnecting): ${address}`);
}

var AgentHostProtocolClient = class extends Disposable {
  constructor(identity2, transportOrFactory, options3, _logService, _resourceService, _configurationService, _telemetryService) {
    super();
    this._logService = _logService;
    this._resourceService = _resourceService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    /** Disposable holding the listeners attached to the current transport. */
    this._transportListeners = this._register(new MutableDisposable());
    this._serverSeq = 0;
    this._nextClientSeq = 1;
    /**
     * Latest `initialize` response from the host. Captured at the end of
     * {@link connect} and re-captured after a soft-reconnect that pulled
     * a fresh snapshot. `undefined` before the handshake completes.
     */
    this._initializeResult = observableValue("agentHostInitializeResult", void 0);
    this._onDidAction = this._register(new Emitter());
    this.onDidAction = this._onDidAction.event;
    this._onDidNotification = this._register(new Emitter());
    this.onDidNotification = this._onDidNotification.event;
    this._onMcpNotification = this._register(new Emitter());
    this.onMcpNotification = this._onMcpNotification.event;
    /**
     * Fires for every `otlp/exportLogs` notification the host sends on a
     * channel this client has subscribed to. Each payload is an
     * OTLP/JSON `ExportLogsServiceRequest` value verbatim; consumers
     * decode it (see `iterateOtlpLogRecords`) and route the records to a
     * registered logger or sink.
     *
     * Channel URIs are kept opaque on the wire so the same event covers
     * every {@link TelemetryCapabilities.logs} URI the host advertises —
     * subscribers should filter by `channel` if they care.
     */
    this._onDidReceiveOtlpLogs = this._register(new Emitter());
    this.onDidReceiveOtlpLogs = this._onDidReceiveOtlpLogs.event;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._onDidFatalClose = this._register(new Emitter());
    this.onDidFatalClose = this._onDidFatalClose.event;
    this._onDidChangeConnectionState = this._register(new Emitter());
    this.onDidChangeConnectionState = this._onDidChangeConnectionState.event;
    /**
     * Discriminated state union. Read via narrowing (`_state.kind === ...`);
     * reconnect-only fields like the gate/outbox/attempt counter are only
     * accessible while {@link _state.kind} is {@link AgentHostClientState.Reconnecting},
     * and protocol errors are only accessible while the state is
     * {@link AgentHostClientState.Incompatible} or {@link AgentHostClientState.Closed}.
     */
    this._state = { kind: "connecting" /* Connecting */, outbox: [] };
    /** Pending JSON-RPC requests keyed by request id. */
    this._pendingRequests = /* @__PURE__ */ new Map();
    this._authentication = /* @__PURE__ */ new Map();
    this._nextRequestId = 1;
    /**
     * Timestamp of the most recent message of any kind received from the
     * server. Used only for diagnostic logging when the close timer fires.
     */
    this._lastReadTime = Date.now();
    /**
     * Liveness watchdog — see {@link _resetLivenessTimers}.
     *
     * {@link _pingTimer} fires after {@link PING_INTERVAL_MS} of inbound
     * silence and sends an application-level `ping` so we have something
     * to time out on. {@link _closeTimer} fires after another
     * {@link LIVENESS_TIMEOUT_MS} of continued silence and force-closes
     * the transport so the renderer's reconnect logic kicks in. Both are
     * reset on every received message, so busy connections generate no
     * ping traffic at all.
     *
     * Detects silently-dead transports (e.g. SSH/tunnel after laptop
     * sleep + network change) that don't produce a socket close event of
     * their own.
     */
    this._pingTimer = this._register(new TimeoutTimer());
    this._closeTimer = this._register(new TimeoutTimer());
    /**
     * URIs we have already granted implicit read access for on this connection.
     * Uses URI-aware comparison to dedupe repeat sends and is cleared with the connection.
     */
    this._grantedImplicitReadUris = new ResourceSet();
    this._implicitReadGrants = this._register(new DisposableStore());
    this._resourceIdentity = identity2;
    this._address = identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY ? AMBIENT_AGENT_HOST_AUTHORITY : identity2;
    this._clientId = options3?.clientId ?? generateUuid();
    this._connectionAuthority = identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY ? AMBIENT_AGENT_HOST_AUTHORITY : agentHostAuthority(identity2);
    this.resourceUris = identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY ? identityAgentHostResourceUriMapper : createAgentHostResourceUriMapper(this._connectionAuthority);
    this._loadEstimator = options3?.loadEstimator ?? LoadEstimator.getInstance();
    this._clientInfo = options3?.clientInfo;
    this._reconnectPolicy = options3?.reconnectPolicy ?? DEFAULT_RECONNECT_POLICY;
    if (typeof transportOrFactory === "function") {
      this._transportFactory = transportOrFactory;
      this._installTransport(transportOrFactory());
    } else {
      this._transportFactory = void 0;
      this._installTransport(transportOrFactory);
    }
    this._subscriptionManager = this._register(new AgentSubscriptionManager(
      this._clientId,
      () => this.nextClientSeq(),
      (msg) => this._logService.warn(`[AgentHostProtocolClient] ${msg}`),
      (resource) => this.subscribe(resource),
      (resource) => this.unsubscribe(resource)
    ));
    this._register(this.onDidAction((envelope) => {
      this._subscriptionManager.receiveEnvelope(envelope);
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (this._state.kind !== "connected" /* Connected */) {
        return;
      }
      const patch2 = {};
      const mirrored = [];
      if (e4.source !== 5 /* WORKSPACE */ && e4.source !== 6 /* WORKSPACE_FOLDER */ && e4.source !== 8 /* MEMORY */) {
        for (const entry of getAgentHostConfigurationSyncEntries(getAgentHostConfigurationSyncTarget(this._resourceIdentity))) {
          if (!e4.affectsConfiguration(entry.settingId)) {
            continue;
          }
          const value2 = resolveAgentHostConfigurationSyncValue(this._configurationService, entry);
          if (value2 !== void 0) {
            patch2[entry.sync.key] = value2;
            mirrored.push(`${entry.sync.key}=${formatAgentHostConfigurationSyncValueForLog(entry.settingId, value2)} (${entry.settingId})`);
          }
        }
      }
      if (Object.keys(patch2).length) {
        this._logService.info(`[RemoteAgentHostProtocol] Mirroring configuration to host root config from ${ConfigurationTargetToString(e4.source)}: ${mirrored.join(", ")}`);
        this._dispatchRootConfig(patch2);
      }
      if (e4.affectsConfiguration(GLOBAL_AUTO_APPROVE_SETTING_ID)) {
        this._updateAutoApprovePolicyRestriction();
      }
      if (e4.affectsConfiguration(TELEMETRY_SETTING_ID) || e4.affectsConfiguration(TELEMETRY_OLD_SETTING_ID) || e4.affectsConfiguration(TELEMETRY_CRASH_REPORTER_SETTING_ID)) {
        this._updateTelemetryLevel();
      }
      if (e4.affectsConfiguration(TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID)) {
        this._updateTerminalAutoApproveEnabled();
      }
      if (e4.affectsConfiguration(TERMINAL_AUTO_APPROVE_SETTING_ID) || e4.affectsConfiguration(TERMINAL_IGNORE_DEFAULT_AUTO_APPROVE_RULES_SETTING_ID)) {
        this._updateTerminalAutoApproveRules();
      }
      if (e4.affectsConfiguration(DISABLE_REPO_INFO_TELEMETRY_SETTING_ID)) {
        this._updateDisableRepoInfoTelemetry();
      }
      if (managedPermissionsConfigurationIds.some((settingId) => e4.affectsConfiguration(settingId))) {
        void this._updateManagedSettingsPermissions();
      }
    }));
    if (!isClientTransport(this._transport)) {
      this._resetLivenessTimers();
    }
  }
  get clientId() {
    return this._clientId;
  }
  get address() {
    return this._address;
  }
  get defaultDirectory() {
    return this._defaultDirectory;
  }
  get connectionState() {
    return this._state.kind;
  }
  /**
   * The latest `initialize` response from the host, or `undefined` if
   * the handshake has not completed yet. Exposed observably so callers can
   * react as advertised capabilities (telemetry, `completionTriggerCharacters`,
   * `terminalCommandPrefix`, ...) arrive.
   */
  get initializeResult() {
    return this._initializeResult;
  }
  /**
   * Install a transport and wire listeners. Used both for the initial
   * transport and for replacements created by the factory during a
   * transport-level reconnect.
   */
  _installTransport(transport) {
    const listeners = new DisposableStore();
    listeners.add(transport);
    listeners.add(transport.onMessage((msg) => this._handleMessage(msg)));
    listeners.add(transport.onClose(() => this._handleTransportClose()));
    this._transport = transport;
    this._transportListeners.value = listeners;
  }
  /**
   * Transition to a new {@link ClientState}. Fires {@link onDidChangeConnectionState}
   * only when the variant kind actually changes; in-place mutation of
   * reconnect-state fields (e.g. swapping the gate on a failed retry) does
   * NOT count as a transition and produces no event.
   */
  _transitionTo(next) {
    if (this._state.kind === next.kind) {
      return;
    }
    this._state = next;
    this._onDidChangeConnectionState.fire(next.kind);
  }
  _newReconnectGate() {
    const deferred = new DeferredPromise();
    deferred.p.then(void 0, () => {
    });
    return deferred;
  }
  _newReconnectState() {
    return { gate: this._newReconnectGate(), outbox: [], attempt: 0, timeoutHandle: void 0 };
  }
  dispose() {
    this._handleClose(connectionDisposedError(this._address));
    super.dispose();
  }
  /**
   * Connect to the remote agent host and perform the protocol handshake.
   */
  async connect() {
    try {
      if (isClientTransport(this._transport)) {
        await this._raceClose(this._transport.connect());
      }
      if (this._state.kind !== "connecting" /* Connecting */) {
        throw transportLostError(this._address);
      }
      const result = await this._dispatchRequest("initialize", {
        channel: ROOT_STATE_URI,
        // Advertise every version this client can negotiate, most-preferred first, so an
        // older host (a cloud sandbox running a 0.5.x `copilotd`) can negotiate down
        // instead of rejecting the connection. A current host still picks the newest.
        protocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
        clientId: this._clientId,
        clientInfo: this._clientInfo,
        _meta: this._clientMeta(),
        initialSubscriptions: [ROOT_STATE_URI]
      }, { bypassInitializeQueue: true });
      this._applyInitializeResult(result);
      for (const snapshot of result.snapshots ?? []) {
        if (isAhpRootChannel(snapshot.resource)) {
          this._subscriptionManager.handleRootSnapshot(snapshot.state, snapshot.fromSeq);
        }
      }
      if (isClientTransport(this._transport) && this._state.kind === "connecting" /* Connecting */) {
        for (const message of this._state.outbox) {
          this._transport.send(message);
        }
        this._state.outbox.length = 0;
      }
      this._transitionTo({ kind: "connected" /* Connected */ });
      this._resetLivenessTimers();
    } catch (error) {
      const protocolError = error instanceof ProtocolError ? error : new ProtocolError(AHP_CLIENT_CONNECTION_CLOSED, error instanceof Error ? error.message : String(error));
      if (protocolError.code === AhpErrorCodes.UnsupportedProtocolVersion) {
        this._cancelLivenessTimers();
        if (this._state.kind === "connecting" /* Connecting */) {
          this._state.outbox.length = 0;
        }
        this._rejectPendingRequests(protocolError);
        this._transitionTo({ kind: "incompatible" /* Incompatible */, error: protocolError });
        throw error;
      }
      if (error instanceof NonReconnectableTransportError) {
        this._handleFatalClose(protocolError);
        throw error;
      }
      if (this._state.kind === "reconnecting" /* Reconnecting */) {
        throw error;
      }
      if (protocolError.code === AHP_CLIENT_CONNECTION_CLOSED && this._beginReconnectFromConnecting(protocolError)) {
        throw error;
      }
      this._handleClose(protocolError);
      throw error;
    }
  }
  /**
   * Externally signal that the transport has closed. Used by services
   * managing a passive transport (SSH / dev-tunnels) when they observe
   * a connection-loss IPC event independent of the transport's own
   * onClose — without this, a single dropped IPC delivery on the
   * transport's close channel leaves the client stranded in
   * `Connected` until its watchdog fires (which can take hours when
   * the renderer is backgrounded and `setTimeout` is throttled).
   *
   * Idempotent — no-op if already closed or mid-reconnect.
   */
  notifyTransportClosed() {
    this._handleTransportClose();
  }
  /**
   * Called from the transport's `onClose` event. When a {@link _transportFactory}
   * is configured we attempt to soft-reconnect rather than fire `onDidClose` —
   * the protocol-level `reconnect` request lets the server replay missed
   * actions and preserves the `clientId` so pending tool calls etc. are not
   * cancelled by the host-side disconnect timeout. Without a factory
   * (passive-transport SSH/relay path) we fall back to "close means closed"
   * and let the service decide whether to spin up a fresh client.
   */
  _handleTransportClose() {
    switch (this._state.kind) {
      case "closed" /* Closed */:
        return;
      case "connecting" /* Connecting */:
        if (!this._beginReconnectFromConnecting(connectionClosedError(this._address))) {
          this._handleClose(connectionClosedError(this._address));
        }
        return;
      case "incompatible" /* Incompatible */:
        this._handleClose(connectionClosedError(this._address));
        return;
      case "connected" /* Connected */: {
        if (!this._transportFactory) {
          this._handleClose(connectionClosedError(this._address));
          return;
        }
        if (!this._reconnectPolicy.autoRestore) {
          const error = connectionClosedError(this._address);
          this._logService.info(`[RemoteAgentHostProtocol] Transport lost for ${this._address}; automatic reconnect is disabled.`);
          this._handleFatalClose(error);
          return;
        }
        this._logService.info(`[RemoteAgentHostProtocol] Transport lost for ${this._address}; scheduling reconnect.`);
        this._transitionTo({ kind: "reconnecting" /* Reconnecting */, reconnect: this._newReconnectState() });
        this._cancelLivenessTimers();
        this._rejectPendingRequests(transportLostError(this._address));
        this._scheduleReconnect();
        return;
      }
      case "reconnecting" /* Reconnecting */:
        this._logService.info(`[RemoteAgentHostProtocol] Transport lost for ${this._address} mid-reconnect; aborting the current attempt.`);
        this._cancelLivenessTimers();
        this._rejectPendingRequests(transportLostError(this._address));
        return;
    }
  }
  _beginReconnectFromConnecting(error) {
    if (this._state.kind !== "connecting" /* Connecting */ || !this._transportFactory) {
      return false;
    }
    if (!this._reconnectPolicy.autoRestore) {
      this._logService.info(`[RemoteAgentHostProtocol] Transport lost while connecting to ${this._address}; automatic reconnect is disabled.`);
      this._handleFatalClose(error);
      return true;
    }
    this._logService.info(`[RemoteAgentHostProtocol] Transport lost while connecting to ${this._address}; scheduling a fresh initialize.`);
    const outbox = this._state.outbox;
    this._rejectPendingRequests(error);
    this._grantedImplicitReadUris.clear();
    this._implicitReadGrants.clear();
    this._transitionTo({
      kind: "reconnecting" /* Reconnecting */,
      reconnect: { ...this._newReconnectState(), outbox }
    });
    this._cancelLivenessTimers();
    this._scheduleReconnect();
    return true;
  }
  /**
   * Reopens a terminal connection after its host has been explicitly restarted.
   */
  reconnectFromClosed() {
    if (this._state.kind !== "closed" /* Closed */ || !this._transportFactory || this._store.isDisposed) {
      return false;
    }
    this._transitionTo({ kind: "reconnecting" /* Reconnecting */, reconnect: this._newReconnectState() });
    this._scheduleReconnect(true);
    return true;
  }
  _scheduleReconnect(userInitiated = false) {
    if (this._state.kind !== "reconnecting" /* Reconnecting */ || !this._transportFactory) {
      return;
    }
    const reconnect = this._state.reconnect;
    if (reconnect.timeoutHandle !== void 0) {
      return;
    }
    if (!userInitiated && !this._reconnectPolicy.autoRestore) {
      const error = connectionClosedError(this._address);
      this._logService.info(`[RemoteAgentHostProtocol] Automatic reconnect to ${this._address} is disabled.`);
      this._handleFatalClose(error);
      return;
    }
    if (!userInitiated && hasExhaustedReconnectAttempts(this._reconnectPolicy, reconnect.attempt)) {
      const error = new ProtocolError(AHP_CLIENT_CONNECTION_CLOSED, `Automatic reconnect gave up after ${reconnect.attempt} attempts.`);
      this._logService.warn(`[RemoteAgentHostProtocol] Automatic reconnect to ${this._address} gave up after ${reconnect.attempt} attempts.`);
      this._handleFatalClose(error);
      return;
    }
    const attempt = reconnect.attempt + 1;
    const delay = computeReconnectDelay(this._reconnectPolicy, attempt);
    this._logService.info(`[RemoteAgentHostProtocol] Reconnecting to ${this._address} in ${delay}ms (attempt ${attempt}).`);
    reconnect.timeoutHandle = setTimeout(() => {
      if (this._state.kind === "reconnecting" /* Reconnecting */) {
        this._state.reconnect.timeoutHandle = void 0;
      }
      void this._attemptReconnect();
    }, delay);
  }
  async _attemptReconnect() {
    if (this._state.kind !== "reconnecting" /* Reconnecting */ || !this._transportFactory) {
      return;
    }
    const reconnect = this._state.reconnect;
    reconnect.attempt++;
    let transport;
    try {
      transport = this._transportFactory();
      this._installTransport(transport);
      if (isClientTransport(transport)) {
        await transport.connect();
      }
      if (this._state.kind !== "reconnecting" /* Reconnecting */) {
        return;
      }
      const subscriptions = this._subscriptionManager.currentSubscriptionUris().map((u) => u.toString());
      if (!subscriptions.includes(ROOT_STATE_URI)) {
        subscriptions.unshift(ROOT_STATE_URI);
      }
      const lastSeenServerSeq = this._serverSeq;
      const { result, freshInitialize } = await this._reconnectOrInitialize(lastSeenServerSeq, subscriptions);
      if (this._state.kind !== "reconnecting" /* Reconnecting */) {
        return;
      }
      this._applyReconnectResult(result, freshInitialize);
      this._updateManagedSettingsPermissions(true);
      if (freshInitialize && result.type === "snapshot" /* Snapshot */) {
        await this._restoreAuthenticationAfterFreshInitialize();
        await this._restoreSubscriptionsAfterFreshInitialize(result.snapshots);
      }
      if (this._state.kind !== "reconnecting" /* Reconnecting */) {
        return;
      }
      this._forwardClientConfig(false);
      const { gate } = reconnect;
      this._drainAfterReconnect(reconnect.outbox);
      this._lastReadTime = Date.now();
      this._resetLivenessTimers();
      this._transitionTo({ kind: "connected" /* Connected */ });
      gate.complete();
      this._logService.info(`[RemoteAgentHostProtocol] Reconnected to ${this._address}.`);
    } catch (err) {
      this._logService.warn(`[RemoteAgentHostProtocol] Reconnect attempt failed for ${this._address}: ${err instanceof Error ? err.message : String(err)}`);
      transport?.dispose();
      if (this._state.kind !== "reconnecting" /* Reconnecting */) {
        return;
      }
      if (err instanceof NonReconnectableTransportError) {
        const protocolError = new ProtocolError(AHP_CLIENT_CONNECTION_CLOSED, err.message);
        this._handleFatalClose(protocolError);
        return;
      }
      const oldGate = this._state.reconnect.gate;
      this._state.reconnect.gate = this._newReconnectGate();
      oldGate.error(err);
      this._scheduleReconnect();
    }
  }
  async _reconnectOrInitialize(lastSeenServerSeq, subscriptions) {
    try {
      const result = await this._dispatchRequest("reconnect", {
        clientId: this._clientId,
        lastSeenServerSeq,
        subscriptions,
        _meta: this._clientMeta()
      }, { bypassReconnectGate: true });
      return { result, freshInitialize: false };
    } catch (error) {
      if (!(error instanceof ProtocolError) || error.code !== AhpErrorCodes.NotFound) {
        throw error;
      }
    }
    this._logService.info(`[RemoteAgentHostProtocol] Server forgot client ${this._clientId}; initializing a fresh connection.`);
    const initializeResult = await this._dispatchRequest("initialize", {
      channel: ROOT_STATE_URI,
      protocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
      clientId: this._clientId,
      clientInfo: this._clientInfo,
      _meta: this._clientMeta(),
      initialSubscriptions: subscriptions
    }, { bypassReconnectGate: true });
    this._applyInitializeResult(initializeResult, false);
    return {
      result: { type: "snapshot" /* Snapshot */, snapshots: initializeResult.snapshots ?? [] },
      freshInitialize: true
    };
  }
  async _restoreSubscriptionsAfterFreshInitialize(initialSnapshots) {
    const restored = new Set(initialSnapshots.map((snapshot) => snapshot.resource));
    const active = this._subscriptionManager.getActiveSubscriptions().filter((subscription) => !restored.has(subscription.resource.toString()));
    const restoreGroup = async (subscriptions) => {
      await Promise.all(subscriptions.map(async (subscription) => {
        try {
          const result = await this._dispatchRequest("subscribe", {
            channel: subscription.resource.toString()
          }, { bypassReconnectGate: true });
          if (result.snapshot) {
            this._subscriptionManager.applyReconnectSnapshot(
              result.snapshot.resource,
              result.snapshot.state,
              result.snapshot.fromSeq,
              true
            );
            this._serverSeq = Math.max(this._serverSeq, result.snapshot.fromSeq);
          }
        } catch (error) {
          if (error instanceof ProtocolError && error.code === AHP_CLIENT_CONNECTION_CLOSED) {
            throw error;
          }
          this._logService.warn(`[AgentHostProtocolClient] Failed to restore subscription ${subscription.resource.toString()} after host restart: ${error instanceof Error ? error.message : String(error)}`);
          this._subscriptionManager.markSubscriptionsMissing([subscription.resource]);
        }
      }));
    };
    await restoreGroup(active.filter((subscription) => subscription.kind === 1 /* Session */));
    await Promise.all([
      restoreGroup(active.filter((subscription) => subscription.kind === 2 /* Chat */)),
      restoreGroup(active.filter((subscription) => subscription.kind !== 1 /* Session */ && subscription.kind !== 2 /* Chat */))
    ]);
  }
  async _restoreAuthenticationAfterFreshInitialize() {
    await Promise.all([...this._authentication.values()].map((params) => this._dispatchRequest("authenticate", {
      channel: ROOT_STATE_URI,
      ...params,
      scopes: params.scopes ? [...params.scopes] : void 0
    }, { bypassReconnectGate: true })));
  }
  _clientMeta() {
    const telemetryLevel = this._effectiveTelemetryLevel();
    const sendIdentity = telemetryLevel >= 3 /* USAGE */;
    return toAgentHostClientMeta(
      this._transport.clientConnectionKind,
      telemetryLevel,
      sendIdentity ? this._telemetryService.machineId : void 0,
      sendIdentity ? this._telemetryService.devDeviceId : void 0
    );
  }
  _applyInitializeResult(result, forwardClientConfig = true) {
    this._initializeResult.set(result, void 0);
    this._serverSeq = result.serverSeq;
    if (result.defaultDirectory) {
      const directory = result.defaultDirectory;
      this._defaultDirectory = typeof directory === "string" ? URI.parse(directory).path : URI.revive(directory).path;
    }
    if (forwardClientConfig) {
      this._forwardClientConfig();
    }
  }
  /**
   * Push the renderer-owned config values the host mirrors (telemetry level,
   * proxy discovery, migrate flag, …) as `RootConfigChanged` actions. Called on
   * initial connect AND on reconnect: a reconnected host may be a freshly
   * restarted process (or one that lost these values), and re-pushing is a cheap
   * no-op when nothing changed. Without this, a value read early — like the
   * migrate flag in `listSessions` — can be missing after a window reload.
   *
   * Most settings arrive here declaratively, via `agentHost` on their
   * configuration schema. The explicit calls below cover the cases a single
   * key-plus-transform can't express: values derived from several settings, and
   * settings contributed by an extension rather than by core.
   */
  _forwardClientConfig(includeManagedSettings = true) {
    this._dispatchRootConfig(resolveAgentHostConfigurationSyncPatch(this._configurationService, getAgentHostConfigurationSyncTarget(this._resourceIdentity)));
    this._updateTelemetryLevel();
    this._updateTerminalAutoApproveEnabled();
    this._updateTerminalAutoApproveRules();
    this._updateAutoApprovePolicyRestriction();
    this._updateDisableRepoInfoTelemetry();
    if (includeManagedSettings) {
      void this._updateManagedSettingsPermissions();
    }
  }
  _updateAutoApprovePolicyRestriction() {
    const policyRestricted = this._configurationService.inspect(GLOBAL_AUTO_APPROVE_SETTING_ID)?.policyValue === false;
    this._dispatchRootConfig({ [AgentHostAutoApprovePolicyRestrictedConfigKey]: policyRestricted });
  }
  /**
   * Apply a `reconnect` RPC result to the subscription manager. On `replay`
   * we feed each missed envelope through the normal action path; on
   * `snapshot` we reseat each named subscription with the fresh state and
   * advance the server seq cursor accordingly.
   */
  _applyReconnectResult(result, preservePending = false) {
    if (result.type === "replay" /* Replay */) {
      let maxSeq = this._serverSeq;
      for (const envelope of result.actions) {
        if (envelope.origin?.clientId === this._clientId && envelope.origin.clientSeq !== void 0 && !envelope.rejectionReason) {
          this._subscriptionManager.dropPendingAction(envelope.channel, envelope.origin.clientSeq);
        }
        if (envelope.serverSeq > maxSeq) {
          maxSeq = envelope.serverSeq;
        }
        this._onDidAction.fire(normalizeLegacyActionEnvelope(envelope));
      }
      this._serverSeq = maxSeq;
      if (result.missing.length > 0) {
        this._logService.info(`[RemoteAgentHostProtocol] Server cannot resume ${result.missing.length} subscription(s) after reconnect.`);
        this._subscriptionManager.markSubscriptionsMissing(result.missing.map((u) => URI.parse(u)));
      }
    } else {
      let maxSeq = this._serverSeq;
      for (const snapshot of result.snapshots) {
        this._subscriptionManager.applyReconnectSnapshot(snapshot.resource, snapshot.state, snapshot.fromSeq, preservePending);
        if (snapshot.fromSeq > maxSeq) {
          maxSeq = snapshot.fromSeq;
        }
      }
      this._serverSeq = maxSeq;
    }
  }
  /**
   * Drain queued outgoing wire traffic after a successful soft reconnect:
   *
   * 1. Resend pending optimistic session actions that the server did NOT
   *    echo back in the replay buffer (i.e. anything still on
   *    {@link AgentSubscriptionManager.getPendingActions}).
   * 2. Flush every message that {@link _sendNotification} queued onto the
   *    outbox while the gate was engaged.
   *
   * Replays are deduped against the outbox by `clientSeq` so a session
   * action that was both optimistic-tracked AND queued during the
   * reconnect window only goes out once.
   */
  _drainAfterReconnect(outbox) {
    const queuedSeqs = /* @__PURE__ */ new Set();
    for (const msg of outbox) {
      if (hasKey(msg, { method: true }) && msg.method === "dispatchAction") {
        queuedSeqs.add(msg.params.clientSeq);
      }
    }
    const replays = [];
    for (const entry of this._subscriptionManager.getPendingActions()) {
      if (queuedSeqs.has(entry.clientSeq)) {
        continue;
      }
      this._grantImplicitReadsForOutgoingAction(entry.action);
      replays.push({
        jsonrpc: "2.0",
        method: "dispatchAction",
        params: { channel: entry.channel, clientSeq: entry.clientSeq, action: entry.action }
      });
    }
    if (replays.length > 0) {
      this._logService.info(`[RemoteAgentHostProtocol] Replaying ${replays.length} pending action(s) after reconnect to ${this._address}.`);
    }
    for (const msg of replays) {
      this._transport.send(msg);
    }
    for (const msg of outbox) {
      this._transport.send(msg);
    }
  }
  // ---- IAgentConnection subscription API ----------------------------------
  get rootState() {
    return this._subscriptionManager.rootState;
  }
  getSubscription(kind, resource, owner) {
    return this._subscriptionManager.getSubscription(kind, resource, owner);
  }
  getSubscriptionUnmanaged(_kind, resource) {
    return this._subscriptionManager.getSubscriptionUnmanaged(resource);
  }
  getInflightSessionCreate(resource) {
    return this._subscriptionManager.getInflightSessionCreate(resource);
  }
  trackSessionCreate(resource, promise) {
    this._subscriptionManager.trackSessionCreate(resource, promise);
  }
  getActiveSubscriptions() {
    return this._subscriptionManager.getActiveSubscriptions();
  }
  dispatch(channel, action) {
    const seq = this._subscriptionManager.dispatchOptimistic(channel, action);
    this.dispatchAction(channel, action, this._clientId, seq);
  }
  /**
   * Subscribe to state at a URI. Returns the current state snapshot.
   *
   * For stateless channels (e.g. `ahp-otlp:` telemetry channels) use
   * {@link subscribeStateless} — calling this method on a stateless
   * channel rejects because the server omits `snapshot` on the
   * response.
   */
  async subscribe(resource) {
    this._logService.trace(`[RemoteAgentHostProtocol] subscribe start: ${resource.toString()}`);
    const result = await this._sendRequest("subscribe", { channel: resource.toString() });
    if (!result.snapshot) {
      throw new Error(`subscribe to ${resource.toString()} returned no snapshot`);
    }
    this._logService.trace(`[RemoteAgentHostProtocol] subscribe done: ${resource.toString()}`);
    return result.snapshot;
  }
  /**
   * Subscribe to a stateless channel — one for which the server does
   * not maintain replayable state and therefore omits `snapshot` from
   * the `subscribe` response. Used today for the host's OTLP telemetry
   * channels (`ahp-otlp:`).
   *
   * Returns once the subscription is confirmed by the server.
   * Subsequent notifications on the channel arrive via the relevant
   * dispatch event (e.g. {@link onDidReceiveOtlpLogs} for log records).
   */
  async subscribeStateless(resource) {
    await this._sendRequest("subscribe", { channel: resource.toString() });
  }
  /**
   * Unsubscribe from state at a URI.
   */
  unsubscribe(resource) {
    this._sendNotification("unsubscribe", { channel: resource.toString() });
  }
  /**
   * Dispatch a client action to the server. Returns the clientSeq used.
   */
  dispatchAction(channel, action, _clientId, clientSeq) {
    this._grantImplicitReadsForOutgoingAction(action);
    this._sendNotification("dispatchAction", { channel, clientSeq, action });
  }
  /**
   * Create a new session on the remote agent host.
   */
  createSession(config) {
    const provider = config?.provider;
    if (!provider) {
      throw new Error("Cannot create remote agent host session without a provider.");
    }
    const session = config?.session ?? AgentSession.uri(provider, generateUuid());
    if (config?.activeClient?.customizations) {
      this._grantImplicitReadsForCustomizations(config.activeClient.customizations);
    }
    const promise = this._sendRequest("createSession", {
      channel: session.toString(),
      _meta: config?._meta,
      provider,
      workingDirectories: config?.workingDirectories?.map((d) => fromAgentHostUri(d).toString()),
      config: config?.config,
      activeClient: config?.activeClient,
      progressToken: config?.progressToken
    }).then(() => session);
    this._subscriptionManager.trackSessionCreate(session, promise);
    return promise;
  }
  async resolveSessionConfig(params) {
    return this._sendRequest("resolveSessionConfig", {
      channel: ROOT_STATE_URI,
      provider: params.provider,
      workingDirectory: params.workingDirectory ? fromAgentHostUri(params.workingDirectory).toString() : void 0,
      config: params.config
    });
  }
  async sessionConfigCompletions(params) {
    return this._sendRequest("sessionConfigCompletions", {
      channel: ROOT_STATE_URI,
      provider: params.provider,
      workingDirectory: params.workingDirectory ? fromAgentHostUri(params.workingDirectory).toString() : void 0,
      config: params.config,
      property: params.property,
      query: params.query
    });
  }
  async completions(params) {
    return this._sendRequest("completions", params);
  }
  async listAutomationTriggerDefinitions(params) {
    return this._sendRequest("listAutomationTriggerDefinitions", params);
  }
  async runAutomation(params) {
    return this._sendRequest("runAutomation", params);
  }
  async fetchAutomationRuns(params) {
    return this._sendRequest("fetchAutomationRuns", params);
  }
  /**
   * Send an application-level ping and wait for the server's response.
   * Used by {@link _watchdogTick} to keep idle connections under
   * watchdog supervision; safe to call from external code as well.
   *
   * The returned promise rejects with a {@link ProtocolError} if the
   * connection closes before a response arrives.
   */
  async ping() {
    await this._sendRequest("ping", { channel: ROOT_STATE_URI });
  }
  /**
   * Returns the trigger characters captured from the `initialize` handshake.
   * Empty when the remote host did not announce any.
   */
  async getCompletionTriggerCharacters() {
    while (this._state.kind === "connecting" /* Connecting */) {
      await Event2.toPromise(this.onDidChangeConnectionState);
    }
    switch (this._state.kind) {
      case "incompatible" /* Incompatible */:
      case "closed" /* Closed */:
        throw this._state.error;
      case "connected" /* Connected */:
      case "reconnecting" /* Reconnecting */:
        return this._initializeResult.get()?.completionTriggerCharacters ?? [];
    }
  }
  /**
   * Authenticate with the remote agent host using a specific scheme.
   */
  async authenticate(params) {
    const normalizedParams = {
      ...params,
      scopes: params.scopes ? [...new Set(params.scopes)].sort() : void 0
    };
    await this._sendRequest("authenticate", {
      channel: ROOT_STATE_URI,
      ...normalizedParams,
      scopes: normalizedParams.scopes ? [...normalizedParams.scopes] : void 0
    });
    const key3 = `${normalizedParams.resource}\0${JSON.stringify(normalizedParams.scopes ?? [])}`;
    if (params.token) {
      this._authentication.set(key3, normalizedParams);
    } else {
      this._authentication.delete(key3);
    }
    return { authenticated: true };
  }
  /**
   * Gracefully shut down all sessions on the remote host.
   */
  async shutdown() {
    await this._sendExtensionRequest("shutdown");
  }
  /**
   * List the endpoints the remote agent host suggests probing for connectivity.
   */
  async getNetworkDiagnosticsInfo() {
    return this._sendExtensionRequest("getNetworkDiagnosticsInfo");
  }
  async getManagedSettingsDiagnostics() {
    return this._sendExtensionRequest("getManagedSettingsDiagnostics");
  }
  async getSessionStateFile(session, chat) {
    const targetChat = chat && !isDefaultChatUri(chat) ? chat : void 0;
    if (targetChat && !supportsAgentHostChatStateFile(this._initializeResult.get())) {
      return void 0;
    }
    const result = await this._sendExtensionRequest(GetAgentHostSessionStateFileExtensionMethod, {
      session: session.toString(),
      chat: targetChat?.toString()
    });
    if (!result.resource) {
      return void 0;
    }
    const resource = URI.parse(result.resource, true);
    if (resource.scheme !== Schemas.file) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Agent Host returned a non-file session state resource: ${resource.toString()}`);
    }
    return toAgentHostUri(resource, this._connectionAuthority);
  }
  async collectDebugLogs(session, kind, chat) {
    const result = await this._sendExtensionRequest(CollectAgentHostDebugLogsExtensionMethod, {
      session: session?.toString(),
      chat: chat?.toString(),
      kind
    });
    if (result.kind !== kind) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Agent Host returned ${result.kind} debug logs for a ${kind} request`);
    }
    const resource = URI.parse(result.resource, true);
    if (resource.scheme !== Schemas.file) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Agent Host returned a non-file debug log resource: ${resource.toString()}`);
    }
    if (!Number.isSafeInteger(result.size) || result.size < 0 || !Number.isSafeInteger(result.uncompressedSize) || result.uncompressedSize < 0) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, "Agent Host returned invalid debug log artifact sizes");
    }
    if (!Array.isArray(result.entries) || result.entries.length > AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, "Agent Host returned an invalid debug log artifact manifest");
    }
    const entryPaths = /* @__PURE__ */ new Set();
    let manifestSize = 0;
    for (const entry of result.entries) {
      const segments = entry.path.split("/");
      if (!entry.path || entry.path.includes("\\") || segments.some((segment) => !segment || segment === "." || segment === "..") || !Number.isSafeInteger(entry.size) || entry.size < 0 || entryPaths.has(entry.path)) {
        throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, "Agent Host returned an invalid debug log artifact manifest entry");
      }
      entryPaths.add(entry.path);
      manifestSize += entry.size;
    }
    if (!Number.isSafeInteger(manifestSize) || manifestSize !== result.uncompressedSize) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, "Agent Host debug log artifact manifest size does not match its declared size");
    }
    return {
      kind: result.kind,
      resource: toAgentHostUri(resource, this._connectionAuthority),
      providerLogsIncluded: result.providerLogsIncluded,
      size: result.size,
      uncompressedSize: result.uncompressedSize,
      entries: result.entries
    };
  }
  /**
   * Read one bounded slice of a debug-log artifact previously returned by
   * {@link collectDebugLogs}. `resource` is the agent-host URI handed out by
   * that call; it is unwrapped back to the host-local path here.
   */
  async readDebugLogsChunk(resource, position2) {
    const result = await this._sendExtensionRequest(ReadAgentHostDebugLogsChunkExtensionMethod, {
      resource: fromAgentHostUri(resource).toString(),
      position: position2
    });
    const data = decodeBase64(result.data);
    if (data.byteLength > AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, "Agent Host returned an oversized debug log chunk");
    }
    return { data, eof: result.eof === true };
  }
  /**
   * Probe connectivity from the remote agent host to a single `url`.
   */
  async diagnosticsFetch(url) {
    return this._sendExtensionRequest("diagnosticsFetch", { url });
  }
  /**
   * Dispose a session on the remote agent host.
   */
  async disposeSession(session) {
    await this._sendRequest("disposeSession", { channel: session.toString() });
  }
  async createChat(session, chat, options3) {
    await this._sendRequest("createChat", {
      channel: session.toString(),
      chat: chat.toString(),
      ...options3?.fork ? {
        source: { kind: "fork" /* Fork */, chat: options3.fork.source.toString(), turnId: options3.fork.turnId }
      } : {},
      ...options3?.sideChat ? {
        source: {
          kind: "sideChat" /* SideChat */,
          chat: options3.sideChat.source.toString(),
          turnId: options3.sideChat.turnId,
          ...options3.sideChat.selection ? { selection: options3.sideChat.selection } : {}
        }
      } : {}
    });
  }
  async disposeChat(chat) {
    await this._sendRequest("disposeChat", { channel: chat.toString() });
  }
  /**
   * Create a new terminal on the remote agent host.
   */
  async createTerminal(params) {
    await this._sendRequest("createTerminal", params);
  }
  /**
   * Dispose a terminal on the remote agent host.
   */
  async disposeTerminal(terminal2) {
    await this._sendRequest("disposeTerminal", { channel: terminal2.toString() });
  }
  async invokeChangesetOperation(params) {
    return await this._sendRequest("invokeChangesetOperation", params);
  }
  /**
   * Send a request on an `mcp://` AHP side channel. The agent-host
   * routes by `params.channel` so we inject it automatically.
   */
  async handleMcpRequest(channel, method, params) {
    return await this._dispatchRequest(method, { ...params ?? {}, channel });
  }
  /**
   * List all sessions from the remote agent host.
   */
  async listSessions() {
    const result = await this._sendRequest("listSessions", { channel: ROOT_STATE_URI });
    return result.items.map((s) => ({
      session: URI.parse(s.resource),
      startTime: Date.parse(s.createdAt),
      modifiedTime: Date.parse(s.modifiedAt),
      ...s.project ? {
        project: {
          uri: this._toLocalProjectUri(URI.parse(s.project.uri)),
          displayName: s.project.displayName
        }
      } : {},
      summary: s.title,
      status: s.status,
      activity: s.activity,
      workingDirectory: typeof s.workingDirectories?.[0] === "string" ? toAgentHostUri(URI.parse(s.workingDirectories?.[0]), this._connectionAuthority) : void 0,
      workingDirectories: s.workingDirectories?.map((d) => toAgentHostUri(URI.parse(d), this._connectionAuthority)),
      changes: s.changes,
      // Carry durable host provenance for sessions first materialized from a listing.
      ...s._meta !== void 0 ? { _meta: s._meta } : {}
    }));
  }
  _toLocalProjectUri(uri4) {
    return uri4.scheme === Schemas.file ? toAgentHostUri(uri4, this._connectionAuthority) : uri4;
  }
  /**
   * Inspect an outgoing client-dispatched action and grant implicit reads for
   * resources that the host will need to read after receiving the action.
   */
  _grantImplicitReadsForOutgoingAction(action) {
    switch (action.type) {
      case "session/activeClientSet" /* SessionActiveClientSet */:
        if (action.activeClient.customizations) {
          this._grantImplicitReadsForCustomizations(action.activeClient.customizations);
        }
        break;
      case "chat/turnStarted" /* ChatTurnStarted */:
      case "chat/pendingMessageSet" /* ChatPendingMessageSet */:
        this._grantImplicitReadsForMessage(action.message);
        break;
    }
  }
  _grantImplicitReadsForMessage(message) {
    for (const attachment of message.attachments ?? []) {
      if (attachment.type !== "resource" /* Resource */) {
        continue;
      }
      try {
        this._grantImplicitRead(URI.parse(attachment.uri));
      } catch {
        continue;
      }
    }
  }
  /**
   * Register implicit read grants for each customization URI that we are
   * about to send to the host. The host needs to read these to materialize
   * the customization, but should not need to write them. Grants are
   * deduped per connection and revoked when the connection closes.
   */
  _grantImplicitReadsForCustomizations(refs) {
    for (const ref of refs) {
      let uri4;
      try {
        uri4 = URI.parse(ref.uri);
      } catch {
        continue;
      }
      this._grantImplicitRead(uri4);
    }
  }
  _grantImplicitRead(uri4) {
    if (this._grantedImplicitReadUris.has(uri4)) {
      return;
    }
    this._grantedImplicitReadUris.add(uri4);
    this._implicitReadGrants.add(this._resourceService.grantImplicitRead(this._resourceIdentity, uri4));
  }
  /**
   * List the contents of a directory on the remote host's filesystem.
   */
  async resourceList(uri4) {
    return await this._sendRequest("resourceList", { channel: ROOT_STATE_URI, uri: uri4.toString() });
  }
  /**
   * Read the content of a resource on the remote host.
   */
  async resourceRead(uri4, encoding) {
    return this._sendRequest("resourceRead", { channel: ROOT_STATE_URI, uri: uri4.toString(), encoding });
  }
  async resourceWrite(params) {
    return this._sendRequest("resourceWrite", params);
  }
  async resourceCopy(params) {
    return this._sendRequest("resourceCopy", params);
  }
  async resourceDelete(params) {
    return this._sendRequest("resourceDelete", params);
  }
  async resourceMove(params) {
    return this._sendRequest("resourceMove", params);
  }
  async resourceResolve(params) {
    return this._sendRequest("resourceResolve", params);
  }
  async resourceMkdir(params) {
    return this._sendRequest("resourceMkdir", params);
  }
  async createResourceWatch(params) {
    return this._sendRequest("createResourceWatch", params);
  }
  /**
   * Convenience wrapper used by {@link AHPFileSystemProvider.watch}:
   * runs `createResourceWatch` + `subscribe` and returns a handle that
   * surfaces `resourceWatch/changed` envelopes as
   * {@link IFileChange}[] events. Disposing the handle unsubscribes
   * the watch channel.
   */
  watchResource(params) {
    return createRemoteWatchHandle({
      createResourceWatch: (p) => this.createResourceWatch(p),
      subscribe: (uri4) => this.subscribe(uri4),
      unsubscribe: (uri4) => this.unsubscribe(uri4),
      onDidAction: this.onDidAction
    }, params);
  }
  /**
   * Trigger the CLI-managed upgrade flow for this agent host using the
   * method name advertised by the server (typically
   * {@link VSCODE_UPGRADE_METHOD}). Callable before {@link connect} has
   * completed — typically used when the host has just rejected our
   * `initialize` with an `UnsupportedProtocolVersion` error. The
   * transport stays open after the rejection, so the extension request
   * rides over it without a special out-of-band path.
   *
   * The result mirrors the CLI's HTTP response: ok flag, whether the
   * upgrade is needed / started, running/latest commits.
   */
  triggerVscodeUpgrade(method) {
    return this._dispatchRequest(method, {}, { allowIncompatibleUpgrade: true });
  }
  _handleMessage(msg) {
    if (this._state.kind === "closed" /* Closed */) {
      return;
    }
    this._lastReadTime = Date.now();
    this._resetLivenessTimers();
    if (isJsonRpcRequest(msg)) {
      this._handleReverseRequest(msg.id, msg.method, msg.params);
    } else if (isJsonRpcResponse(msg)) {
      const pending = this._pendingRequests.get(msg.id);
      if (pending) {
        this._pendingRequests.delete(msg.id);
        if (hasKey(msg, { error: true })) {
          if (this._shouldLogFailedRequest(pending, msg.error)) {
            this._logService.warn(`[RemoteAgentHostProtocol] Request ${msg.id} failed:`, msg.error);
          }
          pending.deferred.error(this._toProtocolError(msg.error));
        } else {
          pending.deferred.complete(msg.result);
        }
      } else {
        this._logService.warn(`[RemoteAgentHostProtocol] Received response for unknown request id ${msg.id}`);
      }
    } else if (isJsonRpcNotification(msg)) {
      switch (msg.method) {
        case "action": {
          const envelope = msg.params;
          this._serverSeq = Math.max(this._serverSeq, envelope.serverSeq);
          this._onDidAction.fire(normalizeLegacyActionEnvelope(envelope));
          break;
        }
        case "root/sessionAdded":
        case "root/sessionRemoved":
        case "root/sessionSummaryChanged":
        case "root/progress":
        case "auth/required": {
          this._logService.trace(`[RemoteAgentHostProtocol] Notification: ${msg.method}`);
          this._onDidNotification.fire({ type: msg.method, ...msg.params });
          break;
        }
        case "otlp/exportLogs":
          this._onDidReceiveOtlpLogs.fire(msg.params);
          break;
        case "otlp/exportTraces":
        case "otlp/exportMetrics":
          break;
        default: {
          const rawChannel = msg.params && typeof msg.params === "object" ? msg.params.channel : void 0;
          if (typeof rawChannel === "string" && rawChannel.toLowerCase().startsWith("mcp:/")) {
            const { channel: _channel, ...rest } = msg.params;
            this._onMcpNotification.fire({ channel: rawChannel, method: msg.method, params: rest });
            break;
          }
          this._logService.trace(`[RemoteAgentHostProtocol] Unhandled method: ${msg.method}`);
          break;
        }
      }
    } else {
      this._logService.warn(`[RemoteAgentHostProtocol] Unrecognized message:`, JSON.stringify(msg));
    }
  }
  _handleFatalClose(error) {
    this._onDidFatalClose.fire(error);
    this._handleClose(error);
  }
  _handleClose(error) {
    if (this._state.kind === "closed" /* Closed */) {
      return;
    }
    this._cancelLivenessTimers();
    if (this._state.kind === "reconnecting" /* Reconnecting */) {
      const reconnect = this._state.reconnect;
      if (reconnect.timeoutHandle !== void 0) {
        clearTimeout(reconnect.timeoutHandle);
      }
      if (!reconnect.gate.isSettled) {
        reconnect.gate.error(error);
      }
    }
    if (this._state.kind === "connecting" /* Connecting */) {
      this._state.outbox.length = 0;
    }
    this._rejectPendingRequests(error);
    this._grantedImplicitReadUris.clear();
    this._implicitReadGrants.clear();
    this._resourceService.connectionClosed(this._resourceIdentity);
    this._transitionTo({ kind: "closed" /* Closed */, error });
    this._onDidClose.fire();
  }
  async _raceClose(promise) {
    if (this._state.kind === "closed" /* Closed */) {
      return Promise.reject(this._state.error);
    }
    let closeListener = Disposable.None;
    const closePromise = new Promise((_resolve, reject) => {
      closeListener = this.onDidClose(() => reject(this._state.kind === "closed" /* Closed */ ? this._state.error : connectionClosedError(this._address)));
    });
    try {
      return await Promise.race([promise, closePromise]);
    } finally {
      closeListener.dispose();
    }
  }
  /**
   * Handles reverse RPC requests from the server (e.g. resourceList,
   * resourceRead). Thin wire adapter — dispatches each frame to
   * {@link IAgentHostResourceService} (which owns gating, virtual reads,
   * and the user-prompt flow) and translates results / errors back into
   * JSON-RPC frames.
   */
  _handleReverseRequest(id2, method, params) {
    const transport = this._transport;
    const sendResult = (result) => {
      transport.send({ jsonrpc: "2.0", id: id2, result });
    };
    const sendError = (err) => {
      if (err instanceof AgentHostResourcePermissionError) {
        transport.send({
          jsonrpc: "2.0",
          id: id2,
          error: {
            code: AhpErrorCodes.PermissionDenied,
            message: err.message,
            data: err.request ? { request: err.request } : void 0
          }
        });
        return;
      }
      const fsCode = toFileSystemProviderErrorCode(err instanceof Error ? err : void 0);
      let code = -32e3;
      switch (fsCode) {
        case "EntryNotFound" /* FileNotFound */:
          code = AhpErrorCodes.NotFound;
          break;
        case "NoPermissions" /* NoPermissions */:
          code = AhpErrorCodes.PermissionDenied;
          break;
        case "EntryExists" /* FileExists */:
          code = AhpErrorCodes.AlreadyExists;
          break;
      }
      transport.send({ jsonrpc: "2.0", id: id2, error: { code, message: err instanceof Error ? err.message : String(err) } });
    };
    const p = params ?? {};
    const identity2 = this._resourceIdentity;
    void (async () => {
      try {
        switch (method) {
          case "resourceList": {
            if (!p.uri) {
              throw new Error("Missing uri");
            }
            const result = await this._resourceService.list(identity2, URI.parse(p.uri));
            sendResult({ entries: result.entries });
            return;
          }
          case "resourceRead": {
            if (!p.uri) {
              throw new Error("Missing uri");
            }
            const result = await this._resourceService.read(identity2, URI.parse(p.uri));
            sendResult({ data: encodeBase64(result.bytes), encoding: "base64" /* Base64 */ });
            return;
          }
          case "resourceWrite": {
            if (!p.uri || p.data === void 0) {
              throw new Error("Missing uri or data");
            }
            await this._resourceService.write(identity2, p);
            sendResult({});
            return;
          }
          case "resourceDelete": {
            if (!p.uri) {
              throw new Error("Missing uri");
            }
            await this._resourceService.del(identity2, p);
            sendResult({});
            return;
          }
          case "resourceMove": {
            if (!p.source || !p.destination) {
              throw new Error("Missing source or destination");
            }
            await this._resourceService.move(identity2, p);
            sendResult({});
            return;
          }
          case "resourceCopy": {
            if (!p.source || !p.destination) {
              throw new Error("Missing source or destination");
            }
            await this._resourceService.copy(identity2, p);
            sendResult({});
            return;
          }
          case "resourceResolve": {
            if (!p.uri) {
              throw new Error("Missing uri");
            }
            const result = await this._resourceService.resolve(identity2, p);
            sendResult(result);
            return;
          }
          case "resourceMkdir": {
            if (!p.uri) {
              throw new Error("Missing uri");
            }
            await this._resourceService.mkdir(identity2, p);
            sendResult({});
            return;
          }
          case "resourceRequest": {
            try {
              await this._resourceService.request(identity2, p);
              sendResult({});
            } catch (err) {
              if (err instanceof CancellationError) {
                throw new AgentHostResourcePermissionError(void 0);
              }
              throw err;
            }
            return;
          }
          default:
            this._logService.warn(`[RemoteAgentHostProtocol] Unhandled reverse request: ${method}`);
            throw new Error(`Unknown method: ${method}`);
        }
      } catch (err) {
        sendError(err);
      }
    })();
  }
  /** Send a typed JSON-RPC notification for a protocol-defined method. */
  _sendNotification(method, params) {
    this._sendNotificationMessage(method, params);
  }
  _sendExtensionNotification(method, params, sendDuringReconnect = false) {
    this._sendNotificationMessage(method, params, sendDuringReconnect);
  }
  _sendNotificationMessage(method, params, sendDuringReconnect = false) {
    if (this._state.kind === "closed" /* Closed */ || this._state.kind === "incompatible" /* Incompatible */) {
      return;
    }
    const message = { jsonrpc: "2.0", method, params };
    if (isClientTransport(this._transport) && this._state.kind === "connecting" /* Connecting */) {
      this._state.outbox.push(message);
      return;
    }
    if (this._state.kind === "reconnecting" /* Reconnecting */ && !sendDuringReconnect) {
      this._state.reconnect.outbox.push(message);
      return;
    }
    this._transport.send(message);
  }
  /** Send a typed JSON-RPC request for a protocol-defined method. */
  _sendRequest(method, params) {
    return this._dispatchRequest(method, params);
  }
  /** Send a JSON-RPC request for a VS Code extension method (not in the protocol spec). */
  _sendExtensionRequest(method, params) {
    return this._dispatchRequest(method, params);
  }
  _updateTelemetryLevel() {
    this._dispatchRootConfig({ [AgentHostTelemetryLevelConfigKey]: telemetryLevelToAgentHostConfigValue(this._effectiveTelemetryLevel()) });
  }
  _effectiveTelemetryLevel() {
    return Math.min(getTelemetryLevel(this._configurationService), this._telemetryService.telemetryLevel);
  }
  /** Merge a patch into the agent host's root configuration. */
  _dispatchRootConfig(config) {
    this.dispatchAction(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config
    }, this._clientId, 0);
  }
  _updateDisableRepoInfoTelemetry() {
    const disabled = this._configurationService.getValue(DISABLE_REPO_INFO_TELEMETRY_SETTING_ID) === true;
    this._dispatchRootConfig({ [AgentHostDisableRepoInfoTelemetryConfigKey]: disabled });
  }
  _updateTerminalAutoApproveEnabled() {
    const enabled = this._configurationService.getValue(TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID) !== false;
    this._dispatchRootConfig({ [AgentHostTerminalAutoApproveEnabledConfigKey]: enabled });
  }
  _updateTerminalAutoApproveRules() {
    this._dispatchRootConfig({ [AgentHostTerminalAutoApproveRulesConfigKey]: getAgentHostTerminalAutoApproveRulesConfig(this._configurationService) });
  }
  _updateManagedSettingsPermissions(sendDuringReconnect = false) {
    const permissions = this._resourceIdentity === LOCAL_AGENT_HOST_RESOURCE_IDENTITY ? resolveManagedSettingsPermissions(this._configurationService) : {};
    this._sendExtensionNotification("setClientManagedSettingsPermissions", { permissions }, sendDuringReconnect);
  }
  /**
   * Common path for outgoing JSON-RPC requests: queue pre-initialize traffic,
   * gate on any in-flight reconnect (unless explicitly bypassed for the
   * `reconnect` RPC itself), assign an id, register the pending deferred, and
   * write to the wire.
   *
   * The reconnect-gate bypass exists because the `reconnect` request is sent
   * from inside `_attemptReconnect` while the gate is engaged, so it can't
   * wait on its own resolution.
   */
  async _dispatchRequest(method, params, options3 = {}) {
    if (this._state.kind === "closed" /* Closed */) {
      throw this._state.error;
    }
    if (this._state.kind === "incompatible" /* Incompatible */) {
      if (!options3.allowIncompatibleUpgrade) {
        throw this._state.error;
      }
      const { request: request3, result: result2 } = this._createRequest(method, params);
      this._transport.send(request3);
      return result2;
    }
    if (!options3.bypassInitializeQueue && isClientTransport(this._transport) && this._state.kind === "connecting" /* Connecting */) {
      const { request: request3, result: result2 } = this._createRequest(method, params);
      this._state.outbox.push(request3);
      return result2;
    }
    while (!options3.bypassReconnectGate && this._state.kind === "reconnecting" /* Reconnecting */) {
      const current2 = this._state;
      if (current2.kind !== "reconnecting" /* Reconnecting */) {
        break;
      }
      try {
        await current2.reconnect.gate.p;
      } catch {
      }
    }
    const current = this._state;
    if (current.kind === "closed" /* Closed */ || current.kind === "incompatible" /* Incompatible */) {
      throw current.error;
    }
    const { request: request2, result } = this._createRequest(method, params);
    this._transport.send(request2);
    return result;
  }
  _createRequest(method, params) {
    const id2 = this._nextRequestId++;
    const deferred = new DeferredPromise();
    this._pendingRequests.set(id2, { deferred, suppressNotFoundWarning: isFileResourceRead(method, params), sentAt: Date.now() });
    return {
      request: { jsonrpc: "2.0", id: id2, method, params },
      result: deferred.p
    };
  }
  _shouldLogFailedRequest(request2, error) {
    if (error.code === AhpErrorCodes.NotFound && request2.suppressNotFoundWarning) {
      return false;
    }
    return true;
  }
  _toProtocolError(error) {
    return new ProtocolError(error.code, error.message, error.data);
  }
  _rejectPendingRequests(error) {
    for (const pending of this._pendingRequests.values()) {
      pending.deferred.error(error);
    }
    this._pendingRequests.clear();
  }
  /**
   * Reset the liveness timers. Called at construction for an already-open
   * passive transport, after a successful client-transport initialization,
   * once on every received message (which is itself proof the remote is
   * alive), and once after a successful soft reconnect.
   *
   * Two timers cooperate:
   *
   * 1. {@link _pingTimer} fires after {@link PING_INTERVAL_MS} of silence
   *    and sends an application-level `ping` so the close timer has
   *    something to time out on. Tolerates servers that don't implement
   *    `ping` — the error response still resets both timers.
   *
   * 2. {@link _closeTimer} fires after {@link PING_INTERVAL_MS}+
   *    {@link LIVENESS_TIMEOUT_MS} of continued silence and force-closes
   *    the transport so the renderer's reconnect logic kicks in. Catches
   *    silently-dead transports (e.g. SSH/tunnel after laptop sleep +
   *    network change) that don't emit a socket close event of their own.
   *
   * After laptop sleep + wake the JS event loop is paused, so a timer
   * armed before sleep fires immediately after wake. That's fine —
   * any inbound message processed during the wake catch-up resets it
   * before the close handler runs.
   *
   * No-op while {@link _state.kind} is {@link AgentHostClientState.Incompatible},
   * {@link AgentHostClientState.Reconnecting}, or {@link AgentHostClientState.Closed}:
   * the transport is not available for normal liveness traffic in those states.
   */
  _resetLivenessTimers() {
    this._cancelLivenessTimers();
    if (this._state.kind === "incompatible" /* Incompatible */ || this._state.kind === "reconnecting" /* Reconnecting */ || this._state.kind === "closed" /* Closed */) {
      return;
    }
    this._pingTimer.cancelAndSet(() => this._onPingTimer(), PING_INTERVAL_MS2);
    this._closeTimer.cancelAndSet(() => this._onCloseTimer(), PING_INTERVAL_MS2 + LIVENESS_TIMEOUT_MS);
  }
  _cancelLivenessTimers() {
    this._pingTimer.cancel();
    this._closeTimer.cancel();
  }
  _onPingTimer() {
    if (this._state.kind === "incompatible" /* Incompatible */ || this._state.kind === "closed" /* Closed */ || this._state.kind === "reconnecting" /* Reconnecting */) {
      return;
    }
    void this.ping().catch(() => void 0);
  }
  _onCloseTimer() {
    if (this._state.kind === "incompatible" /* Incompatible */ || this._state.kind === "closed" /* Closed */ || this._state.kind === "reconnecting" /* Reconnecting */) {
      return;
    }
    if (this._transport.clientConnectionKind === "local" /* Local */) {
      return;
    }
    if (this._loadEstimator.hasHighLoad()) {
      this._closeTimer.cancelAndSet(() => this._onCloseTimer(), PING_INTERVAL_MS2);
      return;
    }
    const silence = Date.now() - this._lastReadTime;
    this._logService.info(
      `[RemoteAgentHostProtocol] Liveness: no message from ${this._address} for ${silence}ms; forcing close to trigger reconnect.`
    );
    this._transportListeners.clear();
    if (this._transportFactory) {
      this._rejectPendingRequests(connectionTimeoutError(this._address, silence));
      this._handleTransportClose();
      return;
    }
    this._handleClose(connectionTimeoutError(this._address, silence));
  }
  /**
   * Get the next client sequence number for optimistic dispatch.
   */
  nextClientSeq() {
    return this._nextClientSeq++;
  }
};

AgentHostProtocolClient = __decorateClass([
  __decorateParam(3, ILogService),
  __decorateParam(4, IAgentHostResourceService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITelemetryService)
], AgentHostProtocolClient);
export { connectionTimeoutError, connectionClosedError, connectionDisposedError, transportLostError, AHP_CLIENT_CONNECTION_CLOSED, PING_INTERVAL_MS2, LIVENESS_TIMEOUT_MS, AgentHostProtocolClient };
