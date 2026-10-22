// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/chatGroupsView.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { $, size } from "./module-0075.mjs";
import { DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { isSessionChatDrag } from "./module-3488.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { ChatGroupDropTarget } from "./module-3494.mjs";
import { autorun } from "./module-0052.mjs";
import { SerializableGrid, Sizing2 } from "./module-1508.mjs";
import { ChatGroupView } from "./module-3493.mjs";
import { transaction } from "./module-0045.mjs";
import { URI } from "./module-0032.mjs";
import { agentsPanelBorder } from "./module-1496.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { Color } from "./module-0197.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/browser/parts/chatGroupsView.ts
var ChatGroupsView = class extends Themable {
  constructor(themeService, _instantiationService, _sessionsService, _storageService) {
    super(themeService);
    this._instantiationService = _instantiationService;
    this._sessionsService = _sessionsService;
    this._storageService = _storageService;
    this.element = $(".chat-groups-view");
    this._sessionDisposables = this._register(new MutableDisposable());
    this._groupDisposables = this._register(new DisposableMap());
    this._groups = [];
    this._groupCount = observableValue(this, 1);
    this._nextGroupId = 0;
    this._sessionActive = true;
    this._sessionVisible = true;
    this._singleGroupTabsReplaceHeader = observableValue(this, false);
    /** Whether a persisted layout is still being restored (saved chats may not have loaded yet). */
    this._restorePending = false;
    this._gridDidLayout = false;
  }
  static {
    this.STORAGE_KEY = "sessions.chatGroupsLayout";
  }
  /** Number of chat groups currently in the grid. `> 1` means a grid layout. */
  get groupCount() {
    return this._groupCount;
  }
  setSingleGroupTabsReplaceHeader(enabled) {
    this._singleGroupTabsReplaceHeader.set(enabled, void 0);
  }
  /** Sets (or clears) the session whose chats this view partitions into groups. */
  setSession(session, options3) {
    this._options = options3;
    if (this._session === session) {
      return;
    }
    this._persistLayout();
    this._session = session;
    const store = new DisposableStore();
    this._sessionDisposables.value = store;
    this._groupDisposables.clearAndDisposeAll();
    this._currentSessionStore = store;
    this._grid = void 0;
    this._gridDidLayout = false;
    this._groups = [];
    this._activeGroup = void 0;
    this._restoreAssignment = void 0;
    this._restoreOrder = void 0;
    this._restoreInitialIds = void 0;
    this._restorePending = false;
    this._lastSessionActiveChatId = void 0;
    this._setGroupCount(1);
    if (!session) {
      this.element.replaceChildren();
      return;
    }
    this._mainChatResource = derived((reader) => session.mainChat.read(reader).resource.toString());
    const grid = session.isCreated.get() ? this._tryRestoreLayout(session, store) ?? this._createSingleGroupGrid(session, store) : this._createSingleGroupGrid(session, store);
    this._grid = grid;
    store.add(grid);
    this.element.replaceChildren(grid.element);
    store.add(toDisposable(() => grid.element.remove()));
    const dropDelegate = {
      isChatDrag: (event) => isSessionChatDrag(event, session.sessionId),
      findTargetGroup: (child) => this._findTargetGroup(child),
      onChatDrop: (groupId, zone, data) => {
        this._onChatDrop(groupId, zone, data).catch(onUnexpectedError);
      }
    };
    store.add(this._instantiationService.createInstance(ChatGroupDropTarget, this.element, dropDelegate));
    store.add(autorun((reader) => this._reconcile(reader)));
    this._applyLayout();
  }
  _createSingleGroupGrid(session, store) {
    const firstGroup = this._createGroupEntry(session);
    this._groups = [firstGroup];
    this._activeGroup = firstGroup;
    firstGroup.view.setGroupActive(true);
    this._setGroupCount(1);
    return new SerializableGrid(firstGroup.view, { styles: { separatorBorder: this._separatorBorder } });
  }
  /**
   * Rebuilds a persisted grid layout for the session, if one is stored. Returns
   * `undefined` to fall back to a single group. Saved chats may not have loaded
   * yet (the catalog arrives asynchronously); {@link _reconcile} routes them back
   * to their groups via {@link _restoreAssignment} once they appear.
   */
  _tryRestoreLayout(session, store) {
    const saved = this._loadStored(session.sessionId);
    if (!saved || saved.groups.length <= 1) {
      return void 0;
    }
    const indexToEntry = /* @__PURE__ */ new Map();
    const deserializer = {
      fromJSON: (json) => {
        const index2 = typeof json?.index === "number" ? json.index : indexToEntry.size;
        const entry = this._createGroupEntry(session);
        indexToEntry.set(index2, entry);
        return entry.view;
      }
    };
    let grid;
    try {
      grid = SerializableGrid.deserialize(saved.grid, deserializer, { styles: { separatorBorder: this._separatorBorder } });
    } catch (e4) {
      onUnexpectedError(e4);
      return void 0;
    }
    const groups = [];
    for (let i2 = 0; i2 < saved.groups.length; i2++) {
      const entry = indexToEntry.get(i2);
      if (entry) {
        groups.push(entry);
      }
    }
    if (groups.length <= 1) {
      grid.dispose();
      return void 0;
    }
    const assignment = /* @__PURE__ */ new Map();
    const order = /* @__PURE__ */ new Map();
    let ordinal = 0;
    saved.groups.forEach((g, i2) => {
      const entry = indexToEntry.get(i2);
      if (!entry) {
        return;
      }
      for (const id2 of g.resourceIds) {
        assignment.set(id2, entry.id);
        order.set(id2, ordinal++);
      }
      if (g.activeResourceId) {
        entry.activeResourceId.set(g.activeResourceId, void 0);
      }
    });
    this._groups = groups;
    this._restoreAssignment = assignment;
    this._restoreOrder = order;
    this._restoreInitialIds = new Set(session.visibleChatTabs.get().map((c) => c.resource.toString()));
    this._restorePending = true;
    this._activeGroup = indexToEntry.get(saved.activeGroupIndex) ?? groups[0];
    for (const group2 of this._groups) {
      group2.view.setGroupActive(group2 === this._activeGroup);
    }
    this._setGroupCount(this._groups.length);
    return grid;
  }
  _createGroupEntry(session) {
    const id2 = this._nextGroupId++;
    const store = new DisposableStore();
    this._groupDisposables.set(id2, store);
    const resourceIds = observableValue(`chatGroup.${id2}.resourceIds`, []);
    const activeResourceId = observableValue(`chatGroup.${id2}.activeResourceId`, "");
    const chats = derived((reader) => {
      const all = session.visibleChatTabs.read(reader);
      const ids = resourceIds.read(reader);
      const result = [];
      for (const idStr of ids) {
        const chat = all.find((c) => c.resource.toString() === idStr);
        if (chat) {
          result.push(chat);
        }
      }
      return result;
    });
    const tabsVisible = derived((reader) => {
      if (!session.isCreated.read(reader)) {
        return false;
      }
      if (this._groupCount.read(reader) > 1) {
        return true;
      }
      return session.shouldShowChatTabs.read(reader);
    });
    const showSessionActions = derived((reader) => this._singleGroupTabsReplaceHeader.read(reader) && this._groupCount.read(reader) === 1 && tabsVisible.read(reader));
    const view = store.add(this._instantiationService.createInstance(ChatGroupView));
    const entry = { id: id2, view, resourceIds, activeResourceId, chats, tabsVisible };
    store.add(view.onDidFocus(() => this._onGroupFocused(entry)));
    const context2 = {
      session,
      options: this._options,
      chats,
      activeChatResource: activeResourceId,
      mainChatResource: this._mainChatResource,
      tabsVisible,
      showSessionActions,
      openChat: (resource) => this._openChat(entry, resource),
      onTabDragStart: () => {
      },
      onTabDragEnd: () => {
      }
    };
    view.setContext(context2);
    view.setSessionActive(this._sessionActive);
    view.setSessionVisible(this._sessionVisible);
    return entry;
  }
  _reconcile(reader) {
    const session = this._session;
    if (!session) {
      return;
    }
    const chats = session.visibleChatTabs.read(reader);
    const activeChat = session.activeChat.read(reader);
    const orderedIds = chats.map((c) => c.resource.toString());
    const validIds = new Set(orderedIds);
    const activeId = activeChat?.resource.toString();
    const hasUnassignedVisibleChats = orderedIds.some((id2) => !this._groups.some((group2) => group2.resourceIds.get().includes(id2)));
    if (!this._restorePending && !hasUnassignedVisibleChats) {
      this._removeGroupsWithoutVisibleChats(validIds);
    }
    transaction((tx) => {
      for (const group2 of this._groups) {
        const ids = group2.resourceIds.get();
        const pruned = ids.filter((id2) => validIds.has(id2));
        if (pruned.length !== ids.length) {
          group2.resourceIds.set(pruned, tx);
        }
      }
      const assigned = /* @__PURE__ */ new Set();
      for (const group2 of this._groups) {
        for (const id2 of group2.resourceIds.get()) {
          assigned.add(id2);
        }
      }
      for (const id2 of orderedIds) {
        if (assigned.has(id2)) {
          continue;
        }
        const savedGroupId = this._restoreAssignment?.get(id2);
        let target = savedGroupId !== void 0 ? this._groups.find((g) => g.id === savedGroupId) : void 0;
        const chat = chats.find((chat2) => chat2.resource.toString() === id2);
        const parentResource = id2 === activeId ? chat?.origin?.parentChat : void 0;
        const parentGroup = parentResource ? this._groups.find((group2) => group2.resourceIds.get().includes(parentResource.toString())) : void 0;
        target ??= parentGroup ? this._findAdjacentGroup(parentGroup) : void 0;
        target ??= this._activeGroup;
        if (target) {
          target.resourceIds.set([...target.resourceIds.get(), id2], tx);
        }
      }
      if (this._restorePending && this._restoreOrder) {
        const restoreOrder = this._restoreOrder;
        for (const group2 of this._groups) {
          const ids = group2.resourceIds.get();
          const sorted = [...ids].sort((a, b) => (restoreOrder.get(a) ?? Number.MAX_SAFE_INTEGER) - (restoreOrder.get(b) ?? Number.MAX_SAFE_INTEGER));
          if (sorted.some((id2, i2) => id2 !== ids[i2])) {
            group2.resourceIds.set(sorted, tx);
          }
        }
      }
      if (activeId && activeId !== this._lastSessionActiveChatId) {
        const owner = this._groups.find((g) => g.resourceIds.get().includes(activeId));
        if (owner) {
          owner.activeResourceId.set(activeId, tx);
          this._setActiveGroup(owner);
        }
      }
      this._lastSessionActiveChatId = activeId;
      for (const group2 of this._groups) {
        const ids = group2.resourceIds.get();
        if (ids.length && !ids.includes(group2.activeResourceId.get())) {
          group2.activeResourceId.set(ids[0], tx);
        }
      }
    });
    if (this._restorePending) {
      const allSavedPresent = this._restoreAssignment ? [...this._restoreAssignment.keys()].every((id2) => validIds.has(id2)) : true;
      const catalogChanged = !this._restoreInitialIds || orderedIds.length !== this._restoreInitialIds.size || orderedIds.some((id2) => !this._restoreInitialIds.has(id2));
      const catalogSettled = !session.loading.read(reader);
      if (allSavedPresent || catalogChanged || catalogSettled) {
        this._restorePending = false;
        this._restoreAssignment = void 0;
        this._restoreOrder = void 0;
        this._restoreInitialIds = void 0;
      }
    }
    if (!this._restorePending) {
      this._removeEmptyGroups();
      this._persistLayout();
    }
  }
  _findTargetGroup(child) {
    for (const group2 of this._groups) {
      if (group2.view.element.contains(child)) {
        return { id: group2.id, element: group2.view.element };
      }
    }
    return void 0;
  }
  async _onChatDrop(targetGroupId, zone, data) {
    if (!data || !this._session) {
      return;
    }
    if (data.sessionId !== this._session.sessionId) {
      return;
    }
    const id2 = data.resource;
    const resource = URI.parse(id2);
    let target = this._groups.find((g) => g.id === targetGroupId);
    let source = this._groups.find((g) => g.resourceIds.get().includes(id2));
    if (!source) {
      const session = this._session;
      if (!session.chats.get().some((chat) => chat.resource.toString() === id2)) {
        return;
      }
      await this._sessionsService.openChat(session, resource);
      if (this._session !== session) {
        return;
      }
      target = this._groups.find((g) => g.id === targetGroupId);
      source = this._groups.find((g) => g.resourceIds.get().includes(id2));
    }
    if (!target || !source) {
      return;
    }
    if (zone === "center") {
      if (source === target) {
        return;
      }
      this._moveChatToGroup(resource, source, target);
    } else {
      if (source === target && source.resourceIds.get().length <= 1) {
        return;
      }
      await this._splitChatIntoNewGroup(resource, source, target, zone);
    }
  }
  _moveChatToGroup(resource, source, target) {
    const id2 = resource.toString();
    transaction((tx) => {
      this._detachChatFromGroup(source, id2, tx);
      if (!target.resourceIds.get().includes(id2)) {
        target.resourceIds.set([...target.resourceIds.get(), id2], tx);
      }
      target.activeResourceId.set(id2, tx);
    });
    this._setActiveGroup(target);
    this._sessionsService.openChat(this._session, resource).catch(onUnexpectedError);
    this._removeEmptyGroups();
    this._persistLayout();
  }
  async _splitChatIntoNewGroup(resource, source, reference, zone) {
    if (!this._grid || !this._currentSessionStore || !this._session) {
      return;
    }
    const id2 = resource.toString();
    const newGroup = this._createGroupEntry(this._session);
    this._grid.addView(newGroup.view, Sizing2.Distribute, reference.view, this._zoneToDirection(zone));
    this._insertGroup(newGroup, reference, zone);
    this._setGroupCount(this._groups.length);
    transaction((tx) => {
      this._detachChatFromGroup(source, id2, tx);
      newGroup.resourceIds.set([id2], tx);
      newGroup.activeResourceId.set(id2, tx);
    });
    this._setActiveGroup(newGroup);
    await this._sessionsService.openChat(this._session, resource);
    this._removeEmptyGroups();
    this._applyLayout();
    this._persistLayout();
  }
  /**
   * Removes a chat from a group. If it was the group's active chat, activates a
   * remaining one so the source group keeps showing a chat it still owns.
   */
  _detachChatFromGroup(group2, id2, tx) {
    const remaining = group2.resourceIds.get().filter((x) => x !== id2);
    group2.resourceIds.set(remaining, tx);
    if (group2.activeResourceId.get() === id2 && remaining.length) {
      group2.activeResourceId.set(remaining[0], tx);
    }
  }
  /**
   * Opens a chat in a group beside its current group ("open to the side"). A
   * chat already sharing a group is moved into a new group to its right. A chat
   * already alone in its own group is focused without creating a duplicate.
   */
  async openChatInNewGroup(resource) {
    if (!this._session || !this._grid || !this._currentSessionStore) {
      return;
    }
    const id2 = resource.toString();
    const existing = this._groups.find((g) => g.resourceIds.get().includes(id2));
    if (existing) {
      if (existing.resourceIds.get().length > 1) {
        await this._splitChatIntoNewGroup(resource, existing, existing, "right");
        return;
      }
      existing.activeResourceId.set(id2, void 0);
      this._setActiveGroup(existing);
      await this._sessionsService.openChat(this._session, resource);
      return;
    }
    const reference = this._activeGroup ?? this._groups[0];
    if (!reference) {
      return;
    }
    const session = this._session;
    await this._sessionsService.openChat(session, resource);
    if (this._session !== session || !session.visibleChatTabs.get().some((chat) => chat.resource.toString() === id2)) {
      return;
    }
    const newGroup = this._createGroupEntry(session);
    this._grid.addView(newGroup.view, Sizing2.Distribute, reference.view, 3 /* Right */);
    this._insertGroup(newGroup, reference, "right");
    this._setGroupCount(this._groups.length);
    transaction((tx) => {
      const assignedGroup = this._groups.find((group2) => group2 !== newGroup && group2.resourceIds.get().includes(id2));
      if (assignedGroup) {
        this._detachChatFromGroup(assignedGroup, id2, tx);
      }
      newGroup.resourceIds.set([id2], tx);
      newGroup.activeResourceId.set(id2, tx);
    });
    this._setActiveGroup(newGroup);
    this._removeEmptyGroups();
    this._applyLayout();
    this._persistLayout();
  }
  _findAdjacentGroup(reference) {
    if (this._grid && this._gridDidLayout) {
      for (const direction of [3 /* Right */, 2 /* Left */, 1 /* Down */, 0 /* Up */]) {
        const neighbor = this._grid.getNeighborViews(reference.view, direction)[0];
        const group2 = neighbor && this._groups.find((candidate) => candidate.view === neighbor);
        if (group2) {
          return group2;
        }
      }
    }
    const referenceIndex = this._groups.indexOf(reference);
    return this._groups[referenceIndex + 1] ?? this._groups[referenceIndex - 1];
  }
  _insertGroup(group2, reference, zone) {
    const referenceIndex = this._groups.indexOf(reference);
    const insertBefore = zone === "left" || zone === "top";
    this._groups.splice(referenceIndex + (insertBefore ? 0 : 1), 0, group2);
  }
  /**
   * Places a freshly created chat (e.g. a side chat) beside the current one.
   * Unlike {@link openChatInNewGroup} — which focuses the chat in place when it
   * is already visible — this moves the chat out of a shared group into its own
   * group to the right so it sits next to the chat it was created from. Called
   * only at creation time; if the chat is already alone in its group (nothing to
   * sit beside) it is left where it is.
   */
  splitChatToSide(resource) {
    if (!this._session || !this._grid || !this._currentSessionStore) {
      return;
    }
    const id2 = resource.toString();
    const source = this._groups.find((g) => g.resourceIds.get().includes(id2));
    if (source) {
      if (source.resourceIds.get().length <= 1) {
        this._setActiveGroup(source);
        return;
      }
      this._splitChatIntoNewGroup(resource, source, source, "right").catch(onUnexpectedError);
      return;
    }
    if (this._groups.some((g) => g.resourceIds.get().some((x) => x !== id2))) {
      this.openChatInNewGroup(resource).catch(onUnexpectedError);
    }
  }
  _removeEmptyGroups() {
    this._removeGroups((group2) => group2.resourceIds.get().length === 0);
  }
  _removeGroupsWithoutVisibleChats(visibleChatIds) {
    this._removeGroups((group2) => group2.resourceIds.get().every((id2) => !visibleChatIds.has(id2)));
  }
  _removeGroups(shouldRemove) {
    if (!this._grid || this._groups.length <= 1) {
      return;
    }
    const groups = this._groups.filter(shouldRemove);
    for (const group2 of groups) {
      if (this._groups.length <= 1) {
        break;
      }
      const hadFocus = group2.view.element.contains(group2.view.element.ownerDocument.activeElement);
      this._grid.removeView(group2.view, Sizing2.Distribute);
      this._groups = this._groups.filter((g) => g !== group2);
      if (this._activeGroup === group2) {
        this._activeGroup = this._groups[0];
        this._activeGroup?.view.setGroupActive(true);
      }
      this._groupDisposables.deleteAndDispose(group2.id);
      if (hadFocus) {
        this._activeGroup?.view.focus();
      }
    }
    this._setGroupCount(this._groups.length);
  }
  _setActiveGroup(entry) {
    if (this._activeGroup === entry) {
      return;
    }
    this._activeGroup = entry;
    for (const group2 of this._groups) {
      group2.view.setGroupActive(group2 === entry);
    }
    this._persistLayout();
  }
  /**
   * Handles focus entering a group: promotes it to the active group and, when
   * that group is currently collapsed to its minimum size in a split, expands it
   * so the other groups collapse to their minimum. Focusing an already-expanded
   * group (or a balanced/manual layout) leaves the sizes untouched.
   */
  _onGroupFocused(entry) {
    this._setActiveGroup(entry);
    const session = this._session;
    const activeResourceId = entry.activeResourceId.get();
    if (session && activeResourceId && session.activeChat.get().resource.toString() !== activeResourceId) {
      this._sessionsService.openChat(session, URI.parse(activeResourceId)).catch(onUnexpectedError);
    }
    if (!this._grid || this._groups.length < 2 || !this._isGroupCollapsed(entry.view)) {
      return;
    }
    const gridSize = this._grid.getViewSize();
    this._grid.resizeView(entry.view, { width: gridSize.width, height: gridSize.height });
    this._persistLayout();
  }
  /**
   * Whether the group is squeezed to (near) its minimum along an axis where the
   * grid has room to be larger — i.e. the user has collapsed it in a split.
   */
  _isGroupCollapsed(view) {
    if (!this._grid) {
      return false;
    }
    const COLLAPSE_THRESHOLD = 8;
    const size3 = this._grid.getViewSize(view);
    const gridSize = this._grid.getViewSize();
    const collapsedHorizontally = size3.width <= view.minimumWidth + COLLAPSE_THRESHOLD && gridSize.width > view.minimumWidth + COLLAPSE_THRESHOLD;
    const collapsedVertically = size3.height <= view.minimumHeight + COLLAPSE_THRESHOLD && gridSize.height > view.minimumHeight + COLLAPSE_THRESHOLD;
    return collapsedHorizontally || collapsedVertically;
  }
  _setGroupCount(count2) {
    this._groupCount.set(count2, void 0);
    this.element.classList.toggle("single-group", count2 <= 1);
    this._groups.forEach((group2, index2) => group2.view.setGroupPosition(index2, count2));
  }
  _openChat(entry, resource) {
    entry.activeResourceId.set(resource.toString(), void 0);
    this._setActiveGroup(entry);
    if (this._session) {
      this._sessionsService.openChat(this._session, resource).catch(onUnexpectedError);
    }
  }
  focusAdjacentGroup(direction) {
    const activeIndex = this._activeGroup ? this._groups.indexOf(this._activeGroup) : -1;
    if (activeIndex < 0 || this._groups.length < 2) {
      return;
    }
    const offset = direction === "next" ? 1 : -1;
    const target = this._groups[(activeIndex + offset + this._groups.length) % this._groups.length];
    this._onGroupFocused(target);
    target.view.focus();
  }
  splitActiveChat(direction) {
    const source = this._activeGroup;
    const resource = source?.activeResourceId.get();
    if (source && resource && source.resourceIds.get().length > 1) {
      this._splitChatIntoNewGroup(URI.parse(resource), source, source, direction).catch(onUnexpectedError);
    }
  }
  moveActiveChatToAdjacentGroup(direction) {
    const source = this._activeGroup;
    const sourceIndex = source ? this._groups.indexOf(source) : -1;
    const resource = source?.activeResourceId.get();
    if (!source || sourceIndex < 0 || !resource || this._groups.length < 2) {
      return;
    }
    const offset = direction === "next" ? 1 : -1;
    const target = this._groups[(sourceIndex + offset + this._groups.length) % this._groups.length];
    this._moveChatToGroup(URI.parse(resource), source, target);
    target.view.focus();
  }
  _zoneToDirection(zone) {
    switch (zone) {
      case "left":
        return 2 /* Left */;
      case "right":
        return 3 /* Right */;
      case "top":
        return 0 /* Up */;
      case "bottom":
        return 1 /* Down */;
      default:
        return 3 /* Right */;
    }
  }
  setSessionActive(active) {
    if (this._sessionActive === active) {
      return;
    }
    this._sessionActive = active;
    for (const group2 of this._groups) {
      group2.view.setSessionActive(active);
    }
  }
  setSessionVisible(visible) {
    if (this._sessionVisible === visible) {
      return;
    }
    this._sessionVisible = visible;
    for (const group2 of this._groups) {
      group2.view.setSessionVisible(visible);
    }
  }
  submitInput() {
    return this._activeGroup?.view.submitInput() ?? Promise.resolve(false);
  }
  selectWorkspace(folderUri, providerId) {
    this._activeGroup?.view.selectWorkspace(folderUri, providerId);
  }
  prefillInput(text2) {
    this._activeGroup?.view.prefillInput(text2);
  }
  sendQuery(text2) {
    this._activeGroup?.view.sendQuery(text2);
  }
  attach(uris) {
    this._activeGroup?.view.attach(uris);
  }
  focus() {
    this._activeGroup?.view.focus();
  }
  layout(width2, height, top2, left) {
    this._lastLayout = { width: width2, height, top: top2, left };
    this._applyLayout();
  }
  _applyLayout() {
    if (!this._lastLayout) {
      return;
    }
    const { width: width2, height, top: top2, left } = this._lastLayout;
    size(this.element, width2, height);
    if (this._grid) {
      this._grid.layout(width2, height, top2, left);
      this._gridDidLayout = true;
    }
  }
  get _separatorBorder() {
    return this.theme.getColor(agentsPanelBorder) || this.theme.getColor(contrastBorder) || Color.transparent;
  }
  updateStyles() {
    super.updateStyles();
    this._grid?.style({ separatorBorder: this._separatorBorder });
  }
  /** Persists the current grid layout for the active session (or clears it when a single group). */
  _persistLayout() {
    if (!this._session || !this._grid || this._restorePending) {
      return;
    }
    const sessionId = this._session.sessionId;
    if (!this._session.isCreated.get()) {
      this._saveStored(sessionId, void 0);
      return;
    }
    if (this._groups.length <= 1) {
      this._saveStored(sessionId, void 0);
      return;
    }
    this._groups.forEach((group2, i2) => group2.view.setSerializationIndex(i2));
    const layout2 = {
      version: 1,
      grid: this._grid.serialize(),
      groups: this._groups.map((group2) => ({ resourceIds: group2.resourceIds.get(), activeResourceId: group2.activeResourceId.get() })),
      activeGroupIndex: Math.max(0, this._groups.indexOf(this._activeGroup))
    };
    this._saveStored(sessionId, layout2);
  }
  _readStoredLayouts() {
    const raw = this._storageService.get(ChatGroupsView.STORAGE_KEY, 1 /* WORKSPACE */);
    if (!raw) {
      return {};
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  _loadStored(sessionId) {
    const entry = this._readStoredLayouts()[sessionId];
    return entry?.version === 1 ? entry : void 0;
  }
  _saveStored(sessionId, layout2) {
    const layouts = this._readStoredLayouts();
    if (layout2) {
      layouts[sessionId] = layout2;
    } else if (layouts[sessionId] === void 0) {
      return;
    } else {
      delete layouts[sessionId];
    }
    this._storageService.store(ChatGroupsView.STORAGE_KEY, JSON.stringify(layouts), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  dispose() {
    this._persistLayout();
    super.dispose();
  }
};

ChatGroupsView = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IStorageService)
], ChatGroupsView);
export { ChatGroupsView };
