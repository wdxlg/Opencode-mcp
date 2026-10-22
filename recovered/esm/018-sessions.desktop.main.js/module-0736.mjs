// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/renameSymbolProcessor.ts
import { Range2 } from "./module-0106.mjs";
import { LcsDiff, StringDiffSequence } from "./module-0166.mjs";
import { Position } from "./module-0079.mjs";
import { TextReplacement } from "./module-0178.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { hasProvider, rawRename } from "./module-0734.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { Disposable } from "./module-0012.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { renameSymbolCommandId } from "./module-0580.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { EditSources } from "./module-0377.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { TextModelValueReference } from "./module-0731.mjs";
import { InlineSuggestionItem } from "./module-0732.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { IRenameSymbolTrackerService } from "./module-0735.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/renameSymbolProcessor.ts
var RenameKind = /* @__PURE__ */ ((RenameKind2) => {
  RenameKind2["no"] = "no";
  RenameKind2["yes"] = "yes";
  RenameKind2["maybe"] = "maybe";
  return RenameKind2;
})(RenameKind || {});

((RenameKind2) => {
  function fromString(value2) {
    switch (value2) {
      case "no":
        return "no" /* no */;
      case "yes":
        return "yes" /* yes */;
      case "maybe":
        return "maybe" /* maybe */;
      default:
        return "no" /* no */;
    }
  }
  RenameKind2.fromString = fromString;
})(RenameKind || (RenameKind = {}));

