// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostDatabase.ts
import { dirname } from "./module-0018.mjs";


// src/vs/platform/agentHost/node/agentHostDatabase.ts
import * as fs14 from "fs";

var migrations = [
  {
    version: 1,
    sql: [
      `CREATE TABLE IF NOT EXISTS sessions (
				session_uri TEXT PRIMARY KEY NOT NULL,
				provider    TEXT NOT NULL,
				start_time  INTEGER NOT NULL
			)`,
      `CREATE TABLE IF NOT EXISTS metadata (
				key   TEXT PRIMARY KEY NOT NULL,
				value TEXT NOT NULL
			)`
    ].join(";\n")
  },
  {
    version: 2,
    sql: "ALTER TABLE sessions ADD COLUMN external INTEGER"
  },
  {
    version: 3,
    sql: [
      `ALTER TABLE sessions ADD COLUMN registration_source TEXT NOT NULL DEFAULT 'explicit'`,
      `UPDATE sessions SET registration_source = CASE WHEN external = 1 THEN 'discovery' ELSE 'explicit' END`
    ].join(";\n")
  },
  {
    version: 4,
    sql: [
      "ALTER TABLE sessions ADD COLUMN modified_time INTEGER NOT NULL DEFAULT 0",
      "UPDATE sessions SET modified_time = start_time"
    ].join(";\n")
  }
];

function openDatabase(path) {
  return new Promise((resolve3, reject) => {
    import("@vscode/sqlite3").then((sqlite3) => {
      const database = new sqlite3.default.Database(path, (error) => error ? reject(error) : resolve3(database));
    }, reject);
  });
}

function exec(database, sql) {
  return new Promise((resolve3, reject) => database.exec(sql, (error) => error ? reject(error) : resolve3()));
}

function run(database, sql, parameters) {
  return new Promise((resolve3, reject) => {
    database.run(sql, parameters, function(error) {
      error ? reject(error) : resolve3();
    });
  });
}

function runReturningChanges(database, sql, parameters) {
  return new Promise((resolve3, reject) => {
    database.run(sql, parameters, function(error) {
      error ? reject(error) : resolve3(this.changes);
    });
  });
}

function get(database, sql, parameters) {
  return new Promise((resolve3, reject) => {
    database.get(sql, parameters, (error, row) => error ? reject(error) : resolve3(row));
  });
}

function all(database, sql, parameters) {
  return new Promise((resolve3, reject) => {
    database.all(sql, parameters, (error, rows) => error ? reject(error) : resolve3(rows));
  });
}

function providerBackfillKey(provider) {
  return `sessionRegistryBackfilled:${provider}`;
}

function tombstoneKey(session) {
  return `sessionTombstone:${session}`;
}

var agentMergeEnabledKeyPrefix = "agentMergeEnabled:";

function agentMergeEnabledKey(session) {
  return `${agentMergeEnabledKeyPrefix}${session}`;
}

function quoteSqlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function close2(database) {
  return new Promise((resolve3, reject) => database.close((error) => error ? reject(error) : resolve3()));
}

