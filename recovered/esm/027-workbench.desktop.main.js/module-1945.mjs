// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl.ts
import { IntervalNode, IntervalTree } from "./module-0373.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { NotebookCellSelectionCollection } from "./module-1944.mjs";
import { singleLetterHash } from "./module-0030.mjs";
import { cellIndexesToRanges, cellRangesToIndexes, reduceCellRanges } from "./module-0940.mjs";
import { NotebookMetadataChangedEvent } from "./module-1895.mjs";
import { CodeCellViewModel } from "./module-1900.mjs";
import { clamp } from "./module-0040.mjs";
import { Range2 } from "./module-0106.mjs";
import { isNotebookCellDecoration } from "./module-0941.mjs";
import { groupBy } from "./module-0003.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { CellFindMatchModel } from "./module-1943.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { MultiModelEditStackElement, SingleModelEditStackElement } from "./module-0393.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { MarkupCellViewModel } from "./module-1901.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl.ts
var invalidFunc4 = () => {
  throw new Error(`Invalid change accessor`);
};

var DecorationsTree = class {
  constructor() {
    this._decorationsTree = new IntervalTree();
  }
  intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations = false) {
    const r1 = this._decorationsTree.intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
    return r1;
  }
  search(filterOwnerId, filterOutValidation, filterFontDecorations2, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
    return this._decorationsTree.search(filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
  }
  collectNodesFromOwner(ownerId2) {
    const r1 = this._decorationsTree.collectNodesFromOwner(ownerId2);
    return r1;
  }
  collectNodesPostOrder() {
    const r1 = this._decorationsTree.collectNodesPostOrder();
    return r1;
  }
  insert(node) {
    this._decorationsTree.insert(node);
  }
  delete(node) {
    this._decorationsTree.delete(node);
  }
  resolveNode(node, cachedVersionId) {
    this._decorationsTree.resolveNode(node, cachedVersionId);
  }
  acceptReplace(offset, length, textLength, forceMoveMarkers) {
    this._decorationsTree.acceptReplace(offset, length, textLength, forceMoveMarkers);
  }
};

var TRACKED_RANGE_OPTIONS2 = [
  ModelDecorationOptions.register({ description: "notebook-view-model-tracked-range-always-grows-when-typing-at-edges", stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */ }),
  ModelDecorationOptions.register({ description: "notebook-view-model-tracked-range-never-grows-when-typing-at-edges", stickiness: 1 /* NeverGrowsWhenTypingAtEdges */ }),
  ModelDecorationOptions.register({ description: "notebook-view-model-tracked-range-grows-only-when-typing-before", stickiness: 2 /* GrowsOnlyWhenTypingBefore */ }),
  ModelDecorationOptions.register({ description: "notebook-view-model-tracked-range-grows-only-when-typing-after", stickiness: 3 /* GrowsOnlyWhenTypingAfter */ })
];

function _normalizeOptions2(options3) {
  if (options3 instanceof ModelDecorationOptions) {
    return options3;
  }
  return ModelDecorationOptions.createDynamic(options3);
}

var MODEL_ID3 = 0;

