// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchView.ts
import { $, Dimension, EventHelper, EventType, addDisposableListener, append, clearNode, getActiveWindow, getTotalHeight, hide, isAncestorOfActiveElement, show } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ViewPane } from "./module-1334.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { SearchContext } from "./module-1261.mjs";
import { SearchStateKey, getOutOfWorkspaceEditorResources } from "./module-1216.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { QueryBuilder } from "./module-1311.mjs";
import { Memento } from "./module-1042.mjs";
import { Delayer, RunOnceScheduler, Throttler } from "./module-0036.mjs";
import { FileMatchRenderer, FolderMatchRenderer, MatchRenderer, SearchAccessibilityProvider, SearchDelegate, TextSearchResultRenderer } from "./module-2807.mjs";
import { ISearchHistoryService, SearchHistoryService } from "./module-2815.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { searchDetailsIcon } from "./module-2804.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ExcludePatternInputWidget, IncludePatternInputWidget } from "./module-2803.mjs";
import { defaultInputBoxStyles, defaultToggleStyles } from "./module-0513.mjs";
import { SearchWidget2 } from "./module-2813.mjs";
import { isSearchHeader, isSearchResult, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeFolderMatchNoRoot, isSearchTreeFolderMatchWithResource, isSearchTreeFolderMatchWorkspaceRoot, isSearchTreeMatch, isTextSearchHeading } from "./module-2519.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { ResourceLabels } from "./module-1322.mjs";
import { WorkbenchCompressibleAsyncDataTree, getSelectionKeyboardEvent } from "./module-0636.mjs";
import { ResourceListDnDHandler } from "./module-1380.mjs";
import { IOpenerService, withSelection } from "./module-0272.mjs";
import { Event2 } from "./module-0017.mjs";
import { getCodeEditor, isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { MenuId } from "./module-0092.mjs";
import { status } from "./module-0076.mjs";
import { CommonFindController } from "./module-0677.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { isLinux } from "./module-0014.mjs";
import { forcedExpandRecursively } from "./module-2832.mjs";
import { createEditorFromSearchResult } from "./module-2819.mjs";
import { isAIKeyword } from "./module-1000.mjs";
import { renderSearchMessage } from "./module-2805.mjs";
import { OpenFolderAction } from "./module-1514.mjs";
import { isIMatchInNotebook } from "./module-2809.mjs";
import { Schemas } from "./module-0033.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { NotebookEditor } from "./module-1855.mjs";
import { Selection } from "./module-0107.mjs";
import { MultiCursorSelectionController } from "./module-0827.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IProgressService } from "./module-0446.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ISearchViewModelWorkbenchService } from "./module-2820.mjs";
import { IReplaceService } from "./module-2814.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IHoverService } from "./module-0520.mjs";
import { INotebookService } from "./module-0927.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ISCMService } from "./module-1081.mjs";
import { searchMatchComparer } from "./module-2810.mjs";
import { AIFolderMatchWorkspaceRootImpl } from "./module-2831.mjs";


// src/vs/workbench/contrib/search/browser/searchView.ts
var $97 = $;

var SEARCH_CANCELLED_MESSAGE = localize(19237, null);

var DEBOUNCE_DELAY = 75;

