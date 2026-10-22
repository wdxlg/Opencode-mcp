// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/outline/browser/outlineService.ts
import { LinkedList } from "./module-0013.mjs";
import { Emitter } from "./module-0017.mjs";
import { toDisposable } from "./module-0012.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IOutlineService } from "./module-0972.mjs";


// src/vs/workbench/services/outline/browser/outlineService.ts
var OutlineService = class {
  constructor() {
    this._factories = new LinkedList();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  canCreateOutline(pane) {
    for (const factory of this._factories) {
      if (factory.matches(pane)) {
        return true;
      }
    }
    return false;
  }
  async createOutline(pane, target, token) {
    for (const factory of this._factories) {
      if (factory.matches(pane)) {
        return await factory.createOutline(pane, target, token);
      }
    }
    return void 0;
  }
  registerOutlineCreator(creator) {
    const rm = this._factories.push(creator);
    this._onDidChange.fire();
    return toDisposable(() => {
      rm();
      this._onDidChange.fire();
    });
  }
};

registerSingleton(IOutlineService, OutlineService, 1 /* Delayed */);
export { OutlineService };
