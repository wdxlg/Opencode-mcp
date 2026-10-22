// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/environment/node/environmentService.ts
import { AbstractNativeEnvironmentService } from "./module-0422.mjs";
import { getUserDataPath } from "./module-0423.mjs";


// src/vs/platform/environment/node/environmentService.ts
import { homedir as homedir6, tmpdir as tmpdir8 } from "os";


// src/vs/platform/environment/node/environmentService.ts
var NativeEnvironmentService = class extends AbstractNativeEnvironmentService {
  constructor(args, productService) {
    const homeDir = homedir6();
    super(args, {
      homeDir,
      tmpDir: tmpdir8(),
      userDataDir: getUserDataPath(args, productService.nameShort)
    }, productService);
  }
};
export { homedir6, tmpdir8, NativeEnvironmentService };
