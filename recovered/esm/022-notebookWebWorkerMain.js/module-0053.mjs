// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/platform/instantiation/common/extensions.ts
import { SyncDescriptor } from "./module-0052.mjs";


// src/vs/platform/instantiation/common/extensions.ts
var _registry = [];

function registerSingleton(id2, ctorOrDescriptor, supportsDelayedInstantiation) {
  if (!(ctorOrDescriptor instanceof SyncDescriptor)) {
    ctorOrDescriptor = new SyncDescriptor(ctorOrDescriptor, [], Boolean(supportsDelayedInstantiation));
  }
  _registry.push([id2, ctorOrDescriptor]);
}
export { registerSingleton, _registry };
