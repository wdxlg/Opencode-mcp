// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputNoticeHub.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { pickActiveChatInput, trackChatInputRecency } from "./module-1468.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputNoticeHub.ts
var IChatInputNoticeHubService = createDecorator("chatInputNoticeHubService");

var ChatInputNoticeHubService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._hosts = /* @__PURE__ */ new Set();
  }
  registerHost(host, focusRoot) {
    const tracked = { host, focusRoot, lastFocused: 0 };
    this._hosts.add(tracked);
    const store = new DisposableStore();
    store.add(trackChatInputRecency(tracked));
    store.add(toDisposable(() => this._hosts.delete(tracked)));
    return store;
  }
  toggleNoticeFocus() {
    const active = pickActiveChatInput(this._hosts, (tracked) => tracked.host.hasFocusableNotice());
    return active?.host.toggleFocus() ?? false;
  }
};

registerSingleton(IChatInputNoticeHubService, ChatInputNoticeHubService, 1 /* Delayed */);
export { IChatInputNoticeHubService, ChatInputNoticeHubService };
