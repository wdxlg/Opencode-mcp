// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/environment/common/environmentService.ts
import { dirname, join, normalize, resolve } from "./module-0018.mjs";
import { FileAccess, Schemas } from "./module-0024.mjs";
import { URI } from "./module-0023.mjs";
import { joinPath } from "./module-0025.mjs";
import { toLocalISOString } from "./module-0421.mjs";
import { env } from "./module-0014.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0030.mjs";


// src/vs/platform/environment/common/environmentService.ts
var EXTENSION_IDENTIFIER_WITH_LOG_REGEX = /^([^.]+\..+)[:=](.+)$/;

var AbstractNativeEnvironmentService = class {
  constructor(_args, paths, productService) {
    this._args = _args;
    this.paths = paths;
    this.productService = productService;
  }
  get appRoot() {
    return dirname(FileAccess.asFileUri("").fsPath);
  }
  get userHome() {
    return URI.file(this.paths.homeDir);
  }
  get userDataPath() {
    return this.paths.userDataDir;
  }
  get appSettingsHome() {
    return URI.file(join(this.userDataPath, "User"));
  }
  get tmpDir() {
    return URI.file(this.paths.tmpDir);
  }
  get cacheHome() {
    return URI.file(this.userDataPath);
  }
  get stateResource() {
    return joinPath(this.appSettingsHome, "globalStorage", "storage.json");
  }
  get userRoamingDataHome() {
    return this.appSettingsHome.with({ scheme: Schemas.vscodeUserData });
  }
  get userDataSyncHome() {
    return joinPath(this.appSettingsHome, "sync");
  }
  get logsHome() {
    if (!this.args.logsPath) {
      const key = toLocalISOString(/* @__PURE__ */ new Date()).replace(/-|:|\.\d+Z$/g, "");
      this.args.logsPath = join(this.userDataPath, "logs", key);
    }
    return URI.file(this.args.logsPath);
  }
  get sync() {
    return this.args.sync;
  }
  get workspaceStorageHome() {
    return joinPath(this.appSettingsHome, "workspaceStorage");
  }
  get localHistoryHome() {
    return joinPath(this.appSettingsHome, "History");
  }
  get keyboardLayoutResource() {
    return joinPath(this.userRoamingDataHome, "keyboardLayout.json");
  }
  get argvResource() {
    const vscodePortable = env["VSCODE_PORTABLE"];
    if (vscodePortable) {
      return URI.file(join(vscodePortable, "argv.json"));
    }
    return joinPath(this.userHome, this.productService.dataFolderName, "argv.json");
  }
  get isExtensionDevelopment() {
    return !!this.args.extensionDevelopmentPath;
  }
  get untitledWorkspacesHome() {
    return URI.file(join(this.userDataPath, "Workspaces"));
  }
  get builtinExtensionsPath() {
    const cliBuiltinExtensionsDir = this.args["builtin-extensions-dir"];
    if (cliBuiltinExtensionsDir) {
      return resolve(cliBuiltinExtensionsDir);
    }
    return normalize(join(FileAccess.asFileUri("").fsPath, "..", "extensions"));
  }
  get extensionsDownloadLocation() {
    const cliExtensionsDownloadDir = this.args["extensions-download-dir"];
    if (cliExtensionsDownloadDir) {
      return URI.file(resolve(cliExtensionsDownloadDir));
    }
    return URI.file(join(this.userDataPath, "CachedExtensionVSIXs"));
  }
  get extensionsPath() {
    const cliExtensionsDir = this.args["extensions-dir"];
    if (cliExtensionsDir) {
      return resolve(cliExtensionsDir);
    }
    const vscodeExtensions = env["VSCODE_EXTENSIONS"];
    if (vscodeExtensions) {
      return vscodeExtensions;
    }
    const vscodePortable = env["VSCODE_PORTABLE"];
    if (vscodePortable) {
      return join(vscodePortable, "extensions");
    }
    return joinPath(this.userHome, this.productService.dataFolderName, "extensions").fsPath;
  }
  get appSharedDataHome() {
    const cliSharedDataDir = this.args["shared-data-dir"];
    if (cliSharedDataDir) {
      return URI.file(resolve(cliSharedDataDir));
    }
    const vscodePortable = env["VSCODE_PORTABLE"];
    if (vscodePortable) {
      return URI.file(join(vscodePortable, "shared-data"));
    }
    return joinPath(this.userHome, this.productService.sharedDataFolderName);
  }
  get extensionDevelopmentLocationURI() {
    const extensionDevelopmentPaths = this.args.extensionDevelopmentPath;
    if (Array.isArray(extensionDevelopmentPaths)) {
      return extensionDevelopmentPaths.map((extensionDevelopmentPath) => {
        if (/^[^:/?#]+?:\/\//.test(extensionDevelopmentPath)) {
          return URI.parse(extensionDevelopmentPath);
        }
        return URI.file(normalize(extensionDevelopmentPath));
      });
    }
    return void 0;
  }
  get extensionDevelopmentKind() {
    return this.args.extensionDevelopmentKind?.map((kind) => kind === "ui" || kind === "workspace" || kind === "web" ? kind : "workspace");
  }
  get extensionTestsLocationURI() {
    const extensionTestsPath = this.args.extensionTestsPath;
    if (extensionTestsPath) {
      if (/^[^:/?#]+?:\/\//.test(extensionTestsPath)) {
        return URI.parse(extensionTestsPath);
      }
      return URI.file(normalize(extensionTestsPath));
    }
    return void 0;
  }
  get disableExtensions() {
    if (this.args["disable-extensions"]) {
      return true;
    }
    const disableExtensions = this.args["disable-extension"];
    if (disableExtensions) {
      if (typeof disableExtensions === "string") {
        return [disableExtensions];
      }
      if (Array.isArray(disableExtensions) && disableExtensions.length > 0) {
        return disableExtensions;
      }
    }
    return false;
  }
  get skipBuiltinExtensions() {
    const value = env["VSCODE_SKIP_BUILTIN_EXTENSIONS"];
    if (!value) {
      return [];
    }
    return value.split(",").map((id2) => id2.trim()).filter((id2) => id2);
  }
  get debugExtensionHost() {
    return parseExtensionHostDebugPort(this.args, this.isBuilt);
  }
  get debugRenderer() {
    return !!this.args.debugRenderer;
  }
  get isBuilt() {
    return !env["VSCODE_DEV"];
  }
  get verbose() {
    return !!this.args.verbose;
  }
  get logLevel() {
    return this.args.log?.find((entry) => !EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry));
  }
  get extensionLogLevel() {
    const result = [];
    for (const entry of this.args.log || []) {
      const matches = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
      if (matches?.[1] && matches[2]) {
        result.push([matches[1], matches[2]]);
      }
    }
    return result.length ? result : void 0;
  }
  get serviceMachineIdResource() {
    return joinPath(URI.file(this.userDataPath), "machineid");
  }
  get crashReporterId() {
    return this.args["crash-reporter-id"];
  }
  get crashReporterDirectory() {
    return this.args["crash-reporter-directory"];
  }
  get disableTelemetry() {
    return !!this.args["disable-telemetry"];
  }
  get disableExperiments() {
    return !!this.args["disable-experiments"];
  }
  get disableWorkspaceTrust() {
    return !!this.args["disable-workspace-trust"];
  }
  get useInMemorySecretStorage() {
    return !!this.args["use-inmemory-secretstorage"];
  }
  get policyFile() {
    if (this.args["__enable-file-policy"]) {
      const vscodePortable = env["VSCODE_PORTABLE"];
      if (vscodePortable) {
        return URI.file(join(vscodePortable, "policy.json"));
      }
      return joinPath(this.userHome, this.productService.dataFolderName, "policy.json");
    }
    return void 0;
  }
  get agentSessionsWorkspace() {
    return joinPath(this.appSettingsHome, "agent-sessions.code-workspace");
  }
  get editSessionId() {
    return this.args["editSessionId"];
  }
  get exportPolicyData() {
    return this.args["export-policy-data"];
  }
  get exportDefaultKeybindings() {
    return this.args["export-default-keybindings"];
  }
  get continueOn() {
    return this.args["continueOn"];
  }
  set continueOn(value) {
    this.args["continueOn"] = value;
  }
  get args() {
    return this._args;
  }
};

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "appRoot", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "userHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "userDataPath", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "appSettingsHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "tmpDir", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "cacheHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "stateResource", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "userRoamingDataHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "userDataSyncHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "sync", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "workspaceStorageHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "localHistoryHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "keyboardLayoutResource", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "argvResource", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "isExtensionDevelopment", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "untitledWorkspacesHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "builtinExtensionsPath", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "extensionsDownloadLocation", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "extensionsPath", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "appSharedDataHome", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "extensionDevelopmentLocationURI", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "extensionDevelopmentKind", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "extensionTestsLocationURI", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "debugExtensionHost", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "logLevel", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "extensionLogLevel", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "serviceMachineIdResource", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "disableTelemetry", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "disableExperiments", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "disableWorkspaceTrust", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "useInMemorySecretStorage", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "policyFile", 1);

__decorateClass([
  memoize
], AbstractNativeEnvironmentService.prototype, "agentSessionsWorkspace", 1);

function parseExtensionHostDebugPort(args, isBuilt) {
  return parseDebugParams(args["inspect-extensions"], args["inspect-brk-extensions"], 5870, isBuilt, args.debugId, args.extensionEnvironment);
}

function parseDebugParams(debugArg, debugBrkArg, defaultBuildPort, isBuilt, debugId, environmentString) {
  const portStr = debugBrkArg || debugArg;
  const port = Number(portStr) || (!isBuilt ? defaultBuildPort : null);
  const brk = port ? Boolean(!!debugBrkArg) : false;
  let env2;
  if (environmentString) {
    try {
      env2 = JSON.parse(environmentString);
    } catch {
    }
  }
  return { port, break: brk, debugId, env: env2 };
}
export { parseExtensionHostDebugPort, parseDebugParams, EXTENSION_IDENTIFIER_WITH_LOG_REGEX, AbstractNativeEnvironmentService };
