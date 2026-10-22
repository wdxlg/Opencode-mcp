// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/actions/windowActions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL, applyZoom } from "./module-3725.mjs";
import { Categories } from "./module-0847.mjs";
import { getZoomLevel } from "./module-0018.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { isOpenedAuxiliaryWindow } from "./module-0515.mjs";
import { URI } from "./module-0032.mjs";
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0509.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { IsAuxiliaryWindowContext, IsAuxiliaryWindowFocusedContext, IsWindowAlwaysOnTopContext } from "./module-0949.mjs";
import { isAuxiliaryWindow, mainWindow } from "./module-0002.mjs";
import { IHostService } from "./module-1117.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";


// src/vs/workbench/electron-browser/actions/windowActions.ts
var CloseWindowAction = class _CloseWindowAction extends Action2 {
  static {
    this.ID = "workbench.action.closeWindow";
  }
  constructor() {
    super({
      id: _CloseWindowAction.ID,
      title: {
        ...localize2(22429, "Close Window"),
        mnemonicTitle: localize(22434, null)
      },
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KeyW */ },
        linux: { primary: 512 /* Alt */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KeyW */] },
        win: { primary: 512 /* Alt */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KeyW */] }
      },
      menu: {
        id: MenuId.MenubarFileMenu,
        group: "6_close",
        order: 4
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    return nativeHostService.closeWindow({ targetWindowId: getActiveWindow().vscodeWindowId });
  }
};

var CloseOtherWindowsAction = class _CloseOtherWindowsAction extends Action2 {
  static {
    this.ID = "workbench.action.closeOtherWindows";
  }
  constructor() {
    super({
      id: _CloseOtherWindowsAction.ID,
      title: localize2(22428, "Close Other Windows"),
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const currentWindowId = getActiveWindow().vscodeWindowId;
    const windows = await nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    for (const window2 of windows) {
      if (window2.id !== currentWindowId) {
        nativeHostService.closeWindow({ targetWindowId: window2.id });
      }
    }
  }
};

var BaseZoomAction = class _BaseZoomAction extends Action2 {
  static {
    this.ZOOM_LEVEL_SETTING_KEY = "window.zoomLevel";
  }
  static {
    this.ZOOM_PER_WINDOW_SETTING_KEY = "window.zoomPerWindow";
  }
  async setZoomLevel(accessor, levelOrReset) {
    const configurationService = accessor.get(IConfigurationService);
    let target;
    if (configurationService.getValue(_BaseZoomAction.ZOOM_PER_WINDOW_SETTING_KEY) !== false) {
      target = 1 /* ACTIVE_WINDOW */;
    } else {
      target = 2 /* ALL_WINDOWS */;
    }
    let level;
    if (typeof levelOrReset === "number") {
      level = Math.round(levelOrReset);
    } else {
      if (target === 2 /* ALL_WINDOWS */) {
        level = 0;
      } else {
        const defaultLevel = configurationService.getValue(_BaseZoomAction.ZOOM_LEVEL_SETTING_KEY);
        if (typeof defaultLevel === "number") {
          level = defaultLevel;
        } else {
          level = 0;
        }
      }
    }
    if (level > MAX_ZOOM_LEVEL || level < MIN_ZOOM_LEVEL) {
      return;
    }
    if (target === 2 /* ALL_WINDOWS */) {
      await configurationService.updateValue(_BaseZoomAction.ZOOM_LEVEL_SETTING_KEY, level);
    }
    applyZoom(level, target);
  }
};

var ZoomInAction = class extends BaseZoomAction {
  constructor() {
    super({
      id: "workbench.action.zoomIn",
      title: {
        ...localize2(22445, "Zoom In"),
        mnemonicTitle: localize(22435, null)
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 86 /* Equal */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 86 /* Equal */, 2048 /* CtrlCmd */ | 109 /* NumpadAdd */]
      },
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "5_zoom",
        order: 1
      }
    });
  }
  run(accessor) {
    return super.setZoomLevel(accessor, getZoomLevel(getActiveWindow()) + 1);
  }
};

var ZoomOutAction = class extends BaseZoomAction {
  constructor() {
    super({
      id: "workbench.action.zoomOut",
      title: {
        ...localize2(22446, "Zoom Out"),
        mnemonicTitle: localize(22436, null)
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 88 /* Minus */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 88 /* Minus */, 2048 /* CtrlCmd */ | 111 /* NumpadSubtract */],
        linux: {
          primary: 2048 /* CtrlCmd */ | 88 /* Minus */,
          secondary: [2048 /* CtrlCmd */ | 111 /* NumpadSubtract */]
        }
      },
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "5_zoom",
        order: 2
      }
    });
  }
  run(accessor) {
    return super.setZoomLevel(accessor, getZoomLevel(getActiveWindow()) - 1);
  }
};

