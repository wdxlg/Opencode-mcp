// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/environment/node/environmentService.ts
import { AbstractNativeEnvironmentService } from "./module-0042.mjs";
import { getUserDataPath } from "./module-0043.mjs";


// src/vs/platform/environment/node/environmentService.ts
import { homedir as homedir2, tmpdir as tmpdir2 } from "os";


// src/vs/platform/environment/node/environmentService.ts
var NativeEnvironmentService = class extends AbstractNativeEnvironmentService {
  constructor(args, productService) {
    const homeDir = homedir2();
    super(args, {
      homeDir,
      tmpDir: tmpdir2(),
      userDataDir: getUserDataPath(args, productService.nameShort)
    }, productService);
  }
};
export { homedir2, tmpdir2, NativeEnvironmentService };
