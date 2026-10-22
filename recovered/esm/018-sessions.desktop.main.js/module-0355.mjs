// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextRegistry.ts



// src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextRegistry.ts
var TextAreaEditContextRegistryImpl = class {
  constructor() {
    this._textAreaEditContextMapping = /* @__PURE__ */ new Map();
  }
  register(ownerID, textAreaEditContext) {
    this._textAreaEditContextMapping.set(ownerID, textAreaEditContext);
    return {
      dispose: () => {
        this._textAreaEditContextMapping.delete(ownerID);
      }
    };
  }
  get(ownerID) {
    return this._textAreaEditContextMapping.get(ownerID);
  }
};

var TextAreaEditContextRegistry = new TextAreaEditContextRegistryImpl();
export { TextAreaEditContextRegistryImpl, TextAreaEditContextRegistry };
