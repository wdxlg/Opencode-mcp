// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/textCodeEditor.ts
import { AbstractTextEditor } from "./module-1092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { applyTextEditorOptions } from "./module-1525.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";


// src/vs/workbench/browser/parts/editor/textCodeEditor.ts
var AbstractTextCodeEditor = class extends AbstractTextEditor {
  constructor() {
    super(...arguments);
    this.editorControl = void 0;
  }
  get scopedContextKeyService() {
    return this.editorControl?.invokeWithinContext((accessor) => accessor.get(IContextKeyService));
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize(6769, null);
  }
  createEditorControl(parent, initialOptions) {
    this.editorControl = this._register(this.instantiationService.createInstance(CodeEditorWidget, parent, initialOptions, this.getCodeEditorWidgetOptions()));
  }
  getCodeEditorWidgetOptions() {
    return /* @__PURE__ */ Object.create(null);
  }
  updateEditorControlOptions(options3) {
    this.editorControl?.updateOptions(options3);
  }
  getMainControl() {
    return this.editorControl;
  }
  getControl() {
    return this.editorControl;
  }
  computeEditorViewState(resource) {
    if (!this.editorControl) {
      return void 0;
    }
    const model = this.editorControl.getModel();
    if (!model) {
      return void 0;
    }
    const modelUri = model.uri;
    if (!modelUri) {
      return void 0;
    }
    if (!isEqual2(modelUri, resource)) {
      return void 0;
    }
    return this.editorControl.saveViewState() ?? void 0;
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (options3) {
      applyTextEditorOptions(options3, assertReturnsDefined(this.editorControl), 0 /* Smooth */);
    }
  }
  focus() {
    super.focus();
    this.editorControl?.focus();
  }
  hasFocus() {
    return this.editorControl?.hasTextFocus() || super.hasFocus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (visible) {
      this.editorControl?.onVisible();
    } else {
      this.editorControl?.onHide();
    }
  }
  layout(dimension) {
    this.editorControl?.layout(dimension);
  }
};
export { AbstractTextCodeEditor };