var ZoomResetAction = class extends BaseZoomAction {
  constructor() {
    super({
      id: "workbench.action.zoomReset",
      title: {
        ...localize2(22447, "Reset Zoom"),
        mnemonicTitle: localize(22437, null)
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 98 /* Numpad0 */
      },
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "5_zoom",
        order: 3
      }
    });
  }
  run(accessor) {
    return super.setZoomLevel(accessor, true);
  }
};

var BaseSwitchWindow = class extends Action2 {
  constructor() {
    super(...arguments);
    this.closeWindowAction = {
      iconClass: ThemeIcon.asClassName(Codicon.removeClose),
      tooltip: localize(22426, null)
    };
    this.closeDirtyWindowAction = {
      iconClass: "dirty-window " + ThemeIcon.asClassName(Codicon.closeDirty),
      tooltip: localize(22426, null),
      alwaysVisible: true
    };
    this.closeActiveWindowAction = {
      iconClass: "active-window " + ThemeIcon.asClassName(Codicon.windowActive),
      tooltip: localize(22427, null),
      alwaysVisible: true
    };
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const keybindingService = accessor.get(IKeybindingService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const nativeHostService = accessor.get(INativeHostService);
    const currentWindowId = getActiveWindow().vscodeWindowId;
    const windows = await nativeHostService.getWindows({ includeAuxiliaryWindows: true });
    const mainWindows = /* @__PURE__ */ new Set();
    const mapMainWindowToAuxiliaryWindows = /* @__PURE__ */ new Map();
    for (const window2 of windows) {
      if (isOpenedAuxiliaryWindow(window2)) {
        let auxiliaryWindows = mapMainWindowToAuxiliaryWindows.get(window2.parentId);
        if (!auxiliaryWindows) {
          auxiliaryWindows = /* @__PURE__ */ new Set();
          mapMainWindowToAuxiliaryWindows.set(window2.parentId, auxiliaryWindows);
        }
        auxiliaryWindows.add(window2);
      } else {
        mainWindows.add(window2);
      }
    }
    function isWindowPickItem(candidate) {
      const windowPickItem = candidate;
      return typeof windowPickItem?.windowId === "number";
    }
    const picks = [];
    for (const window2 of mainWindows) {
      const auxiliaryWindows = mapMainWindowToAuxiliaryWindows.get(window2.id);
      if (mapMainWindowToAuxiliaryWindows.size > 0) {
        picks.push({ type: "separator", label: auxiliaryWindows ? localize(22444, null) : void 0 });
      }
      const resource = window2.filename ? URI.file(window2.filename) : isSingleFolderWorkspaceIdentifier(window2.workspace) ? window2.workspace.uri : isWorkspaceIdentifier(window2.workspace) ? window2.workspace.configPath : void 0;
      const fileKind = window2.filename ? 0 /* FILE */ : isSingleFolderWorkspaceIdentifier(window2.workspace) ? 1 /* FOLDER */ : isWorkspaceIdentifier(window2.workspace) ? 2 /* ROOT_FOLDER */ : 0 /* FILE */;
      const pick2 = {
        windowId: window2.id,
        label: window2.title,
        ariaLabel: window2.dirty ? localize(22443, null, window2.title) : window2.title,
        iconClasses: getIconClasses(modelService, languageService, resource, fileKind),
        description: currentWindowId === window2.id ? localize(22430, null) : void 0,
        buttons: window2.dirty ? [this.closeDirtyWindowAction] : currentWindowId === window2.id ? [this.closeActiveWindowAction] : [this.closeWindowAction]
      };
      picks.push(pick2);
      if (auxiliaryWindows) {
        for (const auxiliaryWindow of auxiliaryWindows) {
          const pick3 = {
            windowId: auxiliaryWindow.id,
            label: auxiliaryWindow.title,
            iconClasses: getIconClasses(modelService, languageService, auxiliaryWindow.filename ? URI.file(auxiliaryWindow.filename) : void 0, 0 /* FILE */),
            description: currentWindowId === auxiliaryWindow.id ? localize(22430, null) : void 0,
            buttons: currentWindowId === auxiliaryWindow.id ? [this.closeActiveWindowAction] : [this.closeWindowAction]
          };
          picks.push(pick3);
        }
      }
    }
    const pick = await quickInputService.pick(picks, {
      contextKey: "inWindowsPicker",
      activeItem: (() => {
        for (let i2 = 0; i2 < picks.length; i2++) {
          const pick2 = picks[i2];
          if (isWindowPickItem(pick2) && pick2.windowId === currentWindowId) {
            let nextPick = picks[i2 + 1];
            if (isWindowPickItem(nextPick)) {
              return nextPick;
            }
            nextPick = picks[i2 + 2];
            if (isWindowPickItem(nextPick)) {
              return nextPick;
            }
          }
        }
        return void 0;
      })(),
      placeHolder: localize(22441, null),
      quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : void 0,
      hideInput: this.isQuickNavigate(),
      onDidTriggerItemButton: async (context2) => {
        await nativeHostService.closeWindow({ targetWindowId: context2.item.windowId });
        context2.removeItem();
      }
    });
    if (pick) {
      nativeHostService.focusWindow({ targetWindowId: pick.windowId });
    }
  }
};

var SwitchWindowAction = class extends BaseSwitchWindow {
  constructor() {
    super({
      id: "workbench.action.switchWindow",
      title: localize2(22440, "Switch Window..."),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 53 /* KeyW */ }
      }
    });
  }
  isQuickNavigate() {
    return false;
  }
};

