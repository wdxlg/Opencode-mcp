// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor.ts
import { $, addStandardDisposableGenericMouseDownListener, addStandardDisposableGenericMouseUpListener, append, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { cellIndexesToRanges, cellRangesToIndexes } from "./module-0940.mjs";
import { EditorPane } from "./module-1089.mjs";
import { getDefaultNotebookCreationOptions } from "./module-1964.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { SequencerByKey } from "./module-0036.mjs";
import { observableValue } from "./module-0048.mjs";
import { DiffEditorHeightCalculatorService } from "./module-1979.mjs";
import { NotebookOptions } from "./module-1951.mjs";
import { CellUri, NOTEBOOK_DIFF_EDITOR_ID, NotebookSetting } from "./module-0909.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { SideBySideDiffElementViewModel } from "./module-1970.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { CellDiffPlaceholderRenderer, CellDiffSideBySideRenderer, CellDiffSingleSideRenderer, NotebookCellTextDiffListDelegate, NotebookDocumentMetadataDiffRenderer, NotebookTextDiffList } from "./module-1974.mjs";
import { diffDiagonalFill, editorBackground } from "./module-0229.mjs";
import { focusBorder, foreground } from "./module-0227.mjs";
import { localize } from "./module-0001.mjs";
import { NotebookInlineDiffWidget } from "./module-1986.mjs";
import { NotebookDiffOverviewRuler } from "./module-1976.mjs";
import { generateUuid } from "./module-0190.mjs";
import { NotebookDiffEditorEventDispatcher, NotebookDiffLayoutChangedEvent } from "./module-1967.mjs";
import { NotebookDiffViewModel } from "./module-1978.mjs";
import { BackLayerWebView } from "./module-1913.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { INotebookEditorWorkerService } from "./module-1975.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IEditorService } from "./module-0934.mjs";
import { registerZIndex } from "./module-1890.mjs";
import { DIFF_CELL_MARGIN } from "./module-1968.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor.ts
var $35 = $;

var NotebookDiffEditorSelection = class _NotebookDiffEditorSelection {
  constructor(selections) {
    this.selections = selections;
  }
  compare(other) {
    if (!(other instanceof _NotebookDiffEditorSelection)) {
      return 3 /* DIFFERENT */;
    }
    if (this.selections.length !== other.selections.length) {
      return 3 /* DIFFERENT */;
    }
    for (let i2 = 0; i2 < this.selections.length; i2++) {
      if (this.selections[i2] !== other.selections[i2]) {
        return 3 /* DIFFERENT */;
      }
    }
    return 1 /* IDENTICAL */;
  }
  restore(options3) {
    const notebookOptions = {
      cellSelections: cellIndexesToRanges(this.selections)
    };
    Object.assign(notebookOptions, options3);
    return notebookOptions;
  }
};

