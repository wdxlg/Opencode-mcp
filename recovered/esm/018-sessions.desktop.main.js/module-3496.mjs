// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionsListModelService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Codicon } from "./module-0085.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionsListModelService.ts
var ISessionsListModelService = createDecorator("sessionsListModelService");

var SessionsListModelService = class extends Disposable {
  constructor(storageService, sessionsManagementService) {
    super();
    this.storageService = storageService;
    this.sessionsManagementService = sessionsManagementService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._pinnedSessionIds = this.loadSet(SessionsListModelService.PINNED_SESSIONS_KEY);
    this._sortOverrides = this.loadSortOverrides();
    this._updatedDefaultPlacements = this.loadUpdatedDefaultPlacements();
    const legacyRead = this.loadSet(SessionsListModelService.LEGACY_READ_SESSIONS_KEY);
    this._legacyReadSessionIds = legacyRead.size > 0 ? legacyRead : void 0;
    this._migratedReadSessionIds = this.loadSet(SessionsListModelService.READ_MIGRATION_DONE_KEY);
    this._register(this.sessionsManagementService.onDidChangeSessions(() => this.updateDefaultPlacement(this.sessionsManagementService.getSessions())));
    this.updateDefaultPlacement(this.sessionsManagementService.getSessions());
    this._register(this.sessionsManagementService.onDidDeleteSession((session) => {
      this.deleteSession(session);
    }));
  }
  static {
    this.PINNED_SESSIONS_KEY = "sessionsListControl.pinnedSessions";
  }
  static {
    this.SORT_OVERRIDES_KEY = "sessionsListControl.sortOverrides";
  }
  static {
    this.UPDATED_DEFAULT_PLACEMENTS_KEY = "sessionsListControl.updatedDefaultPlacements";
  }
  static {
    this.LEGACY_READ_SESSIONS_KEY = "sessionsListControl.readSessions";
  }
  static {
    this.READ_MIGRATION_DONE_KEY = "sessionsListControl.readMigrationDone";
  }
  static {
    this.UNREAD_DEFAULT_CUTOFF = /* @__PURE__ */ new Date("2026-05-12T00:00:00.000Z");
  }
  // -- Legacy read-state migration --
  // TODO@sandy081 Remove after 2026-10-14. Additive only: never marks unread
  // (the provider already defaults to unread); the one-shot guard stops a later
  // legitimate unread from being re-flipped to read on refresh.
  migrateLegacyReadState(session) {
    const sessionId = session.sessionId;
    if (this._migratedReadSessionIds.has(sessionId)) {
      return;
    }
    const wasRead = (this._legacyReadSessionIds?.has(sessionId) ?? false) || session.updatedAt.get() < SessionsListModelService.UNREAD_DEFAULT_CUTOFF;
    if (!wasRead) {
      return;
    }
    this.sessionsManagementService.markRead(session);
    this._migratedReadSessionIds.add(sessionId);
    this.saveSet(SessionsListModelService.READ_MIGRATION_DONE_KEY, this._migratedReadSessionIds);
  }
  // -- Pinning --
  pinSession(session) {
    if (this._pinnedSessionIds.has(session.sessionId)) {
      return;
    }
    this._pinnedSessionIds.add(session.sessionId);
    this.saveSet(SessionsListModelService.PINNED_SESSIONS_KEY, this._pinnedSessionIds);
    this._onDidChange.fire({ changes: [{ sessionId: session.sessionId, kind: "pinned" /* Pinned */ }] });
  }
  unpinSession(session) {
    if (!this._pinnedSessionIds.has(session.sessionId)) {
      return;
    }
    this._pinnedSessionIds.delete(session.sessionId);
    this.saveSet(SessionsListModelService.PINNED_SESSIONS_KEY, this._pinnedSessionIds);
    this._onDidChange.fire({ changes: [{ sessionId: session.sessionId, kind: "pinned" /* Pinned */ }] });
  }
  unpinSessions(sessions) {
    const changed = [];
    for (const session of sessions) {
      if (this._pinnedSessionIds.delete(session.sessionId)) {
        changed.push({ sessionId: session.sessionId, kind: "pinned" /* Pinned */ });
      }
    }
    if (changed.length > 0) {
      this.saveSet(SessionsListModelService.PINNED_SESSIONS_KEY, this._pinnedSessionIds);
      this._onDidChange.fire({ changes: changed });
    }
  }
  isSessionPinned(session) {
    return this._pinnedSessionIds.has(session.sessionId);
  }
  // -- Manual sort order --
  /** Fills missing sort overrides so created sessions start beside their creator; existing overrides remain authoritative. */
  updateDefaultPlacement(sessionsToCheck) {
    const sessions = this.sessionsManagementService.getSessions();
    const changedSessionIds = /* @__PURE__ */ new Set();
    let sortChanged = this.expireUpdatedDefaultPlacements(sessionsToCheck, changedSessionIds);
    for (const mode of ["created", "updated"]) {
      for (const session of sessionsToCheck) {
        if (this.ensureCreatorAdjacentSortOverride(session, mode, sessions, /* @__PURE__ */ new Set(), changedSessionIds)) {
          sortChanged = true;
        }
      }
    }
    if (sortChanged) {
      this.saveSortOverrides();
      this.saveUpdatedDefaultPlacements();
    }
    if (changedSessionIds.size > 0) {
      this._onDidChange.fire({
        changes: [...changedSessionIds].map((sessionId) => ({ sessionId, kind: "sort" /* Sort */ }))
      });
    }
  }
  ensureCreatorAdjacentSortOverride(session, mode, sessions, visiting, changedSessionIds) {
    if (this._sortOverrides[mode].has(session.sessionId) || mode === "updated" && this._updatedDefaultPlacements.has(session.sessionId)) {
      return false;
    }
    const creatorResource = session.createdBySession?.get()?.session;
    if (!creatorResource) {
      return false;
    }
    const creator = this.sessionsManagementService.getSession(creatorResource);
    if (!creator || visiting.has(session.sessionId)) {
      return false;
    }
    visiting.add(session.sessionId);
    this.ensureCreatorAdjacentSortOverride(creator, mode, sessions, visiting, changedSessionIds);
    visiting.delete(session.sessionId);
    if (creator.createdBySession?.get() && !this._sortOverrides[mode].has(creator.sessionId)) {
      return false;
    }
    const creatorKey = this.getSortKey(creator, mode);
    const sorted = sessions.filter((candidate) => candidate.sessionId !== session.sessionId).sort((a, b) => this.getSortKey(b, mode) - this.getSortKey(a, mode));
    const creatorIndex = sorted.findIndex((candidate) => candidate.sessionId === creator.sessionId);
    if (creatorIndex < 0) {
      return false;
    }
    const below = sorted[creatorIndex + 1];
    const belowKey = below ? this.getSortKey(below, mode) : void 0;
    const createdSessionKey = belowKey !== void 0 && creatorKey > belowKey ? (creatorKey + belowKey) / 2 : creatorKey - 6e4;
    this._sortOverrides[mode].set(session.sessionId, createdSessionKey);
    if (mode === "updated") {
      this._updatedDefaultPlacements.set(session.sessionId, this.getNaturalSortKey(session, mode));
    }
    changedSessionIds.add(session.sessionId);
    return true;
  }
  expireUpdatedDefaultPlacements(sessionsToCheck, changedSessionIds) {
    let changed = false;
    for (const session of sessionsToCheck) {
      const naturalKeyAtPlacement = this._updatedDefaultPlacements.get(session.sessionId);
      if (naturalKeyAtPlacement === void 0 || naturalKeyAtPlacement === null || naturalKeyAtPlacement === this.getNaturalSortKey(session, "updated")) {
        continue;
      }
      this._sortOverrides.updated.delete(session.sessionId);
      this._updatedDefaultPlacements.set(session.sessionId, null);
      changedSessionIds.add(session.sessionId);
      changed = true;
    }
    return changed;
  }
  getNaturalSortKey(session, mode) {
    return mode === "updated" ? session.updatedAt.get().getTime() : session.createdAt.getTime();
  }
  getSortKey(session, mode) {
    const override = this._sortOverrides[mode].get(session.sessionId);
    return override ?? this.getNaturalSortKey(session, mode);
  }
  hasSortOverride(sessionId, mode) {
    return this._sortOverrides[mode].has(sessionId);
  }
  applySortChanges(mode, set, clear) {
    const map = this._sortOverrides[mode];
    const changes = [];
    let updatedDefaultPlacementChanged = false;
    for (const sessionId of clear) {
      if (mode === "updated" && this._updatedDefaultPlacements.delete(sessionId)) {
        updatedDefaultPlacementChanged = true;
      }
      const session = this.sessionsManagementService.getSessions().find((session2) => session2.sessionId === sessionId);
      if (session?.createdBySession?.get()) {
        const naturalKey = this.getNaturalSortKey(session, mode);
        if (map.get(sessionId) !== naturalKey) {
          map.set(sessionId, naturalKey);
          changes.push({ sessionId, kind: "sort" /* Sort */ });
        }
      } else if (map.delete(sessionId)) {
        changes.push({ sessionId, kind: "sort" /* Sort */ });
      }
    }
    for (const [sessionId, value2] of set) {
      if (mode === "updated" && this._updatedDefaultPlacements.delete(sessionId)) {
        updatedDefaultPlacementChanged = true;
      }
      if (map.get(sessionId) !== value2) {
        map.set(sessionId, value2);
        changes.push({ sessionId, kind: "sort" /* Sort */ });
      }
    }
    if (changes.length > 0) {
      this.saveSortOverrides();
      this._onDidChange.fire({ changes });
    }
    if (updatedDefaultPlacementChanged) {
      this.saveUpdatedDefaultPlacements();
    }
  }
  // -- Status icon --
  getStatusIcon(status2, isRead, isArchived, completedStateIcon) {
    switch (status2) {
      case 1 /* InProgress */:
        return { ...Codicon.sessionInProgress, color: themeColorFromId("textLink.foreground") };
      case 2 /* NeedsInput */:
        return { ...Codicon.circleFilled, color: themeColorFromId("list.warningForeground") };
      case 4 /* Error */:
        return { ...Codicon.error, color: themeColorFromId("errorForeground") };
      default:
        if (isArchived) {
          return { ...Codicon.passFilled, color: themeColorFromId("agentSessionReadIndicator.foreground") };
        }
        if (!isRead) {
          return { ...Codicon.circleFilled, color: themeColorFromId("textLink.foreground") };
        }
        if (completedStateIcon) {
          return completedStateIcon;
        }
        return { ...Codicon.circleSmallFilled, color: themeColorFromId("agentSessionReadIndicator.foreground") };
    }
  }
  // -- Cleanup --
  deleteSession(session) {
    const changes = [];
    if (this._pinnedSessionIds.delete(session.sessionId)) {
      this.saveSet(SessionsListModelService.PINNED_SESSIONS_KEY, this._pinnedSessionIds);
      changes.push({ sessionId: session.sessionId, kind: "pinned" /* Pinned */ });
    }
    let sortChanged = false;
    if (this._sortOverrides.created.delete(session.sessionId)) {
      sortChanged = true;
    }
    if (this._sortOverrides.updated.delete(session.sessionId)) {
      sortChanged = true;
    }
    if (this._updatedDefaultPlacements.delete(session.sessionId)) {
      this.saveUpdatedDefaultPlacements();
    }
    if (sortChanged) {
      this.saveSortOverrides();
      changes.push({ sessionId: session.sessionId, kind: "sort" /* Sort */ });
    }
    if (changes.length > 0) {
      this._onDidChange.fire({ changes });
    }
  }
  // -- Storage helpers --
  loadSet(key3) {
    const raw = this.storageService.get(key3, 0 /* PROFILE */);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      } catch {
      }
    }
    return /* @__PURE__ */ new Set();
  }
  saveSet(key3, set) {
    if (set.size === 0) {
      this.storageService.remove(key3, 0 /* PROFILE */);
    } else {
      this.storageService.store(key3, JSON.stringify([...set]), 0 /* PROFILE */, 0 /* USER */);
    }
  }
  loadSortOverrides() {
    const result = { created: /* @__PURE__ */ new Map(), updated: /* @__PURE__ */ new Map() };
    const raw = this.storageService.get(SessionsListModelService.SORT_OVERRIDES_KEY, 0 /* PROFILE */);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        for (const mode of ["created", "updated"]) {
          const entries2 = parsed[mode];
          if (entries2) {
            for (const [sessionId, value2] of Object.entries(entries2)) {
              if (typeof value2 === "number") {
                result[mode].set(sessionId, value2);
              }
            }
          }
        }
      } catch {
      }
    }
    return result;
  }
  saveSortOverrides() {
    if (this._sortOverrides.created.size === 0 && this._sortOverrides.updated.size === 0) {
      this.storageService.remove(SessionsListModelService.SORT_OVERRIDES_KEY, 0 /* PROFILE */);
      return;
    }
    const serialized = {
      created: Object.fromEntries(this._sortOverrides.created),
      updated: Object.fromEntries(this._sortOverrides.updated)
    };
    this.storageService.store(SessionsListModelService.SORT_OVERRIDES_KEY, JSON.stringify(serialized), 0 /* PROFILE */, 0 /* USER */);
  }
  loadUpdatedDefaultPlacements() {
    const result = /* @__PURE__ */ new Map();
    const raw = this.storageService.get(SessionsListModelService.UPDATED_DEFAULT_PLACEMENTS_KEY, 0 /* PROFILE */);
    if (!raw) {
      return result;
    }
    try {
      const parsed = JSON.parse(raw);
      for (const [sessionId, value2] of Object.entries(parsed)) {
        if (typeof value2 === "number" || value2 === null) {
          result.set(sessionId, value2);
        }
      }
    } catch {
    }
    return result;
  }
  saveUpdatedDefaultPlacements() {
    if (this._updatedDefaultPlacements.size === 0) {
      this.storageService.remove(SessionsListModelService.UPDATED_DEFAULT_PLACEMENTS_KEY, 0 /* PROFILE */);
      return;
    }
    this.storageService.store(
      SessionsListModelService.UPDATED_DEFAULT_PLACEMENTS_KEY,
      JSON.stringify(Object.fromEntries(this._updatedDefaultPlacements)),
      0 /* PROFILE */,
      0 /* USER */
    );
  }
};

SessionsListModelService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ISessionsManagementService)
], SessionsListModelService);

registerSingleton(ISessionsListModelService, SessionsListModelService, 1 /* Delayed */);
export { ISessionsListModelService, SessionsListModelService };
