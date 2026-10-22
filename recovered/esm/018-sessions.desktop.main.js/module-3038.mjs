// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/remoteTerminalBackend.ts
import { REMOTE_TERMINAL_CHANNEL_NAME, RemoteTerminalChannelClient } from "./module-3034.mjs";
import { Registry } from "./module-0090.mjs";
import { ITerminalLogService, TerminalExtensions } from "./module-1155.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ITerminalInstanceService } from "./module-1150.mjs";
import { BaseTerminalBackend } from "./module-3031.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { revive } from "./module-0265.mjs";
import { TERMINAL_CONFIG_SECTION } from "./module-1174.mjs";
import { getWorkspaceForTerminal } from "./module-3037.mjs";
import { RemotePty } from "./module-3033.mjs";
import { StopWatch } from "./module-0016.mjs";
import { mark } from "./module-0506.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStatusbarService } from "./module-0895.mjs";


// src/vs/workbench/contrib/terminal/browser/remoteTerminalBackend.ts
var RemoteTerminalBackendContribution = class {
  static {
    this.ID = "remoteTerminalBackend";
  }
  constructor(instantiationService, remoteAgentService, terminalInstanceService) {
    const connection = remoteAgentService.getConnection();
    if (connection?.remoteAuthority) {
      const channel = instantiationService.createInstance(RemoteTerminalChannelClient, connection.remoteAuthority, connection.getChannel(REMOTE_TERMINAL_CHANNEL_NAME));
      const backend = instantiationService.createInstance(RemoteTerminalBackend, connection.remoteAuthority, channel);
      Registry.as(TerminalExtensions.Backend).registerTerminalBackend(backend);
      terminalInstanceService.didRegisterBackend(backend);
    }
  }
};

RemoteTerminalBackendContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, ITerminalInstanceService)
], RemoteTerminalBackendContribution);

