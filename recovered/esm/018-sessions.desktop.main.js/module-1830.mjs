// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsEditor2.ts
import { Iterable } from "./module-0011.mjs";
import { SearchResultModel, SettingsTreeGroupElement, SettingsTreeModel, SettingsTreeSettingElement, parseQuery } from "./module-1826.mjs";
import { $, Dimension, EventHelper, EventType, WindowIntervalTimer, addDisposableListener, addStandardDisposableListener, append, findParentWithClass, hide, isAncestorOfActiveElement, isEditableElement, show, trackFocus } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1090.mjs";
import { Disposable, DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { Delayer, createCancelablePromise, raceTimeout } from "./module-0036.mjs";
import { ADVANCED_SETTING_TAG, AGENTS_WINDOW_SETTING_TAG, CONTEXT_AI_SETTING_RESULTS_AVAILABLE, CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_FIRST_ROW_FOCUS, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, EMBEDDINGS_SEARCH_PROVIDER_NAME, ENABLE_LANGUAGE_FILTER, EXTENSION_FETCH_TIMEOUT_MS, EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, FILTER_MODEL_SEARCH_PROVIDER_NAME, ID_SETTING_TAG, IPreferencesSearchService, LANGUAGE_SETTING_TAG, LLM_RANKED_SEARCH_PROVIDER_NAME, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SHOW_AI_RESULTS, SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS, SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH, STRING_MATCH_SEARCH_PROVIDER_NAME, TF_IDF_SEARCH_PROVIDER_NAME, WORKSPACE_TRUST_SETTING_TAG, getExperimentalExtensionToggleData } from "./module-1807.mjs";
import { ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING, IPreferencesService, validateSettingsEditorOptions } from "./module-1293.mjs";
import { registerNavigableContainer } from "./module-1368.mjs";
import { Settings2EditorModel, nullRange } from "./module-1591.mjs";
import { URI } from "./module-0032.mjs";
import { isIOS, isMacintosh } from "./module-0014.mjs";
import { AbstractSettingRenderer, SettingTreeRenderers, SettingsTree, createTocTreeForExtensionSettings, resolveConfiguredUntrustedSettings, resolveSettingsTree } from "./module-1828.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { preferencesAiResultsIcon, preferencesClearInputIcon, preferencesFilterIcon } from "./module-1810.mjs";
import { SuggestEnabledInputWithHistory } from "./module-1814.mjs";
import { settingsHeaderBorder, settingsSashBorder, settingsTextInputBorder } from "./module-1815.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { SettingsTargetsWidget } from "./module-1811.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ActionBar } from "./module-0477.mjs";
import { SettingsSearchFilterDropdownMenuActionViewItem } from "./module-1824.mjs";
import { ToggleActionViewItem } from "./module-0549.mjs";
import { defaultButtonStyles, defaultToggleStyles } from "./module-0513.mjs";
import { status } from "./module-0076.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { APPLICATION_SCOPES, IWorkbenchConfigurationService } from "./module-1198.mjs";
import { editorForeground } from "./module-0229.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TOCTree, TOCTreeModel, createTOCIterator } from "./module-1829.mjs";
import { getCommonlyUsedData, tocData } from "./module-1823.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Color } from "./module-0197.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { StopWatch } from "./module-0016.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IUserDataSyncWorkbenchService } from "./module-1687.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncService } from "./module-1639.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0874.mjs";
import { IProductService } from "./module-0875.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { Button } from "./module-0546.mjs";
import { fromNow } from "./module-0120.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsEditor2.ts
function createGroupIterator(group2) {
  return Iterable.map(group2.children, (g) => {
    return {
      element: g,
      children: g instanceof SettingsTreeGroupElement ? createGroupIterator(g) : void 0
    };
  });
}

function isSettingsSearchUpToDate(searchPending, renderedSearchQuery, currentSearchValue) {
  return !searchPending && renderedSearchQuery === currentSearchValue.trim();
}

var $28 = $;

var searchBoxLabel = localize(18197, null);

var searchBoxPlaceholderWithHistory = localize(18198, null, "\u21C5");

var SEARCH_TOC_BEHAVIOR_KEY = "workbench.settings.settingsSearchTocBehavior";

var SHOW_AI_RESULTS_ENABLED_LABEL = localize(18202, null);

var SHOW_AI_RESULTS_DISABLED_LABEL = localize(18201, null);

var SETTINGS_EDITOR_STATE_KEY = "settingsEditorState";

