// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/editorFeatures.ts
import { Disposable } from "./module-0012.mjs";
import { getEditorFeatures } from "./module-0574.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/codeEditor/browser/editorFeatures.ts
var EditorFeaturesInstantiator = class extends Disposable {
  constructor(codeEditorService, _instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    this._instantiated = false;
    this._register(codeEditorService.onWillCreateCodeEditor(() => this._instantiate()));
    this._register(codeEditorService.onWillCreateDiffEditor(() => this._instantiate()));
    if (codeEditorService.listCodeEditors().length > 0 || codeEditorService.listDiffEditors().length > 0) {
      this._instantiate();
    }
  }
  static {
    this.ID = "workbench.contrib.editorFeaturesInstantiator";
  }
  _instantiate() {
    if (this._instantiated) {
      return;
    }
    this._instantiated = true;
    const editorFeatures2 = getEditorFeatures();
    for (const feature of editorFeatures2) {
      try {
        const instance2 = this._instantiationService.createInstance(feature);
        if (typeof instance2.dispose === "function") {
          this._register(instance2);
        }
      } catch (err) {
        onUnexpectedError(err);
      }
    }
  }
};

EditorFeaturesInstantiator = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IInstantiationService)
], EditorFeaturesInstantiator);

registerWorkbenchContribution2(EditorFeaturesInstantiator.ID, EditorFeaturesInstantiator, WorkbenchPhase.BlockRestore);
export { EditorFeaturesInstantiator };
