// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/electron-browser/extensionsProfileScannerService.ts
import { AbstractExtensionsProfileScannerService, IExtensionsProfileScannerService } from "./module-3950.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/extensionManagement/electron-browser/extensionsProfileScannerService.ts
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

registerSingleton(IExtensionsProfileScannerService, ExtensionsProfileScannerService, 1 /* Delayed */);
export { ExtensionsProfileScannerService };
