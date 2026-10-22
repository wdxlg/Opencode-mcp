// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/terminalOutput.ts
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/terminalOutput.ts
function getTerminalOutputDirectory(cacheHome) {
  return URI.joinPath(cacheHome, "copilot-terminal-output");
}
export { getTerminalOutputDirectory };
