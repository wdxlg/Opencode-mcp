// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/workbench/services/textMate/common/TMScopeRegistry.ts
import { isEqual } from "./module-0025.mjs";


// src/vs/workbench/services/textMate/common/TMScopeRegistry.ts
var TMScopeRegistry = class {
  constructor() {
    this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
  }
  reset() {
    this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
  }
  register(def) {
    if (this._scopeNameToLanguageRegistration[def.scopeName]) {
      const existingRegistration = this._scopeNameToLanguageRegistration[def.scopeName];
      if (!isEqual(existingRegistration.location, def.location)) {
        console.warn(
          `Overwriting grammar scope name to file mapping for scope ${def.scopeName}.
Old grammar file: ${existingRegistration.location.toString()}.
New grammar file: ${def.location.toString()}`
        );
      }
    }
    this._scopeNameToLanguageRegistration[def.scopeName] = def;
  }
  getGrammarDefinition(scopeName) {
    return this._scopeNameToLanguageRegistration[scopeName] || null;
  }
};
export { TMScopeRegistry };
