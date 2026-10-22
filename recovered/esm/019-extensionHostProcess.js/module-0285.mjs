// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostSecrets.ts
import { DisposableStore } from "./module-0011.mjs";
import { ExtensionIdentifier } from "./module-0059.mjs";
import { Event } from "./module-0017.mjs";


// src/vs/workbench/api/common/extHostSecrets.ts
var ExtensionSecrets = class {
  constructor(extensionDescription, secretState) {
    this.disposables = new DisposableStore();
    this._id = ExtensionIdentifier.toKey(extensionDescription.identifier);
    this.#secretState = secretState;
    this.onDidChange = Event.map(
      Event.filter(this.#secretState.onDidChangePassword, (e) => e.extensionId === this._id),
      (e) => ({ key: e.key }),
      this.disposables
    );
  }
  #secretState;
  dispose() {
    this.disposables.dispose();
  }
  get(key) {
    return this.#secretState.get(this._id, key);
  }
  store(key, value) {
    return this.#secretState.store(this._id, key, value);
  }
  delete(key) {
    return this.#secretState.delete(this._id, key);
  }
  keys() {
    return this.#secretState.keys(this._id) || [];
  }
};
export { ExtensionSecrets };
