// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/tunnel/node/tunnelService.ts
import { BROWSER_RESTRICTED_PORTS, findFreePortFaster } from "./module-0196.mjs";
import { Disposable } from "./module-0013.mjs";
import { Barrier } from "./module-0029.mjs";
import { AbstractTunnelService, isAllInterfaces, isLocalhost, isPortPrivileged, isTunnelProvider } from "./module-0194.mjs";
import { connectRemoteAgentTunnel } from "./module-0200.mjs";
import { NodeSocket } from "./module-0197.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { OS } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteSocketFactoryService } from "./module-0201.mjs";
import { ILogService } from "./module-0044.mjs";
import { ISignService } from "./module-0191.mjs";
import { IProductService } from "./module-0045.mjs";
import { IConfigurationService } from "./module-0049.mjs";


// src/vs/platform/tunnel/node/tunnelService.ts
import * as net2 from "net";

import * as os from "os";


// src/vs/platform/tunnel/node/tunnelService.ts
async function createRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort) {
  let readyTunnel;
  for (let attempts = 3; attempts; attempts--) {
    readyTunnel?.dispose();
    const tunnel = new NodeRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort);
    readyTunnel = await tunnel.waitForReady();
    if (tunnelLocalPort && BROWSER_RESTRICTED_PORTS[tunnelLocalPort] || !BROWSER_RESTRICTED_PORTS[readyTunnel.tunnelLocalPort]) {
      break;
    }
  }
  return readyTunnel;
}

var NodeRemoteTunnel = class extends Disposable {
  constructor(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, suggestedLocalPort) {
    super();
    this.defaultTunnelHost = defaultTunnelHost;
    this.suggestedLocalPort = suggestedLocalPort;
    this.privacy = "private" /* Private */;
    this._socketsDispose = /* @__PURE__ */ new Map();
    this._options = options;
    this._server = net2.createServer();
    this._barrier = new Barrier();
    this._listeningListener = () => this._barrier.open();
    this._server.on("listening", this._listeningListener);
    this._connectionListener = (socket) => this._onConnection(socket);
    this._server.on("connection", this._connectionListener);
    this._errorListener = () => {
    };
    this._server.on("error", this._errorListener);
    this.tunnelRemotePort = tunnelRemotePort;
    this.tunnelRemoteHost = tunnelRemoteHost;
  }
  async dispose() {
    super.dispose();
    this._server.removeListener("listening", this._listeningListener);
    this._server.removeListener("connection", this._connectionListener);
    this._server.removeListener("error", this._errorListener);
    this._server.close();
    const disposers = Array.from(this._socketsDispose.values());
    disposers.forEach((disposer) => {
      disposer();
    });
  }
  async waitForReady() {
    const startPort = this.suggestedLocalPort ?? this.tunnelRemotePort;
    const hostname3 = isAllInterfaces(this.defaultTunnelHost) ? "0.0.0.0" : "127.0.0.1";
    let localPort = await findFreePortFaster(startPort, 2, 1e3, hostname3);
    let address = null;
    this._server.listen(localPort, this.defaultTunnelHost);
    await this._barrier.wait();
    address = this._server.address();
    if (!address) {
      localPort = 0;
      this._server.listen(localPort, this.defaultTunnelHost);
      await this._barrier.wait();
      address = this._server.address();
    }
    this.tunnelLocalPort = address.port;
    this.localAddress = `${this.tunnelRemoteHost === "127.0.0.1" ? "127.0.0.1" : "localhost"}:${address.port}`;
    return this;
  }
  async _onConnection(localSocket) {
    localSocket.pause();
    const tunnelRemoteHost = isLocalhost(this.tunnelRemoteHost) || isAllInterfaces(this.tunnelRemoteHost) ? "localhost" : this.tunnelRemoteHost;
    const protocol = await connectRemoteAgentTunnel(this._options, tunnelRemoteHost, this.tunnelRemotePort);
    const remoteSocket = protocol.getSocket();
    const dataChunk = protocol.readEntireBuffer();
    protocol.dispose();
    if (dataChunk.byteLength > 0) {
      localSocket.write(dataChunk.buffer);
    }
    localSocket.on("end", () => {
      if (localSocket.localAddress) {
        this._socketsDispose.delete(localSocket.localAddress);
      }
      remoteSocket.end();
    });
    localSocket.on("close", () => remoteSocket.end());
    localSocket.on("error", () => {
      if (localSocket.localAddress) {
        this._socketsDispose.delete(localSocket.localAddress);
      }
      if (remoteSocket instanceof NodeSocket) {
        remoteSocket.socket.destroy();
      } else {
        remoteSocket.end();
      }
    });
    if (remoteSocket instanceof NodeSocket) {
      this._mirrorNodeSocket(localSocket, remoteSocket);
    } else {
      this._mirrorGenericSocket(localSocket, remoteSocket);
    }
    if (localSocket.localAddress) {
      this._socketsDispose.set(localSocket.localAddress, () => {
        localSocket.end();
        remoteSocket.end();
      });
    }
  }
  _mirrorGenericSocket(localSocket, remoteSocket) {
    remoteSocket.onClose(() => localSocket.destroy());
    remoteSocket.onEnd(() => localSocket.end());
    remoteSocket.onData((d) => localSocket.write(d.buffer));
    localSocket.on("data", (d) => remoteSocket.write(VSBuffer.wrap(d)));
    localSocket.resume();
  }
  _mirrorNodeSocket(localSocket, remoteNodeSocket) {
    const remoteSocket = remoteNodeSocket.socket;
    remoteSocket.on("end", () => localSocket.end());
    remoteSocket.on("close", () => localSocket.end());
    remoteSocket.on("error", () => {
      localSocket.destroy();
    });
    remoteSocket.pipe(localSocket);
    localSocket.pipe(remoteSocket);
  }
};

