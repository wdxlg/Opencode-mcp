// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsModel.ts
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName, isBuiltInAgentSessionProvider } from "./module-0983.mjs";
import { URI } from "./module-0032.mjs";
import { IChatSessionsService, isAgentHostTarget, isSessionInProgressStatus } from "./module-0961.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions15, IOutputService } from "./module-1245.mjs";
import { safeStringify } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { dedupeMigratedCopilotCliSessions } from "./module-1110.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { Codicon } from "./module-0085.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0875.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsModel.ts
function hasValidDiff(changes) {
  if (!changes) {
    return false;
  }
  if (changes instanceof Array) {
    return changes.length > 0;
  }
  return changes.files > 0 || changes.insertions > 0 || changes.deletions > 0;
}

function getAgentChangesSummary(changes) {
  if (!changes) {
    return;
  }
  if (!(changes instanceof Array)) {
    return changes;
  }
  let insertions = 0;
  let deletions = 0;
  for (const change of changes) {
    insertions += change.insertions;
    deletions += change.deletions;
  }
  return { files: changes.length, insertions, deletions };
}

function isLocalAgentSessionItem(session) {
  return session.providerType === AgentSessionProviders.Local;
}

function getAgentSessionPullRequestUri(session) {
  const metadata = session.metadata;
  if (!metadata) {
    return void 0;
  }
  const url = metadata.pullRequestUrl;
  if (typeof url === "string" && url) {
    try {
      return URI.parse(url);
    } catch {
    }
  }
  const prNumber = metadata.pullRequestNumber;
  const owner = metadata.owner;
  const name = metadata.name;
  if (typeof prNumber === "number" && typeof owner === "string" && owner && typeof name === "string" && name) {
    return URI.parse(`https://github.com/${owner}/${name}/pull/${prNumber}`);
  }
  return void 0;
}

function getAgentSessionPullRequestContextValue(session) {
  return getAgentSessionPullRequestUri(session) ? "available" : "none";
}

function isAgentHostAgentSessionItem(session) {
  return isAgentHostTarget(session.providerType);
}

function isAgentSession(obj) {
  const session = obj;
  return URI.isUri(session?.resource) && typeof session.isArchived === "function" && typeof session.setArchived === "function" && typeof session.isPinned === "function" && typeof session.setPinned === "function" && typeof session.isRead === "function" && typeof session.isMarkedUnread === "function" && typeof session.setRead === "function";
}

function isAgentSessionsModel(obj) {
  const sessionsModel = obj;
  return Array.isArray(sessionsModel?.sessions) && typeof sessionsModel?.getSession === "function";
}

function isAgentSessionSection(obj) {
  const candidate = obj;
  return typeof candidate.section === "string" && Array.isArray(candidate.sessions);
}

function isAgentSessionShowMore(obj) {
  return obj?.showMore === true;
}

function isAgentSessionShowLess(obj) {
  return obj?.showLess === true;
}

function isMarshalledAgentSessionContext(thing) {
  if (typeof thing === "object" && thing !== null) {
    const candidate = thing;
    return candidate.$mid === 25 /* AgentSessionContext */ && typeof candidate.session === "object" && candidate.session !== null;
  }
  return false;
}

var agentSessionsOutputChannelId = "agentSessionsOutput";

var agentSessionsOutputChannelLabel = localize(9147, null);

function statusToString(status2) {
  switch (status2) {
    case 0 /* Failed */:
      return "Failed";
    case 1 /* Completed */:
      return "Completed";
    case 2 /* InProgress */:
      return "InProgress";
    case 3 /* NeedsInput */:
      return "NeedsInput";
    default:
      return `Unknown(${status2})`;
  }
}

