// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actions/browser/actionViewItemService.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { toDisposable } from "./module-0012.mjs";
import { MenuId } from "./module-0092.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/actions/browser/actionViewItemService.ts
var IActionViewItemService = createDecorator("IActionViewItemService");

var ActionViewItemService = class {
  constructor() {
    this._providers = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  dispose() {
    this._onDidChange.dispose();
  }
  register(menu, commandOrSubmenuId, provider, event) {
    const id2 = this._makeKey(menu, commandOrSubmenuId);
    if (this._providers.has(id2)) {
      throw new Error(`A provider for the command ${commandOrSubmenuId} and menu ${menu} is already registered.`);
    }
    this._providers.set(id2, provider);
    const listener = event?.(() => {
      this._onDidChange.fire(menu);
    });
    return toDisposable(() => {
      listener?.dispose();
      this._providers.delete(id2);
    });
  }
  lookUp(menu, commandOrMenuId) {
    return this._providers.get(this._makeKey(menu, commandOrMenuId));
  }
  _makeKey(menu, commandOrMenuId) {
    return `${menu.id}/${commandOrMenuId instanceof MenuId ? commandOrMenuId.id : commandOrMenuId}`;
  }
};

registerSingleton(IActionViewItemService, ActionViewItemService, 1 /* Delayed */);
export { IActionViewItemService, ActionViewItemService };
