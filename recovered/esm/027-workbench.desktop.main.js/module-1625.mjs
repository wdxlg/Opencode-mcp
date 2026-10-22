// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/statusbar/statusbarModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isStatusbarEntryLocation } from "./module-0893.mjs";
import { hide, isAncestorOfActiveElement, show } from "./module-0075.mjs";


// src/vs/workbench/browser/parts/statusbar/statusbarModel.ts
var StatusbarViewModel = class _StatusbarViewModel extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this._onDidChangeEntryVisibility = this._register(new Emitter());
    this.onDidChangeEntryVisibility = this._onDidChangeEntryVisibility.event;
    this._entries = [];
    this.hidden = /* @__PURE__ */ new Set();
    this.restoreState();
    this.registerListeners();
  }
  static {
    this.HIDDEN_ENTRIES_KEY = "workbench.statusbar.hidden";
  }
  // Intentionally not using a map here since multiple entries can have the same ID
  get entries() {
    return this._entries.slice(0);
  }
  get lastFocusedEntry() {
    return this._lastFocusedEntry && !this.isHidden(this._lastFocusedEntry.id) ? this._lastFocusedEntry : void 0;
  }
  restoreState() {
    const hiddenRaw = this.storageService.get(_StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* PROFILE */);
    if (hiddenRaw) {
      try {
        this.hidden = new Set(JSON.parse(hiddenRaw));
      } catch (error) {
      }
    }
  }
  registerListeners() {
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, _StatusbarViewModel.HIDDEN_ENTRIES_KEY, this._store)(() => this.onDidStorageValueChange()));
  }
  onDidStorageValueChange() {
    const currentlyHidden = new Set(this.hidden);
    this.hidden.clear();
    this.restoreState();
    const changed = /* @__PURE__ */ new Set();
    for (const id2 of currentlyHidden) {
      if (!this.hidden.has(id2)) {
        changed.add(id2);
      }
    }
    for (const id2 of this.hidden) {
      if (!currentlyHidden.has(id2)) {
        changed.add(id2);
      }
    }
    if (changed.size > 0) {
      for (const entry of this._entries) {
        if (changed.has(entry.id)) {
          this.updateVisibility(entry.id, true);
          changed.delete(entry.id);
        }
      }
    }
  }
  add(entry) {
    this._entries.push(entry);
    this.updateVisibility(entry, false);
    this.sort();
    this.markFirstLastVisibleEntry();
  }
  remove(entry) {
    const index2 = this._entries.indexOf(entry);
    if (index2 >= 0) {
      this._entries.splice(index2, 1);
      if (this._entries.some((otherEntry) => isStatusbarEntryLocation(otherEntry.priority.primary) && otherEntry.priority.primary.location.id === entry.id)) {
        this.sort();
      }
      this.markFirstLastVisibleEntry();
    }
  }
  isHidden(id2) {
    return this.hidden.has(id2);
  }
  hide(id2) {
    if (!this.hidden.has(id2)) {
      this.hidden.add(id2);
      this.updateVisibility(id2, true);
      this.saveState();
    }
  }
  show(id2) {
    if (this.hidden.delete(id2)) {
      this.updateVisibility(id2, true);
      this.saveState();
    }
  }
  findEntry(container3) {
    return this._entries.find((entry) => entry.container === container3);
  }
  getEntries(alignment) {
    return this._entries.filter((entry) => entry.alignment === alignment);
  }
  focusNextEntry() {
    this.focusEntry(1, 0);
  }
  focusPreviousEntry() {
    this.focusEntry(-1, this.entries.length - 1);
  }
  isEntryFocused() {
    return !!this.getFocusedEntry();
  }
  getFocusedEntry() {
    return this._entries.find((entry) => isAncestorOfActiveElement(entry.container));
  }
  focusEntry(delta2, restartPosition) {
    const getVisibleEntry = (start) => {
      let indexToFocus = start;
      let entry2 = indexToFocus >= 0 && indexToFocus < this._entries.length ? this._entries[indexToFocus] : void 0;
      while (entry2 && this.isHidden(entry2.id)) {
        indexToFocus += delta2;
        entry2 = indexToFocus >= 0 && indexToFocus < this._entries.length ? this._entries[indexToFocus] : void 0;
      }
      return entry2;
    };
    const focused = this.getFocusedEntry();
    if (focused) {
      const entry2 = getVisibleEntry(this._entries.indexOf(focused) + delta2);
      if (entry2) {
        this._lastFocusedEntry = entry2;
        entry2.labelContainer.focus();
        return;
      }
    }
    const entry = getVisibleEntry(restartPosition);
    if (entry) {
      this._lastFocusedEntry = entry;
      entry.labelContainer.focus();
    }
  }
  updateVisibility(arg1, trigger) {
    if (typeof arg1 === "string") {
      const id2 = arg1;
      for (const entry of this._entries) {
        if (entry.id === id2) {
          this.updateVisibility(entry, trigger);
        }
      }
    } else {
      const entry = arg1;
      const isHidden = this.isHidden(entry.id);
      if (isHidden) {
        hide(entry.container);
      } else {
        show(entry.container);
      }
      if (trigger) {
        this._onDidChangeEntryVisibility.fire({ id: entry.id, visible: !isHidden });
      }
      this.markFirstLastVisibleEntry();
    }
  }
  saveState() {
    if (this.hidden.size > 0) {
      this.storageService.store(_StatusbarViewModel.HIDDEN_ENTRIES_KEY, JSON.stringify(Array.from(this.hidden.values())), 0 /* PROFILE */, 0 /* USER */);
    } else {
      this.storageService.remove(_StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* PROFILE */);
    }
  }
  sort() {
    const allEntryIds = new Set(this._entries.map((entry) => entry.id));
    const mapEntryWithNumberedPriorityToIndex = /* @__PURE__ */ new Map();
    const mapEntryWithRelativePriority = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < this._entries.length; i2++) {
      const entry = this._entries[i2];
      if (typeof entry.priority.primary === "number" || !allEntryIds.has(entry.priority.primary.location.id)) {
        mapEntryWithNumberedPriorityToIndex.set(entry, i2);
      } else {
        const referenceEntryId = entry.priority.primary.location.id;
        let entries2 = mapEntryWithRelativePriority.get(referenceEntryId);
        if (!entries2) {
          for (const relativeEntries of mapEntryWithRelativePriority.values()) {
            if (relativeEntries.has(referenceEntryId)) {
              entries2 = relativeEntries;
              break;
            }
          }
          if (!entries2) {
            entries2 = /* @__PURE__ */ new Map();
            mapEntryWithRelativePriority.set(referenceEntryId, entries2);
          }
        }
        entries2.set(entry.id, entry);
      }
    }
    const sortedEntriesWithNumberedPriority = Array.from(mapEntryWithNumberedPriorityToIndex.keys());
    sortedEntriesWithNumberedPriority.sort((entryA, entryB) => {
      if (entryA.alignment === entryB.alignment) {
        const entryAPrimaryPriority = typeof entryA.priority.primary === "number" ? entryA.priority.primary : entryA.priority.primary.location.priority;
        const entryBPrimaryPriority = typeof entryB.priority.primary === "number" ? entryB.priority.primary : entryB.priority.primary.location.priority;
        if (entryAPrimaryPriority !== entryBPrimaryPriority) {
          return entryBPrimaryPriority - entryAPrimaryPriority;
        }
        if (entryA.priority.secondary !== entryB.priority.secondary) {
          return entryB.priority.secondary - entryA.priority.secondary;
        }
        return mapEntryWithNumberedPriorityToIndex.get(entryA) - mapEntryWithNumberedPriorityToIndex.get(entryB);
      }
      if (entryA.alignment === 0 /* LEFT */) {
        return -1;
      }
      if (entryB.alignment === 0 /* LEFT */) {
        return 1;
      }
      return 0;
    });
    let sortedEntries;
    if (mapEntryWithRelativePriority.size > 0) {
      sortedEntries = [];
      for (const entry of sortedEntriesWithNumberedPriority) {
        const relativeEntriesMap = mapEntryWithRelativePriority.get(entry.id);
        const relativeEntries = relativeEntriesMap ? Array.from(relativeEntriesMap.values()) : void 0;
        if (relativeEntries) {
          sortedEntries.push(...relativeEntries.filter((entry2) => isStatusbarEntryLocation(entry2.priority.primary) && entry2.priority.primary.alignment === 0 /* LEFT */).sort((entryA, entryB) => entryB.priority.secondary - entryA.priority.secondary));
        }
        sortedEntries.push(entry);
        if (relativeEntries) {
          sortedEntries.push(...relativeEntries.filter((entry2) => isStatusbarEntryLocation(entry2.priority.primary) && entry2.priority.primary.alignment === 1 /* RIGHT */).sort((entryA, entryB) => entryB.priority.secondary - entryA.priority.secondary));
        }
        mapEntryWithRelativePriority.delete(entry.id);
      }
      for (const [, entries2] of mapEntryWithRelativePriority) {
        sortedEntries.push(...Array.from(entries2.values()).sort((entryA, entryB) => entryB.priority.secondary - entryA.priority.secondary));
      }
    } else {
      sortedEntries = sortedEntriesWithNumberedPriority;
    }
    this._entries = sortedEntries;
  }
  markFirstLastVisibleEntry() {
    this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(0 /* LEFT */));
    this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(1 /* RIGHT */));
  }
  doMarkFirstLastVisibleStatusbarItem(entries2) {
    let firstVisibleItem;
    let lastVisibleItem;
    for (const entry of entries2) {
      entry.container.classList.remove("first-visible-item", "last-visible-item");
      const isVisible = !this.isHidden(entry.id);
      if (isVisible) {
        if (!firstVisibleItem) {
          firstVisibleItem = entry;
        }
        lastVisibleItem = entry;
      }
    }
    firstVisibleItem?.container.classList.add("first-visible-item");
    lastVisibleItem?.container.classList.add("last-visible-item");
  }
};
export { StatusbarViewModel };
