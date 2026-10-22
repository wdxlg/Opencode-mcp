// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataProfile/common/userDataProfileIpc.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { reviveProfile } from "./module-0095.mjs";


// src/vs/platform/userDataProfile/common/userDataProfileIpc.ts
var UserDataProfilesService2 = class extends Disposable {
  constructor(profiles, profilesHome, channel) {
    super();
    this.profilesHome = profilesHome;
    this.channel = channel;
    this._profiles = [];
    this._onDidChangeProfiles = this._register(new Emitter());
    this.onDidChangeProfiles = this._onDidChangeProfiles.event;
    this._profiles = profiles.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
    this._register(this.channel.listen("onDidChangeProfiles")((e) => {
      const added = e.added.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      const removed = e.removed.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      const updated = e.updated.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      this._profiles = e.all.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
    }));
    this.onDidResetWorkspaces = this.channel.listen("onDidResetWorkspaces");
  }
  get defaultProfile() {
    return this.profiles[0];
  }
  get profiles() {
    return this._profiles;
  }
  async createNamedProfile(name, options, workspaceIdentifier) {
    const result = await this.channel.call("createNamedProfile", [name, options, workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async createProfile(id2, name, options, workspaceIdentifier) {
    const result = await this.channel.call("createProfile", [id2, name, options, workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async createTransientProfile(workspaceIdentifier) {
    const result = await this.channel.call("createTransientProfile", [workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async setProfileForWorkspace(workspaceIdentifier, profile) {
    await this.channel.call("setProfileForWorkspace", [workspaceIdentifier, profile]);
  }
  removeProfile(profile) {
    return this.channel.call("removeProfile", [profile]);
  }
  async updateProfile(profile, updateOptions) {
    const result = await this.channel.call("updateProfile", [profile, updateOptions]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  resetWorkspaces() {
    return this.channel.call("resetWorkspaces");
  }
  cleanUp() {
    return this.channel.call("cleanUp");
  }
  cleanUpTransientProfiles() {
    return this.channel.call("cleanUpTransientProfiles");
  }
};
export { UserDataProfilesService2 };
