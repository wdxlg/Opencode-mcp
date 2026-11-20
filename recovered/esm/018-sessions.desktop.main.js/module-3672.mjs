// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/baseAgentHostSessionsProvider.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { DEFAULT_CHAT_ID, ROOT_STATE_URI, SESSION_META_MULTI_ROOT_KEY, buildChatUri, buildDefaultChatUri, getSessionChatResource, getSessionRelatedPullRequestUrls, isDefaultChatUri, isSessionStatusArchived, isSessionStatusRead, parseChatUri, readSessionCreationReference, readSessionEhcliAdoptable, readSessionExternal, readSessionGitHubState, readSessionGitState, readSessionMultiRootMetadata, readSessionSourceControlState, readSessionWorkspaceless, withSessionCreationReference, withSessionExternal, withSessionGitHubState, withSessionMultiRootMetadata, withSessionStatusFlag, withSessionWorkspaceless } from "./module-1008.mjs";
import { URI } from "./module-0032.mjs";
import { getChatPermissionLevelFromDefaultConfiguration, isChatPermissionLevel } from "./module-0965.mjs";
import { arrayEquals, structuralEquals } from "./module-0042.mjs";
import { isEqual2, isEqualOrParent2, relativePath } from "./module-0034.mjs";
import { MarkdownString, markdownStringEqual } from "./module-0462.mjs";
import { parseGitHubIssueUrl } from "./module-3659.mjs";
import { parseGitHubPullRequestUrl } from "./module-3606.mjs";
import { dedupeLinks, getPresentedArtifacts, linkKey, partitionSessionArtifacts } from "./module-3664.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { AgentSession, protectedResourcesRequireGitHubCopilotSignIn } from "./module-1107.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableValue } from "./module-0048.mjs";
import { mapProtocolStatus } from "./module-3666.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { DEFAULT_CHAT_CAPABILITIES, TURN_CHANGES_CHANGESET_ID, effectiveChatInteractivity2, getGitHubPullRequestRefs, getHighestPriorityPullRequestIcon, sessionFileChangesEqual, sessionWorkspaceEqual, toSessionId } from "./module-1767.mjs";
import { subtransaction, transaction } from "./module-0045.mjs";
import { computePullRequestRefPresentation } from "./module-3656.mjs";
import { computePullRequestIcon } from "./module-3594.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { createSessionOutputObs } from "./module-3671.mjs";
import { autorun } from "./module-0052.mjs";
import { equals4 } from "./module-0098.mjs";
import { agentHostSessionWorkspaceKey } from "./module-3661.mjs";
import { createActiveSessionSubscriptionObs, createChangesets, selectMostRecentChatUri } from "./module-3669.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IPullRequestIconCache } from "./module-3657.mjs";
import { generateUuid } from "./module-0190.mjs";
import { disposableTimeout, raceCancellation, raceCancellationError } from "./module-0036.mjs";
import { AgentHostDownloadProgress } from "./module-3660.mjs";
import { isSessionConfigComplete } from "./module-3662.mjs";
import { migrateLegacyAutopilotConfig } from "./module-1741.mjs";
import { KNOWN_MODE_VALUES } from "./module-1740.mjs";
import { readAgentMergeSessionState } from "./module-2466.mjs";
import { waitForState } from "./module-0056.mjs";
import { getRegisteredLanguageModels, resolveConfiguredModel, resolveModelIdentifier, resolveModelIdentifierFromLanguageModels } from "./module-2042.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0968.mjs";
import { getEffectiveAgents } from "./module-1743.mjs";
import { getCustomizationDisabledReason, isCustomizationEnabled, withCustomizationEnablement } from "./module-1742.mjs";
import { buildAnnotationsUri } from "./module-3658.mjs";
import { ChatMode } from "./module-1469.mjs";
import { buildMutableConfigSchema, resolvedConfigsEqual } from "./module-1764.mjs";
import { NotificationType, isChatAction, isSessionAction } from "./module-1744.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentHostActiveClientService } from "./module-1759.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
// OpenCode: old approval policy removed; autoApprove is never policy-restricted
function isAutoApprovePolicyRestricted(_configurationService) {
  return false;
}
function normalizeSessionConfigValue(_property, value2, _policyRestricted) {
  return value2;
}


// src/vs/sessions/contrib/providers/agentHost/browser/baseAgentHostSessionsProvider.ts
var STORAGE_KEY_REMEMBERED_SESSION_CONFIG_VALUES = "sessions.agentHost.sessionConfigPicker.selectedValues";

var UNSAFE_SESSION_CONFIG_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);

var SESSION_CHANGE_NOTIFICATION_DEBOUNCE_MS = 50;

function mergeSessionChangeEvents(events) {
  const changes = /* @__PURE__ */ new Map();
  for (const event of events) {
    for (const session of event.added) {
      changes.set(session.sessionId, { removed: changes.get(session.sessionId)?.removed, added: session });
    }
    for (const session of event.removed) {
      changes.set(session.sessionId, { removed: session });
    }
    for (const session of event.changed) {
      const change = changes.get(session.sessionId);
      if (change?.removed && !change.added) {
        continue;
      }
      if (change?.added) {
        change.added = session;
      } else {
        changes.set(session.sessionId, { changed: session });
      }
    }
  }
  const added = [];
  const removed = [];
  const changed = [];
  for (const change of changes.values()) {
    if (change.added) {
      added.push(change.added);
    }
    if (change.removed) {
      removed.push(change.removed);
    }
    if (change.changed) {
      changed.push(change.changed);
    }
  }
  return {
    added,
    removed,
    changed
  };
}

function debounceSessionChangeEvents(notifications, immediate, disposable) {
  const event = (listener, thisArgs) => {
    const store = new DisposableStore();
    let pending;
    store.add(toDisposable(() => {
      pending?.splice(0);
      pending = void 0;
    }));
    const takePending = (event2) => {
      if (!pending?.length) {
        pending = void 0;
        return event2;
      }
      const events = pending?.splice(0) ?? [];
      pending = void 0;
      if (event2) {
        events.push(event2);
      }
      return mergeSessionChangeEvents(events);
    };
    const debounced = Event2.debounce(notifications, (events, event2) => {
      pending = events ?? [];
      pending.push(event2);
      return pending;
    }, SESSION_CHANGE_NOTIFICATION_DEBOUNCE_MS, false, false, void 0, store);
    const onDebounced = Event2.filter(
      Event2.map(debounced, () => takePending(), store),
      (event2) => event2 !== void 0,
      store
    );
    store.add(Event2.any(onDebounced, Event2.map(immediate, (event2) => takePending(event2) ?? event2, store))(listener, thisArgs));
    return store;
  };
  return Event2.map(event, (event2) => event2, disposable);
}

var SEEDED_CONFIG_SCHEMA_KEYS = ["isolation" /* Isolation */, "branch" /* Branch */];

var ActiveClientSyncCancellationTokenSource = class extends CancellationTokenSource {
  dispose() {
    super.dispose(true);
  }
};

var WORKTREE_ISOLATION_VALUE = "worktree";

function isWorktreeIsolation(values) {
  return values?.["isolation" /* Isolation */] === WORKTREE_ISOLATION_VALUE;
}

var CACHED_SESSIONS_MAX_PER_HOST = 100;

var SESSION_STATUS_FLAG_MASK = 32 /* IsRead */ | 64 /* IsArchived */;

function serializeMetadata(meta) {
  return {
    session: meta.session.toString(),
    startTime: meta.startTime,
    modifiedTime: meta.modifiedTime,
    summary: meta.summary,
    workingDirectory: meta.workingDirectories?.[0]?.toString(),
    status: meta.status !== void 0 ? meta.status & SESSION_STATUS_FLAG_MASK : void 0,
    project: meta.project ? { uri: meta.project.uri.toString(), displayName: meta.project.displayName } : void 0,
    changes: meta.changes,
    github: readSessionGitHubState(meta._meta),
    workspaceless: readSessionWorkspaceless(meta._meta) || void 0,
    external: readSessionExternal(meta._meta) || void 0,
    multiRoot: readSessionMultiRootMetadata(meta._meta),
    createdBySession: readSessionCreationReference(meta._meta)
  };
}

function deserializeMetadata(raw) {
  try {
    let _meta = withSessionWorkspaceless(void 0, raw.workspaceless === true);
    _meta = withSessionExternal(_meta, raw.external === true);
    _meta = withSessionMultiRootMetadata(_meta, readSessionMultiRootMetadata({ [SESSION_META_MULTI_ROOT_KEY]: raw.multiRoot }));
    _meta = withSessionGitHubState(_meta, raw.github);
    if (raw.createdBySession) {
      _meta = withSessionCreationReference(_meta, raw.createdBySession);
    }
    return {
      session: URI.parse(raw.session),
      startTime: raw.startTime,
      modifiedTime: raw.modifiedTime,
      summary: raw.summary,
      workingDirectories: raw.workingDirectory ? [URI.parse(raw.workingDirectory)] : void 0,
      status: deserializeStatus(raw),
      project: raw.project ? { uri: URI.parse(raw.project.uri), displayName: raw.project.displayName } : void 0,
      changes: raw.changes,
      ..._meta ? { _meta } : {}
    };
  } catch {
    return void 0;
  }
}

function deserializeStatus(raw) {
  const legacyArchived = raw.isArchived ?? raw.isDone;
  if (raw.isRead === void 0 && legacyArchived === void 0) {
    return raw.status !== void 0 ? raw.status & SESSION_STATUS_FLAG_MASK : void 0;
  }
  let status2 = (raw.status ?? 1 /* Idle */) & SESSION_STATUS_FLAG_MASK;
  if (raw.isRead !== void 0) {
    status2 = withSessionStatusFlag(status2, 32 /* IsRead */, raw.isRead);
  }
  if (legacyArchived !== void 0) {
    status2 = withSessionStatusFlag(status2, 64 /* IsArchived */, legacyArchived);
  }
  return status2;
}

function isRememberedSessionConfigKey(property) {
  return property !== "branch" /* Branch */ && !UNSAFE_SESSION_CONFIG_KEYS.has(property);
}

function normalizeAutoApproveValue(value2, policyRestricted) {
  const normalized = getChatPermissionLevelFromDefaultConfiguration(value2) ?? (isChatPermissionLevel(value2) ? value2 : void 0);
  if (!normalized) {
    return void 0;
  }
  if (policyRestricted && normalized !== "default" /* Default */) {
    return "default" /* Default */;
  }
  return normalized;
}

function isGitHubInfoEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === void 0 || b === void 0) {
    return false;
  }
  return a.owner === b.owner && a.repo === b.repo && arrayEquals(a.pullRequests ?? [], b.pullRequests ?? [], (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number && isEqual2(x.uri, y.uri) && x.icon?.id === y.icon?.id && x.title === y.title) && a.pullRequest?.number === b.pullRequest?.number && a.pullRequest?.icon?.id === b.pullRequest?.icon?.id && a.pullRequest?.title === b.pullRequest?.title && a.pullRequest?.baseRefOid === b.pullRequest?.baseRefOid && a.pullRequest?.headRefOid === b.pullRequest?.headRefOid && arrayEquals(a.issues ?? [], b.issues ?? [], (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number);
}

function dateEquals(a, b) {
  return a?.getTime() === b?.getTime();
}

function markdownStringEquals(a, b) {
  return a === b || !!a && !!b && markdownStringEqual(a, b);
}

function toGitHubIssueRefs(issueUrls) {
  const refs = [];
  for (const url of issueUrls ?? []) {
    const reference = parseGitHubIssueUrl(url);
    if (reference) {
      refs.push({ ...reference, uri: URI.parse(url) });
    }
  }
  return refs.length > 0 ? refs : void 0;
}

function toGitHubPullRequestRefs(pullRequestUrls, titles) {
  const refs = [];
  for (const url of pullRequestUrls ?? []) {
    const reference = parseGitHubPullRequestUrl(url);
    if (reference) {
      const title = titles.get(linkKey(url));
      refs.push({
        ...reference,
        uri: URI.parse(url),
        ...title ? { title } : {},
        createdByThisSession: true
      });
    }
  }
  return refs.length > 0 ? refs : void 0;
}

function toGitHubPromotion(meta) {
  const state = readSessionGitHubState(meta);
  const gitState = readSessionGitState(meta);
  const { pullRequestUrls, pullRequestTitles, issueUrls } = partitionSessionArtifacts(meta);
  const allPullRequests = toGitHubPullRequestRefs(dedupeLinks(pullRequestUrls, getSessionRelatedPullRequestUrls(state)), pullRequestTitles);
  const repository = state?.owner && state.repo ? { owner: state.owner, repo: state.repo } : gitState?.githubOwner && gitState.githubRepo ? { owner: gitState.githubOwner, repo: gitState.githubRepo } : allPullRequests?.[0];
  if (!repository) {
    return { info: void 0, surfacedLinks: /* @__PURE__ */ new Set() };
  }
  const belongsToRepository = (ref) => ref.owner.toLowerCase() === repository.owner.toLowerCase() && ref.repo.toLowerCase() === repository.repo.toLowerCase();
  const pullRequests = allPullRequests?.filter(belongsToRepository);
  const pullRequest = pullRequests?.at(0);
  const issues = toGitHubIssueRefs(dedupeLinks(issueUrls))?.filter(belongsToRepository);
  const surfacedLinks = /* @__PURE__ */ new Set([
    ...(pullRequests ?? []).map((ref) => linkKey(ref.uri.toString())),
    ...(issues ?? []).map((ref) => linkKey(ref.uri.toString()))
  ]);
  return {
    info: {
      owner: repository.owner,
      repo: repository.repo,
      pullRequests: pullRequests?.length ? pullRequests : void 0,
      pullRequest: pullRequest ? {
        number: pullRequest.number,
        uri: pullRequest.uri
      } : void 0,
      issues: issues?.length ? issues : void 0
    },
    surfacedLinks
  };
}

function toGitHubInfo(meta) {
  return toGitHubPromotion(meta).info;
}

var CopilotCLISessionType = {
  id: "copilotcli",
  label: localize(5009, null),
  icon: Codicon.copilot,
  supportsWorktreeConfiguration: true,
  authRequirement: "github" /* GitHub */
};

function resolveAgentAuthRequirement(agent) {
  if (!agent.protectedResources || protectedResourcesRequireGitHubCopilotSignIn(agent.protectedResources)) {
    return "github" /* GitHub */;
  }
  return agent.models.length > 0 ? "none" /* None */ : "unusable" /* Unusable */;
}

var WorkspaceSessionKind = {
  isQuickChat: false,
  requiresWorkspace: true,
  get untitledTitle() {
    return localize(5014, null);
  },
  computeWorkspace: (buildWorkspace) => buildWorkspace()
};

var QuickChatSessionKind = {
  isQuickChat: true,
  requiresWorkspace: false,
  get untitledTitle() {
    return localize(5013, null);
  },
  computeWorkspace: () => void 0
};

function sessionKind(isQuickChat2) {
  return isQuickChat2 ? QuickChatSessionKind : WorkspaceSessionKind;
}

function toChatInteractivity(interactivity) {
  switch (interactivity) {
    case "read-only" /* ReadOnly */:
      return "read-only" /* ReadOnly */;
    case "hidden" /* Hidden */:
      return "hidden" /* Hidden */;
    default:
      return "full" /* Full */;
  }
}

var AdditionalChat = class extends Disposable {
  constructor(resource, summary, isNew = false, parentChat, sessionIsArchived = constObservable(false), output, sessionIsReadOnly = constObservable(false)) {
    super();
    const modifiedAt = summary.modifiedAt ? new Date(summary.modifiedAt) : /* @__PURE__ */ new Date();
    this._title = observableValue("chatTitle", summary.title || localize(5015, null));
    this._status = observableValue("chatStatus", mapProtocolStatus(summary.status));
    this._updatedAt = observableValueOpts({ owner: this, debugName: "chatUpdatedAt", equalsFn: dateEquals }, modifiedAt);
    this._modelId = observableValue("chatModelId", void 0);
    this._modelSource = observableValue("chatModelSource", void 0);
    this._mode = observableValueOpts({ owner: this, debugName: "chatMode", equalsFn: structuralEquals }, void 0);
    this._description = observableValueOpts({ owner: this, debugName: "chatDescription", equalsFn: markdownStringEquals }, summary.activity ? new MarkdownString().appendText(summary.activity) : void 0);
    this._lastTurnEnd = observableValueOpts({ owner: this, debugName: "chatLastTurnEnd", equalsFn: dateEquals }, modifiedAt);
    this._interactivity = observableValue("chatInteractivity", toChatInteractivity(summary.interactivity));
    this._isNew = observableValue("chatIsNew", isNew);
    this.chat = {
      resource,
      createdAt: modifiedAt,
      title: this._title,
      updatedAt: this._updatedAt,
      status: derived((reader) => this._isNew.read(reader) ? 0 /* Untitled */ : this._status.read(reader)),
      changes: constObservable([]),
      lastTurnChanges: output?.lastTurnChanges,
      customizations: output?.customizations,
      checkpoints: observableValue(this, void 0),
      modelId: this._modelId,
      modelSource: this._modelSource,
      mode: this._mode,
      isArchived: sessionIsArchived,
      isRead: constObservable(true),
      // An archived session is read-only, as is one whose environment is gone and whose
      // history is being replayed: force every chat's interactivity to ReadOnly so the chat
      // view hides the composer and gates mutating actions.
      interactivity: derived((reader) => effectiveChatInteractivity2(
        sessionIsArchived.read(reader) || sessionIsReadOnly.read(reader),
        this._interactivity.read(reader)
      )),
      description: this._description,
      lastTurnEnd: this._lastTurnEnd,
      origin: summary.origin ? {
        kind: toSessionChatOriginKind(summary.origin.kind),
        parentChat,
        ...summary.origin.kind === "fork" /* Fork */ || summary.origin.kind === "sideChat" /* SideChat */ ? { turnId: summary.origin.turnId } : {},
        ...summary.origin.kind === "sideChat" /* SideChat */ && summary.origin.selection ? { selection: toSessionSideChatSelection(summary.origin.selection) } : {}
      } : void 0,
      // Subagent (tool-origin) worker chats are transient children and can be
      // neither renamed nor deleted; other peer chats are fully manageable.
      capabilities: constObservable(
        summary.origin?.kind === "tool" /* Tool */ ? { canRename: false, canDelete: false } : DEFAULT_CHAT_CAPABILITIES
      )
    };
  }
  update(summary) {
    const modifiedAt = summary.modifiedAt ? new Date(summary.modifiedAt) : this._updatedAt.get();
    transaction((tx) => {
      this._title.set(summary.title || localize(5015, null), tx);
      this._status.set(mapProtocolStatus(summary.status), tx);
      this._updatedAt.set(modifiedAt, tx);
      this._description.set(summary.activity ? new MarkdownString().appendText(summary.activity) : void 0, tx);
      this._lastTurnEnd.set(modifiedAt, tx);
      this._interactivity.set(toChatInteractivity(summary.interactivity), tx);
    });
  }
  /** Optimistically update the chat title ahead of the host's `chatUpdated`. */
  setTitle(title) {
    this._title.set(title || localize(5015, null), void 0);
  }
  /** Present as `Untitled` until the first request is sent so the view shows the composer. */
  markNew() {
    this._isNew.set(true, void 0);
  }
  /** Clear the `new` presentation after the first request is sent. */
  markSent() {
    this._isNew.set(false, void 0);
  }
  setModelId(modelId, source) {
    transaction((tx) => {
      this._modelSource.set(modelId ? source : void 0, tx);
      this._modelId.set(modelId, tx);
    });
  }
  setAgent(agent) {
    this._mode.set(agent ? { id: agent.uri, kind: AGENT_MODE_KIND } : void 0, void 0);
  }
};

function toSessionChatOriginKind(kind) {
  switch (kind) {
    case "tool" /* Tool */:
      return "tool" /* Tool */;
    case "fork" /* Fork */:
      return "fork" /* Fork */;
    case "sideChat" /* SideChat */:
      return "sideChat" /* SideChat */;
    default:
      return "user" /* User */;
  }
}

function toSessionSideChatSelection(selection) {
  return {
    text: selection.text,
    ...selection.responsePartId ? { responsePartId: selection.responsePartId } : {}
  };
}

var AgentHostSessionAdapter = class extends Disposable {
  constructor(metadata, providerId, resourceScheme, logicalSessionType, _options, _gitHubService, _sessionsService, _pullRequestIconCache) {
    super();
    this._options = _options;
    this._gitHubService = _gitHubService;
    this._sessionsService = _sessionsService;
    this._pullRequestIconCache = _pullRequestIconCache;
    this.isAutomation = observableValue("isAutomation", false);
    this.isArchived = observableValue("isArchived", false);
    // Read/unread state is owned by the provider and backed by the agent host
    // protocol's `IsRead` status bit (persisted as session metadata). It is
    // seeded from the session metadata, kept in sync with protocol updates, and
    // mutated via {@link BaseAgentHostSessionsProvider.setSessionReadState}.
    this.isRead = observableValue("isRead", true);
    /**
     * Independent title override for the default chat tab. `undefined` means the
     * default chat inherits the session title; a non-empty value means the user
     * (or host) renamed the default chat independently of the session.
     */
    this._defaultChatTitleOverride = observableValue("defaultChatTitleOverride", void 0);
    /**
     * Independent status override for the default chat tab. `undefined` means the
     * default chat reflects the aggregated session status (the single-chat case,
     * where they are equivalent); a defined value means a multi-chat session, so
     * the default chat shows its own status rather than the session aggregate
     * (which may have been promoted by a running peer chat).
     */
    this._defaultChatStatusOverride = observableValue("defaultChatStatusOverride", void 0);
    /** Whether this session was created with worktree isolation. */
    this._worktreeIsolation = observableValue("worktreeIsolation", false);
    /** Interactivity of the default chat. Driven from the default chat's protocol summary. */
    this._defaultChatInteractivity = observableValue("defaultChatInteractivity", "full" /* Full */);
    /** Additional (non-default) peer chats keyed by chatId. */
    this._additionalChats = this._register(new DisposableMap());
    this._sessionOutputCache = /* @__PURE__ */ new Map();
    /** Chat ids that have not yet sent their first request (presented as `Untitled`). */
    this._newChatIds = /* @__PURE__ */ new Set();
    /**
     * The model each peer chat was given, and where it came from, keyed by chat id.
     *
     * Held outside {@link _additionalChats} because that map is rebuilt from session state: a chat
     * created locally can have its model set before the state carrying it arrives, and the entry
     * that write would have landed on may not exist yet. Seeding from here at construction keeps
     * the selection — and the record of where it came from, which the model-picker's precedence
     * depends on — from being silently dropped.
     */
    this._chatModelSelections = /* @__PURE__ */ new Map();
    this._chatCatalogCapabilitiesObserver = this._register(new MutableDisposable());
    this._changesSummary = observableValueOpts({ equalsFn: structuralEquals }, void 0);
    const rawId = AgentSession.id(metadata.session);
    const agentProvider = AgentSession.provider(metadata.session);
    if (!agentProvider) {
      throw new Error(`Agent session URI has no provider scheme: ${metadata.session.toString()}`);
    }
    this.agentProvider = agentProvider;
    this.backendUri = AgentSession.uri(_options.backendSessionScheme ?? agentProvider, rawId);
    this.resource = URI.from({ scheme: resourceScheme, path: `/${rawId}` });
    this._rawId = rawId;
    this._resourceScheme = resourceScheme;
    this.sessionId = toSessionId(providerId, this.resource);
    this.providerId = providerId;
    this.sessionType = logicalSessionType;
    this._isQuickChat = observableValue("isQuickChat", readSessionWorkspaceless(metadata._meta));
    this.icon = _options.icon;
    this.createdAt = new Date(metadata.startTime);
    this.title = observableValue("title", metadata.summary || `Session ${rawId.substring(0, 8)}`);
    this.updatedAt = observableValue("updatedAt", new Date(metadata.modifiedTime));
    this.modelSelection = void 0;
    this.status = observableValue("status", metadata.status !== void 0 ? mapProtocolStatus(metadata.status) : 3 /* Completed */);
    this.modelId = observableValue("modelId", void 0);
    this.modelSource = observableValue("modelSource", void 0);
    this.mode = observableValueOpts({ owner: this, debugName: "mode", equalsFn: structuralEquals }, void 0);
    this.lastTurnEnd = observableValue("lastTurnEnd", metadata.modifiedTime ? new Date(metadata.modifiedTime) : void 0);
    this._activity = observableValue("activity", metadata.activity);
    this._project = metadata.project;
    this._workingDirectories = metadata.workingDirectories;
    this._meta = metadata._meta;
    this._metaObs = observableValue("agentHostSessionMeta", this._meta);
    this.isExternal = derived(this, (reader) => readSessionExternal(this._metaObs.read(reader)));
    this.createdBySession = derived(this, (reader) => {
      const creationReference = readSessionCreationReference(this._metaObs.read(reader));
      if (!creationReference) {
        return void 0;
      }
      const session = this._options.mapBackendSessionResource(URI.parse(creationReference.session));
      const parsedChat = creationReference.chat ? parseChatUri(creationReference.chat) : void 0;
      const chat = parsedChat ? session.with({ fragment: parsedChat.chatId === DEFAULT_CHAT_ID ? "" : parsedChat.chatId }) : void 0;
      return { session, chat, turnId: creationReference.turnId };
    });
    this.artifacts = derivedOpts({ owner: this, equalsFn: structuralEquals }, (reader) => {
      const meta = this._metaObs.read(reader);
      return getPresentedArtifacts(partitionSessionArtifacts(meta), toGitHubPromotion(meta).surfacedLinks);
    });
    const baseGitHubInfoObs = derivedOpts({
      equalsFn: isGitHubInfoEqual
    }, (reader) => {
      return toGitHubInfo(this._metaObs.read(reader));
    });
    const gitHubInfoWithIcon = derived(this, (reader) => {
      const baseGitHubInfo = baseGitHubInfoObs.read(reader);
      if (!baseGitHubInfo?.pullRequest) {
        return baseGitHubInfo;
      }
      const pullRequests = getGitHubPullRequestRefs(baseGitHubInfo).map((pullRequest, index2) => ({
        ...pullRequest,
        ...computePullRequestRefPresentation(
          reader,
          this._gitHubService,
          this._pullRequestIconCache,
          pullRequest,
          index2 === 0 ? computePullRequestIcon("open" /* Open */) : void 0
        )
      }));
      const icon2 = pullRequests[0].icon;
      const title = pullRequests[0].title;
      return {
        ...baseGitHubInfo,
        pullRequests: baseGitHubInfo.pullRequests ? pullRequests : void 0,
        pullRequest: {
          ...baseGitHubInfo.pullRequest,
          icon: icon2,
          title
        }
      };
    });
    this.gitHubInfo = derivedOpts({ owner: this, equalsFn: isGitHubInfoEqual }, (reader) => gitHubInfoWithIcon.read(reader));
    this.completedStateIcon = derived(this, (reader) => {
      const sourceControlState = readSessionSourceControlState(this._metaObs.read(reader));
      if (sourceControlState?.latestOutcome === "merge" /* Merge */) {
        return { ...Codicon.gitMerge, color: themeColorFromId("charts.purple") };
      }
      const gitHubInfo = this.gitHubInfo.read(reader);
      return getHighestPriorityPullRequestIcon(getGitHubPullRequestRefs(gitHubInfo).map((pullRequest) => pullRequest.icon));
    });
    const initialWorkspace = this._computeWorkspace();
    this.workspace = observableValue("workspace", initialWorkspace);
    this.isQuickChat = this._isQuickChat;
    this.worktreePending = derived(this, (reader) => this._worktreeIsolation.read(reader) && !this.workspace.read(reader)?.folders.some((folder) => !!folder.gitRepository?.workTreeUri));
    this.loading = _options.loading;
    this.description = derivedOpts({ owner: this, equalsFn: markdownStringEquals }, (reader) => {
      const status2 = this.status.read(reader);
      if (status2 === 1 /* InProgress */ || status2 === 2 /* NeedsInput */) {
        const activity = this._activity.read(reader);
        if (activity) {
          return new MarkdownString().appendText(activity);
        }
      }
      return void 0;
    });
    if (isSessionStatusArchived(metadata.status)) {
      this.isArchived.set(true, void 0);
    }
    if (metadata.status !== void 0) {
      this.isRead.set(isSessionStatusRead(metadata.status), void 0);
    }
    this.isActiveSessionObs = derived(this, (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      return isEqual2(activeSession?.resource, this.resource);
    });
    this.setChangesSummary(metadata.changes);
    this.changesets = observableValue(this, void 0);
    this.changes = this._createChangesObs();
    const sessionOutput = createSessionOutputObs(
      this.backendUri,
      this._options,
      this.isActiveSessionObs,
      this.isArchived,
      this.workspace,
      this._sessionOutputCache
    );
    this._sessionOutput = sessionOutput;
    this._currentTurnChanges = this._createCurrentTurnChangesObservable();
    const mainChat = {
      resource: this.resource,
      createdAt: this.createdAt,
      title: derived(this, (reader) => this._defaultChatTitleOverride.read(reader) ?? this.title.read(reader)),
      updatedAt: this.updatedAt,
      status: derived(this, (reader) => this._defaultChatStatusOverride.read(reader) ?? this.status.read(reader)),
      changes: this.changes,
      lastTurnChanges: sessionOutput.getLastTurnChanges(URI.parse(buildDefaultChatUri(this.backendUri))),
      customizations: sessionOutput.getChatCustomizations(URI.parse(buildDefaultChatUri(this.backendUri))),
      checkpoints: observableValue(this, void 0),
      modelId: this.modelId,
      modelSource: this.modelSource,
      mode: this.mode,
      isArchived: this.isArchived,
      isRead: this.isRead,
      // An archived session is read-only, as is one whose environment is gone and whose
      // history is being replayed: force the default chat's interactivity to ReadOnly so the
      // chat view hides the composer and gates mutating actions.
      interactivity: derived(this, (reader) => effectiveChatInteractivity2(
        this.isArchived.read(reader) || (this._options.readOnly?.read(reader) ?? false),
        this._defaultChatInteractivity.read(reader)
      )),
      description: this.description,
      lastTurnEnd: this.lastTurnEnd
    };
    this._defaultChat = mainChat;
    this._mainChatObs = observableValue(this, mainChat);
    this._chatsObs = observableValueOpts({ owner: this, equalsFn: arrayEquals }, [mainChat]);
    this.mainChat = this._mainChatObs;
    this.chats = this._chatsObs;
    this.capabilities = derivedOpts({ owner: this, equalsFn: structuralEquals }, (reader) => {
      const agentCapabilities = this._options.agentCapabilities.read(reader)?.get(this.agentProvider);
      return {
        supportsMultipleChats: !this.isQuickChat.read(reader) && agentCapabilities?.multipleChats !== void 0,
        supportsFork: agentCapabilities?.multipleChats?.fork ?? false,
        supportsSideChat: agentCapabilities?.multipleChats?.sideChat ?? false,
        supportsRename: true,
        supportsDelete: true
      };
    });
  }
  /** Working-directory set used to resolve session customizations. */
  get workingDirectories() {
    return this._workingDirectories ?? [];
  }
  /** The latest session metadata used to build startup-cache presentation state. */
  get sessionMeta() {
    return this._meta;
  }
  /** Session-kind strategy (quick chat vs. workspace), derived from {@link _isQuickChat}. */
  get _kind() {
    return sessionKind(this._isQuickChat.get());
  }
  get changesSummary() {
    return this._changesSummary;
  }
  /**
   * Sets the aggregate change chip. Callers inside a transaction MUST pass it
   * — a `set` without one builds and finishes its own transaction, notifying
   * observers before the enclosing update has applied its remaining fields.
   */
  setChangesSummary(changes, tx) {
    if (!changes) {
      return false;
    }
    const { additions, deletions, files } = changes;
    const currentChangesSummary = this._changesSummary.get();
    if ((currentChangesSummary?.files ?? 0) === (files ?? 0) && (currentChangesSummary?.additions ?? 0) === (additions ?? 0) && (currentChangesSummary?.deletions ?? 0) === (deletions ?? 0)) {
      return false;
    }
    this._changesSummary.set({
      additions: additions ?? 0,
      deletions: deletions ?? 0,
      files: files ?? 0
    }, tx);
    return true;
  }
  /**
   * Reconcile the per-chat catalog from an AHP {@link SessionState}.
   *
   * The default chat (resource == this session's resource) always maps to
   * {@link _defaultChat}. Additional peer chats become their own {@link IChat}
   * whose resource carries the chatId in the URI fragment so the chat view
   * opens a distinct widget that the session handler routes to the matching
   * chat channel.
   *
   * A non-default chat surfaces as a peer tab when the session supports
   * multiple chats (the `copilotcli` case) OR when it is a subagent
   * (tool-origin) chat. Subagent chats are always surfaced as read-only peers
   * — independent of multi-chat support — so the user can review a worker's
   * transcript (the agent-team pattern). Sessions with no surfaced peers
   * degrade to `[defaultChat]`.
   */
  applyChatCatalog(state) {
    this._lastCatalogState = state;
    if (this._chatCatalogCapabilitiesObserver.value) {
      this._applyChatCatalog(state);
    } else {
      this._chatCatalogCapabilitiesObserver.value = autorun((reader) => {
        this.capabilities.read(reader);
        const currentState = this._lastCatalogState;
        if (currentState) {
          this._applyChatCatalog(currentState);
        }
      });
    }
  }
  _applyChatCatalog(state) {
    const defaultChatUri = state.defaultChat?.toString();
    const isDefault = (summary) => defaultChatUri ? summary.resource.toString() === defaultChatUri : isDefaultChatUri(summary.resource);
    const defaultSummary = state.chats.find(isDefault);
    this._defaultChatTitleOverride.set(defaultSummary?.title || void 0, void 0);
    this._defaultChatInteractivity.set(toChatInteractivity(defaultSummary?.interactivity), void 0);
    const surfacesAsPeer = (summary) => !isDefault(summary) && !!parseChatUri(summary.resource)?.chatId && (this.capabilities.get().supportsMultipleChats || summary.origin?.kind === "tool" /* Tool */ || summary.origin?.kind === "sideChat" /* SideChat */);
    const survivingPeers = /* @__PURE__ */ new Set();
    for (const summary of state.chats) {
      if (surfacesAsPeer(summary)) {
        survivingPeers.add(parseChatUri(summary.resource).chatId);
      }
    }
    for (const chatId of this._additionalChats.keys()) {
      if (!survivingPeers.has(chatId)) {
        this._chatModelSelections.delete(chatId);
        this._sessionOutput.releaseChat(URI.parse(buildChatUri(this.backendUri, chatId)));
      }
    }
    if (survivingPeers.size === 0) {
      this._defaultChatStatusOverride.set(void 0, void 0);
      if (this._additionalChats.size > 0) {
        this._additionalChats.clearAndDisposeAll();
      }
      if (this._chatsObs.get().length !== 1 || this._chatsObs.get()[0] !== this._defaultChat) {
        transaction((tx) => {
          this._chatsObs.set([this._defaultChat], tx);
          this._mainChatObs.set(this._defaultChat, tx);
        });
      }
      return;
    }
    this._defaultChatStatusOverride.set(defaultSummary ? mapProtocolStatus(defaultSummary.status) : void 0, void 0);
    const ordered = [];
    for (const summary of state.chats) {
      if (isDefault(summary)) {
        ordered.push(this._defaultChat);
        continue;
      }
      if (!surfacesAsPeer(summary)) {
        continue;
      }
      const chatId = parseChatUri(summary.resource).chatId;
      let entry = this._additionalChats.get(chatId);
      if (!entry) {
        entry = this._createAdditionalChat(chatId, summary);
        this._additionalChats.set(chatId, entry);
      } else {
        entry.update(summary);
      }
      ordered.push(entry.chat);
    }
    for (const chatId of [...this._additionalChats.keys()]) {
      if (!survivingPeers.has(chatId)) {
        this._additionalChats.deleteAndDispose(chatId);
      }
    }
    const main2 = defaultChatUri && ordered.find((c) => isEqual2(c.resource, this.resource)) || this._defaultChat;
    transaction((tx) => {
      this._chatsObs.set(ordered.length > 0 ? ordered : [this._defaultChat], tx);
      this._mainChatObs.set(main2, tx);
    });
  }
  _createAdditionalChat(chatId, summary) {
    const resource = URI.from({ scheme: this._resourceScheme, path: `/${this._rawId}`, fragment: chatId });
    const backendUri = URI.parse(summary.resource);
    const output = {
      lastTurnChanges: this._sessionOutput.getLastTurnChanges(backendUri),
      customizations: this._sessionOutput.getChatCustomizations(backendUri)
    };
    const chat = new AdditionalChat(resource, summary, this._newChatIds.has(chatId), this._resolveParentChatResource(summary.origin), this.isArchived, output, this._options.readOnly);
    const selection = this._chatModelSelections.get(chatId);
    if (selection) {
      chat.setModelId(selection.modelId, selection.source);
    }
    return chat;
  }
  /**
   * Maps a protocol parent-chat URI (from a Tool/Fork {@link ChatSummary.origin})
   * to this session's UI chat resource: the default chat maps to the session
   * resource; peer chats carry their chatId in the resource fragment.
   */
  _resolveParentChatResource(origin) {
    const parentUri = origin && (origin.kind === "tool" /* Tool */ || origin.kind === "fork" /* Fork */ || origin.kind === "sideChat" /* SideChat */) ? origin.chat : void 0;
    if (!parentUri) {
      return void 0;
    }
    if (isDefaultChatUri(parentUri)) {
      return this.resource;
    }
    const parentChatId = parseChatUri(parentUri)?.chatId;
    return parentChatId ? URI.from({ scheme: this._resourceScheme, path: `/${this._rawId}`, fragment: parentChatId }) : this.resource;
  }
  /** Mark a peer chat new so it shows as `Untitled` until its first request. */
  markChatAsNew(chatId) {
    this._newChatIds.add(chatId);
    this._additionalChats.get(chatId)?.markNew();
  }
  /** Clear the `new` flag after the chat's first request is sent. */
  markChatAsSent(chatId) {
    this._newChatIds.delete(chatId);
    this._additionalChats.get(chatId)?.markSent();
  }
  setChatModelId(chatResource, modelId, source) {
    const chatId = chatResource.fragment;
    if (chatId) {
      this._chatModelSelections.set(chatId, { modelId, source });
      this._getAdditionalChat(chatResource)?.setModelId(modelId, source);
    } else {
      transaction((tx) => {
        this.modelSource.set(modelId ? source : void 0, tx);
        this.modelId.set(modelId, tx);
      });
      this.modelSelection = modelId ? this._toModelSelection(modelId) : void 0;
    }
  }
  setChatAgent(chatResource, agent) {
    const chatId = chatResource.fragment;
    if (chatId) {
      this._getAdditionalChat(chatResource)?.setAgent(agent);
    } else {
      this.mode.set(agent ? { id: agent.uri, kind: AGENT_MODE_KIND } : void 0, void 0);
      this._agentBaseDir = agent ? this._workingDirectories?.[0] : void 0;
    }
  }
  /**
   * Reconcile the selected custom-agent URI against the host's current agent
   * list — e.g. the session graduated with an agent picked in the original repo
   * but now runs in an isolated worktree, where the host reports the same agent
   * file under the worktree path.
   *
   * The selection is rebased by matching the agent's repo-relative path against
   * the available agents (which already carry the worktree root) rather than the
   * session's reported working directory. The working directory is unreliable
   * here: the worktree-pathed customizations arrive well before either the
   * `SessionSummary` or `SessionState` working-directory flips to the worktree,
   * so a working-directory-keyed rebase would miss the window and let the picker
   * destructively reset the selection. Deriving the worktree root from the agent
   * list closes that race.
   *
   * Mirrors the agent-host backend's code to rebase by relative path.
   * The re-point is only applied to a URI that actually exists in
   * the supplied agent list, so it never runs ahead of the host reporting the
   * worktree agents (which would otherwise re-introduce the mismatch it fixes).
   */
  reconcileSelectedAgent(agents) {
    const current = this.mode.get();
    if (!current || agents.some((a) => a.uri === current.id)) {
      return;
    }
    const base = this._agentBaseDir;
    if (!base) {
      return;
    }
    const agentUri = URI.parse(current.id);
    if (!isEqualOrParent2(agentUri, base)) {
      return;
    }
    const rel = relativePath(base, agentUri);
    if (!rel) {
      return;
    }
    const relocated = this._findRelocatedAgent(agents, agentUri, base, rel);
    if (relocated) {
      this.mode.set({ id: relocated.uri, kind: current.kind }, void 0);
      this._agentBaseDir = relocated.root;
    }
  }
  /**
   * Finds an available agent that is the same repo-relative file as the current
   * selection but rooted under a different directory (its worktree twin).
   *
   * A candidate matches when its path ends with `/<rel>` on a path-segment
   * boundary and the implied root (the candidate path minus that suffix) differs
   * from `base`. The root is re-validated with `relativePath` so only a genuine
   * relocation of the same file is accepted. Returns the matched agent's URI and
   * its derived root, or `undefined` when there is no twin.
   */
  _findRelocatedAgent(agents, agentUri, base, rel) {
    const suffix = `/${rel}`;
    for (const agent of agents) {
      const candidate = URI.parse(agent.uri);
      if (candidate.scheme !== agentUri.scheme || candidate.authority !== agentUri.authority) {
        continue;
      }
      if (!candidate.path.endsWith(suffix) || candidate.path.length === suffix.length) {
        continue;
      }
      const root = candidate.with({ path: candidate.path.slice(0, candidate.path.length - suffix.length) });
      if (isEqual2(root, base) || relativePath(root, candidate) !== rel) {
        continue;
      }
      return { uri: agent.uri, root };
    }
    return void 0;
  }
  /**
   * Seed the selected custom agent when a session is resumed (e.g. after a
   * window reload). A freshly loaded adapter starts with `mode === undefined`;
   * the host persists the selection on the default chat's `ChatState.draft.agent`,
   * which the provider reads and mirrors onto `session.mode` here. Guarded to
   * never override a live selection (a Part 1 graduation seed or a user pick),
   * keeping this a resume-only hydration.
   */
  hydrateSelectedAgent(agentUri) {
    if (this.mode.get() !== void 0) {
      return;
    }
    this.setChatAgent(this.resource, { uri: agentUri, name: "" });
  }
  /**
   * As {@link hydrateSelectedAgent}, for the model the session was last running on.
   *
   * {@link ChatModelSource.Chosen} because that is what it is: the session's own model, read back
   * from where the host persisted it. Without this a reopened session reports no model at all,
   * and model selection cannot tell it from one that has never had a model.
   */
  hydrateSelectedModel(selection) {
    if (this.modelId.get() !== void 0) {
      return;
    }
    this.setChatModelId(this.resource, `${this._resourceScheme}:${selection.id}`, "chosen" /* Chosen */);
  }
  getChatModelId(chatResource) {
    return chatResource.fragment ? this._getAdditionalChat(chatResource)?.chat.modelId.get() : this.modelId.get();
  }
  getChatModelSelection(chatResource) {
    const modelId = this.getChatModelId(chatResource);
    if (modelId) {
      return this._toModelSelection(modelId);
    }
    return chatResource.fragment ? void 0 : this.modelSelection;
  }
  getChatMode(chatResource) {
    return chatResource.fragment ? this._getAdditionalChat(chatResource)?.chat.mode.get() : this.mode.get();
  }
  /** Optimistically set the default chat tab title (independent of the session title). */
  setDefaultChatTitle(title) {
    this._defaultChatTitleOverride.set(title || void 0, void 0);
  }
  /** Optimistically set an additional peer chat's title ahead of the host's `chatUpdated`. */
  setAdditionalChatTitle(chatId, title) {
    this._additionalChats.get(chatId)?.setTitle(title);
  }
  _toModelSelection(modelId) {
    const prefix = `${this._resourceScheme}:`;
    return { id: modelId.startsWith(prefix) ? modelId.substring(prefix.length) : modelId };
  }
  _getAdditionalChat(chatResource) {
    const byFragment = chatResource.fragment ? this._additionalChats.get(chatResource.fragment) : void 0;
    if (byFragment) {
      return byFragment;
    }
    for (const chat of this._additionalChats.values()) {
      if (isEqual2(chat.chat.resource, chatResource)) {
        return chat;
      }
    }
    return void 0;
  }
  _createChangesObs() {
    const defaultChangesetObs = derivedOpts({
      equalsFn: (c1, c2) => c1?.id === c2?.id
    }, (reader) => {
      const changesets = this.changesets.read(reader);
      if (!changesets) {
        return void 0;
      }
      return changesets.find((c) => c.isDefault.read(reader) === true);
    });
    const defaultChangesetChangesObs = derived((reader) => {
      const defaultChangeset = defaultChangesetObs.read(reader);
      if (!defaultChangeset) {
        return [];
      }
      return defaultChangeset.changes.read(reader);
    });
    return derivedOpts(
      { equalsFn: sessionFileChangesEqual },
      (reader) => defaultChangesetChangesObs.read(reader) ?? []
    );
  }
  /**
   * Update fields from a refreshed metadata snapshot. Returns `true` iff
   * any user-visible field changed.
   */
  update(metadata) {
    let didChange = false;
    transaction((tx) => {
      const summary = metadata.summary;
      if (summary !== void 0 && summary !== this.title.get()) {
        this.title.set(summary, tx);
        didChange = true;
      }
      if (metadata.status !== void 0) {
        const uiStatus = mapProtocolStatus(metadata.status);
        if (uiStatus !== this.status.get()) {
          this.status.set(uiStatus, tx);
          didChange = true;
        }
      }
      const modifiedTime = metadata.modifiedTime;
      if (this.updatedAt.get().getTime() !== modifiedTime) {
        this.updatedAt.set(new Date(modifiedTime), tx);
        didChange = true;
      }
      const currentLastTurnEndTime = this.lastTurnEnd.get()?.getTime();
      const nextLastTurnEndTime = modifiedTime ? modifiedTime : void 0;
      if (currentLastTurnEndTime !== nextLastTurnEndTime) {
        this.lastTurnEnd.set(nextLastTurnEndTime !== void 0 ? new Date(nextLastTurnEndTime) : void 0, tx);
        didChange = true;
      }
      this._project = metadata.project;
      this._workingDirectories = metadata.workingDirectories;
      if (metadata._meta !== void 0) {
        if (this.setMeta(metadata._meta, tx)) {
          didChange = true;
        }
      } else {
        const workspace = this._computeWorkspace();
        if (this._setWorkspace(workspace, tx)) {
          didChange = true;
        }
      }
      if (metadata.status !== void 0) {
        const isArchived = isSessionStatusArchived(metadata.status);
        if (isArchived !== this.isArchived.get()) {
          this.isArchived.set(isArchived, tx);
          didChange = true;
        }
        const isRead = isSessionStatusRead(metadata.status);
        if (isRead !== this.isRead.get()) {
          this.isRead.set(isRead, tx);
          didChange = true;
        }
      }
      if (metadata.changes !== void 0 && this.setChangesSummary(metadata.changes, tx)) {
        didChange = true;
      }
      if (this._activity.get() !== metadata.activity) {
        this._activity.set(metadata.activity, tx);
        didChange = true;
      }
    });
    return didChange;
  }
  /**
   * Sets the activity text from a `SessionSummaryChanged` notification.
   * Returns `true` iff the activity observable changed. Callers inside a
   * transaction MUST pass it — see {@link setChangesSummary}.
   */
  setActivity(activity, tx) {
    if (this._activity.get() !== activity) {
      this._activity.set(activity, tx);
      return true;
    }
    return false;
  }
  /**
   * Apply a `_meta` delta (the shared session-state / session-summary bag,
   * fed from `_applySessionMetaFromState` or a `SessionSummaryChanged`
   * notification), promote the session kind if the delta reports it
   * workspace-less, and rebuild the workspace if the git state changed.
   * Returns `true` iff anything observable changed, so the list regroups a
   * session that became a quick chat without ever having had a workspace.
   *
   * Callers that are already inside a transaction MUST pass it: a plain
   * `transaction()` here would finish (and therefore notify) mid-way through
   * the enclosing one, letting observers of `_meta` / `isQuickChat` /
   * `workspace` read a torn snapshot of the fields the caller has not applied
   * yet.
   */
  setMeta(meta, tx) {
    const metaChanged = !equals4(this._meta, meta);
    this._meta = meta;
    let didChange = metaChanged;
    subtransaction(tx, (tx2) => {
      this._metaObs.set(this._meta, tx2);
      if (this._promoteToQuickChatIfWorkspaceless(tx2)) {
        didChange = true;
      }
      const workspace = this._computeWorkspace();
      if (this._setWorkspace(workspace, tx2)) {
        didChange = true;
      }
    });
    return didChange;
  }
  refreshWorkspace() {
    let didChange = false;
    transaction((tx) => {
      didChange = this._setWorkspace(this._computeWorkspace(), tx);
    });
    return didChange;
  }
  setIsAutomation(isAutomation) {
    this.isAutomation.set(isAutomation, void 0);
  }
  /** Records that this session runs with worktree isolation. See {@link worktreePending}. */
  setWorktreeIsolation(isolated) {
    this._worktreeIsolation.set(isolated, void 0);
  }
  /**
   * Heal an adapter born mis-classified because the path that materialized it
   * carried no `_meta` (a stale persisted cache, an older host). One-way: an
   * absent marker means "not included", never "cleared", so a quick chat is
   * never demoted back into a workspace session rooted at its scratch cwd.
   */
  _promoteToQuickChatIfWorkspaceless(tx) {
    if (this._isQuickChat.get() || !readSessionWorkspaceless(this._meta)) {
      return false;
    }
    this._isQuickChat.set(true, tx);
    return true;
  }
  /**
   * The session's project. Read at persist time so a value assigned after the snapshot was taken
   * is not lost on the next save.
   */
  get project() {
    return this._project;
  }
  /**
   * Assign a project to a session that was materialized without one, recomputing the workspace.
   * Refuses when the session already has a project.
   *
   * Narrower than {@link update}, which also assigns `_workingDirectories` and would clear real
   * working directories, revert a renamed title, and roll back the modified time.
   */
  backfillProject(project) {
    if (!project || this._project) {
      return false;
    }
    this._project = project;
    transaction((tx) => {
      this._setWorkspace(this._computeWorkspace(), tx);
    });
    return true;
  }
  _setWorkspace(workspace, tx) {
    if (agentHostSessionWorkspaceKey(workspace) === agentHostSessionWorkspaceKey(this.workspace.get())) {
      return false;
    }
    this._sessionOutputCache.clear();
    this.workspace.set(workspace, tx);
    return true;
  }
  /**
   * Resolves the session workspace. Quick chats stay workspace-less
   * (`undefined`) regardless of any scratch working directory the host
   * assigned; workspace sessions build from project/git metadata.
   */
  _computeWorkspace() {
    return this._kind.computeWorkspace(() => this._options.buildWorkspace(this._project, this._workingDirectories, this.gitHubInfo, readSessionGitState(this._meta)));
  }
  updateChangesets(changesetsMetadata) {
    if (!changesetsMetadata) {
      return;
    }
    const changesets = createChangesets(this.backendUri, this._options, this.isActiveSessionObs, changesetsMetadata.map((changeset) => ({
      ...changeset,
      changes: changeset.changeKind === TURN_CHANGES_CHANGESET_ID ? this._currentTurnChanges : void 0
    })));
    this.changesets.set(changesets, void 0);
  }
  _createCurrentTurnChangesObservable() {
    const sessionStateObs = createActiveSessionSubscriptionObs(
      this._options,
      this.isActiveSessionObs,
      1 /* Session */,
      constObservable(this.backendUri)
    );
    const mostRecentChatUriObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      return selectMostRecentChatUri(sessionStateObs.read(reader).read(reader), this.backendUri);
    });
    const chatStateObs = createActiveSessionSubscriptionObs(
      this._options,
      this.isActiveSessionObs,
      2 /* Chat */,
      mostRecentChatUriObs
    );
    return derived((reader) => {
      const chatState = chatStateObs.read(reader).read(reader);
      if (!chatState || chatState instanceof Error || !chatState.activeTurn) {
        return void 0;
      }
      return this._sessionOutput.getLastTurnChanges(mostRecentChatUriObs.read(reader)).read(reader).filter((change) => !change.isOutsideWorkspace);
    });
  }
};

