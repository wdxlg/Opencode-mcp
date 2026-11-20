// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/window.ts
import { BaseWindow } from "./module-1593.mjs";
import { mainWindow } from "./module-0002.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { $, EventHelper, EventType, ModifierKeyEmitter, addDisposableListener, getActiveElement, getWindowById, getWindows, hasWindow } from "./module-0075.mjs";
import { ipcRenderer, process2 } from "./module-3724.mjs";
import { EditorResourceAccessor, isResourceEditorInput, pathsToEditors } from "./module-0925.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { getZoomFactor, getZoomLevel, onDidChangeZoomLevel, setFullscreen } from "./module-0018.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { getWorkbenchContribution } from "./module-0870.mjs";
import { DynamicWorkbenchSecurityConfiguration } from "./module-1112.mjs";
import { Event2 } from "./module-0017.mjs";
import { coalesce } from "./module-0007.mjs";
import { IWorkbenchLayoutService, positionFromString } from "./module-1118.mjs";
import { IEditorService } from "./module-0934.mjs";
import { Schemas } from "./module-0033.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { WindowMinimumSize, hasNativeTitlebar } from "./module-0515.mjs";
import { posix } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { dirname2 } from "./module-0034.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IMenuService, MenuId, MenuItemAction, MenuRegistry } from "./module-0092.mjs";
import { registerWindowDriver } from "./module-1592.mjs";
import { Codicon } from "./module-0085.mjs";
import { ITunnelService, extractLocalHostUriMetaDataForPortMapping, extractQueryLocalHostUriMetaDataForPortMapping } from "./module-1409.mjs";
import { getFlatActionBarActions } from "./module-0516.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { equals4 } from "./module-0098.mjs";
import { WINDOW_ACTIVE_BORDER, WINDOW_INACTIVE_BORDER } from "./module-0912.mjs";
import { whenEditorClosed } from "./module-1084.mjs";
import { applyZoom } from "./module-3725.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITitleService } from "./module-1595.mjs";
import { IWorkbenchThemeService } from "./module-0916.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IIntegrityService } from "./module-3726.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IProductService } from "./module-0873.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IBannerService } from "./module-1622.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IUtilityProcessWorkerWorkbenchService } from "./module-3733.mjs";
import { IHostService } from "./module-1117.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ActionBar } from "./module-0477.mjs";
import { nativeHoverDelegate } from "./module-0520.mjs";
import { IStatusbarService, ShowTooltipCommand } from "./module-0893.mjs";


