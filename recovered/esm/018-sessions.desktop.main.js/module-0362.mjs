// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/native/nativeEditContextRegistry.ts



// src/vs/editor/browser/controller/editContext/native/nativeEditContextRegistry.ts
var NativeEditContextRegistryImpl = class {
  constructor() {
    this._nativeEditContextMapping = /* @__PURE__ */ new Map();
  }
  register(ownerID, nativeEditContext) {
    this._nativeEditContextMapping.set(ownerID, nativeEditContext);
    return {
      dispose: () => {
        this._nativeEditContextMapping.delete(ownerID);
      }
    };
  }
  get(ownerID) {
    return this._nativeEditContextMapping.get(ownerID);
  }
};

var NativeEditContextRegistry = new NativeEditContextRegistryImpl();
export { NativeEditContextRegistryImpl, NativeEditContextRegistry };
