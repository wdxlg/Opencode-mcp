// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackPRReviewSeeder.ts
import { Disposable } from "./module-0012.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackPRReviewSeeder.ts
var AgentFeedbackPRReviewSeederContribution = class extends Disposable {
  constructor(_agentFeedbackService, _codeReviewService, _sessionsService) {
    super();
    this._agentFeedbackService = _agentFeedbackService;
    this._codeReviewService = _codeReviewService;
    this._sessionsService = _sessionsService;
    const feedbackChanged = observableSignalFromEvent(this, this._agentFeedbackService.onDidChangeFeedback);
    this._register(autorun((reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession || !isAgentHostProviderId(activeSession.providerId)) {
        return;
      }
      const sessionResource = activeSession.resource;
      const prReviewState = this._codeReviewService.getPRReviewState(sessionResource).read(reader);
      feedbackChanged.read(reader);
      if (prReviewState.kind !== "loaded" /* Loaded */) {
        return;
      }
      this._sync(sessionResource, prReviewState.comments, prReviewState.incompletePullRequests);
    }));
  }
  static {
    this.ID = "workbench.contrib.agentFeedbackPRReviewSeeder";
  }
  _sync(sessionResource, comments, incompletePullRequests) {
    if (!this._agentFeedbackService.hasLoadedFeedback(sessionResource)) {
      return;
    }
    const feedback = this._agentFeedbackService.getFeedback(sessionResource);
    const mirroredSourceIds = /* @__PURE__ */ new Set();
    const mirrorBySource = /* @__PURE__ */ new Map();
    const createdMirrorBySource = /* @__PURE__ */ new Map();
    const duplicateCreatedMirrors = [];
    for (const item of feedback) {
      if (item.kind === "prReview" /* PRReview */ && item.sourcePRReviewCommentId) {
        mirroredSourceIds.add(item.sourcePRReviewCommentId);
        if (!mirrorBySource.has(item.sourcePRReviewCommentId)) {
          mirrorBySource.set(item.sourcePRReviewCommentId, item);
        }
        if (item.state === "created" /* Created */) {
          if (createdMirrorBySource.has(item.sourcePRReviewCommentId)) {
            duplicateCreatedMirrors.push(item);
          } else {
            createdMirrorBySource.set(item.sourcePRReviewCommentId, item);
          }
        }
      }
    }
    for (const duplicate of duplicateCreatedMirrors) {
      this._agentFeedbackService.removeFeedback(sessionResource, duplicate.id);
    }
    for (const comment of comments) {
      const mirror = mirrorBySource.get(comment.id);
      if (mirror && !mirror.sourcePullRequest) {
        this._agentFeedbackService.updateFeedbackSourcePullRequest(sessionResource, mirror.id, {
          owner: comment.pullRequest.owner,
          repo: comment.pullRequest.repo,
          number: comment.pullRequest.number
        });
      }
      const createdMirror = createdMirrorBySource.get(comment.id);
      if (createdMirror) {
        if (createdMirror.text !== comment.body) {
          this._agentFeedbackService.updateFeedback(sessionResource, createdMirror.id, comment.body);
        }
        continue;
      }
      if (!mirroredSourceIds.has(comment.id)) {
        this._agentFeedbackService.addFeedback(
          sessionResource,
          comment.uri,
          comment.range,
          comment.body,
          void 0,
          void 0,
          comment.id,
          "prReview" /* PRReview */,
          "created" /* Created */,
          {
            owner: comment.pullRequest.owner,
            repo: comment.pullRequest.repo,
            number: comment.pullRequest.number
          }
        );
      }
    }
    const incompletePullRequestKeys = new Set(incompletePullRequests.map((pullRequest) => this._pullRequestKey(pullRequest)));
    const liveSourceIds = new Set(comments.map((comment) => comment.id));
    for (const item of feedback) {
      if (item.kind === "prReview" /* PRReview */ && item.state === "created" /* Created */ && item.sourcePRReviewCommentId && !liveSourceIds.has(item.sourcePRReviewCommentId)) {
        if (!item.sourcePullRequest ? incompletePullRequestKeys.size > 0 : incompletePullRequestKeys.has(this._pullRequestKey(item.sourcePullRequest))) {
          continue;
        }
        this._agentFeedbackService.removeFeedback(sessionResource, item.id);
      }
    }
  }
  _pullRequestKey(pullRequest) {
    return `${pullRequest.owner.toLowerCase()}/${pullRequest.repo.toLowerCase()}#${pullRequest.number}`;
  }
};

AgentFeedbackPRReviewSeederContribution = __decorateClass([
  __decorateParam(0, IAgentFeedbackService),
  __decorateParam(1, ICodeReviewService),
  __decorateParam(2, ISessionsService)
], AgentFeedbackPRReviewSeederContribution);
export { AgentFeedbackPRReviewSeederContribution };
