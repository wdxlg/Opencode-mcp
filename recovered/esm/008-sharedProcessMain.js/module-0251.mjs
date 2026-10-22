// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/extensions.ts
import { Disposable } from "./module-0013.mjs";
import { ExtensionStorageService, IExtensionStorageService } from "./module-0155.mjs";
import { migrateUnsupportedExtensions } from "./module-0250.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeServerExtensionManagementService } from "./module-0118.mjs";
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from "./module-0058.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/extensions.ts
var ExtensionsContributions = class extends Disposable {
  constructor(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, userDataProfilesService, storageService, logService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionStorageService = extensionStorageService;
    this.extensionEnablementService = extensionEnablementService;
    this.userDataProfilesService = userDataProfilesService;
    this.logService = logService;
    extensionManagementService.cleanUp().catch((error) => logService.error("Error while cleaning up extensions", error));
    this.migrateUnsupportedExtensions().catch((error) => logService.error("Error while migrating unsupported extensions", error));
    ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
  }
  async migrateUnsupportedExtensions() {
    for (const profile of this.userDataProfilesService.profiles) {
      await migrateUnsupportedExtensions(profile, this.extensionManagementService, this.extensionGalleryService, this.extensionStorageService, this.extensionEnablementService, this.logService);
    }
  }
};

ExtensionsContributions = __decorateClass([
  __decorateParam(0, INativeServerExtensionManagementService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IExtensionStorageService),
  __decorateParam(3, IGlobalExtensionEnablementService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ILogService)
], ExtensionsContributions);
export { ExtensionsContributions };
