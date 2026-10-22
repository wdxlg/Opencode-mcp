// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/codeBlockOperations.ts
import { localize } from "./module-0001.mjs";
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { EditDeltaInfo } from "./module-0377.mjs";
import { isAgentHostSessionResource } from "./module-0961.mjs";
import { insertCell } from "./module-1976.mjs";
import { Range2 } from "./module-0106.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IChatService } from "./module-0973.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { reviewEdits, reviewNotebookEdits } from "./module-2508.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { ICodeMapperService } from "./module-1034.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookService } from "./module-0927.mjs";
import { NOTEBOOK_EDITOR_ID } from "./module-0911.mjs";
import { splitLines } from "./module-0030.mjs";


// src/vs/workbench/contrib/chat/browser/actions/codeBlockOperations.ts
var InsertCodeBlockOperation = class {
  constructor(editorService, textFileService, bulkEditService, codeEditorService, chatService, languageService, dialogService, aiEditTelemetryService) {
    this.editorService = editorService;
    this.textFileService = textFileService;
    this.bulkEditService = bulkEditService;
    this.codeEditorService = codeEditorService;
    this.chatService = chatService;
    this.languageService = languageService;
    this.dialogService = dialogService;
    this.aiEditTelemetryService = aiEditTelemetryService;
  }
  async run(context2) {
    const activeEditorControl = getEditableActiveCodeEditor(this.editorService);
    if (activeEditorControl) {
      await this.handleTextEditor(activeEditorControl, context2);
    } else {
      const activeNotebookEditor = getActiveNotebookEditor(this.editorService);
      if (activeNotebookEditor) {
        await this.handleNotebookEditor(activeNotebookEditor, context2);
      } else {
        this.notify(localize(8829, null));
      }
    }
    if (isResponseVM(context2.element)) {
      const requestId = context2.element.requestId;
      const request2 = context2.element.session.getItems().find((item) => item.id === requestId && isRequestVM(item));
      notifyUserAction(this.chatService, context2, {
        kind: "insert",
        codeBlockIndex: context2.codeBlockIndex,
        totalCharacters: context2.code.length,
        totalLines: context2.code.split("\n").length,
        languageId: context2.languageId,
        modelId: request2?.modelId ?? ""
      });
      const codeBlockInfo = context2.element.model.codeBlockInfos?.at(context2.codeBlockIndex);
      this.aiEditTelemetryService.handleCodeAccepted({
        acceptanceMethod: "insertAtCursor",
        suggestionId: codeBlockInfo?.suggestionId,
        editDeltaInfo: EditDeltaInfo.fromText(context2.code),
        feature: "sideBarChat",
        languageId: context2.languageId,
        modeId: context2.element.model.request?.modeInfo?.telemetryModeId,
        modelId: request2?.modelId,
        presentation: "codeBlock",
        applyCodeBlockSuggestionId: void 0,
        source: void 0,
        sourceRequestId: void 0,
        isAgentHostSession: isAgentHostSessionResource(context2.element.sessionResource)
      });
    }
  }
  async handleNotebookEditor(notebookEditor, codeBlockContext) {
    if (notebookEditor.isReadOnly) {
      this.notify(localize(8831, null));
      return false;
    }
    const focusRange = notebookEditor.getFocus();
    const next = Math.max(focusRange.end - 1, 0);
    insertCell(this.languageService, notebookEditor, next, 2 /* Code */, "below", codeBlockContext.code, true);
    return true;
  }
  async handleTextEditor(codeEditor, codeBlockContext) {
    const activeModel = codeEditor.getModel();
    if (isReadOnly(activeModel, this.textFileService)) {
      this.notify(localize(8830, null));
      return false;
    }
    const range2 = codeEditor.getSelection() ?? new Range2(activeModel.getLineCount(), 1, activeModel.getLineCount(), 1);
    const text2 = reindent(codeBlockContext.code, activeModel, range2.startLineNumber);
    const edits = [new ResourceTextEdit(activeModel.uri, { range: range2, text: text2 })];
    await this.bulkEditService.apply(edits);
    this.codeEditorService.listCodeEditors().find((editor) => isEqual2(editor.getModel()?.uri, activeModel.uri))?.focus();
    return true;
  }
  notify(message) {
    this.dialogService.info(message);
  }
};

InsertCodeBlockOperation = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IBulkEditService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IChatService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IAiEditTelemetryService)
], InsertCodeBlockOperation);

