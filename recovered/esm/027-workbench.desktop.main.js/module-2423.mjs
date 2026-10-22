// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint.ts
import { EmptyTextEditorHintContribution } from "./module-2422.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint.ts
var EmptyCellEditorHintContribution = class extends EmptyTextEditorHintContribution {
  constructor(editor, _editorService, configurationService, inlineChatSessionService, chatAgentService, instantiationService) {
    super(
      editor,
      configurationService,
      inlineChatSessionService,
      chatAgentService,
      instantiationService
    );
    this._editorService = _editorService;
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (!activeEditor) {
      return;
    }
    this._register(activeEditor.onDidChangeActiveCell(() => this.update()));
  }
  static {
    this.CONTRIB_ID = "notebook.editor.contrib.emptyCellEditorHint";
  }
  shouldRenderHint() {
    const model = this.editor.getModel();
    if (!model) {
      return false;
    }
    const isNotebookCell = model?.uri.scheme === Schemas.vscodeNotebookCell;
    if (!isNotebookCell) {
      return false;
    }
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (!activeEditor || !activeEditor.isDisposed) {
      return false;
    }
    const shouldRenderHint = super.shouldRenderHint();
    if (!shouldRenderHint) {
      return false;
    }
    const activeCell = activeEditor.getActiveCell();
    if (activeCell?.uri.fragment !== model.uri.fragment) {
      return false;
    }
    return true;
  }
};

EmptyCellEditorHintContribution = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInlineChatSessionService),
  __decorateParam(4, IChatAgentService),
  __decorateParam(5, IInstantiationService)
], EmptyCellEditorHintContribution);

registerEditorContribution(EmptyCellEditorHintContribution.CONTRIB_ID, EmptyCellEditorHintContribution, 0 /* Eager */);
export { EmptyCellEditorHintContribution };
