// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/languageRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/extensions/browser/languageRecommendations.ts
var LanguageRecommendations = class extends ExtensionRecommendations {
  constructor(productService) {
    super();
    this.productService = productService;
    this._recommendations = [];
  }
  get recommendations() {
    return this._recommendations;
  }
  async doActivate() {
    if (this.productService.languageExtensionTips) {
      this._recommendations = this.productService.languageExtensionTips.map((extensionId) => ({
        extension: extensionId.toLowerCase(),
        reason: {
          reasonId: 6 /* Application */,
          reasonText: ""
        }
      }));
    }
  }
};

LanguageRecommendations = __decorateClass([
  __decorateParam(0, IProductService)
], LanguageRecommendations);
export { LanguageRecommendations };
