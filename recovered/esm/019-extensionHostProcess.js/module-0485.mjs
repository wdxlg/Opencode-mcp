// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostDownloadService.ts
import { Disposable } from "./module-0011.mjs";
import { MainContext } from "./module-0054.mjs";
import { URI } from "./module-0025.mjs";
import { join } from "./module-0019.mjs";
import { generateUuid } from "./module-0040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostCommands } from "./module-0268.mjs";


// src/vs/workbench/api/node/extHostDownloadService.ts
import { tmpdir as tmpdir3 } from "os";

var ExtHostDownloadService = class extends Disposable {
  constructor(extHostRpc, commands) {
    super();
    const proxy = extHostRpc.getProxy(MainContext.MainThreadDownloadService);
    commands.registerCommand(false, "_workbench.downloadResource", async (resource) => {
      const location2 = URI.file(join(tmpdir3(), generateUuid()));
      await proxy.$download(resource, location2);
      return location2;
    });
  }
};

ExtHostDownloadService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostCommands)
], ExtHostDownloadService);
export { tmpdir3, ExtHostDownloadService };
