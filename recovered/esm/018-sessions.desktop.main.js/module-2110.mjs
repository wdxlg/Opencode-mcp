// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/planReviewFeedback/planReviewFeedbackService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentEditorCommentsBridge } from "./module-0919.mjs";


// src/vs/workbench/contrib/chat/browser/planReviewFeedback/planReviewFeedbackService.ts
var IPlanReviewFeedbackService = createDecorator("planReviewFeedbackService");

var PlanReviewFeedbackService = class extends Disposable {
  constructor(_commentsBridge) {
    super();
    this._commentsBridge = _commentsBridge;
    this.priority = 0;
    this._registrations = /* @__PURE__ */ new Map();
    this._onDidChangeFeedback = this._register(new Emitter());
    this.onDidChangeFeedback = this._onDidChangeFeedback.event;
    this._onDidChangeNavigation = this._register(new Emitter());
    this.onDidChangeNavigation = this._onDidChangeNavigation.event;
    this._onDidChangeRegistrations = this._register(new Emitter());
    this.onDidChangeRegistrations = this._onDidChangeRegistrations.event;
    this._onDidChangePlanReviewScope = this._register(new Emitter());
    this.onDidChangePlanReviewScope = this._onDidChangePlanReviewScope.event;
    this.onDidChangeComments = Event2.signal(Event2.any(this.onDidChangeFeedback, this.onDidChangeRegistrations));
    this.onDidRevealComment = Event2.None;
    this._register(this._commentsBridge.registerProvider(this));
  }
  registerPlanReview(planUri, review) {
    const key3 = planUri.toString();
    const registrations = this._registrations.get(key3) ?? [];
    const previous = registrations.at(-1);
    if (previous) {
      this._onDidChangePlanReviewScope.fire({ planUri, sessionResource: previous.review.sessionResource, active: false });
    }
    const registration = {
      review,
      items: [],
      existingCommentIds: /* @__PURE__ */ new Set(),
      navigationAnchor: void 0
    };
    registrations.push(registration);
    this._registrations.set(key3, registrations);
    this._onDidChangePlanReviewScope.fire({ planUri, sessionResource: review.sessionResource, active: true });
    for (const commentId of this._commentsBridge.getCommentIds(planUri, true)) {
      registration.existingCommentIds.add(commentId);
    }
    this._onDidChangeRegistrations.fire();
    return toDisposable(() => {
      const index2 = registrations.indexOf(registration);
      if (index2 === -1) {
        return;
      }
      const wasActive = index2 === registrations.length - 1;
      registrations.splice(index2, 1);
      if (registrations.length === 0) {
        this._registrations.delete(key3);
      }
      if (wasActive) {
        this._onDidChangePlanReviewScope.fire({ planUri, sessionResource: review.sessionResource, active: false });
        const active = registrations.at(-1);
        if (active) {
          this._onDidChangePlanReviewScope.fire({ planUri, sessionResource: active.review.sessionResource, active: true });
        }
      }
      this._onDidChangeRegistrations.fire();
    });
  }
  isActivePlanReview(uri4) {
    return this._getRegistration(uri4) !== void 0;
  }
  getPlanReview(uri4) {
    return this._getRegistration(uri4)?.review;
  }
  notifyFeedbackChanged(planUri) {
    if (this.isActivePlanReview(planUri)) {
      this._onDidChangeFeedback.fire(planUri);
    }
  }
  addFeedback(planUri, line, column, text2) {
    return this._addFeedback(planUri, {
      startLineNumber: line,
      startColumn: column,
      endLineNumber: line,
      endColumn: column
    }, text2);
  }
  _addFeedback(planUri, range2, text2) {
    const registration = this._getRegistration(planUri);
    if (!registration) {
      return "";
    }
    const id2 = generateUuid();
    registration.items.push({
      id: id2,
      resource: planUri,
      range: range2,
      line: range2.startLineNumber,
      column: range2.startColumn,
      text: text2
    });
    registration.items.sort((a, b) => a.line - b.line || a.column - b.column);
    this._onDidChangeFeedback.fire(planUri);
    return id2;
  }
  removeFeedback(planUri, feedbackId) {
    const registration = this._getRegistration(planUri);
    if (!registration) {
      return;
    }
    const idx = registration.items.findIndex((item2) => item2.id === feedbackId);
    if (idx >= 0) {
      registration.items.splice(idx, 1);
      this._onDidChangeFeedback.fire(planUri);
      return;
    }
    const item = this.getFeedback(planUri).find((candidate) => candidate.id === feedbackId);
    if (item) {
      this._commentsBridge.deleteComment(planUri, item.id);
    }
  }
  updateFeedback(planUri, feedbackId, newText) {
    const registration = this._getRegistration(planUri);
    if (!registration) {
      return;
    }
    const idx = registration.items.findIndex((item) => item.id === feedbackId);
    if (idx >= 0) {
      const old = registration.items[idx];
      registration.items[idx] = { ...old, text: newText };
      this._onDidChangeFeedback.fire(planUri);
    }
  }
  getFeedback(planUri) {
    const registration = this._getRegistration(planUri);
    if (!registration) {
      return [];
    }
    return this._commentsBridge.getComments(planUri, true).filter((comment) => !registration.existingCommentIds.has(comment.id)).map((comment) => ({
      id: comment.id,
      resource: comment.resource,
      range: comment.range,
      line: comment.range.startLineNumber,
      column: comment.range.startColumn,
      text: comment.body
    }));
  }
  clearFeedback(planUri) {
    const registration = this._getRegistration(planUri);
    if (!registration) {
      return;
    }
    const feedback = this.getFeedback(planUri);
    const localIds = new Set(registration.items.map((item) => item.id));
    registration.items.length = 0;
    registration.navigationAnchor = void 0;
    for (const item of feedback) {
      if (!localIds.has(item.id)) {
        this._commentsBridge.deleteComment(planUri, item.id);
      }
    }
    this._onDidChangeFeedback.fire(planUri);
  }
  getNextFeedback(planUri, next) {
    const registration = this._getRegistration(planUri);
    const items = this.getFeedback(planUri);
    if (!registration || items.length === 0) {
      return void 0;
    }
    const anchorIdx = registration.navigationAnchor ? items.findIndex((item) => item.id === registration.navigationAnchor) : -1;
    let targetIdx;
    if (anchorIdx === -1) {
      targetIdx = next ? 0 : items.length - 1;
    } else {
      targetIdx = next ? (anchorIdx + 1) % items.length : (anchorIdx - 1 + items.length) % items.length;
    }
    const target = items[targetIdx];
    this.setNavigationAnchor(planUri, target.id);
    this._commentsBridge.revealComment(target.resource, target.id);
    return target;
  }
  getNavigationBearing(planUri) {
    const registration = this._getRegistration(planUri);
    if (!registration) {
      return { activeIdx: -1, totalCount: 0 };
    }
    const items = this.getFeedback(planUri);
    const totalCount = items.length;
    if (!registration.navigationAnchor) {
      return { activeIdx: -1, totalCount };
    }
    const activeIdx = items.findIndex((item) => item.id === registration.navigationAnchor);
    return { activeIdx, totalCount };
  }
  setNavigationAnchor(planUri, itemId) {
    const registration = this._getRegistration(planUri);
    if (registration) {
      registration.navigationAnchor = itemId;
      this._onDidChangeNavigation.fire(planUri);
    }
  }
  async submitAllFeedback(planUri) {
    const registration = this._getRegistration(planUri);
    if (!registration || this.getFeedback(planUri).length === 0 && !registration.review.hasOverallFeedback()) {
      return false;
    }
    return registration.review.submitFeedback();
  }
  submitPlanAction(planUri, action) {
    return this._getRegistration(planUri)?.review.submitAction(action) ?? Promise.resolve();
  }
  rejectPlan(planUri) {
    return this._getRegistration(planUri)?.review.reject() ?? Promise.resolve();
  }
  acceptsComments(resource) {
    return this.isActivePlanReview(resource);
  }
  getComments(resource) {
    return this._getRegistration(resource)?.items.map((item) => ({
      id: item.id,
      resource,
      range: item.range,
      body: item.text
    })) ?? [];
  }
  getCommentIds(resource) {
    return this._getRegistration(resource)?.items.map((item) => item.id) ?? [];
  }
  addComment(resource, range2, body) {
    this._addFeedback(resource, range2, body);
  }
  deleteComment(resource, id2) {
    this.removeFeedback(resource, id2);
  }
  _getRegistration(planUri) {
    return this._registrations.get(planUri.toString())?.at(-1);
  }
};

PlanReviewFeedbackService = __decorateClass([
  __decorateParam(0, IAgentEditorCommentsBridge)
], PlanReviewFeedbackService);
export { IPlanReviewFeedbackService, PlanReviewFeedbackService };
