// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
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
  matchesCurrent(uri5, value2) {
    const history = this._history.get(uri5);
    if (!history) {
      return false;
    }
    return history.current() === value2;
  }
  addToHistory(uri5, value2) {
    const history = this._history.get(uri5);
    if (!history) {
      this._history.set(uri5, new HistoryNavigator2([value2], 50));
      return;
    }
    history.resetCursor();
    history.add(value2);
  }
  getPreviousValue(uri5) {
    const history = this._history.get(uri5);
    return history?.previous() ?? null;
  }
  getNextValue(uri5) {
    const history = this._history.get(uri5);
    return history?.next() ?? null;
  }
  replaceLast(uri5, value2) {
    const history = this._history.get(uri5);
    if (!history) {
      this._history.set(uri5, new HistoryNavigator2([value2], 50));
      return;
    } else {
      history.replaceLast(value2);
      history.resetCursor();
    }
  }
  clearHistory(uri5) {
    this._history.delete(uri5);
  }
  has(uri5) {
    return this._history.has(uri5) ? true : false;
  }
};
export { IInteractiveHistoryService, InteractiveHistoryService };
