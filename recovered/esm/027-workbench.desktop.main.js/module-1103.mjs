// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/textResourceEditorModel.ts
import { BaseTextEditorModel } from "./module-1098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageDetectionService } from "./module-1097.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/common/editor/textResourceEditorModel.ts
var TextResourceEditorModel = class extends BaseTextEditorModel {
  constructor(resource, languageService, modelService, languageDetectionService, accessibilityService) {
    super(modelService, languageService, languageDetectionService, accessibilityService, resource);
  }
  dispose() {
    if (this.textEditorModelHandle) {
      this.modelService.destroyModel(this.textEditorModelHandle);
    }
    super.dispose();
  }
};

TextResourceEditorModel = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageDetectionService),
  __decorateParam(4, IAccessibilityService)
], TextResourceEditorModel);
export { TextResourceEditorModel };
