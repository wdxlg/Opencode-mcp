// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSyncOperationHandler.ts
import { parseChangesetUri } from "./module-0097.mjs";
import { AHP_SESSION_NOT_FOUND, ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { URI } from "./module-0023.mjs";
import { readSessionGitState } from "./module-0047.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostSyncOperationHandler.ts
var AgentHostSyncOperationHandler = class {
  constructor(_getSessionState, _onSynced, _gitService, _logService) {
    this._getSessionState = _getSessionState;
    this._onSynced = _onSynced;
    this._gitService = _gitService;
    this._logService = _logService;
  }
  static {
    this.OPERATION_SYNC = "sync";
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
    const workingDirectoryStr = sessionState.workingDirectories?.[0];
    if (!workingDirectoryStr) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Session has no working directory: ${sessionUri}`);
    }
    const workingDirectory = URI.parse(workingDirectoryStr);
    const gitState = readSessionGitState(sessionState._meta);
    const branchName = gitState?.branchName ?? await this._gitService.getCurrentBranch(workingDirectory);
    if (!branchName) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Could not determine current branch for ${workingDirectory}`);
    }
    this._throwIfCancelled(token);
    this._logService.info(`[AgentHostSyncOperationHandler] Syncing branch ${branchName} for session ${sessionUri}`);
    try {
      await this._gitService.pull(workingDirectory);
      await this._gitService.push(workingDirectory);
    } catch (err) {
      this._throwIfCancelled(token);
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Failed to sync changes: ${err instanceof Error ? err.message : String(err)}`);
    }
    try {
      await this._onSynced(sessionUri);
    } catch (err) {
      this._logService.warn(`[AgentHostSyncOperationHandler] Post-sync refresh failed for session ${sessionUri}: ${err instanceof Error ? err.message : String(err)}`);
    }
    return { message: { markdown: localize(2286, null) } };
  }
  _throwIfCancelled(token) {
    if (token.isCancellationRequested) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2285, null));
    }
  }
};

AgentHostSyncOperationHandler = __decorateClass([
  __decorateParam(2, IAgentHostGitService),
  __decorateParam(3, ILogService)
], AgentHostSyncOperationHandler);
export { AgentHostSyncOperationHandler };
