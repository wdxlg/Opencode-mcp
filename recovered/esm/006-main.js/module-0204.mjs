// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/menubar/electron-main/menubar.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { RunOnceScheduler, init_async } from "./module-0034.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { init_labels, mnemonicMenuLabel } from "./module-0048.mjs";
import { init_platform, isMacintosh, language } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IAuxiliaryWindowsMainService, init_auxiliaryWindows } from "./module-0140.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_menubar, isMenubarMenuItemAction, isMenubarMenuItemRecentAction, isMenubarMenuItemSeparator, isMenubarMenuItemSubmenu } from "./module-0200.mjs";
import { INativeHostMainService, init_nativeHostMainService } from "./module-0156.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { IUpdateService, init_update } from "./module-0201.mjs";
import { hasNativeMenu, init_window } from "./module-0096.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { IWorkspacesHistoryMainService, init_workspacesHistoryMainService } from "./module-0203.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/menubar/electron-main/menubar.ts
import { app as app8, BrowserWindow as BrowserWindow4, Menu as Menu4, MenuItem as MenuItem3 } from "electron";

function __separator__() {
  return new MenuItem3({ type: "separator" });
}

var telemetryFrom, Menubar;

var init_menubar2 = __esm({
  "src/vs/platform/menubar/electron-main/menubar.ts"() {
    init_async();
    init_cancellation();
    init_labels();
    init_platform();
    init_uri();
    init_nls();
    init_auxiliaryWindows();
    init_configuration();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_menubar();
    init_nativeHostMainService();
    init_productService();
    init_state();
    init_telemetry();
    init_update();
    init_window();
    init_windows();
    init_workspacesHistoryMainService();
    init_lifecycle();
    telemetryFrom = "menu";
    Menubar = class extends Disposable {
      constructor(updateService, configurationService, windowsMainService, environmentMainService, telemetryService, workspacesHistoryMainService, stateService, lifecycleMainService, logService, nativeHostMainService, productService, auxiliaryWindowsMainService) {
        super();
        this.updateService = updateService;
        this.configurationService = configurationService;
        this.windowsMainService = windowsMainService;
        this.environmentMainService = environmentMainService;
        this.telemetryService = telemetryService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.stateService = stateService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.nativeHostMainService = nativeHostMainService;
        this.productService = productService;
        this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
        this.fallbackMenuHandlers = /* @__PURE__ */ Object.create(null);
        this.menuUpdater = this._register(new RunOnceScheduler(() => this.doUpdateMenu(), 0));
        this.menuGC = this._register(new RunOnceScheduler(() => {
          this.oldMenus = [];
        }, 1e4));
        this.menubarMenus = /* @__PURE__ */ Object.create(null);
        this.keybindings = /* @__PURE__ */ Object.create(null);
        this.showNativeMenu = hasNativeMenu(configurationService);
        if (isMacintosh || this.showNativeMenu) {
          this.restoreCachedMenubarData();
        }
        this.addFallbackHandlers();
        this.closedLastWindow = false;
        this.noActiveMainWindow = false;
        this.oldMenus = [];
        this.install();
        this.registerListeners();
      }
      static {
        this.lastKnownMenubarStorageKey = "lastKnownMenubarData";
      }
      restoreCachedMenubarData() {
        const menubarData = this.stateService.getItem(Menubar.lastKnownMenubarStorageKey);
        if (menubarData) {
          if (menubarData.menus) {
            this.menubarMenus = menubarData.menus;
          }
          if (menubarData.keybindings) {
            this.keybindings = menubarData.keybindings;
          }
        }
      }
      addFallbackHandlers() {
        this.fallbackMenuHandlers["workbench.action.files.newUntitledFile"] = (menuItem, win, event) => {
          if (!this.runActionInRenderer({ type: "commandId", commandId: "workbench.action.files.newUntitledFile" })) {
            this.windowsMainService.openEmptyWindow({ context: 2 /* MENU */, contextWindowId: win?.id });
          }
        };
        this.fallbackMenuHandlers["workbench.action.newWindow"] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* MENU */, contextWindowId: win?.id });
        this.fallbackMenuHandlers["workbench.action.files.openFileFolder"] = (menuItem, win, event) => this.nativeHostMainService.pickFileFolderAndOpen(void 0, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
        this.fallbackMenuHandlers["workbench.action.files.openFolder"] = (menuItem, win, event) => this.nativeHostMainService.pickFolderAndOpen(void 0, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
        this.fallbackMenuHandlers["workbench.action.openWorkspace"] = (menuItem, win, event) => this.nativeHostMainService.pickWorkspaceAndOpen(void 0, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
        this.fallbackMenuHandlers["workbench.action.clearRecentFiles"] = () => this.workspacesHistoryMainService.clearRecentlyOpened({
          confirm: true
          /* ask for confirmation */
        });
        const youTubeUrl = this.productService.youTubeUrl;
        if (youTubeUrl) {
          this.fallbackMenuHandlers["workbench.action.openYouTubeUrl"] = () => this.openUrl(youTubeUrl, "openYouTubeUrl");
        }
        const requestFeatureUrl = this.productService.requestFeatureUrl;
        if (requestFeatureUrl) {
          this.fallbackMenuHandlers["workbench.action.openRequestFeatureUrl"] = () => this.openUrl(requestFeatureUrl, "openUserVoiceUrl");
        }
        const reportIssueUrl = this.productService.reportIssueUrl;
        if (reportIssueUrl) {
          this.fallbackMenuHandlers["workbench.action.openIssueReporter"] = () => this.openUrl(reportIssueUrl, "openReportIssues");
        }
        const licenseUrl = this.productService.licenseUrl;
        if (licenseUrl) {
          this.fallbackMenuHandlers["workbench.action.openLicenseUrl"] = () => {
            if (language) {
              const queryArgChar = licenseUrl.indexOf("?") > 0 ? "&" : "?";
              this.openUrl(`${licenseUrl}${queryArgChar}lang=${language}`, "openLicenseUrl");
            } else {
              this.openUrl(licenseUrl, "openLicenseUrl");
            }
          };
        }
        const privacyStatementUrl = this.productService.privacyStatementUrl;
        if (privacyStatementUrl && licenseUrl) {
          this.fallbackMenuHandlers["workbench.action.openPrivacyStatementUrl"] = () => {
            this.openUrl(privacyStatementUrl, "openPrivacyStatement");
          };
        }
      }
      registerListeners() {
        this._register(this.lifecycleMainService.onWillShutdown(() => this.willShutdown = true));
        this._register(this.windowsMainService.onDidChangeWindowsCount((e) => this.onDidChangeWindowsCount(e)));
        this._register(this.nativeHostMainService.onDidBlurMainWindow(() => this.onDidChangeWindowFocus()));
        this._register(this.nativeHostMainService.onDidFocusMainWindow(() => this.onDidChangeWindowFocus()));
        this._register(this.updateService.onStateChange(() => this.scheduleUpdateMenu()));
      }
      get currentEnableMenuBarMnemonics() {
        const enableMenuBarMnemonics = this.configurationService.getValue("window.enableMenuBarMnemonics");
        if (typeof enableMenuBarMnemonics !== "boolean") {
          return true;
        }
        return enableMenuBarMnemonics;
      }
      get currentEnableNativeTabs() {
        if (!isMacintosh) {
          return false;
        }
        const enableNativeTabs = this.configurationService.getValue("window.nativeTabs");
        if (typeof enableNativeTabs !== "boolean") {
          return false;
        }
        return enableNativeTabs;
      }
      updateMenu(menubarData, windowId) {
        this.menubarMenus = menubarData.menus;
        this.keybindings = menubarData.keybindings;
        this.stateService.setItem(Menubar.lastKnownMenubarStorageKey, menubarData);
        this.scheduleUpdateMenu();
      }
      scheduleUpdateMenu() {
        this.menuUpdater.schedule();
      }
      doUpdateMenu() {
        if (!this.willShutdown) {
          setTimeout(
            () => {
              if (!this.willShutdown) {
                this.install();
              }
            },
            10
            /* delay this because there is an issue with updating a menu when it is open */
          );
        }
      }
      onDidChangeWindowsCount(e) {
        if (!isMacintosh) {
          return;
        }
        if (e.oldCount === 0 && e.newCount > 0 || e.oldCount > 0 && e.newCount === 0) {
          this.closedLastWindow = e.newCount === 0;
          this.scheduleUpdateMenu();
        }
      }
      onDidChangeWindowFocus() {
        if (!isMacintosh) {
          return;
        }
        const focusedWindow = BrowserWindow4.getFocusedWindow();
        this.noActiveMainWindow = !focusedWindow || !!this.auxiliaryWindowsMainService.getWindowByWebContents(focusedWindow.webContents);
        this.scheduleUpdateMenu();
      }
      install() {
        const oldMenu = Menu4.getApplicationMenu();
        if (oldMenu) {
          this.oldMenus.push(oldMenu);
        }
        if (Object.keys(this.menubarMenus).length === 0) {
          this.doSetApplicationMenu(isMacintosh ? new Menu4() : null);
          return;
        }
        const menubar = new Menu4();
        let macApplicationMenuItem;
        if (isMacintosh) {
          const applicationMenu = new Menu4();
          macApplicationMenuItem = new MenuItem3({ label: this.productService.nameShort, submenu: applicationMenu });
          this.setMacApplicationMenu(applicationMenu);
          menubar.append(macApplicationMenuItem);
        }
        if (isMacintosh && !this.appMenuInstalled) {
          this.appMenuInstalled = true;
          const dockMenu = new Menu4();
          dockMenu.append(new MenuItem3({ label: this.mnemonicLabel(localize(3136, null)), click: () => this.windowsMainService.openEmptyWindow({ context: 1 /* DOCK */ }) }));
          app8.dock.setMenu(dockMenu);
        }
        if (this.shouldDrawMenu("File")) {
          const fileMenu = new Menu4();
          const fileMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3124, null)), submenu: fileMenu });
          this.setMenuById(fileMenu, "File");
          menubar.append(fileMenuItem);
        }
        if (this.shouldDrawMenu("Edit")) {
          const editMenu = new Menu4();
          const editMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3123, null)), submenu: editMenu });
          this.setMenuById(editMenu, "Edit");
          menubar.append(editMenuItem);
        }
        if (this.shouldDrawMenu("Selection")) {
          const selectionMenu = new Menu4();
          const selectionMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3146, null)), submenu: selectionMenu });
          this.setMenuById(selectionMenu, "Selection");
          menubar.append(selectionMenuItem);
        }
        if (this.shouldDrawMenu("View")) {
          const viewMenu = new Menu4();
          const viewMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3152, null)), submenu: viewMenu });
          this.setMenuById(viewMenu, "View");
          menubar.append(viewMenuItem);
        }
        if (this.shouldDrawMenu("Go")) {
          const gotoMenu = new Menu4();
          const gotoMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3125, null)), submenu: gotoMenu });
          this.setMenuById(gotoMenu, "Go");
          menubar.append(gotoMenuItem);
        }
        if (this.shouldDrawMenu("Run")) {
          const debugMenu = new Menu4();
          const debugMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3145, null)), submenu: debugMenu });
          this.setMenuById(debugMenu, "Run");
          menubar.append(debugMenuItem);
        }
        if (this.shouldDrawMenu("Terminal")) {
          const terminalMenu = new Menu4();
          const terminalMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3151, null)), submenu: terminalMenu });
          this.setMenuById(terminalMenu, "Terminal");
          menubar.append(terminalMenuItem);
        }
        let macWindowMenuItem;
        if (this.shouldDrawMenu("Window")) {
          const windowMenu = new Menu4();
          macWindowMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3153, null)), submenu: windowMenu, role: "window" });
          this.setMacWindowMenu(windowMenu);
        }
        if (macWindowMenuItem) {
          menubar.append(macWindowMenuItem);
        }
        if (this.shouldDrawMenu("Help")) {
          const helpMenu = new Menu4();
          const helpMenuItem = new MenuItem3({ label: this.mnemonicLabel(localize(3126, null)), submenu: helpMenu, role: "help" });
          this.setMenuById(helpMenu, "Help");
          menubar.append(helpMenuItem);
        }
        if (menubar.items && menubar.items.length > 0) {
          this.doSetApplicationMenu(menubar);
        } else {
          this.doSetApplicationMenu(null);
        }
        this.menuGC.schedule();
      }
      doSetApplicationMenu(menu) {
        Menu4.setApplicationMenu(menu);
        if (menu) {
          for (const window2 of this.auxiliaryWindowsMainService.getWindows()) {
            window2.win?.setMenu(null);
          }
        }
      }
      setMacApplicationMenu(macApplicationMenu) {
        const about = this.createMenuItem(localize(3121, null, this.productService.nameLong), "workbench.action.showAboutDialog");
        const checkForUpdates = this.getUpdateMenuItems();
        let preferences;
        if (this.shouldDrawMenu("Preferences")) {
          const preferencesMenu = new Menu4();
          this.setMenuById(preferencesMenu, "Preferences");
          preferences = new MenuItem3({ label: this.mnemonicLabel(localize(3137, null)), submenu: preferencesMenu });
        }
        const servicesMenu = new Menu4();
        const services = new MenuItem3({ label: localize(3147, null), role: "services", submenu: servicesMenu });
        const hide = new MenuItem3({ label: localize(3127, null, this.productService.nameLong), role: "hide", accelerator: "Command+H" });
        const hideOthers = new MenuItem3({ label: localize(3128, null), role: "hideOthers", accelerator: "Command+Alt+H" });
        const showAll = new MenuItem3({ label: localize(3148, null), role: "unhide" });
        const quit = new MenuItem3(this.likeAction("workbench.action.quit", {
          label: localize(3138, null, this.productService.nameLong),
          click: async (item, window2, event) => {
            const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
            if (this.windowsMainService.getWindowCount() === 0 || // allow to quit when no more windows are open
            !!BrowserWindow4.getFocusedWindow() || // allow to quit when window has focus (fix for https://github.com/microsoft/vscode/issues/39191)
            lastActiveWindow?.win?.isMinimized()) {
              const confirmed = await this.confirmBeforeQuit(event);
              if (confirmed) {
                this.nativeHostMainService.quit(void 0);
              }
            }
          }
        }));
        const actions = [about];
        actions.push(...checkForUpdates);
        if (preferences) {
          actions.push(...[
            __separator__(),
            preferences
          ]);
        }
        actions.push(...[
          __separator__(),
          services,
          __separator__(),
          hide,
          hideOthers,
          showAll,
          __separator__(),
          quit
        ]);
        actions.forEach((i) => macApplicationMenu.append(i));
      }
      async confirmBeforeQuit(event) {
        if (this.windowsMainService.getWindowCount() === 0) {
          return true;
        }
        const confirmBeforeClose = this.configurationService.getValue("window.confirmBeforeClose");
        if (confirmBeforeClose === "always" || confirmBeforeClose === "keyboardOnly" && this.isKeyboardEvent(event)) {
          const { response } = await this.nativeHostMainService.showMessageBox(this.windowsMainService.getFocusedWindow()?.id, {
            type: "question",
            buttons: [
              isMacintosh ? localize(3155, null) : localize(3120, null),
              localize(3119, null)
            ],
            message: isMacintosh ? localize(3157, null) : localize(3156, null)
          });
          return response === 0;
        }
        return true;
      }
      shouldDrawMenu(menuId) {
        if (!isMacintosh && !this.showNativeMenu) {
          return false;
        }
        switch (menuId) {
          case "File":
          case "Help":
            if (isMacintosh) {
              return this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow || this.windowsMainService.getWindowCount() > 0 && this.noActiveMainWindow || !!this.menubarMenus && !!this.menubarMenus[menuId];
            }
          case "Window":
            if (isMacintosh) {
              return this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow || this.windowsMainService.getWindowCount() > 0 && this.noActiveMainWindow || !!this.menubarMenus;
            }
          default:
            return this.windowsMainService.getWindowCount() > 0 && (!!this.menubarMenus && !!this.menubarMenus[menuId]);
        }
      }
      setMenu(menu, items) {
        items.forEach((item) => {
          if (isMenubarMenuItemSeparator(item)) {
            menu.append(__separator__());
          } else if (isMenubarMenuItemSubmenu(item)) {
            const submenu = new Menu4();
            const submenuItem = new MenuItem3({ label: this.mnemonicLabel(item.label), submenu });
            this.setMenu(submenu, item.submenu.items);
            menu.append(submenuItem);
          } else if (isMenubarMenuItemRecentAction(item)) {
            menu.append(this.createOpenRecentMenuItem(item));
          } else if (isMenubarMenuItemAction(item)) {
            if (item.id === "workbench.action.showAboutDialog") {
              this.insertCheckForUpdatesItems(menu);
            }
            if (isMacintosh) {
              if (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow || this.windowsMainService.getWindowCount() > 0 && this.noActiveMainWindow) {
                if (this.fallbackMenuHandlers[item.id]) {
                  menu.append(new MenuItem3(this.likeAction(item.id, { label: this.mnemonicLabel(item.label), click: this.fallbackMenuHandlers[item.id] })));
                } else {
                  menu.append(this.createMenuItem(item.label, item.id, false, item.checked));
                }
              } else {
                menu.append(this.createMenuItem(item.label, item.id, item.enabled !== false, !!item.checked));
              }
            } else {
              menu.append(this.createMenuItem(item.label, item.id, item.enabled !== false, !!item.checked));
            }
          }
        });
      }
      setMenuById(menu, menuId) {
        if (this.menubarMenus?.[menuId]) {
          this.setMenu(menu, this.menubarMenus[menuId].items);
        }
      }
      insertCheckForUpdatesItems(menu) {
        const updateItems = this.getUpdateMenuItems();
        if (updateItems.length) {
          updateItems.forEach((i) => menu.append(i));
          menu.append(__separator__());
        }
      }
      createOpenRecentMenuItem(item) {
        const revivedUri = URI.revive(item.uri);
        const commandId = item.id;
        const openable = commandId === "openRecentFile" ? { fileUri: revivedUri } : commandId === "openRecentWorkspace" ? { workspaceUri: revivedUri } : { folderUri: revivedUri };
        return new MenuItem3(this.likeAction(commandId, {
          label: item.label,
          click: async (menuItem, win, event) => {
            const openInNewWindow = this.isOptionClick(event);
            const success = (await this.windowsMainService.open({
              context: 2 /* MENU */,
              cli: this.environmentMainService.args,
              urisToOpen: [openable],
              forceNewWindow: openInNewWindow,
              gotoLineMode: false,
              remoteAuthority: item.remoteAuthority
            })).length > 0;
            if (!success) {
              await this.workspacesHistoryMainService.removeRecentlyOpened([revivedUri]);
            }
          }
        }, false));
      }
      isOptionClick(event) {
        return !!(event && (!isMacintosh && (event.ctrlKey || event.shiftKey) || isMacintosh && (event.metaKey || event.altKey)));
      }
      isKeyboardEvent(event) {
        return !!(event.triggeredByAccelerator || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
      }
      createRoleMenuItem(label, commandId, role) {
        const options = {
          label: this.mnemonicLabel(label),
          role,
          enabled: true
        };
        return new MenuItem3(this.withKeybinding(commandId, options));
      }
      setMacWindowMenu(macWindowMenu) {
        const minimize = new MenuItem3({ label: localize(3142, null), role: "minimize", accelerator: "Command+M", enabled: this.windowsMainService.getWindowCount() > 0 });
        const zoom = new MenuItem3({ label: localize(3154, null), role: "zoom", enabled: this.windowsMainService.getWindowCount() > 0 });
        const bringAllToFront = new MenuItem3({ label: localize(3122, null), role: "front", enabled: this.windowsMainService.getWindowCount() > 0 });
        const switchWindow = this.createMenuItem(localize(3140, null), "workbench.action.switchWindow");
        const nativeTabMenuItems = [];
        if (this.currentEnableNativeTabs) {
          nativeTabMenuItems.push(__separator__());
          nativeTabMenuItems.push(this.createMenuItem(localize(3144, null), "workbench.action.newWindowTab"));
          nativeTabMenuItems.push(this.createRoleMenuItem(localize(3150, null), "workbench.action.showPreviousWindowTab", "selectPreviousTab"));
          nativeTabMenuItems.push(this.createRoleMenuItem(localize(3149, null), "workbench.action.showNextWindowTab", "selectNextTab"));
          nativeTabMenuItems.push(this.createRoleMenuItem(localize(3143, null), "workbench.action.moveWindowTabToNewWindow", "moveTabToNewWindow"));
          nativeTabMenuItems.push(this.createRoleMenuItem(localize(3141, null), "workbench.action.mergeAllWindowTabs", "mergeAllWindows"));
        }
        [
          minimize,
          zoom,
          __separator__(),
          switchWindow,
          ...nativeTabMenuItems,
          __separator__(),
          bringAllToFront
        ].forEach((item) => macWindowMenu.append(item));
      }
      getUpdateMenuItems() {
        const state = this.updateService.state;
        switch (state.type) {
          case "idle" /* Idle */:
            return [new MenuItem3({
              label: this.mnemonicLabel(localize(3130, null)),
              click: () => setTimeout(() => {
                this.reportMenuActionTelemetry("CheckForUpdate");
                this.updateService.checkForUpdates(true);
              }, 0)
            })];
          case "checking for updates" /* CheckingForUpdates */:
            return [new MenuItem3({ label: localize(3131, null), enabled: false })];
          case "available for download" /* AvailableForDownload */:
            return [new MenuItem3({
              label: this.mnemonicLabel(localize(3133, null)),
              click: () => {
                this.updateService.downloadUpdate(true);
              }
            })];
          case "downloading" /* Downloading */:
          case "overwriting" /* Overwriting */:
            return [new MenuItem3({ label: localize(3132, null), enabled: false })];
          case "downloaded" /* Downloaded */:
            return isMacintosh ? [] : [new MenuItem3({
              label: this.mnemonicLabel(localize(3135, null)),
              click: () => {
                this.reportMenuActionTelemetry("InstallUpdate");
                this.updateService.applyUpdate();
              }
            })];
          case "updating" /* Updating */:
            return [new MenuItem3({ label: localize(3134, null), enabled: false })];
          case "cancelling" /* Cancelling */:
            return [new MenuItem3({ label: localize(3129, null), enabled: false })];
          case "ready" /* Ready */:
            return [new MenuItem3({
              label: this.mnemonicLabel(localize(3139, null)),
              click: () => {
                this.reportMenuActionTelemetry("RestartToUpdate");
                this.updateService.quitAndInstall();
              }
            })];
          default:
            return [];
        }
      }
      createMenuItem(labelOpt, commandId, enabledOpt, checkedOpt) {
        const label = this.mnemonicLabel(labelOpt);
        const click = (menuItem, window2, event) => {
          const userSettingsLabel = menuItem ? menuItem.userSettingsLabel : null;
          if (userSettingsLabel && event.triggeredByAccelerator) {
            this.runActionInRenderer({ type: "keybinding", userSettingsLabel });
          } else {
            this.runActionInRenderer({ type: "commandId", commandId });
          }
        };
        const enabled = typeof enabledOpt === "boolean" ? enabledOpt : this.windowsMainService.getWindowCount() > 0;
        const checked = typeof checkedOpt === "boolean" ? checkedOpt : false;
        const options = {
          label,
          click,
          enabled
        };
        if (checked) {
          options.type = "checkbox";
          options.checked = checked;
        }
        if (isMacintosh) {
          if (commandId === "editor.action.clipboardCutAction") {
            options.role = "cut";
          } else if (commandId === "editor.action.clipboardCopyAction") {
            options.role = "copy";
          } else if (commandId === "editor.action.clipboardPasteAction") {
            options.role = "paste";
          }
          if (commandId === "undo") {
            options.click = this.makeContextAwareClickHandler(click, {
              inDevTools: (devTools) => devTools.undo(),
              inNoWindow: () => Menu4.sendActionToFirstResponder("undo:")
            });
          } else if (commandId === "redo") {
            options.click = this.makeContextAwareClickHandler(click, {
              inDevTools: (devTools) => devTools.redo(),
              inNoWindow: () => Menu4.sendActionToFirstResponder("redo:")
            });
          } else if (commandId === "editor.action.selectAll") {
            options.click = this.makeContextAwareClickHandler(click, {
              inDevTools: (devTools) => devTools.selectAll(),
              inNoWindow: () => Menu4.sendActionToFirstResponder("selectAll:")
            });
          }
        }
        return new MenuItem3(this.withKeybinding(commandId, options));
      }
      makeContextAwareClickHandler(click, contextSpecificHandlers) {
        return (menuItem, win, event) => {
          const activeWindow = BrowserWindow4.getFocusedWindow();
          if (!activeWindow) {
            return contextSpecificHandlers.inNoWindow();
          }
          if (activeWindow.webContents.isDevToolsFocused() && activeWindow.webContents.devToolsWebContents) {
            return contextSpecificHandlers.inDevTools(activeWindow.webContents.devToolsWebContents);
          }
          if (!activeWindow.webContents.isFocused()) {
            return contextSpecificHandlers.inNoWindow();
          }
          click(menuItem, win || activeWindow, event);
        };
      }
      runActionInRenderer(invocation) {
        let activeBrowserWindow = BrowserWindow4.getFocusedWindow();
        if (activeBrowserWindow) {
          const auxiliaryWindowCandidate = this.auxiliaryWindowsMainService.getWindowByWebContents(activeBrowserWindow.webContents);
          if (auxiliaryWindowCandidate) {
            activeBrowserWindow = this.windowsMainService.getWindowById(auxiliaryWindowCandidate.parentId)?.win ?? null;
          }
        }
        if (!activeBrowserWindow) {
          const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
          if (lastActiveWindow?.win?.isMinimized()) {
            activeBrowserWindow = lastActiveWindow.win;
          }
        }
        const activeWindow = activeBrowserWindow ? this.windowsMainService.getWindowById(activeBrowserWindow.id) : void 0;
        if (activeWindow) {
          this.logService.trace("menubar#runActionInRenderer", invocation);
          if (isMacintosh && !this.environmentMainService.isBuilt && !activeWindow.isReady) {
            if (invocation.type === "commandId" && invocation.commandId === "workbench.action.toggleDevTools" || invocation.type !== "commandId" && invocation.userSettingsLabel === "alt+cmd+i") {
              return false;
            }
          }
          if (invocation.type === "commandId") {
            const runActionPayload = { id: invocation.commandId, from: "menu" };
            activeWindow.sendWhenReady("vscode:runAction", CancellationToken.None, runActionPayload);
          } else {
            const runKeybindingPayload = { userSettingsLabel: invocation.userSettingsLabel };
            activeWindow.sendWhenReady("vscode:runKeybinding", CancellationToken.None, runKeybindingPayload);
          }
          return true;
        } else {
          this.logService.trace("menubar#runActionInRenderer: no active window found", invocation);
          return false;
        }
      }
      withKeybinding(commandId, options) {
        const binding = typeof commandId === "string" ? this.keybindings[commandId] : void 0;
        if (binding?.label) {
          if (binding.isNative !== false) {
            options.accelerator = binding.label;
            options.userSettingsLabel = binding.userSettingsLabel;
          } else if (typeof options.label === "string") {
            const bindingIndex = options.label.indexOf("[");
            if (bindingIndex >= 0) {
              options.label = `${options.label.substr(0, bindingIndex)} [${binding.label}]`;
            } else {
              options.label = `${options.label} [${binding.label}]`;
            }
          }
        } else {
          options.accelerator = void 0;
        }
        return options;
      }
      likeAction(commandId, options, setAccelerator = !options.accelerator) {
        if (setAccelerator) {
          options = this.withKeybinding(commandId, options);
        }
        const originalClick = options.click;
        options.click = (item, window2, event) => {
          this.reportMenuActionTelemetry(commandId);
          originalClick?.(item, window2, event);
        };
        return options;
      }
      openUrl(url, id2) {
        this.nativeHostMainService.openExternal(void 0, url);
        this.reportMenuActionTelemetry(id2);
      }
      reportMenuActionTelemetry(id2) {
        this.telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from: telemetryFrom });
      }
      mnemonicLabel(label) {
        return mnemonicMenuLabel(label, !this.currentEnableMenuBarMnemonics);
      }
    };
    Menubar = __decorateClass([
      __decorateParam(0, IUpdateService),
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, IWindowsMainService),
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, ITelemetryService),
      __decorateParam(5, IWorkspacesHistoryMainService),
      __decorateParam(6, IStateService),
      __decorateParam(7, ILifecycleMainService),
      __decorateParam(8, ILogService),
      __decorateParam(9, INativeHostMainService),
      __decorateParam(10, IProductService),
      __decorateParam(11, IAuxiliaryWindowsMainService)
    ], Menubar);
  }
});
export { __separator__, app8, BrowserWindow4, Menu4, MenuItem3, telemetryFrom, Menubar, init_menubar2 };
