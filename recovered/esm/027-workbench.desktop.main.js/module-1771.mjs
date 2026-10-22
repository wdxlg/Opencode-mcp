// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/common/TMScopeRegistry.ts
import { isEqual2 } from "./module-0034.mjs";


// src/vs/workbench/services/textMate/common/TMScopeRegistry.ts
var TMScopeRegistry = class {
  constructor() {
    this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
  }
  reset() {
    this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
  }
  register(def2) {
    if (this._scopeNameToLanguageRegistration[def2.scopeName]) {
      const existingRegistration = this._scopeNameToLanguageRegistration[def2.scopeName];
      if (!isEqual2(existingRegistration.location, def2.location)) {
        console.warn(
          `Overwriting grammar scope name to file mapping for scope ${def2.scopeName}.
Old grammar file: ${existingRegistration.location.toString()}.
New grammar file: ${def2.location.toString()}`
        );
      }
    }
    this._scopeNameToLanguageRegistration[def2.scopeName] = def2;
  }
  getGrammarDefinition(scopeName) {
    return this._scopeNameToLanguageRegistration[scopeName] || null;
  }
};
export { TMScopeRegistry };
