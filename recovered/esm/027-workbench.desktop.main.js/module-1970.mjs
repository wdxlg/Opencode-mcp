// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/diffElementViewModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DIFF_CELL_MARGIN } from "./module-1968.mjs";
import { NotebookDocumentMetadataTextModel } from "./module-1969.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { DiffNestedCellViewModel } from "./module-1966.mjs";
import { getEditorPadding } from "./module-1965.mjs";
import { hash } from "./module-0039.mjs";
import { getFormattedMetadataJSON } from "./module-1883.mjs";
import { CellUri } from "./module-0909.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/diffElementViewModel.ts
var PropertyHeaderHeight = 25;

var HeightOfHiddenLinesRegionInDiffEditor = 24;

var DefaultLineHeight = 17;

var OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;

var DiffElementViewModelBase = class extends Disposable {
  constructor(mainDocumentTextModel, editorEventDispatcher, initData) {
    super();
    this.mainDocumentTextModel = mainDocumentTextModel;
    this.editorEventDispatcher = editorEventDispatcher;
    this.initData = initData;
    this._layoutInfoEmitter = this._register(new Emitter());
    this.onDidLayoutChange = this._layoutInfoEmitter.event;
    this._register(this.editorEventDispatcher.onDidChangeLayout((e) => this._layoutInfoEmitter.fire({ outerWidth: true })));
  }
};

var DiffElementPlaceholderViewModel = class extends DiffElementViewModelBase {
  constructor(mainDocumentTextModel, editorEventDispatcher, initData) {
    super(mainDocumentTextModel, editorEventDispatcher, initData);
    this.type = "placeholder";
    this.hiddenCells = [];
    this._unfoldHiddenCells = this._register(new Emitter());
    this.onUnfoldHiddenCells = this._unfoldHiddenCells.event;
    this.renderOutput = false;
  }
  get totalHeight() {
    return 24 + 2 * DIFF_CELL_MARGIN;
  }
  getHeight(_) {
    return this.totalHeight;
  }
  layoutChange() {
  }
  showHiddenCells() {
    this._unfoldHiddenCells.fire();
  }
};

