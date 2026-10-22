// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/environment/node/environmentService.ts
import { AbstractNativeEnvironmentService, init_environmentService, parseDebugParams } from "./module-0092.mjs";
import { __esm } from "./module-0000.mjs";
import { getUserDataPath, init_userDataPath } from "./module-0004.mjs";


// src/vs/platform/environment/node/environmentService.ts
import { homedir as homedir2, tmpdir as tmpdir2 } from "os";

function parsePtyHostDebugPort(args2, isBuilt) {
  return parseDebugParams(args2["inspect-ptyhost"], args2["inspect-brk-ptyhost"], 5877, isBuilt, args2.extensionEnvironment);
}

function parseAgentHostDebugPort(args2, isBuilt) {
  return parseDebugParams(args2["inspect-agenthost"], args2["inspect-brk-agenthost"], 5878, isBuilt, args2.extensionEnvironment);
}

function parseSharedProcessDebugPort(args2, isBuilt) {
  return parseDebugParams(args2["inspect-sharedprocess"], args2["inspect-brk-sharedprocess"], 5879, isBuilt, args2.extensionEnvironment);
}

var NativeEnvironmentService;

var init_environmentService2 = __esm({
  "src/vs/platform/environment/node/environmentService.ts"() {
    init_environmentService();
    init_userDataPath();
    NativeEnvironmentService = class extends AbstractNativeEnvironmentService {
      constructor(args2, productService) {
        const homeDir = homedir2();
        super(args2, {
          homeDir,
          tmpDir: tmpdir2(),
          userDataDir: getUserDataPath(args2, productService.nameShort)
        }, productService);
      }
    };
  }
});
export { parsePtyHostDebugPort, parseAgentHostDebugPort, parseSharedProcessDebugPort, homedir2, tmpdir2, NativeEnvironmentService, init_environmentService2 };
