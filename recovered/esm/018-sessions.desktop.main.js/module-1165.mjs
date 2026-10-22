// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/history/common/terminal.history.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/history/common/terminal.history.ts
var defaultTerminalHistoryCommandsToSkipShell = [
  "workbench.action.terminal.goToRecentDirectory" /* GoToRecentDirectory */,
  "workbench.action.terminal.runRecentCommand" /* RunRecentCommand */
];

var terminalHistoryConfiguration = {
  ["terminal.integrated.shellIntegration.history" /* ShellIntegrationCommandHistory */]: {
    restricted: true,
    markdownDescription: localize(20768, null),
    type: "number",
    default: 100
  }
};
export { defaultTerminalHistoryCommandsToSkipShell, terminalHistoryConfiguration };