var AgentHostDatabase = class {
  constructor(_path) {
    this._path = _path;
  }
  async registerSession(session, sessionOptions, registerOptions) {
    const { provider, startTime, modifiedTime = startTime, source } = sessionOptions;
    const changes = await runReturningChanges(
      await this._ensureDatabase(),
      `INSERT INTO sessions (session_uri, provider, start_time, modified_time, external, registration_source)
				SELECT ?, ?, ?, ?, CASE WHEN ? = 'discovery' THEN 1 ELSE 0 END, ?
				WHERE ? = 0 OR NOT EXISTS (SELECT 1 FROM metadata WHERE key = ? AND value = 'true')
				ON CONFLICT(session_uri) DO UPDATE SET
					provider = CASE WHEN excluded.registration_source = 'explicit' THEN excluded.provider ELSE sessions.provider END,
					modified_time = MAX(sessions.modified_time, excluded.modified_time),
					external = CASE
						WHEN excluded.registration_source = 'explicit' THEN 0
						WHEN excluded.registration_source = 'restore' THEN 0
						WHEN sessions.registration_source = 'explicit' THEN sessions.external
						ELSE 1
					END,
					registration_source = CASE
						WHEN excluded.registration_source = 'explicit' THEN 'explicit'
						WHEN sessions.registration_source = 'explicit' THEN 'explicit'
						ELSE excluded.registration_source
					END`,
      [session, provider, startTime, modifiedTime, source, source, registerOptions.checkTombstone ? 1 : 0, tombstoneKey(session)]
    );
    if (!registerOptions.checkTombstone) {
      await this.clearSessionTombstone(session);
    }
    return changes > 0;
  }
  async unregisterSession(session) {
    const database = await this._ensureDatabase();
    try {
      await exec(
        database,
        `BEGIN IMMEDIATE;
				DELETE FROM sessions WHERE session_uri = ${quoteSqlString(session)};
				DELETE FROM metadata WHERE key = ${quoteSqlString(agentMergeEnabledKey(session))};
				COMMIT;`
      );
    } catch (error) {
      try {
        await exec(database, "ROLLBACK");
      } catch (rollbackError) {
        throw new AggregateError([error, rollbackError], `Failed to unregister session ${session}`);
      }
      throw error;
    }
  }
  async tombstoneAndUnregisterSession(session) {
    const database = await this._ensureDatabase();
    const sessionValue = quoteSqlString(session);
    const tombstoneValue = quoteSqlString(tombstoneKey(session));
    try {
      await exec(
        database,
        `BEGIN IMMEDIATE;
				INSERT INTO metadata (key, value) VALUES (${tombstoneValue}, 'true')
					ON CONFLICT(key) DO UPDATE SET value = excluded.value;
				DELETE FROM metadata WHERE key = ${quoteSqlString(agentMergeEnabledKey(session))};
				DELETE FROM sessions WHERE session_uri = ${sessionValue};
				COMMIT;`
      );
    } catch (error) {
      try {
        await exec(database, "ROLLBACK");
      } catch (rollbackError) {
        throw new AggregateError([error, rollbackError], `Failed to tombstone session ${session}`);
      }
      throw error;
    }
  }
  async updateSessionExternal(updates) {
    if (updates.length === 0) {
      return;
    }
    const database = await this._ensureDatabase();
    const statements = updates.map(({ session, external }) => {
      const externalValue = external ? 1 : 0;
      const source = external ? `'discovery'` : `CASE WHEN registration_source = 'explicit' THEN 'explicit' ELSE 'restore' END`;
      return `UPDATE sessions SET external = ${externalValue}, registration_source = ${source} WHERE session_uri = ${quoteSqlString(session)} AND external IS NULL`;
    });
    try {
      await exec(database, `BEGIN IMMEDIATE;
${statements.join(";\n")};
COMMIT`);
    } catch (error) {
      try {
        await exec(database, "ROLLBACK");
      } catch (rollbackError) {
        throw new AggregateError([error, rollbackError], "Failed to update legacy session provenance");
      }
      throw error;
    }
  }
  async updateSessionModifiedTime(session, modifiedTime) {
    const changes = await runReturningChanges(
      await this._ensureDatabase(),
      "UPDATE sessions SET modified_time = ? WHERE session_uri = ? AND modified_time < ?",
      [modifiedTime, session, modifiedTime]
    );
    return changes > 0;
  }
  async listSessions() {
    const rows = await all(await this._ensureDatabase(), "SELECT session_uri, provider, start_time, modified_time, external, registration_source FROM sessions", []);
    return rows.map((row) => ({
      session: row.session_uri,
      provider: row.provider,
      startTime: row.start_time,
      modifiedTime: row.modified_time,
      external: row.external === null ? void 0 : row.external === 1,
      source: row.registration_source
    }));
  }
  async getSession(session) {
    const row = await get(await this._ensureDatabase(), "SELECT session_uri, provider, start_time, modified_time, external, registration_source FROM sessions WHERE session_uri = ?", [session]);
    if (!row) {
      return void 0;
    }
    return {
      session: row.session_uri,
      provider: row.provider,
      startTime: row.start_time,
      modifiedTime: row.modified_time,
      external: row.external === null || row.external === void 0 ? void 0 : row.external === 1,
      source: row.registration_source
    };
  }
  async isSessionRegistryEmpty() {
    const row = await get(await this._ensureDatabase(), "SELECT 1 AS present FROM sessions LIMIT 1", []);
    return row === void 0;
  }
  async isSessionRegistryBackfilled() {
    const row = await get(await this._ensureDatabase(), `SELECT value FROM metadata WHERE key = 'sessionRegistryBackfilled'`, []);
    return row?.value === "true";
  }
  markSessionRegistryBackfilled() {
    return this._run(
      `INSERT INTO metadata (key, value) VALUES ('sessionRegistryBackfilled', 'true')
				ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      []
    );
  }
  async isProviderBackfilled(provider) {
    const row = await get(await this._ensureDatabase(), "SELECT value FROM metadata WHERE key = ?", [providerBackfillKey(provider)]);
    return row?.value === "true";
  }
  markProviderBackfilled(provider) {
    return this._run(
      `INSERT INTO metadata (key, value) VALUES (?, 'true')
				ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [providerBackfillKey(provider)]
    );
  }
  async isSessionTombstoned(session) {
    const row = await get(await this._ensureDatabase(), "SELECT value FROM metadata WHERE key = ?", [tombstoneKey(session)]);
    return row?.value === "true";
  }
  markSessionTombstoned(session) {
    return this._run(
      `INSERT INTO metadata (key, value) VALUES (?, 'true')
				ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [tombstoneKey(session)]
    );
  }
  clearSessionTombstone(session) {
    return this._run("DELETE FROM metadata WHERE key = ?", [tombstoneKey(session)]);
  }
  setSessionAgentMergeEnabled(session, enabled) {
    return enabled ? this._run(
      `INSERT INTO metadata (key, value) VALUES (?, 'true')
					ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [agentMergeEnabledKey(session)]
    ) : this._run("DELETE FROM metadata WHERE key = ?", [agentMergeEnabledKey(session)]);
  }
  async listAgentMergeEnabledSessions() {
    const rows = await all(
      await this._ensureDatabase(),
      `SELECT key FROM metadata WHERE key LIKE ? || '%' AND value = 'true'`,
      [agentMergeEnabledKeyPrefix]
    );
    return rows.map((row) => row.key.slice(agentMergeEnabledKeyPrefix.length));
  }
  async _run(sql, parameters) {
    await run(await this._ensureDatabase(), sql, parameters);
  }
  _ensureDatabase() {
    if (this._closed) {
      return Promise.reject(new Error("AgentHostDatabase has been disposed"));
    }
    if (!this._databasePromise) {
      this._databasePromise = (async () => {
        if (this._path !== ":memory:") {
          await fs14.promises.mkdir(dirname(this._path), { recursive: true });
        }
        const database = await openDatabase(this._path);
        try {
          database.serialize();
          const versionRow = await get(database, "PRAGMA user_version", []);
          const currentVersion = versionRow?.user_version ?? 0;
          for (const migration of migrations) {
            if (migration.version > currentVersion) {
              await exec(database, "BEGIN TRANSACTION");
              try {
                await exec(database, migration.sql);
                await exec(database, `PRAGMA user_version = ${migration.version}`);
                await exec(database, "COMMIT");
              } catch (error) {
                await exec(database, "ROLLBACK");
                throw error;
              }
            }
          }
          return database;
        } catch (error) {
          await close2(database);
          throw error;
        }
      })().catch((error) => {
        this._databasePromise = void 0;
        throw error;
      });
    }
    return this._databasePromise;
  }
  async close() {
    await (this._closed ??= this._databasePromise?.then((database) => close2(database)).catch(() => {
    }) || true);
  }
  dispose() {
    void this.close();
  }
};
export { openDatabase, exec, run, runReturningChanges, get, all, providerBackfillKey, tombstoneKey, agentMergeEnabledKey, quoteSqlString, close2, fs14, migrations, agentMergeEnabledKeyPrefix, AgentHostDatabase };
