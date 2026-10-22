// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostPullRequestLifecycleOperationHandler.ts
import { AgentHostPullRequestOperationId } from "./module-0443.mjs";
import { parseChangesetUri } from "./module-0097.mjs";
import { ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { localize } from "./module-0012.mjs";
import { generateUuid } from "./module-0042.mjs";
import { AgentMergeConfigKey, agentMergeRootConfigSchema, defaultAgentMergeConfiguration, resolveMergeMethod } from "./module-0116.mjs";
import { parsePullRequestUrl } from "./module-0474.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostPullRequestStatusService } from "./module-0526.mjs";
import { IGitHubService } from "./module-0472.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostPullRequestLifecycleOperationHandler.ts
var AgentHostPullRequestLifecycleOperationHandler = class {
  constructor(_action, _configurationService, _statusService, _gitHubService, _logService) {
    this._action = _action;
    this._configurationService = _configurationService;
    this._statusService = _statusService;
    this._gitHubService = _gitHubService;
    this._logService = _logService;
  }
  static {
    this.OPERATION_MARK_READY = AgentHostPullRequestOperationId.MarkReady;
  }
  static {
    this.OPERATION_MERGE = AgentHostPullRequestOperationId.Merge;
  }
  static {
    this.OPERATION_ENABLE_AUTO_MERGE = AgentHostPullRequestOperationId.EnableAutoMerge;
  }
  static {
    this.OPERATION_DISABLE_AUTO_MERGE = AgentHostPullRequestOperationId.DisableAutoMerge;
  }
  async invoke(params, token) {
    const abortController = new AbortController();
    if (token.isCancellationRequested) {
      abortController.abort();
    }
    const cancellationListener = token.onCancellationRequested(() => abortController.abort());
    try {
      return await this._invoke(params, abortController.signal);
    } finally {
      cancellationListener.dispose();
    }
  }
  async _invoke(params, signal) {
    const parsed = parseChangesetUri(params.channel);
    if (!parsed) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Not a changeset URI: ${params.channel}`);
    }
    const sessionUri = parsed.sessionUri;
    const status = this._statusService.getPullRequestStatus(sessionUri);
    if (!status) {
      this._logService.warn(`[AgentHostPullRequestLifecycleOperationHandler] Rejected '${this._action}': session=${sessionUri}, reason=pull request state is not available`);
      throw new ProtocolError(
        JsonRpcErrorCodes.InvalidParams,
        localize(2253, null)
      );
    }
    this._logService.info(`[AgentHostPullRequestLifecycleOperationHandler] Invoking '${this._action}': session=${sessionUri}, pr=${status.url}, state=${status.state}, draft=${status.draft}, mergeReady=${status.mergeReady}, autoMergeEnabled=${status.autoMergeEnabled}`);
    const ref = await this._resolveRef(status, signal);
    const startedAt = Date.now();
    try {
      const message = await this._runAction(sessionUri, ref, status, signal);
      await this._statusService.refresh(sessionUri);
      return { message };
    } catch (error) {
      this._logService.error(`[AgentHostPullRequestLifecycleOperationHandler] Failed '${this._action}': session=${sessionUri}, pr=${status.url}, durationMs=${Date.now() - startedAt}, error=${error instanceof Error ? error.message : String(error)}`);
      await this._statusService.refresh(sessionUri);
      throw error;
    }
  }
  async _runAction(sessionUri, ref, status, signal) {
    switch (this._action) {
      case "mark-ready": {
        await this._gitHubService.mutations.markReadyForReview(ref, { pullRequestId: this._requireNodeId(status) }, signal);
        this._logService.info(`[AgentHostPullRequestLifecycleOperationHandler] Marked pull request ready: session=${sessionUri}, pr=${status.url}`);
        return localize(2249, null);
      }
      case "enable-auto-merge": {
        const method = this._requireMergeMethod(status.allowedMergeMethods);
        await this._gitHubService.mutations.enableAutoMerge(ref, { pullRequestId: this._requireNodeId(status), method }, signal);
        this._logService.info(`[AgentHostPullRequestLifecycleOperationHandler] Enabled auto-merge: session=${sessionUri}, pr=${status.url}, method=${method}`);
        return localize(2246, null);
      }
      case "disable-auto-merge": {
        await this._gitHubService.mutations.disableAutoMerge(ref, { pullRequestId: this._requireNodeId(status) }, signal);
        this._logService.info(`[AgentHostPullRequestLifecycleOperationHandler] Disabled auto-merge: session=${sessionUri}, pr=${status.url}`);
        return localize(2245, null);
      }
      case "merge":
        return await this._merge(sessionUri, ref, status, signal);
    }
  }
  /**
   * Merges through the gated preparation flow: `prepareMerge` captures an
   * authoritative snapshot that the mutation service validates the merge
   * against, so a pull request that stopped being mergeable between the button
   * being rendered and clicked is rejected rather than force-merged.
   */
  async _merge(sessionUri, ref, status, signal) {
    if (!status.headSha) {
      throw new ProtocolError(
        JsonRpcErrorCodes.InternalError,
        localize(2248, null)
      );
    }
    const preparation = await this._gitHubService.mutations.prepareMerge(ref, status.headSha, signal);
    const authorization = { confirmed: true, authorizationId: generateUuid() };
    const mergeability = preparation.snapshot.mergeability.value;
    this._logService.debug(`[AgentHostPullRequestLifecycleOperationHandler] Merge preparation complete: session=${sessionUri}, pr=${status.url}, headSha=${status.headSha}, mergeQueueRequired=${mergeability?.mergeQueueRequired ?? "unknown"}, allowedMergeMethods=${mergeability?.allowedMergeMethods.join("|") || "none"}`);
    if (mergeability?.mergeQueueRequired) {
      const result2 = await this._gitHubService.mutations.enqueue(preparation, authorization, signal);
      this._logService.info(`[AgentHostPullRequestLifecycleOperationHandler] Pull request enqueued: session=${sessionUri}, pr=${status.url}, outcome=${result2.outcome}`);
      return localize(2247, null);
    }
    const method = this._requireMergeMethod(mergeability?.allowedMergeMethods ?? []);
    const result = await this._gitHubService.mutations.merge(preparation, { method, authorization }, signal);
    this._logService.info(`[AgentHostPullRequestLifecycleOperationHandler] Pull request merged: session=${sessionUri}, pr=${status.url}, method=${method}, outcome=${result.outcome}`);
    return localize(2250, null);
  }
  /**
   * Resolves the configured merge method against what the repository allows.
   */
  _requireMergeMethod(allowed) {
    const configured = this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.MergeMethod) ?? defaultAgentMergeConfiguration.mergeMethod;
    const method = resolveMergeMethod(configured, allowed);
    if (!method) {
      this._logService.warn(`[AgentHostPullRequestLifecycleOperationHandler] No usable merge method: configured=${configured}, allowedByRepository=${allowed.join("|") || "none"}`);
      throw new ProtocolError(
        JsonRpcErrorCodes.InternalError,
        localize(2252, null)
      );
    }
    this._logService.trace(`[AgentHostPullRequestLifecycleOperationHandler] Resolved merge method: configured=${configured}, resolved=${method}, allowedByRepository=${allowed.join("|")}`);
    return method;
  }
  _requireNodeId(status) {
    if (!status.pullRequestId) {
      throw new ProtocolError(
        JsonRpcErrorCodes.InternalError,
        localize(2251, null)
      );
    }
    return status.pullRequestId;
  }
  async _resolveRef(status, signal) {
    const parsed = parsePullRequestUrl(status.url);
    if (!parsed) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Not a pull request URL: ${status.url}`);
    }
    const credential = await this._gitHubService.credentials.getCredential(signal);
    if (credential.account.host.toLowerCase() !== parsed.apiHost.toLowerCase()) {
      throw new ProtocolError(
        JsonRpcErrorCodes.InternalError,
        localize(2244, null)
      );
    }
    return { ...credential.account, owner: parsed.owner, repo: parsed.repo, number: parsed.number };
  }
};

AgentHostPullRequestLifecycleOperationHandler = __decorateClass([
  __decorateParam(1, IAgentConfigurationService),
  __decorateParam(2, IAgentHostPullRequestStatusService),
  __decorateParam(3, IGitHubService),
  __decorateParam(4, ILogService)
], AgentHostPullRequestLifecycleOperationHandler);
export { AgentHostPullRequestLifecycleOperationHandler };
