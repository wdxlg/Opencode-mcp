// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpMigration.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { parse12 } from "./module-2175.mjs";
import { isObject } from "./module-0010.mjs";
import { mcpConfigurationSection } from "./module-1420.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchMcpManagementService } from "./module-1204.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IJSONEditingService } from "./module-1584.mjs";
import { ILogService } from "./module-0095.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpMigration.ts
var McpConfigMigrationContribution = class extends Disposable {
  constructor(mcpManagementService, userDataProfileService, fileService, remoteAgentService, jsonEditingService, logService, notificationService, commandService) {
    super();
    this.mcpManagementService = mcpManagementService;
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.remoteAgentService = remoteAgentService;
    this.jsonEditingService = jsonEditingService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.commandService = commandService;
    this.migrateMcpConfig();
  }
  static {
    this.ID = "workbench.mcp.config.migration";
  }
  async migrateMcpConfig() {
    try {
      const userMcpConfig = await this.parseMcpConfig(this.userDataProfileService.currentProfile.settingsResource);
      if (userMcpConfig && userMcpConfig.servers && Object.keys(userMcpConfig.servers).length > 0) {
        await Promise.all(Object.entries(userMcpConfig.servers).map(([name, config], index2) => this.mcpManagementService.install({ name, config, inputs: index2 === 0 ? userMcpConfig.inputs : void 0 })));
        await this.removeMcpConfig(this.userDataProfileService.currentProfile.settingsResource);
      }
    } catch (error) {
      this.logService.error(`MCP migration: Failed to migrate user MCP config`, error);
    }
    this.watchForMcpConfiguration(this.userDataProfileService.currentProfile.settingsResource, false);
    const remoteEnvironment = await this.remoteAgentService.getEnvironment();
    if (remoteEnvironment) {
      try {
        const userRemoteMcpConfig = await this.parseMcpConfig(remoteEnvironment.settingsPath);
        if (userRemoteMcpConfig && userRemoteMcpConfig.servers && Object.keys(userRemoteMcpConfig.servers).length > 0) {
          await Promise.all(Object.entries(userRemoteMcpConfig.servers).map(([name, config], index2) => this.mcpManagementService.install({ name, config, inputs: index2 === 0 ? userRemoteMcpConfig.inputs : void 0 }, { target: 4 /* USER_REMOTE */ })));
          await this.removeMcpConfig(remoteEnvironment.settingsPath);
        }
      } catch (error) {
        this.logService.error(`MCP migration: Failed to migrate remote MCP config`, error);
      }
      this.watchForMcpConfiguration(remoteEnvironment.settingsPath, true);
    }
  }
  watchForMcpConfiguration(file, isRemote) {
    this._register(this.fileService.watch(file));
    this._register(this.fileService.onDidFilesChange((e4) => {
      if (e4.contains(file)) {
        this.checkForMcpConfigInFile(file, isRemote);
      }
    }));
  }
  async checkForMcpConfigInFile(settingsFile, isRemote) {
    try {
      const mcpConfig = await this.parseMcpConfig(settingsFile);
      if (mcpConfig && mcpConfig.servers && Object.keys(mcpConfig.servers).length > 0) {
        this.showMcpConfigErrorNotification(isRemote);
      }
    } catch (error) {
    }
  }
  showMcpConfigErrorNotification(isRemote) {
    const message = isRemote ? localize(16975, null) : localize(16977, null);
    const openConfigLabel = isRemote ? localize(16973, null) : localize(16974, null);
    const commandId = isRemote ? "workbench.mcp.openRemoteUserMcpJson" /* OpenRemoteUserMcp */ : "workbench.mcp.openUserMcpJson" /* OpenUserMcp */;
    this.notificationService.prompt(
      Severity2.Error,
      message,
      [{
        label: localize(16976, null),
        run: async () => {
          await this.migrateMcpConfig();
          await this.commandService.executeCommand(commandId);
        }
      }, {
        label: openConfigLabel,
        keepOpen: true,
        run: () => this.commandService.executeCommand(commandId)
      }]
    );
  }
  async parseMcpConfig(settingsFile) {
    try {
      const content = await this.fileService.readFile(settingsFile);
      const settingsObject = parse12(content.value.toString());
      if (!isObject(settingsObject)) {
        return void 0;
      }
      const mcpConfiguration = settingsObject[mcpConfigurationSection];
      if (mcpConfiguration && mcpConfiguration.servers) {
        for (const [, config] of Object.entries(mcpConfiguration.servers)) {
          if (config.type === void 0) {
            config.type = config.command ? "stdio" /* LOCAL */ : "http" /* REMOTE */;
          }
        }
      }
      return mcpConfiguration;
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.warn(`MCP migration: Failed to parse MCP config from ${settingsFile}:`, error);
      }
      return;
    }
  }
  async removeMcpConfig(settingsFile) {
    try {
      await this.jsonEditingService.write(settingsFile, [
        {
          path: [mcpConfigurationSection],
          value: void 0
        }
      ], true);
    } catch (error) {
      this.logService.warn(`MCP migration: Failed to remove MCP config from ${settingsFile}:`, error);
    }
  }
};

McpConfigMigrationContribution = __decorateClass([
  __decorateParam(0, IWorkbenchMcpManagementService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IRemoteAgentService),
  __decorateParam(4, IJSONEditingService),
  __decorateParam(5, ILogService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, ICommandService)
], McpConfigMigrationContribution);
export { McpConfigMigrationContribution };
