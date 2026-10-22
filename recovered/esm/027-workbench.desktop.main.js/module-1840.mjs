// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/keybindingsEditor.ts
import { $, Dimension, EventHelper, EventType, addDisposableListener, append, clearNode, finalHandler, getDomNodePagePosition, getTotalWidth } from "./module-0075.mjs";
import { EditorPane } from "./module-1089.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Delayer } from "./module-0036.mjs";
import { CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS, KEYBINDINGS_EDITOR_COMMAND_ADD, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, KEYBINDINGS_EDITOR_COMMAND_COPY, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE, KEYBINDINGS_EDITOR_COMMAND_DEFINE, KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN, KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, KEYBINDINGS_EDITOR_COMMAND_REMOVE, KEYBINDINGS_EDITOR_COMMAND_RESET, KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR, KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE } from "./module-1831.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { keybindingsAddIcon, keybindingsEditIcon, keybindingsRecordKeysIcon, keybindingsSortIcon, preferencesClearInputIcon } from "./module-1834.mjs";
import { registerNavigableContainer } from "./module-1369.mjs";
import { OS, isIOS } from "./module-0014.mjs";
import { KEYBINDING_ENTRY_TEMPLATE_ID } from "./module-1646.mjs";
import { DefineKeybindingWidget, KeybindingsSearchWidget } from "./module-1836.mjs";
import { defaultKeybindingLabelStyles, defaultToggleStyles, getInputBoxStyle } from "./module-0513.mjs";
import { settingsTextInputBorder } from "./module-1839.mjs";
import { ToolBar } from "./module-0503.mjs";
import { ToggleActionViewItem } from "./module-0549.mjs";
import { asCssVariable, registerColor } from "./module-0226.mjs";
import { badgeBackground, badgeForeground } from "./module-0228.mjs";
import { contrastBorder, foreground } from "./module-0227.mjs";
import { WorkbenchTable } from "./module-0636.mjs";
import { editorBackground } from "./module-0229.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { MenuId, MenuRegistry, isIMenuItem } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingEditingService } from "./module-1634.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ActionBar } from "./module-0477.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { IHoverService } from "./module-0520.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isString } from "./module-0010.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { SuggestEnabledInput } from "./module-1838.mjs";
import { listActiveSelectionBackground, listActiveSelectionForeground, listFocusBackground, listFocusForeground, listHoverBackground, listHoverForeground, listInactiveSelectionBackground, listInactiveSelectionForeground, tableOddRowsBackgroundColor } from "./module-0232.mjs";
import { WORKBENCH_BACKGROUND } from "./module-0912.mjs";


// src/vs/workbench/contrib/preferences/browser/keybindingsEditor.ts
var $24 = $;

var KeybindingsEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, keybindingsService, contextMenuService, keybindingEditingService, contextKeyService, notificationService, clipboardService, instantiationService, editorService, storageService, configurationService, accessibilityService) {
    super(KeybindingsEditor.ID, group2, telemetryService, themeService, storageService);
    this.keybindingsService = keybindingsService;
    this.contextMenuService = contextMenuService;
    this.keybindingEditingService = keybindingEditingService;
    this.contextKeyService = contextKeyService;
    this.notificationService = notificationService;
    this.clipboardService = clipboardService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this._onDefineWhenExpression = this._register(new Emitter());
    this.onDefineWhenExpression = this._onDefineWhenExpression.event;
    this._onRejectWhenExpression = this._register(new Emitter());
    this.onRejectWhenExpression = this._onRejectWhenExpression.event;
    this._onAcceptWhenExpression = this._register(new Emitter());
    this.onAcceptWhenExpression = this._onAcceptWhenExpression.event;
    this._onLayout = this._register(new Emitter());
    this.onLayout = this._onLayout.event;
    this.keybindingsEditorModel = null;
    this.unAssignedKeybindingItemToRevealAndFocus = null;
    this.tableEntries = [];
    this.dimension = null;
    this.latestEmptyFilters = [];
    this.delayedFiltering = this._register(new Delayer(300));
    this._register(keybindingsService.onDidUpdateKeybindings(() => this.render(!!this.keybindingFocusContextKey.get())));
    this.keybindingsEditorContextKey = CONTEXT_KEYBINDINGS_EDITOR.bindTo(this.contextKeyService);
    this.searchFocusContextKey = CONTEXT_KEYBINDINGS_SEARCH_FOCUS.bindTo(this.contextKeyService);
    this.keybindingFocusContextKey = CONTEXT_KEYBINDING_FOCUS.bindTo(this.contextKeyService);
    this.searchHasValueContextKey = CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE.bindTo(this.contextKeyService);
    this.searchHistoryDelayer = this._register(new Delayer(500));
    this.recordKeysAction = this._register(new Action(KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, localize(18078, null), ThemeIcon.asClassName(keybindingsRecordKeysIcon)));
    this.recordKeysAction.checked = false;
    this.sortByPrecedenceAction = this._register(new Action(KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, localize(18086, null), ThemeIcon.asClassName(keybindingsSortIcon)));
    this.sortByPrecedenceAction.checked = false;
    this.overflowWidgetsDomNode = $24(".keybindings-overflow-widgets-container.monaco-editor");
  }
  static {
    this.ID = "workbench.editor.keybindings";
  }
  create(parent) {
    super.create(parent);
    this._register(registerNavigableContainer({
      name: "keybindingsEditor",
      focusNotifiers: [this],
      focusNextWidget: () => {
        if (this.searchWidget.hasFocus()) {
          this.focusKeybindings();
        }
      },
      focusPreviousWidget: () => {
        if (!this.searchWidget.hasFocus()) {
          this.focusSearch();
        }
      }
    }));
  }
  createEditor(parent) {
    const keybindingsEditorElement = append(parent, $24("div", { class: "keybindings-editor" }));
    this.createAriaLabelElement(keybindingsEditorElement);
    this.createOverlayContainer(keybindingsEditorElement);
    this.createHeader(keybindingsEditorElement);
    this.createBody(keybindingsEditorElement);
  }
  setInput(input, options3, context2, token) {
    this.keybindingsEditorContextKey.set(true);
    return super.setInput(input, options3, context2, token).then(() => this.render(!!(options3 && options3.preserveFocus)));
  }
  clearInput() {
    super.clearInput();
    this.keybindingsEditorContextKey.reset();
    this.keybindingFocusContextKey.reset();
  }
  layout(dimension) {
    this.dimension = dimension;
    this.layoutSearchWidget(dimension);
    this.overlayContainer.style.width = dimension.width + "px";
    this.overlayContainer.style.height = dimension.height + "px";
    this.defineKeybindingWidget.layout(this.dimension);
    this.layoutKeybindingsTable();
    this._onLayout.fire();
  }
  focus() {
    super.focus();
    const activeKeybindingEntry = this.activeKeybindingEntry;
    if (activeKeybindingEntry) {
      this.selectEntry(activeKeybindingEntry);
    } else if (!isIOS) {
      this.searchWidget.focus();
    }
  }
  get activeKeybindingEntry() {
    const focusedElement = this.keybindingsTable.getFocusedElements()[0];
    return focusedElement && focusedElement.templateId === KEYBINDING_ENTRY_TEMPLATE_ID ? focusedElement : null;
  }
  async defineKeybinding(keybindingEntry, add) {
    this.selectEntry(keybindingEntry);
    this.showOverlayContainer();
    try {
      const key3 = await this.defineKeybindingWidget.define();
      if (key3) {
        await this.updateKeybinding(keybindingEntry, key3, keybindingEntry.keybindingItem.when, add);
      }
    } catch (error) {
      this.onKeybindingEditingError(error);
    } finally {
      this.hideOverlayContainer();
      this.selectEntry(keybindingEntry);
    }
  }
  defineWhenExpression(keybindingEntry) {
    if (keybindingEntry.keybindingItem.keybinding) {
      this.selectEntry(keybindingEntry);
      this._onDefineWhenExpression.fire(keybindingEntry);
    }
  }
  rejectWhenExpression(keybindingEntry) {
    this._onRejectWhenExpression.fire(keybindingEntry);
  }
  acceptWhenExpression(keybindingEntry) {
    this._onAcceptWhenExpression.fire(keybindingEntry);
  }
  async updateKeybinding(keybindingEntry, key3, when, add) {
    const currentKey = keybindingEntry.keybindingItem.keybinding ? keybindingEntry.keybindingItem.keybinding.getUserSettingsLabel() : "";
    if (currentKey !== key3 || keybindingEntry.keybindingItem.when !== when) {
      if (add) {
        await this.keybindingEditingService.addKeybinding(keybindingEntry.keybindingItem.keybindingItem, key3, when || void 0);
      } else {
        await this.keybindingEditingService.editKeybinding(keybindingEntry.keybindingItem.keybindingItem, key3, when || void 0);
      }
      if (!keybindingEntry.keybindingItem.keybinding) {
        this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
      }
    }
  }
  async removeKeybinding(keybindingEntry) {
    this.selectEntry(keybindingEntry);
    if (keybindingEntry.keybindingItem.keybinding) {
      try {
        await this.keybindingEditingService.removeKeybinding(keybindingEntry.keybindingItem.keybindingItem);
        this.focus();
      } catch (error) {
        this.onKeybindingEditingError(error);
        this.selectEntry(keybindingEntry);
      }
    }
  }
  async resetKeybinding(keybindingEntry) {
    this.selectEntry(keybindingEntry);
    try {
      await this.keybindingEditingService.resetKeybinding(keybindingEntry.keybindingItem.keybindingItem);
      if (!keybindingEntry.keybindingItem.keybinding) {
        this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
      }
      this.selectEntry(keybindingEntry);
    } catch (error) {
      this.onKeybindingEditingError(error);
      this.selectEntry(keybindingEntry);
    }
  }
  async copyKeybinding(keybinding) {
    this.selectEntry(keybinding);
    const userFriendlyKeybinding = {
      key: keybinding.keybindingItem.keybinding ? keybinding.keybindingItem.keybinding.getUserSettingsLabel() || "" : "",
      command: keybinding.keybindingItem.command
    };
    if (keybinding.keybindingItem.when) {
      userFriendlyKeybinding.when = keybinding.keybindingItem.when;
    }
    await this.clipboardService.writeText(JSON.stringify(userFriendlyKeybinding, null, "  "));
  }
  async copyKeybindingCommand(keybinding) {
    this.selectEntry(keybinding);
    await this.clipboardService.writeText(keybinding.keybindingItem.command);
  }
  async copyKeybindingCommandTitle(keybinding) {
    this.selectEntry(keybinding);
    await this.clipboardService.writeText(keybinding.keybindingItem.commandLabel);
  }
  focusSearch() {
    this.searchWidget.focus();
  }
  search(filter2) {
    this.focusSearch();
    this.searchWidget.setValue(filter2);
    this.selectEntry(0);
  }
  clearSearchResults() {
    this.searchWidget.clear();
    this.searchHasValueContextKey.set(false);
  }
  showSimilarKeybindings(keybindingEntry) {
    const value2 = `"${keybindingEntry.keybindingItem.keybinding.getAriaLabel()}"`;
    if (value2 !== this.searchWidget.getValue()) {
      this.searchWidget.setValue(value2);
    }
  }
  createAriaLabelElement(parent) {
    this.ariaLabelElement = append(parent, $(""));
    this.ariaLabelElement.setAttribute("id", "keybindings-editor-aria-label-element");
    this.ariaLabelElement.setAttribute("aria-live", "assertive");
    this.ariaLabelElement.style.position = "absolute";
    this.ariaLabelElement.style.width = "1px";
    this.ariaLabelElement.style.height = "1px";
    this.ariaLabelElement.style.overflow = "hidden";
    this.ariaLabelElement.style.clip = "rect(1px, 1px, 1px, 1px)";
    this.ariaLabelElement.style.clipPath = "inset(50%)";
    this.ariaLabelElement.style.whiteSpace = "nowrap";
  }
  createOverlayContainer(parent) {
    this.overlayContainer = append(parent, $24(".overlay-container"));
    this.overlayContainer.style.position = "absolute";
    this.overlayContainer.style.zIndex = "40";
    this.defineKeybindingWidget = this._register(this.instantiationService.createInstance(DefineKeybindingWidget, this.overlayContainer));
    this._register(this.defineKeybindingWidget.onDidChange((keybindingStr) => this.defineKeybindingWidget.printExisting(this.keybindingsEditorModel.fetch(`"${keybindingStr}"`).length)));
    this._register(this.defineKeybindingWidget.onShowExistingKeybidings((keybindingStr) => this.searchWidget.setValue(`"${keybindingStr}"`)));
    this.hideOverlayContainer();
  }
  showOverlayContainer() {
    this.overlayContainer.style.display = "block";
  }
  hideOverlayContainer() {
    this.overlayContainer.style.display = "none";
  }
  createHeader(parent) {
    this.headerContainer = append(parent, $24(".keybindings-header"));
    const fullTextSearchPlaceholder = localize(18081, null);
    const keybindingsSearchPlaceholder = localize(18082, null);
    const clearInputAction = this._register(new Action(KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, localize(18062, null), ThemeIcon.asClassName(preferencesClearInputIcon), false, async () => this.clearSearchResults()));
    const searchContainer = append(this.headerContainer, $24(".search-container"));
    this.searchWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, searchContainer, {
      ariaLabel: fullTextSearchPlaceholder,
      placeholder: fullTextSearchPlaceholder,
      focusKey: this.searchFocusContextKey,
      ariaLabelledBy: "keybindings-editor-aria-label-element",
      recordEnter: true,
      quoteRecordedKeys: true,
      history: new Set(this.getMemento(0 /* PROFILE */, 0 /* USER */).searchHistory ?? []),
      inputBoxStyles: getInputBoxStyle({
        inputBorder: settingsTextInputBorder
      })
    }));
    this._register(this.searchWidget.onDidChange((searchValue) => {
      const hasValue = !!searchValue;
      clearInputAction.enabled = hasValue;
      this.searchHasValueContextKey.set(hasValue);
      this.delayedFiltering.trigger(() => this.filterKeybindings());
      this.updateSearchOptions();
    }));
    this._register(this.searchWidget.onEscape(() => this.recordKeysAction.checked = false));
    this.actionsContainer = append(searchContainer, $(".keybindings-search-actions-container"));
    const recordingBadge = this.createRecordingBadge(this.actionsContainer);
    this._register(this.sortByPrecedenceAction.onDidChange((e) => {
      if (e.checked !== void 0) {
        this.renderKeybindingsEntries(false);
      }
      this.updateSearchOptions();
    }));
    this._register(this.recordKeysAction.onDidChange((e) => {
      if (e.checked !== void 0) {
        recordingBadge.classList.toggle("disabled", !e.checked);
        if (e.checked) {
          this.searchWidget.inputBox.setPlaceHolder(keybindingsSearchPlaceholder);
          this.searchWidget.inputBox.setAriaLabel(keybindingsSearchPlaceholder);
          this.searchWidget.startRecordingKeys();
          this.searchWidget.focus();
        } else {
          this.searchWidget.inputBox.setPlaceHolder(fullTextSearchPlaceholder);
          this.searchWidget.inputBox.setAriaLabel(fullTextSearchPlaceholder);
          this.searchWidget.stopRecordingKeys();
          this.searchWidget.focus();
        }
        this.updateSearchOptions();
      }
    }));
    const actions = [this.recordKeysAction, this.sortByPrecedenceAction, clearInputAction];
    const toolBar = this._register(new ToolBar(this.actionsContainer, this.contextMenuService, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === this.sortByPrecedenceAction.id || action.id === this.recordKeysAction.id) {
          return new ToggleActionViewItem(null, action, { ...options3, keybinding: this.keybindingsService.lookupKeybinding(action.id)?.getLabel(), toggleStyles: defaultToggleStyles });
        }
        return void 0;
      },
      getKeyBinding: (action) => this.keybindingsService.lookupKeybinding(action.id)
    }));
    toolBar.setActions(actions);
    this._register(this.keybindingsService.onDidUpdateKeybindings(() => toolBar.setActions(actions)));
  }
  updateSearchOptions() {
    const keybindingsEditorInput = this.input;
    if (keybindingsEditorInput) {
      keybindingsEditorInput.searchOptions = {
        searchValue: this.searchWidget.getValue(),
        recordKeybindings: !!this.recordKeysAction.checked,
        sortByPrecedence: !!this.sortByPrecedenceAction.checked
      };
    }
  }
  createRecordingBadge(container3) {
    const recordingBadge = append(container3, $(".recording-badge.monaco-count-badge.long.disabled"));
    recordingBadge.textContent = localize(18077, null);
    recordingBadge.style.backgroundColor = asCssVariable(badgeBackground);
    recordingBadge.style.color = asCssVariable(badgeForeground);
    recordingBadge.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    return recordingBadge;
  }
  layoutSearchWidget(dimension) {
    this.searchWidget.layout(dimension);
    this.headerContainer.classList.toggle("small", dimension.width < 400);
    this.searchWidget.inputBox.inputElement.style.paddingRight = `${getTotalWidth(this.actionsContainer) + 12}px`;
  }
  createBody(parent) {
    const bodyContainer = append(parent, $24(".keybindings-body"));
    this.createTable(bodyContainer);
  }
  createTable(parent) {
    this.keybindingsTableContainer = append(parent, $24(".keybindings-table-container"));
    this.keybindingsTable = this._register(this.instantiationService.createInstance(
      WorkbenchTable,
      "KeybindingsEditor",
      this.keybindingsTableContainer,
      new Delegate2(),
      [
        {
          label: "",
          tooltip: "",
          weight: 0,
          minimumWidth: 40,
          maximumWidth: 40,
          templateId: ActionsColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(18063, null),
          tooltip: "",
          weight: 0.3,
          templateId: CommandColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(18071, null),
          tooltip: "",
          weight: 0.2,
          templateId: KeybindingColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(18089, null),
          tooltip: "",
          weight: 0.35,
          templateId: WhenColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(18087, null),
          tooltip: "",
          weight: 0.15,
          templateId: SourceColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        }
      ],
      [
        this.instantiationService.createInstance(ActionsColumnRenderer, this),
        this.instantiationService.createInstance(CommandColumnRenderer),
        this.instantiationService.createInstance(KeybindingColumnRenderer),
        this.instantiationService.createInstance(WhenColumnRenderer, this),
        this.instantiationService.createInstance(SourceColumnRenderer)
      ],
      {
        identityProvider: { getId: (e) => e.id },
        horizontalScrolling: false,
        accessibilityProvider: new AccessibilityProvider2(this.configurationService),
        keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.keybindingItem.commandLabel || e.keybindingItem.command },
        overrideStyles: {
          listBackground: editorBackground
        },
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        openOnSingleClick: false,
        transformOptimization: false
        // disable transform optimization as it causes the editor overflow widgets to be mispositioned
      }
    ));
    this._register(this.keybindingsTable.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.keybindingsTable.onDidChangeFocus((e) => this.onFocusChange()));
    this._register(this.keybindingsTable.onDidFocus(() => {
      this.keybindingsTable.getHTMLElement().classList.add("focused");
      this.onFocusChange();
    }));
    this._register(this.keybindingsTable.onDidBlur(() => {
      this.keybindingsTable.getHTMLElement().classList.remove("focused");
      this.keybindingFocusContextKey.reset();
    }));
    this._register(this.keybindingsTable.onDidOpen((e) => {
      if (e.browserEvent?.defaultPrevented) {
        return;
      }
      const activeKeybindingEntry = this.activeKeybindingEntry;
      if (activeKeybindingEntry) {
        this.defineKeybinding(activeKeybindingEntry, false);
      }
    }));
    append(this.keybindingsTableContainer, this.overflowWidgetsDomNode);
  }
  async render(preserveFocus) {
    if (this.input) {
      const input = this.input;
      this.keybindingsEditorModel = await input.resolve();
      await this.keybindingsEditorModel.resolve(this.getActionsLabels());
      this.renderKeybindingsEntries(false, preserveFocus);
      if (input.searchOptions) {
        this.recordKeysAction.checked = input.searchOptions.recordKeybindings;
        this.sortByPrecedenceAction.checked = input.searchOptions.sortByPrecedence;
        this.searchWidget.setValue(input.searchOptions.searchValue);
      } else {
        this.updateSearchOptions();
      }
    }
  }
  getActionsLabels() {
    const actionsLabels = /* @__PURE__ */ new Map();
    for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
      actionsLabels.set(editorAction.id, editorAction.label);
    }
    for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
      if (isIMenuItem(menuItem)) {
        const title = typeof menuItem.command.title === "string" ? menuItem.command.title : menuItem.command.title.value;
        const category11 = menuItem.command.category ? typeof menuItem.command.category === "string" ? menuItem.command.category : menuItem.command.category.value : void 0;
        actionsLabels.set(menuItem.command.id, category11 ? `${category11}: ${title}` : title);
      }
    }
    return actionsLabels;
  }
  filterKeybindings() {
    this.renderKeybindingsEntries(this.searchWidget.hasFocus());
    this.searchHistoryDelayer.trigger(() => {
      this.searchWidget.inputBox.addToHistory();
      this.getMemento(0 /* PROFILE */, 0 /* USER */).searchHistory = this.searchWidget.inputBox.getHistory();
      this.saveState();
    });
  }
  clearKeyboardShortcutSearchHistory() {
    this.searchWidget.inputBox.clearHistory();
    this.getMemento(0 /* PROFILE */, 0 /* USER */).searchHistory = this.searchWidget.inputBox.getHistory();
    this.saveState();
  }
  renderKeybindingsEntries(reset2, preserveFocus) {
    if (this.keybindingsEditorModel) {
      const filter2 = this.searchWidget.getValue();
      const keybindingsEntries = this.keybindingsEditorModel.fetch(filter2, this.sortByPrecedenceAction.checked);
      const ariaLabel = this.getAriaLabel(keybindingsEntries);
      this.accessibilityService.alert(ariaLabel);
      this.ariaLabelElement.textContent = ariaLabel;
      if (keybindingsEntries.length === 0) {
        this.latestEmptyFilters.push(filter2);
      }
      const currentSelectedIndex = this.keybindingsTable.getSelection()[0];
      this.tableEntries = keybindingsEntries;
      this.keybindingsTable.splice(0, this.keybindingsTable.length, this.tableEntries);
      this.layoutKeybindingsTable();
      if (reset2) {
        this.keybindingsTable.setSelection([]);
        this.keybindingsTable.setFocus([]);
      } else {
        if (this.unAssignedKeybindingItemToRevealAndFocus) {
          const index2 = this.getNewIndexOfUnassignedKeybinding(this.unAssignedKeybindingItemToRevealAndFocus);
          if (index2 !== -1) {
            this.keybindingsTable.reveal(index2, 0.2);
            this.selectEntry(index2);
          }
          this.unAssignedKeybindingItemToRevealAndFocus = null;
        } else if (currentSelectedIndex !== -1 && currentSelectedIndex < this.tableEntries.length) {
          this.selectEntry(currentSelectedIndex, preserveFocus);
        } else if (this.editorService.activeEditorPane === this && !preserveFocus) {
          this.focus();
        }
      }
    }
  }
  getAriaLabel(keybindingsEntries) {
    let label3;
    if (this.sortByPrecedenceAction.checked) {
      label3 = localize(18084, null, keybindingsEntries.length);
    } else {
      label3 = localize(18083, null, keybindingsEntries.length);
    }
    if (this.configurationService.getValue("accessibility.verbosity.keybindingsEditor" /* KeybindingsEditor */)) {
      const kb = this.keybindingsService.lookupKeybinding("widgetNavigation.focusNext")?.getAriaLabel();
      if (kb) {
        label3 += ". " + localize(18074, null, kb);
      }
    }
    return label3;
  }
  layoutKeybindingsTable() {
    if (!this.dimension) {
      return;
    }
    const tableHeight = this.dimension.height - (getDomNodePagePosition(this.headerContainer).height + 12);
    this.keybindingsTableContainer.style.height = `${tableHeight}px`;
    this.keybindingsTable.layout(tableHeight);
  }
  getIndexOf(listEntry) {
    const index2 = this.tableEntries.indexOf(listEntry);
    if (index2 === -1) {
      for (let i2 = 0; i2 < this.tableEntries.length; i2++) {
        if (this.tableEntries[i2].id === listEntry.id) {
          return i2;
        }
      }
    }
    return index2;
  }
  getNewIndexOfUnassignedKeybinding(unassignedKeybinding) {
    for (let index2 = 0; index2 < this.tableEntries.length; index2++) {
      const entry = this.tableEntries[index2];
      if (entry.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
        const keybindingItemEntry = entry;
        if (keybindingItemEntry.keybindingItem.command === unassignedKeybinding.keybindingItem.command) {
          return index2;
        }
      }
    }
    return -1;
  }
  selectEntry(keybindingItemEntry, focus = true) {
    const index2 = typeof keybindingItemEntry === "number" ? keybindingItemEntry : this.getIndexOf(keybindingItemEntry);
    if (index2 !== -1 && index2 < this.keybindingsTable.length) {
      if (focus) {
        this.keybindingsTable.domFocus();
        this.keybindingsTable.setFocus([index2]);
      }
      this.keybindingsTable.setSelection([index2]);
    }
  }
  focusKeybindings() {
    this.keybindingsTable.domFocus();
    const currentFocusIndices = this.keybindingsTable.getFocus();
    this.keybindingsTable.setFocus([currentFocusIndices.length ? currentFocusIndices[0] : 0]);
  }
  selectKeybinding(keybindingItemEntry) {
    this.selectEntry(keybindingItemEntry);
  }
  recordSearchKeys() {
    this.recordKeysAction.checked = true;
  }
  toggleSortByPrecedence() {
    this.sortByPrecedenceAction.checked = !this.sortByPrecedenceAction.checked;
  }
  onContextMenu(e) {
    if (!e.element) {
      return;
    }
    if (e.element.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
      const keybindingItemEntry = e.element;
      this.selectEntry(keybindingItemEntry);
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => [
          this.createCopyAction(keybindingItemEntry),
          this.createCopyCommandAction(keybindingItemEntry),
          this.createCopyCommandTitleAction(keybindingItemEntry),
          new Separator(),
          ...keybindingItemEntry.keybindingItem.keybinding ? [this.createDefineKeybindingAction(keybindingItemEntry), this.createAddKeybindingAction(keybindingItemEntry)] : [this.createDefineKeybindingAction(keybindingItemEntry)],
          new Separator(),
          this.createRemoveAction(keybindingItemEntry),
          this.createResetAction(keybindingItemEntry),
          new Separator(),
          this.createDefineWhenExpressionAction(keybindingItemEntry),
          new Separator(),
          this.createShowConflictsAction(keybindingItemEntry)
        ]
      });
    }
  }
  onFocusChange() {
    this.keybindingFocusContextKey.reset();
    const element = this.keybindingsTable.getFocusedElements()[0];
    if (!element) {
      return;
    }
    if (element.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
      this.keybindingFocusContextKey.set(true);
    }
  }
  createDefineKeybindingAction(keybindingItemEntry) {
    return {
      label: keybindingItemEntry.keybindingItem.keybinding ? localize(18061, null) : localize(18060, null),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
      run: () => this.defineKeybinding(keybindingItemEntry, false)
    };
  }
  createAddKeybindingAction(keybindingItemEntry) {
    return {
      label: localize(18060, null),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_ADD,
      run: () => this.defineKeybinding(keybindingItemEntry, true)
    };
  }
  createDefineWhenExpressionAction(keybindingItemEntry) {
    return {
      label: localize(18068, null),
      enabled: !!keybindingItemEntry.keybindingItem.keybinding,
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
      run: () => this.defineWhenExpression(keybindingItemEntry)
    };
  }
  createRemoveAction(keybindingItem) {
    return {
      label: localize(18079, null),
      enabled: !!keybindingItem.keybindingItem.keybinding,
      id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
      run: () => this.removeKeybinding(keybindingItem)
    };
  }
  createResetAction(keybindingItem) {
    return {
      label: localize(18080, null),
      enabled: !keybindingItem.keybindingItem.keybindingItem.isDefault,
      id: KEYBINDINGS_EDITOR_COMMAND_RESET,
      run: () => this.resetKeybinding(keybindingItem)
    };
  }
  createShowConflictsAction(keybindingItem) {
    return {
      label: localize(18085, null),
      enabled: !!keybindingItem.keybindingItem.keybinding,
      id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
      run: () => this.showSimilarKeybindings(keybindingItem)
    };
  }
  createCopyAction(keybindingItem) {
    return {
      label: localize(18066, null),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_COPY,
      run: () => this.copyKeybinding(keybindingItem)
    };
  }
  createCopyCommandAction(keybinding) {
    return {
      label: localize(18064, null),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
      run: () => this.copyKeybindingCommand(keybinding)
    };
  }
  createCopyCommandTitleAction(keybinding) {
    return {
      label: localize(18065, null),
      enabled: !!keybinding.keybindingItem.commandLabel,
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
      run: () => this.copyKeybindingCommandTitle(keybinding)
    };
  }
  onKeybindingEditingError(error) {
    this.notificationService.error(typeof error === "string" ? error : localize(18069, null, `${error}`));
  }
};

KeybindingsEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingEditingService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IClipboardService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IAccessibilityService)
], KeybindingsEditor);

var Delegate2 = class {
  constructor() {
    this.headerRowHeight = 30;
  }
  getHeight(element) {
    if (element.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
      const commandIdMatched = element.keybindingItem.commandLabel && element.commandIdMatches;
      const commandDefaultLabelMatched = !!element.commandDefaultLabelMatches;
      const extensionIdMatched = !!element.extensionIdMatches;
      if (commandIdMatched && commandDefaultLabelMatched) {
        return 60;
      }
      if (extensionIdMatched || commandIdMatched || commandDefaultLabelMatched) {
        return 40;
      }
    }
    return 24;
  }
};

var ActionsColumnRenderer = class {
  constructor(keybindingsEditor, keybindingsService) {
    this.keybindingsEditor = keybindingsEditor;
    this.keybindingsService = keybindingsService;
    this.templateId = ActionsColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "actions";
  }
  renderTemplate(container3) {
    const element = append(container3, $24(".actions"));
    const actionBar3 = new ActionBar(element);
    return { actionBar: actionBar3 };
  }
  renderElement(keybindingItemEntry, index2, templateData) {
    templateData.actionBar.clear();
    const actions = [];
    if (keybindingItemEntry.keybindingItem.keybinding) {
      actions.push(this.createEditAction(keybindingItemEntry));
    } else {
      actions.push(this.createAddAction(keybindingItemEntry));
    }
    templateData.actionBar.push(actions, { icon: true });
  }
  createEditAction(keybindingItemEntry) {
    return {
      class: ThemeIcon.asClassName(keybindingsEditIcon),
      enabled: true,
      id: "editKeybinding",
      tooltip: this.keybindingsService.appendKeybinding(localize(18067, null), KEYBINDINGS_EDITOR_COMMAND_DEFINE),
      run: () => this.keybindingsEditor.defineKeybinding(keybindingItemEntry, false)
    };
  }
  createAddAction(keybindingItemEntry) {
    return {
      class: ThemeIcon.asClassName(keybindingsAddIcon),
      enabled: true,
      id: "addKeybinding",
      tooltip: this.keybindingsService.appendKeybinding(localize(18059, null), KEYBINDINGS_EDITOR_COMMAND_DEFINE),
      run: () => this.keybindingsEditor.defineKeybinding(keybindingItemEntry, false)
    };
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
  }
};

