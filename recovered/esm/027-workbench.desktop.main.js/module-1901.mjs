// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel.ts
import { BaseCellViewModel } from "./module-1898.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Emitter } from "./module-0017.mjs";
import { NotebookCellStateChangedEvent } from "./module-1895.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel.ts
var MarkupCellViewModel = class extends BaseCellViewModel {
  constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, viewContext, configurationService, textModelService, undoRedoService, codeEditorService, inlineChatSessionService) {
    super(viewType, model, generateUuid(), viewContext, configurationService, textModelService, undoRedoService, codeEditorService, inlineChatSessionService);
    this.foldingDelegate = foldingDelegate;
    this.viewContext = viewContext;
    this.cellKind = 1 /* Markup */;
    this._previewHeight = 0;
    this._chatHeight = 0;
    this._editorHeight = 0;
    this._statusBarHeight = 0;
    this._onDidChangeLayout = this._register(new Emitter());
    this.onDidChangeLayout = this._onDidChangeLayout.event;
    this._hoveringOutput = false;
    this._focusOnOutput = false;
    this._hoveringCell = false;
    /**
     * we put outputs stuff here to make compiler happy
     */
    this.outputsViewModels = [];
    this._hasFindResult = this._register(new Emitter());
    this.hasFindResult = this._hasFindResult.event;
    const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
    const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    this._layoutInfo = {
      chatHeight: 0,
      editorHeight: 0,
      previewHeight: 0,
      fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
      editorWidth: initialNotebookLayoutInfo?.width ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(initialNotebookLayoutInfo.width) : 0,
      commentOffset: 0,
      commentHeight: 0,
      bottomToolbarOffset: bottomToolbarGap,
      totalHeight: 100,
      layoutState: 0 /* Uninitialized */,
      foldHintHeight: 0,
      statusBarHeight: 0,
      outlineWidth: 1,
      bottomMargin: layoutConfiguration.markdownCellBottomMargin,
      topMargin: layoutConfiguration.markdownCellTopMargin
    };
    this._register(this.onDidChangeState((e) => {
      this.viewContext.eventDispatcher.emit([new NotebookCellStateChangedEvent(e, this.model)]);
      if (e.foldingStateChanged) {
        this._updateTotalHeight(this._computeTotalHeight(), 0 /* Fold */);
      }
    }));
  }
  get renderedHtml() {
    return this._renderedHtml;
  }
  set renderedHtml(value2) {
    if (this._renderedHtml !== value2) {
      this._renderedHtml = value2;
      this._onDidChangeState.fire({ contentChanged: true });
    }
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  set renderedMarkdownHeight(newHeight) {
    this._previewHeight = newHeight;
    this._updateTotalHeight(this._computeTotalHeight());
  }
  set chatHeight(newHeight) {
    this._chatHeight = newHeight;
    this._updateTotalHeight(this._computeTotalHeight());
  }
  get chatHeight() {
    return this._chatHeight;
  }
  set editorHeight(newHeight) {
    this._editorHeight = newHeight;
    this._statusBarHeight = this.viewContext.notebookOptions.computeStatusBarHeight();
    this._updateTotalHeight(this._computeTotalHeight());
  }
  get editorHeight() {
    throw new Error("MarkdownCellViewModel.editorHeight is write only");
  }
  get foldingState() {
    return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
  }
  get outputIsHovered() {
    return this._hoveringOutput;
  }
  set outputIsHovered(v2) {
    this._hoveringOutput = v2;
  }
  get outputIsFocused() {
    return this._focusOnOutput;
  }
  set outputIsFocused(v2) {
    this._focusOnOutput = v2;
  }
  get inputInOutputIsFocused() {
    return false;
  }
  set inputInOutputIsFocused(_) {
  }
  get cellIsHovered() {
    return this._hoveringCell;
  }
  set cellIsHovered(v2) {
    this._hoveringCell = v2;
    this._onDidChangeState.fire({ cellIsHoveredChanged: true });
  }
  _computeTotalHeight() {
    const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
    const foldHintHeight = this._computeFoldHintHeight();
    if (this.getEditState() === 1 /* Editing */) {
      return this._editorHeight + layoutConfiguration.markdownCellTopMargin + layoutConfiguration.markdownCellBottomMargin + bottomToolbarGap + this._statusBarHeight + this._commentHeight;
    } else {
      return Math.max(1, this._previewHeight + bottomToolbarGap + foldHintHeight + this._commentHeight);
    }
  }
  _computeFoldHintHeight() {
    return this.getEditState() === 1 /* Editing */ || this.foldingState !== 2 /* Collapsed */ ? 0 : this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight;
  }
  updateOptions(e) {
    super.updateOptions(e);
    if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
      this._updateTotalHeight(this._computeTotalHeight());
    }
  }
  getOutputOffset(index2) {
    return -1;
  }
  updateOutputHeight(index2, height) {
  }
  triggerFoldingStateChange() {
    this._onDidChangeState.fire({ foldingStateChanged: true });
  }
  _updateTotalHeight(newHeight, context2) {
    if (newHeight !== this.layoutInfo.totalHeight) {
      this.layoutChange({ totalHeight: newHeight, context: context2 });
    }
  }
  layoutChange(state) {
    let totalHeight;
    let foldHintHeight;
    if (!this.isInputCollapsed) {
      totalHeight = state.totalHeight === void 0 ? this._layoutInfo.layoutState === 0 /* Uninitialized */ ? 100 : this._layoutInfo.totalHeight : state.totalHeight;
      foldHintHeight = this._computeFoldHintHeight();
    } else {
      totalHeight = this.viewContext.notebookOptions.computeCollapsedMarkdownCellHeight(this.viewType);
      state.totalHeight = totalHeight;
      foldHintHeight = 0;
    }
    let commentOffset;
    const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    if (this.getEditState() === 1 /* Editing */) {
      commentOffset = notebookLayoutConfiguration.editorToolbarHeight + notebookLayoutConfiguration.cellTopMargin + this._chatHeight + this._editorHeight + this._statusBarHeight;
    } else {
      commentOffset = this._previewHeight;
    }
    this._layoutInfo = {
      fontInfo: state.font || this._layoutInfo.fontInfo,
      editorWidth: state.outerWidth !== void 0 ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth) : this._layoutInfo.editorWidth,
      chatHeight: this._chatHeight,
      editorHeight: this._editorHeight,
      statusBarHeight: this._statusBarHeight,
      previewHeight: this._previewHeight,
      bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(
        totalHeight,
        this.viewType
      ),
      totalHeight,
      layoutState: 3 /* Measured */,
      foldHintHeight,
      commentOffset,
      commentHeight: state.commentHeight ? this._commentHeight : this._layoutInfo.commentHeight,
      outlineWidth: 1,
      bottomMargin: notebookLayoutConfiguration.markdownCellBottomMargin,
      topMargin: notebookLayoutConfiguration.markdownCellTopMargin
    };
    this._onDidChangeLayout.fire(state);
  }
  restoreEditorViewState(editorViewStates, totalHeight) {
    super.restoreEditorViewState(editorViewStates);
    if (totalHeight !== void 0 && this.layoutInfo.layoutState === 0 /* Uninitialized */) {
      this._layoutInfo = {
        ...this.layoutInfo,
        totalHeight,
        chatHeight: this._chatHeight,
        editorHeight: this._editorHeight,
        statusBarHeight: this._statusBarHeight,
        layoutState: 2 /* FromCache */
      };
      this.layoutChange({});
    }
  }
  getDynamicHeight() {
    return null;
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === 0 /* Uninitialized */) {
      return 100;
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  onDidChangeTextModelContent() {
    this._onDidChangeState.fire({ contentChanged: true });
  }
  onDeselect() {
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
    this.foldingDelegate = null;
  }
};

MarkupCellViewModel = __decorateClass([
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IUndoRedoService),
  __decorateParam(8, ICodeEditorService),
  __decorateParam(9, IInlineChatSessionService)
], MarkupCellViewModel);
export { MarkupCellViewModel };
