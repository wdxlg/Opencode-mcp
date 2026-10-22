// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/sideChat/sideChatContribution.ts
import { createChatMementoKey } from "./module-0487.mjs";
import { Disposable } from "./module-0010.mjs";
import { resolveLastNonLocalTurnId } from "./module-0486.mjs";
import { buildBoundedSideChatSourceContext, getSideChatPartialResponse, injectSideChatContext, resolveSideChatBoundary, sliceSideChatTurns } from "./module-0546.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostLocalTurns } from "./module-0498.mjs";


// src/vs/platform/agentHost/node/chatContributions/sideChat/sideChatContribution.ts
var sideChatSeededMemento = createChatMementoKey("seeded", () => false);

var SideChatContribution = class extends Disposable {
  constructor(_context, _stateManager, _localTurns) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    this._localTurns = _localTurns;
    this.order = 500;
  }
  static {
    this.id = "sideChat";
  }
  onOutgoingTurn(turn) {
    const origin = this._stateManager.getChatOrigin(turn.chat);
    if (origin?.kind !== "sideChat" /* SideChat */ || this._context.memento(sideChatSeededMemento, turn.chat).get()) {
      return void 0;
    }
    const sourceState = this._stateManager.getChatState(origin.chat);
    const activeTurn = sourceState?.activeTurn?.id === origin.turnId ? sourceState.activeTurn : void 0;
    const forkAnchorTurnId = activeTurn ? resolveLastNonLocalTurnId(sourceState?.turns ?? [], (turnId) => this._localTurns.isLocal(origin.chat, turnId)) : void 0;
    const sourceContext = activeTurn || this._localTurns.isLocal(origin.chat, origin.turnId) ? buildBoundedSideChatSourceContext(sourceState?.turns ?? [], origin.turnId, activeTurn, forkAnchorTurnId) : void 0;
    const partialResponse = getSideChatPartialResponse(activeTurn);
    return {
      text: injectSideChatContext(turn.message.text, partialResponse, sourceContext, origin.selection?.text)
    };
  }
  onTurnEnd(turn) {
    if (turn.reason.kind !== "success" || this._stateManager.getChatOrigin(turn.channel)?.kind !== "sideChat" /* SideChat */) {
      return;
    }
    this._context.memento(sideChatSeededMemento, turn.channel).set(true, void 0);
  }
  onHydrateTurns(context, turns) {
    const origin = this._stateManager.getChatOrigin(context.chat);
    if (origin?.kind !== "sideChat" /* SideChat */) {
      return turns;
    }
    const inheritedTurnId = this._stateManager.getChatInheritedTurnId(context.chat);
    const sideChatBoundary = {
      ...inheritedTurnId !== void 0 ? { inheritedTurnId } : {}
    };
    const boundary = resolveSideChatBoundary(turns, sideChatBoundary);
    if (turns.slice(boundary).some((turn) => turn.state === "complete" /* Complete */)) {
      this._context.memento(sideChatSeededMemento, context.chat).set(true, void 0);
    }
    return boundary === turns.length ? turns : sliceSideChatTurns(turns, sideChatBoundary);
  }
};

SideChatContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, IAgentHostLocalTurns)
], SideChatContribution);
export { sideChatSeededMemento, SideChatContribution };
