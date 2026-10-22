// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionTipsService.ts
import { AbstractNativeExtensionTipsService } from "./module-0261.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IExtensionManagementService } from "./module-0058.mjs";
import { IStorageService } from "./module-0096.mjs";
import { INativeHostService } from "./module-0066.mjs";
import { IExtensionRecommendationNotificationService } from "./module-0129.mjs";
import { IFileService } from "./module-0057.mjs";
import { IProductService } from "./module-0045.mjs";


// src/vs/platform/extensionManagement/node/extensionTipsService.ts
var ExtensionTipsService2 = class extends AbstractNativeExtensionTipsService {
  constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
    super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
  }
};

ExtensionTipsService2 = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IExtensionRecommendationNotificationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IProductService)
], ExtensionTipsService2);
export { ExtensionTipsService2 };
