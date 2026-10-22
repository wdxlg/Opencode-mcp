// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/tunnel/node/sharedProcessTunnelService.ts
import { Disposable } from "./module-0013.mjs";
import { DeferredPromise } from "./module-0029.mjs";
import { canceled } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedTunnelsService } from "./module-0194.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/tunnel/node/sharedProcessTunnelService.ts
var TunnelData = class extends Disposable {
  constructor() {
    super();
    this._address = null;
    this._addressPromise = null;
  }
  async getAddress() {
    if (this._address) {
      return this._address;
    }
    if (!this._addressPromise) {
      this._addressPromise = new DeferredPromise();
    }
    return this._addressPromise.p;
  }
  setAddress(address) {
    this._address = address;
    if (this._addressPromise) {
      this._addressPromise.complete(address);
      this._addressPromise = null;
    }
  }
  setTunnel(tunnel) {
    this._register(tunnel);
  }
};

var SharedProcessTunnelService = class extends Disposable {
  constructor(_tunnelService, _logService) {
    super();
    this._tunnelService = _tunnelService;
    this._logService = _logService;
    this._tunnels = /* @__PURE__ */ new Map();
    this._disposedTunnels = /* @__PURE__ */ new Set();
  }
  static {
    this._lastId = 0;
  }
  dispose() {
    super.dispose();
    this._tunnels.forEach((tunnel) => tunnel.dispose());
  }
  async createTunnel() {
    const id2 = String(++SharedProcessTunnelService._lastId);
    return { id: id2 };
  }
  async startTunnel(authority, id2, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
    const tunnelData = new TunnelData();
    const tunnel = await Promise.resolve(this._tunnelService.openTunnel(authority, tunnelData, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded));
    if (!tunnel || typeof tunnel === "string") {
      this._logService.info(`[SharedProcessTunnelService] Could not create a tunnel to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
      tunnelData.dispose();
      throw new Error(`Could not create tunnel`);
    }
    if (this._disposedTunnels.delete(id2)) {
      tunnelData.dispose();
      await tunnel.dispose();
      throw canceled();
    }
    tunnelData.setTunnel(tunnel);
    this._tunnels.set(id2, tunnelData);
    this._logService.info(`[SharedProcessTunnelService] Created tunnel ${id2}: ${tunnel.localAddress} (local) to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
    const result = {
      tunnelLocalPort: tunnel.tunnelLocalPort,
      localAddress: tunnel.localAddress
    };
    return result;
  }
  async setAddress(id2, address) {
    const tunnel = this._tunnels.get(id2);
    if (!tunnel) {
      return;
    }
    tunnel.setAddress(address);
  }
  async destroyTunnel(id2) {
    const tunnel = this._tunnels.get(id2);
    if (tunnel) {
      this._logService.info(`[SharedProcessTunnelService] Disposing tunnel ${id2}.`);
      this._tunnels.delete(id2);
      await tunnel.dispose();
      return;
    }
    this._disposedTunnels.add(id2);
  }
};

SharedProcessTunnelService = __decorateClass([
  __decorateParam(0, ISharedTunnelsService),
  __decorateParam(1, ILogService)
], SharedProcessTunnelService);
export { TunnelData, SharedProcessTunnelService };
