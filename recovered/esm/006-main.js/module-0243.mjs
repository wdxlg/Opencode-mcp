// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/windows/electron-main/windowsStateHandler.ts
import { URI, init_uri } from "./module-0030.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_platform, isMacintosh } from "./module-0006.mjs";
import { extUriBiasedIgnorePathCase, init_resources } from "./module-0032.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { defaultWindowState, init_window2 } from "./module-0097.mjs";
import { init_workspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0076.mjs";


// src/vs/platform/windows/electron-main/windowsStateHandler.ts
import electron9 from "electron";

function restoreWindowsState(data) {
  const result = { openedWindows: [] };
  const windowsState = data || { openedWindows: [] };
  if (windowsState.lastActiveWindow) {
    result.lastActiveWindow = restoreWindowState(windowsState.lastActiveWindow);
  }
  if (windowsState.lastPluginDevelopmentHostWindow) {
    result.lastPluginDevelopmentHostWindow = restoreWindowState(windowsState.lastPluginDevelopmentHostWindow);
  }
  if (Array.isArray(windowsState.openedWindows)) {
    result.openedWindows = windowsState.openedWindows.map((windowState) => restoreWindowState(windowState));
  }
  return result;
}

function restoreWindowState(windowState) {
  const result = { uiState: windowState.uiState };
  if (windowState.backupPath) {
    result.backupPath = windowState.backupPath;
  }
  if (windowState.remoteAuthority) {
    result.remoteAuthority = windowState.remoteAuthority;
  }
  if (windowState.folder) {
    result.folderUri = URI.parse(windowState.folder);
  }
  if (windowState.workspaceIdentifier) {
    result.workspace = { id: windowState.workspaceIdentifier.id, configPath: URI.parse(windowState.workspaceIdentifier.configURIPath) };
  }
  return result;
}

function getWindowsStateStoreData(windowsState) {
  return {
    lastActiveWindow: windowsState.lastActiveWindow && serializeWindowState(windowsState.lastActiveWindow),
    lastPluginDevelopmentHostWindow: windowsState.lastPluginDevelopmentHostWindow && serializeWindowState(windowsState.lastPluginDevelopmentHostWindow),
    openedWindows: windowsState.openedWindows.map((ws) => serializeWindowState(ws))
  };
}

function serializeWindowState(windowState) {
  return {
    workspaceIdentifier: windowState.workspace && { id: windowState.workspace.id, configURIPath: windowState.workspace.configPath.toString() },
    folder: windowState.folderUri?.toString(),
    backupPath: windowState.backupPath,
    remoteAuthority: windowState.remoteAuthority,
    uiState: windowState.uiState
  };
}

var WindowsStateHandler;

var init_windowsStateHandler = __esm({
  "src/vs/platform/windows/electron-main/windowsStateHandler.ts"() {
    init_lifecycle();
    init_platform();
    init_resources();
    init_uri();
    init_configuration();
    init_lifecycleMainService();
    init_log();
    init_state();
    init_windows();
    init_window2();
    init_workspace();
    WindowsStateHandler = class extends Disposable {
      constructor(windowsMainService, stateService, lifecycleMainService, logService, configurationService) {
        super();
        this.windowsMainService = windowsMainService;
        this.stateService = stateService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.configurationService = configurationService;
        this.lastClosedState = void 0;
        this.shuttingDown = false;
        this._state = restoreWindowsState(this.stateService.getItem(WindowsStateHandler.windowsStateStorageKey));
        this.registerListeners();
      }
      static {
        this.windowsStateStorageKey = "windowsState";
      }
      get state() {
        return this._state;
      }
      registerListeners() {
        electron9.app.on("browser-window-blur", () => {
          if (!this.shuttingDown) {
            this.saveWindowsState();
          }
        });
        this._register(this.lifecycleMainService.onBeforeCloseWindow((window2) => this.onBeforeCloseWindow(window2)));
        this._register(this.lifecycleMainService.onBeforeShutdown(() => this.onBeforeShutdown()));
        this._register(this.windowsMainService.onDidChangeWindowsCount((e) => {
          if (e.newCount - e.oldCount > 0) {
            this.lastClosedState = void 0;
          }
        }));
        this._register(this.windowsMainService.onDidDestroyWindow((window2) => this.onBeforeCloseWindow(window2)));
      }
      // Note that onBeforeShutdown() and onBeforeCloseWindow() are fired in different order depending on the OS:
      // - macOS: since the app will not quit when closing the last window, you will always first get
      //          the onBeforeShutdown() event followed by N onBeforeCloseWindow() events for each window
      // - other: on other OS, closing the last window will quit the app so the order depends on the
      //          user interaction: closing the last window will first trigger onBeforeCloseWindow()
      //          and then onBeforeShutdown(). Using the quit action however will first issue onBeforeShutdown()
      //          and then onBeforeCloseWindow().
      //
      // Here is the behavior on different OS depending on action taken (Electron 1.7.x):
      //
      // Legend
      // -  quit(N): quit application with N windows opened
      // - close(1): close one window via the window close button
      // - closeAll: close all windows via the taskbar command
      // - onBeforeShutdown(N): number of windows reported in this event handler
      // - onBeforeCloseWindow(N, M): number of windows reported and quitRequested boolean in this event handler
      //
      // macOS
      // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
      // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
      // 	-     quit(0): onBeforeShutdown(0)
      // 	-    close(1): onBeforeCloseWindow(1, false)
      //
      // Windows
      // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
      // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
      // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
      // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
      // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
      //
      // Linux
      // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
      // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
      // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
      // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
      // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
      //
      onBeforeShutdown() {
        this.shuttingDown = true;
        this.saveWindowsState();
      }
      saveWindowsState() {
        const displaysWithFullScreenWindow = /* @__PURE__ */ new Set();
        const currentWindowsState = {
          openedWindows: [],
          lastPluginDevelopmentHostWindow: this._state.lastPluginDevelopmentHostWindow,
          lastActiveWindow: this.lastClosedState
        };
        if (!currentWindowsState.lastActiveWindow) {
          let activeWindow = this.windowsMainService.getLastActiveWindow();
          if (!activeWindow || activeWindow.isExtensionDevelopmentHost) {
            activeWindow = this.windowsMainService.getWindows().find((window2) => !window2.isExtensionDevelopmentHost);
          }
          if (activeWindow) {
            currentWindowsState.lastActiveWindow = this.toWindowState(activeWindow);
            if (currentWindowsState.lastActiveWindow.uiState.mode === 3 /* Fullscreen */) {
              displaysWithFullScreenWindow.add(currentWindowsState.lastActiveWindow.uiState.display);
            }
          }
        }
        const extensionHostWindow = this.windowsMainService.getWindows().find((window2) => window2.isExtensionDevelopmentHost && !window2.isExtensionTestHost);
        if (extensionHostWindow) {
          currentWindowsState.lastPluginDevelopmentHostWindow = this.toWindowState(extensionHostWindow);
          if (currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode === 3 /* Fullscreen */) {
            if (displaysWithFullScreenWindow.has(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display)) {
              if (isMacintosh && !extensionHostWindow.win?.isSimpleFullScreen()) {
                currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode = 1 /* Normal */;
              }
            } else {
              displaysWithFullScreenWindow.add(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display);
            }
          }
        }
        if (this.windowsMainService.getWindowCount() > 1) {
          currentWindowsState.openedWindows = this.windowsMainService.getWindows().filter((window2) => !window2.isExtensionDevelopmentHost).map((window2) => {
            const windowState = this.toWindowState(window2);
            if (windowState.uiState.mode === 3 /* Fullscreen */) {
              if (displaysWithFullScreenWindow.has(windowState.uiState.display)) {
                if (isMacintosh && windowState.windowId !== currentWindowsState.lastActiveWindow?.windowId && !window2.win?.isSimpleFullScreen()) {
                  windowState.uiState.mode = 1 /* Normal */;
                }
              } else {
                displaysWithFullScreenWindow.add(windowState.uiState.display);
              }
            }
            return windowState;
          });
        }
        const state = getWindowsStateStoreData(currentWindowsState);
        this.stateService.setItem(WindowsStateHandler.windowsStateStorageKey, state);
        if (this.shuttingDown) {
          this.logService.trace("[WindowsStateHandler] onBeforeShutdown", state);
        }
      }
      // See note on #onBeforeShutdown() for details how these events are flowing
      onBeforeCloseWindow(window2) {
        if (this.lifecycleMainService.quitRequested) {
          return;
        }
        const state = this.toWindowState(window2);
        if (window2.isExtensionDevelopmentHost && !window2.isExtensionTestHost) {
          this._state.lastPluginDevelopmentHostWindow = state;
        } else if (!window2.isExtensionDevelopmentHost && window2.openedWorkspace) {
          this._state.openedWindows.forEach((openedWindow) => {
            const sameWorkspace = isWorkspaceIdentifier(window2.openedWorkspace) && openedWindow.workspace?.id === window2.openedWorkspace.id;
            const sameFolder = isSingleFolderWorkspaceIdentifier(window2.openedWorkspace) && openedWindow.folderUri && extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, window2.openedWorkspace.uri);
            if (sameWorkspace || sameFolder) {
              openedWindow.uiState = state.uiState;
            }
          });
        }
        if (this.windowsMainService.getWindowCount() === 1) {
          this.lastClosedState = state;
        }
      }
      toWindowState(window2) {
        return {
          windowId: window2.id,
          workspace: isWorkspaceIdentifier(window2.openedWorkspace) ? window2.openedWorkspace : void 0,
          folderUri: isSingleFolderWorkspaceIdentifier(window2.openedWorkspace) ? window2.openedWorkspace.uri : void 0,
          backupPath: window2.backupPath,
          remoteAuthority: window2.remoteAuthority,
          uiState: window2.serializeWindowState()
        };
      }
      getNewWindowState(configuration) {
        const state = this.doGetNewWindowState(configuration);
        const windowConfig = this.configurationService.getValue("window");
        if (state.mode === 3 /* Fullscreen */) {
          let allowFullscreen;
          if (state.hasDefaultState) {
            allowFullscreen = !!(windowConfig?.newWindowDimensions && ["fullscreen", "inherit", "offset"].indexOf(windowConfig.newWindowDimensions) >= 0);
          } else {
            allowFullscreen = !!(this.lifecycleMainService.wasRestarted || windowConfig?.restoreFullscreen);
          }
          if (!allowFullscreen) {
            state.mode = 1 /* Normal */;
          }
        }
        return state;
      }
      doGetNewWindowState(configuration) {
        const lastActive = this.windowsMainService.getLastActiveWindow();
        if (!configuration.extensionTestsPath) {
          if (!!configuration.extensionDevelopmentPath && this.state.lastPluginDevelopmentHostWindow) {
            return this.state.lastPluginDevelopmentHostWindow.uiState;
          }
          const workspace = configuration.workspace;
          if (isWorkspaceIdentifier(workspace)) {
            const stateForWorkspace = this.state.openedWindows.filter((openedWindow) => openedWindow.workspace && openedWindow.workspace.id === workspace.id).map((openedWindow) => openedWindow.uiState);
            if (stateForWorkspace.length) {
              return stateForWorkspace[0];
            }
          }
          if (isSingleFolderWorkspaceIdentifier(workspace)) {
            const stateForFolder = this.state.openedWindows.filter((openedWindow) => openedWindow.folderUri && extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, workspace.uri)).map((openedWindow) => openedWindow.uiState);
            if (stateForFolder.length) {
              return stateForFolder[0];
            }
          } else if (configuration.backupPath) {
            const stateForEmptyWindow = this.state.openedWindows.filter((openedWindow) => openedWindow.backupPath === configuration.backupPath).map((openedWindow) => openedWindow.uiState);
            if (stateForEmptyWindow.length) {
              return stateForEmptyWindow[0];
            }
          }
          const lastActiveState = this.lastClosedState || this.state.lastActiveWindow;
          if (!lastActive && lastActiveState) {
            return lastActiveState.uiState;
          }
        }
        let displayToUse;
        const displays = electron9.screen.getAllDisplays();
        if (displays.length === 1) {
          displayToUse = displays[0];
        } else {
          if (isMacintosh) {
            const cursorPoint = electron9.screen.getCursorScreenPoint();
            displayToUse = electron9.screen.getDisplayNearestPoint(cursorPoint);
          }
          if (!displayToUse && lastActive) {
            displayToUse = electron9.screen.getDisplayMatching(lastActive.getBounds());
          }
          if (!displayToUse) {
            displayToUse = electron9.screen.getPrimaryDisplay() || displays[0];
          }
        }
        let state = defaultWindowState(void 0, isWorkspaceIdentifier(configuration.workspace) || isSingleFolderWorkspaceIdentifier(configuration.workspace));
        state.x = Math.round(displayToUse.bounds.x + displayToUse.bounds.width / 2 - state.width / 2);
        state.y = Math.round(displayToUse.bounds.y + displayToUse.bounds.height / 2 - state.height / 2);
        const windowConfig = this.configurationService.getValue("window");
        let ensureNoOverlap = true;
        if (windowConfig?.newWindowDimensions) {
          if (windowConfig.newWindowDimensions === "maximized") {
            state.mode = 0 /* Maximized */;
            ensureNoOverlap = false;
          } else if (windowConfig.newWindowDimensions === "fullscreen") {
            state.mode = 3 /* Fullscreen */;
            ensureNoOverlap = false;
          } else if ((windowConfig.newWindowDimensions === "inherit" || windowConfig.newWindowDimensions === "offset") && lastActive) {
            const lastActiveState = lastActive.serializeWindowState();
            if (lastActiveState.mode === 3 /* Fullscreen */) {
              state.mode = 3 /* Fullscreen */;
            } else {
              state = {
                ...lastActiveState,
                zoomLevel: void 0
                // do not inherit zoom level
              };
            }
            ensureNoOverlap = state.mode !== 3 /* Fullscreen */ && windowConfig.newWindowDimensions === "offset";
          }
        }
        if (ensureNoOverlap) {
          state = this.ensureNoOverlap(state);
        }
        state.hasDefaultState = true;
        return state;
      }
      ensureNoOverlap(state) {
        if (this.windowsMainService.getWindows().length === 0) {
          return state;
        }
        state.x = typeof state.x === "number" ? state.x : 0;
        state.y = typeof state.y === "number" ? state.y : 0;
        const existingWindowBounds = this.windowsMainService.getWindows().map((window2) => window2.getBounds());
        while (existingWindowBounds.some((bounds) => bounds.x === state.x || bounds.y === state.y)) {
          state.x += 30;
          state.y += 30;
        }
        return state;
      }
    };
    WindowsStateHandler = __decorateClass([
      __decorateParam(0, IWindowsMainService),
      __decorateParam(1, IStateService),
      __decorateParam(2, ILifecycleMainService),
      __decorateParam(3, ILogService),
      __decorateParam(4, IConfigurationService)
    ], WindowsStateHandler);
  }
});
export { restoreWindowsState, restoreWindowState, getWindowsStateStoreData, serializeWindowState, electron9, WindowsStateHandler, init_windowsStateHandler };
