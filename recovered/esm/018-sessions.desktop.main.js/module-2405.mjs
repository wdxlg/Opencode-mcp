// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants.ts
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { NotebookMultiCursorController } from "./module-2404.mjs";
import { NotebookFileWorkingCopyModel } from "./module-1398.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { getDocumentFormattingEditsWithSelectedProvider } from "./module-0689.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { Position } from "./module-0079.mjs";
import { trimTrailingWhitespace } from "./module-0702.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Range2 } from "./module-0106.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { applyCodeAction, getCodeActions } from "./module-0559.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants.ts
var NotebookSaveParticipant = class {
  constructor(_editorService) {
    this._editorService = _editorService;
  }
  canParticipate() {
    const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    const controller = editor?.getContribution(NotebookMultiCursorController.id);
    if (!controller) {
      return true;
    }
    return controller.getState() !== 2 /* Editing */;
  }
};

var FormatOnSaveParticipant = class {
  constructor(editorWorkerService, languageFeaturesService, instantiationService, textModelService, bulkEditService, configurationService) {
    this.editorWorkerService = editorWorkerService;
    this.languageFeaturesService = languageFeaturesService;
    this.instantiationService = instantiationService;
    this.textModelService = textModelService;
    this.bulkEditService = bulkEditService;
    this.configurationService = configurationService;
  }
  async participate(workingCopy, context2, progress, token) {
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return;
    }
    if (context2.reason === 2 /* AUTO */) {
      return void 0;
    }
    const enabled = this.configurationService.getValue(NotebookSetting.formatOnSave);
    if (!enabled) {
      return void 0;
    }
    progress.report({ message: localize(17504, null) });
    const notebook = workingCopy.model.notebookModel;
    const formatApplied = await this.instantiationService.invokeFunction(CodeActionParticipantUtils.checkAndRunFormatCodeAction, notebook, progress, token);
    const disposable = new DisposableStore();
    try {
      if (!formatApplied) {
        const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
          const ref = await this.textModelService.createModelReference(cell.uri);
          disposable.add(ref);
          const model = ref.object.textEditorModel;
          const formatEdits = await getDocumentFormattingEditsWithSelectedProvider(
            this.editorWorkerService,
            this.languageFeaturesService,
            model,
            2 /* Silent */,
            token
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
          { label: localize(17502, null), code: "undoredo.formatNotebook" }
        );
      }
    } finally {
      progress.report({ increment: 100 });
      disposable.dispose();
    }
  }
};

FormatOnSaveParticipant = __decorateClass([
  __decorateParam(0, IEditorWorkerService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IBulkEditService),
  __decorateParam(5, IConfigurationService)
], FormatOnSaveParticipant);

var TrimWhitespaceParticipant = class extends NotebookSaveParticipant {
  constructor(configurationService, editorService, textModelService, bulkEditService) {
    super(editorService);
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.textModelService = textModelService;
    this.bulkEditService = bulkEditService;
  }
  async participate(workingCopy, context2, progress, _token) {
    const trimTrailingWhitespaceOption = this.configurationService.getValue("files.trimTrailingWhitespace");
    const trimInRegexAndStrings = this.configurationService.getValue("files.trimTrailingWhitespaceInRegexAndStrings");
    if (trimTrailingWhitespaceOption && this.canParticipate()) {
      await this.doTrimTrailingWhitespace(workingCopy, context2.reason === 2 /* AUTO */, trimInRegexAndStrings, progress);
    }
  }
  async doTrimTrailingWhitespace(workingCopy, isAutoSaved, trimInRegexesAndStrings, progress) {
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return;
    }
    const disposable = new DisposableStore();
    const notebook = workingCopy.model.notebookModel;
    const activeCellEditor = getActiveCellCodeEditor(this.editorService);
    let cursors = [];
    let prevSelection = [];
    try {
      const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
        if (cell.cellKind !== 2 /* Code */) {
          return [];
        }
        const ref = await this.textModelService.createModelReference(cell.uri);
        disposable.add(ref);
        const model = ref.object.textEditorModel;
        const isActiveCell = activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString();
        if (isActiveCell) {
          prevSelection = activeCellEditor.getSelections() ?? [];
          if (isAutoSaved) {
            cursors = prevSelection.map((s) => s.getPosition());
            const snippetsRange = SnippetController2.get(activeCellEditor)?.getSessionEnclosingRange();
            if (snippetsRange) {
              for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                cursors.push(new Position(lineNumber, model.getLineMaxColumn(lineNumber)));
              }
            }
          }
        }
        const ops = trimTrailingWhitespace(model, cursors, trimInRegexesAndStrings);
        if (!ops.length) {
          return [];
        }
        return ops.map((op) => new ResourceTextEdit(model.uri, { ...op, text: op.text || "" }, model.getVersionId()));
      }));
      const filteredEdits = allCellEdits.flat().filter((edit3) => edit3 !== void 0);
      await this.bulkEditService.apply(filteredEdits, { label: localize(17509, null), code: "undoredo.notebookTrimTrailingWhitespace" });
    } finally {
      progress.report({ increment: 100 });
      disposable.dispose();
    }
  }
};

TrimWhitespaceParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IBulkEditService)
], TrimWhitespaceParticipant);

var TrimFinalNewLinesParticipant = class extends NotebookSaveParticipant {
  constructor(configurationService, editorService, bulkEditService) {
    super(editorService);
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.bulkEditService = bulkEditService;
  }
  async participate(workingCopy, context2, progress, _token) {
    if (this.configurationService.getValue("files.trimFinalNewlines") && this.canParticipate()) {
      await this.doTrimFinalNewLines(workingCopy, context2.reason === 2 /* AUTO */, progress);
    }
  }
  /**
   * returns 0 if the entire file is empty
   */
  findLastNonEmptyLine(textBuffer) {
    for (let lineNumber = textBuffer.getLineCount(); lineNumber >= 1; lineNumber--) {
      const lineLength = textBuffer.getLineLength(lineNumber);
      if (lineLength) {
        return lineNumber;
      }
    }
    return 0;
  }
  async doTrimFinalNewLines(workingCopy, isAutoSaved, progress) {
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return;
    }
    const disposable = new DisposableStore();
    const notebook = workingCopy.model.notebookModel;
    const activeCellEditor = getActiveCellCodeEditor(this.editorService);
    try {
      const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
        if (cell.cellKind !== 2 /* Code */) {
          return;
        }
        let cannotTouchLineNumber = 0;
        const isActiveCell = activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString();
        if (isAutoSaved && isActiveCell) {
          const selections = activeCellEditor.getSelections() ?? [];
          for (const sel of selections) {
            cannotTouchLineNumber = Math.max(cannotTouchLineNumber, sel.selectionStartLineNumber);
          }
        }
        const textBuffer = cell.textBuffer;
        const lastNonEmptyLine = this.findLastNonEmptyLine(textBuffer);
        const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
        if (deleteFromLineNumber > textBuffer.getLineCount()) {
          return;
        }
        const deletionRange = new Range2(deleteFromLineNumber, 1, textBuffer.getLineCount(), textBuffer.getLineLastNonWhitespaceColumn(textBuffer.getLineCount()));
        if (deletionRange.isEmpty()) {
          return;
        }
        return new ResourceTextEdit(cell.uri, { range: deletionRange, text: "" }, cell.textModel?.getVersionId());
      }));
      const filteredEdits = allCellEdits.flat().filter((edit3) => edit3 !== void 0);
      await this.bulkEditService.apply(filteredEdits, { label: localize(17508, null), code: "undoredo.trimFinalNewLines" });
    } finally {
      progress.report({ increment: 100 });
      disposable.dispose();
    }
  }
};

TrimFinalNewLinesParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IBulkEditService)
], TrimFinalNewLinesParticipant);

