// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineCompletions/browser/renameSymbolTrackerService.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Range2 } from "./module-0106.mjs";
import { derived } from "./module-0054.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IModelService } from "./module-0080.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IRenameSymbolTrackerService } from "./module-0735.mjs";


// src/vs/workbench/contrib/inlineCompletions/browser/renameSymbolTrackerService.ts
function isUserEdit2(event) {
  if (event.isUndoing || event.isRedoing || event.isFlush) {
    return false;
  }
  for (const source of event.detailedReasons) {
    if (!isUserEditSource(source)) {
      return false;
    }
  }
  return event.detailedReasons.length > 0;
}

var userEditKinds = /* @__PURE__ */ new Set(["type", "paste", "cut", "executeCommands", "executeCommand", "compositionType", "compositionEnd"]);

function isUserEditSource(source) {
  const metadata = source.metadata;
  if (metadata.source !== "cursor") {
    return false;
  }
  const kind = metadata.kind;
  return userEditKinds.has(kind);
}

var ModelSymbolRenameTracker = class extends Disposable {
  constructor(_model) {
    super();
    this._model = _model;
    this._trackedWord = observableValue(this, void 0);
    this.trackedWord = this._trackedWord;
    this._capturedWord = void 0;
    this._lastWordBeforeEdit = void 0;
    this._pendingContentChange = false;
    this._lastCursorPosition = void 0;
    this._register(this._model.onDidChangeContent((e) => {
      if (!isUserEdit2(e)) {
        const position2 = this._lastCursorPosition;
        this.reset();
        if (position2 !== void 0 && position2.lineNumber <= this._model.getLineCount()) {
          this.updateCursorPosition(position2);
        }
        return;
      }
      this._pendingContentChange = true;
    }));
  }
  /**
   * Called by the service when the cursor position changes in an editor showing this model.
   * Updates tracking based on the word under cursor and whether content has changed.
   */
  updateCursorPosition(position2) {
    this._lastCursorPosition = position2;
    const wordAtPosition = this._model.getWordAtPosition(position2);
    if (!wordAtPosition) {
      this._lastWordBeforeEdit = void 0;
      this._pendingContentChange = false;
      return;
    }
    if (this._isPositionInComment(position2)) {
      this._lastWordBeforeEdit = void 0;
      this._pendingContentChange = false;
      return;
    }
    const currentWord = {
      word: wordAtPosition.word,
      range: new Range2(
        position2.lineNumber,
        wordAtPosition.startColumn,
        position2.lineNumber,
        wordAtPosition.endColumn
      ),
      position: position2
    };
    const contentChanged = this._pendingContentChange;
    this._pendingContentChange = false;
    if (!contentChanged) {
      this._lastWordBeforeEdit = currentWord;
      return;
    }
    if (!this._capturedWord) {
      const originalWord = this._lastWordBeforeEdit ?? currentWord;
      this._capturedWord = { ...originalWord };
      this._trackedWord.set({
        model: this._model,
        originalWord: originalWord.word,
        originalPosition: originalWord.position,
        originalRange: originalWord.range,
        currentWord: currentWord.word,
        currentRange: currentWord.range
      }, void 0);
      this._lastWordBeforeEdit = currentWord;
      return;
    }
    const capturedWord = this._capturedWord;
    const isOnSameWord = this._rangesOverlap(capturedWord.range, currentWord.range) || this._isAdjacent(capturedWord.range, currentWord.range);
    if (isOnSameWord) {
      this._trackedWord.set({
        model: this._model,
        originalWord: capturedWord.word,
        originalPosition: capturedWord.position,
        originalRange: capturedWord.range,
        currentWord: currentWord.word,
        currentRange: currentWord.range
      }, void 0);
    } else {
      const originalWord = this._lastWordBeforeEdit ?? currentWord;
      this._capturedWord = { ...originalWord };
      this._trackedWord.set({
        model: this._model,
        originalWord: originalWord.word,
        originalPosition: originalWord.position,
        originalRange: originalWord.range,
        currentWord: currentWord.word,
        currentRange: currentWord.range
      }, void 0);
    }
    this._lastWordBeforeEdit = currentWord;
  }
  reset() {
    this._trackedWord.set(void 0, void 0);
    this._capturedWord = void 0;
    this._lastWordBeforeEdit = void 0;
    this._pendingContentChange = false;
    this._lastCursorPosition = void 0;
  }
  _isPositionInComment(position2) {
    this._model.tokenization.tokenizeIfCheap(position2.lineNumber);
    const tokens = this._model.tokenization.getLineTokens(position2.lineNumber);
    const tokenIndex = tokens.findTokenIndexAtOffset(position2.column - 1);
    const tokenType = tokens.getStandardTokenType(tokenIndex);
    return tokenType === 1 /* Comment */;
  }
  _rangesOverlap(a, b) {
    if (a.startLineNumber !== b.startLineNumber) {
      return false;
    }
    return !(a.endColumn < b.startColumn || b.endColumn < a.startColumn);
  }
  _isAdjacent(a, b) {
    if (a.startLineNumber !== b.startLineNumber) {
      return false;
    }
    return a.endColumn === b.startColumn || b.endColumn === a.startColumn;
  }
};

