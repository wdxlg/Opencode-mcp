// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/languageStatus/common/languageStatusService.ts
import { createDecorator } from "./module-0077.mjs";
import { LanguageFeatureRegistry } from "./module-1214.mjs";
import { Event2 } from "./module-0017.mjs";
import { compare } from "./module-0030.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/languageStatus/common/languageStatusService.ts
var ILanguageStatusService = createDecorator("ILanguageStatusService");

var LanguageStatusServiceImpl = class {
  constructor() {
    this._provider = new LanguageFeatureRegistry();
    this.onDidChange = Event2.map(this._provider.onDidChange, () => void 0);
  }
  addStatus(status2) {
    return this._provider.register(status2.selector, status2);
  }
  getLanguageStatus(model) {
    return this._provider.ordered(model).sort((a, b) => {
      let res = b.severity - a.severity;
      if (res === 0) {
        res = compare(a.source, b.source);
      }
      if (res === 0) {
        res = compare(a.id, b.id);
      }
      return res;
    });
  }
};

registerSingleton(ILanguageStatusService, LanguageStatusServiceImpl, 1 /* Delayed */);
export { ILanguageStatusService, LanguageStatusServiceImpl };
