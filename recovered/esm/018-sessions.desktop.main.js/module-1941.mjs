// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookEditorWidget.ts
import { $, addStandardDisposableGenericMouseDownListener, addStandardDisposableGenericMouseUpListener, append, getWindow, isAncestorOfActiveElement, isHTMLElement, runWhenWindowIdle, scheduleAtNextAnimationFrame, size, trackFocus } from "./module-0075.mjs";
import { FloatingEditorClickMenu } from "./module-1821.mjs";
import { FloatingEditorToolbar } from "./module-0865.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { MenuId } from "./module-0092.mjs";
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SequencerByKey } from "./module-0036.mjs";
import { generateUuid } from "./module-0190.mjs";
import { OverlayLayoutElement } from "./module-1866.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { NotebookOptions, OutputInnerContainerTopPadding } from "./module-1928.mjs";
import { mainWindow } from "./module-0002.mjs";
import { NotebookEventDispatcher } from "./module-1918.mjs";
import { ViewContext2 } from "./module-1923.mjs";
import { NotebookEditorContextKeys } from "./module-1925.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { NOTEBOOK_CURSOR_NAVIGATION_MODE, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_OUTPUT_FOCUSED, NOTEBOOK_OUTPUT_INPUT_FOCUSED } from "./module-1844.mjs";
import { PreventDefaultContextMenuItemsContextKeyName } from "./module-1936.mjs";
import { NotebookEditorExtensionsRegistry } from "./module-1870.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { notebookDebug } from "./module-1871.mjs";
import { BaseCellEditorOptions } from "./module-1929.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { NotebookHorizontalTracker } from "./module-1938.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { CellDragAndDropController } from "./module-1880.mjs";
import { NotebookCellEditorPool } from "./module-1939.mjs";
import { CodeCellRenderer, MarkupCellRenderer, NotebookCellListDelegate } from "./module-1917.mjs";
import { NotebookAccessibilityProvider } from "./module-1937.mjs";
import { ListViewInfoAccessor, NOTEBOOK_WEBVIEW_BOUNDARY, NotebookCellList } from "./module-1885.mjs";
import { contrastBorder, errorForeground, focusBorder, foreground } from "./module-0227.mjs";
import { NotebookCellLayoutManager } from "./module-1940.mjs";
import { ListTopCellToolbar } from "./module-1927.mjs";
import { NotebookOverviewRuler } from "./module-1926.mjs";
import { NotebookEditorWorkbenchToolbar } from "./module-1924.mjs";
import { NotebookStickyScroll } from "./module-1934.mjs";
import { RENDERER_NOT_AVAILABLE } from "./module-0911.mjs";
import { setTimeout0 } from "./module-0014.mjs";
import { CellContextKeyManager } from "./module-1879.mjs";
import { Range2 } from "./module-0106.mjs";
import { BackLayerWebView } from "./module-1890.mjs";
import { NotebookViewModel } from "./module-1922.mjs";
import { NotebookLayoutChangedEvent } from "./module-1872.mjs";
import { Schemas } from "./module-0033.mjs";
import { SuggestController } from "./module-0758.mjs";
import { DropIntoEditorController } from "./module-0671.mjs";
import { CopyPasteController } from "./module-0555.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { CodeCellViewModel, outputDisplayLimit } from "./module-1877.mjs";
import { cellRangesToIndexes } from "./module-0941.mjs";
import { CellFindMatchModel } from "./module-1920.mjs";
import { MarkupCellViewModel } from "./module-1878.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { INotebookRendererMessagingService } from "./module-1392.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotebookExecutionService } from "./module-0994.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { registerZIndex } from "./module-1867.mjs";
import { registerColor, transparent } from "./module-0226.mjs";
import { listInactiveSelectionBackground } from "./module-0232.mjs";
import { EDITOR_PANE_BACKGROUND, PANEL_BORDER, SIDE_BAR_BACKGROUND } from "./module-0868.mjs";
import { localize } from "./module-0001.mjs";
import { debugIconStartForeground } from "./module-1869.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground } from "./module-0228.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookEditorWidget.ts
var $33 = $;

function getDefaultNotebookCreationOptions() {
  const skipContributions = [
    "editor.contrib.review",
    FloatingEditorClickMenu.ID,
    FloatingEditorToolbar.ID,
    "editor.contrib.dirtydiff",
    "editor.contrib.testingOutputPeek",
    "editor.contrib.testingDecorations",
    "store.contrib.stickyScrollController",
    "editor.contrib.findController",
    "editor.contrib.emptyTextEditorHint"
  ];
  const contributions = EditorExtensionsRegistry.getEditorContributions().filter((c) => skipContributions.indexOf(c.id) === -1);
  return {
    menuIds: {
      notebookToolbar: MenuId.NotebookToolbar,
      cellTitleToolbar: MenuId.NotebookCellTitle,
      cellDeleteToolbar: MenuId.NotebookCellDelete,
      cellInsertToolbar: MenuId.NotebookCellBetween,
      cellTopInsertToolbar: MenuId.NotebookCellListTop,
      cellExecuteToolbar: MenuId.NotebookCellExecute,
      cellExecutePrimary: MenuId.NotebookCellExecutePrimary
    },
    cellEditorContributions: contributions
  };
}

