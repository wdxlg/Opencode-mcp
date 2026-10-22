// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatPasteTargetService.ts
import { ResourceMap } from "./module-0008.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatPasteTargetService.ts
var ChatPasteTargetService = class {
  constructor() {
    this._targets = new ResourceMap();
  }
  registerTarget(inputUri, target) {
    this._targets.set(inputUri, target);
    return toDisposable(() => {
      if (this._targets.get(inputUri) === target) {
        this._targets.delete(inputUri);
      }
    });
  }
  getTarget(inputUri) {
    return this._targets.get(inputUri);
  }
};
export { ChatPasteTargetService };
