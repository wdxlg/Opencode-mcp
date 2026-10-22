// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostRootConfigForwarder.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { ROOT_STATE_URI } from "./module-1008.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostRootConfigForwarder.ts
var AgentHostRootConfigForwarder = class extends Disposable {
  constructor(_keys, _agentHostService) {
    super();
    this._keys = _keys;
    this._agentHostService = _agentHostService;
    this._listeners = this._register(new MutableDisposable());
    /**
     * Managed keys whose schema the host has already advertised, so a key is
     * re-pushed only when its schema *first* appears (see {@link _onRootStateChanged}).
     */
    this._schemaSeen = /* @__PURE__ */ new Set();
  }
  /**
   * Begin listening for triggers / agent-host (re)starts / schema hydration and
   * do the initial push. Idempotent.
   */
  start() {
    if (this._listeners.value) {
      return;
    }
    const store = new DisposableStore();
    store.add(this._agentHostService.onAgentHostStart(() => this.reconcile()));
    for (const entry of this._keys) {
      entry.registerTriggers(store, () => this._push(entry));
    }
    store.add(this._agentHostService.rootState.onDidChange(() => this._onRootStateChanged()));
    this._schemaSeen.clear();
    for (const entry of this._keys) {
      if (this._schemaHasKey(entry.key)) {
        this._schemaSeen.add(entry.key);
      }
    }
    this._listeners.value = store;
    this.reconcile();
  }
  /** Stop listening and forget advertised-schema state. Idempotent. */
  stop() {
    this._schemaSeen.clear();
    this._listeners.value = void 0;
  }
  /** Push every managed key (e.g. on start and after an agent-host restart). */
  reconcile() {
    for (const entry of this._keys) {
      this._push(entry);
    }
  }
  /**
   * Push managed values only for keys whose schema has just transitioned from
   * absent to present (host root-config hydration). Value-only changes — e.g.
   * another window writing a different value — are ignored so windows don't
   * fight in an infinite loop.
   */
  _onRootStateChanged() {
    for (const entry of this._keys) {
      if (this._schemaHasKey(entry.key)) {
        if (!this._schemaSeen.has(entry.key)) {
          this._schemaSeen.add(entry.key);
          this._push(entry);
        }
      } else {
        this._schemaSeen.delete(entry.key);
      }
    }
  }
  _schemaHasKey(key3) {
    const rootState = this._agentHostService.rootState.value;
    if (!rootState || rootState instanceof Error) {
      return false;
    }
    return !!rootState.config?.schema.properties[key3];
  }
  /**
   * Push pipeline for a managed key: no-op if the schema doesn't advertise it
   * (retried on hydration); compute the value (`undefined` skips); dispatch only
   * if the host doesn't already hold a structurally-equal value — which breaks
   * cross-window loops (#314385) and, being structural not `===`, never
   * re-dispatches an unchanged object value.
   */
  async _push(entry) {
    if (!this._schemaHasKey(entry.key)) {
      return;
    }
    let value2;
    try {
      value2 = await entry.computeValue();
    } catch {
      return;
    }
    if (value2 === void 0) {
      return;
    }
    if (!this._schemaHasKey(entry.key)) {
      return;
    }
    const rootState = this._agentHostService.rootState.value;
    if (!rootState || rootState instanceof Error || !rootState.config) {
      return;
    }
    if (structuralEquals(rootState.config.values[entry.key], value2)) {
      return;
    }
    this._agentHostService.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { [entry.key]: value2 }
    });
  }
};
export { AgentHostRootConfigForwarder };
