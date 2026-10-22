// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/titlebar/menubarControl.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, SubmenuItemAction, registerAction2 } from "./module-0092.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Action, ActionRunner, Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { isIOS, isMacintosh, isNative, isWeb } from "./module-0014.mjs";
import { getMenuBarVisibility, hasNativeMenu } from "./module-0515.mjs";
import { IWorkspacesService, isRecentFolder, isRecentWorkspace } from "./module-1378.mjs";
import { mnemonicMenuLabel, unmnemonicLabel } from "./module-0711.mjs";
import { truncateMiddle } from "./module-0030.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Emitter } from "./module-0017.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { OpenRecentAction } from "./module-1512.mjs";
import { isFullscreen, onDidChangeFullscreen } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { MenuBar } from "./module-3868.mjs";
import { defaultMenuStyles } from "./module-0513.mjs";
import { Dimension, EventType, addDisposableListener } from "./module-0075.mjs";
import { isICommandActionToggleInfo } from "./module-0505.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHostService } from "./module-1118.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/browser/parts/titlebar/menubarControl.ts
var MenubarControl = class _MenubarControl extends Disposable {
  constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService) {
    super();
    this.menuService = menuService;
    this.workspacesService = workspacesService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.labelService = labelService;
    this.updateService = updateService;
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.preferencesService = preferencesService;
    this.environmentService = environmentService;
    this.accessibilityService = accessibilityService;
    this.hostService = hostService;
    this.commandService = commandService;
    this.keys = [
      "window.menuBarVisibility" /* MenuBarVisibility */,
      "window.enableMenuBarMnemonics",
      "window.customMenuBarAltFocus",
      "workbench.sideBar.location",
      "window.nativeTabs"
    ];
    this.menus = {};
    this.topLevelTitles = {};
    this.recentlyOpened = { files: [], workspaces: [] };
    this.mainMenu = this._register(this.menuService.createMenu(MenuId.MenubarMainMenu, this.contextKeyService));
    this.mainMenuDisposables = this._register(new DisposableStore());
    this.setupMainMenu();
    this.menuUpdater = this._register(new RunOnceScheduler(() => this.doUpdateMenubar(false), 200));
    this.notifyUserOfCustomMenubarAccessibility();
  }
  static {
    this.MAX_MENU_RECENT_ENTRIES = 10;
  }
  static {
    this.MAX_MENU_RECENT_LABEL_LENGTH = 120;
  }
  registerListeners() {
    this._register(this.hostService.onDidChangeFocus((e4) => this.onDidChangeWindowFocus(e4)));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => this.onConfigurationUpdated(e4)));
    this._register(this.updateService.onStateChange(() => this.onUpdateStateChange()));
    this._register(this.workspacesService.onDidChangeRecentlyOpened(() => {
      this.onDidChangeRecentlyOpened();
    }));
    this._register(this.keybindingService.onDidUpdateKeybindings(() => this.updateMenubar()));
    this._register(this.labelService.onDidChangeFormatters(() => {
      this.onDidChangeRecentlyOpened();
    }));
    this._register(this.mainMenu.onDidChange(() => {
      this.setupMainMenu();
      this.doUpdateMenubar(true);
    }));
  }
  setupMainMenu() {
    this.mainMenuDisposables.clear();
    this.menus = {};
    this.topLevelTitles = {};
    const [, mainMenuActions] = this.mainMenu.getActions()[0];
    for (const mainMenuAction of mainMenuActions) {
      if (mainMenuAction instanceof SubmenuItemAction && typeof mainMenuAction.item.title !== "string") {
        this.menus[mainMenuAction.item.title.original] = this.mainMenuDisposables.add(this.menuService.createMenu(mainMenuAction.item.submenu, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
        this.topLevelTitles[mainMenuAction.item.title.original] = mainMenuAction.item.title.mnemonicTitle ?? mainMenuAction.item.title.value;
      }
    }
  }
  updateMenubar() {
    this.menuUpdater.schedule();
  }
  calculateActionLabel(action) {
    const label3 = action.label;
    switch (action.id) {
      default:
        break;
    }
    return label3;
  }
  onUpdateStateChange() {
    this.updateMenubar();
  }
  onUpdateKeybindings() {
    this.updateMenubar();
  }
  getOpenRecentActions() {
    if (!this.recentlyOpened) {
      return [];
    }
    const { workspaces, files } = this.recentlyOpened;
    const result = [];
    if (workspaces.length > 0) {
      for (let i2 = 0; i2 < _MenubarControl.MAX_MENU_RECENT_ENTRIES && i2 < workspaces.length; i2++) {
        result.push(this.createOpenRecentMenuAction(workspaces[i2]));
      }
      result.push(new Separator());
    }
    if (files.length > 0) {
      for (let i2 = 0; i2 < _MenubarControl.MAX_MENU_RECENT_ENTRIES && i2 < files.length; i2++) {
        result.push(this.createOpenRecentMenuAction(files[i2]));
      }
      result.push(new Separator());
    }
    return result;
  }
  onDidChangeWindowFocus(hasFocus) {
    if (hasFocus) {
      this.onDidChangeRecentlyOpened();
    }
  }
  onConfigurationUpdated(event) {
    if (this.keys.some((key3) => event.affectsConfiguration(key3))) {
      this.updateMenubar();
    }
    if (event.affectsConfiguration("editor.accessibilitySupport")) {
      this.notifyUserOfCustomMenubarAccessibility();
    }
    if (event.affectsConfiguration("window.menuBarVisibility" /* MenuBarVisibility */)) {
      this.onDidChangeRecentlyOpened();
    }
  }
  get menubarHidden() {
    return isMacintosh && isNative ? false : getMenuBarVisibility(this.configurationService) === "hidden";
  }
  onDidChangeRecentlyOpened() {
    if (!this.menubarHidden) {
      this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
        this.recentlyOpened = recentlyOpened;
        this.updateMenubar();
      });
    }
  }
  createOpenRecentMenuAction(recent) {
    let label3;
    let uri4;
    let commandId;
    let openable;
    const remoteAuthority = recent.remoteAuthority;
    if (isRecentFolder(recent)) {
      uri4 = recent.folderUri;
      label3 = recent.label || this.labelService.getWorkspaceLabel(uri4, { verbose: 2 /* LONG */ });
      commandId = "openRecentFolder";
      openable = { folderUri: uri4 };
    } else if (isRecentWorkspace(recent)) {
      uri4 = recent.workspace.configPath;
      label3 = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* LONG */ });
      commandId = "openRecentWorkspace";
      openable = { workspaceUri: uri4 };
    } else {
      uri4 = recent.fileUri;
      label3 = recent.label || this.labelService.getUriLabel(uri4, { appendWorkspaceSuffix: true });
      commandId = "openRecentFile";
      openable = { fileUri: uri4 };
    }
    const ret = toAction({
      id: commandId,
      label: unmnemonicLabel(truncateMiddle(label3, _MenubarControl.MAX_MENU_RECENT_LABEL_LENGTH)),
      run: (browserEvent) => {
        const openInNewWindow = browserEvent && (!isMacintosh && (browserEvent.ctrlKey || browserEvent.shiftKey) || isMacintosh && (browserEvent.metaKey || browserEvent.altKey));
        return this.hostService.openWindow([openable], {
          forceNewWindow: !!openInNewWindow,
          remoteAuthority: remoteAuthority || null
          // local window if remoteAuthority is not set or can not be deducted from the openable
        });
      }
    });
    return Object.assign(ret, { uri: uri4, remoteAuthority });
  }
  notifyUserOfCustomMenubarAccessibility() {
    if (isWeb || isMacintosh) {
      return;
    }
    const hasBeenNotified = this.storageService.getBoolean("menubar/accessibleMenubarNotified", -1 /* APPLICATION */, false);
    const usingCustomMenubar = !hasNativeMenu(this.configurationService);
    if (hasBeenNotified || usingCustomMenubar || !this.accessibilityService.isScreenReaderOptimized()) {
      return;
    }
    const message = localize(6939, null);
    this.notificationService.prompt(Severity2.Info, message, [
      {
        label: localize(6936, null),
        run: () => {
          return this.preferencesService.openUserSettings({ query: "window.menuStyle" /* MenuStyle */ });
        }
      }
    ]);
    this.storageService.store("menubar/accessibleMenubarNotified", true, -1 /* APPLICATION */, 0 /* USER */);
  }
};

