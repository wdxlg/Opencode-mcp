// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackReviewCommands.ts
import { localize } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Range2 } from "./module-0106.mjs";
import { ICodeReviewService } from "./module-3608.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackReviewCommands.ts
var REVIEWABLE_KINDS = /* @__PURE__ */ new Set(["prReview" /* PRReview */, "codeReview" /* AgentReview */]);

function kindLabel(kind) {
  switch (kind) {
    case "prReview" /* PRReview */:
      return localize(4084, null);
    case "codeReview" /* AgentReview */:
      return localize(4083, null);
    default:
      return void 0;
  }
}

function getOwningSessionResource(sessionsManagementService, resource) {
  return sessionsManagementService.getSessionForChatResource(resource)?.session.resource ?? resource;
}

function registerAgentFeedbackReviewCommands() {
  const registrations = new DisposableStore();
  registrations.add(CommandsRegistry.registerCommand("_agentFeedbackReview.getComments" /* GetComments */, (accessor, sessionOrChatResource) => {
    const feedbackService = accessor.get(IAgentFeedbackService);
    const resource = getOwningSessionResource(accessor.get(ISessionsManagementService), URI.revive(sessionOrChatResource));
    return feedbackService.getFeedback(resource).filter((item) => item.state === "created" /* Created */ && REVIEWABLE_KINDS.has(item.kind)).map((item) => ({
      id: item.id,
      kindLabel: kindLabel(item.kind),
      text: item.text,
      fileUri: item.resourceUri
    }));
  }));
  registrations.add(CommandsRegistry.registerCommand("_agentFeedbackReview.getPullRequestThreadLinks" /* GetPullRequestThreadLinks */, (accessor, sessionOrChatResource) => {
    const feedbackService = accessor.get(IAgentFeedbackService);
    const resource = getOwningSessionResource(accessor.get(ISessionsManagementService), URI.revive(sessionOrChatResource));
    return feedbackService.getFeedback(resource).filter((item) => item.kind === "prReview" /* PRReview */ && !!item.sourcePRReviewCommentId).map((item) => ({ pullRequestThreadId: item.sourcePRReviewCommentId, commentId: item.id }));
  }));
  registrations.add(CommandsRegistry.registerCommand("_agentFeedbackReview.reveal" /* Reveal */, async (accessor, sessionOrChatResource, commentId) => {
    const feedbackService = accessor.get(IAgentFeedbackService);
    const resource = getOwningSessionResource(accessor.get(ISessionsManagementService), URI.revive(sessionOrChatResource));
    await feedbackService.revealFeedback(resource, commentId);
  }));
  registrations.add(CommandsRegistry.registerCommand("_agentFeedbackReview.revealAt" /* RevealAt */, async (accessor, resourceUri, range2) => {
    const feedbackService = accessor.get(IAgentFeedbackService);
    const resource = URI.parse(resourceUri);
    const sessionResource = feedbackService.getFeedbackSessionResource(resource) ?? feedbackService.getMostRecentSessionForResource(resource);
    if (!sessionResource) {
      return;
    }
    const match2 = feedbackService.getFeedback(sessionResource).find((item) => isEqual2(item.resourceUri, resource) && Range2.equalsRange(item.range, range2));
    if (match2) {
      await feedbackService.revealFeedback(sessionResource, match2.id);
    } else {
      await feedbackService.revealSessionComment(sessionResource, "", resource, range2);
    }
  }));
  registrations.add(CommandsRegistry.registerCommand("_agentFeedbackReview.delete" /* Delete */, (accessor, sessionOrChatResource, commentId) => {
    const feedbackService = accessor.get(IAgentFeedbackService);
    const codeReviewService = accessor.get(ICodeReviewService);
    const resource = getOwningSessionResource(accessor.get(ISessionsManagementService), URI.revive(sessionOrChatResource));
    const item = feedbackService.getFeedback(resource).find((f) => f.id === commentId);
    if (item?.kind === "prReview" /* PRReview */ && item.sourcePRReviewCommentId) {
      codeReviewService.dismissPRReviewComment(resource, item.sourcePRReviewCommentId);
    }
    feedbackService.removeFeedback(resource, commentId);
  }));
  registrations.add(CommandsRegistry.registerCommand("_agentFeedbackReview.accept" /* Accept */, (accessor, sessionOrChatResource, commentIds) => {
    const feedbackService = accessor.get(IAgentFeedbackService);
    const resource = getOwningSessionResource(accessor.get(ISessionsManagementService), URI.revive(sessionOrChatResource));
    for (const id2 of commentIds) {
      feedbackService.acceptFeedback(resource, id2, { revealToAgent: true });
    }
  }));
  return registrations;
}
export { kindLabel, getOwningSessionResource, registerAgentFeedbackReviewCommands, REVIEWABLE_KINDS };