var NotebookEditorWidget = class extends Disposable {
  constructor(creationOptions, dimension, instantiationService, editorGroupsService, notebookRendererMessaging, notebookEditorService, notebookKernelService, _notebookService, configurationService, contextKeyService, layoutService, contextMenuService, telemetryService, notebookExecutionService, editorProgressService, logService) {
    super();
    this.creationOptions = creationOptions;
    this.editorGroupsService = editorGroupsService;
    this.notebookRendererMessaging = notebookRendererMessaging;
    this.notebookEditorService = notebookEditorService;
    this.notebookKernelService = notebookKernelService;
    this._notebookService = _notebookService;
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.telemetryService = telemetryService;
    this.notebookExecutionService = notebookExecutionService;
    this.editorProgressService = editorProgressService;
    this.logService = logService;
    //#region Eventing
    this._onDidChangeCellState = this._register(new Emitter());
    this.onDidChangeCellState = this._onDidChangeCellState.event;
    this._onDidChangeViewCells = this._register(new Emitter());
    this.onDidChangeViewCells = this._onDidChangeViewCells.event;
    this._onWillChangeModel = this._register(new Emitter());
    this.onWillChangeModel = this._onWillChangeModel.event;
    this._onDidChangeModel = this._register(new Emitter());
    this.onDidChangeModel = this._onDidChangeModel.event;
    this._onDidAttachViewModel = this._register(new Emitter());
    this.onDidAttachViewModel = this._onDidAttachViewModel.event;
    this._onDidChangeOptions = this._register(new Emitter());
    this.onDidChangeOptions = this._onDidChangeOptions.event;
    this._onDidChangeDecorations = this._register(new Emitter());
    this.onDidChangeDecorations = this._onDidChangeDecorations.event;
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this._onDidChangeLayout = this._register(new Emitter());
    this.onDidChangeLayout = this._onDidChangeLayout.event;
    this._onDidChangeActiveCell = this._register(new Emitter());
    this.onDidChangeActiveCell = this._onDidChangeActiveCell.event;
    this._onDidChangeFocus = this._register(new Emitter());
    this.onDidChangeFocus = this._onDidChangeFocus.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._onDidChangeVisibleRanges = this._register(new Emitter());
    this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
    this._onDidFocusEmitter = this._register(new Emitter());
    this.onDidFocusWidget = this._onDidFocusEmitter.event;
    this._onDidBlurEmitter = this._register(new Emitter());
    this.onDidBlurWidget = this._onDidBlurEmitter.event;
    this._onDidChangeActiveEditor = this._register(new Emitter());
    this.onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;
    this._onDidChangeActiveKernel = this._register(new Emitter());
    this.onDidChangeActiveKernel = this._onDidChangeActiveKernel.event;
    this._onMouseUp = this._register(new Emitter());
    this.onMouseUp = this._onMouseUp.event;
    this._onMouseDown = this._register(new Emitter());
    this.onMouseDown = this._onMouseDown.event;
    this._onDidReceiveMessage = this._register(new Emitter());
    this.onDidReceiveMessage = this._onDidReceiveMessage.event;
    this._onDidRenderOutput = this._register(new Emitter());
    this.onDidRenderOutput = this._onDidRenderOutput.event;
    this._onDidRemoveOutput = this._register(new Emitter());
    this.onDidRemoveOutput = this._onDidRemoveOutput.event;
    this._onDidResizeOutputEmitter = this._register(new Emitter());
    this.onDidResizeOutput = this._onDidResizeOutputEmitter.event;
    this._webview = null;
    this._webviewResolvePromise = null;
    this._webviewTransparentCover = null;
    this._listDelegate = null;
    this._dndController = null;
    this._listTopCellToolbar = null;
    this._renderedEditors = /* @__PURE__ */ new Map();
    this._localStore = this._register(new DisposableStore());
    this._localCellStateListeners = [];
    this._contributions = /* @__PURE__ */ new Map();
    this._insetModifyQueueByOutputId = new SequencerByKey();
    this._cellContextKeyManager = null;
    this._uuid = generateUuid();
    this._webviewFocused = false;
    this._isVisible = false;
    this._isDisposed = false;
    this._baseCellEditorOptions = /* @__PURE__ */ new Map();
    this._debugFlag = false;
    this._backgroundMarkdownRenderRunning = false;
    this._lastCellWithEditorFocus = null;
    this._pendingOutputHeightAcks = /* @__PURE__ */ new Map();
    this._dimension = dimension;
    this.isReplHistory = creationOptions.isReplHistory ?? false;
    this._readOnly = creationOptions.isReadOnly ?? false;
    this._overlayLayout = this._register(new OverlayLayoutElement());
    this._overlayContainer = this._overlayLayout.content;
    this.scopedContextKeyService = this._register(contextKeyService.createScoped(this._overlayContainer));
    this.instantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this._notebookOptions = creationOptions.options ?? this.instantiationService.createInstance(NotebookOptions, this.creationOptions?.codeWindow ?? mainWindow, this._readOnly, void 0);
    this._register(this._notebookOptions);
    const eventDispatcher = this._register(new NotebookEventDispatcher());
    this._viewContext = new ViewContext2(
      this._notebookOptions,
      eventDispatcher,
      (language2) => this.getBaseCellEditorOptions(language2)
    );
    this._register(this._viewContext.eventDispatcher.onDidChangeLayout(() => {
      this._onDidChangeLayout.fire();
    }));
    this._register(this._viewContext.eventDispatcher.onDidChangeCellState((e4) => {
      this._onDidChangeCellState.fire(e4);
    }));
    this._register(_notebookService.onDidChangeOutputRenderers(() => {
      this._updateOutputRenderers();
    }));
    this._register(this.instantiationService.createInstance(NotebookEditorContextKeys, this));
    this._register(notebookKernelService.onDidChangeSelectedNotebooks((e4) => {
      if (isEqual2(e4.notebook, this.viewModel?.uri)) {
        this._loadKernelPreloads();
        this._onDidChangeActiveKernel.fire();
      }
    }));
    this._scrollBeyondLastLine = this.configurationService.getValue("editor.scrollBeyondLastLine");
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor.scrollBeyondLastLine")) {
        this._scrollBeyondLastLine = this.configurationService.getValue("editor.scrollBeyondLastLine");
        if (this._dimension && this._isVisible) {
          this.layout(this._dimension);
        }
      }
    }));
    this._register(this._notebookOptions.onDidChangeOptions((e4) => {
      if (e4.cellStatusBarVisibility || e4.cellToolbarLocation || e4.cellToolbarInteraction) {
        this._updateForNotebookConfiguration();
      }
      if (e4.fontFamily) {
        this._generateFontInfo();
      }
      if (e4.compactView || e4.focusIndicator || e4.insertToolbarPosition || e4.cellToolbarLocation || e4.dragAndDropEnabled || e4.fontSize || e4.markupFontSize || e4.markdownLineHeight || e4.fontFamily || e4.insertToolbarAlignment || e4.outputFontSize || e4.outputLineHeight || e4.outputFontFamily || e4.outputWordWrap || e4.outputScrolling || e4.outputLinkifyFilePaths || e4.minimalError) {
        this._styleElement?.remove();
        this._createLayoutStyles();
        this._webview?.updateOptions({
          ...this.notebookOptions.computeWebviewOptions(),
          fontFamily: this._generateFontFamily()
        });
      }
      if (this._dimension && this._isVisible) {
        this.layout(this._dimension);
      }
    }));
    const container2 = creationOptions.codeWindow ? this.layoutService.getContainer(creationOptions.codeWindow) : this.layoutService.mainContainer;
    this.notebookEditorService.addNotebookEditor(this);
    const id2 = generateUuid();
    this._overlayContainer.id = `notebook-${id2}`;
    this._overlayContainer.className = "notebookOverlay";
    this._overlayContainer.classList.add("notebook-editor");
    this._overlayContainer.inert = true;
    this._overlayContainer.style.visibility = "hidden";
    container2.appendChild(this._overlayLayout.root);
    this._createBody(this._overlayContainer);
    this._generateFontInfo();
    this._isVisible = true;
    this._editorFocus = NOTEBOOK_EDITOR_FOCUSED.bindTo(this.scopedContextKeyService);
    this._outputFocus = NOTEBOOK_OUTPUT_FOCUSED.bindTo(this.scopedContextKeyService);
    this._outputInputFocus = NOTEBOOK_OUTPUT_INPUT_FOCUSED.bindTo(this.scopedContextKeyService);
    this._editorEditable = NOTEBOOK_EDITOR_EDITABLE.bindTo(this.scopedContextKeyService);
    this._cursorNavMode = NOTEBOOK_CURSOR_NAVIGATION_MODE.bindTo(this.scopedContextKeyService);
    new RawContextKey(PreventDefaultContextMenuItemsContextKeyName, false).bindTo(this.scopedContextKeyService).set(true);
    this._editorEditable.set(!creationOptions.isReadOnly);
    let contributions;
    if (Array.isArray(this.creationOptions.contributions)) {
      contributions = this.creationOptions.contributions;
    } else {
      contributions = NotebookEditorExtensionsRegistry.getEditorContributions();
    }
    for (const desc of contributions) {
      let contribution;
      try {
        contribution = this.instantiationService.createInstance(desc.ctor, this);
      } catch (err) {
        onUnexpectedError(err);
      }
      if (contribution) {
        if (!this._contributions.has(desc.id)) {
          this._contributions.set(desc.id, contribution);
        } else {
          contribution.dispose();
          throw new Error(`DUPLICATE notebook editor contribution: '${desc.id}'`);
        }
      }
    }
    this._updateForNotebookConfiguration();
  }
  get isVisible() {
    return this._isVisible;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  set viewModel(newModel) {
    this._onWillChangeModel.fire(this._notebookViewModel?.notebookDocument);
    this._notebookViewModel = newModel;
    this._onDidChangeModel.fire(newModel?.notebookDocument);
  }
  get viewModel() {
    return this._notebookViewModel;
  }
  get textModel() {
    return this._notebookViewModel?.notebookDocument;
  }
  get isReadOnly() {
    return this._notebookViewModel?.options.isReadOnly ?? false;
  }
  get activeCodeEditor() {
    if (this._isDisposed) {
      return;
    }
    const [focused] = this._list.getFocusedElements();
    return this._renderedEditors.get(focused);
  }
  get activeCellAndCodeEditor() {
    if (this._isDisposed) {
      return;
    }
    const [focused] = this._list.getFocusedElements();
    const editor = this._renderedEditors.get(focused);
    if (!editor) {
      return;
    }
    return [focused, editor];
  }
  get codeEditors() {
    return [...this._renderedEditors];
  }
  get visibleRanges() {
    return this._list ? this._list.visibleRanges || [] : [];
  }
  get notebookOptions() {
    return this._notebookOptions;
  }
  _debug(...args2) {
    if (!this._debugFlag) {
      return;
    }
    notebookDebug(...args2);
  }
  /**
   * EditorId
   */
  getId() {
    return this._uuid;
  }
  getViewModel() {
    return this.viewModel;
  }
  getLength() {
    return this.viewModel?.length ?? 0;
  }
  getSelections() {
    return this.viewModel?.getSelections() ?? [{ start: 0, end: 0 }];
  }
  setSelections(selections) {
    if (!this.viewModel) {
      return;
    }
    const focus = this.viewModel.getFocus();
    this.viewModel.updateSelectionsState({
      kind: 1 /* Index */,
      focus,
      selections
    });
  }
  getFocus() {
    return this.viewModel?.getFocus() ?? { start: 0, end: 0 };
  }
  setFocus(focus) {
    if (!this.viewModel) {
      return;
    }
    const selections = this.viewModel.getSelections();
    this.viewModel.updateSelectionsState({
      kind: 1 /* Index */,
      focus,
      selections
    });
  }
  getSelectionViewModels() {
    if (!this.viewModel) {
      return [];
    }
    const cellsSet = /* @__PURE__ */ new Set();
    return this.viewModel.getSelections().map((range2) => this.viewModel.viewCells.slice(range2.start, range2.end)).reduce((a, b) => {
      b.forEach((cell) => {
        if (!cellsSet.has(cell.handle)) {
          cellsSet.add(cell.handle);
          a.push(cell);
        }
      });
      return a;
    }, []);
  }
  hasModel() {
    return !!this._notebookViewModel;
  }
  showProgress() {
    this._currentProgress = this.editorProgressService.show(true);
  }
  hideProgress() {
    if (this._currentProgress) {
      this._currentProgress.done();
      this._currentProgress = void 0;
    }
  }
  //#region Editor Core
  getBaseCellEditorOptions(language2) {
    const existingOptions = this._baseCellEditorOptions.get(language2);
    if (existingOptions) {
      return existingOptions;
    } else {
      const options3 = new BaseCellEditorOptions(this, this.notebookOptions, this.configurationService, language2);
      this._baseCellEditorOptions.set(language2, options3);
      return options3;
    }
  }
  _updateForNotebookConfiguration() {
    if (!this._overlayContainer) {
      return;
    }
    this._overlayContainer.classList.remove("cell-title-toolbar-left");
    this._overlayContainer.classList.remove("cell-title-toolbar-right");
    this._overlayContainer.classList.remove("cell-title-toolbar-hidden");
    const cellToolbarLocation = this._notebookOptions.computeCellToolbarLocation(this.viewModel?.viewType);
    this._overlayContainer.classList.add(`cell-title-toolbar-${cellToolbarLocation}`);
    const cellToolbarInteraction = this._notebookOptions.getDisplayOptions().cellToolbarInteraction;
    let cellToolbarInteractionState = "hover";
    this._overlayContainer.classList.remove("cell-toolbar-hover");
    this._overlayContainer.classList.remove("cell-toolbar-click");
    if (cellToolbarInteraction === "hover" || cellToolbarInteraction === "click") {
      cellToolbarInteractionState = cellToolbarInteraction;
    }
    this._overlayContainer.classList.add(`cell-toolbar-${cellToolbarInteractionState}`);
  }
  _generateFontInfo() {
    const editorOptions = this.configurationService.getValue("editor");
    const targetWindow = getWindow(this.getDomNode());
    this._fontInfo = FontMeasurements.readFontInfo(targetWindow, createBareFontInfoFromRawSettings(editorOptions, PixelRatio.getInstance(targetWindow).value));
  }
  _createBody(parent) {
    this._notebookTopToolbarContainer = document.createElement("div");
    this._notebookTopToolbarContainer.classList.add("notebook-toolbar-container");
    this._notebookTopToolbarContainer.style.display = "none";
    append(parent, this._notebookTopToolbarContainer);
    this._notebookStickyScrollContainer = document.createElement("div");
    this._notebookStickyScrollContainer.classList.add("notebook-sticky-scroll-container");
    append(parent, this._notebookStickyScrollContainer);
    this._body = document.createElement("div");
    append(parent, this._body);
    this._body.classList.add("cell-list-container");
    this._createLayoutStyles();
    this._createCellList();
    this._notebookOverviewRulerContainer = document.createElement("div");
    this._notebookOverviewRulerContainer.classList.add("notebook-overview-ruler-container");
    this._list.scrollableElement.appendChild(this._notebookOverviewRulerContainer);
    this._registerNotebookOverviewRuler();
    this._register(this.instantiationService.createInstance(NotebookHorizontalTracker, this, this._list.scrollableElement));
    this._overflowContainer = document.createElement("div");
    this._overflowContainer.classList.add("notebook-overflow-widget-container", "monaco-editor");
    append(parent, this._overflowContainer);
  }
  _generateFontFamily() {
    return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
  }
  _createLayoutStyles() {
    this._styleElement = createStyleSheet(this._body);
    const {
      cellRightMargin,
      cellTopMargin,
      cellRunGutter,
      cellBottomMargin,
      codeCellLeftMargin,
      markdownCellGutter,
      markdownCellLeftMargin,
      markdownCellBottomMargin,
      markdownCellTopMargin,
      collapsedIndicatorHeight,
      focusIndicator,
      insertToolbarPosition,
      outputFontSize,
      focusIndicatorLeftMargin,
      focusIndicatorGap
    } = this._notebookOptions.getLayoutConfiguration();
    const {
      insertToolbarAlignment,
      compactView,
      fontSize
    } = this._notebookOptions.getDisplayOptions();
    const getCellEditorContainerLeftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
    const { bottomToolbarGap, bottomToolbarHeight } = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
    const styleSheets = [];
    if (!this._fontInfo) {
      this._generateFontInfo();
    }
    const fontFamily = this._generateFontFamily();
    styleSheets.push(`
		.notebook-editor {
			--notebook-cell-output-font-size: ${outputFontSize}px;
			--notebook-cell-input-preview-font-size: ${fontSize}px;
			--notebook-cell-input-preview-font-family: ${fontFamily};
		}
		`);
    if (compactView) {
      styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`);
    } else {
      styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin}px; }`);
    }
    if (focusIndicator === "border") {
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:after {
				content: "";
				position: absolute;
				width: 100%;
				height: 1px;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				content: "";
				position: absolute;
				width: 1px;
				height: 100%;
				z-index: 10;
			}

			/* top border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before {
				border-top: 1px solid transparent;
			}

			/* left border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before {
				border-left: 1px solid transparent;
			}

			/* bottom border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before {
				border-bottom: 1px solid transparent;
			}

			/* right border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				border-right: 1px solid transparent;
			}
			`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-right:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-right:before {
				top: -${cellTopMargin}px; height: calc(100% + ${cellTopMargin + cellBottomMargin}px)
			}`);
    } else {
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-left: 3px solid transparent;
				border-radius: 4px;
				width: 0px;
				margin-left: ${focusIndicatorLeftMargin}px;
				border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-output-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .markdown-cell-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row:hover .cell-focus-indicator-left .codeOutput-focus-indicator-container {
				display: block;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator-container:hover .codeOutput-focus-indicator {
				border-left: 5px solid transparent;
				margin-left: ${focusIndicatorLeftMargin - 1}px;
			}
			`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-inner-container.cell-output-focus .cell-focus-indicator-left .codeOutput-focus-indicator,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-color: var(--vscode-notebook-focusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-inner-container .cell-focus-indicator-left .output-focus-indicator {
				margin-top: ${focusIndicatorGap}px;
			}
			`);
    }
    if (insertToolbarPosition === "betweenCells" || insertToolbarPosition === "both") {
      styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: flex; }`);
      styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .cell-list-top-cell-toolbar-container { display: flex; }`);
    } else {
      styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: none; }`);
      styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .cell-list-top-cell-toolbar-container { display: none; }`);
    }
    if (insertToolbarAlignment === "left") {
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .action-item:first-child {
				margin-right: 0px !important;
			}`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar .action-label {
				padding: 0px !important;
				justify-content: center;
				border-radius: 4px;
			}`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container {
				align-items: flex-start;
				justify-content: left;
				margin: 0 16px 0 ${8 + codeCellLeftMargin}px;
			}`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.notebookOverlay .cell-bottom-toolbar-container .action-item {
				border: 0px;
			}`);
    }
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .code-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .code-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .code-cell-row div.cell { margin-right: ${cellRightMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell { margin-right: ${cellRightMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row > .cell-inner-container { padding-top: ${cellTopMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container.webview-backed-markdown-cell { padding: 0; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .webview-backed-markdown-cell.markdown-cell-edit-mode .cell.code { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
    styleSheets.push(`.notebookOverlay .output { margin: 0px ${cellRightMargin}px 0px ${getCellEditorContainerLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .output { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { left: ${getCellEditorContainerLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`);
    styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton { left: -${cellRunGutter}px; }`);
    styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton {
			position: absolute;
			width: ${cellRunGutter}px;
			padding: 6px 0px;
		}`);
    styleSheets.push(`.notebookOverlay .output-show-more-container { margin: 0px ${cellRightMargin}px 0px ${getCellEditorContainerLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .output-show-more-container { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`);
    styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell.markdown { padding-left: ${cellRunGutter}px; }`);
    styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container .notebook-folding-indicator { left: ${(markdownCellGutter - 20) / 2 + markdownCellLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay > .cell-list-container .notebook-folded-hint { left: ${markdownCellGutter + markdownCellLeftMargin + 8}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row :not(.webview-backed-markdown-cell) .cell-focus-indicator-top { height: ${cellTopMargin}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-side { bottom: ${bottomToolbarGap}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-focus-indicator-left { width: ${getCellEditorContainerLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator.cell-focus-indicator-right { width: ${cellRightMargin}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom { height: ${cellBottomMargin}px; }`);
    styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-shadow-container-bottom { top: ${cellBottomMargin}px; }`);
    styleSheets.push(`
			.notebookOverlay .monaco-list.selection-multiple .monaco-list-row:has(+ .monaco-list-row.selected) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
			}
		`);
    styleSheets.push(`
			.notebookOverlay .monaco-list .monaco-list-row.code-cell-row.nb-multiCellHighlight:has(+ .monaco-list-row.nb-multiCellHighlight) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
				background-color: var(--vscode-notebook-symbolHighlightBackground) !important;
			}

			.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row.nb-multiCellHighlight:has(+ .monaco-list-row.nb-multiCellHighlight) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin - 6}px;
				background-color: var(--vscode-notebook-symbolHighlightBackground) !important;
			}
		`);
    styleSheets.push(`
			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview {
				line-height: ${collapsedIndicatorHeight}px;
			}

			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview .monaco-tokenized-source {
				max-height: ${collapsedIndicatorHeight}px;
			}
		`);
    styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
    styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .cell-list-top-cell-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
    styleSheets.push(`.monaco-workbench .notebookOverlay.cell-title-toolbar-right > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			right: ${cellRightMargin + 26}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-left > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			left: ${getCellEditorContainerLeftMargin + 16}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-hidden > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			display: none;
		}`);
    styleSheets.push(`
		.monaco-workbench .notebookOverlay .output > div.foreground.output-inner-container {
			padding: ${OutputInnerContainerTopPadding}px 8px;
		}
		.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .output-collapse-container {
			padding: ${OutputInnerContainerTopPadding}px 8px;
		}
		`);
    styleSheets.push(`
		.monaco-workbench .notebookOverlay .cell-chat-part {
			margin: 0 ${cellRightMargin}px 6px 4px;
		}
		`);
    this._styleElement.textContent = styleSheets.join("\n");
  }
  _createCellList() {
    this._body.classList.add("cell-list-container");
    this._dndController = this._register(new CellDragAndDropController(this, this._body));
    const getScopedContextKeyService = (container2) => this._list.contextKeyService.createScoped(container2);
    this._editorPool = this._register(this.instantiationService.createInstance(NotebookCellEditorPool, this, getScopedContextKeyService));
    const renderers = [
      this.instantiationService.createInstance(CodeCellRenderer, this, this._renderedEditors, this._editorPool, this._dndController, getScopedContextKeyService),
      this.instantiationService.createInstance(MarkupCellRenderer, this, this._dndController, this._renderedEditors, getScopedContextKeyService)
    ];
    renderers.forEach((renderer) => {
      this._register(renderer);
    });
    this._listDelegate = this.instantiationService.createInstance(NotebookCellListDelegate, getWindow(this.getDomNode()));
    this._register(this._listDelegate);
    const accessibilityProvider = this.instantiationService.createInstance(NotebookAccessibilityProvider, () => this.viewModel, this.isReplHistory);
    this._register(accessibilityProvider);
    this._list = this.instantiationService.createInstance(
      NotebookCellList,
      "NotebookCellList",
      this._body,
      this._viewContext.notebookOptions,
      this._listDelegate,
      renderers,
      this.scopedContextKeyService,
      {
        setRowLineHeight: false,
        setRowHeight: false,
        supportDynamicHeights: true,
        horizontalScrolling: false,
        keyboardSupport: false,
        mouseSupport: true,
        multipleSelectionSupport: true,
        selectionNavigation: true,
        typeNavigationEnabled: true,
        paddingTop: 0,
        paddingBottom: 0,
        transformOptimization: false,
        //(isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
        initialSize: this._dimension,
        styleController: (_suffix) => {
          return this._list;
        },
        overrideStyles: {
          listBackground: notebookEditorBackground,
          listActiveSelectionBackground: notebookEditorBackground,
          listActiveSelectionForeground: foreground,
          listFocusAndSelectionBackground: notebookEditorBackground,
          listFocusAndSelectionForeground: foreground,
          listFocusBackground: notebookEditorBackground,
          listFocusForeground: foreground,
          listHoverForeground: foreground,
          listHoverBackground: notebookEditorBackground,
          listHoverOutline: focusBorder,
          listFocusOutline: focusBorder,
          listInactiveSelectionBackground: notebookEditorBackground,
          listInactiveSelectionForeground: foreground,
          listInactiveFocusBackground: notebookEditorBackground,
          listInactiveFocusOutline: notebookEditorBackground
        },
        accessibilityProvider
      }
    );
    this._cellLayoutManager = new NotebookCellLayoutManager(this, this._list, this.logService);
    this._dndController.setList(this._list);
    this._register(this._list);
    this._listViewInfoAccessor = new ListViewInfoAccessor(this._list);
    this._register(this._listViewInfoAccessor);
    this._register(combinedDisposable(...renderers));
    this._listTopCellToolbar = this._register(this.instantiationService.createInstance(ListTopCellToolbar, this, this.notebookOptions));
    this._webviewTransparentCover = append(this._list.rowsContainer, $33(".webview-cover"));
    this._webviewTransparentCover.style.display = "none";
    this._register(addStandardDisposableGenericMouseDownListener(this._overlayContainer, (e4) => {
      if (e4.target.classList.contains("slider") && this._webviewTransparentCover) {
        this._webviewTransparentCover.style.display = "block";
      }
    }));
    this._register(addStandardDisposableGenericMouseUpListener(this._overlayContainer, () => {
      if (this._webviewTransparentCover) {
        this._webviewTransparentCover.style.display = "none";
      }
    }));
    this._register(this._list.onMouseDown((e4) => {
      if (e4.element) {
        this._onMouseDown.fire({ event: e4.browserEvent, target: e4.element });
      }
    }));
    this._register(this._list.onMouseUp((e4) => {
      if (e4.element) {
        this._onMouseUp.fire({ event: e4.browserEvent, target: e4.element });
      }
    }));
    this._register(this._list.onDidChangeFocus((_e) => {
      this._onDidChangeActiveEditor.fire(this);
      this._onDidChangeActiveCell.fire();
      this._onDidChangeFocus.fire();
      this._cursorNavMode.set(false);
    }));
    this._register(this._list.onContextMenu((e4) => {
      this.showListContextMenu(e4);
    }));
    this._register(this._list.onDidChangeVisibleRanges(() => {
      this._onDidChangeVisibleRanges.fire();
    }));
    this._register(this._list.onDidScroll((e4) => {
      if (e4.scrollTop !== e4.oldScrollTop) {
        this._onDidScroll.fire();
        this.clearActiveCellWidgets();
      }
      if (e4.scrollTop === e4.oldScrollTop && e4.scrollHeightChanged) {
        this._onDidChangeLayout.fire();
      }
    }));
    this._focusTracker = this._register(trackFocus(this.getDomNode()));
    this._register(this._focusTracker.onDidBlur(() => {
      this._editorFocus.set(false);
      this.viewModel?.setEditorFocus(false);
      this._onDidBlurEmitter.fire();
    }));
    this._register(this._focusTracker.onDidFocus(() => {
      this._editorFocus.set(true);
      this.viewModel?.setEditorFocus(true);
      this._onDidFocusEmitter.fire();
    }));
    this._registerNotebookActionsToolbar();
    this._registerNotebookStickyScroll();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(accessibilityProvider.verbositySettingId)) {
        this._list.ariaLabel = accessibilityProvider?.getWidgetAriaLabel();
      }
    }));
  }
  showListContextMenu(e4) {
    this.contextMenuService.showContextMenu({
      menuId: MenuId.NotebookCellTitle,
      menuActionOptions: {
        shouldForwardArgs: true
      },
      contextKeyService: this.scopedContextKeyService,
      getAnchor: () => e4.anchor,
      getActionsContext: () => {
        return {
          from: "cellContainer"
        };
      }
    });
  }
  _registerNotebookOverviewRuler() {
    this._notebookOverviewRuler = this._register(this.instantiationService.createInstance(NotebookOverviewRuler, this, this._notebookOverviewRulerContainer));
  }
  _registerNotebookActionsToolbar() {
    this._notebookTopToolbar = this._register(this.instantiationService.createInstance(NotebookEditorWorkbenchToolbar, this, this.scopedContextKeyService, this._notebookOptions, this._notebookTopToolbarContainer));
    this._register(this._notebookTopToolbar.onDidChangeVisibility(() => {
      if (this._dimension && this._isVisible) {
        this.layout(this._dimension);
      }
    }));
  }
  _registerNotebookStickyScroll() {
    this._notebookStickyScroll = this._register(this.instantiationService.createInstance(NotebookStickyScroll, this._notebookStickyScrollContainer, this, this._list, (sizeDelta) => {
      if (this.isDisposed) {
        return;
      }
      if (this._dimension && this._isVisible) {
        if (sizeDelta > 0) {
          this.layout(this._dimension);
          this.setScrollTop(this.scrollTop + sizeDelta);
        } else if (sizeDelta < 0) {
          this.setScrollTop(this.scrollTop + sizeDelta);
          this.layout(this._dimension);
        }
      }
      this._onDidScroll.fire();
    }));
  }
  _updateOutputRenderers() {
    if (!this.viewModel || !this._webview) {
      return;
    }
    this._webview.updateOutputRenderers();
    this.viewModel.viewCells.forEach((cell) => {
      cell.outputsViewModels.forEach((output) => {
        if (output.pickedMimeType?.rendererId === RENDERER_NOT_AVAILABLE) {
          output.resetRenderer();
        }
      });
    });
  }
  getDomNode() {
    return this._overlayContainer;
  }
  getOverflowContainerDomNode() {
    return this._overflowContainer;
  }
  getInnerWebview() {
    return this._webview?.webview;
  }
  setEditorProgressService(editorProgressService) {
    this.editorProgressService = editorProgressService;
  }
  setParentContextKeyService(parentContextKeyService) {
    this.scopedContextKeyService.updateParent(parentContextKeyService);
  }
  async setModel(textModel, viewState, perf2, viewType) {
    if (this.viewModel === void 0 || !this.viewModel.equal(textModel)) {
      const oldBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
      this._detachModel();
      await this._attachModel(textModel, viewType ?? textModel.viewType, viewState, perf2);
      const newBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
      if (oldBottomToolbarDimensions.bottomToolbarGap !== newBottomToolbarDimensions.bottomToolbarGap || oldBottomToolbarDimensions.bottomToolbarHeight !== newBottomToolbarDimensions.bottomToolbarHeight) {
        this._styleElement?.remove();
        this._createLayoutStyles();
        this._webview?.updateOptions({
          ...this.notebookOptions.computeWebviewOptions(),
          fontFamily: this._generateFontFamily()
        });
      }
      this.telemetryService.publicLog2("notebook/editorOpened", {
        scheme: textModel.uri.scheme,
        ext: extname2(textModel.uri),
        viewType: textModel.viewType,
        isRepl: this.isReplHistory
      });
    } else {
      this.restoreListViewState(viewState);
    }
    this._restoreSelectedKernel(viewState);
    this._loadKernelPreloads();
    this._dndController?.clearGlobalDragState();
    this._localStore.add(this._list.onDidChangeFocus(() => {
      this.updateContextKeysOnFocusChange();
    }));
    this.updateContextKeysOnFocusChange();
    this._backgroundMarkdownRendering();
  }
  _backgroundMarkdownRendering() {
    if (this._backgroundMarkdownRenderRunning) {
      return;
    }
    this._backgroundMarkdownRenderRunning = true;
    runWhenWindowIdle(getWindow(this.getDomNode()), (deadline) => {
      this._backgroundMarkdownRenderingWithDeadline(deadline);
    });
  }
  _backgroundMarkdownRenderingWithDeadline(deadline) {
    const endTime = Date.now() + deadline.timeRemaining();
    const execute = () => {
      try {
        this._backgroundMarkdownRenderRunning = true;
        if (this._isDisposed) {
          return;
        }
        if (!this.viewModel) {
          return;
        }
        const firstMarkupCell = this.viewModel.viewCells.find((cell) => cell.cellKind === 1 /* Markup */ && !this._webview?.markupPreviewMapping.has(cell.id) && !this.cellIsHidden(cell));
        if (!firstMarkupCell) {
          return;
        }
        this.createMarkupPreview(firstMarkupCell);
      } finally {
        this._backgroundMarkdownRenderRunning = false;
      }
      if (Date.now() < endTime) {
        setTimeout0(execute);
      } else {
        this._backgroundMarkdownRendering();
      }
    };
    execute();
  }
  updateContextKeysOnFocusChange() {
    if (!this.viewModel) {
      return;
    }
    const focused = this._list.getFocusedElements()[0];
    if (focused) {
      if (!this._cellContextKeyManager) {
        this._cellContextKeyManager = this._localStore.add(this.instantiationService.createInstance(CellContextKeyManager, this, focused));
      }
      this._cellContextKeyManager.updateForElement(focused);
    }
  }
  async setOptions(options3) {
    if (options3?.isReadOnly !== void 0) {
      this._readOnly = options3?.isReadOnly;
    }
    if (!this.viewModel) {
      return;
    }
    this.viewModel.updateOptions({ isReadOnly: this._readOnly });
    this.notebookOptions.updateOptions(this._readOnly);
    const cellOptions = options3?.cellOptions ?? this._parseIndexedCellOptions(options3);
    if (cellOptions) {
      const cell = this.viewModel.viewCells.find((cell2) => cell2.uri.toString() === cellOptions.resource.toString());
      if (cell) {
        this.focusElement(cell);
        const selection = cellOptions.options?.selection;
        if (selection) {
          cell.updateEditState(1 /* Editing */, "setOptions");
          cell.focusMode = 1 /* Editor */;
          await this.revealRangeInCenterIfOutsideViewportAsync(cell, new Range2(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn));
        } else {
          this._list.revealCell(cell, options3?.cellRevealType ?? 4 /* CenterIfOutsideViewport */);
        }
        const editor = this._renderedEditors.get(cell);
        if (editor) {
          if (cellOptions.options?.selection) {
            const { selection: selection2 } = cellOptions.options;
            const editorSelection = new Range2(selection2.startLineNumber, selection2.startColumn, selection2.endLineNumber || selection2.startLineNumber, selection2.endColumn || selection2.startColumn);
            editor.setSelection(editorSelection);
            editor.revealPositionInCenterIfOutsideViewport({
              lineNumber: selection2.startLineNumber,
              column: selection2.startColumn
            });
            await this.revealRangeInCenterIfOutsideViewportAsync(cell, editorSelection);
          }
          if (!cellOptions.options?.preserveFocus) {
            editor.focus();
          }
        }
      }
    }
    if (options3?.cellSelections) {
      const focusCellIndex = options3.cellSelections[0].start;
      const focusedCell = this.viewModel.cellAt(focusCellIndex);
      if (focusedCell) {
        this.viewModel.updateSelectionsState({
          kind: 1 /* Index */,
          focus: { start: focusCellIndex, end: focusCellIndex + 1 },
          selections: options3.cellSelections
        });
        this.revealInCenterIfOutsideViewport(focusedCell);
      }
    }
    this._updateForOptions();
    this._onDidChangeOptions.fire();
  }
  _parseIndexedCellOptions(options3) {
    if (options3?.indexedCellOptions) {
      const cell = this.cellAt(options3.indexedCellOptions.index);
      if (cell) {
        return {
          resource: cell.uri,
          options: {
            selection: options3.indexedCellOptions.selection,
            preserveFocus: false
          }
        };
      }
    }
    return void 0;
  }
  _detachModel() {
    this._localStore.clear();
    dispose(this._localCellStateListeners);
    this._list.detachViewModel();
    this.viewModel?.dispose();
    this.viewModel = void 0;
    this._webview?.dispose();
    this._webview?.element.remove();
    this._webview = null;
    this._list.clear();
  }
  _updateForOptions() {
    if (!this.viewModel) {
      return;
    }
    this._editorEditable.set(!this.viewModel.options.isReadOnly);
    this._overflowContainer.classList.toggle("notebook-editor-editable", !this.viewModel.options.isReadOnly);
    this.getDomNode().classList.toggle("notebook-editor-editable", !this.viewModel.options.isReadOnly);
  }
  async _resolveWebview() {
    if (!this.textModel) {
      return null;
    }
    if (this._webviewResolvePromise) {
      return this._webviewResolvePromise;
    }
    if (!this._webview) {
      this._ensureWebview(this.getId(), this.textModel.viewType, this.textModel.uri);
    }
    this._webviewResolvePromise = (async () => {
      if (!this._webview) {
        throw new Error("Notebook output webview object is not created successfully.");
      }
      await this._webview.createWebview(this.creationOptions.codeWindow ?? mainWindow);
      if (!this._webview.webview) {
        throw new Error("Notebook output webview element was not created successfully.");
      }
      this._localStore.add(this._webview.webview.onDidBlur(() => {
        this._outputFocus.set(false);
        this._webviewFocused = false;
        this.updateEditorFocus();
        this.updateCellFocusMode();
      }));
      this._localStore.add(this._webview.webview.onDidFocus(() => {
        this._outputFocus.set(true);
        this.updateEditorFocus();
        this._webviewFocused = true;
      }));
      this._localStore.add(this._webview.onMessage((e4) => {
        this._onDidReceiveMessage.fire(e4);
      }));
      return this._webview;
    })();
    return this._webviewResolvePromise;
  }
  _ensureWebview(id2, viewType, resource) {
    if (this._webview) {
      return;
    }
    const that = this;
    this._webview = this.instantiationService.createInstance(BackLayerWebView, {
      get creationOptions() {
        return that.creationOptions;
      },
      setScrollTop(scrollTop) {
        that._list.scrollTop = scrollTop;
      },
      triggerScroll(event) {
        that._list.triggerScrollFromMouseWheelEvent(event);
      },
      getCellByInfo: that.getCellByInfo.bind(that),
      getCellById: that._getCellById.bind(that),
      toggleNotebookCellSelection: that._toggleNotebookCellSelection.bind(that),
      focusNotebookCell: that.focusNotebookCell.bind(that),
      focusNextNotebookCell: that.focusNextNotebookCell.bind(that),
      updateOutputHeight: that._updateOutputHeight.bind(that),
      scheduleOutputHeightAck: that._scheduleOutputHeightAck.bind(that),
      updateMarkupCellHeight: that._updateMarkupCellHeight.bind(that),
      setMarkupCellEditState: that._setMarkupCellEditState.bind(that),
      didStartDragMarkupCell: that._didStartDragMarkupCell.bind(that),
      didDragMarkupCell: that._didDragMarkupCell.bind(that),
      didDropMarkupCell: that._didDropMarkupCell.bind(that),
      didEndDragMarkupCell: that._didEndDragMarkupCell.bind(that),
      didResizeOutput: that._didResizeOutput.bind(that),
      updatePerformanceMetadata: that._updatePerformanceMetadata.bind(that),
      didFocusOutputInputChange: that._didFocusOutputInputChange.bind(that)
    }, id2, viewType, resource, {
      ...this._notebookOptions.computeWebviewOptions(),
      fontFamily: this._generateFontFamily()
    }, this.notebookRendererMessaging.getScoped(this._uuid));
    this._webview.element.style.width = "100%";
    this._list.attachWebview(this._webview.element);
  }
  async _attachModel(textModel, viewType, viewState, perf2) {
    this._ensureWebview(this.getId(), textModel.viewType, textModel.uri);
    this.viewModel = this.instantiationService.createInstance(NotebookViewModel, viewType, textModel, this._viewContext, this.getLayoutInfo(), { isReadOnly: this._readOnly });
    this._viewContext.eventDispatcher.emit([new NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
    this.notebookOptions.updateOptions(this._readOnly);
    this._updateForOptions();
    this._updateForNotebookConfiguration();
    {
      this.viewModel.restoreEditorViewState(viewState);
      const contributionsState = viewState?.contributionsState || {};
      for (const [id2, contribution] of this._contributions) {
        if (typeof contribution.restoreViewState === "function") {
          contribution.restoreViewState(contributionsState[id2]);
        }
      }
    }
    this._localStore.add(this.viewModel.onDidChangeViewCells((e4) => {
      this._onDidChangeViewCells.fire(e4);
    }));
    this._localStore.add(this.viewModel.onDidChangeSelection(() => {
      this._onDidChangeSelection.fire();
      this.updateSelectedMarkdownPreviews();
    }));
    this._localStore.add(this._list.onWillScroll((e4) => {
      if (this._webview?.isResolved()) {
        this._webviewTransparentCover.style.transform = `translateY(${e4.scrollTop})`;
      }
    }));
    let hasPendingChangeContentHeight = false;
    const renderScrollHeightDisposable = this._localStore.add(new MutableDisposable());
    this._localStore.add(this._list.onDidChangeContentHeight(() => {
      if (hasPendingChangeContentHeight) {
        return;
      }
      hasPendingChangeContentHeight = true;
      renderScrollHeightDisposable.value = scheduleAtNextAnimationFrame(getWindow(this.getDomNode()), () => {
        hasPendingChangeContentHeight = false;
        this._updateScrollHeight();
      }, 100);
    }));
    this._localStore.add(this._list.onDidRemoveOutputs((outputs) => {
      outputs.forEach((output) => this.removeInset(output));
    }));
    this._localStore.add(this._list.onDidHideOutputs((outputs) => {
      outputs.forEach((output) => this.hideInset(output));
    }));
    this._localStore.add(this._list.onDidRemoveCellsFromView((cells) => {
      const hiddenCells = [];
      const deletedCells = [];
      for (const cell of cells) {
        if (cell.cellKind === 1 /* Markup */) {
          const mdCell = cell;
          if (this.viewModel?.viewCells.find((cell2) => cell2.handle === mdCell.handle)) {
            hiddenCells.push(mdCell);
          } else {
            deletedCells.push(mdCell);
          }
        }
      }
      this.hideMarkupPreviews(hiddenCells);
      this.deleteMarkupPreviews(deletedCells);
    }));
    await this._warmupWithMarkdownRenderer(this.viewModel, viewState, perf2);
    perf2?.mark("customMarkdownLoaded");
    this._localCellStateListeners = this.viewModel.viewCells.map((cell) => this._bindCellListener(cell));
    this._lastCellWithEditorFocus = this.viewModel.viewCells.find((viewCell) => this.getActiveCell() === viewCell && viewCell.focusMode === 1 /* Editor */) ?? null;
    this._localStore.add(this.viewModel.onDidChangeViewCells((e4) => {
      if (this._isDisposed) {
        return;
      }
      [...e4.splices].reverse().forEach((splice3) => {
        const [start, deleted, newCells] = splice3;
        const deletedCells = this._localCellStateListeners.splice(start, deleted, ...newCells.map((cell) => this._bindCellListener(cell)));
        dispose(deletedCells);
      });
      if (e4.splices.some((s) => s[2].some((cell) => cell.cellKind === 1 /* Markup */))) {
        this._backgroundMarkdownRendering();
      }
    }));
    if (this._dimension) {
      this._list.layout(this.getBodyHeight(this._dimension.height), this._dimension.width);
    } else {
      this._list.layout();
    }
    this._dndController?.clearGlobalDragState();
    this.restoreListViewState(viewState);
  }
  _bindCellListener(cell) {
    const store = new DisposableStore();
    store.add(cell.onDidChangeLayout((e4) => {
      if (e4.totalHeight || e4.outerWidth) {
        this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight, e4.context);
      }
    }));
    if (cell.cellKind === 2 /* Code */) {
      store.add(cell.onDidRemoveOutputs((outputs) => {
        outputs.forEach((output) => this.removeInset(output));
      }));
    }
    store.add(cell.onDidChangeState((e4) => {
      if (e4.inputCollapsedChanged && cell.isInputCollapsed && cell.cellKind === 1 /* Markup */) {
        this.hideMarkupPreviews([cell]);
      }
      if (e4.outputCollapsedChanged && cell.isOutputCollapsed && cell.cellKind === 2 /* Code */) {
        cell.outputsViewModels.forEach((output) => this.hideInset(output));
      }
      if (e4.focusModeChanged) {
        this._validateCellFocusMode(cell);
      }
    }));
    store.add(cell.onCellDecorationsChanged((e4) => {
      e4.added.forEach((options3) => {
        if (options3.className) {
          this.deltaCellContainerClassNames(cell.id, [options3.className], [], cell.cellKind);
        }
        if (options3.outputClassName) {
          this.deltaCellContainerClassNames(cell.id, [options3.outputClassName], [], cell.cellKind);
        }
      });
      e4.removed.forEach((options3) => {
        if (options3.className) {
          this.deltaCellContainerClassNames(cell.id, [], [options3.className], cell.cellKind);
        }
        if (options3.outputClassName) {
          this.deltaCellContainerClassNames(cell.id, [], [options3.outputClassName], cell.cellKind);
        }
      });
    }));
    return store;
  }
  _validateCellFocusMode(cell) {
    if (cell.focusMode !== 1 /* Editor */) {
      return;
    }
    if (this._lastCellWithEditorFocus && this._lastCellWithEditorFocus !== cell) {
      this._lastCellWithEditorFocus.focusMode = 0 /* Container */;
    }
    this._lastCellWithEditorFocus = cell;
  }
  async _warmupWithMarkdownRenderer(viewModel, viewState, perf2) {
    this.logService.debug("NotebookEditorWidget", "warmup " + this.viewModel?.uri.toString());
    await this._resolveWebview();
    perf2?.mark("webviewCommLoaded");
    this.logService.debug("NotebookEditorWidget", "warmup - webview resolved");
    this._webview.element.style.visibility = "hidden";
    await this._warmupViewportMarkdownCells(viewModel, viewState);
    this.logService.debug("NotebookEditorWidget", "warmup - viewport warmed up");
    this._list.layout(0, 0);
    this._list.attachViewModel(viewModel);
    this._list.scrollTop = viewState?.scrollPosition?.top ?? 0;
    this._debug("finish initial viewport warmup and view state restore.");
    this._webview.element.style.visibility = "visible";
    this.logService.debug("NotebookEditorWidget", "warmup - list view model attached, set to visible");
    this._onDidAttachViewModel.fire();
  }
  async _warmupViewportMarkdownCells(viewModel, viewState) {
    if (viewState && viewState.cellTotalHeights) {
      const totalHeightCache = viewState.cellTotalHeights;
      const scrollTop = viewState.scrollPosition?.top ?? 0;
      const scrollBottom = scrollTop + Math.max(this._dimension?.height ?? 0, 1080);
      let offset = 0;
      const requests = [];
      for (let i2 = 0; i2 < viewModel.length; i2++) {
        const cell = viewModel.cellAt(i2);
        const cellHeight = totalHeightCache[i2] ?? 0;
        if (offset + cellHeight < scrollTop) {
          offset += cellHeight;
          continue;
        }
        if (cell.cellKind === 1 /* Markup */) {
          requests.push([cell, offset]);
        }
        offset += cellHeight;
        if (offset > scrollBottom) {
          break;
        }
      }
      await this._webview.initializeMarkup(requests.map(([model, offset2]) => this.createMarkupCellInitialization(model, offset2)));
    } else {
      const initRequests = viewModel.viewCells.filter((cell) => cell.cellKind === 1 /* Markup */).slice(0, 5).map((cell) => this.createMarkupCellInitialization(cell, -1e4));
      await this._webview.initializeMarkup(initRequests);
      let offset = 0;
      const offsetUpdateRequests = [];
      const scrollBottom = Math.max(this._dimension?.height ?? 0, 1080);
      for (const cell of viewModel.viewCells) {
        if (cell.cellKind === 1 /* Markup */) {
          offsetUpdateRequests.push({ id: cell.id, top: offset });
        }
        offset += cell.getHeight(this.getLayoutInfo().fontInfo.lineHeight);
        if (offset > scrollBottom) {
          break;
        }
      }
      this._webview?.updateScrollTops([], offsetUpdateRequests);
    }
  }
  createMarkupCellInitialization(model, offset) {
    return {
      mime: model.mime,
      cellId: model.id,
      cellHandle: model.handle,
      content: model.getText(),
      offset,
      visible: false,
      metadata: model.metadata
    };
  }
  restoreListViewState(viewState) {
    if (!this.viewModel) {
      return;
    }
    if (viewState?.scrollPosition !== void 0) {
      this._list.scrollTop = viewState.scrollPosition.top;
      this._list.scrollLeft = viewState.scrollPosition.left;
    } else {
      this._list.scrollTop = 0;
      this._list.scrollLeft = 0;
    }
    const focusIdx = typeof viewState?.focus === "number" ? viewState.focus : 0;
    if (focusIdx < this.viewModel.length) {
      const element = this.viewModel.cellAt(focusIdx);
      if (element) {
        this.viewModel?.updateSelectionsState({
          kind: 0 /* Handle */,
          primary: element.handle,
          selections: [element.handle]
        });
      }
    } else if (this._list.length > 0) {
      this.viewModel.updateSelectionsState({
        kind: 1 /* Index */,
        focus: { start: 0, end: 1 },
        selections: [{ start: 0, end: 1 }]
      });
    }
    if (viewState?.editorFocused) {
      const cell = this.viewModel.cellAt(focusIdx);
      if (cell) {
        cell.focusMode = 1 /* Editor */;
      }
    }
  }
  _restoreSelectedKernel(viewState) {
    if (viewState?.selectedKernelId && this.textModel) {
      const matching = this.notebookKernelService.getMatchingKernel(this.textModel);
      const kernel = matching.all.find((k) => k.id === viewState.selectedKernelId);
      if (kernel && !matching.selected) {
        this.notebookKernelService.selectKernelForNotebook(kernel, this.textModel);
      }
    }
  }
  getEditorViewState() {
    const state = this.viewModel?.getEditorViewState();
    if (!state) {
      return {
        editingCells: {},
        cellLineNumberStates: {},
        editorViewStates: {},
        collapsedInputCells: {},
        collapsedOutputCells: {}
      };
    }
    if (this._list) {
      state.scrollPosition = { left: this._list.scrollLeft, top: this._list.scrollTop };
      const cellHeights = {};
      for (let i2 = 0; i2 < this.viewModel.length; i2++) {
        const elm = this.viewModel.cellAt(i2);
        cellHeights[i2] = elm.layoutInfo.totalHeight;
      }
      state.cellTotalHeights = cellHeights;
      if (this.viewModel) {
        const focusRange = this.viewModel.getFocus();
        const element = this.viewModel.cellAt(focusRange.start);
        if (element) {
          const itemDOM = this._list.domElementOfElement(element);
          const editorFocused = element.getEditState() === 1 /* Editing */ && !!(itemDOM && itemDOM.ownerDocument.activeElement && itemDOM.contains(itemDOM.ownerDocument.activeElement));
          state.editorFocused = editorFocused;
          state.focus = focusRange.start;
        }
      }
    }
    const contributionsState = {};
    for (const [id2, contribution] of this._contributions) {
      if (typeof contribution.saveViewState === "function") {
        contributionsState[id2] = contribution.saveViewState();
      }
    }
    state.contributionsState = contributionsState;
    if (this.textModel?.uri.scheme === Schemas.untitled) {
      state.selectedKernelId = this.activeKernel?.id;
    }
    return state;
  }
  _allowScrollBeyondLastLine() {
    return this._scrollBeyondLastLine && !this.isReplHistory;
  }
  getBodyHeight(dimensionHeight) {
    return Math.max(dimensionHeight - (this._notebookTopToolbar?.useGlobalToolbar ? (
      /** Toolbar height */
      26
    ) : 0), 0);
  }
  layout(dimension, shadowElement, position2) {
    if (!shadowElement && !this._shadowElement) {
      this._dimension = dimension;
      return;
    }
    if (dimension.width <= 0 || dimension.height <= 0) {
      this.onWillHide();
      return;
    }
    const whenContainerStylesLoaded = this.layoutService.whenContainerStylesLoaded(getWindow(this.getDomNode()));
    if (whenContainerStylesLoaded) {
      whenContainerStylesLoaded.then(() => this.layoutNotebook(dimension, shadowElement));
    } else {
      this.layoutNotebook(dimension, shadowElement);
    }
  }
  layoutNotebook(dimension, shadowElement) {
    if (shadowElement) {
      this._shadowElement = shadowElement;
    }
    this._dimension = dimension;
    const newBodyHeight = this.getBodyHeight(dimension.height) - this.getLayoutInfo().stickyHeight;
    size(this._body, dimension.width, newBodyHeight);
    const newCellListHeight = newBodyHeight;
    if (this._list.getRenderHeight() < newCellListHeight) {
      this._list.updateOptions({ paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, newCellListHeight - 50) : 0, paddingTop: 0 });
      this._list.layout(newCellListHeight, dimension.width);
    } else {
      this._list.layout(newCellListHeight, dimension.width);
      this._list.updateOptions({ paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, newCellListHeight - 50) : 0, paddingTop: 0 });
    }
    this._overlayContainer.inert = false;
    this.layoutContainerOverShadowElement(shadowElement ?? this._shadowElement);
    if (this._webviewTransparentCover) {
      this._webviewTransparentCover.style.height = `${dimension.height}px`;
      this._webviewTransparentCover.style.width = `${dimension.width}px`;
    }
    this._notebookTopToolbar.layout(this._dimension);
    this._notebookOverviewRuler.layout();
    this._viewContext?.eventDispatcher.emit([new NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
  }
  layoutContainerOverShadowElement(anchorElement) {
    if (!anchorElement) {
      return;
    }
    const modalEditorContainer = this.editorGroupsService.activeModalEditorPart?.modalElement;
    const isModal = isHTMLElement(modalEditorContainer) && modalEditorContainer.contains(anchorElement);
    const clippingContainer = isModal ? void 0 : this.layoutService.getContainer(getWindow(this.getDomNode()), "workbench.parts.editor" /* EDITOR_PART */);
    this._overlayContainer.style.visibility = "visible";
    this._overlayLayout.setAnchorElement(anchorElement, { clippingContainer });
    this._overlayLayout.reapplyLayoutStyles();
  }
  //#endregion
  //#region Focus tracker
  focus() {
    this._isVisible = true;
    this._editorFocus.set(true);
    if (this._webviewFocused) {
      this._webview?.focusWebview();
    } else {
      if (this.viewModel) {
        const focusRange = this.viewModel.getFocus();
        const element = this.viewModel.cellAt(focusRange.start);
        if (!this.hasEditorFocus()) {
          this.focusContainer();
          this.updateEditorFocus();
        }
        if (element && element.focusMode === 1 /* Editor */) {
          element.updateEditState(1 /* Editing */, "editorWidget.focus");
          element.focusMode = 1 /* Editor */;
          this.focusEditor(element);
          return;
        }
      }
      this._list.domFocus();
    }
    if (this._currentProgress) {
      this.showProgress();
    }
  }
  onShow() {
    this._isVisible = true;
  }
  focusEditor(activeElement) {
    for (const [element, editor] of this._renderedEditors.entries()) {
      if (element === activeElement) {
        editor.focus();
        return;
      }
    }
  }
  focusContainer(clearSelection = false) {
    if (this._webviewFocused) {
      this._webview?.focusWebview();
    } else {
      this._list.focusContainer(clearSelection);
    }
  }
  selectOutputContent(cell) {
    this._webview?.selectOutputContents(cell);
  }
  selectInputContents(cell) {
    this._webview?.selectInputContents(cell);
  }
  onWillHide() {
    this._isVisible = false;
    this._editorFocus.set(false);
    this._overlayContainer.inert = true;
    this._overlayContainer.style.visibility = "hidden";
    this._overlayContainer.style.left = "-50000px";
    this._notebookTopToolbarContainer.style.display = "none";
    this.clearActiveCellWidgets();
  }
  clearActiveCellWidgets() {
    this._renderedEditors.forEach((editor, cell) => {
      if (this.getActiveCell() === cell && editor) {
        SuggestController.get(editor)?.cancelSuggestWidget();
        DropIntoEditorController.get(editor)?.clearWidgets();
        CopyPasteController.get(editor)?.clearWidgets();
      }
    });
    this._renderedEditors.forEach((editor, cell) => {
      const controller = InlineCompletionsController.get(editor);
      if (controller?.model.get()?.inlineEditState.get()) {
        editor.render(true);
      }
    });
  }
  editorHasDomFocus() {
    return isAncestorOfActiveElement(this.getDomNode());
  }
  updateEditorFocus() {
    this._focusTracker.refreshState();
    const focused = this.editorHasDomFocus();
    this._editorFocus.set(focused);
    this.viewModel?.setEditorFocus(focused);
  }
  updateCellFocusMode() {
    const activeCell = this.getActiveCell();
    if (activeCell?.focusMode === 2 /* Output */ && !this._webviewFocused) {
      activeCell.focusMode = 0 /* Container */;
    }
  }
  hasEditorFocus() {
    this.updateEditorFocus();
    return this.editorHasDomFocus();
  }
  hasWebviewFocus() {
    return this._webviewFocused;
  }
  hasOutputTextSelection() {
    if (!this.hasEditorFocus()) {
      return false;
    }
    const windowSelection = getWindow(this.getDomNode()).getSelection();
    if (windowSelection?.rangeCount !== 1) {
      return false;
    }
    const activeSelection = windowSelection.getRangeAt(0);
    if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
      return false;
    }
    let container2 = activeSelection.commonAncestorContainer;
    if (!this._body.contains(container2)) {
      return false;
    }
    while (container2 && container2 !== this._body) {
      if (container2.classList && container2.classList.contains("output")) {
        return true;
      }
      container2 = container2.parentNode;
    }
    return false;
  }
  _didFocusOutputInputChange(hasFocus) {
    this._outputInputFocus.set(hasFocus);
  }
  //#endregion
  //#region Editor Features
  focusElement(cell) {
    this.viewModel?.updateSelectionsState({
      kind: 0 /* Handle */,
      primary: cell.handle,
      selections: [cell.handle]
    });
  }
  get scrollTop() {
    return this._list.scrollTop;
  }
  get scrollBottom() {
    return this._list.scrollTop + this._list.getRenderHeight();
  }
  getAbsoluteTopOfElement(cell) {
    return this._list.getCellViewScrollTop(cell);
  }
  getAbsoluteBottomOfElement(cell) {
    return this._list.getCellViewScrollBottom(cell);
  }
  getHeightOfElement(cell) {
    return this._list.elementHeight(cell);
  }
  scrollToBottom() {
    this._list.scrollToBottom();
  }
  setScrollTop(scrollTop) {
    this._list.scrollTop = scrollTop;
  }
  revealCellRangeInView(range2) {
    return this._list.revealCells(range2);
  }
  revealInView(cell) {
    return this._list.revealCell(cell, 1 /* Default */);
  }
  revealInViewAtTop(cell) {
    this._list.revealCell(cell, 2 /* Top */);
  }
  revealInCenter(cell) {
    this._list.revealCell(cell, 3 /* Center */);
  }
  async revealInCenterIfOutsideViewport(cell) {
    await this._list.revealCell(cell, 4 /* CenterIfOutsideViewport */);
  }
  async revealFirstLineIfOutsideViewport(cell) {
    await this._list.revealCell(cell, 6 /* FirstLineIfOutsideViewport */);
  }
  async revealLineInViewAsync(cell, line) {
    return this._list.revealRangeInCell(cell, new Range2(line, 1, line, 1), 1 /* Default */);
  }
  async revealLineInCenterAsync(cell, line) {
    return this._list.revealRangeInCell(cell, new Range2(line, 1, line, 1), 2 /* Center */);
  }
  async revealLineInCenterIfOutsideViewportAsync(cell, line) {
    return this._list.revealRangeInCell(cell, new Range2(line, 1, line, 1), 3 /* CenterIfOutsideViewport */);
  }
  async revealRangeInViewAsync(cell, range2) {
    return this._list.revealRangeInCell(cell, range2, 1 /* Default */);
  }
  async revealRangeInCenterAsync(cell, range2) {
    return this._list.revealRangeInCell(cell, range2, 2 /* Center */);
  }
  async revealRangeInCenterIfOutsideViewportAsync(cell, range2) {
    return this._list.revealRangeInCell(cell, range2, 3 /* CenterIfOutsideViewport */);
  }
  revealCellOffsetInCenter(cell, offset) {
    return this._list.revealCellOffsetInCenter(cell, offset);
  }
  revealOffsetInCenterIfOutsideViewport(offset) {
    return this._list.revealOffsetInCenterIfOutsideViewport(offset);
  }
  getViewIndexByModelIndex(index2) {
    if (!this._listViewInfoAccessor) {
      return -1;
    }
    const cell = this.viewModel?.viewCells[index2];
    if (!cell) {
      return -1;
    }
    return this._listViewInfoAccessor.getViewIndex(cell);
  }
  getViewHeight(cell) {
    if (!this._listViewInfoAccessor) {
      return -1;
    }
    return this._listViewInfoAccessor.getViewHeight(cell);
  }
  getCellRangeFromViewRange(startIndex, endIndex) {
    return this._listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex);
  }
  getCellsInRange(range2) {
    return this._listViewInfoAccessor.getCellsInRange(range2);
  }
  setCellEditorSelection(cell, range2) {
    this._list.setCellEditorSelection(cell, range2);
  }
  setHiddenAreas(_ranges) {
    return this._list.setHiddenAreas(_ranges, true);
  }
  getVisibleRangesPlusViewportAboveAndBelow() {
    return this._listViewInfoAccessor.getVisibleRangesPlusViewportAboveAndBelow();
  }
  //#endregion
  //#region Decorations
  deltaCellDecorations(oldDecorations, newDecorations) {
    const ret = this.viewModel?.deltaCellDecorations(oldDecorations, newDecorations) || [];
    this._onDidChangeDecorations.fire();
    return ret;
  }
  deltaCellContainerClassNames(cellId, added, removed, cellkind) {
    if (cellkind === 1 /* Markup */) {
      this._webview?.deltaMarkupPreviewClassNames(cellId, added, removed);
    } else {
      this._webview?.deltaCellOutputContainerClassNames(cellId, added, removed);
    }
  }
  changeModelDecorations(callback) {
    return this.viewModel?.changeModelDecorations(callback) || null;
  }
  //#endregion
  //#region View Zones
  changeViewZones(callback) {
    this._list.changeViewZones(callback);
    this._onDidChangeLayout.fire();
  }
  getViewZoneLayoutInfo(id2) {
    return this._list.getViewZoneLayoutInfo(id2);
  }
  //#endregion
  //#region Overlay
  changeCellOverlays(callback) {
    this._list.changeCellOverlays(callback);
  }
  //#endregion
  //#region Kernel/Execution
  async _loadKernelPreloads() {
    if (!this.hasModel()) {
      return;
    }
    const { selected } = this.notebookKernelService.getMatchingKernel(this.textModel);
    if (!this._webview?.isResolved()) {
      await this._resolveWebview();
    }
    this._webview?.updateKernelPreloads(selected);
  }
  get activeKernel() {
    return this.textModel && this.notebookKernelService.getSelectedOrSuggestedKernel(this.textModel);
  }
  async cancelNotebookCells(cells) {
    if (!this.viewModel || !this.hasModel()) {
      return;
    }
    if (!cells) {
      cells = this.viewModel.viewCells;
    }
    return this.notebookExecutionService.cancelNotebookCellHandles(this.textModel, Array.from(cells).map((cell) => cell.handle));
  }
  async executeNotebookCells(cells) {
    if (!this.viewModel || !this.hasModel()) {
      this.logService.info("notebookEditorWidget", "No NotebookViewModel, cannot execute cells");
      return;
    }
    if (!cells) {
      cells = this.viewModel.viewCells;
    }
    return this.notebookExecutionService.executeNotebookCells(this.textModel, Array.from(cells).map((c) => c.model), this.scopedContextKeyService);
  }
  //#endregion
  async layoutNotebookCell(cell, height, context2) {
    return this._cellLayoutManager?.layoutNotebookCell(cell, height);
  }
  getActiveCell() {
    const elements = this._list.getFocusedElements();
    if (elements && elements.length) {
      return elements[0];
    }
    return void 0;
  }
  _toggleNotebookCellSelection(selectedCell, selectFromPrevious) {
    const currentSelections = this._list.getSelectedElements();
    const isSelected = currentSelections.includes(selectedCell);
    const previousSelection = selectFromPrevious ? currentSelections[currentSelections.length - 1] ?? selectedCell : selectedCell;
    const selectedIndex = this._list.getViewIndex(selectedCell);
    const previousIndex = this._list.getViewIndex(previousSelection);
    const cellsInSelectionRange = this.getCellsInViewRange(selectedIndex, previousIndex);
    if (isSelected) {
      this._list.selectElements(currentSelections.filter((current) => !cellsInSelectionRange.includes(current)));
    } else {
      this.focusElement(selectedCell);
      this._list.selectElements([...currentSelections.filter((current) => !cellsInSelectionRange.includes(current)), ...cellsInSelectionRange]);
    }
  }
  getCellsInViewRange(fromInclusive, toInclusive) {
    const selectedCellsInRange = [];
    for (let index2 = 0; index2 < this._list.length; ++index2) {
      const cell = this._list.element(index2);
      if (cell) {
        if (index2 >= fromInclusive && index2 <= toInclusive || index2 >= toInclusive && index2 <= fromInclusive) {
          selectedCellsInRange.push(cell);
        }
      }
    }
    return selectedCellsInRange;
  }
  async focusNotebookCell(cell, focusItem, options3) {
    if (this._isDisposed) {
      return;
    }
    cell.focusedOutputId = void 0;
    if (focusItem === "editor") {
      cell.isInputCollapsed = false;
      this.focusElement(cell);
      this._list.focusView();
      cell.updateEditState(1 /* Editing */, "focusNotebookCell");
      cell.focusMode = 1 /* Editor */;
      if (!options3?.skipReveal) {
        if (typeof options3?.focusEditorLine === "number") {
          this._cursorNavMode.set(true);
          await this.revealLineInViewAsync(cell, options3.focusEditorLine);
          const editor = this._renderedEditors.get(cell);
          const focusEditorLine = options3.focusEditorLine;
          editor?.setSelection({
            startLineNumber: focusEditorLine,
            startColumn: 1,
            endLineNumber: focusEditorLine,
            endColumn: 1
          });
        } else {
          const selectionsStartPosition = cell.getSelectionsStartPosition();
          if (selectionsStartPosition?.length) {
            const firstSelectionPosition = selectionsStartPosition[0];
            await this.revealRangeInViewAsync(cell, Range2.fromPositions(firstSelectionPosition, firstSelectionPosition));
          } else {
            await this.revealInView(cell);
          }
        }
      }
    } else if (focusItem === "output") {
      this.focusElement(cell);
      if (!this.hasEditorFocus()) {
        this._list.focusView();
      }
      if (!this._webview) {
        return;
      }
      const firstOutputId = cell.outputsViewModels.find((o) => o.model.alternativeOutputId)?.model.alternativeOutputId;
      const focusElementId = options3?.outputId ?? firstOutputId ?? cell.id;
      this._webview.focusOutput(focusElementId, options3?.altOutputId, options3?.outputWebviewFocused || this._webviewFocused);
      cell.updateEditState(0 /* Preview */, "focusNotebookCell");
      cell.focusMode = 2 /* Output */;
      cell.focusedOutputId = options3?.outputId;
      this._outputFocus.set(true);
      if (!options3?.skipReveal) {
        this.revealInCenterIfOutsideViewport(cell);
      }
    } else {
      const itemDOM = this._list.domElementOfElement(cell);
      if (itemDOM && itemDOM.ownerDocument.activeElement && itemDOM.contains(itemDOM.ownerDocument.activeElement)) {
        itemDOM.ownerDocument.activeElement.blur();
      }
      this._webview?.blurOutput();
      cell.updateEditState(0 /* Preview */, "focusNotebookCell");
      cell.focusMode = 0 /* Container */;
      this.focusElement(cell);
      if (!options3?.skipReveal) {
        if (typeof options3?.focusEditorLine === "number") {
          this._cursorNavMode.set(true);
          await this.revealInView(cell);
        } else if (options3?.revealBehavior === 1 /* firstLine */) {
          await this.revealFirstLineIfOutsideViewport(cell);
        } else if (options3?.revealBehavior === 0 /* fullCell */) {
          await this.revealInView(cell);
        } else {
          await this.revealInCenterIfOutsideViewport(cell);
        }
      }
      this._list.focusView();
      this.updateEditorFocus();
    }
  }
  async focusNextNotebookCell(cell, focusItem) {
    const idx = this.viewModel?.getCellIndex(cell);
    if (typeof idx !== "number") {
      return;
    }
    const newCell = this.viewModel?.cellAt(idx + 1);
    if (!newCell) {
      return;
    }
    await this.focusNotebookCell(newCell, focusItem);
  }
  //#endregion
  //#region Find
  async _warmupCell(viewCell) {
    if (viewCell.isOutputCollapsed) {
      return;
    }
    const outputs = viewCell.outputsViewModels;
    for (const output of outputs.slice(0, outputDisplayLimit)) {
      const [mimeTypes, pick] = output.resolveMimeTypes(this.textModel, void 0);
      if (!mimeTypes.find((mimeType) => mimeType.isTrusted) || mimeTypes.length === 0) {
        continue;
      }
      const pickedMimeTypeRenderer = mimeTypes[pick];
      if (!pickedMimeTypeRenderer) {
        return;
      }
      const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
      if (!renderer) {
        return;
      }
      const result = { type: 1 /* Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
      const inset = this._webview?.insetMapping.get(result.source);
      if (!inset || !inset.initialized) {
        const p = new Promise((resolve3) => {
          this._register(Event2.any(this.onDidRenderOutput, this.onDidRemoveOutput)((e4) => {
            if (e4.model === result.source.model) {
              resolve3();
            }
          }));
        });
        this.createOutput(viewCell, result, 0, false);
        await p;
      } else {
        this.createOutput(viewCell, result, 0, false);
      }
      return;
    }
  }
  async _warmupAll(includeOutput) {
    if (!this.hasModel() || !this.viewModel) {
      return;
    }
    const cells = this.viewModel.viewCells;
    const requests = [];
    for (let i2 = 0; i2 < cells.length; i2++) {
      if (cells[i2].cellKind === 1 /* Markup */ && !this._webview.markupPreviewMapping.has(cells[i2].id)) {
        requests.push(this.createMarkupPreview(cells[i2]));
      }
    }
    if (includeOutput && this._list) {
      for (let i2 = 0; i2 < this._list.length; i2++) {
        const cell = this._list.element(i2);
        if (cell?.cellKind === 2 /* Code */) {
          requests.push(this._warmupCell(cell));
        }
      }
    }
    return Promise.all(requests);
  }
  async _warmupSelection(includeOutput, selectedCellRanges) {
    if (!this.hasModel() || !this.viewModel) {
      return;
    }
    const cells = this.viewModel.viewCells;
    const requests = [];
    for (const range2 of selectedCellRanges) {
      for (let i2 = range2.start; i2 < range2.end; i2++) {
        if (cells[i2].cellKind === 1 /* Markup */ && !this._webview.markupPreviewMapping.has(cells[i2].id)) {
          requests.push(this.createMarkupPreview(cells[i2]));
        }
      }
    }
    if (includeOutput && this._list) {
      for (const range2 of selectedCellRanges) {
        for (let i2 = range2.start; i2 < range2.end; i2++) {
          const cell = this._list.element(i2);
          if (cell?.cellKind === 2 /* Code */) {
            requests.push(this._warmupCell(cell));
          }
        }
      }
    }
    return Promise.all(requests);
  }
  async find(query, options3, token, skipWarmup = false, shouldGetSearchPreviewInfo = false, ownerID) {
    if (!this._notebookViewModel) {
      return [];
    }
    if (!ownerID) {
      ownerID = this.getId();
    }
    const findMatches = this._notebookViewModel.find(query, options3).filter((match2) => match2.length > 0);
    if (!options3.includeMarkupPreview && !options3.includeOutput || options3.findScope?.findScopeType === "text" /* Text */) {
      this._webview?.findStop(ownerID);
      return findMatches;
    }
    const matchMap = {};
    findMatches.forEach((match2) => {
      matchMap[match2.cell.id] = match2;
    });
    if (this._webview) {
      const start = Date.now();
      if (options3.findScope && options3.findScope.findScopeType === "cells" /* Cells */ && options3.findScope.selectedCellRanges) {
        await this._warmupSelection(!!options3.includeOutput, options3.findScope.selectedCellRanges);
      } else {
        await this._warmupAll(!!options3.includeOutput);
      }
      const end = Date.now();
      this.logService.debug("Find", `Warmup time: ${end - start}ms`);
      if (token.isCancellationRequested) {
        return [];
      }
      let findIds = [];
      if (options3.findScope && options3.findScope.findScopeType === "cells" /* Cells */ && options3.findScope.selectedCellRanges) {
        const selectedIndexes = cellRangesToIndexes(options3.findScope.selectedCellRanges);
        findIds = selectedIndexes.map((index2) => this._notebookViewModel?.viewCells[index2].id ?? "");
      }
      const webviewMatches = await this._webview.find(query, { caseSensitive: options3.caseSensitive, wholeWord: options3.wholeWord, includeMarkup: !!options3.includeMarkupPreview, includeOutput: !!options3.includeOutput, shouldGetSearchPreviewInfo, ownerID, findIds });
      if (token.isCancellationRequested) {
        return [];
      }
      webviewMatches.forEach((match2) => {
        const cell = this._notebookViewModel.viewCells.find((cell2) => cell2.id === match2.cellId);
        if (!cell) {
          return;
        }
        if (match2.type === "preview") {
          if (cell.getEditState() === 0 /* Preview */ && !options3.includeMarkupPreview) {
            return;
          }
          if (cell.getEditState() === 1 /* Editing */ && options3.includeMarkupInput) {
            return;
          }
        } else {
          if (!options3.includeOutput) {
            return;
          }
        }
        const exisitingMatch = matchMap[match2.cellId];
        if (exisitingMatch) {
          exisitingMatch.webviewMatches.push(match2);
        } else {
          matchMap[match2.cellId] = new CellFindMatchModel(
            this._notebookViewModel.viewCells.find((cell2) => cell2.id === match2.cellId),
            this._notebookViewModel.viewCells.findIndex((cell2) => cell2.id === match2.cellId),
            [],
            [match2]
          );
        }
      });
    }
    const ret = [];
    this._notebookViewModel.viewCells.forEach((cell, index2) => {
      if (matchMap[cell.id]) {
        ret.push(new CellFindMatchModel(cell, index2, matchMap[cell.id].contentMatches, matchMap[cell.id].webviewMatches));
      }
    });
    return ret;
  }
  async findHighlightCurrent(matchIndex, ownerID) {
    if (!this._webview) {
      return 0;
    }
    return this._webview?.findHighlightCurrent(matchIndex, ownerID ?? this.getId());
  }
  async findUnHighlightCurrent(matchIndex, ownerID) {
    if (!this._webview) {
      return;
    }
    return this._webview?.findUnHighlightCurrent(matchIndex, ownerID ?? this.getId());
  }
  findStop(ownerID) {
    this._webview?.findStop(ownerID ?? this.getId());
  }
  //#endregion
  //#region MISC
  getLayoutInfo() {
    if (!this._list) {
      throw new Error("Editor is not initalized successfully");
    }
    if (!this._fontInfo) {
      this._generateFontInfo();
    }
    let listViewOffset = 0;
    if (this._dimension) {
      listViewOffset = (this._notebookTopToolbar?.useGlobalToolbar ? (
        /** Toolbar height */
        26
      ) : 0) + (this._notebookStickyScroll?.getCurrentStickyHeight() ?? 0);
    }
    return {
      width: this._dimension?.width ?? 0,
      height: this._dimension?.height ?? 0,
      scrollHeight: this._list?.getScrollHeight() ?? 0,
      fontInfo: this._fontInfo,
      stickyHeight: this._notebookStickyScroll?.getCurrentStickyHeight() ?? 0,
      listViewOffsetTop: listViewOffset
    };
  }
  async createMarkupPreview(cell) {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    if (!this._webview || !this._list.webviewElement) {
      return;
    }
    if (!this.viewModel || !this._list.viewModel) {
      return;
    }
    if (this.viewModel.getCellIndex(cell) === -1) {
      return;
    }
    if (this.cellIsHidden(cell)) {
      return;
    }
    const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
    const top2 = !!webviewTop ? 0 - webviewTop : 0;
    const cellTop = this._list.getCellViewScrollTop(cell);
    await this._webview.showMarkupPreview({
      mime: cell.mime,
      cellHandle: cell.handle,
      cellId: cell.id,
      content: cell.getText(),
      offset: cellTop + top2,
      visible: true,
      metadata: cell.metadata
    });
  }
  cellIsHidden(cell) {
    const modelIndex = this.viewModel.getCellIndex(cell);
    const foldedRanges = this.viewModel.getHiddenRanges();
    return foldedRanges.some((range2) => modelIndex >= range2.start && modelIndex <= range2.end);
  }
  async unhideMarkupPreviews(cells) {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    await this._webview?.unhideMarkupPreviews(cells.map((cell) => cell.id));
  }
  async hideMarkupPreviews(cells) {
    if (!this._webview || !cells.length) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    await this._webview?.hideMarkupPreviews(cells.map((cell) => cell.id));
  }
  async deleteMarkupPreviews(cells) {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    await this._webview?.deleteMarkupPreviews(cells.map((cell) => cell.id));
  }
  async updateSelectedMarkdownPreviews() {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    const selectedCells = this.getSelectionViewModels().map((cell) => cell.id);
    await this._webview?.updateMarkupPreviewSelections(selectedCells.length > 1 ? selectedCells : []);
  }
  async createOutput(cell, output, offset, createWhenIdle) {
    this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
      if (this._isDisposed || !this._webview) {
        return;
      }
      if (!this._webview.isResolved()) {
        await this._resolveWebview();
      }
      if (!this._webview) {
        return;
      }
      if (!this._list.webviewElement) {
        return;
      }
      if (output.type === 1 /* Extension */) {
        this.notebookRendererMessaging.prepare(output.renderer.id);
      }
      const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
      const top2 = !!webviewTop ? 0 - webviewTop : 0;
      const cellTop = this._list.getCellViewScrollTop(cell) + top2;
      const existingOutput = this._webview.insetMapping.get(output.source);
      if (!existingOutput || !existingOutput.renderer && output.type === 1 /* Extension */) {
        if (createWhenIdle) {
          this._webview.requestCreateOutputWhenWebviewIdle({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
        } else {
          this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
        }
      } else if (existingOutput.renderer && output.type === 1 /* Extension */ && existingOutput.renderer.id !== output.renderer.id) {
        this._webview.removeInsets([output.source]);
        this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
      } else if (existingOutput.versionId !== output.source.model.versionId) {
        this._webview.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
      } else {
        const outputIndex = cell.outputsViewModels.indexOf(output.source);
        const outputOffset = cell.getOutputOffset(outputIndex);
        this._webview.updateScrollTops([{
          cell,
          output: output.source,
          cellTop,
          outputOffset,
          forceDisplay: !cell.isOutputCollapsed
        }], []);
      }
    });
  }
  async updateOutput(cell, output, offset) {
    this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
      if (this._isDisposed || !this._webview || cell.isOutputCollapsed) {
        return;
      }
      if (!this._webview.isResolved()) {
        await this._resolveWebview();
      }
      if (!this._webview || !this._list.webviewElement) {
        return;
      }
      if (!this._webview.insetMapping.has(output.source)) {
        return this.createOutput(cell, output, offset, false);
      }
      if (output.type === 1 /* Extension */) {
        this.notebookRendererMessaging.prepare(output.renderer.id);
      }
      const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
      const top2 = !!webviewTop ? 0 - webviewTop : 0;
      const cellTop = this._list.getCellViewScrollTop(cell) + top2;
      this._webview.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
    });
  }
  async copyOutputImage(cellOutput) {
    this._webview?.copyImage(cellOutput);
  }
  removeInset(output) {
    this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
      if (this._isDisposed || !this._webview) {
        return;
      }
      if (this._webview?.isResolved()) {
        this._webview.removeInsets([output]);
      }
      this._onDidRemoveOutput.fire(output);
    });
  }
  hideInset(output) {
    this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
      if (this._isDisposed || !this._webview) {
        return;
      }
      if (this._webview?.isResolved()) {
        this._webview.hideInset(output);
      }
    });
  }
  //#region --- webview IPC ----
  postMessage(message) {
    if (this._webview?.isResolved()) {
      this._webview.postKernelMessage(message);
    }
  }
  //#endregion
  addClassName(className2) {
    this._overlayContainer.classList.add(className2);
  }
  removeClassName(className2) {
    this._overlayContainer.classList.remove(className2);
  }
  cellAt(index2) {
    return this.viewModel?.cellAt(index2);
  }
  getCellByInfo(cellInfo) {
    const { cellHandle } = cellInfo;
    return this.viewModel?.viewCells.find((vc) => vc.handle === cellHandle);
  }
  getCellByHandle(handle2) {
    return this.viewModel?.getCellByHandle(handle2);
  }
  getCellIndex(cell) {
    return this.viewModel?.getCellIndexByHandle(cell.handle);
  }
  getNextVisibleCellIndex(index2) {
    return this.viewModel?.getNextVisibleCellIndex(index2);
  }
  getPreviousVisibleCellIndex(index2) {
    return this.viewModel?.getPreviousVisibleCellIndex(index2);
  }
  _updateScrollHeight() {
    if (this._isDisposed || !this._webview?.isResolved()) {
      return;
    }
    if (!this._list.webviewElement) {
      return;
    }
    const scrollHeight = this._list.scrollHeight;
    this._webview.element.style.height = `${scrollHeight + NOTEBOOK_WEBVIEW_BOUNDARY * 2}px`;
    const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
    const top2 = !!webviewTop ? 0 - webviewTop : 0;
    const updateItems = [];
    const removedItems = [];
    this._webview?.insetMapping.forEach((value2, key3) => {
      const cell = this.viewModel?.getCellByHandle(value2.cellInfo.cellHandle);
      if (!cell || !(cell instanceof CodeCellViewModel)) {
        return;
      }
      const viewIndex = this._list.getViewIndex(cell);
      if (viewIndex === void 0) {
        return;
      }
      const outputIndex = cell.outputsViewModels.indexOf(key3);
      if (outputIndex < 0) {
        removedItems.push(key3);
        return;
      }
      const cellTop = this._list.getCellViewScrollTop(cell);
      const outputOffset = cell.getOutputOffset(outputIndex);
      updateItems.push({
        cell,
        output: key3,
        cellTop: cellTop + top2,
        outputOffset,
        forceDisplay: false
      });
    });
    this._webview.removeInsets(removedItems);
    const markdownUpdateItems = [];
    for (const cellId of this._webview.markupPreviewMapping.keys()) {
      const cell = this.viewModel?.viewCells.find((cell2) => cell2.id === cellId);
      if (cell) {
        const cellTop = this._list.getCellViewScrollTop(cell);
        markdownUpdateItems.push({ id: cellId, top: cellTop + top2 });
      }
    }
    if (markdownUpdateItems.length || updateItems.length) {
      this._debug("_list.onDidChangeContentHeight/markdown", markdownUpdateItems);
      this._webview?.updateScrollTops(updateItems, markdownUpdateItems);
    }
  }
  //#endregion
  //#region BacklayerWebview delegate
  _updateOutputHeight(cellInfo, output, outputHeight, isInit, source) {
    const cell = this.viewModel?.viewCells.find((vc) => vc.handle === cellInfo.cellHandle);
    if (cell && cell instanceof CodeCellViewModel) {
      const outputIndex = cell.outputsViewModels.indexOf(output);
      if (outputIndex > -1) {
        this._debug("update cell output", cell.handle, outputHeight);
        cell.updateOutputHeight(outputIndex, outputHeight, source);
        this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
        if (isInit) {
          this._onDidRenderOutput.fire(output);
        }
      } else {
        this._debug("tried to update cell output that does not exist");
      }
    }
  }
  _scheduleOutputHeightAck(cellInfo, outputId, height) {
    const wasEmpty = this._pendingOutputHeightAcks.size === 0;
    this._pendingOutputHeightAcks.set(outputId, { cellId: cellInfo.cellId, outputId, height });
    if (wasEmpty) {
      scheduleAtNextAnimationFrame(getWindow(this.getDomNode()), () => {
        this._debug("ack height");
        this._updateScrollHeight();
        this._webview?.ackHeight([...this._pendingOutputHeightAcks.values()]);
        this._pendingOutputHeightAcks.clear();
      }, -1);
    }
  }
  _getCellById(cellId) {
    return this.viewModel?.viewCells.find((vc) => vc.id === cellId);
  }
  _updateMarkupCellHeight(cellId, height, isInit) {
    const cell = this._getCellById(cellId);
    if (cell && cell instanceof MarkupCellViewModel) {
      const { bottomToolbarGap } = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
      this._debug("updateMarkdownCellHeight", cell.handle, height + bottomToolbarGap, isInit);
      cell.renderedMarkdownHeight = height;
    }
  }
  _setMarkupCellEditState(cellId, editState) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      this.revealInView(cell);
      cell.updateEditState(editState, "setMarkdownCellEditState");
    }
  }
  _didStartDragMarkupCell(cellId, event) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
      this._dndController?.startExplicitDrag(cell, event.dragOffsetY - webviewOffset);
    }
  }
  _didDragMarkupCell(cellId, event) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
      this._dndController?.explicitDrag(cell, event.dragOffsetY - webviewOffset);
    }
  }
  _didDropMarkupCell(cellId, event) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
      event.dragOffsetY -= webviewOffset;
      this._dndController?.explicitDrop(cell, event);
    }
  }
  _didEndDragMarkupCell(cellId) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      this._dndController?.endExplicitDrag(cell);
    }
  }
  _didResizeOutput(cellId) {
    const cell = this._getCellById(cellId);
    if (cell) {
      this._onDidResizeOutputEmitter.fire(cell);
    }
  }
  _updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
    if (!this.hasModel()) {
      return;
    }
    const cell = this._getCellById(cellId);
    const cellIndex = !cell ? void 0 : this.getCellIndex(cell);
    if (cell?.internalMetadata.executionId === executionId && cellIndex !== void 0) {
      const renderDurationMap = cell.internalMetadata.renderDuration || {};
      renderDurationMap[rendererId] = (renderDurationMap[rendererId] ?? 0) + duration;
      this.textModel.applyEdits([
        {
          editType: 9 /* PartialInternalMetadata */,
          index: cellIndex,
          internalMetadata: {
            executionId,
            renderDuration: renderDurationMap
          }
        }
      ], true, void 0, () => void 0, void 0, false);
    }
  }
  //#endregion
  //#region Editor Contributions
  getContribution(id2) {
    return this._contributions.get(id2) || null;
  }
  //#endregion
  dispose() {
    this._isDisposed = true;
    this._webview?.dispose();
    this._webview = null;
    this.notebookEditorService.removeNotebookEditor(this);
    dispose(this._contributions.values());
    this._contributions.clear();
    this._localStore.clear();
    dispose(this._localCellStateListeners);
    this._list.dispose();
    this._cellLayoutManager?.dispose();
    this._listTopCellToolbar?.dispose();
    this._overlayContainer.remove();
    this.viewModel?.dispose();
    this._renderedEditors.clear();
    this._baseCellEditorOptions.forEach((v2) => v2.dispose());
    this._baseCellEditorOptions.clear();
    this._notebookOverviewRulerContainer.remove();
    super.dispose();
    this._webview = null;
    this._webviewResolvePromise = null;
    this._webviewTransparentCover = null;
    this._dndController = null;
    this._listTopCellToolbar = null;
    this._notebookViewModel = void 0;
    this._cellContextKeyManager = null;
    this._notebookTopToolbar = null;
    this._list = null;
    this._listViewInfoAccessor = null;
    this._listDelegate = null;
  }
  toJSON() {
    return {
      notebookUri: this.viewModel?.uri
    };
  }
};

NotebookEditorWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, INotebookRendererMessagingService),
  __decorateParam(5, INotebookEditorService),
  __decorateParam(6, INotebookKernelService),
  __decorateParam(7, INotebookService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IWorkbenchLayoutService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, INotebookExecutionService),
  __decorateParam(14, IEditorProgressService),
  __decorateParam(15, INotebookLoggingService)
], NotebookEditorWidget);

registerZIndex(0 /* Base */, 5, "notebook-progress-bar");

registerZIndex(0 /* Base */, 10, "notebook-list-insertion-indicator");

registerZIndex(0 /* Base */, 20, "notebook-cell-editor-outline");

registerZIndex(0 /* Base */, 25, "notebook-scrollbar");

registerZIndex(0 /* Base */, 26, "notebook-cell-status");

registerZIndex(0 /* Base */, 26, "notebook-folding-indicator");

registerZIndex(0 /* Base */, 27, "notebook-output");

registerZIndex(0 /* Base */, 28, "notebook-cell-bottom-toolbar-container");

registerZIndex(0 /* Base */, 29, "notebook-run-button-container");

registerZIndex(0 /* Base */, 29, "notebook-input-collapse-condicon");

registerZIndex(0 /* Base */, 30, "notebook-cell-output-toolbar");

registerZIndex(35 /* Sash */, 1, "notebook-cell-expand-part-button");

