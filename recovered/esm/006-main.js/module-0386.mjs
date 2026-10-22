// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/instantiation/common/extensions.ts
import { SyncDescriptor, init_descriptors } from "./module-0193.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/instantiation/common/extensions.ts
function registerSingleton(id2, ctorOrDescriptor, supportsDelayedInstantiation) {
  if (!(ctorOrDescriptor instanceof SyncDescriptor)) {
    ctorOrDescriptor = new SyncDescriptor(ctorOrDescriptor, [], Boolean(supportsDelayedInstantiation));
  }
  _registry.push([id2, ctorOrDescriptor]);
}

var _registry;

var init_extensions2 = __esm({
  "src/vs/platform/instantiation/common/extensions.ts"() {
    init_descriptors();
    _registry = [];
  }
});
export { registerSingleton, _registry, init_extensions2 };