var focusMenuBarEmitter = void 0;

function enableFocusMenuBarAction() {
  if (!focusMenuBarEmitter) {
    focusMenuBarEmitter = new Emitter();
    registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.menubar.focus`,
          title: localize2(6935, "Focus Application Menu"),
          keybinding: {
            primary: 512 /* Alt */ | 68 /* F10 */,
            weight: 200 /* WorkbenchContrib */,
            when: IsWebContext
          },
          f1: true
        });
      }
      async run() {
        focusMenuBarEmitter?.fire();
      }
    });
  }
  return focusMenuBarEmitter;
}

var CustomMenubarControl = class extends MenubarControl {
  constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, telemetryService, hostService, commandService) {
    super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
    this.telemetryService = telemetryService;
    this.alwaysOnMnemonics = false;
    this.focusInsideMenubar = false;
    this.pendingFirstTimeUpdate = false;
    this.visible = true;
    this.webNavigationMenu = this._register(this.menuService.createMenu(MenuId.MenubarHomeMenu, this.contextKeyService));
    this.reinstallDisposables = this._register(new DisposableStore());
    this.updateActionsDisposables = this._register(new DisposableStore());
    this._onVisibilityChange = this._register(new Emitter());
    this._onFocusStateChange = this._register(new Emitter());
    this.actionRunner = this._register(new ActionRunner());
    this._register(this.actionRunner.onDidRun((e4) => {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: e4.action.id, from: "menu" });
    }));
    this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
      this.recentlyOpened = recentlyOpened;
    });
    this.registerListeners();
  }
  doUpdateMenubar(firstTime) {
    if (!this.focusInsideMenubar) {
      this.setupCustomMenubar(firstTime);
    }
    if (firstTime) {
      this.pendingFirstTimeUpdate = true;
    }
  }
  getUpdateAction() {
    const state = this.updateService.state;
    switch (state.type) {
      case "idle" /* Idle */:
        return toAction({
          id: "update.check",
          label: localize(6931, null),
          enabled: true,
          run: () => this.updateService.checkForUpdates(true)
        });
      case "checking for updates" /* CheckingForUpdates */:
        return toAction({ id: "update.checking", label: localize(6932, null), enabled: false, run: () => {
        } });
      case "available for download" /* AvailableForDownload */:
        return toAction({
          id: "update.downloadNow",
          label: localize(6933, null),
          enabled: true,
          run: () => this.updateService.downloadUpdate(true)
        });
      case "downloading" /* Downloading */:
      case "overwriting" /* Overwriting */:
        return toAction({ id: "update.downloading", label: localize(6934, null), enabled: false, run: () => {
        } });
      case "downloaded" /* Downloaded */:
        return isMacintosh ? null : toAction({
          id: "update.install",
          label: localize(6938, null),
          enabled: true,
          run: () => this.updateService.applyUpdate()
        });
      case "updating" /* Updating */:
        return toAction({ id: "update.updating", label: localize(6937, null), enabled: false, run: () => {
        } });
      case "cancelling" /* Cancelling */:
        return toAction({ id: "update.cancelling", label: localize(6930, null), enabled: false, run: () => {
        } });
      case "ready" /* Ready */:
        return toAction({
          id: "update.restart",
          label: localize(6940, null),
          enabled: true,
          run: () => this.updateService.quitAndInstall()
        });
      default:
        return null;
    }
  }
  get currentMenubarVisibility() {
    return getMenuBarVisibility(this.configurationService);
  }
  get currentDisableMenuBarAltFocus() {
    const settingValue = this.configurationService.getValue("window.customMenuBarAltFocus");
    let disableMenuBarAltBehavior = false;
    if (typeof settingValue === "boolean") {
      disableMenuBarAltBehavior = !settingValue;
    }
    return disableMenuBarAltBehavior;
  }
  insertActionsBefore(nextAction, target) {
    switch (nextAction.id) {
      case OpenRecentAction.ID:
        target.push(...this.getOpenRecentActions());
        break;
      case "workbench.action.showAboutDialog":
        if (!isMacintosh && !isWeb) {
          const updateAction = this.getUpdateAction();
          if (updateAction) {
            updateAction.label = mnemonicMenuLabel(updateAction.label);
            target.push(updateAction);
            target.push(new Separator());
          }
        }
        break;
      default:
        break;
    }
  }
  get currentEnableMenuBarMnemonics() {
    let enableMenuBarMnemonics = this.configurationService.getValue("window.enableMenuBarMnemonics");
    if (typeof enableMenuBarMnemonics !== "boolean") {
      enableMenuBarMnemonics = true;
    }
    return enableMenuBarMnemonics && (!isWeb || isFullscreen(mainWindow));
  }
  get currentCompactMenuMode() {
    if (this.currentMenubarVisibility !== "compact") {
      return void 0;
    }
    const currentSidebarLocation = this.configurationService.getValue("workbench.sideBar.location");
    const horizontalDirection = currentSidebarLocation === "right" ? 1 /* Left */ : 0 /* Right */;
    const activityBarLocation = this.configurationService.getValue("workbench.activityBar.location");
    const verticalDirection = activityBarLocation === "bottom" /* BOTTOM */ ? 0 /* Above */ : 1 /* Below */;
    return { horizontal: horizontalDirection, vertical: verticalDirection };
  }
  onDidVisibilityChange(visible) {
    this.visible = visible;
    this.onDidChangeRecentlyOpened();
    this._onVisibilityChange.fire(visible);
  }
  toActionsArray(menu) {
    return getFlatContextMenuActions(menu.getActions({ shouldForwardArgs: true }));
  }
  setupCustomMenubar(firstTime) {
    if (!this.container) {
      return;
    }
    if (firstTime) {
      if (this.menubar) {
        this.reinstallDisposables.clear();
      }
      this.menubar = this.reinstallDisposables.add(new MenuBar(this.container, this.getMenuBarOptions(), defaultMenuStyles));
      this.accessibilityService.alwaysUnderlineAccessKeys().then((val) => {
        this.alwaysOnMnemonics = val;
        this.menubar?.update(this.getMenuBarOptions());
      });
      this.reinstallDisposables.add(this.menubar.onFocusStateChange((focused) => {
        this._onFocusStateChange.fire(focused);
        if (!focused) {
          if (this.pendingFirstTimeUpdate) {
            this.setupCustomMenubar(true);
            this.pendingFirstTimeUpdate = false;
          } else {
            this.updateMenubar();
          }
          this.focusInsideMenubar = false;
        }
      }));
      this.reinstallDisposables.add(this.menubar.onVisibilityChange((e4) => this.onDidVisibilityChange(e4)));
      this.reinstallDisposables.add(addDisposableListener(this.container, EventType.FOCUS_IN, () => {
        this.focusInsideMenubar = true;
      }));
      this.reinstallDisposables.add(addDisposableListener(this.container, EventType.FOCUS_OUT, () => {
        this.focusInsideMenubar = false;
      }));
      if (this.menubar.isVisible) {
        this.onDidVisibilityChange(true);
      }
    } else {
      this.menubar?.update(this.getMenuBarOptions());
    }
    const updateActions = (menuActions, target, topLevelTitle, store) => {
      target.splice(0);
      for (const menuItem of menuActions) {
        this.insertActionsBefore(menuItem, target);
        if (menuItem instanceof Separator) {
          target.push(menuItem);
        } else if (menuItem instanceof SubmenuItemAction || menuItem instanceof MenuItemAction) {
          let title = typeof menuItem.item.title === "string" ? menuItem.item.title : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
          if (menuItem instanceof SubmenuItemAction) {
            const submenuActions = [];
            updateActions(menuItem.actions, submenuActions, topLevelTitle, store);
            if (submenuActions.length > 0) {
              target.push(new SubmenuAction(menuItem.id, mnemonicMenuLabel(title), submenuActions));
            }
          } else {
            if (isICommandActionToggleInfo(menuItem.item.toggled)) {
              title = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
            }
            const newAction = store.add(new Action(menuItem.id, mnemonicMenuLabel(title), menuItem.class, menuItem.enabled, () => this.commandService.executeCommand(menuItem.id)));
            newAction.tooltip = menuItem.tooltip;
            newAction.checked = menuItem.checked;
            target.push(newAction);
          }
        }
      }
      if (topLevelTitle === "File" && this.currentCompactMenuMode === void 0) {
        const webActions = this.getWebNavigationActions();
        if (webActions.length) {
          target.push(...webActions);
        }
      }
    };
    for (const title of Object.keys(this.topLevelTitles)) {
      const menu = this.menus[title];
      if (firstTime && menu) {
        const menuChangedDisposable = this.reinstallDisposables.add(new DisposableStore());
        this.reinstallDisposables.add(menu.onDidChange(() => {
          if (!this.focusInsideMenubar) {
            const actions2 = [];
            menuChangedDisposable.clear();
            updateActions(this.toActionsArray(menu), actions2, title, menuChangedDisposable);
            this.menubar?.updateMenu({ actions: actions2, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
          }
        }));
        if (menu === this.menus.File) {
          const webMenuChangedDisposable = this.reinstallDisposables.add(new DisposableStore());
          this.reinstallDisposables.add(this.webNavigationMenu.onDidChange(() => {
            if (!this.focusInsideMenubar) {
              const actions2 = [];
              webMenuChangedDisposable.clear();
              updateActions(this.toActionsArray(menu), actions2, title, webMenuChangedDisposable);
              this.menubar?.updateMenu({ actions: actions2, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
            }
          }));
        }
      }
      const actions = [];
      if (menu) {
        this.updateActionsDisposables.clear();
        updateActions(this.toActionsArray(menu), actions, title, this.updateActionsDisposables);
      }
      if (this.menubar) {
        if (!firstTime) {
          this.menubar.updateMenu({ actions, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
        } else {
          this.menubar.push({ actions, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
        }
      }
    }
  }
  getWebNavigationActions() {
    if (!isWeb) {
      return [];
    }
    const webNavigationActions = [];
    for (const groups of this.webNavigationMenu.getActions()) {
      const [, actions] = groups;
      for (const action of actions) {
        if (action instanceof MenuItemAction) {
          const title = typeof action.item.title === "string" ? action.item.title : action.item.title.mnemonicTitle ?? action.item.title.value;
          webNavigationActions.push(toAction({
            id: action.id,
            label: mnemonicMenuLabel(title),
            class: action.class,
            enabled: action.enabled,
            run: async (event) => {
              this.commandService.executeCommand(action.id, event);
            }
          }));
        }
      }
      webNavigationActions.push(new Separator());
    }
    if (webNavigationActions.length) {
      webNavigationActions.pop();
    }
    return webNavigationActions;
  }
  getMenuBarOptions() {
    return {
      enableMnemonics: this.currentEnableMenuBarMnemonics,
      disableAltFocus: this.currentDisableMenuBarAltFocus,
      visibility: this.currentMenubarVisibility,
      actionRunner: this.actionRunner,
      getKeybinding: (action) => this.keybindingService.lookupKeybinding(action.id),
      alwaysOnMnemonics: this.alwaysOnMnemonics,
      compactMode: this.currentCompactMenuMode,
      getCompactMenuActions: () => {
        if (!isWeb) {
          return [];
        }
        return this.getWebNavigationActions();
      }
    };
  }
  onDidChangeWindowFocus(hasFocus) {
    if (!this.visible) {
      return;
    }
    super.onDidChangeWindowFocus(hasFocus);
    if (this.container) {
      if (hasFocus) {
        this.container.classList.remove("inactive");
        this.menubar?.resetFocus();
      } else {
        this.container.classList.add("inactive");
        this.menubar?.blur();
      }
    }
  }
  onUpdateStateChange() {
    if (!this.visible) {
      return;
    }
    super.onUpdateStateChange();
  }
  onDidChangeRecentlyOpened() {
    if (!this.visible) {
      return;
    }
    super.onDidChangeRecentlyOpened();
  }
  onUpdateKeybindings() {
    if (!this.visible) {
      return;
    }
    super.onUpdateKeybindings();
  }
  registerListeners() {
    super.registerListeners();
    this._register(addDisposableListener(mainWindow, EventType.RESIZE, () => {
      if (this.menubar && !(isIOS && BrowserFeatures.pointerEvents)) {
        this.menubar.blur();
      }
    }));
    if (isWeb) {
      this._register(onDidChangeFullscreen((windowId) => {
        if (windowId === mainWindow.vscodeWindowId) {
          this.updateMenubar();
        }
      }));
      this._register(this.webNavigationMenu.onDidChange(() => this.updateMenubar()));
      this._register(enableFocusMenuBarAction().event(() => this.menubar?.toggleFocus()));
    }
  }
  get onVisibilityChange() {
    return this._onVisibilityChange.event;
  }
  get onFocusStateChange() {
    return this._onFocusStateChange.event;
  }
  getMenubarItemsDimensions() {
    if (this.menubar) {
      return new Dimension(this.menubar.getWidth(), this.menubar.getHeight());
    }
    return new Dimension(0, 0);
  }
  create(parent) {
    this.container = parent;
    if (this.container) {
      this.doUpdateMenubar(true);
    }
    return this.container;
  }
  layout(dimension) {
    this.menubar?.update(this.getMenuBarOptions());
  }
  toggleFocus() {
    this.menubar?.toggleFocus();
  }
};

CustomMenubarControl = __decorateClass([
  __decorateParam(0, IMenuService),
  __decorateParam(1, IWorkspacesService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IUpdateService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IPreferencesService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IHostService),
  __decorateParam(14, ICommandService)
], CustomMenubarControl);
export { enableFocusMenuBarAction, MenubarControl, focusMenuBarEmitter, CustomMenubarControl };
