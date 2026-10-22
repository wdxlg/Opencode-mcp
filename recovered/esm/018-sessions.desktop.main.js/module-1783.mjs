// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionsService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { VisibleSessions } from "./module-1775.mjs";
import { ClosedItemHistory } from "./module-1772.mjs";
import { IsNewChatSessionContext } from "./module-1770.mjs";
import { SessionsRecencyHistory } from "./module-1774.mjs";
import { SessionsNavigation } from "./module-1773.mjs";
import { autorun } from "./module-0052.mjs";
import { setActiveSessionContextKeys } from "./module-1778.mjs";
import { URI } from "./module-0032.mjs";
import { ISessionsManagementService, inheritableSessionTarget } from "./module-1766.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { ensureSessionWorktreesTrusted } from "./module-1769.mjs";
import { localize } from "./module-0001.mjs";
import { disposableTimeout, raceTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ICustomViewService } from "./module-1776.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { ISessionChangesStatsCache } from "./module-1777.mjs";
import { ISessionOpenTelemetryService } from "./module-1782.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionsService.ts
var ACTIVE_SESSION_STATES_KEY = "agentSessions.activeSessionStates";

var RESTORE_RESOLVE_BUDGET_MS = 1e4;

var RESTORE_SESSION_WAIT_TIMEOUT = 3e4;

var MAX_RECENTLY_OPENED_SESSIONS = 10;

var ISessionsService = createDecorator("sessionsService");

