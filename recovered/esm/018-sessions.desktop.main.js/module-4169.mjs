// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserNavigationFeatures.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $ } from "./module-0075.mjs";
import { WorkbenchHoverDelegate } from "./module-0520.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { BrowserUrlBarWidget } from "./module-4168.mjs";
import { BROWSER_SEARCH_NONE, BrowserSearchEngineSettingId, buildSearchUrl, getBrowserSearchEngineLabel, resolveAddressBarInputType } from "./module-4167.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_FOCUSED, CONTEXT_BROWSER_HAS_URL } from "./module-4159.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserNavigationFeatures.ts
var CONTEXT_BROWSER_CAN_GO_BACK = new RawContextKey("browserCanGoBack", false, localize(8127, null));

var CONTEXT_BROWSER_CAN_GO_FORWARD = new RawContextKey("browserCanGoForward", false, localize(8128, null));

var BrowserNavigationBar = class extends Disposable {
  constructor(editor, instantiationService, scopedContextKeyService, _configurationService, _preferencesService) {
    super();
    this._configurationService = _configurationService;
    this._preferencesService = _preferencesService;
    this._contributionListeners = this._register(new DisposableStore());
    this._contributions = [];
    this.element = $(".browser-navbar");
    const hoverDelegate = this._register(
      instantiationService.createInstance(
        WorkbenchHoverDelegate,
        "element",
        void 0,
        { position: { hoverPosition: 3 /* ABOVE */ } }
      )
    );
    const scopedInstantiationService = instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, scopedContextKeyService]
    ));
    const navContainer = $(".browser-nav-toolbar");
    this._navToolbar = this._register(scopedInstantiationService.createInstance(
      MenuWorkbenchToolBar,
      navContainer,
      MenuId.BrowserNavigationToolbar,
      {
        hoverDelegate,
        highlightToggledItems: true,
        actionViewItemProvider: (action, options3) => {
          for (const contribution of this._contributions) {
            const viewItem = contribution.getActionViewItem(action, options3, scopedInstantiationService);
            if (viewItem) {
              return viewItem;
            }
          }
          return void 0;
        },
        // Render all actions inline regardless of group.
        toolbarOptions: { primaryGroup: () => true, useSeparatorsInPrimaryActions: true },
        menuOptions: { shouldForwardArgs: true }
      }
    ));
    this._navToolbar.context = editor;
    const urlBarHost = {
      get input() {
        return editor.input instanceof BrowserEditorInput ? editor.input : void 0;
      },
      get isReadonly() {
        return editor.input instanceof BrowserEditorInput && editor.input.associatedResource !== void 0;
      },
      ensureBrowserFocus: () => editor.ensureBrowserFocus(),
      getPrimaryActions: (text2) => this._resolvePrimaryActions(text2),
      getPlaceholder: () => this._searchEngine ? localize(8138, null) : localize(8139, null)
    };
    this._urlBar = this._register(instantiationService.createInstance(BrowserUrlBarWidget, urlBarHost));
    const actionsContainer = $(".browser-actions-toolbar");
    const actionsToolbar = this._register(scopedInstantiationService.createInstance(
      MenuWorkbenchToolBar,
      actionsContainer,
      MenuId.BrowserActionsToolbar,
      {
        hoverDelegate,
        highlightToggledItems: true,
        toolbarOptions: { primaryGroup: () => true, useSeparatorsInPrimaryActions: true },
        menuOptions: { shouldForwardArgs: true },
        responsiveBehavior: {
          enabled: true,
          kind: "last",
          minItems: 0,
          // The URL bar is the flexible element, so the actions toolbar's own
          // element width does not reflect the room it could occupy.
          // So we pass manual calculations based on the navbar's overall width and the URL bar's width.
          observedElement: this.element,
          getAvailableWidth: () => {
            const toolbarBounds = this.element.getBoundingClientRect();
            const urlBarBounds = this._urlBar.element.getBoundingClientRect();
            return Math.max(
              0,
              toolbarBounds.right - urlBarBounds.left - 240
              /* approximate: preferred width of the URL input plus padding */
            );
          }
        }
      }
    ));
    actionsToolbar.context = editor;
    this.element.appendChild(navContainer);
    this.element.appendChild(this._urlBar.element);
    this.element.appendChild(actionsContainer);
  }
  refreshUrl() {
    this._urlBar.refreshUrl();
  }
  previewUrl(url) {
    this._urlBar.previewUrl(url);
  }
  focusUrlInput() {
    this._urlBar.focusUrlInput();
  }
  openUrlPicker() {
    this._urlBar.openUrlPicker();
  }
  clear() {
    this._urlBar.clear();
  }
  mountContributions(contributions) {
    this._contributions = contributions;
    this._contributionListeners.clear();
    for (const contribution of contributions) {
      this._contributionListeners.add(contribution.onDidChangeActionViewItems(() => this._navToolbar.refresh()));
    }
    this._navToolbar.refresh();
    this._urlBar.mountContributions(contributions);
  }
  /**
   * The configured address bar search engine, or `undefined` when search
   * routing is disabled (the setting is `'none'`).
   */
  get _searchEngine() {
    const value2 = this._configurationService.getValue(BrowserSearchEngineSettingId);
    return value2 && value2 !== BROWSER_SEARCH_NONE ? value2 : void 0;
  }
  /**
   * The URL bar's primary picker item(s) for the given text, mirroring
   * Chrome/Edge. With search enabled: a URL reads "{url}" (globe icon) first
   * with a search fallback after, a clear query reads "{query} - {engine}
   * Search" (search icon), and an ambiguous input offers both — Search first,
   * then Go to — so the user can pick. The destination URL is resolved here
   * (search text → search-engine URL) so {@link BrowserEditorInput.navigate}
   * receives a plain URL; the telemetry source is passed through so a
   * search-initiated navigation is tracked as such.
   */
  _resolvePrimaryActions(text2) {
    const goTo = {
      id: text2,
      label: text2,
      iconClass: ThemeIcon.asClassName(Codicon.globe),
      apply: (input) => input.navigate(text2)
    };
    const engineId = this._searchEngine;
    if (!engineId) {
      return [goTo];
    }
    const configureEngineButton = {
      id: "browser.configureSearchEngine",
      iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
      tooltip: localize(8129, null),
      run: () => void this._preferencesService.openSettings({ query: `@id:${BrowserSearchEngineSettingId}` })
    };
    const search2 = {
      id: text2,
      label: localize(8137, null, text2, getBrowserSearchEngineLabel(engineId)),
      iconClass: ThemeIcon.asClassName(Codicon.search),
      buttons: [configureEngineButton],
      apply: (input) => input.navigate(buildSearchUrl(text2, engineId), { source: "searchInput" })
    };
    switch (resolveAddressBarInputType(text2)) {
      case "url":
        return [goTo, search2];
      case "query":
        return [search2];
      default:
        return [search2, goTo];
    }
  }
};

