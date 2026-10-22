// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/runtimeExtensionsInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/extensions/common/runtimeExtensionsInput.ts
var RuntimeExtensionsEditorIcon = registerIcon("runtime-extensions-editor-label-icon", Codicon.extensions, localize(15611, null));

var RuntimeExtensionsInput = class _RuntimeExtensionsInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = URI.from({
      scheme: "runtime-extensions",
      path: "default"
    });
  }
  static {
    this.ID = "workbench.runtimeExtensions.input";
  }
  get typeId() {
    return _RuntimeExtensionsInput.ID;
  }
  get capabilities() {
    return 2 /* Readonly */ | 8 /* Singleton */;
  }
  static get instance() {
    if (!_RuntimeExtensionsInput._instance || _RuntimeExtensionsInput._instance.isDisposed()) {
      _RuntimeExtensionsInput._instance = new _RuntimeExtensionsInput();
    }
    return _RuntimeExtensionsInput._instance;
  }
  getName() {
    return localize(15610, null);
  }
  getIcon() {
    return RuntimeExtensionsEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _RuntimeExtensionsInput;
  }
};
export { RuntimeExtensionsEditorIcon, RuntimeExtensionsInput };
