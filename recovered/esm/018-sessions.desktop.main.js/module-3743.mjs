// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesViewService.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { LRUCache, ResourceMap } from "./module-0008.mjs";
import { observableSignal } from "./module-0058.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { AGENT_HOST_MERGE_CHANGESET_OPERATION_ID } from "./module-3734.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { URI } from "./module-0032.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { Codicon } from "./module-0085.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";


// src/vs/sessions/contrib/changes/browser/changesViewService.ts
var ChangesetReviewSupportContext = new RawContextKey("sessions.changesetReviewSupport", false);

var ChangesetReviewedFilesContext = new RawContextKey("sessions.changesetReviewedFiles", []);

var ChangesetHasOperationsContext = new RawContextKey("sessions.changesetHasOperations", false);

var DEFAULT_SECTION_COLLAPSE_STATE = Object.freeze({
  checks: true
});

var SESSION_VIEW_STATE_STORAGE_KEY = "changesView.sessionViewState";

var SESSION_VIEW_STATE_LIMIT = 100;

var ChangesViewService = class extends Disposable {
  constructor(agentFeedbackService, codeReviewService, contextKeyService, sessionsService, storageService, sessionsManagementService) {
    super();
    this.agentFeedbackService = agentFeedbackService;
    this.codeReviewService = codeReviewService;
    this.contextKeyService = contextKeyService;
    this.sessionsService = sessionsService;
    this.storageService = storageService;
    this._sectionCollapseStateBySession = new ResourceMap();
    this._sectionCollapseStateChanged = observableSignal("changesView.sectionCollapseStateChanged");
    this._detailsViewStateBySession = new LRUCache(SESSION_VIEW_STATE_LIMIT);
    this.detailsViewStateTransferObs = observableValue(this, void 0);
    this._selectedChangesetId = observableValue(this, void 0);
    this._transientChangeset = observableValue(this, void 0);
    this._loadViewState();
    this.activeSessionResourceObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.resource;
    });
    this.activeSessionSectionCollapseStateObs = derivedOpts({ equalsFn: structuralEquals }, (reader) => {
      const sessionResource = this.activeSessionResourceObs.read(reader);
      this._sectionCollapseStateChanged.read(reader);
      return sessionResource ? this._sectionCollapseStateBySession.get(sessionResource) ?? DEFAULT_SECTION_COLLAPSE_STATE : DEFAULT_SECTION_COLLAPSE_STATE;
    });
    this.activeSessionTypeObs = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.sessionType;
    });
    this.activeSessionIsVirtualWorkspaceObs = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.workspace.read(reader)?.isVirtualWorkspace ?? false;
    });
    this.activeSessionHasGitRepositoryObs = derived((reader) => {
      const isVirtualWorkspace2 = this.activeSessionIsVirtualWorkspaceObs.read(reader);
      if (isVirtualWorkspace2) {
        return true;
      }
      const activeSession = this.sessionsService.activeSession.read(reader);
      const workspace = activeSession?.workspace.read(reader);
      return workspace?.folders[0].gitRepository !== void 0;
    });
    this.activeSessionReviewCommentCountByFileObs = this._getActiveSessionReviewComments();
    this.activeSessionAgentFeedbackCountByFileObs = this._getActiveSessionAgentFeedback();
    const activeSessionChangesetsObs = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.changesets.read(reader);
    });
    this.activeSessionChangesetsObs = derived((reader) => {
      const changesets = activeSessionChangesetsObs.read(reader);
      const transientChangeset = this._transientChangeset.read(reader);
      if (!transientChangeset) {
        return changesets;
      }
      return [
        ...changesets?.filter((changeset) => changeset.id !== transientChangeset.id) ?? [],
        transientChangeset
      ];
    });
    this.activeSessionChangesetsLoadingObs = derived((reader) => {
      return this.activeSessionChangesetsObs.read(reader) === void 0;
    });
    this.activeSessionChangesetObs = derived((reader) => {
      const selectedChangesetId = this._selectedChangesetId.read(reader);
      const activeSessionChangesets = this.activeSessionChangesetsObs.read(reader);
      if (!activeSessionChangesets) {
        return void 0;
      }
      const selectedChangeset = selectedChangesetId ? activeSessionChangesets.find((c) => c.id === selectedChangesetId && c.isEnabled.read(reader)) : void 0;
      if (selectedChangeset) {
        return selectedChangeset;
      }
      const defaultChangeset = activeSessionChangesets.find((c) => c.isDefault.read(reader));
      const firstEnabledChangeset = activeSessionChangesets.find((c) => c.isEnabled.read(reader));
      return defaultChangeset ?? firstEnabledChangeset;
    });
    this.activeSessionChangesetLoadingObs = derived((reader) => {
      const changeset = this.activeSessionChangesetObs.read(reader);
      return changeset?.isLoadingChanges.read(reader) ?? false;
    });
    const activeSessionBaseBranchProtected = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.workspace.read(reader)?.folders[0]?.gitRepository?.baseBranchProtected === true;
    });
    this.activeSessionChangesetOperationsObs = derived((reader) => {
      const changeset = this.activeSessionChangesetObs.read(reader);
      const operations = changeset?.operations.read(reader) ?? [];
      return activeSessionBaseBranchProtected.read(reader) ? operations.filter((operation) => operation.id !== AGENT_HOST_MERGE_CHANGESET_OPERATION_ID) : operations;
    });
    this.activeSessionChangesObs = derived((reader) => {
      const changeset = this.activeSessionChangesetObs.read(reader);
      return changeset?.changes.read(reader) ?? [];
    });
    this.activeSessionLoadingObs = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      const activeSessionLoading = activeSession?.loading.read(reader) ?? true;
      const activeSessionChangesetsLoading = this.activeSessionChangesetsLoadingObs.read(reader);
      const activeSessionChangesetLoading = this.activeSessionChangesetLoadingObs.read(reader);
      return activeSessionLoading || activeSessionChangesetsLoading || activeSessionChangesetLoading;
    });
    this.activeSessionStateObs = this._getActiveSessionState();
    const storedMode = this.storageService.get("changesView.viewMode", 1 /* WORKSPACE */);
    const initialMode = storedMode === "tree" /* Tree */ ? "tree" /* Tree */ : "list" /* List */;
    this._viewModeObs = observableValue(this, initialMode);
    this._register(autorun((reader) => {
      this.activeSessionResourceObs.read(reader);
      this.setChangesetId(void 0);
    }));
    this._register(sessionsManagementService.onDidReplaceSession(({ from, to }) => {
      const sectionCollapseState = this._sectionCollapseStateBySession.get(from.resource);
      if (sectionCollapseState) {
        this._sectionCollapseStateBySession.delete(from.resource);
        this._sectionCollapseStateBySession.set(to.resource, sectionCollapseState);
        this._sectionCollapseStateChanged.trigger(void 0);
      }
      const detailsViewState = this._detailsViewStateBySession.get(from.resource.toString());
      if (detailsViewState) {
        this._detailsViewStateBySession.delete(from.resource.toString());
        this._detailsViewStateBySession.set(to.resource.toString(), detailsViewState);
        this._saveViewState();
      }
      this.detailsViewStateTransferObs.set({ from: from.resource, to: to.resource }, void 0);
    }));
    this._register(sessionsManagementService.onDidDeleteSession((session) => {
      this._deleteSessionViewState(session.resource);
    }));
    this._register(sessionsManagementService.onDidDiscardNewSession((session) => this._deleteSessionViewState(session.resource)));
    this._register(sessionsManagementService.onDidReplaceNewDraftSession(({ from }) => this._deleteSessionViewState(from.resource)));
    this._bindContextKeys();
  }
  setChangesetId(changesetId) {
    transaction((tx) => {
      this._selectedChangesetId.set(changesetId, tx);
      this._transientChangeset.set(void 0, tx);
    });
  }
  showChangeset(changeset) {
    transaction((tx) => {
      this._transientChangeset.set(changeset, tx);
      this._selectedChangesetId.set(changeset.id, tx);
    });
  }
  get viewModeObs() {
    return this._viewModeObs;
  }
  setViewMode(mode) {
    if (this._viewModeObs.get() === mode) {
      return;
    }
    this._viewModeObs.set(mode, void 0);
    this.storageService.store("changesView.viewMode", mode, 1 /* WORKSPACE */, 0 /* USER */);
  }
  setSectionCollapsed(sessionResource, section, collapsed2) {
    const current = this._sectionCollapseStateBySession.get(sessionResource) ?? DEFAULT_SECTION_COLLAPSE_STATE;
    if (current[section] === collapsed2) {
      return;
    }
    const next = { ...current, [section]: collapsed2 };
    if (next.checks === DEFAULT_SECTION_COLLAPSE_STATE.checks) {
      this._sectionCollapseStateBySession.delete(sessionResource);
    } else {
      this._sectionCollapseStateBySession.set(sessionResource, next);
    }
    this._sectionCollapseStateChanged.trigger(void 0);
  }
  getDetailsViewState(sessionResource, viewMode) {
    return this._detailsViewStateBySession.get(sessionResource.toString())?.[viewMode];
  }
  setDetailsViewState(sessionResource, viewMode, state) {
    const key3 = sessionResource.toString();
    const current = this._detailsViewStateBySession.get(key3);
    if (structuralEquals(current?.[viewMode], state)) {
      return;
    }
    this._detailsViewStateBySession.set(key3, { ...current, [viewMode]: state });
    this._saveViewState();
  }
  _deleteSessionViewState(sessionResource) {
    if (this._sectionCollapseStateBySession.delete(sessionResource)) {
      this._sectionCollapseStateChanged.trigger(void 0);
    }
    if (this._detailsViewStateBySession.delete(sessionResource.toString())) {
      this._saveViewState();
    }
  }
  _loadViewState() {
    const entries2 = this.storageService.getObject(SESSION_VIEW_STATE_STORAGE_KEY, 1 /* WORKSPACE */, []);
    if (!Array.isArray(entries2)) {
      this.storageService.remove(SESSION_VIEW_STATE_STORAGE_KEY, 1 /* WORKSPACE */);
      return;
    }
    for (const entry of entries2) {
      if (typeof entry.sessionResource !== "string") {
        continue;
      }
      const resource = URI.parse(entry.sessionResource);
      if (entry.detailsViewState) {
        this._detailsViewStateBySession.set(resource.toString(), entry.detailsViewState);
      }
    }
  }
  _saveViewState() {
    if (this._detailsViewStateBySession.size === 0) {
      this.storageService.remove(SESSION_VIEW_STATE_STORAGE_KEY, 1 /* WORKSPACE */);
      return;
    }
    const entries2 = [];
    this._detailsViewStateBySession.forEach((detailsViewState, sessionResource) => {
      entries2.push({
        sessionResource,
        detailsViewState
      });
    });
    this.storageService.store(SESSION_VIEW_STATE_STORAGE_KEY, JSON.stringify(entries2), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  setChangesetFilesReviewState(resources, reviewed) {
    if (resources.length === 0) {
      return;
    }
    const changeset = this.activeSessionChangesetObs.get();
    if (!changeset || !changeset.setReviewState) {
      return;
    }
    changeset.setReviewState(resources, reviewed);
  }
  _getActiveSessionState() {
    const activeSessionStateObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const loading = this.activeSessionLoadingObs.read(reader);
      if (loading) {
        return lastValue;
      }
      const activeSession = this.sessionsService.activeSession.read(reader);
      const activeSessionChanges = activeSession?.changes.read(reader) ?? [];
      const workspace = activeSession?.workspace.read(reader);
      const workspaceFolder = workspace?.folders[0];
      const gitRepository = workspaceFolder?.gitRepository;
      const hasGitRepository = this.activeSessionHasGitRepositoryObs.read(reader);
      const branchName = gitRepository?.branchName;
      const baseBranchName = gitRepository?.baseBranchName;
      const isMergeBaseBranchProtected = gitRepository?.baseBranchProtected;
      const isolationMode = gitRepository?.workTreeUri === void 0 ? "workspace" /* Workspace */ : "worktree" /* Worktree */;
      const gitHubInfo = gitRepository?.gitHubInfo.read(reader);
      const hasPullRequest = gitHubInfo?.pullRequest?.uri !== void 0;
      const hasOpenPullRequest = hasPullRequest && (gitHubInfo.pullRequest.icon?.id === Codicon.gitPullRequestDraft.id || gitHubInfo.pullRequest.icon?.id === Codicon.gitPullRequest.id || gitHubInfo.pullRequest.icon?.id === Codicon.gitPullRequestError.id || gitHubInfo.pullRequest.icon?.id === Codicon.gitPullRequestComment.id);
      const hasGitHubRemote = gitRepository?.hasGitHubRemote ?? false;
      const upstreamBranchName = gitRepository?.upstreamBranchName;
      const incomingChanges = gitRepository?.incomingChanges ?? 0;
      const outgoingChanges = gitRepository?.outgoingChanges ?? 0;
      const uncommittedChanges = gitRepository?.uncommittedChanges ?? 0;
      const hasBranchChanges = activeSessionChanges.length > 0;
      const hasGitOperationInProgress = gitRepository?.hasGitOperationInProgress ?? false;
      return {
        isolationMode,
        hasGitRepository,
        branchName,
        baseBranchName,
        isMergeBaseBranchProtected,
        upstreamBranchName,
        incomingChanges,
        outgoingChanges,
        uncommittedChanges,
        hasBranchChanges,
        hasGitHubRemote,
        hasPullRequest,
        hasOpenPullRequest,
        hasGitOperationInProgress
      };
    });
    return derivedOpts(
      { equalsFn: structuralEquals },
      (reader) => activeSessionStateObs.read(reader)
    );
  }
  _getActiveSessionReviewComments() {
    return derived((reader) => {
      const sessionResource = this.activeSessionResourceObs.read(reader);
      if (!sessionResource) {
        return /* @__PURE__ */ new Map();
      }
      const result = /* @__PURE__ */ new Map();
      const prReviewState = this.codeReviewService.getPRReviewState(sessionResource).read(reader);
      if (prReviewState.kind === "loaded" /* Loaded */) {
        for (const comment of prReviewState.comments) {
          const uriKey = comment.uri.fsPath;
          result.set(uriKey, (result.get(uriKey) ?? 0) + 1);
        }
      }
      return result;
    });
  }
  _getActiveSessionAgentFeedback() {
    const didChangeFeedbackSignal = observableSignalFromEvent(this, this.agentFeedbackService.onDidChangeFeedback);
    return derived((reader) => {
      const sessionResource = this.agentFeedbackService.activeFeedbackSessionResource.read(reader);
      didChangeFeedbackSignal.read(reader);
      const feedbackItems = this.agentFeedbackService.getFeedback(sessionResource);
      const result = /* @__PURE__ */ new Map();
      for (const item of feedbackItems) {
        if (!item.sourcePRReviewCommentId && item.state !== "resolved" /* Resolved */) {
          const uriKey = item.resourceUri.fsPath;
          result.set(uriKey, (result.get(uriKey) ?? 0) + 1);
        }
      }
      return result;
    });
  }
  _bindContextKeys() {
    this._register(bindContextKey(ChangesetReviewSupportContext, this.contextKeyService, (reader) => {
      const changeset = this.activeSessionChangesetObs.read(reader);
      return changeset?.capabilities?.review === true;
    }));
    this._register(bindContextKey(ChangesetReviewedFilesContext, this.contextKeyService, (reader) => {
      const changes = this.activeSessionChangesObs.read(reader);
      return changes.filter((change) => change.reviewed).map((change) => change.modifiedUri?.toString() ?? change.originalUri?.toString()).filter((uri4) => uri4 !== void 0);
    }));
    const changesetOperationCountObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const changeset = this.activeSessionChangesetObs.read(reader);
      if (!changeset) {
        return lastValue ?? 0;
      }
      const operations = this.activeSessionChangesetOperationsObs.read(reader);
      return operations.filter((op) => op.scopes.includes("changeset" /* Changeset */)).length;
    });
    this._register(bindContextKey(ChangesetHasOperationsContext, this.contextKeyService, (reader) => {
      return changesetOperationCountObs.read(reader) > 0;
    }));
  }
};

ChangesViewService = __decorateClass([
  __decorateParam(0, IAgentFeedbackService),
  __decorateParam(1, ICodeReviewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ISessionsService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ISessionsManagementService)
], ChangesViewService);
export { ChangesetReviewSupportContext, ChangesetReviewedFilesContext, ChangesetHasOperationsContext, DEFAULT_SECTION_COLLAPSE_STATE, SESSION_VIEW_STATE_STORAGE_KEY, SESSION_VIEW_STATE_LIMIT, ChangesViewService };
