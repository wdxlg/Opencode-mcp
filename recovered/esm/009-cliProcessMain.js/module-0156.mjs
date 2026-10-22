// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionsProfileScannerService.ts
import { AbstractExtensionsProfileScannerService } from "./module-0088.mjs";
import { URI } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0056.mjs";
import { IFileService } from "./module-0044.mjs";
import { IUserDataProfilesService } from "./module-0080.mjs";
import { IUriIdentityService } from "./module-0079.mjs";
import { ILogService } from "./module-0049.mjs";


// src/vs/platform/extensionManagement/node/extensionsProfileScannerService.ts
var ExtensionsProfileScannerService = class extends AbstractExtensionsProfileScannerService {
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
export { ExtensionsProfileScannerService };
