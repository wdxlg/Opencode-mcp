// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/common/canonicalUriService.ts
import { registerSingleton } from "./module-0135.mjs";
import { ICanonicalUriService } from "./module-1315.mjs";


// src/vs/workbench/services/workspaces/common/canonicalUriService.ts
var CanonicalUriService = class {
  constructor() {
    this._providers = /* @__PURE__ */ new Map();
  }
  registerCanonicalUriProvider(provider) {
    this._providers.set(provider.scheme, provider);
    return {
      dispose: () => this._providers.delete(provider.scheme)
    };
  }
  async provideCanonicalUri(uri5, targetScheme, token) {
    const provider = this._providers.get(uri5.scheme);
    if (provider) {
      return provider.provideCanonicalUri(uri5, targetScheme, token);
    }
    return void 0;
  }
};

registerSingleton(ICanonicalUriService, CanonicalUriService, 1 /* Delayed */);
export { CanonicalUriService };
