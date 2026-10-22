// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel.ts
import { BaseCellViewModel } from "./module-1898.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Emitter, PauseableEmitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { CellOutputViewModel } from "./module-1897.mjs";
import { dispose } from "./module-0012.mjs";
import { PrefixSumComputer } from "./module-0200.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookService } from "./module-0926.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel.ts
var outputDisplayLimit = 500;

var CodeCellViewModel = class extends BaseCellViewModel {
  constructor(viewType, model, initialNotebookLayoutInfo, viewContext, configurationService, _notebookService, modelService, undoRedoService, codeEditorService, inlineChatSessionService) {
    super(viewType, model, generateUuid(), viewContext, configurationService, modelService, undoRedoService, codeEditorService, inlineChatSessionService);
    this.viewContext = viewContext;
    this._notebookService = _notebookService;
    this.cellKind = 2 /* Code */;
    this._onLayoutInfoRead = this._register(new Emitter());
    this.onLayoutInfoRead = this._onLayoutInfoRead.event;
    this._onDidStartExecution = this._register(new Emitter());
    this.onDidStartExecution = this._onDidStartExecution.event;
    this._onDidStopExecution = this._register(new Emitter());
    this.onDidStopExecution = this._onDidStopExecution.event;
    this._onDidChangeOutputs = this._register(new Emitter());
    this.onDidChangeOutputs = this._onDidChangeOutputs.event;
    this._onDidRemoveOutputs = this._register(new Emitter());
    this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
    this._outputCollection = [];
    this._outputsTop = null;
    this._pauseableEmitter = this._register(new PauseableEmitter());
    this.onDidChangeLayout = this._pauseableEmitter.event;
    this._editorHeight = 0;
    this._chatHeight = 0;
    this._hoveringOutput = false;
    this._focusOnOutput = false;
    this._focusInputInOutput = false;
    this._outputMinHeight = 0;
    this.executionErrorDiagnostic = observableValue("excecutionError", void 0);
    this._hasFindResult = this._register(new Emitter());
    this.hasFindResult = this._hasFindResult.event;
    this._outputViewModels = this.model.outputs.map((output) => new CellOutputViewModel(this, output, this._notebookService));
    this._register(this.model.onDidChangeOutputs((splice3) => {
      const removedOutputs = [];
      let outputLayoutChange = false;
      for (let i2 = splice3.start; i2 < splice3.start + splice3.deleteCount; i2++) {
        if (this._outputCollection[i2] !== void 0 && this._outputCollection[i2] !== 0) {
          outputLayoutChange = true;
        }
      }
      this._outputCollection.splice(splice3.start, splice3.deleteCount, ...splice3.newOutputs.map(() => 0));
      removedOutputs.push(...this._outputViewModels.splice(splice3.start, splice3.deleteCount, ...splice3.newOutputs.map((output) => new CellOutputViewModel(this, output, this._notebookService))));
      this._outputsTop = null;
      this._onDidChangeOutputs.fire(splice3);
      this._onDidRemoveOutputs.fire(removedOutputs);
      if (outputLayoutChange) {
        this.layoutChange({ outputHeight: true }, "CodeCellViewModel#model.onDidChangeOutputs");
      }
      if (!this._outputCollection.length) {
        this.executionErrorDiagnostic.set(void 0, void 0);
      }
      dispose(removedOutputs);
    }));
    this._outputCollection = new Array(this.model.outputs.length);
    const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    this._layoutInfo = {
      fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
      editorHeight: 0,
      editorWidth: initialNotebookLayoutInfo ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(initialNotebookLayoutInfo.width) : 0,
      chatHeight: 0,
      statusBarHeight: 0,
      commentOffset: 0,
      commentHeight: 0,
      outputContainerOffset: 0,
      outputTotalHeight: 0,
      outputShowMoreContainerHeight: 0,
      outputShowMoreContainerOffset: 0,
      totalHeight: this.computeTotalHeight(17, 0, 0, 0),
      codeIndicatorHeight: 0,
      outputIndicatorHeight: 0,
      bottomToolbarOffset: 0,
      layoutState: 0 /* Uninitialized */,
      estimatedHasHorizontalScrolling: false,
      outlineWidth: 1,
      topMargin: layoutConfiguration.cellTopMargin,
      bottomMargin: layoutConfiguration.cellBottomMargin
    };
  }
  set editorHeight(height) {
    if (this._editorHeight === height) {
      return;
    }
    this._editorHeight = height;
    this.layoutChange({ editorHeight: true }, "CodeCellViewModel#editorHeight");
  }
  get editorHeight() {
    throw new Error("editorHeight is write-only");
  }
  set chatHeight(height) {
    if (this._chatHeight === height) {
      return;
    }
    this._chatHeight = height;
    this.layoutChange({ chatHeight: true }, "CodeCellViewModel#chatHeight");
  }
  get chatHeight() {
    return this._chatHeight;
  }
  get outputIsHovered() {
    return this._hoveringOutput;
  }
  set outputIsHovered(v2) {
    this._hoveringOutput = v2;
    this._onDidChangeState.fire({ outputIsHoveredChanged: true });
  }
  get outputIsFocused() {
    return this._focusOnOutput;
  }
  set outputIsFocused(v2) {
    this._focusOnOutput = v2;
    this._onDidChangeState.fire({ outputIsFocusedChanged: true });
  }
  get inputInOutputIsFocused() {
    return this._focusInputInOutput;
  }
  set inputInOutputIsFocused(v2) {
    this._focusInputInOutput = v2;
  }
  get outputMinHeight() {
    return this._outputMinHeight;
  }
  /**
   * The minimum height of the output region. It's only set to non-zero temporarily when replacing an output with a new one.
   * It's reset to 0 when the new output is rendered, or in one second.
   */
  set outputMinHeight(newMin) {
    this._outputMinHeight = newMin;
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  get outputsViewModels() {
    return this._outputViewModels;
  }
  updateExecutionState(e) {
    if (e.changed) {
      this.executionErrorDiagnostic.set(void 0, void 0);
      this._onDidStartExecution.fire(e);
    } else {
      this._onDidStopExecution.fire(e);
    }
  }
  updateOptions(e) {
    super.updateOptions(e);
    if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
      this.layoutChange({});
    }
  }
  pauseLayout() {
    this._pauseableEmitter.pause();
  }
  resumeLayout() {
    this._pauseableEmitter.resume();
  }
  layoutChange(state, source) {
    this._ensureOutputsTop();
    const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    const bottomToolbarDimensions = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
    const outputShowMoreContainerHeight = state.outputShowMoreContainerHeight ? state.outputShowMoreContainerHeight : this._layoutInfo.outputShowMoreContainerHeight;
    const outputTotalHeight = Math.max(this._outputMinHeight, this.isOutputCollapsed ? notebookLayoutConfiguration.collapsedIndicatorHeight : this._outputsTop.getTotalSum());
    const commentHeight = state.commentHeight ? this._commentHeight : this._layoutInfo.commentHeight;
    const originalLayout = this.layoutInfo;
    if (!this.isInputCollapsed) {
      let newState;
      let editorHeight;
      let totalHeight;
      let hasHorizontalScrolling = false;
      const chatHeight = state.chatHeight ? this._chatHeight : this._layoutInfo.chatHeight;
      if (!state.editorHeight && this._layoutInfo.layoutState === 2 /* FromCache */ && !state.outputHeight) {
        const estimate = this.estimateEditorHeight(state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight);
        editorHeight = estimate.editorHeight;
        hasHorizontalScrolling = estimate.hasHorizontalScrolling;
        totalHeight = this._layoutInfo.totalHeight;
        newState = 2 /* FromCache */;
      } else if (state.editorHeight || this._layoutInfo.layoutState === 3 /* Measured */) {
        editorHeight = this._editorHeight;
        totalHeight = this.computeTotalHeight(this._editorHeight, outputTotalHeight, outputShowMoreContainerHeight, chatHeight);
        newState = 3 /* Measured */;
        hasHorizontalScrolling = this._layoutInfo.estimatedHasHorizontalScrolling;
      } else {
        const estimate = this.estimateEditorHeight(state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight);
        editorHeight = estimate.editorHeight;
        hasHorizontalScrolling = estimate.hasHorizontalScrolling;
        totalHeight = this.computeTotalHeight(editorHeight, outputTotalHeight, outputShowMoreContainerHeight, chatHeight);
        newState = 1 /* Estimated */;
      }
      const statusBarHeight = this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri);
      const codeIndicatorHeight = editorHeight + statusBarHeight;
      const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
      const outputContainerOffset = notebookLayoutConfiguration.editorToolbarHeight + notebookLayoutConfiguration.cellTopMargin + chatHeight + editorHeight + statusBarHeight;
      const outputShowMoreContainerOffset = totalHeight - bottomToolbarDimensions.bottomToolbarGap - bottomToolbarDimensions.bottomToolbarHeight / 2 - outputShowMoreContainerHeight;
      const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType);
      const editorWidth = state.outerWidth !== void 0 ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(state.outerWidth) : this._layoutInfo?.editorWidth;
      this._layoutInfo = {
        fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
        chatHeight,
        editorHeight,
        editorWidth,
        statusBarHeight,
        outputContainerOffset,
        outputTotalHeight,
        outputShowMoreContainerHeight,
        outputShowMoreContainerOffset,
        commentOffset: outputContainerOffset + outputTotalHeight,
        commentHeight,
        totalHeight,
        codeIndicatorHeight,
        outputIndicatorHeight,
        bottomToolbarOffset,
        layoutState: newState,
        estimatedHasHorizontalScrolling: hasHorizontalScrolling,
        topMargin: notebookLayoutConfiguration.cellTopMargin,
        bottomMargin: notebookLayoutConfiguration.cellBottomMargin,
        outlineWidth: 1
      };
    } else {
      const codeIndicatorHeight = notebookLayoutConfiguration.collapsedIndicatorHeight;
      const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
      const chatHeight = state.chatHeight ? this._chatHeight : this._layoutInfo.chatHeight;
      const outputContainerOffset = notebookLayoutConfiguration.cellTopMargin + notebookLayoutConfiguration.collapsedIndicatorHeight;
      const totalHeight = notebookLayoutConfiguration.cellTopMargin + notebookLayoutConfiguration.collapsedIndicatorHeight + notebookLayoutConfiguration.cellBottomMargin + bottomToolbarDimensions.bottomToolbarGap + chatHeight + commentHeight + outputTotalHeight + outputShowMoreContainerHeight;
      const outputShowMoreContainerOffset = totalHeight - bottomToolbarDimensions.bottomToolbarGap - bottomToolbarDimensions.bottomToolbarHeight / 2 - outputShowMoreContainerHeight;
      const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType);
      const editorWidth = state.outerWidth !== void 0 ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(state.outerWidth) : this._layoutInfo?.editorWidth;
      this._layoutInfo = {
        fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
        editorHeight: this._layoutInfo.editorHeight,
        editorWidth,
        chatHeight,
        statusBarHeight: 0,
        outputContainerOffset,
        outputTotalHeight,
        outputShowMoreContainerHeight,
        outputShowMoreContainerOffset,
        commentOffset: outputContainerOffset + outputTotalHeight,
        commentHeight,
        totalHeight,
        codeIndicatorHeight,
        outputIndicatorHeight,
        bottomToolbarOffset,
        layoutState: this._layoutInfo.layoutState,
        estimatedHasHorizontalScrolling: false,
        outlineWidth: 1,
        topMargin: notebookLayoutConfiguration.cellTopMargin,
        bottomMargin: notebookLayoutConfiguration.cellBottomMargin
      };
    }
    this._fireOnDidChangeLayout({
      ...state,
      totalHeight: this.layoutInfo.totalHeight !== originalLayout.totalHeight,
      source
    });
  }
  _fireOnDidChangeLayout(state) {
    this._pauseableEmitter.fire(state);
  }
  restoreEditorViewState(editorViewStates, totalHeight) {
    super.restoreEditorViewState(editorViewStates);
    if (totalHeight !== void 0 && this._layoutInfo.layoutState !== 3 /* Measured */) {
      this._layoutInfo = {
        ...this._layoutInfo,
        totalHeight,
        layoutState: 2 /* FromCache */
      };
    }
  }
  getDynamicHeight() {
    this._onLayoutInfoRead.fire();
    return this._layoutInfo.totalHeight;
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === 0 /* Uninitialized */) {
      const estimate = this.estimateEditorHeight(lineHeight);
      return this.computeTotalHeight(estimate.editorHeight, 0, 0, 0);
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  estimateEditorHeight(lineHeight = 20) {
    let hasHorizontalScrolling = false;
    const cellEditorOptions = this.viewContext.getBaseCellEditorOptions(this.language);
    if (this.layoutInfo.fontInfo && cellEditorOptions.value.wordWrap === "off") {
      for (let i2 = 0; i2 < this.lineCount; i2++) {
        const max = this.textBuffer.getLineLastNonWhitespaceColumn(i2 + 1);
        const estimatedWidth = max * (this.layoutInfo.fontInfo.typicalHalfwidthCharacterWidth + this.layoutInfo.fontInfo.letterSpacing);
        if (estimatedWidth > this.layoutInfo.editorWidth) {
          hasHorizontalScrolling = true;
          break;
        }
      }
    }
    const verticalScrollbarHeight = hasHorizontalScrolling ? 12 : 0;
    const editorPadding = this.viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
    const editorHeight = this.lineCount * lineHeight + editorPadding.top + editorPadding.bottom + verticalScrollbarHeight;
    return {
      editorHeight,
      hasHorizontalScrolling
    };
  }
  computeTotalHeight(editorHeight, outputsTotalHeight, outputShowMoreContainerHeight, chatHeight) {
    const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
    return layoutConfiguration.editorToolbarHeight + layoutConfiguration.cellTopMargin + chatHeight + editorHeight + this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri) + this._commentHeight + outputsTotalHeight + outputShowMoreContainerHeight + bottomToolbarGap + layoutConfiguration.cellBottomMargin;
  }
  onDidChangeTextModelContent() {
    if (this.getEditState() !== 1 /* Editing */) {
      this.updateEditState(1 /* Editing */, "onDidChangeTextModelContent");
      this._onDidChangeState.fire({ contentChanged: true });
    }
  }
  onDeselect() {
    this.updateEditState(0 /* Preview */, "onDeselect");
  }
  updateOutputShowMoreContainerHeight(height) {
    this.layoutChange({ outputShowMoreContainerHeight: height }, "CodeCellViewModel#updateOutputShowMoreContainerHeight");
  }
  updateOutputMinHeight(height) {
    this.outputMinHeight = height;
  }
  unlockOutputHeight() {
    this.outputMinHeight = 0;
    this.layoutChange({ outputHeight: true });
  }
  updateOutputHeight(index2, height, source) {
    if (index2 >= this._outputCollection.length) {
      throw new Error("Output index out of range!");
    }
    this._ensureOutputsTop();
    try {
      if (index2 === 0 || height > 0) {
        this._outputViewModels[index2].setVisible(true);
      } else if (height === 0) {
        this._outputViewModels[index2].setVisible(false);
      }
    } catch (e) {
      const errorMessage = `Failed to update output height for cell ${this.handle}, output ${index2}. this.outputCollection.length: ${this._outputCollection.length}, this._outputViewModels.length: ${this._outputViewModels.length}`;
      throw new Error(`${errorMessage}.
 Error: ${e.message}`);
    }
    if (this._outputViewModels[index2].visible.get() && height < 28) {
      height = 28;
    }
    this._outputCollection[index2] = height;
    if (this._outputsTop.setValue(index2, height)) {
      this.layoutChange({ outputHeight: true }, source);
    }
  }
  getOutputOffsetInContainer(index2) {
    this._ensureOutputsTop();
    if (index2 >= this._outputCollection.length) {
      throw new Error("Output index out of range!");
    }
    return this._outputsTop.getPrefixSum(index2 - 1);
  }
  getOutputOffset(index2) {
    return this.layoutInfo.outputContainerOffset + this.getOutputOffsetInContainer(index2);
  }
  spliceOutputHeights(start, deleteCnt, heights) {
    this._ensureOutputsTop();
    this._outputsTop.removeValues(start, deleteCnt);
    if (heights.length) {
      const values = new Uint32Array(heights.length);
      for (let i2 = 0; i2 < heights.length; i2++) {
        values[i2] = heights[i2];
      }
      this._outputsTop.insertValues(start, values);
    }
    this.layoutChange({ outputHeight: true }, "CodeCellViewModel#spliceOutputs");
  }
  _ensureOutputsTop() {
    if (!this._outputsTop) {
      const values = new Uint32Array(this._outputCollection.length);
      for (let i2 = 0; i2 < this._outputCollection.length; i2++) {
        values[i2] = this._outputCollection[i2];
      }
      this._outputsTop = new PrefixSumComputer(values);
    }
  }
  startFind(value2, options3) {
    const matches2 = super.cellStartFind(value2, options3);
    if (matches2 === null) {
      return null;
    }
    return {
      cell: this,
      contentMatches: matches2
    };
  }
  dispose() {
    super.dispose();
    this._outputCollection = [];
    this._outputsTop = null;
    dispose(this._outputViewModels);
  }
};

CodeCellViewModel = __decorateClass([
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INotebookService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IUndoRedoService),
  __decorateParam(8, ICodeEditorService),
  __decorateParam(9, IInlineChatSessionService)
], CodeCellViewModel);
export { outputDisplayLimit, CodeCellViewModel };
