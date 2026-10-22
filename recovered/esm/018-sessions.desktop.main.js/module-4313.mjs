// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostAllowSignedOutWhenUsableContribution.ts
import { Disposable } from "./module-0012.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId, IAgentHostService } from "./module-1108.mjs";
import { Event2 } from "./module-0017.mjs";
import { AgentHostRootConfigForwarder } from "./module-4311.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostAllowSignedOutWhenUsableContribution.ts
var AgentHostAllowSignedOutWhenUsableContribution = class extends Disposable {
  constructor(agentHostService, _configurationService, _agentHostEnablementService) {
    super();
    this._configurationService = _configurationService;
    this._agentHostEnablementService = _agentHostEnablementService;
    const keys = [
      {
        key: "allowSignedOutWhenUsable" /* AllowSignedOutWhenUsable */,
        computeValue: () => this._configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true,
        registerTriggers: (store, push) => {
          const optInChanged = Event2.filter(this._configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration(AgentHostAllowSignedOutWhenUsableSettingId), store);
          store.add(optInChanged(() => push()));
        }
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
    this.ID = "workbench.contrib.agentHostAllowSignedOutWhenUsable";
  }
};

AgentHostAllowSignedOutWhenUsableContribution = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IAgentHostEnablementService)
], AgentHostAllowSignedOutWhenUsableContribution);
export { AgentHostAllowSignedOutWhenUsableContribution };