var ApplyCodeBlockOperation = class {
  constructor(editorService, textFileService, chatService, fileService, dialogService, logService, codeMapperService, progressService, quickInputService, labelService, instantiationService, notebookService) {
    this.editorService = editorService;
    this.textFileService = textFileService;
    this.chatService = chatService;
    this.fileService = fileService;
    this.dialogService = dialogService;
    this.logService = logService;
    this.codeMapperService = codeMapperService;
    this.progressService = progressService;
    this.quickInputService = quickInputService;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.notebookService = notebookService;
  }
  async run(context2) {
    let activeEditorControl = getEditableActiveCodeEditor(this.editorService);
    const codemapperUri = await this.evaluateURIToUse(context2.codemapperUri, activeEditorControl);
    if (!codemapperUri) {
      return;
    }
    if (codemapperUri && !isEqual2(activeEditorControl?.getModel().uri, codemapperUri) && !this.notebookService.hasSupportedNotebooks(codemapperUri)) {
      try {
        const editorPane = await this.editorService.openEditor({ resource: codemapperUri });
        const codeEditor = getCodeEditor(editorPane?.getControl());
        if (codeEditor && codeEditor.hasModel()) {
          this.tryToRevealCodeBlock(codeEditor, context2.code);
          activeEditorControl = codeEditor;
        } else {
          this.notify(localize(8821, null, codemapperUri.toString()));
          return;
        }
      } catch (e4) {
        this.logService.info("[ApplyCodeBlockOperation] error opening code mapper file", codemapperUri, e4);
        return;
      }
    }
    let codeBlockSuggestionId = void 0;
    if (isResponseVM(context2.element)) {
      const codeBlockInfo = context2.element.model.codeBlockInfos?.at(context2.codeBlockIndex);
      if (codeBlockInfo) {
        codeBlockSuggestionId = codeBlockInfo.suggestionId;
      }
    }
    let result = void 0;
    if (activeEditorControl && !this.notebookService.hasSupportedNotebooks(codemapperUri)) {
      result = await this.handleTextEditor(activeEditorControl, context2.chatSessionResource, context2.code, codeBlockSuggestionId);
    } else {
      const activeNotebookEditor = getActiveNotebookEditor(this.editorService);
      if (activeNotebookEditor) {
        result = await this.handleNotebookEditor(activeNotebookEditor, context2.chatSessionResource, context2.code);
      } else {
        this.notify(localize(8823, null));
      }
    }
    if (isResponseVM(context2.element)) {
      const requestId = context2.element.requestId;
      const request2 = context2.element.session.getItems().find((item) => item.id === requestId && isRequestVM(item));
      notifyUserAction(this.chatService, context2, {
        kind: "apply",
        codeBlockIndex: context2.codeBlockIndex,
        totalCharacters: context2.code.length,
        codeMapper: result?.codeMapper,
        editsProposed: !!result?.editsProposed,
        totalLines: context2.code.split("\n").length,
        modelId: request2?.modelId ?? "",
        languageId: context2.languageId
      });
    }
  }
  async evaluateURIToUse(resource, activeEditorControl) {
    if (resource && await this.fileService.exists(resource)) {
      return resource;
    }
    const activeEditorOption = activeEditorControl?.getModel().uri ? { label: localize(8819, null, this.labelService.getUriLabel(activeEditorControl.getModel().uri, { relative: true })), id: "activeEditor" } : void 0;
    const untitledEditorOption = { label: localize(8832, null), id: "newUntitledFile" };
    const options3 = [];
    if (resource) {
      options3.push({ label: localize(8828, null, this.labelService.getUriLabel(resource, { relative: true })), id: "createFile" });
      options3.push(untitledEditorOption);
      if (activeEditorOption) {
        options3.push(activeEditorOption);
      }
    } else {
      if (activeEditorOption) {
        options3.push(activeEditorOption);
      }
      options3.push(untitledEditorOption);
    }
    const selected = options3.length > 1 ? await this.quickInputService.pick(options3, { placeHolder: localize(8833, null) }) : options3[0];
    if (selected) {
      switch (selected.id) {
        case "createFile":
          if (resource) {
            try {
              await this.fileService.writeFile(resource, VSBuffer.fromString(""));
            } catch (error) {
              this.notify(localize(8822, null, error.message));
              return URI.from({ scheme: "untitled", path: resource.path });
            }
          }
          return resource;
        case "newUntitledFile":
          return URI.from({ scheme: "untitled", path: resource ? resource.path : "Untitled-1" });
        case "activeEditor":
          return activeEditorControl?.getModel().uri;
      }
    }
    return void 0;
  }
  async handleNotebookEditor(notebookEditor, chatSessionResource, code) {
    if (notebookEditor.isReadOnly) {
      this.notify(localize(8827, null));
      return void 0;
    }
    const uri4 = notebookEditor.textModel.uri;
    const codeBlock = { code, resource: uri4, markdownBeforeBlock: void 0 };
    const codeMapper = this.codeMapperService.providers[0]?.displayName;
    if (!codeMapper) {
      this.notify(localize(8824, null));
      return void 0;
    }
    let editsProposed = false;
    const cancellationTokenSource = new CancellationTokenSource();
    try {
      const iterable = await this.progressService.withProgress(
        { location: 15 /* Notification */, delay: 500, sticky: true, cancellable: true },
        async (progress) => {
          progress.report({ message: localize(8825, null, codeMapper) });
          const editsIterable = this.getNotebookEdits(codeBlock, chatSessionResource, cancellationTokenSource.token);
          return await this.waitForFirstElement(editsIterable);
        },
        () => cancellationTokenSource.cancel()
      );
      editsProposed = await this.applyNotebookEditsWithInlinePreview(iterable, uri4, cancellationTokenSource);
    } catch (e4) {
      if (!isCancellationError(e4)) {
        this.notify(localize(8820, null, e4.message));
      }
    } finally {
      cancellationTokenSource.dispose();
    }
    return {
      editsProposed,
      codeMapper
    };
  }
  async handleTextEditor(codeEditor, chatSessionResource, code, applyCodeBlockSuggestionId) {
    const activeModel = codeEditor.getModel();
    if (isReadOnly(activeModel, this.textFileService)) {
      this.notify(localize(8826, null));
      return void 0;
    }
    const codeBlock = { code, resource: activeModel.uri, chatSessionResource, markdownBeforeBlock: void 0 };
    const codeMapper = this.codeMapperService.providers[0]?.displayName;
    if (!codeMapper) {
      this.notify(localize(8824, null));
      return void 0;
    }
    let editsProposed = false;
    const cancellationTokenSource = new CancellationTokenSource();
    try {
      const iterable = await this.progressService.withProgress(
        { location: 15 /* Notification */, delay: 500, sticky: true, cancellable: true },
        async (progress) => {
          progress.report({ message: localize(8825, null, codeMapper) });
          const editsIterable = this.getTextEdits(codeBlock, chatSessionResource, cancellationTokenSource.token);
          return await this.waitForFirstElement(editsIterable);
        },
        () => cancellationTokenSource.cancel()
      );
      editsProposed = await this.applyWithInlinePreview(iterable, codeEditor, cancellationTokenSource, applyCodeBlockSuggestionId);
    } catch (e4) {
      if (!isCancellationError(e4)) {
        this.notify(localize(8820, null, e4.message));
      }
    } finally {
      cancellationTokenSource.dispose();
    }
    return {
      editsProposed,
      codeMapper
    };
  }
  getTextEdits(codeBlock, chatSessionResource, token) {
    return new AsyncIterableProducer(async (executor) => {
      const request2 = {
        codeBlocks: [codeBlock],
        chatSessionResource
      };
      const response = {
        textEdit: (target, edit3) => {
          executor.emitOne(edit3);
        },
        notebookEdit(_resource, _edit) {
        }
      };
      const result = await this.codeMapperService.mapCode(request2, response, token);
      if (result?.errorMessage) {
        executor.reject(new Error(result.errorMessage));
      }
    });
  }
  getNotebookEdits(codeBlock, chatSessionResource, token) {
    return new AsyncIterableProducer(async (executor) => {
      const request2 = {
        codeBlocks: [codeBlock],
        chatSessionResource,
        location: "panel"
      };
      const response = {
        textEdit: (target, edits) => {
          executor.emitOne([target, edits]);
        },
        notebookEdit(_resource, edit3) {
          executor.emitOne(edit3);
        }
      };
      const result = await this.codeMapperService.mapCode(request2, response, token);
      if (result?.errorMessage) {
        executor.reject(new Error(result.errorMessage));
      }
    });
  }
  async waitForFirstElement(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    let result = await iterator.next();
    if (result.done) {
      return {
        async *[Symbol.asyncIterator]() {
          return;
        }
      };
    }
    return {
      async *[Symbol.asyncIterator]() {
        while (!result.done) {
          yield result.value;
          result = await iterator.next();
        }
      }
    };
  }
  async applyWithInlinePreview(edits, codeEditor, tokenSource, applyCodeBlockSuggestionId) {
    return this.instantiationService.invokeFunction(reviewEdits, codeEditor, edits, tokenSource.token, applyCodeBlockSuggestionId);
  }
  async applyNotebookEditsWithInlinePreview(edits, uri4, tokenSource) {
    return this.instantiationService.invokeFunction(reviewNotebookEdits, uri4, edits, tokenSource.token);
  }
  tryToRevealCodeBlock(codeEditor, codeBlock) {
    const match2 = codeBlock.match(/(\S[^\n]*)\n/);
    if (match2 && match2[1].length > 10) {
      const findMatch = codeEditor.getModel().findNextMatch(match2[1], { lineNumber: 1, column: 1 }, false, false, null, false);
      if (findMatch) {
        codeEditor.revealRangeInCenter(findMatch.range);
      }
    }
  }
  notify(message) {
    this.dialogService.info(message);
  }
};

