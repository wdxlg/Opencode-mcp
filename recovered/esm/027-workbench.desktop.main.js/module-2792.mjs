// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/codeBlockContextProviderService.ts
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/codeBlockContextProviderService.ts
var ChatCodeBlockContextProviderService = class {
  constructor() {
    this._providers = /* @__PURE__ */ new Map();
  }
  get providers() {
    return [...this._providers.values()];
  }
  registerProvider(provider, id2) {
    this._providers.set(id2, provider);
    return toDisposable(() => this._providers.delete(id2));
  }
};
export { ChatCodeBlockContextProviderService };
