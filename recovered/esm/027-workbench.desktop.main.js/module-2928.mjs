// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/keymapRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/extensions/browser/keymapRecommendations.ts
var KeymapRecommendations = class extends ExtensionRecommendations {
  constructor(productService) {
    super();
    this.productService = productService;
    this._recommendations = [];
  }
  get recommendations() {
    return this._recommendations;
  }
  async doActivate() {
    if (this.productService.keymapExtensionTips) {
      this._recommendations = this.productService.keymapExtensionTips.map((extensionId) => ({
        extension: extensionId.toLowerCase(),
        reason: {
          reasonId: 6 /* Application */,
          reasonText: ""
        }
      }));
    }
  }
};

KeymapRecommendations = __decorateClass([
  __decorateParam(0, IProductService)
], KeymapRecommendations);
export { KeymapRecommendations };
