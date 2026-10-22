// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/worker/extHostConsoleForwarder.ts
import { AbstractExtHostConsoleForwarder } from "./module-0450.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";


// src/vs/workbench/api/worker/extHostConsoleForwarder.ts
var ExtHostConsoleForwarder = class extends AbstractExtHostConsoleForwarder {
  constructor(extHostRpc, initData) {
    super(extHostRpc, initData);
  }
  _nativeConsoleLogMessage(_method, original, args) {
    original.apply(console, args);
  }
};

ExtHostConsoleForwarder = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService)
], ExtHostConsoleForwarder);
export { ExtHostConsoleForwarder };
