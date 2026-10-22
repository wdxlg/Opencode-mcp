// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatEnabler.ts
import { DisposableStore } from "./module-0012.mjs";
import { TerminalChatContextKeys } from "./module-1154.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatEnabler.ts
var TerminalChatEnabler = class {
  constructor(chatAgentService, contextKeyService) {
    this._store = new DisposableStore();
    this._ctxHasProvider = TerminalChatContextKeys.hasChatAgent.bindTo(contextKeyService);
    this._store.add(Event2.runAndSubscribe(chatAgentService.onDidChangeAgents, () => {
      const hasTerminalAgent = Boolean(chatAgentService.getDefaultAgent("terminal" /* Terminal */));
      this._ctxHasProvider.set(hasTerminalAgent);
    }));
  }
  static {
    this.Id = "terminalChat.enabler";
  }
  dispose() {
    this._ctxHasProvider.reset();
    this._store.dispose();
  }
};

TerminalChatEnabler = __decorateClass([
  __decorateParam(0, IChatAgentService),
  __decorateParam(1, IContextKeyService)
], TerminalChatEnabler);
export { TerminalChatEnabler };
