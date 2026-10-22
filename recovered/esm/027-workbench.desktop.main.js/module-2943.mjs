// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/unsupportedExtensionsMigrationContribution.ts
import { migrateUnsupportedExtensions } from "./module-2942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionManagementServerService } from "./module-1046.mjs";
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from "./module-0872.mjs";
import { IExtensionStorageService } from "./module-1265.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/extensions/browser/unsupportedExtensionsMigrationContribution.ts
var UnsupportedExtensionsMigrationContrib = class {
  constructor(extensionManagementServerService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService) {
    if (extensionManagementServerService.remoteExtensionManagementServer) {
      migrateUnsupportedExtensions(void 0, extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
    }
    if (extensionManagementServerService.webExtensionManagementServer) {
      migrateUnsupportedExtensions(void 0, extensionManagementServerService.webExtensionManagementServer.extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
    }
  }
};

UnsupportedExtensionsMigrationContrib = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IExtensionStorageService),
  __decorateParam(3, IGlobalExtensionEnablementService),
  __decorateParam(4, ILogService)
], UnsupportedExtensionsMigrationContrib);
export { UnsupportedExtensionsMigrationContrib };
