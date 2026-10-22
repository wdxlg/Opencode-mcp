// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/registry/common/platform.ts
import { ok } from "./module-0009.mjs";
import { isFunction, isObject, isString } from "./module-0010.mjs";


// src/vs/platform/registry/common/platform.ts
var RegistryImpl = class {
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
    this.data.forEach((value2) => {
      if (isFunction(value2.dispose)) {
        value2.dispose();
      }
    });
    this.data.clear();
  }
};

var Registry = new RegistryImpl();
export { RegistryImpl, Registry };
