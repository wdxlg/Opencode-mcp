// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataProfile/common/userDataProfile.ts
import { URI } from "./module-0032.mjs";
import { createDecorator } from "./module-0077.mjs";
import { basename2, joinPath } from "./module-0034.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isString } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { hash } from "./module-0039.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Promises } from "./module-0036.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/userDataProfile/common/userDataProfile.ts
var AGENTS_WINDOW_PROFILE_ID = "agents";

var AGENTS_WINDOW_PROFILE_FLAGS = {
  settings: true,
  keybindings: true,
  prompts: true,
  mcp: true,
  languageModels: true,
  snippets: true,
  tasks: true,
  extensions: true
};

function isUserDataProfile(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && typeof candidate.id === "string" && typeof candidate.isDefault === "boolean" && typeof candidate.name === "string" && URI.isUri(candidate.location) && URI.isUri(candidate.globalStorageHome) && URI.isUri(candidate.settingsResource) && URI.isUri(candidate.keybindingsResource) && URI.isUri(candidate.tasksResource) && URI.isUri(candidate.snippetsHome) && URI.isUri(candidate.promptsHome) && URI.isUri(candidate.extensionsResource) && URI.isUri(candidate.mcpResource) && URI.isUri(candidate.languageModelsResource) && URI.isUri(candidate.agentPluginsHome));
}

var IUserDataProfilesService = createDecorator("IUserDataProfilesService");

function reviveProfile(profile, scheme) {
  return {
    id: profile.id,
    isDefault: profile.isDefault,
    name: profile.name,
    icon: profile.icon,
    location: URI.revive(profile.location).with({ scheme }),
    globalStorageHome: URI.revive(profile.globalStorageHome).with({ scheme }),
    settingsResource: URI.revive(profile.settingsResource).with({ scheme }),
    keybindingsResource: URI.revive(profile.keybindingsResource).with({ scheme }),
    tasksResource: URI.revive(profile.tasksResource).with({ scheme }),
    snippetsHome: URI.revive(profile.snippetsHome).with({ scheme }),
    promptsHome: URI.revive(profile.promptsHome).with({ scheme }),
    extensionsResource: URI.revive(profile.extensionsResource).with({ scheme }),
    mcpResource: URI.revive(profile.mcpResource).with({ scheme }),
    languageModelsResource: URI.revive(profile.languageModelsResource).with({ scheme }),
    agentPluginsHome: URI.revive(profile.agentPluginsHome),
    cacheHome: URI.revive(profile.cacheHome).with({ scheme }),
    useDefaultFlags: profile.useDefaultFlags,
    isTransient: profile.isTransient,
    isInternal: profile.isInternal,
    isAgentsWindowProfile: profile.isAgentsWindowProfile,
    workspaces: profile.workspaces?.map((w) => URI.revive(w))
  };
}

function toUserDataProfile(id2, name, location2, profilesCacheHome, options3, defaultProfile) {
  const isAgentsWindowProfile = id2 === AGENTS_WINDOW_PROFILE_ID;
  return {
    id: id2,
    name,
    location: location2,
    isDefault: false,
    icon: options3?.icon,
    globalStorageHome: defaultProfile && options3?.useDefaultFlags?.globalState ? defaultProfile.globalStorageHome : joinPath(location2, "globalStorage"),
    settingsResource: defaultProfile && options3?.useDefaultFlags?.settings ? defaultProfile.settingsResource : joinPath(location2, "settings.json"),
    keybindingsResource: defaultProfile && options3?.useDefaultFlags?.keybindings ? defaultProfile.keybindingsResource : joinPath(location2, "keybindings.json"),
    tasksResource: defaultProfile && options3?.useDefaultFlags?.tasks ? defaultProfile.tasksResource : joinPath(location2, "tasks.json"),
    snippetsHome: defaultProfile && options3?.useDefaultFlags?.snippets ? defaultProfile.snippetsHome : joinPath(location2, "snippets"),
    promptsHome: defaultProfile && options3?.useDefaultFlags?.prompts ? defaultProfile.promptsHome : joinPath(location2, "prompts"),
    extensionsResource: defaultProfile && options3?.useDefaultFlags?.extensions ? defaultProfile.extensionsResource : joinPath(location2, "extensions.json"),
    mcpResource: defaultProfile && options3?.useDefaultFlags?.mcp ? defaultProfile.mcpResource : joinPath(location2, "mcp.json"),
    languageModelsResource: defaultProfile && options3?.useDefaultFlags?.languageModels ? defaultProfile.languageModelsResource : joinPath(location2, "chatLanguageModels.json"),
    agentPluginsHome: defaultProfile ? defaultProfile.agentPluginsHome : joinPath(location2, "agent-plugins"),
    cacheHome: joinPath(profilesCacheHome, id2),
    useDefaultFlags: options3?.useDefaultFlags,
    isTransient: options3?.transient,
    isInternal: isAgentsWindowProfile || options3?.transient,
    isAgentsWindowProfile,
    workspaces: options3?.workspaces
  };
}

