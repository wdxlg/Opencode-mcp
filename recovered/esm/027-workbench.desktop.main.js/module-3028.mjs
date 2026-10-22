// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testExclusions.ts
import { Disposable } from "./module-0012.mjs";
import { MutableObservableValue } from "./module-3025.mjs";
import { StoredValue } from "./module-1426.mjs";
import { Iterable } from "./module-0011.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/testing/common/testExclusions.ts
var TestExclusions = class extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.excluded = this._register(
      MutableObservableValue.stored(new StoredValue({
        key: "excludedTestItems",
        scope: 1 /* WORKSPACE */,
        target: 1 /* MACHINE */,
        serialization: {
          deserialize: (v2) => new Set(JSON.parse(v2)),
          serialize: (v2) => JSON.stringify([...v2])
        }
      }, this.storageService), /* @__PURE__ */ new Set())
    );
    this.onTestExclusionsChanged = this.excluded.onDidChange;
  }
  /**
   * Gets whether there's any excluded tests.
   */
  get hasAny() {
    return this.excluded.value.size > 0;
  }
  /**
   * Gets all excluded tests.
   */
  get all() {
    return this.excluded.value;
  }
  /**
   * Sets whether a test is excluded.
   */
  toggle(test, exclude) {
    if (exclude !== true && this.excluded.value.has(test.item.extId)) {
      this.excluded.value = new Set(Iterable.filter(this.excluded.value, (e) => e !== test.item.extId));
    } else if (exclude !== false && !this.excluded.value.has(test.item.extId)) {
      this.excluded.value = /* @__PURE__ */ new Set([...this.excluded.value, test.item.extId]);
    }
  }
  /**
   * Gets whether a test is excluded.
   */
  contains(test) {
    return this.excluded.value.has(test.item.extId);
  }
  /**
   * Removes all test exclusions.
   */
  clear() {
    this.excluded.value = /* @__PURE__ */ new Set();
  }
};

TestExclusions = __decorateClass([
  __decorateParam(0, IStorageService)
], TestExclusions);
export { TestExclusions };
