// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChat.ts
import { MenuId } from "./module-0092.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChat.ts
var MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR = MenuId.for("terminalChatWidget");

var MENU_TERMINAL_CHAT_WIDGET_STATUS = MenuId.for("terminalChatWidget.status");

var MENU_TERMINAL_CHAT_WIDGET_TOOLBAR = MenuId.for("terminalChatWidget.toolbar");

var MENU_CHAT_TERMINAL_TOOL_PROGRESS = MenuId.for("chatTerminalToolProgress");

var TerminalChatContextKeys;

((TerminalChatContextKeys2) => {
  TerminalChatContextKeys2.focused = new RawContextKey("terminalChatFocus" /* ChatFocus */, false, localize(20404, null));
  TerminalChatContextKeys2.visible = new RawContextKey("terminalChatVisible" /* ChatVisible */, false, localize(20409, null));
  TerminalChatContextKeys2.requestActive = new RawContextKey("terminalChatActiveRequest" /* ChatActiveRequest */, false, localize(20406, null));
  TerminalChatContextKeys2.inputHasText = new RawContextKey("terminalChatInputHasText" /* ChatInputHasText */, false, localize(20405, null));
  TerminalChatContextKeys2.responseContainsCodeBlock = new RawContextKey("terminalChatResponseContainsCodeBlock" /* ChatResponseContainsCodeBlock */, false, localize(20407, null));
  TerminalChatContextKeys2.responseContainsMultipleCodeBlocks = new RawContextKey("terminalChatResponseContainsMultipleCodeBlocks" /* ChatResponseContainsMultipleCodeBlocks */, false, localize(20408, null));
  TerminalChatContextKeys2.hasChatAgent = new RawContextKey("terminalChatAgentRegistered" /* ChatAgentRegistered */, false, localize(20403, null));
  TerminalChatContextKeys2.usesAgentHost = new RawContextKey("terminalChatUsesAgentHost" /* ChatUsesAgentHost */, false, localize(20410, null));
  TerminalChatContextKeys2.hasChatTerminals = new RawContextKey("hasChatTerminals" /* ChatHasTerminals */, false, localize(20411, null));
  TerminalChatContextKeys2.hasHiddenChatTerminals = new RawContextKey("hasHiddenChatTerminals" /* ChatHasHiddenTerminals */, false, localize(20412, null));
  TerminalChatContextKeys2.chatToolHasInstance = new RawContextKey("chatTerminalToolHasInstance" /* ChatToolHasInstance */, false);
  TerminalChatContextKeys2.chatToolCanContinueInBackground = new RawContextKey("chatTerminalToolCanContinueInBackground" /* ChatToolCanContinueInBackground */, false);
  TerminalChatContextKeys2.chatToolHasOutput = new RawContextKey("chatTerminalToolHasOutput" /* ChatToolHasOutput */, false);
  TerminalChatContextKeys2.chatToolUsesCollapsible = new RawContextKey("chatTerminalToolUsesCollapsible" /* ChatToolUsesCollapsible */, false);
  TerminalChatContextKeys2.chatToolIsHiddenTerminal = new RawContextKey("chatTerminalToolIsHiddenTerminal" /* ChatToolIsHiddenTerminal */, false);
  TerminalChatContextKeys2.chatToolOutputExpanded = new RawContextKey("chatTerminalToolOutputExpanded" /* ChatToolOutputExpanded */, false);
})(TerminalChatContextKeys || (TerminalChatContextKeys = {}));
export { MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR, MENU_TERMINAL_CHAT_WIDGET_STATUS, MENU_TERMINAL_CHAT_WIDGET_TOOLBAR, MENU_CHAT_TERMINAL_TOOL_PROGRESS, TerminalChatContextKeys };
