// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/environment/node/environmentService.ts
import { AbstractNativeEnvironmentService } from "./module-0267.mjs";
import { getUserDataPath } from "./module-0268.mjs";


// src/vs/platform/environment/node/environmentService.ts
import { homedir as homedir5, tmpdir as tmpdir3 } from "os";


// src/vs/platform/environment/node/environmentService.ts
var NativeEnvironmentService = class extends AbstractNativeEnvironmentService {
  constructor(args, productService) {
    const homeDir = homedir5();
    super(args, {
      homeDir,
      tmpDir: tmpdir3(),
      userDataDir: getUserDataPath(args, productService.nameShort)
    }, productService);
  }
};
export { homedir5, tmpdir3, NativeEnvironmentService };
