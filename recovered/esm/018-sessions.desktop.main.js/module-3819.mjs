// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionsManagementService.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { buildHostLocalEventsPath, dedupeMigratedCopilotCliSessions, getCopilotCliSessionRawId } from "./module-1110.mjs";
import { getSessionReferenceResource } from "./module-3574.mjs";
import { agentHostAuthority } from "./module-1001.mjs";
import { CancellationError } from "./module-0004.mjs";
import { ISessionsManagementService, WorkspaceNotTrustedError } from "./module-1766.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetHistoryService } from "./module-1470.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPathService } from "./module-0939.mjs";
import { IRemoteAgentHostService } from "./module-1736.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionsManagementService.ts
var LAST_USED_QUICK_CHAT_SESSION_TYPE_STORAGE_KEY = "sessions.quickChat.lastUsedSessionType";

var SessionsManagementService = class extends Disposable {
  constructor(logService, sessionsProvidersService, uriIdentityService, chatService, chatWidgetHistoryService, storageService, pathService, remoteAgentHostService, workspaceTrustManagementService) {
    super();
    this.logService = logService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.uriIdentityService = uriIdentityService;
    this.chatService = chatService;
    this.chatWidgetHistoryService = chatWidgetHistoryService;
    this.storageService = storageService;
    this.pathService = pathService;
    this.remoteAgentHostService = remoteAgentHostService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._onDidStartSession = this._register(new Emitter());
    this.onDidStartSession = this._onDidStartSession.event;
    this._onWillSendRequest = this._register(new Emitter());
    this.onWillSendRequest = this._onWillSendRequest.event;
    this._onDidSendRequest = this._register(new Emitter());
    this.onDidSendRequest = this._onDidSendRequest.event;
    this._onDidArchiveSession = this._register(new Emitter());
    this.onDidArchiveSession = this._onDidArchiveSession.event;
    this._onDidUnarchiveSession = this._register(new Emitter());
    this.onDidUnarchiveSession = this._onDidUnarchiveSession.event;
    this._onDidDeleteSession = this._register(new Emitter());
    this.onDidDeleteSession = this._onDidDeleteSession.event;
    this._onDidDeleteChat = this._register(new Emitter());
    this.onDidDeleteChat = this._onDidDeleteChat.event;
    this._onDidRenameChat = this._register(new Emitter());
    this.onDidRenameChat = this._onDidRenameChat.event;
    this._onDidRenameSession = this._register(new Emitter());
    this.onDidRenameSession = this._onDidRenameSession.event;
    this._onDidChangeSessionTypes = this._register(new Emitter());
    this.onDidChangeSessionTypes = this._onDidChangeSessionTypes.event;
    this._onDidReplaceSession = this._register(new Emitter());
    this.onDidReplaceSession = this._onDidReplaceSession.event;
    this._onDidDiscardNewSession = this._register(new Emitter());
    this.onDidDiscardNewSession = this._onDidDiscardNewSession.event;
    this._onDidReplaceNewDraftSession = this._register(new Emitter());
    this.onDidReplaceNewDraftSession = this._onDidReplaceNewDraftSession.event;
    this._sessionTypes = [];
    /** Tracks the in-progress new session (composed but not yet sent). */
    this._newSession = observableValue(this, void 0);
    this.newSession = this._newSession;
    /** Tracks the Automation dialog's in-progress session draft. */
    this._automationSession = observableValue(this, void 0);
    this.automationSession = this._automationSession;
    this._providerListeners = this._register(new DisposableMap());
    this._disposeCts = this._register(new CancellationTokenSource());
    this._unlistedNewSessions = new ResourceMap();
    this._inFlightNewSessionRequests = new ResourceMap();
    /**
     * Chat resources for which this service has just kicked off a
     * `provider.sendRequest` and will emit `_onDidSendRequest` manually after
     * the provider call resolves. Used to suppress the duplicate event that
     * would otherwise arrive via {@link IChatService.onDidSubmitRequest},
     * which fires synchronously inside the same provider call.
     */
    this._pendingSendChatResources = /* @__PURE__ */ new Set();
    this._register(this.sessionsProvidersService.onDidChangeProviders((e4) => {
      this._onProvidersChanged(e4);
      this._updateSessionTypes();
    }));
    this._subscribeToProviders(this.sessionsProvidersService.getProviders());
    this._sessionTypes = this._collectSessionTypes();
    this._register(this.chatService.onDidSubmitRequest(({ chatSessionResource, message, attachedContext }) => {
      if (this._pendingSendChatResources.has(chatSessionResource.toString())) {
        return;
      }
      const ownedChat = this.getSessionForChatResource(chatSessionResource);
      if (ownedChat) {
        this._onDidSendRequest.fire({
          session: ownedChat.session,
          chat: ownedChat.chat,
          isNewSession: false,
          isNewChat: false,
          options: { query: message?.text ?? "", attachedContext }
        });
      }
    }));
  }
  _onProvidersChanged(e4) {
    for (const provider of e4.removed) {
      this._providerListeners.deleteAndDispose(provider.id);
    }
    if (e4.added.length) {
      this._subscribeToProviders(e4.added);
    }
  }
  _subscribeToProviders(providers2) {
    for (const provider of providers2) {
      const disposables = new DisposableStore();
      disposables.add(provider.onDidChangeSessions((e4) => this.onDidChangeSessionsFromSessionsProviders(e4)));
      if (provider.onDidReplaceSession) {
        disposables.add(provider.onDidReplaceSession((e4) => this._handleDidReplaceSession(e4.from, e4.to)));
      }
      if (provider.onDidChangeSessionTypes) {
        disposables.add(provider.onDidChangeSessionTypes(() => this._updateSessionTypes()));
      }
      this._providerListeners.set(provider.id, disposables);
    }
  }
  _handleDidReplaceSession(from, to) {
    this.chatWidgetHistoryService.moveHistory("panel" /* Chat */, from.sessionId, to.sessionId);
    this._onDidReplaceSession.fire({ from, to });
    this._onDidChangeSessions.fire({
      added: [],
      removed: from.sessionId === to.sessionId ? [] : [from],
      changed: [to]
    });
  }
  onDidChangeSessionsFromSessionsProviders(e4) {
    if (e4.removed.length) {
      const current = this._newSession.get();
      if (current && e4.removed.some((r2) => r2.sessionId === current.sessionId)) {
        this._newSession.set(void 0, void 0);
      }
      const automationSession = this._automationSession.get();
      if (automationSession && e4.removed.some((r2) => r2.sessionId === automationSession.sessionId)) {
        this._automationSession.set(void 0, void 0);
      }
    }
    this._onDidChangeSessions.fire(e4);
  }
  /**
   * Resolves a session resource to the one that should actually be opened,
   * giving providers a chance to supersede another provider's resource (legacy
   * Copilot CLI adoption). Falls back to `resource` when no provider claims it,
   * so an unresolvable session still opens the way it does today.
   */
  async resolveSessionResource(resource, reason) {
    for (const provider of this.sessionsProvidersService.getProviders()) {
      if (!provider.resolveSessionResource) {
        continue;
      }
      try {
        const resolved = await provider.resolveSessionResource(resource, reason);
        if (resolved) {
          return resolved;
        }
      } catch (error) {
        this.logService.warn(`[SessionsManagement] provider '${provider.id}' failed to resolve ${resource.toString()}`, error);
      }
    }
    return resource;
  }
  getSessions() {
    return this._dedupeMigratedCopilotCliSessions(this._getMergedSessions());
  }
  getInFlightNewSessionRequests() {
    return Array.from(this._inFlightNewSessionRequests.values(), (entry) => entry.session);
  }
  trackInFlightNewSessionRequest(session) {
    const entry = this._inFlightNewSessionRequests.get(session.resource);
    if (entry) {
      entry.count++;
    } else {
      this._inFlightNewSessionRequests.set(session.resource, { session, count: 1 });
    }
    return toDisposable(() => {
      const current = this._inFlightNewSessionRequests.get(session.resource);
      if (current?.count === 1) {
        this._inFlightNewSessionRequests.delete(session.resource);
      } else if (current) {
        current.count--;
      }
    });
  }
  _getMergedSessions() {
    const sessions = [];
    for (const provider of this.sessionsProvidersService.getProviders()) {
      sessions.push(...provider.getSessions());
    }
    return sessions;
  }
  /**
   * A legacy Copilot CLI session migrated in place to the agent host is briefly
   * listed by BOTH the extension-host provider (`copilotcli:/<id>`) and the
   * agent-host provider (`agent-host-copilotcli:/<id>`) for the same underlying
   * SDK session id — the workbench agent-session model caches the stale legacy
   * entry even after the extension stops reporting it. Drop the legacy entry so
   * exactly one row shows per session.
   *
   * A legacy row that has no twin yet stays visible: opening it redirects through
   * {@link resolveSessionResource} and adopts it, so it is never a dead end.
   */
  _dedupeMigratedCopilotCliSessions(sessions) {
    return dedupeMigratedCopilotCliSessions(sessions, (session) => session.resource);
  }
  getSession(resource) {
    const unlistedSession = this._unlistedNewSessions.get(resource);
    if (unlistedSession) {
      return unlistedSession;
    }
    return this._getMergedSessions().find(
      (s) => this.uriIdentityService.extUri.isEqual(s.resource, resource)
    );
  }
  getSessionForChatResource(resource) {
    for (const session of this._getMergedSessions()) {
      const chat = session.chats.get().find((c) => this.uriIdentityService.extUri.isEqual(c.resource, resource));
      if (chat) {
        return { session, chat };
      }
      const mainChat = session.mainChat.get();
      if (this.uriIdentityService.extUri.isEqual(mainChat.resource, resource)) {
        return { session, chat: mainChat };
      }
    }
    return void 0;
  }
  getAllSessionTypes() {
    return [...this._sessionTypes];
  }
  getAllProviderSessionTypes() {
    const result = [];
    for (const provider of this.sessionsProvidersService.getProviders()) {
      for (const sessionType of provider.sessionTypes) {
        result.push({ providerId: provider.id, sessionType });
      }
    }
    return result;
  }
  getSessionTypesForFolder(folderUri) {
    const result = [];
    for (const provider of this.sessionsProvidersService.getProviders()) {
      if (!provider.resolveWorkspace(folderUri)) {
        continue;
      }
      for (const sessionType of provider.getSessionTypes(folderUri)) {
        result.push({ providerId: provider.id, sessionType });
      }
    }
    return result;
  }
  getQuickChatSessionTypes() {
    const result = [];
    for (const provider of this.sessionsProvidersService.getProviders()) {
      if (!provider.supportsQuickChats) {
        continue;
      }
      for (const sessionType of provider.sessionTypes) {
        result.push({ providerId: provider.id, sessionType });
      }
    }
    return result;
  }
  isNewSessionTargetAvailable(folderUri, options3) {
    return this._isTargetAvailable(this.getSessionTypesForFolder(folderUri), options3);
  }
  isQuickChatTargetAvailable(options3) {
    return this._isTargetAvailable(this.getQuickChatSessionTypes(), options3);
  }
  _isTargetAvailable(sessionTypes, options3) {
    return sessionTypes.some(
      (candidate) => (!options3?.providerId || candidate.providerId === options3.providerId) && (!options3?.sessionTypeId || candidate.sessionType.id === options3.sessionTypeId)
    );
  }
  resolveWorkspace(folderUri, preferredProviderId) {
    if (preferredProviderId) {
      const preferred = this.sessionsProvidersService.getProvider(preferredProviderId);
      const workspace = preferred?.resolveWorkspace(folderUri);
      if (workspace) {
        return { providerId: preferredProviderId, workspace };
      }
    }
    for (const provider of this.sessionsProvidersService.getProviders()) {
      const workspace = provider.resolveWorkspace(folderUri);
      if (workspace) {
        return { providerId: provider.id, workspace };
      }
    }
    return void 0;
  }
  _collectSessionTypes() {
    const types = [];
    const seen = /* @__PURE__ */ new Set();
    for (const provider of this.sessionsProvidersService.getProviders()) {
      for (const type of provider.sessionTypes) {
        if (!seen.has(type.id)) {
          seen.add(type.id);
          types.push(type);
        }
      }
    }
    return types;
  }
  _updateSessionTypes() {
    this._sessionTypes = this._collectSessionTypes();
    this._onDidChangeSessionTypes.fire();
  }
  discardNewSession(session) {
    const current = this._newSession.get();
    if (!current) {
      return;
    }
    if (session && session.sessionId !== current.sessionId) {
      return;
    }
    this._newSession.set(void 0, void 0);
    this._getProvider(current)?.deleteNewSession(current.sessionId);
    this._onDidDiscardNewSession.fire(current);
  }
  discardAutomationSession(session) {
    const current = this._automationSession.get();
    if (!current || session && session.sessionId !== current.sessionId) {
      return;
    }
    this._automationSession.set(void 0, void 0);
    this._getProvider(current)?.deleteNewSession(current.sessionId);
  }
  /**
   * Resolve the provider and session type to use for a new session in the
   * given folder. Includes that provider's resolved workspace so headless
   * callers can enforce provider-specific trust without resolving it again.
   */
  _resolveProviderForNewSession(folderUri, options3) {
    const providers2 = this.sessionsProvidersService.getProviders();
    let provider;
    let workspace;
    let sessionTypeId;
    const requiresWorktreeConfiguration = options3?.isolationMode === "worktree" || options3?.worktreeBranchTrack !== void 0 || options3?.worktreeCreateNewBranch !== void 0 || options3?.branch !== void 0;
    const resolveSessionTypeId = (candidate) => {
      const sessionTypes = candidate.getSessionTypes(folderUri);
      if (options3?.sessionTypeId) {
        const requested = sessionTypes.find((type) => type.id === options3.sessionTypeId);
        return requested && (!requiresWorktreeConfiguration || requested.supportsWorktreeConfiguration === true) ? requested.id : void 0;
      }
      return (requiresWorktreeConfiguration ? sessionTypes.find((type) => type.supportsWorktreeConfiguration === true) : sessionTypes[0])?.id;
    };
    if (options3?.providerId) {
      provider = providers2.find((p) => p.id === options3.providerId);
      if (!provider) {
        throw new Error(`Sessions provider '${options3.providerId}' not found`);
      }
      workspace = provider.resolveWorkspace(folderUri);
      if (!workspace) {
        throw new Error(`Sessions provider '${options3.providerId}' cannot resolve folder '${folderUri.toString()}'`);
      }
      sessionTypeId = resolveSessionTypeId(provider);
      if (!sessionTypeId) {
        if (requiresWorktreeConfiguration) {
          throw new Error(`Sessions provider '${options3.providerId}' does not support worktree configuration for folder '${folderUri.toString()}'`);
        }
        if (options3.sessionTypeId) {
          throw new Error(`Sessions provider '${options3.providerId}' does not advertise session type '${options3.sessionTypeId}'`);
        }
        throw new Error(`No session types available for provider '${provider.id}'`);
      }
    } else {
      for (const candidate of providers2) {
        const candidateWorkspace = candidate.resolveWorkspace(folderUri);
        if (!candidateWorkspace) {
          continue;
        }
        const candidateSessionTypeId = resolveSessionTypeId(candidate);
        if (!candidateSessionTypeId) {
          continue;
        }
        provider = candidate;
        workspace = candidateWorkspace;
        sessionTypeId = candidateSessionTypeId;
        break;
      }
      if (!provider || !workspace) {
        throw new Error(requiresWorktreeConfiguration ? `No sessions provider supports worktree configuration for folder '${folderUri.toString()}'` : `No sessions provider can resolve folder '${folderUri.toString()}'`);
      }
    }
    if (!sessionTypeId) {
      throw new Error(`No session types available for provider '${provider.id}'`);
    }
    return { provider, sessionTypeId, workspace };
  }
  createNewSession(folderUri, options3) {
    const { provider, sessionTypeId } = this._resolveProviderForNewSession(folderUri, options3);
    const previousNewSession = this._newSession.get();
    const session = provider.createNewSession(folderUri, sessionTypeId, { metadata: options3?.metadata });
    if (previousNewSession && previousNewSession.sessionId !== session.sessionId) {
      this._getProvider(previousNewSession)?.deleteNewSession(previousNewSession.sessionId);
      this._onDidReplaceNewDraftSession.fire({ from: previousNewSession, to: session });
    }
    this._newSession.set(session, void 0);
    return session;
  }
  createAutomationSession(folderUri, options3) {
    const { provider, sessionTypeId } = this._resolveProviderForNewSession(folderUri, options3);
    const previousAutomationSession = this._automationSession.get();
    const session = provider.createNewSession(folderUri, sessionTypeId);
    if (previousAutomationSession && previousAutomationSession.sessionId !== session.sessionId) {
      this._getProvider(previousAutomationSession)?.deleteNewSession(previousAutomationSession.sessionId);
    }
    this._automationSession.set(session, void 0);
    return session;
  }
  /**
   * Resolve the provider and session type to use for a quick chat, keyed on
   * {@link ISessionsProvider.supportsQuickChats} instead of `resolveWorkspace`.
   * Honors an explicit `options.sessionTypeId` (validated against the chosen
   * provider) and otherwise defaults to the last-used type, then the first
   * advertised one. Throws when no capable provider/type can be resolved.
   */
  _resolveProviderForQuickChat(options3) {
    const providers2 = this.sessionsProvidersService.getProviders();
    let provider;
    if (options3?.providerId) {
      provider = providers2.find((p) => p.id === options3.providerId);
      if (!provider) {
        throw new Error(`Sessions provider '${options3.providerId}' not found`);
      }
      if (!provider.supportsQuickChats) {
        throw new Error(`Sessions provider '${options3.providerId}' does not support quick chats`);
      }
      if (options3.sessionTypeId && !provider.sessionTypes.some((t2) => t2.id === options3.sessionTypeId)) {
        throw new Error(`Sessions provider '${options3.providerId}' does not advertise session type '${options3.sessionTypeId}'`);
      }
    } else {
      for (const candidate of providers2) {
        if (!candidate.supportsQuickChats) {
          continue;
        }
        if (options3?.sessionTypeId && !candidate.sessionTypes.some((t2) => t2.id === options3.sessionTypeId)) {
          continue;
        }
        provider = candidate;
        break;
      }
      if (!provider) {
        throw new Error("No sessions provider supports quick chats");
      }
    }
    const sessionTypeId = options3?.sessionTypeId ?? this._defaultQuickChatSessionType(provider);
    if (!sessionTypeId) {
      throw new Error(`No session types available for provider '${provider.id}'`);
    }
    return { provider, sessionTypeId };
  }
  /** Default quick-chat session type: the last-used one if still advertised, else the first. */
  _defaultQuickChatSessionType(provider) {
    const lastUsed = this.storageService.get(LAST_USED_QUICK_CHAT_SESSION_TYPE_STORAGE_KEY, 0 /* PROFILE */);
    if (lastUsed && provider.sessionTypes.some((t2) => t2.id === lastUsed)) {
      return lastUsed;
    }
    return provider.sessionTypes[0]?.id;
  }
  createQuickChat(options3) {
    const { provider, sessionTypeId } = this._resolveProviderForQuickChat(options3);
    const previousNewSession = this._newSession.get();
    const session = provider.createQuickChat(sessionTypeId);
    this._newSession.set(session, void 0);
    this.storageService.store(LAST_USED_QUICK_CHAT_SESSION_TYPE_STORAGE_KEY, sessionTypeId, 0 /* PROFILE */, 0 /* USER */);
    if (previousNewSession && previousNewSession.sessionId !== session.sessionId) {
      this._getProvider(previousNewSession)?.deleteNewSession(previousNewSession.sessionId);
    }
    return session;
  }
  createAutomationQuickChat(options3) {
    const { provider, sessionTypeId } = this._resolveProviderForQuickChat(options3);
    const previousAutomationSession = this._automationSession.get();
    const session = provider.createQuickChat(sessionTypeId);
    if (previousAutomationSession && previousAutomationSession.sessionId !== session.sessionId) {
      this._getProvider(previousAutomationSession)?.deleteNewSession(previousAutomationSession.sessionId);
    }
    this._automationSession.set(session, void 0);
    return session;
  }
  async createNewChatInSession(session, options3) {
    const provider = this._getProvider(session);
    if (!provider) {
      this.logService.warn(`[SessionsManagement] createNewChatInSession: provider '${session.providerId}' not found`);
      return void 0;
    }
    if (!options3?.forceNew) {
      const existingUntitled = session.chats.get().find((c) => c.status.get() === 0 /* Untitled */);
      if (existingUntitled) {
        return existingUntitled;
      }
    }
    const created = await provider.createNewChat(session.sessionId);
    return created;
  }
  async forkChatInSession(session, sourceChat, turnId) {
    const provider = this._getProvider(session);
    if (!provider) {
      throw new Error(`Provider '${session.providerId}' not found for session '${session.sessionId}'`);
    }
    if (!session.capabilities.get().supportsMultipleChats) {
      throw new Error(`Session '${session.sessionId}' does not support forking into a chat`);
    }
    return provider.forkChat(session.sessionId, sourceChat, turnId);
  }
  async createSideChatInSession(session, sourceChat, turnId, selection) {
    const provider = this._getProvider(session);
    if (!provider) {
      throw new Error(`Provider '${session.providerId}' not found for session '${session.sessionId}'`);
    }
    if (!session.capabilities.get().supportsSideChat) {
      throw new Error(`Session '${session.sessionId}' does not support side chats`);
    }
    return provider.createSideChat(session.sessionId, sourceChat, turnId, selection);
  }
  /**
   * For a `/troubleshoot` request, strip any `#session` marker attachments and
   * append a `Session log:` line with the resolved host-local `events.jsonl`
   * path(s) — the referenced sessions if present, otherwise the current one.
   * Returns `options` unchanged when there is nothing to do.
   */
  _augmentOptionsForTroubleshoot(session, options3) {
    const referencedResources = [];
    let remainingAttachments;
    if (options3.attachedContext?.length) {
      const remaining = [];
      for (const entry of options3.attachedContext) {
        const referenced = getSessionReferenceResource(entry);
        if (referenced) {
          referencedResources.push(referenced);
        } else {
          remaining.push(entry);
        }
      }
      if (referencedResources.length) {
        remainingAttachments = remaining;
      }
    }
    const isTroubleshoot = /^\s*\/troubleshoot\b/.test(options3.query);
    if (!isTroubleshoot && referencedResources.length === 0) {
      return options3;
    }
    let result = options3;
    if (remainingAttachments) {
      result = { ...result, attachedContext: remainingAttachments.length ? remainingAttachments : void 0 };
    }
    if (!isTroubleshoot) {
      return result;
    }
    const targets = referencedResources.length ? referencedResources : getCopilotCliSessionRawId(session.resource) ? [session.resource] : [];
    const userHome = this.pathService.userHome({ preferLocal: true });
    const getConnection = (authority) => this.remoteAgentHostService.connections.find((c) => agentHostAuthority(c.address) === authority);
    const eventPaths = Array.from(new Set(
      targets.map((resource) => buildHostLocalEventsPath(resource, userHome, getConnection)).filter((path) => !!path)
    ));
    if (eventPaths.length === 0) {
      return result;
    }
    return { ...result, query: `${result.query}

Session log: ${eventPaths.join(", ")}` };
  }
  async sendNewChatRequest(session, options3) {
    let provider = this._getProvider(session);
    if (!provider) {
      throw new Error(`Sessions provider '${session.providerId}' not found`);
    }
    const isNewSessionRequest = session.status.get() === 0 /* Untitled */;
    const inFlightRequest = isNewSessionRequest ? this.trackInFlightNewSessionRequest(session) : void 0;
    if (options3.background) {
      this._newSession.set(void 0, void 0);
      void this._prepareAndSendNewChatRequestInBackground(provider, session, options3).catch((e4) => {
        this.logService.error("[SessionsManagement] Failed to send background request:", e4);
      }).finally(() => inFlightRequest?.dispose());
      return;
    }
    const requestActivity = new MutableDisposable();
    try {
      requestActivity.value = provider.startNewSessionRequest?.(session.sessionId);
      ({ provider, session } = await this._prepareNewSessionForSend(provider, session, requestActivity, true));
      this._newSession.set(void 0, void 0);
      this._onWillSendRequest.fire(session);
      const chat = await provider.createNewChat(session.sessionId, options3.query);
      const sendOptions = this._augmentOptionsForTroubleshoot(session, options3);
      const chatResourceKey = chat.resource.toString();
      this._pendingSendChatResources.add(chatResourceKey);
      let updatedSession;
      try {
        updatedSession = await provider.sendRequest(session.sessionId, chat.resource, sendOptions);
      } finally {
        this._pendingSendChatResources.delete(chatResourceKey);
      }
      if (updatedSession.sessionId !== session.sessionId) {
        this.logService.info(`[SessionsManagement] sendRequest: active session replaced: ${session.sessionId} -> ${updatedSession.sessionId}`);
      }
      this._onDidStartSession.fire(updatedSession);
      this._onDidSendRequest.fire({ session: updatedSession, chat, isNewSession: true, isNewChat: true, options: options3 });
    } finally {
      requestActivity.dispose();
      inFlightRequest?.dispose();
    }
  }
  async _prepareNewSessionForSend(provider, session, requestActivity, replaceCurrentDraft) {
    if (!provider.prepareNewSession) {
      return { provider, session };
    }
    const originalSession = session;
    const preparationTokenSource = new CancellationTokenSource(this._disposeCts.token);
    const preparationListeners = new DisposableStore();
    preparationListeners.add(this.onDidReplaceNewDraftSession(({ from }) => {
      if (from.sessionId === originalSession.sessionId) {
        preparationTokenSource.cancel();
      }
    }));
    preparationListeners.add(this.onDidDiscardNewSession((discarded) => {
      if (discarded.sessionId === originalSession.sessionId) {
        preparationTokenSource.cancel();
      }
    }));
    let prepared;
    try {
      prepared = await provider.prepareNewSession(session.sessionId, preparationTokenSource.token);
    } finally {
      preparationListeners.dispose();
      preparationTokenSource.dispose();
    }
    const preparedSession = prepared.session;
    if (preparedSession.sessionId === originalSession.sessionId) {
      return { provider, session };
    }
    const preparedProvider = this._getProvider(preparedSession);
    if (!preparedProvider) {
      await prepared.discard?.();
      throw new Error(`Sessions provider '${preparedSession.providerId}' not found after preparing the new session`);
    }
    if (replaceCurrentDraft && this._newSession.get()?.sessionId !== originalSession.sessionId) {
      if (prepared.discard) {
        await prepared.discard();
      } else {
        preparedProvider.deleteNewSession(preparedSession.sessionId);
      }
      throw new CancellationError();
    }
    const preparedRequestActivity = requestActivity ? preparedProvider.startNewSessionRequest?.(preparedSession.sessionId) : void 0;
    provider.deleteNewSession(originalSession.sessionId);
    if (requestActivity) {
      requestActivity.value = preparedRequestActivity;
    }
    if (replaceCurrentDraft) {
      this._onDidReplaceNewDraftSession.fire({ from: originalSession, to: preparedSession });
    }
    return { provider: preparedProvider, session: preparedSession };
  }
  /**
   * Create a new session for the given folder and send a chat request to it,
   * without navigating into the started session. The started session appears
   * in the sessions list once the provider commits it, while the user's
   * current view is left untouched. Returns the committed session,
   * or `undefined` if the service was disposed during the send.
   *
   * Unlike {@link sendNewChatRequest} with `background`, this does not go
   * through the new-session composer: it creates a fresh session purely for
   * this request and never sets it as pending/active. Intended for callers
   * outside the composer that want to kick off a session programmatically.
   *
   * If the send or any configuration setter fails, the stranded draft is
   * disposed through its provider and the error is rethrown.
   */
  async createAndSendNewChatRequest(folderUri, options3, createOptions3, token = CancellationToken.None) {
    const { provider, sessionTypeId, workspace } = this._resolveProviderForNewSession(folderUri, createOptions3);
    if (workspace.requiresWorkspaceTrust) {
      const trustInfo = await this.workspaceTrustManagementService.getUriTrustInfo(folderUri);
      if (!trustInfo.trusted) {
        throw new WorkspaceNotTrustedError();
      }
    }
    const session = provider.createNewSession(folderUri, sessionTypeId, { metadata: createOptions3?.metadata });
    this._unlistedNewSessions.set(session.resource, session);
    const requestActivity = new MutableDisposable();
    try {
      try {
        requestActivity.value = isDeferredNewSessionRequestOptions(options3) ? provider.startNewSessionRequest?.(session.sessionId, options3.activity) : provider.startNewSessionRequest?.(session.sessionId);
        createOptions3?.onSessionCreated?.(session);
      } catch (error) {
        provider.deleteNewSession(session.sessionId);
        throw error;
      }
      const supportsWorktreeConfiguration = provider.getSessionTypes(folderUri).find((sessionType) => sessionType.id === sessionTypeId)?.supportsWorktreeConfiguration === true;
      return await this._configureAndSendNewSession(provider, session, options3, createOptions3, supportsWorktreeConfiguration, token, folderUri, requestActivity);
    } finally {
      requestActivity.dispose();
      this._unlistedNewSessions.delete(session.resource);
    }
  }
  async createAndSendQuickChatRequest(options3, createOptions3, token = CancellationToken.None) {
    const { provider, sessionTypeId } = this._resolveProviderForQuickChat(createOptions3);
    const session = provider.createQuickChat(sessionTypeId);
    return this._configureAndSendNewSession(provider, session, options3, createOptions3, false, token);
  }
  async _configureAndSendNewSession(provider, session, options3, createOptions3, supportsWorktreeConfiguration, token, folderUri, requestActivity) {
    const inFlightRequest = this.trackInFlightNewSessionRequest(session);
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const requestOptionsPromise = (async () => {
        try {
          return isDeferredNewSessionRequestOptions(options3) ? await options3.resolve() : options3;
        } finally {
          requestActivity?.clear();
        }
      })();
      const configurationPromise = this._configureNewSession(provider, session, createOptions3, supportsWorktreeConfiguration, token, folderUri);
      const [resolvedOptions] = await raceCancellationError(Promise.all([requestOptionsPromise, configurationPromise]), token);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      return await raceCancellationError(this._sendNewChatRequestInBackground(provider, session, resolvedOptions, token), token);
    } catch (e4) {
      provider.deleteNewSession(session.sessionId);
      throw e4;
    } finally {
      inFlightRequest.dispose();
    }
  }
  async _configureNewSession(provider, session, createOptions3, supportsWorktreeConfiguration, token, folderUri) {
    if (createOptions3?.modelId) {
      const resolvedModelId = await this._waitForRequestedModel(provider, session, createOptions3.modelId, token, folderUri);
      provider.setModel(session.sessionId, session.mainChat.get().resource, resolvedModelId, "chosen" /* Chosen */);
    }
    if (createOptions3?.modeId) {
      provider.setMode?.(session.sessionId, createOptions3.modeId);
    }
    if (createOptions3?.permissionLevel) {
      provider.setPermissionLevel?.(session.sessionId, createOptions3.permissionLevel);
    }
    if (supportsWorktreeConfiguration && (createOptions3?.isolationMode || createOptions3?.worktreeBranchTrack !== void 0 || createOptions3?.worktreeCreateNewBranch !== void 0 || createOptions3?.branch)) {
      if (provider.setWorktreeConfiguration) {
        await raceCancellationError(provider.setWorktreeConfiguration(session.sessionId, {
          isolationMode: createOptions3.isolationMode,
          worktreeBranchTrack: createOptions3.worktreeBranchTrack,
          worktreeCreateNewBranch: createOptions3.worktreeCreateNewBranch,
          branch: createOptions3.branch
        }), token);
      } else {
        if (createOptions3.isolationMode && provider.setIsolationMode) {
          await raceCancellationError(provider.setIsolationMode(session.sessionId, createOptions3.isolationMode), token);
        }
        if (createOptions3.worktreeBranchTrack !== void 0 && provider.setWorktreeBranchTrack) {
          await raceCancellationError(provider.setWorktreeBranchTrack(session.sessionId, createOptions3.worktreeBranchTrack), token);
        }
        if (createOptions3.worktreeCreateNewBranch !== void 0 && provider.setWorktreeCreateNewBranch) {
          await raceCancellationError(provider.setWorktreeCreateNewBranch(session.sessionId, createOptions3.worktreeCreateNewBranch), token);
        }
        if (createOptions3.branch && provider.setBranch) {
          await raceCancellationError(provider.setBranch(session.sessionId, createOptions3.branch), token);
        }
      }
    }
  }
  async _waitForRequestedModel(provider, session, modelId, token, folderUri) {
    const resolveCurrent = () => provider.getModelsSnapshot(session.sessionId, modelId).desiredModelResolution;
    const initial = resolveCurrent();
    if (initial.kind === "available") {
      return initial.model.identifier;
    }
    if (initial.kind === "notRequested") {
      return modelId;
    }
    if (initial.kind === "unavailable") {
      throw new Error(`Model '${modelId}' is unavailable for sessions provider '${provider.id}'`);
    }
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    return new Promise((resolve3, reject) => {
      const disposables = new DisposableStore();
      let settled = false;
      const finish = (result) => {
        if (settled) {
          return;
        }
        settled = true;
        disposables.dispose();
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve3(result);
        }
      };
      const check = () => {
        const resolution = resolveCurrent();
        if (resolution.kind === "available") {
          finish(resolution.model.identifier);
        } else if (resolution.kind === "notRequested") {
          finish(modelId);
        } else if (resolution.kind === "unavailable") {
          finish(new Error(`Model '${modelId}' is unavailable for sessions provider '${provider.id}'`));
        }
      };
      disposables.add(provider.onDidChangeModels(check));
      disposables.add(provider.onDidChangeSessionTypes(() => {
        const sessionTypes = folderUri ? provider.getSessionTypes(folderUri) : provider.sessionTypes;
        if (!sessionTypes.some((type) => type.id === session.sessionType)) {
          finish(new Error(`Session type '${session.sessionType}' is no longer available for sessions provider '${provider.id}'`));
        }
      }));
      disposables.add(this.sessionsProvidersService.onDidChangeProviders((event) => {
        if (event.removed.includes(provider)) {
          finish(new Error(`Sessions provider '${provider.id}' is no longer available`));
        }
      }));
      disposables.add(token.onCancellationRequested(() => finish(new CancellationError())));
      disposables.add(this._disposeCts.token.onCancellationRequested(() => finish(new CancellationError())));
      check();
    });
  }
  dispose() {
    this._disposeCts.cancel();
    super.dispose();
  }
  async _prepareAndSendNewChatRequestInBackground(provider, session, options3) {
    let graduatingProvider = provider;
    let graduatingSession = session;
    try {
      ({ provider: graduatingProvider, session: graduatingSession } = await this._prepareNewSessionForSend(provider, session, void 0, false));
      await this._sendNewChatRequestInBackground(graduatingProvider, graduatingSession, options3);
    } catch (error) {
      graduatingProvider.deleteNewSession(graduatingSession.sessionId);
      throw error;
    }
  }
  /**
   * Commit a new-session request: fire {@link _onWillSendRequest}, create the
   * new chat via the provider, send the request, and—on success—fire
   * {@link _onDidStartSession} and {@link _onDidSendRequest}. The started
   * session is never swapped into the visible chat slot, so it simply appears
   * in the sessions list once the provider commits it.
   *
   * Owns the full will/did send lifecycle so callers do not fire the paired
   * events themselves. Errors are propagated to the caller; this method does
   * not clean up the stranded draft, so callers own any view handling and the
   * error handling (e.g. disposing the stranded draft via
   * {@link ISessionsProvider.deleteNewSession}).
   *
   * Providers are multi-new-session aware, so the graduating session and a
   * concurrently reseeded composer draft coexist without conflict.
   */
  async _sendNewChatRequestInBackground(provider, session, options3, token = CancellationToken.None) {
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    this._onWillSendRequest.fire(session);
    const chatPromise = provider.createNewChat(session.sessionId, options3.query);
    const chat = token === CancellationToken.None ? await chatPromise : await raceCancellationError(chatPromise, token);
    const sendOptions = this._augmentOptionsForTroubleshoot(session, options3);
    const chatResourceKey = chat.resource.toString();
    this._pendingSendChatResources.add(chatResourceKey);
    const cancellationListener = token.onCancellationRequested(() => {
      void this.chatService.cancelCurrentRequestForSession(chat.resource, "sessionsManagement").catch((error) => {
        this.logService.warn("[SessionsManagement] Failed to cancel headless request:", error);
      });
    });
    let updatedSession;
    try {
      updatedSession = await provider.sendRequest(session.sessionId, chat.resource, sendOptions);
    } finally {
      cancellationListener.dispose();
      this._pendingSendChatResources.delete(chatResourceKey);
    }
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (this._store.isDisposed) {
      return void 0;
    }
    this._onDidStartSession.fire(updatedSession);
    this._onDidSendRequest.fire({ session: updatedSession, chat, isNewSession: true, isNewChat: true, options: options3 });
    return updatedSession;
  }
  async sendRequest(session, chat, options3) {
    this.discardNewSession();
    const provider = this._getProvider(session);
    if (!provider) {
      throw new Error(`Sessions provider '${session.providerId}' not found`);
    }
    if (options3.background) {
      this._sendRequestInBackground(provider, session, chat, options3).catch((e4) => {
        this.logService.error("[SessionsManagement] Failed to send background request:", e4);
      });
      return;
    }
    this._onWillSendRequest.fire(session);
    const sendOptions = this._augmentOptionsForTroubleshoot(session, options3);
    const chatResourceKey = chat.resource.toString();
    this._pendingSendChatResources.add(chatResourceKey);
    let updatedSession;
    try {
      updatedSession = await provider.sendRequest(session.sessionId, chat.resource, sendOptions);
    } finally {
      this._pendingSendChatResources.delete(chatResourceKey);
    }
    if (updatedSession.sessionId !== session.sessionId) {
      this.logService.info(`[SessionsManagement] sendRequest: active session replaced: ${session.sessionId} -> ${updatedSession.sessionId}`);
    }
    this._onDidSendRequest.fire({ session: updatedSession, chat, isNewSession: false, isNewChat: true, options: options3 });
  }
  /**
   * Send a request for an existing chat in the background: commit the send via
   * the provider and—on success—fire {@link _onDidSendRequest}. Unlike the
   * foreground {@link sendRequest} path this does not fire
   * {@link _onWillSendRequest}, so the view's send-follow never navigates the
   * visible slot into the sent chat. Errors are propagated to the caller.
   */
  async _sendRequestInBackground(provider, session, chat, options3) {
    const sendOptions = this._augmentOptionsForTroubleshoot(session, options3);
    const chatResourceKey = chat.resource.toString();
    this._pendingSendChatResources.add(chatResourceKey);
    let updatedSession;
    try {
      updatedSession = await provider.sendRequest(session.sessionId, chat.resource, sendOptions);
    } finally {
      this._pendingSendChatResources.delete(chatResourceKey);
    }
    if (this._store.isDisposed) {
      return;
    }
    this._onDidSendRequest.fire({ session: updatedSession, chat, isNewSession: false, isNewChat: true, options: options3 });
  }
  // -- Session Actions --
  _getProvider(session) {
    return this.sessionsProvidersService.getProviders().find((p) => p.id === session.providerId);
  }
  async cancelCurrentRequest(session) {
    const resource = session.mainChat.get().resource;
    const modelRef = await this.chatService.acquireOrLoadSession(resource, "panel" /* Chat */, CancellationToken.None, "sessionsManagement:cancel");
    if (!modelRef) {
      throw new Error(localize(5631, null));
    }
    try {
      await this.chatService.cancelCurrentRequestForSession(resource, "sessionsManagement");
    } finally {
      modelRef.dispose();
    }
  }
  async archiveSession(session) {
    await this._getProvider(session)?.archiveSession(session.sessionId);
    this._onDidArchiveSession.fire(session);
  }
  async unarchiveSession(session) {
    await this._getProvider(session)?.unarchiveSession(session.sessionId);
    this._onDidUnarchiveSession.fire(session);
  }
  async setSessionReadState(session, isRead) {
    await this._getProvider(session)?.setSessionReadState(session.sessionId, isRead);
  }
  markRead(session) {
    return this.setSessionReadState(session, true);
  }
  markUnread(session) {
    return this.setSessionReadState(session, false);
  }
  async markAllRead(sessions) {
    await Promise.all(sessions.map((session) => this.setSessionReadState(session, true)));
  }
  async deleteSession(session) {
    await this._getProvider(session)?.deleteSession(session.sessionId);
    this._onDidDeleteSession.fire(session);
  }
  async deleteSessions(sessions) {
    const byProvider = /* @__PURE__ */ new Map();
    for (const session of sessions) {
      const provider = this._getProvider(session);
      if (!provider) {
        continue;
      }
      const group2 = byProvider.get(provider);
      if (group2) {
        group2.push(session);
      } else {
        byProvider.set(provider, [session]);
      }
    }
    let firstError;
    for (const [provider, providerSessions] of byProvider) {
      try {
        await provider.deleteSessions(providerSessions.map((session) => session.sessionId));
        for (const session of providerSessions) {
          this._onDidDeleteSession.fire(session);
        }
      } catch (error) {
        firstError ??= error;
      }
    }
    if (firstError !== void 0) {
      throw firstError;
    }
  }
  async deleteChat(session, chatUri, options3) {
    const deleted = await this._getProvider(session)?.deleteChat(session.sessionId, chatUri, options3);
    if (deleted) {
      this._onDidDeleteChat.fire(session);
    }
  }
  async renameChat(session, chatUri, title) {
    await this._getProvider(session)?.renameChat(session.sessionId, chatUri, title);
    this._onDidRenameChat.fire(session);
  }
  async renameSession(session, title) {
    await this._getProvider(session)?.renameSession(session.sessionId, title);
    this._onDidRenameSession.fire(session);
  }
};

SessionsManagementService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatWidgetHistoryService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IPathService),
  __decorateParam(7, IRemoteAgentHostService),
  __decorateParam(8, IWorkspaceTrustManagementService)
], SessionsManagementService);

function isDeferredNewSessionRequestOptions(options3) {
  return options3.kind === "deferred";
}

registerSingleton(ISessionsManagementService, SessionsManagementService, 0 /* Eager */);
export { isDeferredNewSessionRequestOptions, LAST_USED_QUICK_CHAT_SESSION_TYPE_STORAGE_KEY, SessionsManagementService };
