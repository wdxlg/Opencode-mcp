// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/searchEditor/browser/searchEditor.ts
import { AbstractTextCodeEditor } from "./module-1542.mjs";
import { Delayer } from "./module-0036.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getTotalHeight } from "./module-0075.mjs";
import { IEditorProgressService, LongRunningOperation } from "./module-0446.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { SearchModelImpl } from "./module-2942.mjs";
import { InSearchEditor, SearchEditorID, SearchEditorInputTypeId } from "./module-2808.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { SearchContext } from "./module-1261.mjs";
import { defaultToggleStyles, getInputBoxStyle } from "./module-0513.mjs";
import { SearchWidget2 } from "./module-2813.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { searchDetailsIcon } from "./module-2804.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ExcludePatternInputWidget, IncludePatternInputWidget } from "./module-2803.mjs";
import { UnusualLineTerminatorsDetector } from "./module-0856.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { Position } from "./module-0079.mjs";
import { alert } from "./module-0076.mjs";
import { getOutOfWorkspaceEditorResources } from "./module-1216.mjs";
import { QueryBuilder } from "./module-1311.mjs";
import { ReferencesController } from "./module-0644.mjs";
import { serializeSearchResultForEditor } from "./module-2816.mjs";
import { renderSearchMessage } from "./module-2805.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IModelService } from "./module-0080.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { IHoverService } from "./module-0520.mjs";
import { registerColor } from "./module-0226.mjs";
import { inputBorder } from "./module-0233.mjs";


// src/vs/workbench/contrib/searchEditor/browser/searchEditor.ts
var RESULT_LINE_REGEX = /^(\s+)(\d+)(: |  )(\s*)(.*)$/;

var FILE_LINE_REGEX = /^(\S.*):$/;

