// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/code/node/cliProcessMain.ts
import { Disposable } from "./module-0011.mjs";
import { ConsoleLogger, ILogService, ILoggerService, getLogLevel } from "./module-0049.mjs";
import { IFileService } from "./module-0044.mjs";
import { INativeEnvironmentService } from "./module-0056.mjs";
import { IUserDataProfilesService } from "./module-0080.mjs";
import { raceTimeout } from "./module-0028.mjs";
import { ServiceCollection } from "./module-0129.mjs";
import { product_default } from "./module-0041.mjs";
import { IProductService } from "./module-0074.mjs";
import { NativeEnvironmentService } from "./module-0057.mjs";
import { Schemas } from "./module-0025.mjs";
import { LoggerService } from "./module-0159.mjs";
import { localize } from "./module-0013.mjs";
import { LogService } from "./module-0157.mjs";
import { FileService } from "./module-0112.mjs";
import { DiskFileSystemProvider } from "./module-0113.mjs";
import { UriIdentityService } from "./module-0150.mjs";
import { IUriIdentityService } from "./module-0079.mjs";
import { StateReadonlyService } from "./module-0143.mjs";
import { UserDataProfilesReadonlyService } from "./module-0152.mjs";
import { FileUserDataProvider } from "./module-0160.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { NativePolicyService } from "./module-0134.mjs";
import { FilePolicyService } from "./module-0133.mjs";
import { URI } from "./module-0024.mjs";
import { LINUX_SYSTEM_POLICY_FILE_PATH } from "./module-0064.mjs";
import { IPolicyService, NullPolicyService } from "./module-0050.mjs";
import { ConfigurationService } from "./module-0052.mjs";
import { IConfigurationService } from "./module-0031.mjs";
import { resolveDevDeviceId, resolveMachineId, resolveSqmId } from "./module-0155.mjs";
import { RequestService } from "./module-0135.mjs";
import { IRequestService } from "./module-0054.mjs";
import { IDownloadService } from "./module-0053.mjs";
import { SyncDescriptor } from "./module-0127.mjs";
import { DownloadService } from "./module-0055.mjs";
import { IExtensionsProfileScannerService } from "./module-0088.mjs";
import { ExtensionsProfileScannerService } from "./module-0156.mjs";
import { IExtensionsScannerService } from "./module-0091.mjs";
import { ExtensionsScannerService } from "./module-0110.mjs";
import { ExtensionSignatureVerificationService, IExtensionSignatureVerificationService } from "./module-0086.mjs";
import { IAllowedExtensionsService, IExtensionGalleryService } from "./module-0066.mjs";
import { AllowedExtensionsService } from "./module-0162.mjs";
import { ExtensionManagementService, INativeServerExtensionManagementService } from "./module-0092.mjs";
import { IExtensionGalleryManifestService } from "./module-0084.mjs";
import { ExtensionGalleryManifestService } from "./module-0165.mjs";
import { ExtensionGalleryServiceWithNoStorageService } from "./module-0085.mjs";
import { ILanguagePackService } from "./module-0131.mjs";
import { NativeLanguagePackService } from "./module-0132.mjs";
import { IAllowedMcpServersService, IMcpGalleryService, IMcpManagementService } from "./module-0163.mjs";
import { AllowedMcpServersService } from "./module-0173.mjs";
import { IMcpResourceScannerService, McpResourceScannerService } from "./module-0166.mjs";
import { IMcpGalleryManifestService } from "./module-0169.mjs";
import { McpGalleryManifestService } from "./module-0174.mjs";
import { McpGalleryService } from "./module-0170.mjs";
import { McpManagementService2 } from "./module-0168.mjs";
import { NullTelemetryService, getPiiPathsFromEnvironment, isInternalTelemetry, supportsTelemetry } from "./module-0070.mjs";
import { OneDataSystemAppender } from "./module-0147.mjs";
import { resolveCommonProperties } from "./module-0068.mjs";
import { ITelemetryService } from "./module-0069.mjs";
import { TelemetryService } from "./module-0144.mjs";
import { InstantiationService } from "./module-0130.mjs";
import { addUNCHostToAllowlist, getUNCHost } from "./module-0161.mjs";
import { isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from "./module-0003.mjs";
import { toErrorMessage } from "./module-0029.mjs";
import { ExtensionManagementCLI } from "./module-0087.mjs";
import { McpManagementCli } from "./module-0164.mjs";
import { buildTelemetryMessage } from "./module-0148.mjs";
import { isAbsolute, join } from "./module-0019.mjs";
import { cwd } from "./module-0015.mjs";


// src/vs/code/node/cliProcessMain.ts
import { setDefaultResultOrder } from "dns";

import * as fs5 from "fs";

import { hostname, release } from "os";


// src/vs/code/node/cliProcessMain.ts
var CliMain = class extends Disposable {
  constructor(argv) {
    super();
    this.argv = argv;
    this.registerListeners();
  }
  registerListeners() {
    process.once("exit", () => this.dispose());
  }
  async run() {
    const [instantiationService, appenders] = await this.initServices();
    return instantiationService.invokeFunction(async (accessor) => {
      const logService = accessor.get(ILogService);
      const fileService = accessor.get(IFileService);
      const environmentService = accessor.get(INativeEnvironmentService);
      const userDataProfilesService = accessor.get(IUserDataProfilesService);
      logService.info("CLI main", this.argv);
      this.registerErrorHandler(logService);
      setDefaultResultOrder("ipv4first");
      await this.doRun(environmentService, fileService, userDataProfilesService, instantiationService);
      await Promise.all(appenders.map((a) => {
        raceTimeout(a.flush(), 1e3);
      }));
      return;
    });
  }
  async initServices() {
    const services = new ServiceCollection();
    const productService = { _serviceBrand: void 0, ...product_default };
    services.set(IProductService, productService);
    const environmentService = new NativeEnvironmentService(this.argv, productService);
    services.set(INativeEnvironmentService, environmentService);
    await Promise.all([
      this.allowWindowsUNCPath(environmentService.appSettingsHome.with({ scheme: Schemas.file }).fsPath),
      this.allowWindowsUNCPath(environmentService.extensionsPath)
    ].map((path) => path ? fs5.promises.mkdir(path, { recursive: true }) : void 0));
    const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
    services.set(ILoggerService, loggerService);
    const logger = this._register(loggerService.createLogger("cli", { name: localize(174, null) }));
    const otherLoggers = [];
    if (loggerService.getLogLevel() === 1 /* Trace */) {
      otherLoggers.push(new ConsoleLogger(loggerService.getLogLevel()));
    }
    const logService = this._register(new LogService(logger, otherLoggers));
    services.set(ILogService, logService);
    const fileService = this._register(new FileService(logService));
    services.set(IFileService, fileService);
    const diskFileSystemProvider = this._register(new DiskFileSystemProvider(logService));
    fileService.registerProvider(Schemas.file, diskFileSystemProvider);
    const uriIdentityService = new UriIdentityService(fileService);
    services.set(IUriIdentityService, uriIdentityService);
    const stateService = new StateReadonlyService(1 /* DELAYED */, environmentService, logService, fileService);
    const userDataProfilesService = new UserDataProfilesReadonlyService(stateService, uriIdentityService, environmentService, fileService, logService);
    services.set(IUserDataProfilesService, userDataProfilesService);
    fileService.registerProvider(Schemas.vscodeUserData, new FileUserDataProvider(Schemas.file, diskFileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
    let policyService;
    if (isWindows && productService.win32RegValueName) {
      policyService = this._register(new NativePolicyService(logService, productService.win32RegValueName));
    } else if (isMacintosh && productService.darwinBundleIdentifier) {
      policyService = this._register(new NativePolicyService(logService, productService.darwinBundleIdentifier));
    } else if (isLinux) {
      policyService = this._register(new FilePolicyService(URI.file(LINUX_SYSTEM_POLICY_FILE_PATH), fileService, logService));
    } else if (environmentService.policyFile) {
      policyService = this._register(new FilePolicyService(environmentService.policyFile, fileService, logService));
    } else {
      policyService = new NullPolicyService();
    }
    services.set(IPolicyService, policyService);
    const configurationService = this._register(new ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
    services.set(IConfigurationService, configurationService);
    await Promise.all([
      stateService.init(),
      configurationService.initialize()
    ]);
    let machineId2 = void 0;
    try {
      machineId2 = await resolveMachineId(stateService, logService);
    } catch (error) {
      if (error.code !== "ENOENT") {
        logService.error(error);
      }
    }
    const sqmId = await resolveSqmId(stateService, logService);
    const devDeviceId = await resolveDevDeviceId(stateService, logService);
    userDataProfilesService.init();
    services.set(IUriIdentityService, new UriIdentityService(fileService));
    const requestService = new RequestService("local", configurationService, environmentService, logService);
    services.set(IRequestService, requestService);
    services.set(IDownloadService, new SyncDescriptor(DownloadService, void 0, true));
    services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService, void 0, true));
    services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService, void 0, true));
    services.set(IExtensionSignatureVerificationService, new SyncDescriptor(ExtensionSignatureVerificationService, void 0, true));
    services.set(IAllowedExtensionsService, new SyncDescriptor(AllowedExtensionsService, void 0, true));
    services.set(INativeServerExtensionManagementService, new SyncDescriptor(ExtensionManagementService, void 0, true));
    services.set(IExtensionGalleryManifestService, new SyncDescriptor(ExtensionGalleryManifestService));
    services.set(IExtensionGalleryService, new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService, void 0, true));
    services.set(ILanguagePackService, new SyncDescriptor(NativeLanguagePackService, void 0, false));
    services.set(IAllowedMcpServersService, new SyncDescriptor(AllowedMcpServersService, void 0, true));
    services.set(IMcpResourceScannerService, new SyncDescriptor(McpResourceScannerService, void 0, true));
    services.set(IMcpGalleryManifestService, new SyncDescriptor(McpGalleryManifestService, void 0, true));
    services.set(IMcpGalleryService, new SyncDescriptor(McpGalleryService, void 0, true));
    services.set(IMcpManagementService, new SyncDescriptor(McpManagementService2, void 0, true));
    const appenders = [];
    const isInternal = isInternalTelemetry(productService, configurationService);
    if (supportsTelemetry(productService, environmentService)) {
      if (productService.aiConfig?.ariaKey) {
        appenders.push(new OneDataSystemAppender(requestService, isInternal, "monacoworkbench", null, productService.aiConfig.ariaKey));
      }
      const config = {
        appenders,
        sendErrorTelemetry: false,
        commonProperties: resolveCommonProperties(release(), hostname(), process.arch, productService.commit, productService.version, machineId2, sqmId, devDeviceId, isInternal, productService.date),
        piiPaths: getPiiPathsFromEnvironment(environmentService)
      };
      services.set(ITelemetryService, new SyncDescriptor(TelemetryService, [config], false));
    } else {
      services.set(ITelemetryService, NullTelemetryService);
    }
    return [new InstantiationService(services), appenders];
  }
  allowWindowsUNCPath(path) {
    if (isWindows) {
      const host = getUNCHost(path);
      if (host) {
        addUNCHostToAllowlist(host);
      }
    }
    return path;
  }
  registerErrorHandler(logService) {
    setUnexpectedErrorHandler((error) => {
      const message = toErrorMessage(error, true);
      if (!message) {
        return;
      }
      logService.error(`[uncaught exception in CLI]: ${message}`);
    });
    process.on("uncaughtException", (err) => {
      if (!isSigPipeError(err)) {
        onUnexpectedError(err);
      }
    });
    process.on("unhandledRejection", (reason) => onUnexpectedError(reason));
  }
  async doRun(environmentService, fileService, userDataProfilesService, instantiationService) {
    let profile = void 0;
    if (environmentService.args.profile) {
      profile = userDataProfilesService.profiles.find((p) => p.name === environmentService.args.profile);
      if (!profile) {
        throw new Error(`Profile '${environmentService.args.profile}' not found.`);
      }
    }
    const profileLocation = (profile ?? userDataProfilesService.defaultProfile).extensionsResource;
    if (this.argv["list-extensions"]) {
      return instantiationService.createInstance(ExtensionManagementCLI, [], new ConsoleLogger(3 /* Info */, false)).listExtensions(!!this.argv["show-versions"], this.argv["category"], profileLocation);
    } else if (this.argv["install-extension"] || this.argv["install-builtin-extension"]) {
      const installOptions = { isMachineScoped: !!this.argv["do-not-sync"], installPreReleaseVersion: !!this.argv["pre-release"], donotIncludePackAndDependencies: !!this.argv["do-not-include-pack-dependencies"], profileLocation };
      return instantiationService.createInstance(ExtensionManagementCLI, [], new ConsoleLogger(3 /* Info */, false)).installExtensions(this.asExtensionIdOrVSIX(this.argv["install-extension"] || []), this.asExtensionIdOrVSIX(this.argv["install-builtin-extension"] || []), installOptions, !!this.argv["force"]);
    } else if (this.argv["uninstall-extension"]) {
      return instantiationService.createInstance(ExtensionManagementCLI, [], new ConsoleLogger(3 /* Info */, false)).uninstallExtensions(this.asExtensionIdOrVSIX(this.argv["uninstall-extension"]), !!this.argv["force"], profileLocation);
    } else if (this.argv["update-extensions"]) {
      return instantiationService.createInstance(ExtensionManagementCLI, [], new ConsoleLogger(3 /* Info */, false)).updateExtensions(profileLocation);
    } else if (this.argv["locate-extension"]) {
      return instantiationService.createInstance(ExtensionManagementCLI, [], new ConsoleLogger(3 /* Info */, false)).locateExtension(this.argv["locate-extension"]);
    } else if (this.argv["add-mcp"]) {
      return instantiationService.createInstance(McpManagementCli, new ConsoleLogger(3 /* Info */, false)).addMcpDefinitions(this.argv["add-mcp"]);
    } else if (this.argv["telemetry"]) {
      console.log(await buildTelemetryMessage(environmentService.appRoot, environmentService.extensionsPath));
    }
  }
  asExtensionIdOrVSIX(inputs) {
    return inputs.map((input) => /\.vsix$/i.test(input) ? URI.file(isAbsolute(input) ? input : join(cwd(), input)) : input);
  }
};

async function main(argv) {
  const cliMain = new CliMain(argv);
  try {
    await cliMain.run();
  } finally {
    cliMain.dispose();
  }
}
export { main, setDefaultResultOrder, fs5, hostname, release, CliMain };