var InsertFinalNewLineParticipant = class extends NotebookSaveParticipant {
  constructor(configurationService, bulkEditService, editorService) {
    super(editorService);
    this.configurationService = configurationService;
    this.bulkEditService = bulkEditService;
    this.editorService = editorService;
  }
  async participate(workingCopy, context2, progress, _token) {
    if (this.configurationService.getValue(NotebookSetting.insertFinalNewline) && this.canParticipate()) {
      await this.doInsertFinalNewLine(workingCopy, context2.reason === 2 /* AUTO */, progress);
    }
  }
  async doInsertFinalNewLine(workingCopy, isAutoSaved, progress) {
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return;
    }
    const disposable = new DisposableStore();
    const notebook = workingCopy.model.notebookModel;
    const activeCellEditor = getActiveCellCodeEditor(this.editorService);
    let selections;
    if (activeCellEditor) {
      selections = activeCellEditor.getSelections() ?? [];
    }
    try {
      const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
        if (cell.cellKind !== 2 /* Code */) {
          return;
        }
        const lineCount = cell.textBuffer.getLineCount();
        const lastLineIsEmptyOrWhitespace = cell.textBuffer.getLineFirstNonWhitespaceColumn(lineCount) === 0;
        if (!lineCount || lastLineIsEmptyOrWhitespace) {
          return;
        }
        return new ResourceTextEdit(cell.uri, { range: new Range2(lineCount + 1, cell.textBuffer.getLineLength(lineCount), lineCount + 1, cell.textBuffer.getLineLength(lineCount)), text: cell.textBuffer.getEOL() }, cell.textModel?.getVersionId());
      }));
      const filteredEdits = allCellEdits.filter((edit3) => edit3 !== void 0);
      await this.bulkEditService.apply(filteredEdits, { label: localize(17503, null), code: "undoredo.insertFinalNewLine" });
      if (activeCellEditor && selections) {
        activeCellEditor.setSelections(selections);
      }
    } finally {
      progress.report({ increment: 100 });
      disposable.dispose();
    }
  }
};

InsertFinalNewLineParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IBulkEditService),
  __decorateParam(2, IEditorService)
], InsertFinalNewLineParticipant);

var CodeActionOnSaveParticipant = class {
  constructor(configurationService, logService, workspaceTrustManagementService, textModelService, instantiationService) {
    this.configurationService = configurationService;
    this.logService = logService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.textModelService = textModelService;
    this.instantiationService = instantiationService;
  }
  async participate(workingCopy, context2, progress, token) {
    const isTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
    if (!isTrusted) {
      return;
    }
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return;
    }
    let saveTrigger = "";
    if (context2.reason === 2 /* AUTO */) {
      return void 0;
    } else if (context2.reason === 1 /* EXPLICIT */) {
      saveTrigger = "explicit";
    } else {
      return void 0;
    }
    const notebookModel = workingCopy.model.notebookModel;
    const setting = this.configurationService.getValue(NotebookSetting.codeActionsOnSave);
    const settingItems = Array.isArray(setting) ? setting : Object.keys(setting).filter((x) => setting[x]);
    const allCodeActions = this.createCodeActionsOnSave(settingItems);
    const excludedActions = allCodeActions.filter((x) => setting[x.value] === "never" || setting[x.value] === false);
    const includedActions = allCodeActions.filter((x) => setting[x.value] === saveTrigger || setting[x.value] === true);
    const editorCodeActionsOnSave = includedActions.filter((x) => !CodeActionKind.Notebook.contains(x));
    const notebookCodeActionsOnSave = includedActions.filter((x) => CodeActionKind.Notebook.contains(x));
    if (notebookCodeActionsOnSave.length) {
      const nbDisposable = new DisposableStore();
      progress.report({ message: localize(17507, null) });
      try {
        const cell = notebookModel.cells[0];
        const ref = await this.textModelService.createModelReference(cell.uri);
        nbDisposable.add(ref);
        const textEditorModel = ref.object.textEditorModel;
        await this.instantiationService.invokeFunction(CodeActionParticipantUtils.applyOnSaveGenericCodeActions, textEditorModel, notebookCodeActionsOnSave, excludedActions, progress, token);
      } catch {
        this.logService.error("Failed to apply notebook code action on save");
      } finally {
        progress.report({ increment: 100 });
        nbDisposable.dispose();
      }
    }
    if (editorCodeActionsOnSave.length) {
      if (!Array.isArray(setting)) {
        editorCodeActionsOnSave.sort((a, b) => {
          if (CodeActionKind.SourceFixAll.contains(a)) {
            if (CodeActionKind.SourceFixAll.contains(b)) {
              return 0;
            }
            return -1;
          }
          if (CodeActionKind.SourceFixAll.contains(b)) {
            return 1;
          }
          return 0;
        });
      }
      const cellDisposable = new DisposableStore();
      progress.report({ message: localize(17505, null) });
      try {
        await Promise.all(notebookModel.cells.map(async (cell) => {
          const ref = await this.textModelService.createModelReference(cell.uri);
          cellDisposable.add(ref);
          const textEditorModel = ref.object.textEditorModel;
          await this.instantiationService.invokeFunction(CodeActionParticipantUtils.applyOnSaveGenericCodeActions, textEditorModel, editorCodeActionsOnSave, excludedActions, progress, token);
        }));
      } catch {
        this.logService.error("Failed to apply code action on save");
      } finally {
        progress.report({ increment: 100 });
        cellDisposable.dispose();
      }
    }
  }
  createCodeActionsOnSave(settingItems) {
    const kinds = settingItems.map((x) => new HierarchicalKind(x));
    return kinds.filter((kind) => {
      return kinds.every((otherKind) => otherKind.equals(kind) || !otherKind.contains(kind));
    });
  }
};

CodeActionOnSaveParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IWorkspaceTrustManagementService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IInstantiationService)
], CodeActionOnSaveParticipant);

var CodeActionParticipantUtils = class _CodeActionParticipantUtils {
  static async checkAndRunFormatCodeAction(accessor, notebookModel, progress, token) {
    const instantiationService = accessor.get(IInstantiationService);
    const textModelService = accessor.get(ITextModelService);
    const logService = accessor.get(ILogService);
    const configurationService = accessor.get(IConfigurationService);
    const formatDisposable = new DisposableStore();
    let formatResult = false;
    progress.report({ message: localize(17506, null) });
    try {
      const cell = notebookModel.cells[0];
      const ref = await textModelService.createModelReference(cell.uri);
      formatDisposable.add(ref);
      const textEditorModel = ref.object.textEditorModel;
      const defaultFormatterExtId = configurationService.getValue(NotebookSetting.defaultFormatter);
      formatResult = await instantiationService.invokeFunction(_CodeActionParticipantUtils.applyOnSaveFormatCodeAction, textEditorModel, new HierarchicalKind("notebook.format"), [], defaultFormatterExtId, progress, token);
    } catch {
      logService.error("Failed to apply notebook format action on save");
    } finally {
      progress.report({ increment: 100 });
      formatDisposable.dispose();
    }
    return formatResult;
  }
  static async applyOnSaveGenericCodeActions(accessor, model, codeActionsOnSave, excludes, progress, token) {
    const instantiationService = accessor.get(IInstantiationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const logService = accessor.get(ILogService);
    const getActionProgress = new class {
      constructor() {
        this._names = /* @__PURE__ */ new Set();
      }
      _report() {
        progress.report({
          message: localize(
            17501,
            null,
            [...this._names].map((name) => `'${name}'`).join(", "),
            "command:workbench.action.openSettings?%5B%22notebook.codeActionsOnSave%22%5D"
          )
        });
      }
      report(provider) {
        if (provider.displayName && !this._names.has(provider.displayName)) {
          this._names.add(provider.displayName);
          this._report();
        }
      }
    }();
    for (const codeActionKind of codeActionsOnSave) {
      const actionsToRun = await _CodeActionParticipantUtils.getActionsToRun(model, codeActionKind, excludes, languageFeaturesService, getActionProgress, token);
      if (token.isCancellationRequested) {
        actionsToRun.dispose();
        return;
      }
      try {
        for (const action of actionsToRun.validActions) {
          const codeActionEdits = action.action.edit?.edits;
          let breakFlag = false;
          if (!action.action.kind?.startsWith("notebook")) {
            for (const edit3 of codeActionEdits ?? []) {
              const workspaceTextEdit = edit3;
              if (workspaceTextEdit.resource && isEqual2(workspaceTextEdit.resource, model.uri)) {
                continue;
              } else {
                breakFlag = true;
                break;
              }
            }
          }
          if (breakFlag) {
            logService.warn("Failed to apply code action on save, applied to multiple resources.");
            continue;
          }
          progress.report({ message: localize(17500, null, action.action.title) });
          await instantiationService.invokeFunction(applyCodeAction, action, "onSave" /* OnSave */, {}, token);
          if (token.isCancellationRequested) {
            return;
          }
        }
      } catch {
      } finally {
        actionsToRun.dispose();
      }
    }
  }
  static async applyOnSaveFormatCodeAction(accessor, model, formatCodeActionOnSave, excludes, extensionId, progress, token) {
    const instantiationService = accessor.get(IInstantiationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const logService = accessor.get(ILogService);
    const getActionProgress = new class {
      constructor() {
        this._names = /* @__PURE__ */ new Set();
      }
      _report() {
        progress.report({
          message: localize(
            17501,
            null,
            [...this._names].map((name) => `'${name}'`).join(", "),
            "command:workbench.action.openSettings?%5B%22notebook.defaultFormatter%22%5D"
          )
        });
      }
      report(provider) {
        if (provider.displayName && !this._names.has(provider.displayName)) {
          this._names.add(provider.displayName);
          this._report();
        }
      }
    }();
    const providedActions = await _CodeActionParticipantUtils.getActionsToRun(model, formatCodeActionOnSave, excludes, languageFeaturesService, getActionProgress, token);
    if (providedActions.validActions.length > 1 && !extensionId) {
      logService.warn("More than one format code action is provided, the 0th one will be used. A default can be specified via `notebook.defaultFormatter` in your settings.");
    }
    if (token.isCancellationRequested) {
      providedActions.dispose();
      return false;
    }
    try {
      const action = extensionId ? providedActions.validActions.find((action2) => action2.provider?.extensionId === extensionId) : providedActions.validActions[0];
      if (!action) {
        return false;
      }
      progress.report({ message: localize(17500, null, action.action.title) });
      await instantiationService.invokeFunction(applyCodeAction, action, "onSave" /* OnSave */, {}, token);
      if (token.isCancellationRequested) {
        return false;
      }
    } catch {
      logService.error("Failed to apply notebook format code action on save");
      return false;
    } finally {
      providedActions.dispose();
    }
    return true;
  }
  // @Yoyokrazy this could likely be modified to leverage the extensionID, therefore not getting actions from providers unnecessarily -- future work
  static getActionsToRun(model, codeActionKind, excludes, languageFeaturesService, progress, token) {
    return getCodeActions(languageFeaturesService.codeActionProvider, model, model.getFullModelRange(), {
      type: 1 /* Invoke */,
      triggerAction: "save participants" /* OnSave */,
      filter: { include: codeActionKind, excludes, includeSourceActions: true }
    }, progress, token);
  }
};

function getActiveCellCodeEditor(editorService) {
  const activePane = editorService.activeEditorPane;
  const notebookEditor = getNotebookEditorFromEditorPane(activePane);
  const activeCodeEditor = notebookEditor?.activeCodeEditor;
  return activeCodeEditor;
}

var SaveParticipantsContribution = class extends Disposable {
  constructor(instantiationService, workingCopyFileService) {
    super();
    this.instantiationService = instantiationService;
    this.workingCopyFileService = workingCopyFileService;
    this.registerSaveParticipants();
  }
  registerSaveParticipants() {
    this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant)));
    this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant)));
    this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant)));
    this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(InsertFinalNewLineParticipant)));
    this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant)));
  }
};

SaveParticipantsContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyFileService)
], SaveParticipantsContribution);

var workbenchContributionsRegistry = Registry.as(Extensions10.Workbench);

workbenchContributionsRegistry.registerWorkbenchContribution(SaveParticipantsContribution, 3 /* Restored */);
export { getActiveCellCodeEditor, NotebookSaveParticipant, FormatOnSaveParticipant, TrimWhitespaceParticipant, TrimFinalNewLinesParticipant, InsertFinalNewLineParticipant, CodeActionOnSaveParticipant, CodeActionParticipantUtils, SaveParticipantsContribution, workbenchContributionsRegistry };
