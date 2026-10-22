// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/common/preferencesEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPreferencesService } from "./module-1294.mjs";


// src/vs/workbench/services/preferences/common/preferencesEditorInput.ts
var SettingsEditorIcon = registerIcon("settings-editor-label-icon", Codicon.settings, localize(23290, null));

var SettingsEditor2Input = class extends EditorInput {
  constructor(_preferencesService) {
    super();
    this.resource = URI.from({
      scheme: Schemas.vscodeSettings,
      path: `settingseditor`
    });
    this._settingsModel = _preferencesService.createSettings2EditorModel();
  }
  static {
    this.ID = "workbench.input.settings2";
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof SettingsEditor2Input;
  }
  get typeId() {
    return SettingsEditor2Input.ID;
  }
  getName() {
    return localize(23289, null);
  }
  getIcon() {
    return SettingsEditorIcon;
  }
  async resolve() {
    return this._settingsModel;
  }
  dispose() {
    this._settingsModel.dispose();
    super.dispose();
  }
};

SettingsEditor2Input = __decorateClass([
  __decorateParam(0, IPreferencesService)
], SettingsEditor2Input);

var PreferencesEditorIcon = registerIcon("preferences-editor-label-icon", Codicon.settings, localize(23288, null));

var PreferencesEditorInput = class _PreferencesEditorInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = URI.from({
      scheme: Schemas.vscodeSettings,
      path: `preferenceseditor`
    });
  }
  static {
    this.ID = "workbench.input.preferences";
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof _PreferencesEditorInput;
  }
  get typeId() {
    return _PreferencesEditorInput.ID;
  }
  getName() {
    return localize(23287, null);
  }
  getIcon() {
    return PreferencesEditorIcon;
  }
  async resolve() {
    return null;
  }
};
export { SettingsEditorIcon, SettingsEditor2Input, PreferencesEditorIcon, PreferencesEditorInput };
