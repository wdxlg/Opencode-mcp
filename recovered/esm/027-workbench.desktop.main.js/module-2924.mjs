// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionRecommendations.ts
import { Disposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionRecommendations.ts
var ExtensionRecommendations = class extends Disposable {
  constructor() {
    super(...arguments);
    this._activationPromise = null;
  }
  get activated() {
    return this._activationPromise !== null;
  }
  activate() {
    if (!this._activationPromise) {
      this._activationPromise = this.doActivate();
    }
    return this._activationPromise;
  }
};
export { ExtensionRecommendations };
