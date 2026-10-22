// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel.ts
import { ConfigurationResolverExpression } from "./module-1405.mjs";
import { serializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollection } from "./module-1272.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { IEnvironmentVariableService } from "./module-1271.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";


// src/vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel.ts
var REMOTE_TERMINAL_CHANNEL_NAME = "remoteterminal";

var RemoteTerminalChannelClient = class {
  constructor(_remoteAuthority, _channel, _configurationService, _workspaceContextService, _resolverService, _environmentVariableService, _remoteAuthorityResolverService, _logService, _editorService, _labelService, _environmentService) {
    this._remoteAuthority = _remoteAuthority;
    this._channel = _channel;
    this._configurationService = _configurationService;
    this._workspaceContextService = _workspaceContextService;
    this._resolverService = _resolverService;
    this._environmentVariableService = _environmentVariableService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._logService = _logService;
    this._editorService = _editorService;
    this._labelService = _labelService;
    this._environmentService = _environmentService;
  }
  get onPtyHostExit() {
    return this._channel.listen("$onPtyHostExitEvent" /* OnPtyHostExitEvent */);
  }
  get onPtyHostStart() {
    return this._channel.listen("$onPtyHostStartEvent" /* OnPtyHostStartEvent */);
  }
  get onPtyHostUnresponsive() {
    return this._channel.listen("$onPtyHostUnresponsiveEvent" /* OnPtyHostUnresponsiveEvent */);
  }
  get onPtyHostResponsive() {
    return this._channel.listen("$onPtyHostResponsiveEvent" /* OnPtyHostResponsiveEvent */);
  }
  get onPtyHostRequestResolveVariables() {
    return this._channel.listen("$onPtyHostRequestResolveVariablesEvent" /* OnPtyHostRequestResolveVariablesEvent */);
  }
  get onProcessData() {
    return this._channel.listen("$onProcessDataEvent" /* OnProcessDataEvent */);
  }
  get onProcessExit() {
    return this._channel.listen("$onProcessExitEvent" /* OnProcessExitEvent */);
  }
  get onProcessReady() {
    return this._channel.listen("$onProcessReadyEvent" /* OnProcessReadyEvent */);
  }
  get onProcessReplay() {
    return this._channel.listen("$onProcessReplayEvent" /* OnProcessReplayEvent */);
  }
  get onProcessOrphanQuestion() {
    return this._channel.listen("$onProcessOrphanQuestion" /* OnProcessOrphanQuestion */);
  }
  get onExecuteCommand() {
    return this._channel.listen("$onExecuteCommand" /* OnExecuteCommand */);
  }
  get onDidRequestDetach() {
    return this._channel.listen("$onDidRequestDetach" /* OnDidRequestDetach */);
  }
  get onDidChangeProperty() {
    return this._channel.listen("$onDidChangeProperty" /* OnDidChangeProperty */);
  }
  restartPtyHost() {
    return this._channel.call("$restartPtyHost" /* RestartPtyHost */, []);
  }
  async createProcess(shellLaunchConfig, configuration2, activeWorkspaceRootUri, options3, shouldPersistTerminal, cols, rows, unicodeVersion) {
    await this._configurationService.whenRemoteConfigurationLoaded();
    const resolvedVariables = /* @__PURE__ */ Object.create(null);
    const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    const expr = ConfigurationResolverExpression.parse({ shellLaunchConfig, configuration: configuration2 });
    try {
      await this._resolverService.resolveAsync(lastActiveWorkspace, expr);
    } catch (err) {
      this._logService.error(err);
    }
    for (const [{ inner }, resolved] of expr.resolved()) {
      if (/^config:/.test(inner) || inner === "selectedText" || inner === "lineNumber") {
        resolvedVariables[inner] = resolved.value;
      }
    }
    const envVariableCollections = [];
    for (const [k, v2] of this._environmentVariableService.collections.entries()) {
      envVariableCollections.push([k, serializeEnvironmentVariableCollection(v2.map), serializeEnvironmentDescriptionMap(v2.descriptionMap)]);
    }
    const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(this._remoteAuthority);
    const resolverEnv = {
      /**
       * If the extension host was spawned via a launch configuration,
       * include the environment provided by that launch configuration.
       */
      ...this._environmentService.debugExtensionHost.env ?? {},
      ...resolverResult.options?.extensionHostEnv
    };
    const workspace = this._workspaceContextService.getWorkspace();
    const workspaceFolders = workspace.folders;
    const activeWorkspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) : null;
    const activeFileResource = EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor, {
      supportSideBySide: 1 /* PRIMARY */,
      filterByScheme: [Schemas.file, Schemas.vscodeUserData, Schemas.vscodeRemote]
    });
    const args2 = {
      configuration: configuration2,
      resolvedVariables,
      envVariableCollections,
      shellLaunchConfig,
      workspaceId: workspace.id,
      workspaceName: this._labelService.getWorkspaceLabel(workspace),
      workspaceFolders,
      activeWorkspaceFolder,
      activeFileResource,
      shouldPersistTerminal,
      options: options3,
      cols,
      rows,
      unicodeVersion,
      resolverEnv
    };
    return await this._channel.call("$createProcess" /* CreateProcess */, args2);
  }
  requestDetachInstance(workspaceId, instanceId) {
    return this._channel.call("$requestDetachInstance" /* RequestDetachInstance */, [workspaceId, instanceId]);
  }
  acceptDetachInstanceReply(requestId, persistentProcessId) {
    return this._channel.call("$acceptDetachInstanceReply" /* AcceptDetachInstanceReply */, [requestId, persistentProcessId]);
  }
  attachToProcess(id2) {
    return this._channel.call("$attachToProcess" /* AttachToProcess */, [id2]);
  }
  detachFromProcess(id2, forcePersist) {
    return this._channel.call("$detachFromProcess" /* DetachFromProcess */, [id2, forcePersist]);
  }
  listProcesses() {
    return this._channel.call("$listProcesses" /* ListProcesses */);
  }
  getLatency() {
    return this._channel.call("$getLatency" /* GetLatency */);
  }
  getPerformanceMarks() {
    return this._channel.call("$getPerformanceMarks" /* GetPerformanceMarks */);
  }
  reduceConnectionGraceTime() {
    return this._channel.call("$reduceConnectionGraceTime" /* ReduceConnectionGraceTime */);
  }
  processBinary(id2, data) {
    return this._channel.call("$processBinary" /* ProcessBinary */, [id2, data]);
  }
  start(id2) {
    return this._channel.call("$start" /* Start */, [id2]);
  }
  input(id2, data) {
    return this._channel.call("$input" /* Input */, [id2, data]);
  }
  sendSignal(id2, signal) {
    return this._channel.call("$sendSignal" /* SendSignal */, [id2, signal]);
  }
  acknowledgeDataEvent(id2, charCount) {
    return this._channel.call("$acknowledgeDataEvent" /* AcknowledgeDataEvent */, [id2, charCount]);
  }
  setUnicodeVersion(id2, version2) {
    return this._channel.call("$setUnicodeVersion" /* SetUnicodeVersion */, [id2, version2]);
  }
  setNextCommandId(id2, commandLine, commandId) {
    return this._channel.call("$setNextCommandId" /* SetNextCommandId */, [id2, commandLine, commandId]);
  }
  shutdown(id2, immediate) {
    return this._channel.call("$shutdown" /* Shutdown */, [id2, immediate]);
  }
  resize(id2, cols, rows, pixelWidth, pixelHeight) {
    return this._channel.call("$resize" /* Resize */, [id2, cols, rows, pixelWidth, pixelHeight]);
  }
  clearBuffer(id2) {
    return this._channel.call("$clearBuffer" /* ClearBuffer */, [id2]);
  }
  getInitialCwd(id2) {
    return this._channel.call("$getInitialCwd" /* GetInitialCwd */, [id2]);
  }
  getCwd(id2) {
    return this._channel.call("$getCwd" /* GetCwd */, [id2]);
  }
  orphanQuestionReply(id2) {
    return this._channel.call("$orphanQuestionReply" /* OrphanQuestionReply */, [id2]);
  }
  sendCommandResult(reqId, isError, payload) {
    return this._channel.call("$sendCommandResult" /* SendCommandResult */, [reqId, isError, payload]);
  }
  freePortKillProcess(port) {
    return this._channel.call("$freePortKillProcess" /* FreePortKillProcess */, [port]);
  }
  getDefaultSystemShell(osOverride) {
    return this._channel.call("$getDefaultSystemShell" /* GetDefaultSystemShell */, [osOverride]);
  }
  getProfiles(profiles2, defaultProfile, includeDetectedProfiles) {
    return this._channel.call("$getProfiles" /* GetProfiles */, [this._workspaceContextService.getWorkspace().id, profiles2, defaultProfile, includeDetectedProfiles]);
  }
  acceptPtyHostResolvedVariables(requestId, resolved) {
    return this._channel.call("$acceptPtyHostResolvedVariables" /* AcceptPtyHostResolvedVariables */, [requestId, resolved]);
  }
  getEnvironment() {
    return this._channel.call("$getEnvironment" /* GetEnvironment */);
  }
  getWslPath(original, direction) {
    return this._channel.call("$getWslPath" /* GetWslPath */, [original, direction]);
  }
  setTerminalLayoutInfo(layout2) {
    const workspace = this._workspaceContextService.getWorkspace();
    const args2 = {
      workspaceId: workspace.id,
      tabs: layout2 ? layout2.tabs : [],
      background: layout2 ? layout2.background : null
    };
    return this._channel.call("$setTerminalLayoutInfo" /* SetTerminalLayoutInfo */, args2);
  }
  updateTitle(id2, title, titleSource) {
    return this._channel.call("$updateTitle" /* UpdateTitle */, [id2, title, titleSource]);
  }
  updateIcon(id2, userInitiated, icon2, color2) {
    return this._channel.call("$updateIcon" /* UpdateIcon */, [id2, userInitiated, icon2, color2]);
  }
  refreshProperty(id2, property) {
    return this._channel.call("$refreshProperty" /* RefreshProperty */, [id2, property]);
  }
  updateProperty(id2, property, value2) {
    return this._channel.call("$updateProperty" /* UpdateProperty */, [id2, property, value2]);
  }
  getTerminalLayoutInfo() {
    const workspace = this._workspaceContextService.getWorkspace();
    const args2 = {
      workspaceId: workspace.id
    };
    return this._channel.call("$getTerminalLayoutInfo" /* GetTerminalLayoutInfo */, args2);
  }
  reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
    return this._channel.call("$reviveTerminalProcesses" /* ReviveTerminalProcesses */, [workspaceId, state, dateTimeFormatLocate]);
  }
  getRevivedPtyNewId(id2) {
    return this._channel.call("$getRevivedPtyNewId" /* GetRevivedPtyNewId */, [id2]);
  }
  serializeTerminalState(ids) {
    return this._channel.call("$serializeTerminalState" /* SerializeTerminalState */, [ids]);
  }
  // #region Pty service contribution RPC calls
  installAutoReply(match2, reply) {
    return this._channel.call("$installAutoReply" /* InstallAutoReply */, [match2, reply]);
  }
  uninstallAllAutoReplies() {
    return this._channel.call("$uninstallAllAutoReplies" /* UninstallAllAutoReplies */, []);
  }
  // #endregion
};

RemoteTerminalChannelClient = __decorateClass([
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IConfigurationResolverService),
  __decorateParam(5, IEnvironmentVariableService),
  __decorateParam(6, IRemoteAuthorityResolverService),
  __decorateParam(7, ITerminalLogService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IWorkbenchEnvironmentService)
], RemoteTerminalChannelClient);
export { REMOTE_TERMINAL_CHANNEL_NAME, RemoteTerminalChannelClient };
