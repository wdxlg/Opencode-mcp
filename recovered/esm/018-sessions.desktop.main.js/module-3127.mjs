// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/terminalSandboxService.ts
import { SANDBOX_SETTING_KEYS, readSandboxSetting } from "./module-3102.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getTerminalOutputDirectory } from "./module-3114.mjs";
import { TerminalSandboxEngine } from "./module-3126.mjs";
import { localize } from "./module-0001.mjs";
import { OS } from "./module-0014.mjs";
import { FileAccess } from "./module-0033.mjs";
import { dirname } from "./module-0026.mjs";
import { arch } from "./module-0015.mjs";
import { URI } from "./module-0032.mjs";
import { SANDBOX_HELPER_CHANNEL_NAME, SandboxHelperChannelClient } from "./module-3119.mjs";
import { timeout } from "./module-0036.mjs";
import { ChatModel } from "./module-1193.mjs";
import { ChatElicitationRequestPart } from "./module-2874.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IProductService } from "./module-0875.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ISandboxHelperService } from "./module-3120.mjs";
import { IChatService } from "./module-0973.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/terminalSandboxService.ts
var SANDBOX_TEMP_DIR_NAME = "tmp";

function affectsSandboxSettings(e4) {
  return SANDBOX_SETTING_KEYS.some((key3) => e4.affectsConfiguration(key3));
}

