// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/environment/electron-browser/environmentService.ts
import { refineServiceDecorator } from "./module-0077.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { AbstractNativeEnvironmentService } from "./module-0915.mjs";
import { joinPath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/workbench/services/environment/electron-browser/environmentService.ts
var INativeWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);

var NativeWorkbenchEnvironmentService = class extends AbstractNativeEnvironmentService {
  constructor(configuration2, productService) {
    super(
      configuration2,
      {
        homeDir: configuration2.homeDir,
        tmpDir: configuration2.tmpDir,
        userDataDir: configuration2.userDataDir
      },
      productService
    );
    this.configuration = configuration2;
  }
  get mainPid() {
    return this.configuration.mainPid;
  }
  get machineId() {
    return this.configuration.machineId;
  }
  get sqmId() {
    return this.configuration.sqmId;
  }
  get devDeviceId() {
    return this.configuration.devDeviceId;
  }
  get isPortable() {
    return this.configuration.isPortable;
  }
  get remoteAuthority() {
    return this.configuration.remoteAuthority;
  }
  get expectsResolverExtension() {
    return !!this.configuration.remoteAuthority?.includes("+");
  }
  get execPath() {
    return this.configuration.execPath;
  }
  get backupPath() {
    return this.configuration.backupPath;
  }
  get window() {
    return {
      id: this.configuration.windowId,
      handle: this.configuration.handle,
      colorScheme: this.configuration.colorScheme,
      maximized: this.configuration.maximized,
      accessibilitySupport: this.configuration.accessibilitySupport,
      perfMarks: this.configuration.perfMarks,
      isInitialStartup: this.configuration.isInitialStartup,
      isCodeCaching: typeof this.configuration.codeCachePath === "string"
    };
  }
  get windowLogsPath() {
    return joinPath(this.logsHome, `window${this.configuration.windowId}`);
  }
  get logFile() {
    return joinPath(this.windowLogsPath, `renderer.log`);
  }
  get extHostLogsPath() {
    return joinPath(this.windowLogsPath, "exthost");
  }
  get webviewExternalEndpoint() {
    return `${Schemas.vscodeWebview}://{{uuid}}`;
  }
  get skipReleaseNotes() {
    return !!this.args["skip-release-notes"];
  }
  get skipWelcome() {
    return !!this.args["skip-welcome"];
  }
  get logExtensionHostCommunication() {
    return !!this.args.logExtensionHostCommunication;
  }
  get enableSmokeTestDriver() {
    return !!this.args["enable-smoke-test-driver"];
  }
  get extensionEnabledProposedApi() {
    if (Array.isArray(this.args["enable-proposed-api"])) {
      return this.args["enable-proposed-api"];
    }
    if ("enable-proposed-api" in this.args) {
      return [];
    }
    return void 0;
  }
  get os() {
    return this.configuration.os;
  }
  get filesToOpenOrCreate() {
    return this.configuration.filesToOpenOrCreate;
  }
  get filesToDiff() {
    return this.configuration.filesToDiff;
  }
  get filesToMerge() {
    return this.configuration.filesToMerge;
  }
  get filesToWait() {
    return this.configuration.filesToWait;
  }
  get isSessionsWindow() {
    return !!this.configuration.isSessionsWindow;
  }
};

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "mainPid", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "machineId", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "sqmId", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "devDeviceId", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "isPortable", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "remoteAuthority", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "expectsResolverExtension", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "execPath", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "backupPath", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "window", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "windowLogsPath", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "logFile", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "extHostLogsPath", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "skipReleaseNotes", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "skipWelcome", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "os", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToDiff", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToMerge", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToWait", 1);

__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "isSessionsWindow", 1);
export { INativeWorkbenchEnvironmentService, NativeWorkbenchEnvironmentService };
