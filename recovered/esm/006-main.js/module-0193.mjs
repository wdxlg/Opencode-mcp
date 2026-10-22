// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/instantiation/common/descriptors.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/instantiation/common/descriptors.ts
var SyncDescriptor;

var init_descriptors = __esm({
  "src/vs/platform/instantiation/common/descriptors.ts"() {
    SyncDescriptor = class {
      constructor(ctor, staticArguments = [], supportsDelayedInstantiation = false) {
        this.ctor = ctor;
        this.staticArguments = staticArguments;
        this.supportsDelayedInstantiation = supportsDelayedInstantiation;
      }
    };
  }
});
export { SyncDescriptor, init_descriptors };
