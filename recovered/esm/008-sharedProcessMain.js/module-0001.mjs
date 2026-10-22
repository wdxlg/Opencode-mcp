// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts
import { Disposable, combinedDisposable, toDisposable } from "./module-0013.mjs";
import { Server, once } from "./module-0036.mjs";
import { Emitter } from "./module-0018.mjs";
import { SharedProcessLifecycle, SharedProcessRawConnection } from "./module-0269.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncResourceProviderService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, IUserDataSyncUtilService, registerConfiguration } from "./module-0157.mjs";
import { ConsoleLogger, ILogService, ILoggerService, isDevConsoleLogForwardingEnabled, registerDevConsoleLogForwarder } from "./module-0044.mjs";
import { ICustomEndpointTelemetryService, ITelemetryService } from "./module-0085.mjs";
import { CodeCacheCleaner } from "./module-0037.mjs";
import { LanguagePackCachedDataCleaner } from "./module-0046.mjs";
import { UnusedWorkspaceStorageDataCleaner } from "./module-0068.mjs";
import { LogsDataCleaner } from "./module-0061.mjs";
import { LocalizationsUpdater } from "./module-0060.mjs";
import { ExtensionsContributions } from "./module-0251.mjs";
import { UserDataProfilesCleaner } from "./module-0248.mjs";
import { DefaultExtensionsInitializer } from "./module-0276.mjs";
import { ServiceCollection } from "./module-0147.mjs";
import { product_default } from "./module-0053.mjs";
import { IProductService } from "./module-0045.mjs";
import { ProxyChannel, StaticRouter } from "./module-0034.mjs";
import { IMainProcessService, MainProcessService } from "./module-0067.mjs";
import { PolicyChannelClient } from "./module-0243.mjs";
import { IPolicyService, NullPolicyService } from "./module-0076.mjs";
import { NativeEnvironmentService } from "./module-0266.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { LoggerChannelClient } from "./module-0150.mjs";
import { URI } from "./module-0024.mjs";
import { localize } from "./module-0007.mjs";
import { LogService } from "./module-0252.mjs";
import { ISharedProcessLifecycleService, SharedProcessLifecycleService } from "./module-0253.mjs";
import { FileService } from "./module-0131.mjs";
import { IFileService } from "./module-0057.mjs";
import { DiskFileSystemProvider } from "./module-0132.mjs";
import { Schemas } from "./module-0025.mjs";
import { UriIdentityService } from "./module-0205.mjs";
import { IUriIdentityService } from "./module-0094.mjs";
import { UserDataProfilesService2 } from "./module-0244.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";
import { FileUserDataProvider } from "./module-0206.mjs";
import { DiskFileSystemProviderClient, LOCAL_FILE_SYSTEM_CHANNEL_NAME } from "./module-0207.mjs";
import { isLinux } from "./module-0014.mjs";
import { ConfigurationService } from "./module-0078.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { RemoteStorageService } from "./module-0263.mjs";
import { IStorageService } from "./module-0096.mjs";
import { RequestService2 } from "./module-0273.mjs";
import { IRequestService } from "./module-0087.mjs";
import { IChecksumService } from "./module-0069.mjs";
import { SyncDescriptor } from "./module-0145.mjs";
import { ChecksumService } from "./module-0070.mjs";
import { IV8InspectProfilingService } from "./module-0210.mjs";
import { InspectProfilingService } from "./module-0209.mjs";
import { NativeHostService } from "./module-0257.mjs";
import { INativeHostService } from "./module-0066.mjs";
import { METERED_CONNECTION_CHANNEL, MeteredConnectionChannelClient } from "./module-0293.mjs";
import { IMeteredConnectionService } from "./module-0258.mjs";
import { IDownloadService } from "./module-0086.mjs";
import { DownloadService } from "./module-0088.mjs";
import { ActiveWindowManager } from "./module-0190.mjs";
import { IExtensionRecommendationNotificationService } from "./module-0129.mjs";
import { ExtensionRecommendationNotificationServiceChannelClient } from "./module-0256.mjs";
import { NullAppender, NullTelemetryService, getPiiPathsFromEnvironment, isInternalTelemetry, isLoggingOnly, supportsTelemetry } from "./module-0090.mjs";
import { TelemetryLogAppender } from "./module-0152.mjs";
import { OneDataSystemAppender } from "./module-0247.mjs";
import { TelemetryService } from "./module-0153.mjs";
import { resolveCommonProperties } from "./module-0089.mjs";
import { TelemetryAppenderChannel } from "./module-0151.mjs";
import { CustomEndpointTelemetryService } from "./module-0154.mjs";
import { IExtensionsProfileScannerService } from "./module-0120.mjs";
import { ExtensionsProfileScannerService } from "./module-0255.mjs";
import { IExtensionsScannerService } from "./module-0123.mjs";
import { ExtensionsScannerService } from "./module-0211.mjs";
import { ExtensionSignatureVerificationService, IExtensionSignatureVerificationService } from "./module-0106.mjs";
import { IAllowedExtensionsService, IExtensionGalleryService, IExtensionManagementService, IExtensionTipsService, IGlobalExtensionEnablementService } from "./module-0058.mjs";
import { AllowedExtensionsService } from "./module-0277.mjs";
import { ExtensionManagementService, INativeServerExtensionManagementService } from "./module-0118.mjs";
import { IAllowedMcpServersService, IMcpGalleryService, IMcpManagementService } from "./module-0282.mjs";
import { AllowedMcpServersService } from "./module-0291.mjs";
import { IMcpGalleryManifestService } from "./module-0286.mjs";
import { McpGalleryManifestIPCService } from "./module-0292.mjs";
import { McpGalleryService } from "./module-0287.mjs";
import { IMcpResourceScannerService, McpResourceScannerService } from "./module-0283.mjs";
import { McpManagementService2 } from "./module-0285.mjs";
import { IExtensionGalleryManifestService } from "./module-0104.mjs";
import { ExtensionGalleryManifestIPCService } from "./module-0279.mjs";
import { ExtensionGalleryService } from "./module-0105.mjs";
import { ExtensionTipsService2 } from "./module-0262.mjs";
import { ILanguagePackService } from "./module-0059.mjs";
import { NativeLanguagePackService } from "./module-0149.mjs";
import { IDiagnosticsService } from "./module-0079.mjs";
import { DiagnosticsService } from "./module-0080.mjs";
import { IUserDataSyncAccountService, UserDataSyncAccountService } from "./module-0158.mjs";
import { UserDataSyncLogService } from "./module-0164.mjs";
import { GlobalExtensionEnablementService } from "./module-0097.mjs";
import { IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService } from "./module-0156.mjs";
import { ExtensionStorageService, IExtensionStorageService } from "./module-0155.mjs";
import { UserDataSyncStoreManagementService, UserDataSyncStoreService } from "./module-0162.mjs";
import { IUserDataSyncMachinesService, UserDataSyncMachinesService } from "./module-0165.mjs";
import { UserDataSyncLocalStoreService } from "./module-0160.mjs";
import { UserDataSyncEnablementService } from "./module-0166.mjs";
import { UserDataSyncService } from "./module-0187.mjs";
import { IUserDataProfileStorageService } from "./module-0169.mjs";
import { SharedProcessUserDataProfileStorageService } from "./module-0189.mjs";
import { UserDataSyncResourceProviderService } from "./module-0249.mjs";
import { ISignService } from "./module-0191.mjs";
import { SignService } from "./module-0193.mjs";
import { IRemoteSocketFactoryService, RemoteSocketFactoryService } from "./module-0201.mjs";
import { nodeSocketFactory } from "./module-0264.mjs";
import { ISharedTunnelsService } from "./module-0194.mjs";
import { SharedTunnelsService } from "./module-0195.mjs";
import { ISharedProcessTunnelService, ipcSharedProcessTunnelChannelName } from "./module-0202.mjs";
import { SharedProcessTunnelService } from "./module-0203.mjs";
import { ITunnelProcessCoordinator, TunnelProcessCoordinator } from "./module-0241.mjs";
import { IRemoteTunnelService } from "./module-0237.mjs";
import { RemoteTunnelService } from "./module-0254.mjs";
import { ISharedWebContentExtractorService } from "./module-0280.mjs";
import { SharedWebContentExtractorService } from "./module-0281.mjs";
import { ILocalGitService } from "./module-0302.mjs";
import { LocalGitService } from "./module-0303.mjs";
import { ISSHRemoteAgentHostMainService, SSH_REMOTE_AGENT_HOST_CHANNEL } from "./module-0212.mjs";
import { SSHRemoteAgentHostMainService } from "./module-0213.mjs";
import { DEV_CONTAINER_AGENT_HOST_CHANNEL, IDevContainerAgentHostMainService } from "./module-0222.mjs";
import { DevContainerAgentHostMainService } from "./module-0223.mjs";
import { IWSLRemoteAgentHostMainService, WSL_REMOTE_AGENT_HOST_CHANNEL } from "./module-0231.mjs";
import { WSLRemoteAgentHostMainService } from "./module-0232.mjs";
import { ITunnelAgentHostHostingService, ITunnelAgentHostMainService, TUNNEL_AGENT_HOST_CHANNEL, TUNNEL_HOST_CHANNEL } from "./module-0234.mjs";
import { TunnelAgentHostMainService } from "./module-0236.mjs";
import { TunnelHostMainService } from "./module-0242.mjs";
import { InstantiationService } from "./module-0148.mjs";
import { ExtensionManagementChannel, ExtensionTipsChannel } from "./module-0117.mjs";
import { McpManagementChannel } from "./module-0288.mjs";
import { UserDataSyncAccountServiceChannel, UserDataSyncStoreManagementServiceChannel } from "./module-0163.mjs";
import { UserDataSyncServiceChannel } from "./module-0188.mjs";
import { IInstantiationService } from "./module-0042.mjs";
import { UserDataAutoSyncService2 } from "./module-0260.mjs";
import { AgentNetworkFilterService } from "./module-0301.mjs";
import { PlaywrightChannel } from "./module-0299.mjs";
import { onUnexpectedError, setUnexpectedErrorHandler } from "./module-0003.mjs";
import { toErrorMessage } from "./module-0008.mjs";
import { getOSReleaseInfo } from "./module-0270.mjs";
import { getCodeDisplayProtocol, getDisplayProtocol } from "./module-0272.mjs";
import { getDesktopEnvironment } from "./module-0271.mjs";


