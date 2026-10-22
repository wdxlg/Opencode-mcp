// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
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
        } catch (e4) {
          return { type: "error", value: e4 };
        }
      }
    });
    const requests = new Proxy({}, {
      get: (target, key3) => {
        if (key3 === "then") {
          return void 0;
        }
        return async (...args2) => {
          const result = await this._channel.sendRequest([key3, args2]);
          if (result.type === "error") {
            throw result.value;
          } else {
            return result.value;
          }
        };
      }
    });
    const notifications = new Proxy({}, {
      get: (target, key3) => {
        if (key3 === "then") {
          return void 0;
        }
        return (...args2) => {
          this._channel.sendNotification([key3, args2]);
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
