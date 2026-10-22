// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/find/browser/terminalFindAccessibilityHelp.ts
import { TerminalContextKeys } from "./module-1176.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/find/browser/terminalFindAccessibilityHelp.ts
var TerminalFindAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "terminal-find";
    this.type = "help" /* Help */;
    this.when = TerminalContextKeys.findFocus;
  }
  getProvider(accessor) {
    const commandService = accessor.get(ICommandService);
    return new TerminalFindAccessibilityHelpProvider(commandService);
  }
};

var TerminalFindAccessibilityHelpProvider = class extends Disposable {
  constructor(_commandService) {
    super();
    this._commandService = _commandService;
    this.id = "terminalFindHelp" /* TerminalFindHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  onClose() {
    setTimeout(() => {
      this._commandService.executeCommand("workbench.action.terminal.focusFind" /* FindFocus */);
    }, 200);
  }
  provideContent() {
    const content = [];
    content.push(localize(20733, null));
    content.push(localize(20728, null));
    content.push("");
    content.push(localize(20754, null));
    content.push(localize(20753, null));
    content.push("");
    content.push(localize(20740, null));
    content.push(localize(20739, null));
    content.push("");
    content.push(localize(20738, null));
    content.push(localize(20737, null));
    content.push(localize(20734, null));
    content.push(localize(20735, null));
    content.push(localize(20736, null));
    content.push("");
    content.push(localize(20732, null));
    content.push(localize(20729, null));
    content.push(localize(20730, null));
    content.push(localize(20731, null));
    content.push("");
    content.push(localize(20741, null));
    content.push("");
    content.push(localize(20743, null));
    content.push(localize(20742, null));
    content.push(localize(20745, null));
    content.push("");
    content.push(localize(20744, null));
    content.push("");
    content.push(localize(20748, null));
    content.push(localize(20746, null));
    content.push(localize(20749, null));
    content.push(localize(20747, null));
    content.push("");
    content.push(localize(20751, null, "<keybinding:workbench.action.openSettings>"));
    content.push(localize(20750, null));
    content.push(localize(20752, null));
    content.push("");
    content.push(localize(20727, null));
    content.push(localize(20726, null));
    return content.join("\n");
  }
};
export { TerminalFindAccessibilityHelp, TerminalFindAccessibilityHelpProvider };
