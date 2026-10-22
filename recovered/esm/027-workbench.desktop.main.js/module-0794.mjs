// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViewProducer.ts
import { Disposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { Range2 } from "./module-0106.mjs";
import { TextEdit2, TextReplacement } from "./module-0178.mjs";
import { InlineEditWithChanges } from "./module-0776.mjs";
import { ModelPerInlineEdit } from "./module-0777.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { InlineEditsView } from "./module-0793.mjs";
import { InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from "./module-0774.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViewProducer.ts
var InlineEditsViewAndDiffProducer = class extends Disposable {
  constructor(_editor, _model, _showCollapsed, instantiationService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._showCollapsed = _showCollapsed;
    this._inlineEdit = derived(this, (reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return void 0;
      }
      const textModel = this._editor.getModel();
      if (!textModel) {
        return void 0;
      }
      const state = model.inlineEditState.read(reader);
      if (!state) {
        return void 0;
      }
      const action = state.inlineSuggestion.action;
      let diffEdits;
      if (action?.kind === "edit") {
        const editOffset = action.stringEdit;
        const t2 = state.inlineSuggestion.originalTextRef.getTransformer();
        const edits = editOffset.replacements.map((e) => {
          const innerEditRange = Range2.fromPositions(
            t2.getPosition(e.replaceRange.start),
            t2.getPosition(e.replaceRange.endExclusive)
          );
          return new TextReplacement(innerEditRange, e.newText);
        });
        diffEdits = new TextEdit2(edits);
      } else {
        diffEdits = void 0;
      }
      return new InlineEditWithChanges(
        state.inlineSuggestion.originalTextRef,
        action,
        diffEdits,
        model.primaryPosition.read(void 0),
        model.allPositions.read(void 0),
        state.inlineSuggestion.source.inlineSuggestions.commands ?? [],
        state.inlineSuggestion
      );
    });
    this._inlineEditModel = derived(this, (reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return void 0;
      }
      const edit3 = this._inlineEdit.read(reader);
      if (!edit3) {
        return void 0;
      }
      const tabAction = derived(this, (reader2) => {
        if (this._editorObs.isFocused.read(reader2)) {
          if (model.tabShouldJumpToInlineEdit.read(reader2)) {
            return "jump" /* Jump */;
          }
          if (model.tabShouldAcceptInlineEdit.read(reader2)) {
            return "accept" /* Accept */;
          }
        }
        return "inactive" /* Inactive */;
      });
      return new ModelPerInlineEdit(model, edit3, tabAction);
    });
    this._editorObs = observableCodeEditor(this._editor);
    this.view = this._register(instantiationService.createInstance(
      InlineEditsView,
      this._editor,
      this._inlineEditModel,
      this._model.map((model) => model ? SimpleInlineSuggestModel.fromInlineCompletionModel(model) : void 0),
      this._inlineEdit.map((e) => e ? InlineSuggestionGutterMenuData.fromInlineSuggestion(e.inlineCompletion) : void 0),
      this._showCollapsed
    ));
  }
};

InlineEditsViewAndDiffProducer = __decorateClass([
  __decorateParam(3, IInstantiationService)
], InlineEditsViewAndDiffProducer);
export { InlineEditsViewAndDiffProducer };