var RenameInferenceEngine = class {
  constructor() {
  }
  inferRename(textModel, editRange, insertText, wordDefinition) {
    const extendedRange = new Range2(editRange.startLineNumber, 1, editRange.endLineNumber, textModel.getLineMaxColumn(editRange.endLineNumber));
    const startDiff = editRange.startColumn - extendedRange.startColumn;
    const endDiff = extendedRange.endColumn - editRange.endColumn;
    const originalText = textModel.getValueInRange(extendedRange);
    const modifiedText = textModel.getValueInRange(new Range2(extendedRange.startLineNumber, extendedRange.startColumn, extendedRange.startLineNumber, extendedRange.startColumn + startDiff)) + insertText + textModel.getValueInRange(new Range2(extendedRange.endLineNumber, extendedRange.endColumn - endDiff, extendedRange.endLineNumber, extendedRange.endColumn));
    const others = [];
    const renames = [];
    let oldName = void 0;
    let newName = void 0;
    let position2 = void 0;
    const nesOffset = textModel.getOffsetAt(extendedRange.getStartPosition());
    const { changes: originalChanges } = new LcsDiff(new StringDiffSequence(originalText), new StringDiffSequence(modifiedText)).ComputeDiff(true);
    if (originalChanges.length === 0) {
      return void 0;
    }
    const changes = [];
    for (const change of originalChanges) {
      if (changes.length === 0) {
        changes.push(change);
        continue;
      }
      const lastChange = changes[changes.length - 1];
      const gapOriginalLength = change.originalStart - (lastChange.originalStart + lastChange.originalLength);
      if (gapOriginalLength > 0) {
        const gapStartOffset = nesOffset + lastChange.originalStart + lastChange.originalLength;
        const gapStartPos = textModel.getPositionAt(gapStartOffset);
        const wordRange = textModel.getWordAtPosition(gapStartPos);
        if (wordRange) {
          const wordStartOffset = textModel.getOffsetAt(new Position(gapStartPos.lineNumber, wordRange.startColumn));
          const wordEndOffset = textModel.getOffsetAt(new Position(gapStartPos.lineNumber, wordRange.endColumn));
          const gapEndOffset = gapStartOffset + gapOriginalLength;
          if (wordStartOffset <= gapStartOffset && gapEndOffset <= wordEndOffset && wordStartOffset <= gapEndOffset && gapEndOffset <= wordEndOffset) {
            lastChange.originalLength = change.originalStart + change.originalLength - lastChange.originalStart;
            lastChange.modifiedLength = change.modifiedStart + change.modifiedLength - lastChange.modifiedStart;
            continue;
          }
        }
      }
      changes.push(change);
    }
    let tokenDiff = 0;
    for (const change of changes) {
      const originalTextSegment = originalText.substring(change.originalStart, change.originalStart + change.originalLength);
      const insertedTextSegment = modifiedText.substring(change.modifiedStart, change.modifiedStart + change.modifiedLength);
      const startOffset = nesOffset + change.originalStart;
      const startPos = textModel.getPositionAt(startOffset);
      const endOffset = startOffset + change.originalLength;
      const endPos = textModel.getPositionAt(endOffset);
      const range2 = Range2.fromPositions(startPos, endPos);
      const diff4 = insertedTextSegment.length - change.originalLength;
      if (/\s/.test(originalTextSegment)) {
        others.push(new TextReplacement(range2, insertedTextSegment));
        tokenDiff += diff4;
        continue;
      }
      if (originalTextSegment.length > 0) {
        wordDefinition.lastIndex = 0;
        const match3 = wordDefinition.exec(originalTextSegment);
        if (match3 === null || match3.index !== 0 || match3[0].length !== originalTextSegment.length) {
          others.push(new TextReplacement(range2, insertedTextSegment));
          tokenDiff += diff4;
          continue;
        }
      }
      if (/\s/.test(insertedTextSegment)) {
        others.push(new TextReplacement(range2, insertedTextSegment));
        tokenDiff += diff4;
        continue;
      }
      if (insertedTextSegment.length > 0) {
        wordDefinition.lastIndex = 0;
        const match3 = wordDefinition.exec(insertedTextSegment);
        if (match3 === null || match3.index !== 0 || match3[0].length !== insertedTextSegment.length) {
          others.push(new TextReplacement(range2, insertedTextSegment));
          tokenDiff += diff4;
          continue;
        }
      }
      const wordRange = textModel.getWordAtPosition(startPos);
      if (wordRange === null) {
        others.push(new TextReplacement(range2, insertedTextSegment));
        tokenDiff += diff4;
        continue;
      }
      const originalStartColumn = change.originalStart + 1;
      const isInsertion2 = change.originalLength === 0 && change.modifiedLength > 0;
      let tokenInfo;
      if (isInsertion2 && originalStartColumn === wordRange.endColumn && wordRange.endColumn > wordRange.startColumn) {
        tokenInfo = this.getTokenAtPosition(textModel, new Position(startPos.lineNumber, wordRange.startColumn));
      } else {
        tokenInfo = this.getTokenAtPosition(textModel, startPos);
      }
      if (wordRange.startColumn !== tokenInfo.range.startColumn || wordRange.endColumn !== tokenInfo.range.endColumn) {
        others.push(new TextReplacement(range2, insertedTextSegment));
        tokenDiff += diff4;
        continue;
      }
      if (tokenInfo.type === 0 /* Other */) {
        let identifier2 = textModel.getValueInRange(tokenInfo.range);
        if (identifier2.length === 0) {
          others.push(new TextReplacement(range2, insertedTextSegment));
          tokenDiff += diff4;
          continue;
        }
        if (oldName === void 0) {
          oldName = identifier2;
        } else if (oldName !== identifier2) {
          others.push(new TextReplacement(range2, insertedTextSegment));
          tokenDiff += diff4;
          continue;
        }
        const tokenStartPos = textModel.getOffsetAt(tokenInfo.range.getStartPosition()) - nesOffset + tokenDiff;
        const tokenEndPos = textModel.getOffsetAt(tokenInfo.range.getEndPosition()) - nesOffset + tokenDiff;
        identifier2 = modifiedText.substring(tokenStartPos, tokenEndPos + diff4);
        if (identifier2.length === 0) {
          others.push(new TextReplacement(range2, insertedTextSegment));
          tokenDiff += diff4;
          continue;
        }
        if (newName === void 0) {
          newName = identifier2;
        } else if (newName !== identifier2) {
          others.push(new TextReplacement(range2, insertedTextSegment));
          tokenDiff += diff4;
          continue;
        }
        if (position2 === void 0) {
          position2 = tokenInfo.range.getStartPosition();
        }
        if (oldName !== void 0 && newName !== void 0 && oldName.length > 0 && newName.length > 0 && oldName !== newName) {
          renames.push(new TextReplacement(tokenInfo.range, newName));
        } else {
          renames.push(new TextReplacement(range2, insertedTextSegment));
        }
        tokenDiff += diff4;
      } else {
        others.push(new TextReplacement(range2, insertedTextSegment));
        tokenDiff += insertedTextSegment.length - change.originalLength;
      }
    }
    if (oldName === void 0 || newName === void 0 || position2 === void 0 || oldName.length === 0 || newName.length === 0 || oldName === newName) {
      return void 0;
    }
    wordDefinition.lastIndex = 0;
    let match2 = wordDefinition.exec(oldName);
    if (match2 === null || match2.index !== 0 || match2[0].length !== oldName.length) {
      return void 0;
    }
    wordDefinition.lastIndex = 0;
    match2 = wordDefinition.exec(newName);
    if (match2 === null || match2.index !== 0 || match2[0].length !== newName.length) {
      return void 0;
    }
    return {
      renames: { edits: renames, position: position2, oldName, newName },
      others: { edits: others }
    };
  }
  getTokenAtPosition(textModel, position2) {
    textModel.tokenization.tokenizeIfCheap(position2.lineNumber);
    const tokens = textModel.tokenization.getLineTokens(position2.lineNumber);
    const idx = tokens.findTokenIndexAtOffset(position2.column - 1);
    return {
      type: tokens.getStandardTokenType(idx),
      range: new Range2(position2.lineNumber, 1 + tokens.getStartOffset(idx), position2.lineNumber, 1 + tokens.getEndOffset(idx))
    };
  }
};

