// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionWorkingDirectoryResolver.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionWorkingDirectoryResolver.ts
var IAgentHostSessionWorkingDirectoryResolver = createDecorator("agentHostSessionWorkingDirectoryResolver");

var AgentHostSessionWorkingDirectoryResolver = class {
  constructor() {
    this._resolvers = /* @__PURE__ */ new Map();
  }
  registerResolver(sessionType, resolver, isNewSession2) {
    const entry = { resolve: resolver, isNewSession: isNewSession2 };
    this._resolvers.set(sessionType, entry);
    return toDisposable(() => {
      if (this._resolvers.get(sessionType) === entry) {
        this._resolvers.delete(sessionType);
      }
    });
  }
  resolve(sessionResource) {
    return this._resolvers.get(sessionResource.scheme)?.resolve(sessionResource);
  }
  isNewSession(sessionResource) {
    return this._resolvers.get(sessionResource.scheme)?.isNewSession?.(sessionResource) ?? false;
  }
};

registerSingleton(IAgentHostSessionWorkingDirectoryResolver, AgentHostSessionWorkingDirectoryResolver, 1 /* Delayed */);
export { IAgentHostSessionWorkingDirectoryResolver, AgentHostSessionWorkingDirectoryResolver };
