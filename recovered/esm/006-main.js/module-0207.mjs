// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/meteredConnection/common/meteredConnectionIpc.ts
import { __esm } from "./module-0000.mjs";
import { init_event } from "./module-0021.mjs";
import { init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/meteredConnection/common/meteredConnectionIpc.ts
var METERED_CONNECTION_CHANNEL;

var init_meteredConnectionIpc = __esm({
  "src/vs/platform/meteredConnection/common/meteredConnectionIpc.ts"() {
    init_event();
    init_lifecycle();
    METERED_CONNECTION_CHANNEL = "meteredConnection";
  }
});
export { METERED_CONNECTION_CHANNEL, init_meteredConnectionIpc };
