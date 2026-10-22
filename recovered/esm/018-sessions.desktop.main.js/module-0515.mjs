// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/window/common/window.ts
import { isMacintosh, isNative, isWeb } from "./module-0014.mjs";


// src/vs/platform/window/common/window.ts
var WindowMinimumSize = {
  WIDTH: 400,
  WIDTH_WITH_VERTICAL_PANEL: 600,
  HEIGHT: 270
};

function isOpenedAuxiliaryWindow(candidate) {
  return typeof candidate.parentId === "number";
}

function isAgentsWindowOpenSource(value2) {
  switch (value2) {
    case "commandPalette" /* CommandPalette */:
    case "keyboardShortcut" /* KeyboardShortcut */:
    case "titleBar" /* TitleBar */:
    case "chatTitleBar" /* ChatTitleBar */:
    case "chatHandoff" /* ChatHandoff */:
    case "banner" /* Banner */:
    case "commandLine" /* CommandLine */:
    case "unknown" /* Unknown */:
      return true;
    default:
      return false;
  }
}

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

function hasCustomTitlebar(configurationService, titleBarStyle) {
  return true;
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
  const configuration2 = configurationService.getValue("window");
  if (configuration2) {
    const useNativeTabs = isMacintosh && configuration2.nativeTabs === true;
    if (useNativeTabs) {
      return "native" /* NATIVE */;
    }
    const useSimpleFullScreen = isMacintosh && configuration2.nativeFullScreen === false;
    if (useSimpleFullScreen) {
      return "native" /* NATIVE */;
    }
    const style = configuration2.titleBarStyle;
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
  const configuration2 = configurationService.getValue("window");
  const style = configuration2?.controlsStyle;
  if (style === "custom" /* CUSTOM */ || style === "hidden" /* HIDDEN */) {
    return style;
  }
  return "native" /* NATIVE */;
}

var DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;

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

function zoomLevelToZoomFactor(zoomLevel = 0) {
  return 1.2 ** zoomLevel;
}

var DEFAULT_AUX_WINDOW_SIZE = { width: 1024, height: 768 };
export { isOpenedAuxiliaryWindow, isAgentsWindowOpenSource, isWorkspaceToOpen, isFolderToOpen, isFileToOpen, hasNativeContextMenu, hasNativeMenu, getMenuBarVisibility, hasCustomTitlebar, hasNativeTitlebar, getTitleBarStyle, getWindowControlsStyle, useWindowControlsOverlay, zoomLevelToZoomFactor, WindowMinimumSize, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, DEFAULT_AUX_WINDOW_SIZE };