// src/vs/workbench/electron-browser/window.ts
var NativeWindow = class extends BaseWindow {
  constructor(editorService, editorGroupService, configurationService, titleService, themeService, notificationService, commandService, keybindingService, telemetryService, workspaceEditingService, fileService, menuService, lifecycleService, integrityService, nativeEnvironmentService, accessibilityService, contextService, openerService, nativeHostService, tunnelService, layoutService, workingCopyService, filesConfigurationService, productService, remoteAuthorityResolverService, dialogService, storageService, logService, instantiationService, sharedProcessService, progressService, labelService, bannerService, uriIdentityService, preferencesService, utilityProcessWorkerWorkbenchService, hostService, contextMenuService) {
    super(mainWindow, void 0, hostService, nativeEnvironmentService, contextMenuService, layoutService);
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.configurationService = configurationService;
    this.titleService = titleService;
    this.themeService = themeService;
    this.notificationService = notificationService;
    this.commandService = commandService;
    this.keybindingService = keybindingService;
    this.telemetryService = telemetryService;
    this.workspaceEditingService = workspaceEditingService;
    this.fileService = fileService;
    this.menuService = menuService;
    this.lifecycleService = lifecycleService;
    this.integrityService = integrityService;
    this.nativeEnvironmentService = nativeEnvironmentService;
    this.accessibilityService = accessibilityService;
    this.contextService = contextService;
    this.openerService = openerService;
    this.nativeHostService = nativeHostService;
    this.tunnelService = tunnelService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.productService = productService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.dialogService = dialogService;
    this.storageService = storageService;
    this.logService = logService;
    this.instantiationService = instantiationService;
    this.sharedProcessService = sharedProcessService;
    this.progressService = progressService;
    this.labelService = labelService;
    this.bannerService = bannerService;
    this.uriIdentityService = uriIdentityService;
    this.preferencesService = preferencesService;
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.customTitleContextMenuDisposable = this._register(new DisposableStore());
    this.addRemoveFoldersScheduler = this._register(new RunOnceScheduler(() => this.doAddRemoveFolders(), 100));
    this.pendingFoldersToAdd = [];
    this.pendingFoldersToRemove = [];
    this.isDocumentedEdited = false;
    this.touchBarDisposables = this._register(new DisposableStore());
    //#region Window Zoom
    this.mapWindowIdToZoomStatusEntry = /* @__PURE__ */ new Map();
    this.configuredWindowZoomLevel = this.resolveConfiguredWindowZoomLevel();
    this.registerListeners();
    this.create();
  }
  registerListeners() {
    this._register(addDisposableListener(mainWindow, EventType.RESIZE, () => this.layoutService.layout()));
    this._register(this.editorService.onDidActiveEditorChange(() => this.updateTouchbarMenu()));
    for (const event of [EventType.DRAG_OVER, EventType.DROP]) {
      this._register(addDisposableListener(mainWindow.document.body, event, (e) => {
        EventHelper.stop(e);
      }));
    }
    ipcRenderer.on("vscode:runAction", async (event, ...argsRaw) => {
      const request2 = argsRaw[0];
      const args2 = request2.args || [];
      if (request2.from === "touchbar") {
        const activeEditor = this.editorService.activeEditor;
        if (activeEditor) {
          const resource = EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
          if (resource) {
            args2.push(resource);
          }
        }
      } else if (request2.from === "systemWideKeybinding") {
      } else {
        args2.push({ from: request2.from });
      }
      try {
        await this.commandService.executeCommand(request2.id, ...args2);
        this.telemetryService.publicLog2("workbenchActionExecuted", { id: request2.id, from: request2.from });
      } catch (error) {
        this.notificationService.error(error);
      }
    });
    ipcRenderer.on("vscode:runKeybinding", (event, ...argsRaw) => {
      const request2 = argsRaw[0];
      const activeElement = getActiveElement();
      if (activeElement) {
        this.keybindingService.dispatchByUserSettingsLabel(request2.userSettingsLabel, activeElement);
      }
    });
    ipcRenderer.on("vscode:reportSharedProcessCrash", (event, ...argsRaw) => {
      this.notificationService.prompt(
        Severity2.Error,
        localize(22544, null),
        [{
          label: localize(22541, null),
          run: () => this.nativeHostService.relaunch()
        }],
        {
          priority: 3 /* URGENT */
        }
      );
    });
    ipcRenderer.on("vscode:openFiles", (event, ...argsRaw) => {
      this.onOpenFiles(argsRaw[0]);
    });
    ipcRenderer.on("vscode:addRemoveFolders", (event, ...argsRaw) => this.onAddRemoveFoldersRequest(argsRaw[0]));
    ipcRenderer.on("vscode:showInfoMessage", (event, ...argsRaw) => this.notificationService.info(argsRaw[0]));
    ipcRenderer.on("vscode:showResolveShellEnvError", (event, ...argsRaw) => {
      const message = argsRaw[0];
      this.notificationService.prompt(
        Severity2.Error,
        message,
        [
          {
            label: localize(22541, null),
            run: () => this.nativeHostService.relaunch()
          },
          {
            label: localize(22530, null),
            run: () => this.preferencesService.openUserSettings({ query: "application.shellEnvironmentResolutionTimeout" })
          },
          {
            label: localize(22533, null),
            run: () => this.openerService.open("https://go.microsoft.com/fwlink/?linkid=2149667")
          }
        ]
      );
    });
    ipcRenderer.on("vscode:showCredentialsError", (event, ...argsRaw) => {
      const message = argsRaw[0];
      this.notificationService.prompt(
        Severity2.Error,
        localize(22532, null, message),
        [{
          label: localize(22561, null),
          run: () => this.openerService.open("https://go.microsoft.com/fwlink/?linkid=2190713")
        }]
      );
    });
    ipcRenderer.on("vscode:showTranslatedBuildWarning", () => {
      this.notificationService.prompt(
        Severity2.Warning,
        localize(22543, null, this.productService.nameLong),
        [{
          label: localize(22531, null),
          run: () => {
            const quality = this.productService.quality;
            const stableURL = "https://code.visualstudio.com/docs/?dv=osx";
            const insidersURL = "https://code.visualstudio.com/docs/?dv=osx&build=insiders";
            this.openerService.open(quality === "stable" ? stableURL : insidersURL);
          }
        }],
        {
          priority: 3 /* URGENT */
        }
      );
    });
    ipcRenderer.on("vscode:showArgvParseWarning", () => {
      this.notificationService.prompt(
        Severity2.Warning,
        localize(22545, null),
        [{
          label: localize(22546, null),
          run: () => this.editorService.openEditor({ resource: this.nativeEnvironmentService.argvResource })
        }],
        {
          priority: 3 /* URGENT */
        }
      );
    });
    ipcRenderer.on("vscode:enterFullScreen", () => setFullscreen(true, mainWindow));
    ipcRenderer.on("vscode:leaveFullScreen", () => setFullscreen(false, mainWindow));
    ipcRenderer.on("vscode:openProxyAuthenticationDialog", async (event, ...argsRaw) => {
      const payload = argsRaw[0];
      const rememberCredentialsKey = "window.rememberProxyCredentials";
      const rememberCredentials = this.storageService.getBoolean(rememberCredentialsKey, -1 /* APPLICATION */);
      const result = await this.dialogService.input({
        type: "warning",
        message: localize(22537, null),
        primaryButton: localize(22534, null),
        inputs: [
          { placeholder: localize(22562, null), value: payload.username },
          { placeholder: localize(22536, null), type: "password", value: payload.password }
        ],
        detail: localize(22538, null, `${payload.authInfo.host}:${payload.authInfo.port}`),
        checkbox: {
          label: localize(22539, null),
          checked: rememberCredentials
        }
      });
      if (!result.confirmed || !result.values) {
        ipcRenderer.send(payload.replyChannel);
      } else {
        if (result.checkboxChecked) {
          this.storageService.store(rememberCredentialsKey, true, -1 /* APPLICATION */, 1 /* MACHINE */);
        } else {
          this.storageService.remove(rememberCredentialsKey, -1 /* APPLICATION */);
        }
        const [username, password] = result.values;
        ipcRenderer.send(payload.replyChannel, { username, password, remember: !!result.checkboxChecked });
      }
    });
    ipcRenderer.on("vscode:accessibilitySupportChanged", (event, ...argsRaw) => {
      const accessibilitySupportEnabled = argsRaw[0];
      this.accessibilityService.setAccessibilitySupport(accessibilitySupportEnabled ? 2 /* Enabled */ : 1 /* Disabled */);
    });
    ipcRenderer.on("vscode:configureAllowedUNCHost", async (event, ...argsRaw) => {
      const host = argsRaw[0];
      if (!isWindows) {
        return;
      }
      const allowedUncHosts = /* @__PURE__ */ new Set();
      const configuredAllowedUncHosts = this.configurationService.getValue("security.allowedUNCHosts") ?? [];
      if (Array.isArray(configuredAllowedUncHosts)) {
        for (const configuredAllowedUncHost of configuredAllowedUncHosts) {
          if (typeof configuredAllowedUncHost === "string") {
            allowedUncHosts.add(configuredAllowedUncHost);
          }
        }
      }
      if (!allowedUncHosts.has(host)) {
        allowedUncHosts.add(host);
        await getWorkbenchContribution(DynamicWorkbenchSecurityConfiguration.ID).ready;
        this.configurationService.updateValue("security.allowedUNCHosts", [...allowedUncHosts.values()], 2 /* USER */);
      }
    });
    ipcRenderer.on("vscode:disablePromptForProtocolHandling", (event, ...argsRaw) => {
      const kind = argsRaw[0];
      const setting = kind === "local" ? "security.promptForLocalFileProtocolHandling" : "security.promptForRemoteFileProtocolHandling";
      this.configurationService.updateValue(setting, false);
    });
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("window.zoomLevel") || e.affectsConfiguration("window.zoomPerWindow") && this.configurationService.getValue("window.zoomPerWindow") === false) {
        this.onDidChangeConfiguredWindowZoomLevel();
      } else if (e.affectsConfiguration("keyboard.touchbar.enabled") || e.affectsConfiguration("keyboard.touchbar.ignored")) {
        this.updateTouchbarMenu();
      } else if (e.affectsConfiguration("window.border")) {
        this.updateWindowBorder();
      }
    }));
    this._register(onDidChangeZoomLevel((targetWindowId) => this.handleOnDidChangeZoomLevel(targetWindowId)));
    for (const part of this.editorGroupService.parts) {
      this.createWindowZoomStatusEntry(part);
    }
    this._register(this.editorGroupService.onDidCreateAuxiliaryEditorPart((part) => this.createWindowZoomStatusEntry(part)));
    this._register(Event2.debounce(this.editorService.onDidVisibleEditorsChange, () => void 0, 0, void 0, void 0, void 0, this._store)(() => this.maybeCloseWindow()));
    const filesToWait = this.nativeEnvironmentService.filesToWait;
    if (filesToWait) {
      this.trackClosedWaitFiles(filesToWait.waitMarkerFileUri, coalesce(filesToWait.paths.map((path) => path.fileUri)));
    }
    if (isMacintosh) {
      for (const part of this.editorGroupService.parts) {
        this.handleRepresentedFilename(part);
      }
      this._register(this.editorGroupService.onDidCreateAuxiliaryEditorPart((part) => this.handleRepresentedFilename(part)));
    }
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => {
      const gotDirty = workingCopy.isDirty();
      if (gotDirty && !(workingCopy.capabilities & 2 /* Untitled */) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
        return;
      }
      this.updateDocumentEdited(gotDirty ? true : void 0);
    }));
    this.updateDocumentEdited(void 0);
    this._register(Event2.any(
      Event2.map(Event2.filter(this.nativeHostService.onDidMaximizeWindow, (windowId) => !!hasWindow(windowId)), (windowId) => ({ maximized: true, windowId })),
      Event2.map(Event2.filter(this.nativeHostService.onDidUnmaximizeWindow, (windowId) => !!hasWindow(windowId)), (windowId) => ({ maximized: false, windowId }))
    )((e) => this.layoutService.updateWindowMaximizedState(getWindowById(e.windowId).window, e.maximized)));
    this.layoutService.updateWindowMaximizedState(mainWindow, this.nativeEnvironmentService.window.maximized ?? false);
    this._register(this.layoutService.onDidChangePanelPosition((pos) => this.onDidChangePanelPosition(positionFromString(pos))));
    this.onDidChangePanelPosition(this.layoutService.getPanelPosition());
    this._register(this.themeService.onDidColorThemeChange(() => this.updateWindowBorder()));
    this._register(this.hostService.onDidChangeActiveWindow(() => this.updateWindowBorder()));
    this._register(this.hostService.onDidChangeFocus(() => this.updateWindowBorder()));
    this._register(this.lifecycleService.onBeforeShutdown((e) => this.onBeforeShutdown(e)));
    this._register(this.lifecycleService.onBeforeShutdownError((e) => this.onBeforeShutdownError(e)));
    this._register(this.lifecycleService.onWillShutdown((e) => this.onWillShutdown(e)));
  }
  handleRepresentedFilename(part) {
    const disposables = new DisposableStore();
    Event2.once(part.onWillDispose)(() => disposables.dispose());
    this.editorGroupService.getScopedInstantiationService(part).invokeFunction((accessor) => {
      const editorService = accessor.get(IEditorService);
      disposables.add(editorService.onDidActiveEditorChange(() => this.updateRepresentedFilename(editorService, part.windowId)));
    });
  }
  updateRepresentedFilename(editorService, targetWindowId) {
    const file = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */, filterByScheme: Schemas.file });
    this.nativeHostService.setRepresentedFilename(file?.fsPath ?? "", { targetWindowId });
    if (targetWindowId === mainWindow.vscodeWindowId) {
      this.provideCustomTitleContextMenu(file?.fsPath);
    }
  }
  //#region Window Lifecycle
  onBeforeShutdown({ veto, reason }) {
    // OpenCode: the main process already hid the window; bring it back for a dialog or a veto.
    this.ocHideWhileClosing(reason);
    if (reason === 1 /* CLOSE */) {
      const confirmBeforeCloseSetting = this.configurationService.getValue("window.confirmBeforeClose");
      // OpenCode: an automation-launched instance (OPENCODE_AUTOMATION_RUN=1) quits by itself without a close confirmation
      const confirmBeforeClose = globalThis.vscode?.process?.env?.OPENCODE_AUTOMATION_RUN !== "1" && (confirmBeforeCloseSetting === "always" || confirmBeforeCloseSetting === "keyboardOnly" && ModifierKeyEmitter.getInstance().isModifierPressed);
      if (confirmBeforeClose) {
        return veto((async () => {
          let actualReason = reason;
          if (reason === 1 /* CLOSE */ && !isMacintosh) {
            const windowCount = await this.nativeHostService.getWindowCount();
            if (windowCount === 1) {
              actualReason = 2 /* QUIT */;
            }
          }
          let confirmed = true;
          if (confirmBeforeClose) {
            confirmed = await this.instantiationService.invokeFunction((accessor) => NativeWindow.confirmOnShutdown(accessor, actualReason));
          }
          if (confirmed) {
            this.progressOnBeforeShutdown(reason);
          }
          return !confirmed;
        })(), "veto.confirmBeforeClose");
      }
    }
    this.progressOnBeforeShutdown(reason);
  }
  // OpenCode: once closing is confirmed (or needs no confirmation), hide the window right away instead of
  // showing a frozen window while terminals/backups/extensions shut down. Show it again on a veto or a dialog.
  ocHideWhileClosing(reason) {
    if (isMacintosh || reason !== 1 /* CLOSE */ && reason !== 2 /* QUIT */ || this.ocClosingHidden) {
      return;
    }
    void (async () => {
      try {
        if (reason === 2 /* QUIT */ && await this.nativeHostService.getWindowCount() > 1) {
          return;
        }
        const listeners = [];
        const stop = () => listeners.splice(0).forEach((l) => l.dispose());
        const restore = () => {
          stop();
          if (this.ocClosingHidden) {
            this.ocClosingHidden = false;
            void this.nativeHostService.ocSetWindowHidden(false);
          }
        };
        listeners.push(this.lifecycleService.onShutdownVeto(restore));
        listeners.push(this.dialogService.onWillShowDialog(restore));
        listeners.push(this.lifecycleService.onWillShutdown(stop));
        this.ocClosingHidden = true;
        await this.nativeHostService.ocSetWindowHidden(true);
      } catch {
      }
    })();
  }
  progressOnBeforeShutdown(reason) {
    this.ocHideWhileClosing(reason);
    this.progressService.withProgress({
      location: 10 /* Window */,
      // use window progress to not be too annoying about this operation
      delay: 800,
      // delay so that it only appears when operation takes a long time
      title: this.toShutdownLabel(reason, false)
    }, () => {
      return Event2.toPromise(Event2.any(
        this.lifecycleService.onWillShutdown,
        // dismiss this dialog when we shutdown
        this.lifecycleService.onShutdownVeto,
        // or when shutdown was vetoed
        this.dialogService.onWillShowDialog
        // or when a dialog asks for input
      ));
    });
  }
  onBeforeShutdownError({ error, reason }) {
    this.dialogService.error(this.toShutdownLabel(reason, true), localize(22548, null, toErrorMessage(error)));
  }
  onWillShutdown({ reason, force, joiners }) {
    const shutdownDialogScheduler = new RunOnceScheduler(() => {
      const pendingJoiners = joiners();
      this.progressService.withProgress({
        location: 20 /* Dialog */,
        // use a dialog to prevent the user from making any more interactions now
        buttons: [this.toForceShutdownLabel(reason)],
        // allow to force shutdown anyway
        cancellable: false,
        // do not allow to cancel
        sticky: true,
        // do not allow to dismiss
        title: this.toShutdownLabel(reason, false),
        detail: pendingJoiners.length > 0 ? localize(22563, null, pendingJoiners.map((joiner) => `- ${joiner.label}`).join("\n")) : void 0
      }, () => {
        return Event2.toPromise(this.lifecycleService.onDidShutdown);
      }, () => {
        force();
      });
    }, 1200);
    shutdownDialogScheduler.schedule();
    Event2.once(this.lifecycleService.onDidShutdown)(() => shutdownDialogScheduler.dispose());
  }
  toShutdownLabel(reason, isError) {
    if (isError) {
      switch (reason) {
        case 1 /* CLOSE */:
          return localize(22547, null);
        case 2 /* QUIT */:
          return localize(22550, null);
        case 3 /* RELOAD */:
          return localize(22551, null);
        case 4 /* LOAD */:
          return localize(22549, null);
      }
    }
    switch (reason) {
      case 1 /* CLOSE */:
        return localize(22556, null);
      case 2 /* QUIT */:
        return localize(22558, null);
      case 3 /* RELOAD */:
        return localize(22559, null);
      case 4 /* LOAD */:
        return localize(22557, null);
    }
  }
  toForceShutdownLabel(reason) {
    switch (reason) {
      case 1 /* CLOSE */:
        return localize(22552, null);
      case 2 /* QUIT */:
        return localize(22554, null);
      case 3 /* RELOAD */:
        return localize(22555, null);
      case 4 /* LOAD */:
        return localize(22553, null);
    }
  }
  //#endregion
  updateDocumentEdited(documentEdited) {
    let setDocumentEdited;
    if (typeof documentEdited === "boolean") {
      setDocumentEdited = documentEdited;
    } else {
      setDocumentEdited = this.workingCopyService.hasDirty;
    }
    if (!this.isDocumentedEdited && setDocumentEdited || this.isDocumentedEdited && !setDocumentEdited) {
      this.isDocumentedEdited = setDocumentEdited;
      this.nativeHostService.setDocumentEdited(setDocumentEdited);
    }
  }
  getWindowMinimumWidth(panelPosition = this.layoutService.getPanelPosition()) {
    const panelOnSide = panelPosition === 0 /* LEFT */ || panelPosition === 1 /* RIGHT */;
    if (panelOnSide) {
      return WindowMinimumSize.WIDTH_WITH_VERTICAL_PANEL;
    }
    return WindowMinimumSize.WIDTH;
  }
  onDidChangePanelPosition(pos) {
    const minWidth = this.getWindowMinimumWidth(pos);
    this.nativeHostService.setMinimumSize(minWidth, void 0);
  }
  maybeCloseWindow() {
    const closeWhenEmpty = this.configurationService.getValue("window.closeWhenEmpty") || this.nativeEnvironmentService.args.wait;
    if (!closeWhenEmpty) {
      return;
    }
    for (const editorPart of this.editorGroupService.parts) {
      if (editorPart.groups.some((group2) => !group2.isEmpty)) {
        continue;
      }
      if (editorPart === this.editorGroupService.mainPart && (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ || // only for empty windows
      this.environmentService.isExtensionDevelopment || // not when developing an extension
      this.editorService.visibleEditors.length > 0)) {
        continue;
      }
      if (editorPart === this.editorGroupService.mainPart) {
        this.nativeHostService.closeWindow();
      } else {
        editorPart.removeGroup(editorPart.activeGroup);
      }
    }
  }
  provideCustomTitleContextMenu(filePath) {
    this.customTitleContextMenuDisposable.clear();
    if (!filePath || hasNativeTitlebar(this.configurationService)) {
      return;
    }
    const segments = filePath.split(posix.sep);
    for (let i2 = segments.length; i2 > 0; i2--) {
      const isFile2 = i2 === segments.length;
      let pathOffset = i2;
      if (!isFile2) {
        pathOffset++;
      }
      const path = URI.file(segments.slice(0, pathOffset).join(posix.sep));
      let label3;
      if (!isFile2) {
        label3 = this.labelService.getUriBasenameLabel(dirname2(path));
      } else {
        label3 = this.labelService.getUriBasenameLabel(path);
      }
      const commandId = `workbench.action.revealPathInFinder${i2}`;
      this.customTitleContextMenuDisposable.add(CommandsRegistry.registerCommand(commandId, () => this.nativeHostService.showItemInFolder(path.fsPath)));
      this.customTitleContextMenuDisposable.add(MenuRegistry.appendMenuItem(MenuId.TitleBarTitleContext, { command: { id: commandId, title: label3 || posix.sep }, order: -i2, group: "1_file" }));
    }
  }
  create() {
    this.setupOpenHandlers();
    this.lifecycleService.when(2 /* Ready */).then(() => this.nativeHostService.notifyReady());
    this.lifecycleService.when(3 /* Restored */).then(() => {
      this.sharedProcessService.notifyRestored();
      this.utilityProcessWorkerWorkbenchService.notifyRestored();
    });
    this.handleWarnings();
    this.updateTouchbarMenu();
    this.updateWindowBorder();
    if (this.environmentService.enableSmokeTestDriver) {
      registerWindowDriver(this.instantiationService);
    }
  }
  async handleWarnings() {
    await this.lifecycleService.when(3 /* Restored */);
    (async () => {
      const isAdmin = await this.nativeHostService.isAdmin();
      const { isPure } = await this.integrityService.isPure();
      this.titleService.updateProperties({ isPure, isAdmin });
      if (isAdmin && !isWindows) {
        this.notificationService.warn(localize(22542, null, this.productService.nameShort));
      }
    })();
    if (this.environmentService.isBuilt && !this.environmentService.extensionDevelopmentLocationURI?.length) {
      let installLocationUri;
      if (isMacintosh) {
        installLocationUri = dirname2(dirname2(dirname2(URI.file(this.nativeEnvironmentService.appRoot))));
      } else {
        installLocationUri = dirname2(dirname2(URI.file(this.nativeEnvironmentService.appRoot)));
      }
      for (const folder of this.contextService.getWorkspace().folders) {
        if (this.uriIdentityService.extUri.isEqualOrParent(folder.uri, installLocationUri)) {
          this.bannerService.show({
            id: "appRootWarning.banner",
            message: localize(22529, null, this.labelService.getUriLabel(installLocationUri)),
            icon: Codicon.warning
          });
          break;
        }
      }
    }
    if (isMacintosh) {
      const majorVersion = this.nativeEnvironmentService.os.release.split(".")[0];
      const eolReleases = /* @__PURE__ */ new Map([
        ["20", "macOS Big Sur"]
      ]);
      if (eolReleases.has(majorVersion)) {
        const message = localize(22535, null, this.productService.nameLong, eolReleases.get(majorVersion));
        this.notificationService.prompt(
          Severity2.Warning,
          message,
          [{
            label: localize(22533, null),
            run: () => this.openerService.open(URI.parse("https://aka.ms/vscode-faq-old-macOS"))
          }],
          {
            neverShowAgain: { id: "macoseol", isSecondary: true, scope: 2 /* APPLICATION */ },
            priority: 3 /* URGENT */,
            sticky: true
          }
        );
      }
    }
    const shellEnv = process2.shellEnv();
    this.progressService.withProgress({
      title: localize(22540, null),
      location: 10 /* Window */,
      delay: 1600,
      buttons: [localize(22533, null)]
    }, () => shellEnv, () => this.openerService.open("https://go.microsoft.com/fwlink/?linkid=2149667"));
  }
  async resolveExternalUri(uri5, options3) {
    let queryTunnel;
    if (options3?.allowTunneling) {
      const portMappingRequest = extractLocalHostUriMetaDataForPortMapping(uri5);
      const queryPortMapping = extractQueryLocalHostUriMetaDataForPortMapping(uri5);
      if (queryPortMapping) {
        queryTunnel = await this.openTunnel(queryPortMapping.address, queryPortMapping.port);
        if (queryTunnel && typeof queryTunnel !== "string") {
          if (queryTunnel.tunnelRemotePort !== queryPortMapping.port) {
            queryTunnel.dispose();
            queryTunnel = void 0;
          } else {
            if (!portMappingRequest) {
              const tunnel = queryTunnel;
              return {
                resolved: uri5,
                dispose: () => tunnel.dispose()
              };
            }
          }
        }
      }
      if (portMappingRequest) {
        const tunnel = await this.openTunnel(portMappingRequest.address, portMappingRequest.port);
        if (tunnel && typeof tunnel !== "string") {
          const addressAsUri = URI.parse(tunnel.localAddress).with({ path: uri5.path });
          const resolved = addressAsUri.scheme.startsWith(uri5.scheme) ? addressAsUri : uri5.with({ authority: tunnel.localAddress });
          return {
            resolved,
            dispose() {
              tunnel.dispose();
              if (queryTunnel && typeof queryTunnel !== "string") {
                queryTunnel.dispose();
              }
            }
          };
        }
      }
    }
    if (!options3?.openExternal) {
      const canHandleResource = await this.fileService.canHandleResource(uri5);
      if (canHandleResource) {
        return {
          resolved: URI.from({
            scheme: this.productService.urlProtocol,
            path: "workspace",
            query: uri5.toString()
          }),
          dispose() {
          }
        };
      }
    }
    return void 0;
  }
  async openTunnel(address, port) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    const addressProvider = remoteAuthority ? {
      getAddress: async () => {
        return (await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority)).authority;
      }
    } : void 0;
    const tunnel = await this.tunnelService.getExistingTunnel(address, port);
    if (!tunnel || typeof tunnel === "string") {
      return this.tunnelService.openTunnel(addressProvider, address, port);
    }
    return tunnel;
  }
  setupOpenHandlers() {
    this.openerService.setDefaultExternalOpener({
      openExternal: async (href) => {
        const success = await this.nativeHostService.openExternal(href, this.configurationService.getValue("workbench.externalBrowser"));
        if (!success) {
          const fileCandidate = URI.parse(href);
          if (fileCandidate.scheme === Schemas.file) {
            await this.nativeHostService.showItemInFolder(fileCandidate.fsPath);
          }
        }
        return true;
      }
    });
    this.openerService.registerExternalUriResolver({
      resolveExternalUri: async (uri5, options3) => {
        return this.resolveExternalUri(uri5, options3);
      }
    });
  }
  updateTouchbarMenu() {
    if (!isMacintosh) {
      return;
    }
    this.touchBarDisposables.clear();
    this.touchBarMenu = void 0;
    const scheduler = this.touchBarDisposables.add(new RunOnceScheduler(() => this.doUpdateTouchbarMenu(scheduler), 300));
    scheduler.schedule();
  }
  doUpdateTouchbarMenu(scheduler) {
    if (!this.touchBarMenu) {
      const scopedContextKeyService = this.editorService.activeEditorPane?.scopedContextKeyService || this.editorGroupService.activeGroup.scopedContextKeyService;
      this.touchBarMenu = this.menuService.createMenu(MenuId.TouchBarContext, scopedContextKeyService);
      this.touchBarDisposables.add(this.touchBarMenu);
      this.touchBarDisposables.add(this.touchBarMenu.onDidChange(() => scheduler.schedule()));
    }
    const disabled = this.configurationService.getValue("keyboard.touchbar.enabled") === false;
    const touchbarIgnored = this.configurationService.getValue("keyboard.touchbar.ignored");
    const ignoredItems = Array.isArray(touchbarIgnored) ? touchbarIgnored : [];
    const actions = getFlatActionBarActions(this.touchBarMenu.getActions());
    const items = [];
    let group2 = [];
    if (!disabled) {
      for (const action of actions) {
        if (action instanceof MenuItemAction) {
          if (ignoredItems.indexOf(action.item.id) >= 0) {
            continue;
          }
          group2.push(action.item);
        } else if (action instanceof Separator) {
          if (group2.length) {
            items.push(group2);
          }
          group2 = [];
        }
      }
      if (group2.length) {
        items.push(group2);
      }
    }
    if (!equals4(this.lastInstalledTouchedBar, items)) {
      this.lastInstalledTouchedBar = items;
      this.nativeHostService.updateTouchBar(items);
    }
  }
  //#endregion
  //#region Window Border
  updateWindowBorder() {
    if (!isWindows) {
      return;
    }
    const theme = this.themeService.getColorTheme();
    let activeBorder = theme.getColor(WINDOW_ACTIVE_BORDER)?.toString();
    let inactiveBorder = theme.getColor(WINDOW_INACTIVE_BORDER)?.toString();
    const borderSetting = this.configurationService.getValue("window.border");
    if (borderSetting === "off") {
      activeBorder = "off";
      inactiveBorder = void 0;
    } else if (borderSetting === "default") {
      activeBorder = activeBorder ?? "default";
    } else if (borderSetting === "system") {
      activeBorder = "default";
      inactiveBorder = void 0;
    } else {
      activeBorder = borderSetting;
      inactiveBorder = void 0;
    }
    this.nativeHostService.updateWindowAccentColor(activeBorder, inactiveBorder);
  }
  //#endregion
  onAddRemoveFoldersRequest(request2) {
    this.pendingFoldersToAdd.push(...request2.foldersToAdd.map((folder) => URI.revive(folder)));
    this.pendingFoldersToRemove.push(...request2.foldersToRemove.map((folder) => URI.revive(folder)));
    if (!this.addRemoveFoldersScheduler.isScheduled()) {
      this.addRemoveFoldersScheduler.schedule();
    }
  }
  async doAddRemoveFolders() {
    const foldersToAdd = this.pendingFoldersToAdd.map((folder) => ({ uri: folder }));
    const foldersToRemove = this.pendingFoldersToRemove.slice(0);
    this.pendingFoldersToAdd = [];
    this.pendingFoldersToRemove = [];
    if (foldersToAdd.length) {
      await this.workspaceEditingService.addFolders(foldersToAdd);
    }
    if (foldersToRemove.length) {
      await this.workspaceEditingService.removeFolders(foldersToRemove);
    }
  }
  async onOpenFiles(request2) {
    const diffMode = !!(request2.filesToDiff && request2.filesToDiff.length === 2);
    const mergeMode = !!(request2.filesToMerge && request2.filesToMerge.length === 4);
    const inputs = coalesce(await pathsToEditors(mergeMode ? request2.filesToMerge : diffMode ? request2.filesToDiff : request2.filesToOpenOrCreate, this.fileService, this.logService));
    if (inputs.length) {
      const openedEditorPanes = await this.openResources(inputs, diffMode, mergeMode);
      if (request2.filesToWait) {
        if (openedEditorPanes.length) {
          return this.trackClosedWaitFiles(URI.revive(request2.filesToWait.waitMarkerFileUri), coalesce(request2.filesToWait.paths.map((path) => URI.revive(path.fileUri))));
        } else {
          return this.fileService.del(URI.revive(request2.filesToWait.waitMarkerFileUri));
        }
      }
    }
  }
  async trackClosedWaitFiles(waitMarkerFile, resourcesToWaitFor) {
    await this.instantiationService.invokeFunction((accessor) => whenEditorClosed(accessor, resourcesToWaitFor));
    await this.fileService.del(waitMarkerFile);
  }
  async openResources(resources, diffMode, mergeMode) {
    const editors = [];
    if (mergeMode && isResourceEditorInput(resources[0]) && isResourceEditorInput(resources[1]) && isResourceEditorInput(resources[2]) && isResourceEditorInput(resources[3])) {
      const mergeEditor = {
        input1: { resource: resources[0].resource },
        input2: { resource: resources[1].resource },
        base: { resource: resources[2].resource },
        result: { resource: resources[3].resource },
        options: { pinned: true }
      };
      editors.push(mergeEditor);
    } else if (diffMode && isResourceEditorInput(resources[0]) && isResourceEditorInput(resources[1])) {
      const diffEditor = {
        original: { resource: resources[0].resource },
        modified: { resource: resources[1].resource },
        options: { pinned: true }
      };
      editors.push(diffEditor);
    } else {
      editors.push(...resources);
    }
    return this.editorService.openEditors(editors, void 0, { validateTrust: true });
  }
  resolveConfiguredWindowZoomLevel() {
    const windowZoomLevel = this.configurationService.getValue("window.zoomLevel");
    return typeof windowZoomLevel === "number" ? windowZoomLevel : 0;
  }
  handleOnDidChangeZoomLevel(targetWindowId) {
    this.updateWindowZoomStatusEntry(targetWindowId);
    if (targetWindowId === mainWindow.vscodeWindowId) {
      const currentWindowZoomLevel = getZoomLevel(mainWindow);
      let notifyZoomLevel = void 0;
      if (this.configuredWindowZoomLevel !== currentWindowZoomLevel) {
        notifyZoomLevel = currentWindowZoomLevel;
      }
      ipcRenderer.invoke("vscode:notifyZoomLevel", notifyZoomLevel);
    }
  }
  createWindowZoomStatusEntry(part) {
    const disposables = new DisposableStore();
    Event2.once(part.onWillDispose)(() => disposables.dispose());
    const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
    this.mapWindowIdToZoomStatusEntry.set(part.windowId, disposables.add(scopedInstantiationService.createInstance(ZoomStatusEntry)));
    disposables.add(toDisposable(() => this.mapWindowIdToZoomStatusEntry.delete(part.windowId)));
    this.updateWindowZoomStatusEntry(part.windowId);
  }
  updateWindowZoomStatusEntry(targetWindowId) {
    const targetWindow = getWindowById(targetWindowId);
    const entry = this.mapWindowIdToZoomStatusEntry.get(targetWindowId);
    if (entry && targetWindow) {
      const currentZoomLevel = getZoomLevel(targetWindow.window);
      let text2 = void 0;
      if (currentZoomLevel < this.configuredWindowZoomLevel) {
        text2 = "$(zoom-out)";
      } else if (currentZoomLevel > this.configuredWindowZoomLevel) {
        text2 = "$(zoom-in)";
      }
      entry.updateZoomEntry(text2 ?? false, targetWindowId);
    }
  }
  onDidChangeConfiguredWindowZoomLevel() {
    this.configuredWindowZoomLevel = this.resolveConfiguredWindowZoomLevel();
    let applyZoomLevel = false;
    for (const { window: window2 } of getWindows()) {
      if (getZoomLevel(window2) !== this.configuredWindowZoomLevel) {
        applyZoomLevel = true;
        break;
      }
    }
    if (applyZoomLevel) {
      applyZoom(this.configuredWindowZoomLevel, 2 /* ALL_WINDOWS */);
    }
    for (const [windowId] of this.mapWindowIdToZoomStatusEntry) {
      this.updateWindowZoomStatusEntry(windowId);
    }
  }
  //#endregion
  dispose() {
    super.dispose();
    for (const [, entry] of this.mapWindowIdToZoomStatusEntry) {
      entry.dispose();
    }
  }
};

