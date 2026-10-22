// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibleView.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { accessibilityHelpIsShown, accessibleViewContainsCodeBlocks, accessibleViewCurrentProviderId, accessibleViewGoToSymbolSupported, accessibleViewHasAssignedKeybindings, accessibleViewHasUnassignedKeybindings, accessibleViewInCodeBlock, accessibleViewIsShown, accessibleViewOnLastLine, accessibleViewSupportsNavigation, accessibleViewVerbosityEnabled } from "./module-1369.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { FloatingEditorClickMenu } from "./module-1821.mjs";
import { FloatingEditorToolbar } from "./module-0865.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { getSimpleEditorOptions } from "./module-1813.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { AccessibleContentProvider, ExtensionContentProvider, isIAccessibleViewContentProvider } from "./module-0799.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { Position } from "./module-0079.mjs";
import { EventType, addDisposableListener, getActiveWindow, getWindow, isActiveElement } from "./module-0075.mjs";
import { ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX, IAccessibilityService } from "./module-0104.mjs";
import { marked } from "./module-0464.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { alert } from "./module-0076.mjs";
import { Schemas } from "./module-0033.mjs";
import { resolveContentAndKeybindingItems } from "./module-3395.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { AccessibilityHelpNLS } from "./module-0867.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatActionBarActions } from "./module-0516.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IModelService } from "./module-0080.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatCodeBlockContextProviderService } from "./module-0982.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibleView.ts
var AccessibleView = class extends Disposable {
  constructor(_openerService, _instantiationService, _configurationService, _modelService, _contextViewService, _contextKeyService, _accessibilityService, _keybindingService, _layoutService, _menuService, _commandService, _codeBlockContextProviderService, _storageService, _quickInputService, _accessibilitySignalService) {
    super();
    this._openerService = _openerService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._modelService = _modelService;
    this._contextViewService = _contextViewService;
    this._contextKeyService = _contextKeyService;
    this._accessibilityService = _accessibilityService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this._menuService = _menuService;
    this._commandService = _commandService;
    this._codeBlockContextProviderService = _codeBlockContextProviderService;
    this._storageService = _storageService;
    this._quickInputService = _quickInputService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._isInQuickPick = false;
    this._lastProviderPosition = /* @__PURE__ */ new Map();
    this._accessiblityHelpIsShown = accessibilityHelpIsShown.bindTo(this._contextKeyService);
    this._accessibleViewIsShown = accessibleViewIsShown.bindTo(this._contextKeyService);
    this._accessibleViewSupportsNavigation = accessibleViewSupportsNavigation.bindTo(this._contextKeyService);
    this._accessibleViewVerbosityEnabled = accessibleViewVerbosityEnabled.bindTo(this._contextKeyService);
    this._accessibleViewGoToSymbolSupported = accessibleViewGoToSymbolSupported.bindTo(this._contextKeyService);
    this._accessibleViewCurrentProviderId = accessibleViewCurrentProviderId.bindTo(this._contextKeyService);
    this._accessibleViewInCodeBlock = accessibleViewInCodeBlock.bindTo(this._contextKeyService);
    this._accessibleViewContainsCodeBlocks = accessibleViewContainsCodeBlocks.bindTo(this._contextKeyService);
    this._onLastLine = accessibleViewOnLastLine.bindTo(this._contextKeyService);
    this._hasUnassignedKeybindings = accessibleViewHasUnassignedKeybindings.bindTo(this._contextKeyService);
    this._hasAssignedKeybindings = accessibleViewHasAssignedKeybindings.bindTo(this._contextKeyService);
    this._container = document.createElement("div");
    this._container.classList.add("accessible-view");
    if (this._configurationService.getValue("accessibility.hideAccessibleView" /* HideAccessibleView */)) {
      this._container.classList.add("hide");
    }
    const codeEditorWidgetOptions = {
      contributions: EditorExtensionsRegistry.getEditorContributions().filter((c) => c.id !== CodeActionController.ID && c.id !== FloatingEditorClickMenu.ID && c.id !== FloatingEditorToolbar.ID)
    };
    const titleBar = document.createElement("div");
    titleBar.classList.add("accessible-view-title-bar");
    this._title = document.createElement("div");
    this._title.classList.add("accessible-view-title");
    titleBar.appendChild(this._title);
    const actionBar3 = document.createElement("div");
    actionBar3.classList.add("accessible-view-action-bar");
    titleBar.appendChild(actionBar3);
    this._container.appendChild(titleBar);
    this._toolbar = this._register(_instantiationService.createInstance(WorkbenchToolBar, actionBar3, { orientation: 0 /* HORIZONTAL */ }));
    this._toolbar.context = { viewId: "accessibleView" };
    const toolbarElt = this._toolbar.getElement();
    toolbarElt.tabIndex = 0;
    const editorOptions = {
      ...getSimpleEditorOptions(this._configurationService),
      lineDecorationsWidth: 6,
      dragAndDrop: false,
      cursorWidth: 1,
      wordWrap: "off",
      wrappingStrategy: "advanced",
      wrappingIndent: "none",
      padding: { top: 2, bottom: 2 },
      quickSuggestions: false,
      renderWhitespace: "none",
      dropIntoEditor: { enabled: false },
      readOnly: true,
      fontFamily: "var(--monaco-monospace-font)"
    };
    this._editorWidget = this._register(this._instantiationService.createInstance(CodeEditorWidget, this._container, editorOptions, codeEditorWidgetOptions));
    this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
      if (this._currentProvider && this._accessiblityHelpIsShown.get()) {
        this.show(this._currentProvider);
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (isIAccessibleViewContentProvider(this._currentProvider) && e4.affectsConfiguration(this._currentProvider.verbositySettingKey)) {
        if (this._accessiblityHelpIsShown.get()) {
          this.show(this._currentProvider);
        }
        this._accessibleViewVerbosityEnabled.set(this._configurationService.getValue(this._currentProvider.verbositySettingKey));
        this._updateToolbar(this._currentProvider.actions, this._currentProvider.options.type);
      }
      if (e4.affectsConfiguration("accessibility.hideAccessibleView" /* HideAccessibleView */)) {
        this._container.classList.toggle("hide", this._configurationService.getValue("accessibility.hideAccessibleView" /* HideAccessibleView */));
      }
    }));
    this._register(this._editorWidget.onDidDispose(() => this._resetContextKeys()));
    this._register(this._editorWidget.onDidChangeCursorPosition(() => {
      this._onLastLine.set(this._editorWidget.getPosition()?.lineNumber === this._editorWidget.getModel()?.getLineCount());
      const cursorPosition = this._editorWidget.getPosition()?.lineNumber;
      if (this._codeBlocks && cursorPosition !== void 0) {
        const inCodeBlock = this._codeBlocks.find((c) => c.startLine <= cursorPosition && c.endLine >= cursorPosition) !== void 0;
        this._accessibleViewInCodeBlock.set(inCodeBlock);
      }
      this._playDiffSignals();
    }));
  }
  get editorWidget() {
    return this._editorWidget;
  }
  _playDiffSignals() {
    if (this._currentProvider?.id !== "diffEditor" /* DiffEditor */ && this._currentProvider?.id !== "inlineCompletions" /* InlineCompletions */) {
      return;
    }
    const position2 = this._editorWidget.getPosition();
    const model = this._editorWidget.getModel();
    if (!position2 || !model) {
      return void 0;
    }
    const lineContent = model.getLineContent(position2.lineNumber);
    if (lineContent?.startsWith("+")) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineInserted);
    } else if (lineContent?.startsWith("-")) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineDeleted);
    }
  }
  _resetContextKeys() {
    this._accessiblityHelpIsShown.reset();
    this._accessibleViewIsShown.reset();
    this._accessibleViewSupportsNavigation.reset();
    this._accessibleViewVerbosityEnabled.reset();
    this._accessibleViewGoToSymbolSupported.reset();
    this._accessibleViewCurrentProviderId.reset();
    this._hasAssignedKeybindings.reset();
    this._hasUnassignedKeybindings.reset();
  }
  getPosition(id2) {
    if (!id2 || !this._lastProvider || this._lastProvider.id !== id2) {
      return void 0;
    }
    return this._editorWidget.getPosition() || void 0;
  }
  setPosition(position2, reveal, select) {
    this._editorWidget.setPosition(position2);
    if (reveal) {
      this._editorWidget.revealPosition(position2);
    }
    if (select) {
      const lineLength = this._editorWidget.getModel()?.getLineLength(position2.lineNumber) ?? 0;
      if (lineLength) {
        this._editorWidget.setSelection({ startLineNumber: position2.lineNumber, startColumn: 1, endLineNumber: position2.lineNumber, endColumn: lineLength + 1 });
      }
    }
  }
  getCodeBlockContext() {
    const position2 = this._editorWidget.getPosition();
    if (!this._codeBlocks?.length || !position2) {
      return;
    }
    const codeBlockIndex = this._codeBlocks?.findIndex((c) => c.startLine <= position2?.lineNumber && c.endLine >= position2?.lineNumber);
    const codeBlock = codeBlockIndex !== void 0 && codeBlockIndex > -1 ? this._codeBlocks[codeBlockIndex] : void 0;
    if (!codeBlock || codeBlockIndex === void 0) {
      return;
    }
    return { code: codeBlock.code, languageId: codeBlock.languageId, codeBlockIndex, element: void 0, chatSessionResource: codeBlock.chatSessionResource };
  }
  navigateToCodeBlock(type) {
    const position2 = this._editorWidget.getPosition();
    if (!this._codeBlocks?.length || !position2) {
      return;
    }
    let codeBlock;
    const codeBlocks = this._codeBlocks.slice();
    if (type === "previous") {
      codeBlock = codeBlocks.reverse().find((c) => c.endLine < position2.lineNumber);
    } else {
      codeBlock = codeBlocks.find((c) => c.startLine > position2.lineNumber);
    }
    if (!codeBlock) {
      return;
    }
    this.setPosition(new Position(codeBlock.startLine, 1), true);
  }
  showLastProvider(id2) {
    if (!this._lastProvider || this._lastProvider.options.id !== id2) {
      return;
    }
    this.show(this._lastProvider);
  }
  getAccessibilityStatus() {
    return {
      providerId: this._currentProvider?.id,
      isInCodeBlock: this._accessibleViewInCodeBlock.get() ?? false,
      onLastLine: this._onLastLine.get() ?? false
    };
  }
  show(provider, symbol, showAccessibleViewHelp, position2) {
    provider = provider ?? this._currentProvider;
    if (!provider) {
      return;
    }
    provider.onOpen?.();
    const delegate = {
      getAnchor: () => {
        return { x: getActiveWindow().innerWidth / 2 - Math.min(this._layoutService.activeContainerDimension.width * 0.75 /* WIDTH_RATIO */, 900 /* MAX_WIDTH */) / 2, y: this._layoutService.activeContainerOffset.quickPickTop };
      },
      render: (container2) => {
        this._viewContainer = container2;
        this._viewContainer.classList.add("accessible-view-container");
        return this._render(provider, container2, showAccessibleViewHelp);
      },
      onHide: () => {
        if (!showAccessibleViewHelp) {
          this._updateLastProvider();
          if (this._currentProvider) {
            const currentPosition = this._editorWidget.getPosition();
            if (currentPosition) {
              this._lastProviderPosition.set(this._currentProvider.id, currentPosition);
            }
          }
          this._currentProvider?.dispose();
          this._currentProvider = void 0;
          this._resetContextKeys();
        }
      }
    };
    this._contextViewService.showContextView(delegate);
    if (position2) {
      queueMicrotask(() => {
        this._editorWidget.revealLine(position2.lineNumber);
        this._editorWidget.setSelection({ startLineNumber: position2.lineNumber, startColumn: position2.column, endLineNumber: position2.lineNumber, endColumn: position2.column });
      });
    }
    if (symbol && this._currentProvider) {
      this.showSymbol(this._currentProvider, symbol);
    }
    if (provider instanceof AccessibleContentProvider && provider.onDidRequestClearLastProvider) {
      this._register(provider.onDidRequestClearLastProvider((id2) => {
        if (this._lastProvider?.options.id === id2) {
          this._lastProvider = void 0;
        }
        this._lastProviderPosition.delete(id2);
      }));
    }
    if (provider.options.id) {
      this._lastProvider = provider;
    }
    if (provider.id === "panelChat" /* PanelChat */ || provider.id === "quickChat" /* QuickChat */) {
      this._register(this._codeBlockContextProviderService.registerProvider({ getCodeBlockContext: () => this.getCodeBlockContext() }, "accessibleView"));
    }
    if (provider instanceof ExtensionContentProvider) {
      this._storageService.store(`${ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX}${provider.id}`, true, -1 /* APPLICATION */, 0 /* USER */);
    }
    if (provider.onDidChangeContent) {
      this._register(provider.onDidChangeContent(() => {
        if (this._viewContainer) {
          this._render(provider, this._viewContainer, showAccessibleViewHelp);
        }
      }));
    }
  }
  previous() {
    const newContent = this._currentProvider?.providePreviousContent?.();
    if (!this._currentProvider || !this._viewContainer || !newContent) {
      return;
    }
    this._render(this._currentProvider, this._viewContainer, void 0, newContent);
  }
  next() {
    const newContent = this._currentProvider?.provideNextContent?.();
    if (!this._currentProvider || !this._viewContainer || !newContent) {
      return;
    }
    this._render(this._currentProvider, this._viewContainer, void 0, newContent);
  }
  _verbosityEnabled() {
    if (!this._currentProvider) {
      return false;
    }
    return isIAccessibleViewContentProvider(this._currentProvider) ? this._configurationService.getValue(this._currentProvider.verbositySettingKey) === true : this._storageService.getBoolean(`${ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX}${this._currentProvider.id}`, -1 /* APPLICATION */, false);
  }
  goToSymbol() {
    if (!this._currentProvider) {
      return;
    }
    this._isInQuickPick = true;
    this._instantiationService.createInstance(AccessibleViewSymbolQuickPick, this).show(this._currentProvider);
  }
  calculateCodeBlocks(markdown) {
    if (!markdown) {
      return;
    }
    if (this._currentProvider?.id !== "panelChat" /* PanelChat */ && this._currentProvider?.id !== "quickChat" /* QuickChat */) {
      return;
    }
    if (this._currentProvider.options.language && this._currentProvider.options.language !== "markdown") {
      return;
    }
    const lines = markdown.split("\n");
    this._codeBlocks = [];
    let inBlock = false;
    let startLine = 0;
    let languageId;
    lines.forEach((line, i2) => {
      if (!inBlock && line.startsWith("```")) {
        inBlock = true;
        startLine = i2 + 1;
        languageId = line.substring(3).trim();
      } else if (inBlock && line.endsWith("```")) {
        inBlock = false;
        const endLine = i2;
        const code = lines.slice(startLine, endLine).join("\n");
        this._codeBlocks?.push({ startLine, endLine, code, languageId, chatSessionResource: void 0 });
      }
    });
    this._accessibleViewContainsCodeBlocks.set(this._codeBlocks.length > 0);
  }
  getSymbols() {
    const provider = this._currentProvider ? this._currentProvider : void 0;
    if (!this._currentContent || !provider) {
      return;
    }
    const symbols = "getSymbols" in provider ? provider.getSymbols?.() || [] : [];
    if (symbols?.length) {
      return symbols;
    }
    if (provider.options.language && provider.options.language !== "markdown") {
      return;
    }
    const markdownTokens = marked.lexer(this._currentContent);
    if (!markdownTokens) {
      return;
    }
    this._convertTokensToSymbols(markdownTokens, symbols);
    return symbols.length ? symbols : void 0;
  }
  openHelpLink() {
    if (!this._currentProvider?.options.readMoreUrl) {
      return;
    }
    this._openerService.open(URI.parse(this._currentProvider.options.readMoreUrl));
  }
  configureKeybindings(unassigned) {
    this._isInQuickPick = true;
    const provider = this._updateLastProvider();
    const items = unassigned ? provider?.options?.configureKeybindingItems : provider?.options?.configuredKeybindingItems;
    if (!items) {
      return;
    }
    const disposables = this._register(new DisposableStore());
    const quickPick = disposables.add(this._quickInputService.createQuickPick());
    quickPick.items = items;
    quickPick.title = localize(7780, null);
    quickPick.placeholder = localize(7783, null);
    quickPick.show();
    disposables.add(quickPick.onDidAccept(async () => {
      const item = quickPick.selectedItems[0];
      if (item) {
        await this._commandService.executeCommand("workbench.action.openGlobalKeybindings", item.id);
      }
      quickPick.dispose();
    }));
    disposables.add(quickPick.onDidHide(() => {
      if (!quickPick.selectedItems.length && provider) {
        this.show(provider);
      }
      disposables.dispose();
      this._isInQuickPick = false;
    }));
  }
  _convertTokensToSymbols(tokens, symbols) {
    let firstListItem;
    for (const token of tokens) {
      let label3 = void 0;
      if ("type" in token) {
        switch (token.type) {
          case "heading":
          case "paragraph":
          case "code":
            label3 = token.text;
            break;
          case "list": {
            const firstItem = token.items[0];
            if (!firstItem) {
              break;
            }
            firstListItem = `- ${firstItem.text}`;
            label3 = token.items.map((i2) => i2.text).join(", ");
            break;
          }
        }
      }
      if (label3) {
        symbols.push({ markdownToParse: label3, label: localize(7784, null, token.type, label3), ariaLabel: localize(7785, null, token.type, label3), firstListItem });
        firstListItem = void 0;
      }
    }
  }
  showSymbol(provider, symbol) {
    if (!this._currentContent) {
      return;
    }
    let lineNumber = symbol.lineNumber;
    const markdownToParse = symbol.markdownToParse;
    if (lineNumber === void 0 && markdownToParse === void 0) {
      return;
    }
    if (lineNumber === void 0 && markdownToParse) {
      const index2 = this._currentContent.split("\n").findIndex((line) => line.includes(markdownToParse.split("\n")[0]) || symbol.firstListItem && line.includes(symbol.firstListItem)) ?? -1;
      if (index2 >= 0) {
        lineNumber = index2 + 1;
      }
    }
    if (lineNumber === void 0) {
      return;
    }
    this._isInQuickPick = false;
    this.show(provider, void 0, void 0, { lineNumber, column: 1 });
    this._updateContextKeys(provider, true);
  }
  disableHint() {
    if (!isIAccessibleViewContentProvider(this._currentProvider)) {
      return;
    }
    this._configurationService.updateValue(this._currentProvider?.verbositySettingKey, false);
    alert(localize(7774, null, this._currentProvider.verbositySettingKey));
  }
  _updateContextKeys(provider, shown) {
    if (provider.options.type === "help" /* Help */) {
      this._accessiblityHelpIsShown.set(shown);
      this._accessibleViewIsShown.reset();
    } else {
      this._accessibleViewIsShown.set(shown);
      this._accessiblityHelpIsShown.reset();
    }
    this._accessibleViewSupportsNavigation.set(provider.provideNextContent !== void 0 || provider.providePreviousContent !== void 0);
    this._accessibleViewVerbosityEnabled.set(this._verbosityEnabled());
    this._accessibleViewGoToSymbolSupported.set(this._goToSymbolsSupported() ? this.getSymbols()?.length > 0 : false);
  }
  _getStableUri(providerId) {
    return URI.from({ path: `accessible-view-${providerId}`, scheme: Schemas.accessibleView });
  }
  _updateContent(provider, updatedContent) {
    let content = updatedContent ?? provider.provideContent();
    if (provider.options.type === "view" /* View */) {
      this._currentContent = content;
      this._hasUnassignedKeybindings.reset();
      this._hasAssignedKeybindings.reset();
      return;
    }
    const readMoreLinkHint = this._readMoreHint(provider);
    const disableHelpHint = this._disableVerbosityHint(provider);
    const screenReaderModeHint = this._screenReaderModeHint(provider);
    const exitThisDialogHint = this._exitDialogHint(provider);
    let configureKbHint = "";
    let configureAssignedKbHint = "";
    const resolvedContent = resolveContentAndKeybindingItems(this._keybindingService, screenReaderModeHint + content + readMoreLinkHint + disableHelpHint + exitThisDialogHint);
    if (resolvedContent) {
      content = resolvedContent.content.value;
      if (resolvedContent.configureKeybindingItems) {
        provider.options.configureKeybindingItems = resolvedContent.configureKeybindingItems;
        this._hasUnassignedKeybindings.set(true);
        configureKbHint = this._configureUnassignedKbHint();
      } else {
        this._hasAssignedKeybindings.reset();
      }
      if (resolvedContent.configuredKeybindingItems) {
        provider.options.configuredKeybindingItems = resolvedContent.configuredKeybindingItems;
        this._hasAssignedKeybindings.set(true);
        configureAssignedKbHint = this._configureAssignedKbHint();
      } else {
        this._hasAssignedKeybindings.reset();
      }
    }
    this._currentContent = content + configureKbHint + configureAssignedKbHint;
  }
  _render(provider, container2, showAccessibleViewHelp, updatedContent) {
    const isSameProvider = this._currentProvider?.id === provider.id;
    const previousPosition = isSameProvider ? this._editorWidget.getPosition() : void 0;
    const previousScrollTop = isSameProvider ? this._editorWidget.getScrollTop() : void 0;
    this._currentProvider = provider;
    this._accessibleViewCurrentProviderId.set(provider.id);
    const verbose = this._verbosityEnabled();
    this._updateContent(provider, updatedContent);
    this.calculateCodeBlocks(this._currentContent);
    this._updateContextKeys(provider, true);
    const widgetIsFocused = this._editorWidget.hasTextFocus() || this._editorWidget.hasWidgetFocus();
    const stableUri = this._getStableUri(provider.id);
    this._getTextModel(stableUri).then((model) => {
      if (!model) {
        return;
      }
      const currentContent = this._currentContent ?? "";
      if (model.getValue() !== currentContent) {
        model.setValue(currentContent);
      }
      if (this._editorWidget.getModel() !== model) {
        this._editorWidget.setModel(model);
      }
      const domNode = this._editorWidget.getDomNode();
      if (!domNode) {
        return;
      }
      model.setLanguage(provider.options.language ?? "markdown");
      container2.appendChild(this._container);
      let actionsHint = "";
      const hasActions = this._accessibleViewSupportsNavigation.get() || this._accessibleViewVerbosityEnabled.get() || this._accessibleViewGoToSymbolSupported.get() || provider.actions?.length;
      if (verbose && !showAccessibleViewHelp && hasActions) {
        actionsHint = provider.options.position ? localize(7771, null) : localize(7770, null);
      }
      let ariaLabel = provider.options.type === "help" /* Help */ ? localize(7758, null) : localize(7760, null);
      this._title.textContent = ariaLabel;
      if (actionsHint && provider.options.type === "view" /* View */) {
        ariaLabel = localize(7761, null, actionsHint);
      } else if (actionsHint) {
        ariaLabel = localize(7759, null, actionsHint);
      }
      if (isWindows && widgetIsFocused) {
        ariaLabel = "";
      }
      this._editorWidget.updateOptions({ ariaLabel });
      this._editorWidget.focus();
      if (this._currentProvider?.options.position) {
        const position2 = this._editorWidget.getPosition();
        const isDefaultPosition = position2?.lineNumber === 1 && position2.column === 1;
        const lineCount = this.editorWidget.getModel()?.getLineCount();
        const savedPosition = this._lastProviderPosition.get(provider.id);
        const preservedPosition = this._currentProvider.options.position === "initial-bottom-preserve" ? previousPosition ?? savedPosition : this._currentProvider.options.position === "initial-bottom" && !isSameProvider ? savedPosition : void 0;
        if (preservedPosition && preservedPosition.lineNumber <= (lineCount ?? 0)) {
          this._editorWidget.setPosition(preservedPosition);
          if (this._currentProvider.options.position === "initial-bottom-preserve" && previousScrollTop !== void 0) {
            this._editorWidget.setScrollTop(previousScrollTop);
          } else {
            this._editorWidget.revealLine(preservedPosition.lineNumber);
          }
        } else if (this._currentProvider.options.position === "bottom" || this._currentProvider.options.position === "initial-bottom-preserve" || this._currentProvider.options.position === "initial-bottom" && isDefaultPosition) {
          const lastLine = lineCount;
          const position3 = lastLine !== void 0 && lastLine > 0 ? new Position(lastLine, 1) : void 0;
          if (position3) {
            this._editorWidget.setPosition(position3);
            this._editorWidget.revealLine(position3.lineNumber);
          }
        }
      } else if (previousPosition) {
        this._editorWidget.setPosition(previousPosition);
      } else {
        const savedPosition = this._lastProviderPosition.get(provider.id);
        if (savedPosition) {
          const lineCount = this._editorWidget.getModel()?.getLineCount() ?? 0;
          if (savedPosition.lineNumber <= lineCount) {
            this._editorWidget.setPosition(savedPosition);
            this._editorWidget.revealPosition(savedPosition);
          }
        }
      }
    });
    this._updateToolbar(this._currentProvider.actions, provider.options.type);
    const hide4 = (e4) => {
      const thisWindowIsFocused = getWindow(this._editorWidget.getDomNode()).document.hasFocus();
      if (!thisWindowIsFocused) {
        e4?.preventDefault();
        e4?.stopPropagation();
        return;
      }
      if (!this._isInQuickPick) {
        provider.onClose();
      }
      e4?.stopPropagation();
      this._contextViewService.hideContextView();
      if (this._isInQuickPick) {
        return;
      }
      this._updateContextKeys(provider, false);
      const currentPosition = this._editorWidget.getPosition();
      if (currentPosition) {
        this._lastProviderPosition.set(provider.id, currentPosition);
      }
      this._lastProvider = void 0;
      this._currentContent = void 0;
      this._currentProvider?.dispose();
      this._currentProvider = void 0;
    };
    const disposableStore = new DisposableStore();
    disposableStore.add(this._editorWidget.onKeyDown((e4) => {
      if (e4.keyCode === 3 /* Enter */) {
        this._commandService.executeCommand("editor.action.openLink");
      } else if (e4.keyCode === 9 /* Escape */ || shouldHide(e4.browserEvent, this._keybindingService, this._configurationService)) {
        hide4(e4);
      } else if (e4.keyCode === 38 /* KeyH */ && provider.options.readMoreUrl) {
        const url = provider.options.readMoreUrl;
        alert(AccessibilityHelpNLS.openingDocs);
        this._openerService.open(URI.parse(url));
        e4.preventDefault();
        e4.stopPropagation();
      }
      if (provider instanceof AccessibleContentProvider) {
        provider.onKeyDown?.(e4);
      }
    }));
    disposableStore.add(addDisposableListener(this._toolbar.getElement(), EventType.KEY_DOWN, (e4) => {
      const keyboardEvent = new StandardKeyboardEvent(e4);
      if (keyboardEvent.equals(9 /* Escape */)) {
        hide4(e4);
      }
    }));
    disposableStore.add(this._editorWidget.onDidBlurEditorWidget(() => {
      if (!isActiveElement(this._toolbar.getElement())) {
        hide4();
      }
    }));
    disposableStore.add(this._editorWidget.onDidContentSizeChange(() => this._layout()));
    disposableStore.add(this._layoutService.onDidLayoutActiveContainer(() => this._layout()));
    return disposableStore;
  }
  _updateToolbar(providedActions, type) {
    this._toolbar.setAriaLabel(type === "help" /* Help */ ? localize(7762, null) : localize(7766, null));
    const toolbarMenu = this._register(this._menuService.createMenu(MenuId.AccessibleView, this._contextKeyService));
    const menuActions = getFlatActionBarActions(toolbarMenu.getActions({}));
    if (providedActions) {
      for (const providedAction of providedActions) {
        providedAction.class = providedAction.class || ThemeIcon.asClassName(Codicon.primitiveSquare);
        providedAction.checked = void 0;
      }
      this._toolbar.setActions([...providedActions, ...menuActions]);
    } else {
      this._toolbar.setActions(menuActions);
    }
  }
  _layout() {
    const dimension = this._layoutService.activeContainerDimension;
    const maxHeight = dimension.height && dimension.height * 0.6 /* MAX_HEIGHT_RATIO */;
    const height = Math.min(maxHeight, this._editorWidget.getContentHeight());
    const width2 = Math.min(dimension.width * 0.75 /* WIDTH_RATIO */, 900 /* MAX_WIDTH */);
    this._editorWidget.layout({ width: width2, height });
  }
  async _getTextModel(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    return this._modelService.createModel("", null, resource, false);
  }
  _goToSymbolsSupported() {
    if (!this._currentProvider) {
      return false;
    }
    return this._currentProvider.options.type === "help" /* Help */ || this._currentProvider.options.language === "markdown" || this._currentProvider.options.language === void 0 || this._currentProvider instanceof AccessibleContentProvider && !!this._currentProvider.getSymbols?.();
  }
  _updateLastProvider() {
    const provider = this._currentProvider;
    if (!provider) {
      return;
    }
    const lastProvider = provider instanceof AccessibleContentProvider ? new AccessibleContentProvider(
      provider.id,
      provider.options,
      provider.provideContent.bind(provider),
      provider.onClose.bind(provider),
      provider.verbositySettingKey,
      provider.onOpen?.bind(provider),
      provider.actions,
      provider.provideNextContent?.bind(provider),
      provider.providePreviousContent?.bind(provider),
      provider.onDidChangeContent?.bind(provider),
      provider.onKeyDown?.bind(provider),
      provider.getSymbols?.bind(provider)
    ) : new ExtensionContentProvider(
      provider.id,
      provider.options,
      provider.provideContent.bind(provider),
      provider.onClose.bind(provider),
      provider.onOpen?.bind(provider),
      provider.provideNextContent?.bind(provider),
      provider.providePreviousContent?.bind(provider),
      provider.actions,
      provider.onDidChangeContent?.bind(provider)
    );
    return lastProvider;
  }
  showAccessibleViewHelp() {
    const lastProvider = this._updateLastProvider();
    if (!lastProvider) {
      return;
    }
    let accessibleViewHelpProvider;
    if (lastProvider instanceof AccessibleContentProvider) {
      accessibleViewHelpProvider = new AccessibleContentProvider(
        lastProvider.id,
        { type: "help" /* Help */ },
        () => lastProvider.options.customHelp ? lastProvider?.options.customHelp() : this._accessibleViewHelpDialogContent(this._goToSymbolsSupported()),
        () => {
          this._contextViewService.hideContextView();
          queueMicrotask(() => this.show(lastProvider));
        },
        lastProvider.verbositySettingKey
      );
    } else {
      accessibleViewHelpProvider = new ExtensionContentProvider(
        lastProvider.id,
        { type: "help" /* Help */ },
        () => lastProvider.options.customHelp ? lastProvider?.options.customHelp() : this._accessibleViewHelpDialogContent(this._goToSymbolsSupported()),
        () => {
          this._contextViewService.hideContextView();
          queueMicrotask(() => this.show(lastProvider));
        }
      );
    }
    this._contextViewService.hideContextView();
    if (accessibleViewHelpProvider) {
      queueMicrotask(() => this.show(accessibleViewHelpProvider, void 0, true));
    }
  }
  _accessibleViewHelpDialogContent(providerHasSymbols) {
    const navigationHint = this._navigationHint();
    const goToSymbolHint = this._goToSymbolHint(providerHasSymbols);
    const toolbarHint = localize(7786, null);
    const chatHints = this._getChatHints();
    let hint = localize(7779, null);
    if (navigationHint) {
      hint += " - " + navigationHint + "\n";
    }
    if (goToSymbolHint) {
      hint += " - " + goToSymbolHint + "\n";
    }
    if (toolbarHint) {
      hint += " - " + toolbarHint + "\n";
    }
    if (chatHints) {
      hint += chatHints;
    }
    return hint;
  }
  _getChatHints() {
    if (this._currentProvider?.id !== "panelChat" /* PanelChat */ && this._currentProvider?.id !== "quickChat" /* QuickChat */) {
      return;
    }
    return [
      localize(7777, null, "<keybinding:workbench.action.chat.insertCodeBlock>"),
      localize(7778, null, "<keybinding:workbench.action.chat.insertIntoNewFile>"),
      localize(7782, null, "<keybinding:workbench.action.chat.runInTerminal>")
    ].join("\n");
  }
  _navigationHint() {
    return localize(7763, null, `<keybinding:${"editor.action.accessibleViewNext" /* ShowNext */}>`, `<keybinding:${"editor.action.accessibleViewPrevious" /* ShowPrevious */}>`);
  }
  _disableVerbosityHint(provider) {
    if (provider.options.type === "help" /* Help */ && this._verbosityEnabled()) {
      return localize(7767, null, `<keybinding:${"editor.action.accessibleViewDisableHint" /* DisableVerbosityHint */}>`);
    }
    return "";
  }
  _goToSymbolHint(providerHasSymbols) {
    if (!providerHasSymbols) {
      return;
    }
    return localize(7776, null, `<keybinding:${"editor.action.accessibleViewGoToSymbol" /* GoToSymbol */}>`);
  }
  _configureUnassignedKbHint() {
    const configureKb = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelpConfigureKeybindings" /* AccessibilityHelpConfigureKeybindings */)?.getAriaLabel();
    const keybindingToConfigureQuickPick = configureKb ? "(" + configureKb + ")" : "by assigning a keybinding to the command Accessibility Help Configure Unassigned Keybindings.";
    return localize(7772, null, keybindingToConfigureQuickPick);
  }
  _configureAssignedKbHint() {
    const configureKb = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelpConfigureAssignedKeybindings" /* AccessibilityHelpConfigureAssignedKeybindings */)?.getAriaLabel();
    const keybindingToConfigureQuickPick = configureKb ? "(" + configureKb + ")" : "by assigning a keybinding to the command Accessibility Help Configure Assigned Keybindings.";
    return localize(7773, null, keybindingToConfigureQuickPick);
  }
  _screenReaderModeHint(provider) {
    const accessibilitySupport = this._accessibilityService.isScreenReaderOptimized();
    let screenReaderModeHint = "";
    const turnOnMessage = isMacintosh ? AccessibilityHelpNLS.changeConfigToOnMac : AccessibilityHelpNLS.changeConfigToOnWinLinux;
    if (accessibilitySupport && provider.id === "editor" /* Editor */) {
      screenReaderModeHint = AccessibilityHelpNLS.auto_on;
      screenReaderModeHint += "\n";
    } else if (!accessibilitySupport) {
      screenReaderModeHint = AccessibilityHelpNLS.auto_off + "\n" + turnOnMessage;
      screenReaderModeHint += "\n";
    }
    return screenReaderModeHint;
  }
  _exitDialogHint(provider) {
    return this._verbosityEnabled() && !provider.options.position ? localize(7775, null) : "";
  }
  _readMoreHint(provider) {
    return provider.options.readMoreUrl ? localize(7781, null, `<keybinding:${"editor.action.accessibilityHelpOpenHelpLink" /* AccessibilityHelpOpenHelpLink */}>`) : "";
  }
};

