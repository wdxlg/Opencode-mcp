// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/common/sessionChangesStatsCache.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/common/sessionChangesStatsCache.ts
function readSessionChangesStats(session, reader) {
  const summary = session.changesSummary?.read(reader);
  if (summary) {
    return { files: summary.files, insertions: summary.additions, deletions: summary.deletions };
  }
  const changesets = session.changesets.read(reader);
  const defaultChangeset = changesets?.find((changeset) => changeset.isDefault.read(reader));
  const changes = defaultChangeset?.changes.read(reader) ?? session.changes.read(reader);
  if (changesets === void 0 && changes.length === 0) {
    return void 0;
  }
  let insertions = 0, deletions = 0;
  for (const change of changes) {
    insertions += change.insertions;
    deletions += change.deletions;
  }
  return { files: changes.length, insertions, deletions };
}

function sessionChangesStatsEqual(a, b) {
  if (!a || !b) {
    return a === b;
  }
  return a.files === b.files && a.insertions === b.insertions && a.deletions === b.deletions;
}

var ISessionChangesStatsCache = createDecorator("sessionChangesStatsCache");

var MAX_CACHED_SESSION_CHANGES_STATS = 30;

var STORAGE_KEY2 = "sessions.changesStatsCache";

var SessionChangesStatsCache = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
    this._entries = observableValue(this, this._load());
    this._register(this._storageService.onDidChangeValue(-1 /* APPLICATION */, STORAGE_KEY2, this._store)((e4) => {
      if (e4.external) {
        this._entries.set(this._load(), void 0);
      }
    }));
  }
  get(sessionId, reader) {
    return this._entries.read(reader).get(sessionId);
  }
  set(sessionId, stats) {
    const current = this._entries.get();
    const existing = current.get(sessionId);
    if (stats.files === 0 && existing === void 0) {
      return;
    }
    const isNewest = sessionId === Array.from(current.keys()).at(-1);
    if (isNewest && sessionChangesStatsEqual(existing, stats)) {
      return;
    }
    const updated = new Map(current);
    updated.delete(sessionId);
    if (stats.files > 0) {
      updated.set(sessionId, stats);
    }
    while (updated.size > MAX_CACHED_SESSION_CHANGES_STATS) {
      const oldest = updated.keys().next().value;
      if (oldest === void 0) {
        break;
      }
      updated.delete(oldest);
    }
    this._entries.set(updated, void 0);
    this._save(updated);
  }
  _load() {
    const entries2 = /* @__PURE__ */ new Map();
    const raw = this._storageService.get(STORAGE_KEY2, -1 /* APPLICATION */);
    if (!raw) {
      return entries2;
    }
    try {
      const stored = JSON.parse(raw);
      if (!Array.isArray(stored)) {
        return entries2;
      }
      for (const entry of stored.slice(-MAX_CACHED_SESSION_CHANGES_STATS)) {
        if (typeof entry?.sessionId === "string" && typeof entry.files === "number" && typeof entry.insertions === "number" && typeof entry.deletions === "number") {
          entries2.set(entry.sessionId, { files: entry.files, insertions: entry.insertions, deletions: entry.deletions });
        }
      }
    } catch {
      return /* @__PURE__ */ new Map();
    }
    return entries2;
  }
  _save(entries2) {
    if (entries2.size === 0) {
      this._storageService.remove(STORAGE_KEY2, -1 /* APPLICATION */);
      return;
    }
    const stored = [...entries2].map(([sessionId, stats]) => ({ sessionId, ...stats }));
    this._storageService.store(STORAGE_KEY2, JSON.stringify(stored), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

SessionChangesStatsCache = __decorateClass([
  __decorateParam(0, IStorageService)
], SessionChangesStatsCache);

registerSingleton(ISessionChangesStatsCache, SessionChangesStatsCache, 1 /* Delayed */);
export { readSessionChangesStats, sessionChangesStatsEqual, ISessionChangesStatsCache, MAX_CACHED_SESSION_CHANGES_STATS, STORAGE_KEY2, SessionChangesStatsCache };
