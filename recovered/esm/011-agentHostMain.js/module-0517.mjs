// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostDiscardChangesOperationProvider.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { AgentHostDiscardChangesOperationHandler } from "./module-0516.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/agentHostDiscardChangesOperationProvider.ts
var AgentHostDiscardChangesOperationContribution = class extends Disposable {
  constructor(_stateManager, _instantiationService) {
    super();
    this._stateManager = _stateManager;
    this._instantiationService = _instantiationService;
  }
  registerHandlers(registry) {
    const store = new DisposableStore();
    const getSessionState = (sessionKey) => this._stateManager.getSessionState(sessionKey);
    const handler = this._instantiationService.createInstance(AgentHostDiscardChangesOperationHandler, getSessionState);
    store.add(registry.registerChangesetOperationHandler(AgentHostDiscardChangesOperationHandler.OPERATION_DISCARD_CHANGES, handler));
    return store;
  }
  getOperations({ changesetKind, gitState }) {
    if (changesetKind !== "uncommitted" /* Uncommitted */ || (gitState?.uncommittedChanges ?? 0) <= 0) {
      return [];
    }
    return [{
      id: AgentHostDiscardChangesOperationHandler.OPERATION_DISCARD_CHANGES,
      label: localize(2222, null),
      confirmation: localize(2223, null),
      icon: "discard",
      scopes: ["resource" /* Resource */],
      status: "idle" /* Idle */
    }];
  }
};

AgentHostDiscardChangesOperationContribution = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IInstantiationService)
], AgentHostDiscardChangesOperationContribution);
export { AgentHostDiscardChangesOperationContribution };
