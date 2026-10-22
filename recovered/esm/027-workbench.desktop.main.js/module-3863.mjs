// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/common/remoteExtensionManagementService.ts
import { ProfileAwareExtensionManagementChannelClient } from "./module-3862.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IAllowedExtensionsService } from "./module-0872.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IRemoteUserDataProfilesService } from "./module-1203.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/services/extensionManagement/common/remoteExtensionManagementService.ts
var RemoteExtensionManagementService = class extends ProfileAwareExtensionManagementChannelClient {
  constructor(channel, productService, allowedExtensionsService, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService) {
    super(channel, productService, allowedExtensionsService, userDataProfileService, uriIdentityService);
    this.userDataProfilesService = userDataProfilesService;
    this.remoteUserDataProfilesService = remoteUserDataProfilesService;
  }
  async filterEvent(profileLocation, applicationScoped) {
    if (applicationScoped) {
      return true;
    }
    if (!profileLocation && this.userDataProfileService.currentProfile.isDefault) {
      return true;
    }
    const currentRemoteProfile = await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile);
    if (this.uriIdentityService.extUri.isEqual(currentRemoteProfile.extensionsResource, profileLocation)) {
      return true;
    }
    return false;
  }
  async getProfileLocation(profileLocation) {
    if (!profileLocation && this.userDataProfileService.currentProfile.isDefault) {
      return void 0;
    }
    profileLocation = await super.getProfileLocation(profileLocation);
    let profile = this.userDataProfilesService.profiles.find((p) => this.uriIdentityService.extUri.isEqual(p.extensionsResource, profileLocation));
    if (profile) {
      profile = await this.remoteUserDataProfilesService.getRemoteProfile(profile);
    } else {
      profile = (await this.remoteUserDataProfilesService.getRemoteProfiles()).find((p) => this.uriIdentityService.extUri.isEqual(p.extensionsResource, profileLocation));
    }
    return profile?.extensionsResource;
  }
  async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
    const remoteProfiles = await this.remoteUserDataProfilesService.getRemoteProfiles();
    const previousProfile = remoteProfiles.find((p) => this.uriIdentityService.extUri.isEqual(p.extensionsResource, previousProfileLocation));
    const currentProfile = remoteProfiles.find((p) => this.uriIdentityService.extUri.isEqual(p.extensionsResource, currentProfileLocation));
    if (previousProfile?.id === currentProfile?.id) {
      return { added: [], removed: [] };
    }
    return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
  }
};

RemoteExtensionManagementService = __decorateClass([
  __decorateParam(1, IProductService),
  __decorateParam(2, IAllowedExtensionsService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IRemoteUserDataProfilesService),
  __decorateParam(6, IUriIdentityService)
], RemoteExtensionManagementService);
export { RemoteExtensionManagementService };
