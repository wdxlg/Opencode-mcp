// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/windows/electron-main/windows.ts
import { IThemeMainService, init_themeMainService } from "./module-0100.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { WindowMinimumSize, hasNativeTitlebar, init_window, useNativeFullScreen, useWindowControlsOverlay, zoomLevelToZoomFactor } from "./module-0096.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { init_path, join4 } from "./module-0008.mjs";
import { Color, init_color } from "./module-0098.mjs";
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { defaultWindowState, init_window2 } from "./module-0097.mjs";


// src/vs/platform/windows/electron-main/windows.ts
import electron3 from "electron";

function defaultBrowserWindowOptions(accessor, windowState, overrides, webPreferences) {
  const themeMainService = accessor.get(IThemeMainService);
  const productService = accessor.get(IProductService);
  const configurationService = accessor.get(IConfigurationService);
  const environmentMainService = accessor.get(IEnvironmentMainService);
  const windowSettings2 = configurationService.getValue("window");
  const options = {
    backgroundColor: themeMainService.getBackgroundColor(),
    minWidth: WindowMinimumSize.WIDTH,
    minHeight: WindowMinimumSize.HEIGHT,
    title: productService.nameLong,
    show: windowState.mode !== 0 /* Maximized */ && windowState.mode !== 3 /* Fullscreen */,
    // reduce flicker by showing later
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      ...webPreferences,
      enableWebSQL: false,
      spellcheck: false,
      zoomFactor: zoomLevelToZoomFactor(windowState.zoomLevel ?? windowSettings2?.zoomLevel),
      autoplayPolicy: "user-gesture-required",
      // Enable experimental css highlight api https://chromestatus.com/feature/5436441440026624
      // Refs https://github.com/microsoft/vscode/issues/140098
      enableBlinkFeatures: "HighlightAPI",
      sandbox: true,
      // TODO(deepak1556): Should be removed once migration is complete
      // https://github.com/microsoft/vscode/issues/239228
      enableDeprecatedPaste: true
    },
    experimentalDarkMode: true
  };
  if (isWindows2) {
    let borderSetting = windowSettings2?.border || "default";
    if (borderSetting === "system") {
      borderSetting = "default";
    }
    if (borderSetting !== "default") {
      if (borderSetting === "off") {
        options.accentColor = false;
      } else if (typeof borderSetting === "string") {
        options.accentColor = borderSetting;
      }
    }
  }
  if (isLinux) {
    options.icon = join4(environmentMainService.appRoot, "resources/linux/code.png");
  } else if (isWindows2) {
    if (!environmentMainService.isBuilt) {
      options.icon = join4(environmentMainService.appRoot, "resources/win32/code_150x150.png");
    }
  }
  if (isMacintosh) {
    options.acceptFirstMouse = true;
    if (windowSettings2?.clickThroughInactive === false) {
      options.acceptFirstMouse = false;
    }
  }
  if (overrides?.disableFullscreen) {
    options.fullscreen = false;
  } else if (isMacintosh && !useNativeFullScreen(configurationService)) {
    options.fullscreenable = false;
  }
  const useNativeTabs = isMacintosh && windowSettings2?.nativeTabs === true;
  if (useNativeTabs) {
    options.tabbingIdentifier = productService.nameShort;
  }
  const hideNativeTitleBar = !hasNativeTitlebar(configurationService, overrides?.forceNativeTitlebar ? "native" /* NATIVE */ : void 0);
  if (hideNativeTitleBar) {
    options.titleBarStyle = "hidden";
    if (!isMacintosh) {
      options.frame = false;
    }
    if (useWindowControlsOverlay(configurationService)) {
      if (isMacintosh) {
        options.titleBarOverlay = true;
      } else {
        const titleBarColor = themeMainService.getWindowSplash(void 0)?.colorInfo.titleBarBackground ?? themeMainService.getBackgroundColor();
        const symbolColor = Color.fromHex(titleBarColor).isDarker() ? "#FFFFFF" : "#000000";
        options.titleBarOverlay = {
          height: 29,
          // the smallest size of the title bar on windows accounting for the border on windows 11
          color: titleBarColor,
          symbolColor
        };
      }
    }
  }
  if (overrides?.alwaysOnTop) {
    options.alwaysOnTop = true;
  }
  if (overrides?.frameless) {
    options.frame = false;
    options.titleBarStyle = void 0;
    options.titleBarOverlay = void 0;
    options.minWidth = 1;
    options.minHeight = 1;
  }
  if (overrides?.backgroundColor) {
    options.backgroundColor = overrides.backgroundColor;
  }
  if (overrides?.transparent) {
    options.transparent = true;
    options.backgroundColor = void 0;
  }
  if (overrides?.notResizable) {
    options.resizable = false;
  }
  if (overrides?.noBackgroundThrottling) {
    options.webPreferences = {
      ...options.webPreferences,
      backgroundThrottling: false
    };
  }
  return options;
}

function getLastFocused(windows) {
  let lastFocusedWindow = void 0;
  let maxLastFocusTime = Number.MIN_VALUE;
  for (const window2 of windows) {
    if (window2.lastFocusTime > maxLastFocusTime) {
      maxLastFocusTime = window2.lastFocusTime;
      lastFocusedWindow = window2;
    }
  }
  return lastFocusedWindow;
}

