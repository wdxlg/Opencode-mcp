// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsTelemetry.contribution.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { SessionsLifecycleTracker } from "./module-3613.mjs";
import { SessionsTypedCharactersTracker } from "./module-3719.mjs";
import { URI } from "./module-0032.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { classifySessionWorkspaceTopology, getSessionsTelemetryProviderId, hashSessionIdForTelemetry } from "./module-1781.mjs";
import { hash } from "./module-0039.mjs";
import { Schemas } from "./module-0033.mjs";
import { ISearchService, getExcludes } from "./module-1000.mjs";
import { isChatRequestFileEntry, isImageVariableEntry } from "./module-0980.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionsTasksService } from "./module-3534.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsTelemetry.contribution.ts
var SessionsTelemetryContribution = class extends Disposable {
  constructor(_sessionsManagementService, _sessionsService, _telemetryService, _uriIdentityService, _storageService, _searchService, _configurationService, commandService, agentFeedbackService, sessionsPartService, sessionsProvidersService, _sessionsTasksService, modelService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._telemetryService = _telemetryService;
    this._uriIdentityService = _uriIdentityService;
    this._storageService = _storageService;
    this._searchService = _searchService;
    this._configurationService = _configurationService;
    this._sessionsTasksService = _sessionsTasksService;
    /** Final workspace file counts, keyed by session id (so subsequent log calls for the same session are instant). */
    this._workspaceFileCountCache = /* @__PURE__ */ new Map();
    /** Pending workspace file-count fetches, keyed by workspace URI so a prewarm started before a session-id assignment can be picked up after. */
    this._workspaceFileCountInFlight = /* @__PURE__ */ new Map();
    /** Listener per provider that waits for the provider's first batch of sessions so we can run a one-time reconciliation against tracked entries. */
    this._providerReconcileListeners = this._register(new DisposableMap());
    this._lifecycleTracker = new SessionsLifecycleTracker(this._storageService);
    this._typedCharactersTracker = this._register(new SessionsTypedCharactersTracker(
      () => this._sessionsService.activeSession.get(),
      (entries2) => this._recordTypedCharacters(entries2),
      modelService
    ));
    this._register(this._lifecycleTracker);
    this._register(this._storageService.onWillSaveState(() => this._typedCharactersTracker.flush()));
    this._register(this._sessionsManagementService.onWillSendRequest((session) => {
      this._startWorkspaceFileCountFetch(session.workspace.get());
    }));
    this._register(this._sessionsManagementService.onDidSendRequest((e4) => this._logRequestSent(e4)));
    this._register(this._sessionsManagementService.onDidArchiveSession((session) => this._logSessionArchived(session)));
    this._register(this._sessionsManagementService.onDidUnarchiveSession((session) => this._logSessionUnarchived(session)));
    this._register(this._sessionsManagementService.onDidDeleteSession((session) => this._logSessionDeleted(session)));
    this._register(this._sessionsManagementService.onDidDeleteChat((session) => this._logChatDeleted(session)));
    this._register(this._sessionsManagementService.onDidRenameChat((session) => this._logChatRenamed(session)));
    this._register(this._sessionsManagementService.onDidRenameSession((session) => this._logSessionRenamed(session)));
    this._register(this._sessionsService.onDidToggleSessionStickiness((e4) => this._logSessionStickinessToggled(e4.session, e4.sticky)));
    this._register(sessionsPartService.onDidToggleMaximizeSession((e4) => this._logSessionMaximizeToggled(e4.session, e4.maximized)));
    this._register(this._sessionsManagementService.onDidChangeSessions((e4) => this._onDidChangeSessions(e4)));
    for (const provider of sessionsProvidersService.getProviders()) {
      this._trackProviderForReconciliation(provider);
    }
    this._register(sessionsProvidersService.onDidChangeProviders((e4) => {
      for (const provider of e4.added) {
        this._trackProviderForReconciliation(provider);
      }
      for (const provider of e4.removed) {
        this._providerReconcileListeners.deleteAndDispose(provider.id);
      }
    }));
    this._register(commandService.onDidExecuteCommand((e4) => {
      let log4;
      switch (e4.commandId) {
        case "github.copilot.chat.createPullRequestCopilotCLIAgentSession.createPR":
        case "workbench.action.agentSessions.runSkill.createPR":
          log4 = (session2) => this._logCreatePullRequest(session2);
          break;
        case "workbench.action.agentSessions.runSkill.createDraftPR":
          log4 = (session2) => this._logCreateDraftPullRequest(session2);
          break;
        case "workbench.action.agentSessions.runSkill.updatePR":
          log4 = (session2) => this._logUpdatePullRequest(session2);
          break;
        case "github.copilot.chat.mergeCopilotCLIAgentSessionChanges.merge":
        case "workbench.action.agentSessions.runSkill.merge":
          log4 = (session2) => this._logMergePullRequest(session2);
          break;
        case "github.copilot.chat.checkoutPullRequestReroute":
        case "pr.checkoutFromChat":
          log4 = (session2) => this._logCheckoutPullRequest(session2);
          break;
        case "github.copilot.sessions.initializeRepository":
          log4 = (session2) => this._logInitializeRepository(session2);
          break;
        case "github.copilot.sessions.commit":
          log4 = (session2) => this._logCommit(session2);
          break;
        case "github.copilot.sessions.commitAndSync":
          log4 = (session2) => this._logCommitAndSync(session2);
          break;
        case "agentSession.restore":
          log4 = (session2) => this._logSessionRestored(session2);
          break;
        case "sessions.action.fixCIChecks":
          log4 = (session2) => this._logFixCIChecks(session2);
          break;
        default:
          return;
      }
      const session = this._getSessionFromCommandArgs(e4.args);
      if (session) {
        log4(session);
      }
    }));
    this._register(agentFeedbackService.onDidAddFeedback((e4) => this._logFeedbackAdded(e4)));
    this._register(agentFeedbackService.onDidConvertFeedback((e4) => this._logFeedbackConverted(e4)));
    this._register(agentFeedbackService.onDidAddReply((e4) => this._logFeedbackReplyAdded(e4)));
    this._register(agentFeedbackService.onDidSubmitFeedback((e4) => this._logFeedbackSubmitted(e4)));
    this._register(this._sessionsTasksService.onDidRunTask((e4) => this._lifecycleTracker.bumpCounter(e4.session, "taskRun")));
  }
  static {
    this.ID = "workbench.contrib.sessionsTelemetry";
  }
  /**
   * Resolves the session a session-scoped command was invoked on. The first
   * argument is expected to be either a session resource {@link URI} or a
   * `{ resource: URI }` shape (e.g. a `ChatSessionItem`). Returns `undefined`
   * if the argument is not a recognized session reference.
   */
  _getSessionFromCommandArgs(args2) {
    const first2 = args2[0];
    let resource;
    if (URI.isUri(first2)) {
      resource = first2;
    } else if (first2 && typeof first2 === "object" && URI.isUri(first2.resource)) {
      resource = first2.resource;
    }
    return resource ? this._sessionsManagementService.getSession(resource) : void 0;
  }
  // -- event handlers --------------------------------------------------------
  _logRequestSent(e4) {
    const { session, chat, isNewSession: isNewSession2, isNewChat, options: options3 } = e4;
    if (isNewChat) {
      const wasTracked = this._lifecycleTracker.isTracked(session.sessionId);
      this._lifecycleTracker.recordNewChatRequestSent(session);
      if (!wasTracked) {
        void this._sessionsTasksService.getAllTasks(session).then((tasks2) => {
          const hasWorktreeCreatedTask = tasks2.some((t2) => t2.task.runOptions?.runOn === "worktreeCreated");
          this._lifecycleTracker.recordFirstRequestTaskInfo(session, { hasWorktreeCreatedTask, configuredTasksCount: tasks2.length });
        });
      }
    } else {
      this._lifecycleTracker.recordRequestSent(session);
    }
    const allSessions = this._sessionsManagementService.getSessions();
    const visibleSessionsCount = this._sessionsService.visibleSessions.get().filter((s) => s !== void 0).length;
    const workspace = session.workspace.get();
    const requestCounters = isNewSession2 ? this._lifecycleTracker.incrementAndGetUserRequestCounters(session) : this._lifecycleTracker.getUserRequestCounters(session);
    const sync = {
      isNewSession: isNewSession2,
      isNewChat,
      visibleSessionsCount,
      ...this._getRequestFields(options3),
      ...this._getSessionFields(session),
      ...this._getChatFields(chat),
      ...this._getAllSessionsFields(session, allSessions),
      ...requestCounters
    };
    void this._getOrFetchWorkspaceFileCount(session.sessionId, workspace).then((workspaceFileCount) => {
      this._telemetryService.publicLog2("agents/requestSent", {
        ...sync,
        ...this._getWorkspaceFields(workspace, workspaceFileCount),
        ...this._getWorkspaceTopologyFields(workspace)
      });
    });
  }
  _logSessionArchived(session) {
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionArchived", payload);
    });
    this._fireSessionSummary(session, "archived");
  }
  _logSessionUnarchived(session) {
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionUnarchived", payload);
    });
  }
  _logSessionDeleted(session) {
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionDeleted", payload);
    });
    this._fireSessionSummary(session, "deleted");
  }
  _logChatDeleted(session) {
    this._lifecycleTracker.bumpCounter(session, "chatDeleted");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/chatDeleted", payload);
    });
  }
  _logChatRenamed(session) {
    this._lifecycleTracker.bumpCounter(session, "chatRenamed");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/chatRenamed", payload);
    });
  }
  _logSessionRenamed(session) {
    this._lifecycleTracker.bumpCounter(session, "sessionRenamed");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionRenamed", payload);
    });
  }
  _logSessionStickinessToggled(session, sticky) {
    this._lifecycleTracker.bumpCounter(session, "stickinessToggled");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionStickinessToggled", {
        ...payload,
        sticky
      });
    });
  }
  _logSessionMaximizeToggled(session, maximized) {
    this._lifecycleTracker.bumpCounter(session, "maximizeToggled");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionMaximizeToggled", {
        ...payload,
        maximized
      });
    });
  }
  _logCreatePullRequest(session) {
    this._lifecycleTracker.bumpCounter(session, "createPullRequest");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/createPullRequest", payload);
    });
  }
  _logCreateDraftPullRequest(session) {
    this._lifecycleTracker.bumpCounter(session, "createDraftPullRequest");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/createDraftPullRequest", payload);
    });
  }
  _logUpdatePullRequest(session) {
    this._lifecycleTracker.bumpCounter(session, "updatePullRequest");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/updatePullRequest", payload);
    });
  }
  _logMergePullRequest(session) {
    this._lifecycleTracker.bumpCounter(session, "mergePullRequest");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/mergePullRequest", payload);
    });
  }
  _logCheckoutPullRequest(session) {
    this._lifecycleTracker.bumpCounter(session, "checkoutPullRequest");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/checkoutPullRequest", payload);
    });
  }
  _logInitializeRepository(session) {
    this._lifecycleTracker.bumpCounter(session, "initializeRepository");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/initializeRepository", payload);
    });
  }
  _logCommit(session) {
    this._lifecycleTracker.bumpCounter(session, "commit");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/commit", payload);
    });
  }
  _logCommitAndSync(session) {
    this._lifecycleTracker.bumpCounter(session, "commitAndSync");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/commitAndSync", payload);
    });
  }
  _logSessionRestored(session) {
    this._lifecycleTracker.bumpCounter(session, "sessionRestored");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/sessionRestored", payload);
    });
  }
  _logFixCIChecks(session) {
    this._lifecycleTracker.bumpCounter(session, "fixCIChecks");
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/fixCIChecks", payload);
    });
  }
  _logFeedbackAdded(e4) {
    const session = this._sessionsManagementService.getSession(e4.sessionResource);
    if (!session) {
      return;
    }
    this._lifecycleTracker.bumpCounter(session, "feedbackAdded");
    const hasSuggestion = !!e4.feedback.suggestion;
    const hasExistingFeedbackForFile = e4.hasExistingFeedbackForFile;
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/feedbackAdded", {
        ...payload,
        hasSuggestion,
        hasExistingFeedbackForFile
      });
    });
  }
  _logFeedbackConverted(e4) {
    const session = this._sessionsManagementService.getSession(e4.sessionResource);
    if (!session) {
      return;
    }
    this._lifecycleTracker.bumpCounter(session, "feedbackConverted");
    const feedbackKind = e4.kind;
    const hasSuggestion = !!e4.feedback.suggestion;
    const hasExistingFeedbackForFile = e4.hasExistingFeedbackForFile;
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/feedbackConverted", {
        ...payload,
        feedbackKind,
        hasSuggestion,
        hasExistingFeedbackForFile
      });
    });
  }
  _logFeedbackReplyAdded(e4) {
    const session = this._sessionsManagementService.getSession(e4.sessionResource);
    if (!session) {
      return;
    }
    this._lifecycleTracker.bumpCounter(session, "feedbackReplyAdded");
    const feedbackKind = e4.feedback.kind;
    const replyCount = e4.replyCount;
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/feedbackReplyAdded", {
        ...payload,
        feedbackKind,
        replyCount
      });
    });
  }
  _logFeedbackSubmitted(e4) {
    const session = this._sessionsManagementService.getSession(e4.sessionResource);
    if (!session) {
      return;
    }
    this._lifecycleTracker.bumpCounter(session, "feedbackSubmitted");
    const { totalCount, userCount, codeReviewCount, prReviewCount, replyCount } = e4;
    void this._getSessionActionPayload(session).then((payload) => {
      this._telemetryService.publicLog2("agents/feedbackSubmitted", {
        ...payload,
        totalCount,
        userCount,
        codeReviewCount,
        prReviewCount,
        replyCount
      });
    });
  }
  // -- cross-client session-done detection -----------------------------------
  /**
   * Reacts to the session list changing across all providers and emits a
   * `agents/sessionSummary` event for tracked sessions that the user
   * finished (archived or deleted) in a different client. Local archive /
   * delete are handled directly by {@link _logSessionArchived} /
   * {@link _logSessionDeleted}; the deferred timer here gives those handlers
   * a chance to claim the tracked entry first so the `doneReason` is
   * reported as `archived` / `deleted` rather than `archivedRemotely` /
   * `deletedRemotely`.
   */
  _onDidChangeSessions(e4) {
    for (const session of e4.removed) {
      if (!this._lifecycleTracker.isTracked(session.sessionId)) {
        continue;
      }
      this._register(disposableTimeout(() => {
        this._fireSessionSummary(session, "deletedRemotely");
      }, 100));
    }
    for (const session of e4.changed) {
      if (!this._lifecycleTracker.isTracked(session.sessionId)) {
        continue;
      }
      if (session.isArchived.get()) {
        this._register(disposableTimeout(() => {
          this._fireSessionSummary(session, "archivedRemotely");
        }, 100));
      } else {
        this._lifecycleTracker.updateSessionState(session);
      }
    }
  }
  /**
   * Schedules a one-time reconciliation of tracked entries for `provider`.
   * Reconciliation runs as soon as the provider reports at least one live
   * session (its "loaded" signal). If the provider already has sessions at
   * registration time, this runs synchronously; otherwise we wait on
   * `onDidChangeSessions` and dispose the listener after the first run.
   */
  _trackProviderForReconciliation(provider) {
    if (this._tryReconcileProvider(provider)) {
      return;
    }
    this._providerReconcileListeners.set(provider.id, provider.onDidChangeSessions(() => {
      if (this._tryReconcileProvider(provider)) {
        this._providerReconcileListeners.deleteAndDispose(provider.id);
      }
    }));
  }
  /**
   * Reconciles tracked entries for `provider` against its current sessions.
   * For each tracked entry: finalizes as `deletedRemotely` when missing, or
   * `archivedRemotely` when present and archived. Returns `true` once the
   * provider has reported at least one session (so the caller can stop
   * listening).
   */
  _tryReconcileProvider(provider) {
    const sessions = provider.getSessions();
    if (sessions.length === 0) {
      return false;
    }
    const trackedForProvider = this._lifecycleTracker.getTrackedEntries().filter((e4) => e4.providerId === provider.id);
    if (trackedForProvider.length === 0) {
      return true;
    }
    this._typedCharactersTracker.flush();
    const liveById = /* @__PURE__ */ new Map();
    for (const session of sessions) {
      liveById.set(session.sessionId, session);
    }
    for (const { sessionId } of trackedForProvider) {
      const live = liveById.get(sessionId);
      if (!live) {
        const summary = this._lifecycleTracker.finalize(sessionId, "deletedRemotely");
        if (summary) {
          this._logSessionSummary(summary);
        }
      } else if (live.isArchived.get()) {
        this._fireSessionSummary(live, "archivedRemotely");
      }
    }
    return true;
  }
  _fireSessionSummary(session, reason) {
    this._typedCharactersTracker.flush();
    const summary = this._lifecycleTracker.finalize(session.sessionId, reason, session);
    if (summary) {
      this._logSessionSummary(summary);
    }
  }
  _logSessionSummary(summary) {
    this._telemetryService.publicLog2("agents/sessionSummary", summary);
  }
  // -- manually typed characters ---------------------------------------------
  /**
   * Attributes a reported batch to the session each entry was typed into and
   * returns the entries that could not be attributed yet.
   *
   * An absent workspace does not mean the file is unrelated: session
   * workspaces hydrate asynchronously, so those entries are handed back to be
   * retried rather than dropped. A quick chat is workspace-less by product
   * intent, so its typing is discarded instead of retried.
   */
  _recordTypedCharacters(entries2) {
    const deferred = [];
    for (const entry of entries2) {
      const { session, resource, characters } = entry;
      const folders = session.workspace.get()?.folders;
      if (!folders?.length) {
        if (!session.isQuickChat?.get()) {
          deferred.push(entry);
        }
        continue;
      }
      if (folders.some((folder) => this._uriIdentityService.extUri.isEqualOrParent(resource, folder.workingDirectory))) {
        this._lifecycleTracker.addTypedCharacters(session.sessionId, resource, characters);
      }
    }
    return deferred;
  }
  _getSessionActionPayload(session) {
    const workspace = session.workspace.get();
    const sessionFields = this._getSessionFields(session);
    const changesFields = this._getSessionChangesFields(session);
    return this._getOrFetchWorkspaceFileCount(session.sessionId, workspace).then((workspaceFileCount) => ({
      ...sessionFields,
      ...this._getWorkspaceFields(workspace, workspaceFileCount),
      ...changesFields
    }));
  }
  // -- field-group getters (reusable by other telemetry events) --------------
  _getSessionFields(session) {
    return {
      agentSessionId: hashSessionIdForTelemetry(session.sessionId),
      providerId: getSessionsTelemetryProviderId(session.providerId),
      providerType: session.sessionType,
      chatCount: session.chats.get().length,
      isExternal: session.isExternal?.get() ?? false
    };
  }
  _getSessionChangesFields(session) {
    const summary = session.changesSummary?.get();
    if (summary) {
      return {
        sessionFilesChanged: summary.files,
        sessionLinesAdded: summary.additions,
        sessionLinesDeleted: summary.deletions
      };
    }
    let sessionFilesChanged = 0;
    let sessionLinesAdded = 0;
    let sessionLinesDeleted = 0;
    for (const change of session.changes.get()) {
      sessionFilesChanged++;
      sessionLinesAdded += change.insertions;
      sessionLinesDeleted += change.deletions;
    }
    return { sessionFilesChanged, sessionLinesAdded, sessionLinesDeleted };
  }
  _getChatFields(chat) {
    return {
      chatModeKind: chat.mode.get()?.kind ?? ""
    };
  }
  _getWorkspaceFields(workspace, workspaceFileCount) {
    if (!workspace) {
      return {
        isolationKind: "folder",
        workspaceHash: "",
        hasGitRepository: false,
        isVirtualWorkspace: false,
        workspaceFileCount
      };
    }
    const hasWorktree = workspace.folders.some((folder) => folder.gitRepository?.workTreeUri !== void 0);
    return {
      isolationKind: hasWorktree ? "worktree" : "folder",
      workspaceHash: hash(workspace.uri.toString()).toString(16),
      hasGitRepository: workspace.folders.some((folder) => folder.gitRepository !== void 0),
      isVirtualWorkspace: workspace.uri.scheme !== Schemas.file,
      workspaceFileCount
    };
  }
  _getWorkspaceTopologyFields(workspace) {
    const folders = workspace?.folders ?? [];
    const gitFolderCount = folders.filter((folder) => folder.gitRepository !== void 0).length;
    const { isMultiRoot, folderCount, nonGitFolderCount } = classifySessionWorkspaceTopology(folders.length, gitFolderCount);
    return { isMultiRoot, folderCount, gitFolderCount, nonGitFolderCount };
  }
  _getOrFetchWorkspaceFileCount(sessionId, workspace) {
    const cached = this._workspaceFileCountCache.get(sessionId);
    if (cached !== void 0) {
      return Promise.resolve(cached);
    }
    const pending = this._startWorkspaceFileCountFetch(workspace);
    if (!pending) {
      return Promise.resolve(-1);
    }
    return pending.then((count2) => {
      this._workspaceFileCountCache.set(sessionId, count2);
      return count2;
    });
  }
  _startWorkspaceFileCountFetch(workspace) {
    if (!workspace || workspace.folders.length === 0) {
      return void 0;
    }
    const workspaceKey = workspace.uri.toString();
    let pending = this._workspaceFileCountInFlight.get(workspaceKey);
    if (!pending) {
      pending = this._computeWorkspaceFileCount(workspace).then((count2) => {
        this._workspaceFileCountInFlight.delete(workspaceKey);
        return count2;
      }, () => {
        this._workspaceFileCountInFlight.delete(workspaceKey);
        return -1;
      });
      this._workspaceFileCountInFlight.set(workspaceKey, pending);
    }
    return pending;
  }
  async _computeWorkspaceFileCount(workspace) {
    const excludePattern = getExcludes(this._configurationService.getValue({ resource: workspace.uri }));
    const result = await this._searchService.fileSearch({
      folderQueries: workspace.folders.map((folder) => ({ folder: folder.root, disregardIgnoreFiles: false })),
      type: 1 /* File */,
      filePattern: "",
      excludePattern
    });
    return result.results.length;
  }
  _getRequestFields(options3) {
    const attachments = options3.attachedContext ?? [];
    return {
      queryLength: options3.query?.length ?? 0,
      totalAttachementCount: attachments.length,
      fileAttachmentCount: attachments.filter(isChatRequestFileEntry).length,
      imageAttachmentCount: attachments.filter(isImageVariableEntry).length,
      attachmentKinds: JSON.stringify(countAttachmentsByKind(attachments))
    };
  }
  _getAllSessionsFields(anchorSession, allSessions) {
    const anchorWorkspaceUri = anchorSession.workspace.get()?.uri;
    const isSameWorkspace = (other) => {
      if (!anchorWorkspaceUri) {
        return false;
      }
      const otherWorkspaceUri = other.workspace.get()?.uri;
      return otherWorkspaceUri !== void 0 && this._uriIdentityService.extUri.isEqual(anchorWorkspaceUri, otherWorkspaceUri);
    };
    const inCurrentWorkspaceFolderOnly = [];
    const inCurrentWorkspace = [];
    const inAll = [];
    for (const session of allSessions) {
      if (session.sessionId === anchorSession.sessionId) {
        continue;
      }
      if (session.isArchived.get()) {
        continue;
      }
      inAll.push(session);
      if (isSameWorkspace(session)) {
        inCurrentWorkspace.push(session);
        const hasWorktree = session.workspace.get()?.folders.some((folder) => folder.gitRepository?.workTreeUri !== void 0) ?? false;
        if (!hasWorktree) {
          inCurrentWorkspaceFolderOnly.push(session);
        }
      }
    }
    const folderOnly = countByStatus(inCurrentWorkspaceFolderOnly);
    const currentWorkspace = countByStatus(inCurrentWorkspace);
    const all = countByStatus(inAll);
    return {
      currentWorkspaceFolderInProgress: folderOnly.inProgress,
      currentWorkspaceFolderUnread: folderOnly.unread,
      currentWorkspaceFolderWaitingForInput: folderOnly.waitingForInput,
      currentWorkspaceFolderNotDone: folderOnly.notDone,
      currentWorkspaceInProgress: currentWorkspace.inProgress,
      currentWorkspaceUnread: currentWorkspace.unread,
      currentWorkspaceWaitingForInput: currentWorkspace.waitingForInput,
      currentWorkspaceNotDone: currentWorkspace.notDone,
      allWorkspacesInProgress: all.inProgress,
      allWorkspacesUnread: all.unread,
      allWorkspacesWaitingForInput: all.waitingForInput,
      allWorkspacesNotDone: all.notDone
    };
  }
};

SessionsTelemetryContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ISearchService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IAgentFeedbackService),
  __decorateParam(9, ISessionsPartService),
  __decorateParam(10, ISessionsProvidersService),
  __decorateParam(11, ISessionsTasksService),
  __decorateParam(12, IModelService)
], SessionsTelemetryContribution);

function countByStatus(sessions) {
  let inProgress = 0;
  let unread = 0;
  let waitingForInput = 0;
  for (const session of sessions) {
    const status2 = session.status.get();
    if (status2 === 1 /* InProgress */) {
      inProgress++;
    }
    if (status2 === 2 /* NeedsInput */) {
      waitingForInput++;
    }
    if (!session.isRead.get()) {
      unread++;
    }
  }
  return { inProgress, unread, waitingForInput, notDone: sessions.length };
}

function countAttachmentsByKind(attachments) {
  const counts = {};
  for (const attachment of attachments) {
    counts[attachment.kind] = (counts[attachment.kind] ?? 0) + 1;
  }
  return counts;
}
export { countByStatus, countAttachmentsByKind, SessionsTelemetryContribution };
