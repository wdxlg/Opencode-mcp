// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/window/common/window.ts
import { init_platform, isMacintosh, isNative, isWeb } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/window/common/window.ts
function isWorkspaceToOpen(uriToOpen) {
  return !!uriToOpen.workspaceUri;
}

function isFolderToOpen(uriToOpen) {
  return !!uriToOpen.folderUri;
}

function isFileToOpen(uriToOpen) {
  return !!uriToOpen.fileUri;
}

function hasNativeContextMenu(configurationService, titleBarStyle) {
  if (isWeb) {
    return false;
  }
  const nativeTitle = hasNativeTitlebar(configurationService, titleBarStyle);
  const windowConfigurations = configurationService.getValue("window");
  if (windowConfigurations?.menuStyle === "native" /* NATIVE */) {
    if (!isMacintosh && !nativeTitle) {
      return false;
    }
    return true;
  }
  if (windowConfigurations?.menuStyle === "custom" /* CUSTOM */) {
    return false;
  }
  return nativeTitle;
}

function hasNativeMenu(configurationService, titleBarStyle) {
  if (isWeb) {
    return false;
  }
  if (isMacintosh) {
    return true;
  }
  return hasNativeContextMenu(configurationService, titleBarStyle);
}

function getMenuBarVisibility(configurationService) {
  const menuBarVisibility = configurationService.getValue("window.menuBarVisibility" /* MenuBarVisibility */);
  if (menuBarVisibility === "default" || menuBarVisibility === "compact" && hasNativeMenu(configurationService) || isMacintosh && isNative) {
    return "classic";
  } else {
    return menuBarVisibility;
  }
}

function hasNativeTitlebar(configurationService, titleBarStyle) {
  if (!titleBarStyle) {
    titleBarStyle = getTitleBarStyle(configurationService);
  }
  return titleBarStyle === "native" /* NATIVE */;
}

function getTitleBarStyle(configurationService) {
  if (isWeb) {
    return "custom" /* CUSTOM */;
  }
  const configuration = configurationService.getValue("window");
  if (configuration) {
    const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
    if (useNativeTabs) {
      return "native" /* NATIVE */;
    }
    const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
    if (useSimpleFullScreen) {
      return "native" /* NATIVE */;
    }
    const style = configuration.titleBarStyle;
    if (style === "native" /* NATIVE */ || style === "custom" /* CUSTOM */) {
      return style;
    }
  }
  return "custom" /* CUSTOM */;
}

function getWindowControlsStyle(configurationService) {
  if (isWeb || isMacintosh || getTitleBarStyle(configurationService) === "native" /* NATIVE */) {
    return "native" /* NATIVE */;
  }
  const configuration = configurationService.getValue("window");
  const style = configuration?.controlsStyle;
  if (style === "custom" /* CUSTOM */ || style === "hidden" /* HIDDEN */) {
    return style;
  }
  return "native" /* NATIVE */;
}

function useWindowControlsOverlay(configurationService) {
  if (isWeb) {
    return false;
  }
  if (hasNativeTitlebar(configurationService)) {
    return false;
  }
  if (!isMacintosh) {
    const setting = getWindowControlsStyle(configurationService);
    if (setting === "custom" /* CUSTOM */ || setting === "hidden" /* HIDDEN */) {
      return false;
    }
  }
  return true;
}

function useNativeFullScreen(configurationService) {
  const windowConfig = configurationService.getValue("window");
  if (!windowConfig || typeof windowConfig.nativeFullScreen !== "boolean") {
    return true;
  }
  if (windowConfig.nativeTabs) {
    return true;
  }
  return windowConfig.nativeFullScreen !== false;
}

function zoomLevelToZoomFactor(zoomLevel = 0) {
  return 1.2 ** zoomLevel;
}

var WindowMinimumSize, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, DEFAULT_EMPTY_WINDOW_SIZE, DEFAULT_WORKSPACE_WINDOW_SIZE, DEFAULT_AUX_WINDOW_SIZE;

var init_window = __esm({
  "src/vs/platform/window/common/window.ts"() {
    init_platform();
    WindowMinimumSize = {
      WIDTH: 400,
      WIDTH_WITH_VERTICAL_PANEL: 600,
      HEIGHT: 270
    };
    DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;
    DEFAULT_EMPTY_WINDOW_SIZE = { width: 1200, height: 800 };
    DEFAULT_WORKSPACE_WINDOW_SIZE = { width: 1440, height: 900 };
    DEFAULT_AUX_WINDOW_SIZE = { width: 1024, height: 768 };
  }
});
export { isWorkspaceToOpen, isFolderToOpen, isFileToOpen, hasNativeContextMenu, hasNativeMenu, getMenuBarVisibility, hasNativeTitlebar, getTitleBarStyle, getWindowControlsStyle, useWindowControlsOverlay, useNativeFullScreen, zoomLevelToZoomFactor, WindowMinimumSize, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, DEFAULT_EMPTY_WINDOW_SIZE, DEFAULT_WORKSPACE_WINDOW_SIZE, DEFAULT_AUX_WINDOW_SIZE, init_window };
