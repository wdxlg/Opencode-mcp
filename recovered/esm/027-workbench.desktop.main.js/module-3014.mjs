// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/replNotebook/browser/replEditor.ts
import { EditorPane } from "./module-1089.mjs";
import { REPL_EDITOR_ID } from "./module-0909.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, Dimension, append } from "./module-0075.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { NotebookOptions } from "./module-1951.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { ToolBar } from "./module-0503.mjs";
import { createActionViewItem, getActionBarActions } from "./module-0516.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { deepClone } from "./module-0098.mjs";
import { getSimpleEditorOptions } from "./module-1837.mjs";
import { localize } from "./module-0001.mjs";
import { ReplEditorInput } from "./module-3013.mjs";
import { NotebookEditorExtensionsRegistry } from "./module-1893.mjs";
import { ExecutionStateCellStatusBarContrib, TimerCellStatusBarContrib } from "./module-2440.mjs";
import { NotebookFindContrib } from "./module-2427.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { SelectionClipboardContributionID } from "./module-1361.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { GlyphHoverController } from "./module-0809.mjs";
import { MarkerController } from "./module-0701.mjs";
import { NotebookEditorWidget, getDefaultNotebookCreationOptions } from "./module-1964.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { INTERACTIVE_INPUT_CURSOR_BOUNDARY, ReplEditorSettings } from "./module-3010.mjs";
import { NOTEBOOK_KERNEL } from "./module-1868.mjs";
import { SuggestController } from "./module-0758.mjs";
import { ReplInputHintContentWidget } from "./module-3011.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookEditorService } from "./module-1386.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/replNotebook/browser/replEditor.ts
var INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY2 = "InteractiveEditorViewState";

var INPUT_CELL_VERTICAL_PADDING2 = 8;

var INPUT_CELL_HORIZONTAL_PADDING_RIGHT2 = 10;

var INPUT_EDITOR_PADDING3 = 8;

var ReplEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, notebookWidgetService, contextKeyService, notebookKernelService, languageService, keybindingService, configurationService, menuService, contextMenuService, editorGroupService, textResourceConfigurationService, notebookExecutionStateService, extensionService, _accessibilityService) {
    super(
      REPL_EDITOR_ID,
      group2,
      telemetryService,
      themeService,
      storageService
    );
    this._accessibilityService = _accessibilityService;
    this._notebookWidget = { value: void 0 };
    this._widgetDisposableStore = this._register(new DisposableStore());
    this._groupListener = this._register(new MutableDisposable());
    this._onDidFocusWidget = this._register(new Emitter());
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._onDidChangeScroll = this._register(new Emitter());
    this.onDidChangeScroll = this._onDidChangeScroll.event;
    this._notebookWidgetService = notebookWidgetService;
    this._configurationService = configurationService;
    this._notebookKernelService = notebookKernelService;
    this._languageService = languageService;
    this._keybindingService = keybindingService;
    this._menuService = menuService;
    this._contextMenuService = contextMenuService;
    this._editorGroupService = editorGroupService;
    this._extensionService = extensionService;
    this._rootElement = $(".interactive-editor");
    this._contextKeyService = this._register(contextKeyService.createScoped(this._rootElement));
    this._contextKeyService.createKey("isCompositeNotebook", true);
    this._instantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this._contextKeyService])));
    this._editorOptions = this._computeEditorOptions();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor") || e.affectsConfiguration("notebook")) {
        this._editorOptions = this._computeEditorOptions();
      }
    }));
    this._notebookOptions = instantiationService.createInstance(NotebookOptions, this.window, true, { cellToolbarInteraction: "hover", globalToolbar: true, stickyScrollEnabled: false, dragAndDropEnabled: false, disableRulers: true });
    this._editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY2);
    this._register(this._keybindingService.onDidUpdateKeybindings(this._updateInputHint, this));
    this._register(notebookExecutionStateService.onDidChangeExecution((e) => {
      if (e.type === 0 /* cell */ && isEqual2(e.notebook, this._notebookWidget.value?.viewModel?.notebookDocument.uri)) {
        const cell = this._notebookWidget.value?.getCellByHandle(e.cellHandle);
        if (cell && e.changed?.state) {
          this._scrollIfNecessary(cell);
        }
      }
    }));
  }
  get onDidFocus() {
    return this._onDidFocusWidget.event;
  }
  get inputCellContainerHeight() {
    return 19 + 2 + INPUT_CELL_VERTICAL_PADDING2 * 2 + INPUT_EDITOR_PADDING3 * 2;
  }
  get inputCellEditorHeight() {
    return 19 + INPUT_EDITOR_PADDING3 * 2;
  }
  createEditor(parent) {
    append(parent, this._rootElement);
    this._rootElement.style.position = "relative";
    this._notebookEditorContainer = append(this._rootElement, $(".notebook-editor-container"));
    this._inputCellContainer = append(this._rootElement, $(".input-cell-container"));
    this._inputCellContainer.style.position = "absolute";
    this._inputCellContainer.style.height = `${this.inputCellContainerHeight}px`;
    this._inputFocusIndicator = append(this._inputCellContainer, $(".input-focus-indicator"));
    this._inputRunButtonContainer = append(this._inputCellContainer, $(".run-button-container"));
    this._setupRunButtonToolbar(this._inputRunButtonContainer);
    this._inputEditorContainer = append(this._inputCellContainer, $(".input-editor-container"));
    this._createLayoutStyles();
  }
  _setupRunButtonToolbar(runButtonContainer) {
    const menu = this._register(this._menuService.createMenu(MenuId.ReplInputExecute, this._contextKeyService));
    this._runbuttonToolbar = this._register(new ToolBar(runButtonContainer, this._contextMenuService, {
      getKeyBinding: (action) => this._keybindingService.lookupKeybinding(action.id),
      actionViewItemProvider: (action, options3) => {
        return createActionViewItem(this._instantiationService, action, options3);
      },
      renderDropdownAsChildElement: true
    }));
    const { primary, secondary } = getActionBarActions(menu.getActions({ shouldForwardArgs: true }));
    this._runbuttonToolbar.setActions([...primary, ...secondary]);
  }
  _createLayoutStyles() {
    this._styleElement = createStyleSheet(this._rootElement);
    const styleSheets = [];
    const {
      codeCellLeftMargin,
      cellRunGutter
    } = this._notebookOptions.getLayoutConfiguration();
    const {
      focusIndicator
    } = this._notebookOptions.getDisplayOptions();
    const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
    styleSheets.push(`
			.interactive-editor .input-cell-container {
				padding: ${INPUT_CELL_VERTICAL_PADDING2}px ${INPUT_CELL_HORIZONTAL_PADDING_RIGHT2}px ${INPUT_CELL_VERTICAL_PADDING2}px ${leftMargin}px;
			}
		`);
    if (focusIndicator === "gutter") {
      styleSheets.push(`
				.interactive-editor .input-cell-container:focus-within .input-focus-indicator::before {
					border-color: var(--vscode-notebook-focusedCellBorder) !important;
				}
				.interactive-editor .input-focus-indicator::before {
					border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: block;
					top: ${INPUT_CELL_VERTICAL_PADDING2}px;
				}
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
			`);
    } else {
      styleSheets.push(`
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: none;
				}
			`);
    }
    styleSheets.push(`
			.interactive-editor .input-cell-container .run-button-container {
				width: ${cellRunGutter}px;
				left: ${codeCellLeftMargin}px;
				margin-top: ${INPUT_EDITOR_PADDING3 - 2}px;
			}
		`);
    this._styleElement.textContent = styleSheets.join("\n");
  }
  _computeEditorOptions() {
    let overrideIdentifier = void 0;
    if (this._codeEditorWidget) {
      overrideIdentifier = this._codeEditorWidget.getModel()?.getLanguageId();
    }
    const editorOptions2 = deepClone(this._configurationService.getValue("editor", { overrideIdentifier }));
    const editorOptionsOverride = getSimpleEditorOptions(this._configurationService);
    const computed = Object.freeze({
      ...editorOptions2,
      ...editorOptionsOverride,
      ...{
        ariaLabel: localize(18699, null),
        glyphMargin: true,
        padding: {
          top: INPUT_EDITOR_PADDING3,
          bottom: INPUT_EDITOR_PADDING3
        },
        hover: {
          enabled: "on"
        },
        rulers: []
      }
    });
    return computed;
  }
  saveState() {
    this._saveEditorViewState(this.input);
    super.saveState();
  }
  getViewState() {
    const input = this.input;
    if (!(input instanceof ReplEditorInput)) {
      return void 0;
    }
    this._saveEditorViewState(input);
    return this._loadNotebookEditorViewState(input);
  }
  _saveEditorViewState(input) {
    if (this._notebookWidget.value && input instanceof ReplEditorInput) {
      if (this._notebookWidget.value.isDisposed) {
        return;
      }
      const state = this._notebookWidget.value.getEditorViewState();
      const editorState = this._codeEditorWidget.saveViewState();
      this._editorMemento.saveEditorState(this.group, input.resource, {
        notebook: state,
        input: editorState
      });
    }
  }
  _loadNotebookEditorViewState(input) {
    const result = this._editorMemento.loadEditorState(this.group, input.resource);
    if (result) {
      return result;
    }
    for (const group2 of this._editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
      if (group2.activeEditorPane !== this && group2.activeEditorPane === this && group2.activeEditor?.matches(input)) {
        const notebook = this._notebookWidget.value?.getEditorViewState();
        const input2 = this._codeEditorWidget.saveViewState();
        return {
          notebook,
          input: input2
        };
      }
    }
    return;
  }
  async setInput(input, options3, context2, token) {
    this._notebookWidget.value?.onWillHide();
    this._codeEditorWidget?.dispose();
    this._widgetDisposableStore.clear();
    this._notebookWidget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, this.group.id, input, {
      isReplHistory: true,
      isReadOnly: true,
      contributions: NotebookEditorExtensionsRegistry.getSomeEditorContributions([
        ExecutionStateCellStatusBarContrib.id,
        TimerCellStatusBarContrib.id,
        NotebookFindContrib.id
      ]),
      menuIds: {
        notebookToolbar: MenuId.InteractiveToolbar,
        cellTitleToolbar: MenuId.InteractiveCellTitle,
        cellDeleteToolbar: MenuId.InteractiveCellDelete,
        cellInsertToolbar: MenuId.NotebookCellBetween,
        cellTopInsertToolbar: MenuId.NotebookCellListTop,
        cellExecuteToolbar: MenuId.InteractiveCellExecute,
        cellExecutePrimary: void 0
      },
      cellEditorContributions: EditorExtensionsRegistry.getSomeEditorContributions([
        SelectionClipboardContributionID,
        ContextMenuController.ID,
        ContentHoverController.ID,
        GlyphHoverController.ID,
        MarkerController.ID
      ]),
      options: this._notebookOptions,
      codeWindow: this.window
    }, void 0, this.window);
    const skipContributions = [
      "workbench.notebook.cellToolbar",
      "editor.contrib.inlineCompletionsController"
    ];
    const inputContributions = getDefaultNotebookCreationOptions().cellEditorContributions?.filter((c) => skipContributions.indexOf(c.id) === -1);
    this._codeEditorWidget = this._instantiationService.createInstance(CodeEditorWidget, this._inputEditorContainer, this._editorOptions, {
      ...{
        isSimpleWidget: false,
        contributions: inputContributions
      }
    });
    if (this._lastLayoutDimensions) {
      this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
      this._notebookWidget.value.layout(new Dimension(this._lastLayoutDimensions.dimension.width, this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight), this._notebookEditorContainer);
      const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
      const maxHeight = Math.min(this._lastLayoutDimensions.dimension.height / 2, this.inputCellEditorHeight);
      this._codeEditorWidget.layout(this._validateDimension(this._lastLayoutDimensions.dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT2, maxHeight));
      this._inputFocusIndicator.style.height = `${this.inputCellEditorHeight}px`;
      this._inputCellContainer.style.top = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
      this._inputCellContainer.style.width = `${this._lastLayoutDimensions.dimension.width}px`;
    }
    await super.setInput(input, options3, context2, token);
    const model = await input.resolve();
    if (this._runbuttonToolbar) {
      this._runbuttonToolbar.context = input.resource;
    }
    if (model === null) {
      throw new Error("The REPL model could not be resolved");
    }
    this._notebookWidget.value?.setParentContextKeyService(this._contextKeyService);
    const viewState = options3?.viewState ?? this._loadNotebookEditorViewState(input);
    await this._extensionService.whenInstalledExtensionsRegistered();
    await this._notebookWidget.value.setModel(model.notebook, viewState?.notebook, void 0, "repl");
    model.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault());
    this._notebookWidget.value.setOptions({
      isReadOnly: true
    });
    this._widgetDisposableStore.add(this._notebookWidget.value.onDidResizeOutput((cvm) => {
      this._scrollIfNecessary(cvm);
    }));
    this._widgetDisposableStore.add(this._notebookWidget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
    this._widgetDisposableStore.add(this._notebookOptions.onDidChangeOptions((e) => {
      if (e.compactView || e.focusIndicator) {
        this._styleElement?.remove();
        this._createLayoutStyles();
      }
      if (this._lastLayoutDimensions && this.isVisible()) {
        this.layout(this._lastLayoutDimensions.dimension, this._lastLayoutDimensions.position);
      }
      if (e.interactiveWindowCollapseCodeCells) {
        model.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault());
      }
    }));
    const editorModel = await input.resolveInput(model.notebook);
    this._codeEditorWidget.setModel(editorModel);
    if (viewState?.input) {
      this._codeEditorWidget.restoreViewState(viewState.input);
    }
    this._editorOptions = this._computeEditorOptions();
    this._codeEditorWidget.updateOptions(this._editorOptions);
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidFocusEditorWidget(() => this._onDidFocusWidget.fire()));
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidContentSizeChange((e) => {
      if (!e.contentHeightChanged) {
        return;
      }
      if (this._lastLayoutDimensions) {
        this._layoutWidgets(this._lastLayoutDimensions.dimension, this._lastLayoutDimensions.position);
      }
    }));
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition((e) => this._onDidChangeSelection.fire({ reason: this._toEditorPaneSelectionChangeReason(e) })));
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EDIT */ })));
    this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeNotebookAffinity(this._syncWithKernel, this));
    this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeSelectedNotebooks(this._syncWithKernel, this));
    this._widgetDisposableStore.add(this.themeService.onDidColorThemeChange(() => {
      if (this.isVisible()) {
        this._updateInputHint();
      }
    }));
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(() => {
      if (this.isVisible()) {
        this._updateInputHint();
      }
    }));
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelDecorations(() => {
      if (this.isVisible()) {
        this._updateInputHint();
      }
    }));
    const cursorAtBoundaryContext = INTERACTIVE_INPUT_CURSOR_BOUNDARY.bindTo(this._contextKeyService);
    if (input.resource && input.historyService.has(input.resource)) {
      cursorAtBoundaryContext.set("top");
    } else {
      cursorAtBoundaryContext.set("none");
    }
    this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(({ position: position2 }) => {
      const viewModel = this._codeEditorWidget._getViewModel();
      const lastLineNumber = viewModel.getLineCount();
      const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
      const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position2);
      const firstLine3 = viewPosition.lineNumber === 1 && viewPosition.column === 1;
      const lastLine = viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol;
      if (firstLine3) {
        if (lastLine) {
          cursorAtBoundaryContext.set("both");
        } else {
          cursorAtBoundaryContext.set("top");
        }
      } else {
        if (lastLine) {
          cursorAtBoundaryContext.set("bottom");
        } else {
          cursorAtBoundaryContext.set("none");
        }
      }
    }));
    this._widgetDisposableStore.add(editorModel.onDidChangeContent(() => {
      const value2 = editorModel.getValue();
      if (this.input?.resource && value2 !== "") {
        const historyService = this.input.historyService;
        if (!historyService.matchesCurrent(this.input.resource, value2)) {
          historyService.replaceLast(this.input.resource, value2);
        }
      }
    }));
    this._widgetDisposableStore.add(this._notebookWidget.value.onDidScroll(() => this._onDidChangeScroll.fire()));
    this._widgetDisposableStore.add(this._notebookWidget.value.onDidChangeViewCells(this.handleViewCellChange, this));
    this._updateInputHint();
    this._syncWithKernel();
  }
  handleViewCellChange(e) {
    const notebookWidget = this._notebookWidget.value;
    if (!notebookWidget) {
      return;
    }
    for (const splice3 of e.splices) {
      const [_start, _delete, addedCells] = splice3;
      if (addedCells.length) {
        const viewModel = notebookWidget.viewModel;
        if (viewModel) {
          this.handleAppend(notebookWidget, viewModel);
          break;
        }
      }
    }
  }
  handleAppend(notebookWidget, viewModel) {
    this._notebookWidgetService.updateReplContextKey(viewModel.notebookDocument.uri.toString());
    const navigateToCell = this._configurationService.getValue("accessibility.replEditor.autoFocusReplExecution");
    if (this._accessibilityService.isScreenReaderOptimized()) {
      if (navigateToCell === "lastExecution") {
        setTimeout(() => {
          const lastCellIndex = viewModel.length - 1;
          if (lastCellIndex >= 0) {
            const cell = viewModel.viewCells[lastCellIndex];
            notebookWidget.focusNotebookCell(cell, "container");
          }
        }, 0);
      } else if (navigateToCell === "input") {
        this._codeEditorWidget.focus();
      }
    }
  }
  setOptions(options3) {
    this._notebookWidget.value?.setOptions(options3);
    super.setOptions(options3);
  }
  _toEditorPaneSelectionChangeReason(e) {
    switch (e.source) {
      case "api" /* PROGRAMMATIC */:
        return 1 /* PROGRAMMATIC */;
      case "code.navigation" /* NAVIGATION */:
        return 4 /* NAVIGATION */;
      case "code.jump" /* JUMP */:
        return 5 /* JUMP */;
      default:
        return 2 /* USER */;
    }
  }
  _cellAtBottom(cell) {
    const visibleRanges = this._notebookWidget.value?.visibleRanges || [];
    const cellIndex = this._notebookWidget.value?.getCellIndex(cell);
    if (cellIndex === Math.max(...visibleRanges.map((range2) => range2.end - 1))) {
      return true;
    }
    return false;
  }
  _scrollIfNecessary(cvm) {
    const index2 = this._notebookWidget.value.getCellIndex(cvm);
    if (index2 === this._notebookWidget.value.getLength() - 1) {
      if (this._configurationService.getValue(ReplEditorSettings.interactiveWindowAlwaysScrollOnNewCell) || this._cellAtBottom(cvm)) {
        this._notebookWidget.value.scrollToBottom();
      }
    }
  }
  _syncWithKernel() {
    const notebook = this._notebookWidget.value?.textModel;
    const textModel = this._codeEditorWidget.getModel();
    if (notebook && textModel) {
      const info = this._notebookKernelService.getMatchingKernel(notebook);
      const selectedOrSuggested = info.selected ?? (info.suggestions.length === 1 ? info.suggestions[0] : void 0) ?? (info.all.length === 1 ? info.all[0] : void 0);
      if (selectedOrSuggested) {
        const language2 = selectedOrSuggested.supportedLanguages[0];
        if (language2 && language2 !== "plaintext") {
          const newMode = this._languageService.createById(language2).languageId;
          textModel.setLanguage(newMode);
        }
        NOTEBOOK_KERNEL.bindTo(this._contextKeyService).set(selectedOrSuggested.id);
      }
    }
  }
  layout(dimension, position2) {
    this._rootElement.classList.toggle("mid-width", dimension.width < 1e3 && dimension.width >= 600);
    this._rootElement.classList.toggle("narrow-width", dimension.width < 600);
    const editorHeightChanged = dimension.height !== this._lastLayoutDimensions?.dimension.height;
    this._lastLayoutDimensions = { dimension, position: position2 };
    if (!this._notebookWidget.value) {
      return;
    }
    if (editorHeightChanged && this._codeEditorWidget) {
      SuggestController.get(this._codeEditorWidget)?.cancelSuggestWidget();
    }
    this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
    this._layoutWidgets(dimension, position2);
  }
  _layoutWidgets(dimension, position2) {
    const contentHeight = this._codeEditorWidget.hasModel() ? this._codeEditorWidget.getContentHeight() : this.inputCellEditorHeight;
    const maxHeight = Math.min(dimension.height / 2, contentHeight);
    const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
    const inputCellContainerHeight = maxHeight + INPUT_CELL_VERTICAL_PADDING2 * 2;
    this._notebookEditorContainer.style.height = `${dimension.height - inputCellContainerHeight}px`;
    this._notebookWidget.value.layout(dimension.with(dimension.width, dimension.height - inputCellContainerHeight), this._notebookEditorContainer, position2);
    this._codeEditorWidget.layout(this._validateDimension(dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT2, maxHeight));
    this._inputFocusIndicator.style.height = `${contentHeight}px`;
    this._inputCellContainer.style.top = `${dimension.height - inputCellContainerHeight}px`;
    this._inputCellContainer.style.width = `${dimension.width}px`;
  }
  _validateDimension(width2, height) {
    return new Dimension(Math.max(0, width2), Math.max(0, height));
  }
  _hasConflictingDecoration() {
    return Boolean(this._codeEditorWidget.getLineDecorations(1)?.find(
      (d) => d.options.beforeContentClassName || d.options.afterContentClassName || d.options.before?.content || d.options.after?.content
    ));
  }
  _updateInputHint() {
    if (!this._codeEditorWidget) {
      return;
    }
    const shouldHide2 = !this._codeEditorWidget.hasModel() || this._configurationService.getValue(ReplEditorSettings.showExecutionHint) === false || this._codeEditorWidget.getModel().getValueLength() !== 0 || this._hasConflictingDecoration();
    if (!this._hintElement && !shouldHide2) {
      this._hintElement = this._instantiationService.createInstance(ReplInputHintContentWidget, this._codeEditorWidget);
    } else if (this._hintElement && shouldHide2) {
      this._hintElement.dispose();
      this._hintElement = void 0;
    }
  }
  getScrollPosition() {
    return {
      scrollTop: this._notebookWidget.value?.scrollTop ?? 0,
      scrollLeft: 0
    };
  }
  setScrollPosition(position2) {
    this._notebookWidget.value?.setScrollTop(position2.scrollTop);
  }
  focus() {
    super.focus();
    this._notebookWidget.value?.onShow();
    this._codeEditorWidget.focus();
  }
  focusHistory() {
    this._notebookWidget.value.focus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this._groupListener.value = this.group.onWillCloseEditor((e) => this._saveEditorViewState(e.editor));
    if (!visible) {
      this._saveEditorViewState(this.input);
      if (this.input && this._notebookWidget.value) {
        this._notebookWidget.value.onWillHide();
      }
    }
    this._updateInputHint();
  }
  clearInput() {
    if (this._notebookWidget.value) {
      this._saveEditorViewState(this.input);
      this._notebookWidget.value.onWillHide();
    }
    this._codeEditorWidget?.dispose();
    this._notebookWidget = { value: void 0 };
    this._widgetDisposableStore.clear();
    super.clearInput();
  }
  getControl() {
    return {
      notebookEditor: this._notebookWidget.value,
      activeCodeEditor: this.getActiveCodeEditor(),
      onDidChangeActiveEditor: Event2.None
    };
  }
  getActiveCodeEditor() {
    if (!this._codeEditorWidget) {
      return void 0;
    }
    return this._codeEditorWidget.hasWidgetFocus() || !this._notebookWidget.value?.activeCodeEditor ? this._codeEditorWidget : this._notebookWidget.value.activeCodeEditor;
  }
};

ReplEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, INotebookEditorService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, INotebookKernelService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IMenuService),
  __decorateParam(12, IContextMenuService),
  __decorateParam(13, IEditorGroupsService),
  __decorateParam(14, ITextResourceConfigurationService),
  __decorateParam(15, INotebookExecutionStateService),
  __decorateParam(16, IExtensionService),
  __decorateParam(17, IAccessibilityService)
], ReplEditor);

function isReplEditorControl(control) {
  const candidate = control;
  return candidate?.activeCodeEditor instanceof CodeEditorWidget && candidate?.notebookEditor instanceof NotebookEditorWidget;
}
export { isReplEditorControl, INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY2, INPUT_CELL_VERTICAL_PADDING2, INPUT_CELL_HORIZONTAL_PADDING_RIGHT2, INPUT_EDITOR_PADDING3, ReplEditor };
