// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostCopilotCliSettingsContribution.ts
import { Disposable } from "./module-0012.mjs";
import { AgentHostCopilotModelCapabilityOverridesSettingId, AgentHostCopilotSdkLogLevelSettingId, AgentHostMultiTurnContextRoutingEnabledSettingId, AgentHostOpus48PromptEnabledSettingId, AgentHostReasoningSummaryEnabledSettingId, AgentHostToolSearchDeferThresholdSettingId, AgentHostToolSearchEnabledSettingId, CopilotSubagentModelGuidanceEnabledSettingId, normalizeToolSearchDeferThreshold } from "./module-2104.mjs";
import { isObject } from "./module-0010.mjs";
import { AgentHostRootConfigForwarder } from "./module-2871.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostCopilotCliSettingsContribution.ts
var AgentHostCopilotCliSettingsContribution = class extends Disposable {
  constructor(agentHostService, _configurationService, _agentHostEnablementService) {
    super();
    this._configurationService = _configurationService;
    this._agentHostEnablementService = _agentHostEnablementService;
    const keys = [
      {
        key: "copilotSdkLogLevel" /* CopilotSdkLogLevel */,
        computeValue: () => this._configurationService.getValue(AgentHostCopilotSdkLogLevelSettingId) ?? "info",
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostCopilotSdkLogLevelSettingId)
      },
      {
        key: "opus48Prompt" /* Opus48Prompt */,
        computeValue: () => this._configurationService.getValue(AgentHostOpus48PromptEnabledSettingId) === true,
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostOpus48PromptEnabledSettingId)
      },
      {
        key: "toolSearchEnabled" /* ToolSearchEnabled */,
        computeValue: () => this._configurationService.getValue(AgentHostToolSearchEnabledSettingId) === true,
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostToolSearchEnabledSettingId)
      },
      {
        key: "toolSearchDeferThreshold" /* ToolSearchDeferThreshold */,
        computeValue: () => normalizeToolSearchDeferThreshold(this._configurationService.getValue(AgentHostToolSearchDeferThresholdSettingId)),
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostToolSearchDeferThresholdSettingId)
      },
      {
        key: "reasoningSummary" /* ReasoningSummary */,
        computeValue: () => this._configurationService.getValue(AgentHostReasoningSummaryEnabledSettingId),
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostReasoningSummaryEnabledSettingId)
      },
      {
        key: "multiTurnContextRouting" /* MultiTurnContextRouting */,
        computeValue: () => this._configurationService.getValue(AgentHostMultiTurnContextRoutingEnabledSettingId) === true,
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostMultiTurnContextRoutingEnabledSettingId)
      },
      {
        key: "subagentModelGuidance" /* SubagentModelGuidance */,
        computeValue: () => this._configurationService.getValue(CopilotSubagentModelGuidanceEnabledSettingId) === true,
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, CopilotSubagentModelGuidanceEnabledSettingId)
      },
      {
        key: "modelCapabilityOverrides" /* ModelCapabilityOverrides */,
        computeValue: () => {
          const value2 = this._configurationService.getValue(AgentHostCopilotModelCapabilityOverridesSettingId);
          return isObject(value2) ? value2 : {};
        },
        registerTriggers: (store, push) => this._pushOnSettingChange(store, push, AgentHostCopilotModelCapabilityOverridesSettingId)
      }
    ];
    this._forwarder = this._register(new AgentHostRootConfigForwarder(keys, agentHostService));
    this._register(autorun((reader) => {
      if (this._agentHostEnablementService.enabled.read(reader)) {
        this._forwarder.start();
      } else {
        this._forwarder.stop();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostCopilotCliSettings";
  }
  _pushOnSettingChange(store, push, settingId) {
    store.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(settingId)) {
        push();
      }
    }));
  }
};

AgentHostCopilotCliSettingsContribution = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IAgentHostEnablementService)
], AgentHostCopilotCliSettingsContribution);
export { AgentHostCopilotCliSettingsContribution };