var TerminalSandboxService = class extends Disposable {
  constructor(_configurationService, fileService, _environmentService, _logService, _remoteAgentService, _workspaceContextService, _productService, lifecycleService, _sandboxHelperService, _chatService, instantiationService) {
    super();
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._remoteAgentService = _remoteAgentService;
    this._workspaceContextService = _workspaceContextService;
    this._productService = _productService;
    this._sandboxHelperService = _sandboxHelperService;
    this._chatService = _chatService;
    this._onDidChangeRoots = this._register(new Emitter());
    this._remoteEnvDetailsPromise = this._remoteAgentService.getEnvironment();
    const onDidChangeSandboxSettings = Event2.filter(this._configurationService.onDidChangeConfiguration, affectsSandboxSettings);
    const host = {
      getOS: () => this._resolveOS(),
      getRuntimeInfo: () => this._resolveRuntimeInfo(),
      getUserHome: () => this._resolveUserHome(),
      getSandboxTempDir: () => this._resolveSandboxTempDir(),
      getWorkspaceStorageReadRoot: () => this._resolveWorkspaceStorageReadRoot(),
      getReadRoots: () => [getTerminalOutputDirectory(this._environmentService.cacheHome)],
      getWriteRoots: () => this._workspaceContextService.getWorkspace().folders.map((folder) => folder.uri),
      onDidChangeRoots: this._onDidChangeRoots.event,
      checkSandboxDependencies: () => this._resolveSandboxDependencyStatus(),
      getWindowsMxcFilesystemPolicy: () => this._resolveWindowsMxcFilesystemPolicy(),
      getWindowsMxcEnvironment: () => this._resolveWindowsMxcEnvironment(),
      buildWindowsMxcSandboxPayload: (commandLine, policy, workingDirectory, containerName, containment) => this._resolveWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment),
      getSandboxSetting: (settingId) => this._readSandboxSetting(settingId),
      onDidChangeSandboxSettings: Event2.map(onDidChangeSandboxSettings, () => void 0)
    };
    this._engine = this._register(instantiationService.createInstance(TerminalSandboxEngine, host));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._onDidChangeRoots.fire()));
    this._register(lifecycleService.onWillShutdown((e4) => {
      if (!this._engine.getTempDir()) {
        return;
      }
      e4.join(this._engine.cleanupTempDir(), {
        id: "join.deleteFilesInSandboxTempDir",
        label: localize(20689, null),
        order: 1 /* Default */
      });
    }));
  }
  // ---- ITerminalSandboxService forwarders ---------------------------------
  isEnabled() {
    return this._engine.isEnabled();
  }
  isSandboxAllowNetworkEnabled() {
    return this._engine.isSandboxAllowNetworkEnabled();
  }
  getOS() {
    return this._engine.getOS();
  }
  wrapCommand(command4, requestUnsandboxedExecution, shell, cwd2, commandDetails, requestAllowNetwork) {
    return this._engine.wrapCommand(command4, requestUnsandboxedExecution, shell, cwd2, commandDetails, requestAllowNetwork);
  }
  checkFileAccess(permission, paths) {
    return this._engine.checkFileAccess(permission, paths);
  }
  checkForSandboxingPrereqs(forceRefresh = false) {
    return this._engine.checkForSandboxingPrereqs(forceRefresh);
  }
  getSandboxConfigPath(forceRefresh = false) {
    return this._engine.getSandboxConfigPath(forceRefresh);
  }
  getTempDir() {
    return this._engine.getTempDir();
  }
  setNeedsForceUpdateConfigFile() {
    this._engine.setNeedsForceUpdateConfigFile();
  }
  getResolvedNetworkDomains() {
    return this._engine.getResolvedNetworkDomains();
  }
  getMissingSandboxDependencies() {
    return this._engine.getMissingSandboxDependencies();
  }
  // ---- host adapter helpers -----------------------------------------------
  async _resolveRemoteEnv() {
    if (this._remoteEnvDetails === void 0) {
      this._remoteEnvDetails = await this._remoteEnvDetailsPromise;
    }
    return this._remoteEnvDetails;
  }
  async _resolveOS() {
    const remoteEnv = await this._resolveRemoteEnv();
    return remoteEnv ? remoteEnv.os : OS;
  }
  _readSandboxSetting(settingId) {
    return readSandboxSetting(this._configurationService, this._logService, settingId);
  }
  async _resolveRuntimeInfo() {
    const remoteEnv = await this._resolveRemoteEnv();
    if (remoteEnv) {
      return { appRoot: remoteEnv.os === 1 /* Windows */ ? this._toWindowsPath(remoteEnv.appRoot) : remoteEnv.appRoot.path, execPath: remoteEnv.execPath, runAsNode: false, arch: remoteEnv.arch, nativeModulesDir: "node_modules" };
    }
    const localAppRootUri = FileAccess.asFileUri("");
    const localAppRoot = OS === 1 /* Windows */ ? dirname(localAppRootUri.fsPath) : dirname(localAppRootUri.path);
    const nativeEnv = this._environmentService;
    const nativeModulesDir = this._environmentService.isBuilt ? "node_modules.asar.unpacked" : "node_modules";
    return { appRoot: localAppRoot, execPath: nativeEnv.execPath, runAsNode: true, arch, nativeModulesDir };
  }
  _toWindowsPath(uri4) {
    let value2;
    if (uri4.authority && uri4.path.length > 1 && uri4.scheme === "file") {
      value2 = `\\\\${uri4.authority}${uri4.path}`;
    } else if (/^\/[a-zA-Z]:/.test(uri4.path)) {
      value2 = uri4.path.slice(1);
    } else {
      value2 = uri4.fsPath;
    }
    return value2.replace(/\//g, "\\");
  }
  async _resolveUserHome() {
    const remoteEnv = await this._resolveRemoteEnv();
    if (remoteEnv?.userHome) {
      return remoteEnv.userHome;
    }
    const nativeEnv = this._environmentService;
    return nativeEnv.userHome;
  }
  async _resolveSandboxTempDir() {
    const remoteEnv = await this._resolveRemoteEnv();
    const sandboxTempDirName = this._getSandboxWindowTempDirName();
    if (remoteEnv?.userHome) {
      const sandboxRoot = URI.joinPath(remoteEnv.userHome, this._productService.serverDataFolderName ?? this._productService.dataFolderName, SANDBOX_TEMP_DIR_NAME);
      return sandboxTempDirName ? URI.joinPath(sandboxRoot, sandboxTempDirName) : sandboxRoot;
    }
    const nativeEnv = this._environmentService;
    if (nativeEnv.userHome) {
      const sandboxRoot = URI.joinPath(nativeEnv.userHome, this._productService.dataFolderName, SANDBOX_TEMP_DIR_NAME);
      return sandboxTempDirName ? URI.joinPath(sandboxRoot, sandboxTempDirName) : sandboxRoot;
    }
    return void 0;
  }
  async _resolveWorkspaceStorageReadRoot() {
    const remoteEnv = await this._resolveRemoteEnv();
    const workspaceStorageHome = remoteEnv?.workspaceStorageHome ?? this._environmentService.workspaceStorageHome;
    const workspaceId = this._workspaceContextService.getWorkspace().id;
    return URI.joinPath(workspaceStorageHome, workspaceId);
  }
  _getSandboxWindowTempDirName() {
    const workbenchEnv = this._environmentService;
    const windowId = workbenchEnv.window?.id;
    return typeof windowId === "number" ? `tmp_vscode_${windowId}` : void 0;
  }
  async _resolveSandboxDependencyStatus() {
    const connection = this._remoteAgentService.getConnection();
    if (connection) {
      return connection.withChannel(SANDBOX_HELPER_CHANNEL_NAME, (channel) => {
        const sandboxHelper = new SandboxHelperChannelClient(channel);
        return sandboxHelper.checkSandboxDependencies();
      });
    }
    return this._sandboxHelperService.checkSandboxDependencies();
  }
  async _resolveWindowsMxcFilesystemPolicy() {
    const connection = this._remoteAgentService.getConnection();
    if (connection) {
      return connection.withChannel(SANDBOX_HELPER_CHANNEL_NAME, (channel) => {
        const sandboxHelper = new SandboxHelperChannelClient(channel);
        return sandboxHelper.getWindowsMxcFilesystemPolicy();
      });
    }
    return this._sandboxHelperService.getWindowsMxcFilesystemPolicy();
  }
  async _resolveWindowsMxcEnvironment() {
    const connection = this._remoteAgentService.getConnection();
    if (connection) {
      return connection.withChannel(SANDBOX_HELPER_CHANNEL_NAME, (channel) => {
        const sandboxHelper = new SandboxHelperChannelClient(channel);
        return sandboxHelper.getWindowsMxcEnvironment();
      });
    }
    return this._sandboxHelperService.getWindowsMxcEnvironment();
  }
  async _resolveWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment) {
    const connection = this._remoteAgentService.getConnection();
    if (connection) {
      return connection.withChannel(SANDBOX_HELPER_CHANNEL_NAME, (channel) => {
        const sandboxHelper = new SandboxHelperChannelClient(channel);
        return sandboxHelper.buildWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment);
      });
    }
    return this._sandboxHelperService.buildWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment);
  }
  // ---- workbench-only flows -----------------------------------------------
  async installMissingSandboxDependencies(missingDependencies, sessionResource, token, options3) {
    const status2 = await this._resolveSandboxDependencyStatus();
    if (!status2?.dependencyInstallCommand) {
      return { exitCode: void 0 };
    }
    const depsList = missingDependencies.map((dependency) => this._quoteShellArgument(dependency)).join(" ");
    return this._runSandboxPrerequisiteCommand(`${status2.dependencyInstallCommand} ${depsList}`, sessionResource, token, options3);
  }
  async runSandboxRemediation(remediation, sessionResource, token, options3) {
    let command4;
    switch (remediation) {
      case "disableUserNamespaceRestriction" /* DisableUnprivilagedusernamespaceRestriction */:
        command4 = "sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0";
        break;
      default:
        throw new Error("Unsupported sandbox remediation");
    }
    return this._runSandboxPrerequisiteCommand(command4, sessionResource, token, options3);
  }
  async _runSandboxPrerequisiteCommand(command4, sessionResource, token, options3) {
    const instance2 = await options3.createTerminal();
    let installCommandSent = false;
    const completionPromise = new Promise((resolve3) => {
      const store = new DisposableStore();
      let resolved = false;
      const resolveOnce = (code) => {
        if (resolved) {
          return;
        }
        resolved = true;
        store.dispose();
        resolve3(code);
      };
      const attachListener = () => {
        const detection = instance2.capabilities.get(2 /* CommandDetection */);
        if (detection) {
          store.add(detection.onCommandFinished((cmd) => resolveOnce(cmd.exitCode)));
        }
      };
      attachListener();
      store.add(instance2.capabilities.onDidAddCapability((e4) => {
        if (e4.id === 2 /* CommandDetection */) {
          attachListener();
        }
      }));
      store.add(instance2.onDisposed(() => resolveOnce(void 0)));
      store.add(token.onCancellationRequested(() => resolveOnce(void 0)));
      const safetyTimeout = timeout(5 * 60 * 1e3);
      store.add({ dispose: () => safetyTimeout.cancel() });
      safetyTimeout.then(() => resolveOnce(void 0));
      const passwordPrompt = this._createMissingDependencyPasswordPrompt(sessionResource, {
        focusTerminal: () => options3.focusTerminal(instance2),
        onDidInputData: instance2.onDidInputData,
        onDisposed: instance2.onDisposed,
        didSendInstallCommand: () => installCommandSent
      }, token);
      store.add(passwordPrompt);
    });
    await instance2.sendText(command4, true);
    installCommandSent = true;
    return { exitCode: await completionPromise };
  }
  _quoteShellArgument(value2) {
    return `'${value2.replace(/'/g, `'\\''`)}'`;
  }
  /**
   * Shows a chat elicitation that keeps the "Install" flow grounded in chat while
   * the user focuses the terminal and types a sudo password.
   */
  _createMissingDependencyPasswordPrompt(sessionResource, promptContext, token) {
    const chatModel = sessionResource && this._chatService.getSession(sessionResource);
    if (!(chatModel instanceof ChatModel)) {
      return new DisposableStore();
    }
    const request2 = chatModel.getRequests().at(-1);
    if (!request2) {
      return new DisposableStore();
    }
    const part = new ChatElicitationRequestPart(
      localize(20692, null),
      new MarkdownString(localize(
        20691,
        null
      )),
      "",
      localize(20690, null),
      void 0,
      async () => {
        await promptContext.focusTerminal();
        return "pending" /* Pending */;
      }
    );
    chatModel.acceptResponseProgress(request2, part);
    const store = new DisposableStore();
    const disposePrompt = () => store.dispose();
    store.add({ dispose: () => part.hide() });
    store.add(token.onCancellationRequested(disposePrompt));
    store.add(promptContext.onDisposed(disposePrompt));
    store.add(promptContext.onDidInputData((data) => {
      if (promptContext.didSendInstallCommand() && data.length > 0) {
        disposePrompt();
      }
    }));
    return store;
  }
};

TerminalSandboxService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IRemoteAgentService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IProductService),
  __decorateParam(7, ILifecycleService),
  __decorateParam(8, ISandboxHelperService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IInstantiationService)
], TerminalSandboxService);
export { affectsSandboxSettings, SANDBOX_TEMP_DIR_NAME, TerminalSandboxService };
