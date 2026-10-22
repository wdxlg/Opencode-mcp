// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/codeEditor/embeddedCodeEditorWidget.ts
import { CodeEditorWidget } from "./module-0441.mjs";
import { mixin } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IUserInteractionService } from "./module-0366.mjs";


// src/vs/editor/browser/widget/codeEditor/embeddedCodeEditorWidget.ts
var EmbeddedCodeEditorWidget = class extends CodeEditorWidget {
  constructor(domElement, options3, codeEditorWidgetOptions, parentEditor, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService, userInteractionService) {
    super(domElement, { ...parentEditor.getRawOptions(), overflowWidgetsDomNode: parentEditor.getOverflowWidgetsDomNode() }, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService, userInteractionService);
    this._parentEditor = parentEditor;
    this._overwriteOptions = options3;
    super.updateOptions(this._overwriteOptions);
    this._register(parentEditor.onDidChangeConfiguration((e) => this._onParentConfigurationChanged(e)));
  }
  getParentEditor() {
    return this._parentEditor;
  }
  _onParentConfigurationChanged(e) {
    super.updateOptions(this._parentEditor.getRawOptions());
    super.updateOptions(this._overwriteOptions);
  }
  updateOptions(newOptions) {
    mixin(this._overwriteOptions, newOptions, true);
    super.updateOptions(this._overwriteOptions);
  }
};

EmbeddedCodeEditorWidget = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IAccessibilityService),
  __decorateParam(11, ILanguageConfigurationService),
  __decorateParam(12, ILanguageFeaturesService),
  __decorateParam(13, IUserInteractionService)
], EmbeddedCodeEditorWidget);

function getOuterEditor(accessor) {
  const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
  if (editor instanceof EmbeddedCodeEditorWidget) {
    return editor.getParentEditor();
  }
  return editor;
}
export { getOuterEditor, EmbeddedCodeEditorWidget };
