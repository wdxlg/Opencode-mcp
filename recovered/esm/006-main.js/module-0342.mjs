// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/mcp/node/nativeMcpDiscoveryHelperService.ts
import { __esm } from "./module-0000.mjs";
import { init_platform, platform } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";


// src/vs/platform/mcp/node/nativeMcpDiscoveryHelperService.ts
import { homedir as homedir4 } from "os";

var NativeMcpDiscoveryHelperService;

var init_nativeMcpDiscoveryHelperService = __esm({
  "src/vs/platform/mcp/node/nativeMcpDiscoveryHelperService.ts"() {
    init_platform();
    init_uri();
    NativeMcpDiscoveryHelperService = class {
      constructor() {
      }
      load() {
        return Promise.resolve({
          platform,
          homedir: URI.file(homedir4()),
          winAppData: this.uriFromEnvVariable("APPDATA"),
          xdgHome: this.uriFromEnvVariable("XDG_CONFIG_HOME")
        });
      }
      uriFromEnvVariable(varName) {
        const envVar = process.env[varName];
        if (!envVar) {
          return void 0;
        }
        return URI.file(envVar);
      }
    };
  }
});
export { homedir4, NativeMcpDiscoveryHelperService, init_nativeMcpDiscoveryHelperService };