var EditorState3 = class _EditorState {
  constructor(editor, versionId) {
    this.editor = editor;
    this.versionId = versionId;
  }
  static create(codeEditorService, textModel) {
    const editor = codeEditorService.getFocusedCodeEditor();
    if (editor === null) {
      return void 0;
    }
    if (editor.getModel() !== textModel) {
      return void 0;
    }
    return new _EditorState(editor, textModel.getVersionId());
  }
  equals(other) {
    if (other === void 0) {
      return false;
    }
    return this.editor === other.editor && this.versionId === other.versionId;
  }
};

var RenameSymbolRunnable = class {
  constructor(languageFeaturesService, commandService, requestUuid, textModel, state, position2, newName, lastSymbolRename, oldName) {
    this._result = void 0;
    this._commandService = commandService;
    this._textModel = textModel;
    this._state = state;
    this._requestUuid = requestUuid;
    this._cancellationTokenSource = new CancellationTokenSource();
    if (lastSymbolRename === void 0 || oldName === void 0) {
      this._promise = rawRename(languageFeaturesService.renameProvider, textModel, position2, newName, this._cancellationTokenSource.token);
      return;
    } else {
      this._promise = this.sendNesRenameRequest(textModel, position2, oldName, newName, lastSymbolRename);
    }
  }
  get requestUuid() {
    return this._requestUuid;
  }
  isValid(codeEditorService) {
    return this._state.equals(EditorState3.create(codeEditorService, this._textModel));
  }
  cancel() {
    this._cancellationTokenSource.cancel();
  }
  async getCount() {
    if (this._cancellationTokenSource.token.isCancellationRequested) {
      return 0;
    }
    const result = await this.getResult();
    if (result === void 0 || this._cancellationTokenSource.token.isCancellationRequested) {
      return 0;
    }
    return result.edits.length;
  }
  async getWorkspaceEdit() {
    return this.getResult();
  }
  async getResult() {
    if (this._cancellationTokenSource.token.isCancellationRequested) {
      return void 0;
    }
    if (this._result === void 0) {
      this._result = await this._promise;
    }
    if (this._result.rejectReason || this._cancellationTokenSource.token.isCancellationRequested) {
      return void 0;
    }
    return this._result;
  }
  async sendNesRenameRequest(textModel, position2, oldName, newName, lastSymbolRename) {
    try {
      const result = await this._commandService.executeCommand("github.copilot.nes.postRename", textModel.uri, position2, oldName, newName, lastSymbolRename);
      if (result === void 0) {
        return { rejectReason: "Rename failed", edits: [] };
      }
      const edits = [];
      for (const item of result) {
        for (const change of item.changes) {
          const range2 = new Range2(change.range.start.line + 1, change.range.start.character + 1, change.range.end.line + 1, change.range.end.character + 1);
          const edit3 = new ResourceTextEdit(item.file, new TextReplacement(range2, change.newText ?? newName));
          edits.push(edit3);
        }
      }
      return { edits };
    } catch (error) {
      return { rejectReason: "Rename failed", edits: [] };
    }
  }
};

