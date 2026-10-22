// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentEditorCommentsProvider.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { fromSessionEditorCommentId, getSessionEditorComments } from "./module-3609.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { IPlanReviewFeedbackService } from "./module-2110.mjs";
import { IAgentEditorCommentsBridge } from "./module-0919.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentEditorCommentsProvider.ts
var AgentEditorCommentsProviderContribution = class extends Disposable {
  constructor(_agentFeedbackService, planReviewFeedbackService, bridge) {
    super();
    this._agentFeedbackService = _agentFeedbackService;
    this.priority = 100;
    this._onDidRevealComment = this._register(new Emitter());
    this.onDidRevealComment = this._onDidRevealComment.event;
    this._planScopes = this._register(new DisposableMap());
    const onDidChangeComments = Event2.any(this._agentFeedbackService.onDidChangeFeedback, this._agentFeedbackService.onDidChangeFeedbackVisibility, this._agentFeedbackService.onDidChangeFeedbackScope);
    this.onDidChangeComments = Event2.signal(onDidChangeComments);
    this._register(bridge.registerProvider(this));
    this._register(this._agentFeedbackService.onDidRevealSessionComment((event) => {
      this._pendingReveal = { resource: event.resourceUri, id: event.commentId };
      this._revealPendingComment();
    }));
    this._register(onDidChangeComments(() => this._revealPendingComment()));
    this._register(planReviewFeedbackService.onDidChangePlanReviewScope(({ planUri, sessionResource, active }) => {
      if (active) {
        this._planScopes.set(planUri.toString(), this._agentFeedbackService.registerFeedbackResourceScope(planUri, sessionResource));
      } else {
        this._planScopes.deleteAndDispose(planUri.toString());
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentEditorCommentsProvider";
  }
  acceptsComments(resource) {
    return !!this._agentFeedbackService.getFeedbackSessionResource(resource);
  }
  getComments(resource, includeRelated = false) {
    const sessionResource = this._getSessionResource(resource);
    if (!sessionResource) {
      return [];
    }
    const comments = [];
    const sessionComments = getSessionEditorComments(
      sessionResource,
      this._agentFeedbackService.getFeedback(sessionResource),
      void 0,
      this._agentFeedbackService.getVisibleResolvedFeedbackIds(sessionResource)
    );
    for (const comment of sessionComments) {
      if (includeRelated && comment.source === "agentFeedback" /* AgentFeedback */ && comment.state === "accepted" /* Accepted */ || !includeRelated && isEqual2(comment.resourceUri, resource)) {
        comments.push({ id: comment.id, resource: comment.resourceUri, range: comment.range, body: comment.text });
      }
    }
    return comments;
  }
  getCommentIds(resource, includeRelated = false) {
    const sessionResource = this._getSessionResource(resource);
    if (!sessionResource) {
      return [];
    }
    return getSessionEditorComments(
      sessionResource,
      this._agentFeedbackService.getFeedback(sessionResource),
      void 0,
      this._agentFeedbackService.getVisibleResolvedFeedbackIds(sessionResource)
    ).filter((comment) => includeRelated || isEqual2(comment.resourceUri, resource)).map((comment) => comment.id);
  }
  addComment(resource, range2, body) {
    const sessionResource = this._getSessionResource(resource);
    if (!sessionResource) {
      return;
    }
    this._agentFeedbackService.addFeedback(sessionResource, resource, range2, body);
  }
  deleteComment(resource, id2) {
    const sessionResource = this._getSessionResource(resource);
    if (!sessionResource) {
      return;
    }
    const parsed = fromSessionEditorCommentId(id2);
    if (parsed?.source !== "agentFeedback" /* AgentFeedback */) {
      return;
    }
    const feedback = this._agentFeedbackService.getFeedback(sessionResource).find((item) => item.id === parsed.sourceId);
    if (feedback?.state === "resolved" /* Resolved */) {
      this._agentFeedbackService.hideFeedbackInEditor(sessionResource, parsed.sourceId);
    } else {
      this._agentFeedbackService.removeFeedback(sessionResource, parsed.sourceId);
    }
  }
  _revealPendingComment() {
    const pendingReveal = this._pendingReveal;
    if (!pendingReveal || !this.getComments(pendingReveal.resource).some((comment) => comment.id === pendingReveal.id)) {
      return;
    }
    this._pendingReveal = void 0;
    this._onDidRevealComment.fire(pendingReveal);
  }
  _getSessionResource(resource) {
    return this._agentFeedbackService.getFeedbackSessionResource(resource);
  }
};

AgentEditorCommentsProviderContribution = __decorateClass([
  __decorateParam(0, IAgentFeedbackService),
  __decorateParam(1, IPlanReviewFeedbackService),
  __decorateParam(2, IAgentEditorCommentsBridge)
], AgentEditorCommentsProviderContribution);
export { AgentEditorCommentsProviderContribution };
