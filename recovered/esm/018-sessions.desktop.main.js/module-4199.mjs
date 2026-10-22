// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserTabManagementFeatures.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { logBrowserOpen } from "./module-1488.mjs";
import { BrowserViewUri } from "./module-1487.mjs";
import { generateUuid } from "./module-0190.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution } from "./module-4159.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { match } from "./module-0857.mjs";
import { IsSessionsWindowContext, ResourceContextKey } from "./module-0950.mjs";
import { Schemas } from "./module-0033.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ToggleTitleBarConfigAction } from "./module-2553.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { isAllInterfacesAuthority, isLocalhostAuthority } from "./module-1239.mjs";
import { IConfigurationService, isConfigured } from "./module-0132.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { Emitter } from "./module-0017.mjs";
import { BRIDGE_QUICK_LINKS_SETTING, isValidQuickLinkUrl, readQuickLinks } from "./module-2658.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { BrowserNewTabPlacementSettingId } from "./module-4162.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserTabManagementFeatures.ts
var CONTEXT_BROWSER_EDITOR_OPEN = new RawContextKey("browserEditorOpen", false, localize(8177, null));

var closeButtonItem = {
  iconClass: ThemeIcon.asClassName(Codicon.close),
  tooltip: localize(8176, null)
};

var closeAllButtonItem = {
  iconClass: ThemeIcon.asClassName(Codicon.closeAll),
  tooltip: localize(8175, null),
  location: 2 /* Inline */
};

