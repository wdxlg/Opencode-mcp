// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/electron-browser/nativeExtensionService.ts
import { AbstractExtensionService, ExtensionHostCrashTracker, LocalExtensions, RemoteExtensions, ResolverExtensions, checkEnabledAndProposedAPI, extensionIsEnabled, isResolverExtension2 } from "./module-4022.mjs";
import { ExtensionsProposedApi } from "./module-4023.mjs";
import { CachedExtensionScanner } from "./module-4026.mjs";
import { runWhenWindowIdle } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IHostService } from "./module-1118.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { getRemoteName, isLoopbackHost, parseAuthorityWithPort } from "./module-0687.mjs";
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError, getRemoteAuthorityPrefix } from "./module-0896.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { Schemas } from "./module-0033.mjs";
import { mark } from "./module-0506.mjs";
import { isCI } from "./module-0014.mjs";
import { updateProxyConfigurationsScope } from "./module-0947.mjs";
import { parseExtensionDevOptions } from "./module-1056.mjs";
import { ExtensionHostExtensions, IExtensionService, toExtension, webWorkerExtHostConfig } from "./module-0889.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProductService } from "./module-0875.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IRemoteExtensionsScannerService } from "./module-1664.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IRemoteExplorerService } from "./module-1413.mjs";
import { IExtensionGalleryService } from "./module-0874.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IDialogService } from "./module-0267.mjs";
import { NativeLocalProcessExtensionHost } from "./module-4028.mjs";
import { WebWorkerExtensionHost } from "./module-4014.mjs";
import { RemoteExtensionHost } from "./module-4024.mjs";
import { filterExtensionDescriptions } from "./module-4020.mjs";
import { extensionHostKindToString, extensionRunningPreferenceToString } from "./module-1180.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensions/electron-browser/nativeExtensionService.ts
var NativeExtensionService = class extends AbstractExtensionService {
  constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, _nativeHostService, _hostService, _remoteExplorerService, _extensionGalleryService, _workspaceTrustManagementService, dialogService) {
    const extensionsProposedApi = instantiationService.createInstance(ExtensionsProposedApi);
    const extensionScanner = instantiationService.createInstance(CachedExtensionScanner);
    const extensionHostFactory = new NativeExtensionHostFactory(
      extensionsProposedApi,
      extensionScanner,
      () => this._getExtensionRegistrySnapshotWhenReady(),
      instantiationService,
      environmentService,
      extensionEnablementService,
      configurationService,
      remoteAgentService,
      remoteAuthorityResolverService,
      logService
    );
    super(
      { hasLocalProcess: true, allowRemoteExtensionsInLocalWebWorker: false },
      extensionsProposedApi,
      extensionHostFactory,
      new NativeExtensionHostKindPicker(environmentService, configurationService, logService),
      instantiationService,
      notificationService,
      environmentService,
      telemetryService,
      extensionEnablementService,
      fileService,
      productService,
      extensionManagementService,
      contextService,
      configurationService,
      extensionManifestPropertiesService,
      logService,
      remoteAgentService,
      remoteExtensionsScannerService,
      lifecycleService,
      remoteAuthorityResolverService,
      dialogService
    );
    this._nativeHostService = _nativeHostService;
    this._hostService = _hostService;
    this._remoteExplorerService = _remoteExplorerService;
    this._extensionGalleryService = _extensionGalleryService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._localCrashTracker = new ExtensionHostCrashTracker();
    this._extensionScanner = extensionScanner;
    lifecycleService.when(2 /* Ready */).then(() => {
      runWhenWindowIdle(
        mainWindow,
        () => {
          this._initializeIfNeeded();
        },
        50
        /*max delay*/
      );
    });
  }
  async _scanAllLocalExtensions() {
    return this._extensionScanner.scannedExtensions;
  }
  _onExtensionHostCrashed(extensionHost, code, signal) {
    const activatedExtensions = [];
    const extensionsStatus = this.getExtensionsStatus();
    for (const key3 of Object.keys(extensionsStatus)) {
      const extensionStatus = extensionsStatus[key3];
      if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
        activatedExtensions.push(extensionStatus.id);
      }
    }
    super._onExtensionHostCrashed(extensionHost, code, signal);
    if (extensionHost.kind === 1 /* LocalProcess */) {
      if (code === 55 /* VersionMismatch */) {
        this._notificationService.prompt(
          Severity2.Error,
          localize(23140, null),
          [{
            label: localize(23145, null),
            run: () => {
              this._instantiationService.invokeFunction((accessor) => {
                const hostService = accessor.get(IHostService);
                hostService.restart();
              });
            }
          }]
        );
        return;
      }
      this._logExtensionHostCrash(extensionHost);
      this._sendExtensionHostCrashTelemetry(code, signal, activatedExtensions);
      this._localCrashTracker.registerCrash();
      if (this._localCrashTracker.shouldAutomaticallyRestart()) {
        this._logService.info(`Automatically restarting the extension host.`);
        this._notificationService.status(localize(23138, null), { hideAfter: 5e3 });
        this.startExtensionHosts();
      } else {
        const choices = [];
        if (this._environmentService.isBuilt) {
          choices.push({
            label: localize(23154, null),
            run: () => {
              this._instantiationService.invokeFunction((accessor) => {
                const commandService = accessor.get(ICommandService);
                commandService.executeCommand("extension.bisect.start");
              });
            }
          });
        } else {
          choices.push({
            label: localize(23135, null),
            run: () => this._nativeHostService.openDevTools()
          });
        }
        choices.push({
          label: localize(23151, null),
          run: () => this.startExtensionHosts()
        });
        if (this._environmentService.isBuilt) {
          choices.push({
            label: localize(23144, null),
            run: () => {
              this._instantiationService.invokeFunction((accessor) => {
                const openerService = accessor.get(IOpenerService);
                openerService.open("https://aka.ms/vscode-extension-bisect");
              });
            }
          });
        }
        this._notificationService.prompt(Severity2.Error, localize(23139, null), choices);
      }
    }
  }
  _sendExtensionHostCrashTelemetry(code, signal, activatedExtensions) {
    this._telemetryService.publicLog2("extensionHostCrash", {
      code,
      signal,
      extensionIds: activatedExtensions.map((e4) => e4.value)
    });
    for (const extensionId of activatedExtensions) {
      this._telemetryService.publicLog2("extensionHostCrashExtension", {
        code,
        signal,
        extensionId: extensionId.value
      });
    }
  }
  // --- impl
  async _resolveAuthority(remoteAuthority) {
    const authorityPlusIndex = remoteAuthority.indexOf("+");
    if (authorityPlusIndex === -1) {
      const { host, port } = parseAuthorityWithPort(remoteAuthority);
      if (!isLoopbackHost(host)) {
        await this._confirmDirectRemoteConnection(host, port);
      }
      return {
        authority: {
          authority: remoteAuthority,
          connectTo: {
            type: 0 /* WebSocket */,
            host,
            port
          },
          connectionToken: void 0
        }
      };
    }
    return this._resolveAuthorityOnExtensionHosts(1 /* LocalProcess */, remoteAuthority);
  }
  async _confirmDirectRemoteConnection(host, port) {
    const { confirmed } = await this._dialogService.confirm({
      type: Severity2.Warning,
      message: localize(23146, null, host, port),
      detail: localize(23148, null, host, port),
      primaryButton: localize(23147, null)
    });
    if (!confirmed) {
      throw new RemoteAuthorityResolverError(
        localize(23149, null, host, port),
        "NotAvailable" /* NotAvailable */
      );
    }
  }
  async _getCanonicalURI(remoteAuthority, uri4) {
    const authorityPlusIndex = remoteAuthority.indexOf("+");
    if (authorityPlusIndex === -1) {
      return uri4;
    }
    const localProcessExtensionHosts = this._getExtensionHostManagers(1 /* LocalProcess */);
    if (localProcessExtensionHosts.length === 0) {
      throw new Error(`Cannot resolve canonical URI`);
    }
    const results = await Promise.all(localProcessExtensionHosts.map((extHost) => extHost.getCanonicalURI(remoteAuthority, uri4)));
    for (const result of results) {
      if (result) {
        return result;
      }
    }
    throw new Error(`Cannot get canonical URI because no extension is installed to resolve ${getRemoteAuthorityPrefix(remoteAuthority)}`);
  }
  _resolveExtensions() {
    return new AsyncIterableProducer((emitter) => this._doResolveExtensions(emitter));
  }
  async _doResolveExtensions(emitter) {
    this._extensionScanner.startScanningExtensions();
    const remoteAuthority = this._environmentService.remoteAuthority;
    let remoteEnv = null;
    let remoteExtensions = [];
    if (remoteAuthority) {
      this._remoteAuthorityResolverService._setCanonicalURIProvider(async (uri4) => {
        if (uri4.scheme !== Schemas.vscodeRemote || uri4.authority !== remoteAuthority) {
          return uri4;
        }
        mark(`code/willGetCanonicalURI/${getRemoteAuthorityPrefix(remoteAuthority)}`);
        if (isCI) {
          this._logService.info(`Invoking getCanonicalURI for authority ${getRemoteAuthorityPrefix(remoteAuthority)}...`);
        }
        try {
          return this._getCanonicalURI(remoteAuthority, uri4);
        } finally {
          mark(`code/didGetCanonicalURI/${getRemoteAuthorityPrefix(remoteAuthority)}`);
          if (isCI) {
            this._logService.info(`getCanonicalURI returned for authority ${getRemoteAuthorityPrefix(remoteAuthority)}.`);
          }
        }
      });
      if (isCI) {
        this._logService.info(`Starting to wait on IWorkspaceTrustManagementService.workspaceResolved...`);
      }
      await this._workspaceTrustManagementService.workspaceResolved;
      if (isCI) {
        this._logService.info(`Finished waiting on IWorkspaceTrustManagementService.workspaceResolved.`);
      }
      const localExtensions = await this._scanAllLocalExtensions();
      const resolverExtensions = localExtensions.filter((extension) => isResolverExtension2(extension));
      if (resolverExtensions.length) {
        emitter.emitOne(new ResolverExtensions(resolverExtensions));
      }
      let resolverResult;
      try {
        resolverResult = await this._resolveAuthorityInitial(remoteAuthority);
      } catch (err) {
        if (RemoteAuthorityResolverError.isNoResolverFound(err)) {
          err.isHandled = await this._handleNoResolverFound(remoteAuthority);
        } else {
          if (RemoteAuthorityResolverError.isHandled(err)) {
            console.log(`Error handled: Not showing a notification for the error`);
          }
        }
        this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
        return this._startLocalExtensionHost(emitter);
      }
      this._remoteAuthorityResolverService._setResolvedAuthority(resolverResult.authority, resolverResult.options);
      this._remoteExplorerService.setTunnelInformation(resolverResult.tunnelInformation);
      const connection = this._remoteAgentService.getConnection();
      if (connection) {
        this._register(connection.onDidStateChange(async (e4) => {
          if (e4.type === 0 /* ConnectionLost */) {
            this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
          }
        }));
        this._register(connection.onReconnecting(() => this._resolveAuthorityAgain()));
      }
      [remoteEnv, remoteExtensions] = await Promise.all([
        this._remoteAgentService.getEnvironment(),
        this._remoteExtensionsScannerService.scanExtensions()
      ]);
      if (!remoteEnv) {
        this._notificationService.notify({ severity: Severity2.Error, message: localize(23141, null) });
        return this._startLocalExtensionHost(emitter);
      }
      const useHostProxyDefault = remoteEnv.useHostProxy;
      this._register(this._configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration("http.useLocalProxyConfiguration")) {
          updateProxyConfigurationsScope(this._configurationService.getValue("http.useLocalProxyConfiguration"), useHostProxyDefault);
        }
      }));
      updateProxyConfigurationsScope(this._configurationService.getValue("http.useLocalProxyConfiguration"), useHostProxyDefault);
    } else {
      this._remoteAuthorityResolverService._setCanonicalURIProvider(async (uri4) => uri4);
    }
    return this._startLocalExtensionHost(emitter, remoteExtensions);
  }
  async _startLocalExtensionHost(emitter, remoteExtensions = []) {
    await this._workspaceTrustManagementService.workspaceTrustInitialized;
    if (remoteExtensions.length) {
      emitter.emitOne(new RemoteExtensions(remoteExtensions));
    }
    emitter.emitOne(new LocalExtensions(await this._scanAllLocalExtensions()));
  }
  async _onExtensionHostExit(code) {
    await this._doStopExtensionHosts();
    const connection = this._remoteAgentService.getConnection();
    connection?.dispose();
    if (parseExtensionDevOptions(this._environmentService).isExtensionDevTestFromCli) {
      if (isCI) {
        this._logService.info(`Asking native host service to exit with code ${code}.`);
      }
      this._nativeHostService.exit(code);
    } else {
      this._nativeHostService.closeWindow();
    }
  }
  async _handleNoResolverFound(remoteAuthority) {
    const remoteName = getRemoteName(remoteAuthority);
    const recommendation = this._productService.remoteExtensionTips?.[remoteName];
    if (!recommendation) {
      return false;
    }
    const resolverExtensionId = recommendation.extensionId;
    const allExtensions = await this._scanAllLocalExtensions();
    const extension = allExtensions.filter((e4) => e4.identifier.value === resolverExtensionId)[0];
    if (extension) {
      if (!extensionIsEnabled(this._logService, this._extensionEnablementService, extension, false)) {
        const message = localize(23137, null, recommendation.friendlyName);
        this._notificationService.prompt(
          Severity2.Info,
          message,
          [{
            label: localize(23136, null),
            run: async () => {
              await this._extensionEnablementService.setEnablement([toExtension(extension)], 12 /* EnabledGlobally */);
              await this._hostService.reload();
            }
          }],
          {
            sticky: true,
            priority: 3 /* URGENT */
          }
        );
      }
    } else {
      const message = localize(23143, null, recommendation.friendlyName);
      this._notificationService.prompt(
        Severity2.Info,
        message,
        [{
          label: localize(23142, null),
          run: async () => {
            const [galleryExtension] = await this._extensionGalleryService.getExtensions([{ id: resolverExtensionId }], CancellationToken.None);
            if (galleryExtension) {
              await this._extensionManagementService.installFromGallery(galleryExtension);
              await this._hostService.reload();
            } else {
              this._notificationService.error(localize(23150, null));
            }
          }
        }],
        {
          sticky: true,
          priority: 3 /* URGENT */
        }
      );
    }
    return true;
  }
};

