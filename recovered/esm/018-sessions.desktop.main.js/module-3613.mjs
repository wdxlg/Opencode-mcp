// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsLifecycleTracker.ts
import { StringSHA1, hash } from "./module-0039.mjs";
import { Disposable } from "./module-0012.mjs";
import { classifySessionWorkspaceTopology, getSessionsTelemetryProviderId, hashSessionIdForTelemetry } from "./module-1781.mjs";
import { getPullRequestStatusFromIcon } from "./module-3594.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsLifecycleTracker.ts
var APP_LAUNCH_COUNT_KEY = "agentSessions.telemetry.summary.appLaunchCount";

var SESSIONS_KEY = "agentSessions.telemetry.summary.sessions";

var TOTAL_SESSIONS_KEY = "agentSessions.telemetry.totalSessions";

var WORKSPACE_SESSIONS_KEY = "agentSessions.telemetry.workspaceSessions";

var PROVIDER_SESSIONS_KEY = "agentSessions.telemetry.providerSessions";

var MAX_TRACKED_SESSIONS = 2e3;

var MAX_TYPED_FILES_PER_SESSION = 250;

var TYPED_FILE_HASH_LENGTH = 12;

function hashTypedFilePath(resource) {
  const sha1 = new StringSHA1();
  sha1.update(resource.toString());
  return sha1.digest().substring(0, TYPED_FILE_HASH_LENGTH);
}

