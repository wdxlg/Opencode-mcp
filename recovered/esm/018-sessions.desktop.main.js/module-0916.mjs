// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/environment/browser/environmentService.ts
import { refineServiceDecorator } from "./module-0077.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { EXTENSION_IDENTIFIER_WITH_LOG_REGEX } from "./module-0915.mjs";
import { LogLevelToString } from "./module-0095.mjs";
import { joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { parseLineAndColumnAware } from "./module-0031.mjs";
import { isUndefined } from "./module-0010.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/workbench/services/environment/browser/environmentService.ts
var IBrowserWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);

var BrowserWorkbenchEnvironmentService = class {
  constructor(workspaceId, logsHome, options3, productService) {
    this.workspaceId = workspaceId;
    this.logsHome = logsHome;
    this.options = options3;
    this.productService = productService;
    this.extensionHostDebugEnvironment = void 0;
    if (options3.workspaceProvider && Array.isArray(options3.workspaceProvider.payload)) {
      try {
        this.payload = new Map(options3.workspaceProvider.payload);
      } catch (error) {
        onUnexpectedError(error);
      }
    }
  }
  get remoteAuthority() {
    return this.options.remoteAuthority;
  }
  get expectsResolverExtension() {
    return !!this.options.remoteAuthority?.includes("+") && !this.options.webSocketFactory;
  }
  get isBuilt() {
    return !!this.productService.commit;
  }
  get logLevel() {
    const logLevelFromPayload = this.payload?.get("logLevel");
    if (logLevelFromPayload) {
      return logLevelFromPayload.split(",").find((entry) => !EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry));
    }
    return this.options.developmentOptions?.logLevel !== void 0 ? LogLevelToString(this.options.developmentOptions?.logLevel) : void 0;
  }
  get extensionLogLevel() {
    const logLevelFromPayload = this.payload?.get("logLevel");
    if (logLevelFromPayload) {
      const result = [];
      for (const entry of logLevelFromPayload.split(",")) {
        const matches2 = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
        if (matches2?.[1] && matches2[2]) {
          result.push([matches2[1], matches2[2]]);
        }
      }
      return result.length ? result : void 0;
    }
    return this.options.developmentOptions?.extensionLogLevel !== void 0 ? this.options.developmentOptions?.extensionLogLevel.map(([extension, logLevel]) => [extension, LogLevelToString(logLevel)]) : void 0;
  }
  get profDurationMarkers() {
    const profDurationMarkersFromPayload = this.payload?.get("profDurationMarkers");
    if (profDurationMarkersFromPayload) {
      const result = [];
      for (const entry of profDurationMarkersFromPayload.split(",")) {
        result.push(entry);
      }
      return result.length === 2 ? result : void 0;
    }
    return void 0;
  }
  get windowLogsPath() {
    return this.logsHome;
  }
  get logFile() {
    return joinPath(this.windowLogsPath, "window.log");
  }
  get userRoamingDataHome() {
    return URI.file("/User").with({ scheme: Schemas.vscodeUserData });
  }
  get argvResource() {
    return joinPath(this.userRoamingDataHome, "argv.json");
  }
  get cacheHome() {
    return joinPath(this.userRoamingDataHome, "caches");
  }
  get workspaceStorageHome() {
    return joinPath(this.userRoamingDataHome, "workspaceStorage");
  }
  get appSharedDataHome() {
    return joinPath(this.userRoamingDataHome, "sharedData");
  }
  get localHistoryHome() {
    return joinPath(this.userRoamingDataHome, "History");
  }
  get stateResource() {
    return joinPath(this.userRoamingDataHome, "State", "storage.json");
  }
  get userDataSyncHome() {
    return joinPath(this.userRoamingDataHome, "sync", this.workspaceId);
  }
  get sync() {
    return void 0;
  }
  get keyboardLayoutResource() {
    return joinPath(this.userRoamingDataHome, "keyboardLayout.json");
  }
  get untitledWorkspacesHome() {
    return joinPath(this.userRoamingDataHome, "Workspaces");
  }
  get agentSessionsWorkspace() {
    return joinPath(this.userRoamingDataHome, "agent-sessions.code-workspace");
  }
  get serviceMachineIdResource() {
    return joinPath(this.userRoamingDataHome, "machineid");
  }
  get extHostLogsPath() {
    return joinPath(this.logsHome, "exthost");
  }
  get debugExtensionHost() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.params;
  }
  get isExtensionDevelopment() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.isExtensionDevelopment;
  }
  get extensionDevelopmentLocationURI() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionDevelopmentLocationURI;
  }
  get extensionDevelopmentLocationKind() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionDevelopmentKind;
  }
  get extensionTestsLocationURI() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionTestsLocationURI;
  }
  get extensionEnabledProposedApi() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    if (this.extensionHostDebugEnvironment.extensionEnabledProposedApi !== void 0) {
      return this.extensionHostDebugEnvironment.extensionEnabledProposedApi;
    }
    if (this.options.enabledExtensionProposedApi !== void 0) {
      return [...this.options.enabledExtensionProposedApi];
    }
    return void 0;
  }
  get debugRenderer() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.debugRenderer;
  }
  get enableSmokeTestDriver() {
    return this.options.developmentOptions?.enableSmokeTestDriver;
  }
  get disableExtensions() {
    return this.payload?.get("disableExtensions") === "true";
  }
  get enableExtensions() {
    return this.options.enabledExtensions;
  }
  get webviewExternalEndpoint() {
    const endpoint = this.options.webviewEndpoint || this.productService.webviewContentExternalBaseUrlTemplate || "https://{{uuid}}.vscode-cdn.net/{{quality}}/{{commit}}/out/vs/workbench/contrib/webview/browser/pre/";
    const webviewExternalEndpointCommit = this.payload?.get("webviewExternalEndpointCommit");
    return endpoint.replace("{{commit}}", webviewExternalEndpointCommit ?? this.productService.commit ?? "ef65ac1ba57f57f2a3961bfe94aa20481caca4c6").replace("{{quality}}", (webviewExternalEndpointCommit ? "insider" : this.productService.quality) ?? "insider");
  }
  get extensionTelemetryLogResource() {
    return joinPath(this.logsHome, "extensionTelemetry.log");
  }
  get disableTelemetry() {
    return false;
  }
  get disableExperiments() {
    return false;
  }
  get verbose() {
    return this.payload?.get("verbose") === "true";
  }
  get logExtensionHostCommunication() {
    return this.payload?.get("logExtensionHostCommunication") === "true";
  }
  get skipReleaseNotes() {
    return this.payload?.get("skipReleaseNotes") === "true";
  }
  get skipWelcome() {
    return this.payload?.get("skipWelcome") === "true";
  }
  get disableWorkspaceTrust() {
    return !this.options.enableWorkspaceTrust;
  }
  get isSessionsWindow() {
    return this.payload?.get("isSessionsWindow") === "true";
  }
  get profile() {
    return this.payload?.get("profile");
  }
  get editSessionId() {
    return this.options.editSessionId;
  }
  resolveExtensionHostDebugEnvironment() {
    const extensionHostDebugEnvironment = {
      params: {
        port: null,
        break: false
      },
      debugRenderer: false,
      isExtensionDevelopment: false,
      extensionDevelopmentLocationURI: void 0,
      extensionDevelopmentKind: void 0
    };
    if (this.payload && (!this.isBuilt || this.enableSmokeTestDriver)) {
      for (const [key3, value2] of this.payload) {
        switch (key3) {
          case "extensionDevelopmentPath":
            if (!extensionHostDebugEnvironment.extensionDevelopmentLocationURI) {
              extensionHostDebugEnvironment.extensionDevelopmentLocationURI = [];
            }
            extensionHostDebugEnvironment.extensionDevelopmentLocationURI.push(URI.parse(value2));
            extensionHostDebugEnvironment.isExtensionDevelopment = true;
            break;
          case "extensionDevelopmentKind":
            extensionHostDebugEnvironment.extensionDevelopmentKind = [value2];
            break;
          case "extensionTestsPath":
            extensionHostDebugEnvironment.extensionTestsLocationURI = URI.parse(value2);
            break;
          case "debugRenderer":
            extensionHostDebugEnvironment.debugRenderer = value2 === "true";
            break;
          case "debugId":
            extensionHostDebugEnvironment.params.debugId = value2;
            break;
          case "inspect-brk-extensions":
            extensionHostDebugEnvironment.params.port = parseInt(value2);
            extensionHostDebugEnvironment.params.break = true;
            break;
          case "inspect-extensions":
            extensionHostDebugEnvironment.params.port = parseInt(value2);
            break;
          case "extensionEnvironment":
            try {
              extensionHostDebugEnvironment.params.env = JSON.parse(value2);
            } catch (error) {
              onUnexpectedError(error);
            }
            break;
          case "enableProposedApi":
            extensionHostDebugEnvironment.extensionEnabledProposedApi = [];
            break;
        }
      }
    }
    const developmentOptions = this.options.developmentOptions;
    if (developmentOptions && !extensionHostDebugEnvironment.isExtensionDevelopment) {
      if (developmentOptions.extensions?.length) {
        extensionHostDebugEnvironment.extensionDevelopmentLocationURI = developmentOptions.extensions.map((e4) => URI.revive(e4));
        extensionHostDebugEnvironment.isExtensionDevelopment = true;
      }
      if (developmentOptions.extensionTestsPath) {
        extensionHostDebugEnvironment.extensionTestsLocationURI = URI.revive(developmentOptions.extensionTestsPath);
      }
    }
    return extensionHostDebugEnvironment;
  }
  get filesToOpenOrCreate() {
    if (this.payload) {
      const fileToOpen = this.payload.get("openFile");
      if (fileToOpen) {
        const fileUri = URI.parse(fileToOpen);
        if (this.payload.has("gotoLineMode")) {
          const pathColumnAware = parseLineAndColumnAware(fileUri.path);
          return [{
            fileUri: fileUri.with({ path: pathColumnAware.path }),
            options: {
              selection: !isUndefined(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : void 0
            }
          }];
        }
        return [{ fileUri }];
      }
    }
    return void 0;
  }
  get filesToDiff() {
    if (this.payload) {
      const fileToDiffPrimary = this.payload.get("diffFilePrimary");
      const fileToDiffSecondary = this.payload.get("diffFileSecondary");
      if (fileToDiffPrimary && fileToDiffSecondary) {
        return [
          { fileUri: URI.parse(fileToDiffSecondary) },
          { fileUri: URI.parse(fileToDiffPrimary) }
        ];
      }
    }
    return void 0;
  }
  get filesToMerge() {
    if (this.payload) {
      const fileToMerge1 = this.payload.get("mergeFile1");
      const fileToMerge2 = this.payload.get("mergeFile2");
      const fileToMergeBase = this.payload.get("mergeFileBase");
      const fileToMergeResult = this.payload.get("mergeFileResult");
      if (fileToMerge1 && fileToMerge2 && fileToMergeBase && fileToMergeResult) {
        return [
          { fileUri: URI.parse(fileToMerge1) },
          { fileUri: URI.parse(fileToMerge2) },
          { fileUri: URI.parse(fileToMergeBase) },
          { fileUri: URI.parse(fileToMergeResult) }
        ];
      }
    }
    return void 0;
  }
};

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "remoteAuthority", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "expectsResolverExtension", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "isBuilt", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "logLevel", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "windowLogsPath", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "logFile", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "userRoamingDataHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "argvResource", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "cacheHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "workspaceStorageHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "appSharedDataHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "localHistoryHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "stateResource", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "userDataSyncHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "sync", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "keyboardLayoutResource", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "untitledWorkspacesHome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "agentSessionsWorkspace", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "serviceMachineIdResource", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extHostLogsPath", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "debugExtensionHost", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "isExtensionDevelopment", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationURI", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationKind", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionTestsLocationURI", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "debugRenderer", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableExtensions", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "enableExtensions", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionTelemetryLogResource", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableTelemetry", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableExperiments", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "verbose", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "skipReleaseNotes", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "skipWelcome", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableWorkspaceTrust", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "isSessionsWindow", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "profile", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "editSessionId", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "filesToDiff", 1);

__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "filesToMerge", 1);
export { IBrowserWorkbenchEnvironmentService, BrowserWorkbenchEnvironmentService };
