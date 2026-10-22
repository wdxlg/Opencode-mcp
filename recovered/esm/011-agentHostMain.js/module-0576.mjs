// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSubscriptionService.ts
import { ResourceMap } from "./module-0006.mjs";
import { resolveAgentHostSession } from "./module-0480.mjs";


// src/vs/platform/agentHost/node/agentHostSubscriptionService.ts
var AgentHostSubscriptionService = class {
  constructor() {
    this._subscribers = new ResourceMap();
  }
  get subscribedResources() {
    return this._subscribers.keys();
  }
  addSubscriber(resource, clientId) {
    let subscribers = this._subscribers.get(resource);
    const firstForResource = !subscribers || subscribers.size === 0;
    if (!subscribers) {
      subscribers = /* @__PURE__ */ new Set();
      this._subscribers.set(resource, subscribers);
    }
    subscribers.add(clientId);
    return firstForResource;
  }
  removeSubscriber(resource, clientId) {
    const subscribers = this._subscribers.get(resource);
    if (!subscribers) {
      return false;
    }
    subscribers.delete(clientId);
    if (subscribers.size > 0) {
      return false;
    }
    this._subscribers.delete(resource);
    return true;
  }
  hasSubscribers(resource) {
    return this._subscribers.has(resource);
  }
  hasSessionSubscribers(resource) {
    const sessionKey = resolveAgentHostSession(resource).toString();
    for (const subscribedResource of this._subscribers.keys()) {
      if (resolveAgentHostSession(subscribedResource).toString() === sessionKey) {
        return true;
      }
    }
    return false;
  }
};
export { AgentHostSubscriptionService };
