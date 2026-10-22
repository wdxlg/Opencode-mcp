// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/mobileNavigationStack.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/sessions/browser/mobileNavigationStack.ts
var MobileNavigationStack = class extends Disposable {
  constructor() {
    super();
    this._stack = [];
    this._nextId = 0;
    this._onDidPop = this._register(new Emitter());
    this.onDidPop = this._onDidPop.event;
    this._pendingSilentPops = 0;
    this._register(Event2.fromDOMEventEmitter(mainWindow, "popstate")((e4) => {
      this._onPopState(e4);
    }));
  }
  push(layer) {
    const id2 = this._nextId++;
    this._stack.push({ layer, id: id2 });
    mainWindow.history.pushState({ layer, id: id2 }, "");
  }
  pop() {
    const entry = this._stack.pop();
    if (entry) {
      this._onDidPop.fire(entry.layer);
    }
    return entry?.layer;
  }
  peek() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1].layer : void 0;
  }
  has(layer) {
    return this._stack.some((e4) => e4.layer === layer);
  }
  clear() {
    this._stack.length = 0;
  }
  /**
   * Removes the topmost entry matching `layer` from the stack (without
   * firing {@link onDidPop}) and rewinds the browser history by one entry.
   * Use this when a layer is closed by UI interaction (e.g., backdrop click)
   * so the history and stack stay in sync without recursing back into
   * close handlers.
   *
   * Concurrent silent pops are handled via a counter: each call increments
   * {@link _pendingSilentPops} and the matching {@link _onPopState} decrements
   * it, so rapid back-button taps or multiple overlay closes cannot leak
   * suppression state across unrelated pops.
   */
  popSilently(layer) {
    for (let i2 = this._stack.length - 1; i2 >= 0; i2--) {
      if (this._stack[i2].layer === layer) {
        this._stack.splice(i2, 1);
        this._pendingSilentPops++;
        mainWindow.history.back();
        return;
      }
    }
  }
  _onPopState(e4) {
    if (this._pendingSilentPops > 0) {
      this._pendingSilentPops--;
      return;
    }
    if (this._stack.length === 0) {
      return;
    }
    const top2 = this._stack[this._stack.length - 1];
    const state = e4.state;
    if (state && typeof state.id === "number" && state.id >= top2.id) {
      return;
    }
    this.pop();
  }
};
export { MobileNavigationStack };
