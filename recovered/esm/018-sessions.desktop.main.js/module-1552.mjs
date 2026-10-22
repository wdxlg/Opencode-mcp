// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/common/quickAccess.ts
import { toDisposable } from "./module-0012.mjs";
import { coalesce } from "./module-0007.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/platform/quickinput/common/quickAccess.ts
var Extensions18 = {
  Quickaccess: "workbench.contributions.quickaccess"
};

var QuickAccessRegistry = class {
  constructor() {
    this.providers = [];
    this.defaultProvider = void 0;
  }
  registerQuickAccessProvider(provider) {
    if (provider.prefix.length === 0) {
      this.defaultProvider = provider;
    } else {
      this.providers.push(provider);
    }
    this.providers.sort((providerA, providerB) => providerB.prefix.length - providerA.prefix.length);
    return toDisposable(() => {
      this.providers.splice(this.providers.indexOf(provider), 1);
      if (this.defaultProvider === provider) {
        this.defaultProvider = void 0;
      }
    });
  }
  getQuickAccessProviders(contextKeyService) {
    return coalesce([this.defaultProvider, ...this.providers]).filter((provider) => !provider.when || contextKeyService.contextMatchesRules(provider.when));
  }
  getQuickAccessProvider(prefix, contextKeyService) {
    const result = prefix ? this.providers.find((provider) => prefix.startsWith(provider.prefix) && (!provider.when || contextKeyService.contextMatchesRules(provider.when))) : void 0;
    return result || this.defaultProvider;
  }
  clear() {
    const providers2 = [...this.providers];
    const defaultProvider = this.defaultProvider;
    this.providers = [];
    this.defaultProvider = void 0;
    return () => {
      this.providers = providers2;
      this.defaultProvider = defaultProvider;
    };
  }
};

Registry.add(Extensions18.Quickaccess, new QuickAccessRegistry());
export { Extensions18, QuickAccessRegistry };
