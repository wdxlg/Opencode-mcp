// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/sessionChangesEditorInput.ts
import { DockedEditorInput } from "./module-3585.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { mainWindow } from "./module-0002.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/sessions/contrib/changes/browser/sessionChangesEditorInput.ts
var SessionChangesEditorInput = class extends DockedEditorInput {
  constructor(multiDiffSource, instantiationService, layoutService) {
    super();
    this.multiDiffSource = multiDiffSource;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this._innerInput = this._register(new MutableDisposable());
    this._register(layoutService.onDidChangePartVisibility((event) => {
      if (event.partId === "workbench.parts.editor" /* EDITOR_PART */) {
        this._onDidChangeCapabilities.fire();
      }
    }));
  }
  static {
    this.ID = "workbench.input.agentSessions.sessionChanges";
  }
  static {
    this.EDITOR_ID = "workbench.editor.agentSessions.sessionChanges";
  }
  get resource() {
    return this.multiDiffSource;
  }
  get typeId() {
    return SessionChangesEditorInput.ID;
  }
  get editorId() {
    return SessionChangesEditorInput.EDITOR_ID;
  }
  get capabilities() {
    const capabilities = super.capabilities | 8 /* Singleton */ | 2 /* Readonly */;
    return this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) ? capabilities : capabilities | 8192 /* CannotClose */;
  }
  getName() {
    return localize(4302, null);
  }
  getIcon() {
    return Codicon.diffMultiple;
  }
  getTitle(_verbosity) {
    return this.getName();
  }
  get innerInput() {
    if (!this._innerInput.value) {
      this._innerInput.value = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
        multiDiffSource: this.multiDiffSource,
        label: this.getName()
      }, this.instantiationService);
    }
    return this._innerInput.value;
  }
  /**
   * The wrapped multi-diff input, whose {@link MultiDiffEditorInput.resources}
   * expose the session's individual file diffs. Used to resolve the session's
   * files (e.g. for the agent feedback affordances) from this editor input.
   */
  get multiDiffInput() {
    return this.innerInput;
  }
  async getViewModel() {
    return this.innerInput.getViewModel();
  }
  clear() {
    this._innerInput.clear();
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    return otherInput instanceof SessionChangesEditorInput && otherInput.multiDiffSource.toString() === this.multiDiffSource.toString();
  }
};

SessionChangesEditorInput = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkbenchLayoutService)
], SessionChangesEditorInput);

var SessionChangesEditorSerializer = class {
  canSerialize(editorInput) {
    return editorInput instanceof SessionChangesEditorInput;
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return void 0;
    }
    const data = { multiDiffSourceUri: editorInput.multiDiffSource.toString() };
    return JSON.stringify(data);
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const data = JSON.parse(serializedEditor);
      return instantiationService.createInstance(SessionChangesEditorInput, URI.parse(data.multiDiffSourceUri));
    } catch {
      return void 0;
    }
  }
};
export { SessionChangesEditorInput, SessionChangesEditorSerializer };
