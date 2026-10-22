// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostDialogs.ts
import { MainContext } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/workbench/api/common/extHostDialogs.ts
var ExtHostDialogs = class {
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadDialogs);
  }
  showOpenDialog(options2) {
    return this._proxy.$showOpenDialog(options2).then((filepaths) => {
      return filepaths ? filepaths.map((p) => URI.revive(p)) : void 0;
    });
  }
  showSaveDialog(options2) {
    return this._proxy.$showSaveDialog(options2).then((filepath) => {
      return filepath ? URI.revive(filepath) : void 0;
    });
  }
};
export { ExtHostDialogs };