NativeExtensionService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IWorkbenchExtensionEnablementService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IWorkbenchExtensionManagementService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IExtensionManifestPropertiesService),
  __decorateParam(11, ILogService),
  __decorateParam(12, IRemoteAgentService),
  __decorateParam(13, IRemoteExtensionsScannerService),
  __decorateParam(14, ILifecycleService),
  __decorateParam(15, IRemoteAuthorityResolverService),
  __decorateParam(16, INativeHostService),
  __decorateParam(17, IHostService),
  __decorateParam(18, IRemoteExplorerService),
  __decorateParam(19, IExtensionGalleryService),
  __decorateParam(20, IWorkspaceTrustManagementService),
  __decorateParam(21, IDialogService)
], NativeExtensionService);

var NativeExtensionHostFactory = class {
  constructor(_extensionsProposedApi, _extensionScanner, _getExtensionRegistrySnapshotWhenReady, _instantiationService, environmentService, _extensionEnablementService, configurationService, _remoteAgentService, _remoteAuthorityResolverService, _logService) {
    this._extensionsProposedApi = _extensionsProposedApi;
    this._extensionScanner = _extensionScanner;
    this._getExtensionRegistrySnapshotWhenReady = _getExtensionRegistrySnapshotWhenReady;
    this._instantiationService = _instantiationService;
    this._extensionEnablementService = _extensionEnablementService;
    this._remoteAgentService = _remoteAgentService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._logService = _logService;
    this._webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
  }
  createExtensionHost(runningLocations, runningLocation, isInitialStart) {
    switch (runningLocation.kind) {
      case 1 /* LocalProcess */: {
        const startup = isInitialStart ? 2 /* EagerManualStart */ : 1 /* EagerAutoStart */;
        return this._instantiationService.createInstance(NativeLocalProcessExtensionHost, runningLocation, startup, this._createLocalProcessExtensionHostDataProvider(runningLocations, isInitialStart, runningLocation));
      }
      case 2 /* LocalWebWorker */: {
        if (this._webWorkerExtHostEnablement !== 0 /* Disabled */) {
          const startup = this._webWorkerExtHostEnablement === 2 /* Lazy */ ? 3 /* LazyAutoStart */ : 2 /* EagerManualStart */;
          return this._instantiationService.createInstance(WebWorkerExtensionHost, runningLocation, startup, this._createWebWorkerExtensionHostDataProvider(runningLocations, runningLocation));
        }
        return null;
      }
      case 3 /* Remote */: {
        const remoteAgentConnection = this._remoteAgentService.getConnection();
        if (remoteAgentConnection) {
          return this._instantiationService.createInstance(RemoteExtensionHost, runningLocation, this._createRemoteExtensionHostDataProvider(runningLocations, remoteAgentConnection.remoteAuthority));
        }
        return null;
      }
    }
  }
  _createLocalProcessExtensionHostDataProvider(runningLocations, isInitialStart, desiredRunningLocation) {
    return {
      getInitData: async () => {
        if (isInitialStart) {
          const scannedExtensions = await this._extensionScanner.scannedExtensions;
          if (isCI) {
            this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.scannedExtensions: ${scannedExtensions.map((ext) => ext.identifier.value).join(",")}`);
          }
          const localExtensions = checkEnabledAndProposedAPI(
            this._logService,
            this._extensionEnablementService,
            this._extensionsProposedApi,
            scannedExtensions,
            /* ignore workspace trust */
            true
          );
          if (isCI) {
            this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.localExtensions: ${localExtensions.map((ext) => ext.identifier.value).join(",")}`);
          }
          const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
          const myExtensions = filterExtensionDescriptions(localExtensions, runningLocation, (extRunningLocation) => desiredRunningLocation.equals(extRunningLocation));
          const extensions = new ExtensionHostExtensions(0, localExtensions, myExtensions.map((extension) => extension.identifier));
          if (isCI) {
            this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.myExtensions: ${myExtensions.map((ext) => ext.identifier.value).join(",")}`);
          }
          return { extensions };
        } else {
          const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
          const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
          const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map((extension) => extension.identifier));
          return { extensions };
        }
      }
    };
  }
  _createWebWorkerExtensionHostDataProvider(runningLocations, desiredRunningLocation) {
    return {
      getInitData: async () => {
        const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
        const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
        const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map((extension) => extension.identifier));
        return { extensions };
      }
    };
  }
  _createRemoteExtensionHostDataProvider(runningLocations, remoteAuthority) {
    return {
      remoteAuthority,
      getInitData: async () => {
        const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
        const remoteEnv = await this._remoteAgentService.getEnvironment();
        if (!remoteEnv) {
          throw new Error("Cannot provide init data for remote extension host!");
        }
        const myExtensions = runningLocations.filterByExtensionHostKind(snapshot.extensions, 3 /* Remote */);
        const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map((extension) => extension.identifier));
        return {
          connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAuthority),
          pid: remoteEnv.pid,
          appRoot: remoteEnv.appRoot,
          extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
          globalStorageHome: remoteEnv.globalStorageHome,
          workspaceStorageHome: remoteEnv.workspaceStorageHome,
          extensions
        };
      }
    };
  }
};

NativeExtensionHostFactory = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IWorkbenchExtensionEnablementService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IRemoteAgentService),
  __decorateParam(8, IRemoteAuthorityResolverService),
  __decorateParam(9, ILogService)
], NativeExtensionHostFactory);

function determineLocalWebWorkerExtHostEnablement(environmentService, configurationService) {
  if (environmentService.isExtensionDevelopment && environmentService.extensionDevelopmentKind?.some((k) => k === "web")) {
    return 1 /* Eager */;
  } else {
    const config = configurationService.getValue(webWorkerExtHostConfig);
    if (config === true) {
      return 1 /* Eager */;
    } else if (config === "auto") {
      return 2 /* Lazy */;
    } else {
      return 0 /* Disabled */;
    }
  }
}

var NativeExtensionHostKindPicker = class {
  constructor(environmentService, configurationService, _logService) {
    this._logService = _logService;
    this._hasRemoteExtHost = Boolean(environmentService.remoteAuthority);
    const webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
    this._hasWebWorkerExtHost = webWorkerExtHostEnablement !== 0 /* Disabled */;
  }
  pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
    const result = NativeExtensionHostKindPicker.pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, this._hasRemoteExtHost, this._hasWebWorkerExtHost);
    this._logService.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(", ")}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${extensionRunningPreferenceToString(preference)} => ${extensionHostKindToString(result)}`);
    return result;
  }
  static pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, hasRemoteExtHost, hasWebWorkerExtHost) {
    const result = [];
    for (const extensionKind of extensionKinds) {
      if (extensionKind === "ui" && isInstalledLocally) {
        if (preference === 0 /* None */ || preference === 1 /* Local */) {
          return 1 /* LocalProcess */;
        } else {
          result.push(1 /* LocalProcess */);
        }
      }
      if (extensionKind === "workspace" && isInstalledRemotely) {
        if (preference === 0 /* None */ || preference === 2 /* Remote */) {
          return 3 /* Remote */;
        } else {
          result.push(3 /* Remote */);
        }
      }
      if (extensionKind === "workspace" && !hasRemoteExtHost) {
        if (preference === 0 /* None */ || preference === 1 /* Local */) {
          return 1 /* LocalProcess */;
        } else {
          result.push(1 /* LocalProcess */);
        }
      }
      if (extensionKind === "web" && isInstalledLocally && hasWebWorkerExtHost) {
        if (preference === 0 /* None */ || preference === 1 /* Local */) {
          return 2 /* LocalWebWorker */;
        } else {
          result.push(2 /* LocalWebWorker */);
        }
      }
    }
    return result.length > 0 ? result[0] : null;
  }
};

NativeExtensionHostKindPicker = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService)
], NativeExtensionHostKindPicker);

var RestartExtensionHostAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.restartExtensionHost",
      title: localize2(23152, "Restart Extension Host"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const extensionService = accessor.get(IExtensionService);
    const stopped = await extensionService.stopExtensionHosts(localize(23153, null));
    if (stopped) {
      extensionService.startExtensionHosts();
    }
  }
};

registerAction2(RestartExtensionHostAction);

registerSingleton(IExtensionService, NativeExtensionService, 0 /* Eager */);
export { determineLocalWebWorkerExtHostEnablement, NativeExtensionService, NativeExtensionHostFactory, NativeExtensionHostKindPicker, RestartExtensionHostAction };
