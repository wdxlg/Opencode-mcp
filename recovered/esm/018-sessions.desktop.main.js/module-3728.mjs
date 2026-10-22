// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessions.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { SessionsView, SessionsViewId } from "./module-3529.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { SESSIONS_LIST_SHOW_EMPTY_DEFAULT_GROUPS_SETTING } from "./module-3523.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AutomationsCustomViewContribution } from "./module-3723.mjs";
import { SessionsTitleBarContribution } from "./module-3718.mjs";
import { NewSessionActionViewItemContribution, SessionConversationActionsContribution } from "./module-3711.mjs";
import { SessionsMouseNavigationContribution } from "./module-3725.mjs";
import { SessionsTelemetryContribution } from "./module-3720.mjs";
import { SessionsWindowNotifier } from "./module-3727.mjs";


// src/vs/sessions/contrib/sessions/browser/sessions.contribution.ts
var agentSessionsViewIcon = registerIcon("chat-sessions-icon", Codicon.commentDiscussionSparkle, localize(5331, null));

var AGENT_SESSIONS_VIEW_TITLE = localize2(5330, "Sessions");

var SessionsContainerId = "agentic.workbench.view.sessionsContainer";

var agentSessionsViewContainer = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: SessionsContainerId,
  title: AGENT_SESSIONS_VIEW_TITLE,
  icon: agentSessionsViewIcon,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [SessionsContainerId, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: SessionsContainerId,
  hideIfEmpty: true,
  order: 6,
  openCommandActionDescriptor: {
    id: SessionsContainerId,
    mnemonicTitle: localize(5332, null),
    keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 54 /* KeyX */ },
    order: 0
  },
  windowEnablement: 2 /* Sessions */
}, 0 /* Sidebar */, { isDefault: true });

var sessionsViewPaneDescriptor = {
  id: SessionsViewId,
  containerIcon: agentSessionsViewIcon,
  containerTitle: AGENT_SESSIONS_VIEW_TITLE.value,
  singleViewPaneContainerTitle: AGENT_SESSIONS_VIEW_TITLE.value,
  name: AGENT_SESSIONS_VIEW_TITLE,
  canToggleVisibility: true,
  canMoveView: false,
  ctorDescriptor: new SyncDescriptor(SessionsView),
  windowEnablement: 2 /* Sessions */
};

Registry.as(Extensions13.ViewsRegistry).registerViews([sessionsViewPaneDescriptor], agentSessionsViewContainer);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "sessions",
  properties: {
    [SESSIONS_LIST_SHOW_EMPTY_DEFAULT_GROUPS_SETTING]: {
      type: "boolean",
      tags: ["preview"],
      description: localize(5333, null),
      default: true,
      experiment: { mode: "auto" }
    }
  }
});

registerWorkbenchContribution2(AutomationsCustomViewContribution.ID, AutomationsCustomViewContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(SessionsTitleBarContribution.ID, SessionsTitleBarContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(NewSessionActionViewItemContribution.ID, NewSessionActionViewItemContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(SessionsMouseNavigationContribution.ID, SessionsMouseNavigationContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(SessionsTelemetryContribution.ID, SessionsTelemetryContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(SessionsWindowNotifier.ID, SessionsWindowNotifier, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(SessionConversationActionsContribution.ID, SessionConversationActionsContribution, WorkbenchPhase.AfterRestored);
export { agentSessionsViewIcon, AGENT_SESSIONS_VIEW_TITLE, SessionsContainerId, agentSessionsViewContainer, sessionsViewPaneDescriptor };
