// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/dropOrPasteInto/browser/commands.ts
import { CopyPasteController, pasteAsPreferenceConfig } from "./module-0555.mjs";
import { toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { DropIntoEditorController, dropAsPreferenceConfig } from "./module-0671.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPreferencesService } from "./module-1293.mjs";


// src/vs/workbench/contrib/dropOrPasteInto/browser/commands.ts
var DropOrPasteIntoCommands = class {
  constructor(_preferencesService) {
    this._preferencesService = _preferencesService;
    CopyPasteController.setConfigureDefaultAction(toAction({
      id: "workbench.action.configurePreferredPasteAction",
      label: localize(14873, null),
      run: () => this.configurePreferredPasteAction()
    }));
    DropIntoEditorController.setConfigureDefaultAction(toAction({
      id: "workbench.action.configurePreferredDropAction",
      label: localize(14872, null),
      run: () => this.configurePreferredDropAction()
    }));
  }
  static {
    this.ID = "workbench.contrib.dropOrPasteInto";
  }
  configurePreferredPasteAction() {
    return this._preferencesService.openUserSettings({
      jsonEditor: true,
      revealSetting: { key: pasteAsPreferenceConfig, edit: true }
    });
  }
  configurePreferredDropAction() {
    return this._preferencesService.openUserSettings({
      jsonEditor: true,
      revealSetting: { key: dropAsPreferenceConfig, edit: true }
    });
  }
};

DropOrPasteIntoCommands = __decorateClass([
  __decorateParam(0, IPreferencesService)
], DropOrPasteIntoCommands);
export { DropOrPasteIntoCommands };
