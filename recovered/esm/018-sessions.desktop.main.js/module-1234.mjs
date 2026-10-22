// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadManagedSockets.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IRemoteSocketFactoryService } from "./module-1233.mjs";
import { ManagedSocket, connectManagedSocket } from "./module-1232.mjs";


// src/vs/workbench/api/browser/mainThreadManagedSockets.ts
var MainThreadManagedSockets = class extends Disposable {
  constructor(extHostContext, _remoteSocketFactoryService) {
    super();
    this._remoteSocketFactoryService = _remoteSocketFactoryService;
    this._registrations = this._register(new DisposableMap());
    this._remoteSockets = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostManagedSockets);
  }
  async $registerSocketFactory(socketFactoryId) {
    const that = this;
    const store = new DisposableStore();
    const socketFactory = new class {
      supports(connectTo) {
        return connectTo.id === socketFactoryId;
      }
      connect(connectTo, path, query, debugLabel) {
        return new Promise((resolve3, reject) => {
          if (connectTo.id !== socketFactoryId) {
            return reject(new Error("Invalid connectTo"));
          }
          const factoryId = connectTo.id;
          that._proxy.$openRemoteSocket(factoryId).then((socketId) => {
            const half = {
              onClose: new Emitter(),
              onData: new Emitter(),
              onEnd: new Emitter()
            };
            that._remoteSockets.set(socketId, half);
            MainThreadManagedSocket.connect(socketId, that._proxy, path, query, debugLabel, half).then(
              (socket) => {
                store.add(Event2.once(socket.onDidDispose)(() => that._remoteSockets.delete(socketId)));
                resolve3(socket);
              },
              (err) => {
                that._remoteSockets.delete(socketId);
                reject(err);
              }
            );
          }).catch(reject);
        });
      }
    }();
    store.add(this._remoteSocketFactoryService.register(1 /* Managed */, socketFactory));
    this._registrations.set(socketFactoryId, store);
  }
  async $unregisterSocketFactory(socketFactoryId) {
    this._registrations.deleteAndDispose(socketFactoryId);
  }
  $onDidManagedSocketHaveData(socketId, data) {
    this._remoteSockets.get(socketId)?.onData.fire(data);
  }
  $onDidManagedSocketClose(socketId, error) {
    this._remoteSockets.get(socketId)?.onClose.fire({
      type: 0 /* NodeSocketCloseEvent */,
      error: error ? new Error(error) : void 0,
      hadError: !!error
    });
    this._remoteSockets.delete(socketId);
  }
  $onDidManagedSocketEnd(socketId) {
    this._remoteSockets.get(socketId)?.onEnd.fire();
  }
};

MainThreadManagedSockets = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadManagedSockets),
  __decorateParam(1, IRemoteSocketFactoryService)
], MainThreadManagedSockets);

var MainThreadManagedSocket = class _MainThreadManagedSocket extends ManagedSocket {
  constructor(socketId, proxy, debugLabel, half) {
    super(debugLabel, half);
    this.socketId = socketId;
    this.proxy = proxy;
  }
  static connect(socketId, proxy, path, query, debugLabel, half) {
    const socket = new _MainThreadManagedSocket(socketId, proxy, debugLabel, half);
    return connectManagedSocket(socket, path, query, debugLabel, half);
  }
  write(buffer) {
    this.proxy.$remoteSocketWrite(this.socketId, buffer);
  }
  closeRemote() {
    this.proxy.$remoteSocketEnd(this.socketId);
  }
  drain() {
    return this.proxy.$remoteSocketDrain(this.socketId);
  }
};
export { MainThreadManagedSockets, MainThreadManagedSocket };
