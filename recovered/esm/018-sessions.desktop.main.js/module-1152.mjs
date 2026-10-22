// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/accessibility/common/terminalAccessibilityConfiguration.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/accessibility/common/terminalAccessibilityConfiguration.ts
var terminalAccessibilityConfiguration = {
  ["terminal.integrated.accessibleViewPreserveCursorPosition" /* AccessibleViewPreserveCursorPosition */]: {
    markdownDescription: localize(20397, null),
    type: ["boolean", "string"],
    enum: [false, true, "always" /* Always */],
    enumDescriptions: [
      localize(20399, null),
      localize(20400, null),
      localize(20398, null)
    ],
    default: false
  },
  ["terminal.integrated.accessibleViewFocusOnCommandExecution" /* AccessibleViewFocusOnCommandExecution */]: {
    markdownDescription: localize(20396, null),
    type: "boolean",
    default: false
  }
};
export { terminalAccessibilityConfiguration };