var SettingsEditor2 = class extends EditorPane {
  constructor(group2, telemetryService, configurationService, textResourceConfigurationService, themeService, preferencesService, instantiationService, preferencesSearchService, logService, contextKeyService, storageService, editorGroupService, userDataSyncWorkbenchService, userDataSyncEnablementService, workspaceTrustManagementService, extensionService, languageService, extensionManagementService, productService, extensionGalleryService, editorProgressService, userDataProfileService, keybindingService, chatEntitlementService, environmentService) {
    super(SettingsEditor2.ID, group2, telemetryService, themeService, storageService);
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this.instantiationService = instantiationService;
    this.preferencesSearchService = preferencesSearchService;
    this.logService = logService;
    this.storageService = storageService;
    this.editorGroupService = editorGroupService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.extensionService = extensionService;
    this.languageService = languageService;
    this.extensionManagementService = extensionManagementService;
    this.productService = productService;
    this.extensionGalleryService = extensionGalleryService;
    this.editorProgressService = editorProgressService;
    this.keybindingService = keybindingService;
    this.chatEntitlementService = chatEntitlementService;
    this.environmentService = environmentService;
    this.searchContainer = null;
    this.settingsTreeModel = this._register(new MutableDisposable());
    this.searchInProgress = null;
    this.aiSearchPromise = null;
    /**
     * The trimmed query value that the currently rendered results reflect. Used to determine
     * whether the displayed results are up to date with the current search input value before
     * moving focus into the results.
     */
    this.renderedSearchQuery = "";
    this.showAiResultsAction = null;
    this.pendingSettingUpdate = null;
    this._searchResultModel = this._register(new MutableDisposable());
    this.searchResultLabel = null;
    this.lastSyncedLabel = null;
    this.settingsOrderByTocIndex = null;
    this._currentFocusContext = 0 /* Search */;
    /** Don't spam warnings */
    this.hasWarnedMissingSettings = false;
    this.tocTreeDisposed = false;
    this.tocFocusedElement = null;
    this.treeFocusedElement = null;
    this.settingsTreeScrollTop = 0;
    this.installedExtensionIds = [];
    this.dismissedExtensionSettings = [];
    this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY = "settingsEditor2.dismissedExtensionSettings";
    this.DISMISSED_EXTENSION_SETTINGS_DELIMITER = "	";
    this.SEARCH_HISTORY_STORAGE_KEY = "settingsEditor2.searchHistory";
    this.searchInputActionBar = null;
    this.searchDelayer = this._register(new Delayer(200));
    this.viewState = { settingsTarget: 3 /* USER_LOCAL */ };
    this.settingFastUpdateDelayer = this._register(new Delayer(SettingsEditor2.SETTING_UPDATE_FAST_DEBOUNCE));
    this.settingSlowUpdateDelayer = this._register(new Delayer(SettingsEditor2.SETTING_UPDATE_SLOW_DEBOUNCE));
    this.searchInputDelayer = this._register(new Delayer(SettingsEditor2.SEARCH_DEBOUNCE));
    this.updatedConfigSchemaDelayer = this._register(new Delayer(SettingsEditor2.CONFIG_SCHEMA_UPDATE_DELAYER));
    this.inSettingsEditorContextKey = CONTEXT_SETTINGS_EDITOR.bindTo(contextKeyService);
    this.searchFocusContextKey = CONTEXT_SETTINGS_SEARCH_FOCUS.bindTo(contextKeyService);
    this.tocRowFocused = CONTEXT_TOC_ROW_FOCUS.bindTo(contextKeyService);
    this.settingRowFocused = CONTEXT_SETTINGS_ROW_FOCUS.bindTo(contextKeyService);
    this.settingFirstRowFocused = CONTEXT_SETTINGS_FIRST_ROW_FOCUS.bindTo(contextKeyService);
    this.aiResultsAvailable = CONTEXT_AI_SETTING_RESULTS_AVAILABLE.bindTo(contextKeyService);
    this.scheduledRefreshes = /* @__PURE__ */ new Map();
    this.editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, SETTINGS_EDITOR_STATE_KEY);
    this.dismissedExtensionSettings = this.storageService.get(this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY, 0 /* PROFILE */, "").split(this.DISMISSED_EXTENSION_SETTINGS_DELIMITER);
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectedKeys.has("workbench.settings.showAISearchToggle" /* ShowAISearchToggle */) || e4.affectedKeys.has("workbench.settings.enableNaturalLanguageSearch" /* EnableNaturalLanguageSearch */)) {
        this.updateAiSearchToggleVisibility();
      }
      if (e4.affectsConfiguration(ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING)) {
        this.onConfigUpdate(void 0, true, true);
      }
      if (e4.source !== 7 /* DEFAULT */) {
        this.onConfigUpdate(e4.affectedKeys);
      }
    }));
    this._register(chatEntitlementService.onDidChangeSentiment(() => {
      this.updateAiSearchToggleVisibility();
    }));
    this._register(userDataProfileService.onDidChangeCurrentProfile((e4) => {
      e4.join(this.whenCurrentProfileChanged());
    }));
    this._register(workspaceTrustManagementService.onDidChangeTrust(() => {
      this.searchResultModel?.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
      if (this.settingsTreeModel.value) {
        this.settingsTreeModel.value.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
        this.renderTree();
      }
    }));
    this._register(configurationService.onDidChangeRestrictedSettings((e4) => {
      if (e4.default.length && this.currentSettingsModel) {
        this.updateElementsByKey(new Set(e4.default));
      }
    }));
    this._register(extensionManagementService.onDidInstallExtensions(() => {
      this.refreshInstalledExtensionsList();
    }));
    this._register(extensionManagementService.onDidUninstallExtension(() => {
      this.refreshInstalledExtensionsList();
    }));
    this.modelDisposables = this._register(new DisposableStore());
    if (ENABLE_LANGUAGE_FILTER && !SettingsEditor2.SUGGESTIONS.includes(`@${LANGUAGE_SETTING_TAG}`)) {
      SettingsEditor2.SUGGESTIONS.push(`@${LANGUAGE_SETTING_TAG}`);
    }
    if (this.environmentService.isSessionsWindow && !SettingsEditor2.SUGGESTIONS.includes(`@${AGENTS_WINDOW_SETTING_TAG}`)) {
      SettingsEditor2.SUGGESTIONS.push(`@${AGENTS_WINDOW_SETTING_TAG}`);
    }
    this.inputChangeListener = this._register(new MutableDisposable());
  }
  static {
    this.ID = "workbench.editor.settings2";
  }
  static {
    this.NUM_INSTANCES = 0;
  }
  static {
    this.SEARCH_DEBOUNCE = 200;
  }
  static {
    this.SETTING_UPDATE_FAST_DEBOUNCE = 200;
  }
  static {
    this.SETTING_UPDATE_SLOW_DEBOUNCE = 1e3;
  }
  static {
    this.CONFIG_SCHEMA_UPDATE_DELAYER = 500;
  }
  static {
    this.TOC_MIN_WIDTH = 100;
  }
  static {
    this.TOC_RESET_WIDTH = 200;
  }
  static {
    this.EDITOR_MIN_WIDTH = 500;
  }
  static {
    // Below NARROW_TOTAL_WIDTH, we only render the editor rather than the ToC.
    this.NARROW_TOTAL_WIDTH = this.TOC_RESET_WIDTH + this.EDITOR_MIN_WIDTH;
  }
  static {
    this.SUGGESTIONS = [
      `@${MODIFIED_SETTING_TAG}`,
      "@tag:notebookLayout",
      "@tag:notebookOutputLayout",
      `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}`,
      `@tag:${WORKSPACE_TRUST_SETTING_TAG}`,
      "@tag:sync",
      "@tag:usesOnlineServices",
      "@tag:telemetry",
      "@tag:accessibility",
      "@tag:preview",
      "@tag:experimental",
      "@tag:agentMerge",
      `@tag:${ADVANCED_SETTING_TAG}`,
      `@${ID_SETTING_TAG}`,
      `@${EXTENSION_SETTING_TAG}`,
      `@${FEATURE_SETTING_TAG}scm`,
      `@${FEATURE_SETTING_TAG}explorer`,
      `@${FEATURE_SETTING_TAG}search`,
      `@${FEATURE_SETTING_TAG}debug`,
      `@${FEATURE_SETTING_TAG}extensions`,
      `@${FEATURE_SETTING_TAG}terminal`,
      `@${FEATURE_SETTING_TAG}task`,
      `@${FEATURE_SETTING_TAG}problems`,
      `@${FEATURE_SETTING_TAG}output`,
      `@${FEATURE_SETTING_TAG}comments`,
      `@${FEATURE_SETTING_TAG}remote`,
      `@${FEATURE_SETTING_TAG}timeline`,
      `@${FEATURE_SETTING_TAG}notebook`,
      `@${FEATURE_SETTING_TAG}chat`,
      `@${POLICY_SETTING_TAG}`
    ];
  }
  static shouldSettingUpdateFast(type) {
    if (Array.isArray(type)) {
      return false;
    }
    return type === "enum" /* Enum */ || type === "array" /* Array */ || type === "boolean-object" /* BooleanObject */ || type === "object" /* Object */ || type === "complex" /* Complex */ || type === "boolean" /* Boolean */ || type === "exclude" /* Exclude */ || type === "include" /* Include */;
  }
  async whenCurrentProfileChanged() {
    this.updatedConfigSchemaDelayer.trigger(() => {
      this.dismissedExtensionSettings = this.storageService.get(this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY, 0 /* PROFILE */, "").split(this.DISMISSED_EXTENSION_SETTINGS_DELIMITER);
      this.onConfigUpdate(void 0, true);
    });
  }
  canShowAdvancedSettings() {
    if (this.configurationService.getValue(ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING) ?? false) {
      return true;
    }
    return this.viewState.tagFilters?.has(ADVANCED_SETTING_TAG) ?? false;
  }
  /**
   * Determines whether a setting should be shown even when advanced settings are filtered out.
   * Returns true if:
   * - The setting is not tagged as advanced, OR
   * - The setting matches an ID filter (@id:settingKey), OR
   * - The setting key appears in the search query, OR
   * - The @hasPolicy filter is active (policy settings should always be shown when filtering by policy)
   */
  shouldShowSetting(setting) {
    if (!setting.tags?.includes(ADVANCED_SETTING_TAG)) {
      return true;
    }
    if (this.viewState.idFilters?.has(setting.key)) {
      return true;
    }
    if (this.viewState.query?.toLowerCase().includes(setting.key.toLowerCase())) {
      return true;
    }
    if (this.viewState.tagFilters?.has(POLICY_SETTING_TAG)) {
      return true;
    }
    return false;
  }
  disableAiSearchToggle() {
    if (this.showAiResultsAction) {
      this.showAiResultsAction.checked = false;
      this.showAiResultsAction.enabled = false;
      this.aiResultsAvailable.set(false);
      this.showAiResultsAction.label = SHOW_AI_RESULTS_DISABLED_LABEL;
    }
  }
  updateAiSearchToggleVisibility() {
    if (!this.searchContainer || !this.showAiResultsAction || !this.searchInputActionBar) {
      return;
    }
    const showAiToggle = this.configurationService.getValue("workbench.settings.showAISearchToggle" /* ShowAISearchToggle */);
    const enableNaturalLanguageSearch = this.configurationService.getValue("workbench.settings.enableNaturalLanguageSearch" /* EnableNaturalLanguageSearch */);
    const chatHidden = this.chatEntitlementService.sentiment.hidden || this.chatEntitlementService.sentiment.disabled;
    const canShowToggle = showAiToggle && enableNaturalLanguageSearch && !chatHidden;
    const alreadyVisible = this.searchInputActionBar.hasAction(this.showAiResultsAction);
    if (!alreadyVisible && canShowToggle) {
      this.searchInputActionBar.push(this.showAiResultsAction, {
        index: 0,
        label: false,
        icon: true
      });
      this.searchContainer.classList.add("with-ai-toggle");
    } else if (alreadyVisible) {
      this.searchInputActionBar.pull(0);
      this.searchContainer.classList.remove("with-ai-toggle");
      this.showAiResultsAction.checked = false;
    }
  }
  get minimumWidth() {
    return SettingsEditor2.EDITOR_MIN_WIDTH;
  }
  get maximumWidth() {
    return Number.POSITIVE_INFINITY;
  }
  get minimumHeight() {
    return 180;
  }
  // these setters need to exist because this extends from EditorPane
  set minimumWidth(value2) {
  }
  set maximumWidth(value2) {
  }
  get currentSettingsModel() {
    return this.searchResultModel || this.settingsTreeModel.value;
  }
  get searchResultModel() {
    return this._searchResultModel.value ?? null;
  }
  set searchResultModel(value2) {
    this._searchResultModel.value = value2 ?? void 0;
    this.rootElement.classList.toggle("search-mode", !!this._searchResultModel.value);
  }
  get focusedSettingDOMElement() {
    const focused = this.settingsTree.getFocus()[0];
    if (!(focused instanceof SettingsTreeSettingElement)) {
      return;
    }
    return this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), focused.setting.key)[0];
  }
  get currentFocusContext() {
    return this._currentFocusContext;
  }
  createEditor(parent) {
    parent.setAttribute("tabindex", "-1");
    this.rootElement = append(parent, $28(".settings-editor", { tabindex: "-1" }));
    this.createHeader(this.rootElement);
    this.createBody(this.rootElement);
    this.addCtrlAInterceptor(this.rootElement);
    this.updateStyles();
    this._register(registerNavigableContainer({
      name: "settingsEditor2",
      focusNotifiers: [this],
      focusNextWidget: () => {
        if (this.searchWidget.inputWidget.hasWidgetFocus()) {
          this.focusTOC();
        }
      },
      focusPreviousWidget: () => {
        if (!this.searchWidget.inputWidget.hasWidgetFocus()) {
          this.focusSearch();
        }
      }
    }));
  }
  async setInput(input, options3, context2, token) {
    this.inSettingsEditorContextKey.set(true);
    await super.setInput(input, options3, context2, token);
    if (!this.input) {
      return;
    }
    const model = await this.input.resolve();
    if (token.isCancellationRequested || !(model instanceof Settings2EditorModel)) {
      return;
    }
    this.modelDisposables.clear();
    this.modelDisposables.add(model.onDidChangeGroups(() => {
      this.updatedConfigSchemaDelayer.trigger(() => {
        this.onConfigUpdate(void 0, false, true);
      });
    }));
    this.defaultSettingsEditorModel = model;
    options3 = options3 || validateSettingsEditorOptions({});
    if (!this.viewState.settingsTarget || !this.settingsTargetsWidget.settingsTarget) {
      const optionsHasViewStateTarget = options3.viewState && options3.viewState.settingsTarget;
      if (!options3.target && !optionsHasViewStateTarget) {
        options3.target = 3 /* USER_LOCAL */;
      }
    }
    this._setOptions(options3);
    this.onConfigUpdate(void 0, true).then(() => {
      this.inputChangeListener.value = input.onWillDispose(() => {
        this.searchWidget.setValue("");
      });
      this.updateTreeScrollSync();
    });
    await this.refreshInstalledExtensionsList();
  }
  async refreshInstalledExtensionsList() {
    const installedExtensions = await this.extensionManagementService.getInstalled();
    this.installedExtensionIds = installedExtensions.filter((ext) => ext.manifest.contributes?.configuration).map((ext) => ext.identifier.id);
  }
  restoreCachedState() {
    const cachedState = this.input && this.editorMemento.loadEditorState(this.group, this.input);
    if (cachedState && typeof cachedState.target === "object") {
      cachedState.target = URI.revive(cachedState.target);
    }
    if (cachedState) {
      const settingsTarget = cachedState.target;
      this.settingsTargetsWidget.settingsTarget = settingsTarget;
      this.viewState.settingsTarget = settingsTarget;
      if (!this.searchWidget.getValue()) {
        this.searchWidget.setValue(cachedState.searchQuery);
      }
    }
    if (this.input) {
      this.editorMemento.clearEditorState(this.input, this.group);
    }
    return cachedState ?? null;
  }
  getViewState() {
    return this.viewState;
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (options3) {
      this._setOptions(options3);
    }
  }
  _setOptions(options3) {
    if (options3.focusSearch && !isIOS) {
      this.focusSearch();
    }
    const recoveredViewState = options3.viewState ? options3.viewState : void 0;
    const query = recoveredViewState?.query ?? options3.query;
    if (query !== void 0) {
      this.searchWidget.setValue(query);
      this.viewState.query = query;
    }
    const target = options3.folderUri ?? recoveredViewState?.settingsTarget ?? options3.target;
    if (target) {
      this.settingsTargetsWidget.updateTarget(target);
    }
  }
  clearInput() {
    this.inSettingsEditorContextKey.set(false);
    super.clearInput();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (!this.isVisible()) {
      return;
    }
    this.layoutSplitView(dimension);
    const innerWidth = Math.min(this.headerContainer.clientWidth, dimension.width) - 24 * 2;
    const monacoWidth = innerWidth - 10 - this.controlsElement.clientWidth - 12;
    this.searchWidget.layout(new Dimension(monacoWidth, 20));
    this.rootElement.classList.toggle("narrow-width", dimension.width < SettingsEditor2.NARROW_TOTAL_WIDTH);
  }
  focus() {
    super.focus();
    if (this._currentFocusContext === 0 /* Search */) {
      if (!isIOS) {
        this.focusSearch();
      }
    } else if (this._currentFocusContext === 3 /* SettingControl */) {
      const element = this.focusedSettingDOMElement;
      if (element) {
        const control = element.querySelector(AbstractSettingRenderer.CONTROL_SELECTOR);
        if (control) {
          control.focus();
          return;
        }
      }
    } else if (this._currentFocusContext === 2 /* SettingTree */) {
      this.settingsTree.domFocus();
    } else if (this._currentFocusContext === 1 /* TableOfContents */) {
      this.tocTree.domFocus();
    }
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (!visible) {
      setTimeout(() => {
        this.searchWidget.onHide();
        this.settingRenderers.cancelSuggesters();
      }, 0);
    }
  }
  focusSettings(focusSettingInput = false) {
    const focused = this.settingsTree.getFocus();
    if (!focused.length) {
      this.settingsTree.focusFirst();
    }
    this.settingsTree.domFocus();
    if (focusSettingInput) {
      const controlInFocusedRow = this.settingsTree.getHTMLElement().querySelector(`.focused ${AbstractSettingRenderer.CONTROL_SELECTOR}`);
      if (controlInFocusedRow) {
        controlInFocusedRow.focus();
      }
    }
  }
  focusTOC() {
    this.tocTree.domFocus();
  }
  /**
   * Invoked when the user presses the down arrow while the search input is focused.
   * Navigates forward through the search history first; only once there are no more
   * recent history entries does focus move down into the settings results.
   */
  navigateSearchHistoryNextOrFocusSettings() {
    if (this.searchWidget.isNavigatingHistory()) {
      this.searchWidget.showNextValue();
    } else {
      this.focusFirstSettingFromSearch();
    }
  }
  /**
   * Invoked when the user presses the up arrow while the search input is focused.
   * Navigates backward through the search history.
   */
  navigateSearchHistoryPrevious() {
    this.searchWidget.showPreviousValue();
  }
  /**
   * Whether the currently rendered results reflect the current search input value.
   * Returns false while a search is still pending (debounced) or in progress, so that
   * focus is not moved into stale results.
   */
  isSearchUpToDate() {
    return isSettingsSearchUpToDate(this.searchInputDelayer.isTriggered(), this.renderedSearchQuery, this.searchWidget.getValue());
  }
  /**
   * Moves focus from the search input into the first settings result, but only when the
   * displayed results are up to date with the current search input. If the results are
   * stale (a search is still pending or in progress), this does nothing so that focus does
   * not land on results from a previous query.
   */
  focusFirstSettingFromSearch() {
    if (!this.isSearchUpToDate()) {
      return;
    }
    this.focusSettings();
  }
  updateSettingFirstRowFocusedContext(element) {
    this.settingFirstRowFocused.set(!!element && element === this.settingsTree.navigate().first());
  }
  showContextMenu() {
    const focused = this.settingsTree.getFocus()[0];
    const rowElement = this.focusedSettingDOMElement;
    if (rowElement && focused instanceof SettingsTreeSettingElement) {
      this.settingRenderers.showContextMenu(focused, rowElement);
    }
  }
  focusSearch(filter2, selectAll = true) {
    if (filter2 && this.searchWidget) {
      this.searchWidget.setValue(filter2);
    }
    this.searchWidget.focus(selectAll && !this.searchInputDelayer.isTriggered());
  }
  clearSearchResults() {
    this.disableAiSearchToggle();
    this.searchWidget.setValue("");
    this.focusSearch();
  }
  clearSearchFilters() {
    const query = this.searchWidget.getValue();
    const splitQuery = query.split(" ").filter((word) => {
      return word.length && !SettingsEditor2.SUGGESTIONS.some((suggestion) => word.startsWith(suggestion));
    });
    this.searchWidget.setValue(splitQuery.join(" "));
  }
  /**
   * Updates the search input placeholder so that it hints at history navigation
   * (up/down arrows) once the user has search history, similar to the keyboard
   * shortcuts editor.
   */
  updateSearchPlaceholder() {
    const hasHistory = this.searchWidget.getHistory().length > 0;
    this.searchWidget.setPlaceHolder(hasHistory ? searchBoxPlaceholderWithHistory : searchBoxLabel);
  }
  updateInputAriaLabel() {
    let label3 = searchBoxLabel;
    if (this.searchResultLabel) {
      label3 += `. ${this.searchResultLabel}`;
    }
    if (this.lastSyncedLabel) {
      label3 += `. ${this.lastSyncedLabel}`;
    }
    this.searchWidget.updateAriaLabel(label3);
  }
  /**
   * Render the header of the Settings editor, which includes the content above the splitview.
   */
  createHeader(parent) {
    this.headerContainer = append(parent, $28(".settings-header"));
    this.searchContainer = append(this.headerContainer, $28(".search-container"));
    const clearInputAction = this._register(new Action(
      SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
      localize(18186, null),
      ThemeIcon.asClassName(preferencesClearInputIcon),
      false,
      async () => this.clearSearchResults()
    ));
    const showAiResultActionClassNames = ["action-label", ThemeIcon.asClassName(preferencesAiResultsIcon)];
    this.showAiResultsAction = this._register(new Action(
      SETTINGS_EDITOR_COMMAND_SHOW_AI_RESULTS,
      SHOW_AI_RESULTS_DISABLED_LABEL,
      showAiResultActionClassNames.join(" "),
      true
    ));
    this._register(this.showAiResultsAction.onDidChange(async () => {
      await this.onDidToggleAiSearch();
    }));
    const filterAction = this._register(new Action(
      SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS,
      localize(18188, null),
      ThemeIcon.asClassName(preferencesFilterIcon)
    ));
    this.searchWidget = this._register(this.instantiationService.createInstance(SuggestEnabledInputWithHistory, {
      id: `${SettingsEditor2.ID}.searchbox`,
      parent: this.searchContainer,
      ariaLabel: searchBoxLabel,
      resourceHandle: "settingseditor:searchinput" + SettingsEditor2.NUM_INSTANCES++,
      suggestionProvider: {
        triggerCharacters: ["@", ":"],
        provideResults: (query) => {
          const queryParts = query.split(/\s/g);
          if (queryParts[queryParts.length - 1].startsWith(`@${LANGUAGE_SETTING_TAG}`)) {
            const sortedLanguages = this.languageService.getRegisteredLanguageIds().map((languageId) => {
              return `@${LANGUAGE_SETTING_TAG}${languageId} `;
            }).sort();
            return sortedLanguages.filter((langFilter) => !query.includes(langFilter));
          } else if (queryParts[queryParts.length - 1].startsWith(`@${EXTENSION_SETTING_TAG}`)) {
            const installedExtensionsTags = this.installedExtensionIds.map((extensionId) => {
              return `@${EXTENSION_SETTING_TAG}${extensionId} `;
            }).sort();
            return installedExtensionsTags.filter((extFilter) => !query.includes(extFilter));
          } else if (query === "" || queryParts[queryParts.length - 1].startsWith("@")) {
            return SettingsEditor2.SUGGESTIONS.filter((tag2) => !query.includes(tag2)).map((tag2) => tag2.endsWith(":") ? tag2 : tag2 + " ");
          }
          return [];
        }
      },
      suggestOptions: {
        placeholderText: searchBoxLabel,
        focusContextKey: this.searchFocusContextKey,
        styleOverrides: {
          inputBorder: settingsTextInputBorder
        }
        // TODO: Aria-live
      },
      history: this.loadSearchHistory()
    }));
    this._register(this.searchWidget.onDidFocus(() => {
      this._currentFocusContext = 0 /* Search */;
    }));
    this.updateSearchPlaceholder();
    this._register(this.searchWidget.onInputDidChange(() => {
      const searchVal = this.searchWidget.getValue();
      clearInputAction.enabled = !!searchVal;
      this.searchInputDelayer.trigger(() => this.onSearchInputChanged(true));
    }));
    const headerControlsContainer = append(this.headerContainer, $28(".settings-header-controls"));
    headerControlsContainer.style.borderColor = asCssVariable(settingsHeaderBorder);
    const targetWidgetContainer = append(headerControlsContainer, $28(".settings-target-container"));
    this.settingsTargetsWidget = this._register(this.instantiationService.createInstance(SettingsTargetsWidget, targetWidgetContainer, { enableRemoteSettings: true }));
    this.settingsTargetsWidget.settingsTarget = 3 /* USER_LOCAL */;
    this._register(this.settingsTargetsWidget.onDidTargetChange((target) => this.onDidSettingsTargetChange(target)));
    this._register(addDisposableListener(targetWidgetContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.keyCode === 18 /* DownArrow */) {
        this.focusSettings();
      }
    }));
    if (this.userDataSyncWorkbenchService.enabled && this.userDataSyncEnablementService.canToggleEnablement()) {
      const syncControls = this._register(this.instantiationService.createInstance(SyncControls, this.window, headerControlsContainer));
      this._register(syncControls.onDidChangeLastSyncedLabel((lastSyncedLabel) => {
        this.lastSyncedLabel = lastSyncedLabel;
        this.updateInputAriaLabel();
      }));
    }
    this.controlsElement = append(this.searchContainer, $(".search-container-widgets"));
    this.countElement = append(this.controlsElement, $(".settings-count-widget.monaco-count-badge.long"));
    this.searchInputActionBar = this._register(new ActionBar(this.controlsElement, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === filterAction.id) {
          return this.instantiationService.createInstance(SettingsSearchFilterDropdownMenuActionViewItem, action, options3, this.actionRunner, this.searchWidget);
        }
        if (this.showAiResultsAction && action.id === this.showAiResultsAction.id) {
          const keybindingLabel2 = this.keybindingService.lookupKeybinding(SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH)?.getLabel();
          return new ToggleActionViewItem(null, action, { ...options3, keybinding: keybindingLabel2, toggleStyles: defaultToggleStyles });
        }
        return void 0;
      }
    }));
    const actionsToPush = [clearInputAction, filterAction];
    this.searchInputActionBar.push(actionsToPush, { label: false, icon: true });
    this.disableAiSearchToggle();
    this.updateAiSearchToggleVisibility();
  }
  toggleAiSearch() {
    if (this.searchInputActionBar && this.showAiResultsAction && this.searchInputActionBar.hasAction(this.showAiResultsAction)) {
      if (!this.showAiResultsAction.enabled) {
        status(localize(18192, null));
      }
      this.showAiResultsAction.checked = !this.showAiResultsAction.checked;
    }
  }
  async onDidToggleAiSearch() {
    if (this.searchResultModel && this.showAiResultsAction) {
      this.searchResultModel.showAiResults = this.showAiResultsAction.checked ?? false;
      this.renderResultCountMessages(false);
      this.onDidFinishSearch(true, void 0);
    }
  }
  onDidSettingsTargetChange(target) {
    this.viewState.settingsTarget = target;
    this.onConfigUpdate(void 0, true);
  }
  onDidDismissExtensionSetting(extensionId) {
    if (!this.dismissedExtensionSettings.includes(extensionId)) {
      this.dismissedExtensionSettings.push(extensionId);
    }
    this.storageService.store(
      this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY,
      this.dismissedExtensionSettings.join(this.DISMISSED_EXTENSION_SETTINGS_DELIMITER),
      0 /* PROFILE */,
      0 /* USER */
    );
    this.onConfigUpdate(void 0, true);
  }
  onDidClickSetting(evt, recursed) {
    const targetElement = this.currentSettingsModel?.getElementsByName(evt.targetKey)?.[0];
    let revealFailed = false;
    if (targetElement) {
      let sourceTop = 0.5;
      try {
        const _sourceTop = this.settingsTree.getRelativeTop(evt.source);
        if (_sourceTop !== null) {
          sourceTop = _sourceTop;
        }
      } catch {
      }
      if (this.viewState.categoryFilter && evt.source.displayCategory !== targetElement.displayCategory) {
        this.tocTree.setFocus([]);
      }
      try {
        this.settingsTree.reveal(targetElement, sourceTop);
      } catch (_) {
        revealFailed = true;
      }
      if (!revealFailed) {
        setTimeout(() => {
          this.settingsTree.setFocus([targetElement]);
        }, 50);
        const domElements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), evt.targetKey);
        if (domElements && domElements[0]) {
          const control = domElements[0].querySelector(AbstractSettingRenderer.CONTROL_SELECTOR);
          if (control) {
            control.focus();
          }
        }
      }
    }
    if (!recursed && (!targetElement || revealFailed)) {
      const idQuery = `@id:${evt.targetKey}`;
      this.searchWidget.setValue(idQuery);
      this.searchInputDelayer.cancel();
      const p = this.triggerSearch(idQuery, true);
      p.then(() => {
        this.onDidClickSetting(evt, true);
      });
    }
  }
  switchToSettingsFile() {
    const query = parseQuery(this.searchWidget.getValue()).query;
    return this.openSettingsFile({ query });
  }
  async openSettingsFile(options3) {
    const currentSettingsTarget = this.settingsTargetsWidget.settingsTarget;
    const openOptions = { jsonEditor: true, groupId: this.group.id, ...options3 };
    if (currentSettingsTarget === 3 /* USER_LOCAL */) {
      if (options3?.revealSetting) {
        const configurationProperties = Registry.as(Extensions4.Configuration).getConfigurationProperties();
        const configurationScope = configurationProperties[options3?.revealSetting.key]?.scope;
        if (configurationScope && APPLICATION_SCOPES.includes(configurationScope)) {
          return this.preferencesService.openApplicationSettings(openOptions);
        }
      }
      return this.preferencesService.openUserSettings(openOptions);
    } else if (currentSettingsTarget === 4 /* USER_REMOTE */) {
      return this.preferencesService.openRemoteSettings(openOptions);
    } else if (currentSettingsTarget === 5 /* WORKSPACE */) {
      return this.preferencesService.openWorkspaceSettings(openOptions);
    } else if (URI.isUri(currentSettingsTarget)) {
      return this.preferencesService.openFolderSettings({ folderUri: currentSettingsTarget, ...openOptions });
    }
    return void 0;
  }
  createBody(parent) {
    this.bodyContainer = append(parent, $28(".settings-body"));
    this.noResultsMessage = append(this.bodyContainer, $28(".no-results-message"));
    this.noResultsMessage.innerText = localize(18193, null);
    this.clearFilterLinkContainer = $28("span.clear-search-filters");
    this.clearFilterLinkContainer.textContent = " - ";
    const clearFilterLink = append(this.clearFilterLinkContainer, $28("a.pointer.prominent", { tabindex: 0 }, localize(18187, null)));
    this._register(addDisposableListener(clearFilterLink, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, false);
      this.clearSearchFilters();
    }));
    append(this.noResultsMessage, this.clearFilterLinkContainer);
    this.noResultsMessage.style.color = asCssVariable(editorForeground);
    this.tocTreeContainer = $28(".settings-toc-container");
    this.settingsTreeContainer = $28(".settings-tree-container");
    this.createTOC(this.tocTreeContainer);
    this.createSettingsTree(this.settingsTreeContainer);
    this.splitView = this._register(new SplitView(this.bodyContainer, {
      orientation: 1 /* HORIZONTAL */,
      proportionalLayout: true
    }));
    const startingWidth = this.storageService.getNumber("settingsEditor2.splitViewWidth", 0 /* PROFILE */, SettingsEditor2.TOC_RESET_WIDTH);
    this.splitView.addView({
      onDidChange: Event2.None,
      element: this.tocTreeContainer,
      minimumSize: SettingsEditor2.TOC_MIN_WIDTH,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: (width2, _, height) => {
        this.tocTreeContainer.style.width = `${width2}px`;
        this.tocTree.layout(height, width2);
      }
    }, startingWidth, void 0, true);
    this.splitView.addView({
      onDidChange: Event2.None,
      element: this.settingsTreeContainer,
      minimumSize: SettingsEditor2.EDITOR_MIN_WIDTH,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: (width2, _, height) => {
        this.settingsTreeContainer.style.width = `${width2}px`;
        this.settingsTree.layout(height, width2);
      }
    }, Sizing.Distribute, void 0, true);
    this._register(this.splitView.onDidSashReset(() => {
      const totalSize = this.splitView.getViewSize(0) + this.splitView.getViewSize(1);
      this.splitView.resizeView(0, SettingsEditor2.TOC_RESET_WIDTH);
      this.splitView.resizeView(1, totalSize - SettingsEditor2.TOC_RESET_WIDTH);
    }));
    this._register(this.splitView.onDidSashChange(() => {
      const width2 = this.splitView.getViewSize(0);
      this.storageService.store("settingsEditor2.splitViewWidth", width2, 0 /* PROFILE */, 0 /* USER */);
    }));
    const borderColor = this.theme.getColor(settingsSashBorder);
    this.splitView.style({ separatorBorder: borderColor });
  }
  addCtrlAInterceptor(container2) {
    this._register(addStandardDisposableListener(container2, EventType.KEY_DOWN, (e4) => {
      if (e4.keyCode === 31 /* KeyA */ && (isMacintosh ? e4.metaKey : e4.ctrlKey) && !isEditableElement(e4.target)) {
        e4.browserEvent.stopPropagation();
        e4.browserEvent.preventDefault();
      }
    }));
  }
  createTOC(container2) {
    this.tocTreeModel = this.instantiationService.createInstance(TOCTreeModel, this.viewState);
    this.tocTree = this._register(this.instantiationService.createInstance(
      TOCTree,
      append(container2, $28(".settings-toc-wrapper", {
        "role": "navigation",
        "aria-label": localize(18199, null)
      })),
      this.viewState
    ));
    this.tocTreeDisposed = false;
    this._register(this.tocTree.onDidFocus(() => {
      this._currentFocusContext = 1 /* TableOfContents */;
    }));
    this._register(this.tocTree.onDidChangeFocus((e4) => {
      const element = e4.elements?.[0] ?? null;
      if (this.tocFocusedElement === element) {
        return;
      }
      this.tocFocusedElement = element;
      this.tocTree.setSelection(element ? [element] : []);
      if (this.viewState.categoryFilter !== element) {
        this.viewState.categoryFilter = element ?? void 0;
        this.renderTree(void 0, true);
        this.settingsTree.scrollTop = 0;
      }
    }));
    this._register(this.tocTree.onDidFocus(() => {
      this.tocRowFocused.set(true);
    }));
    this._register(this.tocTree.onDidBlur(() => {
      this.tocRowFocused.set(false);
    }));
    this._register(this.tocTree.onDidDispose(() => {
      this.tocTreeDisposed = true;
    }));
  }
  applyFilter(filter2) {
    if (this.searchWidget && !this.searchWidget.getValue().includes(filter2)) {
      const newQuery = `${filter2} ${this.searchWidget.getValue().trimStart()}`;
      this.focusSearch(newQuery, false);
    }
  }
  removeLanguageFilters() {
    if (this.searchWidget && this.searchWidget.getValue().includes(`@${LANGUAGE_SETTING_TAG}`)) {
      const query = this.searchWidget.getValue().split(" ");
      const newQuery = query.filter((word) => !word.startsWith(`@${LANGUAGE_SETTING_TAG}`)).join(" ");
      this.focusSearch(newQuery, false);
    }
  }
  createSettingsTree(container2) {
    this.settingRenderers = this._register(this.instantiationService.createInstance(SettingTreeRenderers));
    this._register(this.settingRenderers.onDidChangeSetting((e4) => this.onDidChangeSetting(e4.key, e4.value, e4.type, e4.manualReset, e4.scope)));
    this._register(this.settingRenderers.onDidDismissExtensionSetting((e4) => this.onDidDismissExtensionSetting(e4)));
    this._register(this.settingRenderers.onDidOpenSettings((settingKey) => {
      this.openSettingsFile({ revealSetting: { key: settingKey, edit: true } });
    }));
    this._register(this.settingRenderers.onDidClickSettingLink((settingName) => this.onDidClickSetting(settingName)));
    this._register(this.settingRenderers.onDidFocusSetting((element) => {
      this.settingsTree.setFocus([element]);
      this._currentFocusContext = 3 /* SettingControl */;
      this.settingRowFocused.set(false);
    }));
    this._register(this.settingRenderers.onDidChangeSettingHeight((params) => {
      const { element, height } = params;
      try {
        this.settingsTree.updateElementHeight(element, height);
      } catch (e4) {
      }
    }));
    this._register(this.settingRenderers.onApplyFilter((filter2) => this.applyFilter(filter2)));
    this._register(this.settingRenderers.onDidClickOverrideElement((element) => {
      this.removeLanguageFilters();
      if (element.language) {
        this.applyFilter(`@${LANGUAGE_SETTING_TAG}${element.language}`);
      }
      if (element.scope === "workspace") {
        this.settingsTargetsWidget.updateTarget(5 /* WORKSPACE */);
      } else if (element.scope === "user") {
        this.settingsTargetsWidget.updateTarget(3 /* USER_LOCAL */);
      } else if (element.scope === "remote") {
        this.settingsTargetsWidget.updateTarget(4 /* USER_REMOTE */);
      }
      this.applyFilter(`@${ID_SETTING_TAG}${element.settingKey}`);
    }));
    this.settingsTree = this._register(this.instantiationService.createInstance(
      SettingsTree,
      container2,
      this.viewState,
      this.settingRenderers.allRenderers
    ));
    this._register(this.settingsTree.onDidScroll(() => {
      if (this.settingsTree.scrollTop === this.settingsTreeScrollTop) {
        return;
      }
      this.settingsTreeScrollTop = this.settingsTree.scrollTop;
      setTimeout(() => {
        this.updateTreeScrollSync();
      }, 0);
    }));
    this._register(this.settingsTree.onDidFocus(() => {
      const classList = container2.ownerDocument.activeElement?.classList;
      if (classList && classList.contains("monaco-list") && classList.contains("settings-editor-tree")) {
        this._currentFocusContext = 2 /* SettingTree */;
        this.settingRowFocused.set(true);
        this.treeFocusedElement ??= this.settingsTree.firstVisibleElement ?? null;
        if (this.treeFocusedElement) {
          this.treeFocusedElement.tabbable = true;
        }
        this.updateSettingFirstRowFocusedContext(this.treeFocusedElement);
      }
    }));
    this._register(this.settingsTree.onDidBlur(() => {
      this.settingRowFocused.set(false);
      this.settingFirstRowFocused.set(false);
      this.treeFocusedElement = null;
    }));
    this._register(this.settingsTree.onDidChangeFocus((e4) => {
      const element = e4.elements[0];
      this.updateSettingFirstRowFocusedContext(element ?? null);
      if (this.treeFocusedElement === element) {
        return;
      }
      if (this.treeFocusedElement) {
        this.treeFocusedElement.tabbable = false;
      }
      this.treeFocusedElement = element;
      if (this.treeFocusedElement) {
        this.treeFocusedElement.tabbable = true;
      }
      this.settingsTree.setSelection(element ? [element] : []);
    }));
  }
  onDidChangeSetting(key3, value2, type, manualReset, scope) {
    const parsedQuery = parseQuery(this.searchWidget.getValue());
    const languageFilter = parsedQuery.languageFilter;
    if (manualReset || this.pendingSettingUpdate && this.pendingSettingUpdate.key !== key3) {
      this.updateChangedSetting(key3, value2, manualReset, languageFilter, scope);
    }
    this.pendingSettingUpdate = { key: key3, value: value2, languageFilter };
    if (SettingsEditor2.shouldSettingUpdateFast(type)) {
      this.settingFastUpdateDelayer.trigger(() => this.updateChangedSetting(key3, value2, manualReset, languageFilter, scope));
    } else {
      this.settingSlowUpdateDelayer.trigger(() => this.updateChangedSetting(key3, value2, manualReset, languageFilter, scope));
    }
  }
  updateTreeScrollSync() {
    this.settingRenderers.cancelSuggesters();
  }
  updateChangedSetting(key3, value2, manualReset, languageFilter, scope) {
    const settingsTarget = this.settingsTargetsWidget.settingsTarget;
    const resource = URI.isUri(settingsTarget) ? settingsTarget : void 0;
    const configurationTarget = (resource ? 6 /* WORKSPACE_FOLDER */ : settingsTarget) ?? 3 /* USER_LOCAL */;
    const overrides = { resource, overrideIdentifiers: languageFilter ? [languageFilter] : void 0 };
    const configurationTargetIsWorkspace = configurationTarget === 5 /* WORKSPACE */ || configurationTarget === 6 /* WORKSPACE_FOLDER */;
    const userPassedInManualReset = configurationTargetIsWorkspace || !!languageFilter;
    const isManualReset = userPassedInManualReset ? manualReset : value2 === void 0;
    const inspected = this.configurationService.inspect(key3, overrides);
    if (!userPassedInManualReset && inspected.defaultValue === value2) {
      value2 = void 0;
    }
    return this.configurationService.updateValue(key3, value2, overrides, configurationTarget, { handleDirtyFile: "save" }).then(() => {
      const query = this.searchWidget.getValue();
      if (query.includes(`@${MODIFIED_SETTING_TAG}`)) {
        this.refreshTOCTree();
      }
      this.renderTree(key3, isManualReset);
      this.pendingSettingUpdate = null;
      const reportModifiedProps = {
        key: key3,
        query,
        searchResults: this.searchResultModel?.getUniqueSearchResults() ?? null,
        rawResults: this.searchResultModel?.getRawResults() ?? null,
        showConfiguredOnly: !!this.viewState.tagFilters && this.viewState.tagFilters.has(MODIFIED_SETTING_TAG),
        isReset: typeof value2 === "undefined",
        settingsTarget: this.settingsTargetsWidget.settingsTarget
      };
      return this.reportModifiedSetting(reportModifiedProps);
    });
  }
  reportModifiedSetting(props) {
    let groupId = void 0;
    let providerName = void 0;
    let nlpIndex = void 0;
    let displayIndex = void 0;
    if (props.searchResults) {
      displayIndex = props.searchResults.filterMatches.findIndex((m) => m.setting.key === props.key);
      if (this.searchResultModel) {
        providerName = props.searchResults.filterMatches.find((m) => m.setting.key === props.key)?.providerName;
        const rawResults = this.searchResultModel.getRawResults();
        if (rawResults[0 /* Local */] && displayIndex >= 0) {
          const settingInLocalResults = rawResults[0 /* Local */].filterMatches.some((m) => m.setting.key === props.key);
          groupId = settingInLocalResults ? "local" : "remote";
        }
        if (rawResults[1 /* Remote */]) {
          const _nlpIndex = rawResults[1 /* Remote */].filterMatches.findIndex((m) => m.setting.key === props.key);
          nlpIndex = _nlpIndex >= 0 ? _nlpIndex : void 0;
        }
      }
    }
    const reportedTarget = props.settingsTarget === 3 /* USER_LOCAL */ ? "user" : props.settingsTarget === 4 /* USER_REMOTE */ ? "user_remote" : props.settingsTarget === 5 /* WORKSPACE */ ? "workspace" : "folder";
    const data = {
      key: props.key,
      groupId,
      providerName,
      nlpIndex,
      displayIndex,
      showConfiguredOnly: props.showConfiguredOnly,
      isReset: props.isReset,
      target: reportedTarget
    };
    this.telemetryService.publicLog2("settingsEditor.settingModified", data);
  }
  scheduleRefresh(element, key3 = "") {
    if (key3 && this.scheduledRefreshes.has(key3)) {
      return;
    }
    if (!key3) {
      dispose(this.scheduledRefreshes.values());
      this.scheduledRefreshes.clear();
    }
    const store = new DisposableStore();
    const scheduledRefreshTracker = trackFocus(element);
    store.add(scheduledRefreshTracker);
    store.add(scheduledRefreshTracker.onDidBlur(() => {
      this.scheduledRefreshes.get(key3)?.dispose();
      this.scheduledRefreshes.delete(key3);
      this.onConfigUpdate(/* @__PURE__ */ new Set([key3]));
    }));
    this.scheduledRefreshes.set(key3, store);
  }
  createSettingsOrderByTocIndex(resolvedSettingsRoot) {
    const index2 = /* @__PURE__ */ new Map();
    function indexSettings(resolvedSettingsRoot2, counter = 0) {
      if (resolvedSettingsRoot2.settings) {
        for (const setting of resolvedSettingsRoot2.settings) {
          if (!index2.has(setting.key)) {
            index2.set(setting.key, counter++);
          }
        }
      }
      if (resolvedSettingsRoot2.children) {
        for (const child of resolvedSettingsRoot2.children) {
          counter = indexSettings(child, counter);
        }
      }
      return counter;
    }
    indexSettings(resolvedSettingsRoot);
    return index2;
  }
  refreshModels(resolvedSettingsRoot) {
    this.settingsTreeModel.value.update(resolvedSettingsRoot);
    this.tocTreeModel.settingsTreeRoot = this.settingsTreeModel.value.root;
    this.settingsOrderByTocIndex = this.createSettingsOrderByTocIndex(resolvedSettingsRoot);
  }
  async onConfigUpdate(keys, forceRefresh = false, triggerSearch = false) {
    if (keys && this.settingsTreeModel) {
      return this.updateElementsByKey(keys);
    }
    if (!this.defaultSettingsEditorModel) {
      return;
    }
    const groups = this.defaultSettingsEditorModel.settingsGroups.slice(1);
    const coreSettingsGroups = [], extensionSettingsGroups = [];
    for (const group2 of groups) {
      if (group2.extensionInfo) {
        extensionSettingsGroups.push(group2);
      } else {
        coreSettingsGroups.push(group2);
      }
    }
    const filter2 = this.canShowAdvancedSettings() ? void 0 : { exclude: { tags: [ADVANCED_SETTING_TAG] } };
    const settingsResult = resolveSettingsTree(tocData, coreSettingsGroups, filter2, this.logService);
    const resolvedSettingsRoot = settingsResult.tree;
    if (settingsResult.leftoverSettings.size && !this.hasWarnedMissingSettings) {
      const settingKeyList = [];
      settingsResult.leftoverSettings.forEach((s) => {
        settingKeyList.push(s.key);
      });
      this.logService.warn(`SettingsEditor2: Settings not included in settingsLayout.ts: ${settingKeyList.join(", ")}`);
      this.hasWarnedMissingSettings = true;
    }
    const additionalGroups = [];
    let setAdditionalGroups = false;
    const toggleData = await getExperimentalExtensionToggleData(this.chatEntitlementService, this.extensionGalleryService, this.productService);
    if (toggleData && groups.filter((g) => g.extensionInfo).length && Object.keys(toggleData.settingsEditorRecommendedExtensions).length) {
      await this.refreshInstalledExtensionsList();
      for (const key3 in toggleData.settingsEditorRecommendedExtensions) {
        const extension = toggleData.recommendedExtensionsGalleryInfo[key3];
        if (!extension) {
          continue;
        }
        const extensionId = extension.identifier.id;
        const extensionInstalled = this.installedExtensionIds.includes(extensionId);
        const matchingGroupIndex = groups.findIndex(
          (g) => g.extensionInfo && g.extensionInfo.id.toLowerCase() === extensionId.toLowerCase() && g.sections.length === 1 && g.sections[0].settings.length === 1 && g.sections[0].settings[0].displayExtensionId
        );
        if (extensionInstalled || this.dismissedExtensionSettings.includes(extensionId)) {
          if (matchingGroupIndex !== -1) {
            groups.splice(matchingGroupIndex, 1);
            setAdditionalGroups = true;
          }
          continue;
        }
        if (matchingGroupIndex !== -1) {
          continue;
        }
        let manifest = null;
        try {
          manifest = await raceTimeout(
            this.extensionGalleryService.getManifest(extension, CancellationToken.None),
            EXTENSION_FETCH_TIMEOUT_MS
          ) ?? null;
        } catch (e4) {
          continue;
        }
        if (manifest === null) {
          continue;
        }
        const contributesConfiguration = manifest?.contributes?.configuration;
        let groupTitle;
        if (!Array.isArray(contributesConfiguration)) {
          groupTitle = contributesConfiguration?.title;
        } else if (contributesConfiguration.length === 1) {
          groupTitle = contributesConfiguration[0].title;
        }
        const recommendationInfo = toggleData.settingsEditorRecommendedExtensions[key3];
        const extensionName = extension.displayName ?? extension.name ?? extensionId;
        const settingKey = `${key3}.manageExtension`;
        const setting = {
          range: nullRange,
          key: settingKey,
          keyRange: nullRange,
          value: null,
          valueRange: nullRange,
          description: [recommendationInfo.onSettingsEditorOpen?.descriptionOverride ?? extension.description],
          descriptionIsMarkdown: false,
          descriptionRanges: [],
          scope: 4 /* WINDOW */,
          type: "null",
          displayExtensionId: extensionId,
          extensionGroupTitle: groupTitle ?? extensionName,
          categoryLabel: "Extensions",
          title: extensionName
        };
        const additionalGroup = {
          sections: [{
            settings: [setting]
          }],
          id: extensionId,
          title: setting.extensionGroupTitle,
          titleRange: nullRange,
          range: nullRange,
          extensionInfo: {
            id: extensionId,
            displayName: extension.displayName
          }
        };
        groups.push(additionalGroup);
        additionalGroups.push(additionalGroup);
        setAdditionalGroups = true;
      }
    }
    resolvedSettingsRoot.children.push(await createTocTreeForExtensionSettings(this.extensionService, extensionSettingsGroups, filter2));
    resolvedSettingsRoot.children.unshift(getCommonlyUsedData(groups));
    if (toggleData && setAdditionalGroups) {
      this.defaultSettingsEditorModel.setAdditionalGroups(additionalGroups);
    }
    if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && (this.viewState.settingsTarget instanceof URI || this.viewState.settingsTarget === 5 /* WORKSPACE */)) {
      const configuredUntrustedWorkspaceSettings = resolveConfiguredUntrustedSettings(groups, this.viewState.settingsTarget, this.viewState.languageFilter, this.configurationService);
      if (configuredUntrustedWorkspaceSettings.length) {
        resolvedSettingsRoot.children.unshift({
          id: "workspaceTrust",
          label: localize(18200, null),
          settings: configuredUntrustedWorkspaceSettings
        });
      }
    }
    this.searchResultModel?.updateChildren();
    const firstVisibleElement = this.settingsTree.firstVisibleElement;
    let anchorId;
    if (firstVisibleElement instanceof SettingsTreeSettingElement) {
      anchorId = firstVisibleElement.setting.key;
    } else if (firstVisibleElement instanceof SettingsTreeGroupElement) {
      anchorId = firstVisibleElement.id;
    }
    if (this.settingsTreeModel.value) {
      this.refreshModels(resolvedSettingsRoot);
      if (triggerSearch && this.searchResultModel) {
        return await this.onSearchInputChanged(false);
      }
      this.refreshTOCTree();
      this.renderTree(void 0, forceRefresh);
      if (anchorId) {
        const newModel = this.settingsTreeModel.value;
        let newElement;
        const settings = newModel.getElementsByName(anchorId);
        if (settings && settings.length > 0) {
          newElement = settings[0];
        } else {
          const findGroup2 = (roots) => {
            for (const g of roots) {
              if (g.id === anchorId) {
                return g;
              }
              if (g.children) {
                for (const child of g.children) {
                  if (child instanceof SettingsTreeGroupElement) {
                    const found = findGroup2([child]);
                    if (found) {
                      return found;
                    }
                  }
                }
              }
            }
            return void 0;
          };
          newElement = findGroup2([newModel.root]);
        }
        if (newElement) {
          try {
            this.settingsTree.reveal(newElement, 0);
          } catch (e4) {
          }
        }
      }
    } else {
      this.settingsTreeModel.value = this.instantiationService.createInstance(SettingsTreeModel, this.viewState, this.workspaceTrustManagementService.isWorkspaceTrusted());
      this.refreshModels(resolvedSettingsRoot);
      const cachedState = !this.viewState.query ? this.restoreCachedState() : void 0;
      if (cachedState?.searchQuery || this.searchWidget.getValue()) {
        await this.onSearchInputChanged(true);
      } else {
        this.refreshTOCTree();
        const rootChildren = this.settingsTreeModel.value.root.children;
        if (Array.isArray(rootChildren) && rootChildren.length > 0) {
          const firstCategory = rootChildren[0];
          if (firstCategory instanceof SettingsTreeGroupElement) {
            this.viewState.categoryFilter = firstCategory;
            this.tocTree.setFocus([firstCategory]);
            this.tocTree.setSelection([firstCategory]);
          }
        }
        this.refreshTree();
        this.tocTree.collapseAll();
      }
    }
  }
  updateElementsByKey(keys) {
    if (keys.size) {
      if (this.searchResultModel) {
        keys.forEach((key3) => this.searchResultModel.updateElementsByName(key3));
      }
      if (this.settingsTreeModel.value) {
        keys.forEach((key3) => this.settingsTreeModel.value.updateElementsByName(key3));
      }
      keys.forEach((key3) => this.renderTree(key3));
    } else {
      this.renderTree();
    }
  }
  getActiveControlInSettingsTree() {
    const element = this.settingsTree.getHTMLElement();
    const activeElement = element.ownerDocument.activeElement;
    return activeElement && isAncestorOfActiveElement(element) ? activeElement : null;
  }
  renderTree(key3, force = false) {
    if (!force && key3 && this.scheduledRefreshes.has(key3)) {
      this.updateModifiedLabelForKey(key3);
      return;
    }
    if (this.contextViewFocused()) {
      const element = this.window.document.querySelector(".context-view");
      if (element) {
        this.scheduleRefresh(element, key3);
      }
      return;
    }
    const activeElement = this.getActiveControlInSettingsTree();
    const focusedSetting = activeElement && this.settingRenderers.getSettingDOMElementForDOMElement(activeElement);
    if (focusedSetting && !force) {
      if (key3) {
        const focusedKey = focusedSetting.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
        if (focusedKey === key3 && // update `list`s live, as they have a separate "submit edit" step built in before this
        (focusedSetting.parentElement && !focusedSetting.parentElement.classList.contains("setting-item-list"))) {
          this.updateModifiedLabelForKey(key3);
          this.scheduleRefresh(focusedSetting, key3);
          return;
        }
      } else {
        this.scheduleRefresh(focusedSetting);
        return;
      }
    }
    this.renderResultCountMessages(false);
    if (key3) {
      const elements = this.currentSettingsModel?.getElementsByName(key3);
      if (elements?.length) {
        if (elements.length >= 2) {
          console.warn("More than one setting with key " + key3 + " found");
        }
        this.refreshSingleElement(elements[0]);
      } else {
        return;
      }
    } else {
      this.refreshTree();
    }
    return;
  }
  contextViewFocused() {
    return !!findParentWithClass(this.rootElement.ownerDocument.activeElement, "context-view");
  }
  refreshSingleElement(element) {
    if (this.isVisible() && this.settingsTree.hasElement(element) && (!element.setting.deprecationMessage || element.isConfigured)) {
      this.settingsTree.rerender(element);
    }
  }
  refreshTree() {
    if (this.isVisible() && this.currentSettingsModel) {
      this.settingsTree.setChildren(null, createGroupIterator(this.currentSettingsModel.root));
    }
  }
  refreshTOCTree() {
    if (this.isVisible()) {
      this.tocTreeModel.update();
      this.tocTree.setChildren(null, createTOCIterator(this.tocTreeModel, this.tocTree));
    }
  }
  updateModifiedLabelForKey(key3) {
    if (!this.currentSettingsModel) {
      return;
    }
    const dataElements = this.currentSettingsModel.getElementsByName(key3);
    const isModified = dataElements && dataElements[0] && dataElements[0].isConfigured;
    const elements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), key3);
    if (elements && elements[0]) {
      elements[0].classList.toggle("is-configured", !!isModified);
    }
  }
  async onSearchInputChanged(expandResults) {
    if (!this.currentSettingsModel) {
      return;
    }
    const query = this.searchWidget.getValue().trim();
    this.viewState.query = query;
    if (query) {
      this.searchWidget.addToHistory();
      this.updateSearchPlaceholder();
      this.saveSearchHistory();
    }
    await this.triggerSearch(query.replace(/\u203A/g, " "), expandResults);
  }
  loadSearchHistory() {
    const raw = this.storageService.get(this.SEARCH_HISTORY_STORAGE_KEY, 0 /* PROFILE */);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
    } catch {
      return [];
    }
  }
  saveSearchHistory() {
    if (!this.searchWidget) {
      return;
    }
    const history = this.searchWidget.getHistory();
    if (history.length) {
      this.storageService.store(this.SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history), 0 /* PROFILE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(this.SEARCH_HISTORY_STORAGE_KEY, 0 /* PROFILE */);
    }
  }
  parseSettingFromJSON(query) {
    const match2 = query.match(/"([a-zA-Z.]+)": /);
    return match2 && match2[1];
  }
  /**
   * Toggles the visibility of the Settings editor table of contents during a search
   * depending on the behavior.
   */
  toggleTocBySearchBehaviorType() {
    const tocBehavior = this.configurationService.getValue(SEARCH_TOC_BEHAVIOR_KEY);
    const hideToc = tocBehavior === "hide";
    if (hideToc) {
      this.splitView.setViewVisible(0, false);
      this.splitView.style({
        separatorBorder: Color.transparent
      });
    } else {
      this.layoutSplitView(this.dimension);
    }
  }
  async triggerSearch(query, expandResults) {
    const progressRunner = this.editorProgressService.show(true, 800);
    const showAdvanced = this.viewState.tagFilters?.has(ADVANCED_SETTING_TAG);
    this.viewState.tagFilters = /* @__PURE__ */ new Set();
    this.viewState.extensionFilters = /* @__PURE__ */ new Set();
    this.viewState.featureFilters = /* @__PURE__ */ new Set();
    this.viewState.idFilters = /* @__PURE__ */ new Set();
    this.viewState.languageFilter = void 0;
    if (query) {
      const parsedQuery = parseQuery(query);
      query = parsedQuery.query;
      parsedQuery.tags.forEach((tag2) => this.viewState.tagFilters.add(tag2));
      parsedQuery.extensionFilters.forEach((extensionId) => this.viewState.extensionFilters.add(extensionId));
      parsedQuery.featureFilters.forEach((feature) => this.viewState.featureFilters.add(feature));
      parsedQuery.idFilters.forEach((id2) => this.viewState.idFilters.add(id2));
      this.viewState.languageFilter = parsedQuery.languageFilter;
    }
    if (showAdvanced !== this.viewState.tagFilters?.has(ADVANCED_SETTING_TAG)) {
      await this.onConfigUpdate();
    }
    this.settingsTargetsWidget.updateLanguageFilterIndicators(this.viewState.languageFilter);
    if (query && query !== "@") {
      query = this.parseSettingFromJSON(query) || query;
      await this.triggerFilterPreferences(query, expandResults, progressRunner);
      this.toggleTocBySearchBehaviorType();
    } else {
      if (this.viewState.tagFilters.size || this.viewState.extensionFilters.size || this.viewState.featureFilters.size || this.viewState.idFilters.size || this.viewState.languageFilter) {
        this.searchResultModel = this.createFilterModel();
      } else {
        this.searchResultModel = null;
      }
      this.searchDelayer.cancel();
      if (this.searchInProgress) {
        this.searchInProgress.dispose(true);
        this.searchInProgress = null;
      }
      if (expandResults) {
        this.tocTree.setFocus([]);
        this.viewState.categoryFilter = void 0;
      }
      this.tocTreeModel.currentSearchModel = this.searchResultModel;
      this.renderedSearchQuery = this.viewState.query;
      if (this.searchResultModel) {
        if (expandResults) {
          this.tocTree.setSelection([]);
          this.tocTree.expandAll();
        }
        this.refreshTOCTree();
        this.renderResultCountMessages(false);
        this.refreshTree();
        this.toggleTocBySearchBehaviorType();
      } else if (!this.tocTreeDisposed) {
        this.tocTree.collapseAll();
        this.refreshTOCTree();
        this.renderResultCountMessages(false);
        this.refreshTree();
        this.layoutSplitView(this.dimension);
      }
      progressRunner.done();
    }
  }
  /**
   * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
   */
  createFilterModel() {
    const filterModel = this.instantiationService.createInstance(SearchResultModel, this.viewState, this.settingsOrderByTocIndex, this.workspaceTrustManagementService.isWorkspaceTrusted());
    const fullResult = {
      filterMatches: [],
      exactMatch: false
    };
    const shouldShowAdvanced = this.canShowAdvancedSettings();
    for (const g of this.defaultSettingsEditorModel.settingsGroups.slice(1)) {
      for (const sect of g.sections) {
        for (const setting of sect.settings) {
          if (!shouldShowAdvanced && !this.shouldShowSetting(setting)) {
            continue;
          }
          fullResult.filterMatches.push({
            setting,
            matches: [],
            matchType: 0 /* None */,
            keyMatchScore: 0,
            score: 0,
            providerName: FILTER_MODEL_SEARCH_PROVIDER_NAME
          });
        }
      }
    }
    filterModel.setResult(0, fullResult);
    return filterModel;
  }
  async triggerFilterPreferences(query, expandResults, progressRunner) {
    if (this.searchInProgress) {
      this.searchInProgress.dispose(true);
      this.searchInProgress = null;
    }
    const searchInProgress = this.searchInProgress = new CancellationTokenSource();
    return this.searchDelayer.trigger(async () => {
      if (searchInProgress.token.isCancellationRequested) {
        return;
      }
      this.disableAiSearchToggle();
      const localResults = await this.doLocalSearch(query, searchInProgress.token);
      if (!this.searchResultModel || searchInProgress.token.isCancellationRequested) {
        return;
      }
      this.searchResultModel.showAiResults = false;
      if (localResults && localResults.filterMatches.length > 0) {
        this.onDidFinishSearch(expandResults, void 0);
      }
      if (!localResults || !localResults.exactMatch) {
        await this.doRemoteSearch(query, searchInProgress.token);
      }
      if (searchInProgress.token.isCancellationRequested) {
        return;
      }
      if (this.aiSearchPromise) {
        this.aiSearchPromise.cancel();
      }
      if (this.searchInputActionBar && this.showAiResultsAction && this.searchInputActionBar.hasAction(this.showAiResultsAction)) {
        this.aiSearchPromise = createCancelablePromise((token) => {
          return this.doAiSearch(query, token).then((results) => {
            if (results && this.showAiResultsAction) {
              this.showAiResultsAction.enabled = true;
              this.aiResultsAvailable.set(true);
              this.showAiResultsAction.label = SHOW_AI_RESULTS_ENABLED_LABEL;
              this.renderResultCountMessages(true);
            }
          }).catch((e4) => {
            if (!isCancellationError(e4)) {
              this.logService.trace("Error during AI settings search:", e4);
            }
          });
        });
      }
      this.onDidFinishSearch(expandResults, progressRunner);
    });
  }
  onDidFinishSearch(expandResults, progressRunner) {
    this.tocTreeModel.currentSearchModel = this.searchResultModel;
    this.renderedSearchQuery = this.viewState.query;
    if (expandResults) {
      this.tocTree.setFocus([]);
      this.viewState.categoryFilter = void 0;
      this.tocTree.expandAll();
      this.settingsTree.scrollTop = 0;
    }
    this.refreshTOCTree();
    this.renderTree(void 0, true);
    progressRunner?.done();
  }
  doLocalSearch(query, token) {
    const localSearchProvider = this.preferencesSearchService.getLocalSearchProvider(query);
    return this.searchWithProvider(0 /* Local */, localSearchProvider, STRING_MATCH_SEARCH_PROVIDER_NAME, token);
  }
  doRemoteSearch(query, token) {
    const remoteSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query);
    if (!remoteSearchProvider) {
      return Promise.resolve(null);
    }
    return this.searchWithProvider(1 /* Remote */, remoteSearchProvider, TF_IDF_SEARCH_PROVIDER_NAME, token);
  }
  async doAiSearch(query, token) {
    const aiSearchProvider = this.preferencesSearchService.getAiSearchProvider(query);
    if (!aiSearchProvider) {
      return null;
    }
    const embeddingsResults = await this.searchWithProvider(3 /* Embeddings */, aiSearchProvider, EMBEDDINGS_SEARCH_PROVIDER_NAME, token);
    if (!embeddingsResults || token.isCancellationRequested) {
      return null;
    }
    const llmResults = await this.getLLMRankedResults(query, token);
    if (token.isCancellationRequested) {
      return null;
    }
    return {
      filterMatches: embeddingsResults.filterMatches.concat(llmResults?.filterMatches ?? []),
      exactMatch: false
    };
  }
  async getLLMRankedResults(query, token) {
    const aiSearchProvider = this.preferencesSearchService.getAiSearchProvider(query);
    if (!aiSearchProvider) {
      return null;
    }
    const stopWatch = new StopWatch(false);
    const result = await aiSearchProvider.getLLMRankedResults(token);
    stopWatch.stop();
    if (token.isCancellationRequested) {
      return null;
    }
    if (result && result.filterMatches.length > 0) {
      const elapsed = stopWatch.elapsed();
      this.logSearchPerformance(LLM_RANKED_SEARCH_PROVIDER_NAME, elapsed);
    }
    this.searchResultModel.setResult(4 /* AiSelected */, result);
    return result;
  }
  async searchWithProvider(type, searchProvider, providerName, token) {
    const stopWatch = new StopWatch(false);
    const result = await this._searchPreferencesModel(this.defaultSettingsEditorModel, searchProvider, token);
    stopWatch.stop();
    if (token.isCancellationRequested) {
      return null;
    }
    if (result && !this.canShowAdvancedSettings()) {
      result.filterMatches = result.filterMatches.filter((match2) => this.shouldShowSetting(match2.setting));
    }
    if (result && result.filterMatches.length > 0) {
      const elapsed = stopWatch.elapsed();
      this.logSearchPerformance(providerName, elapsed);
    }
    this.searchResultModel ??= this.instantiationService.createInstance(SearchResultModel, this.viewState, this.settingsOrderByTocIndex, this.workspaceTrustManagementService.isWorkspaceTrusted());
    this.searchResultModel.setResult(type, result);
    return result;
  }
  logSearchPerformance(providerName, elapsed) {
    this.telemetryService.publicLog2("settingsEditor.searchPerformance", {
      providerName,
      elapsedMs: elapsed
    });
  }
  renderResultCountMessages(showAiResultsMessage) {
    if (!this.currentSettingsModel) {
      return;
    }
    this.clearFilterLinkContainer.style.display = this.viewState.tagFilters && this.viewState.tagFilters.size > 0 ? "initial" : "none";
    if (!this.searchResultModel) {
      if (this.countElement.style.display !== "none") {
        this.searchResultLabel = null;
        this.updateInputAriaLabel();
        this.countElement.style.display = "none";
        this.countElement.innerText = "";
        this.layout(this.dimension);
      }
      this.rootElement.classList.remove("no-results");
      this.splitView.el.style.visibility = "visible";
      return;
    } else {
      const count2 = this.searchResultModel.getUniqueResultsCount();
      let resultString;
      if (showAiResultsMessage) {
        switch (count2) {
          case 0:
            resultString = localize(18194, null);
            break;
          case 1:
            resultString = localize(18196, null);
            break;
          default:
            resultString = localize(18191, null, count2);
        }
      } else {
        switch (count2) {
          case 0:
            resultString = localize(18193, null);
            break;
          case 1:
            resultString = localize(18195, null);
            break;
          default:
            resultString = localize(18190, null, count2);
        }
      }
      this.searchResultLabel = resultString;
      this.updateInputAriaLabel();
      this.countElement.innerText = resultString;
      status(resultString);
      if (this.countElement.style.display !== "block") {
        this.countElement.style.display = "block";
      }
      this.layout(this.dimension);
      this.rootElement.classList.toggle("no-results", count2 === 0);
      this.splitView.el.style.visibility = count2 === 0 ? "hidden" : "visible";
    }
  }
  async _searchPreferencesModel(model, provider, token) {
    try {
      return await provider.searchModel(model, token);
    } catch (err) {
      if (isCancellationError(err)) {
        return Promise.reject(err);
      } else {
        return null;
      }
    }
  }
  layoutSplitView(dimension) {
    if (!this.isVisible()) {
      return;
    }
    const listHeight = dimension.height - (72 + 11 + 14);
    this.splitView.el.style.height = `${listHeight}px`;
    this.splitView.layout(this.bodyContainer.clientWidth, listHeight);
    const tocBehavior = this.configurationService.getValue(SEARCH_TOC_BEHAVIOR_KEY);
    const hideTocForSearch = tocBehavior === "hide" && this.searchResultModel;
    if (!hideTocForSearch) {
      const firstViewWasVisible = this.splitView.isViewVisible(0);
      const firstViewVisible = this.bodyContainer.clientWidth >= SettingsEditor2.NARROW_TOTAL_WIDTH;
      this.splitView.setViewVisible(0, firstViewVisible);
      if (!firstViewWasVisible && firstViewVisible && this.bodyContainer.clientWidth >= SettingsEditor2.EDITOR_MIN_WIDTH + SettingsEditor2.TOC_RESET_WIDTH) {
        this.splitView.resizeView(0, SettingsEditor2.TOC_RESET_WIDTH);
      }
      this.splitView.style({
        separatorBorder: firstViewVisible ? this.theme.getColor(settingsSashBorder) : Color.transparent
      });
    }
  }
  saveState() {
    this.saveSearchHistory();
    if (this.isVisible()) {
      const searchQuery = this.searchWidget.getValue().trim();
      const target = this.settingsTargetsWidget.settingsTarget;
      if (this.input) {
        this.editorMemento.saveEditorState(this.group, this.input, { searchQuery, target });
      }
    } else if (this.input) {
      this.editorMemento.clearEditorState(this.input, this.group);
    }
    super.saveState();
  }
};

