// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostManagedSettingsService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { equals2 } from "./module-0035.mjs";


// src/vs/platform/agentHost/node/agentHostManagedSettingsService.ts
var IAgentHostManagedSettingsService = createDecorator("agentHostManagedSettingsService");

var AgentHostManagedSettingsService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._permissionsByClient = /* @__PURE__ */ new Map();
    this._permissions = {};
  }
  get permissions() {
    return this._permissions;
  }
  setClientPermissions(clientId, permissions) {
    if (Object.keys(permissions).length === 0) {
      this._permissionsByClient.delete(clientId);
    } else {
      this._permissionsByClient.set(clientId, permissions);
    }
    this._updatePermissions();
  }
  removeClientPermissions(clientId) {
    if (this._permissionsByClient.delete(clientId)) {
      this._updatePermissions();
    }
  }
  _updatePermissions() {
    const permissions = {};
    const deny = /* @__PURE__ */ new Set();
    const ask = /* @__PURE__ */ new Set();
    for (const contribution of this._permissionsByClient.values()) {
      if (contribution.disableBypassPermissionsMode === "disable") {
        permissions.disableBypassPermissionsMode = "disable";
      }
      if (contribution.deny) {
        contribution.deny.forEach((rule) => deny.add(rule));
      }
      if (contribution.ask) {
        contribution.ask.forEach((rule) => ask.add(rule));
      }
    }
    if (deny.size > 0) {
      permissions.deny = [...deny];
    }
    if (ask.size > 0) {
      permissions.ask = [...ask];
    }
    if (!equals2(this._permissions, permissions)) {
      this._permissions = permissions;
      this._onDidChange.fire();
    }
  }
};
export { IAgentHostManagedSettingsService, AgentHostManagedSettingsService };
