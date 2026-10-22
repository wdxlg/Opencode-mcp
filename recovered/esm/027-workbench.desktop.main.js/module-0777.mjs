// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsModel.ts
import { derived } from "./module-0054.mjs";
import { isSuggestionInViewport } from "./module-0743.mjs";
import { setTimeout0 } from "./module-0014.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsModel.ts
var ModelPerInlineEdit = class {
  constructor(_model, inlineEdit, tabAction) {
    this._model = _model;
    this.inlineEdit = inlineEdit;
    this.tabAction = tabAction;
    this.editorType = this._model.editorType;
    this.displayLocation = this.inlineEdit.inlineCompletion.hint;
    this.inViewPort = derived(this, (reader) => isSuggestionInViewport(this._model.editor, this.inlineEdit.inlineCompletion, reader));
    this.onDidAccept = this._model.onDidAccept;
  }
  accept(alternativeAction) {
    this._model.accept(void 0, alternativeAction);
  }
  handleInlineEditShownNextFrame(viewKind, viewData) {
    const item = this.inlineEdit.inlineCompletion;
    const timeWhenShown = Date.now();
    item.addRef();
    setTimeout0(() => {
      this._model.handleInlineSuggestionShown(item, viewKind, viewData, timeWhenShown);
      item.removeRef();
    });
  }
};
export { ModelPerInlineEdit };