var BrowserTabQuickPick = class extends Disposable {
  constructor(_editorService, _editorGroupsService, quickInputService, telemetryService, _browserViewService) {
    super();
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    this._browserViewService = _browserViewService;
    this._itemListeners = this._register(new DisposableStore());
    this._openNewTabPick = {
      groupId: -1,
      editor: void 0,
      label: localize(8195, null),
      iconClass: ThemeIcon.asClassName(Codicon.add),
      alwaysShow: true
    };
    this._openIncognitoTabPick = {
      groupId: -1,
      editor: void 0,
      label: localize(8192, null),
      description: localize(8193, null),
      iconClass: ThemeIcon.asClassName(Codicon.eyeClosed),
      alwaysShow: true
    };
    this._openSecondAccountTabPick = {
      groupId: -1,
      editor: void 0,
      label: localize(8197, null),
      description: localize(8198, null),
      iconClass: ThemeIcon.asClassName(Codicon.account),
      alwaysShow: true
    };
    this._quickPick = this._register(quickInputService.createQuickPick({ useSeparators: true }));
    this._quickPick.placeholder = localize(8204, null);
    this._quickPick.matchOnDescription = true;
    this._quickPick.sortByLabel = false;
    this._quickPick.buttons = [closeAllButtonItem];
    this._register(this._quickPick.onDidTriggerItemButton(async ({ item }) => {
      item.editor?.dispose(true);
    }));
    this._register(this._quickPick.onDidTriggerButton(async () => {
      for (const editor of this._browserViewService.getContextualBrowserViews().values()) {
        editor.dispose(true);
      }
    }));
    this._register(this._quickPick.onDidAccept(async () => {
      const [selected] = this._quickPick.selectedItems;
      if (!selected) {
        return;
      }
      if (selected === this._openNewTabPick) {
        logBrowserOpen(telemetryService, "quickOpenWithoutUrl");
        this._quickPick.hide();
        await this._editorService.openEditor({
          resource: BrowserViewUri.forId(generateUuid())
        }, await this._browserViewService.getPreferredGroup());
      } else if (selected === this._openIncognitoTabPick) {
        logBrowserOpen(telemetryService, "newIncognitoTabCommand");
        this._quickPick.hide();
        await this._editorService.openEditor({
          resource: BrowserViewUri.forId(generateUuid()),
          options: { viewState: { storageScope: "ephemeral" /* Ephemeral */ } }
        }, await this._browserViewService.getPreferredGroup());
      } else if (selected === this._openSecondAccountTabPick) {
        logBrowserOpen(telemetryService, "newSecondAccountTabCommand");
        this._quickPick.hide();
        await this._editorService.openEditor({
          resource: BrowserViewUri.forId(generateUuid()),
          options: { viewState: { storageScope: "secondAccount" /* SecondAccount */ } }
        }, await this._browserViewService.getPreferredGroup());
      } else {
        await this._editorService.openEditor(selected.editor, await this._browserViewService.getPreferredGroup(selected.groupId));
      }
    }));
    this._register(this._quickPick.onDidHide(() => this.dispose()));
  }
  show() {
    this._buildItems();
    const activeEditor = this._editorService.activeEditor;
    if (activeEditor instanceof BrowserEditorInput) {
      const activePick = this._quickPick.items.find((item) => item.type !== "separator" && item.editor === activeEditor);
      if (activePick) {
        this._quickPick.activeItems = [activePick];
      }
    }
    this._quickPick.show();
  }
  _buildItems() {
    this._itemListeners.clear();
    const activeEditor = this._quickPick.activeItems[0]?.editor;
    const picks = [];
    const groups = this._editorGroupsService.getGroups(2 /* GRID_APPEARANCE */);
    const groupsWithBrowserEditors = groups.map((group2) => ({ group: group2, browserEditors: group2.editors.filter((e4) => e4 instanceof BrowserEditorInput) })).filter(({ browserEditors }) => browserEditors.length > 0);
    const viewsInGroups = /* @__PURE__ */ new Set();
    for (const { browserEditors } of groupsWithBrowserEditors) {
      for (const editor of browserEditors) {
        viewsInGroups.add(editor.id);
      }
    }
    const backgroundEditors = [...this._browserViewService.getContextualBrowserViews().values()].filter((e4) => !viewsInGroups.has(e4.id));
    const backgroundLabel = localize(8171, null);
    const sections = groupsWithBrowserEditors.map(({ group: group2, browserEditors }) => ({
      label: group2.label,
      ariaLabel: group2.ariaLabel,
      groupId: group2.id,
      editors: browserEditors,
      isPinned: (e4) => group2.isPinned(e4)
    }));
    if (backgroundEditors.length > 0) {
      sections.push({ label: backgroundLabel, ariaLabel: backgroundLabel, groupId: ACTIVE_GROUP, editors: backgroundEditors });
    }
    for (const { group: group2 } of groupsWithBrowserEditors) {
      this._itemListeners.add(group2.onDidModelChange(() => this._buildItems()));
    }
    this._itemListeners.add(this._browserViewService.onDidChangeBrowserViews(() => this._buildItems()));
    const hasMultipleSections = sections.length > 1;
    let newActivePick;
    for (const section of sections) {
      if (hasMultipleSections) {
        picks.push({ type: "separator", label: section.label });
      }
      for (const editor of section.editors) {
        const icon2 = editor.getIcon();
        const description = editor.getDescription();
        const nameAndDescription = description ? `${editor.getName()} ${description}` : editor.getName();
        const pick = {
          groupId: section.groupId,
          editor,
          label: editor.getName(),
          ariaLabel: hasMultipleSections ? localize(8209, null, nameAndDescription, section.ariaLabel) : nameAndDescription,
          description,
          buttons: [closeButtonItem],
          italic: section.isPinned ? !section.isPinned(editor) : void 0
        };
        if (icon2 instanceof URI) {
          pick.iconPath = { dark: icon2 };
        } else if (icon2) {
          pick.iconClass = ThemeIcon.asClassName(icon2);
        }
        picks.push(pick);
        if (editor === activeEditor) {
          newActivePick = pick;
        }
        this._itemListeners.add(editor.onDidChangeLabel(() => this._buildItems()));
      }
    }
    picks.push({ type: "separator" });
    picks.push(this._openNewTabPick);
    picks.push(this._openIncognitoTabPick);
    picks.push(this._openSecondAccountTabPick);
    this._quickPick.keepScrollPosition = true;
    this._quickPick.items = picks;
    if (newActivePick) {
      this._quickPick.activeItems = [newActivePick];
    }
  }
};

