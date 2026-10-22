// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/desktop.main.ts
import { Disposable } from "./module-0012.mjs";
import { setFullscreen } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, reviveIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { domContentLoaded } from "./module-0075.mjs";
import { Workbench } from "./module-3723.mjs";
import { NativeWindow } from "./module-3734.mjs";
import { applyZoom } from "./module-3725.mjs";
import { isCI, isMacintosh, isTahoeOrNewer } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ElectronIPCMainProcessService } from "./module-3760.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { product_default } from "./module-0139.mjs";
import { IProductService } from "./module-0873.mjs";
import { INativeWorkbenchEnvironmentService, NativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { LoggerChannelClient } from "./module-3483.mjs";
import { ILogService, ILoggerService } from "./module-0095.mjs";
import { NativeLogService } from "./module-3762.mjs";
import { safeStringify } from "./module-0098.mjs";
import { DefaultAccountService } from "./module-1824.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { PolicyChannelClient } from "./module-3767.mjs";
import { NativeManagedSettingsChannelClient } from "./module-3768.mjs";
import { IFileManagedSettingsService, IManagedSettingsService, INativeManagedSettingsService } from "./module-0955.mjs";
import { FileManagedSettingsChannelClient } from "./module-3769.mjs";
import { AccountPolicyService, IAccountPolicyGateService } from "./module-0957.mjs";
import { MultiplexPolicyService } from "./module-3774.mjs";
import { IPolicyService } from "./module-0956.mjs";
import { SharedProcessService } from "./module-3744.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { IUtilityProcessWorkerWorkbenchService, UtilityProcessWorkerWorkbenchService } from "./module-3733.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { ISignService } from "./module-3747.mjs";
import { FileService } from "./module-3751.mjs";
import { IFileService } from "./module-0269.mjs";
import { RemoteAuthorityResolverService } from "./module-3745.mjs";
import { ElectronRemoteResourceLoader } from "./module-3773.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { DiskFileSystemProvider } from "./module-3765.mjs";
import { Schemas } from "./module-0033.mjs";
import { UriIdentityService } from "./module-3756.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { UserDataProfilesService2 } from "./module-1202.mjs";
import { IUserDataProfilesService, reviveProfile } from "./module-0511.mjs";
import { UserDataProfileService } from "./module-3770.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { FileUserDataProvider } from "./module-3766.mjs";
import { IRemoteSocketFactoryService, RemoteSocketFactoryService } from "./module-1233.mjs";
import { BrowserSocketFactory } from "./module-3771.mjs";
import { RemoteAgentService } from "./module-3749.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { RemoteFileSystemProviderClient } from "./module-3754.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INativeKeyboardLayoutService, NativeKeyboardLayoutService } from "./module-3757.mjs";
import { WorkspaceTrustEnablementService, WorkspaceTrustManagementService } from "./module-1047.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ConfigurationCache } from "./module-3755.mjs";
import { WorkspaceService } from "./module-3740.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { NativeWorkbenchStorageService } from "./module-3742.mjs";


// src/vs/workbench/electron-browser/desktop.main.ts
var DesktopMain = class extends Disposable {
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
    const workbench2 = new Workbench(mainWindow.document.body, {
      extraClasses: this.getExtraClasses(),
      resetLayout: this.configuration["disable-layout-restore"] === true
    }, services.serviceCollection, services.logService);
    this.registerListeners(workbench2, services.storageService);
    const instantiationService = workbench2.startup();
    this._register(instantiationService.createInstance(NativeWindow));
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
    this._register(workbench2.onWillShutdown((event) => event.join(storageService.close(), { id: "join.closeStorage", label: localize(22526, null) })));
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
    const workspace = this.resolveWorkspaceIdentifier(environmentService);
    const [configurationService, storageService] = await Promise.all([
      this.createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService).then((service) => {
        serviceCollection.set(IWorkspaceContextService, service);
        serviceCollection.set(IWorkbenchConfigurationService, service);
        return service;
      }),
      this.createStorageService(workspace, environmentService, userDataProfileService, userDataProfilesService, mainProcessService).then((service) => {
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
    const workspaceTrustManagementService = new WorkspaceTrustManagementService(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, configurationService, workspaceTrustEnablementService, fileService);
    serviceCollection.set(IWorkspaceTrustManagementService, workspaceTrustManagementService);
    configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
    this._register(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted())));
    return { serviceCollection, logService, storageService, configurationService };
  }
  resolveWorkspaceIdentifier(environmentService) {
    if (this.configuration.workspace) {
      return this.configuration.workspace;
    }
    return toWorkspaceIdentifier(this.configuration.backupPath, environmentService.isExtensionDevelopment);
  }
  async createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService) {
    const configurationCache = new ConfigurationCache([Schemas.file, Schemas.vscodeUserData], environmentService, fileService);
    const workspaceService = new WorkspaceService({ remoteAuthority: environmentService.remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService);
    try {
      await workspaceService.initialize(workspace);
      return workspaceService;
    } catch (error) {
      onUnexpectedError(error);
      return workspaceService;
    }
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
  const workbench2 = new DesktopMain(configuration2);
  return workbench2.open();
}
export { main, DesktopMain };