var RenameSymbolProcessor = class extends Disposable {
  constructor(_commandService, _languageFeaturesService, _languageConfigurationService, bulkEditService, _renameSymbolTrackerService, _codeEditorService) {
    super();
    this._commandService = _commandService;
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._renameSymbolTrackerService = _renameSymbolTrackerService;
    this._codeEditorService = _codeEditorService;
    this._renameInferenceEngine = new RenameInferenceEngine();
    this._renameRunnable = void 0;
    this._register(CommandsRegistry.registerCommand(renameSymbolCommandId, async (_, source, renameRunnable) => {
      if (renameRunnable === void 0 || !renameRunnable.isValid(this._codeEditorService)) {
        return;
      }
      try {
        const workspaceEdit = await renameRunnable.getWorkspaceEdit();
        if (workspaceEdit === void 0) {
          return;
        }
        bulkEditService.apply(workspaceEdit, { reason: source });
      } finally {
        if (this._renameRunnable === renameRunnable) {
          this._renameRunnable = void 0;
        }
      }
    }));
  }
  async proposeRenameRefactoring(textModel, suggestItem, context2) {
    if (!suggestItem.supportsRename || suggestItem.action?.kind !== "edit" || context2.selectedSuggestionInfo) {
      return suggestItem;
    }
    if (!hasProvider(this._languageFeaturesService.renameProvider, textModel)) {
      return suggestItem;
    }
    const state = EditorState3.create(this._codeEditorService, textModel);
    if (state === void 0) {
      return suggestItem;
    }
    const start = Date.now();
    const edit3 = suggestItem.action.textReplacement;
    const languageConfiguration = this._languageConfigurationService.getLanguageConfiguration(textModel.getLanguageId());
    const edits = this._renameInferenceEngine.inferRename(textModel, edit3.range, edit3.text, languageConfiguration.wordDefinition);
    if (edits === void 0 || edits.renames.edits.length === 0) {
      return suggestItem;
    }
    const { oldName, newName, position: position2, edits: renameEdits } = edits.renames;
    const trackedWord = this._renameSymbolTrackerService.trackedWord.get();
    let lastSymbolRename = void 0;
    if (trackedWord !== void 0 && trackedWord.model === textModel && trackedWord.originalWord === oldName && trackedWord.currentWord === newName) {
      lastSymbolRename = trackedWord.currentRange;
    }
    let timedOut = false;
    const check = await raceTimeout(this.checkRenamePrecondition(suggestItem, textModel, position2, oldName, newName, lastSymbolRename), 100, () => {
      timedOut = true;
    });
    const renamePossible = this.isRenamePossible(suggestItem, check, state, textModel);
    suggestItem.setRenameProcessingInfo({
      createdRename: renamePossible,
      duration: Date.now() - start,
      timedOut,
      droppedOtherEdits: renamePossible ? edits.others.edits.length : void 0,
      droppedRenameEdits: renamePossible ? renameEdits.length - 1 : void 0
    });
    if (!renamePossible) {
      return suggestItem;
    }
    if (this._renameRunnable === void 0) {
      this._renameRunnable = new RenameSymbolRunnable(this._languageFeaturesService, this._commandService, suggestItem.requestUuid, textModel, state, position2, newName, lastSymbolRename, lastSymbolRename !== void 0 ? oldName : void 0);
    }
    const source = EditSources.inlineCompletionAccept({
      nes: suggestItem.isInlineEdit,
      requestUuid: suggestItem.requestUuid,
      providerId: suggestItem.source.provider.providerId,
      languageId: textModel.getLanguageId(),
      correlationId: suggestItem.getSourceCompletion().correlationId
    });
    const command4 = {
      id: renameSymbolCommandId,
      title: localize(1394, null),
      arguments: [source, this._renameRunnable]
    };
    const alternativeAction = {
      label: localize(1394, null),
      icon: Codicon.replaceAll,
      command: command4,
      count: this._renameRunnable.getCount()
    };
    const renameAction = {
      kind: "edit",
      range: renameEdits[0].range,
      insertText: renameEdits[0].text,
      snippetInfo: suggestItem.snippetInfo,
      alternativeAction,
      uri: textModel.uri
    };
    const ref = TextModelValueReference.snapshot(textModel);
    return InlineSuggestionItem.create(suggestItem.withAction(renameAction), ref, false);
  }
  async checkRenamePrecondition(suggestItem, textModel, position2, oldName, newName, lastSymbolRename) {
    const no = { canRename: "no" /* no */, timedOut: false };
    try {
      const result = await this._commandService.executeCommand("github.copilot.nes.prepareRename", textModel.uri, position2, oldName, newName, suggestItem.requestUuid, lastSymbolRename);
      if (result === void 0) {
        return no;
      } else if (typeof result === "string") {
        const canRename = RenameKind.fromString(result);
        if (canRename === "yes" /* yes */ || canRename === "maybe" /* maybe */) {
          return {
            canRename,
            oldName,
            onOldState: false
          };
        } else {
          return {
            canRename,
            timedOut: false
          };
        }
      } else {
        return result;
      }
    } catch (error) {
      return no;
    }
  }
  isRenamePossible(suggestItem, check, state, textModel) {
    if (check === void 0 || check.canRename === "no" /* no */) {
      return false;
    }
    if (!state.equals(EditorState3.create(this._codeEditorService, textModel))) {
      return false;
    }
    if (this._renameRunnable === void 0) {
      return true;
    }
    if (this._renameRunnable.requestUuid === suggestItem.requestUuid) {
      return false;
    } else {
      this._renameRunnable.cancel();
      this._renameRunnable = void 0;
      return true;
    }
  }
};

RenameSymbolProcessor = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ILanguageConfigurationService),
  __decorateParam(3, IBulkEditService),
  __decorateParam(4, IRenameSymbolTrackerService),
  __decorateParam(5, ICodeEditorService)
], RenameSymbolProcessor);
export { RenameKind, RenameInferenceEngine, EditorState3, RenameSymbolRunnable, RenameSymbolProcessor };
