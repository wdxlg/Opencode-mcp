// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionsScannerService.ts
import { NativeExtensionsScannerService } from "./module-0091.mjs";
import { URI } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0080.mjs";
import { IExtensionsProfileScannerService } from "./module-0088.mjs";
import { IFileService } from "./module-0044.mjs";
import { ILogService } from "./module-0049.mjs";
import { INativeEnvironmentService } from "./module-0056.mjs";
import { IProductService } from "./module-0074.mjs";
import { IUriIdentityService } from "./module-0079.mjs";
import { IInstantiationService } from "./module-0030.mjs";


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