var SearchView = class extends ViewPane {
  constructor(options3, fileService, editorService, codeEditorService, progressService, notificationService, dialogService, commandService, contextViewService, instantiationService, viewDescriptorService, configurationService, contextService, searchViewModelWorkbenchService, contextKeyService, replaceService, textFileService, preferencesService, themeService, searchHistoryService, contextMenuService, accessibilityService, keybindingService, storageService, openerService, hoverService, notebookService, logService, accessibilitySignalService, telemetryService, scmService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.fileService = fileService;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this.progressService = progressService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.contextViewService = contextViewService;
    this.contextService = contextService;
    this.searchViewModelWorkbenchService = searchViewModelWorkbenchService;
    this.replaceService = replaceService;
    this.textFileService = textFileService;
    this.preferencesService = preferencesService;
    this.searchHistoryService = searchHistoryService;
    this.accessibilityService = accessibilityService;
    this.storageService = storageService;
    this.notebookService = notebookService;
    this.logService = logService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.telemetryService = telemetryService;
    this.scmService = scmService;
    this.isDisposed = false;
    this.lastFocusState = "input";
    this.messageDisposables = new DisposableStore();
    this.currentEditorCursorListener = this._register(new MutableDisposable());
    this.currentSearchQ = Promise.resolve();
    this.pauseSearching = false;
    this._visibleMatches = 0;
    this._cachedKeywords = [];
    this.container = $(".search-view");
    this.viewletVisible = SearchContext.SearchViewVisibleKey.bindTo(this.contextKeyService);
    this.firstMatchFocused = SearchContext.FirstMatchFocusKey.bindTo(this.contextKeyService);
    this.fileMatchOrMatchFocused = SearchContext.FileMatchOrMatchFocusKey.bindTo(this.contextKeyService);
    this.fileMatchOrFolderMatchFocus = SearchContext.FileMatchOrFolderMatchFocusKey.bindTo(this.contextKeyService);
    this.fileMatchOrFolderMatchWithResourceFocus = SearchContext.FileMatchOrFolderMatchWithResourceFocusKey.bindTo(this.contextKeyService);
    this.fileMatchFocused = SearchContext.FileFocusKey.bindTo(this.contextKeyService);
    this.folderMatchFocused = SearchContext.FolderFocusKey.bindTo(this.contextKeyService);
    this.folderMatchWithResourceFocused = SearchContext.ResourceFolderFocusKey.bindTo(this.contextKeyService);
    this.searchResultHeaderFocused = SearchContext.SearchResultHeaderFocused.bindTo(this.contextKeyService);
    this.hasSearchResultsKey = SearchContext.HasSearchResults.bindTo(this.contextKeyService);
    this.matchFocused = SearchContext.MatchFocusKey.bindTo(this.contextKeyService);
    this.searchStateKey = SearchStateKey.bindTo(this.contextKeyService);
    this.hasSearchPatternKey = SearchContext.ViewHasSearchPatternKey.bindTo(this.contextKeyService);
    this.hasReplacePatternKey = SearchContext.ViewHasReplacePatternKey.bindTo(this.contextKeyService);
    this.hasFilePatternKey = SearchContext.ViewHasFilePatternKey.bindTo(this.contextKeyService);
    this.hasSomeCollapsibleResultKey = SearchContext.ViewHasSomeCollapsibleKey.bindTo(this.contextKeyService);
    this.treeViewKey = SearchContext.InTreeViewKey.bindTo(this.contextKeyService);
    this.refreshTreeController = this._register(this.instantiationService.createInstance(RefreshTreeController, this, () => this.searchConfig));
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      const keys = SearchContext.hasAIResultProvider.keys();
      if (e4.affectsSome(new Set(keys))) {
        this.refreshHasAISetting();
      }
    }));
    this.contextKeyService = this._register(this.contextKeyService.createScoped(this.container));
    SearchContext.SearchViewFocusedKey.bindTo(this.contextKeyService).set(true);
    this.inputBoxFocused = SearchContext.InputBoxFocusedKey.bindTo(this.contextKeyService);
    this.inputPatternIncludesFocused = SearchContext.PatternIncludesFocusedKey.bindTo(this.contextKeyService);
    this.inputPatternExclusionsFocused = SearchContext.PatternExcludesFocusedKey.bindTo(this.contextKeyService);
    this.isEditableItem = SearchContext.IsEditableItemKey.bindTo(this.contextKeyService);
    this.instantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, this.contextKeyService])
    ));
    this._register(this.configurationService.onDidChangeConfiguration(async (e4) => {
      if (e4.affectsConfiguration("search.sortOrder")) {
        if (this.searchConfig.sortOrder === "modified" /* Modified */) {
          this.removeFileStats();
        }
        await this.refreshTreeController.queue();
      }
    }));
    this.viewModel = this.searchViewModelWorkbenchService.searchModel;
    this.queryBuilder = this.instantiationService.createInstance(QueryBuilder);
    this.memento = new Memento(this.id, storageService);
    this.viewletState = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    this._register(this.fileService.onDidFilesChange((e4) => this.onFilesChanged(e4)));
    this._register(this.textFileService.untitled.onWillDispose((model) => this.onUntitledDidDispose(model.resource)));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
    this._register(this.searchHistoryService.onDidClearHistory(() => this.clearHistory()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => this.onConfigurationUpdated(e4)));
    const updateChangedFilesToggleEnabled = () => {
      const hasChanges = [...this.scmService.repositories].some(
        (repo) => repo.provider.groups.some((group2) => group2.resources.length > 0)
      );
      this.inputPatternIncludes?.setOnlySearchInChangedFilesEnabled(hasChanges);
    };
    const scmRepositoryListeners = this._register(new DisposableMap());
    const registerScmRepositoryListeners = (repository) => {
      scmRepositoryListeners.set(repository, repository.provider.onDidChangeResources(() => {
        updateChangedFilesToggleEnabled();
        if (this.inputPatternIncludes?.onlySearchInChangedFiles()) {
          this.triggerQueryChange();
        }
      }));
    };
    for (const repository of this.scmService.repositories) {
      registerScmRepositoryListeners(repository);
    }
    this._register(this.scmService.onDidAddRepository((repository) => {
      registerScmRepositoryListeners(repository);
      updateChangedFilesToggleEnabled();
    }));
    this._register(this.scmService.onDidRemoveRepository((repository) => {
      scmRepositoryListeners.deleteAndDispose(repository);
      updateChangedFilesToggleEnabled();
    }));
    this.delayedRefresh = this._register(new Delayer(250));
    this.addToSearchHistoryDelayer = this._register(new Delayer(2e3));
    this.toggleCollapseStateDelayer = this._register(new Delayer(100));
    this.triggerQueryDelayer = this._register(new Delayer(0));
    this.treeAccessibilityProvider = this.instantiationService.createInstance(SearchAccessibilityProvider, this);
    this.isTreeLayoutViewVisible = this.viewletState.view?.treeLayout ?? this.searchConfig.defaultViewMode === "tree" /* Tree */;
    this._refreshResultsScheduler = this._register(new RunOnceScheduler(this._updateResults.bind(this), 80));
    this._register(this.storageService.onWillSaveState(() => {
      this._saveSearchHistoryService();
    }));
    this._register(this.storageService.onDidChangeValue(1 /* WORKSPACE */, SearchHistoryService.SEARCH_HISTORY_KEY, this._store)(() => {
      const restoredHistory = this.searchHistoryService.load();
      if (restoredHistory.include) {
        this.inputPatternIncludes.prependHistory(restoredHistory.include);
      }
      if (restoredHistory.exclude) {
        this.inputPatternExcludes.prependHistory(restoredHistory.exclude);
      }
      if (restoredHistory.search) {
        this.searchWidget.prependSearchHistory(restoredHistory.search);
      }
      if (restoredHistory.replace) {
        this.searchWidget.prependReplaceHistory(restoredHistory.replace);
      }
    }));
    this.changedWhileHidden = this.hasSearchResults();
  }
  static {
    this.ACTIONS_RIGHT_CLASS_NAME = "actions-right";
  }
  get cachedResults() {
    return this._cachedResults;
  }
  async queueRefreshTree() {
    return this.refreshTreeController.queue();
  }
  get isTreeLayoutViewVisible() {
    return this.treeViewKey.get() ?? false;
  }
  set isTreeLayoutViewVisible(visible) {
    this.treeViewKey.set(visible);
  }
  async setTreeView(visible) {
    if (visible === this.isTreeLayoutViewVisible) {
      return;
    }
    this.isTreeLayoutViewVisible = visible;
    this.updateIndentStyles(this.themeService.getFileIconTheme());
    return this.refreshTreeController.queue();
  }
  get state() {
    return this.searchStateKey.get() ?? 0 /* Idle */;
  }
  set state(v2) {
    this.searchStateKey.set(v2);
  }
  getContainer() {
    return this.container;
  }
  get searchResult() {
    return this.viewModel && this.viewModel.searchResult;
  }
  get model() {
    return this.viewModel;
  }
  async refreshHasAISetting() {
    const shouldShowAI = this.shouldShowAIResults();
    if (!this.tree || !this.tree.hasNode(this.searchResult)) {
      return;
    }
    if (shouldShowAI && !this.tree.hasNode(this.searchResult.aiTextSearchResult)) {
      if (this.model.searchResult.getCachedSearchComplete(false)) {
        return this.refreshAndUpdateCount();
      }
    } else if (!shouldShowAI && this.tree.hasNode(this.searchResult.aiTextSearchResult)) {
      return this.refreshAndUpdateCount();
    }
  }
  onDidChangeWorkbenchState() {
    if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ && this.searchWithoutFolderMessageElement) {
      hide(this.searchWithoutFolderMessageElement);
    }
  }
  refreshInputs() {
    this.pauseSearching = true;
    this.searchWidget.setValue(this.viewModel.searchResult.query?.contentPattern.pattern ?? "");
    this.searchWidget.setReplaceAllActionState(false);
    this.searchWidget.toggleReplace(true);
    this.inputPatternIncludes.setOnlySearchInOpenEditors(this.viewModel.searchResult.query?.onlyOpenEditors || false);
    this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(!this.viewModel.searchResult.query?.userDisabledExcludesAndIgnoreFiles || true);
    this.searchIncludePattern.setValue("");
    this.searchExcludePattern.setValue("");
    this.pauseSearching = false;
  }
  async replaceSearchModel(searchModel, asyncResults) {
    let progressComplete;
    this.progressService.withProgress({ location: this.getProgressLocation(), delay: 0 }, (_progress) => {
      return new Promise((resolve3) => progressComplete = resolve3);
    });
    const slowTimer = setTimeout(() => {
      this.state = 2 /* SlowSearch */;
    }, 2e3);
    this._refreshResultsScheduler.schedule();
    searchModel.location = 0 /* PANEL */;
    searchModel.replaceActive = this.viewModel.isReplaceActive();
    searchModel.replaceString = this.searchWidget.getReplaceValue();
    this._onSearchResultChangedDisposable?.dispose();
    this._onSearchResultChangedDisposable = this._register(searchModel.onSearchResultChanged(async (event) => this.onSearchResultsChanged(event)));
    this.searchViewModelWorkbenchService.searchModel = searchModel;
    this.viewModel = searchModel;
    this.tree.setInput(this.viewModel.searchResult);
    await this.onSearchResultsChanged();
    this.refreshInputs();
    asyncResults.then((complete) => {
      clearTimeout(slowTimer);
      return this.onSearchComplete(progressComplete, void 0, void 0, complete);
    }, (e4) => {
      clearTimeout(slowTimer);
      return this.onSearchError(e4, progressComplete, void 0, void 0);
    });
    await this.expandIfSingularResult();
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.container = append(parent, $(".search-view"));
    this.searchWidgetsContainerElement = append(this.container, $97(".search-widgets-container"));
    this.createSearchWidget(this.searchWidgetsContainerElement);
    const history = this.searchHistoryService.load();
    const filePatterns = this.viewletState.query?.filePatterns || "";
    const patternExclusions = this.viewletState.query?.folderExclusions || "";
    const patternExclusionsHistory = history.exclude || [];
    const patternIncludes = this.viewletState.query?.folderIncludes || "";
    const patternIncludesHistory = history.include || [];
    const onlyOpenEditors = this.viewletState.query?.onlyOpenEditors || false;
    const queryDetailsExpanded = this.viewletState.query?.queryDetailsExpanded || "";
    const useExcludesAndIgnoreFiles = typeof this.viewletState.query?.useExcludesAndIgnoreFiles === "boolean" ? this.viewletState.query.useExcludesAndIgnoreFiles : true;
    this.queryDetails = append(this.searchWidgetsContainerElement, $97(".query-details"));
    const toggleQueryDetailsLabel = localize(19196, null);
    this.toggleQueryDetailsButton = append(
      this.queryDetails,
      $97(".more" + ThemeIcon.asCSSSelector(searchDetailsIcon), { tabindex: 0, role: "button", "aria-label": toggleQueryDetailsLabel })
    );
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.toggleQueryDetailsButton, this.keybindingService.appendKeybinding(toggleQueryDetailsLabel, "workbench.action.search.toggleQueryDetails" /* ToggleQueryDetailsActionId */)));
    this._register(addDisposableListener(this.toggleQueryDetailsButton, EventType.CLICK, (e4) => {
      EventHelper.stop(e4);
      this.toggleQueryDetails(!this.accessibilityService.isScreenReaderOptimized());
    }));
    this._register(addDisposableListener(this.toggleQueryDetailsButton, EventType.KEY_UP, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e4);
        this.toggleQueryDetails(false);
      }
    }));
    this._register(addDisposableListener(this.toggleQueryDetailsButton, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(1024 /* Shift */ | 2 /* Tab */)) {
        if (this.searchWidget.isReplaceActive()) {
          this.searchWidget.focusReplaceAllAction();
        } else {
          this.searchWidget.isReplaceShown() ? this.searchWidget.replaceInput?.focusOnPreserve() : this.searchWidget.focusRegexAction();
        }
        EventHelper.stop(e4);
      }
    }));
    const folderIncludesList = append(this.queryDetails, $97(".file-types.includes"));
    const filesToIncludeTitle = localize(19241, null);
    append(folderIncludesList, $97("h4", void 0, filesToIncludeTitle));
    this.inputPatternIncludes = this._register(this.instantiationService.createInstance(IncludePatternInputWidget, folderIncludesList, this.contextViewService, {
      ariaLabel: filesToIncludeTitle,
      placeholder: localize(19212, null),
      showPlaceholderOnFocus: true,
      history: patternIncludesHistory,
      inputBoxStyles: defaultInputBoxStyles
    }));
    this.inputPatternIncludes.setValue(patternIncludes);
    this.inputPatternIncludes.setOnlySearchInOpenEditors(onlyOpenEditors);
    this.inputPatternIncludes.setOnlySearchInChangedFilesEnabled(
      [...this.scmService.repositories].some((repo) => repo.provider.groups.some((group2) => group2.resources.length > 0))
    );
    this._register(this.inputPatternIncludes.onCancel(() => this.cancelSearch(false)));
    this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(() => this.triggerQueryChange()));
    this._register(this.inputPatternIncludes.onChangeSearchInChangedFilesBox(() => this.triggerQueryChange()));
    this.trackInputBox(this.inputPatternIncludes.inputFocusTracker, this.inputPatternIncludesFocused);
    const excludesList = append(this.queryDetails, $97(".file-types.excludes"));
    const excludesTitle = localize(19240, null);
    append(excludesList, $97("h4", void 0, excludesTitle));
    this.inputPatternExcludes = this._register(this.instantiationService.createInstance(ExcludePatternInputWidget, excludesList, this.contextViewService, {
      ariaLabel: excludesTitle,
      placeholder: localize(19211, null),
      showPlaceholderOnFocus: true,
      history: patternExclusionsHistory,
      inputBoxStyles: defaultInputBoxStyles
    }));
    this.inputPatternExcludes.setValue(patternExclusions);
    this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(useExcludesAndIgnoreFiles);
    this._register(this.inputPatternExcludes.onCancel(() => this.cancelSearch(false)));
    this._register(this.inputPatternExcludes.onChangeIgnoreBox(() => this.triggerQueryChange()));
    this.trackInputBox(this.inputPatternExcludes.inputFocusTracker, this.inputPatternExclusionsFocused);
    const updateHasFilePatternKey = () => this.hasFilePatternKey.set(this.inputPatternIncludes.getValue().length > 0 || this.inputPatternExcludes.getValue().length > 0);
    updateHasFilePatternKey();
    const onFilePatternSubmit = (triggeredOnType) => {
      this.triggerQueryChange({ triggeredOnType, delay: this.searchConfig.searchOnTypeDebouncePeriod });
      if (triggeredOnType) {
        updateHasFilePatternKey();
      }
    };
    this._register(this.inputPatternIncludes.onSubmit(onFilePatternSubmit));
    this._register(this.inputPatternExcludes.onSubmit(onFilePatternSubmit));
    this.messagesElement = append(this.container, $97(".messages.text-search-provider-messages"));
    if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
      this.showSearchWithoutFolderMessage();
    }
    this.createSearchResultsView(this.container);
    if (filePatterns !== "" || patternExclusions !== "" || patternIncludes !== "" || queryDetailsExpanded !== "" || !useExcludesAndIgnoreFiles) {
      this.toggleQueryDetails(true, true, true);
    }
    this._onSearchResultChangedDisposable = this._register(this.viewModel.onSearchResultChanged(async (event) => await this.onSearchResultsChanged(event)));
    this._onAIResultChangedDisposable?.dispose();
    this._onAIResultChangedDisposable = this._register(
      this.viewModel.searchResult.aiTextSearchResult.onChange((e4) => {
        if (this.tree && this.tree.hasNode(this.searchResult.aiTextSearchResult) && !e4.removed) {
          this.tree.updateChildren(this.searchResult.aiTextSearchResult);
        }
      })
    );
    this._register(this.onDidChangeBodyVisibility((visible) => this.onVisibilityChanged(visible)));
    this.updateIndentStyles(this.themeService.getFileIconTheme());
    this._register(this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this));
  }
  updateIndentStyles(theme) {
    this.resultsElement.classList.toggle("hide-arrows", this.isTreeLayoutViewVisible && theme.hidesExplorerArrows);
  }
  async onVisibilityChanged(visible) {
    this.viewletVisible.set(visible);
    if (visible) {
      if (this.changedWhileHidden) {
        await this.refreshAndUpdateCount();
        this.changedWhileHidden = false;
      }
    } else {
      this.lastFocusState = "input";
    }
    this.viewModel?.searchResult.toggleHighlights(visible);
  }
  get searchAndReplaceWidget() {
    return this.searchWidget;
  }
  get searchIncludePattern() {
    return this.inputPatternIncludes;
  }
  get searchExcludePattern() {
    return this.inputPatternExcludes;
  }
  createSearchWidget(container2) {
    const contentPattern = this.viewletState.query?.contentPattern || "";
    const replaceText = this.viewletState.query?.replaceText || "";
    const isRegex2 = this.viewletState.query?.regex === true;
    const isWholeWords = this.viewletState.query?.wholeWords === true;
    const isCaseSensitive = this.viewletState.query?.caseSensitive === true;
    const history = this.searchHistoryService.load();
    const searchHistory = history.search || this.viewletState.query?.searchHistory || [];
    const replaceHistory = history.replace || this.viewletState.query?.replaceHistory || [];
    const showReplace = typeof this.viewletState.view?.showReplace === "boolean" ? this.viewletState.view.showReplace : true;
    const preserveCase = this.viewletState.query?.preserveCase === true;
    const isInNotebookMarkdownInput = this.viewletState.query?.isInNotebookMarkdownInput ?? true;
    const isInNotebookMarkdownPreview = this.viewletState.query?.isInNotebookMarkdownPreview ?? true;
    const isInNotebookCellInput = this.viewletState.query?.isInNotebookCellInput ?? true;
    const isInNotebookCellOutput = this.viewletState.query?.isInNotebookCellOutput ?? true;
    this.searchWidget = this._register(this.instantiationService.createInstance(SearchWidget2, container2, {
      value: contentPattern,
      replaceValue: replaceText,
      isRegex: isRegex2,
      isCaseSensitive,
      isWholeWords,
      searchHistory,
      replaceHistory,
      preserveCase,
      inputBoxStyles: defaultInputBoxStyles,
      toggleStyles: defaultToggleStyles,
      notebookOptions: {
        isInNotebookMarkdownInput,
        isInNotebookMarkdownPreview,
        isInNotebookCellInput,
        isInNotebookCellOutput
      }
    }));
    if (!this.searchWidget.searchInput || !this.searchWidget.replaceInput) {
      this.logService.warn(`Cannot fully create search widget. Search or replace input undefined. SearchInput: ${this.searchWidget.searchInput}, ReplaceInput: ${this.searchWidget.replaceInput}`);
      return;
    }
    if (showReplace) {
      this.searchWidget.toggleReplace(true);
    }
    this._register(this.searchWidget.onSearchSubmit((options3) => {
      const shouldRenderAIResults = this.configurationService.getValue("search").searchView.semanticSearchBehavior;
      if (shouldRenderAIResults === "auto" /* Auto */) {
        this.logService.info(`SearchView: Automatically rendering AI results`);
      }
      this.triggerQueryChange({
        ...options3,
        shouldKeepAIResults: false,
        shouldUpdateAISearch: shouldRenderAIResults === "auto" /* Auto */
      });
    }));
    this._register(this.searchWidget.onSearchCancel(({ focus }) => this.cancelSearch(focus)));
    this._register(this.searchWidget.searchInput.onDidOptionChange(() => {
      this.triggerQueryChange({ shouldKeepAIResults: true });
    }));
    this._register(this.searchWidget.getNotebookFilters().onDidChange(() => this.triggerQueryChange({ shouldKeepAIResults: true })));
    const updateHasPatternKey = () => this.hasSearchPatternKey.set(this.searchWidget.searchInput ? this.searchWidget.searchInput.getValue().length > 0 : false);
    updateHasPatternKey();
    this._register(this.searchWidget.searchInput.onDidChange(() => updateHasPatternKey()));
    const updateHasReplacePatternKey = () => this.hasReplacePatternKey.set(this.searchWidget.getReplaceValue().length > 0);
    updateHasReplacePatternKey();
    this._register(this.searchWidget.replaceInput.inputBox.onDidChange(() => updateHasReplacePatternKey()));
    this._register(this.searchWidget.onDidHeightChange(() => this.reLayout()));
    this._register(this.searchWidget.onReplaceToggled(() => this.reLayout()));
    this._register(this.searchWidget.onReplaceStateChange(async (state) => {
      this.viewModel.replaceActive = state;
      await this.refreshTreeController.queue();
    }));
    this._register(this.searchWidget.onPreserveCaseChange(async (state) => {
      this.viewModel.preserveCase = state;
      await this.refreshTreeController.queue();
    }));
    this._register(this.searchWidget.onReplaceValueChanged(() => {
      this.viewModel.replaceString = this.searchWidget.getReplaceValue();
      this.delayedRefresh.trigger(async () => this.refreshTreeController.queue());
    }));
    this._register(this.searchWidget.onBlur(() => {
      this.toggleQueryDetailsButton.focus();
    }));
    this._register(this.searchWidget.onReplaceAll(() => this.replaceAll()));
    this.trackInputBox(this.searchWidget.searchInputFocusTracker);
    this.trackInputBox(this.searchWidget.replaceInputFocusTracker);
  }
  shouldShowAIResults() {
    const hasProvider2 = SearchContext.hasAIResultProvider.getValue(this.contextKeyService);
    return !!hasProvider2;
  }
  async onConfigurationUpdated(event) {
    if (event && (event.affectsConfiguration("search.decorations.colors") || event.affectsConfiguration("search.decorations.badges"))) {
      return this.refreshTreeController.queue();
    }
  }
  trackInputBox(inputFocusTracker, contextKey) {
    if (!inputFocusTracker) {
      return;
    }
    this._register(inputFocusTracker.onDidFocus(() => {
      this.lastFocusState = "input";
      this.inputBoxFocused.set(true);
      contextKey?.set(true);
    }));
    this._register(inputFocusTracker.onDidBlur(() => {
      this.inputBoxFocused.set(this.searchWidget.searchInputHasFocus() || this.searchWidget.replaceInputHasFocus() || this.inputPatternIncludes.inputHasFocus() || this.inputPatternExcludes.inputHasFocus());
      contextKey?.set(false);
    }));
  }
  async onSearchResultsChanged(event) {
    if (this.isVisible()) {
      return this.refreshAndUpdateCount(event);
    } else {
      this.changedWhileHidden = true;
    }
  }
  async refreshAndUpdateCount(event) {
    this.searchWidget.setReplaceAllActionState(!this.viewModel.searchResult.isEmpty());
    this.updateSearchResultCount(this.viewModel.searchResult.query.userDisabledExcludesAndIgnoreFiles, this.viewModel.searchResult.query?.onlyOpenEditors, event?.clearingAll);
    return this.refreshTreeController.queue(event);
  }
  originalShouldCollapse(match2) {
    const collapseResults = this.searchConfig.collapseResults;
    return collapseResults === "alwaysCollapse" || !isSearchTreeMatch(match2) && match2.count() > 10 && collapseResults !== "alwaysExpand" ? 3 /* PreserveOrCollapsed */ : 2 /* PreserveOrExpanded */;
  }
  shouldCollapseAccordingToConfig(match2) {
    const collapseResults = this.originalShouldCollapse(match2);
    if (collapseResults === 3 /* PreserveOrCollapsed */) {
      return true;
    }
    return false;
  }
  replaceAll() {
    if (this.viewModel.searchResult.count() === 0) {
      return;
    }
    const occurrences = this.viewModel.searchResult.count();
    const fileCount = this.viewModel.searchResult.fileCount();
    const replaceValue = this.searchWidget.getReplaceValue() || "";
    const afterReplaceAllMessage = this.buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue);
    let progressComplete;
    let progressReporter;
    this.progressService.withProgress({ location: this.getProgressLocation(), delay: 100, total: occurrences }, (p) => {
      progressReporter = p;
      return new Promise((resolve3) => progressComplete = resolve3);
    });
    const confirmation = {
      title: localize(19222, null),
      message: this.buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue),
      primaryButton: localize(19221, null)
    };
    this.dialogService.confirm(confirmation).then((res) => {
      if (res.confirmed) {
        this.searchWidget.setReplaceAllActionState(false);
        this.viewModel.searchResult.replaceAll(progressReporter).then(() => {
          progressComplete();
          const messageEl = this.clearMessage();
          append(messageEl, afterReplaceAllMessage);
          this.reLayout();
        }, (error) => {
          progressComplete();
          isCancellationError(error);
          this.notificationService.error(error);
        });
      } else {
        progressComplete();
      }
    });
  }
  buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue) {
    if (occurrences === 1) {
      if (fileCount === 1) {
        if (replaceValue) {
          return localize(19224, null, occurrences, fileCount, replaceValue);
        }
        return localize(19214, null, occurrences, fileCount);
      }
      if (replaceValue) {
        return localize(19226, null, occurrences, fileCount, replaceValue);
      }
      return localize(19216, null, occurrences, fileCount);
    }
    if (fileCount === 1) {
      if (replaceValue) {
        return localize(19228, null, occurrences, fileCount, replaceValue);
      }
      return localize(19218, null, occurrences, fileCount);
    }
    if (replaceValue) {
      return localize(19230, null, occurrences, fileCount, replaceValue);
    }
    return localize(19220, null, occurrences, fileCount);
  }
  buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue) {
    const truncateValue = (value2) => {
      if (!value2) {
        return value2;
      }
      const lines = value2.split("\n");
      if (lines.length > 10) {
        return lines.slice(0, 10).join("\n") + "\n...";
      }
      return value2;
    };
    const displayReplaceValue = truncateValue(replaceValue);
    if (occurrences === 1) {
      if (fileCount === 1) {
        if (displayReplaceValue) {
          return localize(19213, null, occurrences, fileCount, displayReplaceValue);
        }
        return localize(19223, null, occurrences, fileCount);
      }
      if (displayReplaceValue) {
        return localize(19215, null, occurrences, fileCount, displayReplaceValue);
      }
      return localize(19225, null, occurrences, fileCount);
    }
    if (fileCount === 1) {
      if (displayReplaceValue) {
        return localize(19217, null, occurrences, fileCount, displayReplaceValue);
      }
      return localize(19227, null, occurrences, fileCount);
    }
    if (displayReplaceValue) {
      return localize(19219, null, occurrences, fileCount, displayReplaceValue);
    }
    return localize(19229, null, occurrences, fileCount);
  }
  clearMessage() {
    this.searchWithoutFolderMessageElement = void 0;
    const wasHidden = this.messagesElement.style.display === "none";
    clearNode(this.messagesElement);
    show(this.messagesElement);
    this.messageDisposables.clear();
    const newMessage = append(this.messagesElement, $97(".message"));
    if (wasHidden) {
      this.reLayout();
    }
    return newMessage;
  }
  createSearchResultsView(container2) {
    this.resultsElement = append(container2, $97(".results.show-file-icons.file-icon-themable-tree"));
    const delegate = this.instantiationService.createInstance(SearchDelegate);
    const identityProvider3 = {
      getId(element) {
        return element.id();
      }
    };
    this.searchDataSource = this.instantiationService.createInstance(SearchViewDataSource, this);
    this.treeLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
    this.tree = this._register(this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "SearchView",
      this.resultsElement,
      delegate,
      {
        isIncompressible: (element) => {
          if (isSearchTreeFolderMatch(element) && !isTextSearchHeading(element.parent()) && !isSearchTreeFolderMatchWorkspaceRoot(element.parent()) && !isSearchTreeFolderMatchNoRoot(element.parent())) {
            return false;
          }
          return true;
        }
      },
      [
        this._register(this.instantiationService.createInstance(FolderMatchRenderer, this, this.treeLabels)),
        this._register(this.instantiationService.createInstance(FileMatchRenderer, this, this.treeLabels)),
        this._register(this.instantiationService.createInstance(TextSearchResultRenderer, this.treeLabels)),
        this._register(this.instantiationService.createInstance(MatchRenderer, this))
      ],
      this.searchDataSource,
      {
        identityProvider: identityProvider3,
        accessibilityProvider: this.treeAccessibilityProvider,
        dnd: this.instantiationService.createInstance(ResourceListDnDHandler, (element) => {
          if (isSearchTreeFileMatch(element)) {
            return element.resource;
          }
          if (isSearchTreeMatch(element)) {
            return withSelection(element.parent().resource, element.range());
          }
          return null;
        }),
        multipleSelectionSupport: true,
        selectionNavigation: true,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles,
        paddingBottom: SearchDelegate.ITEM_HEIGHT,
        collapseByDefault: (e4) => {
          if (isTextSearchHeading(e4)) {
            return e4.isAIContributed;
          }
          if (isSearchTreeFolderMatch(e4) && e4.matches().length === 1 && isSearchTreeFolderMatch(e4.matches()[0])) {
            return false;
          }
          return this.shouldCollapseAccordingToConfig(e4);
        }
      }
    ));
    SearchContext.SearchResultListFocusedKey.bindTo(this.tree.contextKeyService);
    this.tree.setInput(this.viewModel.searchResult);
    this._register(this.tree.onContextMenu((e4) => this.onContextMenu(e4)));
    const updateHasSomeCollapsible = () => this.toggleCollapseStateDelayer.trigger(() => this.hasSomeCollapsibleResultKey.set(this.hasSomeCollapsible()));
    updateHasSomeCollapsible();
    this._register(this.tree.onDidChangeCollapseState(() => updateHasSomeCollapsible()));
    this._register(this.tree.onDidChangeModel(() => updateHasSomeCollapsible()));
    this._register(Event2.debounce(this.tree.onDidOpen, (last, event) => event, DEBOUNCE_DELAY, true)((options3) => {
      if (isSearchTreeMatch(options3.element)) {
        const selectedMatch = options3.element;
        this.currentSelectedFileMatch?.setSelectedMatch(null);
        this.currentSelectedFileMatch = selectedMatch.parent();
        this.currentSelectedFileMatch.setSelectedMatch(selectedMatch);
        this.onFocus(selectedMatch, options3.editorOptions.preserveFocus, options3.sideBySide, options3.editorOptions.pinned);
      }
    }));
    this._register(Event2.debounce(this.tree.onDidChangeFocus, (last, event) => event, DEBOUNCE_DELAY, true)(() => {
      const selection = this.tree.getSelection();
      const focus = this.tree.getFocus()[0];
      if (selection.length > 1 && isSearchTreeMatch(focus)) {
        this.onFocus(focus, true);
      }
    }));
    this._register(Event2.any(this.tree.onDidFocus, this.tree.onDidChangeFocus)(() => {
      const focus = this.tree.getFocus()[0];
      if (this.tree.isDOMFocused()) {
        const firstElem = this.tree.getFirstElementChild(this.tree.getInput());
        this.firstMatchFocused.set(firstElem === focus);
        this.fileMatchOrMatchFocused.set(!!focus);
        this.fileMatchFocused.set(isSearchTreeFileMatch(focus));
        this.folderMatchFocused.set(isSearchTreeFolderMatch(focus));
        this.matchFocused.set(isSearchTreeMatch(focus));
        this.fileMatchOrFolderMatchFocus.set(isSearchTreeFileMatch(focus) || isSearchTreeFolderMatch(focus));
        this.fileMatchOrFolderMatchWithResourceFocus.set(isSearchTreeFileMatch(focus) || isSearchTreeFolderMatchWithResource(focus));
        this.folderMatchWithResourceFocused.set(isSearchTreeFolderMatchWithResource(focus));
        this.searchResultHeaderFocused.set(isSearchHeader(focus));
        this.lastFocusState = "tree";
      }
      let editable = false;
      if (isSearchTreeMatch(focus)) {
        editable = !focus.isReadonly;
      } else if (isSearchTreeFileMatch(focus)) {
        editable = !focus.hasOnlyReadOnlyMatches();
      } else if (isSearchTreeFolderMatch(focus)) {
        editable = !focus.hasOnlyReadOnlyMatches();
      }
      this.isEditableItem.set(editable);
    }));
    this._register(this.tree.onDidBlur(() => {
      this.firstMatchFocused.reset();
      this.fileMatchOrMatchFocused.reset();
      this.fileMatchFocused.reset();
      this.folderMatchFocused.reset();
      this.matchFocused.reset();
      this.fileMatchOrFolderMatchFocus.reset();
      this.fileMatchOrFolderMatchWithResourceFocus.reset();
      this.folderMatchWithResourceFocused.reset();
      this.searchResultHeaderFocused.reset();
      this.isEditableItem.reset();
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      const editor = getCodeEditor(this.editorService.activeTextEditorControl);
      this.currentEditorCursorListener.value = editor?.onDidChangeCursorPosition(() => {
        this.currentSelectedFileMatch?.setSelectedMatch(null);
        this.currentSelectedFileMatch = void 0;
      });
    }));
  }
  onContextMenu(e4) {
    e4.browserEvent.preventDefault();
    e4.browserEvent.stopPropagation();
    const selection = this.tree.getSelection();
    let arg;
    let context2;
    if (selection && selection.length > 0) {
      arg = e4.element;
      context2 = selection;
    } else {
      context2 = e4.element;
    }
    this.contextMenuService.showContextMenu({
      menuId: MenuId.SearchContext,
      menuActionOptions: { shouldForwardArgs: true, arg },
      contextKeyService: this.contextKeyService,
      getAnchor: () => e4.anchor,
      getActionsContext: () => context2
    });
  }
  hasSomeCollapsible() {
    const viewer = this.getControl();
    const navigator2 = viewer.navigate();
    let node = navigator2.first();
    const shouldShowAI = this.shouldShowAIResults();
    do {
      if (node && !viewer.isCollapsed(node) && (!shouldShowAI || !isTextSearchHeading(node))) {
        return true;
      }
    } while (node = navigator2.next());
    return false;
  }
  async selectNextMatch() {
    if (!this.hasSearchResults()) {
      return;
    }
    const [selected] = this.tree.getSelection();
    if (selected && !isSearchTreeMatch(selected)) {
      if (this.tree.isCollapsed(selected)) {
        await this.tree.expand(selected);
      }
    }
    const navigator2 = this.tree.navigate(selected);
    let next = navigator2.next();
    if (!next) {
      next = navigator2.first();
    }
    while (next && !isSearchTreeMatch(next)) {
      if (this.tree.isCollapsed(next)) {
        await this.tree.expand(next);
      }
      next = navigator2.next();
    }
    if (next) {
      if (next === selected) {
        this.tree.setFocus([]);
      }
      const event = getSelectionKeyboardEvent(void 0, false, false);
      this.tree.setFocus([next], event);
      this.tree.setSelection([next], event);
      this.tree.reveal(next);
      const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(next);
      if (ariaLabel) {
        status(ariaLabel);
      }
    }
  }
  async selectPreviousMatch() {
    if (!this.hasSearchResults()) {
      return;
    }
    const [selected] = this.tree.getSelection();
    let navigator2 = this.tree.navigate(selected);
    let prev = navigator2.previous();
    while (!prev || !isSearchTreeMatch(prev) && !this.tree.isCollapsed(prev)) {
      const nextPrev = prev ? navigator2.previous() : navigator2.last();
      if (!prev && !nextPrev) {
        return;
      }
      prev = nextPrev;
    }
    while (prev && !isSearchTreeMatch(prev)) {
      const nextItem = navigator2.next();
      if (!nextItem) {
        break;
      }
      await this.tree.expand(prev);
      navigator2 = this.tree.navigate(nextItem);
      prev = nextItem ? navigator2.previous() : navigator2.last();
    }
    if (prev) {
      if (prev === selected) {
        this.tree.setFocus([]);
      }
      const event = getSelectionKeyboardEvent(void 0, false, false);
      this.tree.setFocus([prev], event);
      this.tree.setSelection([prev], event);
      this.tree.reveal(prev);
      const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(prev);
      if (ariaLabel) {
        status(ariaLabel);
      }
    }
  }
  moveFocusToResults() {
    this.tree.domFocus();
  }
  focus() {
    super.focus();
    if (this.lastFocusState === "input" || !this.hasSearchResults()) {
      const updatedText = this.searchConfig.seedOnFocus ? this.updateTextFromSelection({ allowSearchOnType: false }) : false;
      this.searchWidget.focus(void 0, void 0, updatedText);
    } else {
      this.tree.domFocus();
    }
  }
  updateTextFromFindWidgetOrSelection({ allowUnselectedWord = true, allowSearchOnType = true }) {
    let activeEditor = this.editorService.activeTextEditorControl;
    if (isCodeEditor(activeEditor) && !activeEditor?.hasTextFocus()) {
      const controller = CommonFindController.get(activeEditor);
      if (controller && controller.isFindInputFocused()) {
        return this.updateTextFromFindWidget(controller, { allowSearchOnType });
      }
      const editors = this.codeEditorService.listCodeEditors();
      activeEditor = editors.find((editor) => editor instanceof EmbeddedCodeEditorWidget && editor.getParentEditor() === activeEditor && editor.hasTextFocus()) ?? activeEditor;
    }
    return this.updateTextFromSelection({ allowUnselectedWord, allowSearchOnType }, activeEditor);
  }
  updateTextFromFindWidget(controller, { allowSearchOnType = true }) {
    if (!this.searchConfig.seedWithNearestWord && (getActiveWindow().getSelection()?.toString() ?? "") === "") {
      return false;
    }
    const searchString = controller.getState().searchString;
    if (searchString === "") {
      return false;
    }
    this.searchWidget.searchInput?.setCaseSensitive(controller.getState().matchCase);
    this.searchWidget.searchInput?.setWholeWords(controller.getState().wholeWord);
    this.searchWidget.searchInput?.setRegex(controller.getState().isRegex);
    this.updateText(searchString, allowSearchOnType);
    return true;
  }
  updateTextFromSelection({ allowUnselectedWord = true, allowSearchOnType = true }, editor) {
    const seedSearchStringFromSelection = this.configurationService.getValue("editor").find.seedSearchStringFromSelection;
    if (!seedSearchStringFromSelection || seedSearchStringFromSelection === "never") {
      return false;
    }
    let selectedText = this.getSearchTextFromEditor(allowUnselectedWord, editor);
    if (selectedText === null) {
      return false;
    }
    if (this.searchWidget.searchInput?.getRegex()) {
      selectedText = escapeRegExpCharacters(selectedText);
    }
    this.updateText(selectedText, allowSearchOnType);
    return true;
  }
  updateText(text2, allowSearchOnType = true) {
    if (allowSearchOnType && !this.viewModel.searchResult.isDirty) {
      this.searchWidget.setValue(text2);
    } else {
      this.pauseSearching = true;
      this.searchWidget.setValue(text2);
      this.pauseSearching = false;
    }
  }
  focusNextInputBox() {
    if (this.searchWidget.searchInputHasFocus()) {
      if (this.searchWidget.isReplaceShown()) {
        this.searchWidget.focus(true, true);
      } else {
        this.moveFocusFromSearchOrReplace();
      }
      return;
    }
    if (this.searchWidget.replaceInputHasFocus()) {
      this.moveFocusFromSearchOrReplace();
      return;
    }
    if (this.inputPatternIncludes.inputHasFocus()) {
      this.inputPatternExcludes.focus();
      this.inputPatternExcludes.select();
      return;
    }
    if (this.inputPatternExcludes.inputHasFocus()) {
      this.selectTreeIfNotSelected();
      return;
    }
  }
  moveFocusFromSearchOrReplace() {
    if (this.showsFileTypes()) {
      this.toggleQueryDetails(true, this.showsFileTypes());
    } else {
      this.selectTreeIfNotSelected();
    }
  }
  focusPreviousInputBox() {
    if (this.searchWidget.searchInputHasFocus()) {
      return;
    }
    if (this.searchWidget.replaceInputHasFocus()) {
      this.searchWidget.focus(true);
      return;
    }
    if (this.inputPatternIncludes.inputHasFocus()) {
      this.searchWidget.focus(true, true);
      return;
    }
    if (this.inputPatternExcludes.inputHasFocus()) {
      this.inputPatternIncludes.focus();
      this.inputPatternIncludes.select();
      return;
    }
    if (this.tree.isDOMFocused()) {
      this.moveFocusFromResults();
      return;
    }
  }
  moveFocusFromResults() {
    if (this.showsFileTypes()) {
      this.toggleQueryDetails(true, true, false, true);
    } else {
      this.searchWidget.focus(true, true);
    }
  }
  reLayout() {
    if (this.isDisposed || !this.size) {
      return;
    }
    const actionsPosition = this.searchConfig.actionsPosition;
    this.getContainer().classList.toggle(SearchView.ACTIONS_RIGHT_CLASS_NAME, actionsPosition === "right");
    this.searchWidget.setWidth(
      this.size.width - 28
      /* container margin */
    );
    this.inputPatternExcludes.setWidth(
      this.size.width - 28
      /* container margin */
    );
    this.inputPatternIncludes.setWidth(
      this.size.width - 28
      /* container margin */
    );
    const widgetHeight = getTotalHeight(this.searchWidgetsContainerElement);
    const messagesHeight = getTotalHeight(this.messagesElement);
    this.tree.layout(this.size.height - widgetHeight - messagesHeight, this.size.width - 28);
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.size = new Dimension(width2, height);
    this.reLayout();
  }
  getControl() {
    return this.tree;
  }
  allSearchFieldsClear() {
    return this.searchWidget.getReplaceValue() === "" && (!this.searchWidget.searchInput || this.searchWidget.searchInput.getValue() === "");
  }
  allFilePatternFieldsClear() {
    return this.searchExcludePattern.getValue() === "" && this.searchIncludePattern.getValue() === "";
  }
  hasSearchResults() {
    return !this.viewModel.searchResult.isEmpty();
  }
  clearSearchResults(clearInput = true) {
    this.viewModel.searchResult.clear();
    this.showEmptyStage(true);
    if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
      this.showSearchWithoutFolderMessage();
    }
    if (clearInput) {
      if (this.allSearchFieldsClear()) {
        this.clearFilePatternFields();
      }
      this.searchWidget.clear();
    }
    this.viewModel.cancelSearch();
    this.viewModel.cancelAISearch();
    this.tree.ariaLabel = localize(19192, null);
    this.accessibilitySignalService.playSignal(AccessibilitySignal.clear);
    this.reLayout();
  }
  clearFilePatternFields() {
    this.searchExcludePattern.clear();
    this.searchIncludePattern.clear();
  }
  cancelSearch(focus = true) {
    if (this.viewModel.cancelSearch() && this.viewModel.cancelAISearch()) {
      if (focus) {
        this.searchWidget.focus();
      }
      return true;
    }
    return false;
  }
  selectTreeIfNotSelected() {
    if (this.tree.getNode(void 0)) {
      this.tree.domFocus();
      const selection = this.tree.getSelection();
      if (selection.length === 0) {
        const event = getSelectionKeyboardEvent();
        this.tree.focusNext(void 0, void 0, event);
        this.tree.setSelection(this.tree.getFocus(), event);
      }
    }
  }
  getSearchTextFromEditor(allowUnselectedWord, editor) {
    if (isAncestorOfActiveElement(this.getContainer())) {
      return null;
    }
    editor = editor ?? this.editorService.activeTextEditorControl;
    if (!editor) {
      return null;
    }
    const allowUnselected = this.searchConfig.seedWithNearestWord && allowUnselectedWord;
    return getSelectionTextFromEditor(allowUnselected, editor);
  }
  showsFileTypes() {
    return this.queryDetails.classList.contains("more");
  }
  toggleCaseSensitive() {
    this.searchWidget.searchInput?.setCaseSensitive(!this.searchWidget.searchInput.getCaseSensitive());
    this.triggerQueryChange({ shouldKeepAIResults: true });
  }
  toggleWholeWords() {
    this.searchWidget.searchInput?.setWholeWords(!this.searchWidget.searchInput.getWholeWords());
    this.triggerQueryChange({ shouldKeepAIResults: true });
  }
  toggleRegex() {
    this.searchWidget.searchInput?.setRegex(!this.searchWidget.searchInput.getRegex());
    this.triggerQueryChange({ shouldKeepAIResults: true });
  }
  togglePreserveCase() {
    this.searchWidget.replaceInput?.setPreserveCase(!this.searchWidget.replaceInput.getPreserveCase());
    this.triggerQueryChange({ shouldKeepAIResults: true });
  }
  setSearchParameters(args2 = {}) {
    if (typeof args2.isCaseSensitive === "boolean") {
      this.searchWidget.searchInput?.setCaseSensitive(args2.isCaseSensitive);
    }
    if (typeof args2.matchWholeWord === "boolean") {
      this.searchWidget.searchInput?.setWholeWords(args2.matchWholeWord);
    }
    if (typeof args2.isRegex === "boolean") {
      this.searchWidget.searchInput?.setRegex(args2.isRegex);
    }
    if (typeof args2.filesToInclude === "string") {
      this.searchIncludePattern.setValue(String(args2.filesToInclude));
    }
    if (typeof args2.filesToExclude === "string") {
      this.searchExcludePattern.setValue(String(args2.filesToExclude));
    }
    if (typeof args2.query === "string") {
      this.searchWidget.searchInput?.setValue(args2.query);
    }
    if (typeof args2.replace === "string") {
      this.searchWidget.replaceInput?.setValue(args2.replace);
    } else {
      if (this.searchWidget.replaceInput && this.searchWidget.replaceInput.getValue() !== "") {
        this.searchWidget.replaceInput.setValue("");
      }
    }
    if (typeof args2.triggerSearch === "boolean" && args2.triggerSearch) {
      this.triggerQueryChange();
    }
    if (typeof args2.preserveCase === "boolean") {
      this.searchWidget.replaceInput?.setPreserveCase(args2.preserveCase);
    }
    if (typeof args2.useExcludeSettingsAndIgnoreFiles === "boolean") {
      this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(args2.useExcludeSettingsAndIgnoreFiles);
    }
    if (typeof args2.onlyOpenEditors === "boolean") {
      this.searchIncludePattern.setOnlySearchInOpenEditors(args2.onlyOpenEditors);
    }
  }
  toggleQueryDetails(moveFocus = true, show3, skipLayout, reverse) {
    show3 = typeof show3 === "undefined" ? !this.queryDetails.classList.contains("more") : Boolean(show3);
    if (!this.viewletState.query) {
      this.viewletState.query = {};
    }
    this.viewletState.query.queryDetailsExpanded = show3;
    skipLayout = Boolean(skipLayout);
    if (show3) {
      this.toggleQueryDetailsButton.setAttribute("aria-expanded", "true");
      this.queryDetails.classList.add("more");
      if (moveFocus) {
        if (reverse) {
          this.inputPatternExcludes.focus();
          this.inputPatternExcludes.select();
        } else {
          this.inputPatternIncludes.focus();
          this.inputPatternIncludes.select();
        }
      }
    } else {
      this.toggleQueryDetailsButton.setAttribute("aria-expanded", "false");
      this.queryDetails.classList.remove("more");
      if (moveFocus) {
        this.searchWidget.focus();
      }
    }
    if (!skipLayout && this.size) {
      this.reLayout();
    }
  }
  searchInFolders(folderPaths = []) {
    this._searchWithIncludeOrExclude(true, folderPaths);
  }
  searchOutsideOfFolders(folderPaths = []) {
    this._searchWithIncludeOrExclude(false, folderPaths);
  }
  _searchWithIncludeOrExclude(include, folderPaths) {
    if (!folderPaths.length || folderPaths.some((folderPath) => folderPath === ".")) {
      this.inputPatternIncludes.setValue("");
      this.searchWidget.focus();
      return;
    }
    if (!this.showsFileTypes()) {
      this.toggleQueryDetails(true, true);
    }
    (include ? this.inputPatternIncludes : this.inputPatternExcludes).setValue(folderPaths.join(", "));
    this.searchWidget.focus(false);
  }
  triggerQueryChange(_options) {
    const options3 = { preserveFocus: true, triggeredOnType: false, delay: 0, ..._options };
    if (options3.triggeredOnType && !this.searchConfig.searchOnType) {
      return;
    }
    if (!this.pauseSearching) {
      const delay = options3.triggeredOnType ? options3.delay : 0;
      this.triggerQueryDelayer.trigger(() => {
        this._onQueryChanged(options3.preserveFocus, options3.triggeredOnType, options3.shouldKeepAIResults, options3.shouldUpdateAISearch);
      }, delay);
    }
  }
  _getExcludePattern() {
    return this.inputPatternExcludes.getValue().trim();
  }
  _getIncludePattern() {
    return this.inputPatternIncludes.getValue().trim();
  }
  _onQueryChanged(preserveFocus, triggeredOnType = false, shouldKeepAIResults = false, shouldUpdateAISearch = false) {
    if (!this.searchWidget.searchInput?.inputBox.isInputValid()) {
      return;
    }
    const isRegex2 = this.searchWidget.searchInput.getRegex();
    const isInNotebookMarkdownInput = this.searchWidget.getNotebookFilters().markupInput;
    const isInNotebookMarkdownPreview = this.searchWidget.getNotebookFilters().markupPreview;
    const isInNotebookCellInput = this.searchWidget.getNotebookFilters().codeInput;
    const isInNotebookCellOutput = this.searchWidget.getNotebookFilters().codeOutput;
    const isWholeWords = this.searchWidget.searchInput.getWholeWords();
    const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
    const contentPattern = this.searchWidget.searchInput.getValue();
    const excludePatternText = this._getExcludePattern();
    const includePatternText = this._getIncludePattern();
    const useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
    const onlySearchInOpenEditors = this.inputPatternIncludes.onlySearchInOpenEditors();
    const onlySearchInChangedFiles = this.inputPatternIncludes.onlySearchInChangedFiles();
    if (contentPattern.length === 0) {
      this.clearSearchResults(false);
      this.clearMessage();
      this.clearAIResults();
      return;
    }
    const content = {
      pattern: contentPattern,
      isRegExp: isRegex2,
      isCaseSensitive,
      isWordMatch: isWholeWords,
      notebookInfo: {
        isInNotebookMarkdownInput,
        isInNotebookMarkdownPreview,
        isInNotebookCellInput,
        isInNotebookCellOutput
      }
    };
    const excludePattern = [{ pattern: this.inputPatternExcludes.getValue() }];
    const includePattern = this.inputPatternIncludes.getValue();
    let changedFileUris;
    if (onlySearchInChangedFiles) {
      changedFileUris = [...this.scmService.repositories].flatMap((repository) => repository.provider.groups).flatMap((group2) => group2.resources).map((resource) => resource.sourceUri);
    }
    const charsPerLine = content.isRegExp ? 1e4 : 1e3;
    const options3 = {
      _reason: "searchView",
      extraFileResources: this.instantiationService.invokeFunction(getOutOfWorkspaceEditorResources),
      maxResults: this.searchConfig.maxResults ?? void 0,
      disregardIgnoreFiles: !useExcludesAndIgnoreFiles || void 0,
      disregardExcludeSettings: !useExcludesAndIgnoreFiles || void 0,
      ignoreGlobCase: !isLinux || void 0,
      onlyOpenEditors: onlySearchInOpenEditors,
      changedFileUris,
      excludePattern,
      includePattern,
      previewOptions: {
        matchLines: 1,
        charsPerLine
      },
      isSmartCase: this.searchConfig.smartCase,
      expandPatterns: true
    };
    const folderResources = this.contextService.getWorkspace().folders;
    const onQueryValidationError = (err) => {
      this.searchWidget.searchInput?.showMessage({ content: err.message, type: 3 /* ERROR */ });
      this.viewModel.searchResult.clear();
    };
    let query;
    try {
      query = this.queryBuilder.text(content, folderResources.map((folder) => folder.uri), options3);
    } catch (err) {
      onQueryValidationError(err);
      return;
    }
    this.validateQuery(query).then(() => {
      if (!shouldKeepAIResults && shouldUpdateAISearch && this.tree.hasNode(this.searchResult.aiTextSearchResult)) {
        this.tree.collapse(this.searchResult.aiTextSearchResult);
      }
      this.onQueryTriggered(query, options3, excludePatternText, includePatternText, triggeredOnType, shouldKeepAIResults, shouldUpdateAISearch);
      if (!preserveFocus) {
        this.searchWidget.focus(false, void 0, true);
      }
    }, onQueryValidationError);
  }
  validateQuery(query) {
    const folderQueriesExistP = query.folderQueries.map((fq) => {
      return this.fileService.exists(fq.folder).catch(() => false);
    });
    return Promise.all(folderQueriesExistP).then((existResults) => {
      const existingFolderQueries = query.folderQueries.filter((folderQuery, i2) => existResults[i2]);
      if (!query.folderQueries.length || existingFolderQueries.length) {
        query.folderQueries = existingFolderQueries;
      } else {
        const nonExistantPath = query.folderQueries[0].folder.fsPath;
        const searchPathNotFoundError = localize(19239, null, nonExistantPath);
        return Promise.reject(new Error(searchPathNotFoundError));
      }
      return void 0;
    });
  }
  onQueryTriggered(query, options3, excludePatternText, includePatternText, triggeredOnType, shouldKeepAIResults, shouldUpdateAISearch) {
    this.addToSearchHistoryDelayer.trigger(() => {
      this.searchWidget.searchInput?.onSearchSubmit();
      this.inputPatternExcludes.onSearchSubmit();
      this.inputPatternIncludes.onSearchSubmit();
    });
    this.viewModel.cancelSearch(true);
    if (!shouldKeepAIResults) {
      this.clearAIResults();
    }
    this.currentSearchQ = this.currentSearchQ.then(() => this.doSearch(query, excludePatternText, includePatternText, triggeredOnType, shouldKeepAIResults, shouldUpdateAISearch)).then(() => void 0, () => void 0);
  }
  async _updateResults() {
    if (this.state === 0 /* Idle */) {
      return;
    }
    try {
      const fileCount = this.viewModel.searchResult.fileCount();
      if (this._visibleMatches !== fileCount) {
        this._visibleMatches = fileCount;
        await this.refreshAndUpdateCount();
      }
    } finally {
      this._refreshResultsScheduler.schedule();
    }
  }
  async expandIfSingularResult() {
    const collapseResults = this.searchConfig.collapseResults;
    if (collapseResults !== "alwaysCollapse" && this.viewModel.searchResult.matches().length === 1) {
      const onlyMatch = this.viewModel.searchResult.matches()[0];
      await this.tree.expandTo(onlyMatch);
      if (onlyMatch.count() < 50) {
        await this.tree.expand(onlyMatch);
      }
    }
  }
  appendSearchWithAIButton(messageEl) {
    const searchWithAIButtonTooltip = this.keybindingService.appendKeybinding(
      localize(19244, null),
      "search.action.searchWithAI" /* SearchWithAIActionId */
    );
    const searchWithAIButtonText = localize(19242, null);
    const searchWithAIButton = this.messageDisposables.add(new SearchLinkButton(
      searchWithAIButtonText,
      () => {
        this.commandService.executeCommand("search.action.searchWithAI" /* SearchWithAIActionId */);
      },
      this.hoverService,
      searchWithAIButtonTooltip
    ));
    append(messageEl, searchWithAIButton.element);
  }
  async onSearchComplete(progressComplete, excludePatternText, includePatternText, completed, shouldDoFinalRefresh = true, keywords) {
    this.state = 0 /* Idle */;
    progressComplete();
    if (shouldDoFinalRefresh) {
      await this.refreshAndUpdateCount();
    }
    const allResults = !this.viewModel.searchResult.isEmpty();
    const aiResults = this.searchResult.getCachedSearchComplete(true);
    if (completed?.exit === 1 /* NewSearchStarted */) {
      return;
    }
    SearchContext.AIResultsRequested.bindTo(this.contextKeyService).set(this.shouldShowAIResults() && !!aiResults);
    if (completed && this.tree.hasNode(this.searchResult.aiTextSearchResult) && this.tree.isCollapsed(this.searchResult.aiTextSearchResult)) {
      this.tree.expand(this.searchResult.aiTextSearchResult);
      return;
    }
    if (!allResults) {
      const hasExcludes = !!excludePatternText;
      const hasIncludes = !!includePatternText;
      let message;
      if (!completed) {
        message = SEARCH_CANCELLED_MESSAGE;
      } else if (this.inputPatternIncludes.onlySearchInOpenEditors()) {
        if (hasIncludes && hasExcludes) {
          message = localize(19200, null, includePatternText, excludePatternText);
        } else if (hasIncludes) {
          message = localize(19199, null, includePatternText);
        } else if (hasExcludes) {
          message = localize(19197, null, excludePatternText);
        } else {
          message = localize(19198, null);
        }
      } else {
        if (hasIncludes && hasExcludes) {
          message = localize(19204, null, includePatternText, excludePatternText);
        } else if (hasIncludes) {
          message = localize(19203, null, includePatternText);
        } else if (hasExcludes) {
          message = localize(19201, null, excludePatternText);
        } else {
          message = localize(19202, null);
        }
      }
      status(message);
      const messageEl = this.clearMessage();
      append(messageEl, message);
      if (this.shouldShowAIResults()) {
        this.appendSearchWithAIButton(messageEl);
        append(messageEl, $97("span", void 0, " - "));
      }
      if (!completed) {
        const searchAgainButton = this.messageDisposables.add(new SearchLinkButton(
          localize(19231, null),
          () => this.triggerQueryChange({ preserveFocus: false }),
          this.hoverService
        ));
        append(messageEl, searchAgainButton.element);
      } else if (hasIncludes || hasExcludes) {
        const searchAgainButton = this.messageDisposables.add(new SearchLinkButton(localize(19232, null), this.onSearchAgain.bind(this), this.hoverService));
        append(messageEl, searchAgainButton.element);
      } else {
        const openSettingsButton = this.messageDisposables.add(new SearchLinkButton(localize(19210, null), this.onOpenSettings.bind(this), this.hoverService));
        append(messageEl, openSettingsButton.element);
      }
      if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
        this.showSearchWithoutFolderMessage();
      }
      this.reLayout();
    } else {
      this.viewModel.searchResult.toggleHighlights(this.isVisible());
      status(localize(19190, null, this.viewModel.searchResult.count(), this.viewModel.searchResult.fileCount()));
    }
    if (completed && completed.limitHit) {
      completed.messages.push({ type: 2 /* Warning */, text: localize(19238, null) });
    }
    if (completed && completed.messages) {
      for (const message of completed.messages) {
        this.addMessage(message);
      }
    }
    this.reLayout();
  }
  async onSearchError(e4, progressComplete, excludePatternText, includePatternText, completed, shouldDoFinalRefresh = true) {
    this.state = 0 /* Idle */;
    if (isCancellationError(e4)) {
      return this.onSearchComplete(progressComplete, excludePatternText, includePatternText, completed, shouldDoFinalRefresh);
    } else {
      progressComplete();
      this.searchWidget.searchInput?.showMessage({ content: e4.message, type: 3 /* ERROR */ });
      this.viewModel.searchResult.clear();
      return Promise.resolve();
    }
  }
  clearAIResults() {
    this.model.searchResult.aiTextSearchResult.hidden = true;
    this.refreshTreeController.clearAllPending();
    this._pendingSemanticSearchPromise = void 0;
    this._cachedResults = void 0;
    this._cachedKeywords = [];
    this.model.cancelAISearch(true);
    this.model.clearAiSearchResults();
  }
  async requestAIResults() {
    this.logService.info(`SearchView: Requesting semantic results from keybinding. Cached: ${!!this.cachedResults}`);
    if ((!this.cachedResults || this.cachedResults.results.length === 0) && !this._pendingSemanticSearchPromise) {
      this.clearAIResults();
    }
    this.model.searchResult.aiTextSearchResult.hidden = false;
    await this.queueRefreshTree();
    await forcedExpandRecursively(this.getControl(), this.model.searchResult.aiTextSearchResult);
  }
  async addAIResults() {
    const excludePatternText = this._getExcludePattern();
    const includePatternText = this._getIncludePattern();
    this.searchWidget.searchInput?.clearMessage();
    this.showEmptyStage();
    this._visibleMatches = 0;
    this.tree.setSelection([]);
    this.tree.setFocus([]);
    this.viewModel.replaceString = this.searchWidget.getReplaceValue();
    let aiSearchPromise = this._pendingSemanticSearchPromise;
    if (!aiSearchPromise) {
      this.viewModel.searchResult.setAIQueryUsingTextQuery();
      aiSearchPromise = this._pendingSemanticSearchPromise = this.viewModel.aiSearch(() => {
        if (this._pendingSemanticSearchPromise === aiSearchPromise) {
          this._pendingSemanticSearchPromise = void 0;
        }
      });
    }
    aiSearchPromise.then((complete) => {
      this.updateSearchResultCount(this.viewModel.searchResult.query?.userDisabledExcludesAndIgnoreFiles, this.viewModel.searchResult.query?.onlyOpenEditors, false);
      return this.onSearchComplete(() => {
      }, excludePatternText, includePatternText, complete, false, complete.aiKeywords);
    }, (e4) => {
      return this.onSearchError(e4, () => {
      }, excludePatternText, includePatternText, void 0, false);
    });
  }
  doSearch(query, excludePatternText, includePatternText, triggeredOnType, shouldKeepAIResults, shouldUpdateAISearch) {
    let progressComplete;
    this.progressService.withProgress({ location: this.getProgressLocation(), delay: triggeredOnType ? 300 : 0 }, (_progress) => {
      return new Promise((resolve3) => progressComplete = resolve3);
    });
    this.searchWidget.searchInput?.clearMessage();
    this.state = 1 /* Searching */;
    this.showEmptyStage();
    if (this.model.searchResult.aiTextSearchResult.hidden && shouldUpdateAISearch) {
      this.logService.info(`SearchView: Semantic search visible. Keep semantic results: ${shouldKeepAIResults}. Update semantic search: ${shouldUpdateAISearch}`);
      this.model.searchResult.aiTextSearchResult.hidden = false;
    }
    const slowTimer = setTimeout(() => {
      this.state = 2 /* SlowSearch */;
    }, 2e3);
    this._visibleMatches = 0;
    this._refreshResultsScheduler.schedule();
    this.searchWidget.setReplaceAllActionState(false);
    this.tree.setSelection([]);
    this.tree.setFocus([]);
    this.viewModel.replaceString = this.searchWidget.getReplaceValue();
    const result = this.viewModel.search(query);
    if (!shouldKeepAIResults || shouldUpdateAISearch) {
      this.viewModel.searchResult.setAIQueryUsingTextQuery(query);
    }
    if (this.configurationService.getValue("search").searchView.keywordSuggestions) {
      this.getKeywordSuggestions();
    }
    return result.asyncResults.then((complete) => {
      clearTimeout(slowTimer);
      const config = this.configurationService.getValue("search").searchView.semanticSearchBehavior;
      if (complete.results.length === 0 && config === "runOnEmpty" /* RunOnEmpty */) {
        this.logService.info(`SearchView: Requesting semantic results on empty search.`);
        this.model.searchResult.aiTextSearchResult.hidden = false;
      }
      return this.onSearchComplete(progressComplete, excludePatternText, includePatternText, complete);
    }, (e4) => {
      clearTimeout(slowTimer);
      return this.onSearchError(e4, progressComplete, excludePatternText, includePatternText);
    });
  }
  onOpenSettings(e4) {
    EventHelper.stop(e4, false);
    this.openSettings("@id:files.exclude,search.exclude,search.useParentIgnoreFiles,search.useGlobalIgnoreFiles,search.useIgnoreFiles");
  }
  openSettings(query) {
    const options3 = { query };
    return this.contextService.getWorkbenchState() !== 1 /* EMPTY */ ? this.preferencesService.openWorkspaceSettings(options3) : this.preferencesService.openUserSettings(options3);
  }
  onSearchAgain() {
    this.inputPatternExcludes.setValue("");
    this.inputPatternIncludes.setValue("");
    this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
    this.inputPatternIncludes.setOnlySearchInChangedFiles(false);
    this.triggerQueryChange({ preserveFocus: false });
  }
  onEnableExcludes() {
    this.toggleQueryDetails(false, true);
    this.searchExcludePattern.setUseExcludesAndIgnoreFiles(true);
  }
  onDisableSearchInOpenEditors() {
    this.toggleQueryDetails(false, true);
    this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
  }
  updateSearchResultCount(disregardExcludesAndIgnores, onlyOpenEditors, clear = false) {
    if (this._cachedKeywords.length > 0) {
      return;
    }
    const fileCount = this.viewModel.searchResult.fileCount(this.viewModel.searchResult.aiTextSearchResult.hidden);
    const resultCount = this.viewModel.searchResult.count(this.viewModel.searchResult.aiTextSearchResult.hidden);
    this.hasSearchResultsKey.set(fileCount > 0);
    const msgWasHidden = this.messagesElement.style.display === "none";
    const messageEl = this.clearMessage();
    const resultMsg = clear ? "" : this.buildResultCountMessage(resultCount, fileCount);
    this.tree.ariaLabel = resultMsg + localize(19194, null, this.searchResult.query?.contentPattern.pattern ?? "");
    append(messageEl, resultMsg);
    if (fileCount > 0) {
      if (disregardExcludesAndIgnores) {
        const excludesDisabledMessage = " - " + localize(19246, null) + " ";
        const enableExcludesButton = this.messageDisposables.add(new SearchLinkButton(localize(19193, null), this.onEnableExcludes.bind(this), this.hoverService, localize(19245, null)));
        append(messageEl, $97("span", void 0, excludesDisabledMessage, "(", enableExcludesButton.element, ")"));
      }
      if (onlyOpenEditors) {
        const searchingInOpenMessage = " - " + localize(19205, null) + " ";
        const disableOpenEditorsButton = this.messageDisposables.add(new SearchLinkButton(localize(19206, null), this.onDisableSearchInOpenEditors.bind(this), this.hoverService, localize(19191, null)));
        append(messageEl, $97("span", void 0, searchingInOpenMessage, "(", disableOpenEditorsButton.element, ")"));
      }
      append(messageEl, " - ");
      const openInEditorTooltip = this.keybindingService.appendKeybinding(
        localize(19209, null),
        "search.action.openInEditor" /* OpenInEditorCommandId */
      );
      const openInEditorButton = this.messageDisposables.add(new SearchLinkButton(
        localize(19208, null),
        () => this.instantiationService.invokeFunction(createEditorFromSearchResult, this.searchResult, this.searchIncludePattern.getValue(), this.searchExcludePattern.getValue(), this.searchIncludePattern.onlySearchInOpenEditors()),
        this.hoverService,
        openInEditorTooltip
      ));
      append(messageEl, openInEditorButton.element);
      if (this.shouldShowAIResults()) {
        append(messageEl, " - ");
        this.appendSearchWithAIButton(messageEl);
      }
      this.reLayout();
    } else if (!msgWasHidden) {
      hide(this.messagesElement);
    }
  }
  handleKeywordClick(keyword, index2) {
    this.searchWidget.searchInput?.setValue(keyword);
    this.triggerQueryChange({ preserveFocus: false, triggeredOnType: false, shouldKeepAIResults: false });
    this.telemetryService.publicLog2("searchKeywordClick", {
      index: index2,
      maxKeywords: this._cachedKeywords.length
    });
  }
  updateKeywordSuggestionUI(keyword) {
    const element = this.messagesElement.firstChild;
    if (this._cachedKeywords.length > 0) {
      if (this._cachedKeywords.length >= 3) {
        return;
      }
      append(element, ", ");
      const index2 = this._cachedKeywords.length;
      const button = this.messageDisposables.add(new SearchLinkButton(
        keyword.keyword,
        () => this.handleKeywordClick(keyword.keyword, index2),
        this.hoverService
      ));
      append(element, button.element);
    } else {
      const messageEl = this.clearMessage();
      messageEl.classList.add("ai-keywords");
      const resultMsg = localize(19195, null);
      append(messageEl, resultMsg);
      const button = this.messageDisposables.add(new SearchLinkButton(
        keyword.keyword,
        () => this.handleKeywordClick(keyword.keyword, 0),
        this.hoverService
      ));
      append(messageEl, button.element);
    }
    this._cachedKeywords.push(keyword.keyword);
  }
  async getKeywordSuggestions() {
    let aiSearchPromise = this._pendingSemanticSearchPromise;
    if (!aiSearchPromise) {
      this.viewModel.searchResult.setAIQueryUsingTextQuery();
      aiSearchPromise = this._pendingSemanticSearchPromise = this.viewModel.aiSearch((result) => {
        if (result && isAIKeyword(result)) {
          this.updateKeywordSuggestionUI(result);
          return;
        }
        if (this._pendingSemanticSearchPromise === aiSearchPromise) {
          this._pendingSemanticSearchPromise = void 0;
        }
      });
    }
    this._cachedResults = await aiSearchPromise;
  }
  addMessage(message) {
    const messageBox = this.messagesElement.firstChild;
    if (!messageBox) {
      return;
    }
    append(messageBox, renderSearchMessage(message, this.instantiationService, this.notificationService, this.openerService, this.commandService, this.messageDisposables, () => this.triggerQueryChange()));
  }
  buildResultCountMessage(resultCount, fileCount) {
    if (resultCount === 1 && fileCount === 1) {
      return localize(19233, null, resultCount, fileCount);
    } else if (resultCount === 1) {
      return localize(19235, null, resultCount, fileCount);
    } else if (fileCount === 1) {
      return localize(19234, null, resultCount, fileCount);
    } else {
      return localize(19236, null, resultCount, fileCount);
    }
  }
  showSearchWithoutFolderMessage() {
    this.searchWithoutFolderMessageElement = this.clearMessage();
    const textEl = append(
      this.searchWithoutFolderMessageElement,
      $97("p", void 0, localize(19243, null))
    );
    const openFolderButton2 = this.messageDisposables.add(new SearchLinkButton(
      localize(19207, null),
      () => {
        this.commandService.executeCommand(OpenFolderAction.ID).catch((err) => onUnexpectedError(err));
      },
      this.hoverService
    ));
    append(textEl, openFolderButton2.element);
  }
  showEmptyStage(forceHideMessages = false) {
    const showingCancelled = (this.messagesElement.firstChild?.textContent?.indexOf(SEARCH_CANCELLED_MESSAGE) ?? -1) > -1;
    if (showingCancelled || forceHideMessages || !this.configurationService.getValue().search?.searchOnType) {
      hide(this.messagesElement);
    }
    show(this.resultsElement);
    this.currentSelectedFileMatch = void 0;
  }
  shouldOpenInNotebookEditor(match2, uri4) {
    return isIMatchInNotebook(match2) || uri4.scheme !== Schemas.untitled && this.notebookService.getContributedNotebookTypes(uri4).length > 0;
  }
  onFocus(lineMatch, preserveFocus, sideBySide, pinned) {
    const useReplacePreview = this.configurationService.getValue().search?.useReplacePreview;
    const resource = isSearchTreeMatch(lineMatch) ? lineMatch.parent().resource : lineMatch.resource;
    return useReplacePreview && this.viewModel.isReplaceActive() && !!this.viewModel.replaceString && !this.shouldOpenInNotebookEditor(lineMatch, resource) ? this.replaceService.openReplacePreview(lineMatch, preserveFocus, sideBySide, pinned) : this.open(lineMatch, preserveFocus, sideBySide, pinned, resource);
  }
  async open(element, preserveFocus, sideBySide, pinned, resourceInput) {
    const selection = getEditorSelectionFromMatch(element, this.viewModel);
    const oldParentMatches = isSearchTreeMatch(element) ? element.parent().matches() : [];
    const resource = resourceInput ?? (isSearchTreeMatch(element) ? element.parent().resource : element.resource);
    let editor;
    const options3 = {
      preserveFocus,
      pinned,
      selection,
      revealIfVisible: true
    };
    try {
      editor = await this.editorService.openEditor({
        resource,
        options: options3
      }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
      const editorControl = editor?.getControl();
      if (isSearchTreeMatch(element) && preserveFocus && isCodeEditor(editorControl)) {
        this.viewModel.searchResult.getRangeHighlightDecorations().highlightRange(
          editorControl.getModel(),
          element.range()
        );
      } else {
        this.viewModel.searchResult.getRangeHighlightDecorations().removeHighlightRange();
      }
    } catch (err) {
      onUnexpectedError(err);
      return;
    }
    if (editor instanceof NotebookEditor) {
      const elemParent = element.parent();
      if (isSearchTreeMatch(element)) {
        if (isIMatchInNotebook(element)) {
          element.parent().showMatch(element);
        } else {
          const editorWidget = editor.getControl();
          if (editorWidget) {
            elemParent.bindNotebookEditorWidget(editorWidget);
            await elemParent.updateMatchesForEditorWidget();
            const matchIndex = oldParentMatches.findIndex((e4) => e4.id() === element.id());
            const matches2 = elemParent.matches();
            const match2 = matchIndex >= matches2.length ? matches2[matches2.length - 1] : matches2[matchIndex];
            if (isIMatchInNotebook(match2)) {
              elemParent.showMatch(match2);
              if (!this.tree.getFocus().includes(match2) || !this.tree.getSelection().includes(match2)) {
                this.tree.setSelection([match2], getSelectionKeyboardEvent());
                this.tree.setFocus([match2]);
              }
            }
          }
        }
      }
    }
  }
  openEditorWithMultiCursor(element) {
    const resource = isSearchTreeMatch(element) ? element.parent().resource : element.resource;
    return this.editorService.openEditor({
      resource,
      options: {
        preserveFocus: false,
        pinned: true,
        revealIfVisible: true
      }
    }).then((editor) => {
      if (editor) {
        let fileMatch = null;
        if (isSearchTreeFileMatch(element)) {
          fileMatch = element;
        } else if (isSearchTreeMatch(element)) {
          fileMatch = element.parent();
        }
        if (fileMatch) {
          const selections = fileMatch.matches().map((m) => new Selection(m.range().startLineNumber, m.range().startColumn, m.range().endLineNumber, m.range().endColumn));
          const codeEditor = getCodeEditor(editor.getControl());
          if (codeEditor) {
            const multiCursorController = MultiCursorSelectionController.get(codeEditor);
            multiCursorController?.selectAllUsingSelections(selections);
          }
        }
      }
      this.viewModel.searchResult.getRangeHighlightDecorations().removeHighlightRange();
    }, onUnexpectedError);
  }
  onUntitledDidDispose(resource) {
    if (!this.viewModel) {
      return;
    }
    let matches2 = this.viewModel.searchResult.matches();
    for (let i2 = 0, len = matches2.length; i2 < len; i2++) {
      if (resource.toString() === matches2[i2].resource.toString()) {
        this.viewModel.searchResult.remove(matches2[i2]);
      }
    }
    matches2 = this.viewModel.searchResult.matches(true);
    for (let i2 = 0, len = matches2.length; i2 < len; i2++) {
      if (resource.toString() === matches2[i2].resource.toString()) {
        this.viewModel.searchResult.remove(matches2[i2]);
      }
    }
  }
  onFilesChanged(e4) {
    if (!this.viewModel || this.searchConfig.sortOrder !== "modified" /* Modified */ && !e4.gotDeleted()) {
      return;
    }
    const matches2 = this.viewModel.searchResult.matches();
    if (e4.gotDeleted()) {
      const deletedMatches = matches2.filter((m) => e4.contains(m.resource, 2 /* DELETED */));
      this.viewModel.searchResult.remove(deletedMatches);
    } else {
      const changedMatches = matches2.filter((m) => e4.contains(m.resource));
      if (changedMatches.length && this.searchConfig.sortOrder === "modified" /* Modified */) {
        this.updateFileStats(changedMatches).then(async () => this.refreshTreeController.queue());
      }
    }
  }
  get searchConfig() {
    return this.configurationService.getValue("search");
  }
  clearHistory() {
    this.searchWidget.clearHistory();
    this.inputPatternExcludes.clearHistory();
    this.inputPatternIncludes.clearHistory();
  }
  saveState() {
    if (!this.searchWidget) {
      return;
    }
    const patternExcludes = this.inputPatternExcludes?.getValue().trim() ?? "";
    const patternIncludes = this.inputPatternIncludes?.getValue().trim() ?? "";
    const onlyOpenEditors = this.inputPatternIncludes?.onlySearchInOpenEditors() ?? false;
    const useExcludesAndIgnoreFiles = this.inputPatternExcludes?.useExcludesAndIgnoreFiles() ?? true;
    const preserveCase = this.viewModel.preserveCase;
    if (!this.viewletState.query) {
      this.viewletState.query = {};
    }
    if (this.searchWidget.searchInput) {
      const isRegex2 = this.searchWidget.searchInput.getRegex();
      const isWholeWords = this.searchWidget.searchInput.getWholeWords();
      const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
      const contentPattern = this.searchWidget.searchInput.getValue();
      const isInNotebookCellInput = this.searchWidget.getNotebookFilters().codeInput;
      const isInNotebookCellOutput = this.searchWidget.getNotebookFilters().codeOutput;
      const isInNotebookMarkdownInput = this.searchWidget.getNotebookFilters().markupInput;
      const isInNotebookMarkdownPreview = this.searchWidget.getNotebookFilters().markupPreview;
      this.viewletState.query.contentPattern = contentPattern;
      this.viewletState.query.regex = isRegex2;
      this.viewletState.query.wholeWords = isWholeWords;
      this.viewletState.query.caseSensitive = isCaseSensitive;
      this.viewletState.query.isInNotebookMarkdownInput = isInNotebookMarkdownInput;
      this.viewletState.query.isInNotebookMarkdownPreview = isInNotebookMarkdownPreview;
      this.viewletState.query.isInNotebookCellInput = isInNotebookCellInput;
      this.viewletState.query.isInNotebookCellOutput = isInNotebookCellOutput;
    }
    this.viewletState.query.folderExclusions = patternExcludes;
    this.viewletState.query.folderIncludes = patternIncludes;
    this.viewletState.query.useExcludesAndIgnoreFiles = useExcludesAndIgnoreFiles;
    this.viewletState.query.preserveCase = preserveCase;
    this.viewletState.query.onlyOpenEditors = onlyOpenEditors;
    const isReplaceShown = this.searchAndReplaceWidget.isReplaceShown();
    if (!this.viewletState.view) {
      this.viewletState.view = {};
    }
    this.viewletState.view.showReplace = isReplaceShown;
    this.viewletState.view.treeLayout = this.isTreeLayoutViewVisible;
    this.viewletState.query.replaceText = isReplaceShown && this.searchWidget.getReplaceValue();
    this._saveSearchHistoryService();
    this.memento.saveMemento();
    super.saveState();
  }
  _saveSearchHistoryService() {
    if (this.searchWidget === void 0) {
      return;
    }
    const history = /* @__PURE__ */ Object.create(null);
    const searchHistory = this.searchWidget.getSearchHistory();
    if (searchHistory && searchHistory.length) {
      history.search = searchHistory;
    }
    const replaceHistory = this.searchWidget.getReplaceHistory();
    if (replaceHistory && replaceHistory.length) {
      history.replace = replaceHistory;
    }
    const patternExcludesHistory = this.inputPatternExcludes.getHistory();
    if (patternExcludesHistory && patternExcludesHistory.length) {
      history.exclude = patternExcludesHistory;
    }
    const patternIncludesHistory = this.inputPatternIncludes.getHistory();
    if (patternIncludesHistory && patternIncludesHistory.length) {
      history.include = patternIncludesHistory;
    }
    this.searchHistoryService.save(history);
  }
  async updateFileStats(elements) {
    const files = elements.map((f) => f.resolveFileStat(this.fileService));
    await Promise.all(files);
  }
  removeFileStats() {
    for (const fileMatch of this.searchResult.matches()) {
      fileMatch.fileStat = void 0;
    }
    for (const fileMatch of this.searchResult.matches(true)) {
      fileMatch.fileStat = void 0;
    }
  }
  dispose() {
    this.isDisposed = true;
    this.saveState();
    super.dispose();
  }
};