function getAllWindowsExcludingOffscreen() {
  return electron3.BrowserWindow.getAllWindows().filter((win) => !win.webContents.isOffscreen());
}

var IWindowsMainService, WindowStateValidator;

var init_windows = __esm({
  "src/vs/platform/windows/electron-main/windows.ts"() {
    init_color();
    init_path();
    init_platform();
    init_configuration();
    init_environmentMainService();
    init_instantiation();
    init_productService();
    init_themeMainService();
    init_window();
    init_window2();
    IWindowsMainService = createDecorator("windowsMainService");
    ((WindowStateValidator2) => {
      function validateWindowState(logService, state, displays = electron3.screen.getAllDisplays()) {
        logService.trace(`window#validateWindowState: validating window state on ${displays.length} display(s)`, state);
        if (typeof state.x !== "number" || typeof state.y !== "number" || typeof state.width !== "number" || typeof state.height !== "number") {
          logService.trace("window#validateWindowState: unexpected type of state values");
          return void 0;
        }
        if (state.width <= 0 || state.height <= 0) {
          logService.trace("window#validateWindowState: unexpected negative values");
          return void 0;
        }
        if (displays.length === 1) {
          const displayWorkingArea2 = getWorkingArea(displays[0]);
          logService.trace("window#validateWindowState: single monitor working area", displayWorkingArea2);
          if (displayWorkingArea2) {
            let ensureStateInDisplayWorkingArea = function() {
              if (!state || typeof state.x !== "number" || typeof state.y !== "number" || !displayWorkingArea2) {
                return;
              }
              if (state.x < displayWorkingArea2.x) {
                state.x = displayWorkingArea2.x;
              }
              if (state.y < displayWorkingArea2.y) {
                state.y = displayWorkingArea2.y;
              }
            };
            ensureStateInDisplayWorkingArea();
            if (state.width > displayWorkingArea2.width) {
              state.width = displayWorkingArea2.width;
            }
            if (state.height > displayWorkingArea2.height) {
              state.height = displayWorkingArea2.height;
            }
            if (state.x > displayWorkingArea2.x + displayWorkingArea2.width - 128) {
              state.x = displayWorkingArea2.x + displayWorkingArea2.width - state.width;
            }
            if (state.y > displayWorkingArea2.y + displayWorkingArea2.height - 128) {
              state.y = displayWorkingArea2.y + displayWorkingArea2.height - state.height;
            }
            ensureStateInDisplayWorkingArea();
          }
          return state;
        }
        if (state.display && state.mode === 3 /* Fullscreen */) {
          const display2 = displays.find((d) => d.id === state.display);
          if (display2 && typeof display2.bounds?.x === "number" && typeof display2.bounds?.y === "number") {
            logService.trace("window#validateWindowState: restoring fullscreen to previous display");
            const defaults = defaultWindowState(3 /* Fullscreen */);
            defaults.x = display2.bounds.x;
            defaults.y = display2.bounds.y;
            return defaults;
          }
        }
        let display;
        let displayWorkingArea;
        try {
          display = electron3.screen.getDisplayMatching({ x: state.x, y: state.y, width: state.width, height: state.height });
          displayWorkingArea = getWorkingArea(display);
          logService.trace("window#validateWindowState: multi-monitor working area", displayWorkingArea);
        } catch (error) {
          logService.error("window#validateWindowState: error finding display for window state", error);
        }
        if (display && validateWindowStateOnDisplay(state, display)) {
          return state;
        }
        logService.trace("window#validateWindowState: state is outside of the multi-monitor working area");
        return void 0;
      }
      WindowStateValidator2.validateWindowState = validateWindowState;
      function validateWindowStateOnDisplay(state, display) {
        if (typeof state.x !== "number" || typeof state.y !== "number" || typeof state.width !== "number" || typeof state.height !== "number" || state.width <= 0 || state.height <= 0) {
          return false;
        }
        const displayWorkingArea = getWorkingArea(display);
        return Boolean(
          displayWorkingArea && // we have valid working area bounds
          state.x + state.width > displayWorkingArea.x && // prevent window from falling out of the screen to the left
          state.y + state.height > displayWorkingArea.y && // prevent window from falling out of the screen to the top
          state.x < displayWorkingArea.x + displayWorkingArea.width && // prevent window from falling out of the screen to the right
          state.y < displayWorkingArea.y + displayWorkingArea.height
          // prevent window from falling out of the screen to the bottom
        );
      }
      WindowStateValidator2.validateWindowStateOnDisplay = validateWindowStateOnDisplay;
      function getWorkingArea(display) {
        if (display.workArea.width > 0 && display.workArea.height > 0) {
          return display.workArea;
        }
        if (display.bounds.width > 0 && display.bounds.height > 0) {
          return display.bounds;
        }
        return void 0;
      }
    })(WindowStateValidator || (WindowStateValidator = {}));
  }
});
export { defaultBrowserWindowOptions, getLastFocused, getAllWindowsExcludingOffscreen, electron3, IWindowsMainService, WindowStateValidator, init_windows };