AccessibleView = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IAccessibilityService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, ILayoutService),
  __decorateParam(9, IMenuService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IChatCodeBlockContextProviderService),
  __decorateParam(12, IStorageService),
  __decorateParam(13, IQuickInputService),
  __decorateParam(14, IAccessibilitySignalService)
], AccessibleView);

var AccessibleViewService = class extends Disposable {
  constructor(_instantiationService, _configurationService, _keybindingService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._keybindingService = _keybindingService;
  }
  show(provider, position2) {
    if (!this._accessibleView) {
      this._accessibleView = this._register(this._instantiationService.createInstance(AccessibleView));
    }
    this._accessibleView.show(provider, void 0, void 0, position2);
  }
  configureKeybindings(unassigned) {
    this._accessibleView?.configureKeybindings(unassigned);
  }
  openHelpLink() {
    this._accessibleView?.openHelpLink();
  }
  showLastProvider(id2) {
    this._accessibleView?.showLastProvider(id2);
  }
  next() {
    this._accessibleView?.next();
  }
  previous() {
    this._accessibleView?.previous();
  }
  goToSymbol() {
    this._accessibleView?.goToSymbol();
  }
  getOpenAriaHint(verbositySettingKey) {
    if (!this._configurationService.getValue(verbositySettingKey)) {
      return null;
    }
    const keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView" /* OpenAccessibleView */)?.getAriaLabel();
    let hint = null;
    if (keybinding) {
      hint = localize(7768, null, keybinding);
    } else {
      hint = localize(7769, null);
    }
    return hint;
  }
  disableHint() {
    this._accessibleView?.disableHint();
  }
  showAccessibleViewHelp() {
    this._accessibleView?.showAccessibleViewHelp();
  }
  getPosition(id2) {
    return this._accessibleView?.getPosition(id2) ?? void 0;
  }
  getLastPosition() {
    const lastLine = this._accessibleView?.editorWidget.getModel()?.getLineCount();
    return lastLine !== void 0 && lastLine > 0 ? new Position(lastLine, 1) : void 0;
  }
  setPosition(position2, reveal, select) {
    this._accessibleView?.setPosition(position2, reveal, select);
  }
  getCodeBlockContext() {
    return this._accessibleView?.getCodeBlockContext();
  }
  navigateToCodeBlock(type) {
    this._accessibleView?.navigateToCodeBlock(type);
  }
};

