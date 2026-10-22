// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatProgressTypes/chatPlanReviewData.ts
import { DeferredPromise } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/chat/common/model/chatProgressTypes/chatPlanReviewData.ts
var ChatPlanReviewData = class {
  constructor(title, content2, actions, canProvideFeedback, planUri, resolveId, data, isUsed, source, isOutdated) {
    this.title = title;
    this.content = content2;
    this.actions = actions;
    this.canProvideFeedback = canProvideFeedback;
    this.planUri = planUri;
    this.resolveId = resolveId;
    this.data = data;
    this.isUsed = isUsed;
    this.source = source;
    this.isOutdated = isOutdated;
    this.kind = "planReview";
    this.completion = new DeferredPromise();
    this._onDidDismiss = new Emitter();
    this.onDidDismiss = this._onDidDismiss.event;
  }
  /** Dismiss without a user choice (e.g. the response was cancelled). */
  dismiss() {
    if (this.isUsed) {
      return;
    }
    this.isUsed = true;
    this.draftFeedback = void 0;
    this.draftCollapsed = void 0;
    void this.completion.complete(void 0);
    this._onDidDismiss.fire();
  }
  toJSON() {
    return {
      kind: this.kind,
      title: this.title,
      content: this.content,
      actions: this.actions,
      canProvideFeedback: this.canProvideFeedback,
      planUri: this.planUri,
      resolveId: this.resolveId,
      data: this.data,
      isUsed: this.isUsed,
      isOutdated: this.isOutdated,
      source: this.source
    };
  }
};
export { ChatPlanReviewData };
