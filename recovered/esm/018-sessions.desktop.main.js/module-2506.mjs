// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0966.mjs";
import { localize } from "./module-0001.mjs";
import { FocusAgentSessionsAction } from "./module-2505.mjs";
import { OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED } from "./module-0965.mjs";
import { TerminalContribCommandId } from "./module-1173.mjs";
import { ChatEditingShowChangesAction, ViewPreviousEditsAction } from "./module-2050.mjs";
import { AccessibleDiffViewerNext } from "./module-0528.mjs";
import { AGENT_SESSION_RENAME_ACTION_ID } from "./module-0983.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isStickyPromptHeaderShown } from "./module-2504.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";
import { INLINE_CHAT_ID } from "./module-1978.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp.ts
var PanelChatAccessibilityHelp = class {
  constructor() {
    this.priority = 107;
    this.name = "panelChat";
    this.type = "help" /* Help */;
    this.when = ContextKeyExpr.and(ChatContextKeys.location.isEqualTo("panel" /* Chat */), ChatContextKeys.inQuickChat.negate(), ChatContextKeys.chatModeKind.isEqualTo("ask" /* Ask */), ContextKeyExpr.or(ChatContextKeys.inChatSession, ChatContextKeys.isResponse, ChatContextKeys.isRequest));
  }
  getProvider(accessor) {
    return getChatAccessibilityHelpProvider(accessor, void 0, "panelChat");
  }
};

var QuickChatAccessibilityHelp = class {
  constructor() {
    this.priority = 107;
    this.name = "quickChat";
    this.type = "help" /* Help */;
    this.when = ContextKeyExpr.and(ChatContextKeys.inQuickChat, ContextKeyExpr.or(ChatContextKeys.inChatSession, ChatContextKeys.isResponse, ChatContextKeys.isRequest));
  }
  getProvider(accessor) {
    return getChatAccessibilityHelpProvider(accessor, void 0, "quickChat");
  }
};

var EditsChatAccessibilityHelp = class {
  constructor() {
    this.priority = 119;
    this.name = "editsView";
    this.type = "help" /* Help */;
    this.when = ContextKeyExpr.and(ChatContextKeyExprs.inEditingMode, ChatContextKeys.inChatInput);
  }
  getProvider(accessor) {
    return getChatAccessibilityHelpProvider(accessor, void 0, "editsView");
  }
};

var AgentChatAccessibilityHelp = class {
  constructor() {
    this.priority = 120;
    this.name = "agentView";
    this.type = "help" /* Help */;
    this.when = ContextKeyExpr.and(ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */), ChatContextKeys.inChatInput);
  }
  getProvider(accessor) {
    return getChatAccessibilityHelpProvider(accessor, void 0, "agentView");
  }
};

