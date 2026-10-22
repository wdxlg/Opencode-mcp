// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostMergeOperationProvider.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { AgentHostMergeOperationHandler } from "./module-0522.mjs";
import { resolveDiffBaseBranchName } from "./module-0162.mjs";
import { hasSessionPullRequestForBranch } from "./module-0047.mjs";
import { localize } from "./module-0012.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";


// src/vs/platform/agentHost/node/agentHostMergeOperationProvider.ts
var AgentHostMergeOperationContribution = class extends Disposable {
  constructor(_stateManager, _instantiationService, _gitStateService) {
    super();
    this._stateManager = _stateManager;
    this._instantiationService = _instantiationService;
    this._gitStateService = _gitStateService;
  }
  registerHandlers(registry) {
    this._registry = registry;
    const store = new DisposableStore();
    const handler = this._instantiationService.createInstance(
      AgentHostMergeOperationHandler,
      (sessionKey) => this._stateManager.getSessionState(sessionKey),
      (sessionKey) => this._gitStateService.resolveSessionBaseBranchName(sessionKey),
      (sessionKey) => this._onGitStateChanged(sessionKey),
      (sessionKey, commit) => this._gitStateService.recordSessionMerge(sessionKey, commit)
    );
    store.add(registry.registerChangesetOperationHandler(AgentHostMergeOperationHandler.OPERATION_MERGE, handler));
    store.add({ dispose: () => {
      this._registry = void 0;
    } });
    return store;
  }
  getOperations({ sessionKey, changesetKind, gitState, gitHubState }) {
    const state = this._stateManager.getSessionState(sessionKey);
    if (changesetKind !== "branch" /* Branch */ || state?.lifecycle !== "ready" /* Ready */ || !this._isWorktreeSession(state)) {
      return void 0;
    }
    const branchName = gitState?.branchName;
    const configuredBaseBranch = state.config?.values["isolation" /* Isolation */] === "worktree" ? state.config.values["branch" /* Branch */] : void 0;
    const baseBranchName = typeof configuredBaseBranch === "string" && configuredBaseBranch.trim() ? resolveDiffBaseBranchName(configuredBaseBranch.trim(), void 0) : resolveDiffBaseBranchName(void 0, gitState?.baseBranchName);
    if (!branchName || !baseBranchName || branchName === baseBranchName || hasSessionPullRequestForBranch(gitHubState, branchName)) {
      return void 0;
    }
    const hasBranchChanges = gitState?.hasBaseBranchChanges ?? (gitState?.outgoingChanges ?? 0) > 0;
    const uncommittedChanges = gitState?.uncommittedChanges ?? 0;
    if (!hasBranchChanges && uncommittedChanges === 0) {
      return void 0;
    }
    return [{
      id: AgentHostMergeOperationHandler.OPERATION_MERGE,
      label: localize(2241, null),
      description: localize(2243, null, branchName, baseBranchName),
      confirmation: localize(2242, null),
      icon: "git-merge",
      group: "merge",
      scopes: ["changeset" /* Changeset */],
      status: "idle" /* Idle */
    }];
  }
  _isWorktreeSession(state) {
    if (!state) {
      return false;
    }
    if (state.config?.values["isolation" /* Isolation */] === "worktree") {
      return true;
    }
    const workingDirectory = state.workingDirectories?.[0];
    const project = state.project?.uri;
    return !!workingDirectory && !!project && !isEqual2(URI.parse(workingDirectory), URI.parse(project));
  }
  async _onGitStateChanged(sessionKey) {
    this._registry?.onDidChangeOperations(sessionKey);
    await this._registry?.refreshSessionGitState(sessionKey);
  }
};

AgentHostMergeOperationContribution = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAgentHostGitStateService)
], AgentHostMergeOperationContribution);
export { AgentHostMergeOperationContribution };
