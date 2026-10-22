// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/persistedTurnUsage/persistedTurnUsageContribution.ts
import { Disposable } from "./module-0010.mjs";
import { chatStorageUri, hasReportedUsage, isAhpChatChannel, isSubagentChatUri } from "./module-0047.mjs";
import { isChatAction } from "./module-0086.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";


// src/vs/platform/agentHost/node/chatContributions/persistedTurnUsage/persistedTurnUsageContribution.ts
var PersistedTurnUsageContribution = class extends Disposable {
  constructor(_context, _logService, _sessionDataService) {
    super();
    this._context = _context;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this.order = 100;
  }
  static {
    this.id = "persistedTurnUsage";
  }
  onDidDispatchAction(dispatched) {
    if (dispatched.rejectionReason !== void 0) {
      return;
    }
    if (isAhpChatChannel(dispatched.channel) && isChatAction(dispatched.action)) {
      this._trackTurnUsage(dispatched.channel, dispatched.action);
    }
  }
  /**
   * Re-attaches persisted per-turn {@link UsageInfo} to reconstructed turns.
   *
   * Agent backends don't durably record token/credit usage - the Copilot
   * SDK's `assistant.usage` event is explicitly ephemeral and the Claude
   * transcript replay produces none - so restored turns come back without it.
   * Without this the chat's context-usage gauge stays hidden after a reload
   * and the session cost total restarts from zero. Usage recorded live by this
   * contribution is looked up by turn id (or the turn's SDK event id, which is
   * what a restored turn is keyed by).
   *
   * NOTE: the lookup only lands for providers that record the bridge between
   * the live protocol turn id (a host-generated uuid) and the id a restored
   * turn is keyed by. Today only Copilot does, via `setTurnEventId`. Claude
   * restores turns keyed by transcript uuid and never populates
   * `turns.event_id`, so its rows are written but never matched; giving it a
   * gauge after reload needs that bridge recorded first.
   */
  async onHydrateTurns(context, turns) {
    const chat = URI.parse(context.chat);
    if (turns.length === 0 || turns.every((turn) => hasReportedUsage(turn.usage)) || isSubagentChatUri(chat.toString())) {
      return turns;
    }
    const storage = chatStorageUri(chat);
    if (!storage) {
      return turns;
    }
    let usages;
    const ref = await this._sessionDataService.tryOpenDatabase(storage);
    if (!ref) {
      return turns;
    }
    try {
      usages = await ref.object.getTurnUsages();
      this._logService.trace(`[AgentService] getTurnUsages done: ${usages.size} row(s) for ${storage.toString()}`);
    } catch (err) {
      this._logService.warn(`[AgentService] Failed to read persisted turn usage for ${storage.toString()}`, err);
      return turns;
    } finally {
      ref.dispose();
    }
    if (usages.size === 0) {
      return turns;
    }
    return turns.map((turn) => {
      const raw = hasReportedUsage(turn.usage) ? void 0 : usages.get(turn.id);
      if (!raw) {
        return turn;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return turn;
        }
        const persisted = parsed;
        const meta = { ...turn.usage?._meta, ...persisted._meta };
        return {
          ...turn,
          usage: {
            ...turn.usage,
            ...persisted,
            ...Object.keys(meta).length > 0 ? { _meta: meta } : {}
          }
        };
      } catch {
        return turn;
      }
    });
  }
  /**
   * Persists the usage reported for a chat's turn.
   *
   * Agent backends do not durably record token/credit usage themselves (the
   * Copilot SDK's `assistant.usage` event is explicitly ephemeral, and the
   * Claude transcript replay produces none), so a restored session would
   * otherwise come back with no context-usage gauge and a session cost of 0.
   * See this contribution's {@link onHydrateTurns} for which providers can
   * currently match these rows back on restore.
   *
   * Written on every report rather than buffered until the turn ends: the row
   * is keyed by turn id and written with `INSERT OR REPLACE` through a
   * sequencer, so "last report wins" is already a property of the storage
   * layer, and persisting eagerly means a turn cut short by a crash or
   * disconnect keeps the usage it had already accrued.
   *
   * Subagent chats are skipped: their cost is already folded into the parent
   * turn's aggregate, so recording it again would double-count.
   */
  _trackTurnUsage(channel, action) {
    if (action.type !== "chat/usage" /* ChatUsage */ || isSubagentChatUri(channel)) {
      return;
    }
    if (!action.turnId) {
      return;
    }
    const storage = chatStorageUri(channel);
    if (!storage) {
      return;
    }
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(storage);
    } catch (err) {
      this._logService.warn(`[AgentSideEffects] Failed to open database to persist turn usage for ${channel}`, err);
      return;
    }
    ref.object.setTurnUsage(action.turnId, JSON.stringify(action.usage)).catch((err) => {
      this._logService.warn(`[AgentSideEffects] Failed to persist turn usage for ${channel}/${action.turnId}`, err);
    }).finally(() => ref.dispose());
  }
};

PersistedTurnUsageContribution = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ISessionDataService)
], PersistedTurnUsageContribution);
export { PersistedTurnUsageContribution };
