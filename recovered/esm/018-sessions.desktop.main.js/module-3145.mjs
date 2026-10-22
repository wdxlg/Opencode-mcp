// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLinePwshChainOperatorRewriter.ts
import { Disposable } from "./module-0012.mjs";
import { isPowerShell } from "./module-3109.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLinePwshChainOperatorRewriter.ts
var CommandLinePwshChainOperatorRewriter = class extends Disposable {
  constructor(_treeSitterCommandParser) {
    super();
    this._treeSitterCommandParser = _treeSitterCommandParser;
  }
  async rewrite(options3) {
    if (isPowerShell(options3.shell, options3.os)) {
      let doubleAmpersandCaptures;
      try {
        doubleAmpersandCaptures = await this._treeSitterCommandParser.extractPwshDoubleAmpersandChainOperators(options3.commandLine);
      } catch {
      }
      if (doubleAmpersandCaptures && doubleAmpersandCaptures.length > 0) {
        let rewritten = options3.commandLine;
        for (const capture of doubleAmpersandCaptures.reverse()) {
          rewritten = `${rewritten.substring(0, capture.node.startIndex)};${rewritten.substring(capture.node.endIndex)}`;
        }
        return {
          rewritten,
          reasoning: "&& re-written to ;"
        };
      }
    }
    return void 0;
  }
};
export { CommandLinePwshChainOperatorRewriter };
