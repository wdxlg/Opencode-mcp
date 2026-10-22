// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/codexCustomizationSettings.contribution.ts
import { aiCustomizationManagementSectionRegistry } from "./module-2648.mjs";
import { AICustomizationManagementSection } from "./module-0995.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { SessionType } from "./module-0960.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { observableValue } from "./module-0048.mjs";
import { AHPAgentSettingsWidget } from "./module-4101.mjs";
import { CODEX_AGENT_PROVIDER_ID } from "./module-1106.mjs";


// src/vs/workbench/contrib/chat/electron-browser/codexCustomizationSettings.contribution.ts
aiCustomizationManagementSectionRegistry.register({
  id: AICustomizationManagementSection.HarnessSettings,
  label: localize(13610, null),
  icon: Codicon.openai,
  description: localize(13609, null),
  supportsHarness: (harnessId) => harnessId === SessionType.AgentHostCodex,
  create: (instantiationService, container3) => instantiationService.invokeFunction((accessor) => {
    const agentHostService = accessor.get(IAgentHostService);
    const settingsTarget = {
      onDidChange: agentHostService.rootState.onDidChange,
      getState: () => agentHostService.rootState.value instanceof Error ? void 0 : agentHostService.rootState.value,
      setValue: async (key3, value2) => agentHostService.dispatch("ahp-root://", { type: "root/configChanged" /* RootConfigChanged */, config: { [key3]: value2 } }),
      mapResource: (resource) => resource
    };
    const target = observableValue("codexSettings.target", settingsTarget);
    return instantiationService.createInstance(AHPAgentSettingsWidget, container3, CODEX_AGENT_PROVIDER_ID, target);
  })
});
export {};
