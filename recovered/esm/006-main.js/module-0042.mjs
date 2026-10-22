// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/registry/common/platform.ts
import { __esm } from "./module-0000.mjs";
import { init_assert, ok } from "./module-0015.mjs";
import { init_types, isFunction, isObject, isString } from "./module-0016.mjs";


// src/vs/platform/registry/common/platform.ts
var RegistryImpl, Registry;

var init_platform2 = __esm({
  "src/vs/platform/registry/common/platform.ts"() {
    init_assert();
    init_types();
    RegistryImpl = class {
      constructor() {
        this.data = /* @__PURE__ */ new Map();
      }
      add(id2, data) {
        ok(isString(id2));
        ok(isObject(data));
        ok(!this.data.has(id2), "There is already an extension with this id");
        this.data.set(id2, data);
      }
      knows(id2) {
        return this.data.has(id2);
      }
      as(id2) {
        return this.data.get(id2) || null;
      }
      dispose() {
        this.data.forEach((value) => {
          if (isFunction(value.dispose)) {
            value.dispose();
          }
        });
        this.data.clear();
      }
    };
    Registry = new RegistryImpl();
  }
});
export { RegistryImpl, Registry, init_platform2 };
