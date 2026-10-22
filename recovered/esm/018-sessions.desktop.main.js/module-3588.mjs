// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackItemsBackend.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { FEEDBACK_ANNOTATION_META_KEY, authorForFeedbackKind, feedbackAnnotationEntryMeta, readFeedbackAnnotationMeta, resolveFeedbackEntryAuthor } from "./module-2214.mjs";
import { URI } from "./module-0032.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackItemsBackend.ts
function orderFeedbackItems(items) {
  const fileOrder = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key3 = item.resourceUri.toString();
    if (!fileOrder.has(key3)) {
      fileOrder.set(key3, fileOrder.size);
    }
  }
  return items.slice().sort((a, b) => {
    const fa = fileOrder.get(a.resourceUri.toString());
    const fb = fileOrder.get(b.resourceUri.toString());
    if (fa !== fb) {
      return fa - fb;
    }
    return a.range.startLineNumber - b.range.startLineNumber;
  });
}

var InMemoryAgentFeedbackItemsBackend = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeItems = this._register(new Emitter());
    this.onDidChangeItems = this._onDidChangeItems.event;
    /** sessionResource → feedback items (insertion order; display order applied on read) */
    this._bySession = /* @__PURE__ */ new Map();
    this._sessionResourceByKey = /* @__PURE__ */ new Map();
  }
  getItems(sessionResource) {
    return orderFeedbackItems(this._bySession.get(sessionResource.toString()) ?? []);
  }
  hasLoaded(_sessionResource) {
    return true;
  }
  upsert(feedback) {
    const key3 = feedback.sessionResource.toString();
    let items = this._bySession.get(key3);
    if (!items) {
      items = [];
      this._bySession.set(key3, items);
      this._sessionResourceByKey.set(key3, feedback.sessionResource);
    }
    const idx = items.findIndex((f) => f.id === feedback.id);
    if (idx >= 0) {
      items[idx] = feedback;
    } else {
      items.push(feedback);
    }
    this._onDidChangeItems.fire(feedback.sessionResource);
  }
  remove(sessionResource, feedbackId) {
    const key3 = sessionResource.toString();
    const items = this._bySession.get(key3);
    if (!items) {
      return;
    }
    const idx = items.findIndex((f) => f.id === feedbackId);
    if (idx < 0) {
      return;
    }
    items.splice(idx, 1);
    if (!items.length) {
      this._bySession.delete(key3);
      this._sessionResourceByKey.delete(key3);
    }
    this._onDidChangeItems.fire(sessionResource);
  }
  clear(sessionResource) {
    const key3 = sessionResource.toString();
    if (this._bySession.delete(key3)) {
      this._sessionResourceByKey.delete(key3);
      this._onDidChangeItems.fire(sessionResource);
    }
  }
  getSessionsWithItems() {
    return [...this._sessionResourceByKey.values()];
  }
};

var KIND_FROM_VALUE = {
  user: "user" /* UserReview */,
  codeReview: "codeReview" /* AgentReview */,
  prReview: "prReview" /* PRReview */
};

var STATE_FROM_VALUE = {
  created: "created" /* Created */,
  accepted: "accepted" /* Accepted */,
  submitted: "submitted" /* Submitted */,
  resolved: "resolved" /* Resolved */
};

function asCodeReviewSuggestion(suggestion) {
  if (suggestion && typeof suggestion === "object" && Array.isArray(suggestion.edits)) {
    return suggestion;
  }
  return void 0;
}

function readFeedbackMeta(annotation) {
  const base = readFeedbackAnnotationMeta(annotation);
  if (!base) {
    return void 0;
  }
  return {
    kind: KIND_FROM_VALUE[base.kind],
    state: STATE_FROM_VALUE[base.state],
    sessionResource: base.sessionResource,
    suggestion: asCodeReviewSuggestion(base.suggestion),
    codeSelection: base.codeSelection,
    diffHunks: base.diffHunks,
    sourcePRReviewCommentId: base.sourcePRReviewCommentId,
    sourcePullRequest: base.sourcePullRequest,
    pendingAgentReveal: base.pendingAgentReveal
  };
}