SettingsEditor2 = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, ITextResourceConfigurationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IPreferencesService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IPreferencesSearchService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IEditorGroupsService),
  __decorateParam(12, IUserDataSyncWorkbenchService),
  __decorateParam(13, IUserDataSyncEnablementService),
  __decorateParam(14, IWorkspaceTrustManagementService),
  __decorateParam(15, IExtensionService),
  __decorateParam(16, ILanguageService),
  __decorateParam(17, IExtensionManagementService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IExtensionGalleryService),
  __decorateParam(20, IEditorProgressService),
  __decorateParam(21, IUserDataProfileService),
  __decorateParam(22, IKeybindingService),
  __decorateParam(23, IChatEntitlementService),
  __decorateParam(24, IWorkbenchEnvironmentService)
], SettingsEditor2);

var SyncControls = class extends Disposable {
  constructor(window2, container2, commandService, userDataSyncService, userDataSyncEnablementService, telemetryService) {
    super();
    this.commandService = commandService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this._onDidChangeLastSyncedLabel = this._register(new Emitter());
    this.onDidChangeLastSyncedLabel = this._onDidChangeLastSyncedLabel.event;
    const headerRightControlsContainer = append(container2, $28(".settings-right-controls"));
    const turnOnSyncButtonContainer = append(headerRightControlsContainer, $28(".turn-on-sync"));
    this.turnOnSyncButton = this._register(new Button(turnOnSyncButtonContainer, { title: true, ...defaultButtonStyles }));
    this.lastSyncedLabel = append(headerRightControlsContainer, $28(".last-synced-label"));
    hide(this.lastSyncedLabel);
    this.turnOnSyncButton.enabled = true;
    this.turnOnSyncButton.label = localize(18203, null);
    hide(this.turnOnSyncButton.element);
    this._register(this.turnOnSyncButton.onDidClick(async () => {
      await this.commandService.executeCommand("workbench.userDataSync.actions.turnOn");
    }));
    this.updateLastSyncedTime();
    this._register(this.userDataSyncService.onDidChangeLastSyncTime(() => {
      this.updateLastSyncedTime();
    }));
    const updateLastSyncedTimer = this._register(new WindowIntervalTimer());
    updateLastSyncedTimer.cancelAndSet(() => this.updateLastSyncedTime(), 60 * 1e3, window2);
    this.update();
    this._register(this.userDataSyncService.onDidChangeStatus(() => {
      this.update();
    }));
    this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
      this.update();
    }));
  }
  updateLastSyncedTime() {
    const last = this.userDataSyncService.lastSyncTime;
    let label3;
    if (typeof last === "number") {
      const d = fromNow(last, true, void 0, true);
      label3 = localize(18189, null, d);
    } else {
      label3 = "";
    }
    this.lastSyncedLabel.textContent = label3;
    this._onDidChangeLastSyncedLabel.fire(label3);
  }
  update() {
    if (this.userDataSyncService.status === "uninitialized" /* Uninitialized */) {
      return;
    }
    if (this.userDataSyncEnablementService.isEnabled() || this.userDataSyncService.status !== "idle" /* Idle */) {
      show(this.lastSyncedLabel);
      hide(this.turnOnSyncButton.element);
    } else {
      hide(this.lastSyncedLabel);
      show(this.turnOnSyncButton.element);
    }
  }
};

SyncControls = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IUserDataSyncService),
  __decorateParam(4, IUserDataSyncEnablementService),
  __decorateParam(5, ITelemetryService)
], SyncControls);
export { createGroupIterator, isSettingsSearchUpToDate, $28, searchBoxLabel, searchBoxPlaceholderWithHistory, SEARCH_TOC_BEHAVIOR_KEY, SHOW_AI_RESULTS_ENABLED_LABEL, SHOW_AI_RESULTS_DISABLED_LABEL, SETTINGS_EDITOR_STATE_KEY, SettingsEditor2, SyncControls };
