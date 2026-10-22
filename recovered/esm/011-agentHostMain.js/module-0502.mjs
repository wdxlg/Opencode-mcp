// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/localCommands/bangLocalCommand.ts
import { Disposable, toDisposable } from "./module-0010.mjs";
import { parseBangCommand } from "./module-0501.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { generateUuid } from "./module-0042.mjs";
import { localize } from "./module-0012.mjs";
import { URI } from "./module-0023.mjs";
import { DEFAULT_SHELL_COMMAND_TIMEOUT_MS, executeShellCommand, shellTypeForExecutable } from "./module-0223.mjs";
import { LocalChatCommandRegistry } from "./module-0499.mjs";


// src/vs/platform/agentHost/node/localCommands/bangLocalCommand.ts
var BangLocalCommand = class extends Disposable {
  constructor(_context) {
    super();
    this._context = _context;
    this.name = "bang";
    this.recordsLocalTurn = true;
    /** Terminals kept alive for transcript output; disposed with this command. */
    this._terminals = /* @__PURE__ */ new Set();
    this._register(toDisposable(() => {
      for (const terminalUri of this._terminals) {
        this._context.terminalManager.disposeTerminal(terminalUri);
      }
      this._terminals.clear();
    }));
  }
  tryHandle(request) {
    const command = parseBangCommand(request.text);
    if (command === void 0) {
      return void 0;
    }
    return { run: () => this._run(request.turnChannel, request.turnId, command), suggestedTitle: command };
  }
  async _run(turnChannel, turnId, command) {
    const ctx = this._context;
    const sessionChannel = isAhpChatChannel(turnChannel) ? parseRequiredSessionUriFromChatUri(turnChannel) : turnChannel;
    const toolCallId = generateUuid();
    const terminalUri = `agenthost-terminal://bang/${generateUuid()}`;
    const displayName = localize(2631, null);
    let terminalCreated = false;
    try {
      const workingDirStr = ctx.getState(sessionChannel)?.workingDirectories?.[0];
      const cwd3 = workingDirStr ? URI.parse(workingDirStr).fsPath : void 0;
      const shellPath = await ctx.terminalManager.getDefaultShell();
      const shellType = shellTypeForExecutable(shellPath);
      ctx.dispatch(turnChannel, {
        type: "chat/toolCallStart" /* ChatToolCallStart */,
        turnId,
        toolCallId,
        toolName: "terminal",
        displayName,
        intention: command
      });
      ctx.dispatch(turnChannel, {
        type: "chat/toolCallReady" /* ChatToolCallReady */,
        turnId,
        toolCallId,
        invocationMessage: command,
        toolInput: command,
        confirmed: "not-needed" /* NotNeeded */
      });
      const claim = {
        kind: "session" /* Session */,
        session: sessionChannel,
        chat: turnChannel,
        turnId,
        toolCallId
      };
      const params = { channel: terminalUri, claim, name: displayName, cwd: cwd3 };
      await ctx.terminalManager.createTerminal(params, { shell: shellPath, preventShellHistory: true, nonInteractive: true });
      terminalCreated = true;
      this._terminals.add(terminalUri);
      const terminalContent = { type: "terminal" /* Terminal */, resource: terminalUri, title: displayName };
      ctx.dispatch(turnChannel, {
        type: "chat/toolCallContentChanged" /* ChatToolCallContentChanged */,
        turnId,
        toolCallId,
        content: [terminalContent]
      });
      const result = await executeShellCommand({ terminalUri, shellType }, command, DEFAULT_SHELL_COMMAND_TIMEOUT_MS, ctx.terminalManager, ctx.logService);
      const { success, pastTenseMessage } = this._summarizeResult(result);
      const content = [terminalContent];
      if (result.output) {
        content.push({ type: "text" /* Text */, text: result.output });
      }
      ctx.dispatch(turnChannel, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId,
        toolCallId,
        result: { success, pastTenseMessage, content }
      });
    } catch (err) {
      ctx.logService.error(`[BangLocalCommand] Command failed for session=${sessionChannel}: ${err instanceof Error ? err.message : String(err)}`, err);
      if (terminalCreated) {
        ctx.terminalManager.disposeTerminal(terminalUri);
        this._terminals.delete(terminalUri);
      }
      ctx.dispatch(turnChannel, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId,
        toolCallId,
        result: {
          success: false,
          pastTenseMessage: localize(2627, null),
          error: { message: err instanceof Error ? err.message : String(err) }
        }
      });
    }
  }
  /**
   * Maps a shell command result to a success flag and past-tense summary for
   * the completed tool call.
   */
  _summarizeResult(result) {
    switch (result.status) {
      case "completed": {
        const exitCode = result.exitCode ?? 0;
        return exitCode === 0 ? { success: true, pastTenseMessage: localize(2629, null) } : { success: false, pastTenseMessage: localize(2626, null, exitCode) };
      }
      case "timeout":
        return { success: false, pastTenseMessage: localize(2632, null) };
      case "shellExited":
        return { success: false, pastTenseMessage: localize(2630, null) };
      case "background":
        return { success: true, pastTenseMessage: localize(2625, null) };
      case "altBuffer":
        return { success: true, pastTenseMessage: localize(2628, null) };
    }
  }
};

LocalChatCommandRegistry.register(BangLocalCommand);
export { BangLocalCommand };
