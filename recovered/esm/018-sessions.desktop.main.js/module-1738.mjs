// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/agentHostEnablementService.ts
import { Disposable } from "./module-0012.mjs";
import { bindContextKey, observableConfigValue } from "./module-0444.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { derived } from "./module-0054.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY, IAgentHostEnablementService } from "./module-0964.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { COPILOT_SANDBOX_ENABLED_KEY, IManagedSettingsService } from "./module-0956.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/agentHost/browser/agentHostEnablementService.ts
var AgentHostEnablementService = class extends Disposable {
  constructor(_isAgentHostRuntimeAvailable, configurationService, contextKeyService, managedSettingsService) {
    super();
    this._isAgentHostRuntimeAvailable = _isAgentHostRuntimeAvailable;
    const aiFeaturesDisabled = observableConfigValue(ChatAIDisabledSettingId, false, configurationService);
    this.enabled = derived(this, (reader) => this._isAgentHostRuntimeAvailable && !aiFeaturesDisabled.read(reader));
    this._register(bindContextKey(AGENT_HOST_ENABLED_CONTEXT_KEY, contextKeyService, (reader) => this.enabled.read(reader)));
    this.managedSandboxEnforced = observableFromEvent(
      this,
      managedSettingsService.onDidChangeManagedSettings,
      () => managedSettingsService.getManagedSettingValue(COPILOT_SANDBOX_ENABLED_KEY) === true
    );
  }
};

var BrowserAgentHostEnablementService = class extends AgentHostEnablementService {
  constructor(configurationService, contextKeyService, managedSettingsService) {
    super(!isWeb, configurationService, contextKeyService, managedSettingsService);
  }
};

BrowserAgentHostEnablementService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IManagedSettingsService)
], BrowserAgentHostEnablementService);

registerSingleton(IAgentHostEnablementService, BrowserAgentHostEnablementService, 0 /* Eager */);
export { AgentHostEnablementService, BrowserAgentHostEnablementService };
