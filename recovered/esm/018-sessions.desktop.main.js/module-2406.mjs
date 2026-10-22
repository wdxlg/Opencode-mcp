// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/format/formatting.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY } from "./module-1845.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1844.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { CodeActionParticipantUtils } from "./module-2405.mjs";
import { Progress } from "./module-0446.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { formatDocumentWithSelectedProvider, getDocumentFormattingEditsWithSelectedProvider } from "./module-0689.mjs";
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookService } from "./module-0927.mjs";
import { INotebookExecutionService } from "./module-0994.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/format/formatting.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.format",
      title: localize2(17458, "Format Notebook"),
      category: NOTEBOOK_ACTIONS_CATEGORY,
      precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_EDITABLE),
      keybinding: {
        when: EditorContextKeys.editorTextFocus.toNegated(),
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KeyF */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */ },
        weight: 200 /* WorkbenchContrib */
      },
      f1: true,
      menu: {
        id: MenuId.EditorContext,
        when: ContextKeyExpr.and(EditorContextKeys.inCompositeEditor, EditorContextKeys.hasDocumentFormattingProvider),
        group: "1_modification",
        order: 1.3
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const textModelService = accessor.get(ITextModelService);
    const editorWorkerService = accessor.get(IEditorWorkerService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const bulkEditService = accessor.get(IBulkEditService);
    const instantiationService = accessor.get(IInstantiationService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor || !editor.hasModel()) {
      return;
    }
    const notebook = editor.textModel;
    const formatApplied = await instantiationService.invokeFunction(CodeActionParticipantUtils.checkAndRunFormatCodeAction, notebook, Progress.None, CancellationToken.None);
    const disposable = new DisposableStore();
    try {
      if (!formatApplied) {
        const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
          const ref = await textModelService.createModelReference(cell.uri);
          disposable.add(ref);
          const model = ref.object.textEditorModel;
          const formatEdits = await getDocumentFormattingEditsWithSelectedProvider(
            editorWorkerService,
            languageFeaturesService,
            model,
            1 /* Explicit */,
            CancellationToken.None
          );
          const edits = [];
          if (formatEdits) {
            for (const edit3 of formatEdits) {
              edits.push(new ResourceTextEdit(model.uri, edit3, model.getVersionId()));
            }
            return edits;
          }
          return [];
        }));
        await bulkEditService.apply(
          /* edit */
          allCellEdits.flat(),
          { label: localize(17461, null), code: "undoredo.formatNotebook" }
        );
      }
    } finally {
      disposable.dispose();
    }
  }
});

registerEditorAction(class FormatCellAction extends EditorAction {
  constructor() {
    super({
      id: "notebook.formatCell",
      label: localize2(17459, "Format Cell"),
      precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_EDITABLE, EditorContextKeys.inCompositeEditor, EditorContextKeys.writable, EditorContextKeys.hasDocumentFormattingProvider),
      kbOpts: {
        kbExpr: ContextKeyExpr.and(EditorContextKeys.editorTextFocus),
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KeyF */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */ },
        weight: 100 /* EditorContrib */
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 1.301
      }
    });
  }
  async run(accessor, editor) {
    if (editor.hasModel()) {
      const instaService = accessor.get(IInstantiationService);
      await instaService.invokeFunction(formatDocumentWithSelectedProvider, editor, 1 /* Explicit */, Progress.None, CancellationToken.None, true);
    }
  }
});

var FormatOnCellExecutionParticipant = class {
  constructor(bulkEditService, languageFeaturesService, textModelService, editorWorkerService, configurationService, _notebookService) {
    this.bulkEditService = bulkEditService;
    this.languageFeaturesService = languageFeaturesService;
    this.textModelService = textModelService;
    this.editorWorkerService = editorWorkerService;
    this.configurationService = configurationService;
    this._notebookService = _notebookService;
  }
  async onWillExecuteCell(executions) {
    const enabled = this.configurationService.getValue(NotebookSetting.formatOnCellExecution);
    if (!enabled) {
      return;
    }
    const disposable = new DisposableStore();
    try {
      const allCellEdits = await Promise.all(executions.map(async (cellExecution) => {
        const nbModel = this._notebookService.getNotebookTextModel(cellExecution.notebook);
        if (!nbModel) {
          return [];
        }
        let activeCell;
        for (const cell of nbModel.cells) {
          if (cell.handle === cellExecution.cellHandle) {
            activeCell = cell;
            break;
          }
        }
        if (!activeCell) {
          return [];
        }
        const ref = await this.textModelService.createModelReference(activeCell.uri);
        disposable.add(ref);
        const model = ref.object.textEditorModel;
        const formatEdits = await getDocumentFormattingEditsWithSelectedProvider(
          this.editorWorkerService,
          this.languageFeaturesService,
          model,
          2 /* Silent */,
          CancellationToken.None
        );
        const edits = [];
        if (formatEdits) {
          edits.push(...formatEdits.map((edit3) => new ResourceTextEdit(model.uri, edit3, model.getVersionId())));
          return edits;
        }
        return [];
      }));
      await this.bulkEditService.apply(
        /* edit */
        allCellEdits.flat(),
        { label: localize(17460, null), code: "undoredo.notebooks.onWillExecuteFormat" }
      );
    } finally {
      disposable.dispose();
    }
  }
};

FormatOnCellExecutionParticipant = __decorateClass([
  __decorateParam(0, IBulkEditService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IEditorWorkerService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INotebookService)
], FormatOnCellExecutionParticipant);

var CellExecutionParticipantsContribution = class extends Disposable {
  constructor(instantiationService, notebookExecutionService) {
    super();
    this.instantiationService = instantiationService;
    this.notebookExecutionService = notebookExecutionService;
    this.registerKernelExecutionParticipants();
  }
  registerKernelExecutionParticipants() {
    this._register(this.notebookExecutionService.registerExecutionParticipant(this.instantiationService.createInstance(FormatOnCellExecutionParticipant)));
  }
};

CellExecutionParticipantsContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookExecutionService)
], CellExecutionParticipantsContribution);

var workbenchContributionsRegistry2 = Registry.as(Extensions10.Workbench);

workbenchContributionsRegistry2.registerWorkbenchContribution(CellExecutionParticipantsContribution, 3 /* Restored */);
export { FormatOnCellExecutionParticipant, CellExecutionParticipantsContribution, workbenchContributionsRegistry2 };