SearchView = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IProgressService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IContextViewService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IViewDescriptorService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IWorkspaceContextService),
  __decorateParam(13, ISearchViewModelWorkbenchService),
  __decorateParam(14, IContextKeyService),
  __decorateParam(15, IReplaceService),
  __decorateParam(16, ITextFileService),
  __decorateParam(17, IPreferencesService),
  __decorateParam(18, IThemeService),
  __decorateParam(19, ISearchHistoryService),
  __decorateParam(20, IContextMenuService),
  __decorateParam(21, IAccessibilityService),
  __decorateParam(22, IKeybindingService),
  __decorateParam(23, IStorageService),
  __decorateParam(24, IOpenerService),
  __decorateParam(25, IHoverService),
  __decorateParam(26, INotebookService),
  __decorateParam(27, ILogService),
  __decorateParam(28, IAccessibilitySignalService),
  __decorateParam(29, ITelemetryService),
  __decorateParam(30, ISCMService)
], SearchView);

var SearchLinkButton = class extends Disposable {
  constructor(label3, handler, hoverService, tooltip) {
    super();
    this.element = $97("a.pointer", { tabindex: 0 }, label3);
    this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, tooltip));
    this.addEventHandlers(handler);
  }
  addEventHandlers(handler) {
    const wrappedHandler = (e4) => {
      EventHelper.stop(e4, false);
      handler(e4);
    };
    this._register(addDisposableListener(this.element, EventType.CLICK, wrappedHandler));
    this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(10 /* Space */) || event.equals(3 /* Enter */)) {
        wrappedHandler(e4);
        event.preventDefault();
        event.stopPropagation();
      }
    }));
  }
};

