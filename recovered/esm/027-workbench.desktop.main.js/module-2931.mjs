// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/webRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IExtensionManagementServerService } from "./module-1046.mjs";


// src/vs/workbench/contrib/extensions/browser/webRecommendations.ts
var WebRecommendations = class extends ExtensionRecommendations {
  constructor(productService, extensionManagementServerService) {
    super();
    this.productService = productService;
    this.extensionManagementServerService = extensionManagementServerService;
    this._recommendations = [];
  }
  get recommendations() {
    return this._recommendations;
  }
  async doActivate() {
    const isOnlyWeb = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer;
    if (isOnlyWeb && Array.isArray(this.productService.webExtensionTips)) {
      this._recommendations = this.productService.webExtensionTips.map((extensionId) => ({
        extension: extensionId.toLowerCase(),
        reason: {
          reasonId: 6 /* Application */,
          reasonText: localize(15597, null, this.productService.nameLong)
        }
      }));
    }
  }
};

WebRecommendations = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionManagementServerService)
], WebRecommendations);
export { WebRecommendations };
