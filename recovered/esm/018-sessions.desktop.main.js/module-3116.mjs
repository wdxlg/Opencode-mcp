// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/nodeCommandLinePresenter.ts
import { isPowerShell } from "./module-3109.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/nodeCommandLinePresenter.ts
var NodeCommandLinePresenter = class {
  present(options3) {
    const commandLine = options3.commandLine.forDisplay;
    const extractedNode = extractNodeCommand(commandLine, options3.shell, options3.os);
    if (extractedNode) {
      return {
        commandLine: extractedNode,
        language: "javascript",
        languageDisplayName: "Node.js"
      };
    }
    return void 0;
  }
};

function extractNodeCommand(commandLine, shell, os) {
  const doubleQuoteMatch = commandLine.match(/^node(?:js)?\s+(?:-e|--eval)\s+"(?<code>.+)"$/s);
  if (doubleQuoteMatch?.groups?.code) {
    let jsCode = doubleQuoteMatch.groups.code.trim();
    if (isPowerShell(shell, os)) {
      jsCode = jsCode.replace(/`"/g, '"');
    } else {
      jsCode = jsCode.replace(/\\"/g, '"');
    }
    return jsCode;
  }
  const singleQuoteMatch = commandLine.match(/^node(?:js)?\s+(?:-e|--eval)\s+'(?<code>.+)'$/s);
  if (singleQuoteMatch?.groups?.code) {
    return singleQuoteMatch.groups.code.trim();
  }
  return void 0;
}
export { extractNodeCommand, NodeCommandLinePresenter };