function getAccessibilityHelpText2(type, keybindingService, supportsFileReferences, isSessionsWindow = false, stickyPromptHeaderShown = false) {
  const content = [];
  if (type === "panelChat" || type === "quickChat" || type === "editsView" || type === "agentView") {
    content.push(localize(8437, null));
  }
  if (type === "panelChat" || type === "quickChat" || type === "agentView") {
    if (type === "quickChat") {
      content.push(localize(8446, null));
      content.push(localize(8435, null));
    } else {
      content.push(localize(8434, null));
      content.push(localize(8502, null, "<keybinding:workbench.action.chat.newChat>"));
      content.push(localize(8499, null, `<keybinding:${FocusAgentSessionsAction.id}>`));
      content.push(localize(8436, null));
      if (OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED) {
        content.push(localize(8510, null, "<keybinding:workbench.action.openAgentsWindow>"));
      }
      content.push(localize(8505, null, "<keybinding:workbench.action.chat.openAgentHostFolderPicker>"));
      content.push(localize(8427, null));
    }
    content.push(localize(8452, null));
    content.push(localize(8462, null, "<keybinding:editor.action.showContextMenu>"));
    if (supportsFileReferences) {
      content.push(localize(8430, null));
      content.push(localize(8429, null, "<keybinding:editor.action.showHover>"));
    }
    content.push(localize(8432, null));
    content.push(localize(8508, null, "<keybinding:workbench.action.chat.toggleSpeechToText>"));
    content.push(localize(8496, null, "<keybinding:workbench.action.chat.cancelSpeechToText>"));
    content.push(localize(8455, null, "<keybinding:editor.action.showContextMenu>"));
    content.push(localize(8460, null));
    content.push(localize(8459, null, "<keybinding:workbench.action.chat.voiceInputMode.holdToTalk>"));
    content.push(localize(8461, null));
    if (type === "agentView") {
      content.push(localize(8458, null));
    }
    content.push(localize(8443, null, "<keybinding:editor.action.accessibleView>"));
    content.push(localize(8444, null));
    content.push(localize(8433, null));
    content.push(localize(8457, null));
    content.push(localize(8498, null, getChatFocusKeybindingLabel(keybindingService, type, "last")));
    content.push(localize(8501, null, getChatFocusKeybindingLabel(keybindingService, type, "lastFocused")));
    content.push(localize(8500, null, getChatFocusKeybindingLabel(keybindingService, type, "input")));
    content.push(localize(8450, null));
    content.push(localize(8428, null));
    content.push(localize(8503, null, "<keybinding:workbench.action.chat.nextCodeBlock>"));
    content.push(localize(8504, null, "<keybinding:workbench.action.chat.nextUserPrompt>"));
    content.push(localize(8506, null, "<keybinding:workbench.action.chat.previousUserPrompt>"));
    if (stickyPromptHeaderShown) {
      content.push(localize(8456, null));
    }
    content.push(localize(8495, null, "<keybinding:workbench.action.chat.focusConfirmation>"));
    content.push(localize(8453, null, "<keybinding:workbench.action.terminal.chat.viewHiddenChatTerminals>"));
    content.push(localize(8439, null, `<keybinding:${TerminalContribCommandId.FocusMostRecentChatTerminal}>`));
    content.push(localize(8440, null, `<keybinding:${TerminalContribCommandId.FocusMostRecentChatTerminalOutput}>`));
    content.push(localize(8442, null, "<keybinding:workbench.action.chat.focusQuestionCarousel>"));
    content.push(localize(8449, null, "<keybinding:workbench.action.chat.previousQuestion>"));
    content.push(localize(8445, null, "<keybinding:workbench.action.chat.nextQuestion>"));
    content.push(localize(8448, null));
    content.push(localize(8441, null, "<keybinding:workbench.action.chat.focusTip>"));
    if (isSessionsWindow) {
      content.push(localize(8493, null));
      content.push(localize(8492, null));
      content.push(localize(8494, null));
    }
  }
  if (type === "editsView" || type === "agentView") {
    if (type === "agentView") {
      content.push(localize(8467, null));
    } else {
      content.push(localize(8478, null));
    }
    content.push(localize(8475, null));
    content.push(localize(8474, null));
    content.push(localize(8480, null));
    content.push(localize(8482, null, "<keybinding:chatEditor.action.navigatePrevious>", "<keybinding:chatEditor.action.navigateNext>"));
    content.push(localize(8472, null, "<keybinding:chatEditor.action.acceptHunk>", "<keybinding:chatEditor.action.undoHunk>", "<keybinding:chatEditor.action.toggleDiff>"));
    content.push(localize(8483, null));
    if (type === "agentView") {
      content.push(localize(8469, null));
      content.push(localize(8468, null, "<keybinding:workbench.action.chat.acceptTool>"));
      content.push(localize(8463, null, "<keybinding:workbench.action.chat.acceptTool>"));
      content.push(localize(8466, null));
      content.push(localize(8465, null, "<keybinding:workbench.action.chat.focusTodosView>"));
    }
    content.push(localize(8476, null));
    content.push(localize(8509, null, "<keybinding:workbench.action.chat.undoEdits>"));
    content.push(localize(8507, null, "<keybinding:workbench.action.chat.restoreLastCheckpoint>"));
    content.push(localize(8497, null, "<keybinding:workbench.action.chat.editing.attachFiles>"));
    content.push(localize(8479, null, "<keybinding:chatEditing.removeFileFromWorkingSet>"));
    content.push(localize(8471, null, "<keybinding:chatEditing.acceptFile>", "<keybinding:chatEditing.discardFile>"));
    content.push(localize(8481, null, "<keybinding:chatEditing.saveAllFiles>"));
    content.push(localize(8470, null, "<keybinding:chatEditing.acceptAllFiles>"));
    content.push(localize(8473, null, "<keybinding:chatEditing.discardAllFiles>"));
    content.push(localize(8477, null, "<keybinding:chatEditing.openFileInDiff>"));
    content.push(`- ${ChatEditingShowChangesAction.LABEL}<keybinding:chatEditing.viewChanges>`);
    content.push(`- ${ViewPreviousEditsAction.Label}<keybinding:chatEditing.viewPreviousEdits>`);
  } else {
    content.push(localize(8489, null));
    content.push(localize(8484, null, "<keybinding:inlineChat.start>"));
    content.push(localize(8490, null, "<keybinding:history.showPrevious>", "<keybinding:history.showNext>"));
    content.push(localize(8488, null, "<keybinding:editor.action.accessibleView>"));
    content.push(localize(8485, null));
    content.push(localize(8487, null));
    content.push(localize(8486, null, AccessibleDiffViewerNext.id));
    content.push(localize(8491, null));
  }
  if (type === "panelChat" || type === "editsView" || type === "agentView") {
    content.push(localize(8438, null, "<keybinding:workbench.action.chat.find>", "<keybinding:workbench.action.chat.findNext>", "<keybinding:workbench.action.chat.findPrevious>"));
  }
  if (!isSessionsWindow && (type === "panelChat" || type === "editsView" || type === "agentView")) {
    content.push(localize(8451, null, `<keybinding:${AGENT_SESSION_RENAME_ACTION_ID}>`));
  }
  content.push(localize(8431, null));
  content.push(localize(8447, null, "<keybinding:editor.action.pasteAsText>"));
  content.push(localize(8454, null));
  return content.join("\n");
}

