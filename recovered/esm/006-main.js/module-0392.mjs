// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/code/electron-main/main.ts
import { __esm } from "./module-0000.mjs";
import { init_update_config_contribution } from "./module-0046.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { coalesce, distinct, init_arrays } from "./module-0013.mjs";
import { Promises, init_async, retry } from "./module-0034.mjs";
import { init_errorMessage, toErrorMessage } from "./module-0047.mjs";
import { ExpectedError, init_errors, setUnexpectedErrorHandler } from "./module-0010.mjs";
import { init_extpath, isValidBasename, parseLineAndColumnAware, sanitizeFilePath } from "./module-0028.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { getPathLabel, init_labels } from "./module-0048.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { basename, init_path, join4, resolve2 } from "./module-0008.mjs";
import { init_performance, mark } from "./module-0001.mjs";
import { OS, init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { cwd2, init_process } from "./module-0007.mjs";
import { init_strings, rtrim, trim } from "./module-0027.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { ProxyChannel, init_ipc } from "./module-0054.mjs";
import { XDG_RUNTIME_DIR, connect, init_ipc_net2, serve } from "./module-0058.mjs";
import { CodeApplication, init_app } from "./module-0360.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { ConfigurationService, init_configurationService } from "./module-0363.mjs";
import { DiagnosticsService, init_diagnosticsService } from "./module-0364.mjs";
import { EnvironmentMainService, IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { addArg, init_argvHelper, parseMainProcessArgv } from "./module-0163.mjs";
import { createWaitMarkerFileSync, init_wait } from "./module-0365.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { FileService, init_fileService } from "./module-0366.mjs";
import { DiskFileSystemProvider, init_diskFileSystemProvider2 } from "./module-0189.mjs";
import { SyncDescriptor, init_descriptors } from "./module-0193.mjs";
import { InstantiationService, init_instantiationService } from "./module-0368.mjs";
import { ServiceCollection, init_serviceCollection } from "./module-0194.mjs";
import { ILifecycleMainService, LifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { BufferLogger, init_bufferLog } from "./module-0369.mjs";
import { ConsoleMainLogger, ILogService, ILoggerService, getLogLevel, init_log, isDevConsoleLogForwardingEnabled, registerDevConsoleLogForwarder } from "./module-0075.mjs";
import { init_product, product_default } from "./module-0044.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IProtocolMainService, init_protocol } from "./module-0238.mjs";
import { ProtocolMainService, init_protocolMainService } from "./module-0370.mjs";
import { ITunnelService, init_tunnel } from "./module-0371.mjs";
import { TunnelService, init_tunnelService } from "./module-0375.mjs";
import { IRequestService, init_request } from "./module-0155.mjs";
import { RequestService2, init_requestService2 } from "./module-0378.mjs";
import { ISignService, init_sign } from "./module-0218.mjs";
import { SignService, init_signService } from "./module-0380.mjs";
import { IStateReadService, IStateService, init_state } from "./module-0095.mjs";
import { NullTelemetryService, init_telemetryUtils } from "./module-0215.mjs";
import { IThemeMainService, init_themeMainService } from "./module-0100.mjs";
import { IUserDataProfilesMainService, UserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { init_win32UpdateType, isInnoSetupInstall } from "./module-0230.mjs";
import { IPolicyService, NullPolicyService, init_policy2 } from "./module-0210.mjs";
import { NativePolicyService, init_nativePolicyService } from "./module-0381.mjs";
import { FilePolicyService, init_filePolicyService } from "./module-0382.mjs";
import { MultiplexPolicyService, init_multiplexPolicyService } from "./module-0383.mjs";
import { GITHUB_COPILOT_MACOS_BUNDLE_ID, GITHUB_COPILOT_WIN32_POLICY_NAME, GITHUB_COPILOT_WIN32_REGISTRY_PATH, IFileManagedSettingsService, INativeManagedSettingsService, MANAGED_SETTINGS_FILE_NAME, MANAGED_SETTINGS_LINUX_FILE_PATH, MANAGED_SETTINGS_MACOS_FILE_PATH, MANAGED_SETTINGS_WINDOWS_DIR, NullFileManagedSettingsService, NullNativeManagedSettingsService, init_copilotManagedSettings } from "./module-0250.mjs";
import { FileManagedSettingsService, init_fileManagedSettingsService } from "./module-0384.mjs";
import { NativeManagedSettingsService, init_nativeManagedSettingsService } from "./module-0385.mjs";
import { DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { IUriIdentityService, init_uriIdentity } from "./module-0077.mjs";
import { UriIdentityService, init_uriIdentityService } from "./module-0387.mjs";
import { ILoggerMainService, LoggerMainService, init_loggerService2 } from "./module-0213.mjs";
import { LogService, init_logService } from "./module-0388.mjs";
import { init_dialogMainUtils, massageMessageBoxOptions } from "./module-0122.mjs";
import { StateService, init_stateService } from "./module-0106.mjs";
import { FileUserDataProvider, init_fileUserDataProvider } from "./module-0389.mjs";
import { addUNCHostToAllowlist, getUNCHost, init_unc } from "./module-0037.mjs";
import { ThemeMainService, init_themeMainServiceImpl } from "./module-0391.mjs";
import { LINUX_SYSTEM_POLICY_FILE_PATH, init_policy } from "./module-0038.mjs";


// src/vs/code/electron-main/main.ts
var main_exports = {};

import { app as app14, dialog } from "electron";

import { unlinkSync as unlinkSync2, promises as promises16 } from "fs";

var CodeMain, code;

var init_main = __esm({
  "src/vs/code/electron-main/main.ts"() {
    init_update_config_contribution();
    init_uri();
    init_arrays();
    init_async();
    init_errorMessage();
    init_errors();
    init_extpath();
    init_event();
    init_labels();
    init_network();
    init_path();
    init_performance();
    init_platform();
    init_process();
    init_strings();
    init_pfs();
    init_ipc();
    init_ipc_net2();
    init_app();
    init_nls();
    init_configuration();
    init_configurationService();
    init_diagnosticsService();
    init_environmentMainService();
    init_argvHelper();
    init_wait();
    init_files();
    init_fileService();
    init_diskFileSystemProvider2();
    init_descriptors();
    init_instantiationService();
    init_serviceCollection();
    init_lifecycleMainService();
    init_bufferLog();
    init_log();
    init_product();
    init_productService();
    init_protocol();
    init_protocolMainService();
    init_tunnel();
    init_tunnelService();
    init_request();
    init_requestService2();
    init_sign();
    init_signService();
    init_state();
    init_telemetryUtils();
    init_themeMainService();
    init_userDataProfile3();
    init_win32UpdateType();
    init_policy2();
    init_nativePolicyService();
    init_filePolicyService();
    init_multiplexPolicyService();
    init_copilotManagedSettings();
    init_fileManagedSettingsService();
    init_nativeManagedSettingsService();
    init_lifecycle();
    init_uriIdentity();
    init_uriIdentityService();
    init_loggerService2();
    init_logService();
    init_dialogMainUtils();
    init_stateService();
    init_fileUserDataProvider();
    init_unc();
    init_themeMainServiceImpl();
    init_policy();
    CodeMain = class {
      main() {
        try {
          this.startup();
        } catch (error) {
          console.error(error.message);
          app14.exit(1);
        }
      }
      async startup() {
        setUnexpectedErrorHandler((err) => console.error(err));
        const [instantiationService, instanceEnvironment, environmentMainService, configurationService, stateMainService, bufferLogger, productService, userDataProfilesMainService] = this.createServices();
        try {
          try {
            await this.initServices(environmentMainService, userDataProfilesMainService, configurationService, stateMainService, productService);
          } catch (error) {
            this.handleStartupDataDirError(environmentMainService, productService, error);
            throw error;
          }
          await instantiationService.invokeFunction(async (accessor) => {
            const logService = accessor.get(ILogService);
            const lifecycleMainService = accessor.get(ILifecycleMainService);
            const fileService = accessor.get(IFileService);
            const loggerService = accessor.get(ILoggerService);
            const mainProcessNodeIpcServer = await this.claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, true);
            Promises2.writeFile(environmentMainService.mainLockfile, String(process.pid)).catch((err) => {
              logService.warn(`app#startup(): Error writing main lockfile: ${err.stack}`);
            });
            bufferLogger.logger = loggerService.createLogger("main", { name: localize(164, null) });
            Event.once(lifecycleMainService.onWillShutdown)((evt) => {
              fileService.dispose();
              configurationService.dispose();
              evt.join("instanceLockfile", promises16.unlink(environmentMainService.mainLockfile).catch(() => {
              }));
            });
            const innoSetupActive = await this.checkInnoSetupMutex(productService, logService);
            if (innoSetupActive) {
              const message = `${productService.nameShort} is currently being updated. Please wait for the update to complete before launching.`;
              instantiationService.invokeFunction(this.quit, new Error(message));
              return;
            }
            return instantiationService.createInstance(CodeApplication, mainProcessNodeIpcServer, instanceEnvironment).startup();
          });
        } catch (error) {
          instantiationService.invokeFunction(this.quit, error);
        }
      }
      createServices() {
        const services = new ServiceCollection();
        const disposables = new DisposableStore();
        process.once("exit", () => disposables.dispose());
        const productService = { _serviceBrand: void 0, ...product_default };
        services.set(IProductService, productService);
        const environmentMainService = new EnvironmentMainService(this.resolveArgs(), productService);
        const instanceEnvironment = this.patchEnvironment(environmentMainService);
        services.set(IEnvironmentMainService, environmentMainService);
        const loggerService = new LoggerMainService(getLogLevel(environmentMainService), environmentMainService.logsHome);
        services.set(ILoggerMainService, loggerService);
        const bufferLogger = new BufferLogger(loggerService.getLogLevel());
        const logService = disposables.add(new LogService(bufferLogger, [new ConsoleMainLogger(loggerService.getLogLevel())]));
        if (!environmentMainService.isBuilt && isDevConsoleLogForwardingEnabled) {
          disposables.add(registerDevConsoleLogForwarder(logService));
        }
        services.set(ILogService, logService);
        const fileService = new FileService(logService);
        services.set(IFileService, fileService);
        const diskFileSystemProvider = new DiskFileSystemProvider(logService);
        fileService.registerProvider(Schemas.file, diskFileSystemProvider);
        const uriIdentityService = new UriIdentityService(fileService);
        services.set(IUriIdentityService, uriIdentityService);
        const stateService = new StateService(1 /* DELAYED */, environmentMainService, logService, fileService);
        services.set(IStateReadService, stateService);
        services.set(IStateService, stateService);
        const userDataProfilesMainService = new UserDataProfilesMainService(stateService, uriIdentityService, environmentMainService, fileService, logService, productService);
        services.set(IUserDataProfilesMainService, userDataProfilesMainService);
        fileService.registerProvider(Schemas.vscodeUserData, new FileUserDataProvider(Schemas.file, diskFileSystemProvider, Schemas.vscodeUserData, userDataProfilesMainService, uriIdentityService, logService));
        let policyService;
        const policyProductName = isWindows2 ? productService.parentPolicyConfig?.win32RegValueName ?? productService.win32RegValueName : productService.parentPolicyConfig?.darwinBundleIdentifier ?? productService.darwinBundleIdentifier;
        const policyServices = [];
        if (isWindows2 && policyProductName) {
          policyServices.push(disposables.add(new NativePolicyService(logService, policyProductName)));
        } else if (isMacintosh && policyProductName) {
          policyServices.push(disposables.add(new NativePolicyService(logService, policyProductName)));
        } else if (isLinux) {
          policyServices.push(disposables.add(new FilePolicyService(URI.file(LINUX_SYSTEM_POLICY_FILE_PATH), fileService, logService)));
        } else if (environmentMainService.policyFile) {
          policyServices.push(disposables.add(new FilePolicyService(environmentMainService.policyFile, fileService, logService)));
        }
        let nativeManagedSettingsService;
        if (isWindows2) {
          nativeManagedSettingsService = disposables.add(new NativeManagedSettingsService(logService, GITHUB_COPILOT_WIN32_POLICY_NAME, { registryPath: GITHUB_COPILOT_WIN32_REGISTRY_PATH }));
        } else if (isMacintosh) {
          nativeManagedSettingsService = disposables.add(new NativeManagedSettingsService(logService, GITHUB_COPILOT_MACOS_BUNDLE_ID));
        }
        if (nativeManagedSettingsService) {
          services.set(INativeManagedSettingsService, nativeManagedSettingsService);
        } else {
          services.set(INativeManagedSettingsService, new NullNativeManagedSettingsService());
        }
        let fileManagedSettingsPath;
        if (isWindows2) {
          const programFiles = process.env["ProgramFiles"];
          if (programFiles) {
            fileManagedSettingsPath = join4(programFiles, MANAGED_SETTINGS_WINDOWS_DIR, MANAGED_SETTINGS_FILE_NAME);
          }
        } else if (isMacintosh) {
          fileManagedSettingsPath = MANAGED_SETTINGS_MACOS_FILE_PATH;
        } else if (isLinux) {
          fileManagedSettingsPath = MANAGED_SETTINGS_LINUX_FILE_PATH;
        }
        if (fileManagedSettingsPath) {
          const fileManagedSettingsService = disposables.add(new FileManagedSettingsService(URI.file(fileManagedSettingsPath), fileService, logService));
          services.set(IFileManagedSettingsService, fileManagedSettingsService);
        } else {
          services.set(IFileManagedSettingsService, new NullFileManagedSettingsService());
        }
        if (policyServices.length > 1) {
          policyService = disposables.add(new MultiplexPolicyService(policyServices, logService));
        } else if (policyServices.length === 1) {
          policyService = policyServices[0];
        } else {
          policyService = new NullPolicyService();
        }
        services.set(IPolicyService, policyService);
        const configurationService = new ConfigurationService(userDataProfilesMainService.defaultProfile.settingsResource, fileService, policyService, logService);
        services.set(IConfigurationService, configurationService);
        services.set(ILifecycleMainService, new SyncDescriptor(LifecycleMainService, void 0, false));
        services.set(IRequestService, new SyncDescriptor(RequestService2, void 0, true));
        services.set(IThemeMainService, new SyncDescriptor(ThemeMainService));
        services.set(ISignService, new SyncDescriptor(
          SignService,
          void 0,
          false
          /* proxied to other processes */
        ));
        services.set(ITunnelService, new SyncDescriptor(TunnelService));
        services.set(IProtocolMainService, new ProtocolMainService(environmentMainService, userDataProfilesMainService, logService));
        return [new InstantiationService(services, true), instanceEnvironment, environmentMainService, configurationService, stateService, bufferLogger, productService, userDataProfilesMainService];
      }
      patchEnvironment(environmentMainService) {
        const instanceEnvironment = {
          VSCODE_IPC_HOOK: environmentMainService.mainIPCHandle
        };
        ["VSCODE_NLS_CONFIG", "VSCODE_PORTABLE"].forEach((key) => {
          const value = process.env[key];
          if (typeof value === "string") {
            instanceEnvironment[key] = value;
          }
        });
        const opencodeSharedDataHome = environmentMainService.appSharedDataHome?.fsPath;
        if (typeof opencodeSharedDataHome === "string" && opencodeSharedDataHome) {
          instanceEnvironment["OPENCODE_SHARED_DATA_HOME"] = opencodeSharedDataHome;
        }
        Object.assign(process.env, instanceEnvironment);
        return instanceEnvironment;
      }
      async initServices(environmentMainService, userDataProfilesMainService, configurationService, stateService, productService) {
        await Promises.settled([
          // Environment service (paths)
          Promise.all([
            this.allowWindowsUNCPath(environmentMainService.extensionsPath),
            // enable extension paths on UNC drives...
            environmentMainService.codeCachePath,
            // ...other user-data-derived paths should already be enlisted from `main.js`
            environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath,
            userDataProfilesMainService.defaultProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath,
            environmentMainService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath,
            environmentMainService.localHistoryHome.with({ scheme: Schemas.file }).fsPath,
            environmentMainService.backupHome
          ].map((path4) => path4 ? promises16.mkdir(path4, { recursive: true }) : void 0)),
          // State service
          stateService.init(),
          // Configuration service
          configurationService.initialize()
        ]);
        userDataProfilesMainService.init();
      }
      allowWindowsUNCPath(path4) {
        if (isWindows2) {
          const host = getUNCHost(path4);
          if (host) {
            addUNCHostToAllowlist(host);
          }
        }
        return path4;
      }
      async claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, retry2) {
        let mainProcessNodeIpcServer;
        try {
          mark("code/willStartMainServer");
          mainProcessNodeIpcServer = await serve(environmentMainService.mainIPCHandle);
          mark("code/didStartMainServer");
          Event.once(lifecycleMainService.onWillShutdown)(() => mainProcessNodeIpcServer.dispose());
        } catch (error) {
          if (error.code !== "EADDRINUSE") {
            this.handleStartupDataDirError(environmentMainService, productService, error);
            throw error;
          }
          let client;
          try {
            client = await connect(environmentMainService.mainIPCHandle, "main");
          } catch (error2) {
            if (!retry2 || isWindows2 || error2.code !== "ECONNREFUSED") {
              if (error2.code === "EPERM") {
                this.showStartupWarningDialog(
                  localize(165, null, productService.nameShort),
                  localize(166, null),
                  productService
                );
              }
              throw error2;
            }
            try {
              unlinkSync2(environmentMainService.mainIPCHandle);
            } catch (error3) {
              logService.warn("Could not delete obsolete instance handle", error3);
              throw error3;
            }
            return this.claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, false);
          }
          if (environmentMainService.extensionTestsLocationURI && !environmentMainService.debugExtensionHost.break) {
            const msg = `Running extension tests from the command line is currently only supported if no other instance of ${productService.nameShort} is running.`;
            logService.error(msg);
            client.dispose();
            throw new Error(msg);
          }
          let startupWarningDialogHandle = void 0;
          if (!environmentMainService.args.wait && !environmentMainService.args.status) {
            startupWarningDialogHandle = setTimeout(() => {
              this.showStartupWarningDialog(
                localize(167, null, productService.nameShort),
                localize(168, null),
                productService
              );
            }, 1e4);
          }
          const otherInstanceLaunchMainService = ProxyChannel.toService(client.getChannel("launch"), { disableMarshalling: true });
          const otherInstanceDiagnosticsMainService = ProxyChannel.toService(client.getChannel("diagnostics"), { disableMarshalling: true });
          if (environmentMainService.args.status) {
            return instantiationService.invokeFunction(async () => {
              const diagnosticsService = new DiagnosticsService(NullTelemetryService, productService);
              const mainDiagnostics = await otherInstanceDiagnosticsMainService.getMainDiagnostics();
              const remoteDiagnostics = await otherInstanceDiagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true });
              const diagnostics = await diagnosticsService.getDiagnostics(mainDiagnostics, remoteDiagnostics);
              console.log(diagnostics);
              throw new ExpectedError();
            });
          }
          if (isWindows2) {
            await this.windowsAllowSetForegroundWindow(otherInstanceLaunchMainService, logService);
          }
          logService.trace("Sending env to running instance...");
          await otherInstanceLaunchMainService.start(environmentMainService.args, process.env);
          client.dispose();
          if (startupWarningDialogHandle) {
            clearTimeout(startupWarningDialogHandle);
          }
          throw new ExpectedError("Sent env to running instance. Terminating...");
        }
        if (environmentMainService.args.status) {
          console.log(localize(171, null, productService.nameShort));
          throw new ExpectedError("Terminating...");
        }
        process.env["VSCODE_PID"] = String(process.pid);
        return mainProcessNodeIpcServer;
      }
      handleStartupDataDirError(environmentMainService, productService, error) {
        if (error.code === "EACCES" || error.code === "EPERM") {
          const directories = coalesce([environmentMainService.userDataPath, environmentMainService.extensionsPath, XDG_RUNTIME_DIR]).map((folder) => getPathLabel(URI.file(folder), { os: OS, tildify: environmentMainService }));
          this.showStartupWarningDialog(
            localize(169, null),
            localize(170, null, toErrorMessage(error), directories.join("\n")),
            productService
          );
        }
      }
      showStartupWarningDialog(message, detail, productService) {
        dialog.showMessageBoxSync(massageMessageBoxOptions({
          type: "warning",
          buttons: [localize(163, null)],
          message,
          detail
        }, productService).options);
      }
      async windowsAllowSetForegroundWindow(launchMainService, logService) {
        if (isWindows2) {
          const processId = await launchMainService.getMainProcessId();
          logService.trace("Sending some foreground love to the running instance:", processId);
          try {
            (await import("windows-foreground-love")).allowSetForegroundWindow(processId);
          } catch (error) {
            logService.error(error);
          }
        }
      }
      quit(accessor, reason) {
        const logService = accessor.get(ILogService);
        const lifecycleMainService = accessor.get(ILifecycleMainService);
        let exitCode = 0;
        if (reason) {
          if (reason.isExpected) {
            if (reason.message) {
              logService.trace(reason.message);
            }
          } else {
            exitCode = 1;
            if (reason.stack) {
              logService.error(reason.stack);
            } else {
              logService.error(`Startup error: ${reason.toString()}`);
            }
          }
        }
        lifecycleMainService.kill(exitCode);
      }
      async checkInnoSetupMutex(productService, logService) {
        if (!(isWindows2 && productService.win32MutexName && productService.win32VersionedUpdate && isInnoSetupInstall())) {
          return false;
        }
        try {
          const updatingMutexName = `${productService.win32MutexName}-updating`;
          const mutex = await import("@vscode/windows-mutex");
          if (!mutex.isActive(updatingMutexName)) {
            return false;
          }
          const pollIntervalMs = 250, retries = 120;
          logService.info(`checkInnoSetupMutex: ${updatingMutexName} is held, waiting up to ${pollIntervalMs * retries / 1e3}s for setup to finish...`);
          const start = Date.now();
          try {
            await retry(async () => {
              if (mutex.isActive(updatingMutexName)) {
                throw new Error("mutex still held");
              }
            }, pollIntervalMs, retries);
            logService.info(`checkInnoSetupMutex: ${updatingMutexName} released after ${Date.now() - start}ms`);
            return false;
          } catch {
            logService.warn(`checkInnoSetupMutex: ${updatingMutexName} still held after ${Date.now() - start}ms, giving up`);
            return true;
          }
        } catch (error) {
          logService.error("Failed to check Inno Setup mutex:", error);
          return false;
        }
      }
      //#region Command line arguments utilities
      resolveArgs() {
        const args2 = this.validatePaths(parseMainProcessArgv(process.argv));
        if (args2.wait && !args2.waitMarkerFilePath) {
          const waitMarkerFilePath = createWaitMarkerFileSync(args2.verbose);
          if (waitMarkerFilePath) {
            addArg(process.argv, "--waitMarkerFilePath", waitMarkerFilePath);
            args2.waitMarkerFilePath = waitMarkerFilePath;
          }
        }
        if (args2.chat) {
          if (args2.chat["new-window"]) {
            args2["new-window"] = true;
          } else if (args2.chat["reuse-window"]) {
            args2["reuse-window"] = true;
          } else if (args2.chat["profile"]) {
            args2["profile"] = args2.chat["profile"];
          } else {
            args2._ = [cwd2()];
          }
        }
        return args2;
      }
      validatePaths(args2) {
        const defaultKeybindingsExportPath = args2["export-default-keybindings"];
        if (defaultKeybindingsExportPath) {
          args2["export-default-keybindings"] = sanitizeFilePath(defaultKeybindingsExportPath, cwd2());
        }
        if (args2["open-url"]) {
          args2._urls = args2._;
          args2._ = [];
        }
        if (!args2["remote"]) {
          const paths = this.doValidatePaths(args2._, args2.goto);
          args2._ = paths;
        }
        return args2;
      }
      doValidatePaths(args2, gotoLineMode) {
        const currentWorkingDir = cwd2();
        const result = args2.map((arg) => {
          let pathCandidate = String(arg);
          let parsedPath = void 0;
          if (gotoLineMode) {
            parsedPath = parseLineAndColumnAware(pathCandidate);
            pathCandidate = parsedPath.path;
          }
          if (pathCandidate) {
            pathCandidate = this.preparePath(currentWorkingDir, pathCandidate);
          }
          const sanitizedFilePath = sanitizeFilePath(pathCandidate, currentWorkingDir);
          const filePathBasename = basename(sanitizedFilePath);
          if (filePathBasename && !isValidBasename(filePathBasename)) {
            return null;
          }
          if (gotoLineMode && parsedPath) {
            parsedPath.path = sanitizedFilePath;
            return this.toPath(parsedPath);
          }
          return sanitizedFilePath;
        });
        const caseInsensitive = isWindows2 || isMacintosh;
        const distinctPaths = distinct(result, (path4) => path4 && caseInsensitive ? path4.toLowerCase() : path4 || "");
        return coalesce(distinctPaths);
      }
      preparePath(cwd3, path4) {
        if (isWindows2) {
          path4 = rtrim(path4, '"');
        }
        path4 = trim(trim(path4, " "), "	");
        if (isWindows2) {
          path4 = resolve2(cwd3, path4);
          path4 = rtrim(path4, ".");
        }
        return path4;
      }
      toPath(pathWithLineAndCol) {
        const segments = [pathWithLineAndCol.path];
        if (typeof pathWithLineAndCol.line === "number") {
          segments.push(String(pathWithLineAndCol.line));
        }
        if (typeof pathWithLineAndCol.column === "number") {
          segments.push(String(pathWithLineAndCol.column));
        }
        return segments.join(":");
      }
      //#endregion
    };
    code = new CodeMain();
    code.main();
  }
});
export { main_exports, app14, dialog, unlinkSync2, promises16, CodeMain, code, init_main };
