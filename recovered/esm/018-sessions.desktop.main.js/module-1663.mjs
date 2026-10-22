// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/userDataProfileManagement.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { CONFIG_NEW_WINDOW_PROFILE } from "./module-1113.mjs";
import { IWorkspaceContextService, isEmptyWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson } from "./module-0947.mjs";
import { equals4 } from "./module-0098.mjs";
import { CancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUserDataProfileManagementService, IUserDataProfileService } from "./module-0998.mjs";
import { IHostService } from "./module-1118.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userDataProfile/browser/userDataProfileManagement.ts
var UserDataProfileManagementService = class extends Disposable {
  constructor(userDataProfilesService, userDataProfileService, hostService, dialogService, workspaceContextService, extensionService, environmentService, productService, requestService, configurationService, uriIdentityService, logService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileService = userDataProfileService;
    this.hostService = hostService;
    this.dialogService = dialogService;
    this.workspaceContextService = workspaceContextService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.requestService = requestService;
    this.configurationService = configurationService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._register(userDataProfileService.onDidChangeCurrentProfile((e4) => this.onDidChangeCurrentProfile(e4)));
    this._register(userDataProfilesService.onDidChangeProfiles((e4) => {
      if (e4.removed.some((profile) => profile.id === this.userDataProfileService.currentProfile.id)) {
        const profileToUse = this.getProfileToUseForCurrentWorkspace();
        this.switchProfile(profileToUse);
        this.changeCurrentProfile(profileToUse, localize(23666, null));
        return;
      }
      const updatedCurrentProfile = e4.updated.find((p) => this.userDataProfileService.currentProfile.id === p.id);
      if (updatedCurrentProfile) {
        const profileToUse = this.getProfileToUseForCurrentWorkspace();
        if (profileToUse?.id !== updatedCurrentProfile.id) {
          this.switchProfile(profileToUse);
          this.changeCurrentProfile(profileToUse, localize(23667, null));
        } else {
          this.changeCurrentProfile(updatedCurrentProfile, localize(23668, null));
        }
      }
    }));
  }
  async onDidChangeCurrentProfile(e4) {
    if (e4.previous.isTransient) {
      await this.userDataProfilesService.cleanUpTransientProfiles();
    }
  }
  getWorkspaceUri() {
    const workspace = this.workspaceContextService.getWorkspace();
    return workspace.configuration ?? workspace.folders[0]?.uri;
  }
  getProfileToUseForCurrentWorkspace() {
    const workspaceUri = this.getWorkspaceUri();
    if (workspaceUri) {
      const profileForWorkspace = this.userDataProfilesService.profiles.find((profile) => profile.workspaces?.some((ws) => this.uriIdentityService.extUri.isEqual(ws, workspaceUri)));
      if (profileForWorkspace) {
        return profileForWorkspace;
      }
    } else {
      const currentProfile = this.userDataProfilesService.profiles.find((profile) => profile.id === this.userDataProfileService.currentProfile.id);
      if (currentProfile) {
        return currentProfile;
      }
    }
    return this.getDefaultProfileToUse();
  }
  getDefaultProfileToUse() {
    const newWindowProfileConfigValue = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
    if (newWindowProfileConfigValue) {
      const newWindowProfile = this.userDataProfilesService.profiles.find((profile) => profile.name === newWindowProfileConfigValue);
      if (newWindowProfile) {
        return newWindowProfile;
      }
    }
    return this.userDataProfilesService.defaultProfile;
  }
  async createProfile(name, options3) {
    return this.userDataProfilesService.createNamedProfile(name, options3);
  }
  async createAndEnterProfile(name, options3) {
    const profile = await this.userDataProfilesService.createNamedProfile(name, options3, toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
    await this.changeCurrentProfile(profile);
    return profile;
  }
  async createAndEnterTransientProfile() {
    const profile = await this.userDataProfilesService.createTransientProfile(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
    await this.changeCurrentProfile(profile);
    return profile;
  }
  async updateProfile(profile, updateOptions) {
    if (!this.userDataProfilesService.profiles.some((p) => p.id === profile.id)) {
      throw new Error(`Profile ${profile.name} does not exist`);
    }
    if (profile.isDefault) {
      throw new Error(localize(23663, null));
    }
    const updatedProfile = await this.userDataProfilesService.updateProfile(profile, updateOptions);
    return updatedProfile;
  }
  async removeProfile(profile) {
    if (!this.userDataProfilesService.profiles.some((p) => p.id === profile.id)) {
      throw new Error(`Profile ${profile.name} does not exist`);
    }
    if (profile.isDefault) {
      throw new Error(localize(23662, null));
    }
    await this.userDataProfilesService.removeProfile(profile);
  }
  async switchProfile(profile) {
    if (!this.userDataProfilesService.profiles.some((p) => p.id === profile.id)) {
      throw new Error(`Profile ${profile.name} does not exist`);
    }
    if (this.userDataProfileService.currentProfile.id === profile.id) {
      return;
    }
    const workspaceUri = this.getWorkspaceUri();
    if (workspaceUri && profile.workspaces?.some((ws) => this.uriIdentityService.extUri.isEqual(ws, workspaceUri))) {
      return;
    }
    const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceContextService.getWorkspace());
    await this.userDataProfilesService.setProfileForWorkspace(workspaceIdentifier, profile);
    if (isEmptyWorkspaceIdentifier(workspaceIdentifier)) {
      await this.changeCurrentProfile(profile);
    }
  }
  async getBuiltinProfileTemplates() {
    if (this.productService.profileTemplatesUrl) {
      try {
        const context2 = await this.requestService.request({ type: "GET", url: this.productService.profileTemplatesUrl, callSite: "userDataProfileManagement.getProfileTemplates" }, CancellationToken.None);
        if (context2.res.statusCode === 200) {
          return await asJson(context2) || [];
        } else {
          this.logService.error("Could not get profile templates.", context2.res.statusCode);
        }
      } catch (error) {
        this.logService.error(error);
      }
    }
    return [];
  }
  async changeCurrentProfile(profile, reloadMessage) {
    const isRemoteWindow = !!this.environmentService.remoteAuthority;
    const shouldRestartExtensionHosts = this.userDataProfileService.currentProfile.id !== profile.id || !equals4(this.userDataProfileService.currentProfile.useDefaultFlags, profile.useDefaultFlags);
    if (shouldRestartExtensionHosts) {
      if (!isRemoteWindow) {
        if (!await this.extensionService.stopExtensionHosts(localize(23669, null))) {
          if (this.userDataProfilesService.profiles.some((p) => p.id === this.userDataProfileService.currentProfile.id)) {
            await this.userDataProfilesService.setProfileForWorkspace(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()), this.userDataProfileService.currentProfile);
          }
          throw new CancellationError();
        }
      }
    }
    await this.userDataProfileService.updateCurrentProfile(profile);
    if (shouldRestartExtensionHosts) {
      if (isRemoteWindow) {
        const { confirmed } = await this.dialogService.confirm({
          message: reloadMessage ?? localize(23665, null),
          primaryButton: localize(23664, null)
        });
        if (confirmed) {
          await this.hostService.reload();
        }
      } else {
        await this.extensionService.startExtensionHosts();
      }
    }
  }
};

UserDataProfileManagementService = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IRequestService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IUriIdentityService),
  __decorateParam(11, ILogService)
], UserDataProfileManagementService);

registerSingleton(
  IUserDataProfileManagementService,
  UserDataProfileManagementService,
  0 /* Eager */
  /* Eager because it updates the current window profile by listening to profiles changes */
);
export { UserDataProfileManagementService };
