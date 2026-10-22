// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/remote/common/remoteHosts.ts
import { Schemas, init_network } from "./module-0031.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/remote/common/remoteHosts.ts
function getRemoteAuthority(uri) {
  return uri.scheme === Schemas.vscodeRemote ? uri.authority : void 0;
}

var init_remoteHosts = __esm({
  "src/vs/platform/remote/common/remoteHosts.ts"() {
    init_network();
  }
});
export { getRemoteAuthority, init_remoteHosts };
