// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { QueryBuilder } from "./module-1312.mjs";
import { SearchModelImpl } from "./module-3113.mjs";
import { PickerEditorState } from "./module-1518.mjs";
import { Sequencer } from "./module-0036.mjs";
import { getOutOfWorkspaceEditorResources } from "./module-1216.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Event2 } from "./module-0017.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { VIEW_ID } from "./module-0999.mjs";
import { getSelectionKeyboardEvent } from "./module-0636.mjs";
import { searchComparer } from "./module-2835.mjs";
import { searchActivityBarIcon, searchDetailsIcon, searchOpenInFileIcon } from "./module-2829.mjs";
import { basenameOrAuthority, dirname2 } from "./module-0034.mjs";
import { getEditorSelectionFromMatch } from "./module-2858.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess.ts
var TEXT_SEARCH_QUICK_ACCESS_PREFIX = "%";

var DEFAULT_TEXT_QUERY_BUILDER_OPTIONS = {
  _reason: "quickAccessSearch",
  disregardIgnoreFiles: false,
  disregardExcludeSettings: false,
  onlyOpenEditors: false,
  expandPatterns: true
};

var MAX_FILES_SHOWN = 30;

var MAX_RESULTS_PER_FILE = 10;

var DEBOUNCE_DELAY2 = 75;