BrowserTabQuickPick = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IBrowserViewWorkbenchService)
], BrowserTabQuickPick);

var QuickOpenBrowserAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.QuickOpen,
      title: localize2(8201, "Quick Open Browser Tab..."),
      icon: Codicon.globe,
      category: BrowserActionCategory,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        // Note: on Linux this conflicts with the "toggle block comment" keybinding.
        //       it's not as problem at the moment becase oh the `when`, but worth noting for the future.
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */,
        when: BROWSER_EDITOR_ACTIVE
      }
    });
  }
  run(accessor) {
    const picker = accessor.get(IInstantiationService).createInstance(BrowserTabQuickPick);
    picker.show();
  }
};

var OpenIntegratedBrowserAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.Open,
      title: localize2(8190, "Open Integrated Browser"),
      category: BrowserActionCategory,
      icon: Codicon.globe,
      f1: true
    });
  }
  async run(accessor, urlOrOptions) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const browserViewService = accessor.get(IBrowserViewWorkbenchService);
    const options3 = typeof urlOrOptions === "string" ? { url: urlOrOptions } : urlOrOptions ?? {};
    const resource = BrowserViewUri.forId(generateUuid());
    const group2 = await browserViewService.getPreferredGroup(options3.openToSide ? SIDE_GROUP : void 0);
    if (options3.reuseUrlFilter) {
      const filterUri = URI.parse(options3.reuseUrlFilter);
      const matchingEditor = [...browserViewService.getContextualBrowserViews().values()].find((e4) => {
        const editorUri = URI.parse(e4.url || "");
        if (filterUri.scheme && options3.reuseUrlFilter.startsWith(`${filterUri.scheme}:`) && filterUri.scheme !== editorUri.scheme) {
          return false;
        }
        if (filterUri.authority && !match(filterUri.authority, editorUri.authority)) {
          return false;
        }
        if (filterUri.path && !match(filterUri.path, editorUri.path)) {
          return false;
        }
        if (filterUri.query) {
          const filterParams = new URLSearchParams(filterUri.query);
          const editorParams = new URLSearchParams(editorUri.query);
          if (![...filterParams].every(([key3, value2]) => match(value2, editorParams.get(key3) ?? ""))) {
            return false;
          }
        }
        return true;
      });
      if (matchingEditor) {
        if (options3.url) {
          matchingEditor.navigate(options3.url);
        }
        await editorService.openEditor(matchingEditor);
        return;
      }
    }
    logBrowserOpen(telemetryService, options3.url ? "commandWithUrl" : "commandWithoutUrl");
    const editorPane = await editorService.openEditor({ resource, options: { viewState: { url: options3.url } } }, group2);
    if (options3.openToSide && editorPane?.group) {
      editorPane.group.lock(true);
    }
  }
};

var OpenFileInIntegratedBrowserAction = class extends Action2 {
  constructor() {
    const IS_LOCAL_HTML_FILE = ContextKeyExpr.and(
      ResourceContextKey.Scheme.isEqualTo(Schemas.file),
      ContextKeyExpr.regex(ResourceContextKey.Extension.key, /\.html?$/i)
    );
    super({
      id: BrowserViewCommandId.OpenFile,
      title: localize2(8191, "Open in Integrated Browser"),
      category: BrowserActionCategory,
      icon: Codicon.globe,
      f1: true,
      precondition: IS_LOCAL_HTML_FILE,
      menu: [
        {
          id: MenuId.ExplorerContext,
          group: "navigation",
          order: 29,
          when: IS_LOCAL_HTML_FILE
        },
        {
          id: MenuId.EditorTitleContext,
          group: "1_open",
          order: 5,
          when: IS_LOCAL_HTML_FILE
        },
        {
          id: MenuId.EditorTitle,
          group: "navigation",
          order: 99,
          when: IS_LOCAL_HTML_FILE
        }
      ]
    });
  }
  async run(accessor, resource) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const browserViewService = accessor.get(IBrowserViewWorkbenchService);
    const fileUri = resource ?? EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { filterByScheme: [Schemas.file], supportSideBySide: 1 /* PRIMARY */ });
    if (!fileUri) {
      return;
    }
    logBrowserOpen(telemetryService, "openFileCommand");
    const browserUri = BrowserViewUri.forId(generateUuid());
    await editorService.openEditor({ resource: browserUri, options: { viewState: { url: fileUri.toString() } } }, await browserViewService.getPreferredGroup());
  }
};

var NewTabAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.NewTab,
      title: localize2(8185, "New Tab"),
      category: BrowserActionCategory,
      icon: Codicon.add,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "1_tabs" /* Tabs */,
        order: 1,
        isHiddenByDefault: true
      },
      // When already in a browser, Ctrl/Cmd + T opens a new tab
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 50,
        // Priority over search actions
        primary: 2048 /* CtrlCmd */ | 50 /* KeyT */
      }
    });
  }
  async run(accessor, _browserEditor = accessor.get(IEditorService).activeEditorPane) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const browserViewService = accessor.get(IBrowserViewWorkbenchService);
    const resource = BrowserViewUri.forId(generateUuid());
    logBrowserOpen(telemetryService, "newTabCommand");
    await editorService.openEditor({ resource }, await browserViewService.getPreferredGroup());
  }
};

var NewIncognitoTabAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.NewIncognitoTab,
      title: localize2(8183, "New Incognito Tab"),
      category: BrowserActionCategory,
      icon: Codicon.eyeClosed,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "tabs",
        order: 2
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const browserViewService = accessor.get(IBrowserViewWorkbenchService);
    const resource = BrowserViewUri.forId(generateUuid());
    logBrowserOpen(telemetryService, "newIncognitoTabCommand");
    await editorService.openEditor({ resource, options: { viewState: { storageScope: "ephemeral" /* Ephemeral */ } } }, await browserViewService.getPreferredGroup());
  }
};

var NewSecondAccountTabAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.NewSecondAccountTab,
      title: localize2(8184, "New Second Account Tab"),
      category: BrowserActionCategory,
      icon: Codicon.account,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "tabs",
        order: 3
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const browserViewService = accessor.get(IBrowserViewWorkbenchService);
    const resource = BrowserViewUri.forId(generateUuid());
    logBrowserOpen(telemetryService, "newSecondAccountTabCommand");
    await editorService.openEditor({ resource, options: { viewState: { storageScope: "secondAccount" /* SecondAccount */ } } }, await browserViewService.getPreferredGroup());
  }
};

var CloseAllBrowserTabsAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.CloseAll,
      title: localize2(8172, "Close All Browser Tabs"),
      category: BrowserActionCategory,
      f1: true,
      precondition: CONTEXT_BROWSER_EDITOR_OPEN
    });
  }
  async run(accessor) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    for (const group2 of editorGroupsService.getGroups(2 /* GRID_APPEARANCE */)) {
      const browserEditors = group2.getEditors(1 /* SEQUENTIAL */).filter((e4) => e4 instanceof BrowserEditorInput);
      if (browserEditors.length > 0) {
        await group2.closeEditors(browserEditors);
      }
    }
  }
};

var CloseAllBrowserTabsInGroupAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.CloseAllInGroup,
      title: localize2(8173, "Close All Browser Tabs in Group"),
      category: BrowserActionCategory,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE
    });
  }
  async run(accessor) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    const group2 = editorGroupsService.getGroup(editorService.activeEditorPane?.group?.id ?? editorGroupsService.activeGroup.id);
    if (!group2) {
      return;
    }
    const browserEditors = group2.getEditors(1 /* SEQUENTIAL */).filter((e4) => e4 instanceof BrowserEditorInput);
    if (browserEditors.length > 0) {
      await group2.closeEditors(browserEditors);
    }
  }
};