var AgentSessionsLogger = class extends Disposable {
  constructor(getSessionsData, logService, outputService, chatEntitlementService) {
    super();
    this.getSessionsData = getSessionsData;
    this.logService = logService;
    this.outputService = outputService;
    this.chatEntitlementService = chatEntitlementService;
    this.isChannelRegistered = false;
    this.updateChannelRegistration();
    this.registerListeners();
  }
  updateChannelRegistration() {
    const chatDisabled = this.chatEntitlementService.sentiment.hidden;
    if (chatDisabled && this.isChannelRegistered) {
      Registry.as(Extensions15.OutputChannels).removeChannel(agentSessionsOutputChannelId);
      this.isChannelRegistered = false;
    } else if (!chatDisabled && !this.isChannelRegistered) {
      Registry.as(Extensions15.OutputChannels).registerChannel({
        id: agentSessionsOutputChannelId,
        label: agentSessionsOutputChannelLabel,
        log: false
      });
      this.isChannelRegistered = true;
    }
  }
  registerListeners() {
    this._register(this.logService.onDidChangeLogLevel((level) => {
      if (level === 1 /* Trace */) {
        this.logAllStatsIfTrace("Log level changed to trace");
      }
    }));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => {
      this.updateChannelRegistration();
    }));
  }
  logIfTrace(msg) {
    if (this.logService.getLevel() !== 1 /* Trace */) {
      return;
    }
    this.trace(`[Agent Sessions] ${msg}`);
  }
  logAllStatsIfTrace(reason) {
    if (this.logService.getLevel() !== 1 /* Trace */) {
      return;
    }
    this.logAllSessions(reason);
    this.logSessionStates();
  }
  logAllSessions(reason) {
    const { sessions, sessionStates } = this.getSessionsData();
    const lines = [];
    lines.push(`=== Agent Sessions (${reason}) ===`);
    let count2 = 0;
    for (const session of sessions) {
      count2++;
      const state = sessionStates.get(session.resource);
      lines.push(`--- Session: ${session.label} ---`);
      lines.push(`  Resource: ${session.resource.toString()}`);
      lines.push(`  Provider Type: ${session.providerType}`);
      lines.push(`  Provider Label: ${session.providerLabel}`);
      lines.push(`  Status: ${statusToString(session.status)}`);
      lines.push(`  Icon: ${session.icon.id}`);
      if (session.description) {
        lines.push(`  Description: ${typeof session.description === "string" ? session.description : session.description.value}`);
      }
      if (session.badge) {
        lines.push(`  Badge: ${typeof session.badge === "string" ? session.badge : session.badge.value}`);
      }
      if (session.tooltip) {
        lines.push(`  Tooltip: ${typeof session.tooltip === "string" ? session.tooltip : session.tooltip.value}`);
      }
      lines.push(`  Timing:`);
      lines.push(`    Created: ${session.timing.created ? new Date(session.timing.created).toISOString() : "N/A"}`);
      lines.push(`    Last Request Started: ${session.timing.lastRequestStarted ? new Date(session.timing.lastRequestStarted).toISOString() : "N/A"}`);
      lines.push(`    Last Request Ended: ${session.timing.lastRequestEnded ? new Date(session.timing.lastRequestEnded).toISOString() : "N/A"}`);
      if (session.changes) {
        const summary = getAgentChangesSummary(session.changes);
        if (summary) {
          lines.push(`  Changes: ${summary.files} files, +${summary.insertions} -${summary.deletions}`);
        }
      }
      if (session.metadata && Object.keys(session.metadata).length > 0) {
        lines.push(`  Metadata:`);
        for (const [key3, value2] of Object.entries(session.metadata)) {
          const renderedValue = typeof value2 === "string" ? value2 : safeStringify(value2);
          lines.push(`    ${key3}: ${renderedValue}`);
        }
      }
      lines.push(`  State:`);
      lines.push(`    Archived (provider): ${session.archived ?? "N/A"}`);
      lines.push(`    Archived (computed): ${session.isArchived()}`);
      lines.push(`    Archived (stored): ${state?.archived ?? "N/A"}`);
      lines.push(`    Pinned: ${session.isPinned()}`);
      lines.push(`    Pinned (stored): ${state?.pinned ?? "N/A"}`);
      lines.push(`    Read: ${session.isRead()}`);
      lines.push(`    Read date (stored): ${state?.read ? new Date(state.read).toISOString() : "N/A"}`);
      lines.push("");
    }
    lines.unshift(`Total sessions: ${count2}`, "");
    lines.push(`=== End Agent Sessions ===`);
    this.trace(lines.join("\n"));
  }
  logSessionStates() {
    const { sessionStates } = this.getSessionsData();
    const lines = [];
    lines.push(`=== Session States ===`);
    lines.push(`Total stored states: ${sessionStates.size}`);
    lines.push("");
    for (const [resource, state] of sessionStates) {
      lines.push(`URI: ${resource.toString()}`);
      lines.push(`  Archived: ${state.archived}`);
      lines.push(`  Pinned: ${state.pinned}`);
      lines.push(`  Read: ${state.read ? new Date(state.read).toISOString() : "0 (unread)"}`);
      lines.push("");
    }
    lines.push(`=== End Session States ===`);
    this.trace(lines.join("\n"));
  }
  trace(msg) {
    const channel = this.outputService.getChannel(agentSessionsOutputChannelId);
    if (!channel) {
      return;
    }
    channel.append(`${msg}
`);
  }
};

