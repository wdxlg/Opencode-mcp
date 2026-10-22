// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/environment/node/environmentService.ts
import { AbstractNativeEnvironmentService } from "./module-0060.mjs";
import { getUserDataPath } from "./module-0061.mjs";


// src/vs/platform/environment/node/environmentService.ts
import { homedir as homedir2, tmpdir } from "os";


// src/vs/platform/environment/node/environmentService.ts
var NativeEnvironmentService = class extends AbstractNativeEnvironmentService {
  constructor(args, productService) {
    const homeDir = homedir2();
    super(args, {
      homeDir,
      tmpDir: tmpdir(),
      userDataDir: getUserDataPath(args, productService.nameShort)
    }, productService);
  }
};
export { homedir2, tmpdir, NativeEnvironmentService };