NativeWindow = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITitleService),
  __decorateParam(4, IWorkbenchThemeService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IWorkspaceEditingService),
  __decorateParam(10, IFileService),
  __decorateParam(11, IMenuService),
  __decorateParam(12, ILifecycleService),
  __decorateParam(13, IIntegrityService),
  __decorateParam(14, INativeWorkbenchEnvironmentService),
  __decorateParam(15, IAccessibilityService),
  __decorateParam(16, IWorkspaceContextService),
  __decorateParam(17, IOpenerService),
  __decorateParam(18, INativeHostService),
  __decorateParam(19, ITunnelService),
  __decorateParam(20, IWorkbenchLayoutService),
  __decorateParam(21, IWorkingCopyService),
  __decorateParam(22, IFilesConfigurationService),
  __decorateParam(23, IProductService),
  __decorateParam(24, IRemoteAuthorityResolverService),
  __decorateParam(25, IDialogService),
  __decorateParam(26, IStorageService),
  __decorateParam(27, ILogService),
  __decorateParam(28, IInstantiationService),
  __decorateParam(29, ISharedProcessService),
  __decorateParam(30, IProgressService),
  __decorateParam(31, ILabelService),
  __decorateParam(32, IBannerService),
  __decorateParam(33, IUriIdentityService),
  __decorateParam(34, IPreferencesService),
  __decorateParam(35, IUtilityProcessWorkerWorkbenchService),
  __decorateParam(36, IHostService),
  __decorateParam(37, IContextMenuService)
], NativeWindow);

