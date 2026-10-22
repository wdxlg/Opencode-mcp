// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostCommitOperationProvider.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { AgentHostCommitOperationHandler } from "./module-0514.mjs";
import { hasSessionPullRequestForBranch } from "./module-0047.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/agentHostCommitOperationProvider.ts
var AgentHostCommitOperationContribution = class extends Disposable {
  constructor(_stateManager, _instantiationService) {
    super();
    this._stateManager = _stateManager;
    this._instantiationService = _instantiationService;
  }
  registerHandlers(registry) {
    this._registry = registry;
    const store = new DisposableStore();
    const getSessionState = (sessionKey) => this._stateManager.getSessionState(sessionKey);
    const handler = this._instantiationService.createInstance(AgentHostCommitOperationHandler, getSessionState, (sessionKey) => this._onCommitted(sessionKey));
    store.add(registry.registerChangesetOperationHandler(AgentHostCommitOperationHandler.OPERATION_COMMIT, handler));
    store.add({ dispose: () => {
      this._registry = void 0;
    } });
    return store;
  }
  getOperations({ sessionKey, changesetKind, gitHubState, gitState }) {
    if ((gitState?.uncommittedChanges ?? 0) <= 0) {
      return [];
    }
    const isFolderSession = this._stateManager.getSessionState(sessionKey)?.config?.values["isolation" /* Isolation */] === "folder";
    if (!isFolderSession && !hasSessionPullRequestForBranch(gitHubState, gitState?.branchName) && changesetKind !== "uncommitted" /* Uncommitted */) {
      return [];
    }
    return [{
      id: AgentHostCommitOperationHandler.OPERATION_COMMIT,
      label: localize(2219, null),
      icon: "git-commit",
      group: "commit",
      scopes: ["changeset" /* Changeset */],
      status: "idle" /* Idle */
    }];
  }
  async _onCommitted(sessionKey) {
    this._registry?.onDidChangeOperations(sessionKey);
    await this._registry?.refreshSessionGitState(sessionKey);
  }
};

AgentHostCommitOperationContribution = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IInstantiationService)
], AgentHostCommitOperationContribution);
export { AgentHostCommitOperationContribution };
