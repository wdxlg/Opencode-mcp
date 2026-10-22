// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/electron-browser/extensionsScannerService.ts
import { IExtensionsScannerService, NativeExtensionsScannerService } from "./module-3838.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IExtensionsProfileScannerService } from "./module-3837.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IProductService } from "./module-0873.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensions/electron-browser/extensionsScannerService.ts
var ExtensionsScannerService = class extends NativeExtensionsScannerService {
  constructor(userDataProfileService, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
    super(
      URI.file(environmentService.builtinExtensionsPath),
      URI.file(environmentService.extensionsPath),
      environmentService.userHome,
      userDataProfileService.currentProfile,
      userDataProfilesService,
      extensionsProfileScannerService,
      fileService,
      logService,
      environmentService,
      productService,
      uriIdentityService,
      instantiationService
    );
  }
};

ExtensionsScannerService = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IExtensionsProfileScannerService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INativeEnvironmentService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IUriIdentityService),
  __decorateParam(8, IInstantiationService)
], ExtensionsScannerService);

registerSingleton(IExtensionsScannerService, ExtensionsScannerService, 1 /* Delayed */);
export { ExtensionsScannerService };
