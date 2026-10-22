// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/common/extensionGalleryService.ts
import { AbstractExtensionGalleryService } from "./module-1636.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IRequestService } from "./module-0947.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAllowedExtensionsService, IExtensionGalleryService } from "./module-0874.mjs";
import { IExtensionGalleryManifestService } from "./module-0892.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensionManagement/common/extensionGalleryService.ts
var WorkbenchExtensionGalleryService = class extends AbstractExtensionGalleryService {
  constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService) {
    super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService);
  }
};

WorkbenchExtensionGalleryService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAllowedExtensionsService),
  __decorateParam(9, IExtensionGalleryManifestService)
], WorkbenchExtensionGalleryService);

registerSingleton(IExtensionGalleryService, WorkbenchExtensionGalleryService, 1 /* Delayed */);
export { WorkbenchExtensionGalleryService };