registerZIndex(35 /* Sash */, 2, "notebook-cell-toolbar");

registerZIndex(35 /* Sash */, 3, "notebook-cell-toolbar-dropdown-active");

var notebookCellBorder = registerColor("notebook.cellBorderColor", {
  dark: transparent(listInactiveSelectionBackground, 1),
  light: transparent(listInactiveSelectionBackground, 1),
  hcDark: PANEL_BORDER,
  hcLight: PANEL_BORDER
}, localize(17773, null));

var focusedEditorBorderColor = registerColor("notebook.focusedEditorBorder", focusBorder, localize(17781, null));

var cellStatusIconSuccess = registerColor("notebookStatusSuccessIcon.foreground", debugIconStartForeground, localize(17794, null));

var runningCellRulerDecorationColor = registerColor("notebookEditorOverviewRuler.runningCellForeground", debugIconStartForeground, localize(17788, null));

var cellStatusIconError = registerColor("notebookStatusErrorIcon.foreground", errorForeground, localize(17792, null));

var cellStatusIconRunning = registerColor("notebookStatusRunningIcon.foreground", foreground, localize(17793, null));

var notebookOutputContainerBorderColor = registerColor("notebook.outputContainerBorderColor", null, localize(17785, null));

var notebookOutputContainerColor = registerColor("notebook.outputContainerBackgroundColor", null, localize(17784, null));

