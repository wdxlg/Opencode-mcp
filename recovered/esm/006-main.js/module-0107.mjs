// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/userDataProfile/node/userDataProfile.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IStateReadService, IStateService, init_state } from "./module-0095.mjs";
import { IUriIdentityService, init_uriIdentity } from "./module-0077.mjs";
import { UserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";
import { init_types, isString } from "./module-0016.mjs";
import { StateService, init_stateService } from "./module-0106.mjs";


// src/vs/platform/userDataProfile/node/userDataProfile.ts
var UserDataProfilesReadonlyService, UserDataProfilesService2, ServerUserDataProfilesService;

var init_userDataProfile2 = __esm({
  "src/vs/platform/userDataProfile/node/userDataProfile.ts"() {
    init_uri();
    init_environment();
    init_files();
    init_log();
    init_state();
    init_uriIdentity();
    init_userDataProfile();
    init_types();
    init_stateService();
    UserDataProfilesReadonlyService = class extends UserDataProfilesService {
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
    UserDataProfilesService2 = class extends UserDataProfilesReadonlyService {
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
    ServerUserDataProfilesService = class extends UserDataProfilesService2 {
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
  }
});
export { UserDataProfilesReadonlyService, UserDataProfilesService2, ServerUserDataProfilesService, init_userDataProfile2 };
