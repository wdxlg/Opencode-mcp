// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/instantiation/common/strictServiceCollection.ts
import { ServiceCollection } from "./module-0441.mjs";
import { SyncDescriptor } from "./module-0299.mjs";
import { _util } from "./module-0044.mjs";


// src/vs/platform/instantiation/common/strictServiceCollection.ts
var StrictServiceCollection = class extends ServiceCollection {
  constructor(...entries) {
    super();
    for (const [id2, service] of entries) {
      this.set(id2, service);
    }
  }
  set(id2, instanceOrDescriptor) {
    if (instanceOrDescriptor instanceof SyncDescriptor) {
      const dependencies = _util.getServiceDependencies(instanceOrDescriptor.ctor).sort((a, b) => a.index - b.index);
      if (dependencies.length > 0 && instanceOrDescriptor.staticArguments.length !== dependencies[0].index) {
        throw new Error(
          `Descriptor ${instanceOrDescriptor.ctor.name} must pass exactly ${dependencies[0].index} leading static arguments (got ${instanceOrDescriptor.staticArguments.length})`
        );
      }
    }
    return super.set(id2, instanceOrDescriptor);
  }
};
export { StrictServiceCollection };
