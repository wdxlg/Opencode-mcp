// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/browser/processExplorerEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/processExplorer/browser/processExplorerEditorInput.ts
var processExplorerEditorIcon = registerIcon("process-explorer-editor-label-icon", Codicon.serverProcess, localize(18418, null));

var ProcessExplorerEditorInput = class _ProcessExplorerEditorInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = _ProcessExplorerEditorInput.RESOURCE;
  }
  static {
    this.ID = "workbench.editor.processExplorer";
  }
  static {
    this.RESOURCE = URI.from({
      scheme: "process-explorer",
      path: "default"
    });
  }
  static get instance() {
    if (!_ProcessExplorerEditorInput._instance || _ProcessExplorerEditorInput._instance.isDisposed()) {
      _ProcessExplorerEditorInput._instance = new _ProcessExplorerEditorInput();
    }
    return _ProcessExplorerEditorInput._instance;
  }
  get typeId() {
    return _ProcessExplorerEditorInput.ID;
  }
  get editorId() {
    return _ProcessExplorerEditorInput.ID;
  }
  get capabilities() {
    return 2 /* Readonly */ | 8 /* Singleton */;
  }
  getName() {
    return localize(18419, null);
  }
  getIcon() {
    return processExplorerEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _ProcessExplorerEditorInput;
  }
};
export { processExplorerEditorIcon, ProcessExplorerEditorInput };
