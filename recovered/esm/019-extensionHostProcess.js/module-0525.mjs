// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostBrowserTunnelProxy.ts
import { Disposable } from "./module-0011.mjs";
import { MainContext } from "./module-0054.mjs";
import { TunnelProxy } from "./module-0523.mjs";
import { connectRemoteAgentTunnel } from "./module-0506.mjs";
import { ExtHostManagedSocket } from "./module-0501.mjs";
import { nodeSocketFactory } from "./module-0522.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";
import { ISignService } from "./module-0503.mjs";
import { ILogService } from "./module-0062.mjs";
import { IExtHostManagedSockets } from "./module-0287.mjs";
import { IExtHostExtensionService } from "./module-0288.mjs";
import { DeferredPromise } from "./module-0029.mjs";


// src/vs/workbench/api/node/extHostBrowserTunnelProxy.ts
var NodeExtHostBrowserTunnelProxy = class extends Disposable {
  constructor(extHostRpc, _initData, _signService, _logService, _managedSockets, extHostExtensionService) {
    super();
    this._initData = _initData;
    this._signService = _signService;
    this._logService = _logService;
    this._managedSockets = _managedSockets;
    this._addressProvider = new MutableAddressProvider();
    this._enabled = false;
    this._connection = null;
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadBrowserTunnelProxy);
    this._setConnection(extHostExtensionService.getRemoteConnectionData());
    this._register(extHostExtensionService.onDidChangeRemoteConnectionData(() => this._setConnection(extHostExtensionService.getRemoteConnectionData())));
  }
  dispose() {
    this._stop();
    super.dispose();
  }
  $setEnabled(enabled) {
    if (this._initData.remote.isRemote) {
      return;
    }
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    this._update();
  }
  _setConnection(connection) {
    if (!connection) {
      return;
    }
    const changed = !!this._connection && !sameConnection(this._connection, connection);
    this._connection = connection;
    this._addressProvider.setAddress({ connectTo: connection.connectTo, connectionToken: connection.connectionToken });
    if (changed) {
      this._tunnelProxy?.drainConnectionPool();
    }
  }
  _update() {
    if (this._enabled && !this._tunnelProxy && !this._startPromise) {
      this._start();
    } else if (!this._enabled) {
      this._stop();
    }
  }
  _start() {
    const options2 = this._createConnectionOptions();
    const tunnelProxy = new TunnelProxy(
      (host, port) => connectRemoteAgentTunnel(options2, host, port),
      this._logService
    );
    const startPromise = tunnelProxy.start().then((info) => {
      if (this._startPromise !== startPromise) {
        tunnelProxy.dispose();
        return;
      }
      this._tunnelProxy = tunnelProxy;
      this._startPromise = void 0;
      this._proxy.$updateProxyInfo(info);
    }, (err) => {
      this._logService.error("[ExtHostBrowserTunnelProxy] Failed to start tunnel proxy:", err);
      if (this._startPromise === startPromise) {
        this._startPromise = void 0;
      }
      tunnelProxy.dispose();
    });
    this._startPromise = startPromise;
  }
  _stop() {
    const wasActive = !!this._tunnelProxy || !!this._startPromise;
    this._tunnelProxy?.dispose();
    this._tunnelProxy = void 0;
    this._startPromise = void 0;
    if (wasActive) {
      this._proxy.$updateProxyInfo(void 0);
    }
  }
  _createConnectionOptions() {
    const managedSockets = this._managedSockets;
    const remoteSocketFactoryService = {
      _serviceBrand: void 0,
      async connect(connectTo, path, query, debugLabel) {
        if (connectTo.type === 1 /* Managed */) {
          const result = await managedSockets.makeConnection();
          return ExtHostManagedSocket.connect(result, path, query, debugLabel);
        }
        return nodeSocketFactory.connect(connectTo, path, query, debugLabel);
      },
      register() {
        throw new Error("BrowserTunnelProxy socket factory does not support register()");
      }
    };
    return {
      commit: this._initData.commit,
      quality: this._initData.quality,
      addressProvider: this._addressProvider,
      remoteSocketFactoryService,
      signService: this._signService,
      logService: this._logService,
      ipcLogger: null
    };
  }
};

NodeExtHostBrowserTunnelProxy = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, ISignService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IExtHostManagedSockets),
  __decorateParam(5, IExtHostExtensionService)
], NodeExtHostBrowserTunnelProxy);

var MutableAddressProvider = class {
  constructor() {
    this._address = null;
    this._pending = null;
  }
  getAddress() {
    if (this._address) {
      return Promise.resolve(this._address);
    }
    this._pending ??= new DeferredPromise();
    return this._pending.p;
  }
  setAddress(address) {
    this._address = address;
    this._pending?.complete(address);
    this._pending = null;
  }
};

function sameConnection(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b || a.connectionToken !== b.connectionToken) {
    return false;
  }
  const x = a.connectTo;
  const y = b.connectTo;
  if (x.type === 1 /* Managed */ && y.type === 1 /* Managed */) {
    return x.id === y.id;
  }
  if (x.type === 0 /* WebSocket */ && y.type === 0 /* WebSocket */) {
    return x.host === y.host && x.port === y.port;
  }
  return false;
}
export { sameConnection, NodeExtHostBrowserTunnelProxy, MutableAddressProvider };