var OpenOrListBrowsersAction = class extends Action2 {
  constructor() {
    super({
      id: BrowserViewCommandId.OpenOrList,
      title: localize2(8196, "Browser"),
      icon: Codicon.globe,
      f1: false,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 90 /* Slash */
      },
      menu: {
        id: MenuId.TitleBar,
        group: "navigation",
        order: 10,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.workbench.browser.showInTitleBar", false).negate(),
          ContextKeyExpr.or(
            CONTEXT_BROWSER_EDITOR_OPEN,
            // This is a hack to work around `true` just testing for truthiness of the key. It works since `1 == true` in JS.
            ContextKeyExpr.equals("config.workbench.browser.showInTitleBar", 1)
          )
        )
      }
    });
  }
  async run(accessor) {
    const browserViewService = accessor.get(IBrowserViewWorkbenchService);
    const commandService = accessor.get(ICommandService);
    const hasOpenBrowserEditor = browserViewService.getContextualBrowserViews().size > 0;
    if (hasOpenBrowserEditor) {
      await commandService.executeCommand(BrowserViewCommandId.QuickOpen);
      return;
    }
    await commandService.executeCommand(BrowserViewCommandId.Open);
  }
};

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  group: "4_auxbar",
  command: {
    id: BrowserViewCommandId.OpenOrList,
    title: localize(8210, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: BrowserViewCommandId.CloseAllInGroup, title: localize(8174, null) }, group: "1_close", order: 55, when: BROWSER_EDITOR_ACTIVE });

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: BrowserViewCommandId.NewTab,
    title: localize2(8185, "New Tab"),
    icon: Codicon.add
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, IsSessionsWindowContext)
});

registerAction2(QuickOpenBrowserAction);

registerAction2(OpenIntegratedBrowserAction);

registerAction2(OpenFileInIntegratedBrowserAction);

registerAction2(OpenOrListBrowsersAction);

registerAction2(NewTabAction);

registerAction2(NewIncognitoTabAction);

registerAction2(NewSecondAccountTabAction);

registerAction2(CloseAllBrowserTabsAction);

registerAction2(CloseAllBrowserTabsInGroupAction);

registerAction2(class ToggleBrowserTitleBarButton extends ToggleTitleBarConfigAction {
  constructor() {
    super("workbench.browser.showInTitleBar", localize(8211, null), localize(8212, null), 8);
  }
});

var BrowserEditorOpenContextKeyContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.browserEditorOpenContextKey";
  }
  constructor(contextKeyService, browserViewService) {
    super();
    const contextKey = CONTEXT_BROWSER_EDITOR_OPEN.bindTo(contextKeyService);
    const update = () => contextKey.set(browserViewService.getContextualBrowserViews().size > 0);
    update();
    this._register(browserViewService.onDidChangeBrowserViews(() => update()));
  }
};

BrowserEditorOpenContextKeyContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IBrowserViewWorkbenchService)
], BrowserEditorOpenContextKeyContribution);

registerWorkbenchContribution2(BrowserEditorOpenContextKeyContribution.ID, BrowserEditorOpenContextKeyContribution, WorkbenchPhase.AfterRestored);

var LocalhostLinkOpenerContribution = class extends Disposable {
  constructor(openerService, configurationService, editorService, telemetryService, browserViewWorkbenchService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.telemetryService = telemetryService;
    this.browserViewWorkbenchService = browserViewWorkbenchService;
    this._register(openerService.registerExternalOpener(this));
  }
  static {
    this.ID = "workbench.contrib.localhostLinkOpener";
  }
  async openExternal(href, ctx, _token) {
    if (!this.configurationService.getValue("workbench.browser.openLocalhostLinks")) {
      return false;
    }
    if (this.browserViewWorkbenchService.willUseRemoteProxy() && ctx.sourceUri) {
      href = ctx.sourceUri.toString();
    }
    try {
      const parsed = new URL(href);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
      }
      if (!isLocalhostAuthority(parsed.host) && !isAllInterfacesAuthority(parsed.host)) {
        return false;
      }
    } catch {
      return false;
    }
    logBrowserOpen(this.telemetryService, "localhostLinkOpener");
    const isDefaultLinkOpen = !isConfigured(this.configurationService.inspect("workbench.browser.openLocalhostLinks"));
    const browserUri = BrowserViewUri.forId(generateUuid());
    await this.editorService.openEditor({ resource: browserUri, options: { pinned: true, viewState: { url: href, isDefaultLinkOpen } } }, await this.browserViewWorkbenchService.getPreferredGroup());
    return true;
  }
};

