// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remoteTunnel/node/remoteTunnelService.ts
import { CONFIGURATION_KEY_HOST_NAME, CONFIGURATION_KEY_PREVENT_SLEEP, INACTIVE_TUNNEL_MODE, LOGGER_NAME, LOG_ID, TunnelStates } from "./module-0237.mjs";
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { Delayer } from "./module-0029.mjs";
import { joinPath } from "./module-0027.mjs";
import { localize } from "./module-0007.mjs";
import { isString } from "./module-0006.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IProductService } from "./module-0045.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ILoggerService } from "./module-0044.mjs";
import { ISharedProcessLifecycleService } from "./module-0253.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ITunnelProcessCoordinator } from "./module-0241.mjs";


// src/vs/platform/remoteTunnel/node/remoteTunnelService.ts
var restartTunnelOnConfigurationChanges = [
  CONFIGURATION_KEY_HOST_NAME,
  CONFIGURATION_KEY_PREVENT_SLEEP
];

var TUNNEL_ACCESS_SESSION = "remoteTunnelSession";

var TUNNEL_ACCESS_IS_SERVICE = "remoteTunnelIsService";

var RemoteTunnelService = class extends Disposable {
  constructor(telemetryService, _productService, environmentService, loggerService, sharedProcessLifecycleService, configurationService, storageService, tunnelProcessCoordinator) {
    super();
    this.telemetryService = telemetryService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.tunnelProcessCoordinator = tunnelProcessCoordinator;
    this._onDidTokenFailedEmitter = this._register(new Emitter());
    this.onDidTokenFailed = this._onDidTokenFailedEmitter.event;
    this._onDidChangeTunnelStatusEmitter = this._register(new Emitter());
    this.onDidChangeTunnelStatus = this._onDidChangeTunnelStatusEmitter.event;
    this._onDidChangeModeEmitter = this._register(new Emitter());
    this.onDidChangeMode = this._onDidChangeModeEmitter.event;
    this._startTunnelProcessDelayer = this._register(new Delayer(100));
    this._mode = INACTIVE_TUNNEL_MODE;
    this._tunnelStatus = TunnelStates.uninitialized;
    this._initialized = false;
    this._logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${LOG_ID}.log`), { id: LOG_ID, name: LOGGER_NAME }));
    this._register(this.tunnelProcessCoordinator.onDidChangeStatus((status) => this._handleCoordinatorStatus(status)));
    this._register(this.tunnelProcessCoordinator.onDidOutput((output) => this._handleCoordinatorOutput(output)));
    this._register(this.tunnelProcessCoordinator.onDidMachineStatus((status) => this._handleMachineStatus(status)));
    this._register(sharedProcessLifecycleService.onWillShutdown(() => this.dispose()));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (restartTunnelOnConfigurationChanges.some((c) => e.affectsConfiguration(c))) {
        this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
      }
    }));
    this._mode = this._restoreMode();
  }
  getTunnelStatus() {
    return Promise.resolve(this._tunnelStatus);
  }
  getMode() {
    return Promise.resolve(this._mode);
  }
  async initialize(mode) {
    if (this._initialized) {
      return this._tunnelStatus;
    }
    this._initialized = true;
    this.setMode(mode);
    try {
      await this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
    } catch (error) {
      this._logger.error(error);
    }
    return this._tunnelStatus;
  }
  async startTunnel(mode) {
    if (isSameMode(this._mode, mode) && this._tunnelStatus.type !== "disconnected") {
      return this._tunnelStatus;
    }
    this.setMode(mode);
    try {
      await this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
    } catch (error) {
      this._logger.error(error);
    }
    return this._tunnelStatus;
  }
  async stopTunnel() {
    if (this._mode.active) {
      this.setMode(INACTIVE_TUNNEL_MODE);
    }
    try {
      await this.tunnelProcessCoordinator.setRemoteAccess(INACTIVE_TUNNEL_MODE, this._logger.getLevel());
    } catch (error) {
      this._logger.error(error);
    }
    this.setTunnelStatus(TunnelStates.disconnected());
  }
  getTunnelName() {
    return Promise.resolve(this.tunnelProcessCoordinator.getIntendedTunnelName());
  }
  setMode(mode) {
    if (isSameMode(this._mode, mode)) {
      return;
    }
    this._mode = mode;
    this._storeMode(mode);
    this._onDidChangeModeEmitter.fire(this._mode);
    if (mode.active) {
      this._logger.info(`Session updated: ${mode.session.accountLabel} (${mode.session.providerId}) (service=${mode.asService})`);
      if (mode.session.token) {
        this._logger.info(`Session token updated: ${mode.session.accountLabel} (${mode.session.providerId})`);
      }
    } else {
      this._logger.info("Session reset");
    }
  }
  async updateTunnelProcess() {
    const tunnelName = this.tunnelProcessCoordinator.getStatus().tunnelName;
    this.telemetryService.publicLog2("remoteTunnel.enablement", {
      enabled: this._mode.active,
      service: this._mode.active && this._mode.asService,
      tunnelName
    });
    if (this._mode.active || this.tunnelProcessCoordinator.getStatus().mode === "remoteAccess" || this.tunnelProcessCoordinator.getStatus().mode === "service") {
      await this.tunnelProcessCoordinator.setRemoteAccess(this._mode, this._logger.getLevel());
    } else {
      await this.tunnelProcessCoordinator.restart();
    }
  }
  _handleCoordinatorStatus(status) {
    if (status.mode !== "remoteAccess" && status.mode !== "service") {
      if (!this._mode.active && this._tunnelStatus.type !== "uninitialized") {
        this.setTunnelStatus(TunnelStates.disconnected());
      }
      return;
    }
    if (status.connectionState === "connecting") {
      this.setTunnelStatus(TunnelStates.connecting());
    } else if (status.connectionState === "disconnected") {
      if (this._tunnelStatus.type !== "disconnected") {
        this.setTunnelStatus(TunnelStates.disconnected());
      }
    }
  }
  _handleCoordinatorOutput(output) {
    if (output.mode !== "remoteAccess" && output.mode !== "service") {
      return;
    }
    let message = output.message;
    if (this._mode.active && this._mode.session.token) {
      message = message.replaceAll(this._mode.session.token, "*".repeat(4));
    }
    if (output.isError) {
      this._logger.error(message);
    } else {
      this._logger.info(message);
    }
    if (!this.environmentService.isBuilt && message.startsWith("   Compiling")) {
      this.setTunnelStatus(TunnelStates.connecting(localize(3220, null)));
    }
  }
  _handleMachineStatus(event) {
    if (event.mode !== "remoteAccess" && event.mode !== "service") {
      return;
    }
    if (event.status.type === "connected") {
      const { tunnelName, isAttached, link, domain } = event.status;
      const info = { tunnelName, isAttached, ...link === void 0 ? {} : { link, domain } };
      this.telemetryService.publicLog2("remoteTunnel.connected", {
        tunnelName: info.tunnelName,
        isAttached: info.isAttached
      });
      this.setTunnelStatus(TunnelStates.connected(info, this.tunnelProcessCoordinator.getStatus().serviceInstallFailed));
    } else if (event.status.type === "tokenError") {
      event.cancel();
      this._onDidTokenFailedEmitter.fire(this._mode.active ? this._mode.session : void 0);
      this.setTunnelStatus(TunnelStates.disconnected(this._mode.active ? this._mode.session : void 0));
    }
  }
  setTunnelStatus(tunnelStatus) {
    this._tunnelStatus = tunnelStatus;
    this._onDidChangeTunnelStatusEmitter.fire(tunnelStatus);
    this.tunnelProcessCoordinator.setRemoteAccessStatus(tunnelStatus);
  }
  _restoreMode() {
    try {
      const tunnelAccessSession = this.storageService.get(TUNNEL_ACCESS_SESSION, -1 /* APPLICATION */);
      const asService = this.storageService.getBoolean(TUNNEL_ACCESS_IS_SERVICE, -1 /* APPLICATION */, false);
      if (tunnelAccessSession) {
        const session = JSON.parse(tunnelAccessSession);
        if (session && isString(session.accountLabel) && isString(session.sessionId) && isString(session.providerId)) {
          return { active: true, session, asService };
        }
        this._logger.error("Problems restoring session from storage, invalid format", session);
      }
    } catch (error) {
      this._logger.error("Problems restoring session from storage", error);
    }
    return INACTIVE_TUNNEL_MODE;
  }
  _storeMode(mode) {
    if (mode.active) {
      const sessionWithoutToken = { providerId: mode.session.providerId, sessionId: mode.session.sessionId, accountLabel: mode.session.accountLabel };
      this.storageService.store(TUNNEL_ACCESS_SESSION, JSON.stringify(sessionWithoutToken), -1 /* APPLICATION */, 1 /* MACHINE */);
      this.storageService.store(TUNNEL_ACCESS_IS_SERVICE, mode.asService, -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(TUNNEL_ACCESS_SESSION, -1 /* APPLICATION */);
      this.storageService.remove(TUNNEL_ACCESS_IS_SERVICE, -1 /* APPLICATION */);
    }
  }
};

RemoteTunnelService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IProductService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, ILoggerService),
  __decorateParam(4, ISharedProcessLifecycleService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ITunnelProcessCoordinator)
], RemoteTunnelService);

function isSameSession(a1, a2) {
  if (a1 && a2) {
    return a1.sessionId === a2.sessionId && a1.providerId === a2.providerId && a1.token === a2.token;
  }
  return a1 === a2;
}

function isSameMode(a, b) {
  if (a.active !== b.active) {
    return false;
  } else if (a.active && b.active) {
    return a.asService === b.asService && isSameSession(a.session, b.session);
  }
  return true;
}
export { isSameSession, isSameMode, restartTunnelOnConfigurationChanges, TUNNEL_ACCESS_SESSION, TUNNEL_ACCESS_IS_SERVICE, RemoteTunnelService };
