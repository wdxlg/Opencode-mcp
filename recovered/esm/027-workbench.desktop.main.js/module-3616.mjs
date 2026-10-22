// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/browser/userDataSyncTrigger.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { VIEWLET_ID2 } from "./module-1022.mjs";
import { isWeb } from "./module-0014.mjs";
import { SettingsEditor2Input } from "./module-1648.mjs";
import { KeybindingsEditorInput } from "./module-1647.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IUserDataAutoSyncService } from "./module-1696.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/contrib/userDataSync/browser/userDataSyncTrigger.ts
var UserDataSyncTrigger = class extends Disposable {
  constructor(editorService, userDataProfilesService, viewsService, userDataAutoSyncService, hostService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    const event = Event2.filter(
      Event2.any(
        Event2.map(editorService.onDidActiveEditorChange, () => this.getUserDataEditorInputSource(editorService.activeEditor)),
        Event2.map(Event2.filter(viewsService.onDidChangeViewContainerVisibility, (e) => e.id === VIEWLET_ID2 && e.visible), (e) => e.id)
      ),
      (source) => source !== void 0
    );
    if (isWeb) {
      this._register(Event2.debounce(
        Event2.any(
          Event2.map(hostService.onDidChangeFocus, () => "windowFocus"),
          Event2.map(event, (source) => source)
        ),
        (last, source) => last ? [...last, source] : [source],
        1e3
      )((sources) => userDataAutoSyncService.triggerSync(sources, { skipIfSyncedRecently: true })));
    } else {
      this._register(event((source) => userDataAutoSyncService.triggerSync([source], { skipIfSyncedRecently: true })));
    }
  }
  getUserDataEditorInputSource(editorInput) {
    if (!editorInput) {
      return void 0;
    }
    if (editorInput instanceof SettingsEditor2Input) {
      return "settingsEditor";
    }
    if (editorInput instanceof KeybindingsEditorInput) {
      return "keybindingsEditor";
    }
    const resource = editorInput.resource;
    if (isEqual2(resource, this.userDataProfilesService.defaultProfile.settingsResource)) {
      return "settingsEditor";
    }
    if (isEqual2(resource, this.userDataProfilesService.defaultProfile.keybindingsResource)) {
      return "keybindingsEditor";
    }
    return void 0;
  }
};

UserDataSyncTrigger = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IUserDataAutoSyncService),
  __decorateParam(4, IHostService)
], UserDataSyncTrigger);
export { UserDataSyncTrigger };
