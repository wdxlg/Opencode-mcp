// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automations.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IAutomationStorageService } from "./module-3680.mjs";
import { BrowserAutomationStorageService } from "./module-3790.mjs";
import { IAutomationService } from "./module-2218.mjs";
import { ProviderAutomationService } from "./module-3787.mjs";
import { IAutomationRunner } from "./module-2636.mjs";
import { AutomationRunner } from "./module-3784.mjs";
import { IAutomationDialogService } from "./module-2637.mjs";
import { AutomationDialogService } from "./module-3783.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AutomationScheduler } from "./module-3786.mjs";
import { AutomationToolsContribution } from "./module-3791.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING, CHAT_AUTOMATIONS_RUN_TIMEOUT_MINUTES_SETTING, ChatAutomationsEnabledContext, DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES } from "./module-2638.mjs";
import { localize } from "./module-0001.mjs";
import { product_default } from "./module-0139.mjs";
import { AGENT_HOST_AUTOMATIONS_ENABLED_CONFIG_KEY, AGENT_HOST_AUTOMATION_RUN_TIMEOUT_MINUTES_CONFIG_KEY } from "./module-3677.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/sessions/contrib/automations/browser/automations.contribution.ts
registerSingleton(IAutomationStorageService, BrowserAutomationStorageService, 1 /* Delayed */);

registerSingleton(IAutomationService, ProviderAutomationService, 1 /* Delayed */);

registerSingleton(IAutomationRunner, AutomationRunner, 1 /* Delayed */);

registerSingleton(IAutomationDialogService, AutomationDialogService, 1 /* Delayed */);

registerWorkbenchContribution2(AutomationScheduler.ID, AutomationScheduler, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(AutomationToolsContribution.ID, AutomationToolsContribution, WorkbenchPhase.Eventually);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "chat",
  properties: {
    [CHAT_AUTOMATIONS_ENABLED_SETTING]: {
      type: "boolean",
      default: false,
      scope: 2 /* MACHINE */,
      tags: ["experimental", "advanced"],
      description: localize(4202, null),
      included: product_default.quality !== "stable",
      experiment: { mode: "auto" },
      agentHost: { key: AGENT_HOST_AUTOMATIONS_ENABLED_CONFIG_KEY }
    },
    [CHAT_AUTOMATIONS_RUN_TIMEOUT_MINUTES_SETTING]: {
      type: "number",
      default: DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES,
      minimum: 1,
      scope: 2 /* MACHINE */,
      tags: ["experimental", "advanced"],
      description: localize(4203, null),
      included: product_default.quality !== "stable",
      agentHost: { key: AGENT_HOST_AUTOMATION_RUN_TIMEOUT_MINUTES_CONFIG_KEY }
    }
  }
});

var ChatAutomationsEnabledContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chatAutomationsEnabledContext";
  }
  constructor(configurationService, contextKeyService) {
    super();
    const key3 = ChatAutomationsEnabledContext.bindTo(contextKeyService);
    const update = () => key3.set(configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true);
    update();
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(CHAT_AUTOMATIONS_ENABLED_SETTING)) {
        update();
      }
    }));
  }
};

ChatAutomationsEnabledContextContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextKeyService)
], ChatAutomationsEnabledContextContribution);

registerWorkbenchContribution2(ChatAutomationsEnabledContextContribution.ID, ChatAutomationsEnabledContextContribution, WorkbenchPhase.BlockStartup);
export { ChatAutomationsEnabledContextContribution };
