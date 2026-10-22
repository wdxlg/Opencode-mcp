// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/electron-browser/localAgentHostService.ts
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { DeferredPromise, disposableTimeout } from "./module-0036.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { AgentHostAhpJsonlLoggingSettingId, AgentHostOTelPolicyIpcChannel, AgentHostRestartIpcChannel, AgentHostWillRestartIpcChannel, readAgentHostOTelPolicySettings } from "./module-1108.mjs";
import { AhpJsonlLogger } from "./module-4048.mjs";
import { ipcRenderer } from "./module-3821.mjs";
import { identityAgentHostResourceUriMapper } from "./module-1001.mjs";
import { mark } from "./module-0506.mjs";
import { AgentHostStartupTelemetry } from "./module-4232.mjs";
import { getAgentHostClientType } from "./module-4051.mjs";
import { StopWatch } from "./module-0016.mjs";
import { AgentHostProtocolClient } from "./module-4047.mjs";
import { LOCAL_AGENT_HOST_RESOURCE_IDENTITY } from "./module-1729.mjs";
import { AgentHostIpcChannelTransport } from "./module-4228.mjs";
import { ProxyChannel, getDelayedChannel } from "./module-1230.mjs";
import { MessagePortAcquisitionError, acquirePort } from "./module-3828.mjs";
import { NonReconnectableTransportError } from "./module-4045.mjs";
import { Client2 } from "./module-3827.mjs";
import { constObservable } from "./module-0061.mjs";
import { AgentSession } from "./module-1107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { AGENT_HOST_CLIENT_PROXY_CHANNEL, AgentHostClientProxyChannel } from "./module-4231.mjs";
import { AGENT_HOST_CLIENT_BYOK_LM_CHANNEL, AgentHostClientByokLmChannel, NullAgentHostClientByokLmChannel } from "./module-4230.mjs";


// src/vs/platform/agentHost/electron-browser/localAgentHostService.ts
var LOG_PREFIX15 = "[AgentHost:renderer]";

function notifyOnFatalAgentHostStartError(notificationService) {
  notificationService.error(localize(
    2196,
    null
  ));
}

var LocalAgentHostManagementConnection = class extends Disposable {
  constructor() {
    super();
    this._generation = this._createGeneration();
    this._register(toDisposable(() => this.closed("Local agent host service was disposed.")));
  }
  client() {
    return this._generation.p;
  }
  acquire(client) {
    const generation = this._generation;
    return client.then((value2) => {
      if (this._generation === generation) {
        this._pending = { generation, client: value2 };
      }
      return value2;
    });
  }
  connected() {
    const pending = this._pending;
    this._pending = void 0;
    if (pending?.generation === this._generation) {
      void this._generation.complete(pending.client);
    }
  }
  reconnecting() {
    this._pending = void 0;
    const previous = this._generation;
    this._generation = this._createGeneration();
    void previous.error(new Error("Local agent host connection is reconnecting."));
  }
  closed(message = "Local agent host connection closed.") {
    this._pending = void 0;
    if (this._generation.isSettled) {
      this._generation = this._createGeneration();
    }
    void this._generation.error(new Error(message));
  }
  _createGeneration() {
    const generation = new DeferredPromise();
    generation.p.then(void 0, () => {
    });
    return generation;
  }
};