var TextSearchQuickAccess = class extends PickerQuickAccessProvider {
  constructor(_instantiationService, _contextService, _editorService, _labelService, _viewsService, _configurationService) {
    super(TEXT_SEARCH_QUICK_ACCESS_PREFIX, { canAcceptInBackground: true, shouldSkipTrimPickFilter: true });
    this._instantiationService = _instantiationService;
    this._contextService = _contextService;
    this._editorService = _editorService;
    this._labelService = _labelService;
    this._viewsService = _viewsService;
    this._configurationService = _configurationService;
    this.currentAsyncSearch = Promise.resolve({
      results: [],
      messages: []
    });
    this.queryBuilder = this._instantiationService.createInstance(QueryBuilder);
    this.searchModel = this._register(this._instantiationService.createInstance(SearchModelImpl));
    this.editorViewState = this._register(this._instantiationService.createInstance(PickerEditorState));
    this.searchModel.location = 1 /* QUICK_ACCESS */;
    this.editorSequencer = new Sequencer();
  }
  _getTextQueryBuilderOptions(charsPerLine) {
    return {
      ...DEFAULT_TEXT_QUERY_BUILDER_OPTIONS,
      ...{
        extraFileResources: this._instantiationService.invokeFunction(getOutOfWorkspaceEditorResources),
        maxResults: this.configuration.maxResults ?? void 0,
        isSmartCase: this.configuration.smartCase
      },
      previewOptions: {
        matchLines: 1,
        charsPerLine
      }
    };
  }
  dispose() {
    this.searchModel.dispose();
    super.dispose();
  }
  provide(picker, token, runOptions2) {
    const disposables = new DisposableStore();
    if (TEXT_SEARCH_QUICK_ACCESS_PREFIX.length < picker.value.length) {
      picker.valueSelection = [TEXT_SEARCH_QUICK_ACCESS_PREFIX.length, picker.value.length];
    }
    picker.buttons = [{
      location: 2 /* Inline */,
      iconClass: ThemeIcon.asClassName(Codicon.goToSearch),
      tooltip: localize(18975, null)
    }];
    this.editorViewState.reset();
    disposables.add(picker.onDidTriggerButton(async () => {
      await this.moveToSearchViewlet(void 0);
      picker.hide();
    }));
    const onDidChangeActive = () => {
      const [item] = picker.activeItems;
      if (item?.match) {
        this.editorViewState.set();
        const itemMatch = item.match;
        this.editorSequencer.queue(async () => {
          await this.editorViewState.openTransientEditor({
            resource: itemMatch.parent().resource,
            options: { preserveFocus: true, revealIfOpened: true, ignoreError: true, selection: itemMatch.range() }
          });
        });
      }
    };
    disposables.add(Event2.debounce(picker.onDidChangeActive, (last, event) => event, DEBOUNCE_DELAY2, true)(onDidChangeActive));
    disposables.add(Event2.once(picker.onWillHide)(({ reason }) => {
      if (reason === 2 /* Gesture */) {
        this.editorViewState.restore();
      }
    }));
    disposables.add(Event2.once(picker.onDidHide)(({ reason }) => {
      this.searchModel.searchResult.toggleHighlights(false);
    }));
    disposables.add(super.provide(picker, token, runOptions2));
    disposables.add(picker.onDidAccept(() => this.searchModel.searchResult.toggleHighlights(false)));
    return disposables;
  }
  get configuration() {
    const editorConfig = this._configurationService.getValue().workbench?.editor;
    const searchConfig = this._configurationService.getValue().search;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
      preserveInput: searchConfig.quickAccess.preserveInput,
      maxResults: searchConfig.maxResults,
      smartCase: searchConfig.smartCase,
      sortOrder: searchConfig.sortOrder
    };
  }
  get defaultFilterValue() {
    if (this.configuration.preserveInput) {
      return 1 /* LAST */;
    }
    return void 0;
  }
  doSearch(contentPattern, token) {
    if (contentPattern === "") {
      return void 0;
    }
    const folderResources = this._contextService.getWorkspace().folders;
    const content2 = {
      pattern: contentPattern
    };
    this.searchModel.searchResult.toggleHighlights(false);
    const charsPerLine = content2.isRegExp ? 1e4 : 1e3;
    const query = this.queryBuilder.text(content2, folderResources.map((folder) => folder.uri), this._getTextQueryBuilderOptions(charsPerLine));
    const result = this.searchModel.search(query, void 0, token);
    const getAsyncResults = async () => {
      this.currentAsyncSearch = result.asyncResults;
      await result.asyncResults;
      const syncResultURIs = new ResourceSet(result.syncResults.map((e) => e.resource));
      return this.searchModel.searchResult.matches(false).filter((e) => !syncResultURIs.has(e.resource));
    };
    return {
      syncResults: this.searchModel.searchResult.matches(false),
      asyncResults: getAsyncResults()
    };
  }
  async moveToSearchViewlet(currentElem) {
    this._viewsService.openView(VIEW_ID, false);
    const viewlet = this._viewsService.getActiveViewWithId(VIEW_ID);
    await viewlet.replaceSearchModel(this.searchModel, this.currentAsyncSearch);
    this.searchModel = this._instantiationService.createInstance(SearchModelImpl);
    this.searchModel.location = 1 /* QUICK_ACCESS */;
    const viewer = viewlet?.getControl();
    if (currentElem && viewer && viewer.hasNode(currentElem)) {
      viewer.setFocus([currentElem], getSelectionKeyboardEvent());
      viewer.setSelection([currentElem], getSelectionKeyboardEvent());
      viewer.reveal(currentElem);
    } else {
      viewlet.searchAndReplaceWidget.focus();
    }
  }
  _getPicksFromMatches(matches2, limit, firstFile) {
    matches2 = matches2.sort((a, b) => {
      if (firstFile) {
        if (firstFile === a.resource) {
          return -1;
        } else if (firstFile === b.resource) {
          return 1;
        }
      }
      return searchComparer(a, b, this.configuration.sortOrder);
    });
    const files = matches2.length > limit ? matches2.slice(0, limit) : matches2;
    const picks = [];
    for (let fileIndex = 0; fileIndex < matches2.length; fileIndex++) {
      if (fileIndex === limit) {
        picks.push({
          type: "separator"
        });
        picks.push({
          label: localize(18979, null),
          iconClass: ThemeIcon.asClassName(searchDetailsIcon),
          accept: async () => {
            await this.moveToSearchViewlet(matches2[limit]);
          }
        });
        break;
      }
      const iFileInstanceMatch = files[fileIndex];
      const label3 = basenameOrAuthority(iFileInstanceMatch.resource);
      const description = this._labelService.getUriLabel(dirname2(iFileInstanceMatch.resource), { relative: true });
      picks.push({
        label: label3,
        type: "separator",
        description,
        buttons: [{
          iconClass: ThemeIcon.asClassName(searchOpenInFileIcon),
          tooltip: localize(18978, null)
        }],
        trigger: async () => {
          await this.handleAccept(iFileInstanceMatch, {});
          return 1 /* CLOSE_PICKER */;
        }
      });
      const results = iFileInstanceMatch.matches() ?? [];
      for (let matchIndex = 0; matchIndex < results.length; matchIndex++) {
        const element = results[matchIndex];
        if (matchIndex === MAX_RESULTS_PER_FILE) {
          picks.push({
            label: localize(18977, null),
            iconClass: ThemeIcon.asClassName(searchDetailsIcon),
            accept: async () => {
              await this.moveToSearchViewlet(element);
            }
          });
          break;
        }
        const preview = element.preview();
        const previewText = (preview.before + preview.inside + preview.after).trim().substring(0, 999);
        const match2 = [{
          start: preview.before.length,
          end: preview.before.length + preview.inside.length
        }];
        picks.push({
          label: `${previewText}`,
          highlights: {
            label: match2
          },
          buttons: [{
            iconClass: ThemeIcon.asClassName(searchActivityBarIcon),
            tooltip: localize(18980, null)
          }],
          ariaLabel: `Match at location ${element.range().startLineNumber}:${element.range().startColumn} - ${previewText}`,
          accept: async (keyMods, event) => {
            await this.handleAccept(iFileInstanceMatch, {
              keyMods,
              selection: getEditorSelectionFromMatch(element, this.searchModel),
              preserveFocus: event.inBackground,
              forcePinned: event.inBackground
            });
          },
          trigger: async () => {
            await this.moveToSearchViewlet(element);
            return 1 /* CLOSE_PICKER */;
          },
          match: element
        });
      }
    }
    return picks;
  }
  async handleAccept(iFileInstanceMatch, options3) {
    const editorOptions2 = {
      preserveFocus: options3.preserveFocus,
      pinned: options3.keyMods?.ctrlCmd || options3.forcePinned || this.configuration.openEditorPinned,
      selection: options3.selection
    };
    const targetGroup = options3.keyMods?.alt || this.configuration.openEditorPinned && options3.keyMods?.ctrlCmd || options3.forceOpenSideBySide ? SIDE_GROUP : ACTIVE_GROUP;
    await this._editorService.openEditor({
      resource: iFileInstanceMatch.resource,
      options: editorOptions2
    }, targetGroup);
  }
  _getPicks(contentPattern, disposables, token) {
    const searchModelAtTimeOfSearch = this.searchModel;
    if (contentPattern === "") {
      this.searchModel.searchResult.clear();
      return [{
        label: localize(18974, null)
      }];
    }
    const conditionalTokenCts = disposables.add(new CancellationTokenSource());
    disposables.add(token.onCancellationRequested(() => {
      if (searchModelAtTimeOfSearch.location === 1 /* QUICK_ACCESS */) {
        conditionalTokenCts.cancel();
      }
    }));
    const allMatches = this.doSearch(contentPattern, conditionalTokenCts.token);
    if (!allMatches) {
      return null;
    }
    const matches2 = allMatches.syncResults;
    const syncResult = this._getPicksFromMatches(matches2, MAX_FILES_SHOWN, this._editorService.activeEditor?.resource);
    if (syncResult.length > 0) {
      this.searchModel.searchResult.toggleHighlights(true);
    }
    if (matches2.length >= MAX_FILES_SHOWN) {
      return syncResult;
    }
    return {
      picks: syncResult,
      additionalPicks: allMatches.asyncResults.then((asyncResults) => asyncResults.length + syncResult.length === 0 ? [{
        label: localize(18976, null)
      }] : this._getPicksFromMatches(asyncResults, MAX_FILES_SHOWN - matches2.length)).then((picks) => {
        if (picks.length > 0) {
          this.searchModel.searchResult.toggleHighlights(true);
        }
        return picks;
      })
    };
  }
};

TextSearchQuickAccess = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IViewsService),
  __decorateParam(5, IConfigurationService)
], TextSearchQuickAccess);
export { TEXT_SEARCH_QUICK_ACCESS_PREFIX, DEFAULT_TEXT_QUERY_BUILDER_OPTIONS, MAX_FILES_SHOWN, MAX_RESULTS_PER_FILE, DEBOUNCE_DELAY2, TextSearchQuickAccess };
