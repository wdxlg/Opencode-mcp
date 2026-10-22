// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/tunnelHostMainService.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { joinPath } from "./module-0027.mjs";
import { TUNNEL_HOST_LOG_ID } from "./module-0234.mjs";
import { localize } from "./module-0007.mjs";
import { DeferredPromise, raceTimeout } from "./module-0029.mjs";
import { CancellationError } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILoggerService } from "./module-0044.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ITunnelProcessCoordinator } from "./module-0241.mjs";


// src/vs/platform/agentHost/node/tunnelHostMainService.ts
var AGENT_HOST_START_TIMEOUT_MS = 5 * 60 * 1e3;

var TunnelHostMainService = class extends Disposable {
  constructor(loggerService, environmentService, tunnelProcessCoordinator) {
    super();
    this.tunnelProcessCoordinator = tunnelProcessCoordinator;
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this._lastStatus = { active: false };
    this._logger = this._register(loggerService.createLogger(
      joinPath(environmentService.logsHome, `${TUNNEL_HOST_LOG_ID}.log`),
      { id: TUNNEL_HOST_LOG_ID, name: localize(2728, null) }
    ));
    this._register(tunnelProcessCoordinator.onDidChangeStatus((status) => this._emitStatus(status)));
    this._register(tunnelProcessCoordinator.onDidOutput((output) => this._handleOutput(output)));
  }
  async startHosting(token, authProvider) {
    const request = { token };
    this._request = request;
    const store = new DisposableStore();
    try {
      const [status] = await Promise.all([
        this._waitForActiveStatus(store),
        this.tunnelProcessCoordinator.setAgentHostSharing({ token, authProvider, logLevel: this._logger.getLevel() })
      ]);
      return status.info;
    } catch (error) {
      if (this._request === request) {
        this._request = void 0;
        try {
          await this.tunnelProcessCoordinator.setAgentHostSharing(void 0);
        } catch (rollbackError) {
          this._logger.error(rollbackError);
        }
      }
      throw error;
    } finally {
      store.dispose();
    }
  }
  async stopHosting() {
    this._request = void 0;
    await this.tunnelProcessCoordinator.setAgentHostSharing(void 0);
    this._emitStatus(this.tunnelProcessCoordinator.getStatus());
  }
  getStatus() {
    return Promise.resolve(this._getStatus(this.tunnelProcessCoordinator.getStatus()));
  }
  _handleOutput(output) {
    if (output.mode !== "agentHost") {
      return;
    }
    if (output.isError) {
      this._logger.error(output.message);
    } else {
      this._logger.info(output.message);
    }
  }
  async _waitForActiveStatus(store) {
    const current = this._getStatus(this.tunnelProcessCoordinator.getStatus());
    if (current.active) {
      return current;
    }
    const settled = new DeferredPromise();
    store.add(this.tunnelProcessCoordinator.onDidChangeStatus((coordinatorStatus) => {
      const status2 = this._getStatus(coordinatorStatus);
      if (status2.active) {
        settled.complete(status2);
      } else if (coordinatorStatus.mode === "agentHost" && coordinatorStatus.connectionState === "disconnected") {
        settled.error(new Error(localize(2729, null)));
      }
    }));
    store.add(toDisposable(() => settled.error(new CancellationError())));
    const status = await raceTimeout(settled.p, AGENT_HOST_START_TIMEOUT_MS);
    if (!status) {
      throw new Error(localize(2730, null));
    }
    return status;
  }
  _getStatus(status) {
    if (!this._request || status.connectionState !== "connected" || !status.tunnelName) {
      return { active: false };
    }
    const info = {
      tunnelName: status.tunnelName,
      ...status.tunnelId === void 0 ? {} : { tunnelId: status.tunnelId }
    };
    if (status.mode === "remoteAccess" || status.mode === "service") {
      return { active: true, info: { ...info, viaRemoteTunnelAccess: true } };
    }
    if (status.mode === "agentHost") {
      return { active: true, info };
    }
    return { active: false };
  }
  _emitStatus(coordinatorStatus) {
    const status = this._getStatus(coordinatorStatus);
    if (!status.active && !this._lastStatus.active) {
      return;
    }
    if (status.active && this._lastStatus.active && status.info.tunnelName === this._lastStatus.info.tunnelName && status.info.tunnelId === this._lastStatus.info.tunnelId && status.info.viaRemoteTunnelAccess === this._lastStatus.info.viaRemoteTunnelAccess) {
      return;
    }
    this._lastStatus = status;
    this._onDidChangeStatus.fire(status);
  }
  dispose() {
    this._request = void 0;
    void this.tunnelProcessCoordinator.setAgentHostSharing(void 0);
    super.dispose();
  }
};

TunnelHostMainService = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, INativeEnvironmentService),
  __decorateParam(2, ITunnelProcessCoordinator)
], TunnelHostMainService);
export { AGENT_HOST_START_TIMEOUT_MS, TunnelHostMainService };