var ZoomStatusEntry = class extends Disposable {
  constructor(statusbarService, commandService, keybindingService) {
    super();
    this.statusbarService = statusbarService;
    this.commandService = commandService;
    this.keybindingService = keybindingService;
    this.disposable = this._register(new MutableDisposable());
    this.zoomLevelLabel = void 0;
  }
  updateZoomEntry(visibleOrText, targetWindowId) {
    if (typeof visibleOrText === "string") {
      if (!this.disposable.value) {
        this.createZoomEntry(visibleOrText);
      }
      this.updateZoomLevelLabel(targetWindowId);
    } else {
      this.disposable.clear();
    }
  }
  createZoomEntry(visibleOrText) {
    const disposables = new DisposableStore();
    this.disposable.value = disposables;
    const container3 = $(".zoom-status");
    const left = $(".zoom-status-left");
    container3.appendChild(left);
    const zoomOutAction = disposables.add(new Action("workbench.action.zoomOut", localize(22566, null), ThemeIcon.asClassName(Codicon.remove), true, () => this.commandService.executeCommand(zoomOutAction.id)));
    const zoomInAction = disposables.add(new Action("workbench.action.zoomIn", localize(22564, null), ThemeIcon.asClassName(Codicon.plus), true, () => this.commandService.executeCommand(zoomInAction.id)));
    const zoomResetAction = disposables.add(new Action("workbench.action.zoomReset", localize(22567, null), void 0, true, () => this.commandService.executeCommand(zoomResetAction.id)));
    zoomResetAction.tooltip = this.keybindingService.appendKeybinding(zoomResetAction.label, zoomResetAction.id);
    const zoomSettingsAction = disposables.add(new Action("workbench.action.openSettings", localize(22568, null), ThemeIcon.asClassName(Codicon.settingsGear), true, () => this.commandService.executeCommand(zoomSettingsAction.id, "window.zoom")));
    const zoomLevelLabel = disposables.add(new Action("zoomLabel", void 0, void 0, false));
    this.zoomLevelLabel = zoomLevelLabel;
    disposables.add(toDisposable(() => this.zoomLevelLabel = void 0));
    const actionBarLeft = disposables.add(new ActionBar(left, { hoverDelegate: nativeHoverDelegate }));
    actionBarLeft.push(zoomOutAction, { icon: true, label: false, keybinding: this.keybindingService.lookupKeybinding(zoomOutAction.id)?.getLabel() });
    actionBarLeft.push(this.zoomLevelLabel, { icon: false, label: true });
    actionBarLeft.push(zoomInAction, { icon: true, label: false, keybinding: this.keybindingService.lookupKeybinding(zoomInAction.id)?.getLabel() });
    const right = $(".zoom-status-right");
    container3.appendChild(right);
    const actionBarRight = disposables.add(new ActionBar(right, { hoverDelegate: nativeHoverDelegate }));
    actionBarRight.push(zoomResetAction, { icon: false, label: true });
    actionBarRight.push(zoomSettingsAction, { icon: true, label: false, keybinding: this.keybindingService.lookupKeybinding(zoomSettingsAction.id)?.getLabel() });
    const name = localize(22560, null);
    disposables.add(this.statusbarService.addEntry({
      name,
      text: visibleOrText,
      tooltip: container3,
      ariaLabel: name,
      command: ShowTooltipCommand,
      kind: "prominent"
    }, "status.windowZoom", 1 /* RIGHT */, 102));
  }
  updateZoomLevelLabel(targetWindowId) {
    if (this.zoomLevelLabel) {
      const targetWindow = getWindowById(targetWindowId, true).window;
      const zoomFactor = Math.round(getZoomFactor(targetWindow) * 100);
      const zoomLevel = getZoomLevel(targetWindow);
      this.zoomLevelLabel.label = `${zoomLevel}`;
      this.zoomLevelLabel.tooltip = localize(22565, null, zoomLevel, zoomFactor);
    }
  }
};

ZoomStatusEntry = __decorateClass([
  __decorateParam(0, IStatusbarService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IKeybindingService)
], ZoomStatusEntry);
export { NativeWindow, ZoomStatusEntry };
