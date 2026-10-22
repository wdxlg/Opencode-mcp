// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/capabilities/terminalCapabilityStore.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/platform/terminal/common/capabilities/terminalCapabilityStore.ts
var TerminalCapabilityStore = class extends Disposable {
  constructor() {
    super(...arguments);
    this._map = /* @__PURE__ */ new Map();
    this._onDidAddCapability = this._register(new Emitter());
    this._onDidRemoveCapability = this._register(new Emitter());
  }
  get onDidAddCapability() {
    return this._onDidAddCapability.event;
  }
  get onDidRemoveCapability() {
    return this._onDidRemoveCapability.event;
  }
  get onDidChangeCapabilities() {
    return Event2.map(Event2.any(
      this._onDidAddCapability.event,
      this._onDidRemoveCapability.event
    ), () => void 0, this._store);
  }
  get onDidAddCommandDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidAddCapability, (e4) => e4.id === 2 /* CommandDetection */, this._store), (e4) => e4.capability, this._store);
  }
  get onDidRemoveCommandDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidRemoveCapability, (e4) => e4.id === 2 /* CommandDetection */, this._store), () => void 0, this._store);
  }
  get onDidAddCwdDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidAddCapability, (e4) => e4.id === 0 /* CwdDetection */, this._store), (e4) => e4.capability, this._store);
  }
  get onDidRemoveCwdDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidRemoveCapability, (e4) => e4.id === 0 /* CwdDetection */, this._store), () => void 0, this._store);
  }
  get items() {
    return this._map.keys();
  }
  createOnDidRemoveCapabilityOfTypeEvent(type) {
    return Event2.map(Event2.filter(this.onDidRemoveCapability, (e4) => e4.id === type), (e4) => e4.capability);
  }
  createOnDidAddCapabilityOfTypeEvent(type) {
    return Event2.map(Event2.filter(this.onDidAddCapability, (e4) => e4.id === type), (e4) => e4.capability);
  }
  add(capability, impl) {
    this._map.set(capability, impl);
    this._onDidAddCapability.fire(createCapabilityEvent(capability, impl));
  }
  get(capability) {
    return this._map.get(capability);
  }
  remove(capability) {
    const impl = this._map.get(capability);
    if (!impl) {
      return;
    }
    this._map.delete(capability);
    this._onDidRemoveCapability.fire(createCapabilityEvent(capability, impl));
  }
  has(capability) {
    return this._map.has(capability);
  }
};

__decorateClass([
  memoize
], TerminalCapabilityStore.prototype, "onDidChangeCapabilities", 1);

__decorateClass([
  memoize
], TerminalCapabilityStore.prototype, "onDidAddCommandDetectionCapability", 1);

__decorateClass([
  memoize
], TerminalCapabilityStore.prototype, "onDidRemoveCommandDetectionCapability", 1);

__decorateClass([
  memoize
], TerminalCapabilityStore.prototype, "onDidAddCwdDetectionCapability", 1);

__decorateClass([
  memoize
], TerminalCapabilityStore.prototype, "onDidRemoveCwdDetectionCapability", 1);

var TerminalCapabilityStoreMultiplexer = class extends Disposable {
  constructor() {
    super(...arguments);
    this._stores = [];
    this._onDidAddCapability = this._register(new Emitter());
    this._onDidRemoveCapability = this._register(new Emitter());
  }
  get onDidAddCapability() {
    return this._onDidAddCapability.event;
  }
  get onDidRemoveCapability() {
    return this._onDidRemoveCapability.event;
  }
  get onDidChangeCapabilities() {
    return Event2.map(Event2.any(
      this._onDidAddCapability.event,
      this._onDidRemoveCapability.event
    ), () => void 0, this._store);
  }
  get onDidAddCommandDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidAddCapability, (e4) => e4.id === 2 /* CommandDetection */, this._store), (e4) => e4.capability, this._store);
  }
  get onDidRemoveCommandDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidRemoveCapability, (e4) => e4.id === 2 /* CommandDetection */, this._store), () => void 0, this._store);
  }
  get onDidAddCwdDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidAddCapability, (e4) => e4.id === 0 /* CwdDetection */, this._store), (e4) => e4.capability, this._store);
  }
  get onDidRemoveCwdDetectionCapability() {
    return Event2.map(Event2.filter(this.onDidRemoveCapability, (e4) => e4.id === 0 /* CwdDetection */, this._store), () => void 0, this._store);
  }
  get items() {
    return this._items();
  }
  createOnDidRemoveCapabilityOfTypeEvent(type) {
    return Event2.map(Event2.filter(this.onDidRemoveCapability, (e4) => e4.id === type), (e4) => e4.capability);
  }
  createOnDidAddCapabilityOfTypeEvent(type) {
    return Event2.map(Event2.filter(this.onDidAddCapability, (e4) => e4.id === type), (e4) => e4.capability);
  }
  *_items() {
    for (const store of this._stores) {
      for (const c of store.items) {
        yield c;
      }
    }
  }
  has(capability) {
    for (const store of this._stores) {
      for (const c of store.items) {
        if (c === capability) {
          return true;
        }
      }
    }
    return false;
  }
  get(capability) {
    for (const store of this._stores) {
      const c = store.get(capability);
      if (c) {
        return c;
      }
    }
    return void 0;
  }
  add(store) {
    this._stores.push(store);
    for (const capability of store.items) {
      this._onDidAddCapability.fire(createCapabilityEvent(capability, store.get(capability)));
    }
    this._register(store.onDidAddCapability((e4) => this._onDidAddCapability.fire(e4)));
    this._register(store.onDidRemoveCapability((e4) => this._onDidRemoveCapability.fire(e4)));
  }
};

__decorateClass([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidChangeCapabilities", 1);

__decorateClass([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidAddCommandDetectionCapability", 1);

__decorateClass([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidRemoveCommandDetectionCapability", 1);

__decorateClass([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidAddCwdDetectionCapability", 1);

__decorateClass([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidRemoveCwdDetectionCapability", 1);

function createCapabilityEvent(capability, impl) {
  return { id: capability, capability: impl };
}
export { createCapabilityEvent, TerminalCapabilityStore, TerminalCapabilityStoreMultiplexer };
