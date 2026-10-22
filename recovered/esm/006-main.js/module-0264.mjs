// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/userDataProfile/electron-main/userDataProfilesHandler.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { init_window2 } from "./module-0097.mjs";
import { IUserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { init_workspace, toWorkspaceIdentifier } from "./module-0076.mjs";
import { RunOnceScheduler, init_async } from "./module-0034.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";


// src/vs/platform/userDataProfile/electron-main/userDataProfilesHandler.ts
var UserDataProfilesHandler;

var init_userDataProfilesHandler = __esm({
  "src/vs/platform/userDataProfile/electron-main/userDataProfilesHandler.ts"() {
    init_lifecycle();
    init_lifecycleMainService();
    init_window2();
    init_userDataProfile3();
    init_workspace();
    init_async();
    init_windows();
    UserDataProfilesHandler = class extends Disposable {
      constructor(lifecycleMainService, userDataProfilesService, windowsMainService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.windowsMainService = windowsMainService;
        this._register(lifecycleMainService.onWillLoadWindow((e) => {
          if (e.reason === 2 /* LOAD */) {
            this.unsetProfileForWorkspace(e.window);
          }
        }));
        this._register(lifecycleMainService.onBeforeCloseWindow((window2) => this.unsetProfileForWorkspace(window2)));
        this._register(new RunOnceScheduler(
          () => this.cleanUpEmptyWindowAssociations(),
          30 * 1e3
          /* after 30s */
        )).schedule();
      }
      async unsetProfileForWorkspace(window2) {
        const workspace = this.getWorkspace(window2);
        const profile = this.userDataProfilesService.getProfileForWorkspace(workspace);
        if (profile?.isTransient) {
          this.userDataProfilesService.unsetWorkspace(workspace, profile.isTransient);
          if (profile.isTransient) {
            await this.userDataProfilesService.cleanUpTransientProfiles();
          }
        }
      }
      getWorkspace(window2) {
        return window2.openedWorkspace ?? toWorkspaceIdentifier(window2.backupPath, window2.isExtensionDevelopmentHost);
      }
      cleanUpEmptyWindowAssociations() {
        const associatedEmptyWindows = this.userDataProfilesService.getAssociatedEmptyWindows();
        if (associatedEmptyWindows.length === 0) {
          return;
        }
        const openedWorkspaces = this.windowsMainService.getWindows().map((window2) => this.getWorkspace(window2));
        for (const associatedEmptyWindow of associatedEmptyWindows) {
          if (openedWorkspaces.some((openedWorkspace) => openedWorkspace.id === associatedEmptyWindow.id)) {
            continue;
          }
          this.userDataProfilesService.unsetWorkspace(associatedEmptyWindow, false);
        }
      }
    };
    UserDataProfilesHandler = __decorateClass([
      __decorateParam(0, ILifecycleMainService),
      __decorateParam(1, IUserDataProfilesMainService),
      __decorateParam(2, IWindowsMainService)
    ], UserDataProfilesHandler);
  }
});
export { UserDataProfilesHandler, init_userDataProfilesHandler };
