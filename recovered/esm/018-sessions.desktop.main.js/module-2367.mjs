// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSubmitRequestHandlerService.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/chatSubmitRequestHandlerService.ts
var IChatSubmitRequestHandlerService = createDecorator("chatSubmitRequestHandlerService");

var ChatSubmitRequestHandlerService = class {
  constructor() {
    this._handlers = [];
  }
  register(handler) {
    this._handlers.push(handler);
    return toDisposable(() => {
      const index2 = this._handlers.indexOf(handler);
      if (index2 >= 0) {
        this._handlers.splice(index2, 1);
      }
    });
  }
  async tryHandle(request2) {
    for (const handler of this._handlers) {
      if (await handler.tryHandle(request2)) {
        return true;
      }
    }
    return false;
  }
};
export { IChatSubmitRequestHandlerService, ChatSubmitRequestHandlerService };
