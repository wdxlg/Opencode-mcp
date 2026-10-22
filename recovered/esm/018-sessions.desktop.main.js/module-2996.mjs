// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsInputContentProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { SimpleCommentEditor } from "./module-1361.mjs";
import { applyTextEditorOptions } from "./module-1525.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/comments/browser/commentsInputContentProvider.ts
var CommentsInputContentProvider = class extends Disposable {
  constructor(textModelService, codeEditorService, _modelService, _languageService) {
    super();
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._register(textModelService.registerTextModelContentProvider(Schemas.commentsInput, this));
    this._register(codeEditorService.registerCodeEditorOpenHandler(async (input, editor, _sideBySide) => {
      if (!(editor instanceof SimpleCommentEditor)) {
        return null;
      }
      if (editor.getModel()?.uri.toString() !== input.resource.toString()) {
        return null;
      }
      if (input.options) {
        applyTextEditorOptions(input.options, editor, 1 /* Immediate */);
      }
      return editor;
    }));
  }
  static {
    this.ID = "comments.input.contentProvider";
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    return existing ?? this._modelService.createModel("", this._languageService.createById("markdown"), resource);
  }
};

CommentsInputContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], CommentsInputContentProvider);
export { CommentsInputContentProvider };
