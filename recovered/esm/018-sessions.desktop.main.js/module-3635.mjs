// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionsChatAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { CustomViewVisibleContext } from "./module-1770.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { getActiveElement, isHTMLElement } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { REPLACE_PROMPT_TEMPLATE_PLACEHOLDER_COMMAND_ID } from "./module-3580.mjs";
import { ARCHIVE_SESSION_COMMAND_ID, FOCUS_ACTIVE_SESSION_COMMAND_ID, FOCUS_NEXT_CHAT_GROUP_COMMAND_ID, FOCUS_PREVIOUS_CHAT_GROUP_COMMAND_ID, MOVE_CHAT_TO_NEXT_GROUP_COMMAND_ID, MOVE_CHAT_TO_PREVIOUS_GROUP_COMMAND_ID, RENAME_SESSION_COMMAND_ID, SPLIT_CHAT_GROUP_DOWN_COMMAND_ID, SPLIT_CHAT_GROUP_RIGHT_COMMAND_ID } from "./module-1800.mjs";
import { FOCUS_AI_CUSTOMIZATION_VIEW_ID } from "./module-3516.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/sessions/contrib/chat/browser/sessionsChatAccessibilityHelp.ts
var SessionsChatAccessibilityHelp = class {
  constructor() {
    this.priority = 120;
    this.name = "sessionsChat";
    this.type = "help" /* Help */;
    // A custom view replaces the chat surface this help describes, so it does not apply then.
    this.when = ContextKeyExpr.and(IsSessionsWindowContext, CustomViewVisibleContext.negate());
  }
  getProvider(accessor) {
    const sessionsPartService = accessor.get(ISessionsPartService);
    const sessionsService = accessor.get(ISessionsService);
    const previouslyFocused = getActiveElement();
    const content = [];
    content.push(localize(4685, null));
    content.push(localize(4677, null));
    content.push(localize(4679, null));
    content.push(localize(4666, null));
    content.push(localize(4665, null));
    content.push(localize(4660, null));
    content.push(localize(4658, null, "<keybinding:workbench.action.showHover>"));
    content.push(localize(4689, null));
    content.push(localize(4690, null, `<keybinding:${REPLACE_PROMPT_TEMPLATE_PLACEHOLDER_COMMAND_ID}>`));
    content.push(localize(4669, null));
    content.push(localize(4668, null));
    content.push(localize(4678, null));
    content.push(localize(4704, null));
    content.push(localize(4663, null));
    content.push(localize(4692, null));
    content.push(localize(4673, null));
    content.push(localize(4667, null));
    content.push(localize(4688, null, "<keybinding:workbench.action.sessions.newSession.pickFolderQuickPick>"));
    content.push(localize(4693, null, "<keybinding:sessionsView.newQuickChat>"));
    content.push(localize(4681, null));
    content.push(localize(4676, null));
    content.push(localize(4651, null));
    content.push(localize(4702, null));
    content.push(localize(4703, null));
    content.push(localize(4649, null));
    content.push(localize(4664, null, "<keybinding:sessions.action.chat.toggleDictation>"));
    content.push(localize(4701, null, "<keybinding:agentsVoice.startVoiceInChat>"));
    content.push(localize(4680, null));
    content.push(localize(4656, null));
    content.push(localize(4687, null));
    content.push(localize(4686, null, "<keybinding:editor.action.pasteAsText>"));
    content.push(localize(4652, null));
    content.push(localize(4657, null));
    content.push(localize(4696, null));
    content.push(localize(4695, null));
    content.push(localize(4698, null));
    content.push(localize(4654, null, `<keybinding:${FOCUS_PREVIOUS_CHAT_GROUP_COMMAND_ID}>`, `<keybinding:${FOCUS_NEXT_CHAT_GROUP_COMMAND_ID}>`, `<keybinding:${SPLIT_CHAT_GROUP_RIGHT_COMMAND_ID}>`, `<keybinding:${SPLIT_CHAT_GROUP_DOWN_COMMAND_ID}>`, `<keybinding:${MOVE_CHAT_TO_PREVIOUS_GROUP_COMMAND_ID}>`, `<keybinding:${MOVE_CHAT_TO_NEXT_GROUP_COMMAND_ID}>`));
    content.push(localize(4655, null));
    content.push(localize(4661, null));
    content.push(localize(4691, null));
    content.push(localize(4671, null, "<keybinding:workbench.action.chat.find>", "<keybinding:workbench.action.chat.findNext>", "<keybinding:workbench.action.chat.findPrevious>"));
    content.push(localize(4672, null, `<keybinding:${FOCUS_ACTIVE_SESSION_COMMAND_ID}>`));
    content.push(localize(4674, null, "<keybinding:sessions.goBack>"));
    content.push(localize(4675, null, "<keybinding:sessions.goForward>"));
    content.push(localize(4683, null, "<keybinding:sessionsViewPane.navigatePreviousSession>"));
    content.push(localize(4682, null, "<keybinding:sessionsViewPane.navigateNextSession>"));
    content.push(localize(4694, null, `<keybinding:${RENAME_SESSION_COMMAND_ID}>`));
    content.push(localize(4650, null, `<keybinding:${ARCHIVE_SESSION_COMMAND_ID}>`));
    content.push(localize(4662, null));
    content.push(localize(4653, null, "<keybinding:workbench.action.agentSessions.focusChangesView>"));
    content.push(localize(4700, null, "<keybinding:workbench.agentSessions.action.viewChanges>"));
    content.push(localize(4684, null, "<keybinding:workbench.agentSessions.action.openPullRequest>"));
    content.push(localize(4670, null, "<keybinding:workbench.action.agentSessions.focusChangesFileView>"));
    content.push(localize(4697, null, "<keybinding:workbench.action.chat.focusAgentSessionsViewer>"));
    content.push(localize(4659, null, `<keybinding:${FOCUS_AI_CUSTOMIZATION_VIEW_ID}>`));
    content.push(localize(4699, null, "<keybinding:workbench.action.agentToggleSidePanel>"));
    return new AccessibleContentProvider(
      "sessionsChat" /* SessionsChat */,
      { type: "help" /* Help */ },
      () => content.join("\n"),
      () => {
        if (isHTMLElement(previouslyFocused) && previouslyFocused.isConnected) {
          previouslyFocused.focus();
          return;
        }
        const view = sessionsPartService.getSessionView(sessionsService.activeSession.get()?.sessionId);
        view?.focus();
      },
      "accessibility.verbosity.sessionsChat" /* SessionsChat */
    );
  }
};
export { SessionsChatAccessibilityHelp };
