// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/model/notebookTextModel.ts
import { Emitter, PauseableEmitter } from "./module-0017.mjs";
import { Disposable, dispose } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { TextModel } from "./module-0423.mjs";
import { CellUri, diff } from "./module-0909.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { NotebookCellTextModel } from "./module-1883.mjs";
import { hasKey, isDefined } from "./module-0010.mjs";
import { filter } from "./module-0098.mjs";
import { NotebookCellOutputTextModel } from "./module-1882.mjs";
import { CellMetadataEdit, MoveCellEdit, SpliceCellsEdit } from "./module-1881.mjs";
import { LcsDiff } from "./module-0166.mjs";
import { SearchParams } from "./module-0171.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageDetectionService } from "./module-1097.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { INotebookLoggingService } from "./module-1395.mjs";
import { hash } from "./module-0039.mjs";


// src/vs/workbench/contrib/notebook/common/model/notebookTextModel.ts
var StackOperation = class {
  constructor(textModel, undoRedoGroup, _pauseableEmitter, _postUndoRedo, selectionState, beginAlternativeVersionId) {
    this.textModel = textModel;
    this.undoRedoGroup = undoRedoGroup;
    this._pauseableEmitter = _pauseableEmitter;
    this._postUndoRedo = _postUndoRedo;
    this.tag = "notebookUndoRedoElement";
    this._operations = [];
    this._beginSelectionState = void 0;
    this._resultSelectionState = void 0;
    this.type = 1 /* Workspace */;
    this._beginSelectionState = selectionState;
    this._beginAlternativeVersionId = beginAlternativeVersionId;
    this._resultAlternativeVersionId = beginAlternativeVersionId;
  }
  get code() {
    return this._operations.length === 1 ? this._operations[0].code : "undoredo.notebooks.stackOperation";
  }
  get label() {
    return this._operations.length === 1 ? this._operations[0].label : "edit";
  }
  get resources() {
    return [this.textModel.uri];
  }
  get isEmpty() {
    return this._operations.length === 0;
  }
  pushEndState(alternativeVersionId, selectionState) {
    this._resultAlternativeVersionId = alternativeVersionId;
    this._resultSelectionState = selectionState || this._resultSelectionState;
  }
  pushEditOperation(element, beginSelectionState, resultSelectionState, alternativeVersionId) {
    if (this._operations.length === 0) {
      this._beginSelectionState = this._beginSelectionState ?? beginSelectionState;
    }
    this._operations.push(element);
    this._resultSelectionState = resultSelectionState;
    this._resultAlternativeVersionId = alternativeVersionId;
  }
  async undo() {
    this._pauseableEmitter.pause();
    try {
      for (let i2 = this._operations.length - 1; i2 >= 0; i2--) {
        await this._operations[i2].undo();
      }
      this._postUndoRedo(this._beginAlternativeVersionId);
      this._pauseableEmitter.fire({
        rawEvents: [],
        synchronous: void 0,
        versionId: this.textModel.versionId,
        endSelectionState: this._beginSelectionState
      });
    } finally {
      this._pauseableEmitter.resume();
    }
  }
  async redo() {
    this._pauseableEmitter.pause();
    try {
      for (let i2 = 0; i2 < this._operations.length; i2++) {
        await this._operations[i2].redo();
      }
      this._postUndoRedo(this._resultAlternativeVersionId);
      this._pauseableEmitter.fire({
        rawEvents: [],
        synchronous: void 0,
        versionId: this.textModel.versionId,
        endSelectionState: this._resultSelectionState
      });
    } finally {
      this._pauseableEmitter.resume();
    }
  }
};

var NotebookOperationManager = class {
  constructor(_textModel, _undoService, _pauseableEmitter, _postUndoRedo) {
    this._textModel = _textModel;
    this._undoService = _undoService;
    this._pauseableEmitter = _pauseableEmitter;
    this._postUndoRedo = _postUndoRedo;
    this._pendingStackOperation = null;
    this._isAppending = false;
  }
  isUndoStackEmpty() {
    return this._pendingStackOperation === null || this._pendingStackOperation.isEmpty;
  }
  pushStackElement(alternativeVersionId, selectionState) {
    if (this._pendingStackOperation && !this._pendingStackOperation.isEmpty) {
      this._pendingStackOperation.pushEndState(alternativeVersionId, selectionState);
      if (!this._isAppending) {
        this._undoService.pushElement(this._pendingStackOperation, this._pendingStackOperation.undoRedoGroup);
      }
    }
    this._isAppending = false;
    this._pendingStackOperation = null;
  }
  _getOrCreateEditStackElement(beginSelectionState, undoRedoGroup, alternativeVersionId) {
    return this._pendingStackOperation ??= new StackOperation(this._textModel, undoRedoGroup, this._pauseableEmitter, this._postUndoRedo, beginSelectionState, alternativeVersionId || "");
  }
  appendPreviousOperation() {
    const previous = this._undoService.getLastElement(this._textModel.uri);
    if (previous && previous.tag === "notebookUndoRedoElement") {
      this._pendingStackOperation = previous;
      this._isAppending = true;
      return true;
    }
    return false;
  }
  pushEditOperation(element, beginSelectionState, resultSelectionState, alternativeVersionId, undoRedoGroup) {
    const pendingStackOperation = this._getOrCreateEditStackElement(beginSelectionState, undoRedoGroup, alternativeVersionId);
    pendingStackOperation.pushEditOperation(element, beginSelectionState, resultSelectionState, alternativeVersionId);
  }
};

