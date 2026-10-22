// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/label/common/resourceLabelHomeStore.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { getComparisonKey } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/services/label/common/resourceLabelHomeStore.ts
var ResourceLabelHomeStore = class extends Disposable {
  constructor(labelService) {
    super();
    this.labelService = labelService;
    this.registrations = this._register(new DisposableMap());
  }
  set(homes) {
    const keyFor = (home2) => `${getComparisonKey(home2.uri)}\0${home2.label}`;
    const homeKeys = new Set(homes.map(keyFor));
    for (const home2 of homes) {
      const key3 = keyFor(home2);
      if (!this.registrations.has(key3)) {
        this.registrations.set(key3, this.labelService.registerFormatter({
          scheme: home2.uri.scheme,
          authority: home2.uri.authority || void 0,
          home: home2.uri.path,
          priority: true,
          formatting: {
            label: home2.label,
            separator: this.labelService.getSeparator(home2.uri.scheme, home2.uri.authority)
          }
        }));
      }
    }
    for (const [key3] of this.registrations) {
      if (!homeKeys.has(key3)) {
        this.registrations.deleteAndDispose(key3);
      }
    }
  }
};

ResourceLabelHomeStore = __decorateClass([
  __decorateParam(0, ILabelService)
], ResourceLabelHomeStore);
export { ResourceLabelHomeStore };
