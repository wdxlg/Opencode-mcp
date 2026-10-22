// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/browser/keybindingsEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";
import { KeybindingsEditorModel } from "./module-1587.mjs";
import { OS } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/preferences/browser/keybindingsEditorInput.ts
var KeybindingsEditorIcon = registerIcon("keybindings-editor-label-icon", Codicon.keyboard, localize(23275, null));

var KeybindingsEditorInput = class extends EditorInput {
  constructor(instantiationService) {
    super();
    this.searchOptions = null;
    this.resource = void 0;
    this.keybindingsModel = instantiationService.createInstance(KeybindingsEditorModel, OS);
  }
  static {
    this.ID = "workbench.input.keybindings";
  }
  get typeId() {
    return KeybindingsEditorInput.ID;
  }
  getName() {
    return localize(23276, null);
  }
  getIcon() {
    return KeybindingsEditorIcon;
  }
  async resolve() {
    return this.keybindingsModel;
  }
  matches(otherInput) {
    return otherInput instanceof KeybindingsEditorInput;
  }
  dispose() {
    this.keybindingsModel.dispose();
    super.dispose();
  }
};

KeybindingsEditorInput = __decorateClass([
  __decorateParam(0, IInstantiationService)
], KeybindingsEditorInput);
export { KeybindingsEditorIcon, KeybindingsEditorInput };
