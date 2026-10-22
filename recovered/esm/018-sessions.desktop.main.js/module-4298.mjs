// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorActions.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { Action2, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { getActiveResourceCandidates, getFeedbackSessionCandidates } from "./module-3587.mjs";
import { getSessionEditorComments } from "./module-3609.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Menus } from "./module-3437.mjs";
import { IPlanReviewFeedbackService } from "./module-2110.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorActions.ts
var submitFeedbackActionId = "agentFeedbackEditor.action.submit";

var navigatePreviousFeedbackActionId = "agentFeedbackEditor.action.navigatePrevious";

var navigateNextFeedbackActionId = "agentFeedbackEditor.action.navigateNext";

var clearAllFeedbackActionId = "agentFeedbackEditor.action.clearAll";

var navigationBearingFakeActionId3 = "agentFeedbackEditor.navigation.bearings";

var hasSessionEditorComments = new RawContextKey("agentFeedbackEditor.hasSessionComments", false);

var hasUnsubmittedAgentFeedback = new RawContextKey("agentFeedbackEditor.hasUnsubmittedAgentFeedback", false);

var hasActiveSessionAgentFeedback = new RawContextKey("agentFeedbackEditor.hasActiveSessionAgentFeedback", false);

var submitActiveSessionFeedbackActionId = "agentFeedbackEditor.action.submitActiveSession";

var AgentFeedbackEditorAction = class extends Action2 {
  constructor(desc) {
    super({
      category: CHAT_CATEGORY,
      ...desc
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const codeReviewService = accessor.get(ICodeReviewService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const activePane = editorService.activeEditorPane ?? editorGroupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).find((g) => g.activeEditorPane)?.activeEditorPane ?? editorService.visibleEditorPanes[0];
    const candidates = getActiveResourceCandidates(activePane?.input);
    const sessionCandidates = getFeedbackSessionCandidates(candidates, (candidate) => agentFeedbackService.getFeedbackSessionResource(candidate) ?? agentFeedbackService.getMostRecentSessionForResource(candidate));
    for (const { resource, sessionResource } of sessionCandidates) {
      const comments = getSessionEditorComments(
        sessionResource,
        agentFeedbackService.getFeedback(sessionResource),
        codeReviewService.getPRReviewState(sessionResource).get(),
        agentFeedbackService.getVisibleResolvedFeedbackIds(sessionResource)
      );
      if (comments.length > 0) {
        return this.runWithSession(accessor, sessionResource, resource);
      }
    }
  }
};

var SubmitFeedbackAction = class extends AgentFeedbackEditorAction {
  constructor() {
    super({
      id: submitFeedbackActionId,
      title: localize2(4049, "Submit Feedback"),
      shortTitle: localize2(4051, "Submit"),
      icon: Codicon.send,
      precondition: ChatContextKeys.enabled,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorContextKeys.editorTextFocus, hasUnsubmittedAgentFeedback),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */
      },
      menu: {
        id: Menus.AgentFeedbackEditorContent,
        group: "a_submit",
        order: 0,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasUnsubmittedAgentFeedback)
      }
    });
  }
  async runWithSession(accessor, sessionResource, resource) {
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const planReviewFeedbackService = accessor.get(IPlanReviewFeedbackService);
    if (planReviewFeedbackService.isActivePlanReview(resource)) {
      return planReviewFeedbackService.submitAllFeedback(resource);
    }
    return agentFeedbackService.submitFeedback(sessionResource);
  }
};

var NavigateFeedbackAction = class extends AgentFeedbackEditorAction {
  constructor(_next) {
    super({
      id: _next ? navigateNextFeedbackActionId : navigatePreviousFeedbackActionId,
      title: _next ? localize2(4047, "Go to Next Feedback Comment") : localize2(4048, "Go to Previous Feedback Comment"),
      icon: _next ? Codicon.arrowDown : Codicon.arrowUp,
      f1: true,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: Menus.AgentFeedbackEditorContent,
        group: "navigate",
        order: _next ? 2 : 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasSessionEditorComments)
      }
    });
    this._next = _next;
  }
  async runWithSession(accessor, sessionResource) {
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const codeReviewService = accessor.get(ICodeReviewService);
    const comments = getSessionEditorComments(
      sessionResource,
      agentFeedbackService.getFeedback(sessionResource),
      codeReviewService.getPRReviewState(sessionResource).get(),
      agentFeedbackService.getVisibleResolvedFeedbackIds(sessionResource)
    );
    const comment = agentFeedbackService.getNextNavigableItem(sessionResource, comments, this._next);
    if (!comment) {
      return;
    }
    await agentFeedbackService.revealSessionComment(sessionResource, comment.id, comment.resourceUri, comment.range);
  }
};

var ClearAllFeedbackAction = class extends AgentFeedbackEditorAction {
  constructor() {
    super({
      id: clearAllFeedbackActionId,
      title: localize2(4045, "Clear"),
      tooltip: localize2(4046, "Clear All Feedback"),
      icon: Codicon.clearAll,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled),
      menu: {
        id: Menus.AgentFeedbackEditorContent,
        group: "a_submit",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasUnsubmittedAgentFeedback)
      }
    });
  }
  runWithSession(accessor, sessionResource) {
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    agentFeedbackService.clearFeedback(sessionResource);
  }
};

var SubmitActiveSessionFeedbackAction = class _SubmitActiveSessionFeedbackAction extends Action2 {
  static {
    this.ID = submitActiveSessionFeedbackActionId;
  }
  constructor() {
    super({
      id: _SubmitActiveSessionFeedbackAction.ID,
      title: localize2(4050, "Submit Feedback"),
      icon: Codicon.comment,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, hasActiveSessionAgentFeedback)
    });
  }
  async run(accessor) {
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const sessionResource = agentFeedbackService.activeFeedbackSessionResource.get();
    const hasAcceptedFeedback = agentFeedbackService.getFeedback(sessionResource).some((item) => item.state === "accepted" /* Accepted */);
    if (!hasAcceptedFeedback) {
      return;
    }
    await agentFeedbackService.submitFeedback(sessionResource);
  }
};

function registerAgentFeedbackEditorActions() {
  registerAction2(SubmitFeedbackAction);
  registerAction2(SubmitActiveSessionFeedbackAction);
  registerAction2(class extends NavigateFeedbackAction {
    constructor() {
      super(false);
    }
  });
  registerAction2(class extends NavigateFeedbackAction {
    constructor() {
      super(true);
    }
  });
  registerAction2(ClearAllFeedbackAction);
  MenuRegistry.appendMenuItem(Menus.AgentFeedbackEditorContent, {
    command: {
      id: navigationBearingFakeActionId3,
      title: localize(4052, null),
      precondition: ContextKeyExpr.false()
    },
    group: "navigate",
    order: -1,
    when: ContextKeyExpr.and(ChatContextKeys.enabled, hasSessionEditorComments)
  });
}
export { registerAgentFeedbackEditorActions, submitFeedbackActionId, navigatePreviousFeedbackActionId, navigateNextFeedbackActionId, clearAllFeedbackActionId, navigationBearingFakeActionId3, hasSessionEditorComments, hasUnsubmittedAgentFeedback, hasActiveSessionAgentFeedback, submitActiveSessionFeedbackActionId, AgentFeedbackEditorAction, SubmitFeedbackAction, NavigateFeedbackAction, ClearAllFeedbackAction, SubmitActiveSessionFeedbackAction };
