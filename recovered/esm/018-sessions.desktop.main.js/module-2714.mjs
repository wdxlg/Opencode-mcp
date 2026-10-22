// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatEditorInputContentProvider.ts
import { Disposable } from "./module-0012.mjs";
import { chatInputSchemes } from "./module-0965.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatEditorInputContentProvider.ts
var ChatInputBoxContentProvider = class extends Disposable {
  constructor(textModelService, modelService, languageService) {
    super();
    this.modelService = modelService;
    this.languageService = languageService;
    for (const scheme of chatInputSchemes) {
      this._register(textModelService.registerTextModelContentProvider(scheme, this));
    }
  }
  async provideTextContent(resource) {
    const existing = this.modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    return this.modelService.createModel("", this.languageService.createById("chatinput"), resource);
  }
};

ChatInputBoxContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService)
], ChatInputBoxContentProvider);
export { ChatInputBoxContentProvider };
