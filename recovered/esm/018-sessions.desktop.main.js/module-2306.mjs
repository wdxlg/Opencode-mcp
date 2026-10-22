// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpSandboxService.ts
import { createDecorator } from "./module-0077.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { untildify } from "./module-0711.mjs";
import { dirname, posix, win32 } from "./module-0026.mjs";
import { Disposable } from "./module-0012.mjs";
import { generateUuid } from "./module-0190.mjs";
import { localize } from "./module-0001.mjs";
import { arch } from "./module-0015.mjs";
import { OS } from "./module-0014.mjs";
import { ConfigurationTargetToString } from "./module-0132.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMcpResourceScannerService } from "./module-1197.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";


// src/vs/workbench/contrib/mcp/common/mcpSandboxService.ts
var IMcpSandboxService = createDecorator("mcpSandboxService");

function mcpDefaultCwdToFsPath(resource, os) {
  let value2 = resource.scheme === Schemas.file && resource.authority ? `//${resource.authority}${resource.path}` : resource.path;
  if (os === 1 /* Windows */) {
    if (/^\/[a-zA-Z]:/.test(value2)) {
      value2 = value2.slice(1);
    }
    value2 = value2.replace(/\//g, "\\");
  }
  return value2;
}

function resolveMcpServerSandboxWorkingDirectory(cwd2, defaultCwd, userHome, os) {
  const targetDefaultCwd = defaultCwd ? mcpDefaultCwdToFsPath(defaultCwd, os) : void 0;
  if (!cwd2) {
    return targetDefaultCwd;
  }
  const targetUserHome = userHome ? mcpDefaultCwdToFsPath(userHome, os) : void 0;
  const expandedCwd = targetUserHome ? untildify(cwd2, targetUserHome) : cwd2;
  const path = os === 1 /* Windows */ ? win32 : posix;
  const base = targetDefaultCwd ?? targetUserHome;
  return base && !path.isAbsolute(expandedCwd) ? path.join(base, expandedCwd) : expandedCwd;
}

var McpSandboxService = class extends Disposable {
  constructor(_fileService, _environmentService, _logService, _mcpResourceScannerService, _remoteAgentService) {
    super();
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._mcpResourceScannerService = _mcpResourceScannerService;
    this._remoteAgentService = _remoteAgentService;
    this._defaultAllowedDomains = ["registry.npmjs.org"];
    // Default allowed domains that are commonly needed for MCP servers, even if the user doesn't specify them in their sandbox config
    this._defaultAllowWritePaths = ["~/.npm"];
    this._sandboxConfigPerConfigurationTarget = /* @__PURE__ */ new Map();
    this._pathJoin = (os, ...segments) => {
      const path = os === 1 /* Windows */ ? win32 : posix;
      return path.join(...segments);
    };
    this._getPathDelimiter = async (remoteAuthority) => {
      const os = await this._getOperatingSystem(remoteAuthority);
      return os === 1 /* Windows */ ? win32.delimiter : posix.delimiter;
    };
    this._sandboxSettingsId = generateUuid();
    this._remoteEnvDetailsPromise = this._remoteAgentService.getEnvironment();
  }
  async isEnabled(serverDef, remoteAuthority) {
    const os = await this._getOperatingSystem(remoteAuthority);
    if (os === 1 /* Windows */) {
      return false;
    }
    return !!serverDef.sandboxEnabled;
  }
  async launchInSandboxIfEnabled(serverDef, launch, remoteAuthority, configTarget) {
    if (launch.type !== 1 /* Stdio */) {
      return launch;
    }
    if (await this.isEnabled(serverDef, remoteAuthority)) {
      this._logService.trace(`McpSandboxService: Launching with config target ${configTarget}`);
      const launchCwd = resolveMcpServerSandboxWorkingDirectory(
        launch.cwd,
        serverDef.defaultCwd,
        await this._getUserHome(remoteAuthority),
        await this._getOperatingSystem(remoteAuthority)
      );
      const launchDetails = await this._resolveSandboxLaunchDetails(configTarget, remoteAuthority, launch.sandbox, launchCwd);
      const quotedCommand = this._quoteShellArgument(launch.command);
      const quotedArgs = launch.args.map((arg) => this._quoteShellArgument(arg));
      const sandboxArgs = this._getSandboxCommandArgs(quotedCommand, quotedArgs, launchDetails.sandboxConfigPath);
      const sandboxEnv = await this._getSandboxEnvVariables(launch.env, launchDetails.tempDir, launchDetails.rgPath, remoteAuthority);
      if (launchDetails.srtPath) {
        if (launchDetails.execPath) {
          return {
            ...launch,
            command: launchDetails.execPath,
            args: [launchDetails.srtPath, ...sandboxArgs],
            env: sandboxEnv,
            type: 1 /* Stdio */
          };
        } else {
          return {
            ...launch,
            command: launchDetails.srtPath,
            args: sandboxArgs,
            env: sandboxEnv,
            type: 1 /* Stdio */
          };
        }
      }
      if (!launchDetails.execPath) {
        this._logService.warn("McpSandboxService: execPath is unavailable, launching without sandbox runtime wrapper");
      }
      this._logService.debug(`McpSandboxService: launch details for server ${serverDef.label} - command: ${launch.command}, args: ${launch.args.join(" ")}`);
    }
    return launch;
  }
  getSandboxConfigSuggestionMessage(serverLabel, potentialBlocks, existingSandboxConfig) {
    const suggestions = this._getSandboxConfigSuggestions(potentialBlocks, existingSandboxConfig);
    if (!suggestions) {
      return void 0;
    }
    const allowWriteList = suggestions.allowWrite;
    const allowedDomainsList = suggestions.allowedDomains;
    const suggestionLines = [];
    if (allowedDomainsList.length) {
      const shown = allowedDomainsList.map((domain) => `"${domain}"`).join(", ");
      suggestionLines.push(localize(17183, null, shown));
    }
    if (allowWriteList.length) {
      const shown = allowWriteList.map((path) => `"${path}"`).join(", ");
      suggestionLines.push(localize(17184, null, shown));
    }
    const sandboxConfig = {};
    if (allowedDomainsList.length) {
      sandboxConfig.network = { allowedDomains: [...allowedDomainsList] };
    }
    if (allowWriteList.length) {
      sandboxConfig.filesystem = { allowWrite: [...allowWriteList] };
    }
    return {
      message: localize(
        17185,
        null,
        serverLabel,
        suggestionLines.join("\n")
      ),
      sandboxConfig
    };
  }
  async applySandboxConfigSuggestion(serverDef, mcpResource, configTarget, potentialBlocks, suggestedSandboxConfig) {
    const scanTarget = this._toMcpResourceTarget(configTarget);
    let didChange = false;
    await this._mcpResourceScannerService.updateSandboxConfig((data) => {
      const existingSandbox = data.sandbox;
      const suggestedAllowedDomains = suggestedSandboxConfig?.network?.allowedDomains ?? [];
      const suggestedAllowWrite = suggestedSandboxConfig?.filesystem?.allowWrite ?? [];
      const currentAllowedDomains = new Set(existingSandbox?.network?.allowedDomains ?? []);
      for (const domain of suggestedAllowedDomains) {
        if (domain && !currentAllowedDomains.has(domain)) {
          currentAllowedDomains.add(domain);
        }
      }
      const currentAllowWrite = new Set(existingSandbox?.filesystem?.allowWrite ?? []);
      for (const path of suggestedAllowWrite) {
        if (path && !currentAllowWrite.has(path)) {
          currentAllowWrite.add(path);
        }
      }
      if (suggestedAllowedDomains.length === 0 && suggestedAllowWrite.length === 0) {
        return data;
      }
      didChange = true;
      const nextSandboxConfig = {};
      if (currentAllowedDomains.size > 0) {
        nextSandboxConfig.network = {
          ...existingSandbox?.network,
          allowedDomains: [...currentAllowedDomains]
        };
      }
      if (currentAllowWrite.size > 0) {
        nextSandboxConfig.filesystem = {
          ...existingSandbox?.filesystem,
          allowWrite: [...currentAllowWrite]
        };
      }
      return {
        ...data,
        sandbox: nextSandboxConfig
      };
    }, mcpResource, scanTarget);
    return didChange;
  }
  _getSandboxConfigSuggestions(potentialBlocks, existingSandboxConfig) {
    if (!potentialBlocks.length) {
      return void 0;
    }
    const allowWrite = /* @__PURE__ */ new Set();
    const allowedDomains = /* @__PURE__ */ new Set();
    const existingAllowWrite = new Set(existingSandboxConfig?.filesystem?.allowWrite ?? []);
    const existingAllowedDomains = new Set(existingSandboxConfig?.network?.allowedDomains ?? []);
    for (const block2 of potentialBlocks) {
      if (block2.kind === "network" && block2.host && !existingAllowedDomains.has(block2.host)) {
        allowedDomains.add(block2.host);
      }
      if (block2.kind === "filesystem" && block2.path && !existingAllowWrite.has(block2.path)) {
        allowWrite.add(block2.path);
      }
    }
    if (!allowWrite.size && !allowedDomains.size) {
      return void 0;
    }
    return {
      allowWrite: [...allowWrite],
      allowedDomains: [...allowedDomains]
    };
  }
  _toMcpResourceTarget(configTarget) {
    switch (configTarget) {
      case 2 /* USER */:
      case 3 /* USER_LOCAL */:
      case 4 /* USER_REMOTE */:
        return 2 /* USER */;
      case 5 /* WORKSPACE */:
        return 5 /* WORKSPACE */;
      case 6 /* WORKSPACE_FOLDER */:
        return 6 /* WORKSPACE_FOLDER */;
      default:
        return 2 /* USER */;
    }
  }
  async _resolveSandboxLaunchDetails(configTarget, remoteAuthority, sandboxConfig, launchCwd) {
    const os = await this._getOperatingSystem(remoteAuthority);
    if (os === 1 /* Windows */) {
      return { execPath: void 0, srtPath: void 0, rgPath: void 0, sandboxConfigPath: void 0, tempDir: void 0 };
    }
    const appRoot = await this._getAppRoot(remoteAuthority);
    const execPath = await this._getExecPath(os, appRoot, remoteAuthority);
    const tempDir = await this._getTempDir(remoteAuthority);
    const srtPath = this._pathJoin(os, appRoot, "node_modules", "@vscode", "sandbox-runtime", "dist", "cli.js");
    const rgPlatform = os === 2 /* Macintosh */ ? "darwin" : "linux";
    const rgPath = this._pathJoin(os, appRoot, "node_modules", "@vscode", "ripgrep-universal", "bin", `${rgPlatform}-${arch}`, "rg");
    const sandboxConfigPath = tempDir ? await this._updateSandboxConfig(tempDir, configTarget, sandboxConfig, launchCwd) : void 0;
    this._logService.debug(`McpSandboxService: Updated sandbox config path: ${sandboxConfigPath}`);
    return { execPath, srtPath, rgPath, sandboxConfigPath, tempDir };
  }
  async _getExecPath(os, appRoot, remoteAuthority) {
    if (remoteAuthority) {
      return this._pathJoin(os, appRoot, "node");
    }
    return void 0;
  }
  async _getSandboxEnvVariables(baseEnv, tempDir, rgPath, remoteAuthority) {
    let env2 = { ...baseEnv };
    if (tempDir) {
      env2 = { ...env2, TMPDIR: tempDir.path, SRT_DEBUG: "true", NODE_USE_ENV_PROXY: "1" };
    }
    if (rgPath) {
      env2 = { ...env2, PATH: env2["PATH"] ? `${env2["PATH"]}${await this._getPathDelimiter(remoteAuthority)}${dirname(rgPath)}` : dirname(rgPath) };
    }
    if (!remoteAuthority) {
      env2 = { ...env2, ELECTRON_RUN_AS_NODE: "1" };
    }
    env2["VSCODE_INSPECTOR_OPTIONS"] = null;
    return env2;
  }
  _getSandboxCommandArgs(command4, args2, sandboxConfigPath) {
    const result = [];
    if (sandboxConfigPath) {
      result.push("--settings", sandboxConfigPath);
      result.push("--");
    }
    result.push(command4, ...args2);
    return result;
  }
  async _getRemoteEnv(remoteAuthority) {
    if (!remoteAuthority) {
      return null;
    }
    return this._remoteEnvDetailsPromise;
  }
  async _getUserHome(remoteAuthority) {
    const remoteEnv = await this._getRemoteEnv(remoteAuthority);
    if (remoteEnv) {
      return remoteEnv.userHome;
    }
    const nativeEnv = this._environmentService;
    return nativeEnv.userHome;
  }
  async _getOperatingSystem(remoteAuthority) {
    const remoteEnv = await this._getRemoteEnv(remoteAuthority);
    if (remoteEnv) {
      return remoteEnv.os;
    }
    return OS;
  }
  async _getAppRoot(remoteAuthority) {
    const remoteEnv = await this._getRemoteEnv(remoteAuthority);
    if (remoteEnv) {
      return remoteEnv.appRoot.path;
    }
    return dirname(FileAccess.asFileUri("").path);
  }
  async _getTempDir(remoteAuthority) {
    const remoteEnv = await this._getRemoteEnv(remoteAuthority);
    if (remoteEnv) {
      return remoteEnv.tmpDir;
    }
    const environmentService = this._environmentService;
    const tempDir = environmentService.tmpDir;
    if (!tempDir) {
      this._logService.warn("McpSandboxService: Cannot create sandbox settings file because no tmpDir is available in this environment");
    }
    return tempDir;
  }
  async _updateSandboxConfig(tempDir, configTarget, sandboxConfig, launchCwd) {
    const normalizedSandboxConfig = this._withDefaultSandboxConfig(sandboxConfig, launchCwd);
    let configFileUri;
    const configTargetKey = ConfigurationTargetToString(configTarget);
    if (this._sandboxConfigPerConfigurationTarget.has(configTargetKey)) {
      configFileUri = URI.parse(this._sandboxConfigPerConfigurationTarget.get(configTargetKey));
    } else {
      configFileUri = URI.joinPath(tempDir, `vscode-${configTargetKey}-mcp-sandbox-settings-${this._sandboxSettingsId}.json`);
      this._sandboxConfigPerConfigurationTarget.set(configTargetKey, configFileUri.toString());
    }
    await this._fileService.createFile(configFileUri, VSBuffer.fromString(JSON.stringify(normalizedSandboxConfig, null, "	")), { overwrite: true });
    return configFileUri.path;
  }
  // this method merges the default allowWrite paths and allowedDomains with the ones provided in the sandbox config, to ensure that the default necessary paths and domains are always included in the sandbox config used for launching,
  //  even if they are not explicitly specified in the config provided by the user or the MCP server config.
  _withDefaultSandboxConfig(sandboxConfig, launchCwd) {
    const mergedAllowWrite = new Set(sandboxConfig?.filesystem?.allowWrite ?? []);
    for (const defaultAllowWrite of this._getDefaultAllowWrite(launchCwd ? [launchCwd] : void 0)) {
      if (defaultAllowWrite) {
        mergedAllowWrite.add(defaultAllowWrite);
      }
    }
    const mergedAllowedDomains = new Set(sandboxConfig?.network?.allowedDomains ?? []);
    for (const defaultAllowedDomain of this._defaultAllowedDomains) {
      if (defaultAllowedDomain) {
        mergedAllowedDomains.add(defaultAllowedDomain);
      }
    }
    return {
      ...sandboxConfig,
      network: {
        allowedDomains: [...mergedAllowedDomains],
        deniedDomains: sandboxConfig?.network?.deniedDomains ?? []
      },
      filesystem: {
        allowWrite: [...mergedAllowWrite],
        denyRead: sandboxConfig?.filesystem?.denyRead ?? [],
        denyWrite: sandboxConfig?.filesystem?.denyWrite ?? []
      }
    };
  }
  _getDefaultAllowWrite(directories) {
    for (const launchCwd of directories ?? []) {
      const trimmed = launchCwd.trim();
      if (trimmed) {
        this._defaultAllowWritePaths.push(trimmed);
      }
    }
    return this._defaultAllowWritePaths;
  }
  _quoteShellArgument(value2) {
    return `'${value2.replace(/'/g, `'\\''`)}'`;
  }
};

McpSandboxService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IMcpResourceScannerService),
  __decorateParam(4, IRemoteAgentService)
], McpSandboxService);
export { mcpDefaultCwdToFsPath, resolveMcpServerSandboxWorkingDirectory, IMcpSandboxService, McpSandboxService };
