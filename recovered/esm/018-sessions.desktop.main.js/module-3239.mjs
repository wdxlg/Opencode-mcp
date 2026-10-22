// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminal.suggest.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalCompletionService, TerminalCompletionService } from "./module-1278.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { registerTerminalSuggestProvidersConfiguration, terminalSuggestConfigSection } from "./module-1170.mjs";
import { Event2 } from "./module-0017.mjs";
import { getTerminalLspSupportedLanguageObj } from "./module-3237.mjs";
import { LspTerminalModelContentProvider, createTerminalLanguageVirtualUri } from "./module-3238.mjs";
import { LspCompletionProviderAddon } from "./module-3236.mjs";
import { SuggestAddon } from "./module-3235.mjs";
import { EventType, addDisposableListener, findParentWithClass, isHTMLElement } from "./module-0075.mjs";
import { SuggestDetailsClassName } from "./module-3229.mjs";
import { TerminalClipboardContribution } from "./module-3170.mjs";
import { isWindows } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { registerActiveInstanceAction, registerTerminalAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { MenuId } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { SimpleSuggestContext } from "./module-3230.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ITerminalContributionService } from "./module-3079.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminal.suggest.contribution.ts
registerSingleton(ITerminalCompletionService, TerminalCompletionService, 1 /* Delayed */);

var TerminalSuggestContribution = class extends DisposableStore {
  constructor(_ctx, _contextKeyService, _configurationService, _instantiationService, _terminalCompletionService, _textModelService, _languageFeaturesService) {
    super();
    this._ctx = _ctx;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalCompletionService = _terminalCompletionService;
    this._textModelService = _textModelService;
    this._languageFeaturesService = _languageFeaturesService;
    this._addon = new MutableDisposable();
    this._lspAddons = this.add(new DisposableMap());
    this._lspModelProvider = new MutableDisposable();
    this._lspResources = this.add(new MutableDisposable());
    this.add(toDisposable(() => {
      this._addon?.dispose();
      this._lspModelProvider?.value?.dispose();
      this._lspModelProvider?.dispose();
    }));
    this._terminalSuggestWidgetVisibleContextKey = TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
    this.add(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("terminal.integrated.suggest.enabled" /* Enabled */)) {
        const completionsEnabled = this._configurationService.getValue(terminalSuggestConfigSection).enabled;
        if (!completionsEnabled) {
          this._addon.clear();
          this._lspAddons.clearAndDisposeAll();
          this._lspModelProvider.clear();
          this._lspResources.clear();
        }
        const xtermRaw = this._ctx.instance.xterm?.raw;
        if (!!xtermRaw && completionsEnabled) {
          this._loadAddons(xtermRaw);
        }
      }
    }));
    TerminalSuggestProvidersConfigurationManager.initialize(this._instantiationService);
    this.add(this._ctx.instance.onDidChangeTarget((target) => {
      this._updateContainerForTarget(target);
    }));
    this.add(this._ctx.instance.onDidFocus(() => {
      const xtermRaw = this._ctx.instance.xterm?.raw;
      if (xtermRaw) {
        this._prepareAddonLayout(xtermRaw);
      }
    }));
  }
  static {
    this.ID = "terminal.suggest";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalSuggestContribution.ID);
  }
  get addon() {
    return this._addon.value;
  }
  get lspAddons() {
    return Array.from(this._lspAddons.values());
  }
  xtermOpen(xterm) {
    const config = this._configurationService.getValue(terminalSuggestConfigSection);
    const enabled = config.enabled;
    if (!enabled) {
      return;
    }
    this._loadAddons(xterm.raw);
    this.add(Event2.runAndSubscribe(this._ctx.instance.onDidChangeShellType, async () => {
      this._refreshAddons();
      this._lspModelProvider.value?.shellTypeChanged(this._ctx.instance.shellType);
    }));
  }
  async _loadLspCompletionAddon(xterm) {
    this._lspAddons.clearAndDisposeAll();
    this._lspModelProvider.clear();
    this._lspResources.clear();
    let lspTerminalObj = void 0;
    if (!this._ctx.instance.shellType || !(lspTerminalObj = getTerminalLspSupportedLanguageObj(this._ctx.instance.shellType))) {
      return;
    }
    const resources = this._lspResources.value = new DisposableStore();
    const virtualTerminalDocumentUri = createTerminalLanguageVirtualUri(this._ctx.instance.instanceId, lspTerminalObj.extension);
    this._lspModelProvider.value = this._instantiationService.createInstance(LspTerminalModelContentProvider, this._ctx.instance.capabilities, this._ctx.instance.instanceId, virtualTerminalDocumentUri, this._ctx.instance.shellType);
    const textVirtualModel = await this._textModelService.createModelReference(virtualTerminalDocumentUri);
    if (resources.isDisposed) {
      textVirtualModel.dispose();
      return;
    }
    resources.add(textVirtualModel);
    const virtualProviders = this._languageFeaturesService.completionProvider.all(textVirtualModel.object.textEditorModel);
    const filteredProviders = virtualProviders.filter((p) => p._debugDisplayName !== "wordbasedCompletions");
    for (const provider of filteredProviders) {
      const lspCompletionProviderAddon = this._instantiationService.createInstance(LspCompletionProviderAddon, provider, textVirtualModel, this._lspModelProvider.value);
      this._lspAddons.set(provider._debugDisplayName, lspCompletionProviderAddon);
      xterm.loadAddon(lspCompletionProviderAddon);
      resources.add(this._terminalCompletionService.registerTerminalCompletionProvider(
        "lsp",
        lspCompletionProviderAddon.id,
        lspCompletionProviderAddon,
        ...lspCompletionProviderAddon.triggerCharacters ?? []
      ));
    }
  }
  _loadAddons(xterm) {
    if (this._addon.value) {
      return;
    }
    const addon = this._addon.value = this._instantiationService.createInstance(SuggestAddon, this._ctx.instance.sessionId, this._ctx.instance.shellType, this._ctx.instance.capabilities, this._terminalSuggestWidgetVisibleContextKey);
    xterm.loadAddon(addon);
    this._loadLspCompletionAddon(xterm);
    this._prepareAddonLayout(xterm);
    this.add(addDisposableListener(this._ctx.instance.domElement, EventType.FOCUS_OUT, (e4) => {
      const focusedElement = e4.relatedTarget;
      if (focusedElement?.classList.contains(SuggestDetailsClassName)) {
        return;
      }
      addon.hideSuggestWidget(true);
    }));
    this.add(addon.onAcceptedCompletion(async (text2) => {
      this._ctx.instance.focus();
      this._ctx.instance.sendText(text2, false);
    }));
    const clipboardContrib = TerminalClipboardContribution.get(this._ctx.instance);
    this.add(clipboardContrib.onWillPaste(() => addon.isPasting = true));
    this.add(clipboardContrib.onDidPaste(() => {
      setTimeout(() => addon.isPasting = false, 100);
    }));
    if (!isWindows) {
      let barrier;
      this.add(addon.onDidReceiveCompletions(() => {
        barrier?.open();
        barrier = void 0;
      }));
    }
  }
  _refreshAddons() {
    const addon = this._addon.value;
    if (!addon) {
      return;
    }
    addon.shellType = this._ctx.instance.shellType;
    if (!this._ctx.instance.xterm?.raw) {
      return;
    }
    this._loadLspCompletionAddon(this._ctx.instance.xterm.raw);
  }
  _updateContainerForTarget(target) {
    const addon = this._addon.value;
    if (!addon || !this._ctx.instance.xterm?.raw) {
      return;
    }
    this._prepareAddonLayout(this._ctx.instance.xterm.raw);
  }
  async _prepareAddonLayout(xterm) {
    const addon = this._addon.value;
    if (!addon || this.isDisposed) {
      return;
    }
    const xtermElement = xterm.element ?? await this._waitForXtermElement(xterm);
    if (!xtermElement || this.isDisposed || addon !== this._addon.value) {
      return;
    }
    const container2 = this._resolveAddonContainer(xtermElement);
    addon.setContainerWithOverflow(container2);
    const screenElement = xtermElement?.querySelector(".xterm-screen");
    if (isHTMLElement(screenElement)) {
      addon.setScreen(screenElement);
    }
  }
  async _waitForXtermElement(xterm) {
    if (xterm.element) {
      return xterm.element;
    }
    await Promise.race([
      Event2.toPromise(Event2.filter(this._ctx.instance.onDidChangeVisibility, (visible) => visible)),
      Event2.toPromise(this._ctx.instance.onDisposed)
    ]);
    if (this.isDisposed || this._ctx.instance.isDisposed) {
      return void 0;
    }
    return xterm.element ?? void 0;
  }
  _resolveAddonContainer(xtermElement) {
    if (this._ctx.instance.target === 2 /* Editor */) {
      return xtermElement;
    }
    return findParentWithClass(xtermElement, "panel") ?? xtermElement;
  }
};

TerminalSuggestContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITerminalCompletionService),
  __decorateParam(5, ITextModelService),
  __decorateParam(6, ILanguageFeaturesService)
], TerminalSuggestContribution);

registerTerminalContribution(TerminalSuggestContribution.ID, TerminalSuggestContribution);

registerTerminalAction({
  id: "workbench.action.terminal.changeSelectionModeNever" /* ChangeSelectionModeNever */,
  title: localize2(20857, "Selection Mode: None"),
  tooltip: localize2(20858, "Do not select the top suggestion until down is pressed, at which point Tab or Enter will accept the suggestion. Activate to change."),
  f1: false,
  precondition: ContextKeyExpr.and(
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalContextKeys.focus,
    TerminalContextKeys.isOpen,
    TerminalContextKeys.suggestWidgetVisible,
    ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode" /* SelectionMode */}`, "never")
  ),
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode" /* SelectionMode */}`, "never"),
      ContextKeyExpr.or(
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}`, true),
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */}`, true)
      )
    )
  },
  run: (c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.selectionMode" /* SelectionMode */, "partial");
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.changeSelectionModePartial" /* ChangeSelectionModePartial */,
  title: localize2(20859, "Selection Mode: Partial (Tab)"),
  tooltip: localize2(20860, "Partially select the top suggestion, Tab will accept a suggestion when visible. Activate to change."),
  f1: false,
  precondition: ContextKeyExpr.and(
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalContextKeys.focus,
    TerminalContextKeys.isOpen,
    TerminalContextKeys.suggestWidgetVisible,
    ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode" /* SelectionMode */}`, "partial")
  ),
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode" /* SelectionMode */}`, "partial"),
      ContextKeyExpr.or(
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}`, true),
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */}`, true)
      )
    )
  },
  run: (c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.selectionMode" /* SelectionMode */, "always");
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.changeSelectionModeAlways" /* ChangeSelectionModeAlways */,
  title: localize2(20855, "Selection Mode: Always (Tab or Enter)"),
  tooltip: localize2(20856, "Always select the top suggestion, Tab or Enter will accept a suggestion when visible. Activate to change."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode" /* SelectionMode */}`, "always"),
      ContextKeyExpr.or(
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}`, true),
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */}`, true)
      )
    )
  },
  run: (c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.selectionMode" /* SelectionMode */, "never");
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.doNotShowSuggestOnType" /* DoNotShowOnType */,
  title: localize2(20862, "Don't show IntelliSense unless triggered explicitly. This disables the quick suggestions and suggest on trigger characters settings."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.eye,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 1,
    when: ContextKeyExpr.and(
      ContextKeyExpr.or(
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}.commands`, "on"),
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}.arguments`, "on")
      ),
      ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */}`, true)
    )
  },
  run: (c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */, { commands: "off", arguments: "off", unknown: "off" });
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */, false);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.showSuggestOnType" /* ShowOnType */,
  title: localize2(20871, "Show IntelliSense while typing. This enables the quick suggestions for commands and arguments, and suggest on trigger characters settings."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.eyeClosed,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 1,
    when: ContextKeyExpr.or(
      ContextKeyExpr.and(
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}.commands`, "off"),
        ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */}.arguments`, "off")
      ),
      ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */}`, false)
    )
  },
  run: (c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */, { commands: "on", arguments: "on", unknown: "off" });
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */, true);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.suggestLearnMore" /* LearnMore */,
  title: localize2(20865, "Learn More"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.question,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 2
  },
  run: (c, accessor) => {
    accessor.get(IOpenerService).open("https://aka.ms/vscode-terminal-intellisense");
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.configureSuggestSettings" /* ConfigureSettings */,
  title: localize2(20861, "Configure"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.gear,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 3
  },
  run: (c, accessor) => accessor.get(IPreferencesService).openSettings({ query: terminalSuggestConfigSection })
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.triggerSuggest" /* TriggerSuggest */,
  title: localize2(20875, "Trigger Suggest"),
  f1: false,
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 10 /* Space */,
    mac: { primary: 256 /* WinCtrl */ | 10 /* Space */ },
    weight: 200 /* WorkbenchContrib */ + 1,
    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.suggestWidgetVisible.negate(), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.enabled" /* Enabled */}`, true))
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.requestCompletions(true)
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.resetSuggestWidgetSize" /* ResetWidgetSize */,
  title: localize2(20866, "Reset Suggest Widget Size"),
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.resetWidgetSize()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.selectPrevSuggestion" /* SelectPrevSuggestion */,
  title: localize2(20870, "Select the Previous Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Up is bound to other workbench keybindings that this needs to beat
    primary: 16 /* UpArrow */,
    weight: 200 /* WorkbenchContrib */ + 1,
    when: ContextKeyExpr.or(SimpleSuggestContext.HasNavigated, ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.upArrowNavigatesHistory" /* UpArrowNavigatesHistory */}`, false))
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousSuggestion()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.selectPrevPageSuggestion" /* SelectPrevPageSuggestion */,
  title: localize2(20869, "Select the Previous Page Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Up is bound to other workbench keybindings that this needs to beat
    primary: 11 /* PageUp */,
    weight: 200 /* WorkbenchContrib */ + 1
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousPageSuggestion()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.selectNextSuggestion" /* SelectNextSuggestion */,
  title: localize2(20868, "Select the Next Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    primary: 18 /* DownArrow */,
    weight: 200 /* WorkbenchContrib */ + 1
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextSuggestion()
});

registerActiveInstanceAction({
  id: "terminalSuggestToggleExplainMode",
  title: localize2(20874, "Suggest Toggle Explain Modes"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    weight: 200 /* WorkbenchContrib */ + 1,
    primary: 2048 /* CtrlCmd */ | 90 /* Slash */
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleExplainMode()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.suggestToggleDetailsFocus" /* ToggleDetailsFocus */,
  title: localize2(20873, "Suggest Toggle Suggestion Focus"),
  f1: false,
  // HACK: This does not work with a precondition of `TerminalContextKeys.suggestWidgetVisible`, so make sure to not override the editor's keybinding
  precondition: EditorContextKeys.textInputFocus.negate(),
  keybinding: {
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 10 /* Space */,
    mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 10 /* Space */ }
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleSuggestionFocus()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.suggestToggleDetails" /* ToggleDetails */,
  title: localize2(20872, "Suggest Toggle Details"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen, TerminalContextKeys.focus, TerminalContextKeys.suggestWidgetVisible, SimpleSuggestContext.HasFocusedSuggestion),
  keybinding: {
    // HACK: Force weight to be higher than that to start terminal chat
    weight: 400 /* ExternalExtension */ + 2,
    primary: 2048 /* CtrlCmd */ | 10 /* Space */,
    secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */],
    mac: { primary: 256 /* WinCtrl */ | 10 /* Space */, secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */] }
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleSuggestionDetails()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.selectNextPageSuggestion" /* SelectNextPageSuggestion */,
  title: localize2(20867, "Select the Next Page Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    primary: 12 /* PageDown */,
    weight: 200 /* WorkbenchContrib */ + 1
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextPageSuggestion()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.acceptSelectedSuggestion" /* AcceptSelectedSuggestion */,
  title: localize2(20853, "Insert"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: [
    {
      primary: 2 /* Tab */,
      // Tab is bound to other workbench keybindings that this needs to beat
      weight: 200 /* WorkbenchContrib */ + 2,
      when: ContextKeyExpr.and(SimpleSuggestContext.HasFocusedSuggestion)
    },
    {
      primary: 3 /* Enter */,
      // Enter accepts when: explicitly invoked (ctrl+space), OR not in partial mode, OR not first suggestion, OR user has navigated
      when: ContextKeyExpr.and(SimpleSuggestContext.HasFocusedSuggestion, ContextKeyExpr.or(SimpleSuggestContext.ExplicitlyInvoked, ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.selectionMode" /* SelectionMode */}`, "partial"), SimpleSuggestContext.FirstSuggestionFocused.toNegated(), SimpleSuggestContext.HasNavigated)),
      weight: 200 /* WorkbenchContrib */ + 1
    }
  ],
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.acceptSelectedSuggestionEnter" /* AcceptSelectedSuggestionEnter */,
  title: localize2(20854, "Accept Selected Suggestion (Enter)"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 3 /* Enter */,
    // Enter is bound to other workbench keybindings that this needs to beat
    weight: 200 /* WorkbenchContrib */ + 1,
    when: ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.runOnEnter" /* RunOnEnter */}`, "never")
  },
  run: async (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(void 0, true)
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.hideSuggestWidget" /* HideSuggestWidget */,
  title: localize2(20863, "Hide Suggest Widget"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 9 /* Escape */,
    // Escape is bound to other workbench keybindings that this needs to beat
    weight: 200 /* WorkbenchContrib */ + 1
  },
  run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget(true)
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.hideSuggestWidgetAndNavigateHistory" /* HideSuggestWidgetAndNavigateHistory */,
  title: localize2(20864, "Hide Suggest Widget and Navigate History"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 16 /* UpArrow */,
    when: ContextKeyExpr.and(SimpleSuggestContext.HasNavigated.negate(), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.upArrowNavigatesHistory" /* UpArrowNavigatesHistory */}`, true)),
    weight: 200 /* WorkbenchContrib */ + 2
  },
  run: (activeInstance) => {
    TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget(true);
    activeInstance.sendText("\x1B[A", false);
  }
});

var TerminalSuggestProvidersConfigurationManager = class extends Disposable {
  constructor(_terminalCompletionService, _terminalContributionService) {
    super();
    this._terminalCompletionService = _terminalCompletionService;
    this._terminalContributionService = _terminalContributionService;
    this._register(this._terminalCompletionService.onDidChangeProviders(() => {
      this._updateConfiguration();
    }));
    this._register(this._terminalContributionService.onDidChangeTerminalCompletionProviders(() => {
      this._updateConfiguration();
    }));
    this._updateConfiguration();
  }
  static initialize(instantiationService) {
    if (!this._instance) {
      this._instance = instantiationService.createInstance(TerminalSuggestProvidersConfigurationManager);
    }
  }
  _updateConfiguration() {
    const providers2 = /* @__PURE__ */ new Map();
    this._terminalContributionService.terminalCompletionProviders.forEach((o) => providers2.set(o.extensionIdentifier, { ...o, id: o.extensionIdentifier }));
    for (const { id: id2 } of this._terminalCompletionService.providers) {
      if (id2 && !providers2.has(id2)) {
        providers2.set(id2, { id: id2 });
      }
    }
    registerTerminalSuggestProvidersConfiguration(providers2);
  }
};

TerminalSuggestProvidersConfigurationManager = __decorateClass([
  __decorateParam(0, ITerminalCompletionService),
  __decorateParam(1, ITerminalContributionService)
], TerminalSuggestProvidersConfigurationManager);
export { TerminalSuggestContribution, TerminalSuggestProvidersConfigurationManager };