AgentHostSessionAdapter = __decorateClass([
  __decorateParam(5, IGitHubService),
  __decorateParam(6, ISessionsService),
  __decorateParam(7, IPullRequestIconCache)
], AgentHostSessionAdapter);

var AGENT_MODE_KIND = "agent";

function customizationsChanged(previous, state) {
  if (previous.customizations !== state.customizations) {
    return true;
  }
  const previousActiveCustomizations = flattenActiveClientCustomizations(previous);
  const currentActiveCustomizations = flattenActiveClientCustomizations(state);
  return !arrayEquals(previousActiveCustomizations, currentActiveCustomizations, (a, b) => {
    if (a.nonce !== void 0 && a.nonce === b.nonce) {
      return true;
    }
    return a === b;
  });
}

function flattenActiveClientCustomizations(state) {
  const result = [];
  for (const client of state.activeClients) {
    if (client.customizations) {
      result.push(...client.customizations);
    }
  }
  return result;
}

var NewSession = class extends Disposable {
  constructor(ctx, _options, sessionsService) {
    super();
    this._options = _options;
    this._changesets = observableValue(this, void 0);
    this._worktreePending = observableValue(this, false);
    this._isNewSessionRequestInProgress = observableValue(this, false);
    this._newSessionRequestActivities = /* @__PURE__ */ new Map();
    this._newSessionRequestId = 0;
    /**
     * Latest resolved config. Replaces what used to live in `_newSessionConfigs`.
     * `undefined` indicates the most recent {@link resolveConfig} failed and no
     * cached values are usable.
     */
    this._config = { schema: { type: "object", properties: {} }, values: {} };
    /**
     * Monotonic counter for in-flight {@link resolveConfig} calls. Each call
     * increments the counter and only writes its result back if its sequence
     * is still the latest one. Bumped on dispose so any pending resolve
     * discards itself.
     */
    this._configRequestSeq = 0;
    this._lifetimeCts = this._register(new CancellationTokenSource());
    /**
     * `onDidChange` listener for {@link _subscription}. Forwards every
     * `SessionState` snapshot to the provider via {@link _onSessionState}
     * so the new session's customizations (and any other state) reach
     * `_lastSessionStates` while the session is still Untitled. Detached
     * in {@link graduate} (handoff) and {@link dispose} (close-without-send).
     */
    this._stateListener = this._register(new MutableDisposable());
    /**
     * Autorun republishing active-client changes for this draft. Cleared in
     * {@link graduate} so the session handler's own reconciliation owns
     * republishing from then on, and the two never race.
     */
    this._activeClientPublisher = this._register(new MutableDisposable());
    const workspaceUri = ctx.workspace?.folders[0]?.root;
    this._kind = sessionKind(!!ctx.quickChat);
    if (this._kind.requiresWorkspace && !workspaceUri) {
      throw new Error("Workspace has no repository URI");
    }
    this.workspaceUri = workspaceUri;
    this.isQuickChat = this._kind.isQuickChat;
    this.requiresWorkspaceTrust = !!ctx.workspace?.requiresWorkspaceTrust;
    this.agentProvider = ctx.sessionType.id;
    this._providerId = ctx.providerId;
    this._logService = ctx.logService;
    this._onSessionState = ctx.onSessionState;
    this._activeClientScope = ctx.activeClientScope;
    this._register(this._activeClientScope);
    this._initialMetadata = ctx.initialMetadata;
    const resource = URI.from({ scheme: ctx.resourceScheme, path: `/${generateUuid()}` });
    this._isActiveSessionObs = derived(this, (reader) => isEqual2(sessionsService.activeSession.read(reader)?.resource, resource));
    this.backendUri = AgentSession.uri(ctx.backendSessionScheme ?? this.agentProvider, AgentSession.id(resource));
    this._status = observableValue(this, 0 /* Untitled */);
    this._title = observableValue(this, "");
    const title = this._title;
    const updatedAt = observableValue(this, /* @__PURE__ */ new Date());
    this._workspace = observableValue(this, ctx.workspace);
    const changes = observableValueOpts({ owner: this, equalsFn: sessionFileChangesEqual }, []);
    const checkpoints = observableValue(this, void 0);
    this._selectedModelId = void 0;
    this._selectedAgent = void 0;
    this._modelId = observableValue(this, this._selectedModelId);
    this._modelSource = observableValue(this, void 0);
    const mode = observableValue(this, void 0);
    this._mode = mode;
    const isArchived = observableValue(this, false);
    const isRead = observableValue(this, true);
    this._description = observableValue(this, void 0);
    const lastTurnEnd = observableValue(this, void 0);
    this._loading = observableValue(this, true);
    this._isResolvingConfig = observableValue(this, false);
    const createdAt = /* @__PURE__ */ new Date();
    const mainChat = {
      resource,
      createdAt,
      title,
      updatedAt,
      status: this._status,
      changes,
      checkpoints,
      modelId: this._modelId,
      modelSource: this._modelSource,
      mode,
      isArchived,
      isRead,
      interactivity: constObservable("full" /* Full */),
      description: this._description,
      lastTurnEnd
    };
    this._mainChat = observableValue(this, mainChat);
    const authPending = ctx.authenticationPending;
    const loading = this._loading;
    const chats = this._mainChat.map((c) => [c]);
    this.session = {
      sessionId: `${ctx.providerId}:${resource.toString()}`,
      resource,
      providerId: ctx.providerId,
      sessionType: ctx.sessionType.id,
      icon: ctx.icon,
      createdAt,
      workspace: this._workspace,
      isQuickChat: constObservable(this._kind.isQuickChat),
      worktreePending: this._worktreePending,
      title,
      updatedAt,
      status: this._status,
      changesets: this._changesets,
      changes,
      modelId: this._modelId,
      mode,
      loading: derived((reader) => loading.read(reader) || authPending.read(reader)),
      isNewSessionRequestInProgress: this._isNewSessionRequestInProgress,
      isArchived,
      isRead,
      description: this._description,
      lastTurnEnd,
      mainChat: this._mainChat,
      chats,
      capabilities: constObservable({ supportsMultipleChats: false, supportsRename: true, supportsDelete: true })
    };
    this.sessionId = this.session.sessionId;
    if (ctx.initialConfigValues || ctx.initialConfigSchema) {
      this._config = {
        schema: { type: "object", properties: { ...ctx.initialConfigSchema } },
        values: { ...ctx.initialConfigValues }
      };
    }
    this._syncWorktreePending();
  }
  observeClientCustomAgents(customAgents, onDidChange) {
    let previous = customAgents.get();
    this._register(autorun((reader) => {
      const current = customAgents.read(reader);
      if (current === previous) {
        return;
      }
      previous = current;
      onDidChange();
    }));
  }
  getClientCustomAgents() {
    return this._activeClientScope.customAgents.get();
  }
  /** Re-reads the isolation pick from the cached config into {@link _worktreePending}. */
  _syncWorktreePending() {
    this._worktreePending.set(isWorktreeIsolation(this._config?.values), void 0);
  }
  // -- Picker mutations ----------------------------------------------------
  setSelectedModelId(modelId, source) {
    this._selectedModelId = modelId;
    transaction((tx) => {
      this._modelSource.set(source, tx);
      this._modelId.set(modelId, tx);
    });
  }
  getSelectedModelId() {
    return this._selectedModelId;
  }
  clearSelectedModelId() {
    this._selectedModelId = void 0;
  }
  /** Untitled skeleton title used until the first request commits the session. */
  get untitledTitle() {
    return this._kind.untitledTitle;
  }
  setSelectedAgent(agent) {
    this._selectedAgent = agent;
    this._mode.set(agent ? { id: agent.uri, kind: AGENT_MODE_KIND } : void 0, void 0);
  }
  getSelectedAgent() {
    return this._selectedAgent;
  }
  clearSelectedAgent() {
    this._selectedAgent = void 0;
    this._mode.set(void 0, void 0);
  }
  setStatus(status2) {
    this._status.set(status2, void 0);
  }
  startRequest(activity) {
    const requestId = this._newSessionRequestId++;
    this._newSessionRequestActivities.set(requestId, activity);
    transaction((tx) => {
      this._isNewSessionRequestInProgress.set(true, tx);
      this._description.set(activity ? new MarkdownString().appendText(activity) : void 0, tx);
    });
    return toDisposable(() => {
      if (!this._newSessionRequestActivities.delete(requestId)) {
        return;
      }
      const latestActivity = Array.from(this._newSessionRequestActivities.values()).at(-1);
      transaction((tx) => {
        this._isNewSessionRequestInProgress.set(this._newSessionRequestActivities.size > 0, tx);
        this._description.set(latestActivity ? new MarkdownString().appendText(latestActivity) : void 0, tx);
      });
    });
  }
  setLoading(loading) {
    this._loading.set(loading, void 0);
  }
  setTitle(title) {
    this._title.set(title, void 0);
  }
  applySessionMeta(meta) {
    const workspace = this._workspace.get();
    const primaryFolder = workspace?.folders[0];
    if (!workspace || !primaryFolder) {
      return false;
    }
    const gitState = readSessionGitState(meta);
    const gitHubInfo = toGitHubInfo(meta);
    if (!gitState && !gitHubInfo) {
      return false;
    }
    const currentRepository = primaryFolder.gitRepository ?? {
      uri: primaryFolder.root,
      workTreeUri: void 0,
      baseBranchName: void 0,
      gitHubInfo: constObservable(void 0)
    };
    const nextGitHubInfo = gitHubInfo ?? (gitState?.hasGitHubRemote === false ? void 0 : currentRepository.gitHubInfo.get());
    const nextWorkspace = {
      ...workspace,
      folders: [{
        ...primaryFolder,
        gitRepository: {
          ...currentRepository,
          branchName: gitState?.branchName ?? currentRepository.branchName,
          baseBranchName: gitState?.baseBranchName ?? currentRepository.baseBranchName,
          hasGitHubRemote: gitState?.hasGitHubRemote ?? currentRepository.hasGitHubRemote,
          upstreamBranchName: gitState?.upstreamBranchName ?? currentRepository.upstreamBranchName,
          incomingChanges: gitState?.incomingChanges ?? currentRepository.incomingChanges,
          outgoingChanges: gitState?.outgoingChanges ?? currentRepository.outgoingChanges,
          uncommittedChanges: gitState?.uncommittedChanges ?? currentRepository.uncommittedChanges,
          gitHubInfo: constObservable(nextGitHubInfo)
        }
      }, ...workspace.folders.slice(1)]
    };
    if (sessionWorkspaceEqual(workspace, nextWorkspace)) {
      return false;
    }
    this._workspace.set(nextWorkspace, void 0);
    return true;
  }
  // -- Config --------------------------------------------------------------
  getConfig() {
    return this._config;
  }
  getConfigValues() {
    return this._config?.values;
  }
  trackConfigResolution(promise) {
    this._configResolution = promise;
    void promise.then(
      () => this._clearConfigResolution(promise),
      () => this._clearConfigResolution(promise)
    );
    return promise;
  }
  async waitForConfigResolution() {
    while (this._configResolution) {
      await raceCancellationError(this._configResolution, this.cancellationToken);
    }
  }
  _clearConfigResolution(promise) {
    if (this._configResolution === promise) {
      this._configResolution = void 0;
    }
  }
  /**
   * Optimistically merges a single property into the cached config.
   * Preserves the existing schema so schema-driven pickers don't flash
   * during the async re-resolve. {@link resolveConfig} replaces both
   * schema and values when its response lands.
   */
  setConfigValue(property, value2) {
    const current = this._config;
    this._config = {
      schema: current?.schema ?? { type: "object", properties: {} },
      values: { ...current?.values ?? {}, [property]: value2 }
    };
    this._syncWorktreePending();
  }
  /**
   * `true` while a {@link resolveConfig} round-trip is in flight. See
   * {@link _isResolvingConfig} for why this is distinct from {@link ISession.loading}.
   */
  get isResolvingConfig() {
    return this._isResolvingConfig;
  }
  get cancellationToken() {
    return this._lifetimeCts.token;
  }
  /** Mark a resolve as starting before the optimistic event fires. */
  beginResolveConfigSync() {
    this._isResolvingConfig.set(true, void 0);
  }
  /**
   * Clear the in-flight flag for early-return paths that skip
   * {@link resolveConfig} (e.g. no connection), where the `finally`
   * cleanup never runs.
   */
  endResolveConfigSync() {
    this._isResolvingConfig.set(false, void 0);
  }
  /**
   * Re-resolves the session config against the agent host using the
   * currently cached values. Ignores its own response if a newer call
   * superseded it. Returns `true` if the config was applied (i.e. this
   * call was not stale by the time the response arrived). On failure, the
   * cached config is cleared so {@link getConfig} returns `undefined`.
   * @param strict Rethrow the latest resolution error instead of treating the refresh as best effort.
   */
  async resolveConfig(connection, strict = false) {
    const seq = ++this._configRequestSeq;
    this._isResolvingConfig.set(true, void 0);
    try {
      const result = await connection.resolveSessionConfig({
        provider: this.agentProvider,
        workingDirectory: this.workspaceUri,
        config: this._config?.values
      });
      if (seq !== this._configRequestSeq) {
        return false;
      }
      this._config = result;
      this._syncWorktreePending();
      return true;
    } catch (error) {
      if (seq !== this._configRequestSeq) {
        return false;
      }
      this._config = void 0;
      this._syncWorktreePending();
      if (strict) {
        throw error;
      }
      return true;
    } finally {
      if (seq === this._configRequestSeq) {
        this._isResolvingConfig.set(false, void 0);
      }
    }
  }
  getConfigCompletions(connection, property, query) {
    return connection.sessionConfigCompletions({
      provider: this.agentProvider,
      workingDirectory: this.workspaceUri,
      config: this._config?.values,
      property,
      query
    });
  }
  // -- Backend session lifecycle -------------------------------------------
  /**
   * Eagerly create the session on the agent host so the chat handler can
   * skip its legacy `createSession`-on-first-message round-trip.
   *
   * Wire ordering matters: we must `createSession` *before* opening the
   * subscription. Subscribing first would race the wire send — the server
   * receives the `subscribe` before the `createSession` and rejects it as
   * `AHP_SESSION_NOT_FOUND`, leaving the client subscription in an
   * unrecoverable error state. The session handler would then fall back
   * to its legacy create-and-subscribe path on the user's first send,
   * issuing a duplicate `createSession`.
   *
   * If the user switches workspaces or graduates this session before the
   * `createSession` round-trip completes, this object will have been
   * disposed (and `_backendUri` cleared) — the bail-out check below skips
   * opening a stale subscription.
   *
   * Failures are non-fatal: the legacy first-message path in
   * `AgentHostSessionHandler._invokeAgent` re-issues `createSession` if
   * no session state exists at send time.
   */
  eagerCreate(connection, canCreate) {
    const backendUri = this.backendUri;
    if (this._eagerCreateTask || this._backendUri?.toString() === backendUri.toString() || this._subscription) {
      return;
    }
    this._eagerCreateTask = (async () => {
      if (canCreate) {
        try {
          if (!await canCreate()) {
            return;
          }
        } catch (error) {
          this._logService.warn(`[${this._providerId}] Eager createSession precondition failed for ${backendUri.toString()}: ${error}`);
          return;
        }
      }
      if (this.cancellationToken.isCancellationRequested) {
        return;
      }
      this._backendUri = backendUri;
      this._connection = connection;
      let createdWithActiveClient;
      try {
        await this._activeClientScope.whenResolved();
        if (this._backendUri?.toString() !== backendUri.toString()) {
          return;
        }
        const activeClient = this._activeClientScope.activeClient(connection.clientId).get();
        createdWithActiveClient = activeClient;
        await connection.createSession({
          provider: this.agentProvider,
          session: backendUri,
          workingDirectories: this.workspaceUri ? [this.workspaceUri] : void 0,
          config: this._config?.values,
          _meta: this._initialMetadata,
          // MCP-style opt-in: offer to receive `progress` for any
          // long-running bring-up (chiefly the lazy first-use SDK
          // download, which fires later at first-message
          // materialization). The host echoes this token on each
          // `progress` frame so `_handleProgress` can correlate it.
          progressToken: generateUuid(),
          ...this._selectedAgent ? { agent: { uri: this._selectedAgent.uri } } : {},
          activeClient
        });
      } catch (err) {
        this._logService.warn(`[${this._providerId}] Eager createSession failed for ${backendUri.toString()}: ${err}`);
        if (this._backendUri?.toString() === backendUri.toString()) {
          this._backendUri = void 0;
          this._connection = void 0;
        }
        return;
      }
      if (this._backendUri?.toString() !== backendUri.toString()) {
        return;
      }
      const ref = connection.getSubscription(1 /* Session */, backendUri, "BaseAgentHostSessionsProvider.session");
      this._subscription = ref;
      const onSessionState = this._onSessionState;
      if (onSessionState) {
        const initial = ref.object.value;
        if (initial && !(initial instanceof Error)) {
          this.updateChangesets(initial.changesets);
          onSessionState(this.sessionId, initial);
        }
        this._stateListener.value = ref.object.onDidChange((state) => {
          this.updateChangesets(state.changesets);
          onSessionState(this.sessionId, state);
        });
      }
      let lastPublished = createdWithActiveClient;
      this._activeClientPublisher.value = autorun((reader) => {
        if (!this._activeClientScope.isResolved.read(reader)) {
          return;
        }
        const activeClient = this._activeClientScope.activeClient(connection.clientId).read(reader);
        const state = ref.object.value;
        const existing = state instanceof Error ? void 0 : state?.activeClients.find((client) => client.clientId === activeClient.clientId);
        if (equals4(existing, activeClient) || equals4(lastPublished, activeClient)) {
          return;
        }
        lastPublished = activeClient;
        connection.dispatch(backendUri.toString(), {
          type: "session/activeClientSet" /* SessionActiveClientSet */,
          activeClient
        });
      });
    })();
  }
  async waitForEagerCreate() {
    if (this._eagerCreateTask) {
      await raceCancellationError(this._eagerCreateTask, this.cancellationToken);
    }
  }
  updateChangesets(changesetsMetadata) {
    if (!changesetsMetadata) {
      return;
    }
    const changesets = createChangesets(this.backendUri, this._options, this._isActiveSessionObs, changesetsMetadata);
    this._changesets.set(changesets, void 0);
  }
  /**
   * Release the backend subscription without firing `disposeSession`.
   * Used on the success path in `sendRequest` when the session has
   * graduated into a real running session.
   */
  graduate() {
    this._lifetimeCts.cancel();
    this._stateListener.clear();
    this._activeClientPublisher.clear();
    this._subscription?.dispose();
    this._subscription = void 0;
    this._backendUri = void 0;
    this._connection = void 0;
    this._configRequestSeq++;
  }
  dispose() {
    this._lifetimeCts.cancel();
    this._configRequestSeq++;
    const hadListener = !!this._stateListener.value;
    this._stateListener.clear();
    this._activeClientPublisher.clear();
    if (hadListener) {
      this._onSessionState?.(this.sessionId, void 0);
    }
    this._subscription?.dispose();
    this._subscription = void 0;
    const oldUri = this._backendUri;
    const connection = this._connection;
    this._backendUri = void 0;
    this._connection = void 0;
    if (oldUri && connection) {
      connection.disposeSession(oldUri).catch((err) => {
        this._logService.warn(`[${this._providerId}] Failed to dispose eager backend session ${oldUri.toString()}: ${err}`);
      });
    }
    super.dispose();
  }
};

