// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/code/electron-main/app.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { addUNCHostToAllowlist, disableUNCAccessRestrictions, init_unc } from "./module-0037.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { initWindowsVersionInfo, init_windowsVersion } from "./module-0060.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { init_errorMessage, toErrorMessage } from "./module-0047.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { init_jsonc, parse } from "./module-0003.mjs";
import { getPathLabel, init_labels } from "./module-0048.mjs";
import { Disposable, DisposableStore, MutableDisposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { Schemas, VSCODE_AUTHORITY, init_network } from "./module-0031.mjs";
import { init_path, join4, posix } from "./module-0008.mjs";
import { OS, init_platform, isLinux, isLinuxSnap, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { assertType, init_types } from "./module-0016.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { init_contextmenu2, registerContextMenuListener } from "./module-0062.mjs";
import { ProxyChannel, StaticRouter, getDelayedChannel, init_ipc } from "./module-0054.mjs";
import { Server2, init_ipc_electron2 } from "./module-0064.mjs";
import { Client3, init_ipc_mp2 } from "./module-0066.mjs";
import { IProxyAuthService, ProxyAuthService, init_auth } from "./module-0110.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IBackupMainService, init_backup } from "./module-0111.mjs";
import { BackupMainService, init_backupMainService } from "./module-0115.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { ElectronExtensionHostDebugBroadcastChannel, init_extensionHostDebugIpc2 } from "./module-0118.mjs";
import { IDiagnosticsService, init_diagnostics } from "./module-0119.mjs";
import { DiagnosticsMainService, IDiagnosticsMainService, init_diagnosticsMainService } from "./module-0133.mjs";
import { DialogMainService, IDialogMainService, init_dialogMainService } from "./module-0123.mjs";
import { IEncryptionMainService, init_encryptionService } from "./module-0090.mjs";
import { EncryptionMainService, init_encryptionMainService } from "./module-0134.mjs";
import { init_browserView, ipcBrowserViewChannelName } from "./module-0069.mjs";
import { init_browserViewGroup, ipcBrowserViewGroupChannelName } from "./module-0135.mjs";
import { BrowserViewMainService, IBrowserViewMainService, init_browserViewMainService } from "./module-0157.mjs";
import { BrowserViewGroupMainService, IBrowserViewGroupMainService, init_browserViewGroupMainService } from "./module-0162.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { init_argvHelper, isLaunchedFromCli } from "./module-0163.mjs";
import { getResolvedShellEnv, init_shellEnv } from "./module-0168.mjs";
import { IExtensionHostStarter, init_extensionHostStarter, ipcExtensionHostStarterChannelName } from "./module-0169.mjs";
import { ExtensionHostStarter, init_extensionHostStarter2 } from "./module-0170.mjs";
import { IExternalTerminalMainService, init_externalTerminal } from "./module-0171.mjs";
import { LinuxExternalTerminalService, MacExternalTerminalService, WindowsExternalTerminalService, init_externalTerminalService } from "./module-0173.mjs";
import { ISandboxHelperMainService, init_sandboxHelperService } from "./module-0174.mjs";
import { SandboxHelperService, init_sandboxHelper } from "./module-0176.mjs";
import { LOCAL_FILE_SYSTEM_CHANNEL_NAME, init_diskFileSystemProviderClient } from "./module-0179.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { DiskFileSystemProviderChannel, init_diskFileSystemProviderServer2 } from "./module-0192.mjs";
import { DiskFileSystemProvider, init_diskFileSystemProvider2 } from "./module-0189.mjs";
import { SyncDescriptor, init_descriptors } from "./module-0193.mjs";
import { IInstantiationService, init_instantiation } from "./module-0039.mjs";
import { ServiceCollection, init_serviceCollection } from "./module-0194.mjs";
import { ProcessMainService, init_processMainService } from "./module-0196.mjs";
import { IKeyboardLayoutMainService, KeyboardLayoutMainService, init_keyboardLayoutMainService } from "./module-0197.mjs";
import { ILaunchMainService, LaunchMainService, init_launchMainService } from "./module-0199.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, ILoggerService, init_log } from "./module-0075.mjs";
import { IMenubarMainService, MenubarMainService, init_menubarMainService } from "./module-0205.mjs";
import { INativeHostMainService, NativeHostMainService, init_nativeHostMainService } from "./module-0156.mjs";
import { GlobalKeybindingsMainService, IGlobalKeybindingsMainService, init_globalKeybindingsMainService } from "./module-0151.mjs";
import { IMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";
import { METERED_CONNECTION_CHANNEL, init_meteredConnectionIpc } from "./module-0207.mjs";
import { MeteredConnectionChannel, init_meteredConnectionChannel } from "./module-0208.mjs";
import { MeteredConnectionMainService, init_meteredConnectionMainService } from "./module-0209.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { getRemoteAuthority, init_remoteHosts } from "./module-0127.mjs";
import { SharedProcess, init_sharedProcess2 } from "./module-0217.mjs";
import { ISignService, init_sign } from "./module-0218.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { StorageDatabaseChannel, init_storageIpc } from "./module-0219.mjs";
import { ApplicationStorageMainService, IApplicationStorageMainService, IStorageMainService, StorageMainService, init_storageMainService } from "./module-0109.mjs";
import { init_commonProperties, resolveCommonProperties } from "./module-0214.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { TelemetryAppenderClient, init_telemetryIpc } from "./module-0220.mjs";
import { TelemetryService, init_telemetryService } from "./module-0221.mjs";
import { NullTelemetryService, getPiiPathsFromEnvironment, getTelemetryLevel, init_telemetryUtils, isInternalTelemetry, supportsTelemetry } from "./module-0215.mjs";
import { IUpdateService, init_update } from "./module-0201.mjs";
import { UpdateChannel, init_updateIpc } from "./module-0222.mjs";
import { NotAvailableUpdateDialog, init_notAvailableUpdateDialog } from "./module-0223.mjs";
import { DarwinUpdateService, init_updateService_darwin } from "./module-0225.mjs";
import { LinuxUpdateService, init_updateService_linux } from "./module-0226.mjs";
import { SnapUpdateService, init_updateService_snap } from "./module-0227.mjs";
import { Win32UpdateService, init_updateService_win32 } from "./module-0231.mjs";
import { init_win32UpdateType, isInnoSetupInstall } from "./module-0230.mjs";
import { IURLService, init_url } from "./module-0198.mjs";
import { URLHandlerChannelClient, URLHandlerRouter, init_urlIpc } from "./module-0232.mjs";
import { NativeURLService, init_urlService } from "./module-0233.mjs";
import { ElectronURLListener, init_electronUrlListener } from "./module-0234.mjs";
import { IWebviewManagerService, init_webviewManagerService } from "./module-0235.mjs";
import { WebviewMainService, init_webviewMainService } from "./module-0237.mjs";
import { init_window, isFolderToOpen, isWorkspaceToOpen } from "./module-0096.mjs";
import { IWindowsMainService, getAllWindowsExcludingOffscreen, init_windows } from "./module-0101.mjs";
import { WindowsMainService, init_windowsMainService } from "./module-0246.mjs";
import { ActiveWindowManager, init_windowTracker } from "./module-0247.mjs";
import { hasWorkspaceFileExtension, init_workspace } from "./module-0076.mjs";
import { IWorkspacesService, init_workspaces2 } from "./module-0128.mjs";
import { IWorkspacesHistoryMainService, WorkspacesHistoryMainService, init_workspacesHistoryMainService } from "./module-0203.mjs";
import { WorkspacesMainService, init_workspacesMainService } from "./module-0248.mjs";
import { IWorkspacesManagementMainService, WorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";
import { IPolicyService, init_policy2 } from "./module-0210.mjs";
import { IFileManagedSettingsService, INativeManagedSettingsService, init_copilotManagedSettings } from "./module-0250.mjs";
import { NativeManagedSettingsChannel, init_nativeManagedSettingsIpc } from "./module-0251.mjs";
import { FileManagedSettingsChannel, init_fileManagedSettingsIpc } from "./module-0252.mjs";
import { PolicyChannel, init_policyIpc } from "./module-0253.mjs";
import { IUserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { IExtensionsProfileScannerService, init_extensionsProfileScannerService } from "./module-0257.mjs";
import { IExtensionsScannerService, init_extensionsScannerService } from "./module-0262.mjs";
import { ExtensionsScannerService, init_extensionsScannerService2 } from "./module-0263.mjs";
import { UserDataProfilesHandler, init_userDataProfilesHandler } from "./module-0264.mjs";
import { ProfileStorageChangesListenerChannel, init_userDataProfileStorageIpc } from "./module-0265.mjs";
import { Promises, RunOnceScheduler, init_async, runWhenGlobalIdle } from "./module-0034.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { init_telemetryUtils3, resolveDevDeviceId2, resolveMachineId2, resolveSqmId2, validateDevDeviceId } from "./module-0267.mjs";
import { ExtensionsProfileScannerService, init_extensionsProfileScannerService2 } from "./module-0268.mjs";
import { LoggerChannel, init_logIpc } from "./module-0269.mjs";
import { ILoggerMainService, init_loggerService2 } from "./module-0213.mjs";
import { IUtilityProcessWorkerMainService, UtilityProcessWorkerMainService, init_utilityProcessWorkerMainService } from "./module-0270.mjs";
import { init_utilityProcessWorkerService, ipcUtilityProcessWorkerChannelName } from "./module-0271.mjs";
import { ILocalPtyService, init_terminal } from "./module-0272.mjs";
import { ElectronPtyHostStarter, init_electronPtyHostStarter } from "./module-0273.mjs";
import { PtyHostService, init_ptyHostService } from "./module-0279.mjs";
import { ElectronAgentHostStarter, init_electronAgentHostStarter } from "./module-0334.mjs";
import { AgentHostProcessManager, init_agentHostService } from "./module-0337.mjs";
import { NODE_REMOTE_RESOURCE_CHANNEL_NAME, NODE_REMOTE_RESOURCE_IPC_METHOD_NAME, NodeRemoteResourceRouter, init_electronRemoteResources } from "./module-0338.mjs";
import { Lazy, init_lazy } from "./module-0025.mjs";
import { IAuxiliaryWindowsMainService, init_auxiliaryWindows } from "./module-0140.mjs";
import { AuxiliaryWindowsMainService, init_auxiliaryWindowsMainService } from "./module-0340.mjs";
import { init_normalization, normalizeNFC } from "./module-0035.mjs";
import { CSSDevelopmentService, ICSSDevelopmentService, init_cssDevService } from "./module-0245.mjs";
import { INativeMcpDiscoveryHelperService, NativeMcpDiscoveryHelperChannelName, init_nativeMcpDiscoveryHelper } from "./module-0341.mjs";
import { NativeMcpDiscoveryHelperService, init_nativeMcpDiscoveryHelperService } from "./module-0342.mjs";
import { IMcpGatewayService, McpGatewayChannelName, init_mcpGateway } from "./module-0343.mjs";
import { McpGatewayService, init_mcpGatewayService } from "./module-0346.mjs";
import { McpGatewayChannel, init_mcpGatewayChannel } from "./module-0347.mjs";
import { IWebContentExtractorService, init_webContentExtractor } from "./module-0348.mjs";
import { NativeWebContentExtractorService, init_webContentExtractorService } from "./module-0357.mjs";
import { AgentNetworkFilterService, IAgentNetworkFilterService, init_networkFilterService } from "./module-0351.mjs";
import { ITerminalSandboxService, NullTerminalSandboxService, init_terminalSandboxService } from "./module-0358.mjs";
import { ErrorTelemetry, init_errorTelemetry2 } from "./module-0359.mjs";


// src/vs/code/electron-main/app.ts
import { app as app13, BrowserWindow as BrowserWindow9, desktopCapturer, globalShortcut, powerMonitor as powerMonitor2, protocol as protocol2, screen as electronScreen, session as session2, systemPreferences as systemPreferences2 } from "electron";

import { hostname as hostname2, release as release8 } from "os";

function hasOSProxyBypassRules(config) {
  switch (config.platform?.kind) {
    case "windows":
      return !!config.platform.proxyBypass;
    case "macos":
      return config.platform.excludeSimpleHostnames || config.platform.exceptions.length > 0;
    case "linux":
      return config.platform.ignoreHosts.length > 0;
    default:
      return false;
  }
}

function getOSProxyEnvironmentState(status) {
  return status ? status.error ? "invalid" : "configured" : "unset";
}

function getPACScriptStats(content) {
  return {
    characterCount: content.length,
    lineCount: content.length === 0 ? 0 : content.split(/\r\n|\r|\n/).length,
    returnCount: content.match(/\breturn\b/g)?.length ?? 0
  };
}

var CodeApplication;

var init_app = __esm({
  "src/vs/code/electron-main/app.ts"() {
    init_unc();
    init_ipcMain();
    init_windowsVersion();
    init_buffer();
    init_errorMessage();
    init_event();
    init_jsonc();
    init_labels();
    init_lifecycle();
    init_network();
    init_path();
    init_platform();
    init_types();
    init_uri();
    init_uuid();
    init_contextmenu2();
    init_ipc();
    init_ipc_electron2();
    init_ipc_mp2();
    init_auth();
    init_nls();
    init_backup();
    init_backupMainService();
    init_configuration();
    init_extensionHostDebugIpc2();
    init_diagnostics();
    init_diagnosticsMainService();
    init_dialogMainService();
    init_encryptionService();
    init_encryptionMainService();
    init_browserView();
    init_browserViewGroup();
    init_browserViewMainService();
    init_browserViewGroupMainService();
    init_environmentMainService();
    init_argvHelper();
    init_shellEnv();
    init_extensionHostStarter();
    init_extensionHostStarter2();
    init_externalTerminal();
    init_externalTerminalService();
    init_sandboxHelperService();
    init_sandboxHelper();
    init_diskFileSystemProviderClient();
    init_files();
    init_diskFileSystemProviderServer2();
    init_diskFileSystemProvider2();
    init_descriptors();
    init_instantiation();
    init_serviceCollection();
    init_processMainService();
    init_keyboardLayoutMainService();
    init_launchMainService();
    init_lifecycleMainService();
    init_log();
    init_menubarMainService();
    init_nativeHostMainService();
    init_globalKeybindingsMainService();
    init_meteredConnection();
    init_meteredConnectionIpc();
    init_meteredConnectionChannel();
    init_meteredConnectionMainService();
    init_productService();
    init_remoteHosts();
    init_sharedProcess2();
    init_sign();
    init_state();
    init_storageIpc();
    init_storageMainService();
    init_commonProperties();
    init_telemetry();
    init_telemetryIpc();
    init_telemetryService();
    init_telemetryUtils();
    init_update();
    init_updateIpc();
    init_notAvailableUpdateDialog();
    init_updateService_darwin();
    init_updateService_linux();
    init_updateService_snap();
    init_updateService_win32();
    init_win32UpdateType();
    init_url();
    init_urlIpc();
    init_urlService();
    init_electronUrlListener();
    init_webviewManagerService();
    init_webviewMainService();
    init_window();
    init_windows();
    init_windowsMainService();
    init_windowTracker();
    init_workspace();
    init_workspaces2();
    init_workspacesHistoryMainService();
    init_workspacesMainService();
    init_workspacesManagementMainService();
    init_policy2();
    init_copilotManagedSettings();
    init_nativeManagedSettingsIpc();
    init_fileManagedSettingsIpc();
    init_policyIpc();
    init_userDataProfile3();
    init_extensionsProfileScannerService();
    init_extensionsScannerService();
    init_extensionsScannerService2();
    init_userDataProfilesHandler();
    init_userDataProfileStorageIpc();
    init_async();
    init_cancellation();
    init_telemetryUtils3();
    init_extensionsProfileScannerService2();
    init_logIpc();
    init_loggerService2();
    init_utilityProcessWorkerMainService();
    init_utilityProcessWorkerService();
    init_terminal();
    init_electronPtyHostStarter();
    init_ptyHostService();
    init_electronAgentHostStarter();
    init_agentHostService();
    init_electronRemoteResources();
    init_lazy();
    init_auxiliaryWindows();
    init_auxiliaryWindowsMainService();
    init_normalization();
    init_cssDevService();
    init_nativeMcpDiscoveryHelper();
    init_nativeMcpDiscoveryHelperService();
    init_mcpGateway();
    init_mcpGatewayService();
    init_mcpGatewayChannel();
    init_webContentExtractor();
    init_webContentExtractorService();
    init_networkFilterService();
    init_terminalSandboxService();
    init_errorTelemetry2();
    CodeApplication = class extends Disposable {
      constructor(mainProcessNodeIpcServer, userEnv, mainInstantiationService, logService, loggerService, environmentMainService, lifecycleMainService, configurationService, stateService, fileService, productService, userDataProfilesMainService) {
        super();
        this.mainProcessNodeIpcServer = mainProcessNodeIpcServer;
        this.userEnv = userEnv;
        this.mainInstantiationService = mainInstantiationService;
        this.logService = logService;
        this.loggerService = loggerService;
        this.environmentMainService = environmentMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.configurationService = configurationService;
        this.stateService = stateService;
        this.fileService = fileService;
        this.productService = productService;
        this.userDataProfilesMainService = userDataProfilesMainService;
        this.configureSession();
        this.registerListeners();
      }
      static {
        this.SECURITY_PROTOCOL_HANDLING_CONFIRMATION_SETTING_KEY = {
          [Schemas.file]: "security.promptForLocalFileProtocolHandling",
          [Schemas.vscodeRemote]: "security.promptForRemoteFileProtocolHandling"
        };
      }
      configureSession() {
        const isUrlFromWindow = (requestingUrl) => requestingUrl?.startsWith(`${Schemas.vscodeFileResource}://${VSCODE_AUTHORITY}`);
        const isUrlFromWebview = (requestingUrl) => requestingUrl?.startsWith(`${Schemas.vscodeWebview}://`);
        const isUrlFromAuxiliaryWindow = (webContents4, requestingUrl, isMainFrame) => isMainFrame && requestingUrl === "about:blank" && !!(webContents4 && this.auxiliaryWindowsMainService?.getWindowByWebContents(webContents4));
        const isRequestFromWindow = (webContents4, requestingUrl, isMainFrame) => isUrlFromWindow(requestingUrl) || isUrlFromAuxiliaryWindow(webContents4, requestingUrl, isMainFrame);
        const alwaysAllowedPermissions = /* @__PURE__ */ new Set(["pointerLock", "notifications"]);
        const allowedPermissionsInWebview = /* @__PURE__ */ new Set([
          ...alwaysAllowedPermissions,
          "clipboard-read",
          "clipboard-sanitized-write",
          // TODO(deepak1556): Should be removed once migration is complete
          // https://github.com/microsoft/vscode/issues/239228
          "deprecated-sync-clipboard-read"
        ]);
        const allowedPermissionsInCore = /* @__PURE__ */ new Set([
          ...alwaysAllowedPermissions,
          "media",
          "local-fonts",
          // TODO(deepak1556): Should be removed once migration is complete
          // https://github.com/microsoft/vscode/issues/239228
          "deprecated-sync-clipboard-read"
        ]);
        session2.defaultSession.setPermissionRequestHandler((webContents4, permission, callback, details) => {
          if (isUrlFromWebview(details.requestingUrl)) {
            return callback(allowedPermissionsInWebview.has(permission));
          }
          if (isRequestFromWindow(webContents4, details.requestingUrl, details.isMainFrame)) {
            return callback(allowedPermissionsInCore.has(permission));
          }
          return callback(false);
        });
        session2.defaultSession.setPermissionCheckHandler((webContents4, permission, _origin, details) => {
          if (isUrlFromWebview(details.requestingUrl)) {
            return allowedPermissionsInWebview.has(permission);
          }
          if (isRequestFromWindow(webContents4, details.requestingUrl, details.isMainFrame)) {
            return allowedPermissionsInCore.has(permission);
          }
          return false;
        });
        let cachedScreenSources;
        const invalidateScreenSourceCache = () => {
          cachedScreenSources = void 0;
        };
        electronScreen.on("display-added", invalidateScreenSourceCache);
        electronScreen.on("display-removed", invalidateScreenSourceCache);
        electronScreen.on("display-metrics-changed", invalidateScreenSourceCache);
        this._register(toDisposable(() => {
          electronScreen.off("display-added", invalidateScreenSourceCache);
          electronScreen.off("display-removed", invalidateScreenSourceCache);
          electronScreen.off("display-metrics-changed", invalidateScreenSourceCache);
        }));
        session2.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
          try {
            const frame = request.frame;
            const win = frame ? BrowserWindow9.getAllWindows().find((w) => w.webContents.mainFrame === frame) : void 0;
            const displays = electronScreen.getAllDisplays();
            let targetDisplay = displays[0];
            if (win) {
              const winBounds = win.getBounds();
              targetDisplay = electronScreen.getDisplayNearestPoint({
                x: winBounds.x + winBounds.width / 2,
                y: winBounds.y + winBounds.height / 2
              });
            }
            if (!cachedScreenSources) {
              cachedScreenSources = await desktopCapturer.getSources({
                types: ["screen"],
                thumbnailSize: { width: 0, height: 0 }
              });
            }
            let match = cachedScreenSources.find((s) => s.display_id === String(targetDisplay.id));
            if (!match) {
              cachedScreenSources = await desktopCapturer.getSources({
                types: ["screen"],
                thumbnailSize: { width: 0, height: 0 }
              });
              match = cachedScreenSources.find((s) => s.display_id === String(targetDisplay.id));
            }
            const chosen = match ?? cachedScreenSources[0];
            if (!chosen) {
              callback({});
              return;
            }
            callback({ video: chosen });
          } catch {
            callback({});
          }
        });
        const supportedSvgSchemes = /* @__PURE__ */ new Set([Schemas.file, Schemas.vscodeFileResource, Schemas.vscodeRemoteResource, Schemas.vscodeManagedRemoteResource, "devtools"]);
        const isSafeFrame = (requestFrame) => {
          for (let frame = requestFrame; frame; frame = frame.parent) {
            if (frame.isDestroyed()) {
              return false;
            }
            if (frame.url.startsWith(`${Schemas.vscodeWebview}://`)) {
              return true;
            }
          }
          return false;
        };
        const isSvgRequestFromSafeContext = (details) => {
          return details.resourceType === "xhr" || isSafeFrame(details.frame);
        };
        const isAllowedVsCodeFileRequest = (details) => {
          const frame = details.frame;
          if (!frame || frame.isDestroyed() || !this.windowsMainService) {
            return false;
          }
          const windows = getAllWindowsExcludingOffscreen();
          for (const window2 of windows) {
            if (frame.processId === window2.webContents.mainFrame.processId) {
              return true;
            }
          }
          return false;
        };
        const isAllowedWebviewRequest = (uri, details) => {
          if (uri.path !== "/index.html") {
            return true;
          }
          const frame = details.frame;
          if (!frame || frame.isDestroyed() || !this.windowsMainService) {
            return false;
          }
          for (const window2 of this.windowsMainService.getWindows()) {
            if (window2.win) {
              if (frame.processId === window2.win.webContents.mainFrame.processId) {
                return true;
              }
            }
          }
          return false;
        };
        session2.defaultSession.webRequest.onBeforeRequest((details, callback) => {
          const uri = URI.parse(details.url);
          if (uri.scheme === Schemas.vscodeWebview) {
            if (!isAllowedWebviewRequest(uri, details)) {
              this.logService.error("Blocked vscode-webview request", details.url);
              return callback({ cancel: true });
            }
          }
          if (uri.scheme === Schemas.vscodeFileResource) {
            if (!isAllowedVsCodeFileRequest(details)) {
              this.logService.error("Blocked vscode-file request", details.url);
              return callback({ cancel: true });
            }
          }
          if (uri.scheme === Schemas.vscodeManagedRemoteResource) {
            let frame = details.frame;
            if (!frame || frame.isDestroyed()) {
              this.logService.error("Blocked vscode-managed-remote-resource request", details.url);
              return callback({ cancel: true });
            }
            for (; frame; frame = frame.parent) {
              if (frame.isDestroyed() || frame.url.startsWith(`${Schemas.vscodeWebview}://`)) {
                this.logService.error("Blocked vscode-managed-remote-resource request", details.url);
                return callback({ cancel: true });
              }
            }
          }
          if (uri.path.endsWith(".svg")) {
            const isSafeResourceUrl = supportedSvgSchemes.has(uri.scheme);
            if (!isSafeResourceUrl) {
              return callback({ cancel: !isSvgRequestFromSafeContext(details) });
            }
          }
          return callback({ cancel: false });
        });
        session2.defaultSession.webRequest.onHeadersReceived((details, callback) => {
          const responseHeaders = details.responseHeaders;
          const contentTypes = responseHeaders["content-type"] || responseHeaders["Content-Type"];
          if (contentTypes && Array.isArray(contentTypes)) {
            const uri = URI.parse(details.url);
            if (uri.path.endsWith(".svg")) {
              if (supportedSvgSchemes.has(uri.scheme)) {
                responseHeaders["Content-Type"] = ["image/svg+xml"];
                return callback({ cancel: false, responseHeaders });
              }
            }
            if (!uri.path.endsWith(Schemas.vscodeRemoteResource) && contentTypes.some((contentType) => contentType.toLowerCase().includes("image/svg"))) {
              return callback({ cancel: !isSvgRequestFromSafeContext(details) });
            }
          }
          return callback({ cancel: false });
        });
        session2.defaultSession.webRequest.onHeadersReceived((details, callback) => {
          if (details.url.startsWith("https://vscode.download.prss.microsoft.com/")) {
            const responseHeaders = details.responseHeaders ?? /* @__PURE__ */ Object.create(null);
            if (responseHeaders["Access-Control-Allow-Origin"] === void 0) {
              responseHeaders["Access-Control-Allow-Origin"] = ["*"];
              return callback({ cancel: false, responseHeaders });
            }
          }
          return callback({ cancel: false });
        });
        const defaultSession = session2.defaultSession;
        if (typeof defaultSession.setCodeCachePath === "function" && this.environmentMainService.codeCachePath) {
          defaultSession.setCodeCachePath(join4(this.environmentMainService.codeCachePath, "chrome"));
        }
        if (isWindows2) {
          if (this.configurationService.getValue("security.restrictUNCAccess") === false) {
            disableUNCAccessRestrictions();
          } else {
            addUNCHostToAllowlist(this.configurationService.getValue("security.allowedUNCHosts"));
          }
        }
      }
      registerListeners() {
        Event.once(this.lifecycleMainService.onWillShutdown)(() => this.dispose());
        registerContextMenuListener();
        app13.on("accessibility-support-changed", (event, accessibilitySupportEnabled) => {
          this.windowsMainService?.sendToAll("vscode:accessibilitySupportChanged", accessibilitySupportEnabled);
        });
        app13.on("activate", async (event, hasVisibleWindows) => {
          this.logService.trace("app#activate");
          if (!hasVisibleWindows) {
            await this.windowsMainService?.openEmptyWindow({ context: 1 /* DOCK */ });
          }
        });
        app13.on("web-contents-created", (event, contents) => {
          if (contents?.opener?.url.startsWith(`${Schemas.vscodeFileResource}://${VSCODE_AUTHORITY}/`)) {
            this.logService.trace('[aux window]  app.on("web-contents-created"): Registering auxiliary window');
            this.auxiliaryWindowsMainService?.registerWindow(contents);
          }
          contents.on("will-navigate", (event2) => {
            if (BrowserViewMainService.isBrowserViewWebContents(contents)) {
              return;
            }
            this.logService.error("webContents#will-navigate: Prevented webcontent navigation");
            event2.preventDefault();
          });
          contents.setWindowOpenHandler((details) => {
            if (details.url === "about:blank") {
              this.logService.trace("[aux window] webContents#setWindowOpenHandler: Allowing auxiliary window to open on about:blank");
              return {
                action: "allow",
                overrideBrowserWindowOptions: this.auxiliaryWindowsMainService?.createWindow(details)
              };
            } else {
              this.logService.trace(`webContents#setWindowOpenHandler: Prevented opening window with URL ${details.url}}`);
              this.nativeHostMainService?.openExternal(void 0, details.url);
              return { action: "deny" };
            }
          });
        });
        let macOpenFileURIs = [];
        let runningTimeout = void 0;
        app13.on("open-file", (event, path4) => {
          path4 = normalizeNFC(path4);
          this.logService.trace("app#open-file: ", path4);
          event.preventDefault();
          macOpenFileURIs.push(hasWorkspaceFileExtension(path4) ? { workspaceUri: URI.file(path4) } : { fileUri: URI.file(path4) });
          if (runningTimeout !== void 0) {
            clearTimeout(runningTimeout);
            runningTimeout = void 0;
          }
          runningTimeout = setTimeout(async () => {
            await this.windowsMainService?.open({
              context: 1 /* DOCK */,
              cli: this.environmentMainService.args,
              urisToOpen: macOpenFileURIs,
              gotoLineMode: false,
              preferNewWindow: true
              /* dropping on the dock or opening from finder prefers to open in a new window */
            });
            macOpenFileURIs = [];
            runningTimeout = void 0;
          }, 100);
        });
        app13.on("new-window-for-tab", async () => {
          await this.windowsMainService?.openEmptyWindow({ context: 4 /* DESKTOP */ });
        });
        validatedIpcMain.handle("vscode:fetchShellEnv", (event) => {
          const window2 = this.windowsMainService?.getWindowByWebContents(event.sender);
          let args2;
          let env2;
          if (window2?.config) {
            args2 = window2.config;
            env2 = { ...process.env, ...window2.config.userEnv };
          } else {
            args2 = this.environmentMainService.args;
            env2 = process.env;
          }
          return this.resolveShellEnvironment(args2, env2, false);
        });
        validatedIpcMain.on("vscode:toggleDevTools", (event) => event.sender.toggleDevTools());
        validatedIpcMain.on("vscode:openDevTools", (event) => event.sender.openDevTools());
        validatedIpcMain.on("vscode:reloadWindow", (event) => event.sender.reload());
        validatedIpcMain.handle("vscode:notifyZoomLevel", async (event, zoomLevel) => {
          const window2 = this.windowsMainService?.getWindowByWebContents(event.sender);
          if (window2) {
            window2.notifyZoomLevel(zoomLevel);
          }
        });
      }
      async startup() {
        this.logService.debug("Starting VS Code");
        this.logService.debug(`from: ${this.environmentMainService.appRoot}`);
        this.logService.debug("args:", this.environmentMainService.args);
        const win32AppUserModelId = this.productService.win32AppUserModelId;
        if (isWindows2 && win32AppUserModelId) {
          app13.setAppUserModelId(win32AppUserModelId);
        }
        try {
          if (isMacintosh && this.configurationService.getValue("window.nativeTabs") === true && !systemPreferences2.getUserDefault("NSUseImprovedLayoutPass", "boolean")) {
            systemPreferences2.setUserDefault("NSUseImprovedLayoutPass", "boolean", true);
          }
        } catch (error) {
          this.logService.error(error);
        }
        const mainProcessElectronServer = new Server2();
        Event.once(this.lifecycleMainService.onWillShutdown)((e) => {
          if (e.reason === 2 /* KILL */) {
            mainProcessElectronServer.dispose();
          }
        });
        const [machineId2, sqmId, devDeviceId] = await Promise.all([
          resolveMachineId2(this.stateService, this.logService),
          resolveSqmId2(this.stateService, this.logService),
          resolveDevDeviceId2(this.stateService, this.logService)
        ]);
        const { sharedProcessReady, sharedProcessClient } = this.setupSharedProcess(machineId2, sqmId, devDeviceId);
        const appInstantiationService = await this.initServices(machineId2, sqmId, devDeviceId, sharedProcessReady);
        appInstantiationService.invokeFunction((accessor) => this._register(new ErrorTelemetry(accessor.get(ILogService), accessor.get(ITelemetryService))));
        const agentHostStarter = appInstantiationService.createInstance(ElectronAgentHostStarter, { machineId: machineId2, sqmId, devDeviceId });
        appInstantiationService.createInstance(AgentHostProcessManager, agentHostStarter, process.platform);
        appInstantiationService.invokeFunction((accessor) => {
          accessor.get(IMeteredConnectionService).setTelemetryService(accessor.get(ITelemetryService));
        });
        appInstantiationService.invokeFunction((accessor) => accessor.get(IProxyAuthService));
        this._register(appInstantiationService.createInstance(UserDataProfilesHandler));
        appInstantiationService.invokeFunction((accessor) => this.initChannels(accessor, mainProcessElectronServer, sharedProcessClient));
        const initialProtocolUrls = await appInstantiationService.invokeFunction((accessor) => this.setupProtocolUrlHandlers(accessor, mainProcessElectronServer));
        this.setupManagedRemoteResourceUrlHandler(mainProcessElectronServer);
        this.lifecycleMainService.phase = 2 /* Ready */;
        await appInstantiationService.invokeFunction((accessor) => this.openFirstWindow(accessor, initialProtocolUrls));
        this.lifecycleMainService.phase = 3 /* AfterWindowOpen */;
        this.afterWindowOpen(appInstantiationService);
        const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
          this._register(runWhenGlobalIdle(() => {
            this.lifecycleMainService.phase = 4 /* Eventually */;
            this.eventuallyAfterWindowOpen(appInstantiationService);
          }, 2500));
        }, 2500));
        eventuallyPhaseScheduler.schedule();
      }
      async setupProtocolUrlHandlers(accessor, mainProcessElectronServer) {
        const windowsMainService = this.windowsMainService = accessor.get(IWindowsMainService);
        const urlService = accessor.get(IURLService);
        const nativeHostMainService = this.nativeHostMainService = accessor.get(INativeHostMainService);
        const dialogMainService = accessor.get(IDialogMainService);
        const app16 = this;
        urlService.registerHandler({
          async handleURL(uri, options) {
            return app16.handleProtocolUrl(windowsMainService, dialogMainService, urlService, uri, options);
          }
        });
        const activeWindowManager = this._register(new ActiveWindowManager({
          onDidOpenMainWindow: nativeHostMainService.onDidOpenMainWindow,
          onDidFocusMainWindow: nativeHostMainService.onDidFocusMainWindow,
          getActiveWindowId: () => nativeHostMainService.getActiveWindowId(-1)
        }));
        const activeWindowRouter = new StaticRouter((ctx) => activeWindowManager.getActiveClientId().then((id2) => ctx === id2));
        const urlHandlerRouter = new URLHandlerRouter(activeWindowRouter, this.logService);
        const urlHandlerChannel = mainProcessElectronServer.getChannel("urlHandler", urlHandlerRouter);
        urlService.registerHandler(new URLHandlerChannelClient(urlHandlerChannel));
        const initialProtocolUrls = await this.resolveInitialProtocolUrls(windowsMainService, dialogMainService);
        this._register(new ElectronURLListener(initialProtocolUrls?.urls, urlService, windowsMainService, this.environmentMainService, this.productService, this.logService));
        return initialProtocolUrls;
      }
      setupManagedRemoteResourceUrlHandler(mainProcessElectronServer) {
        const notFound = () => ({ statusCode: 404, data: "Not found" });
        const remoteResourceChannel = new Lazy(() => mainProcessElectronServer.getChannel(
          NODE_REMOTE_RESOURCE_CHANNEL_NAME,
          new NodeRemoteResourceRouter()
        ));
        protocol2.registerBufferProtocol(Schemas.vscodeManagedRemoteResource, (request, callback) => {
          const url = URI.parse(request.url);
          if (!url.authority.startsWith("window:")) {
            return callback(notFound());
          }
          if (!request.referrer || request.referrer.startsWith(`${Schemas.vscodeWebview}://`)) {
            return callback(notFound());
          }
          remoteResourceChannel.value.call(NODE_REMOTE_RESOURCE_IPC_METHOD_NAME, [url]).then(
            (r) => callback({ ...r, data: Buffer.from(r.body, "base64") }),
            (err) => {
              this.logService.warn("error dispatching remote resource call", err);
              callback({ statusCode: 500, data: String(err) });
            }
          );
        });
      }
      async resolveInitialProtocolUrls(windowsMainService, dialogMainService) {
        const protocolUrlsFromCommandLine = this.environmentMainService.args["open-url"] ? this.environmentMainService.args._urls || [] : [];
        if (protocolUrlsFromCommandLine.length > 0) {
          this.logService.trace("app#resolveInitialProtocolUrls() protocol urls from command line:", protocolUrlsFromCommandLine);
        }
        const protocolUrlsFromEvent = global.getOpenUrls?.() || [];
        if (protocolUrlsFromEvent.length > 0) {
          this.logService.trace(`app#resolveInitialProtocolUrls() protocol urls from macOS 'open-url' event:`, protocolUrlsFromEvent);
        }
        if (protocolUrlsFromCommandLine.length + protocolUrlsFromEvent.length === 0) {
          return void 0;
        }
        const protocolUrls = [
          ...protocolUrlsFromCommandLine,
          ...protocolUrlsFromEvent
        ].map((url) => {
          try {
            return { uri: URI.parse(url), originalUrl: url };
          } catch {
            this.logService.trace("app#resolveInitialProtocolUrls() protocol url failed to parse:", url);
            return void 0;
          }
        });
        const openables = [];
        const urls = [];
        for (const protocolUrl of protocolUrls) {
          if (!protocolUrl) {
            continue;
          }
          const windowOpenable = this.getWindowOpenableFromProtocolUrl(protocolUrl.uri);
          if (windowOpenable) {
            if (await this.shouldBlockOpenable(windowOpenable, windowsMainService, dialogMainService)) {
              this.logService.trace("app#resolveInitialProtocolUrls() protocol url was blocked:", protocolUrl.uri.toString(true));
              continue;
            } else {
              this.logService.trace("app#resolveInitialProtocolUrls() protocol url will be handled as window to open:", protocolUrl.uri.toString(true), windowOpenable);
              openables.push(windowOpenable);
            }
          } else {
            this.logService.trace("app#resolveInitialProtocolUrls() protocol url will be passed to active window for handling:", protocolUrl.uri.toString(true));
            urls.push(protocolUrl);
          }
        }
        return { urls, openables };
      }
      async shouldBlockOpenable(openable, windowsMainService, dialogMainService) {
        let openableUri;
        let message;
        if (isWorkspaceToOpen(openable)) {
          openableUri = openable.workspaceUri;
          message = localize(159, null, openableUri.scheme === Schemas.file ? getPathLabel(openableUri, { os: OS, tildify: this.environmentMainService }) : openableUri.toString(true), this.productService.nameShort);
        } else if (isFolderToOpen(openable)) {
          openableUri = openable.folderUri;
          message = localize(158, null, openableUri.scheme === Schemas.file ? getPathLabel(openableUri, { os: OS, tildify: this.environmentMainService }) : openableUri.toString(true), this.productService.nameShort);
        } else {
          openableUri = openable.fileUri;
          message = localize(157, null, openableUri.scheme === Schemas.file ? getPathLabel(openableUri, { os: OS, tildify: this.environmentMainService }) : openableUri.toString(true), this.productService.nameShort);
        }
        if (openableUri.scheme !== Schemas.file && openableUri.scheme !== Schemas.vscodeRemote) {
          return false;
        }
        const askForConfirmation = this.configurationService.getValue(CodeApplication.SECURITY_PROTOCOL_HANDLING_CONFIRMATION_SETTING_KEY[openableUri.scheme]);
        if (askForConfirmation === false) {
          return false;
        }
        const { response, checkboxChecked } = await dialogMainService.showMessageBox({
          type: "warning",
          buttons: [
            localize(162, null),
            localize(155, null)
          ],
          message,
          detail: localize(156, null),
          checkboxLabel: openableUri.scheme === Schemas.file ? localize(160, null) : localize(161, null),
          cancelId: 1
        });
        if (response !== 0) {
          return true;
        }
        if (checkboxChecked) {
          const request = { channel: "vscode:disablePromptForProtocolHandling", args: openableUri.scheme === Schemas.file ? "local" : "remote" };
          windowsMainService.sendToFocused(request.channel, request.args);
          windowsMainService.sendToOpeningWindow(request.channel, request.args);
        }
        return false;
      }
      getWindowOpenableFromProtocolUrl(uri) {
        if (!uri.path) {
          return void 0;
        }
        if (uri.authority === Schemas.file) {
          const fileUri = URI.file(uri.fsPath);
          if (hasWorkspaceFileExtension(fileUri)) {
            return { workspaceUri: fileUri };
          }
          return { fileUri };
        } else if (uri.authority === Schemas.vscodeRemote) {
          const secondSlash = uri.path.indexOf(
            posix.sep,
            1
            /* skip over the leading slash */
          );
          let authority;
          let path4;
          if (secondSlash !== -1) {
            authority = uri.path.substring(1, secondSlash);
            path4 = uri.path.substring(secondSlash);
          } else {
            authority = uri.path.substring(1);
            path4 = "/";
          }
          let query = uri.query;
          const params = new URLSearchParams(uri.query);
          if (params.get("windowId") === "_blank") {
            params.delete("windowId");
            query = params.toString();
          }
          const remoteUri = URI.from({ scheme: Schemas.vscodeRemote, authority, path: path4, query, fragment: uri.fragment });
          if (hasWorkspaceFileExtension(path4)) {
            return { workspaceUri: remoteUri };
          }
          if (/:[\d]+$/.test(path4)) {
            return { fileUri: remoteUri };
          }
          return { folderUri: remoteUri };
        }
        return void 0;
      }
      async handleProtocolUrl(windowsMainService, dialogMainService, urlService, uri, options) {
        this.logService.trace("app#handleProtocolUrl():", uri.toString(true), options);
        if (uri.scheme === this.productService.urlProtocol && uri.path === "workspace") {
          uri = uri.with({
            authority: Schemas.file,
            path: URI.parse(uri.query).path,
            query: ""
          });
        }
        let shouldOpenInNewWindow = false;
        const params = new URLSearchParams(uri.query);
        if (params.get("windowId") === "_blank") {
          this.logService.trace(`app#handleProtocolUrl() found 'windowId=_blank' as parameter, setting shouldOpenInNewWindow=true:`, uri.toString(true));
          params.delete("windowId");
          uri = uri.with({ query: params.toString() });
          shouldOpenInNewWindow = true;
        } else if (isMacintosh && windowsMainService.getWindowCount() === 0) {
          this.logService.trace(`app#handleProtocolUrl() running on macOS with no window open, setting shouldOpenInNewWindow=true:`, uri.toString(true));
          shouldOpenInNewWindow = true;
        }
        const continueOn = params.get("continueOn");
        if (continueOn !== null) {
          this.logService.trace(`app#handleProtocolUrl() found 'continueOn' as parameter:`, uri.toString(true));
          params.delete("continueOn");
          uri = uri.with({ query: params.toString() });
          this.environmentMainService.continueOn = continueOn ?? void 0;
        }
        const session4 = params.get("session");
        if (session4 !== null) {
          this.logService.trace(`app#handleProtocolUrl() found 'session' as parameter:`, uri.toString(true));
          params.delete("session");
          uri = uri.with({ query: params.toString() });
        }
        const windowOpenableFromProtocolUrl = this.getWindowOpenableFromProtocolUrl(uri);
        if (windowOpenableFromProtocolUrl) {
          if (await this.shouldBlockOpenable(windowOpenableFromProtocolUrl, windowsMainService, dialogMainService)) {
            this.logService.trace("app#handleProtocolUrl() protocol url was blocked:", uri.toString(true));
            return true;
          } else {
            this.logService.trace("app#handleProtocolUrl() opening protocol url as window:", windowOpenableFromProtocolUrl, uri.toString(true));
            const window2 = (await windowsMainService.open({
              context: 6 /* LINK */,
              cli: { ...this.environmentMainService.args },
              urisToOpen: [windowOpenableFromProtocolUrl],
              forceNewWindow: shouldOpenInNewWindow,
              gotoLineMode: true
              // remoteAuthority: will be determined based on windowOpenableFromProtocolUrl
            })).at(0);
            window2?.focus();
            if (window2 && session4) {
              window2.sendWhenReady("vscode:openChatSession", CancellationToken.None, session4);
            }
            return true;
          }
        }
        if (shouldOpenInNewWindow) {
          this.logService.trace("app#handleProtocolUrl() opening empty window and passing in protocol url:", uri.toString(true));
          const window2 = (await windowsMainService.open({
            context: 6 /* LINK */,
            cli: { ...this.environmentMainService.args },
            forceNewWindow: true,
            forceEmpty: true,
            gotoLineMode: true,
            remoteAuthority: getRemoteAuthority(uri)
          })).at(0);
          await window2?.ready();
          return urlService.open(uri, options);
        }
        this.logService.trace("app#handleProtocolUrl(): not handled", uri.toString(true), options);
        return false;
      }
      setupSharedProcess(machineId2, sqmId, devDeviceId) {
        const sharedProcess = this._register(this.mainInstantiationService.createInstance(SharedProcess, machineId2, sqmId, devDeviceId));
        this._register(sharedProcess.onDidCrash(() => this.windowsMainService?.sendToFocused("vscode:reportSharedProcessCrash")));
        const sharedProcessClient = (async () => {
          this.logService.trace("Main->SharedProcess#connect");
          const port = await sharedProcess.connect();
          this.logService.trace("Main->SharedProcess#connect: connection established");
          return new Client3(port, "main");
        })();
        const sharedProcessReady = (async () => {
          await sharedProcess.whenReady();
          return sharedProcessClient;
        })();
        return { sharedProcessReady, sharedProcessClient };
      }
      async initServices(machineId2, sqmId, devDeviceId, sharedProcessReady) {
        const services = new ServiceCollection();
        switch (process.platform) {
          case "win32":
            services.set(IUpdateService, new SyncDescriptor(Win32UpdateService));
            break;
          case "linux":
            if (isLinuxSnap) {
              services.set(IUpdateService, new SyncDescriptor(SnapUpdateService, [process.env["SNAP"], process.env["SNAP_REVISION"]]));
            } else {
              services.set(IUpdateService, new SyncDescriptor(LinuxUpdateService));
            }
            break;
          case "darwin":
            services.set(IUpdateService, new SyncDescriptor(DarwinUpdateService));
            break;
        }
        services.set(IWindowsMainService, new SyncDescriptor(WindowsMainService, [machineId2, sqmId, devDeviceId, this.userEnv], false));
        services.set(IAuxiliaryWindowsMainService, new SyncDescriptor(AuxiliaryWindowsMainService, void 0, false));
        const dialogMainService = new DialogMainService(this.logService, this.productService);
        services.set(IDialogMainService, dialogMainService);
        services.set(ILaunchMainService, new SyncDescriptor(
          LaunchMainService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IDiagnosticsMainService, new SyncDescriptor(
          DiagnosticsMainService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IDiagnosticsService, ProxyChannel.toService(getDelayedChannel(sharedProcessReady.then((client) => client.getChannel("diagnostics")))));
        services.set(IEncryptionMainService, new SyncDescriptor(EncryptionMainService));
        services.set(IBrowserViewMainService, new SyncDescriptor(
          BrowserViewMainService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IBrowserViewGroupMainService, new SyncDescriptor(
          BrowserViewGroupMainService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IKeyboardLayoutMainService, new SyncDescriptor(KeyboardLayoutMainService));
        services.set(INativeHostMainService, new SyncDescriptor(
          NativeHostMainService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IGlobalKeybindingsMainService, new SyncDescriptor(GlobalKeybindingsMainService, [globalShortcut]));
        const meteredConnectionService = new MeteredConnectionMainService(this.configurationService);
        services.set(IMeteredConnectionService, meteredConnectionService);
        services.set(ITerminalSandboxService, new SyncDescriptor(NullTerminalSandboxService));
        services.set(IAgentNetworkFilterService, new SyncDescriptor(AgentNetworkFilterService, void 0, true));
        services.set(IWebContentExtractorService, new SyncDescriptor(
          NativeWebContentExtractorService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IWebviewManagerService, new SyncDescriptor(WebviewMainService));
        services.set(IMenubarMainService, new SyncDescriptor(MenubarMainService));
        services.set(IExtensionHostStarter, new SyncDescriptor(ExtensionHostStarter));
        services.set(IStorageMainService, new SyncDescriptor(StorageMainService));
        services.set(IApplicationStorageMainService, new SyncDescriptor(ApplicationStorageMainService));
        const ptyHostStarter = new ElectronPtyHostStarter({
          graceTime: 6e4 /* GraceTime */,
          shortGraceTime: 6e3 /* ShortGraceTime */,
          scrollback: this.configurationService.getValue("terminal.integrated.persistentSessionScrollback" /* PersistentSessionScrollback */) ?? 100
        }, this.configurationService, this.environmentMainService, this.lifecycleMainService, this.logService);
        const ptyHostService = new PtyHostService(
          ptyHostStarter,
          this.configurationService,
          this.logService,
          this.loggerService
        );
        services.set(ILocalPtyService, ptyHostService);
        if (isWindows2) {
          services.set(IExternalTerminalMainService, new SyncDescriptor(WindowsExternalTerminalService));
        } else if (isMacintosh) {
          services.set(IExternalTerminalMainService, new SyncDescriptor(MacExternalTerminalService));
        } else if (isLinux) {
          services.set(IExternalTerminalMainService, new SyncDescriptor(LinuxExternalTerminalService));
        }
        services.set(ISandboxHelperMainService, new SyncDescriptor(SandboxHelperService));
        const backupMainService = new BackupMainService(this.environmentMainService, this.configurationService, this.logService, this.stateService);
        services.set(IBackupMainService, backupMainService);
        const workspacesManagementMainService = new WorkspacesManagementMainService(this.environmentMainService, this.logService, this.userDataProfilesMainService, backupMainService, dialogMainService);
        services.set(IWorkspacesManagementMainService, workspacesManagementMainService);
        services.set(IWorkspacesService, new SyncDescriptor(
          WorkspacesMainService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(IWorkspacesHistoryMainService, new SyncDescriptor(WorkspacesHistoryMainService, void 0, false));
        services.set(IURLService, new SyncDescriptor(
          NativeURLService,
          void 0,
          false
          /* proxied to other processes */
        ));
        if (supportsTelemetry(this.productService, this.environmentMainService)) {
          const isInternal = isInternalTelemetry(this.productService, this.configurationService);
          const channel = getDelayedChannel(sharedProcessReady.then((client) => client.getChannel("telemetryAppender")));
          const appender = new TelemetryAppenderClient(channel);
          const commonProperties = resolveCommonProperties(release8(), hostname2(), process.arch, this.productService.commit, this.productService.version, machineId2, sqmId, devDeviceId, isInternal, this.productService.date);
          const piiPaths = getPiiPathsFromEnvironment(this.environmentMainService);
          const config = { appenders: [appender], commonProperties, piiPaths, sendErrorTelemetry: true };
          services.set(ITelemetryService, new SyncDescriptor(TelemetryService, [config], false));
        } else {
          services.set(ITelemetryService, NullTelemetryService);
        }
        services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService, void 0, true));
        services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService, void 0, true));
        services.set(IUtilityProcessWorkerMainService, new SyncDescriptor(UtilityProcessWorkerMainService, void 0, true));
        services.set(IProxyAuthService, new SyncDescriptor(ProxyAuthService));
        services.set(INativeMcpDiscoveryHelperService, new SyncDescriptor(NativeMcpDiscoveryHelperService));
        services.set(IMcpGatewayService, new SyncDescriptor(McpGatewayService));
        services.set(ICSSDevelopmentService, new SyncDescriptor(CSSDevelopmentService, void 0, true));
        await Promises.settled([
          backupMainService.initialize(),
          workspacesManagementMainService.initialize()
        ]);
        return this.mainInstantiationService.createChild(services);
      }
      initChannels(accessor, mainProcessElectronServer, sharedProcessClient) {
        const disposables = this._register(new DisposableStore());
        const launchChannel = ProxyChannel.fromService(accessor.get(ILaunchMainService), disposables, { disableMarshalling: true });
        this.mainProcessNodeIpcServer.registerChannel("launch", launchChannel);
        const diagnosticsChannel = ProxyChannel.fromService(accessor.get(IDiagnosticsMainService), disposables, { disableMarshalling: true });
        this.mainProcessNodeIpcServer.registerChannel("diagnostics", diagnosticsChannel);
        const policyChannel = disposables.add(new PolicyChannel(accessor.get(IPolicyService)));
        mainProcessElectronServer.registerChannel("policy", policyChannel);
        sharedProcessClient.then((client) => client.registerChannel("policy", policyChannel));
        const nativeManagedSettingsChannel = disposables.add(new NativeManagedSettingsChannel(accessor.get(INativeManagedSettingsService)));
        mainProcessElectronServer.registerChannel("nativeManagedSettings", nativeManagedSettingsChannel);
        const fileManagedSettingsChannel = disposables.add(new FileManagedSettingsChannel(accessor.get(IFileManagedSettingsService)));
        mainProcessElectronServer.registerChannel("fileManagedSettings", fileManagedSettingsChannel);
        const diskFileSystemProvider = this.fileService.getProvider(Schemas.file);
        assertType(diskFileSystemProvider instanceof DiskFileSystemProvider);
        const fileSystemProviderChannel = disposables.add(new DiskFileSystemProviderChannel(diskFileSystemProvider, this.logService, this.environmentMainService));
        mainProcessElectronServer.registerChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME, fileSystemProviderChannel);
        sharedProcessClient.then((client) => client.registerChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME, fileSystemProviderChannel));
        const userDataProfilesService = ProxyChannel.fromService(accessor.get(IUserDataProfilesMainService), disposables);
        mainProcessElectronServer.registerChannel("userDataProfiles", userDataProfilesService);
        sharedProcessClient.then((client) => client.registerChannel("userDataProfiles", userDataProfilesService));
        const updateService = accessor.get(IUpdateService);
        const updateChannel = new UpdateChannel(updateService);
        mainProcessElectronServer.registerChannel("update", updateChannel);
        this._register(new NotAvailableUpdateDialog(updateService, accessor.get(IDialogMainService), accessor.get(IWindowsMainService)));
        const meteredConnectionChannel = new MeteredConnectionChannel(accessor.get(IMeteredConnectionService));
        mainProcessElectronServer.registerChannel(METERED_CONNECTION_CHANNEL, meteredConnectionChannel);
        sharedProcessClient.then((client) => client.registerChannel(METERED_CONNECTION_CHANNEL, meteredConnectionChannel));
        const processChannel = ProxyChannel.fromService(new ProcessMainService(this.logService, accessor.get(IDiagnosticsService), accessor.get(IDiagnosticsMainService)), disposables);
        mainProcessElectronServer.registerChannel("process", processChannel);
        const encryptionChannel = ProxyChannel.fromService(accessor.get(IEncryptionMainService), disposables);
        mainProcessElectronServer.registerChannel("encryption", encryptionChannel);
        const browserViewChannel = ProxyChannel.fromService(accessor.get(IBrowserViewMainService), disposables);
        mainProcessElectronServer.registerChannel(ipcBrowserViewChannelName, browserViewChannel);
        sharedProcessClient.then((client) => client.registerChannel(ipcBrowserViewChannelName, browserViewChannel));
        const browserViewGroupChannel = ProxyChannel.fromService(accessor.get(IBrowserViewGroupMainService), disposables);
        mainProcessElectronServer.registerChannel(ipcBrowserViewGroupChannelName, browserViewGroupChannel);
        sharedProcessClient.then((client) => client.registerChannel(ipcBrowserViewGroupChannelName, browserViewGroupChannel));
        const signChannel = ProxyChannel.fromService(accessor.get(ISignService), disposables);
        mainProcessElectronServer.registerChannel("sign", signChannel);
        const keyboardLayoutChannel = ProxyChannel.fromService(accessor.get(IKeyboardLayoutMainService), disposables);
        mainProcessElectronServer.registerChannel("keyboardLayout", keyboardLayoutChannel);
        this.nativeHostMainService = accessor.get(INativeHostMainService);
        const nativeHostChannel = ProxyChannel.fromService(this.nativeHostMainService, disposables, {
          // This event has main-process consumers but no IPC consumer, so its buffer would never drain.
          unbufferedEvents: ["onDidBlurMainWindow"]
        });
        mainProcessElectronServer.registerChannel("nativeHost", nativeHostChannel);
        sharedProcessClient.then((client) => client.registerChannel("nativeHost", nativeHostChannel));
        const webContentExtractorChannel = ProxyChannel.fromService(accessor.get(IWebContentExtractorService), disposables);
        mainProcessElectronServer.registerChannel("webContentExtractor", webContentExtractorChannel);
        const workspacesChannel = ProxyChannel.fromService(accessor.get(IWorkspacesService), disposables);
        mainProcessElectronServer.registerChannel("workspaces", workspacesChannel);
        const menubarChannel = ProxyChannel.fromService(accessor.get(IMenubarMainService), disposables);
        mainProcessElectronServer.registerChannel("menubar", menubarChannel);
        const urlChannel = ProxyChannel.fromService(accessor.get(IURLService), disposables);
        mainProcessElectronServer.registerChannel("url", urlChannel);
        const webviewChannel = ProxyChannel.fromService(accessor.get(IWebviewManagerService), disposables);
        mainProcessElectronServer.registerChannel("webview", webviewChannel);
        const storageChannel = disposables.add(new StorageDatabaseChannel(this.logService, accessor.get(IStorageMainService)));
        mainProcessElectronServer.registerChannel("storage", storageChannel);
        sharedProcessClient.then((client) => client.registerChannel("storage", storageChannel));
        const profileStorageListener = disposables.add(new ProfileStorageChangesListenerChannel(accessor.get(IStorageMainService), accessor.get(IUserDataProfilesMainService), this.logService));
        sharedProcessClient.then((client) => client.registerChannel("profileStorageListener", profileStorageListener));
        const ptyHostChannel = ProxyChannel.fromService(accessor.get(ILocalPtyService), disposables);
        mainProcessElectronServer.registerChannel("localPty" /* LocalPty */, ptyHostChannel);
        const externalTerminalChannel = ProxyChannel.fromService(accessor.get(IExternalTerminalMainService), disposables);
        mainProcessElectronServer.registerChannel("externalTerminal", externalTerminalChannel);
        const sandboxHelperChannel = ProxyChannel.fromService(accessor.get(ISandboxHelperMainService), disposables);
        mainProcessElectronServer.registerChannel("sandboxHelper", sandboxHelperChannel);
        const mcpDiscoveryChannel = ProxyChannel.fromService(accessor.get(INativeMcpDiscoveryHelperService), disposables);
        mainProcessElectronServer.registerChannel(NativeMcpDiscoveryHelperChannelName, mcpDiscoveryChannel);
        const mcpGatewayChannel = this._register(new McpGatewayChannel(mainProcessElectronServer, accessor.get(IMcpGatewayService), accessor.get(ILoggerMainService)));
        mainProcessElectronServer.registerChannel(McpGatewayChannelName, mcpGatewayChannel);
        const loggerChannel = this._register(new LoggerChannel(accessor.get(ILoggerMainService)));
        mainProcessElectronServer.registerChannel("logger", loggerChannel);
        sharedProcessClient.then((client) => client.registerChannel("logger", loggerChannel));
        const electronExtensionHostDebugBroadcastChannel = new ElectronExtensionHostDebugBroadcastChannel(accessor.get(IWindowsMainService));
        mainProcessElectronServer.registerChannel("extensionhostdebugservice", electronExtensionHostDebugBroadcastChannel);
        const extensionHostStarterChannel = ProxyChannel.fromService(accessor.get(IExtensionHostStarter), disposables);
        mainProcessElectronServer.registerChannel(ipcExtensionHostStarterChannelName, extensionHostStarterChannel);
        const utilityProcessWorkerChannel = ProxyChannel.fromService(accessor.get(IUtilityProcessWorkerMainService), disposables);
        mainProcessElectronServer.registerChannel(ipcUtilityProcessWorkerChannelName, utilityProcessWorkerChannel);
      }
      async openFirstWindow(accessor, initialProtocolUrls) {
        const windowsMainService = this.windowsMainService = accessor.get(IWindowsMainService);
        this.auxiliaryWindowsMainService = accessor.get(IAuxiliaryWindowsMainService);
        const context = isLaunchedFromCli(process.env) ? 0 /* CLI */ : 4 /* DESKTOP */;
        const args2 = this.environmentMainService.args;
        if (args2["agents"]) {
          return windowsMainService.openAgentsWindow({
            context,
            cli: args2,
            initialStartup: true
          });
        }
        if (initialProtocolUrls) {
          if (initialProtocolUrls.openables.length > 0) {
            return windowsMainService.open({
              context,
              cli: args2,
              urisToOpen: initialProtocolUrls.openables,
              gotoLineMode: true,
              initialStartup: true
              // remoteAuthority: will be determined based on openables
            });
          }
          if (initialProtocolUrls.urls.length > 0) {
            for (const protocolUrl of initialProtocolUrls.urls) {
              const params = new URLSearchParams(protocolUrl.uri.query);
              if (params.get("windowId") === "_blank") {
                params.delete("windowId");
                protocolUrl.originalUrl = protocolUrl.uri.toString(true);
                protocolUrl.uri = protocolUrl.uri.with({ query: params.toString() });
                return windowsMainService.open({
                  context,
                  cli: args2,
                  forceNewWindow: true,
                  forceEmpty: true,
                  gotoLineMode: true,
                  initialStartup: true
                  // remoteAuthority: will be determined based on openables
                });
              }
            }
          }
        }
        const macOpenFiles = global.macOpenFiles ?? [];
        const hasCliArgs = args2._.length;
        const hasFolderURIs = !!args2["folder-uri"];
        const hasFileURIs = !!args2["file-uri"];
        const noRecentEntry = args2["skip-add-to-recently-opened"] === true;
        const waitMarkerFileURI = args2.wait && args2.waitMarkerFilePath ? URI.file(args2.waitMarkerFilePath) : void 0;
        const remoteAuthority = args2.remote || void 0;
        const forceProfile = args2.profile;
        const forceTempProfile = args2["profile-temp"];
        if (!hasCliArgs && !hasFolderURIs && !hasFileURIs) {
          if (args2["new-window"] || forceProfile || forceTempProfile) {
            return windowsMainService.open({
              context,
              cli: args2,
              forceNewWindow: true,
              forceEmpty: true,
              noRecentEntry,
              waitMarkerFileURI,
              initialStartup: true,
              remoteAuthority,
              forceProfile,
              forceTempProfile
            });
          }
          if (macOpenFiles.length) {
            return windowsMainService.open({
              context: 1 /* DOCK */,
              cli: args2,
              urisToOpen: macOpenFiles.map((path4) => {
                path4 = normalizeNFC(path4);
                return hasWorkspaceFileExtension(path4) ? { workspaceUri: URI.file(path4) } : { fileUri: URI.file(path4) };
              }),
              noRecentEntry,
              waitMarkerFileURI,
              initialStartup: true
              // remoteAuthority: will be determined based on macOpenFiles
            });
          }
        }
        return windowsMainService.open({
          context,
          cli: args2,
          forceNewWindow: args2["new-window"],
          diffMode: args2.diff,
          mergeMode: args2.merge,
          noRecentEntry,
          waitMarkerFileURI,
          gotoLineMode: args2.goto,
          initialStartup: true,
          remoteAuthority,
          forceProfile,
          forceTempProfile
        });
      }
      afterWindowOpen(instantiationService) {
        if (isWindows2) {
          initWindowsVersionInfo();
        }
        this.installMutex();
        protocol2.registerHttpProtocol(Schemas.vscodeRemoteResource, (request, callback) => {
          callback({
            url: request.url.replace(/^vscode-remote-resource:/, "http:"),
            method: request.method
          });
        });
        this.resolveShellEnvironment(this.environmentMainService.args, process.env, true);
        this.updateCrashReporterEnablement();
        if (isMacintosh && app13.runningUnderARM64Translation) {
          this.windowsMainService?.sendToFocused("vscode:showTranslatedBuildWarning");
        }
        instantiationService.invokeFunction((accessor) => {
          const telemetryService = accessor.get(ITelemetryService);
          const getPowerEventData = () => ({
            idleState: powerMonitor2.getSystemIdleState(60),
            idleTime: powerMonitor2.getSystemIdleTime(),
            thermalState: powerMonitor2.getCurrentThermalState(),
            onBattery: powerMonitor2.isOnBatteryPower()
          });
          this._register(Event.fromNodeEventEmitter(powerMonitor2, "suspend")(() => {
            telemetryService.publicLog2("power.suspend", getPowerEventData());
          }));
          this._register(Event.fromNodeEventEmitter(powerMonitor2, "resume")(() => {
            telemetryService.publicLog2("power.resume", getPowerEventData());
          }));
        });
        if (isMacintosh) {
          instantiationService.invokeFunction((accessor) => {
            const telemetryService = accessor.get(ITelemetryService);
            const initialGpuFeatureStatus = app13.getGPUFeatureStatus();
            const skiaGraphiteEnabled = initialGpuFeatureStatus["skia_graphite"];
            if (skiaGraphiteEnabled === "enabled") {
              const gpuInfoUpdate = Event.fromNodeEventEmitter(app13, "gpu-info-update");
              const pendingGpuInfoListener = this._register(new MutableDisposable());
              this._register(Event.fromNodeEventEmitter(app13, "child-process-gone", (event, details) => ({ event, details }))(({ details }) => {
                if (details.type === "GPU" && details.reason === "crashed") {
                  pendingGpuInfoListener.value = Event.once(gpuInfoUpdate)(() => {
                    const currentGpuFeatureStatus = app13.getGPUFeatureStatus();
                    const currentRasterizationStatus = currentGpuFeatureStatus["rasterization"];
                    if (currentRasterizationStatus !== "enabled") {
                      let gpuLogMessages = [];
                      const customApp = app13;
                      if (typeof customApp.getGPULogMessages === "function") {
                        gpuLogMessages = customApp.getGPULogMessages().slice(-10).map((log4) => log4.message);
                      }
                      telemetryService.publicLog2("gpu.crash.fallback", {
                        gpuFeatureStatus: JSON.stringify(currentGpuFeatureStatus),
                        gpuLogMessages: JSON.stringify(gpuLogMessages)
                      });
                    }
                  });
                }
              }));
            }
          });
        }
        {
          const customApp = app13;
          instantiationService.invokeFunction((accessor) => {
            const telemetryService = accessor.get(ITelemetryService);
            this._register(Event.fromNodeEventEmitter(customApp, "network-process-launched", (_event, details) => details)((details) => {
              this.logService.info(`[network process] launched with pid ${details.pid}`);
              telemetryService.publicLog2("networkProcess.launched", {});
            }));
            this._register(Event.fromNodeEventEmitter(customApp, "network-process-gone", (_event, details) => details)((details) => {
              this.logService.info(`[network process] gone - pid: ${details.pid}, exitCode: ${details.exitCode}, crashed: ${details.crashed}, crashedPreIPC: ${details.crashedPreIPC}`);
              telemetryService.publicLog2("networkProcess.gone", {
                exitCode: details.exitCode,
                crashed: details.crashed,
                crashedPreIPC: details.crashedPreIPC
              });
            }));
          });
        }
      }
      async installMutex() {
        const win32MutexName = this.productService.win32MutexName;
        if (isWindows2 && win32MutexName && isInnoSetupInstall()) {
          try {
            const WindowsMutex = await import("@vscode/windows-mutex");
            const mutex = new WindowsMutex.Mutex(win32MutexName);
            Event.once(this.lifecycleMainService.onWillShutdown)(() => mutex.release());
          } catch (error) {
            this.logService.error(error);
          }
        }
      }
      async resolveShellEnvironment(args2, env2, notifyOnError) {
        try {
          return await getResolvedShellEnv(this.configurationService, this.logService, args2, env2);
        } catch (error) {
          const errorMessage = toErrorMessage(error);
          if (notifyOnError) {
            this.windowsMainService?.sendToFocused("vscode:showResolveShellEnvError", errorMessage);
          } else {
            this.logService.error(errorMessage);
          }
        }
        return {};
      }
      async updateCrashReporterEnablement() {
        try {
          const argvContent = await this.fileService.readFile(this.environmentMainService.argvResource);
          const argvString = argvContent.value.toString();
          const argvJSON = parse(argvString);
          const telemetryLevel = getTelemetryLevel(this.configurationService);
          const enableCrashReporter = telemetryLevel >= 1 /* CRASH */;
          if (argvJSON["enable-crash-reporter"] === void 0) {
            const additionalArgvContent = [
              "",
              "	// Allows to disable crash reporting.",
              "	// Should restart the app if the value is changed.",
              `	"enable-crash-reporter": ${enableCrashReporter},`,
              "",
              "	// Unique id used for correlating crash reports sent from this instance.",
              "	// Do not edit this value.",
              `	"crash-reporter-id": "${generateUuid()}"`,
              "}"
            ];
            const newArgvString = argvString.substring(0, argvString.length - 2).concat(",\n", additionalArgvContent.join("\n"));
            await this.fileService.writeFile(this.environmentMainService.argvResource, VSBuffer.fromString(newArgvString));
          } else {
            const newArgvString = argvString.replace(/"enable-crash-reporter": .*,/, `"enable-crash-reporter": ${enableCrashReporter},`);
            if (newArgvString !== argvString) {
              await this.fileService.writeFile(this.environmentMainService.argvResource, VSBuffer.fromString(newArgvString));
            }
          }
        } catch (error) {
          this.logService.error(error);
          this.windowsMainService?.sendToFocused("vscode:showArgvParseWarning");
        }
      }
      eventuallyAfterWindowOpen(instantiationService) {
        validateDevDeviceId(this.stateService, this.logService);
        instantiationService.invokeFunction((accessor) => {
          const telemetryService = accessor.get(ITelemetryService);
          if (telemetryService.telemetryLevel < 3 /* USAGE */) {
            return;
          }
          const nativeHostMainService = accessor.get(INativeHostMainService);
          void this.logOSProxyConfigTelemetry(nativeHostMainService, telemetryService);
        });
      }
      async logOSProxyConfigTelemetry(nativeHostMainService, telemetryService) {
        const startTime = Date.now();
        try {
          const config = await nativeHostMainService.readProxyConfigWithPackage(void 0);
          const durationMs = Date.now() - startTime;
          const pacScriptStats = config.pac ? getPACScriptStats(config.pac.content) : void 0;
          telemetryService.publicLog2("osProxyConfig", {
            success: true,
            durationMs,
            platformKind: config.platform?.kind ?? "none",
            autoDetect: config.autoDetect,
            httpProxyEnvironmentState: getOSProxyEnvironmentState(config.environment.httpProxy),
            httpsProxyEnvironmentState: getOSProxyEnvironmentState(config.environment.httpsProxy),
            allProxyEnvironmentState: getOSProxyEnvironmentState(config.environment.allProxy),
            noProxyEnvironmentState: getOSProxyEnvironmentState(config.environment.noProxy),
            wpadDhcpState: config.wpadDhcp.state,
            wpadDnsState: config.wpadDns.state,
            configuredPacState: config.configuredPac.state,
            hasConfiguredPac: !!config.pacUrl,
            hasLoadedPac: !!config.pac,
            pacSource: config.pac?.source ?? "none",
            pacScriptCharacterCount: pacScriptStats?.characterCount,
            pacScriptLineCount: pacScriptStats?.lineCount,
            pacScriptReturnCount: pacScriptStats?.returnCount,
            hasHttpProxy: !!config.staticRules?.http,
            hasHttpsProxy: !!config.staticRules?.https,
            hasSocksProxy: !!config.staticRules?.socks,
            hasBypassRules: hasOSProxyBypassRules(config),
            excludeSimpleHostnames: config.platform?.kind === "macos" ? config.platform.excludeSimpleHostnames : void 0
          });
        } catch {
          telemetryService.publicLog2("osProxyConfig", {
            success: false,
            durationMs: Date.now() - startTime
          });
        }
      }
    };
    CodeApplication = __decorateClass([
      __decorateParam(2, IInstantiationService),
      __decorateParam(3, ILogService),
      __decorateParam(4, ILoggerService),
      __decorateParam(5, IEnvironmentMainService),
      __decorateParam(6, ILifecycleMainService),
      __decorateParam(7, IConfigurationService),
      __decorateParam(8, IStateService),
      __decorateParam(9, IFileService),
      __decorateParam(10, IProductService),
      __decorateParam(11, IUserDataProfilesMainService)
    ], CodeApplication);
  }
});
export { hasOSProxyBypassRules, getOSProxyEnvironmentState, getPACScriptStats, app13, BrowserWindow9, desktopCapturer, globalShortcut, powerMonitor2, protocol2, electronScreen, session2, systemPreferences2, hostname2, release8, CodeApplication, init_app };
