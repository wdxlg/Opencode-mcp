// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/tunnel/electron-browser/tunnelService.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedProcessTunnelService } from "./module-3882.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { AbstractTunnelService, ITunnelService, isPortPrivileged, isTunnelProvider } from "./module-1409.mjs";
import { OS } from "./module-0014.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/tunnel/electron-browser/tunnelService.ts
var SharedProcessTunnel = class extends Disposable {
  constructor(_id, _addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort, localAddress, _onBeforeDispose, _sharedProcessTunnelService, _remoteAuthorityResolverService) {
    super();
    this._id = _id;
    this._addressProvider = _addressProvider;
    this.tunnelRemoteHost = tunnelRemoteHost;
    this.tunnelRemotePort = tunnelRemotePort;
    this.tunnelLocalPort = tunnelLocalPort;
    this.localAddress = localAddress;
    this._onBeforeDispose = _onBeforeDispose;
    this._sharedProcessTunnelService = _sharedProcessTunnelService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this.privacy = "private" /* Private */;
    this.protocol = void 0;
    this._updateAddress();
    this._register(this._remoteAuthorityResolverService.onDidChangeConnectionData(() => this._updateAddress()));
  }
  _updateAddress() {
    this._addressProvider.getAddress().then((address) => {
      this._sharedProcessTunnelService.setAddress(this._id, address);
    });
  }
  async dispose() {
    this._onBeforeDispose();
    super.dispose();
    await this._sharedProcessTunnelService.destroyTunnel(this._id);
  }
};

SharedProcessTunnel = __decorateClass([
  __decorateParam(7, ISharedProcessTunnelService),
  __decorateParam(8, IRemoteAuthorityResolverService)
], SharedProcessTunnel);

var TunnelService = class extends AbstractTunnelService {
  constructor(logService, _environmentService, _sharedProcessTunnelService, _instantiationService, lifecycleService, _nativeWorkbenchEnvironmentService, configurationService) {
    super(logService, configurationService);
    this._environmentService = _environmentService;
    this._sharedProcessTunnelService = _sharedProcessTunnelService;
    this._instantiationService = _instantiationService;
    this._nativeWorkbenchEnvironmentService = _nativeWorkbenchEnvironmentService;
    this._activeSharedProcessTunnels = /* @__PURE__ */ new Set();
    this._register(lifecycleService.onDidShutdown(() => {
      this._activeSharedProcessTunnels.forEach((id2) => {
        this._sharedProcessTunnelService.destroyTunnel(id2);
      });
    }));
  }
  isPortPrivileged(port) {
    return isPortPrivileged(port, this.defaultTunnelHost, OS, this._nativeWorkbenchEnvironmentService.os.release);
  }
  retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
    const existing = this.getTunnelFromMap(remoteHost, remotePort);
    if (existing) {
      ++existing.refcount;
      return existing.value;
    }
    if (isTunnelProvider(addressOrTunnelProvider)) {
      return this.createWithProvider(addressOrTunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
    } else {
      this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
      const tunnel = this._createSharedProcessTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded);
      this.logService.trace("ForwardedPorts: (TunnelService) Tunnel created without provider.");
      this.addTunnelToMap(remoteHost, remotePort, tunnel);
      return tunnel;
    }
  }
  async _createSharedProcessTunnel(addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
    const { id: id2 } = await this._sharedProcessTunnelService.createTunnel();
    this._activeSharedProcessTunnels.add(id2);
    const authority = this._environmentService.remoteAuthority;
    const result = await this._sharedProcessTunnelService.startTunnel(authority, id2, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded);
    const tunnel = this._instantiationService.createInstance(SharedProcessTunnel, id2, addressProvider, tunnelRemoteHost, tunnelRemotePort, result.tunnelLocalPort, result.localAddress, () => {
      this._activeSharedProcessTunnels.delete(id2);
    });
    return tunnel;
  }
  canTunnel(uri5) {
    return super.canTunnel(uri5) && !!this._environmentService.remoteAuthority;
  }
};

TunnelService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, ISharedProcessTunnelService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IConfigurationService)
], TunnelService);

registerSingleton(ITunnelService, TunnelService, 1 /* Delayed */);
export { SharedProcessTunnel, TunnelService };
