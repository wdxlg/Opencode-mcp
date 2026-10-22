// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/accessibility/chatTerminalOutputAccessibleView.ts
import { ChatContextKeys } from "./module-0965.mjs";
import { ITerminalChatService } from "./module-1149.mjs";
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
    const content2 = part.getCommandAndOutputAsText();
    if (!content2) {
      return;
    }
    return new AccessibleContentProvider(
      "chatTerminalOutput" /* ChatTerminalOutput */,
      { type: "view" /* View */, id: "chatTerminalOutput" /* ChatTerminalOutput */, language: "text" },
      () => content2,
      () => part.focusOutput(),
      "accessibility.verbosity.terminalChatOutput" /* TerminalChatOutput */
    );
  }
};
export { ChatTerminalOutputAccessibleView };