AgentSessionsLogger = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IOutputService),
  __decorateParam(3, IChatEntitlementService)
], AgentSessionsLogger);

var AgentSessionsModel = class extends Disposable {
  constructor(chatSessionsService, lifecycleService, instantiationService, storageService, productService, chatWidgetService, workspaceContextService, workspaceTrustManagementService, chatEntitlementService) {
    super();
    this.chatSessionsService = chatSessionsService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.productService = productService;
    this.chatWidgetService = chatWidgetService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.chatEntitlementService = chatEntitlementService;
    this._onWillResolve = this._register(new Emitter());
    this.onWillResolve = this._onWillResolve.event;
    this._onDidResolve = this._register(new Emitter());
    this.onDidResolve = this._onDidResolve.event;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._onDidChangeSessionArchivedState = this._register(new Emitter());
    this.onDidChangeSessionArchivedState = this._onDidChangeSessionArchivedState.event;
    this._resolved = false;
    this.resolvers = this._register(new DisposableMap());
    this._sessionObservables = new ResourceMap();
    this._resolvedResources = new ResourceSet();
    this.explicitlyMarkedUnreadSessions = new ResourceSet();
    this.migratedReadResources = new ResourceSet();
    this._sessions = new ResourceMap();
    this.cache = this.instantiationService.createInstance(AgentSessionsCache);
    for (const data of this.cache.loadCachedSessions()) {
      const session = this.toAgentSession(data);
      this._sessions.set(session.resource, session);
    }
    this.sessionStates = this.cache.loadSessionStates();
    this.logger = this._register(this.instantiationService.createInstance(
      AgentSessionsLogger,
      () => ({
        sessions: this._sessions.values(),
        sessionStates: this.sessionStates
      })
    ));
    this.logger.logAllStatsIfTrace("Loaded cached sessions");
    this.readDateBaseline = this.resolveReadDateBaseline();
    this.loadMigratedReadResources();
    this.registerListeners();
  }
  get resolved() {
    return this._resolved;
  }
  get sessions() {
    return this._dedupeMigratedCopilotCliSessions(Array.from(this._sessions.values()));
  }
  registerListeners() {
    this._register(this.chatSessionsService.onDidChangeItemsProviders(({ chatSessionType }) => this.resolve(chatSessionType)));
    this._register(this.chatSessionsService.onDidChangeAvailability(() => this.resolve(void 0)));
    this._register(this.chatSessionsService.onDidChangeSessionItems((delta2) => {
      const changedChatSessionTypes = /* @__PURE__ */ new Set();
      for (const resource of delta2.addedOrUpdated ?? []) {
        changedChatSessionTypes.add(getChatSessionType(resource.resource));
      }
      for (const resource of delta2.removed ?? []) {
        changedChatSessionTypes.add(getChatSessionType(resource));
      }
      for (const chatSessionType of changedChatSessionTypes) {
        this.resolveProvider(chatSessionType, {
          refreshProvider: false
          /* skip because we react on an event already */
        });
      }
    }));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this.resolve(void 0)));
    this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.resolve(void 0)));
    this._register(this.storageService.onWillSaveState(() => {
      this.cache.saveCachedSessions(Array.from(this._sessions.values()));
      this.cache.saveSessionStates(this.sessionStates);
    }));
  }
  getSession(resource) {
    return this._sessions.get(resource);
  }
  /**
   * Hide the extension-host `copilotcli:` row when its agent-host
   * `agent-host-copilotcli:` twin is present, so the list shows a single entry
   * per legacy Copilot CLI session — the agent-host one.
   *
   * A legacy row with no twin yet stays visible: opening it redirects through the
   * agent host and adopts it, so it is never a dead end.
   *
   * Only display is deduped; {@link getSession} and the cache use the full map.
   */
  _dedupeMigratedCopilotCliSessions(sessions) {
    return dedupeMigratedCopilotCliSessions(sessions, (session) => session.resource);
  }
  observeSession(resource) {
    if (!this._resolvedResources.has(resource)) {
      this._resolvedResources.add(resource);
      const sessionType = getChatSessionType(resource);
      this.chatSessionsService.resolveChatSessionItem(sessionType, resource, CancellationToken.None).catch((error) => this.logger.logIfTrace(`observeSession: resolve failed for ${resource.toString()}: ${error instanceof Error ? error.message : String(error)}`));
    }
    let observable = this._sessionObservables.get(resource);
    if (!observable) {
      this._changedSignal ??= observableSignalFromEvent("agentSessionsChanged", this.onDidChangeSessions);
      const signal = this._changedSignal;
      observable = derived((reader) => {
        signal.read(reader);
        return this._sessions.get(resource);
      });
      this._sessionObservables.set(resource, observable);
    }
    return observable;
  }
  async resolve(provider) {
    const providers2 = Array.isArray(provider) ? provider : provider !== void 0 ? [provider] : this.chatSessionsService.getRegisteredChatSessionItemProviders();
    await Promise.all(providers2.map((provider2) => this.resolveProvider(provider2, { refreshProvider: true })));
  }
  resolveProvider(provider, options3) {
    if (this.chatEntitlementService.sentiment.hidden) {
      return Promise.resolve();
    }
    let resolver = this.resolvers.get(provider);
    if (!resolver) {
      resolver = new ThrottledDelayer(500);
      this.resolvers.set(provider, resolver);
    }
    return resolver.trigger(async (token) => {
      if (token.isCancellationRequested || this.lifecycleService.willShutdown) {
        return;
      }
      try {
        this._onWillResolve.fire(provider);
        return await this.doResolveProvider(provider, options3, token);
      } catch (error) {
        this.logger.logIfTrace(`Error resolving sessions for provider ${provider}: ${error instanceof Error ? error.stack : String(error)}`);
      } finally {
        this._onDidResolve.fire(provider);
      }
    });
  }
  async doResolveProvider(provider, options3, token) {
    if (options3.refreshProvider) {
      await this.chatSessionsService.refreshChatSessionItems([provider], token);
      for (const resource of [...this._resolvedResources]) {
        if (getChatSessionType(resource) === provider) {
          this._resolvedResources.delete(resource);
          if (this._sessionObservables.has(resource)) {
            this.observeSession(resource);
          }
        }
      }
    }
    const mapSessionContributionToType = /* @__PURE__ */ new Map();
    for (const contribution of this.chatSessionsService.getAllChatSessionContributions()) {
      mapSessionContributionToType.set(contribution.type, contribution);
    }
    const registeredProviders = new Set(this.chatSessionsService.getRegisteredChatSessionItemProviders());
    const sessions = new ResourceMap();
    for await (const { chatSessionType, items: providerSessions } of this.chatSessionsService.getChatSessionItems([provider], token)) {
      if (token.isCancellationRequested) {
        return;
      }
      for (const session of providerSessions) {
        let icon2;
        let providerLabel;
        const agentSessionProvider = getAgentSessionProvider(chatSessionType);
        if (agentSessionProvider !== void 0) {
          providerLabel = getAgentSessionProviderName(agentSessionProvider);
          icon2 = getAgentSessionProviderIcon(agentSessionProvider);
        } else {
          providerLabel = mapSessionContributionToType.get(chatSessionType)?.name ?? chatSessionType;
          icon2 = session.iconPath ?? Codicon.terminal;
        }
        const changes = session.changes ?? getAgentChangesSummary(this._sessions.get(session.resource)?.changes);
        const normalizedChanges = changes && !(changes instanceof Array) ? { files: changes.files, insertions: changes.insertions, deletions: changes.deletions } : changes;
        const shouldKeepOpenSessionRead = session.isRead === false && this.chatSessionsService.canSetChatSessionItemRead(session.resource) && !this.explicitlyMarkedUnreadSessions.has(session.resource) && !!this.chatWidgetService.getWidgetBySessionResource(session.resource);
        if (shouldKeepOpenSessionRead) {
          this.chatSessionsService.setChatSessionItemRead(session.resource, true);
        }
        if (session.isRead) {
          this.explicitlyMarkedUnreadSessions.delete(session.resource);
        }
        sessions.set(session.resource, this.toAgentSession({
          providerType: chatSessionType,
          providerLabel,
          resource: session.resource,
          label: session.label.split("\n")[0],
          // protect against weird multi-line labels that break our layout
          description: session.description,
          icon: icon2,
          badge: session.badge,
          tooltip: session.tooltip,
          status: session.status ?? 1 /* Completed */,
          archived: session.archived,
          providerIsRead: shouldKeepOpenSessionRead ? true : session.isRead,
          timing: session.timing,
          changes: normalizedChanges,
          metadata: session.metadata,
          legacyResource: session.legacyResource
        }));
      }
    }
    let preservedViaRegistration = 0;
    for (const [, session] of this._sessions) {
      if (session.providerType !== provider && !sessions.has(session.resource)) {
        const knownProvider = isBuiltInAgentSessionProvider(session.providerType) || mapSessionContributionToType.has(session.providerType);
        if (knownProvider || registeredProviders.has(session.providerType)) {
          sessions.set(session.resource, session);
          if (!knownProvider) {
            preservedViaRegistration++;
          }
        }
      }
    }
    if (preservedViaRegistration > 0) {
      this.logger.logIfTrace(`doResolveProvider(${provider}): preserved ${preservedViaRegistration} live-registered session(s) across a sibling refresh (would have dropped before the preservation fix)`);
    }
    for (const resource of this.explicitlyMarkedUnreadSessions) {
      if (!sessions.has(resource)) {
        this.explicitlyMarkedUnreadSessions.delete(resource);
      }
    }
    const sessionsWithChangedArchivedState = [];
    for (const [, session] of sessions) {
      const previousSession = this._sessions.get(session.resource);
      if (previousSession && this.isArchived(previousSession) !== this.isArchived(session)) {
        sessionsWithChangedArchivedState.push(session);
      }
    }
    this._sessions = sessions;
    this._resolved = true;
    this.migrateReadStateToProvider(sessions.values());
    this.logger.logAllStatsIfTrace("Sessions resolved from providers");
    for (const session of sessionsWithChangedArchivedState) {
      this._onDidChangeSessionArchivedState.fire(session);
    }
    this._onDidChangeSessions.fire();
  }
  toAgentSession(data) {
    return {
      ...data,
      isArchived: () => this.isArchived(data),
      setArchived: (archived) => this.setArchived(data, archived),
      isPinned: () => this.isPinned(data),
      setPinned: (pinned) => this.setPinned(data, pinned),
      isRead: () => this.isRead(data),
      isMarkedUnread: () => this.isMarkedUnread(data),
      setRead: (read) => this.setRead(data, read)
    };
  }
  static {
    //#region States
    this.UNREAD_MARKER = -1;
  }
  /**
   * Resolve the state entry for a session, honoring a one-way migration from
   * {@link IAgentSessionData.legacyResource} when no entry yet exists for the
   * session's current resource. Adopts the legacy entry forward (copies it onto
   * the current resource key and removes the legacy entry). Returns undefined if
   * neither a current nor a legacy entry exists.
   */
  resolveStateEntry(session) {
    const own = this.sessionStates.get(session.resource);
    if (own !== void 0) {
      return own;
    }
    const legacy = session.legacyResource;
    if (!legacy) {
      return void 0;
    }
    if (legacy.scheme !== session.resource.scheme || legacy.toString() === session.resource.toString()) {
      return void 0;
    }
    const prev = this.sessionStates.get(legacy);
    if (prev === void 0) {
      return void 0;
    }
    this.sessionStates.set(session.resource, { ...prev });
    this.sessionStates.delete(legacy);
    return this.sessionStates.get(session.resource);
  }
  isArchived(session) {
    if (this.chatSessionsService.canSetChatSessionItemArchived(session.resource)) {
      return Boolean(session.archived);
    }
    return this.resolveStateEntry(session)?.archived ?? Boolean(session.archived);
  }
  setArchived(session, archived) {
    if (archived) {
      this.setRead(session, true);
    }
    if (archived === this.isArchived(session)) {
      return;
    }
    if (this.chatSessionsService.canSetChatSessionItemArchived(session.resource)) {
      this.chatSessionsService.setChatSessionItemArchived(session.resource, archived);
      return;
    }
    const state = this.resolveStateEntry(session) ?? {};
    this.sessionStates.set(session.resource, { ...state, archived });
    const agentSession = this._sessions.get(session.resource);
    if (agentSession) {
      this._onDidChangeSessionArchivedState.fire(agentSession);
    }
    this._onDidChangeSessions.fire();
  }
  isPinned(session) {
    return this.resolveStateEntry(session)?.pinned ?? false;
  }
  setPinned(session, pinned) {
    if (pinned === this.isPinned(session)) {
      return;
    }
    const state = this.resolveStateEntry(session) ?? {};
    this.sessionStates.set(session.resource, { ...state, pinned });
    this._onDidChangeSessions.fire();
  }
  isMarkedUnread(session) {
    if (this.ownsReadState(session)) {
      return !this.isRead(session);
    }
    return this.resolveStateEntry(session)?.read === AgentSessionsModel.UNREAD_MARKER;
  }
  /**
   * Whether the session's provider owns read state. When it does the value is
   * shared with every other client on the same backend (the agent window, or
   * another window on the same agent host), so the local heuristics below must
   * not second-guess it.
   */
  ownsReadState(session) {
    return this.chatSessionsService.canSetChatSessionItemRead(session.resource);
  }
  isRead(session) {
    if (this.isArchived(session)) {
      return true;
    }
    if (this.ownsReadState(session)) {
      return session.providerIsRead ?? true;
    }
    const storedReadDate = this.resolveStateEntry(session)?.read;
    if (storedReadDate === AgentSessionsModel.UNREAD_MARKER) {
      return false;
    }
    if (this.localReadDateCoversActivity(session, storedReadDate)) {
      return true;
    }
    return !!this.chatWidgetService.getWidgetBySessionResource(session.resource);
  }
  static {
    /** Grace window absorbing a click away from a session just before it finishes. */
    this.READ_GRACE_WINDOW = 2e3;
  }
  /**
   * Whether the locally-stored read timestamp covers the session's last
   * activity. Falls back to the read-date baseline when nothing is stored.
   */
  localReadDateCoversActivity(session, storedReadDate) {
    const readDate = Math.max(storedReadDate ?? 0, this.readDateBaseline);
    return readDate >= this.sessionTimeForReadStateTracking(session) - AgentSessionsModel.READ_GRACE_WINDOW;
  }
  sessionTimeForReadStateTracking(session) {
    return session.timing.lastRequestEnded ?? session.timing.created;
  }
  setRead(session, read, skipEvent) {
    if (this.ownsReadState(session)) {
      if (read) {
        this.explicitlyMarkedUnreadSessions.delete(session.resource);
      } else {
        this.explicitlyMarkedUnreadSessions.add(session.resource);
      }
      if (read === (session.providerIsRead ?? true)) {
        return;
      }
      this.chatSessionsService.setChatSessionItemRead(session.resource, read);
      return;
    }
    const state = this.resolveStateEntry(session) ?? {};
    let newRead;
    if (read) {
      newRead = Math.max(Date.now(), this.sessionTimeForReadStateTracking(session));
      if (typeof state.read === "number" && state.read >= newRead) {
        return;
      }
    } else {
      newRead = AgentSessionsModel.UNREAD_MARKER;
      if (state.read === AgentSessionsModel.UNREAD_MARKER) {
        return;
      }
    }
    this.sessionStates.set(session.resource, { ...state, read: newRead });
    if (!skipEvent) {
      this._onDidChangeSessions.fire();
    }
  }
  static {
    this.READ_MIGRATION_DONE_KEY = "agentSessions.providerReadMigration";
  }
  /**
   * One-time hand-off of locally-tracked read state to providers that own it,
   * so sessions read before the provider took ownership don't all resurface as
   * unread. Only ever promotes to read, and runs at most once per session so a
   * later "Mark as Unread" is not undone on the next refresh.
   *
   * The ledger is application-scoped even though the local state it hands off
   * is per-workspace: the provider-owned state it writes to is global, so a
   * second workspace that can see the same session (an empty window lists them
   * all) must not migrate it again and re-promote a deliberate "Mark as Unread".
   */
  migrateReadStateToProvider(sessions) {
    let changed = false;
    for (const session of sessions) {
      if (this.migratedReadResources.has(session.resource) || !this.ownsReadState(session)) {
        continue;
      }
      if (session.providerIsRead === void 0) {
        continue;
      }
      this.migratedReadResources.add(session.resource);
      changed = true;
      if (session.providerIsRead) {
        continue;
      }
      const storedReadDate = this.resolveStateEntry(session)?.read;
      if (storedReadDate === AgentSessionsModel.UNREAD_MARKER) {
        continue;
      }
      if (this.localReadDateCoversActivity(session, storedReadDate)) {
        this.chatSessionsService.setChatSessionItemRead(session.resource, true);
      }
    }
    if (changed) {
      this.storageService.store(
        AgentSessionsModel.READ_MIGRATION_DONE_KEY,
        JSON.stringify(Array.from(this.migratedReadResources).map((resource) => resource.toString())),
        -1 /* APPLICATION */,
        1 /* MACHINE */
      );
    }
  }
  loadMigratedReadResources() {
    const raw = this.storageService.get(AgentSessionsModel.READ_MIGRATION_DONE_KEY, -1 /* APPLICATION */);
    if (!raw) {
      return;
    }
    try {
      for (const entry of JSON.parse(raw)) {
        this.migratedReadResources.add(URI.parse(entry));
      }
    } catch {
    }
  }
  static {
    this.READ_DATE_BASELINE_KEY = "agentSessions.readDateBaseline2";
  }
  resolveReadDateBaseline() {
    let readDateBaseline = this.storageService.getNumber(AgentSessionsModel.READ_DATE_BASELINE_KEY, 1 /* WORKSPACE */, 0);
    if (readDateBaseline > 0) {
      return readDateBaseline;
    }
    readDateBaseline = this.productService.quality === "stable" ? Date.now() - 7 * 24 * 60 * 60 * 1e3 : Date.now();
    this.storageService.store(AgentSessionsModel.READ_DATE_BASELINE_KEY, readDateBaseline, 1 /* WORKSPACE */, 1 /* MACHINE */);
    return readDateBaseline;
  }
  //#endregion
};

