// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostMergeOperationHandler.ts
import { AGENT_HOST_MERGE_CHANGESET_OPERATION_ID } from "./module-0443.mjs";
import { parseChangesetUri } from "./module-0097.mjs";
import { AHP_SESSION_NOT_FOUND, ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { URI } from "./module-0023.mjs";
import { IAgentHostGitService, tryResolvePrimaryWorktreeRoot } from "./module-0162.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { localize } from "./module-0012.mjs";
import { hasSessionPullRequestForBranch, readSessionGitHubState, readSessionGitState } from "./module-0047.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostMergeOperationHandler.ts
var AgentHostMergeOperationHandler = class {
  constructor(_getSessionState, _resolveBaseBranchName, _onGitStateChanged, _onMerged, _gitService, _logService) {
    this._getSessionState = _getSessionState;
    this._resolveBaseBranchName = _resolveBaseBranchName;
    this._onGitStateChanged = _onGitStateChanged;
    this._onMerged = _onMerged;
    this._gitService = _gitService;
    this._logService = _logService;
  }
  static {
    this.OPERATION_MERGE = AGENT_HOST_MERGE_CHANGESET_OPERATION_ID;
  }
  async invoke(params, token) {
    const parsed = parseChangesetUri(params.channel);
    if (!parsed) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Not a changeset URI: ${params.channel}`);
    }
    this._throwIfCancelled(token);
    const sessionUri = parsed.sessionUri;
    const sessionState = this._getSessionState(sessionUri);
    if (!sessionState) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session not found: ${sessionUri}`);
    }
    const workingDirectoryValue = sessionState.workingDirectories?.[0];
    if (!workingDirectoryValue) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Session has no working directory: ${sessionUri}`);
    }
    const workingDirectory = URI.parse(workingDirectoryValue);
    const worktreeRoot = await this._gitService.getRepositoryRoot(workingDirectory);
    const repositoryRoot = worktreeRoot ? await tryResolvePrimaryWorktreeRoot(this._gitService, worktreeRoot) : void 0;
    if (!worktreeRoot || !repositoryRoot || isEqual2(worktreeRoot, repositoryRoot)) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2233, null));
    }
    this._throwIfCancelled(token);
    const storedGitState = readSessionGitState(sessionState._meta);
    const targetBranch = await this._resolveBaseBranchName(sessionUri);
    if (!targetBranch) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2238, null));
    }
    const gitState = await this._gitService.getSessionGitState(worktreeRoot, targetBranch) ?? storedGitState;
    const sourceBranch = gitState?.branchName ?? await this._gitService.getCurrentBranch(worktreeRoot);
    if (!sourceBranch) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2236, null));
    }
    if (sourceBranch === targetBranch) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, localize(2235, null, targetBranch));
    }
    const checkedOutTargetBranch = this._gitService.getCurrentBranchName ? await this._gitService.getCurrentBranchName(repositoryRoot) : await this._gitService.getCurrentBranch(repositoryRoot);
    if (checkedOutTargetBranch !== targetBranch) {
      throw new ProtocolError(
        JsonRpcErrorCodes.InvalidParams,
        checkedOutTargetBranch ? localize(2240, null, checkedOutTargetBranch, targetBranch) : localize(2229, null, targetBranch)
      );
    }
    if (!await this._gitService.branchExists(repositoryRoot, sourceBranch)) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2237, null, sourceBranch));
    }
    if (await this._gitService.hasUncommittedChanges(repositoryRoot)) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, localize(2239, null, targetBranch));
    }
    this._throwIfCancelled(token);
    let didCommit = false;
    let shouldRefresh = false;
    try {
      const hasUncommittedChanges = await this._gitService.hasUncommittedChanges(worktreeRoot);
      this._throwIfPullRequestExists(sessionUri, sourceBranch);
      if (hasUncommittedChanges) {
        await this._gitService.commitAll(worktreeRoot, localize(2227, null, sourceBranch));
        didCommit = true;
        shouldRefresh = true;
      }
      this._throwIfCancelled(token);
      this._throwIfPullRequestExists(sessionUri, sourceBranch);
      this._logService.info(`[AgentHostMergeOperationHandler] Merging ${sourceBranch} into ${targetBranch} for session ${sessionUri}`);
      try {
        await this._gitService.mergeBranch(repositoryRoot, sourceBranch);
      } catch (error) {
        this._throwIfCancelled(token);
        const detail = error instanceof Error ? error.message : String(error);
        throw new ProtocolError(
          JsonRpcErrorCodes.InternalError,
          didCommit ? localize(2231, null, targetBranch, detail) : localize(2230, null, targetBranch, detail)
        );
      }
      shouldRefresh = true;
      let mergeCommit;
      try {
        mergeCommit = await this._gitService.revParse(repositoryRoot, "HEAD");
      } catch (error) {
        throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2226, null, targetBranch, error instanceof Error ? error.message : String(error)));
      }
      if (!mergeCommit) {
        throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2228, null, targetBranch));
      }
      await this._onMerged(sessionUri, mergeCommit);
    } finally {
      if (shouldRefresh) {
        try {
          await this._onGitStateChanged(sessionUri);
        } catch (error) {
          this._logService.warn(`[AgentHostMergeOperationHandler] Post-merge refresh failed for session ${sessionUri}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    return { message: { markdown: localize(2232, null, sourceBranch, targetBranch) } };
  }
  _throwIfPullRequestExists(sessionUri, branchName) {
    const gitHubState = readSessionGitHubState(this._getSessionState(sessionUri)?._meta);
    if (hasSessionPullRequestForBranch(gitHubState, branchName)) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, localize(2234, null, branchName));
    }
  }
  _throwIfCancelled(token) {
    if (token.isCancellationRequested) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2225, null));
    }
  }
};

AgentHostMergeOperationHandler = __decorateClass([
  __decorateParam(4, IAgentHostGitService),
  __decorateParam(5, ILogService)
], AgentHostMergeOperationHandler);
export { AgentHostMergeOperationHandler };
