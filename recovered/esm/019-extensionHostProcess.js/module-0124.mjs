// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugger/rpc.ts



// src/vs/base/common/observableInternal/logging/debugger/rpc.ts
var SimpleTypedRpcConnection = class _SimpleTypedRpcConnection {
  constructor(_channelFactory, _getHandler) {
    this._channelFactory = _channelFactory;
    this._getHandler = _getHandler;
    this._channel = this._channelFactory({
      handleNotification: (notificationData) => {
        const m = notificationData;
        const fn = this._getHandler().notifications[m[0]];
        if (!fn) {
          throw new Error(`Unknown notification "${m[0]}"!`);
        }
        fn(...m[1]);
      },
      handleRequest: (requestData) => {
        const m = requestData;
        try {
          const result = this._getHandler().requests[m[0]](...m[1]);
          return { type: "result", value: result };
        } catch (e) {
          return { type: "error", value: e };
        }
      }
    });
    const requests = new Proxy({}, {
      get: (target, key) => {
        if (key === "then") {
          return void 0;
        }
        return async (...args2) => {
          const result = await this._channel.sendRequest([key, args2]);
          if (result.type === "error") {
            throw result.value;
          } else {
            return result.value;
          }
        };
      }
    });
    const notifications = new Proxy({}, {
      get: (target, key) => {
        if (key === "then") {
          return void 0;
        }
        return (...args2) => {
          this._channel.sendNotification([key, args2]);
        };
      }
    });
    this.api = { notifications, requests };
  }
  static createHost(channelFactory, getHandler) {
    return new _SimpleTypedRpcConnection(channelFactory, getHandler);
  }
  static createClient(channelFactory, getHandler) {
    return new _SimpleTypedRpcConnection(channelFactory, getHandler);
  }
};
export { SimpleTypedRpcConnection };
