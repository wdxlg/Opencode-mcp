// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatAccessibilityHelp.ts
import { TerminalChatContextKeys } from "./module-1153.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";
import { TerminalChatController } from "./module-3390.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatAccessibilityHelp.ts
var TerminalChatAccessibilityHelp = class {
  constructor() {
    this.priority = 110;
    this.name = "terminalChat";
    this.when = TerminalChatContextKeys.focused;
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    const terminalService = accessor.get(ITerminalService);
    const instance2 = terminalService.activeInstance;
    if (!instance2) {
      return;
    }
    const helpText = getAccessibilityHelpText3(accessor);
    return new AccessibleContentProvider(
      "terminal-chat" /* TerminalChat */,
      { type: "help" /* Help */ },
      () => helpText,
      () => TerminalChatController.get(instance2)?.terminalChatWidget?.focus(),
      "accessibility.verbosity.terminalChat" /* TerminalInlineChat */
    );
  }
};

function getAccessibilityHelpText3(accessor) {
  const keybindingService = accessor.get(IKeybindingService);
  const content2 = [];
  const openAccessibleViewKeybinding = keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel();
  const runCommandKeybinding = keybindingService.lookupKeybinding("workbench.action.terminal.chat.runCommand" /* RunCommand */)?.getAriaLabel();
  const insertCommandKeybinding = keybindingService.lookupKeybinding("workbench.action.terminal.chat.insertCommand" /* InsertCommand */)?.getAriaLabel();
  const makeRequestKeybinding = keybindingService.lookupKeybinding("workbench.action.terminal.chat.makeRequest" /* MakeRequest */)?.getAriaLabel();
  const startChatKeybinding = keybindingService.lookupKeybinding("workbench.action.terminal.chat.start" /* Start */)?.getAriaLabel();
  const focusResponseKeybinding = keybindingService.lookupKeybinding("chat.action.focus")?.getAriaLabel();
  const focusInputKeybinding = keybindingService.lookupKeybinding("workbench.action.chat.focusInput")?.getAriaLabel();
  content2.push(localize(20425, null));
  content2.push(localize(20414, null, startChatKeybinding));
  content2.push(makeRequestKeybinding ? localize(20419, null, makeRequestKeybinding) : localize(20420, null));
  content2.push(openAccessibleViewKeybinding ? localize(20423, null, openAccessibleViewKeybinding) : localize(20424, null));
  content2.push(focusResponseKeybinding ? localize(20417, null, focusResponseKeybinding) : localize(20418, null));
  content2.push(focusInputKeybinding ? localize(20415, null, focusInputKeybinding) : localize(20416, null));
  content2.push(runCommandKeybinding ? localize(20426, null, runCommandKeybinding) : localize(20427, null));
  content2.push(insertCommandKeybinding ? localize(20421, null, insertCommandKeybinding) : localize(20422, null));
  content2.push(localize(20428, null));
  content2.push(localize(20413, null));
  return content2.join("\n");
}
export { getAccessibilityHelpText3, TerminalChatAccessibilityHelp };
