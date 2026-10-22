// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/remote/common/electronRemoteResources.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/remote/common/electronRemoteResources.ts
var NODE_REMOTE_RESOURCE_IPC_METHOD_NAME, NODE_REMOTE_RESOURCE_CHANNEL_NAME, NodeRemoteResourceRouter;

var init_electronRemoteResources = __esm({
  "src/vs/platform/remote/common/electronRemoteResources.ts"() {
    NODE_REMOTE_RESOURCE_IPC_METHOD_NAME = "request";
    NODE_REMOTE_RESOURCE_CHANNEL_NAME = "remoteResourceHandler";
    NodeRemoteResourceRouter = class {
      async routeCall(hub, command, arg) {
        if (command !== NODE_REMOTE_RESOURCE_IPC_METHOD_NAME) {
          throw new Error(`Call not found: ${command}`);
        }
        const uri = Array.isArray(arg) ? arg[0] : void 0;
        if (uri?.authority) {
          const connection = hub.connections.find((c) => c.ctx === uri.authority);
          if (connection) {
            return connection;
          }
        }
        throw new Error(`Caller not found`);
      }
      routeEvent(_, event) {
        throw new Error(`Event not found: ${event}`);
      }
    };
  }
});
export { NODE_REMOTE_RESOURCE_IPC_METHOD_NAME, NODE_REMOTE_RESOURCE_CHANNEL_NAME, NodeRemoteResourceRouter, init_electronRemoteResources };
