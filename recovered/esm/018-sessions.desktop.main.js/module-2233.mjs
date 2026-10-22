// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatResponseFileChangesService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { getChatSessionType } from "./module-0962.mjs";


// src/vs/workbench/contrib/chat/browser/chatResponseFileChangesService.ts
var IChatResponseFileChangesService = createDecorator("chatResponseFileChangesService");

var AbstractChatResponseFileChangesService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._providers = /* @__PURE__ */ new Map();
  }
  registerProvider(chatSessionType, provider) {
    if (this._providers.has(chatSessionType)) {
      throw new Error(`A chat response file changes provider is already registered for session type '${chatSessionType}'`);
    }
    this._providers.set(chatSessionType, provider);
    return toDisposable(() => {
      if (this._providers.get(chatSessionType) === provider) {
        this._providers.delete(chatSessionType);
      }
    });
  }
  getChangesForRequest(sessionResource, requestId) {
    const provider = this._providers.get(getChatSessionType(sessionResource));
    return provider?.getChangesForRequest(sessionResource, requestId);
  }
  getFileEditsForRequest(sessionResource, requestId) {
    const provider = this._providers.get(getChatSessionType(sessionResource));
    return provider?.getFileEditsForRequest?.(sessionResource, requestId);
  }
  getChangeStatsForRequest(_sessionResource, _requestId, _context) {
    return void 0;
  }
};
export { IChatResponseFileChangesService, AbstractChatResponseFileChangesService };