ApplyCodeBlockOperation = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ICodeMapperService),
  __decorateParam(7, IProgressService),
  __decorateParam(8, IQuickInputService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, INotebookService)
], ApplyCodeBlockOperation);

function notifyUserAction(chatService, context2, action) {
  if (isResponseVM(context2.element)) {
    chatService.notifyUserAction({
      agentId: context2.element.agent?.id,
      command: context2.element.slashCommand?.name,
      sessionResource: context2.element.sessionResource,
      requestId: context2.element.requestId,
      result: context2.element.result,
      action
    });
  }
}

function getActiveNotebookEditor(editorService) {
  const activeEditorPane = editorService.activeEditorPane;
  if (activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
    const notebookEditor = activeEditorPane.getControl();
    if (notebookEditor.hasModel()) {
      return notebookEditor;
    }
  }
  return void 0;
}

function getEditableActiveCodeEditor(editorService) {
  const activeCodeEditorInNotebook = getActiveNotebookEditor(editorService)?.activeCodeEditor;
  if (activeCodeEditorInNotebook && activeCodeEditorInNotebook.hasTextFocus() && activeCodeEditorInNotebook.hasModel()) {
    return activeCodeEditorInNotebook;
  }
  let codeEditor = getCodeEditor(editorService.activeTextEditorControl);
  if (!codeEditor) {
    for (const editor of editorService.visibleTextEditorControls) {
      codeEditor = getCodeEditor(editor);
      if (codeEditor) {
        break;
      }
    }
  }
  if (!codeEditor || !codeEditor.hasModel()) {
    return void 0;
  }
  return codeEditor;
}