LocalhostLinkOpenerContribution = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IBrowserViewWorkbenchService)
], LocalhostLinkOpenerContribution);

registerWorkbenchContribution2(LocalhostLinkOpenerContribution.ID, LocalhostLinkOpenerContribution, WorkbenchPhase.BlockStartup);

var LOCALHOST_HINT_DISMISSED_KEY = "workbench.browser.linkOpenedHintDismissed";

var LinkOpenedHintPill = class extends BrowserEditorContribution {
  constructor(editor, hoverService, storageService, preferencesService, contextKeyService) {
    super(editor);
    this.hoverService = hoverService;
    this.storageService = storageService;
    this.preferencesService = preferencesService;
    this.contextKeyService = contextKeyService;
    this._attentionTimeout = this._register(new MutableDisposable());
    this._pill = $(".browser-link-opened-hint-pill");
    this._pill.tabIndex = 0;
    this._pill.role = "button";
    this._pill.ariaLabel = localize(8178, null);
    this._pill.ariaHidden = "true";
    const icon2 = $("span");
    icon2.className = ThemeIcon.asClassName(Codicon.info);
    const label3 = $("span");
    label3.textContent = localize(8181, null);
    this._pill.appendChild(icon2);
    this._pill.appendChild(label3);
    const hoverOptions = () => ({
      content: new MarkdownString(localize(8179, null)),
      actions: [
        {
          label: localize(8182, null),
          commandId: "workbench.action.openSettings",
          iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
          run: () => {
            this.preferencesService.openUserSettings({ query: "workbench.browser.openLocalhostLinks" });
          }
        },
        {
          label: localize(8180, null),
          commandId: "",
          run: () => {
            this._dismiss();
          }
        }
      ],
      position: { hoverPosition: 2 /* BELOW */ }
    });
    this._register(this.hoverService.setupDelayedHover(this._pill, hoverOptions, { setupKeyboardEvents: true }));
    this._register(addDisposableListener(this._pill, EventType.CLICK, () => {
      this.hoverService.showInstantHover({ ...hoverOptions(), target: this._pill, persistence: { sticky: true } }, true);
    }));
  }
  get widgets() {
    return [{ location: "postUrl" /* PostUrl */, element: this._pill, order: 100 }];
  }
  onModelAttached(_model, _store, isNew) {
    if (IsSessionsWindowContext.getValue(this.contextKeyService)) {
      this._setVisible(false);
      return;
    }
    const input = this.editor.input;
    if (input instanceof BrowserEditorInput && input.isDefaultLinkOpen) {
      const dismissed = this.storageService.getBoolean(LOCALHOST_HINT_DISMISSED_KEY, -1 /* APPLICATION */, false);
      this._setVisible(!dismissed);
      if (!dismissed && isNew) {
        this._callAttention();
      }
    } else {
      this._setVisible(false);
    }
  }
  onModelDetached() {
    this._attentionTimeout.clear();
    this._setVisible(false);
  }
  _setVisible(visible) {
    if (!visible) {
      this._attentionTimeout.clear();
      this._pill.classList.remove("attention");
    }
    this._pill.classList.toggle("visible", visible);
    this._pill.ariaHidden = visible ? "false" : "true";
  }
  _callAttention() {
    this._attentionTimeout.clear();
    this._pill.classList.remove("attention");
    this._attentionTimeout.value = disposableTimeout(() => {
      this._pill.classList.add("attention");
      this._attentionTimeout.value = disposableTimeout(() => {
        this._pill.classList.remove("attention");
      }, 2e3);
    }, 300);
  }
  _dismiss() {
    this.storageService.store(LOCALHOST_HINT_DISMISSED_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
    this._setVisible(false);
  }
};

LinkOpenedHintPill = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IPreferencesService),
  __decorateParam(4, IContextKeyService)
], LinkOpenedHintPill);

