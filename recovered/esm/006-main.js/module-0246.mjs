// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/windows/electron-main/windowsMainService.ts
import { hasWorkspaceFileExtension, init_workspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0076.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { addUNCHostToAllowlist, init_unc } from "./module-0037.mjs";
import { coalesce, distinct, init_arrays } from "./module-0013.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { init_charCode } from "./module-0023.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { init_extpath, isWindowsDriveLetter, parseLineAndColumnAware, sanitizeFilePath, toSlashes } from "./module-0028.mjs";
import { getPathLabel, init_labels } from "./module-0048.mjs";
import { Disposable, DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { basename, init_path, join4, normalize, posix } from "./module-0008.mjs";
import { getMarks, init_performance, mark } from "./module-0001.mjs";
import { OS, init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { cwd2, init_process } from "./module-0007.mjs";
import { extUriBiasedIgnorePathCase, init_resources, isEqual2, isEqualAuthority, normalizePath, originalFSPath, removeTrailingPathSeparator2 } from "./module-0032.mjs";
import { assertReturnsDefined, init_types } from "./module-0016.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { getNLSLanguage, getNLSMessages, init_nls, localize } from "./module-0005.mjs";
import { IBackupMainService, init_backup } from "./module-0111.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IDialogMainService, init_dialogMainService } from "./module-0123.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { IInstantiationService, init_instantiation } from "./module-0039.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_product, product_default } from "./module-0044.mjs";
import { IProtocolMainService, init_protocol } from "./module-0238.mjs";
import { getRemoteAuthority, init_remoteHosts } from "./module-0127.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { init_window, isFileToOpen, isFolderToOpen, isWorkspaceToOpen } from "./module-0096.mjs";
import { CodeWindow, init_windowImpl } from "./module-0242.mjs";
import { getLastFocused, init_windows } from "./module-0101.mjs";
import { findWindowOnExtensionDevelopmentPath, findWindowOnFile, findWindowOnWorkspaceOrFolder, init_windowsFinder } from "./module-0124.mjs";
import { WindowsStateHandler, init_windowsStateHandler } from "./module-0243.mjs";
import { createEmptyWorkspaceIdentifier, getSingleFolderWorkspaceIdentifier, getWorkspaceIdentifier, init_workspaces } from "./module-0114.mjs";
import { IWorkspacesHistoryMainService, init_workspacesHistoryMainService } from "./module-0203.mjs";
import { IWorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";
import { init_window2 } from "./module-0097.mjs";
import { IThemeMainService, init_themeMainService } from "./module-0100.mjs";
import { IPolicyService, init_policy2 } from "./module-0210.mjs";
import { IUserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { ILoggerMainService, init_loggerService2 } from "./module-0213.mjs";
import { IAuxiliaryWindowsMainService, init_auxiliaryWindows } from "./module-0140.mjs";
import { ICSSDevelopmentService, init_cssDevService } from "./module-0245.mjs";
import { ResourceSet, init_map } from "./module-0014.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";


// src/vs/platform/windows/electron-main/windowsMainService.ts
import * as fs11 from "fs";

import { app as app11, BrowserWindow as BrowserWindow5, shell as shell3 } from "electron";

import { hostname, release as release7, arch as arch3 } from "os";

function isWorkspacePathToOpen(path4) {
  return isWorkspaceIdentifier(path4?.workspace);
}

function isSingleFolderWorkspacePathToOpen(path4) {
  return isSingleFolderWorkspaceIdentifier(path4?.workspace);
}

var EMPTY_WINDOW, WindowsMainService;

var init_windowsMainService = __esm({
  "src/vs/platform/windows/electron-main/windowsMainService.ts"() {
    init_unc();
    init_arrays();
    init_cancellation();
    init_charCode();
    init_event();
    init_extpath();
    init_labels();
    init_lifecycle();
    init_network();
    init_path();
    init_performance();
    init_platform();
    init_process();
    init_resources();
    init_types();
    init_uri();
    init_nls();
    init_backup();
    init_configuration();
    init_dialogMainService();
    init_environmentMainService();
    init_files();
    init_instantiation();
    init_lifecycleMainService();
    init_log();
    init_product();
    init_protocol();
    init_remoteHosts();
    init_state();
    init_window();
    init_windowImpl();
    init_windows();
    init_windowsFinder();
    init_windowsStateHandler();
    init_workspace();
    init_workspaces();
    init_workspacesHistoryMainService();
    init_workspacesManagementMainService();
    init_window2();
    init_themeMainService();
    init_policy2();
    init_userDataProfile3();
    init_loggerService2();
    init_auxiliaryWindows();
    init_cssDevService();
    init_map();
    init_buffer();
    EMPTY_WINDOW = /* @__PURE__ */ Object.create(null);
    WindowsMainService = class extends Disposable {
      constructor(machineId2, sqmId, devDeviceId, initialUserEnv, logService, loggerService, stateService, policyService, environmentMainService, userDataProfilesMainService, lifecycleMainService, backupMainService, configurationService, workspacesHistoryMainService, workspacesManagementMainService, instantiationService, dialogMainService, fileService, protocolMainService, themeMainService, auxiliaryWindowsMainService, cssDevelopmentService) {
        super();
        this.machineId = machineId2;
        this.sqmId = sqmId;
        this.devDeviceId = devDeviceId;
        this.initialUserEnv = initialUserEnv;
        this.logService = logService;
        this.loggerService = loggerService;
        this.policyService = policyService;
        this.environmentMainService = environmentMainService;
        this.userDataProfilesMainService = userDataProfilesMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.backupMainService = backupMainService;
        this.configurationService = configurationService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.instantiationService = instantiationService;
        this.dialogMainService = dialogMainService;
        this.fileService = fileService;
        this.protocolMainService = protocolMainService;
        this.themeMainService = themeMainService;
        this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
        this.cssDevelopmentService = cssDevelopmentService;
        this._onDidOpenWindow = this._register(new Emitter());
        this.onDidOpenWindow = this._onDidOpenWindow.event;
        this._onDidSignalReadyWindow = this._register(new Emitter());
        this.onDidSignalReadyWindow = this._onDidSignalReadyWindow.event;
        this._onDidDestroyWindow = this._register(new Emitter());
        this.onDidDestroyWindow = this._onDidDestroyWindow.event;
        this._onDidChangeWindowsCount = this._register(new Emitter());
        this.onDidChangeWindowsCount = this._onDidChangeWindowsCount.event;
        this._onDidMaximizeWindow = this._register(new Emitter());
        this.onDidMaximizeWindow = this._onDidMaximizeWindow.event;
        this._onDidUnmaximizeWindow = this._register(new Emitter());
        this.onDidUnmaximizeWindow = this._onDidUnmaximizeWindow.event;
        this._onDidChangeFullScreen = this._register(new Emitter());
        this.onDidChangeFullScreen = this._onDidChangeFullScreen.event;
        this._onDidTriggerSystemContextMenu = this._register(new Emitter());
        this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
        this.windows = /* @__PURE__ */ new Map();
        this.windowsStateHandler = this._register(new WindowsStateHandler(this, stateService, this.lifecycleMainService, this.logService, this.configurationService));
        this.registerListeners();
      }
      registerListeners() {
        this._register(this.workspacesManagementMainService.onDidEnterWorkspace((event) => this._onDidSignalReadyWindow.fire(event.window)));
        this._register(this.onDidSignalReadyWindow((window2) => {
          if (window2.config?.extensionDevelopmentPath || window2.config?.extensionTestsPath) {
            const disposables = new DisposableStore();
            disposables.add(Event.any(window2.onDidClose, window2.onDidDestroy)(() => disposables.dispose()));
            if (window2.config.extensionDevelopmentPath) {
              for (const extensionDevelopmentPath of window2.config.extensionDevelopmentPath) {
                disposables.add(this.protocolMainService.addValidFileRoot(extensionDevelopmentPath));
              }
            }
            if (window2.config.extensionTestsPath) {
              disposables.add(this.protocolMainService.addValidFileRoot(window2.config.extensionTestsPath));
            }
          }
        }));
      }
      openEmptyWindow(openConfig, options) {
        const cli = this.environmentMainService.args;
        const remoteAuthority = options?.remoteAuthority || void 0;
        const forceEmpty = true;
        const forceReuseWindow = options?.forceReuseWindow;
        const forceNewWindow = !forceReuseWindow;
        return this.open({ ...openConfig, cli, forceEmpty, forceNewWindow, forceReuseWindow, remoteAuthority, forceTempProfile: options?.forceTempProfile, forceProfile: options?.forceProfile });
      }
      openExistingWindow(window2, openConfig) {
        window2.focus();
        this.handleWaitMarkerFile(openConfig, [window2]);
        this.handleChatRequest(openConfig, [window2]);
      }
      async openAgentsWindow(openConfig, folderUri, sessionResource, source) {
        throw new Error("OPENCODE_NATIVE_AGENTS_WINDOW_DISABLED: Use Bridge in the main OpenCode window.");
      }
      async open(openConfig) {
        this.logService.trace("windowsManager#open");
        if ((openConfig.addMode || openConfig.removeMode) && (openConfig.initialStartup || !this.getLastActiveWindow())) {
          openConfig.addMode = false;
          openConfig.removeMode = false;
        }
        const foldersToAdd = [];
        const foldersToRemove = [];
        const foldersToOpen = [];
        const workspacesToOpen = [];
        const untitledWorkspacesToRestore = [];
        const emptyWindowsWithBackupsToRestore = [];
        let filesToOpen;
        let maybeOpenEmptyWindow = false;
        const pathsToOpen = await this.getPathsToOpen(openConfig);
        this.logService.trace("windowsManager#open pathsToOpen", pathsToOpen);
        for (const path4 of pathsToOpen) {
          if (isSingleFolderWorkspacePathToOpen(path4)) {
            if (openConfig.addMode) {
              foldersToAdd.push(path4);
            } else if (openConfig.removeMode) {
              foldersToRemove.push(path4);
            } else {
              foldersToOpen.push(path4);
            }
          } else if (isWorkspacePathToOpen(path4)) {
            workspacesToOpen.push(path4);
          } else if (path4.fileUri) {
            if (!filesToOpen) {
              filesToOpen = { filesToOpenOrCreate: [], filesToDiff: [], filesToMerge: [], remoteAuthority: path4.remoteAuthority };
            }
            filesToOpen.filesToOpenOrCreate.push(path4);
          } else if (path4.backupPath) {
            emptyWindowsWithBackupsToRestore.push({ backupFolder: basename(path4.backupPath), remoteAuthority: path4.remoteAuthority });
          } else {
            maybeOpenEmptyWindow = true;
          }
        }
        if (openConfig.diffMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length >= 2) {
          filesToOpen.filesToDiff = filesToOpen.filesToOpenOrCreate.slice(0, 2);
          filesToOpen.filesToOpenOrCreate = [];
        }
        if (openConfig.mergeMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length === 4) {
          filesToOpen.filesToMerge = filesToOpen.filesToOpenOrCreate.slice(0, 4);
          filesToOpen.filesToOpenOrCreate = [];
          filesToOpen.filesToDiff = [];
        }
        if (filesToOpen && openConfig.waitMarkerFileURI) {
          filesToOpen.filesToWait = { paths: coalesce([...filesToOpen.filesToDiff, filesToOpen.filesToMerge[3], ...filesToOpen.filesToOpenOrCreate]), waitMarkerFileUri: openConfig.waitMarkerFileURI };
        }
        if (openConfig.initialStartup) {
          untitledWorkspacesToRestore.push(...this.workspacesManagementMainService.getUntitledWorkspaces());
          workspacesToOpen.push(...untitledWorkspacesToRestore);
          emptyWindowsWithBackupsToRestore.push(...this.backupMainService.getEmptyWindowBackups());
        } else {
          emptyWindowsWithBackupsToRestore.length = 0;
        }
        const { windows: usedWindows, filesOpenedInWindow } = await this.doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyWindowsWithBackupsToRestore, maybeOpenEmptyWindow, filesToOpen, foldersToAdd, foldersToRemove);
        this.logService.trace(`windowsManager#open used window count ${usedWindows.length} (workspacesToOpen: ${workspacesToOpen.length}, foldersToOpen: ${foldersToOpen.length}, emptyToRestore: ${emptyWindowsWithBackupsToRestore.length}, maybeOpenEmptyWindow: ${maybeOpenEmptyWindow})`);
        if (usedWindows.length > 1) {
          if (filesOpenedInWindow) {
            filesOpenedInWindow.focus();
          } else {
            const focusLastActive = this.windowsStateHandler.state.lastActiveWindow && !openConfig.forceEmpty && !openConfig.cli._.length && !openConfig.cli["file-uri"] && !openConfig.cli["folder-uri"] && !openConfig.urisToOpen?.length;
            let focusLastOpened = true;
            let focusLastWindow = true;
            if (focusLastActive) {
              const lastActiveWindow = usedWindows.filter((window2) => this.windowsStateHandler.state.lastActiveWindow && window2.backupPath === this.windowsStateHandler.state.lastActiveWindow.backupPath);
              if (lastActiveWindow.length) {
                lastActiveWindow[0].focus();
                focusLastOpened = false;
                focusLastWindow = false;
              }
            }
            if (focusLastOpened) {
              for (let i = usedWindows.length - 1; i >= 0; i--) {
                const usedWindow = usedWindows[i];
                if (usedWindow.openedWorkspace && untitledWorkspacesToRestore.some((workspace) => usedWindow.openedWorkspace && workspace.workspace.id === usedWindow.openedWorkspace.id) || // skip over restored workspace
                usedWindow.backupPath && emptyWindowsWithBackupsToRestore.some((empty) => usedWindow.backupPath && empty.backupFolder === basename(usedWindow.backupPath))) {
                  continue;
                }
                usedWindow.focus();
                focusLastWindow = false;
                break;
              }
            }
            if (focusLastWindow) {
              usedWindows[usedWindows.length - 1].focus();
            }
          }
        }
        const isDiff = filesToOpen && filesToOpen.filesToDiff.length > 0;
        const isMerge = filesToOpen && filesToOpen.filesToMerge.length > 0;
        if (!usedWindows.some((window2) => window2.isExtensionDevelopmentHost) && !isDiff && !isMerge && !openConfig.noRecentEntry) {
          const recents = [];
          for (const pathToOpen of pathsToOpen) {
            if (isWorkspacePathToOpen(pathToOpen) && !pathToOpen.transient) {
              recents.push({ label: pathToOpen.label, workspace: pathToOpen.workspace, remoteAuthority: pathToOpen.remoteAuthority });
            } else if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
              recents.push({ label: pathToOpen.label, folderUri: pathToOpen.workspace.uri, remoteAuthority: pathToOpen.remoteAuthority });
            } else if (pathToOpen.fileUri) {
              recents.push({ label: pathToOpen.label, fileUri: pathToOpen.fileUri, remoteAuthority: pathToOpen.remoteAuthority });
            }
          }
          this.workspacesHistoryMainService.addRecentlyOpened(recents);
        }
        this.handleWaitMarkerFile(openConfig, usedWindows);
        this.handleChatRequest(openConfig, usedWindows);
        return usedWindows;
      }
      handleWaitMarkerFile(openConfig, usedWindows) {
        const waitMarkerFileURI = openConfig.waitMarkerFileURI;
        if (openConfig.context === 0 /* CLI */ && waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
          (async () => {
            await usedWindows[0].whenClosedOrLoaded;
            try {
              await this.fileService.del(waitMarkerFileURI);
            } catch (error) {
            }
          })();
        }
      }
      handleChatRequest(openConfig, usedWindows) {
        if (openConfig.context !== 0 /* CLI */ || !openConfig.cli.chat || usedWindows.length === 0) {
          return;
        }
        let windowHandlingChatRequest;
        if (usedWindows.length === 1) {
          windowHandlingChatRequest = usedWindows[0];
        } else {
          const chatRequestFolder = openConfig.cli._[0];
          if (chatRequestFolder) {
            windowHandlingChatRequest = findWindowOnWorkspaceOrFolder(usedWindows, URI.file(chatRequestFolder));
          }
        }
        if (windowHandlingChatRequest) {
          windowHandlingChatRequest.sendWhenReady("vscode:handleChatRequest", CancellationToken.None, openConfig.cli.chat);
          windowHandlingChatRequest.focus();
        }
      }
      async doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyToRestore, maybeOpenEmptyWindow, filesToOpen, foldersToAdd, foldersToRemove) {
        const usedWindows = [];
        let filesOpenedInWindow = void 0;
        function addUsedWindow(window2, openedFiles) {
          usedWindows.push(window2);
          if (openedFiles) {
            filesOpenedInWindow = window2;
            filesToOpen = void 0;
          }
        }
        let { openFolderInNewWindow, openFilesInNewWindow } = this.shouldOpenNewWindow(openConfig);
        if (!openConfig.initialStartup && (foldersToAdd.length > 0 || foldersToRemove.length > 0)) {
          const authority = foldersToAdd.at(0)?.remoteAuthority ?? foldersToRemove.at(0)?.remoteAuthority;
          const lastActiveWindow = this.getLastActiveWindowForAuthority(authority);
          if (lastActiveWindow) {
            addUsedWindow(this.doAddRemoveFoldersInExistingWindow(lastActiveWindow, foldersToAdd.map((folderToAdd) => folderToAdd.workspace.uri), foldersToRemove.map((folderToRemove) => folderToRemove.workspace.uri)));
          }
        }
        const potentialNewWindowsCount = foldersToOpen.length + workspacesToOpen.length + emptyToRestore.length;
        if (filesToOpen && potentialNewWindowsCount === 0) {
          const fileToCheck = filesToOpen.filesToOpenOrCreate[0] || filesToOpen.filesToDiff[0] || filesToOpen.filesToMerge[3];
          const windows = this.getWindows().filter((window2) => filesToOpen && isEqualAuthority(window2.remoteAuthority, filesToOpen.remoteAuthority));
          let windowToUseForFiles = void 0;
          if (fileToCheck?.fileUri && !openFilesInNewWindow) {
            if (openConfig.context === 4 /* DESKTOP */ || openConfig.context === 0 /* CLI */ || openConfig.context === 1 /* DOCK */ || openConfig.context === 6 /* LINK */) {
              windowToUseForFiles = await findWindowOnFile(windows, fileToCheck.fileUri, async (workspace) => workspace.configPath.scheme === Schemas.file ? this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath) : void 0);
            }
            if (!windowToUseForFiles) {
              windowToUseForFiles = this.doGetLastActiveWindow(windows);
            }
          }
          if (windowToUseForFiles) {
            if (isWorkspaceIdentifier(windowToUseForFiles.openedWorkspace)) {
              workspacesToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
            } else if (isSingleFolderWorkspaceIdentifier(windowToUseForFiles.openedWorkspace)) {
              foldersToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
            } else {
              addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowToUseForFiles, filesToOpen), true);
            }
          } else {
            addUsedWindow(await this.openInBrowserWindow({
              userEnv: openConfig.userEnv,
              cli: openConfig.cli,
              initialStartup: openConfig.initialStartup,
              filesToOpen,
              forceNewWindow: true,
              remoteAuthority: filesToOpen.remoteAuthority,
              forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
              forceProfile: openConfig.forceProfile,
              forceTempProfile: openConfig.forceTempProfile
            }), true);
          }
        }
        const allWorkspacesToOpen = distinct(workspacesToOpen, (workspace) => workspace.workspace.id);
        if (allWorkspacesToOpen.length > 0) {
          const windowsOnWorkspace = coalesce(allWorkspacesToOpen.map((workspaceToOpen) => findWindowOnWorkspaceOrFolder(this.getWindows(), workspaceToOpen.workspace.configPath)));
          if (windowsOnWorkspace.length > 0) {
            const windowOnWorkspace = windowsOnWorkspace[0];
            const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, windowOnWorkspace.remoteAuthority) ? filesToOpen : void 0;
            addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnWorkspace, filesToOpenInWindow), !!filesToOpenInWindow);
            openFolderInNewWindow = true;
          }
          for (const workspaceToOpen of allWorkspacesToOpen) {
            if (windowsOnWorkspace.some((window2) => window2.openedWorkspace && window2.openedWorkspace.id === workspaceToOpen.workspace.id)) {
              continue;
            }
            const remoteAuthority = workspaceToOpen.remoteAuthority;
            const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : void 0;
            addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, workspaceToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
            openFolderInNewWindow = true;
          }
        }
        const allFoldersToOpen = distinct(foldersToOpen, (folder) => extUriBiasedIgnorePathCase.getComparisonKey(folder.workspace.uri));
        if (allFoldersToOpen.length > 0) {
          const windowsOnFolderPath = coalesce(allFoldersToOpen.map((folderToOpen) => findWindowOnWorkspaceOrFolder(this.getWindows(), folderToOpen.workspace.uri)));
          if (windowsOnFolderPath.length > 0) {
            const windowOnFolderPath = windowsOnFolderPath[0];
            const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, windowOnFolderPath.remoteAuthority) ? filesToOpen : void 0;
            addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnFolderPath, filesToOpenInWindow), !!filesToOpenInWindow);
            openFolderInNewWindow = true;
          }
          for (const folderToOpen of allFoldersToOpen) {
            if (windowsOnFolderPath.some((window2) => isSingleFolderWorkspaceIdentifier(window2.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window2.openedWorkspace.uri, folderToOpen.workspace.uri))) {
              continue;
            }
            const remoteAuthority = folderToOpen.remoteAuthority;
            const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : void 0;
            addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, folderToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
            openFolderInNewWindow = true;
          }
        }
        const allEmptyToRestore = distinct(emptyToRestore, (info) => info.backupFolder);
        if (allEmptyToRestore.length > 0) {
          for (const emptyWindowBackupInfo of allEmptyToRestore) {
            const remoteAuthority = emptyWindowBackupInfo.remoteAuthority;
            const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : void 0;
            addUsedWindow(await this.doOpenEmpty(openConfig, true, remoteAuthority, filesToOpenInWindow, emptyWindowBackupInfo), !!filesToOpenInWindow);
            openFolderInNewWindow = true;
          }
        }
        if (filesToOpen || maybeOpenEmptyWindow && (openConfig.forceEmpty || usedWindows.length === 0)) {
          const remoteAuthority = filesToOpen ? filesToOpen.remoteAuthority : openConfig.remoteAuthority;
          addUsedWindow(await this.doOpenEmpty(openConfig, openFolderInNewWindow, remoteAuthority, filesToOpen), !!filesToOpen);
        }
        return { windows: distinct(usedWindows), filesOpenedInWindow };
      }
      doOpenFilesInExistingWindow(configuration, window2, filesToOpen) {
        this.logService.trace("windowsManager#doOpenFilesInExistingWindow", { filesToOpen });
        this.focusMainOrChildWindow(window2);
        const params = {
          filesToOpenOrCreate: filesToOpen?.filesToOpenOrCreate,
          filesToDiff: filesToOpen?.filesToDiff,
          filesToMerge: filesToOpen?.filesToMerge,
          filesToWait: filesToOpen?.filesToWait,
          termProgram: configuration?.userEnv?.["TERM_PROGRAM"]
        };
        window2.sendWhenReady("vscode:openFiles", CancellationToken.None, params);
        return window2;
      }
      focusMainOrChildWindow(mainWindow) {
        let windowToFocus = mainWindow;
        const focusedWindow = BrowserWindow5.getFocusedWindow();
        if (focusedWindow && focusedWindow.id !== mainWindow.id) {
          const auxiliaryWindowCandidate = this.auxiliaryWindowsMainService.getWindowByWebContents(focusedWindow.webContents);
          if (auxiliaryWindowCandidate && auxiliaryWindowCandidate.parentId === mainWindow.id) {
            windowToFocus = auxiliaryWindowCandidate;
          }
        }
        windowToFocus.focus();
      }
      doAddRemoveFoldersInExistingWindow(window2, foldersToAdd, foldersToRemove) {
        this.logService.trace("windowsManager#doAddRemoveFoldersToExistingWindow", { foldersToAdd, foldersToRemove });
        window2.focus();
        const request = { foldersToAdd, foldersToRemove };
        window2.sendWhenReady("vscode:addRemoveFolders", CancellationToken.None, request);
        return window2;
      }
      resolveContextWindow(openConfig, forceNewWindow) {
        if (!forceNewWindow && typeof openConfig.contextWindowId === "number") {
          const contextWindow = this.getWindowById(openConfig.contextWindowId);
          if (contextWindow?.config?.isSessionsWindow) {
            return { windowToUse: void 0, forceNewWindow: true };
          }
          return { windowToUse: contextWindow, forceNewWindow };
        }
        return { windowToUse: void 0, forceNewWindow };
      }
      doOpenEmpty(openConfig, forceNewWindow, remoteAuthority, filesToOpen, emptyWindowBackupInfo) {
        this.logService.trace("windowsManager#doOpenEmpty", { restore: !!emptyWindowBackupInfo, remoteAuthority, filesToOpen, forceNewWindow });
        const resolved = this.resolveContextWindow(openConfig, forceNewWindow);
        return this.openInBrowserWindow({
          userEnv: openConfig.userEnv,
          cli: openConfig.cli,
          initialStartup: openConfig.initialStartup,
          remoteAuthority,
          forceNewWindow: resolved.forceNewWindow,
          forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
          filesToOpen,
          windowToUse: resolved.windowToUse,
          emptyWindowBackupInfo,
          forceProfile: openConfig.forceProfile,
          forceTempProfile: openConfig.forceTempProfile
        });
      }
      doOpenFolderOrWorkspace(openConfig, folderOrWorkspace, forceNewWindow, filesToOpen, windowToUse) {
        this.logService.trace("windowsManager#doOpenFolderOrWorkspace", { folderOrWorkspace, filesToOpen });
        if (!windowToUse) {
          const resolved = this.resolveContextWindow(openConfig, forceNewWindow);
          windowToUse = resolved.windowToUse;
          forceNewWindow = resolved.forceNewWindow;
        }
        return this.openInBrowserWindow({
          workspace: folderOrWorkspace.workspace,
          userEnv: openConfig.userEnv,
          cli: openConfig.cli,
          initialStartup: openConfig.initialStartup,
          remoteAuthority: folderOrWorkspace.remoteAuthority,
          forceNewWindow,
          forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
          filesToOpen,
          windowToUse,
          forceProfile: openConfig.forceProfile,
          forceTempProfile: openConfig.forceTempProfile
        });
      }
      async getPathsToOpen(openConfig) {
        let pathsToOpen;
        let isCommandLineOrAPICall = false;
        let isRestoringPaths = false;
        if (openConfig.urisToOpen && openConfig.urisToOpen.length > 0) {
          pathsToOpen = await this.doExtractPathsFromAPI(openConfig);
          isCommandLineOrAPICall = true;
        } else if (openConfig.forceEmpty) {
          pathsToOpen = [EMPTY_WINDOW];
        } else if (openConfig.cli._.length || openConfig.cli["folder-uri"] || openConfig.cli["file-uri"]) {
          pathsToOpen = await this.doExtractPathsFromCLI(openConfig.cli);
          if (pathsToOpen.length === 0) {
            pathsToOpen.push(EMPTY_WINDOW);
          }
          isCommandLineOrAPICall = true;
        } else {
          pathsToOpen = await this.doGetPathsFromLastSession();
          if (pathsToOpen.length === 0) {
            pathsToOpen.push(EMPTY_WINDOW);
          }
          isRestoringPaths = true;
        }
        if (!openConfig.addMode && !openConfig.removeMode && isCommandLineOrAPICall) {
          const foldersToOpen = pathsToOpen.filter((path4) => isSingleFolderWorkspacePathToOpen(path4));
          if (foldersToOpen.length > 1) {
            const remoteAuthority = foldersToOpen[0].remoteAuthority;
            if (foldersToOpen.every((folderToOpen) => isEqualAuthority(folderToOpen.remoteAuthority, remoteAuthority))) {
              let workspace;
              const lastSessionWorkspaceMatchingFolders = await this.doGetWorkspaceMatchingFoldersFromLastSession(remoteAuthority, foldersToOpen);
              if (lastSessionWorkspaceMatchingFolders) {
                workspace = lastSessionWorkspaceMatchingFolders;
              } else {
                workspace = await this.workspacesManagementMainService.createUntitledWorkspace(foldersToOpen.map((folder) => ({ uri: folder.workspace.uri })));
              }
              pathsToOpen.push({ workspace, remoteAuthority });
              pathsToOpen = pathsToOpen.filter((path4) => !isSingleFolderWorkspacePathToOpen(path4));
            }
          }
        }
        if (openConfig.initialStartup && !isRestoringPaths && this.configurationService.getValue("window")?.restoreWindows === "preserve") {
          const lastSessionPaths = await this.doGetPathsFromLastSession();
          pathsToOpen.unshift(...lastSessionPaths.filter((path4) => isWorkspacePathToOpen(path4) || isSingleFolderWorkspacePathToOpen(path4) || path4.backupPath));
        }
        return this.filterRemovedAgentsWorkspacePaths(pathsToOpen);
      }
      /** Removed application modes must not return via history or an explicit special-workspace path. */
      filterRemovedAgentsWorkspacePaths(pathsToOpen) {
        if (product_default.opencodeAgentsWindowEnabled !== false) {
          return pathsToOpen;
        }
        const filtered = pathsToOpen.filter((candidate) => !isWorkspacePathToOpen(candidate) || !isEqual2(candidate.workspace.configPath, this.environmentMainService.agentSessionsWorkspace));
        return filtered.length ? filtered : [EMPTY_WINDOW];
      }
      async doExtractPathsFromAPI(openConfig) {
        const pathResolveOptions = {
          gotoLineMode: openConfig.gotoLineMode,
          remoteAuthority: openConfig.remoteAuthority
        };
        const pathsToOpen = await Promise.all(coalesce(openConfig.urisToOpen || []).map(async (pathToOpen) => {
          const path4 = await this.resolveOpenable(pathToOpen, pathResolveOptions);
          if (path4) {
            path4.label = pathToOpen.label;
            return path4;
          }
          const uri = this.resourceFromOpenable(pathToOpen);
          this.dialogMainService.showMessageBox({
            type: "info",
            buttons: [localize(3716, null)],
            message: uri.scheme === Schemas.file ? localize(3718, null) : localize(3720, null),
            detail: uri.scheme === Schemas.file ? localize(3717, null, getPathLabel(uri, { os: OS, tildify: this.environmentMainService })) : localize(3719, null, uri.toString(true))
          }, BrowserWindow5.getFocusedWindow() ?? void 0);
          return void 0;
        }));
        return coalesce(pathsToOpen);
      }
      async doExtractPathsFromCLI(cli) {
        const pathsToOpen = [];
        const pathResolveOptions = {
          ignoreFileNotFound: true,
          gotoLineMode: cli.goto,
          remoteAuthority: cli.remote || void 0,
          forceOpenWorkspaceAsFile: (
            // special case diff / merge mode to force open
            // workspace as file
            // https://github.com/microsoft/vscode/issues/149731
            cli.diff && cli._.length === 2 || cli.merge && cli._.length === 4
          )
        };
        const folderUris = cli["folder-uri"];
        if (folderUris) {
          const resolvedFolderUris = await Promise.all(folderUris.map((rawFolderUri) => {
            const folderUri = this.cliArgToUri(rawFolderUri);
            if (!folderUri) {
              return void 0;
            }
            return this.resolveOpenable({ folderUri }, pathResolveOptions);
          }));
          pathsToOpen.push(...coalesce(resolvedFolderUris));
        }
        const fileUris = cli["file-uri"];
        if (fileUris) {
          const resolvedFileUris = await Promise.all(fileUris.map((rawFileUri) => {
            const fileUri = this.cliArgToUri(rawFileUri);
            if (!fileUri) {
              return void 0;
            }
            return this.resolveOpenable(hasWorkspaceFileExtension(rawFileUri) ? { workspaceUri: fileUri } : { fileUri }, pathResolveOptions);
          }));
          pathsToOpen.push(...coalesce(resolvedFileUris));
        }
        const resolvedCliPaths = await Promise.all(cli._.map((cliPath) => {
          return pathResolveOptions.remoteAuthority ? this.doResolveRemotePath(cliPath, pathResolveOptions) : this.doResolveFilePath(cliPath, pathResolveOptions);
        }));
        pathsToOpen.push(...coalesce(resolvedCliPaths));
        return pathsToOpen;
      }
      cliArgToUri(arg) {
        try {
          const uri = URI.parse(arg);
          if (!uri.scheme) {
            this.logService.error(`Invalid URI input string, scheme missing: ${arg}`);
            return void 0;
          }
          if (!uri.path) {
            return uri.with({ path: "/" });
          }
          return uri;
        } catch (e) {
          this.logService.error(`Invalid URI input string: ${arg}, ${e.message}`);
        }
        return void 0;
      }
      async doGetPathsFromLastSession() {
        const restoreWindowsSetting = this.getRestoreWindowsSetting();
        switch (restoreWindowsSetting) {
          // none: no window to restore
          case "none":
            return [];
          // one: restore last opened workspace/folder or empty window
          // all: restore all windows
          // folders: restore last opened folders only
          case "one":
          case "all":
          case "preserve":
          case "folders": {
            const lastSessionWindows = [];
            if (restoreWindowsSetting !== "one") {
              lastSessionWindows.push(...this.windowsStateHandler.state.openedWindows);
            }
            if (this.windowsStateHandler.state.lastActiveWindow) {
              lastSessionWindows.push(this.windowsStateHandler.state.lastActiveWindow);
            }
            if (restoreWindowsSetting === "one" && this.isOpenCodeLastWindowRestore()) {
              const preferred = this.pickLastWorkspaceWindow(this.windowsStateHandler.state);
              if (preferred) {
                lastSessionWindows.splice(0, lastSessionWindows.length, preferred);
              }
            }
            const pathsToOpen = await Promise.all(lastSessionWindows.map(async (lastSessionWindow) => {
              if (product_default.opencodeAgentsWindowEnabled === false && lastSessionWindow.workspace && isEqual2(lastSessionWindow.workspace.configPath, this.environmentMainService.agentSessionsWorkspace)) {
                return void 0;
              }
              if (lastSessionWindow.workspace) {
                const pathToOpen = await this.resolveOpenable({ workspaceUri: lastSessionWindow.workspace.configPath }, {
                  remoteAuthority: lastSessionWindow.remoteAuthority,
                  rejectTransientWorkspaces: true
                  /* https://github.com/microsoft/vscode/issues/119695 */
                });
                if (isWorkspacePathToOpen(pathToOpen)) {
                  return pathToOpen;
                }
              } else if (lastSessionWindow.folderUri) {
                const pathToOpen = await this.resolveOpenable({ folderUri: lastSessionWindow.folderUri }, { remoteAuthority: lastSessionWindow.remoteAuthority });
                if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                  return pathToOpen;
                }
              } else if (restoreWindowsSetting !== "folders" && lastSessionWindow.backupPath) {
                return { backupPath: lastSessionWindow.backupPath, remoteAuthority: lastSessionWindow.remoteAuthority };
              }
              return void 0;
            }));
            return coalesce(pathsToOpen);
          }
        }
      }
      isOpenCodeLastWindowRestore() {
        if (this.lifecycleMainService.wasRestarted) {
          return false;
        }
        const windowConfig = this.configurationService.getValue("window");
        if (windowConfig?.restoreWindows === "none") {
          return false;
        }
        return this.configurationService.getValue("opencode.windowRestore") !== "all";
      }
      pickLastWorkspaceWindow(state) {
        const hasProject = (window2) => !!window2 && (!!window2.workspace || !!window2.folderUri) && !(product_default.opencodeAgentsWindowEnabled === false && window2.workspace && isEqual2(window2.workspace.configPath, this.environmentMainService.agentSessionsWorkspace));
        if (hasProject(state.lastActiveWindow)) {
          return state.lastActiveWindow;
        }
        for (let index = state.openedWindows.length - 1; index >= 0; index--) {
          const candidate = state.openedWindows[index];
          if (hasProject(candidate)) {
            return candidate;
          }
        }
        return void 0;
      }
      getRestoreWindowsSetting() {
        let restoreWindows;
        if (this.lifecycleMainService.wasRestarted) {
          restoreWindows = "all";
        } else {
          const windowConfig = this.configurationService.getValue("window");
          restoreWindows = windowConfig?.restoreWindows || "all";
          if (!["preserve", "all", "folders", "one", "none"].includes(restoreWindows)) {
            restoreWindows = "all";
          }
          const opencodeWindowRestore = this.configurationService.getValue("opencode.windowRestore");
          if (restoreWindows !== "none" && opencodeWindowRestore !== "all") {
            restoreWindows = "one";
          }
        }
        return restoreWindows;
      }
      async doGetWorkspaceMatchingFoldersFromLastSession(remoteAuthority, folders) {
        const workspaces = (await this.doGetPathsFromLastSession()).filter((path4) => isWorkspacePathToOpen(path4));
        const folderUris = folders.map((folder) => folder.workspace.uri);
        for (const { workspace } of workspaces) {
          const resolvedWorkspace = await this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath);
          if (!resolvedWorkspace || resolvedWorkspace.remoteAuthority !== remoteAuthority || resolvedWorkspace.transient || resolvedWorkspace.folders.length !== folders.length) {
            continue;
          }
          const folderSet = new ResourceSet(folderUris, (uri) => extUriBiasedIgnorePathCase.getComparisonKey(uri));
          if (resolvedWorkspace.folders.every((folder) => folderSet.has(folder.uri))) {
            return resolvedWorkspace;
          }
        }
        return void 0;
      }
      async resolveOpenable(openable, options = /* @__PURE__ */ Object.create(null)) {
        const uri = this.resourceFromOpenable(openable);
        if (uri.scheme === Schemas.file) {
          if (isFileToOpen(openable)) {
            options = { ...options, forceOpenWorkspaceAsFile: true };
          }
          return this.doResolveFilePath(uri.fsPath, options);
        }
        return this.doResolveRemoteOpenable(openable, options);
      }
      doResolveRemoteOpenable(openable, options) {
        let uri = this.resourceFromOpenable(openable);
        const remoteAuthority = getRemoteAuthority(uri) || options.remoteAuthority;
        uri = removeTrailingPathSeparator2(normalizePath(uri));
        if (isFileToOpen(openable)) {
          if (options.gotoLineMode) {
            const { path: path4, line, column } = parseLineAndColumnAware(uri.path);
            return {
              fileUri: uri.with({ path: path4 }),
              options: {
                selection: line ? { startLineNumber: line, startColumn: column || 1 } : void 0
              },
              remoteAuthority
            };
          }
          return { fileUri: uri, remoteAuthority };
        } else if (isWorkspaceToOpen(openable)) {
          return { workspace: getWorkspaceIdentifier(uri), remoteAuthority };
        }
        return { workspace: getSingleFolderWorkspaceIdentifier(uri), remoteAuthority };
      }
      resourceFromOpenable(openable) {
        if (isWorkspaceToOpen(openable)) {
          return openable.workspaceUri;
        }
        if (isFolderToOpen(openable)) {
          return openable.folderUri;
        }
        return openable.fileUri;
      }
      async doResolveFilePath(path4, options, skipHandleUNCError) {
        let lineNumber;
        let columnNumber;
        if (options.gotoLineMode) {
          ({ path: path4, line: lineNumber, column: columnNumber } = parseLineAndColumnAware(path4));
        }
        path4 = sanitizeFilePath(normalize(path4), cwd2());
        try {
          const pathStat = await fs11.promises.stat(path4);
          if (pathStat.isFile()) {
            if (!options.forceOpenWorkspaceAsFile) {
              const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(URI.file(path4));
              if (workspace) {
                if (workspace.transient && options.rejectTransientWorkspaces) {
                  return void 0;
                }
                return {
                  workspace: { id: workspace.id, configPath: workspace.configPath },
                  type: 1 /* File */,
                  exists: true,
                  remoteAuthority: workspace.remoteAuthority,
                  transient: workspace.transient
                };
              }
            }
            return {
              fileUri: URI.file(path4),
              type: 1 /* File */,
              exists: true,
              options: {
                selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : void 0
              }
            };
          } else if (pathStat.isDirectory()) {
            return {
              workspace: getSingleFolderWorkspaceIdentifier(URI.file(path4), pathStat),
              type: 2 /* Directory */,
              exists: true
            };
          } else if (!isWindows2 && path4 === "/dev/null") {
            return {
              fileUri: URI.file(path4),
              type: 1 /* File */,
              exists: true
            };
          }
        } catch (error) {
          if (error.code === "ERR_UNC_HOST_NOT_ALLOWED" && !skipHandleUNCError) {
            return this.onUNCHostNotAllowed(path4, options);
          }
          const fileUri = URI.file(path4);
          this.workspacesHistoryMainService.removeRecentlyOpened([fileUri]);
          if (options.ignoreFileNotFound && error.code === "ENOENT") {
            return {
              fileUri,
              type: 1 /* File */,
              exists: false
            };
          }
          this.logService.error(`Invalid path provided: ${path4}, ${error.message}`);
        }
        return void 0;
      }
      async onUNCHostNotAllowed(path4, options) {
        const uri = URI.file(path4);
        const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
          type: "warning",
          buttons: [
            localize(3710, null),
            localize(3711, null),
            localize(3715, null)
          ],
          message: localize(3713, null, uri.authority),
          detail: localize(3712, null, getPathLabel(uri, { os: OS, tildify: this.environmentMainService })),
          checkboxLabel: localize(3714, null, uri.authority),
          cancelId: 1
        });
        if (response === 0) {
          addUNCHostToAllowlist(uri.authority);
          if (checkboxChecked) {
            const request = { channel: "vscode:configureAllowedUNCHost", args: uri.authority };
            this.sendToFocused(request.channel, request.args);
            this.sendToOpeningWindow(request.channel, request.args);
          }
          return this.doResolveFilePath(
            path4,
            options,
            true
            /* do not handle UNC error again */
          );
        }
        if (response === 2) {
          shell3.openExternal("https://aka.ms/vscode-windows-unc");
          return this.onUNCHostNotAllowed(path4, options);
        }
        return void 0;
      }
      doResolveRemotePath(path4, options) {
        const first2 = path4.charCodeAt(0);
        const remoteAuthority = options.remoteAuthority;
        let lineNumber;
        let columnNumber;
        if (options.gotoLineMode) {
          ({ path: path4, line: lineNumber, column: columnNumber } = parseLineAndColumnAware(path4));
        }
        if (first2 !== 47 /* Slash */) {
          if (isWindowsDriveLetter(first2) && path4.charCodeAt(path4.charCodeAt(1)) === 58 /* Colon */) {
            path4 = toSlashes(path4);
          }
          path4 = `/${path4}`;
        }
        const uri = URI.from({ scheme: Schemas.vscodeRemote, authority: remoteAuthority, path: path4 });
        if (path4.charCodeAt(path4.length - 1) !== 47 /* Slash */) {
          if (hasWorkspaceFileExtension(path4)) {
            if (options.forceOpenWorkspaceAsFile) {
              return {
                fileUri: uri,
                options: {
                  selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : void 0
                },
                remoteAuthority: options.remoteAuthority
              };
            }
            return { workspace: getWorkspaceIdentifier(uri), remoteAuthority };
          } else if (options.gotoLineMode || posix.basename(path4).indexOf(".") !== -1) {
            return {
              fileUri: uri,
              options: {
                selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : void 0
              },
              remoteAuthority
            };
          }
        }
        return { workspace: getSingleFolderWorkspaceIdentifier(uri), remoteAuthority };
      }
      shouldOpenNewWindow(openConfig) {
        const windowConfig = this.configurationService.getValue("window");
        const openFolderInNewWindowConfig = windowConfig?.openFoldersInNewWindow || "default";
        const openFilesInNewWindowConfig = windowConfig?.openFilesInNewWindow || "off";
        let openFolderInNewWindow = (openConfig.preferNewWindow || openConfig.forceNewWindow) && !openConfig.forceReuseWindow;
        if (!openConfig.forceNewWindow && !openConfig.forceReuseWindow && (openFolderInNewWindowConfig === "on" || openFolderInNewWindowConfig === "off")) {
          openFolderInNewWindow = openFolderInNewWindowConfig === "on";
        }
        let openFilesInNewWindow = false;
        if (openConfig.forceNewWindow || openConfig.forceReuseWindow) {
          openFilesInNewWindow = !!openConfig.forceNewWindow && !openConfig.forceReuseWindow;
        } else {
          if (isMacintosh) {
            if (openConfig.context === 1 /* DOCK */) {
              openFilesInNewWindow = true;
            }
          } else {
            if (openConfig.context !== 3 /* DIALOG */ && openConfig.context !== 2 /* MENU */ && !(openConfig.userEnv && openConfig.userEnv["TERM_PROGRAM"] === "vscode")) {
              openFilesInNewWindow = true;
            }
          }
          if (!openConfig.cli.extensionDevelopmentPath && (openFilesInNewWindowConfig === "on" || openFilesInNewWindowConfig === "off")) {
            openFilesInNewWindow = openFilesInNewWindowConfig === "on";
          }
        }
        return { openFolderInNewWindow: !!openFolderInNewWindow, openFilesInNewWindow };
      }
      async openExtensionDevelopmentHostWindow(extensionDevelopmentPaths, openConfig) {
        const existingWindow = findWindowOnExtensionDevelopmentPath(this.getWindows(), extensionDevelopmentPaths);
        if (existingWindow) {
          this.lifecycleMainService.reload(existingWindow, openConfig.cli);
          existingWindow.focus();
          return [existingWindow];
        }
        let folderUris = openConfig.cli["folder-uri"] || [];
        let fileUris = openConfig.cli["file-uri"] || [];
        let cliArgs = openConfig.cli._;
        if (!cliArgs.length && !folderUris.length && !fileUris.length && !openConfig.cli.extensionTestsPath) {
          const extensionDevelopmentWindowState = this.windowsStateHandler.state.lastPluginDevelopmentHostWindow;
          const workspaceToOpen = extensionDevelopmentWindowState?.workspace ?? extensionDevelopmentWindowState?.folderUri;
          if (workspaceToOpen) {
            if (URI.isUri(workspaceToOpen)) {
              if (workspaceToOpen.scheme === Schemas.file) {
                cliArgs = [workspaceToOpen.fsPath];
              } else {
                folderUris = [workspaceToOpen.toString()];
              }
            } else {
              if (workspaceToOpen.configPath.scheme === Schemas.file) {
                cliArgs = [originalFSPath(workspaceToOpen.configPath)];
              } else {
                fileUris = [workspaceToOpen.configPath.toString()];
              }
            }
          }
        }
        let remoteAuthority = openConfig.remoteAuthority;
        for (const extensionDevelopmentPath of extensionDevelopmentPaths) {
          if (extensionDevelopmentPath.match(/^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/)) {
            const url = URI.parse(extensionDevelopmentPath);
            const extensionDevelopmentPathRemoteAuthority = getRemoteAuthority(url);
            if (extensionDevelopmentPathRemoteAuthority) {
              if (remoteAuthority) {
                if (!isEqualAuthority(extensionDevelopmentPathRemoteAuthority, remoteAuthority)) {
                  this.logService.error("more than one extension development path authority");
                }
              } else {
                remoteAuthority = extensionDevelopmentPathRemoteAuthority;
              }
            }
          }
        }
        cliArgs = cliArgs.filter((path4) => {
          const uri = URI.file(path4);
          if (findWindowOnWorkspaceOrFolder(this.getWindows(), uri)) {
            return false;
          }
          return isEqualAuthority(getRemoteAuthority(uri), remoteAuthority);
        });
        folderUris = folderUris.filter((folderUriStr) => {
          const folderUri = this.cliArgToUri(folderUriStr);
          if (folderUri && findWindowOnWorkspaceOrFolder(this.getWindows(), folderUri)) {
            return false;
          }
          return folderUri ? isEqualAuthority(getRemoteAuthority(folderUri), remoteAuthority) : false;
        });
        fileUris = fileUris.filter((fileUriStr) => {
          const fileUri = this.cliArgToUri(fileUriStr);
          if (fileUri && findWindowOnWorkspaceOrFolder(this.getWindows(), fileUri)) {
            return false;
          }
          return fileUri ? isEqualAuthority(getRemoteAuthority(fileUri), remoteAuthority) : false;
        });
        openConfig.cli._ = cliArgs;
        openConfig.cli["folder-uri"] = folderUris;
        openConfig.cli["file-uri"] = fileUris;
        const openArgs = {
          context: openConfig.context,
          cli: openConfig.cli,
          forceNewWindow: true,
          forceEmpty: !cliArgs.length && !folderUris.length && !fileUris.length,
          userEnv: openConfig.userEnv,
          noRecentEntry: true,
          waitMarkerFileURI: openConfig.waitMarkerFileURI,
          remoteAuthority,
          forceProfile: openConfig.forceProfile,
          forceTempProfile: openConfig.forceTempProfile
        };
        return this.open(openArgs);
      }
      async openInBrowserWindow(options) {
        const windowConfig = this.configurationService.getValue("window");
        const lastActiveWindow = this.getLastActiveWindow();
        const newWindowProfile = windowConfig?.newWindowProfile ? this.userDataProfilesMainService.profiles.find((profile) => profile.name === windowConfig.newWindowProfile) : void 0;
        const defaultProfile = newWindowProfile ?? (lastActiveWindow?.profile?.isAgentsWindowProfile ? void 0 : lastActiveWindow?.profile) ?? this.userDataProfilesMainService.defaultProfile;
        let window2;
        if (!options.forceNewWindow && !options.forceNewTabbedWindow) {
          window2 = options.windowToUse || (lastActiveWindow?.config?.isSessionsWindow ? void 0 : lastActiveWindow);
          if (window2) {
            window2.focus();
          }
        }
        const configuration = {
          // Inherit CLI arguments from environment and/or
          // the specific properties from this launch if provided
          ...this.environmentMainService.args,
          ...options.cli,
          machineId: this.machineId,
          sqmId: this.sqmId,
          devDeviceId: this.devDeviceId,
          isPortable: this.environmentMainService.isPortable,
          windowId: -1,
          // Will be filled in by the window once loaded later
          mainPid: process.pid,
          appRoot: this.environmentMainService.appRoot,
          execPath: process.execPath,
          codeCachePath: this.environmentMainService.codeCachePath,
          // If we know the backup folder upfront (for empty windows to restore), we can set it
          // directly here which helps for restoring UI state associated with that window.
          // For all other cases we first call into registerEmptyWindowBackup() to set it before
          // loading the window.
          backupPath: options.emptyWindowBackupInfo ? join4(this.environmentMainService.backupHome, options.emptyWindowBackupInfo.backupFolder) : void 0,
          profiles: {
            home: this.userDataProfilesMainService.profilesHome,
            all: this.userDataProfilesMainService.profiles,
            // Set to default profile first and resolve and update the profile
            // only after the workspace-backup is registered.
            // Because, workspace identifier of an empty window is known only then.
            profile: defaultProfile
          },
          homeDir: this.environmentMainService.userHome.with({ scheme: Schemas.file }).fsPath,
          tmpDir: this.environmentMainService.tmpDir.with({ scheme: Schemas.file }).fsPath,
          userDataDir: this.environmentMainService.userDataPath,
          remoteAuthority: options.remoteAuthority,
          workspace: options.workspace,
          userEnv: { ...this.initialUserEnv, ...options.userEnv },
          nls: {
            messages: getNLSMessages(),
            language: getNLSLanguage()
          },
          filesToOpenOrCreate: options.filesToOpen?.filesToOpenOrCreate,
          filesToDiff: options.filesToOpen?.filesToDiff,
          filesToMerge: options.filesToOpen?.filesToMerge,
          filesToWait: options.filesToOpen?.filesToWait,
          logLevel: this.loggerService.getLogLevel(),
          loggers: this.loggerService.getGlobalLoggers(),
          logsPath: this.environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath,
          product: product_default,
          isInitialStartup: options.initialStartup,
          perfMarks: getMarks(),
          os: { release: release7(), hostname: hostname(), arch: arch3() },
          autoDetectHighContrast: windowConfig?.autoDetectHighContrast ?? true,
          autoDetectColorScheme: windowConfig?.autoDetectColorScheme ?? false,
          accessibilitySupport: app11.accessibilitySupportEnabled,
          colorScheme: this.themeMainService.getColorScheme(),
          policiesData: this.policyService.serialize(),
          continueOn: this.environmentMainService.continueOn,
          cssModules: this.cssDevelopmentService.isEnabled ? await this.cssDevelopmentService.getCssModules() : void 0,
          isSessionsWindow: product_default.opencodeAgentsWindowEnabled !== false && isWorkspaceIdentifier(options.workspace) && isEqual2(options.workspace.configPath, this.environmentMainService.agentSessionsWorkspace)
        };
        if (!window2) {
          const state = this.windowsStateHandler.getNewWindowState(configuration);
          mark("code/willCreateCodeWindow");
          const createdWindow = window2 = this.instantiationService.createInstance(CodeWindow, {
            state,
            extensionDevelopmentPath: configuration.extensionDevelopmentPath,
            isExtensionTestHost: !!configuration.extensionTestsPath,
            isSessionsWindow: configuration.isSessionsWindow
          });
          mark("code/didCreateCodeWindow");
          if (options.forceNewTabbedWindow) {
            const activeWindow = this.getLastActiveWindow();
            activeWindow?.addTabbedWindow(createdWindow);
          }
          this.windows.set(createdWindow.id, createdWindow);
          this._onDidOpenWindow.fire(createdWindow);
          this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() - 1, newCount: this.getWindowCount() });
          const disposables = new DisposableStore();
          disposables.add(createdWindow.onDidSignalReady(() => this._onDidSignalReadyWindow.fire(createdWindow)));
          disposables.add(Event.once(createdWindow.onDidClose)(() => this.onWindowClosed(createdWindow, disposables)));
          disposables.add(Event.once(createdWindow.onDidDestroy)(() => this.onWindowDestroyed(createdWindow)));
          disposables.add(createdWindow.onDidMaximize(() => this._onDidMaximizeWindow.fire(createdWindow)));
          disposables.add(createdWindow.onDidUnmaximize(() => this._onDidUnmaximizeWindow.fire(createdWindow)));
          disposables.add(createdWindow.onDidEnterFullScreen(() => this._onDidChangeFullScreen.fire({ window: createdWindow, fullscreen: true })));
          disposables.add(createdWindow.onDidLeaveFullScreen(() => this._onDidChangeFullScreen.fire({ window: createdWindow, fullscreen: false })));
          disposables.add(createdWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: createdWindow, x, y })));
          const webContents4 = assertReturnsDefined(createdWindow.win?.webContents);
          webContents4.removeAllListeners("devtools-reload-page");
          disposables.add(Event.fromNodeEventEmitter(webContents4, "devtools-reload-page")(() => this.lifecycleMainService.reload(createdWindow)));
          this.lifecycleMainService.registerWindow(createdWindow);
        } else {
          const currentWindowConfig = window2.config;
          if (!configuration.extensionDevelopmentPath && currentWindowConfig?.extensionDevelopmentPath) {
            configuration.extensionDevelopmentPath = currentWindowConfig.extensionDevelopmentPath;
            configuration.extensionDevelopmentKind = currentWindowConfig.extensionDevelopmentKind;
            configuration["enable-proposed-api"] = currentWindowConfig["enable-proposed-api"];
            configuration.verbose = currentWindowConfig.verbose;
            configuration["inspect-extensions"] = currentWindowConfig["inspect-extensions"];
            configuration["inspect-brk-extensions"] = currentWindowConfig["inspect-brk-extensions"];
            configuration.debugId = currentWindowConfig.debugId;
            configuration.extensionEnvironment = currentWindowConfig.extensionEnvironment;
            configuration["extensions-dir"] = currentWindowConfig["extensions-dir"];
            configuration["disable-extensions"] = currentWindowConfig["disable-extensions"];
            configuration["disable-extension"] = currentWindowConfig["disable-extension"];
          }
        }
        configuration.windowId = window2.id;
        if (window2.isReady) {
          this.lifecycleMainService.unload(window2, 4 /* LOAD */).then(async (veto) => {
            if (!veto) {
              await this.doOpenInBrowserWindow(window2, configuration, options, defaultProfile);
            }
          });
        } else {
          await this.doOpenInBrowserWindow(window2, configuration, options, defaultProfile);
        }
        return window2;
      }
      async doOpenInBrowserWindow(window2, configuration, options, defaultProfile) {
        if (!configuration.extensionDevelopmentPath) {
          if (isWorkspaceIdentifier(configuration.workspace)) {
            configuration.backupPath = this.backupMainService.registerWorkspaceBackup({
              workspace: configuration.workspace,
              remoteAuthority: configuration.remoteAuthority
            });
          } else if (isSingleFolderWorkspaceIdentifier(configuration.workspace)) {
            configuration.backupPath = this.backupMainService.registerFolderBackup({
              folderUri: configuration.workspace.uri,
              remoteAuthority: configuration.remoteAuthority
            });
          } else {
            configuration.backupPath = this.backupMainService.registerEmptyWindowBackup({
              backupFolder: options.emptyWindowBackupInfo?.backupFolder ?? createEmptyWorkspaceIdentifier().id,
              remoteAuthority: configuration.remoteAuthority
            });
          }
        }
        const workspace = configuration.workspace ?? toWorkspaceIdentifier(configuration.backupPath, false);
        if (configuration.isSessionsWindow) {
          configuration.profiles.profile = this.userDataProfilesMainService.profiles.find((p) => p.isAgentsWindowProfile) ?? await this.userDataProfilesMainService.createAgentsWindowProfile();
        } else {
          const profilePromise = this.resolveProfileForBrowserWindow(options, workspace, defaultProfile);
          const profile = profilePromise instanceof Promise ? await profilePromise : profilePromise;
          configuration.profiles.profile = profile;
          if (!configuration.extensionDevelopmentPath) {
            await this.userDataProfilesMainService.setProfileForWorkspace(workspace, profile);
          }
        }
        window2.load(configuration);
      }
      resolveProfileForBrowserWindow(options, workspace, defaultProfile) {
        if (options.forceProfile) {
          return this.userDataProfilesMainService.profiles.find((p) => p.name === options.forceProfile) ?? this.userDataProfilesMainService.createNamedProfile(options.forceProfile);
        }
        if (options.forceTempProfile) {
          return this.userDataProfilesMainService.createTransientProfile();
        }
        return this.userDataProfilesMainService.getProfileForWorkspace(workspace) ?? defaultProfile;
      }
      onWindowClosed(window2, disposables) {
        this.windows.delete(window2.id);
        this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() + 1, newCount: this.getWindowCount() });
        disposables.dispose();
      }
      onWindowDestroyed(window2) {
        this.windows.delete(window2.id);
        this._onDidDestroyWindow.fire(window2);
      }
      getFocusedWindow() {
        const window2 = BrowserWindow5.getFocusedWindow();
        if (window2) {
          return this.getWindowById(window2.id);
        }
        return void 0;
      }
      getLastActiveWindow() {
        return this.doGetLastActiveWindow(this.getWindows());
      }
      getLastActiveWindowForAuthority(remoteAuthority) {
        return this.doGetLastActiveWindow(this.getWindows().filter((window2) => isEqualAuthority(window2.remoteAuthority, remoteAuthority)));
      }
      doGetLastActiveWindow(windows) {
        return getLastFocused(windows);
      }
      sendToFocused(channel, ...args2) {
        const focusedWindow = this.getFocusedWindow() || this.getLastActiveWindow();
        focusedWindow?.sendWhenReady(channel, CancellationToken.None, ...args2);
      }
      sendToOpeningWindow(channel, ...args2) {
        this._register(Event.once(this.onDidSignalReadyWindow)((window2) => {
          window2.sendWhenReady(channel, CancellationToken.None, ...args2);
        }));
      }
      sendToAll(channel, payload, windowIdsToIgnore) {
        for (const window2 of this.getWindows()) {
          if (windowIdsToIgnore && windowIdsToIgnore.indexOf(window2.id) >= 0) {
            continue;
          }
          window2.sendWhenReady(channel, CancellationToken.None, payload);
        }
      }
      getWindows() {
        return Array.from(this.windows.values());
      }
      getWindowCount() {
        return this.windows.size;
      }
      getWindowById(windowId) {
        return this.windows.get(windowId);
      }
      getWindowByWebContents(webContents4) {
        const browserWindow = BrowserWindow5.fromWebContents(webContents4);
        if (!browserWindow) {
          return void 0;
        }
        const window2 = this.getWindowById(browserWindow.id);
        return window2?.matches(webContents4) ? window2 : void 0;
      }
    };
    WindowsMainService = __decorateClass([
      __decorateParam(4, ILogService),
      __decorateParam(5, ILoggerMainService),
      __decorateParam(6, IStateService),
      __decorateParam(7, IPolicyService),
      __decorateParam(8, IEnvironmentMainService),
      __decorateParam(9, IUserDataProfilesMainService),
      __decorateParam(10, ILifecycleMainService),
      __decorateParam(11, IBackupMainService),
      __decorateParam(12, IConfigurationService),
      __decorateParam(13, IWorkspacesHistoryMainService),
      __decorateParam(14, IWorkspacesManagementMainService),
      __decorateParam(15, IInstantiationService),
      __decorateParam(16, IDialogMainService),
      __decorateParam(17, IFileService),
      __decorateParam(18, IProtocolMainService),
      __decorateParam(19, IThemeMainService),
      __decorateParam(20, IAuxiliaryWindowsMainService),
      __decorateParam(21, ICSSDevelopmentService)
    ], WindowsMainService);
  }
});
export { isWorkspacePathToOpen, isSingleFolderWorkspacePathToOpen, fs11, app11, BrowserWindow5, shell3, hostname, release7, arch3, EMPTY_WINDOW, WindowsMainService, init_windowsMainService };
