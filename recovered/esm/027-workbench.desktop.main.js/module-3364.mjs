// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/killTerminalTool.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { Disposable } from "./module-0012.mjs";
import { RunInTerminalTool } from "./module-3363.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/killTerminalTool.ts
var KillTerminalToolData = {
  id: "kill_terminal" /* KillTerminal */,
  toolReferenceName: "killTerminal",
  displayName: localize(20483, null),
  modelDescription: `Kill a terminal by its ID. Use this to clean up terminals that are no longer needed (e.g., after stopping a server or when a long-running task completes). The terminal ID is returned by ${"run_in_terminal" /* RunInTerminal */} in async mode (legacy: isBackground=true).`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: `The ID of the persistent terminal to kill (returned by ${"run_in_terminal" /* RunInTerminal */} in async mode).`,
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
      }
    },
    required: [
      "id"
    ]
  }
};

var KillTerminalTool = class extends Disposable {
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize(20482, null),
      pastTenseMessage: localize(20481, null)
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const args2 = invocation.parameters;
    const execution = RunInTerminalTool.getExecution(args2.id);
    if (!execution) {
      return {
        content: [{
          kind: "text",
          value: `Error: No active terminal execution found with ID ${args2.id}. The terminal may have already been killed or the ID is invalid.`
        }]
      };
    }
    const finalOutput = execution.getOutput();
    RunInTerminalTool.markKilledByTool(args2.id);
    execution.instance.dispose();
    const outputSummary = finalOutput ? `Final output before termination:
${finalOutput}` : "No output was captured.";
    return {
      content: [{
        kind: "text",
        value: `Successfully killed persistent terminal ${args2.id}. ${outputSummary}`
      }]
    };
  }
};
export { KillTerminalToolData, KillTerminalTool };
