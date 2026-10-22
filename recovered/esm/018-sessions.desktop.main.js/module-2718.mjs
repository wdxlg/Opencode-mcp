// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/accessibility/chatTerminalOutputAccessibleView.ts
import { ChatContextKeys } from "./module-0966.mjs";
import { ITerminalChatService } from "./module-1150.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/chat/browser/accessibility/chatTerminalOutputAccessibleView.ts
var ChatTerminalOutputAccessibleView = class {
  constructor() {
    this.priority = 115;
    this.name = "chatTerminalOutput";
    this.type = "view" /* View */;
    this.when = ChatContextKeys.inChatTerminalToolOutput;
  }
  getProvider(accessor) {
    const terminalChatService = accessor.get(ITerminalChatService);
    const part = terminalChatService.getFocusedProgressPart();
    if (!part) {
      return;
    }
    const content = part.getCommandAndOutputAsText();
    if (!content) {
      return;
    }
    return new AccessibleContentProvider(
      "chatTerminalOutput" /* ChatTerminalOutput */,
      { type: "view" /* View */, id: "chatTerminalOutput" /* ChatTerminalOutput */, language: "text" },
      () => content,
      () => part.focusOutput(),
      "accessibility.verbosity.terminalChatOutput" /* TerminalChatOutput */
    );
  }
};
export { ChatTerminalOutputAccessibleView };
