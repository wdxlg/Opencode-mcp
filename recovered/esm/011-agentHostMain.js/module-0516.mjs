// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostDiscardChangesOperationHandler.ts
import { parseChangesetUri } from "./module-0097.mjs";
import { AHP_SESSION_NOT_FOUND, ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { URI } from "./module-0023.mjs";
import { localize } from "./module-0012.mjs";
import { basename2 } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostDiscardChangesOperationHandler.ts
var AgentHostDiscardChangesOperationHandler = class {
  constructor(_getSessionState, _agentHostGitService, _logService) {
    this._getSessionState = _getSessionState;
    this._agentHostGitService = _agentHostGitService;
    this._logService = _logService;
  }
  static {
    this.OPERATION_DISCARD_CHANGES = "discard-changes";
  }
  async invoke(params, token) {
    const abortController = new AbortController();
    if (token.isCancellationRequested) {
      abortController.abort();
    }
    const cancellationListener = token.onCancellationRequested(() => abortController.abort());
    try {
      return await this._invoke(params, token, abortController.signal);
    } finally {
      cancellationListener.dispose();
    }
  }
  async _invoke(params, token, _signal) {
    const parsed = parseChangesetUri(params.channel);
    if (!parsed || parsed.kind !== "uncommitted" /* Uncommitted */) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Not an uncommitted changeset URI: ${params.channel}`);
    }
    this._throwIfCancelled(token);
    const sessionUri = parsed.sessionUri;
    const sessionState = this._getSessionState(sessionUri);
    if (!sessionState) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session not found: ${sessionUri}`);
    }
    if (params.target?.kind !== "resource" /* Resource */) {
      throw new ProtocolError(
        JsonRpcErrorCodes.InvalidParams,
        `Operation '${AgentHostDiscardChangesOperationHandler.OPERATION_DISCARD_CHANGES}' requires a resource target.`
      );
    }
    const workingDirectoryStr = sessionState.workingDirectories?.[0];
    if (!workingDirectoryStr) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Session has no working directory: ${sessionUri}`);
    }
    const workingDirectory = URI.parse(workingDirectoryStr);
    const resource = URI.parse(params.target.resource);
    this._logService.info(`[AgentHostDiscardChangesOperationHandler] Restoring '${resource.fsPath}' for session ${sessionUri}`);
    try {
      await this._agentHostGitService.restore(workingDirectory, [resource.fsPath]);
    } catch (err) {
      this._throwIfCancelled(token);
      throw new ProtocolError(
        JsonRpcErrorCodes.InternalError,
        `Failed to discard changes: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    return { message: { markdown: localize(2221, null, basename2(resource)) } };
  }
  _throwIfCancelled(token) {
    if (token.isCancellationRequested) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2220, null));
    }
  }
};

AgentHostDiscardChangesOperationHandler = __decorateClass([
  __decorateParam(1, IAgentHostGitService),
  __decorateParam(2, ILogService)
], AgentHostDiscardChangesOperationHandler);
export { AgentHostDiscardChangesOperationHandler };
