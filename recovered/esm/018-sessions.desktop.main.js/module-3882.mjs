// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/electron-browser/sessions.main.ts
import { Disposable } from "./module-0012.mjs";
import { setFullscreen } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, reviveIdentifier } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { domContentLoaded } from "./module-0075.mjs";
import { createSessionsWorkbench } from "./module-3866.mjs";
import { NativeWindow } from "./module-3831.mjs";
import { isCI, isMacintosh, isTahoeOrNewer } from "./module-0014.mjs";
import { hasNativeMenu } from "./module-0515.mjs";
import { NativeMenubarControl } from "./module-3871.mjs";
import { applyZoom } from "./module-3822.mjs";
import { localize } from "./module-0001.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ElectronIPCMainProcessService } from "./module-3850.mjs";
import { IMainProcessService } from "./module-3825.mjs";
import { product_default } from "./module-0139.mjs";
import { IProductService } from "./module-0875.mjs";
import { INativeWorkbenchEnvironmentService, NativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { LoggerChannelClient } from "./module-3270.mjs";
import { ILogService, ILoggerService } from "./module-0095.mjs";
import { NativeLogService } from "./module-3852.mjs";
import { safeStringify } from "./module-0098.mjs";
import { DefaultAccountService } from "./module-1803.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { PolicyChannelClient } from "./module-3857.mjs";
import { NativeManagedSettingsChannelClient } from "./module-3858.mjs";
import { IFileManagedSettingsService, IManagedSettingsService, INativeManagedSettingsService } from "./module-0956.mjs";
import { FileManagedSettingsChannelClient } from "./module-3859.mjs";
import { AccountPolicyService, IAccountPolicyGateService } from "./module-0958.mjs";
import { MultiplexPolicyService } from "./module-3864.mjs";
import { IPolicyService } from "./module-0957.mjs";
import { SharedProcessService } from "./module-3835.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { IUtilityProcessWorkerWorkbenchService, UtilityProcessWorkerWorkbenchService } from "./module-3830.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { ISignService } from "./module-3838.mjs";
import { FileService } from "./module-3842.mjs";
import { IFileService } from "./module-0269.mjs";
import { RemoteAuthorityResolverService } from "./module-3836.mjs";
import { ElectronRemoteResourceLoader } from "./module-3863.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { DiskFileSystemProvider } from "./module-3855.mjs";
import { Schemas } from "./module-0033.mjs";
import { UriIdentityService } from "./module-3846.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { UserDataProfilesService2 } from "./module-1202.mjs";
import { IUserDataProfilesService, reviveProfile } from "./module-0511.mjs";
import { UserDataProfileService } from "./module-3860.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { FileUserDataProvider } from "./module-3856.mjs";
import { IRemoteSocketFactoryService, RemoteSocketFactoryService } from "./module-1233.mjs";
import { BrowserSocketFactory } from "./module-3861.mjs";
import { RemoteAgentService } from "./module-3840.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { RemoteFileSystemProviderClient } from "./module-3845.mjs";
import { getWorkspaceIdentifier } from "./module-3880.mjs";
import { SessionsWorkspaceContextService } from "./module-3881.mjs";
import { IWorkspaceEditingService } from "./module-1313.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INativeKeyboardLayoutService, NativeKeyboardLayoutService } from "./module-3847.mjs";
import { WorkspaceTrustEnablementService, WorkspaceTrustManagementService } from "./module-1048.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ConfigurationCache } from "./module-3879.mjs";
import { ConfigurationService } from "./module-3878.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { NativeWorkbenchStorageService } from "./module-3833.mjs";


// src/vs/sessions/electron-browser/sessions.main.ts
var SessionsMain = class extends Disposable {
  constructor(configuration2) {
    super();
    this.configuration = configuration2;
    this.init();
  }
  init() {
    this.reviveUris();
    setFullscreen(!!this.configuration.fullscreen, mainWindow);
  }
  reviveUris() {
    const workspace = reviveIdentifier(this.configuration.workspace);
    if (isWorkspaceIdentifier(workspace) || isSingleFolderWorkspaceIdentifier(workspace)) {
      this.configuration.workspace = workspace;
    }
    const filesToWait = this.configuration.filesToWait;
    const filesToWaitPaths = filesToWait?.paths;
    for (const paths of [filesToWaitPaths, this.configuration.filesToOpenOrCreate, this.configuration.filesToDiff, this.configuration.filesToMerge]) {
      if (Array.isArray(paths)) {
        for (const path of paths) {
          if (path.fileUri) {
            path.fileUri = URI.revive(path.fileUri);
          }
        }
      }
    }
    if (filesToWait) {
      filesToWait.waitMarkerFileUri = URI.revive(filesToWait.waitMarkerFileUri);
    }
  }
  async open() {
    const [services] = await Promise.all([this.initServices(), domContentLoaded(mainWindow)]);
    this.applyWindowZoomLevel(services.configurationService);
    const workbench2 = createSessionsWorkbench(mainWindow.document.body, {
      extraClasses: this.getExtraClasses()
    }, services.serviceCollection, services.logService);
    this.registerListeners(workbench2, services.storageService);
    const instantiationService = workbench2.startup();
    this._register(instantiationService.createInstance(NativeWindow));
    if (isMacintosh || hasNativeMenu(services.configurationService)) {
      this._register(instantiationService.createInstance(NativeMenubarControl));
    }
  }
  applyWindowZoomLevel(configurationService) {
    let zoomLevel = void 0;
    if (this.configuration.isCustomZoomLevel && typeof this.configuration.zoomLevel === "number") {
      zoomLevel = this.configuration.zoomLevel;
    } else {
      const windowConfig = configurationService.getValue();
      zoomLevel = typeof windowConfig.window?.zoomLevel === "number" ? windowConfig.window.zoomLevel : 0;
    }
    applyZoom(zoomLevel, mainWindow);
  }
  getExtraClasses() {
    if (isMacintosh && isTahoeOrNewer(this.configuration.os.release)) {
      return ["macos-tahoe"];
    }
    return [];
  }
  registerListeners(workbench2, storageService) {
    this._register(workbench2.onWillShutdown((event) => event.join(storageService.close(), { id: "join.closeStorage", label: localize(5630, null) })));
    this._register(workbench2.onDidShutdown(() => this.dispose()));
  }
  async initServices() {
    const serviceCollection = new ServiceCollection();
    const mainProcessService = this._register(new ElectronIPCMainProcessService(this.configuration.windowId));
    serviceCollection.set(IMainProcessService, mainProcessService);
    const productService = { _serviceBrand: void 0, ...product_default };
    serviceCollection.set(IProductService, productService);
    const environmentService = new NativeWorkbenchEnvironmentService(this.configuration, productService);
    serviceCollection.set(INativeWorkbenchEnvironmentService, environmentService);
    const loggers = this.configuration.loggers.map((loggerResource) => ({ ...loggerResource, resource: URI.revive(loggerResource.resource) }));
    const loggerService = new LoggerChannelClient(this.configuration.windowId, this.configuration.logLevel, environmentService.windowLogsPath, loggers, mainProcessService.getChannel("logger"));
    serviceCollection.set(ILoggerService, loggerService);
    const logService = this._register(new NativeLogService(loggerService, environmentService));
    serviceCollection.set(ILogService, logService);
    if (isCI) {
      logService.info("workbench#open()");
    }
    if (logService.getLevel() === 1 /* Trace */) {
      logService.trace("workbench#open(): with configuration", safeStringify({
        ...this.configuration,
        nls: void 0
        /* exclude large property */
      }));
    }
    const defaultAccountService = this._register(new DefaultAccountService(productService));
    serviceCollection.set(IDefaultAccountService, defaultAccountService);
    let policyService;
    const policyChannel = this.configuration.policiesData ? this._register(new PolicyChannelClient(this.configuration.policiesData, mainProcessService.getChannel("policy"))) : void 0;
    const nativeManagedSettings = this._register(new NativeManagedSettingsChannelClient(mainProcessService.getChannel("nativeManagedSettings"), logService));
    serviceCollection.set(INativeManagedSettingsService, nativeManagedSettings);
    const fileManagedSettings = this._register(new FileManagedSettingsChannelClient(mainProcessService.getChannel("fileManagedSettings")));
    serviceCollection.set(IFileManagedSettingsService, fileManagedSettings);
    const accountPolicy = this._register(new AccountPolicyService(logService, defaultAccountService, policyChannel, nativeManagedSettings, fileManagedSettings));
    serviceCollection.set(IManagedSettingsService, accountPolicy);
    if (policyChannel) {
      policyService = this._register(new MultiplexPolicyService([policyChannel, accountPolicy], logService));
    } else {
      policyService = accountPolicy;
    }
    serviceCollection.set(IPolicyService, policyService);
    serviceCollection.set(IAccountPolicyGateService, accountPolicy);
    const sharedProcessService = new SharedProcessService(this.configuration.windowId, logService);
    serviceCollection.set(ISharedProcessService, sharedProcessService);
    const utilityProcessWorkerWorkbenchService = new UtilityProcessWorkerWorkbenchService(this.configuration.windowId, logService, mainProcessService);
    serviceCollection.set(IUtilityProcessWorkerWorkbenchService, utilityProcessWorkerWorkbenchService);
    const signService = ProxyChannel.toService(mainProcessService.getChannel("sign"));
    serviceCollection.set(ISignService, signService);
    const fileService = this._register(new FileService(logService));
    serviceCollection.set(IFileService, fileService);
    const remoteAuthorityResolverService = new RemoteAuthorityResolverService(productService, new ElectronRemoteResourceLoader(environmentService.window.id, mainProcessService, fileService));
    serviceCollection.set(IRemoteAuthorityResolverService, remoteAuthorityResolverService);
    const diskFileSystemProvider = this._register(new DiskFileSystemProvider(mainProcessService, utilityProcessWorkerWorkbenchService, logService, loggerService));
    fileService.registerProvider(Schemas.file, diskFileSystemProvider);
    const uriIdentityService = new UriIdentityService(fileService);
    serviceCollection.set(IUriIdentityService, uriIdentityService);
    const userDataProfilesService = new UserDataProfilesService2(this.configuration.profiles.all, URI.revive(this.configuration.profiles.home).with({ scheme: environmentService.userRoamingDataHome.scheme }), mainProcessService.getChannel("userDataProfiles"));
    serviceCollection.set(IUserDataProfilesService, userDataProfilesService);
    const userDataProfileService = new UserDataProfileService(reviveProfile(this.configuration.profiles.profile, userDataProfilesService.profilesHome.scheme));
    serviceCollection.set(IUserDataProfileService, userDataProfileService);
    fileService.registerProvider(Schemas.vscodeUserData, this._register(new FileUserDataProvider(Schemas.file, diskFileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService)));
    const remoteSocketFactoryService = new RemoteSocketFactoryService();
    remoteSocketFactoryService.register(0 /* WebSocket */, new BrowserSocketFactory(null));
    serviceCollection.set(IRemoteSocketFactoryService, remoteSocketFactoryService);
    const remoteAgentService = this._register(new RemoteAgentService(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService));
    serviceCollection.set(IRemoteAgentService, remoteAgentService);
    this._register(RemoteFileSystemProviderClient.register(remoteAgentService, fileService, logService));
    const workspaceIdentifier = getWorkspaceIdentifier(environmentService.agentSessionsWorkspace);
    const workspaceContextService = new SessionsWorkspaceContextService(workspaceIdentifier, uriIdentityService);
    serviceCollection.set(IWorkspaceContextService, workspaceContextService);
    serviceCollection.set(IWorkspaceEditingService, workspaceContextService);
    const [configurationService, storageService] = await Promise.all([
      this.createConfigurationService(workspaceContextService, userDataProfileService, uriIdentityService, fileService, logService, policyService, environmentService).then((configurationService2) => {
        serviceCollection.set(IWorkbenchConfigurationService, configurationService2);
        return configurationService2;
      }),
      this.createStorageService(workspaceIdentifier, environmentService, userDataProfileService, userDataProfilesService, mainProcessService).then((service) => {
        serviceCollection.set(IStorageService, service);
        return service;
      }),
      this.createKeyboardLayoutService(mainProcessService).then((service) => {
        serviceCollection.set(INativeKeyboardLayoutService, service);
        return service;
      })
    ]);
    const workspaceTrustEnablementService = new WorkspaceTrustEnablementService(configurationService, environmentService);
    serviceCollection.set(IWorkspaceTrustEnablementService, workspaceTrustEnablementService);
    const workspaceTrustManagementService = new WorkspaceTrustManagementService(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, workspaceContextService, workspaceTrustEnablementService, fileService);
    serviceCollection.set(IWorkspaceTrustManagementService, workspaceTrustManagementService);
    return { serviceCollection, logService, storageService, configurationService };
  }
  async createConfigurationService(workspaceContextService, userDataProfileService, uriIdentityService, fileService, logService, policyService, environmentService) {
    const configurationCache = new ConfigurationCache([Schemas.file, Schemas.vscodeUserData], environmentService, fileService);
    const configurationService = new ConfigurationService(userDataProfileService, workspaceContextService, uriIdentityService, fileService, policyService, logService, configurationCache, environmentService);
    try {
      await configurationService.initialize();
    } catch (error) {
      onUnexpectedError(error);
    }
    return configurationService;
  }
  async createStorageService(workspace, environmentService, userDataProfileService, userDataProfilesService, mainProcessService) {
    const storageService = new NativeWorkbenchStorageService(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService);
    try {
      await storageService.initialize();
      return storageService;
    } catch (error) {
      onUnexpectedError(error);
      return storageService;
    }
  }
  async createKeyboardLayoutService(mainProcessService) {
    const keyboardLayoutService = new NativeKeyboardLayoutService(mainProcessService);
    try {
      await keyboardLayoutService.initialize();
      return keyboardLayoutService;
    } catch (error) {
      onUnexpectedError(error);
      return keyboardLayoutService;
    }
  }
};

function main(configuration2) {
  const workbench2 = new SessionsMain(configuration2);
  return workbench2.open();
}
export { main, SessionsMain };