NewSession = __decorateClass([
  __decorateParam(2, ISessionsService)
], NewSession);

var BaseAgentHostSessionsProvider = class extends Disposable {
  constructor(_chatSessionsService, _chatService, _chatWidgetService, _languageModelsService, _baseConfigurationService, _logService, _gitHubService, _instantiationService, _sessionsService, _activeClientService, _storageService, _dialogService, _workspaceTrustManagementService) {
    super();
    this._chatSessionsService = _chatSessionsService;
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._languageModelsService = _languageModelsService;
    this._baseConfigurationService = _baseConfigurationService;
    this._logService = _logService;
    this._gitHubService = _gitHubService;
    this._instantiationService = _instantiationService;
    this._sessionsService = _sessionsService;
    this._activeClientService = _activeClientService;
    this._storageService = _storageService;
    this._dialogService = _dialogService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._sessionTypes = [];
    this._agentCapabilities = observableValue(this, void 0);
    this._onDidChangeSessionTypes = this._register(new Emitter());
    this.onDidChangeSessionTypes = this._onDidChangeSessionTypes.event;
    this._onDidChangeSessions = this._register(new Emitter());
    this._onDidChangeSessionsFromNotifications = this._register(new Emitter());
    this._onDidChangeSessionsImmediately = Event2.any(this._onDidChangeSessions.event, this._onDidChangeSessionsFromNotifications.event);
    this.onDidChangeSessions = debounceSessionChangeEvents(this._onDidChangeSessionsFromNotifications.event, this._onDidChangeSessions.event, this._store);
    this._onDidChangeDraftSessions = this._register(new Emitter());
    this._onDidReplaceSession = this._register(new Emitter());
    this.onDidReplaceSession = this._onDidReplaceSession.event;
    this._onDidChangeSessionConfig = this._register(new Emitter());
    this.onDidChangeSessionConfig = this._onDidChangeSessionConfig.event;
    this._onDidChangeRootConfig = this._register(new Emitter());
    this.onDidChangeRootConfig = this._onDidChangeRootConfig.event;
    this._onDidChangeCustomAgents = this._register(new Emitter());
    this.onDidChangeCustomAgents = this._onDidChangeCustomAgents.event;
    this._onDidChangeCustomizations = this._register(new Emitter());
    this.onDidChangeCustomizations = this._onDidChangeCustomizations.event;
    /**
     * Last-known session state per session ID, seeded from
     * {@link _applySessionStateUpdate}. Holds the snapshot used to extract
     * `customizations` and `activeClient.customizations` for the picker.
     */
    this._lastSessionStates = /* @__PURE__ */ new Map();
    /** Cache of adapted sessions, keyed by raw session ID. */
    this._sessionCache = /* @__PURE__ */ new Map();
    /**
     * Snapshot of the source metadata for each adapter in {@link _sessionCache},
     * keyed by raw session ID. Captured in {@link createAdapter}/{@link updateAdapter}
     * and re-used by {@link _persistCache} to serialize sessions without having to
     * reconstruct every `IAgentSessionMetadata` field from observables.
     */
    this._metaByRawId = /* @__PURE__ */ new Map();
    /**
     * Set when {@link _sessionCache} has changed since the last persist. The
     * actual write happens on the next `onWillSaveState` signal from
     * {@link IStorageService} so that bursts of notifications do not repeatedly
     * re-serialize the whole cache.
     */
    this._cacheDirty = false;
    /**
     * Raw ids of backend sessions that an in-flight {@link _waitForNewSession}
     * has already matched to its send, so a *concurrent* new-session send of
     * the same scheme does not resolve to the same committed session. Each
     * matched id is released by the owning send in its `finally`.
     */
    this._committingSessionRawIds = /* @__PURE__ */ new Set();
    /**
     * Own raw ids ({@link chatResource} path) of currently in-flight
     * new-session sends. A send's committed backend session keeps the eager
     * id it was created with, so {@link _waitForNewSession} matches a send to
     * its OWN id first. The novelty fallback (for flows where the backend
     * assigns a different id) must then never latch onto *another* in-flight
     * send's own session — otherwise two concurrent same-scheme sends racing
     * in a shared download/materialize window would swap sessions (each
     * graduating onto the other's committed session). Populated at send start,
     * cleared in the send's `finally`.
     */
    this._inFlightNewSessionOwnIds = /* @__PURE__ */ new Set();
    /**
     * In-flight new sessions — sessions being composed in the new-chat view
     * before their first message is sent, keyed by `sessionId`. See
     * {@link NewSession} for the encapsulated state and lifecycle.
     *
     * Held as a {@link DisposableMap} so multiple new sessions can be tracked
     * concurrently (e.g. while one is sending in the background and the composer
     * re-seeds a fresh one). Entries are disposed individually when sent
     * ({@link deleteAndDispose}/{@link deleteAndLeak}) or abandoned (via
     * {@link deleteNewSession}), and all remaining entries are cleaned up when
     * the provider itself is disposed.
     */
    this._newSessions = this._register(new DisposableMap());
    /** Full resolved config (schema + values) for running sessions, keyed by session ID. */
    this._runningSessionConfigs = /* @__PURE__ */ new Map();
    this._runningSessionConfigResolveSeq = /* @__PURE__ */ new Map();
    /**
     * Last authoritatively-resolved schemas for {@link SEEDED_CONFIG_SCHEMA_KEYS},
     * seeded into new drafts so their chips survive a workspace/agent switch. Lives
     * on the provider (not the picker) so it outlives toolbar item reconstruction.
     */
    this._cachedConfigSchemas = /* @__PURE__ */ new Map();
    /**
     * Lazy session-state subscriptions used to seed {@link _runningSessionConfigs}
     * for sessions that already exist on the agent host (e.g. created in a prior
     * window). The underlying wire subscription is reference-counted by
     * {@link IAgentConnection.getSubscription}, so when the session handler is
     * also subscribed (i.e. chat content is loaded) no extra wire subscribe is
     * issued. Each entry is released after
     * {@link SESSION_STATE_SUBSCRIPTION_IDLE_MS} of no calls into the keep-alive
     * helper, so the server-side refcount can drop and any idle restored session
     * state can be evicted on the agent host. Keyed by session ID.
     */
    this._sessionStateSubscriptions = this._register(new DisposableMap());
    /**
     * Idle-release timers paired with {@link _sessionStateSubscriptions}. Each
     * call to {@link _keepSessionStateAlive} resets the timer for `sessionId`;
     * when the timer fires, the subscription is disposed and the wire
     * `unsubscribe` flows through {@link IAgentConnection.getSubscription}'s
     * refcount to the agent host.
     */
    this._sessionStateIdleTimers = this._register(new DisposableMap());
    this._chatModelRetentionLeases = this._register(new DisposableMap());
    /**
     * Session ids whose views are currently visible in the Agents window. Their
     * state subscription is pinned open (no idle release) so host-driven catalog
     * changes the user did not initiate — most importantly spawned subagent chats
     * ({@link ChatOriginKind.Tool}) — keep flowing into `cached.chats` while the
     * session is on screen. Without this, the idle timer (only refreshed by
     * client-initiated actions/queries) can release the state listener mid-view,
     * so a subagent's `chatAdded` is dropped and its inline "Open Subagent" pill
     * cannot resolve until the session is re-subscribed (e.g. switched away and
     * back). Driven by {@link _syncVisibleSessionStatePins}.
     */
    this._pinnedSessionStates = /* @__PURE__ */ new Set();
    this._cacheInitialized = false;
    /**
     * Backoff timer that retries {@link _refreshSessions} after a failed
     * attempt. A failed initial list (e.g. the agent threw
     * `AHP_AUTH_REQUIRED` because its token wasn't yet effective server-side,
     * or a transient offline/network error) must not leave the session list
     * permanently empty. The timer is armed only on failure and cancelled on
     * the next successful refresh.
     */
    this._sessionRefreshRetry = this._register(new MutableDisposable());
    /** Current backoff delay (ms) for the session-refresh retry. */
    this._sessionRefreshRetryDelay = BaseAgentHostSessionsProvider.SESSION_REFRESH_RETRY_MIN_MS;
    /** True while a {@link _refreshSessions} call is awaiting `listSessions()`. */
    this._sessionRefreshInFlight = false;
    this._activeSessionScope = this._register(new MutableDisposable());
    this._activeClientSyncCancellation = this._register(new MutableDisposable());
    this.onDidChangeModels = Event2.defer(Event2.any(
      this._languageModelsService.onDidChangeLanguageModels,
      this._languageModelsService.onDidChangeModelVisibility
    ), false, this._store);
    this._downloadProgress = this._register(this._instantiationService.createInstance(AgentHostDownloadProgress));
    this._register(toDisposable(() => {
      for (const cached of this._sessionCache.values()) {
        cached.dispose();
      }
      this._sessionCache.clear();
    }));
    this._register(autorun((reader) => this._syncVisibleSessionStatePins(reader)));
    this._register(autorun((reader) => {
      this._sessionsService.activeSession.read(reader);
      this._syncActiveClient();
    }));
    this._register(this._onDidChangeSessionsImmediately((e4) => {
      if (!this._shouldTrackSessionCacheChanges()) {
        return;
      }
      if (e4.added.length > 0 || e4.removed.length > 0 || e4.changed.length > 0) {
        this._cacheDirty = true;
      }
      for (const removed of e4.removed) {
        const rawId = this._rawIdFromChatId(removed.sessionId);
        if (rawId) {
          this._metaByRawId.delete(rawId);
        }
      }
    }));
    this._register(this._storageService.onWillSaveState(() => {
      if (this._sessionCacheStorageKey && this._cacheDirty) {
        this._persistCache();
        this._cacheDirty = false;
      }
    }));
  }
  get order() {
    return 0;
  }
  get sessionTypes() {
    return this._sessionTypes;
  }
  _refreshSessionWorkspaces() {
    const changed = [...this._sessionCache.values()].filter((session) => session.refreshWorkspace());
    if (changed.length > 0) {
      this._onDidChangeSessions.fire({ added: [], removed: [], changed });
    }
  }
  /** The in-flight new session with the given id, if any. */
  _getNewSession(sessionId) {
    return this._newSessions.get(sessionId);
  }
  _getBackendSessionUri(sessionId) {
    const rawId = this._rawIdFromChatId(sessionId);
    if (!rawId) {
      return void 0;
    }
    return this._sessionCache.get(rawId)?.backendUri ?? this._newSessions.get(sessionId)?.backendUri;
  }
  /**
   * Dispose every in-flight new session, firing each one's `disposeSession`
   * sentinel so the eagerly-created backend records are freed. Used when the
   * connection drops and the composed-but-unsent drafts can no longer commit.
   */
  _disposeAllNewSessions() {
    this._newSessions.clearAndDisposeAll();
    this._onDidChangeDraftSessions.fire();
  }
  deleteNewSession(sessionId) {
    if (this._newSessions.has(sessionId)) {
      this._newSessions.deleteAndDispose(sessionId);
      this._onDidChangeDraftSessions.fire();
    }
  }
  static {
    this.SESSION_REFRESH_RETRY_MIN_MS = 1e3;
  }
  static {
    this.SESSION_REFRESH_RETRY_MAX_MS = 3e4;
  }
  /**
   * Hook to normalize a session's metadata before it is cached, keyed, or
   * persisted. The default is identity. Subclasses override this when the host
   * addresses sessions under a scheme that differs from the agent provider
   * (e.g. a cloud sandbox host that lists sessions as `ahp-session:/<id>` while
   * its agent provider is `copilot`), so that routing, persistence, and content
   * resolution all agree on a single scheme. Must preserve the raw session id
   * (URI path) so cache keys remain stable.
   */
  _adoptSessionMeta(meta) {
    return meta;
  }
  /**
   * The backend (wire) session URI scheme for a given agent provider. Default is
   * identity (scheme == provider), which holds for every host except the Copilot
   * host used by cloud sandbox, whose sessions are addressed under
   * `ahp-session:/<id>` while the agent provider is `copilot`. Subclasses
   * override this so all backend `AgentSession.uri(...)` reconstructions on the
   * adapter and provider use the host's real scheme. Must be a stable per-provider
   * mapping.
   */
  _backendSessionScheme(agentProvider) {
    return agentProvider;
  }
  _logicalSessionTypeForBackendScheme(backendScheme) {
    return backendScheme;
  }
  _mapBackendSessionResource(resource) {
    const sessionType = this._logicalSessionTypeForBackendScheme(resource.scheme);
    return resource.with({ scheme: this.resourceSchemeForProvider(sessionType) });
  }
  /** Build an adapter for the given metadata. */
  createAdapter(meta) {
    const provider = AgentSession.provider(meta.session);
    if (!provider) {
      throw new Error(`Agent session URI has no provider scheme: ${meta.session.toString()}`);
    }
    const resourceScheme = this.resourceSchemeForProvider(provider);
    const options3 = {
      icon: this.iconForAgentProvider(provider) ?? this.icon,
      loading: this.authenticationPending,
      mapDiffUri: this._diffUriMapper(),
      gitHubService: this._gitHubService,
      instantiationService: this._instantiationService,
      getConnection: () => this.connection,
      agentCapabilities: this._agentCapabilities,
      backendSessionScheme: this._backendSessionScheme(provider),
      mapBackendSessionResource: (resource) => this._mapBackendSessionResource(resource),
      ...this._adapterOptions()
    };
    this._metaByRawId.set(AgentSession.id(meta.session), meta);
    return this._instantiationService.createInstance(AgentHostSessionAdapter, meta, this.id, resourceScheme, provider, options3);
  }
  updateAdapter(adapter, meta) {
    this._metaByRawId.set(AgentSession.id(meta.session), meta);
    this._cacheDirty = true;
    return adapter.update(meta);
  }
  /**
   * Whether `provider` should be advertised as a session type by this host.
   * Defaults to `true` (advertise everything the host reports). The local
   * provider overrides this to suppress the agent host's Claude when the
   * window prefers the extension-host Claude, mirroring the gate
   * {@link AgentHostContribution} applies to the chat session contribution so
   * the welcome picker doesn't list Claude twice.
   */
  _shouldAdvertiseAgent(_provider) {
    return true;
  }
  _syncRootState(rootState) {
    if (rootState && !(rootState instanceof Error)) {
      this._syncSessionTypesFromRootState(rootState);
      this._syncRootConfigFromRootState(rootState);
      return;
    }
    this._syncAgentCapabilities(void 0);
    if (this._sessionTypes.length > 0) {
      this._sessionTypes = [];
      this._onDidChangeSessionTypes.fire();
    }
    if (this._rootConfig) {
      this._rootConfig = void 0;
      this._onDidChangeRootConfig.fire();
    }
  }
  _syncAgentCapabilities(agents) {
    if (this._lastAgents === agents) {
      return;
    }
    this._lastAgents = agents;
    this._agentCapabilities.set(agents ? new Map(agents.map((agent) => [agent.provider, agent.capabilities])) : void 0, void 0);
    this._onDidChangeCustomAgents.fire();
    this._onDidChangeCustomizations.fire();
  }
  /**
   * Reconcile {@link _sessionTypes} against the agents advertised by the
   * host's root state, firing {@link onDidChangeSessionTypes} only if the
   * id/label set actually changed.
   */
  _syncSessionTypesFromRootState(rootState) {
    this._syncAgentCapabilities(rootState.agents);
    const next = rootState.agents.filter((agent) => this._shouldAdvertiseAgent(agent.provider)).map((agent) => ({
      id: agent.provider,
      supportsWorktreeConfiguration: agent.provider === CopilotCLISessionType.id,
      authRequirement: resolveAgentAuthRequirement(agent),
      // The chat session contribution and language models for an agent-host
      // agent are registered under its resource scheme (`agent-host-<provider>`),
      // not the bare provider id, so carry it for availability lookups.
      chatSessionType: this.resourceSchemeForProvider(agent.provider),
      label: this._formatSessionTypeLabel(agent.displayName?.trim() || agent.provider),
      icon: this.iconForAgentProvider(agent.provider) ?? this.icon
    }));
    const prev = this._sessionTypes;
    if (prev.length === next.length && prev.every((t2, i2) => t2.id === next[i2].id && t2.label === next[i2].label && t2.authRequirement === next[i2].authRequirement)) {
      return;
    }
    this._sessionTypes = next;
    this._onDidChangeSessionTypes.fire();
  }
  /**
   * Returns the {@link ThemeIcon} associated with a known agent provider, or
   * `undefined` when the provider is not recognised.
   */
  iconForAgentProvider(provider) {
    if (provider === CopilotCLISessionType.id) {
      return CopilotCLISessionType.icon;
    }
    if (provider.includes("claude")) {
      return Codicon.claude;
    }
    if (provider === "openai" || provider.includes("codex")) {
      return Codicon.openai;
    }
    return void 0;
  }
  /**
   * Reconcile {@link _rootConfig} against {@link RootState.config}, firing
   * {@link onDidChangeRootConfig} only when schema or values actually change.
   */
  _syncRootConfigFromRootState(rootState) {
    const next = rootState.config;
    const prev = this._rootConfig;
    if (prev === next) {
      return;
    }
    if (!next) {
      this._rootConfig = void 0;
      this._onDidChangeRootConfig.fire();
      return;
    }
    if (prev?.schema === next.schema && equals4(prev.values, next.values)) {
      return;
    }
    this._rootConfig = next;
    this._onDidChangeRootConfig.fire();
  }
  /** Optional event fired when the underlying connection is lost; used to short-circuit `_waitForNewSession`. */
  get onConnectionLost() {
    return Event2.None;
  }
  /** Maps a working-directory URI from the session summary to a local URI. Default identity; remote overrides to `toAgentHostUri`. */
  mapWorkingDirectoryUri(uri4) {
    return uri4;
  }
  /** Maps a project URI from the session summary to a local URI. Default identity; remote overrides for `file:` paths. */
  mapProjectUri(uri4) {
    return uri4;
  }
  // -- Session listing ------------------------------------------------------
  getSessionTypes(_repositoryUri) {
    return [...this.sessionTypes];
  }
  _syncActiveClient() {
    const cancellation = new ActiveClientSyncCancellationTokenSource();
    this._activeClientSyncCancellation.value = cancellation;
    const activeSession = this._sessionsService.activeSession.get();
    if (!activeSession || activeSession.providerId !== this.id) {
      this._clearActiveSessionScope();
      return;
    }
    const rawId = this._rawIdFromChatId(activeSession.sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (!rawId || !cached || !connection) {
      this._clearActiveSessionScope();
      return;
    }
    const sessionType = this.resourceSchemeForProvider(cached.agentProvider);
    let scope = this._activeSessionScope.value;
    if (!scope || this._activeSessionScopeSessionType !== sessionType || !this._activeClientService.areScopeRootsEqual(this._activeSessionScopeRoots, cached.workingDirectories)) {
      scope = this._activeClientService.acquireScope(sessionType, cached.workingDirectories);
      this._activeSessionScope.value = scope;
      this._activeSessionScopeSessionType = sessionType;
      this._activeSessionScopeRoots = [...cached.workingDirectories];
    }
    void this._dispatchActiveClientWhenResolved(cancellation.token, activeSession.sessionId, rawId, cached, connection, scope);
  }
  async _dispatchActiveClientWhenResolved(token, activeSessionId, rawId, cached, connection, scope) {
    await raceCancellation(scope.whenResolved(), token);
    const activeSession = this._sessionsService.activeSession.get();
    if (token.isCancellationRequested || scope !== this._activeSessionScope.value || this.connection !== connection || this._sessionCache.get(rawId) !== cached || activeSession?.providerId !== this.id || activeSession.sessionId !== activeSessionId) {
      return;
    }
    const activeClient = scope.activeClient(connection.clientId).get();
    const existing = this._lastSessionStates.get(cached.sessionId)?.activeClients.find((client) => client.clientId === activeClient.clientId);
    if (equals4(existing, activeClient)) {
      return;
    }
    connection.dispatch(AgentSession.uri(cached.agentProvider, rawId).toString(), {
      type: "session/activeClientSet" /* SessionActiveClientSet */,
      activeClient
    });
  }
  _clearActiveSessionScope() {
    this._activeClientSyncCancellation.clear();
    this._activeSessionScope.clear();
    this._activeSessionScopeSessionType = void 0;
    this._activeSessionScopeRoots = void 0;
  }
  getSessions() {
    this._ensureSessionCache();
    const pendingSession = this._pendingSession;
    const sessions = [];
    for (const cached of this._sessionCache.values()) {
      if (pendingSession && isEqual2(cached.resource, pendingSession.resource)) {
        continue;
      }
      if (this._shouldAdvertiseAgent(cached.agentProvider)) {
        sessions.push(cached);
      }
    }
    if (pendingSession && this._shouldAdvertiseAgent(pendingSession.sessionType)) {
      sessions.push(pendingSession);
    }
    return sessions;
  }
  getResourceLabelHomes() {
    const homes = [];
    for (const session of this.getKnownSessions()) {
      if (session.isQuickChat?.get()) {
        const adapter = session instanceof AgentHostSessionAdapter ? session : void 0;
        const label3 = this.getResourceLabelHomeLabel(session);
        homes.push(...(adapter?.workingDirectories ?? []).map((uri4) => ({ uri: uri4, label: label3 })));
      }
    }
    return homes;
  }
  getResourceLabelHomeLabel(session) {
    const providerLabel = this.sessionTypes.find((type) => type.id === session.sessionType)?.label ?? session.sessionType;
    return `${providerLabel}/${localize(5018, null)}`;
  }
  getKnownSessions() {
    const sessions = /* @__PURE__ */ new Map();
    for (const session of this._sessionCache.values()) {
      sessions.set(session.resource.toString(), session);
    }
    for (const newSession of this._newSessions.values()) {
      sessions.set(newSession.session.resource.toString(), newSession.session);
    }
    if (this._pendingSession) {
      sessions.set(this._pendingSession.resource.toString(), this._pendingSession);
    }
    return [...sessions.values()];
  }
  getSessionByResource(resource) {
    for (const newSession of this._newSessions.values()) {
      if (newSession.session.resource.toString() === resource.toString()) {
        return newSession.session;
      }
    }
    if (this._pendingSession?.resource.toString() === resource.toString()) {
      return this._pendingSession;
    }
    this._ensureSessionCache();
    for (const cached of this._sessionCache.values()) {
      if (cached.resource.toString() === resource.toString()) {
        this._keepSessionStateAlive(cached.sessionId);
        return cached;
      }
    }
    return void 0;
  }
  // -- Session lifecycle ----------------------------------------------------
  createNewSession(workspaceUri, sessionTypeId, options3) {
    if (!workspaceUri) {
      throw new Error("Workspace has no repository URI");
    }
    const sessionType = this.sessionTypes.find((t2) => t2.id === sessionTypeId);
    if (!sessionType) {
      throw new Error(this._noAgentsErrorMessage());
    }
    this._validateBeforeCreate(sessionType);
    const workspace = this.resolveWorkspace(workspaceUri);
    if (!workspace) {
      throw new Error(`Cannot resolve workspace for URI: ${workspaceUri.toString()}`);
    }
    return this._createDraftSession(sessionType, workspace, false, options3?.metadata);
  }
  startNewSessionRequest(sessionId, activity) {
    const newSession = this._getNewSession(sessionId);
    if (!newSession) {
      throw new Error("Cannot start a session that is no longer pending.");
    }
    return newSession.startRequest(activity);
  }
  createQuickChat(sessionTypeId) {
    const sessionType = this.sessionTypes.find((t2) => t2.id === sessionTypeId);
    if (!sessionType) {
      throw new Error(this._noAgentsErrorMessage());
    }
    this._validateBeforeCreate(sessionType);
    return this._createDraftSession(sessionType, void 0, true);
  }
  /**
   * Builds, tracks, and eagerly starts a {@link NewSession} draft for the
   * given session type. Shared by {@link createNewSession} (workspace-bound)
   * and {@link createQuickChat} (workspace-less, `quickChat === true`).
   */
  _createDraftSession(sessionType, workspace, quickChat, initialMetadata) {
    const connection = this.connection;
    const resourceScheme = this.resourceSchemeForProvider(sessionType.id);
    const activeClientScope = this._activeClientService.acquireScope(resourceScheme, workspace?.folders.map((folder) => folder.root) ?? []);
    let newSession;
    try {
      newSession = this._instantiationService.createInstance(NewSession, {
        workspace,
        quickChat,
        sessionType,
        providerId: this.id,
        icon: sessionType.icon,
        resourceScheme,
        backendSessionScheme: this._backendSessionScheme(sessionType.id),
        authenticationPending: this.authenticationPending,
        logService: this._logService,
        initialConfigValues: this._initialNewSessionConfig(workspace),
        initialConfigSchema: this._seededConfigSchema(),
        initialMetadata,
        instantiationService: this._instantiationService,
        onSessionState: (id2, state) => state === void 0 ? this._handleNewSessionStateGone(id2) : this._handleNewSessionStateUpdate(id2, state),
        activeClientScope
      }, {
        icon: this.iconForAgentProvider(sessionType.id) ?? this.icon,
        loading: this.authenticationPending,
        mapDiffUri: this._diffUriMapper(),
        gitHubService: this._gitHubService,
        instantiationService: this._instantiationService,
        getConnection: () => this.connection,
        agentCapabilities: this._agentCapabilities,
        mapBackendSessionResource: (resource) => this._mapBackendSessionResource(resource),
        ...this._adapterOptions()
      });
    } catch (err) {
      activeClientScope.dispose();
      throw err;
    }
    this._newSessions.set(newSession.sessionId, newSession);
    this._onDidChangeDraftSessions.fire();
    newSession.observeClientCustomAgents(activeClientScope.customAgents, () => {
      this._onDidChangeCustomAgents.fire();
      this._onDidChangeCustomizations.fire();
    });
    this._onDidChangeSessionConfig.fire(newSession.sessionId);
    if (connection) {
      if (!this.authenticationPending.get()) {
        this._startNewSessionBackend(newSession, connection);
      }
    } else {
      newSession.setLoading(false);
    }
    return newSession.session;
  }
  _resumeNewSessionAfterAuthenticationSettles() {
    const connection = this.connection;
    if (!connection) {
      return;
    }
    for (const newSession of this._newSessions.values()) {
      this._startNewSessionBackend(newSession, connection);
    }
  }
  _startNewSessionBackend(newSession, connection) {
    void newSession.trackConfigResolution(this._refreshNewSessionConfig(newSession, { markSessionLoading: true }));
    const workspaceUri = newSession.workspaceUri;
    const canCreate = newSession.requiresWorkspaceTrust && workspaceUri ? async () => {
      const { trusted } = await this._workspaceTrustManagementService.getUriTrustInfo(workspaceUri);
      if (this._newSessions.get(newSession.sessionId) !== newSession) {
        return false;
      }
      if (!trusted) {
        this._logService.trace(`[${this.id}] Skipping eager createSession for untrusted folder ${workspaceUri.toString()}`);
        newSession.setLoading(false);
        return false;
      }
      return true;
    } : void 0;
    newSession.eagerCreate(connection, canCreate);
  }
  /**
   * Re-resolves session config and pulses {@link _onDidChangeSessionConfig}.
   * Expected values are validated after strict resolutions.
   */
  async _refreshNewSessionConfig(session, options3 = {}) {
    const { expected, markSessionLoading } = options3;
    const connection = this.connection;
    if (!connection) {
      session.endResolveConfigSync();
      session.setLoading(false);
      this._onDidChangeSessionConfig.fire(session.sessionId);
      if (expected) {
        throw new Error("Cannot set session repository config without an agent host connection.");
      }
      return;
    }
    if (markSessionLoading) {
      session.setLoading(true);
    }
    let applied;
    try {
      applied = await session.resolveConfig(connection, !!expected);
    } catch (error) {
      session.setLoading(false);
      this._onDidChangeSessionConfig.fire(session.sessionId);
      throw error;
    }
    if (!applied || this._newSessions.get(session.sessionId) !== session) {
      if (expected) {
        throw new Error("Session repository config was superseded before it could be applied.");
      }
      return;
    }
    const config = session.getConfig();
    this._cacheSeededConfigSchemas(config);
    session.setLoading(config !== void 0 && !isSessionConfigComplete(config));
    this._onDidChangeSessionConfig.fire(session.sessionId);
    for (const [property, value2] of Object.entries(expected ?? {})) {
      if (!equals4(config?.values[property], value2)) {
        throw new Error(`Agent host did not apply session config '${property}'.`);
      }
    }
  }
  /**
   * Snapshot the well-known {@link SEEDED_CONFIG_SCHEMA_KEYS} schemas from an
   * authoritative resolve so the next new draft can render those chips
   * immediately (disabled) instead of blanking. A `undefined` config (failed
   * resolve) leaves the previous cache intact.
   */
  _cacheSeededConfigSchemas(config) {
    if (!config) {
      return;
    }
    for (const key3 of SEEDED_CONFIG_SCHEMA_KEYS) {
      const schema10 = config.schema.properties[key3];
      if (schema10) {
        this._cachedConfigSchemas.set(key3, schema10);
      } else {
        this._cachedConfigSchemas.delete(key3);
      }
    }
  }
  /** Seed schema for a fresh draft, or `undefined` when nothing is cached yet. */
  _seededConfigSchema() {
    if (this._cachedConfigSchemas.size === 0) {
      return void 0;
    }
    const seed = /* @__PURE__ */ Object.create(null);
    for (const [key3, schema10] of this._cachedConfigSchemas) {
      seed[key3] = schema10;
    }
    return seed;
  }
  /** Subclass hook for additional pre-create checks (e.g. remote requires connection). */
  _validateBeforeCreate(_sessionType) {
  }
  /** Localized "no agents" error message. Subclasses can override. */
  _noAgentsErrorMessage() {
    return localize(5016, null);
  }
  /**
   * Initial session-config values applied to a brand-new agent-host session
   * before its schema is resolved. Values are seeded from portable picks in
   * the profile-scoped remembered session-config map and then normalized
   * against policy/feature constraints.
   *
   * The agent-host defaults are controlled by the single
   * `chat.defaultConfiguration` object setting (with `mode` and
   * `approvals` properties). Per axis the precedence is: enterprise
   * **policy** value > the user's **remembered** last pick > the ordinary
   * configured **setting** value (treated as a plain default) > schema
   * default. So a normal setting behaves as a default that the remembered
   * pick overrides, while an enterprise policy still wins outright. The
   * local-only `chat.permissions.default` setting is intentionally NOT
   * consulted here.
   *
   * If enterprise policy disables global auto-approval
   * (`chat.tools.global.autoApprove` policy value `false`), the approval seed
   * is clamped to `default` so the agent host never starts in an elevated
   * permission level the user is not allowed to pick.
   *
   * The user's `git.branchPrefix` setting (resource-scoped to the workspace's
   * first folder) is seeded into the `worktreeBranchPrefix` slot so the agent
   * host can prepend it to the branch it creates for an isolated worktree.
   */
  _initialNewSessionConfig(workspace) {
    const config = /* @__PURE__ */ Object.create(null);
    const policyRestricted = isAutoApprovePolicyRestricted(this._baseConfigurationService);
    const rememberedValues = this._storageService.getObject(STORAGE_KEY_REMEMBERED_SESSION_CONFIG_VALUES, 0 /* PROFILE */, {});
    for (const [property, value2] of Object.entries(rememberedValues)) {
      if (typeof value2 === "string" && isRememberedSessionConfigKey(property)) {
        config[property] = value2;
      }
    }
    const remembered = migrateLegacyAutopilotConfig(config);
    const inspected = this._baseConfigurationService.inspect("chat.defaultConfiguration" /* DefaultConfiguration */);
    const policyDefaults = inspected.policyValue;
    const effectiveDefaults = inspected.value;
    const resolvedAutoApprove = normalizeAutoApproveValue(policyDefaults?.approvals, policyRestricted) ?? normalizeAutoApproveValue(remembered["autoApprove" /* AutoApprove */], policyRestricted) ?? normalizeAutoApproveValue(effectiveDefaults?.approvals, policyRestricted);
    if (resolvedAutoApprove) {
      remembered["autoApprove" /* AutoApprove */] = resolvedAutoApprove;
    } else {
      delete remembered["autoApprove" /* AutoApprove */];
    }
    const resolvedMode = [policyDefaults?.mode, remembered["mode" /* Mode */], effectiveDefaults?.mode].find((value2) => typeof value2 === "string" && KNOWN_MODE_VALUES.has(value2));
    if (resolvedMode) {
      remembered["mode" /* Mode */] = resolvedMode;
    } else {
      delete remembered["mode" /* Mode */];
    }
    const resource = workspace?.folders[0]?.root;
    const branchPrefix = this._baseConfigurationService.getValue("git.branchPrefix", { resource });
    if (typeof branchPrefix === "string" && branchPrefix.length > 0) {
      remembered["worktreeBranchPrefix" /* WorktreeBranchPrefix */] = branchPrefix;
    }
    const worktreeIncludeFiles = this._baseConfigurationService.getValue("git.worktreeIncludeFiles", { resource });
    if (Array.isArray(worktreeIncludeFiles) && worktreeIncludeFiles.length > 0) {
      remembered["worktreeIncludeFiles" /* WorktreeIncludeFiles */] = worktreeIncludeFiles;
    }
    return Object.keys(remembered).length > 0 ? remembered : void 0;
  }
  // -- Dynamic session config ----------------------------------------------
  getSessionConfig(sessionId) {
    const newSession = this._getNewSession(sessionId);
    if (newSession) {
      return newSession.getConfig();
    }
    this._keepSessionStateAlive(sessionId);
    return this._runningSessionConfigs.get(sessionId);
  }
  /**
   * Observable: `true` while a `resolveSessionConfig` round-trip is in
   * flight. Distinct from `session.loading` (which also covers the
   * required-values-missing state) — pickers gate on this so they stay
   * interactive when the user has to fill in required values.
   */
  isSessionConfigResolving(sessionId) {
    const newSession = this._getNewSession(sessionId);
    return newSession ? newSession.isResolvingConfig : constObservable(false);
  }
  async setSessionConfigValue(sessionId, property, value2) {
    const policyRestricted = isAutoApprovePolicyRestricted(this._baseConfigurationService);
    const normalizedValue = normalizeSessionConfigValue(property, value2, policyRestricted);
    if (typeof normalizedValue === "string" && isRememberedSessionConfigKey(property)) {
      const rememberedValues = this._storageService.getObject(STORAGE_KEY_REMEMBERED_SESSION_CONFIG_VALUES, 0 /* PROFILE */, {});
      const nextRememberedValues = /* @__PURE__ */ Object.create(null);
      for (const [key3, rememberedValue] of Object.entries(rememberedValues)) {
        if (typeof rememberedValue === "string" && isRememberedSessionConfigKey(key3)) {
          nextRememberedValues[key3] = rememberedValue;
        }
      }
      nextRememberedValues[property] = normalizedValue;
      this._storageService.store(STORAGE_KEY_REMEMBERED_SESSION_CONFIG_VALUES, JSON.stringify(nextRememberedValues), 0 /* PROFILE */, 1 /* MACHINE */);
    }
    const newSession = this._getNewSession(sessionId);
    if (newSession) {
      if (newSession.isResolvingConfig.get()) {
        return;
      }
      newSession.beginResolveConfigSync();
      newSession.setConfigValue(property, normalizedValue);
      this._onDidChangeSessionConfig.fire(sessionId);
      await newSession.trackConfigResolution(this._refreshNewSessionConfig(newSession));
      return;
    }
    const runningConfig = this._runningSessionConfigs.get(sessionId);
    const connection = this.connection;
    if (!runningConfig || !connection) {
      return;
    }
    const schema10 = runningConfig.schema.properties[property];
    if (!schema10?.sessionMutable) {
      return;
    }
    const nextValues = { ...runningConfig.values, [property]: normalizedValue };
    this._runningSessionConfigs.set(sessionId, {
      ...runningConfig,
      values: nextValues
    });
    this._onDidChangeSessionConfig.fire(sessionId);
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (cached && rawId) {
      const sessionUri = cached.backendUri;
      const action = { type: "session/configChanged" /* SessionConfigChanged */, config: { [property]: normalizedValue } };
      connection.dispatch(sessionUri.toString(), action);
      void this._resolveRunningSessionConfig(sessionId, cached, nextValues);
    }
  }
  async replaceSessionConfig(sessionId, values) {
    const runningConfig = this._runningSessionConfigs.get(sessionId);
    const connection = this.connection;
    if (!runningConfig || !connection) {
      return;
    }
    const policyRestricted = isAutoApprovePolicyRestricted(this._baseConfigurationService);
    const nextValues = {};
    for (const [key3, schema10] of Object.entries(runningConfig.schema.properties)) {
      const editable = schema10.sessionMutable === true && schema10.readOnly !== true;
      if (editable) {
        nextValues[key3] = normalizeSessionConfigValue(key3, values[key3], policyRestricted);
      } else if (Object.hasOwn(runningConfig.values, key3)) {
        nextValues[key3] = runningConfig.values[key3];
      }
    }
    for (const key3 of ["agentMerge" /* AgentMerge */, "agentMerge.controller" /* AgentMergeController */]) {
      if (Object.hasOwn(runningConfig.values, key3)) {
        nextValues[key3] = runningConfig.values[key3];
      }
    }
    if (equals4(nextValues, runningConfig.values)) {
      return;
    }
    this._runningSessionConfigs.set(sessionId, {
      ...runningConfig,
      values: nextValues
    });
    this._onDidChangeSessionConfig.fire(sessionId);
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (cached && rawId) {
      const sessionUri = cached.backendUri;
      const action = {
        type: "session/configChanged" /* SessionConfigChanged */,
        config: nextValues,
        replace: true
      };
      connection.dispatch(sessionUri.toString(), action);
      void this._resolveRunningSessionConfig(sessionId, cached, nextValues);
    }
  }
  getAgentMergeSessionState(sessionId) {
    return readAgentMergeSessionState(this._lastSessionStates.get(sessionId)?.config?.values);
  }
  async setAgentMergeEnabled(sessionId, enabled) {
    const current = this.getAgentMergeSessionState(sessionId);
    await this._writeAgentMergeClientState(sessionId, enabled, current?.overrides);
  }
  async setAgentMergeOverrides(sessionId, overrides) {
    const current = this.getAgentMergeSessionState(sessionId);
    await this._writeAgentMergeClientState(sessionId, current?.enabled ?? false, overrides);
  }
  async _writeAgentMergeClientState(sessionId, enabled, overrides) {
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (!rawId || !cached || !connection) {
      throw new Error(`[${this.id}] Cannot update Agent Merge state without a running session connection`);
    }
    connection.dispatch(cached.backendUri.toString(), {
      type: "session/configChanged" /* SessionConfigChanged */,
      config: {
        ["agentMerge" /* AgentMerge */]: {
          enabled,
          ...overrides ? { overrides } : {}
        }
      }
    });
  }
  async _resolveRunningSessionConfig(sessionId, cached, values) {
    const connection = this.connection;
    if (!connection) {
      return;
    }
    const seq = (this._runningSessionConfigResolveSeq.get(sessionId) ?? 0) + 1;
    this._runningSessionConfigResolveSeq.set(sessionId, seq);
    try {
      const resolved = await connection.resolveSessionConfig({
        provider: cached.agentProvider,
        workingDirectory: cached.workspace.get()?.folders[0]?.root,
        config: values
      });
      if (this._runningSessionConfigResolveSeq.get(sessionId) !== seq) {
        return;
      }
      this._runningSessionConfigs.set(sessionId, resolved);
      this._onDidChangeSessionConfig.fire(sessionId);
    } catch (err) {
      this._logService.warn(`[${this.id}] Failed to re-resolve session config for ${sessionId}: ${err}`);
    }
  }
  async getSessionConfigCompletions(sessionId, property, query) {
    const newSession = this._getNewSession(sessionId);
    const connection = this.connection;
    if (!newSession || !connection) {
      return [];
    }
    const result = await newSession.getConfigCompletions(connection, property, query);
    return result.items;
  }
  getCreateSessionConfig(sessionId) {
    return this._getNewSession(sessionId)?.getConfigValues();
  }
  async setIsolationMode(sessionId, mode) {
    const policyRestricted = isAutoApprovePolicyRestricted(this._baseConfigurationService);
    const value2 = normalizeSessionConfigValue(
      "isolation" /* Isolation */,
      mode === "workspace" ? "folder" : mode,
      policyRestricted
    );
    await this._setTransientNewSessionConfigValue(sessionId, "isolation" /* Isolation */, value2);
  }
  async setWorktreeConfiguration(sessionId, configuration2) {
    const policyRestricted = isAutoApprovePolicyRestricted(this._baseConfigurationService);
    const values = {};
    if (configuration2.isolationMode) {
      values["isolation" /* Isolation */] = normalizeSessionConfigValue(
        "isolation" /* Isolation */,
        configuration2.isolationMode === "workspace" ? "folder" : configuration2.isolationMode,
        policyRestricted
      );
    }
    if (configuration2.worktreeBranchTrack !== void 0) {
      values["worktreeBranchTrack" /* WorktreeBranchTrack */] = configuration2.worktreeBranchTrack;
    }
    if (configuration2.worktreeCreateNewBranch !== void 0) {
      values["worktreeCreateNewBranch" /* WorktreeCreateNewBranch */] = configuration2.worktreeCreateNewBranch;
    }
    if (configuration2.branch) {
      values["branch" /* Branch */] = normalizeSessionConfigValue("branch" /* Branch */, configuration2.branch, policyRestricted);
    }
    await this._setTransientNewSessionConfigValues(sessionId, values, false);
  }
  async setWorktreeBranchTrack(sessionId, enabled) {
    await this._setTransientNewSessionConfigValue(sessionId, "worktreeBranchTrack" /* WorktreeBranchTrack */, enabled);
  }
  async setWorktreeCreateNewBranch(sessionId, enabled) {
    await this._setTransientNewSessionConfigValue(sessionId, "worktreeCreateNewBranch" /* WorktreeCreateNewBranch */, enabled);
  }
  async setBranch(sessionId, branch) {
    const policyRestricted = isAutoApprovePolicyRestricted(this._baseConfigurationService);
    const value2 = normalizeSessionConfigValue("branch" /* Branch */, branch, policyRestricted);
    await this._setTransientNewSessionConfigValue(sessionId, "branch" /* Branch */, value2);
  }
  async _setTransientNewSessionConfigValue(sessionId, property, value2) {
    await this._setTransientNewSessionConfigValues(sessionId, { [property]: value2 }, true);
  }
  async _setTransientNewSessionConfigValues(sessionId, values, waitForCurrentResolve) {
    const newSession = this._getNewSession(sessionId);
    if (!newSession) {
      throw new Error("Cannot configure repository settings after session creation.");
    }
    await waitForState(this.authenticationPending, (pending) => !pending, void 0, newSession.cancellationToken);
    if (waitForCurrentResolve) {
      await waitForState(newSession.isResolvingConfig, (resolving) => !resolving, void 0, newSession.cancellationToken);
    }
    if (this._getNewSession(sessionId) !== newSession) {
      throw new Error("Session was disposed before repository configuration could be applied.");
    }
    newSession.beginResolveConfigSync();
    for (const [property, value2] of Object.entries(values)) {
      newSession.setConfigValue(property, value2);
    }
    this._onDidChangeSessionConfig.fire(sessionId);
    await newSession.trackConfigResolution(this._refreshNewSessionConfig(newSession, { expected: values }));
  }
  clearSessionConfig(sessionId) {
    if (this._newSessions.has(sessionId)) {
      this._newSessions.deleteAndDispose(sessionId);
      this._onDidChangeDraftSessions.fire();
    }
  }
  // -- Root (agent host) Config --------------------------------------------
  getRootConfig() {
    return this._rootConfig;
  }
  getRootState() {
    const value2 = this.connection?.rootState.value;
    return value2 instanceof Error ? void 0 : value2;
  }
  mapAgentHostResource(uri4) {
    return this.mapWorkingDirectoryUri(uri4);
  }
  async authenticate(params) {
    const connection = this.connection;
    if (!connection) {
      return { authenticated: false };
    }
    return connection.authenticate(params);
  }
  async setRootConfigValue(property, value2) {
    const current = this._rootConfig;
    const connection = this.connection;
    if (!current || !connection) {
      return;
    }
    if (!current.schema.properties[property]) {
      return;
    }
    this._rootConfig = {
      ...current,
      values: { ...current.values, [property]: value2 }
    };
    this._onDidChangeRootConfig.fire();
    const action = {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { [property]: value2 }
    };
    connection.dispatch(ROOT_STATE_URI, action);
  }
  async replaceRootConfig(values) {
    const current = this._rootConfig;
    const connection = this.connection;
    if (!current || !connection) {
      return;
    }
    const nextValues = {};
    for (const [key3, value2] of Object.entries(values)) {
      if (current.schema.properties[key3]) {
        nextValues[key3] = value2;
      }
    }
    if (equals4(nextValues, current.values)) {
      return;
    }
    this._rootConfig = { ...current, values: nextValues };
    this._onDidChangeRootConfig.fire();
    const action = {
      type: "root/configChanged" /* RootConfigChanged */,
      config: nextValues,
      replace: true
    };
    connection.dispatch(ROOT_STATE_URI, action);
  }
  // -- Model selection ------------------------------------------------------
  getModelsSnapshot(sessionId, desiredModelId) {
    const resourceScheme = this._resolveSessionResourceScheme(sessionId);
    if (!resourceScheme) {
      return {
        models: [],
        desiredModelResolution: resolveModelIdentifier([], desiredModelId, false),
        modelTarget: void 0
      };
    }
    const allModels = getRegisteredLanguageModels(this._languageModelsService);
    const models = allModels.filter((model) => {
      if (model.metadata.targetChatSessionType !== resourceScheme) {
        return false;
      }
      if (this._languageModelsService.isModelHidden(model.identifier)) {
        return false;
      }
      const manageModelsIdentifier = ILanguageModelChatMetadata.getAgentHostByokManageModelsIdentifier(model.metadata);
      return manageModelsIdentifier === void 0 || !this._languageModelsService.isModelHidden(manageModelsIdentifier);
    });
    const desiredModel = desiredModelId ? this._languageModelsService.lookupLanguageModel(desiredModelId) : void 0;
    const resolvedDesiredModelId = desiredModel?.targetChatSessionType && this.resourceSchemeForProvider(desiredModel.targetChatSessionType) === resourceScheme ? `${resourceScheme}:${desiredModel.id}` : desiredModelId;
    return {
      models,
      desiredModelResolution: resolveModelIdentifierFromLanguageModels(models, resolvedDesiredModelId, this._languageModelsService, allModels),
      modelTarget: resourceScheme
    };
  }
  getModelPickerOptions(sessionId) {
    const resourceScheme = this._resolveSessionResourceScheme(sessionId);
    const showAutoModel = !resourceScheme || this._chatSessionsService.supportsAutoModelForSessionType(resourceScheme);
    return {
      useGroupedModelPicker: true,
      showFeatured: true,
      showUnavailableFeatured: true,
      showManageModelsAction: true,
      showAutoModel
    };
  }
  /**
   * Resolve a remembered model selection at send time: when it is conclusively
   * unavailable and the harness supports Auto, return the Auto model identifier
   * (rather than `undefined`, which would leave an already-running chat pinned
   * to its stale backend model) so the request is explicitly reset to Auto.
   */
  _resolveSendModelId(sessionId, selectedModelId) {
    if (!selectedModelId) {
      return selectedModelId;
    }
    const snapshot = this.getModelsSnapshot(sessionId, selectedModelId);
    if (snapshot.desiredModelResolution.kind !== "unavailable") {
      return selectedModelId;
    }
    const resourceScheme = this._resolveSessionResourceScheme(sessionId);
    const supportsAuto = !resourceScheme || this._chatSessionsService.supportsAutoModelForSessionType(resourceScheme);
    if (!supportsAuto) {
      return selectedModelId;
    }
    const autoModelId = resolveConfiguredModel("auto", snapshot.models)?.identifier;
    this._logService.warn(`[${this.id}] Selected model '${selectedModelId}' is unavailable for session '${sessionId}'; falling back to Auto instead of sending an unroutable model.`);
    return autoModelId;
  }
  _resolveSessionResourceScheme(sessionId) {
    const newSession = this._getNewSession(sessionId);
    if (newSession) {
      return newSession.session.resource.scheme;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    return cached?.resource.scheme;
  }
  setModel(sessionId, chatResource, modelId, source) {
    const newSession = this._getNewSession(sessionId);
    if (newSession) {
      newSession.setSelectedModelId(modelId, source);
      return;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (cached && rawId && connection) {
      cached.setChatModelId(chatResource, modelId, source);
      this._updateChatSessionState(chatResource, modelId, cached.getChatMode(chatResource)?.id).catch((err) => this._logService.error(`[${this.id}] Failed to update chat model state for ${chatResource.toString()}`, err));
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  setAgent(sessionId, agent) {
    const newSession = this._getNewSession(sessionId);
    if (newSession) {
      newSession.setSelectedAgent(agent);
      return;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (cached && rawId && connection) {
      const chatResource = this._activeChatResource(cached);
      cached.setChatAgent(chatResource, agent);
      this._updateChatSessionState(chatResource, cached.getChatModelId(chatResource), agent?.uri).catch((err) => this._logService.error(`[${this.id}] Failed to update chat model state for ${chatResource.toString()}`, err));
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  getCustomAgents(sessionId) {
    const sessionState = this._lastSessionStates.get(sessionId);
    const stateAgents = getEffectiveAgents(sessionState?.customizations);
    const newSession = this._newSessions.get(sessionId);
    if (!newSession) {
      return stateAgents;
    }
    const clientAgents = newSession.getClientCustomAgents();
    if (clientAgents.length === 0) {
      return stateAgents;
    }
    const agentsByUri = new Map(stateAgents.map((agent) => [agent.uri.toString(), agent]));
    for (const agent of clientAgents) {
      agentsByUri.set(agent.uri.toString(), agent);
    }
    return [...agentsByUri.values()].sort((a, b) => a.name.localeCompare(b.name) || a.uri.toString().localeCompare(b.uri.toString()));
  }
  getCustomizations(sessionId) {
    const sessionState = this._lastSessionStates.get(sessionId);
    return sessionState?.customizations ?? [];
  }
  getWorkingDirectory(sessionId) {
    const sessionState = this._lastSessionStates.get(sessionId);
    return sessionState?.workingDirectories?.[0];
  }
  getBackendChatResource(chatResource) {
    const sessionResource = chatResource.with({ fragment: "" });
    const state = this._lastSessionStates.get(toSessionId(this.id, sessionResource));
    if (!state) {
      return void 0;
    }
    const backendResource = getSessionChatResource(state, chatResource.fragment || DEFAULT_CHAT_ID);
    if (!backendResource) {
      return void 0;
    }
    try {
      return URI.parse(backendResource.toString());
    } catch {
      return void 0;
    }
  }
  getWorkingDirectories(sessionId) {
    const sessionState = this._lastSessionStates.get(sessionId);
    return sessionState?.workingDirectories ?? [];
  }
  getMcpServers(sessionId) {
    const sessionState = this._lastSessionStates.get(sessionId);
    if (!sessionState) {
      return [];
    }
    const sessionUri = this._getBackendSessionUri(sessionId);
    if (!sessionUri) {
      return [];
    }
    return (sessionState.customizations ?? []).flatMap((customization) => customization.type === "mcpServer" /* McpServer */ ? [{ server: customization, plugin: void 0 }] : customization.children ? customization.children.filter((child) => child.type === "mcpServer" /* McpServer */).map((server) => ({
      server,
      plugin: customization.type === "plugin" /* Plugin */ ? customization : void 0
    })) : []).map(({ server, plugin }) => ({
      id: `${sessionUri.authority}/${server.id}`,
      name: server.name,
      enabled: isCustomizationEnabled(server) && (!plugin || isCustomizationEnabled(plugin)),
      enablement: server.enablement,
      disabledReason: getCustomizationDisabledReason(server, plugin),
      status: server.state.kind,
      state: server.state,
      setEnabled: (enabled) => {
        const connection = this.connection;
        if (!connection) {
          return;
        }
        connection.dispatch(sessionUri.toString(), {
          type: "session/customizationToggled" /* SessionCustomizationToggled */,
          id: server.id,
          enablement: withCustomizationEnablement(server.enablement, "session" /* Session */, { kind: "session" /* Session */, enabled })
        });
      },
      start: async () => {
        const connection = this.connection;
        if (!connection) {
          return;
        }
        connection.dispatch(sessionUri.toString(), {
          type: "session/mcpServerStartRequested" /* SessionMcpServerStartRequested */,
          id: server.id
        });
      },
      stop: async () => {
        const connection = this.connection;
        if (!connection) {
          return;
        }
        connection.dispatch(sessionUri.toString(), {
          type: "session/mcpServerStopRequested" /* SessionMcpServerStopRequested */,
          id: server.id
        });
      }
    }));
  }
  setCustomizationEnablement(sessionId, customizationId2, enablement) {
    const sessionUri = this._getBackendSessionUri(sessionId);
    const connection = this.connection;
    if (!sessionUri || !connection) {
      return;
    }
    connection.dispatch(sessionUri.toString(), {
      type: "session/customizationToggled" /* SessionCustomizationToggled */,
      id: customizationId2,
      enablement: [...enablement]
    });
  }
  getFeedbackAnnotationsChannel(sessionId) {
    const connection = this.connection;
    if (!connection) {
      return void 0;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (!cached || !rawId) {
      return void 0;
    }
    const sessionUri = cached.backendUri;
    const annotationsUri = URI.parse(buildAnnotationsUri(sessionUri.toString()));
    return { connection, annotationsUri };
  }
  // -- Session actions ------------------------------------------------------
  async archiveSession(sessionId) {
    this._setSessionArchived(sessionId, true);
  }
  async unarchiveSession(sessionId) {
    this._setSessionArchived(sessionId, false);
  }
  /**
   * Flips a session's archived state locally and dispatches the owning action
   * so the host persists it and fans it out to other windows.
   *
   * Skips the local flip when disconnected: showing a session as archived when
   * the change can never be recorded is worse than appearing not to archive.
   */
  _setSessionArchived(sessionId, isArchived) {
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (!cached || !rawId || !connection) {
      return;
    }
    cached.isArchived.set(isArchived, void 0);
    this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    connection.dispatch(cached.backendUri.toString(), { type: "session/isArchivedChanged" /* SessionIsArchivedChanged */, isArchived });
  }
  async setSessionReadState(sessionId, isRead) {
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (cached && rawId && cached.isRead.get() !== isRead) {
      cached.isRead.set(isRead, void 0);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
      const connection = this.connection;
      if (connection) {
        const sessionUri = cached.backendUri;
        const action = { type: "session/isReadChanged" /* SessionIsReadChanged */, isRead };
        connection.dispatch(sessionUri.toString(), action);
      }
    }
  }
  async deleteSession(sessionId) {
    await this.deleteSessions([sessionId]);
  }
  async deleteSessions(sessionIds) {
    const connection = this.connection;
    if (!connection) {
      return;
    }
    const targets = [];
    for (const sessionId of sessionIds) {
      const rawId = this._rawIdFromChatId(sessionId);
      const cached = rawId ? this._sessionCache.get(rawId) : void 0;
      if (cached && rawId) {
        targets.push({ rawId, cached });
      }
    }
    if (targets.length === 0) {
      return;
    }
    const removed = [];
    try {
      for (const { rawId, cached } of targets) {
        await connection.disposeSession(cached.backendUri);
        const removedSession = this._removeCachedSession(rawId, cached);
        if (removedSession) {
          removed.push(removedSession);
        }
      }
    } finally {
      if (removed.length > 0) {
        this._onDidChangeSessions.fire({ added: [], removed, changed: [] });
        for (const cached of removed) {
          cached.dispose();
        }
      }
    }
  }
  async renameChat(sessionId, chatUri, title) {
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (!cached || !rawId || !connection) {
      return;
    }
    const sessionUri = cached.backendUri;
    const chatId = chatUri.fragment;
    const action = { type: "session/titleChanged" /* SessionTitleChanged */, title };
    if (chatId) {
      cached.setAdditionalChatTitle(chatId, title);
      connection.dispatch(buildChatUri(sessionUri, chatId), action);
    } else {
      cached.setDefaultChatTitle(title);
      connection.dispatch(buildDefaultChatUri(sessionUri), action);
    }
    this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
  }
  async renameSession(sessionId, title) {
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (cached && rawId && connection) {
      cached.title.set(title, void 0);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
      const sessionUri = cached.backendUri;
      const action = { type: "session/titleChanged" /* SessionTitleChanged */, title };
      connection.dispatch(sessionUri.toString(), action);
    }
  }
  async deleteChat(sessionId, chatUri, options3) {
    const chatId = chatUri.fragment;
    if (!chatId) {
      return false;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    const connection = this.connection;
    if (!rawId || !cached || !connection) {
      return false;
    }
    const sessionUri = cached.backendUri;
    const ahpChatUri = URI.parse(buildChatUri(sessionUri, chatId));
    if (!options3?.skipConfirmation) {
      const confirmed = await this._dialogService.confirm({
        message: localize(5010, null),
        detail: localize(5012, null),
        primaryButton: localize(5011, null)
      });
      if (!confirmed.confirmed) {
        return false;
      }
    }
    this._keepSessionStateAlive(cached.sessionId);
    await connection.disposeChat(ahpChatUri);
    return true;
  }
  async createNewChat(chatId) {
    const connection = this.connection;
    if (!connection) {
      throw new Error(this._notConnectedSendErrorMessage());
    }
    const newSession = this._getNewSession(chatId);
    if (newSession) {
      await this._chatSessionsService.getOrCreateChatSession(newSession.session.resource, CancellationToken.None);
      return newSession.session.mainChat.get();
    }
    return this._createAdditionalChat(chatId, connection);
  }
  async _createAdditionalChat(chatId, connection) {
    const rawId = this._rawIdFromChatId(chatId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (!rawId || !cached) {
      throw new Error(`Session '${chatId}' not found`);
    }
    if (!cached.capabilities.get().supportsMultipleChats) {
      throw new Error(`Session '${chatId}' does not support multiple chats`);
    }
    const sessionUri = cached.backendUri;
    const newChatId = generateUuid();
    const chatUri = URI.parse(buildChatUri(sessionUri, newChatId));
    const selectedModelId = cached.modelId.get() ?? (cached.modelSelection ? `${cached.resource.scheme}:${cached.modelSelection.id}` : void 0);
    const selectedAgentUri = cached.mode.get()?.id;
    cached.markChatAsNew(newChatId);
    this._keepSessionStateAlive(cached.sessionId);
    await connection.createChat(sessionUri, chatUri, {
      model: cached.modelSelection
    });
    const chat = await waitForState(
      cached.chats.map((chats) => chats.find((c) => c.resource.fragment === newChatId)),
      (c) => !!c
    );
    cached.setChatModelId(chat.resource, selectedModelId, "carriedOver" /* CarriedOver */);
    cached.setChatAgent(chat.resource, selectedAgentUri ? { uri: selectedAgentUri, name: "" } : void 0);
    await this._retainChatSessionModel(chat.resource, selectedModelId, selectedAgentUri);
    return chat;
  }
  async forkChat(sessionId, sourceChat, turnId) {
    const connection = this.connection;
    if (!connection) {
      throw new Error(this._notConnectedSendErrorMessage());
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (!rawId || !cached) {
      throw new Error(`Session '${sessionId}' not found`);
    }
    if (!cached.capabilities.get().supportsMultipleChats) {
      throw new Error(`Session '${sessionId}' does not support multiple chats`);
    }
    const sessionUri = cached.backendUri;
    const newChatId = generateUuid();
    const chatUri = URI.parse(buildChatUri(sessionUri, newChatId));
    const sourceBackendUri = this._resolveBackendSourceChatUri(cached.sessionId, sessionUri, sourceChat);
    const selectedModel = cached.getChatModelSelection(sourceChat);
    const selectedModelId = cached.getChatModelId(sourceChat) ?? (selectedModel ? `${cached.resource.scheme}:${selectedModel.id}` : void 0);
    const selectedAgentUri = cached.getChatMode(sourceChat)?.id;
    this._keepSessionStateAlive(cached.sessionId);
    await connection.createChat(sessionUri, chatUri, {
      model: selectedModel,
      fork: { source: sourceBackendUri, turnId }
    });
    const chat = await waitForState(
      cached.chats.map((chats) => chats.find((c) => c.resource.fragment === newChatId)),
      (c) => !!c
    );
    cached.setChatModelId(chat.resource, selectedModelId, "carriedOver" /* CarriedOver */);
    cached.setChatAgent(chat.resource, selectedAgentUri ? { uri: selectedAgentUri, name: "" } : void 0);
    await this._retainChatSessionModel(chat.resource, selectedModelId, selectedAgentUri);
    return chat;
  }
  async createSideChat(sessionId, sourceChat, turnId, selection) {
    const connection = this.connection;
    if (!connection) {
      throw new Error(this._notConnectedSendErrorMessage());
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (!rawId || !cached) {
      throw new Error(`Session '${sessionId}' not found`);
    }
    if (!cached.capabilities.get().supportsSideChat) {
      throw new Error(`Session '${sessionId}' does not support side chats`);
    }
    const sessionUri = AgentSession.uri(cached.agentProvider, rawId);
    const newChatId = generateUuid();
    const chatUri = URI.parse(buildChatUri(sessionUri, newChatId));
    const sourceBackendUri = this._resolveBackendSourceChatUri(cached.sessionId, sessionUri, sourceChat);
    const selectedModel = cached.getChatModelSelection(sourceChat);
    const selectedModelId = cached.getChatModelId(sourceChat) ?? (selectedModel ? `${cached.resource.scheme}:${selectedModel.id}` : void 0);
    const selectedAgentUri = cached.getChatMode(sourceChat)?.id;
    this._keepSessionStateAlive(cached.sessionId);
    await connection.createChat(sessionUri, chatUri, {
      model: selectedModel,
      sideChat: {
        source: sourceBackendUri,
        turnId,
        ...selection ? { selection } : {}
      }
    });
    const chat = await waitForState(
      cached.chats.map((chats) => chats.find((c) => c.resource.fragment === newChatId)),
      (c) => !!c
    );
    cached.setChatModelId(chat.resource, selectedModelId, "carriedOver" /* CarriedOver */);
    cached.setChatAgent(chat.resource, selectedAgentUri ? { uri: selectedAgentUri, name: "" } : void 0);
    await this._retainChatSessionModel(chat.resource, selectedModelId, selectedAgentUri);
    return chat;
  }
  _resolveBackendSourceChatUri(sessionId, sessionUri, sourceChat) {
    if (sourceChat.fragment) {
      return URI.parse(buildChatUri(sessionUri, sourceChat.fragment));
    }
    const hydratedDefaultChat = this._lastSessionStates.get(sessionId)?.defaultChat;
    return hydratedDefaultChat ? URI.parse(hydratedDefaultChat.toString()) : URI.parse(buildDefaultChatUri(sessionUri));
  }
  async sendRequest(chatId, chatResource, options3) {
    const newSession = this._getNewSession(chatId);
    if (newSession) {
      return this._sendNewSessionRequest(newSession, chatId, chatResource, options3);
    }
    return this._sendCommittedChatRequest(chatId, chatResource, options3);
  }
  /** Send the first request for an already-committed peer chat, then clear its `new` flag. */
  async _sendCommittedChatRequest(chatId, chatResource, options3) {
    const rawId = this._rawIdFromChatId(chatId);
    const cached = rawId ? this._sessionCache.get(rawId) : void 0;
    if (!rawId || !cached) {
      throw new Error(`Session '${chatId}' not found`);
    }
    const { query, attachedContext } = options3;
    const sessionType = chatResource.scheme;
    const contribution = this._chatSessionsService.getChatSessionContribution(sessionType);
    const selectedModelId = this._resolveSendModelId(chatId, cached.getChatModelId(chatResource));
    const selectedAgentUri = cached.getChatMode(chatResource)?.id;
    const sendOptions = {
      location: "panel" /* Chat */,
      userSelectedModelId: selectedModelId,
      modeInfo: selectedAgentUri ? {
        kind: "agent" /* Agent */,
        isBuiltin: false,
        modeInstructions: {
          uri: URI.parse(selectedAgentUri),
          name: "",
          content: "",
          toolReferences: []
        },
        telemetryModeId: "custom",
        applyCodeBlockSuggestionId: void 0,
        permissionLevel: void 0
      } : {
        kind: "agent" /* Agent */,
        isBuiltin: true,
        modeInstructions: void 0,
        telemetryModeId: "agent",
        applyCodeBlockSuggestionId: void 0,
        permissionLevel: void 0
      },
      agentIdSilent: contribution?.type,
      attachedContext,
      hideFromTranscript: options3.hideFromTranscript
    };
    const modelRef = await this._chatService.acquireOrLoadSession(chatResource, "panel" /* Chat */, CancellationToken.None);
    if (!modelRef) {
      throw new Error(`[${this.id}] Unable to load chat session ${chatResource.toString()}`);
    }
    try {
      this._applyChatSessionState(modelRef, selectedModelId, selectedAgentUri);
      const result = await this._chatService.sendRequest(chatResource, query, sendOptions);
      if (result.kind === "rejected") {
        throw new Error(`[${this.id}] sendRequest rejected: ${result.reason}`);
      }
      this._applyChatSessionState(modelRef, selectedModelId, selectedAgentUri, { clearDraft: true });
    } finally {
      modelRef.dispose();
    }
    cached.markChatAsSent(chatResource.fragment);
    return cached;
  }
  async _updateChatSessionState(chatResource, modelId, agentUri, options3) {
    const modelRef = await this._chatService.acquireOrLoadSession(chatResource, "panel" /* Chat */, CancellationToken.None);
    if (!modelRef) {
      return;
    }
    try {
      this._applyChatSessionState(modelRef, modelId, agentUri, options3);
    } finally {
      modelRef.dispose();
    }
  }
  async _retainChatSessionModel(chatResource, modelId, agentUri) {
    const modelRef = await this._chatService.acquireOrLoadSession(chatResource, "panel" /* Chat */, CancellationToken.None);
    if (!modelRef) {
      return;
    }
    this._applyChatSessionState(modelRef, modelId, agentUri);
    const resourceKey = chatResource.toString();
    const lease = new DisposableStore();
    lease.add(modelRef);
    lease.add(disposableTimeout(() => this._chatModelRetentionLeases.deleteAndDispose(resourceKey), BaseAgentHostSessionsProvider.CHAT_MODEL_RETENTION_MS));
    this._chatModelRetentionLeases.set(resourceKey, lease);
  }
  _applyChatSessionState(modelRef, modelId, agentUri, options3) {
    const inputModel = modelRef.object.inputModel;
    if (!inputModel) {
      return;
    }
    if (modelId) {
      const languageModel = this._languageModelsService.lookupLanguageModel(modelId);
      if (languageModel) {
        inputModel.setState({ selectedModel: { identifier: modelId, metadata: languageModel } });
      }
    }
    inputModel.setState({
      mode: { id: agentUri ?? ChatMode.Agent.id, kind: "agent" /* Agent */ },
      ...options3?.clearDraft ? { inputText: "", attachments: [], selections: [] } : {}
    });
  }
  async _sendNewSessionRequest(newSession, chatId, chatResource, options3) {
    if (!this.connection) {
      throw new Error(this._notConnectedSendErrorMessage());
    }
    await newSession.waitForConfigResolution();
    await newSession.waitForEagerCreate();
    if (this._getNewSession(newSession.sessionId) !== newSession) {
      throw new Error("Session was disposed before its configuration could be applied.");
    }
    if (!this.connection) {
      throw new Error(this._notConnectedSendErrorMessage());
    }
    const selectedModelId = this._resolveSendModelId(chatId, newSession.getSelectedModelId());
    const selectedAgent = newSession.getSelectedAgent();
    const { query, attachedContext } = options3;
    const sessionType = chatResource.scheme;
    const contribution = this._chatSessionsService.getChatSessionContribution(sessionType);
    const sendOptions = {
      location: "panel" /* Chat */,
      userSelectedModelId: selectedModelId,
      modeInfo: selectedAgent ? {
        kind: "agent" /* Agent */,
        isBuiltin: false,
        modeInstructions: {
          uri: URI.parse(selectedAgent.uri),
          name: "",
          content: "",
          toolReferences: []
        },
        telemetryModeId: "custom",
        applyCodeBlockSuggestionId: void 0,
        permissionLevel: void 0
      } : {
        kind: "agent" /* Agent */,
        isBuiltin: true,
        modeInstructions: void 0,
        telemetryModeId: "agent",
        applyCodeBlockSuggestionId: void 0,
        permissionLevel: void 0
      },
      agentIdSilent: contribution?.type,
      attachedContext,
      agentHostSessionConfig: this.getCreateSessionConfig(chatId),
      hideFromTranscript: options3.hideFromTranscript
    };
    const modelRef = await this._chatService.acquireOrLoadSession(chatResource, "panel" /* Chat */, CancellationToken.None);
    if (modelRef) {
      if (selectedModelId) {
        const languageModel = this._languageModelsService.lookupLanguageModel(selectedModelId);
        if (languageModel) {
          modelRef.object.inputModel.setState({ selectedModel: { identifier: selectedModelId, metadata: languageModel } });
        }
      }
      if (selectedAgent) {
        modelRef.object.inputModel.setState({ mode: { id: selectedAgent.uri, kind: "agent" /* Agent */ } });
      }
      modelRef.dispose();
    }
    this._ensureSessionCache();
    const existingKeys = new Set(this._sessionCache.keys());
    const newSessionRawId = chatResource.path.replace(/^\//, "");
    existingKeys.delete(newSessionRawId);
    this._inFlightNewSessionOwnIds.add(newSessionRawId);
    const result = await this._chatService.sendRequest(chatResource, query, sendOptions);
    if (result.kind === "rejected") {
      throw new Error(`[${this.id}] sendRequest rejected: ${result.reason}`);
    }
    newSession.setStatus(1 /* InProgress */);
    newSession.clearSelectedModelId();
    newSession.setTitle((options3.title || query.split("\n")[0]).substring(0, 100) || newSession.untitledTitle);
    const skeleton = newSession.session;
    this._pendingSession = skeleton;
    this._onDidChangeSessions.fire({ added: [skeleton], removed: [], changed: [] });
    let committedRawId;
    try {
      const committedSession = await this._waitForNewSession(existingKeys, chatResource.scheme, newSessionRawId, newSession.cancellationToken);
      if (committedSession) {
        committedRawId = committedSession.resource.path.substring(1);
        this._preserveNewSessionConfig(newSession, committedSession.sessionId);
        if (options3.title) {
          await this.renameSession(committedSession.sessionId, options3.title);
        }
        if (selectedAgent) {
          const committedRawIdForAgent = this._rawIdFromChatId(committedSession.sessionId);
          const committedAdapter = committedRawIdForAgent ? this._sessionCache.get(committedRawIdForAgent) : void 0;
          committedAdapter?.setChatAgent(committedAdapter.resource, selectedAgent);
        }
        newSession.graduate();
        if (this._newSessions.get(newSession.sessionId) === newSession) {
          this._newSessions.deleteAndDispose(newSession.sessionId);
          this._onDidChangeDraftSessions.fire();
        }
        this._pendingSession = void 0;
        this._onDidReplaceSession.fire({ from: skeleton, to: committedSession });
        return committedSession;
      }
    } catch {
    } finally {
      if (committedRawId !== void 0) {
        this._committingSessionRawIds.delete(committedRawId);
      }
      this._inFlightNewSessionOwnIds.delete(newSessionRawId);
      this._pendingSession = void 0;
    }
    newSession.graduate();
    if (this._newSessions.get(newSession.sessionId) === newSession) {
      this._newSessions.deleteAndDispose(newSession.sessionId);
      this._onDidChangeDraftSessions.fire();
    }
    this._onDidChangeSessions.fire({ added: [], removed: [skeleton], changed: [] });
    throw new Error(localize(5019, null));
  }
  /** Localized error message when sendRequest is invoked without a connection. Subclasses can override. */
  _notConnectedSendErrorMessage() {
    return localize(5017, null);
  }
  // -- Session config plumbing ---------------------------------------------
  /**
   * When a session transitions from untitled (new) to committed (running),
   * carry over the full resolved config (schema + values) so consumers like
   * the session-settings JSONC editor can round-trip non-mutable values
   * (`isolation`, `branch`, …) through a replace dispatch. Mutable-vs-readonly
   * behavior is still driven off the per-property `sessionMutable` flag.
   */
  _preserveNewSessionConfig(newSession, committedSessionId) {
    const config = newSession.getConfig();
    if (config && Object.keys(config.schema.properties).length > 0) {
      this._runningSessionConfigs.set(committedSessionId, {
        schema: { type: "object", properties: { ...config.schema.properties } },
        values: { ...config.values }
      });
    }
    this._applyWorktreeIsolation(committedSessionId, config?.values);
  }
  _rawIdFromChatId(chatId) {
    const prefix = `${this.id}:`;
    const resourceStr = chatId.startsWith(prefix) ? chatId.substring(prefix.length) : chatId;
    try {
      return URI.parse(resourceStr).path.substring(1) || void 0;
    } catch {
      return void 0;
    }
  }
  /**
   * Guesses which of a session's chats an operation meant, for APIs that are keyed by session id
   * alone and so cannot say.
   *
   * A guess, not an answer: it reads whichever session is globally active, so an operation on a
   * visible peer chat that is not the active one lands on the wrong conversation. Callers that
   * can name their chat should take it as a parameter instead, as
   * {@link ISessionsProvider.setModel} does.
   */
  _activeChatResource(session) {
    const activeSession = this._sessionsService.activeSession.get();
    return activeSession?.sessionId === session.sessionId ? activeSession.activeChat.get().resource : session.resource;
  }
  static {
    // -- Lazy session-state subscription seeding -----------------------------
    /**
     * Idle window before a lazily-created session-state subscription is
     * released. Each call to {@link _keepSessionStateAlive} resets the timer.
     * Long enough to absorb the open→config-picker churn while a session view
     * is active; short enough that closed sessions release within a minute or
     * so, allowing the agent host to evict their cached restored state.
     */
    this.SESSION_STATE_SUBSCRIPTION_IDLE_MS = 3e4;
  }
  static {
    this.CHAT_MODEL_RETENTION_MS = 1e4;
  }
  /**
   * Pin the state subscription of every currently-visible session (so
   * host-driven catalog changes flow into `cached.chats` while it is on
   * screen) and resume the idle-release timer for sessions that have left the
   * viewport. Driven reactively by {@link ISessionsService.visibleSessions}.
   */
  _syncVisibleSessionStatePins(reader) {
    const visible = this._sessionsService.visibleSessions.read(reader);
    const nowVisible = /* @__PURE__ */ new Set();
    for (const session of visible) {
      if (!session) {
        continue;
      }
      for (const cached of this._sessionCache.values()) {
        if (isEqual2(cached.resource, session.resource)) {
          nowVisible.add(cached.sessionId);
          break;
        }
      }
    }
    for (const sessionId of nowVisible) {
      this._pinnedSessionStates.add(sessionId);
      this._ensureSessionStateSubscription(sessionId);
      this._sessionStateIdleTimers.deleteAndDispose(sessionId);
    }
    for (const sessionId of [...this._pinnedSessionStates]) {
      if (!nowVisible.has(sessionId)) {
        this._pinnedSessionStates.delete(sessionId);
        this._keepSessionStateAlive(sessionId);
      }
    }
  }
  /**
   * Bump the idle-release timer for `sessionId` and lazily create the
   * underlying subscription if needed. Called from query paths
   * ({@link getSessionByResource}, {@link getSessionConfig}) that depend on
   * `_runningSessionConfigs` / `_meta` being in sync but cannot themselves
   * own a subscription handle.
   */
  _keepSessionStateAlive(sessionId) {
    this._ensureSessionStateSubscription(sessionId);
    if (!this._sessionStateSubscriptions.has(sessionId)) {
      return;
    }
    if (this._pinnedSessionStates.has(sessionId)) {
      this._sessionStateIdleTimers.deleteAndDispose(sessionId);
      return;
    }
    this._sessionStateIdleTimers.set(
      sessionId,
      disposableTimeout(
        () => {
          this._sessionStateIdleTimers.deleteAndDispose(sessionId);
          this._sessionStateSubscriptions.deleteAndDispose(sessionId);
        },
        BaseAgentHostSessionsProvider.SESSION_STATE_SUBSCRIPTION_IDLE_MS
      )
    );
  }
  _keepChatSessionStateAlive(chatChannel) {
    const parsedChat = parseChatUri(chatChannel);
    if (!parsedChat) {
      return;
    }
    const cached = this._sessionCache.get(AgentSession.id(parsedChat.session));
    if (cached) {
      this._keepSessionStateAlive(cached.sessionId);
    }
  }
  /**
   * Lazily acquire a session-state subscription for `sessionId` so that
   * `_runningSessionConfigs` is seeded from the AHP `SessionState.config`
   * snapshot. Safe to call repeatedly — no-op once a subscription exists.
   *
   * The subscription is reference-counted by {@link IAgentConnection.getSubscription},
   * so when the session handler is also subscribed (chat content open) this
   * shares the existing wire subscription rather than opening a new one.
   */
  _ensureSessionStateSubscription(sessionId) {
    if (this._sessionStateSubscriptions.has(sessionId)) {
      return;
    }
    const connection = this.connection;
    if (!connection) {
      return;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    if (!rawId) {
      return;
    }
    if (readSessionEhcliAdoptable(this._metaByRawId.get(rawId)?._meta)) {
      return;
    }
    const cached = this._sessionCache.get(rawId);
    if (!cached) {
      return;
    }
    const sessionUri = cached.backendUri;
    const ref = connection.getSubscription(1 /* Session */, sessionUri, "BaseAgentHostSessionsProvider.summary");
    if (ref.object.value instanceof Error) {
      ref.dispose();
      return;
    }
    const store = new DisposableStore();
    store.add(ref);
    store.add(ref.object.onDidChange((state) => {
      this._applySessionStateUpdate(sessionId, state);
    }));
    const onDidError = ref.object.onDidError;
    if (onDidError) {
      store.add(onDidError(() => {
        if (this._sessionStateSubscriptions.get(sessionId) === store) {
          this._sessionStateSubscriptions.deleteAndDispose(sessionId);
        }
      }));
    }
    this._sessionStateSubscriptions.set(sessionId, store);
    const value2 = ref.object.value;
    if (value2 && !(value2 instanceof Error)) {
      this._applySessionStateUpdate(sessionId, value2);
    }
    this._hydrateAgentFromDraft(connection, cached, sessionId, sessionUri, store);
    this._hydrateModelFromDraft(connection, cached, sessionId, sessionUri, store);
  }
  /**
   * Resume hydration: when a session is (re)loaded and its adapter has no agent
   * selected, restore the persisted selection from the default chat's
   * `ChatState.draft.agent` and mirror it onto `session.mode` (the picker's
   * source of truth).
   *
   * The agent is persisted on the chat channel — the session channel
   * ({@link SessionState}) carries no draft — so we briefly observe the default
   * chat's state until its draft agent arrives. The subscription is shared and
   * ref-counted with the chat session handler (no extra wire cost) and lives for
   * the session-state store's lifetime. Hydration is one-shot: the observer
   * stops as soon as `mode` is set — by us here, or by a concurrent graduation
   * seed or user pick (guarded inside
   * {@link AgentHostSessionAdapter.hydrateSelectedAgent}) — so it neither leaks,
   * overrides a later selection, nor keeps re-running on every chat update.
   */
  _hydrateAgentFromDraft(connection, cached, sessionId, sessionUri, store) {
    if (cached.mode.get() !== void 0) {
      return;
    }
    const lastDefaultChat = this._lastSessionStates.get(sessionId)?.defaultChat;
    const defaultChatUri = lastDefaultChat ? URI.parse(lastDefaultChat.toString()) : URI.parse(buildDefaultChatUri(sessionUri));
    const chatRef = connection.getSubscription(2 /* Chat */, defaultChatUri, "BaseAgentHostSessionsProvider.draftAgent");
    store.add(chatRef);
    const listener = store.add(new MutableDisposable());
    const tryHydrate = () => {
      if (cached.mode.get() === void 0) {
        const chatState = chatRef.object.value;
        const agentUri = chatState && !(chatState instanceof Error) ? chatState.draft?.agent?.uri : void 0;
        if (agentUri) {
          cached.hydrateSelectedAgent(agentUri);
        }
      }
      if (cached.mode.get() !== void 0) {
        listener.clear();
      }
    };
    listener.value = chatRef.object.onDidChange(() => tryHydrate());
    tryHydrate();
  }
  /**
   * Resume hydration for the model, mirroring {@link _hydrateAgentFromDraft}.
   *
   * A reloaded session reports `modelId === undefined` until something tells it otherwise, and an
   * undefined model reads as "this conversation has never chosen one" — which invites model
   * selection to seed it from a profile-wide preference and write that through to the backend.
   * The model the session was actually running on is on the default chat's `ChatState.draft`, so
   * it is read back the same way the draft agent is.
   *
   * One-shot and guarded inside {@link AgentHostSessionAdapter.hydrateSelectedModel}, so it
   * neither leaks nor overrides a selection made in the meantime.
   */
  _hydrateModelFromDraft(connection, cached, sessionId, sessionUri, store) {
    if (cached.modelId.get() !== void 0) {
      return;
    }
    const lastDefaultChat = this._lastSessionStates.get(sessionId)?.defaultChat;
    const defaultChatUri = lastDefaultChat ? URI.parse(lastDefaultChat.toString()) : URI.parse(buildDefaultChatUri(sessionUri));
    const chatRef = connection.getSubscription(2 /* Chat */, defaultChatUri, "BaseAgentHostSessionsProvider.draftModel");
    store.add(chatRef);
    const listener = store.add(new MutableDisposable());
    const tryHydrate = () => {
      if (cached.modelId.get() === void 0) {
        const chatState = chatRef.object.value;
        const model = chatState && !(chatState instanceof Error) ? chatState.draft?.model : void 0;
        if (model) {
          cached.hydrateSelectedModel(model);
        }
      }
      if (cached.modelId.get() !== void 0) {
        listener.clear();
      }
    };
    listener.value = chatRef.object.onDidChange(() => tryHydrate());
    tryHydrate();
  }
  /**
   * Fan-out for AHP `SessionState` snapshots: keeps both the running
   * session config and the cached adapter's `_meta` (e.g. git state) in
   * sync.
   */
  _applySessionStateUpdate(sessionId, state) {
    const previous = this._lastSessionStates.get(sessionId);
    this._lastSessionStates.set(sessionId, state);
    if (!previous || customizationsChanged(previous, state)) {
      this._reconcileAgentFromState(sessionId, state);
      this._onDidChangeCustomAgents.fire();
      this._onDidChangeCustomizations.fire();
    }
    this._seedRunningConfigFromState(sessionId, state);
    this._applySessionMetaFromState(sessionId, state);
    this._applyChatCatalogFromState(sessionId, state);
    if (!previous) {
      this._applyChangesetsFromState(sessionId, state);
    }
  }
  /**
   * Seed the cached adapter's changeset catalogue from an AHP
   * {@link SessionState}. The catalogue otherwise only flows in via the live
   * `SessionChangesetsChanged` action, which the host emits only when entries
   * are added or removed. On restore (e.g. after a reload) nothing mutates, so
   * that action never fires and the catalogue would stay empty. The restored
   * `SessionState` snapshot carries the persisted `changesets`, so apply it
   * here to surface the catalogue immediately.
   */
  _applyChangesetsFromState(sessionId, state) {
    if (state.changesets === void 0) {
      return;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    if (!rawId) {
      return;
    }
    const cached = this._sessionCache.get(rawId);
    if (!cached) {
      return;
    }
    cached.updateChangesets(state.changesets);
  }
  /**
   * Rebase the cached running adapter's selected agent against the host's agent
   * list from an AHP {@link SessionState}, before the picker is notified. A
   * session that has moved into an isolated worktree keeps its selection instead
   * of resetting to the default once the host starts reporting worktree-pathed
   * agents. See {@link AgentHostSessionAdapter.reconcileSelectedAgent}.
   */
  _reconcileAgentFromState(sessionId, state) {
    const rawId = this._rawIdFromChatId(sessionId);
    if (!rawId) {
      return;
    }
    const cached = this._sessionCache.get(rawId);
    if (!cached) {
      return;
    }
    cached.reconcileSelectedAgent(getEffectiveAgents(state.customizations));
  }
  /**
   * Reconcile the per-chat catalog of the cached running adapter from an AHP
   * {@link SessionState}. The adapter exposes `chats`/`mainChat` as
   * observables, so updating them here is enough for the chat-tab UI to
   * re-render reactively.
   */
  _applyChatCatalogFromState(sessionId, state) {
    const rawId = this._rawIdFromChatId(sessionId);
    if (!rawId) {
      return;
    }
    const cached = this._sessionCache.get(rawId);
    if (!cached) {
      return;
    }
    cached.applyChatCatalog(state);
  }
  /**
   * NewSession variant of {@link _applySessionStateUpdate}: writes the
   * customizations subset and applies git/GitHub metadata to the draft
   * workspace. Skips {@link _seedRunningConfigFromState} because NewSession
   * owns its own config via `NewSession._config`.
   */
  _handleNewSessionStateUpdate(sessionId, state) {
    const previous = this._lastSessionStates.get(sessionId);
    this._lastSessionStates.set(sessionId, state);
    this._newSessions.get(sessionId)?.applySessionMeta(state._meta);
    if (!previous || customizationsChanged(previous, state)) {
      this._onDidChangeCustomAgents.fire();
      this._onDidChangeCustomizations.fire();
    }
  }
  /**
   * Cleanup sentinel from {@link NewSession.dispose}: drops the cached
   * `_lastSessionStates` entry the new session contributed. Fires
   * `_onDidChangeCustomAgents` so any open picker re-reads and falls
   * back to the empty list rather than rendering stale agents.
   */
  _handleNewSessionStateGone(sessionId) {
    if (this._lastSessionStates.delete(sessionId)) {
      this._onDidChangeCustomAgents.fire();
      this._onDidChangeCustomizations.fire();
    }
  }
  _applySessionMetaFromState(sessionId, state) {
    const rawId = this._rawIdFromChatId(sessionId);
    if (!rawId) {
      return;
    }
    const cached = this._sessionCache.get(rawId);
    if (!cached) {
      return;
    }
    if (cached.setMeta(state._meta)) {
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  /**
   * Seed {@link _runningSessionConfigs} from the AHP `SessionState.config`
   * snapshot. Keeps the full schema + values (including non-mutable ones)
   * so consumers like the JSONC settings editor can round-trip all values
   * through a replace dispatch. No-op if structurally equal to avoid spurious
   * `onDidChangeSessionConfig` fires.
   */
  _seedRunningConfigFromState(sessionId, state) {
    const stateConfig = state.config;
    if (!stateConfig) {
      return;
    }
    if (Object.keys(stateConfig.schema.properties).length === 0) {
      return;
    }
    const existing = this._runningSessionConfigs.get(sessionId);
    let seeded;
    if (existing && this._runningSessionConfigResolveSeq.has(sessionId)) {
      const values = { ...existing.values };
      for (const key3 of Object.keys(existing.schema.properties)) {
        if (Object.hasOwn(stateConfig.values, key3)) {
          values[key3] = stateConfig.values[key3];
        }
      }
      seeded = {
        schema: { type: "object", properties: { ...existing.schema.properties } },
        values
      };
    } else {
      seeded = {
        schema: {
          type: "object",
          properties: {
            ...existing?.schema.properties ?? {},
            ...stateConfig.schema.properties
          }
        },
        values: {
          ...existing?.values ?? {},
          ...stateConfig.values
        }
      };
    }
    if (existing && resolvedConfigsEqual(existing, seeded)) {
      return;
    }
    this._runningSessionConfigs.set(sessionId, seeded);
    this._applyWorktreeIsolation(sessionId, seeded.values);
    this._onDidChangeSessionConfig.fire(sessionId);
  }
  /** Mirrors a session's `isolation` pick onto its adapter. See {@link ISession.worktreePending}. */
  _applyWorktreeIsolation(sessionId, values) {
    if (!isWorktreeIsolation(values)) {
      return;
    }
    const rawId = this._rawIdFromChatId(sessionId);
    const adapter = rawId ? this._sessionCache.get(rawId) : void 0;
    adapter?.setWorktreeIsolation(true);
  }
  // -- Session cache management --------------------------------------------
  /**
   * Opt in to persisting {@link _sessionCache} snapshots under `storageKey`.
   * Subclasses call this at the **end** of their constructor — once the
   * identity fields that {@link createAdapter}/{@link resourceSchemeForProvider}/
   * {@link _adapterOptions} depend on are initialized — because the initial
   * hydration builds adapters. This is why the base cannot auto-load in its
   * own constructor. Persisted summaries are hydrated into {@link _sessionCache}
   * immediately so {@link getSessions} returns them before the first
   * `listSessions()` round-trip resolves.
   *
   * `legacyStorageKey`, when given, is removed so stale entries are discarded.
   */
  _enableSessionCachePersistence(storageKey, legacyStorageKey) {
    if (legacyStorageKey) {
      this._storageService.remove(legacyStorageKey, -1 /* APPLICATION */);
    }
    this._sessionCacheStorageKey = storageKey;
    this._loadCachedSessions();
  }
  /**
   * Whether {@link _onDidChangeSessions} events should update the persistence
   * bookkeeping ({@link _cacheDirty} + {@link _metaByRawId}). Default `true`;
   * the remote provider overrides this to suspend tracking while its cached
   * sessions are unpublished (offline), so the on-disk snapshot survives.
   */
  _shouldTrackSessionCacheChanges() {
    return true;
  }
  /** Load persisted session summaries into {@link _sessionCache}. */
  _loadCachedSessions() {
    if (!this._sessionCacheStorageKey) {
      return;
    }
    const parsed = this._storageService.getObject(this._sessionCacheStorageKey, -1 /* APPLICATION */);
    if (!Array.isArray(parsed)) {
      return;
    }
    for (const entry of parsed) {
      const deserialized = deserializeMetadata(entry);
      if (!deserialized) {
        continue;
      }
      const meta = this._adoptSessionMeta(deserialized);
      const rawId = AgentSession.id(meta.session);
      if (this._sessionCache.has(rawId)) {
        continue;
      }
      const cached = this.createAdapter(meta);
      this._sessionCache.set(rawId, cached);
    }
  }
  /**
   * Persist the current {@link _sessionCache} to storage, capping at
   * {@link CACHED_SESSIONS_MAX_PER_HOST} most-recently-modified entries.
   * Mutable fields are read from each adapter's observables and overlaid on
   * top of the original metadata snapshot captured in {@link _metaByRawId}.
   */
  _persistCache() {
    if (!this._sessionCacheStorageKey) {
      return;
    }
    const entries2 = [];
    for (const [rawId, adapter] of this._sessionCache) {
      const base = this._metaByRawId.get(rawId);
      if (!base) {
        continue;
      }
      const sessionMeta = adapter.isQuickChat.get() ? withSessionWorkspaceless(adapter.sessionMeta, true) : adapter.sessionMeta;
      entries2.push(serializeMetadata({
        ...base,
        summary: adapter.title.get() || base.summary,
        modifiedTime: adapter.updatedAt.get().getTime(),
        changes: adapter.changesSummary.get(),
        // A project assigned by `backfillProject` lives only on the adapter.
        project: adapter.project ?? base.project,
        status: withSessionStatusFlag(
          withSessionStatusFlag(base.status ?? 1 /* Idle */, 32 /* IsRead */, adapter.isRead.get()),
          64 /* IsArchived */,
          adapter.isArchived.get()
        ),
        // Session-state updates can refine presentation metadata without another listing.
        _meta: sessionMeta
      }));
    }
    if (entries2.length === 0) {
      this._storageService.remove(this._sessionCacheStorageKey, -1 /* APPLICATION */);
      return;
    }
    entries2.sort((a, b) => b.modifiedTime - a.modifiedTime);
    const limited = entries2.slice(0, CACHED_SESSIONS_MAX_PER_HOST);
    this._storageService.store(this._sessionCacheStorageKey, JSON.stringify(limited), -1 /* APPLICATION */, 0 /* USER */);
  }
  _ensureSessionCache() {
    if (this._cacheInitialized) {
      return;
    }
    if (this._sessionRefreshInFlight || this._sessionRefreshRetry.value) {
      return;
    }
    this._refreshSessions();
  }
  async _refreshSessions(announceExistingAsAdded = false) {
    const connection = this.connection;
    if (!connection) {
      return;
    }
    this._sessionRefreshRetry.clear();
    this._sessionRefreshInFlight = true;
    try {
      const sessions = await connection.listSessions();
      this._cacheInitialized = true;
      this._sessionRefreshRetryDelay = BaseAgentHostSessionsProvider.SESSION_REFRESH_RETRY_MIN_MS;
      const currentKeys = /* @__PURE__ */ new Set();
      const listedAgentProviders = /* @__PURE__ */ new Set();
      const added = [];
      const changed = [];
      for (const rawMeta of sessions) {
        const meta = this._adoptSessionMeta(rawMeta);
        const rawId = AgentSession.id(meta.session);
        currentKeys.add(rawId);
        const agentProvider = AgentSession.provider(meta.session);
        if (agentProvider) {
          listedAgentProviders.add(agentProvider);
        }
        const existing = this._sessionCache.get(rawId);
        if (existing) {
          if (announceExistingAsAdded) {
            added.push(existing);
          }
          if (this.updateAdapter(existing, meta)) {
            changed.push(existing);
          }
        } else {
          const cached = this.createAdapter(meta);
          this._sessionCache.set(rawId, cached);
          added.push(cached);
        }
      }
      const removed = [];
      this._onHostListedSessions(currentKeys);
      const pendingRawId = this._pendingSession?.resource.path.replace(/^\//, "");
      const evictUnlistedAgents = listedAgentProviders.size === 0;
      for (const [key3, cached] of this._sessionCache) {
        if (!currentKeys.has(key3)) {
          if (key3 === pendingRawId) {
            continue;
          }
          if (!this._isSessionEvictable(key3)) {
            continue;
          }
          if (!evictUnlistedAgents && !listedAgentProviders.has(cached.agentProvider)) {
            continue;
          }
          this._sessionCache.delete(key3);
          this._runningSessionConfigs.delete(cached.sessionId);
          this._runningSessionConfigResolveSeq.delete(cached.sessionId);
          removed.push(cached);
        }
      }
      if (added.length > 0 || removed.length > 0 || changed.length > 0) {
        this._onDidChangeSessions.fire({ added, removed, changed });
      }
      this._syncActiveClient();
      for (const cached of removed) {
        cached.dispose();
      }
    } catch (err) {
      this._logService.trace(`[AgentHostSessionsProvider] listSessions failed; scheduling retry: ${err}`);
      this._scheduleSessionRefreshRetry(announceExistingAsAdded);
    } finally {
      this._sessionRefreshInFlight = false;
    }
  }
  /**
   * Whether a cached session the host did not list may be evicted. Subclasses override this to
   * protect a session that exists but that the host has not materialized yet.
   */
  _isSessionEvictable(_rawId) {
    return true;
  }
  /** Raw ids the host listed, reported before eviction runs so subclasses can retire protections. */
  _onHostListedSessions(_rawIds) {
  }
  /**
   * Arm a backoff retry of {@link _refreshSessions}. Used after a failed
   * refresh so a transient startup failure self-heals without requiring an
   * unrelated AHP event (a turn completing, a session being added) to force
   * a re-fetch. Cancelled on the next successful refresh.
   */
  _scheduleSessionRefreshRetry(announceExistingAsAdded) {
    const delay = this._sessionRefreshRetryDelay;
    this._sessionRefreshRetryDelay = Math.min(delay * 2, BaseAgentHostSessionsProvider.SESSION_REFRESH_RETRY_MAX_MS);
    this._sessionRefreshRetry.value = disposableTimeout(() => {
      this._refreshSessions(announceExistingAsAdded);
    }, delay);
  }
  /**
   * Cancel any pending session-refresh retry and reset the backoff. Called
   * by subclasses when the connection goes away (the stale timer would
   * otherwise fire against a dead connection and no-op).
   */
  _cancelSessionRefreshRetry() {
    this._sessionRefreshRetry.clear();
    this._sessionRefreshRetryDelay = BaseAgentHostSessionsProvider.SESSION_REFRESH_RETRY_MIN_MS;
  }
  /**
   * Resolve the freshly-committed backend session for an in-flight send.
   *
   * The local agent host runs a single provider whose session cache holds
   * **every** agent-host session type (codex, claude, copilot, …). A send
   * therefore has to identify *its own* new session by both novelty (a raw id
   * not present before the send) **and** type: `expectedScheme` is the
   * `chatResource` scheme (e.g. `agent-host-codex`), so a session of another
   * type that happens to appear mid-send — a slow codex send racing against a
   * restored claude session, say — is never mistaken for this send's commit.
   */
  async _waitForNewSession(existingKeys, expectedScheme, ownRawId, token) {
    const matches2 = (rawId, scheme) => {
      if (scheme !== expectedScheme || this._committingSessionRawIds.has(rawId)) {
        return false;
      }
      if (rawId === ownRawId) {
        return true;
      }
      return !existingKeys.has(rawId) && !this._inFlightNewSessionOwnIds.has(rawId);
    };
    await this._refreshSessions();
    const scan = () => {
      let fallback2;
      for (const cached of this._sessionCache.values()) {
        const rawId = cached.resource.path.substring(1);
        if (!matches2(rawId, cached.resource.scheme)) {
          continue;
        }
        if (rawId === ownRawId) {
          return cached;
        }
        fallback2 ??= cached;
      }
      return fallback2;
    };
    const immediate = scan();
    if (immediate) {
      this._committingSessionRawIds.add(immediate.resource.path.substring(1));
      return immediate;
    }
    const waitDisposables = new DisposableStore();
    try {
      const sessionPromise = new Promise((resolve3) => {
        waitDisposables.add(this._onDidChangeSessionsImmediately((e4) => {
          const exact = e4.added.find((s) => s.resource.path.substring(1) === ownRawId && matches2(ownRawId, s.resource.scheme));
          const newSession = exact ?? e4.added.find((s) => matches2(s.resource.path.substring(1), s.resource.scheme));
          if (newSession) {
            this._committingSessionRawIds.add(newSession.resource.path.substring(1));
            resolve3(newSession);
          }
        }));
        waitDisposables.add(this.onConnectionLost(() => resolve3(void 0)));
      });
      return await raceCancellationError(sessionPromise, token);
    } finally {
      waitDisposables.dispose();
    }
  }
  // -- AHP notification / action handlers ----------------------------------
  /**
   * Wire AHP notification and action listeners on the given connection.
   * Subclasses call this from their constructor (local) or `setConnection`
   * (remote), passing a store that bounds the listeners' lifetime.
   */
  _attachConnectionListeners(connection, store) {
    store.add(connection.onDidNotification((n2) => {
      if (n2.type === NotificationType.SessionAdded) {
        this._handleSessionAdded(n2.summary);
      } else if (n2.type === NotificationType.SessionRemoved) {
        this._handleSessionRemoved(n2.session);
      } else if (n2.type === NotificationType.SessionSummaryChanged) {
        this._handleSessionSummaryChanged(n2.session, n2.changes);
      } else if (n2.type === NotificationType.Progress) {
        this._downloadProgress.handleProgress(n2);
      }
    }));
    store.add(connection.onDidAction((e4) => {
      if (e4.rejectionReason) {
        return;
      }
      if (e4.action.type === "chat/turnComplete" /* ChatTurnComplete */ && isChatAction(e4.action)) {
        this._keepChatSessionStateAlive(e4.channel);
        this._refreshSessions();
      } else if (e4.action.type === "session/titleChanged" /* SessionTitleChanged */ && isSessionAction(e4.action)) {
        this._handleTitleChanged(e4.channel, e4.action.title);
      } else if (e4.action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */ && isSessionAction(e4.action)) {
        this._handleIsArchivedChanged(e4.channel, e4.action.isArchived);
      } else if (e4.action.type === "session/isReadChanged" /* SessionIsReadChanged */ && isSessionAction(e4.action)) {
        this._handleIsReadChanged(e4.channel, e4.action.isRead);
      } else if (e4.action.type === "session/configChanged" /* SessionConfigChanged */ && isSessionAction(e4.action)) {
        this._handleConfigChanged(e4.channel, e4.action.config, e4.action.replace === true);
      } else if (e4.action.type === "session/changesetsChanged" /* SessionChangesetsChanged */ && isSessionAction(e4.action)) {
        this._handleChangesetsChanged(e4.channel, e4.action.changesets);
      } else if (e4.action.type === "session/metaChanged" /* SessionMetaChanged */ && isSessionAction(e4.action)) {
        this._handleSessionMetaChanged(e4.channel, e4.action._meta);
      }
    }));
  }
  _handleSessionAdded(summary) {
    const workingDirs = summary.workingDirectories?.map((d) => this.mapWorkingDirectoryUri(URI.parse(d)));
    const rawMeta = {
      session: URI.parse(summary.resource),
      startTime: Date.parse(summary.createdAt),
      modifiedTime: Date.parse(summary.modifiedAt),
      summary: summary.title,
      activity: summary.activity,
      status: summary.status,
      ...summary.project ? {
        project: {
          displayName: summary.project.displayName,
          uri: this.mapProjectUri(URI.parse(summary.project.uri))
        }
      } : {},
      workingDirectories: workingDirs,
      changes: summary.changes,
      // Carry `_meta` so a new adapter seeds its session-kind from it and an
      // existing one can be promoted by it.
      ...summary._meta !== void 0 ? { _meta: summary._meta } : {}
    };
    const meta = this._adoptSessionMeta(rawMeta);
    const rawId = AgentSession.id(meta.session);
    const existing = this._sessionCache.get(rawId);
    if (existing) {
      if (this.updateAdapter(existing, meta)) {
        this._onDidChangeSessionsFromNotifications.fire({ added: [], removed: [], changed: [existing] });
      }
      this._syncActiveClient();
      return;
    }
    const cached = this.createAdapter(meta);
    this._sessionCache.set(rawId, cached);
    this._onDidChangeSessionsFromNotifications.fire({ added: [cached], removed: [], changed: [] });
    this._syncActiveClient();
  }
  _handleSessionRemoved(session) {
    const rawId = AgentSession.id(session);
    const cached = this._removeCachedSession(rawId);
    if (cached) {
      this._onDidChangeSessionsFromNotifications.fire({ added: [], removed: [cached], changed: [] });
      cached.dispose();
    }
    this._syncActiveClient();
  }
  _removeCachedSession(rawId, expected) {
    const cached = this._sessionCache.get(rawId);
    if (expected && cached && cached !== expected) {
      return void 0;
    }
    this._metaByRawId.delete(rawId);
    const stateOwner = cached ?? expected;
    if (!stateOwner) {
      return void 0;
    }
    if (cached) {
      this._sessionCache.delete(rawId);
    }
    this._runningSessionConfigs.delete(stateOwner.sessionId);
    this._runningSessionConfigResolveSeq.delete(stateOwner.sessionId);
    this._sessionStateIdleTimers.deleteAndDispose(stateOwner.sessionId);
    this._sessionStateSubscriptions.deleteAndDispose(stateOwner.sessionId);
    this._lastSessionStates.delete(stateOwner.sessionId);
    return cached;
  }
  _handleTitleChanged(session, title) {
    const rawId = AgentSession.id(session);
    const cached = this._sessionCache.get(rawId);
    if (cached) {
      cached.title.set(title, void 0);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  _handleIsArchivedChanged(session, isArchived) {
    const rawId = AgentSession.id(session);
    const cached = this._sessionCache.get(rawId);
    if (cached) {
      cached.isArchived.set(isArchived, void 0);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  _handleIsReadChanged(session, isRead) {
    const rawId = AgentSession.id(session);
    const cached = this._sessionCache.get(rawId);
    if (cached && cached.isRead.get() !== isRead) {
      cached.isRead.set(isRead, void 0);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  _handleSessionSummaryChanged(session, changes) {
    let reopenStateSubscriptionFor;
    transaction((tx) => {
      const rawId = AgentSession.id(session);
      const cached = this._sessionCache.get(rawId);
      if (!cached) {
        return;
      }
      let didChange = false;
      if (changes.status !== void 0) {
        const uiStatus = mapProtocolStatus(changes.status);
        if (uiStatus !== cached.status.get()) {
          cached.status.set(uiStatus, tx);
          didChange = true;
        }
        const isArchived = !!(changes.status & 64 /* IsArchived */);
        if (isArchived !== cached.isArchived.get()) {
          cached.isArchived.set(isArchived, tx);
          didChange = true;
        }
        const isRead = !!(changes.status & 32 /* IsRead */);
        if (isRead !== cached.isRead.get()) {
          cached.isRead.set(isRead, tx);
          didChange = true;
        }
      }
      if (changes.title !== void 0 && changes.title !== cached.title.get()) {
        cached.title.set(changes.title, tx);
        didChange = true;
      }
      if (changes.changes !== void 0 && cached.setChangesSummary(changes.changes, tx)) {
        didChange = true;
      }
      if (Object.prototype.hasOwnProperty.call(changes, "activity") && cached.setActivity(changes.activity, tx)) {
        didChange = true;
      }
      if (Object.prototype.hasOwnProperty.call(changes, "_meta")) {
        const storedMeta = this._metaByRawId.get(rawId);
        const wasAdoptable = readSessionEhcliAdoptable(storedMeta?._meta);
        if (storedMeta) {
          this._metaByRawId.set(rawId, { ...storedMeta, _meta: changes._meta });
        }
        if (cached.setMeta(changes._meta, tx)) {
          didChange = true;
        }
        if (wasAdoptable && !readSessionEhcliAdoptable(changes._meta)) {
          reopenStateSubscriptionFor = cached.sessionId;
        }
      }
      if (didChange) {
        this._onDidChangeSessionsFromNotifications.fire({ added: [], removed: [], changed: [cached] });
      }
    });
    if (reopenStateSubscriptionFor !== void 0) {
      this._ensureSessionStateSubscription(reopenStateSubscriptionFor);
    }
  }
  _handleConfigChanged(session, config, replace) {
    const rawId = AgentSession.id(session);
    const cached = this._sessionCache.get(rawId);
    if (!cached) {
      return;
    }
    const sessionId = cached.sessionId;
    const existing = this._runningSessionConfigs.get(sessionId);
    if (existing) {
      this._runningSessionConfigs.set(sessionId, {
        ...existing,
        values: replace ? { ...config } : { ...existing.values, ...config }
      });
    } else {
      this._runningSessionConfigs.set(sessionId, {
        schema: { type: "object", properties: buildMutableConfigSchema(config) },
        values: config
      });
    }
    this._onDidChangeSessionConfig.fire(sessionId);
  }
  _handleChangesetsChanged(session, changesets) {
    const rawId = AgentSession.id(session);
    const cached = this._sessionCache.get(rawId);
    if (cached) {
      cached.updateChangesets(changesets);
    }
  }
  _handleSessionMetaChanged(session, meta) {
    const rawId = AgentSession.id(session);
    const cached = this._sessionCache.get(rawId);
    if (cached?.setMeta(meta)) {
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [cached] });
    }
  }
  /**
   * Optional URI mapper used when applying diff changes. Subclasses
   * override to translate remote diff URIs into agent-host URIs.
   */
  _diffUriMapper() {
    return void 0;
  }
};

BaseAgentHostSessionsProvider = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IChatWidgetService),
  __decorateParam(3, ILanguageModelsService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IGitHubService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, ISessionsService),
  __decorateParam(9, IAgentHostActiveClientService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IDialogService),
  __decorateParam(12, IWorkspaceTrustManagementService)
], BaseAgentHostSessionsProvider);
export { mergeSessionChangeEvents, debounceSessionChangeEvents, isWorktreeIsolation, serializeMetadata, deserializeMetadata, deserializeStatus, isRememberedSessionConfigKey, normalizeAutoApproveValue, isGitHubInfoEqual, dateEquals, markdownStringEquals, toGitHubIssueRefs, toGitHubPullRequestRefs, toGitHubPromotion, toGitHubInfo, resolveAgentAuthRequirement, sessionKind, toChatInteractivity, toSessionChatOriginKind, toSessionSideChatSelection, customizationsChanged, flattenActiveClientCustomizations, STORAGE_KEY_REMEMBERED_SESSION_CONFIG_VALUES, UNSAFE_SESSION_CONFIG_KEYS, SESSION_CHANGE_NOTIFICATION_DEBOUNCE_MS, SEEDED_CONFIG_SCHEMA_KEYS, ActiveClientSyncCancellationTokenSource, WORKTREE_ISOLATION_VALUE, CACHED_SESSIONS_MAX_PER_HOST, SESSION_STATUS_FLAG_MASK, CopilotCLISessionType, WorkspaceSessionKind, QuickChatSessionKind, AdditionalChat, AgentHostSessionAdapter, AGENT_MODE_KIND, NewSession, BaseAgentHostSessionsProvider };
