// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/localCommands/localChatCommand.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { persistSessionMetadata } from "./module-0482.mjs";
import { StopWatch } from "./module-0015.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostLocalTurns } from "./module-0498.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostChatContributions } from "./module-0487.mjs";
import { IAgentHostSessionTitleController } from "./module-0491.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostTerminalManager } from "./module-0191.mjs";
import { ISessionDataService } from "./module-0139.mjs";


// src/vs/platform/agentHost/node/localCommands/localChatCommand.ts
var LocalChatCommandRegistryImpl = class {
  constructor() {
    this._ctors = [];
  }
  register(ctor) {
    this._ctors.push(ctor);
  }
  createAll(context) {
    return this._ctors.map((ctor) => new ctor(context));
  }
};

var LocalChatCommandRegistry = new LocalChatCommandRegistryImpl();

var IAgentHostLocalCommands = createDecorator("agentHostLocalCommands");

var AgentHostLocalCommands = class extends Disposable {
  constructor(_localTurns, _stateManager, _chatContributions, _titleController, _logService, _terminalManager, _sessionDataService) {
    super();
    this._localTurns = _localTurns;
    this._stateManager = _stateManager;
    this._chatContributions = _chatContributions;
    this._titleController = _titleController;
    this._logService = _logService;
    this._terminalManager = _terminalManager;
    this._sessionDataService = _sessionDataService;
    const context = {
      logService: this._logService,
      terminalManager: this._terminalManager,
      dispatch: (channel, action) => this._stateManager.dispatchServerAction(channel, action),
      getState: (channel) => this._stateManager.getSessionState(channel),
      updateChatTitle: (session, chat, title) => this._stateManager.updateChatTitle(session, chat, title),
      persistSessionFlag: (session, key, value) => persistSessionMetadata(this._sessionDataService, this._logService, session, key, value),
      markTitleRenamed: (session, chat) => this._titleController.markTitleRenamed(session, chat)
    };
    this._commands = LocalChatCommandRegistry.createAll(context).map((command) => this._register(command));
  }
  /**
   * Offers `request` to each command. When one handles it, the dispatcher has
   * already scheduled its `run`; it returns the {@link ILocalChatCommandHandling}
   * so the caller can act on carried metadata such as
   * {@link ILocalChatCommandHandling.suggestedTitle}. Its presence means the
   * caller MUST NOT forward the message to the agent (and MUST NOT invoke `run`
   * again). Returns `undefined` when no command applies.
   */
  tryHandle(request) {
    for (const command of this._commands) {
      const handling = command.tryHandle(request);
      if (handling) {
        void this._run(command, handling, request);
        return handling;
      }
    }
    return void 0;
  }
  async _run(command, handling, request) {
    const stopWatch = StopWatch.create(false);
    try {
      await handling.run();
    } catch (err) {
      this._logService.error(`[AgentHostLocalCommands] Command '${command.name}' failed: ${err instanceof Error ? err.message : String(err)}`, err);
    } finally {
      this._stateManager.dispatchServerAction(request.turnChannel, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId: request.turnId, duration: Math.max(0, stopWatch.elapsed()) });
      if (command.recordsLocalTurn) {
        this._recordLocalTurn(request.turnChannel, request.turnId);
      }
      const session = isAhpChatChannel(request.turnChannel) ? parseRequiredSessionUriFromChatUri(request.turnChannel) : request.turnChannel;
      this._chatContributions.turnEnd({ session, channel: request.turnChannel, turnId: request.turnId, reason: { kind: "localCommand" } });
    }
  }
  /**
   * Records the just-completed turn `turnId` as a host-injected local turn so
   * it survives reload and fork/truncate can resolve it to the preceding
   * concrete turn. Works uniformly for the default chat and any peer chat —
   * the turn is keyed by its chat channel. Live terminal references are
   * stripped from the payload (the PTY does not survive a reload).
   */
  _recordLocalTurn(turnChannel, turnId) {
    const chat = turnChannel;
    const session = isAhpChatChannel(turnChannel) ? parseRequiredSessionUriFromChatUri(turnChannel) : turnChannel;
    const turns = this._stateManager.getSessionState(turnChannel)?.turns;
    if (!turns) {
      return;
    }
    const index = turns.findIndex((t) => t.id === turnId);
    if (index < 0) {
      return;
    }
    const anchorTurnId = this._localTurns.findAnchorTurnId(chat, turns, turnId);
    this._localTurns.record(session, chat, sanitizeLocalTurnForPersistence(turns[index]), anchorTurnId);
  }
};

AgentHostLocalCommands = __decorateClass([
  __decorateParam(0, IAgentHostLocalTurns),
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, IAgentHostChatContributions),
  __decorateParam(3, IAgentHostSessionTitleController),
  __decorateParam(4, ILogService),
  __decorateParam(5, IAgentHostTerminalManager),
  __decorateParam(6, ISessionDataService)
], AgentHostLocalCommands);

function sanitizeLocalTurnForPersistence(turn) {
  const responseParts = turn.responseParts.map((part) => {
    if (part.kind !== "toolCall" /* ToolCall */) {
      return part;
    }
    const tc = part.toolCall;
    if (tc.status !== "running" /* Running */ && tc.status !== "completed" /* Completed */ && tc.status !== "pending-result-confirmation" /* PendingResultConfirmation */) {
      return part;
    }
    if (!tc.content) {
      return part;
    }
    const content = tc.content.filter((c) => c.type !== "terminal" /* Terminal */);
    if (content.length === tc.content.length) {
      return part;
    }
    return { ...part, toolCall: { ...tc, content } };
  });
  return { ...turn, responseParts };
}
export { sanitizeLocalTurnForPersistence, LocalChatCommandRegistryImpl, LocalChatCommandRegistry, IAgentHostLocalCommands, AgentHostLocalCommands };
