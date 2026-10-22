// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/browser/workspaceTrustEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/services/workspaces/browser/workspaceTrustEditorInput.ts
var WorkspaceTrustEditorIcon = registerIcon("workspace-trust-editor-label-icon", Codicon.shield, localize(23783, null));

var WorkspaceTrustEditorInput = class _WorkspaceTrustEditorInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = URI.from({
      scheme: Schemas.vscodeWorkspaceTrust,
      path: `workspaceTrustEditor`
    });
  }
  static {
    this.ID = "workbench.input.workspaceTrust";
  }
  get capabilities() {
    return super.capabilities | 8 /* Singleton */ | 2048 /* RequiresModal */;
  }
  get typeId() {
    return _WorkspaceTrustEditorInput.ID;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof _WorkspaceTrustEditorInput;
  }
  getName() {
    return localize(23782, null);
  }
  getIcon() {
    return WorkspaceTrustEditorIcon;
  }
};
export { WorkspaceTrustEditorIcon, WorkspaceTrustEditorInput };
