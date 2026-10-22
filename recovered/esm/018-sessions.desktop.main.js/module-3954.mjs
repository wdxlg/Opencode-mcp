// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/electron-browser/extensionManagementService.ts
import { ExtensionManagementService } from "./module-3953.mjs";
import { Schemas } from "./module-0033.mjs";
import { joinPath } from "./module-0034.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IExtensionManagementServerService, IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IAllowedExtensionsService, IExtensionGalleryService } from "./module-0874.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0875.mjs";
import { IDownloadService } from "./module-1283.mjs";
import { IUserDataSyncEnablementService } from "./module-1639.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionsScannerService } from "./module-3951.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensionManagement/electron-browser/extensionManagementService.ts
var ExtensionManagementService2 = class extends ExtensionManagementService {
  constructor(environmentService, extensionManagementServerService, extensionGalleryService, userDataProfileService, userDataProfilesService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService, extensionsScannerService, allowedExtensionsService, storageService, telemetryService) {
    super(
      extensionManagementServerService,
      extensionGalleryService,
      userDataProfileService,
      userDataProfilesService,
      configurationService,
      productService,
      downloadService,
      userDataSyncEnablementService,
      dialogService,
      workspaceTrustRequestService,
      extensionManifestPropertiesService,
      fileService,
      logService,
      instantiationService,
      extensionsScannerService,
      allowedExtensionsService,
      storageService,
      telemetryService
    );
    this.environmentService = environmentService;
  }
  async installVSIXInServer(vsix, server, options3) {
    if (vsix.scheme === Schemas.vscodeRemote && server === this.extensionManagementServerService.localExtensionManagementServer) {
      const downloadedLocation = joinPath(this.environmentService.tmpDir, generateUuid());
      await this.downloadService.download(vsix, downloadedLocation, "extensionManagement.downloadRemoteVsix");
      vsix = downloadedLocation;
    }
    return super.installVSIXInServer(vsix, server, options3);
  }
};

ExtensionManagementService2 = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IDownloadService),
  __decorateParam(8, IUserDataSyncEnablementService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, IWorkspaceTrustRequestService),
  __decorateParam(11, IExtensionManifestPropertiesService),
  __decorateParam(12, IFileService),
  __decorateParam(13, ILogService),
  __decorateParam(14, IInstantiationService),
  __decorateParam(15, IExtensionsScannerService),
  __decorateParam(16, IAllowedExtensionsService),
  __decorateParam(17, IStorageService),
  __decorateParam(18, ITelemetryService)
], ExtensionManagementService2);

registerSingleton(IWorkbenchExtensionManagementService, ExtensionManagementService2, 1 /* Delayed */);
export { ExtensionManagementService2 };