var SYSTEM_PROFILES_HOME = "builtin";

var UserDataProfilesService = class extends Disposable {
  constructor(environmentService, fileService, uriIdentityService, logService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._onDidChangeProfiles = this._register(new Emitter());
    this.onDidChangeProfiles = this._onDidChangeProfiles.event;
    this._onWillCreateProfile = this._register(new Emitter());
    this.onWillCreateProfile = this._onWillCreateProfile.event;
    this._onWillRemoveProfile = this._register(new Emitter());
    this.onWillRemoveProfile = this._onWillRemoveProfile.event;
    this._onDidResetWorkspaces = this._register(new Emitter());
    this.onDidResetWorkspaces = this._onDidResetWorkspaces.event;
    this.profileCreationPromises = /* @__PURE__ */ new Map();
    this.transientProfilesObject = {
      profiles: [],
      emptyWindows: /* @__PURE__ */ new Map()
    };
    this.profilesHome = joinPath(this.environmentService.userRoamingDataHome, "profiles");
    this.profilesCacheHome = joinPath(this.environmentService.cacheHome, "CachedProfilesData");
  }
  static {
    this.PROFILES_KEY = "userDataProfiles";
  }
  static {
    this.PROFILE_ASSOCIATIONS_KEY = "profileAssociations";
  }
  get defaultProfile() {
    return this.profiles[0];
  }
  get profiles() {
    return [...this.profilesObject.profiles, ...this.transientProfilesObject.profiles];
  }
  init() {
    this._profilesObject = void 0;
  }
  get profilesObject() {
    if (!this._profilesObject) {
      const defaultProfile = this.createDefaultProfile();
      const profiles2 = [defaultProfile];
      try {
        for (const storedProfile of this.getStoredProfiles()) {
          if (this.isInvalidProfile(storedProfile)) {
            this.logService.warn("Skipping the invalid stored profile", storedProfile.location || storedProfile.name);
            continue;
          }
          const id2 = basename2(storedProfile.location);
          profiles2.push(toUserDataProfile(
            id2,
            storedProfile.name,
            storedProfile.location,
            this.profilesCacheHome,
            {
              icon: storedProfile.icon,
              useDefaultFlags: id2 === AGENTS_WINDOW_PROFILE_ID ? AGENTS_WINDOW_PROFILE_FLAGS : storedProfile.useDefaultFlags
            },
            defaultProfile
          ));
        }
      } catch (error) {
        this.logService.error(error);
      }
      const emptyWindows = /* @__PURE__ */ new Map();
      if (profiles2.length) {
        try {
          const profileAssociaitions = this.getStoredProfileAssociations();
          if (profileAssociaitions.workspaces) {
            for (const [workspacePath, profileId] of Object.entries(profileAssociaitions.workspaces)) {
              const workspace = URI.parse(workspacePath);
              const profile = profiles2.find((p) => p.id === profileId);
              if (profile) {
                const workspaces = profile.workspaces ? profile.workspaces.slice(0) : [];
                workspaces.push(workspace);
                profile.workspaces = workspaces;
              }
            }
          }
          if (profileAssociaitions.emptyWindows) {
            for (const [windowId, profileId] of Object.entries(profileAssociaitions.emptyWindows)) {
              const profile = profiles2.find((p) => p.id === profileId);
              if (profile) {
                emptyWindows.set(windowId, profile);
              }
            }
          }
        } catch (error) {
          this.logService.error(error);
        }
      }
      this._profilesObject = { profiles: profiles2, emptyWindows };
    }
    return this._profilesObject;
  }
  isInvalidProfile(storedProfile) {
    if (!storedProfile.name) {
      return true;
    }
    if (!isString(storedProfile.name)) {
      return true;
    }
    if (!storedProfile.location) {
      return true;
    }
    return false;
  }
  createDefaultProfile() {
    const defaultProfile = toUserDataProfile("__default__profile__", localize(3678, null), this.environmentService.userRoamingDataHome, this.profilesCacheHome);
    return { ...defaultProfile, extensionsResource: this.getDefaultProfileExtensionsLocation() ?? defaultProfile.extensionsResource, isDefault: true };
  }
  async createTransientProfile(workspaceIdentifier) {
    const namePrefix = `Temp`;
    const nameRegEx = new RegExp(`${escapeRegExpCharacters(namePrefix)}\\s(\\d+)`);
    let nameIndex = 0;
    for (const profile of this.profiles) {
      const matches2 = nameRegEx.exec(profile.name);
      const index2 = matches2 ? parseInt(matches2[1]) : 0;
      nameIndex = index2 > nameIndex ? index2 : nameIndex;
    }
    const name = `${namePrefix} ${nameIndex + 1}`;
    return this.createProfile(hash(generateUuid()).toString(16), name, { transient: true }, workspaceIdentifier);
  }
  async createNamedProfile(name, options3, workspaceIdentifier) {
    return this.createProfile(hash(generateUuid()).toString(16), name, options3, workspaceIdentifier);
  }
  async createProfile(id2, name, options3, workspaceIdentifier) {
    const profile = await this.doCreateProfile(id2, name, options3, workspaceIdentifier);
    return profile;
  }
  async doCreateProfile(id2, name, options3, workspaceIdentifier) {
    if (!isString(name) || !name) {
      throw new Error("Name of the profile is mandatory and must be of type `string`");
    }
    let profileCreationPromise = this.profileCreationPromises.get(name);
    if (!profileCreationPromise) {
      profileCreationPromise = (async () => {
        try {
          const existing = this.profiles.find((p) => p.id === id2 || id2 !== AGENTS_WINDOW_PROFILE_ID && !p.isTransient && !options3?.transient && p.name === name);
          if (existing) {
            throw new Error(`Profile with ${name} name already exists`);
          }
          const workspace = workspaceIdentifier ? this.getWorkspace(workspaceIdentifier) : void 0;
          if (URI.isUri(workspace)) {
            options3 = { ...options3, workspaces: [workspace] };
          }
          const profile = toUserDataProfile(
            id2,
            name,
            this.uriIdentityService.extUri.joinPath(this.profilesHome, ...id2 === AGENTS_WINDOW_PROFILE_ID ? [SYSTEM_PROFILES_HOME, id2] : [id2]),
            this.profilesCacheHome,
            id2 === AGENTS_WINDOW_PROFILE_ID ? {} : options3,
            this.defaultProfile
          );
          await this.fileService.createFolder(profile.location);
          const joiners = [];
          this._onWillCreateProfile.fire({
            profile,
            join(promise) {
              joiners.push(promise);
            }
          });
          await Promises.settled(joiners);
          if (workspace && !URI.isUri(workspace)) {
            this.updateEmptyWindowAssociation(workspace, profile, !!profile.isTransient);
          }
          this.updateProfiles([profile], [], []);
          return this.profiles.find((p) => p.id === profile.id) ?? profile;
        } finally {
          this.profileCreationPromises.delete(name);
        }
      })();
      this.profileCreationPromises.set(name, profileCreationPromise);
    }
    return profileCreationPromise;
  }
  async updateProfile(profile, options3) {
    if (profile.isAgentsWindowProfile) {
      throw new Error("Cannot update agents window profile");
    }
    const profilesToUpdate = [];
    for (const existing of this.profiles) {
      let profileToUpdate;
      if (profile.id === existing.id) {
        if (!existing.isDefault) {
          profileToUpdate = toUserDataProfile(existing.id, options3.name ?? existing.name, existing.location, this.profilesCacheHome, {
            icon: options3.icon === null ? void 0 : options3.icon ?? existing.icon,
            transient: options3.transient ?? existing.isTransient,
            useDefaultFlags: options3.useDefaultFlags ?? existing.useDefaultFlags,
            workspaces: options3.workspaces ?? existing.workspaces
          }, this.defaultProfile);
        } else if (options3.workspaces) {
          profileToUpdate = existing;
          profileToUpdate.workspaces = options3.workspaces;
        }
      } else if (options3.workspaces) {
        const workspaces = existing.workspaces?.filter((w1) => !options3.workspaces?.some((w2) => this.uriIdentityService.extUri.isEqual(w1, w2)));
        if (existing.workspaces?.length !== workspaces?.length) {
          profileToUpdate = existing;
          profileToUpdate.workspaces = workspaces;
        }
      }
      if (profileToUpdate) {
        profilesToUpdate.push(profileToUpdate);
      }
    }
    if (!profilesToUpdate.length) {
      if (profile.isDefault) {
        throw new Error("Cannot update default profile");
      }
      throw new Error(`Profile '${profile.name}' does not exist`);
    }
    this.updateProfiles([], [], profilesToUpdate);
    const updatedProfile = this.profiles.find((p) => p.id === profile.id);
    if (!updatedProfile) {
      throw new Error(`Profile '${profile.name}' was not updated`);
    }
    return updatedProfile;
  }
  async removeProfile(profileToRemove) {
    if (profileToRemove.isDefault) {
      throw new Error("Cannot remove default profile");
    }
    const profile = this.profiles.find((p) => p.id === profileToRemove.id);
    if (!profile) {
      throw new Error(`Profile '${profileToRemove.name}' does not exist`);
    }
    const joiners = [];
    this._onWillRemoveProfile.fire({
      profile,
      join(promise) {
        joiners.push(promise);
      }
    });
    try {
      await Promise.allSettled(joiners);
    } catch (error) {
      this.logService.error(error);
    }
    this.updateProfiles([], [profile], []);
    try {
      await this.fileService.del(profile.cacheHome, { recursive: true });
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(error);
      }
    }
  }
  async setProfileForWorkspace(workspaceIdentifier, profileToSet) {
    const profile = this.profiles.find((p) => p.id === profileToSet.id);
    if (!profile) {
      throw new Error(`Profile '${profileToSet.name}' does not exist`);
    }
    const workspace = this.getWorkspace(workspaceIdentifier);
    if (URI.isUri(workspace)) {
      const workspaces = profile.workspaces ? [...profile.workspaces] : [];
      if (!workspaces.some((w) => this.uriIdentityService.extUri.isEqual(w, workspace))) {
        workspaces.push(workspace);
        await this.updateProfile(profile, { workspaces });
      }
    } else {
      this.updateEmptyWindowAssociation(workspace, profile, false);
      this.updateStoredProfiles(this.profiles);
    }
  }
  unsetWorkspace(workspaceIdentifier, transient = false) {
    const workspace = this.getWorkspace(workspaceIdentifier);
    if (URI.isUri(workspace)) {
      const currentlyAssociatedProfile = this.getProfileForWorkspace(workspaceIdentifier);
      if (currentlyAssociatedProfile) {
        this.updateProfile(currentlyAssociatedProfile, { workspaces: currentlyAssociatedProfile.workspaces?.filter((w) => !this.uriIdentityService.extUri.isEqual(w, workspace)) });
      }
    } else {
      this.updateEmptyWindowAssociation(workspace, void 0, transient);
      this.updateStoredProfiles(this.profiles);
    }
  }
  async resetWorkspaces() {
    this.transientProfilesObject.emptyWindows.clear();
    this.profilesObject.emptyWindows.clear();
    for (const profile of this.profiles) {
      profile.workspaces = void 0;
    }
    this.updateProfiles([], [], this.profiles);
    this._onDidResetWorkspaces.fire();
  }
  async cleanUp() {
    try {
      if (await this.fileService.exists(this.profilesHome)) {
        const stat = await this.fileService.resolve(this.profilesHome);
        await Promise.all((stat.children || []).filter((child) => child.isDirectory && child.name !== SYSTEM_PROFILES_HOME && this.profiles.every((p) => !this.uriIdentityService.extUri.isEqual(p.location, child.resource))).map((child) => this.fileService.del(child.resource, { recursive: true })));
      }
    } catch (error) {
      this.logService.error("Error deleting redundant profile folders", error);
    }
    try {
      const existing = this.getStoredProfiles();
      const valid2 = [];
      for (const storedProfile of this.getStoredProfiles()) {
        if (this.isInvalidProfile(storedProfile)) {
          this.logService.warn(`Invalid user data profile found: ${storedProfile.name}`);
        } else {
          valid2.push(storedProfile);
        }
      }
      if (existing.length !== valid2.length) {
        this.saveStoredProfiles(valid2);
      }
    } catch (error) {
      this.logService.error("Error removing invalid stored profiles", error);
    }
  }
  async cleanUpTransientProfiles() {
    const unAssociatedTransientProfiles = this.transientProfilesObject.profiles.filter((p) => !this.isProfileAssociatedToWorkspace(p));
    await Promise.allSettled(unAssociatedTransientProfiles.map((p) => this.removeProfile(p)));
  }
  getProfileForWorkspace(workspaceIdentifier) {
    const workspace = this.getWorkspace(workspaceIdentifier);
    if (URI.isUri(workspace) && this.uriIdentityService.extUri.isEqual(workspace, this.environmentService.agentSessionsWorkspace)) {
      return this.profiles.find((p) => p.isAgentsWindowProfile);
    }
    return URI.isUri(workspace) ? this.profiles.find((p) => p.workspaces?.some((w) => this.uriIdentityService.extUri.isEqual(w, workspace))) : this.profilesObject.emptyWindows.get(workspace) ?? this.transientProfilesObject.emptyWindows.get(workspace);
  }
  getWorkspace(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return workspaceIdentifier.uri;
    }
    if (isWorkspaceIdentifier(workspaceIdentifier)) {
      return workspaceIdentifier.configPath;
    }
    return workspaceIdentifier.id;
  }
  isProfileAssociatedToWorkspace(profile) {
    if (profile.workspaces?.length) {
      return true;
    }
    if ([...this.profilesObject.emptyWindows.values()].some((windowProfile) => this.uriIdentityService.extUri.isEqual(windowProfile.location, profile.location))) {
      return true;
    }
    if ([...this.transientProfilesObject.emptyWindows.values()].some((windowProfile) => this.uriIdentityService.extUri.isEqual(windowProfile.location, profile.location))) {
      return true;
    }
    return false;
  }
  updateProfiles(added, removed, updated, donotTrigger = false) {
    const allProfiles = [...this.profiles, ...added];
    const transientProfiles = this.transientProfilesObject.profiles;
    this.transientProfilesObject.profiles = [];
    const profiles2 = [];
    for (let profile of allProfiles) {
      if (removed.some((p) => profile.id === p.id)) {
        for (const windowId of [...this.profilesObject.emptyWindows.keys()]) {
          if (profile.id === this.profilesObject.emptyWindows.get(windowId)?.id) {
            this.profilesObject.emptyWindows.delete(windowId);
          }
        }
        continue;
      }
      if (!profile.isDefault) {
        profile = updated.find((p) => profile.id === p.id) ?? profile;
        const transientProfile = transientProfiles.find((p) => profile.id === p.id);
        if (profile.isTransient) {
          this.transientProfilesObject.profiles.push(profile);
        } else {
          if (transientProfile) {
            for (const [windowId, p] of this.transientProfilesObject.emptyWindows.entries()) {
              if (profile.id === p.id) {
                this.transientProfilesObject.emptyWindows.delete(windowId);
                this.profilesObject.emptyWindows.set(windowId, profile);
                break;
              }
            }
          }
        }
      }
      if (profile.workspaces?.length === 0) {
        profile.workspaces = void 0;
      }
      profiles2.push(profile);
    }
    this.updateStoredProfiles(profiles2);
    if (!donotTrigger) {
      this.triggerProfilesChanges(added, removed, updated);
    }
  }
  triggerProfilesChanges(added, removed, updated) {
    this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
  }
  updateEmptyWindowAssociation(windowId, newProfile, transient) {
    transient = newProfile?.isTransient ? true : transient;
    if (transient) {
      if (newProfile) {
        this.transientProfilesObject.emptyWindows.set(windowId, newProfile);
      } else {
        this.transientProfilesObject.emptyWindows.delete(windowId);
      }
    } else {
      this.transientProfilesObject.emptyWindows.delete(windowId);
      if (newProfile) {
        this.profilesObject.emptyWindows.set(windowId, newProfile);
      } else {
        this.profilesObject.emptyWindows.delete(windowId);
      }
    }
  }
  updateStoredProfiles(profiles2) {
    const storedProfiles = [];
    const workspaces = {};
    const emptyWindows = {};
    for (const profile of profiles2) {
      if (profile.isTransient) {
        continue;
      }
      if (!profile.isDefault) {
        storedProfiles.push({
          location: profile.location,
          name: profile.name,
          icon: profile.icon,
          useDefaultFlags: profile.useDefaultFlags
        });
      }
      if (profile.workspaces) {
        for (const workspace of profile.workspaces) {
          workspaces[workspace.toString()] = profile.id;
        }
      }
    }
    for (const [windowId, profile] of this.profilesObject.emptyWindows.entries()) {
      emptyWindows[windowId.toString()] = profile.id;
    }
    this.saveStoredProfileAssociations({ workspaces, emptyWindows });
    this.saveStoredProfiles(storedProfiles);
    this._profilesObject = void 0;
  }
  getStoredProfiles() {
    return [];
  }
  saveStoredProfiles(storedProfiles) {
    throw new Error("not implemented");
  }
  getStoredProfileAssociations() {
    return {};
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    throw new Error("not implemented");
  }
  getDefaultProfileExtensionsLocation() {
    return void 0;
  }
};

UserDataProfilesService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], UserDataProfilesService);
export { isUserDataProfile, reviveProfile, toUserDataProfile, AGENTS_WINDOW_PROFILE_ID, AGENTS_WINDOW_PROFILE_FLAGS, IUserDataProfilesService, SYSTEM_PROFILES_HOME, UserDataProfilesService };
