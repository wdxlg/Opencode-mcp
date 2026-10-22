// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/agentHostSandboxEngine.ts
import { Event } from "./module-0016.mjs";
import { OS } from "./module-0013.mjs";
import { dirname } from "./module-0018.mjs";
import { FileAccess } from "./module-0024.mjs";
import { getAppNodeModulesDirName } from "./module-0222.mjs";
import { URI } from "./module-0023.mjs";
import { sandboxConfigSchema, sandboxSettingIdToAgentHostKey } from "./module-0117.mjs";
import { TerminalSandboxEngine } from "./module-0221.mjs";


// src/vs/platform/agentHost/node/copilot/agentHostSandboxEngine.ts
import { createHash } from "crypto";


// src/vs/platform/agentHost/node/copilot/agentHostSandboxEngine.ts
var SANDBOX_TEMP_DIR_NAME = "tmp";

var AgentHostTerminalSandboxHost = class {
  constructor(_sessionId, _workingDirectory, _environmentService, _productService, _agentConfigurationService, sandboxHelper) {
    this._sessionId = _sessionId;
    this._workingDirectory = _workingDirectory;
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._agentConfigurationService = _agentConfigurationService;
    this.onDidChangeRoots = Event.None;
    this._sandboxHelper = sandboxHelper;
    this.onDidChangeSandboxSettings = this._agentConfigurationService.onDidRootConfigChange;
  }
  async getOS() {
    return OS;
  }
  async getRuntimeInfo() {
    const appRoot = dirname(FileAccess.asFileUri("").path);
    const runAsNode = !!process.versions["electron"];
    const nativeModulesDir = getAppNodeModulesDirName();
    return { appRoot, execPath: process.execPath, runAsNode, nativeModulesDir };
  }
  async getUserHome() {
    return this._environmentService.userHome;
  }
  async getSandboxTempDir() {
    const userHome = this._environmentService.userHome;
    if (!userHome) {
      return void 0;
    }
    const sandboxRoot = URI.joinPath(userHome, this._productService.dataFolderName, SANDBOX_TEMP_DIR_NAME);
    const digest = createHash("sha256").update(this._sessionId).digest("hex");
    const sessionLeaf = `agenthost_${digest.substring(0, 16)}`;
    return URI.joinPath(sandboxRoot, sessionLeaf);
  }
  async getWorkspaceStorageReadRoot() {
    return void 0;
  }
  getWriteRoots() {
    return this._workingDirectory ? [this._workingDirectory] : [];
  }
  async checkSandboxDependencies() {
    return this._sandboxHelper.checkSandboxDependencies();
  }
  async getWindowsMxcFilesystemPolicy() {
    return this._sandboxHelper.getWindowsMxcFilesystemPolicy();
  }
  async getWindowsMxcEnvironment() {
    return this._sandboxHelper.getWindowsMxcEnvironment();
  }
  async buildWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment) {
    return this._sandboxHelper.buildWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment);
  }
  getSandboxSetting(settingId) {
    const innerKey = sandboxSettingIdToAgentHostKey[settingId];
    if (innerKey === void 0) {
      return void 0;
    }
    const sandbox = this._agentConfigurationService.getRootValue(sandboxConfigSchema, "sandbox" /* Sandbox */);
    return sandbox?.[innerKey];
  }
};

function createAgentHostSandboxEngine(instantiationService, environmentService, productService, agentConfigurationService, sandboxHelper, sessionId, workingDirectory) {
  const host = new AgentHostTerminalSandboxHost(sessionId, workingDirectory, environmentService, productService, agentConfigurationService, sandboxHelper);
  return instantiationService.createInstance(TerminalSandboxEngine, host);
}
export { createAgentHostSandboxEngine, createHash, SANDBOX_TEMP_DIR_NAME, AgentHostTerminalSandboxHost };
