// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptCodingAgentActionContribution.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { PROMPT_LANGUAGE_ID } from "./module-0985.mjs";
import { PromptCodingAgentActionOverlayWidget } from "./module-2805.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptCodingAgentActionContribution.ts
var PromptCodingAgentActionContribution = class extends Disposable {
  constructor(_editor, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._overlayWidgets = this._register(new DisposableMap());
    this._register(this._editor.onDidChangeModel(() => {
      this._updateOverlayWidget();
    }));
    this._updateOverlayWidget();
  }
  static {
    this.ID = "promptCodingAgentActionContribution";
  }
  _updateOverlayWidget() {
    const model = this._editor.getModel();
    this._overlayWidgets.deleteAndDispose(this._editor);
    if (model && model.getLanguageId() === PROMPT_LANGUAGE_ID) {
      const widget = this._instantiationService.createInstance(PromptCodingAgentActionOverlayWidget, this._editor);
      this._overlayWidgets.set(this._editor, widget);
    }
  }
};

PromptCodingAgentActionContribution = __decorateClass([
  __decorateParam(1, IInstantiationService)
], PromptCodingAgentActionContribution);

registerEditorContribution(PromptCodingAgentActionContribution.ID, PromptCodingAgentActionContribution, 1 /* AfterFirstRender */);
export { PromptCodingAgentActionContribution };
