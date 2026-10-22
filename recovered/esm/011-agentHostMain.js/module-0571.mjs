// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChangesetSubscriptionService.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";


// src/vs/platform/agentHost/node/agentHostChangesetSubscriptionService.ts
var EMPTY_SUBSCRIPTIONS = /* @__PURE__ */ new Set();

var AgentHostChangesetSubscriptionService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._subscriptions = /* @__PURE__ */ new Map();
    this._onDidChangeSessionSubscriptions = this._register(new Emitter());
    this.onDidChangeSessionSubscriptions = this._onDidChangeSessionSubscriptions.event;
  }
  getSessionSubscriptions(session) {
    return this._subscriptions.get(session) ?? EMPTY_SUBSCRIPTIONS;
  }
  addSubscription(session, changeset) {
    let subscriptions = this._subscriptions.get(session);
    if (!subscriptions) {
      subscriptions = /* @__PURE__ */ new Set();
      this._subscriptions.set(session, subscriptions);
    }
    subscriptions.add(changeset);
    if (subscriptions.size === 1) {
      this._onDidChangeSessionSubscriptions.fire(session);
    }
  }
  removeSubscription(session, changeset) {
    const subscriptions = this._subscriptions.get(session);
    if (!subscriptions) {
      return;
    }
    subscriptions.delete(changeset);
    if (subscriptions.size === 0) {
      this._subscriptions.delete(session);
      this._onDidChangeSessionSubscriptions.fire(session);
    }
  }
  clearSessionSubscriptions(session) {
    if (this._subscriptions.delete(session)) {
      this._onDidChangeSessionSubscriptions.fire(session);
    }
  }
};
export { EMPTY_SUBSCRIPTIONS, AgentHostChangesetSubscriptionService };