ActionsColumnRenderer = __decorateClass([
  __decorateParam(1, IKeybindingService)
], ActionsColumnRenderer);

var CommandColumnRenderer = class {
  constructor(_hoverService) {
    this._hoverService = _hoverService;
    this.templateId = CommandColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "commands";
  }
  renderTemplate(container3) {
    const commandColumn = append(container3, $24(".command"));
    const commandColumnHover = this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), commandColumn, "");
    const commandLabelContainer = append(commandColumn, $24(".command-label"));
    const commandLabel = new HighlightedLabel(commandLabelContainer);
    const commandDefaultLabelContainer = append(commandColumn, $24(".command-default-label"));
    const commandDefaultLabel = new HighlightedLabel(commandDefaultLabelContainer);
    const commandIdLabelContainer = append(commandColumn, $24(".command-id.code"));
    const commandIdLabel = new HighlightedLabel(commandIdLabelContainer);
    return { commandColumn, commandColumnHover, commandLabelContainer, commandLabel, commandDefaultLabelContainer, commandDefaultLabel, commandIdLabelContainer, commandIdLabel };
  }
  renderElement(keybindingItemEntry, index2, templateData) {
    const keybindingItem = keybindingItemEntry.keybindingItem;
    const commandIdMatched = !!(keybindingItem.commandLabel && keybindingItemEntry.commandIdMatches);
    const commandDefaultLabelMatched = !!keybindingItemEntry.commandDefaultLabelMatches;
    templateData.commandColumn.classList.toggle("vertical-align-column", commandIdMatched || commandDefaultLabelMatched);
    const title = keybindingItem.commandLabel ? localize(18088, null, keybindingItem.commandLabel, keybindingItem.command) : keybindingItem.command;
    templateData.commandColumn.setAttribute("aria-label", title);
    templateData.commandColumnHover.update(title);
    if (keybindingItem.commandLabel) {
      templateData.commandLabelContainer.classList.remove("hide");
      templateData.commandLabel.set(keybindingItem.commandLabel, keybindingItemEntry.commandLabelMatches);
    } else {
      templateData.commandLabelContainer.classList.add("hide");
      templateData.commandLabel.set(void 0);
    }
    if (keybindingItemEntry.commandDefaultLabelMatches) {
      templateData.commandDefaultLabelContainer.classList.remove("hide");
      templateData.commandDefaultLabel.set(keybindingItem.commandDefaultLabel, keybindingItemEntry.commandDefaultLabelMatches);
    } else {
      templateData.commandDefaultLabelContainer.classList.add("hide");
      templateData.commandDefaultLabel.set(void 0);
    }
    if (keybindingItemEntry.commandIdMatches || !keybindingItem.commandLabel) {
      templateData.commandIdLabelContainer.classList.remove("hide");
      templateData.commandIdLabel.set(keybindingItem.command, keybindingItemEntry.commandIdMatches);
    } else {
      templateData.commandIdLabelContainer.classList.add("hide");
      templateData.commandIdLabel.set(void 0);
    }
  }
  disposeTemplate(templateData) {
    templateData.commandColumnHover.dispose();
    templateData.commandDefaultLabel.dispose();
    templateData.commandIdLabel.dispose();
    templateData.commandLabel.dispose();
  }
};

CommandColumnRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], CommandColumnRenderer);

var KeybindingColumnRenderer = class _KeybindingColumnRenderer {
  constructor() {
    this.templateId = _KeybindingColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "keybindings";
  }
  renderTemplate(container3) {
    const element = append(container3, $24(".keybinding"));
    const keybindingLabel2 = new KeybindingLabel(append(element, $24("div.keybinding-label")), OS, defaultKeybindingLabelStyles);
    return { keybindingLabel: keybindingLabel2 };
  }
  renderElement(keybindingItemEntry, index2, templateData) {
    if (keybindingItemEntry.keybindingItem.keybinding) {
      templateData.keybindingLabel.set(keybindingItemEntry.keybindingItem.keybinding, keybindingItemEntry.keybindingMatches);
    } else {
      templateData.keybindingLabel.set(void 0, void 0);
    }
  }
  disposeTemplate(templateData) {
    templateData.keybindingLabel.dispose();
  }
};

function onClick(element, callback) {
  const disposables = new DisposableStore();
  disposables.add(addDisposableListener(element, EventType.CLICK, finalHandler(callback)));
  disposables.add(addDisposableListener(element, EventType.KEY_UP, (e) => {
    const keyboardEvent = new StandardKeyboardEvent(e);
    if (keyboardEvent.equals(10 /* Space */) || keyboardEvent.equals(3 /* Enter */)) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  }));
  return disposables;
}

