// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/policy/common/policy.ts
import { createDecorator2 } from "./module-0048.mjs";
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
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

var IPolicyService = createDecorator2("policy");

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
    for (const name of Object.keys(policyDefinitions)) {
      if (this.policyDefinitions[name] !== policyDefinitions[name]) {
        this.policyDefinitions[name] = policyDefinitions[name];
        changed = true;
      }
    }
    if (changed) {
      await this._updatePolicyDefinitions(this.policyDefinitions);
    }
    return this.getPolicyValues();
  }
  getPolicyValue(name) {
    return this.policies.get(name);
  }
  getPolicyValueSource(name) {
    return this.getStoredPolicyValueSource(name);
  }
  getStoredPolicyValueSource(name) {
    if (!this.policies.has(name)) {
      return void 0;
    }
    return this.policyValueSources.get(name) ?? "device" /* Device */;
  }
  serialize() {
    return Iterable.reduce(Object.entries(this.policyDefinitions), (r2, [name, definition]) => ({ ...r2, [name]: { definition: toSerializablePolicyDefinition(definition), value: this.policies.get(name) } }), {});
  }
  getPolicyValues() {
    return Iterable.reduce(this.policies.entries(), (r2, [name, value]) => ({ ...r2, [name]: value }), {});
  }
  updatePolicyValue(name, value, source = "device" /* Device */) {
    if (value === void 0) {
      const valueDeleted = this.policies.delete(name);
      const sourceDeleted = this.policyValueSources.delete(name);
      return valueDeleted || sourceDeleted;
    }
    const valueChanged = this.policies.get(name) !== value;
    const sourceChanged = this.getStoredPolicyValueSource(name) !== source;
    if (!valueChanged && !sourceChanged) {
      return false;
    }
    this.policies.set(name, value);
    this.policyValueSources.set(name, source);
    return true;
  }
  clearPolicyValues() {
    this.policies.clear();
    this.policyValueSources.clear();
  }
};
export { toSerializablePolicyDefinition, getRestrictedPolicyValue, IPolicyService, AbstractPolicyService };