var BrowserNavigationFeatures = class extends BrowserEditorContribution {
  constructor(editor, instantiationService, contextKeyService, configurationService, preferencesService) {
    super(editor);
    this._pendingTryFocus = this._register(new MutableDisposable());
    /**
     * Whether a navigation has been initiated on the current tab. Once true,
     * an empty URL means "navigation in flight" rather than "fresh tab", so
     * {@link tryFocus} keeps focus on the page instead of reopening the picker.
     */
    this._hasInitiatedNavigation = false;
    this._navbar = this._register(new BrowserNavigationBar(editor, instantiationService, contextKeyService, configurationService, preferencesService));
    this._canGoBackContext = CONTEXT_BROWSER_CAN_GO_BACK.bindTo(contextKeyService);
    this._canGoForwardContext = CONTEXT_BROWSER_CAN_GO_FORWARD.bindTo(contextKeyService);
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(BrowserSearchEngineSettingId)) {
        this._navbar.refreshUrl();
      }
    }));
  }
  get widgets() {
    return [{ location: "toolbar" /* Toolbar */, element: this._navbar.element, order: 0 }];
  }
  onContainerCreated() {
    const contributions = [];
    for (const contribution of this.editor.getContributions()) {
      if (contribution !== this) {
        contributions.push(contribution);
      }
    }
    this._navbar.mountContributions(contributions);
  }
  prerenderInput(_input) {
    this._navbar.refreshUrl();
    this._canGoBackContext.set(false);
    this._canGoForwardContext.set(false);
  }
  onModelAttached(model, store) {
    this._hasInitiatedNavigation = model.loading;
    this._updateFromModel(model);
    store.add(model.onDidNavigate(() => this._updateFromModel(model)));
    store.add(model.onWillNavigate((url) => {
      this._hasInitiatedNavigation = true;
      this._navbar.previewUrl(url);
    }));
  }
  onModelDetached() {
    this._hasInitiatedNavigation = false;
    this._navbar.clear();
    this._canGoBackContext.reset();
    this._canGoForwardContext.reset();
  }
  tryFocus() {
    const input = this.editor.input;
    this._pendingTryFocus.value = disposableTimeout(() => {
      if (this.editor.input !== input) {
        return;
      }
      const url = this.editor.model?.url ?? (input instanceof BrowserEditorInput ? input.url : void 0);
      if (!url && !this._hasInitiatedNavigation) {
        this._navbar.openUrlPicker();
      } else {
        this.editor.ensureBrowserFocus();
      }
    }, 0);
    return true;
  }
  _updateFromModel(model) {
    this._navbar.refreshUrl();
    this._canGoBackContext.set(model.canGoBack);
    this._canGoForwardContext.set(model.canGoForward);
  }
  focusUrlInput() {
    this._navbar.focusUrlInput();
  }
  openUrlPicker() {
    this._navbar.openUrlPicker();
  }
};

BrowserNavigationFeatures = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IPreferencesService)
], BrowserNavigationFeatures);

BrowserEditor.registerContribution(BrowserNavigationFeatures);

