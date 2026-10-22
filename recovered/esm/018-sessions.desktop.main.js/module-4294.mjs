// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackPRThreadResolver.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackPRThreadResolver.ts
var AgentFeedbackPRThreadResolverContribution = class extends Disposable {
  constructor(_agentFeedbackService, _codeReviewService, _logService) {
    super();
    this._agentFeedbackService = _agentFeedbackService;
    this._codeReviewService = _codeReviewService;
    this._logService = _logService;
    /** Per session: last-seen PR-review comments by feedback id. */
    this._seenBySession = /* @__PURE__ */ new Map();
    /** Per session: thread ids we have already requested resolution for. */
    this._requestedBySession = /* @__PURE__ */ new Map();
    this._register(this._agentFeedbackService.onDidChangeFeedback((e4) => this._onDidChangeFeedback(e4)));
  }
  static {
    this.ID = "workbench.contrib.agentFeedbackPRThreadResolver";
  }
  _onDidChangeFeedback(e4) {
    const key3 = e4.sessionResource.toString();
    const previous = this._seenBySession.get(key3) ?? /* @__PURE__ */ new Map();
    const next = /* @__PURE__ */ new Map();
    const threadsToResolve = /* @__PURE__ */ new Map();
    for (const item of e4.feedbackItems) {
      if (item.kind !== "prReview" /* PRReview */ || !item.sourcePRReviewCommentId) {
        continue;
      }
      const threadId = item.sourcePRReviewCommentId;
      next.set(item.id, { state: item.state, threadId, pullRequest: item.sourcePullRequest });
      const before = previous.get(item.id);
      if (item.state === "resolved" /* Resolved */ && before && before.state !== "resolved" /* Resolved */) {
        threadsToResolve.set(threadId, item.sourcePullRequest);
      }
    }
    for (const [id2, before] of previous) {
      if (next.has(id2)) {
        continue;
      }
      if (before.state === "submitted" /* Submitted */ || before.state === "resolved" /* Resolved */) {
        threadsToResolve.set(before.threadId, before.pullRequest);
      }
    }
    this._seenBySession.set(key3, next);
    if (threadsToResolve.size === 0) {
      return;
    }
    let requested = this._requestedBySession.get(key3);
    if (!requested) {
      requested = /* @__PURE__ */ new Set();
      this._requestedBySession.set(key3, requested);
    }
    for (const [threadId, pullRequest] of threadsToResolve) {
      if (requested.has(threadId)) {
        continue;
      }
      requested.add(threadId);
      this._resolveThread(e4.sessionResource, threadId, pullRequest);
    }
  }
  _resolveThread(sessionResource, threadId, pullRequest) {
    this._codeReviewService.resolvePRReviewThread(sessionResource, threadId, pullRequest).catch((err) => this._logService.warn("[AgentFeedback] Failed to resolve PR review thread on GitHub", threadId, err));
  }
};

AgentFeedbackPRThreadResolverContribution = __decorateClass([
  __decorateParam(0, IAgentFeedbackService),
  __decorateParam(1, ICodeReviewService),
  __decorateParam(2, ILogService)
], AgentFeedbackPRThreadResolverContribution);
export { AgentFeedbackPRThreadResolverContribution };
