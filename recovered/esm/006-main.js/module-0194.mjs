// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/instantiation/common/serviceCollection.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/instantiation/common/serviceCollection.ts
var ServiceCollection;

var init_serviceCollection = __esm({
  "src/vs/platform/instantiation/common/serviceCollection.ts"() {
    ServiceCollection = class {
      constructor(...entries) {
        this._entries = /* @__PURE__ */ new Map();
        for (const [id2, service] of entries) {
          this.set(id2, service);
        }
      }
      set(id2, instanceOrDescriptor) {
        const result = this._entries.get(id2);
        this._entries.set(id2, instanceOrDescriptor);
        return result;
      }
      has(id2) {
        return this._entries.has(id2);
      }
      get(id2) {
        return this._entries.get(id2);
      }
    };
  }
});
export { ServiceCollection, init_serviceCollection };
