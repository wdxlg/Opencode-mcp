// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugger/debuggerRpc.ts
import { SimpleTypedRpcConnection } from "./module-0069.mjs";


// src/vs/base/common/observableInternal/logging/debugger/debuggerRpc.ts
function registerDebugChannel(channelId, createClient) {
  const g = globalThis;
  let queuedNotifications = [];
  let curHost = void 0;
  const { channel, handler } = createChannelFactoryFromDebugChannel({
    sendNotification: (data) => {
      if (curHost) {
        curHost.sendNotification(data);
      } else {
        queuedNotifications.push(data);
      }
    }
  });
  let curClient = void 0;
  (g.$$debugValueEditor_debugChannels ?? (g.$$debugValueEditor_debugChannels = {}))[channelId] = (host) => {
    curClient = createClient();
    curHost = host;
    for (const n2 of queuedNotifications) {
      host.sendNotification(n2);
    }
    queuedNotifications = [];
    return handler;
  };
  return SimpleTypedRpcConnection.createClient(channel, () => {
    if (!curClient) {
      throw new Error("Not supported");
    }
    return curClient;
  });
}

function createChannelFactoryFromDebugChannel(host) {
  let h3;
  const channel = (handler) => {
    h3 = handler;
    return {
      sendNotification: (data) => {
        host.sendNotification(data);
      },
      sendRequest: (data) => {
        throw new Error("not supported");
      }
    };
  };
  return {
    channel,
    handler: {
      handleRequest: (data) => {
        if (data.type === "notification") {
          return h3?.handleNotification(data.data);
        } else {
          return h3?.handleRequest(data.data);
        }
      }
    }
  };
}
export { registerDebugChannel, createChannelFactoryFromDebugChannel };