var GoBackAction2 = class _GoBackAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.GoBack;
  }
  constructor() {
    super({
      id: _GoBackAction.ID,
      title: localize2(8131, "Go Back"),
      category: BrowserActionCategory,
      icon: Codicon.arrowLeft,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_CAN_GO_BACK),
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 1
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 50,
        primary: 512 /* Alt */ | 15 /* LeftArrow */,
        secondary: [122 /* BrowserBack */],
        mac: { primary: 2048 /* CtrlCmd */ | 92 /* BracketLeft */, secondary: [122 /* BrowserBack */, 2048 /* CtrlCmd */ | 15 /* LeftArrow */] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.goBack();
    }
  }
};

var GoForwardAction2 = class _GoForwardAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.GoForward;
  }
  constructor() {
    super({
      id: _GoForwardAction.ID,
      title: localize2(8132, "Go Forward"),
      category: BrowserActionCategory,
      icon: Codicon.arrowRight,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_CAN_GO_FORWARD),
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 2
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 50,
        primary: 512 /* Alt */ | 17 /* RightArrow */,
        secondary: [123 /* BrowserForward */],
        mac: { primary: 2048 /* CtrlCmd */ | 94 /* BracketRight */, secondary: [123 /* BrowserForward */, 2048 /* CtrlCmd */ | 17 /* RightArrow */] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.goForward();
    }
  }
};

var ReloadAction = class _ReloadAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.Reload;
  }
  constructor() {
    super({
      id: _ReloadAction.ID,
      title: localize2(8136, "Reload"),
      category: BrowserActionCategory,
      icon: Codicon.refresh,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 3,
        alt: {
          id: HardReloadAction.ID,
          title: localize2(8133, "Hard Reload"),
          icon: Codicon.refresh
        }
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 /* WorkbenchContrib */ + 75,
        primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
        secondary: [63 /* F5 */],
        mac: { primary: 2048 /* CtrlCmd */ | 48 /* KeyR */, secondary: [] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.reload();
    }
  }
};

var HardReloadAction = class _HardReloadAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.HardReload;
  }
  constructor() {
    super({
      id: _HardReloadAction.ID,
      title: localize2(8133, "Hard Reload"),
      category: BrowserActionCategory,
      icon: Codicon.refresh,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 /* WorkbenchContrib */ + 75,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
        secondary: [2048 /* CtrlCmd */ | 63 /* F5 */],
        mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */, secondary: [] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.reload(true);
    }
  }
};

var FocusUrlInputAction = class _FocusUrlInputAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.FocusUrlInput;
  }
  constructor() {
    super({
      id: _FocusUrlInputAction.ID,
      title: localize2(8130, "Focus URL Input"),
      category: BrowserActionCategory,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 42 /* KeyL */
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserNavigationFeatures)?.openUrlPicker();
    }
  }
};

var OpenInExternalBrowserAction = class _OpenInExternalBrowserAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.OpenExternal;
  }
  constructor() {
    super({
      id: _OpenInExternalBrowserAction.ID,
      title: localize2(8134, "Open in External Browser"),
      category: BrowserActionCategory,
      icon: Codicon.linkExternal,
      f1: true,
      // Note: We do allow opening in an external browser even if there is an error page shown
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_tools" /* Tools */,
        order: 10,
        // Keep a standards-compliant escape hatch visible for identity providers
        // that intentionally refuse all embedded user agents (for example OAuth flows).
        isHiddenByDefault: false
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      const url = browserEditor.model?.url;
      if (url) {
        const openerService = accessor.get(IOpenerService);
        await openerService.open(url, {
          // ensures that VS Code itself doesn't try to open the URL, even for non-"http(s):" scheme URLs.
          openExternal: true,
          // ensures that the link isn't opened in Integrated Browser or other contributed external openers. False is the default, but just being explicit here.
          allowContributedOpeners: false
        });
      }
    }
  }
};

var OpenBrowserSettingsAction = class _OpenBrowserSettingsAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.OpenSettings;
  }
  constructor() {
    super({
      id: _OpenBrowserSettingsAction.ID,
      title: localize2(8135, "Browser Settings"),
      category: BrowserActionCategory,
      icon: Codicon.settingsGear,
      f1: false,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "5_settings" /* Settings */,
        order: 2,
        isHiddenByDefault: true
      }
    });
  }
  async run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    await preferencesService.openSettings({ query: `@id:workbench.browser.*` });
  }
};

registerAction2(GoBackAction2);

registerAction2(GoForwardAction2);

registerAction2(ReloadAction);

registerAction2(HardReloadAction);

registerAction2(FocusUrlInputAction);

registerAction2(OpenInExternalBrowserAction);

registerAction2(OpenBrowserSettingsAction);
export { CONTEXT_BROWSER_CAN_GO_BACK, CONTEXT_BROWSER_CAN_GO_FORWARD, BrowserNavigationBar, BrowserNavigationFeatures, GoBackAction2, GoForwardAction2, ReloadAction, HardReloadAction, FocusUrlInputAction, OpenInExternalBrowserAction, OpenBrowserSettingsAction };
