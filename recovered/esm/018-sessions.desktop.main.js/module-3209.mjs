// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkProviderService.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkProviderService.ts
var TerminalLinkProviderService = class {
  constructor() {
    this._linkProviders = /* @__PURE__ */ new Set();
    this._onDidAddLinkProvider = new Emitter();
    this._onDidRemoveLinkProvider = new Emitter();
  }
  get linkProviders() {
    return this._linkProviders;
  }
  get onDidAddLinkProvider() {
    return this._onDidAddLinkProvider.event;
  }
  get onDidRemoveLinkProvider() {
    return this._onDidRemoveLinkProvider.event;
  }
  registerLinkProvider(linkProvider) {
    const disposables = [];
    this._linkProviders.add(linkProvider);
    this._onDidAddLinkProvider.fire(linkProvider);
    return {
      dispose: () => {
        for (const disposable of disposables) {
          disposable.dispose();
        }
        this._linkProviders.delete(linkProvider);
        this._onDidRemoveLinkProvider.fire(linkProvider);
      }
    };
  }
};
export { TerminalLinkProviderService };
