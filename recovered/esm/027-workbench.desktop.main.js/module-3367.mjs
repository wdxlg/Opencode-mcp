// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/getTerminalSelectionTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalService } from "./module-1149.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/getTerminalSelectionTool.ts
var GetTerminalSelectionToolData = {
  id: "terminal_selection" /* TerminalSelection */,
  toolReferenceName: "terminalSelection",
  legacyToolReferenceFullNames: ["runCommands/terminalSelection"],
  displayName: localize(20480, null),
  modelDescription: "Get the current selection in the active terminal.",
  source: ToolDataSource.Internal,
  icon: Codicon.terminal
};

var GetTerminalSelectionTool = class extends Disposable {
  constructor(_terminalService) {
    super();
    this._terminalService = _terminalService;
  }
  async prepareToolInvocation(context2, token) {
    return {
      invocationMessage: localize(20479, null),
      pastTenseMessage: localize(20478, null)
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const activeInstance = this._terminalService.activeInstance;
    if (!activeInstance) {
      return {
        content: [{
          kind: "text",
          value: "No active terminal instance found."
        }]
      };
    }
    const selection = activeInstance.selection;
    if (!selection) {
      return {
        content: [{
          kind: "text",
          value: "No text is currently selected in the active terminal."
        }]
      };
    }
    return {
      content: [{
        kind: "text",
        value: `The active terminal's selection:
${selection}`
      }]
    };
  }
};

GetTerminalSelectionTool = __decorateClass([
  __decorateParam(0, ITerminalService)
], GetTerminalSelectionTool);
export { GetTerminalSelectionToolData, GetTerminalSelectionTool };
