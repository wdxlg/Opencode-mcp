// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedback.contribution.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { hasActiveSessionAgentFeedback, registerAgentFeedbackEditorActions, submitActiveSessionFeedbackActionId } from "./module-4298.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { AgentFeedbackService, IAgentFeedbackService } from "./module-3611.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AgentFeedbackEditorOverlay } from "./module-4299.mjs";
import { AgentFeedbackAttachmentContribution } from "./module-4292.mjs";
import { AgentFeedbackPRThreadResolverContribution } from "./module-4294.mjs";
import { AgentFeedbackPRReviewSeederContribution } from "./module-4295.mjs";
import { AgentEditorCommentsProviderContribution } from "./module-4293.mjs";
import { registerAgentFeedbackReviewCommands } from "./module-4300.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { AgentFeedbackAttachmentWidget } from "./module-4297.mjs";
import { IChatAttachmentWidgetRegistry } from "./module-2028.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedback.contribution.ts
var ActiveSessionFeedbackContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.activeSessionFeedbackContext";
  }
  constructor(contextKeyService, agentFeedbackService, sessionsService) {
    super();
    const contextKey = hasActiveSessionAgentFeedback.bindTo(contextKeyService);
    const menuRegistration = this._register(new MutableDisposable());
    const feedbackChanged = observableFromEvent(
      this,
      Event2.any(agentFeedbackService.onDidChangeFeedback, agentFeedbackService.onDidChangeFeedbackScope),
      (e4) => e4
    );
    this._register(autorun((reader) => {
      feedbackChanged.read(reader);
      menuRegistration.clear();
      const sessionResource = agentFeedbackService.activeFeedbackSessionResource.read(reader);
      const feedback = agentFeedbackService.getFeedback(sessionResource);
      const count2 = feedback.filter((item) => item.state === "accepted" /* Accepted */).length;
      contextKey.set(count2 > 0);
      if (count2 > 0) {
        menuRegistration.value = MenuRegistry.appendMenuItem(MenuId.AgentsChangesPrimaryActionSubMenu, {
          command: {
            id: submitActiveSessionFeedbackActionId,
            icon: Codicon.comment,
            title: localize(4036, null, count2)
          },
          group: "navigation",
          order: 3,
          when: ContextKeyExpr.and(IsSessionsWindowContext, hasActiveSessionAgentFeedback)
        });
      }
    }));
  }
};

ActiveSessionFeedbackContextContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IAgentFeedbackService),
  __decorateParam(2, ISessionsService)
], ActiveSessionFeedbackContextContribution);

registerWorkbenchContribution2(ActiveSessionFeedbackContextContribution.ID, ActiveSessionFeedbackContextContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentFeedbackEditorOverlay.ID, AgentFeedbackEditorOverlay, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentFeedbackAttachmentContribution.ID, AgentFeedbackAttachmentContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentFeedbackPRThreadResolverContribution.ID, AgentFeedbackPRThreadResolverContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentFeedbackPRReviewSeederContribution.ID, AgentFeedbackPRReviewSeederContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentEditorCommentsProviderContribution.ID, AgentEditorCommentsProviderContribution, WorkbenchPhase.BlockRestore);

registerAgentFeedbackEditorActions();

registerAgentFeedbackReviewCommands();

registerSingleton(IAgentFeedbackService, AgentFeedbackService, 1 /* Delayed */);

var AgentFeedbackAttachmentWidgetContribution = class {
  static {
    this.ID = "workbench.contrib.agentFeedbackAttachmentWidgetFactory";
  }
  constructor(registry4, instantiationService) {
    registry4.registerFactory("agentFeedback", (attachment, options3, container2) => {
      return instantiationService.createInstance(AgentFeedbackAttachmentWidget, attachment, options3, container2);
    });
  }
};

AgentFeedbackAttachmentWidgetContribution = __decorateClass([
  __decorateParam(0, IChatAttachmentWidgetRegistry),
  __decorateParam(1, IInstantiationService)
], AgentFeedbackAttachmentWidgetContribution);

registerWorkbenchContribution2(AgentFeedbackAttachmentWidgetContribution.ID, AgentFeedbackAttachmentWidgetContribution, WorkbenchPhase.AfterRestored);
export { ActiveSessionFeedbackContextContribution, AgentFeedbackAttachmentWidgetContribution };
