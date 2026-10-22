// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/saveParticipants.ts
import { SnippetController2 } from "./module-0714.mjs";
import { Position } from "./module-0079.mjs";
import { trimTrailingWhitespace } from "./module-0702.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { lastNonWhitespaceIndex } from "./module-0030.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";
import { Progress } from "./module-0446.mjs";
import { localize } from "./module-0001.mjs";
import { createCommandUri } from "./module-0462.mjs";
import { formatDocumentRangesWithSelectedProvider, formatDocumentWithSelectedProvider } from "./module-0689.mjs";
import { getModifiedRanges } from "./module-3299.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { applyCodeAction, getCodeActions } from "./module-0559.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IHostService } from "./module-1118.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/codeEditor/browser/saveParticipants.ts
var TrimWhitespaceParticipant2 = class {
  constructor(configurationService, codeEditorService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  async participate(model, context2) {
    if (!model.textEditorModel) {
      return;
    }
    const trimTrailingWhitespaceOption = this.configurationService.getValue("files.trimTrailingWhitespace", { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource });
    const trimInRegexAndStrings = this.configurationService.getValue("files.trimTrailingWhitespaceInRegexAndStrings", { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource });
    if (trimTrailingWhitespaceOption) {
      this.doTrimTrailingWhitespace(model.textEditorModel, context2.reason === 2 /* AUTO */, trimInRegexAndStrings);
    }
  }
  doTrimTrailingWhitespace(model, isAutoSaved, trimInRegexesAndStrings) {
    let prevSelection = [];
    let cursors = [];
    const editor = findEditor(model, this.codeEditorService);
    if (editor) {
      prevSelection = editor.getSelections();
      if (isAutoSaved) {
        cursors = prevSelection.map((s) => s.getPosition());
        const snippetsRange = SnippetController2.get(editor)?.getSessionEnclosingRange();
        if (snippetsRange) {
          for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
            cursors.push(new Position(lineNumber, model.getLineMaxColumn(lineNumber)));
          }
        }
      }
    }
    const ops = trimTrailingWhitespace(model, cursors, trimInRegexesAndStrings);
    if (!ops.length) {
      return;
    }
    model.pushEditOperations(prevSelection, ops, (_edits) => prevSelection);
  }
};

TrimWhitespaceParticipant2 = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService)
], TrimWhitespaceParticipant2);

function findEditor(model, codeEditorService) {
  let candidate = null;
  if (model.isAttachedToEditor()) {
    for (const editor of codeEditorService.listCodeEditors()) {
      if (editor.hasModel() && editor.getModel() === model) {
        if (editor.hasTextFocus()) {
          return editor;
        }
        candidate = editor;
      }
    }
  }
  return candidate;
}