var SourceColumnRenderer = class {
  constructor(extensionsWorkbenchService, hoverService) {
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hoverService = hoverService;
    this.templateId = SourceColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "source";
  }
  renderTemplate(container3) {
    const sourceColumn = append(container3, $24(".source"));
    const sourceColumnHover = this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), sourceColumn, "");
    const sourceLabel = new HighlightedLabel(append(sourceColumn, $24(".source-label")));
    const extensionContainer = append(sourceColumn, $24(".extension-container"));
    const extensionLabel = append(extensionContainer, $24("a.extension-label", { tabindex: 0 }));
    const extensionId = new HighlightedLabel(append(extensionContainer, $24(".extension-id-container.code")));
    return { sourceColumn, sourceColumnHover, sourceLabel, extensionLabel, extensionContainer, extensionId, disposables: new DisposableStore() };
  }
  renderElement(keybindingItemEntry, index2, templateData) {
    templateData.disposables.clear();
    if (isString(keybindingItemEntry.keybindingItem.source)) {
      templateData.extensionContainer.classList.add("hide");
      templateData.sourceLabel.element.classList.remove("hide");
      templateData.sourceColumnHover.update("");
      templateData.sourceLabel.set(keybindingItemEntry.keybindingItem.source || "-", keybindingItemEntry.sourceMatches);
    } else {
      templateData.extensionContainer.classList.remove("hide");
      templateData.sourceLabel.element.classList.add("hide");
      const extension = keybindingItemEntry.keybindingItem.source;
      const extensionLabel = extension.displayName ?? extension.identifier.value;
      templateData.sourceColumnHover.update(localize(18070, null, extensionLabel));
      templateData.extensionLabel.textContent = extensionLabel;
      templateData.disposables.add(onClick(templateData.extensionLabel, () => {
        this.extensionsWorkbenchService.open(extension.identifier.value);
      }));
      if (keybindingItemEntry.extensionIdMatches) {
        templateData.extensionId.element.classList.remove("hide");
        templateData.extensionId.set(extension.identifier.value, keybindingItemEntry.extensionIdMatches);
      } else {
        templateData.extensionId.element.classList.add("hide");
        templateData.extensionId.set(void 0);
      }
    }
  }
  disposeTemplate(templateData) {
    templateData.sourceColumnHover.dispose();
    templateData.disposables.dispose();
    templateData.sourceLabel.dispose();
    templateData.extensionId.dispose();
  }
};

