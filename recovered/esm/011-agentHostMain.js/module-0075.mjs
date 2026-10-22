// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugger/debuggerRpc.ts
import { SimpleTypedRpcConnection } from "./module-0074.mjs";


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
          return h?.handleNotification(data.data);
        } else {
          return h?.handleRequest(data.data);
        }
      }
    }
  };
}
export { registerDebugChannel, createChannelFactoryFromDebugChannel };
