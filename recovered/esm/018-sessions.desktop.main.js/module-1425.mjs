// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/storedValue.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/testing/common/storedValue.ts
var defaultSerialization = {
  deserialize: (d) => JSON.parse(d),
  serialize: (d) => JSON.stringify(d)
};

var StoredValue = class extends Disposable {
  constructor(options3, storage) {
    super();
    this.storage = storage;
    this.key = options3.key;
    this.scope = options3.scope;
    this.target = options3.target;
    this.serialization = options3.serialization ?? defaultSerialization;
    this.onDidChange = this.storage.onDidChangeValue(this.scope, this.key, this._store);
  }
  get(defaultValue) {
    if (this.value === void 0) {
      const value2 = this.storage.get(this.key, this.scope);
      this.value = value2 === void 0 ? defaultValue : this.serialization.deserialize(value2);
    }
    return this.value;
  }
  /**
   * Persists changes to the value.
   * @param value
   */
  store(value2) {
    this.value = value2;
    this.storage.store(this.key, this.serialization.serialize(value2), this.scope, this.target);
  }
  /**
   * Delete an element stored under the provided key from storage.
   */
  delete() {
    this.storage.remove(this.key, this.scope);
  }
};

StoredValue = __decorateClass([
  __decorateParam(1, IStorageService)
], StoredValue);
export { defaultSerialization, StoredValue };