var FinalNewLineParticipant = class {
  constructor(configurationService, codeEditorService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  async participate(model, context2) {
    if (!model.textEditorModel) {
      return;
    }
    if (this.configurationService.getValue("files.insertFinalNewline", { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
      this.doInsertFinalNewLine(model.textEditorModel);
    }
  }
  doInsertFinalNewLine(model) {
    const lineCount = model.getLineCount();
    const lastLine = model.getLineContent(lineCount);
    const lastLineIsEmptyOrWhitespace = lastNonWhitespaceIndex(lastLine) === -1;
    if (!lineCount || lastLineIsEmptyOrWhitespace) {
      return;
    }
    const edits = [EditOperation.insert(new Position(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL())];
    const editor = findEditor(model, this.codeEditorService);
    if (editor) {
      editor.executeEdits("insertFinalNewLine", edits, editor.getSelections());
    } else {
      model.pushEditOperations([], edits, () => null);
    }
  }
};

FinalNewLineParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService)
], FinalNewLineParticipant);

var TrimFinalNewLinesParticipant2 = class {
  constructor(configurationService, codeEditorService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  async participate(model, context2) {
    if (!model.textEditorModel) {
      return;
    }
    if (this.configurationService.getValue("files.trimFinalNewlines", { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
      this.doTrimFinalNewLines(model.textEditorModel, context2.reason === 2 /* AUTO */);
    }
  }
  /**
   * returns 0 if the entire file is empty
   */
  findLastNonEmptyLine(model) {
    for (let lineNumber = model.getLineCount(); lineNumber >= 1; lineNumber--) {
      const lineLength = model.getLineLength(lineNumber);
      if (lineLength > 0) {
        return lineNumber;
      }
    }
    return 0;
  }
  doTrimFinalNewLines(model, isAutoSaved) {
    const lineCount = model.getLineCount();
    if (lineCount === 1) {
      return;
    }
    let prevSelection = [];
    let cannotTouchLineNumber = 0;
    const editor = findEditor(model, this.codeEditorService);
    if (editor) {
      prevSelection = editor.getSelections();
      if (isAutoSaved) {
        for (let i2 = 0, len = prevSelection.length; i2 < len; i2++) {
          const positionLineNumber = prevSelection[i2].positionLineNumber;
          if (positionLineNumber > cannotTouchLineNumber) {
            cannotTouchLineNumber = positionLineNumber;
          }
        }
      }
    }
    const lastNonEmptyLine = this.findLastNonEmptyLine(model);
    const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
    const deletionRange = model.validateRange(new Range2(deleteFromLineNumber, 1, lineCount, model.getLineMaxColumn(lineCount)));
    if (deletionRange.isEmpty()) {
      return;
    }
    model.pushEditOperations(prevSelection, [EditOperation.delete(deletionRange)], (_edits) => prevSelection);
    editor?.setSelections(prevSelection);
  }
};

TrimFinalNewLinesParticipant2 = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService)
], TrimFinalNewLinesParticipant2);

var FormatOnSaveParticipant2 = class {
  constructor(configurationService, codeEditorService, instantiationService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
    this.instantiationService = instantiationService;
  }
  async participate(model, context2, progress, token) {
    if (!model.textEditorModel) {
      return;
    }
    if (context2.reason === 2 /* AUTO */) {
      return void 0;
    }
    const textEditorModel = model.textEditorModel;
    const overrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
    const nestedProgress = new Progress((provider) => {
      progress.report({
        message: localize(
          13826,
          null,
          provider.displayName || provider.extensionId && provider.extensionId.value || "???",
          createCommandUri("workbench.action.openSettings", "editor.formatOnSave").toString()
        )
      });
    });
    const enabled = this.configurationService.getValue("editor.formatOnSave", overrides);
    if (!enabled) {
      return void 0;
    }
    const editorOrModel = findEditor(textEditorModel, this.codeEditorService) || textEditorModel;
    const mode = this.configurationService.getValue("editor.formatOnSaveMode", overrides);
    if (mode === "file") {
      await this.instantiationService.invokeFunction(formatDocumentWithSelectedProvider, editorOrModel, 2 /* Silent */, nestedProgress, token);
    } else {
      const ranges = await this.instantiationService.invokeFunction(getModifiedRanges, isCodeEditor(editorOrModel) ? editorOrModel.getModel() : editorOrModel);
      if (ranges === null && mode === "modificationsIfAvailable") {
        await this.instantiationService.invokeFunction(formatDocumentWithSelectedProvider, editorOrModel, 2 /* Silent */, nestedProgress, token);
      } else if (ranges) {
        await this.instantiationService.invokeFunction(formatDocumentRangesWithSelectedProvider, editorOrModel, ranges, 2 /* Silent */, nestedProgress, token, false);
      }
    }
  }
};

FormatOnSaveParticipant2 = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IInstantiationService)
], FormatOnSaveParticipant2);