var SearchEditor = class extends AbstractTextCodeEditor {
  constructor(group2, telemetryService, themeService, storageService, modelService, contextService, labelService, instantiationService, contextViewService, commandService, openerService, notificationService, progressService, textResourceService, editorGroupService, editorService, configurationService, fileService, logService, hoverService) {
    super(SearchEditor.ID, group2, telemetryService, instantiationService, storageService, textResourceService, themeService, editorService, editorGroupService, fileService);
    this.modelService = modelService;
    this.contextService = contextService;
    this.labelService = labelService;
    this.contextViewService = contextViewService;
    this.commandService = commandService;
    this.openerService = openerService;
    this.notificationService = notificationService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.hoverService = hoverService;
    this.runSearchDelayer = this._register(new Delayer(0));
    this.pauseSearching = false;
    this.showingIncludesExcludes = false;
    this.ongoingOperations = 0;
    this.updatingModelForSearch = false;
    this.container = $(".search-editor");
    this.searchOperation = this._register(new LongRunningOperation(progressService));
    this._register(this.messageDisposables = new DisposableStore());
    this.searchHistoryDelayer = this._register(new Delayer(2e3));
    this.searchModel = this._register(this.instantiationService.createInstance(SearchModelImpl));
  }
  static {
    this.ID = SearchEditorID;
  }
  static {
    this.SEARCH_EDITOR_VIEW_STATE_PREFERENCE_KEY = "searchEditorViewState";
  }
  get searchResultEditor() {
    return this.editorControl;
  }
  createEditor(parent) {
    append(parent, this.container);
    this.queryEditorContainer = append(this.container, $(".query-container"));
    const searchResultContainer = append(this.container, $(".search-results"));
    super.createEditor(searchResultContainer);
    this.registerEditorListeners();
    const scopedContextKeyService = assertReturnsDefined(this.scopedContextKeyService);
    InSearchEditor.bindTo(scopedContextKeyService).set(true);
    this.createQueryEditor(
      this.queryEditorContainer,
      this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService]))),
      SearchContext.InputBoxFocusedKey.bindTo(scopedContextKeyService)
    );
  }
  createQueryEditor(container2, scopedInstantiationService, inputBoxFocusedContextKey) {
    const searchEditorInputboxStyles = getInputBoxStyle({ inputBorder: searchEditorTextInputBorder });
    this.queryEditorWidget = this._register(scopedInstantiationService.createInstance(SearchWidget2, container2, { _hideReplaceToggle: true, showContextToggle: true, inputBoxStyles: searchEditorInputboxStyles, toggleStyles: defaultToggleStyles }));
    this._register(this.queryEditorWidget.onReplaceToggled(() => this.reLayout()));
    this._register(this.queryEditorWidget.onDidHeightChange(() => this.reLayout()));
    this._register(this.queryEditorWidget.onSearchSubmit(({ delay }) => this.triggerSearch({ delay })));
    if (this.queryEditorWidget.searchInput) {
      this._register(this.queryEditorWidget.searchInput.onDidOptionChange(() => this.triggerSearch({ resetCursor: false })));
    } else {
      this.logService.warn("SearchEditor: SearchWidget.searchInput is undefined, cannot register onDidOptionChange listener");
    }
    this._register(this.queryEditorWidget.onDidToggleContext(() => this.triggerSearch({ resetCursor: false })));
    this.includesExcludesContainer = append(container2, $(".includes-excludes"));
    const toggleQueryDetailsLabel = localize(19262, null);
    this.toggleQueryDetailsButton = append(this.includesExcludesContainer, $(".expand" + ThemeIcon.asCSSSelector(searchDetailsIcon), { tabindex: 0, role: "button", "aria-label": toggleQueryDetailsLabel }));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.toggleQueryDetailsButton, toggleQueryDetailsLabel));
    this._register(addDisposableListener(this.toggleQueryDetailsButton, EventType.CLICK, (e4) => {
      EventHelper.stop(e4);
      this.toggleIncludesExcludes();
    }));
    this._register(addDisposableListener(this.toggleQueryDetailsButton, EventType.KEY_UP, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e4);
        this.toggleIncludesExcludes();
      }
    }));
    this._register(addDisposableListener(this.toggleQueryDetailsButton, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(1024 /* Shift */ | 2 /* Tab */)) {
        if (this.queryEditorWidget.isReplaceActive()) {
          this.queryEditorWidget.focusReplaceAllAction();
        } else {
          this.queryEditorWidget.isReplaceShown() ? this.queryEditorWidget.replaceInput?.focusOnPreserve() : this.queryEditorWidget.focusRegexAction();
        }
        EventHelper.stop(e4);
      }
    }));
    const folderIncludesList = append(this.includesExcludesContainer, $(".file-types.includes"));
    const filesToIncludeTitle = localize(19267, null);
    append(folderIncludesList, $("h4", void 0, filesToIncludeTitle));
    this.inputPatternIncludes = this._register(scopedInstantiationService.createInstance(IncludePatternInputWidget, folderIncludesList, this.contextViewService, {
      ariaLabel: localize(19261, null),
      inputBoxStyles: searchEditorInputboxStyles
    }));
    this._register(this.inputPatternIncludes.onSubmit((triggeredOnType) => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.searchConfig.searchOnTypeDebouncePeriod : 0 })));
    this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(() => this.triggerSearch()));
    const excludesList = append(this.includesExcludesContainer, $(".file-types.excludes"));
    const excludesTitle = localize(19266, null);
    append(excludesList, $("h4", void 0, excludesTitle));
    this.inputPatternExcludes = this._register(scopedInstantiationService.createInstance(ExcludePatternInputWidget, excludesList, this.contextViewService, {
      ariaLabel: localize(19260, null),
      inputBoxStyles: searchEditorInputboxStyles
    }));
    this._register(this.inputPatternExcludes.onSubmit((triggeredOnType) => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.searchConfig.searchOnTypeDebouncePeriod : 0 })));
    this._register(this.inputPatternExcludes.onChangeIgnoreBox(() => this.triggerSearch()));
    this.messageBox = append(container2, $(".messages.text-search-provider-messages"));
    [this.queryEditorWidget.searchInputFocusTracker, this.queryEditorWidget.replaceInputFocusTracker, this.inputPatternExcludes.inputFocusTracker, this.inputPatternIncludes.inputFocusTracker].forEach((tracker2) => {
      if (!tracker2) {
        return;
      }
      this._register(tracker2.onDidFocus(() => setTimeout(() => inputBoxFocusedContextKey.set(true), 0)));
      this._register(tracker2.onDidBlur(() => inputBoxFocusedContextKey.set(false)));
    });
  }
  toggleRunAgainMessage(show3) {
    clearNode(this.messageBox);
    this.messageDisposables.clear();
    if (show3) {
      const runAgainLink = append(this.messageBox, $("a.pointer.prominent.message", {}, localize(19263, null)));
      this.messageDisposables.add(addDisposableListener(runAgainLink, EventType.CLICK, async () => {
        await this.triggerSearch();
        this.searchResultEditor.focus();
      }));
    }
  }
  _getContributions() {
    const skipContributions = [UnusualLineTerminatorsDetector.ID];
    return EditorExtensionsRegistry.getEditorContributions().filter((c) => skipContributions.indexOf(c.id) === -1);
  }
  getCodeEditorWidgetOptions() {
    return { contributions: this._getContributions() };
  }
  registerEditorListeners() {
    this._register(this.searchResultEditor.onMouseUp((e4) => {
      if (e4.event.detail === 1) {
        const behaviour = this.searchConfig.searchEditor.singleClickBehaviour;
        const position2 = e4.target.position;
        if (position2 && behaviour === "peekDefinition") {
          const line = this.searchResultEditor.getModel()?.getLineContent(position2.lineNumber) ?? "";
          if (line.match(FILE_LINE_REGEX) || line.match(RESULT_LINE_REGEX)) {
            this.searchResultEditor.setSelection(Range2.fromPositions(position2));
            this.commandService.executeCommand("editor.action.peekDefinition");
          }
        }
      } else if (e4.event.detail === 2) {
        const behaviour = this.searchConfig.searchEditor.doubleClickBehaviour;
        const position2 = e4.target.position;
        if (position2 && behaviour !== "selectWord") {
          const line = this.searchResultEditor.getModel()?.getLineContent(position2.lineNumber) ?? "";
          if (line.match(RESULT_LINE_REGEX)) {
            this.searchResultEditor.setSelection(Range2.fromPositions(position2));
            this.commandService.executeCommand(behaviour === "goToLocation" ? "editor.action.goToDeclaration" : "editor.action.openDeclarationToTheSide");
          } else if (line.match(FILE_LINE_REGEX)) {
            this.searchResultEditor.setSelection(Range2.fromPositions(position2));
            this.commandService.executeCommand("editor.action.peekDefinition");
          }
        }
      }
    }));
    this._register(this.searchResultEditor.onDidChangeModelContent(() => {
      if (!this.updatingModelForSearch) {
        this.getInput()?.setDirty(true);
      }
    }));
  }
  getControl() {
    return this.searchResultEditor;
  }
  focus() {
    super.focus();
    const viewState = this.loadEditorViewState(this.getInput());
    if (viewState && viewState.focused === "editor") {
      this.searchResultEditor.focus();
    } else {
      this.queryEditorWidget.focus();
    }
  }
  focusSearchInput() {
    this.queryEditorWidget.searchInput?.focus();
  }
  focusFilesToIncludeInput() {
    if (!this.showingIncludesExcludes) {
      this.toggleIncludesExcludes(true);
    }
    this.inputPatternIncludes.focus();
  }
  focusFilesToExcludeInput() {
    if (!this.showingIncludesExcludes) {
      this.toggleIncludesExcludes(true);
    }
    this.inputPatternExcludes.focus();
  }
  focusNextInput() {
    if (this.queryEditorWidget.searchInputHasFocus()) {
      if (this.showingIncludesExcludes) {
        this.inputPatternIncludes.focus();
      } else {
        this.searchResultEditor.focus();
      }
    } else if (this.inputPatternIncludes.inputHasFocus()) {
      this.inputPatternExcludes.focus();
    } else if (this.inputPatternExcludes.inputHasFocus()) {
      this.searchResultEditor.focus();
    } else if (this.searchResultEditor.hasWidgetFocus()) {
    }
  }
  focusPrevInput() {
    if (this.queryEditorWidget.searchInputHasFocus()) {
      this.searchResultEditor.focus();
    } else if (this.inputPatternIncludes.inputHasFocus()) {
      this.queryEditorWidget.searchInput?.focus();
    } else if (this.inputPatternExcludes.inputHasFocus()) {
      this.inputPatternIncludes.focus();
    } else if (this.searchResultEditor.hasWidgetFocus()) {
    }
  }
  setQuery(query) {
    this.queryEditorWidget.searchInput?.setValue(query);
  }
  selectQuery() {
    this.queryEditorWidget.searchInput?.select();
  }
  toggleWholeWords() {
    this.queryEditorWidget.searchInput?.setWholeWords(!this.queryEditorWidget.searchInput.getWholeWords());
    this.triggerSearch({ resetCursor: false });
  }
  toggleRegex() {
    this.queryEditorWidget.searchInput?.setRegex(!this.queryEditorWidget.searchInput.getRegex());
    this.triggerSearch({ resetCursor: false });
  }
  toggleCaseSensitive() {
    this.queryEditorWidget.searchInput?.setCaseSensitive(!this.queryEditorWidget.searchInput.getCaseSensitive());
    this.triggerSearch({ resetCursor: false });
  }
  toggleContextLines() {
    this.queryEditorWidget.toggleContextLines();
  }
  modifyContextLines(increase) {
    this.queryEditorWidget.modifyContextLines(increase);
  }
  toggleQueryDetails(shouldShow) {
    this.toggleIncludesExcludes(shouldShow);
  }
  deleteResultBlock() {
    const linesToDelete = /* @__PURE__ */ new Set();
    const selections = this.searchResultEditor.getSelections();
    const model = this.searchResultEditor.getModel();
    if (!(selections && model)) {
      return;
    }
    const maxLine = model.getLineCount();
    const minLine = 1;
    const deleteUp = (start) => {
      for (let cursor = start; cursor >= minLine; cursor--) {
        const line = model.getLineContent(cursor);
        linesToDelete.add(cursor);
        if (line[0] !== void 0 && line[0] !== " ") {
          break;
        }
      }
    };
    const deleteDown = (start) => {
      linesToDelete.add(start);
      for (let cursor = start + 1; cursor <= maxLine; cursor++) {
        const line = model.getLineContent(cursor);
        if (line[0] !== void 0 && line[0] !== " ") {
          return cursor;
        }
        linesToDelete.add(cursor);
      }
      return;
    };
    const endingCursorLines = [];
    for (const selection of selections) {
      const lineNumber = selection.startLineNumber;
      endingCursorLines.push(deleteDown(lineNumber));
      deleteUp(lineNumber);
      for (let inner = selection.startLineNumber; inner <= selection.endLineNumber; inner++) {
        linesToDelete.add(inner);
      }
    }
    if (endingCursorLines.length === 0) {
      endingCursorLines.push(1);
    }
    const isDefined3 = (x) => x !== void 0;
    model.pushEditOperations(
      this.searchResultEditor.getSelections(),
      [...linesToDelete].map((line) => ({ range: new Range2(line, 1, line + 1, 1), text: "" })),
      () => endingCursorLines.filter(isDefined3).map((line) => new Selection(line, 1, line, 1))
    );
  }
  cleanState() {
    this.getInput()?.setDirty(false);
  }
  get searchConfig() {
    return this.configurationService.getValue("search");
  }
  iterateThroughMatches(reverse) {
    const model = this.searchResultEditor.getModel();
    if (!model) {
      return;
    }
    const lastLine = model.getLineCount() ?? 1;
    const lastColumn = model.getLineLength(lastLine);
    const fallbackStart = reverse ? new Position(lastLine, lastColumn) : new Position(1, 1);
    const currentPosition = this.searchResultEditor.getSelection()?.getStartPosition() ?? fallbackStart;
    const matchRanges = this.getInput()?.getMatchRanges();
    if (!matchRanges) {
      return;
    }
    const matchRange = (reverse ? findPrevRange : findNextRange)(matchRanges, currentPosition);
    if (!matchRange) {
      return;
    }
    this.searchResultEditor.setSelection(matchRange);
    this.searchResultEditor.revealLineInCenterIfOutsideViewport(matchRange.startLineNumber);
    this.searchResultEditor.focus();
    const matchLineText = model.getLineContent(matchRange.startLineNumber);
    const matchText = model.getValueInRange(matchRange);
    let file = "";
    for (let line = matchRange.startLineNumber; line >= 1; line--) {
      const lineText = model.getValueInRange(new Range2(line, 1, line, 2));
      if (lineText !== " ") {
        file = model.getLineContent(line);
        break;
      }
    }
    alert(localize(19265, null, matchText, matchLineText, file.slice(0, file.length - 1)));
  }
  focusNextResult() {
    this.iterateThroughMatches(false);
  }
  focusPreviousResult() {
    this.iterateThroughMatches(true);
  }
  focusAllResults() {
    this.searchResultEditor.setSelections((this.getInput()?.getMatchRanges() ?? []).map(
      (range2) => new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn)
    ));
    this.searchResultEditor.focus();
  }
  async triggerSearch(_options) {
    const focusResults = this.searchConfig.searchEditor.focusResultsOnSearch;
    if (_options === void 0) {
      _options = { focusResults };
    } else if (_options.focusResults === void 0) {
      _options.focusResults = focusResults;
    }
    const options3 = { resetCursor: true, delay: 0, ..._options };
    if (!this.queryEditorWidget.searchInput?.inputBox.isInputValid()) {
      return;
    }
    if (!this.pauseSearching) {
      await this.runSearchDelayer.trigger(async () => {
        this.toggleRunAgainMessage(false);
        await this.doRunSearch();
        if (options3.resetCursor) {
          this.searchResultEditor.setPosition(new Position(1, 1));
          this.searchResultEditor.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
        }
        if (options3.focusResults) {
          this.searchResultEditor.focus();
        }
      }, options3.delay);
    }
  }
  readConfigFromWidget() {
    return {
      isCaseSensitive: this.queryEditorWidget.searchInput?.getCaseSensitive() ?? false,
      contextLines: this.queryEditorWidget.getContextLines(),
      filesToExclude: this.inputPatternExcludes.getValue(),
      filesToInclude: this.inputPatternIncludes.getValue(),
      query: this.queryEditorWidget.searchInput?.getValue() ?? "",
      isRegexp: this.queryEditorWidget.searchInput?.getRegex() ?? false,
      matchWholeWord: this.queryEditorWidget.searchInput?.getWholeWords() ?? false,
      useExcludeSettingsAndIgnoreFiles: this.inputPatternExcludes.useExcludesAndIgnoreFiles(),
      onlyOpenEditors: this.inputPatternIncludes.onlySearchInOpenEditors(),
      showIncludesExcludes: this.showingIncludesExcludes,
      notebookSearchConfig: {
        includeMarkupInput: this.queryEditorWidget.getNotebookFilters().markupInput,
        includeMarkupPreview: this.queryEditorWidget.getNotebookFilters().markupPreview,
        includeCodeInput: this.queryEditorWidget.getNotebookFilters().codeInput,
        includeOutput: this.queryEditorWidget.getNotebookFilters().codeOutput
      }
    };
  }
  async doRunSearch() {
    this.searchModel.cancelSearch(true);
    const startInput = this.getInput();
    if (!startInput) {
      return;
    }
    this.searchHistoryDelayer.trigger(() => {
      this.queryEditorWidget.searchInput?.onSearchSubmit();
      this.inputPatternExcludes.onSearchSubmit();
      this.inputPatternIncludes.onSearchSubmit();
    });
    const config = this.readConfigFromWidget();
    if (!config.query) {
      return;
    }
    const content = {
      pattern: config.query,
      isRegExp: config.isRegexp,
      isCaseSensitive: config.isCaseSensitive,
      isWordMatch: config.matchWholeWord
    };
    const options3 = {
      _reason: "searchEditor",
      extraFileResources: this.instantiationService.invokeFunction(getOutOfWorkspaceEditorResources),
      maxResults: this.searchConfig.maxResults ?? void 0,
      disregardIgnoreFiles: !config.useExcludeSettingsAndIgnoreFiles || void 0,
      disregardExcludeSettings: !config.useExcludeSettingsAndIgnoreFiles || void 0,
      excludePattern: [{ pattern: config.filesToExclude }],
      includePattern: config.filesToInclude,
      onlyOpenEditors: config.onlyOpenEditors,
      previewOptions: {
        matchLines: 1,
        charsPerLine: 1e3
      },
      surroundingContext: config.contextLines,
      isSmartCase: this.searchConfig.smartCase,
      expandPatterns: true,
      notebookSearchConfig: {
        includeMarkupInput: config.notebookSearchConfig.includeMarkupInput,
        includeMarkupPreview: config.notebookSearchConfig.includeMarkupPreview,
        includeCodeInput: config.notebookSearchConfig.includeCodeInput,
        includeOutput: config.notebookSearchConfig.includeOutput
      }
    };
    const folderResources = this.contextService.getWorkspace().folders;
    let query;
    try {
      const queryBuilder = this.instantiationService.createInstance(QueryBuilder);
      query = queryBuilder.text(content, folderResources.map((folder) => folder.uri), options3);
    } catch (err) {
      return;
    }
    this.searchOperation.start(500);
    this.ongoingOperations++;
    const { configurationModel } = await startInput.resolveModels();
    configurationModel.updateConfig(config);
    const result = this.searchModel.search(query);
    startInput.ongoingSearchOperation = result.asyncResults.finally(() => {
      this.ongoingOperations--;
      if (this.ongoingOperations === 0) {
        this.searchOperation.stop();
      }
    });
    const searchOperation = await startInput.ongoingSearchOperation;
    await this.onSearchComplete(searchOperation, config, startInput);
  }
  async onSearchComplete(searchOperation, startConfig, startInput) {
    const input = this.getInput();
    if (!input || input !== startInput || JSON.stringify(startConfig) !== JSON.stringify(this.readConfigFromWidget())) {
      return;
    }
    input.ongoingSearchOperation = void 0;
    const sortOrder = this.searchConfig.sortOrder;
    if (sortOrder === "modified" /* Modified */) {
      await this.retrieveFileStats(this.searchModel.searchResult);
    }
    const controller = ReferencesController.get(this.searchResultEditor);
    controller?.closeWidget(false);
    const labelFormatter = (uri4) => this.labelService.getUriLabel(uri4, { relative: true });
    const results = serializeSearchResultForEditor(this.searchModel.searchResult, startConfig.filesToInclude, startConfig.filesToExclude, startConfig.contextLines, labelFormatter, sortOrder, searchOperation?.limitHit);
    const { resultsModel } = await input.resolveModels();
    this.updatingModelForSearch = true;
    this.modelService.updateModel(resultsModel, results.text);
    this.updatingModelForSearch = false;
    if (searchOperation && searchOperation.messages) {
      for (const message of searchOperation.messages) {
        this.addMessage(message);
      }
    }
    this.reLayout();
    input.setDirty(!input.hasCapability(4 /* Untitled */));
    input.setMatchRanges(results.matchRanges);
  }
  addMessage(message) {
    let messageBox;
    if (this.messageBox.firstChild) {
      messageBox = this.messageBox.firstChild;
    } else {
      messageBox = append(this.messageBox, $(".message"));
    }
    append(messageBox, renderSearchMessage(message, this.instantiationService, this.notificationService, this.openerService, this.commandService, this.messageDisposables, () => this.triggerSearch()));
  }
  async retrieveFileStats(searchResult) {
    const files = searchResult.matches().filter((f) => !f.fileStat).map((f) => f.resolveFileStat(this.fileService));
    await Promise.all(files);
  }
  layout(dimension) {
    this.dimension = dimension;
    this.reLayout();
  }
  getSelected() {
    const selection = this.searchResultEditor.getSelection();
    if (selection) {
      return this.searchResultEditor.getModel()?.getValueInRange(selection) ?? "";
    }
    return "";
  }
  reLayout() {
    if (this.dimension) {
      this.queryEditorWidget.setWidth(
        this.dimension.width - 28
        /* container margin */
      );
      this.searchResultEditor.layout({ height: this.dimension.height - getTotalHeight(this.queryEditorContainer), width: this.dimension.width });
      this.inputPatternExcludes.setWidth(
        this.dimension.width - 28
        /* container margin */
      );
      this.inputPatternIncludes.setWidth(
        this.dimension.width - 28
        /* container margin */
      );
    }
  }
  getInput() {
    return this.input;
  }
  setSearchConfig(config) {
    this.priorConfig = config;
    if (config.query !== void 0) {
      this.queryEditorWidget.setValue(config.query);
    }
    if (config.isCaseSensitive !== void 0) {
      this.queryEditorWidget.searchInput?.setCaseSensitive(config.isCaseSensitive);
    }
    if (config.isRegexp !== void 0) {
      this.queryEditorWidget.searchInput?.setRegex(config.isRegexp);
    }
    if (config.matchWholeWord !== void 0) {
      this.queryEditorWidget.searchInput?.setWholeWords(config.matchWholeWord);
    }
    if (config.contextLines !== void 0) {
      this.queryEditorWidget.setContextLines(config.contextLines);
    }
    if (config.filesToExclude !== void 0) {
      this.inputPatternExcludes.setValue(config.filesToExclude);
    }
    if (config.filesToInclude !== void 0) {
      this.inputPatternIncludes.setValue(config.filesToInclude);
    }
    if (config.onlyOpenEditors !== void 0) {
      this.inputPatternIncludes.setOnlySearchInOpenEditors(config.onlyOpenEditors);
    }
    if (config.useExcludeSettingsAndIgnoreFiles !== void 0) {
      this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(config.useExcludeSettingsAndIgnoreFiles);
    }
    if (config.showIncludesExcludes !== void 0) {
      this.toggleIncludesExcludes(config.showIncludesExcludes);
    }
  }
  async setInput(newInput, options3, context2, token) {
    await super.setInput(newInput, options3, context2, token);
    if (token.isCancellationRequested) {
      return;
    }
    const { configurationModel, resultsModel } = await newInput.resolveModels();
    if (token.isCancellationRequested) {
      return;
    }
    this.searchResultEditor.setModel(resultsModel);
    this.pauseSearching = true;
    this.toggleRunAgainMessage(!newInput.ongoingSearchOperation && resultsModel.getLineCount() === 1 && resultsModel.getValueLength() === 0 && configurationModel.config.query !== "");
    this.setSearchConfig(configurationModel.config);
    this._register(configurationModel.onConfigDidUpdate((newConfig) => {
      if (newConfig !== this.priorConfig) {
        this.pauseSearching = true;
        this.setSearchConfig(newConfig);
        this.pauseSearching = false;
      }
    }));
    this.restoreViewState(context2);
    if (!options3?.preserveFocus) {
      this.focus();
    }
    this.pauseSearching = false;
    if (newInput.ongoingSearchOperation) {
      const existingConfig = this.readConfigFromWidget();
      newInput.ongoingSearchOperation.then((complete) => {
        this.onSearchComplete(complete, existingConfig, newInput);
      });
    }
  }
  toggleIncludesExcludes(_shouldShow) {
    const cls = "expanded";
    const shouldShow = _shouldShow ?? !this.includesExcludesContainer.classList.contains(cls);
    if (shouldShow) {
      this.toggleQueryDetailsButton.setAttribute("aria-expanded", "true");
      this.includesExcludesContainer.classList.add(cls);
    } else {
      this.toggleQueryDetailsButton.setAttribute("aria-expanded", "false");
      this.includesExcludesContainer.classList.remove(cls);
    }
    this.showingIncludesExcludes = this.includesExcludesContainer.classList.contains(cls);
    this.reLayout();
  }
  toEditorViewStateResource(input) {
    if (input.typeId === SearchEditorInputTypeId) {
      return input.modelUri;
    }
    return void 0;
  }
  computeEditorViewState(resource) {
    const control = this.getControl();
    const editorViewState = control.saveViewState();
    if (!editorViewState) {
      return void 0;
    }
    if (resource.toString() !== this.getInput()?.modelUri.toString()) {
      return void 0;
    }
    return { ...editorViewState, focused: this.searchResultEditor.hasWidgetFocus() ? "editor" : "input" };
  }
  tracksEditorViewState(input) {
    return input.typeId === SearchEditorInputTypeId;
  }
  restoreViewState(context2) {
    const viewState = this.loadEditorViewState(this.getInput(), context2);
    if (viewState) {
      this.searchResultEditor.restoreViewState(viewState);
    }
  }
  getAriaLabel() {
    return this.getInput()?.getName() ?? localize(19264, null);
  }
};

SearchEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IContextViewService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, IEditorProgressService),
  __decorateParam(13, ITextResourceConfigurationService),
  __decorateParam(14, IEditorGroupsService),
  __decorateParam(15, IEditorService),
  __decorateParam(16, IConfigurationService),
  __decorateParam(17, IFileService),
  __decorateParam(18, ILogService),
  __decorateParam(19, IHoverService)
], SearchEditor);

var searchEditorTextInputBorder = registerColor("searchEditor.textInputBorder", inputBorder, localize(19268, null));

function findNextRange(matchRanges, currentPosition) {
  for (const matchRange of matchRanges) {
    if (Position.isBefore(currentPosition, matchRange.getStartPosition())) {
      return matchRange;
    }
  }
  return matchRanges[0];
}

function findPrevRange(matchRanges, currentPosition) {
  for (let i2 = matchRanges.length - 1; i2 >= 0; i2--) {
    const matchRange = matchRanges[i2];
    if (Position.isBefore(matchRange.getStartPosition(), currentPosition)) {
      {
        return matchRange;
      }
    }
  }
  return matchRanges[matchRanges.length - 1];
}
export { findNextRange, findPrevRange, RESULT_LINE_REGEX, FILE_LINE_REGEX, SearchEditor, searchEditorTextInputBorder };
