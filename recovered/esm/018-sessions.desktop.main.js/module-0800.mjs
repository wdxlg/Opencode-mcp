// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/inlineCompletionsAccessibleView.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { InlineCompletionContextKeys } from "./module-0697.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TextModelText } from "./module-0521.mjs";
import { LineEdit } from "./module-0376.mjs";
import { TextEdit2 } from "./module-0178.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/inlineCompletionsAccessibleView.ts
var InlineCompletionsAccessibleView = class {
  constructor() {
    this.type = "view" /* View */;
    this.priority = 95;
    this.name = "inline-completions";
    this.when = ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible);
  }
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    const model = InlineCompletionsController.get(editor)?.model.get();
    if (!model?.state.get()) {
      return;
    }
    return new InlineCompletionsAccessibleViewContentProvider(editor, model);
  }
};

var InlineCompletionsAccessibleViewContentProvider = class extends Disposable {
  constructor(_editor, _model) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this.id = "inlineCompletions" /* InlineCompletions */;
    this.verbositySettingKey = "accessibility.verbosity.inlineCompletions";
    this.options = { language: this._editor.getModel()?.getLanguageId() ?? void 0, type: "view" /* View */ };
  }
  provideContent() {
    const state = this._model.state.get();
    if (!state) {
      throw new Error("Inline completion is visible but state is not available");
    }
    if (state.kind === "ghostText") {
      const lineText = this._model.textModel.getLineContent(state.primaryGhostText.lineNumber);
      const ghostText = state.primaryGhostText.renderForScreenReader(lineText);
      if (!ghostText) {
        throw new Error("Inline completion is visible but ghost text is not available");
      }
      return lineText + ghostText;
    } else {
      const text2 = new TextModelText(this._model.textModel);
      const lineEdit = LineEdit.fromTextEdit(new TextEdit2(state.edits), text2);
      return lineEdit.humanReadablePatch(text2.getLines());
    }
  }
  provideNextContent() {
    this._model.next().then((() => this._onDidChangeContent.fire()));
    return;
  }
  providePreviousContent() {
    this._model.previous().then((() => this._onDidChangeContent.fire()));
    return;
  }
  onClose() {
    this._model.stop();
    this._editor.focus();
  }
};
export { InlineCompletionsAccessibleView, InlineCompletionsAccessibleViewContentProvider };
