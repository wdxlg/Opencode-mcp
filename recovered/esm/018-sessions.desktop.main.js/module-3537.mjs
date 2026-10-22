// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/nullInlineChatSessionService.ts
import { Event2 } from "./module-0017.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IInlineChatSessionService } from "./module-1876.mjs";


// src/vs/sessions/contrib/chat/browser/nullInlineChatSessionService.ts
var NullInlineChatSessionService = class {
  constructor() {
    this.onWillStartSession = Event2.None;
    this.onDidChangeSessions = Event2.None;
  }
  dispose() {
  }
  async createSession(_editor, _isNotebook, _token) {
    throw new Error("Inline chat sessions are not supported in the sessions window");
  }
  getSessionByTextModel(_uri) {
    return void 0;
  }
  getSessionBySessionUri(_uri) {
    return void 0;
  }
};

registerSingleton(IInlineChatSessionService, NullInlineChatSessionService, 1 /* Delayed */);
export { NullInlineChatSessionService };
