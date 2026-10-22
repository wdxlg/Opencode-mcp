// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostPullRequestOperationProvider.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { AgentHostPullRequestOperationHandler } from "./module-0525.mjs";
import { AgentHostPullRequestLifecycleOperationHandler } from "./module-0527.mjs";
import { hasSessionPullRequestForBranch, readSessionGitHubState, withMostRecentRelatedSessionPullRequest } from "./module-0047.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { IAgentHostPullRequestStatusService } from "./module-0526.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostPullRequestOperationProvider.ts
var AgentHostPullRequestOperationContribution = class extends Disposable {
  constructor(_stateManager, _instantiationService, _gitStateService, _pullRequestStatusService, _logService) {
    super();
    this._stateManager = _stateManager;
    this._instantiationService = _instantiationService;
    this._gitStateService = _gitStateService;
    this._pullRequestStatusService = _pullRequestStatusService;
    this._logService = _logService;
    /** Last advertised operation ids per session, so only changes are logged. */
    this._lastAdvertisedOperations = /* @__PURE__ */ new Map();
    this._register(this._stateManager.onDidRemoveSession((sessionKey) => this._lastAdvertisedOperations.delete(sessionKey)));
  }
  registerHandlers(registry) {
    this._registry = registry;
    const store = new DisposableStore();
    const getSessionState = (sessionKey) => this._stateManager.getSessionState(sessionKey);
    const resolveBaseBranchName = (sessionKey) => this._gitStateService.resolveSessionBaseBranchName(sessionKey);
    const onCreated = (event) => this._onPullRequestCreated(event);
    const createPrHandler = this._instantiationService.createInstance(AgentHostPullRequestOperationHandler, false, void 0, getSessionState, resolveBaseBranchName, onCreated);
    const createDraftPrHandler = this._instantiationService.createInstance(AgentHostPullRequestOperationHandler, true, void 0, getSessionState, resolveBaseBranchName, onCreated);
    const createAutoMergePrHandler = this._instantiationService.createInstance(AgentHostPullRequestOperationHandler, false, "MERGE", getSessionState, resolveBaseBranchName, onCreated);
    const createAutoSquashPrHandler = this._instantiationService.createInstance(AgentHostPullRequestOperationHandler, false, "SQUASH", getSessionState, resolveBaseBranchName, onCreated);
    const createAutoRebasePrHandler = this._instantiationService.createInstance(AgentHostPullRequestOperationHandler, false, "REBASE", getSessionState, resolveBaseBranchName, onCreated);
    store.add(registry.registerChangesetOperationHandler(AgentHostPullRequestOperationHandler.OPERATION_CREATE_PR, createPrHandler));
    store.add(registry.registerChangesetOperationHandler(AgentHostPullRequestOperationHandler.OPERATION_CREATE_DRAFT_PR, createDraftPrHandler));
    store.add(registry.registerChangesetOperationHandler(AgentHostPullRequestOperationHandler.OPERATION_CREATE_PR_AUTO_MERGE, createAutoMergePrHandler));
    store.add(registry.registerChangesetOperationHandler(AgentHostPullRequestOperationHandler.OPERATION_CREATE_PR_AUTO_SQUASH, createAutoSquashPrHandler));
    store.add(registry.registerChangesetOperationHandler(AgentHostPullRequestOperationHandler.OPERATION_CREATE_PR_AUTO_REBASE, createAutoRebasePrHandler));
    for (const [operationId, action] of [
      [AgentHostPullRequestLifecycleOperationHandler.OPERATION_MARK_READY, "mark-ready"],
      [AgentHostPullRequestLifecycleOperationHandler.OPERATION_MERGE, "merge"],
      [AgentHostPullRequestLifecycleOperationHandler.OPERATION_ENABLE_AUTO_MERGE, "enable-auto-merge"],
      [AgentHostPullRequestLifecycleOperationHandler.OPERATION_DISABLE_AUTO_MERGE, "disable-auto-merge"]
    ]) {
      store.add(registry.registerChangesetOperationHandler(operationId, this._instantiationService.createInstance(AgentHostPullRequestLifecycleOperationHandler, action)));
    }
    store.add(this._pullRequestStatusService.onDidChangePullRequestStatus((sessionKey) => registry.onDidChangeOperations(sessionKey)));
    store.add({ dispose: () => {
      this._registry = void 0;
    } });
    return store;
  }
  getOperations(context) {
    const operations = this._computeOperations(context);
    this._logAdvertisedOperations(context.sessionKey, operations);
    return operations;
  }
  _computeOperations({ sessionKey, gitState, gitHubState }) {
    const state = this._stateManager.getSessionState(sessionKey);
    if (state?.lifecycle === "creating" /* Creating */) {
      return void 0;
    }
    const isFolderSession = state?.config?.values["isolation" /* Isolation */] === "folder";
    if (isFolderSession && gitState?.outgoingChanges && gitState.outgoingChanges > 0) {
      return void 0;
    }
    if (hasSessionPullRequestForBranch(gitHubState, gitState?.branchName)) {
      return this._getPullRequestLifecycleOperations(sessionKey);
    }
    const hasBranchChanges = gitState?.hasBaseBranchChanges ?? (gitState?.outgoingChanges ?? 0) > 0;
    const uncommittedChanges = gitState?.uncommittedChanges ?? 0;
    const hasChanges = hasBranchChanges || uncommittedChanges > 0;
    if (!gitState?.hasGitHubRemote || !hasChanges) {
      return void 0;
    }
    return [
      {
        id: "create-pr",
        label: localize(2272, null),
        icon: "git-pull-request-create",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      },
      {
        id: "create-pr-auto-merge",
        label: localize(2273, null),
        icon: "git-merge",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      },
      {
        id: "create-pr-auto-squash",
        label: localize(2275, null),
        icon: "git-merge",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      },
      {
        id: "create-pr-auto-rebase",
        label: localize(2274, null),
        icon: "git-merge",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      },
      {
        id: "create-draft-pr",
        label: localize(2271, null),
        icon: "git-pull-request-draft",
        group: "pull-request_draft",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      }
    ];
  }
  /**
   * Operations for a branch that already has a pull request.
   *
   * The order matters: the client renders the first operation as the primary
   * button and the rest as dropdown entries, so the state's headline action
   * comes first. Auto-merge is driven purely off GitHub's own capability
   * flags — `viewerCanEnableAutoMerge` is already false for a pull request
   * that can simply be merged — which keeps the three states falling out
   * without duplicating GitHub's rules here.
   *
   * Returns `undefined` while the pull request state has not resolved yet, so
   * the button bar stays hidden rather than flashing the wrong action, and
   * once the pull request is merged or closed, when nothing is left to do.
   */
  _getPullRequestLifecycleOperations(sessionKey) {
    const status = this._pullRequestStatusService.getPullRequestStatus(sessionKey);
    if (!status) {
      this._logService.trace(`[AgentHostPullRequestOperationContribution] No pull request operations: session=${sessionKey}, reason=pull request state has not resolved yet`);
      return void 0;
    }
    if (status.state !== "open") {
      this._logService.trace(`[AgentHostPullRequestOperationContribution] No pull request operations: session=${sessionKey}, reason=pull request is ${status.state}`);
      return void 0;
    }
    const operations = [];
    if (status.draft) {
      operations.push({
        id: AgentHostPullRequestLifecycleOperationHandler.OPERATION_MARK_READY,
        label: localize(2280, null),
        description: localize(2281, null),
        icon: "git-pull-request",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      });
    }
    if (status.mergeReady) {
      operations.push({
        id: AgentHostPullRequestLifecycleOperationHandler.OPERATION_MERGE,
        label: localize(2282, null),
        description: localize(2283, null),
        icon: "git-merge",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      });
    }
    if (status.autoMergeEnabled) {
      operations.push({
        id: AgentHostPullRequestLifecycleOperationHandler.OPERATION_DISABLE_AUTO_MERGE,
        label: localize(2276, null),
        description: localize(2277, null),
        icon: "git-merge",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      });
    } else if (status.viewerCanEnableAutoMerge) {
      operations.push({
        id: AgentHostPullRequestLifecycleOperationHandler.OPERATION_ENABLE_AUTO_MERGE,
        label: localize(2278, null),
        description: localize(2279, null),
        icon: "git-merge",
        group: "pull-request",
        scopes: ["changeset" /* Changeset */],
        status: "idle" /* Idle */
      });
    }
    if (operations.length === 0) {
      this._logService.trace(`[AgentHostPullRequestOperationContribution] No pull request operations: session=${sessionKey}, reason=the pull request is open but is not draft, not mergeable, and auto-merge is unavailable`);
      return void 0;
    }
    return operations;
  }
  /**
   * Logs the advertised operations whenever the set changes for a session.
   * `getOperations` is recomputed on every git/GitHub state change and once
   * per changeset, so only transitions are logged — the steady state would
   * otherwise drown out everything else.
   */
  _logAdvertisedOperations(sessionKey, operations) {
    const advertised = operations?.map((operation) => operation.id).join(", ") ?? "none";
    if (this._lastAdvertisedOperations.get(sessionKey) === advertised) {
      return;
    }
    this._lastAdvertisedOperations.set(sessionKey, advertised);
    const primary = operations?.[0]?.id ?? "none";
    this._logService.info(`[AgentHostPullRequestOperationContribution] Advertised operations changed: session=${sessionKey}, primary=${primary}, operations=[${advertised}]`);
  }
  _onPullRequestCreated(event) {
    const sessionKey = event.sessionKey;
    this._registry?.onDidChangeOperations(sessionKey);
    this._registry?.refreshSessionGitState(sessionKey);
    const gitHubState = readSessionGitHubState(this._stateManager.getSessionState(sessionKey)?._meta);
    this._gitStateService.setSessionGitHubState(sessionKey, withMostRecentRelatedSessionPullRequest(gitHubState, event.pullRequestUrl, event.branchName));
  }
};

AgentHostPullRequestOperationContribution = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAgentHostGitStateService),
  __decorateParam(3, IAgentHostPullRequestStatusService),
  __decorateParam(4, ILogService)
], AgentHostPullRequestOperationContribution);
export { AgentHostPullRequestOperationContribution };
