// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/remoteRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { PlatformToString, platform } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/extensions/browser/remoteRecommendations.ts
var RemoteRecommendations = class extends ExtensionRecommendations {
  constructor(productService) {
    super();
    this.productService = productService;
    this._recommendations = [];
  }
  get recommendations() {
    return this._recommendations;
  }
  async doActivate() {
    const extensionTips = { ...this.productService.remoteExtensionTips, ...this.productService.virtualWorkspaceExtensionTips };
    const currentPlatform = PlatformToString(platform);
    this._recommendations = Object.values(extensionTips).filter(({ supportedPlatforms }) => !supportedPlatforms || supportedPlatforms.includes(currentPlatform)).map((extension) => ({
      extension: extension.extensionId.toLowerCase(),
      reason: {
        reasonId: 6 /* Application */,
        reasonText: ""
      }
    }));
  }
};

RemoteRecommendations = __decorateClass([
  __decorateParam(0, IProductService)
], RemoteRecommendations);
export { RemoteRecommendations };