function getChatAccessibilityHelpProvider(accessor, editor, type) {
  const widgetService = accessor.get(IChatWidgetService);
  const keybindingService = accessor.get(IKeybindingService);
  const environmentService = accessor.get(IWorkbenchEnvironmentService);
  const configurationService = accessor.get(IConfigurationService);
  const widget = widgetService.lastFocusedWidget;
  if (!widget) {
    return;
  }
  const inputEditor = widget.inputEditor;
  const domNode = inputEditor.getDomNode() ?? void 0;
  if (!domNode) {
    return;
  }
  const cachedPosition = inputEditor.getPosition();
  inputEditor.getSupportedActions();
  const helpText = getAccessibilityHelpText2(type, keybindingService, widget.supportsFileReferences, environmentService.isSessionsWindow, isStickyPromptHeaderShown(widget, configurationService));
  return new AccessibleContentProvider(
    type === "panelChat" ? "panelChat" /* PanelChat */ : type === "inlineChat" ? "inlineChat" /* InlineChat */ : type === "agentView" ? "agentChat" /* AgentChat */ : "quickChat" /* QuickChat */,
    { type: "help" /* Help */ },
    () => helpText,
    () => {
      if (type === "quickChat" || type === "editsView" || type === "agentView" || type === "panelChat") {
        if (cachedPosition) {
          inputEditor.setPosition(cachedPosition);
        }
        inputEditor.focus();
      } else if (type === "inlineChat") {
        const ctrl = editor?.getContribution(INLINE_CHAT_ID);
        ctrl?.focus();
      }
    },
    type === "inlineChat" ? "accessibility.verbosity.inlineChat" /* InlineChat */ : "accessibility.verbosity.panelChat" /* Chat */
  );
}

function getChatFocusKeybindingLabel(keybindingService, type, focus) {
  let kbs;
  const fallback2 = " (unassigned keybinding)";
  if (focus === "input") {
    kbs = keybindingService.lookupKeybindings("workbench.action.chat.focusInput");
  } else if (focus === "lastFocused") {
    kbs = keybindingService.lookupKeybindings("workbench.chat.action.focusLastFocused");
  } else {
    kbs = keybindingService.lookupKeybindings("chat.action.focus");
  }
  if (!kbs?.length) {
    return fallback2;
  }
  let kb;
  if (type === "agentView" || type === "panelChat") {
    if (focus !== "input") {
      kb = kbs.find((kb2) => kb2.getAriaLabel()?.includes("UpArrow"))?.getAriaLabel();
    } else {
      kb = kbs.find((kb2) => kb2.getAriaLabel()?.includes("DownArrow"))?.getAriaLabel();
    }
  } else {
    if (focus !== "input") {
      kb = kbs.find((kb2) => kb2.getAriaLabel()?.includes("DownArrow"))?.getAriaLabel();
    } else {
      kb = kbs.find((kb2) => kb2.getAriaLabel()?.includes("UpArrow"))?.getAriaLabel();
    }
  }
  return !!kb ? ` (${kb})` : fallback2;
}
export { getAccessibilityHelpText2, getChatAccessibilityHelpProvider, getChatFocusKeybindingLabel, PanelChatAccessibilityHelp, QuickChatAccessibilityHelp, EditsChatAccessibilityHelp, AgentChatAccessibilityHelp };
