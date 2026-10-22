// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/getTerminalLastCommandTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalService } from "./module-1150.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/getTerminalLastCommandTool.ts
var GetTerminalLastCommandToolData = {
  id: "terminal_last_command" /* TerminalLastCommand */,
  toolReferenceName: "terminalLastCommand",
  legacyToolReferenceFullNames: ["runCommands/terminalLastCommand"],
  displayName: localize(20474, null),
  modelDescription: "Get the last command run in the active terminal.",
  source: ToolDataSource.Internal,
  icon: Codicon.terminal
};

var GetTerminalLastCommandTool = class extends Disposable {
  constructor(_terminalService) {
    super();
    this._terminalService = _terminalService;
  }
  async prepareToolInvocation(context2, token) {
    return {
      invocationMessage: localize(20473, null),
      pastTenseMessage: localize(20472, null)
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
    const commandDetection = activeInstance.capabilities.get(2 /* CommandDetection */);
    if (!commandDetection) {
      return {
        content: [{
          kind: "text",
          value: "No command detection capability available in the active terminal."
        }]
      };
    }
    const executingCommand = commandDetection.executingCommand;
    if (executingCommand) {
      const userPrompt2 = [];
      userPrompt2.push("The following command is currently executing in the terminal:");
      userPrompt2.push(executingCommand);
      const cwd2 = commandDetection.cwd;
      if (cwd2) {
        userPrompt2.push("It is running in the directory:");
        userPrompt2.push(cwd2);
      }
      return {
        content: [{
          kind: "text",
          value: userPrompt2.join("\n")
        }]
      };
    }
    const commands = commandDetection.commands;
    if (!commands || commands.length === 0) {
      return {
        content: [{
          kind: "text",
          value: "No command has been run in the active terminal."
        }]
      };
    }
    const lastCommand = commands[commands.length - 1];
    const userPrompt = [];
    if (lastCommand.command) {
      userPrompt.push("The following is the last command run in the terminal:");
      userPrompt.push(lastCommand.command);
    }
    if (lastCommand.cwd) {
      userPrompt.push("It was run in the directory:");
      userPrompt.push(lastCommand.cwd);
    }
    if (lastCommand.exitCode !== void 0) {
      userPrompt.push(`It exited with code: ${lastCommand.exitCode}`);
    }
    if (lastCommand.hasOutput() && lastCommand.getOutput) {
      const output = lastCommand.getOutput();
      if (output && output.trim().length > 0) {
        userPrompt.push("It has the following output:");
        userPrompt.push(output);
      }
    }
    return {
      content: [{
        kind: "text",
        value: userPrompt.join("\n")
      }]
    };
  }
};

GetTerminalLastCommandTool = __decorateClass([
  __decorateParam(0, ITerminalService)
], GetTerminalLastCommandTool);
export { GetTerminalLastCommandToolData, GetTerminalLastCommandTool };
