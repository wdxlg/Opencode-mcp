// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/capabilities/shellEnvDetectionCapability.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { mapsStrictEqualIgnoreOrder } from "./module-0008.mjs";


// src/vs/platform/terminal/common/capabilities/shellEnvDetectionCapability.ts
var ShellEnvDetectionCapability = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = 5 /* ShellEnvDetection */;
    this._env = { value: /* @__PURE__ */ new Map(), isTrusted: true };
    this._onDidChangeEnv = this._register(new Emitter());
    this.onDidChangeEnv = this._onDidChangeEnv.event;
  }
  get env() {
    return this._createStateObject();
  }
  setEnvironment(env2, isTrusted) {
    if (equals4(this.env.value, env2)) {
      return;
    }
    this._env.value.clear();
    for (const [key3, value2] of Object.entries(env2)) {
      if (value2 !== void 0) {
        this._env.value.set(key3, value2);
      }
    }
    this._env.isTrusted = isTrusted;
    this._fireEnvChange();
  }
  startEnvironmentSingleVar(clear, isTrusted) {
    if (clear) {
      this._pendingEnv = {
        value: /* @__PURE__ */ new Map(),
        isTrusted
      };
    } else {
      this._pendingEnv = {
        value: new Map(this._env.value),
        isTrusted: this._env.isTrusted && isTrusted
      };
    }
  }
  setEnvironmentSingleVar(key3, value2, isTrusted) {
    if (!this._pendingEnv) {
      return;
    }
    if (key3 !== void 0 && value2 !== void 0) {
      this._pendingEnv.value.set(key3, value2);
      this._pendingEnv.isTrusted &&= isTrusted;
    }
  }
  endEnvironmentSingleVar(isTrusted) {
    if (!this._pendingEnv) {
      return;
    }
    this._pendingEnv.isTrusted &&= isTrusted;
    const envDiffers = !mapsStrictEqualIgnoreOrder(this._env.value, this._pendingEnv.value);
    if (envDiffers) {
      this._env = this._pendingEnv;
      this._fireEnvChange();
    }
    this._pendingEnv = void 0;
  }
  deleteEnvironmentSingleVar(key3, value2, isTrusted) {
    if (!this._pendingEnv) {
      return;
    }
    if (key3 !== void 0 && value2 !== void 0) {
      this._pendingEnv.value.delete(key3);
      this._pendingEnv.isTrusted &&= isTrusted;
    }
  }
  _fireEnvChange() {
    this._onDidChangeEnv.fire(this._createStateObject());
  }
  _createStateObject() {
    return {
      value: Object.fromEntries(this._env.value),
      isTrusted: this._env.isTrusted
    };
  }
};
export { ShellEnvDetectionCapability };
