// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.ts
var terminalStickyScrollConfiguration = {
  ["terminal.integrated.stickyScroll.enabled" /* Enabled */]: {
    markdownDescription: localize(20850, null, "https://code.visualstudio.com/docs/terminal/shell-integration", `\`#${"terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */}#\``),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.stickyScroll.maxLineCount" /* MaxLineCount */]: {
    markdownDescription: localize(20852, null),
    type: "number",
    default: 5,
    minimum: 1,
    maximum: 10
  },
  ["terminal.integrated.stickyScroll.ignoredCommands" /* IgnoredCommands */]: {
    markdownDescription: localize(20851, null),
    type: "array",
    items: {
      type: "string"
    },
    default: [
      "clear",
      "cls",
      "clear-host",
      "agent",
      "agy",
      "copilot",
      "claude",
      "codex",
      "gemini"
    ]
  }
};
export { terminalStickyScrollConfiguration };
