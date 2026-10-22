// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataProfile/browser/userDataProfileActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { PROFILES_CATEGORY } from "./module-0998.mjs";
import { IHostService } from "./module-1118.mjs";
import { Categories } from "./module-0847.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";


// src/vs/workbench/contrib/userDataProfile/browser/userDataProfileActions.ts
var CreateTransientProfileAction = class _CreateTransientProfileAction extends Action2 {
  static {
    this.ID = "workbench.profiles.actions.createTemporaryProfile";
  }
  static {
    this.TITLE = localize2(21612, "New Window with Temporary Profile");
  }
  constructor() {
    super({
      id: _CreateTransientProfileAction.ID,
      title: _CreateTransientProfileAction.TITLE,
      category: PROFILES_CATEGORY,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IHostService).openWindow({ forceTempProfile: true });
  }
};

registerAction2(CreateTransientProfileAction);

registerAction2(class CleanupProfilesAction extends Action2 {
  constructor() {
    super({
      id: "workbench.profiles.actions.cleanupProfiles",
      title: localize2(21611, "Cleanup Profiles"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    return accessor.get(IUserDataProfilesService).cleanUp();
  }
});

registerAction2(class ResetWorkspacesAction extends Action2 {
  constructor() {
    super({
      id: "workbench.profiles.actions.resetWorkspaces",
      title: localize2(21613, "Reset Workspace Profiles Associations"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const userDataProfilesService = accessor.get(IUserDataProfilesService);
    return userDataProfilesService.resetWorkspaces();
  }
});
export { CreateTransientProfileAction };