SourceColumnRenderer = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IHoverService)
], SourceColumnRenderer);

var WhenInputWidget = class extends Disposable {
  constructor(parent, keybindingsEditor, instantiationService, contextKeyService) {
    super();
    this._onDidAccept = this._register(new Emitter());
    this.onDidAccept = this._onDidAccept.event;
    this._onDidReject = this._register(new Emitter());
    this.onDidReject = this._onDidReject.event;
    const focusContextKey = CONTEXT_WHEN_FOCUS.bindTo(contextKeyService);
    this.input = this._register(instantiationService.createInstance(SuggestEnabledInput, "keyboardshortcutseditor#wheninput", parent, {
      provideResults: () => {
        const result = [];
        for (const contextKey of RawContextKey.all()) {
          result.push({ label: contextKey.key, documentation: contextKey.description, detail: contextKey.type, kind: 14 /* Constant */ });
        }
        return result;
      },
      triggerCharacters: ["!", " "],
      wordDefinition: /[a-zA-Z.]+/,
      alwaysShowSuggestions: true
    }, "", `keyboardshortcutseditor#wheninput`, { focusContextKey, overflowWidgetsDomNode: keybindingsEditor.overflowWidgetsDomNode }));
    this._register(addDisposableListener(this.input.element, EventType.DBLCLICK, (e) => EventHelper.stop(e)));
    this._register(toDisposable(() => focusContextKey.reset()));
    this._register(keybindingsEditor.onAcceptWhenExpression(() => this._onDidAccept.fire(this.input.getValue())));
    this._register(Event2.any(keybindingsEditor.onRejectWhenExpression, this.input.onDidBlur)(() => this._onDidReject.fire()));
  }
  layout(dimension) {
    this.input.layout(dimension);
  }
  show(value2) {
    this.input.setValue(value2);
    this.input.focus(true);
  }
};

WhenInputWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService)
], WhenInputWidget);

