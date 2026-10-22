// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/common/capabilities/cwdDetectionCapability.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";


// src/vs/platform/terminal/common/capabilities/cwdDetectionCapability.ts
var CwdDetectionCapability = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = 0 /* CwdDetection */;
    this._cwd = "";
    this._isTrusted = true;
    this._cwds = /* @__PURE__ */ new Map();
    this._onDidChangeCwd = this._register(new Emitter());
    this.onDidChangeCwd = this._onDidChangeCwd.event;
  }
  /**
   * Gets the list of cwds seen in this session in order of last accessed.
   */
  get cwds() {
    return Array.from(this._cwds.keys());
  }
  get isTrusted() {
    return this._isTrusted;
  }
  getCwd() {
    return this._cwd;
  }
  updateCwd(cwd3, isTrusted = true) {
    const didChange = this._cwd !== cwd3 || this._isTrusted !== isTrusted;
    this._cwd = cwd3;
    this._isTrusted = isTrusted;
    const count = this._cwds.get(this._cwd) || 0;
    this._cwds.delete(this._cwd);
    this._cwds.set(this._cwd, count + 1);
    if (didChange) {
      this._onDidChangeCwd.fire(cwd3);
    }
  }
};
export { CwdDetectionCapability };
