// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/agentHost/browser/editorRemoteAgentHostServiceClient.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { EditorRemoteAgentHostTransport } from "./module-3933.mjs";
import { AgentHostIpcChannelTransport } from "./module-3923.mjs";
import { agentsWindowAgentHostClientInfo, editorWindowAgentHostClientInfo } from "./module-3929.mjs";
import { AgentHostProtocolClient } from "./module-3927.mjs";
import { agentHostAuthority, fromAgentHostUri, identityAgentHostResourceUriMapper } from "./module-1000.mjs";
import { autorun } from "./module-0052.mjs";
import { constObservable } from "./module-0061.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IAgentHostFileSystemService2 } from "./module-2121.mjs";


// src/vs/workbench/services/agentHost/browser/editorRemoteAgentHostServiceClient.ts
var REMOTE_NOT_SUPPORTED = (op) => new Error(`${op} is not supported when the agent host runs on a remote.`);

var LOG_PREFIX3 = "[AgentHost:remote]";

var EditorRemoteAgentHostServiceClient = class extends Disposable {
  constructor(_remoteAgentService, agentHostEnablementService, instantiationService, _logService, environmentService, agentHostFileSystemService) {
    super();
    this._remoteAgentService = _remoteAgentService;
    this._logService = _logService;
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
    this._connectStarted = false;
    const connection = this._remoteAgentService.getConnection();
    this._logService.info(`${LOG_PREFIX3} Initializing (remoteAuthority=${connection?.remoteAuthority ?? "none"})`);
    if (!connection) {
      this._logService.warn(`${LOG_PREFIX3} No remote agent connection available. Not connecting.`);
      this.setAuthenticationPending(false);
      return;
    }
    const createTransport = () => new EditorRemoteAgentHostTransport(
      new AgentHostIpcChannelTransport(connection.getChannel("agentHostProxy" /* RemoteProxy */), void 0, "remote_extension_host" /* RemoteExtensionHost */),
      connection.remoteAuthority
    );
    const address = `vscode-remote://${connection.remoteAuthority}`;
    const clientInfo = environmentService.isSessionsWindow ? agentsWindowAgentHostClientInfo : editorWindowAgentHostClientInfo;
    this._protocolClient = this._register(instantiationService.createInstance(AgentHostProtocolClient, address, createTransport, { clientInfo }));
    this._register(agentHostFileSystemService.registerAuthority(agentHostAuthority(address), this._protocolClient));
    this._register(this._protocolClient.onDidClose(() => {
      this._logService.info(`${LOG_PREFIX3} Protocol client closed`);
      this._onAgentHostExit.fire(0);
    }));
    this._register(this._protocolClient.onDidChangeConnectionState((state) => {
      if (state === "connected" /* Connected */) {
        this._logService.info(`${LOG_PREFIX3} Connected; clientId=${this._protocolClient?.clientId}`);
        this._onAgentHostStart.fire();
      }
    }));
    this._register(autorun((reader) => {
      if (agentHostEnablementService.enabled.read(reader)) {
        this.startAgentHost();
      }
    }));
  }
  get resourceUris() {
    return this._protocolClient?.resourceUris ?? identityAgentHostResourceUriMapper;
  }
  async _connect() {
    if (this._connectStarted || !this._protocolClient) {
      return;
    }
    this._connectStarted = true;
    this._logService.info(`${LOG_PREFIX3} Connecting to remote agent host...`);
    await this._remoteAgentService.getRawEnvironment();
    await this._protocolClient.connect();
  }
  _requireClient() {
    if (!this._protocolClient) {
      throw new Error("Remote agent host is not enabled or no remote connection is available.");
    }
    return this._protocolClient;
  }
  // ---- IAgentHostService local-only surface (stubs) -----------------------
  setAuthenticationPending(pending) {
    if (this._authenticationSettled) {
      return;
    }
    if (!pending) {
      this._authenticationSettled = true;
    }
    this._authenticationPending.set(pending, void 0);
  }
  startAgentHost() {
    this._connect().catch((err) => this._logService.warn(`${LOG_PREFIX3} Connect failed`, err));
  }
  async restartAgentHost() {
  }
  async startWebSocketServer() {
    throw REMOTE_NOT_SUPPORTED("startWebSocketServer");
  }
  async getInspectInfo(_tryEnable) {
    return void 0;
  }
  // ---- IAgentConnection delegation ---------------------------------------
  // All getters delegate directly to the eagerly-created protocol client so
  // `AgentHostContribution` can subscribe synchronously in its constructor.
  get clientId() {
    return this._protocolClient?.clientId ?? "";
  }
  get initializeResult() {
    return this._protocolClient?.initializeResult ?? constObservable(void 0);
  }
  get rootState() {
    return this._protocolClient?.rootState ?? this._noopRootState;
  }
  get onDidNotification() {
    return this._protocolClient?.onDidNotification ?? Event2.None;
  }
  get onDidAction() {
    return this._protocolClient?.onDidAction ?? Event2.None;
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
    this._protocolClient?.dispatch(channel, action);
  }
  authenticate(params) {
    return this._requireClient().authenticate(params);
  }
  getNetworkDiagnosticsInfo() {
    return this._requireClient().getNetworkDiagnosticsInfo();
  }
  getManagedSettingsDiagnostics() {
    return this._requireClient().getManagedSettingsDiagnostics();
  }
  diagnosticsFetch(url) {
    return this._requireClient().diagnosticsFetch(url);
  }
  getSessionStateFile(session, chat) {
    return this._requireClient().getSessionStateFile(session, chat);
  }
  collectDebugLogs(session, kind, chat) {
    return this._requireClient().collectDebugLogs(session, kind, chat);
  }
  readDebugLogsChunk(resource, position2) {
    return this._requireClient().readDebugLogsChunk(resource, position2);
  }
  /** Unwraps the shared client's resource URIs to retain the translated remote workspace identities. */
  async listSessions() {
    const sessions = await this._requireClient().listSessions();
    return sessions.map((session) => ({
      ...session,
      workingDirectory: session.workingDirectory ? fromAgentHostUri(session.workingDirectory) : void 0,
      workingDirectories: session.workingDirectories?.map(fromAgentHostUri)
    }));
  }
  createSession(config) {
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
  resourceList(uri5) {
    return this._requireClient().resourceList(uri5);
  }
  resourceRead(uri5, encoding) {
    return this._requireClient().resourceRead(uri5, encoding);
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
};

EditorRemoteAgentHostServiceClient = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IAgentHostEnablementService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IAgentHostFileSystemService2)
], EditorRemoteAgentHostServiceClient);
export { REMOTE_NOT_SUPPORTED, LOG_PREFIX3, EditorRemoteAgentHostServiceClient };