var NotebookDocumentMetadataViewModel = class extends DiffElementViewModelBase {
  constructor(originalDocumentTextModel, modifiedDocumentTextModel, type, editorEventDispatcher, initData, notebookService, editorHeightCalculator) {
    super(originalDocumentTextModel, editorEventDispatcher, initData);
    this.originalDocumentTextModel = originalDocumentTextModel;
    this.modifiedDocumentTextModel = modifiedDocumentTextModel;
    this.type = type;
    this.editorHeightCalculator = editorHeightCalculator;
    this.renderOutput = false;
    this._sourceEditorViewState = null;
    const cellStatusHeight = PropertyHeaderHeight;
    this._layoutInfo = {
      width: 0,
      editorHeight: 0,
      editorMargin: 0,
      metadataHeight: 0,
      cellStatusHeight,
      metadataStatusHeight: 0,
      rawOutputHeight: 0,
      outputTotalHeight: 0,
      outputStatusHeight: 0,
      outputMetadataHeight: 0,
      bodyMargin: 32,
      totalHeight: 82 + cellStatusHeight + 0,
      layoutState: 0 /* Uninitialized */
    };
    this.cellFoldingState = type === "modifiedMetadata" ? 0 /* Expanded */ : 1 /* Collapsed */;
    this.originalMetadata = this._register(new NotebookDocumentMetadataTextModel(originalDocumentTextModel));
    this.modifiedMetadata = this._register(new NotebookDocumentMetadataTextModel(modifiedDocumentTextModel));
  }
  set editorHeight(height) {
    this._layout({ editorHeight: height });
  }
  get editorHeight() {
    throw new Error("Use Cell.layoutInfo.editorHeight");
  }
  set editorMargin(margin) {
    this._layout({ editorMargin: margin });
  }
  get editorMargin() {
    throw new Error("Use Cell.layoutInfo.editorMargin");
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  get totalHeight() {
    return this.layoutInfo.totalHeight;
  }
  async computeHeights() {
    if (this.type === "unchangedMetadata") {
      this.editorHeight = this.editorHeightCalculator.computeHeightFromLines(this.originalMetadata.textBuffer.getLineCount());
    } else {
      const original = this.originalMetadata.uri;
      const modified = this.modifiedMetadata.uri;
      this.editorHeight = await this.editorHeightCalculator.diffAndComputeHeight(original, modified);
    }
  }
  layoutChange() {
    this._layout({ recomputeOutput: true });
  }
  _layout(delta2) {
    const width2 = delta2.width !== void 0 ? delta2.width : this._layoutInfo.width;
    const editorHeight = delta2.editorHeight !== void 0 ? delta2.editorHeight : this._layoutInfo.editorHeight;
    const editorMargin = delta2.editorMargin !== void 0 ? delta2.editorMargin : this._layoutInfo.editorMargin;
    const cellStatusHeight = delta2.cellStatusHeight !== void 0 ? delta2.cellStatusHeight : this._layoutInfo.cellStatusHeight;
    const bodyMargin = delta2.bodyMargin !== void 0 ? delta2.bodyMargin : this._layoutInfo.bodyMargin;
    const totalHeight = editorHeight + editorMargin + cellStatusHeight + bodyMargin;
    const newLayout = {
      width: width2,
      editorHeight,
      editorMargin,
      metadataHeight: 0,
      cellStatusHeight,
      metadataStatusHeight: 0,
      outputTotalHeight: 0,
      outputStatusHeight: 0,
      bodyMargin,
      rawOutputHeight: 0,
      outputMetadataHeight: 0,
      totalHeight,
      layoutState: 3 /* Measured */
    };
    let somethingChanged = false;
    const changeEvent = {};
    if (newLayout.width !== this._layoutInfo.width) {
      changeEvent.width = true;
      somethingChanged = true;
    }
    if (newLayout.editorHeight !== this._layoutInfo.editorHeight) {
      changeEvent.editorHeight = true;
      somethingChanged = true;
    }
    if (newLayout.editorMargin !== this._layoutInfo.editorMargin) {
      changeEvent.editorMargin = true;
      somethingChanged = true;
    }
    if (newLayout.cellStatusHeight !== this._layoutInfo.cellStatusHeight) {
      changeEvent.cellStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.bodyMargin !== this._layoutInfo.bodyMargin) {
      changeEvent.bodyMargin = true;
      somethingChanged = true;
    }
    if (newLayout.totalHeight !== this._layoutInfo.totalHeight) {
      changeEvent.totalHeight = true;
      somethingChanged = true;
    }
    if (somethingChanged) {
      this._layoutInfo = newLayout;
      this._fireLayoutChangeEvent(changeEvent);
    }
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === 0 /* Uninitialized */) {
      const editorHeight = this.cellFoldingState === 1 /* Collapsed */ ? 0 : this.computeInputEditorHeight(lineHeight);
      return this._computeTotalHeight(editorHeight);
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  _computeTotalHeight(editorHeight) {
    const totalHeight = editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputTotalHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.outputMetadataHeight + this._layoutInfo.bodyMargin;
    return totalHeight;
  }
  computeInputEditorHeight(_lineHeight) {
    return this.editorHeightCalculator.computeHeightFromLines(Math.max(this.originalMetadata.textBuffer.getLineCount(), this.modifiedMetadata.textBuffer.getLineCount()));
  }
  _fireLayoutChangeEvent(state) {
    this._layoutInfoEmitter.fire(state);
    this.editorEventDispatcher.emit([{ type: 2 /* CellLayoutChanged */, source: this._layoutInfo }]);
  }
  getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
    if (fullWidth) {
      return layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
    }
    return (layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
  }
  getSourceEditorViewState() {
    return this._sourceEditorViewState;
  }
  saveSpirceEditorViewState(viewState) {
    this._sourceEditorViewState = viewState;
  }
};

var DiffElementCellViewModelBase = class extends DiffElementViewModelBase {
  constructor(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index2, configurationService, diffEditorHeightCalculator) {
    super(mainDocumentTextModel, editorEventDispatcher, initData);
    this.type = type;
    this.index = index2;
    this.configurationService = configurationService;
    this.diffEditorHeightCalculator = diffEditorHeightCalculator;
    this._stateChangeEmitter = this._register(new Emitter());
    this.onDidStateChange = this._stateChangeEmitter.event;
    this._hideUnchangedCells = this._register(new Emitter());
    this.onHideUnchangedCells = this._hideUnchangedCells.event;
    this._renderOutput = true;
    this._sourceEditorViewState = null;
    this._outputEditorViewState = null;
    this._metadataEditorViewState = null;
    this.original = original ? this._register(new DiffNestedCellViewModel(original, notebookService)) : void 0;
    this.modified = modified ? this._register(new DiffNestedCellViewModel(modified, notebookService)) : void 0;
    const editorHeight = this._estimateEditorHeight(initData.fontInfo);
    const cellStatusHeight = PropertyHeaderHeight;
    this._layoutInfo = {
      width: 0,
      editorHeight,
      editorMargin: 0,
      metadataHeight: 0,
      cellStatusHeight,
      metadataStatusHeight: this.ignoreMetadata ? 0 : PropertyHeaderHeight,
      rawOutputHeight: 0,
      outputTotalHeight: 0,
      outputStatusHeight: this.ignoreOutputs ? 0 : PropertyHeaderHeight,
      outputMetadataHeight: 0,
      bodyMargin: 32,
      totalHeight: 82 + cellStatusHeight + editorHeight,
      layoutState: 0 /* Uninitialized */
    };
    this.cellFoldingState = modified?.getTextBufferHash() !== original?.getTextBufferHash() ? 0 /* Expanded */ : 1 /* Collapsed */;
    this.metadataFoldingState = 1 /* Collapsed */;
    this.outputFoldingState = 1 /* Collapsed */;
  }
  hideUnchangedCells() {
    this._hideUnchangedCells.fire();
  }
  set rawOutputHeight(height) {
    this._layout({ rawOutputHeight: Math.min(OUTPUT_EDITOR_HEIGHT_MAGIC, height) });
  }
  get rawOutputHeight() {
    throw new Error("Use Cell.layoutInfo.rawOutputHeight");
  }
  set outputStatusHeight(height) {
    this._layout({ outputStatusHeight: height });
  }
  get outputStatusHeight() {
    throw new Error("Use Cell.layoutInfo.outputStatusHeight");
  }
  set outputMetadataHeight(height) {
    this._layout({ outputMetadataHeight: height });
  }
  get outputMetadataHeight() {
    throw new Error("Use Cell.layoutInfo.outputStatusHeight");
  }
  set editorHeight(height) {
    this._layout({ editorHeight: height });
  }
  get editorHeight() {
    throw new Error("Use Cell.layoutInfo.editorHeight");
  }
  set editorMargin(margin) {
    this._layout({ editorMargin: margin });
  }
  get editorMargin() {
    throw new Error("Use Cell.layoutInfo.editorMargin");
  }
  set metadataStatusHeight(height) {
    this._layout({ metadataStatusHeight: height });
  }
  get metadataStatusHeight() {
    throw new Error("Use Cell.layoutInfo.outputStatusHeight");
  }
  set metadataHeight(height) {
    this._layout({ metadataHeight: height });
  }
  get metadataHeight() {
    throw new Error("Use Cell.layoutInfo.metadataHeight");
  }
  set renderOutput(value2) {
    this._renderOutput = value2;
    this._layout({ recomputeOutput: true });
    this._stateChangeEmitter.fire({ renderOutput: this._renderOutput });
  }
  get renderOutput() {
    return this._renderOutput;
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  get totalHeight() {
    return this.layoutInfo.totalHeight;
  }
  get ignoreOutputs() {
    return this.configurationService.getValue("notebook.diff.ignoreOutputs") || !!this.mainDocumentTextModel?.transientOptions.transientOutputs;
  }
  get ignoreMetadata() {
    return this.configurationService.getValue("notebook.diff.ignoreMetadata");
  }
  layoutChange() {
    this._layout({ recomputeOutput: true });
  }
  _estimateEditorHeight(fontInfo) {
    const lineHeight = fontInfo?.lineHeight ?? 17;
    switch (this.type) {
      case "unchanged":
      case "insert": {
        const lineCount = this.modified.textModel.textBuffer.getLineCount();
        const editorHeight = lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
        return editorHeight;
      }
      case "delete":
      case "modified": {
        const lineCount = this.original.textModel.textBuffer.getLineCount();
        const editorHeight = lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
        return editorHeight;
      }
    }
  }
  _layout(delta2) {
    const width2 = delta2.width !== void 0 ? delta2.width : this._layoutInfo.width;
    const editorHeight = delta2.editorHeight !== void 0 ? delta2.editorHeight : this._layoutInfo.editorHeight;
    const editorMargin = delta2.editorMargin !== void 0 ? delta2.editorMargin : this._layoutInfo.editorMargin;
    const metadataHeight = delta2.metadataHeight !== void 0 ? delta2.metadataHeight : this._layoutInfo.metadataHeight;
    const cellStatusHeight = delta2.cellStatusHeight !== void 0 ? delta2.cellStatusHeight : this._layoutInfo.cellStatusHeight;
    const metadataStatusHeight = delta2.metadataStatusHeight !== void 0 ? delta2.metadataStatusHeight : this._layoutInfo.metadataStatusHeight;
    const rawOutputHeight = delta2.rawOutputHeight !== void 0 ? delta2.rawOutputHeight : this._layoutInfo.rawOutputHeight;
    const outputStatusHeight = delta2.outputStatusHeight !== void 0 ? delta2.outputStatusHeight : this._layoutInfo.outputStatusHeight;
    const bodyMargin = delta2.bodyMargin !== void 0 ? delta2.bodyMargin : this._layoutInfo.bodyMargin;
    const outputMetadataHeight = delta2.outputMetadataHeight !== void 0 ? delta2.outputMetadataHeight : this._layoutInfo.outputMetadataHeight;
    const outputHeight = this.ignoreOutputs ? 0 : delta2.recomputeOutput || delta2.rawOutputHeight !== void 0 || delta2.outputMetadataHeight !== void 0 ? this._getOutputTotalHeight(rawOutputHeight, outputMetadataHeight) : this._layoutInfo.outputTotalHeight;
    const totalHeight = editorHeight + editorMargin + cellStatusHeight + metadataHeight + metadataStatusHeight + outputHeight + outputStatusHeight + bodyMargin;
    const newLayout = {
      width: width2,
      editorHeight,
      editorMargin,
      metadataHeight,
      cellStatusHeight,
      metadataStatusHeight,
      outputTotalHeight: outputHeight,
      outputStatusHeight,
      bodyMargin,
      rawOutputHeight,
      outputMetadataHeight,
      totalHeight,
      layoutState: 3 /* Measured */
    };
    let somethingChanged = false;
    const changeEvent = {};
    if (newLayout.width !== this._layoutInfo.width) {
      changeEvent.width = true;
      somethingChanged = true;
    }
    if (newLayout.editorHeight !== this._layoutInfo.editorHeight) {
      changeEvent.editorHeight = true;
      somethingChanged = true;
    }
    if (newLayout.editorMargin !== this._layoutInfo.editorMargin) {
      changeEvent.editorMargin = true;
      somethingChanged = true;
    }
    if (newLayout.metadataHeight !== this._layoutInfo.metadataHeight) {
      changeEvent.metadataHeight = true;
      somethingChanged = true;
    }
    if (newLayout.cellStatusHeight !== this._layoutInfo.cellStatusHeight) {
      changeEvent.cellStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.metadataStatusHeight !== this._layoutInfo.metadataStatusHeight) {
      changeEvent.metadataStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.outputTotalHeight !== this._layoutInfo.outputTotalHeight) {
      changeEvent.outputTotalHeight = true;
      somethingChanged = true;
    }
    if (newLayout.outputStatusHeight !== this._layoutInfo.outputStatusHeight) {
      changeEvent.outputStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.bodyMargin !== this._layoutInfo.bodyMargin) {
      changeEvent.bodyMargin = true;
      somethingChanged = true;
    }
    if (newLayout.outputMetadataHeight !== this._layoutInfo.outputMetadataHeight) {
      changeEvent.outputMetadataHeight = true;
      somethingChanged = true;
    }
    if (newLayout.totalHeight !== this._layoutInfo.totalHeight) {
      changeEvent.totalHeight = true;
      somethingChanged = true;
    }
    if (somethingChanged) {
      this._layoutInfo = newLayout;
      this._fireLayoutChangeEvent(changeEvent);
    }
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === 0 /* Uninitialized */) {
      const editorHeight = this.cellFoldingState === 1 /* Collapsed */ ? 0 : this.computeInputEditorHeight(lineHeight);
      return this._computeTotalHeight(editorHeight);
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  _computeTotalHeight(editorHeight) {
    const totalHeight = editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputTotalHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.outputMetadataHeight + this._layoutInfo.bodyMargin;
    return totalHeight;
  }
  computeInputEditorHeight(lineHeight) {
    const lineCount = Math.max(this.original?.textModel.textBuffer.getLineCount() ?? 1, this.modified?.textModel.textBuffer.getLineCount() ?? 1);
    return this.diffEditorHeightCalculator.computeHeightFromLines(lineCount);
  }
  _getOutputTotalHeight(rawOutputHeight, metadataHeight) {
    if (this.outputFoldingState === 1 /* Collapsed */) {
      return 0;
    }
    if (this.renderOutput) {
      if (this.isOutputEmpty()) {
        return 24;
      }
      return this.getRichOutputTotalHeight() + metadataHeight;
    } else {
      return rawOutputHeight;
    }
  }
  _fireLayoutChangeEvent(state) {
    this._layoutInfoEmitter.fire(state);
    this.editorEventDispatcher.emit([{ type: 2 /* CellLayoutChanged */, source: this._layoutInfo }]);
  }
  getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
    if (fullWidth) {
      return layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
    }
    return (layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
  }
  getOutputEditorViewState() {
    return this._outputEditorViewState;
  }
  saveOutputEditorViewState(viewState) {
    this._outputEditorViewState = viewState;
  }
  getMetadataEditorViewState() {
    return this._metadataEditorViewState;
  }
  saveMetadataEditorViewState(viewState) {
    this._metadataEditorViewState = viewState;
  }
  getSourceEditorViewState() {
    return this._sourceEditorViewState;
  }
  saveSpirceEditorViewState(viewState) {
    this._sourceEditorViewState = viewState;
  }
};

var SideBySideDiffElementViewModel = class extends DiffElementCellViewModelBase {
  constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, configurationService, index2, diffEditorHeightCalculator) {
    super(
      mainDocumentTextModel,
      original,
      modified,
      type,
      editorEventDispatcher,
      initData,
      notebookService,
      index2,
      configurationService,
      diffEditorHeightCalculator
    );
    this.otherDocumentTextModel = otherDocumentTextModel;
    this.type = type;
    this.cellFoldingState = this.modified.textModel.getValue() !== this.original.textModel.getValue() ? 0 /* Expanded */ : 1 /* Collapsed */;
    this.metadataFoldingState = 1 /* Collapsed */;
    this.outputFoldingState = 1 /* Collapsed */;
    if (this.checkMetadataIfModified()) {
      this.metadataFoldingState = 0 /* Expanded */;
    }
    if (this.checkIfOutputsModified()) {
      this.outputFoldingState = 0 /* Expanded */;
    }
    this._register(this.original.onDidChangeOutputLayout(() => {
      this._layout({ recomputeOutput: true });
    }));
    this._register(this.modified.onDidChangeOutputLayout(() => {
      this._layout({ recomputeOutput: true });
    }));
    this._register(this.modified.textModel.onDidChangeContent(() => {
      if (mainDocumentTextModel.transientOptions.cellContentMetadata) {
        const cellMetadataKeys = [...Object.keys(mainDocumentTextModel.transientOptions.cellContentMetadata)];
        const modifiedMedataRaw = Object.assign({}, this.modified.metadata);
        const originalCellMetadata = this.original.metadata;
        for (const key3 of cellMetadataKeys) {
          if (Object.hasOwn(originalCellMetadata, key3)) {
            modifiedMedataRaw[key3] = originalCellMetadata[key3];
          }
        }
        this.modified.textModel.metadata = modifiedMedataRaw;
      }
    }));
  }
  get originalDocument() {
    return this.otherDocumentTextModel;
  }
  get modifiedDocument() {
    return this.mainDocumentTextModel;
  }
  checkIfInputModified() {
    if (this.original.textModel.getTextBufferHash() === this.modified.textModel.getTextBufferHash()) {
      return false;
    }
    return {
      reason: "Cell content has changed"
    };
  }
  checkIfOutputsModified() {
    if (this.mainDocumentTextModel.transientOptions.transientOutputs || this.ignoreOutputs) {
      return false;
    }
    const ret = outputsEqual(this.original?.outputs ?? [], this.modified?.outputs ?? []);
    if (ret === 0 /* Unchanged */) {
      return false;
    }
    return {
      reason: ret === 1 /* Metadata */ ? "Output metadata has changed" : void 0,
      kind: ret
    };
  }
  checkMetadataIfModified() {
    if (this.ignoreMetadata) {
      return false;
    }
    const modified = hash(getFormattedMetadataJSON(this.mainDocumentTextModel.transientOptions.transientCellMetadata, this.original?.metadata || {}, this.original?.language)) !== hash(getFormattedMetadataJSON(this.mainDocumentTextModel.transientOptions.transientCellMetadata, this.modified?.metadata ?? {}, this.modified?.language));
    if (modified) {
      return { reason: void 0 };
    } else {
      return false;
    }
  }
  updateOutputHeight(diffSide, index2, height) {
    if (diffSide === 0 /* Original */) {
      this.original.updateOutputHeight(index2, height);
    } else {
      this.modified.updateOutputHeight(index2, height);
    }
  }
  getOutputOffsetInContainer(diffSide, index2) {
    if (diffSide === 0 /* Original */) {
      return this.original.getOutputOffset(index2);
    } else {
      return this.modified.getOutputOffset(index2);
    }
  }
  getOutputOffsetInCell(diffSide, index2) {
    const offsetInOutputsContainer = this.getOutputOffsetInContainer(diffSide, index2);
    return this._layoutInfo.editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.bodyMargin / 2 + offsetInOutputsContainer;
  }
  isOutputEmpty() {
    if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
      return true;
    }
    if (this.checkIfOutputsModified()) {
      return false;
    }
    return (this.original?.outputs || []).length === 0;
  }
  getRichOutputTotalHeight() {
    return Math.max(this.original.getOutputTotalHeight(), this.modified.getOutputTotalHeight());
  }
  getNestedCellViewModel(diffSide) {
    return diffSide === 0 /* Original */ ? this.original : this.modified;
  }
  getCellByUri(cellUri) {
    if (cellUri.toString() === this.original.uri.toString()) {
      return this.original;
    } else {
      return this.modified;
    }
  }
  computeInputEditorHeight(lineHeight) {
    if (this.type === "modified" && typeof this.editorHeightWithUnchangedLinesCollapsed === "number" && this.checkIfInputModified()) {
      return this.editorHeightWithUnchangedLinesCollapsed;
    }
    return super.computeInputEditorHeight(lineHeight);
  }
  async computeModifiedInputEditorHeight() {
    if (this.checkIfInputModified()) {
      this.editorHeightWithUnchangedLinesCollapsed = this._layoutInfo.editorHeight = await this.diffEditorHeightCalculator.diffAndComputeHeight(this.original.uri, this.modified.uri);
    }
  }
  async computeModifiedMetadataEditorHeight() {
    if (this.checkMetadataIfModified()) {
      const originalMetadataUri = CellUri.generateCellPropertyUri(this.originalDocument.uri, this.original.handle, Schemas.vscodeNotebookCellMetadata);
      const modifiedMetadataUri = CellUri.generateCellPropertyUri(this.modifiedDocument.uri, this.modified.handle, Schemas.vscodeNotebookCellMetadata);
      this._layoutInfo.metadataHeight = await this.diffEditorHeightCalculator.diffAndComputeHeight(originalMetadataUri, modifiedMetadataUri);
    }
  }
  async computeEditorHeights() {
    if (this.type === "unchanged") {
      return;
    }
    await Promise.all([this.computeModifiedInputEditorHeight(), this.computeModifiedMetadataEditorHeight()]);
  }
};

var SingleSideDiffElementViewModel = class extends DiffElementCellViewModelBase {
  constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, configurationService, diffEditorHeightCalculator, index2) {
    super(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index2, configurationService, diffEditorHeightCalculator);
    this.otherDocumentTextModel = otherDocumentTextModel;
    this.type = type;
    this._register(this.cellViewModel.onDidChangeOutputLayout(() => {
      this._layout({ recomputeOutput: true });
    }));
  }
  get cellViewModel() {
    return this.type === "insert" ? this.modified : this.original;
  }
  get originalDocument() {
    if (this.type === "insert") {
      return this.otherDocumentTextModel;
    } else {
      return this.mainDocumentTextModel;
    }
  }
  get modifiedDocument() {
    if (this.type === "insert") {
      return this.mainDocumentTextModel;
    } else {
      return this.otherDocumentTextModel;
    }
  }
  checkIfInputModified() {
    return {
      reason: "Cell content has changed"
    };
  }
  getNestedCellViewModel(diffSide) {
    return this.type === "insert" ? this.modified : this.original;
  }
  checkIfOutputsModified() {
    return false;
  }
  checkMetadataIfModified() {
    return false;
  }
  updateOutputHeight(diffSide, index2, height) {
    this.cellViewModel?.updateOutputHeight(index2, height);
  }
  getOutputOffsetInContainer(diffSide, index2) {
    return this.cellViewModel.getOutputOffset(index2);
  }
  getOutputOffsetInCell(diffSide, index2) {
    const offsetInOutputsContainer = this.cellViewModel.getOutputOffset(index2);
    return this._layoutInfo.editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.bodyMargin / 2 + offsetInOutputsContainer;
  }
  isOutputEmpty() {
    if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
      return true;
    }
    return (this.original?.outputs || this.modified?.outputs || []).length === 0;
  }
  getRichOutputTotalHeight() {
    return this.cellViewModel?.getOutputTotalHeight() ?? 0;
  }
  getCellByUri(cellUri) {
    return this.cellViewModel;
  }
};