function getEditorSelectionFromMatch(element, viewModel) {
  let match2 = null;
  if (isSearchTreeMatch(element)) {
    match2 = element;
  }
  if (isSearchTreeFileMatch(element) && element.count() > 0) {
    match2 = element.matches()[element.matches().length - 1];
  }
  if (match2) {
    const range2 = match2.range();
    if (viewModel.isReplaceActive() && !!viewModel.replaceString) {
      const replaceString = match2.replaceString;
      return {
        startLineNumber: range2.startLineNumber,
        startColumn: range2.startColumn,
        endLineNumber: range2.startLineNumber,
        endColumn: range2.startColumn + replaceString.length
      };
    }
    return range2;
  }
  return void 0;
}

function getSelectionTextFromEditor(allowUnselectedWord, activeEditor) {
  let editor = activeEditor;
  if (isDiffEditor(editor)) {
    if (editor.getOriginalEditor().hasTextFocus()) {
      editor = editor.getOriginalEditor();
    } else {
      editor = editor.getModifiedEditor();
    }
  }
  if (!isCodeEditor(editor) || !editor.hasModel()) {
    return null;
  }
  const range2 = editor.getSelection();
  if (!range2) {
    return null;
  }
  if (range2.isEmpty()) {
    if (allowUnselectedWord) {
      const wordAtPosition = editor.getModel().getWordAtPosition(range2.getStartPosition());
      return wordAtPosition?.word ?? null;
    } else {
      return null;
    }
  }
  let searchText = "";
  for (let i2 = range2.startLineNumber; i2 <= range2.endLineNumber; i2++) {
    let lineText = editor.getModel().getLineContent(i2);
    if (i2 === range2.endLineNumber) {
      lineText = lineText.substring(0, range2.endColumn - 1);
    }
    if (i2 === range2.startLineNumber) {
      lineText = lineText.substring(range2.startColumn - 1);
    }
    if (i2 !== range2.startLineNumber) {
      lineText = "\n" + lineText;
    }
    searchText += lineText;
  }
  return searchText;
}

