// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/userDataProfile/node/userDataProfile.ts
import { UserDataProfilesService } from "./module-0080.mjs";
import { isString } from "./module-0009.mjs";
import { URI } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStateReadService, IStateService } from "./module-0151.mjs";
import { IUriIdentityService } from "./module-0079.mjs";
import { INativeEnvironmentService } from "./module-0056.mjs";
import { IFileService } from "./module-0044.mjs";
import { ILogService } from "./module-0049.mjs";
import { StateService } from "./module-0143.mjs";


// src/vs/platform/userDataProfile/node/userDataProfile.ts
var UserDataProfilesReadonlyService = class extends UserDataProfilesService {
  constructor(stateReadonlyService, uriIdentityService, nativeEnvironmentService, fileService, logService) {
    super(nativeEnvironmentService, fileService, uriIdentityService, logService);
    this.stateReadonlyService = stateReadonlyService;
    this.nativeEnvironmentService = nativeEnvironmentService;
  }
  getStoredProfiles() {
    const storedProfilesState = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService.PROFILES_KEY, []);
    return storedProfilesState.map((p) => ({
      ...p,
      location: isString(p.location) ? this.uriIdentityService.extUri.joinPath(this.profilesHome, p.location) : URI.revive(p.location)
    }));
  }
  getStoredProfileAssociations() {
    return this.stateReadonlyService.getItem(UserDataProfilesReadonlyService.PROFILE_ASSOCIATIONS_KEY, {});
  }
  getDefaultProfileExtensionsLocation() {
    return this.uriIdentityService.extUri.joinPath(URI.file(this.nativeEnvironmentService.extensionsPath).with({ scheme: this.profilesHome.scheme }), "extensions.json");
  }
};

UserDataProfilesReadonlyService = __decorateClass([
  __decorateParam(0, IStateReadService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService)
], UserDataProfilesReadonlyService);

var UserDataProfilesService2 = class extends UserDataProfilesReadonlyService {
  constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
    super(stateService, uriIdentityService, environmentService, fileService, logService);
    this.stateService = stateService;
  }
  saveStoredProfiles(storedProfiles) {
    if (storedProfiles.length) {
      this.stateService.setItem(UserDataProfilesService2.PROFILES_KEY, storedProfiles.map((profile) => ({ ...profile, location: this.uriIdentityService.extUri.relativePath(this.profilesHome, profile.location) })));
    } else {
      this.stateService.removeItem(UserDataProfilesService2.PROFILES_KEY);
    }
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    if (storedProfileAssociations.emptyWindows || storedProfileAssociations.workspaces) {
      this.stateService.setItem(UserDataProfilesService2.PROFILE_ASSOCIATIONS_KEY, storedProfileAssociations);
    } else {
      this.stateService.removeItem(UserDataProfilesService2.PROFILE_ASSOCIATIONS_KEY);
    }
  }
};

UserDataProfilesService2 = __decorateClass([
  __decorateParam(0, IStateService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService)
], UserDataProfilesService2);

var ServerUserDataProfilesService = class extends UserDataProfilesService2 {
  constructor(uriIdentityService, environmentService, fileService, logService) {
    super(new StateService(0 /* IMMEDIATE */, environmentService, logService, fileService), uriIdentityService, environmentService, fileService, logService);
  }
  async init() {
    await this.stateService.init();
    return super.init();
  }
};

ServerUserDataProfilesService = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, INativeEnvironmentService),
  __decorateParam(2, IFileService),
  __decorateParam(3, ILogService)
], ServerUserDataProfilesService);
export { UserDataProfilesReadonlyService, UserDataProfilesService2, ServerUserDataProfilesService };
