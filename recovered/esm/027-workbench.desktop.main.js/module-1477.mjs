// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostImportConversationStore.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostImportConversationStore.ts
var IAgentHostImportConversationStore = createDecorator("agentHostImportConversationStore");

var AgentHostImportConversationStore = class {
  constructor() {
    this._pending = /* @__PURE__ */ new Map();
  }
  set(resource, conversation) {
    if (conversation.turns.length > 0) {
      this._pending.set(resource.toString(), conversation);
    }
  }
  take(resource) {
    const key3 = resource.toString();
    const conversation = this._pending.get(key3);
    this._pending.delete(key3);
    return conversation;
  }
  rename(oldResource, newResource) {
    const conversation = this.take(oldResource);
    if (conversation) {
      this._pending.set(newResource.toString(), conversation);
    }
  }
};
export { IAgentHostImportConversationStore, AgentHostImportConversationStore };