function toTextRange(range2) {
  return {
    start: { line: range2.startLineNumber - 1, character: range2.startColumn - 1 },
    end: { line: range2.endLineNumber - 1, character: range2.endColumn - 1 }
  };
}

function fromTextRange(range2) {
  if (!range2) {
    return { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 };
  }
  return {
    startLineNumber: range2.start.line + 1,
    startColumn: range2.start.character + 1,
    endLineNumber: range2.end.line + 1,
    endColumn: range2.end.character + 1
  };
}

function entryText(text2) {
  return typeof text2 === "string" ? text2 : text2.markdown;
}

function feedbackToAnnotation(feedback, connection) {
  const entries2 = [{
    id: `${feedback.id}:0`,
    text: feedback.text,
    _meta: feedbackAnnotationEntryMeta(authorForFeedbackKind(feedback.kind))
  }];
  for (let i2 = 0; i2 < (feedback.replies?.length ?? 0); i2++) {
    const reply = feedback.replies[i2];
    entries2.push({ id: `${feedback.id}:r${i2}`, text: reply.text, _meta: feedbackAnnotationEntryMeta(reply.author) });
  }
  const meta = {
    kind: feedback.kind,
    state: feedback.state,
    sessionResource: feedback.sessionResource.toString(),
    suggestion: feedback.suggestion,
    codeSelection: feedback.codeSelection,
    diffHunks: feedback.diffHunks,
    sourcePRReviewCommentId: feedback.sourcePRReviewCommentId,
    sourcePullRequest: feedback.sourcePullRequest,
    pendingAgentReveal: feedback.pendingAgentReveal
  };
  return {
    id: feedback.id,
    origin: { session: feedback.sessionResource.toString() },
    resource: connection.resourceUris.toAgentHost(feedback.resourceUri).toString(),
    range: toTextRange(feedback.range),
    resolved: feedback.state === "resolved" /* Resolved */,
    entries: entries2,
    _meta: { [FEEDBACK_ANNOTATION_META_KEY]: meta }
  };
}

function annotationToFeedback(annotation, sessionResource, connection) {
  const entries2 = annotation.entries ?? [];
  const meta = readFeedbackMeta(annotation);
  if (!meta || !entries2.length) {
    return void 0;
  }
  const replies = entries2.slice(1).map((entry, index2) => ({
    text: entryText(entry.text),
    author: resolveFeedbackEntryAuthor(entry, index2 + 1, meta?.kind)
  }));
  return {
    id: annotation.id,
    text: entryText(entries2[0].text),
    resourceUri: connection.resourceUris.fromAgentHost(URI.parse(annotation.resource)),
    range: fromTextRange(annotation.range),
    sessionResource,
    suggestion: meta?.suggestion,
    codeSelection: meta?.codeSelection,
    diffHunks: meta?.diffHunks,
    kind: meta?.kind ?? "user" /* UserReview */,
    sourcePRReviewCommentId: meta?.sourcePRReviewCommentId,
    sourcePullRequest: meta?.sourcePullRequest,
    replies: replies.length ? replies : void 0,
    state: annotation.resolved ? "resolved" /* Resolved */ : meta?.state ?? "accepted" /* Accepted */,
    pendingAgentReveal: meta?.pendingAgentReveal
  };
}

