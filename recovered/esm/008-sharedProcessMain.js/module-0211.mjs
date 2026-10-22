// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionsScannerService.ts
import { NativeExtensionsScannerService } from "./module-0123.mjs";
import { URI } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";
import { IExtensionsProfileScannerService } from "./module-0120.mjs";
import { IFileService } from "./module-0057.mjs";
import { ILogService } from "./module-0044.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { IProductService } from "./module-0045.mjs";
import { IUriIdentityService } from "./module-0094.mjs";
import { IInstantiationService } from "./module-0042.mjs";


// src/vs/platform/extensionManagement/node/extensionsScannerService.ts
var ExtensionsScannerService = class extends NativeExtensionsScannerService {
  constructor(userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
    super(
      URI.file(environmentService.builtinExtensionsPath),
      URI.file(environmentService.extensionsPath),
      environmentService.userHome,
      userDataProfilesService.defaultProfile,
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
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IExtensionsProfileScannerService),
  __decorateParam(2, IFileService),
  __decorateParam(3, ILogService),
  __decorateParam(4, INativeEnvironmentService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IInstantiationService)
], ExtensionsScannerService);
export { ExtensionsScannerService };