var CELL_TOOLBAR_SEPERATOR = registerColor("notebook.cellToolbarSeparator", {
  dark: Color.fromHex("#808080").transparent(0.35),
  light: Color.fromHex("#808080").transparent(0.35),
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(17778, null));

var focusedCellBackground = registerColor("notebook.focusedCellBackground", null, localize(17772, null));

var selectedCellBackground = registerColor("notebook.selectedCellBackground", {
  dark: listInactiveSelectionBackground,
  light: listInactiveSelectionBackground,
  hcDark: null,
  hcLight: null
}, localize(17795, null));

var cellHoverBackground = registerColor("notebook.cellHoverBackground", {
  dark: transparent(focusedCellBackground, 0.5),
  light: transparent(focusedCellBackground, 0.7),
  hcDark: null,
  hcLight: null
}, localize(17775, null));

var selectedCellBorder = registerColor("notebook.selectedCellBorder", {
  dark: notebookCellBorder,
  light: notebookCellBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(17786, null));

var inactiveSelectedCellBorder = registerColor("notebook.inactiveSelectedCellBorder", {
  dark: null,
  light: null,
  hcDark: focusBorder,
  hcLight: focusBorder
}, localize(17783, null));

var focusedCellBorder = registerColor("notebook.focusedCellBorder", focusBorder, localize(17780, null));

var inactiveFocusedCellBorder = registerColor("notebook.inactiveFocusedCellBorder", notebookCellBorder, localize(17782, null));

var cellStatusBarItemHover = registerColor("notebook.cellStatusBarItemHoverBackground", {
  light: new Color(new RGBA(0, 0, 0, 0.08)),
  dark: new Color(new RGBA(255, 255, 255, 0.15)),
  hcDark: new Color(new RGBA(255, 255, 255, 0.15)),
  hcLight: new Color(new RGBA(0, 0, 0, 0.08))
}, localize(17777, null));

var cellInsertionIndicator = registerColor("notebook.cellInsertionIndicator", focusBorder, localize(17776, null));

var listScrollbarSliderBackground = registerColor("notebookScrollbarSlider.background", scrollbarSliderBackground, localize(17790, null));

var listScrollbarSliderHoverBackground = registerColor("notebookScrollbarSlider.hoverBackground", scrollbarSliderHoverBackground, localize(17791, null));

var listScrollbarSliderActiveBackground = registerColor("notebookScrollbarSlider.activeBackground", scrollbarSliderActiveBackground, localize(17789, null));

var cellSymbolHighlight = registerColor("notebook.symbolHighlightBackground", {
  dark: Color.fromHex("#ffffff0b"),
  light: Color.fromHex("#fdff0033"),
  hcDark: null,
  hcLight: null
}, localize(17787, null));

var cellEditorBackground = registerColor("notebook.cellEditorBackground", {
  light: SIDE_BAR_BACKGROUND,
  dark: SIDE_BAR_BACKGROUND,
  hcDark: null,
  hcLight: null
}, localize(17774, null));

var notebookEditorBackground = registerColor("notebook.editorBackground", {
  light: EDITOR_PANE_BACKGROUND,
  dark: EDITOR_PANE_BACKGROUND,
  hcDark: null,
  hcLight: null
}, localize(17779, null));
export { getDefaultNotebookCreationOptions, $33, NotebookEditorWidget, notebookCellBorder, focusedEditorBorderColor, cellStatusIconSuccess, runningCellRulerDecorationColor, cellStatusIconError, cellStatusIconRunning, notebookOutputContainerBorderColor, notebookOutputContainerColor, CELL_TOOLBAR_SEPERATOR, focusedCellBackground, selectedCellBackground, cellHoverBackground, selectedCellBorder, inactiveSelectedCellBorder, focusedCellBorder, inactiveFocusedCellBorder, cellStatusBarItemHover, cellInsertionIndicator, listScrollbarSliderBackground, listScrollbarSliderHoverBackground, listScrollbarSliderActiveBackground, cellSymbolHighlight, cellEditorBackground, notebookEditorBackground };
