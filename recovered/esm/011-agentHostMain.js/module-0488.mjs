// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentSessionRegistry.ts
import { Disposable } from "./module-0010.mjs";
import { URI } from "./module-0023.mjs";
import { Limiter } from "./module-0027.mjs";


// src/vs/platform/agentHost/node/agentSessionRegistry.ts
var AgentSessionRegistry = class extends Disposable {
  constructor(_database) {
    super();
    this._database = _database;
  }
  /** Records a session using source-aware provenance and tombstone behavior. */
  register(session, sessionOptions, registerOptions) {
    return this._database.registerSession(session.toString(), sessionOptions, registerOptions);
  }
  /** Removes any registry entry for `session` without writing a tombstone. */
  async unregister(session) {
    await this._database.unregisterSession(session.toString());
  }
  /**
   * Removes any registry entry for `session` (a true delete) and durably
   * tombstones it so discovery cannot register it. Used both to delete a
   * session the user explicitly removed and to keep a session that must never
   * be listed (e.g. a throwaway chat surface) out of the registry entirely.
   * No-op on the registry entry if absent; the tombstone is still written.
   */
  async tombstone(session) {
    await this._database.tombstoneAndUnregisterSession(session.toString());
  }
  /** Advances the durable last-observed provider modification time. */
  updateModifiedTime(session, modifiedTime) {
    return this._database.updateSessionModifiedTime(session.toString(), modifiedTime);
  }
  /** Every registered session URI key without running legacy metadata migration. */
  async listSessionKeys() {
    return new Set((await this._database.listSessions()).map((entry) => entry.session));
  }
  /**
   * Every session currently recorded, in no particular order. Legacy entries
   * are passed through `migrate`, when provided, before the resolved list is returned.
   */
  async list(migrate) {
    const entries = (await this._database.listSessions()).map((entry) => ({
      session: URI.parse(entry.session),
      provider: entry.provider,
      startTime: entry.startTime,
      modifiedTime: entry.modifiedTime,
      external: entry.external,
      source: entry.source
    }));
    const limiter = new Limiter(4);
    const migrations2 = migrate ? await Promise.all(entries.map((entry) => limiter.queue(() => migrate(entry)))) : entries.map(() => void 0);
    const updates = [];
    const result = entries.map((entry, index) => {
      const migrated = migrations2[index];
      if (migrated) {
        updates.push({
          session: migrated.session.toString(),
          external: migrated.external
        });
        return migrated;
      }
      if (entry.external === void 0) {
        throw new Error(`Session migration did not resolve registry entry ${entry.session.toString()}`);
      }
      return {
        ...entry,
        external: entry.external
      };
    });
    if (updates.length > 0) {
      await this._database.updateSessionExternal(updates);
    }
    return result;
  }
  /** Returns the session registered under `session`, or `undefined` when it is unknown. */
  async get(session, migrate) {
    const stored = await this._database.getSession(session.toString());
    if (!stored) {
      return void 0;
    }
    const entry = {
      session: URI.parse(stored.session),
      provider: stored.provider,
      startTime: stored.startTime,
      modifiedTime: stored.modifiedTime,
      external: stored.external,
      source: stored.source
    };
    const migrated = await migrate?.(entry);
    if (migrated) {
      await this._database.updateSessionExternal([{ session: migrated.session.toString(), external: migrated.external }]);
      return migrated;
    }
    if (entry.external === void 0) {
      throw new Error(`Session migration did not resolve registry entry ${entry.session.toString()}`);
    }
    return {
      ...entry,
      external: entry.external
    };
  }
  /** Whether the registry has ever been populated. Retained for compatibility. */
  async isEmpty() {
    return this._database.isSessionRegistryEmpty();
  }
  /**
   * @deprecated legacy global one-shot marker, retained for reading databases
   * written before per-provider tracking existed; see
   * {@link isProviderBackfilled} for per-provider discovery diagnostics.
   */
  async isBackfilled() {
    return this._database.isSessionRegistryBackfilled();
  }
  /**
   * @deprecated legacy global one-shot marker; see {@link markProviderBackfilled}.
   * Not invoked by the per-provider backfill sweep — see the class doc comment.
   */
  async markBackfilled() {
    await this._database.markSessionRegistryBackfilled();
  }
  /** Whether a specific provider has completed native discovery at least once. */
  async isProviderBackfilled(provider) {
    return this._database.isProviderBackfilled(provider);
  }
  /** Records a provider-native discovery pass idempotently. */
  async markProviderBackfilled(provider) {
    await this._database.markProviderBackfilled(provider);
  }
  /** Whether `session` was explicitly deleted and must not be resurrected by backfill. */
  async isTombstoned(session) {
    return this._database.isSessionTombstoned(session.toString());
  }
  /** Clears an explicit-deletion tombstone for `session` (used on explicit create/restore). */
  async clearTombstone(session) {
    await this._database.clearSessionTombstone(session.toString());
  }
  /** Maintains the host-owned index of Agent-Merge-enabled sessions. */
  async setAgentMergeEnabled(session, enabled) {
    await this._database.setSessionAgentMergeEnabled(session.toString(), enabled);
  }
  /** Session URIs the index marks Agent-Merge-enabled, without opening any session database. */
  async listAgentMergeEnabled() {
    const sessions = await this._database.listAgentMergeEnabledSessions();
    return sessions.map((session) => URI.parse(session));
  }
};
export { AgentSessionRegistry };
