// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/parts/titlebar/menubarControl.ts
import { MenubarControl } from "./module-1609.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { Separator } from "./module-0082.mjs";
import { IMenuService, MenuItemAction, SubmenuItemAction } from "./module-0092.mjs";
import { OpenRecentAction } from "./module-1520.mjs";
import { isICommandActionToggleInfo } from "./module-0505.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspacesService } from "./module-1379.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IMenubarService } from "./module-3792.mjs";
import { IHostService } from "./module-1117.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/electron-browser/parts/titlebar/menubarControl.ts
var NativeMenubarControl = class extends MenubarControl {
  constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, menubarService, hostService, nativeHostService, commandService) {
    super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
    this.menubarService = menubarService;
    this.nativeHostService = nativeHostService;
    (async () => {
      this.recentlyOpened = await this.workspacesService.getRecentlyOpened();
      this.doUpdateMenubar();
    })();
    this.registerListeners();
  }
  setupMainMenu() {
    super.setupMainMenu();
    for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
      const menu = this.menus[topLevelMenuName];
      if (menu) {
        this.mainMenuDisposables.add(menu.onDidChange(() => this.updateMenubar()));
      }
    }
  }
  doUpdateMenubar() {
    if (!this.hostService.hasFocus) {
      return;
    }
    const menubarData = { menus: {}, keybindings: {} };
    if (this.getMenubarMenus(menubarData)) {
      this.menubarService.updateMenubar(this.nativeHostService.windowId, menubarData);
    }
  }
  getMenubarMenus(menubarData) {
    if (!menubarData) {
      return false;
    }
    menubarData.keybindings = this.getAdditionalKeybindings();
    for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
      const menu = this.menus[topLevelMenuName];
      if (menu) {
        const menubarMenu = { items: [] };
        const menuActions = getFlatContextMenuActions(menu.getActions({ shouldForwardArgs: true }));
        this.populateMenuItems(menuActions, menubarMenu, menubarData.keybindings);
        if (menubarMenu.items.length === 0) {
          return false;
        }
        menubarData.menus[topLevelMenuName] = menubarMenu;
      }
    }
    return true;
  }
  populateMenuItems(menuActions, menuToPopulate, keybindings) {
    for (const menuItem of menuActions) {
      if (menuItem instanceof Separator) {
        menuToPopulate.items.push({ id: "vscode.menubar.separator" });
      } else if (menuItem instanceof MenuItemAction || menuItem instanceof SubmenuItemAction) {
        const title = typeof menuItem.item.title === "string" ? menuItem.item.title : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
        if (menuItem instanceof SubmenuItemAction) {
          const submenu = { items: [] };
          this.populateMenuItems(menuItem.actions, submenu, keybindings);
          if (submenu.items.length > 0) {
            const menubarSubmenuItem = {
              id: menuItem.id,
              label: title,
              submenu
            };
            menuToPopulate.items.push(menubarSubmenuItem);
          }
        } else {
          if (menuItem.id === OpenRecentAction.ID) {
            const actions = this.getOpenRecentActions().map(this.transformOpenRecentAction);
            menuToPopulate.items.push(...actions);
          }
          const menubarMenuItem = {
            id: menuItem.id,
            label: title
          };
          if (isICommandActionToggleInfo(menuItem.item.toggled)) {
            menubarMenuItem.label = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
          }
          if (menuItem.checked) {
            menubarMenuItem.checked = true;
          }
          if (!menuItem.enabled) {
            menubarMenuItem.enabled = false;
          }
          keybindings[menuItem.id] = this.getMenubarKeybinding(menuItem.id);
          menuToPopulate.items.push(menubarMenuItem);
        }
      }
    }
  }
  transformOpenRecentAction(action) {
    if (action instanceof Separator) {
      return { id: "vscode.menubar.separator" };
    }
    return {
      id: action.id,
      uri: action.uri,
      remoteAuthority: action.remoteAuthority,
      enabled: action.enabled,
      label: action.label
    };
  }
  getAdditionalKeybindings() {
    const keybindings = {};
    if (isMacintosh) {
      const keybinding = this.getMenubarKeybinding("workbench.action.quit");
      if (keybinding) {
        keybindings["workbench.action.quit"] = keybinding;
      }
    }
    return keybindings;
  }
  getMenubarKeybinding(id2) {
    const binding = this.keybindingService.lookupKeybinding(id2);
    if (!binding) {
      return void 0;
    }
    const electronAccelerator = binding.getElectronAccelerator();
    if (electronAccelerator) {
      return { label: electronAccelerator, userSettingsLabel: binding.getUserSettingsLabel() ?? void 0 };
    }
    const acceleratorLabel = binding.getLabel();
    if (acceleratorLabel) {
      return { label: acceleratorLabel, isNative: false, userSettingsLabel: binding.getUserSettingsLabel() ?? void 0 };
    }
    return void 0;
  }
};

NativeMenubarControl = __decorateClass([
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
  __decorateParam(10, INativeWorkbenchEnvironmentService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, IMenubarService),
  __decorateParam(13, IHostService),
  __decorateParam(14, INativeHostService),
  __decorateParam(15, ICommandService)
], NativeMenubarControl);
export { NativeMenubarControl };
