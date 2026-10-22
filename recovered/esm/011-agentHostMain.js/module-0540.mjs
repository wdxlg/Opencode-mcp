// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/markUnread/markUnreadContribution.ts
import { Disposable } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";


// src/vs/platform/agentHost/node/chatContributions/markUnread/markUnreadContribution.ts
var MarkUnreadContribution = class extends Disposable {
  constructor(_context, _stateManager) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    // This hook was originally dispatched after all turn-complete side effects.
    // Keep it as the terminal tail while newer side effects use explicit orders.
    this.order = 500;
  }
  static {
    this.id = "markUnread";
  }
  onTurnEnd(turn) {
    if (turn.reason.kind === "localCommand" || turn.reason.kind === "rejected") {
      return;
    }
    const status = this._stateManager.getSessionSummary(turn.session)?.status ?? 0;
    if (!(status & 32 /* IsRead */)) {
      return;
    }
    this._stateManager.dispatchServerAction(turn.session, { type: "session/isReadChanged" /* SessionIsReadChanged */, isRead: false });
  }
};

MarkUnreadContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager)
], MarkUnreadContribution);
export { MarkUnreadContribution };
