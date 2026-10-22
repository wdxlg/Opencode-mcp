// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostPromptCache.ts
import { createDecorator } from "./module-0044.mjs";
import { readSessionPromptCacheState, withSessionPromptCacheState } from "./module-0047.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";


// src/vs/platform/agentHost/node/agentHostPromptCache.ts
var IAgentHostPromptCache = createDecorator("agentHostPromptCache");

var AgentHostPromptCache = class {
  constructor(_stateManager) {
    this._stateManager = _stateManager;
  }
  read(session) {
    return readSessionPromptCacheState(this._stateManager.getSessionSummary(session.toString())?._meta);
  }
  write(session, promptCache) {
    const sessionKey = session.toString();
    const currentSummary = this._stateManager.getSessionSummary(sessionKey);
    if (!currentSummary) {
      return promptCache;
    }
    const currentMeta = currentSummary._meta;
    const current = readSessionPromptCacheState(currentMeta);
    if (current?.modelId === promptCache?.modelId && current?.cacheExpiresAt === promptCache?.cacheExpiresAt) {
      return current;
    }
    this._stateManager.setSessionMeta(sessionKey, withSessionPromptCacheState(currentMeta, promptCache));
    return promptCache;
  }
};

AgentHostPromptCache = __decorateClass([
  __decorateParam(0, IAgentHostStateManager)
], AgentHostPromptCache);
export { IAgentHostPromptCache, AgentHostPromptCache };