var RenameSymbolTrackerService = class extends Disposable {
  constructor(_codeEditorService, _modelService) {
    super();
    this._codeEditorService = _codeEditorService;
    this._modelService = _modelService;
    this._modelTrackers = /* @__PURE__ */ new Map();
    this._editorFocusTrackingDisposables = /* @__PURE__ */ new Map();
    this._focusedModelTracker = observableValue(this, void 0);
    this.trackedWord = derived(this, (reader) => {
      const tracker2 = this._focusedModelTracker.read(reader);
      return tracker2?.trackedWord.read(reader);
    });
    for (const editor of this._codeEditorService.listCodeEditors()) {
      this._setupEditorTracking(editor);
    }
    this._register(this._codeEditorService.onCodeEditorAdd((editor) => {
      this._setupEditorTracking(editor);
    }));
    this._register(this._codeEditorService.onCodeEditorRemove((editor) => {
      const focusDisposable = this._editorFocusTrackingDisposables.get(editor);
      if (focusDisposable) {
        focusDisposable.dispose();
        this._editorFocusTrackingDisposables.delete(editor);
      }
    }));
    this._register(this._modelService.onModelRemoved((model) => {
      const tracker2 = this._modelTrackers.get(model);
      if (tracker2) {
        tracker2.dispose();
        this._modelTrackers.delete(model);
      }
    }));
  }
  _setupEditorTracking(editor) {
    if (editor.isSimpleWidget) {
      return;
    }
    if (!this._editorFocusTrackingDisposables.has(editor)) {
      const obsEditor = observableCodeEditor(editor);
      const focusDisposable = autorun((reader) => {
        const isFocused = obsEditor.isFocused.read(reader);
        const model = obsEditor.model.read(reader);
        const cursorPosition = obsEditor.cursorPosition.read(reader);
        if (!isFocused || !model) {
          return;
        }
        let tracker2 = this._modelTrackers.get(model);
        if (!tracker2) {
          tracker2 = new ModelSymbolRenameTracker(model);
          this._modelTrackers.set(model, tracker2);
        }
        if (this._focusedModelTracker.read(void 0) !== tracker2) {
          this._focusedModelTracker.set(tracker2, void 0);
        }
        if (cursorPosition) {
          tracker2.updateCursorPosition(cursorPosition);
        }
      });
      this._editorFocusTrackingDisposables.set(editor, focusDisposable);
    }
  }
  dispose() {
    for (const tracker2 of this._modelTrackers.values()) {
      tracker2.dispose();
    }
    this._modelTrackers.clear();
    for (const disposable of this._editorFocusTrackingDisposables.values()) {
      disposable.dispose();
    }
    this._editorFocusTrackingDisposables.clear();
    super.dispose();
  }
};

RenameSymbolTrackerService = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IModelService)
], RenameSymbolTrackerService);

registerSingleton(IRenameSymbolTrackerService, RenameSymbolTrackerService, 1 /* Delayed */);
export { isUserEdit2, isUserEditSource, userEditKinds, ModelSymbolRenameTracker, RenameSymbolTrackerService };
