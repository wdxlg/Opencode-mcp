// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/parts/titlebar/titlebarPart.ts
import { BrowserTitleService, BrowserTitlebarPart } from "./module-3803.mjs";
import { isLinux, isMacintosh, isTahoeOrNewer, isWindows } from "./module-0014.mjs";
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT, hasNativeMenu, hasNativeTitlebar, useWindowControlsOverlay } from "./module-0515.mjs";
import { getZoomFactor } from "./module-0018.mjs";
import { $, EventType, addDisposableListener, append, getWindow, getWindowId, hide, show } from "./module-0075.mjs";
import { IsWindowAlwaysOnTopContext } from "./module-0949.mjs";
import { NativeMenubarControl } from "./module-3804.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Event2 } from "./module-0017.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHostService } from "./module-1117.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/electron-browser/parts/titlebar/titlebarPart.ts
var NativeTitlebarPart = class extends BrowserTitlebarPart {
  constructor(id2, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService) {
    super(id2, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService, actionViewItemService);
    this.nativeHostService = nativeHostService;
    this.tahoeOrNewer = isTahoeOrNewer(environmentService.os.release);
    this.handleWindowsAlwaysOnTop(targetWindow.vscodeWindowId);
  }
  //#region IView
  get minimumHeight() {
    if (!isMacintosh) {
      return super.minimumHeight;
    }
    return (this.isCommandCenterVisible ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : this.macTitlebarSize) / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  get macTitlebarSize() {
    if (this.tahoeOrNewer) {
      return 32;
    }
    return 28;
  }
  async handleWindowsAlwaysOnTop(targetWindowId) {
    const isWindowAlwaysOnTopContext = IsWindowAlwaysOnTopContext.bindTo(this.contextKeyService);
    this._register(this.nativeHostService.onDidChangeWindowAlwaysOnTop(({ windowId, alwaysOnTop }) => {
      if (windowId === targetWindowId) {
        isWindowAlwaysOnTopContext.set(alwaysOnTop);
      }
    }));
    isWindowAlwaysOnTopContext.set(await this.nativeHostService.isWindowAlwaysOnTop({ targetWindowId }));
  }
  onMenubarVisibilityChanged(visible) {
    if ((isWindows || isLinux) && this.currentMenubarVisibility === "toggle" && visible) {
      if (this.dragRegion) {
        hide(this.dragRegion);
        setTimeout(() => show(this.dragRegion), 50);
      }
    }
    super.onMenubarVisibilityChanged(visible);
  }
  onConfigurationChanged(event) {
    super.onConfigurationChanged(event);
    if (event.affectsConfiguration("window.doubleClickIconToClose")) {
      if (this.appIcon) {
        this.onUpdateAppIconDragBehavior();
      }
    }
  }
  onUpdateAppIconDragBehavior() {
    const setting = this.configurationService.getValue("window.doubleClickIconToClose");
    if (setting && this.appIcon) {
      this.appIcon.style["-webkit-app-region"] = "no-drag";
    } else if (this.appIcon) {
      this.appIcon.style["-webkit-app-region"] = "drag";
    }
  }
  installMenubar() {
    super.installMenubar();
    if (this.menubar) {
      return;
    }
    if (this.customMenubar.value) {
      this._register(this.customMenubar.value.onFocusStateChange((e) => this.onMenubarFocusChanged(e)));
    }
  }
  onMenubarFocusChanged(focused) {
    if ((isWindows || isLinux) && this.currentMenubarVisibility !== "compact" && this.dragRegion) {
      if (focused) {
        hide(this.dragRegion);
      } else {
        show(this.dragRegion);
      }
    }
  }
  createContentArea(parent) {
    const result = super.createContentArea(parent);
    const targetWindow = getWindow(parent);
    const targetWindowId = getWindowId(targetWindow);
    if (isMacintosh || hasNativeMenu(this.configurationService)) {
      this._register(this.instantiationService.createInstance(NativeMenubarControl));
    }
    if (this.appIcon) {
      this.onUpdateAppIconDragBehavior();
      this._register(addDisposableListener(this.appIcon, EventType.DBLCLICK, (() => {
        this.nativeHostService.closeWindow({ targetWindowId });
      })));
    }
    if (!hasNativeTitlebar(this.configurationService) && // not for native title bars
    !useWindowControlsOverlay(this.configurationService) && // not when controls are natively drawn
    this.windowControlsContainer) {
      const minimizeIcon = append(this.windowControlsContainer, $("div.window-icon.window-minimize" + ThemeIcon.asCSSSelector(Codicon.chromeMinimize)));
      this._register(addDisposableListener(minimizeIcon, EventType.CLICK, () => {
        this.nativeHostService.minimizeWindow({ targetWindowId });
      }));
      this.maxRestoreControl = append(this.windowControlsContainer, $("div.window-icon.window-max-restore"));
      this._register(addDisposableListener(this.maxRestoreControl, EventType.CLICK, async () => {
        const maximized = await this.nativeHostService.isMaximized({ targetWindowId });
        if (maximized) {
          return this.nativeHostService.unmaximizeWindow({ targetWindowId });
        }
        return this.nativeHostService.maximizeWindow({ targetWindowId });
      }));
      const closeIcon3 = append(this.windowControlsContainer, $("div.window-icon.window-close" + ThemeIcon.asCSSSelector(Codicon.chromeClose)));
      this._register(addDisposableListener(closeIcon3, EventType.CLICK, () => {
        this.nativeHostService.closeWindow({ targetWindowId });
      }));
      this.resizer = append(this.rootContainer, $("div.resizer"));
      this._register(Event2.runAndSubscribe(this.layoutService.onDidChangeWindowMaximized, ({ windowId, maximized }) => {
        if (windowId === targetWindowId) {
          this.onDidChangeWindowMaximized(maximized);
        }
      }, { windowId: targetWindowId, maximized: this.layoutService.isWindowMaximized(targetWindow) }));
    }
    if (isWindows && !hasNativeTitlebar(this.configurationService)) {
      this._register(this.nativeHostService.onDidTriggerWindowSystemContextMenu(({ windowId, x, y }) => {
        if (targetWindowId !== windowId) {
          return;
        }
        const zoomFactor = getZoomFactor(getWindow(this.element));
        this.onContextMenu(new MouseEvent(EventType.MOUSE_UP, { clientX: x / zoomFactor, clientY: y / zoomFactor }), MenuId.TitleBarContext);
      }));
    }
    return result;
  }
  onDidChangeWindowMaximized(maximized) {
    if (this.maxRestoreControl) {
      if (maximized) {
        this.maxRestoreControl.classList.remove(...ThemeIcon.asClassNameArray(Codicon.chromeMaximize));
        this.maxRestoreControl.classList.add(...ThemeIcon.asClassNameArray(Codicon.chromeRestore));
      } else {
        this.maxRestoreControl.classList.remove(...ThemeIcon.asClassNameArray(Codicon.chromeRestore));
        this.maxRestoreControl.classList.add(...ThemeIcon.asClassNameArray(Codicon.chromeMaximize));
      }
    }
    if (this.resizer) {
      if (maximized) {
        hide(this.resizer);
      } else {
        show(this.resizer);
      }
    }
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      if (useWindowControlsOverlay(this.configurationService)) {
        if (!this.cachedWindowControlStyles || this.cachedWindowControlStyles.bgColor !== this.element.style.backgroundColor || this.cachedWindowControlStyles.fgColor !== this.element.style.color) {
          this.nativeHostService.updateWindowControls({
            targetWindowId: getWindowId(getWindow(this.element)),
            backgroundColor: this.element.style.backgroundColor,
            foregroundColor: this.element.style.color
          });
        }
      }
    }
  }
  layout(width2, height) {
    super.layout(width2, height);
    if (useWindowControlsOverlay(this.configurationService)) {
      const newHeight = Math.round(height * getZoomFactor(getWindow(this.element)));
      if (newHeight !== this.cachedWindowControlHeight) {
        this.cachedWindowControlHeight = newHeight;
        this.nativeHostService.updateWindowControls({
          targetWindowId: getWindowId(getWindow(this.element)),
          height: newHeight
        });
      }
    }
  }
};

NativeTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, INativeHostService),
  __decorateParam(13, IEditorGroupsService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IMenuService),
  __decorateParam(16, IKeybindingService),
  __decorateParam(17, IActionViewItemService)
], NativeTitlebarPart);

var MainNativeTitlebarPart = class extends NativeTitlebarPart {
  constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService) {
    super("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow, editorGroupService.mainPart, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService);
  }
};

MainNativeTitlebarPart = __decorateClass([
  __decorateParam(0, IContextMenuService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IHostService),
  __decorateParam(9, INativeHostService),
  __decorateParam(10, IEditorGroupsService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IKeybindingService),
  __decorateParam(14, IActionViewItemService)
], MainNativeTitlebarPart);

var AuxiliaryNativeTitlebarPart = class extends NativeTitlebarPart {
  constructor(container3, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService) {
    const id2 = AuxiliaryNativeTitlebarPart.COUNTER++;
    super(`workbench.parts.auxiliaryTitle.${id2}`, getWindow(container3), editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService);
    this.container = container3;
    this.mainTitlebar = mainTitlebar;
  }
  static {
    this.COUNTER = 1;
  }
  get height() {
    return this.minimumHeight;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
  }
};

AuxiliaryNativeTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, INativeHostService),
  __decorateParam(13, IEditorGroupsService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IMenuService),
  __decorateParam(16, IKeybindingService),
  __decorateParam(17, IActionViewItemService)
], AuxiliaryNativeTitlebarPart);

var NativeTitleService = class extends BrowserTitleService {
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainNativeTitlebarPart);
  }
  doCreateAuxiliaryTitlebarPart(container3, editorGroupsContainer, instantiationService) {
    return instantiationService.createInstance(AuxiliaryNativeTitlebarPart, container3, editorGroupsContainer, this.mainPart);
  }
};
export { NativeTitlebarPart, MainNativeTitlebarPart, AuxiliaryNativeTitlebarPart, NativeTitleService };