var BaseTunnelService = class extends AbstractTunnelService {
  constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
    super(logService, configurationService);
    this.remoteSocketFactoryService = remoteSocketFactoryService;
    this.signService = signService;
    this.productService = productService;
  }
  isPortPrivileged(port) {
    return isPortPrivileged(port, this.defaultTunnelHost, OS, os.release());
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
      const options = {
        commit: this.productService.commit,
        quality: this.productService.quality,
        addressProvider: addressOrTunnelProvider,
        remoteSocketFactoryService: this.remoteSocketFactoryService,
        signService: this.signService,
        logService: this.logService,
        ipcLogger: null
      };
      const tunnel = createRemoteTunnel(options, localHost, remoteHost, remotePort, localPort);
      this.logService.trace("ForwardedPorts: (TunnelService) Tunnel created without provider.");
      this.addTunnelToMap(remoteHost, remotePort, tunnel);
      return tunnel;
    }
  }
};

BaseTunnelService = __decorateClass([
  __decorateParam(0, IRemoteSocketFactoryService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ISignService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IConfigurationService)
], BaseTunnelService);

var TunnelService = class extends BaseTunnelService {
  constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
    super(remoteSocketFactoryService, logService, signService, productService, configurationService);
  }
};

TunnelService = __decorateClass([
  __decorateParam(0, IRemoteSocketFactoryService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ISignService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IConfigurationService)
], TunnelService);

var SharedTunnelsService = class extends Disposable {
  constructor(remoteSocketFactoryService, logService, productService, signService, configurationService) {
    super();
    this.remoteSocketFactoryService = remoteSocketFactoryService;
    this.logService = logService;
    this.productService = productService;
    this.signService = signService;
    this.configurationService = configurationService;
    this._tunnelServices = /* @__PURE__ */ new Map();
  }
  async openTunnel(authority, addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
    this.logService.trace(`ForwardedPorts: (SharedTunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
    if (!this._tunnelServices.has(authority)) {
      const tunnelService = new TunnelService(this.remoteSocketFactoryService, this.logService, this.signService, this.productService, this.configurationService);
      this._register(tunnelService);
      this._tunnelServices.set(authority, tunnelService);
      tunnelService.onTunnelClosed(async () => {
        if ((await tunnelService.tunnels).length === 0) {
          tunnelService.dispose();
          this._tunnelServices.delete(authority);
        }
      });
    }
    return this._tunnelServices.get(authority).openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
  }
};

SharedTunnelsService = __decorateClass([
  __decorateParam(0, IRemoteSocketFactoryService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IProductService),
  __decorateParam(3, ISignService),
  __decorateParam(4, IConfigurationService)
], SharedTunnelsService);
export { createRemoteTunnel, net2, os, NodeRemoteTunnel, BaseTunnelService, TunnelService, SharedTunnelsService };
