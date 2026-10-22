// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerController.ts
import { Disposable } from "./module-0012.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { StandaloneColorPickerWidget } from "./module-0657.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerController.ts
var StandaloneColorPickerController = class extends Disposable {
  constructor(_editor, _contextKeyService, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._standaloneColorPickerWidget = null;
    this._standaloneColorPickerVisible = EditorContextKeys.standaloneColorPickerVisible.bindTo(_contextKeyService);
    this._standaloneColorPickerFocused = EditorContextKeys.standaloneColorPickerFocused.bindTo(_contextKeyService);
  }
  static {
    this.ID = "editor.contrib.standaloneColorPickerController";
  }
  showOrFocus() {
    if (!this._editor.hasModel()) {
      return;
    }
    if (!this._standaloneColorPickerVisible.get()) {
      this._standaloneColorPickerWidget = this._instantiationService.createInstance(
        StandaloneColorPickerWidget,
        this._editor,
        this._standaloneColorPickerVisible,
        this._standaloneColorPickerFocused
      );
    } else if (!this._standaloneColorPickerFocused.get()) {
      this._standaloneColorPickerWidget?.focus();
    }
  }
  hide() {
    this._standaloneColorPickerFocused.set(false);
    this._standaloneColorPickerVisible.set(false);
    this._standaloneColorPickerWidget?.hide();
    this._editor.focus();
  }
  insertColor() {
    this._standaloneColorPickerWidget?.updateEditor();
    this.hide();
  }
  static get(editor) {
    return editor.getContribution(StandaloneColorPickerController.ID);
  }
};

StandaloneColorPickerController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], StandaloneColorPickerController);
export { StandaloneColorPickerController };
