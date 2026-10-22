// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackService.ts
import { URI } from "./module-0032.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { AnnotationsAgentFeedbackItemsBackend, InMemoryAgentFeedbackItemsBackend } from "./module-3588.mjs";
import { derived } from "./module-0054.mjs";
import { runOnChange } from "./module-0064.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { changeMatchesResource, getActiveResourceCandidates } from "./module-3587.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { editingEntriesContainResource } from "./module-3584.mjs";
import { toSessionEditorCommentId } from "./module-3609.mjs";
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { whenChatWidgetForSession } from "./module-3610.mjs";
import { ATTACHMENT_ID_PREFIX, createAgentFeedbackVariableEntry } from "./module-3589.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackService.ts
var AGENT_FEEDBACK_NEW_SESSION_RESOURCE = URI.from({ scheme: "agent-feedback", path: "/new-session" });

var IAgentFeedbackService = createDecorator("agentFeedbackService");

function workspaceFoldersKey(workspace) {
  return workspace?.folders.map((folder) => folder.root.toString()).join(",");
}

var AgentFeedbackService = class extends Disposable {
  constructor(_chatEditingService, _sessionsManagementService, _sessionsService, _sessionsProvidersService, _editorService, _chatWidgetService, _logService, _instantiationService) {
    super();
    this._chatEditingService = _chatEditingService;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._editorService = _editorService;
    this._chatWidgetService = _chatWidgetService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._onDidChangeFeedback = this._store.add(new Emitter());
    this.onDidChangeFeedback = this._onDidChangeFeedback.event;
    this._onDidChangeFeedbackVisibility = this._store.add(new Emitter());
    this.onDidChangeFeedbackVisibility = this._onDidChangeFeedbackVisibility.event;
    this._onDidChangeNavigation = this._store.add(new Emitter());
    this.onDidChangeNavigation = this._onDidChangeNavigation.event;
    this._onDidRevealSessionComment = this._store.add(new Emitter());
    this.onDidRevealSessionComment = this._onDidRevealSessionComment.event;
    this._onDidChangeFeedbackScope = this._store.add(new Emitter());
    this.onDidChangeFeedbackScope = this._onDidChangeFeedbackScope.event;
    this._onDidAddFeedback = this._store.add(new Emitter());
    this.onDidAddFeedback = this._onDidAddFeedback.event;
    this._onDidConvertFeedback = this._store.add(new Emitter());
    this.onDidConvertFeedback = this._onDidConvertFeedback.event;
    this._onDidAddReply = this._store.add(new Emitter());
    this.onDidAddReply = this._onDidAddReply.event;
    this._onDidSubmitFeedback = this._store.add(new Emitter());
    this.onDidSubmitFeedback = this._onDidSubmitFeedback.event;
    /** sessionResource → recency sequence (set on every feedback change) */
    this._sessionUpdatedOrder = /* @__PURE__ */ new Map();
    this._sessionUpdatedSequence = 0;
    this._navigationAnchorBySession = /* @__PURE__ */ new Map();
    this._visibleResolvedFeedbackIds = new ResourceMap();
    /** fileResource → sessionResource active when the editor for that file was first seen */
    this._fileToSession = new ResourceMap();
    this._explicitResourceScopes = new ResourceMap();
    /** In-memory store used for every non-agent-host provider. */
    this._inMemoryBackend = this._register(new InMemoryAgentFeedbackItemsBackend());
    this._register(this._inMemoryBackend.onDidChangeItems((resource) => this._handleBackendChange(resource)));
    this._register(this._editorService.onDidVisibleEditorsChange(() => this._trackVisibleEditorResources()));
    this._trackVisibleEditorResources();
    this.activeFeedbackSessionResource = derived(this, (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      return !activeSession || !activeSession.isCreated.read(reader) ? AGENT_FEEDBACK_NEW_SESSION_RESOURCE : activeSession.resource;
    });
    const feedbackScopeKey = derived(this, (reader) => {
      const scope = this.activeFeedbackSessionResource.read(reader).toString();
      const workspace = this._sessionsService.activeSession.read(reader)?.workspace.read(reader);
      return `${scope}|${workspaceFoldersKey(workspace) ?? ""}`;
    });
    this._register(runOnChange(feedbackScopeKey, () => this._onDidChangeFeedbackScope.fire()));
    this._newSessionWorkspaceKey = derived(this, (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession || activeSession.isCreated.read(reader)) {
        return void 0;
      }
      return workspaceFoldersKey(activeSession.workspace.read(reader));
    });
    this._register(runOnChange(this._newSessionWorkspaceKey, (key3) => {
      if (key3 === void 0) {
        return;
      }
      if (this._boundNewSessionWorkspaceKey !== void 0 && this._boundNewSessionWorkspaceKey !== key3) {
        this.clearFeedback(AGENT_FEEDBACK_NEW_SESSION_RESOURCE);
      }
      this._rebindNewSessionWorkspace();
    }));
    this._register(this._sessionsManagementService.onDidDeleteSession((session) => this._forgetSession(session.resource)));
    this._register(this._sessionsManagementService.onDidChangeSessions(() => this._lastResolvedSession = void 0));
    this._register(this._sessionsProvidersService.onDidChangeProviders(() => this._lastResolvedSession = void 0));
  }
  /**
   * Drops this service's per-session bookkeeping for a deleted session. The
   * backend is left alone: its channel is already released with the session,
   * and clearing it would write to a store that no longer exists.
   */
  _forgetSession(sessionResource) {
    const key3 = sessionResource.toString();
    if (this._lastResolvedSession && isEqual2(this._lastResolvedSession.sessionResource, sessionResource)) {
      this._lastResolvedSession = void 0;
    }
    this._sessionUpdatedOrder.delete(key3);
    this._navigationAnchorBySession.delete(key3);
    this._visibleResolvedFeedbackIds.delete(sessionResource);
    for (const [fileResource, mapped] of [...this._fileToSession]) {
      if (isEqual2(mapped, sessionResource)) {
        this._fileToSession.delete(fileResource);
      }
    }
    for (const [fileResource, mapped] of [...this._explicitResourceScopes]) {
      if (isEqual2(mapped, sessionResource)) {
        this._explicitResourceScopes.delete(fileResource);
      }
    }
  }
  /**
   * The shared new-session comments belong to the workspace of the draft they
   * were written for. An empty set releases the binding so the next draft can
   * adopt its own workspace instead of being measured against a stale one.
   */
  _rebindNewSessionWorkspace() {
    if (!this.getFeedback(AGENT_FEEDBACK_NEW_SESSION_RESOURCE).length) {
      this._boundNewSessionWorkspaceKey = void 0;
      return;
    }
    const key3 = this._newSessionWorkspaceKey.get();
    if (key3 !== void 0) {
      this._boundNewSessionWorkspaceKey = key3;
    }
  }
  /** Resolves the storage backend that owns feedback for the given session. */
  _backendForSession(sessionResource) {
    if (this._isAgentHostSession(sessionResource)) {
      return this._getAnnotationsBackend();
    }
    return this._inMemoryBackend;
  }
  _getAnnotationsBackend() {
    if (!this._annotationsBackend) {
      this._annotationsBackend = this._register(this._instantiationService.createInstance(AnnotationsAgentFeedbackItemsBackend));
      this._register(this._annotationsBackend.onDidChangeItems((resource) => this._handleBackendChange(resource)));
    }
    return this._annotationsBackend;
  }
  _backends() {
    return this._annotationsBackend ? [this._inMemoryBackend, this._annotationsBackend] : [this._inMemoryBackend];
  }
  /**
   * Centralized handler for backend item changes (local mutations and
   * server-driven updates). Maintains recency ordering and re-broadcasts the
   * generic feedback / navigation change events.
   */
  _handleBackendChange(sessionResource) {
    const key3 = sessionResource.toString();
    const feedbackItems = this._backendForSession(sessionResource).getItems(sessionResource);
    const visibleResolvedFeedbackIds = this._visibleResolvedFeedbackIds.get(sessionResource);
    if (visibleResolvedFeedbackIds) {
      const resolvedFeedbackIds = new Set(feedbackItems.filter((item) => item.state === "resolved" /* Resolved */).map((item) => item.id));
      for (const feedbackId of visibleResolvedFeedbackIds) {
        if (!resolvedFeedbackIds.has(feedbackId)) {
          visibleResolvedFeedbackIds.delete(feedbackId);
        }
      }
      if (visibleResolvedFeedbackIds.size === 0) {
        this._visibleResolvedFeedbackIds.delete(sessionResource);
      }
    }
    if (feedbackItems.length) {
      this._sessionUpdatedOrder.set(key3, ++this._sessionUpdatedSequence);
    } else {
      this._sessionUpdatedOrder.delete(key3);
    }
    this._onDidChangeFeedback.fire({ sessionResource, feedbackItems });
    this._onDidChangeNavigation.fire(sessionResource);
    if (isEqual2(sessionResource, AGENT_FEEDBACK_NEW_SESSION_RESOURCE)) {
      this._rebindNewSessionWorkspace();
    }
  }
  _trackVisibleEditorResources() {
    const activeSession = this._sessionsService.activeSession.get();
    if (!activeSession) {
      return;
    }
    for (const pane of this._editorService.visibleEditorPanes) {
      for (const candidate of getActiveResourceCandidates(pane.input)) {
        this._fileToSession.set(candidate, activeSession.resource);
      }
    }
  }
  /**
   * Resolves a session by resource, answering from the active session facade
   * whenever it is the one asked for and otherwise from the last lookup.
   * `ISessionsManagementService.getSession` rebuilds every provider's session
   * catalog and then scans it linearly, which is far too expensive for the
   * per-resource lookups this service performs while a Changes editor with
   * thousands of resources is open.
   */
  _resolveSession(sessionResource) {
    const activeSession = this._sessionsService.activeSession.get();
    if (activeSession && isEqual2(activeSession.resource, sessionResource)) {
      return activeSession;
    }
    if (this._lastResolvedSession && isEqual2(this._lastResolvedSession.sessionResource, sessionResource)) {
      return this._lastResolvedSession.session;
    }
    const session = this._sessionsManagementService.getSession(sessionResource);
    this._lastResolvedSession = { sessionResource, session };
    return session;
  }
  getSessionForFile(resourceUri) {
    if (!this._isFileEligibleForFeedback(resourceUri)) {
      return void 0;
    }
    const sessionResource = this._fileToSession.get(resourceUri) ?? this._sessionsService.activeSession.get()?.resource;
    if (!sessionResource) {
      return void 0;
    }
    const session = this._resolveSession(sessionResource);
    if (!session || session.status.get() === 0 /* Untitled */) {
      return void 0;
    }
    return session;
  }
  getFeedbackSessionResource(resourceUri) {
    const explicitScope = this._explicitResourceScopes.get(resourceUri);
    if (explicitScope) {
      return explicitScope;
    }
    if (!this._isFileEligibleForFeedback(resourceUri)) {
      return void 0;
    }
    const activeSession = this._sessionsService.activeSession.get();
    if (!activeSession || !activeSession.isCreated.get()) {
      return AGENT_FEEDBACK_NEW_SESSION_RESOURCE;
    }
    return this.getSessionForFile(resourceUri)?.resource;
  }
  registerFeedbackResourceScope(resourceUri, sessionResource) {
    this._explicitResourceScopes.set(resourceUri, sessionResource);
    this._onDidChangeFeedbackScope.fire();
    return {
      dispose: () => {
        if (isEqual2(this._explicitResourceScopes.get(resourceUri), sessionResource)) {
          this._explicitResourceScopes.delete(resourceUri);
          this._onDidChangeFeedbackScope.fire();
        }
      }
    };
  }
  /**
   * Whether the given file is eligible for agent feedback. The Output view
   * renders into a code editor but is not a real file the user can give
   * feedback on, so it is the one thing excluded here.
   */
  _isFileEligibleForFeedback(resourceUri) {
    return resourceUri.scheme !== Schemas.outputChannel;
  }
  addFeedback(sessionResource, resourceUri, range2, text2, suggestion, context2, sourcePRReviewCommentId, kind = "user" /* UserReview */, state = "accepted" /* Accepted */, sourcePullRequest) {
    const backend = this._backendForSession(sessionResource);
    const effectiveKind = sourcePRReviewCommentId ? "prReview" /* PRReview */ : kind;
    const feedback = {
      id: generateUuid(),
      text: text2,
      resourceUri,
      range: range2,
      sessionResource,
      suggestion,
      codeSelection: context2?.codeSelection,
      diffHunks: context2?.diffHunks,
      kind: effectiveKind,
      sourcePRReviewCommentId,
      sourcePullRequest,
      state
    };
    const resourceStr = resourceUri.toString();
    const hasExistingForFile = backend.getItems(sessionResource).some((f) => f.resourceUri.toString() === resourceStr);
    backend.upsert(feedback);
    if (state === "accepted" /* Accepted */) {
      if (effectiveKind === "user" /* UserReview */) {
        this._onDidAddFeedback.fire({ sessionResource, feedback, hasExistingFeedbackForFile: hasExistingForFile });
      } else {
        this._onDidConvertFeedback.fire({ sessionResource, feedback, kind: effectiveKind, hasExistingFeedbackForFile: hasExistingForFile });
      }
    }
    return feedback;
  }
  acceptFeedback(sessionResource, feedbackId, options3) {
    const backend = this._backendForSession(sessionResource);
    const feedbackItems = backend.getItems(sessionResource);
    const existing = feedbackItems.find((f) => f.id === feedbackId);
    if (!existing || existing.state !== "created" /* Created */) {
      return;
    }
    const accepted = {
      ...existing,
      state: "accepted" /* Accepted */,
      ...options3?.revealToAgent ? { pendingAgentReveal: true } : {}
    };
    backend.upsert(accepted);
    if (accepted.kind !== "user" /* UserReview */) {
      const resourceStr = accepted.resourceUri.toString();
      const hasExistingFeedbackForFile = feedbackItems.some((f) => f.id !== accepted.id && f.resourceUri.toString() === resourceStr);
      this._onDidConvertFeedback.fire({ sessionResource, feedback: accepted, kind: accepted.kind, hasExistingFeedbackForFile });
    }
  }
  removeFeedback(sessionResource, feedbackId) {
    const key3 = sessionResource.toString();
    if (this._navigationAnchorBySession.get(key3) === feedbackId) {
      this._navigationAnchorBySession.delete(key3);
    }
    this._backendForSession(sessionResource).remove(sessionResource, feedbackId);
  }
  updateFeedback(sessionResource, feedbackId, newText) {
    const backend = this._backendForSession(sessionResource);
    const existing = backend.getItems(sessionResource).find((f) => f.id === feedbackId);
    if (!existing) {
      return;
    }
    backend.upsert({ ...existing, text: newText });
  }
  updateFeedbackSourcePullRequest(sessionResource, feedbackId, sourcePullRequest) {
    const backend = this._backendForSession(sessionResource);
    const existing = backend.getItems(sessionResource).find((item) => item.id === feedbackId);
    if (!existing || existing.sourcePullRequest) {
      return;
    }
    backend.upsert({ ...existing, sourcePullRequest });
  }
  setFeedbackResolved(sessionResource, feedbackId, resolved) {
    const backend = this._backendForSession(sessionResource);
    const nextState = resolved ? "resolved" /* Resolved */ : "submitted" /* Submitted */;
    const existing = backend.getItems(sessionResource).find((f) => f.id === feedbackId);
    if (existing && existing.state !== nextState) {
      backend.upsert({ ...existing, state: nextState });
    }
  }
  addReply(sessionResource, feedbackId, replyText) {
    const backend = this._backendForSession(sessionResource);
    const existing = backend.getItems(sessionResource).find((f) => f.id === feedbackId);
    if (!existing) {
      return;
    }
    const newReplies = [...existing.replies ?? [], { text: replyText, author: "user" }];
    const updated = { ...existing, replies: newReplies };
    backend.upsert(updated);
    this._onDidAddReply.fire({ sessionResource, feedback: updated, replyCount: newReplies.length });
  }
  getFeedback(sessionResource) {
    return this._backendForSession(sessionResource).getItems(sessionResource);
  }
  showFeedbackInEditor(sessionResource, feedbackIds) {
    const resolvedFeedbackIds = new Set(
      this.getFeedback(sessionResource).filter((item) => item.state === "resolved" /* Resolved */).map((item) => item.id)
    );
    const visibleFeedbackIds = this._visibleResolvedFeedbackIds.get(sessionResource) ?? /* @__PURE__ */ new Set();
    const previousSize = visibleFeedbackIds.size;
    for (const feedbackId of feedbackIds) {
      if (resolvedFeedbackIds.has(feedbackId)) {
        visibleFeedbackIds.add(feedbackId);
      }
    }
    if (visibleFeedbackIds.size !== previousSize) {
      this._visibleResolvedFeedbackIds.set(sessionResource, visibleFeedbackIds);
      this._onDidChangeFeedbackVisibility.fire(sessionResource);
    }
  }
  hideFeedbackInEditor(sessionResource, feedbackId) {
    const visibleFeedbackIds = this._visibleResolvedFeedbackIds.get(sessionResource);
    if (!visibleFeedbackIds?.delete(feedbackId)) {
      return;
    }
    if (visibleFeedbackIds.size === 0) {
      this._visibleResolvedFeedbackIds.delete(sessionResource);
    }
    this._onDidChangeFeedbackVisibility.fire(sessionResource);
  }
  getVisibleResolvedFeedbackIds(sessionResource) {
    return this._visibleResolvedFeedbackIds.get(sessionResource) ?? /* @__PURE__ */ new Set();
  }
  hasLoadedFeedback(sessionResource) {
    return this._backendForSession(sessionResource).hasLoaded(sessionResource);
  }
  getMostRecentSessionForResource(resourceUri) {
    let bestSession;
    let bestSequence = -1;
    for (const backend of this._backends()) {
      for (const candidate of backend.getSessionsWithItems()) {
        const feedbackItems = backend.getItems(candidate);
        if (!feedbackItems.length) {
          continue;
        }
        if (!this._sessionContainsResource(candidate, resourceUri, feedbackItems)) {
          continue;
        }
        const sequence2 = this._sessionUpdatedOrder.get(candidate.toString()) ?? 0;
        if (sequence2 > bestSequence) {
          bestSession = candidate;
          bestSequence = sequence2;
        }
      }
    }
    return bestSession;
  }
  _sessionContainsResource(sessionResource, resourceUri, feedbackItems) {
    if (feedbackItems.some((item) => isEqual2(item.resourceUri, resourceUri))) {
      return true;
    }
    for (const editingSession of this._chatEditingService.editingSessionsObs.get()) {
      if (!isEqual2(editingSession.chatSessionResource, sessionResource)) {
        continue;
      }
      if (editingEntriesContainResource(editingSession.entries.get(), resourceUri)) {
        return true;
      }
    }
    const session = this._resolveSession(sessionResource);
    if (!session) {
      return false;
    }
    const changes = session.changes.get();
    if (changes.some((change) => changeMatchesResource(change, resourceUri))) {
      return true;
    }
    return false;
  }
  async revealFeedback(sessionResource, feedbackId) {
    const feedback = this.getFeedback(sessionResource).find((f) => f.id === feedbackId);
    if (!feedback) {
      return;
    }
    this.showFeedbackInEditor(sessionResource, [feedbackId]);
    await this.revealSessionComment(sessionResource, toSessionEditorCommentId("agentFeedback" /* AgentFeedback */, feedbackId), feedback.resourceUri, feedback.range);
  }
  async revealSessionComment(sessionResource, commentId, resourceUri, range2) {
    const selection = { startLineNumber: range2.startLineNumber, startColumn: range2.startColumn };
    const sessionData = this._sessionsManagementService.getSession(sessionResource);
    const sessionChange = this._getSessionChange(resourceUri, sessionData?.changes.get());
    if (sessionChange?.isDeletion && sessionChange.originalUri) {
      await this._editorService.openEditor({
        resource: sessionChange.originalUri,
        options: {
          modal: {},
          preserveFocus: false,
          revealIfVisible: true,
          selection
        }
      });
    } else if (sessionChange?.originalUri) {
      await this._editorService.openEditor({
        original: { resource: sessionChange.originalUri },
        modified: { resource: sessionChange.modifiedUri },
        options: {
          modal: {},
          preserveFocus: false,
          revealIfVisible: true,
          selection
        }
      });
    } else {
      await this._editorService.openEditor({
        resource: sessionChange?.modifiedUri ?? resourceUri,
        options: {
          modal: {},
          preserveFocus: false,
          revealIfVisible: true,
          selection
        }
      });
    }
    this.setNavigationAnchor(sessionResource, commentId);
    this._onDidRevealSessionComment.fire({ sessionResource, commentId, resourceUri });
  }
  _getSessionChange(resourceUri, changes) {
    if (!(changes instanceof Array)) {
      return void 0;
    }
    const matchingChange = changes.find((change) => changeMatchesResource(change, resourceUri));
    if (!matchingChange) {
      return void 0;
    }
    if (isIChatSessionFileChange2(matchingChange)) {
      return {
        originalUri: matchingChange.originalUri,
        modifiedUri: matchingChange.modifiedUri ?? matchingChange.uri,
        isDeletion: matchingChange.modifiedUri === void 0
      };
    }
    return {
      originalUri: matchingChange.originalUri,
      modifiedUri: matchingChange.modifiedUri,
      isDeletion: false
    };
  }
  getNextFeedback(sessionResource, next) {
    return this.getNextNavigableItem(sessionResource, this.getFeedback(sessionResource), next);
  }
  getNextNavigableItem(sessionResource, items, next) {
    const key3 = sessionResource.toString();
    if (!items.length) {
      this._navigationAnchorBySession.delete(key3);
      return void 0;
    }
    const anchorId = this._navigationAnchorBySession.get(key3);
    let anchorIndex = anchorId ? items.findIndex((item2) => item2.id === anchorId) : -1;
    if (anchorIndex < 0 && !next) {
      anchorIndex = 0;
    }
    const nextIndex = next ? (anchorIndex + 1) % items.length : (anchorIndex - 1 + items.length) % items.length;
    const item = items[nextIndex];
    this.setNavigationAnchor(sessionResource, item.id);
    return item;
  }
  setNavigationAnchor(sessionResource, itemId) {
    const key3 = sessionResource.toString();
    if (itemId) {
      this._navigationAnchorBySession.set(key3, itemId);
    } else {
      this._navigationAnchorBySession.delete(key3);
    }
    this._onDidChangeNavigation.fire(sessionResource);
  }
  getNavigationBearing(sessionResource, items = this.getFeedback(sessionResource)) {
    const key3 = sessionResource.toString();
    const anchorId = this._navigationAnchorBySession.get(key3);
    const activeIdx = anchorId ? items.findIndex((item) => item.id === anchorId) : -1;
    return { activeIdx, totalCount: items.length };
  }
  clearFeedback(sessionResource) {
    const key3 = sessionResource.toString();
    this._sessionUpdatedOrder.delete(key3);
    this._navigationAnchorBySession.delete(key3);
    this._visibleResolvedFeedbackIds.delete(sessionResource);
    this._backendForSession(sessionResource).clear(sessionResource);
  }
  async addFeedbackAndSubmit(sessionResource, resourceUri, range2, text2, suggestion, context2, sourcePRReviewCommentId, kind) {
    this.addFeedback(sessionResource, resourceUri, range2, text2, suggestion, context2, sourcePRReviewCommentId, kind);
    if (isEqual2(sessionResource, AGENT_FEEDBACK_NEW_SESSION_RESOURCE)) {
      await this.submitFeedback(sessionResource);
      return;
    }
    if (!this._isAgentHostSession(sessionResource)) {
      const widget = await whenChatWidgetForSession(this._chatWidgetService, sessionResource);
      if (widget) {
        const attachmentId = ATTACHMENT_ID_PREFIX + sessionResource.toString();
        const hasAttachment = () => widget.attachmentModel.attachments.some((a) => a.id === attachmentId);
        if (!hasAttachment()) {
          await Event2.toPromise(
            Event2.filter(widget.attachmentModel.onDidChange, () => hasAttachment())
          );
        }
      } else {
        this._logService.error("[AgentFeedback] addFeedbackAndSubmit: no chat widget found for session, feedback may not be submitted correctly", sessionResource.toString());
      }
    }
    await this.submitFeedback(sessionResource);
  }
  _isAgentHostSession(sessionResource) {
    const session = this._resolveSession(sessionResource);
    return session ? isAgentHostProviderId(session.providerId) : false;
  }
  async submitFeedback(sessionResource, options3) {
    if (isEqual2(sessionResource, AGENT_FEEDBACK_NEW_SESSION_RESOURCE)) {
      if (!this.getFeedback(sessionResource).some((item) => item.state === "accepted" /* Accepted */)) {
        return false;
      }
      return this._sessionsService.submitNewSessionInput();
    }
    const widget = await whenChatWidgetForSession(this._chatWidgetService, sessionResource);
    if (!widget) {
      this._logService.error("[AgentFeedback] submitFeedback: no chat widget found for session", sessionResource.toString());
      return false;
    }
    if (this._isAgentHostSession(sessionResource)) {
      const feedbackIds = options3?.feedbackIds ? new Set(options3.feedbackIds) : void 0;
      const acceptedItems = this.getFeedback(sessionResource).filter((item) => item.state === "accepted" /* Accepted */ && (!feedbackIds || feedbackIds.has(item.id)));
      const attachmentId = ATTACHMENT_ID_PREFIX + sessionResource.toString();
      if (acceptedItems.length) {
        const annotationsResource = this._getAnnotationsBackend().getAnnotationsChannelResource(sessionResource);
        widget.attachmentModel.delete(attachmentId);
        widget.attachmentModel.addContext(createAgentFeedbackVariableEntry(sessionResource, acceptedItems, annotationsResource));
      }
      return this._sendActOnFeedbackRequest(widget, sessionResource, options3, () => widget.attachmentModel.delete(attachmentId));
    }
    const nonAgentHostOptions = options3?.feedbackIds ? { ...options3, feedbackIds: void 0 } : options3;
    return this._sendActOnFeedbackRequest(widget, sessionResource, nonAgentHostOptions);
  }
  /**
   * Sends the `/act-on-feedback` request and marks the accepted feedback as
   * submitted as soon as the request has been accepted by the chat widget.
   * The request is queued when the agent is still working on another request,
   * in which case awaiting {@link IChatWidget.acceptInput} would only resolve
   * once that queued request eventually runs — the feedback items must move to
   * the submitted state right away.
   */
  _sendActOnFeedbackRequest(widget, sessionResource, options3, cleanup) {
    const submitted = new DeferredPromise();
    const cleanupOnce = cleanup && createSingleCallFunction(cleanup);
    widget.acceptInput(options3?.query ?? "/act-on-feedback", {
      onRequestAccepted: () => {
        cleanupOnce?.();
        this.markFeedbackSubmitted(sessionResource, options3?.feedbackIds);
        options3?.onRequestAccepted?.();
        submitted.complete(true);
      }
    }).then(() => {
      cleanupOnce?.();
      submitted.complete(false);
    }, (err) => {
      this._logService.error("[AgentFeedback] Failed to submit feedback", err);
      cleanupOnce?.();
      submitted.complete(false);
    });
    return submitted.p;
  }
  markFeedbackSubmitted(sessionResource, feedbackIds) {
    const backend = this._backendForSession(sessionResource);
    const feedbackItems = backend.getItems(sessionResource);
    const selectedFeedbackIds = feedbackIds ? new Set(feedbackIds) : void 0;
    const submittedState = this._isAgentHostSession(sessionResource) ? "submitted" /* Submitted */ : "resolved" /* Resolved */;
    let userCount = 0;
    let codeReviewCount = 0;
    let prReviewCount = 0;
    let replyCount = 0;
    const submitted = [];
    for (const item of feedbackItems) {
      if (item.state !== "accepted" /* Accepted */ || selectedFeedbackIds && !selectedFeedbackIds.has(item.id)) {
        continue;
      }
      switch (item.kind) {
        case "user" /* UserReview */:
          userCount++;
          break;
        case "codeReview" /* AgentReview */:
          codeReviewCount++;
          break;
        case "prReview" /* PRReview */:
          prReviewCount++;
          break;
      }
      replyCount += item.replies?.length ?? 0;
      submitted.push({ ...item, state: submittedState });
    }
    if (!submitted.length) {
      return;
    }
    for (const item of submitted) {
      backend.upsert(item);
    }
    this._onDidSubmitFeedback.fire({
      sessionResource,
      totalCount: userCount + codeReviewCount + prReviewCount,
      userCount,
      codeReviewCount,
      prReviewCount,
      replyCount
    });
  }
};

AgentFeedbackService = __decorateClass([
  __decorateParam(0, IChatEditingService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionsProvidersService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IInstantiationService)
], AgentFeedbackService);
export { workspaceFoldersKey, AGENT_FEEDBACK_NEW_SESSION_RESOURCE, IAgentFeedbackService, AgentFeedbackService };
