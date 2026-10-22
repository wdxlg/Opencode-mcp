// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/localizationsUpdater.ts
import { Disposable } from "./module-0013.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguagePackService } from "./module-0059.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/localizationsUpdater.ts
var LocalizationsUpdater = class extends Disposable {
  constructor(localizationsService) {
    super();
    this.localizationsService = localizationsService;
    this.updateLocalizations();
  }
  updateLocalizations() {
    this.localizationsService.update();
  }
};

LocalizationsUpdater = __decorateClass([
  __decorateParam(0, ILanguagePackService)
], LocalizationsUpdater);
export { LocalizationsUpdater };
