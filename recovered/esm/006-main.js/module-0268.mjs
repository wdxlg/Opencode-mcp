// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionsProfileScannerService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IUserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";
import { IUriIdentityService, init_uriIdentity } from "./module-0077.mjs";
import { AbstractExtensionsProfileScannerService, init_extensionsProfileScannerService } from "./module-0257.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { URI, init_uri } from "./module-0030.mjs";


// src/vs/platform/extensionManagement/node/extensionsProfileScannerService.ts
var ExtensionsProfileScannerService;

var init_extensionsProfileScannerService2 = __esm({
  "src/vs/platform/extensionManagement/node/extensionsProfileScannerService.ts"() {
    init_log();
    init_userDataProfile();
    init_uriIdentity();
    init_extensionsProfileScannerService();
    init_files();
    init_environment();
    init_uri();
    ExtensionsProfileScannerService = class extends AbstractExtensionsProfileScannerService {
      constructor(environmentService, fileService, userDataProfilesService, uriIdentityService, logService) {
        super(URI.file(environmentService.extensionsPath), fileService, userDataProfilesService, uriIdentityService, logService);
      }
    };
    ExtensionsProfileScannerService = __decorateClass([
      __decorateParam(0, INativeEnvironmentService),
      __decorateParam(1, IFileService),
      __decorateParam(2, IUserDataProfilesService),
      __decorateParam(3, IUriIdentityService),
      __decorateParam(4, ILogService)
    ], ExtensionsProfileScannerService);
  }
});
export { ExtensionsProfileScannerService, init_extensionsProfileScannerService2 };