var SessionsService = class extends Disposable {
  constructor(storageService, logService, uriIdentityService, contextKeyService, sessionsManagementService, sessionsProvidersService, sessionsPartService, customViewService, instantiationService, workspaceTrustRequestService, workspaceTrustManagementService, changesStatsCache, sessionOpenTelemetryService) {
    super();
    this.storageService = storageService;
    this.logService = logService;
    this.uriIdentityService = uriIdentityService;
    this.contextKeyService = contextKeyService;
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.sessionsPartService = sessionsPartService;
    this.customViewService = customViewService;
    this.instantiationService = instantiationService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.changesStatsCache = changesStatsCache;
    this.sessionOpenTelemetryService = sessionOpenTelemetryService;
    this._onDidToggleSessionStickiness = this._register(new Emitter());
    this.onDidToggleSessionStickiness = this._onDidToggleSessionStickiness.event;
    this._initialRestoreComplete = observableValue(this, false);
    this.initialRestoreComplete = this._initialRestoreComplete;
    /** Cancelled on every navigation action so in-flight async opens bail out. */
    this._openSessionCts = this._register(new MutableDisposable());
    /**
     * Cancellation for the in-flight {@link restoreVisibleSessions}. Kept
     * separate from {@link _openSessionCts} so that additive new-session
     * operations (the new-chat composer eagerly creating a draft on startup)
     * do not abort restoring the previously visible grid. Only an explicit
     * navigation to a specific session cancels a restore.
     */
    this._restoreCts = this._register(new MutableDisposable());
    this._pendingRestoredChatResources = new ResourceMap();
    /** The in-flight foreground send's "keep newest chat active" follow. */
    this._sendFollow = this._register(new MutableDisposable());
    this._sessionStates = this._loadSessionStates();
    this._visibility = this._register(this.instantiationService.createInstance(
      VisibleSessions,
      (session) => this._restoreInitialChat(session),
      (session) => this._restoreClosedChats(session),
      (replaced, index2, sticky, replacedBySessionId) => this._closedItems.recordReplacedSlot(replaced, index2, sticky, replacedBySessionId)
    ));
    this.visibleSessions = this._visibility.visibleSessions;
    this.activeSession = this._visibility.activeSession;
    this._closedItems = this._register(this.instantiationService.createInstance(
      ClosedItemHistory,
      this._visibility,
      (session, chatResource) => this.openChat(session, chatResource)
    ));
    this._isNewChatSessionContext = IsNewChatSessionContext.bindTo(this.contextKeyService);
    this._register(this.storageService.onWillSaveState(() => this._saveSessionStates()));
    this._recencyHistory = this._register(new SessionsRecencyHistory(
      this.storageService,
      this.logService
    ));
    this._navigation = this._register(new SessionsNavigation(
      this,
      this.activeSession,
      this.sessionsManagementService,
      this._recencyHistory,
      this.contextKeyService,
      this.logService
    ));
    this._register(this.sessionsManagementService.onDidChangeSessions((e4) => this._navigation.onDidRemoveSessions(e4)));
    this._register(this.sessionsManagementService.onDidDeleteSession((session) => this._recencyHistory.remove((entry) => entry.sessionResource.toString() === session.resource.toString())));
    this._register(autorun((reader) => {
      const activeSession = this.activeSession.read(reader);
      const newSession = this.sessionsManagementService.newSession.read(reader);
      this._isNewChatSessionContext.set(activeSession === void 0 || activeSession.sessionId === newSession?.sessionId);
      setActiveSessionContextKeys(activeSession, this.contextKeyService, reader, this.changesStatsCache);
    }));
    this._register(autorun((reader) => {
      const activeSession = this.activeSession.read(reader);
      if (activeSession) {
        reader.store.add(this._activeSessionViewListeners(activeSession));
      }
    }));
    this._register(autorun((reader) => {
      const activeSession = this.activeSession.read(reader);
      if (activeSession && !activeSession.isRead.read(reader)) {
        this.sessionsManagementService.markRead(activeSession);
      }
    }));
    this._register(this.sessionsManagementService.onDidChangeSessions((e4) => this._onDidChangeSessions(e4)));
    this._register(this.sessionsManagementService.onDidReplaceSession(({ from, to }) => this._onDidReplaceSession(from, to)));
    this._register(this.sessionsManagementService.onDidReplaceNewDraftSession(({ from, to }) => this._onDidReplaceSession(from, to)));
    this._register(this.sessionsManagementService.onWillSendRequest((session) => this._startSendFollow(session)));
    this._register(this.sessionsManagementService.onDidSendRequest(() => this._sendFollow.clear()));
    this._register(autorun((reader) => {
      const visible = this.visibleSessions.read(reader);
      const active = this._visibility.activeSession.read(reader);
      const preserveFocus = this._visibility.activePreserveFocus.read(reader);
      this.sessionsPartService.updateVisibleSessions(visible, active);
      const activeId = active?.sessionId;
      if (activeId !== this._focusedActiveSessionId) {
        this._focusedActiveSessionId = activeId;
        if (!preserveFocus) {
          this.sessionsPartService.focusSession(active);
        }
      }
    }));
    this._register(this.sessionsPartService.onDidFocusSession((sessionId) => {
      const session = this.visibleSessions.get().find((s) => s?.sessionId === sessionId);
      if (session) {
        this.setActive(session);
      }
    }));
  }
  _onDidReplaceSession(from, to) {
    this._visibility.updateSession(from, to);
  }
  _activeSessionViewListeners(activeSession) {
    const disposables = new DisposableStore();
    const initialChatResource = activeSession.activeChat.get()?.resource;
    let pendingRestoredChatResource;
    this._pendingRestoredChatResources.delete(activeSession.resource);
    const storedActiveChatResource = this._sessionStates.get(activeSession.resource)?.activeChatResource;
    if (storedActiveChatResource) {
      try {
        const resource = URI.parse(storedActiveChatResource);
        if (!initialChatResource || !this.uriIdentityService.extUri.isEqual(resource, initialChatResource)) {
          pendingRestoredChatResource = resource;
          this._pendingRestoredChatResources.set(activeSession.resource, resource);
        }
      } catch (error) {
        this.logService.warn("[SessionsView] Failed to restore active chat from stored session state", error);
      }
    }
    let wasArchived = activeSession.isArchived.get();
    disposables.add(autorun((reader) => {
      const isArchived = activeSession.isArchived.read(reader);
      if (isArchived && !wasArchived) {
        if (activeSession.isQuickChat?.read(void 0)) {
          this.openQuickChat();
        } else {
          const folderUri = activeSession.workspace.read(void 0)?.folders[0]?.root;
          this.openNewSession(folderUri ? { folderUri, ...inheritableSessionTarget(this.sessionsManagementService, activeSession, folderUri) } : void 0);
        }
      }
      wasArchived = isArchived;
    }));
    if (activeSession.status.get() !== 0 /* Untitled */) {
      disposables.add(autorun((reader) => {
        const chats = activeSession.chats.read(reader);
        const activeChat = activeSession.activeChat.read(reader);
        if (activeChat && !chats.some((c) => this.uriIdentityService.extUri.isEqual(c.resource, activeChat.resource))) {
          const visible = chats.filter((c) => c.interactivity.read(reader) !== "hidden" /* Hidden */);
          const fallback2 = visible[visible.length - 1] ?? activeSession.mainChat.read(reader);
          if (fallback2) {
            this.openChat(activeSession, fallback2.resource);
          }
        }
      }));
    }
    if (pendingRestoredChatResource) {
      disposables.add(autorun((reader) => {
        const resource = pendingRestoredChatResource;
        if (!resource) {
          return;
        }
        const chat = activeSession.chats.read(reader).find((candidate) => this.uriIdentityService.extUri.isEqual(candidate.resource, resource));
        if (chat) {
          pendingRestoredChatResource = void 0;
          this._pendingRestoredChatResources.delete(activeSession.resource);
          this._visibility.openChat(activeSession, chat);
          this._visibility.setActiveChat(activeSession, chat);
        }
      }));
    }
    disposables.add(autorun((reader) => {
      const chat = activeSession.activeChat.read(reader);
      if (chat && chat.status.read(void 0) !== 0 /* Untitled */) {
        if (pendingRestoredChatResource && initialChatResource && this.uriIdentityService.extUri.isEqual(chat.resource, initialChatResource)) {
          return;
        }
        pendingRestoredChatResource = void 0;
        this._pendingRestoredChatResources.delete(activeSession.resource);
        const existing = this._sessionStates.get(activeSession.resource);
        this._sessionStates.set(activeSession.resource, {
          ...existing,
          sessionResource: activeSession.resource.toString(),
          activeChatResource: chat.resource.toString()
        });
      }
    }));
    return disposables;
  }
  _onDidChangeSessions(e4) {
    const currentActive = this._visibility.activeSession.get();
    if (e4.removed.length) {
      for (const session of e4.removed) {
        this._sessionStates.delete(session.resource);
      }
      this._visibility.removeMany(e4.removed.map((r2) => r2.sessionId));
    }
    if (!currentActive) {
      return;
    }
    if (e4.removed.length && e4.removed.some((r2) => r2.sessionId === currentActive.sessionId)) {
      const fallback2 = this._visibility.activeSession.get();
      if (fallback2 && this.sessionsManagementService.getSession(fallback2.resource)) {
        this.openSession(fallback2.resource, { source: "fallback" });
      } else {
        this.openNewSession();
      }
    }
  }
  _startSendFollow(session) {
    const store = new DisposableStore();
    let followId = session.sessionId;
    store.add(this.sessionsManagementService.onDidReplaceSession(({ from, to }) => {
      if (from.sessionId === followId) {
        followId = to.sessionId;
      }
    }));
    store.add(autorun((reader) => {
      const active = this._visibility.activeSession.read(reader);
      if (active && active.sessionId === followId) {
        const chats = active.visibleChatTabs.read(reader);
        const lastChat = chats[chats.length - 1];
        if (lastChat) {
          this._visibility.setActiveChat(active, lastChat);
        }
      }
    }));
    this._sendFollow.value = store;
  }
  getRecentlyOpenedSessions() {
    const seen = /* @__PURE__ */ new Set();
    const recent = [];
    for (const entry of this._recencyHistory.entries) {
      if (recent.length >= MAX_RECENTLY_OPENED_SESSIONS) {
        break;
      }
      const key3 = entry.sessionResource.toString();
      if (seen.has(key3)) {
        continue;
      }
      seen.add(key3);
      const session = this.sessionsManagementService.getSession(entry.sessionResource);
      if (session) {
        recent.push(session);
      }
    }
    const other = this.sessionsManagementService.getSessions().filter((s) => !seen.has(s.resource.toString())).sort((a, b) => b.updatedAt.get().getTime() - a.updatedAt.get().getTime());
    return { recent, other };
  }
  /**
   * Cancel any in-flight open-session/restore and return a fresh cancellation token.
   */
  _startOpenSession() {
    this.customViewService.hideCustomView();
    this._openSessionCts.value?.cancel();
    const cts = new CancellationTokenSource();
    this._openSessionCts.value = cts;
    return cts.token;
  }
  /**
   * Cancel an in-flight {@link restoreVisibleSessions}. Called when the user
   * explicitly navigates to a specific session, so restore stops fighting
   * the user's choice. Additive new-session operations do NOT call this.
   */
  _cancelRestore() {
    this._restoreCts.value?.cancel();
    this._restoreCts.clear();
  }
  /**
   * Make the given session active in the visibility model, optionally without
   * moving focus into it. The preserve-focus intent is published atomically
   * with the active session by the visibility model, and the model's
   * canonical active session is updated reactively by the mirror autorun.
   */
  _activate(session, preserveFocus) {
    return this._visibility.setActive(session, preserveFocus);
  }
  async openChat(session, chatUri, options3) {
    const t0 = Date.now();
    this._cancelRestore();
    const token = this._startOpenSession();
    const resolved = await this._resolveSessionForOpen(session, chatUri);
    if (token.isCancellationRequested) {
      return;
    }
    session = resolved.session;
    chatUri = resolved.chatUri ?? chatUri;
    if (options3?.source) {
      await this.sessionOpenTelemetryService.withOpenRequest(options3.source, token, (telemetryAttempt) => this._openChat(session, chatUri, options3.preserveFocus, token, t0, telemetryAttempt));
      return;
    }
    await this._openChat(session, chatUri, options3?.preserveFocus, token, t0);
  }
  async _openChat(session, chatUri, preserveFocus, token, startTime, telemetryAttempt) {
    if (telemetryAttempt) {
      this.sessionOpenTelemetryService.sessionResolved(
        telemetryAttempt,
        session.resource,
        session.providerId,
        this.activeSession.get()?.sessionId === session.sessionId,
        session.loading.get()
      );
      this.sessionOpenTelemetryService.sessionActivated(telemetryAttempt, chatUri);
    }
    this.logService.trace(`[SessionsView] openChat start uri=${chatUri.toString()} provider=${session.providerId}`);
    this._activate(session, preserveFocus);
    if (!await this._waitForSessionToLoad(session, token)) {
      this.logService.trace(`[SessionsView] openChat cancelled while waiting for session to load uri=${chatUri.toString()}`);
      return;
    }
    let chat;
    const activeSession = this._visibility.activeSession.get();
    if (activeSession) {
      chat = activeSession.chats.get().find((c) => this.uriIdentityService.extUri.isEqual(c.resource, chatUri));
      if (chat) {
        this._visibility.openChat(session, chat);
        this._visibility.setActiveChat(session, chat);
        this._setChatClosedState(session, chat, false);
      }
    }
    if (telemetryAttempt) {
      if (chat) {
        this.sessionOpenTelemetryService.sessionActivated(telemetryAttempt, chat.resource);
      }
      this.sessionOpenTelemetryService.sessionLoaded(telemetryAttempt);
    }
    if (chat && chat.status.get() === 0 /* Untitled */) {
      this.logService.trace(`[SessionsView] openChat done total=${Date.now() - startTime}ms uri=${chatUri.toString()} path=untitled`);
      return;
    }
    this.logService.trace(`[SessionsView] openChat done total=${Date.now() - startTime}ms uri=${chatUri.toString()}`);
  }
  async closeChat(session, chat, options3) {
    this._visibility.closeChat(session, chat);
    this._setChatClosedState(session, chat, true);
    if (!options3?.skipHistory) {
      this._closedItems.recordClosedChat(session, chat.resource);
    }
  }
  reopenLastClosedItem() {
    return this._closedItems.reopenLast();
  }
  /**
   * Persist a chat's closed/open state into the session's stored view state so
   * it survives switching the session out of the grid (which disposes its
   * wrapper) and reloads. Done synchronously on the close/open action rather
   * than reactively from `closedChats`, which would depend on the session's
   * chats being loaded. The main chat can never be closed and is ignored.
   */
  _setChatClosedState(session, chat, closed) {
    if (this.uriIdentityService.extUri.isEqual(chat.resource, session.mainChat.get().resource)) {
      return;
    }
    if (chat.origin?.kind === "tool" /* Tool */) {
      return;
    }
    const existing = this._sessionStates.get(session.resource);
    const closedSet = new Set(existing?.closedChatResources ?? []);
    const chatResource = chat.resource.toString();
    if (closed) {
      closedSet.add(chatResource);
    } else if (!closedSet.delete(chatResource)) {
      return;
    }
    this._sessionStates.set(session.resource, {
      ...existing,
      sessionResource: session.resource.toString(),
      closedChatResources: [...closedSet]
    });
  }
  async openSession(sessionResource, options3) {
    this.logService.trace(`[SessionsView] openSession requested uri=${sessionResource.toString()}`);
    this._cancelRestore();
    const token = this._startOpenSession();
    await this.sessionOpenTelemetryService.withOpenRequest(options3?.source ?? "unknown", token, async (telemetryAttempt) => {
      const resolved = await this.sessionsManagementService.resolveSessionResource(sessionResource, "open");
      if (token.isCancellationRequested) {
        return;
      }
      const sessionData = this._getSession(resolved);
      this.sessionOpenTelemetryService.sessionResolved(
        telemetryAttempt,
        sessionData.resource,
        sessionData.providerId,
        this.activeSession.get()?.sessionId === sessionData.sessionId,
        sessionData.loading.get()
      );
      this._showSession(sessionData, options3);
      await this._waitForOpenSessionToLoad(sessionData, token, telemetryAttempt);
    });
  }
  showSession(sessionResource, options3) {
    this._cancelRestore();
    this._startOpenSession();
    this._showSession(this._getSession(sessionResource), options3);
  }
  async canOpenSession(session) {
    if (this.activeSession.get()?.sessionId === session.sessionId) {
      return true;
    }
    const workspace = session.workspace.get();
    if (!workspace?.requiresWorkspaceTrust) {
      return true;
    }
    await ensureSessionWorktreesTrusted(workspace, this.workspaceTrustManagementService);
    const folders = workspace.folders.map((folder) => folder.workingDirectory);
    const trustInfos = await Promise.all(folders.map((folder) => this.workspaceTrustManagementService.getUriTrustInfo(folder)));
    const untrustedFolders = folders.filter((_, index2) => !trustInfos[index2].trusted);
    for (const folder of untrustedFolders) {
      const trusted = await this.workspaceTrustRequestService.requestResourcesTrust({
        uri: folder,
        message: localize(5632, null)
      });
      if (!trusted) {
        return false;
      }
    }
    return true;
  }
  async openSessionToSide(session, options3) {
    const token = this._startOpenSession();
    const resolved = await this._resolveSessionForOpen(session, options3?.chatResource);
    if (token.isCancellationRequested) {
      return;
    }
    session = resolved.session;
    if (options3?.chatResource && resolved.chatUri) {
      options3 = { ...options3, chatResource: resolved.chatUri };
    }
    const visible = this.visibleSessions.get();
    const lastVisible = visible[visible.length - 1];
    if (lastVisible && lastVisible.sessionId !== session.sessionId) {
      this.insertAt(session, lastVisible.sessionId, "right");
    }
    if (options3?.chatResource) {
      await this.openChat(session, options3.chatResource, { preserveFocus: options3.preserveFocus, source: options3.source });
    } else {
      await this.openSession(session.resource, { preserveFocus: options3?.preserveFocus, source: options3?.source });
    }
  }
  /**
   * Opens a chat to the side of its session view, redirecting a superseded
   * resource first so a migrating session opens its adopted twin to the side
   * rather than the old facade. Provider-neutral: the redirect is the
   * `resolveSessionResource` hook, not a scheme check.
   */
  async openChatToSide(session, chatResource, options3) {
    const token = this._startOpenSession();
    const resolved = await this._resolveSessionForOpen(session, chatResource);
    if (token.isCancellationRequested) {
      return;
    }
    session = resolved.session;
    chatResource = resolved.chatUri ?? chatResource;
    this._showSession(this._getSession(session.resource), options3);
    const sessionView = this.sessionsPartService.getSessionView(session.sessionId);
    if (!sessionView) {
      throw new Error(`Unable to open chat to the side because session view '${session.sessionId}' is not mounted`);
    }
    await sessionView.openChatToSide(chatResource);
  }
  /**
   * Redirects a superseded session to its authoritative facade before it is
   * shown (mirrors `openSession`'s URI resolution). Provider-neutral: it asks
   * `resolveSessionResource`, which declines unfamiliar resources, rather than
   * inspecting the provider's URI scheme. Returns the redirected session (and
   * its main chat) when it changes, otherwise the inputs unchanged.
   */
  async _resolveSessionForOpen(session, chatUri) {
    const resolved = await this.sessionsManagementService.resolveSessionResource(session.resource, "open");
    if (this.uriIdentityService.extUri.isEqual(resolved, session.resource)) {
      return { session, chatUri };
    }
    const superseding = this.sessionsManagementService.getSession(resolved);
    if (!superseding) {
      return { session, chatUri };
    }
    return { session: superseding, chatUri: chatUri ? superseding.mainChat.get().resource : void 0 };
  }
  _getSession(sessionResource) {
    const sessionData = this.sessionsManagementService.getSession(sessionResource);
    if (!sessionData) {
      this.logService.warn(`[SessionsView] openSession: session not found uri=${sessionResource.toString()}`);
      throw new Error(`Session with resource ${sessionResource.toString()} not found`);
    }
    return sessionData;
  }
  _showSession(sessionData, options3) {
    const t0 = Date.now();
    this.logService.trace(`[SessionsView] openSession start uri=${sessionData.resource.toString()} provider=${sessionData.providerId}`);
    this._activate(sessionData, options3?.preserveFocus);
    this.logService.trace(`[SessionsView] showSession done total=${Date.now() - t0}ms uri=${sessionData.resource.toString()}`);
  }
  async _waitForOpenSessionToLoad(sessionData, token, telemetryAttempt) {
    const t0 = Date.now();
    if (!await this._waitForSessionToLoad(sessionData, token)) {
      this.logService.trace(`[SessionsView] openSession cancelled while waiting for session to load uri=${sessionData.resource.toString()}`);
      return;
    }
    const activeSession = this.activeSession.get();
    const activeChat = activeSession?.sessionId === sessionData.sessionId ? activeSession.activeChat.get() : void 0;
    if (activeChat) {
      this.sessionOpenTelemetryService.sessionActivated(telemetryAttempt, activeChat.resource);
    }
    this.sessionOpenTelemetryService.sessionLoaded(telemetryAttempt);
    this.logService.trace(`[SessionsView] openSession loaded total=${Date.now() - t0}ms uri=${sessionData.resource.toString()}`);
  }
  unsetNewSession() {
    this.sessionsManagementService.discardNewSession();
    this._activate(void 0);
  }
  async openNewSession(options3, token = CancellationToken.None) {
    const folderUri = options3?.folderUri;
    if (folderUri) {
      const resolved = this.sessionsManagementService.resolveWorkspace(folderUri, options3?.providerId);
      if (resolved?.workspace.requiresWorkspaceTrust) {
        const trusted = await this.workspaceTrustRequestService.requestResourcesTrust({
          uri: folderUri,
          message: localize(5632, null)
        });
        if (token.isCancellationRequested) {
          return { session: void 0, trustDeclined: false };
        }
        if (!trusted) {
          return { session: void 0, trustDeclined: true };
        }
      }
      if (token.isCancellationRequested) {
        return { session: void 0, trustDeclined: false };
      }
      this._startOpenSession();
      try {
        const session = this.sessionsManagementService.createNewSession(folderUri, options3);
        this._activate(session);
        return { session, trustDeclined: false };
      } catch (e4) {
        this.logService.trace(`[SessionsView] openNewSession: createNewSession failed for folder ${folderUri.toString()}, falling back to composer view`);
      }
    }
    if (this._visibility.activeSession.get() === void 0) {
      return { session: void 0, trustDeclined: false };
    }
    if (!folderUri) {
      this._startOpenSession();
    }
    const newSession = this.sessionsManagementService.newSession.get();
    if (newSession?.isQuickChat?.get()) {
      this.sessionsManagementService.discardNewSession(newSession);
      this._activate(void 0);
      return { session: void 0, trustDeclined: false };
    }
    this._activate(newSession ?? void 0);
    return { session: newSession ?? void 0, trustDeclined: false };
  }
  openQuickChat(options3) {
    this._startOpenSession();
    try {
      const session = this.sessionsManagementService.createQuickChat(options3);
      return this._activate(session);
    } catch (e4) {
      this.logService.trace(`[SessionsView] openQuickChat: createQuickChat failed: ${e4}`);
      return void 0;
    }
  }
  async openNewChatInSession(session, options3) {
    this._cancelRestore();
    this._startOpenSession();
    const chat = await this.sessionsManagementService.createNewChatInSession(session, options3);
    if (!chat) {
      return;
    }
    this._activate(session);
    this._visibility.setActiveChat(session, chat);
  }
  setActive(session) {
    this._activate(session);
  }
  async submitNewSessionInput() {
    let activeSession = this.activeSession.get();
    if (activeSession?.isCreated.get()) {
      return false;
    }
    if (!this.sessionsPartService.getSessionView(activeSession?.sessionId)) {
      await this.openNewSession();
      activeSession = this.activeSession.get();
      if (activeSession?.isCreated.get()) {
        return false;
      }
    }
    return this.sessionsPartService.getSessionView(activeSession?.sessionId)?.submitInput() ?? false;
  }
  toggleSessionStickiness(session) {
    const sticky = this._visibility.toggleStickiness(session);
    this._onDidToggleSessionStickiness.fire({ session, sticky });
  }
  insertAt(session, targetSessionId, side, activate = true) {
    this._visibility.insertAt(session, targetSessionId, side, activate);
  }
  closeSession(session) {
    const sessionId = session?.sessionId;
    const visible = this._visibility.visibleSessions.get();
    if (!visible.some((s) => s?.sessionId === sessionId)) {
      return;
    }
    const activeSessionId = this._visibility.activeSession.get()?.sessionId;
    const wasActive = activeSessionId === sessionId;
    if (session) {
      this._closedItems.recordClosedSession(session);
    }
    this.sessionsManagementService.discardNewSession(session);
    this._visibility.removeMany([sessionId]);
    if (!wasActive) {
      return;
    }
    const fallback2 = this._visibility.activeSession.get();
    if (fallback2 === void 0) {
      this.openNewSession();
    }
  }
  closeAllSessions() {
    const ids = this._visibility.visibleSessions.get().filter((s) => !!s).map((s) => s.sessionId);
    if (ids.length === 0) {
      return;
    }
    this.sessionsManagementService.discardNewSession();
    this._visibility.removeMany(ids);
  }
  _restoreInitialChat(session) {
    const chats = session.chats.get();
    let initialChat = chats[0];
    const sessionState = this._sessionStates.get(session.resource);
    if (sessionState?.activeChatResource) {
      try {
        const lastChatResource = URI.parse(sessionState.activeChatResource);
        const found = chats.find((c) => this.uriIdentityService.extUri.isEqual(c.resource, lastChatResource));
        if (found) {
          initialChat = found;
        }
      } catch (error) {
        this.logService.warn("[SessionsView] Failed to restore active chat from stored session state", error);
      }
    }
    return initialChat;
  }
  /**
   * The resource strings of chats that were closed (hidden from the tab strip)
   * when the session was last saved, so they stay hidden across reloads. Stale
   * URIs that no longer match a chat are harmless: the visible session
   * intersects them with the live chat list.
   */
  _restoreClosedChats(session) {
    return this._sessionStates.get(session.resource)?.closedChatResources ?? [];
  }
  async _waitForSessionToLoad(session, token) {
    if (!session.loading.get()) {
      return true;
    }
    if (token.isCancellationRequested) {
      return false;
    }
    await new Promise((resolve3) => {
      const disposables = new DisposableStore();
      let resolved = false;
      const finish = () => {
        if (resolved) {
          return;
        }
        resolved = true;
        disposables.dispose();
        resolve3();
      };
      disposables.add(token.onCancellationRequested(finish));
      disposables.add(autorun((reader) => {
        if (!session.loading.read(reader)) {
          finish();
        }
      }));
    });
    return !token.isCancellationRequested;
  }
  _loadSessionStates() {
    const map = new ResourceMap();
    const raw = this.storageService.get(ACTIVE_SESSION_STATES_KEY, 1 /* WORKSPACE */);
    if (!raw) {
      return map;
    }
    try {
      const entries2 = JSON.parse(raw);
      for (const entry of entries2) {
        const uri4 = URI.parse(entry.sessionResource);
        map.set(uri4, entry);
      }
    } catch {
    }
    return map;
  }
  _saveSessionStates() {
    const entries2 = this._snapshotVisibleSessionStates();
    const visible = new ResourceMap();
    for (const entry of entries2) {
      visible.set(URI.parse(entry.sessionResource), true);
    }
    for (const [resource, state] of this._sessionStates) {
      if (visible.has(resource)) {
        continue;
      }
      entries2.push({
        sessionResource: state.sessionResource,
        activeChatResource: state.activeChatResource,
        closedChatResources: state.closedChatResources
      });
    }
    this.storageService.store(ACTIVE_SESSION_STATES_KEY, JSON.stringify(entries2), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  _snapshotVisibleSessionStates() {
    const activeId = this._visibility.activeSession.get()?.sessionId;
    const visible = this._visibility.visibleSessions.get();
    const entries2 = [];
    visible.forEach((session, index2) => {
      if (!session) {
        return;
      }
      if (session.status.get() === 0 /* Untitled */) {
        this._sessionStates.delete(session.resource);
        return;
      }
      const existing = this._sessionStates.get(session.resource);
      const state = {
        sessionResource: session.resource.toString(),
        activeChatResource: this._pendingRestoredChatResources.get(session.resource)?.toString() ?? session.activeChat.get()?.resource.toString() ?? existing?.activeChatResource,
        closedChatResources: existing?.closedChatResources ?? session.closedChats.get().map((c) => c.resource.toString()),
        visibleOrder: index2,
        isSticky: session.sticky.get(),
        isActive: session.sessionId === activeId
      };
      this._sessionStates.set(session.resource, state);
      entries2.push(state);
    });
    return entries2;
  }
  /**
   * The persisted visible sessions, ordered left-to-right by their stored
   * grid position.
   */
  _getVisibleSessionStates() {
    const states = [];
    for (const [, state] of this._sessionStates) {
      if (state.visibleOrder !== void 0) {
        states.push(state);
      }
    }
    return states.sort((a, b) => a.visibleOrder - b.visibleOrder);
  }
  /**
   * Wait for the session with the given resource to become available via its
   * provider, resolving with the session or `undefined` if the token is
   * cancelled before it appears. When `timeout` is given, resolves with
   * `undefined` after that many milliseconds so a persisted session that never
   * resurfaces (e.g. deleted while the window was closed) cannot keep restore
   * pending — and its provider listeners alive — indefinitely.
   */
  _waitForSession(sessionResource, token, timeout2) {
    const existing = this.sessionsManagementService.getSession(sessionResource);
    if (existing) {
      return Promise.resolve(existing);
    }
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      let resolved = false;
      const finish = (session) => {
        if (resolved) {
          return;
        }
        resolved = true;
        disposables.dispose();
        resolve3(session);
      };
      disposables.add(token.onCancellationRequested(() => finish(void 0)));
      const tryFind = () => {
        if (token.isCancellationRequested) {
          finish(void 0);
          return;
        }
        const session = this.sessionsManagementService.getSession(sessionResource);
        if (session) {
          finish(session);
        }
      };
      disposables.add(this.sessionsProvidersService.onDidChangeProviders(() => tryFind()));
      disposables.add(this.sessionsManagementService.onDidChangeSessions(() => tryFind()));
      if (timeout2 !== void 0) {
        disposables.add(disposableTimeout(() => finish(void 0), timeout2));
      }
      tryFind();
    });
  }
  async restoreVisibleSessions() {
    try {
      await this._restoreVisibleSessions();
    } finally {
      this._initialRestoreComplete.set(true, void 0);
    }
  }
  async _restoreVisibleSessions() {
    const cts = new CancellationTokenSource();
    this._restoreCts.value = cts;
    const token = cts.token;
    const persisted = this._getVisibleSessionStates();
    const unresolved = persisted.map((state) => ({
      resource: URI.parse(state.sessionResource),
      isSticky: !!state.isSticky,
      isActive: !!state.isActive,
      order: state.visibleOrder
    }));
    const targets = await raceTimeout(Promise.all(persisted.map(async (state, index2) => ({
      // Persisted state names a session by URI, so a legacy Copilot CLI slot
      // restores through the old provider unless it is redirected here.
      resource: await this.sessionsManagementService.resolveSessionResource(URI.parse(state.sessionResource), "restore"),
      isSticky: unresolved[index2].isSticky,
      isActive: unresolved[index2].isActive,
      order: unresolved[index2].order
    }))), RESTORE_RESOLVE_BUDGET_MS) ?? unresolved;
    if (token.isCancellationRequested) {
      return;
    }
    if (targets.length === 0) {
      targets.push({ resource: void 0, isSticky: false, isActive: true, order: 1 });
    }
    targets.sort((a, b) => a.order - b.order);
    let activeIdx = targets.findIndex((t2) => t2.isActive);
    if (activeIdx < 0) {
      activeIdx = 0;
    }
    const resolved = new Array(targets.length).fill(void 0);
    const place = (idx, session) => {
      let anchor;
      for (let j = idx - 1; j >= 0 && !anchor; j--) {
        const neighbour = resolved[j];
        if (neighbour !== void 0) {
          anchor = { id: neighbour?.sessionId, side: "right" };
        }
      }
      for (let j = idx + 1; j < targets.length && !anchor; j++) {
        const neighbour = resolved[j];
        if (neighbour !== void 0) {
          anchor = { id: neighbour?.sessionId, side: "left" };
        }
      }
      resolved[idx] = session;
      if (anchor) {
        this._visibility.insertAt(session, anchor.id, anchor.side, false);
      } else {
        this._activate(session);
      }
      if (targets[idx].isSticky) {
        this._visibility.toggleStickiness(session);
      }
    };
    const activeTarget = targets[activeIdx];
    const activeSessionPromise = activeTarget.resource ? this._waitForSession(activeTarget.resource, token, RESTORE_SESSION_WAIT_TIMEOUT).then((session) => session ?? void 0) : Promise.resolve(void 0);
    const activeSession = await activeSessionPromise;
    if (token.isCancellationRequested) {
      return;
    }
    const slots = [];
    let activeSlotIndex = -1;
    for (let idx = 0; idx < targets.length; idx++) {
      const target = targets[idx];
      let session;
      if (!target.resource) {
        session = null;
      } else if (idx === activeIdx) {
        session = activeSession;
      } else {
        session = this.sessionsManagementService.getSession(target.resource);
      }
      if (session === void 0) {
        continue;
      }
      resolved[idx] = session;
      if (idx === activeIdx) {
        activeSlotIndex = slots.length;
      }
      slots.push({ session: session ?? void 0, sticky: target.isSticky });
    }
    this._visibility.restoreGrid(slots, activeSlotIndex);
    if (token.isCancellationRequested) {
      return;
    }
    await Promise.all(targets.map(async (target, idx) => {
      if (idx === activeIdx || !target.resource || token.isCancellationRequested || resolved[idx] !== void 0) {
        return;
      }
      const session = await this._waitForSession(target.resource, token, RESTORE_SESSION_WAIT_TIMEOUT);
      if (!session || token.isCancellationRequested || resolved[idx] !== void 0) {
        return;
      }
      place(idx, session);
    }));
  }
  // -- Session Navigation --
  async openPreviousSession() {
    await this._navigation.goBack();
  }
  async openNextSession() {
    await this._navigation.goForward();
  }
};

SessionsService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ISessionsManagementService),
  __decorateParam(5, ISessionsProvidersService),
  __decorateParam(6, ISessionsPartService),
  __decorateParam(7, ICustomViewService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IWorkspaceTrustRequestService),
  __decorateParam(10, IWorkspaceTrustManagementService),
  __decorateParam(11, ISessionChangesStatsCache),
  __decorateParam(12, ISessionOpenTelemetryService)
], SessionsService);

registerSingleton(ISessionsService, SessionsService, 0 /* Eager */);
export { ACTIVE_SESSION_STATES_KEY, RESTORE_RESOLVE_BUDGET_MS, RESTORE_SESSION_WAIT_TIMEOUT, MAX_RECENTLY_OPENED_SESSIONS, ISessionsService, SessionsService };
