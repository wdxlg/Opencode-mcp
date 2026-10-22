// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugger/debuggerRpc.ts
import { SimpleTypedRpcConnection } from "./module-0117.mjs";


// src/vs/base/common/observableInternal/logging/debugger/debuggerRpc.ts
function registerDebugChannel(channelId, createClient) {
  const g = globalThis;
  let queuedNotifications = [];
  let curHost = void 0;
  const { channel, handler } = createChannelFactoryFromDebugChannel({
    sendNotification: (data2) => {
      if (curHost) {
        curHost.sendNotification(data2);
      } else {
        queuedNotifications.push(data2);
      }
    }
  });
  let curClient = void 0;
  (g.$$debugValueEditor_debugChannels ?? (g.$$debugValueEditor_debugChannels = {}))[channelId] = (host) => {
    curClient = createClient();
    curHost = host;
    for (const n of queuedNotifications) {
      host.sendNotification(n);
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
  let h;
  const channel = (handler) => {
    h = handler;
    return {
      sendNotification: (data2) => {
        host.sendNotification(data2);
      },
      sendRequest: (data2) => {
        throw new Error("not supported");
      }
    };
  };
  return {
    channel,
    handler: {
      handleRequest: (data2) => {
        if (data2.type === "notification") {
          return h?.handleNotification(data2.data);
        } else {
          return h?.handleRequest(data2.data);
        }
      }
    }
  };
}
export { registerDebugChannel, createChannelFactoryFromDebugChannel };
