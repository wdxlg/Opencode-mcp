// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/codexCustomizationSettings.contribution.ts
import { aiCustomizationManagementSectionRegistry } from "./module-2623.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { SessionType } from "./module-0961.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { derived } from "./module-0054.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { AHPAgentSettingsWidget } from "./module-4318.mjs";
import { CODEX_AGENT_PROVIDER_ID } from "./module-1107.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/codexCustomizationSettings.contribution.ts
aiCustomizationManagementSectionRegistry.register({
  id: AICustomizationManagementSection.HarnessSettings,
  label: localize(5021, null),
  icon: Codicon.openai,
  description: localize(5020, null),
  supportsHarness: (harnessId) => harnessId === SessionType.AgentHostCodex,
  create: (instantiationService, container2) => instantiationService.invokeFunction((accessor) => {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const target = derived((reader) => {
      const providerId = sessionsService.activeSession.read(reader)?.providerId;
      const provider = providerId ? sessionsProvidersService.getProvider(providerId) : void 0;
      if (!provider || !isAgentHostProvider(provider)) {
        return void 0;
      }
      return {
        onDidChange: provider.onDidChangeRootConfig,
        getState: () => provider.getRootState(),
        setValue: (key3, value2) => provider.setRootConfigValue(key3, value2),
        mapResource: (resource) => provider.mapAgentHostResource(resource)
      };
    });
    return instantiationService.createInstance(AHPAgentSettingsWidget, container2, CODEX_AGENT_PROVIDER_ID, target);
  })
});
export {};
