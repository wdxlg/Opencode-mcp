// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionGroupsService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionGroupsService.ts
var ISessionGroupsService = createDecorator("sessionGroupsService");

var EXPLICITLY_UNGROUPED_FIELD = "explicitlyUngroupedSessionIds";

var SessionGroupsService = class extends Disposable {
  constructor(storageService, sessionsManagementService) {
    super();
    this.storageService = storageService;
    this.sessionsManagementService = sessionsManagementService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._groups = /* @__PURE__ */ new Map();
    /** sessionId -> groupId */
    this._membership = /* @__PURE__ */ new Map();
    this._explicitlyUngroupedSessionIds = /* @__PURE__ */ new Set();
    /**
     * Sends in flight: draft (or, after graduation, committed) sessionId ->
     * groupId. A grouped send is locked here the moment it is dispatched, so a
     * later intent or a failed/concurrent send can never rebind it. Consumed
     * when the session is started.
     */
    this._inFlightSessionGroups = /* @__PURE__ */ new Map();
    this.load();
    const archivedMembershipChanged = /* @__PURE__ */ new Set();
    const archivedStateChanged = this.removeArchivedMembership(this.sessionsManagementService.getSessions(), archivedMembershipChanged);
    this.updateDefaultPlacement(this.sessionsManagementService.getSessions(), archivedMembershipChanged);
    if (archivedStateChanged || archivedMembershipChanged.size > 0) {
      this.save();
    }
    this._register(this.sessionsManagementService.onDidChangeSessions((e4) => {
      for (const session of e4.removed) {
        this._inFlightSessionGroups.delete(session.sessionId);
      }
      const changed = /* @__PURE__ */ new Set();
      const archivedStateChanged2 = this.removeArchivedMembership([...e4.added, ...e4.changed], changed);
      this.updateDefaultPlacement(this.sessionsManagementService.getSessions(), changed);
      if (archivedStateChanged2 || changed.size > 0) {
        this.save();
      }
      if (changed.size > 0) {
        this._onDidChange.fire({ groupsChanged: false, membershipChanged: changed });
      }
    }));
    this._register(this.sessionsManagementService.onDidDeleteSession((session) => {
      const membershipDeleted = this._membership.delete(session.sessionId);
      const ungroupedDeleted = this._explicitlyUngroupedSessionIds.delete(session.sessionId);
      if (membershipDeleted || ungroupedDeleted) {
        this.save();
      }
      if (membershipDeleted) {
        this._onDidChange.fire({ groupsChanged: false, membershipChanged: /* @__PURE__ */ new Set([session.sessionId]) });
      }
    }));
    this._register(this.sessionsManagementService.onDidArchiveSession((session) => {
      const membershipDeleted = this._membership.delete(session.sessionId);
      const ungroupedAdded = this.markExplicitlyUngrouped(session.sessionId);
      if (membershipDeleted || ungroupedAdded) {
        this.save();
      }
      if (membershipDeleted) {
        this._onDidChange.fire({ groupsChanged: false, membershipChanged: /* @__PURE__ */ new Set([session.sessionId]) });
      }
    }));
    this._register(this.sessionsManagementService.onWillSendRequest((session) => {
      if (this._pendingNewSessionGroupId === void 0) {
        return;
      }
      this._inFlightSessionGroups.set(session.sessionId, this._pendingNewSessionGroupId);
      this._pendingNewSessionGroupId = void 0;
    }));
    this._register(this.sessionsManagementService.onDidReplaceSession(({ from, to }) => {
      if (from.sessionId === to.sessionId) {
        return;
      }
      const groupId = this._inFlightSessionGroups.get(from.sessionId);
      if (groupId !== void 0) {
        this._inFlightSessionGroups.delete(from.sessionId);
        this._inFlightSessionGroups.set(to.sessionId, groupId);
      }
    }));
    this._register(this.sessionsManagementService.onDidStartSession((session) => {
      const groupId = this._inFlightSessionGroups.get(session.sessionId);
      if (groupId === void 0) {
        return;
      }
      this._inFlightSessionGroups.delete(session.sessionId);
      if (this._groups.has(groupId)) {
        this.addToGroup(session.sessionId, groupId);
      }
    }));
    this._register(this.sessionsManagementService.onDidDiscardNewSession(() => {
      this._pendingNewSessionGroupId = void 0;
    }));
  }
  static {
    this.STORAGE_KEY = "sessionsListControl.groups";
  }
  /** Fills missing custom-group membership from creation provenance; explicit membership or ungrouping remains authoritative. */
  updateDefaultPlacement(sessions, changed) {
    let placed;
    do {
      placed = false;
      for (const session of sessions) {
        if (session.isArchived.get() || this._membership.has(session.sessionId) || this._explicitlyUngroupedSessionIds.has(session.sessionId)) {
          continue;
        }
        const creatorResource = session.createdBySession?.get()?.session;
        const creator = creatorResource ? this.sessionsManagementService.getSession(creatorResource) : void 0;
        const creatorGroupId = creator ? this._membership.get(creator.sessionId) : void 0;
        if (creatorGroupId) {
          this.setMembership(session.sessionId, creatorGroupId, changed);
          placed = true;
        }
      }
    } while (placed);
  }
  getGroups() {
    return this.sortGroups([...this._groups.values()]);
  }
  getGroup(groupId) {
    return this._groups.get(groupId);
  }
  createGroup(name, memberSessionIds) {
    const group2 = { id: generateUuid(), name, createdAt: Date.now() };
    this._groups.set(group2.id, group2);
    const membershipChanged = /* @__PURE__ */ new Set();
    if (memberSessionIds) {
      for (const sessionId of memberSessionIds) {
        this.setMembership(sessionId, group2.id, membershipChanged);
      }
    }
    this.updateDefaultPlacement(this.sessionsManagementService.getSessions(), membershipChanged);
    this.save();
    this._onDidChange.fire({ groupsChanged: true, membershipChanged });
    return group2;
  }
  renameGroup(groupId, name) {
    const group2 = this._groups.get(groupId);
    if (!group2 || group2.name === name) {
      return;
    }
    this._groups.set(groupId, { ...group2, name });
    this.save();
    this._onDidChange.fire({ groupsChanged: true, membershipChanged: /* @__PURE__ */ new Set() });
  }
  deleteGroup(groupId) {
    if (!this._groups.delete(groupId)) {
      return;
    }
    if (this._pendingNewSessionGroupId === groupId) {
      this._pendingNewSessionGroupId = void 0;
    }
    for (const [sessionId, gid] of this._inFlightSessionGroups) {
      if (gid === groupId) {
        this._inFlightSessionGroups.delete(sessionId);
      }
    }
    const membershipChanged = /* @__PURE__ */ new Set();
    for (const [sessionId, gid] of this._membership) {
      if (gid === groupId) {
        this._membership.delete(sessionId);
        this.markExplicitlyUngrouped(sessionId);
        membershipChanged.add(sessionId);
      }
    }
    this.save();
    this._onDidChange.fire({ groupsChanged: true, membershipChanged });
  }
  addToGroup(sessionIdOrIds, groupId) {
    if (!this._groups.has(groupId)) {
      return;
    }
    const sessionIds = typeof sessionIdOrIds === "string" ? [sessionIdOrIds] : sessionIdOrIds;
    const membershipChanged = /* @__PURE__ */ new Set();
    for (const sessionId of sessionIds) {
      this.setMembership(sessionId, groupId, membershipChanged);
    }
    this.updateDefaultPlacement(this.sessionsManagementService.getSessions(), membershipChanged);
    if (membershipChanged.size === 0) {
      return;
    }
    this.save();
    this._onDidChange.fire({ groupsChanged: false, membershipChanged });
  }
  removeFromGroup(sessionId) {
    if (!this._membership.delete(sessionId)) {
      return;
    }
    this.markExplicitlyUngrouped(sessionId);
    this.save();
    this._onDidChange.fire({ groupsChanged: false, membershipChanged: /* @__PURE__ */ new Set([sessionId]) });
  }
  getGroupOfSession(sessionId) {
    return this._membership.get(sessionId);
  }
  getSessionIdsInGroup(groupId) {
    const result = [];
    for (const [sessionId, gid] of this._membership) {
      if (gid === groupId) {
        result.push(sessionId);
      }
    }
    return result;
  }
  setPendingNewSessionGroup(groupId) {
    this._pendingNewSessionGroupId = this._groups.has(groupId) ? groupId : void 0;
  }
  // -- Helpers --
  setMembership(sessionId, groupId, changed) {
    if (this._explicitlyUngroupedSessionIds.delete(sessionId) || this._membership.get(sessionId) !== groupId) {
      this._membership.set(sessionId, groupId);
      changed.add(sessionId);
    }
  }
  markExplicitlyUngrouped(sessionId) {
    const size3 = this._explicitlyUngroupedSessionIds.size;
    this._explicitlyUngroupedSessionIds.add(sessionId);
    return this._explicitlyUngroupedSessionIds.size !== size3;
  }
  removeArchivedMembership(sessions, changed) {
    let stateChanged = false;
    for (const session of sessions) {
      if (session.isArchived.get()) {
        if (this._membership.delete(session.sessionId)) {
          changed.add(session.sessionId);
          stateChanged = true;
        }
        stateChanged = this.markExplicitlyUngrouped(session.sessionId) || stateChanged;
      }
    }
    return stateChanged;
  }
  /**
   * Sort groups for display as a stable baseline: newest first (by creation
   * time). The final user-managed order is applied by the section-order
   * service; this baseline is used where that order is not available.
   */
  sortGroups(groups) {
    return groups.sort((a, b) => b.createdAt - a.createdAt);
  }
  // -- Storage --
  load() {
    const raw = this.storageService.get(SessionGroupsService.STORAGE_KEY, 0 /* PROFILE */);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.groups)) {
        for (const group2 of parsed.groups) {
          if (group2 && typeof group2.id === "string" && typeof group2.name === "string") {
            this._groups.set(group2.id, {
              id: group2.id,
              name: group2.name,
              createdAt: typeof group2.createdAt === "number" ? group2.createdAt : Date.now()
            });
          }
        }
      }
      if (parsed.membership && typeof parsed.membership === "object") {
        for (const [sessionId, groupId] of Object.entries(parsed.membership)) {
          if (typeof groupId === "string" && this._groups.has(groupId)) {
            this._membership.set(sessionId, groupId);
          }
        }
      }
      const explicitlyUngroupedSessionIds = parsed[EXPLICITLY_UNGROUPED_FIELD];
      if (Array.isArray(explicitlyUngroupedSessionIds)) {
        for (const sessionId of explicitlyUngroupedSessionIds) {
          if (typeof sessionId === "string") {
            this._explicitlyUngroupedSessionIds.add(sessionId);
          }
        }
      }
    } catch {
    }
  }
  save() {
    if (this._groups.size === 0 && this._explicitlyUngroupedSessionIds.size === 0) {
      this.storageService.remove(SessionGroupsService.STORAGE_KEY, 0 /* PROFILE */);
      return;
    }
    const state = {
      groups: [...this._groups.values()],
      membership: Object.fromEntries(this._membership),
      [EXPLICITLY_UNGROUPED_FIELD]: [...this._explicitlyUngroupedSessionIds]
    };
    this.storageService.store(SessionGroupsService.STORAGE_KEY, JSON.stringify(state), 0 /* PROFILE */, 0 /* USER */);
  }
};

SessionGroupsService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ISessionsManagementService)
], SessionGroupsService);

registerSingleton(ISessionGroupsService, SessionGroupsService, 1 /* Delayed */);
export { ISessionGroupsService, EXPLICITLY_UNGROUPED_FIELD, SessionGroupsService };
