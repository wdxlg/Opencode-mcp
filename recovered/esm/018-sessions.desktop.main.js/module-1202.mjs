// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataProfile/common/userDataProfileIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { reviveProfile } from "./module-0511.mjs";


// src/vs/platform/userDataProfile/common/userDataProfileIpc.ts
var UserDataProfilesService2 = class extends Disposable {
  constructor(profiles2, profilesHome, channel) {
    super();
    this.profilesHome = profilesHome;
    this.channel = channel;
    this._profiles = [];
    this._onDidChangeProfiles = this._register(new Emitter());
    this.onDidChangeProfiles = this._onDidChangeProfiles.event;
    this._profiles = profiles2.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
    this._register(this.channel.listen("onDidChangeProfiles")((e4) => {
      const added = e4.added.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      const removed = e4.removed.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      const updated = e4.updated.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      this._profiles = e4.all.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
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
  async createNamedProfile(name, options3, workspaceIdentifier) {
    const result = await this.channel.call("createNamedProfile", [name, options3, workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async createProfile(id2, name, options3, workspaceIdentifier) {
    const result = await this.channel.call("createProfile", [id2, name, options3, workspaceIdentifier]);
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
