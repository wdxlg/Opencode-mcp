// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/chatViewStateService.ts
import { createDecorator } from "./module-0077.mjs";
import { LRUCache } from "./module-0008.mjs";
import { CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT } from "./module-0982.mjs";
import { getComparisonKey } from "./module-0034.mjs";


// src/vs/sessions/contrib/chat/browser/chatViewStateService.ts
var ISessionsChatViewStateService = createDecorator("sessionsChatViewStateService");

var SessionsChatViewStateService = class {
  constructor() {
    this._states = new LRUCache(CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT);
  }
  get(resource) {
    return this._states.get(getComparisonKey(resource));
  }
  set(resource, state) {
    this._states.set(getComparisonKey(resource), state);
  }
};
export { ISessionsChatViewStateService, SessionsChatViewStateService };
