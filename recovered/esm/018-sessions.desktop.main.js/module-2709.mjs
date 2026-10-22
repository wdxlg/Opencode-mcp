// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatManagement/chatManagementEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";


// src/vs/workbench/contrib/chat/browser/chatManagement/chatManagementEditorInput.ts
var ModelsManagementEditorIcon = registerIcon("models-management-editor-label-icon", Codicon.settings, localize(10896, null));

var ModelsManagementEditorInput = class _ModelsManagementEditorInput extends EditorInput {
  constructor() {
    super();
    this.resource = void 0;
  }
  static {
    this.ID = "workbench.input.modelsManagement";
  }
  get capabilities() {
    return super.capabilities | 8 /* Singleton */ | 2048 /* RequiresModal */;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof _ModelsManagementEditorInput;
  }
  get typeId() {
    return _ModelsManagementEditorInput.ID;
  }
  getName() {
    return localize(10895, null);
  }
  getIcon() {
    return ModelsManagementEditorIcon;
  }
  async resolve() {
    return null;
  }
};
export { ModelsManagementEditorIcon, ModelsManagementEditorInput };
