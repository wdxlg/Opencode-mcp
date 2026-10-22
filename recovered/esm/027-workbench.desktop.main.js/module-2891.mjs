// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionWorkingDirectorySynchronizer.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { SequencerByKey } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { CancellationError } from "./module-0004.mjs";
import { URI } from "./module-0032.mjs";
import { computeDesiredWorkingDirectories, hasImmutablePrimaryWorkingDirectory } from "./module-2108.mjs";
import { ACTION_INTRODUCED_IN, compareProtocolVersions } from "./module-2884.mjs";
import { readSessionMultiRootMetadata, readSessionWorkspaceless } from "./module-1007.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionWorkingDirectorySynchronizer.ts
var IAgentHostSessionWorkingDirectorySynchronizer = createDecorator("agentHostSessionWorkingDirectorySynchronizer");

var AgentHostSessionWorkingDirectorySynchronizer = class extends Disposable {
  constructor(_workspaceContextService, _workspaceTrustManagementService, _environmentService, _uriIdentityService, _logService) {
    super();
    this._workspaceContextService = _workspaceContextService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._environmentService = _environmentService;
    this._uriIdentityService = _uriIdentityService;
    this._logService = _logService;
    /** Sessions currently being followed, keyed by session URI. */
    this._registrations = /* @__PURE__ */ new Map();
    /** Serializes reconciliation per session so concurrent runs cannot interleave dispatches. */
    this._reconciler = new SequencerByKey();
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._scheduleAll("workspace folder change")));
    this._register(this._workspaceTrustManagementService.onDidChangeTrust(() => this._scheduleAll("workspace trust change")));
    this._register(this._workspaceTrustManagementService.onDidChangeTrustedFolders(() => this._scheduleAll("trusted folders change")));
  }
  /**
   * Starts following a session until the returned disposable is disposed.
   *
   * Builds the mutable bookkeeping entry for the session and wires the four
   * triggers that can invalidate its working directories, each of which
   * schedules a reconcile:
   *
   * - **session state changed** — its directory set moved, so re-diff it.
   *   Skipped while this synchronizer is dispatching its own actions, and
   *   while the subscription rolls back a host-rejected action, since either
   *   would immediately redispatch what just happened.
   * - **protocol handshake settled** — the working-directory actions only
   *   exist from AHP 0.7, so a session registered before the negotiated
   *   version is known must be re-evaluated once it arrives.
   *
   * Workspace-folder and trust changes are the other two triggers; they affect
   * every session and are subscribed once in the constructor.
   *
   * The returned disposable removes the entry, so a session registered twice
   * (re-subscribe after a state error) replaces the previous registration.
   */
  register(registration) {
    if (this._environmentService.isSessionsWindow) {
      return Disposable.None;
    }
    const key3 = registration.session.toString();
    this._registrations.get(key3)?.store.dispose();
    const store = new DisposableStore();
    const entry = {
      ...registration,
      store,
      applyingRejectedAction: false,
      automaticReconcileAgain: false,
      automaticReconcileScheduled: false,
      dispatching: false
    };
    store.add(registration.subscription.onWillApplyAction((envelope) => {
      entry.applyingRejectedAction = !!envelope.rejectionReason;
    }));
    store.add(registration.subscription.onDidApplyAction(() => {
      entry.applyingRejectedAction = false;
    }));
    store.add(registration.subscription.onDidChange(() => {
      if (!entry.applyingRejectedAction && !entry.dispatching) {
        this._scheduleReconcile(entry, "subscription change");
      }
    }));
    store.add(autorun((reader) => {
      registration.connection.initializeResult.read(reader);
      this._scheduleReconcile(entry, "protocol initialization");
    }));
    store.add(toDisposable(() => {
      if (this._registrations.get(key3) === entry) {
        this._registrations.delete(key3);
      }
    }));
    this._registrations.set(key3, entry);
    return store;
  }
  /** Reconciles every followed session, e.g. after a workspace-wide change. */
  _scheduleAll(reason) {
    for (const registration of this._registrations.values()) {
      this._scheduleReconcile(registration, reason);
    }
  }
  /**
   * Compares the session's current working directories against the folders it
   * should have for today's workspace and dispatches the difference. Runs are
   * serialized per session so two callers cannot interleave their dispatches.
   *
   * See {@link IAgentHostSessionWorkingDirectorySynchronizer.reconcile}.
   */
  reconcile(session, token) {
    return this._reconciler.queue(session.toString(), () => this._reconcile(session, token));
  }
  /**
   * Runs an automatic reconcile, coalescing bursts: triggers arriving while a
   * run is in flight collapse into a single follow-up pass, so a rapid series
   * of folder changes converges on the final workspace state. Failures are
   * logged rather than surfaced — these runs have no caller to reject to.
   */
  _scheduleReconcile(registration, reason) {
    if (registration.automaticReconcileScheduled) {
      registration.automaticReconcileAgain = true;
      return;
    }
    registration.automaticReconcileScheduled = true;
    const run = () => {
      registration.automaticReconcileAgain = false;
      void this.reconcile(registration.session, CancellationToken.None).then(
        () => finish(),
        (error) => {
          this._logService.warn(`[AgentHostWorkingDirectories] Failed to reconcile ${reason}`, error);
          finish();
        }
      );
    };
    const finish = () => {
      if (this._registrations.get(registration.session.toString()) !== registration) {
        return;
      }
      if (registration.automaticReconcileAgain) {
        run();
      } else {
        registration.automaticReconcileScheduled = false;
      }
    };
    run();
  }
  async _reconcile(session, token) {
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const registration = this._registrations.get(session.toString());
    const value2 = registration?.subscription.value;
    const state = value2 && !(value2 instanceof Error) ? value2 : void 0;
    if (!registration || !state || !this._isEligible(registration, state)) {
      return;
    }
    const current = state.workingDirectories?.map((directory) => URI.parse(directory)) ?? [];
    if (current.length === 0) {
      return;
    }
    const desired = computeDesiredWorkingDirectories(
      current[0],
      current,
      this._workspaceContextService.getWorkspace().folders.map((folder) => folder.uri),
      this._uriIdentityService.extUri
    );
    const additions = desired.slice(1).filter((directory) => !current.some((existing) => this._uriIdentityService.extUri.isEqual(existing, directory)));
    const removals = current.slice(1).filter((directory) => !desired.some((expected) => this._uriIdentityService.extUri.isEqual(expected, directory)));
    if (additions.length === 0 && removals.length === 0) {
      return;
    }
    const trustError = await this._getAdditionTrustError(additions, token);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (this._registrations.get(session.toString()) !== registration) {
      return;
    }
    registration.dispatching = true;
    try {
      if (!trustError) {
        for (const directory of additions) {
          registration.connection.dispatch(session.toString(), {
            type: "session/workingDirectorySet" /* SessionWorkingDirectorySet */,
            directory: directory.toString()
          });
        }
      }
      for (const directory of removals) {
        registration.connection.dispatch(session.toString(), {
          type: "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */,
          directory: directory.toString()
        });
      }
    } finally {
      registration.dispatching = false;
    }
    if (trustError) {
      throw trustError;
    }
  }
  /**
   * Whether this session may follow the workspace. Requires a host that speaks
   * the working-directory actions, a provider that supports multiple roots
   * with a pinned primary, and a plain multi-root session still bound to the
   * open workspace file. Excludes workspace-less, worktree-isolated, and
   * multi-chat sessions, whose directories are not the workspace's to manage.
   *
   * Deliberately not a reconcile trigger: this reads `connection.rootState`,
   * but a session registered before provider capabilities hydrate is not
   * re-reconciled when they land. The pre-send `reconcile` re-evaluates
   * eligibility before every prompt, so an agent never runs with stale roots —
   * only the session's own state lags until the next trigger.
   */
  _isEligible(registration, state) {
    const protocolVersion = registration.connection.initializeResult.get()?.protocolVersion;
    if (state.lifecycle !== "ready" /* Ready */ || !protocolVersion || compareProtocolVersions(protocolVersion, ACTION_INTRODUCED_IN["session/workingDirectorySet" /* SessionWorkingDirectorySet */]) < 0 || readSessionWorkspaceless(state._meta) || state.config?.values["isolation" /* Isolation */] === "worktree" || state.chats.length !== 1 || state.defaultChat !== state.chats[0].resource || !state.workingDirectories?.length) {
      return false;
    }
    const workspace = this._workspaceContextService.getWorkspace();
    const multiRoot = readSessionMultiRootMetadata(state._meta);
    if (!multiRoot || !URI.isUri(workspace.configuration) || !this._uriIdentityService.extUri.isEqual(URI.parse(multiRoot.workspaceFile), workspace.configuration)) {
      return false;
    }
    return hasImmutablePrimaryWorkingDirectory(registration.connection.rootState.value, registration.provider);
  }
  /** Returns an error for the first untrusted folder, or `undefined` if all are trusted. */
  async _getAdditionTrustError(additions, token) {
    for (const directory of additions) {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const { trusted } = await this._workspaceTrustManagementService.getUriTrustInfo(directory);
      if (!trusted) {
        return new Error(localize(9017, null, directory.path));
      }
    }
    return void 0;
  }
};

AgentHostSessionWorkingDirectorySynchronizer = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IWorkspaceTrustManagementService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ILogService)
], AgentHostSessionWorkingDirectorySynchronizer);

registerSingleton(IAgentHostSessionWorkingDirectorySynchronizer, AgentHostSessionWorkingDirectorySynchronizer, 1 /* Delayed */);
export { IAgentHostSessionWorkingDirectorySynchronizer, AgentHostSessionWorkingDirectorySynchronizer };
