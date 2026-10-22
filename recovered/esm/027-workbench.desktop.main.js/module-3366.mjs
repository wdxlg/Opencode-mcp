// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/sendToTerminalTool.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { ITerminalChatService, ITerminalService } from "./module-1149.mjs";
import { RunInTerminalTool } from "./module-3363.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString, appendEscapedMarkdownInlineCode, createCommandUri, isMarkdownString } from "./module-0462.mjs";
import { buildCommandDisplayText, isMultilineCommand, normalizeCommandForExecution } from "./module-3320.mjs";
import { isSessionAutoApproveLevel } from "./module-3361.mjs";
import { hasKey } from "./module-0010.mjs";
import { timeout } from "./module-0036.mjs";
import { getOutput } from "./module-3324.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatWidgetService } from "./module-0981.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/sendToTerminalTool.ts
var SendToTerminalToolData = {
  id: "send_to_terminal" /* SendToTerminal */,
  toolReferenceName: "sendToTerminal",
  displayName: localize(20576, null),
  modelDescription: `Send input text to an active terminal execution (identified by the \`id\` returned from ${"run_in_terminal" /* RunInTerminal */}). The 'command' field may be empty or whitespace to press Enter (useful for interactive prompts). By default, returns the last 20 lines of terminal output captured shortly after sending. Set 'waitForOutput' to true for interactive programs (games, REPLs, etc.) to wait until the terminal becomes idle before returning output \u2014 this gives you the program's response to your input.`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: `The ID of an active terminal execution to send a command to (returned by ${"run_in_terminal" /* RunInTerminal */} for async executions, or for sync executions that timed out and were moved to the background).`,
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
      },
      command: {
        type: "string",
        description: "The input text to send to the terminal. The text is sent followed by Enter. Provide an empty or whitespace string to send just Enter (for interactive prompts)."
      },
      waitForOutput: {
        type: "boolean",
        description: "When true, waits for the terminal to become idle (no new output for a short period) before returning, instead of returning immediately. Use this for interactive programs where you need to see the full response to your input. Defaults to false."
      }
    },
    required: [
      "id",
      "command"
    ]
  }
};

function isCancelSignal(command4) {
  return /^[\u0003\u0004\u001c]$/.test(command4.trim());
}

var FocusTerminalByIdCommandId = "workbench.action.terminal.chat.focusTerminalById";

CommandsRegistry.registerCommand(FocusTerminalByIdCommandId, async (accessor, instanceId) => {
  const terminalService = accessor.get(ITerminalService);
  const instance2 = terminalService.getInstanceFromId(instanceId);
  if (instance2) {
    terminalService.setActiveInstance(instance2);
    await terminalService.revealActiveTerminal();
    instance2.focus();
  }
});

var FocusTerminalByExecutionIdCommandId = "workbench.action.terminal.chat.focusTerminalByExecutionId";

CommandsRegistry.registerCommand(FocusTerminalByExecutionIdCommandId, async (accessor, executionId) => {
  const execution = RunInTerminalTool.getExecution(executionId);
  if (execution) {
    const terminalService = accessor.get(ITerminalService);
    terminalService.setActiveInstance(execution.instance);
    await terminalService.revealActiveTerminal();
    execution.instance.focus();
  }
});