AgentSessionsModel = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IWorkspaceTrustManagementService),
  __decorateParam(8, IChatEntitlementService)
], AgentSessionsModel);

var AgentSessionsCache = class {
  constructor(storageService) {
    this.storageService = storageService;
  }
  static {
    this.SESSIONS_STORAGE_KEY = "agentSessions.model.cache";
  }
  static {
    this.STATE_STORAGE_KEY = "agentSessions.state.cache";
  }
  //#region Sessions
  saveCachedSessions(sessions) {
    const serialized = sessions.map((session) => ({
      providerType: session.providerType,
      providerLabel: session.providerLabel,
      resource: session.resource.toString(),
      icon: session.icon.id,
      label: session.label,
      description: session.description,
      badge: session.badge,
      tooltip: session.tooltip,
      status: isSessionInProgressStatus(session.status) ? 1 /* Completed */ : session.status,
      // never cache sessions as in progress, this needs to be live state
      archived: session.archived,
      isRead: session.providerIsRead,
      timing: session.timing,
      changes: getAgentChangesSummary(session.changes),
      metadata: session.metadata,
      legacyResource: session.legacyResource?.toString()
    }));
    this.storageService.store(AgentSessionsCache.SESSIONS_STORAGE_KEY, safeStringify(serialized), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  loadCachedSessions() {
    const sessionsCache = this.storageService.get(AgentSessionsCache.SESSIONS_STORAGE_KEY, 1 /* WORKSPACE */);
    if (!sessionsCache) {
      return [];
    }
    try {
      const cached = JSON.parse(sessionsCache);
      return cached.map((session) => ({
        providerType: session.providerType,
        providerLabel: session.providerLabel,
        resource: typeof session.resource === "string" ? URI.parse(session.resource) : URI.revive(session.resource),
        icon: ThemeIcon.fromId(session.icon),
        label: session.label,
        description: session.description,
        badge: session.badge,
        tooltip: session.tooltip,
        status: session.status,
        archived: session.archived,
        providerIsRead: session.isRead,
        timing: {
          created: session.timing.created ?? 0,
          lastRequestStarted: session.timing.lastRequestStarted,
          lastRequestEnded: session.timing.lastRequestEnded
        },
        changes: getAgentChangesSummary(session.changes),
        metadata: session.metadata,
        legacyResource: session.legacyResource ? URI.parse(session.legacyResource) : void 0
      }));
    } catch {
      return [];
    }
  }
  //#endregion
  //#region States
  saveSessionStates(states) {
    const serialized = Array.from(states.entries()).map(([resource, state]) => ({
      resource: resource.toString(),
      archived: state.archived,
      pinned: state.pinned,
      read: state.read
    }));
    this.storageService.store(AgentSessionsCache.STATE_STORAGE_KEY, JSON.stringify(serialized), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  loadSessionStates() {
    const states = new ResourceMap();
    const statesCache = this.storageService.get(AgentSessionsCache.STATE_STORAGE_KEY, 1 /* WORKSPACE */);
    if (!statesCache) {
      return states;
    }
    try {
      const cached = JSON.parse(statesCache);
      for (const entry of cached) {
        states.set(typeof entry.resource === "string" ? URI.parse(entry.resource) : URI.revive(entry.resource), {
          archived: entry.archived,
          pinned: entry.pinned,
          read: entry.read
        });
      }
    } catch {
    }
    return states;
  }
  //#endregion
};

AgentSessionsCache = __decorateClass([
  __decorateParam(0, IStorageService)
], AgentSessionsCache);
export { hasValidDiff, getAgentChangesSummary, isLocalAgentSessionItem, getAgentSessionPullRequestUri, getAgentSessionPullRequestContextValue, isAgentHostAgentSessionItem, isAgentSession, isAgentSessionsModel, isAgentSessionSection, isAgentSessionShowMore, isAgentSessionShowLess, isMarshalledAgentSessionContext, statusToString, agentSessionsOutputChannelId, agentSessionsOutputChannelLabel, AgentSessionsLogger, AgentSessionsModel, AgentSessionsCache };
