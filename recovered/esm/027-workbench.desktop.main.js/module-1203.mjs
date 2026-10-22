// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/common/remoteUserDataProfiles.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { UserDataProfilesService2 } from "./module-1202.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userDataProfile/common/remoteUserDataProfiles.ts
var associatedRemoteProfilesKey = "associatedRemoteProfiles";

var IRemoteUserDataProfilesService = createDecorator("IRemoteUserDataProfilesService");

var RemoteUserDataProfilesService = class extends Disposable {
  constructor(environmentService, remoteAgentService, userDataProfilesService, userDataProfileService, storageService, logService) {
    super();
    this.environmentService = environmentService;
    this.remoteAgentService = remoteAgentService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileService = userDataProfileService;
    this.storageService = storageService;
    this.logService = logService;
    this.initPromise = this.init();
  }
  async init() {
    const connection = this.remoteAgentService.getConnection();
    if (!connection) {
      return;
    }
    const environment = await this.remoteAgentService.getEnvironment();
    if (!environment) {
      return;
    }
    this.remoteUserDataProfilesService = new UserDataProfilesService2(environment.profiles.all, environment.profiles.home, connection.getChannel("userDataProfiles"));
    this._register(this.userDataProfilesService.onDidChangeProfiles((e) => this.onDidChangeLocalProfiles(e)));
    const remoteProfile = await this.getAssociatedRemoteProfile(this.userDataProfileService.currentProfile, this.remoteUserDataProfilesService);
    if (!remoteProfile.isDefault) {
      this.setAssociatedRemoteProfiles([...this.getAssociatedRemoteProfiles(), remoteProfile.id]);
    }
    this.cleanUp();
  }
  async onDidChangeLocalProfiles(e) {
    for (const profile of e.removed) {
      const remoteProfile = this.remoteUserDataProfilesService?.profiles.find((p) => p.id === profile.id);
      if (remoteProfile) {
        await this.remoteUserDataProfilesService?.removeProfile(remoteProfile);
      }
    }
  }
  async getRemoteProfiles() {
    await this.initPromise;
    if (!this.remoteUserDataProfilesService) {
      throw new ErrorNoTelemetry("Remote profiles service not available in the current window");
    }
    return this.remoteUserDataProfilesService.profiles;
  }
  async getRemoteProfile(localProfile) {
    await this.initPromise;
    if (!this.remoteUserDataProfilesService) {
      throw new ErrorNoTelemetry("Remote profiles service not available in the current window");
    }
    return this.getAssociatedRemoteProfile(localProfile, this.remoteUserDataProfilesService);
  }
  async getAssociatedRemoteProfile(localProfile, remoteUserDataProfilesService) {
    if (localProfile.isDefault) {
      return remoteUserDataProfilesService.defaultProfile;
    }
    let profile = remoteUserDataProfilesService.profiles.find((p) => p.id === localProfile.id);
    if (!profile) {
      profile = await remoteUserDataProfilesService.createProfile(localProfile.id, localProfile.name, {
        transient: localProfile.isTransient,
        useDefaultFlags: localProfile.useDefaultFlags
      });
      this.setAssociatedRemoteProfiles([...this.getAssociatedRemoteProfiles(), this.userDataProfileService.currentProfile.id]);
    }
    return profile;
  }
  getAssociatedRemoteProfiles() {
    if (this.environmentService.remoteAuthority) {
      const remotes = this.parseAssociatedRemoteProfiles();
      return remotes[this.environmentService.remoteAuthority] ?? [];
    }
    return [];
  }
  setAssociatedRemoteProfiles(profiles2) {
    if (this.environmentService.remoteAuthority) {
      const remotes = this.parseAssociatedRemoteProfiles();
      profiles2 = distinct(profiles2);
      if (profiles2.length) {
        remotes[this.environmentService.remoteAuthority] = profiles2;
      } else {
        delete remotes[this.environmentService.remoteAuthority];
      }
      if (Object.keys(remotes).length) {
        this.storageService.store(associatedRemoteProfilesKey, JSON.stringify(remotes), -1 /* APPLICATION */, 1 /* MACHINE */);
      } else {
        this.storageService.remove(associatedRemoteProfilesKey, -1 /* APPLICATION */);
      }
    }
  }
  parseAssociatedRemoteProfiles() {
    if (this.environmentService.remoteAuthority) {
      const value2 = this.storageService.get(associatedRemoteProfilesKey, -1 /* APPLICATION */);
      try {
        return value2 ? JSON.parse(value2) : {};
      } catch (error) {
        this.logService.error(error);
      }
    }
    return {};
  }
  async cleanUp() {
    const associatedRemoteProfiles = [];
    for (const profileId of this.getAssociatedRemoteProfiles()) {
      const remoteProfile = this.remoteUserDataProfilesService?.profiles.find((p) => p.id === profileId);
      if (!remoteProfile) {
        continue;
      }
      const localProfile = this.userDataProfilesService.profiles.find((p) => p.id === profileId);
      if (localProfile) {
        if (localProfile.name !== remoteProfile.name) {
          await this.remoteUserDataProfilesService?.updateProfile(remoteProfile, { name: localProfile.name });
        }
        associatedRemoteProfiles.push(profileId);
        continue;
      }
      if (remoteProfile) {
        await this.remoteUserDataProfilesService?.removeProfile(remoteProfile);
      }
    }
    this.setAssociatedRemoteProfiles(associatedRemoteProfiles);
  }
};

RemoteUserDataProfilesService = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ILogService)
], RemoteUserDataProfilesService);

registerSingleton(IRemoteUserDataProfilesService, RemoteUserDataProfilesService, 1 /* Delayed */);
export { associatedRemoteProfilesKey, IRemoteUserDataProfilesService, RemoteUserDataProfilesService };
