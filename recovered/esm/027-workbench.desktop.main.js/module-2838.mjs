// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchWidget.ts
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { searchHideReplaceIcon, searchReplaceAllIcon, searchShowContextIcon, searchShowReplaceIcon } from "./module-2829.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { SearchContext } from "./module-1262.mjs";
import { NotebookFindFilters } from "./module-2425.mjs";
import { NotebookEditorInput } from "./module-0939.mjs";
import { Delayer, disposableTimeout } from "./module-0036.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { $, append, trackFocus } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { Button } from "./module-0546.mjs";
import { showHistoryKeybindingHint } from "./module-0604.mjs";
import { SearchFindInput } from "./module-2837.mjs";
import { Toggle } from "./module-0549.mjs";
import { ToggleSearchEditorContextLinesCommandId } from "./module-2833.mjs";
import { defaultInputBoxStyles, defaultToggleStyles } from "./module-0513.mjs";
import { InputBox } from "./module-0600.mjs";
import { ContextScopedReplaceInput } from "./module-0603.mjs";
import { ActionBar } from "./module-0477.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { CONTEXT_FIND_WIDGET_NOT_VISIBLE } from "./module-0595.mjs";
import { IViewsService } from "./module-1246.mjs";
import { getSearchView, isSearchViewFocused } from "./module-2836.mjs";


// src/vs/workbench/contrib/search/browser/searchWidget.ts
var SingleLineInputHeight = 26;

var ReplaceAllAction = class _ReplaceAllAction extends Action {
  constructor(_searchWidget) {
    super(_ReplaceAllAction.ID, "", ThemeIcon.asClassName(searchReplaceAllIcon), false);
    this._searchWidget = _searchWidget;
  }
  static {
    this.ID = "search.action.replaceAll";
  }
  set searchWidget(searchWidget) {
    this._searchWidget = searchWidget;
  }
  run() {
    if (this._searchWidget) {
      return this._searchWidget.triggerReplaceAll();
    }
    return Promise.resolve();
  }
};

var hoverLifecycleOptions = { groupId: "search-widget" };

var ctrlKeyMod4 = isMacintosh ? 256 /* WinCtrl */ : 2048 /* CtrlCmd */;

