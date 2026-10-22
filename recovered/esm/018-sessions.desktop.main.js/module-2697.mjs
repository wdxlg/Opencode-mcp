// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNotebookCellEntry.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatEditingTextModelChangeService } from "./module-2694.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNotebookCellEntry.ts
var ChatEditingNotebookCellEntry = class extends Disposable {
  constructor(notebookUri, cell, modifiedModel, originalModel, isExternalEditInProgress, disposables, notebookEditorService, instantiationService) {
    super();
    this.notebookUri = notebookUri;
    this.cell = cell;
    this.modifiedModel = modifiedModel;
    this.originalModel = originalModel;
    this.notebookEditorService = notebookEditorService;
    this.instantiationService = instantiationService;
    this._maxModifiedLineNumber = observableValue(this, 0);
    this.maxModifiedLineNumber = this._maxModifiedLineNumber;
    this._stateObs = observableValue(this, 0 /* Modified */);
    this.state = this._stateObs;
    this.initialContent = this.originalModel.getValue();
    this._register(disposables);
    this._textModelChangeService = this._register(this.instantiationService.createInstance(ChatEditingTextModelChangeService, this.originalModel, this.modifiedModel, this.state, isExternalEditInProgress));
    this._register(this._textModelChangeService.onDidAcceptOrRejectAllHunks((action) => {
      this.revertMarkdownPreviewState();
      this._stateObs.set(action, void 0);
    }));
    this._register(this._textModelChangeService.onDidUserEditModel(() => {
      const didResetToOriginalContent = this.modifiedModel.getValue() === this.initialContent;
      if (this._stateObs.get() === 0 /* Modified */ && didResetToOriginalContent) {
        this._stateObs.set(2 /* Rejected */, void 0);
      }
    }));
  }
  get isDisposed() {
    return this._store.isDisposed;
  }
  get isEditFromUs() {
    return this._textModelChangeService.isEditFromUs;
  }
  get allEditsAreFromUs() {
    return this._textModelChangeService.allEditsAreFromUs;
  }
  get diffInfo() {
    return this._textModelChangeService.diffInfo;
  }
  clearCurrentEditLineDecoration() {
    if (this.modifiedModel.isDisposed()) {
      return;
    }
    this._textModelChangeService.clearCurrentEditLineDecoration();
  }
  async acceptAgentEdits(textEdits, isLastEdits, responseModel) {
    const { maxLineNumber } = await this._textModelChangeService.acceptAgentEdits(this.modifiedModel.uri, textEdits, isLastEdits, responseModel);
    transaction((tx) => {
      if (!isLastEdits) {
        this._stateObs.set(0 /* Modified */, tx);
        this._maxModifiedLineNumber.set(maxLineNumber, tx);
      } else {
        this._maxModifiedLineNumber.set(0, tx);
      }
    });
  }
  revertMarkdownPreviewState() {
    if (this.cell.cellKind !== 1 /* Markup */) {
      return;
    }
    const notebookEditor = this.notebookEditorService.retrieveExistingWidgetFromURI(this.notebookUri)?.value;
    if (notebookEditor) {
      const vm = notebookEditor.getCellByHandle(this.cell.handle);
      if (vm?.getEditState() === 1 /* Editing */ && (vm.editStateSource === "chatEdit" || vm.editStateSource === "chatEditNavigation")) {
        vm?.updateEditState(0 /* Preview */, "chatEdit");
      }
    }
  }
  async keep(change) {
    return this._textModelChangeService.diffInfo.get().keep(change);
  }
  async undo(change) {
    return this._textModelChangeService.diffInfo.get().undo(change);
  }
};

ChatEditingNotebookCellEntry = __decorateClass([
  __decorateParam(6, INotebookEditorService),
  __decorateParam(7, IInstantiationService)
], ChatEditingNotebookCellEntry);
export { ChatEditingNotebookCellEntry };