var LocalAgentHostServiceClient = class extends Disposable {
  constructor(_clientInfo, _logService, _configurationService, environmentService, _instantiationService, _notificationService) {
    super();
    this._clientInfo = _clientInfo;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this.clientId = generateUuid();
    this._clientStore = this._register(new MutableDisposable());
    this._managementConnection = this._register(new LocalAgentHostManagementConnection());
    this._connectStarted = false;
    this._didAcquireInitialMessagePort = false;
    this._didConnectInitially = false;
    this._didStartInitialSessionList = false;
    this._didCompleteInitialSessionList = false;
    this._onAgentHostExit = this._register(new Emitter());
    this.onAgentHostExit = this._onAgentHostExit.event;
    this._onAgentHostStart = this._register(new Emitter());
    this.onAgentHostStart = this._onAgentHostStart.event;
    this._authenticationPending = observableValue("authenticationPending", true);
    this.authenticationPending = this._authenticationPending;
    this._authenticationSettled = false;
    this._noopRootState = {
      value: void 0,
      verifiedValue: void 0,
      onDidChange: Event2.None,
      onWillApplyAction: Event2.None,
      onDidApplyAction: Event2.None
    };
    this._ahpLogger = this._configurationService.getValue(AgentHostAhpJsonlLoggingSettingId) ? this._register(this._instantiationService.createInstance(AhpJsonlLogger, {
      logsHome: environmentService.logsHome,
      connectionId: this.clientId,
      transport: "local"
    })) : void 0;
    const onWillRestart = () => {
      if (!this._protocolClient?.reconnectFromClosed()) {
        this._protocolClient?.notifyTransportClosed();
      }
    };
    ipcRenderer.on(AgentHostWillRestartIpcChannel, onWillRestart);
    this._register(toDisposable(() => ipcRenderer.removeListener(AgentHostWillRestartIpcChannel, onWillRestart)));
  }
  get resourceUris() {
    return this._protocolClient?.resourceUris ?? identityAgentHostResourceUriMapper;
  }
  startAgentHost() {
    if (!this._protocolClient) {
      mark("code/agentHost/willStart");
      this._startupTelemetry = this._register(this._instantiationService.createInstance(
        AgentHostStartupTelemetry,
        getAgentHostClientType(this._clientInfo),
        "local" /* Local */,
        () => StopWatch.create(true),
        (callback, timeoutMs) => disposableTimeout(callback, timeoutMs)
      ));
      this._protocolClient = this._register(this._instantiationService.createInstance(
        AgentHostProtocolClient,
        LOCAL_AGENT_HOST_RESOURCE_IDENTITY,
        () => this._createTransport(),
        { clientId: this.clientId, clientInfo: this._clientInfo }
      ));
      this._register(this._protocolClient.onDidChangeConnectionState((state) => this._handleConnectionState(state)));
      this._register(this._protocolClient.onDidFatalClose(() => {
        if (!this._didConnectInitially) {
          notifyOnFatalAgentHostStartError(this._notificationService);
        }
      }));
    }
    void this._connect().catch((error) => {
      this._logService.error(`${LOG_PREFIX15} Protocol connection failed`, error);
    });
  }
  async _connect() {
    if (this._connectStarted) {
      return;
    }
    this._connectStarted = true;
    await this._requireClient().connect();
  }
  _createTransport() {
    const clientPromise = this._acquireClient();
    return new AgentHostIpcChannelTransport(
      getDelayedChannel(clientPromise.then((client) => client.getChannel("agentHostProtocol" /* Protocol */))),
      this._ahpLogger,
      "local" /* Local */
    );
  }
  _acquireClient() {
    return this._managementConnection.acquire(this._doAcquireClient());
  }
  async _doAcquireClient() {
    this._logService.info(`${LOG_PREFIX15} Acquiring MessagePort to agent host...`);
    this._forwardOTelPolicy();
    let port;
    try {
      port = await acquirePort("vscode:createAgentHostMessageChannel", "vscode:createAgentHostMessageChannelResult");
    } catch (error) {
      if (error instanceof MessagePortAcquisitionError && error.fatal) {
        throw new NonReconnectableTransportError(error.message);
      }
      throw error;
    }
    if (this._store.isDisposed) {
      port.close();
      throw new Error("Local agent host service was disposed during connection.");
    }
    if (!this._didAcquireInitialMessagePort) {
      this._didAcquireInitialMessagePort = true;
      this._startupTelemetry?.messagePortAcquired();
      mark("code/agentHost/didAcquireMessagePort");
    }
    this._logService.info(`${LOG_PREFIX15} MessagePort acquired, creating client...`);
    const store = new DisposableStore();
    try {
      const client = store.add(new Client2(port, this.clientId));
      registerAgentHostClientChannels(
        client,
        this._instantiationService,
        this._logService
      );
      this._clientStore.value = store;
      return client;
    } catch (error) {
      store.dispose();
      throw error;
    }
  }
  _forwardOTelPolicy() {
    ipcRenderer.send(AgentHostOTelPolicyIpcChannel, readAgentHostOTelPolicySettings(this._configurationService));
  }
  _handleConnectionState(state) {
    if (this._store.isDisposed) {
      return;
    }
    if (state === "connected" /* Connected */) {
      this._managementConnection.connected();
      this._startupTelemetry?.protocolConnected();
      if (!this._didConnectInitially) {
        this._didConnectInitially = true;
        mark("code/agentHost/didConnect");
      }
      this._logService.info(`${LOG_PREFIX15} Protocol connection established; clientId=${this._requireClient().clientId}`);
      this._onAgentHostStart.fire();
    } else if (state === "reconnecting" /* Reconnecting */ || state === "incompatible" /* Incompatible */ || state === "closed" /* Closed */) {
      this._clientStore.clear();
      if (state === "reconnecting" /* Reconnecting */) {
        this._managementConnection.reconnecting();
      } else {
        this._startupTelemetry?.connectionFailed();
        this._managementConnection.closed(state === "incompatible" /* Incompatible */ ? "Local agent host protocol is incompatible." : "Local agent host connection closed.");
      }
      this._onAgentHostExit.fire(0);
    }
  }
  _requireClient() {
    if (!this._protocolClient) {
      throw new Error("Local agent host is not connected.");
    }
    return this._protocolClient;
  }
  setAuthenticationPending(pending) {
    if (this._authenticationSettled) {
      return;
    }
    if (!pending) {
      this._authenticationSettled = true;
      this._startupTelemetry?.authenticationSettled();
    }
    this._authenticationPending.set(pending, void 0);
  }
  get initializeResult() {
    return this._protocolClient?.initializeResult ?? constObservable(void 0);
  }
  get rootState() {
    return this._protocolClient?.rootState ?? this._noopRootState;
  }
  get onDidAction() {
    return this._protocolClient?.onDidAction ?? Event2.None;
  }
  get onDidNotification() {
    return this._protocolClient?.onDidNotification ?? Event2.None;
  }
  get onMcpNotification() {
    return this._protocolClient?.onMcpNotification ?? Event2.None;
  }
  getSubscription(kind, resource, owner) {
    return this._requireClient().getSubscription(kind, resource, owner);
  }
  getSubscriptionUnmanaged(kind, resource) {
    return this._protocolClient?.getSubscriptionUnmanaged(kind, resource);
  }
  getInflightSessionCreate(resource) {
    return this._protocolClient?.getInflightSessionCreate(resource);
  }
  getActiveSubscriptions() {
    return this._protocolClient?.getActiveSubscriptions() ?? [];
  }
  dispatch(channel, action) {
    this._requireClient().dispatch(channel, action);
  }
  authenticate(params) {
    return this._requireClient().authenticate(params);
  }
  listSessions() {
    this._startupTelemetry?.sessionListRequested();
    if (!this._didStartInitialSessionList) {
      this._didStartInitialSessionList = true;
      mark("code/agentHost/willListSessions");
    }
    return this._requireClient().listSessions().then(
      (sessions) => {
        this._startupTelemetry?.sessionListSucceeded();
        if (!this._didCompleteInitialSessionList) {
          this._didCompleteInitialSessionList = true;
          mark("code/agentHost/didListSessions");
        }
        return sessions;
      },
      (error) => {
        this._startupTelemetry?.sessionListFailed();
        throw error;
      }
    );
  }
  createSession(config) {
    if (config && hasSessionExtensions(config)) {
      if (!config.provider) {
        throw new Error("Cannot create local agent host session without a provider.");
      }
      const session = config.session ?? AgentSession.uri(config.provider, generateUuid());
      const promise = this._getManagementService().createSessionWithExtensions({ ...config, session });
      this._requireClient().trackSessionCreate(session, promise);
      return promise;
    }
    return this._requireClient().createSession(config);
  }
  resolveSessionConfig(params) {
    return this._requireClient().resolveSessionConfig(params);
  }
  sessionConfigCompletions(params) {
    return this._requireClient().sessionConfigCompletions(params);
  }
  completions(params) {
    return this._requireClient().completions(params);
  }
  listAutomationTriggerDefinitions(params) {
    return this._requireClient().listAutomationTriggerDefinitions(params);
  }
  runAutomation(params) {
    return this._requireClient().runAutomation(params);
  }
  fetchAutomationRuns(params) {
    return this._requireClient().fetchAutomationRuns(params);
  }
  getCompletionTriggerCharacters() {
    return this._requireClient().getCompletionTriggerCharacters();
  }
  disposeSession(session) {
    return this._requireClient().disposeSession(session);
  }
  createChat(session, chat, options3) {
    if (options3 && hasChatExtensions(options3)) {
      return this._getManagementService().createChatWithExtensions(session, chat, options3);
    }
    return this._requireClient().createChat(session, chat, options3);
  }
  disposeChat(chat) {
    return this._requireClient().disposeChat(chat);
  }
  createTerminal(params) {
    return this._requireClient().createTerminal(params);
  }
  disposeTerminal(terminal2) {
    return this._requireClient().disposeTerminal(terminal2);
  }
  invokeChangesetOperation(params) {
    return this._requireClient().invokeChangesetOperation(params);
  }
  handleMcpRequest(channel, method, params) {
    return this._requireClient().handleMcpRequest(channel, method, params);
  }
  resourceList(uri4) {
    return this._requireClient().resourceList(uri4);
  }
  resourceRead(uri4, encoding) {
    return this._requireClient().resourceRead(uri4, encoding);
  }
  resourceWrite(params) {
    return this._requireClient().resourceWrite(params);
  }
  resourceCopy(params) {
    return this._requireClient().resourceCopy(params);
  }
  resourceDelete(params) {
    return this._requireClient().resourceDelete(params);
  }
  resourceMove(params) {
    return this._requireClient().resourceMove(params);
  }
  resourceResolve(params) {
    return this._requireClient().resourceResolve(params);
  }
  resourceMkdir(params) {
    return this._requireClient().resourceMkdir(params);
  }
  createResourceWatch(params) {
    return this._requireClient().createResourceWatch(params);
  }
  watchResource(params) {
    return this._requireClient().watchResource(params);
  }
  getNetworkDiagnosticsInfo() {
    return this._getManagementService().getNetworkDiagnosticsInfo();
  }
  getManagedSettingsDiagnostics() {
    return this._getManagementService().getManagedSettingsDiagnostics();
  }
  diagnosticsFetch(url) {
    return this._getManagementService().diagnosticsFetch(url);
  }
  getSessionStateFile(session, chat) {
    return this._getManagementService().getSessionStateFile(session, chat);
  }
  collectDebugLogs(session, kind, chat) {
    return this._getManagementService().collectDebugLogs(session, kind, chat);
  }
  readDebugLogsChunk(resource, position2) {
    return this._getManagementService().readDebugLogsChunk(resource, position2);
  }
  async restartAgentHost() {
    this._forwardOTelPolicy();
    ipcRenderer.send(AgentHostRestartIpcChannel);
  }
  startWebSocketServer() {
    return this._getManagementService().startWebSocketServer();
  }
  getInspectInfo(tryEnable) {
    return this._getManagementService().getInspectInfo(tryEnable);
  }
  _getManagementService() {
    return ProxyChannel.toService(
      getDelayedChannel(this._managementConnection.client().then((client) => client.getChannel("agentHostManagement" /* Management */)))
    );
  }
};

