// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/pythonCommandLinePresenter.ts
import { isPowerShell } from "./module-3320.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/pythonCommandLinePresenter.ts
var PythonCommandLinePresenter = class {
  present(options3) {
    const commandLine = options3.commandLine.forDisplay;
    const extractedPython = extractPythonCommand(commandLine, options3.shell, options3.os);
    if (extractedPython) {
      return {
        commandLine: extractedPython,
        language: "python",
        languageDisplayName: "Python"
      };
    }
    return void 0;
  }
};

function extractPythonCommand(commandLine, shell, os) {
  const doubleQuoteMatch = commandLine.match(/^python(?:3)?\s+-c\s+"(?<python>.+)"$/s);
  if (doubleQuoteMatch?.groups?.python) {
    let pythonCode = doubleQuoteMatch.groups.python.trim();
    if (isPowerShell(shell, os)) {
      pythonCode = pythonCode.replace(/`"/g, '"');
    } else {
      pythonCode = pythonCode.replace(/\\"/g, '"');
    }
    return pythonCode;
  }
  const singleQuoteMatch = commandLine.match(/^python(?:3)?\s+-c\s+'(?<python>.+)'$/s);
  if (singleQuoteMatch?.groups?.python) {
    return singleQuoteMatch.groups.python.trim();
  }
  return void 0;
}
export { extractPythonCommand, PythonCommandLinePresenter };
