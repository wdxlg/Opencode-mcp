// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSyncOperationProvider.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { AgentHostSyncOperationHandler } from "./module-0529.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/agentHostSyncOperationProvider.ts
var AgentHostSyncOperationContribution = class extends Disposable {
  constructor(_stateManager, _instantiationService) {
    super();
    this._stateManager = _stateManager;
    this._instantiationService = _instantiationService;
  }
  registerHandlers(registry) {
    this._registry = registry;
    const store = new DisposableStore();
    const getSessionState = (sessionKey) => this._stateManager.getSessionState(sessionKey);
    const handler = this._instantiationService.createInstance(AgentHostSyncOperationHandler, getSessionState, (sessionKey) => this._onSynced(sessionKey));
    store.add(registry.registerChangesetOperationHandler(AgentHostSyncOperationHandler.OPERATION_SYNC, handler));
    store.add({ dispose: () => {
      this._registry = void 0;
    } });
    return store;
  }
  getOperations({ sessionKey, gitState }) {
    const state = this._stateManager.getSessionState(sessionKey);
    if (state?.lifecycle === "creating" /* Creating */ && (gitState?.uncommittedChanges ?? 0) > 0) {
      return void 0;
    }
    if (!gitState?.upstreamBranchName || (gitState?.outgoingChanges ?? 0) === 0) {
      return void 0;
    }
    return [{
      id: AgentHostSyncOperationHandler.OPERATION_SYNC,
      label: localize(2287, null, gitState.outgoingChanges),
      icon: "sync",
      group: "sync",
      scopes: ["changeset" /* Changeset */],
      status: "idle" /* Idle */
    }];
  }
  async _onSynced(sessionKey) {
    this._registry?.onDidChangeOperations(sessionKey);
    await this._registry?.refreshSessionGitState(sessionKey);
  }
};

AgentHostSyncOperationContribution = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IInstantiationService)
], AgentHostSyncOperationContribution);
export { AgentHostSyncOperationContribution };
