// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/remote/common/remoteExtensionsScanner.ts
import { language } from "./module-0014.mjs";
import { URI } from "./module-0032.mjs";
import { IRemoteExtensionsScannerService, RemoteExtensionsScannerChannelName } from "./module-1721.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IRemoteUserDataProfilesService } from "./module-1203.mjs";
import { IActiveLanguagePackService } from "./module-1722.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/remote/common/remoteExtensionsScanner.ts
var RemoteExtensionsScannerService = class {
  constructor(remoteAgentService, environmentService, userDataProfileService, remoteUserDataProfilesService, activeLanguagePackService, extensionManagementService, logService) {
    this.remoteAgentService = remoteAgentService;
    this.environmentService = environmentService;
    this.userDataProfileService = userDataProfileService;
    this.remoteUserDataProfilesService = remoteUserDataProfilesService;
    this.activeLanguagePackService = activeLanguagePackService;
    this.extensionManagementService = extensionManagementService;
    this.logService = logService;
  }
  whenExtensionsReady() {
    return this.withChannel(
      (channel) => channel.call("whenExtensionsReady"),
      { failed: [] }
    );
  }
  async scanExtensions() {
    try {
      const languagePack = await this.activeLanguagePackService.getExtensionIdProvidingCurrentLocale();
      return await this.withChannel(
        async (channel) => {
          const profileLocation = this.userDataProfileService.currentProfile.isDefault ? void 0 : (await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile)).extensionsResource;
          const scannedExtensions = await channel.call("scanExtensions", [
            language,
            profileLocation,
            this.extensionManagementService.getInstalledWorkspaceExtensionLocations(),
            this.environmentService.extensionDevelopmentLocationURI,
            languagePack
          ]);
          scannedExtensions.forEach((extension) => {
            extension.extensionLocation = URI.revive(extension.extensionLocation);
          });
          return scannedExtensions;
        },
        []
      );
    } catch (error) {
      this.logService.error(error);
      return [];
    }
  }
  withChannel(callback, fallback2) {
    const connection = this.remoteAgentService.getConnection();
    if (!connection) {
      return Promise.resolve(fallback2);
    }
    return connection.withChannel(RemoteExtensionsScannerChannelName, (channel) => callback(channel));
  }
};

RemoteExtensionsScannerService = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IUserDataProfileService),
  __decorateParam(3, IRemoteUserDataProfilesService),
  __decorateParam(4, IActiveLanguagePackService),
  __decorateParam(5, IWorkbenchExtensionManagementService),
  __decorateParam(6, ILogService)
], RemoteExtensionsScannerService);

registerSingleton(IRemoteExtensionsScannerService, RemoteExtensionsScannerService, 1 /* Delayed */);
export { RemoteExtensionsScannerService };