function isReadOnly(model, textFileService) {
  const activeTextModel = textFileService.files.get(model.uri) ?? textFileService.untitled.get(model.uri);
  return !!activeTextModel?.isReadonly();
}

function reindent(codeBlockContent, model, seletionStartLine) {
  const newContent = splitLines(codeBlockContent);
  if (newContent.length === 0) {
    return codeBlockContent;
  }
  const formattingOptions = model.getFormattingOptions();
  const codeIndentLevel = computeIndentation(model.getLineContent(seletionStartLine), formattingOptions.tabSize).level;
  const indents = newContent.map((line) => computeIndentation(line, formattingOptions.tabSize));
  const newContentIndentLevel = indents.reduce((min, indent, index2) => {
    if (indent.length !== newContent[index2].length) {
      return Math.min(indent.level, min);
    }
    return min;
  }, Number.MAX_VALUE);
  if (newContentIndentLevel === Number.MAX_VALUE || newContentIndentLevel === codeIndentLevel) {
    return codeBlockContent;
  }
  const newLines = [];
  for (let i2 = 0; i2 < newContent.length; i2++) {
    const { level, length } = indents[i2];
    const newLevel = Math.max(0, codeIndentLevel + level - newContentIndentLevel);
    const newIndentation = formattingOptions.insertSpaces ? " ".repeat(formattingOptions.tabSize * newLevel) : "	".repeat(newLevel);
    newLines.push(newIndentation + newContent[i2].substring(length));
  }
  return newLines.join("\n");
}

function computeIndentation(line, tabSize) {
  let nSpaces = 0;
  let level = 0;
  let i2 = 0;
  let length = 0;
  const len = line.length;
  while (i2 < len) {
    const chCode = line.charCodeAt(i2);
    if (chCode === 32 /* Space */) {
      nSpaces++;
      if (nSpaces === tabSize) {
        level++;
        nSpaces = 0;
        length = i2 + 1;
      }
    } else if (chCode === 9 /* Tab */) {
      level++;
      nSpaces = 0;
      length = i2 + 1;
    } else {
      break;
    }
    i2++;
  }
  return { level, length };
}
export { notifyUserAction, getActiveNotebookEditor, getEditableActiveCodeEditor, isReadOnly, reindent, computeIndentation, InsertCodeBlockOperation, ApplyCodeBlockOperation };
