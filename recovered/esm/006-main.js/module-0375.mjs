// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/tunnel/node/tunnelService.ts
import { BROWSER_RESTRICTED_PORTS, findFreePortFaster, init_ports } from "./module-0149.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { NodeSocket, init_ipc_net2 } from "./module-0058.mjs";
import { Barrier, init_async } from "./module-0034.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { OS, init_platform } from "./module-0006.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { connectRemoteAgentTunnel, init_remoteAgentConnection } from "./module-0373.mjs";
import { IRemoteSocketFactoryService, init_remoteSocketFactoryService } from "./module-0374.mjs";
import { ISignService, init_sign } from "./module-0218.mjs";
import { AbstractTunnelService, init_tunnel, isAllInterfaces, isLocalhost, isPortPrivileged, isTunnelProvider } from "./module-0371.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";


// src/vs/platform/tunnel/node/tunnelService.ts
import * as net2 from "net";

import * as os4 from "os";

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

var NodeRemoteTunnel, BaseTunnelService, TunnelService, SharedTunnelsService;

var init_tunnelService = __esm({
  "src/vs/platform/tunnel/node/tunnelService.ts"() {
    init_ports();
    init_ipc_net2();
    init_async();
    init_lifecycle();
    init_platform();
    init_configuration();
    init_log();
    init_productService();
    init_remoteAgentConnection();
    init_remoteSocketFactoryService();
    init_sign();
    init_tunnel();
    init_buffer();
    NodeRemoteTunnel = class extends Disposable {
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
        const protocol4 = await connectRemoteAgentTunnel(this._options, tunnelRemoteHost, this.tunnelRemotePort);
        const remoteSocket = protocol4.getSocket();
        const dataChunk = protocol4.readEntireBuffer();
        protocol4.dispose();
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
    BaseTunnelService = class extends AbstractTunnelService {
      constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
        super(logService, configurationService);
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this.signService = signService;
        this.productService = productService;
      }
      isPortPrivileged(port) {
        return isPortPrivileged(port, this.defaultTunnelHost, OS, os4.release());
      }
      retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol4) {
        const existing = this.getTunnelFromMap(remoteHost, remotePort);
        if (existing) {
          ++existing.refcount;
          return existing.value;
        }
        if (isTunnelProvider(addressOrTunnelProvider)) {
          return this.createWithProvider(addressOrTunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol4);
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
    TunnelService = class extends BaseTunnelService {
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
    SharedTunnelsService = class extends Disposable {
      constructor(remoteSocketFactoryService, logService, productService, signService, configurationService) {
        super();
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this.logService = logService;
        this.productService = productService;
        this.signService = signService;
        this.configurationService = configurationService;
        this._tunnelServices = /* @__PURE__ */ new Map();
      }
      async openTunnel(authority, addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol4) {
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
        return this._tunnelServices.get(authority).openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol4);
      }
    };
    SharedTunnelsService = __decorateClass([
      __decorateParam(0, IRemoteSocketFactoryService),
      __decorateParam(1, ILogService),
      __decorateParam(2, IProductService),
      __decorateParam(3, ISignService),
      __decorateParam(4, IConfigurationService)
    ], SharedTunnelsService);
  }
});
export { createRemoteTunnel, net2, os4, NodeRemoteTunnel, BaseTunnelService, TunnelService, SharedTunnelsService, init_tunnelService };
