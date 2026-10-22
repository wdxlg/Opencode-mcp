// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/textSearchManager.ts
import { TextSearchManager } from "./module-0318.mjs";
import { pfs_exports } from "./module-0033.mjs";
import { toCanonicalName } from "./module-0249.mjs";


// src/vs/workbench/services/search/node/textSearchManager.ts
var NativeTextSearchManager = class extends TextSearchManager {
  constructor(query, provider, _pfs = pfs_exports, processType = "searchProcess") {
    super({ query, provider }, {
      readdir: (resource) => _pfs.Promises.readdir(resource.fsPath),
      toCanonicalName: (name) => toCanonicalName(name)
    }, processType);
  }
};
export { NativeTextSearchManager };
