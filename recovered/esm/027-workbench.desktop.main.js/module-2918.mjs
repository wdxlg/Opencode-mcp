// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/extensionsInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { join } from "./module-0026.mjs";
import { areSameExtensions } from "./module-0886.mjs";


// src/vs/workbench/contrib/extensions/common/extensionsInput.ts
var ExtensionEditorIcon = registerIcon("extensions-editor-label-icon", Codicon.extensions, localize(15604, null));

var ExtensionsInput = class _ExtensionsInput extends EditorInput {
  constructor(_extension) {
    super();
    this._extension = _extension;
  }
  static {
    this.ID = "workbench.extensions.input2";
  }
  get typeId() {
    return _ExtensionsInput.ID;
  }
  get capabilities() {
    return 2 /* Readonly */ | 8 /* Singleton */;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.extension,
      path: join(this._extension.identifier.id, "extension")
    });
  }
  get extension() {
    return this._extension;
  }
  getName() {
    return localize(15605, null, this._extension.displayName);
  }
  getIcon() {
    return ExtensionEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _ExtensionsInput && areSameExtensions(this._extension.identifier, other._extension.identifier);
  }
};
export { ExtensionEditorIcon, ExtensionsInput };
