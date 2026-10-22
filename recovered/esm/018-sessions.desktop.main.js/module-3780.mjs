// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/policyBlocked/browser/policyBlocked.contribution.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { SessionsPolicyBlockedOverlay } from "./module-3779.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAccountPolicyGateService } from "./module-0958.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/policyBlocked/browser/policyBlocked.contribution.ts
var SessionsPolicyBlockedContribution = class extends Disposable {
  constructor(configurationService, layoutService, instantiationService, gateService, defaultAccountService) {
    super();
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.gateService = gateService;
    this.defaultAccountService = defaultAccountService;
    this.overlayRef = this._register(new MutableDisposable());
    this.update();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.agent.enabled" /* AgentEnabled */)) {
        this.update();
      }
    }));
    this._register(this.gateService.onDidChangeGateInfo(() => this.update()));
  }
  static {
    this.ID = "workbench.contrib.sessionsPolicyBlocked";
  }
  update() {
    const gateInfo = this.gateService.gateInfo;
    const gateForcesAgentDisabled = gateInfo.state === "restricted" /* Restricted */ && gateInfo.reason !== "policyNotResolved" /* PolicyNotResolved */;
    const agentEnabled = this.configurationService.getValue("chat.agent.enabled" /* AgentEnabled */);
    if (agentEnabled === false && !gateForcesAgentDisabled) {
      this.showOverlay({ reason: "agentDisabled" /* AgentDisabled */ });
      return;
    }
    if (gateInfo.state === "restricted" /* Restricted */) {
      if (gateInfo.reason === "noAccount" /* NoAccount */ || gateInfo.reason === "wrongProvider" /* WrongProvider */) {
        this.overlayRef.clear();
        this.currentReason = void 0;
        return;
      }
      if (gateInfo.reason === "policyNotResolved" /* PolicyNotResolved */) {
        this.showOverlay({ reason: "loading" /* Loading */ });
      } else if (gateInfo.reason === "managedSettingsRefresh" /* ManagedSettingsRefresh */) {
        const freshness = gateInfo.managedSettingsFreshness;
        this.showOverlay(freshness?.state === "blocked" /* Blocked */ ? { reason: "managedSettingsRefresh" /* ManagedSettingsRefresh */, freshness } : { reason: "loading" /* Loading */ });
      } else {
        const accountName = this.defaultAccountService.currentDefaultAccount?.accountName;
        this.showOverlay({
          reason: "accountPolicyGate" /* AccountPolicyGate */,
          approvedOrganizations: gateInfo.approvedOrganizations,
          accountName
        });
      }
      return;
    }
    this.overlayRef.clear();
    this.currentReason = void 0;
  }
  showOverlay(options3) {
    if (this.currentReason === options3.reason && options3.reason !== "accountPolicyGate" /* AccountPolicyGate */ && options3.reason !== "managedSettingsRefresh" /* ManagedSettingsRefresh */) {
      return;
    }
    this.overlayRef.clear();
    this.currentReason = options3.reason;
    this.overlayRef.value = this.instantiationService.createInstance(
      SessionsPolicyBlockedOverlay,
      this.layoutService.mainContainer,
      options3
    );
  }
};

SessionsPolicyBlockedContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IAccountPolicyGateService),
  __decorateParam(4, IDefaultAccountService)
], SessionsPolicyBlockedContribution);

registerWorkbenchContribution2(SessionsPolicyBlockedContribution.ID, SessionsPolicyBlockedContribution, WorkbenchPhase.BlockRestore);
export { SessionsPolicyBlockedContribution };
