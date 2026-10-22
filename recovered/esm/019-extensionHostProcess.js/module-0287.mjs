// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostManagedSockets.ts
import { createDecorator2 } from "./module-0048.mjs";
import { MainContext } from "./module-0054.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0011.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";


// src/vs/workbench/api/common/extHostManagedSockets.ts
var IExtHostManagedSockets = createDecorator2("IExtHostManagedSockets");

var ExtHostManagedSockets = class {
  constructor(extHostRpc) {
    this._remoteSocketIdCounter = 0;
    this._factory = null;
    this._managedRemoteSockets = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadManagedSockets);
  }
  setFactory(socketFactoryId, makeConnection) {
    for (const socket of this._managedRemoteSockets.values()) {
      socket.dispose();
    }
    if (this._factory) {
      this._proxy.$unregisterSocketFactory(this._factory.socketFactoryId);
    }
    this._factory = new ManagedSocketFactory(socketFactoryId, makeConnection);
    this._proxy.$registerSocketFactory(this._factory.socketFactoryId);
  }
  makeConnection() {
    if (!this._factory) {
      throw new Error("No managed socket factory registered");
    }
    return Promise.resolve(this._factory.makeConnection());
  }
  async $openRemoteSocket(socketFactoryId) {
    if (!this._factory || this._factory.socketFactoryId !== socketFactoryId) {
      throw new Error(`No socket factory with id ${socketFactoryId}`);
    }
    const id2 = ++this._remoteSocketIdCounter;
    const socket = await this._factory.makeConnection();
    const disposable = new DisposableStore();
    this._managedRemoteSockets.set(id2, new ManagedSocket(id2, socket, disposable));
    disposable.add(toDisposable(() => this._managedRemoteSockets.delete(id2)));
    disposable.add(socket.onDidEnd(() => {
      this._proxy.$onDidManagedSocketEnd(id2);
      disposable.dispose();
    }));
    disposable.add(socket.onDidClose((e) => {
      this._proxy.$onDidManagedSocketClose(id2, e?.stack ?? e?.message);
      disposable.dispose();
    }));
    disposable.add(socket.onDidReceiveMessage((e) => this._proxy.$onDidManagedSocketHaveData(id2, VSBuffer.wrap(e))));
    return id2;
  }
  $remoteSocketWrite(socketId, buffer) {
    this._managedRemoteSockets.get(socketId)?.actual.send(buffer.buffer);
  }
  $remoteSocketEnd(socketId) {
    const socket = this._managedRemoteSockets.get(socketId);
    if (socket) {
      socket.actual.end();
      socket.dispose();
    }
  }
  async $remoteSocketDrain(socketId) {
    await this._managedRemoteSockets.get(socketId)?.actual.drain?.();
  }
};

ExtHostManagedSockets = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostManagedSockets);

var ManagedSocketFactory = class {
  constructor(socketFactoryId, makeConnection) {
    this.socketFactoryId = socketFactoryId;
    this.makeConnection = makeConnection;
  }
};

var ManagedSocket = class extends Disposable {
  constructor(socketId, actual, disposer) {
    super();
    this.socketId = socketId;
    this.actual = actual;
    this._register(disposer);
  }
};
export { IExtHostManagedSockets, ExtHostManagedSockets, ManagedSocketFactory, ManagedSocket };
