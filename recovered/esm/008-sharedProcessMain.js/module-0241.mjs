// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remoteTunnel/node/tunnelProcessCoordinator.ts
import { createDecorator } from "./module-0042.mjs";
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { CodeTunnelCli } from "./module-0240.mjs";
import { LogLevelToString } from "./module-0044.mjs";
import { parseTunnelMachineStatus } from "./module-0238.mjs";
import { CONFIGURATION_KEY_HOST_NAME, CONFIGURATION_KEY_PREVENT_SLEEP, normalizeTunnelName, tunnelNameFromHostname } from "./module-0237.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { IProductService } from "./module-0045.mjs";


// src/vs/platform/remoteTunnel/node/tunnelProcessCoordinator.ts
import { hostname } from "os";

var ITunnelProcessCoordinator = createDecorator("tunnelProcessCoordinator");

function resolveTunnelProcessMode(agentHostSharing, remoteAccess) {
  if (remoteAccess.active) {
    return remoteAccess.asService ? "service" : "remoteAccess";
  }
  return agentHostSharing ? "agentHost" : "none";
}

var TunnelProcessCoordinator = class extends Disposable {
  constructor(tunnelCliFactory, configurationService, environmentService, productService) {
    super();
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this._onDidOutput = this._register(new Emitter());
    this.onDidOutput = this._onDidOutput.event;
    this._onDidMachineStatus = this._register(new Emitter());
    this.onDidMachineStatus = this._onDidMachineStatus.event;
    this._remoteAccess = { mode: { active: false }, logLevel: 3 /* Info */ };
    this._queue = Promise.resolve();
    this._generation = 0;
    /**
     * Survives across generations: a newer request can preempt the reconcile
     * that was going to uninstall the service, and that newer request has no
     * idea an uninstall was owed. Cleared only once an uninstall succeeds.
     */
    this._uninstallServicePending = false;
    this._status = { mode: "none", tunnelName: void 0, tunnelId: void 0, connectionState: "disconnected", serviceInstallFailed: false };
    this._tunnelCli = tunnelCliFactory?.(() => {
    }) ?? new CodeTunnelCli({
      appRoot: environmentService.appRoot,
      isBuilt: environmentService.isBuilt,
      tunnelApplicationName: productService.tunnelApplicationName,
      win32VersionedUpdate: !!productService.win32VersionedUpdate
    });
  }
  getStatus() {
    return this._status;
  }
  /**
   * The name a tunnel would be given right now, from configuration or the
   * hostname. Unlike {@link getStatus}'s `tunnelName` this is defined even
   * when no tunnel process is running, so callers can compare the intended
   * name against a previously used one.
   */
  getIntendedTunnelName() {
    return this._getTunnelName();
  }
  setRemoteAccess(mode, logLevel) {
    const wasService = this._remoteAccess.mode.active && this._remoteAccess.mode.asService;
    this._remoteAccess = { mode, logLevel };
    return this._schedule(wasService && (!mode.active || !mode.asService));
  }
  setAgentHostSharing(request) {
    this._agentHostSharing = request;
    return this._schedule(false);
  }
  restart() {
    return this._schedule(false, true);
  }
  setRemoteAccessStatus(status) {
    if (this._status.mode !== "remoteAccess" && this._status.mode !== "service") {
      return;
    }
    const connectionState = status.type === "connected" ? "connected" : status.type === "connecting" ? "connecting" : "disconnected";
    this._setStatus({ ...this._status, connectionState });
  }
  _schedule(uninstallService, forceRestart = false) {
    this._uninstallServicePending ||= uninstallService;
    if (!forceRestart && !this._uninstallServicePending && this._isTargetSatisfied()) {
      return Promise.resolve();
    }
    const generation = ++this._generation;
    void this._currentProcess?.stop();
    const operation = this._queue.then(() => this._reconcile(generation));
    this._queue = operation.catch(() => {
    });
    return operation;
  }
  /**
   * Whether the running process was launched from exactly the inputs the
   * current intent resolves to. Compares the full launch description, not
   * just mode and name: callers also update the session token, log level and
   * sleep prevention, and each of those has to reach a new process.
   */
  _isTargetSatisfied() {
    const target = this._getTarget();
    if (target.mode === "none") {
      return this._status.mode === "none";
    }
    if (!this._currentProcess || this._status.connectionState === "disconnected") {
      return false;
    }
    const launched = this._launched;
    const wanted = this._describeLaunch(target);
    return !!launched && launched.mode === wanted.mode && launched.tunnelName === wanted.tunnelName && launched.providerId === wanted.providerId && launched.token === wanted.token && launched.logLevel === wanted.logLevel && launched.preventSleep === wanted.preventSleep;
  }
  /** Everything that changes what a launched tunnel process actually does. */
  _describeLaunch(target) {
    return {
      mode: target.mode,
      tunnelName: this._getTunnelName(),
      providerId: target.login?.providerId,
      token: target.login?.token,
      logLevel: target.logLevel,
      preventSleep: this._preventSleep()
    };
  }
  async _reconcile(generation) {
    await this._stopCurrentProcess();
    if (generation !== this._generation) {
      return;
    }
    if (this._uninstallServicePending) {
      const exitCode = await this._runTransient("serviceUninstall", ["tunnel", "service", "uninstall"], "none", generation);
      if (exitCode === 0) {
        this._uninstallServicePending = false;
      }
      if (generation !== this._generation) {
        return;
      }
    }
    const target = this._getTarget();
    const tunnelName = target.mode === "none" ? void 0 : this._getTunnelName();
    if (target.mode === "none") {
      await this._runTransient("kill", ["tunnel", "kill"], "none", generation);
      if (generation === this._generation) {
        this._setStatus({ mode: "none", tunnelName: void 0, tunnelId: void 0, connectionState: "disconnected", serviceInstallFailed: false });
      }
      return;
    }
    this._setStatus({ mode: target.mode, tunnelName, tunnelId: void 0, connectionState: "connecting", serviceInstallFailed: false });
    const isServiceInstalled = target.mode === "service" || target.mode === "remoteAccess" ? await this._isServiceInstalled(generation) : false;
    if (generation !== this._generation) {
      return;
    }
    if (target.mode === "service" && !isServiceInstalled) {
      const serviceInstallFailed = await this._installService(target.logLevel, tunnelName, generation) === false;
      if (generation !== this._generation) {
        return;
      }
      this._setStatus({ ...this._status, serviceInstallFailed });
    }
    if (target.login) {
      const loginExitCode = await this._runTransient(
        "login",
        ["tunnel", "user", "login", "--provider", target.login.providerId, "--log", LogLevelToString(target.logLevel)],
        target.mode,
        generation,
        { VSCODE_CLI_ACCESS_TOKEN: target.login.token }
      );
      if (generation !== this._generation || loginExitCode !== 0) {
        if (generation === this._generation) {
          this._setStatus({ ...this._status, connectionState: "disconnected" });
        }
        return;
      }
    }
    const args = ["tunnel"];
    if (target.mode === "agentHost") {
      args.push("--agent-host-only", "--name", tunnelName, "--user-data-dir", this.environmentService.userDataPath);
      args.push("--delegate-to-editor", "--parent-process-id", String(process.pid));
    } else {
      args.push("--accept-server-license-terms", "--log", LogLevelToString(target.logLevel));
      args.push("--user-data-dir", this.environmentService.userDataPath, "--delegate-to-editor", "--name", tunnelName, "--parent-process-id", String(process.pid));
    }
    if (target.mode !== "agentHost" && this._preventSleep()) {
      args.push("--no-sleep");
    }
    this._launched = this._describeLaunch(target);
    this._startTunnel(args, target.mode, generation);
  }
  /**
   * The credentials the CLI needs for `tunnel user login`. Deliberately not an
   * {@link IRemoteTunnelSession}: agent host sharing has no session, only a
   * token, and fabricating one with empty ids would misrepresent that.
   */
  _getTarget() {
    if (this._remoteAccess.mode.active) {
      const session = this._remoteAccess.mode.session;
      return {
        mode: resolveTunnelProcessMode(!!this._agentHostSharing, this._remoteAccess.mode),
        login: session.token ? { providerId: session.providerId, token: session.token } : void 0,
        logLevel: this._remoteAccess.logLevel
      };
    }
    if (this._agentHostSharing) {
      return {
        mode: resolveTunnelProcessMode(true, this._remoteAccess.mode),
        login: { providerId: this._agentHostSharing.authProvider, token: this._agentHostSharing.token },
        logLevel: this._agentHostSharing.logLevel
      };
    }
    return { mode: "none", login: void 0, logLevel: 3 /* Info */ };
  }
  async _isServiceInstalled(generation) {
    let output = "";
    const exitCode = await this._runTransient("status", ["tunnel", "status"], "service", generation, void 0, (message, isError) => {
      if (!isError) {
        output += message;
      }
    });
    if (exitCode !== 0) {
      return false;
    }
    try {
      const status = JSON.parse(output.trim().split("\n").find((line) => line.startsWith("{")));
      return status.service_installed;
    } catch {
      return false;
    }
  }
  async _installService(logLevel, tunnelName, generation) {
    const args = ["tunnel", "service", "install", "--accept-server-license-terms", "--log", LogLevelToString(logLevel), "--user-data-dir", this.environmentService.userDataPath, "--name", tunnelName];
    return await this._runTransient("serviceInstall", args, "service", generation) === 0;
  }
  _startTunnel(args, mode, generation) {
    const tunnelRun = this._tunnelCli.run("tunnel", args, (message, isError) => this._fireOutput(mode, message, isError, true, () => tunnelRun.result.cancel(), generation), { VSCODE_CLI_MACHINE_STATUS: "1" });
    this._currentProcess = tunnelRun;
    const onSettled = () => {
      if (this._currentProcess === tunnelRun) {
        this._currentProcess = void 0;
        this._launched = void 0;
        if (generation === this._generation) {
          this._setStatus({ ...this._status, connectionState: "disconnected" });
        }
      }
    };
    void tunnelRun.result.then(onSettled, onSettled);
  }
  async _runTransient(logLabel, args, mode, generation, env2, onOutput) {
    const run = this._tunnelCli.run(logLabel, args, (message, isError) => {
      onOutput?.(message, isError);
      this._fireOutput(mode, message, isError, false, () => run.result.cancel());
    }, env2);
    this._currentProcess = run;
    try {
      return await run.result;
    } catch {
      return 1;
    } finally {
      if (this._currentProcess === run) {
        this._currentProcess = void 0;
      }
    }
  }
  async _stopCurrentProcess() {
    const run = this._currentProcess;
    if (!run) {
      return;
    }
    await run.stop();
    if (this._currentProcess === run) {
      this._currentProcess = void 0;
      this._launched = void 0;
    }
  }
  _fireOutput(mode, message, isError, isTunnelProcess, cancel, generation) {
    this._onDidOutput.fire({ mode, message, isError });
    if (!isError && isTunnelProcess && generation === this._generation) {
      const status = parseTunnelMachineStatus(message);
      if (status) {
        if (status.type === "connected" && this._status.mode === mode) {
          this._setStatus({ ...this._status, tunnelId: status.tunnelId, connectionState: "connected" });
        }
        this._onDidMachineStatus.fire({ mode, status, cancel });
      }
    }
  }
  _setStatus(status) {
    if (this._status.mode === status.mode && this._status.tunnelName === status.tunnelName && this._status.tunnelId === status.tunnelId && this._status.connectionState === status.connectionState && this._status.serviceInstallFailed === status.serviceInstallFailed) {
      return;
    }
    this._status = status;
    this._onDidChangeStatus.fire(status);
  }
  _getTunnelName() {
    const configured = this.configurationService.getValue(CONFIGURATION_KEY_HOST_NAME);
    return (configured ? normalizeTunnelName(configured) : tunnelNameFromHostname(hostname())) || "vscode";
  }
  _preventSleep() {
    return !!this.configurationService.getValue(CONFIGURATION_KEY_PREVENT_SLEEP);
  }
  dispose() {
    this._generation++;
    void this._currentProcess?.stop();
    super.dispose();
  }
};

TunnelProcessCoordinator = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, IProductService)
], TunnelProcessCoordinator);
export { resolveTunnelProcessMode, hostname, ITunnelProcessCoordinator, TunnelProcessCoordinator };
