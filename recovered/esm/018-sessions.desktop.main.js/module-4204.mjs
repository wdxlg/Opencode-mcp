// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/splash/browser/partsSplash.ts
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { mark } from "./module-0506.mjs";
import { getDomNodePagePosition, getTotalHeight, getTotalWidth, runWhenWindowIdle } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { isFullscreen, onDidChangeFullscreen } from "./module-0018.mjs";
import { IThemeService, getThemeTypeSelector } from "./module-0287.mjs";
import { foreground } from "./module-0227.mjs";
import { Color } from "./module-0197.mjs";
import { editorBackground } from "./module-0229.mjs";
import { ACTIVITY_BAR_BACKGROUND, ACTIVITY_BAR_BORDER, EDITOR_BORDER, EDITOR_GROUP_BORDER, MODERN_ACTIVITY_BAR_BACKGROUND, MODERN_ACTIVITY_BAR_BORDER, MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND, PANEL_BACKGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_BORDER, STATUS_BAR_BACKGROUND, STATUS_BAR_BORDER, STATUS_BAR_NO_FOLDER_BACKGROUND, SURFACE_BACKGROUND, SURFACE_BORDER, TITLE_BAR_ACTIVE_BACKGROUND, TITLE_BAR_BORDER, WINDOW_ACTIVE_BORDER, WINDOW_INACTIVE_BORDER, WORKBENCH_BACKGROUND } from "./module-0868.mjs";
import { DEFAULT_EDITOR_MIN_DIMENSIONS } from "./module-1089.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISplashStorageService } from "./module-4203.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ILifecycleService } from "./module-0870.mjs";


