// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeAgentSdkService.ts
import { AgentHostClaudeSdkRootEnvVar } from "./module-0049.mjs";
import { createDecorator } from "./module-0044.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { join } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentSdkDownloader } from "./module-0312.mjs";


// src/vs/platform/agentHost/node/claude/claudeAgentSdkService.ts
import { pathToFileURL as pathToFileURL2 } from "url";

var ClaudeSdkPackage = {
  id: "claude",
  displayName: "Claude",
  devOverrideEnvVar: AgentHostClaudeSdkRootEnvVar,
  hasSeparateMuslLinuxPackage: true
};

var ClaudeDisablePrecompactSkipEnvVar = "CLAUDE_CODE_DISABLE_PRECOMPACT_SKIP";

var IClaudeAgentSdkService = createDecorator("claudeAgentSdkService");

var ClaudeAgentSdkService = class {
  constructor(_logService, _downloader) {
    this._logService = _logService;
    this._downloader = _downloader;
    /**
     * Latched once we've logged a load failure, so a corrupt postinstall
     * doesn't flood `error` events on every `listSessions()` call.
     */
    this._firstLoadFailureLogged = false;
    if (process.env[ClaudeDisablePrecompactSkipEnvVar] === void 0) {
      process.env[ClaudeDisablePrecompactSkipEnvVar] = "1";
    }
  }
  async listSessions() {
    const sdk = await this._getSdk();
    return sdk.listSessions(void 0);
  }
  async canLoadWithoutDownload() {
    if (process.env[AgentHostClaudeSdkRootEnvVar] || !this._downloader.isAvailable(ClaudeSdkPackage)) {
      return true;
    }
    return this._downloader.isSdkResolvableWithoutDownload(ClaudeSdkPackage);
  }
  async ensureAvailable() {
    if (!await this.canLoadWithoutDownload()) {
      await this._downloader.loadSdkRoot(ClaudeSdkPackage, CancellationToken.None);
    }
  }
  async getSessionInfo(sessionId) {
    const sdk = await this._getSdk();
    return sdk.getSessionInfo(sessionId);
  }
  async startup(params) {
    const sdk = await this._getSdk();
    return sdk.startup(params);
  }
  async query(params) {
    const sdk = await this._getSdk();
    return sdk.query(params);
  }
  async getSessionMessages(sessionId, options) {
    const sdk = await this._getSdk();
    return sdk.getSessionMessages(sessionId, options);
  }
  async listSubagents(sessionId, options) {
    const sdk = await this._getSdk();
    return sdk.listSubagents(sessionId, options);
  }
  async getSubagentMessages(sessionId, agentId, options) {
    const sdk = await this._getSdk();
    return sdk.getSubagentMessages(sessionId, agentId, options);
  }
  async forkSession(sessionId, options) {
    const sdk = await this._getSdk();
    return sdk.forkSession(sessionId, options);
  }
  async deleteSession(sessionId, options) {
    const sdk = await this._getSdk();
    return sdk.deleteSession(sessionId, options);
  }
  async createSdkMcpServer(options) {
    const sdk = await this._getSdk();
    return sdk.createSdkMcpServer(options);
  }
  async tool(name, description, inputSchema, handler) {
    const sdk = await this._getSdk();
    return sdk.tool(name, description, inputSchema, handler);
  }
  async _getSdk() {
    if (this._sdkModule) {
      return this._sdkModule;
    }
    try {
      this._sdkModule = await this._loadSdk();
      return this._sdkModule;
    } catch (err) {
      if (!this._firstLoadFailureLogged) {
        this._firstLoadFailureLogged = true;
        this._logService.error("[Claude] Failed to load @anthropic-ai/claude-agent-sdk", err);
      }
      throw err;
    }
  }
  async _loadSdk() {
    const override = process.env[AgentHostClaudeSdkRootEnvVar];
    if (override) {
      const entry = join(override, "node_modules", "@anthropic-ai", "claude-agent-sdk", "sdk.mjs");
      return import(pathToFileURL2(entry).href);
    }
    if (this._downloader.isAvailable(ClaudeSdkPackage)) {
      const root = await this._downloader.loadSdkRoot(ClaudeSdkPackage, CancellationToken.None);
      const entry = join(root, "node_modules", "@anthropic-ai", "claude-agent-sdk", "sdk.mjs");
      return import(pathToFileURL2(entry).href);
    }
    return import("@anthropic-ai/claude-agent-sdk");
  }
};

ClaudeAgentSdkService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IAgentSdkDownloader)
], ClaudeAgentSdkService);
export { pathToFileURL2, ClaudeSdkPackage, ClaudeDisablePrecompactSkipEnvVar, IClaudeAgentSdkService, ClaudeAgentSdkService };
