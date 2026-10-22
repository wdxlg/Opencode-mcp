// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChangesetOperationService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0010.mjs";
import { readSessionGitHubState, readSessionGitState } from "./module-0047.mjs";
import { parseChangesetUri } from "./module-0097.mjs";
import { isMultiRootSession } from "./module-0478.mjs";
import { AHP_SESSION_NOT_FOUND, ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { IAgentHostChangesetSubscriptionService } from "./module-0453.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { toErrorMessage } from "./module-0080.mjs";


// src/vs/platform/agentHost/node/agentHostChangesetOperationService.ts
var AgentHostChangesetOperationService = class extends Disposable {
  constructor(_stateManager, _gitStateService, _changesetSubscriptions, _configurationService) {
    super();
    this._stateManager = _stateManager;
    this._gitStateService = _gitStateService;
    this._changesetSubscriptions = _changesetSubscriptions;
    this._configurationService = _configurationService;
    this._handlerRegistrations = this._register(new DisposableMap());
    this._changesetOperationHandlers = /* @__PURE__ */ new Map();
    this._inFlightOperations = /* @__PURE__ */ new Map();
    this._registry = {
      registerChangesetOperationHandler: (operationId, handler) => this._registerChangesetOperationHandler(operationId, handler),
      refreshSessionGitState: (sessionKey) => this._gitStateService.refreshSessionGitState(sessionKey),
      onDidChangeOperations: (sessionKey) => this.updateOperations(sessionKey)
    };
  }
  registerContribution(contribution) {
    if (this._handlerRegistrations.has(contribution)) {
      throw new Error("Changeset operation contribution already registered");
    }
    const handlerRegistrations = new DisposableStore();
    const registeredHandlers = /* @__PURE__ */ new Set();
    const registry = {
      ...this._registry,
      registerChangesetOperationHandler: (operationId, handler) => {
        const registration = handlerRegistrations.add(this._registry.registerChangesetOperationHandler(operationId, handler));
        registeredHandlers.add(registration);
        return registration;
      }
    };
    try {
      const registration = contribution.registerHandlers(registry);
      for (const registeredHandler of registeredHandlers) {
        handlerRegistrations.deleteAndLeak(registeredHandler);
      }
      handlerRegistrations.dispose();
      this._handlerRegistrations.set(contribution, registration);
    } catch (error) {
      handlerRegistrations.dispose();
      contribution.dispose();
      throw error;
    }
    return toDisposable(() => {
      this._handlerRegistrations.deleteAndDispose(contribution);
      contribution.dispose();
    });
  }
  getOperations(sessionKey, changeset, gitState, gitHubState) {
    if (!gitState) {
      const sessionState = this._stateManager.getSessionState(sessionKey);
      gitState = readSessionGitState(sessionState?._meta);
      if (!gitState) {
        return [];
      }
    }
    if (!gitHubState) {
      gitHubState = readSessionGitHubState(this._stateManager.getSessionState(sessionKey)?._meta);
    }
    const parsed = parseChangesetUri(changeset);
    if (!parsed) {
      return [];
    }
    if (this._shouldSuppressOperations(sessionKey, parsed.kind)) {
      return [];
    }
    return this._getOperations({
      sessionKey,
      changesetUri: changeset,
      changesetKind: parsed.kind,
      gitState,
      gitHubState
    });
  }
  /**
   * Whether operations must be suppressed for a changeset of `kind` in the
   * given session. The per-turn `turn` and `compare-turns` changesets carry no
   * operations in a multi-root session; every other kind and single-folder
   * sessions are unaffected. Uses the effective working directories so the rule
   * is provider-agnostic and tracks dynamic root changes.
   */
  _shouldSuppressOperations(sessionKey, kind) {
    return (kind === "turn" /* Turn */ || kind === "compare-turns" /* Compare */) && isMultiRootSession(this._configurationService.getEffectiveWorkingDirectories(sessionKey));
  }
  _getOperations(context) {
    const operations = [];
    for (const contribution of this._handlerRegistrations.keys()) {
      const contributed = contribution.getOperations(context);
      if (contributed) {
        operations.push(...contributed);
      }
    }
    if (this._stateManager.hasActiveTurn(context.sessionKey)) {
      return operations.map((operation) => ({
        ...operation,
        status: "disabled" /* Disabled */
      }));
    }
    return operations;
  }
  updateOperations(sessionKey, changeset, gitState, gitHubState) {
    const changesets = changeset ? [changeset] : this._changesetSubscriptions.getSessionSubscriptions(sessionKey);
    const unsuppressed = [];
    for (const changeset2 of changesets) {
      const parsed = parseChangesetUri(changeset2);
      if (parsed && this._shouldSuppressOperations(sessionKey, parsed.kind)) {
        this._stateManager.dispatchServerAction(changeset2, {
          type: "changeset/operationsChanged" /* ChangesetOperationsChanged */,
          operations: []
        });
        continue;
      }
      unsuppressed.push(changeset2);
    }
    if (unsuppressed.length === 0) {
      return;
    }
    if (!gitState) {
      const sessionState = this._stateManager.getSessionState(sessionKey);
      gitState = readSessionGitState(sessionState?._meta);
      if (!gitState) {
        return;
      }
    }
    if (!gitHubState) {
      const sessionState = this._stateManager.getSessionState(sessionKey);
      gitHubState = readSessionGitHubState(sessionState?._meta);
    }
    for (const changeset2 of unsuppressed) {
      const operations = this.getOperations(sessionKey, changeset2, gitState, gitHubState);
      this._stateManager.dispatchServerAction(changeset2, {
        type: "changeset/operationsChanged" /* ChangesetOperationsChanged */,
        operations: [...operations]
      });
    }
  }
  async invokeChangesetOperation(params) {
    const state = this._stateManager.getChangesetState(params.channel);
    if (!state) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Changeset not found: ${params.channel}`);
    }
    const op = state.operations?.find((o) => o.id === params.operationId);
    if (!op) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Unknown operation '${params.operationId}' on changeset ${params.channel}`);
    }
    if (op.status === "disabled" /* Disabled */) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Operation '${params.operationId}' is disabled on changeset ${params.channel}`);
    }
    const parsed = parseChangesetUri(params.channel);
    if (parsed && this._stateManager.hasActiveTurn(parsed.sessionUri)) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Operation '${params.operationId}' is disabled while a turn is active on changeset ${params.channel}`);
    }
    if (parsed && (parsed.kind === "turn" /* Turn */ || parsed.kind === "compare-turns" /* Compare */) && isMultiRootSession(this._configurationService.getEffectiveWorkingDirectories(parsed.sessionUri))) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Operation '${params.operationId}' is not available on a ${parsed.kind} changeset in a multi-root session: ${params.channel}`);
    }
    const targetKind = params.target?.kind === "resource" /* Resource */ ? "resource" /* Resource */ : params.target?.kind === "range" /* Range */ ? "range" /* Range */ : "changeset" /* Changeset */;
    if (!op.scopes.includes(targetKind)) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Operation '${params.operationId}' does not support scope '${targetKind}' (allowed: ${op.scopes.join(", ")})`);
    }
    const handler = this._changesetOperationHandlers.get(params.operationId);
    if (!handler) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `No operation handler registered for '${params.operationId}' on changeset ${params.channel}`);
    }
    return this._invokeChangesetOperation(handler, params);
  }
  _invokeChangesetOperation(handler, params) {
    const operationKey = `${params.channel}\0${params.operationId}\0${JSON.stringify(params.target ?? null)}`;
    const inFlightOperationResult = this._inFlightOperations.get(operationKey);
    if (inFlightOperationResult) {
      return inFlightOperationResult;
    }
    this._stateManager.dispatchServerAction(params.channel, {
      type: "changeset/operationStatusChanged" /* ChangesetOperationStatusChanged */,
      operationId: params.operationId,
      status: "running" /* Running */
    });
    const operationPromise = handler.invoke(params, CancellationToken.None).then((result) => {
      this._stateManager.dispatchServerAction(params.channel, {
        type: "changeset/operationStatusChanged" /* ChangesetOperationStatusChanged */,
        operationId: params.operationId,
        status: "idle" /* Idle */
      });
      return result;
    }).catch((error) => {
      this._stateManager.dispatchServerAction(params.channel, {
        type: "changeset/operationStatusChanged" /* ChangesetOperationStatusChanged */,
        operationId: params.operationId,
        status: "error" /* Error */,
        error: toChangesetOperationError(error)
      });
      throw error;
    }).finally(() => {
      if (this._inFlightOperations.get(operationKey) === operationPromise) {
        this._inFlightOperations.delete(operationKey);
      }
    });
    this._inFlightOperations.set(operationKey, operationPromise);
    return operationPromise;
  }
  _registerChangesetOperationHandler(operationId, handler) {
    if (this._changesetOperationHandlers.has(operationId)) {
      throw new Error(`Changeset operation handler already registered for '${operationId}'`);
    }
    this._changesetOperationHandlers.set(operationId, handler);
    return toDisposable(() => {
      if (this._changesetOperationHandlers.get(operationId) === handler) {
        this._changesetOperationHandlers.delete(operationId);
      }
    });
  }
};

AgentHostChangesetOperationService = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IAgentHostGitStateService),
  __decorateParam(2, IAgentHostChangesetSubscriptionService),
  __decorateParam(3, IAgentConfigurationService)
], AgentHostChangesetOperationService);

function toChangesetOperationError(error) {
  const message = toErrorMessage(error);
  return error instanceof Error ? { errorType: error.name, message, stack: error.stack } : { errorType: "Error", message };
}
export { toChangesetOperationError, AgentHostChangesetOperationService };