var SearchViewDataSource = class {
  constructor(searchView, configurationService) {
    this.searchView = searchView;
    this.configurationService = configurationService;
  }
  get searchConfig() {
    return this.configurationService.getValue("search");
  }
  createSearchResultIterator(searchResult) {
    const ret = [];
    if (this.searchView.shouldShowAIResults() && searchResult.searchModel.hasPlainResults && !searchResult.aiTextSearchResult.hidden) {
      ret.push(searchResult.aiTextSearchResult);
    }
    if (!searchResult.plainTextSearchResult.isEmpty()) {
      if (!this.searchView.shouldShowAIResults() || searchResult.aiTextSearchResult.hidden) {
        return this.createTextSearchResultIterator(searchResult.plainTextSearchResult);
      }
      ret.push(searchResult.plainTextSearchResult);
    }
    return ret;
  }
  createTextSearchResultIterator(textSearchResult) {
    const folderMatches = textSearchResult.folderMatches().filter((fm) => !fm.isEmpty()).sort(searchMatchComparer);
    if (folderMatches.length === 1) {
      return this.createFolderIterator(folderMatches[0]);
    }
    return folderMatches;
  }
  createFolderIterator(folderMatch) {
    const matchArray = this.searchView.isTreeLayoutViewVisible ? folderMatch.matches() : folderMatch.allDownstreamFileMatches();
    let matches2 = matchArray;
    if (!(folderMatch instanceof AIFolderMatchWorkspaceRootImpl)) {
      matches2 = matchArray.sort((a, b) => searchMatchComparer(a, b, this.searchConfig.sortOrder));
    }
    return matches2;
  }
  createFileIterator(fileMatch) {
    const matches2 = fileMatch.matches().sort(searchMatchComparer);
    return matches2;
  }
  hasChildren(element) {
    if (isSearchTreeMatch(element)) {
      return false;
    }
    if (isTextSearchHeading(element) && element.isAIContributed) {
      return true;
    }
    const hasChildren = element.hasChildren;
    return hasChildren;
  }
  getChildren(element) {
    if (isSearchResult(element)) {
      return this.createSearchResultIterator(element);
    } else if (isTextSearchHeading(element)) {
      if (element.isAIContributed && (!this.searchView.model.hasAIResults || !!this.searchView._pendingSemanticSearchPromise)) {
        if (this.searchView.cachedResults) {
          return this.createTextSearchResultIterator(element);
        }
        this.searchView.addAIResults();
        return new Promise((resolve3) => {
          const disposable = element.onChange(() => {
            disposable.dispose();
            resolve3(this.createTextSearchResultIterator(element));
          });
        });
      }
      return this.createTextSearchResultIterator(element);
    } else if (isSearchTreeFolderMatch(element)) {
      return this.createFolderIterator(element);
    } else if (isSearchTreeFileMatch(element)) {
      return this.createFileIterator(element);
    }
    return [];
  }
  getParent(element) {
    const parent = element.parent();
    if (isSearchResult(parent)) {
      throw new Error("Invalid element passed to getParent");
    }
    return parent;
  }
};