var NotebookEventEmitter = class extends PauseableEmitter {
  get isEmpty() {
    return this._eventQueue.isEmpty();
  }
  isDirtyEvent() {
    for (const e of this._eventQueue) {
      for (let i2 = 0; i2 < e.rawEvents.length; i2++) {
        if (!e.rawEvents[i2].transient) {
          return true;
        }
      }
    }
    return false;
  }
};

var NotebookTextModel = class extends Disposable {
  constructor(viewType, uri5, cells, metadata, options3, _undoService, _modelService, _languageService, _languageDetectionService, _notebookExecutionStateService, _notebookLoggingService) {
    super();
    this.viewType = viewType;
    this.uri = uri5;
    this._undoService = _undoService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._languageDetectionService = _languageDetectionService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._notebookLoggingService = _notebookLoggingService;
    this._isDisposed = false;
    this._onWillDispose = this._register(new Emitter());
    this._onWillAddRemoveCells = this._register(new Emitter());
    this._onDidChangeContent = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.onWillAddRemoveCells = this._onWillAddRemoveCells.event;
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._cellhandlePool = 0;
    this._cellListeners = /* @__PURE__ */ new Map();
    this._cells = [];
    this.metadata = {};
    this.transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} };
    this._versionId = 0;
    /**
     * This alternative id is only for non-cell-content changes.
     */
    this._notebookSpecificAlternativeId = 0;
    /**
     * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
     */
    this._alternativeVersionId = "1";
    this.newCellsFromLastEdit = /* @__PURE__ */ new Set();
    this.transientOptions = options3;
    this.metadata = metadata;
    this._initialize(cells);
    const maybeUpdateCellTextModel = (textModel) => {
      if (textModel.uri.scheme === Schemas.vscodeNotebookCell && textModel instanceof TextModel) {
        const cellUri = CellUri.parse(textModel.uri);
        if (cellUri && isEqual2(cellUri.notebook, this.uri)) {
          const cellIdx = this._getCellIndexByHandle(cellUri.handle);
          if (cellIdx >= 0) {
            const cell = this.cells[cellIdx];
            if (cell) {
              cell.textModel = textModel;
            }
          }
        }
      }
    };
    this._register(_modelService.onModelAdded((e) => maybeUpdateCellTextModel(e)));
    this._pauseableEmitter = this._register(new NotebookEventEmitter({
      merge: (events) => {
        const first2 = events[0];
        const rawEvents = first2.rawEvents;
        let versionId = first2.versionId;
        let endSelectionState = first2.endSelectionState;
        let synchronous = first2.synchronous;
        for (let i2 = 1; i2 < events.length; i2++) {
          rawEvents.push(...events[i2].rawEvents);
          versionId = events[i2].versionId;
          endSelectionState = events[i2].endSelectionState !== void 0 ? events[i2].endSelectionState : endSelectionState;
          synchronous = events[i2].synchronous !== void 0 ? events[i2].synchronous : synchronous;
        }
        return { rawEvents, versionId, endSelectionState, synchronous };
      }
    }));
    this._register(this._pauseableEmitter.event((e) => {
      if (e.rawEvents.length) {
        this._onDidChangeContent.fire(e);
      }
    }));
    this._operationManager = new NotebookOperationManager(
      this,
      this._undoService,
      this._pauseableEmitter,
      (alternativeVersionId) => {
        this._increaseVersionId(true);
        this._overwriteAlternativeVersionId(alternativeVersionId);
      }
    );
    this._notebookLoggingService.trace("notebookTextModel", `Initialized notebook text model for ${uri5.toString()}`);
  }
  get length() {
    return this._cells.length;
  }
  get cells() {
    return this._cells;
  }
  get versionId() {
    return this._versionId;
  }
  get alternativeVersionId() {
    return this._alternativeVersionId;
  }
  get notebookType() {
    return this.viewType;
  }
  setCellCollapseDefault(collapseConfig) {
    this._defaultCollapseConfig = collapseConfig;
  }
  _initialize(cells, triggerDirty) {
    this._cells = [];
    this._versionId = 0;
    this._notebookSpecificAlternativeId = 0;
    const mainCells = cells.map((cell) => {
      const cellHandle = this._cellhandlePool++;
      const cellUri = CellUri.generate(this.uri, cellHandle);
      return new NotebookCellTextModel(
        cellUri,
        cellHandle,
        cell,
        this.transientOptions,
        this._languageService,
        this._modelService.getCreationOptions(cell.language, cellUri, false).defaultEOL,
        this._defaultCollapseConfig,
        this._languageDetectionService,
        this._notebookLoggingService
      );
    });
    for (let i2 = 0; i2 < mainCells.length; i2++) {
      const dirtyStateListener = mainCells[i2].onDidChangeContent((e) => {
        this._bindCellContentHandler(mainCells[i2], e);
      });
      this._cellListeners.set(mainCells[i2].handle, dirtyStateListener);
      this._register(mainCells[i2]);
    }
    this._cells.splice(0, 0, ...mainCells);
    this._alternativeVersionId = this._generateAlternativeId();
    if (triggerDirty) {
      this._pauseableEmitter.fire({
        rawEvents: [{ kind: 100 /* Unknown */, transient: false }],
        versionId: this.versionId,
        synchronous: true,
        endSelectionState: void 0
      });
    }
  }
  _bindCellContentHandler(cell, e) {
    this._increaseVersionId(e === "content" || typeof e === "object" && e.type === "model");
    switch (e) {
      case "content":
        this._pauseableEmitter.fire({
          rawEvents: [{ kind: 10 /* ChangeCellContent */, index: this._getCellIndexByHandle(cell.handle), transient: false }],
          versionId: this.versionId,
          synchronous: true,
          endSelectionState: void 0
        });
        break;
      case "language":
        this._pauseableEmitter.fire({
          rawEvents: [{ kind: 5 /* ChangeCellLanguage */, index: this._getCellIndexByHandle(cell.handle), language: cell.language, transient: false }],
          versionId: this.versionId,
          synchronous: true,
          endSelectionState: void 0
        });
        break;
      case "mime":
        this._pauseableEmitter.fire({
          rawEvents: [{ kind: 13 /* ChangeCellMime */, index: this._getCellIndexByHandle(cell.handle), mime: cell.mime, transient: false }],
          versionId: this.versionId,
          synchronous: true,
          endSelectionState: void 0
        });
        break;
      default:
        if (typeof e === "object" && e.type === "model") {
          this._pauseableEmitter.fire({
            rawEvents: [{ kind: 10 /* ChangeCellContent */, index: this._getCellIndexByHandle(cell.handle), transient: false }],
            versionId: this.versionId,
            synchronous: true,
            endSelectionState: void 0
          });
        }
        break;
    }
  }
  _generateAlternativeId() {
    return `${this._notebookSpecificAlternativeId}_` + this.cells.map((cell) => cell.handle + "," + cell.alternativeId).join(";");
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._onWillDispose.fire();
    this._undoService.removeElements(this.uri);
    dispose(this._cellListeners.values());
    this._cellListeners.clear();
    dispose(this._cells);
    this._cells = [];
    super.dispose();
  }
  pushStackElement() {
  }
  _getCellIndexByHandle(handle2) {
    return this.cells.findIndex((c) => c.handle === handle2);
  }
  _getCellIndexWithOutputIdHandleFromEdits(outputId, rawEdits) {
    const edit3 = rawEdits.find((e) => hasKey(e, { outputs: true }) && e.outputs.some((o) => o.outputId === outputId));
    if (edit3) {
      if (hasKey(edit3, { index: true })) {
        return edit3.index;
      } else if (hasKey(edit3, { handle: true })) {
        const cellIndex = this._getCellIndexByHandle(edit3.handle);
        this._assertIndex(cellIndex);
        return cellIndex;
      }
    }
    return -1;
  }
  _getCellIndexWithOutputIdHandle(outputId) {
    return this.cells.findIndex((c) => !!c.outputs.find((o) => o.outputId === outputId));
  }
  reset(cells, metadata, transientOptions) {
    this.transientOptions = transientOptions;
    const executions = this._notebookExecutionStateService.getCellExecutionsForNotebook(this.uri);
    const executingCellHandles = executions.filter((exe) => exe.state === 3 /* Executing */).map((exe) => exe.cellHandle);
    const edits = NotebookTextModel.computeEdits(this, cells, executingCellHandles);
    this.applyEdits(
      [
        ...edits,
        { editType: 5 /* DocumentMetadata */, metadata }
      ],
      true,
      void 0,
      () => void 0,
      void 0,
      false
    );
  }
  createSnapshot(options3) {
    const transientOptions = options3.transientOptions ?? this.transientOptions;
    const data = {
      metadata: filter(this.metadata, (key3) => !transientOptions.transientDocumentMetadata[key3]),
      cells: []
    };
    let outputSize = 0;
    for (const cell of this.cells) {
      const cellData = {
        cellKind: cell.cellKind,
        language: cell.language,
        mime: cell.mime,
        source: cell.getValue(),
        outputs: [],
        internalMetadata: cell.internalMetadata
      };
      if (options3.context === 2 /* Backup */ && options3.outputSizeLimit > 0) {
        cell.outputs.forEach((output) => {
          output.outputs.forEach((item) => {
            outputSize += item.data.byteLength;
          });
        });
        if (outputSize > options3.outputSizeLimit) {
          throw new Error("Notebook too large to backup");
        }
      }
      cellData.outputs = !transientOptions.transientOutputs ? cell.outputs : [];
      cellData.metadata = filter(cell.metadata, (key3) => !transientOptions.transientCellMetadata[key3]);
      data.cells.push(cellData);
    }
    return data;
  }
  restoreSnapshot(snapshot, transientOptions) {
    this.reset(snapshot.cells, snapshot.metadata, transientOptions ?? this.transientOptions);
  }
  static computeEdits(model, cells, executingHandles = []) {
    const edits = [];
    const isExecuting = (cell) => executingHandles.includes(cell.handle);
    const commonPrefix = this._commonPrefix(model.cells, model.cells.length, 0, cells, cells.length, 0, isExecuting);
    if (commonPrefix > 0) {
      for (let i2 = 0; i2 < commonPrefix; i2++) {
        edits.push(
          {
            editType: 3 /* Metadata */,
            index: i2,
            metadata: cells[i2].metadata ?? {}
          },
          ...this._computeOutputEdit(i2, model.cells[i2].outputs, cells[i2].outputs)
        );
      }
    }
    if (model.cells.length === cells.length && commonPrefix === model.cells.length) {
      return edits;
    }
    const commonSuffix = this._commonSuffix(model.cells, model.cells.length - commonPrefix, commonPrefix, cells, cells.length - commonPrefix, commonPrefix, isExecuting);
    if (commonSuffix > 0) {
      edits.push({ editType: 1 /* Replace */, index: commonPrefix, count: model.cells.length - commonPrefix - commonSuffix, cells: cells.slice(commonPrefix, cells.length - commonSuffix) });
    } else if (commonPrefix > 0) {
      edits.push({ editType: 1 /* Replace */, index: commonPrefix, count: model.cells.length - commonPrefix, cells: cells.slice(commonPrefix) });
    } else {
      edits.push({ editType: 1 /* Replace */, index: 0, count: model.cells.length, cells });
    }
    if (commonSuffix > 0) {
      for (let i2 = commonSuffix; i2 > 0; i2--) {
        edits.push(
          {
            editType: 3 /* Metadata */,
            index: model.cells.length - i2,
            metadata: cells[cells.length - i2].metadata ?? {}
          },
          ...this._computeOutputEdit(model.cells.length - i2, model.cells[model.cells.length - i2].outputs, cells[cells.length - i2].outputs)
        );
      }
    }
    return edits;
  }
  static _computeOutputEdit(index2, a, b) {
    if (a.length !== b.length) {
      return [
        {
          editType: 2 /* Output */,
          index: index2,
          outputs: b,
          append: false
        }
      ];
    }
    if (a.length === 0) {
      return [];
    }
    return b.map((output, i2) => {
      return {
        editType: 7 /* OutputItems */,
        outputId: a[i2].outputId,
        items: output.outputs,
        append: false
      };
    });
  }
  static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta, isExecuting) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i2 = 0; i2 < maxResult && a[aDelta + i2].fastEqual(b[bDelta + i2], isExecuting(a[aDelta + i2])); i2++) {
      result++;
    }
    return result;
  }
  static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta, isExecuting) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i2 = 0; i2 < maxResult && a[aDelta + aLen - i2 - 1].fastEqual(b[bDelta + bLen - i2 - 1], isExecuting(a[aDelta + aLen - i2 - 1])); i2++) {
      result++;
    }
    return result;
  }
  isOnlyEditingMetadataOnNewCells(rawEdits) {
    for (const edit3 of rawEdits) {
      if (edit3.editType === 9 /* PartialInternalMetadata */) {
        continue;
      }
      if (edit3.editType !== 3 /* Metadata */ && edit3.editType !== 8 /* PartialMetadata */) {
        return false;
      }
      if (hasKey(edit3, { index: true }) && !this.newCellsFromLastEdit.has(this.cells[edit3.index].handle)) {
        return false;
      }
      if (hasKey(edit3, { handle: true }) && !this.newCellsFromLastEdit.has(edit3.handle)) {
        return false;
      }
    }
    return true;
  }
  applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo) {
    this._notebookLoggingService.trace("textModelEdits", `Begin applying ${rawEdits.length} raw edits`);
    this._pauseableEmitter.pause();
    try {
      this._operationManager.pushStackElement(this._alternativeVersionId, void 0);
      if (computeUndoRedo && this.isOnlyEditingMetadataOnNewCells(rawEdits)) {
        if (!this._operationManager.appendPreviousOperation()) {
          computeUndoRedo = false;
        }
      } else if (computeUndoRedo) {
        this.newCellsFromLastEdit.clear();
      }
      try {
        this._doApplyEdits(rawEdits, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup);
        return true;
      } catch (err) {
        this._notebookLoggingService.error("textModelEdits", `Error while applying edits: ${err}`);
        throw err;
      } finally {
        if (!this._pauseableEmitter.isEmpty) {
          const endSelections = endSelectionsComputer();
          this._increaseVersionId(this._operationManager.isUndoStackEmpty() && !this._pauseableEmitter.isDirtyEvent());
          this._operationManager.pushStackElement(this._alternativeVersionId, endSelections);
          this._pauseableEmitter.fire({ rawEvents: [], versionId: this.versionId, synchronous, endSelectionState: endSelections });
          this._notebookLoggingService.trace("textModelEdits", `End applying ${rawEdits.length} raw edits`);
        }
      }
    } finally {
      this._pauseableEmitter.resume();
    }
  }
  _doApplyEdits(rawEdits, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const editsWithDetails = rawEdits.map((edit3, index2) => {
      let cellIndex = -1;
      if (hasKey(edit3, { index: true })) {
        cellIndex = edit3.index;
      } else if (hasKey(edit3, { handle: true })) {
        cellIndex = this._getCellIndexByHandle(edit3.handle);
        this._assertIndex(cellIndex, `editType: ${edit3.editType}, key: handle`);
      } else if (hasKey(edit3, { outputId: true })) {
        cellIndex = this._getCellIndexWithOutputIdHandle(edit3.outputId);
        if (this._indexIsInvalid(cellIndex)) {
          cellIndex = this._getCellIndexWithOutputIdHandleFromEdits(edit3.outputId, rawEdits.slice(0, index2));
        }
        if (this._indexIsInvalid(cellIndex)) {
          return null;
        }
      } else if (edit3.editType !== 5 /* DocumentMetadata */) {
        throw new Error("Invalid cell edit: " + JSON.stringify(edit3));
      }
      return {
        edit: edit3,
        cellIndex,
        end: edit3.editType === 5 /* DocumentMetadata */ ? void 0 : edit3.editType === 1 /* Replace */ ? edit3.index + edit3.count : cellIndex,
        originalIndex: index2
      };
    }).filter(isDefined);
    const edits = this._mergeCellEdits(editsWithDetails).sort((a, b) => {
      if (a.end === void 0) {
        return -1;
      }
      if (b.end === void 0) {
        return 1;
      }
      return b.end - a.end || b.originalIndex - a.originalIndex;
    }).reduce((prev, curr) => {
      if (!prev.length) {
        prev.push([curr]);
      } else {
        const last = prev[prev.length - 1];
        const index2 = last[0].cellIndex;
        if (curr.cellIndex === index2) {
          last.push(curr);
        } else {
          prev.push([curr]);
        }
      }
      return prev;
    }, []).map((editsOnSameIndex) => {
      const replaceEdits = [];
      const otherEdits = [];
      editsOnSameIndex.forEach((edit3) => {
        if (edit3.edit.editType === 1 /* Replace */) {
          replaceEdits.push(edit3);
        } else {
          otherEdits.push(edit3);
        }
      });
      return [...otherEdits.reverse(), ...replaceEdits];
    });
    const flattenEdits = edits.flat();
    for (const { edit: edit3, cellIndex } of flattenEdits) {
      switch (edit3.editType) {
        case 1 /* Replace */:
          this._replaceCells(edit3.index, edit3.count, edit3.cells, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case 2 /* Output */: {
          this._assertIndex(cellIndex);
          const cell = this._cells[cellIndex];
          if (edit3.append) {
            this._spliceNotebookCellOutputs(cell, { start: cell.outputs.length, deleteCount: 0, newOutputs: edit3.outputs.map((op) => new NotebookCellOutputTextModel(op)) }, true, computeUndoRedo);
          } else {
            this._spliceNotebookCellOutputs2(cell, edit3.outputs, computeUndoRedo);
          }
          break;
        }
        case 7 /* OutputItems */:
          {
            this._assertIndex(cellIndex);
            const cell = this._cells[cellIndex];
            if (edit3.append) {
              this._appendNotebookCellOutputItems(cell, edit3.outputId, edit3.items);
            } else {
              this._replaceNotebookCellOutputItems(cell, edit3.outputId, edit3.items);
            }
          }
          break;
        case 3 /* Metadata */:
          this._assertIndex(edit3.index);
          this._changeCellMetadata(this._cells[edit3.index], edit3.metadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case 8 /* PartialMetadata */:
          this._assertIndex(cellIndex);
          this._changeCellMetadataPartial(this._cells[cellIndex], edit3.metadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case 9 /* PartialInternalMetadata */:
          this._assertIndex(cellIndex);
          this._changeCellInternalMetadataPartial(this._cells[cellIndex], edit3.internalMetadata);
          break;
        case 4 /* CellLanguage */:
          this._assertIndex(edit3.index);
          this._changeCellLanguage(this._cells[edit3.index], edit3.language, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case 5 /* DocumentMetadata */:
          this._updateNotebookCellMetadata(edit3.metadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case 6 /* Move */:
          this._moveCellToIdx(edit3.index, edit3.length, edit3.newIdx, synchronous, computeUndoRedo, beginSelectionState, void 0, undoRedoGroup);
          break;
      }
    }
  }
  _mergeCellEdits(rawEdits) {
    const mergedEdits = [];
    rawEdits.forEach((edit3) => {
      if (mergedEdits.length) {
        const last = mergedEdits[mergedEdits.length - 1];
        if (last.edit.editType === 2 /* Output */ && last.edit.append && edit3.edit.editType === 2 /* Output */ && edit3.edit.append && last.cellIndex === edit3.cellIndex) {
          last.edit.outputs = [...last.edit.outputs, ...edit3.edit.outputs];
        } else if (last.edit.editType === 2 /* Output */ && !last.edit.append && last.edit.outputs.length === 0 && edit3.edit.editType === 2 /* Output */ && edit3.edit.append && last.cellIndex === edit3.cellIndex) {
          last.edit.append = false;
          last.edit.outputs = edit3.edit.outputs;
        } else {
          mergedEdits.push(edit3);
        }
      } else {
        mergedEdits.push(edit3);
      }
    });
    return mergedEdits;
  }
  _replaceCells(index2, count2, cellDtos, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    if (count2 === 0 && cellDtos.length === 0) {
      return;
    }
    const oldViewCells = this._cells.slice(0);
    const oldSet = /* @__PURE__ */ new Set();
    oldViewCells.forEach((cell) => {
      oldSet.add(cell.handle);
    });
    for (let i2 = index2; i2 < Math.min(index2 + count2, this._cells.length); i2++) {
      const cell = this._cells[i2];
      this._cellListeners.get(cell.handle)?.dispose();
      this._cellListeners.delete(cell.handle);
    }
    const cells = cellDtos.map((cellDto) => {
      const cellHandle = this._cellhandlePool++;
      const cellUri = CellUri.generate(this.uri, cellHandle);
      if (!cellDto.outputs) {
        cellDto.outputs = [];
      }
      const cell = new NotebookCellTextModel(
        cellUri,
        cellHandle,
        cellDto,
        this.transientOptions,
        this._languageService,
        this._modelService.getCreationOptions(cellDto.language, cellUri, false).defaultEOL,
        this._defaultCollapseConfig,
        this._languageDetectionService,
        this._notebookLoggingService
      );
      const textModel = this._modelService.getModel(cellUri);
      if (textModel && textModel instanceof TextModel) {
        cell.textModel = textModel;
        cell.language = cellDto.language;
        cell.textModel.setValue(cellDto.source);
        cell.resetTextBuffer(cell.textModel.getTextBuffer());
      }
      const dirtyStateListener = cell.onDidChangeContent((e) => {
        this._bindCellContentHandler(cell, e);
      });
      this.newCellsFromLastEdit.add(cell.handle);
      this._cellListeners.set(cell.handle, dirtyStateListener);
      this._register(cell);
      return cell;
    });
    const cellsCopy = this._cells.slice(0);
    cellsCopy.splice(index2, count2, ...cells);
    const diffs = diff(this._cells, cellsCopy, (cell) => {
      return oldSet.has(cell.handle);
    }).map((diff4) => {
      return [diff4.start, diff4.deleteCount, diff4.toInsert];
    });
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: 1 /* ModelChange */, changes: diffs } });
    this._cells = cellsCopy;
    const undoDiff = diffs.map((diff4) => {
      const deletedCells = oldViewCells.slice(diff4[0], diff4[0] + diff4[1]);
      return [diff4[0], deletedCells, diff4[2]];
    });
    if (computeUndoRedo) {
      this._operationManager.pushEditOperation(new SpliceCellsEdit(this.uri, undoDiff, {
        insertCell: (index3, cell, endSelections) => {
          this._insertNewCell(index3, [cell], true, endSelections);
        },
        deleteCell: (index3, endSelections) => {
          this._removeCell(index3, 1, true, endSelections);
        },
        replaceCell: (index3, count3, cells2, endSelections) => {
          this._replaceNewCells(index3, count3, cells2, true, endSelections);
        }
      }, void 0, void 0), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
    }
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 1 /* ModelChange */, changes: diffs, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: void 0
    });
  }
  _increaseVersionId(transient) {
    this._versionId = this._versionId + 1;
    if (!transient) {
      this._notebookSpecificAlternativeId = this._versionId;
    }
    this._alternativeVersionId = this._generateAlternativeId();
  }
  _overwriteAlternativeVersionId(newAlternativeVersionId) {
    this._alternativeVersionId = newAlternativeVersionId;
    this._notebookSpecificAlternativeId = Number(newAlternativeVersionId.substring(0, newAlternativeVersionId.indexOf("_")));
  }
  _updateNotebookCellMetadata(metadata, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const oldMetadata = this.metadata;
    const triggerDirtyChange = this._isDocumentMetadataChanged(this.metadata, metadata);
    if (triggerDirtyChange) {
      if (computeUndoRedo) {
        const that = this;
        this._operationManager.pushEditOperation(new class {
          constructor() {
            this.type = 0 /* Resource */;
            this.label = "Update Cell Metadata";
            this.code = "undoredo.textBufferEdit";
          }
          get resource() {
            return that.uri;
          }
          undo() {
            that._updateNotebookCellMetadata(oldMetadata, false, beginSelectionState, undoRedoGroup);
          }
          redo() {
            that._updateNotebookCellMetadata(metadata, false, beginSelectionState, undoRedoGroup);
          }
        }(), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
      }
    }
    this.metadata = metadata;
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 11 /* ChangeDocumentMetadata */, metadata: this.metadata, transient: !triggerDirtyChange }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _insertNewCell(index2, cells, synchronous, endSelections) {
    for (let i2 = 0; i2 < cells.length; i2++) {
      const dirtyStateListener = cells[i2].onDidChangeContent((e) => {
        this._bindCellContentHandler(cells[i2], e);
      });
      this._cellListeners.set(cells[i2].handle, dirtyStateListener);
    }
    const changes = [[index2, 0, cells]];
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: 1 /* ModelChange */, changes } });
    this._cells.splice(index2, 0, ...cells);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 1 /* ModelChange */, changes, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
    return;
  }
  _removeCell(index2, count2, synchronous, endSelections) {
    for (let i2 = index2; i2 < index2 + count2; i2++) {
      const cell = this._cells[i2];
      this._cellListeners.get(cell.handle)?.dispose();
      this._cellListeners.delete(cell.handle);
    }
    const changes = [[index2, count2, []]];
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: 1 /* ModelChange */, changes } });
    this._cells.splice(index2, count2);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 1 /* ModelChange */, changes, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
  }
  _replaceNewCells(index2, count2, cells, synchronous, endSelections) {
    for (let i2 = index2; i2 < index2 + count2; i2++) {
      const cell = this._cells[i2];
      this._cellListeners.get(cell.handle)?.dispose();
      this._cellListeners.delete(cell.handle);
    }
    for (let i2 = 0; i2 < cells.length; i2++) {
      const dirtyStateListener = cells[i2].onDidChangeContent((e) => {
        this._bindCellContentHandler(cells[i2], e);
      });
      this._cellListeners.set(cells[i2].handle, dirtyStateListener);
    }
    const changes = [[index2, count2, cells]];
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: 1 /* ModelChange */, changes } });
    this._cells.splice(index2, count2, ...cells);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 1 /* ModelChange */, changes, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
  }
  _isDocumentMetadataChanged(a, b) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key3 of keys) {
      if (key3 === "custom") {
        if (!this._customMetadataEqual(a[key3], b[key3]) && !this.transientOptions.transientDocumentMetadata[key3]) {
          return true;
        }
      } else if (a[key3] !== b[key3] && !this.transientOptions.transientDocumentMetadata[key3]) {
        return true;
      }
    }
    return false;
  }
  _isCellMetadataChanged(a, b) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key3 of keys) {
      if (a[key3] !== b[key3] && !this.transientOptions.transientCellMetadata[key3]) {
        return true;
      }
    }
    return false;
  }
  _customMetadataEqual(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    if (aProps.length !== bProps.length) {
      return false;
    }
    for (let i2 = 0; i2 < aProps.length; i2++) {
      const propName = aProps[i2];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  }
  _changeCellMetadataPartial(cell, metadata, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const newMetadata = {
      ...cell.metadata
    };
    let k;
    for (k in metadata) {
      const value2 = metadata[k] ?? void 0;
      newMetadata[k] = value2;
    }
    return this._changeCellMetadata(cell, newMetadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
  }
  _changeCellMetadata(cell, metadata, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const triggerDirtyChange = this._isCellMetadataChanged(cell.metadata, metadata);
    if (triggerDirtyChange) {
      if (computeUndoRedo) {
        const index2 = this._cells.indexOf(cell);
        this._operationManager.pushEditOperation(new CellMetadataEdit(this.uri, index2, Object.freeze(cell.metadata), Object.freeze(metadata), {
          updateCellMetadata: (index3, newMetadata) => {
            const cell2 = this._cells[index3];
            if (!cell2) {
              return;
            }
            this._changeCellMetadata(cell2, newMetadata, false, beginSelectionState, undoRedoGroup);
          }
        }), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
      }
    }
    cell.metadata = metadata;
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 7 /* ChangeCellMetadata */, index: this._cells.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _changeCellInternalMetadataPartial(cell, internalMetadata) {
    const newInternalMetadata = {
      ...cell.internalMetadata
    };
    let k;
    for (k in internalMetadata) {
      const value2 = internalMetadata[k] ?? void 0;
      newInternalMetadata[k] = value2;
    }
    cell.internalMetadata = newInternalMetadata;
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 12 /* ChangeCellInternalMetadata */, index: this._cells.indexOf(cell), internalMetadata: cell.internalMetadata, transient: true }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _changeCellLanguage(cell, languageId, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    if (cell.language === languageId) {
      return;
    }
    const oldLanguage = cell.language;
    cell.language = languageId;
    if (computeUndoRedo) {
      const that = this;
      this._operationManager.pushEditOperation(new class {
        constructor() {
          this.type = 0 /* Resource */;
          this.label = "Update Cell Language";
          this.code = "undoredo.textBufferEdit";
        }
        get resource() {
          return that.uri;
        }
        undo() {
          that._changeCellLanguage(cell, oldLanguage, false, beginSelectionState, undoRedoGroup);
        }
        redo() {
          that._changeCellLanguage(cell, languageId, false, beginSelectionState, undoRedoGroup);
        }
      }(), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
    }
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 5 /* ChangeCellLanguage */, index: this._cells.indexOf(cell), language: languageId, transient: false }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _spliceNotebookCellOutputs2(cell, outputs, computeUndoRedo) {
    if (outputs.length === 0 && cell.outputs.length === 0) {
      return;
    }
    if (outputs.length <= 1) {
      this._spliceNotebookCellOutputs(cell, { start: 0, deleteCount: cell.outputs.length, newOutputs: outputs.map((op) => new NotebookCellOutputTextModel(op)) }, false, computeUndoRedo);
      return;
    }
    const diff4 = new LcsDiff(new OutputSequence(cell.outputs), new OutputSequence(outputs));
    const diffResult = diff4.ComputeDiff(false);
    const splices = diffResult.changes.map((change) => ({
      start: change.originalStart,
      deleteCount: change.originalLength,
      // create cell output text model only when it's inserted into the notebook document
      newOutputs: outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength).map((op) => new NotebookCellOutputTextModel(op))
    }));
    splices.reverse().forEach((splice3) => {
      this._spliceNotebookCellOutputs(cell, splice3, false, computeUndoRedo);
    });
  }
  _spliceNotebookCellOutputs(cell, splice3, append4, computeUndoRedo) {
    cell.spliceNotebookCellOutputs(splice3);
    this._pauseableEmitter.fire({
      rawEvents: [{
        kind: 8 /* Output */,
        index: this._cells.indexOf(cell),
        outputs: cell.outputs.map((output) => output.asDto()) ?? [],
        append: append4,
        transient: this.transientOptions.transientOutputs
      }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _appendNotebookCellOutputItems(cell, outputId, items) {
    if (cell.changeOutputItems(outputId, true, items)) {
      this._pauseableEmitter.fire({
        rawEvents: [{
          kind: 9 /* OutputItem */,
          index: this._cells.indexOf(cell),
          outputId,
          outputItems: items,
          append: true,
          transient: this.transientOptions.transientOutputs
        }],
        versionId: this.versionId,
        synchronous: true,
        endSelectionState: void 0
      });
    }
  }
  _replaceNotebookCellOutputItems(cell, outputId, items) {
    if (cell.changeOutputItems(outputId, false, items)) {
      this._pauseableEmitter.fire({
        rawEvents: [{
          kind: 9 /* OutputItem */,
          index: this._cells.indexOf(cell),
          outputId,
          outputItems: items,
          append: false,
          transient: this.transientOptions.transientOutputs
        }],
        versionId: this.versionId,
        synchronous: true,
        endSelectionState: void 0
      });
    }
  }
  _moveCellToIdx(index2, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections, undoRedoGroup) {
    if (pushedToUndoStack) {
      this._operationManager.pushEditOperation(new MoveCellEdit(this.uri, index2, length, newIdx, {
        moveCell: (fromIndex, length2, toIndex, beforeSelections2, endSelections2) => {
          this._moveCellToIdx(fromIndex, length2, toIndex, true, false, beforeSelections2, endSelections2, undoRedoGroup);
        }
      }, beforeSelections, endSelections), beforeSelections, endSelections, this._alternativeVersionId, undoRedoGroup);
    }
    this._assertIndex(index2);
    this._assertIndex(newIdx);
    const cells = this._cells.splice(index2, length);
    this._cells.splice(newIdx, 0, ...cells);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: 2 /* Move */, index: index2, length, newIdx, cells, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
    return true;
  }
  _assertIndex(index2, context2) {
    if (this._indexIsInvalid(index2)) {
      throw new Error(`model index out of range ${index2} (cellCount: ${this._cells.length}${context2 ? `, ${context2}` : ""})`);
    }
  }
  _indexIsInvalid(index2) {
    return index2 < 0 || index2 >= this._cells.length;
  }
  //#region Find
  findNextMatch(searchString, searchStart, isRegex2, matchCase, wordSeparators2, searchEnd) {
    this._assertIndex(searchStart.cellIndex);
    const searchParams = new SearchParams(searchString, isRegex2, matchCase, wordSeparators2);
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return null;
    }
    let cellIndex = searchStart.cellIndex;
    let searchStartPosition = searchStart.position;
    let searchEndCell = this._cells.length;
    while (cellIndex < searchEndCell) {
      const cell = this._cells[cellIndex];
      const wrapFlag = searchEnd && cellIndex === searchEnd.cellIndex && searchStartPosition.isBefore(searchEnd.position);
      const searchRange = new Range2(
        searchStartPosition.lineNumber,
        searchStartPosition.column,
        wrapFlag ? searchEnd.position.lineNumber : cell.textBuffer.getLineCount(),
        wrapFlag ? searchEnd.position.column : cell.textBuffer.getLineMaxColumn(cell.textBuffer.getLineCount())
      );
      const result = cell.textBuffer.findMatchesLineByLine(searchRange, searchData, false, 1);
      if (result.length > 0) {
        return { cell, match: result[0] };
      } else if (wrapFlag) {
        break;
      }
      cellIndex++;
      if (searchEnd && cellIndex >= this._cells.length) {
        cellIndex = 0;
        searchEndCell = searchEnd.cellIndex + 1;
      }
      searchStartPosition = new Position(1, 1);
    }
    return null;
  }
  findMatches(searchString, isRegex2, matchCase, wordSeparators2) {
    const searchParams = new SearchParams(searchString, isRegex2, matchCase, wordSeparators2);
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return [];
    }
    const results = [];
    for (const cell of this._cells) {
      const searchRange = new Range2(1, 1, cell.textBuffer.getLineCount(), cell.textBuffer.getLineMaxColumn(cell.textBuffer.getLineCount()));
      const matches2 = cell.textBuffer.findMatchesLineByLine(searchRange, searchData, false, 1e3);
      if (matches2.length > 0) {
        results.push({ cell, matches: matches2 });
      }
    }
    return results;
  }
  //#endregion
};

NotebookTextModel = __decorateClass([
  __decorateParam(5, IUndoRedoService),
  __decorateParam(6, IModelService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, ILanguageDetectionService),
  __decorateParam(9, INotebookExecutionStateService),
  __decorateParam(10, INotebookLoggingService)
], NotebookTextModel);

var OutputSequence = class {
  constructor(outputs) {
    this.outputs = outputs;
  }
  getElements() {
    return this.outputs.map((output) => {
      return hash(output.outputs.map((output2) => ({
        mime: output2.mime,
        data: output2.data
      })));
    });
  }
};
export { StackOperation, NotebookOperationManager, NotebookEventEmitter, NotebookTextModel, OutputSequence };
