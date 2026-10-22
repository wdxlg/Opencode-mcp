// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHost.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { primeLegacyMigrationStartupSnapshot } from "./module-1110.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { AgentHostContribution } from "./module-2897.mjs";
import { CopilotConfigSlashSubmitHandlerContribution } from "./module-2909.mjs";
import { AgentHostSessionListContribution } from "./module-2903.mjs";
import { AgentHostOpenSessionLinkOpenerContribution } from "./module-2899.mjs";
import { AgentHostTerminalContribution } from "./module-2905.mjs";
import { AgentHostCopilotCliSettingsContribution } from "./module-2898.mjs";
import { AgentHostAllowSignedOutWhenUsableContribution } from "./module-2872.mjs";
import { AgentHostSignedOutModelsNotificationContribution } from "./module-2904.mjs";
import { AgentHostSdkSetupNotificationContribution } from "./module-2182.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAgentHostByokLmHandler } from "./module-2869.mjs";
import { AgentHostByokLmHandler } from "./module-2873.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHost.contribution.ts
var AgentHostLegacyMigrationGateContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.agentHostLegacyMigrationGate";
  }
  constructor(configurationService) {
    super();
    primeLegacyMigrationStartupSnapshot(configurationService);
  }
};

AgentHostLegacyMigrationGateContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], AgentHostLegacyMigrationGateContribution);

registerWorkbenchContribution2(AgentHostContribution.ID, AgentHostContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostLegacyMigrationGateContribution.ID, AgentHostLegacyMigrationGateContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(CopilotConfigSlashSubmitHandlerContribution.ID, CopilotConfigSlashSubmitHandlerContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostSessionListContribution.ID, AgentHostSessionListContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostOpenSessionLinkOpenerContribution.ID, AgentHostOpenSessionLinkOpenerContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(AgentHostTerminalContribution.ID, AgentHostTerminalContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostCopilotCliSettingsContribution.ID, AgentHostCopilotCliSettingsContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostAllowSignedOutWhenUsableContribution.ID, AgentHostAllowSignedOutWhenUsableContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostSignedOutModelsNotificationContribution.ID, AgentHostSignedOutModelsNotificationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostSdkSetupNotificationContribution.ID, AgentHostSdkSetupNotificationContribution, WorkbenchPhase.AfterRestored);

registerSingleton(IAgentHostByokLmHandler, AgentHostByokLmHandler, 1 /* Delayed */);
export { AgentHostLegacyMigrationGateContribution };
