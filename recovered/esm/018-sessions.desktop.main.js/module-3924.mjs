// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/electron-browser/parts/titlebarPart.ts
import { TitleService, TitlebarPart } from "./module-3462.mjs";
import { $, EventType, addDisposableListener, append, getWindow, getWindowId, hide, show } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { hasNativeTitlebar, useWindowControlsOverlay } from "./module-0515.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Event2 } from "./module-0017.mjs";
import { getZoomFactor } from "./module-0018.mjs";
import { IsWindowAlwaysOnTopContext } from "./module-0950.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHostService } from "./module-1118.mjs";
import { IProductService } from "./module-0875.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/sessions/electron-browser/parts/titlebarPart.ts
var NativeTitlebarPart = class extends TitlebarPart {
  constructor(id2, targetWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, productService, nativeHostService) {
    super(id2, targetWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService);
    this.productService = productService;
    this.nativeHostService = nativeHostService;
    this.handleWindowsAlwaysOnTop(targetWindow.vscodeWindowId, contextKeyService);
  }
  createContentArea(parent) {
    const window2 = getWindow(this.element);
    const agentsTitle = localize(5629, null);
    if (isMacintosh) {
      const initialTitle = this.productService.nameLong;
      if (!window2.document.title || window2.document.title === initialTitle) {
        window2.document.title = `${agentsTitle} \u200B`;
      }
    }
    window2.document.title = agentsTitle;
    const result = super.createContentArea(parent);
    const targetWindow = getWindow(parent);
    const targetWindowId = getWindowId(targetWindow);
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
        this.onContextMenu(new MouseEvent(EventType.MOUSE_UP, { clientX: x / zoomFactor, clientY: y / zoomFactor }));
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
  async handleWindowsAlwaysOnTop(targetWindowId, contextKeyService) {
    const isWindowAlwaysOnTopContext = IsWindowAlwaysOnTopContext.bindTo(contextKeyService);
    this._register(this.nativeHostService.onDidChangeWindowAlwaysOnTop(({ windowId, alwaysOnTop }) => {
      if (windowId === targetWindowId) {
        isWindowAlwaysOnTopContext.set(alwaysOnTop);
      }
    }));
    isWindowAlwaysOnTopContext.set(await this.nativeHostService.isWindowAlwaysOnTop({ targetWindowId }));
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      if (useWindowControlsOverlay(this.configurationService)) {
        if (!this.cachedWindowControlStyles || this.cachedWindowControlStyles.bgColor !== this.element.style.backgroundColor || this.cachedWindowControlStyles.fgColor !== this.element.style.color) {
          this.cachedWindowControlStyles = {
            bgColor: this.element.style.backgroundColor,
            fgColor: this.element.style.color
          };
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
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkbenchLayoutService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IProductService),
  __decorateParam(11, INativeHostService)
], NativeTitlebarPart);

var MainNativeTitlebarPart = class extends NativeTitlebarPart {
  constructor(contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, productService, nativeHostService) {
    super("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, productService, nativeHostService);
  }
};

MainNativeTitlebarPart = __decorateClass([
  __decorateParam(0, IContextMenuService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IHostService),
  __decorateParam(8, IProductService),
  __decorateParam(9, INativeHostService)
], MainNativeTitlebarPart);

var AuxiliaryNativeTitlebarPart = class extends NativeTitlebarPart {
  constructor(container2, mainTitlebar, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, productService, nativeHostService) {
    const id2 = AuxiliaryNativeTitlebarPart.COUNTER++;
    super(`workbench.parts.auxiliaryTitle.${id2}`, getWindow(container2), contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, productService, nativeHostService);
    this.container = container2;
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
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkbenchLayoutService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IProductService),
  __decorateParam(11, INativeHostService)
], AuxiliaryNativeTitlebarPart);

var NativeTitleService = class extends TitleService {
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainNativeTitlebarPart);
  }
  doCreateAuxiliaryTitlebarPart(container2, _editorGroupsContainer, instantiationService) {
    return instantiationService.createInstance(AuxiliaryNativeTitlebarPart, container2, this.mainPart);
  }
};
export { NativeTitlebarPart, MainNativeTitlebarPart, AuxiliaryNativeTitlebarPart, NativeTitleService };
