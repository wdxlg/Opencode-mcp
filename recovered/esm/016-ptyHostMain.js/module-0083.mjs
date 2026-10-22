// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/common/capabilities/shellEnvDetectionCapability.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";
import { equals } from "./module-0033.mjs";
import { mapsStrictEqualIgnoreOrder } from "./module-0006.mjs";


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
    if (equals(this.env.value, env2)) {
      return;
    }
    this._env.value.clear();
    for (const [key, value] of Object.entries(env2)) {
      if (value !== void 0) {
        this._env.value.set(key, value);
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
  setEnvironmentSingleVar(key, value, isTrusted) {
    if (!this._pendingEnv) {
      return;
    }
    if (key !== void 0 && value !== void 0) {
      this._pendingEnv.value.set(key, value);
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
  deleteEnvironmentSingleVar(key, value, isTrusted) {
    if (!this._pendingEnv) {
      return;
    }
    if (key !== void 0 && value !== void 0) {
      this._pendingEnv.value.delete(key);
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
