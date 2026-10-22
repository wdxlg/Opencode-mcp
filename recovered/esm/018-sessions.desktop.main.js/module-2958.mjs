// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/embeddedDiffEditorWidget.ts
import { DiffEditorWidget } from "./module-0527.mjs";
import { mixin } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IAccessibilitySignalService } from "./module-0445.mjs";
import { IEditorProgressService } from "./module-0446.mjs";


// src/vs/editor/browser/widget/diffEditor/embeddedDiffEditorWidget.ts
var EmbeddedDiffEditorWidget = class extends DiffEditorWidget {
  constructor(domElement, options3, codeEditorWidgetOptions, parentEditor, contextKeyService, instantiationService, codeEditorService, accessibilitySignalService, editorProgressService) {
    super(domElement, parentEditor.getRawOptions(), codeEditorWidgetOptions, contextKeyService, instantiationService, codeEditorService, accessibilitySignalService, editorProgressService);
    this._parentEditor = parentEditor;
    this._overwriteOptions = options3;
    super.updateOptions(this._overwriteOptions);
    this._register(parentEditor.onDidChangeConfiguration((e4) => this._onParentConfigurationChanged(e4)));
  }
  getParentEditor() {
    return this._parentEditor;
  }
  _onParentConfigurationChanged(e4) {
    super.updateOptions(this._parentEditor.getRawOptions());
    super.updateOptions(this._overwriteOptions);
  }
  updateOptions(newOptions) {
    mixin(this._overwriteOptions, newOptions, true);
    super.updateOptions(this._overwriteOptions);
  }
};

EmbeddedDiffEditorWidget = __decorateClass([
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ICodeEditorService),
  __decorateParam(7, IAccessibilitySignalService),
  __decorateParam(8, IEditorProgressService)
], EmbeddedDiffEditorWidget);
export { EmbeddedDiffEditorWidget };
