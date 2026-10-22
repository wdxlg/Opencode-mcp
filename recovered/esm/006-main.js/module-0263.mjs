// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionsScannerService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { IExtensionsProfileScannerService, init_extensionsProfileScannerService } from "./module-0257.mjs";
import { NativeExtensionsScannerService, init_extensionsScannerService } from "./module-0262.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { IInstantiationService, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IUriIdentityService, init_uriIdentity } from "./module-0077.mjs";
import { IUserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";


// src/vs/platform/extensionManagement/node/extensionsScannerService.ts
var ExtensionsScannerService;

var init_extensionsScannerService2 = __esm({
  "src/vs/platform/extensionManagement/node/extensionsScannerService.ts"() {
    init_uri();
    init_environment();
    init_extensionsProfileScannerService();
    init_extensionsScannerService();
    init_files();
    init_instantiation();
    init_log();
    init_productService();
    init_uriIdentity();
    init_userDataProfile();
    ExtensionsScannerService = class extends NativeExtensionsScannerService {
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
  }
});
export { ExtensionsScannerService, init_extensionsScannerService2 };