// src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts
import { hostname as hostname2, release as release3 } from "os";


// src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts
var SharedProcessMain = class extends Disposable {
  constructor(configuration) {
    super();
    this.configuration = configuration;
    this.server = this._register(new Server(this));
    this.lifecycleService = void 0;
    this.onDidWindowConnectRaw = this._register(new Emitter());
    this.registerListeners();
  }
  registerListeners() {
    let didExit = false;
    const onExit = () => {
      if (!didExit) {
        didExit = true;
        this.lifecycleService?.fireOnWillShutdown();
        this.dispose();
      }
    };
    process.once("exit", onExit);
    once(process.parentPort, SharedProcessLifecycle.exit, onExit);
  }
  async init() {
    const instantiationService = await this.initServices();
    registerConfiguration();
    instantiationService.invokeFunction((accessor) => {
      const logService = accessor.get(ILogService);
      const telemetryService = accessor.get(ITelemetryService);
      logService.trace("sharedProcess configuration", JSON.stringify(this.configuration));
      this.initChannels(accessor);
      this.registerErrorHandler(logService);
      this.reportClientOSInfo(telemetryService, logService);
    });
    this._register(combinedDisposable(
      instantiationService.createInstance(CodeCacheCleaner, this.configuration.codeCachePath),
      instantiationService.createInstance(LanguagePackCachedDataCleaner),
      instantiationService.createInstance(UnusedWorkspaceStorageDataCleaner),
      instantiationService.createInstance(LogsDataCleaner),
      instantiationService.createInstance(LocalizationsUpdater),
      instantiationService.createInstance(ExtensionsContributions),
      instantiationService.createInstance(UserDataProfilesCleaner),
      instantiationService.createInstance(DefaultExtensionsInitializer)
    ));
  }
  async initServices() {
    const services = new ServiceCollection();
    const productService = { _serviceBrand: void 0, ...product_default };
    services.set(IProductService, productService);
    const mainRouter = new StaticRouter((ctx) => ctx === "main");
    const mainProcessService = new MainProcessService(this.server, mainRouter);
    services.set(IMainProcessService, mainProcessService);
    const policyService = this.configuration.policiesData ? new PolicyChannelClient(this.configuration.policiesData, mainProcessService.getChannel("policy")) : new NullPolicyService();
    services.set(IPolicyService, policyService);
    const environmentService = new NativeEnvironmentService(this.configuration.args, productService);
    services.set(INativeEnvironmentService, environmentService);
    const loggerService = new LoggerChannelClient(void 0, this.configuration.logLevel, environmentService.logsHome, this.configuration.loggers.map((loggerResource) => ({ ...loggerResource, resource: URI.revive(loggerResource.resource) })), mainProcessService.getChannel("logger"));
    services.set(ILoggerService, loggerService);
    const sharedLogGroup = { id: "shared", name: localize(173, null) };
    const logger = this._register(loggerService.createLogger("sharedprocess", { name: localize(173, null), group: sharedLogGroup }));
    const consoleLogger = this._register(new ConsoleLogger(logger.getLevel()));
    const logService = this._register(new LogService(logger, [consoleLogger]));
    if (!environmentService.isBuilt && isDevConsoleLogForwardingEnabled) {
      this._register(registerDevConsoleLogForwarder(logService));
    }
    services.set(ILogService, logService);
    this.lifecycleService = this._register(new SharedProcessLifecycleService(logService));
    services.set(ISharedProcessLifecycleService, this.lifecycleService);
    const fileService = this._register(new FileService(logService));
    services.set(IFileService, fileService);
    const diskFileSystemProvider = this._register(new DiskFileSystemProvider(logService));
    fileService.registerProvider(Schemas.file, diskFileSystemProvider);
    const uriIdentityService = new UriIdentityService(fileService);
    services.set(IUriIdentityService, uriIdentityService);
    const userDataProfilesService = this._register(new UserDataProfilesService2(this.configuration.profiles.all, URI.revive(this.configuration.profiles.home).with({ scheme: environmentService.userRoamingDataHome.scheme }), mainProcessService.getChannel("userDataProfiles")));
    services.set(IUserDataProfilesService, userDataProfilesService);
    const userDataFileSystemProvider = this._register(new FileUserDataProvider(
      Schemas.file,
      // Specifically for user data, use the disk file system provider
      // from the main process to enable atomic read/write operations.
      // Since user data can change very frequently across multiple
      // processes, we want a single process handling these operations.
      this._register(new DiskFileSystemProviderClient(mainProcessService.getChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: isLinux })),
      Schemas.vscodeUserData,
      userDataProfilesService,
      uriIdentityService,
      logService
    ));
    fileService.registerProvider(Schemas.vscodeUserData, userDataFileSystemProvider);
    const configurationService = this._register(new ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
    services.set(IConfigurationService, configurationService);
    const storageService = new RemoteStorageService(void 0, { defaultProfile: userDataProfilesService.defaultProfile, currentProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
    services.set(IStorageService, storageService);
    this._register(toDisposable(() => storageService.flush()));
    await Promise.all([
      configurationService.initialize(),
      storageService.initialize()
    ]);
    const networkLogger = this._register(loggerService.createLogger(`network-shared`, { name: localize(172, null), group: sharedLogGroup }));
    const requestService = new RequestService2(configurationService, environmentService, this._register(new LogService(networkLogger)));
    services.set(IRequestService, requestService);
    services.set(IChecksumService, new SyncDescriptor(
      ChecksumService,
      void 0,
      false
      /* proxied to other processes */
    ));
    services.set(IV8InspectProfilingService, new SyncDescriptor(
      InspectProfilingService,
      void 0,
      false
      /* proxied to other processes */
    ));
    const nativeHostService = new NativeHostService(-1, mainProcessService);
    services.set(INativeHostService, nativeHostService);
    const meteredConnectionService = this._register(new MeteredConnectionChannelClient(mainProcessService.getChannel(METERED_CONNECTION_CHANNEL)));
    services.set(IMeteredConnectionService, meteredConnectionService);
    services.set(IDownloadService, new SyncDescriptor(DownloadService, void 0, true));
    const activeWindowManager = this._register(new ActiveWindowManager(nativeHostService));
    const activeWindowRouter = new StaticRouter((ctx) => activeWindowManager.getActiveClientId().then((id2) => ctx === id2));
    services.set(IExtensionRecommendationNotificationService, new ExtensionRecommendationNotificationServiceChannelClient(this.server.getChannel("extensionRecommendationNotification", activeWindowRouter)));
    let telemetryService;
    const appenders = [];
    const internalTelemetry = isInternalTelemetry(productService, configurationService);
    if (supportsTelemetry(productService, environmentService)) {
      const logAppender = new TelemetryLogAppender("", false, loggerService, environmentService, productService);
      appenders.push(logAppender);
      if (!isLoggingOnly(productService, environmentService) && productService.aiConfig?.ariaKey) {
        const collectorAppender = new OneDataSystemAppender(requestService, internalTelemetry, "monacoworkbench", null, productService.aiConfig.ariaKey);
        this._register(toDisposable(() => collectorAppender.flush()));
        appenders.push(collectorAppender);
      }
      telemetryService = new TelemetryService({
        appenders,
        commonProperties: resolveCommonProperties(release3(), hostname2(), process.arch, productService.commit, productService.version, this.configuration.machineId, this.configuration.sqmId, this.configuration.devDeviceId, internalTelemetry, productService.date),
        sendErrorTelemetry: true,
        piiPaths: getPiiPathsFromEnvironment(environmentService),
        meteredConnectionService
      }, configurationService, productService);
    } else {
      telemetryService = NullTelemetryService;
      const nullAppender = NullAppender;
      appenders.push(nullAppender);
    }
    this.server.registerChannel("telemetryAppender", new TelemetryAppenderChannel(appenders));
    services.set(ITelemetryService, telemetryService);
    const customEndpointTelemetryService = new CustomEndpointTelemetryService(configurationService, telemetryService, loggerService, environmentService, productService);
    services.set(ICustomEndpointTelemetryService, customEndpointTelemetryService);
    services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService, void 0, true));
    services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService, void 0, true));
    services.set(IExtensionSignatureVerificationService, new SyncDescriptor(ExtensionSignatureVerificationService, void 0, true));
    services.set(IAllowedExtensionsService, new SyncDescriptor(AllowedExtensionsService, void 0, true));
    services.set(INativeServerExtensionManagementService, new SyncDescriptor(ExtensionManagementService, void 0, true));
    services.set(IAllowedMcpServersService, new SyncDescriptor(AllowedMcpServersService, void 0, true));
    services.set(IMcpGalleryManifestService, new McpGalleryManifestIPCService(this.server));
    services.set(IMcpGalleryService, new SyncDescriptor(McpGalleryService, void 0, true));
    services.set(IMcpResourceScannerService, new SyncDescriptor(McpResourceScannerService, void 0, true));
    services.set(IMcpManagementService, new SyncDescriptor(McpManagementService2, void 0, true));
    services.set(IExtensionGalleryManifestService, new ExtensionGalleryManifestIPCService(this.server, logService, productService));
    services.set(IExtensionGalleryService, new SyncDescriptor(ExtensionGalleryService, void 0, true));
    services.set(IExtensionTipsService, new SyncDescriptor(
      ExtensionTipsService2,
      void 0,
      false
      /* Eagerly scans and computes exe based recommendations */
    ));
    services.set(ILanguagePackService, new SyncDescriptor(
      NativeLanguagePackService,
      void 0,
      false
      /* proxied to other processes */
    ));
    services.set(IDiagnosticsService, new SyncDescriptor(
      DiagnosticsService,
      void 0,
      false
      /* proxied to other processes */
    ));
    services.set(IUserDataSyncAccountService, new SyncDescriptor(UserDataSyncAccountService, void 0, true));
    services.set(IUserDataSyncLogService, new SyncDescriptor(UserDataSyncLogService, void 0, true));
    services.set(IUserDataSyncUtilService, ProxyChannel.toService(this.server.getChannel("userDataSyncUtil", (client) => client.ctx !== "main")));
    services.set(IGlobalExtensionEnablementService, new SyncDescriptor(
      GlobalExtensionEnablementService,
      void 0,
      false
      /* Eagerly resets installed extensions */
    ));
    services.set(IIgnoredExtensionsManagementService, new SyncDescriptor(IgnoredExtensionsManagementService, void 0, true));
    services.set(IExtensionStorageService, new SyncDescriptor(ExtensionStorageService));
    services.set(IUserDataSyncStoreManagementService, new SyncDescriptor(UserDataSyncStoreManagementService, void 0, true));
    services.set(IUserDataSyncStoreService, new SyncDescriptor(UserDataSyncStoreService, void 0, true));
    services.set(IUserDataSyncMachinesService, new SyncDescriptor(UserDataSyncMachinesService, void 0, true));
    services.set(IUserDataSyncLocalStoreService, new SyncDescriptor(
      UserDataSyncLocalStoreService,
      void 0,
      false
      /* Eagerly cleans up old backups */
    ));
    services.set(IUserDataSyncEnablementService, new SyncDescriptor(UserDataSyncEnablementService, void 0, true));
    services.set(IUserDataSyncService, new SyncDescriptor(
      UserDataSyncService,
      void 0,
      false
      /* Initializes the Sync State */
    ));
    services.set(IUserDataProfileStorageService, new SyncDescriptor(SharedProcessUserDataProfileStorageService, void 0, true));
    services.set(IUserDataSyncResourceProviderService, new SyncDescriptor(UserDataSyncResourceProviderService, void 0, true));
    services.set(ISignService, new SyncDescriptor(
      SignService,
      void 0,
      false
      /* proxied to other processes */
    ));
    const remoteSocketFactoryService = new RemoteSocketFactoryService();
    services.set(IRemoteSocketFactoryService, remoteSocketFactoryService);
    remoteSocketFactoryService.register(0 /* WebSocket */, nodeSocketFactory);
    services.set(ISharedTunnelsService, new SyncDescriptor(SharedTunnelsService));
    services.set(ISharedProcessTunnelService, new SyncDescriptor(SharedProcessTunnelService));
    services.set(ITunnelProcessCoordinator, new SyncDescriptor(TunnelProcessCoordinator, [void 0], true));
    services.set(IRemoteTunnelService, new SyncDescriptor(RemoteTunnelService));
    services.set(ISharedWebContentExtractorService, new SyncDescriptor(SharedWebContentExtractorService));
    services.set(ILocalGitService, new SyncDescriptor(
      LocalGitService,
      void 0,
      false
      /* proxied to other processes */
    ));
    services.set(ISSHRemoteAgentHostMainService, new SyncDescriptor(SSHRemoteAgentHostMainService, void 0, true));
    services.set(IDevContainerAgentHostMainService, new SyncDescriptor(DevContainerAgentHostMainService, void 0, true));
    services.set(IWSLRemoteAgentHostMainService, new SyncDescriptor(WSLRemoteAgentHostMainService, void 0, true));
    services.set(ITunnelAgentHostMainService, new SyncDescriptor(TunnelAgentHostMainService, void 0, true));
    services.set(ITunnelAgentHostHostingService, new SyncDescriptor(TunnelHostMainService, void 0, true));
    return new InstantiationService(services);
  }
  initChannels(accessor) {
    const channel = new ExtensionManagementChannel(accessor.get(IExtensionManagementService), () => null);
    this.server.registerChannel("extensions", channel);
    const mcpManagementChannel = new McpManagementChannel(accessor.get(IMcpManagementService), () => null);
    this.server.registerChannel("mcpManagement", mcpManagementChannel);
    const languagePacksChannel = ProxyChannel.fromService(accessor.get(ILanguagePackService), this._store);
    this.server.registerChannel("languagePacks", languagePacksChannel);
    const diagnosticsChannel = ProxyChannel.fromService(accessor.get(IDiagnosticsService), this._store);
    this.server.registerChannel("diagnostics", diagnosticsChannel);
    const extensionTipsChannel = new ExtensionTipsChannel(accessor.get(IExtensionTipsService));
    this.server.registerChannel("extensionTipsService", extensionTipsChannel);
    const checksumChannel = ProxyChannel.fromService(accessor.get(IChecksumService), this._store);
    this.server.registerChannel("checksum", checksumChannel);
    const profilingChannel = ProxyChannel.fromService(accessor.get(IV8InspectProfilingService), this._store);
    this.server.registerChannel("v8InspectProfiling", profilingChannel);
    const userDataSyncMachineChannel = ProxyChannel.fromService(accessor.get(IUserDataSyncMachinesService), this._store);
    this.server.registerChannel("userDataSyncMachines", userDataSyncMachineChannel);
    const customEndpointTelemetryChannel = ProxyChannel.fromService(accessor.get(ICustomEndpointTelemetryService), this._store);
    this.server.registerChannel("customEndpointTelemetry", customEndpointTelemetryChannel);
    const userDataSyncAccountChannel = new UserDataSyncAccountServiceChannel(accessor.get(IUserDataSyncAccountService));
    this.server.registerChannel("userDataSyncAccount", userDataSyncAccountChannel);
    const userDataSyncStoreManagementChannel = new UserDataSyncStoreManagementServiceChannel(accessor.get(IUserDataSyncStoreManagementService));
    this.server.registerChannel("userDataSyncStoreManagement", userDataSyncStoreManagementChannel);
    const userDataSyncChannel = new UserDataSyncServiceChannel(accessor.get(IUserDataSyncService), accessor.get(IUserDataProfilesService), accessor.get(ILogService));
    this.server.registerChannel("userDataSync", userDataSyncChannel);
    const userDataAutoSync = this._register(accessor.get(IInstantiationService).createInstance(UserDataAutoSyncService2));
    this.server.registerChannel("userDataAutoSync", ProxyChannel.fromService(userDataAutoSync, this._store));
    this.server.registerChannel("IUserDataSyncResourceProviderService", ProxyChannel.fromService(accessor.get(IUserDataSyncResourceProviderService), this._store));
    const sharedProcessTunnelChannel = ProxyChannel.fromService(accessor.get(ISharedProcessTunnelService), this._store);
    this.server.registerChannel(ipcSharedProcessTunnelChannelName, sharedProcessTunnelChannel);
    const remoteTunnelChannel = ProxyChannel.fromService(accessor.get(IRemoteTunnelService), this._store);
    this.server.registerChannel("remoteTunnel", remoteTunnelChannel);
    const webContentExtractorChannel = ProxyChannel.fromService(accessor.get(ISharedWebContentExtractorService), this._store);
    this.server.registerChannel("sharedWebContentExtractor", webContentExtractorChannel);
    const agentNetworkFilterService = this._register(new AgentNetworkFilterService(accessor.get(IConfigurationService)));
    const playwrightChannel = this._register(new PlaywrightChannel(this.server, accessor.get(IMainProcessService), accessor.get(ILogService), agentNetworkFilterService, accessor.get(ITelemetryService)));
    this.server.registerChannel("playwright", playwrightChannel);
    const localGitChannel = ProxyChannel.fromService(accessor.get(ILocalGitService), this._store);
    this.server.registerChannel("localGit", localGitChannel);
    const sshRemoteAgentHostChannel = ProxyChannel.fromService(accessor.get(ISSHRemoteAgentHostMainService), this._store);
    this.server.registerChannel(SSH_REMOTE_AGENT_HOST_CHANNEL, sshRemoteAgentHostChannel);
    const devContainerAgentHostChannel = ProxyChannel.fromService(accessor.get(IDevContainerAgentHostMainService), this._store);
    this.server.registerChannel(DEV_CONTAINER_AGENT_HOST_CHANNEL, devContainerAgentHostChannel);
    const wslRemoteAgentHostChannel = ProxyChannel.fromService(accessor.get(IWSLRemoteAgentHostMainService), this._store);
    this.server.registerChannel(WSL_REMOTE_AGENT_HOST_CHANNEL, wslRemoteAgentHostChannel);
    const tunnelAgentHostChannel = ProxyChannel.fromService(accessor.get(ITunnelAgentHostMainService), this._store);
    this.server.registerChannel(TUNNEL_AGENT_HOST_CHANNEL, tunnelAgentHostChannel);
    const tunnelHostChannel = ProxyChannel.fromService(accessor.get(ITunnelAgentHostHostingService), this._store);
    this.server.registerChannel(TUNNEL_HOST_CHANNEL, tunnelHostChannel);
  }
  registerErrorHandler(logService) {
    process.on("uncaughtException", (error) => onUnexpectedError(error));
    process.on("unhandledRejection", (reason) => onUnexpectedError(reason));
    setUnexpectedErrorHandler((error) => {
      const message = toErrorMessage(error, true);
      if (!message) {
        return;
      }
      logService.error(`[uncaught exception in sharedProcess]: ${message}`);
    });
  }
  async reportClientOSInfo(telemetryService, logService) {
    if (isLinux) {
      const [releaseInfo, displayProtocol] = await Promise.all([
        getOSReleaseInfo(logService.error.bind(logService)),
        getDisplayProtocol(logService.error.bind(logService))
      ]);
      const desktopEnvironment = getDesktopEnvironment();
      const codeSessionType = getCodeDisplayProtocol(displayProtocol, this.configuration.args["ozone-platform"]);
      if (releaseInfo) {
        telemetryService.publicLog2("clientPlatformInfo", {
          platformId: releaseInfo.id,
          platformVersionId: releaseInfo.version_id,
          platformIdLike: releaseInfo.id_like,
          desktopEnvironment,
          displayProtocol,
          codeDisplayProtocol: codeSessionType
        });
      }
    }
  }
  handledClientConnection(e) {
    if (e.data !== SharedProcessRawConnection.response) {
      return false;
    }
    const port = e.ports.at(0);
    if (port) {
      this.onDidWindowConnectRaw.fire(port);
      return true;
    }
    return false;
  }
};

async function main(configuration) {
  try {
    const sharedProcess = new SharedProcessMain(configuration);
    process.parentPort.postMessage(SharedProcessLifecycle.ipcReady);
    await sharedProcess.init();
    process.parentPort.postMessage(SharedProcessLifecycle.initDone);
  } catch (error) {
    process.parentPort.postMessage({ error: error.toString() });
  }
}

var handle = setTimeout(() => {
  process.parentPort.postMessage({ warning: "[SharedProcess] did not receive configuration within 30s..." });
}, 3e4);

process.parentPort.once("message", (e) => {
  clearTimeout(handle);
  main(e.data);
});
export { main, hostname2, release3, SharedProcessMain, handle };
