// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingTextModelChangeService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { nullDocumentDiff } from "./module-2693.mjs";
import { DeferredPromise, RunOnceScheduler, timeout } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { StringEdit } from "./module-0193.mjs";
import { autorun } from "./module-0052.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { editorSelectionBackground } from "./module-0229.mjs";
import { pendingRewriteMinimap } from "./module-2686.mjs";
import { assertType } from "./module-0010.mjs";
import { TextEdit, VersionedExtensionId } from "./module-0164.mjs";
import { assert } from "./module-0009.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Range2 } from "./module-0106.mjs";
import { addDisposableListener, getWindow } from "./module-0075.mjs";
import { EditSources } from "./module-0377.mjs";
import { chatSessionResourceToId } from "./module-0962.mjs";
import { EditOperation } from "./module-0162.mjs";
import { offsetEditFromContentChanges, offsetEditFromLineRangeMapping, offsetEditToEditOperations } from "./module-0404.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { LineRange } from "./module-0174.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingTextModelChangeService.ts
var ChatEditingTextModelChangeService = class extends Disposable {
  constructor(originalModel, modifiedModel, state, isExternalEditInProgress, _editorWorkerService, _accessibilitySignalService) {
    super();
    this.originalModel = originalModel;
    this.modifiedModel = modifiedModel;
    this.state = state;
    this._editorWorkerService = _editorWorkerService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._isEditFromUs = false;
    this._allEditsAreFromUs = true;
    this._diffOperationIds = 0;
    this._diffInfo = observableValue(this, nullDocumentDiff);
    this._editDecorationClear = this._register(new RunOnceScheduler(() => {
      this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
    }, 500));
    this._editDecorations = [];
    this._didAcceptOrRejectAllHunks = this._register(new Emitter());
    this.onDidAcceptOrRejectAllHunks = this._didAcceptOrRejectAllHunks.event;
    this._didAcceptOrRejectLines = this._register(new Emitter());
    this.onDidAcceptOrRejectLines = this._didAcceptOrRejectLines.event;
    this._didUserEditModelFired = false;
    this._didUserEditModel = this._register(new Emitter());
    this.onDidUserEditModel = this._didUserEditModel.event;
    this._originalToModifiedEdit = StringEdit.empty;
    this.lineChangeCount = 0;
    this.linesAdded = 0;
    this.linesRemoved = 0;
    this._isExternalEditInProgress = isExternalEditInProgress;
    this._register(this.modifiedModel.onDidChangeContent((e4) => {
      this._mirrorEdits(e4);
    }));
    this._register(toDisposable(() => {
      this.clearCurrentEditLineDecoration();
    }));
    this._register(autorun((r2) => this.updateLineChangeCount(this._diffInfo.read(r2))));
    if (!originalModel.equalsTextBuffer(modifiedModel.getTextBuffer())) {
      this._updateDiffInfoSeq();
    }
  }
  static {
    this._lastEditDecorationOptions = ModelDecorationOptions.register({
      isWholeLine: true,
      description: "chat-last-edit",
      className: "chat-editing-last-edit-line",
      marginClassName: "chat-editing-last-edit",
      overviewRuler: {
        position: 7 /* Full */,
        color: themeColorFromId(editorSelectionBackground)
      }
    });
  }
  static {
    this._pendingEditDecorationOptions = ModelDecorationOptions.register({
      isWholeLine: true,
      description: "chat-pending-edit",
      className: "chat-editing-pending-edit",
      minimap: {
        position: 1 /* Inline */,
        color: themeColorFromId(pendingRewriteMinimap)
      }
    });
  }
  static {
    this._atomicEditDecorationOptions = ModelDecorationOptions.register({
      isWholeLine: true,
      description: "chat-atomic-edit",
      className: "chat-editing-atomic-edit",
      minimap: {
        position: 1 /* Inline */,
        color: themeColorFromId(pendingRewriteMinimap)
      }
    });
  }
  get isEditFromUs() {
    return this._isEditFromUs;
  }
  get allEditsAreFromUs() {
    return this._allEditsAreFromUs;
  }
  get diffInfo() {
    return this._diffInfo.map((value2) => {
      return {
        ...value2,
        originalModel: this.originalModel,
        modifiedModel: this.modifiedModel,
        keep: (changes) => this._keepHunk(changes),
        undo: (changes) => this._undoHunk(changes)
      };
    });
  }
  notifyHunkAction(state, affectedLines) {
    if (affectedLines.lineCount > 0) {
      this._didAcceptOrRejectLines.fire({ state, ...affectedLines });
    }
  }
  updateLineChangeCount(diff4) {
    this.lineChangeCount = 0;
    this.linesAdded = 0;
    this.linesRemoved = 0;
    for (const change of diff4.changes) {
      const modifiedRange = change.modified.endLineNumberExclusive - change.modified.startLineNumber;
      this.linesAdded += Math.max(0, modifiedRange);
      const originalRange = change.original.endLineNumberExclusive - change.original.startLineNumber;
      this.linesRemoved += Math.max(0, originalRange);
      this.lineChangeCount += Math.max(modifiedRange, originalRange);
    }
  }
  clearCurrentEditLineDecoration() {
    if (!this.modifiedModel.isDisposed()) {
      this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
    }
  }
  async areOriginalAndModifiedIdentical() {
    const diff4 = await this._diffOperation;
    return diff4 ? diff4.identical : false;
  }
  async acceptAgentEdits(resource, textEdits, isLastEdits, responseModel) {
    assertType(textEdits.every(TextEdit.isTextEdit), "INVALID args, can only handle text edits");
    assert(isEqual2(resource, this.modifiedModel.uri), " INVALID args, can only edit THIS document");
    const isAtomicEdits = textEdits.length > 0 && isLastEdits;
    let maxLineNumber = 0;
    let rewriteRatio = 0;
    const source = this._createEditSource(responseModel);
    if (isAtomicEdits) {
      const minimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(this.modifiedModel.uri, textEdits) ?? textEdits;
      const ops = minimalEdits.map(TextEdit.asEditOperation);
      const undoEdits = this._applyEdits(ops, source);
      if (undoEdits.length > 0) {
        let range2;
        for (let i2 = 0; i2 < undoEdits.length; i2++) {
          const op = undoEdits[i2];
          if (!range2) {
            range2 = Range2.lift(op.range);
          } else {
            range2 = Range2.plusRange(range2, op.range);
          }
        }
        if (range2) {
          const defer = new DeferredPromise();
          const listener = addDisposableListener(getWindow(void 0), "animationend", (e4) => {
            if (e4.animationName === "kf-chat-editing-atomic-edit") {
              defer.complete();
              listener.dispose();
            }
          });
          this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, [{
            options: ChatEditingTextModelChangeService._atomicEditDecorationOptions,
            range: range2
          }]);
          await Promise.any([defer.p, timeout(500)]);
          listener.dispose();
        }
      }
    } else {
      const ops = textEdits.map(TextEdit.asEditOperation);
      const undoEdits = this._applyEdits(ops, source);
      maxLineNumber = undoEdits.reduce((max, op) => Math.max(max, op.range.startLineNumber), 0);
      rewriteRatio = Math.min(1, maxLineNumber / this.modifiedModel.getLineCount());
      const newDecorations = [
        // decorate pending edit (region)
        {
          options: ChatEditingTextModelChangeService._pendingEditDecorationOptions,
          range: new Range2(maxLineNumber + 1, 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
        }
      ];
      if (maxLineNumber > 0) {
        newDecorations.push({
          options: ChatEditingTextModelChangeService._lastEditDecorationOptions,
          range: new Range2(maxLineNumber, 1, maxLineNumber, Number.MAX_SAFE_INTEGER)
        });
      }
      this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, newDecorations);
    }
    if (isLastEdits) {
      this._updateDiffInfoSeq();
      this._editDecorationClear.schedule();
    }
    return { rewriteRatio, maxLineNumber };
  }
  _createEditSource(responseModel) {
    if (!responseModel) {
      return EditSources.unknown({ name: "editSessionUndoRedo" });
    }
    const sessionId = chatSessionResourceToId(responseModel.session.sessionResource);
    const request2 = responseModel.session.getRequests().at(-1);
    const languageId = this.modifiedModel.getLanguageId();
    const agent = responseModel.agent;
    const extensionId = VersionedExtensionId.tryCreate(agent?.extensionId.value, agent?.extensionVersion);
    if (responseModel.request?.locationData?.type === "editor" /* EditorInline */) {
      return EditSources.inlineChatApplyEdit({
        modelId: request2?.modelId,
        requestId: request2?.id,
        sessionId,
        languageId,
        extensionId
      });
    }
    return EditSources.chatApplyEdits({
      modelId: request2?.modelId,
      requestId: request2?.id,
      sessionId,
      languageId,
      mode: request2?.modeInfo?.telemetryModeId,
      extensionId,
      codeBlockSuggestionId: request2?.modeInfo?.applyCodeBlockSuggestionId
    });
  }
  _applyEdits(edits, source) {
    if (edits.length === 0) {
      return [];
    }
    try {
      this._isEditFromUs = true;
      let result = [];
      this.modifiedModel.pushEditOperations(null, edits, (undoEdits) => {
        result = undoEdits;
        return null;
      }, void 0, source);
      return result;
    } finally {
      this._isEditFromUs = false;
    }
  }
  /**
   * Keeps the current modified document as the final contents.
   */
  keep() {
    this.notifyHunkAction("accepted", { linesAdded: this.linesAdded, linesRemoved: this.linesRemoved, lineCount: this.lineChangeCount, hasRemainingEdits: false });
    this.originalModel.setValue(this.modifiedModel.createSnapshot());
    this._reset();
  }
  /**
   * Undoes the current modified document as the final contents.
   */
  undo() {
    this.notifyHunkAction("rejected", { linesAdded: this.linesAdded, linesRemoved: this.linesRemoved, lineCount: this.lineChangeCount, hasRemainingEdits: false });
    this.modifiedModel.pushStackElement();
    this._applyEdits([EditOperation.replace(this.modifiedModel.getFullModelRange(), this.originalModel.getValue())], EditSources.chatUndoEdits());
    this.modifiedModel.pushStackElement();
    this._reset();
  }
  _reset() {
    this._originalToModifiedEdit = StringEdit.empty;
    this._diffInfo.set(nullDocumentDiff, void 0);
    this._didUserEditModelFired = false;
  }
  async resetDocumentValues(newOriginal, newModified) {
    let didChange = false;
    if (newOriginal !== void 0) {
      this.originalModel.setValue(newOriginal);
      didChange = true;
    }
    if (newModified !== void 0 && this.modifiedModel.getValue() !== newModified) {
      this.modifiedModel.pushStackElement();
      this._applyEdits([EditOperation.replace(this.modifiedModel.getFullModelRange(), newModified)], EditSources.chatReset());
      this.modifiedModel.pushStackElement();
      didChange = true;
    }
    if (didChange) {
      await this._updateDiffInfoSeq();
    }
  }
  _mirrorEdits(event) {
    const edit3 = offsetEditFromContentChanges(event.changes);
    const isExternalEdit = this._isExternalEditInProgress?.();
    if (this._isEditFromUs || isExternalEdit) {
      const e_sum = this._originalToModifiedEdit;
      const e_ai = edit3;
      this._originalToModifiedEdit = e_sum.compose(e_ai);
      if (isExternalEdit) {
        this._updateDiffInfoSeq();
      }
    } else {
      const e_ai = this._originalToModifiedEdit;
      const e_user = edit3;
      const e_user_r = e_user.tryRebase(e_ai.inverse(this.originalModel.getValue()));
      if (e_user_r === void 0) {
        this._originalToModifiedEdit = e_ai.compose(e_user);
      } else {
        const edits = offsetEditToEditOperations(e_user_r, this.originalModel);
        this.originalModel.applyEdits(edits);
        this._originalToModifiedEdit = e_ai.rebaseSkipConflicting(e_user_r);
      }
      this._allEditsAreFromUs = false;
      this._updateDiffInfoSeq();
      if (!this._didUserEditModelFired) {
        this._didUserEditModelFired = true;
        this._didUserEditModel.fire();
      }
    }
  }
  async _keepHunk(change) {
    if (!this._diffInfo.get().changes.includes(change)) {
      return false;
    }
    const edits = [];
    for (const edit3 of change.innerChanges ?? []) {
      const newText = this.modifiedModel.getValueInRange(edit3.modifiedRange);
      edits.push(EditOperation.replace(edit3.originalRange, newText));
    }
    this.originalModel.pushEditOperations(null, edits, (_) => null);
    await this._updateDiffInfoSeq("accepted");
    if (this._diffInfo.get().identical) {
      this._didAcceptOrRejectAllHunks.fire(1 /* Accepted */);
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
    return true;
  }
  async _undoHunk(change) {
    if (!this._diffInfo.get().changes.includes(change)) {
      return false;
    }
    const edits = [];
    for (const edit3 of change.innerChanges ?? []) {
      const newText = this.originalModel.getValueInRange(edit3.originalRange);
      edits.push(EditOperation.replace(edit3.modifiedRange, newText));
    }
    this.modifiedModel.pushEditOperations(null, edits, (_) => null);
    await this._updateDiffInfoSeq("rejected");
    if (this._diffInfo.get().identical) {
      this._didAcceptOrRejectAllHunks.fire(2 /* Rejected */);
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
    return true;
  }
  async getDiffInfo() {
    if (!this._diffOperation) {
      this._updateDiffInfoSeq();
    }
    await this._diffOperation;
    return this._diffInfo.get();
  }
  async _updateDiffInfoSeq(notifyAction = void 0) {
    const myDiffOperationId = ++this._diffOperationIds;
    await Promise.resolve(this._diffOperation);
    const previousCount = this.lineChangeCount;
    const previousAdded = this.linesAdded;
    const previousRemoved = this.linesRemoved;
    if (this._diffOperationIds === myDiffOperationId) {
      const thisDiffOperation = this._updateDiffInfo();
      this._diffOperation = thisDiffOperation;
      await thisDiffOperation;
      if (notifyAction) {
        const affectedLines = {
          linesAdded: previousAdded - this.linesAdded,
          linesRemoved: previousRemoved - this.linesRemoved,
          lineCount: previousCount - this.lineChangeCount,
          hasRemainingEdits: this.lineChangeCount > 0
        };
        this.notifyHunkAction(notifyAction, affectedLines);
      }
    }
  }
  hasHunkAt(range2) {
    return this._diffInfo.get().changes.some((c) => c.modified.intersectsStrict(LineRange.fromRangeInclusive(range2)));
  }
  async _updateDiffInfo() {
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed() || this._store.isDisposed) {
      return void 0;
    }
    if (this.state.get() !== 0 /* Modified */) {
      this._diffInfo.set(nullDocumentDiff, void 0);
      this._originalToModifiedEdit = StringEdit.empty;
      return nullDocumentDiff;
    }
    const docVersionNow = this.modifiedModel.getVersionId();
    const snapshotVersionNow = this.originalModel.getVersionId();
    const diff4 = await this._editorWorkerService.computeDiff(
      this.originalModel.uri,
      this.modifiedModel.uri,
      {
        ignoreTrimWhitespace: false,
        // NEVER ignore whitespace so that undo/accept edits are correct and so that all changes (1 of 2) are spelled out
        computeMoves: false,
        maxComputationTimeMs: 3e3
      },
      "advanced"
    );
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed() || this._store.isDisposed) {
      return void 0;
    }
    if (this.modifiedModel.getVersionId() === docVersionNow && this.originalModel.getVersionId() === snapshotVersionNow) {
      const diff22 = diff4 ?? nullDocumentDiff;
      this._diffInfo.set(diff22, void 0);
      this._originalToModifiedEdit = offsetEditFromLineRangeMapping(this.originalModel, this.modifiedModel, diff22.changes);
      return diff22;
    }
    return void 0;
  }
};

ChatEditingTextModelChangeService = __decorateClass([
  __decorateParam(4, IEditorWorkerService),
  __decorateParam(5, IAccessibilitySignalService)
], ChatEditingTextModelChangeService);
export { ChatEditingTextModelChangeService };
