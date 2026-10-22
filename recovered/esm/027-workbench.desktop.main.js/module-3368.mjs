// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/runInTerminalConfirmationTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { Codicon } from "./module-0085.mjs";
import { RunInTerminalTool } from "./module-3363.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/runInTerminalConfirmationTool.ts
var ConfirmTerminalCommandToolData = {
  id: "vscode_get_terminal_confirmation" /* ConfirmTerminalCommand */,
  displayName: localize(20489, null),
  modelDescription: [
    "This tool allows you to get explicit user confirmation for a terminal command without executing it.",
    "",
    "When to use:",
    "- When you need to verify user approval before executing a command",
    "- When you want to show command details, auto-approval status, and simplified versions to the user",
    "- When you need the user to review a potentially risky command",
    "",
    "The tool will:",
    "- Show the command with syntax highlighting",
    "- Display auto-approval status if enabled",
    "- Show simplified version of the command if applicable",
    "- Provide custom actions for creating auto-approval rules",
    "- Return approval/rejection status",
    "",
    "After confirmation, use a tool to actually execute the command."
  ].join("\n"),
  userDescription: localize(20493, null),
  source: ToolDataSource.Internal,
  icon: Codicon.shield,
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to confirm with the user."
      },
      explanation: {
        type: "string",
        description: "A one-sentence description of what the command does. This will be shown to the user in the confirmation dialog."
      },
      goal: {
        type: "string",
        description: "A short description of the goal or purpose of the command."
      },
      mode: {
        type: "string",
        enum: ["sync", "async"],
        description: "Execution mode this command would use if run."
      },
      sandboxBypass: {
        type: "boolean",
        description: "Set to true when the command will run outside the sandbox. The confirmation makes the elevated risk clear to the user."
      },
      sandboxBypassReason: {
        type: "string",
        description: "A short explanation of why the command needs to run outside the sandbox. Only meaningful when sandboxBypass is true."
      }
    },
    required: [
      "command",
      "explanation",
      "goal",
      "mode"
    ]
  }
};

var ConfirmTerminalCommandTool = class extends RunInTerminalTool {
  get _enableCommandLineSandboxRewriting() {
    return false;
  }
  async prepareToolInvocation(context2, token) {
    const preparedInvocation = await super.prepareToolInvocation(context2, token);
    if (preparedInvocation) {
      preparedInvocation.presentation = "hiddenAfterComplete" /* HiddenAfterComplete */;
      const params = context2.parameters;
      if (params.sandboxBypass === true) {
        const title = localize(20492, null);
        const reason = typeof params.sandboxBypassReason === "string" ? escapeMarkdownSyntaxTokens(params.sandboxBypassReason.trim()) : "";
        const message = new MarkdownString(reason ? localize(20491, null, reason) : localize(20490, null));
        if (preparedInvocation.confirmationMessages) {
          preparedInvocation.confirmationMessages.title = title;
          preparedInvocation.confirmationMessages.message = message;
        } else {
          preparedInvocation.confirmationMessages = { title, message };
        }
      }
    }
    return preparedInvocation;
  }
  async invoke(invocation, countTokens, progress, token) {
    return {
      content: [{
        kind: "text",
        value: "yes"
      }]
    };
  }
};
export { ConfirmTerminalCommandToolData, ConfirmTerminalCommandTool };
