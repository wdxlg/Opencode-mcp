// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/codeReview/browser/codeReview.contributions.ts
import { registerSingleton } from "./module-0135.mjs";
import { CodeReviewService, ICodeReviewService } from "./module-3608.mjs";
import { IsPhoneLayoutContext, SessionHasChangesContext, SessionIsCreatedContext, SessionProviderIdContext, SessionWorkspaceIsVirtualContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ActiveEditorContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, IsTopRightEditorGroupContext } from "./module-0950.mjs";
import { ANY_AGENT_HOST_PROVIDER_RE } from "./module-1764.mjs";
import { SessionChangesEditorInput } from "./module-3586.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Menus } from "./module-3437.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/sessions/contrib/codeReview/browser/codeReview.contributions.ts
registerSingleton(ICodeReviewService, CodeReviewService, 1 /* Delayed */);

var CODE_REVIEW_QUERY = "/code-review";

var singlePaneDetailPanel = SinglePaneLayoutEnabledContext;

var codeReviewChangesToolbarWhen = ContextKeyExpr.and(
  IsSessionsWindowContext,
  SessionWorkspaceIsVirtualContext.toNegated(),
  IsPhoneLayoutContext.negate(),
  SessionIsCreatedContext,
  ContextKeyExpr.regex(SessionProviderIdContext.key, ANY_AGENT_HOST_PROVIDER_RE),
  singlePaneDetailPanel.negate()
);

var singlePaneCodeReviewWhen = ContextKeyExpr.and(
  IsSessionsWindowContext,
  ActiveEditorContext.isEqualTo(SessionChangesEditorInput.EDITOR_ID),
  singlePaneDetailPanel,
  IsAuxiliaryWindowContext.toNegated(),
  IsTopRightEditorGroupContext,
  SessionWorkspaceIsVirtualContext.toNegated(),
  SessionIsCreatedContext,
  SessionHasChangesContext
);

var RunSessionCodeReviewAction = class _RunSessionCodeReviewAction extends Action2 {
  static {
    this.ID = "sessions.codeReview.run";
  }
  constructor() {
    super({
      id: _RunSessionCodeReviewAction.ID,
      title: localize2(4748, "Run Code Review"),
      tooltip: localize(4749, null),
      category: CHAT_CATEGORY,
      icon: Codicon.codeReview,
      precondition: ContextKeyExpr.or(ChatContextKeys.hasAgentSessionChanges, SessionHasChangesContext),
      menu: [
        {
          id: MenuId.AgentsChangesToolbar,
          group: "navigation",
          order: 7,
          when: codeReviewChangesToolbarWhen
        },
        {
          id: Menus.SessionsEditorTitle,
          group: "navigation",
          order: 10,
          when: singlePaneCodeReviewWhen
        }
      ]
    });
  }
  async run(accessor, sessionResource) {
    const sessionManagementService = accessor.get(ISessionsManagementService);
    const sessionsService = accessor.get(ISessionsService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const sessionChangesService = accessor.get(ISessionChangesService);
    const candidateResource = URI.isUri(sessionResource) ? sessionResource : sessionsService.activeSession.get()?.resource;
    const resource = candidateResource ? sessionChangesService.getSessionResource(candidateResource) ?? candidateResource : void 0;
    if (!resource) {
      return;
    }
    const session = sessionManagementService.getSession(resource);
    if (!session) {
      return;
    }
    if (session.capabilities.get().supportsMultipleChats) {
      await sessionManagementService.sendNewChatRequest(session, { query: CODE_REVIEW_QUERY });
    } else {
      chatWidgetService.getWidgetBySessionResource(session.resource)?.acceptInput(CODE_REVIEW_QUERY);
    }
  }
};

registerAction2(RunSessionCodeReviewAction);
export { CODE_REVIEW_QUERY, singlePaneDetailPanel, codeReviewChangesToolbarWhen, singlePaneCodeReviewWhen, RunSessionCodeReviewAction };
