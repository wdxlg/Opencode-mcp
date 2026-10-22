// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-route-token-storage.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { DurableBridgeRouteToken } from "./module-0117.mjs";
import { acquireBridgeTunnelLease, isBridgeTunnelLeaseConflict } from "./module-0118.mjs";


// extensions/opencode/src/bridge-route-token-storage.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto16 = require("node:crypto");


// extensions/opencode/src/bridge-route-token-storage.ts
var ROUTE_TOKEN_SECRET = "opencode.bridge.routeToken";

function createWindowsBridgeRouteIdentity(context) {
  return new DurableBridgeRouteToken({
    read: async () => context.secrets.get(ROUTE_TOKEN_SECRET),
    write: async (token) => context.secrets.store(ROUTE_TOKEN_SECRET, token),
    generate: () => (0, import_node_crypto16.randomBytes)(16).toString("hex"),
    withLock: async (action) => {
      const resource = `route-identity:${context.globalStorageUri.toString()}:${ROUTE_TOKEN_SECRET}`;
      for (let attempt = 0; ; attempt++) {
        let release;
        try {
          release = await acquireBridgeTunnelLease([resource]);
        } catch (error2) {
          if (!isBridgeTunnelLeaseConflict(error2) || attempt >= 49) throw error2;
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
        try {
          return await action();
        } finally {
          await release();
        }
      }
    }
  });
}
export { createWindowsBridgeRouteIdentity, import_node_crypto16, ROUTE_TOKEN_SECRET };