var AnnotationsAgentFeedbackItemsBackend = class extends Disposable {
  constructor(_sessionsManagementService, _sessionsProvidersService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._onDidChangeItems = this._register(new Emitter());
    this.onDidChangeItems = this._onDidChangeItems.event;
    this._channels = this._register(new DisposableMap());
    this._channelBySession = /* @__PURE__ */ new Map();
    this._sessionResourceByKey = /* @__PURE__ */ new Map();
    /** Local cache so reads work before the first snapshot arrives. */
    this._cacheBySession = /* @__PURE__ */ new Map();
    /**
     * Signature of the feedback set we last fired {@link onDidChangeItems} for,
     * per session. The annotations channel is shared and may carry non-feedback
     * annotations; comparing signatures means churn from those does not fire a
     * spurious feedback-items change (which would bump recency / navigation).
     */
    this._signatureBySession = /* @__PURE__ */ new Map();
    /**
     * Sessions whose annotations snapshot has been received. Used to fire
     * {@link onDidChangeItems} exactly once when loading completes (even when the
     * loaded feedback set is empty), so consumers that seed feedback can wait for
     * the authoritative set before acting.
     */
    this._loadedBySession = /* @__PURE__ */ new Set();
    this._register(this._sessionsManagementService.onDidDeleteSession((session) => this._releaseChannel(session.resource)));
  }
  static {
    this.OWNER = "AnnotationsAgentFeedbackItemsBackend";
  }
  getItems(sessionResource) {
    const channel = this._ensureChannel(sessionResource);
    if (channel && this._hasSnapshot(channel.subscription)) {
      return orderFeedbackItems(this._decode(channel, sessionResource));
    }
    return orderFeedbackItems(this._cacheBySession.get(sessionResource.toString()) ?? []);
  }
  hasLoaded(sessionResource) {
    const channel = this._ensureChannel(sessionResource);
    return channel ? this._hasSnapshot(channel.subscription) : false;
  }
  upsert(feedback) {
    const channel = this._ensureChannel(feedback.sessionResource);
    this._cacheUpsert(feedback);
    if (!channel) {
      this._onDidChangeItems.fire(feedback.sessionResource);
      return;
    }
    channel.connection.dispatch(channel.annotationsUri.toString(), {
      type: "annotations/set" /* AnnotationsSet */,
      annotation: feedbackToAnnotation(feedback, channel.connection)
    });
    if (!this._hasSnapshot(channel.subscription)) {
      this._onDidChangeItems.fire(feedback.sessionResource);
    }
  }
  remove(sessionResource, feedbackId) {
    const channel = this._ensureChannel(sessionResource);
    this._cacheRemove(sessionResource, feedbackId);
    if (!channel) {
      this._onDidChangeItems.fire(sessionResource);
      return;
    }
    channel.connection.dispatch(channel.annotationsUri.toString(), {
      type: "annotations/removed" /* AnnotationsRemoved */,
      annotationId: feedbackId
    });
    if (!this._hasSnapshot(channel.subscription)) {
      this._onDidChangeItems.fire(sessionResource);
    }
  }
  clear(sessionResource) {
    const items = this.getItems(sessionResource);
    const channel = this._ensureChannel(sessionResource);
    this._cacheBySession.delete(sessionResource.toString());
    if (channel) {
      for (const item of items) {
        channel.connection.dispatch(channel.annotationsUri.toString(), {
          type: "annotations/removed" /* AnnotationsRemoved */,
          annotationId: item.id
        });
      }
    }
    this._onDidChangeItems.fire(sessionResource);
  }
  getSessionsWithItems() {
    const result = [];
    for (const resource of this._sessionResourceByKey.values()) {
      if (this.getItems(resource).length > 0) {
        result.push(resource);
      }
    }
    return result;
  }
  /**
   * Returns the annotations channel URI backing the given session's feedback,
   * or `undefined` when the session is not an agent-host session (or no channel
   * could be resolved). Each feedback item id is an annotation id on this
   * channel, so callers can reference specific comments by id.
   */
  getAnnotationsChannelResource(sessionResource) {
    return this._ensureChannel(sessionResource)?.annotationsUri;
  }
  _hasSnapshot(subscription) {
    const value2 = subscription.value;
    return value2 !== void 0 && !(value2 instanceof Error);
  }
  _decode(channel, sessionResource) {
    const value2 = channel.subscription.value;
    if (!value2 || value2 instanceof Error) {
      return [];
    }
    const items = [];
    for (const annotation of value2.annotations) {
      const feedback = annotationToFeedback(annotation, sessionResource, channel.connection);
      if (feedback) {
        items.push(feedback);
      }
    }
    return items;
  }
  /**
   * Fire {@link onDidChangeItems} only when the session's feedback set actually
   * changed. The annotations channel is generic and may carry annotations from
   * other features; without this guard their churn would bump feedback recency
   * ordering and navigation even though no feedback changed.
   */
  _onAnnotationsChange(sessionResource) {
    const key3 = sessionResource.toString();
    const channel = this._channelBySession.get(key3);
    if (!channel) {
      return;
    }
    if (this._hasSnapshot(channel.subscription) && !this._loadedBySession.has(key3)) {
      this._loadedBySession.add(key3);
      this._signatureBySession.set(key3, this._feedbackSignature(channel.subscription));
      this._onDidChangeItems.fire(sessionResource);
      return;
    }
    const signature = this._feedbackSignature(channel.subscription);
    if (this._signatureBySession.get(key3) === signature) {
      return;
    }
    this._signatureBySession.set(key3, signature);
    this._onDidChangeItems.fire(sessionResource);
  }
  /**
   * A stable signature of the feedback-bearing annotations in the
   * subscription's current snapshot (sorted by id). Excludes annotations
   * without feedback metadata so unrelated annotation activity on the shared
   * channel is ignored.
   */
  _feedbackSignature(subscription) {
    const value2 = subscription.value;
    if (!value2 || value2 instanceof Error) {
      return "";
    }
    const feedback = value2.annotations.map((annotation) => ({ annotation, meta: readFeedbackMeta(annotation) })).filter(({ annotation, meta }) => meta !== void 0 && (annotation.entries?.length ?? 0) > 0).map(({ annotation, meta }) => ({
      id: annotation.id,
      resource: annotation.resource,
      range: annotation.range,
      resolved: annotation.resolved,
      entries: annotation.entries,
      meta
    })).sort((a, b) => a.id.localeCompare(b.id));
    return JSON.stringify(feedback);
  }
  _cacheUpsert(feedback) {
    const key3 = feedback.sessionResource.toString();
    let items = this._cacheBySession.get(key3);
    if (!items) {
      items = [];
      this._cacheBySession.set(key3, items);
    }
    const idx = items.findIndex((f) => f.id === feedback.id);
    if (idx >= 0) {
      items[idx] = feedback;
    } else {
      items.push(feedback);
    }
  }
  _cacheRemove(sessionResource, feedbackId) {
    const key3 = sessionResource.toString();
    const items = this._cacheBySession.get(key3);
    if (!items) {
      return;
    }
    const idx = items.findIndex((f) => f.id === feedbackId);
    if (idx >= 0) {
      items.splice(idx, 1);
    }
  }
  _releaseChannel(sessionResource) {
    const key3 = sessionResource.toString();
    this._channels.deleteAndDispose(key3);
    this._channelBySession.delete(key3);
    this._sessionResourceByKey.delete(key3);
    this._cacheBySession.delete(key3);
    this._signatureBySession.delete(key3);
    this._loadedBySession.delete(key3);
  }
  _ensureChannel(sessionResource) {
    const key3 = sessionResource.toString();
    const existing = this._channelBySession.get(key3);
    if (existing) {
      return existing;
    }
    const session = this._sessionsManagementService.getSession(sessionResource);
    if (!session || !isAgentHostProviderId(session.providerId)) {
      return void 0;
    }
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    if (!provider?.getFeedbackAnnotationsChannel) {
      return void 0;
    }
    const resolved = provider.getFeedbackAnnotationsChannel(session.sessionId);
    if (!resolved) {
      return void 0;
    }
    const store = new DisposableStore();
    const ref = store.add(resolved.connection.getSubscription(5 /* Annotations */, resolved.annotationsUri, AnnotationsAgentFeedbackItemsBackend.OWNER));
    const channel = {
      connection: resolved.connection,
      annotationsUri: resolved.annotationsUri,
      subscription: ref.object
    };
    this._signatureBySession.set(key3, this._feedbackSignature(ref.object));
    if (this._hasSnapshot(ref.object)) {
      this._loadedBySession.add(key3);
    }
    store.add(ref.object.onDidChange(() => this._onAnnotationsChange(sessionResource)));
    this._channels.set(key3, store);
    this._channelBySession.set(key3, channel);
    this._sessionResourceByKey.set(key3, sessionResource);
    return channel;
  }
};

AnnotationsAgentFeedbackItemsBackend = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsProvidersService)
], AnnotationsAgentFeedbackItemsBackend);
export { orderFeedbackItems, asCodeReviewSuggestion, readFeedbackMeta, toTextRange, fromTextRange, entryText, feedbackToAnnotation, annotationToFeedback, InMemoryAgentFeedbackItemsBackend, KIND_FROM_VALUE, STATE_FROM_VALUE, AnnotationsAgentFeedbackItemsBackend };
