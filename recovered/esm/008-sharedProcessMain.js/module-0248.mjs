// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/userDataProfilesCleaner.ts
import { Disposable } from "./module-0013.mjs";
import { RunOnceScheduler } from "./module-0029.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/userDataProfilesCleaner.ts
var UserDataProfilesCleaner = class extends Disposable {
  constructor(userDataProfilesService) {
    super();
    const scheduler = this._register(new RunOnceScheduler(
      () => {
        userDataProfilesService.cleanUp();
      },
      10 * 1e3
      /* after 10s */
    ));
    scheduler.schedule();
  }
};

UserDataProfilesCleaner = __decorateClass([
  __decorateParam(0, IUserDataProfilesService)
], UserDataProfilesCleaner);
export { UserDataProfilesCleaner };
