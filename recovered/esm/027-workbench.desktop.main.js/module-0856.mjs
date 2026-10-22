// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.ts
var ignoreUnusualLineTerminators = "ignoreUnusualLineTerminators";

function writeIgnoreState(codeEditorService, model, state) {
  codeEditorService.setModelProperty(model.uri, ignoreUnusualLineTerminators, state);
}

function readIgnoreState(codeEditorService, model) {
  return codeEditorService.getModelProperty(model.uri, ignoreUnusualLineTerminators);
}

var UnusualLineTerminatorsDetector = class extends Disposable {
  constructor(_editor, _dialogService, _codeEditorService) {
    super();
    this._editor = _editor;
    this._dialogService = _dialogService;
    this._codeEditorService = _codeEditorService;
    this._isPresentingDialog = false;
    this._config = this._editor.getOption(143 /* unusualLineTerminators */);
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(143 /* unusualLineTerminators */)) {
        this._config = this._editor.getOption(143 /* unusualLineTerminators */);
        this._checkForUnusualLineTerminators();
      }
    }));
    this._register(this._editor.onDidChangeModel(() => {
      this._checkForUnusualLineTerminators();
    }));
    this._register(this._editor.onDidChangeModelContent((e) => {
      if (e.isUndoing) {
        return;
      }
      this._checkForUnusualLineTerminators();
    }));
    this._checkForUnusualLineTerminators();
  }
  static {
    this.ID = "editor.contrib.unusualLineTerminatorsDetector";
  }
  async _checkForUnusualLineTerminators() {
    if (this._config === "off") {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    if (!model.mightContainUnusualLineTerminators()) {
      return;
    }
    const ignoreState = readIgnoreState(this._codeEditorService, model);
    if (ignoreState === true) {
      return;
    }
    if (this._editor.getOption(104 /* readOnly */)) {
      return;
    }
    if (this._config === "auto") {
      model.removeUnusualLineTerminators(this._editor.getSelections());
      return;
    }
    if (this._isPresentingDialog) {
      return;
    }
    let result;
    try {
      this._isPresentingDialog = true;
      result = await this._dialogService.confirm({
        title: localize(1748, null),
        message: localize(1747, null),
        detail: localize(1744, null, basename2(model.uri)),
        primaryButton: localize(1745, null),
        cancelButton: localize(1746, null)
      });
    } finally {
      this._isPresentingDialog = false;
    }
    if (!result.confirmed) {
      writeIgnoreState(this._codeEditorService, model, true);
      return;
    }
    model.removeUnusualLineTerminators(this._editor.getSelections());
  }
};

UnusualLineTerminatorsDetector = __decorateClass([
  __decorateParam(1, IDialogService),
  __decorateParam(2, ICodeEditorService)
], UnusualLineTerminatorsDetector);

registerEditorContribution(UnusualLineTerminatorsDetector.ID, UnusualLineTerminatorsDetector, 1 /* AfterFirstRender */);
export { writeIgnoreState, readIgnoreState, ignoreUnusualLineTerminators, UnusualLineTerminatorsDetector };