function outputEqual(a, b) {
  if (hash(a.metadata) === hash(b.metadata)) {
    return 2 /* Other */;
  }
  for (let j = 0; j < a.outputs.length; j++) {
    const aOutputItem = a.outputs[j];
    const bOutputItem = b.outputs[j];
    if (aOutputItem.mime !== bOutputItem.mime) {
      return 2 /* Other */;
    }
    if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
      return 2 /* Other */;
    }
    for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
      if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
        return 2 /* Other */;
      }
    }
  }
  return 1 /* Metadata */;
}

function outputsEqual(original, modified) {
  if (original.length !== modified.length) {
    return 2 /* Other */;
  }
  const len = original.length;
  for (let i2 = 0; i2 < len; i2++) {
    const a = original[i2];
    const b = modified[i2];
    if (hash(a.metadata) !== hash(b.metadata)) {
      return 1 /* Metadata */;
    }
    if (a.outputs.length !== b.outputs.length) {
      return 2 /* Other */;
    }
    for (let j = 0; j < a.outputs.length; j++) {
      const aOutputItem = a.outputs[j];
      const bOutputItem = b.outputs[j];
      if (aOutputItem.mime !== bOutputItem.mime) {
        return 2 /* Other */;
      }
      if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
        return 2 /* Other */;
      }
      for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
        if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
          return 2 /* Other */;
        }
      }
    }
  }
  return 0 /* Unchanged */;
}

function getStreamOutputData(outputs) {
  if (!outputs.length) {
    return null;
  }
  const first2 = outputs[0];
  const mime = first2.mime;
  const sameStream = !outputs.find((op) => op.mime !== mime);
  if (sameStream) {
    return outputs.map((opit) => opit.data.toString()).join("");
  } else {
    return null;
  }
}

function getFormattedOutputJSON(outputs) {
  if (outputs.length === 1) {
    const streamOutputData = getStreamOutputData(outputs[0].outputs);
    if (streamOutputData) {
      return streamOutputData;
    }
  }
  return JSON.stringify(outputs.map((output) => {
    return {
      metadata: output.metadata,
      outputItems: output.outputs.map((opit) => ({
        mimeType: opit.mime,
        data: opit.data.toString()
      }))
    };
  }), void 0, "	");
}
export { outputEqual, outputsEqual, getStreamOutputData, getFormattedOutputJSON, PropertyHeaderHeight, HeightOfHiddenLinesRegionInDiffEditor, DefaultLineHeight, OUTPUT_EDITOR_HEIGHT_MAGIC, DiffElementViewModelBase, DiffElementPlaceholderViewModel, NotebookDocumentMetadataViewModel, DiffElementCellViewModelBase, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel };
