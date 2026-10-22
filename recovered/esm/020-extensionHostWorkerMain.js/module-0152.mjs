// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/policy/common/policy.ts
import { createDecorator } from "./module-0038.mjs";
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { Iterable } from "./module-0010.mjs";


// src/vs/platform/policy/common/policy.ts
function toSerializablePolicyDefinition(definition) {
  return { type: definition.type, managedSettings: definition.managedSettings, restrictedValue: definition.restrictedValue };
}

function getRestrictedPolicyValue(definition) {
  if (definition.restrictedValue !== void 0) {
    return definition.restrictedValue;
  }
  switch (definition.type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "string":
      return "";
  }
}

var IPolicyService = createDecorator("policy");

var AbstractPolicyService = class extends Disposable {
  constructor() {
    super(...arguments);
    this.policyDefinitions = {};
    this.policies = /* @__PURE__ */ new Map();
    this.policyValueSources = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
  async updatePolicyDefinitions(policyDefinitions) {
    let changed = false;
    for (const name2 of Object.keys(policyDefinitions)) {
      if (this.policyDefinitions[name2] !== policyDefinitions[name2]) {
        this.policyDefinitions[name2] = policyDefinitions[name2];
        changed = true;
      }
    }
    if (changed) {
      await this._updatePolicyDefinitions(this.policyDefinitions);
    }
    return this.getPolicyValues();
  }
  getPolicyValue(name2) {
    return this.policies.get(name2);
  }
  getPolicyValueSource(name2) {
    return this.getStoredPolicyValueSource(name2);
  }
  getStoredPolicyValueSource(name2) {
    if (!this.policies.has(name2)) {
      return void 0;
    }
    return this.policyValueSources.get(name2) ?? "device" /* Device */;
  }
  serialize() {
    return Iterable.reduce(Object.entries(this.policyDefinitions), (r2, [name2, definition]) => ({ ...r2, [name2]: { definition: toSerializablePolicyDefinition(definition), value: this.policies.get(name2) } }), {});
  }
  getPolicyValues() {
    return Iterable.reduce(this.policies.entries(), (r2, [name2, value]) => ({ ...r2, [name2]: value }), {});
  }
  updatePolicyValue(name2, value, source = "device" /* Device */) {
    if (value === void 0) {
      const valueDeleted = this.policies.delete(name2);
      const sourceDeleted = this.policyValueSources.delete(name2);
      return valueDeleted || sourceDeleted;
    }
    const valueChanged = this.policies.get(name2) !== value;
    const sourceChanged = this.getStoredPolicyValueSource(name2) !== source;
    if (!valueChanged && !sourceChanged) {
      return false;
    }
    this.policies.set(name2, value);
    this.policyValueSources.set(name2, source);
    return true;
  }
  clearPolicyValues() {
    this.policies.clear();
    this.policyValueSources.clear();
  }
};
export { toSerializablePolicyDefinition, getRestrictedPolicyValue, IPolicyService, AbstractPolicyService };