var SessionsLifecycleTracker = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
    const previousAppLaunches = this._storageService.getNumber(APP_LAUNCH_COUNT_KEY, -1 /* APPLICATION */, 0);
    this._appLaunchCount = previousAppLaunches + 1;
    this._storageService.store(APP_LAUNCH_COUNT_KEY, this._appLaunchCount, -1 /* APPLICATION */, 1 /* MACHINE */);
    this._stats = this._load();
  }
  /** Record a request that creates a new chat for the given session. Bumps both `requestsSent` and `chatCount`. */
  recordNewChatRequestSent(session) {
    this._recordRequestSent(
      session,
      /* isNewChat */
      true
    );
  }
  /** Record a follow-up request within an existing chat. Bumps `requestsSent` but not `chatCount`. */
  recordRequestSent(session) {
    this._recordRequestSent(
      session,
      /* isNewChat */
      false
    );
  }
  _recordRequestSent(session, isNewChat) {
    const entry = this._ensure(session);
    entry.requestsSent++;
    if (isNewChat) {
      entry.chatCount++;
    }
    if (entry.firstRequestSentAt === 0) {
      entry.firstRequestSentAt = Date.now();
      entry.firstRequestSentInThisClient = true;
    }
    this._updateObservedState(entry, session);
    this._save();
  }
  /**
   * Records task-related state observed at the time of the first user
   * request for the given session. Only the first call per tracked session
   * has an effect; subsequent calls are ignored.
   */
  recordFirstRequestTaskInfo(session, info) {
    const entry = this._stats.get(session.sessionId);
    if (!entry || entry.hasWorktreeCreatedTask !== void 0) {
      return;
    }
    entry.hasWorktreeCreatedTask = info.hasWorktreeCreatedTask;
    entry.configuredTasksCount = info.configuredTasksCount;
    this._save();
  }
  /** Increment a named counter. Creates a tracking entry if the session is not yet tracked. */
  bumpCounter(session, key3) {
    const entry = this._ensure(session);
    entry[key3]++;
    this._updateObservedState(entry, session);
    this._save();
  }
  /**
   * Adds characters the user manually typed into `resource`, which must live
   * in the session's workspace folders. Unlike {@link bumpCounter} this never
   * starts tracking a session: editing a folder is not by itself an
   * interaction with the session that happens to use it.
   *
   * `resource` is only used to tell files apart for {@link ISessionLifecycleSummary.typedFileCount}
   * and is stored as a hash, never as a path.
   */
  addTypedCharacters(sessionId, resource, characters) {
    const entry = this._stats.get(sessionId);
    if (!entry || characters <= 0) {
      return;
    }
    entry.typedCharacters = (entry.typedCharacters ?? 0) + characters;
    const fileHash = hashTypedFilePath(resource);
    const typedFileHashes = entry.typedFileHashes ?? (entry.typedFileHashes = []);
    if (typedFileHashes.length < MAX_TYPED_FILES_PER_SESSION && !typedFileHashes.includes(fileHash)) {
      typedFileHashes.push(fileHash);
    }
    this._save();
  }
  /** Refresh observed session state (pull requests, changes) for a tracked session. No-op when not tracked. */
  updateSessionState(session) {
    const entry = this._stats.get(session.sessionId);
    if (!entry) {
      return;
    }
    this._updateObservedState(entry, session);
    this._save();
  }
  /**
   * Increments the persisted user-request counters (total, per-workspace,
   * per-provider) and returns the new values. Should be called once per
   * brand-new session the user starts from the Agents window.
   */
  incrementAndGetUserRequestCounters(session) {
    const providerId = getSessionsTelemetryProviderId(session.providerId);
    const workspaceUri = session.workspace.get()?.uri.toString();
    const userSessionsTotal = this._storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0) + 1;
    this._storageService.store(TOTAL_SESSIONS_KEY, userSessionsTotal, -1 /* APPLICATION */, 1 /* MACHINE */);
    const providerCounts = this._readProviderCounterMap();
    const userSessionsForProvider = (providerCounts[providerId] ?? 0) + 1;
    providerCounts[providerId] = userSessionsForProvider;
    this._storageService.store(PROVIDER_SESSIONS_KEY, JSON.stringify(providerCounts), -1 /* APPLICATION */, 1 /* MACHINE */);
    let userSessionsInWorkspace = 0;
    if (workspaceUri) {
      const workspaceCounts = this._readCounterMap(WORKSPACE_SESSIONS_KEY);
      userSessionsInWorkspace = (workspaceCounts[workspaceUri] ?? 0) + 1;
      workspaceCounts[workspaceUri] = userSessionsInWorkspace;
      this._storageService.store(WORKSPACE_SESSIONS_KEY, JSON.stringify(workspaceCounts), -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    return { userSessionsTotal, userSessionsInWorkspace, userSessionsForProvider };
  }
  /** Reads the persisted user-request counters without incrementing them. */
  getUserRequestCounters(session) {
    return this._readUserRequestCounters(session.providerId, session.workspace.get()?.uri.toString());
  }
  /** Whether the given session id has a tracking entry. */
  isTracked(sessionId) {
    return this._stats.has(sessionId);
  }
  /** Snapshot of tracked session ids. */
  getTrackedIds() {
    return [...this._stats.keys()];
  }
  /** Snapshot of tracked sessions as `(sessionId, providerId)` pairs. */
  getTrackedEntries() {
    const result = [];
    for (const [sessionId, entry] of this._stats) {
      result.push({ sessionId, providerId: entry.providerId });
    }
    return result;
  }
  /**
   * Build a summary for the given tracked session and remove its entry.
   * Returns `undefined` if the session was not tracked (e.g., already
   * finalized by a competing event).
   */
  finalize(sessionId, reason, finalSession) {
    const entry = this._stats.get(sessionId);
    if (!entry) {
      return void 0;
    }
    if (finalSession) {
      this._updateObservedState(entry, finalSession);
    }
    this._stats.delete(sessionId);
    this._save();
    return buildSummary(sessionId, entry, reason, this._appLaunchCount, this._readUserRequestCountersForSummary(entry));
  }
  // -- internals -------------------------------------------------------------
  _readUserRequestCountersForSummary(entry) {
    return this._readUserRequestCounters(entry.providerId, entry.workspaceUriString || void 0);
  }
  _readUserRequestCounters(providerId, workspaceUri) {
    const userSessionsTotal = this._storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0);
    const providerCounts = this._readProviderCounterMap();
    const userSessionsForProvider = providerCounts[getSessionsTelemetryProviderId(providerId)] ?? 0;
    let userSessionsInWorkspace = 0;
    if (workspaceUri) {
      const workspaceCounts = this._readCounterMap(WORKSPACE_SESSIONS_KEY);
      userSessionsInWorkspace = workspaceCounts[workspaceUri] ?? 0;
    }
    return { userSessionsTotal, userSessionsInWorkspace, userSessionsForProvider };
  }
  _readProviderCounterMap() {
    const storedCounts = this._readCounterMap(PROVIDER_SESSIONS_KEY);
    const providerCounts = {};
    for (const [providerId, count2] of Object.entries(storedCounts)) {
      const telemetryProviderId = getSessionsTelemetryProviderId(providerId);
      providerCounts[telemetryProviderId] = (providerCounts[telemetryProviderId] ?? 0) + count2;
    }
    return providerCounts;
  }
  _readCounterMap(key3) {
    const raw = this._storageService.get(key3, -1 /* APPLICATION */);
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  _ensure(session) {
    const id2 = session.sessionId;
    let entry = this._stats.get(id2);
    if (!entry) {
      if (this._stats.size >= MAX_TRACKED_SESSIONS) {
        this._evictOldest();
      }
      entry = createEntry(session, this._appLaunchCount);
      this._stats.set(id2, entry);
    }
    return entry;
  }
  /**
   * Refreshes the parts of the entry that mirror live session state, so the
   * summary reports what was last observed rather than what was known when
   * tracking started.
   */
  _updateObservedState(entry, session) {
    entry.isExternal = session.isExternal?.get() ?? entry.isExternal ?? false;
    this._updateWorkspaceTopology(entry, session);
    this._updatePullRequestState(entry, session);
    this._updateChangesSummary(entry, session);
  }
  /**
   * Refreshes the folder counts. A session's workspace is resolved
   * asynchronously and can gain folders later, so the counts known when
   * tracking started are not what the user ended up working with.
   */
  _updateWorkspaceTopology(entry, session) {
    const folders = session.workspace.get()?.folders;
    if (!folders || folders.length === 0) {
      return;
    }
    const topology = classifySessionWorkspaceTopology(folders.length, folders.filter((folder) => folder.gitRepository !== void 0).length);
    entry.isMultiRoot = topology.isMultiRoot;
    entry.folderCount = topology.folderCount;
    entry.gitFolderCount = topology.gitFolderCount;
    entry.nonGitFolderCount = topology.nonGitFolderCount;
  }
  _updatePullRequestState(entry, session) {
    const gitHubInfo = session.workspace.get()?.folders[0]?.gitRepository?.gitHubInfo.get();
    if (!gitHubInfo) {
      return;
    }
    const pullRequests = gitHubInfo.pullRequests;
    entry.pullRequestCount = pullRequests?.length ?? (gitHubInfo.pullRequest ? 1 : 0);
    entry.pullRequestStatus = getPullRequestStatusFromIcon(gitHubInfo.pullRequest?.icon ?? pullRequests?.[0]?.icon);
  }
  _updateChangesSummary(entry, session) {
    const summary = session.changesSummary?.get();
    if (summary) {
      entry.filesChanged = summary.files;
      entry.linesAdded = summary.additions;
      entry.linesDeleted = summary.deletions;
      return;
    }
    let files = 0;
    let additions = 0;
    let deletions = 0;
    for (const change of session.changes.get()) {
      files++;
      additions += change.insertions;
      deletions += change.deletions;
    }
    entry.filesChanged = files;
    entry.linesAdded = additions;
    entry.linesDeleted = deletions;
  }
  _evictOldest() {
    let oldestId;
    let oldestTime = Number.POSITIVE_INFINITY;
    for (const [id2, entry] of this._stats) {
      if (entry.firstObservedAt < oldestTime) {
        oldestTime = entry.firstObservedAt;
        oldestId = id2;
      }
    }
    if (oldestId !== void 0) {
      this._stats.delete(oldestId);
    }
  }
  _load() {
    const raw = this._storageService.get(SESSIONS_KEY, -1 /* APPLICATION */);
    const map = /* @__PURE__ */ new Map();
    if (!raw) {
      return map;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const [id2, value2] of Object.entries(parsed)) {
          if (value2 && typeof value2 === "object") {
            const entry = value2;
            if (entry.typedFileHashes?.some((fileHash) => typeof fileHash !== "string")) {
              entry.typedFileHashes = [];
            }
            map.set(id2, entry);
          }
        }
      }
    } catch {
    }
    return map;
  }
  _save() {
    if (this._stats.size === 0) {
      this._storageService.remove(SESSIONS_KEY, -1 /* APPLICATION */);
      return;
    }
    const obj = {};
    for (const [id2, entry] of this._stats) {
      obj[id2] = entry;
    }
    this._storageService.store(SESSIONS_KEY, JSON.stringify(obj), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

function createEntry(session, appLaunchCount) {
  const workspace = session.workspace.get();
  const workspaceUriString = workspace?.uri.toString() ?? "";
  const hasWorktree = workspace?.folders.some((folder) => folder.gitRepository?.workTreeUri !== void 0) ?? false;
  const hasGit = workspace?.folders.some((folder) => folder.gitRepository !== void 0) ?? false;
  const isVirtual = workspace ? workspace.uri.scheme !== Schemas.file : false;
  const folders = workspace?.folders ?? [];
  const topology = classifySessionWorkspaceTopology(folders.length, folders.filter((folder) => folder.gitRepository !== void 0).length);
  return {
    providerId: session.providerId,
    providerType: session.sessionType,
    sessionResourceUri: session.resource.toString(),
    workspaceUriString,
    isolationKind: hasWorktree ? "worktree" : "folder",
    hasGitRepository: hasGit,
    isVirtualWorkspace: isVirtual,
    isExternal: session.isExternal?.get() ?? false,
    isMultiRoot: topology.isMultiRoot,
    folderCount: topology.folderCount,
    gitFolderCount: topology.gitFolderCount,
    nonGitFolderCount: topology.nonGitFolderCount,
    firstRequestSentInThisClient: false,
    hasWorktreeCreatedTask: void 0,
    configuredTasksCount: void 0,
    firstObservedAt: Date.now(),
    firstRequestSentAt: 0,
    appLaunchCountAtFirstObserved: appLaunchCount,
    requestsSent: 0,
    chatCount: 0,
    feedbackAdded: 0,
    feedbackConverted: 0,
    feedbackReplyAdded: 0,
    feedbackSubmitted: 0,
    createPullRequest: 0,
    createDraftPullRequest: 0,
    updatePullRequest: 0,
    mergePullRequest: 0,
    checkoutPullRequest: 0,
    initializeRepository: 0,
    commit: 0,
    commitAndSync: 0,
    sessionRestored: 0,
    stickinessToggled: 0,
    maximizeToggled: 0,
    chatDeleted: 0,
    chatRenamed: 0,
    sessionRenamed: 0,
    fixCIChecks: 0,
    taskRun: 0,
    typedCharacters: 0,
    typedFileHashes: [],
    filesChanged: 0,
    linesAdded: 0,
    linesDeleted: 0,
    pullRequestCount: 0,
    pullRequestStatus: void 0
  };
}

function buildSummary(sessionId, entry, reason, appLaunchCount, requestCounters) {
  const now = Date.now();
  return {
    agentSessionId: hashSessionIdForTelemetry(sessionId),
    providerId: getSessionsTelemetryProviderId(entry.providerId),
    providerType: entry.providerType,
    isolationKind: entry.isolationKind,
    workspaceHash: entry.workspaceUriString ? hash(entry.workspaceUriString).toString(16) : "",
    hasGitRepository: entry.hasGitRepository,
    isVirtualWorkspace: entry.isVirtualWorkspace,
    // Back-compat: entries persisted before these fields existed default to 0/false.
    isExternal: entry.isExternal ?? false,
    isMultiRoot: entry.isMultiRoot ?? false,
    folderCount: entry.folderCount ?? 0,
    gitFolderCount: entry.gitFolderCount ?? 0,
    nonGitFolderCount: entry.nonGitFolderCount ?? 0,
    doneReason: reason,
    firstRequestSentInThisClient: entry.firstRequestSentInThisClient,
    hasWorktreeCreatedTask: entry.hasWorktreeCreatedTask,
    configuredTasksCount: entry.configuredTasksCount,
    timeSinceFirstObservedMs: now - entry.firstObservedAt,
    timeSinceFirstRequestMs: entry.firstRequestSentAt > 0 ? now - entry.firstRequestSentAt : -1,
    appLaunchesSinceFirstObserved: appLaunchCount - entry.appLaunchCountAtFirstObserved,
    requestsSent: entry.requestsSent,
    chatCount: entry.chatCount,
    feedbackAdded: entry.feedbackAdded,
    feedbackConverted: entry.feedbackConverted,
    feedbackReplyAdded: entry.feedbackReplyAdded,
    feedbackSubmitted: entry.feedbackSubmitted,
    createPullRequest: entry.createPullRequest,
    createDraftPullRequest: entry.createDraftPullRequest,
    updatePullRequest: entry.updatePullRequest,
    mergePullRequest: entry.mergePullRequest,
    checkoutPullRequest: entry.checkoutPullRequest,
    initializeRepository: entry.initializeRepository,
    commit: entry.commit,
    commitAndSync: entry.commitAndSync,
    sessionRestored: entry.sessionRestored,
    stickinessToggled: entry.stickinessToggled,
    maximizeToggled: entry.maximizeToggled,
    chatDeleted: entry.chatDeleted,
    chatRenamed: entry.chatRenamed,
    sessionRenamed: entry.sessionRenamed,
    fixCIChecks: entry.fixCIChecks,
    taskRun: entry.taskRun,
    typedCharacters: entry.typedCharacters ?? 0,
    typedFileCount: entry.typedFileHashes?.length ?? 0,
    filesChanged: entry.filesChanged,
    linesAdded: entry.linesAdded,
    linesDeleted: entry.linesDeleted,
    pullRequestCount: entry.pullRequestCount ?? 0,
    pullRequestStatus: entry.pullRequestStatus,
    userSessionsTotal: requestCounters.userSessionsTotal,
    userSessionsInWorkspace: requestCounters.userSessionsInWorkspace,
    userSessionsForProvider: requestCounters.userSessionsForProvider
  };
}
export { hashTypedFilePath, createEntry, buildSummary, APP_LAUNCH_COUNT_KEY, SESSIONS_KEY, TOTAL_SESSIONS_KEY, WORKSPACE_SESSIONS_KEY, PROVIDER_SESSIONS_KEY, MAX_TRACKED_SESSIONS, MAX_TYPED_FILES_PER_SESSION, TYPED_FILE_HASH_LENGTH, SessionsLifecycleTracker };
