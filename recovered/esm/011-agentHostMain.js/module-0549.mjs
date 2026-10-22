// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/turnDelegation/turnDelegationContribution.ts
import { Disposable } from "./module-0010.mjs";
import { parseAgentMessageDelegationMeta, readAgentMessageDelegationMeta, toAgentMessageDelegationMeta } from "./module-0378.mjs";
import { chatStorageUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";


// src/vs/platform/agentHost/node/chatContributions/turnDelegation/turnDelegationContribution.ts
var TurnDelegationContribution = class extends Disposable {
  constructor(_context, _logService, _sessionDataService) {
    super();
    this._context = _context;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this.order = 50;
  }
  static {
    this.id = "turnDelegation";
  }
  async onOutgoingTurn(turn) {
    const delegation = readAgentMessageDelegationMeta(turn.message);
    if (!delegation) {
      return void 0;
    }
    const storage = chatStorageUri(turn.chat);
    if (!storage) {
      return void 0;
    }
    const ref = this._sessionDataService.openDatabase(storage);
    try {
      await ref.object.setTurnDelegation(turn.turnId, JSON.stringify(delegation));
    } finally {
      ref.dispose();
    }
    return void 0;
  }
  async onHydrateTurns(context, turns) {
    if (turns.length === 0) {
      return turns;
    }
    const storage = chatStorageUri(URI.parse(context.chat));
    if (!storage) {
      return turns;
    }
    const ref = await this._sessionDataService.tryOpenDatabase(storage);
    if (!ref) {
      return turns;
    }
    let delegations;
    try {
      delegations = await ref.object.getTurnDelegations();
    } catch (error) {
      this._logService.warn(`[TurnDelegationContribution] Failed to restore turn delegation for ${storage.toString()}`, error);
      return turns;
    } finally {
      ref.dispose();
    }
    if (delegations.size === 0) {
      return turns;
    }
    return turns.map((turn) => {
      const raw = delegations.get(turn.id);
      if (!raw) {
        return turn;
      }
      let delegation;
      try {
        delegation = parseAgentMessageDelegationMeta(JSON.parse(raw));
      } catch {
        return turn;
      }
      if (!delegation) {
        return turn;
      }
      return {
        ...turn,
        message: {
          ...turn.message,
          origin: { kind: "agent" /* Agent */ },
          _meta: {
            ...turn.message._meta,
            ...toAgentMessageDelegationMeta(delegation)
          }
        }
      };
    });
  }
};

TurnDelegationContribution = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ISessionDataService)
], TurnDelegationContribution);
export { TurnDelegationContribution };
