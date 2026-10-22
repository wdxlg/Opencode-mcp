// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionSectionOrderService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionSectionOrderService.ts
var ISessionSectionOrderService = createDecorator("sessionSectionOrderService");

var SessionSectionOrderService = class extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._order = [];
    this._promoted = /* @__PURE__ */ new Set();
    this.load();
  }
  static {
    this.STORAGE_KEY = "sessionsListControl.sectionOrder";
  }
  resolveOrder(defaultOrderedIds) {
    return resolveSectionOrder(this._order, defaultOrderedIds);
  }
  reorder(visibleOrder, draggedId, targetId, position2, promoteId) {
    const visibleAfter = spliceSectionOrder(visibleOrder, draggedId, targetId, position2);
    if (!visibleAfter) {
      return;
    }
    const next = mergeSectionOrder(this._order, visibleAfter);
    const orderChanged = !arraysEqual(next, this._order);
    const promoteChanged = promoteId !== void 0 && !this._promoted.has(promoteId);
    if (!orderChanged && !promoteChanged) {
      return;
    }
    this._order = next;
    if (promoteId !== void 0) {
      this._promoted.add(promoteId);
    }
    this.save();
    this._onDidChange.fire();
  }
  isPromoted(id2) {
    return this._promoted.has(id2);
  }
  retain(liveIds) {
    const live = liveIds instanceof Set ? liveIds : new Set(liveIds);
    const order = this._order.filter((id2) => live.has(id2));
    const promoted = [...this._promoted].filter((id2) => live.has(id2));
    if (order.length === this._order.length && promoted.length === this._promoted.size) {
      return;
    }
    this._order = order;
    this._promoted = new Set(promoted);
    this.save();
  }
  // -- Storage --
  load() {
    const raw = this.storageService.get(SessionSectionOrderService.STORAGE_KEY, 0 /* PROFILE */);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.order)) {
        this._order = parsed.order.filter((id2) => typeof id2 === "string");
      }
      if (Array.isArray(parsed.promoted)) {
        this._promoted = new Set(parsed.promoted.filter((id2) => typeof id2 === "string"));
      }
    } catch {
    }
  }
  save() {
    if (this._order.length === 0 && this._promoted.size === 0) {
      this.storageService.remove(SessionSectionOrderService.STORAGE_KEY, 0 /* PROFILE */);
      return;
    }
    const state = { order: this._order, promoted: [...this._promoted] };
    this.storageService.store(SessionSectionOrderService.STORAGE_KEY, JSON.stringify(state), 0 /* PROFILE */, 0 /* USER */);
  }
};

SessionSectionOrderService = __decorateClass([
  __decorateParam(0, IStorageService)
], SessionSectionOrderService);

function resolveSectionOrder(persisted, defaultOrderedIds) {
  const live = new Set(defaultOrderedIds);
  const result = persisted.filter((id2) => live.has(id2));
  const placed = new Set(result);
  for (let i2 = 0; i2 < defaultOrderedIds.length; i2++) {
    const id2 = defaultOrderedIds[i2];
    if (placed.has(id2)) {
      continue;
    }
    let insertAt = 0;
    for (let j = i2 - 1; j >= 0; j--) {
      const idx = result.indexOf(defaultOrderedIds[j]);
      if (idx !== -1) {
        insertAt = idx + 1;
        break;
      }
    }
    result.splice(insertAt, 0, id2);
    placed.add(id2);
  }
  return result;
}

function spliceSectionOrder(order, draggedId, targetId, position2) {
  const without = order.filter((id2) => id2 !== draggedId);
  const targetIndex = without.indexOf(targetId);
  if (targetIndex === -1) {
    return void 0;
  }
  const insertIndex = position2 === "before" ? targetIndex : targetIndex + 1;
  without.splice(insertIndex, 0, draggedId);
  return without;
}

function mergeSectionOrder(persisted, visibleAfter) {
  const scope = new Set(visibleAfter);
  const head = [];
  const trailing = /* @__PURE__ */ new Map();
  let lastInScope;
  for (const id2 of persisted) {
    if (scope.has(id2)) {
      lastInScope = id2;
      continue;
    }
    if (lastInScope === void 0) {
      head.push(id2);
    } else {
      let arr = trailing.get(lastInScope);
      if (!arr) {
        arr = [];
        trailing.set(lastInScope, arr);
      }
      arr.push(id2);
    }
  }
  const result = [...head];
  for (const id2 of visibleAfter) {
    result.push(id2);
    const t2 = trailing.get(id2);
    if (t2) {
      result.push(...t2);
    }
  }
  return result;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i2 = 0; i2 < a.length; i2++) {
    if (a[i2] !== b[i2]) {
      return false;
    }
  }
  return true;
}

registerSingleton(ISessionSectionOrderService, SessionSectionOrderService, 1 /* Delayed */);
export { resolveSectionOrder, spliceSectionOrder, mergeSectionOrder, arraysEqual, ISessionSectionOrderService, SessionSectionOrderService };