var WhenColumnRenderer = class {
  constructor(keybindingsEditor, hoverService, instantiationService) {
    this.keybindingsEditor = keybindingsEditor;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.templateId = WhenColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "when";
  }
  renderTemplate(container3) {
    const element = append(container3, $24(".when"));
    const whenLabelContainer = append(element, $24("div.when-label"));
    const whenLabel = new HighlightedLabel(whenLabelContainer);
    const whenInputContainer = append(element, $24("div.when-input-container"));
    return {
      element,
      whenLabelContainer,
      whenLabel,
      whenInputContainer,
      disposables: new DisposableStore()
    };
  }
  renderElement(keybindingItemEntry, index2, templateData) {
    templateData.disposables.clear();
    const whenInputDisposables = templateData.disposables.add(new DisposableStore());
    templateData.disposables.add(this.keybindingsEditor.onDefineWhenExpression((e) => {
      if (keybindingItemEntry === e) {
        templateData.element.classList.add("input-mode");
        const inputWidget = whenInputDisposables.add(this.instantiationService.createInstance(WhenInputWidget, templateData.whenInputContainer, this.keybindingsEditor));
        inputWidget.layout(new Dimension(templateData.element.parentElement.clientWidth, 18));
        inputWidget.show(keybindingItemEntry.keybindingItem.when || "");
        const hideInputWidget = () => {
          whenInputDisposables.clear();
          templateData.element.classList.remove("input-mode");
          templateData.element.parentElement.style.paddingLeft = "10px";
          clearNode(templateData.whenInputContainer);
        };
        whenInputDisposables.add(inputWidget.onDidAccept((value2) => {
          hideInputWidget();
          this.keybindingsEditor.updateKeybinding(keybindingItemEntry, keybindingItemEntry.keybindingItem.keybinding ? keybindingItemEntry.keybindingItem.keybinding.getUserSettingsLabel() || "" : "", value2);
          this.keybindingsEditor.selectKeybinding(keybindingItemEntry);
        }));
        whenInputDisposables.add(inputWidget.onDidReject(() => {
          hideInputWidget();
          this.keybindingsEditor.selectKeybinding(keybindingItemEntry);
        }));
        templateData.element.parentElement.style.paddingLeft = "0px";
      }
    }));
    templateData.whenLabelContainer.classList.toggle("code", !!keybindingItemEntry.keybindingItem.when);
    templateData.whenLabelContainer.classList.toggle("empty", !keybindingItemEntry.keybindingItem.when);
    if (keybindingItemEntry.keybindingItem.when) {
      templateData.whenLabel.set(keybindingItemEntry.keybindingItem.when, keybindingItemEntry.whenMatches, keybindingItemEntry.keybindingItem.when);
      templateData.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), templateData.element, keybindingItemEntry.keybindingItem.when));
    } else {
      templateData.whenLabel.set("-");
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.whenLabel.dispose();
  }
};

WhenColumnRenderer = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IInstantiationService)
], WhenColumnRenderer);

var AccessibilityProvider2 = class {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  getWidgetAriaLabel() {
    return localize(18072, null);
  }
  getAriaLabel({ keybindingItem }) {
    const ariaLabel = [
      keybindingItem.commandLabel ? keybindingItem.commandLabel : keybindingItem.command,
      keybindingItem.keybinding?.getAriaLabel() || localize(18075, null),
      keybindingItem.when ? keybindingItem.when : localize(18076, null),
      isString(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.description ?? keybindingItem.source.identifier.value
    ];
    if (this.configurationService.getValue("accessibility.verbosity.keybindingsEditor" /* KeybindingsEditor */)) {
      const kbEditorAriaLabel = localize(18073, null);
      ariaLabel.push(kbEditorAriaLabel);
    }
    return ariaLabel.join(", ");
  }
};

registerColor("keybindingTable.headerBackground", tableOddRowsBackgroundColor, "Background color for the keyboard shortcuts table header.");

registerColor("keybindingTable.rowsBackground", tableOddRowsBackgroundColor, "Background color for the keyboard shortcuts table alternating rows.");

registerThemingParticipant((theme, collector) => {
  const foregroundColor = theme.getColor(foreground);
  if (foregroundColor) {
    const whenForegroundColor = foregroundColor.transparent(0.8).makeOpaque(WORKBENCH_BACKGROUND(theme));
    collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
  }
  const listActiveSelectionForegroundColor = theme.getColor(listActiveSelectionForeground);
  const listActiveSelectionBackgroundColor = theme.getColor(listActiveSelectionBackground);
  if (listActiveSelectionForegroundColor && listActiveSelectionBackgroundColor) {
    const whenForegroundColor = listActiveSelectionForegroundColor.transparent(0.8).makeOpaque(listActiveSelectionBackgroundColor);
    collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
  }
  const listInactiveSelectionForegroundColor = theme.getColor(listInactiveSelectionForeground);
  const listInactiveSelectionBackgroundColor = theme.getColor(listInactiveSelectionBackground);
  if (listInactiveSelectionForegroundColor && listInactiveSelectionBackgroundColor) {
    const whenForegroundColor = listInactiveSelectionForegroundColor.transparent(0.8).makeOpaque(listInactiveSelectionBackgroundColor);
    collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
  }
  const listFocusForegroundColor = theme.getColor(listFocusForeground);
  const listFocusBackgroundColor = theme.getColor(listFocusBackground);
  if (listFocusForegroundColor && listFocusBackgroundColor) {
    const whenForegroundColor = listFocusForegroundColor.transparent(0.8).makeOpaque(listFocusBackgroundColor);
    collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.focused .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
  }
  const listHoverForegroundColor = theme.getColor(listHoverForeground);
  const listHoverBackgroundColor = theme.getColor(listHoverBackground);
  if (listHoverForegroundColor && listHoverBackgroundColor) {
    const whenForegroundColor = listHoverForegroundColor.transparent(0.8).makeOpaque(listHoverBackgroundColor);
    collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row:hover:not(.focused):not(.selected) .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
  }
});
export { onClick, $24, KeybindingsEditor, Delegate2, ActionsColumnRenderer, CommandColumnRenderer, KeybindingColumnRenderer, SourceColumnRenderer, WhenInputWidget, WhenColumnRenderer, AccessibilityProvider2 };