var NotebookTextDiffEditor = class extends EditorPane {
  constructor(group2, instantiationService, themeService, contextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookService, editorService) {
    super(NotebookTextDiffEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.configurationService = configurationService;
    this.notebookService = notebookService;
    this.editorService = editorService;
    this.creationOptions = getDefaultNotebookCreationOptions();
    this._dimension = void 0;
    this._modifiedWebview = null;
    this._originalWebview = null;
    this._webviewTransparentCover = null;
    this._inlineView = false;
    this._onMouseUp = this._register(new Emitter());
    this.onMouseUp = this._onMouseUp.event;
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this.onDidChangeScroll = this._onDidScroll.event;
    this._model = null;
    this._modifiedResourceDisposableStore = this._register(new DisposableStore());
    this._insetModifyQueueByOutputId = new SequencerByKey();
    this._onDidDynamicOutputRendered = this._register(new Emitter());
    this.onDidDynamicOutputRendered = this._onDidDynamicOutputRendered.event;
    this._localStore = this._register(new DisposableStore());
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._isDisposed = false;
    this._currentChangedIndex = observableValue(this, -1);
    this.currentChangedIndex = this._currentChangedIndex;
    this.pendingLayouts = /* @__PURE__ */ new WeakMap();
    this.diffEditorCalcuator = this.instantiationService.createInstance(DiffEditorHeightCalculatorService, this.fontInfo.lineHeight);
    this._notebookOptions = instantiationService.createInstance(NotebookOptions, this.window, false, void 0);
    this._register(this._notebookOptions);
    this._revealFirst = true;
  }
  static {
    this.ENTIRE_DIFF_OVERVIEW_WIDTH = 30;
  }
  static {
    this.ID = NOTEBOOK_DIFF_EDITOR_ID;
  }
  get textModel() {
    return this._model?.modified.notebook;
  }
  get inlineNotebookEditor() {
    if (this._inlineView) {
      return this.inlineDiffWidget?.editorWidget;
    }
    return void 0;
  }
  get notebookOptions() {
    return this._notebookOptions;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  get fontInfo() {
    if (!this._fontInfo) {
      this._fontInfo = this.createFontInfo();
    }
    return this._fontInfo;
  }
  createFontInfo() {
    const editorOptions2 = this.configurationService.getValue("editor");
    return FontMeasurements.readFontInfo(this.window, createBareFontInfoFromRawSettings(editorOptions2, PixelRatio.getInstance(this.window).value));
  }
  isOverviewRulerEnabled() {
    return this.configurationService.getValue(NotebookSetting.diffOverviewRuler) ?? false;
  }
  getSelection() {
    const selections = this._list.getFocus();
    return new NotebookDiffEditorSelection(selections);
  }
  toggleNotebookCellSelection(cell) {
  }
  updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
  }
  async focusNotebookCell(cell, focus) {
  }
  async focusNextNotebookCell(cell, focus) {
  }
  didFocusOutputInputChange(inputFocused) {
  }
  getScrollTop() {
    return this._list?.scrollTop ?? 0;
  }
  getScrollHeight() {
    return this._list?.scrollHeight ?? 0;
  }
  getScrollPosition() {
    return {
      scrollTop: this.getScrollTop(),
      scrollLeft: this._list?.scrollLeft ?? 0
    };
  }
  setScrollPosition(scrollPosition) {
    if (!this._list) {
      return;
    }
    this._list.scrollTop = scrollPosition.scrollTop;
    if (scrollPosition.scrollLeft !== void 0) {
      this._list.scrollLeft = scrollPosition.scrollLeft;
    }
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this._list?.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  updateOutputHeight(cellInfo, output, outputHeight, isInit) {
    const diffElement = cellInfo.diffElement;
    const cell = this.getCellByInfo(cellInfo);
    const outputIndex = cell.outputsViewModels.indexOf(output);
    if (diffElement instanceof SideBySideDiffElementViewModel) {
      const info = CellUri.parse(cellInfo.cellUri);
      if (!info) {
        return;
      }
      diffElement.updateOutputHeight(info.notebook.toString() === this._model?.original.resource.toString() ? 0 /* Original */ : 1 /* Modified */, outputIndex, outputHeight);
    } else {
      diffElement.updateOutputHeight(diffElement.type === "insert" ? 1 /* Modified */ : 0 /* Original */, outputIndex, outputHeight);
    }
    if (isInit) {
      this._onDidDynamicOutputRendered.fire({ cell, output });
    }
  }
  setMarkupCellEditState(cellId, editState) {
  }
  didStartDragMarkupCell(cellId, event) {
  }
  didDragMarkupCell(cellId, event) {
  }
  didEndDragMarkupCell(cellId) {
  }
  didDropMarkupCell(cellId) {
  }
  didResizeOutput(cellId) {
  }
  async toggleInlineView() {
    this._layoutCancellationTokenSource?.dispose();
    this._inlineView = !this._inlineView;
    if (!this._lastLayoutProperties) {
      return;
    }
    if (this._inlineView) {
      this.layout(this._lastLayoutProperties?.dimension, this._lastLayoutProperties?.position);
      this.inlineDiffWidget?.show(this.input, this._model?.modified.notebook, this._model?.original.notebook, this._options);
    } else {
      this.layout(this._lastLayoutProperties?.dimension, this._lastLayoutProperties?.position);
      this.inlineDiffWidget?.hide();
    }
    this._layoutCancellationTokenSource = new CancellationTokenSource();
    this.updateLayout(this._layoutCancellationTokenSource.token);
  }
  createEditor(parent) {
    this._rootElement = append(parent, $(".notebook-text-diff-editor"));
    this._overflowContainer = document.createElement("div");
    this._overflowContainer.classList.add("notebook-overflow-widget-container", "monaco-editor");
    append(parent, this._overflowContainer);
    const renderers = [
      this.instantiationService.createInstance(CellDiffSingleSideRenderer, this),
      this.instantiationService.createInstance(CellDiffSideBySideRenderer, this),
      this.instantiationService.createInstance(CellDiffPlaceholderRenderer, this),
      this.instantiationService.createInstance(NotebookDocumentMetadataDiffRenderer, this)
    ];
    this._listViewContainer = append(this._rootElement, $(".notebook-diff-list-view"));
    this._list = this.instantiationService.createInstance(
      NotebookTextDiffList,
      "NotebookTextDiff",
      this._listViewContainer,
      this.instantiationService.createInstance(NotebookCellTextDiffListDelegate, this.window),
      renderers,
      this.contextKeyService,
      {
        setRowLineHeight: false,
        setRowHeight: false,
        supportDynamicHeights: true,
        horizontalScrolling: false,
        keyboardSupport: false,
        mouseSupport: true,
        multipleSelectionSupport: false,
        typeNavigationEnabled: true,
        paddingBottom: 0,
        // transformOptimization: (isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
        styleController: (_suffix) => {
          return this._list;
        },
        overrideStyles: {
          listBackground: editorBackground,
          listActiveSelectionBackground: editorBackground,
          listActiveSelectionForeground: foreground,
          listFocusAndSelectionBackground: editorBackground,
          listFocusAndSelectionForeground: foreground,
          listFocusBackground: editorBackground,
          listFocusForeground: foreground,
          listHoverForeground: foreground,
          listHoverBackground: editorBackground,
          listHoverOutline: focusBorder,
          listFocusOutline: focusBorder,
          listInactiveSelectionBackground: editorBackground,
          listInactiveSelectionForeground: foreground,
          listInactiveFocusBackground: editorBackground,
          listInactiveFocusOutline: editorBackground
        },
        accessibilityProvider: {
          getAriaLabel() {
            return null;
          },
          getWidgetAriaLabel() {
            return localize(17667, null);
          }
        }
        // focusNextPreviousDelegate: {
        // 	onFocusNext: (applyFocusNext: () => void) => this._updateForCursorNavigationMode(applyFocusNext),
        // 	onFocusPrevious: (applyFocusPrevious: () => void) => this._updateForCursorNavigationMode(applyFocusPrevious),
        // }
      }
    );
    this.inlineDiffWidget = this._register(this.instantiationService.createInstance(NotebookInlineDiffWidget, this._rootElement, this.group.id, this.window, this.notebookOptions, this._dimension));
    this._register(this._list);
    this._register(this._list.onMouseUp((e) => {
      if (e.element) {
        if (typeof e.index === "number") {
          this._list.setFocus([e.index]);
        }
        this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
      }
    }));
    this._register(this._list.onDidScroll(() => {
      this._onDidScroll.fire();
    }));
    this._register(this._list.onDidChangeFocus(() => this._onDidChangeSelection.fire({ reason: 2 /* USER */ })));
    this._overviewRulerContainer = document.createElement("div");
    this._overviewRulerContainer.classList.add("notebook-overview-ruler-container");
    this._rootElement.appendChild(this._overviewRulerContainer);
    this._registerOverviewRuler();
    this._webviewTransparentCover = append(this._list.rowsContainer, $35(".webview-cover"));
    this._webviewTransparentCover.style.display = "none";
    this._register(addStandardDisposableGenericMouseDownListener(this._overflowContainer, (e) => {
      if (e.target.classList.contains("slider") && this._webviewTransparentCover) {
        this._webviewTransparentCover.style.display = "block";
      }
    }));
    this._register(addStandardDisposableGenericMouseUpListener(this._overflowContainer, () => {
      if (this._webviewTransparentCover) {
        this._webviewTransparentCover.style.display = "none";
      }
    }));
    this._register(this._list.onDidScroll((e) => {
      this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
    }));
  }
  _registerOverviewRuler() {
    this._overviewRuler = this._register(this.instantiationService.createInstance(NotebookDiffOverviewRuler, this, NotebookTextDiffEditor.ENTIRE_DIFF_OVERVIEW_WIDTH, this._overviewRulerContainer));
  }
  _updateOutputsOffsetsInWebview(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
    activeWebview.element.style.height = `${scrollHeight}px`;
    if (activeWebview.insetMapping) {
      const updateItems = [];
      const removedItems = [];
      activeWebview.insetMapping.forEach((value2, key3) => {
        const cell = getActiveNestedCell(value2.cellInfo.diffElement);
        if (!cell) {
          return;
        }
        const viewIndex = this._list.indexOf(value2.cellInfo.diffElement);
        if (viewIndex === void 0) {
          return;
        }
        if (cell.outputsViewModels.indexOf(key3) < 0) {
          removedItems.push(key3);
        } else {
          const cellTop = this._list.getCellViewScrollTop(value2.cellInfo.diffElement);
          const outputIndex = cell.outputsViewModels.indexOf(key3);
          const outputOffset = value2.cellInfo.diffElement.getOutputOffsetInCell(diffSide, outputIndex);
          updateItems.push({
            cell,
            output: key3,
            cellTop,
            outputOffset,
            forceDisplay: false
          });
        }
      });
      activeWebview.removeInsets(removedItems);
      if (updateItems.length) {
        activeWebview.updateScrollTops(updateItems, []);
      }
    }
  }
  async setInput(input, options3, context2, token) {
    this.inlineDiffWidget?.hide();
    await super.setInput(input, options3, context2, token);
    const model = await input.resolve();
    if (this._model !== model) {
      this._detachModel();
      this._attachModel(model);
    }
    this._model = model;
    if (this._model === null) {
      return;
    }
    if (this._inlineView) {
      this._listViewContainer.style.display = "none";
      this.inlineDiffWidget?.show(input, model.modified.notebook, model.original.notebook, options3);
    } else {
      this._listViewContainer.style.display = "block";
      this.inlineDiffWidget?.hide();
    }
    this._revealFirst = true;
    this._modifiedResourceDisposableStore.clear();
    this._layoutCancellationTokenSource = new CancellationTokenSource();
    this._modifiedResourceDisposableStore.add(Event2.any(this._model.original.notebook.onDidChangeContent, this._model.modified.notebook.onDidChangeContent)((e) => {
      if (this._model !== null && this.editorService.activeEditor !== input) {
        this._layoutCancellationTokenSource?.dispose();
        this._layoutCancellationTokenSource = new CancellationTokenSource();
        this.updateLayout(this._layoutCancellationTokenSource.token);
      }
    }));
    await this._createOriginalWebview(generateUuid(), this._model.original.viewType, this._model.original.resource);
    if (this._originalWebview) {
      this._modifiedResourceDisposableStore.add(this._originalWebview);
    }
    await this._createModifiedWebview(generateUuid(), this._model.modified.viewType, this._model.modified.resource);
    if (this._modifiedWebview) {
      this._modifiedResourceDisposableStore.add(this._modifiedWebview);
    }
    await this.updateLayout(this._layoutCancellationTokenSource.token, options3?.cellSelections ? cellRangesToIndexes(options3.cellSelections) : void 0);
  }
  setVisible(visible) {
    super.setVisible(visible);
    if (!visible) {
      this.inlineDiffWidget?.hide();
    }
  }
  _detachModel() {
    this._localStore.clear();
    this._originalWebview?.dispose();
    this._originalWebview?.element.remove();
    this._originalWebview = null;
    this._modifiedWebview?.dispose();
    this._modifiedWebview?.element.remove();
    this._modifiedWebview = null;
    this.notebookDiffViewModel?.dispose();
    this.notebookDiffViewModel = void 0;
    this._modifiedResourceDisposableStore.clear();
    this._list.clear();
  }
  _attachModel(model) {
    this._model = model;
    this._eventDispatcher = new NotebookDiffEditorEventDispatcher();
    const updateInsets = () => {
      scheduleAtNextAnimationFrame(this.window, () => {
        if (this._isDisposed) {
          return;
        }
        if (this._modifiedWebview) {
          this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._modifiedWebview, (diffElement) => {
            return diffElement.modified;
          }, 1 /* Modified */);
        }
        if (this._originalWebview) {
          this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._originalWebview, (diffElement) => {
            return diffElement.original;
          }, 0 /* Original */);
        }
      });
    };
    this._localStore.add(this._list.onDidChangeContentHeight(() => {
      updateInsets();
    }));
    this._localStore.add(this._list.onDidChangeFocus((e) => {
      if (e.indexes.length && this.notebookDiffViewModel && e.indexes[0] < this.notebookDiffViewModel.items.length) {
        const selectedItem = this.notebookDiffViewModel.items[e.indexes[0]];
        const changedItems = this.notebookDiffViewModel.items.filter((item) => item.type !== "unchanged" && item.type !== "unchangedMetadata" && item.type !== "placeholder");
        if (selectedItem && selectedItem?.type !== "placeholder" && selectedItem?.type !== "unchanged" && selectedItem?.type !== "unchangedMetadata") {
          return this._currentChangedIndex.set(changedItems.indexOf(selectedItem), void 0);
        }
      }
      return this._currentChangedIndex.set(-1, void 0);
    }));
    this._localStore.add(this._eventDispatcher.onDidChangeCellLayout(() => {
      updateInsets();
    }));
    const vm = this.notebookDiffViewModel = this._register(new NotebookDiffViewModel(this._model, this.notebookEditorWorkerService, this.configurationService, this._eventDispatcher, this.notebookService, this.diffEditorCalcuator, this.fontInfo, void 0));
    this._localStore.add(this.notebookDiffViewModel.onDidChangeItems((e) => {
      this._originalWebview?.removeInsets([...this._originalWebview?.insetMapping.keys()]);
      this._modifiedWebview?.removeInsets([...this._modifiedWebview?.insetMapping.keys()]);
      if (this._revealFirst && typeof e.firstChangeIndex === "number" && e.firstChangeIndex > -1 && e.firstChangeIndex < this._list.length) {
        this._revealFirst = false;
        this._list.setFocus([e.firstChangeIndex]);
        this._list.reveal(e.firstChangeIndex, 0.3);
      }
      this._list.splice(e.start, e.deleteCount, e.elements);
      if (this.isOverviewRulerEnabled()) {
        this._overviewRuler.updateViewModels(vm.items, this._eventDispatcher);
      }
    }));
  }
  async _createModifiedWebview(id2, viewType, resource) {
    this._modifiedWebview?.dispose();
    this._modifiedWebview = this.instantiationService.createInstance(BackLayerWebView, this, id2, viewType, resource, {
      ...this._notebookOptions.computeDiffWebviewOptions(),
      fontFamily: this._generateFontFamily()
    }, void 0);
    this._list.rowsContainer.insertAdjacentElement("afterbegin", this._modifiedWebview.element);
    this._modifiedWebview.createWebview(this.window);
    this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
    this._modifiedWebview.element.style.left = `calc(50%)`;
  }
  _generateFontFamily() {
    return this.fontInfo.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
  }
  async _createOriginalWebview(id2, viewType, resource) {
    this._originalWebview?.dispose();
    this._originalWebview = this.instantiationService.createInstance(BackLayerWebView, this, id2, viewType, resource, {
      ...this._notebookOptions.computeDiffWebviewOptions(),
      fontFamily: this._generateFontFamily()
    }, void 0);
    this._list.rowsContainer.insertAdjacentElement("afterbegin", this._originalWebview.element);
    this._originalWebview.createWebview(this.window);
    this._originalWebview.element.style.width = `calc(50% - 16px)`;
    this._originalWebview.element.style.left = `16px`;
  }
  setOptions(options3) {
    const selections = options3?.cellSelections ? cellRangesToIndexes(options3.cellSelections) : void 0;
    if (selections) {
      this._list.setFocus(selections);
    }
  }
  async updateLayout(token, selections) {
    if (!this._model || !this.notebookDiffViewModel) {
      return;
    }
    await this.notebookDiffViewModel.computeDiff(token);
    if (token.isCancellationRequested) {
      return;
    }
    if (selections) {
      this._list.setFocus(selections);
    }
  }
  scheduleOutputHeightAck(cellInfo, outputId, height) {
    const diffElement = cellInfo.diffElement;
    let diffSide = 0 /* Original */;
    if (diffElement instanceof SideBySideDiffElementViewModel) {
      const info = CellUri.parse(cellInfo.cellUri);
      if (!info) {
        return;
      }
      diffSide = info.notebook.toString() === this._model?.original.resource.toString() ? 0 /* Original */ : 1 /* Modified */;
    } else {
      diffSide = diffElement.type === "insert" ? 1 /* Modified */ : 0 /* Original */;
    }
    const webview = diffSide === 1 /* Modified */ ? this._modifiedWebview : this._originalWebview;
    scheduleAtNextAnimationFrame(this.window, () => {
      webview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
    }, 10);
  }
  layoutNotebookCell(cell, height) {
    const relayout = (cell2, height2) => {
      this._list.updateElementHeight2(cell2, height2);
    };
    let disposable = this.pendingLayouts.get(cell);
    if (disposable) {
      this._localStore.delete(disposable);
    }
    let r2;
    const layoutDisposable = scheduleAtNextAnimationFrame(this.window, () => {
      this.pendingLayouts.delete(cell);
      relayout(cell, height);
      r2();
    });
    disposable = toDisposable(() => {
      layoutDisposable.dispose();
      r2();
    });
    this._localStore.add(disposable);
    this.pendingLayouts.set(cell, disposable);
    return new Promise((resolve3) => {
      r2 = resolve3;
    });
  }
  setScrollTop(scrollTop) {
    this._list.scrollTop = scrollTop;
  }
  triggerScroll(event) {
    this._list.triggerScrollFromMouseWheelEvent(event);
  }
  firstChange() {
    if (!this.notebookDiffViewModel) {
      return;
    }
    const currentViewModels = this.notebookDiffViewModel.items;
    const index2 = currentViewModels.findIndex((vm) => vm.type !== "unchanged" && vm.type !== "unchangedMetadata" && vm.type !== "placeholder");
    if (index2 >= 0) {
      this._list.setFocus([index2]);
      this._list.reveal(index2);
    }
  }
  lastChange() {
    if (!this.notebookDiffViewModel) {
      return;
    }
    const currentViewModels = this.notebookDiffViewModel.items;
    const item = currentViewModels.slice().reverse().find((vm) => vm.type !== "unchanged" && vm.type !== "unchangedMetadata" && vm.type !== "placeholder");
    const index2 = item ? currentViewModels.indexOf(item) : -1;
    if (index2 >= 0) {
      this._list.setFocus([index2]);
      this._list.reveal(index2);
    }
  }
  previousChange() {
    if (!this.notebookDiffViewModel) {
      return;
    }
    let currFocus = this._list.getFocus()[0];
    if (isNaN(currFocus) || currFocus < 0) {
      currFocus = 0;
    }
    let prevChangeIndex = currFocus - 1;
    const currentViewModels = this.notebookDiffViewModel.items;
    while (prevChangeIndex >= 0) {
      const vm = currentViewModels[prevChangeIndex];
      if (vm.type !== "unchanged" && vm.type !== "unchangedMetadata" && vm.type !== "placeholder") {
        break;
      }
      prevChangeIndex--;
    }
    if (prevChangeIndex >= 0) {
      this._list.setFocus([prevChangeIndex]);
      this._list.reveal(prevChangeIndex);
    } else {
      const index2 = currentViewModels.findLastIndex((vm) => vm.type !== "unchanged" && vm.type !== "unchangedMetadata" && vm.type !== "placeholder");
      if (index2 >= 0) {
        this._list.setFocus([index2]);
        this._list.reveal(index2);
      }
    }
  }
  nextChange() {
    if (!this.notebookDiffViewModel) {
      return;
    }
    let currFocus = this._list.getFocus()[0];
    if (isNaN(currFocus) || currFocus < 0) {
      currFocus = 0;
    }
    let nextChangeIndex = currFocus + 1;
    const currentViewModels = this.notebookDiffViewModel.items;
    while (nextChangeIndex < currentViewModels.length) {
      const vm = currentViewModels[nextChangeIndex];
      if (vm.type !== "unchanged" && vm.type !== "unchangedMetadata" && vm.type !== "placeholder") {
        break;
      }
      nextChangeIndex++;
    }
    if (nextChangeIndex < currentViewModels.length) {
      this._list.setFocus([nextChangeIndex]);
      this._list.reveal(nextChangeIndex);
    } else {
      const index2 = currentViewModels.findIndex((vm) => vm.type !== "unchanged" && vm.type !== "unchangedMetadata" && vm.type !== "placeholder");
      if (index2 >= 0) {
        this._list.setFocus([index2]);
        this._list.reveal(index2);
      }
    }
  }
  createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
    this._insetModifyQueueByOutputId.queue(output.source.model.outputId + (diffSide === 1 /* Modified */ ? "-right" : "left"), async () => {
      const activeWebview = diffSide === 1 /* Modified */ ? this._modifiedWebview : this._originalWebview;
      if (!activeWebview) {
        return;
      }
      if (!activeWebview.insetMapping.has(output.source)) {
        const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
        await activeWebview.createOutput({ diffElement: cellDiffViewModel, cellHandle: cellViewModel.handle, cellId: cellViewModel.id, cellUri: cellViewModel.uri }, output, cellTop, getOffset());
      } else {
        const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
        const outputIndex = cellViewModel.outputsViewModels.indexOf(output.source);
        const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
        activeWebview.updateScrollTops([{
          cell: cellViewModel,
          output: output.source,
          cellTop,
          outputOffset,
          forceDisplay: true
        }], []);
      }
    });
  }
  updateMarkupCellHeight() {
  }
  getCellByInfo(cellInfo) {
    return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
  }
  getCellById(cellId) {
    throw new Error("Not implemented");
  }
  removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
    this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === 1 /* Modified */ ? "-right" : "left"), async () => {
      const activeWebview = diffSide === 1 /* Modified */ ? this._modifiedWebview : this._originalWebview;
      if (!activeWebview) {
        return;
      }
      if (!activeWebview.insetMapping.has(displayOutput)) {
        return;
      }
      activeWebview.removeInsets([displayOutput]);
    });
  }
  showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
    this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === 1 /* Modified */ ? "-right" : "left"), async () => {
      const activeWebview = diffSide === 1 /* Modified */ ? this._modifiedWebview : this._originalWebview;
      if (!activeWebview) {
        return;
      }
      if (!activeWebview.insetMapping.has(displayOutput)) {
        return;
      }
      const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
      const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
      const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
      activeWebview.updateScrollTops([{
        cell: cellViewModel,
        output: displayOutput,
        cellTop,
        outputOffset,
        forceDisplay: true
      }], []);
    });
  }
  hideInset(cellDiffViewModel, cellViewModel, output) {
    this._modifiedWebview?.hideInset(output);
    this._originalWebview?.hideInset(output);
  }
  // private async _resolveWebview(rightEditor: boolean): Promise<BackLayerWebView | null> {
  // 	if (rightEditor) {
  // 	}
  // }
  getDomNode() {
    return this._rootElement;
  }
  getOverflowContainerDomNode() {
    return this._overflowContainer;
  }
  getControl() {
    return this;
  }
  clearInput() {
    this.inlineDiffWidget?.hide();
    super.clearInput();
    this._modifiedResourceDisposableStore.clear();
    this._list?.splice(0, this._list?.length || 0);
    this._model = null;
    this.notebookDiffViewModel?.dispose();
    this.notebookDiffViewModel = void 0;
  }
  deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
    if (diffSide === 0 /* Original */) {
      this._originalWebview?.deltaCellOutputContainerClassNames(cellId, added, removed);
    } else {
      this._modifiedWebview?.deltaCellOutputContainerClassNames(cellId, added, removed);
    }
  }
  getLayoutInfo() {
    if (!this._list) {
      throw new Error("Editor is not initalized successfully");
    }
    return {
      width: this._dimension.width,
      height: this._dimension.height,
      fontInfo: this.fontInfo,
      scrollHeight: this._list?.getScrollHeight() ?? 0,
      stickyHeight: 0,
      listViewOffsetTop: 0
    };
  }
  layout(dimension, position2) {
    this._rootElement.classList.toggle("mid-width", dimension.width < 1e3 && dimension.width >= 600);
    this._rootElement.classList.toggle("narrow-width", dimension.width < 600);
    const overviewRulerEnabled = this.isOverviewRulerEnabled();
    this._dimension = dimension.with(dimension.width - (overviewRulerEnabled ? NotebookTextDiffEditor.ENTIRE_DIFF_OVERVIEW_WIDTH : 0));
    this._listViewContainer.style.height = `${dimension.height}px`;
    this._listViewContainer.style.width = `${this._dimension.width}px`;
    if (this._inlineView) {
      this._listViewContainer.style.display = "none";
      this.inlineDiffWidget?.setLayout(dimension, position2);
    } else {
      this.inlineDiffWidget?.hide();
      this._listViewContainer.style.display = "block";
      this._list?.layout(this._dimension.height, this._dimension.width);
      if (this._modifiedWebview) {
        this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
        this._modifiedWebview.element.style.left = `calc(50%)`;
      }
      if (this._originalWebview) {
        this._originalWebview.element.style.width = `calc(50% - 16px)`;
        this._originalWebview.element.style.left = `16px`;
      }
      if (this._webviewTransparentCover) {
        this._webviewTransparentCover.style.height = `${this._dimension.height}px`;
        this._webviewTransparentCover.style.width = `${this._dimension.width}px`;
      }
      if (overviewRulerEnabled) {
        this._overviewRuler.layout();
      }
    }
    this._lastLayoutProperties = { dimension, position: position2 };
    this._eventDispatcher?.emit([new NotebookDiffLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
  }
  dispose() {
    this._isDisposed = true;
    this._layoutCancellationTokenSource?.dispose();
    this._detachModel();
    super.dispose();
  }
};

NotebookTextDiffEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, INotebookEditorWorkerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, INotebookService),
  __decorateParam(9, IEditorService)
], NotebookTextDiffEditor);

registerZIndex(0 /* Base */, 10, "notebook-diff-view-viewport-slider");

registerThemingParticipant((theme, collector) => {
  const diffDiagonalFillColor = theme.getColor(diffDiagonalFill);
  collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
  collector.addRule(`.notebook-text-diff-editor .cell-body { margin: ${DIFF_CELL_MARGIN}px; }`);
  collector.addRule(`.notebook-text-diff-editor .cell-placeholder-body { margin: ${DIFF_CELL_MARGIN}px 0; }`);
});
export { $35, NotebookDiffEditorSelection, NotebookTextDiffEditor };