BrowserEditor.registerContribution(LinkOpenedHintPill);

var BrowserTabUrlSuggestions = class extends BrowserEditorContribution {
  constructor(editor, _browserViewService, _editorService, _editorGroupsService, _configurationService) {
    super(editor);
    this._browserViewService = _browserViewService;
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    this._configurationService = _configurationService;
    this._onDidChange = this._register(new Emitter());
    this._groupListeners = this._register(new DisposableMap());
    this._editorLabelListeners = this._register(new DisposableMap());
    for (const group2 of this._editorGroupsService.getGroups(2 /* GRID_APPEARANCE */)) {
      this._trackGroup(group2);
    }
    this._register(this._editorGroupsService.onDidAddGroup((group2) => {
      this._trackGroup(group2);
      this._onDidChange.fire();
    }));
    this._register(this._editorGroupsService.onDidRemoveGroup((group2) => {
      this._groupListeners.deleteAndDispose(group2.id);
      this._onDidChange.fire();
    }));
    this._register(this._editorGroupsService.onDidMoveGroup(() => this._onDidChange.fire()));
    this._register(this._editorGroupsService.onDidChangeGroupIndex(() => this._onDidChange.fire()));
    this._refreshEditorLabelListeners();
    this._register(this._browserViewService.onDidChangeBrowserViews(() => {
      this._refreshEditorLabelListeners();
      this._onDidChange.fire();
    }));
    this._provider = {
      label: localize(8199, null),
      description: localize(8200, null),
      order: 100,
      actions: [],
      onDidChange: this._onDidChange.event,
      getSuggestions: async ({ input }) => {
        if (input.url) {
          return [];
        }
        if (input.model?.storageScope === "ephemeral" /* Ephemeral */) {
          return [];
        }
        return this._collectSuggestions(input);
      }
    };
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(BRIDGE_QUICK_LINKS_SETTING)) {
        this._onDidChange.fire();
      }
    }));
    this._quickLinksProvider = {
      label: localize(8202, null),
      description: localize(8203, null),
      order: 50,
      onDidChange: this._onDidChange.event,
      getSuggestions: async ({ input }) => {
        if (input.url || input.model?.storageScope !== "ephemeral" /* Ephemeral */) {
          return [];
        }
        return readQuickLinks(this._configurationService).filter((link2) => isValidQuickLinkUrl(link2.url)).map((link2, index2) => ({
          id: `opencode-quick-link-${index2}-${link2.url}`,
          label: link2.name,
          description: link2.url,
          icon: Codicon.globe,
          apply: async (source) => {
            source.navigate(link2.url);
          }
        }));
      }
    };
  }
  get urlSuggestionProviders() {
    return [this._quickLinksProvider, this._provider];
  }
  _trackGroup(group2) {
    this._groupListeners.set(group2.id, group2.onDidModelChange(() => this._onDidChange.fire()));
  }
  _refreshEditorLabelListeners() {
    const known = this._browserViewService.getContextualBrowserViews();
    for (const id2 of [...this._editorLabelListeners.keys()]) {
      if (!known.has(id2)) {
        this._editorLabelListeners.deleteAndDispose(id2);
      }
    }
    for (const [id2, editor] of known) {
      if (!this._editorLabelListeners.has(id2)) {
        this._editorLabelListeners.set(id2, editor.onDidChangeLabel(() => this._onDidChange.fire()));
      }
    }
  }
  /**
   * Return tabs in editor-group visibility order (grid appearance, then
   * within-group editor order), with background tabs (known but not open
   * in any group) appended at the end. Excludes the editor's own input.
   */
  _collectSuggestions(input) {
    const ordered = [];
    const seen = /* @__PURE__ */ new Set();
    for (const group2 of this._editorGroupsService.getGroups(2 /* GRID_APPEARANCE */)) {
      for (const editor of group2.editors) {
        if (editor instanceof BrowserEditorInput && !seen.has(editor.id)) {
          seen.add(editor.id);
          ordered.push(editor);
        }
      }
    }
    for (const tab of this._browserViewService.getContextualBrowserViews().values()) {
      if (!seen.has(tab.id)) {
        seen.add(tab.id);
        ordered.push(tab);
      }
    }
    const suggestions = [];
    for (const tab of ordered) {
      if (tab === input) {
        continue;
      }
      const rawIcon = tab.getIcon();
      suggestions.push({
        id: tab.id,
        label: tab.getName(),
        description: tab.getDescription(),
        icon: rawIcon instanceof URI ? void 0 : rawIcon,
        iconPath: rawIcon instanceof URI ? { dark: rawIcon } : void 0,
        apply: (source) => this._switchToTab(source, tab)
      });
    }
    return suggestions;
  }
  /**
   * Close {@link source} and focus {@link target} where it already lives.
   *
   * The navbar's picker-hide handler synchronously calls
   * `ensureBrowserFocus()` on the source editor before any of our awaits
   * resolve, so we have to explicitly refocus the target group after the
   * editor service operations complete — otherwise focus snaps back to
   * the (about-to-close) source's window.
   */
  async _switchToTab(source, target) {
    if (source === target) {
      await this._editorService.openEditor(target);
      return;
    }
    const sourceGroup = this._editorGroupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).find((g) => g.contains(source));
    if (sourceGroup) {
      await sourceGroup.closeEditor(source, { preserveFocus: true });
    }
    await this._editorService.openEditor(target);
  }
};