function stopPropagationForMultiLineUpwards2(event, value2, textarea) {
  const isMultiline2 = !!value2.match(/\n/);
  if (textarea && (isMultiline2 || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionStart > 0) {
    event.stopPropagation();
    return;
  }
}

function stopPropagationForMultiLineDownwards2(event, value2, textarea) {
  const isMultiline2 = !!value2.match(/\n/);
  if (textarea && (isMultiline2 || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionEnd < textarea.value.length) {
    event.stopPropagation();
    return;
  }
}

var SearchWidget2 = class extends Widget {
  constructor(container3, options3, contextViewService, contextKeyService, keybindingService, clipboardServce, configurationService, accessibilityService, contextMenuService, instantiationService, editorService) {
    super();
    this.contextViewService = contextViewService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this.clipboardServce = clipboardServce;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.ignoreGlobalFindBufferOnNextFocus = false;
    this.previousGlobalFindBufferValue = null;
    /**
     * Tracks whether the accessibility help hint has been announced in the ARIA label.
     * Reset when the widget loses focus, allowing the hint to be announced again
     * on the next focus.
     */
    this._accessibilityHelpHintAnnounced = false;
    this._onSearchSubmit = this._register(new Emitter());
    this.onSearchSubmit = this._onSearchSubmit.event;
    this._onSearchCancel = this._register(new Emitter());
    this.onSearchCancel = this._onSearchCancel.event;
    this._onReplaceToggled = this._register(new Emitter());
    this.onReplaceToggled = this._onReplaceToggled.event;
    this._onReplaceStateChange = this._register(new Emitter());
    this.onReplaceStateChange = this._onReplaceStateChange.event;
    this._onPreserveCaseChange = this._register(new Emitter());
    this.onPreserveCaseChange = this._onPreserveCaseChange.event;
    this._onReplaceValueChanged = this._register(new Emitter());
    this.onReplaceValueChanged = this._onReplaceValueChanged.event;
    this._onReplaceAll = this._register(new Emitter());
    this.onReplaceAll = this._onReplaceAll.event;
    this._onBlur = this._register(new Emitter());
    this.onBlur = this._onBlur.event;
    this._onDidHeightChange = this._register(new Emitter());
    this.onDidHeightChange = this._onDidHeightChange.event;
    this._onDidToggleContext = this._register(new Emitter());
    this.onDidToggleContext = this._onDidToggleContext.event;
    this.replaceActive = SearchContext.ReplaceActiveKey.bindTo(this.contextKeyService);
    this.searchInputBoxFocused = SearchContext.SearchInputBoxFocusedKey.bindTo(this.contextKeyService);
    this.replaceInputBoxFocused = SearchContext.ReplaceInputBoxFocusedKey.bindTo(this.contextKeyService);
    const notebookOptions = options3.notebookOptions ?? {
      isInNotebookMarkdownInput: true,
      isInNotebookMarkdownPreview: true,
      isInNotebookCellInput: true,
      isInNotebookCellOutput: true
    };
    this._notebookFilters = this._register(
      new NotebookFindFilters(
        notebookOptions.isInNotebookMarkdownInput,
        notebookOptions.isInNotebookMarkdownPreview,
        notebookOptions.isInNotebookCellInput,
        notebookOptions.isInNotebookCellOutput,
        { findScopeType: "none" /* None */ }
      )
    );
    this._register(
      this._notebookFilters.onDidChange(() => {
        if (this.searchInput) {
          this.searchInput.updateFilterStyles();
        }
      })
    );
    this._register(this.editorService.onDidEditorsChange((e) => {
      if (this.searchInput && e.event.editor instanceof NotebookEditorInput && (e.event.kind === 5 /* EDITOR_OPEN */ || e.event.kind === 6 /* EDITOR_CLOSE */)) {
        this.searchInput.filterVisible = this._hasNotebookOpen();
      }
    }));
    this._replaceHistoryDelayer = new Delayer(500);
    this._toggleReplaceButtonListener = this._register(new MutableDisposable());
    this.render(container3, options3);
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.accessibilitySupport")) {
        this.updateAccessibilitySupport();
      }
    }));
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.updateAccessibilitySupport()));
    this.updateAccessibilitySupport();
  }
  static {
    this.INPUT_MAX_HEIGHT = 134;
  }
  static {
    this.REPLACE_ALL_DISABLED_LABEL = localize(19250, null);
  }
  static {
    this.REPLACE_ALL_ENABLED_LABEL = (keyBindingService2) => {
      return keyBindingService2.appendKeybinding(localize(19251, null), ReplaceAllAction.ID);
    };
  }
  _hasNotebookOpen() {
    const editors = this.editorService.editors;
    return editors.some((editor) => editor instanceof NotebookEditorInput);
  }
  getNotebookFilters() {
    return this._notebookFilters;
  }
  focus(select = true, focusReplace = false, suppressGlobalSearchBuffer = false) {
    this.ignoreGlobalFindBufferOnNextFocus = suppressGlobalSearchBuffer;
    if (focusReplace && this.isReplaceShown()) {
      if (this.replaceInput) {
        this._updateSearchInputAriaLabel(false);
        this.replaceInput.focus();
        if (select) {
          this.replaceInput.select();
        }
      }
    } else {
      if (this.searchInput) {
        this._updateSearchInputAriaLabel(true);
        this.searchInput.focus();
        if (select) {
          this.searchInput.select();
        }
      }
    }
  }
  /**
   * Updates the ARIA label of the search input box.
   * When a screen reader is active and the accessibility verbosity setting is enabled,
   * includes a hint about pressing Alt+F1 for accessibility help on first focus.
   * The hint is only announced once per focus cycle to prevent double-speak.
   * @param includeHint Whether to include the accessibility help hint in the label
   */
  _updateSearchInputAriaLabel(includeHint) {
    if (!this.searchInput) {
      return;
    }
    let searchLabel = localize(19249, null);
    if (includeHint && !this._accessibilityHelpHintAnnounced && this.configurationService.getValue("accessibility.verbosity.find") && this.accessibilityService.isScreenReaderOptimized()) {
      const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getAriaLabel();
      if (keybinding) {
        searchLabel += ", " + localize(19247, null, keybinding);
        this._accessibilityHelpHintAnnounced = true;
        this._labelResetTimeout?.dispose();
        this._labelResetTimeout = disposableTimeout(() => {
          if (this.searchInput) {
            this.searchInput.inputBox.setAriaLabel(localize(19249, null));
          }
        }, 1e3);
      }
    }
    this.searchInput.inputBox.setAriaLabel(searchLabel);
  }
  setWidth(width2) {
    this.searchInput?.inputBox.layout();
    if (this.replaceInput) {
      this.replaceInput.width = width2 - 28;
      this.replaceInput.inputBox.layout();
    }
  }
  clear() {
    this.searchInput?.clear();
    this.replaceInput?.setValue("");
    this.setReplaceAllActionState(false);
  }
  isReplaceShown() {
    return this.replaceContainer ? !this.replaceContainer.classList.contains("disabled") : false;
  }
  isReplaceActive() {
    return !!this.replaceActive.get();
  }
  getReplaceValue() {
    return this.replaceInput?.getValue() ?? "";
  }
  toggleReplace(show3) {
    if (show3 === void 0 || show3 !== this.isReplaceShown()) {
      this.onToggleReplaceButton();
    }
  }
  getSearchHistory() {
    return this.searchInput?.inputBox.getHistory() ?? [];
  }
  getReplaceHistory() {
    return this.replaceInput?.inputBox.getHistory() ?? [];
  }
  prependSearchHistory(history) {
    this.searchInput?.inputBox.prependHistory(history);
  }
  prependReplaceHistory(history) {
    this.replaceInput?.inputBox.prependHistory(history);
  }
  clearHistory() {
    this.searchInput?.inputBox.clearHistory();
    this.replaceInput?.inputBox.clearHistory();
  }
  showNextSearchTerm() {
    this.searchInput?.inputBox.showNextValue();
  }
  showPreviousSearchTerm() {
    this.searchInput?.inputBox.showPreviousValue();
  }
  showNextReplaceTerm() {
    this.replaceInput?.inputBox.showNextValue();
  }
  showPreviousReplaceTerm() {
    this.replaceInput?.inputBox.showPreviousValue();
  }
  searchInputHasFocus() {
    return !!this.searchInputBoxFocused.get();
  }
  replaceInputHasFocus() {
    return !!this.replaceInput?.inputBox.hasFocus();
  }
  focusReplaceAllAction() {
    this.replaceActionBar?.focus(true);
  }
  focusRegexAction() {
    this.searchInput?.focusOnRegex();
  }
  set replaceButtonVisibility(val) {
    if (this.toggleReplaceButton) {
      this.toggleReplaceButton.element.style.display = val ? "" : "none";
    }
  }
  render(container3, options3) {
    this.domNode = append(container3, $(".search-widget"));
    this.domNode.style.position = "relative";
    if (!options3._hideReplaceToggle) {
      this.renderToggleReplaceButton(this.domNode);
    }
    this.renderSearchInput(this.domNode, options3);
    this.renderReplaceInput(this.domNode, options3);
  }
  updateAccessibilitySupport() {
    this.searchInput?.setFocusInputOnOptionClick(!this.accessibilityService.isScreenReaderOptimized());
  }
  renderToggleReplaceButton(parent) {
    const opts = {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0,
      title: localize(19254, null),
      hoverDelegate: getDefaultHoverDelegate("element")
    };
    this.toggleReplaceButton = this._register(new Button(parent, opts));
    this.toggleReplaceButton.element.setAttribute("aria-expanded", "false");
    this.toggleReplaceButton.element.classList.add("toggle-replace-button");
    this.toggleReplaceButton.icon = searchHideReplaceIcon;
    this._toggleReplaceButtonListener.value = this.toggleReplaceButton.onDidClick(() => this.onToggleReplaceButton());
  }
  renderSearchInput(parent, options3) {
    const history = options3.searchHistory || [];
    const inputOptions2 = {
      label: localize(19249, null),
      validation: (value2) => this.validateSearchInput(value2),
      placeholder: localize(19252, null),
      appendCaseSensitiveLabel: this.keybindingService.appendKeybinding("", "toggleSearchCaseSensitive" /* ToggleCaseSensitiveCommandId */),
      appendWholeWordsLabel: this.keybindingService.appendKeybinding("", "toggleSearchWholeWord" /* ToggleWholeWordCommandId */),
      appendRegexLabel: this.keybindingService.appendKeybinding("", "toggleSearchRegex" /* ToggleRegexCommandId */),
      history: new Set(history),
      showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
      flexibleHeight: true,
      flexibleMaxHeight: SearchWidget2.INPUT_MAX_HEIGHT,
      showCommonFindToggles: true,
      inputBoxStyles: options3.inputBoxStyles,
      toggleStyles: options3.toggleStyles,
      hoverLifecycleOptions
    };
    const searchInputContainer = append(parent, $(".search-container.input-box"));
    this.searchInput = this._register(
      new SearchFindInput(
        searchInputContainer,
        this.contextViewService,
        inputOptions2,
        this.contextKeyService,
        this.contextMenuService,
        this.instantiationService,
        this._notebookFilters,
        this._hasNotebookOpen()
      )
    );
    this._register(this.searchInput.onKeyDown((keyboardEvent) => this.onSearchInputKeyDown(keyboardEvent)));
    this.searchInput.setValue(options3.value || "");
    this.searchInput.setRegex(!!options3.isRegex);
    this.searchInput.setCaseSensitive(!!options3.isCaseSensitive);
    this.searchInput.setWholeWords(!!options3.isWholeWords);
    this._register(this.searchInput.onCaseSensitiveKeyDown((keyboardEvent) => this.onCaseSensitiveKeyDown(keyboardEvent)));
    this._register(this.searchInput.onRegexKeyDown((keyboardEvent) => this.onRegexKeyDown(keyboardEvent)));
    this._register(this.searchInput.inputBox.onDidChange(() => this.onSearchInputChanged()));
    this._register(this.searchInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
    this._register(this.onReplaceValueChanged(() => {
      this._replaceHistoryDelayer.trigger(() => this.replaceInput?.inputBox.addToHistory());
    }));
    this.searchInputFocusTracker = this._register(trackFocus(this.searchInput.inputBox.inputElement));
    this._register(this.searchInputFocusTracker.onDidFocus(async () => {
      this.searchInputBoxFocused.set(true);
      const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
      if (!this.ignoreGlobalFindBufferOnNextFocus && useGlobalFindBuffer) {
        const globalBufferText = await this.clipboardServce.readFindText();
        if (globalBufferText && this.previousGlobalFindBufferValue !== globalBufferText) {
          this.searchInput?.inputBox.addToHistory();
          this.searchInput?.setValue(globalBufferText);
          this.searchInput?.select();
        }
        this.previousGlobalFindBufferValue = globalBufferText;
      }
      this.ignoreGlobalFindBufferOnNextFocus = false;
    }));
    this._register(this.searchInputFocusTracker.onDidBlur(() => this.searchInputBoxFocused.set(false)));
    this.showContextToggle = this._register(new Toggle({
      isChecked: false,
      title: this.keybindingService.appendKeybinding(localize(19255, null), ToggleSearchEditorContextLinesCommandId),
      icon: searchShowContextIcon,
      hoverLifecycleOptions,
      ...defaultToggleStyles
    }));
    this._register(this.showContextToggle.onChange(() => this.onContextLinesChanged()));
    if (options3.showContextToggle) {
      this.contextLinesInput = this._register(new InputBox(searchInputContainer, this.contextViewService, { type: "number", inputBoxStyles: defaultInputBoxStyles }));
      this.contextLinesInput.element.classList.add("context-lines-input");
      this.contextLinesInput.value = "" + (this.configurationService.getValue("search").searchEditor.defaultNumberOfContextLines ?? 1);
      this._register(this.contextLinesInput.onDidChange((value2) => {
        if (value2 !== "0") {
          this.showContextToggle.checked = true;
        }
        this.onContextLinesChanged();
      }));
      append(searchInputContainer, this.showContextToggle.domNode);
    }
  }
  onContextLinesChanged() {
    this._onDidToggleContext.fire();
    if (this.contextLinesInput.value.includes("-")) {
      this.contextLinesInput.value = "0";
    }
    this._onDidToggleContext.fire();
  }
  setContextLines(lines) {
    if (!this.contextLinesInput) {
      return;
    }
    if (lines === 0) {
      this.showContextToggle.checked = false;
    } else {
      this.showContextToggle.checked = true;
      this.contextLinesInput.value = "" + lines;
    }
  }
  renderReplaceInput(parent, options3) {
    this.replaceContainer = append(parent, $(".replace-container.disabled"));
    const replaceBox = append(this.replaceContainer, $(".replace-input"));
    this.replaceInput = this._register(new ContextScopedReplaceInput(replaceBox, this.contextViewService, {
      label: localize(19248, null),
      placeholder: localize(19253, null),
      appendPreserveCaseLabel: this.keybindingService.appendKeybinding("", "toggleSearchPreserveCase" /* TogglePreserveCaseId */),
      history: new Set(options3.replaceHistory),
      showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
      flexibleHeight: true,
      flexibleMaxHeight: SearchWidget2.INPUT_MAX_HEIGHT,
      inputBoxStyles: options3.inputBoxStyles,
      toggleStyles: options3.toggleStyles,
      hoverLifecycleOptions
    }, this.contextKeyService, true));
    this._register(this.replaceInput.onDidOptionChange((viaKeyboard) => {
      if (!viaKeyboard) {
        if (this.replaceInput) {
          this._onPreserveCaseChange.fire(this.replaceInput.getPreserveCase());
        }
      }
    }));
    this._register(this.replaceInput.onKeyDown((keyboardEvent) => this.onReplaceInputKeyDown(keyboardEvent)));
    this.replaceInput.setValue(options3.replaceValue || "");
    this._register(this.replaceInput.inputBox.onDidChange(() => this._onReplaceValueChanged.fire()));
    this._register(this.replaceInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
    this.replaceAllAction = this._register(new ReplaceAllAction(this));
    this.replaceAllAction.label = SearchWidget2.REPLACE_ALL_DISABLED_LABEL;
    this.replaceActionBar = this._register(new ActionBar(this.replaceContainer));
    this.replaceActionBar.push([this.replaceAllAction], { icon: true, label: false });
    this.onkeydown(this.replaceActionBar.domNode, (keyboardEvent) => this.onReplaceActionbarKeyDown(keyboardEvent));
    this.replaceInputFocusTracker = this._register(trackFocus(this.replaceInput.inputBox.inputElement));
    this._register(this.replaceInputFocusTracker.onDidFocus(() => this.replaceInputBoxFocused.set(true)));
    this._register(this.replaceInputFocusTracker.onDidBlur(() => this.replaceInputBoxFocused.set(false)));
    this._register(this.replaceInput.onPreserveCaseKeyDown((keyboardEvent) => this.onPreserveCaseKeyDown(keyboardEvent)));
  }
  triggerReplaceAll() {
    this._onReplaceAll.fire();
    return Promise.resolve();
  }
  onToggleReplaceButton() {
    this.replaceContainer?.classList.toggle("disabled");
    if (this.isReplaceShown()) {
      this.toggleReplaceButton?.element.classList.remove(...ThemeIcon.asClassNameArray(searchHideReplaceIcon));
      this.toggleReplaceButton?.element.classList.add(...ThemeIcon.asClassNameArray(searchShowReplaceIcon));
    } else {
      this.toggleReplaceButton?.element.classList.remove(...ThemeIcon.asClassNameArray(searchShowReplaceIcon));
      this.toggleReplaceButton?.element.classList.add(...ThemeIcon.asClassNameArray(searchHideReplaceIcon));
    }
    this.toggleReplaceButton?.element.setAttribute("aria-expanded", this.isReplaceShown() ? "true" : "false");
    this.updateReplaceActiveState();
    this._onReplaceToggled.fire();
  }
  setValue(value2) {
    this.searchInput?.setValue(value2);
  }
  setReplaceAllActionState(enabled) {
    if (this.replaceAllAction && this.replaceAllAction.enabled !== enabled) {
      this.replaceAllAction.enabled = enabled;
      this.replaceAllAction.label = enabled ? SearchWidget2.REPLACE_ALL_ENABLED_LABEL(this.keybindingService) : SearchWidget2.REPLACE_ALL_DISABLED_LABEL;
      this.updateReplaceActiveState();
    }
  }
  updateReplaceActiveState() {
    const currentState = this.isReplaceActive();
    const newState = this.isReplaceShown() && !!this.replaceAllAction?.enabled;
    if (currentState !== newState) {
      this.replaceActive.set(newState);
      this._onReplaceStateChange.fire(newState);
      this.replaceInput?.inputBox.layout();
    }
  }
  validateSearchInput(value2) {
    if (value2.length === 0) {
      return null;
    }
    if (!this.searchInput?.getRegex()) {
      return null;
    }
    try {
      new RegExp(value2, "u");
    } catch (e) {
      return { content: e.message };
    }
    return null;
  }
  onSearchInputChanged() {
    this.searchInput?.clearMessage();
    this.setReplaceAllActionState(false);
    if (this.searchConfiguration.searchOnType) {
      if (this.searchInput?.getRegex()) {
        try {
          const regex = new RegExp(this.searchInput.getValue(), "ug");
          const matchienessHeuristic = `
								~!@#$%^&*()_+
								\`1234567890-=
								qwertyuiop[]\\
								QWERTYUIOP{}|
								asdfghjkl;'
								ASDFGHJKL:"
								zxcvbnm,./
								ZXCVBNM<>? `.match(regex)?.length ?? 0;
          const delayMultiplier = matchienessHeuristic < 50 ? 1 : matchienessHeuristic < 100 ? 5 : (
            // expressions like `.` or `\w`
            10
          );
          this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod * delayMultiplier);
        } catch {
        }
      } else {
        this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod);
      }
    }
  }
  onSearchInputKeyDown(keyboardEvent) {
    if (keyboardEvent.equals(ctrlKeyMod4 | 3 /* Enter */)) {
      this.searchInput?.inputBox.insertAtCursor("\n");
      keyboardEvent.preventDefault();
    }
    if (keyboardEvent.equals(3 /* Enter */)) {
      this.searchInput?.onSearchSubmit();
      this.submitSearch();
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(9 /* Escape */)) {
      this._onSearchCancel.fire({ focus: true });
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(2 /* Tab */)) {
      if (this.isReplaceShown()) {
        this.replaceInput?.focus();
      } else {
        this.searchInput?.focusOnCaseSensitive();
      }
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(16 /* UpArrow */)) {
      stopPropagationForMultiLineUpwards2(keyboardEvent, this.searchInput?.getValue() ?? "", this.searchInput?.domNode.querySelector("textarea") ?? null);
    } else if (keyboardEvent.equals(18 /* DownArrow */)) {
      stopPropagationForMultiLineDownwards2(keyboardEvent, this.searchInput?.getValue() ?? "", this.searchInput?.domNode.querySelector("textarea") ?? null);
    } else if (keyboardEvent.equals(11 /* PageUp */)) {
      const inputElement = this.searchInput?.inputBox.inputElement;
      if (inputElement) {
        inputElement.setSelectionRange(0, 0);
        inputElement.focus();
        keyboardEvent.preventDefault();
      }
    } else if (keyboardEvent.equals(12 /* PageDown */)) {
      const inputElement = this.searchInput?.inputBox.inputElement;
      if (inputElement) {
        const endOfText = inputElement.value.length;
        inputElement.setSelectionRange(endOfText, endOfText);
        inputElement.focus();
        keyboardEvent.preventDefault();
      }
    }
  }
  onCaseSensitiveKeyDown(keyboardEvent) {
    if (keyboardEvent.equals(1024 /* Shift */ | 2 /* Tab */)) {
      if (this.isReplaceShown()) {
        this.replaceInput?.focus();
        keyboardEvent.preventDefault();
      }
    }
  }
  onRegexKeyDown(keyboardEvent) {
    if (keyboardEvent.equals(2 /* Tab */)) {
      if (this.isReplaceShown()) {
        this.replaceInput?.focusOnPreserve();
        keyboardEvent.preventDefault();
      }
    }
  }
  onPreserveCaseKeyDown(keyboardEvent) {
    if (keyboardEvent.equals(2 /* Tab */)) {
      if (this.isReplaceActive()) {
        this.focusReplaceAllAction();
      } else {
        this._onBlur.fire();
      }
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(1024 /* Shift */ | 2 /* Tab */)) {
      this.focusRegexAction();
      keyboardEvent.preventDefault();
    }
  }
  onReplaceInputKeyDown(keyboardEvent) {
    if (keyboardEvent.equals(ctrlKeyMod4 | 3 /* Enter */)) {
      this.replaceInput?.inputBox.insertAtCursor("\n");
      keyboardEvent.preventDefault();
    }
    if (keyboardEvent.equals(3 /* Enter */)) {
      this.submitSearch();
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(2 /* Tab */)) {
      this.searchInput?.focusOnCaseSensitive();
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(1024 /* Shift */ | 2 /* Tab */)) {
      this.searchInput?.focus();
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.equals(16 /* UpArrow */)) {
      stopPropagationForMultiLineUpwards2(keyboardEvent, this.replaceInput?.getValue() ?? "", this.replaceInput?.domNode.querySelector("textarea") ?? null);
    } else if (keyboardEvent.equals(18 /* DownArrow */)) {
      stopPropagationForMultiLineDownwards2(keyboardEvent, this.replaceInput?.getValue() ?? "", this.replaceInput?.domNode.querySelector("textarea") ?? null);
    }
  }
  onReplaceActionbarKeyDown(keyboardEvent) {
    if (keyboardEvent.equals(1024 /* Shift */ | 2 /* Tab */)) {
      this.focusRegexAction();
      keyboardEvent.preventDefault();
    }
  }
  async submitSearch(triggeredOnType = false, delay = 0) {
    this.searchInput?.validate();
    if (!this.searchInput?.inputBox.isInputValid()) {
      return;
    }
    const value2 = this.searchInput.getValue();
    const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
    if (value2 && useGlobalFindBuffer) {
      await this.clipboardServce.writeFindText(value2);
    }
    this._onSearchSubmit.fire({ triggeredOnType, delay });
  }
  getContextLines() {
    return this.showContextToggle.checked ? +this.contextLinesInput.value : 0;
  }
  modifyContextLines(increase) {
    const current = +this.contextLinesInput.value;
    const modified = current + (increase ? 1 : -1);
    this.showContextToggle.checked = modified !== 0;
    this.contextLinesInput.value = "" + modified;
  }
  toggleContextLines() {
    this.showContextToggle.checked = !this.showContextToggle.checked;
    this.onContextLinesChanged();
  }
  dispose() {
    this.setReplaceAllActionState(false);
    super.dispose();
  }
  get searchConfiguration() {
    return this.configurationService.getValue("search");
  }
};

SearchWidget2 = __decorateClass([
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IClipboardService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IAccessibilityService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IEditorService)
], SearchWidget2);

function registerContributions() {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: ReplaceAllAction.ID,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.ReplaceActiveKey, CONTEXT_FIND_WIDGET_NOT_VISIBLE),
    primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 3 /* Enter */,
    handler: (accessor) => {
      const viewsService = accessor.get(IViewsService);
      if (isSearchViewFocused(viewsService)) {
        const searchView = getSearchView(viewsService);
        if (searchView) {
          new ReplaceAllAction(searchView.searchAndReplaceWidget).run();
        }
      }
    }
  });
}
export { stopPropagationForMultiLineUpwards2, stopPropagationForMultiLineDownwards2, registerContributions, SingleLineInputHeight, ReplaceAllAction, hoverLifecycleOptions, ctrlKeyMod4, SearchWidget2 };
