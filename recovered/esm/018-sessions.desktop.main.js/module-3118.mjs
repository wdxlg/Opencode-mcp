// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/rubyCommandLinePresenter.ts
import { isPowerShell } from "./module-3109.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/rubyCommandLinePresenter.ts
var RubyCommandLinePresenter = class {
  present(options3) {
    const commandLine = options3.commandLine.forDisplay;
    const extractedRuby = extractRubyCommand(commandLine, options3.shell, options3.os);
    if (extractedRuby) {
      return {
        commandLine: extractedRuby,
        language: "ruby",
        languageDisplayName: "Ruby"
      };
    }
    return void 0;
  }
};

function extractRubyCommand(commandLine, shell, os) {
  const doubleQuoteMatch = commandLine.match(/^ruby\s+-e\s+"(?<code>.+)"$/s);
  if (doubleQuoteMatch?.groups?.code) {
    let rubyCode = doubleQuoteMatch.groups.code.trim();
    if (!rubyCode) {
      return void 0;
    }
    if (isPowerShell(shell, os)) {
      rubyCode = rubyCode.replace(/`"/g, '"');
    } else {
      rubyCode = rubyCode.replace(/\\"/g, '"');
    }
    return rubyCode;
  }
  const singleQuoteMatch = commandLine.match(/^ruby\s+-e\s+'(?<code>.+)'$/s);
  if (singleQuoteMatch?.groups?.code) {
    const rubyCode = singleQuoteMatch.groups.code.trim();
    if (!rubyCode) {
      return void 0;
    }
    return rubyCode;
  }
  return void 0;
}
export { extractRubyCommand, RubyCommandLinePresenter };