var NotebookViewModel = class extends Disposable {
  constructor(viewType, _notebook, _viewContext, _layoutInfo, _options, _instantiationService, _bulkEditService, _undoService, _textModelService, notebookExecutionStateService) {
    super();
    this.viewType = viewType;
    this._notebook = _notebook;
    this._viewContext = _viewContext;
    this._layoutInfo = _layoutInfo;
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._bulkEditService = _bulkEditService;
    this._undoService = _undoService;
    this._textModelService = _textModelService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this._localStore = this._register(new DisposableStore());
    this._handleToViewCellMapping = /* @__PURE__ */ new Map();
    this._onDidChangeOptions = this._register(new Emitter());
    this._viewCells = [];
    this._onDidChangeViewCells = this._register(new Emitter());
    this._lastNotebookEditResource = [];
    this._onDidChangeSelection = this._register(new Emitter());
    this._selectionCollection = this._register(new NotebookCellSelectionCollection());
    this._decorationsTree = new DecorationsTree();
    this._decorations = /* @__PURE__ */ Object.create(null);
    this._lastDecorationId = 0;
    this._foldingRanges = null;
    this._onDidFoldingStateChanged = this._register(new Emitter());
    this.onDidFoldingStateChanged = this._onDidFoldingStateChanged.event;
    this._hiddenRanges = [];
    this._focused = true;
    this._decorationIdToCellMap = /* @__PURE__ */ new Map();
    this._statusBarItemIdToCellMap = /* @__PURE__ */ new Map();
    this._lastOverviewRulerDecorationId = 0;
    this._overviewRulerDecorations = /* @__PURE__ */ new Map();
    MODEL_ID3++;
    this.id = "$notebookViewModel" + MODEL_ID3;
    this._instanceId = singleLetterHash(MODEL_ID3);
    const compute = (changes, synchronous) => {
      const diffs = changes.map((splice3) => {
        return [splice3[0], splice3[1], splice3[2].map((cell) => {
          return createCellViewModel(this._instantiationService, this, cell, this._viewContext);
        })];
      });
      diffs.reverse().forEach((diff4) => {
        const deletedCells = this._viewCells.splice(diff4[0], diff4[1], ...diff4[2]);
        this._decorationsTree.acceptReplace(diff4[0], diff4[1], diff4[2].length, true);
        deletedCells.forEach((cell) => {
          this._handleToViewCellMapping.delete(cell.handle);
          this._localStore.delete(cell);
        });
        diff4[2].forEach((cell) => {
          this._handleToViewCellMapping.set(cell.handle, cell);
          this._localStore.add(cell);
        });
      });
      const selectionHandles = this.selectionHandles;
      this._onDidChangeViewCells.fire({
        synchronous,
        splices: diffs
      });
      let endSelectionHandles = [];
      if (selectionHandles.length) {
        const primaryHandle = selectionHandles[0];
        const primarySelectionIndex = this._viewCells.indexOf(this.getCellByHandle(primaryHandle));
        endSelectionHandles = [primaryHandle];
        let delta2 = 0;
        for (let i2 = 0; i2 < diffs.length; i2++) {
          const diff4 = diffs[0];
          if (diff4[0] + diff4[1] <= primarySelectionIndex) {
            delta2 += diff4[2].length - diff4[1];
            continue;
          }
          if (diff4[0] > primarySelectionIndex) {
            endSelectionHandles = [primaryHandle];
            break;
          }
          if (diff4[0] + diff4[1] > primarySelectionIndex) {
            endSelectionHandles = [this._viewCells[diff4[0] + delta2].handle];
            break;
          }
        }
      }
      const selectionIndexes = endSelectionHandles.map((handle2) => this._viewCells.findIndex((cell) => cell.handle === handle2));
      this._selectionCollection.setState(cellIndexesToRanges([selectionIndexes[0]])[0], cellIndexesToRanges(selectionIndexes), true, "model");
    };
    this._register(this._notebook.onDidChangeContent((e) => {
      for (let i2 = 0; i2 < e.rawEvents.length; i2++) {
        const change = e.rawEvents[i2];
        let changes = [];
        const synchronous = e.synchronous ?? true;
        if (change.kind === 1 /* ModelChange */ || change.kind === 6 /* Initialize */) {
          changes = change.changes;
          compute(changes, synchronous);
          continue;
        } else if (change.kind === 2 /* Move */) {
          compute([[change.index, change.length, []]], synchronous);
          compute([[change.newIdx, 0, change.cells]], synchronous);
        } else {
          continue;
        }
      }
    }));
    this._register(this._notebook.onDidChangeContent((contentChanges) => {
      contentChanges.rawEvents.forEach((e) => {
        if (e.kind === 11 /* ChangeDocumentMetadata */) {
          this._viewContext.eventDispatcher.emit([new NotebookMetadataChangedEvent(this._notebook.metadata)]);
        }
      });
      if (contentChanges.endSelectionState) {
        this.updateSelectionsState(contentChanges.endSelectionState);
      }
    }));
    this._register(this._viewContext.eventDispatcher.onDidChangeLayout((e) => {
      this._layoutInfo = e.value;
      this._viewCells.forEach((cell) => {
        if (cell.cellKind === 1 /* Markup */) {
          if (e.source.width || e.source.fontInfo) {
            cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
          }
        } else {
          if (e.source.width !== void 0) {
            cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
          }
        }
      });
    }));
    this._register(this._viewContext.notebookOptions.onDidChangeOptions((e) => {
      for (let i2 = 0; i2 < this.length; i2++) {
        const cell = this._viewCells[i2];
        cell.updateOptions(e);
      }
    }));
    this._register(notebookExecutionStateService.onDidChangeExecution((e) => {
      if (e.type !== 0 /* cell */) {
        return;
      }
      const cell = this.getCellByHandle(e.cellHandle);
      if (cell instanceof CodeCellViewModel) {
        cell.updateExecutionState(e);
      }
    }));
    this._register(this._selectionCollection.onDidChangeSelection((e) => {
      this._onDidChangeSelection.fire(e);
    }));
    const viewCellCount = this.isRepl ? this._notebook.cells.length - 1 : this._notebook.cells.length;
    for (let i2 = 0; i2 < viewCellCount; i2++) {
      this._viewCells.push(createCellViewModel(this._instantiationService, this, this._notebook.cells[i2], this._viewContext));
    }
    this._viewCells.forEach((cell) => {
      this._handleToViewCellMapping.set(cell.handle, cell);
    });
  }
  get options() {
    return this._options;
  }
  get onDidChangeOptions() {
    return this._onDidChangeOptions.event;
  }
  get viewCells() {
    return this._viewCells;
  }
  get length() {
    return this._viewCells.length;
  }
  get notebookDocument() {
    return this._notebook;
  }
  get uri() {
    return this._notebook.uri;
  }
  get metadata() {
    return this._notebook.metadata;
  }
  get isRepl() {
    return this.viewType === "repl";
  }
  get onDidChangeViewCells() {
    return this._onDidChangeViewCells.event;
  }
  get lastNotebookEditResource() {
    if (this._lastNotebookEditResource.length) {
      return this._lastNotebookEditResource[this._lastNotebookEditResource.length - 1];
    }
    return null;
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  get onDidChangeSelection() {
    return this._onDidChangeSelection.event;
  }
  get selectionHandles() {
    const handlesSet = /* @__PURE__ */ new Set();
    const handles = [];
    cellRangesToIndexes(this._selectionCollection.selections).map((index2) => index2 < this.length ? this.cellAt(index2) : void 0).forEach((cell) => {
      if (cell && !handlesSet.has(cell.handle)) {
        handlesSet.add(cell.handle);
        handles.push(cell.handle);
      }
    });
    return handles;
  }
  set selectionHandles(selectionHandles) {
    const indexes = selectionHandles.map((handle2) => this._viewCells.findIndex((cell) => cell.handle === handle2));
    this._selectionCollection.setSelections(cellIndexesToRanges(indexes), true, "model");
  }
  get focused() {
    return this._focused;
  }
  updateOptions(newOptions) {
    this._options = { ...this._options, ...newOptions };
    this._viewCells.forEach((cell) => cell.updateOptions({ readonly: this._options.isReadOnly }));
    this._onDidChangeOptions.fire();
  }
  getFocus() {
    return this._selectionCollection.focus;
  }
  getSelections() {
    return this._selectionCollection.selections;
  }
  getMostRecentlyExecutedCell() {
    const handle2 = this.notebookExecutionStateService.getLastCompletedCellForNotebook(this._notebook.uri);
    return handle2 !== void 0 ? this.getCellByHandle(handle2) : void 0;
  }
  setEditorFocus(focused) {
    this._focused = focused;
  }
  validateRange(cellRange) {
    if (!cellRange) {
      return null;
    }
    const start = clamp(cellRange.start, 0, this.length);
    const end = clamp(cellRange.end, 0, this.length);
    if (start <= end) {
      return { start, end };
    } else {
      return { start: end, end: start };
    }
  }
  // selection change from list view's `setFocus` and `setSelection` should always use `source: view` to prevent events breaking the list view focus/selection change transaction
  updateSelectionsState(state, source = "model") {
    if (this._focused || source === "model") {
      if (state.kind === 0 /* Handle */) {
        const primaryIndex = state.primary !== null ? this.getCellIndexByHandle(state.primary) : null;
        const primarySelection = primaryIndex !== null ? this.validateRange({ start: primaryIndex, end: primaryIndex + 1 }) : null;
        const selections = cellIndexesToRanges(state.selections.map((sel) => this.getCellIndexByHandle(sel))).map((range2) => this.validateRange(range2)).filter((range2) => range2 !== null);
        this._selectionCollection.setState(primarySelection, reduceCellRanges(selections), true, source);
      } else {
        const primarySelection = this.validateRange(state.focus);
        const selections = state.selections.map((range2) => this.validateRange(range2)).filter((range2) => range2 !== null);
        this._selectionCollection.setState(primarySelection, reduceCellRanges(selections), true, source);
      }
    }
  }
  getFoldingStartIndex(index2) {
    if (!this._foldingRanges) {
      return -1;
    }
    const range2 = this._foldingRanges.findRange(index2 + 1);
    const startIndex = this._foldingRanges.getStartLineNumber(range2) - 1;
    return startIndex;
  }
  getFoldingState(index2) {
    if (!this._foldingRanges) {
      return 0 /* None */;
    }
    const range2 = this._foldingRanges.findRange(index2 + 1);
    const startIndex = this._foldingRanges.getStartLineNumber(range2) - 1;
    if (startIndex !== index2) {
      return 0 /* None */;
    }
    return this._foldingRanges.isCollapsed(range2) ? 2 /* Collapsed */ : 1 /* Expanded */;
  }
  getFoldedLength(index2) {
    if (!this._foldingRanges) {
      return 0;
    }
    const range2 = this._foldingRanges.findRange(index2 + 1);
    const startIndex = this._foldingRanges.getStartLineNumber(range2) - 1;
    const endIndex = this._foldingRanges.getEndLineNumber(range2) - 1;
    return endIndex - startIndex;
  }
  updateFoldingRanges(ranges) {
    this._foldingRanges = ranges;
    let updateHiddenAreas = false;
    const newHiddenAreas = [];
    let i2 = 0;
    let k = 0;
    let lastCollapsedStart = Number.MAX_VALUE;
    let lastCollapsedEnd = -1;
    for (; i2 < ranges.length; i2++) {
      if (!ranges.isCollapsed(i2)) {
        continue;
      }
      const startLineNumber = ranges.getStartLineNumber(i2) + 1;
      const endLineNumber = ranges.getEndLineNumber(i2);
      if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
        continue;
      }
      if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].start + 1 === startLineNumber && this._hiddenRanges[k].end + 1 === endLineNumber) {
        newHiddenAreas.push(this._hiddenRanges[k]);
        k++;
      } else {
        updateHiddenAreas = true;
        newHiddenAreas.push({ start: startLineNumber - 1, end: endLineNumber - 1 });
      }
      lastCollapsedStart = startLineNumber;
      lastCollapsedEnd = endLineNumber;
    }
    if (updateHiddenAreas || k < this._hiddenRanges.length) {
      this._hiddenRanges = newHiddenAreas;
      this._onDidFoldingStateChanged.fire();
    }
    this._viewCells.forEach((cell) => {
      if (cell.cellKind === 1 /* Markup */) {
        cell.triggerFoldingStateChange();
      }
    });
  }
  getHiddenRanges() {
    return this._hiddenRanges;
  }
  getOverviewRulerDecorations() {
    return Array.from(this._overviewRulerDecorations.values());
  }
  getCellByHandle(handle2) {
    return this._handleToViewCellMapping.get(handle2);
  }
  getCellIndexByHandle(handle2) {
    return this._viewCells.findIndex((cell) => cell.handle === handle2);
  }
  getCellIndex(cell) {
    return this._viewCells.indexOf(cell);
  }
  cellAt(index2) {
    return this._viewCells[index2];
  }
  getCellsInRange(range2) {
    if (!range2) {
      return this._viewCells.slice(0);
    }
    const validatedRange = this.validateRange(range2);
    if (validatedRange) {
      const result = [];
      for (let i2 = validatedRange.start; i2 < validatedRange.end; i2++) {
        result.push(this._viewCells[i2]);
      }
      return result;
    }
    return [];
  }
  /**
   * If this._viewCells[index] is visible then return index
   */
  getNearestVisibleCellIndexUpwards(index2) {
    for (let i2 = this._hiddenRanges.length - 1; i2 >= 0; i2--) {
      const cellRange = this._hiddenRanges[i2];
      const foldStart = cellRange.start - 1;
      const foldEnd = cellRange.end;
      if (foldStart > index2) {
        continue;
      }
      if (foldStart <= index2 && foldEnd >= index2) {
        return index2;
      }
      break;
    }
    return index2;
  }
  getNextVisibleCellIndex(index2) {
    for (let i2 = 0; i2 < this._hiddenRanges.length; i2++) {
      const cellRange = this._hiddenRanges[i2];
      const foldStart = cellRange.start - 1;
      const foldEnd = cellRange.end;
      if (foldEnd < index2) {
        continue;
      }
      if (foldStart <= index2) {
        return foldEnd + 1;
      }
      break;
    }
    return index2 + 1;
  }
  getPreviousVisibleCellIndex(index2) {
    for (let i2 = this._hiddenRanges.length - 1; i2 >= 0; i2--) {
      const cellRange = this._hiddenRanges[i2];
      const foldStart = cellRange.start - 1;
      const foldEnd = cellRange.end;
      if (foldEnd < index2) {
        return index2;
      }
      if (foldStart <= index2) {
        return foldStart;
      }
    }
    return index2;
  }
  hasCell(cell) {
    return this._handleToViewCellMapping.has(cell.handle);
  }
  getVersionId() {
    return this._notebook.versionId;
  }
  getAlternativeId() {
    return this._notebook.alternativeVersionId;
  }
  getTrackedRange(id2) {
    return this._getDecorationRange(id2);
  }
  _getDecorationRange(decorationId) {
    const node = this._decorations[decorationId];
    if (!node) {
      return null;
    }
    const versionId = this.getVersionId();
    if (node.cachedVersionId !== versionId) {
      this._decorationsTree.resolveNode(node, versionId);
    }
    if (node.range === null) {
      return { start: node.cachedAbsoluteStart - 1, end: node.cachedAbsoluteEnd - 1 };
    }
    return { start: node.range.startLineNumber - 1, end: node.range.endLineNumber - 1 };
  }
  setTrackedRange(id2, newRange, newStickiness) {
    const node = id2 ? this._decorations[id2] : null;
    if (!node) {
      if (!newRange) {
        return null;
      }
      return this._deltaCellDecorationsImpl(0, [], [{ range: new Range2(newRange.start + 1, 1, newRange.end + 1, 1), options: TRACKED_RANGE_OPTIONS2[newStickiness] }])[0];
    }
    if (!newRange) {
      this._decorationsTree.delete(node);
      delete this._decorations[node.id];
      return null;
    }
    this._decorationsTree.delete(node);
    node.reset(this.getVersionId(), newRange.start, newRange.end + 1, new Range2(newRange.start + 1, 1, newRange.end + 1, 1));
    node.setOptions(TRACKED_RANGE_OPTIONS2[newStickiness]);
    this._decorationsTree.insert(node);
    return node.id;
  }
  _deltaCellDecorationsImpl(ownerId2, oldDecorationsIds, newDecorations) {
    const versionId = this.getVersionId();
    const oldDecorationsLen = oldDecorationsIds.length;
    let oldDecorationIndex = 0;
    const newDecorationsLen = newDecorations.length;
    let newDecorationIndex = 0;
    const result = new Array(newDecorationsLen);
    while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
      let node = null;
      if (oldDecorationIndex < oldDecorationsLen) {
        do {
          node = this._decorations[oldDecorationsIds[oldDecorationIndex++]];
        } while (!node && oldDecorationIndex < oldDecorationsLen);
        if (node) {
          this._decorationsTree.delete(node);
        }
      }
      if (newDecorationIndex < newDecorationsLen) {
        if (!node) {
          const internalDecorationId = ++this._lastDecorationId;
          const decorationId = `${this._instanceId};${internalDecorationId}`;
          node = new IntervalNode(decorationId, 0, 0);
          this._decorations[decorationId] = node;
        }
        const newDecoration = newDecorations[newDecorationIndex];
        const range2 = newDecoration.range;
        const options3 = _normalizeOptions2(newDecoration.options);
        node.ownerId = ownerId2;
        node.reset(versionId, range2.startLineNumber, range2.endLineNumber, Range2.lift(range2));
        node.setOptions(options3);
        this._decorationsTree.insert(node);
        result[newDecorationIndex] = node.id;
        newDecorationIndex++;
      } else {
        if (node) {
          delete this._decorations[node.id];
        }
      }
    }
    return result;
  }
  deltaCellDecorations(oldDecorations, newDecorations) {
    oldDecorations.forEach((id2) => {
      const handle2 = this._decorationIdToCellMap.get(id2);
      if (handle2 !== void 0) {
        const cell = this.getCellByHandle(handle2);
        cell?.deltaCellDecorations([id2], []);
        this._decorationIdToCellMap.delete(id2);
      }
      this._overviewRulerDecorations.delete(id2);
    });
    const result = [];
    newDecorations.forEach((decoration3) => {
      if (isNotebookCellDecoration(decoration3)) {
        const cell = this.getCellByHandle(decoration3.handle);
        const ret = cell?.deltaCellDecorations([], [decoration3.options]) || [];
        ret.forEach((id2) => {
          this._decorationIdToCellMap.set(id2, decoration3.handle);
        });
        result.push(...ret);
      } else {
        const id2 = ++this._lastOverviewRulerDecorationId;
        const decorationId = `_overview_${this.id};${id2}`;
        this._overviewRulerDecorations.set(decorationId, decoration3);
        result.push(decorationId);
      }
    });
    return result;
  }
  deltaCellStatusBarItems(oldItems, newItems) {
    const deletesByHandle = groupBy(oldItems, (id2) => this._statusBarItemIdToCellMap.get(id2) ?? -1);
    const result = [];
    newItems.forEach((itemDelta) => {
      const cell = this.getCellByHandle(itemDelta.handle);
      const deleted = deletesByHandle[itemDelta.handle] ?? [];
      delete deletesByHandle[itemDelta.handle];
      deleted.forEach((id2) => this._statusBarItemIdToCellMap.delete(id2));
      const ret = cell?.deltaCellStatusBarItems(deleted, itemDelta.items) || [];
      ret.forEach((id2) => {
        this._statusBarItemIdToCellMap.set(id2, itemDelta.handle);
      });
      result.push(...ret);
    });
    for (const _handle in deletesByHandle) {
      const handle2 = parseInt(_handle);
      const ids = deletesByHandle[handle2];
      const cell = this.getCellByHandle(handle2);
      cell?.deltaCellStatusBarItems(ids, []);
      ids.forEach((id2) => this._statusBarItemIdToCellMap.delete(id2));
    }
    return result;
  }
  nearestCodeCellIndex(index2) {
    const nearest = this.viewCells.slice(0, index2).reverse().findIndex((cell) => cell.cellKind === 2 /* Code */);
    if (nearest > -1) {
      return index2 - nearest - 1;
    } else {
      const nearestCellTheOtherDirection = this.viewCells.slice(index2 + 1).findIndex((cell) => cell.cellKind === 2 /* Code */);
      if (nearestCellTheOtherDirection > -1) {
        return index2 + 1 + nearestCellTheOtherDirection;
      }
      return -1;
    }
  }
  getEditorViewState() {
    const editingCells = {};
    const collapsedInputCells = {};
    const collapsedOutputCells = {};
    const cellLineNumberStates = {};
    this._viewCells.forEach((cell, i2) => {
      if (cell.getEditState() === 1 /* Editing */) {
        editingCells[i2] = true;
      }
      if (cell.isInputCollapsed) {
        collapsedInputCells[i2] = true;
      }
      if (cell instanceof CodeCellViewModel && cell.isOutputCollapsed) {
        collapsedOutputCells[i2] = true;
      }
      if (cell.lineNumbers !== "inherit") {
        cellLineNumberStates[i2] = cell.lineNumbers;
      }
    });
    const editorViewStates = {};
    this._viewCells.map((cell) => ({ handle: cell.model.handle, state: cell.saveEditorViewState() })).forEach((viewState, i2) => {
      if (viewState.state) {
        editorViewStates[i2] = viewState.state;
      }
    });
    return {
      editingCells,
      editorViewStates,
      cellLineNumberStates,
      collapsedInputCells,
      collapsedOutputCells
    };
  }
  restoreEditorViewState(viewState) {
    if (!viewState) {
      return;
    }
    this._viewCells.forEach((cell, index2) => {
      const isEditing = viewState.editingCells && viewState.editingCells[index2];
      const editorViewState = viewState.editorViewStates && viewState.editorViewStates[index2];
      cell.updateEditState(isEditing ? 1 /* Editing */ : 0 /* Preview */, "viewState");
      const cellHeight = viewState.cellTotalHeights ? viewState.cellTotalHeights[index2] : void 0;
      cell.restoreEditorViewState(editorViewState, cellHeight);
      if (viewState.collapsedInputCells && viewState.collapsedInputCells[index2]) {
        cell.isInputCollapsed = true;
      }
      if (viewState.collapsedOutputCells && viewState.collapsedOutputCells[index2] && cell instanceof CodeCellViewModel) {
        cell.isOutputCollapsed = true;
      }
      if (viewState.cellLineNumberStates && viewState.cellLineNumberStates[index2]) {
        cell.lineNumbers = viewState.cellLineNumberStates[index2];
      }
    });
  }
  /**
   * Editor decorations across cells. For example, find decorations for multiple code cells
   * The reason that we can't completely delegate this to CodeEditorWidget is most of the time, the editors for cells are not created yet but we already have decorations for them.
   */
  changeModelDecorations(callback) {
    const changeAccessor = {
      deltaDecorations: (oldDecorations, newDecorations) => {
        return this._deltaModelDecorationsImpl(oldDecorations, newDecorations);
      }
    };
    let result = null;
    try {
      result = callback(changeAccessor);
    } catch (e) {
      onUnexpectedError(e);
    }
    changeAccessor.deltaDecorations = invalidFunc4;
    return result;
  }
  _deltaModelDecorationsImpl(oldDecorations, newDecorations) {
    const mapping2 = /* @__PURE__ */ new Map();
    oldDecorations.forEach((oldDecoration) => {
      const ownerId2 = oldDecoration.ownerId;
      if (!mapping2.has(ownerId2)) {
        const cell = this._viewCells.find((cell2) => cell2.handle === ownerId2);
        if (cell) {
          mapping2.set(ownerId2, { cell, oldDecorations: [], newDecorations: [] });
        }
      }
      const data = mapping2.get(ownerId2);
      if (data) {
        data.oldDecorations = oldDecoration.decorations;
      }
    });
    newDecorations.forEach((newDecoration) => {
      const ownerId2 = newDecoration.ownerId;
      if (!mapping2.has(ownerId2)) {
        const cell = this._viewCells.find((cell2) => cell2.handle === ownerId2);
        if (cell) {
          mapping2.set(ownerId2, { cell, oldDecorations: [], newDecorations: [] });
        }
      }
      const data = mapping2.get(ownerId2);
      if (data) {
        data.newDecorations = newDecoration.decorations;
      }
    });
    const ret = [];
    mapping2.forEach((value2, ownerId2) => {
      const cellRet = value2.cell.deltaModelDecorations(value2.oldDecorations, value2.newDecorations);
      ret.push({
        ownerId: ownerId2,
        decorations: cellRet
      });
    });
    return ret;
  }
  //#region Find
  find(value2, options3) {
    const matches2 = [];
    let findCells = [];
    if (options3.findScope && (options3.findScope.findScopeType === "cells" /* Cells */ || options3.findScope.findScopeType === "text" /* Text */)) {
      const selectedRanges = options3.findScope.selectedCellRanges?.map((range2) => this.validateRange(range2)).filter((range2) => !!range2) ?? [];
      const selectedIndexes = cellRangesToIndexes(selectedRanges);
      findCells = selectedIndexes.map((index2) => this._viewCells[index2]);
    } else {
      findCells = this._viewCells;
    }
    findCells.forEach((cell, index2) => {
      const cellMatches = cell.startFind(value2, options3);
      if (cellMatches) {
        matches2.push(new CellFindMatchModel(
          cellMatches.cell,
          index2,
          cellMatches.contentMatches,
          []
        ));
      }
    });
    return matches2.filter(
      (match2) => {
        if (match2.cell.cellKind === 2 /* Code */) {
          return options3.includeCodeInput;
        }
        if (match2.cell.getEditState() === 1 /* Editing */) {
          return options3.includeMarkupInput;
        } else {
          return !options3.includeMarkupPreview && options3.includeMarkupInput;
        }
      }
    );
  }
  replaceOne(cell, range2, text2) {
    const viewCell = cell;
    this._lastNotebookEditResource.push(viewCell.uri);
    return viewCell.resolveTextModel().then(() => {
      this._bulkEditService.apply(
        [new ResourceTextEdit(cell.uri, { range: range2, text: text2 })],
        { quotableLabel: "Notebook Replace" }
      );
    });
  }
  async replaceAll(matches2, texts) {
    if (!matches2.length) {
      return;
    }
    const textEdits = [];
    this._lastNotebookEditResource.push(matches2[0].cell.uri);
    matches2.forEach((match2) => {
      match2.contentMatches.forEach((singleMatch, index2) => {
        textEdits.push({
          versionId: void 0,
          textEdit: { range: singleMatch.range, text: texts[index2] },
          resource: match2.cell.uri
        });
      });
    });
    return Promise.all(matches2.map((match2) => {
      return match2.cell.resolveTextModel();
    })).then(async () => {
      this._bulkEditService.apply({ edits: textEdits }, { quotableLabel: "Notebook Replace All" });
      return;
    });
  }
  //#endregion
  //#region Undo/Redo
  async _withElement(element, callback) {
    const viewCells = this._viewCells.filter((cell) => element.matchesResource(cell.uri));
    const refs = await Promise.all(viewCells.map((cell) => this._textModelService.createModelReference(cell.uri)));
    await callback();
    refs.forEach((ref) => ref.dispose());
  }
  async undo() {
    const editStack = this._undoService.getElements(this.uri);
    const element = editStack.past.length ? editStack.past[editStack.past.length - 1] : void 0;
    if (element && element instanceof SingleModelEditStackElement || element instanceof MultiModelEditStackElement) {
      await this._withElement(element, async () => {
        await this._undoService.undo(this.uri);
      });
      return element instanceof SingleModelEditStackElement ? [element.resource] : element.resources;
    }
    await this._undoService.undo(this.uri);
    return [];
  }
  async redo() {
    const editStack = this._undoService.getElements(this.uri);
    const element = editStack.future[0];
    if (element && element instanceof SingleModelEditStackElement || element instanceof MultiModelEditStackElement) {
      await this._withElement(element, async () => {
        await this._undoService.redo(this.uri);
      });
      return element instanceof SingleModelEditStackElement ? [element.resource] : element.resources;
    }
    await this._undoService.redo(this.uri);
    return [];
  }
  //#endregion
  equal(notebook) {
    return this._notebook === notebook;
  }
  dispose() {
    this._localStore.clear();
    this._viewCells.forEach((cell) => {
      cell.dispose();
    });
    super.dispose();
  }
};

NotebookViewModel = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IBulkEditService),
  __decorateParam(7, IUndoRedoService),
  __decorateParam(8, ITextModelService),
  __decorateParam(9, INotebookExecutionStateService)
], NotebookViewModel);

function createCellViewModel(instantiationService, notebookViewModel, cell, viewContext) {
  if (cell.cellKind === 2 /* Code */) {
    return instantiationService.createInstance(CodeCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, viewContext);
  } else {
    return instantiationService.createInstance(MarkupCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, notebookViewModel, viewContext);
  }
}
export { _normalizeOptions2, createCellViewModel, invalidFunc4, DecorationsTree, TRACKED_RANGE_OPTIONS2, MODEL_ID3, NotebookViewModel };
