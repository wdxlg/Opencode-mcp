// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/disassemblyViewInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";


// src/vs/workbench/contrib/debug/common/disassemblyViewInput.ts
var DisassemblyEditorIcon = registerIcon("disassembly-editor-label-icon", Codicon.debug, localize(14863, null));

var DisassemblyViewInput = class _DisassemblyViewInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = void 0;
  }
  static {
    this.ID = "debug.disassemblyView.input";
  }
  get typeId() {
    return _DisassemblyViewInput.ID;
  }
  static get instance() {
    if (!_DisassemblyViewInput._instance || _DisassemblyViewInput._instance.isDisposed()) {
      _DisassemblyViewInput._instance = new _DisassemblyViewInput();
    }
    return _DisassemblyViewInput._instance;
  }
  getName() {
    return localize(14864, null);
  }
  getIcon() {
    return DisassemblyEditorIcon;
  }
  matches(other) {
    return other instanceof _DisassemblyViewInput;
  }
};
export { DisassemblyEditorIcon, DisassemblyViewInput };