LocalAgentHostServiceClient = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, INotificationService)
], LocalAgentHostServiceClient);

function hasSessionExtensions(config) {
  return config.model !== void 0 || config.agent !== void 0 || config.importConversation !== void 0;
}

function hasChatExtensions(options3) {
  return options3.title !== void 0 || options3.model !== void 0;
}

function registerAgentHostClientChannels(client, instantiationService, logService) {
  client.registerChannel(AGENT_HOST_CLIENT_PROXY_CHANNEL, instantiationService.createInstance(AgentHostClientProxyChannel));
  try {
    client.registerChannel(AGENT_HOST_CLIENT_BYOK_LM_CHANNEL, instantiationService.createInstance(AgentHostClientByokLmChannel));
  } catch (error) {
    logService.warn(`${LOG_PREFIX15} BYOK language-model bridge not registered for this window. ${error instanceof Error ? error.message : String(error)}`);
    client.registerChannel(AGENT_HOST_CLIENT_BYOK_LM_CHANNEL, new NullAgentHostClientByokLmChannel());
  }
}
export { notifyOnFatalAgentHostStartError, hasSessionExtensions, hasChatExtensions, registerAgentHostClientChannels, LOG_PREFIX15, LocalAgentHostManagementConnection, LocalAgentHostServiceClient };
