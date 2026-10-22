// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/capabilities/naiveCwdDetectionCapability.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/platform/terminal/common/capabilities/naiveCwdDetectionCapability.ts
var NaiveCwdDetectionCapability = class {
  constructor(_process) {
    this._process = _process;
    this.type = 1 /* NaiveCwdDetection */;
    this._cwd = "";
    this._onDidChangeCwd = new Emitter();
    this.onDidChangeCwd = this._onDidChangeCwd.event;
  }
  async getCwd() {
    if (!this._process) {
      return Promise.resolve("");
    }
    const newCwd = await this._process.getCwd();
    if (newCwd !== this._cwd) {
      this._onDidChangeCwd.fire(newCwd);
    }
    this._cwd = newCwd;
    return this._cwd;
  }
};
export { NaiveCwdDetectionCapability };
