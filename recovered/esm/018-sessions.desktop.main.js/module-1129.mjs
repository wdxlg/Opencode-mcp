// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/interactive/browser/interactiveHistoryService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { HistoryNavigator2 } from "./module-0599.mjs";


// src/vs/workbench/contrib/interactive/browser/interactiveHistoryService.ts
var IInteractiveHistoryService = createDecorator("IInteractiveHistoryService");

var InteractiveHistoryService = class extends Disposable {
  constructor() {
    super();
    this._history = new ResourceMap();
  }
  matchesCurrent(uri4, value2) {
    const history = this._history.get(uri4);
    if (!history) {
      return false;
    }
    return history.current() === value2;
  }
  addToHistory(uri4, value2) {
    const history = this._history.get(uri4);
    if (!history) {
      this._history.set(uri4, new HistoryNavigator2([value2], 50));
      return;
    }
    history.resetCursor();
    history.add(value2);
  }
  getPreviousValue(uri4) {
    const history = this._history.get(uri4);
    return history?.previous() ?? null;
  }
  getNextValue(uri4) {
    const history = this._history.get(uri4);
    return history?.next() ?? null;
  }
  replaceLast(uri4, value2) {
    const history = this._history.get(uri4);
    if (!history) {
      this._history.set(uri4, new HistoryNavigator2([value2], 50));
      return;
    } else {
      history.replaceLast(value2);
      history.resetCursor();
    }
  }
  clearHistory(uri4) {
    this._history.delete(uri4);
  }
  has(uri4) {
    return this._history.has(uri4) ? true : false;
  }
};
export { IInteractiveHistoryService, InteractiveHistoryService };
