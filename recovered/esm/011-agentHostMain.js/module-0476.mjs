// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentService.ts
import { AH_META_CREATED_BY_SESSION_DB_KEY, AH_META_EHCLI_ADOPTED_DB_KEY, AH_META_IS_ARCHIVED_DB_KEY, AH_META_IS_DONE_DB_KEY, AH_META_IS_READ_DB_KEY, AH_META_WORKSPACELESS_DB_KEY, AUTOMATION_CATALOG_URI, SESSION_META_FOLDER_PICKER_KEY, SESSION_META_GITHUB_KEY, SESSION_META_GIT_KEY, SESSION_META_MULTI_ROOT_KEY, SESSION_META_SOURCE_CONTROL_KEY, buildChatUri, buildDefaultChatUri, buildResourceWatchChannelUri, buildSubagentChatUri, buildSubagentSessionUriPrefix, getErrorResponsePart, isAhpAutomationRunChannel, isAhpChatChannel, isChatReadOnly, isDefaultChatUri, isSubagentChatUri, isSubagentSession, needsSessionGitStateRefresh, parseChatUri, parseDefaultChatUri, parseRequiredSessionUriFromChatUri, parseResourceWatchChannelUri, parseSessionCreationReference, parseSessionFolderPickerDecision, parseSessionMultiRootMetadata, parseSubagentSessionUri, readSessionCreationReference, readSessionEhcliAdoptable, readSessionExternal, readSessionFolderPickerDecision, readSessionGitHubState, readSessionGitState, readSessionMultiRootMetadata, readSessionSourceControlState, readSessionSpawnDepth, readSessionWorkspaceless, withMessageHiddenFromTranscript, withSessionCreationReference, withSessionEhcliAdopted, withSessionExternal, withSessionFolderPickerDecision, withSessionGitHubState, withSessionGitState, withSessionMultiRootMetadata, withSessionSourceControlState, withSessionSpawnDepth, withSessionStatusFlag, withSessionWorkspaceless } from "./module-0047.mjs";
import { Disposable, DisposableMap, DisposableResourceMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { Barrier, DeferredPromise, Limiter, ResourceQueue, disposableTimeout } from "./module-0027.mjs";
import { Emitter } from "./module-0016.mjs";
import { AgentSessionResidency } from "./module-0481.mjs";
import { URI } from "./module-0023.mjs";
import { updateAgentHostTelemetryLevelFromConfig } from "./module-0266.mjs";
import { AgentHostActiveAgentTitleGenerationConfigKey, AgentHostArtifactToolsConfigKey, AgentHostEditTelemetryEnabledConfigKey, AgentHostMigrateLegacyCopilotCliEnabledConfigKey, AgentHostShowExternalSessionsConfigKey, platformRootSchema } from "./module-0057.mjs";
import { AgentChatMigrationDeferred, AgentSession, SubagentChatSignal, subagentChatTitle } from "./module-0048.mjs";
import { toErrorMessage } from "./module-0080.mjs";
import { IAgentHostWorktreeIsolation, WORKTREE_META_REPOSITORY_ROOT, buildWorktreeFailureNotification, worktreeProjectFromRepositoryRoot } from "./module-0165.mjs";
import { generateUuid } from "./module-0042.mjs";
import { AgentHostSkillCompletionProvider } from "./module-0483.mjs";
import { AGENT_HOST_TITLE_SOURCE_AGENT, SESSION_ARTIFACTS_KEY, SESSION_CUSTOM_TITLE_KEY, SESSION_CUSTOM_TITLE_SOURCE_KEY, customChatTitleMetadataKey, customChatTitleSourceMetadataKey, persistSessionMetadata, persistSessionMetadataValues } from "./module-0482.mjs";
import { parseSessionArtifacts, stringifySessionArtifacts, withSessionArtifacts } from "./module-0233.mjs";
import { AgentMergeConfigKey, agentMergeRootConfigSchema, getNonMergeSessionConfigValues, readAgentMergeSessionState } from "./module-0116.mjs";
import { toAgentMessageDelegationMeta } from "./module-0378.mjs";
import { toAgentMergeMessageMeta } from "./module-0250.mjs";
import { toAgentSystemNotificationMeta } from "./module-0166.mjs";
import { validateRenameTitle } from "./module-0231.mjs";
import { GIT_DB_METADATA_KEYS, META_GITHUB_STATE, META_GIT_STATE, META_SOURCE_CONTROL_STATE } from "./module-0445.mjs";
import { readEphemeralSessionMeta, withEphemeralSessionMeta } from "./module-0101.mjs";
import { localize } from "./module-0012.mjs";
import { resolveLastNonLocalTurnId } from "./module-0486.mjs";
import { createAgentChatContext } from "./module-0479.mjs";
import { readChatSurfaceMeta, withChatSurfaceMeta } from "./module-0102.mjs";
import { isAnnotationsAction, isPassiveSessionMetadataAction, isSessionAction } from "./module-0086.mjs";
import { buildAnnotationsUri, parseAnnotationsUri } from "./module-0098.mjs";
import { parseChangesetUri } from "./module-0097.mjs";
import { IAgentHostSubscriptionService, resolveAgentHostSession } from "./module-0480.mjs";
import { dirname2, extUriBiasedIgnorePathCase, extname2, isEqual2, isEqualOrParent2, joinPath } from "./module-0025.mjs";
import { createUnknownAgentHostClientTelemetryContext } from "./module-0054.mjs";
import { AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY, isAgentHostAutomationMigrationCompletion } from "./module-0447.mjs";
import { resolveSessionWorkingDirectoryAction } from "./module-0155.mjs";
import { isHostSnapshotAttachment, toHostSnapshotAttachmentMeta } from "./module-0189.mjs";
import { ISessionDataService, SESSION_ATTACHMENTS_DIRNAME } from "./module-0139.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0029.mjs";
import { getExtensionForMimeType, getMediaMime, getMediaOrTextMime } from "./module-0280.mjs";
import { Schemas } from "./module-0024.mjs";
import { toAgentClientUri } from "./module-0485.mjs";
import { AHP_SESSION_NOT_FOUND, JSON_RPC_INTERNAL_ERROR, ProtocolError } from "./module-0056.mjs";
import { AhpErrorCodes } from "./module-0055.mjs";
import { CHANGESET_DB_METADATA_KEYS, META_CHANGES_SUMMARY } from "./module-0444.mjs";
import { readToolCallMeta } from "./module-0046.mjs";
import { IAgentEditAttributionService, parseEditAttributionResource } from "./module-0260.mjs";
import { parseSessionDbUri } from "./module-0261.mjs";
import { parseGitBlobUri } from "./module-0477.mjs";
import { IFileService, toFileOperationResult } from "./module-0128.mjs";
import { getEffectiveWorkingDirectories } from "./module-0104.mjs";
import { findDeepestContainingWorkingDirectory, isMultiRootSession } from "./module-0478.mjs";
import { resolveSessionRepositories } from "./module-0451.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { IAgentHostSessionOpenTelemetry } from "./module-0203.mjs";
import { IAgentHostChatContributions } from "./module-0487.mjs";
import { INetworkDiagnosticsService } from "./module-0484.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";
import { IAgentHostStorageService } from "./module-0164.mjs";
import { hasKey } from "./module-0008.mjs";


// src/vs/platform/agentHost/node/agentService.ts
import { open as open3, unlink } from "fs/promises";


// src/vs/platform/agentHost/node/agentService.ts
var SESSION_GC_GRACE_MS = 3e4;

var DAY_MS = 24 * 60 * 60 * 1e3;

var EXTERNAL_SESSION_MAX_AGE_MS = 30 * DAY_MS;

var RECENT_EXTERNAL_SESSION_LIMIT = 2;

var RECENT_LOCAL_SESSION_UPDATE_LIMIT = 2;

var RECENT_LOCAL_SESSION_UPDATES_STORAGE_KEY = "recentLocalSessionUpdates";

var SLOW_LIST_SESSIONS_THRESHOLD_MS = 1e3;

var HOST_OWNED_SESSION_CONFIG_KEYS = [
  "agentMerge" /* AgentMerge */,
  "agentMerge.controller" /* AgentMergeController */,
  "isolation" /* Isolation */,
  "branch" /* Branch */,
  "worktreeBranchPrefix" /* WorktreeBranchPrefix */,
  "worktreeIncludeFiles" /* WorktreeIncludeFiles */,
  "worktreeBranchTrack" /* WorktreeBranchTrack */,
  "worktreeCreateNewBranch" /* WorktreeCreateNewBranch */
];

var HOST_WRITTEN_SESSION_CONFIG_KEYS = [
  "agentMerge.controller" /* AgentMergeController */
];

function omitHostOwnedSessionConfig(config) {
  const result = { ...config };
  for (const key of HOST_OWNED_SESSION_CONFIG_KEYS) {
    delete result[key];
  }
  return result;
}

function parsePersistedSourceControlState(value) {
  const state = readSessionSourceControlState({
    [SESSION_META_SOURCE_CONTROL_KEY]: JSON.parse(value)
  });
  if (!state) {
    throw new Error("Invalid persisted source-control state");
  }
  return state;
}

var RESOURCE_WATCH_GRACE_MS = 3e4;

var SUBAGENT_CHAT_PENDING_TIMEOUT_MS = 15e3;

var PEER_CHATS_METADATA_KEY = "peerChats";

var ANNOTATIONS_METADATA_KEY = "annotations";

function isRecord5(value) {
  return typeof value === "object" && value !== null;
}

function isRecentLocalSessionUpdate(value) {
  return isRecord5(value) && typeof value.session === "string" && Number.isFinite(value.modifiedTime);
}

function isPersistedAnnotationEntry(value) {
  if (!isRecord5(value) || typeof value.id !== "string") {
    return false;
  }
  return typeof value.text === "string" || isRecord5(value.text) && typeof value.text.markdown === "string";
}

function isPersistedAnnotationOrigin(value) {
  return isRecord5(value) && typeof value.session === "string" && (value.chat === void 0 || typeof value.chat === "string") && (value.turnId === void 0 || typeof value.turnId === "string");
}

function isPersistedTextRange(value) {
  return isRecord5(value) && isRecord5(value.start) && typeof value.start.line === "number" && typeof value.start.character === "number" && isRecord5(value.end) && typeof value.end.line === "number" && typeof value.end.character === "number";
}

function readPersistedAnnotation(value, session) {
  if (!isRecord5(value) || typeof value.id !== "string" || typeof value.resource !== "string" || typeof value.resolved !== "boolean" || !Array.isArray(value.entries) || value.entries.length === 0 || !value.entries.every(isPersistedAnnotationEntry)) {
    return void 0;
  }
  let origin;
  if (isPersistedAnnotationOrigin(value.origin)) {
    origin = value.origin;
  } else if (value.origin === void 0) {
    origin = { session, ...typeof value.turnId === "string" && value.turnId ? { turnId: value.turnId } : {} };
  } else {
    return void 0;
  }
  const annotation = {
    id: value.id,
    origin,
    resource: value.resource,
    resolved: value.resolved,
    entries: value.entries
  };
  if (isPersistedTextRange(value.range)) {
    annotation.range = value.range;
  }
  if (isRecord5(value._meta)) {
    annotation._meta = value._meta;
  }
  return annotation;
}

function readPersistedAnnotationsState(value, session) {
  if (!isRecord5(value) || !Array.isArray(value.annotations)) {
    return void 0;
  }
  const annotations = [];
  for (const entry of value.annotations) {
    const annotation = readPersistedAnnotation(entry, session);
    if (!annotation) {
      return void 0;
    }
    annotations.push(annotation);
  }
  return { annotations };
}

var DEFAULT_CHAT_PROVIDER_DATA_METADATA_KEY = "defaultChatProviderData";

var CHAT_BACKING_METADATA_KEY = "peerChatBacking";

var ProviderCatalogUnavailableError = class extends Error {
  constructor(provider) {
    super(`Provider ${provider} cannot enumerate its native session catalog yet`);
    this.provider = provider;
    this.name = "ProviderCatalogUnavailableError";
  }
};

function reconcileWorkingDirectories(requested, resolved) {
  if (resolved === void 0) {
    return requested?.map((d) => d.toString());
  }
  const tail = (requested ?? []).slice(resolved.length);
  return [...resolved, ...tail].map((d) => d.toString());
}

var AgentService = class extends Disposable {
  constructor(core, collaborators, options, _logService, _fileService, _sessionDataService, _gitService, _telemetryService, _sessionOpenTelemetry, _chatContributions, _subscriptions, _networkDiagnostics, _editAttributionService, instantiationService, _worktree, _providerService, _storageService) {
    super();
    this._logService = _logService;
    this._fileService = _fileService;
    this._sessionDataService = _sessionDataService;
    this._gitService = _gitService;
    this._telemetryService = _telemetryService;
    this._sessionOpenTelemetry = _sessionOpenTelemetry;
    this._chatContributions = _chatContributions;
    this._subscriptions = _subscriptions;
    this._networkDiagnostics = _networkDiagnostics;
    this._editAttributionService = _editAttributionService;
    this._worktree = _worktree;
    this._providerService = _providerService;
    this._storageService = _storageService;
    this._resourceWriteQueue = this._register(new ResourceQueue());
    /** Protocol: fires when state is mutated by an action. */
    this._onDidAction = this._register(new Emitter());
    this.onDidAction = this._onDidAction.event;
    /** Protocol: fires for ephemeral notifications (sessionAdded/Removed). */
    this._onDidNotification = this._register(new Emitter());
    this.onDidNotification = this._onDidNotification.event;
    /** Serializes durable last-modified advances emitted by live session state. */
    this._sessionModifiedTimeWrites = Promise.resolve();
    this._providerMigrations = /* @__PURE__ */ new Map();
    this._initialProviderMigrations = /* @__PURE__ */ new Map();
    this._deferredProviderMigrations = /* @__PURE__ */ new Set();
    this._readableProviderCatalogs = /* @__PURE__ */ new Set();
    /**
     * Backing-session URIs (as strings) whose {@link CHAT_BACKING_METADATA_KEY}
     * durable marker write kept failing after a retry in `createChat`. The chat
     * itself was already created and announced successfully, so this in-process
     * suppression stands in for the durable marker: it is consulted by
     * {@link _isChatBacking} (used by external discovery) and by `listSessions`'s overlay
     * filter, so the backing session is still never surfaced as a standalone
     * top-level session for the lifetime of this process, even though its
     * on-disk marker never persisted. A later successful write (e.g. from a
     * differently-timed retry) removes the entry; a stale entry for a since
     * deleted session is harmless — that URI is never reachable again.
     */
    this._unpersistedChatBackings = /* @__PURE__ */ new Set();
    /**
     * Sessions that have opted in to bring-up progress, keyed by provider id.
     * A session is added here when its `createSession` carries a
     * {@link IAgentCreateSessionConfig.progressToken} and removed once it
     * materializes (the SDK is now resolved) or is disposed. The SDK download is
     * host-level and shared across every session of a provider, so this only
     * records *interest*: as long as one or more sessions of a provider is
     * registered, {@link emitDownloadProgress} surfaces that provider's download as a single
     * progress stream keyed by the download's own identity (the package id),
     * rather than one stream per session.
     */
    this._downloadProgressInterest = /* @__PURE__ */ new Map();
    /** AgentService-owned integrations installed for registered providers. */
    this._providerSubscriptions = this._register(new DisposableMap());
    /**
     * Per-session tail of in-flight persisted peer-chat catalog writes, keyed by
     * session URI string. Read-modify-write updates to the {@link
     * PEER_CHATS_METADATA_KEY} blob are chained per session so a `createChat`,
     * `disposeChat`, and `onDidChangeChatData` racing for the same
     * session can't clobber each other's edits.
     */
    this._peerChatCatalogWrites = /* @__PURE__ */ new Map();
    this._disposingPeerChats = /* @__PURE__ */ new Set();
    this._defaultChatBackingWrites = /* @__PURE__ */ new Map();
    this._skillCompletionProviderRegistered = false;
    /**
     * Authoritative server-side per-resource subscription refcount, keyed by
     * resource URI string and valued by the set of subscribed protocol
     * client IDs. Populated by {@link addSubscriber} after any in-flight release
     * settles (or immediately for handshake fast-paths) and drained by
     * {@link unsubscribe}. When a
     * resource's set becomes empty, the resource is dropped from the map and
     * session residency is reconciled against the MRU cap.
     */
    this._restoreSessionInFlight = /* @__PURE__ */ new Map();
    this._restoreSubagentInFlight = /* @__PURE__ */ new Map();
    /**
     * Persisted-annotation reads in flight, keyed by session URI. Annotations
     * snapshots are synthesized empty for any well-formed URI, so subscribers
     * must await this rather than rely on session-state existence.
     */
    this._restoreAnnotationsInFlight = /* @__PURE__ */ new Map();
    /** Subagent chats armed for a bounded wait (once execution is confirmed); resolved by {@link _onChatSpawned}, awaited by {@link subscribe}. */
    this._pendingSubagentChats = /* @__PURE__ */ new Map();
    this._pendingSubagentChatTimeouts = this._register(new DisposableMap());
    /** Subagent chats announced via `_meta.subagentChatUri` but still awaiting confirmation, keyed by `${channel}:${toolCallId}`. */
    this._pendingSubagentToolCalls = /* @__PURE__ */ new Map();
    /**
     * Pending {@link _runSessionGc} timers, keyed by session URI. A timer is
     * armed when a session loses its last subscriber while still empty (no
     * turns, no active turn) — see {@link _maybeScheduleSessionGc}. Cleared
     * whenever any client subscribes again or the timer fires.
     */
    this._pendingSessionGc = this._register(new DisposableResourceMap());
    /**
     * Active resource watches keyed by the channel URI string
     * (`ahp-resource-watch:/<encoded>`).
     *
     * Each entry owns the {@link IFileService} watcher together with the
     * decoded descriptor, the subscriber refcount, and the optional
     * grace-window dispose timer. The watch URI itself is fully
     * self-describing — {@link createResourceWatch} just encodes the
     * caller's params into the URI and returns it. State only exists
     * here once at least one client has subscribed.
     *
     * Lifecycle:
     * - First subscriber to a channel: {@link onResourceWatchSubscribed}
     *   parses the URI, creates the {@link IFileService} watcher, and
     *   installs the entry with `subscribers = 1`.
     * - Subsequent subscribers bump the refcount and cancel any pending
     *   grace-window dispose timer.
     * - {@link onResourceWatchUnsubscribed} drops the refcount; when it
     *   reaches zero we arm a {@link RESOURCE_WATCH_GRACE_MS} dispose
     *   timer rather than tearing down immediately, giving disconnected
     *   clients time to reconnect.
     */
    this._resourceWatches = this._register(new DisposableMap());
    /** Opens once startup settled: the host finished starting and the first listing was served. */
    this._startupSettled = new Barrier();
    this._hostStartupComplete = false;
    this._firstListingServed = false;
    /** Serializes deferred work so background maintenance never overlaps. */
    this._deferredWork = Promise.resolve();
    /** External sessions registered without a provider title, awaiting a generated one. */
    this._untitledExternalSessions = /* @__PURE__ */ new Map();
    this._externalSessionTitlingQueued = false;
    this._agentMergeRestore = Promise.resolve();
    this._agentMergeIndexWrites = Promise.resolve();
    /** Agent Merge notices waiting for a session's in-flight turn to finish. */
    this._pendingAgentMergeNotices = /* @__PURE__ */ new Map();
    /** In-flight list computations, shared per mode until they settle or the registry changes. */
    this._inFlightListSessions = /* @__PURE__ */ new Map();
    this._registryEpoch = 0;
    /** Session keys already announced this AH lifetime, so provider signals do not re-announce them. */
    this._announcedSurfacedKeys = /* @__PURE__ */ new Set();
    this._broadcastExternalSessions = /* @__PURE__ */ new Set();
    this._sessionListReconciliation = Promise.resolve();
    /** Coalescing state for storm-driven (mode-agnostic) reconciliations. */
    this._reconciliationInFlight = false;
    this._reconciliationDirty = false;
    /**
     * Per-client sequencer that serialises action dispatches whose
     * processing requires an asynchronous prelude (e.g. resolving a restored
     * peer chat or snapshotting user-message attachments before the action is
     * reduced into state). Actions that don't need any asynchronous prelude
     * bypass the queue entirely as long as no earlier action from the same
     * client is still pending.
     *
     * todo@connor4312: we can drop this when sending a message become a command
     */
    this._clientDispatchQueues = /* @__PURE__ */ new Map();
    this._authService = core.authenticationService;
    this._orchestratorDatabase = core.orchestratorDatabase;
    this._debugLogsCollector = core.debugLogsCollector;
    this._sessionRegistry = core.sessionRegistry;
    this._stateManager = core.stateManager;
    this._configurationService = core.configurationService;
    this._recentLocalSessionUpdateSnapshot = this._readRecentLocalSessionUpdates();
    this._recentLocalSessionUpdates = this._recentLocalSessionUpdateSnapshot;
    this.onMcpNotification = this._providerService.onMcpNotification;
    this._gitHubEndpointService = collaborators.gitHubEndpointService;
    this._gitStateService = collaborators.gitStateService;
    this._agentMergeController = collaborators.agentMergeController;
    this._checkpointService = collaborators.checkpointService;
    this._changesetOperationService = collaborators.changesetOperationService;
    this._reviewService = collaborators.reviewService;
    this._changesets = collaborators.changesets;
    this._changesetCoordinator = collaborators.changesetCoordinator;
    this._completions = collaborators.completions;
    this._terminalManager = collaborators.terminalManager;
    this._localTurns = collaborators.localTurns;
    this._sideEffects = collaborators.sideEffects;
    this._serverToolHost = collaborators.serverToolHost;
    this._automationService = collaborators.automationService;
    this._register(this._providerService.registerProviderInitializer((provider) => this._initializeProvider(provider)));
    this._register(this._providerService.onDidRegisterProvider((provider) => this._onDidRegisterProvider(provider)));
    this._sessionResidency = this._register(instantiationService.createInstance(
      AgentSessionResidency,
      this._stateManager,
      {
        isReleaseBlocked: (session) => this._restoreSessionInFlight.has(session.toString()),
        whenSessionDataIdle: (session) => this._whenSessionDataIdle(session),
        getSessionChats: (session) => this._getSessionChatsInTeardownOrder(session),
        createRelease: (session) => {
          const provider = this._providerService.getProviderForSession(session);
          return provider ? {
            canRelease: (chats) => this._canReleaseSession(provider, session, chats),
            release: (chats) => this._releaseSession(provider, session, chats)
          } : void 0;
        },
        evictSessionState: (session, chats) => this._evictSessionState(session, session.toString(), session.toString(), chats.map((chat) => chat.toString()))
      },
      {
        limit: options.sessionResidencyLimit,
        releaseRetryMs: options.sessionReleaseRetryMs,
        holdsSession: (session) => this._agentMergeController.holdsSession(session),
        onDidReleaseHold: this._agentMergeController.onDidReleaseHold
      }
    ));
    core.callbackBinder.bind({
      automationExecution: {
        isSessionTemplateAvailable: (template) => this._providerService.resolveProvider(template.provider) !== void 0,
        createSession: (template, run2) => this.createSession({
          provider: template.provider,
          model: template.model,
          agent: template.agent,
          workingDirectories: template.workingDirectories?.map((resource) => URI.parse(resource)),
          config: template.config,
          _meta: {
            automation: run2.automation,
            automationRun: run2.resource
          }
        }),
        startSession: (session, message) => this._startAutomationMessage(session, message),
        cancelSession: (session) => this._cancelAutomationSession(session)
      },
      canEvictChangeset: (changeset) => this._canEvictChangeset(changeset),
      startAgentMergeTurn: (session, turnId, prompt) => this._startAgentMergePrompt(session, turnId, prompt),
      cancelAgentMergeTurn: (session, turnId) => this._cancelAgentMergePrompt(session, turnId),
      postAgentMergeNotice: (session, kind, content) => this._postAgentMergeNotice(session, kind, content),
      getAutonomousSessionConfig: (session, config) => this._providerService.getProviderForSession(session)?.getAutonomousSessionConfig?.(config),
      resolveWorkingDirectoryBeforeSend: (params) => this._resolveWorkingDirectoryBeforeSend(params),
      resolveChatAttachmentTurns: (resource) => this._resolveChatAttachmentTurns(resource),
      getSessionMetadata: (session) => this._getSessionMetadata(session),
      restoreSession: (session) => this.restoreSession(session),
      sessionServerToolAccessor: this._createSessionServerToolAccessor(),
      artifactServerToolAccessor: this._createArtifactServerToolAccessor()
    });
    this._logService.info("AgentService initialized");
    this._register(this._stateManager.onDidEmitEnvelope((e) => this._onDidAction.fire(e)));
    this._register(this._stateManager.onDidEmitEnvelope((e) => this._trackPendingSubagentChatFromEnvelope(e)));
    this._register(this._stateManager.onDidEmitEnvelope((e) => this._persistAnnotations(e)));
    this._register(this._stateManager.onDidEmitEnvelope((e) => {
      if (e.action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */ && e.action.isArchived && !isAhpChatChannel(e.channel)) {
        this._clearAgentMergeIndex(URI.parse(e.channel));
        void this._sessionResidency.reconcile();
      }
    }));
    this._register(this._stateManager.onDidEmitNotification((e) => this._onDidNotification.fire(e)));
    this._register(this._stateManager.onDidChangeSessionActiveTurn(({ session, active }) => {
      if (!active) {
        this._flushAgentMergeNotices(session);
      }
    }));
    this._register(this._stateManager.onDidRemoveSession((session) => this._pendingAgentMergeNotices.delete(session)));
    this._register(this._stateManager.onDidChangeSessionSummary(({ session, changes }) => {
      const meta = this._stateManager.getSessionSummary(session)?._meta;
      if (changes.modifiedAt !== void 0) {
        const modifiedTime = Date.parse(changes.modifiedAt);
        if (!readSessionExternal(meta) && !isSubagentSession(session) && !this._stateManager.isEphemeralSession(session) && !this._stateManager.isIdleProvisionalSession(session)) {
          this._recordRecentLocalSessionUpdate(URI.parse(session), modifiedTime);
        }
        this._writeSessionModifiedTime(URI.parse(session), modifiedTime);
      }
      if (changes.modifiedAt !== void 0 && this._getExternalSessionsMode() === "recent" /* Recent */ && readSessionExternal(meta) && !readSessionEhcliAdoptable(meta)) {
        this._queueSessionListReconciliation();
      }
    }));
    updateAgentHostTelemetryLevelFromConfig(this._telemetryService, this._stateManager.rootState.config?.values);
    this._register(this._stateManager.onDidChangeSessionConfig(({ session, previous, current }) => this._syncAgentMergeIndex(URI.parse(session), previous, current)));
    let externalSessionsMode = this._getExternalSessionsMode();
    let agentMergeEnabled = this._isAgentMergeEnabled();
    this._register(this._configurationService.onDidRootConfigChange(() => {
      const nextMode = this._getExternalSessionsMode();
      if (nextMode !== externalSessionsMode) {
        const previousMode = externalSessionsMode;
        externalSessionsMode = nextMode;
        this._logService.info(`[AgentService] ${AgentHostShowExternalSessionsConfigKey} changed '${previousMode}' -> '${nextMode}'; queueing session list reconciliation`);
        if (this._startupSettled.isOpen() && this._hidesAllExternalSessions(previousMode) && !this._hidesAllExternalSessions(nextMode)) {
          for (const provider of this._providerService.getProviders()) {
            this._startChatDiscovery(provider, "external sessions were enabled");
          }
        }
        this._queueSessionListReconciliation(previousMode);
      }
      const nextAgentMergeEnabled = this._isAgentMergeEnabled();
      if (nextAgentMergeEnabled !== agentMergeEnabled) {
        agentMergeEnabled = nextAgentMergeEnabled;
        for (const session of this._stateManager.getSessionUris()) {
          this._serverToolHost.advertise(session);
        }
        if (nextAgentMergeEnabled) {
          this._agentMergeRestore = this._agentMergeRestore.then(() => this._restoreAgentMergeMonitoredSessions()).catch((err) => this._logService.warn("[AgentService] Failed to restore Agent-Merge-enabled sessions", err));
        }
      }
    }));
    this._register(this._gitHubEndpointService.onDidChange(() => {
      this._stateManager.emitAuthRequired({
        resource: this._gitHubEndpointService.getCopilotResource(),
        reason: "required" /* Required */
      });
    }));
    this._editAttributionService.setEnabled(this._stateManager.rootState.config?.values[AgentHostEditTelemetryEnabledConfigKey] !== false);
    this._runWhenStartupSettled("external session prune", () => this._pruneStaleExternalSessions());
    this._register(core.disposables);
  }
  /**
   * Signals that host startup finished. Deferred work runs once this and the
   * first session listing have both happened, so background maintenance never
   * competes with startup. Called by the process mains; the service owns no
   * ambient timer of its own.
   */
  markStartupComplete() {
    if (this._hostStartupComplete) {
      return;
    }
    this._hostStartupComplete = true;
    this._openStartupSettled();
  }
  _openStartupSettled() {
    if (this._hostStartupComplete && this._firstListingServed) {
      this._startupSettled.open();
    }
  }
  /**
   * Runs `work` once startup has settled, serialized behind any deferred work
   * queued before it. For maintenance that is fine to run late and must not
   * compete with startup — pruning stale external sessions, titling external
   * sessions a provider surfaced without a title, and similar.
   */
  _runWhenStartupSettled(name, work) {
    this._deferredWork = this._deferredWork.then(() => this._startupSettled.wait()).then(() => this._store.isDisposed ? void 0 : work()).catch((error) => this._logService.warn(`[AgentService] Deferred work '${name}' failed`, error));
  }
  /** Test surface: settles once all deferred work queued so far has run. */
  async whenDeferredWorkSettled() {
    await this._deferredWork;
  }
  async _pruneStaleExternalSessions() {
    const now = Date.now();
    const registered = await this._listRegisteredSessions();
    const staleExternalSessions = [];
    for (const entry of registered) {
      if (!entry.external) {
        continue;
      }
      const provider = this._providerService.getProvider(entry.provider);
      if (!provider) {
        continue;
      }
      let metadata;
      try {
        metadata = await this._registeredSessionMetadata(provider, entry.session, true);
      } catch (error) {
        this._logService.warn(`[AgentService] Failed to load metadata while pruning stale external session ${entry.session.toString()}`, error);
        continue;
      }
      if (!metadata) {
        continue;
      }
      if (readSessionEhcliAdoptable(metadata._meta)) {
        continue;
      }
      if (this._isExternalSessionOlderThanMaxAge(metadata.modifiedTime, now)) {
        staleExternalSessions.push(entry.session);
      }
    }
    for (const session of staleExternalSessions) {
      await this._sessionRegistry.unregister(session);
    }
    if (staleExternalSessions.length > 0) {
      this._invalidateSessionList();
      this._queueSessionListReconciliation();
    }
    this._logService.info(`[AgentService] pruned ${staleExternalSessions.length} stale external session row(s) older than ${EXTERNAL_SESSION_MAX_AGE_MS / DAY_MS} days`);
  }
  /**
   * Queues external sessions whose provider surfaced them without a title.
   * Titling is deferred past startup and capped at the
   * {@link RECENT_EXTERNAL_SESSION_LIMIT} most recently updated candidates, so
   * a large provider catalog cannot trigger a burst of model calls.
   */
  _scheduleExternalSessionTitles(sessions) {
    for (const session of sessions) {
      this._untitledExternalSessions.set(session.session.toString(), session);
    }
    if (this._externalSessionTitlingQueued) {
      return;
    }
    this._externalSessionTitlingQueued = true;
    this._runWhenStartupSettled("external session titles", () => {
      this._externalSessionTitlingQueued = false;
      return this._titleUntitledExternalSessions();
    });
  }
  /** Titles the most recently updated queued sessions and drops the rest. */
  async _titleUntitledExternalSessions() {
    const candidates = [...this._untitledExternalSessions.values()].sort((a, b) => b.modifiedTime - a.modifiedTime).slice(0, RECENT_EXTERNAL_SESSION_LIMIT);
    this._untitledExternalSessions.clear();
    for (const candidate of candidates) {
      try {
        await this._generateExternalSessionTitle(candidate);
      } catch (error) {
        this._logService.warn(`[AgentService] Failed to title external session ${candidate.session.toString()}`, error);
      }
    }
  }
  /** Titles one external session from the first user prompt of its default chat. */
  async _generateExternalSessionTitle(metadata) {
    const session = metadata.session;
    const agent = this._providerService.getProviderForSession(session);
    if (!agent) {
      return;
    }
    const chat = URI.parse(buildDefaultChatUri(session));
    const turns = await agent.chats.getMessages(chat, this._chatContext(session, chat));
    const prompt = turns[0]?.message.text.trim();
    if (prompt) {
      await this._sideEffects.generateExternalSessionTitle(session.toString(), prompt);
    }
  }
  // ---- provider registration ----------------------------------------------
  _toProviderConfig(request) {
    if (!this._worktree.supported || !request.config) {
      return request;
    }
    return { ...request, config: omitHostOwnedSessionConfig(request.config) };
  }
  /**
   * Host-owned first-send hook (invoked by {@link AgentSideEffects} before the
   * agent locks its subprocess cwd). Resolves the working directories the session
   * will actually run in and hands them to the agent at send time:
   *  - index 0 is the process root: for `worktree` isolation the isolated
   *    worktree (created here on the first send, see
   *    {@link _resolveWorktreeBeforeSend}); for `folder` isolation the picked
   *    folder; `undefined` (whole result) for workspace-less sessions.
   *  - the tail carries any additional session roots as-is (only index 0 is
   *    worktree-remapped; additional roots are passed through unchanged).
   */
  async _resolveWorkingDirectoryBeforeSend(params) {
    const sessionId = AgentSession.id(params.session);
    const pickedFolders = this._configurationService.getEffectiveWorkingDirectories(params.session);
    const pickedFolderUri = pickedFolders?.[0] ? URI.parse(pickedFolders[0]) : void 0;
    const tail = (pickedFolders ?? []).slice(1).map((d) => URI.parse(d));
    if (!this._worktree.isWorkingDirectoryPending(sessionId)) {
      if (!pickedFolderUri) {
        return void 0;
      }
      const resolved2 = await this._worktree.resolveWorkingDirectoryForResume(URI.parse(params.session), sessionId, pickedFolderUri);
      return [resolved2, ...tail];
    }
    const resolved = await this._resolveWorktreeBeforeSend({ ...params, sessionId, pickedFolderUri }) ?? pickedFolderUri;
    return resolved ? [resolved, ...tail] : void 0;
  }
  async _resolveChatAttachmentTurns(resource) {
    const readTurns = () => {
      const state = this._stateManager.getChatState(resource) ?? this._stateManager.getDefaultChatState(resource);
      return state?.turns;
    };
    const existing = readTurns();
    if (existing) {
      return existing;
    }
    const sessionUri = URI.parse(isAhpChatChannel(resource) ? parseRequiredSessionUriFromChatUri(resource) : resource);
    if (!this._stateManager.getSessionState(sessionUri.toString())) {
      await this.restoreSession(sessionUri);
    } else {
      const provider = this._providerService.getProviderForSession(sessionUri);
      if (provider) {
        await this._restorePeerChats(provider, sessionUri);
      }
    }
    if (isAhpChatChannel(resource)) {
      const state = await this._stateManager.resolveChatState(resource);
      if (state) {
        return state.turns;
      }
      throw new Error(`Cannot resolve peer chat attachment: ${resource}`);
    }
    const resolved = readTurns();
    if (resolved) {
      return resolved;
    }
    return [];
  }
  /**
   * Creates the session's isolated worktree on the first send (deferred so the
   * user's prompt can name the branch), reports creation progress as the chat's
   * activity, surfaces the "Created isolated worktree" announcement as the first
   * markdown response part or a durable fallback warning, and returns the created worktree URI.
   * Idempotent; safe to call once the worktree exists. Returns `undefined` when
   * worktree creation failed. Only invoked for sessions whose worktree is still
   * pending (see {@link _resolveWorkingDirectoryBeforeSend}).
   */
  async _resolveWorktreeBeforeSend(params) {
    const { sessionId, pickedFolderUri } = params;
    const worktree = this._worktree;
    let reportedActivity = false;
    let failureDiagnostic;
    try {
      await worktree.resolveOnFirstSend({
        sessionUri: URI.parse(params.session),
        sessionId,
        workingDirectory: pickedFolderUri,
        config: this._configurationService.getSessionConfigValues(params.session),
        prompt: params.prompt,
        githubToken: this._authService.getAuthToken({
          resource: this._gitHubEndpointService.getCopilotResource().resource,
          scopes: this._gitHubEndpointService.getCopilotResource().scopes_supported
        }),
        onProgress: (activity) => {
          reportedActivity = true;
          this._stateManager.dispatchServerAction(params.chat, { type: "chat/activityChanged" /* ChatActivityChanged */, activity });
        }
      });
    } catch (err) {
      failureDiagnostic = toErrorMessage(err);
      this._logService.warn(`[AgentService] worktree resolution failed for ${params.session}: ${failureDiagnostic}`);
    }
    if (reportedActivity) {
      this._stateManager.dispatchServerAction(params.chat, { type: "chat/activityChanged" /* ChatActivityChanged */, activity: void 0 });
    }
    const resolvedWorktree = worktree.getResolvedWorktree(sessionId);
    if (!resolvedWorktree) {
      try {
        await worktree.persistCreationFailure(URI.parse(params.session), sessionId, failureDiagnostic);
      } catch (err) {
        this._logService.warn(`[AgentService] failed to persist worktree creation failure for ${params.session}: ${toErrorMessage(err)}`);
      }
      this._stateManager.dispatchServerAction(params.chat, {
        type: "chat/responsePart" /* ChatResponsePart */,
        turnId: params.turnId,
        part: buildWorktreeFailureNotification(failureDiagnostic)
      });
      return void 0;
    }
    const announcement = worktree.takePendingAnnouncement(sessionId);
    if (announcement !== void 0) {
      this._stateManager.dispatchServerAction(params.chat, {
        type: "chat/responsePart" /* ChatResponsePart */,
        turnId: params.turnId,
        part: { kind: "markdown" /* Markdown */, id: generateUuid(), content: announcement }
      });
    }
    return resolvedWorktree;
  }
  _initializeProvider(provider) {
    const subscriptions = new DisposableStore();
    try {
      this._invalidateSessionList();
      provider.setServerToolHost?.(this._serverToolHost);
      provider.setKnownSessionsFilter?.((sessions) => this._filterKnownSessions(sessions));
      subscriptions.add(provider.onDidChatProgress((signal) => this._sequenceSpawnedChat(signal)));
      subscriptions.add(this._sideEffects.registerProgressListener(provider));
      subscriptions.add(provider.onDidMaterializeChat((e) => this._onDidMaterializeChat(e)));
      subscriptions.add(provider.onDidDiscoverChats((chats) => {
        void this._migrateAndRegisterDiscoveredChats(provider, chats).catch((err) => this._logService.warn(`[AgentService] registering discovered chats for provider ${provider.id} failed`, err));
      }));
      this._setupChatDiscoveryForProvider(provider);
      subscriptions.add(provider.onDidChangeChatData((e) => this._onChatDataChanged(e)));
      subscriptions.add(provider.onDidSpawnChat((e) => this._onChatSpawned(e)));
      this._providerSubscriptions.set(provider.id, subscriptions);
      return toDisposable(() => {
        this._providerSubscriptions.deleteAndDispose(provider.id);
        this._deferredProviderMigrations.delete(provider.id);
        this._readableProviderCatalogs.delete(provider.id);
      });
    } catch (error) {
      subscriptions.dispose();
      throw error;
    }
  }
  _setupChatDiscoveryForProvider(provider) {
    if (this._migrateLegacyEnabledSnapshot === true && provider.ensureChatAdopted) {
      this._startChatDiscovery(provider, "legacy chat migration is enabled");
    } else {
      this._runWhenStartupSettled(`external session discovery for ${provider.id}`, () => {
        if (!this._hidesAllExternalSessions(this._getExternalSessionsMode())) {
          this._startChatDiscovery(provider, "Agent Host startup settled with external sessions enabled");
        }
      });
    }
  }
  _onDidRegisterProvider(provider) {
    this._registerSkillCompletionProvider();
    const initialMigration = this._ensureLegacyChatsMigrated(provider);
    this._trackInitialProviderMigration(provider, initialMigration);
    this._agentMergeRestore = this._agentMergeRestore.then(() => initialMigration).then(() => this._restoreAgentMergeMonitoredSessions()).catch((err) => this._logService.warn("[AgentService] Failed to restore Agent-Merge-enabled sessions", err));
  }
  _trackInitialProviderMigration(provider, migration) {
    this._initialProviderMigrations.set(provider.id, migration);
    void migration.then(() => this._automationService.handleAgentsChanged()).catch((err) => this._logService.warn(`[AgentService] provider initialization failed before Automations could refresh for ${provider.id}`, err));
    return migration;
  }
  _registerSkillCompletionProvider() {
    if (this._skillCompletionProviderRegistered) {
      return;
    }
    this._skillCompletionProviderRegistered = true;
    const provider = this._register(new AgentHostSkillCompletionProvider(
      (session) => this._providerService.getProviderForSession(session),
      (session) => this._hostCustomizations(URI.isUri(session) ? session : URI.parse(session))
    ));
    this._register(this._completions.registerProvider(provider));
  }
  // ---- auth ---------------------------------------------------------------
  async authenticate(params) {
    const result = await this._providerService.authenticate(params);
    if (result.authenticated) {
      this._agentMergeController.refresh();
    }
    return result;
  }
  // ---- Changeset operation handlers --------------------------------------
  async invokeChangesetOperation(params) {
    return this._changesetOperationService.invokeChangesetOperation(params);
  }
  // ---- MCP `mcp://` channel routing --------------------------------------
  async handleMcpRequest(channel, method, params) {
    return this._providerService.handleMcpRequest(channel, method, params);
  }
  // ---- session management -------------------------------------------------
  /**
   * Builds the dependency surface the session server-tool group needs, bound
   * to this service so the group stays decoupled from the concrete host.
   */
  _createSessionServerToolAccessor() {
    return {
      isActiveAgentTitleGenerationEnabled: () => this._isActiveAgentTitleGenerationEnabled(),
      listSessions: () => this.listSessions(),
      getSession: (session) => this._getSessionMetadata(session),
      createSession: (config) => this.createSession(config),
      getModels: () => {
        const models = [];
        for (const provider of this._providerService.getProviders()) {
          models.push(...provider.models.get());
        }
        return models;
      },
      getCreationDefaults: (source) => this._getServerToolCreationDefaults(source),
      startPrompt: (session, chat, prompt, delegation) => this._startSessionPrompt(session, chat, prompt, delegation),
      createChat: (session, chat, options) => this.createChat(session, chat, options?.title !== void 0 || options?.model !== void 0 ? { ...options.title !== void 0 ? { title: options.title } : {}, ...options.model !== void 0 ? { model: options.model } : {} } : void 0),
      renameChat: (session, chat, title) => this._renameChatFromTool(session, chat, title),
      reportToolError: (toolName, error) => this._logService.error(`[AgentService] ${toolName} failed after the tool returned: ${toErrorMessage(error)}`),
      deleteSession: (session) => this.disposeSession(session),
      getChatContext: (session, chatId) => this._getChatContext(session, chatId),
      // Reads the `create_session` spawn depth from a session's `_meta` (0 when absent).
      getSessionSpawnDepth: (session) => readSessionSpawnDepth(this._stateManager.getSessionSummary(session.toString())?._meta),
      // Stamps a session's `create_session` spawn depth into its `_meta` (merging existing keys).
      setSessionSpawnDepth: (session, depth) => this._stateManager.dispatchServerAction(session.toString(), {
        type: "session/metaChanged" /* SessionMetaChanged */,
        _meta: withSessionSpawnDepth(this._stateManager.getSessionSummary(session.toString())?._meta, depth)
      })
    };
  }
  _isActiveAgentTitleGenerationEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostActiveAgentTitleGenerationConfigKey) === true;
  }
  /** Dependency surface for the artifact server-tool group. */
  _createArtifactServerToolAccessor() {
    return {
      isEnabled: () => this._isArtifactToolsEnabled(),
      persist: (session, artifacts) => persistSessionMetadata(this._sessionDataService, this._logService, session, SESSION_ARTIFACTS_KEY, stringifySessionArtifacts(artifacts))
    };
  }
  _isArtifactToolsEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostArtifactToolsConfigKey) === true;
  }
  /**
   * Reads a session's persisted artifacts and references, warning when any are
   * lost. A corrupt row would otherwise empty a session's artifacts pill with
   * no trace of why the agent's recorded work disappeared.
   */
  _readPersistedArtifacts(value, session, logPrefix) {
    const { artifacts, error, dropped } = parseSessionArtifacts(value);
    if (error) {
      this._logService.warn(`${logPrefix} Failed to parse artifacts for ${session}: ${toErrorMessage(error)}`);
    } else if (dropped > 0) {
      this._logService.warn(`${logPrefix} Dropped ${dropped} malformed artifact(s) for ${session}`);
    }
    return artifacts;
  }
  _getServerToolCreationDefaults(source) {
    const session = this._stateManager.getSessionState(source.toString());
    if (!session) {
      return void 0;
    }
    const model = session.activeTurn ? session.activeTurn.message.model : session.draft ? session.draft.model : session.turns.at(-1)?.message.model;
    const sourceConfig = getNonMergeSessionConfigValues(session.config?.values);
    const config = this._providerService.getProvider(session.provider)?.getInheritedChatConfig(sourceConfig);
    const isolation = sourceConfig["isolation" /* Isolation */];
    return {
      provider: session.provider,
      ...model !== void 0 ? { model } : {},
      ...config !== void 0 ? { config } : {},
      ...isolation === "folder" || isolation === "worktree" ? { isolation } : {}
    };
  }
  /**
   * Starts a turn requested by the session orchestration server tools
   * (`create_session`, `send_message`) by dispatching a
   * `ChatTurnStarted` and routing it through the same side-effects path a
   * client-initiated turn takes (which sends the message to the provider).
   */
  async _startSessionPrompt(session, chat, prompt, delegation) {
    const message = {
      text: prompt,
      origin: { kind: "agent" /* Agent */ },
      ...delegation ? { _meta: toAgentMessageDelegationMeta(delegation) } : {}
    };
    await this._startSessionMessage(chat, message);
  }
  async _startAutomationMessage(session, message) {
    await this._startSessionMessage(URI.parse(buildDefaultChatUri(session)), message);
  }
  async _startSessionMessage(chat, message) {
    const action = { type: "chat/turnStarted" /* ChatTurnStarted */, turnId: generateUuid(), startedAt: (/* @__PURE__ */ new Date()).toISOString(), message };
    this._stateManager.dispatchServerAction(chat.toString(), action);
    this._sideEffects.handleAction(chat.toString(), action);
  }
  async _cancelAutomationSession(session) {
    const chat = buildDefaultChatUri(session);
    const activeTurn = this._stateManager.getChatState(chat)?.activeTurn;
    if (!activeTurn) {
      return false;
    }
    const startedAt = Date.parse(activeTurn.startedAt);
    const duration = Number.isFinite(startedAt) ? Math.max(0, Date.now() - startedAt) : 0;
    const action = { type: "chat/turnCancelled" /* ChatTurnCancelled */, turnId: activeTurn.id, duration };
    this._stateManager.dispatchServerAction(chat, action);
    this._sideEffects.handleAction(chat, action);
    return true;
  }
  _startAgentMergePrompt(session, turnId, prompt) {
    if (this._stateManager.hasActiveTurn(session)) {
      return false;
    }
    const chat = buildDefaultChatUri(session).toString();
    const message = {
      text: prompt,
      origin: { kind: "systemNotification" /* SystemNotification */ },
      _meta: toAgentMergeMessageMeta()
    };
    const action = { type: "chat/turnStarted" /* ChatTurnStarted */, turnId, startedAt: (/* @__PURE__ */ new Date()).toISOString(), message };
    this._stateManager.dispatchServerAction(chat, action);
    this._sideEffects.handleAction(chat, action);
    return true;
  }
  /**
   * Reports an Agent Merge state change in the session's default chat.
   *
   * The notice is dispatched as server state only — `AgentSideEffects` is
   * deliberately not involved — so it reaches clients without ever being sent
   * to the provider. It needs a turn of its own to live on, because the chat
   * reducer drops response parts that no active turn claims; that turn's
   * message is hidden so only the notice is rendered, and it is recorded as a
   * local turn because the SDK transcript replayed on restore has never seen
   * it.
   *
   * A notice raised while the agent holds a turn has to wait: starting a turn
   * now would displace the running one, and appending to it would leave the
   * notice on a turn the provider owns, so restore would replay that turn
   * without it.
   */
  _postAgentMergeNotice(session, kind, content) {
    if (this._stateManager.hasActiveTurn(session)) {
      const pending = this._pendingAgentMergeNotices.get(session);
      if (pending) {
        pending.push({ kind, content });
      } else {
        this._pendingAgentMergeNotices.set(session, [{ kind, content }]);
      }
      this._logService.debug(`[AgentService] Deferring an Agent Merge notice until the session is idle: session=${session}`);
      return;
    }
    this._writeAgentMergeNotice(session, kind, content);
  }
  /** Emits the notices that were waiting for a session's turn to end. */
  _flushAgentMergeNotices(session) {
    const pending = this._pendingAgentMergeNotices.get(session);
    if (!pending) {
      return;
    }
    this._pendingAgentMergeNotices.delete(session);
    for (const { kind, content } of pending) {
      this._writeAgentMergeNotice(session, kind, content);
    }
  }
  /** Writes one Agent Merge notice as a completed, host-owned local turn. */
  _writeAgentMergeNotice(session, kind, content) {
    const chat = buildDefaultChatUri(session);
    const channel = chat.toString();
    const turnId = generateUuid();
    this._stateManager.dispatchServerAction(channel, {
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: withMessageHiddenFromTranscript({ text: content, origin: { kind: "systemNotification" /* SystemNotification */ } }, true)
    });
    this._stateManager.dispatchServerAction(channel, {
      type: "chat/responsePart" /* ChatResponsePart */,
      turnId,
      part: {
        kind: "systemNotification" /* SystemNotification */,
        content,
        _meta: toAgentSystemNotificationMeta({ kind })
      }
    });
    this._stateManager.dispatchServerAction(channel, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId, duration: 0 });
    const turns = this._stateManager.getSessionState(chat)?.turns;
    const recorded = turns?.find((turn) => turn.id === turnId);
    if (turns && recorded) {
      this._localTurns.record(session, channel, recorded, this._localTurns.findAnchorTurnId(channel, turns, turnId));
    }
  }
  /**
   * Cancels a repair turn this host started for Agent Merge, so a stopped or
   * revoked controller cannot leave an autonomous turn running.
   */
  _cancelAgentMergePrompt(session, turnId) {
    const chat = buildDefaultChatUri(session).toString();
    const action = { type: "chat/turnCancelled" /* ChatTurnCancelled */, turnId, duration: 0 };
    this._stateManager.dispatchServerAction(chat, action);
    this._sideEffects.handleAction(chat, action);
  }
  /**
   * Reads a point-in-time snapshot of a session's chat conversation for the
   * `get_session_context` server tool. Targets the session's default chat, or a
   * specific peer chat when `chatId` is provided. Returns `undefined` when no
   * live conversation state exists (e.g. a cold/unsubscribed session).
   */
  async _getChatContext(session, chatId) {
    const chatState = chatId ? await this._stateManager.resolveChatState(buildChatUri(session.toString(), chatId)) : this._stateManager.getDefaultChatState(session.toString());
    if (!chatState) {
      return void 0;
    }
    return {
      turns: chatState.turns,
      ...chatState.activeTurn ? { activeTurn: { message: chatState.activeTurn.message, responseParts: chatState.activeTurn.responseParts } } : {},
      hasMoreHistory: !!chatState.turnsNextCursor
    };
  }
  async _renameChatFromTool(session, chat, title) {
    validateRenameTitle(title, "rename_chat" /* RenameChat */);
    const isDefaultChat = isDefaultChatUri(chat.toString());
    if (!isDefaultChat && !await this._peerChatExists(session, chat)) {
      throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: chat must match a known non-default chat.`);
    }
    await persistSessionMetadataValues(this._sessionDataService, session.toString(), {
      [customChatTitleMetadataKey(chat.toString())]: title,
      [customChatTitleSourceMetadataKey(chat.toString())]: AGENT_HOST_TITLE_SOURCE_AGENT,
      ...isDefaultChat ? {
        [SESSION_CUSTOM_TITLE_KEY]: title,
        [SESSION_CUSTOM_TITLE_SOURCE_KEY]: AGENT_HOST_TITLE_SOURCE_AGENT
      } : {}
    });
    const state = this._stateManager.getSessionState(session.toString());
    if (state) {
      if (isDefaultChat && state.title !== title) {
        this._stateManager.dispatchServerAction(session.toString(), { type: "session/titleChanged" /* SessionTitleChanged */, title });
      }
      this._stateManager.updateChatTitle(session.toString(), chat.toString(), title);
    }
    if (isDefaultChat) {
      this._sideEffects.markTitleRenamed(session.toString());
    }
    this._sideEffects.markTitleRenamed(session.toString(), chat.toString());
    return { title };
  }
  async _peerChatExists(session, chat) {
    if (this._stateManager.getSessionState(session.toString())?.chats.some((candidate) => candidate.resource === chat.toString())) {
      return true;
    }
    const persisted = await this._readPersistedPeerChatCatalog(session);
    return persisted?.some((candidate) => candidate.uri === chat.toString()) === true;
  }
  _toSessionMetadata(metadata) {
    const { chat, ...rest } = metadata;
    return {
      ...rest,
      session: URI.parse(parseRequiredSessionUriFromChatUri(chat))
    };
  }
  /** `undefined` means the provider catalog is unavailable; deferred waits for external readiness. */
  async _enumerateLegacyProviderSessions(provider) {
    const chats = await provider.listChatsToMigrate();
    return chats === AgentChatMigrationDeferred ? chats : chats?.map((metadata) => this._toSessionMetadata(metadata));
  }
  /**
   * Registry metadata for one session. The host offers its stable timestamps
   * as a fallback, but the provider decides whether a passive metadata miss
   * means "not initialized yet" or "not found".
   */
  async _registeredSessionMetadata(agent, session, external, fallback) {
    const chat = URI.parse(buildDefaultChatUri(session));
    const metadata = await agent.getChatMetadata(
      chat,
      this._chatContext(session, chat),
      await this._readDefaultChatProviderData(session),
      fallback ? { registryFallback: { startTime: fallback.startTime, modifiedTime: fallback.modifiedTime } } : void 0
    );
    if (!metadata) {
      return void 0;
    }
    if (fallback && metadata.modifiedTime > fallback.modifiedTime) {
      await this._advanceSessionModifiedTime(session, metadata.modifiedTime, false);
    }
    const sessionMetadata = this._toSessionMetadata(metadata);
    return {
      ...sessionMetadata,
      _meta: withSessionExternal(sessionMetadata._meta, external)
    };
  }
  async _getSessionMetadata(session) {
    const registered = await this._sessionRegistry.get(session, (entry) => this._migrateRegisteredSession(entry));
    if (!registered) {
      return void 0;
    }
    const agent = this._providerService.getProvider(registered.provider);
    const liveSummary = this._stateManager.getSessionSummary(session.toString());
    if (liveSummary) {
      const metadata = (liveSummary.workingDirectories === void 0 && agent ? await this._registeredSessionMetadata(agent, session, registered.external, registered) : void 0) ?? {
        session,
        startTime: registered.startTime,
        modifiedTime: Date.parse(liveSummary.modifiedAt)
      };
      return this._withLiveSessionMetadata(metadata, liveSummary);
    }
    if (!agent) {
      return void 0;
    }
    return this._registeredSessionMetadata(agent, session, registered.external, registered);
  }
  _withLiveSessionMetadata(metadata, liveSummary) {
    let _meta = liveSummary._meta !== void 0 || metadata._meta !== void 0 ? { ...metadata._meta, ...liveSummary._meta } : void 0;
    _meta = withSessionMultiRootMetadata(_meta, readSessionMultiRootMetadata(liveSummary._meta) ?? readSessionMultiRootMetadata(metadata._meta));
    return {
      ...metadata,
      summary: liveSummary.title || metadata.summary,
      status: liveSummary.status,
      activity: liveSummary.activity,
      modifiedTime: Date.parse(liveSummary.modifiedAt),
      project: liveSummary.project ? { uri: URI.parse(liveSummary.project.uri), displayName: liveSummary.project.displayName } : metadata.project,
      workingDirectories: liveSummary.workingDirectories !== void 0 ? liveSummary.workingDirectories.map((directory) => URI.parse(directory)) : metadata.workingDirectories,
      changes: liveSummary.changes ?? metadata.changes,
      changesets: this._stateManager.getSessionState(metadata.session.toString())?.changesets ?? metadata.changesets,
      ..._meta !== void 0 ? { _meta } : {}
    };
  }
  /** Test surface: settles once the startup Agent Merge restore pass and the index writes it enqueued have run. */
  async whenAgentMergeSessionsRestored() {
    for (let i = 0; i < 3; i++) {
      await this._agentMergeIndexWrites;
      await this._agentMergeRestore;
    }
  }
  /**
   * Materializes persisted Agent-Merge-enabled sessions so monitoring resumes
   * without a client opening them. The index is authoritative, so this never
   * opens a database for a session that is not monitored.
   */
  async _restoreAgentMergeMonitoredSessions() {
    if (!this._isAgentMergeEnabled()) {
      return;
    }
    await this._agentMergeIndexWrites;
    const enabled = await this._sessionRegistry.listAgentMergeEnabled();
    if (enabled.length === 0) {
      return;
    }
    const limiter = new Limiter(4);
    await Promise.all(enabled.map((session) => limiter.queue(async () => {
      const sessionStr = session.toString();
      if (this._stateManager.getSessionState(sessionStr)) {
        return;
      }
      try {
        const registered = await this._sessionRegistry.get(session, (entry) => this._migrateRegisteredSession(entry));
        if (!registered || await this._isPersistedSessionArchived(session)) {
          await this._sessionRegistry.setAgentMergeEnabled(session, false);
          return;
        }
        if (!this._providerService.getProvider(registered.provider)) {
          return;
        }
        this._logService.info(`[AgentService] Restoring Agent-Merge-enabled session for monitoring: ${sessionStr}`);
        await this.restoreSession(session);
      } catch (err) {
        this._logService.warn(`[AgentService] Failed to restore Agent-Merge-enabled session ${sessionStr}`, err);
      }
    })));
  }
  /** Archive check for the few indexed sessions, so a terminal session is never re-held. */
  async _isPersistedSessionArchived(session) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return false;
    }
    try {
      const metadata = await ref.object.getMetadataObject({
        [AH_META_IS_ARCHIVED_DB_KEY]: true,
        [AH_META_IS_DONE_DB_KEY]: true
      });
      return (metadata[AH_META_IS_ARCHIVED_DB_KEY] ?? metadata[AH_META_IS_DONE_DB_KEY]) === "true";
    } finally {
      ref.dispose();
    }
  }
  /** Mirrors a session's Agent Merge enablement into the host-owned index. */
  _syncAgentMergeIndex(session, previous, current) {
    const wasEnabled = readAgentMergeSessionState(previous?.values)?.enabled === true;
    const isEnabled = readAgentMergeSessionState(current?.values)?.enabled === true;
    if (wasEnabled === isEnabled) {
      return;
    }
    this._writeAgentMergeIndex(session, isEnabled);
  }
  /** Drops a session from the index when it reaches a terminal state (archived or deleted). */
  _clearAgentMergeIndex(session) {
    this._writeAgentMergeIndex(session, false);
  }
  _writeAgentMergeIndex(session, enabled) {
    this._agentMergeIndexWrites = this._agentMergeIndexWrites.then(() => this._retryRegistryMutation(
      () => this._sessionRegistry.setAgentMergeEnabled(session, enabled),
      `Agent Merge index write for ${session.toString()}`
    )).catch((err) => this._logService.warn(`[AgentService] Failed to update the Agent Merge index for ${session.toString()}`, err));
  }
  /**
   * Awaits legacy migration started at provider registration. Provider-owned
   * discovery is independent and surfaces unknown chats additively.
   */
  async _awaitInitialProviderMigration() {
    await Promise.all(this._providerService.getProviders().map((provider) => this._awaitInitialProviderMigrationForProvider(provider)));
  }
  /**
   * Awaits the registration-time legacy migration for a single provider,
   * retrying once if that initial catalog pass was unavailable. Rejects only if
   * the retry also fails. Restore uses this to wait for its own provider's
   * catalog before reading per-session metadata, mirroring what
   * {@link _awaitInitialProviderMigration} does for `listSessions`.
   */
  async _awaitInitialProviderMigrationForProvider(provider, requireReadableCatalog = false) {
    const migration = this._initialProviderMigrations.get(provider.id);
    if (!migration) {
      if (requireReadableCatalog || this._deferredProviderMigrations.has(provider.id)) {
        await this._ensureLegacyChatsMigrated(provider, requireReadableCatalog);
      }
      return this._readableProviderCatalogs.has(provider.id);
    }
    try {
      await migration;
    } catch (err) {
      this._logService.warn(`[AgentService] initial provider catalog for ${provider.id} was unavailable; retrying before accessing sessions`, err);
      await this._replaceFailedInitialProviderMigration(provider, migration);
    }
    if (requireReadableCatalog && !this._readableProviderCatalogs.has(provider.id)) {
      await this._ensureLegacyChatsMigrated(provider, true);
    } else if (this._firstListingServed && this._deferredProviderMigrations.has(provider.id)) {
      await this._ensureLegacyChatsMigrated(provider);
    }
    return this._readableProviderCatalogs.has(provider.id);
  }
  async _migrateAndRegisterDiscoveredChats(provider, chats) {
    if (this._deferredProviderMigrations.has(provider.id)) {
      try {
        await this._ensureLegacyChatsMigrated(provider, true);
      } catch (err) {
        this._logService.warn(`[AgentService] registry migration: failed for provider ${provider.id} after chat discovery`, err);
      }
    }
    await this._registerDiscoveredChats(provider, chats);
  }
  _replaceFailedInitialProviderMigration(provider, failed) {
    const current = this._initialProviderMigrations.get(provider.id);
    if (current !== failed) {
      return current ?? Promise.resolve();
    }
    const retry2 = this._ensureLegacyChatsMigrated(provider, true);
    return this._trackInitialProviderMigration(provider, retry2);
  }
  /**
   * Runs one provider discovery at most once concurrently, sharing the
   * in-flight attempt across callers and clearing it on settle so failures
   * retry on the next trigger. `force` requests a fresh pass after an
   * provider catalog trigger.
   *
   * A `force` request that arrives while a sweep — forced or not, freshly
   * started or already chained — is already in-flight is never dropped: it
   * is chained to run again immediately after the in-flight attempt settles
   * (regardless of whether that attempt succeeded or failed), so the
   * provider's on-disk set is re-read fresh instead of silently reusing a
   * sweep that may predate the change the `force` caller is reacting to.
   * `forceQueued` tracks only whether a follow-up is currently queued on the
   * entry — never whether the entry's own in-flight attempt happened to be
   * invoked with `force` — so a freshly-created entry always starts with
   * `forceQueued: false` even when its own first attempt is itself forced.
   * `forceQueued` is reset the moment a chained attempt actually *starts*
   * running (not merely once it is scheduled), so a second `force` that
   * arrives while a chained (or freshly-forced) attempt is still in flight
   * is likewise chained onto a further follow-up rather than being
   * coalesced away as a supposed duplicate.
   */
  _ensureLegacyChatsMigrated(provider, force = false) {
    return this._ensureProviderCatalog(provider, this._providerMigrations, force, (runForce) => this._migrateLegacyProviderChats(provider, runForce));
  }
  _ensureProviderCatalog(provider, states, force, run2) {
    const existing = states.get(provider.id);
    if (existing) {
      if (force && !existing.forceQueued) {
        existing.forceQueued = true;
        const chained = existing.promise.catch(() => {
        }).then(() => {
          existing.forceQueued = false;
          return run2(true);
        });
        existing.promise = chained;
        this._armProviderCatalogCleanup(provider, states, existing, chained);
      }
      return existing.promise;
    }
    const state = { promise: Promise.resolve(), forceQueued: false };
    const attempt = run2(force);
    state.promise = attempt;
    states.set(provider.id, state);
    this._armProviderCatalogCleanup(provider, states, state, attempt);
    return attempt;
  }
  /**
   * Clears `provider`'s in-flight discovery entry once `promise` (the entry's
   * current attempt) settles, but only if the entry still points at that
   * exact promise — a `force` chain may have replaced it with a follow-up
   * attempt in the meantime, which arms its own cleanup in turn.
   */
  _armProviderCatalogCleanup(provider, states, state, promise) {
    const clear = () => {
      if (state.promise === promise && states.get(provider.id) === state) {
        states.delete(provider.id);
      }
    };
    void promise.then(clear, clear);
  }
  /**
   * Additively discovers one provider's native top-level chats. Internal chat backings are
   * filtered out, subagent sessions are filtered out, and explicitly-deleted
   * sessions are never resurrected: registration goes through
   * {@link AgentSessionRegistry.register}, which atomically declines to
   * (re-)register a session that is (or concurrently becomes)
   * tombstoned, rather than trusting a separate up-front tombstone check that
   * could race a concurrent {@link disposeSession}.
   *
   * `undefined` from the provider means it cannot enumerate yet (its SDK may
   * not be downloaded/started) — not an authoritative empty result — so its
   * next readiness signal retries.
   */
  async _registerDiscoveredChats(provider, chats) {
    const registeredKeys = new Set(await this._sessionRegistry.listSessionKeys());
    const discoveryLimiter = new Limiter(4);
    let suppressed = 0;
    let skippedAsStale = 0;
    let registeredExternal = false;
    let alreadyRegistered = 0;
    let registryChanged = false;
    const untitledExternal = [];
    const results = await Promise.all(chats.map(({ external, ...metadata }) => discoveryLimiter.queue(async () => {
      const sessionMetadata = this._toSessionMetadata(metadata);
      const session = sessionMetadata.session;
      try {
        if (registeredKeys.has(session.toString())) {
          alreadyRegistered++;
          await this._advanceSessionModifiedTime(session, sessionMetadata.modifiedTime);
          return false;
        }
        if (isSubagentSession(session.toString()) || await this._isChatBacking(session)) {
          suppressed++;
          return false;
        }
        if (external && !readSessionEhcliAdoptable(sessionMetadata._meta) && this._isExternalSessionOlderThanMaxAge(sessionMetadata.modifiedTime, Date.now())) {
          skippedAsStale++;
          return false;
        }
        const identity2 = { session, provider: provider.id, startTime: metadata.startTime, modifiedTime: metadata.modifiedTime, external, source: external ? "discovery" : "restore" };
        const registered2 = await this._retryRegistryMutation(
          () => this._sessionRegistry.register(session, identity2, { checkTombstone: true }),
          `discovery registration for ${session.toString()}`
        );
        if (registered2) {
          registryChanged = true;
          if (external) {
            await this._initializeExternalSessionReadState(session);
          }
          registeredKeys.add(session.toString());
          if (external && !sessionMetadata.summary) {
            untitledExternal.push(sessionMetadata);
          }
          if (external && !readSessionEhcliAdoptable(sessionMetadata._meta)) {
            registeredExternal = true;
          } else {
            await this._announceSurfacedSession({ ...sessionMetadata, _meta: withSessionExternal(sessionMetadata._meta, external) }, provider.id);
          }
        } else {
          this._logService.trace(`[AgentService] discovery: ${session.toString()} was not registered (tombstoned)`);
        }
        return registered2;
      } catch (err) {
        this._logService.warn(`[AgentService] Failed to register discovered chat ${session.toString()} for provider ${provider.id}`, err);
        return false;
      }
    })));
    const registered = results.filter((changed) => changed).length;
    if (registryChanged) {
      this._invalidateSessionList();
    }
    if (registeredExternal) {
      this._queueSessionListReconciliation();
    }
    if (untitledExternal.length > 0) {
      this._scheduleExternalSessionTitles(untitledExternal);
    }
    this._logService.info(`[AgentService] discovery for provider ${provider.id}: ${chats.length} candidate(s) (${chats.filter((chat) => chat.external).length} external), ${registered} registered, ${alreadyRegistered} already registered, ${suppressed} suppressed as subagent/chat backing, ${skippedAsStale} skipped as older than ${EXTERNAL_SESSION_MAX_AGE_MS / DAY_MS} days`);
    return registered > 0;
  }
  async _migrateLegacyProviderChats(provider, force = false) {
    if (!force) {
      if (await this._sessionRegistry.isProviderBackfilled(provider.id)) {
        return;
      }
      if (await this._sessionRegistry.isBackfilled()) {
        await this._sessionRegistry.markProviderBackfilled(provider.id);
        return;
      }
    }
    const sessions = await this._enumerateLegacyProviderSessions(provider);
    if (sessions === void 0) {
      this._readableProviderCatalogs.delete(provider.id);
      throw new ProviderCatalogUnavailableError(provider.id);
    }
    if (sessions === AgentChatMigrationDeferred) {
      this._deferredProviderMigrations.add(provider.id);
      this._readableProviderCatalogs.delete(provider.id);
      return;
    }
    const existing = new Map((await this._listRegisteredSessions()).map((session) => [session.session.toString(), session.external]));
    const migrationLimiter = new Limiter(4);
    const identities = await Promise.all(sessions.map((s) => migrationLimiter.queue(async () => {
      if (isSubagentSession(s.session.toString())) {
        return void 0;
      }
      const facts = await this._readSessionRegistrationFacts(s.session);
      if (facts.chatBacking) {
        return void 0;
      }
      const external = !facts.hostCreated;
      return { session: s.session, provider: provider.id, startTime: s.startTime, modifiedTime: s.modifiedTime, external, source: external ? "discovery" : "restore" };
    })));
    let registeredExternal = false;
    const untitledExternal = [];
    for (let index = 0; index < identities.length; index++) {
      const identity2 = identities[index];
      if (!identity2) {
        continue;
      }
      const metadata = sessions[index];
      if (identity2.external && !readSessionEhcliAdoptable(metadata._meta) && this._isExternalSessionOlderThanMaxAge(metadata.modifiedTime, Date.now())) {
        continue;
      }
      const registered = await this._sessionRegistry.register(identity2.session, identity2, { checkTombstone: true });
      if (registered) {
        this._invalidateSessionList();
        if (identity2.external && existing.get(identity2.session.toString()) !== true) {
          await this._initializeExternalSessionReadState(identity2.session);
        }
        existing.set(identity2.session.toString(), identity2.external);
        if (identity2.external && !metadata.summary) {
          untitledExternal.push(metadata);
        }
        if (identity2.external && !readSessionEhcliAdoptable(metadata._meta)) {
          registeredExternal = true;
        } else {
          await this._announceSurfacedSession({ ...metadata, _meta: withSessionExternal(metadata._meta, identity2.external) }, provider.id);
        }
      }
    }
    await this._sessionRegistry.markProviderBackfilled(provider.id);
    this._deferredProviderMigrations.delete(provider.id);
    this._readableProviderCatalogs.add(provider.id);
    this._startChatDiscovery(provider, "legacy migration enumerated the provider catalog");
    if (registeredExternal) {
      this._queueSessionListReconciliation();
    }
    if (untitledExternal.length > 0) {
      this._scheduleExternalSessionTitles(untitledExternal);
    }
  }
  /** Seeds external sessions as read. Avoiding this DB requires a durable registry default. */
  async _initializeExternalSessionReadState(session) {
    const ref = this._sessionDataService.openDatabase(session);
    try {
      await ref.object.setMetadata(AH_META_IS_READ_DB_KEY, "true");
    } finally {
      ref.dispose();
    }
  }
  async _isExternalProviderChat(session) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return true;
    }
    try {
      return await ref.object.getMetadata(AH_META_WORKSPACELESS_DB_KEY) === void 0;
    } finally {
      ref.dispose();
    }
  }
  /**
   * Both facts registry backfill needs about a session, from a single database
   * open — it asks for both per session, and a large catalogue makes the second
   * open the dominant cost of the pass.
   */
  async _readSessionRegistrationFacts(session) {
    if (this._unpersistedChatBackings.has(session.toString())) {
      return { chatBacking: true, hostCreated: false };
    }
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return { chatBacking: false, hostCreated: false };
    }
    try {
      const metadata = await ref.object.getMetadataObject({ [CHAT_BACKING_METADATA_KEY]: true, [AH_META_WORKSPACELESS_DB_KEY]: true });
      return { chatBacking: !!metadata[CHAT_BACKING_METADATA_KEY], hostCreated: metadata[AH_META_WORKSPACELESS_DB_KEY] !== void 0 };
    } finally {
      ref.dispose();
    }
  }
  async _migrateRegisteredSession(entry) {
    if (entry.external !== void 0) {
      return void 0;
    }
    const external = await this._isExternalProviderChat(entry.session);
    return {
      ...entry,
      external,
      source: external ? "discovery" : entry.source
    };
  }
  _listRegisteredSessions() {
    return this._sessionRegistry.list((entry) => this._migrateRegisteredSession(entry));
  }
  async _advanceSessionModifiedTime(session, modifiedTime, invalidate = true) {
    if (!Number.isFinite(modifiedTime)) {
      return;
    }
    const changed = await this._retryRegistryMutation(
      () => this._sessionRegistry.updateModifiedTime(session, modifiedTime),
      `modified-time update for ${session.toString()}`
    );
    if (changed && invalidate) {
      this._invalidateSessionList();
    }
  }
  _writeSessionModifiedTime(session, modifiedTime) {
    this._sessionModifiedTimeWrites = this._sessionModifiedTimeWrites.then(() => this._advanceSessionModifiedTime(session, modifiedTime)).catch((err) => this._logService.warn(`[AgentService] Failed to persist the modified time for ${session.toString()}`, err));
  }
  async _retryRegistryMutation(operation, description) {
    try {
      return await operation();
    } catch (err) {
      this._logService.warn(`[AgentService] Retrying failed session registry ${description}`, err);
      return operation();
    }
  }
  /** Returns registered candidates. Tombstones remain candidates so registration can reject them atomically. */
  async _filterKnownSessions(sessions) {
    const registered = await this._sessionRegistry.listSessionKeys();
    const known = /* @__PURE__ */ new Set();
    for (const session of sessions) {
      const key = session.toString();
      if (registered.has(key)) {
        known.add(key);
      }
    }
    return known;
  }
  /**
   * Whether a session is marked as an internal chat backing, either durably
   * or in `_unpersistedChatBackings`.
   */
  async _isChatBacking(session) {
    if (this._unpersistedChatBackings.has(session.toString())) {
      return true;
    }
    try {
      const ref = await this._sessionDataService.tryOpenDatabase(session);
      if (!ref) {
        return false;
      }
      try {
        return !!await ref.object.getMetadata(CHAT_BACKING_METADATA_KEY);
      } finally {
        ref.dispose();
      }
    } catch {
      return false;
    }
  }
  _invalidateSessionList() {
    this._registryEpoch++;
    this._inFlightListSessions.clear();
  }
  async listSessions(mode = this._getExternalSessionsMode()) {
    const epoch = this._registryEpoch;
    const inFlight = this._inFlightListSessions.get(mode);
    if (inFlight && inFlight.epoch === epoch) {
      return [...await inFlight.promise];
    }
    const promise = this._computeSessions(mode);
    const entry = { epoch, promise };
    this._inFlightListSessions.set(mode, entry);
    const clear = () => {
      if (this._inFlightListSessions.get(mode) === entry) {
        this._inFlightListSessions.delete(mode);
      }
    };
    void promise.then(
      () => {
        clear();
        this._firstListingServed = true;
        this._openStartupSettled();
      },
      clear
    );
    return [...await promise];
  }
  async _computeSessions(mode) {
    this._logService.trace("[AgentService] listSessions computation started");
    const startedAt = Date.now();
    await this._awaitInitialProviderMigration();
    const allRegistered = await this._listRegisteredSessions();
    const hiddenExternal = this._hidesAllExternalSessions(mode) ? new Set(allRegistered.filter((entry) => entry.external).map((entry) => entry.session.toString())) : /* @__PURE__ */ new Set();
    const registered = hiddenExternal.size > 0 ? allRegistered.filter((entry) => !hiddenExternal.has(entry.session.toString())) : allRegistered;
    const metadataLimiter = new Limiter(4);
    const results = await Promise.all(registered.map((registeredSession) => metadataLimiter.queue(async () => {
      const { session, provider, external } = registeredSession;
      if (this._stateManager.isIdleProvisionalSession(session.toString())) {
        return void 0;
      }
      const agent = this._providerService.getProvider(provider);
      if (!agent) {
        return void 0;
      }
      try {
        return await this._registeredSessionMetadata(agent, session, external, registeredSession);
      } catch (err) {
        this._logService.warn(`[AgentService] listSessions: failed to read metadata for ${session}`, err);
        return void 0;
      }
    })));
    const flat = results.filter((s) => s !== void 0);
    const overlayLimiter = new Limiter(4);
    const overlaid = await Promise.all(flat.map((s) => overlayLimiter.queue(async () => {
      const sanitized = { ...s, _meta: withSessionMultiRootMetadata(s._meta, void 0) };
      if (this._unpersistedChatBackings.has(s.session.toString())) {
        return void 0;
      }
      try {
        const ref = await this._sessionDataService.tryOpenDatabase(s.session);
        if (!ref) {
          return sanitized;
        }
        try {
          const sessionStr = s.session.toString();
          const changesetKeys = this._changesetCoordinator.getListMetadataKeys(sessionStr);
          const metadataKeys = changesetKeys ? { customTitle: true, [AH_META_IS_READ_DB_KEY]: true, [AH_META_IS_ARCHIVED_DB_KEY]: true, [AH_META_IS_DONE_DB_KEY]: true, [AH_META_CREATED_BY_SESSION_DB_KEY]: true, [AH_META_WORKSPACELESS_DB_KEY]: true, [AH_META_EHCLI_ADOPTED_DB_KEY]: true, [SESSION_META_MULTI_ROOT_KEY]: true, [SESSION_META_FOLDER_PICKER_KEY]: true, [SESSION_ARTIFACTS_KEY]: true, [CHAT_BACKING_METADATA_KEY]: true, [WORKTREE_META_REPOSITORY_ROOT]: true, ...GIT_DB_METADATA_KEYS, ...changesetKeys } : { customTitle: true, [AH_META_IS_READ_DB_KEY]: true, [AH_META_IS_ARCHIVED_DB_KEY]: true, [AH_META_IS_DONE_DB_KEY]: true, [AH_META_CREATED_BY_SESSION_DB_KEY]: true, [AH_META_WORKSPACELESS_DB_KEY]: true, [AH_META_EHCLI_ADOPTED_DB_KEY]: true, [SESSION_META_MULTI_ROOT_KEY]: true, [SESSION_META_FOLDER_PICKER_KEY]: true, [SESSION_ARTIFACTS_KEY]: true, [CHAT_BACKING_METADATA_KEY]: true, [WORKTREE_META_REPOSITORY_ROOT]: true, ...GIT_DB_METADATA_KEYS };
          const m = await ref.object.getMetadataObject(metadataKeys);
          if (m[CHAT_BACKING_METADATA_KEY]) {
            return void 0;
          }
          let updated = sanitized;
          if (m.customTitle) {
            updated = { ...updated, summary: m.customTitle };
          }
          if (m[AH_META_IS_READ_DB_KEY] !== void 0) {
            updated = { ...updated, status: withSessionStatusFlag(updated.status ?? 1 /* Idle */, 32 /* IsRead */, m[AH_META_IS_READ_DB_KEY] === "true") };
          }
          const persistedArchived = m[AH_META_IS_ARCHIVED_DB_KEY] ?? m[AH_META_IS_DONE_DB_KEY];
          if (persistedArchived !== void 0) {
            updated = { ...updated, status: withSessionStatusFlag(updated.status ?? 1 /* Idle */, 64 /* IsArchived */, persistedArchived === "true") };
          }
          const creationReference = parseSessionCreationReference(m[AH_META_CREATED_BY_SESSION_DB_KEY]);
          if (creationReference) {
            updated = { ...updated, _meta: withSessionCreationReference(updated._meta, creationReference) };
          }
          if (m[META_GIT_STATE]) {
            try {
              const gitState = JSON.parse(m[META_GIT_STATE]);
              updated = { ...updated, _meta: withSessionGitState(updated._meta, gitState) };
            } catch (e) {
              this._logService.warn(`[AgentService][listSessions] Failed to parse Git state for ${s.session}`, e);
            }
          }
          if (m[META_GITHUB_STATE]) {
            try {
              const gitHubState = JSON.parse(m[META_GITHUB_STATE]);
              updated = { ...updated, _meta: withSessionGitHubState(updated._meta, gitHubState) };
            } catch (e) {
              this._logService.warn(`[AgentService][listSessions] Failed to parse GitHub state for ${s.session}`, e);
            }
          }
          if (m[META_SOURCE_CONTROL_STATE]) {
            try {
              const sourceControlState = parsePersistedSourceControlState(m[META_SOURCE_CONTROL_STATE]);
              updated = { ...updated, _meta: withSessionSourceControlState(updated._meta, sourceControlState) };
            } catch (e) {
              this._logService.warn(`[AgentService][listSessions] Failed to parse source-control state for ${s.session}`, e);
            }
          }
          if (m[AH_META_WORKSPACELESS_DB_KEY] !== void 0) {
            updated = { ...updated, _meta: withSessionWorkspaceless(updated._meta, m[AH_META_WORKSPACELESS_DB_KEY] === "true") };
          }
          if (m[AH_META_EHCLI_ADOPTED_DB_KEY] !== void 0) {
            updated = { ...updated, _meta: withSessionEhcliAdopted(updated._meta, m[AH_META_EHCLI_ADOPTED_DB_KEY] === "true") };
          }
          const multiRoot = parseSessionMultiRootMetadata(m[SESSION_META_MULTI_ROOT_KEY]);
          if (multiRoot) {
            updated = { ...updated, _meta: withSessionMultiRootMetadata(updated._meta, multiRoot) };
          }
          const artifacts = this._readPersistedArtifacts(m[SESSION_ARTIFACTS_KEY], sessionStr, "[AgentService][listSessions]");
          if (artifacts.length > 0) {
            updated = { ...updated, _meta: withSessionArtifacts(updated._meta, artifacts) };
          }
          const folderPickerDecision = parseSessionFolderPickerDecision(m[SESSION_META_FOLDER_PICKER_KEY]);
          if (folderPickerDecision) {
            updated = { ...updated, _meta: withSessionFolderPickerDecision(updated._meta, folderPickerDecision) };
          }
          const worktreeProject = worktreeProjectFromRepositoryRoot(m[WORKTREE_META_REPOSITORY_ROOT]);
          if (worktreeProject) {
            updated = { ...updated, project: worktreeProject };
          }
          return this._changesetCoordinator.decorateListEntry(updated, m);
        } finally {
          ref.dispose();
        }
      } catch (e) {
        this._logService.warn(`[AgentService] Failed to read session metadata overlay for ${s.session}`, e);
      }
      return sanitized;
    })));
    const result = overlaid.filter((s) => s !== void 0);
    const withStatus = result.map((s) => {
      const liveSummary = this._stateManager.getSessionSummary(s.session.toString());
      if (liveSummary) {
        return this._withLiveSessionMetadata(s, liveSummary);
      }
      return s;
    });
    const known = new Set(hiddenExternal);
    for (const session of withStatus) {
      known.add(session.session.toString());
    }
    const additions = [];
    for (const summary of this._stateManager.getOverlaySessionSummaries()) {
      if (known.has(summary.resource)) {
        continue;
      }
      if (isSubagentSession(summary.resource)) {
        continue;
      }
      const summaryWorkingDirs = summary.workingDirectories;
      additions.push({
        session: URI.parse(summary.resource),
        startTime: Date.parse(summary.createdAt),
        modifiedTime: Date.parse(summary.modifiedAt),
        summary: summary.title,
        status: summary.status,
        activity: summary.activity,
        workingDirectories: summaryWorkingDirs?.map((d) => URI.parse(d)),
        ...summary.project ? { project: { uri: URI.parse(summary.project.uri), displayName: summary.project.displayName } } : {},
        changes: summary.changes,
        // This overlay path never opens the session database (unlike the
        // provider-returned sessions handled above), so carry the
        // in-memory `summary._meta` directly. It holds the live state
        // (e.g. the GitHub state published when a PR is created), so a
        // freshly-created session that the provider transiently omits
        // still reports it here.
        ...summary._meta !== void 0 ? { _meta: summary._meta } : {}
      });
    }
    const combined = additions.length > 0 ? [...withStatus, ...additions] : withStatus;
    const now = Date.now();
    const recentSessionKeys = mode === "recent" /* Recent */ ? this._getRecentSessionKeys(combined, now) : void 0;
    const visible = [];
    let hiddenByExternalMode = hiddenExternal.size;
    for (const session of combined) {
      if (this._shouldIncludeSession(session, mode, now, recentSessionKeys)) {
        visible.push(session);
      } else if (!readSessionEhcliAdoptable(session._meta)) {
        hiddenByExternalMode++;
      }
    }
    const total = combined.length + hiddenExternal.size;
    this._logHiddenSessions(hiddenByExternalMode, total, mode);
    const duration = Date.now() - startedAt;
    const message = `[AgentService] listSessions computed ${visible.length} of ${total} session(s) for mode '${mode}' in ${duration}ms (${additions.length} state-manager fallback)`;
    if (duration >= SLOW_LIST_SESSIONS_THRESHOLD_MS) {
      this._logService.info(message);
    } else {
      this._logService.trace(message);
    }
    return visible;
  }
  /**
   * Surfaces how many sessions the external-sessions setting is holding back.
   * Without this, a session that a provider discovered but the current mode
   * filters out is indistinguishable from one that was never discovered.
   * `hidden` counts only rows the mode itself excluded, never the
   * adoptable-legacy rows gated on the separate migrate-legacy setting.
   */
  _logHiddenSessions(hidden, total, mode) {
    const signature = `${hidden}/${total}/${mode}`;
    if (signature === this._lastHiddenSessionsLog) {
      return;
    }
    this._lastHiddenSessionsLog = signature;
    if (hidden > 0) {
      this._logService.info(`[AgentService] listSessions hid ${hidden} of ${total} session(s) (${AgentHostShowExternalSessionsConfigKey}: '${mode}')`);
    }
  }
  _getExternalSessionsMode() {
    const rootValue = this._configurationService.getRootConfigValues()?.[AgentHostShowExternalSessionsConfigKey];
    if (rootValue === "all") {
      return "last30Days" /* Last30Days */;
    }
    return this._configurationService.getRootValue(platformRootSchema, AgentHostShowExternalSessionsConfigKey) ?? "none" /* None */;
  }
  _startChatDiscovery(provider, reason) {
    void provider.startChatDiscovery?.().catch((error) => this._logService.warn(`[AgentService] Chat discovery for provider ${provider.id} failed after ${reason}`, error));
  }
  _isExternalSessionOlderThanMaxAge(modifiedTime, now) {
    return modifiedTime < now - EXTERNAL_SESSION_MAX_AGE_MS;
  }
  _getRecentSessionKeys(sessions, now) {
    const supersededBefore = this._getRecentLocalSessionUpdateCutoff(now);
    const recentExternalSessions = sessions.filter((session) => readSessionExternal(session._meta) && !readSessionEhcliAdoptable(session._meta) && session.modifiedTime >= now - 7 * DAY_MS && session.modifiedTime >= supersededBefore).sort((a, b) => {
      const timeDifference = b.modifiedTime - a.modifiedTime;
      if (timeDifference !== 0) {
        return timeDifference;
      }
      const aKey = a.session.toString();
      const bKey = b.session.toString();
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
    }).slice(0, RECENT_EXTERNAL_SESSION_LIMIT);
    return new Set(recentExternalSessions.map((session) => session.session.toString()));
  }
  _getRecentLocalSessionUpdateCutoff(now) {
    return this._recentLocalSessionUpdateSnapshot[RECENT_LOCAL_SESSION_UPDATE_LIMIT - 1]?.modifiedTime ?? now - 7 * DAY_MS;
  }
  _recordRecentLocalSessionUpdate(session, modifiedTime) {
    if (!Number.isFinite(modifiedTime)) {
      return;
    }
    const sessionKey = session.toString();
    const existing = this._recentLocalSessionUpdates.find((entry) => entry.session === sessionKey);
    if (existing && existing.modifiedTime >= modifiedTime) {
      return;
    }
    const next = [
      ...this._recentLocalSessionUpdates.filter((entry) => entry.session !== sessionKey),
      { session: sessionKey, modifiedTime }
    ].sort((a, b) => b.modifiedTime - a.modifiedTime || a.session.localeCompare(b.session)).slice(0, RECENT_LOCAL_SESSION_UPDATE_LIMIT);
    if (next.length === this._recentLocalSessionUpdates.length && next.every((entry, index) => entry.session === this._recentLocalSessionUpdates[index].session && entry.modifiedTime === this._recentLocalSessionUpdates[index].modifiedTime)) {
      return;
    }
    this._recentLocalSessionUpdates = next;
    if (!this._storageService.loadError) {
      this._storageService.set(RECENT_LOCAL_SESSION_UPDATES_STORAGE_KEY, next);
    }
  }
  _readRecentLocalSessionUpdates() {
    if (this._storageService.loadError) {
      this._logService.warn("[AgentService] Recent local session updates could not be restored because Agent Host storage failed to load.");
      return [];
    }
    const stored = this._storageService.get(RECENT_LOCAL_SESSION_UPDATES_STORAGE_KEY);
    if (stored === void 0) {
      return [];
    }
    if (!Array.isArray(stored) || stored.length > RECENT_LOCAL_SESSION_UPDATE_LIMIT || !stored.every(isRecentLocalSessionUpdate)) {
      this._logService.warn("[AgentService] Ignoring invalid persisted recent local session updates.");
      return [];
    }
    const updates = stored;
    if (new Set(updates.map((entry) => entry.session)).size !== updates.length) {
      this._logService.warn("[AgentService] Ignoring persisted recent local session updates with duplicate sessions.");
      return [];
    }
    return updates.toSorted((a, b) => b.modifiedTime - a.modifiedTime || a.session.localeCompare(b.session));
  }
  _shouldIncludeSession(session, mode = this._getExternalSessionsMode(), now = Date.now(), recentSessionKeys) {
    if (readSessionEhcliAdoptable(session._meta)) {
      return false;
    }
    if (!readSessionExternal(session._meta)) {
      return true;
    }
    switch (mode) {
      case "recent" /* Recent */:
        return session.modifiedTime >= now - 7 * DAY_MS && (recentSessionKeys === void 0 || recentSessionKeys.has(session.session.toString()));
      case "last24Hours" /* Last24Hours */:
        return session.modifiedTime >= now - DAY_MS;
      case "last7Days" /* Last7Days */:
        return session.modifiedTime >= now - 7 * DAY_MS;
      case "last30Days" /* Last30Days */:
        return !this._isExternalSessionOlderThanMaxAge(session.modifiedTime, now);
      case "none" /* None */:
        return false;
    }
  }
  /**
   * Whether {@link _shouldIncludeSession} is guaranteed to reject every
   * external session under `mode`, letting {@link _computeSessions} drop them
   * on the registry's `external` flag alone.
   *
   * `None` is the only mode that rejects external sessions outright. Adoptable-legacy
   * rows are always excluded now (they belong to the extension host until opened), so
   * they can never keep an external session visible.
   */
  _hidesAllExternalSessions(mode) {
    return mode === "none" /* None */;
  }
  /**
   * Stage-1 validation surface for the session URIs currently held by the
   * orchestrator-owned {@link AgentSessionRegistry}.
   */
  async getRegisteredSessions() {
    return (await this._listRegisteredSessions()).map((s) => s.session);
  }
  /** Test surface for the durable per-provider discovery marker. */
  async isProviderRegistryBackfilled(provider) {
    return this._sessionRegistry.isProviderBackfilled(provider);
  }
  /**
   * Test surface for the legacy global backfill marker. Never written by the
   * per-provider discovery — see the removal of automatic mirroring in
   * {@link AgentSessionRegistry}'s class doc comment.
   */
  async isLegacyRegistryBackfilled() {
    return this._sessionRegistry.isBackfilled();
  }
  /**
   * Freezes the migrate-legacy gate at host startup. The host is a shared
   * process that survives window reloads, so a setting toggled without a full
   * restart is live-propagated into its config; capturing the value once at
   * bootstrap (before any such live change can arrive) is what makes the
   * "requires a restart" contract hold. Called once from {@link agentHostBootstrap};
   * tests never call it and keep the lazy first-read fallback.
   */
  primeMigrateLegacyGate() {
    this._isMigrateLegacyEnabled();
  }
  _isMigrateLegacyEnabled() {
    return this._migrateLegacyEnabledSnapshot ??= this._configurationService.getRootValue(platformRootSchema, AgentHostMigrateLegacyCopilotCliEnabledConfigKey) === true;
  }
  _isAgentMergeEnabled() {
    return this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.Enabled) === true;
  }
  _queueSessionListReconciliation(previousMode) {
    if (previousMode !== void 0) {
      this._sessionListReconciliation = this._sessionListReconciliation.then(() => this._reconcileExternalSessions(previousMode)).catch((error) => this._logService.warn("[AgentService] External session reconciliation failed", error));
      return;
    }
    if (this._reconciliationInFlight) {
      this._reconciliationDirty = true;
      return;
    }
    this._reconciliationInFlight = true;
    this._reconciliationDirty = false;
    this._sessionListReconciliation = this._sessionListReconciliation.then(() => this._reconcileExternalSessions()).catch((error) => this._logService.warn("[AgentService] External session reconciliation failed", error)).finally(() => {
      this._reconciliationInFlight = false;
      if (this._reconciliationDirty) {
        this._reconciliationDirty = false;
        this._queueSessionListReconciliation();
      }
    });
  }
  async _reconcileExternalSessions(previousMode) {
    const startedAt = Date.now();
    const previouslyBroadcast = new Set(this._broadcastExternalSessions);
    const previouslyExposed = new Set(previouslyBroadcast);
    for (const session of this._stateManager.getExposedExternalSessionKeys()) {
      previouslyExposed.add(session);
    }
    const listed = previousMode !== void 0 ? this._resolveModeChangeVisibility(await this.listSessions("last30Days" /* Last30Days */), previousMode, previouslyExposed) : await this.listSessions();
    const visible = /* @__PURE__ */ new Set();
    let published = 0;
    for (const metadata of listed) {
      if (!readSessionExternal(metadata._meta)) {
        continue;
      }
      const key = metadata.session.toString();
      visible.add(key);
      if (!previouslyBroadcast.has(key)) {
        published++;
      }
      if (this._stateManager.getSessionState(key)) {
        this._stateManager.setSessionSummaryPublished(key, true);
      } else {
        const provider = AgentSession.provider(metadata.session);
        if (provider) {
          await this._announceSurfacedSession(metadata, provider);
        }
      }
    }
    let retracted = 0;
    for (const key of previouslyExposed) {
      if (!visible.has(key)) {
        retracted++;
        if (this._stateManager.getSessionState(key)) {
          this._stateManager.setSessionSummaryPublished(key, false);
        } else {
          this._stateManager.retractSurfacedSession(key);
        }
        this._announcedSurfacedKeys.delete(key);
      }
    }
    this._broadcastExternalSessions.clear();
    for (const key of visible) {
      this._broadcastExternalSessions.add(key);
    }
    const duration = Date.now() - startedAt;
    const message = `[AgentService] External session reconciliation done in ${duration}ms (mode: '${this._getExternalSessionsMode()}'${previousMode !== void 0 ? `, previous: '${previousMode}'` : ""}): ${published} published, ${retracted} retracted, ${visible.size} visible`;
    if (published > 0 || retracted > 0 || duration >= SLOW_LIST_SESSIONS_THRESHOLD_MS) {
      this._logService.info(message);
    } else {
      this._logService.trace(message);
    }
  }
  /**
   * Derives both the previous and current mode's visible sets from one catalog
   * pass, since {@link AgentHostExternalSessionsMode.Last30Days} is a superset of every
   * mode and the mode is just a parameter to {@link _shouldIncludeSession}.
   * Adds what `previousMode` had exposed into `previouslyExposed`.
   */
  _resolveModeChangeVisibility(superset, previousMode, previouslyExposed) {
    const now = Date.now();
    const mode = this._getExternalSessionsMode();
    const recentKeysFor = (candidate) => candidate === "recent" /* Recent */ ? this._getRecentSessionKeys(superset, now) : void 0;
    const previousRecentKeys = recentKeysFor(previousMode);
    for (const session of superset) {
      if (readSessionExternal(session._meta) && this._shouldIncludeSession(session, previousMode, now, previousRecentKeys)) {
        previouslyExposed.add(session.session.toString());
      }
    }
    const recentKeys = recentKeysFor(mode);
    const visible = superset.filter((session) => this._shouldIncludeSession(session, mode, now, recentKeys));
    this._logHiddenSessions(superset.length - visible.length, superset.length, mode);
    return visible;
  }
  async _announceSurfacedSession(meta, provider) {
    const key = meta.session.toString();
    if (!this._shouldIncludeSession(meta) || this._announcedSurfacedKeys.has(key) || this._stateManager.getSessionState(key)) {
      return;
    }
    this._announcedSurfacedKeys.add(key);
    try {
      if (await this._sessionRegistry.isTombstoned(meta.session)) {
        this._announcedSurfacedKeys.delete(key);
        return;
      }
      if (!this._shouldIncludeSession(meta)) {
        this._announcedSurfacedKeys.delete(key);
        return;
      }
      this._stateManager.announceSurfacedSession(this._surfacedSessionSummary(meta, provider));
      if (readSessionExternal(meta._meta)) {
        this._broadcastExternalSessions.add(key);
      }
    } catch (err) {
      this._announcedSurfacedKeys.delete(key);
      throw err;
    }
  }
  /** Synthesizes the minimal {@link SessionSummary} for a provider session surfaced outside the normal list response. */
  _surfacedSessionSummary(meta, provider) {
    return {
      resource: meta.session.toString(),
      provider,
      title: meta.summary ?? "",
      // Surfaced legacy sessions predate agent-host read ownership, which has
      // no per-session read flag for them yet. Default them to read: the
      // client trusts the provider's read state once it owns it, so an
      // unflagged summary would otherwise flip every previously-seen session
      // to unread the moment migration is turned on.
      status: withSessionStatusFlag(meta.status ?? 1 /* Idle */, 32 /* IsRead */, true),
      createdAt: new Date(meta.startTime).toISOString(),
      modifiedAt: new Date(meta.modifiedTime).toISOString(),
      ...meta.project ? { project: { uri: meta.project.uri.toString(), displayName: meta.project.displayName } } : {},
      workingDirectories: meta.workingDirectories?.map((d) => d.toString()),
      _meta: meta._meta
    };
  }
  async createSession(config) {
    const provider = this._providerService.resolveProvider(config?.provider);
    const isEphemeral = config ? readEphemeralSessionMeta(config).isEphemeral === true : false;
    if (!provider) {
      throw new Error(`No agent provider registered for: ${config?.provider ?? "(none)"}`);
    }
    if (config?.session) {
      this._cancelPendingSessionGc(config.session);
      this._sessionResidency.touch(config.session);
    }
    if (config?.workingDirectories && config.workingDirectories.length > 1) {
      const supportsMultiple = !!provider.getDescriptor().capabilities?.multipleWorkingDirectories;
      if (!supportsMultiple) {
        this._logService.warn(`[AgentService] Provider '${provider.id}' does not advertise multipleWorkingDirectories; truncating ${config.workingDirectories.length} working directories to 1.`);
        config = { ...config, workingDirectories: [config.workingDirectories[0]] };
      }
    }
    if (config?.importConversation) {
      const importedTurns = config.importConversation.turns.map((t) => ({ ...t, id: generateUuid() }));
      config = { ...config, importConversation: { ...config.importConversation, turns: importedTurns } };
    }
    const initializeSideEffects = this._sideEffects.initialize();
    const sessionConfig = await this._resolveCreatedSessionConfig(provider, config);
    const deferWorktreeCreation = sessionConfig?.values?.["isolation" /* Isolation */] === "worktree" && !config?.importConversation;
    this._logService.trace(`[AgentService] createSession: initializing auto-approver and creating session...`);
    const [, created] = await Promise.all([
      initializeSideEffects,
      this._createProviderSession(provider, config, deferWorktreeCreation)
    ]);
    const session = created.session;
    const isIdleProvisional = created.provisional === true && !config?.importConversation;
    this._logService.trace(`[AgentService] createSession: initialization complete`);
    const creationReference = readSessionCreationReference(config?._meta);
    if (creationReference && !isEphemeral) {
      try {
        await persistSessionMetadataValues(this._sessionDataService, session.toString(), {
          [AH_META_CREATED_BY_SESSION_DB_KEY]: JSON.stringify(creationReference)
        });
      } catch (err) {
        await this._rollbackProviderSession(provider, session);
        throw err;
      }
    }
    if (isEphemeral) {
      try {
        await this._retryRegistryMutation(
          () => this._sessionRegistry.tombstone(session),
          `tombstoning ephemeral session ${session.toString()}`
        );
        if (!isIdleProvisional) {
          this._invalidateSessionList();
        }
      } catch (err) {
        await this._rollbackProviderSession(provider, session);
        throw err;
      }
    } else {
      try {
        const registeredAt = Date.now();
        await this._retryRegistryMutation(
          () => this._sessionRegistry.register(session, { provider: provider.id, startTime: registeredAt, modifiedTime: registeredAt, source: "explicit" }, { checkTombstone: false }),
          `registration for ${session.toString()}`
        );
        if (!isIdleProvisional) {
          this._invalidateSessionList();
        }
      } catch (err) {
        await this._rollbackProviderSession(provider, session);
        throw err;
      }
    }
    this._cancelPendingSessionGc(session);
    this._sessionResidency.touch(session);
    this._logService.trace(`[AgentService] createSession: provider=${provider.id} model=${config?.model?.id ?? "(default)"}`);
    this._providerService.associateSession(session.toString(), provider.id);
    if (config?.progressToken) {
      let sessions = this._downloadProgressInterest.get(provider.id);
      if (!sessions) {
        sessions = /* @__PURE__ */ new Set();
        this._downloadProgressInterest.set(provider.id, sessions);
      }
      sessions.add(session.toString());
    }
    this._logService.trace(`[AgentService] createSession returned: ${session.toString()}`);
    const provisionalState = isIdleProvisional ? (() => {
      const summary = this._buildInitialSummary(provider, session, config, created, "");
      const state = this._stateManager.createSession(summary, { emitNotification: false });
      state.config = sessionConfig;
      state.activeClients = config?.activeClient ? [config.activeClient] : [];
      return state;
    })() : void 0;
    const defaultChat = URI.parse(buildDefaultChatUri(session));
    const workingDirectories = config?.workingDirectories;
    const [initialCustomizations, folderPickerDecision] = await Promise.all([
      provider.getChatCustomizations(defaultChat, this._chatContext(session, defaultChat), this._hostCustomizations(session)).catch((err) => {
        this._logService.error("[AgentService] createSession: failed to resolve initial customizations", err);
        return void 0;
      }),
      // The harness owns the Folder-picker decision (it is provider-specific),
      // derived from the ordered working-directory set. Only meaningful for a
      // fresh (non-import) multi-root session — the picker never
      // shows with a single folder — and seeded into `_meta` below.
      workingDirectories && workingDirectories.length > 1 && !config?.importConversation && provider.computeFolderPickerDecision ? provider.computeFolderPickerDecision(workingDirectories).catch((err) => {
        this._logService.error("[AgentService] createSession: failed to compute folder-picker decision", err);
        return { hidden: false };
      }) : Promise.resolve(void 0)
    ]);
    if (config?.importConversation) {
      const importedTurns = [...config.importConversation.turns];
      const importedTitle = this._buildImportedTitle(importedTurns);
      const summary = this._buildInitialSummary(provider, session, config, created, importedTitle);
      const state = this._stateManager.createSession(summary);
      state.config = sessionConfig;
      this._stateManager.seedDefaultChatTurns(summary.resource, importedTurns);
      state.activeClients = config.activeClient ? [config.activeClient] : [];
      if (importedTurns.length > 0) {
        this._sideEffects.generateForkedTitle(summary.resource, void 0, importedTurns, importedTitle);
      }
    } else {
      const summary = this._buildInitialSummary(provider, session, config, created, "");
      const state = provisionalState ?? this._stateManager.createSession(summary, { emitNotification: true });
      if (!provisionalState) {
        state.config = sessionConfig;
        state.activeClients = config?.activeClient ? [config.activeClient] : [];
      }
    }
    if (initialCustomizations && initialCustomizations.length > 0) {
      this._stateManager.dispatchServerAction(session.toString(), { type: "session/customizationsChanged" /* SessionCustomizationsChanged */, customizations: [...initialCustomizations] });
    }
    if (folderPickerDecision) {
      this._stateManager.setSessionMeta(session.toString(), withSessionFolderPickerDecision(this._stateManager.getSessionState(session.toString())?._meta, folderPickerDecision));
    }
    this._syncAgentMergeIndex(session, void 0, sessionConfig);
    this._serverToolHost.advertise(session.toString());
    if (sessionConfig?.values && Object.keys(sessionConfig.values).length > 0 && !created.provisional) {
      this._persistConfigValues(session, sessionConfig.values);
    }
    this._changesetCoordinator.onSessionCreated(session.toString());
    if (!created.provisional) {
      this._persistWorkspaceless(session, readSessionWorkspaceless(this._stateManager.getSessionSummary(session.toString())?._meta));
      this._persistMultiRoot(session, readSessionMultiRootMetadata(this._stateManager.getSessionSummary(session.toString())?._meta));
      this._persistFolderPickerDecision(session, readSessionFolderPickerDecision(this._stateManager.getSessionSummary(session.toString())?._meta));
      this._stateManager.dispatchServerAction(session.toString(), { type: "session/ready" /* SessionReady */ });
      const gitHubState = readSessionGitHubState(this._stateManager.getSessionSummary(session.toString())?._meta);
      if (gitHubState) {
        await this._gitStateService.setSessionGitHubState(session.toString(), gitHubState);
      }
    }
    const workingDirectory = created.resolvedWorkingDirectory ?? config?.workingDirectories?.[0];
    void this._gitStateService.refreshSessionGitState(session.toString(), workingDirectory);
    this._sessionResidency.touch(session);
    await this._sessionResidency.reconcile();
    return session;
  }
  async createChat(session, chat, options) {
    const sessionKey = session.toString();
    const provider = this._providerService.getProviderForSession(session);
    if (!provider) {
      throw new Error(`[AgentService] createChat: no provider for session ${sessionKey}`);
    }
    if (!this._supportsChats(provider)) {
      throw new Error(`[AgentService] createChat: provider ${provider.id} does not support multiple chats`);
    }
    let forkedTurns;
    let forkedTitle;
    let forkedSourceTitle;
    const { sideChat, ...providerOptions } = options ?? {};
    let createOptions = providerOptions;
    let peerChatOrigin;
    if (sideChat) {
      const resolvedSideChat = await this._resolveSideChatOrigin(session, sideChat);
      peerChatOrigin = resolvedSideChat.origin;
      createOptions = {
        ...providerOptions,
        ...resolvedSideChat.shouldFork ? {
          fork: {
            source: URI.parse(resolvedSideChat.sourceChat),
            turnId: resolvedSideChat.anchorTurnId ?? sideChat.turnId,
            independentQueue: true
          }
        } : {
          // Active turns run on per-chat queues, so this fresh creation cannot wait behind the source turn.
          fork: void 0
        }
      };
    }
    if (createOptions?.fork && !sideChat) {
      const { sourceChatKey, sourceSessionKey, sourceState } = await this._resolveSessionSourceChat(createOptions.fork.source);
      if (this._stateManager.getChatOrigin(sourceChatKey)?.kind === "tool" /* Tool */) {
        throw new Error(`[AgentService] createChat: cannot fork provider-spawned chat ${sourceChatKey}`);
      }
      const sourceTurns = sourceState?.turns ?? [];
      const forkTurnId = createOptions.fork.turnId;
      const forkIndex = sourceTurns.findIndex((t) => t.id === forkTurnId);
      if (forkIndex < 0) {
        createOptions = { ...createOptions, fork: void 0 };
      } else {
        const slice = sourceTurns.slice(0, forkIndex + 1);
        const turnIdMapping = /* @__PURE__ */ new Map();
        for (const t of slice) {
          turnIdMapping.set(t.id, generateUuid());
        }
        forkedTurns = slice.map((t) => ({ ...t, id: turnIdMapping.get(t.id) ?? generateUuid() }));
        peerChatOrigin = { kind: "fork" /* Fork */, chat: sourceChatKey, turnId: createOptions.fork.turnId };
        this._persistForkedLocalTurns(sessionKey, sourceChatKey, chat.toString(), slice, forkedTurns, turnIdMapping);
        const forkedTitlePrefix = localize(2290, null);
        forkedSourceTitle = sourceState?.title || this._stateManager.getSessionState(sourceSessionKey)?.title;
        forkedTitle = forkedSourceTitle ? forkedSourceTitle.startsWith(forkedTitlePrefix) ? forkedSourceTitle : `${forkedTitlePrefix}${forkedSourceTitle}` : localize(2289, null);
        const concreteForkTurnId = this._localTurns.resolveConcreteTurnId(sourceChatKey, createOptions.fork.turnId);
        createOptions = {
          ...createOptions,
          fork: {
            ...createOptions.fork,
            source: URI.parse(sourceChatKey),
            turnIdMapping,
            ...concreteForkTurnId !== void 0 ? { turnId: concreteForkTurnId } : {}
          }
        };
      }
    }
    const createResult = await this._createChat(provider, chat, session, createOptions);
    const providerData = createResult?.providerData;
    try {
      await this._persistPeerChat(session, chat, providerData, peerChatOrigin, createResult?.inheritedTurnId);
    } catch (error) {
      try {
        await provider.chats.disposeChat(chat, this._chatContext(session, chat));
      } catch (rollbackError) {
        throw new AggregateError([error, rollbackError], `Failed to persist and roll back chat ${chat.toString()}`);
      }
      throw error;
    }
    this._stateManager.addChat(sessionKey, chat.toString(), {
      ...forkedTitle !== void 0 ? { title: forkedTitle } : options?.title !== void 0 ? { title: options.title } : {},
      ...forkedTurns !== void 0 ? { turns: forkedTurns } : {},
      ...providerData !== void 0 ? { providerData } : {},
      ...peerChatOrigin !== void 0 ? { origin: peerChatOrigin } : {},
      ...createResult?.inheritedTurnId !== void 0 ? { inheritedTurnId: createResult.inheritedTurnId } : {}
    });
    this._sessionResidency.touch(session);
    void this._sessionResidency.reconcile();
    if (createResult?.backingSession) {
      await this._markChatBacking(createResult.backingSession, chat);
    }
    if (forkedTurns && forkedTurns.length > 0 && forkedTitle !== void 0) {
      this._sideEffects.generateForkedTitle(sessionKey, chat.toString(), forkedTurns, forkedTitle, forkedSourceTitle);
    }
  }
  /**
   * Validates a side chat's source and returns its {@link ChatOriginKind.SideChat}
   * origin. Throws when the source chat is not part of `session` or when the
   * referenced completed or active turn is absent.
   */
  async _resolveSideChatOrigin(session, sideChat) {
    const sessionKey = session.toString();
    const sourceKey = sideChat.source.toString();
    const { sourceChatKey, sourceSessionKey, sourceState } = await this._resolveSessionSourceChat(sideChat.source);
    if (sourceSessionKey !== sessionKey) {
      throw new Error(`[AgentService] createChat: side chat source ${sourceKey} does not belong to session ${sessionKey}`);
    }
    const activeTurn = sourceState?.activeTurn?.id === sideChat.turnId ? sourceState.activeTurn : void 0;
    const hasCompletedTurn = sourceState?.turns.some((t) => t.id === sideChat.turnId) ?? false;
    if (!hasCompletedTurn && !activeTurn) {
      throw new Error(`[AgentService] createChat: side chat source turn ${sideChat.turnId} not found in ${sourceKey}`);
    }
    let anchorTurnId;
    if (activeTurn) {
      anchorTurnId = resolveLastNonLocalTurnId(sourceState?.turns ?? [], (turnId) => this._localTurns.isLocal(sourceChatKey, turnId));
    } else if (this._localTurns.isLocal(sourceChatKey, sideChat.turnId)) {
      anchorTurnId = this._localTurns.resolveConcreteTurnId(sourceChatKey, sideChat.turnId);
    }
    const selection = sideChat.selection?.text.trim() ? sideChat.selection : sideChat.selection ? (() => {
      throw new Error("[AgentService] createChat: side chat selection text must be non-empty");
    })() : void 0;
    return {
      origin: {
        kind: "sideChat" /* SideChat */,
        chat: sourceChatKey,
        turnId: sideChat.turnId,
        ...selection ? { selection } : {}
      },
      sourceChat: sourceChatKey,
      shouldFork: !activeTurn || anchorTurnId !== void 0,
      ...selection ? { selection } : {},
      ...anchorTurnId ? { anchorTurnId } : {}
    };
  }
  async _resolveSessionSourceChat(source) {
    const sourceKey = source.toString();
    const sourceSessionKey = isAhpChatChannel(sourceKey) ? parseRequiredSessionUriFromChatUri(sourceKey) : sourceKey;
    const defaultChatKey = this._stateManager.getSessionState(sourceSessionKey)?.defaultChat ?? buildDefaultChatUri(sourceSessionKey);
    const isDefaultSource = sourceKey === sourceSessionKey || isDefaultChatUri(sourceKey);
    const sourceChatKey = isDefaultSource ? defaultChatKey : sourceKey;
    return {
      sourceSessionKey,
      sourceChatKey,
      sourceState: isDefaultSource ? this._stateManager.getChatState(defaultChatKey) ?? this._stateManager.getDefaultChatState(sourceSessionKey) : await this._stateManager.resolveChatState(sourceChatKey)
    };
  }
  async disposeChat(session, chat) {
    const sessionKey = session.toString();
    const chatKey = chat.toString();
    const provider = this._providerService.getProviderForSession(session);
    this._disposingPeerChats.add(chatKey);
    try {
      await this._checkpointService.discardChatTurnStartCheckpoints(session, chat);
      if (provider) {
        await this._disposeChat(provider, chat);
      }
      await this._removePersistedPeerChat(session, chat);
      this._sideEffects.cancelSubagentSessions(chatKey);
      this._sideEffects.clearChannelTelemetry(chatKey);
      this._chatContributions.disposeChatState(chatKey);
      this._stateManager.removeChat(sessionKey, chatKey);
    } finally {
      this._disposingPeerChats.delete(chatKey);
    }
  }
  // ---- Chat dispatch adapter ---------------------------------------------
  //
  // The orchestrator owns the feature-level `(session, chat)` →
  // `(agent, session, chat)` mapping. It dispatches against an agent's
  // chat-addressed surface ({@link IAgent.chats}) and session lifecycle
  // ({@link IAgent.createSession}/{@link IAgent.disposeSession}).
  /** Whether `provider` can host additional (peer) chats. */
  _supportsChats(provider) {
    return !!provider.getDescriptor().capabilities?.multipleChats;
  }
  _chatContext(session, chat) {
    return createAgentChatContext(this._stateManager, session, chat);
  }
  /**
   * Last host-published customization snapshot for the session, passed
   * explicitly to providers. `undefined` means "no snapshot yet", not "an
   * empty customization list".
   */
  _hostCustomizations(session) {
    return this._stateManager.getSessionState(session.toString())?.customizations;
  }
  /** Mints the session URI before the collapsed `createChat` path derives its default-chat URI. */
  _mintSessionUri(provider) {
    return AgentSession.uri(provider.id, generateUuid());
  }
  async _createProviderSession(provider, config, deferWorktreeCreation) {
    const requestedSessionId = deferWorktreeCreation && config?.session ? AgentSession.id(config.session) : void 0;
    if (requestedSessionId) {
      this._worktree.notePending(requestedSessionId);
    }
    let created;
    try {
      const providerConfig = config ? this._toProviderConfig(config) : void 0;
      const session = config?.session ?? this._mintSessionUri(provider);
      const defaultChatUri = URI.parse(buildDefaultChatUri(session));
      const boundConfig = { ...providerConfig ?? {}, session };
      const result = await provider.chats.createChat(defaultChatUri, this._chatContext(session, defaultChatUri), this._toCreateChatOptions(boundConfig));
      created = {
        session,
        ...result?.project ? { project: result.project } : {},
        ...result?.resolvedWorkingDirectory ? { resolvedWorkingDirectory: result.resolvedWorkingDirectory } : {},
        ...result?.provisional ? { provisional: true } : {},
        ...result ? { chat: result } : {}
      };
      if (deferWorktreeCreation && created.provisional) {
        this._worktree.notePending(AgentSession.id(created.session));
      }
      await this._persistDefaultChatBacking(created);
      return created;
    } catch (err) {
      if (created) {
        await this._rollbackProviderSession(provider, created.session);
      }
      throw err;
    } finally {
      const returnedPendingSessionId = created?.provisional ? AgentSession.id(created.session) : void 0;
      if (requestedSessionId && requestedSessionId !== returnedPendingSessionId) {
        this._worktree.clearPending(requestedSessionId);
      }
    }
  }
  /**
   * Best-effort rollback for a partially-created provider session. Creation
   * only provisions the default chat, so rollback disposes that one chat and
   * the caller rethrows the original error.
   */
  async _rollbackProviderSession(provider, session) {
    const defaultChatUri = URI.parse(buildDefaultChatUri(session));
    try {
      await provider.chats.disposeChat(defaultChatUri, this._chatContext(session, defaultChatUri));
    } catch (disposeError) {
      this._logService.error(disposeError, `[AgentService] Failed to roll back default chat of provider session ${session.toString()}`);
    }
  }
  _getSessionChatsInTeardownOrder(session) {
    const state = this._stateManager.getSessionState(session.toString());
    return this._orderSessionChatsForTeardown(session, state?.chats.map((chat) => chat.resource) ?? []);
  }
  async _getSessionChatsForDisposal(provider, session) {
    const state = this._stateManager.getSessionState(session.toString());
    if (state) {
      return this._getSessionChatsInTeardownOrder(session);
    }
    const persisted = await this._readPersistedPeerChatCatalog(session);
    const peerChats = persisted?.map((chat) => chat.uri) ?? (await provider.listLegacyChatBackings?.(session))?.map((chat) => chat.uri.toString()) ?? [];
    return this._orderSessionChatsForTeardown(session, peerChats);
  }
  _orderSessionChatsForTeardown(session, chats) {
    const defaultChat = buildDefaultChatUri(session.toString());
    const result = [];
    const seen = /* @__PURE__ */ new Set();
    for (const chat of chats) {
      if (chat !== defaultChat && !seen.has(chat)) {
        seen.add(chat);
        result.push(URI.parse(chat));
      }
    }
    if (!seen.has(defaultChat)) {
      result.push(URI.parse(defaultChat));
    }
    return result;
  }
  /**
   * Destructively tears a session down: dispose peer chats first and the
   * default chat last, and still visit every chat if one rejects.
   */
  async _disposeSession(provider, session) {
    await this._defaultChatBackingWrites.get(session.toString())?.catch(() => {
    });
    let firstError;
    for (const chat of await this._getSessionChatsForDisposal(provider, session)) {
      try {
        await provider.chats.disposeChat(chat, this._chatContext(session, chat));
      } catch (err) {
        firstError ??= err;
      }
    }
    if (firstError !== void 0) {
      throw firstError;
    }
  }
  /**
   * Releases a session's in-memory footprint without deleting durable data.
   * Idle eviction must use {@link IAgentChats.releaseChat}, not destructive
   * session finalization, so the session remains resumable.
   */
  async _canReleaseSession(provider, session, chats) {
    for (const chat of chats) {
      if (provider.chats.canReleaseChat && !await provider.chats.canReleaseChat(chat, this._chatContext(session, chat))) {
        return false;
      }
    }
    return true;
  }
  async _releaseSession(provider, session, chats) {
    await this._defaultChatBackingWrites.get(session.toString())?.catch(() => {
    });
    let firstError;
    for (const chat of chats) {
      try {
        await provider.chats.releaseChat(chat, this._chatContext(session, chat));
      } catch (err) {
        firstError ??= err;
      }
    }
    if (firstError !== void 0) {
      throw firstError;
    }
  }
  /**
   * Reconstruct the turns for a chat. `chat` is the concrete chat channel URI,
   * except for legacy restore paths that still address subagent sessions.
   *
   * `origin` is only supplied by restore paths that reconstruct a chat's turns
   * *before* the chat is registered in the catalog, so the host-owned context
   * cannot supply it yet. It takes precedence over the catalog value for
   * exactly that window; every other caller relies on the exhaustive origin
   * {@link _chatContext} stamps.
   */
  async _getChatMessages(provider, chat, session, origin) {
    const context = { ...this._chatContext(session, chat), ...origin ? { origin } : {} };
    this._logService.trace(`[AgentService] getChatMessages start: chat=${chat.toString()}`);
    const providerTurns = await provider.chats.getMessages(chat, context);
    this._logService.trace(`[AgentService] getChatMessages: provider returned ${providerTurns.length} turn(s) for chat=${chat.toString()}`);
    return this._chatContributions.hydrateTurns({ session: session.toString(), chat: chat.toString() }, providerTurns);
  }
  /**
   * Merges persisted host-injected local turns (`/rename`, `!command`) for
   * `chatUri` back into that chat's SDK-derived `turns`, positioned after
   * their anchor turn (the concrete turn they were recorded after). Locals
   * anchored before any real turn are prepended; locals whose anchor is absent
   * from the SDK turns (e.g. truncated away) are dropped. Also seeds the
   * in-memory local-turn index so fork/truncate resolve correctly before the
   * next reload.
   */
  async _interleaveLocalTurns(sessionStr, chatUri, turns) {
    const records = await this._localTurns.loadForChat(sessionStr, chatUri);
    if (records.length === 0) {
      return [...turns];
    }
    const knownIds = new Set(turns.map((t) => t.id));
    const byAnchor = /* @__PURE__ */ new Map();
    const head = [];
    for (const record of records) {
      let turn;
      try {
        turn = JSON.parse(record.payload);
      } catch {
        continue;
      }
      if (record.anchorTurnId === void 0) {
        head.push(turn);
      } else if (knownIds.has(record.anchorTurnId)) {
        const list = byAnchor.get(record.anchorTurnId) ?? [];
        list.push(turn);
        byAnchor.set(record.anchorTurnId, list);
      }
    }
    const merged = [...head];
    for (const turn of turns) {
      merged.push(turn);
      const locals = byAnchor.get(turn.id);
      if (locals) {
        merged.push(...locals);
      }
    }
    return merged;
  }
  /**
   * Re-persists forked host-injected local turns (`/rename`, `!command`) into
   * a newly forked chat so they survive reload and anchor future
   * fork/truncate. `originalSlice[i]` and `forkedTurns[i]` are the source turn
   * and its remapped copy (same length, 1:1); `mapping` is the old→new turn id
   * map used to remap each local turn's anchor. `persistSession` owns the
   * destination database; `sourceChatUri` / `newChatUri` key the source and
   * destination local-turn indexes.
   *
   * Shared by the {@link createSession} (default-chat) and {@link createChat}
   * (peer-chat) fork paths.
   */
  _persistForkedLocalTurns(persistSession, sourceChatUri, newChatUri, originalSlice, forkedTurns, mapping) {
    for (let i = 0; i < originalSlice.length; i++) {
      const original = originalSlice[i];
      if (!this._localTurns.isLocal(sourceChatUri, original.id)) {
        continue;
      }
      const originalAnchor = this._localTurns.resolveConcreteTurnId(sourceChatUri, original.id);
      const newAnchor = originalAnchor !== void 0 ? mapping.get(originalAnchor) : void 0;
      this._localTurns.record(persistSession, newChatUri, forkedTurns[i], newAnchor);
    }
  }
  /**
   * Create (or fork) the peer chat `chat` within `session`. `chat` is
   * always a peer URI here (the default chat is created implicitly with
   * the session), so no default-chat resolution is needed.
   */
  async _createChat(provider, chat, session, options) {
    const placement = this._buildChatPlacement(session);
    const convOptions = options?.title !== void 0 || options?.model !== void 0 || placement ? {
      ...options?.title !== void 0 ? { title: options.title } : {},
      ...options?.model !== void 0 ? { model: options.model } : {},
      ...placement?.workingDirectories ? { workingDirectories: placement.workingDirectories } : {},
      ...placement?.project ? { project: placement.project } : {},
      ...placement?.config ? { config: placement.config } : {}
    } : void 0;
    const context = this._chatContext(session, chat);
    const result = await provider.chats.createChat(chat, context, options?.fork ? { ...convOptions, fork: options.fork } : convOptions);
    return result;
  }
  _toCreateChatOptions(config) {
    return {
      ...config.session && this._stateManager.isEphemeralSession(config.session.toString()) ? { isEphemeral: true } : {},
      ...readChatSurfaceMeta(config)?.surface === "editorInline" ? { hasScopedEditSurface: true } : {},
      ...config.model ? { model: config.model } : {},
      ...config.agent ? { agent: config.agent } : {},
      ...config.workingDirectories ? { workingDirectories: config.workingDirectories } : {},
      ...config.config ? { config: config.config } : {},
      ...config.activeClient ? { activeClient: config.activeClient } : {},
      ...!config.importConversation ? { deferBacking: true } : {},
      ...config.importConversation ? { importConversation: config.importConversation } : {}
    };
  }
  /** Resolves the owning session context for creating an additional chat. */
  _buildChatPlacement(session) {
    const state = this._stateManager.getSessionState(session.toString());
    const workingDirectories = state?.workingDirectories?.map((directory) => typeof directory === "string" ? URI.parse(directory) : directory) ?? [];
    const resolvedPrimary = this._worktree.getResolvedWorktree(AgentSession.id(session));
    if (resolvedPrimary) {
      workingDirectories[0] = resolvedPrimary;
    }
    if (workingDirectories.length === 0) {
      return void 0;
    }
    const config = this._configurationService.getSessionConfigValues(session.toString());
    return {
      workingDirectories,
      ...state?.project ? { project: { uri: URI.parse(state.project.uri), displayName: state.project.displayName } } : {},
      ...config && Object.keys(config).length > 0 ? { config } : {}
    };
  }
  async _disposeChat(provider, chat) {
    const session = URI.parse(parseRequiredSessionUriFromChatUri(chat));
    await provider.chats.disposeChat(chat, this._chatContext(session, chat));
  }
  /**
   * Derives a placeholder title for an imported session from its first user
   * turn (imports seed pre-existing turns, so the normal first-message title
   * generation never fires). Deliberately unprefixed: an imported session is a
   * continuation of the source chat, not a distinct kind of session, so it
   * should read like any other. The placeholder is later refined into a
   * generated title (see the `importConversation` branch in `createSession`),
   * but a neutral non-empty fallback is kept so the session still reads like a
   * normal chat when generation is unavailable or fails.
   */
  _buildImportedTitle(turns) {
    const firstText = turns.find((t) => t.message?.text?.trim())?.message.text.trim();
    if (!firstText) {
      return localize(2291, null);
    }
    const MAX = 60;
    return firstText.length > MAX ? `${firstText.slice(0, MAX)}...` : firstText;
  }
  _buildInitialSummary(provider, session, config, created, title) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const explicitGitHubState = readSessionGitHubState(config?._meta);
    const explicitMultiRoot = readSessionMultiRootMetadata(config?._meta);
    let _meta = withSessionGitHubState(void 0, explicitGitHubState);
    _meta = withSessionMultiRootMetadata(_meta, explicitMultiRoot);
    _meta = withEphemeralSessionMeta(_meta, config ? readEphemeralSessionMeta(config).isEphemeral : void 0);
    _meta = withChatSurfaceMeta(_meta, readChatSurfaceMeta(config ?? {}));
    _meta = withSessionExternal(_meta, false);
    const creationReference = readSessionCreationReference(config?._meta);
    _meta = creationReference ? withSessionCreationReference(_meta, creationReference) : _meta;
    _meta = !config?.workingDirectories ? withSessionWorkspaceless(_meta, true) : _meta;
    return {
      resource: session.toString(),
      provider: provider.id,
      title,
      status: 1 /* Idle */,
      createdAt: now,
      modifiedAt: now,
      ...created.project ? { project: { uri: created.project.uri.toString(), displayName: created.project.displayName } } : {},
      // The provider resolved only its process root (index 0), which may
      // differ from the requested primary (e.g. a workspace-less scratch dir).
      // Assemble the session set by overriding the requested primary with it
      // and keeping the requested tail; the fully-resolved multi-root set
      // arrives later via the materialization receipt.
      workingDirectories: reconcileWorkingDirectories(config?.workingDirectories, created.resolvedWorkingDirectory ? [created.resolvedWorkingDirectory] : void 0),
      // Workspace-less is inferred at create from an absent input
      // `workingDirectories` (the host assigns a scratch cwd, so it can't be
      // re-inferred later) and tagged on the generic `_meta` bag. Use
      // `=== undefined` so an explicit empty set (`[]`) is NOT treated as
      // workspace-less.
      ..._meta ? { _meta } : {}
    };
  }
  /**
   * Listen for an agent transitioning a provisional session into a fully
   * materialized SDK session. The agent has already created the worktree
   * (if any) and persisted on-disk metadata; we need to:
   * - Refresh the in-memory summary with the resolved working directory
   *   and project metadata.
   * - Persist any config values now that we have a real on-disk session.
   * - Emit the deferred `notify/sessionAdded` so other clients learn of
   *   the session.
   * - Dispatch `SessionReady` so subscribers see the lifecycle transition.
   * - Lazily attach git state for the (possibly new) working directory.
   */
  _onDidMaterializeChat(e) {
    const session = URI.parse(parseRequiredSessionUriFromChatUri(e.chat));
    const sessionKey = session.toString();
    this._clearDownloadProgressInterest(sessionKey);
    const state = this._stateManager.getSessionState(sessionKey);
    if (!state) {
      this._logService.warn(`[AgentService] onDidMaterializeChat for unknown session: ${sessionKey}`);
      return;
    }
    const currentSummary = this._stateManager.getSessionSummary(sessionKey);
    if (!currentSummary) {
      this._logService.warn(`[AgentService] onDidMaterializeChat missing summary for session: ${sessionKey}`);
      return;
    }
    if (e.chat.toString() !== state.defaultChat) {
      if (!state.chats.some((chat) => chat.resource.toString() === e.chat.toString())) {
        return;
      }
      if (e.result?.providerData !== void 0) {
        this._onChatDataChanged({ chat: e.chat, providerData: e.result.providerData });
      }
      if (e.result?.backingSession) {
        void this._markChatBacking(e.result.backingSession, e.chat);
      }
      return;
    }
    if (e.result) {
      const write2 = this._persistDefaultChatBacking({ session, chat: e.result });
      this._defaultChatBackingWrites.set(sessionKey, write2);
      void write2.catch((err) => this._logService.error(err, `[AgentService] Failed to persist materialized default-chat backing for ${sessionKey}`));
      const clearWrite = () => {
        if (this._defaultChatBackingWrites.get(sessionKey) === write2) {
          this._defaultChatBackingWrites.delete(sessionKey);
        }
      };
      void write2.then(clearWrite, clearWrite);
    }
    const project = this._worktree.sessionWorktreeProject(AgentSession.id(session)) ?? e.project;
    const currentSet = currentSummary.workingDirectories?.map((d) => URI.parse(d));
    const summary = {
      ...currentSummary,
      ...project ? { project: { uri: project.uri.toString(), displayName: project.displayName } } : {},
      // The materialize receipt is authoritative for the roots it reports
      // (index 0 = the resolved process root, e.g. a worktree). A send-path
      // receipt carries the full resolved set; a resume-path receipt reports
      // only the process root, so the rest of the current set is preserved.
      workingDirectories: reconcileWorkingDirectories(currentSet, e.workingDirectories),
      modifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const configValues = state.config?.values;
    if (configValues && Object.keys(configValues).length > 0) {
      this._persistConfigValues(session, configValues);
    }
    this._persistWorkspaceless(session, readSessionWorkspaceless(summary._meta));
    this._persistMultiRoot(session, readSessionMultiRootMetadata(summary._meta));
    this._persistFolderPickerDecision(session, readSessionFolderPickerDecision(summary._meta));
    this._stateManager.markSessionPersisted(sessionKey, summary);
    this._stateManager.dispatchServerAction(sessionKey, { type: "session/ready" /* SessionReady */ });
    const gitHubState = readSessionGitHubState(summary._meta);
    if (gitHubState) {
      void this._gitStateService.setSessionGitHubState(sessionKey, gitHubState);
    }
    void this._gitStateService.refreshSessionGitState(sessionKey, e.workingDirectories?.[0]);
    this._changesetCoordinator.onSessionMaterialized(sessionKey);
  }
  /** Drop a session's download-progress opt-in, if any. */
  _clearDownloadProgressInterest(sessionKey) {
    for (const [provider, sessions] of this._downloadProgressInterest) {
      if (sessions.delete(sessionKey) && sessions.size === 0) {
        this._downloadProgressInterest.delete(provider);
      }
    }
  }
  /**
   * Surface a host-level SDK download as client progress. The downloader fires
   * process-global frames keyed by package id (which equals the provider id);
   * because the download is shared across every session of that provider, we
   * emit a SINGLE `progress` stream keyed by that package id — not one per
   * session — so the client shows exactly one indicator no matter how many
   * sessions of the provider are awaiting it. Frames are emitted while at least
   * one session has opted in (supplied a
   * {@link IAgentCreateSessionConfig.progressToken} on `createSession`) or a
   * user-initiated flow has explicitly requested progress. A
   * terminal frame reports `total === progress` (using `receivedBytes` when the
   * size was never known) so the client dismisses the indicator deterministically.
   *
   * `displayName` is the provider's brand noun (e.g. `Claude`). It is woven
   * into the notification's localized, human-readable `message` (e.g.
   * "Downloading Claude agent") so a generic client can render the indicator
   * verbatim without knowing the resource is an agent SDK. No trailing
   * ellipsis: clients render progress as "<title>: <percent>", so an ellipsis
   * would read as an unusual "…:" (see #324455).
   */
  emitDownloadProgress(packageId, displayName, receivedBytes, totalBytes, terminal, explicitlyRequested = false) {
    const sessions = this._downloadProgressInterest.get(packageId);
    if ((!sessions || sessions.size === 0) && !explicitlyRequested) {
      return;
    }
    const total = terminal ? receivedBytes : totalBytes;
    const message = localize(2288, null, displayName);
    this._stateManager.emitProgress({ progressToken: packageId, progress: receivedBytes, total, message });
    if (terminal) {
      this._downloadProgressInterest.delete(packageId);
    }
  }
  _persistWorkspaceless(session, workspaceless) {
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(session);
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to open session database to persist workspaceless for ${session.toString()}: ${toErrorMessage(err)}`);
      return;
    }
    ref.object.setMetadata(AH_META_WORKSPACELESS_DB_KEY, workspaceless ? "true" : "false").catch((err) => {
      this._logService.warn(`[AgentService] Failed to persist workspaceless for ${session.toString()}: ${toErrorMessage(err)}`);
    }).finally(() => {
      ref.dispose();
    });
  }
  _persistMultiRoot(session, multiRoot) {
    if (!multiRoot) {
      return;
    }
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(session);
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to open session database to persist multi-root metadata for ${session.toString()}: ${toErrorMessage(err)}`);
      return;
    }
    ref.object.setMetadata(SESSION_META_MULTI_ROOT_KEY, JSON.stringify(multiRoot)).catch((err) => {
      this._logService.warn(`[AgentService] Failed to persist multi-root metadata for ${session.toString()}: ${toErrorMessage(err)}`);
    }).finally(() => {
      ref.dispose();
    });
  }
  /**
   * Persists the harness-owned Folder-picker decision so it survives reload as
   * a frozen creation-time fact: a session created with the picker hidden stays
   * hidden on reopen, and one created with it shown stays shown. Deferred to
   * {@link _onDidMaterializeChat} for provisional sessions (no DB yet at
   * create), mirroring {@link _persistMultiRoot}.
   */
  _persistFolderPickerDecision(session, decision) {
    if (!decision) {
      return;
    }
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(session);
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to open session database to persist folder-picker decision for ${session.toString()}: ${toErrorMessage(err)}`);
      return;
    }
    ref.object.setMetadata(SESSION_META_FOLDER_PICKER_KEY, JSON.stringify(decision)).catch((err) => {
      this._logService.warn(`[AgentService] Failed to persist folder-picker decision for ${session.toString()}: ${toErrorMessage(err)}`);
    }).finally(() => {
      ref.dispose();
    });
  }
  _persistConfigValues(session, values) {
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(session);
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to open session database to persist configValues for ${session.toString()}: ${toErrorMessage(err)}`);
      return;
    }
    ref.object.setMetadata("configValues", JSON.stringify(values)).catch((err) => {
      this._logService.warn(`[AgentService] Failed to persist configValues for ${session.toString()}: ${toErrorMessage(err)}`);
    }).finally(() => {
      ref.dispose();
    });
  }
  _persistAnnotations(envelope) {
    if (!isAnnotationsAction(envelope.action)) {
      return;
    }
    const parsed = parseAnnotationsUri(envelope.channel);
    const state = this._stateManager.getAnnotationsState(envelope.channel);
    if (!parsed || !state) {
      return;
    }
    const session = URI.parse(parsed.sessionUri);
    const storage = this._annotationsStorage(session);
    try {
      const serialized = JSON.stringify(state);
      const ref = this._sessionDataService.openDatabase(storage.session);
      ref.object.setMetadata(storage.key, serialized).catch((err) => {
        this._logService.warn(`[AgentService] Failed to persist annotations for ${parsed.sessionUri}: ${toErrorMessage(err)}`);
      }).finally(() => {
        ref.dispose();
      });
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to persist annotations for ${parsed.sessionUri}: ${toErrorMessage(err)}`);
    }
  }
  _annotationsStorage(session) {
    const subagent = parseSubagentSessionUri(session);
    return subagent ? { session: subagent.parentSession, key: `${ANNOTATIONS_METADATA_KEY}:${session.toString()}` } : { session, key: ANNOTATIONS_METADATA_KEY };
  }
  async _resolveCreatedSessionConfig(provider, config) {
    if (!config?.config && config?.workingDirectories === void 0) {
      return void 0;
    }
    const params = {
      provider: provider.id,
      // `resolveSessionConfig` is a pre-session, single-context API:
      // resolve against the session's primary (index 0).
      workingDirectory: config.workingDirectories?.[0],
      config: config.config
    };
    try {
      const resolved = await this._withHostSessionConfigContributions(await provider.resolveChatConfig(this._toProviderConfig(params)), params);
      return { schema: resolved.schema, values: resolved.values };
    } catch (err) {
      this._logService.error(`[AgentService] Failed to resolve created session config for provider ${provider.id}`, err);
      return config.config ? { schema: { type: "object", properties: {} }, values: config.config } : void 0;
    }
  }
  async resolveSessionConfig(params) {
    const provider = this._providerService.resolveProvider(params.provider);
    if (!provider) {
      throw new Error(`No agent provider registered for: ${params.provider ?? "(none)"}`);
    }
    return this._withHostSessionConfigContributions(await provider.resolveChatConfig(this._toProviderConfig(params)), params);
  }
  /**
   * Applies host-owned session configuration contributions after the provider
   * resolves its configuration.
   */
  async _withHostSessionConfigContributions(result, params) {
    result = await this._withWorktreeConfigContribution(result, params);
    result = this._withAgentMergeConfigContribution(result, params.config);
    return result;
  }
  async _withWorktreeConfigContribution(result, params) {
    const iso = await this._worktree.resolveIsolationConfig({ workingDirectory: params.workingDirectory, config: params.config });
    if (!iso) {
      return result;
    }
    const properties = {
      ["isolation" /* Isolation */]: iso.isolationProperty.protocol,
      ...omitHostOwnedSessionConfig(result.schema.properties)
    };
    if (iso.branchProperty) {
      properties["branch" /* Branch */] = iso.branchProperty.protocol;
    }
    if (iso.worktreeBranchPrefixProperty) {
      properties["worktreeBranchPrefix" /* WorktreeBranchPrefix */] = iso.worktreeBranchPrefixProperty.protocol;
    }
    if (iso.worktreeBranchTrackProperty) {
      properties["worktreeBranchTrack" /* WorktreeBranchTrack */] = iso.worktreeBranchTrackProperty.protocol;
    }
    if (iso.worktreeCreateNewBranchProperty) {
      properties["worktreeCreateNewBranch" /* WorktreeCreateNewBranch */] = iso.worktreeCreateNewBranchProperty.protocol;
    }
    if (iso.worktreeIncludeFilesProperty) {
      properties["worktreeIncludeFiles" /* WorktreeIncludeFiles */] = iso.worktreeIncludeFilesProperty.protocol;
    }
    const values = omitHostOwnedSessionConfig(result.values);
    values["isolation" /* Isolation */] = iso.isolationValue;
    if (iso.branchProperty && iso.branchValue !== void 0) {
      values["branch" /* Branch */] = iso.branchValue;
    }
    if (iso.worktreeBranchPrefixProperty && typeof params.config?.["worktreeBranchPrefix" /* WorktreeBranchPrefix */] === "string") {
      values["worktreeBranchPrefix" /* WorktreeBranchPrefix */] = params.config["worktreeBranchPrefix" /* WorktreeBranchPrefix */];
    }
    if (iso.worktreeBranchTrackProperty && typeof params.config?.["worktreeBranchTrack" /* WorktreeBranchTrack */] === "boolean") {
      values["worktreeBranchTrack" /* WorktreeBranchTrack */] = params.config["worktreeBranchTrack" /* WorktreeBranchTrack */];
    }
    if (iso.worktreeCreateNewBranchProperty && typeof params.config?.["worktreeCreateNewBranch" /* WorktreeCreateNewBranch */] === "boolean") {
      values["worktreeCreateNewBranch" /* WorktreeCreateNewBranch */] = params.config["worktreeCreateNewBranch" /* WorktreeCreateNewBranch */];
    }
    if (iso.worktreeIncludeFilesProperty && Array.isArray(params.config?.["worktreeIncludeFiles" /* WorktreeIncludeFiles */]) && params.config["worktreeIncludeFiles" /* WorktreeIncludeFiles */].every((pattern) => typeof pattern === "string")) {
      values["worktreeIncludeFiles" /* WorktreeIncludeFiles */] = params.config["worktreeIncludeFiles" /* WorktreeIncludeFiles */];
    }
    return { schema: { ...result.schema, properties }, values };
  }
  _withAgentMergeConfigContribution(result, config) {
    const values = { ...result.values };
    for (const key of ["agentMerge" /* AgentMerge */, "agentMerge.controller" /* AgentMergeController */]) {
      if (config && Object.hasOwn(config, key)) {
        values[key] = config[key];
      }
    }
    return { ...result, values };
  }
  async sessionConfigCompletions(params) {
    if (params.property === "branch" /* Branch */ && this._worktree.supported) {
      return this._worktree.branchCompletions(params.workingDirectory, params.query);
    }
    const provider = this._providerService.resolveProvider(params.provider);
    if (!provider) {
      throw new Error(`No agent provider registered for: ${params.provider ?? "(none)"}`);
    }
    return provider.chatConfigCompletions(this._toProviderConfig(params));
  }
  async completions(params) {
    return this._completions.completions(params);
  }
  get automationCapabilities() {
    return this._automationService.capabilities;
  }
  async listAutomationTriggerDefinitions(params) {
    return this._automationService.listTriggerDefinitions(params);
  }
  async runAutomation(params) {
    return this._automationService.runAutomation(params);
  }
  async fetchAutomationRuns(params) {
    return this._automationService.fetchAutomationRuns(params);
  }
  async getCompletionTriggerCharacters() {
    return this._completions.triggerCharacters;
  }
  async disposeSession(session) {
    this._logService.trace(`[AgentService] disposeSession: ${session.toString()}`);
    await this._sessionResidency.runDisposal(session, () => this._doDisposeSession(session));
  }
  async _doDisposeSession(session) {
    const sessionKey = session.toString();
    this._cancelPendingSessionGc(session);
    const isEphemeral = this._stateManager.isEphemeralSession(sessionKey);
    const isIdleProvisional = this._stateManager.isIdleProvisionalSession(sessionKey);
    this._stateManager.invalidateSessionChatResolutions(session.toString());
    const sessionChats = this._stateManager.getSessionState(session.toString())?.chats ?? [];
    for (const chat of sessionChats) {
      this._sideEffects.clearChannelTelemetry(chat.resource);
    }
    this._sideEffects.clearChannelTelemetry(session.toString());
    const workingDirectories = this._configurationService.getEffectiveWorkingDirectories(session.toString());
    const sessionId = AgentSession.id(session);
    const worktree = await this._worktree.prepareSessionDeletion(session, sessionId);
    const provider = this._providerService.getProviderForSession(session);
    if (provider) {
      await this._disposeSession(provider, session);
    }
    if (!isEphemeral) {
      await this._retryRegistryMutation(
        () => this._sessionRegistry.tombstone(session),
        `unregistration for ${session.toString()}`
      );
    }
    if (!isIdleProvisional) {
      this._invalidateSessionList();
    }
    if (provider) {
      this._providerService.releaseSession(session.toString());
      this._clearDownloadProgressInterest(session.toString());
    }
    this._sideEffects.clearSessionTitleState(session.toString(), sessionChats.map((chat) => chat.resource));
    this._chatContributions.disposeSessionState(session.toString());
    await this._whenSessionDataIdle(session);
    await this._sessionDataService.deleteSessionData(session, workingDirectories);
    await this._worktree.removeSessionWorktree(sessionId, worktree);
    this._changesetCoordinator.onSessionDisposed(session.toString());
    this._sideEffects.clearInputRequestsForSession(session.toString());
    this._sideEffects.removeSubagentSessions(session.toString());
    this._stateManager.deleteSession(session.toString());
    if (isEphemeral) {
      await this._retryRegistryMutation(
        () => this._sessionRegistry.clearTombstone(session),
        `clearing ephemeral session tombstone for ${session.toString()}`
      );
    }
  }
  async _whenSessionDataIdle(session) {
    const ref = this._sessionDataService.openDatabase(session);
    try {
      await ref.object.whenIdle();
    } finally {
      ref.dispose();
    }
  }
  // ---- Protocol methods ---------------------------------------------------
  async createTerminal(params) {
    await this._terminalManager.createTerminal(params);
  }
  async disposeTerminal(terminal) {
    this._terminalManager.disposeTerminal(terminal.toString());
  }
  async subscribe(resource, clientId, isActive) {
    this._logService.trace(`[AgentService] subscribe: ${resource.toString()}`);
    const resourceStr = resource.toString();
    const subscribe = async (telemetry) => {
      const restoreSession = (session) => this.restoreSession(session, (joinedRestore) => telemetry.restoreStarted(joinedRestore));
      await this._sessionResidency.waitForRelease(resource);
      if (this._store.isDisposed || isActive && !isActive()) {
        throw new Error(`Subscription cancelled: ${resourceStr}`);
      }
      this.addSubscriber(resource, clientId);
      const terminalState = this._terminalManager.getTerminalState(resourceStr);
      if (terminalState) {
        telemetry.setServedFromMemory(true);
        return { resource: resourceStr, state: terminalState, fromSeq: this._stateManager.serverSeq };
      }
      let snapshot = this._stateManager.getSnapshot(resourceStr);
      telemetry.setServedFromMemory(!!snapshot);
      const parsedChangeset = parseChangesetUri(resourceStr);
      if (snapshot && parsedChangeset && !this._stateManager.getSessionState(parsedChangeset.sessionUri)) {
        await this._changesetCoordinator.restoreSessionIfChangesetSubscription(resource, restoreSession);
        snapshot = this._stateManager.getSnapshot(resourceStr);
      }
      const parsedAnnotations = parseAnnotationsUri(resourceStr);
      if (snapshot && parsedAnnotations) {
        await this._ensureAnnotationsRestored(parsedAnnotations.sessionUri);
        snapshot = this._stateManager.getSnapshot(resourceStr);
      }
      if (!snapshot) {
        const parsedChatSession = parseDefaultChatUri(resourceStr);
        if (parsedChatSession !== void 0) {
          if (!this._stateManager.getSessionState(parsedChatSession)) {
            const parentUri = URI.parse(parsedChatSession);
            const parsedSubagentParent = parseSubagentSessionUri(parentUri);
            if (parsedSubagentParent) {
              await this._restoreSubagentSession(parsedChatSession, parsedSubagentParent.parentSession);
            } else {
              await restoreSession(parentUri);
            }
          }
          snapshot = this._stateManager.getSnapshot(resourceStr);
        }
      }
      if (!snapshot && isAhpChatChannel(resourceStr)) {
        await this._stateManager.resolveChatState(resourceStr);
        snapshot = this._stateManager.getSnapshot(resourceStr);
      }
      if (!snapshot) {
        if (isSubagentChatUri(resource)) {
          snapshot = await this._awaitPendingSubagentChat(resourceStr);
          if (!snapshot) {
            const parsed = parseChatUri(resource);
            if (parsed?.chatId.startsWith("subagent/")) {
              await this._restoreSubagentChat(resourceStr, URI.parse(parsed.session), parsed.chatId.slice("subagent/".length));
              snapshot = this._stateManager.getSnapshot(resourceStr);
            }
          }
        } else {
          const handled = await this._changesetCoordinator.tryHandleSubscribe(resource, restoreSession);
          if (handled) {
            snapshot = this._stateManager.getSnapshot(resourceStr);
          } else {
            const parsedSubagent = parseSubagentSessionUri(resource);
            if (parsedSubagent) {
              await this._restoreSubagentSession(resourceStr, parsedSubagent.parentSession);
            } else {
              await restoreSession(resource);
            }
            snapshot = this._stateManager.getSnapshot(resourceStr);
          }
        }
      }
      if (!snapshot) {
        throw new Error(`Cannot subscribe to unknown resource: ${resourceStr}`);
      }
      if (this._store.isDisposed || isActive && !isActive()) {
        throw new Error(`Subscription cancelled: ${resourceStr}`);
      }
      this._sessionResidency.touch(resource);
      void this._sessionResidency.reconcile();
      const sessionState = this._stateManager.getSessionState(resourceStr);
      if (!isAhpChatChannel(resourceStr) && sessionState && needsSessionGitStateRefresh(readSessionGitState(sessionState._meta))) {
        const workingDirectory = sessionState.workingDirectories?.[0] ? URI.parse(sessionState.workingDirectories[0]) : void 0;
        void this._gitStateService.refreshSessionGitState(resourceStr, workingDirectory);
      }
      this._logService.trace(`[AgentService] subscribe done: ${resourceStr} (servedFromMemory=${telemetry.servedFromMemory})`);
      telemetry.restoreCompleted();
      return snapshot;
    };
    try {
      return await this._sessionOpenTelemetry.withSubscription(resource, subscribe);
    } catch (error) {
      const subscriptionIsActive = isActive?.() ?? true;
      if (subscriptionIsActive) {
        this.unsubscribe(resource, clientId);
      }
      throw error;
    }
  }
  /** Waits for an armed subagent chat to register (or its wait to time out); returns `undefined` if not armed or never registered. */
  async _awaitPendingSubagentChat(subagentChatUri) {
    const pending = this._pendingSubagentChats.get(subagentChatUri);
    if (!pending) {
      return void 0;
    }
    await pending.p;
    return this._stateManager.getSnapshot(subagentChatUri);
  }
  addSubscriber(resource, clientId) {
    this._cancelPendingSessionGc(resource);
    this._cancelPendingEphemeralSessionGc(resource);
    if (this._subscriptions.addSubscriber(resource, clientId)) {
      this._changesetCoordinator.onFirstSubscriber(resource);
    }
    this._sessionResidency.touch(resource);
  }
  unsubscribe(resource, clientId) {
    if (this._store.isDisposed) {
      return;
    }
    if (!this._subscriptions.removeSubscriber(resource, clientId)) {
      return;
    }
    this._changesetCoordinator.onLastSubscriber(resource);
    this._stateManager.onChangesetLivenessChanged();
    if (this._maybeScheduleEphemeralSessionGc(resource)) {
      return;
    }
    if (this._maybeScheduleSessionGc(resource)) {
      return;
    }
    void this._sessionResidency.reconcile();
  }
  /**
   * Schedules full cleanup for a throwaway surface after all its session and
   * chat subscriptions are gone, regardless of whether it has completed turns.
   */
  _maybeScheduleEphemeralSessionGc(resource) {
    const session = resolveAgentHostSession(resource);
    const sessionKey = session.toString();
    if (!this._stateManager.isEphemeralSession(sessionKey)) {
      return false;
    }
    if (this._subscriptions.hasSessionSubscribers(session)) {
      return true;
    }
    this._pendingSessionGc.set(session, disposableTimeout(() => {
      this._pendingSessionGc.deleteAndDispose(session);
      void this._runEphemeralSessionGc(session).catch((err) => {
        this._logService.error(err, `[AgentService] GC failed for ephemeral session ${sessionKey}`);
      });
    }, SESSION_GC_GRACE_MS));
    return true;
  }
  /**
   * If `resource` names a session that no client is still subscribed to and
   * that has produced no turns (and has no active turn), schedule a delayed
   * {@link _runSessionGc} to fully tear it down — provider session, worktree,
   * persisted state and all. Sessions with at least one turn are left to the
   * residency path which only drops cached
   * state and lets the session be restored from disk later.
   *
   * GC is restricted to sessions that are still unused drafts. A session that
   * was restored from durable storage, or that has ever had a turn, is never
   * a candidate however empty it looks now — an empty state is also what a
   * failed history load and a truncate-to-zero leave behind.
   *
   * The delay ({@link SESSION_GC_GRACE_MS}) gives a disconnected client time
   * to reconnect or a workspace switch to settle. Any subsequent subscribe
   * (or createSession on the same URI) cancels the timer via
   * {@link _cancelPendingSessionGc}.
   *
   * Returns `true` if a GC timer was armed (existing or newly scheduled),
   * so callers can skip alternative cleanup paths.
   */
  _maybeScheduleSessionGc(resource) {
    const session = resolveAgentHostSession(resource);
    if (this._subscriptions.hasSessionSubscribers(session)) {
      return true;
    }
    const key = session.toString();
    const state = this._stateManager.getSessionState(key);
    if (!state) {
      return false;
    }
    if (state.turns.length > 0 || state.activeTurn !== void 0) {
      return false;
    }
    if (this._stateManager.isUnusedDraft(key) !== true) {
      this._logService.trace(`[AgentService] Skipping GC for session that is not an unused draft: ${key}`);
      return false;
    }
    if (this._agentMergeController.holdsSession(key)) {
      return false;
    }
    this._pendingSessionGc.set(session, disposableTimeout(() => {
      this._pendingSessionGc.deleteAndDispose(session);
      this._runSessionGc(session).catch((err) => {
        this._logService.error(err, `[AgentService] GC failed for ${key}`);
      });
    }, SESSION_GC_GRACE_MS));
    return true;
  }
  _cancelPendingSessionGc(resource) {
    this._pendingSessionGc.deleteAndDispose(resolveAgentHostSession(resource));
  }
  _cancelPendingEphemeralSessionGc(resource) {
    const session = resolveAgentHostSession(resource);
    if (this._stateManager.isEphemeralSession(session.toString())) {
      this._pendingSessionGc.deleteAndDispose(session);
    }
  }
  async _runEphemeralSessionGc(session) {
    if (this._subscriptions.hasSessionSubscribers(session)) {
      return;
    }
    this._logService.info(`[AgentService] GC: disposing unsubscribed ephemeral session ${session.toString()}`);
    await this.disposeSession(session);
  }
  /**
   * Fires {@link SESSION_GC_GRACE_MS} after a session lost its last
   * subscriber while empty. Re-checks the invariants (still no subscribers,
   * still empty, still an unused draft) before tearing the session down via
   * {@link disposeSession}. The cached state may already have been evicted by
   * residency reconciliation; in that case we still proceed because
   * "evicted + no resubscribe" implies no client is observing the session.
   */
  async _runSessionGc(resource) {
    const key = resource.toString();
    if (this._subscriptions.hasSessionSubscribers(resource)) {
      return;
    }
    const state = this._stateManager.getSessionState(key);
    if (state && (state.turns.length > 0 || state.activeTurn !== void 0)) {
      return;
    }
    if (this._stateManager.isUnusedDraft(key) === false) {
      this._logService.trace(`[AgentService] GC aborted, session is no longer an unused draft: ${key}`);
      return;
    }
    this._logService.info(`[AgentService] GC: disposing empty unsubscribed session ${key}`);
    await this.disposeSession(resource);
  }
  _evictSessionState(evictionTarget, evictionTargetKey, triggerKey, chats) {
    this._logService.info(`[AgentService] Evicting idle session: ${evictionTargetKey} (triggered by unsubscribe of ${triggerKey})`);
    const subagentPrefix = buildSubagentSessionUriPrefix(evictionTarget);
    for (const cachedKey of this._stateManager.getSessionUrisWithPrefix(subagentPrefix)) {
      this._stateManager.removeSession(cachedKey);
    }
    this._sideEffects.clearSessionTitleState(evictionTargetKey, chats);
    this._chatContributions.disposeSessionState(evictionTargetKey);
    this._stateManager.removeSession(evictionTargetKey);
  }
  /** Returns true when a changeset is safe to drop from the in-memory cache. */
  _canEvictChangeset(changeset) {
    const changesetUri = URI.parse(changeset);
    if (this._subscriptions.hasSubscribers(changesetUri)) {
      return false;
    }
    const parsed = parseChangesetUri(changeset);
    if (!parsed) {
      return false;
    }
    const sessionUri = URI.parse(parsed.sessionUri);
    if (this._subscriptions.hasSubscribers(sessionUri)) {
      return false;
    }
    for (const subscribedUri of this._subscriptions.subscribedResources) {
      if (this._isSubagentDescendantOf(subscribedUri, sessionUri)) {
        return false;
      }
    }
    return !this._changesets.isStaticChangesetComputeActive(changeset);
  }
  _isSubagentDescendantOf(resource, parent) {
    let parsed = parseSubagentSessionUri(resource);
    while (parsed) {
      if (isEqual2(parsed.parentSession, parent)) {
        return true;
      }
      parsed = parseSubagentSessionUri(parsed.parentSession);
    }
    return false;
  }
  /**
   * Applies a read/archive toggle to a session that is not currently
   * materialized, by writing the flag to the session database and publishing
   * the catalogue delta on the root channel.
   *
   * Restoring instead cannot work: restore reopens the working directory, and
   * for a missing one only an *already* archived session resumes read-only —
   * so archiving, the very thing that would archive it, could never land.
   *
   * Returns `false` for a session the host does not know, which the caller must
   * drop: creating `agentSessionData/<id>` is how Agent Host claims ownership,
   * never a side effect of a metadata toggle. Callers must rule out live state
   * first, so an absent surfaced summary can only mean "unknown".
   */
  async _applyPassiveSessionMetadata(session, action) {
    if (!this._stateManager.getSurfacedSessionSummary(session)) {
      return false;
    }
    const [key, flag, set] = action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */ ? [AH_META_IS_ARCHIVED_DB_KEY, 64 /* IsArchived */, action.isArchived] : [AH_META_IS_READ_DB_KEY, 32 /* IsRead */, action.isRead];
    await persistSessionMetadataValues(this._sessionDataService, session, { [key]: set ? "true" : "" });
    this._stateManager.setSurfacedSessionStatusFlag(session, flag, set);
    return true;
  }
  _isAutomationAction(action) {
    return action.type === "automation/createRequested" /* AutomationCreateRequested */ || action.type === "automation/updateRequested" /* AutomationUpdateRequested */ || action.type === "automation/removed" /* AutomationRemoved */;
  }
  _isAutomationRunAction(action) {
    return action.type === "automationRun/cancelRequested" /* AutomationRunCancelRequested */;
  }
  dispatchAction(channel, action, clientId, clientSeq, clientContextOrType = "unknown" /* Unknown */) {
    const clientContext = typeof clientContextOrType === "string" ? createUnknownAgentHostClientTelemetryContext(clientContextOrType) : clientContextOrType;
    this._logService.trace(`[AgentService] dispatchAction: type=${action.type}, clientId=${clientId}, clientSeq=${clientSeq}`, action);
    if (action.type === "root/configChanged" /* RootConfigChanged */ && Object.hasOwn(action.config, AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY)) {
      const migration = action.config[AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY];
      const origin = { clientId, clientSeq };
      if (!isAgentHostAutomationMigrationCompletion(migration)) {
        this._stateManager.rejectClientAction(channel, action, origin, "Invalid automation migration completion payload.");
        return;
      }
      if (Object.keys(action.config).length !== 1 || action.replace) {
        this._stateManager.rejectClientAction(channel, action, origin, "Automation migration completion must be dispatched as an isolated root-config patch.");
        return;
      }
      this._dispatchAutomationMigrationAction(channel, action, clientId, clientSeq, clientContext);
      return;
    }
    if (this._isAutomationAction(action)) {
      const origin = { clientId, clientSeq };
      if (channel !== AUTOMATION_CATALOG_URI) {
        this._stateManager.rejectClientAction(channel, action, origin, "Automation actions require the automation catalogue channel.");
        return;
      }
      void this._dispatchAutomationAction(action).catch((error) => {
        const message = toErrorMessage(error);
        this._logService.error(`[AgentService] automation action failed: ${message}`);
        this._stateManager.rejectClientAction(channel, action, origin, message);
      });
      return;
    }
    if (this._isAutomationRunAction(action)) {
      const origin = { clientId, clientSeq };
      if (!isAhpAutomationRunChannel(channel)) {
        this._stateManager.rejectClientAction(channel, action, origin, "Automation run actions require an automation-run channel.");
        return;
      }
      void this._automationService.handleCancel(channel, action).catch((error) => {
        const message = toErrorMessage(error);
        this._logService.error(`[AgentService] automation run action failed: ${message}`);
        this._stateManager.rejectClientAction(channel, action, origin, message);
      });
      return;
    }
    const chatChannel = isAhpChatChannel(channel) ? channel : void 0;
    const sessionChannel = chatChannel ? parseRequiredSessionUriFromChatUri(chatChannel) : channel;
    const requiresSessionRestore = (chatChannel !== void 0 || isSessionAction(action)) && !this._stateManager.getSessionState(sessionChannel);
    const requiresPeerResolution = chatChannel !== void 0 && !this._stateManager.getChatState(chatChannel);
    const requiresTurnOwnerResolution = action.type === "chat/turnStarted" /* ChatTurnStarted */ && (requiresSessionRestore || (this._getUnresolvedPeerChats(sessionChannel)?.length ?? 0) > 0);
    const requiresAttachmentRewrite = this._needsAsyncRewrite(sessionChannel, action);
    const requiresReviewStateUpdate = action.type === "changeset/filesReviewChanged" /* ChangesetFilesReviewChanged */;
    const pending = this._clientDispatchQueues.get(clientId);
    if (!pending && !requiresSessionRestore && !requiresPeerResolution && !requiresTurnOwnerResolution && !requiresAttachmentRewrite && !requiresReviewStateUpdate) {
      this._dispatchActionNow(channel, sessionChannel, action, clientId, clientSeq, clientContext);
      return;
    }
    const next = (pending ?? Promise.resolve()).then(async () => {
      const sessionUri = URI.parse(sessionChannel);
      const subagent = parseSubagentSessionUri(sessionUri);
      if (isPassiveSessionMetadataAction(action) && !subagent) {
        await this._restoreSessionInFlight.get(sessionChannel)?.catch(() => void 0);
        if (!this._stateManager.getSessionState(sessionChannel)) {
          if (readSessionEhcliAdoptable(this._stateManager.getSurfacedSessionSummary(sessionChannel)?._meta)) {
            return;
          }
          if (!await this._applyPassiveSessionMetadata(sessionChannel, action)) {
            return;
          }
        }
      } else if (requiresSessionRestore) {
        if (subagent) {
          await this._restoreSubagentSession(sessionChannel, subagent.parentSession);
        } else {
          await this.restoreSession(sessionUri);
        }
      }
      if (chatChannel && requiresPeerResolution) {
        await this._stateManager.resolveChatState(chatChannel);
      }
      if (action.type === "chat/turnStarted" /* ChatTurnStarted */ && requiresTurnOwnerResolution) {
        await this._resolvePeerChatsForTurnValidation(sessionChannel);
      }
      const rewritten = requiresAttachmentRewrite ? await this._rewriteUserMessageAttachments(sessionChannel, action, clientId) : action;
      if (rewritten.type === "changeset/filesReviewChanged" /* ChangesetFilesReviewChanged */) {
        await this._reviewService.setReviewState(channel, rewritten.files, rewritten.reviewed);
        const changeset = parseChangesetUri(channel);
        if (!changeset) {
          throw new Error(`Invalid changeset URI: ${channel}`);
        }
        this._changesets.refreshBranchChangeset(changeset.sessionUri);
      }
      this._dispatchActionNow(channel, sessionChannel, rewritten, clientId, clientSeq, clientContext);
    }).catch((err) => {
      this._logService.error(`[AgentService] async dispatchAction failed: ${toErrorMessage(err)}`);
      this._stateManager.rejectClientAction(channel, action, { clientId, clientSeq }, toErrorMessage(err));
    }).finally(() => {
      if (this._clientDispatchQueues.get(clientId) === next) {
        this._clientDispatchQueues.delete(clientId);
      }
    });
    this._clientDispatchQueues.set(clientId, next);
  }
  _dispatchAutomationMigrationAction(channel, action, clientId, clientSeq, clientContext) {
    const pending = this._clientDispatchQueues.get(clientId);
    const next = (pending ?? Promise.resolve()).then(async () => {
      const migration = action.config[AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY];
      if (!isAgentHostAutomationMigrationCompletion(migration)) {
        throw new Error("Invalid automation migration completion payload.");
      }
      await this._automationService.completeMigration(migration.resources);
      this._dispatchActionNow(channel, channel, action, clientId, clientSeq, clientContext);
    }).catch((error) => {
      const message = toErrorMessage(error);
      this._logService.error(`[AgentService] Failed to complete automation migration: ${message}`);
      this._stateManager.rejectClientAction(channel, action, { clientId, clientSeq }, message);
    }).finally(() => {
      if (this._clientDispatchQueues.get(clientId) === next) {
        this._clientDispatchQueues.delete(clientId);
      }
    });
    this._clientDispatchQueues.set(clientId, next);
  }
  async _dispatchAutomationAction(action) {
    switch (action.type) {
      case "automation/createRequested" /* AutomationCreateRequested */:
        return this._automationService.handleCreate(action);
      case "automation/updateRequested" /* AutomationUpdateRequested */:
        return this._automationService.handleUpdate(action);
      case "automation/removed" /* AutomationRemoved */:
        return this._automationService.handleRemove(action);
    }
  }
  /**
   * Authoritative gate for every client working-directory action. Throws when
   * the session or its provider cannot accept the change — including a removal
   * of the primary directory for a provider that pins it — so the caller can
   * reject the action. Returns the canonicalized action on success.
   */
  _prepareWorkingDirectoryAction(session, action) {
    const state = this._stateManager.getSessionState(session);
    if (!state || state.lifecycle !== "ready" /* Ready */ || !state.workingDirectories?.length) {
      throw new Error(`Session is not ready for working-directory changes: ${session}`);
    }
    if (!readSessionMultiRootMetadata(state._meta) || readSessionWorkspaceless(state._meta) || state.config?.values["isolation" /* Isolation */] === "worktree" || state.chats.length !== 1 || !state.defaultChat || state.defaultChat !== state.chats[0].resource) {
      throw new Error(`Session does not support dynamic working-directory changes: ${session}`);
    }
    const sessionUri = URI.parse(session);
    const provider = this._providerService.getProviderForSession(sessionUri);
    const capability = provider?.getDescriptor().capabilities?.multipleWorkingDirectories;
    if (!provider || !capability) {
      throw new Error(`Provider does not support dynamic working-directory changes: ${AgentSession.provider(sessionUri) ?? "(unknown)"}`);
    }
    return resolveSessionWorkingDirectoryAction(action, state.workingDirectories, {
      immutablePrimary: capability.immutablePrimary === true,
      primaryReplacement: capability.primaryReplacement === true
    });
  }
  /**
   * Carries host-written session config through a client replacement. A client
   * may legitimately replace its own config wholesale, but omitting a host-owned
   * key must not clear it, since that would reset Agent Merge authorization state.
   */
  _withPreservedHostWrittenSessionConfig(session, action) {
    const values = this._stateManager.getSessionState(session)?.config?.values;
    if (!values) {
      return action;
    }
    let preserved;
    for (const key of HOST_WRITTEN_SESSION_CONFIG_KEYS) {
      if (Object.hasOwn(values, key)) {
        preserved ??= {};
        preserved[key] = values[key];
      }
    }
    return preserved ? { ...action, config: { ...action.config, ...preserved } } : action;
  }
  _dispatchActionNow(channel, sessionChannel, action, clientId, clientSeq, clientContext) {
    const origin = { clientId, clientSeq };
    if (action.type === "chat/turnCancelled" /* ChatTurnCancelled */) {
      const resumedDuration = this._sideEffects.getResumedTurnDuration(channel, action.turnId);
      if (resumedDuration !== void 0) {
        action = { ...action, duration: resumedDuration };
      }
    }
    let resumedTurn;
    if (action.type === "chat/turnResume" /* ChatTurnResume */) {
      if (!isAhpChatChannel(channel)) {
        this._stateManager.rejectClientAction(channel, action, origin, "Turn resume requires a chat channel.");
        return;
      }
      const chatState = this._stateManager.getChatState(channel);
      const sessionState = this._stateManager.getSessionState(sessionChannel);
      const sessionArchived = ((sessionState?.status ?? 0) & 64 /* IsArchived */) === 64 /* IsArchived */;
      const turn = chatState?.turns.at(-1);
      const errorPart = getErrorResponsePart(turn);
      const provider = this._providerService.getProviderForSession(sessionChannel);
      if (chatState?.activeTurn) {
        this._stateManager.rejectClientAction(channel, action, origin, "Cannot resume while a turn is active.");
        return;
      }
      if (isChatReadOnly(chatState?.interactivity, sessionArchived)) {
        this._stateManager.rejectClientAction(channel, action, origin, "Cannot resume a read-only or archived chat.");
        return;
      }
      if (!turn || turn.id !== action.turnId || turn.state !== "error" /* Error */ || errorPart?.resumable !== true) {
        this._stateManager.rejectClientAction(channel, action, origin, "The requested turn is not the latest resumable errored turn.");
        return;
      }
      if (!provider?.chats.resumeTurn) {
        this._stateManager.rejectClientAction(channel, action, origin, "The session provider does not support turn resume.");
        return;
      }
      resumedTurn = turn;
    }
    if (action.type === "chat/turnStarted" /* ChatTurnStarted */ && this._isTurnIdUsedByAnotherChat(sessionChannel, channel, action.turnId)) {
      this._stateManager.rejectClientAction(channel, action, origin, "Turn id is already used by another chat in this session.");
      return;
    }
    if (action.type === "session/configChanged" /* SessionConfigChanged */) {
      const configAction = action;
      const forbidden = HOST_WRITTEN_SESSION_CONFIG_KEYS.filter((key) => Object.hasOwn(configAction.config, key));
      if (forbidden.length > 0) {
        this._stateManager.rejectClientAction(channel, action, origin, `Session config keys are host-owned and cannot be set by a client: ${forbidden.join(", ")}.`);
        return;
      }
      if (configAction.replace) {
        action = this._withPreservedHostWrittenSessionConfig(sessionChannel, configAction);
      }
    }
    if (action.type === "session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */) {
      this._stateManager.rejectClientAction(channel, action, origin, "Session working-directory replacement is not supported.");
      return;
    }
    if (action.type === "session/workingDirectorySet" /* SessionWorkingDirectorySet */ || action.type === "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */) {
      if (clientContext.clientType !== "editor_window" /* EditorWindow */) {
        this._stateManager.rejectClientAction(channel, action, origin, "Session working-directory actions require an Editor Window client.");
        return;
      }
      if (channel !== sessionChannel) {
        this._stateManager.rejectClientAction(channel, action, origin, "Session working-directory actions require a session channel.");
        return;
      }
      try {
        action = this._prepareWorkingDirectoryAction(sessionChannel, action);
      } catch (error) {
        this._stateManager.rejectClientAction(channel, action, origin, toErrorMessage(error));
        return;
      }
    }
    const automationMigration = action.type === "root/configChanged" /* RootConfigChanged */ ? action.config[AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY] : void 0;
    if (automationMigration !== void 0 && !isAgentHostAutomationMigrationCompletion(automationMigration)) {
      this._stateManager.rejectClientAction(channel, action, origin, "Invalid automation migration completion payload.");
      return;
    }
    this._stateManager.dispatchClientAction(channel, action, origin, clientContext);
    if (action.type === "root/configChanged" /* RootConfigChanged */) {
      this._configurationService.persistRootConfig();
      const editTelemetryEnabled = action.config[AgentHostEditTelemetryEnabledConfigKey];
      if (typeof editTelemetryEnabled === "boolean") {
        this._editAttributionService.setEnabled(editTelemetryEnabled);
      }
      void this._automationService.handleConfigurationChanged().catch((error) => {
        this._logService.error(`[AgentService] Failed to apply Automation configuration: ${toErrorMessage(error)}`);
      });
    }
    this._sideEffects.handleAction(channel, action, clientId, clientContext, resumedTurn);
  }
  _getUnresolvedPeerChats(sessionChannel) {
    return this._stateManager.getSessionState(sessionChannel)?.chats.filter((chat) => !isDefaultChatUri(chat.resource) && !this._stateManager.getChatState(chat.resource)).map((chat) => chat.resource);
  }
  async _resolvePeerChatsForTurnValidation(sessionChannel) {
    while (true) {
      const unresolvedChats = this._getUnresolvedPeerChats(sessionChannel);
      if (!unresolvedChats) {
        throw new Error("Cannot validate turn id for unknown session");
      }
      if (unresolvedChats.length === 0) {
        return;
      }
      await Promise.all(unresolvedChats.map(async (chat) => {
        if (!await this._stateManager.resolveChatState(chat)) {
          throw new Error("Cannot resolve peer chat for turn id validation");
        }
      }));
    }
  }
  _isTurnIdUsedByAnotherChat(sessionChannel, chatChannel, turnId) {
    const sessionState = this._stateManager.getSessionState(sessionChannel);
    if (!sessionState) {
      return false;
    }
    if (sessionState.defaultChat !== chatChannel && (sessionState.activeTurn?.id === turnId || (sessionState.turns ?? []).some((turn) => turn.id === turnId))) {
      return true;
    }
    for (const chat of sessionState.chats ?? []) {
      if (chat.resource === chatChannel || isDefaultChatUri(chat.resource)) {
        continue;
      }
      const chatState = this._stateManager.getChatState(chat.resource);
      if (chatState?.activeTurn?.id === turnId || chatState?.turns.some((turn) => turn.id === turnId)) {
        return true;
      }
    }
    return false;
  }
  _needsAsyncRewrite(sessionURI, action) {
    if (action.type !== "chat/turnStarted" /* ChatTurnStarted */ && action.type !== "chat/pendingMessageSet" /* ChatPendingMessageSet */) {
      return false;
    }
    const attachmentsRoot = this._attachmentsRoot(sessionURI);
    return !!action.message.attachments?.some((a) => this._isRewritableAttachment(a, attachmentsRoot) || this._isUntaggedSnapshotResource(a, attachmentsRoot));
  }
  _isRewritableAttachment(attachment, attachmentsRoot) {
    if (attachment.type === "embeddedResource" /* EmbeddedResource */) {
      return true;
    }
    if (attachment.type === "resource" /* Resource */) {
      if (attachment.displayKind === "directory") {
        return false;
      }
      if (this._isUnderAttachmentsRoot(attachment.uri, attachmentsRoot)) {
        return false;
      }
      return true;
    }
    return false;
  }
  /**
   * A {@link MessageAttachmentKind.Resource} that already points inside our session attachments
   * folder but is not yet tagged as a host snapshot. This happens when a previously snapshotted
   * copy is re-attached (e.g. the user opens the copy, or implicit context captures it). It must
   * not be re-snapshotted, but it must still be tagged so downstream providers treat it as
   * read-only rather than an editable file (#331154).
   */
  _isUntaggedSnapshotResource(attachment, attachmentsRoot) {
    return attachment.type === "resource" /* Resource */ && attachment.displayKind !== "directory" && this._isUnderAttachmentsRoot(attachment.uri, attachmentsRoot) && !isHostSnapshotAttachment(attachment);
  }
  /**
   * Whether an attachment URI points at the session attachments directory or a descendant. Uses URI
   * containment (not a string-prefix check) so a sibling such as `.../attachments-backup/file` is not
   * matched, and — on case-insensitive filesystems — a real snapshot whose path casing differs is
   * still recognised. Mirrors the write-deny classifier (`isSessionAttachmentPath`).
   */
  _isUnderAttachmentsRoot(attachmentUri, attachmentsRoot) {
    return extUriBiasedIgnorePathCase.isEqualOrParent(URI.parse(attachmentUri), attachmentsRoot);
  }
  _attachmentsRoot(sessionURI) {
    return joinPath(this._sessionDataService.getSessionDataDir(URI.parse(sessionURI)), SESSION_ATTACHMENTS_DIRNAME);
  }
  /**
   * Snapshot inline / client-resident attachment payloads onto disk
   * under the session's data directory and rewrite the action to
   * reference them via local `file:` URIs. Keeps potentially large
   * blobs (e.g. pasted text or images) out of the in-memory state tree while
   * letting the agent consume them via the standard {@link IFileService}
   * surface — no special URI scheme or blob round-tripping needed.
   *
   * Failures are isolated per-attachment: if a rewrite cannot be
   * performed (no client connection registered, `resourceRead` rejects,
   * etc.) the original attachment is preserved so the agent still has a
   * chance to make use of it.
   */
  async _rewriteUserMessageAttachments(channel, action, clientId) {
    const attachments = action.message.attachments;
    if (!attachments?.length) {
      return action;
    }
    const attachmentsRoot = this._attachmentsRoot(channel);
    const rewritten = await Promise.all(attachments.map((a) => this._rewriteSingleAttachment(a, attachmentsRoot, clientId)));
    return {
      ...action,
      message: { ...action.message, attachments: rewritten }
    };
  }
  async _rewriteSingleAttachment(attachment, attachmentsRoot, clientId) {
    try {
      if (attachment.type === "embeddedResource" /* EmbeddedResource */) {
        const bytes = decodeBase64(attachment.data).buffer;
        const basename3 = this._attachmentBasename(attachment.label, attachment.contentType);
        return this._writeAndRewrite(attachment, bytes, basename3, attachmentsRoot, attachment.contentType);
      }
      if (attachment.type === "resource" /* Resource */) {
        if (this._isUntaggedSnapshotResource(attachment, attachmentsRoot)) {
          return this._tagSnapshotAttachment(attachment, getMediaMime(URI.parse(attachment.uri).path));
        }
        if (this._isRewritableAttachment(attachment, attachmentsRoot)) {
          const originalUri = URI.parse(attachment.uri);
          if (originalUri.scheme === Schemas.file && await this._fileExistsSafe(originalUri)) {
            return attachment;
          }
          const contentType = getMediaMime(originalUri.path);
          const bytes = await this._readClientResource(originalUri, clientId);
          const basename3 = this._attachmentBasename(attachment.label, contentType);
          return this._writeAndRewrite(attachment, bytes, basename3, attachmentsRoot, contentType);
        }
      }
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to rewrite attachment '${attachment.label}': ${toErrorMessage(err)}`);
    }
    return attachment;
  }
  /**
   * Tag an existing {@link MessageResourceAttachment} as a host snapshot (read-only) without
   * re-writing its bytes. Used for copies re-attached from the session attachments folder.
   */
  _tagSnapshotAttachment(attachment, contentType) {
    return {
      ...attachment,
      _meta: { ...attachment._meta, ...toHostSnapshotAttachmentMeta(contentType) }
    };
  }
  /**
   * Like {@link IFileService.exists} but never throws (e.g. when no provider
   * is registered for the URI scheme), returning `false` in that case.
   */
  async _fileExistsSafe(uri) {
    try {
      return await this._fileService.exists(uri);
    } catch {
      return false;
    }
  }
  /**
   * Reads `originalUri` through the `vscode-agent-client` filesystem
   * provider so it is fetched from the originating client. Falls back to
   * a direct read against `originalUri` when no client filesystem
   * authority is registered for `clientId` (e.g. unit tests, in-process
   * agent host with a local URI).
   */
  async _readClientResource(originalUri, clientId) {
    const proxiedUri = clientId ? toAgentClientUri(originalUri, clientId) : originalUri;
    try {
      const contents = await this._fileService.readFile(proxiedUri);
      return contents.value.buffer;
    } catch (err) {
      if (proxiedUri !== originalUri) {
        try {
          const contents = await this._fileService.readFile(originalUri);
          return contents.value.buffer;
        } catch {
        }
      }
      throw err;
    }
  }
  async _writeAndRewrite(original, bytes, basename3, attachmentsRoot, contentType) {
    const id2 = generateUuid();
    const target = joinPath(attachmentsRoot, id2, basename3);
    await this._fileService.writeFile(target, VSBuffer.wrap(bytes));
    const rewritten = {
      type: "resource" /* Resource */,
      uri: target.toString(),
      label: original.label,
      displayKind: original.displayKind,
      range: original.range,
      // Tag the on-disk copy as a read-only host snapshot so downstream providers present it
      // as content (not an editable file) and never let the model edit the copy (#331154).
      _meta: { ...original._meta, ...toHostSnapshotAttachmentMeta(contentType) }
    };
    if (original.type === "resource" /* Resource */ && original.selection) {
      rewritten.selection = original.selection;
    }
    return rewritten;
  }
  /**
   * Pick a sensible on-disk basename for the snapshotted attachment,
   * preserving a usable extension where possible so the SDK and other
   * downstream consumers can detect the right type from the path alone.
   */
  _attachmentBasename(label, contentType) {
    const safeLabel = (label || "attachment").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_");
    if (extname2(URI.file(safeLabel))) {
      return safeLabel;
    }
    const ext = contentType ? getExtensionForMimeType(contentType) : void 0;
    return ext ? `${safeLabel}${ext}` : safeLabel;
  }
  async resourceList(uri) {
    let stat3;
    try {
      stat3 = await this._fileService.resolve(uri);
    } catch {
      throw new ProtocolError(AhpErrorCodes.NotFound, `Directory not found: ${uri.toString()}`);
    }
    if (!stat3.isDirectory) {
      throw new ProtocolError(AhpErrorCodes.NotFound, `Not a directory: ${uri.toString()}`);
    }
    const entries = (stat3.children ?? []).map((child) => ({
      name: child.name,
      type: child.isDirectory ? "directory" : "file"
    }));
    return { entries };
  }
  async restoreSession(session, onRestoreStart) {
    const sessionStr = session.toString();
    this._cancelPendingSessionGc(session);
    this._sessionResidency.touch(session);
    await this._sessionResidency.waitForRelease(session);
    const inFlight = this._restoreSessionInFlight.get(sessionStr);
    if (inFlight) {
      onRestoreStart?.(true);
      this._logService.trace(`[AgentService] restoreSession: joining in-flight restore for ${sessionStr}`);
      return inFlight;
    }
    if (this._stateManager.getSessionState(sessionStr)) {
      this._sessionResidency.touch(session);
      await this._sessionResidency.reconcile();
      return;
    }
    onRestoreStart?.(false);
    this._logService.trace(`[AgentService] restoreSession start: ${sessionStr}`);
    const restore = this._doRestoreSession(session, sessionStr);
    this._restoreSessionInFlight.set(sessionStr, restore);
    try {
      await restore;
      this._sessionResidency.touch(session);
      await this._sessionResidency.reconcile();
      this._logService.trace(`[AgentService] restoreSession done: ${sessionStr}`);
    } finally {
      if (this._restoreSessionInFlight.get(sessionStr) === restore) {
        this._restoreSessionInFlight.delete(sessionStr);
      }
    }
  }
  /** Emits one {@link AgentHostLegacyMigrationEvent} for a legacy-session adoption attempt. */
  _reportLegacyMigration(provider, outcome, startTime, extra) {
    this._telemetryService.publicLog2("agentHost.legacyCopilotCliMigration", {
      provider,
      outcome,
      success: outcome === "migrated" && (extra.turnCount ?? 0) > 0,
      turnCount: extra.turnCount ?? 0,
      durationMs: Date.now() - startTime,
      hasProject: extra.hasProject ?? false,
      hasWorktree: extra.hasWorktree ?? false,
      workingDirectoryCount: extra.workingDirectoryCount ?? 0,
      errorMessage: extra.errorMessage,
      reason: extra.reason ?? "unknown"
    });
  }
  async _doRestoreSession(session, sessionStr) {
    if (this._stateManager.getSessionState(sessionStr)) {
      return;
    }
    if (await this._sessionRegistry.isTombstoned(session)) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session was explicitly deleted: ${sessionStr}`);
    }
    let registeredSession = await this._sessionRegistry.get(session, (entry) => this._migrateRegisteredSession(entry));
    if (registeredSession) {
      this._providerService.associateSession(session, registeredSession.provider);
    }
    const agent = registeredSession ? this._providerService.getProvider(registeredSession.provider) : this._providerService.getProviderForSession(session);
    if (!agent) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `No agent for session: ${sessionStr}`);
    }
    let catalogReadable;
    const awaitCatalogReadable = () => catalogReadable ??= (async () => {
      let readable;
      try {
        readable = await this._awaitInitialProviderMigrationForProvider(agent, !registeredSession);
      } catch (err) {
        readable = false;
        this._logService.warn(`[AgentService] restore: initial catalog migration for provider ${agent.id} failed; a metadata miss will be reported as unavailable, not missing`, err);
      }
      if (await this._sessionRegistry.isTombstoned(session)) {
        throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session was explicitly deleted: ${sessionStr}`);
      }
      return readable;
    })();
    let external = registeredSession?.external ?? false;
    this._logService.trace(`[AgentService] restore: catalog and registry resolved for ${sessionStr} (registered=${!!registeredSession}, external=${external})`);
    const migrateLegacyEnabled = this._isMigrateLegacyEnabled();
    const migrationStartTime = Date.now();
    let adoption = { adopted: false, eligible: false };
    if (!external && migrateLegacyEnabled && agent.ensureChatAdopted) {
      try {
        const defaultChat = URI.parse(buildDefaultChatUri(session));
        adoption = await agent.ensureChatAdopted(defaultChat, this._chatContext(session, defaultChat));
      } catch (err) {
        this._reportLegacyMigration(agent.id, "failed", migrationStartTime, { errorMessage: toErrorMessage(err) });
        throw err;
      }
    }
    const adopted = adoption.adopted;
    if (!registeredSession && agent.ensureChatAdopted && !adoption.eligible && !adoption.native) {
      await awaitCatalogReadable();
      registeredSession = await this._sessionRegistry.get(session, (entry) => this._migrateRegisteredSession(entry));
      external = registeredSession?.external ?? external;
      if (!registeredSession) {
        this._logService.info(`[AgentService] restore refused for unregistered ${sessionStr}: not an adoptable legacy chat (reason=${adoption.reason ?? "unknown"})`);
        throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session is not an adoptable legacy chat: ${sessionStr}`);
      }
    }
    let registeredAfterAdoption = !!registeredSession;
    try {
      if (adopted && !registeredSession) {
        const registeredAt = Date.now();
        await this._retryRegistryMutation(
          () => this._sessionRegistry.register(session, { provider: agent.id, startTime: registeredAt, modifiedTime: registeredAt, source: "restore" }, { checkTombstone: true }),
          `adoption registration for ${sessionStr}`
        );
        registeredAfterAdoption = true;
        this._invalidateSessionList();
        try {
          const surfaced = await this._registeredSessionMetadata(
            agent,
            session,
            /* external */
            false
          );
          if (surfaced) {
            await this._announceSurfacedSession(surfaced, agent.id);
          }
        } catch (err) {
          this._logService.warn(`[AgentService] Failed to surface adopted session ${sessionStr} before restore`, err);
        }
      }
      const facts = await this._restoreSessionState(agent, session, sessionStr, adopted, external, registeredSession?.source ?? "restore", awaitCatalogReadable, !!registeredSession, adoption.worktree);
      await this._restoreAnnotations(session);
      if (adopted) {
        this._stateManager.setSessionSummaryPublished(sessionStr, true);
        this._reportLegacyMigration(agent.id, "migrated", migrationStartTime, { ...facts, reason: adoption.reason });
      } else if (adoption.eligible) {
        this._logService.info(`[AgentService] legacy session ${sessionStr} was a migration candidate but was not adopted (reason=${adoption.reason ?? "unknown"})`);
        this._reportLegacyMigration(agent.id, "skipped", migrationStartTime, { hasProject: facts.hasProject, workingDirectoryCount: facts.workingDirectoryCount, reason: adoption.reason });
      }
    } catch (err) {
      if (adopted) {
        this._logService.error(registeredAfterAdoption ? `[AgentService] legacy session ${sessionStr} was adopted but its restore failed; it is registered so it surfaces with an error rather than disappearing` : `[AgentService] legacy session ${sessionStr} was adopted but could not be registered; the extension host no longer lists it, so it will not appear until the next successful restore`, err);
        this._reportLegacyMigration(agent.id, "failed", migrationStartTime, { errorMessage: toErrorMessage(err), reason: adoption.reason });
      }
      throw err;
    }
  }
  async _restoreAnnotations(session) {
    const sessionStr = session.toString();
    if (this._stateManager.getAnnotationsState(buildAnnotationsUri(sessionStr))) {
      return;
    }
    const inFlight = this._restoreAnnotationsInFlight.get(sessionStr);
    if (inFlight) {
      await inFlight;
      return;
    }
    const restore = this._doRestoreAnnotations(session);
    this._restoreAnnotationsInFlight.set(sessionStr, restore);
    try {
      await restore;
    } finally {
      if (this._restoreAnnotationsInFlight.get(sessionStr) === restore) {
        this._restoreAnnotationsInFlight.delete(sessionStr);
      }
    }
  }
  /**
   * Ensures a session's persisted annotations are in state before its
   * annotations channel serves a snapshot, awaiting any restore that is
   * already populating the session.
   */
  async _ensureAnnotationsRestored(sessionUri) {
    if (this._stateManager.getAnnotationsState(buildAnnotationsUri(sessionUri))) {
      return;
    }
    await this._restoreSessionInFlight.get(sessionUri);
    await this._restoreSubagentInFlight.get(sessionUri);
    const session = URI.parse(sessionUri);
    if (!this._stateManager.getSessionState(sessionUri)) {
      const parsedSubagent = parseSubagentSessionUri(session);
      if (parsedSubagent) {
        await this._restoreSubagentSession(sessionUri, parsedSubagent.parentSession);
      } else {
        await this.restoreSession(session);
      }
    }
    await this._restoreAnnotations(session);
  }
  /** Reads persisted annotations into state. */
  async _doRestoreAnnotations(session) {
    const storage = this._annotationsStorage(session);
    const refPromise = this._sessionDataService.tryOpenDatabase?.(storage.session);
    if (!refPromise) {
      return;
    }
    try {
      const ref = await refPromise;
      if (!ref) {
        return;
      }
      try {
        const raw = await ref.object.getMetadata(storage.key);
        if (!raw) {
          return;
        }
        const state = JSON.parse(raw);
        const annotations = readPersistedAnnotationsState(state, session.toString());
        if (!annotations) {
          throw new Error("Invalid annotations state");
        }
        this._stateManager.restoreAnnotations(session.toString(), annotations);
      } finally {
        ref.dispose();
      }
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to restore annotations for ${session.toString()}: ${toErrorMessage(err)}`);
    }
  }
  /**
   * Hydrates a restored (or freshly-adopted) session into the state manager and
   * completes all required restore work (turns, metadata, peer chats, config).
   * Returns the facts used for migration telemetry; throws if any required step
   * fails so the caller can report the outcome accurately.
   */
  async _restoreSessionState(agent, session, sessionStr, adopted, external, registrationSource, awaitCatalogReadable, sessionKnownToRegistry, adoptionWorktree) {
    this._logService.trace(`[AgentService] restore: reading provider metadata for ${sessionStr}`);
    let meta = await this._getSessionMetadataForRestore(agent, session, external);
    if (!meta) {
      const catalogReadable = await awaitCatalogReadable();
      meta = await this._getSessionMetadataForRestore(agent, session, external);
      const knownToRegistry = sessionKnownToRegistry || (await this._listRegisteredSessions()).some((entry) => entry.session.toString() === sessionStr);
      if (!meta) {
        throw catalogReadable && !knownToRegistry ? new ProtocolError(AHP_SESSION_NOT_FOUND, `Session not found on backend: ${sessionStr}`) : new ProtocolError(JSON_RPC_INTERNAL_ERROR, `Provider ${agent.id} could not describe ${sessionStr} yet`);
      }
    }
    this._logService.trace(`[AgentService] restore: provider metadata resolved for ${sessionStr}`);
    let adoptedWorktree = false;
    if (adopted && this._worktree.supported) {
      if (adoptionWorktree) {
        try {
          await this._worktree.recordAdoptedWorktreeMetadata(session, adoptionWorktree);
          adoptedWorktree = true;
          const worktreeProject = await this._worktree.resolveWorktreeProject(session);
          if (worktreeProject) {
            meta = { ...meta, project: worktreeProject };
          }
        } catch (err) {
          this._logService.warn(`[AgentService] adopt: recording recorded worktree metadata failed for ${sessionStr}`, err);
        }
      }
      const adoptedWorkingDirectory = meta.workingDirectories?.[0];
      if (!adoptedWorktree && adoptedWorkingDirectory) {
        try {
          if (await this._worktree.adoptExistingWorktreeMetadata(session, adoptedWorkingDirectory)) {
            adoptedWorktree = true;
            const worktreeProject = await this._worktree.resolveWorktreeProject(session);
            if (worktreeProject) {
              meta = { ...meta, project: worktreeProject };
            }
          }
        } catch (err) {
          this._logService.warn(`[AgentService] adopt: worktree metadata bridge failed for ${sessionStr}`, err);
        }
      }
    }
    if (!meta.project && !readSessionWorkspaceless(meta._meta) && this._worktree.supported) {
      const workingDirectory = meta.workingDirectories?.[0];
      if (workingDirectory) {
        try {
          const project = await this._worktree.recordExternalWorktreeProject(session, workingDirectory);
          if (project) {
            adoptedWorktree = true;
            meta = { ...meta, project };
          }
        } catch (err) {
          this._logService.warn(`[AgentService] restore: external worktree project discovery failed for ${sessionStr}`, err);
        }
      }
    }
    const defaultChatUri = URI.parse(buildDefaultChatUri(sessionStr));
    const defaultChatProviderData = await this._readDefaultChatProviderData(session);
    const chatContext = this._chatContext(session, defaultChatUri);
    const recoveredDefaultChat = !external && defaultChatProviderData === void 0 ? await agent.recoverLegacyChat?.(defaultChatUri, chatContext) : void 0;
    if (recoveredDefaultChat?.providerData !== void 0) {
      await this._persistDefaultChatBacking({ session, chat: recoveredDefaultChat });
    }
    const providerData = defaultChatProviderData ?? recoveredDefaultChat?.providerData;
    const materializedDefaultChat = await agent.materializeChat(defaultChatUri, chatContext, providerData);
    if (providerData === void 0 && materializedDefaultChat?.providerData !== void 0) {
      await this._persistDefaultChatBacking({ session, chat: materializedDefaultChat });
    }
    if (providerData === void 0 && materializedDefaultChat?.providerData === void 0) {
      this._logService.warn(`[AgentService] Restoring default chat ${defaultChatUri.toString()} with no persisted or recovered provider backing (agent=${agent.id})`);
    }
    let turns;
    try {
      turns = await this._getChatMessages(agent, defaultChatUri, session);
    } catch (err) {
      if (err instanceof ProtocolError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ProtocolError(JSON_RPC_INTERNAL_ERROR, `Failed to restore session ${sessionStr}: ${message}`);
    }
    let title = meta.summary ?? "Session";
    let isRead;
    let isArchived;
    let persistedConfigValues;
    let changes;
    let gitMetadata;
    let changesetMetadata;
    let sessionMetadata;
    const ref = this._sessionDataService.tryOpenDatabase?.(session);
    if (ref) {
      try {
        const db = await ref;
        if (db) {
          try {
            const m = await db.object.getMetadataObject({
              customTitle: true,
              [AH_META_IS_READ_DB_KEY]: true,
              [AH_META_IS_ARCHIVED_DB_KEY]: true,
              [AH_META_IS_DONE_DB_KEY]: true,
              configValues: true,
              [AH_META_WORKSPACELESS_DB_KEY]: true,
              [AH_META_EHCLI_ADOPTED_DB_KEY]: true,
              [AH_META_CREATED_BY_SESSION_DB_KEY]: true,
              [SESSION_META_MULTI_ROOT_KEY]: true,
              [SESSION_ARTIFACTS_KEY]: true,
              [SESSION_META_FOLDER_PICKER_KEY]: true,
              ...GIT_DB_METADATA_KEYS,
              ...CHANGESET_DB_METADATA_KEYS
            });
            if (m.customTitle) {
              title = m.customTitle;
            }
            if (m[AH_META_IS_READ_DB_KEY] !== void 0) {
              isRead = m[AH_META_IS_READ_DB_KEY] === "true";
            }
            const persistedArchived = m[AH_META_IS_ARCHIVED_DB_KEY] ?? m[AH_META_IS_DONE_DB_KEY];
            if (persistedArchived !== void 0) {
              isArchived = persistedArchived === "true";
            }
            changesetMetadata = m;
            if (changesetMetadata[META_CHANGES_SUMMARY]) {
              try {
                changes = JSON.parse(changesetMetadata[META_CHANGES_SUMMARY]);
              } catch (err) {
                this._logService.warn(`[AgentService] Failed to parse changes summary for ${sessionStr}: ${toErrorMessage(err)}`);
              }
            }
            gitMetadata = m;
            if (gitMetadata[META_GIT_STATE]) {
              try {
                const gitState = JSON.parse(gitMetadata[META_GIT_STATE]);
                sessionMetadata = { [SESSION_META_GIT_KEY]: gitState };
              } catch (err) {
                this._logService.warn(`[AgentService] Failed to parse Git state for ${sessionStr}: ${toErrorMessage(err)}`);
              }
            }
            if (gitMetadata[META_GITHUB_STATE]) {
              try {
                const githubState = JSON.parse(gitMetadata[META_GITHUB_STATE]);
                sessionMetadata = {
                  ...sessionMetadata ? sessionMetadata : {},
                  [SESSION_META_GITHUB_KEY]: githubState
                };
              } catch (err) {
                this._logService.warn(`[AgentService] Failed to parse GitHub state for ${sessionStr}: ${toErrorMessage(err)}`);
              }
            }
            if (gitMetadata[META_SOURCE_CONTROL_STATE]) {
              try {
                sessionMetadata = withSessionSourceControlState(sessionMetadata, parsePersistedSourceControlState(gitMetadata[META_SOURCE_CONTROL_STATE]));
              } catch (err) {
                this._logService.warn(`[AgentService] Failed to parse source-control state for ${sessionStr}: ${toErrorMessage(err)}`);
              }
            }
            if (m[AH_META_WORKSPACELESS_DB_KEY] !== void 0) {
              sessionMetadata = withSessionWorkspaceless(sessionMetadata, m[AH_META_WORKSPACELESS_DB_KEY] === "true");
            }
            if (m[AH_META_EHCLI_ADOPTED_DB_KEY] !== void 0) {
              sessionMetadata = withSessionEhcliAdopted(sessionMetadata, m[AH_META_EHCLI_ADOPTED_DB_KEY] === "true");
            }
            const creationReference = parseSessionCreationReference(m[AH_META_CREATED_BY_SESSION_DB_KEY]);
            if (creationReference) {
              sessionMetadata = withSessionCreationReference(sessionMetadata, creationReference);
            }
            sessionMetadata = withSessionMultiRootMetadata(sessionMetadata, parseSessionMultiRootMetadata(m[SESSION_META_MULTI_ROOT_KEY]));
            sessionMetadata = withSessionArtifacts(sessionMetadata, this._readPersistedArtifacts(m[SESSION_ARTIFACTS_KEY], sessionStr, "[AgentService]"));
            sessionMetadata = withSessionFolderPickerDecision(sessionMetadata, parseSessionFolderPickerDecision(m[SESSION_META_FOLDER_PICKER_KEY]));
            if (m.configValues) {
              try {
                persistedConfigValues = JSON.parse(m.configValues);
              } catch (err) {
                this._logService.warn(`[AgentService] Failed to parse persisted configValues for ${sessionStr}: ${toErrorMessage(err)}`);
              }
            }
          } finally {
            db.dispose();
          }
        }
      } catch {
      }
    }
    this._logService.trace(`[AgentService] restore: persisted session metadata read for ${sessionStr}`);
    let status = 1 /* Idle */;
    if (isRead) {
      status |= 32 /* IsRead */;
    }
    if (isArchived) {
      status |= 64 /* IsArchived */;
    }
    const providerMeta = withSessionMultiRootMetadata(meta._meta, void 0);
    let restoredMeta = sessionMetadata || providerMeta ? { ...providerMeta ?? {}, ...sessionMetadata ?? {} } : void 0;
    restoredMeta = withSessionMultiRootMetadata(restoredMeta, readSessionMultiRootMetadata(sessionMetadata));
    restoredMeta = withSessionExternal(restoredMeta, external);
    const summary = {
      resource: sessionStr,
      provider: agent.id,
      title,
      status,
      createdAt: new Date(meta.startTime).toISOString(),
      modifiedAt: new Date(meta.modifiedTime).toISOString(),
      ...meta.project ? { project: { uri: meta.project.uri.toString(), displayName: meta.project.displayName } } : {},
      changes: meta.changes ?? changes,
      workingDirectories: meta.workingDirectories?.map((d) => d.toString()),
      _meta: restoredMeta
    };
    const { draft: defaultDraft, title: defaultChatTitle } = await this._chatContributions.hydrateChat({
      session: sessionStr,
      chat: defaultChatUri.toString()
    }, {});
    const restoredDraft = meta.model ? { ...defaultDraft ?? { text: "", origin: { kind: "user" /* User */ } }, model: meta.model } : defaultDraft;
    const mergedTurns = await this._interleaveLocalTurns(sessionStr, defaultChatUri.toString(), turns);
    const registered = await this._retryRegistryMutation(
      () => this._sessionRegistry.register(session, { provider: agent.id, startTime: meta.startTime, modifiedTime: meta.modifiedTime, source: registrationSource }, { checkTombstone: true }),
      `registration for restored session ${session.toString()}`
    );
    if (!registered) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session was explicitly deleted: ${sessionStr}`);
    }
    this._invalidateSessionList();
    this._stateManager.restoreSession(summary, mergedTurns, { draft: restoredDraft, defaultChatTitle });
    this._logService.trace(`[AgentService] restore: hydrated state for ${sessionStr} with ${mergedTurns.length} turn(s)`);
    this._serverToolHost.advertise(sessionStr);
    if (adopted && this._checkpointService.adoptLegacyCheckpoints) {
      try {
        const checkpointWorkingDirectory = meta.workingDirectories?.[0];
        if (checkpointWorkingDirectory) {
          await this._checkpointService.adoptLegacyCheckpoints(session, checkpointWorkingDirectory, AgentSession.id(session), mergedTurns.map((t) => t.id));
        }
      } catch (err) {
        this._logService.warn(`[AgentService] adopt: checkpoint bridge failed for ${sessionStr}`, err);
      }
    }
    const promises15 = [];
    await this._registerRestoredSubagentSummaries(agent, session, mergedTurns);
    promises15.push(this._restorePeerChats(agent, session));
    this._changesetCoordinator.onSessionRestored(sessionStr, changesetMetadata ?? {});
    if (summary._meta) {
      this._stateManager.setSessionMeta(sessionStr, summary._meta);
    }
    const restoredConfigValues = meta.workingDirectories?.length ? { ["isolation" /* Isolation */]: "folder", ...persistedConfigValues } : persistedConfigValues;
    const [restoredConfig, restoredCustomizations] = await Promise.all([
      this._resolveCreatedSessionConfig(agent, {
        workingDirectories: meta.workingDirectories,
        config: restoredConfigValues
      }),
      agent.getChatCustomizations(defaultChatUri, chatContext, this._hostCustomizations(session)).catch((err) => {
        this._logService.error("[AgentService] restoreSession: failed to resolve chat customizations", err);
        return void 0;
      }),
      ...promises15
    ]);
    if (restoredConfig) {
      this._stateManager.setSessionConfig(sessionStr, restoredConfig);
      this._syncAgentMergeIndex(session, void 0, restoredConfig);
    }
    this._agentMergeController.onSessionAvailable(sessionStr);
    if (restoredCustomizations && restoredCustomizations.length > 0) {
      this._stateManager.setSessionCustomizations(sessionStr, restoredCustomizations);
    }
    this._logService.info(`[AgentService] Restored session ${sessionStr} with ${turns.length} turns`);
    void this._gitStateService.attachSessionGitHubPullRequest(sessionStr, meta.workingDirectories?.[0]);
    return {
      turnCount: mergedTurns.length,
      hasProject: !!meta.project,
      hasWorktree: adoptedWorktree,
      workingDirectoryCount: meta.workingDirectories?.length ?? 0
    };
  }
  /**
   * Restores the additional (non-default) peer chats for a session.
   *
   * Enumeration is driven by the orchestrator's OWN persisted catalog (the
   * {@link PEER_CHATS_METADATA_KEY} blob). Each catalog entry is registered
   * immediately with its persisted title, draft, origin, and provider data.
   * Its backing and history remain unloaded until the peer chat is requested.
   *
   * When the orchestrator catalog is absent ({@link _readPersistedPeerChatCatalog}
   * returns `undefined`) the session predates orchestrator-owned persistence:
   * a one-time migration ({@link _migrateLegacyPeerChats}) drains the agent's
   * legacy `*.chats` enumeration into the catalog so it is never consulted
   * again.
   */
  async _restorePeerChats(agent, session) {
    const persisted = await this._readPersistedPeerChatCatalog(session);
    if (persisted !== void 0) {
      await this._restorePeerChatsFromCatalog(session, persisted);
      return;
    }
    await this._migrateLegacyPeerChats(agent, session);
  }
  /**
   * One-time migration for sessions persisted before the orchestrator owned
   * the peer-chat catalog: enumerate the agent's legacy `*.chats`
   * ({@link IAgent.listLegacyChatBackings}), register them via the same path as the
   * new catalog, then write the orchestrator {@link PEER_CHATS_METADATA_KEY}
   * blob so subsequent restores read the new catalog and never consult the
   * legacy read again. No-op when the agent has no legacy enumeration or none
   * is persisted.
   */
  async _migrateLegacyPeerChats(agent, session) {
    const legacy = await agent.listLegacyChatBackings?.(session);
    if (!legacy || legacy.length === 0) {
      await this._enqueuePeerChatCatalogWrite(session, () => []);
      return;
    }
    const entries = legacy.map((chat) => ({
      uri: chat.uri.toString(),
      ...chat.providerData !== void 0 ? { providerData: chat.providerData } : {}
    }));
    await this._restorePeerChatsFromCatalog(session, entries);
    await this._enqueuePeerChatCatalogWrite(session, () => [...entries]);
  }
  /**
   * Registers a set of peer chats from an enumerated catalog in catalog order.
   * Titles and drafts are metadata-only reads; backing sessions and histories
   * are loaded on the first content request.
   */
  async _restorePeerChatsFromCatalog(session, entries) {
    const restored = await Promise.all(entries.map(async (entry) => {
      let chatUri;
      try {
        chatUri = URI.parse(entry.uri);
      } catch (err) {
        this._logService.warn(`[AgentService] Skipping malformed persisted peer chat URI '${entry.uri}': ${toErrorMessage(err)}`);
        return void 0;
      }
      const { title, draft } = await this._chatContributions.hydrateChat({
        session: session.toString(),
        chat: chatUri.toString()
      }, {});
      return { chatUri, title, draft, providerData: entry.providerData, origin: entry.origin, inheritedTurnId: entry.inheritedTurnId };
    }));
    for (const item of restored) {
      if (!item) {
        continue;
      }
      const { chatUri, title, draft, providerData, origin, inheritedTurnId } = item;
      if (this._stateManager.getChatState(chatUri.toString())) {
        continue;
      }
      this._stateManager.registerRestoredChatSummary(session.toString(), chatUri.toString(), {
        title,
        draft,
        providerData,
        origin,
        inheritedTurnId,
        resolver: (currentProviderData) => this._materializeRestoredPeerChat(session, chatUri, currentProviderData)
      });
    }
  }
  /**
   * Materializes provider backing and history for the state-manager-owned
   * restored chat entry. This callback never mutates state manager state.
   *
   * `materializeChat` may report a fresh `backingSession` for a peer chat
   * being restored (the same field used at create time to trigger
   * `_markChatBacking`); when it does, this marks it the same way create
   * does, with the same retry/suppression semantics, so a restored peer
   * chat's backing session cannot leak into the top-level session list.
   */
  async _materializeRestoredPeerChat(session, chat, providerData) {
    const chatKey = chat.toString();
    const agent = this._providerService.getProviderForSession(session);
    if (!agent) {
      throw new Error(`No agent provider for restored peer chat: ${chatKey}`);
    }
    try {
      const result = await agent.materializeChat(chat, this._chatContext(session, chat), providerData);
      if (result?.backingSession) {
        await this._markChatBacking(result.backingSession, chat);
      }
      const turns = await this._getChatMessages(agent, chat, session);
      return { turns: await this._interleaveLocalTurns(session.toString(), chatKey, turns) };
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to materialize peer chat ${chatKey}: ${toErrorMessage(err)}`);
      throw err;
    }
  }
  /**
   * Re-persists a peer chat's opaque `providerData` blob when the agent
   * reports it changed (e.g. per-chat model switch or fork remap).
   */
  _onChatDataChanged(e) {
    const sessionStr = parseDefaultChatUri(e.chat);
    if (sessionStr === void 0) {
      this._logService.warn(`[AgentService] onDidChangeChatData for malformed chat URI: ${e.chat.toString()}`);
      return;
    }
    if (isDefaultChatUri(e.chat)) {
      void this._persistDefaultChatBacking({ session: URI.parse(sessionStr), chat: e }).catch((err) => this._logService.error(err, `[AgentService] Failed to persist default-chat backing for ${e.chat.toString()}`));
      return;
    }
    const session = this._stateManager.getSessionState(sessionStr);
    if (this._disposingPeerChats.has(e.chat.toString()) || !session?.chats.some((chat) => chat.resource.toString() === e.chat.toString())) {
      return;
    }
    this._stateManager.updateChatProviderData(e.chat.toString(), e.providerData);
    void this._persistPeerChat(URI.parse(sessionStr), e.chat, e.providerData).catch((err) => this._logService.error(err, `[AgentService] Failed to persist peer-chat backing for ${e.chat.toString()}`));
  }
  /**
   * Keeps agent-spawned chats in the catalog early enough for their first turn:
   * a `subagent_started` progress signal feeds the same handler as
   * {@link IAgent.onDidSpawnChat}. Completion is ignored here because spawned
   * chats stay live until session teardown, and overlap with the agent's own
   * spawn bridge is safe because `addChat` is idempotent.
   */
  _sequenceSpawnedChat(signal) {
    const spawn6 = SubagentChatSignal.toSpawnEvent(signal);
    if (spawn6) {
      this._onChatSpawned(spawn6);
    }
  }
  /** Marks a subagent chat as pending once its confirmed tool call reaches (or is about to reach) `Running`. */
  _trackPendingSubagentChatFromEnvelope(envelope) {
    const { channel, action } = envelope;
    if (action.type === "chat/toolCallStart" /* ChatToolCallStart */ || action.type === "chat/toolCallDelta" /* ChatToolCallDelta */ || action.type === "chat/toolCallReady" /* ChatToolCallReady */) {
      const key = `${channel}:${action.toolCallId}`;
      const subagentChatUri = readToolCallMeta(action).subagentChatUri ?? this._pendingSubagentToolCalls.get(key);
      if (subagentChatUri === void 0) {
        return;
      }
      if (action.type === "chat/toolCallReady" /* ChatToolCallReady */ && action.confirmed) {
        this._pendingSubagentToolCalls.delete(key);
        this._armPendingSubagentChat(subagentChatUri);
        return;
      }
      this._pendingSubagentToolCalls.set(key, subagentChatUri);
      return;
    }
    if (action.type === "chat/toolCallConfirmed" /* ChatToolCallConfirmed */) {
      const key = `${channel}:${action.toolCallId}`;
      const subagentChatUri = this._pendingSubagentToolCalls.get(key);
      if (subagentChatUri === void 0) {
        return;
      }
      this._pendingSubagentToolCalls.delete(key);
      if (action.approved) {
        this._armPendingSubagentChat(subagentChatUri);
      }
      return;
    }
    if (action.type === "chat/toolCallComplete" /* ChatToolCallComplete */) {
      this._pendingSubagentToolCalls.delete(`${channel}:${action.toolCallId}`);
    }
  }
  _armPendingSubagentChat(subagentChatUri) {
    if (this._pendingSubagentChats.has(subagentChatUri) || this._stateManager.getSnapshot(subagentChatUri)) {
      return;
    }
    const deferred = new DeferredPromise();
    this._pendingSubagentChats.set(subagentChatUri, deferred);
    this._pendingSubagentChatTimeouts.set(subagentChatUri, disposableTimeout(() => {
      this._pendingSubagentChats.delete(subagentChatUri);
      this._pendingSubagentChatTimeouts.deleteAndDispose(subagentChatUri);
      deferred.complete();
    }, SUBAGENT_CHAT_PENDING_TIMEOUT_MS));
  }
  _resolvePendingSubagentChat(resource) {
    const deferred = this._pendingSubagentChats.get(resource);
    if (!deferred) {
      return;
    }
    this._pendingSubagentChats.delete(resource);
    this._pendingSubagentChatTimeouts.deleteAndDispose(resource);
    deferred.complete();
  }
  /**
   * Routes an agent-spawned chat (e.g. a sub-agent delegated by a tool
   * call) straight into the chat catalog via {@link IAgentHostStateManager.addChat},
   * so harness-spawned chats and user-driven chats share ONE membership path.
   * The {@link IAgentSpawnChatEvent.parent} spawn edge is recorded as
   * the chat's {@link ChatOriginKind.Tool} origin. Spawned chats are
   * not written to the orchestrator's persisted peer-chat catalog — they are
   * transient children re-derived from the parent's event log on restore.
   */
  _onChatSpawned(e) {
    this._stateManager.addChat(e.session.toString(), e.chat.toString(), {
      ...e.title !== void 0 ? { title: e.title } : {},
      ...e.parent ? {
        origin: { kind: "tool" /* Tool */, chat: e.parent.chat.toString(), toolCallId: e.parent.toolCallId },
        // Subagent worker chats are observable but not directly steerable:
        // the user watches them and steers the lead chat. Mark read-only so
        // the UI hides the composer and shows a lock (the agent-team pattern).
        interactivity: "read-only" /* ReadOnly */
      } : {}
    });
    this._resolvePendingSubagentChat(e.chat.toString());
  }
  /**
   * Persists a freshly-created (or recovered) default chat's durable state:
   * its opaque `providerData` blob and, separately, its backing-session
   * marker. The two writes are independent — a failure persisting
   * `providerData` must not skip marking the backing
   * session, since that marker is what keeps the backing session out of the
   * top-level list; `_markChatBacking` has its own retry/suppression and
   * never throws. The provider-data failure is rethrown after the marker
   * attempt so creation can roll back instead of reporting a session whose
   * concrete backing cannot be restored.
   */
  async _persistDefaultChatBacking(created) {
    const providerData = created.chat?.providerData;
    let providerDataError;
    if (providerData !== void 0) {
      const ref = this._sessionDataService.openDatabase(created.session);
      try {
        await ref.object.setMetadata(DEFAULT_CHAT_PROVIDER_DATA_METADATA_KEY, providerData);
      } catch (err) {
        this._logService.warn(`[AgentService] failed to persist default-chat provider data for ${created.session.toString()}`, err);
        providerDataError = err instanceof Error ? err : new Error(String(err));
      } finally {
        ref.dispose();
      }
    }
    if (created.chat?.backingSession) {
      await this._markChatBacking(created.chat.backingSession, URI.parse(buildDefaultChatUri(created.session)));
    }
    if (providerDataError) {
      throw providerDataError;
    }
  }
  async _readDefaultChatProviderData(session) {
    const ref = await this._sessionDataService.tryOpenDatabase?.(session);
    if (!ref) {
      return void 0;
    }
    try {
      return await ref.object.getMetadata(DEFAULT_CHAT_PROVIDER_DATA_METADATA_KEY);
    } finally {
      ref.dispose();
    }
  }
  /**
   * Reads the orchestrator's persisted peer-chat catalog for a session.
   * Returns `undefined` when the session has no catalog yet (a legacy session
   * predating orchestrator-owned persistence, or a corrupt blob); the caller
   * then performs a one-time migration from the agent's legacy `*.chats`
   * enumeration (see {@link _restorePeerChats} / {@link _migrateLegacyPeerChats}).
   * An empty array means the session is known to have no peer chats, so
   * migration is skipped.
   */
  async _readPersistedPeerChatCatalog(session) {
    const ref = await this._sessionDataService.tryOpenDatabase?.(session);
    if (!ref) {
      return void 0;
    }
    try {
      const raw = await ref.object.getMetadata(PEER_CHATS_METADATA_KEY);
      if (raw === void 0) {
        return void 0;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this._logService.warn(`[AgentService] Ignoring malformed peer-chat catalog for ${session.toString()}`);
        return void 0;
      }
      return parsed.filter((entry) => typeof entry?.uri === "string").map((entry) => ({
        uri: entry.uri,
        ...typeof entry.providerData === "string" ? { providerData: entry.providerData } : {},
        ...entry.origin !== void 0 ? { origin: entry.origin } : {},
        ...typeof entry.inheritedTurnId === "string" ? { inheritedTurnId: entry.inheritedTurnId } : {}
      }));
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to read peer-chat catalog for ${session.toString()}: ${toErrorMessage(err)}`);
      return void 0;
    } finally {
      ref.dispose();
    }
  }
  /**
   * Marks a chat's backing SDK session so legacy discovery cannot register
   * it as a standalone top-level session. Best-effort and never throws:
   * callers (chat creation / restore) must not fail just because this
   * durable write did. The write is retried once; if it still fails, the
   * backing session is added to `_unpersistedChatBackings` so
   * `_isChatBacking` (external discovery) and `listSessions`'s overlay filter keep
   * suppressing it for the rest of this process's lifetime even without a
   * persisted marker. A later successful call for the same session (e.g. a
   * retried caller) clears any stale suppression entry.
   */
  async _markChatBacking(backingSession, chat) {
    const backingSessionStr = backingSession.toString();
    const write2 = async () => {
      const ref = this._sessionDataService.openDatabase(backingSession);
      try {
        await ref.object.setMetadata(CHAT_BACKING_METADATA_KEY, chat.toString());
      } finally {
        ref.dispose();
      }
    };
    try {
      await write2();
      this._unpersistedChatBackings.delete(backingSessionStr);
    } catch (err) {
      this._logService.warn(`[AgentService] failed to mark backing session ${backingSessionStr} for chat ${chat.toString()}, retrying`, err);
      try {
        await write2();
        this._unpersistedChatBackings.delete(backingSessionStr);
      } catch (retryErr) {
        this._logService.warn(`[AgentService] retry failed to mark backing session ${backingSessionStr} for chat ${chat.toString()}; suppressing it in-process instead`, retryErr);
        this._unpersistedChatBackings.add(backingSessionStr);
      }
    }
  }
  /**
   * Inserts or updates a single peer chat in the orchestrator's persisted
   * catalog, recording its opaque `providerData` verbatim (or clearing it when
   * `undefined`). When `origin` is supplied it is stored as the chat's
   * provenance; when omitted (e.g. a provider-driven `providerData` refresh via
   * {@link _onChatDataChanged}) any previously persisted origin is preserved so
   * a data refresh never drops a side chat's source boundary. Serialized per
   * session via {@link _enqueuePeerChatCatalogWrite}.
   */
  _persistPeerChat(session, chat, providerData, origin, inheritedTurnId) {
    const chatUri = chat.toString();
    return this._enqueuePeerChatCatalogWrite(session, (entries) => {
      const existing = entries.find((entry) => entry.uri === chatUri);
      const effectiveOrigin = origin ?? existing?.origin;
      const effectiveInheritedTurnId = inheritedTurnId ?? existing?.inheritedTurnId;
      const next = entries.filter((entry) => entry.uri !== chatUri);
      next.push({
        uri: chatUri,
        ...providerData !== void 0 ? { providerData } : {},
        ...effectiveOrigin !== void 0 ? { origin: effectiveOrigin } : {},
        ...effectiveInheritedTurnId !== void 0 ? { inheritedTurnId: effectiveInheritedTurnId } : {}
      });
      return next;
    });
  }
  /**
   * Removes a peer chat from the orchestrator's persisted catalog. Serialized
   * per session via {@link _enqueuePeerChatCatalogWrite}.
   */
  _removePersistedPeerChat(session, chat) {
    const chatUri = chat.toString();
    return this._enqueuePeerChatCatalogWrite(session, (entries) => entries.filter((entry) => entry.uri !== chatUri));
  }
  /**
   * Chains a read-modify-write of a session's persisted peer-chat catalog
   * behind any in-flight write for the same session, so concurrent
   * create/dispose/data-change updates can't clobber each other.
   */
  _enqueuePeerChatCatalogWrite(session, mutate) {
    const key = session.toString();
    const previous = this._peerChatCatalogWrites.get(key) ?? Promise.resolve();
    const next = previous.catch(() => {
    }).then(() => this._applyPeerChatCatalogWrite(session, mutate));
    const clear = () => {
      if (this._peerChatCatalogWrites.get(key) === tracked) {
        this._peerChatCatalogWrites.delete(key);
      }
    };
    const tracked = next.then(clear, (error) => {
      clear();
      throw error;
    });
    this._peerChatCatalogWrites.set(key, tracked);
    return tracked;
  }
  async _applyPeerChatCatalogWrite(session, mutate) {
    const ref = this._sessionDataService.openDatabase(session);
    try {
      let current = [];
      try {
        const raw = await ref.object.getMetadata(PEER_CHATS_METADATA_KEY);
        if (raw !== void 0) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            current = parsed.filter((entry) => typeof entry?.uri === "string").map((entry) => ({
              uri: entry.uri,
              ...typeof entry.providerData === "string" ? { providerData: entry.providerData } : {},
              ...entry.origin !== void 0 ? { origin: entry.origin } : {},
              ...typeof entry.inheritedTurnId === "string" ? { inheritedTurnId: entry.inheritedTurnId } : {}
            }));
          }
        }
      } catch (err) {
        this._logService.warn(`[AgentService] Replacing malformed peer-chat catalog for ${session.toString()}: ${toErrorMessage(err)}`);
      }
      const updated = mutate(current);
      await ref.object.setMetadata(PEER_CHATS_METADATA_KEY, JSON.stringify(updated));
    } finally {
      ref.dispose();
    }
  }
  async _getSessionMetadataForRestore(agent, session, external) {
    const sessionStr = session.toString();
    const chat = URI.parse(buildDefaultChatUri(session));
    try {
      const metadata = await agent.getChatMetadata(chat, this._chatContext(session, chat), await this._readDefaultChatProviderData(session), { activation: "restore" });
      return await this._withWorktreeProject(session, metadata ? this._toSessionMetadata(metadata) : void 0);
    } catch (err) {
      if (err instanceof ProtocolError) {
        throw err;
      }
      try {
        return await this._withWorktreeProject(session, await this._getSessionMetadataFromCatalog(agent, session, external));
      } catch (fallbackErr) {
        if (fallbackErr instanceof ProtocolError) {
          const message = err instanceof Error ? err.message : String(err);
          throw new ProtocolError(fallbackErr.code, `Failed to get chat metadata for ${sessionStr}: ${message}; ${fallbackErr.message}`, fallbackErr.data);
        }
        throw fallbackErr;
      }
    }
  }
  /**
   * Merges the repository project for a worktree-isolated session onto its
   * restored metadata so the session groups under the repository (not the
   * `<repo>.worktrees/<name>` directory) in the sessions UI. No-op for folder
   * sessions and for `undefined` metadata. Host-owned so agents stay unaware.
   */
  async _withWorktreeProject(session, meta) {
    if (!meta) {
      return meta;
    }
    const project = await this._worktree.resolveWorktreeProject(session);
    return project ? { ...meta, project } : meta;
  }
  async _getSessionMetadataFromCatalog(agent, session, external) {
    const sessionStr = session.toString();
    let allSessions;
    try {
      if (external) {
        return void 0;
      }
      allSessions = await this._enumerateLegacyProviderSessions(agent);
    } catch (err) {
      if (err instanceof ProtocolError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ProtocolError(JSON_RPC_INTERNAL_ERROR, `Failed to list sessions for ${sessionStr}: ${message}`);
    }
    return allSessions === AgentChatMigrationDeferred ? void 0 : allSessions?.find((candidate) => candidate.session.toString() === sessionStr);
  }
  async resourceRead(uri, encoding = "utf-8" /* Utf8 */) {
    const editAttributionRequest = parseEditAttributionResource(uri);
    if (editAttributionRequest?.kind === "prepare") {
      const prepared = await this.prepareEditAttributionFlush(editAttributionRequest.params);
      return {
        data: JSON.stringify(prepared ?? null),
        encoding: "utf-8" /* Utf8 */,
        contentType: "application/json"
      };
    }
    if (editAttributionRequest?.kind === "commit") {
      const result = await this.commitEditAttributionFlush(editAttributionRequest.params);
      return {
        data: JSON.stringify(result),
        encoding: "utf-8" /* Utf8 */,
        contentType: "application/json"
      };
    }
    if (editAttributionRequest?.kind === "cancel") {
      const result = await this.cancelEditAttributionFlush(editAttributionRequest.params);
      return {
        data: JSON.stringify(result),
        encoding: "utf-8" /* Utf8 */,
        contentType: "application/json"
      };
    }
    const dbFields = parseSessionDbUri(uri.toString());
    if (dbFields) {
      return this._fetchSessionDbContent(dbFields);
    }
    const blobFields = parseGitBlobUri(uri.toString());
    if (blobFields) {
      return this._fetchGitBlobContent(blobFields);
    }
    try {
      const content = await this._fileService.readFile(uri);
      return {
        data: encoding === "base64" /* Base64 */ ? encodeBase64(content.value) : content.value.toString(),
        encoding,
        contentType: getMediaOrTextMime(uri.path) ?? "application/octet-stream"
      };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      const result = toFileOperationResult(error);
      if (result === 1 /* FILE_NOT_FOUND */) {
        throw new ProtocolError(AhpErrorCodes.NotFound, `Content not found: ${uri.toString()}`);
      }
      if (result === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${uri.toString()}`);
      }
      throw new ProtocolError(JSON_RPC_INTERNAL_ERROR, `Failed to read content: ${uri.toString()}: ${toErrorMessage(error)}`);
    }
  }
  prepareEditAttributionFlush(params) {
    return this._editAttributionService.prepareFlush(params);
  }
  commitEditAttributionFlush(params) {
    return this._editAttributionService.commitFlush(params);
  }
  cancelEditAttributionFlush(params) {
    return this._editAttributionService.cancelFlush(params);
  }
  async resourceWrite(params) {
    const fileUri = typeof params.uri === "string" ? URI.parse(params.uri) : URI.revive(params.uri);
    try {
      const parent = await this._fileService.stat(dirname2(fileUri));
      if (!parent.isDirectory) {
        throw new ProtocolError(AhpErrorCodes.NotFound, `Parent directory not found: ${fileUri.toString()}`);
      }
    } catch (e) {
      if (e instanceof ProtocolError) {
        throw e;
      }
      const result = toFileOperationResult(e);
      if (result === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${fileUri.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Parent directory not found: ${fileUri.toString()}`);
    }
    let content;
    if (params.encoding === "base64" /* Base64 */) {
      content = decodeBase64(params.data);
    } else {
      content = VSBuffer.fromString(params.data);
    }
    const mode = params.mode ?? "truncate" /* Truncate */;
    const position = params.position ?? 0;
    try {
      await this._resourceWriteQueue.queueFor(fileUri, async () => {
        if (params.ifMatch !== void 0 || mode !== "truncate" /* Truncate */ || position !== 0) {
          await this._resourceWriteWithMode(fileUri, content, mode, position, params);
        } else if (params.createOnly) {
          await this._createFileExclusive(fileUri, content);
        } else {
          await this._fileService.writeFile(fileUri, content);
        }
      }, extUriBiasedIgnorePathCase);
      return {};
    } catch (e) {
      if (e instanceof ProtocolError) {
        throw e;
      }
      const result = toFileOperationResult(e);
      if (params.createOnly && (result === 3 /* FILE_MODIFIED_SINCE */ || result === 4 /* FILE_MOVE_CONFLICT */)) {
        throw new ProtocolError(AhpErrorCodes.AlreadyExists, `File already exists: ${fileUri.toString()}`);
      }
      if (result === 3 /* FILE_MODIFIED_SINCE */) {
        const message = params.ifMatch !== void 0 ? `ifMatch precondition failed for: ${fileUri.toString()}` : `File changed while writing: ${fileUri.toString()}`;
        throw new ProtocolError(AhpErrorCodes.Conflict, message);
      }
      if (result === 4 /* FILE_MOVE_CONFLICT */) {
        throw new ProtocolError(AhpErrorCodes.AlreadyExists, `File already exists: ${fileUri.toString()}`);
      }
      if (result === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${fileUri.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Failed to write file: ${fileUri.toString()}`);
    }
  }
  async _createFileExclusive(fileUri, content) {
    if (fileUri.scheme !== Schemas.file) {
      await this._fileService.createFile(fileUri, content, { overwrite: false });
      return;
    }
    let handle;
    try {
      handle = await open3(fileUri.fsPath, "wx");
    } catch (error) {
      if (isErrorWithCode(error, "EEXIST")) {
        throw new ProtocolError(AhpErrorCodes.AlreadyExists, `File already exists: ${fileUri.toString()}`);
      }
      throw error;
    }
    let failure;
    try {
      await handle.writeFile(content.buffer);
    } catch (error) {
      failure = error;
    }
    try {
      await handle.close();
    } catch (error) {
      failure = failure ? new AggregateError([failure, error]) : error;
    }
    if (failure) {
      try {
        await unlink(fileUri.fsPath);
      } catch (cleanupError) {
        throw new AggregateError([failure, cleanupError], `Failed to create and clean up file: ${fileUri.toString()}`);
      }
      throw failure;
    }
  }
  /**
   * Slow-path for {@link resourceWrite} when the caller requested a
   * non-default {@link ResourceWriteMode}, supplied a `position`, or
   * provided an `ifMatch` etag precondition. Reads the current file
   * contents (when needed) and produces a single `writeFile` call that
   * realises the requested splice. A missing file is treated as
   * empty for `append` and `insert` (so the operation behaves like a
   * create); for `truncate` it falls through to a normal write.
   */
  async _resourceWriteWithMode(fileUri, data, mode, position, params) {
    let existing;
    let currentEtag;
    let currentMtime;
    try {
      const file = await this._fileService.readFile(fileUri);
      existing = file.value;
      currentEtag = file.etag;
      currentMtime = file.mtime;
    } catch (e) {
      if (toFileOperationResult(e) !== 1 /* FILE_NOT_FOUND */) {
        throw e;
      }
    }
    if (params.createOnly && existing !== void 0) {
      throw new ProtocolError(AhpErrorCodes.AlreadyExists, `File already exists: ${fileUri.toString()}`);
    }
    if (params.ifMatch !== void 0) {
      if (existing === void 0 || currentEtag !== params.ifMatch) {
        throw new ProtocolError(AhpErrorCodes.Conflict, `ifMatch precondition failed for: ${fileUri.toString()}`);
      }
    }
    const base = existing ?? VSBuffer.alloc(0);
    let next;
    switch (mode) {
      case "append" /* Append */: {
        const eof = base.byteLength;
        const splitAt = Math.max(0, eof - position);
        next = VSBuffer.concat([base.slice(0, splitAt), data, base.slice(splitAt, eof)]);
        break;
      }
      case "insert" /* Insert */: {
        const splitAt = Math.min(position, base.byteLength);
        next = VSBuffer.concat([base.slice(0, splitAt), data, base.slice(splitAt, base.byteLength)]);
        break;
      }
      case "truncate" /* Truncate */:
      default: {
        const splitAt = Math.min(position, base.byteLength);
        next = VSBuffer.concat([base.slice(0, splitAt), data]);
        break;
      }
    }
    if (params.createOnly) {
      await this._createFileExclusive(fileUri, next);
    } else {
      await this._fileService.writeFile(fileUri, next, { etag: currentEtag, mtime: currentMtime });
    }
  }
  async resourceCopy(params) {
    const source = URI.parse(params.source);
    const destination = URI.parse(params.destination);
    try {
      await this._fileService.copy(source, destination, !params.failIfExists);
      return {};
    } catch (e) {
      const result = toFileOperationResult(e);
      if (result === 4 /* FILE_MOVE_CONFLICT */) {
        throw new ProtocolError(AhpErrorCodes.AlreadyExists, `Destination already exists: ${destination.toString()}`);
      }
      if (result === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${source.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Source not found: ${source.toString()}`);
    }
  }
  async resourceDelete(params) {
    const fileUri = URI.parse(params.uri);
    try {
      await this._fileService.del(fileUri, { recursive: params.recursive });
      return {};
    } catch (e) {
      if (toFileOperationResult(e) === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${fileUri.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Resource not found: ${fileUri.toString()}`);
    }
  }
  async resourceMove(params) {
    const source = URI.parse(params.source);
    const destination = URI.parse(params.destination);
    try {
      await this._fileService.move(source, destination, !params.failIfExists);
      return {};
    } catch (e) {
      const result = toFileOperationResult(e);
      if (result === 4 /* FILE_MOVE_CONFLICT */) {
        throw new ProtocolError(AhpErrorCodes.AlreadyExists, `Destination already exists: ${destination.toString()}`);
      }
      if (result === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${source.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Source not found: ${source.toString()}`);
    }
  }
  async resourceResolve(params) {
    const uri = typeof params.uri === "string" ? URI.parse(params.uri) : URI.revive(params.uri);
    try {
      const stat3 = await this._fileService.stat(uri);
      let type;
      if (stat3.isSymbolicLink && params.followSymlinks === false) {
        type = "symlink" /* Symlink */;
      } else if (stat3.isDirectory) {
        type = "directory" /* Directory */;
      } else {
        type = "file" /* File */;
      }
      const result = {
        uri: uri.toString(),
        type,
        ...stat3.size !== void 0 ? { size: stat3.size } : {},
        ...stat3.mtime !== void 0 ? { mtime: new Date(stat3.mtime).toISOString() } : {},
        ...stat3.ctime !== void 0 ? { ctime: new Date(stat3.ctime).toISOString() } : {},
        ...stat3.etag ? { etag: stat3.etag } : {}
      };
      return result;
    } catch (e) {
      if (toFileOperationResult(e) === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${uri.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Resource not found: ${uri.toString()}`);
    }
  }
  async resourceMkdir(params) {
    const uri = typeof params.uri === "string" ? URI.parse(params.uri) : URI.revive(params.uri);
    try {
      const existing = await this._fileService.stat(uri).catch(() => void 0);
      if (existing && !existing.isDirectory) {
        throw new ProtocolError(AhpErrorCodes.AlreadyExists, `Path exists and is not a directory: ${uri.toString()}`);
      }
      await this._fileService.createFolder(uri);
      return {};
    } catch (e) {
      if (e instanceof ProtocolError) {
        throw e;
      }
      if (toFileOperationResult(e) === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${uri.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Failed to create directory: ${uri.toString()}`);
    }
  }
  async createResourceWatch(params) {
    const root = typeof params.uri === "string" ? URI.parse(params.uri) : URI.revive(params.uri);
    try {
      await this._fileService.stat(root);
    } catch (e) {
      if (toFileOperationResult(e) === 6 /* FILE_PERMISSION_DENIED */) {
        throw new ProtocolError(AhpErrorCodes.PermissionDenied, `Permission denied: ${root.toString()}`);
      }
      throw new ProtocolError(AhpErrorCodes.NotFound, `Resource not found: ${root.toString()}`);
    }
    const channel = buildResourceWatchChannelUri({
      root: root.toString(),
      recursive: params.recursive === true,
      excludes: params.excludes,
      includes: params.includes
    });
    return { channel };
  }
  /**
   * Notifies the agent service that a client subscribed to a resource
   * watch channel. On the first subscriber the underlying
   * {@link IFileService} watcher is attached; subsequent subscribers
   * bump the refcount and cancel any pending grace dispose. Returns
   * the decoded descriptor for use as the subscribe snapshot, or
   * `undefined` when `channel` is not a recognisable
   * `ahp-resource-watch:` URI.
   */
  onResourceWatchSubscribed(channel) {
    const descriptor = parseResourceWatchChannelUri(channel);
    if (!descriptor) {
      return void 0;
    }
    const existing = this._resourceWatches.get(channel);
    if (existing) {
      existing.subscribers++;
      if (existing.pendingGc) {
        existing.pendingGc.clear();
      }
      return existing.descriptor;
    }
    const disposables = new DisposableStore();
    try {
      const root = URI.parse(descriptor.root);
      const watchOptions = {
        recursive: descriptor.recursive,
        excludes: descriptor.excludes?.items ?? [],
        includes: descriptor.includes?.items
      };
      if (descriptor.recursive) {
        disposables.add(this._fileService.watch(root, watchOptions));
        disposables.add(this._fileService.onDidFilesChange((event) => {
          const filtered = collectChangesUnderRoot(event, root);
          if (filtered.length > 0) {
            this._dispatchResourceWatchChanges(channel, filtered);
          }
        }));
      } else {
        const watcher = this._fileService.createWatcher(root, { ...watchOptions, recursive: false });
        disposables.add(watcher);
        disposables.add(watcher.onDidChange((event) => {
          this._dispatchResourceWatchChanges(channel, collectChanges(event));
        }));
      }
    } catch (e) {
      disposables.dispose();
      this._logService.warn(`[AgentService] Failed to start IFileService watcher for ${channel}: ${e instanceof Error ? e.message : String(e)}`);
      return void 0;
    }
    this._resourceWatches.set(channel, {
      channel,
      descriptor,
      subscribers: 1,
      disposables,
      pendingGc: disposables.add(new MutableDisposable()),
      dispose: () => disposables.dispose()
    });
    return descriptor;
  }
  /**
   * Counterpart to {@link onResourceWatchSubscribed}. Decrements the
   * subscriber refcount for a watch channel; when it reaches zero the
   * watcher is held for {@link RESOURCE_WATCH_GRACE_MS} before being
   * disposed, giving a transient disconnect time to resubscribe.
   */
  onResourceWatchUnsubscribed(channel) {
    const entry = this._resourceWatches.get(channel);
    if (!entry) {
      return false;
    }
    entry.subscribers = Math.max(0, entry.subscribers - 1);
    if (entry.subscribers > 0) {
      return true;
    }
    entry.pendingGc.value = disposableTimeout(() => {
      const current = this._resourceWatches.get(channel);
      if (!current || current.subscribers > 0) {
        return;
      }
      this._resourceWatches.deleteAndDispose(channel);
    }, RESOURCE_WATCH_GRACE_MS);
    return true;
  }
  _dispatchResourceWatchChanges(channel, raw) {
    if (raw.length === 0) {
      return;
    }
    const items = raw.map((c) => ({
      uri: c.resource.toString(),
      type: c.type === 1 /* ADDED */ ? "added" /* Added */ : c.type === 2 /* DELETED */ ? "deleted" /* Deleted */ : "updated" /* Updated */
    }));
    this._stateManager.dispatchServerAction(channel, {
      type: "resourceWatch/changed" /* ResourceWatchChanged */,
      changes: { items }
    });
  }
  async shutdown() {
    this._logService.info("AgentService: shutting down all providers...");
    try {
      await this._providerService.shutdown();
    } finally {
      await this._debugLogsCollector?.cleanup();
      await this._orchestratorDatabase.close();
      this._downloadProgressInterest.clear();
    }
  }
  async getNetworkDiagnosticsInfo() {
    const { endpoints, account } = await this._providerService.getNetworkDiagnostics();
    return this._networkDiagnostics.getInfo(endpoints, account);
  }
  async getManagedSettingsDiagnostics() {
    return this._providerService.getManagedSettingsDiagnostics();
  }
  async diagnosticsFetch(url2) {
    return this._networkDiagnostics.fetch(url2);
  }
  async getSessionStateFile(session, chat) {
    return this._providerService.getProviderForSession(session)?.getSessionStateFile?.(session, chat);
  }
  async collectDebugLogs(session, kind, chat) {
    if (!this._debugLogsCollector) {
      throw new Error("Agent Host debug log collection is unavailable");
    }
    const providers = session ? [this._providerService.getProviderForSession(session)].filter((provider) => provider !== void 0) : this._providerService.getProviders();
    if (providers.length === 0) {
      throw new Error(session ? `No Agent Host provider is available for session ${session.toString()}` : "No Agent Host providers are available for debug-log collection");
    }
    return this._debugLogsCollector.collect(providers, session, kind, chat);
  }
  async readDebugLogsChunk(resource, position) {
    if (!this._debugLogsCollector) {
      throw new Error("Agent Host debug log collection is unavailable");
    }
    return this._debugLogsCollector.readArtifactChunk(resource, position);
  }
  // ---- helpers ------------------------------------------------------------
  async _fetchSessionDbContent(fields) {
    const sessionUri = URI.parse(fields.sessionUri);
    const ref = this._sessionDataService.openDatabase(sessionUri);
    try {
      const content = await ref.object.readFileEditContent(fields.toolCallId, fields.filePath);
      if (!content) {
        throw new ProtocolError(AhpErrorCodes.NotFound, `File edit not found: toolCallId=${fields.toolCallId}, filePath=${fields.filePath}`);
      }
      const bytes = fields.part === "before" ? content.beforeContent : content.afterContent;
      if (!bytes) {
        throw new ProtocolError(AhpErrorCodes.NotFound, `No ${fields.part} content for: toolCallId=${fields.toolCallId}, filePath=${fields.filePath}`);
      }
      return {
        data: new TextDecoder().decode(bytes),
        encoding: "utf-8" /* Utf8 */,
        contentType: "text/plain"
      };
    } finally {
      ref.dispose();
    }
  }
  async _fetchGitBlobContent(fields) {
    if (!this._gitService) {
      throw new ProtocolError(AhpErrorCodes.NotFound, `git service unavailable for: ${fields.repoRelativePath}`);
    }
    const owningSession = resolveAgentHostSession(URI.parse(fields.sessionUri));
    const wasRestored = !!this._stateManager.getSessionState(owningSession.toString());
    try {
      if (!wasRestored) {
        await this.restoreSession(owningSession);
      }
      const workingDirectory = await this._resolveGitBlobWorkingDirectory(fields, owningSession);
      if (!workingDirectory) {
        throw new ProtocolError(AhpErrorCodes.NotFound, `No session repository resolves git-blob path: ${fields.absolutePath || fields.repoRelativePath}`);
      }
      const blob = await this._gitService.showBlob(workingDirectory, fields.sha, fields.repoRelativePath);
      if (!blob) {
        throw new ProtocolError(AhpErrorCodes.NotFound, `git blob not found: ${fields.sha}:${fields.repoRelativePath}`);
      }
      return {
        data: blob.toString(),
        encoding: "utf-8" /* Utf8 */,
        contentType: "text/plain"
      };
    } finally {
      if (!wasRestored && this._stateManager.getSessionState(owningSession.toString()) && !this._subscriptions.hasSessionSubscribers(owningSession)) {
        void this._sessionResidency.reconcile();
      }
    }
  }
  /**
   * Picks the working directory to run `git show` from for a `git-blob:` URI.
   *
   * The directory is chosen only from the session's own, server-trusted working
   * directories — never from anything client-supplied — so opening a diff can
   * never be steered into an arbitrary repository. `fields.absolutePath` (the
   * file's absolute path, carried in the URI) is used only to *select* which
   * repo to run in; it is never used as the cwd itself.
   *
   * Selection rules:
   * - Single-folder session: return the one working directory directly, without
   *   a containment check (preserves legacy behavior for relocated/remapped
   *   worktrees whose stored path no longer sits under the current root).
   * - Multi-root session: resolve each working directory to its repo root and
   *   return the deepest root that contains `absolutePath`; if none contains it,
   *   return `undefined` (→ NotFound) rather than reading from the wrong repo.
   * - Legacy URI with no `absolutePath` (`''`): fall back to the primary
   *   working directory, since there is no path to match.
   *
   * Examples (roots index 0 = primary):
   *   [/work/app]                    + /work/app/src/a.ts   → /work/app
   *   [/work/app]                    + /elsewhere/x.ts      → /work/app
   *   [/work/app, /work/app/pkgs/ui] + /work/app/pkgs/ui/b  → /work/app/pkgs/ui
   *   [/work/app, /work/lib]         + /outside/c.ts        → undefined (NotFound)
   *   [/work/app, /work/lib]         + ''  (legacy)         → /work/app
   */
  async _resolveGitBlobWorkingDirectory(fields, owningSession) {
    const gitService = this._gitService;
    if (!gitService) {
      return void 0;
    }
    const workingDirectories = getEffectiveWorkingDirectories(this._stateManager, fields.sessionUri) ?? getEffectiveWorkingDirectories(this._stateManager, owningSession.toString());
    if (!fields.absolutePath) {
      const primary = workingDirectories?.[0];
      return primary ? URI.parse(primary) : void 0;
    }
    if (!workingDirectories?.length) {
      return void 0;
    }
    if (!isMultiRootSession(workingDirectories)) {
      return URI.parse(workingDirectories[0]);
    }
    const { gitRepositories } = await resolveSessionRepositories(workingDirectories.map((directory) => URI.parse(directory)), gitService);
    if (!gitRepositories.length) {
      return void 0;
    }
    const blobResource = gitRepositories[0].with({ path: fields.absolutePath });
    return findDeepestContainingWorkingDirectory(blobResource, gitRepositories);
  }
  /**
   * Restores a subagent session from its parent session's event history.
   * Loads the parent's raw messages, filters for events belonging to
   * the subagent (by `parentToolCallId`), and builds the child session's
   * turns from those events.
   */
  async _restoreSubagentChat(chatUri, parentSession, toolCallId) {
    if (this._stateManager.getChatState(chatUri)) {
      return;
    }
    const inFlight = this._restoreSubagentInFlight.get(chatUri);
    if (inFlight) {
      return inFlight;
    }
    const restore = this._doRestoreSubagentChat(chatUri, parentSession, toolCallId);
    this._restoreSubagentInFlight.set(chatUri, restore);
    try {
      await restore;
    } finally {
      if (this._restoreSubagentInFlight.get(chatUri) === restore) {
        this._restoreSubagentInFlight.delete(chatUri);
      }
    }
  }
  async _doRestoreSubagentChat(chatUri, parentSession, toolCallId) {
    const parentSessionKey = parentSession.toString();
    try {
      await this._restoreSessionInFlight.get(parentSessionKey);
      if (!this._stateManager.getSessionState(parentSessionKey)) {
        await this.restoreSession(parentSession);
      }
    } catch {
      this._logService.warn(`[AgentService] Cannot restore parent session for subagent chat: ${parentSessionKey}`);
      return;
    }
    const parentState = this._stateManager.getSessionState(parentSessionKey);
    const agent = this._providerService.getProviderForSession(parentSession);
    if (!parentState || !agent) {
      return;
    }
    const spawnPoint = this._findSubagentSpawnPoint(parentSessionKey, chatUri, toolCallId);
    const origin = {
      kind: "tool" /* Tool */,
      chat: spawnPoint?.chat ?? parentState.defaultChat ?? buildDefaultChatUri(parentSession),
      toolCallId
    };
    const childTurns = await this._getChatMessages(agent, URI.parse(chatUri), parentSession, origin);
    if (childTurns.length === 0) {
      return;
    }
    const mergedTurns = await this._interleaveLocalTurns(parentSessionKey, chatUri, childTurns);
    this._stateManager.addChat(parentSessionKey, chatUri, {
      title: spawnPoint?.title ?? "Subagent",
      turns: mergedTurns,
      origin,
      interactivity: "read-only" /* ReadOnly */
    });
  }
  /**
   * Finds the chat whose tool call spawned a subagent and reads the title that
   * tool call reported. It scans every hydrated chat in the parent session so
   * peer-chat and nested-subagent spawns resolve to their real parent; chats
   * without hydrated state are skipped on restore instead of being materialized
   * just to place one spawn edge.
   */
  _findSubagentSpawnPoint(parentSessionKey, subagentChatUri, toolCallId) {
    const parentState = this._stateManager.getSessionState(parentSessionKey);
    if (!parentState) {
      return void 0;
    }
    const defaultChat = parentState.defaultChat ?? buildDefaultChatUri(parentSessionKey);
    const candidates = [
      { chat: defaultChat, turns: parentState.turns, activeTurn: parentState.activeTurn }
    ];
    for (const chat of parentState.chats) {
      if (chat.resource === defaultChat || chat.resource === subagentChatUri) {
        continue;
      }
      const chatState = this._stateManager.getChatState(chat.resource);
      if (chatState) {
        candidates.push({ chat: chat.resource, turns: chatState.turns, activeTurn: chatState.activeTurn });
      }
    }
    for (const candidate of candidates) {
      for (const turn of [...candidate.turns, ...candidate.activeTurn ? [candidate.activeTurn] : []]) {
        for (const part of turn.responseParts) {
          if (part.kind !== "toolCall" /* ToolCall */ || part.toolCall.toolCallId !== toolCallId) {
            continue;
          }
          const content = part.toolCall.status === "completed" /* Completed */ || part.toolCall.status === "running" /* Running */ ? part.toolCall.content : void 0;
          const subagent = content?.find((item) => item.type === "subagent" /* Subagent */);
          return { chat: candidate.chat, ...subagent?.title ? { title: subagent.title } : {} };
        }
      }
    }
    return void 0;
  }
  async _restoreSubagentSession(subagentUri, parentSession) {
    if (this._stateManager.getSessionState(subagentUri)) {
      return;
    }
    const inFlight = this._restoreSubagentInFlight.get(subagentUri);
    if (inFlight) {
      return inFlight;
    }
    const restore = this._doRestoreSubagentSession(subagentUri, parentSession);
    this._restoreSubagentInFlight.set(subagentUri, restore);
    try {
      await restore;
    } finally {
      if (this._restoreSubagentInFlight.get(subagentUri) === restore) {
        this._restoreSubagentInFlight.delete(subagentUri);
      }
    }
  }
  async _doRestoreSubagentSession(subagentUri, parentSession) {
    const parentSessionKey = parentSession.toString();
    if (!this._stateManager.getSessionState(parentSessionKey)) {
      try {
        await this.restoreSession(parentSession);
      } catch {
        this._logService.warn(`[AgentService] Cannot restore parent session for subagent: ${parentSessionKey}`);
        return;
      }
    }
    const parentState = this._stateManager.getSessionState(parentSessionKey);
    if (!parentState) {
      return;
    }
    const allTurns = [...parentState.turns];
    if (parentState.activeTurn) {
      allTurns.push(parentState.activeTurn);
    }
    let subagentContent;
    for (const turn of allTurns) {
      for (const part of turn.responseParts) {
        if (part.kind === "toolCall" /* ToolCall */) {
          const tc = part.toolCall;
          const content = tc.status === "completed" /* Completed */ ? tc.content : tc.status === "running" /* Running */ ? tc.content : void 0;
          if (content) {
            for (const c of content) {
              if (c.type === "subagent" /* Subagent */ && c.resource === subagentUri) {
                subagentContent = c;
                break;
              }
            }
          }
        }
      }
      if (subagentContent) {
        break;
      }
    }
    let childTurns = [];
    const agent = this._providerService.getProviderForSession(parentSession);
    if (agent) {
      try {
        const parsedSubagent = parseSubagentSessionUri(URI.parse(subagentUri));
        const origin = parentState.chats.find((chat) => chat.resource === subagentUri)?.origin ?? (parsedSubagent ? {
          kind: "tool" /* Tool */,
          chat: parentState.defaultChat ?? buildDefaultChatUri(parentSession),
          toolCallId: parsedSubagent.toolCallId
        } : void 0);
        childTurns = await this._getChatMessages(agent, URI.parse(subagentUri), parentSession, origin);
      } catch (err) {
        this._logService.warn(`[AgentService] Failed to load subagent turns for ${subagentUri}`, err);
      }
    }
    const title = subagentContent?.title ?? "Subagent";
    const subagentNow = (/* @__PURE__ */ new Date()).toISOString();
    const mergedChildTurns = await this._interleaveLocalTurns(parentSession.toString(), subagentUri, childTurns);
    this._stateManager.restoreSession(
      {
        resource: subagentUri,
        provider: "subagent",
        title,
        status: 1 /* Idle */,
        createdAt: subagentNow,
        modifiedAt: subagentNow,
        ...parentState?.project ? { project: parentState.project } : {}
      },
      mergedChildTurns
    );
    await this._restoreAnnotations(URI.parse(subagentUri));
    this._logService.info(`[AgentService] Restored subagent session: ${subagentUri} with ${childTurns.length} turn(s)`);
  }
  async _registerRestoredSubagentSummaries(agent, parentSession, turns) {
    const parentSessionStr = parentSession.toString();
    const parentChat = buildDefaultChatUri(parentSession);
    const discovered = /* @__PURE__ */ new Map();
    for (const turn of turns) {
      for (const part of turn.responseParts) {
        if (part.kind !== "toolCall" /* ToolCall */) {
          continue;
        }
        const content = part.toolCall.status === "completed" /* Completed */ || part.toolCall.status === "running" /* Running */ ? part.toolCall.content : void 0;
        const subagent = content?.find((item) => item.type === "subagent" /* Subagent */);
        if (subagent) {
          discovered.set(part.toolCall.toolCallId, {
            title: subagentChatTitle(readToolCallMeta(part.toolCall).subagentDescription, subagent.title),
            toolCallId: part.toolCall.toolCallId
          });
        }
      }
    }
    for (const child of discovered.values()) {
      const chatUri = buildSubagentChatUri(parentSessionStr, child.toolCallId);
      if (this._stateManager.getChatState(chatUri)) {
        continue;
      }
      const origin = { kind: "tool" /* Tool */, chat: parentChat, toolCallId: child.toolCallId };
      const existing = this._stateManager.getSessionState(parentSessionStr)?.chats.find((chat) => chat.resource === chatUri);
      const { title: persistedTitle } = await this._chatContributions.hydrateChat({
        session: parentSessionStr,
        chat: chatUri
      }, {});
      const title = persistedTitle ?? child.title;
      this._stateManager.registerRestoredChatSummary(parentSessionStr, chatUri, {
        title,
        origin,
        interactivity: "read-only" /* ReadOnly */,
        resolver: async () => ({
          turns: [...await this._resolveRestoredSubagentTurns(agent, parentSession, chatUri, origin)]
        })
      });
      if (existing && (!existing.title || existing.title === subagentChatTitle(void 0, void 0))) {
        this._stateManager.updateChatTitle(parentSessionStr, chatUri, title);
      }
    }
  }
  async _resolveRestoredSubagentTurns(agent, parentSession, chatUri, origin) {
    const childTurns = await this._getChatMessages(agent, URI.parse(chatUri), parentSession, origin);
    if (childTurns.length === 0) {
      throw new Error(`Subagent transcript is not available yet: ${chatUri}`);
    }
    return this._interleaveLocalTurns(parentSession.toString(), chatUri, childTurns);
  }
  dispose() {
    this._startupSettled.open();
    super.dispose();
  }
};

AgentService = __decorateClass([
  __decorateParam(3, ILogService),
  __decorateParam(4, IFileService),
  __decorateParam(5, ISessionDataService),
  __decorateParam(6, IAgentHostGitService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IAgentHostSessionOpenTelemetry),
  __decorateParam(9, IAgentHostChatContributions),
  __decorateParam(10, IAgentHostSubscriptionService),
  __decorateParam(11, INetworkDiagnosticsService),
  __decorateParam(12, IAgentEditAttributionService),
  __decorateParam(13, IInstantiationService),
  __decorateParam(14, IAgentHostWorktreeIsolation),
  __decorateParam(15, IAgentHostProviderService),
  __decorateParam(16, IAgentHostStorageService)
], AgentService);

function isErrorWithCode(error, code) {
  return error instanceof Error && hasErrorCode2(error, code);
}

function hasErrorCode2(error, code) {
  return hasKey(error, { code: true }) && error.code === code;
}

function collectChanges(event) {
  const out = [];
  for (const resource of event.rawAdded) {
    out.push({ resource, type: 1 /* ADDED */ });
  }
  for (const resource of event.rawUpdated) {
    out.push({ resource, type: 0 /* UPDATED */ });
  }
  for (const resource of event.rawDeleted) {
    out.push({ resource, type: 2 /* DELETED */ });
  }
  return out;
}

function collectChangesUnderRoot(event, root) {
  const out = [];
  const accept = (resource, type) => {
    if (isEqualOrParent2(resource, root)) {
      out.push({ resource, type });
    }
  };
  for (const resource of event.rawAdded) {
    accept(resource, 1 /* ADDED */);
  }
  for (const resource of event.rawUpdated) {
    accept(resource, 0 /* UPDATED */);
  }
  for (const resource of event.rawDeleted) {
    accept(resource, 2 /* DELETED */);
  }
  return out;
}
export { omitHostOwnedSessionConfig, parsePersistedSourceControlState, isRecord5, isRecentLocalSessionUpdate, isPersistedAnnotationEntry, isPersistedAnnotationOrigin, isPersistedTextRange, readPersistedAnnotation, readPersistedAnnotationsState, reconcileWorkingDirectories, isErrorWithCode, hasErrorCode2, collectChanges, collectChangesUnderRoot, open3, unlink, SESSION_GC_GRACE_MS, DAY_MS, EXTERNAL_SESSION_MAX_AGE_MS, RECENT_EXTERNAL_SESSION_LIMIT, RECENT_LOCAL_SESSION_UPDATE_LIMIT, RECENT_LOCAL_SESSION_UPDATES_STORAGE_KEY, SLOW_LIST_SESSIONS_THRESHOLD_MS, HOST_OWNED_SESSION_CONFIG_KEYS, HOST_WRITTEN_SESSION_CONFIG_KEYS, RESOURCE_WATCH_GRACE_MS, SUBAGENT_CHAT_PENDING_TIMEOUT_MS, PEER_CHATS_METADATA_KEY, ANNOTATIONS_METADATA_KEY, DEFAULT_CHAT_PROVIDER_DATA_METADATA_KEY, CHAT_BACKING_METADATA_KEY, ProviderCatalogUnavailableError, AgentService };