AccessibleViewService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IKeybindingService)
], AccessibleViewService);

var AccessibleViewSymbolQuickPick = class {
  constructor(_accessibleView, _quickInputService) {
    this._accessibleView = _accessibleView;
    this._quickInputService = _quickInputService;
  }
  show(provider) {
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this._quickInputService.createQuickPick());
    quickPick.placeholder = localize(7764, null);
    quickPick.title = localize(7765, null);
    const picks = [];
    const symbols = this._accessibleView.getSymbols();
    if (!symbols) {
      return;
    }
    for (const symbol of symbols) {
      picks.push({
        label: symbol.label,
        ariaLabel: symbol.ariaLabel,
        firstListItem: symbol.firstListItem,
        lineNumber: symbol.lineNumber,
        endLineNumber: symbol.endLineNumber,
        markdownToParse: symbol.markdownToParse
      });
    }
    quickPick.canSelectMany = false;
    quickPick.items = picks;
    quickPick.show();
    disposables.add(quickPick.onDidAccept(() => {
      this._accessibleView.showSymbol(provider, quickPick.selectedItems[0]);
      quickPick.hide();
    }));
    disposables.add(quickPick.onDidHide(() => {
      if (quickPick.selectedItems.length === 0) {
        this._accessibleView.show(provider);
      }
      disposables.dispose();
    }));
  }
};

AccessibleViewSymbolQuickPick = __decorateClass([
  __decorateParam(1, IQuickInputService)
], AccessibleViewSymbolQuickPick);

function shouldHide(event, keybindingService, configurationService) {
  if (!configurationService.getValue("accessibility.accessibleView.closeOnKeyPress" /* AccessibleViewCloseOnKeyPress */)) {
    return false;
  }
  const standardKeyboardEvent = new StandardKeyboardEvent(event);
  const resolveResult = keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
  const isValidChord = resolveResult.kind === 1 /* MoreChordsNeeded */;
  if (keybindingService.inChordMode || isValidChord) {
    return false;
  }
  return shouldHandleKey(event) && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey;
}

function shouldHandleKey(event) {
  return !!event.code.match(/^(Key[A-Z]|Digit[0-9]|Equal|Comma|Period|Slash|Quote|Backquote|Backslash|Minus|Semicolon|Space|Enter)$/);
}
export { shouldHide, shouldHandleKey, AccessibleView, AccessibleViewService, AccessibleViewSymbolQuickPick };