BrowserTabUrlSuggestions = __decorateClass([
  __decorateParam(1, IBrowserViewWorkbenchService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IConfigurationService)
], BrowserTabUrlSuggestions);

BrowserEditor.registerContribution(BrowserTabUrlSuggestions);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.browser.showInTitleBar": {
      type: ["boolean", "string"],
      enum: [true, false, "whenOpen"],
      enumDescriptions: [
        localize(8207, null),
        localize(8206, null),
        localize(8208, null)
      ],
      default: "whenOpen",
      experiment: { mode: "startup" },
      description: localize(
        8205,
        null
      )
    },
    "workbench.browser.openLocalhostLinks": {
      type: "boolean",
      default: false,
      experiment: { mode: "startup" },
      markdownDescription: localize(
        8194,
        null
      ),
      agentsWindow: { default: true }
    },
    [BrowserNewTabPlacementSettingId]: {
      type: "string",
      enum: ["activeGroup", "sideGroup", "window"],
      enumDescriptions: [
        localize(8187, null),
        localize(8188, null),
        localize(8189, null)
      ],
      default: "activeGroup",
      markdownDescription: localize(
        8186,
        null
      ),
      scope: 4 /* WINDOW */
    }
  }
});
export { CONTEXT_BROWSER_EDITOR_OPEN, closeButtonItem, closeAllButtonItem, BrowserTabQuickPick, QuickOpenBrowserAction, OpenIntegratedBrowserAction, OpenFileInIntegratedBrowserAction, NewTabAction, NewIncognitoTabAction, NewSecondAccountTabAction, CloseAllBrowserTabsAction, CloseAllBrowserTabsInGroupAction, OpenOrListBrowsersAction, BrowserEditorOpenContextKeyContribution, LocalhostLinkOpenerContribution, LOCALHOST_HINT_DISMISSED_KEY, LinkOpenedHintPill, BrowserTabUrlSuggestions };
