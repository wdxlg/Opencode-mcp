// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/common/userDataProfileService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { Promises } from "./module-0036.mjs";


// src/vs/workbench/services/userDataProfile/common/userDataProfileService.ts
var UserDataProfileService = class extends Disposable {
  constructor(currentProfile) {
    super();
    this._onDidChangeCurrentProfile = this._register(new Emitter());
    this.onDidChangeCurrentProfile = this._onDidChangeCurrentProfile.event;
    this._currentProfile = currentProfile;
  }
  get currentProfile() {
    return this._currentProfile;
  }
  async updateCurrentProfile(userDataProfile) {
    if (equals4(this._currentProfile, userDataProfile)) {
      return;
    }
    const previous = this._currentProfile;
    this._currentProfile = userDataProfile;
    const joiners = [];
    this._onDidChangeCurrentProfile.fire({
      previous,
      profile: userDataProfile,
      join(promise) {
        joiners.push(promise);
      }
    });
    await Promises.settled(joiners);
  }
};
export { UserDataProfileService };
