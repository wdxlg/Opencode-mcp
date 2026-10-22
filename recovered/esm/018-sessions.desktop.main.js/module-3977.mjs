// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/electron-browser/nativeExtensionManagementService.ts
import { ProfileAwareExtensionManagementChannelClient } from "./module-3974.mjs";
import { Schemas } from "./module-0033.mjs";
import { joinPath } from "./module-0034.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ExtensionIdentifier, isResolverExtension } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IAllowedExtensionsService } from "./module-0874.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDownloadService } from "./module-1283.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/services/extensionManagement/electron-browser/nativeExtensionManagementService.ts
var NativeExtensionManagementService = class extends ProfileAwareExtensionManagementChannelClient {
  constructor(channel, productService, allowedExtensionsService, userDataProfileService, uriIdentityService, fileService, downloadService, nativeEnvironmentService, logService) {
    super(channel, productService, allowedExtensionsService, userDataProfileService, uriIdentityService);
    this.fileService = fileService;
    this.downloadService = downloadService;
    this.nativeEnvironmentService = nativeEnvironmentService;
    this.logService = logService;
  }
  filterEvent(profileLocation, isApplicationScoped) {
    return isApplicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
  }
  async install(vsix, options3) {
    const { location: location2, cleanup } = await this.downloadVsix(vsix);
    try {
      return await super.install(location2, options3);
    } finally {
      await cleanup();
    }
  }
  async downloadVsix(vsix) {
    if (vsix.scheme === Schemas.file) {
      return { location: vsix, async cleanup() {
      } };
    }
    this.logService.trace("Downloading extension from", vsix.toString());
    const location2 = joinPath(this.nativeEnvironmentService.extensionsDownloadLocation, generateUuid());
    await this.downloadService.download(vsix, location2, "extensionManagement.downloadNativeVsix");
    this.logService.info("Downloaded extension to", location2.toString());
    const cleanup = async () => {
      try {
        await this.fileService.del(location2);
      } catch (error) {
        this.logService.error(error);
      }
    };
    return { location: location2, cleanup };
  }
  async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
    if (this.nativeEnvironmentService.remoteAuthority) {
      const previousInstalledExtensions = await this.getInstalled(1 /* User */, previousProfileLocation);
      const resolverExtension = previousInstalledExtensions.find((e4) => isResolverExtension(e4.manifest, this.nativeEnvironmentService.remoteAuthority));
      if (resolverExtension) {
        if (!preserveExtensions) {
          preserveExtensions = [];
        }
        preserveExtensions.push(new ExtensionIdentifier(resolverExtension.identifier.id));
      }
    }
    return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
  }
};

NativeExtensionManagementService = __decorateClass([
  __decorateParam(1, IProductService),
  __decorateParam(2, IAllowedExtensionsService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IDownloadService),
  __decorateParam(7, INativeWorkbenchEnvironmentService),
  __decorateParam(8, ILogService)
], NativeExtensionManagementService);
export { NativeExtensionManagementService };
