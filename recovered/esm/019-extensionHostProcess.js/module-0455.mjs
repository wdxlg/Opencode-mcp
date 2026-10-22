// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostProfileContentHandler.ts
import { MainContext } from "./module-0054.mjs";
import { checkProposedApiEnabled } from "./module-0173.mjs";
import { toDisposable } from "./module-0011.mjs";
import { isString } from "./module-0009.mjs";
import { URI } from "./module-0025.mjs";


// src/vs/workbench/api/common/extHostProfileContentHandler.ts
var ExtHostProfileContentHandlers = class {
  constructor(mainContext) {
    this.handlers = /* @__PURE__ */ new Map();
    this.proxy = mainContext.getProxy(MainContext.MainThreadProfileContentHandlers);
  }
  registerProfileContentHandler(extension, id2, handler) {
    checkProposedApiEnabled(extension, "profileContentHandlers");
    if (this.handlers.has(id2)) {
      throw new Error(`Handler with id '${id2}' already registered`);
    }
    this.handlers.set(id2, handler);
    this.proxy.$registerProfileContentHandler(id2, handler.name, handler.description, extension.identifier.value);
    return toDisposable(() => {
      this.handlers.delete(id2);
      this.proxy.$unregisterProfileContentHandler(id2);
    });
  }
  async $saveProfile(id2, name, content, token) {
    const handler = this.handlers.get(id2);
    if (!handler) {
      throw new Error(`Unknown handler with id: ${id2}`);
    }
    return handler.saveProfile(name, content, token);
  }
  async $readProfile(id2, idOrUri, token) {
    const handler = this.handlers.get(id2);
    if (!handler) {
      throw new Error(`Unknown handler with id: ${id2}`);
    }
    return handler.readProfile(isString(idOrUri) ? idOrUri : URI.revive(idOrUri), token);
  }
};
export { ExtHostProfileContentHandlers };