var SendToTerminalTool = class extends Disposable {
  constructor(_configurationService, _chatService, _chatWidgetService, _terminalChatService) {
    super();
    this._configurationService = _configurationService;
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._terminalChatService = _terminalChatService;
  }
  async prepareToolInvocation(context2, _token) {
    const args2 = context2.parameters;
    const isEmptyInput = !args2.command || !args2.command.trim();
    const terminalLabel = this._getTerminalLabel(args2);
    const invocationMessage = new MarkdownString();
    const pastTenseMessage = new MarkdownString();
    const questionText = this._getQuestionContextForTerminal(context2.chatSessionResource, args2);
    if (isEmptyInput) {
      invocationMessage.appendMarkdown(localize(20574, null));
      pastTenseMessage.appendMarkdown(localize(20572, null));
    } else {
      const displayCommand = buildCommandDisplayText(args2.command);
      const safeInlineCode = appendEscapedMarkdownInlineCode(displayCommand);
      invocationMessage.appendMarkdown(localize(20573, null, safeInlineCode));
      pastTenseMessage.appendMarkdown(localize(20571, null, safeInlineCode));
    }
    if (questionText) {
      const replyPrefix = ` (${localize(20575, null)}`;
      invocationMessage.appendMarkdown(replyPrefix);
      invocationMessage.appendText(questionText);
      invocationMessage.appendMarkdown(")");
      pastTenseMessage.appendMarkdown(replyPrefix);
      pastTenseMessage.appendText(questionText);
      pastTenseMessage.appendMarkdown(")");
    }
    const instanceId = this._getTerminalInstanceId(args2);
    const confirmationMessage = new MarkdownString("", { isTrusted: { enabledCommands: [FocusTerminalByIdCommandId] } });
    const safeTerminalLabel = appendEscapedMarkdownInlineCode(terminalLabel);
    const baseMessage = isEmptyInput ? localize(20569, null, safeTerminalLabel) : localize(20568, null, appendEscapedMarkdownInlineCode(buildCommandDisplayText(args2.command)), safeTerminalLabel);
    if (instanceId !== void 0) {
      const focusUri = createCommandUri(FocusTerminalByIdCommandId, instanceId);
      confirmationMessage.appendMarkdown(`${baseMessage} \u2014 [${localize(20567, null)}](${focusUri})`);
    } else {
      confirmationMessage.appendMarkdown(baseMessage);
    }
    const chatSessionResource = context2.chatSessionResource;
    const isSessionAutoApproved = chatSessionResource && (isSessionAutoApproveLevel(chatSessionResource, this._configurationService, this._chatWidgetService, this._chatService) || this._terminalChatService.hasChatSessionAutoApproval(chatSessionResource));
    const isAnsweringQuestion = questionText !== void 0;
    const shouldShowConfirmation = !isSessionAutoApproved && !isAnsweringQuestion || context2.forceConfirmationReason !== void 0;
    const confirmationMessages = shouldShowConfirmation ? {
      title: localize(20570, null),
      message: confirmationMessage,
      allowAutoConfirm: void 0
    } : void 0;
    return {
      invocationMessage,
      pastTenseMessage,
      confirmationMessages
    };
  }
  /**
   * Returns a human-friendly label for the target terminal, using the
   * terminal instance title (which reflects the running process) instead
   * of the raw UUID or numeric id.
   */
  _getTerminalLabel(args2) {
    if (args2.id) {
      const execution = RunInTerminalTool.getExecution(args2.id);
      if (execution) {
        return execution.instance.title;
      }
    }
    return args2.id ?? "";
  }
  /**
   * Returns the numeric terminal instanceId for the target terminal, used
   * to build command URIs for the "Focus Terminal" link.
   */
  _getTerminalInstanceId(args2) {
    if (args2.id) {
      const execution = RunInTerminalTool.getExecution(args2.id);
      if (execution) {
        return execution.instance.instanceId;
      }
    }
    return void 0;
  }
  /**
   * Searches the current session's responses for the most recent question
   * carousel associated with the target terminal, then uses positional
   * matching to return the specific question that this send_to_terminal
   * call is answering.
   *
   * When a carousel contains multiple questions, the model calls
   * send_to_terminal once per answer in order. This method counts prior
   * send_to_terminal invocations since the carousel to determine the
   * current question index, then verifies the command matches the answer
   * at that position.
   */
  _getQuestionContextForTerminal(chatSessionResource, args2) {
    if (!chatSessionResource) {
      return void 0;
    }
    const model = this._chatService.getSession(chatSessionResource);
    if (!model) {
      return void 0;
    }
    if (!args2.id) {
      return void 0;
    }
    const commandText = args2.command?.trim();
    const requests = model.getRequests();
    for (let i2 = requests.length - 1; i2 >= 0; i2--) {
      const response = requests[i2].response;
      if (!response) {
        continue;
      }
      const parts = response.response.value;
      let carouselIndex = -1;
      let carousel;
      for (let j = parts.length - 1; j >= 0; j--) {
        const part = parts[j];
        if (part.kind === "questionCarousel") {
          const candidate = part;
          if (!candidate.terminalId || candidate.questions.length === 0) {
            continue;
          }
          if (candidate.terminalId === args2.id) {
            carouselIndex = j;
            carousel = candidate;
            break;
          }
        }
      }
      if (!carousel || carouselIndex === -1) {
        continue;
      }
      let sendCount = 0;
      for (let j = carouselIndex + 1; j < parts.length; j++) {
        if (parts[j].kind === "toolInvocation" && parts[j].toolId === "send_to_terminal" /* SendToTerminal */) {
          sendCount++;
        }
      }
      const questionIndex = sendCount;
      if (questionIndex >= carousel.questions.length) {
        return void 0;
      }
      const question = carousel.questions[questionIndex];
      if (carousel.data) {
        const answer = carousel.data[question.id];
        if (this._answerMatchesCommand(answer, commandText)) {
          return this._getQuestionText(question);
        }
      }
      return void 0;
    }
    return void 0;
  }
  _getQuestionText(question) {
    const text2 = question.message ?? question.title;
    return isMarkdownString(text2) ? text2.value : text2;
  }
  /**
   * Checks whether a carousel answer value matches the command text being sent.
   * An empty/unprovided answer matches an empty command (i.e. pressing Enter to
   * accept the default), since that is the expected way to skip a question.
   */
  _answerMatchesCommand(answer, commandText) {
    if (answer === void 0) {
      return commandText === "";
    }
    if (typeof answer === "string") {
      return answer.trim() === commandText;
    }
    if (hasKey(answer, { selectedValues: true })) {
      const multi = answer;
      if (multi.selectedValues.some((v2) => v2.trim() === commandText)) {
        return true;
      }
      if (multi.freeformValue?.trim() === commandText) {
        return true;
      }
      return commandText === "" && multi.selectedValues.length === 0 && !multi.freeformValue?.trim();
    }
    if (hasKey(answer, { selectedValue: true })) {
      const single = answer;
      if (single.selectedValue?.trim() === commandText || single.freeformValue?.trim() === commandText) {
        return true;
      }
      return commandText === "" && !single.selectedValue?.trim() && !single.freeformValue?.trim();
    }
    return false;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args2 = invocation.parameters;
    if (!args2.id) {
      return {
        content: [{
          kind: "text",
          value: `Error: 'id' (the active terminal execution UUID returned by ${"run_in_terminal" /* RunInTerminal */}) must be provided.`
        }]
      };
    }
    const execution = RunInTerminalTool.getExecution(args2.id);
    if (!execution) {
      return {
        content: [{
          kind: "text",
          value: `Error: No active terminal execution found with ID ${args2.id}. The terminal may have already been killed or the ID is invalid. The ID must be the exact value returned by ${"run_in_terminal" /* RunInTerminal */}.`
        }]
      };
    }
    const startMarker = execution.instance.registerMarker?.();
    if (isMultilineCommand(args2.command)) {
      await execution.instance.sendText(args2.command, true, true);
    } else {
      await execution.instance.sendText(normalizeCommandForExecution(args2.command), true);
    }
    let recentOutput;
    if (args2.waitForOutput) {
      recentOutput = await this._waitForIdleOutput(execution, startMarker, token);
    } else {
      await timeout(2e3, token);
      recentOutput = getOutput(execution.instance, startMarker ?? void 0, { lastNLines: 20 });
    }
    const steering = isCancelSignal(args2.command) ? `

Note: The input you sent was a cancel signal (Ctrl-C / Ctrl-D / Ctrl-\\). The previously running command was interrupted, not completed. This is not a signal to end the turn \u2014 if you intend to run a recovery or follow-up command, issue it now in this same turn. Call ${"get_terminal_output" /* GetTerminalOutput */} first if you need to verify the shell is back at a prompt.` : "";
    return {
      content: [{
        kind: "text",
        value: `Successfully sent command to terminal ${args2.id}.${recentOutput ? `

Terminal output:
${recentOutput}` : ""}${steering}`
      }]
    };
  }
  /**
   * Waits for the terminal to become idle (no new output for a sustained period)
   * and returns the output produced since the given marker.
   */
  async _waitForIdleOutput(execution, startMarker, token) {
    const maxWaitMs = 3e4;
    const idleThresholdMs = 2e3;
    const pollIntervalMs = 500;
    let waited = 0;
    let lastDataTime = Date.now();
    const cts = new CancellationTokenSource(token);
    const dataListener = execution.instance.onData(() => {
      lastDataTime = Date.now();
    });
    try {
      while (!cts.token.isCancellationRequested && waited < maxWaitMs) {
        await timeout(pollIntervalMs, cts.token);
        waited += pollIntervalMs;
        const timeSinceLastData = Date.now() - lastDataTime;
        if (timeSinceLastData >= idleThresholdMs) {
          break;
        }
      }
    } finally {
      dataListener.dispose();
      cts.dispose();
    }
    return getOutput(execution.instance, startMarker ?? void 0);
  }
};

SendToTerminalTool = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IChatWidgetService),
  __decorateParam(3, ITerminalChatService)
], SendToTerminalTool);
export { isCancelSignal, SendToTerminalToolData, FocusTerminalByIdCommandId, FocusTerminalByExecutionIdCommandId, SendToTerminalTool };
