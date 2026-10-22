// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewTourShared.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { AgentHostSessionTypesAvailableContext, IsNewChatSessionContext, SessionHasWorkspaceContext, SessionWorkspacePickerVisibleContext } from "./module-1770.mjs";
import { ChatEntitlementContextKeys } from "./module-0954.mjs";
import { EditorPartModalVisibleContext } from "./module-0950.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewTourShared.ts
function createNewSessionViewRecentTourWhen() {
  return ContextKeyExpr.and(
    ChatContextKeys.enabled,
    IsNewChatSessionContext,
    AgentHostSessionTypesAvailableContext,
    ChatEntitlementContextKeys.Entitlement.signedOut.toNegated(),
    EditorPartModalVisibleContext.toNegated()
  );
}

function createNewSessionViewWorkspaceStep() {
  return {
    id: "workspacePicker",
    targetId: "sessions.newSession.workspacePicker",
    title: localize(4880, null),
    description: localize(4879, null),
    placement: "above",
    when: ContextKeyExpr.and(SessionWorkspacePickerVisibleContext, SessionHasWorkspaceContext.toNegated()),
    missingTarget: { kind: "skip" },
    openTarget: true,
    allowTargetInteraction: true,
    advanceWhen: SessionHasWorkspaceContext
  };
}
export { createNewSessionViewRecentTourWhen, createNewSessionViewWorkspaceStep };