// src/vs/workbench/contrib/splash/browser/partsSplash.ts
var PartsSplash = class {
  constructor(_themeService, _layoutService, _environmentService, _configService, _partSplashService, editorGroupsService, lifecycleService) {
    this._themeService = _themeService;
    this._layoutService = _layoutService;
    this._environmentService = _environmentService;
    this._configService = _configService;
    this._partSplashService = _partSplashService;
    this._disposables = new DisposableStore();
    Event2.once(_layoutService.onDidLayoutMainContainer)(() => {
      this._removePartsSplash();
      mark("code/didRemovePartsSplash");
    }, void 0, this._disposables);
    const lastIdleSchedule = this._disposables.add(new MutableDisposable());
    const savePartsSplashSoon = () => {
      lastIdleSchedule.value = runWhenWindowIdle(mainWindow, () => this._savePartsSplash(), 2500);
    };
    lifecycleService.when(3 /* Restored */).then(() => {
      Event2.any(Event2.filter(onDidChangeFullscreen, (windowId) => windowId === mainWindow.vscodeWindowId), editorGroupsService.mainPart.onDidLayout, _themeService.onDidColorThemeChange)(savePartsSplashSoon, void 0, this._disposables);
      savePartsSplashSoon();
    });
    _configService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("window.titleBarStyle" /* TITLE_BAR_STYLE */)) {
        this._didChangeTitleBarStyle = true;
        this._savePartsSplash();
      }
    }, this, this._disposables);
  }
  static {
    this.ID = "workbench.contrib.partsSplash";
  }
  static {
    this._splashElementId = "monaco-parts-splash";
  }
  dispose() {
    this._disposables.dispose();
  }
  _savePartsSplash() {
    const theme = this._themeService.getColorTheme();
    this._partSplashService.saveWindowSplash({
      zoomLevel: this._configService.getValue("window.zoomLevel"),
      baseTheme: getThemeTypeSelector(theme.type),
      colorInfo: {
        foreground: theme.getColor(foreground)?.toString(),
        background: Color.Format.CSS.formatHex(theme.getColor(editorBackground) || WORKBENCH_BACKGROUND(theme)),
        editorBackground: theme.getColor(editorBackground)?.toString(),
        titleBarBackground: theme.getColor(TITLE_BAR_ACTIVE_BACKGROUND)?.toString(),
        titleBarBorder: theme.getColor(TITLE_BAR_BORDER)?.toString(),
        activityBarBackground: theme.getColor(ACTIVITY_BAR_BACKGROUND)?.toString(),
        activityBarBorder: theme.getColor(ACTIVITY_BAR_BORDER)?.toString(),
        modernActivityBarBackground: theme.getColor(MODERN_ACTIVITY_BAR_BACKGROUND)?.toString(),
        modernActivityBarInactiveBackground: theme.getColor(MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND)?.toString(),
        modernActivityBarBorder: theme.getColor(MODERN_ACTIVITY_BAR_BORDER)?.toString(),
        sideBarBackground: theme.getColor(SIDE_BAR_BACKGROUND)?.toString(),
        sideBarBorder: theme.getColor(SIDE_BAR_BORDER)?.toString(),
        panelBackground: theme.getColor(PANEL_BACKGROUND)?.toString(),
        editorGroupBorder: theme.getColor(EDITOR_GROUP_BORDER)?.toString(),
        editorBorder: theme.getColor(EDITOR_BORDER)?.toString(),
        surfaceBackground: theme.getColor(SURFACE_BACKGROUND)?.toString(),
        surfaceBorder: theme.getColor(SURFACE_BORDER)?.toString(),
        agentsPanelBackground: theme.getColor("agentsPanel.background")?.toString(),
        agentsPanelBorder: theme.getColor("agentsPanel.border")?.toString(),
        statusBarBackground: theme.getColor(STATUS_BAR_BACKGROUND)?.toString(),
        statusBarBorder: theme.getColor(STATUS_BAR_BORDER)?.toString(),
        statusBarNoFolderBackground: theme.getColor(STATUS_BAR_NO_FOLDER_BACKGROUND)?.toString(),
        windowBorder: theme.getColor(WINDOW_ACTIVE_BORDER)?.toString() ?? theme.getColor(WINDOW_INACTIVE_BORDER)?.toString()
      },
      layoutInfo: !this._shouldSaveLayoutInfo() ? void 0 : {
        sideBarSide: this._layoutService.getSideBarPosition() === 1 /* RIGHT */ ? "right" : "left",
        editorPartMinWidth: DEFAULT_EDITOR_MIN_DIMENSIONS.width,
        titleBarHeight: this._layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow) ? getTotalHeight(assertReturnsDefined(this._layoutService.getContainer(mainWindow, "workbench.parts.titlebar" /* TITLEBAR_PART */))) : 0,
        activityBarWidth: this._layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */) ? getTotalWidth(assertReturnsDefined(this._layoutService.getContainer(mainWindow, "workbench.parts.activitybar" /* ACTIVITYBAR_PART */))) : 0,
        sideBarWidth: this._layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */) ? getTotalWidth(assertReturnsDefined(this._layoutService.getContainer(mainWindow, "workbench.parts.sidebar" /* SIDEBAR_PART */))) : 0,
        auxiliaryBarWidth: this._layoutService.isAuxiliaryBarMaximized() ? Number.MAX_SAFE_INTEGER : this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) ? getTotalWidth(assertReturnsDefined(this._layoutService.getContainer(mainWindow, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */))) : 0,
        statusBarHeight: this._layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, mainWindow) ? getTotalHeight(assertReturnsDefined(this._layoutService.getContainer(mainWindow, "workbench.parts.statusbar" /* STATUSBAR_PART */))) : 0,
        windowBorder: this._layoutService.hasMainWindowBorder(),
        windowBorderRadius: this._layoutService.getMainWindowBorderRadius(),
        modernUI: this._layoutService.isFloatingPanelsEnabled(),
        modernUICompact: this._layoutService.isModernUICompact(),
        partBounds: this._layoutService.isFloatingPanelsEnabled() ? {
          activityBar: this._getPartBounds("workbench.parts.activitybar" /* ACTIVITYBAR_PART */),
          sideBar: this._getPartBounds("workbench.parts.sidebar" /* SIDEBAR_PART */),
          auxiliaryBar: this._getPartBounds("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */),
          panel: this._getPartBounds("workbench.parts.panel" /* PANEL_PART */),
          editor: this._getPartBounds("workbench.parts.editor" /* EDITOR_PART */)
        } : void 0
      }
    });
  }
  _getPartBounds(part) {
    if (part === "workbench.parts.editor" /* EDITOR_PART */) {
      if (!this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
        return void 0;
      }
    } else if (!this._layoutService.isVisible(part)) {
      return void 0;
    }
    const container2 = assertReturnsDefined(this._layoutService.getContainer(mainWindow, part));
    const position2 = getDomNodePagePosition(container2);
    const classPrefix = part === "workbench.parts.editor" /* EDITOR_PART */ ? "floating-editor" : "floating-part";
    const activityBarOnLeft = this._layoutService.getSideBarPosition() === 0 /* LEFT */;
    return {
      top: position2.top,
      left: position2.left,
      width: position2.width,
      height: position2.height,
      outerEdges: part === "workbench.parts.activitybar" /* ACTIVITYBAR_PART */ ? {
        left: activityBarOnLeft,
        right: !activityBarOnLeft,
        top: true,
        bottom: true
      } : {
        left: container2.classList.contains(`${classPrefix}-outer-left`),
        right: container2.classList.contains(`${classPrefix}-outer-right`),
        top: container2.classList.contains(`${classPrefix}-outer-top`),
        bottom: container2.classList.contains(`${classPrefix}-outer-bottom`)
      }
    };
  }
  _shouldSaveLayoutInfo() {
    return !isFullscreen(mainWindow) && !this._environmentService.isExtensionDevelopment && !this._didChangeTitleBarStyle;
  }
  _removePartsSplash() {
    const element = mainWindow.document.getElementById(PartsSplash._splashElementId);
    if (element) {
      element.style.display = "none";
    }
    const defaultStyles3 = mainWindow.document.head.getElementsByClassName("initialShellColors");
    defaultStyles3[0]?.remove();
  }
};

PartsSplash = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ISplashStorageService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, ILifecycleService)
], PartsSplash);
export { PartsSplash };
