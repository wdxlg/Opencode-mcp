// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpDiscovery.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { mcpAccessConfig } from "./module-1196.mjs";
import { autorun } from "./module-0052.mjs";
import { mcpDiscoveryRegistry } from "./module-2844.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpDiscovery.ts
var McpDiscovery = class extends Disposable {
  static {
    this.ID = "workbench.contrib.mcp.discovery";
  }
  constructor(instantiationService, configurationService) {
    super();
    const mcpAccessValue = observableConfigValue(mcpAccessConfig, "all" /* All */, configurationService);
    const store = this._register(new DisposableStore());
    this._register(autorun((reader) => {
      store.clear();
      const value2 = mcpAccessValue.read(reader);
      if (value2 === "none" /* None */) {
        return;
      }
      for (const descriptor of mcpDiscoveryRegistry.getAll()) {
        const mcpDiscovery = instantiationService.createInstance(descriptor);
        if (value2 === "registry" /* Registry */ && !mcpDiscovery.fromGallery) {
          mcpDiscovery.dispose();
          continue;
        }
        store.add(mcpDiscovery);
        mcpDiscovery.start();
      }
    }));
  }
};

McpDiscovery = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService)
], McpDiscovery);
export { McpDiscovery };
