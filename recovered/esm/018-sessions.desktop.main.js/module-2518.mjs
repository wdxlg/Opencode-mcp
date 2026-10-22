// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/anythingQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1520.mjs";
import { IQuickInputService, QuickPickItemScorerAccessor, quickPickItemScorerAccessor } from "./module-0536.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { Lazy } from "./module-0028.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1552.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { PickerEditorState } from "./module-1510.mjs";
import { Event2 } from "./module-0017.mjs";
import { QueryBuilder } from "./module-1311.mjs";
import { SymbolsQuickAccessProvider } from "./module-2515.mjs";
import { GotoSymbolQuickAccessProvider } from "./module-2516.mjs";
import { localize } from "./module-0001.mjs";
import { extractRangeFromFilter, getOutOfWorkspaceEditorResources } from "./module-1216.mjs";
import { compareItemsByFuzzyScore, prepareQuery, scoreItemFuzzy } from "./module-1522.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { top } from "./module-0007.mjs";
import { FileQueryCacheState } from "./module-2514.mjs";
import { untildify } from "./module-0711.mjs";
import { Schemas } from "./module-0033.mjs";
import { basenameOrAuthority, dirname2, toLocalResource } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { ASK_QUICK_QUESTION_ACTION_ID } from "./module-2517.mjs";
import { stripIcons } from "./module-0461.mjs";
import { EditorResourceAccessor, isEditorInput } from "./module-0926.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISearchService } from "./module-1000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IPathService } from "./module-0939.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService, IQuickChatService } from "./module-0982.mjs";
import { ILogService } from "./module-0095.mjs";
import { ICustomEditorLabelService } from "./module-0932.mjs";


// src/vs/workbench/contrib/search/browser/anythingQuickAccess.ts
function isEditorSymbolQuickPickItem(pick) {
  const candidate = pick;
  return !!candidate?.range && !!candidate.resource;
}

var AnythingQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(instantiationService, searchService, contextService, pathService, environmentService, fileService, labelService, modelService, languageService, workingCopyService, configurationService, editorService, historyService, filesConfigurationService, textModelService, uriIdentityService, quickInputService, keybindingService, contextKeyService, quickChatService, logService, customEditorLabelService, chatWidgetService) {
    super(AnythingQuickAccessProvider.PREFIX, {
      canAcceptInBackground: true,
      noResultsPick: AnythingQuickAccessProvider.NO_RESULTS_PICK
    });
    this.instantiationService = instantiationService;
    this.searchService = searchService;
    this.contextService = contextService;
    this.pathService = pathService;
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.labelService = labelService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.workingCopyService = workingCopyService;
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.historyService = historyService;
    this.filesConfigurationService = filesConfigurationService;
    this.textModelService = textModelService;
    this.uriIdentityService = uriIdentityService;
    this.quickInputService = quickInputService;
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.quickChatService = quickChatService;
    this.logService = logService;
    this.customEditorLabelService = customEditorLabelService;
    this.chatWidgetService = chatWidgetService;
    //#region Editor History
    this.labelOnlyEditorHistoryPickAccessor = new QuickPickItemScorerAccessor({ skipDescription: true });
    //#endregion
    //#region File Search
    this.fileQueryDelayer = this._register(new ThrottledDelayer(AnythingQuickAccessProvider.TYPING_SEARCH_DELAY));
    //#endregion
    //#region Command Center (if enabled)
    this.lazyRegistry = new Lazy(() => Registry.as(Extensions18.Quickaccess));
    this.pickState = this._register(new class extends Disposable {
      constructor(provider, instantiationService2) {
        super();
        this.provider = provider;
        this.picker = void 0;
        this.scorerCache = /* @__PURE__ */ Object.create(null);
        this.fileQueryCache = void 0;
        this.lastOriginalFilter = void 0;
        this.lastFilter = void 0;
        this.lastRange = void 0;
        this.lastGlobalPicks = void 0;
        this.isQuickNavigating = void 0;
        this.editorViewState = this._register(instantiationService2.createInstance(PickerEditorState));
      }
      set(picker) {
        this.picker = picker;
        Event2.once(picker.onDispose)(() => {
          if (picker === this.picker) {
            this.picker = void 0;
          }
        });
        const isQuickNavigating = !!picker.quickNavigate;
        if (!isQuickNavigating) {
          this.fileQueryCache = this.provider.createFileQueryCache();
          this.scorerCache = /* @__PURE__ */ Object.create(null);
        }
        this.isQuickNavigating = isQuickNavigating;
        this.lastOriginalFilter = void 0;
        this.lastFilter = void 0;
        this.lastRange = void 0;
        this.lastGlobalPicks = void 0;
        this.editorViewState.reset();
      }
    }(this, instantiationService));
    this.fileQueryBuilder = this.instantiationService.createInstance(QueryBuilder);
    this.workspaceSymbolsQuickAccess = this._register(instantiationService.createInstance(SymbolsQuickAccessProvider));
    this.editorSymbolsQuickAccess = this.instantiationService.createInstance(GotoSymbolQuickAccessProvider);
  }
  static {
    this.PREFIX = "";
  }
  static {
    this.NO_RESULTS_PICK = {
      label: localize(18966, null)
    };
  }
  static {
    this.MAX_RESULTS = 512;
  }
  static {
    this.TYPING_SEARCH_DELAY = 200;
  }
  static {
    // this delay accommodates for the user typing a word and then stops typing to start searching
    this.SYMBOL_PICKS_MERGE_DELAY = 200;
  }
  get defaultFilterValue() {
    if (this.configuration.preserveInput) {
      return 1 /* LAST */;
    }
    return void 0;
  }
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    const searchConfig = this.configurationService.getValue().search;
    const quickAccessConfig = this.configurationService.getValue().workbench.quickOpen;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
      openSideBySideDirection: editorConfig?.openSideBySideDirection,
      includeSymbols: searchConfig?.quickOpen?.includeSymbols,
      includeHistory: searchConfig?.quickOpen?.includeHistory ?? true,
      historyFilterSortOrder: searchConfig?.quickOpen?.history?.filterSortOrder,
      preserveInput: quickAccessConfig?.preserveInput
    };
  }
  provide(picker, token, runOptions2) {
    const disposables = new DisposableStore();
    this.pickState.set(picker);
    const editorDecorationsDisposable = disposables.add(new MutableDisposable());
    disposables.add(picker.onDidChangeActive(() => {
      editorDecorationsDisposable.value = void 0;
      const [item] = picker.activeItems;
      if (isEditorSymbolQuickPickItem(item)) {
        editorDecorationsDisposable.value = this.decorateAndRevealSymbolRange(item);
      }
    }));
    disposables.add(Event2.once(picker.onDidHide)(({ reason }) => {
      if (reason === 2 /* Gesture */) {
        this.pickState.editorViewState.restore();
      }
    }));
    disposables.add(super.provide(picker, token, runOptions2));
    return disposables;
  }
  decorateAndRevealSymbolRange(pick) {
    const activeEditor = this.editorService.activeEditor;
    if (!this.uriIdentityService.extUri.isEqual(pick.resource, activeEditor?.resource)) {
      return Disposable.None;
    }
    const activeEditorControl = this.editorService.activeTextEditorControl;
    if (!activeEditorControl) {
      return Disposable.None;
    }
    this.pickState.editorViewState.set();
    activeEditorControl.revealRangeInCenter(pick.range.selection, 0 /* Smooth */);
    this.addDecorations(activeEditorControl, pick.range.decoration);
    return toDisposable(() => this.clearDecorations(activeEditorControl));
  }
  _getPicks(originalFilter, disposables, token, runOptions2) {
    const filterWithRange = extractRangeFromFilter(originalFilter, [GotoSymbolQuickAccessProvider.PREFIX]);
    let filter2;
    if (filterWithRange) {
      filter2 = filterWithRange.filter;
    } else {
      filter2 = originalFilter;
    }
    this.pickState.lastRange = filterWithRange?.range;
    if (originalFilter !== this.pickState.lastOriginalFilter && filter2 === this.pickState.lastFilter) {
      return null;
    }
    const lastWasFiltering = !!this.pickState.lastOriginalFilter;
    this.pickState.lastOriginalFilter = originalFilter;
    this.pickState.lastFilter = filter2;
    const picks = this.pickState.picker?.items;
    const activePick = this.pickState.picker?.activeItems[0];
    if (picks && activePick) {
      const activePickIsEditorSymbol = isEditorSymbolQuickPickItem(activePick);
      const activePickIsNoResultsInEditorSymbols = activePick === AnythingQuickAccessProvider.NO_RESULTS_PICK && filter2.indexOf(GotoSymbolQuickAccessProvider.PREFIX) >= 0;
      if (!activePickIsEditorSymbol && !activePickIsNoResultsInEditorSymbols) {
        this.pickState.lastGlobalPicks = {
          items: picks,
          active: activePick
        };
      }
    }
    return this.doGetPicks(
      filter2,
      {
        ...runOptions2,
        enableEditorSymbolSearch: lastWasFiltering
      },
      disposables,
      token
    );
  }
  doGetPicks(filter2, options3, disposables, token) {
    const query = prepareQuery(filter2);
    if (options3.enableEditorSymbolSearch) {
      const editorSymbolPicks = this.getEditorSymbolPicks(query, disposables, token);
      if (editorSymbolPicks) {
        return editorSymbolPicks;
      }
    }
    const activePick = this.pickState.picker?.activeItems[0];
    if (isEditorSymbolQuickPickItem(activePick) && this.pickState.lastGlobalPicks) {
      return this.pickState.lastGlobalPicks;
    }
    const historyEditorPicks = this.getEditorHistoryPicks(query);
    let picks = new Array();
    if (options3.additionPicks) {
      for (const pick of options3.additionPicks) {
        if (pick.type === "separator") {
          picks.push(pick);
          continue;
        }
        if (!query.original) {
          pick.highlights = void 0;
          picks.push(pick);
          continue;
        }
        const { score: score3, labelMatch, descriptionMatch } = scoreItemFuzzy(pick, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache);
        if (!score3) {
          continue;
        }
        pick.highlights = {
          label: labelMatch,
          description: descriptionMatch
        };
        picks.push(pick);
      }
    }
    if (this.pickState.isQuickNavigating) {
      if (picks.length > 0) {
        picks.push({ type: "separator", label: localize(18969, null) });
      }
      picks = historyEditorPicks;
    } else {
      if (options3.includeHelp) {
        picks.push(...this.getHelpPicks(query, token, options3));
      }
      if (historyEditorPicks.length !== 0) {
        picks.push({ type: "separator", label: localize(18969, null) });
        picks.push(...historyEditorPicks);
      }
    }
    return {
      // Fast picks: help (if included) & editor history
      picks: options3.filter ? picks.filter((p) => options3.filter?.(p)) : picks,
      // Slow picks: files and symbols
      additionalPicks: (async () => {
        const additionalPicksExcludes = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
        for (const historyEditorPick of historyEditorPicks) {
          if (historyEditorPick.resource) {
            additionalPicksExcludes.set(historyEditorPick.resource, true);
          }
        }
        let additionalPicks = await this.getAdditionalPicks(query, additionalPicksExcludes, Boolean(this.configuration?.includeSymbols), token);
        if (options3.filter) {
          additionalPicks = additionalPicks.filter((p) => options3.filter?.(p));
        }
        if (token.isCancellationRequested) {
          return [];
        }
        return additionalPicks.length > 0 ? [
          { type: "separator", label: this.configuration.includeSymbols ? localize(18962, null) : localize(18964, null) },
          ...additionalPicks
        ] : [];
      })(),
      // allow some time to merge files and symbols to reduce flickering
      mergeDelay: AnythingQuickAccessProvider.SYMBOL_PICKS_MERGE_DELAY
    };
  }
  async getAdditionalPicks(query, excludes, includeSymbols, token) {
    const [filePicks, symbolPicks] = await Promise.all([
      this.getFilePicks(query, excludes, token),
      this.getWorkspaceSymbolPicks(query, includeSymbols, token)
    ]);
    if (token.isCancellationRequested) {
      return [];
    }
    const sortedAnythingPicks = top(
      [...filePicks, ...symbolPicks],
      (anyPickA, anyPickB) => compareItemsByFuzzyScore(anyPickA, anyPickB, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache),
      AnythingQuickAccessProvider.MAX_RESULTS
    );
    const filteredAnythingPicks = [];
    for (const anythingPick of sortedAnythingPicks) {
      if (anythingPick.highlights) {
        filteredAnythingPicks.push(anythingPick);
      } else {
        const { score: score3, labelMatch, descriptionMatch } = scoreItemFuzzy(anythingPick, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache);
        if (!score3) {
          continue;
        }
        anythingPick.highlights = {
          label: labelMatch,
          description: descriptionMatch
        };
        filteredAnythingPicks.push(anythingPick);
      }
    }
    return filteredAnythingPicks;
  }
  getEditorHistoryPicks(query) {
    const configuration2 = this.configuration;
    if (!query.normalized) {
      return this.historyService.getHistory().map((editor) => this.createAnythingPick(editor, configuration2));
    }
    if (!this.configuration.includeHistory) {
      return [];
    }
    const editorHistoryScorerAccessor = query.containsPathSeparator ? quickPickItemScorerAccessor : this.labelOnlyEditorHistoryPickAccessor;
    const editorHistoryPicks = [];
    for (const editor of this.historyService.getHistory()) {
      const resource = editor.resource;
      if (!resource) {
        continue;
      }
      const editorHistoryPick = this.createAnythingPick(editor, configuration2);
      const { score: score3, labelMatch, descriptionMatch } = scoreItemFuzzy(editorHistoryPick, query, false, editorHistoryScorerAccessor, this.pickState.scorerCache);
      if (!score3) {
        continue;
      }
      editorHistoryPick.highlights = {
        label: labelMatch,
        description: descriptionMatch
      };
      editorHistoryPicks.push(editorHistoryPick);
    }
    if (this.configuration.historyFilterSortOrder === "recency") {
      return editorHistoryPicks;
    }
    return editorHistoryPicks.sort((editorA, editorB) => compareItemsByFuzzyScore(editorA, editorB, query, false, editorHistoryScorerAccessor, this.pickState.scorerCache));
  }
  createFileQueryCache() {
    return new FileQueryCacheState(
      (cacheKey2) => this.fileQueryBuilder.file(this.contextService.getWorkspace().folders, this.getFileQueryOptions({ cacheKey: cacheKey2 })),
      (query) => this.searchService.fileSearch(query),
      (cacheKey2) => this.searchService.clearCache(cacheKey2),
      this.pickState.fileQueryCache
    ).load();
  }
  async getFilePicks(query, excludes, token) {
    if (!query.normalized) {
      return [];
    }
    const absolutePathResult = await this.getAbsolutePathFileResult(query, token);
    if (token.isCancellationRequested) {
      return [];
    }
    let fileMatches;
    if (absolutePathResult) {
      if (excludes.has(absolutePathResult)) {
        return [];
      }
      const absolutePathPick = this.createAnythingPick(absolutePathResult, this.configuration);
      absolutePathPick.highlights = {
        label: [{ start: 0, end: absolutePathPick.label.length }],
        description: absolutePathPick.description ? [{ start: 0, end: absolutePathPick.description.length }] : void 0
      };
      return [absolutePathPick];
    }
    if (this.pickState.fileQueryCache?.isLoaded) {
      fileMatches = await this.doFileSearch(query, token);
    } else {
      fileMatches = await this.fileQueryDelayer.trigger(async () => {
        if (token.isCancellationRequested) {
          return [];
        }
        return this.doFileSearch(query, token);
      });
    }
    if (token.isCancellationRequested) {
      return [];
    }
    const configuration2 = this.configuration;
    return fileMatches.filter((resource) => !excludes.has(resource)).map((resource) => this.createAnythingPick(resource, configuration2));
  }
  async doFileSearch(query, token) {
    const [fileSearchResults, relativePathFileResults] = await Promise.all([
      // File search: this is a search over all files of the workspace using the provided pattern
      this.getFileSearchResults(query, token),
      // Relative path search: we also want to consider results that match files inside the workspace
      // by looking for relative paths that the user typed as query. This allows to return even excluded
      // results into the picker if found (e.g. helps for opening compilation results that are otherwise
      // excluded)
      this.getRelativePathFileResults(query, token)
    ]);
    if (token.isCancellationRequested) {
      return [];
    }
    if (!relativePathFileResults) {
      return fileSearchResults;
    }
    const relativePathFileResultsMap = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
    for (const relativePathFileResult of relativePathFileResults) {
      relativePathFileResultsMap.set(relativePathFileResult, true);
    }
    return [
      ...fileSearchResults.filter((result) => !relativePathFileResultsMap.has(result)),
      ...relativePathFileResults
    ];
  }
  async getFileSearchResults(query, token) {
    let filePattern2 = "";
    if (query.values && query.values.length > 1) {
      filePattern2 = query.values[0].original;
    } else {
      filePattern2 = query.original;
    }
    const fileSearchResults = await this.doGetFileSearchResults(filePattern2, token);
    if (token.isCancellationRequested) {
      return [];
    }
    if (fileSearchResults.limitHit && query.values && query.values.length > 1) {
      const additionalFileSearchResults = await this.doGetFileSearchResults(query.original, token);
      if (token.isCancellationRequested) {
        return [];
      }
      const existingFileSearchResultsMap = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
      for (const fileSearchResult of fileSearchResults.results) {
        existingFileSearchResultsMap.set(fileSearchResult.resource, true);
      }
      for (const additionalFileSearchResult of additionalFileSearchResults.results) {
        if (!existingFileSearchResultsMap.has(additionalFileSearchResult.resource)) {
          fileSearchResults.results.push(additionalFileSearchResult);
        }
      }
    }
    return fileSearchResults.results.map((result) => result.resource);
  }
  doGetFileSearchResults(filePattern2, token) {
    const start = Date.now();
    return this.searchService.fileSearch(
      this.fileQueryBuilder.file(
        this.contextService.getWorkspace().folders,
        this.getFileQueryOptions({
          filePattern: filePattern2,
          cacheKey: this.pickState.fileQueryCache?.cacheKey,
          maxResults: AnythingQuickAccessProvider.MAX_RESULTS
        })
      ),
      token
    ).finally(() => {
      this.logService.trace(`QuickAccess fileSearch ${Date.now() - start}ms`);
    });
  }
  getFileQueryOptions(input) {
    return {
      _reason: "openFileHandler",
      // used for telemetry - do not change
      extraFileResources: this.instantiationService.invokeFunction(getOutOfWorkspaceEditorResources),
      filePattern: input.filePattern || "",
      cacheKey: input.cacheKey,
      maxResults: input.maxResults || 0,
      sortByScore: true
    };
  }
  async getAbsolutePathFileResult(query, token) {
    if (!query.containsPathSeparator) {
      return;
    }
    const userHome = await this.pathService.userHome();
    const detildifiedQuery = untildify(query.original, userHome.scheme === Schemas.file ? userHome.fsPath : userHome.path);
    if (token.isCancellationRequested) {
      return;
    }
    const isAbsolutePathQuery = (await this.pathService.path).isAbsolute(detildifiedQuery);
    if (token.isCancellationRequested) {
      return;
    }
    if (isAbsolutePathQuery) {
      const resource = toLocalResource(
        await this.pathService.fileURI(detildifiedQuery),
        this.environmentService.remoteAuthority,
        this.pathService.defaultUriScheme
      );
      if (token.isCancellationRequested) {
        return;
      }
      try {
        const stat = await this.fileService.stat(resource);
        if (stat.isFile) {
          return await this.matchFilenameCasing(resource);
        }
      } catch (error) {
      }
    }
    return;
  }
  async getRelativePathFileResults(query, token) {
    if (!query.containsPathSeparator) {
      return;
    }
    const isAbsolutePathQuery = (await this.pathService.path).isAbsolute(query.original);
    if (!isAbsolutePathQuery) {
      const resources = [];
      for (const folder of this.contextService.getWorkspace().folders) {
        if (token.isCancellationRequested) {
          break;
        }
        const resource = toLocalResource(
          folder.toResource(query.original),
          this.environmentService.remoteAuthority,
          this.pathService.defaultUriScheme
        );
        try {
          const stat = await this.fileService.stat(resource);
          if (stat.isFile) {
            resources.push(await this.matchFilenameCasing(resource));
          }
        } catch (error) {
        }
      }
      return resources;
    }
    return;
  }
  /**
   * Attempts to match the filename casing to file system by checking the parent folder's children.
   */
  async matchFilenameCasing(resource) {
    const parent = dirname2(resource);
    const stat = await this.fileService.resolve(parent, { resolveTo: [resource] });
    if (stat?.children) {
      const match2 = stat.children.find((child) => this.uriIdentityService.extUri.isEqual(child.resource, resource));
      if (match2) {
        return URI.joinPath(parent, match2.name);
      }
    }
    return resource;
  }
  getHelpPicks(query, token, runOptions2) {
    if (query.normalized) {
      return [];
    }
    const providers2 = this.lazyRegistry.value.getQuickAccessProviders(this.contextKeyService).filter((p) => p.helpEntries.some((h3) => h3.commandCenterOrder !== void 0)).flatMap((provider) => provider.helpEntries.filter((h3) => h3.commandCenterOrder !== void 0).map((helpEntry) => {
      const providerSpecificOptions = {
        ...runOptions2,
        includeHelp: provider.prefix === AnythingQuickAccessProvider.PREFIX ? false : runOptions2?.includeHelp
      };
      const label3 = helpEntry.commandCenterLabel ?? helpEntry.description;
      return {
        label: label3,
        description: helpEntry.prefix ?? provider.prefix,
        commandCenterOrder: helpEntry.commandCenterOrder,
        keybinding: helpEntry.commandId ? this.keybindingService.lookupKeybinding(helpEntry.commandId) : void 0,
        ariaLabel: localize(18965, null, label3, helpEntry.description),
        accept: () => {
          this.quickInputService.quickAccess.show(provider.prefix, {
            preserveValue: true,
            providerOptions: providerSpecificOptions
          });
        }
      };
    }));
    if (this.quickChatService.enabled) {
      providers2.push({
        label: localize(18960, null),
        commandCenterOrder: 30,
        keybinding: this.keybindingService.lookupKeybinding(ASK_QUICK_QUESTION_ACTION_ID),
        accept: () => this.quickChatService.toggle()
      });
    }
    return providers2.sort((a, b) => a.commandCenterOrder - b.commandCenterOrder);
  }
  async getWorkspaceSymbolPicks(query, includeSymbols, token) {
    if (!query.normalized || // we need a value for search for
    !includeSymbols || // we need to enable symbols in search
    this.pickState.lastRange) {
      return [];
    }
    return this.workspaceSymbolsQuickAccess.getSymbolPicks(query.original, {
      skipLocal: true,
      skipSorting: true,
      delay: AnythingQuickAccessProvider.TYPING_SEARCH_DELAY
    }, token);
  }
  getEditorSymbolPicks(query, disposables, token) {
    const filterSegments = query.original.split(GotoSymbolQuickAccessProvider.PREFIX);
    const filter2 = filterSegments.length > 1 ? filterSegments[filterSegments.length - 1].trim() : void 0;
    if (typeof filter2 !== "string") {
      return null;
    }
    const activeGlobalPick = this.pickState.lastGlobalPicks?.active;
    if (!activeGlobalPick) {
      return null;
    }
    const activeGlobalResource = activeGlobalPick.resource;
    if (!activeGlobalResource || !this.fileService.hasProvider(activeGlobalResource) && activeGlobalResource.scheme !== Schemas.untitled) {
      return null;
    }
    if (activeGlobalPick.label.includes(GotoSymbolQuickAccessProvider.PREFIX) || activeGlobalPick.description?.includes(GotoSymbolQuickAccessProvider.PREFIX)) {
      if (filterSegments.length < 3) {
        return null;
      }
    }
    return this.doGetEditorSymbolPicks(activeGlobalPick, activeGlobalResource, filter2, disposables, token);
  }
  async doGetEditorSymbolPicks(activeGlobalPick, activeGlobalResource, filter2, disposables, token) {
    try {
      this.pickState.editorViewState.set();
      await this.pickState.editorViewState.openTransientEditor({
        resource: activeGlobalResource,
        options: { preserveFocus: true, revealIfOpened: true, ignoreError: true }
      });
    } catch (error) {
      return [];
    }
    if (token.isCancellationRequested) {
      return [];
    }
    let model = this.modelService.getModel(activeGlobalResource);
    if (!model) {
      try {
        const modelReference = disposables.add(await this.textModelService.createModelReference(activeGlobalResource));
        if (token.isCancellationRequested) {
          return [];
        }
        model = modelReference.object.textEditorModel;
      } catch (error) {
        return [];
      }
    }
    const editorSymbolPicks = await this.editorSymbolsQuickAccess.getSymbolPicks(model, filter2, { extraContainerLabel: stripIcons(activeGlobalPick.label) }, disposables, token);
    if (token.isCancellationRequested) {
      return [];
    }
    return editorSymbolPicks.map((editorSymbolPick) => {
      if (editorSymbolPick.type === "separator") {
        return editorSymbolPick;
      }
      return {
        ...editorSymbolPick,
        resource: activeGlobalResource,
        description: editorSymbolPick.description,
        trigger: (buttonIndex, keyMods) => {
          this.openAnything(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, forceOpenSideBySide: true });
          return 1 /* CLOSE_PICKER */;
        },
        accept: (keyMods, event) => this.openAnything(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, preserveFocus: event.inBackground, forcePinned: event.inBackground })
      };
    });
  }
  addDecorations(editor, range2) {
    this.editorSymbolsQuickAccess.addDecorations(editor, range2);
  }
  clearDecorations(editor) {
    this.editorSymbolsQuickAccess.clearDecorations(editor);
  }
  //#endregion
  //#region Helpers
  createAnythingPick(resourceOrEditor, configuration2) {
    const isEditorHistoryEntry = !URI.isUri(resourceOrEditor);
    let resource;
    let label3;
    let description = void 0;
    let isDirty = void 0;
    let extraClasses;
    let icon2 = void 0;
    if (isEditorInput(resourceOrEditor)) {
      resource = EditorResourceAccessor.getOriginalUri(resourceOrEditor);
      label3 = resourceOrEditor.getName();
      description = resourceOrEditor.getDescription();
      isDirty = resourceOrEditor.isDirty() && !resourceOrEditor.isSaving();
      extraClasses = resourceOrEditor.getLabelExtraClasses();
      icon2 = resourceOrEditor.getIcon();
    } else {
      resource = URI.isUri(resourceOrEditor) ? resourceOrEditor : resourceOrEditor.resource;
      const customLabel = this.customEditorLabelService.getName(resource);
      label3 = customLabel || basenameOrAuthority(resource);
      description = this.labelService.getUriLabel(!!customLabel ? resource : dirname2(resource), { relative: true });
      isDirty = this.workingCopyService.isDirty(resource) && !this.filesConfigurationService.hasShortAutoSaveDelay(resource);
      extraClasses = [];
    }
    const labelAndDescription = description ? `${label3} ${description}` : label3;
    const iconClassesValue = new Lazy(() => getIconClasses(this.modelService, this.languageService, resource, void 0, icon2).concat(extraClasses));
    const buttonsValue = new Lazy(() => {
      const openSideBySideDirection = configuration2.openSideBySideDirection;
      const buttons = [];
      buttons.push({
        iconClass: openSideBySideDirection === "right" ? ThemeIcon.asClassName(Codicon.splitHorizontal) : ThemeIcon.asClassName(Codicon.splitVertical),
        tooltip: openSideBySideDirection === "right" ? localize(18968, null) : localize(18967, null)
      });
      if (isEditorHistoryEntry) {
        buttons.push({
          iconClass: isDirty ? "dirty-anything " + ThemeIcon.asClassName(Codicon.circleFilled) : ThemeIcon.asClassName(Codicon.close),
          tooltip: localize(18961, null),
          alwaysVisible: isDirty
        });
      }
      return buttons;
    });
    return {
      resource,
      editor: !URI.isUri(resourceOrEditor) ? resourceOrEditor : void 0,
      label: label3,
      ariaLabel: isDirty ? localize(18963, null, labelAndDescription) : labelAndDescription,
      description,
      iconPath: URI.isUri(icon2) ? { dark: icon2 } : void 0,
      get iconClasses() {
        return iconClassesValue.value;
      },
      get buttons() {
        return buttonsValue.value;
      },
      trigger: (buttonIndex, keyMods) => {
        switch (buttonIndex) {
          // Open to side / below
          case 0:
            this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, forceOpenSideBySide: true });
            return 1 /* CLOSE_PICKER */;
          // Remove from History
          case 1:
            if (!URI.isUri(resourceOrEditor)) {
              this.historyService.removeFromHistory(resourceOrEditor);
              return 3 /* REMOVE_ITEM */;
            }
        }
        return 0 /* NO_ACTION */;
      },
      accept: (keyMods, event) => this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, preserveFocus: event.inBackground, forcePinned: event.inBackground }),
      attach: (keyMods, event) => {
        if (keyMods.shift) {
          const widget = this.chatWidgetService.lastFocusedWidget;
          if (widget && resource) {
            widget.attachmentModel.addContext(widget.attachmentModel.asFileVariableEntry(resource));
          }
          return;
        }
        this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, preserveFocus: event.inBackground, forcePinned: event.inBackground });
      }
    };
  }
  async openAnything(resourceOrEditor, options3) {
    const editorOptions = {
      preserveFocus: options3.preserveFocus,
      pinned: options3.keyMods?.ctrlCmd || options3.forcePinned || this.configuration.openEditorPinned,
      selection: options3.range
    };
    const targetGroup = options3.keyMods?.alt || this.configuration.openEditorPinned && options3.keyMods?.ctrlCmd || options3.forceOpenSideBySide ? SIDE_GROUP : ACTIVE_GROUP;
    if (targetGroup === SIDE_GROUP) {
      await this.pickState.editorViewState.restore();
    }
    if (isEditorInput(resourceOrEditor)) {
      await this.editorService.openEditor(resourceOrEditor, editorOptions, targetGroup);
    } else {
      let resourceEditorInput;
      if (URI.isUri(resourceOrEditor)) {
        resourceEditorInput = {
          resource: resourceOrEditor,
          options: editorOptions
        };
      } else {
        resourceEditorInput = {
          ...resourceOrEditor,
          options: {
            ...resourceOrEditor.options,
            ...editorOptions
          }
        };
      }
      await this.editorService.openEditor(resourceEditorInput, targetGroup);
    }
  }
  //#endregion
};

AnythingQuickAccessProvider = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ISearchService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IPathService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IModelService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IWorkingCopyService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, IHistoryService),
  __decorateParam(13, IFilesConfigurationService),
  __decorateParam(14, ITextModelService),
  __decorateParam(15, IUriIdentityService),
  __decorateParam(16, IQuickInputService),
  __decorateParam(17, IKeybindingService),
  __decorateParam(18, IContextKeyService),
  __decorateParam(19, IQuickChatService),
  __decorateParam(20, ILogService),
  __decorateParam(21, ICustomEditorLabelService),
  __decorateParam(22, IChatWidgetService)
], AnythingQuickAccessProvider);
export { isEditorSymbolQuickPickItem, AnythingQuickAccessProvider };
