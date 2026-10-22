// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/mcp/common/allowedMcpServersService.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { mcpAccessConfig, mcpAllowedServersConfig, mcpDeniedServersConfig } from "./module-0282.mjs";
import { COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG } from "./module-0290.mjs";
import { MarkdownString, createCommandUri } from "./module-0115.mjs";
import { localize } from "./module-0007.mjs";
import { checkMcpServerAllowed, getMcpServerMatchers } from "./module-0289.mjs";
import { hasKey } from "./module-0006.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";


// src/vs/platform/mcp/common/allowedMcpServersService.ts
var AllowedMcpServersService = class extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this._onDidChangeAllowedMcpServers = this._register(new Emitter());
    this.onDidChangeAllowedMcpServers = this._onDidChangeAllowedMcpServers.event;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpAccessConfig) || e.affectsConfiguration(mcpAllowedServersConfig) || e.affectsConfiguration(mcpDeniedServersConfig) || e.affectsConfiguration(COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG)) {
        this._onDidChangeAllowedMcpServers.fire();
      }
    }));
  }
  isAllowed(mcpServer) {
    return this.isServerAllowed(this.toIdentity(mcpServer));
  }
  isServerAllowed(identity2) {
    if (this.configurationService.getValue(mcpAccessConfig) === "none" /* None */) {
      const settingsCommandLink = createCommandUri("workbench.action.openSettings", { query: `@id:${mcpAccessConfig}` }).toString();
      return new MarkdownString(localize(3115, null, settingsCommandLink));
    }
    const managedOnly = this.configurationService.getValue(COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG) === true;
    const allowlist = managedOnly ? getMcpServerMatchers(this.configurationService.inspect(mcpAllowedServersConfig).policyValue) ?? [] : getMcpServerMatchers(this.configurationService.getValue(mcpAllowedServersConfig));
    const denylist = managedOnly ? this.getAllConfiguredMatchers(mcpDeniedServersConfig) : getMcpServerMatchers(this.configurationService.getValue(mcpDeniedServersConfig));
    switch (checkMcpServerAllowed(allowlist, denylist, identity2)) {
      case 1 /* Denied */:
        return new MarkdownString(localize(3113, null));
      case 2 /* NotAllowed */:
        return new MarkdownString(localize(3114, null));
    }
    return true;
  }
  getAllConfiguredMatchers(key) {
    const inspected = this.configurationService.inspect(key);
    return [
      inspected.applicationValue,
      inspected.userValue,
      inspected.userLocalValue,
      inspected.userRemoteValue,
      inspected.workspaceValue,
      inspected.workspaceFolderValue,
      inspected.memoryValue,
      inspected.policyValue
    ].flatMap((value) => getMcpServerMatchers(value) ?? []);
  }
  toIdentity(mcpServer) {
    if (hasKey(mcpServer, { config: true })) {
      const config = mcpServer.config;
      if (config.type === "http" /* REMOTE */) {
        return { name: mcpServer.name, url: config.url };
      }
      return { name: mcpServer.name, command: [config.command, ...config.args ?? []] };
    }
    return { name: mcpServer.name, url: mcpServer.configuration.remotes?.[0]?.url };
  }
};

AllowedMcpServersService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], AllowedMcpServersService);
export { AllowedMcpServersService };
