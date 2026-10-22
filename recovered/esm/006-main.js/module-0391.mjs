// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/theme/electron-main/themeMainServiceImpl.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { init_theme } from "./module-0390.mjs";
import { coalesce, init_arrays } from "./module-0013.mjs";
import { getAllWindowsExcludingOffscreen, init_windows } from "./module-0101.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/theme/electron-main/themeMainServiceImpl.ts
import electron10 from "electron";

var DEFAULT_BG_LIGHT, DEFAULT_BG_DARK, DEFAULT_BG_HC_BLACK, DEFAULT_BG_HC_LIGHT, THEME_STORAGE_KEY, THEME_BG_STORAGE_KEY, THEME_WINDOW_SPLASH_KEY, THEME_WINDOW_SPLASH_OVERRIDE_KEY, Setting, ThemeMainService;

var init_themeMainServiceImpl = __esm({
  "src/vs/platform/theme/electron-main/themeMainServiceImpl.ts"() {
    init_event();
    init_lifecycle();
    init_platform();
    init_configuration();
    init_state();
    init_theme();
    init_arrays();
    init_windows();
    init_log();
    DEFAULT_BG_LIGHT = "#FFFFFF";
    DEFAULT_BG_DARK = "#1F1F1F";
    DEFAULT_BG_HC_BLACK = "#000000";
    DEFAULT_BG_HC_LIGHT = "#FFFFFF";
    THEME_STORAGE_KEY = "theme";
    THEME_BG_STORAGE_KEY = "themeBackground";
    THEME_WINDOW_SPLASH_KEY = "windowSplash";
    THEME_WINDOW_SPLASH_OVERRIDE_KEY = "windowSplashWorkspaceOverride";
    Setting = class {
      constructor(key, defaultValue) {
        this.key = key;
        this.defaultValue = defaultValue;
      }
      getValue(configurationService) {
        return configurationService.getValue(this.key) ?? this.defaultValue;
      }
    };
    ((Setting2) => {
      Setting2.DETECT_COLOR_SCHEME = new Setting2("window.autoDetectColorScheme", false);
      Setting2.DETECT_HC = new Setting2("window.autoDetectHighContrast", true);
      Setting2.SYSTEM_COLOR_THEME = new Setting2("window.systemColorTheme", "default");
      Setting2.AUXILIARYBAR_DEFAULT_VISIBILITY = new Setting2("workbench.secondarySideBar.defaultVisibility", "visibleInWorkspace");
      Setting2.STARTUP_EDITOR = new Setting2("workbench.startupEditor", "welcomePage");
    })(Setting || (Setting = {}));
    ThemeMainService = class extends Disposable {
      constructor(stateService, configurationService, logService) {
        super();
        this.stateService = stateService;
        this.configurationService = configurationService;
        this.logService = logService;
        this._onDidChangeColorScheme = this._register(new Emitter());
        this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
        if (!isLinux) {
          this._register(this.configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(Setting.SYSTEM_COLOR_THEME.key) || e.affectsConfiguration(Setting.DETECT_COLOR_SCHEME.key)) {
              this.updateSystemColorTheme();
              this.logThemeSettings();
            }
          }));
        }
        this.updateSystemColorTheme();
        this.logThemeSettings();
        this._register(Event.fromNodeEventEmitter(electron10.nativeTheme, "updated")(() => {
          this.logThemeSettings();
          this._onDidChangeColorScheme.fire(this.getColorScheme());
        }));
      }
      static {
        this.DEFAULT_BAR_WIDTH = 300;
      }
      static {
        this.WORKSPACE_OVERRIDE_LIMIT = 50;
      }
      logThemeSettings() {
        if (this.logService.getLevel() >= 2 /* Debug */) {
          const logSetting = (setting) => `${setting.key}=${setting.getValue(this.configurationService)}`;
          this.logService.debug(`[theme main service] ${logSetting(Setting.DETECT_COLOR_SCHEME)}, ${logSetting(Setting.DETECT_HC)}, ${logSetting(Setting.SYSTEM_COLOR_THEME)}`);
          const logProperty = (property) => `${String(property)}=${electron10.nativeTheme[property]}`;
          this.logService.debug(`[theme main service] electron.nativeTheme: ${logProperty("themeSource")}, ${logProperty("shouldUseDarkColors")}, ${logProperty("shouldUseHighContrastColors")}, ${logProperty("shouldUseInvertedColorScheme")}, ${logProperty("shouldUseDarkColorsForSystemIntegratedUI")}	`);
          this.logService.debug(`[theme main service] New color scheme: ${JSON.stringify(this.getColorScheme())}`);
        }
      }
      updateSystemColorTheme() {
        if (isLinux || this.isAutoDetectColorScheme()) {
          electron10.nativeTheme.themeSource = "system";
        } else {
          switch (Setting.SYSTEM_COLOR_THEME.getValue(this.configurationService)) {
            case "dark":
              electron10.nativeTheme.themeSource = "dark";
              break;
            case "light":
              electron10.nativeTheme.themeSource = "light";
              break;
            case "auto":
              switch (this.getPreferredBaseTheme() ?? this.getStoredBaseTheme()) {
                case "vs" /* VS */:
                  electron10.nativeTheme.themeSource = "light";
                  break;
                case "vs-dark" /* VS_DARK */:
                  electron10.nativeTheme.themeSource = "dark";
                  break;
                default:
                  electron10.nativeTheme.themeSource = "system";
              }
              break;
            default:
              electron10.nativeTheme.themeSource = "system";
              break;
          }
        }
      }
      getColorScheme() {
        if (isWindows2) {
          if (electron10.nativeTheme.shouldUseHighContrastColors) {
            return { dark: electron10.nativeTheme.shouldUseInvertedColorScheme, highContrast: true };
          }
        } else if (isMacintosh) {
          if (electron10.nativeTheme.shouldUseInvertedColorScheme || electron10.nativeTheme.shouldUseHighContrastColors) {
            return { dark: electron10.nativeTheme.shouldUseDarkColors, highContrast: true };
          }
        } else if (isLinux) {
          if (electron10.nativeTheme.shouldUseHighContrastColors) {
            return { dark: true, highContrast: true };
          }
        }
        return {
          dark: electron10.nativeTheme.shouldUseDarkColors,
          highContrast: false
        };
      }
      getPreferredBaseTheme() {
        const colorScheme = this.getColorScheme();
        if (Setting.DETECT_HC.getValue(this.configurationService) && colorScheme.highContrast) {
          return colorScheme.dark ? "hc-black" /* HC_BLACK */ : "hc-light" /* HC_LIGHT */;
        }
        if (this.isAutoDetectColorScheme()) {
          return colorScheme.dark ? "vs-dark" /* VS_DARK */ : "vs" /* VS */;
        }
        return void 0;
      }
      isAutoDetectColorScheme() {
        if (Setting.DETECT_COLOR_SCHEME.getValue(this.configurationService)) {
          return true;
        }
        return false;
      }
      getBackgroundColor() {
        const preferred = this.getPreferredBaseTheme();
        const stored = this.getStoredBaseTheme();
        if (preferred === void 0 || preferred === stored) {
          const storedBackground = this.stateService.getItem(THEME_BG_STORAGE_KEY, null);
          if (storedBackground) {
            return storedBackground;
          }
        }
        switch (preferred ?? stored) {
          case "vs" /* VS */:
            return DEFAULT_BG_LIGHT;
          case "hc-black" /* HC_BLACK */:
            return DEFAULT_BG_HC_BLACK;
          case "hc-light" /* HC_LIGHT */:
            return DEFAULT_BG_HC_LIGHT;
          default:
            return DEFAULT_BG_DARK;
        }
      }
      getStoredBaseTheme() {
        const baseTheme = this.stateService.getItem(THEME_STORAGE_KEY, "vs-dark" /* VS_DARK */).split(" ")[0];
        switch (baseTheme) {
          case "vs" /* VS */:
            return "vs" /* VS */;
          case "hc-black" /* HC_BLACK */:
            return "hc-black" /* HC_BLACK */;
          case "hc-light" /* HC_LIGHT */:
            return "hc-light" /* HC_LIGHT */;
          default:
            return "vs-dark" /* VS_DARK */;
        }
      }
      saveWindowSplash(windowId, workspace, splash) {
        const splashOverride = this.updateWindowSplashOverride(workspace, splash);
        this.stateService.setItems(coalesce([
          { key: THEME_STORAGE_KEY, data: splash.baseTheme },
          { key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
          { key: THEME_WINDOW_SPLASH_KEY, data: splash },
          splashOverride ? { key: THEME_WINDOW_SPLASH_OVERRIDE_KEY, data: splashOverride } : void 0
        ]));
        if (typeof windowId === "number") {
          this.updateBackgroundColor(windowId, splash);
        }
        this.updateSystemColorTheme();
      }
      updateWindowSplashOverride(workspace, splash) {
        let splashOverride = void 0;
        let changed = false;
        if (workspace) {
          splashOverride = { ...this.getWindowSplashOverride() };
          changed = this.doUpdateWindowSplashOverride(workspace, splash, splashOverride, "sideBar");
          changed = this.doUpdateWindowSplashOverride(workspace, splash, splashOverride, "auxiliaryBar") || changed;
        }
        return changed ? splashOverride : void 0;
      }
      doUpdateWindowSplashOverride(workspace, splash, splashOverride, part) {
        const currentWidth = part === "sideBar" ? splash.layoutInfo?.sideBarWidth : splash.layoutInfo?.auxiliaryBarWidth;
        const overrideWidth = part === "sideBar" ? splashOverride.layoutInfo.sideBarWidth : splashOverride.layoutInfo.auxiliaryBarWidth;
        let changed = false;
        if (typeof currentWidth !== "number") {
          if (splashOverride.layoutInfo.workspaces[workspace.id]) {
            delete splashOverride.layoutInfo.workspaces[workspace.id];
            changed = true;
          }
          return changed;
        }
        let workspaceOverride = splashOverride.layoutInfo.workspaces[workspace.id];
        if (!workspaceOverride) {
          const workspaceEntries = Object.keys(splashOverride.layoutInfo.workspaces);
          if (workspaceEntries.length >= ThemeMainService.WORKSPACE_OVERRIDE_LIMIT) {
            delete splashOverride.layoutInfo.workspaces[workspaceEntries[0]];
            changed = true;
          }
          workspaceOverride = { sideBarVisible: false, auxiliaryBarVisible: false };
          splashOverride.layoutInfo.workspaces[workspace.id] = workspaceOverride;
          changed = true;
        }
        if (currentWidth > 0) {
          if (overrideWidth !== currentWidth) {
            splashOverride.layoutInfo[part === "sideBar" ? "sideBarWidth" : "auxiliaryBarWidth"] = currentWidth;
            changed = true;
          }
          switch (part) {
            case "sideBar":
              if (!workspaceOverride.sideBarVisible) {
                workspaceOverride.sideBarVisible = true;
                changed = true;
              }
              break;
            case "auxiliaryBar":
              if (!workspaceOverride.auxiliaryBarVisible) {
                workspaceOverride.auxiliaryBarVisible = true;
                changed = true;
              }
              break;
          }
        } else {
          switch (part) {
            case "sideBar":
              if (workspaceOverride.sideBarVisible) {
                workspaceOverride.sideBarVisible = false;
                changed = true;
              }
              break;
            case "auxiliaryBar":
              if (workspaceOverride.auxiliaryBarVisible) {
                workspaceOverride.auxiliaryBarVisible = false;
                changed = true;
              }
              break;
          }
        }
        return changed;
      }
      updateBackgroundColor(windowId, splash) {
        for (const window2 of getAllWindowsExcludingOffscreen()) {
          if (window2.id === windowId) {
            window2.setBackgroundColor(splash.colorInfo.background);
            break;
          }
        }
      }
      getWindowSplash(workspace) {
        try {
          return this.doGetWindowSplash(workspace);
        } catch (error) {
          this.logService.error("[theme main service] Failed to get window splash", error);
          return void 0;
        }
      }
      doGetWindowSplash(workspace) {
        const partSplash = this.stateService.getItem(THEME_WINDOW_SPLASH_KEY);
        if (!partSplash?.layoutInfo) {
          return partSplash;
        }
        const override = this.getWindowSplashOverride();
        let sideBarWidth;
        if (workspace) {
          if (override.layoutInfo.workspaces[workspace.id]?.sideBarVisible === false) {
            sideBarWidth = 0;
          } else {
            sideBarWidth = override.layoutInfo.sideBarWidth || partSplash.layoutInfo.sideBarWidth || ThemeMainService.DEFAULT_BAR_WIDTH;
          }
        } else {
          sideBarWidth = 0;
        }
        const auxiliaryBarDefaultVisibility = Setting.AUXILIARYBAR_DEFAULT_VISIBILITY.getValue(this.configurationService);
        const startupEditor = Setting.STARTUP_EDITOR.getValue(this.configurationService);
        let auxiliaryBarWidth;
        if (workspace) {
          const auxiliaryBarVisible = override.layoutInfo.workspaces[workspace.id]?.auxiliaryBarVisible;
          if (auxiliaryBarVisible === true) {
            auxiliaryBarWidth = override.layoutInfo.auxiliaryBarWidth || partSplash.layoutInfo.auxiliaryBarWidth || ThemeMainService.DEFAULT_BAR_WIDTH;
          } else if (auxiliaryBarVisible === false) {
            auxiliaryBarWidth = 0;
          } else {
            if (startupEditor !== "agentSessionsWelcomePage" && (auxiliaryBarDefaultVisibility === "visible" || auxiliaryBarDefaultVisibility === "visibleInWorkspace")) {
              auxiliaryBarWidth = override.layoutInfo.auxiliaryBarWidth || partSplash.layoutInfo.auxiliaryBarWidth || ThemeMainService.DEFAULT_BAR_WIDTH;
            } else if (startupEditor !== "agentSessionsWelcomePage" && (auxiliaryBarDefaultVisibility === "maximized" || auxiliaryBarDefaultVisibility === "maximizedInWorkspace")) {
              auxiliaryBarWidth = Number.MAX_SAFE_INTEGER;
            } else {
              auxiliaryBarWidth = 0;
            }
          }
        } else {
          auxiliaryBarWidth = 0;
        }
        const partBounds = sideBarWidth === partSplash.layoutInfo.sideBarWidth && auxiliaryBarWidth === partSplash.layoutInfo.auxiliaryBarWidth ? partSplash.layoutInfo.partBounds : void 0;
        return {
          ...partSplash,
          layoutInfo: {
            ...partSplash.layoutInfo,
            sideBarWidth,
            auxiliaryBarWidth,
            partBounds
          }
        };
      }
      getWindowSplashOverride() {
        let override = this.stateService.getItem(THEME_WINDOW_SPLASH_OVERRIDE_KEY);
        if (!override?.layoutInfo) {
          override = {
            layoutInfo: {
              sideBarWidth: ThemeMainService.DEFAULT_BAR_WIDTH,
              auxiliaryBarWidth: ThemeMainService.DEFAULT_BAR_WIDTH,
              workspaces: {}
            }
          };
        }
        if (!override.layoutInfo.sideBarWidth) {
          override.layoutInfo.sideBarWidth = ThemeMainService.DEFAULT_BAR_WIDTH;
        }
        if (!override.layoutInfo.auxiliaryBarWidth) {
          override.layoutInfo.auxiliaryBarWidth = ThemeMainService.DEFAULT_BAR_WIDTH;
        }
        if (!override.layoutInfo.workspaces) {
          override.layoutInfo.workspaces = {};
        }
        return override;
      }
    };
    ThemeMainService = __decorateClass([
      __decorateParam(0, IStateService),
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, ILogService)
    ], ThemeMainService);
  }
});
export { electron10, DEFAULT_BG_LIGHT, DEFAULT_BG_DARK, DEFAULT_BG_HC_BLACK, DEFAULT_BG_HC_LIGHT, THEME_STORAGE_KEY, THEME_BG_STORAGE_KEY, THEME_WINDOW_SPLASH_KEY, THEME_WINDOW_SPLASH_OVERRIDE_KEY, Setting, ThemeMainService, init_themeMainServiceImpl };
