// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataSync/common/userDataSyncUtil.ts
import { IUserDataSyncUtilService, getDefaultIgnoredSettings } from "./module-1639.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextResourceConfigurationService, ITextResourcePropertiesService } from "./module-0204.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userDataSync/common/userDataSyncUtil.ts
var UserDataSyncUtilService = class {
  constructor(keybindingsService, textModelService, textResourcePropertiesService, textResourceConfigurationService) {
    this.keybindingsService = keybindingsService;
    this.textModelService = textModelService;
    this.textResourcePropertiesService = textResourcePropertiesService;
    this.textResourceConfigurationService = textResourceConfigurationService;
  }
  async resolveDefaultCoreIgnoredSettings() {
    return getDefaultIgnoredSettings(true);
  }
  async resolveUserBindings(userBindings) {
    const keys = {};
    for (const userbinding of userBindings) {
      keys[userbinding] = this.keybindingsService.resolveUserBinding(userbinding).map((part) => part.getUserSettingsLabel()).join(" ");
    }
    return keys;
  }
  async resolveFormattingOptions(resource) {
    try {
      const modelReference = await this.textModelService.createModelReference(resource);
      const { insertSpaces, tabSize } = modelReference.object.textEditorModel.getOptions();
      const eol = modelReference.object.textEditorModel.getEOL();
      modelReference.dispose();
      return { eol, insertSpaces, tabSize };
    } catch (e4) {
    }
    return {
      eol: this.textResourcePropertiesService.getEOL(resource),
      insertSpaces: !!this.textResourceConfigurationService.getValue(resource, "editor.insertSpaces"),
      tabSize: this.textResourceConfigurationService.getValue(resource, "editor.tabSize")
    };
  }
};

UserDataSyncUtilService = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, ITextModelService),
  __decorateParam(2, ITextResourcePropertiesService),
  __decorateParam(3, ITextResourceConfigurationService)
], UserDataSyncUtilService);

registerSingleton(IUserDataSyncUtilService, UserDataSyncUtilService, 1 /* Delayed */);
export { UserDataSyncUtilService };