var QuickSwitchWindowAction = class extends BaseSwitchWindow {
  constructor() {
    super({
      id: "workbench.action.quickSwitchWindow",
      title: localize2(22438, "Quick Switch Window..."),
      f1: false
      // hide quick pickers from command palette to not confuse with the other entry that shows a input field
    });
  }
  isQuickNavigate() {
    return true;
  }
};

var SwitchToMainWindowAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.switchToMainWindow",
      title: localize2(22439, "Switch to Main Window"),
      f1: true,
      precondition: IsAuxiliaryWindowContext
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    return nativeHostService.focusWindow({ targetWindowId: mainWindow.vscodeWindowId });
  }
};

var FocusWindowAction = class _FocusWindowAction extends Action2 {
  static {
    this.ID = "workbench.action.focusWindow";
  }
  constructor() {
    super({
      id: _FocusWindowAction.ID,
      title: localize2(22433, "Focus Window"),
      f1: true
    });
  }
  async run(accessor) {
    const hostService = accessor.get(IHostService);
    await hostService.focus(getActiveWindow(), { mode: 2 /* Force */ });
  }
};

function canRunNativeTabsHandler(accessor) {
  if (!isMacintosh) {
    return false;
  }
  const configurationService = accessor.get(IConfigurationService);
  return configurationService.getValue("window.nativeTabs") === true;
}

var NewWindowTabHandler = function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).newWindowTab();
};

var ShowPreviousWindowTabHandler = function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).showPreviousWindowTab();
};

var ShowNextWindowTabHandler = function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).showNextWindowTab();
};

var MoveWindowTabToNewWindowHandler = function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).moveWindowTabToNewWindow();
};

var MergeWindowTabsHandlerHandler = function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).mergeAllWindowTabs();
};

var ToggleWindowTabsBarHandler = function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).toggleWindowTabsBar();
};

var ToggleWindowAlwaysOnTopAction = class _ToggleWindowAlwaysOnTopAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleWindowAlwaysOnTop";
  }
  constructor() {
    super({
      id: _ToggleWindowAlwaysOnTopAction.ID,
      title: localize2(22442, "Toggle Window Always on Top"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const targetWindow = getActiveWindow();
    if (!isAuxiliaryWindow(targetWindow.window)) {
      return;
    }
    return nativeHostService.toggleWindowAlwaysOnTop({ targetWindowId: getActiveWindow().vscodeWindowId });
  }
};

var EnableWindowAlwaysOnTopAction = class _EnableWindowAlwaysOnTopAction extends Action2 {
  static {
    this.ID = "workbench.action.enableWindowAlwaysOnTop";
  }
  constructor() {
    super({
      id: _EnableWindowAlwaysOnTopAction.ID,
      title: localize(22432, null),
      icon: Codicon.pin,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsWindowAlwaysOnTopContext.toNegated(), IsAuxiliaryWindowContext),
        order: 1,
        group: "navigation"
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const targetWindow = getActiveWindow();
    if (!isAuxiliaryWindow(targetWindow.window)) {
      return;
    }
    return nativeHostService.setWindowAlwaysOnTop(true, { targetWindowId: targetWindow.vscodeWindowId });
  }
};

var DisableWindowAlwaysOnTopAction = class _DisableWindowAlwaysOnTopAction extends Action2 {
  static {
    this.ID = "workbench.action.disableWindowAlwaysOnTop";
  }
  constructor() {
    super({
      id: _DisableWindowAlwaysOnTopAction.ID,
      title: localize(22431, null),
      icon: Codicon.pinned,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsWindowAlwaysOnTopContext, IsAuxiliaryWindowContext),
        order: 1,
        group: "navigation"
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const targetWindow = getActiveWindow();
    if (!isAuxiliaryWindow(targetWindow.window)) {
      return;
    }
    return nativeHostService.setWindowAlwaysOnTop(false, { targetWindowId: targetWindow.vscodeWindowId });
  }
};
export { canRunNativeTabsHandler, CloseWindowAction, CloseOtherWindowsAction, BaseZoomAction, ZoomInAction, ZoomOutAction, ZoomResetAction, BaseSwitchWindow, SwitchWindowAction, QuickSwitchWindowAction, SwitchToMainWindowAction, FocusWindowAction, NewWindowTabHandler, ShowPreviousWindowTabHandler, ShowNextWindowTabHandler, MoveWindowTabToNewWindowHandler, MergeWindowTabsHandlerHandler, ToggleWindowTabsBarHandler, ToggleWindowAlwaysOnTopAction, EnableWindowAlwaysOnTopAction, DisableWindowAlwaysOnTopAction };
