// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusItemService.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusItemService.ts
var IChatStatusItemService = createDecorator("chatStatusItemService");

var ChatStatusItemService = class {
  constructor() {
    this._entries = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  setOrUpdateEntry(entry) {
    const isUpdate = this._entries.has(entry.id);
    this._entries.set(entry.id, entry);
    if (isUpdate) {
      this._onDidChange.fire({ entry });
    }
  }
  deleteEntry(id2) {
    this._entries.delete(id2);
  }
  getEntries() {
    return this._entries.values();
  }
};

registerSingleton(IChatStatusItemService, ChatStatusItemService, 1 /* Delayed */);
export { IChatStatusItemService, ChatStatusItemService };
