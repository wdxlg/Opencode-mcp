// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/agentHostReadinessContext.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { AgentHostSessionTypesAvailableContext } from "./module-1770.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/agentHostReadinessContext.ts
var AgentHostReadinessContextContribution = class extends Disposable {
  constructor(_sessionsManagementService, contextKeyService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._agentHostSessionTypesAvailable = AgentHostSessionTypesAvailableContext.bindTo(contextKeyService);
    this._register(toDisposable(() => this._agentHostSessionTypesAvailable.reset()));
    this._register(this._sessionsManagementService.onDidChangeSessionTypes(() => this._update()));
    this._update();
  }
  static {
    this.ID = "sessions.contrib.onboardingTours.agentHostReadinessContext";
  }
  _update() {
    this._agentHostSessionTypesAvailable.set(this._sessionsManagementService.getAllProviderSessionTypes().some(({ providerId }) => isAgentHostProviderId(providerId)));
  }
};

AgentHostReadinessContextContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, IContextKeyService)
], AgentHostReadinessContextContribution);

registerWorkbenchContribution2(AgentHostReadinessContextContribution.ID, AgentHostReadinessContextContribution, WorkbenchPhase.BlockRestore);
export { AgentHostReadinessContextContribution };