var RemoteTerminalBackend = class extends BaseTerminalBackend {
  constructor(remoteAuthority, _remoteTerminalChannel, _remoteAgentService, _instantiationService, logService, _commandService, _storageService, _remoteAuthorityResolverService, workspaceContextService, configurationResolverService, _historyService, _configurationService, statusBarService) {
    super(_remoteTerminalChannel, logService, _historyService, configurationResolverService, statusBarService, workspaceContextService);
    this.remoteAuthority = remoteAuthority;
    this._remoteTerminalChannel = _remoteTerminalChannel;
    this._remoteAgentService = _remoteAgentService;
    this._instantiationService = _instantiationService;
    this._commandService = _commandService;
    this._storageService = _storageService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._historyService = _historyService;
    this._configurationService = _configurationService;
    this._ptys = /* @__PURE__ */ new Map();
    this._whenConnected = new DeferredPromise();
    this._onDidRequestDetach = this._register(new Emitter());
    this.onDidRequestDetach = this._onDidRequestDetach.event;
    this._onRestoreCommands = this._register(new Emitter());
    this.onRestoreCommands = this._onRestoreCommands.event;
    this._register(this._remoteTerminalChannel.onProcessData((e4) => this._ptys.get(e4.id)?.handleData(e4.event)));
    this._register(this._remoteTerminalChannel.onProcessReplay((e4) => {
      this._ptys.get(e4.id)?.handleReplay(e4.event);
      if (e4.event.commands.commands.length > 0) {
        this._onRestoreCommands.fire({ id: e4.id, commands: e4.event.commands.commands });
      }
    }));
    this._register(this._remoteTerminalChannel.onProcessOrphanQuestion((e4) => this._ptys.get(e4.id)?.handleOrphanQuestion()));
    this._register(this._remoteTerminalChannel.onDidRequestDetach((e4) => this._onDidRequestDetach.fire(e4)));
    this._register(this._remoteTerminalChannel.onProcessReady((e4) => this._ptys.get(e4.id)?.handleReady(e4.event)));
    this._register(this._remoteTerminalChannel.onDidChangeProperty((e4) => this._ptys.get(e4.id)?.handleDidChangeProperty(e4.property)));
    this._register(this._remoteTerminalChannel.onProcessExit((e4) => {
      const pty = this._ptys.get(e4.id);
      if (pty) {
        pty.handleExit(e4.event);
        pty.dispose();
        this._ptys.delete(e4.id);
      }
    }));
    const allowedCommands = ["_remoteCLI.openExternal", "_remoteCLI.windowOpen", "_remoteCLI.getSystemStatus", "_remoteCLI.manageExtensions"];
    this._register(this._remoteTerminalChannel.onExecuteCommand(async (e4) => {
      const pty = this._ptys.get(e4.persistentProcessId);
      if (!pty) {
        return;
      }
      const reqId = e4.reqId;
      const commandId = e4.commandId;
      if (!allowedCommands.includes(commandId)) {
        this._remoteTerminalChannel.sendCommandResult(reqId, true, "Invalid remote cli command: " + commandId);
        return;
      }
      const commandArgs = e4.commandArgs.map((arg) => revive(arg));
      try {
        const result = await this._commandService.executeCommand(e4.commandId, ...commandArgs);
        this._remoteTerminalChannel.sendCommandResult(reqId, false, result);
      } catch (err) {
        this._remoteTerminalChannel.sendCommandResult(reqId, true, err);
      }
    }));
    this._onPtyHostConnected.fire();
  }
  get whenReady() {
    return this._whenConnected.p;
  }
  setReady() {
    this._whenConnected.complete();
  }
  async requestDetachInstance(workspaceId, instanceId) {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot request detach instance when there is no remote!`);
    }
    return this._remoteTerminalChannel.requestDetachInstance(workspaceId, instanceId);
  }
  async acceptDetachInstanceReply(requestId, persistentProcessId) {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot accept detached instance when there is no remote!`);
    } else if (!persistentProcessId) {
      this._logService.warn("Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId");
      return;
    }
    return this._remoteTerminalChannel.acceptDetachInstanceReply(requestId, persistentProcessId);
  }
  async persistTerminalState() {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot persist terminal state when there is no remote!`);
    }
    const ids = Array.from(this._ptys.keys());
    const serialized = await this._remoteTerminalChannel.serializeTerminalState(ids);
    this._storageService.store("terminal.integrated.bufferState" /* TerminalBufferState */, serialized, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async createProcess(shellLaunchConfig, cwd2, cols, rows, unicodeVersion, env2, options3, shouldPersist) {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot create remote terminal when there is no remote!`);
    }
    const remoteEnv = await this._remoteAgentService.getEnvironment();
    if (!remoteEnv) {
      throw new Error("Could not fetch remote environment");
    }
    const terminalConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
    const configuration2 = {
      "terminal.integrated.env.windows": this._configurationService.getValue("terminal.integrated.env.windows" /* EnvWindows */),
      "terminal.integrated.env.osx": this._configurationService.getValue("terminal.integrated.env.osx" /* EnvMacOs */),
      "terminal.integrated.env.linux": this._configurationService.getValue("terminal.integrated.env.linux" /* EnvLinux */),
      "terminal.integrated.cwd": this._configurationService.getValue("terminal.integrated.cwd" /* Cwd */),
      "terminal.integrated.detectLocale": terminalConfig.detectLocale
    };
    const shellLaunchConfigDto = {
      name: shellLaunchConfig.name,
      executable: shellLaunchConfig.executable,
      args: shellLaunchConfig.args,
      cwd: shellLaunchConfig.cwd,
      env: shellLaunchConfig.env,
      useShellEnvironment: shellLaunchConfig.useShellEnvironment,
      reconnectionProperties: shellLaunchConfig.reconnectionProperties,
      type: shellLaunchConfig.type,
      isFeatureTerminal: shellLaunchConfig.isFeatureTerminal,
      forceShellIntegration: shellLaunchConfig.forceShellIntegration,
      tabActions: shellLaunchConfig.tabActions,
      shellIntegrationEnvironmentReporting: shellLaunchConfig.shellIntegrationEnvironmentReporting
    };
    const activeWorkspaceRootUri = getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService)?.uri;
    const result = await this._remoteTerminalChannel.createProcess(
      shellLaunchConfigDto,
      configuration2,
      activeWorkspaceRootUri,
      options3,
      shouldPersist,
      cols,
      rows,
      unicodeVersion
    );
    const pty = this._instantiationService.createInstance(RemotePty, result.persistentTerminalId, shouldPersist, this._remoteTerminalChannel);
    this._ptys.set(result.persistentTerminalId, pty);
    return pty;
  }
  async attachToProcess(id2) {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot create remote terminal when there is no remote!`);
    }
    try {
      await this._remoteTerminalChannel.attachToProcess(id2);
      const pty = this._instantiationService.createInstance(RemotePty, id2, true, this._remoteTerminalChannel);
      this._ptys.set(id2, pty);
      return pty;
    } catch (e4) {
      this._logService.trace(`Couldn't attach to process ${e4.message}`);
    }
    return void 0;
  }
  async attachToRevivedProcess(id2) {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot create remote terminal when there is no remote!`);
    }
    try {
      const newId = await this._remoteTerminalChannel.getRevivedPtyNewId(id2) ?? id2;
      return await this.attachToProcess(newId);
    } catch (e4) {
      this._logService.trace(`Couldn't attach to process ${e4.message}`);
    }
    return void 0;
  }
  async listProcesses() {
    return this._remoteTerminalChannel.listProcesses();
  }
  async getLatency() {
    const sw = new StopWatch();
    const results = await this._remoteTerminalChannel.getLatency();
    sw.stop();
    return [
      {
        label: "window<->ptyhostservice<->ptyhost",
        latency: sw.elapsed()
      },
      ...results
    ];
  }
  async updateProperty(id2, property, value2) {
    await this._remoteTerminalChannel.updateProperty(id2, property, value2);
  }
  async updateTitle(id2, title, titleSource) {
    await this._remoteTerminalChannel.updateTitle(id2, title, titleSource);
  }
  async updateIcon(id2, userInitiated, icon2, color2) {
    await this._remoteTerminalChannel.updateIcon(id2, userInitiated, icon2, color2);
  }
  async setNextCommandId(id2, commandLine, commandId) {
    await this._remoteTerminalChannel.setNextCommandId(id2, commandLine, commandId);
  }
  async getDefaultSystemShell(osOverride) {
    return this._remoteTerminalChannel.getDefaultSystemShell(osOverride) || "";
  }
  async getProfiles(profiles2, defaultProfile, includeDetectedProfiles) {
    return this._remoteTerminalChannel.getProfiles(profiles2, defaultProfile, includeDetectedProfiles) || [];
  }
  async getEnvironment() {
    return this._remoteTerminalChannel.getEnvironment() || {};
  }
  async getShellEnvironment() {
    const connection = this._remoteAgentService.getConnection();
    if (!connection) {
      return void 0;
    }
    const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
    const envResult = {};
    if (resolverResult.options?.extensionHostEnv) {
      for (const [key3, value2] of Object.entries(resolverResult.options.extensionHostEnv)) {
        if (value2 !== null) {
          envResult[key3] = value2;
        }
      }
    }
    return envResult;
  }
  async getWslPath(original, direction) {
    const env2 = await this._remoteAgentService.getEnvironment();
    if (env2?.os !== 1 /* Windows */) {
      return original;
    }
    return this._remoteTerminalChannel.getWslPath(original, direction) || original;
  }
  async setTerminalLayoutInfo(layout2) {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot call setActiveInstanceId when there is no remote`);
    }
    return this._remoteTerminalChannel.setTerminalLayoutInfo(layout2);
  }
  async reduceConnectionGraceTime() {
    if (!this._remoteTerminalChannel) {
      throw new Error("Cannot reduce grace time when there is no remote");
    }
    return this._remoteTerminalChannel.reduceConnectionGraceTime();
  }
  async getTerminalLayoutInfo() {
    if (!this._remoteTerminalChannel) {
      throw new Error(`Cannot call getActiveInstanceId when there is no remote`);
    }
    const workspaceId = this._getWorkspaceId();
    const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalBufferState */, 1 /* WORKSPACE */);
    const reviveBufferState = this._deserializeTerminalState(serializedState);
    if (reviveBufferState && reviveBufferState.length > 0) {
      try {
        mark("code/terminal/willReviveTerminalProcessesRemote");
        await this._remoteTerminalChannel.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
        mark("code/terminal/didReviveTerminalProcessesRemote");
        this._storageService.remove("terminal.integrated.bufferState" /* TerminalBufferState */, 1 /* WORKSPACE */);
        const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalLayoutInfo */, 1 /* WORKSPACE */);
        if (layoutInfo) {
          mark("code/terminal/willSetTerminalLayoutInfoRemote");
          await this._remoteTerminalChannel.setTerminalLayoutInfo(JSON.parse(layoutInfo));
          mark("code/terminal/didSetTerminalLayoutInfoRemote");
          this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalLayoutInfo */, 1 /* WORKSPACE */);
        }
      } catch (e4) {
        this._logService.warn("RemoteTerminalBackend#getTerminalLayoutInfo Error", e4.message ?? e4);
      }
    }
    return this._remoteTerminalChannel.getTerminalLayoutInfo();
  }
  async getPerformanceMarks() {
    return this._remoteTerminalChannel.getPerformanceMarks();
  }
  installAutoReply(match2, reply) {
    return this._remoteTerminalChannel.installAutoReply(match2, reply);
  }
  uninstallAllAutoReplies() {
    return this._remoteTerminalChannel.uninstallAllAutoReplies();
  }
};

RemoteTerminalBackend = __decorateClass([
  __decorateParam(2, IRemoteAgentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITerminalLogService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IRemoteAuthorityResolverService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IConfigurationResolverService),
  __decorateParam(10, IHistoryService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IStatusbarService)
], RemoteTerminalBackend);
export { RemoteTerminalBackendContribution, RemoteTerminalBackend };