SearchViewDataSource = __decorateClass([
  __decorateParam(1, IConfigurationService)
], SearchViewDataSource);

var RefreshTreeController = class extends Disposable {
  constructor(searchView, geSearchConfig, fileService) {
    super();
    this.searchView = searchView;
    this.geSearchConfig = geSearchConfig;
    this.fileService = fileService;
    this.queuedIChangeEvents = [];
    this.refreshTreeThrottler = this._register(new Throttler());
  }
  clearAllPending() {
    this.searchView.getControl().cancelAllRefreshPromises(true);
  }
  async queue(e4) {
    if (e4) {
      this.queuedIChangeEvents.push(e4);
    }
    return this.refreshTreeThrottler.queue(this.refreshTreeUsingQueue.bind(this));
  }
  async refreshTreeUsingQueue() {
    const aggregateChangeEvent = this.queuedIChangeEvents.length === 0 ? void 0 : {
      elements: this.queuedIChangeEvents.map((e4) => e4.elements).flat(),
      added: this.queuedIChangeEvents.some((e4) => e4.added),
      removed: this.queuedIChangeEvents.some((e4) => e4.removed),
      clearingAll: this.queuedIChangeEvents.some((e4) => e4.clearingAll)
    };
    this.queuedIChangeEvents = [];
    return this.refreshTree(aggregateChangeEvent);
  }
  async retrieveFileStats() {
    const files = this.searchView.model.searchResult.matches().filter((f) => !f.fileStat).map((f) => f.resolveFileStat(this.fileService));
    await Promise.all(files);
  }
  async refreshTree(event) {
    const searchConfig = this.geSearchConfig();
    if (!event || event.added || event.removed) {
      if (searchConfig.sortOrder === "modified" /* Modified */) {
        await this.retrieveFileStats().then(() => this.searchView.getControl().updateChildren(void 0));
      } else {
        await this.searchView.getControl().updateChildren(void 0);
      }
    } else {
      if (searchConfig.sortOrder === "countAscending" /* CountAscending */ || searchConfig.sortOrder === "countDescending" /* CountDescending */) {
        await this.searchView.getControl().updateChildren(void 0);
      } else {
        const treeHasAllElements = event.elements.every((elem) => this.searchView.getControl().hasNode(elem));
        if (treeHasAllElements) {
          await Promise.all(event.elements.map(async (element) => {
            await this.searchView.getControl().updateChildren(element);
            this.searchView.getControl().rerender(element);
          }));
        } else {
          this.searchView.getControl().updateChildren(void 0);
        }
      }
    }
  }
};

RefreshTreeController = __decorateClass([
  __decorateParam(2, IFileService)
], RefreshTreeController);
export { getEditorSelectionFromMatch, getSelectionTextFromEditor, $97, SEARCH_CANCELLED_MESSAGE, DEBOUNCE_DELAY, SearchView, SearchLinkButton, SearchViewDataSource, RefreshTreeController };