var CodeActionOnSaveParticipant2 = class extends Disposable {
  constructor(configurationService, instantiationService, languageFeaturesService, hostService, editorService, codeEditorService) {
    super();
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.languageFeaturesService = languageFeaturesService;
    this.hostService = hostService;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this._register(this.hostService.onDidChangeFocus(() => {
      this.triggerCodeActionsCommand();
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this.triggerCodeActionsCommand();
    }));
  }
  async triggerCodeActionsCommand() {
    if (this.configurationService.getValue("editor.codeActions.triggerOnFocusChange") && this.configurationService.getValue("files.autoSave") === "afterDelay") {
      const model = this.codeEditorService.getActiveCodeEditor()?.getModel();
      if (!model) {
        return void 0;
      }
      const settingsOverrides = { overrideIdentifier: model.getLanguageId(), resource: model.uri };
      const setting = this.configurationService.getValue("editor.codeActionsOnSave", settingsOverrides);
      if (!setting) {
        return void 0;
      }
      if (Array.isArray(setting)) {
        return void 0;
      }
      const settingItems = Object.keys(setting).filter((x) => setting[x] && setting[x] === "always" && CodeActionKind.Source.contains(new HierarchicalKind(x)));
      const cancellationTokenSource = new CancellationTokenSource();
      const codeActionKindList = [];
      for (const item of settingItems) {
        codeActionKindList.push(new HierarchicalKind(item));
      }
      await this.applyOnSaveActions(model, codeActionKindList, [], Progress.None, cancellationTokenSource.token);
    }
  }
  async participate(model, context2, progress, token) {
    if (!model.textEditorModel) {
      return;
    }
    const textEditorModel = model.textEditorModel;
    const settingsOverrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
    const setting = this.configurationService.getValue("editor.codeActionsOnSave", settingsOverrides);
    if (!setting) {
      return void 0;
    }
    if (context2.reason === 2 /* AUTO */) {
      return void 0;
    }
    if (context2.reason !== 1 /* EXPLICIT */ && Array.isArray(setting)) {
      return void 0;
    }
    const settingItems = Array.isArray(setting) ? setting : Object.keys(setting).filter((x) => setting[x] && setting[x] !== "never");
    const codeActionsOnSave = this.createCodeActionsOnSave(settingItems);
    if (!Array.isArray(setting)) {
      codeActionsOnSave.sort((a, b) => {
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
    if (!codeActionsOnSave.length) {
      return void 0;
    }
    const excludedActions = Array.isArray(setting) ? [] : Object.keys(setting).filter((x) => setting[x] === "never" || false).map((x) => new HierarchicalKind(x));
    progress.report({ message: localize(13823, null) });
    const filteredSaveList = Array.isArray(setting) ? codeActionsOnSave : codeActionsOnSave.filter((x) => setting[x.value] === "always" || (setting[x.value] === "explicit" || setting[x.value] === true) && context2.reason === 1 /* EXPLICIT */);
    await this.applyOnSaveActions(textEditorModel, filteredSaveList, excludedActions, progress, token);
  }
  createCodeActionsOnSave(settingItems) {
    const kinds = settingItems.map((x) => new HierarchicalKind(x));
    return kinds.filter((kind) => {
      return kinds.every((otherKind) => otherKind.equals(kind) || !otherKind.contains(kind));
    });
  }
  async applyOnSaveActions(model, codeActionsOnSave, excludes, progress, token) {
    const getActionProgress = new class {
      constructor() {
        this._names = /* @__PURE__ */ new Set();
      }
      _report() {
        progress.report({
          message: localize(
            13825,
            null,
            [...this._names].map((name) => `'${name}'`).join(", "),
            createCommandUri("workbench.action.openSettings", "editor.codeActionsOnSave").toString()
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
      const actionsToRun = await this.getActionsToRun(model, codeActionKind, excludes, getActionProgress, token);
      if (token.isCancellationRequested) {
        actionsToRun.dispose();
        return;
      }
      try {
        for (const action of actionsToRun.validActions) {
          progress.report({ message: localize(13824, null, action.action.title) });
          await this.instantiationService.invokeFunction(applyCodeAction, action, "onSave" /* OnSave */, {}, token);
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
  getActionsToRun(model, codeActionKind, excludes, progress, token) {
    return getCodeActions(this.languageFeaturesService.codeActionProvider, model, model.getFullModelRange(), {
      type: 2 /* Auto */,
      triggerAction: "save participants" /* OnSave */,
      filter: { include: codeActionKind, excludes, includeSourceActions: true }
    }, progress, token);
  }
};

CodeActionOnSaveParticipant2 = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IHostService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, ICodeEditorService)
], CodeActionOnSaveParticipant2);

var SaveParticipantsContribution2 = class extends Disposable {
  constructor(instantiationService, textFileService) {
    super();
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.registerSaveParticipants();
  }
  registerSaveParticipants() {
    this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant2)));
    this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant2)));
    this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant2)));
    this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FinalNewLineParticipant)));
    this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant2)));
  }
};

SaveParticipantsContribution2 = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextFileService)
], SaveParticipantsContribution2);

var workbenchContributionsRegistry6 = Registry.as(Extensions10.Workbench);

workbenchContributionsRegistry6.registerWorkbenchContribution(SaveParticipantsContribution2, 3 /* Restored */);
export { findEditor, TrimWhitespaceParticipant2, FinalNewLineParticipant, TrimFinalNewLinesParticipant2, FormatOnSaveParticipant2, CodeActionOnSaveParticipant2, SaveParticipantsContribution2, workbenchContributionsRegistry6 };
